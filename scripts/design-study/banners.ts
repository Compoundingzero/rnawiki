/**
 * Consent-banner decliner for the design study capture tool.
 *
 * The mandate's legal and ethical gate says: decline consent and cookie banners; never accept.
 * So this module clicks ONLY refusal-shaped controls, in a fixed priority order, and treats every
 * accept-shaped control as untouchable — even when it is the only control the banner offers. When
 * a banner cannot be declined it is left alone and that fact is recorded, because "left standing"
 * is an honest outcome and "accepted" is not.
 *
 *   declineBanners(page, log) -> the list of actions actually taken, as human-readable strings
 *
 * The search covers the main document and every reachable iframe (most commercial consent
 * management platforms render inside one), and gives up after ~8 s of page time.
 */
import type { Frame, Page } from '@playwright/test'

/** Marker attribute used to hand an element found in the page back to a Playwright locator. */
const TAG_ATTR = 'data-design-study-banner-target'

/** How long the whole decline attempt may take, per call. */
const BUDGET_MS = 8_000

/** Never clicked, in any pass, even if it is the only control present. */
const FORBIDDEN_SOURCE = 'accept|agree|allow|consent|got it|\\bok\\b|okay|continue|yes'

interface Pattern {
  /** Name used in the recorded action string. */
  label: string
  source: string
  flags: string
  /**
   * True when the control is only safe to click if it sits inside a container whose text mentions
   * cookies, consent or privacy — "Dismiss" and "Close" are ordinary page words elsewhere.
   */
  requireConsentContainer: boolean
}

/** Priority order is the order of this array. */
const STAGE_ONE: Pattern[] = [
  // Every pattern is anchored to a whole label part: the unanchored 'decline( all)?' clicked a
  // Stripe docs link literally named "Declines" and navigated away before the capture.
  {
    label: 'reject all',
    source: '^reject( all)?( (optional |non-essential |non-necessary |additional )?cookies)?$',
    flags: 'i',
    requireConsentContainer: false,
  },
  {
    label: 'refuse all',
    source: '^refuse( all)?( cookies)?$',
    flags: 'i',
    requireConsentContainer: false,
  },
  {
    label: 'decline',
    source: '^decline( all)?( (optional |non-essential )?cookies)?$',
    flags: 'i',
    requireConsentContainer: false,
  },
  { label: 'deny', source: '^deny( all)?( cookies)?$', flags: 'i', requireConsentContainer: false },
  {
    label: 'necessary/essential only',
    source:
      '^((only|strictly) (necessary|essential)( cookies)?|(necessary|essential)( cookies)? only|use (necessary|essential) cookies only)$',
    flags: 'i',
    requireConsentContainer: false,
  },
  {
    label: 'dismiss',
    source: '^dismiss( notification| banner| notice)?$',
    flags: 'i',
    requireConsentContainer: true,
  },
  // Plain refusals with no "reject" vocabulary: rnawiki.com's own analytics notice offers only
  // "Not now" against "Allow analytics", in a container whose text names neither cookies nor
  // consent. "Not now" and "No thanks" are refusals wherever they appear (a newsletter prompt
  // declined is still declined), so they need no consent container; "later" does.
  { label: 'not now', source: '^not now\\.?$', flags: 'i', requireConsentContainer: false },
  { label: 'no thanks', source: '^no,? thanks\\.?$', flags: 'i', requireConsentContainer: false },
  { label: 'maybe later', source: '^(maybe )?later$', flags: 'i', requireConsentContainer: true },
]

/** Second stage: opened only if stage one found nothing, and nothing is ever toggled on. */
const MANAGE: Pattern[] = [
  {
    label: 'manage preferences',
    // Whole-label match only. The unanchored form clicked "Manage design projects 3.3",
    // "Settings → Connectors", "Balance Settings" and "User Profile Options" on real pages and
    // navigated away before the capture; a preference-centre opener is a short label on its own.
    source:
      '^(manage( (cookie|cookies|consent|privacy))?( (preferences|settings|choices|options))?|(cookie|cookies|consent|privacy) (preferences|settings|choices|options)|customi[sz]e( (settings|choices|cookies))?|preferences|more options|settings|options)$',
    flags: 'i',
    requireConsentContainer: true,
  },
]

