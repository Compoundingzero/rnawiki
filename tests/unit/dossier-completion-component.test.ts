import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DossierCompletionAssessment } from '@/components/dossier/DossierCompletionAssessment'
import {
  SECTION_STATE_LABELS,
  type DossierCompletionAssessmentView,
  type DossierCompletionSectionView,
} from '@/lib/dossier-completion/view'
import {
  DOSSIER_SECTION_IDS,
  SECTION_STATES,
  isTerminalSectionState,
  type DossierSectionId,
  type SectionState,
} from '@/lib/dossier-completion/types'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { InventoryResolutionView } from '@/lib/queries/dossier-completion'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/**
 * The property under test is not that the section renders. It is that it never converts an absence
 * into a finding, never names a second record, and never lets a raw code stand as reader-facing
 * copy. Each of those would be a release failure rather than a cosmetic defect.
 */

function section(
  id: DossierSectionId,
  state: SectionState,
  overrides: Partial<DossierCompletionSectionView> = {},
): DossierCompletionSectionView {
  return {
    id,
    label: `Section ${id}`,
    state,
    stateLabel: SECTION_STATE_LABELS[state],
    terminal: isTerminalSectionState(state),
    basisKind: 'RECORDED_MODULE',
    basis: `Basis sentence for ${id}.`,
    sourceRefs: [],
    humanReadSuggested: false,
    ...overrides,
  }
}

/** One section per state, so every reader-facing state label is exercised by a real render. */
function everyStateSections(): DossierCompletionSectionView[] {
  return SECTION_STATES.map((state, index) =>
    section(DOSSIER_SECTION_IDS[index] as DossierSectionId, state),
  )
}

function assessment(
  overrides: Partial<DossierCompletionAssessmentView> = {},
): DossierCompletionAssessmentView {
  const sections = overrides.sections ?? [
    section('identity', 'EXACT_STRUCTURED_SOURCE_DATA', {
      label: 'What this record is',
      counts: { registryIdentifiers: 2 },
      sourceRefs: [
        {
          kind: 'UNII',
          identifier: 'TR046Y3K1G',
          label: 'recordedBackground.registryIdentifiers.unii',
        },
        {
          kind: 'PUBCHEM_CID',
          identifier: '94335',
          label: 'recordedBackground.registryIdentifiers.pubchemCid',
        },
      ],
    }),
    section('recorded-uses', 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH', {
      label: 'What sources say it is used for',
      humanReadSuggested: true,
      counts: { labelsNamingEntity: 3 },
      sourceRefs: [
        {
          kind: 'FDA_LABEL',
          identifier: '55d703ca-ff9d-0dbc-e063-6294a90ab6b1',
          label: '12-substance label',
        },
      ],
    }),
    section('trial-registry', 'RESULTS_NOT_POSTED', {
      label: 'Registered clinical trials',
      sourceRefs: [
        { kind: 'CLINICALTRIALS', identifier: 'NCT01234567' },
        {
          kind: 'PUBMED_SEARCH',
          identifier: 'pubmed:2026-09-01:example',
          retrievedAt: '2026-09-01',
        },
      ],
    }),
  ]
  return {
    status: 'COMPLETE',
    statusCopy: 'Every section that applies to this record has an explicit state.',
    resolverVersion: 'dossier-completion/v1',
    inputDigest: 'a'.repeat(64),
    contentChangedAt: '2026-09-02T00:00:00.000Z',
    assessedAt: '2026-09-02T01:00:00.000Z',
    applicableSectionCount: sections.length,
    terminalSectionCount: sections.filter((entry) => entry.terminal).length,
    ...overrides,
    sections,
  }
}

function resolution(overrides: Partial<InventoryResolutionView> = {}): InventoryResolutionView {
  return {
    resolutionStatus: 'CANONICAL_ENTITY',
    entityClass: 'APPROVED_MEDICINE',
    canonicalSlug: 'a-second-record-slug',
    redirectTargetSlug: null,
    identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
    identifierSharedWithOtherRecords: false,
    resolverVersion: 'inventory-resolution/v1',
    ...overrides,
  }
}

