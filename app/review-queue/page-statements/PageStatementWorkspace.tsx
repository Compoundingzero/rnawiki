/**
 * The review workspace for one medicine page's wording.
 *
 * Reached from the small control on the medicine page, at `/review-queue?slug=<slug>`. It is one
 * screen, not a set of tabs: the sentences on the page, the proposals open against them, and for a
 * selected proposal everything a reviewer needs to decide — the diff, the reason, the evidence, the
 * sources, the automatic checks and the decisions already recorded.
 *
 * Signed-out readers see all of it. Recording a decision or proposing a change needs an account,
 * and that is where the sign-in prompt appears, not at the door.
 */
import Link from 'next/link'

import type { CurrentPageStatement } from '@/lib/page-statements/current'
import { wordDiff } from '@/lib/page-statements/current'
import { PAGE_STATEMENT_GATES, type GateResult } from '@/lib/page-statements/gates'
import { relevantQualifications } from '@/lib/page-statements/policy'
import {
  CHANGE_CATEGORY_LABELS,
  PROPOSAL_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  RISK_CLASS_LABELS,
  RISK_CLASS_PLAIN,
  pageStatementLabel,
  type PageStatementKey,
} from '@/lib/page-statements/types'
import type {
  PageStatementProposalView,
  PublicPublicationEvent,
  ViewerReviewEligibility,
} from '@/lib/queries/page-statements'
import { REVIEW_ELIGIBILITY_PLAIN } from '@/lib/page-statements/types'
import type { CommentUser } from '@/lib/types'

import { DecisionForm } from './DecisionForm'
import { ProposeForm } from './ProposeForm'

const CARD =
  'rounded-3xl border border-black/[0.08] bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6'
const EYEBROW = 'text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]'

function Diff({ before, after }: { before: string; after: string }) {
  const tokens = wordDiff(before, after)
  return (
    <p className="text-sm leading-6 text-[#1D1D1F]">
      <span className="sr-only">
        The proposed wording, with removed words marked as removed and added words as added.
      </span>
      {tokens.map((token, index) => {
        if (token.kind === 'same') return <span key={index}>{token.value} </span>
        if (token.kind === 'removed') {
          return (
            <del className="bg-rose-50 text-rose-800 line-through decoration-1" key={index}>
              {token.value}{' '}
            </del>
          )
        }
        return (
          <ins className="bg-emerald-50 text-emerald-900 no-underline" key={index}>
            {token.value}{' '}
          </ins>
        )
      })}
    </p>
  )
}

