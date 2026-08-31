import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { findPublicCopyFindings } from './public-copy-policy.mjs'

/**
 * Scans user-visible prose for the tics that make text read as machine-written.
 *
 * It only looks at STRING LITERALS and JSX text, never at code or comments — a variable named
 * `leverage` is not slop, and a comment explaining why something is crucial is not copy. Findings
 * are grouped by pattern so the common ones are obvious.
 */

const PATTERNS = [
  // Vocabulary that almost never survives a human editor.
  { id: 'delve', re: /\bdelve[sd]?\b/gi },
  { id: 'landscape/realm/tapestry', re: /\b(landscape|realm|tapestry|arena)\b/gi },
  { id: 'testament to', re: /\btestament to\b/gi },
  { id: 'leverage (verb)', re: /\bleverag(e|es|ed|ing)\b/gi },
  {
    id: 'harness/unlock/empower/elevate',
    re: /\b(harness(es|ed|ing)?|unlock(s|ed|ing)?|empower(s|ed|ing)?|elevat(e|es|ed|ing))\b/gi,
  },
  {
    id: 'seamless/robust/cutting-edge',
    re: /\b(seamless(ly)?|robust|cutting[- ]edge|state[- ]of[- ]the[- ]art|game[- ]chang\w+)\b/gi,
  },
  {
    id: 'navigate (figurative)',
    re: /\bnavigat(e|es|ed|ing)\s+(the|this|a)\s+\w*(landscape|complexity|world|maze)/gi,
  },
  {
    id: 'underscore/highlight the importance',
    re: /\b(underscor\w+|highlight\w*)\s+(the\s+)?(importance|need|significance)/gi,
  },
  { id: 'in today’s world', re: /\bin (today's|the modern|our modern)\s+\w+/gi },
  { id: 'whether you are X or Y', re: /\bwhether you(?:'re| are)\b[^.]{0,60}\bor\b/gi },
  { id: 'not just X but Y', re: /\bnot (just|only|merely)\b[^.]{0,50}\b(but|it'?s)\b/gi },
  { id: 'more than just', re: /\bmore than (just|simply)\b/gi },
  {
    id: 'at its core / at the heart of',
    re: /\b(at its core|at the heart of|when it comes to)\b/gi,
  },
  {
    id: 'plays a (vital|key) role',
    re: /\bplays? an? (vital|key|crucial|pivotal|important|significant) role\b/gi,
  },
  {
    id: 'it is important/worth noting',
    re: /\bit(?:'s| is) (important|worth) (to note|noting)\b/gi,
  },
  { id: 'hedge: may potentially', re: /\b(may|might|could) potentially\b/gi },
  { id: 'hedge: helps to / designed to', re: /\b(helps? to|is designed to|aims? to)\b/gi },
  { id: 'comprehensive/extensive', re: /\b(comprehensive(ly)?|extensive(ly)?)\b/gi },
  { id: 'crucial/vital/pivotal', re: /\b(crucial(ly)?|vital(ly)?|pivotal)\b/gi },
  {
    id: 'revolutionary/groundbreaking',
    re: /\b(revolutionar\w+|ground[- ]?breaking|transformative|paradigm[- ]shift\w*)\b/gi,
  },
  { id: 'dive into / deep dive', re: /\b(dive into|deep dive|let'?s explore)\b/gi },
  { id: 'in conclusion / to sum up', re: /\b(in conclusion|to sum up|in summary,)\b/gi },
  { id: 'furthermore/moreover/additionally', re: /\b(furthermore|moreover|additionally),/gi },
  { id: 'boasts/offers a range of', re: /\b(boasts?|offers? a (wide )?range of)\b/gi },
  { id: 'ensure/ensuring (puffery)', re: /\bensur(e|es|ing)\s+(optimal|maximum|the best)\b/gi },
]

/**
 * Seed dossiers contain clinical terms that look like generic copy tics when read without context
 * (for example, "pivotal trial", "extensively metabolised", and "elevated liver enzymes"). Apply
 * a much narrower set of rules to this prose so scientifically correct wording does not become a
 * false positive.
 */
const SEED_COPY_PATTERNS = [
  { id: 'seed: canned worth-noting transition', re: /\bworth noting\b/gi },
  {
    id: 'seed: canned summary transition',
    re: /\b(?:so\s+)?the\s+(?:answer|comparison|position|reading|statement|summary)\s+is(?:\s+that|:)/gi,
  },
  {
    id: 'seed: self-certified honest language',
    re: /\bhonest(?:ly)?\b/gi,
  },
  {
    id: 'seed: self-certified plainly language',
    re: /\bplainly\b/gi,
  },
  {
    id: 'seed: self-referential emphasis',
    re: /\b(?:worth (?:stating|saying)|saying so is|(?:this|the) (?:page|file) says so)\b/gi,
  },
  {
    id: 'seed: replacement self-certification',
    re: /\b(?:(?:position|statement)\s+supported\s+by\s+(?:the\s+available\s+|the\s+)?evidence|best-supported interpretation|residual supported claim)\b/gi,
  },
  { id: 'seed: repeated generic evidence question', re: /\bnobody has measured what\?/gi },
  {
    id: 'seed: editorial dismissal',
    re: /\b(?:no modern trial bothers(?: testing)?|attack orders never arrive|attack everything at once|bacteria resistant to everything else are usually still sensitive)\b/gi,
  },
  {
    id: 'seed: unsupported exclusivity',
    re: /\b(?:almost nothing else does|nothing else in medicine works at that step|only thing that removes it|the dose regulates itself|the only glucose-lowering drug with|treats the bladder and nothing else)\b/gi,
  },
  {
    id: 'seed: perfect-specificity metaphor',
    re: /\bsponge shaped to fit\b[^.]{0,80}\bnothing else\b/gi,
  },
]

// These files contain user-owned work outside this cleanup. Keep the exclusion explicit so the
// default copy gate cannot silently start policing or rewriting them.
const PROTECTED_SEED_COPY_FILES = new Set([
  'enriched-batch-19.ts',
  'enriched-batch-20.ts',
  'enriched-batch-27.ts',
  'enriched-batch-28.ts',
  'enriched-batch-29.ts',
  'enriched-batch-30.ts',
])

/** Pull reader-facing prose out of a source or Markdown file, skipping code and comments. */
function extractProse(src, file) {
  if (/\.md$/i.test(file)) {
    return src
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`\n]*`/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  }
  let s = src
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ') // block comments
  s = s.replace(/^\s*\/\/.*$/gm, ' ') // line comments
  const out = []
  // Single- and double-quoted strings, template literals, and JSX text between tags.
  const stringRe = /'((?:[^'\\]|\\.){12,})'|"((?:[^"\\]|\\.){12,})"|`((?:[^`\\]|\\.){12,})`/g
  let m
  while ((m = stringRe.exec(s)) !== null) out.push(m[1] ?? m[2] ?? m[3] ?? '')
  const jsxRe = />([^<>{}]{16,})</g
  while ((m = jsxRe.exec(s)) !== null) out.push(m[1])
  return out.join('\n')
}

function sourceFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(?:ts|tsx|md)$/.test(entry.name) ? [path] : []
  })
}

function publicDataFiles(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ndjson'))
    .map((entry) => join(root, entry.name))
    .sort()
}

/** Resolve the seed groups that a fresh/default database seed actually imports. */
function importedSeedFiles(root) {
  const index = readFileSync(join(root, 'index.ts'), 'utf8')
  const imports = [...index.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)]
  return imports
    .map((match) => `${match[1]}.ts`)
    .filter((file) => !PROTECTED_SEED_COPY_FILES.has(file))
    .map((file) => join(root, file))
}

const explicitFiles = process.argv.length > 2
const files = explicitFiles
  ? process.argv.slice(2)
  : [
      ...['app', 'components', 'lib', 'docs'].flatMap(sourceFiles),
      'README.md',
      'data/README.md',
      'data/dictionary.md',
    ]
const hits = new Map()

function addHit(id, hit) {
  if (!hits.has(id)) hits.set(id, [])
  hits.get(id).push(hit)
}

function scanFiles(filesToScan, patterns, extract = extractProse) {
  let scanned = 0
  for (const file of filesToScan) {
    let src
    try {
      src = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    scanned += 1
    const prose = extract(src, file)
    for (const { id, re } of patterns) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(prose)) !== null) {
        const start = Math.max(0, m.index - 45)
        const context = prose.slice(start, m.index + m[0].length + 45).replace(/\s+/g, ' ')
        addHit(id, {
          file: file.replace(/^.*\/(?=(components|app|lib|scripts))/, ''),
          match: m[0],
          context,
        })
      }
    }
  }
  return scanned
}

