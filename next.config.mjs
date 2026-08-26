/** @type {import('next').NextConfig} */

import { isCanonicalProductionOrigin } from './lib/seo/canonical-production-origin.mjs'

// Security headers.
//
// WHY `script-src` CARRIES `'unsafe-inline'`, WHICH IS NOT AN OVERSIGHT.
//
// A script-src that actually constrains the Next.js App Router needs a per-request nonce, and a
// nonce needs the HTML carrying it to be generated per request. The dossier pages are cached and
// replayed, so a fresh nonce in the response header would stop matching the nonce baked into the
// cached markup and would block the page's own scripts.
//
// It is stated EXPLICITLY rather than omitted. Leaving script-src out does not leave scripts
// unrestricted — `default-src 'self'` covers them, and it blocks the App Router's own inline
// bootstrap, which breaks hydration on every page: the search box, the mechanism carousel, the
// editor modal and every form stop working.
//
// The injection risk it does not cover is closed at its source instead: no page on this site
// injects raw HTML. There is no dangerouslySetInnerHTML outside the JSON-LD block, which escapes
// `<`, `>` and `&` before it is written (lib/json-ld.ts).
const BASE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "frame-src 'self'",
  "img-src 'self' data: blob:",
  // Next.js App Router inlines critical CSS; there is no nonce available for the same reason as
  // scripts, and style injection is not a script-execution path.
  "style-src 'self' 'unsafe-inline'",
  // next/font self-hosts every face at build time, so no external font origin is needed.
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: BASE_CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No page on this site uses a camera, microphone, geolocation or payment API, so every one of
  // them is denied outright rather than left to the browser default.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

export function responseHeadersForEnvironment(environment = process.env) {
  return isCanonicalProductionOrigin(environment)
    ? SECURITY_HEADERS
    : [...SECURITY_HEADERS, { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }]
}

const RESPONSE_HEADERS = responseHeadersForEnvironment()

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The bulk ingest writes long free-text label fields; nothing here serves user-uploaded images.
  images: { remotePatterns: [] },
  experimental: {
    // The dossier page assembles a large jsonb payload server-side. Raising the cache item limit
    // keeps a full flagship dossier inside the data cache instead of silently bypassing it.
    largePageDataBytes: 512 * 1024,
  },
  async headers() {
    return [{ source: '/(.*)', headers: RESPONSE_HEADERS }]
  },
  async redirects() {
    return [
      { source: '/compounds', destination: '/browse', permanent: true },
      { source: '/evidence', destination: '/how-it-works', permanent: true },
      // /methodology and /how-editing-works split one explanation in two and answered it twice at
      // different reading levels. Merged into /how-it-works; both paths are indexed and linked
      // from dossier pages, so they redirect rather than 404.
      { source: '/methodology', destination: '/how-it-works', permanent: true },
      { source: '/how-editing-works', destination: '/how-it-works', permanent: true },
    ]
  },
}

export default nextConfig
