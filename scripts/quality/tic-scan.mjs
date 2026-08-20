import { readFileSync } from 'node:fs'

/**
 * Second pass: the rhetorical tics rather than the vocabulary. These are constructions that read
 * as written-by-a-machine even when every individual word is ordinary, and they are the ones a
 * vocabulary blocklist misses entirely.
 */
const TICS = [
  { id: 'definitional inversion ("is not X, it is Y")', re: /\bis not (?:a |an |the )?[\w\s-]{2,40}, (?:it|that|this) is\b/gi },
  { id: '"That is not X. That is Y."', re: /\bThat is not [\w\s-]{2,40}\.\s+That is\b/g },
  { id: '"which is exactly what"', re: /\bwhich is (exactly|precisely) (what|why|the)\b/gi },
  { id: '"worth recording/stating/keeping"', re: /\bworth (recording|stating|keeping|noting|saying)\b/gi },
  { id: '"the whole point"', re: /\bthe whole point\b/gi },
  { id: '"and that is the story/the page"', re: /\b(?:and )?that is (?:the )?(story|page|point|answer|difference)\b/gi },
  { id: '"on purpose" / "deliberately"', re: /\b(on purpose|deliberate(ly)?)\b/gi },
  { id: 'rhetorical "not X but Y" chain', re: /\b(?:not|never) (?:merely|simply|just) [\w\s-]{2,40}\bbut\b/gi },
  { id: 'em-dash', re: /—/g },
  { id: '"in other words"', re: /\bin other words\b/gi },
  { id: '"put simply" / "simply put"', re: /\b(put simply|simply put|to put it)\b/gi },
  { id: 'colon-then-restatement', re: /:\s+(?:that is|namely|in short)\b/gi },
  { id: '"a X that cannot Y is not a Z"', re: /\bA \w+ that (cannot|does not|will not)[\w\s-]{2,50} is not\b/gi },
  { id: '"the difference between X and Y"', re: /\bthe difference between [\w\s-]{2,40} and\b/gi },
  { id: '"far more/less" intensifier', re: /\bfar (more|less|better|worse|cheaper)\b/gi },
]

/**
 * Strips code and comments so only what a reader sees is measured. A comment explaining a trap is
 * not copy, and counting its em-dashes tells you nothing about the site.
 */
function extractProse(src) {
  let s = src
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ')
  s = s.replace(/^\s*\/\/.*$/gm, ' ')
  const out = []
  const stringRe = /'((?:[^'\\]|\\.){12,})'|"((?:[^"\\]|\\.){12,})"|`((?:[^`\\]|\\.){12,})`/g
  let m
  while ((m = stringRe.exec(s)) !== null) out.push(m[1] ?? m[2] ?? m[3] ?? '')
  const jsxRe = />([^<>{}]{16,})</g
  while ((m = jsxRe.exec(s)) !== null) out.push(m[1])
  return out.join('\n')
}

const files = process.argv.slice(2)
const hits = new Map()
let words = 0

for (const file of files) {
  let src
  try { src = extractProse(readFileSync(file, 'utf8')) } catch { continue }
  if (!src.trim()) continue
  words += src.split(/\s+/).length
  for (const { id, re } of TICS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(src)) !== null) {
      if (!hits.has(id)) hits.set(id, [])
      const start = Math.max(0, m.index - 50)
      hits.get(id).push({
        file: file.replace(/^.*\/(?=(components|app|lib|scripts))/, ''),
        context: src.slice(start, m.index + m[0].length + 50).replace(/\s+/g, ' '),
      })
    }
  }
}

for (const [id, list] of [...hits.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const per1k = ((list.length / words) * 1000).toFixed(2)
  console.log(`\n${String(list.length).padStart(4)}  (${per1k}/1k words)  ${id}`)
  for (const h of list.slice(0, 3)) console.log(`      ${h.file}  …${h.context}…`)
  if (list.length > 3) console.log(`      … and ${list.length - 3} more`)
}
console.log(`\n${words.toLocaleString()} words scanned across ${files.length} files`)
