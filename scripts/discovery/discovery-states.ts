/**
 * The discovery-state vocabulary and its one machine-decidable member.
 *
 * Only `DISCOVERY_READY` can be decided from RNAWiki's own responses. A sitemap entry or an
 * IndexNow submission is a request, not a result: it never proves that a crawler fetched the page,
 * that a search engine indexed it, or that an answer engine cited it. The remaining states are
 * recorded only from an external report, and this module deliberately provides no way to assert
 * them from a self-fetch.
 */

export const DISCOVERY_STATES = [
  /** RNAWiki serves the URL as an indexable, self-canonical, structured-data-bearing page. */
  'DISCOVERY_READY',
  /** The URL was sent to a submission endpoint on a recorded date. Still only a request. */
  'SUBMITTED_FOR_DISCOVERY',
  /** A crawler fetch of the URL was seen in a server log or a search-console report. */
  'CRAWLED_OBSERVED',
  /** An external tool reported the URL as indexed. A self-fetch can never establish this. */
  'INDEXED_OBSERVED',
  /** An answer engine or a citing page was seen to retrieve or cite the URL. */
  'CITED_OR_RETRIEVED_OBSERVED',
] as const
export type DiscoveryState = (typeof DISCOVERY_STATES)[number]

export const DISCOVERY_STATE_MEANINGS: Record<DiscoveryState, string> = {
  DISCOVERY_READY:
    'RNAWiki returned 200 for this URL with no noindex directive, a self-referencing canonical link and structured data.',
  SUBMITTED_FOR_DISCOVERY:
    'The URL was included in a sitemap or an IndexNow request on a recorded date. This is a request, not an outcome.',
  CRAWLED_OBSERVED:
    'A crawler fetch of this URL appears in a server log or a search-console report, with the date it was seen.',
  INDEXED_OBSERVED:
    'An external tool reported this URL as indexed. Requires a named tool and a report date; RNAWiki cannot decide it alone.',
  CITED_OR_RETRIEVED_OBSERVED:
    'A named answer engine or citing page was seen to retrieve or cite this URL, with the date it was seen.',
}

/** States that require an outside report. Nothing in this repository may assert them from a fetch. */
export const EXTERNALLY_OBSERVED_STATES: readonly DiscoveryState[] = [
  'CRAWLED_OBSERVED',
  'INDEXED_OBSERVED',
  'CITED_OR_RETRIEVED_OBSERVED',
]

export const DISCOVERY_BLOCKER_CODES = [
  'request_failed',
  'status_not_200',
  'redirected',
  'noindex_meta',
  'noindex_header',
  'canonical_missing',
  'canonical_points_elsewhere',
  'no_structured_data',
] as const
export type DiscoveryBlockerCode = (typeof DISCOVERY_BLOCKER_CODES)[number]

export const DISCOVERY_BLOCKER_EXPLANATIONS: Record<DiscoveryBlockerCode, string> = {
  request_failed: 'The request did not complete, so nothing about the URL was observed.',
  status_not_200: 'The URL did not return HTTP 200.',
  redirected: 'The URL redirected, so it is not the address a crawler would keep.',
  noindex_meta: 'The page carries a noindex robots meta directive.',
  noindex_header: 'The response carries a noindex X-Robots-Tag header.',
  canonical_missing: 'The page has no canonical link.',
  canonical_points_elsewhere: 'The canonical link names a different URL.',
  no_structured_data: 'The page has no application/ld+json block.',
}

/** Exactly what one HTTP read of a public URL recorded. No field is inferred. */
export interface DiscoveryObservation {
  url: string
  status: number
  finalUrl: string
  /** The `content` of the robots meta tag, verbatim, or null when the tag is absent. */
  robotsMeta: string | null
  /** The `href` of the canonical link, verbatim, or null when the tag is absent. */
  canonical: string | null
  hasJsonLd: boolean
  xRobotsTag: string | null
  error?: string
}

export interface DiscoveryClassification {
  url: string
  state: 'DISCOVERY_READY' | null
  blockers: DiscoveryBlockerCode[]
}

export function hasNoindexDirective(value: string | null | undefined): boolean {
  if (!value) return false
  return value
    .split(',')
    .map((directive) => directive.trim().toLowerCase())
    .some((directive) => directive === 'noindex' || directive.endsWith(': noindex'))
}

/** Compare two URLs the way a crawler compares a canonical: scheme, host, path, query. */
export function sameDiscoveryUrl(left: string, right: string): boolean {
  const normalize = (value: string): string | null => {
    try {
      const url = new URL(value)
      const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
      return `${url.protocol}//${url.host}${path}${url.search}`
    } catch {
      return null
    }
  }
  const a = normalize(left)
  const b = normalize(right)
  return a !== null && a === b
}

/**
 * Decide `DISCOVERY_READY` from one observation, and otherwise list every reason it was refused.
 * The function has no other return value on purpose: it cannot report that a page was crawled,
 * indexed or cited, because a request to our own server is not evidence of any of those.
 */
export function classifyDiscoveryObservation(
  observation: DiscoveryObservation,
): DiscoveryClassification {
  const blockers: DiscoveryBlockerCode[] = []
  if (observation.error) blockers.push('request_failed')
  if (observation.status !== 200) blockers.push('status_not_200')
  if (observation.finalUrl && !sameDiscoveryUrl(observation.finalUrl, observation.url)) {
    blockers.push('redirected')
  }
  if (hasNoindexDirective(observation.robotsMeta)) blockers.push('noindex_meta')
  if (hasNoindexDirective(observation.xRobotsTag)) blockers.push('noindex_header')
  if (!observation.canonical) blockers.push('canonical_missing')
  else if (!sameDiscoveryUrl(observation.canonical, observation.url)) {
    blockers.push('canonical_points_elsewhere')
  }
  if (!observation.hasJsonLd) blockers.push('no_structured_data')

  return {
    url: observation.url,
    state: blockers.length === 0 ? 'DISCOVERY_READY' : null,
    blockers,
  }
}

/** Read `<loc>` values out of a sitemap document without parsing the whole XML tree. */
export function parseSitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].flatMap((match) => {
    const value = match[1]
    if (!value) return []
    return [
      value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'"),
    ]
  })
}

/** Keep only same-origin canonical dossier URLs, deduplicated, in document order. */
export function sitemapDossierUrls(xml: string, origin: string): string[] {
  const seen = new Set<string>()
  for (const location of parseSitemapLocations(xml)) {
    let url: URL
    try {
      url = new URL(location)
    } catch {
      continue
    }
    if (url.origin !== origin || url.search || url.hash) continue
    if (!/^\/d\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.pathname)) continue
    seen.add(url.toString())
  }
  return [...seen]
}

/** The read-only machine surface that accompanies each dossier page. */
export function apiUrlForDossierUrl(dossierUrl: string): string | null {
  let url: URL
  try {
    url = new URL(dossierUrl)
  } catch {
    return null
  }
  const slug = /^\/d\/([^/]+)$/.exec(url.pathname)?.[1]
  return slug ? `${url.origin}/api/drugs/${slug}` : null
}
