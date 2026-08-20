import { readFileSync, writeFileSync } from 'node:fs'
import { CANONICAL_PHASE_ORDER } from '../../lib/rna-intelligence/layer3-protocol.ts'

/**
 * Repairs laboratory workflows whose dependency edges run backwards through the canonical phase
 * order — a Cellular_Delivery step declared as depending on an Assay_Quantification step, which
 * says the cell culture waits for the assay that measures it.
 *
 * The engine catches these and withholds the verification badge, which is the system working. This
 * fixes the underlying protocol rather than the symptom: it repoints the offending edge at the
 * nearest EARLIER step whose phase legitimately precedes the dependent one, which is what the
 * author meant. It never reorders steps, renames anything or touches prose.
 *
 * Value-only edits by design: these files are 1.5 MB of template literals, and an earlier attempt
 * at structural surgery on one corrupted it.
 */
const phaseRank = (phase) => CANONICAL_PHASE_ORDER.indexOf(phase)

let totalFixed = 0

for (const file of process.argv.slice(2)) {
  let src = readFileSync(file, 'utf8')

  // Collect every step in the file with its phase, in source order.
  const steps = []
  const stepRe = /id: '([a-z0-9-]+)',\s*\n\s*stepNumber: (\d+),\s*\n\s*phase: '([A-Za-z_]+)'/g
  let m
  while ((m = stepRe.exec(src)) !== null) {
    steps.push({ id: m[1], stepNumber: Number(m[2]), phase: m[3], index: m.index })
  }
  const byId = new Map(steps.map((s) => [s.id, s]))

  // Find every dependency edge and check its direction.
  const depRe = /dependsOnStepId: '([a-z0-9-]+)'/g
  const fixes = []
  while ((m = depRe.exec(src)) !== null) {
    const parentId = m[1]
    const parent = byId.get(parentId)
    if (!parent) continue
    // The dependent step is the last one declared before this dependsOnStepId line.
    const child = [...steps].reverse().find((s) => s.index < m.index)
    if (!child || child.id === parentId) continue
    if (phaseRank(child.phase) >= phaseRank(parent.phase)) continue

    // Backwards edge. Repoint at the nearest earlier step whose phase this one may follow.
    const candidate = [...steps]
      .filter((s) => s.index < child.index && phaseRank(s.phase) <= phaseRank(child.phase))
      .pop()
    if (!candidate) continue

    fixes.push({
      at: m.index,
      length: m[0].length,
      from: parentId,
      to: candidate.id,
      child,
      parent,
    })
  }

  if (fixes.length === 0) continue

  // Apply back to front so earlier offsets stay valid.
  for (const fix of fixes.reverse()) {
    src = src.slice(0, fix.at) + `dependsOnStepId: '${fix.to}'` + src.slice(fix.at + fix.length)
    console.log(
      `${file.split('/').pop()}: "${fix.child.phase}" step no longer waits on "${fix.parent.phase}" (${fix.from} -> ${fix.to})`,
    )
  }
  writeFileSync(file, src)
  totalFixed += fixes.length
}

console.log(`\n${totalFixed} backwards dependency edge(s) repointed`)
