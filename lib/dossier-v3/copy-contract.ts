/**
 * The plain-language content contract, as code (docs/plain-language-content-contract.md).
 *
 * These checks run in tests over every sentence the dossier v3 view model produces and over the
 * rendered pages. They flag; they do not rewrite. A flagged sentence fails the build so a person
 * fixes the generator or the reviewed claim, never the one page.
 *
 * Two kinds of check live here. The textual ones (`findInternalKeys`, `findForbiddenPhrases`,
 * `findUnscopedCertainty`, `sentenceStats`, `findUndefinedAcronyms`) are regular expressions with
 * documented limits. The structural one (`plainVersionViolations`) compares two structured claim
 * readings and is exact: a plain version that claims a stronger causality, a lower uncertainty, a
 * different direction, a different population or a different outcome class than its technical
 * version is refused.
 */
import {
  CAUSALITY_RANK,
  CERTAINTY_RANK,
  type CausalityLevel,
  type EffectDirection,
  type OutcomeClass,
  type UncertaintyLevel,
} from './taxonomy'

/* ------------------------------------------------------------------ internal keys */

/**
 * Patterns that are storage or pipeline identifiers, never words for a reader.
 *
 *  - `b_halfLifeRecorded`, `c_smallHumanTrialReportedEffect`: derived-seed test ids (compute.py).
 *  - `seed12`, `field15`: derivation slot names.
 *  - `halfLifeRecorded`: any camelCase token with two or more lowercase letters before the first
 *    capital and two or more after it. `mTOR`, `ApoB`, `HbA1c`, `GrimAge` do not match.
 *  - `NOT_MEASURED`, `HUMAN_RCT`: screaming-snake enums.
 *  - `some_stored_key`: snake_case with letters on both sides of the underscore.
 *  - `K1:MU72812GK0`, `COMBO:NAME:...`: canonical identity keys.
 */
const INTERNAL_KEY_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'derived-seed test id', pattern: /\b[a-c]_[a-zA-Z]{3,}\b/g },
  { name: 'derivation slot', pattern: /\b(?:seed|field)\d{1,2}\b/g },
  { name: 'camelCase key', pattern: /\b[a-z]{2,}[A-Z][a-z]{2,}[A-Za-z]*\b/g },
  { name: 'screaming-snake enum', pattern: /\b[A-Z]{2,}_[A-Z_]{2,}\b/g },
  { name: 'snake_case key', pattern: /\b[a-z]{2,}_[a-z][a-z_]+\b/g },
  { name: 'canonical identity key', pattern: /\b(?:K[1-4]|COMBO):[A-Za-z0-9:_ -]+/g },
]

export interface CopyHit {
  kind: string
  match: string
  index: number
}

/**
 * Tokens the camelCase and snake rules would otherwise flag that are ordinary reader words or
 * well-known names. Extend only with words a reader would expect to see.
 */
const INTERNAL_KEY_ALLOWLIST: ReadonlySet<string> = new Set(['iPhone', 'eLife', 'mRNA', 'siRNA'])

export function findInternalKeys(text: string): CopyHit[] {
  const hits: CopyHit[] = []
  for (const { name, pattern } of INTERNAL_KEY_PATTERNS) {
    pattern.lastIndex = 0
    for (const match of text.matchAll(pattern)) {
      if (INTERNAL_KEY_ALLOWLIST.has(match[0])) continue
      hits.push({ kind: name, match: match[0], index: match.index ?? 0 })
    }
  }
  return hits.sort((a, b) => a.index - b.index)
}

/* ------------------------------------------------------------------ forbidden phrases */

export const FORBIDDEN_PHRASES: readonly string[] = [
  'supercharge',
  'unlock',
  'hack your biology',
  'biohack your',
  'game changer',
  'game-changer',
  'ai-powered',
  'revolutionary',
  'cutting-edge',
  'seamless',
  'actionable insights',
  'well-positioned to benefit',
  'clinically proven',
  'proven safe',
  'completely safe',
  '100% safe',
  'no side effects',
  'miracle',
  'breakthrough',
  'optimize your',
  'optimise your',
  'boost your',
]

