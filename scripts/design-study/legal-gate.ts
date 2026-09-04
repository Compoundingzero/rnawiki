/**
 * The legal and ethical gate for the design study.
 *
 * It decides whether a later real-browser capture may happen for each Track A1/A2 site. It fetches
 * only what the mandate permits — robots.txt, the terms-of-service page (candidates in order, then
 * one index fetch to find a terms link), and for A2 sites the public API root or API documentation
 * page needed to establish whether an API exists and under what licence, plus the single listing or
 * API query needed to pick ONE public content page where the registry says the candidate content
 * page must be replaced. Nothing else is fetched. Forum threads are never fetched.
 *
 * Two passes, because software checks structure and people judge meaning:
 *
 *   --all | --site <key>   fetch pass. Saves robots.txt, the terms HTML and a text extraction,
 *                          parses robots.txt properly (grouping, longest-path match, wildcards, $),
 *                          extracts verbatim terms sentences, records the API finding, verifies or
 *                          replaces URLs, and writes the machine facts to
 *                          data/design-study/legal/<dirName>.gate.json with a deterministic
 *                          candidate decision. Sites whose state already carries a legalGate are
 *                          reported "already gated" and skipped unless --force.
 *
 *   --finalize             merges data/design-study/legal/judgements.json (the reviewed 2-4 sentence
 *                          terms summary, the licence reading and the proposed decision, each with
 *                          the verbatim clause it rests on) with the machine facts, writes the
 *                          per-site legalGate into state.json through updateSite(), and writes
 *                          data/design-study/legal-gate.json and legal-gate.md.
 *
 *   --status               one line per A1/A2 site: gate decision, robots verdicts, terms URL.
 *
 * Every request is logged to data/design-study/legal/requests.log (url, status, bytes, ms).
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { SITES, dirName, type StudySite, type Track } from './sites.js'
import {
  DATA_DIR,
  LEGAL_DIR,
  loadState,
  updateSite,
  type LegalDecision,
  type LegalGate,
  type SiteState,
} from './state.js'

const UA =
  'RNAWiki-design-study/1.0 (+https://rnawiki.com; design research; contact felix360506@gmail.com)'
const TIMEOUT_MS = 20_000
const MIN_HOST_GAP_MS = 1_000
const MAX_REQUESTS = 220
const REQUESTS_LOG = path.join(LEGAL_DIR, 'requests.log')
const JUDGEMENTS_PATH = path.join(LEGAL_DIR, 'judgements.json')
const GATE_JSON = path.join(DATA_DIR, 'legal-gate.json')
const GATE_MD = path.join(DATA_DIR, 'legal-gate.md')

// ---------------------------------------------------------------------------- fetching

interface FetchResult {
  requestedUrl: string
  finalUrl: string
  status: number | null
  bytes: number
  ms: number
  body: string | null
  error?: string
  redirected: boolean
}

const lastHostAt = new Map<string, number>()
let requestsMade = 0

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function logRequest(line: string): Promise<void> {
  await fs.mkdir(LEGAL_DIR, { recursive: true })
  await fs.appendFile(REQUESTS_LOG, `${line}\n`, 'utf8')
}

async function politeFetch(
  url: string,
  opts: { method?: 'GET' | 'HEAD'; purpose: string; accept?: string } = { purpose: 'unspecified' },
): Promise<FetchResult> {
  const method = opts.method ?? 'GET'
  if (requestsMade >= MAX_REQUESTS) {
    return {
      requestedUrl: url,
      finalUrl: url,
      status: null,
      bytes: 0,
      ms: 0,
      body: null,
      error: `request cap ${MAX_REQUESTS} reached`,
      redirected: false,
    }
  }
  let host: string
  try {
    host = new URL(url).host
  } catch {
    return {
      requestedUrl: url,
      finalUrl: url,
      status: null,
      bytes: 0,
      ms: 0,
      body: null,
      error: 'invalid URL',
      redirected: false,
    }
  }

  let attempt = 0
  let last: FetchResult | null = null
  for (;;) {
    const previous = lastHostAt.get(host)
    if (previous !== undefined) {
      const wait = MIN_HOST_GAP_MS - (Date.now() - previous)
      if (wait > 0) await sleep(wait)
    }
    lastHostAt.set(host, Date.now())
    const started = Date.now()
    requestsMade += 1
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        headers: {
          'user-agent': UA,
          accept:
            opts.accept ??
            'text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.5',
          'accept-language': 'en',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const body = method === 'HEAD' ? null : await response.text()
      const ms = Date.now() - started
      const bytes =
        body === null
          ? Number(response.headers.get('content-length') ?? 0)
          : Buffer.byteLength(body)
      last = {
        requestedUrl: url,
        finalUrl: response.url || url,
        status: response.status,
        bytes,
        ms,
        body,
        redirected: (response.url || url) !== url,
      }
      await logRequest(
        `${new Date().toISOString()}\t${method}\t${url}\t${response.status}\t${bytes}\t${ms}ms\t${opts.purpose}${
          last.redirected ? `\t-> ${last.finalUrl}` : ''
        }`,
      )
      const retriable = response.status === 429 || response.status >= 500
      if (retriable && attempt === 0) {
        attempt += 1
        await sleep(2_000)
        continue
      }
      return last
    } catch (error) {
      const ms = Date.now() - started
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      await logRequest(
        `${new Date().toISOString()}\t${method}\t${url}\tERR\t0\t${ms}ms\t${opts.purpose}\t${message}`,
      )
      last = {
        requestedUrl: url,
        finalUrl: url,
        status: null,
        bytes: 0,
        ms,
        body: null,
        error: message,
        redirected: false,
      }
      if (attempt === 0) {
        attempt += 1
        await sleep(2_000)
        continue
      }
      return last
    }
  }
}

// ---------------------------------------------------------------------------- robots.txt

interface RobotsGroup {
  agents: string[]
  rules: Array<{ type: 'allow' | 'disallow'; pattern: string; line: string }>
  crawlDelay: string | null
}

interface RobotsParsed {
  groups: RobotsGroup[]
  sitemaps: string[]
}

function parseRobots(text: string): RobotsParsed {
  const groups: RobotsGroup[] = []
  const sitemaps: string[] = []
  let current: RobotsGroup | null = null
  let sawRuleInGroup = false
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const field = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()
    if (field === 'user-agent') {
      if (!current || sawRuleInGroup) {
        current = { agents: [], rules: [], crawlDelay: null }
        groups.push(current)
        sawRuleInGroup = false
      }
      current.agents.push(value.toLowerCase())
    } else if (field === 'allow' || field === 'disallow') {
      if (!current) {
        current = { agents: ['*'], rules: [], crawlDelay: null }
        groups.push(current)
      }
      current.rules.push({ type: field, pattern: value, line: rawLine.trim() })
      sawRuleInGroup = true
    } else if (field === 'crawl-delay') {
      if (current) {
        current.crawlDelay = value
        sawRuleInGroup = true
      }
    } else if (field === 'sitemap') {
      sitemaps.push(value)
    }
  }
  return { groups, sitemaps }
}

/** Robots path matching: literal match with `*` as any-sequence and a trailing `$` anchoring the end. */
function robotsPathMatches(pattern: string, target: string): boolean {
  if (pattern === '') return false // an empty Disallow/Allow value matches nothing (it is "allow all")
  let anchored = false
  let body = pattern
  if (body.endsWith('$')) {
    anchored = true
    body = body.slice(0, -1)
  }
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  const re = new RegExp(`^${escaped}${anchored ? '$' : ''}`)
  return re.test(target)
}

interface RobotsVerdict {
  allowed: boolean | null
  matched: string[] // verbatim lines relied on
  note: string
}

function agentApplies(agent: string): 'exact' | 'wildcard' | null {
  if (agent === '*') return 'wildcard'
  const token = agent.toLowerCase()
  if (!token) return null
  if (UA.toLowerCase().includes(token) || token.includes('rnawiki')) return 'exact'
  return null
}

