import { describe, expect, it } from 'vitest'

import {
  countDossierSectionsWithContent,
  dossierSectionHasContent,
} from '@/components/dossier/DossierSectionNavigator'
import { dossierNavigatorSections } from '@/lib/dossier-navigator-sections'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

/**
 * The navigator is the first thing a reader can act on, so the property that matters is not that it
 * lists sections but that it never lies about which ones are worth visiting. A row marked as holding
 * content that turns out to be empty spends the reader's trust once and does not get it back.
 */

function dossier(overrides: Partial<MedicineDossierViewModel> = {}): MedicineDossierViewModel {
  return {
    slug: 'example',
    name: 'Example medicine',
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

function completionAssessment(
  status: 'COMPLETE' | 'INCOMPLETE',
): NonNullable<MedicineDossierViewModel['completionAssessment']> {
  return {
    status,
    statusCopy: 'Section states are recorded for this record.',
    resolverVersion: 'dossier-completion/v1',
    inputDigest: 'f'.repeat(64),
    contentChangedAt: '2026-09-02T00:00:00.000Z',
    assessedAt: '2026-09-02T00:00:00.000Z',
    applicableSectionCount: 1,
    terminalSectionCount: status === 'COMPLETE' ? 1 : 0,
    sections: [],
  }
}

describe('the navigator reports coverage rather than assuming it', () => {
  it('marks every section not documented on a record that holds nothing', () => {
    const sections = dossierNavigatorSections(dossier())
    expect(sections.length).toBeGreaterThan(20)
    expect(sections.every((section) => section.coverage === 'not_documented')).toBe(true)
  })

  it('marks a section answered exactly when the record holds it', () => {
    const sections = dossierNavigatorSections(
      dossier({
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-28',
            recordedUses: {
              statements: [
                {
                  text: 'For an example use.',
                  source: {
                    kindLabel: 'FDA label',
                    identifier: 'e2e',
                    label: 'Example label',
                    retrievedAt: '2026-08-28',
                  },
                },
              ],
            },
          },
        } as MedicineDossierViewModel['medicineRecord'],
      }),
    )
    const uses = sections.find((section) => section.id === 'recorded-uses')
    const mechanism = sections.find((section) => section.id === 'recorded-mechanism')
    expect(uses?.coverage).toBe('answered')
    expect(mechanism?.coverage).toBe('not_documented')
  })

  it('does not treat an empty array as content', () => {
    // The failure this prevents: a module present but empty would offer a row that scrolls to a
    // heading with nothing under it, which reads as a broken link rather than an honest absence.
    const sections = dossierNavigatorSections(
      dossier({
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-28',
            productVariants: [],
            anatomyTargets: [],
          },
        } as MedicineDossierViewModel['medicineRecord'],
      }),
    )
    expect(sections.find((section) => section.id === 'where-it-acts-map')?.coverage).toBe(
      'not_documented',
    )
  })

  /**
   * The state the corpus exists to carry. Independent manufacturer labels printing numbers that do
   * not overlap is the strongest thing this record can say, and before the navigator it was
   * reachable only by scrolling into the right module.
   */
  it('surfaces a source disagreement as conflicting, with its count', () => {
    const sections = dossierNavigatorSections(
      dossier({
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-28',
            pharmacokinetics: { routeAsRecorded: 'Oral', values: [] },
            sourceConsensus: {
              documentsExaminedLabel: '31 published labels were read for this medicine',
              fields: [
                {
                  field: 'halfLife',
                  fieldLabel: 'Half-life',
                  agreementLabel: '97% of the labels stating it give the most common reading',
                  disagreementNote:
                    'Two of these readings give numbers that do not overlap. Both are recorded as printed; neither is marked wrong here.',
                  readings: [],
                },
                {
                  field: 'volumeOfDistribution',
                  fieldLabel: 'Volume of distribution',
                  agreementLabel: '100% of the labels stating it give the most common reading',
                  readings: [],
                },
              ],
            },
          },
        } as MedicineDossierViewModel['medicineRecord'],
      }),
    )
    const consensus = sections.find((section) => section.id === 'what-every-label-says')
    expect(consensus?.coverage).toBe('conflicting')
    expect(consensus?.count).toBe(1)
  })

  it('never marks a section conflicting when it holds no content', () => {
    // A disagreement counted elsewhere in the record must not colour an empty section, or the
    // navigator would send a reader to an absence flagged as the most interesting thing on the page.
    const sections = dossierNavigatorSections(
      dossier({
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-28',
            sourceConsensus: {
              documentsExaminedLabel: '4 published labels were read for this medicine',
              fields: [
                {
                  field: 'halfLife',
                  fieldLabel: 'Half-life',
                  agreementLabel: '',
                  disagreementNote: 'x',
                  readings: [],
                },
              ],
            },
          },
        } as MedicineDossierViewModel['medicineRecord'],
      }),
    )
    /* pharmacokinetics is absent, so its row stays an honest absence despite the conflict count. */
    expect(sections.find((section) => section.id === 'after-a-dose')?.coverage).toBe(
      'not_documented',
    )
  })

  it('emits only states it can actually determine', () => {
    // A dossier-wide timestamp cannot identify which exact assertion drifted. Restricted content is
    // absent from this public view altogether, so neither state may be guessed here.
    const sections = dossierNavigatorSections(dossier({ freshness: 'stale' }))
    expect(sections.some((section) => section.coverage === 'stale')).toBe(false)
    expect(sections.some((section) => section.coverage === 'restricted')).toBe(false)
  })

  it('keeps exact persisted drift reachable and counted as recorded content', () => {
    const sections = dossierNavigatorSections(
      dossier({
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-31',
            sourceConsensus: {
              documentsExaminedLabel: 'One saved source was checked',
              fields: [],
            },
            driftedSources: [
              {
                bindingId: `background_binding_${'a'.repeat(64)}`,
                assertionCheckId: 'b'.repeat(64),
                intent: 'measurement',
                sourceIdentifier: 'source-1',
                sourceLabel: 'Saved source',
                recordedAt: '2026-08-31',
                freshnessState: 'drifted',
                fieldPath: 'pharmacokinetics.halfLife',
              },
            ],
          },
        },
      }),
    )
    const consensus = sections.find((section) => section.id === 'what-every-label-says')

    expect(consensus?.coverage).toBe('stale')
    expect(consensus?.issues).toEqual(['stale'])
    expect(consensus && dossierSectionHasContent(consensus)).toBe(true)
    expect(countDossierSectionsWithContent(sections)).toBe(1)
  })

  it('gives every section a unique anchor, so no two rows fight over the same destination', () => {
    const ids = dossierNavigatorSections(dossier()).map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  /**
   * The completeness section exists only where an assessment does, so the row must not be offered
   * on a record without one: it would scroll to an anchor the page never rendered.
   */
  it('offers the completeness row only when the record carries an assessment', () => {
    expect(
      dossierNavigatorSections(dossier()).some((section) => section.id === 'record-completeness'),
    ).toBe(false)

    const complete = dossierNavigatorSections(
      dossier({ completionAssessment: completionAssessment('COMPLETE') }),
    ).find((section) => section.id === 'record-completeness')
    expect(complete?.label).toBe('How complete this record is')
    expect(complete?.coverage).toBe('answered')

    const incomplete = dossierNavigatorSections(
      dossier({ completionAssessment: completionAssessment('INCOMPLETE') }),
    ).find((section) => section.id === 'record-completeness')
    expect(incomplete?.coverage).toBe('not_documented')
  })

  /**
   * The registrations section renders only where the registry pass matched something, so the row
   * is offered only then; a record whose pass matched nothing says so in the completeness section.
   */
  it('offers the registered-trials row only when the record carries matched registrations', () => {
    expect(
      dossierNavigatorSections(dossier()).some((section) => section.id === 'registered-trials'),
    ).toBe(false)

    const study = {
      nctId: 'NCT00000001',
      briefTitle: null,
      overallStatus: 'COMPLETED',
      studyType: null,
      phases: [],
      hasResults: false,
      resultsFirstPostDate: null,
      startDate: null,
      primaryCompletionDate: null,
      completionDate: null,
      lastUpdatePostDate: null,
      whyStopped: null,
      enrollment: { count: null, type: null },
      leadSponsor: { name: null, class: null },
      conditions: [],
      matchedInterventionNames: [],
      eligibility: {
        sex: null,
        minimumAge: null,
        maximumAge: null,
        stdAges: [],
        healthyVolunteers: null,
      },
      primaryOutcomes: [],
      design: { allocation: null, masking: null, primaryPurpose: null },
    }
    const row = dossierNavigatorSections(
      dossier({
        trialRegistrations: {
          sourceIdentifier: 'clinicaltrials.gov/api/v2 studies snapshot 2026-09-01T09:00:05',
          snapshotDate: '2026-09-01',
          searchedAt: '2026-09-02T00:00:00.000Z',
          matchedNames: ['Example medicine'],
          totalMatched: 12,
          storedCount: 12,
          withPostedResults: 0,
          shown: [study],
          shownLimit: 8,
        },
      }),
    ).find((section) => section.id === 'registered-trials')
    expect(row?.label).toBe('Registered clinical trials')
    expect(row?.coverage).toBe('answered')
    expect(row?.count).toBe(12)
  })

  it('labels sections in plain language, never as a field name or an enum', () => {
    for (const section of dossierNavigatorSections(dossier())) {
      expect(section.label).not.toMatch(/[A-Z]{3,}|_|\bAsRecorded\b|[a-z][A-Z]/u)
      expect(section.label.length).toBeGreaterThan(3)
    }
  })
})
