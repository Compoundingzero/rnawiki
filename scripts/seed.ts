import 'dotenv/config'
import { and, eq, inArray, notInArray } from 'drizzle-orm'
import { db } from '@/db'
import {
  entities,
  regulatoryStatuses,
  claims,
  mechanismSteps,
  evidenceSources,
  claimEvidence,
  claimEvents,
  comprehensionQuestions,
  users,
} from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import type { SeedFile } from '@/lib/seed-types'

import bpc157 from './seed-data/bpc-157'
import casgevy from './seed-data/casgevy'
import rapamycin from './seed-data/rapamycin-longevity'

const SEED_FILES: SeedFile[] = [bpc157, casgevy, rapamycin]

async function ensureAdminUser(): Promise<number> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!email || !password) {
    throw new Error(
      'ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD must be set (see .env.example) to seed the first administrator account.'
    )
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  if (existing) {
    console.log(`[seed] admin user already exists: ${existing.email} (id ${existing.id})`)
    return existing.id
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name: 'Felix',
      passwordHash: await hashPassword(password),
      role: 'administrator',
    })
    .returning({ id: users.id })

  if (!created) throw new Error('Failed to create bootstrap admin user')
  console.log(`[seed] created admin user: ${email} (id ${created.id})`)
  return created.id
}

/** Delete-and-reinsert by slug so this script is safe to re-run while iterating on seed content. */
async function clearExisting(slugs: string[]) {
  await db.delete(entities).where(inArray(entities.slug, slugs))
  // evidenceSources are not entity-scoped by FK, so a cascaded entity delete can orphan them —
  // sweep anything no longer referenced by any claim so re-running this script doesn't
  // accumulate duplicate sources across runs.
  //
  // claim_events.evidence_source_id is ON DELETE RESTRICT, not CASCADE, so this sweep would throw
  // rather than silently strip an event of its source. The entity delete above cascades claims,
  // which cascades their claim_events, so by the time this runs the referencing rows are already
  // gone for the entities being reseeded. The second condition covers events belonging to entities
  // that were NOT reseeded in this run: without it, a partial reseed could hit that RESTRICT.
  await db.delete(evidenceSources).where(
    and(
      notInArray(
        evidenceSources.id,
        db.selectDistinct({ id: claimEvidence.evidenceSourceId }).from(claimEvidence)
      ),
      notInArray(
        evidenceSources.id,
        db.selectDistinct({ id: claimEvents.evidenceSourceId }).from(claimEvents)
      )
    )
  )
}

