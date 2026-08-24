import { randomUUID } from 'node:crypto'

import { config } from 'dotenv'
import { eq } from 'drizzle-orm'

config()

export const CREATINE_JARGON_VERDICT =
  'One of the few supplements whose central claim survives audit — muscle creatine, phosphocreatine resynthesis and short-duration power all rise, replicated across decades — while the neuroprotection claim it is increasingly sold on failed two Phase 3 trials totalling 2,294 patients.'

const PLAIN_MEASURED_FINDING =
  'Studies found that creatine builds up in muscle, helps it refill quick energy, and improves performance during short, hard efforts.'

const PLAIN_MAIN_LIMITATION =
  'The studies recorded here do not show that creatine protects the brain or slows a brain disease.'

export interface CreatineJargonFixture {
  drugId: string
  exactVerdict: string
  expectedLimit: string
  name: string
  plainMeasuredFinding: string
  purpose: string
  slug: string
}

/**
 * Adds one minimal general research summary whose stored professional conclusion deliberately
 * contains dense scientific language. The journey verifies that the first screen remains plain
 * while the exact stored wording is still available. The outer E2E harness owns a disposable
 * database; this fixture still removes its own row so its lifecycle stays explicit and reviewable.
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
  const purpose = 'Used as a supplement for short bursts of strength and power'

  await db.insert(schema.drugs).values({
    id: drugId,
    slug,
    name,
    sponsor: 'Playwright test fixture',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication: 'A test-only legacy record about creatine evidence',
    patientFriendlyIndication: purpose,
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
      {
        id: `e2e-creatine-limitation-${runKey}`,
        category: 'inferred',
        title: 'The brain-protection claim is not established here',
        laymanSummary: PLAIN_MAIN_LIMITATION,
        technicalDetails:
          'This is a minimal, test-only evidence limitation used to keep uncertainty visible on the first screen.',
        evidenceSource: 'Playwright disposable-database fixture',
        inferredClaim: 'Neuroprotection is not established by this test record',
        auditFlag: 'caution',
      },
    ],
  })

  return {
    drugId,
    exactVerdict: CREATINE_JARGON_VERDICT,
    expectedLimit:
      'Two large studies found no evidence that creatine slowed Parkinson’s or Huntington’s disease.',
    name,
    plainMeasuredFinding: PLAIN_MEASURED_FINDING,
    purpose,
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
