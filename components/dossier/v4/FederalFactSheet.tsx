import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'

/*
 * The federal summary for a herb, linked rather than copied.
 *
 * NCCIH states its text is in the public domain and may be reused with credit. RNAWiki still does
 * not ingest those fact sheets, and that is deliberate: the repository's own competitive audit
 * (`docs/research/competitive-dataset-reader-audit-2026.md`) ruled **"Link; defer import. Structured
 * fact-sheet ingestion remains deferred"** until content-level rights, versioning and claim-scope
 * rules have a dedicated review. The same note says RNAWiki "does not replace federal evidence
 * summaries". So this links out and stores nothing of theirs but the title and the address.
 *
 * `scripts/revamp/map_nccih_factsheets.py` builds the map from NCCIH's own inventory. The credit
 * line is what their reuse policy asks for ("Please credit the National Center for Complementary and
 * Integrative Health as the source, and include the publication title"), and no NCCIH image is ever
 * referenced, because their images are copyrighted.
 *
 * This matters most on the pages that otherwise hold nothing: 2,261 botanicals and 502 supplements
 * in the corpus have no label, no trial and no recorded mechanism, and for those a reader leaves
 * with a link to the authority instead of an empty page.
 */

interface FactSheet {
  title: string
  name: string
  url: string
  source: string
}

interface NccihArtifact {
  note: string
  inventorySource: string
  factSheets: Record<string, FactSheet>
  nccihHerbsWithNoCorpusPage: Array<{ name: string; url: string }>
}

/** Read once per process: the map is small and identical for every request. */
let cache: NccihArtifact | null | undefined

function artifact(): NccihArtifact | null {
  if (cache !== undefined) return cache
  try {
    cache = JSON.parse(
      readFileSync(join(process.cwd(), 'data/sources/nccih/fact-sheets.json'), 'utf8'),
    ) as NccihArtifact
  } catch {
    cache = null
  }
  return cache
}

export function FederalFactSheet({ slug }: { slug: string }): ReactNode {
  const data = artifact()
  const sheet = data?.factSheets[slug]
  if (!data || !sheet) return null

  return (
    <section
      aria-labelledby="federal-summary-heading"
      className="dv4-simple-section"
      id="federal-summary"
    >
      <h2 id="federal-summary-heading">The federal summary for this herb</h2>
      <p className="dv4-simple-note">
        RNAWiki links to this rather than copying it. The National Center for Complementary and
        Integrative Health writes it. RNAWiki does not replace a federal summary.
      </p>
      <p>
        <a href={sheet.url}>{sheet.title}</a> &middot; {sheet.source}
      </p>
    </section>
  )
}
