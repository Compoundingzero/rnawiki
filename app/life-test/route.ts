import { lifeTestDocumentResponse } from '@/lib/editorial/life-test-document'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  return lifeTestDocumentResponse()
}
