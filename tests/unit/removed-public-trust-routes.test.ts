import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const removedPaths = ['/about', '/corrections'] as const

describe('removed public trust routes', () => {
  it('does not ship the removed route modules', () => {
    expect(existsSync(join(root, 'app/about/page.tsx'))).toBe(false)
    expect(existsSync(join(root, 'app/corrections/page.tsx'))).toBe(false)
  })

  it('does not advertise the removed pages from public discovery surfaces', () => {
    const publicSources = [
      'components/SiteFooter.tsx',
      'app/sitemap.ts',
      'app/llms.txt/route.ts',
      'app/editorial-policy/page.tsx',
    ].map((path) => readFileSync(join(root, path), 'utf8'))

    for (const source of publicSources) {
      for (const removedPath of removedPaths) expect(source).not.toContain(removedPath)
    }
  })
})
