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
 */
import type { CorpusBlock, CorpusRowGroup } from '@/lib/corpus/dossier-page'
import type { RevealedRow } from '@/lib/corpus/page-text'

function Row({ row, showLabel }: { row: RevealedRow; showLabel: boolean }) {
  const label = showLabel ? row.label : undefined
  return (
    <li className="cd-row">
      {label || row.identifier ? (
        <div className="cd-row-head">
          {label ? <span className="cd-row-label">{label}</span> : null}
          {row.identifier ? <span className="cd-row-id">{row.identifier}</span> : null}
        </div>
      ) : null}
      <div className="cd-row-value">{row.value}</div>
    </li>
  )
}

function Group({ group }: { group: CorpusRowGroup }) {
  return (
    <>
      {group.label ? (
        <h3 className="cd-group-heading" id={group.id}>
          {group.label}
        </h3>
      ) : null}
      <ul className="cd-rows">
        {group.rows.map((row, index) => (
          <Row key={`${group.id}-${index}`} row={row} showLabel={group.label === undefined} />
        ))}
      </ul>
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
