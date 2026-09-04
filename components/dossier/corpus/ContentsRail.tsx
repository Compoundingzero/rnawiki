/**
 * The contents rail (dossier template, "Contents rail"; V2, Vercel V1-V8).
 *
 * 240 px, sticky, at 1024 px and above, listing every question and — one level in — the groups the
 * revealed layer holds. Labels wrap to as many lines as they need and are never truncated, because
 * a truncated question is a different question. The active marker is a 2 px left bar driven by the
 * block whose top crossed the header line; the script that moves it is the page's only client
 * component and it reads the DOM rather than being handed the page's data.
 *
 * Below 1024 px the same list is a `<details>` under the header which sticks to the top once the
 * reader scrolls past it — the Vercel failure (a rail that simply disappears) designed out. The
 * rail is markup: it contributes no words to the page's own prose.
 */
import type { CorpusBlock } from '@/lib/corpus/dossier-page'

interface ContentsRailProps {
  blocks: CorpusBlock[]
  variant: 'rail' | 'inline'
}

function Items({ blocks }: { blocks: CorpusBlock[] }) {
  return (
    <ol>
      {blocks.map((block) => {
        const groups = block.groups.filter((group) => group.label !== undefined)
        return (
          <li key={block.id}>
            <a className="cd-rail-link" data-corpus-rail={block.id} href={`#${block.id}`}>
              {block.question}
            </a>
            {groups.length > 0 ? (
              <ol className="cd-rail-sub">
                {groups.slice(0, 4).map((group) => (
                  <li key={group.id}>
                    <a className="cd-rail-link" data-corpus-rail={block.id} href={`#${group.id}`}>
                      {group.label}
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function ContentsRail({ blocks, variant }: ContentsRailProps) {
  if (blocks.length === 0) return null
  if (variant === 'inline') {
    return (
      <details className="cd-contents">
        <summary>Contents</summary>
        <Items blocks={blocks} />
      </details>
    )
  }
  return (
    <nav className="cd-rail" aria-label="Contents">
      <p className="cd-rail-heading">Contents</p>
      <Items blocks={blocks} />
    </nav>
  )
}
