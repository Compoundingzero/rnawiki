import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  homeFeaturedAnswerFromDossier,
  homeFeaturedMedicineAnswer,
} from '@/lib/home-featured-medicine'
import { SEED_DOSSIERS } from '@/scripts/seed-data'
import type { DrugDossier } from '@/lib/types'

const inclisiran = {
  id: 'inclisiran',
  name: 'Inclisiran',
  sponsor: '',
  targetGene: '',
  targetProtein: '',
  modality: 'siRNA (Small Interfering RNA)',
  approvalStatus: 'FDA Approved',
  indication: 'High LDL cholesterol',
  patientFriendlyIndication: 'High LDL cholesterol',
  oneSentenceVerdict: '',
  laymanHowItWorks: '',
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

const root = process.cwd()
const homePage = readFileSync(join(root, 'app/page.tsx'), 'utf8')
const homeView = readFileSync(join(root, 'components/HomeView.tsx'), 'utf8')
const homeSearch = readFileSync(join(root, 'components/HomeSearch.tsx'), 'utf8')

/**
 * The mapper itself is still the only way a medicine purpose may be built from a dossier, so its
 * behaviour is tested whether or not a surface currently calls it. The home page stopped rendering
 * a featured medicine card in the Phase 4 build; the assertions about the page below therefore
 * describe what home now holds — the frozen search bar, then the corpus entry.
 */
describe('featured medicine answer mapper', () => {
  it('passes through the canonical dossier purpose and programme scope without rewriting them', () => {
    const usedFor = 'Used or studied for adults with artery disease and high LDL cholesterol.'

    expect(
      homeFeaturedAnswerFromDossier({
        slug: 'inclisiran',
        bindingState: 'published_programme',
        selectedProgrammeLabel: 'Adults with artery disease and high LDL cholesterol',
        readerSummary: {
          basis: 'published_programme',
          usedFor,
          takeaway: 'A reviewed finding.',
          simplified: true,
          contextItems: [],
        },
      }),
    ).toEqual({
      href: '/d/inclisiran',
      answerFor: 'Adults with artery disease and high LDL cholesterol',
      usedFor,
    })
  })

  it('does not apply the Inclisiran override to a slug with empty evidence', () => {
    expect(homeFeaturedMedicineAnswer(inclisiran, null)).toEqual({
      href: '/d/inclisiran',
      usedFor: 'Used or studied for people with high LDL (“bad”) cholesterol.',
    })
  })

  it('keeps the exact Inclisiran purpose when its real seeded evidence fingerprint matches', () => {
    const seed = SEED_DOSSIERS.find((dossier) => dossier.slug === 'inclisiran')
    expect(seed).toBeDefined()
    const seededInclisiran: DrugDossier = {
      ...seed!,
      id: seed!.slug,
      molecularSchema: undefined,
      dossierDepth: 'flagship',
      sourceProvenance: seed!.sources.map((source) =>
        `${source.label} (${source.identifier})`.slice(0, 300),
      ),
      auditPointsCount: {
        measured: seed!.keyAudits.filter((audit) => audit.category === 'measured').length,
        inferred: seed!.keyAudits.filter((audit) => audit.category === 'inferred').length,
        failed: seed!.keyAudits.filter((audit) => audit.category === 'failed').length,
        conclusionShift: seed!.keyAudits.filter((audit) => audit.category === 'conclusion_shift')
          .length,
      },
    }

    expect(homeFeaturedMedicineAnswer(seededInclisiran, null)).toEqual({
      href: '/d/inclisiran',
      usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
    })
  })
})

describe('the frozen home search bar', () => {
  it('is the same component, with the same props, in the same place', () => {
    expect(homeSearch).toContain('export interface HomeSearchProps {\n  popular: SearchHit[]\n}')
    expect(homeSearch).toContain('export function HomeSearch({ popular }: HomeSearchProps) {')
    expect(homeView).toContain("import { HomeSearch } from './HomeSearch'")
    expect(homeView).toContain('<HomeSearch popular={popular} />')

    // The bar sits in the headline section, and nothing is inserted between the two.
    const headline = homeView.indexOf('Understand any drug')
    const bar = homeView.indexOf('<HomeSearch popular={popular} />')
    expect(headline).toBeGreaterThan(-1)
    expect(bar).toBeGreaterThan(headline)
    expect(homeView.slice(headline, bar)).not.toContain('<section')
  })

  it('keeps the input element itself unchanged', () => {
    const start = homeSearch.indexOf('        <input')
    const end = homeSearch.indexOf('/>', homeSearch.indexOf('aria-activedescendant'))
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const input = homeSearch.slice(start, end + 2)

    for (const line of [
      'ref={inputRef}',
      'type="text"',
      'autoFocus',
      'placeholder="Search medicine, condition, gene, or protein..."',
      'value={search.query}',
      'onChange={(e) => search.setQuery(e.target.value)}',
      'onFocus={search.open}',
      'onKeyDown={search.onKeyDown}',
      'aria-label="Search by medicine, condition, gene, or protein"',
      'role="combobox"',
      'aria-expanded={showDropdown}',
      'aria-controls={search.listboxId}',
      'aria-autocomplete="list"',
      'aria-activedescendant={',
    ]) {
      expect(input, line).toContain(line)
    }

    // The popular-search row below the bar is part of the frozen bar and still reads from `popular`.
    expect(homeSearch).toContain('{popular.length > 0 && (')
    expect(homeSearch).toContain('popular.slice(0, 4).map')
  })
})

describe('the home page below the frozen search bar', () => {
  it('carries the organism-ladder legend and the five facet indexes, in that order', () => {
    expect(homeView).toContain(
      "import { OrganismLadderLegend } from './corpus/OrganismLadderLegend'",
    )
    expect(homeView).toContain("import { FacetNav } from '@/app/browse/facet-view'")

    const bar = homeView.indexOf('<HomeSearch popular={popular} />')
    const ladder = homeView.indexOf('<OrganismLadderLegend')
    const facets = homeView.indexOf('<FacetNav />')
    expect(ladder).toBeGreaterThan(bar)
    expect(facets).toBeGreaterThan(ladder)
    expect(homeView).toContain('Organism ladder')
  })

  it('builds no featured medicine card and reads no medicine projection for the home page', () => {
    for (const forbidden of [
      'homeFeaturedMedicineAnswer',
      'homeFeaturedAnswerFromDossier',
      'getProgrammeEvidenceByMedicineSlug',
      'getPublicMedicineProjections',
    ]) {
      expect(homePage, forbidden).not.toContain(forbidden)
    }
    for (const forbidden of [
      'featuredAnswer',
      'featuredCard',
      'toPublicMedicineCardView',
      'oneSentenceVerdict',
      'What is it for?',
    ]) {
      expect(homeView, forbidden).not.toContain(forbidden)
    }
  })

  it('passes the home page only the counts and lists it renders', () => {
    expect(homePage).toContain('<HomeView')
    expect(homePage).toContain('popular={popular}')
    expect(homePage).toContain('corpusStats={{')
    expect(homePage).toContain('contributorSpotlight={contributorSpotlight}')
  })
})