function dossier(overrides: Partial<MedicineDossierViewModel> = {}): MedicineDossierViewModel {
  return {
    slug: 'example-record',
    name: 'Example record',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    statusBadge: { label: 'Approved', tone: 'neutral' },
    programmes: [],
    selectedProgrammeId: '',
    selectedProgrammeLabel: 'General research summary',
    selectedProgrammeStatus: '',
    bindingState: 'legacy_record',
    verdict: '',
    readerSummary: {
      basis: 'older_record',
      usedFor: 'Used for an example.',
      takeaway: '',
      simplified: false,
      contextItems: [],
    },
    mechanismSummary: { text: '', isPlain: false },
    tenSecondWordCount: 0,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: '',
    review: { reviewers: [] },
    machineFindingCodes: [],
    medicineRecord: { conventionalAlternatives: [], commonQuestions: [], communityNotes: [] },
    ...overrides,
  } as MedicineDossierViewModel
}

function render(model: MedicineDossierViewModel): string {
  return renderToStaticMarkup(React.createElement(DossierCompletionAssessment, { dossier: model }))
}

describe('the completeness section renders states, never conclusions', () => {
  it('renders nothing at all when the record carries no assessment', () => {
    expect(render(dossier())).toBe('')
    expect(render(dossier({ inventoryResolution: resolution() }))).toBe('')
  })

  it('shows the status sentence, the content date and the section count', () => {
    const markup = render(dossier({ completionAssessment: assessment() }))

    expect(markup).toContain('How complete this record is')
    expect(markup).toContain('Every section that applies to this record has an explicit state.')
    expect(markup).toContain('States last changed on 2026-09-02.')
    expect(markup).toContain('3 of 3 sections have a state')
  })

  it('prints every reader-facing state label as visible text', () => {
    const sections = everyStateSections()
    const markup = render(
      dossier({
        completionAssessment: assessment({
          status: 'INCOMPLETE',
          statusCopy: 'At least one section has not reached an explicit state yet.',
          sections,
          applicableSectionCount: sections.length,
          terminalSectionCount: sections.filter((entry) => entry.terminal).length,
        }),
      }),
    )

    for (const label of Object.values(SECTION_STATE_LABELS)) {
      expect(markup).toContain(label)
    }
  })

  it('never leaves a state to colour alone', () => {
    // A badge whose meaning lived in its background colour would be unreadable to a reader who
    // cannot see it, and the state is the whole point of the row.
    const markup = render(dossier({ completionAssessment: assessment() }))
    expect(markup).toContain('Recorded as structured source data')
    expect(markup).toContain('Searched; no qualifying record found')
    expect(markup).toContain('Registered; results not posted')
  })

  it('turns a source kind or count key it has no wording for into words', () => {
    // The resolver may record a kind or a count the component has never seen. The fallback keeps a
    // storage code out of the reader-facing list rather than printing it as if it were copy.
    const markup = render(
      dossier({
        completionAssessment: assessment({
          sections: [
            section('cost-context', 'EXACT_STRUCTURED_SOURCE_DATA', {
              label: 'Recorded acquisition cost',
              counts: { someNewMeasure: 4 },
              sourceRefs: [{ kind: 'A_NEW_SOURCE_KIND', identifier: 'x-1' }],
            }),
          ],
        }),
      }),
    )

    expect(markup).toContain('A new source kind x-1')
    expect(markup).toContain('4 some new measure')
    expect(markup).not.toContain('A_NEW_SOURCE_KIND')
    expect(markup).not.toContain('someNewMeasure')
  })

  it('groups the sections that are still open above the full list, only when incomplete', () => {
    const open = [
      section('identity', 'EXACT_STRUCTURED_SOURCE_DATA', { label: 'What this record is' }),
      section('literature-search', 'SEARCH_PENDING', {
        label: 'Published clinical-trial reports',
        blockedReason: 'The dated literature search has not run for this record yet.',
      }),
    ]
    const markup = render(
      dossier({
        completionAssessment: assessment({
          status: 'INCOMPLETE',
          sections: open,
          applicableSectionCount: 2,
          terminalSectionCount: 1,
        }),
      }),
    )

    expect(markup).toContain('Still open')
    expect(markup).toContain('href="#record-completeness-literature-search"')
    expect(markup).toContain(
      'What has to happen: The dated literature search has not run for this record yet.',
    )
    /* The open list carries one entry, and it is the section that has no state. */
    expect(markup).not.toContain('href="#record-completeness-identity"')

    expect(render(dossier({ completionAssessment: assessment() }))).not.toContain('Still open')
  })

  it('offers a source link only where a public page exists for that identifier', () => {
    const markup = render(dossier({ completionAssessment: assessment() }))

    expect(markup).toContain(
      'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=55d703ca-ff9d-0dbc-e063-6294a90ab6b1',
    )
    expect(markup).toContain('https://clinicaltrials.gov/study/NCT01234567')
    expect(markup).toContain('https://pubchem.ncbi.nlm.nih.gov/compound/94335')
    /* A search record names a search space, not a document, so it stays text. */
    expect(markup).toContain('PubMed search pubmed:2026-09-01:example')
    expect(markup).not.toContain('href="pubmed:2026-09-01:example"')
  })

  it('keeps machine field paths and raw codes out of the reader-facing list', () => {
    const markup = render(dossier({ completionAssessment: assessment() }))
    const beforeDisclosure = markup.slice(0, markup.indexOf('<details'))

    expect(beforeDisclosure).not.toContain('recordedBackground.registryIdentifiers.unii')
    expect(beforeDisclosure).not.toContain('NO_QUALIFYING_EVIDENCE_AFTER_SEARCH')
    expect(beforeDisclosure).not.toContain('EXACT_STRUCTURED_SOURCE_DATA')
    expect(beforeDisclosure).toContain('FDA substance code TR046Y3K1G')
    /* A count is shown in words rather than as its storage key. */
    expect(beforeDisclosure).toContain('2 registry identifiers recorded')
    expect(beforeDisclosure).not.toContain('registryIdentifiers')
  })

  it('shows the human-read suggestion as an invitation, not as a gap in the medicine', () => {
    const markup = render(dossier({ completionAssessment: assessment() }))
    expect(markup).toContain('A person could add more by reading the named source.')
  })

  it('keeps the technical record closed until a reader opens it', () => {
    const markup = render(dossier({ completionAssessment: assessment() }))

    expect(markup).toContain('Technical record: state codes and digests')
    expect(markup).toContain('dossier-completion/v1')
    expect(markup).toContain('identity · EXACT_STRUCTURED_SOURCE_DATA')
    expect(markup).toContain('a'.repeat(64))
    expect(markup).not.toMatch(/<details[^>]*\sopen/)
  })

  it('states how the identity resolved without naming or linking another record', () => {
    const markup = render(
      dossier({
        completionAssessment: assessment(),
        inventoryResolution: resolution({
          identifierSharedWithOtherRecords: true,
          canonicalSlug: 'a-second-record-slug',
          redirectTargetSlug: 'a-second-record-slug',
        }),
      }),
    )

    expect(markup).toContain('This name is kept as its own record.')
    expect(markup).toContain('Identity rests on at least one recorded registry identifier.')
    expect(markup).toContain(
      'A registry identifier on this record also appears on other records; the records are kept separate and are not joined here.',
    )
    expect(markup).not.toContain('a-second-record-slug')
    expect(markup).not.toContain('/d/')
  })

  it('says nothing about a shared identifier when none is recorded', () => {
    const markup = render(
      dossier({ completionAssessment: assessment(), inventoryResolution: resolution() }),
    )
    expect(markup).not.toContain('also appears on other records')
    expect(markup).toContain('This name is kept as its own record.')
  })

  it('keeps one heading level and unique anchors', () => {
    const sections = everyStateSections()
    const markup = render(
      dossier({
        completionAssessment: assessment({
          status: 'INCOMPLETE',
          sections,
          applicableSectionCount: sections.length,
          terminalSectionCount: sections.filter((entry) => entry.terminal).length,
        }),
      }),
    )

    expect(markup).toMatch(/<h3[^>]*id="record-completeness-heading"/)
    expect(markup).not.toMatch(/<h[12][\s>]/)
    expect(markup.indexOf('<h3')).toBeLessThan(markup.indexOf('<h4'))

    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(ids.length).toBeGreaterThan(sections.length)
    expect(new Set(ids).size).toBe(ids.length)
    /* Section anchors are namespaced, so they cannot collide with the page's own section ids. */
    for (const entry of sections) {
      expect(ids).toContain(`record-completeness-${entry.id}`)
    }
  })
})