const AFTER_MANAGE: Pattern[] = [
  {
    label: 'reject all',
    source: '^reject( all)?( cookies)?$',
    flags: 'i',
    requireConsentContainer: false,
  },
  {
    label: 'confirm my choices',
    source: '^confirm( my)? choices$',
    flags: 'i',
    requireConsentContainer: false,
  },
  {
    label: 'save preferences',
    source: '^save( my)? (preferences|settings|choices)$',
    flags: 'i',
    requireConsentContainer: false,
  },
]

/** Last resort: a close control that belongs to a consent container. */
const CLOSE: Pattern[] = [
  {
    label: 'close',
    source: 'close|dismiss|^\\s*(×|✕|✖|x)\\s*$',
    flags: 'i',
    requireConsentContainer: true,
  },
]

export type BannerLog = (message: string) => void

interface FoundTarget {
  patternLabel: string
  text: string
  container: string
}

interface FrameScan {
  /** Description of a visible consent-shaped container, or null when none was found. */
  consentContainer: string | null
  /** Visible control labels inside that container (capped), for the "only accept-type" report. */
  controlLabels: string[]
}

/*
 * tsx compiles this file with esbuild's `keepNames`, which rewrites `const helper = () => {}` into
 * `__name(helper, "helper")`. A page.evaluate callback is serialized with Function.toString and run
 * inside the browser, where esbuild's module-scope `__name` helper does not exist — so every
 * callback below installs a one-line identity `__name` first. Nothing else about the page is
 * touched, and no fingerprint is spoofed.
 */

/* ------------------------------------------------------------------------------------------- *
 * In-page helpers. These run inside the browser, so they take plain serializable arguments.
 * ------------------------------------------------------------------------------------------- */

const CONTROL_SELECTOR =
  'button, a, input[type="button"], input[type="submit"], input[type="reset"], [role="button"], [role="link"], [tabindex]'

