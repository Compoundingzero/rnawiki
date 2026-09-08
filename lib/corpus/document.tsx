/**
 * A corpus record as a whole HTML document (step 6.1).
 *
 * The record is rendered on the server once. Nothing about it is serialised a second time: there is
 * no React Server Components stream behind this route, and the one script the document loads is
 * handed the search field's state and nothing else. The measured effect is in
 * `data/revamp/payload-audit-after.json`.
 *
 * Everything the App Router page decided is decided here, from the same functions: the title and
 * description, the canonical path, the indexing decision the record's own `indexable` flag carries,
 * and the single JSON-LD block `corpusDossierJsonLdGraph` returns — or does not, for a record the
 * corpus does not index.
 */
import { DocumentShell } from '@/components/document/DocumentShell'
import { CorpusDossierPage } from '@/components/dossier/corpus/CorpusDossierPage'
import { corpusMetaDescription, type CorpusDossier } from '@/lib/corpus/dossier-page'
import { documentResponse } from '@/lib/document/render'
import { corpusDossierJsonLdGraph } from '@/lib/json-ld'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { configuredPublicUrl, configuredSiteOrigin } from '@/lib/seo/deployment'

export function corpusDocumentResponse(dossier: CorpusDossier): Promise<Response> {
  const path: `/${string}` = `/d/${dossier.slug}`
  const description = corpusMetaDescription(dossier)
  const jsonLd = corpusDossierJsonLdGraph(dossier, {
    siteUrl: configuredSiteOrigin(),
    url: configuredPublicUrl(path),
  })
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
      // A Tier 3 or below-threshold record is reachable and crawlable but not indexed (R6).
      robots={{ index: dossier.indexable, follow: true }}
      title={`${dossier.displayName} | RNAWiki`}
    >
      <CorpusDossierPage dossier={dossier} />
    </DocumentShell>,
  )
}
