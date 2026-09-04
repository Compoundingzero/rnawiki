/**
 * The page ends in the record, not in conversion (V3): every source an anchor on this page points
 * at, once, with the date the source states, and then the licence each source's fields carry.
 *
 * A source line says what the source is and when it was recorded. It never says that the source
 * proves anything: what a source supports, qualifies or contradicts is written in the block whose
 * paragraph cites it.
 */
import type { CorpusSourceRow } from '@/lib/corpus/dossier-page'

export function SourceList({
  sources,
  licenceNotes,
}: {
  sources: CorpusSourceRow[]
  licenceNotes: string[]
}) {
  if (sources.length === 0 && licenceNotes.length === 0) return null
  return (
    <section aria-labelledby="cd-sources-heading">
      <h2 className="cd-section-heading" id="cd-sources-heading">
        Sources
      </h2>
      {sources.length > 0 ? (
        <ul className="cd-source-rows">
          {sources.map((source) => (
            <li key={`${source.kind}-${source.id}`}>
              {source.href ? (
                <a href={source.href} rel="nofollow noopener" target="_blank">
                  {source.register}
                </a>
              ) : (
                <span>{source.register}</span>
              )}{' '}
              <span className="cd-row-id">{source.id}</span>
              {source.sourceDate ? (
                <>
                  {' · '}
                  <time dateTime={source.sourceDate}>{source.sourceDate}</time>
                </>
              ) : null}
              {source.title ? <div className="cd-row-value">{source.title}</div> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {licenceNotes.length > 0 ? <p className="cd-licence">{licenceNotes.join(' · ')}</p> : null}
      <p className="cd-definitions">
        <a href="/how-it-works">How these records are assembled</a>
        {' · '}
        {/*
          The registers a record was checked against, and the four that were never cleared, are the
          same fact on every record. They are stated once on /definitions and linked from here as
          markup, so no page carries the sentence in its own prose.
        */}
        <a href="/definitions#registers">Which registers were checked</a>
      </p>
    </section>
  )
}
