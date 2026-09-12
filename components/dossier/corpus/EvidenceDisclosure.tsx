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
 * §13(5), §14(9): a list shows six rows. The rest are grouped under a counted label — "14 further
 * recorded trials", "8 more recorded rows" — and that group is a closed native `<details>` of its
 * own, so its rows are not painted until a reader opens them. The split is made once, in
 * `groupRevealedRows`, so the corpus renderer's measured text and this component carry the same
 * rows under the same headings.
 */
import type { CorpusBlock, CorpusRowGroup } from '@/lib/corpus/dossier-page'
import type { RevealedRow } from '@/lib/corpus/page-text'

/** The label a counted remainder carries, in both shapes `groupRevealedRows` writes. */
const FURTHER_ROWS = /^\d+ (?:further recorded trials?|more recorded rows?)$/

function Row({ row, showLabel }: { row: RevealedRow; showLabel: boolean }) {
  const label = showLabel ? row.label : undefined
  /*
   * Three elements, not five. The label and the identifier are inline and the value is a block, so
   * the browser puts them on the two lines the template asks for without a flex wrapper around the
   * first two, and without a class on the row itself: `.cd-rows > li` is the row. Step 6.1 —
   * the wrapper and the row class were 8.1 KB of the median page's markup and painted nothing.
   *
   * §14(7): the space between the two inline spans is a text node, not only the half-rem the
   * stylesheet adds. A reader saw the gap either way; every text extraction — this site's ruler,
   * its duplicate check and a crawler's — read `KetoconazoleA-label-statement` as one word.
   */
  return (
    <li>
      {label ? <span className="cd-row-label">{label}</span> : null}
      {label && row.identifier ? ' ' : null}
      {row.identifier ? <span className="cd-row-id">{row.identifier}</span> : null}
      <div className="cd-row-value">{row.value}</div>
    </li>
  )
}

function Group({ group }: { group: CorpusRowGroup }) {
  const rows = (
    <ul className="cd-rows">
      {group.rows.map((row, index) => (
        /*
         * §15(7): the row keeps its own label unless the group's heading is that same label. A
         * counted remainder ("4 more recorded rows") heads rows that share no label, and hiding
         * their labels painted the phase and status list as bare numbers.
         */
        <Row key={`${group.id}-${index}`} row={row} showLabel={group.label !== row.label} />
      ))}
    </ul>
  )
  /*
   * The counted remainder, by the flag `groupRevealedRows` sets and — for a group built before that
   * flag existed, or by a loader that stored only the label — by the label's own shape. Both name
   * the same thing: a group whose heading is a count of what is not on the page.
   */
  if (group.disclosed === true || (group.label !== undefined && FURTHER_ROWS.test(group.label))) {
    return (
      <details className="cd-evidence cd-further-rows" id={group.id}>
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
