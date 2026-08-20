import { readFileSync } from 'node:fs'
import type { ConditionContext, DeliverySystem } from '@/lib/types'
import { CACHE_FILES, sourceFileExists } from '../ingest/paths'
import { attributeToLabel, SOURCE_LABELS, trimToSentence } from './provenance'

/**
 * Fills the narrative fields that have a real source, from the FDA label text already extracted
 * during ingest.
 *
 * The label carries six sections per substance; the ingest used one of them (indications) and left
 * the rest on disk. Between them they answer most of what a dossier's opening asks: what the drug
 * is for, what it is made of and how it is given, and what the manufacturer told the regulator it
 * does. Those are quotations, and they are attributed as such — see provenance.ts for why that
 * distinction is the whole point.
 */

export interface LabelText {
  indications_and_usage?: string
  mechanism_of_action?: string
  description?: string
  clinical_pharmacology?: string
  pharmacodynamics?: string
  purpose?: string
}

export interface LabelEnrichment {
  laymanHowItWorks?: string
  conditionContext?: ConditionContext
  deliverySystem?: DeliverySystem
  targetGene?: string
  targetProtein?: string
  sources: string[]
}

let cache: Record<string, LabelText> | null = null

export function loadLabelIndex(): Record<string, LabelText> {
  if (cache) return cache
  if (!sourceFileExists(CACHE_FILES.labelIndex)) {
    console.warn(`[enrich] no label index at ${CACHE_FILES.labelIndex}`)
    cache = {}
    return cache
  }
  cache = JSON.parse(readFileSync(CACHE_FILES.labelIndex, 'utf8')) as Record<string, LabelText>
  return cache
}

// ---------------------------------------------------------------------------
// Target extraction
// ---------------------------------------------------------------------------

/**
 * Pulls a molecular target out of a mechanism paragraph, and only where the label states one
 * outright. The ingest ran a narrow version of this over indications text and found 355 targets;
 * the mechanism section is where a label actually names them, and it says so in a small number of
 * recurring grammatical shapes.
 *
 * Conservative on purpose. A wrong target gene on a drug page is worse than an empty field, and
 * nobody is reading 9,000 of these by hand to catch it.
 */
const TARGET_PATTERNS: ReadonlyArray<RegExp> = [
  // "a selective 5-HT 3 receptor antagonist", "beta 2 -adrenoceptor agonist". Labels break these
  // symbols across spaces and subscripts, so the pattern has to allow both and the result is
  // squeezed back together afterwards.
  /\b(?:selective\s+|competitive\s+|reversible\s+|irreversible\s+|potent\s+|specific\s+|partial\s+|dual\s+|long-acting\s+)*([A-Za-z0-9][A-Za-z0-9-]{0,12}(?:\s?\d{1,2})?)\s*-?\s*(?:adreno|adrenergic\s+)?receptors?\s+(?:agonist|antagonist|blocker|modulator|inhibitor)/i,
  /\b(?:selective\s+|competitive\s+|reversible\s+|irreversible\s+|potent\s+|specific\s+|partial\s+|dual\s+)*([A-Za-z0-9][A-Za-z0-9-]{1,14}(?:\s?\d{1,2})?)\s*-?\s*(?:adrenoceptors?|adrenergic\s+receptors?)\s+(?:agonist|antagonist|blocker)/i,
  // "an inhibitor of HMG-CoA reductase", "inhibits cyclooxygenase"
  /\binhibitor\s+of\s+(?:the\s+)?(?:enzyme\s+)?([A-Za-z][A-Za-z0-9-]{2,24})/,
  /\binhibits?\s+(?:the\s+)?(?:enzyme\s+)?([A-Z][A-Za-z0-9-]{2,24})/,
  // "a PCSK9-directed siRNA", "a PD-1-blocking antibody"
  /\b([A-Z][A-Z0-9-]{2,9})[- ](?:directed|blocking|targeted)\b/,
  /\bbinds?\s+(?:selectively\s+|specifically\s+)?(?:to\s+)?(?:the\s+)?([A-Za-z0-9][A-Za-z0-9-]{1,14}(?:\s?\d{1,2})?)\s+receptors?\b/i,
  /\b(?:blocks?|antagoni[sz]es?|activates?)\s+(?:the\s+)?([A-Za-z0-9][A-Za-z0-9-]{1,14}(?:\s?\d{1,2})?)\s+receptors?\b/i,
  // "acts at the mu-opioid receptor"
  /\bacts?\s+(?:at|on)\s+(?:the\s+)?([A-Za-z0-9][A-Za-z0-9-]{1,18}(?:\s?\d{1,2})?)\s+receptors?\b/i,
]

