/**
 * Interactions, in three evidence tiers (docs/specs/phase4-generators.md §4).
 *
 * Every line begins with its tier in words — Label-documented, Curated, Predicted from mechanism —
 * and the tier label is a visible element, not a class name on an element. A reader deciding what
 * to take with what must be able to see, without hovering anything, whether a line comes from an
 * approved label, from a curated dataset, or from a rule this site applied.
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
import Link from 'next/link'

import type { CorpusInteractionLine, CorpusInteractions } from '@/lib/corpus/dossier-page'

const TIER_ORDER: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C']

function Line({ line }: { line: CorpusInteractionLine }) {
  return (
    <li className="cd-interaction">
      <span className="cd-interaction-tier">{line.tierLabel}</span>
      <span className="cd-interaction-line">{line.line}</span>
    </li>
  )
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
      <h3 className="cd-group-heading" id={`cd-interactions-${tier.toLowerCase()}`}>
        {label}
      </h3>
      <ul className="cd-interactions">
        {inline.map((line) => (
          <Line key={line.id} line={line} />
        ))}
      </ul>
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
  const { lines, statement, predictedOnly } = interactions
  if (lines.length === 0 && statement === undefined) return null
  const statementElement =
    statement === undefined ? null : (
      <p className="cd-paragraph cd-interaction-statement">{statement}</p>
    )
  return (
    <section aria-labelledby="cd-interactions-heading" className="cd-interactions-block">
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
          <ul className="cd-rows">
            {interactions.sourcesChecked.map((source) => (
              <li className="cd-row" key={source}>
                <div className="cd-row-value">{source}</div>
              </li>
            ))}
            {lines
              .filter((line) => line.ruleId !== undefined || line.setId !== undefined)
              .map((line) => (
                <li className="cd-row" key={`${line.id}-record`}>
                  <div className="cd-row-head">
                    <span className="cd-row-label">{line.counterpartName ?? line.tierLabel}</span>
                    <span className="cd-row-id">
                      {[line.ruleId, line.setId ?? line.sourceRecordId]
                        .filter((value): value is string => Boolean(value))
                        .join(' · ')}
                    </span>
                  </div>
                  {line.counterpartSlug && line.counterpartName ? (
                    <div className="cd-row-value">
                      <Link href={`/d/${line.counterpartSlug}`}>{line.counterpartName}</Link>
                    </div>
                  ) : null}
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
