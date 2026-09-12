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
 *   - a page whose safety or evidence gates fail is never indexed;
 *   - a page whose identity is unresolved is never indexed;
 *   - a page that carries none of the four things a reader comes for is never indexed;
 *   - everything else is indexed.
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

export function decideMedicinePageIndexing(model: DossierV4ViewModel): IndexDecision {
  const substance = assessRecordSubstance(model)
  if (!model.gates.every((gate) => gate.passed)) {
    return { index: false, reason: 'gate_failed', substance }
  }
  if (!model.identity.identityVerified) {
    return { index: false, reason: 'identity_unresolved', substance }
  }
  if (substance.empty) return { index: false, reason: 'record_empty', substance }
  return { index: true, reason: 'indexable', substance }
}
