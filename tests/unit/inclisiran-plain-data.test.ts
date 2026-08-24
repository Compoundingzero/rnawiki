import { describe, expect, it } from 'vitest'

import { legacyMedicineDossierView } from '@/lib/medicine-dossier-view-model'
import type { DrugDossier } from '@/lib/types'
import { SIRNA_DOSSIERS } from '@/scripts/seed-data/sirna'

function requireInclisiran() {
  const dossier = SIRNA_DOSSIERS.find((candidate) => candidate.slug === 'inclisiran')
  if (!dossier) throw new Error('The curated Inclisiran dossier is missing.')
  return dossier
}

const inclisiran = requireInclisiran()

function trial(id: string) {
  const value = inclisiran.trials.find((candidate) => candidate.trialId.startsWith(id))
  if (!value) throw new Error(`The curated Inclisiran dossier is missing ${id}.`)
  return value
}

describe('Inclisiran plain-language data', () => {
  it('keeps safety, administration, and exact professional audit fields in progressive-disclosure data', () => {
    const mapped = legacyMedicineDossierView({
      ...inclisiran,
      id: inclisiran.slug,
      auditPointsCount: { measured: 0, inferred: 0, failed: 0, conclusionShift: 0 },
    } as unknown as DrugDossier)

    expect(mapped.medicineRecord.safetyAndAdministration).toEqual({
      deliveryForm: inclisiran.deliverySystem.type,
      administrationAndDosing: inclisiran.deliverySystem.description,
      safetyInformation: inclisiran.deliverySystem.safetyProfile,
    })
    expect(mapped.medicineRecord.safetyAndAdministration?.administrationAndDosing).toContain(
      'one 284 mg injection under the skin on day 1, at month 3, and then every 6 months',
    )
    expect(mapped.medicineRecord.safetyAndAdministration?.safetyInformation).toContain(
      'anaphylaxis',
    )
    expect(mapped.medicineRecord.safetyAndAdministration?.safetyInformation).toContain(
      'should not receive it again',
    )
    expect(mapped.medicineRecord.safetyAndAdministration?.safetyInformation).toContain(
      'injection-site reactions, joint pain and bronchitis',
    )

    const audit = inclisiran.keyAudits.find((candidate) => candidate.id === 'inc-a1')
    const node = mapped.evidenceNodes.find((candidate) => candidate.id === 'inc-a1')
    expect(audit).toBeDefined()
    expect(node?.technicalDetail).toEqual({
      technicalDetails: audit?.technicalDetails,
      measuredMetric: audit?.measuredMetric,
      inferredClaim: audit?.inferredClaim,
      evidenceSource: audit?.evidenceSource,
      auditFlag: audit?.auditFlag,
    })
    expect(node?.technicalDetail?.technicalDetails).toContain('95% CI 48.8 to 55.7')
    expect(node?.technicalDetail?.technicalDetails).toContain('P<0.001')
    const source = mapped.sources.find((candidate) => candidate.id === node?.sourceIds[0])
    expect(source).toMatchObject({
      label: audit?.evidenceSource,
      href: 'https://doi.org/10.1056%2FNEJMoa1912387',
      identifier: '10.1056/NEJMoa1912387',
    })
  })

  it('defines the use and central result before exposing technical detail', () => {
    expect(inclisiran.patientFriendlyIndication).toBe(
      'High LDL (“bad”) cholesterol in adults, and inherited high cholesterol from age 12; used alongside diet and exercise.',
    )
    expect(inclisiran.oneSentenceVerdict).toContain('dummy treatment')
    expect(inclisiran.oneSentenceVerdict).toContain('did not show whether')
    expect(inclisiran.oneSentenceVerdict).not.toMatch(/GalNAc|siRNA|PCSK9|ORION|placebo/)
    expect(inclisiran.conditionContext?.whyItMatters).toContain(
      'completed studies have not yet shown whether it prevents heart attacks or strokes',
    )
  })

  it('keeps the failed LDL result separate from the successful 60.6% PCSK9 result', () => {
    const audit = inclisiran.keyAudits.find((candidate) => candidate.id === 'inc-a3')
    expect(audit).toMatchObject({
      category: 'failed',
      laymanSummary: 'PCSK9 fell by about 61%, but LDL cholesterol did not clearly change.',
    })
    expect(audit?.technicalDetails).toContain('PCSK9 fell 60.6%')
    expect(audit?.laymanSummary).not.toMatch(/wiped out|exactly as designed/i)

    const orion5 = trial('ORION-5')
    expect(orion5.endpointStatus).toBe('not_met')
    expect(orion5.statisticalPValue).toContain(
      'average percentage change in LDL cholesterol was 1.7 percentage points lower',
    )
    expect(orion5.statisticalPValue).toContain('PCSK9 was 60.6% lower')
  })

  it('does not present a p-value as a study result or sister trials as independent repeats', () => {
    for (const id of ['ORION-9', 'ORION-10', 'ORION-11']) {
      const study = trial(id)
      expect(study.endpointStatus).toBe('met')
      expect(study.statisticalPValue).toMatch(/LDL cholesterol was .* lower/)
      expect(study.statisticalPValue).toContain('P < 0.001')
      expect(study.statisticalPValue).not.toMatch(/^P\s*[<=>]/)
      expect(study.independentReplicationStatus).toBe('Partially Replicated')
    }
  })

  it('marks unfinished outcome studies as pending rather than failed', () => {
    for (const id of ['ORION-4', 'VICTORION-2-PREVENT']) {
      const study = trial(id)
      expect(study.endpointStatus).toBe('not_reported')
      expect(study.statisticalPValue).toMatch(/^Results pending/)
      expect(study.unreportedAdverseSignals).toContain('has not failed its goal')
    }
  })

  it('places durability, scientific failure, regulatory delay, and adherence in the right groups', () => {
    const summary = inclisiran.measuredVsInferredSummary
    expect(summary.strictlyMeasured.some((entry) => entry.includes('ORION-3'))).toBe(true)
    expect(summary.whatFailedInitially).toHaveLength(1)
    expect(summary.whatFailedInitially[0]).toContain('ORION-5')
    expect(summary.whatFailedInitially.join(' ')).not.toMatch(/FDA|application|inspection/i)
    expect(summary.realWorldOutcome.join(' ')).toContain('application was delayed')
    expect(summary.realWorldOutcome.join(' ')).toContain(
      'appointments can still be missed or delayed',
    )

    const regulatoryAudit = inclisiran.keyAudits.find((audit) => audit.id === 'inc-a5')
    expect(regulatoryAudit?.category).toBe('conclusion_shift')
    expect(regulatoryAudit?.laymanSummary).toContain('approved inclisiran in 2021')
  })

  it('removes mechanism absolutes and explains practical comparisons without hidden guarantees', () => {
    const publicMechanism = inclisiran.mechanismSteps
      .map((step) => `${step.title} ${step.laymanDesc}`)
      .join(' ')
    expect(publicMechanism).not.toMatch(/only liver cells|almost all|exactly as designed/i)
    expect(publicMechanism).toContain('PCSK9, a protein that raises LDL cholesterol')

    const answers = inclisiran.commonQuestions.map((question) => question.a).join(' ')
    expect(answers).not.toMatch(
      /Nobody knows|cannot be forgotten|HoFH|LDLR|null\/null|P=0\.90|intracellular|cytoplasm|hepatocyte|extrapolation/i,
    )
    expect(answers).toContain('appointments can still be missed or delayed')
    expect(answers).toContain('necessarily what a patient pays')

    for (const medicine of inclisiran.substitutes?.conventionalRx ?? []) {
      expect(medicine.typicalCost).toContain('not necessarily what a patient pays')
    }
  })
})
