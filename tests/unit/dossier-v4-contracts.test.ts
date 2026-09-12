import { describe, expect, it } from 'vitest'

import { COMPLETION_STATE_CODES, type CompletionState } from '@/lib/dossier-v3/taxonomy'
import {
  auditCopy,
  copyPasses,
  findForbiddenPhrases,
  findInternalKeys,
  sentenceStats,
} from '@/lib/dossier-v3/copy-contract'
import { CONCEPTS, conceptsForPage, prerequisiteWalk } from '@/lib/dossier-v4/concepts'
import { COMPASS_COPY, TRUTH_TERM_LABELS, nothingFoundLine } from '@/lib/dossier-v4/copy'
import {
  classifyOutcomeTerm,
  classifyOutcomeTerms,
  groupByExperience,
} from '@/lib/dossier-v4/outcome-classifier'
import {
  ALTERNATIVE_TIERS,
  CLAIM_POSITIONS,
  COMMUNITY_REPORT_CATEGORIES,
  COMPASS_GOALS,
  EXPERIENCE_TRAPS,
  FINGERPRINT_COLUMNS,
  FINGERPRINT_STATES,
  IDENTITY_RELATIONS,
  INTERACTION_STATES,
  NO_RESPONSE_REASONS,
  PURPOSES,
  SAFETY_ACTION_CLASSES,
  SAFETY_EVIDENCE_SOURCES,
  SECTION_STATES,
  STAIRCASE_LEVELS,
  TIMELINE_FACETS,
  TRUTH_LANES,
  V4_GATES,
  compassGoalFromV3,
  identityRelationCarriesEvidence,
  sectionStateFromCompletion,
} from '@/lib/dossier-v4/taxonomy'
import { COMPASS_SECTIONS } from '@/lib/dossier-v4/view-model'

const VOCABULARIES = [
  ['truth lanes', TRUTH_LANES],
  ['section states', SECTION_STATES],
  ['purposes', PURPOSES],
  ['goals', COMPASS_GOALS],
  ['fingerprint states', FINGERPRINT_STATES],
  ['fingerprint columns', FINGERPRINT_COLUMNS],
  ['staircase levels', STAIRCASE_LEVELS],
  ['timeline facets', TIMELINE_FACETS],
  ['no-response reasons', NO_RESPONSE_REASONS],
  ['interaction states', INTERACTION_STATES],
  ['safety evidence sources', SAFETY_EVIDENCE_SOURCES],
  ['safety action classes', SAFETY_ACTION_CLASSES],
  ['identity relations', IDENTITY_RELATIONS],
  ['alternative tiers', ALTERNATIVE_TIERS],
  ['claim positions', CLAIM_POSITIONS],
  ['community categories', COMMUNITY_REPORT_CATEGORIES],
  ['gates', V4_GATES],
  ['experience traps', EXPERIENCE_TRAPS],
] as const

describe('every v4 vocabulary is renderable', () => {
  it.each(VOCABULARIES)('%s have unique codes and a reader label', (_name, entries) => {
    const codes = entries.map((entry) => entry.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const entry of entries) {
      expect(entry.label.length).toBeGreaterThan(0)
      // A code is an internal key. It must never be the thing a reader is shown.
      expect(entry.label).not.toBe(entry.code)
    }
  })

  it('no vocabulary label carries an internal key pattern into reader text', () => {
    for (const [, entries] of VOCABULARIES) {
      for (const entry of entries) {
        expect(findInternalKeys(entry.label)).toEqual([])
      }
    }
  })

  it('no vocabulary label or explanation uses a forbidden marketing phrase', () => {
    for (const [, entries] of VOCABULARIES) {
      for (const entry of entries) {
        const text = `${entry.label} ${'plain' in entry ? entry.plain : ''}`
        expect(findForbiddenPhrases(text)).toEqual([])
      }
    }
  })
})

