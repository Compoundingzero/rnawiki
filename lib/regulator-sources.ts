/**
 * Is this URL published by a regulator (or the government library that hosts a regulator's
 * documents), or by somebody else?
 *
 * This exists because of one sentence. `components/RegulatorySummary.tsx` prints
 * "Read the regulator's own record" under every jurisdiction block, unconditionally, using
 * whatever `regulatoryStatuses.source` holds. Two of Casgevy's three approval links pointed at
 * Vertex's own newsroom — the manufacturer — under a sentence promising the regulator, on the page
 * whose entire positioning claim (docs/product-principles.md, "Positioning") is that nobody who
 * profits from a treatment gets to define what "works" means for it. The same rule is stated in
 * the corpus itself, in scripts/seed-data/bpc-157.ts: a link labelled "Read the regulator's own
 * record" "must resolve to the regulator, not to press."
 *
 * The alternative fix — swapping in the MHRA and EU regulators' own pages — was rejected because
 * it would have meant writing URLs nobody on this task could resolve and verify. The sponsor's
 * announcements do accurately report the decisions and dates; what was false was the label on the
 * link, so the label is what moved.
 *
 * DEFAULT-SAFE BY CONSTRUCTION: an unrecognised host is treated as NOT a regulator. A new
 * regulator's domain therefore gets the neutral wording until somebody adds it here, which is the
 * failure direction that cannot mislead a reader. Never invert this to an "everything except a
 * known-bad list" check.
 *
 * Match is on the registrable host, with subdomains allowed (`www.fda.gov`,
 * `dailymed.nlm.nih.gov`), and never on a substring of the whole URL — `https://evil.example/
 * ?u=fda.gov` must not pass.
 */

/** Hosts, and any subdomain of them, that publish regulators' own records. */
const REGULATOR_HOSTS = [
  'fda.gov', // US Food and Drug Administration
  'nlm.nih.gov', // DailyMed, which hosts the FDA-approved label itself
  'nih.gov',
  'ema.europa.eu', // European Medicines Agency
  'europa.eu', // European Commission / EU Union Register of medicinal products
  'gov.uk', // MHRA and the rest of UK government
  'mhra.gov.uk',
  'hsa.gov.sg', // Singapore Health Sciences Authority
  'tga.gov.au', // Australia
  'canada.ca', // Health Canada
  'hc-sc.gc.ca',
  'pmda.go.jp', // Japan
  'swissmedic.ch',
  'who.int',
] as const

export function isRegulatorSourceUrl(rawUrl: string): boolean {
  let host: string
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    host = parsed.hostname.toLowerCase()
  } catch {
    return false
  }
  return REGULATOR_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

/**
 * The link wording for a regulatory-status source. The regulator wording is a promise about who
 * published the document, so it is only made when the host says so; everything else gets a
 * description that is true whoever published it.
 */
export function regulatorySourceLinkLabel(rawUrl: string): string {
  return isRegulatorSourceUrl(rawUrl) ? 'Read the regulator’s own record' : 'Read the source for this status'
}
