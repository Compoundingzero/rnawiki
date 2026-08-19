import { reachSentence, stagePositionApplies } from '@/lib/evidence-view'
import type { ProofCardView } from '@/lib/types'
import { EvidenceRecord } from './evidence/EvidenceRecord'

/**
 * One question, answered.
 *
 * Visible without doing anything: the question as a label, the answer verbatim as the largest text
 * in the block, and one plain sentence saying how far the evidence goes. Everything else is one
 * control away.
 *
 * The evidence sentence is never optional and never shortened to a phrase. Four canonical stages
 * share the "People" position, and the difference between an uncontrolled study and a replicated
 * controlled trial is the single most consequential distinction on this site.
 *
 * The id stays on this wrapper so /r/x#claim-y keeps working; globals.css uses :target to force
 * the matching claim's evidence open, because a fragment never reaches the server.
 *
 * There is no `defaultOpen` prop and no caller may add one back. Opening the first record by
 * default made the internal evidence schema, not the answer, the first thing on the page.
 *
 * `panel-surface` makes each question its own panel, and the panel is now what separates one claim
 * from the next — it REPLACES the `.claim + .claim` hairline, which must not also be drawn or the
 * page gets a rule floating in the gap between two boxes. The panel is the shell around the claim
 * and stops at the claim; everything <EvidenceRecord> renders below stays the plain document it is
 * today, on a recessed ground, with no panel per subsection. That boundary is the whole design.
 */
export function ClaimSummary({ claim, entityName }: { claim: ProofCardView; entityName: string }) {
  return (
    <article
      className="claim panel-surface"
      id={`claim-${claim.slug}`}
      aria-label={`${entityName}: ${claim.consumerQuestion}`}
    >
      <h3 className="claim__q">{claim.consumerQuestion}</h3>
      <p className="claim__a">{claim.directAnswer}</p>
      {/* Only outcome claims get an evidence position. A regulatory, access or mechanism claim
          has no ladder — printing one put "a regulator reviewed the evidence and approved it"
          under "what does getting treated involve". */}
      {stagePositionApplies(claim.claimType) && (
        <p className="claim__ev">{reachSentence(claim.proofBoundaryStage)}</p>
      )}
      <EvidenceRecord claim={claim} />
    </article>
  )
}
