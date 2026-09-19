import { guideDocumentResponse } from '@/lib/guides/document'
import { guideForSlug } from '@/lib/guides/substance-guides'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guide: string }> },
): Promise<Response> {
  if (process.env.RNAWIKI_PREVIEW_EDITORIAL !== '1') {
    return new Response('Not found', { status: 404 })
  }
  const { guide: slug } = await params
  const guide = guideForSlug(slug)
  if (!guide) return new Response('Not found', { status: 404 })
  return guideDocumentResponse(guide)
}
