/**
 * Real-browser capture tool for the design study (Phase 3, tracks A1/A2 and the rnawiki baseline).
 *
 * Phase 1 measured computed styles but never looked at the rendered result. This tool produces the
 * images that get looked at: for each site's index and content page, a full-page screenshot and a
 * strip of viewport-sized tiles at 1440x900 and 375x812, three scroll-depth screenshots on the
 * content page, and a block of DOM evidence that later findings must cite whenever they claim a
 * behaviour (command palette, copy buttons, scroll-driven graphics) that a static image only hints
 * at.
 *
 *   npx tsx scripts/design-study/capture.ts --site rnawiki.com
 *   npx tsx scripts/design-study/capture.ts --all [--force]
 *   npx tsx scripts/design-study/capture.ts --track A1
 *   npx tsx scripts/design-study/capture.ts --status
 *
 * Rules this file implements and must keep implementing:
 *   - The legal gate is absolute. A site is captured only when state.json records
 *     `legalGate.decision === 'capture'`; the sole exception is track 'baseline', which is our own
 *     site. Anything else prints "refused <key>: gate=<decision|ungated>" and is skipped.
 *   - Consent banners are declined, never accepted (see banners.ts).
 *   - A bot challenge is never clicked, solved or worked around. It is waited out for 30 s, and if
 *     it stands, one screenshot is kept as evidence, the site is recorded as not captured, and the
 *     run moves on.
 *   - One real Chrome window (channel 'chrome', headful, persistent profile under
 *     data/design-study/chrome-profile/) for the whole run, with a normal fingerprint. Nothing is
 *     spoofed. The profile is this study's own; the user's Chrome profile is never read.
 *   - State is written through updateSite() from state.ts, once per site, after that site is
 *     complete, so an interrupted run loses at most the site in progress and never a written one.
 */
