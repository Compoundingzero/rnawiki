/**
 * Classify the outcome-measure names that registered studies list.
 *
 * ClinicalTrials.gov records what a study said it would measure. That is not a result, and nothing
 * here turns it into one. What this file does is sort those names into the categories a reader
 * needs kept apart: whether the thing measured is something a person could feel, something only a
 * test shows, or something that changes how a life goes.
 *
 * The rules are fixed word lists, applied in a fixed order, and the version below is recorded next
 * to every classification so a later change is visible. No model runs. A name that matches nothing
 * stays `unknown_outcome` rather than being pushed into the nearest bucket, because a wrong bucket
 * here would turn a blood test into a health benefit.
 */
import type { OutcomeClass } from '@/lib/dossier-v3/taxonomy'

import type { CompassGoal, ExperienceKind } from './taxonomy'

export const OUTCOME_CLASSIFIER_VERSION = 'dossier-v4-outcome-classifier/v1'

export interface ClassifiedOutcome {
  /** The registered name, exactly as the registry recorded it. */
  term: string
  outcomeClass: OutcomeClass
  experience: ExperienceKind | null
  goals: CompassGoal[]
  /** Which rule fired, so a reviewer can see why. */
  rule: string
}

interface Rule {
  id: string
  outcomeClass: OutcomeClass
  experience: ExperienceKind | null
  patterns: RegExp[]
}

/**
 * Order matters. The first rule that matches wins, so the most specific and most consequential
 * categories are tested first: death before function, function before symptom, symptom before
 * laboratory value. A tie broken the other way would let "survival rate" land in "rate".
 */
