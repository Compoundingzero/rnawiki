import { readFileSync } from 'node:fs'

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

/** Pull string literals and JSX text out of a source file, skipping code and comments. */
function extractProse(src) {
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

const files = process.argv.slice(2)
const hits = new Map()
let scanned = 0

for (const file of files) {
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  scanned += 1
  const prose = extractProse(src)
  for (const { id, re } of PATTERNS) {
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

const sorted = [...hits.entries()].sort((a, b) => b[1].length - a[1].length)
let total = 0
for (const [id, list] of sorted) {
  total += list.length
  console.log(`\n${String(list.length).padStart(4)}  ${id}`)
  for (const h of list.slice(0, 4)) console.log(`      ${h.file}  …${h.context}…`)
  if (list.length > 4) console.log(`      … and ${list.length - 4} more`)
}
console.log(`\nscanned ${scanned} files · ${total} hits across ${sorted.length} patterns`)