import { chromium, type BrowserContext, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { declineBanners } from './banners.js'
import { dirName, type Track } from './sites.js'
import {
  CAPTURES_DIR,
  DATA_DIR,
  loadState,
  summarize,
  updateSite,
  type CaptureRecord,
  type SiteState,
} from './state.js'

const PROFILE_DIR = path.join(DATA_DIR, 'chrome-profile')

const DESKTOP = { width: 1440, height: 900 } as const
const MOBILE = { width: 375, height: 812 } as const

/**
 * Height ceiling for one rasterized capture surface, in CSS pixels (deviceScaleFactor is 1 here,
 * so a CSS pixel is an image pixel).
 *
 * Chromium's refusal is not a clean geometric limit, so this number is set from what was actually
 * observed rather than from the spec. Measured on the two pages that failed: a fresh browser
 * rasterized 1440x15700, 375x17200 and 375x20771 without complaint, and a synthetic page went to
 * 65000 px, so no fixed ceiling exists at these sizes. But the run recorded in
 * data/design-study/capture-run.log, five sites deep in one tab, rasterized 1440x15700 and then
 * failed with "Page.captureScreenshot: Unable to capture screenshot" at 375x17200 and 375x20771.
 * Under real pressure the ceiling therefore sits somewhere above 15700 and at or below 17200;
 * 16_384 (Chromium's maximum texture dimension) is inside that bracket, above every height that
 * rasterized and below every height that failed, so it stands. What was missing was not a better
 * number but enforcement: the surface is no longer offered to Chromium above this, and a refusal
 * below it is recorded and stepped over instead of ending the site.
 */
const MAX_SURFACE_PX = 16_384

/** Tiles kept from the top of a page, before the "and the last two" rule applies. */
const TILE_HEAD = 12

const CHALLENGE_TITLE = /just a moment|attention required|verify you are human|access denied/i
const CHALLENGE_BODY =
  /verify you are human|verifying you are human|checking your browser|enable javascript and cookies|needs to review the security|ray id/i

const SCROLL_FRACTIONS = [0, 0.5, 0.9] as const

type Role = 'index' | 'content'

interface DomEvidence {
  collectedFrom: string
  collectedAt: string
  viewport: { width: number; height: number }
  title: string
  innerTextLength: number
  outerHtmlLength: number
  textToHtmlRatio: number
  headingOutline: Array<{ tag: string; text: string }>
  headingCount: number
  stickyOrFixedCount: number
  stickyOrFixed: Array<{
    tag: string
    class: string
    position: string
    top: number
    height: number
  }>
  kbdTexts: string[]
  ariaKeyshortcuts: Array<{ tag: string; value: string }>
  copyControls: { count: number; firstLabels: string[] }
  scriptTokens: Record<string, boolean | 'unknown'>
  scriptsInline: number
  scriptsUnreadable: number
  searchAffordances: { count: number; firstDescriptors: string[] }
  imgCount: number
  imgLazyCount: number
  htmlAttributes: { class: string | null; dataTheme: string | null; style: string | null }
  prefersColorScheme: {
    found: boolean
    matchedSheets: number
    unreadableSheets: number
    totalSheets: number
  }
  bodyBackgroundColor: string
  bodyColor: string
  canvasCount: number
  svgCount: number
}

interface PassResult {
  blocked: boolean
  note?: string
  /** One line per capture that could not be taken, carried into the manifest caveats. */
  notes: string[]
  documentHeight: number
  domEvidence?: DomEvidence
}

/* ------------------------------------------------------------------------------------------- *
 * Small file helpers
 * ------------------------------------------------------------------------------------------- */

async function pngSize(file: string): Promise<{ width: number; height: number }> {
  const handle = await fs.open(file, 'r')
  try {
    const buffer = Buffer.alloc(24)
    await handle.read(buffer, 0, 24, 0)
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  } finally {
    await handle.close()
  }
}

async function sha256(file: string): Promise<string> {
  const bytes = await fs.readFile(file)
  return createHash('sha256').update(bytes).digest('hex')
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message.split('\n')[0] ?? error.message
  return String(error)
}

/**
 * Take one screenshot. Returns null on success and the error text on failure, never throwing: a
 * single refused surface must cost one image, not the rest of the site. A half-written file is
 * removed so no manifest record can point at a broken PNG.
 */
async function tryScreenshot(
  page: Page,
  target: string,
  options: Parameters<Page['screenshot']>[0],
): Promise<string | null> {
  try {
    await page.screenshot({ path: target, ...options })
    return null
  } catch (error) {
    await fs.rm(target, { force: true }).catch(() => undefined)
    return errorText(error)
  }
}

/* ------------------------------------------------------------------------------------------- *
 * Page helpers
 * ------------------------------------------------------------------------------------------- */

async function documentHeight(page: Page): Promise<number> {
  return page
    .evaluate(() => {
      const el = document.scrollingElement ?? document.documentElement
      return Math.max(el.scrollHeight, document.body?.scrollHeight ?? 0)
    })
    .catch(() => 0)
}

/** True when the page is showing a bot challenge rather than the site. Never interacts with it. */
async function challengeStanding(page: Page): Promise<{ standing: boolean; title: string }> {
  const title = await page.title().catch(() => '')
  if (CHALLENGE_TITLE.test(title)) return { standing: true, title }
  const bodyHit = await page
    .evaluate((source: string) => {
      const text = (document.body?.innerText ?? '').slice(0, 4_000)
      if (text.replace(/\s+/g, '').length > 1_200) return false
      return new RegExp(source, 'i').test(text)
    }, CHALLENGE_BODY.source)
    .catch(() => false)
  return { standing: bodyHit, title: title || '(no title)' }
}

/**
 * Wait up to 30 s for a challenge to clear on its own. Nothing is clicked; if Cloudflare or a
 * similar gate wants a human it does not get one, and the site is reported as blocked.
 */
async function waitOutChallenge(
  page: Page,
  log: (message: string) => void,
): Promise<{ standing: boolean; title: string }> {
  let latest = await challengeStanding(page)
  if (!latest.standing) return latest
  log(`challenge showing ("${latest.title}"); waiting up to 30 s without touching it`)
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    await page.waitForTimeout(2_500)
    latest = await challengeStanding(page)
    if (!latest.standing) {
      log('challenge cleared on its own')
      return latest
    }
  }
  return latest
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined)
  await page.waitForTimeout(2_000)
}

