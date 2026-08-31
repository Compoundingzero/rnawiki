import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'

import { loadCurrentAgentPackage } from './load-current-package'

const DATASET_MANIFEST_PATH = join(process.cwd(), 'data', 'manifest.json')
const CURRENT_AGENT_MANIFEST_RELATIVE_PATH = 'data/agents/current/manifest.json'
const CURRENT_AGENT_MANIFEST_PATH = join(process.cwd(), CURRENT_AGENT_MANIFEST_RELATIVE_PATH)
const LICENCE = 'CC BY 4.0 — see LICENSE-DATA'

const fileSchema = z
  .object({
    path: z.string().min(1),
    rows: z.number().int().nonnegative(),
    bytes: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[0-9a-f]{64}$/u),
    schemaVersion: z.string().min(1),
    mediaType: z.string().min(1),
    licence: z.string().min(1),
    description: z.string().min(1),
    limitations: z.string().min(1),
  })
  .passthrough()

const datasetManifestSchema = z
  .object({
    generatedAt: z.string().min(1),
    source: z.string().min(1),
    licence: z.string().min(1),
    counts: z.record(z.number().int().nonnegative()),
    files: z.array(fileSchema),
  })
  .passthrough()

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function expectedEntry(input: { bytes: Buffer; agentRuns: number }): z.infer<typeof fileSchema> {
  return {
    path: CURRENT_AGENT_MANIFEST_RELATIVE_PATH,
    rows: input.agentRuns,
    bytes: input.bytes.byteLength,
    sha256: sha256(input.bytes),
    schemaVersion: 'rnawiki-current-agent-manifest/v1',
    mediaType: 'application/json',
    licence: LICENCE,
    description:
      'Manifest for the current deterministic detector runs used by the bounded public dataset projections and private evidence-review queue.',
    limitations:
      'The manifest describes detector output, not medical findings. Its nested hashes cover the exact run artifacts; public readers expose only allowlisted projections and never the review queue.',
  }
}

function main(): void {
  const checkOnly = process.argv.includes('--check')
  const currentPackage = loadCurrentAgentPackage()
  const manifest = datasetManifestSchema.parse(
    JSON.parse(readFileSync(DATASET_MANIFEST_PATH, 'utf8')),
  )
  if (manifest.licence !== LICENCE) {
    throw new Error(`Dataset manifest must declare ${LICENCE} before agent artifacts are attached`)
  }

  const currentBytes = readFileSync(CURRENT_AGENT_MANIFEST_PATH)
  const expected = expectedEntry({
    bytes: currentBytes,
    agentRuns: currentPackage.manifest.artifacts.length,
  })
  const existingEntries = manifest.files.filter(
    (entry) => entry.path === CURRENT_AGENT_MANIFEST_RELATIVE_PATH,
  )
  const expectedCounts = {
    agentRuns: currentPackage.manifest.artifacts.length,
    agentCandidates: currentPackage.manifest.totals.candidates,
    agentFindings: currentPackage.manifest.totals.findings,
  }

  if (checkOnly) {
    if (
      existingEntries.length !== 1 ||
      JSON.stringify(existingEntries[0]) !== JSON.stringify(expected) ||
      manifest.counts.agentRuns !== expectedCounts.agentRuns ||
      manifest.counts.agentCandidates !== expectedCounts.agentCandidates ||
      manifest.counts.agentFindings !== expectedCounts.agentFindings
    ) {
      throw new Error(
        'The dataset manifest does not match the current deterministic agent package; run npm run attach:agent-datasets',
      )
    }
    console.log(
      `[agents:attach] dataset manifest covers ${expectedCounts.agentRuns} current run(s), ${expectedCounts.agentCandidates} candidate(s), and ${expectedCounts.agentFindings} finding row(s)`,
    )
    return
  }

  const next = {
    ...manifest,
    counts: { ...manifest.counts, ...expectedCounts },
    files: [
      ...manifest.files.filter((entry) => entry.path !== CURRENT_AGENT_MANIFEST_RELATIVE_PATH),
      expected,
    ],
  }
  writeFileSync(DATASET_MANIFEST_PATH, `${JSON.stringify(next, null, 2)}\n`)
  console.log(
    `[agents:attach] attached ${expectedCounts.agentRuns} current run(s) and their nested hashes to data/manifest.json`,
  )
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
