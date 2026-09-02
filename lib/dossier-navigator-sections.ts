/**
 * Which sections this record can actually take a reader to, and what state each is in.
 *
 * This is the projection behind the floating navigator. It exists because a medicine page cannot
 * usefully offer the same fixed contents list to every record: two thirds of the corpus is
 * registry-derived rows holding four modules, and a contents list that offered twenty-five
 * destinations on such a page would send a reader to twenty-one empty ones. That is worse than no
 * contents list, because it spends the reader's trust before spending their time.
 *
 * So every row carries the section's coverage, computed from the record rather than assumed:
 *
 * - `answered` — the section holds recorded content.
 * - `conflicting` — independent sources give readings that do not overlap. Both are kept, neither is
 *   marked wrong. This is the strongest statement the corpus can make and it was previously
 *   reachable only by scrolling into the right module.
 * - `not_documented` — no source in this corpus fills this section. A fact about the corpus, never
 *   about the medicine, and the reader-facing wording says exactly that.
 *
 * `stale` is emitted only from a persisted, exact source binding whose assertion check confirmed
 * drift. Dossier-level freshness never qualifies. `restricted` is not emitted because restricted
 * material is withheld at the serializer, so the view model cannot determine it.
 */

import type { DossierNavigatorSection } from '@/components/dossier/DossierSectionNavigator'
import { buildQuestionIssueIndex } from './dossier-question-issues'
import type {
  MedicineDossierViewModel,
  MedicineRecordContextView,
} from './medicine-dossier-view-model'

/** A section is offered only when its anchor is rendered, so a row can never be a dead link. */
interface SectionCandidate {
  id: string
  label: string
  /** Non-empty means the section has content. */
  present: boolean
  /** How many independent readings disagree, when the section carries a consensus block. */
  conflictingReadings?: number
  /** How many sources behind this section the freshness loop reports as drifted. */
  staleSources?: number
  count?: number
}

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/**
 * Counts consensus fields whose readings do not overlap.
 *
 * Read from the already-projected view rather than recomputed, so the number a reader sees in the
 * navigator is the same number the section itself shows. A navigator that disagreed with the page
 * it navigates would be worse than one that showed no counts at all.
 */
function countConflictingReadings(context: MedicineRecordContextView | undefined): number {
  /*
   * Counted through the issue index rather than from `disagreementNote`, so the navigator and the
   * question layer report the same conflicts. Only a comparable `differ` counts; a `not_comparable`
   * field never appears as a conflict here for the same reason it never appears as one on a
   * question -- comparing those readings would need a measurement no source stated.
   */
  return buildQuestionIssueIndex({
    consensusFields: context?.background?.sourceConsensus?.fields,
  }).conflicting.length
}

/** Sources the freshness loop reports as no longer reproducing their recorded wording. */
function countStaleSources(context: MedicineRecordContextView | undefined): number {
  return buildQuestionIssueIndex({
    driftedSources: context?.background?.driftedSources,
  }).stale.length
}

