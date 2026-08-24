import { describe, expect, it } from 'vitest'
import {
  countAuditPoints,
  isStub,
  missingSections,
  rowToDossier,
  structureStringFor,
  type DrugRow,
} from '@/lib/dossier'
import type { AuditPoint, PricingTransparency } from '@/lib/types'

function makeRow(overrides: Partial<DrugRow> = {}): DrugRow {
  const timestamp = new Date('2026-08-01T00:00:00.000Z')
  return {
    id: 'drug_metformin',
    slug: 'metformin',
    name: 'Metformin',
    tradeName: 'Glucophage',
    sponsor: 'Merck',
    targetGene: 'PRKAA1',
    targetProtein: 'AMP-activated protein kinase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication: 'Type 2 diabetes',
    patientFriendlyIndication: 'Type 2 diabetes',
    oneSentenceVerdict: 'Lowers hepatic glucose output.',
    laymanHowItWorks: 'It tells the liver to release less sugar.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    anatomicalSite: 'Liver',
    recentAuditDate: '2026-08-01',
    hasDiscrepancy: false,
    dossierDepth: 'flagship',
    conditionContext: null,
    pricing: null,
    substitutes: null,
    molecularSchema: null,
    keyAudits: [],
    mechanismSteps: [],
    trials: [],
    measuredVsInferredSummary: null,
    deliverySystem: null,
    commonQuestions: [],
    sourceProvenance: ['openFDA Drugs@FDA'],
    isMachineVerifiedStructure: false,
    verificationHash: null,
    lastVerifiedAt: null,
    revisionCount: 3,
    viewCount: 41,
    lastEditedAt: timestamp,
    lastEditedBy: 'Ada',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function audit(id: string, category: AuditPoint['category']): AuditPoint {
  return {
    id,
    category,
    title: `Audit ${id}`,
    laymanSummary: 'Summary.',
    technicalDetails: 'Details.',
    evidenceSource: 'NEJM 2020',
  }
}

const pricing: PricingTransparency = {
  synthesisCostPerDose: '$0.02 per tablet',
  retailPricePerDoseOrYear: '$4 / month',
  markupEstimate: '200% markup',
  openPatentNotes: 'Off patent since 2002.',
  synthesisComplexity: 'Low',
}

describe('rowToDossier', () => {
  it('derives auditPointsCount by counting keyAudits, never from a stored total', () => {
    const audits = [
      audit('a1', 'measured'),
      audit('a2', 'measured'),
      audit('a3', 'inferred'),
      audit('a4', 'failed'),
      audit('a5', 'conclusion_shift'),
      audit('a6', 'conclusion_shift'),
    ]
    const dossier = rowToDossier(makeRow({ keyAudits: audits }))

    expect(dossier.auditPointsCount).toEqual({
      measured: 2,
      inferred: 1,
      failed: 1,
      conclusionShift: 2,
    })
    // The four numbers always sum to the array the page renders beneath them.
    const total =
      dossier.auditPointsCount.measured +
      dossier.auditPointsCount.inferred +
      dossier.auditPointsCount.failed +
      dossier.auditPointsCount.conclusionShift
    expect(total).toBe(dossier.keyAudits.length)
  })

  it('reports zeros for a record with no audit points', () => {
    expect(rowToDossier(makeRow()).auditPointsCount).toEqual({
      measured: 0,
      inferred: 0,
      failed: 0,
      conclusionShift: 0,
    })
    expect(countAuditPoints([])).toEqual({
      measured: 0,
      inferred: 0,
      failed: 0,
      conclusionShift: 0,
    })
  })

  it('exposes the slug as the public id and never the internal primary key', () => {
    const dossier = rowToDossier(makeRow({ id: 'drug_internal_7f3a', slug: 'inclisiran' }))
    expect(dossier.id).toBe('inclisiran')
  })

  it('turns null sections into empty ones rather than inventing content', () => {
    const dossier = rowToDossier(makeRow())
    expect(dossier.measuredVsInferredSummary.strictlyMeasured).toEqual([])
    expect(dossier.deliverySystem.type).toBe('')
    expect(dossier.pricing).toBeUndefined()
    expect(dossier.communityNotes).toBeUndefined()
  })

  it('returns a fresh empty summary per call, so one dossier cannot mutate another', () => {
    const first = rowToDossier(makeRow())
    const second = rowToDossier(makeRow())
    first.measuredVsInferredSummary.strictlyMeasured.push('added later')
    expect(second.measuredVsInferredSummary.strictlyMeasured).toEqual([])
  })
})

describe('structureStringFor', () => {
  it('returns null for a drug with no recorded structure, never a stand-in sequence', () => {
    const dossier = rowToDossier(makeRow({ slug: 'inclisiran', molecularSchema: null }))
    const structure = structureStringFor(dossier)

    expect(structure).toBeNull()
    // The wireframe substituted these per-drug strings when a record had no structure. They are
    // not the sequences of those drugs, and printing one under a real drug's name would be a
    // fabricated measurement on a site about telling measurement from inference.
    expect(structure).not.toBe('AUGUCAUUGGAUCACUGCU')
    expect(structure).not.toBe('AUGCCGAUUGCAUUCGAGUAA')
  })

  it('treats a blank string in the schema as no structure at all', () => {
    const dossier = rowToDossier(
      makeRow({
        molecularSchema: {
          structureType: 'rna_sequence',
          sequence5to3: '   ',
          smilesString: '',
          isMachineVerified: false,
          laboratoryWorkflow: [],
        },
      }),
    )
    expect(structureStringFor(dossier)).toBeNull()
  })

  it('prefers the SMILES string, falling back to the sequence', () => {
    const withSmiles = rowToDossier(
      makeRow({
        molecularSchema: {
          structureType: 'small_molecule_smiles',
          smilesString: 'CN(C)C(=N)NC(=N)N',
          sequence5to3: 'AUGC',
          isMachineVerified: false,
          laboratoryWorkflow: [],
        },
      }),
    )
    expect(structureStringFor(withSmiles)).toBe('CN(C)C(=N)NC(=N)N')

    const sequenceOnly = rowToDossier(
      makeRow({
        molecularSchema: {
          structureType: 'rna_sequence',
          sequence5to3: 'AUGCAUGC',
          isMachineVerified: false,
          laboratoryWorkflow: [],
        },
      }),
    )
    expect(structureStringFor(sequenceOnly)).toBe('AUGCAUGC')
  })
})

describe('missingSections and isStub', () => {
  it('names every absent curated section', () => {
    const missing = missingSections(rowToDossier(makeRow()))
    expect(missing).toContain('Evidence audit points')
    expect(missing).toContain('Pricing transparency')
    expect(missing).toContain('Molecular structure')
    // The verdict and the how-it-works copy are present in the fixture.
    expect(missing).not.toContain('Plain-language verdict')
    expect(missing).not.toContain('How it works')
  })

  it('drops a section from the list once it carries content', () => {
    const withPricing = rowToDossier(makeRow({ pricing }))
    expect(missingSections(withPricing)).not.toContain('Pricing transparency')
  })

  it('calls an empty record a stub even when the depth column claims otherwise', () => {
    const empty = rowToDossier(makeRow({ dossierDepth: 'curated', oneSentenceVerdict: '' }))
    expect(isStub(empty)).toBe(true)

    const documented = rowToDossier(
      makeRow({ dossierDepth: 'curated', keyAudits: [audit('a1', 'measured')] }),
    )
    expect(isStub(documented)).toBe(false)
  })
})
