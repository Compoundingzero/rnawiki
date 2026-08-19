/** @type {import('next').NextConfig} */

// Security headers.
//
// TWO PATH GROUPS, and the split is the point. `/embed/:path*` exists to be framed by sites
// RNAwiki does not control — app/embed/claim/[claimId]/page.tsx says so, components/EmbedCodeBox.tsx
// hands readers an absolute-URL <iframe> snippet to paste, and docs/open-evidence-record.md
// documents it as a public embeddable view. A blanket `X-Frame-Options: SAMEORIGIN` on `/(.*)`
// therefore made every copy of that snippet render a blank box off-origin: SAMEORIGIN is by
// definition a refusal to render in a frame on any other origin. It went unnoticed because the
// only iframe anyone tested was EmbedCodeBox's own same-origin "Show preview".
//
// The first rule's `source` excludes /embed/ with a negative lookahead rather than relying on the
// second rule to override, because `X-Frame-Options` cannot be *removed* by a later rule — only
// overwritten, and an overwrite to a weaker value is a silent trap. `frame-ancestors` alone would
// not do either: browsers that still honour X-Frame-Options and do not implement frame-ancestors
// would keep blocking the embed.
//
// WHY `script-src` CARRIES `'unsafe-inline'`, WHICH IS NOT AN OVERSIGHT.
//
// A script-src that actually constrains the Next.js App Router needs a per-request nonce, and a
// nonce needs the HTML carrying it to be generated per request. `/r/[slug]` and
// `/embed/claim/[claimId]` are ISR routes (`export const revalidate = 3600`): their HTML is cached
// and replayed, so a fresh nonce in the response header would stop matching the nonce baked into
// the cached markup and would block the page's own scripts. Restricting script-src here therefore
// means giving up ISR on the two busiest routes, which is a bigger change than this defect
// warrants.
//
// It must be stated EXPLICITLY rather than omitted. Leaving script-src out does not leave scripts
// unrestricted — `default-src 'self'` covers them, and it blocks the App Router's own inline
// bootstrap, which breaks hydration on every page: the comprehension test, the copy-citation
// button and every admin form stop working, and an error boundary renders as a blank document.
// Verified in a real browser before this line was written.
//
// So the honest position is: the directives below are the ones that hold without a nonce and
// without weakening themselves, script-src is deliberately no stronger than the browser default,
// and the injection risk it does not cover is closed at its source instead — the one JSON-LD block
// on the record page escapes `<`, `>` and `&` before it reaches dangerouslySetInnerHTML (see
// app/(public)/r/[slug]/page.tsx and lib/json-ld.ts). Revisit script-src if those routes ever stop
// being ISR, and do not silently drop this line to "tighten" the policy.
const BASE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-src 'self'",
  "img-src 'self' data:",
  // Next.js App Router inlines critical CSS; there is no nonce available for the same reason as
  // scripts, and style injection is not a script-execution path.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self'",
]

const SHARED_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No page on this site uses a camera, microphone, geolocation or payment API, so every one of
  // them is denied outright rather than left to the browser default.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  // Two years, subdomains included, preload-eligible. http://rnawiki.com already 301s to HTTPS at
  // the edge; this removes the first plaintext request from the path entirely.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Everything except /embed/*.
        source: '/((?!embed/).*)',
        headers: [
          ...SHARED_HEADERS,
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: [...BASE_CSP, "frame-ancestors 'self'"].join('; ') },
        ],
      },
      {
        // The embeddable claim view, and only it. No X-Frame-Options at all, and frame-ancestors
        // is open because the whole feature is third-party syndication of a published claim. The
        // route is publication-gated, reflects no user input and ships no client JavaScript, so it
        // carries no clickjacking surface of its own.
        source: '/embed/:path*',
        headers: [
          ...SHARED_HEADERS,
          { key: 'X-Robots-Tag', value: 'noindex' },
          { key: 'Content-Security-Policy', value: [...BASE_CSP, 'frame-ancestors *'].join('; ') },
        ],
      },
    ]
  },
}

export default nextConfig
