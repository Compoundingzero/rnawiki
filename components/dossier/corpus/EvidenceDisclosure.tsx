/**
 * The revealed layer of one question block (docs/specs/disclosure.md).
 *
 * One control, "Show the evidence", is a native `<details>`: one step, no reload, keyboard
 * operable, and delivered in the server HTML so a crawler reads the rows without running anything.
 * The rows are Stripe's hairline row — bold label, small grey monospace identifier on the same
 * line, value beneath, no box and no zebra. Technical vocabulary lives here and nowhere above it.
 *
 * Consecutive rows that share a label are one group and the label becomes the group's heading, so
 * it is written once instead of twenty times; a row that stands alone keeps its label inline.
 *
 * §13(5): a trial list shows six rows. The rest are grouped under "14 further recorded trials",
 * and that group is a closed native `<details>` of its own — the summary is the group's own label,
 * so the words are the same words the measured text carries, and the rows under it are not painted
 * until a reader opens them.
 */
const FURTHER_TRIALS = /^\d+ further recorded trials?$/
import type { CorpusBlock, CorpusRowGroup } from '@/lib/corpus/dossier-page'
import type { RevealedRow } from '@/lib/corpus/page-text'

function Row({ row, showLabel }: { row: RevealedRow; showLabel: boolean }) {
  const label = showLabel ? row.label : undefined
  /*
   * Three elements, not five. The label and the identifier are inline and the value is a block, so
   * the browser puts them on the two lines the template asks for without a flex wrapper around the
   * first two, and without a class on the row itself: `.cd-rows > li` is the row. Step 6.1 —
   * the wrapper and the row class were 8.1 KB of the median page's markup and painted nothing.
   */
  return (
    <li>
      {label ? <span className="cd-row-label">{label}</span> : null}
      {row.identifier ? <span className="cd-row-id">{row.identifier}</span> : null}
      <div className="cd-row-value">{row.value}</div>
    </li>
  )
}

function Group({ group }: { group: CorpusRowGroup }) {
  const rows = (
    <ul className="cd-rows">
      {group.rows.map((row, index) => (
        <Row key={`${group.id}-${index}`} row={row} showLabel={group.label === undefined} />
      ))}
    </ul>
  )
  if (group.label !== undefined && FURTHER_TRIALS.test(group.label)) {
    return (
      <details className="cd-evidence cd-further-trials" id={group.id}>
        <summary>{group.label}</summary>
        {rows}
      </details>
    )
  }
  return (
    <>
      {group.label ? (
        <h3 className="cd-group-heading" id={group.id}>
          {group.label}
        </h3>
      ) : null}
      {rows}
    </>
  )
}

export function EvidenceDisclosure({ block }: { block: CorpusBlock }) {
  if (block.groups.length === 0) return null
  const dates: string[] = []
  if (block.sourceDate) dates.push(`recorded ${block.sourceDate}`)
  if (block.lastVerified) dates.push(`last checked ${block.lastVerified}`)
  return (
    <details className="cd-evidence" id={`${block.id}-evidence`}>
      <summary>Show the evidence</summary>
      {block.groups.map((group) => (
        <Group key={group.id} group={group} />
      ))}
      {dates.length > 0 ? <p className="cd-row-dates">{dates.join(' · ')}</p> : null}
    </details>
  )
}
