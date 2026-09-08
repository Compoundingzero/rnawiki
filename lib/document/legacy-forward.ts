/**
 * How `/d/<slug>` reaches the legacy medicine record.
 *
 * A corpus record is served as a plain HTML document by `app/d/[slug]/route.ts` (step 6.1). A
 * medicine that the corpus does not yet hold — 29 slugs on the current load, plus every fixture the
 * end-to-end suite installs — is still the React dossier, with its comment thread, its correction
 * controls and its programme selector, and a route handler cannot render an App Router page. So the
 * page keeps existing, at `/legacy-record/<slug>`, and the route handler forwards to it over the
 * loopback interface and returns what it answered. The reader's URL never changes, and neither does
 * the page's canonical, its indexing decision or its redirects.
 *
 * `/legacy-record/*` is never linked, never in a sitemap and never reachable from outside: the page
 * answers 404 unless the request carries the token this module minted, which lives on `globalThis`
 * so the route handler's bundle and the page's bundle share one value inside one process.
 */
import { randomUUID } from 'node:crypto'

export const LEGACY_FORWARD_HEADER = 'x-rnawiki-legacy-forward'

const TOKEN_KEY = Symbol.for('rnawiki.document.legacyForwardToken')

interface TokenHolder {
  [TOKEN_KEY]?: string
}

export function legacyForwardToken(): string {
  const holder = globalThis as TokenHolder
  holder[TOKEN_KEY] ??= randomUUID()
  return holder[TOKEN_KEY]
}

/**
 * The loopback origin of this very server.
 *
 * The `host` header names the server directly whenever the request came in on loopback, which is
 * every local run and every end-to-end run. Behind a proxy it names the public site instead, and
 * fetching that would leave the machine, so the port comes from the environment the process was
 * started with, which is what Railway sets and what `npm run start` passes to `next start`.
 */
export function loopbackOrigin(hostHeader: string | null): string {
  const host = hostHeader ?? ''
  const [name, port] = host.split(':')
  if ((name === '127.0.0.1' || name === 'localhost' || name === '[::1]') && port) {
    return `http://127.0.0.1:${port}`
  }
  return `http://127.0.0.1:${process.env.PORT ?? '3000'}`
}

/** Response headers that belong to the answer rather than to the hop that fetched it. */
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'location', 'cache-control', 'vary'] as const

export async function forwardToLegacyRecord(request: Request, slug: string): Promise<Response> {
  const incoming = new URL(request.url)
  const target = new URL(
    `/legacy-record/${encodeURIComponent(slug)}${incoming.search}`,
    loopbackOrigin(request.headers.get('host')),
  )
  const headers = new Headers(request.headers)
  headers.set(LEGACY_FORWARD_HEADER, legacyForwardToken())
  headers.delete('accept-encoding')
  const upstream = await fetch(target, { headers, redirect: 'manual' })

  const responseHeaders = new Headers()
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value !== null) responseHeaders.set(name, value)
  }
  for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append('set-cookie', cookie)

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}