/** Find the first control matching the patterns, in pattern order, and tag it for clicking. */
async function tagTarget(frame: Frame, patterns: Pattern[]): Promise<FoundTarget | null> {
  return frame.evaluate(
    (arg: {
      patterns: Pattern[]
      forbidden: string
      attr: string
      controlSelector: string
    }): FoundTarget | null => {
      const scope = globalThis as unknown as { __name?: (value: unknown, name?: string) => unknown }
      scope.__name ??= (value) => value
      const forbidden = new RegExp(arg.forbidden, 'i')
      // Narrow on purpose: this decides whether a "Dismiss" or "Close" control may be clicked, and
      // those are ordinary page words outside a cookie/consent/privacy box.
      const context = /cookie|consent|privacy|gdpr/i

      for (const stale of Array.from(document.querySelectorAll(`[${arg.attr}]`))) {
        stale.removeAttribute(arg.attr)
      }

      const isVisible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect()
        if (rect.width < 4 || rect.height < 4) return false
        const style = window.getComputedStyle(el)
        if (style.visibility === 'hidden' || style.display === 'none') return false
        if (Number(style.opacity) === 0) return false
        return true
      }

      const labelOf = (el: Element): string => {
        const parts: string[] = []
        const text = (el as HTMLElement).innerText ?? el.textContent ?? ''
        parts.push(text.replace(/\s+/g, ' ').trim().slice(0, 160))
        for (const attr of ['aria-label', 'title', 'value', 'alt']) {
          const value = el.getAttribute(attr)
          if (value) parts.push(value.replace(/\s+/g, ' ').trim().slice(0, 160))
        }
        return parts.filter(Boolean).join(' | ')
      }

      const describe = (el: Element): string => {
        let node: Element | null = el
        for (let depth = 0; node && depth < 10; depth += 1, node = node.parentElement) {
          if (node.id) return `#${node.id}`
          const cls = (node.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean)[0]
          if (cls && depth > 0) return `${node.tagName.toLowerCase()}.${cls}`
        }
        return el.tagName.toLowerCase()
      }

      // Strict mode (used for the preference-centre opener): the container must be identified as
      // consent UI by its own id/class, or be a floating box (fixed/sticky, or a dialog) whose text
      // says cookie/consent/gdpr — "privacy" alone is not enough, because every footer links a
      // privacy policy and that is exactly what let ordinary page controls through.
      const strictIdentity =
        /cookie|consent|gdpr|onetrust|cmp|didomi|usercentrics|cookiebot|sourcepoint|trustarc|quantcast|ketch|osano/i
      const strictText = /cookie|consent|gdpr/i
      const inConsentContainer = (el: Element, strict = false): boolean => {
        let node: Element | null = el
        for (let depth = 0; node && depth < 12; depth += 1, node = node.parentElement) {
          const identity = `${node.id ?? ''} ${node.getAttribute('class') ?? ''}`
          if (strict) {
            if (strictIdentity.test(identity)) return true
            const style = window.getComputedStyle(node)
            const floating =
              style.position === 'fixed' ||
              style.position === 'sticky' ||
              node.tagName === 'DIALOG' ||
              node.getAttribute('role') === 'dialog' ||
              node.getAttribute('role') === 'alertdialog' ||
              node.getAttribute('aria-modal') === 'true'
            const text = (node.textContent ?? '').slice(0, 4000)
            if (floating && text.length > 40 && text.length < 4000 && strictText.test(text))
              return true
            continue
          }
          if (context.test(identity)) return true
          const text = (node.textContent ?? '').slice(0, 4000)
          if (text.length > 40 && context.test(text)) return true
        }
        return false
      }

      // A link that navigates is never a consent control unless its box is identified as one.
      const navigates = (el: Element): boolean => {
        if (el.tagName !== 'A') return false
        const href = (el.getAttribute('href') ?? '').trim()
        if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return false
        return !inConsentContainer(el, true)
      }

      const controls = Array.from(document.querySelectorAll(arg.controlSelector)).filter(isVisible)

      for (const pattern of arg.patterns) {
        const re = new RegExp(pattern.source, pattern.flags)
        for (const el of controls) {
          const label = labelOf(el)
          if (!label) continue
          if (forbidden.test(label)) continue
          // Labels join innerText, aria-label and title with ' | '; an anchored pattern must match one
          // whole part, so "Reject all | Reject all cookies" still matches and "Declines" does not.
          if (!label.split(' | ').some((part) => re.test(part.trim()))) continue
          if (navigates(el)) continue
          if (
            pattern.requireConsentContainer &&
            !inConsentContainer(el, pattern.label === 'manage preferences')
          )
            continue
          el.setAttribute(arg.attr, '1')
          return { patternLabel: pattern.label, text: label.slice(0, 80), container: describe(el) }
        }
      }
      return null
    },
    { patterns, forbidden: FORBIDDEN_SOURCE, attr: TAG_ATTR, controlSelector: CONTROL_SELECTOR },
  )
}