export function dossierNavigatorSections(
  dossier: MedicineDossierViewModel,
): DossierNavigatorSection[] {
  const context: MedicineRecordContextView | undefined = dossier.medicineRecord
  const background = context?.background
  const conflicting = countConflictingReadings(context)
  const stale = countStaleSources(context)

  const candidates: SectionCandidate[] = [
    /* The evidence layer, which is where a reviewed conclusion appears when one exists. */
    {
      id: 'evidence-support',
      label: 'How we know this',
      present: isNonEmpty(dossier.evidenceNodes) || isNonEmpty(dossier.studies),
    },
    {
      id: 'key-outcomes',
      label: 'What the studies measured',
      present: isNonEmpty(dossier.keyOutcomes),
    },
    {
      id: 'studies',
      label: 'The studies themselves',
      present: isNonEmpty(dossier.studies),
      count: Array.isArray(dossier.studies) ? dossier.studies.length : undefined,
    },
    {
      id: 'who-was-studied',
      label: 'Who was included and excluded',
      present: isNonEmpty(background?.applicability),
    },
    {
      id: 'development-timeline',
      label: 'What happened, in order',
      present: isNonEmpty(dossier.timelineEvents),
    },

    /* The recorded-background layer. */
    {
      id: 'recorded-uses',
      label: 'What the label says it is for',
      present: isNonEmpty(background?.recordedUses),
    },
    {
      id: 'recorded-mechanism',
      label: 'How it works, as recorded',
      present: isNonEmpty(background?.mechanism),
    },
    {
      id: 'recorded-harms',
      label: 'What the label warns about',
      present: isNonEmpty(background?.safety),
    },
    {
      id: 'commonly-reported',
      label: 'Reported most often',
      present: isNonEmpty(background?.commonAdverseReactions),
    },
    {
      id: 'recorded-populations',
      label: 'Groups the source does and does not answer for',
      present: isNonEmpty(background?.populationStatements),
    },
    {
      id: 'after-a-dose',
      label: 'What happens after a dose',
      present: isNonEmpty(background?.pharmacokinetics),
      conflictingReadings: conflicting,
    },
    {
      id: 'studied-schedule',
      label: 'The schedule that was studied',
      present: isNonEmpty(background?.titration),
    },
    {
      id: 'handled-by',
      label: 'Enzymes and transporters named',
      present: isNonEmpty(background?.interactionSignals),
    },
    {
      id: 'where-it-acts-map',
      label: 'Where in the body',
      present: isNonEmpty(background?.anatomyTargets),
    },
    {
      id: 'chemical-identity',
      label: 'Chemical identity',
      present: isNonEmpty(background?.molecularIdentity),
    },
    { id: 'what-is-in-it', label: 'What is in it', present: isNonEmpty(background?.composition) },
    {
      id: 'what-every-label-says',
      label: 'What every label says',
      present: isNonEmpty(background?.sourceConsensus),
      conflictingReadings: conflicting,
      staleSources: stale,
    },
    {
      id: 'what-organism-it-is',
      label: 'What organism it is',
      present: isNonEmpty(background?.biologicalIdentity),
    },
    {
      id: 'what-kind-of-material',
      label: 'What kind of material',
      present: isNonEmpty(background?.sourceMaterial),
    },
    {
      id: 'when-it-was-approved',
      label: 'When it was approved',
      present: isNonEmpty(background?.regulatoryApproval),
    },
    {
      id: 'listed-products',
      label: 'Products on the market',
      present: isNonEmpty(background?.productListing),
    },
    {
      id: 'label-archive-presence',
      label: 'How many labels name it',
      present: isNonEmpty(background?.labelPresence),
    },
    {
      id: 'cost-context',
      label: 'What a pharmacy pays',
      present: isNonEmpty(background?.costEntries),
    },
    {
      id: 'common-questions',
      label: 'Common questions',
      present: isNonEmpty(context?.commonQuestions),
    },
    { id: 'molecular-record', label: 'Technical record', present: isNonEmpty(context?.molecular) },

    /*
     * Offered only when the record carries a completion assessment, because the anchor exists only
     * then. `answered` means every applicable section reached an explicit state; an incomplete
     * assessment takes the ordinary absence state, since some section still has no state to read.
     */
    ...(dossier.completionAssessment
      ? [
          {
            id: 'record-completeness',
            label: 'How complete this record is',
            present: dossier.completionAssessment.status === 'COMPLETE',
          },
        ]
      : []),
  ]

  return candidates.map((candidate) => {
    const conflictingHere = candidate.present && (candidate.conflictingReadings ?? 0) > 0
    const staleHere = candidate.present && (candidate.staleSources ?? 0) > 0
    /*
     * A section can be both. `coverage` shows the disagreement, because it is about the recorded
     * evidence rather than about our copy of a source, and `issues` keeps both so the row can badge
     * both without either fact being lost.
     */
    const issues = [
      ...(conflictingHere ? (['conflicting'] as const) : []),
      ...(staleHere ? (['stale'] as const) : []),
    ]
    const coverage = conflictingHere
      ? ('conflicting' as const)
      : staleHere
        ? ('stale' as const)
        : candidate.present
          ? ('answered' as const)
          : ('not_documented' as const)
    return {
      id: candidate.id,
      label: candidate.label,
      coverage,
      ...(issues.length > 0 ? { issues } : {}),
      ...(conflictingHere
        ? { count: candidate.conflictingReadings }
        : candidate.count !== undefined
          ? { count: candidate.count }
          : {}),
    }
  })
}
