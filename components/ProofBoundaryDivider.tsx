import { PROOF_BOUNDARY_LABELS, type ProofBoundaryStage } from '@/lib/evidence'

export function ProofBoundaryDivider({ stage }: { stage: ProofBoundaryStage }) {
  return (
    <div className="proof-boundary-divider" role="separator" aria-label={`Proof Boundary: ${PROOF_BOUNDARY_LABELS[stage]}`}>
      <span>Proof Boundary — {PROOF_BOUNDARY_LABELS[stage]}</span>
    </div>
  )
}