/** Report whether this frame shows consent UI at all, and what controls it offers. */
async function scanFrame(frame: Frame): Promise<FrameScan> {
  return frame.evaluate(
    (arg: { controlSelector: string }): FrameScan => {
      const scope = globalThis as unknown as { __name?: (value: unknown, name?: string) => unknown }
      scope.__name ??= (value) => value
      // Wider than the click gate below on purpose: recognising a banner only produces a report,
      // and an unrecognised banner would be logged as "no consent UI found", which is false.
      // RNAWiki's own analytics notice says neither "cookie" nor "consent".
      const context = /cookie|consent|privacy|gdpr|tracking|analytics|do not track/i

      const isVisible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect()
        if (rect.width < 4 || rect.height < 4) return false
        const style = window.getComputedStyle(el)
        if (style.visibility === 'hidden' || style.display === 'none') return false
        if (Number(style.opacity) === 0) return false
        return true
      }

      const describe = (el: Element): string => {
        if (el.id) return `#${el.id}`
        const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean)[0]
        return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase()
      }

      const labelOf = (el: Element): string => {
        const text = ((el as HTMLElement).innerText ?? el.textContent ?? '')
          .replace(/\s+/g, ' ')
          .trim()
        const aria =
          el.getAttribute('aria-label') ??
          el.getAttribute('title') ??
          el.getAttribute('value') ??
          ''
        return (text || aria).slice(0, 60)
      }

      // A consent container is a visible box whose own text mentions cookies/consent/privacy and
      // that contains at least one visible control. Prefer the smallest such box.
      const candidates = Array.from(
        document.querySelectorAll(
          'div, section, aside, dialog, form, footer, [role="dialog"], [role="alertdialog"], [role="region"]',
        ),
      )
        .filter((el) => isVisible(el))
        .filter((el) => {
          const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
          if (text.length < 30 || text.length > 4000) return false
          if (!context.test(`${el.id ?? ''} ${el.getAttribute('class') ?? ''} ${text}`))
            return false
          return el.querySelectorAll(arg.controlSelector).length > 0
        })

      if (candidates.length === 0) return { consentContainer: null, controlLabels: [] }

      let smallest = candidates[0] as Element
      for (const el of candidates) {
        if ((el.textContent ?? '').length < (smallest.textContent ?? '').length) smallest = el
      }
      const labels: string[] = []
      for (const control of Array.from(smallest.querySelectorAll(arg.controlSelector)).filter(
        isVisible,
      )) {
        const label = labelOf(control)
        if (label && !labels.includes(label)) labels.push(label)
        if (labels.length >= 12) break
      }
      return { consentContainer: describe(smallest), controlLabels: labels }
    },
    { controlSelector: CONTROL_SELECTOR },
  )
}

async function clickTagged(frame: Frame): Promise<boolean> {
  const locator = frame.locator(`[${TAG_ATTR}="1"]`).first()
  try {
    await locator.click({ timeout: 3_000 })
    return true
  } catch {
    // A real click can be blocked by an overlay the CMP itself paints; fall back to the element's
    // own click handler, which is still only ever a refusal control at this point.
    try {
      return await frame.evaluate((attr: string): boolean => {
        const el = document.querySelector(`[${attr}="1"]`)
        if (el instanceof HTMLElement) {
          el.click()
          return true
        }
        return false
      }, TAG_ATTR)
    } catch {
      return false
    }
  }
}

function frameLabel(frame: Frame, page: Page): string {
  if (frame === page.mainFrame()) return 'main document'
  let url = ''
  try {
    url = frame.url()
  } catch {
    url = ''
  }
  if (!url) return 'an iframe'
  try {
    const parsed = new URL(url)
    return `iframe ${parsed.host}${parsed.pathname.slice(0, 40)}`
  } catch {
    return `iframe ${url.slice(0, 60)}`
  }
}

function reachableFrames(page: Page): Frame[] {
  try {
    return page.frames().filter((frame) => !frame.isDetached())
  } catch {
    return [page.mainFrame()]
  }
}

/**
 * A frame that cannot be scanned is normal (cross-origin consent iframes refuse evaluation, frames
 * detach mid-scan). Any other error is a bug in this file and must be reported, not swallowed —
 * silently treating a broken scan as "no banner" would let a banner stand while the log claimed
 * there was none.
 */
const EXPECTED_FRAME_ERROR =
  /cross-origin|detached|execution context was destroyed|frame was detached|target closed|navigating/i

function frameScanProblem(error: unknown): string | null {
  const message = error instanceof Error ? (error.message.split('\n')[0] ?? '') : String(error)
  return EXPECTED_FRAME_ERROR.test(message) ? null : message
}

async function tryPatterns(
  page: Page,
  patterns: Pattern[],
  onProblem: (message: string) => void,
): Promise<{ frame: Frame; found: FoundTarget } | null> {
  for (const frame of reachableFrames(page)) {
    try {
      const found = await tagTarget(frame, patterns)
      if (found) return { frame, found }
    } catch (error) {
      const problem = frameScanProblem(error)
      if (problem) onProblem(`scan of ${frameLabel(frame, page)} failed: ${problem}`)
    }
  }
  return null
}

