/**
 * The dossier v3 document: the same plain-HTML shell as the corpus document, the v3 reader surface
 * inside it (docs/dossier-information-architecture.md, "Flag and rollback").
 *
 * The route hands over here only when `DOSSIER_V3_SLUGS` names the slug (or `*`). Everything the
 * corpus document decides — title, description, canonical, indexing, JSON-LD — is decided the same
 * way from the same record, so switching the flag changes the reader surface and nothing else.
 */
import { DocumentShell } from '@/components/document/DocumentShell'
import { DossierV3Page } from '@/components/dossier/v3/DossierV3Page'
import { corpusMetaDescription, type CorpusDossier } from '@/lib/corpus/dossier-page'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { corpusDossierJsonLdGraph } from '@/lib/json-ld'
import { configuredPublicUrl, configuredSiteOrigin } from '@/lib/seo/deployment'

import type { DossierV3ViewModel } from './view-model'

export function dossierV3DocumentResponse(
  corpus: CorpusDossier,
  model: DossierV3ViewModel,
): Promise<Response> {
  const path: `/${string}` = `/d/${corpus.slug}`
  const description = corpusMetaDescription(corpus)
  const jsonLd = corpusDossierJsonLdGraph(corpus, {
    siteUrl: configuredSiteOrigin(),
    url: configuredPublicUrl(path),
  })
  // The index-quality gate is stricter than the corpus flag: a page that fails it is served but
  // not indexed, whatever `indexable` says.
  const gatePassed = model.indexQuality.every((check) => check.passed)
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
      robots={{ index: corpus.indexable && gatePassed, follow: true }}
      title={`${corpus.displayName} | RNAWiki`}
    >
      <DossierV3Page corpus={corpus} model={model} />
    </DocumentShell>,
    { headers: { 'x-rnawiki-dossier': 'v3' } },
  )
}
