/**
 * Generic and patent (docs/specs/phase4-generators.md §5).
 *
 * One line, from the FDA Orange Book and Purple Book data files: whether the record is a reference
 * listed drug, the earliest unexpired patent expiry, the exclusivity end, whether a generic is
 * available and when the first one was approved, and the therapeutic-equivalence code.
 *
 * A page with no Orange Book record reads "No US patent or exclusivity data on record" and, where
 * the registers make the reason knowable, says what it is — not an approved US small molecule, or a
 * biologic whose exclusivity is in the Purple Book instead. That is a finding about the register,
 * not about the medicine, and the line says so rather than leaving a blank a reader would fill in.
 */
import type { CorpusPatentLine } from '@/lib/corpus/dossier-page'
import { RegisterSummary } from './RegisterSummary'

export function PatentBlock({ patent }: { patent?: CorpusPatentLine }) {
  if (!patent) return null
  return (
    <section aria-labelledby="cd-patent-heading" className="cd-patent">
      <h2 className="cd-section-heading" id="cd-patent-heading">
        Generic and patent
      </h2>
      {/*
        §11: a line that says only that no US register holds this record is the same statement on
        25,226 pages. It stays on the page and is marked furniture, so the overlap ruler measures
        what this record says rather than what every record says. A line carrying a date, a BLA
        number or a TE code is a finding and is not marked.
      */}
      <p className="cd-paragraph" {...(patent.absence ? { 'data-furniture': 'true' } : {})}>
        {patent.line}
      </p>
      <RegisterSummary
        applications={patent.applications}
        label={patent.register ?? 'the United States register'}
      />
    </section>
  )
}
