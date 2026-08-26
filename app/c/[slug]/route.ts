import type { NextRequest } from 'next/server'

import { resolveLegacyCompoundRequest } from '@/lib/seo/legacy-response'

type LegacyCompoundRouteContext = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, context: LegacyCompoundRouteContext) {
  return resolveLegacyCompoundRequest(request, (await context.params).slug)
}

export async function HEAD(request: NextRequest, context: LegacyCompoundRouteContext) {
  return resolveLegacyCompoundRequest(request, (await context.params).slug)
}
