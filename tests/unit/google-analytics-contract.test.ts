import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'components/GoogleAnalytics.tsx'), 'utf8')

describe('Google Analytics source contract', () => {
  it('tracks sanitized pathnames without reading URL query state or account identity', () => {
    expect(source).toContain('usePathname')
    expect(source).not.toContain('useSearchParams')
    expect(source).not.toContain('location.href')
    expect(source).not.toMatch(/user_id|user_properties|search_term|currentUser/)
    expect(source).toContain('send_page_view: false')
  })

  it('loads only after consent and permanently disables advertising signals', () => {
    expect(source).toContain("consent === 'granted'")
    expect(source).toContain("analytics_storage: 'granted'")
    expect(source).toContain("ad_storage: 'denied'")
    expect(source).toContain("ad_user_data: 'denied'")
    expect(source).toContain("ad_personalization: 'denied'")
    expect(source).toContain('allow_google_signals: false')
    expect(source).toContain('allow_ad_personalization_signals: false')
  })
})
