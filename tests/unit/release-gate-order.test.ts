import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * The release gate builds before it runs the tests that render a document.
 *
 * This is pinned because getting it wrong is invisible locally and fatal in CI, and it was wrong for
 * some time without anyone noticing.
 *
 * Three unit test files render a real HTML document — a hub page, a medicine page, the group index —
 * and a document links the stylesheets the build produced. `lib/document/stylesheets.ts` reads them
 * out of `.next/app-build-manifest.json` and throws if that file is missing, on the grounds that a
 * build which cannot be read is a broken deployment rather than a page to serve unstyled. That is
 * the right behaviour.
 *
 * The gate used to run `test:unit` before `build`. On a developer's machine `.next` is left over
 * from the last build, so the gate passed. On a clean CI checkout the manifest does not exist yet,
 * so `tests/unit/hubs-render.test.ts` failed with ENOENT on every run — the release gate had been
 * red in CI for days while being green locally, which is the worst possible arrangement: the signal
 * that is supposed to be trustworthy is the one that is wrong.
 *
 * Building first costs nothing the gate was not already paying, since the browser tests need the
 * same build.
 */

const SCRIPTS = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
}

describe('release gate order', () => {
  const gate = SCRIPTS.scripts.gate ?? ''

  it('has a gate that runs the build and the tests', () => {
    expect(gate).toContain('npm run build')
    expect(gate).toContain('npm run test:unit')
    expect(gate).toContain('npm run test:integration')
    expect(gate).toContain('npm run test:e2e')
  })

  for (const stage of ['test:unit', 'test:integration', 'test:e2e']) {
    it(`builds before it runs ${stage}`, () => {
      const build = gate.indexOf('npm run build')
      const tests = gate.indexOf(`npm run ${stage}`)
      expect(build).toBeGreaterThanOrEqual(0)
      expect(tests).toBeGreaterThanOrEqual(0)
      expect(
        build,
        `${stage} runs before the build, so any test that renders a document will fail on a clean checkout with no .next directory`,
      ).toBeLessThan(tests)
    })
  }
})
