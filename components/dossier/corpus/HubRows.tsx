/**
 * Hubs (docs/specs/hubs.md §3): rows, never sentences.
 *
 * A page below its tier's indexing threshold is `noindex,follow`. These links are how it stays
 * reachable, and how a reader moves from one compound to the group it belongs to. The list reuses
 * the relations row style, so a hub name is markup on the member page and the overlap ruler does
 * not read every member of one hub as sharing a word.
 */
import Link from 'next/link'

import type { CorpusHubRow } from '@/lib/corpus/dossier-page'

export function HubRows({ hubs }: { hubs: CorpusHubRow[] }) {
  if (hubs.length === 0) return null
  return (
    <section aria-labelledby="cd-hubs-heading">
      <h2 className="cd-section-heading" id="cd-hubs-heading">
        Hubs
      </h2>
      <ul className="cd-relations">
        {hubs.map((hub) => (
          <li key={hub.path}>
            <span>{hub.label}</span>
            <Link href={hub.path}>{hub.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
