import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'

import { db } from '../../../db'
import {
  corpusPages,
  entityCorrections,
  pageFields,
  pageRegistration,
  pageRegistryRoleAggregates,
  pageSynonyms,
} from '../../../db/schema'

export interface DossierV3Fixture {
  key: string
  slug: string
  name: string
}

/**
 * The smallest corpus record that exercises the dossier v3 journey: a page with one register
 * line, one boxed-warning field, one salt synonym, a role-aware registry aggregate and one
 * correction in the ledger. No sentence in it is about a real medicine; the name says so.
 */
export async function installDossierV3Fixture(): Promise<DossierV3Fixture> {
  const suffix = randomUUID().replaceAll('-', '').slice(0, 10)
  const key = `K1:E2EV3${suffix.toUpperCase()}`
  const slug = `e2e-v3-${suffix}`
  const name = `Fixture substance ${suffix}`
  await db.insert(corpusPages).values({
    key,
    slug,
    displayName: name,
    model: 'LONGEVITY',
    tier: 1,
    pageType: 'longevity',
    identityRank: 'K1',
    identityRule: 'FIXTURE',
    corpusDigest: 'f'.repeat(64),
    indexable: false,
    humanData: true,
  })
  await db.insert(pageSynonyms).values({
    id: `${suffix}`.padEnd(64, 'a').slice(0, 64),
    key,
    name: `${name} sodium`,
    kind: 'salt',
    source: 'fixture',
  })
  await db.insert(pageRegistration).values({
    id: `${suffix}`.padEnd(64, 'b').slice(0, 64),
    key,
    jurisdiction: 'US',
    label: 'United States',
    status: 'Approved',
    ordinal: 0,
    line: 'Approved · 1 application: prescription · checked 2026-08-28',
    disclosed: false,
    dateChecked: '2026-08-28',
  })
  await db.insert(pageFields).values({
    key,
    field: 'boxedWarning',
    ordinal: 0,
    state: 'present',
    value: {
      statements: [
        {
          statement:
            'WARNING: FIXTURE WARNING • This is a fixture sentence standing in for a boxed warning.',
          provenance: { source: 'fixture-label', source_url: 'https://example.invalid/label' },
        },
      ],
    },
    sourceKind: 'fixture-label',
    sourceDate: '2026-08-28',
    verbatim: true,
  })
  await db.insert(pageRegistryRoleAggregates).values({
    key,
    classifierVersion: 'trial-role-classifier/v1',
    snapshotDate: '2026-09-01',
    aggregate: {
      classifierVersion: 'trial-role-classifier/v1',
      snapshotDate: '2026-09-01',
      matchedStudies: 3,
      byRole: {
        experimental_intervention: 1,
        administered_role_unclear: 1,
        observational_exposure: 1,
      },
      synonymMatched: 0,
      excludedFromSizeStatistics: 0,
      plannedCompletionIgnored: 1,
      tested: {
        studies: 1,
        largest: { nctId: 'NCT00000001', enrollment: 120, enrollmentType: 'ACTUAL' },
        longestCompletedWindow: {
          nctId: 'NCT00000001',
          days: 365,
          startDate: '2020-01',
          completionDate: '2021-01',
        },
        medianEnrollment: 120,
        completedWithPostedResults: 0,
      },
      administeredRoleUnclear: 1,
      observationalExposure: 1,
      rows: [],
    },
  })
  await db.insert(entityCorrections).values({
    id: `${suffix}`.padEnd(64, 'c').slice(0, 64),
    subjectKind: 'synonym',
    subjectKey: key,
    subjectRef: 'A name that belonged elsewhere',
    action: 'remove_synonym',
    before: { name: 'A name that belonged elsewhere', kind: 'common' },
    after: { removed: true },
    reason: 'Fixture: a synonym that a name lookup attached to the wrong record was removed.',
    evidence: [{ source: 'fixture' }],
    operator: 'operator:e2e',
  })
  return { key, slug, name }
}

export async function removeDossierV3Fixture(fixture: DossierV3Fixture | null): Promise<void> {
  if (!fixture) return
  // The correction ledger is append-only by design; the page row it references stays with it in
  // the disposable database, which the runner drops.
  await db.delete(pageRegistryRoleAggregates).where(eq(pageRegistryRoleAggregates.key, fixture.key))
  await db.delete(pageFields).where(eq(pageFields.key, fixture.key))
  await db.delete(pageRegistration).where(eq(pageRegistration.key, fixture.key))
  await db.delete(pageSynonyms).where(eq(pageSynonyms.key, fixture.key))
}
