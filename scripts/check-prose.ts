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
} as const

/** No single sentence in reader-facing prose may run longer than this. */
const MAX_SENTENCE_WORDS = 40

/** A field may carry at most this many em-dash asides before it is a clause chain, not a sentence. */
const MAX_EM_DASHES = 2

/**
 * Phrases that signal filler rather than information. Each one here was either found in the
 * first draft or is a well-known tell. Keep this list short and defensible — a bloated
 * banned-word list is its own kind of slop.
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\bas of this writing\b/i, why: 'dateless hedge — give the checked date instead' },
  { pattern: /\bit(?:'s| is)? (?:important|worth) (?:to )?not(?:e|ing)\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bit should be noted\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bworth noting that\b/i, why: 'filler preamble — just state it' },
  { pattern: /\bthis is a description of\b/i, why: 'page explaining its own posture to the reader' },
  { pattern: /\bnot guidance on\b/i, why: 'self-justifying meta — the footer disclaimer covers this' },
  { pattern: /\b(?:in summary|to summarize|overall,)\b/i, why: 'summary of a paragraph that should be one sentence' },
  { pattern: /\bdelve into\b/i, why: 'generated-text tell' },
  { pattern: /\bplays? a (?:key|crucial|vital|significant) role\b/i, why: 'says nothing measurable' },
  { pattern: /\bwhen it comes to\b/i, why: 'filler transition' },
  { pattern: /\ba (?:testament|nod) to\b/i, why: 'editorialising' },
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

  const voiceHits: string[] = []
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
      })
    }
  }

  if (voiceHits.length > 0) {
    console.error(`\n[prose] REFUSING TO BUILD — ${voiceHits.length} first-person-plural construction(s) in reader-facing copy:\n`)
    for (const h of voiceHits) console.error(`  ✗ ${h}`)
    console.error('\n  The site speaks as RNAwiki, not as a "we" that does not exist. See docs/writing-style.md.\n')
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
