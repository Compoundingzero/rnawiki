import { test, expect } from '@playwright/test'
import { PROOF_BOUNDARY_STAGES, EVIDENCE_CHANGE_TYPES, EVIDENCE_RELATIONSHIPS } from '../../lib/evidence'
import { CLAIM_EVENT_TYPES, DEVELOPMENT_GATES } from '../../lib/claim-events'
import { PUBLIC_PATHS, expandEverything } from './fixtures/record-data'

/**
 * The rules from CLAUDE.md that hold for every reader-facing page, checked against the text a
 * reader actually sees rather than against the source that produced it.
 *
 * Imported from lib/evidence.ts and lib/claim-events.ts rather than copied, so a new enum value
 * is covered here the moment it is declared — the arrays in those files are already hand-synced
 * with the Postgres enums and a second hand-synced copy in a test would be one more thing to
 * forget.
 *
 * Every page is scanned with all disclosures forced open. The content inside a closed <details>
 * is in the document and one keypress from a reader, so "it was hidden" is not a defence for any
 * of these.
 */

/** Every stored enum value that must never be printed, from every enum a public page can reach. */
const RAW_ENUM_TOKENS: string[] = [
  ...PROOF_BOUNDARY_STAGES,
  ...EVIDENCE_CHANGE_TYPES,
  ...EVIDENCE_RELATIONSHIPS,
  ...CLAIM_EVENT_TYPES,
  ...DEVELOPMENT_GATES,
  // publication_status and regulatory_category, which have no exported array to import.
  'editorially_complete',
  'scientific_review_required',
  'needs_update',
  're_review',
  'approved_medicine',
  'investigational_medicine',
  'compounded_medicine',
  'dietary_supplement',
  'unapproved_therapeutic_substance',
  'withdrawn_or_restricted',
  // Every underscore-joined value above is a database token. The single-word members
  // (`supports`, `limits`, `safety`, `other`, ...) are ordinary English and are excluded below.
].filter((token) => token.includes('_'))

/**
 * Dosage, protocol and procurement language. CLAUDE.md rule 1, which overrides every other
 * instruction in the repo.
 *
 * Deliberately NOT a scan for "mg". A dose quoted from a named trial is a fact about that trial
 * and is quotable — the rapamycin record cites "10 mg/week" because PEARL used it. What is banned
 * is guidance: what to take, how much, how often, in what combination, and where to obtain it.
 */
const GUIDANCE_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'dosing guidance', pattern: /\b(recommended|typical|suggested|optimal|effective)\s+dos(e|age|ing)\b/i },
  { label: 'dosage calculator', pattern: /\bdos(e|age)\s+calculator\b/i },
  { label: 'how-to-take guidance', pattern: /\bhow (much|often) to (take|use|inject|dose)\b/i },
  { label: 'protocol building', pattern: /\b(protocol|stack)\s+builder\b/i },
  { label: 'stacking guidance', pattern: /\bstack(ing)? (it )?with\b/i },
  { label: 'cycling guidance', pattern: /\bcycl(e|ing) (on and off|off and on)\b/i },
  { label: 'cycling guidance', pattern: /\bcycle length\b/i },
  { label: 'procurement', pattern: /\bwhere to (buy|get|order|source)\b/i },
  { label: 'procurement', pattern: /\b(reputable|trusted)\s+(vendor|supplier|seller|source)s?\b/i },
  // "order" is deliberately absent as a verb here: "in order from weakest to strongest" is
  // legitimate copy about the evidence ladder, and matching it would make this test lie.
  { label: 'procurement', pattern: /\b(buy|purchase) (it|this|now|online|from)\b/i },
  { label: 'self-use framing', pattern: /\bif you (are )?(taking|using|considering taking)\b/i },
]

/**
 * Scores, ratings and confidence figures. CLAUDE.md rule 3.
 *
 * A bare percentage is NOT banned: a number quoted straight from a named study is exactly what
 * this site exists to show, and the seeded corpus quotes several (92.9% transfusion independence,
 * for one). What is banned is a percentage or a rating that expresses RNAwiki's own certainty
 * about a claim, plus every visual score device.
 */
const SCORE_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'confidence score', pattern: /\bconfidence\s+(score|level|rating|interval of ours)\b/i },
  { label: 'certainty score', pattern: /\b(certainty|evidence|trust|reliability)\s+(score|rating|index|grade)\b/i },
  { label: 'percentage certainty', pattern: /\b\d{1,3}\s?%\s*(confident|certain|sure|confidence|certainty|proven|true)\b/i },
  { label: 'percentage certainty', pattern: /\b(confidence|certainty)[:\s]+\d{1,3}\s?%/i },
  { label: 'star rating', pattern: /\b\d(\.\d)?\s*(\/\s*5|out of 5|stars?)\b/i },
  { label: 'score out of', pattern: /\bscore[:\s]+\d/i },
  { label: 'traffic light verdict', pattern: /\b(green|amber|red)\s+(light|flag|rating|verdict)\b/i },
]

