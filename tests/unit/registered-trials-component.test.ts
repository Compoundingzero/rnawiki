import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  RegisteredTrials,
  registrationFacts,
  trialRegistrationsCapSentence,
} from '@/components/dossier/RegisteredTrials'
import {
  buildTrialRegistrationsView,
  rankTrialRegistrations,
  snapshotDateFromIdentifier,
  TRIAL_REGISTRATIONS_SHOWN_LIMIT,
} from '@/lib/dossier'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { TrialRegistrationRecord, TrialRegistrationsView } from '@/lib/types'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/**
 * The property under test is that this surface prints registry facts and nothing else: the order
 * is the stated order, the cap is stated, the framing says what a registration is and is not, each
 * study links to its registry page, and no registry code reaches the main view as reader-facing
 * copy. Any of those failing would be a release failure, not a cosmetic one.
 */

const SOURCE_IDENTIFIER =
  'clinicaltrials.gov/api/v2 studies snapshot 2026-09-01T09:00:05 sha256:' + 'a'.repeat(64)

function study(overrides: Partial<TrialRegistrationRecord>): TrialRegistrationRecord {
  return {
    nctId: 'NCT00000000',
    briefTitle: null,
    overallStatus: null,
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
    ...overrides,
  }
}

/** Results posted, completed; the registry facts a fully filled record carries. */
const posted = study({
  nctId: 'NCT03201562',
  overallStatus: 'COMPLETED',
  studyType: 'INTERVENTIONAL',
  phases: ['PHASE2'],
  hasResults: true,
  resultsFirstPostDate: '2021-04-19',
  startDate: '2017-04-30',
  primaryCompletionDate: '2018-05-20',
  completionDate: '2018-05-20',
  enrollment: { count: 58, type: 'ACTUAL' },
  leadSponsor: { name: 'Example Sponsor, Inc', class: 'OTHER' },
  conditions: ['Presbyopia'],
  matchedInterventionNames: ['Aceclidine'],
  eligibility: {
    sex: 'ALL',
    minimumAge: '48 Years',
    maximumAge: '64 Years',
    stdAges: ['ADULT'],
    healthyVolunteers: true,
  },
  primaryOutcomes: [
    {
      measure: 'Proportion of Subjects With at Least a 3 Line Change in Near Visual Acuity',
      timeFrame: '1 hour post-treatment',
    },
  ],
  design: { allocation: 'RANDOMIZED', masking: 'TRIPLE', primaryPurpose: 'TREATMENT' },
})

/** Completed, larger, but no results posted: ranks below the posted study despite its size. */
const completedNoResults = study({
  nctId: 'NCT01111111',
  overallStatus: 'COMPLETED',
  studyType: 'INTERVENTIONAL',
  phases: ['PHASE3'],
  startDate: '2019-02',
  completionDate: '2022-11',
  enrollment: { count: 1200, type: 'ACTUAL' },
  leadSponsor: { name: 'Example University', class: 'OTHER' },
  conditions: ['Condition A', 'Condition B'],
  matchedInterventionNames: ['ACECLIDINE 1%'],
  eligibility: {
    sex: 'FEMALE',
    minimumAge: '18 Years',
    maximumAge: null,
    stdAges: ['ADULT', 'OLDER_ADULT'],
    healthyVolunteers: false,
  },
  primaryOutcomes: [{ measure: 'Change from baseline in score', timeFrame: null }],
  design: { allocation: 'NON_RANDOMIZED', masking: 'NONE', primaryPurpose: 'PREVENTION' },
})

/** Recruiting, with most fields absent: those rows must be omitted, not filled with a placeholder. */
const recruitingSparse = study({
  nctId: 'NCT02222222',
  overallStatus: 'RECRUITING',
  studyType: 'OBSERVATIONAL',
  startDate: '2025-06-01',
  enrollment: { count: 40, type: 'ESTIMATED' },
  matchedInterventionNames: ['Aceclidine'],
})

