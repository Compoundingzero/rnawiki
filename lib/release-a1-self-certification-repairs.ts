/**
 * Release A.1's exact legacy-editorial repairs.
 *
 * These are deliberately data, not a prose rewriter. Each entry names one medicine, one stored
 * column, one exact JSON path, and the complete text fragment expected there. A repair is allowed
 * only when that exact fragment is present once, or when its exact replacement is already present.
 * Anything else is a stale precondition and must stop the transaction rather than overwrite later
 * human work.
 */

export const RELEASE_A1_REPAIRABLE_COLUMNS = [
  'conditionContext',
  'substitutes',
  'keyAudits',
  'measuredVsInferredSummary',
  'commonQuestions',
] as const

export type ReleaseA1RepairableColumn = (typeof RELEASE_A1_REPAIRABLE_COLUMNS)[number]

export interface ReleaseA1SelfCertificationRepair {
  slug: string
  column: ReleaseA1RepairableColumn
  /** Path inside the stored JSON column. */
  path: readonly (string | number)[]
  expectedText: string
  replacementText: string
}

export const RELEASE_A1_SELF_CERTIFICATION_REPAIRS = [
  {
    slug: 'buspirone',
    column: 'keyAudits',
    path: [0, 'technicalDetails'],
    expectedText:
      'This is the flattest mechanism statement of any drug in this file, and it is also the most honest.',
    replacementText:
      'The label records the uncertainty together with receptor-binding observations, without assigning an intrinsic activity it does not state.',
  },
  {
    slug: 'caffeine',
    column: 'conditionContext',
    path: ['whyItMatters'],
    expectedText:
      'This is the page in this file where the evidence is strongest, and saying so plainly is what makes the sceptical pages elsewhere worth reading.',
    replacementText: 'The evidence base for these uses is unusually large.',
  },
  {
    slug: 'caffeine',
    column: 'substitutes',
    path: ['summary'],
    expectedText:
      'For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base — which is the honest verdict this page exists to record.',
    replacementText:
      'For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base.',
  },
  {
    slug: 'caplacizumab-yhdp',
    column: 'keyAudits',
    path: [5, 'technicalDetails'],
    expectedText:
      'The price reflects the rarity of the disease and the absence of an alternative, not the difficulty of making the molecule, and this page states that plainly rather than implying a cost basis it cannot document.',
    replacementText:
      'No cited cost-of-production evidence ties that price to the manufacturing steps described above.',
  },
  {
    slug: 'cefdinir',
    column: 'conditionContext',
    path: ['whyItMatters'],
    expectedText:
      'Its label restricts every respiratory indication to penicillin-susceptible pneumococcus, records that it lost a head-to-head trial against amoxicillin-clavulanate, and states plainly that only intramuscular penicillin has been shown to prevent rheumatic fever.',
    replacementText:
      'Its label restricts every respiratory indication to penicillin-susceptible pneumococcus, records that it lost a head-to-head trial against amoxicillin-clavulanate, and states that only intramuscular penicillin has been shown to prevent rheumatic fever.',
  },
  {
    slug: 'cephalexin',
    column: 'commonQuestions',
    path: [4, 'a'],
    expectedText:
      'Nobody measured that in either trial on this page, and it is the honest answer rather than a hedge.',
    replacementText: 'Neither trial measured that.',
  },
  {
    slug: 'colchicine',
    column: 'commonQuestions',
    path: [0, 'a'],
    expectedText:
      'The honest position is that this is now genuinely unsettled, and it is not a question this page can resolve for you.',
    replacementText: 'The available cardiovascular evidence is now genuinely unsettled.',
  },
  {
    slug: 'collagen-peptides',
    column: 'commonQuestions',
    path: [1, 'a'],
    expectedText:
      'They do, and this page records that plainly: nineteen randomised double-blind trials in 1,125 people, pooled, showed favourable hydration, elasticity and wrinkle results against placebo.',
    replacementText:
      'They do: nineteen randomised double-blind trials in 1,125 people, pooled, showed favourable hydration, elasticity and wrinkle results against placebo.',
  },
  {
    // The old sentence-only ratchet missed this unpunctuated public list item. The phrase-aware
    // field scanner finds it, so it is repaired with the same exact guard as the sixteen sentences.
    slug: 'collagen-peptides',
    column: 'measuredVsInferredSummary',
    path: ['realWorldOutcome', 0],
    expectedText:
      'The pooled skin evidence is positive and this page records that plainly, with its surrogate endpoints and funding concentration stated',
    replacementText:
      'The pooled skin evidence is positive, with surrogate endpoints and concentrated industry funding among its limitations',
  },
  {
    slug: 'fondaparinux',
    column: 'commonQuestions',
    path: [4, 'a'],
    expectedText:
      'Nobody has published a full account of the decision, so the honest answer is that the evidence and the label diverge and this page reports both.',
    replacementText:
      'No published account explains why the evidence and the United States label diverge.',
  },
  {
    slug: 'idarucizumab',
    column: 'commonQuestions',
    path: [1, 'a'],
    expectedText:
      'The honest limit of the evidence is that we know the laboratory number was corrected and we do not know what the death rate would have been without the antidote, because nobody was randomised to go without it.',
    replacementText:
      'The evidence shows that the laboratory number was corrected, but it cannot show what the death rate would have been without the antidote, because nobody was randomised to go without it.',
  },
  {
    slug: 'ligandrol',
    column: 'commonQuestions',
    path: [2, 'a'],
    expectedText: 'That is the honest question and this page will not invent an answer.',
    replacementText: 'The public record does not answer that question.',
  },
  {
    slug: 'nortriptyline',
    column: 'keyAudits',
    path: [2, 'technicalDetails'],
    expectedText:
      'The odd shape of this record is worth stating plainly: nortriptyline’s cleanest positive result against placebo is in a condition it has never been licensed for, while the use it is guideline-recommended for has no evidence above third tier.',
    replacementText:
      'Nortriptyline’s cleanest positive result against placebo is in a condition it has never been licensed for, while the use it is guideline-recommended for has no evidence above third tier.',
  },
  {
    slug: 'paliperidone',
    column: 'commonQuestions',
    path: [1, 'a'],
    expectedText:
      'The honest answer is that the price reflects market position rather than production, and this page cannot tell you what either one costs to make, because no verifiable cost-of-production study for either molecule could be found and cited.',
    replacementText:
      'The recorded price difference reflects market position rather than a documented production-cost difference; no verifiable cost-of-production study for either molecule could be found and cited.',
  },
  {
    slug: 'resmetirom',
    column: 'commonQuestions',
    path: [0, 'a'],
    expectedText: 'Nobody knows yet, and saying so plainly is the honest position.',
    replacementText: 'Nobody knows yet.',
  },
  {
    slug: 'sitagliptin',
    column: 'conditionContext',
    path: ['whyItMatters'],
    expectedText:
      'TECOS was the trial that looked, and its finding of exactly no difference is the honest headline for this page.',
    replacementText:
      'TECOS was the trial that looked, and it found exactly no difference in cardiovascular events.',
  },
  {
    slug: 'tirzepatide',
    column: 'commonQuestions',
    path: [2, 'auditNote'],
    expectedText: 'Absence of a figure is the honest state of the record.',
    replacementText: 'No verifiable figure is recorded.',
  },
] as const satisfies readonly ReleaseA1SelfCertificationRepair[]

