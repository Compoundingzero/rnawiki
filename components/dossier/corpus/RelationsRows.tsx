/**
 * Relations (R10): rows, never sentences.
 *
 * "Ester of · Mometasone" is a row. Written as prose it would become a shared sentence on every
 * page that carries the same relation, which is exactly the repetition the overlap harness
 * measures. A relation renders only where the other record exists, so no row points nowhere.
 */
import Link from 'next/link'

import type { CorpusRelationRow } from '@/lib/corpus/dossier-page'

export function RelationsRows({ relations }: { relations: CorpusRelationRow[] }) {
  if (relations.length === 0) return null
  return (
    <section aria-labelledby="cd-relations-heading">
      <h2 className="cd-section-heading" id="cd-relations-heading">
        Relations
      </h2>
      <ul className="cd-relations">
        {relations.map((relation, index) => (
          <li key={`${relation.label}-${relation.name}-${index}`}>
            <span>{relation.label}</span>
            {relation.slug ? (
              <Link href={`/d/${relation.slug}`}>{relation.name}</Link>
            ) : (
              <span>{relation.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
