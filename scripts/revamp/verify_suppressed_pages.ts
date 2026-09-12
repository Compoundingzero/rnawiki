/**
 * Phase 3 step 3.7 — render every suppressed page that carries no question row and check that it
 * meets its classification first, in ordinary words.
 *
 * The list comes from `scripts/revamp/suppressed_no_question.py`. This script loads Tier 3 into the
 * disposable database it is handed, serves the built site against it, fetches each page over HTTP
 * and asserts three things per page: a supervision block exists, it is the first block on the page,
 * and no stored class id (`S1`…`S10`) appears anywhere in the rendered text.
 *
 * It never writes to a database it was not handed:
 *
 *     npm run build
 *     npx tsx scripts/with-disposable-database.ts -- \
 *       npx tsx scripts/revamp/verify_suppressed_pages.ts
 *
 * Writes data/revamp/suppressed-no-question-verify.json.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

import 'dotenv/config'
import { Client } from 'pg'

import { supervisionClauses, type SuppressionEvidence } from '@/lib/corpus/suppression-classes'

const ROOT = resolve(import.meta.dirname, '..', '..')
const LIST = join(ROOT, 'data', 'revamp', 'suppressed-no-question.csv')
const OUT = join(ROOT, 'data', 'revamp', 'suppressed-no-question-verify.json')

/** A stored class id, as it would look if one leaked into the reader's text. */
const CLASS_TOKEN = /\bS(?:[1-9]|1[01])\b/

interface Listed {
  key: string
  displayName: string
  classes: string[]
}

interface PageResult {
  key: string
  slug: string | null
  displayName: string
  suppressionClasses: string[]
  status: number | null
  supervisionBlockPresent: boolean
  supervisionBlockFirst: boolean
  labelsRendered: string[]
  labelsMissing: string[]
  classTokensInText: string[]
  passed: boolean
  problems: string[]
}

function parseCsv(text: string): Listed[] {
  const [header, ...lines] = text.trim().split('\n')
  const columns = (header ?? '').split(',')
  const keyAt = columns.indexOf('key')
  const nameAt = columns.indexOf('display_name')
  const classesAt = columns.indexOf('suppression_classes')
  return lines.map((line) => {
    // The written columns hold no comma or quote; a plain split is exact here.
    const cells = line.split(',')
    return {
      key: cells[keyAt] ?? '',
      displayName: cells[nameAt] ?? '',
      classes: (cells[classesAt] ?? '').split(' ').filter(Boolean),
    }
  })
}

/** Everything a reader sees, with markup and comments removed. */
function visibleText(markup: string): string {
  return markup
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer()
    server.once('error', fail)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address === null || typeof address === 'string') {
        fail(new Error('Could not take a free port.'))
        return
      }
      const { port } = address
      server.close(() => done(port))
    })
  })
}

function runToCompletion(command: string, args: string[]): Promise<void> {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: false })
    child.once('error', fail)
    child.once('exit', (code) =>
      code === 0 ? done() : fail(new Error(`${command} exited with ${String(code)}.`)),
    )
  })
}

