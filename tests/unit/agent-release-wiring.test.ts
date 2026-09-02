import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  changedWorktreePaths,
  isAllowedPublicationPath,
} from '@/scripts/check/publication-worktree'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}
const railway = readFileSync(join(root, 'railway.toml'), 'utf8')
const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
const publication = readFileSync(join(root, '.github/workflows/publish-dataset.yml'), 'utf8')
const migration = readFileSync(join(root, 'db/migrations/0020_agent_review_workbench.sql'), 'utf8')

describe('current agent release wiring', () => {
  it('imports the checked package only after migration and corpus application', () => {
    expect(railway).toContain(
      'preDeployCommand = "npm run db:migrate && npm run apply:name-index && npm run agents:import"',
    )
    expect(railway).not.toContain(
      'preDeployCommand = "npm run db:migrate && npm run apply:background',
    )
    // The Release B1 transition guard compared the corpus with an immutable A.1 commit; it was
    // retired from the gate once the corpus legitimately moved past that release.
    expect(packageJson.scripts.gate).not.toContain('npm run check:b1-source-consensus-transition')
  })

  it('runs one complete local release gate in CI', () => {
    expect(ci).toContain('run: npm run gate')
    expect(ci).toContain('fetch-depth: 0')
    for (const check of [
      'audit:denial-corpus',
      'agents:check',
      'agents:import:check',
      'check:agent-datasets',
      'check:four-audience-coverage',
      'check:dataset-export',
    ]) {
      expect(packageJson.scripts.gate).toContain(`npm run ${check}`)
    }
  })

  it('rebuilds and verifies current projections before dataset publication', () => {
    const ordered = [
      'npm run check:publication-worktree -- --phase=corpus',
      'Commit the immutable corpus snapshot locally',
      'npm run agents:run',
      'npm run attach:agent-datasets',
      'npm run agents:check',
      'npm run check:agent-datasets',
      'npm run check:four-audience-coverage',
      'npm run audit:denial-corpus',
      'npm run check:copy',
      'npm run check:dataset-export',
      'npm run check:publication-worktree -- --phase=derived',
      'Commit derived data only if it moved',
      'run: |\n          test "$(git rev-parse HEAD)" = "$PUBLICATION_COMMIT"\n          npm run gate',
    ]
    let cursor = -1
    for (const command of ordered) {
      const next = publication.indexOf(command)
      expect(next, command).toBeGreaterThan(cursor)
      cursor = next
    }
    expect(publication).not.toContain('git add data/')
    for (const output of [
      'data/drugs.csv',
      'data/agents/current/manifest.json',
      'data/audits/denial-corpus/baseline.json',
      'data/audits/denial-corpus/baseline.md',
      'data/audits/denial-corpus/input-manifest.json',
      'docs/product/four-audience-evidence-coverage.json',
      'docs/product/four-audience-evidence-coverage.md',
    ]) {
      expect(publication).toContain(output)
    }
    expect(publication.indexOf('Commit the immutable corpus snapshot locally')).toBeLessThan(
      publication.indexOf('npm run agents:run'),
    )
    expect(publication).toContain('--corpus-commit="$CORPUS_COMMIT"')
    expect(publication).not.toContain('--corpus-commit="$GITHUB_SHA"')
    expect(publication).toContain(
      'EXISTING_CORPUS_COMMIT=$(node -p "require(\'./data/agents/current/manifest.json\').corpusCommit")',
    )
    expect(publication).toContain(
      'RUN_DATE=$(node -p "require(\'./data/agents/current/manifest.json\').runDate")',
    )
    expect(publication).toContain('if [ "$CORPUS_CHANGED" = "true" ]; then')
    expect(publication).toContain('npm run gate')
    expect(publication.indexOf('npm run gate')).toBeLessThan(publication.indexOf('git push'))
    expect(publication.match(/--phase=clean/gu)).toHaveLength(4)
    expect(publication).toContain('PUBLICATION_COMMIT=$(git rev-parse HEAD)')
    expect(publication).toContain('git push origin "$PUBLICATION_COMMIT:$GITHUB_REF_NAME"')
  })

  it('fails migration explicitly instead of inventing explanations for legacy decisions', () => {
    expect(migration).toContain('legacy agent decision without its exact candidate occurrence')
    expect(migration).toContain('legacy agent decisions still have no explanation')
    expect(migration).toContain(
      'CHECK (nullif(btrim("agent_queue_decisions"."explanation"), \'\') is not null) NOT VALID',
    )
    expect(migration).toContain('VALIDATE CONSTRAINT "agent_queue_decisions_explanation"')
  })
})