export function findForbiddenPhrases(text: string): CopyHit[] {
  const lower = text.toLowerCase()
  const hits: CopyHit[] = []
  for (const phrase of FORBIDDEN_PHRASES) {
    let from = 0
    for (;;) {
      const index = lower.indexOf(phrase, from)
      if (index < 0) break
      const before = index === 0 ? ' ' : lower[index - 1]
      const after = lower[index + phrase.length] ?? ' '
      if (!/[a-z0-9]/.test(before ?? ' ') && !/[a-z0-9]/.test(after)) {
        hits.push({
          kind: 'forbidden phrase',
          match: text.slice(index, index + phrase.length),
          index,
        })
      }
      from = index + phrase.length
    }
  }
  return hits.sort((a, b) => a.index - b.index)
}

/* ------------------------------------------------------------------ unscoped certainty */

const CERTAINTY_WORDS = /\b(safe|proven|works)\b/gi
const NEGATION_BEFORE = /\b(not|no|never|un|isn't|is not|are not|aren't|without)\b[^.?!]{0,40}$/i
const SCOPE_AFTER = /^\s*(for|in|when|among|at|during|as|to|with)\b/i
const SCOPE_BEFORE =
  /\b(specific use|this use|these people|in people|in adults|in this (?:group|study|trial)|scope)\b/i

/**
 * "safe", "proven" and "works" standing without scope. A sentence that negates the word ("not
 * proven", "no evidence it works") or scopes it ("works for this specific use", "safe in adults
 * with…") passes. Verbatim quotations, marked by straight or curly double quotes, are skipped.
 */