/**
 * Decline any consent banner on the page. Returns the actions taken, one string each; the list is
 * never empty (it says "no consent UI found" or why the banner was left standing).
 */
export async function declineBanners(page: Page, log: BannerLog): Promise<string[]> {
  const actions: string[] = []
  const deadline = Date.now() + BUDGET_MS
  const record = (action: string): void => {
    actions.push(action)
    log(`banner: ${action}`)
  }

  const scanAll = async (): Promise<FrameScan & { where: string }> => {
    for (const frame of reachableFrames(page)) {
      try {
        const scan = await scanFrame(frame)
        if (scan.consentContainer) return { ...scan, where: frameLabel(frame, page) }
      } catch (error) {
        const problem = frameScanProblem(error)
        if (problem) record(`consent scan of ${frameLabel(frame, page)} failed: ${problem}`)
      }
    }
    return { consentContainer: null, controlLabels: [], where: '' }
  }

  const before = await scanAll()

  // Stage one: an outright refusal control.
  const stageOne = Date.now() < deadline ? await tryPatterns(page, STAGE_ONE, record) : null
  if (stageOne) {
    const clicked = await clickTagged(stageOne.frame)
    const where = `${stageOne.found.container} (${frameLabel(stageOne.frame, page)})`
    if (clicked) {
      record(`clicked '${stageOne.found.text}' in ${where}`)
      await page.waitForTimeout(800)
      const after = await scanAll()
      if (after.consentContainer && before.consentContainer) {
        record(
          `banner still visible after the refusal click (${after.consentContainer}); left alone`,
        )
      }
      return actions
    }
    record(`could not click '${stageOne.found.text}' in ${where}; left alone`)
    return actions
  }

  if (!before.consentContainer) {
    record('no consent UI found')
    return actions
  }

  // Stage two: open the preference centre, toggle NOTHING, and refuse from inside it.
  if (Date.now() < deadline) {
    const manage = await tryPatterns(page, MANAGE, record)
    if (manage) {
      const clicked = await clickTagged(manage.frame)
      if (clicked) {
        record(
          `clicked '${manage.found.text}' in ${manage.found.container} (${frameLabel(manage.frame, page)}) to reach a refusal control; nothing toggled`,
        )
        await page.waitForTimeout(1_500)
        const second = await tryPatterns(page, AFTER_MANAGE, record)
        if (second) {
          const secondClicked = await clickTagged(second.frame)
          if (secondClicked) {
            record(
              `clicked '${second.found.text}' in ${second.found.container} (${frameLabel(second.frame, page)})`,
            )
            return actions
          }
          record(`could not click '${second.found.text}' in the preference centre; left alone`)
          return actions
        }
        record('left: the preference centre did not expose a refusal control')
      } else {
        record(`could not click '${manage.found.text}'; left alone`)
      }
    }
  }

  // Last resort: a close control that belongs to the consent container.
  if (Date.now() < deadline) {
    const close = await tryPatterns(page, CLOSE, record)
    if (close) {
      const clicked = await clickTagged(close.frame)
      if (clicked) {
        record(`closed the consent container via '${close.found.text}' in ${close.found.container}`)
        return actions
      }
      record(`could not click the close control '${close.found.text}'; left alone`)
      return actions
    }
  }

  const controls = before.controlLabels.slice(0, 6).join(', ')
  const acceptShaped = new RegExp(FORBIDDEN_SOURCE, 'i')
  const nonAccept = before.controlLabels.filter((label) => !acceptShaped.test(label))
  if (nonAccept.length === 0) {
    record(
      `left: only accept-type controls found in ${before.consentContainer}${controls ? ` (controls: ${controls})` : ''}`,
    )
  } else {
    // The banner offers something that is not an accept, but not one of the refusal wordings this
    // tool is allowed to click either (RNAWiki's own notice offers "Not now"). Left standing and
    // recorded, so a finding can say the capture contains a banner rather than pretend it does not.
    record(
      `left: no permitted refusal control in ${before.consentContainer}${controls ? ` (controls: ${controls})` : ''}; banner stands in the captures`,
    )
  }
  return actions
}
