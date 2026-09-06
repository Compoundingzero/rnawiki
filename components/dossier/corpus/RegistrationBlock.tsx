/**
 * "Where it's registered" (docs/specs/phase4-generators.md §2, §3).
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
 * a substance is supplied, so it belongs with the registers rather than in a banner.
 */
import type { CorpusControlledRow, CorpusRegistrationLine } from '@/lib/corpus/dossier-page'
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

export function RegistrationBlock({
  registration,
  schedules,
}: {
  registration: CorpusRegistrationLine[]
  schedules: CorpusControlledRow[]
}) {
  if (registration.length === 0 && schedules.length === 0) return null
  const mapped = registration.filter((row) => row.jurisdiction !== 'OTHER')
  const other = registration.filter((row) => row.jurisdiction === 'OTHER')
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
    </section>
  )
}
