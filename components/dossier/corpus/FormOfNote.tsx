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
import type { CorpusSectionSentence } from '@/lib/corpus/dossier-page'

/**
 * The sentence with the counterpart's name as its link, written once (§13 item 9).
 *
 * The note usually names the other record inside its own sentence, and printing the link text
 * after it printed the name twice in a row. The link goes on the first occurrence of the name in
 * the sentence; a sentence that does not name it takes the link after it.
 */
function LinkedName({ href, name, sentence }: { href: string; name: string; sentence: string }) {
  const at = sentence.indexOf(name)
  if (at < 0) {
    return (
      <>
        {sentence} <a href={href}>{name}</a>
      </>
    )
  }
  return (
    <>
      {sentence.slice(0, at)}
      <a href={href}>{name}</a>
      {sentence.slice(at + name.length)}
    </>
  )
}

export function FormOfNote({ notes }: { notes: CorpusSectionSentence[] }) {
  if (notes.length === 0) return null
  return (
    <section aria-labelledby="cd-form-of-heading" className="cd-form-of">
      <h2 className="cd-visually-hidden" id="cd-form-of-heading">
        What this record is a form of
      </h2>
      {/*
        §13(9): the related record's name is printed once. Where the note already names it the link
        is on the name inside the sentence; where it does not, the name is the link after it.
      */}
      {notes.map((note) => (
        <p className="cd-paragraph" key={`${note.section}-${note.ordinal}`}>
          {note.counterpartSlug && note.counterpartName ? (
            <LinkedName
              href={`/d/${note.counterpartSlug}`}
              name={note.counterpartName}
              sentence={note.sentence ?? ''}
            />
          ) : (
            note.sentence
          )}
        </p>
      ))}
    </section>
  )
}
