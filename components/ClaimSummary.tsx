import { reachSentence, stagePositionApplies } from '@/lib/evidence-view'
import type { ProofCardView } from '@/lib/types'
import { ClaimEvidenceDetails } from './ClaimEvidenceDetails'

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
 */
export function ClaimSummary({
  claim,
  entityName,
  defaultOpen,
}: {
  claim: ProofCardView
  entityName: string
  defaultOpen: boolean
}) {
  return (
    <article className="claim" id={`claim-${claim.slug}`} aria-label={`${entityName}: ${claim.consumerQuestion}`}>
      <h3 className="claim__q">{claim.consumerQuestion}</h3>
      <p className="claim__a">{claim.directAnswer}</p>
      {/* Only outcome claims get an evidence position. A regulatory, access or mechanism claim
          has no ladder — printing one put "a regulator reviewed the evidence and approved it"
          under "what does getting treated involve". */}
      {stagePositionApplies(claim.claimType) && (
        <p className="claim__ev">{reachSentence(claim.proofBoundaryStage)}</p>
      )}
      <ClaimEvidenceDetails claim={claim} defaultOpen={defaultOpen} />
    </article>
  )
}
