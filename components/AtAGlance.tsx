import { plainHumanEvidence, plainApproval, readableDate, isoDate } from '@/lib/evidence-view'
import type { ProofBoundaryStage } from '@/lib/evidence'
import type { regulatoryCategoryEnum } from '@/db/schema'

/**
 * BLOCKING SAFETY RULE — do not weaken this.
 *
 * A record-level evidence line that aggregates the strongest claim anywhere on the record made
 * /r/bpc-157 announce human evidence — carried entirely by a two-person intravenous safety pilot —
 * directly above a tendon claim with no human data of any kind. It also made rapamycin-for-longevity
 * read identically to an approved gene therapy.
 *
 * So: a single value is printed only when every published claim on the record sits at the same
 * stage. When they differ, the record says the reader has to look at the question they came for,
 * and nothing stronger. Per-claim evidence is always shown on the claim itself, scoped to that one
 * question.
 *
 * This is stricter than grouping by the five public reach positions, deliberately: four canonical
 * stages share the "People" position, and printing the strongest of those would reintroduce exactly
 * the overstatement this rule exists to prevent.
 */
export function recordEvidenceLine(stages: ProofBoundaryStage[]): string | null {
  // `stages` must already be filtered to outcome claims by the caller. Casgevy previously
  // collapsed five heterogeneous claims — including "what does treatment involve" — into one
  // "Reviewed by a regulator" line, which credited a logistics answer to a regulator and let a
  // single-arm n=30 efficacy result inherit the strongest wording on the record.
  if (stages.length === 0) return null
  const distinct = new Set(stages)
  if (distinct.size === 1) return plainHumanEvidence(stages[0]!)
  return 'Depends on the question — see below'
}

interface Props {
  stages: ProofBoundaryStage[]
  category: (typeof regulatoryCategoryEnum.enumValues)[number]
  lastChecked: Date
}

/**
 * Three plain values. Not a dashboard, not a score, and no row that could be read as a verdict on
 * whether the compound works or is safe. A missing value drops its row rather than printing "N/A".
 */
export function AtAGlance({ stages, category, lastChecked }: Props) {
  const evidenceLine = recordEvidenceLine(stages)

  return (
    <dl className="glance" style={{ maxWidth: '52rem' }}>
      {evidenceLine && (
        <div>
          <dt>Human evidence</dt>
          <dd>{evidenceLine}</dd>
        </div>
      )}
      {/* Approval, not a source count. A count answers "how much material is behind this",
          which is a publisher's question; the reader's question is whether it is approved.
          The source count lives under "About this page". */}
      <div>
        <dt>Approval status</dt>
        <dd>{plainApproval(category)}</dd>
      </div>
      <div>
        <dt>Last checked</dt>
        <dd>
          <time dateTime={isoDate(lastChecked)}>{readableDate(lastChecked)}</time>
        </dd>
      </div>
    </dl>
  )
}
