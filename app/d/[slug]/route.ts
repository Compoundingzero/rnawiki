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

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  const dossier = await loadCorpusDossier(slug)
  if (dossier) return corpusDocumentResponse(dossier)
  return forwardToLegacyRecord(request, slug)
}
