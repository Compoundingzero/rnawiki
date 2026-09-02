import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export const PUBLICATION_WORKTREE_PHASES = ['corpus', 'derived', 'clean'] as const

export type PublicationWorktreePhase = (typeof PUBLICATION_WORKTREE_PHASES)[number]

const CORPUS_OUTPUTS = new Set([
  'data/drugs.csv',
  'data/inventory-resolution.ndjson',
  'data/manifest.json',
  'data/recorded-background.ndjson',
  'data/source-consensus.ndjson',
])

const DERIVED_OUTPUTS = new Set([
  'data/agents/current/adverse-reaction-term-structure.json',
  'data/agents/current/coverage-ledger.json',
  'data/agents/current/enzyme-and-transporter-documentation.json',
  'data/agents/current/evidence-density.json',
  'data/agents/current/excerpt-integrity.json',
  'data/agents/current/manifest.json',
  'data/agents/current/mechanism-text-grouping.json',
  'data/agents/current/numeric-distributions.json',
  'data/agents/current/peer-group-anomaly-screen.json',
  'data/agents/current/silence-ledger.json',
  'data/agents/current/substance-synonyms.json',
  'data/audits/denial-corpus/baseline.json',
  'data/audits/denial-corpus/baseline.md',
  'data/audits/denial-corpus/input-manifest.json',
  'data/manifest.json',
  'docs/product/four-audience-evidence-coverage.json',
  'docs/product/four-audience-evidence-coverage.md',
])

const DRUG_SHARD = /^data\/drugs\/drugs-(?:00[1-9]|0[1-9]\d|[1-9]\d{2})\.ndjson$/u

/**
 * The completion corpus is sharded exactly like the medicine corpus, and is allowed in the corpus
 * phase on the same terms: a numbered shard of the published directory, and nothing else.
 */
const COMPLETION_SHARD =
  /^data\/dossier-completion\/dossier-completion-(?:00[1-9]|0[1-9]\d|[1-9]\d{2})\.ndjson$/u

export function isAllowedPublicationPath(phase: PublicationWorktreePhase, path: string): boolean {
  if (phase === 'clean') return false
  if (phase === 'corpus') {
    return CORPUS_OUTPUTS.has(path) || DRUG_SHARD.test(path) || COMPLETION_SHARD.test(path)
  }
  return DERIVED_OUTPUTS.has(path)
}

function nulSeparatedGitPaths(root: string, arguments_: readonly string[]): string[] {
  const output = execFileSync('git', arguments_, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  return output.split('\0').filter(Boolean)
}

export function changedWorktreePaths(root: string = process.cwd()): string[] {
  return [
    ...new Set([
      ...nulSeparatedGitPaths(root, ['diff', '--name-only', '--no-renames', '-z']),
      ...nulSeparatedGitPaths(root, ['diff', '--cached', '--name-only', '--no-renames', '-z']),
      ...nulSeparatedGitPaths(root, ['ls-files', '--others', '--exclude-standard', '-z']),
    ]),
  ].sort()
}

function selectedPhase(arguments_: readonly string[]): PublicationWorktreePhase {
  const value = arguments_.find((argument) => argument.startsWith('--phase='))?.slice(8)
  if (!PUBLICATION_WORKTREE_PHASES.includes(value as PublicationWorktreePhase)) {
    throw new TypeError(
      `Usage: tsx scripts/check/publication-worktree.ts --phase=${PUBLICATION_WORKTREE_PHASES.join('|')}`,
    )
  }
  return value as PublicationWorktreePhase
}

function main(): void {
  const phase = selectedPhase(process.argv.slice(2))
  const changed = changedWorktreePaths()
  const unexpected = changed.filter((path) => !isAllowedPublicationPath(phase, path))
  if (unexpected.length > 0) {
    throw new Error(
      `[publication-worktree] ${phase} phase has unexpected changes:\n${unexpected.map((path) => `- ${path}`).join('\n')}`,
    )
  }
  console.log(
    `[publication-worktree] ${phase} phase: ${changed.length} changed path(s), all allowed`,
  )
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null
if (entryPath === import.meta.url) {
  try {
    main()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
