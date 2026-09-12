import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const removedPaths = ['/about', '/corrections', '/editorial-policy'] as const

describe('removed public trust routes', () => {
  it('does not ship the removed route modules', () => {
    expect(existsSync(join(root, 'app/about/page.tsx'))).toBe(false)
    expect(existsSync(join(root, 'app/corrections/page.tsx'))).toBe(false)
    // /editorial-policy stated rules the evidence surface states in context; its one unique
    // paragraph became /privacy, and the route redirects to /how-it-works#review-and-corrections.
    expect(existsSync(join(root, 'app/editorial-policy/page.tsx'))).toBe(false)
  })

  it('does not advertise the removed pages from public discovery surfaces', () => {
    const publicSources = [
      'components/SiteFooter.tsx',
      'components/document/DocumentFooter.tsx',
      'lib/site-footer-links.ts',
      'lib/corpus/sitemap.ts',
      'app/llms.txt/route.ts',
    ].map((path) => readFileSync(join(root, path), 'utf8'))

    for (const source of publicSources) {
      for (const removedPath of removedPaths) expect(source).not.toContain(removedPath)
    }
  })
})
