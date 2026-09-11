/**
 * `/d/<slug>` — one medicine record.
 *
 * This was an App Router page. Step 6.1 measured what that cost: the React Server Components stream
 * Next.js inlines into every page repeated 100 % of the rendered record's text, and was a median
 * 54.5 % of the served document's bytes. `createInlinedDataReadableStream` is called
 * unconditionally in Next's app renderer, so no page can opt out of the second copy. The route
 * therefore writes its own document (`lib/corpus/document.tsx`), with one small script for the
 * header's search field and nothing of the record sent twice.
 *
 * A medicine the corpus does not hold is still the React dossier, at the same URL, forwarded to
 * `/legacy-record/<slug>` (`lib/document/legacy-forward.ts`) and answered with exactly what that
 * page returned — its canonical, its indexing decision, its 308 to a canonical slug and its 404.
 */
import { corpusDocumentResponse } from '@/lib/corpus/document'
import { loadCorpusDossier } from '@/lib/corpus/dossier-page'
import { forwardToLegacyRecord } from '@/lib/document/legacy-forward'
import { dossierV3DocumentResponse } from '@/lib/dossier-v3/document'
import { dossierV3Enabled, loadDossierV3Inputs } from '@/lib/dossier-v3/load'
import { buildDossierV3 } from '@/lib/dossier-v3/view-model'
import { dossierV4DocumentResponse } from '@/lib/dossier-v4/document'
import { dossierV4Enabled, loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  // Dossier v4, the Substance Compass (docs/dossier-v4-information-architecture.md): behind the
  // DOSSIER_V4_SLUGS allowlist, checked first. Unset it and the next request falls back to v3;
  // unset both and every page is the corpus document again. Neither needs a database change.
  if (dossierV4Enabled(slug)) {
    const inputs = await loadDossierV4Inputs(slug)
    if (inputs) return dossierV4DocumentResponse(inputs.corpus, buildDossierV4(inputs))
    return forwardToLegacyRecord(request, slug)
  }
  // Dossier v3 (docs/dossier-information-architecture.md): behind the DOSSIER_V3_SLUGS allowlist.
  // Unsetting the variable restores the corpus document for every page on the next request.
  if (dossierV3Enabled(slug)) {
    const inputs = await loadDossierV3Inputs(slug)
    if (inputs) return dossierV3DocumentResponse(inputs.corpus, buildDossierV3(inputs))
    return forwardToLegacyRecord(request, slug)
  }
  const dossier = await loadCorpusDossier(slug)
  if (dossier) return corpusDocumentResponse(dossier)
  return forwardToLegacyRecord(request, slug)
}
