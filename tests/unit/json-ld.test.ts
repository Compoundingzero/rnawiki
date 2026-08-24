import { describe, expect, it } from 'vitest'

import { drugJsonLd, serialiseJsonLd } from '@/lib/json-ld'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { DrugDossier } from '@/lib/types'

const drug = {
  id: 'example-medicine',
  name: 'Example Medicine',
  sponsor: '',
  targetGene: '',
  targetProtein: '',
  modality: 'Small Molecule',
  approvalStatus: 'Phase 2 Investigational',
  indication: 'Legacy indication',
  patientFriendlyIndication: 'Legacy use',
  oneSentenceVerdict: 'Legacy medicine-wide conclusion',
  laymanHowItWorks: 'Legacy mechanism',
  auditConfidence: 'Moderate / Debated',
  confidenceScore: 0,
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
  recentAuditDate: '',
  hasDiscrepancy: false,
} satisfies DrugDossier

function dossier(bindingState: MedicineDossierViewModel['bindingState']): MedicineDossierViewModel {
  return {
    slug: drug.id,
    name: drug.name,
    modality: drug.modality,
    approvalStatus: 'Active',
    statusBadge: { kind: 'programme_status', value: 'Active' },
    programmes: [],
    selectedProgrammeId: 'programme-1',
    selectedProgrammeLabel: 'One specific use',
    selectedProgrammeStatus: 'Active',
    bindingState,
    verdict: bindingState === 'published_programme' ? 'Reviewed programme conclusion' : '',
    readerSummary: {
      basis:
        bindingState === 'published_programme' ? 'published_programme' : 'unpublished_programme',
      takeaway:
        bindingState === 'published_programme'
          ? 'Reviewed programme conclusion'
          : 'No reviewed plain-language answer has been published for this use.',
      simplified: false,
      contextItems: [],
      terms: [],
    },
    mechanismSummary: {
      change: bindingState === 'published_programme' ? 'Reviewed programme mechanism' : undefined,
    },
    tenSecondWordCount: 0,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: 'Audit not completed',
    review: { historyHref: '/history' },
    machineFindingCodes: [],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
  }
}

describe('programme-aware dossier JSON-LD', () => {
  it('uses the selected reviewed programme instead of legacy medicine-wide prose', () => {
    expect(
      drugJsonLd(
        drug,
        'https://rnawiki.com/d/example-medicine?programme=programme-1',
        dossier('published_programme'),
      ),
    ).toMatchObject({
      url: 'https://rnawiki.com/d/example-medicine?programme=programme-1',
      description: 'Reviewed programme conclusion',
      mechanismOfAction: 'Reviewed programme mechanism',
    })
  })

  it('does not relabel legacy prose as a conclusion for an unpublished programme', () => {
    const result = drugJsonLd(
      drug,
      'https://rnawiki.com/d/example-medicine?programme=programme-1',
      dossier('programme_unpublished'),
    )

    expect(result.description).toBe(
      'Example Medicine: RNAWiki has not published a reviewed conclusion for One specific use yet.',
    )
    expect(result.mechanismOfAction).toBeUndefined()
    expect(result.description).not.toContain('Legacy medicine-wide conclusion')
  })

  it('does not expose an unscoped legacy verdict to search engines', () => {
    const result = drugJsonLd(
      drug,
      'https://rnawiki.com/d/example-medicine',
      dossier('legacy_record'),
    )

    expect(result.description).toBe('Legacy use')
    expect(result.description).not.toContain('Legacy medicine-wide conclusion')
  })

  it('escapes script-breaking text before it is inlined', () => {
    expect(serialiseJsonLd({ value: '</script><script>alert(1)</script>' })).not.toContain(
      '</script>',
    )
  })
})
