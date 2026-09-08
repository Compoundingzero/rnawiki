/**
 * The computed sections (docs/specs/phase4-generators.md §8, §13 items 7 and 8).
 *
 * Three comparisons, each computed from what the corpus already holds and each rendered only where
 * its inputs exist: the nearest approved compound by structure with the similarity value and its
 * approval status; this compound's potency rank among the compounds holding a pChEMBL value against
 * the same target in the same assay type; and the span of the activity record, whether an approved
 * drug has since reached the target, and the originating organisation where one is held.
 *
 * §13(8): the nearest-neighbour comparison is four stored values, so it is four cells of a row, not
 * a sentence with a name swapped into it. A prose sentence stays only where the maximum-common-
 * substructure comparison named the substituent that differs, because that is a finding. The
 * publication span and the originating organisation are one value each and are rows for the same
 * reason; the potency rank and the target-validation lines carry a claim and stay prose.
 *
 * Nothing here is written per page: `scripts/revamp/tier3_sections.py` computed each value and
 * `sectionSentenceParts` in the corpus renderer decides the shape, so the measured text and this
 * component carry the same rows and the same prose.
 */
import type { CorpusSectionSentence } from '@/lib/corpus/dossier-page'

function SectionRows({ row }: { row: CorpusSectionSentence }) {
  if (row.rows.length === 0) return null
  return (
    <dl className="cd-facts">
      {row.rows.map((item, index) => (
        <div className="cd-fact" key={`${row.section}-${row.ordinal}-${index}`}>
          <dt>{item.label}</dt>
          <dd>
            {row.counterpartSlug &&
            row.counterpartName &&
            item.value.startsWith(row.counterpartName)
              ? [
                  <a href={`/d/${row.counterpartSlug}`} key="link">
                    {row.counterpartName}
                  </a>,
                  item.value.slice(row.counterpartName.length),
                ]
              : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Tier3Sections({ sections }: { sections: CorpusSectionSentence[] }) {
  if (sections.length === 0) return null
  return (
    <section aria-labelledby="cd-computed-heading" className="cd-computed">
      <h2 className="cd-section-heading" id="cd-computed-heading">
        What the structure and the activity record show
      </h2>
      {sections.map((row) => (
        <div key={`${row.section}-${row.ordinal}`}>
          <SectionRows row={row} />
          {row.sentence ? <p className="cd-paragraph">{row.sentence}</p> : null}
        </div>
      ))}
    </section>
  )
}
