import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The rate-limit allowances a reader gets, and the narrow condition under which they are raised.
 *
 * `lib/rate-limit.ts` reads the allowance once at module load, so a test cannot set `DATABASE_URL`
 * and re-import it inside one vitest process without fighting the module cache. What matters is
 * checkable without that: the numbers a reader is subject to, and that the branch which raises them
 * is decided by the database the process is connected to rather than by a flag anyone can export.
 */
const source = readFileSync(join(process.cwd(), 'lib/rate-limit.ts'), 'utf8')

describe('rate-limit allowances', () => {
  it('keeps the reader-facing numbers exactly where they were', () => {
    expect(source).toContain('limit: allowance(60, 100_000)') // public API, per minute
    expect(source).toContain('limit: allowance(20, 100_000)') // writes, per minute
    expect(source).toContain('limit: allowance(10, 1_000)') // sign-in, per fifteen minutes
    expect(source).toContain('limit: allowance(5, 1_000)') // feedback, per hour
    expect(source).toContain('return TEST_DATABASE ? testLimit : readerLimit')
  })

  it('raises them only for a throwaway database on a loopback host', () => {
    // Both halves matter. A remote host with a test-shaped name, or a local host with a real name,
    // must not qualify.
    expect(source).toContain("parsed.hostname === 'localhost'")
    expect(source).toContain("parsed.hostname === '127.0.0.1'")
    expect(source).toContain('/^\\/rnawiki_test_\\d+_[0-9a-f]+$/.test(parsed.pathname)')
    expect(source).toContain('return local &&')
  })

  it('decides from the database in use, not from an environment flag', () => {
    // The name of the marker the test runner sets must not appear here: a deployed instance could
    // be given it by accident, and it says nothing about which data the process is serving.
    expect(source).not.toContain('E2E_DISPOSABLE_DATABASE')
    expect(source).not.toContain('NODE_ENV')
    expect(source).toContain('process.env.DATABASE_URL')
  })

  it('still says plainly what the limiter is not', () => {
    expect(source).toContain('NOT A SECURITY BOUNDARY')
  })
})
