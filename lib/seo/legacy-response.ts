import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resolvePublicMedicineRoute } from '@/lib/queries/drugs'
import { configuredPublicUrl } from '@/lib/seo/deployment'
import { LEGACY_COMPOUND_SLUG_OVERRIDES } from '@/lib/seo/legacy-routes'

type LegacyMedicineFamily = 'c' | 't_compound' | 'r'

function logUnresolvedLegacyMedicine(pathname: string, family: LegacyMedicineFamily): void {
  // Intentionally omit the query string, cookies, headers, referrer, IP and user agent. The path
  // family + pathname are sufficient for an owner to reconcile a real backlink with the archived
  // crawl or the explicit canonical-slug ledger.
  console.info(
    '[seo.legacy_unresolved]',
    JSON.stringify({
      event: family === 'r' ? 'legacy_record_unresolved' : 'legacy_compound_unresolved',
      family,
      pathname,
    }),
  )
}

async function resolveLegacyMedicineRequest(
  request: NextRequest,
  candidate: string,
  family: LegacyMedicineFamily,
): Promise<NextResponse> {
  const resolution = candidate ? await resolvePublicMedicineRoute(candidate) : null

  if (!resolution) {
    logUnresolvedLegacyMedicine(request.nextUrl.pathname, family)
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  }

  // Railway terminates TLS before the Next server. `request.url` can therefore carry the private
  // proxy origin (for example https://localhost:8080), which must never leak into a public 301.
  // Build the successor from the configured canonical origin, just like metadata and JSON-LD.
  const destination = configuredPublicUrl(`/d/${encodeURIComponent(resolution.canonicalSlug)}`)
  return NextResponse.redirect(destination, 301)
}

export async function resolveLegacyCompoundRequest(
  request: NextRequest,
  requestedSlug: string,
): Promise<NextResponse> {
  const normalized = requestedSlug.trim().toLowerCase()
  const candidate = LEGACY_COMPOUND_SLUG_OVERRIDES[normalized] ?? normalized
  const family = request.nextUrl.pathname.startsWith('/t/compound/') ? 't_compound' : 'c'
  return resolveLegacyMedicineRequest(request, candidate, family)
}

/** Resolve the former `/r/{slug}` identity directly to its terminal canonical dossier. */
export async function resolveLegacyRecordRequest(
  request: NextRequest,
  requestedSlug: string,
): Promise<NextResponse> {
  return resolveLegacyMedicineRequest(request, requestedSlug.trim().toLowerCase(), 'r')
}
