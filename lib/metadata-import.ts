// Bibliographic metadata lookup for the admin "import from DOI/PMID" flow. This module only
// ever returns citation metadata (title/authors/publicationYear/journalOrIssuer/doi/pmid) that
// a human editor reviews before saving — never sourceType/studyDesign/species/sampleSize/
// endpoint, which stay manual editorial judgment calls and are never auto-filled or AI-guessed
// (see TASK section 6). Nothing in this file writes to the database.

export interface ImportedMetadata {
  title: string
  authors: string | null
  publicationYear: number | null
  journalOrIssuer: string | null
  doi: string | null
  pmid: string | null
}

export class MetadataImportError extends Error {}

function stripDoiPrefix(input: string): string {
  return input.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')
}

interface CrossrefAuthor {
  given?: string
  family?: string
  name?: string
}

interface CrossrefMessage {
  title?: string[]
  author?: CrossrefAuthor[]
  'container-title'?: string[]
  DOI?: string
  'published-print'?: { 'date-parts'?: number[][] }
  'published-online'?: { 'date-parts'?: number[][] }
  issued?: { 'date-parts'?: number[][] }
  publisher?: string
}

/** Crossref's public REST API — no API key required. */
export async function fetchMetadataByDoi(rawDoi: string): Promise<ImportedMetadata> {
  const doi = stripDoiPrefix(rawDoi)
  if (!doi) throw new MetadataImportError('Enter a DOI.')

  let res: Response
  try {
    res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'RNAwiki-editorial-import/1.0 (mailto:hello@rnawiki.com)' },
    })
  } catch {
    throw new MetadataImportError('Could not reach Crossref. Check the connection and try again.')
  }
  if (res.status === 404) throw new MetadataImportError(`No Crossref record found for DOI "${doi}".`)
  if (!res.ok) throw new MetadataImportError(`Crossref lookup failed (HTTP ${res.status}).`)

  const body = (await res.json()) as { message?: CrossrefMessage }
  const msg = body.message
  if (!msg) throw new MetadataImportError('Crossref returned no record for that DOI.')

  const authors =
    Array.isArray(msg.author) && msg.author.length > 0
      ? msg.author
          .map((a) => a.name ?? [a.given, a.family].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(', ')
      : null

  const yearParts =
    msg['published-print']?.['date-parts']?.[0] ??
    msg['published-online']?.['date-parts']?.[0] ??
    msg.issued?.['date-parts']?.[0]
  const publicationYear = typeof yearParts?.[0] === 'number' ? yearParts[0] : null

  const title = Array.isArray(msg.title) && msg.title.length > 0 ? msg.title[0] : ''
  if (!title) throw new MetadataImportError('Crossref record has no title — enter details manually.')

  return {
    title,
    authors,
    publicationYear,
    journalOrIssuer:
      (Array.isArray(msg['container-title']) ? msg['container-title'][0] : undefined) ?? msg.publisher ?? null,
    doi: msg.DOI ?? doi,
    pmid: null,
  }
}

interface EsummaryArticleId {
  idtype?: string
  value?: string
}

interface EsummaryDoc {
  title?: string
  authors?: { name?: string }[]
  fulljournalname?: string
  source?: string
  pubdate?: string
  elocationid?: string
  articleids?: EsummaryArticleId[]
  error?: string
}

interface EsummaryResult {
  result?: Record<string, EsummaryDoc> & { uids?: string[] }
}

/** NCBI E-utilities esummary — optionally using NCBI_EUTILS_API_KEY for a higher rate limit. */
export async function fetchMetadataByPmid(rawPmid: string): Promise<ImportedMetadata> {
  const pmid = rawPmid.trim().replace(/^PMID:?\s*/i, '')
  if (!pmid || !/^\d+$/.test(pmid)) throw new MetadataImportError('Enter a numeric PMID.')

  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi')
  url.searchParams.set('db', 'pubmed')
  url.searchParams.set('id', pmid)
  url.searchParams.set('retmode', 'json')
  const apiKey = process.env.NCBI_EUTILS_API_KEY
  if (apiKey) url.searchParams.set('api_key', apiKey)

  let res: Response
  try {
    res = await fetch(url.toString())
  } catch {
    throw new MetadataImportError('Could not reach NCBI E-utilities. Check the connection and try again.')
  }
  if (!res.ok) throw new MetadataImportError(`PubMed lookup failed (HTTP ${res.status}).`)

  const body = (await res.json()) as EsummaryResult
  const doc = body.result?.[pmid]
  if (!doc || doc.error || !doc.title) throw new MetadataImportError(`No PubMed record found for PMID "${pmid}".`)

  const authors =
    Array.isArray(doc.authors) && doc.authors.length > 0
      ? doc.authors.map((a) => a.name).filter(Boolean).join(', ')
      : null

  const yearMatch = doc.pubdate ? /^\d{4}/.exec(doc.pubdate) : null
  const publicationYear = yearMatch ? Number.parseInt(yearMatch[0], 10) : null

  const doiFromArticleIds = doc.articleids?.find((a) => a.idtype === 'doi')?.value
  const doi = doiFromArticleIds ?? (doc.elocationid?.startsWith('10.') ? doc.elocationid : null)

  return {
    title: doc.title,
    authors,
    publicationYear,
    journalOrIssuer: doc.fulljournalname ?? doc.source ?? null,
    doi: doi ?? null,
    pmid,
  }
}