/**
 * Words that appear in the target slot of these patterns and are not targets: drug classes,
 * pharmacological adjectives, and the handful of capitalised words that survive the shape test.
 */
const TARGET_STOPWORDS = new Set([
  'FDA', 'USP', 'NDA', 'ANDA', 'BLA', 'USA', 'AUC', 'CMAX', 'TMAX', 'THE', 'AND', 'FOR', 'NOT',
  'ITS', 'ONE', 'TWO', 'HAS', 'WAS', 'ARE', 'MAY', 'CAN', 'ALL', 'THIS', 'THAT', 'THESE', 'BOTH',
  'HUMAN', 'ADULT', 'ORAL', 'EACH', 'MOST', 'SUCH', 'WHEN', 'WITH', 'FROM', 'INTO', 'ONLY',
  'SAME', 'OTHER', 'ABOVE', 'BELOW', 'THAN', 'THEN', 'THEIR', 'THERE', 'WHICH', 'WHILE',
  // Classes rather than targets.
  'CORTICOSTEROID', 'ANTIBIOTIC', 'ANTIHISTAMINE', 'ANALGESIC', 'DIURETIC', 'STEROID',
  'AGONIST', 'ANTAGONIST', 'INHIBITOR', 'BLOCKER', 'HORMONE', 'VITAMIN', 'PROTEIN', 'ENZYME',
  'DRUG', 'AGENT', 'ACID', 'SALT', 'ESTER', 'ANALOGUE', 'ANALOG', 'DERIVATIVE',
  // Sentence furniture that survives the shape test because labels capitalise it mid-paragraph.
  'MOLECULAR', 'MECHANISM', 'STUDIES', 'STUDY', 'CLINICAL', 'ACTION', 'ACTIVITY', 'EFFECTS',
  'PHARMACOLOGY', 'ABSORPTION', 'DISTRIBUTION', 'METABOLISM', 'EXCRETION', 'PATIENTS',
  // Adjectives that land in the target slot when the label writes "binds to specific receptors".
  'SPECIFIC', 'CERTAIN', 'VARIOUS', 'SEVERAL', 'MULTIPLE', 'CENTRAL', 'PERIPHERAL', 'NUCLEAR',
  'CELLULAR', 'SURFACE', 'TARGET', 'RELEVANT', 'APPROPRIATE',
])

/**
 * A label states what a drug does NOT do at least as often as what it does, because that is how
 * a class distinguishes itself. Olmesartan's label says it "does not inhibit ACE", and a pattern
 * reading for "inhibits X" happily reported ACE as its target — the wrong mechanism entirely, on a
 * page nobody was going to check by hand.
 *
 * Anything negated in the run-up to the match is discarded rather than guessed at.
 */
const NEGATION_WINDOW = 44
const NEGATION = /\b(?:not|no|never|without|rather than|unlike|other than|neither|nor|does ?n[o']t|is ?n[o']t|lacks?|absence of|independent of|unrelated to)\b[^.]{0,20}$/i

/** Labels write "5-HT 3" and "beta 2"; the symbol is written closed up everywhere else. */
function tidyTarget(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s(?=\d)/g, '')
    .replace(/^[-\s]+|[-\s]+$/g, '')
    .trim()
}

/**
 * How much of the mechanism section is read.
 *
 * A label leads with what the drug is — "Ondansetron is a selective 5-HT3 receptor antagonist" —
 * and then explains the biology around it. That background is where the wrong answers live:
 * losartan's section describes the whole renin-angiotensin system, mentions ACE in a parenthetical
 * about how angiotensin II is formed, and a reader of the free text comes away calling an
 * angiotensin-receptor blocker an ACE inhibitor. Stopping early keeps the sentence that is about
 * the drug and drops the paragraph that is about the disease.
 */
const TARGET_SEARCH_WINDOW = 260

/** Anything inside brackets is an aside, and an aside is not a drug's target. */
function stripParentheticals(text: string): string {
  return text.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ')
}

