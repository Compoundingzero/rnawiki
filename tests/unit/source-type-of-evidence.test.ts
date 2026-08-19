import { describe, expect, it } from 'vitest'
import { typeOfEvidence } from '@/components/evidence/EvidenceSourceList'
import type { EvidenceSourceView } from '@/lib/types'

/**
 * The "Type of evidence" row is built from three stored strings — `sourceType`, `studyDesign` and
 * `species` — by two heuristics, and both have printed something false.
 *
 * The plain-language gloss said "the work was done in cells or tissue outside a living body" on
 * Hsieh 2017, a row that names a live rat hind-limb model in the same line. That layer exists to
 * help a non-scientist, so a half-wrong gloss is worse than none.
 *
 * The de-duplication printed the same design twice on that row, because the containment test ran
 * on strings with their parentheticals stripped and the parenthetical was where one description
 * said everything the other did.
 *
 * Every fixture below is a verbatim pair from scripts/seed-data/*.ts.
 */
function source(fields: Partial<EvidenceSourceView>): EvidenceSourceView {
  return {
    id: 1,
    title: 'fixture',
    authors: null,
    publicationYear: null,
    journalOrIssuer: null,
    doi: null,
    pmid: null,
    clinicalTrialId: null,
    regulatoryUrl: null,
    sourceType: 'animal study (rat)',
    studyDesign: null,
    species: null,
    sampleSize: null,
    endpoint: null,
    retractionStatus: null,
    ...fields,
  }
}

describe('a mixed in vitro / in vivo design gets no gloss rather than a wrong one', () => {
  const hsieh = source({
    sourceType: 'mechanistic study (in vitro human vascular endothelial cells + in vivo rat hind-limb ischemia model)',
    studyDesign: 'in vitro cell assay combined with in vivo animal ischemia model',
    species: 'human cells (in vitro) and rat (in vivo)',
  })

  it('never says the work was done outside a living body when a live animal model is named', () => {
    expect(typeOfEvidence(hsieh)).not.toContain('outside a living body')
  })

  it('prints the design once, keeping the description that carries the detail', () => {
    expect(typeOfEvidence(hsieh)).toBe(
      'mechanistic study (in vitro human vascular endothelial cells + in vivo rat hind-limb ischemia model)'
    )
  })

  it('still glosses a purely in vitro / ex vivo design, where the sentence is true', () => {
    const cerovecki = source({
      sourceType: 'in vitro / ex vivo mechanistic study (cultured tendon fibroblasts and tendon explants)',
      studyDesign: 'in vitro / ex vivo mechanistic experiment',
      species: 'rat (cell/tissue source)',
    })
    expect(typeOfEvidence(cerovecki)).toContain('the work was done in cells or tissue outside a living body')
  })
})

describe('the de-duplication drops a description only when the other already carries it', () => {
  it('keeps both when they name different facts', () => {
    const itp = source({
      sourceType: 'animal study (mouse), multi-site randomized lifespan study',
      studyDesign: 'Multi-site (3 independent labs), randomized, controlled lifespan study — NIA Interventions Testing Program',
      species: 'Mus musculus (mouse)',
    })
    const text = typeOfEvidence(itp)
    expect(text).toContain('animal study (mouse)')
    expect(text).toContain('NIA Interventions Testing Program')
  })

  it('keeps both on a single-arm trial, where the design names the trial and the type names the phase', () => {
    const climb = source({
      sourceType: 'single-arm, open-label phase 1/2/3 clinical trial',
      studyDesign: 'single-group, open-label, multicenter (CLIMB SCD-121)',
      species: 'human',
    })
    const text = typeOfEvidence(climb)
    expect(text).toContain('phase 1/2/3')
    expect(text).toContain('CLIMB SCD-121')
  })

  it('keeps the registered-trial pair, which the "no results posted" rule reads separately', () => {
    const registry = source({
      sourceType: 'registered clinical trial record (Phase I, no results posted)',
      studyDesign: 'interventional Phase I safety/pharmacokinetics trial',
      species: 'human',
    })
    const text = typeOfEvidence(registry)
    expect(text).toContain('no results posted')
    expect(text).toContain('safety/pharmacokinetics')
  })

  it('drops the barer of two descriptions of one animal study', () => {
    const cerovecki2010 = source({
      sourceType: 'animal study (rat)',
      studyDesign: 'controlled animal injury study',
      species: 'rat',
    })
    expect(typeOfEvidence(cerovecki2010)).toBe('controlled animal injury study')
  })

  it('keeps the existing exact-containment behaviour on a systematic review', () => {
    const review = source({
      sourceType: 'systematic review',
      studyDesign: 'systematic review (PubMed, Cochrane, Embase; PROSPERO-checked; 1993 to June 3, 2024)',
      species: 'mixed (35 preclinical studies, 1 human clinical study)',
    })
    expect(typeOfEvidence(review)).toContain('PROSPERO-checked')
    expect(typeOfEvidence(review)).toContain('a search and summary of studies that already existed')
  })
})