function view(overrides: Partial<TrialRegistrationsView> = {}): TrialRegistrationsView {
  return {
    sourceIdentifier: SOURCE_IDENTIFIER,
    snapshotDate: '2026-09-01',
    searchedAt: '2026-09-02T03:29:33.289Z',
    matchedNames: ['Aceclidine', 'Example Brand'],
    totalMatched: 3,
    storedCount: 3,
    withPostedResults: 1,
    shown: rankTrialRegistrations([recruitingSparse, completedNoResults, posted]),
    shownLimit: TRIAL_REGISTRATIONS_SHOWN_LIMIT,
    ...overrides,
  }
}

function dossier(trialRegistrations?: TrialRegistrationsView): MedicineDossierViewModel {
  return { slug: 'example', name: 'Example', trialRegistrations } as MedicineDossierViewModel
}

function render(trialRegistrations?: TrialRegistrationsView): string {
  return renderToStaticMarkup(
    React.createElement(RegisteredTrials, { dossier: dossier(trialRegistrations) }),
  )
}

/** The main view is everything outside the labelled technical disclosure. */
function mainView(html: string): string {
  const start = html.indexOf('<details')
  return start === -1 ? html : html.slice(0, start)
}

function visibleText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

const FORBIDDEN_CHARACTERISATIONS =
  /\b(showed|demonstrated|well tolerated|effective|efficacious|safe)\b/iu

describe('ranking', () => {
  it('puts results-posted first, then completed, then larger enrolment, then the latest start', () => {
    const bigRecruiting = study({
      nctId: 'NCT09999999',
      overallStatus: 'RECRUITING',
      enrollment: { count: 5000, type: 'ESTIMATED' },
    })
    const laterStart = study({
      nctId: 'NCT08888888',
      overallStatus: 'RECRUITING',
      enrollment: { count: 40, type: 'ESTIMATED' },
      startDate: '2026-01',
    })
    const ranked = rankTrialRegistrations([
      laterStart,
      recruitingSparse,
      bigRecruiting,
      completedNoResults,
      posted,
    ])
    expect(ranked.map((entry) => entry.nctId)).toEqual([
      'NCT03201562',
      'NCT01111111',
      'NCT09999999',
      'NCT08888888',
      'NCT02222222',
    ])
  })

  it('is total: the same rows in another order rank identically', () => {
    const forward = rankTrialRegistrations([posted, completedNoResults, recruitingSparse])
    const backward = rankTrialRegistrations([recruitingSparse, completedNoResults, posted])
    expect(backward.map((entry) => entry.nctId)).toEqual(forward.map((entry) => entry.nctId))
  })
})

describe('building the view from a stored search record', () => {
  it('caps at the shown limit and keeps the true totals', () => {
    const studies = Array.from({ length: 12 }, (_, index) =>
      study({
        nctId: `NCT${String(index).padStart(8, '0')}`,
        enrollment: { count: index, type: 'ACTUAL' },
      }),
    )
    const built = buildTrialRegistrationsView({
      sourceIdentifier: SOURCE_IDENTIFIER,
      requestedAt: '2026-09-02T03:29:33.289Z',
      envelope: {
        totalMatchedStudies: 300,
        storedStudies: 12,
        withPostedResults: 0,
        matchedKeys: [{ key: 'aceclidine', name: 'Aceclidine', via: 'name', studies: 300 }],
        studies,
      },
    })
    expect(built?.shown).toHaveLength(TRIAL_REGISTRATIONS_SHOWN_LIMIT)
    expect(built?.shown[0]?.nctId).toBe('NCT00000011')
    expect(built?.totalMatched).toBe(300)
    expect(built?.storedCount).toBe(12)
    expect(built?.withPostedResults).toBe(0)
    expect(built?.matchedNames).toEqual(['Aceclidine'])
    expect(built?.snapshotDate).toBe('2026-09-01')
  })

  it('returns null rather than an empty section when nothing matched', () => {
    expect(
      buildTrialRegistrationsView({
        sourceIdentifier: SOURCE_IDENTIFIER,
        requestedAt: new Date('2026-09-02T00:00:00Z'),
        envelope: {
          totalMatchedStudies: 0,
          storedStudies: 0,
          withPostedResults: 0,
          matchedKeys: [],
          studies: [],
        },
      }),
    ).toBeNull()
    expect(
      buildTrialRegistrationsView({
        sourceIdentifier: SOURCE_IDENTIFIER,
        requestedAt: new Date(),
        envelope: undefined,
      }),
    ).toBeNull()
  })

  it('drops a stored entry without a well-formed registry identifier instead of inventing one', () => {
    const built = buildTrialRegistrationsView({
      sourceIdentifier: SOURCE_IDENTIFIER,
      requestedAt: new Date(),
      envelope: { studies: [{ nctId: 'not-an-id' }, { ...posted, enrollment: 'bad' }] },
    })
    expect(built?.shown.map((entry) => entry.nctId)).toEqual(['NCT03201562'])
    expect(built?.shown[0]?.enrollment).toEqual({ count: null, type: null })
  })

  it('reads the snapshot date from the identifier and never from the clock', () => {
    expect(snapshotDateFromIdentifier(SOURCE_IDENTIFIER)).toBe('2026-09-01')
    expect(snapshotDateFromIdentifier('clinicaltrials.gov live query')).toBeNull()
  })
})

