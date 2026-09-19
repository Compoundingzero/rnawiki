import { lifeTestDocumentResponse } from '@/lib/editorial/life-test-document'
import { editorialPreviewEnabled } from '@/lib/editorial/preview-gate'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  if (!editorialPreviewEnabled()) {
    return new Response('Not found', { status: 404 })
  }
  return lifeTestDocumentResponse()
}
