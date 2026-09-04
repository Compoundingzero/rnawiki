/**
 * The withdrawn arc (dossier template, page types; R11).
 *
 * A withdrawn record leads with the dated rows the registers actually wrote — approval, the status
 * a register recorded, the jurisdictions that hold it — each row carrying the register that states
 * it. There is no narrative between the rows and no reason is supplied where the register states
 * none: several registers record a status and not a cause, and that is what the row then says.
 */
import type { CorpusArcRow } from '@/lib/corpus/dossier-page'
import { ProvenanceAnchor } from './ProvenanceAnchor'

export function WithdrawnArc({ rows }: { rows: CorpusArcRow[] }) {
  if (rows.length === 0) return null
  return (
    <section className="cd-arc" aria-labelledby="cd-arc-heading">
      <h2 className="cd-section-heading" id="cd-arc-heading">
        What the registers record
      </h2>
      <div>
        {rows.map((row, index) => (
          <div className="cd-arc-row" key={`${row.label}-${index}`}>
            <div className="cd-arc-date">
              {row.date ? <time dateTime={row.date}>{row.date}</time> : null}
            </div>
            <div>
              <span className="cd-row-label">{row.label}</span> {row.value}
              {row.anchor ? (
                <>
                  {' '}
                  <ProvenanceAnchor anchor={row.anchor} />
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
