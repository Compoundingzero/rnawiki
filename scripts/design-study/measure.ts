/**
 * Phase 1 measurement pass, rebuilt as a real-browser run.
 *
 * The original Phase 1 numbers were produced by a browser pane that was never committed as a
 * script. This rebuilds that pass so any site can be re-measured reproducibly, and writes
 * `data/design-study/<dirName>.json` in the same shape as the committed Phase 1 per-site files
 * (site, fetchedAt, method, pages, stylesheets, typography, spacing, color, layout, navigation,
 * behaviours, measurement, measured).
 *
 *   npx tsx scripts/design-study/measure.ts --site rnawiki.com
 *   npx tsx scripts/design-study/measure.ts --site rnawiki.com --force
 *   npx tsx scripts/design-study/measure.ts --status
 *
 * Rules this file obeys, and must keep obeying:
 *
 *  - A field that cannot be measured is `null` with the reason in a sibling `*Note` field. Never an
 *    estimate, never a plausible-looking default. Phase 1 read fetched stylesheet text; this pass
 *    reads the CSSOM instead, so a cross-origin sheet that refuses `cssRules` produces nulls and a
 *    counted `unreadableSheets` note rather than a guess.
 *  - Consent and cookie banners are DECLINED, never accepted: only controls matching
 *    /reject all|decline|deny|only necessary|dismiss/i are clicked, and never anything matching
 *    /accept|agree|allow|consent|got it|ok/i.
 *  - A bot challenge is never clicked. The run waits up to 30 s for it to clear on its own and
 *    otherwise records `measurement.status = 'blocked'` with the page title and stops.
 *  - A site is refused unless its recorded legal gate decision is 'capture'. The only exception is
 *    track 'baseline' (our own site), which needs no gate.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { chromium, type BrowserContext, type Page } from 'playwright'
import { siteByKey, dirName } from './sites.js'
import { loadState, updateSite, DATA_DIR } from './state.js'

const DESKTOP = { width: 1440, height: 900 } as const
const MOBILE = { width: 375, height: 812 } as const
const PROFILE_DIR = path.join(DATA_DIR, 'chrome-profile-measure')
const CHALLENGE_TITLE =
  /just a moment|attention required|checking your browser|verify you are human|access denied|are you a robot|security check/i
const DECLINE = /reject all|decline|deny|only necessary|dismiss/i
const NEVER_CLICK = /accept|agree|allow|consent|got it|\bok\b/i

/* ------------------------------------------------------------------ CLI */

interface Flags {
  site: string | null
  force: boolean
  status: boolean
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { site: null, force: false, status: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--site') {
      const next = argv[i + 1]
      if (!next) throw new Error('--site needs a site key')
      flags.site = next
      i += 1
    } else if (arg === '--force') flags.force = true
    else if (arg === '--status') flags.status = true
    else if (arg && arg.startsWith('--')) throw new Error(`Unknown flag ${arg}`)
  }
  return flags
}

/* ------------------------------------------------- browser-side collector */

/**
 * Everything measured inside the page, in one pass. The shape is intentionally flat-ish: the Node
 * side rearranges it into the Phase 1 schema, so this function only has to be honest, not tidy.
 */
export interface PageMeasurement {
  url: string
  title: string
  bytes: number
  visibleTextChars: number
  textToHtmlRatio: number
  bodyFontSizePx: number
  readingColumn: ReadingColumn | null
  readingColumnNote: string
  contrast: Record<string, unknown>
  headings: Record<string, unknown>
  chrome: Record<string, unknown>
  toc: Record<string, unknown> | null
  tocNote: string
  search: Record<string, unknown>
  fontStacks: Array<Record<string, unknown>>
  typographyStatic: Record<string, unknown>
  color: Record<string, unknown>
  layout: Record<string, unknown>
  spacing: Record<string, unknown>
  navigation: Record<string, unknown>
  behaviours: Array<{ name: string; basis: string; evidence: string }>
  behavioursNotFound: string[]
  stylesheets: Array<Record<string, unknown>>
  inferred: Record<string, unknown>
  docScrollHeightPx: number
  screensOfScroll: number
  documentScrollWidth: number
  horizontalOverflow: boolean
  menuControl: Record<string, unknown> | null
  consentBanner: Record<string, unknown> | null
}

