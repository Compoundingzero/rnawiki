import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CompassPage } from '@/components/dossier/v4/CompassPage'
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'
import type { ProgrammeEvidenceReadModel } from '@/lib/evidence/types'

beforeEach(() => vi.stubGlobal('React', React))
afterEach(() => vi.unstubAllGlobals())

const corpus = {
  slug: 'example-substance',
  displayName: 'Example substance',
  synonyms: [],
  sources: [],
  licenceNotes: [],
  registerEvents: [],
  registration: [],
  controlledSchedules: [],
  identifiers: [],
  relationNotes: [],
  relations: [],
} as unknown as CorpusDossier

function emptyModel(): DossierV4ViewModel {
  return {
    publication: { state: 'limited' },
    identity: {
      canonicalName: 'Example substance',
      substanceTypeCode: 'medicine',
      substanceType: 'Medicine',
      substanceTypeBasis: 'Fixture',
      availabilityCode: 'unresolved',
      availability: 'Supply status unclear',
      availabilityBasis: 'Fixture',
      jurisdictions: [],
      identityVerified: true,
      identityLabel: 'Identity checked',
    },
    substance: { empty: true },
    searchedRegisters: [],
    safety: { entries: [] },
    stack: { entries: [] },
    changes: { state: 'source_checked_draft', entries: [] },
    wordingHistory: [],
    formCheck: { entries: [] },
    hero: { strongestGoalResult: { origin: 'absent' }, resultScope: null },
    humanResults: { namedTrial: [], trialSnapshots: [] },
  } as unknown as DossierV4ViewModel
}

describe('empty-record safety and page audit', () => {
  it('shows a source-bound product-label warning despite having no general evidence answer', () => {
    const model = emptyModel()
    model.safety.entries.push({
      actionLabel: 'Read before use',
      text: 'Product-label boxed warning retained on this record.',
      evidenceSource: 'product_label',
      sources: [{ label: 'Exact product label', url: 'https://dailymed.nlm.nih.gov/example' }],
    } as DossierV4ViewModel['safety']['entries'][number])

    const html = renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
    expect(html).toContain('No source-linked answer for this substance')
    expect(html).toContain('What can go wrong?')
    expect(html).toContain('Product-label boxed warning retained on this record.')
    expect(html).toContain('https://dailymed.nlm.nih.gov/example')
    expect(html).not.toContain('This record has no source-bound safety statement to show.')
  })

  it('keeps a recorded public wording correction visible at the end of a sparse record', () => {
    const model = emptyModel()
    model.changes.entries.push({
      when: '2026-09-19',
      text: 'Corrected the public description.',
      fullText: 'Corrected the public description.',
      alteredPublicConclusion: false,
    } as DossierV4ViewModel['changes']['entries'][number])

    const html = renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
    expect(html).toContain('What changed on this page')
    expect(html).toContain('Corrected the public description.')
  })

  it('shows published wording history even without a separate evidence correction', () => {
    const model = emptyModel()
    model.changes.state = 'no_qualifying_evidence'
    model.wordingHistory.push({
      statementKey: 'hero.opening',
      label: 'Opening sentence',
      previousText: 'Earlier wording',
      currentText: 'Current wording',
      changedOn: '2026-09-19',
      reason: 'Clearer language',
      approvals: 2,
      qualifiedReviewerTookPart: true,
      sourceChanged: false,
      state: 'published',
    } as DossierV4ViewModel['wordingHistory'][number])

    const html = renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
    expect(html).toContain('What changed on this page')
    expect(html).toContain('Current wording')
  })

  it('never lets a published programme conclusion bypass an identity hold', () => {
    const model = emptyModel()
    model.publication = {
      state: 'correction_hold',
      label: 'Record link needs checking',
      reason: 'Identity unresolved',
    } as DossierV4ViewModel['publication']
    const programmeEvidence = {
      selectedProgramme: {
        title: 'A selected programme',
        verdict: { bestSupportedFinding: 'A published result that must be held.' },
      },
    } as unknown as ProgrammeEvidenceReadModel

    const html = renderToStaticMarkup(
      React.createElement(CompassPage, { corpus, model, programmeEvidence }),
    )
    expect(html).toContain('The ingredient identity is unclear')
    expect(html).not.toContain('A published result that must be held.')
    expect(html).not.toContain('Evidence for this use')
  })

  it('points to the exact study source without showing numbers whose condition and form are unbound', () => {
    const model = emptyModel()
    model.substance.empty = false
    model.hero.whyPeopleCare = {
      origin: 'absent',
      state: 'no_qualifying_evidence',
      basis: 'Fixture',
      text: '',
      sources: [],
    }
    model.hero.simpleAction = {
      origin: 'stored_source',
      state: 'source_checked_draft',
      basis: 'Fixture',
      text: 'A source-linked identity is recorded.',
      sources: [],
    }
    model.humanResults.namedTrial.push({
      text: 'Unscoped numbers that must stay out of the reader summary.',
      origin: 'stored_source',
      citation: {
        label: 'ClinicalTrials.gov',
        id: 'NCT03399370',
        url: 'https://clinicaltrials.gov/study/NCT03399370',
        binding: 'record',
      },
    })

    const html = renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
    expect(html).toContain(
      'No source on this page yet connects this exact substance to a measured human result',
    )
    expect(html).toContain('Source records for results not yet scoped to a condition and form')
    expect(html).toContain('https://clinicaltrials.gov/study/NCT03399370')
    expect(html).not.toContain('Unscoped numbers that must stay out of the reader summary.')
  })

  it('shows cited product and register facts without calling a listing an approval', () => {
    const model = emptyModel()
    model.substance.empty = false
    model.checkpoint = {
      kind: 'source_statement',
      claim: {
        label: 'What one source says about use',
        text: 'A source describes one recorded use.',
        sources: [{ label: 'Source document', url: 'https://example.org/use' }],
      },
      tested: null,
      studied: null,
      measured: null,
      boundary: null,
      product: null,
    }
    model.practical = {
      sourceBoundSupply: [
        {
          text: 'Example brand is a tablet, recorded as marketed in the United States.',
          origin: 'derived_count',
          citation: { label: 'Named product record', url: 'https://example.org/product' },
        },
      ],
    } as unknown as DossierV4ViewModel['practical']
    model.formCheck.supply = [
      {
        text: 'Two directory listings name this ingredient.',
        origin: 'derived_count',
        citation: { label: 'Product directory', url: 'https://example.org/directory' },
      },
    ]
    model.story = {
      regulatory: [
        {
          text: 'The register records a marketing start date for one listed product.',
          origin: 'derived_count',
          citation: { label: 'Register', url: 'https://example.org/register' },
        },
      ],
    } as unknown as DossierV4ViewModel['story']

    const html = renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
    expect(html).toContain('Products and forms in the sources')
    expect(html).toContain('Example brand is a tablet')
    expect(html).toContain('Two directory listings')
    expect(html).toContain('marketing start date')
    expect(html).toContain('https://example.org/product')
    expect(html).toContain('https://example.org/directory')
    expect(html).toContain('https://example.org/register')
    expect(html).toContain('a listing is an approval')
  })
})