describe('section states bridge cleanly from the v3 completion states', () => {
  it.each(COMPLETION_STATE_CODES)('maps %s to a v4 section state', (code) => {
    const mapped = sectionStateFromCompletion(code as CompletionState)
    expect(SECTION_STATES.map((state) => state.code)).toContain(mapped)
  })

  it('never turns an unknown into a clean absence', () => {
    // "awaiting review" and "nothing found" are different facts and must stay different.
    expect(sectionStateFromCompletion('awaiting_human_review')).toBe('awaiting_review')
    expect(sectionStateFromCompletion('no_qualifying_evidence_after_search')).toBe(
      'no_qualifying_evidence',
    )
    expect(sectionStateFromCompletion('not_applicable')).toBe('not_applicable')
  })
})

describe('the compass section order', () => {
  it('has unique anchors and a lane for every section', () => {
    const ids = COMPASS_SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const section of COMPASS_SECTIONS) {
      expect(TRUTH_LANES.map((lane) => lane.code)).toContain(section.lane)
      expect(section.short.length).toBeLessThanOrEqual(20)
    }
  })

  it('puts what the substance does before the registry technical disclosure', () => {
    const ids = COMPASS_SECTIONS.map((section) => section.id)
    expect(ids.indexOf('substance-action')).toBeLessThan(ids.indexOf('evidence-receipts'))
    expect(ids.indexOf('substance-action')).toBe(0)
  })

  it('keeps the human result ahead of the body path, so a mechanism never leads', () => {
    const ids = COMPASS_SECTIONS.map((section) => section.id)
    expect(ids.indexOf('human-results')).toBeLessThan(ids.indexOf('body-journey'))
  })

  it('every purpose anchor points at a real section', () => {
    const ids = new Set(COMPASS_SECTIONS.map((section) => section.id))
    for (const purpose of PURPOSES) expect(ids.has(purpose.target)).toBe(true)
  })
})

describe('goal mapping', () => {
  it('maps every v3 goal that v4 claims to carry', () => {
    expect(compassGoalFromV3('body_fat_weight')).toBe('weight')
    expect(compassGoalFromV3('glucose_metabolic')).toBe('glucose')
    expect(compassGoalFromV3('cardiovascular_risk')).toBe('cholesterol')
    expect(compassGoalFromV3('not_a_goal')).toBeNull()
  })

  it('keeps the two entry states out of the v3 mapping', () => {
    const entries = COMPASS_GOALS.filter((goal) => goal.v3 === null).map((goal) => goal.code)
    expect(entries).toEqual(['diagnosed_condition', 'just_learning'])
  })
})

describe('identity relations decide whether evidence carries', () => {
  it('only the same-substance relations carry evidence across', () => {
    const carrying = IDENTITY_RELATIONS.filter((relation) => relation.carries).map(
      (relation) => relation.code,
    )
    expect(carrying).toEqual(['same_entity_as', 'synonym_of'])
  })

  it('a salt, an isomer, a component and a class member never carry evidence', () => {
    for (const code of ['salt_of', 'isomer_of', 'component_of', 'member_of_class'] as const) {
      expect(identityRelationCarriesEvidence(code)).toBe(false)
    }
  })
})

describe('interaction states never offer reassurance', () => {
  it('has no state that means the pair is fine', () => {
    const labels = INTERACTION_STATES.map((state) => state.label.toLowerCase()).join(' ')
    expect(labels).not.toContain('safe')
    expect(labels).not.toContain('no interaction')
  })

  it('marks only the documented-important state as urgent', () => {
    const urgent = INTERACTION_STATES.filter((state) => state.urgent).map((state) => state.code)
    expect(urgent).toEqual(['documented_important'])
  })
})

