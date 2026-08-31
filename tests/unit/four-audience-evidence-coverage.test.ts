import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import {
  generatedFourAudienceCoverageFiles,
  ORDINARY_QUESTION_IDS,
  type FourAudienceCoverageReport,
} from '@/scripts/audit/four-audience-evidence-coverage'

const REPO_ROOT = process.cwd()
const PRODUCT_DOCS = join(REPO_ROOT, 'docs', 'product')
const REQUIRED_PROMPTS = [
  'What is this medicine used or studied for?',
  'What happened to people in the cited study or label?',
  'How large was the measured result?',
  'What important harm or limitation was recorded?',
  'Who might this evidence not apply to?',
  'What is unknown, conflicting or stale?',
] as const

interface EvidenceContract {
  schema: string
  canonicalRecord: string
  projectionRowKinds: Record<string, string>
  lenses: Array<{ id: string; label: string; mustPreserve: string[] }>
  ordinaryQuestions: Array<{ id: string; prompt: string; questionIntents: string[] }>
  specialistMeasures: {
    sourceRead: { headlineRule: string; separateRule: string; warning: string }
  }
  invariants: string[]
}

let report: FourAudienceCoverageReport
let generatedMarkdown: string
let generatedJson: string

beforeAll(async () => {
  const generated = await generatedFourAudienceCoverageFiles(REPO_ROOT)
  generatedJson = generated.json
  generatedMarkdown = generated.markdown
  report = JSON.parse(generated.json) as FourAudienceCoverageReport
})

describe('four-audience evidence contract', () => {
  it('defines exactly four projections over one canonical record', () => {
    const contract = JSON.parse(
      readFileSync(join(PRODUCT_DOCS, 'four-audience-evidence-contract.json'), 'utf8'),
    ) as EvidenceContract

    expect(contract.schema).toBe('four-audience-evidence-contract/v1')
    expect(contract.canonicalRecord).toBe('MedicineDossierViewModel')
    expect(contract.lenses.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: 'ordinary', label: 'Ordinary reader' },
      { id: 'biotech', label: 'Biotech researcher' },
      { id: 'chemist', label: 'Chemist' },
      { id: 'quantitative', label: 'Physicist or quantitative scientist' },
    ])
    for (const lens of contract.lenses) {
      expect(lens.mustPreserve).toEqual([
        'claims',
        'measurements',
        'limitations',
        'source bindings',
        'source excerpts',
      ])
    }
    expect(contract.invariants).toContain(
      'Selecting a lens changes the grouped projection panel; the complete canonical dossier remains available below it.',
    )
    expect(Object.keys(contract.projectionRowKinds)).toEqual([
      'medical_evidence',
      'identity',
      'operational',
      'missing',
    ])
    expect(contract.projectionRowKinds.medical_evidence).toContain(
      'at least one exact source binding',
    )
    expect(contract.invariants).toContain(
      'A medical or evidence claim without an exact resolved source binding is represented as a not-recorded coverage gap and is not counted as answered in the projection.',
    )
  })

  it('maps the requested six questions without treating registry entries as answers', () => {
    const contract = JSON.parse(
      readFileSync(join(PRODUCT_DOCS, 'four-audience-evidence-contract.json'), 'utf8'),
    ) as EvidenceContract

    expect(contract.ordinaryQuestions.map((question) => question.id)).toEqual(ORDINARY_QUESTION_IDS)
    expect(contract.ordinaryQuestions.map((question) => question.prompt)).toEqual(REQUIRED_PROMPTS)
    expect(contract.ordinaryQuestions.map((question) => question.questionIntents)).toEqual([
      ['purpose'],
      ['bottom-line', 'measurement'],
      ['results-magnitude'],
      ['harms', 'meaning-limitations'],
      ['applicability'],
      ['unknowns'],
    ])
    expect(report.registryBoundary.fixedRegistryPairs).toBe(
      report.denominators.recordedBackgroundRecords * REQUIRED_PROMPTS.length,
    )
    expect(report.registryBoundary.observedSourceBoundEligiblePairs).toBeLessThan(
      report.registryBoundary.fixedRegistryPairs,
    )
    expect(report.registryBoundary.note).toContain('never counted as clinical answers')
  })

  it('keeps source excerpts and qualifying source objects as separate measures', () => {
    const contract = JSON.parse(
      readFileSync(join(PRODUCT_DOCS, 'four-audience-evidence-contract.json'), 'utf8'),
    ) as EvidenceContract
    const denominator = report.denominators.recordedBackgroundRecords

    expect(contract.specialistMeasures.sourceRead.headlineRule).toBe(
      'at_least_one_qualifying_source_excerpt',
    )
    expect(contract.specialistMeasures.sourceRead.separateRule).toBe(
      'at_least_one_qualifying_source_object',
    )
    expect(contract.specialistMeasures.sourceRead.warning).toContain('not a clinical source read')
    expect(
      report.sourceRead.recordsWithQualifyingSourceExcerpt + report.sourceRead.noSourceExcerptRead,
    ).toBe(denominator)
    expect(
      report.sourceRead.recordsWithQualifyingSourceRecorded +
        report.sourceRead.noQualifyingSourceRecorded,
    ).toBe(denominator)
    expect(generatedMarkdown).toContain('**No source excerpt read**')
    expect(generatedMarkdown).toContain('**No qualifying source recorded**')
  })
})