export function extractTarget(mechanismFull: string | undefined): string {
  if (!mechanismFull) return ''
  const mechanism = stripParentheticals(mechanismFull).slice(0, TARGET_SEARCH_WINDOW)
  for (const pattern of TARGET_PATTERNS) {
    const match = pattern.exec(mechanism)
    const captured = match?.[1]
    if (!captured || match === null) continue

    // Discard anything the sentence was in the middle of denying.
    const runUp = mechanism.slice(Math.max(0, match.index - NEGATION_WINDOW), match.index)
    if (NEGATION.test(runUp)) continue
    const symbol = tidyTarget(captured)
    if (!symbol || TARGET_STOPWORDS.has(symbol.toUpperCase())) continue
    if (symbol.length < 2 || symbol.length > 24) continue
    // Must contain a letter, and must not be a bare ordinary word in lower case — a real target is
    // a symbol (PCSK9, 5-HT3, beta2) or a named enzyme, and both look different from prose.
    if (!/[A-Za-z]/.test(symbol)) continue
    if (/^[a-z]+$/.test(symbol) && symbol.length < 6) continue
    return symbol
  }
  return ''
}

// ---------------------------------------------------------------------------
// Route of administration
// ---------------------------------------------------------------------------

/**
 * How the drug is given, read off the routes and dosage forms the NDC directory records rather
 * than guessed from the label prose. `deliverySystem.description` on a curated dossier is a written
 * account of a delivery mechanism; here it is a statement of the forms the drug is actually sold
 * in, which is a different and smaller claim, and the wording says so.
 */
export function deliveryFromForms(
  routes: readonly string[],
  dosageForms: readonly string[],
): DeliverySystem | undefined {
  const route = routes[0]
  if (!route && dosageForms.length === 0) return undefined

  const forms = dosageForms.slice(0, 4).map((form) => form.toLowerCase()).join(', ')
  const routeList = routes.slice(0, 3).map((r) => r.toLowerCase()).join(', ')

  return {
    type: route ? `${route.charAt(0)}${route.slice(1).toLowerCase()}` : 'Not recorded',
    description: forms
      ? `Sold as ${forms}${routeList ? `, given by the ${routeList} route` : ''}.`
      : `Given by the ${routeList} route.`,
    // Deliberately not a safety summary. The label's warnings section is long, legally precise and
    // routinely misread when compressed; quoting a fragment of it beside the word "safety" would
    // do more harm than leaving it for a contributor.
    safetyProfile: '',
  }
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export function enrichFromLabel(
  moiety: string,
  context: { routes?: readonly string[]; dosageForms?: readonly string[] } = {},
): LabelEnrichment | null {
  const label = loadLabelIndex()[moiety]
  if (!label) return null

  const sources: string[] = []
  const result: LabelEnrichment = { sources }

  // The manufacturer's own account of what the drug does, quoted and attributed. Not rewritten:
  // a smoother sentence would be this site's claim rather than the label's.
  const mechanism = label.mechanism_of_action ?? label.clinical_pharmacology ?? label.pharmacodynamics
  if (mechanism) {
    result.laymanHowItWorks = attributeToLabel(trimToSentence(mechanism, 700))
    sources.push(SOURCE_LABELS.fdaLabel)
    const target = extractTarget(mechanism)
    if (target) {
      result.targetGene = target
      result.targetProtein = ''
    }
  }

  // What the drug is for, and who takes it. Both come out of the indications section; `whyItMatters`
  // is left empty because nothing in a label answers it — that is an editorial judgement about the
  // disease, and inventing one for 9,000 records is exactly what this pipeline must not do.
  const indications = label.indications_and_usage ?? label.purpose
  if (indications) {
    const explainer = label.description
      ? trimToSentence(label.description, 600)
      : trimToSentence(indications, 600)
    result.conditionContext = {
      conditionExplainer: attributeToLabel(explainer),
      whyItMatters: '',
      whoTakesThis: trimToSentence(indications, 420),
      clinicalGoals: undefined,
    }
    if (!sources.includes(SOURCE_LABELS.fdaLabel)) sources.push(SOURCE_LABELS.fdaLabel)
  }

  const delivery = deliveryFromForms(context.routes ?? [], context.dosageForms ?? [])
  if (delivery) {
    result.deliverySystem = delivery
    sources.push(SOURCE_LABELS.ndc)
  }

  return sources.length > 0 ? result : null
}
