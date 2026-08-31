import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}
const worker = readFileSync(join(root, 'scripts/source-sync-worker.ts'), 'utf8')
const deployer = readFileSync(join(root, 'scripts/deploy-source-sync.ts'), 'utf8')
const railway = readFileSync(join(root, 'railway.source-sync.toml'), 'utf8')
const deploymentDocs = readFileSync(join(root, 'docs/deployment.md'), 'utf8')

describe('private source-sync worker wiring', () => {
  it('has one direct entry point for both bounded source workloads', () => {
    expect(packageJson.scripts['sync:sources']).toBe(
      'node --import tsx scripts/source-sync-worker.ts',
    )
    expect(worker).toContain('runDueClinicalTrialsSourceBatch')
    expect(worker).toContain('runBackgroundFreshness')
    expect(worker).toContain('limit: 25')
    expect(worker).toContain('concurrency: 4')
    expect(worker).toContain('maxRuntimeMs: 20 * 60_000')
  })

  it('keeps transient background-source states out of the process failure contract', () => {
    expect(worker).toContain('if (clinicalTrials.counts.failed > 0) process.exitCode = 1')
    expect(worker).not.toMatch(/fetchCounts[^\n]*process\.exitCode/u)
    expect(worker).not.toMatch(/assertionCounts[^\n]*process\.exitCode/u)
    expect(worker).not.toMatch(/candidatesEmitted[^\n]*process\.exitCode/u)
  })

  it('mirrors the persistent Railway service configuration without web-only commands', () => {
    expect(railway).toContain('builder = "NIXPACKS"')
    expect(railway).toContain('buildCommand = "./node_modules/.bin/tsc --noEmit"')
    expect(railway).toContain('preDeployCommand = "node --import tsx db/migrate.ts"')
    expect(railway).toContain('startCommand = "node --import tsx scripts/source-sync-worker.ts"')
    expect(railway).toContain('cronSchedule = "0 */6 * * *"')
    expect(railway).toContain('restartPolicyType = "ON_FAILURE"')
    expect(railway).toContain('restartPolicyMaxRetries = 1')
    expect(railway).not.toContain('next start')
    expect(railway).not.toContain('SESSION_SECRET')
    expect(railway).not.toContain('healthcheckPath')
  })

  it('pins the service-level custom config path instead of inventing an upload flag', () => {
    expect(railway).toContain('Custom Config Path must be `/railway.source-sync.toml`')
    expect(deploymentDocs).toContain('`/railway.source-sync.toml`')
    expect(deploymentDocs).not.toContain('railway up --config')
  })

  it('isolates CLI uploads from the web config without copying local secrets', () => {
    expect(packageJson.scripts['deploy:source-sync']).toBe(
      'node --import tsx scripts/deploy-source-sync.ts',
    )
    expect(packageJson.scripts['check:source-sync-deploy']).toBe(
      'node --import tsx scripts/deploy-source-sync.ts --check',
    )
    expect(deployer).toContain("git('status', '--porcelain')")
    expect(deployer).toContain("['archive', '--format=tar', '--output', archivePath, 'HEAD']")
    expect(deployer).toContain("readFileSync(join(stagingRoot, 'railway.source-sync.toml')")
    expect(deployer).toContain("writeFileSync(join(stagingRoot, 'railway.toml'), workerConfig)")
    expect(deployer).toContain("'--path-as-root'")
    expect(deployer).toContain("arguments_[0] === '--check'")
    expect(deployer).toContain("const SERVICE = 'RNA Intelligence Source Sync'")
    expect(deployer).toContain('rmSync(stagingParent, { recursive: true, force: true })')
    expect(deployer).not.toContain("join(repoRoot, '.env')")
    expect(deployer).not.toContain("'--no-gitignore'")
  })
})