const RULES: readonly Rule[] = [
  {
    id: 'mortality',
    outcomeClass: 'longevity_mortality',
    experience: 'meaningful',
    patterns: [
      /\b(?:all[- ]cause )?mortality\b/,
      /\bsurvival\b/,
      /\bdeath(?:s)?\b/,
      /\blife ?span\b/,
      /\btime to death\b/,
    ],
  },
  {
    id: 'clinical_event',
    outcomeClass: 'clinical_event',
    experience: 'meaningful',
    patterns: [
      /\bmyocardial infarction\b/,
      /\bheart attack\b/,
      /\bstroke\b/,
      /\bhospitali[sz]ation\b/,
      /\bmajor adverse\b/,
      /\bfracture\b/,
      /\brelapse\b/,
      /\bdisease progression\b/,
      /\bremission\b/,
      /\bincidence of (?:diabetes|cancer|dementia)\b/,
    ],
  },
  {
    id: 'safety',
    outcomeClass: 'safety_tolerability',
    experience: null,
    patterns: [
      /\badverse (?:event|effect|reaction)/,
      /\bsafety\b/,
      /\btolerability\b/,
      /\btoxicity\b/,
      /\bside effect/,
      /\bdiscontinuation\b/,
      /\bwithdrawal due to\b/,
    ],
  },
  {
    id: 'function_performance',
    outcomeClass: 'function_performance',
    experience: 'meaningful',
    patterns: [
      /\bfunctional (?:rating|capacity|scale|status)\b/,
      /\bmotor function\b/,
      /\bactivities of daily living\b/,
      /\bdisability\b/,
      /\bwalk(?:ing)? (?:test|distance|speed)\b/,
      /\bgait\b/,
      /\bmobility\b/,
      /\bindependen(?:ce|t living)\b/,
      /\bcognitive (?:function|performance|decline)\b/,
    ],
  },
  {
    id: 'measured_performance',
    outcomeClass: 'function_performance',
    experience: 'measured',
    patterns: [
      /\bstrength\b/,
      /\bpower output\b/,
      /\bhandgrip\b/,
      /\bgrip strength\b/,
      /\bdynamometer\b/,
      /\bone[- ]repetition\b/,
      /\b1rm\b/,
      /\bsprint\b/,
      /\btime to exhaustion\b/,
      /\bvo2\b/,
      /\bpeak (?:power|torque)\b/,
      /\bmedicin(?:e|al) ball throw\b/,
      /\bjump\b/,
      /\bexercise (?:capacity|performance)\b/,
      /\bendurance\b/,
    ],
  },
  {
    id: 'symptom_scale',
    outcomeClass: 'symptom_quality_of_life',
    experience: 'felt',
    patterns: [
      /\bdepression rating\b/,
      /\bdepression scale\b/,
      /\bhamilton\b/,
      /\bmadrs\b/,
      /\bmontgomery\b/,
      /\banxiety\b/,
      /\bquality of life\b/,
      /\bfatigue\b/,
      /\bpain\b/,
      /\bsleep quality\b/,
      /\binsomnia\b/,
      /\bmood\b/,
      /\bwell[- ]?being\b/,
      /\bsymptom\b/,
      /\bpositive and negative syndrome\b/,
      /\bglobal impression\b/,
      /\bappetite\b/,
      /\bsatiety\b/,
      /\bhunger\b/,
      /\bcraving\b/,
      /\bpatient[- ]reported\b/,
      /\bquestionnaire\b/,
      /\binventory\b/,
    ],
  },
  {
    id: 'body_composition',
    outcomeClass: 'biomarker_surrogate',
    experience: 'measured',
    patterns: [
      /\blean (?:body )?mass\b/,
      /\bfat mass\b/,
      /\bbody (?:mass index|weight|composition|fat)\b/,
      /\bskinfold\b/,
      /\bwaist circumference\b/,
      /\bmuscle (?:area|mass|volume|thickness)\b/,
      /\bbone mineral density\b/,
      /\bweight (?:loss|change|gain)\b/,
    ],
  },
  {
    id: 'laboratory_value',
    outcomeClass: 'biomarker_surrogate',
    experience: 'measured',
    patterns: [
      /\b(?:glycated )?h(?:a)?emoglobin\b/,
      /\bhba1c\b/,
      /\bcholesterol\b/,
      /\bldl\b/,
      /\bhdl\b/,
      /\btriglycerid/,
      /\bglucose\b/,
      /\binsulin\b/,
      /\bcreatinine\b/,
      /\bkidney function\b/,
      /\bliver (?:enzyme|function)\b/,
      /\bblood pressure\b/,
      /\bheart rate\b/,
      /\bconcentration(?:s)?\b/,
      /\bserum\b/,
      /\bplasma\b/,
      /\burin(?:e|ary)\b/,
      /\blevel(?:s)? of\b/,
      /\bbiomarker\b/,
      /\bflow[- ]mediated dilation\b/,
      /\binflammat/,
      /\bc[- ]reactive protein\b/,
      /\bmethylation\b/,
    ],
  },
  {
    id: 'imaging_or_tissue',
    outcomeClass: 'mechanistic_measurement',
    experience: 'measured',
    patterns: [
      /\bspectroscopy\b/,
      /\bmagnetic resonance\b/,
      /\bbiops(?:y|ies)\b/,
      /\bmuscle (?:phosphocreatine|glycogen)\b/,
      /\bphosphocreatine\b/,
      /\bmitochondrial\b/,
      /\bgene expression\b/,
      /\benzyme activity\b/,
      /\bcerebral\b/,
      /\bbrain (?:metabolite|concentration)\b/,
    ],
  },
  {
    id: 'adherence_or_process',
    outcomeClass: 'unknown_outcome',
    experience: null,
    patterns: [
      /\bcompletion of study\b/,
      /\brecruitment\b/,
      /\bfeasibility\b/,
      /\badherence\b/,
      /\bcompliance\b/,
      /\bacceptability\b/,
      /\bretention\b/,
    ],
  },
]

