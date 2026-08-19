import Link from 'next/link'
import { entityPath } from '@/lib/canonical'
import { reachSentence, stagePositionApplies } from '@/lib/evidence-view'
import type { SearchResult } from '@/lib/search'

/**
 * Pure presentation: a non-empty list of results, grouped under the record each answer belongs
 * to. Callers (app/(public)/search/page.tsx) own the "nothing typed yet" and "no match" states,
 * so this component only ever sees results that exist. Server component, no interactivity, so it
 * renders identically with JavaScript disabled.
 *
 * Three things per result and nothing else: the question a reader would ask, the answer in full,
 * and how far the evidence for that one answer goes. The answer is never dropped in favour of the
 * evidence line — on its own that line reads as the answer, and beside a question like "Is
 * rapamycin approved for longevity?" it would invert it.
 */

interface ResultGroup {
  entitySlug: string
  entityName: string
  results: SearchResult[]
}

/**
 * Groups by record while preserving the ranking lib/search.ts produced: a record first appears
 * where its best-ranked answer appeared. Four BPC-157 answers under one heading is one thing to
 * read; four rows each restating "BPC-157" is four.
 */
function groupByEntity(results: SearchResult[]): ResultGroup[] {
  const groups: ResultGroup[] = []
  const bySlug = new Map<string, ResultGroup>()

  for (const result of results) {
    const existing = bySlug.get(result.entitySlug)
    if (existing) {
      existing.results.push(result)
      continue
    }
    const group: ResultGroup = {
      entitySlug: result.entitySlug,
      entityName: result.entityName,
      results: [result],
    }
    bySlug.set(result.entitySlug, group)
    groups.push(group)
  }

  return groups
}

export function SearchResults({ results }: { results: SearchResult[] }) {
  return (
    // 48px above the first group heading against 12px below it. At 24px above and 12px below,
    // the record name floated almost midway between the "N answers for …" count line and the
    // result it labels, so it read as a second line of the count rather than as the heading of
    // the list under it. A label belongs to what it names — roughly 4:1 closer to it.
    <div className="stack-6" style={{ marginTop: 'var(--s7)' }}>
      {groupByEntity(results).map((group) => (
        <section key={group.entitySlug}>
          {/* A label for the group, not a second headline. Left as a bare <h2><Link> it
              inherited the global link rule and rendered as 26px of underlined action blue
              immediately above the blue question link under it, so the record name was the
              loudest thing on the results page and two controls competed inside 40px. */}
          <h2 className="reading result-group__h">
            <Link href={entityPath(group.entitySlug)}>{group.entityName}</Link>
          </h2>
          {/* No margin: `.record-link` already opens with its own padding, so the 12px set here
              read as 36px of ink and put the heading almost exactly midway between the count line
              above it and the result below it. The heading binds downward on the padding alone —
              which is now the panel's padding, and is larger, so if this heading ever starts
              floating between the two again the fix is a negative pull on the heading, never a
              margin here. */}
          <ul className="records panels">
            {group.results.map((result) => (
              <li key={result.claimId}>
                {/* `record-link panel-surface`, the identical pair the homepage's "Recently
                    checked" rows use. A search result and a homepage row are the same object —
                    a question, its answer and how far the evidence goes — so they must be the
                    same panel, or the reader meets two different products in two clicks. */}
                <Link
                  href={`${entityPath(group.entitySlug)}#claim-${result.claimSlug}`}
                  className="record-link panel-surface"
                >
                  <div className="result__q">{result.consumerQuestion}</div>
                  <p className="result__a">{result.directAnswer}</p>
                  {/* Only an outcome answer has an evidence ladder. Printing the line for every
                      result put "Reviewed by a regulator" under "Is rapamycin FDA-approved for
                      longevity?" — which reads as a regulator having reviewed longevity evidence,
                      the exact overstatement stagePositionApplies exists to prevent. A regulatory,
                      access or mechanism answer drops the line rather than printing a weaker one. */}
                  {/* The same sentence the record page prints for the same claim, not the
                      shortened at-a-glance label. Four canonical stages share one public
                      position and the phrase cannot carry the difference between them; the
                      module exists so search cannot describe a stage differently from the
                      record it links to. "Evidence so far:" is also dropped — it implies more
                      evidence is on the way, which is the reading this site must not offer. */}
                  {stagePositionApplies(result.claimType) && (
                    <p className="result__reach">{reachSentence(result.proofBoundaryStage)}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
