import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MedicineDossierV2 } from '@/components/MedicineDossierV2'
import { AppProvider } from '@/components/app-context'
import type { DossierDynamicModulesView } from '@/lib/dossier-dynamic-modules'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import {
  buildLegacyReaderSummary,
  buildPublishedProgrammeReaderSummary,
} from '@/lib/public-medicine-language'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function view(overrides: Partial<MedicineDossierViewModel> = {}): MedicineDossierViewModel {
  const bindingState = overrides.bindingState ?? 'programme_unpublished'
  const verdict = overrides.verdict ?? ''
  const defaultTakeaway =
    verdict || 'No reviewed plain-language answer has been published for this use.'
  return {
    slug: 'synthetic-medicine',
    name: 'Synthetic Medicine',
    modality: 'Synthetic modality',
    approvalStatus: 'Active',
    programmes: [
      {
        id: 'programme-a',
        label: 'Programme A',
        status: 'Active',
        href: '?programme=programme-a',
        selected: true,
      },
    ],
    selectedProgrammeId: 'programme-a',
    selectedProgrammeLabel: 'Programme A',
    selectedProgrammeStatus: 'Active',
    bindingState: 'programme_unpublished',
    verdict: '',
    mechanismSummary: {},
    tenSecondWordCount: 0,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: 'Audit not completed',
    review: { historyHref: '/d/synthetic-medicine/history' },
    machineFindingCodes: ['PROGRAMME_VERDICT_NOT_PUBLISHED'],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
    ...overrides,
    statusBadge: overrides.statusBadge ?? { kind: 'programme_status', value: 'Active' },
    readerSummary: overrides.readerSummary ?? {
      basis:
        bindingState === 'legacy_record'
          ? 'older_record'
          : bindingState === 'published_programme'
            ? 'published_programme'
            : 'unpublished_programme',
      usedFor: 'Used or studied for Programme A.',
      ...(verdict ? { whatStudiesFound: verdict } : {}),
      takeaway: defaultTakeaway,
      ...(verdict ? { exactText: verdict } : {}),
      simplified: false,
      contextItems: [],
    },
  }
}

function renderDossier(dossier: MedicineDossierViewModel): string {
  return renderToStaticMarkup(
    React.createElement(
      AppProvider,
      { initialUser: null } as React.ComponentProps<typeof AppProvider>,
      React.createElement(MedicineDossierV2, { dossier }),
    ),
  )
}

function dynamicModules(overrides: Partial<DossierDynamicModulesView>): DossierDynamicModulesView {
  const absent = { status: 'absent' as const, reason: 'not_recorded' as const }
  return {
    outcomeComparison: absent,
    safety: absent,
    pharmacokinetics: absent,
    programmeFailure: absent,
    productsAndForms: absent,
    reportedCosts: absent,
    bodyMap: absent,
    ...overrides,
  }
}

function markupFromTestId(html: string, testId: string, endMarker: string): string {
  const start = html.indexOf(`data-testid="${testId}"`)
  if (start === -1) throw new Error(`Missing data-testid=${testId}`)
  const end = html.indexOf(endMarker, start)
  if (end === -1) throw new Error(`Missing ${endMarker} after data-testid=${testId}`)
  return html.slice(start, end + endMarker.length)
}

function populatedMedicineRecord(): MedicineDossierViewModel['medicineRecord'] {
  return {
    condition: {
      conditionExplainer:
        'ThisBackgroundWordIsDeliberatelyLongEnoughToTestNarrowScreenWrapping without changing the stored wording.',
      whyItMatters: 'The older record explains why the condition matters.',
      whoWasApprovedOrStudied: 'The older record names the people studied.',
      studyOrLabelGoal: 'The older record names the result the study or label aimed to change.',
    },
    safetyAndAdministration: {
      deliveryForm: 'A recorded prefilled injection device',
      administrationAndDosing:
        'A healthcare professional gives the recorded dose under the skin on the saved schedule.',
      safetyInformation:
        'The older record names a serious allergic reaction, common injection-site reactions, and who should not receive another dose.',
    },
    pricing: {
      reportedProductionCost: 'A reported production-cost estimate',
      reportedRetailOrListPrice:
        'A very long reported price value that must wrap safely on a narrow screen',
      recordNote: 'A stored note explains the older price context.',
      sources: [
        {
          label: 'Example public price file',
          identifier: 'https://example.test/prices',
          href: 'https://example.test/prices',
        },
      ],
      reports: [
        {
          kind: 'reported_production_cost',
          value: 'A reported production-cost estimate',
          source: {
            label: 'Example public price file',
            identifier: 'https://example.test/prices',
            href: 'https://example.test/prices',
          },
        },
        {
          kind: 'reported_retail_or_list_price',
          value: 'A very long reported price value that must wrap safely on a narrow screen',
          source: {
            label: 'Example public price file',
            identifier: 'https://example.test/prices',
            href: 'https://example.test/prices',
          },
        },
      ],
    },
    alternativesSummary: 'The older record compares approaches used for the same broad goal.',
    conventionalAlternatives: [
      {
        name: 'Recorded conventional approach',
        className: 'A different treatment class',
        comparison: 'It was studied in a different setting.',
        reportedCost: 'A reported older cost',
        tradeoffs: 'The older record describes different tradeoffs.',
      },
    ],
    foodSupplementContext: [
      {
        name: 'Zinc-containing food entry',
        recordedEvidenceLabel: 'Legacy evidence label B',
        sourceStatus: 'not_linked',
      },
      {
        name: 'Apple pectin entry',
        recordedEvidenceLabel: 'Legacy evidence label A',
        sourceStatus: 'not_linked',
      },
    ],
    commonQuestions: [
      {
        question: 'A recorded medicine-wide question?',
        answer: 'A recorded medicine-wide answer.',
      },
    ],
    molecular: {
      format: 'Small-molecule structure string (SMILES, a text description of a molecule)',
      identifiers: [
        {
          label: 'Structure string (SMILES, a text description of a molecule)',
          value: 'VERYLONGMOLECULARIDENTIFIERWITHOUTSPACES012345678901234567890123456789',
          kind: 'smiles',
        },
      ],
      structureCheck: 'passed',
      checkedAt: '2026-08-20T00:00:00.000Z',
    },
    communityNotes: [
      {
        id: 'note-1',
        author: 'Example Clinician',
        role: 'Community member',
        date: '2026-08-20T00:00:00.000Z',
        content:
          'ThisCommunityCommentaryContainsAReallyLongUnbrokenTokenForMobileWrapping0123456789.',
        upvotes: 2,
      },
    ],
  }
}