export interface ReadingColumn {
  containerTag: string
  containerClass: string
  containerSelector: string
  containerWidthPx: number
  containerMaxWidth: string
  paragraphContentWidthPx: number
  paragraphCount: number
  totalCharsInColumn: number
  fontSizePx: string
  lineHeight: string
  lineHeightRatio: number | null
  fontFamily: string
  fullStack: string
  fontWeight: string
  letterSpacing: string
  color: string
  backgroundColor: string | null
  backgroundImage: string | null
  backgroundFrom: string
  backgroundNote: string
  avgGlyphWidthPx: number | null
  avgGlyphWidthNote: string
  charactersPerLine: number | null
  paragraphMarginBottom: string
  longestParagraphChars: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Runs inside the page. No imports, no closures over Node scope. */
function collectInPage(): PageMeasurement {
  /**
   * A cap only so a pathological page cannot hang the run. It is reported alongside the real
   * element count, and every block that walks the inventory says whether it was truncated, because
   * a silently short sticky/fixed inventory is worse than no inventory.
   */
  const MAX_ELEMENTS = 40000

  const desc = (el: Element): string => {
    const cls =
      typeof el.className === 'string' && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 4).join('.')}`
        : ''
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}`
  }
  const text = (el: Element | null): string => (el ? (el.textContent ?? '').trim() : '')
  const attr = (el: Element, name: string): string => (el.getAttribute(name) ?? '').toLowerCase()

  const parseColor = (value: string): { r: number; g: number; b: number; a: number } | null => {
    const m = value.match(/rgba?\(([^)]+)\)/i)
    if (m && m[1]) {
      const parts = m[1].split(/[\s,/]+/).filter((p) => p.length > 0)
      const r = Number(parts[0])
      const g = Number(parts[1])
      const b = Number(parts[2])
      const a = parts[3] === undefined ? 1 : Number(parts[3])
      if ([r, g, b].every((n) => Number.isFinite(n)))
        return { r, g, b, a: Number.isFinite(a) ? a : 1 }
      return null
    }
    const hex = value.trim().match(/^#([0-9a-f]{3,8})$/i)
    if (hex && hex[1]) {
      let h = hex[1]
      if (h.length === 3 || h.length === 4)
        h = h
          .split('')
          .map((c) => c + c)
          .join('')
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }
    return null
  }
  const luminance = (c: { r: number; g: number; b: number }): number => {
    const chan = (v: number): number => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * chan(c.r) + 0.7152 * chan(c.g) + 0.0722 * chan(c.b)
  }
  const contrastOf = (fg: string, bg: string): number | null => {
    const a = parseColor(fg)
    const b = parseColor(bg)
    if (!a || !b) return null
    const l1 = luminance(a)
    const l2 = luminance(b)
    return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100
  }
  const gradientStops = (image: string): string[] => {
    const found = image.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g) ?? []
    const out: string[] = []
    for (const f of found) if (!out.includes(f)) out.push(f)
    return out
  }

  /* ---- element inventory (one walk, reused) ---- */
  const allInDocument = Array.from(document.querySelectorAll<HTMLElement>('*'))
  const all = allInDocument.slice(0, MAX_ELEMENTS)
  const scanTruncated = allInDocument.length > all.length
  const scanNote = scanTruncated
    ? `Only the first ${MAX_ELEMENTS} of ${allInDocument.length} elements were scanned, so element inventories below are incomplete.`
    : `All ${allInDocument.length} elements in the document were scanned.`
  const visible = all.filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })

  /* ---- excluded regions for the reading column ---- */
  const isExcluded = (start: Element): boolean => {
    let el: Element | null = start
    while (el && el !== document.body) {
      const tag = el.tagName.toLowerCase()
      if (tag === 'nav' || tag === 'header' || tag === 'footer' || tag === 'template') return true
      const role = attr(el, 'role')
      if (role === 'dialog' || role === 'banner' || role === 'navigation' || role === 'alertdialog')
        return true
      const blob =
        `${el.id} ${typeof el.className === 'string' ? el.className : ''} ${attr(el, 'aria-label')}`.toLowerCase()
      if (/cookie|consent|onetrust|gdpr|cmp-|newsletter|skip-link|skiplink|analytics/.test(blob))
        return true
      el = el.parentElement
    }
    return false
  }

  /* ---- reading column: largest cluster of <p> by total characters ---- */
  const paragraphs = Array.from(document.querySelectorAll<HTMLParagraphElement>('p')).filter(
    (p) => {
      const r = p.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      if (text(p).length < 40) return false
      return !isExcluded(p)
    },
  )
  const clusters = new Map<Element, HTMLParagraphElement[]>()
  for (const p of paragraphs) {
    const parent = p.parentElement
    if (!parent) continue
    const list = clusters.get(parent)
    if (list) list.push(p)
    else clusters.set(parent, [p])
  }
  let bestContainer: Element | null = null
  let bestParas: HTMLParagraphElement[] = []
  let bestChars = 0
  for (const [container, list] of clusters) {
    const chars = list.reduce((sum, p) => sum + text(p).length, 0)
    if (chars > bestChars) {
      bestChars = chars
      bestContainer = container
      bestParas = list
    }
  }

  let readingColumn: ReadingColumn | null = null
  let readingColumnNote = ''
  if (!bestContainer || bestParas.length === 0) {
    readingColumnNote =
      'No reading column: no visible <p> over 40 characters outside navigation, header, footer, dialog and consent regions.'
  } else {
    const longest = bestParas.reduce((a, b) => (text(b).length > text(a).length ? b : a))
    const cs = getComputedStyle(longest)
    const rect = longest.getBoundingClientRect()
    const padL = parseFloat(cs.paddingLeft) || 0
    const padR = parseFloat(cs.paddingRight) || 0
    const contentWidth = Math.round((rect.width - padL - padR) * 100) / 100
    const containerStyle = getComputedStyle(bestContainer)

    // Background: the first ancestor that paints one, gradient included.
    let bgEl: Element | null = longest
    let backgroundColor: string | null = null
    let backgroundImage: string | null = null
    let backgroundFrom = ''
    let backgroundNote = ''
    while (bgEl) {
      const bs = getComputedStyle(bgEl)
      const parsed = parseColor(bs.backgroundColor)
      const paintsColor = parsed !== null && parsed.a > 0
      const paintsGradient = bs.backgroundImage !== 'none' && /gradient/i.test(bs.backgroundImage)
      if (paintsColor || paintsGradient) {
        backgroundColor = paintsColor ? bs.backgroundColor : null
        backgroundImage = paintsGradient ? bs.backgroundImage : null
        backgroundFrom = `${desc(bgEl)} (first ancestor that paints a background)`
        if (paintsGradient)
          backgroundNote =
            'This ancestor paints a gradient, so a single backgroundColor reading would be wrong; both stops are reported in contrast.'
        break
      }
      bgEl = bgEl.parentElement
    }
    if (!backgroundColor && !backgroundImage) {
      backgroundFrom = 'none — no ancestor up to <html> paints a background'
      backgroundNote =
        'Neither <body> nor <html> paints a background: the visible white is the browser canvas, so any contrast figure depends on it.'
    }

    // Average glyph width from a canvas measurement in the paragraph's own computed font.
    let avgGlyphWidthPx: number | null = null
    let avgGlyphWidthNote = ''
    const sample = text(longest)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx && sample.length > 0) {
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const measured = ctx.measureText(sample).width
        if (measured > 0) {
          avgGlyphWidthPx = Math.round((measured / sample.length) * 100) / 100
          avgGlyphWidthNote = `canvas measureText of the ${sample.length}-character paragraph in font "${ctx.font}"`
        } else avgGlyphWidthNote = 'canvas measureText returned 0 width'
      } else avgGlyphWidthNote = 'no 2d canvas context available'
    } catch (error) {
      avgGlyphWidthNote = `canvas measureText threw: ${String(error)}`
    }

    const fontSizePx = parseFloat(cs.fontSize)
    const lineHeightPx = parseFloat(cs.lineHeight)

    readingColumn = {
      containerTag: bestContainer.tagName.toLowerCase(),
      containerClass: typeof bestContainer.className === 'string' ? bestContainer.className : '',
      containerSelector: desc(bestContainer),
      containerWidthPx: Math.round(bestContainer.getBoundingClientRect().width * 100) / 100,
      containerMaxWidth: containerStyle.maxWidth,
      paragraphContentWidthPx: contentWidth,
      paragraphCount: bestParas.length,
      totalCharsInColumn: bestChars,
      fontSizePx: cs.fontSize,
      lineHeight: cs.lineHeight,
      lineHeightRatio:
        Number.isFinite(lineHeightPx) && Number.isFinite(fontSizePx) && fontSizePx > 0
          ? Math.round((lineHeightPx / fontSizePx) * 100) / 100
          : null,
      fontFamily: (cs.fontFamily.split(',')[0] ?? '').replace(/^["']|["']$/g, '').trim(),
      fullStack: cs.fontFamily,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      backgroundColor,
      backgroundImage,
      backgroundFrom,
      backgroundNote,
      avgGlyphWidthPx,
      avgGlyphWidthNote,
      charactersPerLine:
        avgGlyphWidthPx && avgGlyphWidthPx > 0 ? Math.round(contentWidth / avgGlyphWidthPx) : null,
      paragraphMarginBottom: cs.marginBottom,
      longestParagraphChars: sample.length,
    }
  }

  /* ---- contrast of the reading column over its background ---- */
  const contrast: Record<string, unknown> = {}
  if (!readingColumn) {
    contrast.bodyTextVsBackground = null
    contrast.note = 'No reading column was found, so no body-text contrast was measured.'
  } else if (readingColumn.backgroundImage) {
    const stops = gradientStops(readingColumn.backgroundImage)
    const ratios = stops.map((s) => contrastOf(readingColumn.color, s))
    contrast.bodyTextVsBackground = null
    contrast.bodyTextVsBackgroundNote =
      'The painting ancestor is a gradient, not a flat colour; each stop is reported separately below.'
    contrast.gradientStops = stops.map((s, i) => ({ stop: s, ratio: ratios[i] ?? null }))
    const finite = ratios.filter((r): r is number => typeof r === 'number')
    contrast.pair = `${readingColumn.color} on ${readingColumn.backgroundImage}`
    contrast.passesAA = finite.length > 0 ? finite.every((r) => r >= 4.5) : null
    contrast.passesAAA = finite.length > 0 ? finite.every((r) => r >= 7) : null
  } else if (readingColumn.backgroundColor) {
    const ratio = contrastOf(readingColumn.color, readingColumn.backgroundColor)
    contrast.bodyTextVsBackground = ratio
    contrast.pair = `${readingColumn.color} on ${readingColumn.backgroundColor}`
    contrast.passesAA = ratio === null ? null : ratio >= 4.5
    contrast.passesAAA = ratio === null ? null : ratio >= 7
    if (ratio === null) contrast.note = 'One of the two colours could not be parsed to RGB.'
  } else {
    contrast.bodyTextVsBackground = null
    contrast.bodyTextVsBackgroundNote = readingColumn.backgroundNote
    contrast.pair = `${readingColumn.color} on an unpainted ancestor chain`
    contrast.passesAA = null
    contrast.passesAAA = null
  }

  /* ---- headings ---- */
  const bodyFontSizePx = parseFloat(getComputedStyle(document.body).fontSize) || 16
  const scope: ParentNode = document.querySelector('main') ?? document
  const headingOf = (tag: string): Record<string, unknown> | null => {
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(tag)).filter((h) => {
      const r = h.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && text(h).length > 0
    })
    const el = candidates[0] ?? null
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      family: (cs.fontFamily.split(',')[0] ?? '').replace(/^["']|["']$/g, '').trim(),
      fullStack: cs.fontFamily,
      color: cs.color,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      textSample: text(el).slice(0, 60),
      count: candidates.length,
    }
  }
  const h1 = headingOf('h1')
  const h2 = headingOf('h2')
  const h3 = headingOf('h3')
  const ratioTo = (h: Record<string, unknown> | null): number | null => {
    if (!h) return null
    const px = parseFloat(String(h.fontSize))
    return Number.isFinite(px) && bodyFontSizePx > 0
      ? Math.round((px / bodyFontSizePx) * 100) / 100
      : null
  }
  const bodyPxForRatio = readingColumn ? parseFloat(readingColumn.fontSizePx) : bodyFontSizePx
  const ratioToProse = (h: Record<string, unknown> | null): number | null => {
    if (!h) return null
    const px = parseFloat(String(h.fontSize))
    return Number.isFinite(px) && bodyPxForRatio > 0
      ? Math.round((px / bodyPxForRatio) * 100) / 100
      : null
  }
  const headings: Record<string, unknown> = {
    scope: scope === document ? 'document' : 'main',
    h1,
    h2,
    h3,
    h1Note: h1 ? null : 'No visible h1 with text content inside the measured scope.',
    h2Note: h2 ? null : 'No visible h2 with text content inside the measured scope.',
    h3Note: h3 ? null : 'No visible h3 with text content inside the measured scope.',
    bodyFontSizePx,
    proseFontSizePx: readingColumn ? parseFloat(readingColumn.fontSizePx) : null,
    ratio_h1_body: ratioToProse(h1),
    ratio_h2_body: ratioToProse(h2),
    ratio_h3_body: ratioToProse(h3),
    ratio_h1_documentBody: ratioTo(h1),
    ratioBasis: readingColumn
      ? 'Ratios are computed heading font-size over the measured prose font-size, as in Phase 1.'
      : 'No prose column was found, so ratios fall back to the computed <body> font-size.',
  }

  /* ---- sticky and fixed inventory ---- */
  const pinned = all
    .map((el) => {
      const cs = getComputedStyle(el)
      if (cs.position !== 'sticky' && cs.position !== 'fixed') return null
      const r = el.getBoundingClientRect()
      return {
        selector: desc(el),
        position: cs.position,
        top: cs.top,
        zIndex: cs.zIndex,
        widthPx: Math.round(r.width * 100) / 100,
        heightPx: Math.round(r.height * 100) / 100,
        visible: r.width > 0 && r.height > 0,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  /* ---- header and scrolling ---- */
  const headerEl =
    document.querySelector<HTMLElement>('header') ??
    document.querySelector<HTMLElement>('[role="banner"]')
  const mainEl = document.querySelector<HTMLElement>('main')
  const docScrolls = (document.scrollingElement?.scrollHeight ?? 0) > window.innerHeight + 1
  const mainScrolls = (() => {
    if (!mainEl) return false
    const cs = getComputedStyle(mainEl)
    return (
      (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
      mainEl.scrollHeight > mainEl.clientHeight + 1
    )
  })()
  const navEl = document.querySelector<HTMLElement>('nav')
  const chrome: Record<string, unknown> = {
    headerPresent: headerEl !== null,
    headerSelector: headerEl ? desc(headerEl) : null,
    headerPosition: headerEl ? getComputedStyle(headerEl).position : null,
    headerTop: headerEl ? getComputedStyle(headerEl).top : null,
    headerHeightPx: headerEl
      ? Math.round(headerEl.getBoundingClientRect().height * 100) / 100
      : null,
    headerBackground: headerEl ? getComputedStyle(headerEl).backgroundColor : null,
    headerNote: headerEl ? null : 'No <header> element and no [role="banner"] in the rendered DOM.',
    stickyOrFixedCount: pinned.length,
    stickyOrFixedElements: pinned.slice(0, 30),
    stickyOrFixedNote:
      [
        pinned.length > 30 ? `${pinned.length} pinned boxes found; the first 30 are listed.` : null,
        scanTruncated ? scanNote : null,
      ]
        .filter(Boolean)
        .join(' ') || null,
    elementsInDocument: allInDocument.length,
    elementsScanned: all.length,
    elementScanNote: scanNote,
    documentScrolls: docScrolls,
    mainOwnsScroll: mainScrolls,
    scrollOwnerNote: mainScrolls
      ? '<main> has its own overflow scroll, so the document is not the scroll container.'
      : 'The document scrolls; no <main> overflow container was found.',
    mainCount: document.querySelectorAll('main').length,
    nav: navEl
      ? {
          selector: desc(navEl),
          ariaLabel: navEl.getAttribute('aria-label'),
          position: getComputedStyle(navEl).position,
          widthPx: Math.round(navEl.getBoundingClientRect().width * 100) / 100,
          heightPx: Math.round(navEl.getBoundingClientRect().height * 100) / 100,
          links: navEl.querySelectorAll('a').length,
        }
      : null,
    navCount: document.querySelectorAll('nav').length,
    landmarkCounts: {
      header: document.querySelectorAll('header').length,
      nav: document.querySelectorAll('nav').length,
      main: document.querySelectorAll('main').length,
      aside: document.querySelectorAll('aside').length,
      footer: document.querySelectorAll('footer').length,
      section: document.querySelectorAll('section').length,
      form: document.querySelectorAll('form').length,
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
    },
  }

  /* ---- table of contents ---- */
  let toc: Record<string, unknown> | null = null
  let tocNote = ''
  const tocCandidates = visible
    .map((el) => {
      const hashLinks = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).filter(
        (a) => (a.getAttribute('href') ?? '').length > 1,
      )
      if (hashLinks.length < 3) return null
      const r = el.getBoundingClientRect()
      if (r.width < 80 || r.width > 480) return null
      const cs = getComputedStyle(el)
      const blob =
        `${el.id} ${typeof el.className === 'string' ? el.className : ''} ${attr(el, 'aria-label')}`.toLowerCase()
      const named = /toc|contents|outline|on-this-page|onthispage|chapter|jump/.test(blob)
      const tagOk = ['aside', 'nav'].includes(el.tagName.toLowerCase())
      if (!named && !tagOk && cs.position !== 'sticky' && cs.position !== 'fixed') return null
      return {
        selector: desc(el),
        ariaLabel: el.getAttribute('aria-label'),
        linkCount: hashLinks.length,
        widthPx: Math.round(r.width * 100) / 100,
        position: cs.position,
        top: cs.top,
        namedAsContents: named,
        depth: (() => {
          let d = 0
          let p: Element | null = el
          while (p) {
            d += 1
            p = p.parentElement
          }
          return d
        })(),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
  if (tocCandidates.length > 0) {
    // Prefer the deepest (most specific) container so a wrapping <aside> is not reported instead.
    toc = tocCandidates.reduce((a, b) => (b.depth > a.depth ? b : a))
  } else {
    tocNote =
      'No table of contents: no visible element 80-480px wide holding three or more in-page (#) links, and none labelled contents/outline/on-this-page.'
  }

  /* ---- search ---- */
  const searchInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[type="search"], [role="search"] input, input[name*="search" i], input[id*="search" i], input[placeholder*="search" i], input[aria-label*="search" i]',
    ),
  ).filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
  const searchLabelled = Array.from(
    document.querySelectorAll<HTMLElement>('button, a, [role="button"]'),
  ).filter((el) => {
    const blob = `${text(el)} ${attr(el, 'aria-label')} ${el.id} ${attr(el, 'title')}`.toLowerCase()
    return /search/.test(blob)
  })
  const searchTriggers = searchLabelled.filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
  const searchTriggersHidden = searchLabelled.length - searchTriggers.length
  const kbds = Array.from(document.querySelectorAll<HTMLElement>('kbd')).map((k) => ({
    text: text(k),
    parentSelector: k.parentElement ? desc(k.parentElement) : null,
  }))
  const keyShortcuts = Array.from(
    document.querySelectorAll<HTMLElement>('[aria-keyshortcuts]'),
  ).map((el) => ({
    selector: desc(el),
    value: el.getAttribute('aria-keyshortcuts'),
  }))
  const firstSearchInput = searchInputs[0]
  const firstSearchTrigger = searchTriggers[0]
  const search: Record<string, unknown> = {
    inputPresentAtLoad: searchInputs.length > 0,
    inputCount: searchInputs.length,
    input: firstSearchInput
      ? {
          selector: desc(firstSearchInput),
          placeholder: firstSearchInput.getAttribute('placeholder'),
          ariaLabel: firstSearchInput.getAttribute('aria-label'),
          widthPx: Math.round(firstSearchInput.getBoundingClientRect().width * 100) / 100,
          heightPx: Math.round(firstSearchInput.getBoundingClientRect().height * 100) / 100,
          fontSize: getComputedStyle(firstSearchInput).fontSize,
          type: firstSearchInput.getAttribute('type'),
        }
      : null,
    triggers: searchTriggers.length,
    triggersWithZeroBox: searchTriggersHidden,
    triggersNote:
      searchTriggersHidden > 0
        ? `${searchTriggersHidden} further search-labelled control(s) compute to a zero-size box at this viewport and are not counted as visible triggers.`
        : null,
    trigger: firstSearchTrigger
      ? {
          selector: desc(firstSearchTrigger),
          tag: firstSearchTrigger.tagName.toLowerCase(),
          label:
            text(firstSearchTrigger).slice(0, 60) || firstSearchTrigger.getAttribute('aria-label'),
          widthPx: Math.round(firstSearchTrigger.getBoundingClientRect().width * 100) / 100,
        }
      : null,
    kbdHints: kbds,
    ariaKeyshortcuts: keyShortcuts,
    note:
      searchInputs.length === 0 && searchTriggers.length === 0
        ? 'No visible search input and no control whose text, aria-label, id or title contains "search".'
        : null,
  }

  /* ---- font stacks by role ---- */
  const stackFor = (selector: string): { stack: string; from: string } | null => {
    const el = Array.from(document.querySelectorAll<HTMLElement>(selector)).find((e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    })
    if (!el) return null
    return { stack: getComputedStyle(el).fontFamily, from: desc(el) }
  }
  const roleSpecs: Array<{ role: string; selector: string }> = [
    { role: 'body and running prose', selector: 'body' },
    { role: 'the prose paragraph measured for the reading column', selector: 'p' },
    { role: 'first-level heading', selector: 'h1' },
    { role: 'second-level heading', selector: 'h2' },
    { role: 'third-level heading', selector: 'h3' },
    { role: 'code and preformatted text', selector: 'code, pre, kbd, samp' },
    { role: 'buttons and interface controls', selector: 'button, [role="button"]' },
  ]
  const fontStacks: Array<Record<string, unknown>> = []
  for (const spec of roleSpecs) {
    const found = stackFor(spec.selector)
    if (!found) continue
    const existing = fontStacks.find((f) => f.value === found.stack)
    if (existing) {
      existing.role = `${String(existing.role)}; ${spec.role}`
      continue
    }
    fontStacks.push({
      value: found.stack,
      family: (found.stack.split(',')[0] ?? '').replace(/^["']|["']$/g, '').trim(),
      role: spec.role,
      source: 'measured',
      evidence: `computed font-family on ${found.from} (selector ${spec.selector})`,
    })
  }

  /* ---- readable CSSOM: sheets, media queries, custom properties, static tallies ---- */
  const sheets = Array.from(document.styleSheets)
  let unreadableSheets = 0
  const sheetRecords: Array<Record<string, unknown>> = []
  const mediaTexts: string[] = []
  const rootCustomProps = new Map<string, string>()
  const fontSizeTally = new Map<string, number>()
  const lineHeightTally = new Map<string, number>()
  const fontFaceFamilies = new Set<string>()
  let readableRuleCount = 0
  let stickyDeclarations = 0
  let prefersColorSchemeRules = 0

  const walkRules = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      readableRuleCount += 1
      if (rule instanceof CSSMediaRule) {
        mediaTexts.push(rule.conditionText || rule.media.mediaText)
        if (/prefers-color-scheme/i.test(rule.conditionText || rule.media.mediaText))
          prefersColorSchemeRules += 1
        walkRules(rule.cssRules)
        continue
      }
      if (rule instanceof CSSSupportsRule) {
        walkRules(rule.cssRules)
        continue
      }
      const grouping = rule as CSSRule & { cssRules?: CSSRuleList }
      if (grouping.cssRules && !(rule instanceof CSSStyleRule)) {
        walkRules(grouping.cssRules)
        continue
      }
      if (rule instanceof CSSFontFaceRule) {
        const family = rule.style
          .getPropertyValue('font-family')
          .replace(/^["']|["']$/g, '')
          .trim()
        if (family) fontFaceFamilies.add(family)
        continue
      }
      if (rule instanceof CSSStyleRule) {
        const fs = rule.style.getPropertyValue('font-size')
        if (fs) fontSizeTally.set(fs, (fontSizeTally.get(fs) ?? 0) + 1)
        const lh = rule.style.getPropertyValue('line-height')
        if (lh) lineHeightTally.set(lh, (lineHeightTally.get(lh) ?? 0) + 1)
        if (rule.style.getPropertyValue('position') === 'sticky') stickyDeclarations += 1
        if (/(^|,)\s*(:root|html)\b/.test(rule.selectorText)) {
          for (const prop of Array.from(rule.style)) {
            if (prop.startsWith('--'))
              rootCustomProps.set(prop, rule.style.getPropertyValue(prop).trim())
          }
        }
      }
    }
  }

  for (const sheet of sheets) {
    let rules: CSSRuleList | null = null
    let readable = true
    try {
      rules = sheet.cssRules
    } catch {
      readable = false
      unreadableSheets += 1
    }
    let cssTextChars: number | null = null
    if (readable && rules) {
      try {
        cssTextChars = Array.from(rules).reduce((sum, r) => sum + r.cssText.length, 0)
      } catch {
        cssTextChars = null
      }
      walkRules(rules)
    }
    sheetRecords.push({
      url: sheet.href,
      readable,
      ruleCount: readable && rules ? rules.length : null,
      cssTextChars,
      bytes: null,
      bytesNote:
        'Transferred bytes were not measured: Phase 1 read fetched stylesheet files, this pass reads the CSSOM. cssTextChars is the serialized rule text length, which is not the transferred size.',
      readableNote: readable
        ? null
        : 'cssRules threw a SecurityError: a cross-origin stylesheet with no CORS header. Nothing inside it was counted.',
      inline: sheet.href === null,
    })
  }

  // Fallback for custom properties when :root rules are not readable.
  let customPropSource = 'readable :root/html rules in the CSSOM'
  if (rootCustomProps.size === 0) {
    const csm = (
      document.documentElement as unknown as {
        computedStyleMap?: () => Iterable<[string, unknown]>
      }
    ).computedStyleMap
    if (typeof csm === 'function') {
      try {
        for (const [name, value] of csm.call(document.documentElement)) {
          if (name.startsWith('--')) rootCustomProps.set(name, String(value))
        }
        customPropSource = 'CSS Typed OM computedStyleMap() on <html> — no :root rule was readable'
      } catch {
        customPropSource = 'none: no readable :root rule and computedStyleMap() threw'
      }
    } else {
      customPropSource = 'none: no readable :root rule and computedStyleMap() is unavailable'
    }
  }

  /* ---- breakpoints ---- */
  const bpTally = new Map<string, { px: number; kind: string; count: number }>()
  for (const mt of mediaTexts) {
    const matches = mt.matchAll(/\((min|max)-width:\s*([0-9.]+)(px|em|rem)\)/gi)
    for (const m of matches) {
      const kind = (m[1] ?? '').toLowerCase()
      const raw = parseFloat(m[2] ?? '')
      const unit = (m[3] ?? 'px').toLowerCase()
      if (!Number.isFinite(raw)) continue
      const px = unit === 'px' ? raw : Math.round(raw * 16)
      const key = `${kind}:${px}`
      const prev = bpTally.get(key)
      if (prev) prev.count += 1
      else bpTally.set(key, { px, kind, count: 1 })
    }
  }
  const breakpoints = Array.from(bpTally.values()).sort((a, b) => b.count - a.count || a.px - b.px)
  const layout: Record<string, unknown> = {
    breakpoints,
    breakpointCount: breakpoints.length,
    breakpointNote:
      breakpoints.length > 0
        ? `Read from ${mediaTexts.length} @media conditions in the readable CSSOM. em/rem widths were converted at the 16px root size. ${unreadableSheets} of ${sheets.length} stylesheets refused cssRules (cross-origin) and contributed nothing.`
        : `No @media width conditions were readable. ${unreadableSheets} of ${sheets.length} stylesheets refused cssRules (cross-origin); the rest declared none.`,
    unreadableSheets,
    totalSheets: sheets.length,
    gridUsage: (() => {
      let grid = 0
      let flex = 0
      for (const el of visible) {
        const d = getComputedStyle(el).display
        if (d === 'grid' || d === 'inline-grid') grid += 1
        if (d === 'flex' || d === 'inline-flex') flex += 1
      }
      return {
        cssGrid: grid > 0,
        flex: flex > 0,
        gridElements: grid,
        flexElements: flex,
        note: 'Counted from computed display on every visible element, not from declarations, because most declarations sit in unreadable or utility-compiled rules.',
      }
    })(),
    contentWidthCandidates: (() => {
      const out: Array<Record<string, unknown>> = []
      const seen = new Set<string>()
      for (const el of visible) {
        const cs = getComputedStyle(el)
        if (cs.maxWidth === 'none' || !cs.maxWidth.endsWith('px')) continue
        const px = parseFloat(cs.maxWidth)
        if (!Number.isFinite(px) || px < 300 || px > 1600) continue
        const key = `${desc(el)}|${cs.maxWidth}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          value: cs.maxWidth,
          selector: desc(el),
          renderedWidthPx: Math.round(el.getBoundingClientRect().width * 100) / 100,
        })
        if (out.length >= 10) break
      }
      return out
    })(),
  }

  /* ---- spacing: inferred base unit ---- */
  const spacingTally = new Map<number, number>()
  let spacingOccurrences = 0
  const props = [
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'rowGap',
    'columnGap',
  ] as const
  for (const el of visible) {
    const cs = getComputedStyle(el)
    for (const prop of props) {
      const raw = cs[prop]
      if (!raw || !raw.endsWith('px')) continue
      const px = parseFloat(raw)
      if (!Number.isFinite(px) || px <= 0) continue
      const rounded = Math.round(px * 100) / 100
      spacingTally.set(rounded, (spacingTally.get(rounded) ?? 0) + 1)
      spacingOccurrences += 1
    }
  }
  const candidateUnits = [16, 12, 10, 8, 6, 5, 4, 3, 2, 1]
  let baseUnit: number | null = null
  let baseUnitShare: number | null = null
  for (const unit of candidateUnits) {
    let weighted = 0
    for (const [value, count] of spacingTally) {
      if (Number.isInteger(value) && value % unit === 0) weighted += count
    }
    const share = spacingOccurrences > 0 ? weighted / spacingOccurrences : 0
    if (share > 0.5) {
      baseUnit = unit
      baseUnitShare = Math.round(share * 1000) / 1000
      break
    }
  }
  const distinctSpacing = Array.from(spacingTally.keys()).sort((a, b) => a - b)
  const spacing: Record<string, unknown> = {
    inferredBaseUnitPx: baseUnit,
    inferredBaseUnitShare: baseUnitShare,
    inferredBaseUnitNote:
      baseUnit === null
        ? `No candidate unit from ${candidateUnits.join('/')}px divided more than half of the ${spacingOccurrences} spacing occurrences, so no base unit is claimed.`
        : `Largest unit dividing the majority of spacing occurrences, weighted by occurrence: ${baseUnit}px covers ${Math.round((baseUnitShare ?? 0) * 1000) / 10}% of ${spacingOccurrences} computed margin/padding/gap values over ${visible.length} visible elements. Candidates tried, largest first: ${candidateUnits.join(', ')}px.`,
    method:
      'Every non-zero px margin, padding, row-gap and column-gap on every visible element, read from computed style (not from declarations, which are mostly in utility-compiled or unreadable rules), tallied by value and weighted by occurrence.',
    occurrences: spacingOccurrences,
    distinctValueCount: distinctSpacing.length,
    distinctValues: distinctSpacing.slice(0, 40),
    multiplesUsed: distinctSpacing.filter((v) => Number.isInteger(v) && v % 4 === 0),
    nonMultiplesOf4: distinctSpacing
      .filter((v) => !Number.isInteger(v) || v % 4 !== 0)
      .slice(0, 40),
    topValues: Array.from(spacingTally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([value, count]) => ({ px: value, count })),
    largeStepsForLongText: distinctSpacing.filter((v) => v >= 16 && v <= 96),
  }

  /* ---- colour ---- */
  const colorTally = new Map<string, number>()
  for (const el of visible) {
    const hasOwnText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0,
    )
    if (!hasOwnText) continue
    const c = getComputedStyle(el).color
    colorTally.set(c, (colorTally.get(c) ?? 0) + 1)
  }
  const bodyCs = getComputedStyle(document.body)
  let pageBackground = bodyCs.backgroundColor
  let pageBackgroundFrom = 'body'
  if ((parseColor(pageBackground)?.a ?? 0) === 0) {
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor
    if ((parseColor(htmlBg)?.a ?? 0) > 0) {
      pageBackground = htmlBg
      pageBackgroundFrom = 'html'
    } else {
      pageBackgroundFrom = 'neither body nor html paints one'
    }
  }
  const htmlEl = document.documentElement
  const themeAttrs = ['data-theme', 'data-color-scheme', 'data-mode', 'data-appearance']
  const themeAttr =
    themeAttrs.find((a) => htmlEl.hasAttribute(a) || document.body.hasAttribute(a)) ?? null
  const themeClass = [
    ...(typeof htmlEl.className === 'string' ? htmlEl.className.split(/\s+/) : []),
    ...(typeof document.body.className === 'string' ? document.body.className.split(/\s+/) : []),
  ].filter((c) => /^(dark|light|theme-|scheme-)/.test(c))
  const themeToggle = Array.from(
    document.querySelectorAll<HTMLElement>('button, a, [role="button"], input'),
  ).find((el) => {
    const blob =
      `${text(el)} ${attr(el, 'aria-label')} ${el.id} ${attr(el, 'title')} ${attr(el, 'name')}`.toLowerCase()
    return /theme|dark mode|light mode|appearance|colour scheme|color scheme/.test(blob)
  })
  let darkModeMechanism: string
  let darkModeEvidence: string
  if (prefersColorSchemeRules > 0) {
    darkModeMechanism = 'prefers-color-scheme'
    darkModeEvidence = `${prefersColorSchemeRules} @media (prefers-color-scheme: …) blocks in the readable CSSOM.`
  } else if (themeAttr || themeClass.length > 0 || themeToggle) {
    darkModeMechanism = 'class/attribute'
    darkModeEvidence = [
      themeAttr
        ? `attribute ${themeAttr}="${htmlEl.getAttribute(themeAttr) ?? document.body.getAttribute(themeAttr) ?? ''}"`
        : null,
      themeClass.length > 0 ? `theme class(es) ${themeClass.join(' ')} on html/body` : null,
      themeToggle ? `a theme control: ${desc(themeToggle)}` : null,
      unreadableSheets > 0
        ? `${unreadableSheets} unreadable sheet(s) were not searched for prefers-color-scheme`
        : null,
    ]
      .filter(Boolean)
      .join('; ')
  } else {
    darkModeMechanism = 'none'
    darkModeEvidence = `No prefers-color-scheme block in ${sheets.length - unreadableSheets} readable stylesheet(s), no theme attribute or theme class on html/body, and no control labelled theme/dark mode/appearance.${unreadableSheets > 0 ? ` ${unreadableSheets} cross-origin sheet(s) could not be searched.` : ''}`
  }
  const contrastLadder = Array.from(colorTally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({
      value,
      elementsWithOwnText: count,
      onBackground: pageBackground,
      ratio: contrastOf(value, pageBackground),
      passesAA: (() => {
        const r = contrastOf(value, pageBackground)
        return r === null ? null : r >= 4.5
      })(),
      passesAAA: (() => {
        const r = contrastOf(value, pageBackground)
        return r === null ? null : r >= 7
      })(),
    }))
  const color: Record<string, unknown> = {
    customProperties: Array.from(rootCustomProps.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value })),
    customPropertyCount: rootCustomProps.size,
    customPropertySource: customPropSource,
    customPropertyNote:
      unreadableSheets > 0
        ? `${unreadableSheets} of ${sheets.length} stylesheets are cross-origin and refused cssRules, so any tokens declared only there are absent from this list.`
        : null,
    bodyTextColorCandidate: bodyCs.color,
    backgroundCandidate: (parseColor(pageBackground)?.a ?? 0) > 0 ? pageBackground : null,
    backgroundCandidateFrom: pageBackgroundFrom,
    backgroundCandidateNote:
      (parseColor(pageBackground)?.a ?? 0) > 0
        ? null
        : 'Neither body nor html paints a background; the visible ground is the browser canvas.',
    contrastRatioCandidate: contrastOf(bodyCs.color, pageBackground),
    contrastLadder,
    contrastLadderNote:
      'The distinct computed text colours on the page, ranked by how many visible elements carry their own text node in that colour; ratios are against the page background above.',
    darkModeMechanism,
    darkModeEvidence,
  }

  /* ---- navigation ---- */
  const revealedOnDemand = Array.from(
    document.querySelectorAll<HTMLElement>('[aria-expanded], [aria-controls], details > summary'),
  )
    .slice(0, 30)
    .map((el) => ({
      selector: desc(el),
      ariaExpanded: el.getAttribute('aria-expanded'),
      ariaControls: el.getAttribute('aria-controls'),
      label: (text(el).slice(0, 50) || el.getAttribute('aria-label')) ?? null,
      widthPx: Math.round(el.getBoundingClientRect().width * 100) / 100,
      heightPx: Math.round(el.getBoundingClientRect().height * 100) / 100,
    }))
  const navigation: Record<string, unknown> = {
    persistentElements: [
      headerEl
        ? `${desc(headerEl)} at ${getComputedStyle(headerEl).position}, ${Math.round(headerEl.getBoundingClientRect().height)}px tall, top ${getComputedStyle(headerEl).top}`
        : null,
      navEl
        ? `${desc(navEl)}${navEl.getAttribute('aria-label') ? ` aria-label="${navEl.getAttribute('aria-label')}"` : ''} with ${navEl.querySelectorAll('a').length} links, position ${getComputedStyle(navEl).position}`
        : null,
      ...pinned
        .filter((p) => p.visible)
        .map((p) => `${p.selector} {position:${p.position}; top:${p.top}}`),
    ].filter((x): x is string => typeof x === 'string'),
    stickyOrFixedSelectors: pinned.map((p) => `${p.selector} {position:${p.position}}`),
    stickyDeclarationsInReadableCss: stickyDeclarations,
    tocPresent: toc !== null,
    toc,
    tocEvidence:
      toc === null
        ? tocNote
        : `Found ${String(toc.linkCount)} in-page links in ${String(toc.selector)}.`,
    revealedOnDemand,
    evidence:
      'Landmarks, aria attributes and link counts read from the rendered DOM; positions and heights from computed style and getBoundingClientRect at this viewport.',
  }

  /* ---- behaviours ---- */
  const inlineScriptText = Array.from(document.querySelectorAll('script:not([src])'))
    .map((s) => s.textContent ?? '')
    .join('\n')
  const scriptSrcs = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).map(
    (s) => s.src,
  )
  const behaviours: Array<{ name: string; basis: string; evidence: string }> = []
  const behavioursNotFound: string[] = []

  const commandPaletteKbd = kbds.find(
    (k) => /⌘|cmd|ctrl/i.test(k.text) || /^k$/i.test(k.text.trim()),
  )
  const commandPaletteShortcut = keyShortcuts.find((k) =>
    /meta\+k|control\+k|cmd\+k/i.test(k.value ?? ''),
  )
  const metaKeyInScript = /metaKey/.test(inlineScriptText)
  if (commandPaletteKbd || commandPaletteShortcut) {
    behaviours.push({
      name: 'command palette',
      basis: 'observed',
      evidence: [
        commandPaletteKbd
          ? `<kbd> reading "${commandPaletteKbd.text}" inside ${commandPaletteKbd.parentSelector ?? 'unknown parent'}`
          : null,
        commandPaletteShortcut
          ? `aria-keyshortcuts="${commandPaletteShortcut.value ?? ''}" on ${commandPaletteShortcut.selector}`
          : null,
        metaKeyInScript ? 'inline script text contains metaKey' : null,
      ]
        .filter(Boolean)
        .join('; '),
    })
  } else if (metaKeyInScript) {
    behaviours.push({
      name: 'command palette',
      basis: 'inferred',
      evidence:
        'An inline script references metaKey, but no <kbd> hint and no aria-keyshortcuts attribute is rendered, so the shortcut is not announced to the reader.',
    })
  } else {
    behavioursNotFound.push(
      `command palette (⌘K): no <kbd> containing ⌘/cmd/ctrl/K, no aria-keyshortcuts, and no metaKey reference in ${inlineScriptText.length} characters of inline script; ${scriptSrcs.length} external scripts were not fetched`,
    )
  }

  const copyButtons = Array.from(
    document.querySelectorAll<HTMLElement>('button, [role="button"]'),
  ).filter((el) => {
    const blob = `${text(el)} ${attr(el, 'aria-label')} ${attr(el, 'title')} ${el.id}`.toLowerCase()
    return /copy|clipboard/.test(blob) || el.hasAttribute('data-copy')
  })
  if (copyButtons.length > 0) {
    behaviours.push({
      name: 'copy buttons',
      basis: 'observed',
      evidence: `${copyButtons.length} control(s) labelled copy/clipboard, first ${desc(copyButtons[0] as Element)}`,
    })
  } else {
    behavioursNotFound.push(
      'copy buttons: no button or [role=button] whose text, aria-label, title or id mentions copy or clipboard, and no [data-copy] attribute',
    )
  }

  const stickyStages = pinned.filter((p) => p.position === 'sticky' && p.visible)
  const ioInScripts = /IntersectionObserver/.test(inlineScriptText)
  if (ioInScripts || stickyStages.length > 0) {
    behaviours.push({
      name: 'scroll-driven graphics',
      basis: ioInScripts ? 'observed' : 'inferred',
      evidence: [
        ioInScripts ? 'IntersectionObserver appears in inline script text' : null,
        stickyStages.length > 0
          ? `${stickyStages.length} visible position:sticky box(es): ${stickyStages
              .slice(0, 3)
              .map((s) => s.selector)
              .join(', ')}`
          : null,
        `${scriptSrcs.length} external scripts were not fetched, so a bundled observer would not be seen`,
      ]
        .filter(Boolean)
        .join('; '),
    })
  } else {
    behavioursNotFound.push(
      `scroll-driven graphics: no IntersectionObserver in inline script text and no visible position:sticky stage; ${scriptSrcs.length} external scripts were not fetched`,
    )
  }

  if (themeToggle) {
    behaviours.push({
      name: 'theme toggle',
      basis: 'observed',
      evidence: `control ${desc(themeToggle)} labelled "${(text(themeToggle).slice(0, 40) || themeToggle.getAttribute('aria-label')) ?? ''}"; dark-mode mechanism measured as ${darkModeMechanism}`,
    })
  } else {
    behavioursNotFound.push(
      'theme toggle: no control whose text, aria-label, title, id or name mentions theme, dark mode, light mode, appearance or colour scheme',
    )
  }

  const searchOverlay = Array.from(
    document.querySelectorAll<HTMLElement>('dialog, [role="dialog"], [aria-modal="true"]'),
  ).find(
    (el) =>
      el.querySelector('input') !== null ||
      /search/.test(
        `${attr(el, 'aria-label')} ${el.id} ${typeof el.className === 'string' ? el.className.toLowerCase() : ''}`,
      ),
  )
  if (searchOverlay) {
    behaviours.push({
      name: 'search overlay',
      basis: 'observed',
      evidence: `dialog ${desc(searchOverlay)} present in the DOM at load, ${searchOverlay.getBoundingClientRect().width}x${searchOverlay.getBoundingClientRect().height} at this viewport`,
    })
  } else if (searchTriggers.length > 0 && searchInputs.length === 0) {
    behaviours.push({
      name: 'search overlay',
      basis: 'inferred',
      evidence: `${searchTriggers.length} search-labelled control(s) but no search input at load, so search is revealed by an action; no dialog element was found in the DOM to confirm what it opens`,
    })
  } else {
    behavioursNotFound.push(
      searchInputs.length > 0
        ? 'search overlay: search is a real input present at load, not a dialog; no dialog or [role=dialog] holding an input was found'
        : 'search overlay: no dialog, [role=dialog] or [aria-modal=true] element and no search-labelled trigger',
    )
  }

  /* ---- inferred stack and inventory ---- */
  const bodyKeys = Object.keys(document.body as unknown as Record<string, unknown>)
  const win = window as unknown as Record<string, unknown>
  const loadedFonts: string[] = []
  try {
    ;(
      document as unknown as { fonts: Set<{ family: string; weight: string; status: string }> }
    ).fonts.forEach((f) => {
      const line = `${f.family} ${f.weight} (${f.status})`
      if (!loadedFonts.includes(line)) loadedFonts.push(line)
    })
  } catch {
    /* document.fonts unavailable */
  }
  const inferred: Record<string, unknown> = {
    react:
      bodyKeys.some((k) => k.startsWith('__react')) ||
      document.querySelector('[data-reactroot]') !== null,
    reactEvidence: bodyKeys.some((k) => k.startsWith('__react'))
      ? 'A __react* key is present on document.body.'
      : 'No __react* key on document.body.',
    nextData: document.getElementById('__NEXT_DATA__') !== null || win.__next !== undefined,
    nextEvidence:
      document.querySelector('script[src*="/_next/"]') !== null
        ? 'Script sources under /_next/ are present.'
        : 'No /_next/ script source found.',
    jquery: win.jQuery !== undefined,
    intersectionObserverInInlineScripts: ioInScripts,
    intersectionObserverNote: `Only inline script text (${inlineScriptText.length} characters) was searched. ${scriptSrcs.length} external scripts were not fetched, so a bundled observer would not be seen.`,
    detailsElements: document.querySelectorAll('details').length,
    dialogElements: document.querySelectorAll('dialog, [role="dialog"]').length,
    tableElements: document.querySelectorAll('table').length,
    figureElements: document.querySelectorAll('figure').length,
    imgElements: document.querySelectorAll('img').length,
    lazyImgElements: document.querySelectorAll('img[loading="lazy"]').length,
    svgElements: document.querySelectorAll('svg').length,
    videoElements: document.querySelectorAll('video').length,
    canvasElements: document.querySelectorAll('canvas').length,
    hoverPreviewMarkerElements: document.querySelectorAll(
      '[title], [data-tooltip], [role="tooltip"]',
    ).length,
    cssCustomPropertiesOnRoot: rootCustomProps.size,
    colorSchemeDeclared: getComputedStyle(document.documentElement).colorScheme || 'normal',
    colorSchemeEvidence: `computed color-scheme on <html>; html attributes: ${
      Array.from(htmlEl.attributes)
        .map((a) => `${a.name}="${a.value.slice(0, 40)}"`)
        .join(' ') || 'none'
    }`,
    fontsLoaded: loadedFonts.slice(0, 20),
    fontFaceFamiliesInReadableCss: Array.from(fontFaceFamilies),
    stylesheetCount: sheets.length,
    unreadableStylesheetCount: unreadableSheets,
    readableCssRuleCount: readableRuleCount,
    scriptCount: scriptSrcs.length + document.querySelectorAll('script:not([src])').length,
    externalScriptCount: scriptSrcs.length,
  }

  /* ---- static typography tallies from readable CSS ---- */
  const typographyStatic: Record<string, unknown> = {
    fontSizes:
      fontSizeTally.size > 0
        ? Array.from(fontSizeTally.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 40)
            .map(([value, count]) => ({ value, count }))
        : null,
    fontSizesNote:
      fontSizeTally.size > 0
        ? `Literal font-size declarations counted across the readable CSSOM. ${unreadableSheets} cross-origin sheet(s) contributed nothing.`
        : `No font-size declaration was readable: ${unreadableSheets} of ${sheets.length} stylesheets refused cssRules.`,
    lineHeights:
      lineHeightTally.size > 0
        ? Array.from(lineHeightTally.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 40)
            .map(([value, count]) => ({ value, count }))
        : null,
    lineHeightsNote:
      lineHeightTally.size > 0
        ? 'Literal line-height declarations counted across the readable CSSOM.'
        : `No line-height declaration was readable: ${unreadableSheets} of ${sheets.length} stylesheets refused cssRules.`,
    fontFaces: fontFaceFamilies.size > 0 ? Array.from(fontFaceFamilies) : null,
    fontFacesNote:
      fontFaceFamilies.size > 0
        ? '@font-face families declared in the readable CSSOM.'
        : 'No @font-face rule was readable; fonts may be loaded from a cross-origin sheet or be system faces.',
    fluidType: null as boolean | null,
    fluidTypeNote:
      'Not measured here. Phase 1 read clamp() occurrences from fetched stylesheet text; the CSSOM reports resolved values, so a fluid declaration cannot be distinguished from a fixed one at a single viewport. Compare the desktop and mobile font sizes below instead: a fractional size that changes with width is fluid.',
  }

  /* ---- mobile-relevant menu control ---- */
  const menuControl = (() => {
    const el = Array.from(
      document.querySelectorAll<HTMLElement>('button, [role="button"], a'),
    ).find((c) => {
      const r = c.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0 || r.top > 200) return false
      const blob = `${attr(c, 'aria-label')} ${c.id} ${typeof c.className === 'string' ? c.className.toLowerCase() : ''} ${attr(c, 'title')}`
      return (
        /menu|hamburger|nav-toggle|navtoggle|open nav|toggle nav/.test(blob) ||
        c.hasAttribute('aria-expanded')
      )
    })
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      selector: desc(el),
      ariaLabel: el.getAttribute('aria-label'),
      ariaExpanded: el.getAttribute('aria-expanded'),
      widthPx: Math.round(r.width * 100) / 100,
      heightPx: Math.round(r.height * 100) / 100,
      y: Math.round(r.top * 100) / 100,
      note: el.getAttribute('aria-label') ? null : 'The control carries no aria-label.',
    }
  })()

  /* ---- consent banner, if one is still on the page ---- */
  const consentBanner = (() => {
    const el = visible.find((c) => {
      const named = /cookie|consent|onetrust|gdpr|cmp/.test(
        `${c.id} ${typeof c.className === 'string' ? c.className : ''} ${attr(c, 'aria-label')}`.toLowerCase(),
      )
      const pinned = ['fixed', 'sticky'].includes(getComputedStyle(c).position)
      const saysSo = /cookie|analytics choices|privacy choices|your privacy/i.test(
        text(c).slice(0, 200),
      )
      // A container is only called a notice if it is named one, or is pinned to the viewport and
      // says so in its own opening text. Matching on text alone promotes any wrapper that happens
      // to contain the words.
      if (!named && !(pinned && saysSo)) return false
      const r = c.getBoundingClientRect()
      return r.width > 200 && r.height > 40
    })
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      selector: desc(el),
      widthPx: Math.round(r.width * 100) / 100,
      heightPx: Math.round(r.height * 100) / 100,
      yPx: Math.round(r.top * 100) / 100,
      zIndex: cs.zIndex,
      position: cs.position,
      openingText: text(el).slice(0, 160),
      note: 'Still on the page after the decline pass. Nothing was accepted.',
    }
  })()

  const html = document.documentElement.outerHTML
  const innerText = document.body.innerText ?? ''
  const docScrollHeight = document.scrollingElement?.scrollHeight ?? document.body.scrollHeight

  return {
    url: location.href,
    title: document.title,
    bytes: html.length,
    visibleTextChars: innerText.length,
    textToHtmlRatio:
      html.length > 0 ? Math.round((innerText.length / html.length) * 10000) / 10000 : 0,
    bodyFontSizePx,
    readingColumn,
    readingColumnNote,
    contrast,
    headings,
    chrome,
    toc,
    tocNote,
    search,
    fontStacks,
    typographyStatic,
    color,
    layout,
    spacing,
    navigation,
    behaviours,
    behavioursNotFound,
    stylesheets: sheetRecords,
    inferred,
    docScrollHeightPx: docScrollHeight,
    screensOfScroll: Math.round((docScrollHeight / window.innerHeight) * 100) / 100,
    documentScrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    menuControl,
    consentBanner,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* --------------------------------------------------- browser-side helpers */

/** Waits for a bot challenge to clear on its own. Never clicks it. */
async function waitOutChallenge(page: Page): Promise<{ blocked: boolean; title: string }> {
  const deadline = Date.now() + 30_000
  for (;;) {
    const title = await page.title().catch(() => '')
    const challengeMarkup = await page
      .locator(
        '#cf-challenge-running, #challenge-running, iframe[src*="challenges.cloudflare.com"], iframe[src*="recaptcha"], iframe[title*="hCaptcha" i]',
      )
      .count()
      .catch(() => 0)
    if (!CHALLENGE_TITLE.test(title) && challengeMarkup === 0) return { blocked: false, title }
    if (Date.now() > deadline) return { blocked: true, title }
    await page.waitForTimeout(1500)
  }
}

/**
 * Declines a consent banner. Only clicks controls matching DECLINE, and never a control whose text
 * also matches NEVER_CLICK. Returns the actions taken, for the record.
 */
async function declineBanners(page: Page): Promise<string[]> {
  const actions: string[] = []
  const CONSENT_SCOPE =
    '[class*="cookie" i] , [class*="consent" i], [id*="cookie" i], [id*="consent" i], [class*="onetrust" i], [id*="onetrust" i], [class*="analytics" i], [aria-label*="cookie" i], [aria-label*="consent" i]'
  const CONTROL = 'button, a[role="button"], [role="button"], input[type="button"]'
  // Controls inside a consent-looking container first, then a bounded sweep of the whole page: on a
  // long page the notice's own buttons can sit far past any small global cap.
  const controls = page.locator(
    `${CONSENT_SCOPE.split(',')
      .map((s) => `${s.trim()} ${CONTROL}`)
      .join(', ')}, ${CONTROL}`,
  )
  const total = await controls.count().catch(() => 0)
  const count = Math.min(total, 400)
  if (total > count)
    actions.push(`scanned the first ${count} of ${total} controls for a decline control`)
  const offered: string[] = []
  const inConsentScope: boolean[] = []
  let scopedCount = 0
  for (let i = 0; i < count; i += 1) {
    // Asked per control, in the page, because a notice is often recognisable only by being pinned
    // to the viewport and saying so in its own text — not by a class or id an attribute selector
    // could match.
    inConsentScope[i] = await controls
      .nth(i)
      .evaluate((el) => {
        let node: Element | null = el
        while (node) {
          const named = /cookie|consent|onetrust|gdpr|cmp/.test(
            `${node.id} ${typeof node.className === 'string' ? node.className : ''} ${node.getAttribute('aria-label') ?? ''}`.toLowerCase(),
          )
          const pinned = ['fixed', 'sticky'].includes(getComputedStyle(node).position)
          const saysSo = /cookie|analytics choices|privacy choices|your privacy|we use/i.test(
            (node.textContent ?? '').slice(0, 200),
          )
          if (named || (pinned && saysSo)) return true
          node = node.parentElement
        }
        return false
      })
      .catch(() => false)
    if (inConsentScope[i] === true) scopedCount += 1
  }
  for (let i = 0; i < count; i += 1) {
    const control = controls.nth(i)
    let label = ''
    try {
      label = (
        (await control.innerText({ timeout: 500 })) ||
        (await control.getAttribute('aria-label')) ||
        ''
      ).trim()
    } catch {
      continue
    }
    if (!label || label.length > 60) continue
    if (inConsentScope[i] === true) offered.push(label)
    if (NEVER_CLICK.test(label)) continue
    if (!DECLINE.test(label)) continue
    if (!(await control.isVisible().catch(() => false))) continue
    try {
      await control.click({ timeout: 2000 })
      actions.push(`clicked "${label}"`)
      await page.waitForTimeout(600)
    } catch {
      actions.push(`could not click "${label}"`)
    }
  }
  if (offered.length > 0)
    actions.push(
      `${scopedCount} control(s) sit inside a consent or privacy notice and offered: ${offered.map((o) => `"${o}"`).join(', ')}`,
    )
  if (!actions.some((a) => a.startsWith('clicked')))
    actions.push(
      offered.length > 0
        ? 'none of those matched /reject all|decline|deny|only necessary|dismiss/i, so nothing was clicked and nothing was accepted'
        : 'no decline control found; nothing was clicked and nothing was accepted',
    )
  return actions
}

async function measurePage(
  context: BrowserContext,
  url: string,
  viewport: { width: number; height: number },
): Promise<{
  result: PageMeasurement | null
  httpStatus: number | null
  blocked: boolean
  title: string
  bannerActions: string[]
  error: string | null
}> {
  const page = await context.newPage()
  try {
    await page.setViewportSize(viewport)
    const response = await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
    const httpStatus = response?.status() ?? null
    const challenge = await waitOutChallenge(page)
    if (challenge.blocked) {
      return {
        result: null,
        httpStatus,
        blocked: true,
        title: challenge.title,
        bannerActions: [],
        error: null,
      }
    }
    const bannerActions = await declineBanners(page)
    await page.waitForTimeout(800)
    await page.evaluate(() => document.fonts.ready.then(() => undefined)).catch(() => undefined)
    await page.waitForTimeout(400)
    const result = (await page.evaluate(collectInPage)) as PageMeasurement
    return {
      result,
      httpStatus,
      blocked: false,
      title: challenge.title,
      bannerActions,
      error: null,
    }
  } catch (error) {
    return {
      result: null,
      httpStatus: null,
      blocked: false,
      title: '',
      bannerActions: [],
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    await page.close()
  }
}

/* ------------------------------------------------------------------ main */

function readingColumnBlock(m: PageMeasurement, measuredOn: string): Record<string, unknown> {
  if (!m.readingColumn) return { measuredOn, column: null, note: m.readingColumnNote }
  return { measuredOn, ...m.readingColumn }
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2))
  const state = await loadState()

  if (flags.status) {
    const lines: string[] = []
    for (const [key, site] of Object.entries(state.sites)) {
      const file = path.join(DATA_DIR, `${dirName(key)}.json`)
      let fileStatus = 'no file'
      try {
        const parsed = JSON.parse(await fs.readFile(file, 'utf8')) as {
          measured?: { status?: string }
        }
        fileStatus = parsed.measured?.status ?? 'file present, no measured.status'
      } catch {
        /* no file */
      }
      lines.push(
        `${key} [${site.track}] gate=${site.legalGate ? site.legalGate.decision : 'ungated'} measured=${site.measured === true} file=${fileStatus}`,
      )
    }
    console.log(lines.join('\n'))
    return
  }

  if (!flags.site)
    throw new Error('Pass --site <key> (or --status). This tool measures one site at a time.')
  const site = siteByKey(flags.site)
  const siteState = state.sites[site.key]
  if (!siteState) throw new Error(`Site ${site.key} is not in state.json`)

  if (site.track !== 'baseline') {
    if (!siteState.legalGate) {
      console.error(`REFUSED ${site.key}: no legal gate recorded. Run the legal gate first.`)
      process.exitCode = 1
      return
    }
    if (siteState.legalGate.decision !== 'capture') {
      console.error(
        `REFUSED ${site.key}: legal gate decision is '${siteState.legalGate.decision}', not 'capture'. Reason on record: ${siteState.legalGate.reason}`,
      )
      process.exitCode = 1
      return
    }
  }

  const outPath = path.join(DATA_DIR, `${dirName(site.key)}.json`)
  if (!flags.force) {
    try {
      const existing = JSON.parse(await fs.readFile(outPath, 'utf8')) as {
        measured?: { status?: string }
      }
      if (existing.measured?.status === 'measured') {
        console.log(`already measured: ${outPath} (pass --force to re-measure)`)
        return
      }
    } catch {
      /* no usable file; measure */
    }
  }

  const urls = siteState.urls ?? { index: site.index, content: site.content }
  console.log(`measuring ${site.key}\n  index:   ${urls.index}\n  content: ${urls.content}`)

  await fs.mkdir(PROFILE_DIR, { recursive: true })
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled'],
    locale: 'en-US',
    viewport: { width: DESKTOP.width, height: DESKTOP.height },
  })

  /**
   * tsx compiles this file with esbuild's keep-names transform, which wraps every named function in
   * a `__name(fn, "name")` call. `page.evaluate` ships the collector's compiled source into the
   * page, where that helper does not exist, so it is defined here before any page script runs. It
   * is an identity function and nothing in the measurement reads it; the alternative would be to
   * eval a rewritten source string in the page, which a content-security policy can block.
   */
  await context.addInitScript(() => {
    const g = globalThis as unknown as { __name?: unknown }
    if (typeof g.__name !== 'function') g.__name = (fn: unknown) => fn
  })

  const notes: string[] = []
  const bannerActions: string[] = []
  try {
    const contentDesktop = await measurePage(context, urls.content, DESKTOP)
    bannerActions.push(...contentDesktop.bannerActions.map((a) => `content @1440: ${a}`))

    if (contentDesktop.blocked) {
      const blockedRecord = {
        site: site.key,
        fetchedAt: new Date().toISOString(),
        status: 'blocked',
        method: 'Playwright real Chrome (channel chrome), computed styles via page.evaluate',
        pages: [
          {
            url: urls.content,
            status: 'blocked',
            httpStatus: contentDesktop.httpStatus,
            title: contentDesktop.title,
          },
        ],
        stylesheets: null,
        typography: null,
        spacing: null,
        color: null,
        layout: null,
        navigation: null,
        behaviours: [],
        measurement: {
          status: 'blocked',
          notes: [
            `A bot challenge did not clear within 30 s. document.title = "${contentDesktop.title}". The widget was never clicked and nothing was measured.`,
          ],
          browserPass: {
            tool: 'Playwright real Chrome (channel chrome), computed styles via page.evaluate',
            desktopViewport: { w: DESKTOP.width, h: DESKTOP.height },
            mobileViewport: { w: MOBILE.width, h: MOBILE.height },
            date: new Date().toISOString().slice(0, 10),
            notes: 'Stopped at the challenge. No field below is measured; all are null.',
          },
        },
        measured: {
          status: 'blocked',
          reason: `Bot challenge unresolved after 30 s: "${contentDesktop.title}"`,
          desktop: null,
          mobile: null,
        },
      }
      await fs.writeFile(outPath, `${JSON.stringify(blockedRecord, null, 2)}\n`, 'utf8')
      console.log(`blocked: wrote ${outPath}`)
      await updateSite(site.key, {
        status: 'blocked',
        reason: `Measurement blocked by a bot challenge: "${contentDesktop.title}"`,
        measured: false,
      })
      return
    }
    if (!contentDesktop.result) {
      throw new Error(
        `Could not measure ${urls.content}: ${contentDesktop.error ?? 'unknown error'}`,
      )
    }
    const cd = contentDesktop.result

    const contentMobile = await measurePage(context, urls.content, MOBILE)
    bannerActions.push(...contentMobile.bannerActions.map((a) => `content @375: ${a}`))
    const cm = contentMobile.result
    if (!cm)
      notes.push(
        `The 375x812 pass on the content page failed: ${contentMobile.error ?? 'unknown error'}.`,
      )

    const indexDesktop = await measurePage(context, urls.index, DESKTOP)
    bannerActions.push(...indexDesktop.bannerActions.map((a) => `index @1440: ${a}`))
    const id = indexDesktop.result
    if (!id)
      notes.push(
        `The 1440x900 pass on the index page failed: ${indexDesktop.error ?? 'unknown error'}.`,
      )

    const indexMobile = await measurePage(context, urls.index, MOBILE)
    bannerActions.push(...indexMobile.bannerActions.map((a) => `index @375: ${a}`))
    const im = indexMobile.result
    if (!im)
      notes.push(
        `The 375x812 pass on the index page failed: ${indexMobile.error ?? 'unknown error'}.`,
      )

    const contentPath = new URL(urls.content).pathname
    const indexPath = new URL(urls.index).pathname

    notes.push(
      `Both viewports were measured in one real Chrome profile (${PROFILE_DIR}), headful, with automation flags suppressed. No page was scrolled before measuring, so every rect is the at-load position.`,
    )
    notes.push(
      'One identity function, globalThis.__name, is injected before each page load: the collector is compiled by esbuild with keep-names, which references that helper. It changes no style, no layout and no measured field.',
    )
    if (cd.consentBanner)
      notes.push(
        `A consent banner was still on the content page after the decline pass: ${JSON.stringify(cd.consentBanner)}`,
      )
    notes.push(
      `Consent handling: ${bannerActions.join(' | ')}. Only /reject all|decline|deny|only necessary|dismiss/i controls are ever clicked; nothing matching /accept|agree|allow|consent|got it|ok/i is touched.`,
    )
    if (cd.layout.unreadableSheets !== 0)
      notes.push(
        `${String(cd.layout.unreadableSheets)} of ${String(cd.layout.totalSheets)} stylesheets on the content page refused cssRules (cross-origin, no CORS header). Every field that Phase 1 read from fetched stylesheet text is null with that reason rather than estimated.`,
      )
    notes.push(
      'typography.fluidType is null on purpose: the CSSOM reports resolved values, so clamp() cannot be seen at a single viewport. The desktop/mobile font sizes in `measured` answer the same question by observation.',
    )
    notes.push(
      `Stylesheet transferred bytes are null: this pass reads the CSSOM rather than fetching each sheet. cssTextChars is the serialized rule length and is not the transferred size.`,
    )
    if (cd.readingColumn === null)
      notes.push(`No reading column on the content page: ${cd.readingColumnNote}`)
    if (id && id.readingColumn === null)
      notes.push(`No reading column on the index page: ${id.readingColumnNote}`)

    const record = {
      site: site.key,
      fetchedAt: new Date().toISOString(),
      method:
        'Real-browser pass. Playwright launchPersistentContext with Google Chrome (channel "chrome"), headful, automation flags suppressed, locale en-US. Every number below is a Chromium computed style, a getBoundingClientRect measurement, a canvas measureText result or a readable CSSOM rule. Nothing is estimated: a field this method cannot reach is null with the reason in a sibling *Note field.',
      pages: [
        {
          url: urls.index,
          role: 'index',
          status: id ? 'measured' : 'failed',
          httpStatus: indexDesktop.httpStatus,
          bytes: id ? id.bytes : null,
          visibleTextChars: id ? id.visibleTextChars : null,
          textToHtmlRatio: id ? id.textToHtmlRatio : null,
          title: id ? id.title : null,
          note: id ? null : `Not measured: ${indexDesktop.error ?? 'unknown error'}`,
        },
        {
          url: urls.content,
          role: 'content',
          status: 'measured',
          httpStatus: contentDesktop.httpStatus,
          bytes: cd.bytes,
          visibleTextChars: cd.visibleTextChars,
          textToHtmlRatio: cd.textToHtmlRatio,
          title: cd.title,
          note: null,
        },
      ],
      stylesheets: cd.stylesheets,
      typography: {
        fontStacks: cd.fontStacks,
        fontSizes: cd.typographyStatic.fontSizes,
        fontSizesNote: cd.typographyStatic.fontSizesNote,
        lineHeights: cd.typographyStatic.lineHeights,
        lineHeightsNote: cd.typographyStatic.lineHeightsNote,
        fontFaces: cd.typographyStatic.fontFaces,
        fontFacesNote: cd.typographyStatic.fontFacesNote,
        headingScale: {
          source: 'measured (computed style at each viewport)',
          desktop: { h1: cd.headings.h1, h2: cd.headings.h2, h3: cd.headings.h3 },
          mobile: cm ? { h1: cm.headings.h1, h2: cm.headings.h2, h3: cm.headings.h3 } : null,
          mobileNote: cm ? null : 'The 375x812 pass failed; no mobile heading scale was measured.',
          ratio_h1_body: cd.headings.ratio_h1_body,
          ratio_h2_body: cd.headings.ratio_h2_body,
          ratio_h3_body: cd.headings.ratio_h3_body,
          ratioBasis: cd.headings.ratioBasis,
        },
        bodyCandidates: cd.readingColumn
          ? {
              fontSize: cd.readingColumn.fontSizePx,
              lineHeight: cd.readingColumn.lineHeight,
              lineHeightRatio: cd.readingColumn.lineHeightRatio,
              fontFamily: cd.readingColumn.fullStack,
              fontWeight: cd.readingColumn.fontWeight,
              letterSpacing: cd.readingColumn.letterSpacing,
              color: cd.readingColumn.color,
              measure: `${cd.readingColumn.paragraphContentWidthPx}px paragraph content width; ${cd.readingColumn.charactersPerLine ?? 'unknown'} characters per line`,
              selectorEvidence: `computed style on the longest paragraph inside ${cd.readingColumn.containerSelector}`,
            }
          : null,
        bodyCandidatesNote: cd.readingColumn ? null : cd.readingColumnNote,
        fluidType: cd.typographyStatic.fluidType,
        fluidTypeNote: cd.typographyStatic.fluidTypeNote,
        fluidTypeObserved:
          cd.readingColumn && cm && cm.readingColumn
            ? cd.readingColumn.fontSizePx !== cm.readingColumn.fontSizePx
              ? `Body type changes with width: ${cd.readingColumn.fontSizePx} at 1440px, ${cm.readingColumn.fontSizePx} at 375px. Whether that is clamp() or a breakpoint is not distinguishable from the CSSOM.`
              : `Body type does not move between 1440px and 375px (${cd.readingColumn.fontSizePx} at both).`
            : null,
      },
      spacing: cd.spacing,
      color: cd.color,
      layout: cd.layout,
      navigation: cd.navigation,
      behaviours: cd.behaviours,
      behavioursNotFound: cd.behavioursNotFound,
      measurement: {
        status: 'measured',
        notes,
        browserPass: {
          tool: 'Playwright real Chrome (channel chrome), computed styles via page.evaluate',
          desktopViewport: { w: DESKTOP.width, h: DESKTOP.height },
          mobileViewport: { w: MOBILE.width, h: MOBILE.height },
          date: new Date().toISOString().slice(0, 10),
          notes: `Content page ${contentPath} carries the reading column; index page ${indexPath} is measured separately below. Profile: ${PROFILE_DIR} (its own directory so this can run beside the capture tool).`,
        },
      },
      measured: {
        status: 'measured',
        pagesMeasured: [
          `${urls.index} (index)`,
          `${urls.content} (content page — the reading column is measured here)`,
        ],
        method:
          'Chromium computed styles via Playwright page.evaluate in real Chrome. Desktop 1440x900 then mobile 375x812, each a fresh page load in the same persistent profile.',
        indexPage: id
          ? {
              url: urls.index,
              longestProseBlock: id.readingColumn
                ? {
                    containerSelector: id.readingColumn.containerSelector,
                    widthPx: id.readingColumn.paragraphContentWidthPx,
                    fontSizePx: id.readingColumn.fontSizePx,
                    lineHeight: id.readingColumn.lineHeight,
                    lineHeightRatio: id.readingColumn.lineHeightRatio,
                    family: id.readingColumn.fontFamily,
                    color: id.readingColumn.color,
                    charactersPerLine: id.readingColumn.charactersPerLine,
                    paragraphCount: id.readingColumn.paragraphCount,
                    totalChars: id.readingColumn.totalCharsInColumn,
                    contrast: id.contrast.bodyTextVsBackground,
                    passesAAA: id.contrast.passesAAA,
                  }
                : null,
              longestProseBlockNote: id.readingColumn ? null : id.readingColumnNote,
              headings: { h1: id.headings.h1, h2: id.headings.h2, h3: id.headings.h3 },
              chrome: id.chrome,
              search: id.search,
              toc: id.toc,
              tocReason: id.toc ? null : id.tocNote,
              pageWeight: {
                docScrollHeightPx: id.docScrollHeightPx,
                screensOfScroll: id.screensOfScroll,
                innerTextLength: id.visibleTextChars,
                htmlLength: id.bytes,
                textToHtmlRatio: id.textToHtmlRatio,
              },
              mobile: im
                ? {
                    horizontalOverflow: im.horizontalOverflow,
                    documentScrollWidth: im.documentScrollWidth,
                    docScrollHeightPx: im.docScrollHeightPx,
                    header: {
                      position: im.chrome.headerPosition,
                      heightPx: im.chrome.headerHeightPx,
                      desktopWas: id.chrome.headerHeightPx,
                    },
                    search: im.search,
                    menuControl: im.menuControl,
                    longestProseBlock: im.readingColumn
                      ? {
                          widthPx: im.readingColumn.paragraphContentWidthPx,
                          fontSizePx: im.readingColumn.fontSizePx,
                          charactersPerLine: im.readingColumn.charactersPerLine,
                        }
                      : null,
                  }
                : null,
              mobileNote: im
                ? null
                : `The 375x812 index pass failed: ${indexMobile.error ?? 'unknown error'}`,
            }
          : { url: urls.index, note: `Not measured: ${indexDesktop.error ?? 'unknown error'}` },
        desktop: {
          viewport: { w: DESKTOP.width, h: DESKTOP.height },
          readingColumn: readingColumnBlock(cd, contentPath),
          contrast: cd.contrast,
          headings: { measuredOn: contentPath, ...cd.headings },
          chrome: cd.chrome,
          toc: cd.toc,
          tocReason: cd.toc ? null : cd.tocNote,
          search: cd.search,
          spacing: {
            inferredBaseUnitPx: cd.spacing.inferredBaseUnitPx,
            inferredBaseUnitNote: cd.spacing.inferredBaseUnitNote,
          },
          pageWeight: {
            docScrollHeightPx: cd.docScrollHeightPx,
            screensOfScroll: cd.screensOfScroll,
            innerTextLength: cd.visibleTextChars,
            htmlLength: cd.bytes,
            textToHtmlRatio: cd.textToHtmlRatio,
          },
          consentBanner: cd.consentBanner,
        },
        mobile: cm
          ? {
              viewport: { w: MOBILE.width, h: MOBILE.height },
              measuredOn: contentPath,
              readingColumn: readingColumnBlock(cm, contentPath),
              contrast: cm.contrast,
              headings: { h1: cm.headings.h1, h2: cm.headings.h2, h3: cm.headings.h3 },
              bodyStepsDown:
                cd.readingColumn && cm.readingColumn
                  ? cd.readingColumn.fontSizePx === cm.readingColumn.fontSizePx
                    ? `Body type does not move: ${cd.readingColumn.fontSizePx}/${cd.readingColumn.lineHeight} at 1440px and ${cm.readingColumn.fontSizePx}/${cm.readingColumn.lineHeight} at 375px.`
                    : `${cd.readingColumn.fontSizePx}/${cd.readingColumn.lineHeight} at 1440px becomes ${cm.readingColumn.fontSizePx}/${cm.readingColumn.lineHeight} at 375px.`
                  : null,
              typeScaleChangesAtMobile:
                cd.readingColumn && cm.readingColumn
                  ? cd.readingColumn.fontSizePx !== cm.readingColumn.fontSizePx
                  : null,
              header: {
                position: cm.chrome.headerPosition,
                top: cm.chrome.headerTop,
                heightPx: cm.chrome.headerHeightPx,
                desktopWas: cd.chrome.headerHeightPx,
              },
              menuControl: cm.menuControl,
              navigationCollapse: (() => {
                const desktopNav = cd.chrome.nav as { links?: number; widthPx?: number } | null
                const mobileNav = cm.chrome.nav as { links?: number; widthPx?: number } | null
                if (!desktopNav && !mobileNav) return 'No <nav> element at either width.'
                if (desktopNav && !mobileNav)
                  return `The <nav> is absent from the DOM at 375px; at 1440px it held ${desktopNav.links ?? 0} links.`
                if (!desktopNav && mobileNav)
                  return `A <nav> appears only at 375px, holding ${mobileNav.links ?? 0} links.`
                const dl = desktopNav?.links ?? 0
                const ml = mobileNav?.links ?? 0
                return ml === dl
                  ? `The <nav> keeps all ${dl} links at 375px (${String(mobileNav?.widthPx ?? 0)}px wide) rather than collapsing behind a control.`
                  : `The <nav> drops from ${dl} links at 1440px to ${ml} at 375px${cm.menuControl ? `, behind ${cm.menuControl.selector as string}` : ''}.`
              })(),
              search: cm.search,
              toc: cm.toc,
              tocReason: cm.toc ? null : cm.tocNote,
              stickyOrFixed: cm.chrome.stickyOrFixedElements,
              stickyOrFixedCount: cm.chrome.stickyOrFixedCount,
              horizontalOverflow: cm.horizontalOverflow,
              documentScrollWidth: cm.documentScrollWidth,
              docScrollHeightPx: cm.docScrollHeightPx,
              consentBanner: cm.consentBanner,
            }
          : {
              viewport: { w: MOBILE.width, h: MOBILE.height },
              note: `Not measured: ${contentMobile.error ?? 'unknown error'}`,
            },
        inferred: cd.inferred,
        bannerActions,
      },
    }

    await fs.writeFile(outPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    const measuredAt = new Date().toISOString()
    await updateSite(site.key, { measured: true, measuredAt })
    console.log(`measured: wrote ${outPath}`)
    console.log(
      `  body ${cd.readingColumn?.fontSizePx ?? 'null'} / ${cd.readingColumn?.lineHeight ?? 'null'} (ratio ${cd.readingColumn?.lineHeightRatio ?? 'null'}), ${cd.readingColumn?.charactersPerLine ?? 'null'} ch, contrast ${String(cd.contrast.bodyTextVsBackground ?? 'null')}, base unit ${String(cd.spacing.inferredBaseUnitPx ?? 'null')}px, dark mode ${String(cd.color.darkModeMechanism)}`,
    )
  } finally {
    await context.close()
  }
}

await main()