function valueAtPath(root: unknown, path: readonly (string | number)[]): unknown {
  let current = root
  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return undefined
      current = current[segment]
      continue
    }
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

function setValueAtPath(
  root: unknown,
  path: readonly (string | number)[],
  replacement: string,
): void {
  if (path.length === 0) throw new Error('Release A.1 repair path cannot be empty.')
  let current = root
  for (const segment of path.slice(0, -1)) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) throw new Error(`Expected array at repair segment ${segment}.`)
      current = current[segment]
    } else {
      if (!current || typeof current !== 'object' || Array.isArray(current)) {
        throw new Error(`Expected object at repair segment ${segment}.`)
      }
      current = (current as Record<string, unknown>)[segment]
    }
  }
  const leaf = path.at(-1)
  if (typeof leaf === 'number') {
    if (!Array.isArray(current)) throw new Error(`Expected array at repair leaf ${leaf}.`)
    current[leaf] = replacement
  } else {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      throw new Error(`Expected object at repair leaf ${String(leaf)}.`)
    }
    ;(current as Record<string, unknown>)[leaf as string] = replacement
  }
}

export type ExactRepairState = 'applied' | 'already_applied'

/**
 * Apply one repair to a cloned column value. The whole field is retained; only the exact dated
 * fragment changes. A later human edit that removed or altered both forms makes this fail closed.
 */
export function applyExactReleaseA1Repair(
  columnValue: unknown,
  repair: ReleaseA1SelfCertificationRepair,
): ExactRepairState {
  const field = valueAtPath(columnValue, repair.path)
  if (typeof field !== 'string') {
    throw new Error(
      `${repair.slug} ${repair.column}.${repair.path.join('.')} is not the expected string field.`,
    )
  }
  const expectedCount = field.split(repair.expectedText).length - 1
  const replacementCount = field.split(repair.replacementText).length - 1
  if (expectedCount === 0 && replacementCount === 1) return 'already_applied'
  if (expectedCount !== 1 || replacementCount !== 0) {
    throw new Error(
      `${repair.slug} ${repair.column}.${repair.path.join('.')} failed its exact expected-value guard.`,
    )
  }
  setValueAtPath(
    columnValue,
    repair.path,
    field.replace(repair.expectedText, repair.replacementText),
  )
  return 'applied'
}
