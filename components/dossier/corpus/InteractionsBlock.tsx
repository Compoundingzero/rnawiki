/**
 * Interactions, in three evidence tiers (docs/specs/phase4-generators.md §4).
 *
 * Every line begins with its tier in words — Label-documented, Curated, Predicted from mechanism —
 * and the tier label is a visible element, not a class name on an element. A reader deciding what
 * to take with what must be able to see, without hovering anything, whether a line comes from an
 * approved label, from a curated dataset, or from a rule this site applied.
 *
 * §13(3): one visible tier label per line, and never a second badge. The block painted the tier
 * three times over — as a heading above the group, as a badge on every line, and as the line's own
 * first word — and the enzyme rows painted nine near-identical lines with a record id on each. The
 * badge and the heading are gone; the line carries the label, the curated enzyme rows arrive
 * already grouped by role from `scripts/revamp/page_blocks.py`, and the record ids are in the
 * closed disclosure at the foot of the block and nowhere above it.
 *
 * The page-level statement is always here, whether or not a line is. Where nothing was found it
 * reads "No interaction found in [the registers checked] as of [date]"; the words "safe" and "no
 * interaction" never stand on their own, because an absence of evidence in three registers is not
 * a finding of safety. Where predictions are all the page holds, the statement comes first, so the
 * reader meets what was checked before meeting what was inferred.
 *
 * The first six lines of each tier read inline; the rest sit in one disclosure with a count, and
 * where a tier holds more counterparts than are stored the line above the disclosure says how many.
 */
import type { CorpusInteractionLine, CorpusInteractions } from '@/lib/corpus/dossier-page'
import {
  interactionDisclosureLabel,
  interactionRecordIds,
  type InteractionDisclosureSource,
} from '@/lib/corpus/page-text'

const TIER_ORDER: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C']

/** One stored line, in the shape the two shared disclosure builders read (§14(6)). */
function disclosureSource(line: CorpusInteractionLine): InteractionDisclosureSource {
  return {
    tierLabel: line.tierLabel,
    line: line.line,
    ...(line.counterpartName ? { counterpartName: line.counterpartName } : {}),
    ...(line.ruleId ? { ruleId: line.ruleId } : {}),
    ...(line.setId ? { setId: line.setId } : {}),
    ...(line.sourceRecordId ? { sourceRecordId: line.sourceRecordId } : {}),
    ...(line.groupedDirection ? { groupedDirection: line.groupedDirection } : {}),
    ...(line.recordIds ? { groupedRecordIds: line.recordIds } : {}),
  }
}

/*
 * One row, one element (step 6.1).
 *
 * The row was `<li class="cd-interaction"><span class="cd-interaction-line">`, and neither part
 * painted anything the row itself could not: no rule in the stylesheet used `.cd-interaction`, and
 * `.cd-interaction-line` set an ink the row now sets. Together they were 63 bytes of markup on
 * every interaction line the corpus publishes, and §17 item 1 published 93,252 more of them. No
 * check reads either class: `self_audit.py` reads `ul.cd-interactions`, `dom_parity.py` hides
 * neither, and `browser-checks.ts` measures neither.
 */
function Line({ line }: { line: CorpusInteractionLine }) {
  return <li>{line.line}</li>
}

function Tier({
  tier,
  lines,
  total,
}: {
  tier: 'A' | 'B' | 'C'
  lines: CorpusInteractionLine[]
  total?: number
}) {
  if (lines.length === 0) return null
  const inline = lines.filter((line) => !line.disclosed)
  const disclosed = lines.filter((line) => line.disclosed)
  const shown = lines.length
  const label = lines[0]?.tierLabel ?? tier
  return (
    <>
      {/* A tier whose lines are all disclosed painted an empty list element above the control. */}
      {inline.length > 0 ? (
        <ul className="cd-interactions">
          {inline.map((line) => (
            <Line key={line.id} line={line} />
          ))}
        </ul>
      ) : null}
      {disclosed.length > 0 ? (
        <details className="cd-evidence">
          <summary>
            Show {disclosed.length} more {label.toLowerCase()}{' '}
            {disclosed.length === 1 ? 'line' : 'lines'}
          </summary>
          <ul className="cd-interactions">
            {disclosed.map((line) => (
              <Line key={line.id} line={line} />
            ))}
          </ul>
        </details>
      ) : null}
      {total !== undefined && total > shown ? (
        <p className="cd-paragraph">
          {total} counterparts are recorded under {label.toLowerCase()} for this record; {shown} are
          shown.
        </p>
      ) : null}
    </>
  )
}

