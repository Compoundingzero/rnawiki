import 'dotenv/config'
import bpc157 from './seed-data/bpc-157'
import casgevy from './seed-data/casgevy'
import rapamycin from './seed-data/rapamycin-longevity'
import type { SeedFile } from '@/lib/seed-types'

/**
 * Build gate: reader-facing prose must stay short, plain, and free of the tells that mark
 * generated filler. This exists because the first published draft drifted badly — claim answers
 * grew to 511 characters of a single sentence chaining hedges with "though … and while … and",
 * and an access note ended by explaining its own compliance posture to the reader.
 *
 * The caps below are not arbitrary: they are set just above the BPC-157 entries, which were
 * written to the right shape and are the reference for the voice. Raising a cap to make this
 * pass is the wrong move — cut the sentence instead.
 *
 * Prove a change to this gate by reintroducing the original bloat and confirming it fails.
 */

const FIELD_CAPS = {
  bottomLine: 300,
  accessRealityNote: 700,
  directAnswer: 240,
  measuredFinding: 400,
  inference: 300,
  proofBoundaryExplanation: 320,
  remainingUnknown: 260,
  evidenceNeededNext: 260,
  plainLanguageExplanation: 300,
  evidenceContext: 200,
  statusStatement: 420,
  // Claim-event prose. These match the Zod caps on the admin claim-event editor, so a sentence
  // that passes the form cannot fail the build later. They are deliberately tighter than
  // measuredFinding: an event row is read as a list item, and a paragraph in that slot buries the
  // one thing it exists to say.
  plainSummary: 400,
  whatItSuggests: 300,
  whatItDoesNotEstablish: 300,
  // Claim-evidence prose. These two were stored fields nothing printed as prose until the Evidence
  // Record started building its "What did not work or conflicts with this answer" paragraph from
  // them, at which point they became public sentences that the gate had never seen — one of them
  // 305 characters long and ending in an undefined evidence-level scale. Anything a component can
  // print is subject to the same rules as the event fields beside it.
  claimPartAddressed: 120,
  directlyMeasuredResult: 400,
} as const

/** No single sentence in reader-facing prose may run longer than this. */
const MAX_SENTENCE_WORDS = 40

/**
 * `claimPartAddressed` is not a sentence and not a heading — it is the tail of one. The Evidence
 * Record prints it as "Supports this answer on {claimPartAddressed}", so a capitalised first word
 * produced "Supports this answer on Whether mTOR inhibition by rapamycin extends lifespan in
 * mammals", which reads as a sentence that broke in the middle. Every rapamycin source row read
 * that way while BPC-157's and Casgevy's did not, because those files happened to be written
 * lower-case.
 *
 * A regex cannot recognise a proper noun, so the exception is an explicit list rather than a
 * guess. Add to it when a genuine proper noun or initialism has to lead a value; do not relax the
 * rule to let an ordinary word through.
 */
const PROPER_NOUN_STARTS = new Set(['U.S.', 'UK', 'EU', 'FDA', 'EMA', 'MHRA', 'HbF', 'CRISPR-Cas9'])

function checkClaimPartAddressed(entity: string, where: string, value: string) {
  const first = value.trim().split(/\s+/)[0] ?? ''
  if (!/^[A-Z]/.test(first) || PROPER_NOUN_STARTS.has(first)) return
  problems.push({
    entity,
    where,
    field: 'claimPartAddressed',
    detail: `starts with a capitalised word "${first}" — it is printed as the tail of "Supports this answer on …", so it reads as a broken sentence. Lower-case it, or add a real proper noun to PROPER_NOUN_STARTS.`,
  })
}

/**
 * One typographic system, not two.
 *
 * The Evidence Record builds a paragraph at render time — `fallbackConflictSummary` in
 * lib/evidence-view.ts — that quotes a source title inside typographic quotes, and it printed a
 * few hundred pixels from seeded prose that quoted the FDA inside straight ones. Two quote
 * systems on one page, from two authors that can never see each other. The generated half is
 * fixed in code and cannot be checked by a human reading a seed file, so the seed half is the one
 * held to it here.
 *
 * The apostrophe is included for the same reason: the components already write &rsquo; and the
 * generated paragraph already carries curly marks, so a straight one in seeded prose is a visible
 * mismatch inside a single sentence.
 *
 * This is a formatting rule, deliberately mechanical. It does not judge what the quote says.
 */
