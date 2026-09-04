import 'dotenv/config'
import { gzipSync } from 'node:zlib'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { readState, writeState, STATE_DIR } from './state'

/**
 * PHASE 5b — fetch the sampled dossier pages from a locally running build.
 *
 * One fetch per page, not two. The change this release makes is purely additive: it appends a
 * results section and one navigator link. So the "before" page is exactly the "after" page with
 * that section removed, and deriving it that way is more faithful than rendering twice under two
 * builds, where any unrelated difference would leak into the comparison.
 *
 * Resumable: a page already on disk is not re-fetched.
 *
 *   npm run build && npx next start -p 3210
 *   npx tsx scripts/trial-results/phase5-render.ts [--origin=http://localhost:3210] [--concurrency=8]
 */

const PAGES_DIR = join(STATE_DIR, 'pages')
const SAMPLE_PATH = join(STATE_DIR, 'phase5-samples.json')

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

async function main(): Promise<void> {
  const origin = flag('origin') ?? 'http://localhost:3210'
  const concurrency = Number(flag('concurrency') ?? 8)
  if (!existsSync(PAGES_DIR)) mkdirSync(PAGES_DIR, { recursive: true })

  const samples = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8')) as {
    corpus: string[]
    allAffected: string[]
  }
  const slugs = [...new Set([...samples.corpus, ...samples.allAffected])].sort()
  const pending = slugs.filter((slug) => !existsSync(join(PAGES_DIR, `${slug}.html.gz`)))
  console.log(
    `[phase5b] ${slugs.length} pages in scope · ${slugs.length - pending.length} already on disk · fetching ${pending.length}`,
  )
  if (pending.length === 0) {
    console.log('[phase5b] already done')
    return
  }

  let done = 0
  let failed = 0
  const started = Date.now()
  const queue = [...pending]
  const workers = Array.from({ length: concurrency }, async () => {
    for (;;) {
      const slug = queue.shift()
      if (!slug) return
      try {
        const response = await fetch(`${origin}/d/${slug}`, {
          headers: { accept: 'text/html' },
          signal: AbortSignal.timeout(60_000),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        writeFileSync(join(PAGES_DIR, `${slug}.html.gz`), gzipSync(await response.text()))
      } catch (error) {
        failed += 1
        console.error(`[phase5b] ${slug}: ${error instanceof Error ? error.message : error}`)
      }
      done += 1
      if (done % 250 === 0) {
        const rate = done / ((Date.now() - started) / 1000)
        console.log(`[phase5b] ${done}/${pending.length} · ${rate.toFixed(1)}/s · ${failed} failed`)
      }
    }
  })
  await Promise.all(workers)
  console.log(
    `[phase5b] fetched ${done - failed} pages, ${failed} failed, in ${((Date.now() - started) / 60_000).toFixed(1)} min`,
  )
  writeState({ ...readState(), phase: '5b-rendered' })
}

main().catch((error: unknown) => {
  console.error(`[phase5b] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
