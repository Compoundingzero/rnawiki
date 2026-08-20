import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LABORATORY_WORKFLOW,
  countAuditPoints,
  dossierToRow,
  isStub,
  missingSections,
  rowToDossier,
  structureStringFor,
  type DrugRow,
} from '@/lib/dossier'
import type { AuditPoint, PricingTransparency } from '@/lib/types'

// `diffDossiers` lives in lib/queries/revisions.ts, which imports db/index.ts, which throws at
// import time when DATABASE_URL is unset. The function itself is pure — two dossiers in, a list of
// changes out — so the import is deferred behind a placeholder URL instead of making a unit test
// depend on a live database. No connection is opened either way: the pg Pool connects lazily, on
// the first query, and this file never issues one.
process.env.DATABASE_URL ??= 'postgresql://localhost:5432/rnawiki_unit_placeholder'
const { diffDossiers } = await import('@/lib/queries/revisions')

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

describe('dossierToRow', () => {
  it('writes editable content and refuses derived or provenance fields', () => {
    const dossier = rowToDossier(makeRow({ keyAudits: [audit('a1', 'measured')], pricing }))
    const row = dossierToRow({ ...dossier, name: 'Metformin hydrochloride' })

    expect(row.name).toBe('Metformin hydrochloride')
    expect(row.pricing).toEqual(pricing)
    expect(Object.keys(row)).not.toContain('auditPointsCount')
    expect(Object.keys(row)).not.toContain('slug')
    expect(Object.keys(row)).not.toContain('id')
    expect(Object.keys(row)).not.toContain('viewCount')
    expect(Object.keys(row)).not.toContain('revisionCount')
    expect(Object.keys(row)).not.toContain('isMachineVerifiedStructure')
  })

  it('leaves fields the caller did not mention untouched', () => {
    const row = dossierToRow({ confidenceScore: 71 })
    expect(row).toEqual({ confidenceScore: 71 })
  })
})

describe('DEFAULT_LABORATORY_WORKFLOW', () => {
  it('is a connected, acyclic chain whose dependencies all exist', () => {
    const ids = DEFAULT_LABORATORY_WORKFLOW.map((step) => step.id)
    expect(ids).toEqual(['step-1', 'step-2', 'step-3'])
    expect(DEFAULT_LABORATORY_WORKFLOW.map((step) => step.phase)).toEqual([
      'QC',
      'Synthesis',
      'Conjugation',
    ])

    const known = new Set(ids)
    const seen = new Set<string>()
    for (const step of DEFAULT_LABORATORY_WORKFLOW) {
      if (step.dependsOnStepId !== undefined) {
        expect(known.has(step.dependsOnStepId)).toBe(true)
        // Every dependency points at a step already declared, so no cycle is possible.
        expect(seen.has(step.dependsOnStepId)).toBe(true)
      }
      seen.add(step.id)
    }
  })
})

describe('diffDossiers', () => {
  const before = rowToDossier(makeRow({ pricing, keyAudits: [audit('a1', 'measured')] }))

  it('reports a scalar change with both values in plain text', () => {
    const after = rowToDossier(
      makeRow({ pricing, keyAudits: [audit('a1', 'measured')], name: 'Metformin hydrochloride' }),
    )
    const changes = diffDossiers(before, after)

    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'name',
      label: 'Name',
      before: 'Metformin',
      after: 'Metformin hydrochloride',
    })
  })

  it('summarises a changed jsonb section instead of dumping its JSON', () => {
    const after = rowToDossier(
      makeRow({
        keyAudits: [audit('a1', 'measured')],
        pricing: {
          ...pricing,
          retailPricePerDoseOrYear: '$19 / month',
          markupEstimate: '900% markup',
        },
      }),
    )
    const changes = diffDossiers(before, after)
    const pricingChange = changes.find((c) => c.field === 'pricing')

    expect(pricingChange).toBeDefined()
    expect(pricingChange?.label).toBe('Pricing')
    expect(pricingChange?.before).toBe('$4 / month · 200% markup')
    expect(pricingChange?.after).toBe('$19 / month · 900% markup')
    // No raw JSON reaches the review queue.
    expect(pricingChange?.after).not.toContain('{')
    expect(pricingChange?.after).not.toContain('synthesisCostPerDose')
  })

  it('names the sub-field when a section changes without its headline changing', () => {
    const after = rowToDossier(
      makeRow({
        keyAudits: [audit('a1', 'measured')],
        pricing: { ...pricing, openPatentNotes: 'Off patent worldwide.' },
      }),
    )
    const pricingChange = diffDossiers(before, after).find((c) => c.field === 'pricing')

    expect(pricingChange?.before).toBe('$4 / month · 200% markup')
    expect(pricingChange?.after).toBe('$4 / month · 200% markup (updated: open patent notes)')
  })

  it('counts what moved inside an array section', () => {
    const after = rowToDossier(
      makeRow({
        pricing,
        keyAudits: [audit('a1', 'measured'), audit('a2', 'inferred')],
      }),
    )
    const auditChange = diffDossiers(before, after).find((c) => c.field === 'keyAudits')

    expect(auditChange?.before).toBe('1 points (1 measured / 0 inferred / 0 failed / 0 shifted)')
    expect(auditChange?.after).toBe('2 points (1 measured / 1 inferred / 0 failed / 0 shifted)')
  })

  it('ignores key order, so a re-serialised section is not reported as an edit', () => {
    const reordered: PricingTransparency = {
      synthesisComplexity: pricing.synthesisComplexity,
      openPatentNotes: pricing.openPatentNotes,
      markupEstimate: pricing.markupEstimate,
      retailPricePerDoseOrYear: pricing.retailPricePerDoseOrYear,
      synthesisCostPerDose: pricing.synthesisCostPerDose,
    }
    const after = rowToDossier(
      makeRow({ pricing: reordered, keyAudits: [audit('a1', 'measured')] }),
    )
    expect(diffDossiers(before, after)).toEqual([])
  })

  it('returns nothing for two identical dossiers', () => {
    expect(diffDossiers(before, before)).toEqual([])
  })
})
