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
