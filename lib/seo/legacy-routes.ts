import { PUBLIC_PLACEHOLDER_MEDICINE_SLUGS } from '@/lib/public-data-integrity'

/**
 * Verified old-slug exceptions from the archived 641-URL legacy crawl. Same-slug compound routes
 * are resolved dynamically; this map exists only where the old and current public identities differ.
 */
export const LEGACY_COMPOUND_SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  'rapamycin-sirolimus': 'rapamycin',
}

/** Retired route families with no safe evidence-page equivalent in the current product. */
export const LEGACY_GONE_PREFIXES = [
  '/exercise',
  '/goal',
  '/protocol',
  '/target',
  '/pathway',
  '/pathways',
  '/learn',
  '/solve',
  '/plan',
  '/p',
  '/interest',
  '/newsletter',
] as const

export function legacyPathIsGone(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (normalized === '/c' || normalized === '/t/compound') return true
  if (normalized === '/solve.html' || normalized === '/p.html') return true
  if (/^\/c\/[^/]+\//.test(normalized) || /^\/t\/compound\/[^/]+\//.test(normalized)) {
    return true
  }

  return LEGACY_GONE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
}

/**
 * Slugs that name a spreadsheet artifact rather than a medicine. The inventory resolver classifies
 * these rows `INVALID_IDENTITY_GONE`, so their URLs identify nothing and never will. Shared with
 * the ingestion and read filters in `lib/public-data-integrity.ts`, which imports nothing and uses
 * no Node API, so this list stays available to edge middleware.
 */
const PLACEHOLDER_MEDICINE_SLUGS: ReadonlySet<string> = new Set(PUBLIC_PLACEHOLDER_MEDICINE_SLUGS)

/**
 * True when a `/d/` path names a placeholder identity. A 410 is correct here and a 404 is not: the
 * URL is permanently without a subject, and saying so stops a crawler returning to it.
 */
export function placeholderMedicineRouteIsGone(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const match = /^\/d\/([^/]+)(?:\/.*)?$/.exec(normalized)
  const encoded = match?.[1]
  if (!encoded) return false
  let slug: string
  try {
    slug = decodeURIComponent(encoded)
  } catch {
    return false
  }
  return PLACEHOLDER_MEDICINE_SLUGS.has(slug.trim().toLowerCase())
}
