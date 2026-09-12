/**
 * The page ends in the record, not in conversion (V3): every source an anchor on this page points
 * at, once, with the date the source states, and then the licence each source's fields carry.
 *
 * A source line says what the source is and when it was recorded. It never says that the source
 * proves anything: what a source supports, qualifies or contradicts is written in the block whose
 * paragraph cites it.
 */
import type { CorpusSourceRow } from '@/lib/corpus/dossier-page'
import { VISIBLE_ROWS } from '@/lib/corpus/page-text'

/**
 * The source rows themselves. The record id carries `cd-source-id` rather than `cd-row-id`: a
 * record id inside a block is technical provenance and §14(6) keeps it inside a closed disclosure,
 * and this is the page's own citation list, where the id is what a reader follows the source by.
 */
function SourceRows({ sources }: { sources: CorpusSourceRow[] }) {
  return (
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
          <span className="cd-source-id">{source.id}</span>
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
  )
}

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
      {sources.length > 0 ? <SourceRows sources={sources.slice(0, VISIBLE_ROWS)} /> : null}
      {/* §14(9): six on the page, the counted rest inside a control of its own. */}
      {sources.length > VISIBLE_ROWS ? (
        <details className="cd-evidence cd-further-rows" id="cd-sources-more">
          <summary>
            {sources.length - VISIBLE_ROWS} more{' '}
            {sources.length - VISIBLE_ROWS === 1 ? 'source' : 'sources'}
          </summary>
          <SourceRows sources={sources.slice(VISIBLE_ROWS)} />
        </details>
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
