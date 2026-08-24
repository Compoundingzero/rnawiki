import { describe, expect, it } from 'vitest'

import {
  hasFullLaboratoryWorkflowAccess,
  omitLegacyMedicineConclusion,
  separateLegacyMedicineEvidence,
  serializeDossierForViewer,
  serializePublicDossier,
} from '@/lib/dossier-read-serializer'
import type { DrugDossier } from '@/lib/types'

function makeDossier(): DrugDossier {
  return {
    id: 'test-oligo',
    name: 'Test oligo',
    sponsor: 'RNAWiki',
    targetGene: 'PCSK9',
    targetProtein: 'PCSK9',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication: 'Test indication',
    patientFriendlyIndication: 'Test indication',
    oneSentenceVerdict: 'Recorded test verdict.',
    laymanHowItWorks: 'Recorded test mechanism.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'AUGC',
      isMachineVerified: true,
      laboratoryWorkflow: [
        {
          id: 'protocol-1',
          stepNumber: 1,
          phase: 'Synthesis',
          name: 'Restricted synthesis step',
          description: 'Operational detail that must not enter a public payload.',
          reagentsAndBuffer: 'Restricted reagent and concentration',
        },
      ],
    },
    auditPointsCount: { measured: 0, inferred: 0, failed: 0, conclusionShift: 0 },
    keyAudits: [],
    mechanismSteps: [],
    trials: [],
    measuredVsInferredSummary: {
      strictlyMeasured: [],
      unsupportedInferences: [],
      whatFailedInitially: [],
      realWorldOutcome: [],
    },
    deliverySystem: { type: '', description: '', safetyProfile: '' },
    commonQuestions: [],
    recentAuditDate: '2026-08-22T00:00:00.000Z',
    hasDiscrepancy: false,
  }
}

describe('public dossier serialization', () => {
  it('omits laboratoryWorkflow, reports the restriction, and leaves the source untouched', () => {
    const source = makeDossier()
    const before = structuredClone(source)

    const payload = serializePublicDossier(source)

    expect(payload.drug).not.toBe(source)
    expect(payload.drug.molecularSchema).not.toHaveProperty('laboratoryWorkflow')
    expect(payload.access.laboratoryWorkflow).toEqual({
      status: 'restricted',
      included: false,
      reason: 'steward_or_admin_required',
    })
    expect(JSON.stringify(payload)).not.toContain('Restricted reagent and concentration')
    expect(source).toEqual(before)
  })

  it('reports the restriction even when the dossier has no molecular schema', () => {
    const source = makeDossier()
    delete source.molecularSchema

    const payload = serializePublicDossier(source)

    expect(payload.drug).not.toHaveProperty('molecularSchema')
    expect(payload.access.laboratoryWorkflow.status).toBe('restricted')
  })
})

describe('role-aware dossier serialization', () => {
  it('permits only current stewards and administrators', () => {
    expect(hasFullLaboratoryWorkflowAccess(null)).toBe(false)
    expect(hasFullLaboratoryWorkflowAccess({ isAdmin: false, trustTier: 'trusted' })).toBe(false)
    expect(hasFullLaboratoryWorkflowAccess({ isAdmin: false, trustTier: 'steward' })).toBe(true)
    expect(hasFullLaboratoryWorkflowAccess({ isAdmin: true, trustTier: 'new' })).toBe(true)
  })

  it('includes the recorded workflow for a steward and marks access as full', () => {
    const source = makeDossier()
    const payload = serializeDossierForViewer(source, {
      isAdmin: false,
      trustTier: 'steward',
    })

    expect(payload.access.laboratoryWorkflow).toEqual({ status: 'full', included: true })
    if (payload.access.laboratoryWorkflow.status !== 'full') {
      throw new Error('The steward fixture unexpectedly received a restricted payload.')
    }
    const schema = payload.drug.molecularSchema
    if (!schema || !('laboratoryWorkflow' in schema)) {
      throw new Error('The full payload omitted its laboratory workflow.')
    }
    expect(schema.laboratoryWorkflow).toEqual(source.molecularSchema?.laboratoryWorkflow)
  })

  it('removes the unscoped legacy conclusion without changing the source payload', () => {
    const payload = serializeDossierForViewer(makeDossier(), null)
    const safe = omitLegacyMedicineConclusion(payload)

    expect(safe.drug).not.toHaveProperty('oneSentenceVerdict')
    expect(payload.drug.oneSentenceVerdict).toBe('Recorded test verdict.')
    expect(safe.access).toEqual(payload.access)
  })

  it('separates every legacy evidence field from a programme-scoped medicine identity', () => {
    const payload = serializeDossierForViewer(makeDossier(), null)
    const before = structuredClone(payload)
    const separated = separateLegacyMedicineEvidence(payload)

    expect(separated.payload.drug).toMatchObject({
      id: 'test-oligo',
      name: 'Test oligo',
      modality: 'siRNA (Small Interfering RNA)',
    })
    expect(separated.payload.drug.molecularSchema).not.toHaveProperty('laboratoryWorkflow')

    for (const legacyEvidenceField of [
      'approvalStatus',
      'indication',
      'patientFriendlyIndication',
      'oneSentenceVerdict',
      'laymanHowItWorks',
      'auditConfidence',
      'confidenceScore',
      'keyAudits',
      'mechanismSteps',
      'trials',
      'measuredVsInferredSummary',
      'deliverySystem',
      'commonQuestions',
      'recentAuditDate',
      'hasDiscrepancy',
    ]) {
      expect(separated.payload.drug).not.toHaveProperty(legacyEvidenceField)
      expect(separated.legacyMedicineRecord.fields).toHaveProperty(legacyEvidenceField)
    }

    expect(separated.legacyMedicineRecord).toMatchObject({
      status: 'legacy_unscoped_not_authoritative',
      authoritativeForSelectedProgramme: false,
    })
    expect(separated.legacyMedicineRecord.warning).toBe(
      'These fields belong to a general research summary covering the medicine as a whole. They were not reviewed for this specific use and are kept separate from the reviewed answer for that use.',
    )
    expect(payload).toEqual(before)
  })
})