describe('four-audience evidence coverage report', () => {
  it('matches the generated files exactly', () => {
    expect(readFileSync(join(PRODUCT_DOCS, 'four-audience-evidence-coverage.json'), 'utf8')).toBe(
      generatedJson,
    )
    expect(readFileSync(join(PRODUCT_DOCS, 'four-audience-evidence-coverage.md'), 'utf8')).toBe(
      generatedMarkdown,
    )
  })

  it('keeps every count within its source-bound denominator', () => {
    const denominator = report.denominators.recordedBackgroundRecords
    const counts = report.ordinaryQuestions.map((question) => question.observedEligibleRecords)

    expect(report.ordinaryQuestions.map((question) => question.prompt)).toEqual(REQUIRED_PROMPTS)
    expect(counts.every((count) => count >= 0 && count <= denominator)).toBe(true)
    expect(report.allSixOrdinaryQuestions.observedEligibleForAllSix).toBeLessThanOrEqual(
      Math.min(...counts),
    )
    expect(report.chemistryIdentity.unionRecords).toBeLessThanOrEqual(denominator)
    expect(
      report.biotechResearchCoverage.recordsWithUseMechanismResultAndApplicability,
    ).toBeLessThanOrEqual(
      Math.min(
        report.biotechResearchCoverage.sourceBoundRecordedUseRecords,
        report.biotechResearchCoverage.sourceBoundMechanismRecords,
        report.biotechResearchCoverage.sourceBoundPivotalResultRecords,
        report.biotechResearchCoverage.sourceBoundApplicabilityRecords,
      ),
    )
    expect(report.quantitativeUncertainty.resultsWithPrintedUncertainty).toBeLessThanOrEqual(
      report.quantitativeUncertainty.pivotalResults,
    )
  })

  it('keeps conflict, non-comparability, and unavailable stale state distinct', () => {
    expect(report.sourceConflict.comparableDifferFields).toBe(
      report.sourceConflict.comparisonStates.differ,
    )
    expect(report.sourceConflict.notComparableFieldsExcluded).toBe(
      report.sourceConflict.comparisonStates.not_comparable,
    )
    expect(report.sourceConflict.unmappedDifferFields).toEqual([])

    if (
      report.staleExactBindings.measurementState === 'not_observable_in_checked_in_public_snapshot'
    ) {
      expect(report.staleExactBindings.confirmedExactBindings).toBeNull()
      expect(report.staleExactBindings.recordsWithConfirmedDrift).toBeNull()
      expect(report.staleExactBindings.note).toContain('Absence is not reported as zero')
    }
  })
})