describe('the outcome classifier sorts registered measure names', () => {
  it('puts survival above everything else', () => {
    expect(classifyOutcomeTerm('overall survival').outcomeClass).toBe('longevity_mortality')
    expect(classifyOutcomeTerm('overall survival').experience).toBe('meaningful')
  })

  it('separates a test result from a thing a person feels', () => {
    expect(classifyOutcomeTerm('glycated hemoglobin').experience).toBe('measured')
    expect(classifyOutcomeTerm('hamilton depression rating scale').experience).toBe('felt')
  })

  it('classifies the creatine measures the registry actually lists', () => {
    const classified = classifyOutcomeTerms([
      'muscle strength',
      'lean mass',
      'total functional capacity',
      'fatigue severity scale',
      'serum creatinine',
      'lumbar spine bone mineral density',
      'completion of study',
    ])
    const byTerm = new Map(classified.map((entry) => [entry.term, entry]))
    expect(byTerm.get('muscle strength')?.experience).toBe('measured')
    expect(byTerm.get('muscle strength')?.goals).toContain('strength')
    expect(byTerm.get('lean mass')?.goals).toContain('muscle')
    expect(byTerm.get('total functional capacity')?.experience).toBe('meaningful')
    expect(byTerm.get('fatigue severity scale')?.experience).toBe('felt')
    expect(byTerm.get('serum creatinine')?.outcomeClass).toBe('biomarker_surrogate')
    expect(byTerm.get('completion of study')?.outcomeClass).toBe('unknown_outcome')
  })

  it('never pushes an unrecognised name into the nearest bucket', () => {
    const entry = classifyOutcomeTerm('zzz undocumented registry phrase')
    expect(entry.outcomeClass).toBe('unknown_outcome')
    expect(entry.experience).toBeNull()
    expect(entry.rule).toBe('unmatched')
  })

  it('a bone density scan is a test result and not a life outcome', () => {
    // The failure this guards: a biomarker rendered as a clinical benefit.
    expect(classifyOutcomeTerm('femoral neck bone mineral density').outcomeClass).toBe(
      'biomarker_surrogate',
    )
    expect(classifyOutcomeTerm('femoral neck bone mineral density').experience).not.toBe(
      'meaningful',
    )
  })

  it('deduplicates names that differ only by case or spacing', () => {
    const classified = classifyOutcomeTerms([
      'Muscle  Strength',
      'muscle strength',
      'MUSCLE STRENGTH',
    ])
    expect(classified).toHaveLength(1)
  })

  it('groups without losing the names it could not categorise', () => {
    const classified = classifyOutcomeTerms(['safety', 'muscle strength', 'made up phrase'])
    const grouped = groupByExperience(classified)
    const total =
      grouped.felt.length +
      grouped.measured.length +
      grouped.meaningful.length +
      grouped.uncategorised.length
    expect(total).toBe(classified.length)
    expect(grouped.uncategorised.map((entry) => entry.term)).toContain('safety')
  })
})

describe('the concept prerequisite graph', () => {
  it('every prerequisite names a concept that exists', () => {
    const ids = new Set(CONCEPTS.map((entry) => entry.id))
    for (const entry of CONCEPTS) {
      for (const prerequisite of entry.prerequisites) expect(ids.has(prerequisite)).toBe(true)
    }
  })

  it('every analogy carries the place it stops being true', () => {
    for (const entry of CONCEPTS) {
      expect(entry.analogy.length).toBeGreaterThan(0)
      expect(entry.analogyLimit.length).toBeGreaterThan(0)
      expect(entry.analogyLimit).not.toBe(entry.analogy)
    }
  })

  it('every beginner definition is one short sentence', () => {
    for (const entry of CONCEPTS) {
      const stats = sentenceStats(entry.beginner)
      expect(stats.over30).toBe(0)
      expect(stats.sentences).toBe(1)
    }
  })

  it('orders a prerequisite before the concept that needs it', () => {
    const walk = prerequisiteWalk(['small_interfering_rna'], 10).map((entry) => entry.id)
    expect(walk.indexOf('gene')).toBeLessThan(walk.indexOf('messenger_rna'))
    expect(walk.indexOf('messenger_rna')).toBeLessThan(walk.indexOf('small_interfering_rna'))
  })

  it('caps the default journey at four concepts', () => {
    const walk = prerequisiteWalk(['small_interfering_rna', 'confidence_interval', 'interaction'])
    expect(walk.length).toBeLessThanOrEqual(4)
  })

  it('ignores a concept id that does not exist rather than throwing', () => {
    expect(prerequisiteWalk(['not_a_concept'], 4)).toEqual([])
  })

  it('picks the RNA chain for an RNA medicine and never for a supplement', () => {
    const base = {
      showsBiomarker: false,
      showsConfidenceInterval: false,
      showsAnimalEvidence: false,
      showsInteraction: false,
      showsFormulationDifference: false,
      showsRandomisedTrial: false,
    }
    const rna = conceptsForPage({ ...base, isRnaMedicine: true }).map((entry) => entry.id)
    expect(rna).toContain('small_interfering_rna')
    const supplement = conceptsForPage({ ...base, isRnaMedicine: false }).map((entry) => entry.id)
    expect(supplement).not.toContain('small_interfering_rna')
  })
})