async function seedEntity(file: SeedFile, adminUserId: number) {
  const { entity, evidenceSources: sources } = file

  // Parsed as UTC midnight, matching how `regulatoryStatuses.checkedDate` is parsed below and how
  // lib/evidence-view.ts renders every date on the site. A bare `new Date('2026-08-18')` is already
  // UTC for a date-only string; the explicit suffix says so to the next reader.
  const researchCheckedAt = new Date(`${file.researchDate}T00:00:00Z`)
  if (Number.isNaN(researchCheckedAt.getTime())) {
    throw new Error(`Seed file for ${entity.slug} has an unparseable researchDate: "${file.researchDate}"`)
  }

  const [entityRow] = await db
    .insert(entities)
    .values({
      canonicalName: entity.canonicalName,
      slug: entity.slug,
      aliases: entity.aliases,
      entityType: entity.entityType,
      shortDescription: entity.shortDescription,
      bottomLine: entity.bottomLine,
      regulatoryCategory: entity.regulatoryCategory,
      accessRealityNote: entity.accessRealityNote ?? null,
      // Editorially complete, real, verified content — published so the site is genuinely
      // demonstrable end to end. This does NOT create a `reviews` row, so
      // components/ProofCard.tsx's reviewStatusCopy() correctly keeps showing "Independent
      // scientific review pending" until a real qualified reviewer actually signs off — no
      // review is fabricated by seeding.
      publicationStatus: 'published',
    })
    .returning({ id: entities.id })

  if (!entityRow) throw new Error(`Failed to insert entity ${entity.slug}`)
  const entityId = entityRow.id

  for (const rs of entity.regulatoryStatuses) {
    await db.insert(regulatoryStatuses).values({
      entityId,
      jurisdiction: rs.jurisdiction,
      legalCategory: rs.legalCategory,
      approvedIndications: rs.approvedIndications ?? null,
      statusStatement: rs.statusStatement,
      source: rs.source,
      checkedDate: new Date(rs.checkedDate),
      editorId: adminUserId,
      reviewStatus: 'published',
    })
  }

  // Insert every evidence source this entity's claims reference, keyed by the seed file's local
  // `key` so claimEvidence rows below can look up the real DB id.
  const sourceIdByKey = new Map<string, number>()
  for (const s of sources) {
    const [row] = await db
      .insert(evidenceSources)
      .values({
        title: s.title,
        authors: s.authors ?? null,
        publicationYear: s.publicationYear ?? null,
        journalOrIssuer: s.journalOrIssuer ?? null,
        doi: s.doi ?? null,
        pmid: s.pmid ?? null,
        clinicalTrialId: s.clinicalTrialId ?? null,
        regulatoryUrl: s.regulatoryUrl ?? null,
        sourceType: s.sourceType,
        studyDesign: s.studyDesign ?? null,
        experimentalModel: s.experimentalModel ?? null,
        species: s.species ?? null,
        sampleSize: s.sampleSize ?? null,
        endpoint: s.endpoint ?? null,
        retractionStatus: s.retractionStatus ?? null,
      })
      .returning({ id: evidenceSources.id })
    if (!row) throw new Error(`Failed to insert evidence source "${s.key}" for ${entity.slug}`)
    sourceIdByKey.set(s.key, row.id)
  }

  let claimCount = 0
  let mechanismStepCount = 0
  let evidenceLinkCount = 0
  let claimEventCount = 0
  let questionCount = 0

  for (const c of entity.claims) {
    const [claimRow] = await db
      .insert(claims)
      .values({
        entityId,
        slug: c.slug,
        claimType: c.claimType,
        consumerQuestion: c.consumerQuestion,
        directAnswer: c.directAnswer,
        measuredFinding: c.measuredFinding,
        inference: c.inference,
        proofBoundaryStage: c.proofBoundaryStage,
        proofBoundaryExplanation: c.proofBoundaryExplanation,
        remainingUnknown: c.remainingUnknown,
        evidenceNeededNext: c.evidenceNeededNext,
        mechanismSummary: c.mechanismSummary ?? null,
        outcomeSummary: c.outcomeSummary ?? null,
        publicationStatus: 'published',
        displayPriority: c.displayPriority ?? 0,
        // The EDITORIAL check date, from the seed file's own research date — never `new Date()`.
        // Re-running this script must not advance what the record claims was checked, and
        // `claims.updatedAt` (a write timestamp) must never be what "This answer last checked"
        // prints. See db/schema.ts `claims.checkedAt` and lib/seed-types.ts `SeedFile.researchDate`.
        checkedAt: researchCheckedAt,
      })
      .returning({ id: claims.id })
    if (!claimRow) throw new Error(`Failed to insert claim "${c.slug}" for ${entity.slug}`)
    claimCount++

    for (const step of c.mechanismSteps ?? []) {
      await db.insert(mechanismSteps).values({
        claimId: claimRow.id,
        displayOrder: step.displayOrder,
        technicalLabel: step.technicalLabel,
        plainLanguageExplanation: step.plainLanguageExplanation,
        evidenceContext: step.evidenceContext,
        status: step.status,
        sourceLinks: step.sourceLinks ?? [],
      })
      mechanismStepCount++
    }

    for (const ev of c.evidence) {
      const evidenceSourceId = sourceIdByKey.get(ev.sourceKey)
      if (!evidenceSourceId) {
        throw new Error(`Claim "${c.slug}" references unknown evidence source key "${ev.sourceKey}" in ${entity.slug}`)
      }
      await db.insert(claimEvidence).values({
        claimId: claimRow.id,
        evidenceSourceId,
        relationship: ev.relationship,
        claimPartAddressed: ev.claimPartAddressed,
        directlyMeasuredResult: ev.directlyMeasuredResult,
        independentGroupStatus: ev.independentGroupStatus ?? false,
      })
      evidenceLinkCount++
    }

    // Claim events. Most claims have none, and that is the correct outcome — an entity with an
    // empty "what did not work" section is honest, an invented programme discontinuation is not.
    // Each seeded event is written from the recorded result of a source already cited above, so
    // publishing it does not assert anything the source does not.
    for (const ce of c.claimEvents ?? []) {
      const evidenceSourceId = sourceIdByKey.get(ce.sourceKey)
      if (!evidenceSourceId) {
        throw new Error(
          `Claim event on "${c.slug}" references unknown evidence source key "${ce.sourceKey}" in ${entity.slug}`
        )
      }
      await db.insert(claimEvents).values({
        claimId: claimRow.id,
        evidenceSourceId,
        eventType: ce.eventType,
        developmentGate: ce.developmentGate,
        plainSummary: ce.plainSummary,
        whatItSuggests: ce.whatItSuggests,
        whatItDoesNotEstablish: ce.whatItDoesNotEstablish,
        eventDate: ce.eventDate ? new Date(ce.eventDate) : null,
        displayPriority: ce.displayPriority ?? 0,
        // Same rule as the entity and claim rows above: 'published' is editorial workflow only. It
        // creates no `reviews` row and asserts no scientific sign-off.
        publicationStatus: 'published',
      })
      claimEventCount++
    }

    // displayOrder is written, never left to the column default. The default is 0 for every row,
    // so omitting it put both of BPC-157's questions at 0 and made "the central Proof Boundary
    // question" — the single question the public clarity percentage is computed from — a tie
    // broken by heap order. `index` is the file's own ordering, which is what the editorial
    // convention in CLAUDE.md already means by "the first question".
    for (const [index, q] of (c.comprehensionQuestions ?? []).entries()) {
      await db.insert(comprehensionQuestions).values({
        claimId: claimRow.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        displayOrder: q.displayOrder ?? index,
      })
      questionCount++
    }
  }

  console.log(
    `[seed] ${entity.slug}: 1 entity, ${entity.regulatoryStatuses.length} regulatory statuses, ` +
      `${sources.length} evidence sources, ${claimCount} claims, ${mechanismStepCount} mechanism steps, ` +
      `${evidenceLinkCount} evidence links, ${claimEventCount} claim events, ${questionCount} comprehension questions.`
  )
}

async function main() {
  const adminUserId = await ensureAdminUser()

  await clearExisting(SEED_FILES.map((f) => f.entity.slug))

  for (const file of SEED_FILES) {
    await seedEntity(file, adminUserId)
  }

  console.log(`[seed] done: ${SEED_FILES.length} entities seeded.`)
  console.log('[seed] next: npx tsx scripts/seed-legacy-redirects.ts')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err)
    process.exit(1)
  })
