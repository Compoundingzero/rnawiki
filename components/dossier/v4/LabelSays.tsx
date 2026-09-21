import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'

/*
 * What the medicine's own label says, word for word.
 *
 * `data/sources/openfda-label/mapped.parquet` holds 124,706 rows of DailyMed Structured Product
 * Label text under CC0 and only three of its eleven sections ever became a page field, so
 * contraindications, warnings, overdose and use-in-specific-populations were extracted,
 * licence-cleared, on disk and unreachable by any reader. `scripts/revamp/extract_label_sections.py`
 * pulls the five into the artifact this reads.
 *
 * It is quoted, never paraphrased. Rewriting a regulator's contraindication text is the slop this
 * work exists to remove, and a quotation needs no rewriting to be honest. Three things keep it
 * honest, all of them learned from `scripts/research/label-worked-metformin.md`:
 *
 *   * the label's own words, so a reader can check them;
 *   * the label's own URL and date, so a reader can read the rest and see which revision this is;
 *   * the statement that this is one product's label, not the substance as a whole, because the
 *     source archive does not retain route, dosage form, SPL document id or application.
 *
 * The section renders nothing at all when the record has no label text, which is the honest
 * outcome for the supplements and botanicals that have no approved label.
 */

interface LabelSection {
  text: string
  truncated?: boolean
  sourceUrl: string
  sourceRecordId: string
  sourceDate: string
  licence: string
}

interface LabelArtifact {
  note: string
  sections: string[]
  maxChars: number
  records: Record<string, { key: string; sections: Record<string, LabelSection> }>
}

/** Read once per process: the artifact is 12 MB and is the same for every request. */
let cache: LabelArtifact | null | undefined

function artifact(): LabelArtifact | null {
  if (cache !== undefined) return cache
  try {
    cache = JSON.parse(
      readFileSync(join(process.cwd(), 'data/sources/openfda-label/label-sections.json'), 'utf8'),
    ) as LabelArtifact
  } catch {
    cache = null
  }
  return cache
}

/**
 * Task order, because that is the order a reader's question arrives in: the regulator's strongest
 * warning first, then who must not take it, then what to watch for, then who was never studied,
 * then what happens if too much is taken.
 */
const HEADINGS: Array<[string, string]> = [
  ['boxed_warning', "The regulator's strongest warning"],
  ['contraindications', 'Who must not take it'],
  ['warnings_and_cautions', 'What to watch for'],
  ['use_in_specific_populations', 'Who it was not studied in'],
  ['overdosage', 'If too much is taken'],
]

export function LabelSays({ slug }: { slug: string }): ReactNode {
  const data = artifact()
  const entry = data?.records[slug]
  if (!data || !entry) return null
  const present = HEADINGS.filter(([field]) => entry.sections[field])
  if (present.length === 0) return null

  return (
    <section aria-labelledby="label-says-heading" className="dv4-simple-section" id="label-says">
      <h2 id="label-says-heading">What the medicine&rsquo;s own label says</h2>
      <p className="dv4-simple-note">
        Word for word from the approved label. RNAWiki has not rewritten it. This is one
        product&rsquo;s label. It is not the substance as a whole. The archive does not record which
        form or route it describes.
      </p>
      {present.map(([field, heading]) => {
        const section = entry.sections[field]
        if (!section) return null
        return (
          <div key={field}>
            <h3>{heading}</h3>
            <p>{section.text}</p>
            <p className="dv4-simple-note">
              {section.truncated ? 'Cut short here. ' : null}
              <a href={section.sourceUrl}>Read the label at the source</a> &middot; label dated{' '}
              {section.sourceDate} &middot; {section.licence}
            </p>
          </div>
        )
      })}
    </section>
  )
}
