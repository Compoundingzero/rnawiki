import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * There is one medicine layout, and this fails the build if a second one appears.
 *
 * The compass used to be one of three surfaces a medicine could be served as, chosen by
 * `DOSSIER_V4_SLUGS` and `DOSSIER_V3_SLUGS`. Both are gone, along with the corpus document, the
 * dossier v3 components and the React legacy record. A flag that selects a layout is not a feature
 * flag; it is two products, and the one a reader gets depends on a variable nobody remembers to
 * check. So the variable names are banned by name here rather than by habit.
 *
 * What this refuses:
 *
 *   1. either flag name, anywhere in the repository;
 *   2. a re-import of a deleted layout module;
 *   3. the medicine route growing a second rendering branch.
 *
 * It deliberately does not ban the word "v4". The compass's own modules are named `dossier-v4`, and
 * renaming a live directory to satisfy a checker is churn without a reader-facing difference.
 *
 *   npx tsx scripts/check/single-dossier-layout.ts
 */

const BANNED_FLAGS = ['DOSSIER_V4_SLUGS', 'DOSSIER_V3_SLUGS'] as const

const DELETED_LAYOUT_MODULES = [
  '@/components/MedicineDossierV2',
  'components/MedicineDossierV2',
  '@/lib/corpus/document',
  'lib/corpus/document',
  '@/lib/dossier-v3/document',
  'lib/dossier-v3/document',
  '@/lib/document/legacy-forward',
  'lib/document/legacy-forward',
  '@/components/dossier/corpus/CorpusDossierPage',
  'components/dossier/v3/',
  'app/legacy-record',
] as const

/** Directories worth scanning. Build output and dependencies are not source. */
const ROOTS = ['app', 'components', 'lib', 'scripts', 'tests', 'db', 'docs'] as const
const EXTRA_FILES = [
  'next.config.mjs',
  'playwright.config.ts',
  'package.json',
  'railway.toml',
  'railway.source-sync.toml',
  '.env.example',
  'README.md',
  'CLAUDE.md',
] as const

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.next',
  '.git',
  'test-results',
  'playwright-report',
])

/**
 * Files that describe the removal rather than perform it. A worklog explaining what the flag used
 * to do, and this checker naming what it bans, both have to contain the words.
 */
const REMOVAL_RECORDS = [
  'scripts/check/single-dossier-layout.ts',
  'docs/worklogs/',
  'docs/site-content-pruning-2026-09.md',
  'docs/dossier-v4-production-runbook.md',
  'docs/dossier-v4-information-architecture.md',
  'docs/dossier-information-architecture.md',
  'docs/rnawiki-biohacker-rebuild-audit.md',
  'docs/dossier-v4-visual-system.md',
  'docs/specs/',
]

function sourceFiles(root: string): string[] {
  let entries: Array<{ name: string; isDirectory: () => boolean }>
  try {
    entries = readdirSync(root, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    if (SKIP_DIRECTORIES.has(entry.name)) return []
    const path = join(root, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(?:ts|tsx|mjs|json|md|toml|example)$/u.test(entry.name) ? [path] : []
  })
}

interface Finding {
  file: string
  rule: string
  detail: string
}

function main(): void {
  const files = [
    ...ROOTS.flatMap(sourceFiles),
    ...EXTRA_FILES.filter((file) => {
      try {
        return statSync(file).isFile()
      } catch {
        return false
      }
    }),
  ]

  const findings: Finding[] = []

  for (const file of files) {
    const path = relative(process.cwd(), file)
    if (REMOVAL_RECORDS.some((prefix) => path.startsWith(prefix))) continue
    let source: string
    try {
      source = readFileSync(file, 'utf8')
    } catch {
      continue
    }

    for (const flag of BANNED_FLAGS) {
      if (source.includes(flag)) {
        findings.push({
          file: path,
          rule: 'layout flag',
          detail: `${flag} selects a medicine layout. There is one layout; delete the branch instead.`,
        })
      }
    }

    for (const deleted of DELETED_LAYOUT_MODULES) {
      if (source.includes(deleted)) {
        findings.push({
          file: path,
          rule: 'deleted layout',
          detail: `${deleted} was removed with the older medicine layouts.`,
        })
      }
    }
  }

  const route = readFileSync('app/d/[slug]/route.ts', 'utf8')
  const renders = [...route.matchAll(/DocumentResponse\(/gu)].length
  if (renders !== 1) {
    findings.push({
      file: 'app/d/[slug]/route.ts',
      rule: 'one rendering branch',
      detail: `the medicine route builds ${renders} documents; it must build exactly one.`,
    })
  }

  if (findings.length === 0) {
    process.stdout.write(
      `single medicine layout: ${files.length} files checked, no layout flag and no deleted layout module\n`,
    )
    return
  }

  for (const finding of findings) {
    process.stdout.write(`${finding.file} · ${finding.rule} · ${finding.detail}\n`)
  }
  process.stdout.write(`\n${findings.length} problem(s). There is one medicine layout.\n`)
  process.exitCode = 1
}

main()