/** Goal word lists. A term may serve several goals; none is guessed from the reader. */
const GOAL_PATTERNS: ReadonlyArray<{ goal: CompassGoal; patterns: RegExp[] }> = [
  { goal: 'sleep', patterns: [/\bsleep\b/, /\binsomnia\b/, /\bapn(?:o|oe)a\b/] },
  { goal: 'energy', patterns: [/\bfatigue\b/, /\benergy\b/, /\bvitality\b/] },
  {
    goal: 'focus',
    patterns: [/\bcognitiv/, /\battention\b/, /\bmemory\b/, /\bconcentration task\b/],
  },
  {
    goal: 'mood',
    patterns: [/\bdepress/, /\bmood\b/, /\banxiety\b/, /\bhamilton\b/, /\bmadrs\b/, /\bmanic\b/],
  },
  {
    goal: 'strength',
    patterns: [
      /\bstrength\b/,
      /\bhandgrip\b/,
      /\bgrip\b/,
      /\bdynamometer\b/,
      /\b1rm\b/,
      /\bone[- ]repetition\b/,
    ],
  },
  {
    goal: 'muscle',
    patterns: [
      /\blean (?:body )?mass\b/,
      /\bmuscle (?:mass|area|volume|thickness)\b/,
      /\bsarcopenia\b/,
    ],
  },
  {
    goal: 'endurance',
    patterns: [
      /\bendurance\b/,
      /\bvo2\b/,
      /\btime to exhaustion\b/,
      /\bwalk(?:ing)? distance\b/,
      /\baerobic\b/,
    ],
  },
  { goal: 'recovery', patterns: [/\brecovery\b/, /\bsoreness\b/, /\brehabilitat/] },
  {
    goal: 'weight',
    patterns: [
      /\bbody (?:weight|mass index|fat|composition)\b/,
      /\bweight (?:loss|gain|change)\b/,
      /\bfat mass\b/,
      /\bobesity\b/,
    ],
  },
  {
    goal: 'glucose',
    patterns: [
      /\bglucose\b/,
      /\bhba1c\b/,
      /\bglycated h(?:a)?emoglobin\b/,
      /\binsulin\b/,
      /\bdiabet/,
    ],
  },
  {
    goal: 'cholesterol',
    patterns: [/\bcholesterol\b/, /\bldl\b/, /\bhdl\b/, /\btriglycerid/, /\blipid\b/],
  },
  { goal: 'pain', patterns: [/\bpain\b/, /\bache\b/, /\banalgesi/] },
  { goal: 'fertility', patterns: [/\bfertil/, /\bsperm\b/, /\bsexual\b/, /\btestosterone\b/] },
  {
    goal: 'healthy_aging',
    patterns: [
      /\bage(?:ing|d)\b/,
      /\bfrailty\b/,
      /\bmortality\b/,
      /\blife ?span\b/,
      /\bmethylation\b/,
    ],
  },
]

function normalise(term: string): string {
  return term.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Classify one registered outcome-measure name. Never returns a result, only a category. */
export function classifyOutcomeTerm(term: string): ClassifiedOutcome {
  const text = normalise(term)
  const goals = GOAL_PATTERNS.filter((entry) =>
    entry.patterns.some((pattern) => pattern.test(text)),
  ).map((entry) => entry.goal)
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return {
        term,
        outcomeClass: rule.outcomeClass,
        experience: rule.experience,
        goals,
        rule: rule.id,
      }
    }
  }
  return { term, outcomeClass: 'unknown_outcome', experience: null, goals, rule: 'unmatched' }
}

export function classifyOutcomeTerms(terms: readonly string[]): ClassifiedOutcome[] {
  const seen = new Set<string>()
  const out: ClassifiedOutcome[] = []
  for (const term of terms) {
    const key = normalise(term)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(classifyOutcomeTerm(term))
  }
  return out
}

/** Group classified terms by the three reader categories, keeping the unmatched ones visible. */
export interface ExperienceGrouping {
  felt: ClassifiedOutcome[]
  measured: ClassifiedOutcome[]
  meaningful: ClassifiedOutcome[]
  /** Safety, process and unmatched names. Shown, not silently dropped. */
  uncategorised: ClassifiedOutcome[]
}

export function groupByExperience(classified: readonly ClassifiedOutcome[]): ExperienceGrouping {
  const grouping: ExperienceGrouping = {
    felt: [],
    measured: [],
    meaningful: [],
    uncategorised: [],
  }
  for (const entry of classified) {
    if (entry.experience === 'felt') grouping.felt.push(entry)
    else if (entry.experience === 'measured') grouping.measured.push(entry)
    else if (entry.experience === 'meaningful') grouping.meaningful.push(entry)
    else grouping.uncategorised.push(entry)
  }
  return grouping
}
