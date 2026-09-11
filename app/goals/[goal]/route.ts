/**
 * `/goals/<goal>` — the pages whose registered studies name conditions in one human goal area
 * (lib/dossier-v3/goal-document.tsx). A registration is a registry fact, not evidence of benefit.
 */
import { goalDocumentResponse } from '@/lib/dossier-v3/goal-document'
import { goalIndex, isUserGoal } from '@/lib/dossier-v3/goal-pages'

// Railway's build environment cannot resolve the private database host during page collection.
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ goal: string }> },
): Promise<Response> {
  const { goal } = await params
  if (!isUserGoal(goal)) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  }
  const index = await goalIndex()
  return goalDocumentResponse(goal, index.byGoal.get(goal) ?? [], index.pagesScanned)
}