export function findUnscopedCertainty(text: string): CopyHit[] {
  const hits: CopyHit[] = []
  const stripped = text.replace(/["“][^"”]*["”]/g, (quoted) => ' '.repeat(quoted.length))
  for (const match of stripped.matchAll(CERTAINTY_WORDS)) {
    const index = match.index ?? 0
    const sentenceStart = Math.max(
      stripped.lastIndexOf('.', index),
      stripped.lastIndexOf('?', index),
      stripped.lastIndexOf('!', index),
    )
    const before = stripped.slice(sentenceStart + 1, index)
    const after = stripped.slice(index + match[0].length)
    if (NEGATION_BEFORE.test(before)) continue
    if (SCOPE_AFTER.test(after)) continue
    if (SCOPE_BEFORE.test(before) || SCOPE_BEFORE.test(after.split(/[.?!]/)[0] ?? '')) continue
    hits.push({ kind: 'unscoped certainty', match: match[0], index })
  }
  return hits
}

/* ------------------------------------------------------------------ sentence length */

export interface SentenceStats {
  sentences: number
  over20: number
  over30: number
  longest: { words: number; text: string }[]
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9“"(])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

export function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length
}

export function sentenceStats(text: string, keepLongest = 5): SentenceStats {
  const sentences = splitSentences(text)
  const counted = sentences.map((sentence) => ({ words: wordCount(sentence), text: sentence }))
  return {
    sentences: counted.length,
    over20: counted.filter((entry) => entry.words > 20).length,
    over30: counted.filter((entry) => entry.words > 30).length,
    longest: [...counted].sort((a, b) => b.words - a.words).slice(0, keepLongest),
  }
}

/** Default sentences should usually remain below approximately 20 words; 30 is the hard ceiling. */
export const SENTENCE_SOFT_LIMIT = 20
export const SENTENCE_HARD_LIMIT = 30

/* ------------------------------------------------------------------ acronyms */

const ACRONYM = /\b[A-Z][A-Z0-9]{1,6}\b/g

/** Ordinary tokens that look like acronyms and need no definition. */
const ACRONYM_ALLOWLIST: ReadonlySet<string> = new Set([
  'A',
  'I',
  'US',
  'UK',
  'EU',
  'CA',
  'AU',
  'SG',
  'JP',
  'ISO',
  'OK',
  'ID',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'MG',
  'ML',
])

/**
 * Acronyms that appear without a definition. A definition is either the expansion followed by the
 * acronym in brackets ("low-density lipoprotein (LDL)"), the acronym followed by a bracketed
 * expansion ("LDL (low-density lipoprotein)"), or an entry in `defined`, the set the page's inline
 * glossary supplies.
 */
export function findUndefinedAcronyms(
  text: string,
  defined: ReadonlySet<string> = new Set(),
): string[] {
  const undefinedAcronyms = new Set<string>()
  for (const match of text.matchAll(ACRONYM)) {
    const token = match[0]
    if (ACRONYM_ALLOWLIST.has(token) || defined.has(token)) continue
    if (/^NCT\d{8}$/.test(token)) continue
    if (/^\d+$/.test(token)) continue
    const bracketedAfter = new RegExp(`\\b${token}\\s*\\(`)
    const bracketedBefore = new RegExp(`\\(${token}\\)`)
    if (bracketedAfter.test(text) || bracketedBefore.test(text)) continue
    undefinedAcronyms.add(token)
  }
  return [...undefinedAcronyms].sort()
}

/* ------------------------------------------------------------------ plain vs technical */

/**
 * The structured reading of one claim version. Both the technical and the plain version carry one,
 * and the two are compared field by field. Free text is never compared.
 */
export interface ClaimReading {
  direction: EffectDirection
  outcomeClass: OutcomeClass
  /** The population the claim is scoped to, as one normalised string. */
  populationScope: string
  causality: CausalityLevel
  uncertainty: UncertaintyLevel
  /** The effect size as recorded; absent where the source gives none. */
  magnitude?: { value: number; unit: string; kind: 'absolute' | 'relative' } | undefined
}

export interface ReadingViolation {
  field: keyof ClaimReading
  technical: string
  plain: string
  reason: string
}

function magnitudeKey(magnitude: ClaimReading['magnitude']): string {
  return magnitude ? `${magnitude.kind}:${magnitude.value}:${magnitude.unit}` : 'none'
}

/**
 * A plain version may not strengthen or broaden the technical one. It may say less; it may not say
 * more. Direction, outcome class and population must match exactly; causality and certainty may
 * not rank higher; a magnitude the technical version carries must be carried unchanged.
 */
export function plainVersionViolations(
  technical: ClaimReading,
  plain: ClaimReading,
): ReadingViolation[] {
  const violations: ReadingViolation[] = []
  if (technical.direction !== plain.direction) {
    violations.push({
      field: 'direction',
      technical: technical.direction,
      plain: plain.direction,
      reason: 'the plain version changes the direction of effect',
    })
  }
  if (technical.outcomeClass !== plain.outcomeClass) {
    violations.push({
      field: 'outcomeClass',
      technical: technical.outcomeClass,
      plain: plain.outcomeClass,
      reason: 'the plain version reclassifies the outcome',
    })
  }
  if (
    technical.populationScope.trim().toLowerCase() !== plain.populationScope.trim().toLowerCase()
  ) {
    violations.push({
      field: 'populationScope',
      technical: technical.populationScope,
      plain: plain.populationScope,
      reason: 'the plain version changes who the claim is about',
    })
  }
  if (CAUSALITY_RANK[plain.causality] > CAUSALITY_RANK[technical.causality]) {
    violations.push({
      field: 'causality',
      technical: technical.causality,
      plain: plain.causality,
      reason: 'the plain version claims a stronger causal level',
    })
  }
  if (CERTAINTY_RANK[plain.uncertainty] > CERTAINTY_RANK[technical.uncertainty]) {
    violations.push({
      field: 'uncertainty',
      technical: technical.uncertainty,
      plain: plain.uncertainty,
      reason: 'the plain version is more certain than the technical one',
    })
  }
  if (technical.magnitude && magnitudeKey(technical.magnitude) !== magnitudeKey(plain.magnitude)) {
    violations.push({
      field: 'magnitude',
      technical: magnitudeKey(technical.magnitude),
      plain: magnitudeKey(plain.magnitude),
      reason: 'the plain version drops or changes the recorded effect size',
    })
  }
  return violations
}

/* ------------------------------------------------------------------ one call for a page */

export interface CopyReport {
  internalKeys: CopyHit[]
  forbiddenPhrases: CopyHit[]
  unscopedCertainty: CopyHit[]
  sentences: SentenceStats
  undefinedAcronyms: string[]
}

export function auditCopy(
  text: string,
  definedAcronyms: ReadonlySet<string> = new Set(),
): CopyReport {
  return {
    internalKeys: findInternalKeys(text),
    forbiddenPhrases: findForbiddenPhrases(text),
    unscopedCertainty: findUnscopedCertainty(text),
    sentences: sentenceStats(text),
    undefinedAcronyms: findUndefinedAcronyms(text, definedAcronyms),
  }
}

/** True when the text carries nothing the contract forbids outright. Sentence length only warns. */
export function copyPasses(report: CopyReport): boolean {
  return (
    report.internalKeys.length === 0 &&
    report.forbiddenPhrases.length === 0 &&
    report.unscopedCertainty.length === 0 &&
    report.sentences.over30 === 0
  )
}
