import { plainApproval, readableDate, isoDate } from '@/lib/evidence-view'
import type { regulatoryCategoryEnum } from '@/db/schema'

type RegulatoryCategory = (typeof regulatoryCategoryEnum.enumValues)[number]

export interface RegulatoryStatusView {
  id: number
  jurisdiction: string
  approvedIndications: string | null
  statusStatement: string
  source: string
  checkedDate: Date
}

/**
 * What a regulator has and has not decided, per jurisdiction, with the primary document linked.
 *
 * The lead sentence uses the shared plain-approval wording so an approval never reads as broader
 * than it is: "approved for a defined medical use" is not "approved for the thing you searched".
 * The indications that actually carry that defined use sit one control away, in the regulator's
 * own words.
 */
export function RegulatorySummary({
  category,
  statuses,
}: {
  category: RegulatoryCategory
  statuses: RegulatoryStatusView[]
}) {
  return (
    <div className="stack-6">
      <p className="lead reading">{plainApproval(category)}.</p>

      {statuses.map((rs) => (
        <div key={rs.id} className="reading">
          <h3>{rs.jurisdiction}</h3>
          <p style={{ marginTop: 'var(--s3)' }}>{rs.statusStatement}</p>

          {rs.approvedIndications && (
            <details className="disclosure disclosure--inline" style={{ marginTop: 'var(--s3)' }}>
              <summary>Which uses this covers</summary>
              <div className="disclosure__body">
                <p>{rs.approvedIndications}</p>
              </div>
            </details>
          )}

          <p className="small muted" style={{ marginTop: 'var(--s4)' }}>
            Checked <time dateTime={isoDate(rs.checkedDate)}>{readableDate(rs.checkedDate)}</time>.{' '}
            <a href={rs.source}>Read the regulator&rsquo;s own record</a>
          </p>
        </div>
      ))}
    </div>
  )
}