function evaluateRobots(parsed: RobotsParsed, target: string): RobotsVerdict {
  const applicable = parsed.groups
    .map((group) => {
      const kinds = group.agents
        .map(agentApplies)
        .filter((k): k is 'exact' | 'wildcard' => k !== null)
      if (!kinds.length) return null
      return { group, specific: kinds.includes('exact') }
    })
    .filter((g): g is { group: RobotsGroup; specific: boolean } => g !== null)

  if (!applicable.length) {
    return {
      allowed: true,
      matched: [],
      note: 'no group applies to our user agent or to *; nothing is disallowed',
    }
  }

  const perGroup = applicable.map(({ group, specific }) => {
    let best: { type: 'allow' | 'disallow'; pattern: string; line: string } | null = null
    for (const rule of group.rules) {
      if (!robotsPathMatches(rule.pattern, target)) continue
      if (
        !best ||
        rule.pattern.length > best.pattern.length ||
        (rule.pattern.length === best.pattern.length && rule.type === 'allow')
      ) {
        best = rule
      }
    }
    return {
      agents: group.agents.join(', '),
      specific,
      allowed: best ? best.type === 'allow' : true,
      line: best ? best.line : null,
      crawlDelay: group.crawlDelay,
    }
  })

  const specific = perGroup.filter((g) => g.specific)
  const decisive = specific.length ? specific : perGroup
  const allowed = decisive.every((g) => g.allowed) && perGroup.every((g) => g.allowed)
  const matched = perGroup.filter((g) => g.line).map((g) => `User-agent: ${g.agents} -> ${g.line}`)
  const notes: string[] = []
  if (specific.length) notes.push('a group names our user agent; it decides')
  if (!matched.length) notes.push('no rule in the applicable group matches this path')
  if (decisive.some((g) => g.allowed) && !allowed)
    notes.push('applicable groups disagree; the conservative reading (disallowed) is recorded')
  return { allowed, matched, note: notes.join('; ') }
}

// ---------------------------------------------------------------------------- HTML text

const BLOCK_TAGS =
  'address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul'

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
}

function htmlToText(html: string): string {
  // GitHub renders blob content into an embedded JSON payload; take the raw lines if present.
  const rawLines = /"rawLines":\[(.*?)\],"styling/s.exec(html)
  if (rawLines) {
    try {
      const arr = JSON.parse(`[${rawLines[1]}]`) as string[]
      if (Array.isArray(arr) && arr.length > 5) return arr.join('\n')
    } catch {
      /* fall through to the generic extraction */
    }
  }
  let text = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(new RegExp(`</?(?:${BLOCK_TAGS})\\b[^>]*>`, 'gi'), '\n')
    .replace(/<[^>]+>/g, ' ')
  text = decodeEntities(text)
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text
}

/** A candidate counts as the terms document only if its URL or title says so. */
function looksLikeTermsDoc(finalUrl: string, html: string): boolean {
  const title = extractTitle(html) ?? ''
  return (
    /(terms|conditions|legal|\btos\b|user[- ]agreement|copyright|disclaimer|acceptable[- ]use)/i.test(
      finalUrl,
    ) || /(terms|conditions|user agreement|copyright|disclaimer|acceptable use)/i.test(title)
  )
}

function extractTitle(html: string): string | null {
  const m = /<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html)
  return m?.[1] ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : null
}

interface Anchor {
  href: string
  text: string
}

function extractAnchors(html: string, base: string): Anchor[] {
  const out: Anchor[] = []
  const re = /<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]{0,400}?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const href = (m[2] ?? m[3] ?? m[4] ?? '').trim()
    if (!href || href.startsWith('#') || /^(javascript|mailto|tel):/i.test(href)) continue
    const text = decodeEntities((m[5] ?? '').replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim()
    let abs: string
    try {
      abs = new URL(href, base).toString()
    } catch {
      continue
    }
    if (!/^https?:/i.test(abs)) continue
    out.push({ href: abs, text })
  }
  return out
}

// ---------------------------------------------------------------------------- terms excerpts

const EXCERPT_RE =
  /automat|scrap|crawl|spider|robot|\bbots?\b|harvest|screenshot|reproduc|data[- ]mining|text and data|\bcopy|download|framing|commercial|licen[cs]e|creative commons|CC[ -]BY|public domain|\bAPI\b/i
const HIGH_SIGNAL_RE =
  /automat|scrap|crawl|spider|robot|\bbots?\b|harvest|screenshot|data[- ]mining|text and data|creative commons|CC[ -]BY|public domain|\bAPI\b|licen[cs]e/i
const FORBIDS_RE = [
  /(?:may|must|shall|will|do|can)\s+not\b[^.]{0,160}?(automat|scrap|crawl|spider|robot|harvest|data[- ]min|screen[- ]?scrap)/i,
  /(?:prohibit|forbid|restrict|disallow)[^.]{0,160}?(automat|scrap|crawl|spider|robot|harvest|data[- ]min)/i,
  /\bno\b[^.]{0,60}?(automated (?:access|means|tools?|systems?|queries)|scraping|crawling|robots?|spiders?)/i,
  /(?:agree|undertake)\s+not\s+to[^.]{0,200}?(automat|scrap|crawl|spider|robot|harvest|reproduc|copy)/i,
  /without[^.]{0,80}(prior )?(written )?(permission|consent)[^.]{0,120}(reproduc|copy|republish|distribut)/i,
]

