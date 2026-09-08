/**
 * `/h` — the group index (docs/specs/hubs.md §3).
 *
 * The three group kinds, and within each kind every group in alphabetical order with its member
 * count. This page is the only navigation a group needs: the link-graph check requires that no
 * group is unreachable from here. The home page keeps its frozen search bar and gains nothing.
 *
 * It is written as a plain HTML document for the reason step 6.1 records in
 * `lib/corpus/document.tsx`: an App Router page ships its text twice.
 */
import { hubIndexDocumentResponse } from '@/lib/hubs/document'
import { listHubs } from '@/lib/hubs/queries'

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  return hubIndexDocumentResponse(await listHubs())
}
