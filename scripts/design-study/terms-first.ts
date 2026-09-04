/**
 * Read a site's robots.txt and terms page through the real Chrome profile the capture tool uses,
 * for the sites that refuse plain HTTP to the legal gate (Cloudflare-fronted). Nothing else is
 * loaded except, when no terms candidate answers, the site's index page once to find its terms
 * link — the same single page the HTTP gate fetched. Bot challenges are waited out for 30 s and
 * never clicked. Saves data/design-study/legal/<dir>.robots.browser.txt and <dir>.terms.browser.txt,
 * appends to requests.log, and records the outcome in state.sites[key].legalGate.terms with the
 * note "read through the real browser". It decides nothing; the orchestrator reads the texts.
 *
 *   npx tsx scripts/design-study/terms-first.ts --site wikiwand.com
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import { siteByKey, dirName } from './sites.js'
import { loadState, updateSite, DATA_DIR, LEGAL_DIR } from './state.js'

const PROFILE_DIR = path.join(DATA_DIR, 'chrome-profile')
const CHALLENGE_TITLE = /just a moment|attention required|verify you are human|access denied/i

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function logRequest(line: string): Promise<void> {
  await fs.appendFile(path.join(LEGAL_DIR, 'requests.log'), `${new Date().toISOString()} ${line}\n`)
}

async function settle(page: Page): Promise<{ challenge: boolean; title: string }> {
  await page.waitForLoadState('domcontentloaded').catch(() => undefined)
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined)
  const started = Date.now()
  let title = await page.title()
  while (CHALLENGE_TITLE.test(title) && Date.now() - started < 30_000) {
    await page.waitForTimeout(1_500)
    title = await page.title()
  }
  return { challenge: CHALLENGE_TITLE.test(title), title }
}

async function main(): Promise<void> {
  const key = arg('site')
  if (!key) throw new Error('--site <key> is required')
  const site = siteByKey(key)
  const state = await loadState()
  const record = state.sites[key]
  if (!record) throw new Error(`Unknown site ${key}`)
  const dir = dirName(key)
  await fs.mkdir(LEGAL_DIR, { recursive: true })

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--window-size=1440,900'],
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    colorScheme: 'light',
  })
  const page = await context.newPage()
  const outcome: Record<string, unknown> = {
    readThrough: 'real browser (terms-first.ts)',
    at: new Date().toISOString(),
  }
  try {
    const origin = new URL(record.urls?.index ?? site.index).origin

    // 1. robots.txt
    const robotsUrl = `${origin}/robots.txt`
    const robotsResponse = await page
      .goto(robotsUrl, { waitUntil: 'domcontentloaded' })
      .catch(() => null)
    const robotsSettle = await settle(page)
    const robotsText = robotsSettle.challenge
      ? ''
      : await page.evaluate(() => document.body?.innerText ?? '')
    const robotsFile = path.join(LEGAL_DIR, `${dir}.robots.browser.txt`)
    await fs.writeFile(robotsFile, robotsText, 'utf8')
    await logRequest(
      `GET ${robotsUrl} ${robotsResponse?.status() ?? 'n/a'} ${robotsText.length} chars (real browser; challenge=${robotsSettle.challenge}; title="${robotsSettle.title}") -> ${path.relative(process.cwd(), robotsFile)}`,
    )
    outcome.robots = {
      url: robotsUrl,
      status: robotsResponse?.status() ?? null,
      challenge: robotsSettle.challenge,
      title: robotsSettle.title,
      chars: robotsText.length,
      savedTo: path.relative(process.cwd(), robotsFile),
    }
    await page.waitForTimeout(1_500)

    // 2. terms candidates, then the index footer once if none answered
    const tried: Array<{
      url: string
      status: number | null
      challenge: boolean
      title: string
      chars: number
    }> = []
    let termsText = ''
    let termsUrl: string | null = null
    const candidates = [...site.termsCandidates]
    for (const url of candidates) {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => null)
      const s = await settle(page)
      const status = response?.status() ?? null
      const text =
        s.challenge || status === null || status >= 400
          ? ''
          : await page.evaluate(() => document.body?.innerText ?? '')
      tried.push({ url, status, challenge: s.challenge, title: s.title, chars: text.length })
      await logRequest(
        `GET ${url} ${status ?? 'n/a'} ${text.length} chars (real browser; challenge=${s.challenge}; title="${s.title}")`,
      )
      await page.waitForTimeout(1_500)
      if (text.length > 400) {
        termsText = text
        termsUrl = page.url()
        break
      }
    }
    if (!termsText) {
      const indexUrl = record.urls?.index ?? site.index
      const response = await page
        .goto(indexUrl, { waitUntil: 'domcontentloaded' })
        .catch(() => null)
      const s = await settle(page)
      await logRequest(
        `GET ${indexUrl} ${response?.status() ?? 'n/a'} (real browser, to find the terms link only; challenge=${s.challenge}; title="${s.title}")`,
      )
      outcome.indexVisit = {
        url: indexUrl,
        status: response?.status() ?? null,
        challenge: s.challenge,
        title: s.title,
      }
      if (!s.challenge) {
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]'))
            .map((a) => ({
              text: (a.textContent ?? '').trim().slice(0, 80),
              href: (a as HTMLAnchorElement).href,
            }))
            .filter(
              (l) =>
                /terms|conditions|legal/i.test(l.text) ||
                /\/terms|\/legal|conditions/i.test(l.href),
            )
            .slice(0, 10),
        )
        outcome.termsLinksOnIndex = links
        for (const link of links.slice(0, 3)) {
          await page.waitForTimeout(1_500)
          const response2 = await page
            .goto(link.href, { waitUntil: 'domcontentloaded' })
            .catch(() => null)
          const s2 = await settle(page)
          const status = response2?.status() ?? null
          const text =
            s2.challenge || status === null || status >= 400
              ? ''
              : await page.evaluate(() => document.body?.innerText ?? '')
          tried.push({
            url: link.href,
            status,
            challenge: s2.challenge,
            title: s2.title,
            chars: text.length,
          })
          await logRequest(
            `GET ${link.href} ${status ?? 'n/a'} ${text.length} chars (real browser, via index link "${link.text}"; challenge=${s2.challenge})`,
          )
          if (text.length > 400) {
            termsText = text
            termsUrl = page.url()
            break
          }
        }
      }
    }
    const termsFile = path.join(LEGAL_DIR, `${dir}.terms.browser.txt`)
    await fs.writeFile(termsFile, termsText, 'utf8')
    outcome.terms = {
      url: termsUrl,
      tried,
      chars: termsText.length,
      savedTo: termsText ? path.relative(process.cwd(), termsFile) : null,
    }

    const excerptRe =
      /[^.\n]*\b(automat|scrap|crawl|spider|robots?|bots?|harvest|screenshot|reproduc|data[- ]mining|text and data|copy|download|framing|commercial|licen[cs]e|creative commons|CC[ -]BY|public domain)\b[^.\n]*[.\n]/gi
    const excerpts = Array.from(termsText.matchAll(excerptRe))
      .map((m) => m[0].trim().slice(0, 400))
      .slice(0, 40)
    const gate = record.legalGate
    await updateSite(key, {
      legalGate: {
        ...(gate ?? {
          checkedAt: new Date().toISOString(),
          robots: {
            url: robotsUrl,
            httpStatus: null,
            savedTo: null,
            indexAllowed: null,
            contentAllowed: null,
            relevantLines: [],
          },
          terms: { url: null, httpStatus: null, savedTo: null, relevantExcerpts: [], summary: '' },
          api: { exists: null, url: null, licence: null },
          decision: 'blocked',
          reason: 'not yet gated',
        }),
        terms: {
          url: termsUrl ?? gate?.terms.url ?? null,
          httpStatus:
            tried.find((t) => t.url === termsUrl)?.status ?? gate?.terms.httpStatus ?? null,
          savedTo: termsText
            ? path.relative(process.cwd(), termsFile)
            : (gate?.terms.savedTo ?? null),
          relevantExcerpts: termsText ? excerpts : (gate?.terms.relevantExcerpts ?? []),
          summary:
            `${gate?.terms.summary ?? ''} [terms-first.ts: read through the real browser on ${new Date().toISOString().slice(0, 10)}; ${termsText ? `${termsText.length} chars saved from ${termsUrl}` : 'no terms text could be read'}; robots ${robotsSettle.challenge ? 'behind a challenge' : `${robotsText.length} chars saved`}. The orchestrator reads the saved texts and decides.]`.trim(),
        },
      },
    })
    console.log(
      JSON.stringify(
        {
          key,
          robots: outcome.robots,
          terms: { url: termsUrl, chars: termsText.length, tried },
          indexVisit: outcome.indexVisit ?? null,
          termsLinksOnIndex: outcome.termsLinksOnIndex ?? null,
          excerpts: excerpts.length,
        },
        null,
        2,
      ),
    )
  } finally {
    await context.close().catch(() => undefined)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