const STRAIGHT_QUOTES = /["']/g

function checkQuotes(entity: string, where: string, field: string, value: string | undefined | null) {
  if (!value) return
  const hits = value.match(STRAIGHT_QUOTES)
  if (!hits) return
  problems.push({
    entity,
    where,
    field,
    detail: `${hits.length} straight quote character(s) — seeded prose uses “ ” for quotations and ’ for apostrophes, the same marks the generated evidence paragraph uses. Two quote systems on one page is a visible defect.`,
  })
}

/** A field may carry at most this many em-dash asides before it is a clause chain, not a sentence. */
const MAX_EM_DASHES = 2

/**
 * Phrases that signal filler rather than information. Each one here was either found in the
 * first draft or is a well-known tell. Keep this list short and defensible — a bloated
 * banned-word list is its own kind of slop.
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\bas of this writing\b/i, why: 'dateless hedge — give the checked date instead' },
  // Both apostrophes. Seeded prose uses the typographic one (see checkQuotes), so a pattern
  // written with the straight one alone would stop matching the copy it exists to catch.
  { pattern: /\bit(?:['\u2019]s| is)? (?:important|worth) (?:to )?not(?:e|ing)\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bit should be noted\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bworth noting that\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bthis is a description of\b/i, why: 'page explaining its own posture to the reader' },
  { pattern: /\bnot guidance on\b/i, why: 'self-justifying meta — the footer disclaimer covers this' },
  { pattern: /\b(?:in summary|to summarize|overall,)\b/i, why: 'summary of a paragraph that should be one sentence' },
  { pattern: /\bdelve into\b/i, why: 'generated-text tell' },
  { pattern: /\bplays? a (?:key|crucial|vital|significant) role\b/i, why: 'says nothing measurable' },
  { pattern: /\bwhen it comes to\b/i, why: 'filler transition' },
  { pattern: /\ba (?:testament|nod) to\b/i, why: 'editorialising' },
  // Marketing vocabulary from the build contract (§3), banned in addition to the
  // docs/product-principles.md list. None of it overlaps an entry above. These are the register
  // this product exists to refuse: they promise a reader certainty or access, which is the exact
  // confidence collapse the Proof Boundary is meant to undo.
  //
  // Scope note, and it is a real one: this list runs over seed FIELDS only, and checkFile
  // deliberately does not walk comprehensionQuestions. BPC-157's tendon question quotes the phrase
  // "proven by science" as an example of marketing copy a reader should learn to distrust — that
  // is the product working, not drift. If question text is ever brought under this gate, that
  // quotation has to be exempted, not rewritten.
  { pattern: /\bdeep[- ]dives?\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bexplore the science\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bunlock\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bdiscover the truth\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bcomplete scientific breakdown\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bexpert insights?\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bAI[- ]powered\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\brevolutionary\b/i, why: 'contract §3 banned marketing vocabulary' },
  { pattern: /\bconfidence scores?\b/i, why: 'no scores — Measured/Inferred/Unknown only' },
  { pattern: /\bproven by science\b/i, why: 'contract §3 banned marketing vocabulary' },
]

interface Problem {
  entity: string
  where: string
  field: string
  detail: string
}

const problems: Problem[] = []

function sentences(text: string): string[] {
  // Split on sentence-final punctuation followed by a space + capital. Good enough for prose
  // this short; abbreviations like "U.S." stay attached because they are not followed by a cap+space.
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function check(entity: string, where: string, field: string, value: string | undefined | null) {
  if (!value) return

  checkQuotes(entity, where, field, value)

  const cap = FIELD_CAPS[field as keyof typeof FIELD_CAPS]
  if (cap && value.length > cap) {
    problems.push({
      entity,
      where,
      field,
      detail: `${value.length} chars, cap is ${cap} — cut ${value.length - cap}`,
    })
  }

  for (const s of sentences(value)) {
    const words = s.split(/\s+/).length
    if (words > MAX_SENTENCE_WORDS) {
      problems.push({
        entity,
        where,
        field,
        detail: `a ${words}-word sentence (max ${MAX_SENTENCE_WORDS}): "${s.slice(0, 70)}…"`,
      })
    }
  }

  const emDashes = (value.match(/—/g) || []).length
  if (emDashes > MAX_EM_DASHES) {
    problems.push({ entity, where, field, detail: `${emDashes} em-dashes (max ${MAX_EM_DASHES}) — nested asides` })
  }

  for (const { pattern, why } of BANNED) {
    const hit = value.match(pattern)
    if (hit) {
      problems.push({ entity, where, field, detail: `banned phrase "${hit[0]}" — ${why}` })
    }
  }
}

function checkFile(file: SeedFile) {
  const e = file.entity
  const slug = e.slug

  check(slug, 'entity', 'bottomLine', e.bottomLine)
  check(slug, 'entity', 'accessRealityNote', e.accessRealityNote)
  // Quote rule only. `shortDescription` is reader-facing on /compounds, in search and in the API,
  // but it has never been under the caps or the sentence-length rule and bringing it under them
  // now would be a separate editorial decision.
  checkQuotes(slug, 'entity', 'shortDescription', e.shortDescription)

  for (const rs of e.regulatoryStatuses) {
    check(slug, `regulatory:${rs.jurisdiction.slice(0, 28)}`, 'statusStatement', rs.statusStatement)
  }

  for (const c of e.claims) {
    const at = `claim:${c.slug}`
    check(slug, at, 'directAnswer', c.directAnswer)
    check(slug, at, 'measuredFinding', c.measuredFinding)
    check(slug, at, 'inference', c.inference)
    check(slug, at, 'proofBoundaryExplanation', c.proofBoundaryExplanation)
    check(slug, at, 'remainingUnknown', c.remainingUnknown)
    check(slug, at, 'evidenceNeededNext', c.evidenceNeededNext)

    for (const link of c.evidence ?? []) {
      const where = `${at}/evidence:${link.sourceKey.slice(0, 28)}`
      check(slug, where, 'claimPartAddressed', link.claimPartAddressed)
      checkClaimPartAddressed(slug, where, link.claimPartAddressed)
      check(slug, where, 'directlyMeasuredResult', link.directlyMeasuredResult)
    }

    for (const ce of c.claimEvents ?? []) {
      const where = `${at}/event:${ce.sourceKey.slice(0, 28)}`
      check(slug, where, 'plainSummary', ce.plainSummary)
      check(slug, where, 'whatItSuggests', ce.whatItSuggests)
      check(slug, where, 'whatItDoesNotEstablish', ce.whatItDoesNotEstablish)
    }

    // Quote rule only, for the reason recorded on BANNED above: the clarity-check questions quote
    // marketing copy on purpose ("proven by science" is the example a reader is meant to learn to
    // distrust), so they stay outside the banned-phrase walk. Which marks that quotation is set
    // in is exactly the kind of thing this rule should govern.
    for (const q of c.comprehensionQuestions ?? []) {
      const where = `${at}/comprehension`
      checkQuotes(slug, where, 'question', q.question)
      for (const option of q.options) checkQuotes(slug, where, 'option', option)
      checkQuotes(slug, where, 'explanation', q.explanation)
    }

    for (const step of c.mechanismSteps ?? []) {
      check(slug, `${at}/step${step.displayOrder}`, 'plainLanguageExplanation', step.plainLanguageExplanation)
      check(slug, `${at}/step${step.displayOrder}`, 'evidenceContext', step.evidenceContext)
    }
  }
}

// Optional slug filter: `npx tsx scripts/check-prose.ts casgevy` checks one entity only. Useful
// when several people are editing different seed files at once and each wants to see only their
// own failures. No argument checks everything, which is what `npm run gate` does.
const only = process.argv[2]
const all = [bpc157, casgevy, rapamycin] as SeedFile[]
const selected = only ? all.filter((f) => f.entity.slug === only) : all

if (only && selected.length === 0) {
  console.error(`[prose] no seed entity with slug "${only}". Known: ${all.map((f) => f.entity.slug).join(', ')}`)
  process.exit(1)
}

for (const file of selected) {
  checkFile(file)
}

/**
 * Single voice: reader-facing pages say "RNAwiki", never "we". The site is run by one person, so
 * "we" invents an organisation — which matters most on /privacy and /methodology, the two pages
 * whose entire job is being trusted. The predecessor product carried the same gate ("single voice
 * OK — 0 first-person-plural constructions in reader-facing copy"); the rebuild lost it, and
 * /privacy came back written entirely in "we".
 *
 * Skipped when a single entity is being checked, since that mode is for seed-file editing.
 */
if (!only) {
  const { readFileSync, readdirSync, statSync } = await import('node:fs')
  const { join } = await import('node:path')

  const PAGE_DIRS = ['app/(public)', 'app/embed', 'components']
  const FIRST_PERSON = /(?<![\w-])(we|our|ours|us)(?![\w-])/gi

  function walk(dir: string): string[] {
    let out: string[] = []
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) out = out.concat(walk(p))
      else if (p.endsWith('.tsx')) out.push(p)
    }
    return out
  }

  /**
   * The banned public-facing marketing vocabulary from the product spec (§6), which until now
   * lived only in prose in docs/product-principles.md and was enforced by nobody. Positioning
   * copy is exactly where this drifts back in.
   *
   * Two deliberate omissions. "breakthrough" is not banned on its own — Breakthrough Therapy
   * Designation is a real FDA status this corpus legitimately cites; only "breakthrough platform"
   * is. "cure" is not banned either: the spec allows it with precise regulatory and clinical
   * context, which a regex cannot judge.
   *
   * The second block is the Evidence Record vocabulary. It was already banned in seeded prose and
   * was enforced nowhere in components and pages, which is the half where positioning copy is
   * actually written — "Open evidence record" is one edit away from "Deep dive into the science".
   * "Evidence Record" is the only branded phrase this product is allowed; the internal project
   * names for the same feature are banned outright so they cannot surface as public labels.
   *
   * "confidence score" and "proven by science" are here for a stronger reason than tone: both name
   * things the product refuses to produce, and a component printing either would be asserting a
   * verdict the evidence model has no way to support.
   */
  const BANNED_MARKETING = [
    /\brevolutionary\b/i,
    /\bgroundbreaking\b/i,
    /\bbiohack/i,
    /\boptimi[sz]e yourself\b/i,
    /\bnext-generation wellness\b/i,
    /\bdemocrati[sz]/i,
    /\bcutting[- ]edge\b/i,
    /\bbreakthrough platform\b/i,
    /\byour health journey\b/i,
    /\bscience made simple\b/i,
    /\bultimate guide\b/i,
    /\bmiracle\b/i,
    /\bunlock your\b/i,

    // Evidence Record vocabulary (build contract §3).
    /\bdeep dive\b/i,
    /\bexplore the science\b/i,
    /\bdiscover the truth\b/i,
    /\bcomplete scientific breakdown\b/i,
    /\bexpert insights\b/i,
    /\bAI-powered\b/i,
    /\brevolutionary transparency\b/i,
    /\bconfidence score\b/i,
    /\bproven by science\b/i,
    /\b4 Truths\b/i,
    /\bProofBench\b/i,
    /\bFailure Atlas\b/i,
  ]

  const voiceHits: string[] = []
  const marketingHits: string[] = []
  for (const dir of PAGE_DIRS) {
    let files: string[]
    try {
      files = walk(dir)
    } catch {
      continue
    }
    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        const code = line.trim()
        // Comments are internal notes, not reader-facing copy.
        if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return
        const m = line.match(FIRST_PERSON)
        if (m) voiceHits.push(`${file}:${i + 1} — "${m[0]}" in "${code.slice(0, 72)}"`)

        for (const pattern of BANNED_MARKETING) {
          const hit = line.match(pattern)
          if (hit) marketingHits.push(`${file}:${i + 1} — "${hit[0]}" in "${code.slice(0, 62)}"`)
        }
      })
    }
  }

  if (voiceHits.length > 0) {
    console.error(`\n[prose] REFUSING TO BUILD — ${voiceHits.length} first-person-plural construction(s) in reader-facing copy:\n`)
    for (const h of voiceHits) console.error(`  ✗ ${h}`)
    console.error('\n  The site speaks as RNAwiki, not as a "we" that does not exist. See docs/writing-style.md.\n')
    process.exit(1)
  }

  if (marketingHits.length > 0) {
    console.error(`\n[prose] REFUSING TO BUILD — ${marketingHits.length} banned marketing phrase(s) in reader-facing copy:\n`)
    for (const h of marketingHits) console.error(`  ✗ ${h}`)
    console.error('\n  Banned public-facing vocabulary, per the product spec. See docs/product-principles.md.\n')
    process.exit(1)
  }
}

if (problems.length > 0) {
  console.error(`\n[prose] REFUSING TO BUILD — ${problems.length} problem(s) in reader-facing copy:\n`)
  for (const p of problems) {
    console.error(`  ✗ ${p.entity} · ${p.where} · ${p.field}`)
    console.error(`      ${p.detail}`)
  }
  console.error('\n  Fix the writing, not the cap. See docs/writing-style.md.\n')
  process.exit(1)
}

console.log('[prose] OK — every reader-facing field within its cap, no sentence over 40 words, no banned filler.')
