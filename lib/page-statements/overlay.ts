/**
 * The shape of a published wording as the page reads it, with no database in the module.
 *
 * The view model is a pure function and the unit tests build its inputs by hand, so the overlay
 * types live here rather than beside the queries that fill them. `lib/queries/page-statements.ts`
 * re-exports these so a caller has one import either way.
 */
import { PAGE_STATEMENT_APPROVALS_REQUIRED, type PageStatementKey } from './types'

/** One published wording, as the view model applies it. */
export interface ActivePageStatement {
  revisionId: string
  statementKey: PageStatementKey
  text: string
  /**
   * The evidence state of the sentence it replaced, carried forward unchanged.
   *
   * This is the whole medical-safety point of the feature. Three approvals say three people agreed
   * on the words. They do not move an animal result to a human one, a measurement to an outcome, or
   * a draft to a reviewed conclusion, so the state travels with the sentence rather than improving
   * with its review count.
   */
  evidenceState: string
  approvals: number
  qualifiedApprovals: number
  publishedAt: string
  sourceDigest: string
}

/** What the small control in the page header shows. Never depends on who is reading. */
export interface PageReviewSummary {
  slug: string
  /** Approvals recorded on the open proposal closest to publication. */
  approvals: number
  required: number
  /** How many proposals are open for review right now. */
  openProposals: number
  changesRequested: boolean
  /** How many sentences on this page carry a wording the community approved. */
  publishedRevisions: number
}

export const EMPTY_PAGE_REVIEW_SUMMARY: Omit<PageReviewSummary, 'slug'> = {
  approvals: 0,
  required: PAGE_STATEMENT_APPROVALS_REQUIRED,
  openProposals: 0,
  changesRequested: false,
  publishedRevisions: 0,
}

export interface PageStatementOverlay {
  active: ReadonlyMap<PageStatementKey, ActivePageStatement>
  summary: PageReviewSummary
}

export function emptyPageStatementOverlay(slug: string): PageStatementOverlay {
  return { active: new Map(), summary: { slug, ...EMPTY_PAGE_REVIEW_SUMMARY } }
}

/* ------------------------------------------------------------ public copy */

export type PageReviewPillState =
  'open' | 'changes_requested' | 'community_approved' | 'no_proposal'

export interface PageReviewPill {
  state: PageReviewPillState
  /** What the control reads on the page. Short by design. */
  label: string
  /** What a screen reader announces instead. Spelt out, because "0/3" does not read as speech. */
  accessibleName: string
  href: string
}

/**
 * The control's wording.
 *
 * "Community approved" is about the wording and how the evidence is represented, never about
 * whether the medicine works, and the accessible name says so in full rather than leaving a reader
 * to infer it from a fraction. "Peer reviewed" is deliberately not used anywhere: none of this is
 * scientific peer review.
 */
export function pageReviewPill(summary: PageReviewSummary): PageReviewPill {
  const href = `/review-queue?slug=${encodeURIComponent(summary.slug)}`
  if (summary.openProposals > 0) {
    return {
      state: 'open',
      label: `Review or improve · ${summary.approvals}/${summary.required}`,
      accessibleName: `Review or improve the wording on this page. A proposed change has ${summary.approvals} of ${summary.required} approvals.`,
      href,
    }
  }
  if (summary.changesRequested) {
    return {
      state: 'changes_requested',
      label: 'Revision needs changes',
      accessibleName:
        'Review or improve the wording on this page. A proposed change was sent back for changes.',
      href,
    }
  }
  if (summary.publishedRevisions > 0) {
    return {
      state: 'community_approved',
      label: `Community approved · ${summary.required}/${summary.required}`,
      accessibleName: `Review or improve the wording on this page. ${summary.publishedRevisions === 1 ? 'One sentence carries' : `${summary.publishedRevisions} sentences carry`} wording ${summary.required} members approved. That is about the wording, not about whether this works.`,
      href,
    }
  }
  return {
    state: 'no_proposal',
    label: `Review or improve · 0/${summary.required}`,
    accessibleName: `Review or improve the wording on this page. No change is proposed, so nothing has been approved yet.`,
    href,
  }
}

/**
 * The short review line that sits beside one sentence, next to where that sentence came from.
 *
 * This replaces a repeated paragraph. A page showed the same forty-word explanation under four or
 * five statements on its first screen; the explanation is still available, one click away, inside
 * the disclosure that already carries the provenance.
 */
export function statementReviewNote(
  active: ActivePageStatement | undefined,
  required = PAGE_STATEMENT_APPROVALS_REQUIRED,
): string | null {
  if (!active) return null
  return `Community approved ${Math.min(active.approvals, required)}/${required}`
}