/* ------------------------------------------------------------------------------------------- *
 * DOM evidence
 * ------------------------------------------------------------------------------------------- */

async function collectDomEvidence(
  page: Page,
  url: string,
  viewport: { width: number; height: number },
): Promise<DomEvidence> {
  const tokens = ['IntersectionObserver', 'scrollama', 'metaKey', 'keyCode']
  const gathered = await page.evaluate(async (searchTokens: string[]) => {
    // See the note in banners.ts: esbuild's keepNames rewrites the named helpers below into
    // `__name(...)` calls, and this callback runs in the page where that helper does not exist.
    const scope = globalThis as unknown as { __name?: (value: unknown, name?: string) => unknown }
    scope.__name ??= (value) => value
    const trim = (value: string, max: number): string =>
      value.replace(/\s+/g, ' ').trim().slice(0, max)

    const doc = document.documentElement
    const innerText = document.body?.innerText ?? ''
    const outerHtml = doc.outerHTML

    const headingNodes = Array.from(document.querySelectorAll('h1, h2, h3'))
    const headingOutline = headingNodes.slice(0, 40).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: trim((el as HTMLElement).innerText || el.textContent || '', 80),
    }))

    const stickyOrFixed: Array<{
      tag: string
      class: string
      position: string
      top: number
      height: number
    }> = []
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const style = window.getComputedStyle(el)
      if (style.position !== 'sticky' && style.position !== 'fixed') continue
      const rect = el.getBoundingClientRect()
      if (stickyOrFixed.length < 40) {
        stickyOrFixed.push({
          tag: el.tagName.toLowerCase(),
          class: trim(el.getAttribute('class') ?? '', 60),
          position: style.position,
          top: Math.round(rect.top * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        })
      } else {
        stickyOrFixed.push({
          tag: '(truncated)',
          class: '',
          position: style.position,
          top: 0,
          height: 0,
        })
        break
      }
    }
    const stickyOrFixedCount = Array.from(document.querySelectorAll('body *')).filter((el) => {
      const position = window.getComputedStyle(el).position
      return position === 'sticky' || position === 'fixed'
    }).length

    const kbdTexts = Array.from(document.querySelectorAll('kbd')).map((el) =>
      trim(el.textContent ?? '', 24),
    )

    const ariaKeyshortcuts = Array.from(document.querySelectorAll('[aria-keyshortcuts]')).map(
      (el) => ({
        tag: el.tagName.toLowerCase(),
        value: trim(el.getAttribute('aria-keyshortcuts') ?? '', 40),
      }),
    )

    const copyRe = /copy/i
    const copyLabels: string[] = []
    for (const el of Array.from(document.querySelectorAll('button, a, [role="button"]'))) {
      const label = `${el.getAttribute('aria-label') ?? ''} ${el.getAttribute('title') ?? ''} ${
        (el as HTMLElement).innerText ?? el.textContent ?? ''
      }`
      if (!copyRe.test(label)) continue
      copyLabels.push(trim(label, 60))
    }

    // Script token search. Inline script text is always readable; a same-origin external script is
    // fetched from cache; a cross-origin script cannot be read, so an unfound token is 'unknown'
    // rather than false.
    let inline = 0
    let unreadable = 0
    const texts: string[] = []
    for (const el of Array.from(document.querySelectorAll('script'))) {
      const src = el.getAttribute('src')
      if (!src) {
        inline += 1
        texts.push(el.textContent ?? '')
        continue
      }
      let absolute: URL
      try {
        absolute = new URL(src, document.baseURI)
      } catch {
        unreadable += 1
        continue
      }
      if (absolute.origin !== window.location.origin) {
        unreadable += 1
        continue
      }
      try {
        const response = await fetch(absolute.href, { credentials: 'same-origin' })
        if (!response.ok) {
          unreadable += 1
          continue
        }
        texts.push(await response.text())
      } catch {
        unreadable += 1
      }
    }
    const haystack = texts.join('\n')
    const scriptTokens: Record<string, boolean | 'unknown'> = {}
    for (const token of searchTokens) {
      if (haystack.includes(token)) scriptTokens[token] = true
      else scriptTokens[token] = unreadable > 0 ? 'unknown' : false
    }

    const searchRe = /search/i
    const searchDescriptors: string[] = []
    const searchSeen = new Set<Element>()
    for (const el of Array.from(
      document.querySelectorAll('input[type="search"], [role="search"]'),
    )) {
      searchSeen.add(el)
      searchDescriptors.push(
        `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} ${trim(
          el.getAttribute('placeholder') ?? el.getAttribute('aria-label') ?? '',
          40,
        )}`.trim(),
      )
    }
    for (const el of Array.from(document.querySelectorAll('input, button, [role="button"]'))) {
      if (searchSeen.has(el)) continue
      const label = `${el.getAttribute('aria-label') ?? ''} ${el.getAttribute('placeholder') ?? ''}`
      if (!searchRe.test(label)) continue
      searchSeen.add(el)
      searchDescriptors.push(`${el.tagName.toLowerCase()} ${trim(label, 40)}`.trim())
    }

    const images = Array.from(document.querySelectorAll('img'))

    let matchedSheets = 0
    let unreadableSheets = 0
    const sheets = Array.from(document.styleSheets)
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules
        let hit = false
        for (const rule of Array.from(rules)) {
          if (rule.cssText.includes('prefers-color-scheme')) {
            hit = true
            break
          }
        }
        if (hit) matchedSheets += 1
      } catch {
        unreadableSheets += 1
      }
    }

    const bodyStyle = document.body ? window.getComputedStyle(document.body) : null

    return {
      title: document.title,
      innerTextLength: innerText.length,
      outerHtmlLength: outerHtml.length,
      headingOutline,
      headingCount: headingNodes.length,
      stickyOrFixedCount,
      stickyOrFixed,
      kbdTexts,
      ariaKeyshortcuts,
      copyControls: { count: copyLabels.length, firstLabels: copyLabels.slice(0, 5) },
      scriptTokens,
      scriptsInline: inline,
      scriptsUnreadable: unreadable,
      searchAffordances: {
        count: searchDescriptors.length,
        firstDescriptors: searchDescriptors.slice(0, 3),
      },
      imgCount: images.length,
      imgLazyCount: images.filter((img) => img.getAttribute('loading') === 'lazy').length,
      htmlAttributes: {
        class: doc.getAttribute('class'),
        dataTheme: doc.getAttribute('data-theme'),
        style: doc.getAttribute('style'),
      },
      prefersColorScheme: {
        found: matchedSheets > 0,
        matchedSheets,
        unreadableSheets,
        totalSheets: sheets.length,
      },
      bodyBackgroundColor: bodyStyle?.backgroundColor ?? '',
      bodyColor: bodyStyle?.color ?? '',
      canvasCount: document.querySelectorAll('canvas').length,
      svgCount: document.querySelectorAll('svg').length,
    }
  }, tokens)

  const ratio =
    gathered.outerHtmlLength > 0 ? gathered.innerTextLength / gathered.outerHtmlLength : 0
  return {
    collectedFrom: url,
    collectedAt: new Date().toISOString(),
    viewport,
    textToHtmlRatio: Math.round(ratio * 10_000) / 10_000,
    ...gathered,
  }
}

