/**
 * Dossier v3 database contracts, on the disposable database the integration runner provides:
 *
 *  - `entity_corrections` is append-only (fixture: an identity repair recorded before the rows it
 *    repairs are touched, then refused any update or delete);
 *  - `reviewed_claims` refuses a biomarker stored as strong human evidence, and freezes a reviewed
 *    row's content;
 *  - `page_trial_roles` refuses a "supports tested claim" flag on anything but the tested
 *    intervention role;
 *  - `dossier_field_states` refuses a verified state without a claim.
 *
 * Fixture rows only. Every row is removed at the end and none is medical content.
 */
import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '@/db'
import {
  corpusPages,
  dossierFieldStates,
  entityCorrections,
  pageTrialRoles,
  reviewedClaims,
  users,
} from '@/db/schema'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

const hex = (seed: string): string => seed.padEnd(64, '0').slice(0, 64)

/** Drizzle wraps the PostgreSQL error; the trigger's words live on the cause. */
async function rejectsWith(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
  try {
    await promise
  } catch (error) {
    const cause = (error as { cause?: { message?: string } }).cause
    const text = `${(error as Error).message} ${cause?.message ?? ''}`
    expect(text).toMatch(pattern)
    return
  }
  throw new Error(`expected a database error matching ${pattern}`)
}

describe.skipIf(!runsInDisposableDatabase)('dossier v3 database contracts', () => {
  it('keeps corrections immutable, caps claim strength and freezes reviewed claims', async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 10)
    const key = `K1:TEST${suffix.toUpperCase()}`
    const slug = `v3-fixture-${suffix}`
    const authorId = `usr_v3a_${suffix}`
    const reviewerId = `usr_v3r_${suffix}`
    const correctionId = hex(`c${suffix}`)
    const claimId = hex(`a${suffix}`)

    try {
      await db.insert(users).values([
        {
          id: authorId,
          email: `author-${suffix}@example.invalid`,
          passwordHash: 'x',
          name: 'Fixture author',
          handle: `v3author${suffix}`,
        },
        {
          id: reviewerId,
          email: `reviewer-${suffix}@example.invalid`,
          passwordHash: 'x',
          name: 'Fixture reviewer',
          handle: `v3reviewer${suffix}`,
        },
      ])
      await db.insert(corpusPages).values({
        key,
        slug,
        displayName: `Fixture substance ${suffix}`,
        model: 'LONGEVITY',
        tier: 1,
        pageType: 'longevity',
        identityRank: 'K1',
        identityRule: 'FIXTURE',
        corpusDigest: 'f'.repeat(64),
      })

      /* ---- append-only ledger */
      await db.insert(entityCorrections).values({
        id: correctionId,
        subjectKind: 'synonym',
        subjectKey: key,
        subjectRef: 'Not a name of this substance',
        action: 'remove_synonym',
        before: { name: 'Not a name of this substance', kind: 'common' },
        after: { removed: true },
        reason: 'Fixture: a synonym that a name lookup attached to the wrong record.',
        evidence: [{ source: 'fixture' }],
        operator: 'operator:test',
      })
      await rejectsWith(
        db
          .update(entityCorrections)
          .set({ reason: 'edited' })
          .where(eq(entityCorrections.id, correctionId)),
        /append-only/,
      )
      await rejectsWith(
        db.delete(entityCorrections).where(eq(entityCorrections.id, correctionId)),
        /append-only/,
      )

      /* ---- claim strength cap: a biomarker can never be strong human evidence */
      const baseClaim = {
        id: claimId,
        subjectKey: key,
        kind: 'effect' as const,
        predicate: 'lowers',
        objectText: 'a laboratory value',
        plainLanguageVersion: 'A laboratory value fell in adults in one trial.',
        technicalVersion: 'Mean difference versus placebo at week 26.',
        evidenceClass: 'randomized_trial' as const,
        outcomeClass: 'biomarker_surrogate' as const,
        applicablePopulation: 'adults with the condition',
        indicationOrGoal: 'glucose_metabolic',
        direction: 'decrease' as const,
        causality: 'causal_randomized' as const,
        uncertainty: 'moderate' as const,
        uncertaintyReasons: ['one trial'],
        sourceSnapshotIds: [hex(`s${suffix}`)],
        authoredByUserId: authorId,
      }
      await rejectsWith(
        db
          .insert(reviewedClaims)
          .values({ ...baseClaim, claimStrength: 'strong_human_specific_use' }),
        /reviewed_claims_strength_cap/,
      )
      await db.insert(reviewedClaims).values({ ...baseClaim, claimStrength: 'biomarker_only' })

      /* ---- a reviewed claim is frozen; a draft is not */
      await db
        .update(reviewedClaims)
        .set({ plainLanguageVersion: 'A laboratory value fell in adults in one 26-week trial.' })
        .where(eq(reviewedClaims.id, claimId))
      await db
        .update(reviewedClaims)
        .set({ reviewerState: 'reviewed', reviewedByUserId: reviewerId, reviewedAt: new Date() })
        .where(eq(reviewedClaims.id, claimId))
      await rejectsWith(
        db
          .update(reviewedClaims)
          .set({ plainLanguageVersion: 'A laboratory value fell a lot.' })
          .where(eq(reviewedClaims.id, claimId)),
        /frozen/,
      )
      await rejectsWith(
        db
          .update(reviewedClaims)
          .set({ reviewerState: 'draft' })
          .where(eq(reviewedClaims.id, claimId)),
        /superseded or retracted/,
      )
      await rejectsWith(
        db.delete(reviewedClaims).where(eq(reviewedClaims.id, claimId)),
        /never deleted/,
      )
      await db
        .update(reviewedClaims)
        .set({ reviewerState: 'retracted', validTo: new Date() })
        .where(eq(reviewedClaims.id, claimId))

      /* ---- trial roles: only the tested intervention may support a tested claim */
      await rejectsWith(
        db.insert(pageTrialRoles).values({
          key,
          nct: 'NCT00000001',
          role: 'observational_exposure',
          basis: 'fixture',
          administered: false,
          supportsTestedClaim: true,
          classifierVersion: 'trial-role-classifier/v1',
          snapshotDate: '2026-09-01',
        }),
        /page_trial_roles_tested_only_experimental/,
      )

      /* ---- field states: verified needs a claim */
      await rejectsWith(
        db.insert(dossierFieldStates).values({
          key,
          field: 'best_supported_result',
          state: 'verified_evidence_present',
          basis: 'fixture',
          resolverVersion: 'fixture/v1',
        }),
        /dossier_field_states_verified_has_claim/,
      )
      await db.insert(dossierFieldStates).values({
        key,
        field: 'best_supported_result',
        state: 'awaiting_human_review',
        basis: 'Fixture: no reviewer has signed a claim.',
        resolverVersion: 'fixture/v1',
      })
      const states = await db
        .select()
        .from(dossierFieldStates)
        .where(eq(dossierFieldStates.key, key))
      expect(states).toHaveLength(1)
    } finally {
      // The ledger row cannot be deleted by design, so the page row that it references stays with it;
      // both are fixture rows in a disposable database that the runner drops.
      await db.delete(dossierFieldStates).where(eq(dossierFieldStates.key, key))
      await db.delete(pageTrialRoles).where(eq(pageTrialRoles.key, key))
    }
  })
})
