/**
 * The computed sections (docs/specs/phase4-generators.md §8).
 *
 * Three sentences, each computed from what the corpus already holds and each rendered only where
 * its inputs exist: the nearest approved compound by structure with the similarity value and, where
 * RDKit could name it, the differing substituent; this compound's potency rank among the compounds
 * holding a pChEMBL value against the same target in the same assay type; and the span of the
 * activity record, whether an approved drug has since reached the target, and the originating
 * organisation where one is held.
 *
 * These sections carry Tier 3 pages, which are three quarters stubs and stay `noindex`. Nothing
 * here is written per page: `scripts/revamp/tier3_sections.py` computed each sentence and recorded
 * the value behind every part of it, and this component prints what it recorded.
 */
import Link from 'next/link'

import type { CorpusSectionSentence } from '@/lib/corpus/dossier-page'

export function Tier3Sections({ sections }: { sections: CorpusSectionSentence[] }) {
  if (sections.length === 0) return null
  return (
    <section aria-labelledby="cd-computed-heading" className="cd-computed">
      <h2 className="cd-section-heading" id="cd-computed-heading">
        What the structure and the activity record show
      </h2>
      {sections.map((row) => (
        <p className="cd-paragraph" key={`${row.section}-${row.ordinal}`}>
          {row.sentence}
          {row.counterpartSlug && row.counterpartName ? (
            <>
              {' '}
              <Link href={`/d/${row.counterpartSlug}`}>{row.counterpartName}</Link>
            </>
          ) : null}
        </p>
      ))}
    </section>
  )
}
