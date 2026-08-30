import { randomUUID } from 'node:crypto'

import type { MedicineRecordedBackground } from '../../../lib/background/types'

export interface NavigatorCoverageFixture {
  drugId: string
  slug: string
  name: string
}

/**
 * A record shaped to exercise every state the floating navigator can report.
 *
 * It deliberately holds a small number of modules rather than many, because the interesting case is
 * the ordinary one: two thirds of the corpus is a registry-derived row holding a handful of fields,
 * and the navigator's whole job on such a page is to show which few destinations are real. A fixture
 * rich in every module would test the easy case and miss the one readers actually meet.
 */
const RECORDED_BACKGROUND: MedicineRecordedBackground = {
  version: 'medicine-background/v1',
  authoredAt: '2026-08-28',
  provenanceTier: 'extracted',
  recordedUses: {
    statements: [
      {
        textAsRecorded: 'For the temporary relief of an example symptom.',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00000000-0000-4000-8000-00000000e2e1',
          label: 'Navigator coverage fixture label',
          retrievedAt: '2026-08-28',
          excerpt: 'INDICATIONS For the temporary relief of an example symptom.',
        },
      },
    ],
  },
  pharmacokinetics: {
    routeAsRecorded: 'Oral',
    halfLife: {
      display: '12 hours',
      numeric: 12,
      unit: 'hours',
      populationContext: 'healthy adults, single dose',
      source: {
        kind: 'FDA_LABEL',
        identifier: '00000000-0000-4000-8000-00000000e2e1',
        label: 'Navigator coverage fixture label',
        retrievedAt: '2026-08-28',
        excerpt: 'The mean terminal half-life is 12 hours in healthy adults after a single dose.',
      },
    },
  },
  /*
   * Two readings that do not overlap, kept side by side with neither marked wrong. This is the state
   * the navigator exists to surface, and before it existed the note was reachable only by scrolling
   * into this module.
   */
  sourceConsensus: {
    documentsExamined: 31,
    fields: [
      {
        field: 'halfLife',
        sourceCount: 31,
        agreementRate: 0.9677419354838709,
        numericallyDisjoint: true,
        readings: [
          {
            display: '12 hours',
            sourceCount: 30,
            sources: [
              {
                kind: 'FDA_LABEL',
                identifier: '00000000-0000-4000-8000-00000000e2e1',
                label: 'Navigator coverage fixture label',
                retrievedAt: '2026-08-28',
                excerpt: 'The mean terminal half-life is 12 hours in healthy adults.',
              },
            ],
          },
          {
            display: '18 hours',
            sourceCount: 1,
            sources: [
              {
                kind: 'FDA_LABEL',
                identifier: '00000000-0000-4000-8000-00000000e2e2',
                label: 'Navigator coverage fixture label, second manufacturer',
                retrievedAt: '2026-08-28',
                excerpt:
                  'The half-life is prolonged to approximately 18 hours in subjects with mild hepatic impairment.',
              },
            ],
          },
        ],
      },
    ],
  },
}

export async function installNavigatorCoverageFixture(): Promise<NavigatorCoverageFixture> {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'The navigator coverage journey requires E2E_DISPOSABLE_DATABASE=1. Point DATABASE_URL at the uniquely named disposable database created by the E2E harness.',
    )
  }

  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const drugId = `e2e-navigator-drug-${runKey}`
  const slug = `e2e-navigator-${runKey}`
  const name = `Navigator coverage fixture ${runKey}`

  await db.insert(schema.drugs).values({
    id: drugId,
    slug,
    name,
    sponsor: 'Playwright test fixture',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    indication: 'A test-only record for the floating section navigator',
    patientFriendlyIndication: 'An example symptom',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    recordedBackground: RECORDED_BACKGROUND,
  })

  return { drugId, slug, name }
}

export async function removeNavigatorCoverageFixture(
  fixture: NavigatorCoverageFixture | null,
): Promise<void> {
  if (!fixture) return
  const [{ db }, schema, { eq }] = await Promise.all([
    import('../../../db'),
    import('../../../db/schema'),
    import('drizzle-orm'),
  ])
  await db.delete(schema.drugs).where(eq(schema.drugs.id, fixture.drugId))
}
