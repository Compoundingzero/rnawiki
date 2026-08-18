import Link from 'next/link'
import { entityPath } from '@/lib/canonical'
import { plainHumanEvidence } from '@/lib/evidence-view'
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
    <div className="stack-6" style={{ marginTop: 'var(--s5)' }}>
      {groupByEntity(results).map((group) => (
        <section key={group.entitySlug}>
          <h2 className="reading">
            <Link href={entityPath(group.entitySlug)}>{group.entityName}</Link>
          </h2>
          <ul className="records reading" style={{ marginTop: 'var(--s3)' }}>
            {group.results.map((result) => (
              <li key={result.claimId}>
                <Link
                  href={`${entityPath(group.entitySlug)}#claim-${result.claimSlug}`}
                  className="record-link"
                >
                  <div className="result__q">{result.consumerQuestion}</div>
                  <p className="result__a">{result.directAnswer}</p>
                  <p className="result__reach">
                    Evidence so far: {plainHumanEvidence(result.proofBoundaryStage)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
