/**
 * `/h/<type>/<slug>` — one group page (docs/specs/hubs.md §2).
 *
 * In order: the title and the one-line definition with its source and date; the comparison table
 * over every member; the synthesis, four to eight sentences generated from that table and the
 * members' derived sections; the member list grouped by role, each with its own first question; and
 * the sources consulted.
 *
 * §13(13): a slug the member-set dedupe absorbed answers with the survivor's route, permanently.
 * The survivor's definition line names what it is also known by, so the page a reader lands on says
 * why it answered.
 *
 * It is written as a plain HTML document for the reason step 6.1 records in
 * `lib/dossier-v4/document.tsx`: an App Router page ships its text twice.
 */
import { hubDocumentResponse } from '@/lib/hubs/document'
import { hubAliasTarget, loadHubPage } from '@/lib/hubs/queries'
import { isHubType } from '@/lib/hubs/types'

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; slug: string }> },
): Promise<Response> {
  const { type, slug } = await params
  if (!isHubType(type)) return new Response('Group not found', { status: 404 })

  const page = await loadHubPage(type, slug)
  if (page) return hubDocumentResponse(page)

  const target = await hubAliasTarget(type, slug)
  if (target) {
    return Response.redirect(new URL(`/h/${target.type}/${target.slug}`, request.url), 308)
  }
  return new Response('Group not found', { status: 404 })
}
