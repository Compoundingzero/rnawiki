/**
 * One decision per page: how much this record is allowed to say.
 *
 * Every public medicine gets a compass page, including the thousands the corpus has not processed.
 * What changes between them is not the design — it is what the page is permitted to assert. This
 * file is the single source of that decision. It is deliberately not spread through components: a
 * rule that lives in five places is a rule that will disagree with itself.
 *
 * The five states, from most to least it may say:
 *
 *   - **reviewed** — a person signed off a conclusion against the evidence.
 *   - **preliminary** — source-linked wording exists and nobody has signed it off. Visible, always
 *     labelled, never styled as reviewed.
 *   - **limited** — the record loads and holds something useful, but nothing that can carry a
 *     conclusion. The page says what is known and what is not yet resolved.
 *   - **correction hold** — identity is in doubt. No medical conclusion, whatever else the record
 *     holds, because a conclusion attached to the wrong substance is worse than no page.
 *   - **pipeline failure** — something on our side broke. The page says so and says nothing else.
 *
 * A record never falls back to the previous design. The worst case is a compass page that is honest
 * about holding almost nothing.
 */

export const PUBLICATION_STATES = [
  {
    code: 'reviewed',
    label: 'Reviewed',
    plain: 'A person checked the wording on this page against the evidence and approved it.',
    indexable: true,
  },
  {
    code: 'preliminary',
    label: 'Preliminary, awaiting review',
    plain:
      'Everything here is linked to a source, and nobody has signed it off yet. Read it as a working draft.',
    indexable: false,
  },
  {
    code: 'limited',
    label: 'Limited record',
    plain: 'RNAWiki holds very little about this substance. The page shows what there is.',
    indexable: false,
  },
  {
    code: 'correction_hold',
    label: 'Held for an identity check',
    plain:
      'RNAWiki is not certain this record describes one substance, so it makes no claims about it.',
    indexable: false,
  },
  {
    code: 'pipeline_failure',
    label: 'This page could not be prepared',
    plain: 'Something broke on our side. The gap is ours, not the evidence.',
    indexable: false,
  },
] as const

export type PublicationState = (typeof PUBLICATION_STATES)[number]['code']

export function publicationLabel(code: PublicationState): string {
  return PUBLICATION_STATES.find((entry) => entry.code === code)?.label ?? code
}

export function publicationPlain(code: PublicationState): string {
  return PUBLICATION_STATES.find((entry) => entry.code === code)?.plain ?? ''
}

export interface PublicationInputs {
  /** Reviewed claims that reached the page. */
  reviewedClaimCount: number
  /** An approved first-read answer still bound to this exact record. */
  hasApprovedFirstRead: boolean
  /** Source-linked wording written into the record: an explanation, a result or a study. */
  hasSourceLinkedContent: boolean
  /** The identity check on this record. */
  identityPassed: boolean
  /** A contamination or cross-family merge the corpus flagged as critical. */
  criticalIdentityConflict: boolean
  /** The loader or the view model failed. */
  pipelineFailed: boolean
  /** At least one source, registry fact or structured relationship exists. */
  hasAnyUsefulFact: boolean
}

export interface PublicationDecision {
  state: PublicationState
  label: string
  plain: string
  /** Why this record landed in this state, in words a reader could check. */
  reason: string
  /** Whether a search engine may index it. Never true outside the reviewed state. */
  indexable: boolean
  /** Whether the page may present a conclusion at all. */
  mayShowConclusions: boolean
  /** Whether the page opens with a banner explaining its state. */
  bannerRequired: boolean
}

/**
 * Decide in a fixed order, worst first. A failure outranks a doubt, a doubt outranks a conclusion,
 * and a conclusion has to be signed off to count as one.
 */
export function decidePublicationState(inputs: PublicationInputs): PublicationDecision {
  const make = (
    state: PublicationState,
    reason: string,
    overrides: Partial<PublicationDecision> = {},
  ): PublicationDecision => ({
    state,
    label: publicationLabel(state),
    plain: publicationPlain(state),
    reason,
    indexable: PUBLICATION_STATES.find((entry) => entry.code === state)?.indexable ?? false,
    mayShowConclusions: state === 'reviewed' || state === 'preliminary',
    bannerRequired: state !== 'reviewed',
    ...overrides,
  })

  if (inputs.pipelineFailed) {
    return make('pipeline_failure', 'A step failed while preparing this page.')
  }
  if (inputs.criticalIdentityConflict) {
    return make(
      'correction_hold',
      'Records from more than one substance may have been merged into this one.',
    )
  }
  if (!inputs.identityPassed) {
    return make('correction_hold', 'The identity check on this record did not pass.')
  }
  if (inputs.reviewedClaimCount > 0) {
    return make(
      'reviewed',
      `${inputs.reviewedClaimCount} reviewed ${inputs.reviewedClaimCount === 1 ? 'conclusion' : 'conclusions'} on this record.`,
    )
  }
  if (inputs.hasApprovedFirstRead || inputs.hasSourceLinkedContent) {
    return make(
      'preliminary',
      inputs.hasApprovedFirstRead
        ? 'A reviewer approved the opening answer, and no conclusion has been signed off.'
        : 'Source-linked wording exists on this record, and nobody has signed it off.',
    )
  }
  if (inputs.hasAnyUsefulFact) {
    return make(
      'limited',
      'RNAWiki holds identity and source facts, and nothing that can carry a conclusion.',
    )
  }
  return make('limited', 'RNAWiki has not processed this record beyond its name and identity.')
}

/**
 * A date a reader is shown has to look like one.
 *
 * The v3 model derives the last-checked date from a decision-card field, and where the field is
 * missing the value is the field's *state label*. The identity strip rendered that verbatim, so a
 * sparse page read "Sources last checked Processing failed." — a pipeline state printed where a
 * date belongs, on every unprocessed record.
 */
export function readableCheckDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return /^\d{4}(-\d{2}){0,2}$/.test(trimmed) ? trimmed : undefined
}