describe('MedicineDossierV2 server markup', () => {
  it('renders one closed disclosure with crawlable advanced content and hides empty modules', () => {
    const html = renderDossier(view())

    expect(html.match(/See how we know/g)).toHaveLength(1)
    expect(html).toContain('<details class="group pt-2">')
    expect(html).toContain('id="advanced-evidence-content"')
    expect(html).toContain('Behind the answer')
    expect(html).toContain('No reviewed plain-language answer has been published for this use')
    expect(html).toContain(
      'RNAWiki has found a specific use and its studies, but reviewers have not published an answer yet.',
    )
    expect(html).not.toContain('a development programme')
    expect(html).toContain('Missing sections are left blank instead of being filled with claims')
    expect(html).toContain('Technical check codes')
    expect(html).not.toContain('Programme-level evidence audit')
    expect(html).not.toContain('No substitute content is generated')
    expect(html).not.toContain('Evidence chain</p>')
    expect(html).not.toContain('Could the study answer this question?')
    expect(html).not.toContain('Most important results')
    expect(html).not.toContain('How the medicine works')
    expect(html).not.toContain('Recorded dates for studies and RNAWiki review')
    expect(html).not.toContain('What researchers hoped would happen')
    expect(html).not.toContain('Older medicine record')
    expect(html).not.toContain('Cost and practical context')
    expect(html).toContain('Add a community note')
    expect(html).not.toContain('No community commentary has been posted')
    expect(html).not.toContain('Notes from readers and clinicians')
    expect(html).not.toMatch(/laboratory|synthesis instructions|protocol steps/i)
    expect(html).toContain('Suggest a correction')
    expect(html).not.toContain('Save medicine')
    expect(html).toContain('data-testid="ten-second-answer"')
    expect(html.indexOf('data-testid="ten-second-answer"')).toBeLessThan(
      html.indexOf('See how we know'),
    )
    const disclosureTriggerIndex = html.indexOf('See how we know')
    const disclosureContentIndex = html.indexOf('id="advanced-evidence-content"')
    const audienceLensIndex = html.indexOf('data-testid="dossier-audience-lenses"')
    const exactSourceBindingIndex = html.indexOf('Exact source binding')
    expect(disclosureContentIndex).toBeGreaterThan(disclosureTriggerIndex)
    expect(audienceLensIndex).toBeGreaterThan(disclosureContentIndex)
    expect(exactSourceBindingIndex).toBeGreaterThan(audienceLensIndex)
    expect(html.slice(0, disclosureContentIndex)).not.toContain('Choose a reading lens')
    expect(html.slice(0, disclosureContentIndex)).not.toContain('Exact source binding')
    expect(html).not.toContain('data-testid="dossier-local-navigation"')
    expect(html.indexOf('See how we know')).toBeLessThan(html.indexOf('Behind the answer'))
    expect(html).not.toContain('data-testid="main-takeaway-card"')
    expect(html).not.toContain('from-[#EAF4FF]')
    expect(html).not.toContain('Challenge this answer')
    expect(html).toContain('What needs changing?')
    expect(html).toContain('Which use of this medicine does it apply to?')
    expect(html).toContain('What should the record say?')
    expect(html).toContain('Where did you find this?')
    expect(html).toContain('Save draft')
    expect(html).toContain('Submit for review')
  })

  it('keeps source-bound safety and movement-through-body modules reachable on their own', () => {
    const linkedSource = {
      id: 'source-1',
      label: 'Exact reviewed source',
      href: 'https://example.test/exact-source',
      freshness: 'current' as const,
    }
    const safetyHtml = renderDossier(
      view({
        sources: [linkedSource],
        dynamicModules: dynamicModules({
          safety: {
            status: 'ready',
            data: {
              scope: 'selected_programme',
              withheldFindingCount: 0,
              findings: [
                {
                  id: 'safety-claim',
                  statement: 'A reviewed safety finding.',
                  claimNature: 'MEASURED',
                  direction: 'UNKNOWN',
                  sourceIds: ['source-1'],
                  sourceClaimBindings: [
                    {
                      sourceId: 'source-1',
                      claimId: 'safety-claim',
                      relationship: 'SUPPORTS',
                      statement: 'A reviewed safety finding.',
                    },
                  ],
                },
              ],
            },
          },
        }),
      }),
    )

    expect(safetyHtml).toContain('id="study-measurements"')
    expect(safetyHtml).toContain('id="selected-programme-safety"')

    const pharmacokineticsHtml = renderDossier(
      view({
        sources: [linkedSource],
        dynamicModules: dynamicModules({
          pharmacokinetics: {
            status: 'ready',
            data: {
              scope: 'selected_programme',
              presentation: 'independent_findings',
              chronology: 'not_established',
              withheldFindingCount: 0,
              findings: [
                {
                  id: 'pk-claim',
                  statement: 'A reviewed movement-through-body finding.',
                  timepoint: 'Stored time label',
                  direction: 'UNKNOWN',
                  sourceIds: ['source-1'],
                  sourceClaimBindings: [
                    {
                      sourceId: 'source-1',
                      claimId: 'pk-claim',
                      relationship: 'SUPPORTS',
                      statement: 'A reviewed movement-through-body finding.',
                    },
                  ],
                },
              ],
            },
          },
        }),
      }),
    )

    expect(pharmacokineticsHtml).toContain('id="mechanism-map"')
    expect(pharmacokineticsHtml).toContain('id="pharmacokinetics"')
    expect(pharmacokineticsHtml).toContain('What happened after it was given?')
  })

  it('shows the reviewed narrative and a source-linked decision timeline for a published programme', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A reviewed programme conclusion.',
        mechanismSummary: {
          change: 'Researchers expected the medicine to lower a recorded target.',
          observed: 'The reviewed study recorded a lower target.',
        },
        studies: [
          {
            id: 'NCT00000001',
            title: 'Synthetic dated study',
            phase: 'Phase 2',
            status: 'Active not recruiting',
            studyType: 'Human study',
            startDate: '2024-02-03',
            completionDate: '2026-08-09',
            sampleSize: 240,
            enrolmentType: 'ACTUAL',
            result: 'A recorded result for the selected use.',
            state: 'measured',
            registrySourceId: 'registry-snapshot-1',
            sourceIds: ['registry-snapshot-1', 'result-source-1'],
          },
        ],
        timelineEvents: [
          {
            id: 'result-posted',
            date: '2026-08-09',
            provenance: 'source',
            eventType: 'IMPORTANT_RESULT',
            dateBasis: 'ACTUAL',
            title: 'Results changed the programme record',
            description: 'The registry posted the result used in the reviewed conclusion.',
            technicalDetail: 'The stored registry results section changed on this date.',
            programmeTrialId: 'NCT00000001',
            claimIds: ['claim-result-1'],
            sourceIds: ['registry-snapshot-1'],
          },
          {
            id: 'rnawiki-publication-1',
            date: '2026-08-22T09:30:00.000Z',
            provenance: 'rnawiki',
            eventType: 'PUBLICATION',
            title: 'RNAWiki published reviewed conclusion 1',
            description: 'This version became the public reviewed record.',
            claimIds: [],
            sourceIds: [],
          },
        ],
        sources: [
          {
            id: 'registry-snapshot-1',
            label: 'Exact registry source for the dated study',
            href: 'https://example.test/registry/NCT00000001',
            identifier: 'NCT00000001',
            freshness: 'current',
          },
          {
            id: 'result-source-1',
            label: 'Exact source for a reported result',
            href: 'https://example.test/publication/result-1',
            identifier: 'RESULT-1',
            freshness: 'current',
          },
        ],
        review: {
          reviewedAt: '2026-08-22T09:30:00.000Z',
          historyHref: '/d/synthetic-medicine/programme/programme-a/history',
        },
        conclusion: {
          publicLabel: 'A reviewed programme conclusion',
          professionalLabel: 'Synthetic clinical classification',
          reason: 'The linked measurement supports the limited programme conclusion.',
          scope: {
            indication: 'Synthetic indication',
            population: 'Synthetic population',
            doseExposure: 'Synthetic dose',
            period: 'Synthetic period',
            trials: 'NCT00000001',
            outcome: 'Synthetic outcome',
          },
          whatWasDisproven: [],
          whatWasNotDisproven: [],
          whatRemainsUnknown: [],
          confidence: 'Moderate',
          conditionsThatWouldChangeVerdict: [],
          authorName: 'Synthetic Author',
          authorHandle: 'synthetic-author',
          conflictsOfInterest: 'A synthetic consultancy relationship was declared.',
          independentReviewCount: 1,
          reviewers: [
            {
              id: 'reviewer-1',
              name: 'Synthetic Reviewer',
              orcid: '0000-0001-2345-6789',
              expertiseTags: ['CLINICAL_PHARMACOLOGY', 'BIOSTATISTICS'],
              decision: 'Approved',
              reviewedAt: '2026-08-21T00:00:00.000Z',
              independent: true,
            },
          ],
        },
      }),
    )

    expect(html).not.toContain('What researchers hoped would happen')
    expect(html).not.toContain('data-testid="first-read-mechanism"')
    expect(html).toContain('id="how-it-works"')
    expect(html).toContain('id="who-was-studied"')
    expect(html).toContain('id="review-history"')
    expect(html).not.toContain('data-testid="published-trust-surface"')
    const reviewDetails = markupFromTestId(html, 'conclusion-review-details', '</section>')
    expect(reviewDetails).toContain('Who reviewed this answer?')
    expect(reviewDetails).toContain('Synthetic Reviewer')
    expect(reviewDetails).toContain('Synthetic Author')
    expect(reviewDetails).toContain('@synthetic-author')
    expect(reviewDetails).toContain('saved author name: Synthetic Author')
    expect(reviewDetails).toContain('Conflicts of interest')
    expect(reviewDetails).not.toContain('No conflicts')
    expect(html).toContain('href="/d/synthetic-medicine/programme/programme-a/history"')
    expect(html).toContain('See what changed on this page')
    expect(html).toContain('Researchers expected the medicine to lower a recorded target.')
    expect(html).not.toContain('What the reviewed evidence supports')
    expect(html).toContain('The reviewed study recorded a lower target.')
    expect(html).not.toContain('Why the reviewers reached this conclusion')
    expect(html).toContain('The linked measurement supports the limited programme conclusion.')
    expect(html).toContain('RNAWiki review areas recorded for this decision:')
    expect(html).toContain(
      'Saved reviewer name: Synthetic Reviewer. This reviewer approved this conclusion independently on 21 August 2026.',
    )
    expect(html).toContain('aria-label="Conclusion review records"')
    expect(html).toContain('href="/u/synthetic-author"')
    expect(html).not.toContain('aria-label="Independent conclusion reviewers"')
    expect(html).not.toContain('Synthetic Reviewer</span> · Approved')
    expect(html).toContain('How medicines work in people (clinical pharmacology)')
    expect(html).toContain('Medical statistics')
    expect(html).not.toContain('CLINICAL_PHARMACOLOGY')
    expect(html).not.toContain('BIOSTATISTICS')
    expect(html).toContain('ORCID supplied by this account: 0000-0001-2345-6789')
    expect(html).toContain('href="https://orcid.org/0000-0001-2345-6789"')
    expect(html).toContain('Events that changed what happened next')
    expect(html).toContain('data-testid="programme-decision-timeline"')
    expect(html).toContain('data-testid="timeline-event-source-links"')
    expect(html).toContain('How many studies have results here?')
    expect(html).toContain('1</dd>')
    expect(html).toContain('240 participants across 1 study')
    expect(html).toContain('People enrolled in studies with results')
    expect(html).toContain('Actual count:')
    expect(html).toContain('240 across 1 study')
    expect(html).not.toContain('Reported enrolment total')
    const recordedStudyDesign = markupFromTestId(html, 'recorded-study-design', '</p>')
    expect(recordedStudyDesign).toContain('Phase 2')
    expect(recordedStudyDesign).toContain('· Human study')
    expect(recordedStudyDesign).not.toContain('data-context-key=')
    expect(html).toContain('They do not by themselves prove that the medicine is safe or helpful')
    expect(html).toContain('Results changed the programme record')
    expect(html).toContain('The registry posted the result used in the reviewed conclusion.')
    expect(html).toContain('Important result')
    expect(html).toContain('Date occurred')
    expect(html).toContain('Technical detail')
    expect(html).toContain('2026-08-09')
    expect(html).toContain('RNAWiki published reviewed conclusion 1')
    expect(html).toContain('Page update · not a study result')
    expect(html).not.toContain('Recorded start date · Synthetic dated study')
    expect(html).not.toContain('Recorded completion date · Synthetic dated study')
    const registryHref = 'href="https://example.test/registry/NCT00000001"'
    const resultHref = 'href="https://example.test/publication/result-1"'
    const sourceEvent = html.indexOf('Results changed the programme record')
    const sourceEventEnd = html.indexOf('</li>', sourceEvent)
    expect(html.slice(sourceEvent, sourceEventEnd)).toContain(registryHref)
    expect(html.slice(sourceEvent, sourceEventEnd)).not.toContain(resultHref)
    const publicationEvent = html.indexOf('RNAWiki published reviewed conclusion 1')
    const publicationEventEnd = html.indexOf('</li>', publicationEvent)
    expect(html.slice(publicationEvent, publicationEventEnd)).not.toContain('<a ')
  })

  it('keeps absent published trust facts unknown instead of fabricating reviewers, dates or conflicts', () => {
    const historyHref = '/d/synthetic-medicine/programme/programme-a/history'
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        review: { historyHref },
        conclusion: {
          publicLabel: 'A reviewed programme conclusion',
          professionalLabel: 'Synthetic clinical classification',
          reason: 'A recorded reason.',
          scope: {
            indication: 'Synthetic indication',
            population: 'Synthetic population',
            doseExposure: 'Synthetic dose',
            period: 'Synthetic period',
            trials: 'No trial list recorded',
            outcome: 'Synthetic outcome',
          },
          whatWasDisproven: [],
          whatWasNotDisproven: [],
          whatRemainsUnknown: [],
          confidence: 'Unknown',
          conditionsThatWouldChangeVerdict: [],
          authorName: 'Recorded Author',
          independentReviewCount: 0,
          reviewers: [],
        },
      }),
    )

    const reviewDetails = markupFromTestId(html, 'conclusion-review-details', '</section>')
    expect(reviewDetails).toContain('Recorded Author')
    expect(reviewDetails).toContain('No public reviewer record is available on this page.')
    expect(reviewDetails).not.toContain('Conflicts of interest')
    expect(reviewDetails).not.toContain('No conflicts declared')
    expect(reviewDetails).not.toContain('No conflicts of interest')
    expect(html).toContain(`href="${historyHref}"`)
    expect(html).not.toContain('data-testid="published-trust-surface"')
  })

  it('hides the whole timeline, including RNAWiki events, when no source event has an exact link', () => {
    const html = renderDossier(
      view({
        studies: [
          {
            id: 'UNSOURCED-STUDY',
            title: 'An unsourced dated study',
            startDate: '2024-01-01',
            completionDate: '2025-01-01',
            state: 'unknown',
            registrySourceId: 'missing-source-record',
            sourceIds: ['missing-source-record'],
          },
        ],
        timelineEvents: [
          {
            id: 'unsourced-event',
            date: '2025-01-01',
            provenance: 'source',
            eventType: 'PROGRAMME_MILESTONE',
            dateBasis: 'ACTUAL',
            title: 'Unlinked programme event',
            description: 'This must not be shown without its exact source.',
            claimIds: ['claim-1'],
            sourceIds: ['missing-source-record'],
          },
          {
            id: 'administrative-event',
            date: '2025-01-02',
            provenance: 'rnawiki',
            eventType: 'PUBLICATION',
            title: 'RNAWiki publication without a sourced timeline anchor',
            description: 'This must remain hidden with the timeline.',
            claimIds: [],
            sourceIds: [],
          },
        ],
      }),
    )

    expect(html).not.toContain('Events that changed what happened next')
    expect(html).not.toContain('Unlinked programme event')
    expect(html).not.toContain('RNAWiki publication without a sourced timeline anchor')
  })

  it('renders a source-linked mechanism as one ordered map with plain evidence-basis labels', () => {
    const mechanismSource = {
      id: 'mechanism-snapshot-1',
      label: 'Exact saved mechanism source',
      href: 'https://example.test/mechanism/source-1',
      identifier: 'MECH-1',
      freshness: 'current' as const,
    }
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A reviewed programme conclusion.',
        mechanismSteps: [
          {
            id: 'delivery',
            order: 1,
            title: 'The medicine reaches liver cells',
            plainLanguage: 'The reviewed source recorded uptake into the intended cells.',
            technicalDetail: 'A stored technical uptake measurement.',
            evidenceBasis: 'MEASURED_IN_PEOPLE',
            claimIds: ['claim-delivery'],
            sourceIds: ['mechanism-snapshot-1'],
            sourceClaimBindings: [
              {
                sourceId: 'mechanism-snapshot-1',
                claimId: 'claim-delivery',
                relationship: 'QUALIFIES',
                statement: 'This saved source adds context to the delivery statement.',
              },
            ],
          },
          {
            id: 'target',
            order: 2,
            title: 'It changes the intended target',
            plainLanguage: 'Experiments outside people measured the target change.',
            evidenceBasis: 'MEASURED_OUTSIDE_PEOPLE',
            claimIds: ['claim-target'],
            sourceIds: ['mechanism-snapshot-1'],
          },
          {
            id: 'outcome',
            order: 3,
            title: 'A later effect is expected',
            plainLanguage:
              'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower with the medicine than with a dummy treatment.',
            evidenceBasis: 'PREDICTED',
            claimIds: ['claim-outcome'],
            sourceIds: ['mechanism-snapshot-1'],
          },
        ],
        sources: [mechanismSource],
      }),
    )

    expect(html).toContain('aria-label="Ordered mechanism stages"')
    expect(html).toContain('data-testid="programme-mechanism-map"')
    expect(html.match(/data-testid="programme-mechanism-stage"/g)).toHaveLength(3)
    expect(html.match(/data-testid="mechanism-evidence-basis"/g)).toHaveLength(3)
    expect(html.match(/data-testid="mechanism-stage-source-links"/g)).toHaveLength(3)
    expect(html).toContain('52.3 percentage points lower')
    expect(html).not.toContain('data-context-key=')
    expect(html).toContain('aria-label="Ordered mechanism stages"')
    expect(html).not.toMatch(/aria-label="Ordered mechanism stages"[^>]*grid-cols/)
    expect(html).toContain('This step was measured in people')
    expect(html).toContain('This step was measured only in laboratory or non-human work')
    expect(html).toContain('This step is still a prediction')
    expect(html).not.toContain('Evidence: Measured in people')
    expect(html).toContain(
      'Each card shows one expected step. Its label says whether people, laboratory work, or neither has shown that step.',
    )
    expect(html).toContain('Human reviewers decide what the science means.')
    expect(html).toContain('Technical detail')
    expect(html).toContain('A stored technical uptake measurement.')
    expect(html).toContain('href="https://example.test/mechanism/source-1"')
    expect(html).toContain('Qualifies: This saved source adds context to the delivery statement.')
    expect(html).not.toContain('older steps have not been linked')
  })

  it('uses a neutral detailed-evidence heading for a stopped programme', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        selectedProgrammeStatus: 'Stopped',
        verdict: 'A reviewed answer for this stopped programme.',
      }),
    )

    expect(html).toContain('What the studies and sources showed before the research stopped')
    expect(html).not.toContain('What was actually disproven?')
  })

  it('clearly labels a general research mechanism map as not question-specific', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        mechanismSteps: [
          {
            id: 'legacy-step-1',
            order: 1,
            title: 'Older recorded step',
            plainLanguage: 'This wording came from the older medicine-wide record.',
            claimIds: [],
            sourceIds: [],
          },
        ],
      }),
    )

    expect(html).toContain('How researchers think it works')
    expect(html).toContain(
      'These possible steps were collected across studies. They have not been checked against one specific use or linked to the exact source for every statement.',
    )
    expect(html).not.toContain('Evidence:')
  })

  it('keeps dense research wording out of the static ten-second summary', () => {
    const longLegacySummary = Array.from(
      { length: 90 },
      (_, index) => `recorded-word-${index + 1}`,
    ).join(' ')
    const legacyHtml = renderDossier(
      view({
        bindingState: 'legacy_record',
        verdict: longLegacySummary,
        readerSummary: buildLegacyReaderSummary({
          medicineName: 'Synthetic Medicine',
          modality: 'Small Molecule',
          selectedUse: 'A synthetic use',
          exactText: longLegacySummary,
        }),
      }),
    )
    const reviewedHtml = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A reviewed answer.',
        readerSummary: buildPublishedProgrammeReaderSummary({
          medicineName: 'Synthetic Medicine',
          modality: 'Small Molecule',
          selectedUse: 'A synthetic use',
          exactText: 'A reviewed answer.',
          bestSupportedFinding: 'Researchers found a clear synthetic result.',
        }),
      }),
    )

    expect(legacyHtml).toContain('In 10 seconds')
    expect(legacyHtml).toContain(
      'A study result is available, but it still needs a short plain-language explanation.',
    )
    expect(legacyHtml).toContain(longLegacySummary)
    expect(reviewedHtml).toContain('What studies found')
    expect(reviewedHtml).toContain('Researchers found a clear synthetic result.')
  })

  it.each(['legacy_record', 'programme_unpublished', 'published_programme'] as const)(
    'keeps medicine-wide context outside the reviewed conclusion for %s dossiers',
    (bindingState) => {
      const html = renderDossier(
        view({
          bindingState,
          verdict: bindingState === 'published_programme' ? 'A reviewed programme conclusion.' : '',
          medicineRecord: populatedMedicineRecord(),
        }),
      )

      expect(html).toContain('aria-controls="medicine-background-content"')
      expect(html).toContain('More about this medicine')
      expect(html).toContain('General background about this medicine')
      expect(html).toContain(
        'This is general background. It may cover information beyond the selected use and is not part of the reviewed answer above.',
      )
      expect(html).toContain('The condition')
      expect(html).toContain('Who this information applies to')
      expect(html).toContain('What researchers or regulators wanted to find out')
      expect(html).toContain('Safety and how it is given')
      expect(html).toContain(
        'How it is given and the important safety information stored with this record.',
      )
      expect(html).toContain('Technical delivery name')
      expect(html).toContain('not personal medical advice or new dosing instructions')
      expect(html).toContain('A recorded prefilled injection device')
      expect(html).toContain(
        'A healthcare professional gives the recorded dose under the skin on the saved schedule.',
      )
      expect(
        html.indexOf(
          'A healthcare professional gives the recorded dose under the skin on the saved schedule.',
        ),
      ).toBeLessThan(html.indexOf('A recorded prefilled injection device'))
      expect(html).toContain('who should not receive another dose')
      expect(html).toContain('Other medical treatments for the same goal')
      expect(html).toContain('does not mean they are equivalent')
      expect(html).toContain('or that one should replace another')
      expect(html).toContain('The list is alphabetical, not a ranking')
      expect(html).toContain('Foods and supplements mentioned in this record')
      expect(html).toContain('Apple pectin entry')
      expect(html).toContain('Legacy evidence label A')
      expect(html).toContain('Source not yet linked')
      expect(html.indexOf('Apple pectin entry')).toBeLessThan(
        html.indexOf('Zinc-containing food entry'),
      )
      expect(html).toContain('Common questions')
      expect(html).toContain('not instructions for taking or changing')
      expect(html).toContain('Cost information')
      expect(html).toContain('Example public price file')
      expect(html).toContain('href="https://example.test/prices"')
      expect(html).toContain('Check each source')
      expect(html).toContain('date, place, exact product, and assumptions')
      expect(html).toContain('Technical identity')
      expect(html).toContain('internally consistent')
      expect(html).toContain('It does not show whether the medicine works or is safe')
      expect(html).toContain('Laboratory and manufacturing instructions are not displayed here')
      expect(html).toContain('Community commentary')
      expect(html).toContain('These are reader opinions. RNAWiki has not fact-checked them')
      expect(html).toContain('Post commentary')
      expect(html).toContain('Helpful · 2')
      expect(html).toContain('[overflow-wrap:anywhere]')
      expect(html).toContain('min-w-0')
      expect(html).not.toMatch(/home remedy|daily use|synthesis step|reagents/i)
      expect(html).not.toContain('A reported older cost')

      const advancedIndex = html.indexOf('id="advanced-evidence-content"')
      const backgroundIndex = html.indexOf('aria-controls="medicine-background-content"')
      const utilitiesIndex = html.indexOf('id="dossier-utilities-heading"')
      const communityIndex = html.indexOf('id="community-commentary"')
      expect(advancedIndex).toBeGreaterThanOrEqual(0)
      expect(backgroundIndex).toBeGreaterThan(advancedIndex)
      expect(utilitiesIndex).toBeGreaterThan(backgroundIndex)
      expect(communityIndex).toBeGreaterThan(utilitiesIndex)
      expect(html).toMatch(/<h2[^>]*>General background about this medicine<\/h2>/)
    },
  )

  it('keeps a safety-only older record reachable but closed and non-prescriptive', () => {
    const html = renderDossier(
      view({
        medicineRecord: {
          safetyAndAdministration: {
            administrationAndDosing: 'An exact saved administration schedule.',
            safetyInformation:
              'An exact saved serious-risk, common-effect, and contraindication statement.',
          },
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
        },
      }),
    )

    expect(html).toContain('More about this medicine')
    expect(html).toContain('<details id="safety-and-administration"')
    expect(html).toContain('An exact saved administration schedule.')
    expect(html).toContain('An exact saved serious-risk, common-effect, and ')
    expect(html).toContain('contraindication')
    expect(html).not.toContain('data-context-key=')
    expect(html).toContain('not personal medical advice or new dosing instructions')
    expect(html.indexOf('An exact saved administration schedule.')).toBeGreaterThan(
      html.indexOf('aria-controls="medicine-background-content"'),
    )
  })

  it('keeps a technical delivery name static inside its closed detail', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        medicineRecord: {
          safetyAndAdministration: {
            deliveryForm: 'GalNAc-conjugated siRNA, subcutaneous prefilled syringe',
          },
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
        },
      }),
    )
    const start = html.indexOf('Technical delivery name')
    const end = html.indexOf('</details>', start)
    const delivery = html.slice(start, end)

    expect(delivery).toContain('GalNAc-conjugated siRNA, subcutaneous prefilled syringe')
    expect(delivery).not.toContain('data-context-key=')
  })

  it('hides general research pricing when no stored citation is available', () => {
    const medicineRecord = populatedMedicineRecord()
    medicineRecord.pricing = {
      reportedRetailOrListPrice: 'An older reported figure',
      sources: [{ label: 'A nearby but unbound source' }],
      reports: [],
    }
    const html = renderDossier(view({ medicineRecord }))

    expect(html).not.toContain('id="cost-context"')
    expect(html).not.toContain('An older reported figure')
  })

  it.each([
    ['legacy_record', true, false],
    ['programme_unpublished', true, false],
    ['published_programme', true, true],
  ] as const)(
    'renders valid contribution actions for the %s binding state',
    (bindingState, showsCorrection, showsChallenge) => {
      const html = renderDossier(
        view({
          bindingState,
          verdict: bindingState === 'published_programme' ? 'A reviewed programme conclusion.' : '',
        }),
      )

      expect(html.includes('Suggest a correction')).toBe(showsCorrection)
      expect(html.includes('Challenge this answer')).toBe(showsChallenge)
      if (bindingState === 'legacy_record') {
        expect(html).toContain('Found a name that is wrong?')
        expect(html).toContain('medicine name or trade/brand name correction')
        expect(html).toContain('choose the exact use and study')
        expect(html).toContain('which public answer could change')
      }
    },
  )

  it('shows exact outcome context without inventing a primary endpoint or patient benefit', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A reviewed programme conclusion.',
        review: {
          historyHref: '/d/synthetic-medicine/programme/programme-a/history',
          publishedAt: '2026-08-22T09:30:00.000Z',
        },
        evidenceNodes: [
          {
            id: 'node-1',
            order: 1,
            label: 'Human evidence',
            title: 'What did the linked study report?',
            summary: 'The reviewed record includes one structured result.',
            state: 'confirmed',
            claimNature: 'measured',
            sourceIds: ['publication-1'],
            machineChecked: true,
            findingCodes: [],
            claims: [
              {
                id: 'claim-detail-1',
                nature: 'measured',
                nodeRelationships: ['SUPPORTS', 'QUALIFIES'],
                text: 'The treatment group recorded a lower laboratory measurement.',
                technicalText: 'A stored technical description.',
                population: 'Adults in the linked study',
                intervention: 'Structured treatment',
                comparator: 'Placebo',
                dose: 'Stored dose',
                route: 'Injection',
                duration: '18 months',
                endpoint: 'Change in the laboratory measurement',
                endpointHierarchy: 'SECONDARY',
                outcomeType: 'SURROGATE',
                direction: 'DECREASE',
                timepoint: 'Day 510',
                exactResult: '-12 percentage points',
                uncertaintyInterval: '95% interval: -18 to -6',
                lastVerifiedAt: '2026-08-20T00:00:00.000Z',
                sourceIds: ['publication-1'],
              },
            ],
          },
        ],
        studies: [
          {
            id: 'NCT00000002',
            title: 'Structured outcome study',
            sampleSize: 120,
            enrolmentType: 'ESTIMATED',
            endpoint: 'Change in the laboratory measurement',
            endpointHierarchy: 'SECONDARY',
            result: 'The treatment group recorded a lower laboratory measurement.',
            replication:
              'The same research programme reported a similar result; an independent repeat is not established.',
            state: 'measured',
            registrySourceId: 'registry-2',
            sourceIds: ['registry-2', 'publication-1'],
            interpretability: [
              {
                id: 'assessment-2',
                question: 'Was the right outcome measured?',
                professionalTerm: 'Endpoint validity',
                state: 'unclear',
                explanation: 'The linked assessment says this was an indirect measurement.',
                claimIds: ['claim-detail-1'],
                sourceIds: ['assessment-source-1'],
              },
            ],
          },
        ],
        keyOutcomes: [
          {
            id: 'patient-outcome',
            label: 'People reported how well they could complete daily activities.',
            state: 'measured',
            claimNature: 'measured',
            endpoint: 'Daily activity score',
            endpointHierarchy: 'SECONDARY',
            intervention: 'Structured treatment',
            comparator: 'Placebo',
            numericValue: '4.2',
            numericUnit: 'points',
            uncertaintyInterval: '95% interval: 1.1 to 7.3',
            direction: 'INCREASE',
            timepoint: 'Week 24',
            outcomeType: 'PATIENT_OUTCOME',
            sourceIds: ['patient-source-1'],
          },
          {
            id: 'surrogate-outcome',
            label: 'A laboratory measurement decreased.',
            state: 'measured',
            outcomeType: 'SURROGATE',
            sourceIds: ['surrogate-source-1'],
          },
          {
            id: 'biomarker-outcome',
            label: 'A body measurement changed.',
            state: 'measured',
            outcomeType: 'BIOMARKER',
            sourceIds: ['biomarker-source-1'],
          },
        ],
        sources: [
          {
            id: 'registry-2',
            label: 'Exact registry snapshot',
            href: 'https://example.test/registry/NCT00000002',
            identifier: 'NCT00000002',
            freshness: 'current',
          },
          {
            id: 'publication-1',
            label: 'Exact result publication',
            href: 'https://example.test/publication/1',
            identifier: 'PUB-1',
            freshness: 'current',
          },
          {
            id: 'assessment-source-1',
            label: 'Exact interpretability source',
            href: 'https://example.test/assessment/1',
            identifier: 'ASSESSMENT-1',
            freshness: 'current',
          },
          {
            id: 'patient-source-1',
            label: 'Exact patient-outcome source',
            href: 'https://example.test/outcome/patient',
            identifier: 'PATIENT-OUTCOME-1',
            freshness: 'current',
          },
          {
            id: 'surrogate-source-1',
            label: 'Exact surrogate source',
            href: 'https://example.test/outcome/surrogate',
            identifier: 'SURROGATE-1',
            freshness: 'current',
          },
          {
            id: 'biomarker-source-1',
            label: 'Exact biomarker source',
            href: 'https://example.test/outcome/biomarker',
            identifier: 'BIOMARKER-1',
            freshness: 'current',
          },
        ],
        timelineEvents: [
          {
            id: 'result-event-2',
            date: '2026-08-20',
            provenance: 'source',
            eventType: 'IMPORTANT_RESULT',
            dateBasis: 'ACTUAL',
            title: 'The reviewed result was reported',
            description: 'A linked source reported the result used by reviewers.',
            claimIds: ['claim-detail-1'],
            sourceIds: ['publication-1'],
          },
          {
            id: 'publication-event-2',
            date: '2026-08-22T09:30:00.000Z',
            provenance: 'rnawiki',
            eventType: 'PUBLICATION',
            title: 'RNAWiki published this reviewed conclusion',
            description: 'This reviewed version became public on RNAWiki.',
            claimIds: [],
            sourceIds: [],
          },
        ],
      }),
    )

    expect(html).toContain('What was measured')
    expect(html).not.toContain('Main outcome measured (primary endpoint)')
    expect(html).toContain('Participants (estimated count)')
    expect(html).toContain('Did another study find something similar?')
    expect(html).toContain(
      'The same research programme reported a similar result; an independent repeat is not established.',
    )
    expect(html).not.toContain('<dt class="text-[#6E6E73]">Independent repeat</dt>')
    expect(html).toContain('Estimated count:')
    expect(html).toContain('Medicine or treatment group')
    expect(html).toContain('Structured treatment')
    expect(html).toContain('Relationship to this step:')
    expect(html).toContain('Supports · Qualifies')
    expect(html).toContain('Comparison group')
    expect(html).toContain('Placebo')
    expect(html).toContain('How it was given')
    expect(html).toContain('Injection')
    expect(html).toContain('Time studied')
    expect(html).toContain('18 months')
    expect(html).toContain('Was this a main or additional result?')
    expect(html).toContain('An additional result planned before the study began')
    expect(html).toContain('Direction of change')
    expect(html).toContain('Decreased')
    expect(html).toContain('Exact result')
    expect(html).toContain('-12 percentage points')
    expect(html).toContain('How uncertain is this estimate?')
    expect(html).toContain('-18 to -6')
    expect(html).not.toContain('data-context-key=')
    expect(html).toContain('4.2 points')
    expect(html).toContain('1.1 to 7.3')
    expect(html).toContain('A result about how people felt, functioned, or survived')
    expect(html).toContain('An indirect measurement used instead of a direct patient result')
    expect(html).toContain('A measurement from the body, such as a laboratory value')
    expect(html).toContain('href="https://example.test/outcome/patient"')
    expect(html).toContain('RNAWiki published this reviewed conclusion')
    expect(html).toContain('Page update · not a study result')
    expect(html).toContain('We show events that changed the answer or what researchers did next')

    const assessment = html.indexOf('The linked assessment says this was an indirect measurement.')
    const studyEnd = html.indexOf('</article>', assessment)
    expect(html.slice(assessment, studyEnd)).toContain('href="https://example.test/assessment/1"')
    const publicationEvent = html.indexOf('RNAWiki published this reviewed conclusion')
    const publicationEventEnd = html.indexOf('</li>', publicationEvent)
    expect(html.slice(publicationEvent, publicationEventEnd)).not.toContain('<a ')
    expect(html.toLowerCase()).not.toContain('baseline')
    expect(html.toLowerCase()).not.toContain('absolute difference')
  })

  it('renders all programme links and the canonical chain without relying on colour alone', () => {
    const nodes = [
      ['human', 1, 'Human exposure', 'Was it given to people?', 'confirmed'],
      ['useful', 2, 'Useful exposure', 'Did enough reach the right place?', 'unknown'],
      ['target', 3, 'Target engagement', 'Did it hit the intended target?', 'not_measured'],
      ['biology', 4, 'Biological response', 'Did the body change as expected?', 'mixed'],
      ['outcome', 5, 'Clinical outcome', 'Did patients actually benefit?', 'contradicted'],
    ].map(([id, order, label, title, state]) => ({
      id: id as string,
      order: order as number,
      label: label as string,
      title: title as string,
      summary: 'Synthetic evidence detail.',
      state: state as 'confirmed' | 'contradicted' | 'unknown' | 'not_measured' | 'mixed',
      claimNature: 'measured' as const,
      sourceIds: [],
      machineChecked: true,
      findingCodes: [],
    }))
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A synthetic programme-scoped answer.',
        evidenceNodes: nodes,
        programmes: [
          {
            id: 'programme-a',
            label: 'Programme A',
            status: 'Active',
            href: '?programme=programme-a',
            selected: true,
          },
          {
            id: 'programme-b',
            label: 'Programme B',
            status: 'Stopped',
            href: '?programme=programme-b',
            selected: false,
          },
        ],
      }),
    )

    expect(html).toContain('?programme=programme-a')
    expect(html).toContain('?programme=programme-b')
    expect(html).not.toContain('lg:grid-cols-5')
    expect(html).toContain('Evidence supports this step')
    expect(html).toContain('Not enough information')
    expect(html).toContain('Not measured')
    expect(html).toContain('Studies point in different directions')
    expect(html).toContain('Evidence points against this step')
    expect(html).toContain('Which steps actually happened?')
    expect(html).toContain('First unanswered step')
    expect(html).toContain('Useful exposure')
    expect(html).toContain('The available sources do not answer this step yet.')
    expect(html).toContain('pointer-events-none absolute -bottom-[11px] left-6')
    expect(html).toContain('Synthetic evidence detail.')
    expect(html).not.toContain('Claim-level machine mapping pending')

    const contradictedHtml = renderDossier(
      view({
        bindingState: 'published_programme',
        evidenceNodes: nodes.map((node) => ({
          ...node,
          state: node.order < 3 ? 'confirmed' : node.order === 3 ? 'contradicted' : node.state,
        })),
      }),
    )
    expect(contradictedHtml).toContain('First step that did not happen as expected')
  })

  it('renders a self-contained static first read and keeps dense wording behind a disclosure', () => {
    const exactText =
      'A GalNAc-tagged siRNA that makes liver cells destroy their own PCSK9 messenger RNA, cutting LDL cholesterol by 52.3% and 49.9% against placebo at day 510 in ORION-10 and ORION-11 — a blood measurement, not yet a demonstrated reduction in heart attacks.'
    const readerSummary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      targetGene: 'PCSK9',
      targetProtein: 'Proprotein convertase subtilisin/kexin type 9',
      trialIdentifiers: ['ORION-10 (NCT03399370)', 'ORION-11 (NCT03400800)'],
      selectedUse: 'High LDL cholesterol',
      exactText,
      bestSupportedFinding:
        'LDL cholesterol changed by about half compared with placebo at day 510 in ORION-10 and ORION-11.',
      mainUncertainty:
        'These studies did not show whether inclisiran prevents heart attacks or strokes.',
    })
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary,
      }),
    )

    expect(html).toContain('data-testid="ten-second-used-for"')
    expect(html).toContain('Used or studied for people with high LDL (“bad”) cholesterol.')
    expect(html).toContain('data-testid="ten-second-finding"')
    expect(html).toContain('LDL (“bad”) cholesterol changed by about half')
    expect(html).toContain('data-testid="ten-second-limit"')
    expect(html).toContain('These studies did not show whether inclisiran prevents heart attacks')
    expect(html).toContain('Read the full research wording')
    expect(html).not.toContain('data-context-key=')
    expect(html).not.toContain('Hover, focus or tap')
    expect(html).not.toContain('Explain study words')

    const exactStart = html.indexOf('data-testid="exact-wording-annotated"')
    const exactEnd = html.indexOf('</p>', exactStart)
    const exact = html.slice(exactStart, exactEnd)
    expect(exactStart).toBeGreaterThanOrEqual(0)
    expect(exact).toContain(exactText)
    expect(exact).not.toContain('button')
  })

  it('renders numbered adjacent sources only from exact summary-field bindings', () => {
    const readerSummary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Synthetic Medicine',
      modality: 'Small Molecule',
      selectedUse: 'A synthetic use',
      exactText: 'The reviewed answer records one finding and one limitation.',
      bestSupportedFinding: 'After 12 weeks, symptoms improved by 20% compared with placebo.',
      mainUncertainty: 'The study did not show whether the improvement lasted beyond 12 weeks.',
    })
    const sources: MedicineDossierViewModel['sources'] = [
      {
        id: 'snapshot-finding',
        label: 'Exact finding source',
        href: 'https://example.test/finding',
        identifier: 'PMID:111',
        freshness: 'current',
      },
      {
        id: 'snapshot-limitation',
        label: 'Exact limitation source',
        href: 'https://example.test/limitation',
        identifier: 'NCT00000002',
        freshness: 'current',
      },
      {
        id: 'snapshot-unrelated',
        label: 'Verdict-wide source that is not field-linked',
        href: 'https://example.test/unrelated',
        freshness: 'current',
      },
      {
        id: 'snapshot-mechanism',
        label: 'Exact mechanism source',
        href: 'https://example.test/mechanism',
        identifier: 'DOI:10.1000/example',
        freshness: 'current',
      },
    ]
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary,
        mechanismSummary: { change: 'The reviewed mechanism changes a recorded pathway.' },
        sources,
        summaryEvidence: {
          'summary.plainMechanism': {
            fieldPath: 'summary.plainMechanism',
            claimIds: ['claim-mechanism'],
            sourceIds: ['snapshot-mechanism'],
            verdictClaimBindings: [{ claimId: 'claim-mechanism', relationship: 'SUPPORTING' }],
            sourceClaimBindings: [
              {
                sourceId: 'snapshot-mechanism',
                claimId: 'claim-mechanism',
                relationship: 'QUALIFIES',
                statement: 'The exact mechanism claim qualifies the reviewed mechanism.',
              },
            ],
          },
          'summary.bestSupportedFinding': {
            fieldPath: 'summary.bestSupportedFinding',
            claimIds: ['claim-finding'],
            sourceIds: ['snapshot-finding'],
            verdictClaimBindings: [{ claimId: 'claim-finding', relationship: 'SUPPORTING' }],
            sourceClaimBindings: [
              {
                sourceId: 'snapshot-finding',
                claimId: 'claim-finding',
                relationship: 'SUPPORTS',
                statement: 'The exact trial result supports the reviewed finding.',
              },
            ],
          },
          'summary.mainLimitation': {
            fieldPath: 'summary.mainLimitation',
            claimIds: ['claim-limitation'],
            sourceIds: ['snapshot-limitation'],
            verdictClaimBindings: [
              { claimId: 'claim-limitation', relationship: 'CANDIDATE_LIMITATION' },
            ],
            sourceClaimBindings: [
              {
                sourceId: 'snapshot-limitation',
                claimId: 'claim-limitation',
                relationship: 'CONTEXT',
                statement: 'The follow-up duration leaves this limitation unresolved.',
              },
            ],
          },
        },
      }),
    )

    const findingSources = markupFromTestId(html, 'finding-adjacent-sources', '</ul>')
    expect(findingSources).toContain('data-source-id="snapshot-finding"')
    expect(findingSources).toContain('data-claim-id="claim-finding"')
    expect(findingSources).toContain('data-source-relationship="SUPPORTS"')
    expect(findingSources).toContain(
      'Supports: The exact trial result supports the reviewed finding.',
    )
    expect(findingSources).not.toContain('Exact limitation source')
    expect(findingSources).not.toContain('Verdict-wide source that is not field-linked')

    const limitationSources = markupFromTestId(html, 'limitation-adjacent-sources', '</ul>')
    expect(limitationSources).toContain('data-source-id="snapshot-limitation"')
    expect(limitationSources).toContain('data-claim-id="claim-limitation"')
    expect(limitationSources).toContain('data-source-relationship="CONTEXT"')
    expect(limitationSources).toContain(
      'Adds context: The follow-up duration leaves this limitation unresolved.',
    )
    expect(limitationSources).not.toContain('Exact finding source')
    expect(limitationSources).not.toContain('Verdict-wide source that is not field-linked')

    const mechanismSources = markupFromTestId(html, 'mechanism-adjacent-sources', '</ul>')
    expect(mechanismSources).toContain('data-source-id="snapshot-mechanism"')
    expect(mechanismSources).toContain('data-claim-id="claim-mechanism"')
    expect(mechanismSources).toContain('data-source-relationship="QUALIFIES"')
    expect(mechanismSources).toContain(
      'Qualifies: The exact mechanism claim qualifies the reviewed mechanism.',
    )
    expect(mechanismSources).not.toContain('Verdict-wide source that is not field-linked')

    const withoutDependencies = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary,
        mechanismSummary: { change: 'The reviewed mechanism changes a recorded pathway.' },
        sources,
      }),
    )
    expect(withoutDependencies).not.toContain('finding-adjacent-sources')
    expect(withoutDependencies).not.toContain('limitation-adjacent-sources')
    expect(withoutDependencies).not.toContain('mechanism-adjacent-sources')

    const withBareSourceIds = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary,
        mechanismSummary: { change: 'The reviewed mechanism changes a recorded pathway.' },
        sources,
        summaryEvidence: {
          'summary.bestSupportedFinding': {
            fieldPath: 'summary.bestSupportedFinding',
            claimIds: ['claim-finding'],
            sourceIds: ['snapshot-finding'],
            verdictClaimBindings: [{ claimId: 'claim-finding', relationship: 'SUPPORTING' }],
            sourceClaimBindings: [],
          },
          'summary.mainLimitation': {
            fieldPath: 'summary.mainLimitation',
            claimIds: ['claim-limitation'],
            sourceIds: ['snapshot-limitation'],
            verdictClaimBindings: [
              { claimId: 'claim-limitation', relationship: 'CANDIDATE_LIMITATION' },
            ],
            sourceClaimBindings: [],
          },
          'summary.plainMechanism': {
            fieldPath: 'summary.plainMechanism',
            claimIds: ['claim-mechanism'],
            sourceIds: ['snapshot-mechanism'],
            verdictClaimBindings: [{ claimId: 'claim-mechanism', relationship: 'SUPPORTING' }],
            sourceClaimBindings: [],
          },
        },
      }),
    )
    expect(withBareSourceIds).not.toContain('finding-adjacent-sources')
    expect(withBareSourceIds).not.toContain('limitation-adjacent-sources')
    expect(withBareSourceIds).not.toContain('mechanism-adjacent-sources')
  })

  it('does not restore hover or tap controls when professional wording contains mapped terms', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        readerSummary: {
          basis: 'older_record',
          usedFor: 'Used for a synthetic condition.',
          whatStudiesFound: 'This first sentence contains no mapped phrase.',
          takeaway: 'This first sentence contains no mapped phrase.',
          exactText: 'This different professional sentence also contains no mapped phrase.',
          simplified: false,
          contextItems: [],
        },
      }),
    )

    expect(html).toContain('Read the full research wording')
    expect(html).not.toContain('data-context-key=')
    expect(html).not.toContain('Hover, focus or tap')
  })

  it('keeps professional fields reachable as static text without contextual controls', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        verdict: 'A plain stored summary.',
        evidenceNodes: [
          {
            id: 'legacy-technical-surface',
            order: 1,
            label: 'Older evidence note',
            title: 'A stored technical note',
            summary: 'The older record retained the exact technical fields.',
            state: 'recorded_context',
            claimNature: 'unknown',
            sourceIds: ['professional-source'],
            machineChecked: false,
            findingCodes: [],
            technicalDetail: {
              technicalDetails: 'The LDL-C result was placebo-adjusted.',
              measuredMetric: 'A Biomarker outcome at Baseline',
              inferredClaim: 'The Surrogate marker predicts a benefit.',
              evidenceSource: 'PROFESSIONAL-SOURCE-ID',
              auditFlag: 'caution',
            },
          },
        ],
        studies: [
          {
            id: 'NCT00000003',
            title: 'Professional surface study',
            phase: 'Phase 3',
            status: 'Open-label study',
            studyType: 'Randomisation and Blinding',
            result: 'The study recorded a result.',
            technicalResult: '95% confidence interval; P-value 0.01.',
            replication: 'A placebo group reported a similar result.',
            state: 'measured',
            registrySourceId: 'professional-source',
            sourceIds: ['professional-source'],
            interpretability: [
              {
                id: 'professional-assessment',
                question: 'Was the Primary endpoint measured?',
                professionalTerm: 'Primary endpoint',
                state: 'unclear',
                explanation: 'The Biomarker outcome was recorded as a Surrogate marker.',
                claimIds: [],
                sourceIds: ['professional-source'],
              },
            ],
          },
        ],
        mechanismSteps: [
          {
            id: 'professional-mechanism',
            order: 1,
            title: 'GalNAc delivery',
            plainLanguage: 'The stored record described delivery into cells.',
            technicalDetail: 'siRNA lowered PCSK9 Messenger RNA.',
            claimIds: ['professional-claim'],
            sourceIds: ['professional-source'],
            sourceClaimBindings: [
              {
                sourceId: 'professional-source',
                claimId: 'professional-claim',
                relationship: 'QUALIFIES',
                statement: 'An Adverse event report adds context.',
              },
            ],
          },
        ],
        timelineEvents: [
          {
            id: 'professional-timeline-event',
            date: '2026-08-23',
            provenance: 'source',
            eventType: 'IMPORTANT_RESULT',
            dateBasis: 'ACTUAL',
            title: 'A stored result changed the record',
            description: 'The linked source recorded the change.',
            technicalDetail: 'Pharmacokinetics and Half-life were recorded.',
            claimIds: [],
            sourceIds: ['professional-source'],
          },
        ],
        sources: [
          {
            id: 'professional-source',
            label: 'A professional evidence source',
            href: 'https://example.test/professional-source',
            identifier: 'PROFESSIONAL-SOURCE-ID',
            freshness: 'current',
          },
        ],
        medicineRecord: {
          conventionalAlternatives: [
            {
              name: 'Monoclonal antibody treatment',
              comparison: 'The older record compared this approach.',
            },
          ],
          commonQuestions: [
            {
              question: 'What does Half-life mean?',
              answer: 'The older record used this timing term.',
            },
          ],
          molecular: {
            format: 'Pharmacokinetics description',
            identifiers: [
              {
                label: 'Stored code',
                value: 'DO-NOT-ANNOTATE-THIS-ID',
                kind: 'measurement',
              },
            ],
            structureCheck: 'not_passed',
          },
          communityNotes: [],
        },
      }),
    )

    const legacyTechnical = markupFromTestId(html, 'legacy-technical-evidence', '</dl>')
    expect(legacyTechnical).toContain('The LDL-C result was placebo-adjusted.')
    expect(legacyTechnical).toContain('A Biomarker outcome at Baseline')
    expect(legacyTechnical).toContain('The Surrogate marker predicts a benefit.')
    expect(legacyTechnical).toContain('PROFESSIONAL-SOURCE-ID')

    const designMetadata = markupFromTestId(html, 'study-design-metadata', '</dl>')
    expect(designMetadata).toContain('Open-label study')
    expect(designMetadata).toContain('Phase 3')
    expect(designMetadata).toContain('Randomisation and Blinding')

    const replication = markupFromTestId(html, 'study-replication', '</dd>')
    expect(replication).toContain('A placebo group reported a similar result.')

    const technicalResult = markupFromTestId(html, 'study-technical-result', '</p>')
    expect(technicalResult).toContain('95% confidence interval; P-value 0.01.')

    const interpretability = markupFromTestId(html, 'study-interpretability', '</ul>')
    expect(interpretability).toContain('Was the Primary endpoint measured?')
    expect(interpretability).toContain('The Biomarker outcome was recorded as a Surrogate marker.')

    const recordedDesign = markupFromTestId(html, 'recorded-study-design', '</p>')
    expect(recordedDesign).toContain('Phase 3')
    expect(recordedDesign).toContain('Randomisation and Blinding')

    const mechanismTitle = markupFromTestId(html, 'mechanism-step-title', '</h4>')
    expect(mechanismTitle).toContain('GalNAc delivery')
    const mechanismDetail = markupFromTestId(html, 'mechanism-technical-detail', '</p>')
    expect(mechanismDetail).toContain('siRNA lowered PCSK9 Messenger RNA.')

    const sourceBinding = markupFromTestId(html, 'source-claim-binding', '</p>')
    expect(sourceBinding).toContain('An Adverse event report adds context.')
    const timelineDetail = markupFromTestId(html, 'timeline-technical-detail', '</p>')
    expect(timelineDetail).toContain('Pharmacokinetics and Half-life were recorded.')

    const alternativeName = markupFromTestId(html, 'alternative-name', '</h3>')
    expect(alternativeName).toContain('Monoclonal antibody treatment')
    const commonQuestion = markupFromTestId(html, 'common-question', '</summary>')
    expect(commonQuestion).toContain('What does Half-life mean?')
    const molecularFormat = markupFromTestId(html, 'molecular-format', '</p>')
    expect(molecularFormat).toContain('Pharmacokinetics description')

    expect(html).not.toContain('data-context-key=')
    expect(html).not.toContain('show a short explanation')

    const identifierStart = html.indexOf('DO-NOT-ANNOTATE-THIS-ID')
    const identifierRegion = html.slice(
      html.lastIndexOf('<dd', identifierStart),
      html.indexOf('</dd>', identifierStart),
    )
    expect(identifierStart).toBeGreaterThanOrEqual(0)
    expect(identifierRegion).not.toContain('data-context-key=')
  })

  it('keeps p-only study statistics in technical detail and suppresses replication judgement', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        studies: [
          {
            id: 'P-ONLY-STUDY',
            title: 'Study without a recorded effect size',
            status: 'Completed',
            technicalResult: 'P-value < 0.001',
            replication: 'No independent repeat is recorded.',
            state: 'unknown',
            registrySourceId: 'missing-registry-source',
            sourceIds: [],
          },
        ],
      }),
    )

    const cardStart = html.indexOf('Study without a recorded effect size')
    const cardEnd = html.indexOf('</article>', cardStart)
    const card = html.slice(cardStart, cardEnd)
    expect(card).toContain('No result on this page')
    expect(card).toContain('Statistical test only (size of the change not available)')
    expect(card).toContain('P-value')
    expect(card).toContain('&lt; 0.001')
    expect(card).toContain('it is not the size or importance of the effect')
    expect(card).not.toContain('Reported result')
    expect(card).not.toContain('Independent repeat')
    expect(card).not.toContain('No independent repeat is recorded')
  })

  it('keeps full study names intact when they first appear outside a study card', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        keyOutcomes: [
          {
            id: 'outcome-only-study-names',
            label:
              'ORION-3 recorded a follow-up result while VICTORION-2-PREVENT is still running.',
            state: 'measured',
            legacyGroup: 'measured_findings',
            legacyGroupLabel: 'Measured findings',
            sourceIds: [],
          },
        ],
      }),
    )

    expect(html).toContain('ORION-3 recorded a follow-up result')
    expect(html).toContain('VICTORION-2-PREVENT is still running')
    expect(html).not.toContain('data-context-key=')
  })

  it('renders legacy evidence as unconnected notes and recorded context as a neutral state', () => {
    const legacyHtml = renderDossier(
      view({
        bindingState: 'legacy_record',
        evidenceNodes: [
          {
            id: 'legacy-context',
            order: 1,
            label: 'Older source section',
            title: 'A practical event was recorded',
            summary: 'The older record notes a manufacturing event.',
            state: 'contradicted',
            claimNature: 'unknown',
            sourceIds: ['legacy-audit-source'],
            machineChecked: false,
            findingCodes: [],
            technicalDetail: {
              technicalDetails:
                'Exact analysis: difference -47.9 percentage points (95% CI -53.5 to -42.3; P<0.001).',
              measuredMetric: 'Percentage change at day 510',
              inferredClaim: 'That the laboratory result predicts a patient outcome',
              evidenceSource: 'Exact Journal Citation 2026;1:2-3',
              auditFlag: 'caution',
            },
          },
        ],
        sources: [
          {
            id: 'legacy-audit-source',
            label: 'Exact Journal Citation 2026;1:2-3',
            href: 'https://doi.org/10.0000%2Flegacy-source',
            identifier: '10.0000/legacy-source',
            freshness: 'unknown',
          },
        ],
      }),
    )
    expect(legacyHtml).toContain('General research findings')
    expect(legacyHtml).toContain(
      'These are separate findings collected across the research. They are not an ordered chain and have not been reviewed as an answer to this specific question.',
    )
    expect(legacyHtml).not.toContain('Older note · not reviewed for this specific use')
    expect(legacyHtml).not.toContain('Evidence type: Nature unknown')
    expect(legacyHtml).not.toContain('Contradicted')
    expect(legacyHtml).not.toContain('pointer-events-none absolute -bottom-[11px]')
    expect(legacyHtml).toContain('Technical evidence details')
    expect(legacyHtml).toContain('Exact analysis: difference')
    expect(legacyHtml).toContain('-47.9 percentage points')
    expect(legacyHtml).toContain('-53.5 to -42.3; ')
    expect(legacyHtml).toContain('P&lt;0.001')
    expect(legacyHtml).not.toContain('data-context-key=')
    expect(legacyHtml).toContain('That the laboratory result predicts a patient outcome')
    expect(legacyHtml).toContain('Evidence source as stored')
    expect(legacyHtml).toContain('Stored audit flag')
    expect(legacyHtml).toContain('href="https://doi.org/10.0000%2Flegacy-source"')

    const normalizedHtml = renderDossier(
      view({
        bindingState: 'published_programme',
        evidenceNodes: [
          {
            id: 'recorded-context',
            order: 1,
            label: 'Practical context',
            title: 'A practical event was recorded',
            summary: 'This is context rather than an independently checked scientific result.',
            state: 'recorded_context',
            claimNature: 'mixed',
            sourceIds: [],
            machineChecked: true,
            findingCodes: [],
          },
        ],
        keyOutcomes: [
          {
            id: 'recorded-context-outcome',
            label: 'A practical event from the programme record.',
            state: 'recorded_context',
            sourceIds: [],
          },
        ],
      }),
    )
    expect(normalizedHtml).toContain('General research summary · not reviewed for one use')
    expect(normalizedHtml).toContain(
      'This is context rather than an independently checked scientific result.',
    )
  })

  it.each(['programme_unpublished', 'published_programme'] as const)(
    'renders the selected programme history URL for %s dossiers',
    (bindingState) => {
      const historyHref = '/d/synthetic-medicine/programme/programme-a/history'
      const html = renderDossier(view({ bindingState, review: { historyHref } }))

      expect(html).toContain(`href="${historyHref}"`)
      expect(html).toContain('See what changed on this page')
    },
  )

  it('lists other studied uses with only their own published findings', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A synthetic programme-scoped answer.',
        programmes: [
          {
            id: 'programme-a',
            label: 'Programme A',
            status: 'Active',
            href: '?programme=programme-a',
            selected: true,
            oneSentenceResult: 'Symptoms improved by 20% compared with placebo at 12 weeks.',
            publishedLabel: 'Helped in the studied group',
          },
          {
            id: 'programme-b',
            label: 'Programme B',
            status: 'Stopped',
            href: '?programme=programme-b',
            selected: false,
          },
        ],
      }),
    )

    expect(html).toContain('data-testid="dossier-other-programmes"')
    expect(html).toContain('The same medicine has been tested for other questions')
    expect(html).toContain('Symptoms improved by 20% compared with placebo at 12 weeks.')
    expect(html).toContain('Helped in the studied group')
    expect(html).toContain('No reviewed conclusion has been published for this use yet.')
    expect(html).toContain('Selected answer')
    expect(html).toContain('View this answer')
  })

  it('hides the other-uses list when only one programme exists', () => {
    const html = renderDossier(view({ bindingState: 'published_programme' }))
    expect(html).not.toContain('data-testid="dossier-other-programmes"')
  })

  it('repeats the five reviewed step states inside the stopped-research card', () => {
    const nodes = [
      ['human', 1, 'Human exposure', 'confirmed'],
      ['useful', 2, 'Useful exposure', 'confirmed'],
      ['target', 3, 'Target engagement', 'confirmed'],
      ['biology', 4, 'Biological response', 'mixed'],
      ['outcome', 5, 'Clinical outcome', 'contradicted'],
    ].map(([id, order, label, state]) => ({
      id: id as string,
      order: order as number,
      label: label as string,
      title: `${label as string} question`,
      summary: 'Synthetic evidence detail.',
      state: state as 'confirmed' | 'contradicted' | 'mixed',
      claimNature: 'measured' as const,
      sourceIds: [],
      machineChecked: true,
      findingCodes: [],
    }))
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        verdict: 'A synthetic stopped-programme answer.',
        evidenceNodes: nodes,
        dynamicModules: dynamicModules({
          programmeFailure: {
            status: 'ready',
            data: {
              scope: 'selected_programme',
              code: 'IDEA_FAILED',
              readerLabel: 'The research question was answered: the idea did not hold.',
              professionalLabel: 'IDEA_FAILED',
              reason: 'The measured patient outcome did not improve against the comparator.',
              sourceIds: [],
              sourceClaimBindings: [],
            },
          },
        }),
      }),
    )

    const failureCard = markupFromTestId(html, 'programme-failure-classification', '</section>')
    expect(failureCard).toContain('Where the evidence chain held')
    expect(failureCard).toContain('Human exposure')
    expect(failureCard).toContain('Evidence points against it')
    expect(failureCard).toContain('Mixed findings')
  })

  it('links the first-read safety line to the fuller safety section only when it exists', () => {
    const withSafety = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary: {
          basis: 'published_programme',
          usedFor: 'Used or studied for Programme A.',
          takeaway: 'A synthetic answer.',
          criticalSafety: 'A recorded regulator warning applies to this group.',
          simplified: false,
          contextItems: [],
        },
        dynamicModules: dynamicModules({
          safety: {
            status: 'ready',
            data: { scope: 'selected_programme', findings: [], withheldFindingCount: 0 },
          },
        }),
      }),
    )
    expect(withSafety).toContain('href="#selected-programme-safety"')
    expect(withSafety).toContain('View safety')

    const withoutSafetySection = renderDossier(
      view({
        bindingState: 'published_programme',
        readerSummary: {
          basis: 'published_programme',
          usedFor: 'Used or studied for Programme A.',
          takeaway: 'A synthetic answer.',
          criticalSafety: 'A recorded regulator warning applies to this group.',
          simplified: false,
          contextItems: [],
        },
      }),
    )
    expect(withoutSafetySection).not.toContain('View safety')
  })

  it('offers the recorded source list for export without inventing citation fields', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        sources: [
          {
            id: 'snapshot-1',
            label: 'Exact saved source',
            href: 'https://example.test/source',
            identifier: 'PMID:111',
            retrievedAt: 'March 2026',
            verifiedAt: 'August 2026',
            freshness: 'current',
          },
        ],
      }),
    )

    expect(html).toContain('Export the recorded source list')
    expect(html).toContain('Exact saved source')
    expect(html).toContain('Saved copy from March 2026.')
    expect(html).not.toContain('et al')
  })

  it('renders raw source ids as DOM anchors so structured-data fragments resolve', () => {
    const html = renderDossier(
      view({
        bindingState: 'published_programme',
        sources: [
          {
            id: 'doi:10.1056/nejmoa0000000',
            label: 'A DOI-identified source',
            href: 'https://doi.org/10.1056/NEJMoa0000000',
            freshness: 'current',
          },
        ],
      }),
    )
    expect(html).toContain('id="source-doi:10.1056/nejmoa0000000"')
  })

  it('renders recorded background rows with their sources and honest framing', () => {
    const html = renderDossier(
      view({
        bindingState: 'legacy_record',
        medicineRecord: {
          conventionalAlternatives: [],
          commonQuestions: [],
          communityNotes: [],
          background: {
            authoredAt: '2026-08-27',
            pharmacokinetics: {
              routeAsRecorded: 'oral tablet',
              values: [
                {
                  label: 'Half-life',
                  display: 'about 12 hours',
                  populationContext: 'healthy adults, single dose',
                  concordanceLabel: 'From the label; not separately corroborated',
                  source: {
                    kindLabel: 'FDA label',
                    label: 'Synthetic medicine label',
                    identifier: '00afce9b-48c9-487a-a738-e359c005c707',
                    href: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=00afce9b-48c9-487a-a738-e359c005c707',
                    retrievedAt: '2026-08-27',
                    excerpt: 'Synthetic wording: half-life is approximately 12 hours.',
                  },
                },
              ],
            },
            anatomyTargets: [
              {
                regionCode: 'liver',
                regionLabel: 'Liver',
                x: 112,
                y: 118,
                action: 'a synthetic recorded action at this organ',
                source: {
                  kindLabel: 'FDA label',
                  label: 'Synthetic medicine label',
                  identifier: '00afce9b-48c9-487a-a738-e359c005c707',
                  retrievedAt: '2026-08-27',
                },
              },
            ],
          },
        },
      }),
    )

    expect(html).toContain('id="after-a-dose"')
    expect(html).toContain('What happens after a dose')
    expect(html).toContain('about 12 hours')
    expect(html).toContain('Measured in: healthy adults, single dose')
    expect(html).toContain('From the label; not separately corroborated')
    expect(html).toContain('Exact fetched wording')
    expect(html).toContain('id="where-it-acts-map"')
    expect(html).toContain('a synthetic recorded action at this organ')
    expect(html).toContain('not a reviewed conclusion')
    expect(html.toLowerCase()).not.toContain('you should')
  })

  /**
   * The completeness section sits beside the question universe inside the evidence disclosure, so a
   * reader who opens one finds the other. It must never appear on a record without an assessment.
   */
  it('places the completeness section directly after the question universe, when one exists', () => {
    const without = renderDossier(view())
    expect(without).not.toContain('data-testid="dossier-completion-assessment"')

    const html = renderDossier(
      view({
        completionAssessment: {
          status: 'COMPLETE',
          statusCopy: 'Every section that applies to this record has an explicit state.',
          resolverVersion: 'dossier-completion/v1',
          inputDigest: 'c'.repeat(64),
          contentChangedAt: '2026-09-02T00:00:00.000Z',
          assessedAt: '2026-09-02T00:00:00.000Z',
          applicableSectionCount: 1,
          terminalSectionCount: 1,
          sections: [
            {
              id: 'identity',
              label: 'What this record is',
              state: 'EXACT_STRUCTURED_SOURCE_DATA',
              stateLabel: 'Recorded as structured source data',
              terminal: true,
              basis: 'Identity rests on one recorded registry identifier.',
              sourceRefs: [{ kind: 'UNII', identifier: 'TR046Y3K1G' }],
              humanReadSuggested: false,
            },
          ],
        },
        inventoryResolution: {
          resolutionStatus: 'CANONICAL_ENTITY',
          entityClass: 'APPROVED_MEDICINE',
          canonicalSlug: 'synthetic-medicine',
          redirectTargetSlug: null,
          identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
          identifierSharedWithOtherRecords: false,
          resolverVersion: 'inventory-resolution/v1',
        },
      }),
    )

    const coverage = html.indexOf('data-testid="dossier-question-coverage"')
    const completeness = html.indexOf('data-testid="dossier-completion-assessment"')
    expect(coverage).toBeGreaterThanOrEqual(0)
    expect(completeness).toBeGreaterThan(coverage)
    expect(html).toContain('id="record-completeness"')
    expect(html).toContain('How complete this record is')
    /* One anchor per section id, so the page's own anchors keep their destinations. */
    expect(html.split('id="record-completeness-identity"').length).toBe(2)
    expect(html.split('id="record-completeness"').length).toBe(2)
  })

  it('ends with plain links to the related RNAWiki pages', () => {
    const html = renderDossier(view())
    const nav = html.indexOf('aria-label="Related RNAWiki pages"')
    expect(nav).toBeGreaterThanOrEqual(0)
    expect(html.slice(nav)).toContain('href="/browse"')
    expect(html.slice(nav)).toContain('href="/review-queue"')
    expect(html.slice(nav)).toContain('href="/how-it-works"')
  })
})
