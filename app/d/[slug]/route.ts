/**
 * `/d/<slug>` — one medicine record, served as the Substance Compass.
 *
 * There is one layout and no flag deciding which one a page gets. A medicine that cannot render on
 * the compass does not fall back to something older; there is nothing older. The corpus document,
 * the dossier v3 surface and the React legacy record are gone, and `scripts/check/single-dossier-
 * layout.ts` fails the build if a second one reappears.
 *
 * This is a Route Handler rather than an App Router page for a measured reason kept from the
 * corpus document: the React Server Components stream Next.js inlines into every page repeated
 * 100 % of the rendered record's text, a median 54.5 % of the served bytes, and
 * `createInlinedDataReadableStream` is called unconditionally so no page can opt out. The route
 * writes its own document (`lib/dossier-v4/document.tsx`) with one small script for the header's
 * search field and nothing of the record sent twice.
 *
 * Four things this route does that are not presentation, and that used to belong to the deleted
 * legacy page. They are done here explicitly so that deleting a layout could not quietly delete
 * them with it:
 *
 *   1. **Alias and old-slug resolution.** `resolvePublicMedicineRoute` maps a requested slug
 *      through the alias table and the canonical-slug ledger, one hop only, failing closed on a
 *      chain or an ambiguous owner.
 *   2. **The canonical redirect.** A request that resolved to a different slug is answered 308,
 *      preserving any `?programme=` the caller sent so a shared link survives the hop.
 *   3. **The 404.** A slug that resolves to nothing, or resolves to a record the public reader
 *      cannot see, is not answered with an empty page.
 *   4. **The view counter**, deliberately not awaited: a counter is the least important thing on
 *      the page and must never make a readable record slow.
 *
 * The indexing decision now lives in `lib/dossier-v4/document.tsx`, which reads it from the same
 * record the page is built from.
 */
import { permanentRedirect } from 'next/navigation'

import { dossierV4DocumentResponse } from '@/lib/dossier-v4/document'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import { incrementViewCount, resolvePublicMedicineRoute } from '@/lib/queries/drugs'

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

function notFound(): Response {
  return new Response('Not found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params

  const route = await resolvePublicMedicineRoute(slug)
  if (!route) return notFound()
  if (route.canonicalSlug !== slug) {
    // A programme reference is shareable UI state, so it survives the canonical hop.
    const programme = new URL(request.url).searchParams.get('programme')
    const query = programme ? `?programme=${encodeURIComponent(programme)}` : ''
    permanentRedirect(`/d/${encodeURIComponent(route.canonicalSlug)}${query}`)
  }

  const inputs = await loadDossierV4Inputs(route.canonicalSlug)
  if (!inputs) return notFound()

  if (inputs.legacyRecord) void incrementViewCount(inputs.legacyRecord.id)

  return dossierV4DocumentResponse(inputs.corpus, buildDossierV4(inputs))
}
