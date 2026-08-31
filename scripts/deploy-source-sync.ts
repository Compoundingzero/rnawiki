import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SERVICE = 'RNA Intelligence Source Sync'
const ENVIRONMENT = 'production'
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
}

function main(): void {
  const arguments_ = process.argv.slice(2)
  const checkOnly = arguments_.length === 1 && arguments_[0] === '--check'
  if (arguments_.length > 0 && !checkOnly) {
    throw new TypeError('Usage: npm run deploy:source-sync [-- --check]')
  }

  if (git('status', '--porcelain')) {
    throw new Error('Refusing to deploy Source Sync from a dirty working tree. Commit first.')
  }

  const commit = git('rev-parse', '--short=12', 'HEAD')
  const stagingParent = mkdtempSync(join(tmpdir(), 'rnawiki-source-sync-deploy-'))
  const archivePath = join(stagingParent, 'source.tar')
  const stagingRoot = join(stagingParent, 'root')

  try {
    mkdirSync(stagingRoot)
    execFileSync('git', ['archive', '--format=tar', '--output', archivePath, 'HEAD'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    execFileSync('tar', ['-xf', archivePath, '-C', stagingRoot], { stdio: 'inherit' })

    const workerConfig = readFileSync(join(stagingRoot, 'railway.source-sync.toml'), 'utf8')
    if (
      !workerConfig.includes('startCommand = "node --import tsx scripts/source-sync-worker.ts"') ||
      !workerConfig.includes('cronSchedule = "0 */6 * * *"')
    ) {
      throw new Error('The committed source-sync config is missing its worker command or schedule.')
    }

    /*
     * Railway CLI uploads always resolve config from the archive root, even when the service's
     * repository Custom Config Path is `/railway.source-sync.toml`. Stage a clean committed tree
     * and put the worker config at that root; never edit the checkout's web `railway.toml`.
     */
    writeFileSync(join(stagingRoot, 'railway.toml'), workerConfig)

    if (checkOnly) {
      console.log(`[source-sync.deploy] mode=check commit=${commit} staging=verified`)
      return
    }

    console.log(
      `[source-sync.deploy] service=${SERVICE} environment=${ENVIRONMENT} commit=${commit}`,
    )
    const result = spawnSync(
      'railway',
      [
        'up',
        '--service',
        SERVICE,
        '--environment',
        ENVIRONMENT,
        '--detach',
        '--message',
        `Source Sync ${commit}`,
        '--path-as-root',
        stagingRoot,
      ],
      { cwd: repoRoot, env: process.env, stdio: 'inherit' },
    )
    if (result.error) throw result.error
    if (result.status !== 0) {
      throw new Error(`Railway Source Sync upload exited with status ${String(result.status)}.`)
    }
  } finally {
    rmSync(stagingParent, { recursive: true, force: true })
  }
}

main()
