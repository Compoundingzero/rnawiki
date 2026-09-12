/**
 * How much this record actually holds, and therefore whether the page may be indexed.
 *
 * This exists because collapsing to one layout nearly deleted a rule along with a component. Before
 * the collapse a medicine the corpus held was served as the corpus document and indexed on
 * `corpus_pages.indexable`; a medicine it did not hold was forwarded to a React page that indexed on
 * `decideDossierIndexability`, which returned nothing indexable unless programme evidence existed.
 * Two layouts, two rules, and a sitemap that knew about both. Serving every page from one layout
 * without writing the rule down would have inherited whichever branch happened to survive.
 *
 * The rule is now about the page rather than about which component drew it, which is also what the
 * brief asks for: a record with nothing in it says so and is not offered to a search engine.
 *
 *   - a page that might be WRONG is never indexed: unresolved identity, an unresolved merge across
 *     substance families, internal keys leaking into reader text, an unresolved supervision mode, or
 *     missing canonical metadata;
 *   - a page that carries none of the four things a reader comes for is never indexed;
 *   - everything else is indexed.
 *
 * WHAT IS DELIBERATELY NOT A REASON TO HIDE A PAGE, and why this distinction had to be made.
 *
 * The first version of this rule required every gate to pass. Two of the seven gates measure how far
 * RNAWiki has got with its own processing rather than whether a page is safe to show:
 * `trial_roles_valid` asks whether registered studies have been classified as testing this
 * substance, and `claim_provenance_present` asks whether the opening sentence carries a source.
 *
 * `page_registry_role_aggregates` is empty in production — the table exists and nothing has
 * populated it — so requiring that gate de-indexed the entire medicine corpus the moment this
 * layout went live. Every page, including aspirin, ibuprofen and metformin, came back
 * `noindex, follow`. A page built from a regulator's label, carrying what the substance is for, what
 * it does and what can go wrong, is worth finding whether or not RNAWiki has finished classifying
 * the trials that mention it. Incomplete is not the same as wrong, and only wrong is a reason to
 * hide a page from a person looking for it.
 *
 * The same assessment drives the notice the page shows when it is empty, so the sentence a reader
 * reads and the instruction a crawler reads can never disagree.
 */
import type { DossierV4ViewModel } from './view-model'

/** The four things a reader comes to a medicine page for. */
export interface RecordSubstance {
  /** A sentence saying what the substance is taken for or what it changes. */
  hasOpening: boolean
  /** A recorded explanation of what happens in the body. */
  hasExplanation: boolean
  /** A result measured in people, or a named registered study. */
  hasHumanEvidence: boolean
  /** A recorded path through the body, or a named target. */
  hasMechanism: boolean
  /** How many of the four are present. */
  score: number
  /** True when the page has nothing a reader came for. */
  empty: boolean
}

function present(statement: { origin: string; text: string }): boolean {
  return statement.origin !== 'absent' && statement.origin !== 'contract_sentence'
}

export function assessRecordSubstance(model: DossierV4ViewModel): RecordSubstance {
  const hasOpening = present(model.hero.simpleAction) || present(model.hero.whyPeopleCare)
  const hasExplanation = present(model.hero.actionDetail)
  const hasHumanEvidence =
    model.humanResults.cards.length > 0 || present(model.hero.strongestGoalResult)
  const hasMechanism = model.journey.nodes.length > 0 || present(model.hero.immediateChange)
  const score = [hasOpening, hasExplanation, hasHumanEvidence, hasMechanism].filter(Boolean).length
  return { hasOpening, hasExplanation, hasHumanEvidence, hasMechanism, score, empty: score === 0 }
}

export interface IndexDecision {
  index: boolean
  reason: 'gate_failed' | 'identity_unresolved' | 'record_empty' | 'indexable'
  substance: RecordSubstance
}

/**
 * The gates that mean "this page may be wrong or harmful", as opposed to "this record is thin".
 *
 * Each one, if it fails, means a reader could be shown something untrue: the wrong substance, two
 * substances merged into one, an internal key where a sentence should be, a medicine whose
 * supervision status could not be resolved, or a page with no canonical address. The two gates left
 * out — `claim_provenance_present` and `trial_roles_valid` — describe how complete RNAWiki's own
 * work is, and a thin page says so in its own words rather than hiding.
 */
const GATES_THAT_BLOCK_INDEXING: ReadonlySet<string> = new Set([
  'identity_passed',
  'no_cross_family_merge',
  'no_raw_internal_fields',
  'safety_mode_valid',
  'canonical_metadata_valid',
])

export function decideMedicinePageIndexing(model: DossierV4ViewModel): IndexDecision {
  const substance = assessRecordSubstance(model)
  const blocking = model.gates.filter(
    (gate) => GATES_THAT_BLOCK_INDEXING.has(gate.code) && !gate.passed,
  )
  if (blocking.length > 0) {
    return { index: false, reason: 'gate_failed', substance }
  }
  if (!model.identity.identityVerified) {
    return { index: false, reason: 'identity_unresolved', substance }
  }
  if (substance.empty) return { index: false, reason: 'record_empty', substance }
  return { index: true, reason: 'indexable', substance }
}