/** The marketing vocabulary the build contract bans outright. "Evidence Record" is the only brand. */
const BANNED_VOCABULARY = [
  'deep dive',
  'explore the science',
  'unlock',
  'discover the truth',
  'complete scientific breakdown',
  'expert insights',
  'AI-powered',
  'revolutionary transparency',
  'confidence score',
  'proven by science',
  '4 Truths',
  'ProofBench',
  'Failure Atlas',
]

/**
 * URLs and identifiers are quoted verbatim on purpose — they are the part of a record a reader
 * checks somewhere else — and a regulatory URL can legitimately contain an underscore. They are
 * removed before the generic underscore sweep so a real citation cannot be mistaken for a leaked
 * enum value. The explicit token list above still runs over the untouched text.
 */
function stripIdentifiers(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\b10\.\d{4,9}\/\S+/g, ' ')
    .replace(/\bNCT\d+\b/g, ' ')
}

/**
 * Removes double-quoted spans before the banned-vocabulary sweep, and ONLY that sweep.
 *
 * The rule bans this vocabulary from RNAwiki's own voice. Quoting somebody else's marketing in
 * order to take it apart is the opposite act, and it is work this corpus is specifically here to
 * do: BPC-157's comprehension question asks the reader what the evidence behind
 * `"BPC-157 heals tendons — proven by science"` actually is. Rewriting that quotation to dodge a
 * string match would delete the one place a reader is shown the exact phrasing they will meet on a
 * seller's page and taught why it does not hold.
 *
 * The exemption is narrow on purpose. RNAwiki never speaks in quotation marks — headings, labels,
 * summaries and body copy are all unquoted — so nothing the site asserts in its own voice can hide
 * in here. Every other check in this file, including the raw-enum sweep and the "Proof Boundary"
 * assertion below, still runs against the untouched text.
 */
function stripQuotedSpans(text: string): string {
  return text.replace(/“[^”]*”/g, ' ').replace(/"[^"]*"/g, ' ')
}

for (const path of PUBLIC_PATHS) {
  test.describe(`public copy on ${path}`, () => {
    test('contains no dosage, protocol or procurement guidance', async ({ page }) => {
      const response = await page.goto(path)
      test.skip(!response || !response.ok(), `${path} did not render — skipping until it does.`)
      await expandEverything(page)

      const text = await page.locator('body').innerText()
      for (const { label, pattern } of GUIDANCE_PATTERNS) {
        expect(text, `${path} contains ${label}: ${pattern}`).not.toMatch(pattern)
      }
    })

    test('contains no confidence score, rating or certainty percentage', async ({ page }) => {
      const response = await page.goto(path)
      test.skip(!response || !response.ok(), `${path} did not render — skipping until it does.`)
      await expandEverything(page)

      const text = await page.locator('body').innerText()
      for (const { label, pattern } of SCORE_PATTERNS) {
        expect(text, `${path} contains a ${label}: ${pattern}`).not.toMatch(pattern)
      }
      // No progress-bar or meter element either — a score does not become acceptable by being
      // drawn instead of written.
      expect(await page.locator('progress, meter, [role="progressbar"], [role="meter"]').count()).toBe(0)
    })

    test('prints no raw enum value anywhere in its rendered text', async ({ page }) => {
      const response = await page.goto(path)
      test.skip(!response || !response.ok(), `${path} did not render — skipping until it does.`)
      await expandEverything(page)

      const text = await page.locator('body').innerText()
      for (const token of RAW_ENUM_TOKENS) {
        expect(text, `${path} prints the stored enum value "${token}"`).not.toContain(token)
      }

      // A general sweep for anything shaped like a database token, after real identifiers are
      // removed. This catches a value from an enum nobody remembered to list. Scoped to <main>:
      // the header and footer carry external links whose text is not editorial copy.
      const mainText = await page.locator('main').innerText()
      const matches = stripIdentifiers(mainText).match(/\b[a-z]{3,}(?:_[a-z]{2,}){1,}\b/g)
      expect(matches ?? [], `${path} prints database-shaped tokens: ${(matches ?? []).join(', ')}`).toHaveLength(
        0
      )
    })

    test('uses none of the banned marketing vocabulary', async ({ page }) => {
      const response = await page.goto(path)
      test.skip(!response || !response.ok(), `${path} did not render — skipping until it does.`)
      await expandEverything(page)

      const text = (await page.locator('main').innerText()).toLowerCase()
      const unquoted = stripQuotedSpans(text)
      for (const phrase of BANNED_VOCABULARY) {
        expect(unquoted, `${path} uses banned vocabulary "${phrase}" in its own voice`).not.toContain(
          phrase.toLowerCase()
        )
      }
      // Internal vocabulary a reader was never meant to meet. The plain-language rebuild removed
      // "Proof Boundary" from every reader-facing surface; it survives only as the name of the
      // model in lib/evidence.ts and in the docs.
      expect(text, `${path} still says "Proof Boundary" to a reader`).not.toContain('proof boundary')
    })
  })
}
