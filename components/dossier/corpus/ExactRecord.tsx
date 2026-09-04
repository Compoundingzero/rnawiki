/**
 * The exact record — the one boxed element on the page (dossier template, "Question block
 * anatomy"), with an all-caps header bar naming it.
 *
 * Registry identifiers are technical vocabulary, so they live in this explicitly labelled
 * disclosure rather than in the reading column's sentences. A row appears only for an identifier
 * the record actually holds.
 */
import type { CorpusIdentifierRow } from '@/lib/corpus/dossier-page'

export function ExactRecord({ identifiers }: { identifiers: CorpusIdentifierRow[] }) {
  if (identifiers.length === 0) return null
  return (
    <section className="cd-record" aria-labelledby="cd-record-heading">
      <h2 className="cd-record-head" id="cd-record-heading">
        The exact record
      </h2>
      <dl>
        {identifiers.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              {row.href ? (
                <a href={row.href} rel="nofollow noopener" target="_blank">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
