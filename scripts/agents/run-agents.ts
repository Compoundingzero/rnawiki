import 'dotenv/config'

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  compareGeneratedRuns,
  generateCurrentAgentRuns,
  type CurrentAgentManifest,
} from './current-run'

/**
 * Rebuilds the active, post-repair agent package without touching `data/agents/*.json`, which is
 * retained as pre-repair audit evidence. Every invocation runs the graph twice in memory first;
 * any byte difference is a release failure.
 *
 * Usage:
 *   npx tsx scripts/agents/run-agents.ts --date=YYYY-MM-DD
 *   npx tsx scripts/agents/run-agents.ts --check
 */

const OUT_DIR = join(process.cwd(), 'data', 'agents', 'current')

function medicineName(slug: string): string {
  return slug.replace(/-/gu, ' ')
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

function currentCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

function readExistingManifest(): CurrentAgentManifest | undefined {
  const path = join(OUT_DIR, 'manifest.json')
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as CurrentAgentManifest
}

function corpus(corpusFile: string): AgentCorpusEntry[] {
  const rows = readFileSync(corpusFile, 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const parsed = JSON.parse(line) as Record<string, unknown>
      const slug = typeof parsed.slug === 'string' ? parsed.slug : ''
      const name = typeof parsed.name === 'string' ? parsed.name : medicineName(slug)
      const background = parsed.recordedBackground as MedicineRecordedBackground | undefined
      if (!slug || !background || background.version !== 'medicine-background/v1') {
        throw new Error(`Invalid recorded-background row ${index + 1} in ${corpusFile}`)
      }
      return { slug, name, background }
    })
  const slugs = new Set(rows.map((row) => row.slug))
  if (slugs.size !== rows.length) throw new Error(`${corpusFile} contains duplicate medicine slugs`)
  return rows
}

function assertExistingMatches(files: ReadonlyMap<string, string>): void {
  const expected = [...files.keys()].sort()
  if (!existsSync(OUT_DIR))
    throw new Error('data/agents/current does not exist; run without --check')
  const actual = readdirSync(OUT_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Current agent file set differs. Expected ${expected.join(', ')}, found ${actual.join(', ')}`,
    )
  }
  const changed = expected.filter(
    (path) => readFileSync(join(OUT_DIR, path), 'utf8') !== files.get(path),
  )
  if (changed.length > 0)
    throw new Error(`Current agent artifacts are stale: ${changed.join(', ')}`)
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check')
  const existing = readExistingManifest()
  const runDate =
    flag('date') ??
    (checkOnly ? existing?.runDate : undefined) ??
    new Date().toISOString().slice(0, 10)
  const corpusCommit =
    flag('corpus-commit') ?? (checkOnly ? existing?.corpusCommit : undefined) ?? currentCommit()
  const corpusFile =
    flag('corpus-file') ?? join(process.cwd(), 'data', 'recorded-background.ndjson')

  const input = { corpus: corpus(corpusFile), corpusCommit, runDate }
  console.log(
    `[agents] ${input.corpus.length} post-repair records from ${corpusFile} · run date ${runDate} · corpus ${corpusCommit.slice(0, 12)}`,
  )
  const first = await generateCurrentAgentRuns(input)
  const second = await generateCurrentAgentRuns(input)
  const nondeterministic = compareGeneratedRuns(first, second)
  if (nondeterministic.length > 0) {
    throw new Error(`Agent rerun was not byte-identical: ${nondeterministic.join(', ')}`)
  }

  if (checkOnly) {
    assertExistingMatches(first.files)
  } else {
    if (existsSync(OUT_DIR)) {
      const unexpected = readdirSync(OUT_DIR).filter((name) => !first.files.has(name))
      if (unexpected.length > 0) {
        throw new Error(
          `Refusing to overwrite a current package containing unexpected files: ${unexpected.join(', ')}`,
        )
      }
    }
    mkdirSync(OUT_DIR, { recursive: true })
    for (const [path, bytes] of first.files) writeFileSync(join(OUT_DIR, path), bytes)
  }

  for (const artifact of first.manifest.artifacts) {
    console.log(
      `[agents] ${artifact.agentId.padEnd(38)} ${String(artifact.candidateCount).padStart(4)}/${String(artifact.availableCandidateCount).padEnd(6)} retained/available candidates · ${String(artifact.findingCount).padStart(6)} findings · ${artifact.outputDigest.slice(0, 12)}`,
    )
  }
  console.log(
    `[agents] ${first.manifest.totals.candidates} active candidate(s) · ${first.manifest.totals.findings} finding row(s) · deterministic rerun passed${checkOnly ? ' · checked-in files match' : ''}`,
  )
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
