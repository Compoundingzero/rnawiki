/**
 * Relations (R10): rows, never sentences.
 *
 * "Ester of · Mometasone" is a row. Written as prose it would become a shared sentence on every
 * page that carries the same relation, which is exactly the repetition the overlap harness
 * measures. A relation renders only where the other record exists, so no row points nowhere.
 *
 * §14(12): one relation per pair. Two rows naming the same record — "Stereoisomer of X" beside
 * "Same structure as X" — are one relation stated twice, at two levels of precision, and the
 * identity revision now records only the most specific of them. This component keeps the guard
 * anyway, because a page loaded from an earlier revision must not paint the pair.
 */
import type { CorpusRelationRow, CorpusSectionSentence } from '@/lib/corpus/dossier-page'
import { VISIBLE_ROWS } from '@/lib/corpus/page-text'

function Row({ relation }: { relation: CorpusRelationRow }) {
  return (
    <li>
      {/* §14(7): a text node between the label and the name, so no extractor joins them. */}
      <span>{relation.label}</span>{' '}
      {relation.slug ? (
        <a href={`/d/${relation.slug}`}>{relation.name}</a>
      ) : (
        <span>{relation.name}</span>
      )}
    </li>
  )
}

/**
 * §17(4): a relation the identity stage could not confirm, inside the closed control.
 *
 * "PRUSSIAN BLUE INSOLUBLE and Hydrogen Cyanide are linked by an FDA salt or solvate relationship,
 * and neither the structures nor the printed names confirm that one is a salt of the other" opened
 * the page as its form-of note, where a reader meets the sentence that says what this record is a
 * form of. It says the opposite: that the corpus cannot say. It is technical vocabulary about how
 * the record was resolved, so it belongs here, with the identifiers and the record ids, and the
 * relation row above states the relation itself.
 */
function RelationNotes({ notes }: { notes: CorpusSectionSentence[] }) {
  if (notes.length === 0) return null
  return (
    <details className="cd-evidence cd-relation-notes" id="cd-relations-evidence">
      <summary>Show the evidence</summary>
      <ul className="cd-rows">
        {notes.map((note) => (
          <li key={`${note.section}-${note.ordinal}`}>
            {note.counterpartName ? (
              <span className="cd-row-label">{note.counterpartName}</span>
            ) : null}
            <div className="cd-row-value">{note.sentence}</div>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function RelationsRows({
  relations,
  notes = [],
}: {
  relations: CorpusRelationRow[]
  notes?: CorpusSectionSentence[]
}) {
  if (relations.length === 0) return null
  const visible = relations.slice(0, VISIBLE_ROWS)
  const rest = relations.slice(VISIBLE_ROWS)
  return (
    <section aria-labelledby="cd-relations-heading">
      <h2 className="cd-section-heading" id="cd-relations-heading">
        Relations
      </h2>
      <ul className="cd-relations">
        {visible.map((relation, index) => (
          <Row key={`${relation.label}-${relation.name}-${index}`} relation={relation} />
        ))}
      </ul>
      {/* §14(9): six on the page, the counted rest inside a control. */}
      {rest.length > 0 ? (
        <details className="cd-evidence cd-further-rows" id="cd-relations-more">
          <summary>
            {rest.length} more recorded {rest.length === 1 ? 'relation' : 'relations'}
          </summary>
          <ul className="cd-relations">
            {rest.map((relation, index) => (
              <Row
                key={`${relation.label}-${relation.name}-${VISIBLE_ROWS + index}`}
                relation={relation}
              />
            ))}
          </ul>
        </details>
      ) : null}
      <RelationNotes notes={notes} />
    </section>
  )
}