describe('dataset publication output allowlist', () => {
  it('admits only the files written by the corpus and derived publication phases', () => {
    expect(isAllowedPublicationPath('corpus', 'data/drugs/drugs-001.ndjson')).toBe(true)
    expect(isAllowedPublicationPath('corpus', 'data/drugs/drugs-999.ndjson')).toBe(true)
    expect(isAllowedPublicationPath('corpus', 'data/manifest.json')).toBe(true)
    expect(isAllowedPublicationPath('corpus', 'data/agents/current/manifest.json')).toBe(false)

    expect(isAllowedPublicationPath('derived', 'data/agents/current/manifest.json')).toBe(true)
    expect(isAllowedPublicationPath('derived', 'data/audits/denial-corpus/baseline.md')).toBe(true)
    expect(
      isAllowedPublicationPath('derived', 'docs/product/four-audience-evidence-coverage.json'),
    ).toBe(true)
  })

  it('rejects lookalike, unrelated, and every non-clean path in the clean phase', () => {
    for (const path of [
      'data/drugs/drugs-000.ndjson',
      'data/drugs/unreviewed.json',
      'data/README.md',
      'data/audits/denial-corpus/operator-notes.md',
      'docs/product/four-audience-evidence-contract.md',
      '.github/workflows/publish-dataset.yml',
    ]) {
      expect(isAllowedPublicationPath('corpus', path), path).toBe(false)
      expect(isAllowedPublicationPath('derived', path), path).toBe(false)
      expect(isAllowedPublicationPath('clean', path), path).toBe(false)
    }
    expect(isAllowedPublicationPath('clean', 'data/manifest.json')).toBe(false)
  })

  it('sees unstaged, staged, and untracked paths before a publication commit', () => {
    const repository = mkdtempSync(join(tmpdir(), 'rnawiki-publication-worktree-'))
    try {
      mkdirSync(join(repository, 'data'), { recursive: true })
      mkdirSync(join(repository, 'docs'), { recursive: true })
      writeFileSync(join(repository, 'data', 'manifest.json'), 'original\n')
      writeFileSync(join(repository, 'docs', 'tracked.md'), 'original\n')
      execFileSync('git', ['init', '--quiet'], { cwd: repository })
      execFileSync('git', ['add', '--all'], { cwd: repository })
      execFileSync(
        'git',
        [
          '-c',
          'user.name=RNAWiki test',
          '-c',
          'user.email=test@rnawiki.invalid',
          'commit',
          '--quiet',
          '-m',
          'fixture',
        ],
        { cwd: repository },
      )

      writeFileSync(join(repository, 'data', 'manifest.json'), 'unstaged\n')
      writeFileSync(join(repository, 'docs', 'tracked.md'), 'staged\n')
      execFileSync('git', ['add', '--', 'docs/tracked.md'], { cwd: repository })
      writeFileSync(join(repository, 'data', 'unapproved.json'), 'untracked\n')

      expect(changedWorktreePaths(repository)).toEqual([
        'data/manifest.json',
        'data/unapproved.json',
        'docs/tracked.md',
      ])
    } finally {
      rmSync(repository, { recursive: true, force: true })
    }
  })
})