function splitSentences(text: string): string[] {
  const out: string[] = []
  for (const block of text.split(/\n+/)) {
    const trimmed = block.trim()
    if (!trimmed) continue
    if (trimmed.length <= 400 && !/[.!?]\s/.test(trimmed)) {
      out.push(trimmed)
      continue
    }
    for (const sentence of trimmed.split(/(?<=[.!?;:])\s+(?=[A-Z0-9("'])/)) {
      const s = sentence.trim()
      if (s) out.push(s)
    }
  }
  return out
}

function extractExcerpts(text: string, cap = 40): string[] {
  const seen = new Set<string>()
  const candidates: Array<{ index: number; score: number; text: string }> = []
  splitSentences(text).forEach((sentence, index) => {
    if (sentence.length < 25) return
    if (!EXCERPT_RE.test(sentence)) return
    const clipped =
      sentence.length > 400 ? `${sentence.slice(0, 397).replace(/\s+\S*$/, '')}…` : sentence
    const norm = clipped.toLowerCase().replace(/\s+/g, ' ')
    if (seen.has(norm)) return
    seen.add(norm)
    candidates.push({
      index,
      score: HIGH_SIGNAL_RE.test(sentence) ? (FORBIDS_RE.some((r) => r.test(sentence)) ? 3 : 2) : 1,
      text: clipped,
    })
  })
  return candidates
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, cap)
    .sort((a, b) => a.index - b.index)
    .map((c) => c.text)
}

// ---------------------------------------------------------------------------- facts file

interface GateFacts {
  key: string
  track: Track
  dir: string
  checkedAt: string
  indexUrl: string
  contentUrl: string
  contentNote?: string
  reachable: boolean
  robots: {
    url: string
    httpStatus: number | null
    savedTo: string | null
    indexPath: string
    contentPath: string
    indexAllowed: boolean | null
    contentAllowed: boolean | null
    relevantLines: string[]
    crawlDelay: string | null
    sitemaps: string[]
    note: string
  }
  terms: {
    url: string | null
    httpStatus: number | null
    savedTo: string | null
    textSavedTo: string | null
    textChars: number
    candidatesTried: Array<{ url: string; status: number | null; note?: string }>
    foundViaIndexLink: boolean
    relevantExcerpts: string[]
    forbiddingHits: string[]
  }
  api: { exists: boolean | null; url: string | null; licence: string | null; note: string }
  machineProposal: { decision: LegalDecision; reason: string }
  notes: string[]
}

function factsPath(dir: string): string {
  return path.join(LEGAL_DIR, `${dir}.gate.json`)
}

async function readFacts(dir: string): Promise<GateFacts | null> {
  try {
    return JSON.parse(await fs.readFile(factsPath(dir), 'utf8')) as GateFacts
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

// ---------------------------------------------------------------------------- per-site work

function pathAndQuery(url: string): string {
  try {
    const u = new URL(url)
    return `${u.pathname}${u.search}`
  } catch {
    return '/'
  }
}

const indexHtmlCache = new Map<
  string,
  { url: string; status: number | null; html: string | null }
>()

async function fetchIndexOnce(
  url: string,
  purpose: string,
  indexSaveName?: string,
): Promise<{ url: string; status: number | null; html: string | null }> {
  const cached = indexHtmlCache.get(url)
  if (cached) return cached
  const res = await politeFetch(url, { purpose })
  const value = { url: res.finalUrl, status: res.status, html: res.body }
  indexHtmlCache.set(url, value)
  if (res.body && indexSaveName) {
    await fs.mkdir(LEGAL_DIR, { recursive: true })
    await fs.writeFile(path.join(LEGAL_DIR, `${indexSaveName}.index.html`), res.body, 'utf8')
  }
  return value
}

/** Step 4: verify the Longevity Wiki host. Returns the resolved index URL or null. */
async function resolveLongevityWiki(
  notes: string[],
): Promise<{ index: string; status: number | null; title: string | null } | null> {
  const candidates = [
    'https://longevitywiki.org/',
    'https://www.longevitywiki.org/',
    'https://en.longevitywiki.org/',
  ]
  const override = process.env.LONGEVITY_WIKI_URL
  if (override) candidates.unshift(override)
  for (const candidate of candidates) {
    const res = await politeFetch(candidate, { purpose: 'longevity-wiki host verification' })
    if (res.status === 200 && res.body) {
      const title = extractTitle(res.body)
      notes.push(
        `Host verification: ${candidate} -> ${res.finalUrl} HTTP 200, <title> ${JSON.stringify(title ?? '')}.`,
      )
      indexHtmlCache.set(res.finalUrl, { url: res.finalUrl, status: 200, html: res.body })
      return { index: res.finalUrl, status: 200, title }
    }
    notes.push(
      `Host verification: ${candidate} -> ${res.status ?? 'no response'}${res.error ? ` (${res.error})` : ''}.`,
    )
  }
  return null
}

interface ApiProbe {
  url: string
  purpose: string
  accept?: string
}

function apiProbesFor(site: StudySite, indexUrl: string): ApiProbe[] {
  switch (site.key) {
    case 'biohackrxiv (osf.io)':
      return [
        { url: 'https://api.osf.io/v2/', purpose: 'API root (OSF)', accept: 'application/json' },
      ]
    case 'zenodo.org':
      return [
        {
          url: 'https://zenodo.org/api/records?size=1',
          purpose: 'API root (Zenodo REST)',
          accept: 'application/json',
        },
      ]
    case 'forum.quantifiedself.com':
      return [
        {
          url: 'https://forum.quantifiedself.com/about.json',
          purpose: 'API existence probe (Discourse about.json; no threads fetched)',
          accept: 'application/json',
        },
      ]
    case 'wiki.biohack.me':
      return [
        {
          url: 'https://wiki.biohack.me/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json',
          purpose: 'API root (MediaWiki siteinfo + rightsinfo)',
          accept: 'application/json',
        },
      ]
    case 'longevity wiki (url to verify)': {
      let base: string
      try {
        base = new URL(indexUrl).origin
      } catch {
        return []
      }
      return [
        {
          url: `${base}/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json`,
          purpose: 'API root (MediaWiki siteinfo + rightsinfo)',
          accept: 'application/json',
        },
      ]
    }
    case 'openhumans.org':
      return [{ url: 'https://www.openhumans.org/api-docs/', purpose: 'API documentation page' }]
    default:
      return []
  }
}

function findLicenceString(text: string): string | null {
  const patterns = [
    /Creative Commons[^.\n]{0,80}/i,
    /CC[ -](?:BY|0)[A-Za-z0-9.\- ]{0,20}/,
    /\bMIT License\b/i,
    /\bApache License[^.\n]{0,20}/i,
    /public domain[^.\n]{0,60}/i,
    /Open Data Commons[^.\n]{0,60}/i,
  ]
  for (const re of patterns) {
    const m = re.exec(text)
    if (m)
      return m[0]
        .replace(/\s+/g, ' ')
        .replace(/["'}\]),.;:\s]+$/, '')
        .trim()
        .slice(0, 200)
  }
  return null
}

async function probeApi(
  site: StudySite,
  indexUrl: string,
  termsText: string,
  notes: string[],
): Promise<GateFacts['api']> {
  if (site.track !== 'A2') {
    return {
      exists: null,
      url: null,
      licence: null,
      note: 'not investigated: A1 site, screenshot study only',
    }
  }
  if (site.key === 'longecity.org') {
    return {
      exists: null,
      url: null,
      licence: null,
      note: 'not investigated: no permitted API probe for this host; forum, screenshot-only study, extract nothing',
    }
  }
  const probes = apiProbesFor(site, indexUrl)
  if (!probes.length) {
    // experiment.com and sphere.diybio.org: only a documented API URL discoverable from a page we
    // have already fetched may be probed.
    const discovered = discoverApiUrlFromFetched(site, indexUrl)
    if (!discovered) {
      return {
        exists: null,
        url: null,
        licence: findLicenceString(termsText),
        note: 'no documented API URL was discoverable from the terms or index page already fetched; not probed',
      }
    }
    probes.push({
      url: discovered,
      purpose: 'API documentation page discovered on an already-fetched page',
    })
    notes.push(`API URL discovered on an already-fetched page: ${discovered}`)
  }
  for (const probe of probes) {
    const res = await politeFetch(probe.url, { purpose: probe.purpose, accept: probe.accept })
    if (res.status === 200 && res.body) {
      const body = res.body
      const isJson = /^[\s]*[[{]/.test(body)
      const text = isJson ? body.slice(0, 20_000) : htmlToText(body).slice(0, 20_000)
      const licence = findLicenceString(text) ?? findLicenceString(termsText)
      await fs.writeFile(path.join(LEGAL_DIR, `${dirName(site.key)}.api.txt`), text, 'utf8')
      return {
        exists: true,
        url: res.finalUrl,
        licence,
        note: `${probe.purpose}: HTTP 200, ${res.bytes} bytes${isJson ? ' (JSON)' : ''}; saved excerpt to legal/${dirName(site.key)}.api.txt`,
      }
    }
    notes.push(
      `API probe ${probe.url} -> ${res.status ?? 'no response'}${res.error ? ` (${res.error})` : ''}.`,
    )
  }
  const discovered = discoverApiUrlFromFetched(site, indexUrl)
  if (discovered && !probes.some((p) => p.url === discovered)) {
    notes.push(
      `API URL discovered on an already-fetched page after the documented probe failed: ${discovered}`,
    )
    const res = await politeFetch(discovered, {
      purpose: 'API documentation page discovered on an already-fetched page',
    })
    if (res.status === 200 && res.body) {
      const text = /^[\s]*[[{]/.test(res.body)
        ? res.body.slice(0, 20_000)
        : htmlToText(res.body).slice(0, 20_000)
      await fs.writeFile(path.join(LEGAL_DIR, `${dirName(site.key)}.api.txt`), text, 'utf8')
      return {
        exists: true,
        url: res.finalUrl,
        licence: findLicenceString(text) ?? findLicenceString(termsText),
        note: `documented probe ${probes.map((p) => p.url).join(', ')} failed; API page discovered on an already-fetched page returned HTTP 200 (${res.bytes} bytes)`,
      }
    }
    notes.push(`Discovered API URL ${discovered} -> HTTP ${res.status ?? 'no response'}.`)
  }
  return {
    exists: false,
    url: probes[0]?.url ?? null,
    licence: findLicenceString(termsText),
    note: `every permitted API probe failed: ${probes.map((p) => p.url).join(', ')}`,
  }
}

function discoverApiUrlFromFetched(site: StudySite, indexUrl: string): string | null {
  const pages: string[] = []
  const cached = indexHtmlCache.get(indexUrl)
  if (cached?.html) pages.push(cached.html)
  const termsHtml = termsHtmlCache.get(site.key)
  if (termsHtml) pages.push(termsHtml)
  for (const html of pages) {
    const anchors = extractAnchors(html, indexUrl)
    const hit = anchors.find(
      (a) =>
        /\bapi\b/i.test(a.text) &&
        /^https?:\/\//.test(a.href) &&
        !/\/api\/auth|apiary|rapid/i.test(a.href),
    )
    if (hit) return hit.href
  }
  return null
}

const termsHtmlCache = new Map<string, string>()

/** Step 5: pick ONE public content page where the registry says the candidate must be replaced. */
async function selectContentPage(
  site: StudySite,
  indexUrl: string,
  api: GateFacts['api'],
  notes: string[],
): Promise<{ url: string; note: string } | null> {
  switch (site.key) {
    case 'biohackrxiv (osf.io)': {
      const query =
        'https://api.osf.io/v2/preprints/?filter%5Bprovider%5D=biohackrxiv&page%5Bsize%5D=5&sort=-date_published&embed=license'
      const res = await politeFetch(query, {
        purpose: 'select one public preprint (OSF API)',
        accept: 'application/json',
      })
      if (res.status !== 200 || !res.body) {
        notes.push(`OSF preprint query -> ${res.status ?? 'no response'}; content page unchanged.`)
        return null
      }
      try {
        const json = JSON.parse(res.body) as {
          data?: Array<{
            id: string
            attributes?: { title?: string; is_published?: boolean; is_public?: boolean }
            embeds?: { license?: { data?: { attributes?: { name?: string } } } }
          }>
        }
        const hit = (json.data ?? []).find((d) => d.attributes?.is_published !== false)
        if (!hit) {
          notes.push('OSF preprint query returned no published preprint; content page unchanged.')
          return null
        }
        const preprintLicence = hit.embeds?.license?.data?.attributes?.name ?? null
        if (preprintLicence) api.licence = api.licence ?? preprintLicence
        return {
          url: `https://osf.io/preprints/biohackrxiv/${hit.id}`,
          note: `Selected through the OSF API (${query}): the most recently published public BiohackrXiv preprint, id ${hit.id}${
            hit.attributes?.title
              ? `, titled ${JSON.stringify(hit.attributes.title.slice(0, 120))}`
              : ''
          }${preprintLicence ? `; the API states its licence is ${preprintLicence}` : '; the API stated no licence for it'}.`,
        }
      } catch (error) {
        notes.push(`OSF preprint query JSON parse failed: ${String(error)}`)
        return null
      }
    }
    case 'zenodo.org': {
      const query = 'https://zenodo.org/api/records?q=longevity&size=5&sort=mostrecent'
      const res = await politeFetch(query, {
        purpose: 'select one public record (Zenodo API)',
        accept: 'application/json',
      })
      if (res.status !== 200 || !res.body) {
        notes.push(`Zenodo record query -> ${res.status ?? 'no response'}; content page unchanged.`)
        return null
      }
      try {
        const json = JSON.parse(res.body) as {
          hits?: {
            hits?: Array<{
              id?: number | string
              links?: { self_html?: string; html?: string }
              metadata?: {
                title?: string
                access_right?: string
                license?: { id?: string } | string
              }
            }>
          }
        }
        const hits = json.hits?.hits ?? []
        const hit = hits.find((h) => (h.metadata?.access_right ?? 'open') === 'open') ?? hits[0]
        if (!hit) {
          notes.push('Zenodo record query returned no hit; content page unchanged.')
          return null
        }
        const url =
          hit.links?.self_html ?? hit.links?.html ?? `https://zenodo.org/records/${hit.id}`
        const licence =
          typeof hit.metadata?.license === 'string'
            ? hit.metadata.license
            : (hit.metadata?.license?.id ?? null)
        return {
          url,
          note: `Selected through the Zenodo REST API (${query}): the most recent open record matching "longevity", id ${hit.id}${
            hit.metadata?.title
              ? `, titled ${JSON.stringify(hit.metadata.title.slice(0, 120))}`
              : ''
          }${licence ? `, record licence ${licence}` : ''}.`,
        }
      } catch (error) {
        notes.push(`Zenodo record query JSON parse failed: ${String(error)}`)
        return null
      }
    }
    case 'experiment.com': {
      const listing = 'https://experiment.com/discover'
      const res = await fetchIndexOnce(
        listing,
        'one public listing page, to select one project page',
      )
      if (res.status !== 200 || !res.html) {
        notes.push(
          `experiment.com listing -> ${res.status ?? 'no response'}; content page unchanged.`,
        )
        return null
      }
      const anchors = extractAnchors(res.html, listing).filter(
        (a) =>
          /\/projects\/[a-z0-9][a-z0-9-]{5,}(?:$|[/?#])/i.test(a.href) &&
          !/\/projects\/random\b/i.test(a.href),
      )
      if (!anchors.length) {
        notes.push(
          'experiment.com listing exposed no /projects/ anchor in server-rendered markup; content page unchanged.',
        )
        return null
      }
      const pick = anchors[0]!
      return {
        url: pick.href.split('#')[0] ?? pick.href,
        note: `Selected from the public listing page ${listing}: first project anchor in the server-rendered markup${
          pick.text ? ` (link text ${JSON.stringify(pick.text.slice(0, 100))})` : ''
        }. No API documentation URL was discoverable, so a listing page was used.`,
      }
    }
    case 'sphere.diybio.org': {
      const res = await fetchIndexOnce(
        indexUrl,
        'one public listing page, to select one project page',
      )
      if (res.status !== 200 || !res.html) {
        notes.push(
          `sphere.diybio.org index -> ${res.status ?? 'no response'}; content page unchanged.`,
        )
        return null
      }
      const anchors = extractAnchors(res.html, indexUrl).filter((a) => {
        try {
          const u = new URL(a.href)
          if (u.host !== new URL(indexUrl).host) return false
          return /\/(projects?|groups?|spaces?|labs?|nodes?|posts?)\/[^/]+/i.test(u.pathname)
        } catch {
          return false
        }
      })
      if (!anchors.length) {
        notes.push(
          'sphere.diybio.org index exposed no project/group anchor in server-rendered markup; content page stays the index.',
        )
        return null
      }
      const pick = anchors[0]!
      return {
        url: pick.href.split('#')[0] ?? pick.href,
        note: `Selected from the index listing ${indexUrl}: first project/group anchor in the server-rendered markup${
          pick.text ? ` (link text ${JSON.stringify(pick.text.slice(0, 100))})` : ''
        }.`,
      }
    }
    case 'wiki.biohack.me': {
      const candidate = site.content
      const res = await politeFetch(candidate, { purpose: 'verify the candidate article exists' })
      const sameUrl = res.finalUrl.replace(/#.*$/, '') === candidate
      if (
        res.status === 200 &&
        res.body &&
        sameUrl &&
        !/There is currently no text in this page/i.test(res.body)
      ) {
        return {
          url: candidate,
          note: `Registry candidate verified: HTTP 200, <title> ${JSON.stringify(extractTitle(res.body) ?? '')}.`,
        }
      }
      notes.push(
        `Candidate article ${candidate} -> HTTP ${res.status ?? 'no response'}${
          res.status === 200 && !sameUrl
            ? ` but redirected to ${res.finalUrl}, so that article does not exist`
            : ''
        }; picking another article.`,
      )
      const list =
        'https://wiki.biohack.me/api.php?action=query&list=allpages&aplimit=20&apnamespace=0&apfilterredir=nonredirects&format=json'
      const apiRes = await politeFetch(list, {
        purpose: 'pick another article (MediaWiki allpages)',
        accept: 'application/json',
      })
      if (apiRes.status !== 200 || !apiRes.body) {
        notes.push(
          `MediaWiki allpages -> HTTP ${apiRes.status ?? 'no response'}; no MediaWiki API exists here.`,
        )
        const alreadyFetched = [
          termsHtmlCache.get(site.key),
          indexHtmlCache.get(indexUrl)?.html,
          res.body,
        ].filter((h): h is string => Boolean(h))
        for (const html of alreadyFetched) {
          const anchors = extractAnchors(html, indexUrl).filter((a) => {
            try {
              const u = new URL(a.href)
              if (u.host !== new URL(indexUrl).host) return false
              const id = u.searchParams.get('id') ?? ''
              return (
                Boolean(id) &&
                !/^(start|wiki:|sidebar|.*:start$)/i.test(id) &&
                !u.searchParams.get('do')
              )
            } catch {
              return false
            }
          })
          if (anchors.length) {
            const pick = anchors[0]!
            return {
              url: pick.href.split('#')[0] ?? pick.href,
              note: `Registry candidate ${candidate} redirects to the wiki start page, so that article does not exist, and this wiki serves no MediaWiki API (api.php returned HTTP ${apiRes.status ?? 'no response'}). Replaced with the first article link on a page already fetched${
                pick.text ? ` (link text ${JSON.stringify(pick.text.slice(0, 100))})` : ''
              }: ${pick.href.split('#')[0] ?? pick.href}.`,
            }
          }
        }
        notes.push(
          'No article anchor was found on any page already fetched; the content page stays the index.',
        )
        return {
          url: indexUrl,
          note: `Registry candidate ${candidate} redirects to the wiki start page and no article link was discoverable without further fetching; the content page is the wiki start page ${indexUrl}.`,
        }
      }
      try {
        const json = JSON.parse(apiRes.body) as { query?: { allpages?: Array<{ title: string }> } }
        const pages = json.query?.allpages ?? []
        const pick = pages.find((p) => !/^(Main Page|Sandbox)/i.test(p.title)) ?? pages[0]
        if (!pick) {
          notes.push('MediaWiki allpages returned no article; content page unchanged.')
          return null
        }
        return {
          url: `https://wiki.biohack.me/index.php?title=${encodeURIComponent(pick.title.replace(/ /g, '_'))}`,
          note: `Registry candidate did not resolve; replaced with ${JSON.stringify(pick.title)} chosen from the MediaWiki allpages API (${list}).`,
        }
      } catch (error) {
        notes.push(`MediaWiki allpages JSON parse failed: ${String(error)}`)
        return null
      }
    }
    default:
      return null
  }
}

async function gateSite(site: StudySite): Promise<GateFacts> {
  const dir = dirName(site.key)
  const notes: string[] = []
  const checkedAt = new Date().toISOString()
  let indexUrl = site.index
  let contentUrl = site.content
  let contentNote: string | undefined

  // (4) Longevity Wiki: the canonical host must be verified before anything else.
  if (site.key === 'longevity wiki (url to verify)') {
    const resolved = await resolveLongevityWiki(notes)
    if (resolved) {
      indexUrl = resolved.index
      contentUrl = resolved.index
      contentNote = `Host verified by the legal gate: ${resolved.index} returned HTTP ${resolved.status} with <title> ${JSON.stringify(
        resolved.title ?? '',
      )}. Index and content point at the verified host; a content article is chosen by the capture pass only if the gate allows capture.`
    } else {
      notes.push(
        'No candidate host for the Longevity Wiki resolved; the site is unreachable from here.',
      )
    }
  }

  // (1) robots.txt
  const origin = (() => {
    try {
      return new URL(indexUrl).origin
    } catch {
      return null
    }
  })()
  const robotsUrl = origin ? `${origin}/robots.txt` : `${indexUrl.replace(/\/$/, '')}/robots.txt`
  const robotsRes = await politeFetch(robotsUrl, {
    purpose: 'robots.txt',
    accept: 'text/plain,*/*;q=0.5',
  })
  let robotsSaved: string | null = null
  let robotsIndex: RobotsVerdict = { allowed: null, matched: [], note: '' }
  let robotsContent: RobotsVerdict = { allowed: null, matched: [], note: '' }
  let crawlDelay: string | null = null
  let sitemaps: string[] = []
  const indexPath = pathAndQuery(indexUrl)
  const contentPathInitial = pathAndQuery(contentUrl)

  if (robotsRes.status === 200 && robotsRes.body !== null) {
    robotsSaved = path.join(LEGAL_DIR, `${dir}.robots.txt`)
    await fs.writeFile(robotsSaved, robotsRes.body, 'utf8')
    const parsed = parseRobots(robotsRes.body)
    robotsIndex = evaluateRobots(parsed, indexPath)
    robotsContent = evaluateRobots(parsed, contentPathInitial)
    sitemaps = parsed.sitemaps
    for (const group of parsed.groups) {
      const kinds = group.agents.map(agentApplies).filter((k) => k !== null)
      if (kinds.length && group.crawlDelay) crawlDelay = group.crawlDelay
    }
  } else if (robotsRes.status === 404 || robotsRes.status === 410) {
    robotsIndex = {
      allowed: true,
      matched: [],
      note: `robots.txt returned HTTP ${robotsRes.status}; no rules exist, so nothing is disallowed`,
    }
    robotsContent = { ...robotsIndex }
  } else {
    robotsIndex = {
      allowed: null,
      matched: [],
      note: `robots.txt could not be read (HTTP ${robotsRes.status ?? 'no response'}${robotsRes.error ? `, ${robotsRes.error}` : ''})`,
    }
    robotsContent = { ...robotsIndex }
  }

  // (2) terms of service
  const candidatesTried: GateFacts['terms']['candidatesTried'] = []
  let termsUrl: string | null = null
  let termsStatus: number | null = null
  let termsHtml: string | null = null
  let foundViaIndexLink = false
  let accepted = false

  for (const candidate of site.termsCandidates) {
    const res = await politeFetch(candidate, { purpose: 'terms of service candidate' })
    const textLen = res.body ? htmlToText(res.body).length : 0
    const isTermsDoc = res.body ? looksLikeTermsDoc(res.finalUrl, res.body) : false
    const rejection =
      res.status !== 200
        ? ''
        : textLen < 400
          ? `HTTP 200 but only ${textLen} characters of text extracted; kept looking`
          : !isTermsDoc
            ? `HTTP 200${res.redirected ? ` (redirected to ${res.finalUrl})` : ''} but neither the URL nor the <title> ${JSON.stringify(
                (res.body ? extractTitle(res.body) : null) ?? '',
              )} identifies it as a terms, conditions, legal, copyright or disclaimer document; kept looking and held it only as a fallback`
            : ''
    candidatesTried.push({
      url: candidate,
      status: res.status,
      ...(rejection ? { note: rejection } : {}),
    })
    if (res.status === 200 && res.body && textLen >= 400 && isTermsDoc) {
      termsUrl = res.finalUrl
      termsStatus = res.status
      termsHtml = res.body
      accepted = true
      break
    }
    if (res.status === 200 && res.body && !termsHtml) {
      // keep as a fallback if nothing better appears
      termsUrl = res.finalUrl
      termsStatus = res.status
      termsHtml = res.body
    }
  }

  if (!accepted) {
    const fallbackUrl = termsUrl
    const idx = await fetchIndexOnce(indexUrl, 'index page, once, to find a terms link', dir)
    if (idx.html) {
      const anchors = extractAnchors(idx.html, idx.url)
      const hit = anchors.find((a) => /terms|conditions|legal/i.test(a.text))
      if (hit) {
        foundViaIndexLink = true
        notes.push(
          `No terms candidate returned usable text, so the index page was fetched once and the first anchor whose text matches /terms|conditions|legal/i was followed: ${JSON.stringify(
            hit.text.slice(0, 80),
          )} -> ${hit.href}.`,
        )
        const res = await politeFetch(hit.href, { purpose: 'terms page found via index link' })
        candidatesTried.push({
          url: hit.href,
          status: res.status,
          note: 'discovered on the index page',
        })
        if (res.status === 200 && res.body) {
          termsUrl = res.finalUrl
          termsStatus = res.status
          termsHtml = res.body
          accepted = true
        }
      } else {
        notes.push('The index page exposed no anchor whose text matches /terms|conditions|legal/i.')
      }
    } else {
      notes.push(`The index page could not be fetched (HTTP ${idx.status ?? 'no response'}).`)
    }
    if (!accepted && fallbackUrl) {
      notes.push(
        `No terms-of-service document was reached. The closest page kept as a fallback is ${fallbackUrl}; it is not a terms document, and its text is what the excerpts below come from.`,
      )
    }
  }

  let termsSaved: string | null = null
  let termsTextSaved: string | null = null
  let termsText = ''
  let excerpts: string[] = []
  if (termsHtml) {
    termsHtmlCache.set(site.key, termsHtml)
    termsSaved = path.join(LEGAL_DIR, `${dir}.terms.html`)
    termsTextSaved = path.join(LEGAL_DIR, `${dir}.terms.txt`)
    await fs.writeFile(termsSaved, termsHtml, 'utf8')
    termsText = htmlToText(termsHtml)
    await fs.writeFile(termsTextSaved, termsText, 'utf8')
    excerpts = extractExcerpts(termsText)
  }
  const forbiddingHits: string[] = []
  for (const sentence of excerpts) {
    if (FORBIDS_RE.some((re) => re.test(sentence))) forbiddingHits.push(sentence)
  }

  // (3) API finding
  const api = await probeApi(site, indexUrl, termsText, notes)

  // (5) one public content page where the registry says so
  const replacement = await selectContentPage(site, indexUrl, api, notes)
  if (replacement) {
    contentUrl = replacement.url
    contentNote = contentNote ? `${contentNote} ${replacement.note}` : replacement.note
  }

  // Re-evaluate robots for the final content path if it changed.
  const contentPath = pathAndQuery(contentUrl)
  if (contentPath !== contentPathInitial && robotsSaved) {
    const parsed = parseRobots(await fs.readFile(robotsSaved, 'utf8'))
    robotsContent = evaluateRobots(parsed, contentPath)
  }

  const reachable =
    robotsRes.status !== null ||
    termsStatus !== null ||
    Boolean(indexHtmlCache.get(indexUrl)?.status)

  // Deterministic candidate decision. A person reviews it in judgements.json before it reaches state.
  let decision: LegalDecision
  let reason: string
  if (!reachable) {
    decision = 'blocked'
    reason = `Host unreachable: robots.txt ${robotsRes.status ?? robotsRes.error ?? 'no response'}; no terms candidate returned a response.`
  } else if (forbiddingHits.length) {
    decision = 'link-only'
    reason = `Terms clause matched a prohibition pattern: ${JSON.stringify((forbiddingHits[0] ?? '').slice(0, 240))}`
  } else if (robotsIndex.allowed === false && robotsContent.allowed === false) {
    decision = 'link-only'
    reason = `robots.txt disallows both study paths: ${robotsIndex.matched.join(' | ') || '(no line recorded)'}`
  } else {
    decision = 'capture'
    reason = `robots.txt allows ${indexPath} and ${contentPath}; no terms clause matched a prohibition pattern across ${excerpts.length} relevant excerpts.`
  }

  const facts: GateFacts = {
    key: site.key,
    track: site.track,
    dir,
    checkedAt,
    indexUrl,
    contentUrl,
    ...(contentNote ? { contentNote } : {}),
    reachable,
    robots: {
      url: robotsUrl,
      httpStatus: robotsRes.status,
      savedTo: robotsSaved ? path.relative(process.cwd(), robotsSaved) : null,
      indexPath,
      contentPath,
      indexAllowed: robotsIndex.allowed,
      contentAllowed: robotsContent.allowed,
      relevantLines: Array.from(new Set([...robotsIndex.matched, ...robotsContent.matched])),
      crawlDelay,
      sitemaps,
      note: [robotsIndex.note, robotsContent.note].filter(Boolean).join(' / '),
    },
    terms: {
      url: termsUrl,
      httpStatus: termsStatus,
      savedTo: termsSaved ? path.relative(process.cwd(), termsSaved) : null,
      textSavedTo: termsTextSaved ? path.relative(process.cwd(), termsTextSaved) : null,
      textChars: termsText.length,
      candidatesTried,
      foundViaIndexLink,
      relevantExcerpts: excerpts,
      forbiddingHits,
    },
    api,
    machineProposal: { decision, reason },
    notes,
  }
  await fs.mkdir(LEGAL_DIR, { recursive: true })
  await fs.writeFile(factsPath(dir), `${JSON.stringify(facts, null, 2)}\n`, 'utf8')
  return facts
}

// ---------------------------------------------------------------------------- self-audit

/**
 * Honesty check on the gate itself. It reads data/design-study/legal/requests.log, groups every
 * request it made by host, fetches each host's robots.txt (the only extra fetch this performs, and
 * one already inside the permitted scope), and reports for every path whether that host's robots.txt
 * allowed the request the gate had already made. A violation is reported, not hidden.
 */
async function auditOwnRequests(): Promise<{
  rows: Array<Record<string, unknown>>
  violations: string[]
}> {
  const log = await fs.readFile(REQUESTS_LOG, 'utf8')
  const byHost = new Map<string, Set<string>>()
  for (const line of log.split(/\r?\n/)) {
    const cols = line.split('\t')
    if (cols.length < 4) continue
    const url = cols[2] ?? ''
    if (!/^https?:\/\//.test(url)) continue
    let u: URL
    try {
      u = new URL(url)
    } catch {
      continue
    }
    if (u.pathname === '/robots.txt') continue
    const set = byHost.get(u.host) ?? new Set<string>()
    set.add(`${u.pathname}${u.search}`)
    byHost.set(u.host, set)
  }

  const rows: Array<Record<string, unknown>> = []
  const violations: string[] = []
  for (const [host, paths] of Array.from(byHost.entries()).sort()) {
    const savedName = `${host.replace(/[^a-z0-9]+/gi, '_')}.robots.txt`
    const savedPath = path.join(LEGAL_DIR, savedName)
    let text: string | null = null
    let status: number | null = null
    try {
      text = await fs.readFile(savedPath, 'utf8')
      status = 200
    } catch {
      const res = await politeFetch(`https://${host}/robots.txt`, {
        purpose: 'self-audit: robots.txt for a host the gate fetched',
        accept: 'text/plain,*/*;q=0.5',
      })
      status = res.status
      if (res.status === 200 && res.body !== null) {
        text = res.body
        await fs.writeFile(savedPath, res.body, 'utf8')
      }
    }
    const absent = text !== null && /^# HTTP (\d+) — no robots\.txt served/.test(text)
    if (text === null && (status === 404 || status === 410)) {
      text = `# HTTP ${status} — no robots.txt served, so no rules exist for this host\n`
      await fs.writeFile(savedPath, text, 'utf8')
    }
    const noRules =
      absent || (text !== null && /^# HTTP (404|410) — no robots\.txt served/.test(text))
    const parsed = text && !noRules ? parseRobots(text) : null
    for (const p of Array.from(paths).sort()) {
      const verdict = parsed
        ? evaluateRobots(parsed, p)
        : noRules
          ? {
              allowed: true as boolean | null,
              matched: [],
              note: 'no robots.txt is served by this host, so no rule disallows this path',
            }
          : {
              allowed: null as boolean | null,
              matched: [],
              note: `robots.txt unreadable (HTTP ${status ?? 'no response'})`,
            }
      rows.push({
        host,
        path: p,
        robotsStatus: status,
        allowed: verdict.allowed,
        matched: verdict.matched,
        note: verdict.note,
      })
      if (verdict.allowed === false) {
        violations.push(
          `${host}${p} — disallowed by that host's robots.txt: ${verdict.matched.join(' | ')}`,
        )
      }
    }
  }
  await fs.writeFile(
    path.join(LEGAL_DIR, 'host-audit.json'),
    `${JSON.stringify({ at: new Date().toISOString(), rows, violations }, null, 2)}\n`,
    'utf8',
  )
  return { rows, violations }
}

// ---------------------------------------------------------------------------- judgements + finalize

interface Judgement {
  summary: string
  licence: string | null
  apiExists?: boolean | null
  apiUrl?: string | null
  apiNote?: string
  decision: LegalDecision
  /** Verbatim clause(s) the decision rests on. */
  clauses: string[]
  reasonPrefix?: string
}

async function readJudgements(): Promise<Record<string, Judgement>> {
  try {
    return JSON.parse(await fs.readFile(JUDGEMENTS_PATH, 'utf8')) as Record<string, Judgement>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

function statusFor(decision: LegalDecision): SiteState['status'] {
  if (decision === 'capture') return 'pending'
  return 'blocked'
}

function shorten(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

/** The table cell: at most two sentences, and one if two would run past 400 characters. */
function twoSentences(summary: string): string {
  const sentences = summary.split(/(?<=\.)\s+/)
  const two = sentences.slice(0, 2).join(' ')
  return two.length > 400 ? shorten(sentences[0] ?? summary, 400) : two
}

function mdCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

async function finalize(keys: string[]): Promise<{ rows: unknown[]; issues: string[] }> {
  const judgements = await readJudgements()
  type Audit = { rows: Array<Record<string, unknown>>; violations: string[] }
  let audit: Audit | null = null
  try {
    audit = JSON.parse(await fs.readFile(path.join(LEGAL_DIR, 'host-audit.json'), 'utf8')) as Audit
  } catch {
    audit = null
  }
  const issues: string[] = []
  const rows: Array<Record<string, unknown>> = []
  const mdRows: string[] = []
  const mdNotes: string[] = []

  for (const key of keys) {
    const facts = await readFacts(dirName(key))
    if (!facts) {
      issues.push(`${key}: no facts file; run the fetch pass first`)
      continue
    }
    const judgement = judgements[key]
    if (!judgement) {
      issues.push(`${key}: no reviewed judgement in legal/judgements.json; state not written`)
      continue
    }

    // Re-evaluate robots.txt from the saved file, so the published verdict is reproducible from
    // what is on disk and any disagreement with the fetch pass is reported rather than hidden.
    let relevantLines = facts.robots.relevantLines
    let robotsNote = facts.robots.note
    if (facts.robots.savedTo) {
      const parsed = parseRobots(
        await fs.readFile(path.resolve(process.cwd(), facts.robots.savedTo), 'utf8'),
      )
      const again = {
        index: evaluateRobots(parsed, facts.robots.indexPath),
        content: evaluateRobots(parsed, facts.robots.contentPath),
      }
      if (
        again.index.allowed !== facts.robots.indexAllowed ||
        again.content.allowed !== facts.robots.contentAllowed
      ) {
        issues.push(
          `${key}: re-evaluating the saved robots.txt disagrees with the fetch pass (index ${again.index.allowed} vs ${facts.robots.indexAllowed}, content ${again.content.allowed} vs ${facts.robots.contentAllowed})`,
        )
      }
      relevantLines = Array.from(new Set([...again.index.matched, ...again.content.matched]))
      if (!relevantLines.length) {
        const applicable = parsed.groups.filter((g) =>
          g.agents.some((a) => agentApplies(a) !== null),
        )
        relevantLines = applicable.map(
          (g) =>
            `# applicable group "User-agent: ${g.agents.join(', ')}" holds ${g.rules.length} rule(s), none matching these two paths${
              g.rules.length
                ? `; e.g. ${g.rules
                    .slice(0, 3)
                    .map((r) => r.line)
                    .join(' | ')}`
                : ''
            }`,
        )
        if (!applicable.length)
          relevantLines = ['# no group in this robots.txt applies to our user agent or to *']
      }
      robotsNote = [
        facts.robots.note,
        'verdicts re-derived from the saved robots.txt during finalize',
      ]
        .filter(Boolean)
        .join('; ')
    }
    const reason = `${judgement.reasonPrefix ? `${judgement.reasonPrefix} ` : ''}${judgement.clauses
      .map((c) => `"${shorten(c, 300)}"`)
      .join(' ')} — proposed by legal gate`
      .replace(/\s+/g, ' ')
      .trim()

    const gate: LegalGate = {
      checkedAt: facts.checkedAt,
      robots: {
        url: facts.robots.url,
        httpStatus: facts.robots.httpStatus,
        savedTo: facts.robots.savedTo,
        indexAllowed: facts.robots.indexAllowed,
        contentAllowed: facts.robots.contentAllowed,
        relevantLines,
        ...(robotsNote || facts.robots.crawlDelay || facts.robots.sitemaps.length
          ? {
              note: [
                robotsNote,
                facts.robots.crawlDelay ? `Crawl-delay: ${facts.robots.crawlDelay}` : '',
                facts.robots.sitemaps.length
                  ? `Sitemap: ${facts.robots.sitemaps.slice(0, 3).join(', ')}`
                  : '',
                `paths evaluated: ${facts.robots.indexPath} (index), ${facts.robots.contentPath} (content)`,
              ]
                .filter(Boolean)
                .join('. '),
            }
          : {}),
      },
      terms: {
        url: facts.terms.url,
        httpStatus: facts.terms.httpStatus,
        savedTo: facts.terms.savedTo,
        relevantExcerpts: facts.terms.relevantExcerpts,
        summary: judgement.summary,
      },
      api: {
        exists: judgement.apiExists !== undefined ? judgement.apiExists : facts.api.exists,
        url: judgement.apiUrl !== undefined ? judgement.apiUrl : facts.api.url,
        licence: judgement.licence,
        ...(judgement.apiNote || facts.api.note
          ? { note: judgement.apiNote ?? facts.api.note }
          : {}),
      },
      decision: judgement.decision,
      reason,
    }

    const urls = {
      index: facts.indexUrl,
      content: facts.contentUrl,
      ...(facts.contentNote ? { contentNote: facts.contentNote } : {}),
    }
    await updateSite(key, {
      legalGate: gate,
      urls,
      status: statusFor(judgement.decision),
      ...(judgement.decision === 'capture' ? {} : { reason: shorten(reason, 400) }),
    })

    rows.push({
      key,
      track: facts.track,
      urls,
      robots: {
        url: facts.robots.url,
        httpStatus: facts.robots.httpStatus,
        indexPath: facts.robots.indexPath,
        contentPath: facts.robots.contentPath,
        indexAllowed: facts.robots.indexAllowed,
        contentAllowed: facts.robots.contentAllowed,
        relevantLines,
        crawlDelay: facts.robots.crawlDelay,
      },
      terms: {
        url: facts.terms.url,
        httpStatus: facts.terms.httpStatus,
        savedTo: facts.terms.savedTo,
        excerptCount: facts.terms.relevantExcerpts.length,
        foundViaIndexLink: facts.terms.foundViaIndexLink,
        summary: judgement.summary,
      },
      api: gate.api,
      decision: judgement.decision,
      reason,
      machineProposal: facts.machineProposal,
      notes: facts.notes,
    })

    const robotsCell = `${facts.robots.indexAllowed === null ? 'unknown' : facts.robots.indexAllowed ? 'allowed' : 'DISALLOWED'} / ${
      facts.robots.contentAllowed === null
        ? 'unknown'
        : facts.robots.contentAllowed
          ? 'allowed'
          : 'DISALLOWED'
    }`
    const apiCell = `${gate.api.exists === null ? 'not investigated' : gate.api.exists ? 'yes' : 'no'}${
      gate.api.url ? ` (${gate.api.url})` : ''
    }; licence: ${gate.api.licence ?? 'none stated'}`
    mdRows.push(
      `| ${mdCell(key)} | ${robotsCell} | ${facts.terms.url ? mdCell(facts.terms.url) : 'none found'} | ${mdCell(
        twoSentences(judgement.summary),
      )} | ${mdCell(apiCell)} | **${judgement.decision}** |`,
    )

    mdNotes.push(
      [
        `### ${key} (${facts.track})`,
        '',
        `- Index: ${facts.indexUrl}`,
        `- Content: ${facts.contentUrl}${facts.contentNote ? `\n- How the content page was chosen: ${facts.contentNote}` : ''}`,
        `- robots.txt: ${facts.robots.url} — HTTP ${facts.robots.httpStatus ?? 'no response'}; index path \`${facts.robots.indexPath}\` ${
          facts.robots.indexAllowed === null
            ? 'unknown'
            : facts.robots.indexAllowed
              ? 'allowed'
              : 'DISALLOWED'
        }, content path \`${facts.robots.contentPath}\` ${
          facts.robots.contentAllowed === null
            ? 'unknown'
            : facts.robots.contentAllowed
              ? 'allowed'
              : 'DISALLOWED'
        }${facts.robots.crawlDelay ? `; Crawl-delay ${facts.robots.crawlDelay}` : ''}${
          facts.robots.sitemaps.length
            ? `; Sitemap ${facts.robots.sitemaps.slice(0, 3).join(', ')}`
            : ''
        }.`,
        relevantLines.length
          ? `- Verbatim robots lines relied on:\n${relevantLines.map((l) => `  - \`${l}\``).join('\n')}`
          : '- Verbatim robots lines relied on: none matched these paths.',
        `- Terms: ${facts.terms.url ?? 'none reached'}${
          facts.terms.url ? ` — HTTP ${facts.terms.httpStatus ?? 'no response'}` : ''
        }${
          facts.terms.url && facts.terms.foundViaIndexLink
            ? ' (found by following a terms link on the index page, fetched once)'
            : ''
        }; ${
          facts.terms.relevantExcerpts.length
        } relevant verbatim excerpts saved to \`${facts.terms.textSavedTo ?? 'nothing saved'}\`.`,
        `- Every terms URL tried, in order: ${
          facts.terms.candidatesTried.length
            ? facts.terms.candidatesTried
                .map(
                  (c) =>
                    `${c.url} → HTTP ${c.status ?? 'no response'}${c.note ? ` (${c.note})` : ''}`,
                )
                .join('; ')
            : 'none — the registry lists no terms candidate for this site'
        }.`,
        `- What the terms say about what this phase requires: ${judgement.summary}`,
        `- API: ${gate.api.exists === null ? 'not investigated' : gate.api.exists ? 'exists' : 'none reachable'}${
          gate.api.url ? ` — ${gate.api.url}` : ''
        }. Licence as stated: ${gate.api.licence ?? 'none stated'}.${gate.api.note ? ` ${gate.api.note}` : ''}`,
        `- Decision: **${judgement.decision}** — ${reason}`,
        judgement.clauses.length
          ? `- Verbatim clauses relied on:\n${judgement.clauses.map((c) => `  - "${c}"`).join('\n')}`
          : '- Verbatim clauses relied on: none — either no terms text was readable, or none of it restricts this phase; the HTTP statuses and robots lines above are the evidence.',
        facts.notes.length ? `- Gate notes:\n${facts.notes.map((n) => `  - ${n}`).join('\n')}` : '',
        '',
      ]
        .filter((l) => l !== '')
        .join('\n'),
    )
  }

  await fs.writeFile(
    GATE_JSON,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        userAgent: UA,
        requestsLog: path.relative(process.cwd(), REQUESTS_LOG),
        selfAudit: audit ? { paths: audit.rows.length, violations: audit.violations } : null,
        sites: rows,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  const md = [
    '# Legal and ethical gate — Track A1 and A2',
    '',
    `Generated ${new Date().toISOString()} by \`scripts/design-study/legal-gate.ts\`. User agent: \`${UA}\`.`,
    'Fetched per site: robots.txt, the terms-of-service page, and for A2 sites the API root or API',
    'documentation page plus the one listing or API query needed to pick a single public content page.',
    'No forum thread was fetched. Every request is logged in `data/design-study/legal/requests.log`.',
    "Every decision below is **proposed by the legal gate** and awaits the orchestrator's independent confirmation.",
    '',
    '| site | robots index/content | terms URL | what the terms say | API + licence | decision |',
    '| --- | --- | --- | --- | --- | --- |',
    ...mdRows,
    '',
    '## Per-site notes',
    '',
    ...mdNotes,
    "## Self-audit of the gate's own requests",
    '',
    audit
      ? `Every request the gate made was checked against the robots.txt of the host it went to (${audit.rows.length} distinct host+path pairs; see \`data/design-study/legal/host-audit.json\`).${
          audit.violations.length
            ? ` ${audit.violations.length} request(s) the gate had already made were disallowed by that host's robots.txt, reported here rather than left unrecorded:\n\n${audit.violations
                .map((v) => `- ${v}`)
                .join('\n')}`
            : ' No request the gate made was disallowed by the robots.txt of the host it went to.'
        }`
      : 'Not run.',
    '',
  ].join('\n')
  await fs.writeFile(GATE_MD, `${md}\n`, 'utf8')

  return { rows, issues }
}

// ---------------------------------------------------------------------------- CLI

function parseArgs(argv: string[]): {
  all: boolean
  site: string | null
  force: boolean
  status: boolean
  finalizeOnly: boolean
  audit: boolean
} {
  const out = {
    all: false,
    site: null as string | null,
    force: false,
    status: false,
    finalizeOnly: false,
    audit: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? ''
    if (arg === '--all') out.all = true
    else if (arg === '--force') out.force = true
    else if (arg === '--status') out.status = true
    else if (arg === '--finalize') out.finalizeOnly = true
    else if (arg === '--audit') out.audit = true
    else if (arg === '--site') {
      out.site = argv[i + 1] ?? null
      i += 1
    } else if (arg.startsWith('--site=')) out.site = arg.slice('--site='.length)
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const gatedTracks: Track[] = ['A1', 'A2']
const targets = SITES.filter(
  (s) => gatedTracks.includes(s.track) && (args.site ? s.key === args.site : true),
)

if (args.status) {
  const state = await loadState()
  for (const site of targets) {
    const s = state.sites[site.key]
    const gate = s?.legalGate
    console.log(
      `${site.key} [${site.track}] ${gate ? `decision=${gate.decision} robots=${gate.robots.indexAllowed}/${gate.robots.contentAllowed} terms=${gate.terms.url ?? 'none'} excerpts=${gate.terms.relevantExcerpts.length}` : 'ungated'}`,
    )
  }
} else if (args.audit) {
  const { rows, violations } = await auditOwnRequests()
  console.log(JSON.stringify({ paths: rows.length, violations }, null, 2))
} else if (args.finalizeOnly) {
  const { issues } = await finalize(targets.map((s) => s.key))
  console.log(JSON.stringify({ finalized: targets.length - issues.length, issues }, null, 2))
} else {
  if (!args.all && !args.site) {
    console.error('Nothing to do. Pass --all, --site <key>, --finalize or --status.')
    process.exit(2)
  }
  const state = await loadState()
  const summary: Array<Record<string, unknown>> = []
  for (const site of targets) {
    if (state.sites[site.key]?.legalGate && !args.force) {
      console.log(
        `${site.key}: already gated (decision=${state.sites[site.key]!.legalGate!.decision}); skipped`,
      )
      summary.push({ key: site.key, skipped: 'already gated' })
      continue
    }
    if ((await readFacts(dirName(site.key))) && !args.force) {
      console.log(`${site.key}: facts already fetched; skipped (use --force to refetch)`)
      summary.push({ key: site.key, skipped: 'facts already fetched' })
      continue
    }
    const facts = await gateSite(site)
    console.log(
      `${site.key}: robots ${facts.robots.httpStatus ?? 'ERR'} index=${facts.robots.indexAllowed} content=${facts.robots.contentAllowed}; terms ${
        facts.terms.url ?? 'none'
      } (${facts.terms.relevantExcerpts.length} excerpts, ${facts.terms.forbiddingHits.length} prohibition hits); api=${facts.api.exists}; candidate=${facts.machineProposal.decision}`,
    )
    summary.push({
      key: site.key,
      robotsIndexAllowed: facts.robots.indexAllowed,
      robotsContentAllowed: facts.robots.contentAllowed,
      termsUrl: facts.terms.url,
      excerptCount: facts.terms.relevantExcerpts.length,
      apiExists: facts.api.exists,
      candidate: facts.machineProposal.decision,
    })
  }
  console.log(`\nrequestsMade=${requestsMade}`)
  await fs.writeFile(
    path.join(LEGAL_DIR, 'fetch-pass-summary.json'),
    `${JSON.stringify({ at: new Date().toISOString(), requestsMade, summary }, null, 2)}\n`,
    'utf8',
  )
}
