/**
 * The form-of note (docs/specs/phase4-generators.md §6).
 *
 * A salt, ester, hydrate, stereoisomer, biosimilar or product component opens by saying what it is
 * a form of. The rendered duplicate check found these pages indistinguishable from their parents
 * precisely because they never said it: heparin calcium and heparin sodium rendered the same page.
 *
 * The sentence is the note Phase 3 recorded against the identity relation, copied verbatim, with a
 * link to the other record where the corpus holds it. Where Phase 3 moved registry studies that the
 * parent's name matched, a second sentence says how many went and where, so a reader who wondered
 * where the trials went can follow them.
 */
import Link from 'next/link'

import type { CorpusSectionSentence } from '@/lib/corpus/dossier-page'

export function FormOfNote({ notes }: { notes: CorpusSectionSentence[] }) {
  if (notes.length === 0) return null
  return (
    <section aria-labelledby="cd-form-of-heading" className="cd-form-of">
      <h2 className="cd-visually-hidden" id="cd-form-of-heading">
        What this record is a form of
      </h2>
      {notes.map((note) => (
        <p className="cd-paragraph" key={`${note.section}-${note.ordinal}`}>
          {note.sentence}
          {note.counterpartSlug && note.counterpartName ? (
            <>
              {' '}
              <Link href={`/d/${note.counterpartSlug}`}>{note.counterpartName}</Link>
            </>
          ) : null}
        </p>
      ))}
    </section>
  )
}
