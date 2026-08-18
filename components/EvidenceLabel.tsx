import { EVIDENCE_STATUS_LABELS, type EvidenceStatus } from '@/lib/evidence'

export function EvidenceLabel({ status }: { status: EvidenceStatus }) {
  return (
    <span className="evidence-label" data-status={status}>
      {EVIDENCE_STATUS_LABELS[status]}
    </span>
  )
}
