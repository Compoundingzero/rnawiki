import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { legacyRedirects } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { entityPath, resolveLegacyRedirect, type LegacyRedirectRule } from '@/lib/canonical'
import { renderGoneDocument } from '@/lib/gone-notice'

// Legacy route handling for the old (pre-Proof-Boundary) RNAwiki product. See
// docs/legacy-removal-map.md for the full audit this file implements: what routes the old
// product served (found by crawling git tag legacy-rnawiki-before-proof-boundary), which of
// them have a real successor here, and why the rest are 410 rather than redirected to "/".
//
// Needs the pg pool via Drizzle (legacy_redirects table lookup, entity-slug lookup), so this
// runs on the Node.js runtime rather than the default Edge runtime — same reason
// app/updates/feed.xml/route.ts opts in. Requires Next.js 15.5+ (installed: 15.5.23).
export const runtime = 'nodejs'

// The 410 body is a styled explanation rather than the word "Gone", because a reader following a
// stale link is a person, not only a crawler: they need to know the page is closed on purpose,
// that nothing replaces it, and where the reference actually lives now.
//
// It is served as a full document from middleware rather than as a rewrite to /gone. A rewrite
// hands the request to the normal render, and Next.js takes the rendered route's status (200) —
// `resolveRoutes` returns a statusCode only on the redirect and direct-response branches, not the
// x-middleware-rewrite branch. Returning the body here keeps `middlewareRes.status`, so these
// paths stay a real 410. Downgrading them to 200 would tell search engines the page still exists.
//
// Which paths are 410 and which are 301 is decided below and is unchanged; this only replaces
// what a 410 says. The document itself lives in lib/gone-notice.ts, shared with app/gone/page.tsx.
function gone(requestedPath: string): NextResponse {
  return new NextResponse(renderGoneDocument(requestedPath), {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Belt-and-braces: a 410 already tells crawlers to drop the URL, this just makes the
      // instruction explicit in case any downstream cache only reads headers, not status.
      'X-Robots-Tag': 'noindex',
    },
  })
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), 301)
}

// Old compound pages lived at /c/<slug>. A separate, privacy-preserving analytics beacon in the
// old site also emitted values shaped like /t/compound (see docs/legacy-removal-map.md — it was
// never a real page route a browser could request), but the task that produced this file names
// it as a prefix to treat like /c/, so it is handled identically and harmlessly here too.
// Checked dynamically against the entities table (not a static list) so a slug launched after
// this file was written still 301s automatically, with no new seed row required.
const COMPOUND_SLUG_PATTERNS = [/^\/c\/([^/]+)\/?$/, /^\/t\/compound\/([^/]+)\/?$/]

// Old top-level surfaces with no successor in the rebuilt product at all — dosage/protocol
// builders, the symptom finder, exercise/target/pathway/goal reference pages, old signup forms.
// Bare index paths (no further segment) go here; anything with a further segment matches
// GONE_PREFIXES below. See docs/legacy-removal-map.md for what each prefix used to serve.
const GONE_EXACT = new Set<string>([
  '/c',
  '/t/compound',
  '/exercise',
  '/goal',
  '/protocol',
  '/target',
  '/pathway',
  '/pathways',
  '/learn',
  '/solve',
  '/solve.html',
  '/plan',
  '/p',
  '/p.html',
  '/interest',
  '/newsletter',
])

// '/c/' and '/t/compound/' are included here too, as a fallback for any path under them that
// doesn't match COMPOUND_SLUG_PATTERNS above (e.g. more than one segment) — step 2 already
// handles the real single-segment case and returns before step 3 is ever reached for it.
const GONE_PREFIXES = [
  '/exercise/',
  '/goal/',
  '/protocol/',
  '/target/',
  '/pathway/',
  '/pathways/',
  '/learn/',
  '/plan/',
  '/p/',
  '/c/',
  '/t/compound/',
]

export async function middleware(request: NextRequest) {
  // Normalize a trailing slash (but never collapse "/" itself) so "/goal/" and "/goal" — and
  // "/protocol/foo/" and "/protocol/foo" — hit the same rule below.
  const raw = request.nextUrl.pathname
  const pathname = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw

  // 1. Exact historical overrides recorded in the DB (scripts/seed-legacy-redirects.ts) take
  // priority — this is where an old slug that does NOT match its new slug gets its 301.
  const [row] = await db
    .select({ fromPath: legacyRedirects.fromPath, toPath: legacyRedirects.toPath, statusCode: legacyRedirects.statusCode })
    .from(legacyRedirects)
    .where(eq(legacyRedirects.fromPath, pathname))
    .limit(1)
  if (row) {
    const rules: LegacyRedirectRule[] = [
      { fromPath: row.fromPath, toPath: row.toPath, statusCode: row.statusCode as 301 | 410 },
    ]
    const resolved = resolveLegacyRedirect(pathname, rules)
    if (resolved) {
      return resolved.statusCode === 301 && resolved.location
        ? redirectTo(request, resolved.location)
        : gone(pathname)
    }
  }

  // 2. Compound pages without an explicit DB row: 301 if a published entity now lives at the
  // same slug under /r/, otherwise 410.
  for (const pattern of COMPOUND_SLUG_PATTERNS) {
    const match = pathname.match(pattern)
    if (match) {
      const slug = match[1]
      const entity = slug ? await getPublishedEntityBySlug(slug) : null
      return entity ? redirectTo(request, entityPath(entity.slug)) : gone(pathname)
    }
  }

  // 3. Every other removed legacy surface: 410, no successor, not redirected to the homepage.
  if (GONE_EXACT.has(pathname) || GONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return gone(pathname)
  }

  return NextResponse.next()
}

// Scope middleware invocation to legacy paths only — it never runs for /r, /search, /admin,
// /api, /embed, static assets, or anything else in the current product.
export const config = {
  matcher: [
    '/c/:path*',
    '/t/compound/:path*',
    '/exercise',
    '/exercise/:path*',
    '/goal/:path*',
    '/protocol/:path*',
    '/target/:path*',
    '/pathway/:path*',
    '/pathways',
    '/pathways/:path*',
    '/learn',
    '/learn/:path*',
    '/solve',
    '/solve.html',
    '/plan',
    '/plan/:path*',
    '/p',
    '/p.html',
    '/p/:path*',
    '/interest',
    '/newsletter',
  ],
}