describe('the fixed v4 sentences obey the plain-language contract', () => {
  const sentences = Object.values(COMPASS_COPY)

  it('none is over the hard sentence limit', () => {
    for (const sentence of sentences) expect(sentenceStats(sentence).over30).toBe(0)
  })

  it('none carries a forbidden phrase or an internal key', () => {
    for (const sentence of sentences) {
      expect(findForbiddenPhrases(sentence)).toEqual([])
      expect(findInternalKeys(sentence)).toEqual([])
    }
  })

  it('passes the whole copy audit as one block of reader text', () => {
    expect(copyPasses(auditCopy(sentences.join(' ')))).toBe(true)
  })

  it('never turns an absence into reassurance', () => {
    const joined = sentences.join(' ').toLowerCase()
    expect(joined).not.toContain('safe together')
    expect(joined).not.toContain('no known risk')
    expect(COMPASS_COPY.absenceIsNotSafety.toLowerCase()).toContain('not the same as')
  })

  it('keeps a mechanism, a biomarker, an animal result and a prediction apart from a benefit', () => {
    expect(COMPASS_COPY.mechanismIsNotBenefit).toMatch(/not a result/i)
    expect(COMPASS_COPY.biomarkerIsNotOutcome).toMatch(/not the same/i)
    expect(COMPASS_COPY.animalIsNotHuman).toMatch(/does not say/i)
    expect(COMPASS_COPY.predictionIsNotFinding).toMatch(/does not publish/i)
  })

  it('names what was searched when it reports finding nothing', () => {
    const line = nothingFoundLine('two named registers', '2026-09-06')
    expect(line).toContain('two named registers')
    expect(line).toContain('2026-09-06')
    expect(line).toContain(COMPASS_COPY.absenceIsNotSafety)
  })

  it('the five truth terms are all present and distinct', () => {
    const labels = Object.values(TRUTH_TERM_LABELS)
    expect(labels).toHaveLength(5)
    expect(new Set(labels).size).toBe(5)
    expect(labels).toContain('What this does not prove')
    expect(labels).toContain('What we still do not know')
  })
})

describe('the concept cap keeps the subject, not only its background', () => {
  it('a deep chain still ends at the concept that was asked for', () => {
    // The defect this guards: slicing the front of the walk returned cell, protein, gene and
    // messenger RNA for an RNA medicine, and dropped the small interfering RNA being explained.
    const walk = prerequisiteWalk(['small_interfering_rna'], 4).map((entry) => entry.id)
    expect(walk).toHaveLength(4)
    expect(walk.at(-1)).toBe('small_interfering_rna')
    expect(walk.indexOf('messenger_rna')).toBeLessThan(walk.indexOf('small_interfering_rna'))
  })

  it('keeps every requested root when several are asked for', () => {
    const walk = prerequisiteWalk(['confidence_interval', 'half_life', 'route'], 4).map(
      (entry) => entry.id,
    )
    for (const root of ['confidence_interval', 'half_life', 'route']) {
      expect(walk).toContain(root)
    }
  })
})
