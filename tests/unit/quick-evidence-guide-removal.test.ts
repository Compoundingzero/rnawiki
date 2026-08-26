import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('quick evidence guide removal', () => {
  it('does not ship the guide trigger or modal', () => {
    expect(existsSync(join(process.cwd(), 'components/QuickGuideButton.tsx'))).toBe(false)
    expect(existsSync(join(process.cwd(), 'components/QuickGuideModal.tsx'))).toBe(false)

    expect(source('components/SiteFooter.tsx')).not.toMatch(/Quick evidence guide|QuickGuideButton/)
    expect(source('components/AppShell.tsx')).not.toMatch(/QuickGuideModal/)
  })

  it('does not retain a hidden guide modal state', () => {
    const appContext = source('components/app-context.tsx')

    expect(appContext).not.toMatch(/["']guide["']/)
  })
})
