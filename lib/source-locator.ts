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