/* ------------------------------------------------------------------------------------------- *
 * One pass (one page at one viewport)
 * ------------------------------------------------------------------------------------------- */

interface PassOptions {
  page: Page
  url: string
  role: Role
  viewport: { width: number; height: number }
  dir: string
  reload: boolean
  collectDom: boolean
  push: (record: CaptureRecord) => void
  addBannerActions: (actions: string[]) => void
  log: (message: string) => void
}

async function runPass(options: PassOptions): Promise<PassResult> {
  const { page, url, role, viewport, dir, reload, collectDom, push, addBannerActions, log } =
    options
  const prefix = `${role}-${viewport.width}`
  const notes: string[] = []
  const failed = (what: string, error: string): void => {
    log(`  ${prefix} ${what} failed: ${error}`)
    notes.push(`${prefix}: ${what} was not captured (${error})`)
  }

  await page.setViewportSize(viewport)
  if (reload) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 })
  } else {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  }
  await settle(page)

  const challenge = await waitOutChallenge(page, log)
  if (challenge.standing) {
    const file = `challenge-${viewport.width}.png`
    const target = path.join(dir, file)
    await page.screenshot({ path: target, fullPage: false }).catch(() => undefined)
    try {
      const size = await pngSize(target)
      push({
        file,
        url,
        viewport,
        kind: 'viewport',
        widthPx: size.width,
        heightPx: size.height,
        sha256: await sha256(target),
        capturedAt: new Date().toISOString(),
        note: `bot challenge evidence; not the site: "${challenge.title}"`,
      })
    } catch {
      // The screenshot itself failed; the note below still records the block.
    }
    return { blocked: true, note: `blocked: ${challenge.title}`, notes, documentHeight: 0 }
  }

  const actions = await declineBanners(page, (message) => log(`  ${prefix} ${message}`))
  addBannerActions(actions.map((action) => `${prefix}: ${action}`))

  const height = await documentHeight(page)
  const truncated = height > MAX_SURFACE_PX

  // Full page. Above the cap the whole-page surface is never offered to Chromium: that request is
  // the one that returned "Unable to capture screenshot" and ended two sites. The top cap-height
  // region is clipped instead, so a "full" image still exists, and the record says how tall the
  // document really is and where the image stops.
  const fullFile = `${prefix}-full.png`
  const fullPath = path.join(dir, fullFile)
  const fullError = await tryScreenshot(
    page,
    fullPath,
    truncated
      ? { fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height: MAX_SURFACE_PX } }
      : { fullPage: true },
  )
  if (fullError) {
    failed('full page', fullError)
  } else {
    const fullSize = await pngSize(fullPath)
    push({
      file: fullFile,
      url,
      viewport,
      kind: 'full-page',
      widthPx: fullSize.width,
      heightPx: fullSize.height,
      sha256: await sha256(fullPath),
      capturedAt: new Date().toISOString(),
      ...(truncated
        ? {
            truncated: true,
            note: `document is ${Math.round(
              height,
            )} px tall; this image is the top ${MAX_SURFACE_PX} px, the tallest surface this tool asks Chromium to rasterize. The tiles continue below this point.`,
          }
        : {}),
    })
    log(
      `  ${prefix} full page ${fullSize.width}x${fullSize.height}${truncated ? ` (document ${Math.round(height)} px, truncated)` : ''}`,
    )
  }

  // Tiles: viewport-sized slices of the page. A tile is a small surface whatever its y, so tiling
  // covers the whole document even where the single full-page image had to stop at the cap.
  const step = viewport.height
  const usable = height
  const total = Math.max(1, Math.ceil(usable / step))
  const wanted: number[] = []
  for (let index = 1; index <= Math.min(TILE_HEAD, total); index += 1) wanted.push(index)
  let skipped = 0
  if (total > TILE_HEAD) {
    const tail = [total - 1, total].filter((index) => index > TILE_HEAD)
    skipped = total - TILE_HEAD - tail.length
    wanted.push(...tail)
  }
  let taken = 0
  let scrolledTiles = 0
  for (const index of wanted) {
    const y = (index - 1) * step
    const clipHeight = Math.min(step, usable - y)
    if (clipHeight < 4) continue
    const file = `${prefix}-tile-${String(index).padStart(2, '0')}.png`
    const target = path.join(dir, file)
    const tileNotes: string[] = []
    let error = await tryScreenshot(page, target, {
      fullPage: true,
      clip: { x: 0, y, width: viewport.width, height: clipHeight },
    })
    if (error) {
      // The clipped capture still asks for a beyond-viewport surface. When that is refused, scroll
      // to the tile and shoot the viewport, which only ever needs a viewport-sized surface. The
      // image is then a real scrolled view, so persistent chrome appears again at its top edge.
      log(`  ${prefix} tile ${index} clip refused (${error}); scrolling to ${y} instead`)
      await page.evaluate((target_: number) => window.scrollTo(0, target_), y)
      await page.waitForTimeout(800)
      error = await tryScreenshot(page, target, { fullPage: false })
      if (error) {
        failed(`tile ${index}`, error)
        continue
      }
      tileNotes.push('scrolled viewport, sticky chrome may repeat')
      scrolledTiles += 1
    }
    const size = await pngSize(target)
    if (skipped > 0 && index === total)
      tileNotes.push(`${skipped} tiles between ${TILE_HEAD} and ${total - 2} were not captured`)
    push({
      file,
      url,
      viewport,
      kind: 'tile',
      tileIndex: index,
      scrollY: y,
      widthPx: size.width,
      heightPx: size.height,
      sha256: await sha256(target),
      capturedAt: new Date().toISOString(),
      ...(tileNotes.length > 0 ? { note: tileNotes.join('; ') } : {}),
    })
    taken += 1
  }
  if (scrolledTiles > 0) {
    notes.push(
      `${prefix}: ${scrolledTiles} tile(s) are scrolled viewport views, not slices of one capture`,
    )
    // The tile fallback moved the page; DOM evidence below is documented as read at the top.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
  }
  log(
    `  ${prefix} ${taken} tiles of ${total}${skipped > 0 ? ` (${skipped} skipped)` : ''}${
      scrolledTiles > 0 ? `, ${scrolledTiles} by scrolling` : ''
    }`,
  )

  // DOM evidence, gathered at scroll 0 before the scroll-depth shots move the page.
  let domEvidence: DomEvidence | undefined
  if (collectDom) {
    domEvidence = await collectDomEvidence(page, url, viewport)
    log(
      `  ${prefix} DOM evidence: ${domEvidence.innerTextLength} text / ${domEvidence.outerHtmlLength} html = ${domEvidence.textToHtmlRatio}, ${domEvidence.stickyOrFixedCount} sticky/fixed`,
    )
  }

  // Scroll depths, content page only. These exist to show sticky and persistent chrome, so the
  // page is NOT scrolled back to the top before each shot.
  if (role === 'content') {
    const max = Math.max(0, height - viewport.height)
    let depths = 0
    for (const fraction of SCROLL_FRACTIONS) {
      const y = Math.round(max * fraction)
      await page.evaluate((target: number) => window.scrollTo(0, target), y)
      await page.waitForTimeout(1_500)
      const file = `${prefix}-scroll-${String(Math.round(fraction * 100)).padStart(2, '0')}.png`
      const target = path.join(dir, file)
      const error = await tryScreenshot(page, target, { fullPage: false })
      if (error) {
        failed(`scroll depth ${Math.round(fraction * 100)}%`, error)
        continue
      }
      const size = await pngSize(target)
      push({
        file,
        url,
        viewport,
        kind: 'viewport',
        scrollY: y,
        scrollFraction: fraction,
        widthPx: size.width,
        heightPx: size.height,
        sha256: await sha256(target),
        capturedAt: new Date().toISOString(),
      })
      depths += 1
    }
    log(`  ${prefix} ${depths} scroll depths of ${max} px scrollable`)
  }

  return { blocked: false, notes, documentHeight: height, ...(domEvidence ? { domEvidence } : {}) }
}

