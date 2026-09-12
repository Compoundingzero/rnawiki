/**
 * The register applications a "Where it's registered" line stands for (§3, §7).
 *
 * The Tier 2 pages printed one line per application, which is how eight near-identical rows came to
 * sit on a page and why the rendered duplicate check flagged them. §3 forbids that from Phase 4 on:
 * the applications collapse into the one summary line above ("8 applications: 5 prescription, 3
 * discontinued"), and their identifiers sit here, in a native `<details>` that is delivered in the
 * server HTML so a crawler and a keyboard both reach them in one step.
 *
 * An identifier is a technical value, so it lives in this labelled disclosure and never in a
 * sentence. Nothing here counts, sorts or interprets: the list is what the register recorded.
 */
export function RegisterSummary({
  applications,
  label,
  upstreamRegisters = [],
}: {
  applications: string[]
  label: string
  /**
   * §13(6): the upstream files NCATS stitched to build a curated row — "ClinicalTrials, February
   * 2021, FRDB, October 2021". They name where the curator read something, not a register that
   * recorded this substance, so they are technical provenance and belong in here.
   */
  upstreamRegisters?: string[]
}) {
  if (applications.length === 0 && upstreamRegisters.length === 0) return null
  const count = applications.length
  const summary =
    count === 0
      ? `Show what the curated record for ${label} was built from`
      : `Show the ${count === 1 ? 'application identifier' : `${count} application identifiers`} for ${label}`
  return (
    <details className="cd-evidence cd-register-applications">
      <summary>{summary}</summary>
      <ul className="cd-rows">
        {applications.map((application) => (
          <li key={application}>
            <div className="cd-row-value">
              <span className="cd-row-id">{application}</span>
            </div>
          </li>
        ))}
        {upstreamRegisters.length > 0 ? (
          <li key="upstream">
            {/* §15(8): a text node between the label and its value. */}
            <span className="cd-row-label">Upstream registers</span>{' '}
            <div className="cd-row-value">{upstreamRegisters.join(', ')}</div>
          </li>
        ) : null}
      </ul>
    </details>
  )
}
