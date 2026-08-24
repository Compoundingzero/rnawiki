import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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

// These two tics are editorial in any public dataset string, including technical identity fields
// that today's dossier UI does not project. Other seed rules remain limited to reader-copy paths
// so legitimate scientific terms in raw source and molecular fields do not create false alarms.
const ALL_PUBLIC_DATA_STRING_PATTERN_IDS = new Set([
  'seed: self-certified honest language',
  'seed: self-certified plainly language',
])

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

// These keys hold editorial copy rendered to readers. Deliberately omit raw label language,
// molecular fields, technical audit details, and source citations: their terminology is not a
// useful signal for this narrow style gate.
const PUBLIC_DATA_READER_COPY_KEYS = new Set([
  'name',
  'tradeName',
  'patientFriendlyIndication',
  'laymanHowItWorks',
  'anatomicalSite',
  'synthesisCostPerDose',
  'retailPricePerDoseOrYear',
  'markupEstimate',
  'synthesisComplexity',
  'conditionExplainer',
  'whyItMatters',
  'whoTakesThis',
  'clinicalGoals',
  'title',
  'laymanDesc',
  'laymanSummary',
  'strictlyMeasured',
  'unsupportedInferences',
  'whatFailedInitially',
  'realWorldOutcome',
  'description',
  'safetyProfile',
  'q',
  'a',
  'auditNote',
  'summary',
  'howItCompares',
  'comparisonToDrug',
  'prosAndCons',
  'biologicalMechanism',
  'mechanism',
  'dailyUsage',
  'action',
  'patientImpact',
  'clinicalPrecaution',
  'openPatentNotes',
])

// Programme publications mix reader summaries with source records and machine identifiers. Scan
// only the fields the public programme view renders as prose; generic keys such as `text` and
// `indication` would otherwise pull raw source material into this style gate.
const PROGRAMME_EVIDENCE_READER_COPY_PATHS = new Set([
  'programmeEvidence.selectedSummary.text',
  'programmeEvidence.programmes.*.title',
  'programmeEvidence.programmes.*.targetPopulation',
  'programmeEvidence.programmes.*.indication',
  'programmeEvidence.programmes.*.currentPublication.publicLabel',
  'programmeEvidence.programmes.*.currentPublication.oneSentenceReason',
  'programmeEvidence.programmes.*.currentPublication.indicationScope',
  'programmeEvidence.programmes.*.currentPublication.populationScope',
  'programmeEvidence.programmes.*.currentPublication.trialScope',
  'programmeEvidence.programmes.*.currentPublication.outcomeScope',
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

/** Parse checked-in NDJSON and retain only values from explicitly reader-facing copy fields. */
function extractPublicDataProse(src, file) {
  const out = []
  const visit = (value, path) => {
    if (typeof value === 'string') {
      const key = path.at(-1) ?? ''
      const isReaderCopy =
        PUBLIC_DATA_READER_COPY_KEYS.has(key) ||
        PROGRAMME_EVIDENCE_READER_COPY_PATHS.has(path.join('.'))
      if (isReaderCopy && value.length >= 12) out.push(value)
      return
    }
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry, [...path, '*'])
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [childKey, entry] of Object.entries(value)) visit(entry, [...path, childKey])
  }

  for (const [lineIndex, line] of src.split('\n').entries()) {
    if (!line.trim()) continue
    try {
      visit(JSON.parse(line), [])
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Cannot parse ${file}:${lineIndex + 1}: ${detail}`)
    }
  }
  return out.join('\n')
}

/** Parse checked-in NDJSON and retain every string value for the two outright self-certifiers. */
function extractAllPublicDataStrings(src, file) {
  const out = []
  const visit = (value) => {
    if (typeof value === 'string') {
      out.push(value)
      return
    }
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const entry of Object.values(value)) visit(entry)
  }

  for (const [lineIndex, line] of src.split('\n').entries()) {
    if (!line.trim()) continue
    try {
      visit(JSON.parse(line))
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Cannot parse ${file}:${lineIndex + 1}: ${detail}`)
    }
  }
  return out.join('\n')
}

/** Keep path-aware export coverage testable even while the checked-in snapshot has no programmes. */
function verifyProgrammeEvidenceReaderCopyCoverage() {
  const expected = [
    'Selected summary sentinel',
    'Programme title sentinel',
    'Target population sentinel',
    'Programme indication sentinel',
    'Public label sentinel',
    'One sentence reason sentinel',
    'Indication scope sentinel',
    'Population scope sentinel',
    'Trial scope sentinel',
    'Outcome scope sentinel',
  ]
  const fixture = {
    programmeEvidence: {
      selectedSummary: { text: expected[0] },
      programmes: [
        {
          title: expected[1],
          targetPopulation: expected[2],
          indication: expected[3],
          currentPublication: {
            publicLabel: expected[4],
            oneSentenceReason: expected[5],
            indicationScope: expected[6],
            populationScope: expected[7],
            trialScope: expected[8],
            outcomeScope: expected[9],
            sourceText: 'Raw source sentinel must stay outside reader copy',
          },
        },
      ],
    },
  }
  const prose = extractPublicDataProse(JSON.stringify(fixture), '<programme-reader-copy-fixture>')
  for (const sentinel of expected) {
    if (!prose.includes(sentinel)) {
      throw new Error(`Public-data copy scan omitted programme reader field: ${sentinel}`)
    }
  }
  if (prose.includes('Raw source sentinel')) {
    throw new Error('Public-data copy scan included raw programme source text')
  }
}

verifyProgrammeEvidenceReaderCopyCoverage()

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
        if (!hits.has(id)) hits.set(id, [])
        hits.get(id).push({
          file: file.replace(/^.*\/(?=(components|app|lib|scripts))/, ''),
          match: m[0],
          context,
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
const publicDataFilesToScan = explicitFiles ? [] : publicDataFiles('data/drugs')
const publicDataReaderPatterns = SEED_COPY_PATTERNS.filter(
  ({ id }) => !ALL_PUBLIC_DATA_STRING_PATTERN_IDS.has(id),
)
const publicDataFilesScanned = scanFiles(
  publicDataFilesToScan,
  publicDataReaderPatterns,
  extractPublicDataProse,
)
scanFiles(
  publicDataFilesToScan,
  SEED_COPY_PATTERNS.filter(({ id }) => ALL_PUBLIC_DATA_STRING_PATTERN_IDS.has(id)),
  extractAllPublicDataStrings,
)

const sorted = [...hits.entries()].sort((a, b) => b[1].length - a[1].length)
const configuredPatternCount = explicitFiles
  ? PATTERNS.length
  : PATTERNS.length + SEED_COPY_PATTERNS.length
let total = 0
for (const [id, list] of sorted) {
  total += list.length
  console.log(`\n${String(list.length).padStart(4)}  ${id}`)
  for (const h of list.slice(0, 4)) console.log(`      ${h.file}  …${h.context}…`)
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
