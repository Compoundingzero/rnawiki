import 'dotenv/config'

import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'

import { Client } from 'pg'

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const DATABASE_NAME_PATTERN = /^rnawiki_test_[a-z0-9_]+$/

export function quoteDisposableDatabaseIdentifier(value: string): string {
  if (!DATABASE_NAME_PATTERN.test(value)) {
    throw new Error('Refusing to use an unexpected disposable database name.')
  }
  return `"${value}"`
}

export function commandFrom(argv: readonly string[]): string[] {
  const separator = argv.indexOf('--')
  const command = separator >= 0 ? argv.slice(separator + 1) : [...argv]
  if (command.length === 0) {
    throw new Error(
      'Usage: npx tsx scripts/with-disposable-database.ts -- <command> [arguments...]',
    )
  }
  return command
}

export function isLocalDatabaseUrl(value: string): boolean {
  const url = new URL(value)
  return (
    (url.protocol === 'postgres:' || url.protocol === 'postgresql:') &&
    LOCAL_DATABASE_HOSTS.has(url.hostname)
  )
}

export function disposableDatabaseName(now = Date.now(), entropy?: string): string {
  const suffix = entropy ?? randomBytes(5).toString('hex')
  const name = `rnawiki_test_${now}_${suffix}`
  if (!DATABASE_NAME_PATTERN.test(name)) {
    throw new Error('Could not create a safe disposable database name.')
  }
  return name
}

function run(command: readonly string[], databaseUrl: string): Promise<number> {
  const [executable, ...args] = command
  if (!executable) throw new Error('A command is required.')

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        E2E_DISPOSABLE_DATABASE: '1',
      },
      stdio: 'inherit',
      shell: false,
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${executable} ended after signal ${signal}.`))
        return
      }
      resolve(code ?? 1)
    })
  })
}

export async function main(): Promise<void> {
  const command = commandFrom(process.argv.slice(2))
  const configuredUrl = process.env.DATABASE_URL
  if (!configuredUrl) throw new Error('DATABASE_URL is required.')

  const baseUrl = new URL(configuredUrl)
  if (!isLocalDatabaseUrl(configuredUrl)) {
    throw new Error(
      `Refusing to create a disposable database using ${baseUrl.protocol}//${baseUrl.hostname}.`,
    )
  }

  const databaseName = disposableDatabaseName()
  const adminUrl = new URL(baseUrl)
  adminUrl.pathname = '/postgres'
  const disposableUrl = new URL(baseUrl)
  disposableUrl.pathname = `/${databaseName}`

  const admin = new Client({ connectionString: adminUrl.toString() })
  let connected = false
  let created = false
  try {
    await admin.connect()
    connected = true
    await admin.query(`CREATE DATABASE ${quoteDisposableDatabaseIdentifier(databaseName)}`)
    created = true
    process.stdout.write(`Created disposable database ${databaseName}.\n`)

    const migrationCode = await run(['npm', 'run', 'db:migrate'], disposableUrl.toString())
    if (migrationCode !== 0) {
      throw new Error(`Database migration failed with exit code ${migrationCode}.`)
    }

    const commandCode = await run(command, disposableUrl.toString())
    if (commandCode !== 0) process.exitCode = commandCode
  } finally {
    try {
      if (connected && created) {
        await admin.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
          [databaseName],
        )
        await admin.query(
          `DROP DATABASE IF EXISTS ${quoteDisposableDatabaseIdentifier(databaseName)}`,
        )
        process.stdout.write(`Dropped disposable database ${databaseName}.\n`)
      }
    } finally {
      if (connected) await admin.end()
    }
  }
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null
if (entryPath === import.meta.url) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Disposable database run failed.'
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  })
}
