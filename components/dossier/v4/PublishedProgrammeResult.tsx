/** A published conclusion belongs to one programme and one exact use, never to the medicine name. */
import type { ProgrammeEvidenceReadModel, ProgrammeSummaryFieldPath } from '@/lib/evidence/types'
import { resolveSafeSourceLocator } from '@/lib/source-locator'

type Programme = NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>

function fieldSources(programme: Programme, fieldPath: ProgrammeSummaryFieldPath) {
  const verdict = programme.verdict
  if (!verdict) return []

  const dependencies = programme.summaryFieldDependencies.filter(
    (dependency) =>
      dependency.verdictRevisionId === verdict.id && dependency.fieldPath === fieldPath,
  )
  if (dependencies.length === 0) return []

  const claims = new Map(programme.claims.map((claim) => [claim.id, claim]))
  const matched = dependencies.map((dependency) => claims.get(dependency.claimId))
  // If a published dependency cannot be resolved, withhold the citation rather than borrowing a
  // source from another claim in the verdict.
  if (matched.some((claim) => !claim || claim.sources.length === 0)) return []

  const sources = new Map<string, { label: string; href: string | null; relationship: string }>()
  for (const claim of matched) {
    for (const source of claim!.sources) {
      sources.set(`${source.id}:${source.relationship}`, {
        label: source.title ?? source.externalIdentifier ?? source.canonicalLocator,
        href: resolveSafeSourceLocator(source.canonicalLocator)?.href ?? null,
        relationship: source.relationship,
      })
    }
  }
  return [...sources.values()]
}

function FieldSource({
  programme,
  fieldPath,
}: {
  programme: Programme
  fieldPath: ProgrammeSummaryFieldPath
}) {
  const sources = fieldSources(programme, fieldPath)
  if (sources.length === 0) return null
  return (
    <p className="dv4-simple-note">
      Source{sources.length === 1 ? '' : 's'} linked to this statement:{' '}
      {sources.map((source, index) => (
        <span key={`${source.label}-${index}`}>
          {index > 0 ? ' · ' : null}
          {source.href ? (
            <a href={source.href} rel="noopener noreferrer">
              {source.label}
            </a>
          ) : (
            source.label
          )}
          {source.relationship !== 'SUPPORTS'
            ? ` (${source.relationship.toLowerCase()} this claim)`
            : null}
        </span>
      ))}
    </p>
  )
}

export function PublishedProgrammeResult({
  programme,
  medicineSlug,
}: {
  programme: Programme
  medicineSlug: string
}) {
  const verdict = programme.verdict
  if (!verdict) return null
  const historyHref = `/d/${encodeURIComponent(medicineSlug)}/programme/${encodeURIComponent(programme.slug)}/history`
  const findingSources = fieldSources(programme, 'summary.bestSupportedFinding')
  const limitationSources = fieldSources(programme, 'summary.mainLimitation')

  if (findingSources.length === 0 || limitationSources.length === 0) {
    return (
      <section
        aria-labelledby="answer-heading"
        className="dv4-simple-answer"
        data-evidence-scope="programme"
        id="answer"
      >
        <h2 id="answer-heading">Evidence for this use</h2>
        <p>
          The published summary cannot be shown here because the exact source link for its finding
          or limitation is missing from this record.
        </p>
        <p className="dv4-simple-note">
          <a href={historyHref}>Check the publication history.</a>
        </p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="answer-heading"
      className="dv4-simple-answer"
      data-evidence-scope="programme"
      id="answer"
    >
      <h2 id="answer-heading">Evidence for this use</h2>
      <p className="dv4-simple-note">{programme.title}</p>
      <div className="dv4-simple-result">
        <h3>What the published review found</h3>
        <p>{verdict.bestSupportedFinding}</p>
        <FieldSource fieldPath="summary.bestSupportedFinding" programme={programme} />
        <p className="dv4-simple-limit">
          <strong>Important limit.</strong> {verdict.mainLimitation}
        </p>
        <FieldSource fieldPath="summary.mainLimitation" programme={programme} />
        <dl className="dv4-hero-facts dv4-simple-scope">
          <div>
            <dt>Who was studied</dt>
            <dd>{verdict.populationScope}</dd>
          </div>
          <div>
            <dt>What was measured</dt>
            <dd>{verdict.outcomeScope}</dd>
          </div>
          <div>
            <dt>Over what period</dt>
            <dd>{verdict.periodScope}</dd>
          </div>
        </dl>
        <p className="dv4-simple-note">
          This conclusion covers the named programme and use only.{' '}
          <a href={historyHref}>See its reviewed scope and publication history.</a>
        </p>
      </div>
    </section>
  )
}