/** Scan generated medicine records without concatenating values or losing their JSON paths. */
function scanGeneratedMedicineFiles(filesToScan) {
  let scanned = 0
  for (const file of filesToScan) {
    const src = readFileSync(file, 'utf8')
    scanned += 1
    for (const [lineIndex, line] of src.split('\n').entries()) {
      if (!line.trim()) continue
      let record
      try {
        record = JSON.parse(line)
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error)
        throw new Error(`Cannot parse ${file}:${lineIndex + 1}: ${detail}`)
      }

      for (const finding of findPublicCopyFindings(record)) {
        const context = finding.match.replace(/\s+/g, ' ')
        addHit('corpus: self-certified editorial claim', {
          file: `${file}:${lineIndex + 1}`,
          location: `${finding.recordId} ${finding.path}`,
          match: finding.match,
          context: context.length > 180 ? `${context.slice(0, 177)}…` : context,
        })
      }
    }
  }
  return scanned
}

const publicFilesScanned = scanFiles(files, PATTERNS)
const seedFilesScanned = explicitFiles
  ? 0
  : scanFiles(importedSeedFiles('scripts/seed-data'), SEED_COPY_PATTERNS)
const publicDataFilesScanned = explicitFiles
  ? 0
  : scanGeneratedMedicineFiles(publicDataFiles('data/drugs'))

const sorted = [...hits.entries()].sort((a, b) => b[1].length - a[1].length)
const configuredPatternCount = explicitFiles
  ? PATTERNS.length
  : PATTERNS.length + SEED_COPY_PATTERNS.length + 1
let total = 0
for (const [id, list] of sorted) {
  total += list.length
  console.log(`\n${String(list.length).padStart(4)}  ${id}`)
  for (const h of list.slice(0, 4)) {
    console.log(`      ${h.file}${h.location ? `  ${h.location}` : ''}  …${h.context}…`)
  }
  if (list.length > 4) console.log(`      … and ${list.length - 4} more`)
}
console.log(
  `\nscanned ${publicFilesScanned} public/docs files + ${seedFilesScanned} imported seed files + ` +
    `${publicDataFilesScanned} public-data files · ` +
    (total === 0
      ? `0 hits (no matched patterns; ${configuredPatternCount} configured)`
      : `${total} hits across ${sorted.length} of ${configuredPatternCount} configured patterns`),
)
if (!explicitFiles) {
  console.log(
    'seed exclusions: protected imported batches 19 and 20; protected batches 27–30 are not imported',
  )
}
if (total > 0) process.exitCode = 1
