/**
 * Hubs (docs/specs/hubs.md §3): rows, never sentences.
 *
 * A page below its tier's indexing threshold is `noindex,follow`. These links are how it stays
 * reachable, and how a reader moves from one compound to the group it belongs to. The list reuses
 * the relations row style, so a hub name is markup on the member page and the overlap ruler does
 * not read every member of one hub as sharing a word.
 */
import type { CorpusHubRow } from '@/lib/corpus/dossier-page'
import { VISIBLE_ROWS } from '@/lib/corpus/page-text'

function Row({ hub }: { hub: CorpusHubRow }) {
  return (
    <li>
      {/* §14(7): a text node between the two inline elements. */}
      <span>{hub.label}</span> <a href={hub.path}>{hub.name}</a>
    </li>
  )
}

export function HubRows({ hubs }: { hubs: CorpusHubRow[] }) {
  if (hubs.length === 0) return null
  const visible = hubs.slice(0, VISIBLE_ROWS)
  const rest = hubs.slice(VISIBLE_ROWS)
  return (
    <section aria-labelledby="cd-hubs-heading">
      <h2 className="cd-section-heading" id="cd-hubs-heading">
        Hubs
      </h2>
      <ul className="cd-relations">
        {visible.map((hub) => (
          <Row hub={hub} key={hub.path} />
        ))}
      </ul>
      {/* §14(9): six on the page, the counted rest inside a control. */}
      {rest.length > 0 ? (
        <details className="cd-evidence cd-further-rows" id="cd-hubs-more">
          <summary>
            {rest.length} more {rest.length === 1 ? 'group' : 'groups'}
          </summary>
          <ul className="cd-relations">
            {rest.map((hub) => (
              <Row hub={hub} key={hub.path} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
