import { readableDate, isoDate } from '@/lib/evidence-view'
import { regulatorySourceLinkLabel } from '@/lib/regulator-sources'

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
 * The category sentence is NOT repeated here. It is printed once on the record page, in the
 * labelled metadata strip; as a standalone lead paragraph in this section it was the same words a
 * third time on one page, orphaned between the safety narrative above it and the country blocks
 * below, and it named no use, so the repetition carried nothing. The jurisdiction blocks start
 * directly, in the regulator's own words, which is the part this section exists to show.
 *
 * THE LINK LABEL IS NOT FIXED TEXT, and that is a correctness rule, not styling. It used to read
 * "Read the regulator's own record" for every row, whatever `source` held — so Casgevy's MHRA and
 * EU rows handed the reader Vertex's own press releases under a sentence promising the regulator,
 * on the record whose positioning claim is that the seller does not define what "works" means.
 * `regulatorySourceLinkLabel` decides from the URL's host and defaults to the neutral wording for
 * anything it does not recognise. See lib/regulator-sources.ts before changing either string.
 */
export function RegulatorySummary({ statuses }: { statuses: RegulatoryStatusView[] }) {
  return (
    <div className="stack-6">
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
            <a href={rs.source}>{regulatorySourceLinkLabel(rs.source)}</a>
          </p>
        </div>
      ))}
    </div>
  )
}