/* ------------------------------------------------------------------------------------------- *
 * One site
 * ------------------------------------------------------------------------------------------- */

interface SiteOutcome {
  captured: boolean
  note?: string
  captureCount: number
}

async function captureSite(
  context: BrowserContext,
  key: string,
  site: SiteState,
): Promise<SiteOutcome> {
  const dir = path.join(CAPTURES_DIR, dirName(key))
  await fs.mkdir(dir, { recursive: true })

  const urls = site.urls
  if (!urls) return { captured: false, note: 'no urls recorded in state.json', captureCount: 0 }

  const captures: CaptureRecord[] = []
  const bannerActions: string[] = []
  const push = (record: CaptureRecord): void => {
    captures.push(record)
  }
  const addBannerActions = (actions: string[]): void => {
    bannerActions.push(...actions)
  }
  const log = (message: string): void => {
    console.log(`[${key}] ${message}`)
  }

  const page = context.pages()[0] ?? (await context.newPage())
  let domEvidence: DomEvidence | undefined
  let note: string | undefined
  const passNotes: string[] = []

  const roles: Array<{ role: Role; url: string }> = [
    { role: 'index', url: urls.index },
    { role: 'content', url: urls.content },
  ]

  for (const { role, url } of roles) {
    log(`${role}: ${url}`)
    const desktop = await runPass({
      page,
      url,
      role,
      viewport: DESKTOP,
      dir,
      reload: false,
      collectDom: role === 'content',
      push,
      addBannerActions,
      log,
    })
    passNotes.push(...desktop.notes)
    if (desktop.blocked) {
      return { captured: false, note: desktop.note, captureCount: captures.length }
    }
    if (desktop.domEvidence) domEvidence = desktop.domEvidence

    const mobile = await runPass({
      page,
      url,
      role,
      viewport: MOBILE,
      dir,
      reload: true,
      collectDom: false,
      push,
      addBannerActions,
      log,
    })
    passNotes.push(...mobile.notes)
    if (mobile.blocked) {
      return { captured: false, note: mobile.note, captureCount: captures.length }
    }
    if (desktop.documentHeight > MAX_SURFACE_PX || mobile.documentHeight > MAX_SURFACE_PX) {
      note = `${role} page is taller than the ${MAX_SURFACE_PX} px capture cap (desktop ${Math.round(
        desktop.documentHeight,
      )} px, mobile ${Math.round(mobile.documentHeight)} px); the -full image stops at the cap, and the tiles continue past it but only under the head-and-tail rule recorded on the last tile`
    }
  }

  const capturedAt = new Date().toISOString()
  // Read by whoever views these images. Each line is a fact about how the capture was taken that a
  // viewer would otherwise misread as a fact about the site.
  const caveats = [
    'Tiles are slices of one full-page capture, not separate scrolled screenshots. Chromium paints sticky and fixed elements where they sat when that capture was taken, so a sticky header or a fixed banner can appear part-way down a tile. Judge persistent chrome from the -scroll-00/-scroll-50/-scroll-90 captures, which are real scrolled viewport views.',
    'The -scroll-* captures are deliberately not scrolled back to the top before shooting; what they show at the top edge is what the page keeps on screen.',
    'Any banner recorded as left standing in bannerActions is present in every image of that pass, overlapping the page.',
  ]
  if (note) caveats.push(note)
  caveats.push(...passNotes)
  const manifest = {
    site: key,
    track: site.track,
    urls,
    capturedAt,
    tool: 'scripts/design-study/capture.ts',
    viewports: { desktop: DESKTOP, mobile: MOBILE },
    caveats,
    bannerActions,
    domEvidence: domEvidence ?? null,
    captures,
  }
  await fs.writeFile(
    path.join(dir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  await updateSite(key, {
    captured: true,
    capturedAt,
    captures,
    bannerActions,
    ...(domEvidence ? { domEvidence: domEvidence as unknown as Record<string, unknown> } : {}),
    // Always written, so a note from an earlier failed attempt cannot survive a good capture.
    captureNote: [note, ...passNotes].filter(Boolean).join('; '),
  })

  const siteNote = [note, ...passNotes].filter(Boolean).join('; ')
  return { captured: true, ...(siteNote ? { note: siteNote } : {}), captureCount: captures.length }
}

/* ------------------------------------------------------------------------------------------- *
 * CLI
 * ------------------------------------------------------------------------------------------- */

interface Args {
  sites: string[]
  all: boolean
  track: Track | null
  force: boolean
  status: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = { sites: [], all: false, track: null, force: false, status: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--site') {
      const value = argv[index + 1]
      if (!value) throw new Error('--site needs a site key')
      args.sites.push(value)
      index += 1
    } else if (arg === '--all') {
      args.all = true
    } else if (arg === '--track') {
      const value = argv[index + 1]
      if (value !== 'A1' && value !== 'A2' && value !== 'baseline')
        throw new Error('--track needs A1, A2 or baseline')
      args.track = value
      index += 1
    } else if (arg === '--force') {
      args.force = true
    } else if (arg === '--status') {
      args.status = true
    } else if (arg !== undefined && arg.length > 0) {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return args
}

async function printStatus(): Promise<void> {
  const state = await loadState()
  console.log(`phase: ${state.phase}`)
  for (const line of summarize(state)) {
    const key = line.split(' [')[0] ?? ''
    const site = state.sites[key]
    const shots = site?.captures?.length ?? 0
    const note = site?.captureNote ? ` note="${site.captureNote}"` : ''
    console.log(`${line} captures=${shots}${note}`)
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (args.status) {
    await printStatus()
    return
  }

  const state = await loadState()
  let keys: string[]
  if (args.sites.length > 0) {
    keys = args.sites
  } else if (args.all) {
    keys = Object.keys(state.sites)
  } else if (args.track) {
    keys = Object.entries(state.sites)
      .filter(([, site]) => site.track === args.track)
      .map(([key]) => key)
  } else {
    console.log('Nothing to do. Pass --site <key>, --all, --track A1|A2|baseline, or --status.')
    return
  }

  const planned: string[] = []
  for (const key of keys) {
    const site = state.sites[key]
    if (!site) {
      console.log(`refused ${key}: not in state.json`)
      continue
    }
    if (site.track !== 'baseline') {
      const decision = site.legalGate?.decision
      if (decision !== 'capture') {
        console.log(`refused ${key}: gate=${decision ?? 'ungated'}`)
        continue
      }
    }
    if (site.captured && !args.force) {
      console.log(
        `already captured ${key} (${site.captures?.length ?? 0} images, ${site.capturedAt ?? 'unknown time'})`,
      )
      continue
    }
    planned.push(key)
  }

  if (planned.length === 0) {
    console.log('No site left to capture.')
    return
  }

  await fs.mkdir(PROFILE_DIR, { recursive: true })
  await fs.mkdir(CAPTURES_DIR, { recursive: true })

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--window-size=1440,900'],
    viewport: { width: DESKTOP.width, height: DESKTOP.height },
    locale: 'en-US',
    colorScheme: 'light',
  })

  let closed = false
  const closeOnce = async (): Promise<void> => {
    if (closed) return
    closed = true
    await context.close().catch(() => undefined)
  }
  const onSigint = (): void => {
    console.log(
      '\ninterrupted; closing the browser (state is written per site, so nothing is lost)',
    )
    void closeOnce().then(() => process.exit(130))
  }
  process.on('SIGINT', onSigint)

  try {
    for (const key of planned) {
      const site = state.sites[key]
      if (!site) continue
      console.log(`--- ${key} [${site.track}] ---`)
      try {
        const outcome = await captureSite(context, key, site)
        if (outcome.captured) {
          console.log(
            `captured ${key}: ${outcome.captureCount} images${outcome.note ? ` (${outcome.note})` : ''}`,
          )
        } else {
          const note = outcome.note ?? 'not captured'
          console.log(`not captured ${key}: ${note}`)
          await updateSite(key, {
            captured: false,
            captureNote: note,
            capturedAt: new Date().toISOString(),
          }).catch((error: unknown) => {
            console.error(`could not record the outcome for ${key}: ${errorText(error)}`)
          })
        }
      } catch (error) {
        const note = `error: ${errorText(error)}`
        console.log(`not captured ${key}: ${note}`)
        await updateSite(key, {
          captured: false,
          captureNote: note,
          capturedAt: new Date().toISOString(),
        }).catch((writeError: unknown) => {
          console.error(`could not record the error for ${key}: ${errorText(writeError)}`)
        })
      }
    }
  } finally {
    process.off('SIGINT', onSigint)
    await closeOnce()
  }
}

await main()
