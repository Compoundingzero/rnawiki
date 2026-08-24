import { randomUUID } from 'node:crypto'

import { config } from 'dotenv'
import { eq } from 'drizzle-orm'

config()

export const CREATINE_JARGON_VERDICT =
  'One of the few supplements whose central claim survives audit — muscle creatine, phosphocreatine resynthesis and short-duration power all rise, replicated across decades — while the neuroprotection claim it is increasingly sold on failed two Phase 3 trials totalling 2,294 patients.'

const PLAIN_MEASURED_FINDING =
  'Muscle biopsies before and after showed that swallowed creatine really does end up inside muscle, and that people with the least to begin with gained the most.'

export interface CreatineJargonFixture {
  drugId: string
  exactVerdict: string
  name: string
  plainMeasuredFinding: string
  slug: string
}

/**
 * Adds one minimal legacy dossier whose professional conclusion deliberately contains the jargon
 * phrases exercised by the browser journey. The outer E2E harness owns a disposable database;
 * this fixture still removes its own row so its lifecycle stays explicit and locally reviewable.
 */
export async function installCreatineJargonFixture(): Promise<CreatineJargonFixture> {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'The Creatine jargon journey requires E2E_DISPOSABLE_DATABASE=1. Point DATABASE_URL at the uniquely named disposable database created by the E2E harness.',
    )
  }

  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const drugId = `e2e-creatine-jargon-drug-${runKey}`
  const slug = `e2e-creatine-jargon-${runKey}`
  const name = `Creatine comprehension fixture ${runKey}`

  await db.insert(schema.drugs).values({
    id: drugId,
    slug,
    name,
    sponsor: 'Playwright test fixture',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication: 'A test-only legacy record about creatine evidence',
    patientFriendlyIndication: 'Understanding evidence for brief, hard exercise efforts',
    oneSentenceVerdict: CREATINE_JARGON_VERDICT,
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    dossierDepth: 'curated',
    keyAudits: [
      {
        id: `e2e-creatine-measured-${runKey}`,
        category: 'measured',
        title: 'Creatine was measured inside muscle',
        laymanSummary: PLAIN_MEASURED_FINDING,
        technicalDetails:
          'This is a minimal, test-only measured audit used to keep the first read in plain language.',
        evidenceSource: 'Playwright disposable-database fixture',
        measuredMetric: 'Creatine measured in muscle tissue before and after the recorded study',
        auditFlag: 'verified',
      },
    ],
  })

  return {
    drugId,
    exactVerdict: CREATINE_JARGON_VERDICT,
    name,
    plainMeasuredFinding: PLAIN_MEASURED_FINDING,
    slug,
  }
}

export async function removeCreatineJargonFixture(
  fixture: CreatineJargonFixture | null,
): Promise<void> {
  if (!fixture) return

  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  await db.delete(schema.drugs).where(eq(schema.drugs.id, fixture.drugId))
}