async function waitForServer(origin: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('The server exited before it answered.')
    try {
      const response = await fetch(`${origin}/`, { redirect: 'manual' })
      if (response.status > 0) return
    } catch {
      /* not listening yet */
    }
    await sleep(1_000)
  }
  throw new Error('The server did not answer within 180 seconds.')
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set.')
  const databaseName = new URL(connectionString).pathname.replace(/^\//, '')
  if (!databaseName.startsWith('rnawiki_test_')) {
    throw new Error(
      `Refusing to run against "${databaseName}". Run this under ` +
        'scripts/with-disposable-database.ts, which hands it a disposable database.',
    )
  }

  const listed = parseCsv(await readFile(LIST, 'utf8'))
  process.stdout.write(`${listed.length} pages to verify.\n`)

  const loadDir = await mkdtemp(join(tmpdir(), 'rnawiki-verify-load-'))
  await runToCompletion('npx', [
    'tsx',
    'scripts/corpus-20k/load/materialise.ts',
    '--tier',
    '3',
    '--load-dir',
    loadDir,
    '--no-checkpoint',
  ])

  const client = new Client({ connectionString })
  await client.connect()
  const rows = await client.query<{
    key: string
    slug: string
    display_name: string
    suppression_classes: string[]
    suppression_evidence: SuppressionEvidence[]
    page_type: string
    question_rows: string
  }>(
    `SELECT p.key,
            p.slug,
            p.display_name,
            p.suppression_classes,
            p.suppression_evidence,
            p.page_type,
            (SELECT count(*) FROM page_questions q WHERE q.key = p.key) AS question_rows
       FROM corpus_pages p
      WHERE p.key = ANY($1)`,
    [listed.map((row) => row.key)],
  )
  await client.end()
  const byKey = new Map(rows.rows.map((row) => [row.key, row]))

  const port = await freePort()
  const origin = `http://127.0.0.1:${String(port)}`
  const server = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, DATABASE_URL: connectionString, PORT: String(port) },
  })

  const results: PageResult[] = []
  try {
    await waitForServer(origin, server)

    for (const page of listed) {
      const row = byKey.get(page.key)
      const problems: string[] = []
      const result: PageResult = {
        key: page.key,
        slug: row?.slug ?? null,
        displayName: row?.display_name ?? page.displayName,
        suppressionClasses: row?.suppression_classes ?? page.classes,
        status: null,
        supervisionBlockPresent: false,
        supervisionBlockFirst: false,
        labelsRendered: [],
        labelsMissing: [],
        classTokensInText: [],
        passed: false,
        problems,
      }
      if (!row) {
        problems.push('no corpus_pages row was loaded for this key')
        results.push(result)
        continue
      }
      if (Number(row.question_rows) !== 0) {
        problems.push(`the loaded record has ${row.question_rows} question rows, expected 0`)
      }

      const response = await fetch(`${origin}/d/${row.slug}`, { redirect: 'manual' })
      result.status = response.status
      const markup = await response.text()
      if (response.status !== 200) {
        problems.push(`the page answered ${String(response.status)}`)
        results.push(result)
        continue
      }

      const blocks = [...markup.matchAll(/data-block="([a-z0-9-]+)"/g)].map((match) => match[1])
      result.supervisionBlockPresent = blocks.includes('supervision')
      result.supervisionBlockFirst = blocks[0] === 'supervision'
      if (!result.supervisionBlockPresent) problems.push('no supervision block was rendered')
      if (!result.supervisionBlockFirst) {
        problems.push(`the first block is ${blocks[0] ?? 'absent'}, not the supervision block`)
      }

      const text = visibleText(markup)
      /*
       * §15(1): the page states one clause per recorded class, each built from that class's own
       * evidence and carrying that class's own source. The generic label this loop used to look
       * for — what a class of that kind might be — is exactly what the answer no longer says, so
       * what is verified is the clause the recorded evidence produces.
       */
      for (const clause of supervisionClauses(
        row.suppression_classes,
        Array.isArray(row.suppression_evidence) ? row.suppression_evidence : [],
      )) {
        if (text.includes(clause.text)) result.labelsRendered.push(clause.text)
        else result.labelsMissing.push(clause.text)
      }
      if (result.labelsMissing.length > 0) {
        problems.push(
          `${String(result.labelsMissing.length)} recorded class clause(s) not rendered`,
        )
      }

      const leaked = text.match(new RegExp(CLASS_TOKEN, 'g'))
      if (leaked) {
        result.classTokensInText = [...new Set(leaked)]
        problems.push(
          `a stored class id reached the reader: ${result.classTokensInText.join(', ')}`,
        )
      }

      result.passed = problems.length === 0
      results.push(result)
    }
  } finally {
    server.kill('SIGTERM')
  }

  const verified = results.filter((row) => row.passed).length
  const report = {
    schema: 'rnawiki-revamp-2026-09/suppressed-no-question-verify/v1',
    step: '3.7',
    generated: new Date().toISOString(),
    source: 'data/revamp/suppressed-no-question.csv',
    database: databaseName,
    pages: results.length,
    verified,
    failed: results.length - verified,
    checks: [
      'the page answers 200',
      'a supervision block is rendered',
      'the supervision block is the first block on the page',
      'every recorded S1-S9 class is named in ordinary words',
      'no stored class id appears in the rendered text',
    ],
    results,
  }
  await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  process.stdout.write(
    `${String(verified)} of ${String(results.length)} pages verified; ` +
      `${String(results.length - verified)} failed. Wrote ${OUT}\n`,
  )
  if (verified !== results.length) process.exitCode = 1
}

await main()
