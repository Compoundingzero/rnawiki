import { readFileSync } from 'node:fs'

/**
 * The strongest slop signal in a corpus written by many agents to one brief is not vocabulary, it
 * is REPETITION: the same stock sentence appearing on twelve different drug pages. A reader who
 * opens two dossiers notices immediately, and no blocklist catches it.
 *
 * Counts repeated 8-word sequences across the whole corpus and reports the ones that recur.
 */
function extractProse(src) {
  let s = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
  const out = []
  const re = /'((?:[^'\\]|\\.){24,})'|"((?:[^"\\]|\\.){24,})"|`((?:[^`\\]|\\.){24,})`/g
  let m
  while ((m = re.exec(s)) !== null) out.push((m[1] ?? m[2] ?? m[3] ?? '').replace(/\\'/g, "'"))
  return out
}

const N = 8
const counts = new Map()
const where = new Map()

for (const file of process.argv.slice(2)) {
  let strings
  try { strings = extractProse(readFileSync(file, 'utf8')) } catch { continue }
  const short = file.split('/').pop()
  for (const str of strings) {
    const words = str.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean)
    for (let i = 0; i + N <= words.length; i += 1) {
      const gram = words.slice(i, i + N).join(' ')
      counts.set(gram, (counts.get(gram) ?? 0) + 1)
      if (!where.has(gram)) where.set(gram, new Set())
      where.get(gram).add(short)
    }
  }
}

const repeated = [...counts.entries()]
  .filter(([gram, n]) => n >= 3 && where.get(gram).size >= 2)
  .sort((a, b) => b[1] - a[1])

// Collapse overlapping n-grams: keep the longest representative of each cluster.
const kept = []
for (const [gram, n] of repeated) {
  if (kept.some((k) => k.gram.includes(gram.slice(0, 40)))) continue
  kept.push({ gram, n, files: where.get(gram).size })
}

for (const { gram, n, files } of kept.slice(0, 25)) {
  console.log(`${String(n).padStart(3)}×  in ${files} files  "${gram}"`)
}
console.log(`\n${kept.length} repeated phrases (8+ words, 3+ occurrences, 2+ files)`)
