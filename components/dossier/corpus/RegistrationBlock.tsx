/**
 * "Where it's registered" (docs/specs/phase4-generators.md §2, §3, §11).
 *
 * One line per jurisdiction, in the fixed order Singapore, United States, Australia, United
 * Kingdom, European Union, Japan, Canada, then any register whose source string the jurisdiction
 * map does not carry, under "Other registers" with the source's own words. The block renders on
 * every page, including a Tier 3 stub, because for a reader in Singapore it is the most useful
 * thing the page holds.
 *
 * Nothing here writes a status. Each line was written by `scripts/revamp/build_blocks.py` from the
 * page's own recorded `regulatory` field, and an unknown reads "Not found in [register] as of
 * [date]" — never a blank, and never an implication that nothing was looked for. A combination
 * product lists each component's lines under the component's name, as §3 requires.
 *
 * The controlled-substance schedules follow the jurisdiction lines: a schedule is a fact about how
 * a substance is supplied, so it belongs with the registers rather than in a banner. A jurisdiction
 * line names the class and then says "see schedules"; the statute rows themselves are written once,
 * in the schedules table below it (§13 items 2 and 4).
 *
 * Then the absences, as one table. Seven rows saying a register holds no record were, by
 * measurement, a quarter of every word in the corpus, and repeated on 25,000 pages they are not
 * prose — they are the page's furniture. §11 keeps the statement (Operating Rule 9 requires it)
 * and writes its shared words once: the "as of" and the date in the caption, the register names
 * and the finding in column headings, and each absent register as one cell. Every such row carries
 * `data-furniture="true"`, which the overlap ruler and the rendered-duplicate check skip exactly as
 * they skip the supervision block. An affirmative row — an approval, a withdrawal, a schedule, a
 * class — is never furniture and never enters this table.
 */
import { Fragment } from 'react'

import type {
  CorpusControlledRow,
  CorpusRegisterEvent,
  CorpusRegistrationLine,
} from '@/lib/corpus/dossier-page'
import { absenceCaption, absentAsOf, ABSENCE_COLUMNS } from '@/lib/corpus/page-text'
import { RegisterSummary } from './RegisterSummary'

function Line({ row }: { row: CorpusRegistrationLine }) {
  return (
    <li>
      <span className="cd-register-label">
        {row.component ? `${row.component} — ${row.label}` : row.label}
      </span>
      <span className="cd-register-status">{row.line}</span>
      <RegisterSummary
        applications={row.applications}
        label={row.component ? `${row.component}, ${row.label}` : row.label}
        upstreamRegisters={row.upstreamRegisters}
      />
    </li>
  )
}

function Schedule({ row }: { row: CorpusControlledRow }) {
  const version = row.versionDate ? `version ${row.versionDate}` : undefined
  return (
    <li>
      <span className="cd-register-label">{row.classOrSchedule}</span>
      <span className="cd-register-status">
        {row.statuteUrl ? (
          <a href={row.statuteUrl} rel="nofollow noopener" target="_blank">
            {row.list}
          </a>
        ) : (
          row.list
        )}
        {version ? ` · ${version}` : ''}
        {row.substanceAsListed ? ` · listed as "${row.substanceAsListed}"` : ''}
      </span>
    </li>
  )
}

/** The absences, in one table: the shared words once, each absent register as one cell (§11). */
function AbsentRegisters({ rows }: { rows: CorpusRegistrationLine[] }) {
  if (rows.length === 0) return null
  return (
    <table className="cd-register-absent">
      <caption className="cd-group-heading">{absenceCaption(absentAsOf(rows))}</caption>
      <thead className="cd-group-heading">
        <tr>
          {ABSENCE_COLUMNS.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr data-furniture="true" key={row.id}>
            <th scope="row">{row.component ? `${row.component} — ${row.label}` : row.label}</th>
            <td>{row.source ?? row.label}</td>
            <td>{row.absence}</td>
            {/* A register never cleared for this corpus has no read date, and the cell says so. */}
            <td>
              {row.dateChecked ? (
                <time dateTime={row.dateChecked}>{row.dateChecked}</time>
              ) : (
                'not read'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RegistrationBlock({
  events,
  registration,
  schedules,
}: {
  events: CorpusRegisterEvent[]
  registration: CorpusRegistrationLine[]
  schedules: CorpusControlledRow[]
}) {
  if (registration.length === 0 && schedules.length === 0 && events.length === 0) return null
  // §13(6): a row the block stage marked disclosed names no jurisdiction and no register, so it is
  // never a visible line. It is painted inside the block's own closed disclosure below.
  const visible = registration.filter((row) => !row.disclosed)
  const disclosedRows = registration.filter((row) => row.disclosed)
  const stated = visible.filter((row) => !row.absence)
  const absent = visible.filter((row) => Boolean(row.absence))
  const mapped = stated.filter((row) => row.jurisdiction !== 'OTHER')
  const other = stated.filter((row) => row.jurisdiction === 'OTHER')
  return (
    <section aria-labelledby="cd-registration-heading" className="cd-register">
      <h2 className="cd-section-heading" id="cd-registration-heading">
        Where it&rsquo;s registered
      </h2>
      {mapped.length > 0 ? (
        <ul className="cd-register-rows">
          {mapped.map((row) => (
            <Line key={row.id} row={row} />
          ))}
        </ul>
      ) : null}
      {other.length > 0 ? (
        <>
          <h3 className="cd-group-heading" id="cd-registration-other">
            Other registers
          </h3>
          <ul className="cd-register-rows">
            {other.map((row) => (
              <Line key={row.id} row={row} />
            ))}
          </ul>
        </>
      ) : null}
      {/*
        §13(2): the register events. The retired "What the registers record" block printed these as
        dated rows carrying the registers' own column names; here each is one sentence in words,
        with every register that recorded the same event named on the same line.
      */}
      {events.map((event) => (
        <p className="cd-paragraph" key={event.sentence}>
          {event.sentence}
        </p>
      ))}
      {schedules.length > 0 ? (
        <>
          <h3 className="cd-group-heading" id="cd-registration-schedules">
            Controlled-substance schedules
          </h3>
          <ul className="cd-register-rows">
            {schedules.map((row) => (
              <Schedule key={row.id} row={row} />
            ))}
          </ul>
        </>
      ) : null}
      <AbsentRegisters rows={absent} />
      {/*
        §13(6): the curated records NCATS files under "unspecified", and the upstream files it
        stitched to build them. Neither names a jurisdiction or a register, so neither is a line;
        they are technical provenance and this is where the page keeps them.
      */}
      {disclosedRows.length > 0 ? (
        <details className="cd-evidence">
          <summary>Show the curated records with no jurisdiction</summary>
          <ul className="cd-rows">
            {disclosedRows.map((row) => (
              <Fragment key={row.id}>
                <li>
                  <span className="cd-row-label">{row.label}</span>
                  <div className="cd-row-value">{row.line}</div>
                </li>
                {/*
                  The upstream files are their own row, not a third line inside the row above:
                  `scripts/corpus-20k/render/page-text.ts` writes them as their own line, and §11
                  makes the render and the painted page one text.
                */}
                {row.upstreamRegisters.length > 0 ? (
                  <li>
                    <span className="cd-row-label">Upstream registers</span>
                    <div className="cd-row-value">{row.upstreamRegisters.join(', ')}</div>
                  </li>
                ) : null}
              </Fragment>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
