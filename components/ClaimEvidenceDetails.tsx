import Link from 'next/link'
import { canonicalStageLabel } from '@/lib/evidence-view'
import { formatCitation } from '@/lib/citation'
import type { ProofCardView } from '@/lib/types'
import { EvidenceReach } from './EvidenceReach'
import { stagePositionApplies } from '@/lib/evidence-view'
import { ClaimSources } from './evidence/ClaimSources'
import { CopyCitationButton } from './CopyCitationButton'
import { EmbedCodeBox } from './EmbedCodeBox'

/**
 * Everything behind one claim's "See the evidence" control.
 *
 * Titled paragraphs, not a five-row label table. The previous version printed Measured / Inferred /
 * Boundary / Unknown / Would move it as five equal monospace rows, expanded by default, four times
 * on one page — which made the answer 7% of the block and the internal evidence schema the other
 * 93%. Nothing is deleted here; it is moved one level down.
 */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="detail-block">
      <h4 className="detail-block__h">{title}</h4>
      <p>{children}</p>
    </div>
  )
}

export function ClaimEvidenceDetails({ claim, defaultOpen }: { claim: ProofCardView; defaultOpen: boolean }) {
  return (
    <details className="disclosure" open={defaultOpen}>
      <summary>See the evidence</summary>
      <div className="disclosure__body">
        <Block title="What researchers measured">{claim.measuredFinding}</Block>

        {/* The inference is not wrong — it is untested. The heading says what it has not yet
            earned, and the field's own wording carries the reason. */}
        <Block title="What this does not prove">{claim.inference}</Block>

        <Block title="What is still unknown">{claim.remainingUnknown}</Block>
        <Block title="What would change this answer">{claim.evidenceNeededNext}</Block>

        <div className="detail-block">
          <h4 className="detail-block__h">How far the evidence goes</h4>
          <p>{claim.proofBoundaryExplanation}</p>
          <p className="small muted" style={{ marginTop: 'var(--s2)' }}>
            Recorded stage: {canonicalStageLabel(claim.proofBoundaryStage)}.
          </p>
          <div style={{ marginTop: 'var(--s5)' }}>
            {stagePositionApplies(claim.claimType) && <EvidenceReach stage={claim.proofBoundaryStage} />}
          </div>
        </div>

        <ClaimSources evidence={claim.evidence} />

        <div className="tools" style={{ marginTop: 'var(--s6)' }}>
          <CopyCitationButton
            text={formatCitation({
              directAnswer: claim.directAnswer,
              entitySlug: claim.entitySlug,
              claimSlug: claim.slug,
              lastReviewedAt: claim.lastReviewedAt,
            })}
          />
          <Link href={`/corrections?entity=${claim.entitySlug}&claim=${claim.slug}`} className="btn">
            Report an issue
          </Link>
        </div>
        <div style={{ marginTop: 'var(--s3)' }}>
          <EmbedCodeBox claimId={claim.id} claimQuestion={claim.consumerQuestion} />
        </div>
      </div>
    </details>
  )
}
