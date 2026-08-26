import type { NextRequest } from 'next/server'

import { resolveLegacyRecordRequest } from '@/lib/seo/legacy-response'

type LegacyRecordRouteContext = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, context: LegacyRecordRouteContext) {
  return resolveLegacyRecordRequest(request, (await context.params).slug)
}

export async function HEAD(request: NextRequest, context: LegacyRecordRouteContext) {
  return resolveLegacyRecordRequest(request, (await context.params).slug)
}
