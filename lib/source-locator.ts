export type SafeSourceLocatorKind = 'WEB' | 'DOI' | 'PMID' | 'NCT' | 'URN'

export interface SafeSourceLocator {
  canonicalLocator: string
  href: string | null
  kind: SafeSourceLocatorKind
}

/** Resolve the canonical schemes accepted by RNA Intelligence into safe public provenance. */
export function resolveSafeSourceLocator(value: string): SafeSourceLocator | null {
  const canonicalLocator = value.trim()
  if (!canonicalLocator || /\s/.test(canonicalLocator)) return null

  const doi = /^doi:(10\.\d{4,9}\/.+)$/i.exec(canonicalLocator)
  if (doi?.[1]) {
    const encoded = doi[1]
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')
    return { canonicalLocator, href: `https://doi.org/${encoded}`, kind: 'DOI' }
  }

  const pmid = /^pmid:(\d+)$/i.exec(canonicalLocator)
  if (pmid?.[1]) {
    return {
      canonicalLocator,
      href: `https://pubmed.ncbi.nlm.nih.gov/${pmid[1]}/`,
      kind: 'PMID',
    }
  }

  const nct = /^nct:(NCT\d{8})$/i.exec(canonicalLocator)
  if (nct?.[1]) {
    return {
      canonicalLocator,
      href: `https://clinicaltrials.gov/study/${nct[1].toUpperCase()}`,
      kind: 'NCT',
    }
  }

  if (/^urn:[^\s]+$/i.test(canonicalLocator)) {
    return { canonicalLocator, href: null, kind: 'URN' }
  }

  try {
    const url = new URL(canonicalLocator)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      !url.hostname ||
      url.username.length > 0 ||
      url.password.length > 0
    ) {
      return null
    }
    return { canonicalLocator, href: url.toString(), kind: 'WEB' }
  } catch {
    return null
  }
}

/**
 * Public web locations for the registry identifiers the completion resolver records.
 *
 * Only kinds with a stable public page are mapped, and only when the identifier itself has the
 * exact shape that page expects. Everything else — a search record, an ingest label, an identifier
 * of an unexpected shape — resolves to `null` and is shown as text, because a link that may not
 * open is worse than the identifier printed on its own.
 */
const DAILYMED_SET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REGISTRY_NUMBER = /^\d{1,12}$/
const NCT_ID = /^NCT\d{8}$/i

export function resolveRecordedSourceLocator(
  kind: string,
  identifier: string,
): SafeSourceLocator | null {
  const value = identifier.trim()
  if (!value) return null
  switch (kind) {
    case 'FDA_LABEL':
    case 'FDA_LABEL_SET':
    case 'DAILYMED':
      return DAILYMED_SET_ID.test(value)
        ? resolveSafeSourceLocator(
            `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${encodeURIComponent(value)}`,
          )
        : null
    case 'CLINICALTRIALS':
      return NCT_ID.test(value) ? resolveSafeSourceLocator(`nct:${value.toUpperCase()}`) : null
    case 'PUBMED':
      return REGISTRY_NUMBER.test(value) ? resolveSafeSourceLocator(`pmid:${value}`) : null
    case 'PUBCHEM':
    case 'PUBCHEM_CID':
      return REGISTRY_NUMBER.test(value)
        ? resolveSafeSourceLocator(`https://pubchem.ncbi.nlm.nih.gov/compound/${value}`)
        : null
    case 'NCBI_TAXONOMY':
      return REGISTRY_NUMBER.test(value)
        ? resolveSafeSourceLocator(
            `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${value}`,
          )
        : null
    default:
      return null
  }
}