function GateList({ results }: { results: GateResult[] }) {
  if (results.length === 0) {
    return <p className="text-[11px] leading-5 text-[#6E6E73]">No automatic checks are recorded.</p>
  }
  const failed = results.filter((result) => !result.passed)
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-[#1D1D1F]">
        {failed.length === 0
          ? `All ${results.length} automatic checks passed.`
          : `${failed.length} of ${results.length} automatic checks did not pass. A wording cannot be published while one is failing.`}
      </p>
      {failed.length > 0 && (
        <ul className="space-y-2">
          {failed.map((result) => {
            const definition = PAGE_STATEMENT_GATES.find((gate) => gate.code === result.code)
            return (
              <li className="text-[11px] leading-5 text-rose-800" key={result.code}>
                <span className="font-semibold">{result.title}.</span> {result.detail}{' '}
                <span className="text-[#6E6E73]">{definition?.rationale}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function EvidencePanel({ proposal }: { proposal: PageStatementProposalView }) {
  const packet = proposal.evidencePacket as Record<string, string | undefined>
  const rows: Array<[string, string | undefined]> = [
    ['Who was studied', packet.population],
    ['What they took', packet.intervention],
    ['Compared with', packet.comparator],
    ['What was measured', packet.outcome],
    ['The result', packet.effect],
    ['What limits it', packet.limitations],
    ['What it does not prove', packet.doesNotProve],
  ]
  const filled = rows.filter(([, value]) => Boolean(value))
  return (
    <div className="space-y-3">
      {filled.length === 0 ? (
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          No evidence fields were given. A change to what the page says the evidence shows cannot be
          published without them.
        </p>
      ) : (
        <dl className="grid gap-2 sm:grid-cols-2">
          {filled.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
                {label}
              </dt>
              <dd className="text-[11px] leading-5 text-[#1D1D1F]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">Sources</p>
        {proposal.sources.length === 0 ? (
          <p className="text-[11px] leading-5 text-[#6E6E73]">No source is attached.</p>
        ) : (
          <ul className="space-y-1 pt-1">
            {proposal.sources.map((source, index) => (
              <li className="text-[11px] leading-5" key={index}>
                {source.url ? (
                  <a
                    className="font-semibold text-[#0071E3] hover:underline"
                    href={source.url}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {source.title ?? source.url}
                  </a>
                ) : (
                  <span className="font-semibold text-[#1D1D1F]">
                    {source.title ?? 'Quotation'}
                  </span>
                )}
                {source.excerpt ? (
                  <span className="block text-[#6E6E73]">“{source.excerpt}”</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="pt-1 text-[10px] leading-4 text-[#6E6E73]">
          RNAWiki stores a submitted link and does not open it. Check it yourself before deciding.
        </p>
      </div>
    </div>
  )
}

function DecisionHistory({ proposal }: { proposal: PageStatementProposalView }) {
  if (proposal.reviews.length === 0) {
    return (
      <p className="text-[11px] leading-5 text-[#6E6E73]">No decision has been recorded yet.</p>
    )
  }
  return (
    <ol className="space-y-2">
      {proposal.reviews.map((review) => (
        <li className="text-[11px] leading-5 text-[#424245]" key={review.id}>
          <span className="font-semibold text-[#1D1D1F]">
            {review.decision === 'APPROVE'
              ? 'Approved'
              : review.decision === 'CHANGES_REQUESTED'
                ? 'Changes requested'
                : 'Rejected'}
          </span>{' '}
          by {review.reviewerName}
          {review.qualificationVerified ? ' · Relevant reviewer qualification verified' : ''}
          {review.conflictDeclared
            ? ' · Declared a conflict, so this does not count toward three'
            : ''}
          {review.withdrawnAt ? ' · Withdrawn' : ''}
          {review.reason ? <span className="block text-[#6E6E73]">{review.reason}</span> : null}
        </li>
      ))}
    </ol>
  )
}

function ProposalCard({
  proposal,
  eligibility,
  viewer,
}: {
  proposal: PageStatementProposalView
  eligibility: ViewerReviewEligibility
  viewer: CommentUser | null
}) {
  const remaining = Math.max(0, proposal.required - proposal.approvals)
  const nextApprovalOrdinal = Math.min(proposal.required, proposal.approvals + 1)
  const isFinal = remaining === 1
  const qualificationsWanted = relevantQualifications(proposal.riskClass, proposal.changeCategory)
  return (
    <article className={`${CARD} space-y-4`} id={`proposal-${proposal.id}`}>
      <header className="space-y-1">
        <p className={EYEBROW}>
          {proposal.medicineName} · {pageStatementLabel(proposal.statementKey)}
        </p>
        <h3 className="text-base font-bold text-[#1D1D1F]">
          {REVIEW_STATUS_LABELS[proposal.reviewStatus]} · {proposal.approvals} of{' '}
          {proposal.required} approvals
        </h3>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          {CHANGE_CATEGORY_LABELS[proposal.changeCategory]} ·{' '}
          {RISK_CLASS_LABELS[proposal.riskClass]} · Proposed by {proposal.authorName} ·{' '}
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </p>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          {RISK_CLASS_PLAIN[proposal.riskClass]}
        </p>
      </header>

      <section aria-label="What changes" className="space-y-2">
        <p className={EYEBROW}>On the page now</p>
        <p className="text-sm leading-6 text-[#424245]">{proposal.currentText}</p>
        <p className={EYEBROW}>Proposed</p>
        <p className="text-sm leading-6 text-[#1D1D1F]">{proposal.proposedText}</p>
        <p className={EYEBROW}>Word by word</p>
        <Diff after={proposal.proposedText} before={proposal.currentText} />
        <p className={EYEBROW}>Why</p>
        <p className="text-[11px] leading-5 text-[#424245]">{proposal.reason}</p>
      </section>

      <section aria-label="Evidence behind the change" className="space-y-2">
        <p className={EYEBROW}>Evidence</p>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          The evidence state on this sentence stays what it was:{' '}
          {proposal.evidenceState.replace(/_/g, ' ')}. Approving the wording does not change it.
        </p>
        <EvidencePanel proposal={proposal} />
      </section>

      <section aria-label="Automatic checks" className="space-y-2">
        <p className={EYEBROW}>Automatic checks</p>
        <GateList results={proposal.gateResults} />
      </section>

      <section aria-label="Decisions so far" className="space-y-2">
        <p className={EYEBROW}>Decisions so far</p>
        <DecisionHistory proposal={proposal} />
        {qualificationsWanted.length > 0 && (
          <p className="text-[11px] leading-5 text-[#6E6E73]">
            {proposal.requiredQualified === 1
              ? 'One of the three approvals has to come from a member with a relevant recorded qualification.'
              : `${proposal.requiredQualified} of the three approvals have to come from members with a relevant recorded qualification.`}{' '}
            {proposal.qualifiedApprovals} recorded so far.
          </p>
        )}
      </section>

      <section aria-label="Record a decision" className="space-y-2">
        <p className={EYEBROW}>
          {isFinal
            ? 'Final approval — this will publish the revision'
            : `Approval ${nextApprovalOrdinal} of ${proposal.required}`}
        </p>
        {eligibility.canReview && viewer ? (
          <DecisionForm
            affectedSection={pageStatementLabel(proposal.statementKey)}
            contentDigest={proposal.contentDigest}
            evidenceState={proposal.evidenceState}
            isFinalApproval={isFinal}
            medicineName={proposal.medicineName}
            proposalId={proposal.id}
            proposedText={proposal.proposedText}
            slug={proposal.slug}
            sourceCount={proposal.sources.length}
          />
        ) : (
          <p className="text-[11px] leading-5 text-[#6E6E73]" role="note">
            {REVIEW_ELIGIBILITY_PLAIN[eligibility.reason]}
          </p>
        )}
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          <Link
            className="font-semibold text-[#0071E3] hover:underline"
            href={`/d/${proposal.slug}`}
          >
            Open the public page
          </Link>
        </p>
      </section>
    </article>
  )
}

export interface PageStatementWorkspaceProps {
  slug: string
  medicineName: string
  statements: CurrentPageStatement[]
  proposals: PageStatementProposalView[]
  eligibility: Record<string, ViewerReviewEligibility>
  history: PageStatementProposalView[]
  events: PublicPublicationEvent[]
  viewer: CommentUser | null
  selectedStatement: PageStatementKey | null
}

export function PageStatementWorkspace({
  slug,
  medicineName,
  statements,
  proposals,
  eligibility,
  history,
  events,
  viewer,
  selectedStatement,
}: PageStatementWorkspaceProps) {
  const openByKey = new Map(proposals.map((proposal) => [proposal.statementKey, proposal]))
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className={EYEBROW}>Review or improve</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
          The wording on {medicineName}
        </h1>
        <p className="max-w-2xl text-xs leading-6 text-[#6E6E73] sm:text-sm">
          Any member may suggest a clearer or more accurate way to put one of the sentences on this
          page. Three different eligible members have to approve the same exact wording before it
          replaces what is there, and the member who proposed it cannot be one of them. Approval is
          about the words and how the evidence is described. It does not say the substance works,
          and it never changes what kind of evidence sits behind a sentence.
        </p>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          <Link className="font-semibold text-[#0071E3] hover:underline" href={`/d/${slug}`}>
            Back to {medicineName}
          </Link>
          {' · '}
          <Link className="font-semibold text-[#0071E3] hover:underline" href="/review-queue">
            All review work
          </Link>
          {' · '}
          <Link
            className="font-semibold text-[#0071E3] hover:underline"
            href="/how-it-works#review-and-corrections"
          >
            How review works
          </Link>
        </p>
        {!viewer && (
          <p className="text-[11px] leading-5 text-[#6E6E73]" role="note">
            You are reading this signed out. Reading needs no account. Sign in on the front page to
            suggest a wording or record a decision.
          </p>
        )}
      </header>

      {proposals.length > 0 && (
        <section aria-labelledby="open-proposals-h" className="space-y-4">
          <h2 className="text-sm font-bold text-[#1D1D1F]" id="open-proposals-h">
            Open proposals
          </h2>
          {proposals.map((proposal) => (
            <ProposalCard
              eligibility={
                eligibility[proposal.id] ?? {
                  canReview: false,
                  reason: 'signed_out',
                  relevantQualifications: [],
                }
              }
              key={proposal.id}
              proposal={proposal}
              viewer={viewer}
            />
          ))}
        </section>
      )}

      <section aria-labelledby="sentences-h" className="space-y-4">
        <h2 className="text-sm font-bold text-[#1D1D1F]" id="sentences-h">
          The sentences on this page
        </h2>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          These are the sentences a reader meets first. Everything further down the page is a stored
          record shown with its own source, and is corrected through that record rather than by
          rewording a sentence here.
        </p>
        {statements.map((statement) => {
          const open = openByKey.get(statement.definition.key)
          return (
            <article
              className={`${CARD} space-y-3`}
              id={statement.definition.key}
              key={statement.definition.key}
            >
              <header className="space-y-1">
                <p className={EYEBROW}>{statement.definition.label}</p>
                <p className="text-sm leading-6 text-[#1D1D1F]">{statement.text}</p>
                <p className="text-[11px] leading-5 text-[#6E6E73]">
                  {statement.definition.purpose} At most {statement.definition.wordLimit} words.
                </p>
              </header>
              {open ? (
                <p className="text-[11px] leading-5 text-[#6E6E73]">
                  A change is already proposed here.{' '}
                  <Link
                    className="font-semibold text-[#0071E3] hover:underline"
                    href={`#proposal-${open.id}`}
                  >
                    Review it
                  </Link>
                  .
                </p>
              ) : viewer ? (
                <ProposeForm
                  currentText={statement.text}
                  defaultOpen={selectedStatement === statement.definition.key}
                  evidenceState={statement.evidenceState}
                  label={statement.definition.label}
                  slug={slug}
                  statementKey={statement.definition.key}
                  wordLimit={statement.definition.wordLimit}
                />
              ) : (
                <p className="text-[11px] leading-5 text-[#6E6E73]">
                  Sign in on the front page to suggest a different wording.
                </p>
              )}
            </article>
          )
        })}
      </section>

      {(history.length > 0 || events.length > 0) && (
        <section aria-labelledby="history-h" className="space-y-3">
          <h2 className="text-sm font-bold text-[#1D1D1F]" id="history-h">
            What has changed here
          </h2>
          <ol className="space-y-2">
            {history.map((entry) => (
              <li className="text-[11px] leading-5 text-[#424245]" key={entry.id}>
                <span className="font-semibold text-[#1D1D1F]">
                  {pageStatementLabel(entry.statementKey)}
                </span>{' '}
                — {PROPOSAL_STATUS_LABELS[entry.status].toLowerCase()}
                {entry.publishedAt ? ` on ${entry.publishedAt.slice(0, 10)}` : ''} with{' '}
                {entry.approvals} approvals
                {entry.qualifiedApprovals > 0 ? ', one from a qualified reviewer' : ''}.
                <span className="block text-[#6E6E73]">
                  Was: “{entry.currentText}” · Now: “{entry.proposedText}”
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