export function InteractionsBlock({ interactions }: { interactions: CorpusInteractions }) {
  const { statement, predictedOnly } = interactions
  // §13(3): the visible block never repeats a line. Two stored rows that render the same words are
  // the same statement, and the page states it once.
  const seen = new Set<string>()
  const lines = interactions.lines.filter((line) => {
    if (seen.has(line.line)) return false
    seen.add(line.line)
    return true
  })
  if (lines.length === 0 && statement === undefined) return null
  /*
   * §11: where the page holds no interaction row the statement is an absence in fixed words, on
   * 25,217 pages, and it is furniture — kept, because Operating Rule 9 requires it, and marked so
   * the ruler and the duplicate check skip it. Where a row was found the same sentence names what
   * was checked beside what was found, and it is content.
   */
  const statementElement =
    statement === undefined ? null : (
      <p
        className="cd-paragraph cd-interaction-statement"
        {...(lines.length === 0 ? { 'data-furniture': 'true' } : {})}
      >
        {statement}
      </p>
    )
  return (
    <section aria-labelledby="cd-interactions-heading">
      <h2 className="cd-section-heading" id="cd-interactions-heading">
        Interactions
      </h2>
      {predictedOnly ? statementElement : null}
      {TIER_ORDER.map((tier) => (
        <Tier
          key={tier}
          lines={lines.filter((line) => line.tier === tier)}
          tier={tier}
          {...(interactions.totals[tier] !== undefined ? { total: interactions.totals[tier] } : {})}
        />
      ))}
      {predictedOnly ? null : statementElement}
      {interactions.sourcesChecked.length > 0 ? (
        <details className="cd-evidence">
          <summary>Show what was checked</summary>
          {/*
            §11: on a page with no interaction row these names are the statement's own evidence and
            say only where nothing was found — the same three, in the same order, on 25,217 pages.
            They are marked with the statement they belong to, so the ruler and the duplicate check
            skip both or neither. The mark sits on the list rather than on each of its rows: a page
            with no interaction row has no provenance row either, so the list holds nothing but
            these names, and hiding it hides exactly what hiding each row hid (step 6.1).
          */}
          <ul className="cd-rows" {...(lines.length === 0 ? { 'data-furniture': 'true' } : {})}>
            {interactions.sourcesChecked.map((source) => (
              <li key={source}>{source}</li>
            ))}
            {/*
              §14(6): the dataset records behind every line, here and nowhere above. The label and
              the ids are built by the two functions the corpus renderer also calls
              (`interactionDisclosureLabel`, `interactionRecordIds`), because each had its own idea
              of what this row says: the render wrote "Substrate of CYP1A1, 1A2 and 2E1
              frdb:ddi:12474 · …" and this component painted "CuratedB-inxight-frdb".

              Step 6.1: one element per record, not three. The label is the row's own first words
              and the counterpart is the link beside the id, so the element that remains is the one
              a rule reads — `.cd-row-id`, which `self_audit.py` requires to sit inside a closed
              control and `corpus-render-safety` requires to appear nowhere else. §14(7): the space
              before the id and the space before the link are text nodes, so no extraction reads
              two of these values as one word.
            */}
            {lines
              .map((line) => ({ line, ids: interactionRecordIds(disclosureSource(line)) }))
              .filter((entry) => entry.ids.length > 0)
              .map(({ line, ids }) => (
                <li key={`${line.id}-record`}>
                  {`${interactionDisclosureLabel(disclosureSource(line))} `}
                  <span className="cd-row-id">{ids.join(' · ')}</span>
                  {line.counterpartSlug && line.counterpartName ? (
                    <>
                      {' '}
                      <a href={`/d/${line.counterpartSlug}`}>{line.counterpartName}</a>
                    </>
                  ) : null}
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