describe('the registered trials section', () => {
  it('renders nothing when the record carries no registrations', () => {
    expect(render(undefined)).toBe('')
    expect(render(view({ shown: [] }))).toBe('')
  })

  it('lists studies in the stated order and links each to its registry page', () => {
    const html = render(view())
    const positions = ['NCT03201562', 'NCT01111111', 'NCT02222222'].map((id) =>
      html.indexOf(`id="registered-trial-${id}"`),
    )
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((left, right) => left - right)).toEqual(positions)
    for (const id of ['NCT03201562', 'NCT01111111', 'NCT02222222']) {
      expect(html).toContain(`href="https://clinicaltrials.gov/study/${id}"`)
    }
    expect(html).toContain('rel="noreferrer"')
  })

  it('states the cap, the ordering rule and how many registrations are beyond the list', () => {
    const capped = trialRegistrationsCapSentence(view({ totalMatched: 295, storedCount: 250 }))
    expect(capped).toContain('3 of 295 registrations are listed here.')
    expect(capped).toContain(
      'results posted on ClinicalTrials.gov come first, then completed studies',
    )
    expect(capped).toContain(
      '292 more registrations are in the snapshot and not listed on this page.',
    )

    const complete = trialRegistrationsCapSentence(view())
    expect(complete).toContain('All 3 registrations are listed.')
    expect(complete).not.toContain('more registrations')
  })

  it('frames the list honestly, once, above it, from the stored snapshot and matched names', () => {
    const html = render(view())
    const text = visibleText(mainView(html))
    const listStart = html.indexOf('<ol')
    const framing = visibleText(html.slice(0, listStart))
    expect(framing).toContain('snapshot dated 2026-09-01')
    expect(framing).toContain('“Aceclidine” and “Example Brand”')
    expect(framing).toContain('says nothing about whether the medicine worked')
    expect(framing).toContain('RNAWiki has not read or summarised them')
    expect(framing).toContain('absence from it is not evidence that no study exists')
    expect(text.split('says nothing about whether the medicine worked').length).toBe(2)
  })

  it('says plainly when no matched registration has results posted', () => {
    const none = render(
      view({ withPostedResults: 0, shown: [completedNoResults, recruitingSparse] }),
    )
    expect(none).toContain('data-testid="registered-trials-no-results"')
    expect(none).toContain(
      'None of these registrations has results posted on ClinicalTrials.gov in this snapshot.',
    )
    expect(render(view())).not.toContain('data-testid="registered-trials-no-results"')
  })

  it('prints each fact in ordinary words and omits absent fields', () => {
    const full = registrationFacts(posted)
    expect(full.map((fact) => fact.label)).toEqual([
      'What it was listed for',
      'Registered intervention name that matched',
      'Kind of study',
      'How it was set up',
      'How many people',
      'Who could take part',
      'When',
      'What it set out to measure, as registered',
      'Who ran it',
      'Results on ClinicalTrials.gov',
    ])
    const byLabel = Object.fromEntries(full.map((fact) => [fact.label, fact.value]))
    expect(byLabel['Kind of study']).toBe('Interventional study · Phase 2')
    expect(byLabel['How it was set up']).toBe(
      'Randomised; masking: three parties masked; listed purpose: treatment',
    )
    expect(byLabel['How many people']).toBe('58 (actual number)')
    expect(byLabel['Who could take part']).toBe(
      'All sexes; aged 48 years to 64 years; registry age groups: adults; healthy volunteers accepted',
    )
    expect(byLabel['When']).toBe(
      'Started 2017-04-30; primary completion 2018-05-20; completed 2018-05-20',
    )
    expect(byLabel['What it set out to measure, as registered']).toBe(
      '“Proportion of Subjects With at Least a 3 Line Change in Near Visual Acuity” — time frame “1 hour post-treatment”',
    )
    expect(byLabel['Who ran it']).toBe(
      'Example Sponsor, Inc (other, such as a university or hospital)',
    )
    expect(byLabel['Results on ClinicalTrials.gov']).toContain(
      'Results posted on ClinicalTrials.gov on 2021-04-19',
    )

    const sparse = registrationFacts(recruitingSparse)
    expect(sparse.map((fact) => fact.label)).toEqual([
      'Registered intervention name that matched',
      'Kind of study',
      'How many people',
      'When',
      'Results on ClinicalTrials.gov',
    ])
    expect(sparse.find((fact) => fact.label === 'How many people')?.value).toBe(
      '40 (anticipated number)',
    )
    expect(sparse.find((fact) => fact.label === 'Results on ClinicalTrials.gov')?.value).toBe(
      'No results posted on ClinicalTrials.gov in this snapshot.',
    )
    const html = render(view())
    expect(visibleText(mainView(html))).not.toMatch(/not recorded|unknown|n\/a|placeholder/iu)
  })

  it('lets no registry code reach the main view, and keeps them in the labelled disclosure', () => {
    const html = render(view())
    const main = visibleText(mainView(html))
    for (const code of [
      'COMPLETED',
      'RECRUITING',
      'INTERVENTIONAL',
      'OBSERVATIONAL',
      'PHASE2',
      'PHASE3',
      'RANDOMIZED',
      'NON_RANDOMIZED',
      'TRIPLE',
      'NONE',
      'TREATMENT',
      'PREVENTION',
      'ACTUAL',
      'ESTIMATED',
      'ALL',
      'FEMALE',
      'ADULT',
      'OLDER_ADULT',
      'OTHER',
    ]) {
      expect(main).not.toMatch(new RegExp(`\\b${code}\\b`, 'u'))
    }
    expect(main).not.toMatch(/\b[A-Z]{2,}(?:_[A-Z]+)+\b/u)
    const disclosure = html.slice(html.indexOf('<details'))
    expect(disclosure).toContain('Technical record: registry codes and snapshot')
    expect(disclosure).toContain('COMPLETED')
    expect(disclosure).toContain('sha256:')
  })

  it('translates an unmapped registry code into words instead of printing it', () => {
    const odd = study({
      nctId: 'NCT07777777',
      overallStatus: 'SOME_NEW_STATUS',
      design: { allocation: 'NEW_ALLOCATION_KIND', masking: null, primaryPurpose: null },
    })
    const html = render(view({ shown: [odd] }))
    const main = visibleText(mainView(html))
    expect(main).toContain('Some new status')
    expect(main).toContain('New allocation kind')
    expect(main).not.toContain('SOME_NEW_STATUS')
  })

  it('never characterises a result, an effect, safety or efficacy in its own words', () => {
    const html = render(view())
    const ownWords = visibleText(html).replace(/“[^”]*”/gu, '')
    expect(ownWords).not.toMatch(FORBIDDEN_CHARACTERISATIONS)
  })

  it('keeps heading order: one h3 for the section, one h4 per study, no h2', () => {
    const html = render(view())
    expect(html.match(/<h3\b/g)).toHaveLength(1)
    expect(html.match(/<h4\b/g)).toHaveLength(3)
    expect(html).not.toContain('<h2')
    expect(html).toContain('id="registered-trials"')
    expect(html).toContain('aria-labelledby="registered-trials-heading"')
  })
})
