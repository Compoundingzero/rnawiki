/**
 * The dossier v4 document: the same plain-HTML shell every other record page uses, with the
 * Substance Compass inside it.
 *
 * Title, description, canonical, indexing and structured data are decided exactly as the corpus
 * document decides them, from the same record, so switching the flag changes the reader surface
 * and nothing a search engine sees. The index gate stays stricter than the flag: a page that fails
 * it is served and not indexed.
 */
import { CompassPage } from '@/components/dossier/v4/CompassPage'
import { DocumentShell } from '@/components/document/DocumentShell'
import { corpusMetaDescription, type CorpusDossier } from '@/lib/corpus/dossier-page'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { corpusDossierJsonLdGraph } from '@/lib/json-ld'
import { configuredPublicUrl, configuredSiteOrigin } from '@/lib/seo/deployment'

import { decideMedicinePageIndexing } from './indexability'
import type { DossierV4ViewModel } from './view-model'

export function dossierV4DocumentResponse(
  corpus: CorpusDossier,
  model: DossierV4ViewModel,
): Promise<Response> {
  const path: `/${string}` = `/d/${corpus.slug}`
  const description = corpusMetaDescription(corpus)
  const jsonLd = corpusDossierJsonLdGraph(corpus, {
    siteUrl: configuredSiteOrigin(),
    url: configuredPublicUrl(path),
  })
  /*
   * One indexing rule for every medicine page, in lib/dossier-v4/indexability.ts. A page that fails
   * its checks, cannot resolve its identity, or holds none of the four things a reader came for is
   * not offered to a search engine — and the same assessment writes the notice such a page shows,
   * so the sentence a reader sees and the instruction a crawler reads cannot disagree.
   */
  const indexing = decideMedicinePageIndexing(model)
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={googleAnalyticsMeasurementId(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      )}
      canonicalPath={path}
      {...(description ? { description } : {})}
      jsonLd={jsonLd}
      ogImagePath={`${path}/opengraph-image`}
      ogType="article"
      robots={{ index: indexing.index, follow: true }}
      title={`${corpus.displayName} | RNAWiki`}
    >
      <CompassPage corpus={corpus} model={model} />
    </DocumentShell>,
    { headers: { 'x-rnawiki-dossier': 'v4' } },
  )
}
