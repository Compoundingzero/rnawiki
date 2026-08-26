import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const homeQueries = vi.hoisted(() => ({
  countDrugs: vi.fn(),
  countProgrammeEvidence: vi.fn(),
  getFeaturedDrug: vi.fn(),
  getPopularDrugs: vi.fn(),
  getCurrentUser: vi.fn(),
  getProgrammeEvidenceByMedicineSlug: vi.fn(),
  listHomepageContributorSpotlight: vi.fn(),
}))

vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: () => ({ variable: '--font-test-sans' }),
  JetBrains_Mono: () => ({ variable: '--font-test-mono' }),
}))
vi.mock('@/components/AppShell', () => ({ AppShell: vi.fn() }))
vi.mock('@/components/HomeView', () => ({ HomeView: vi.fn() }))
vi.mock('@/lib/queries/drugs', () => ({
  countDrugs: homeQueries.countDrugs,
  countProgrammeEvidence: homeQueries.countProgrammeEvidence,
  getFeaturedDrug: homeQueries.getFeaturedDrug,
  getPopularDrugs: homeQueries.getPopularDrugs,
}))
vi.mock('@/lib/queries/programme-evidence', () => ({
  getProgrammeEvidenceByMedicineSlug: homeQueries.getProgrammeEvidenceByMedicineSlug,
}))
vi.mock('@/lib/queries/homepage-contributor-spotlight', () => ({
  listHomepageContributorSpotlight: homeQueries.listHomepageContributorSpotlight,
}))
vi.mock('@/lib/session', () => ({ getCurrentUser: homeQueries.getCurrentUser }))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('root URL fallback', () => {
  it('renders canonical root metadata and home JSON-LD when SITE_URL is malformed', async () => {
    vi.stubEnv('SITE_URL', 'not a URL')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    homeQueries.getCurrentUser.mockResolvedValue(null)
    homeQueries.getFeaturedDrug.mockResolvedValue(null)
    homeQueries.getPopularDrugs.mockResolvedValue([])
    homeQueries.countDrugs.mockResolvedValue(0)
    homeQueries.countProgrammeEvidence.mockResolvedValue({ programmes: 0, reviewedProgrammes: 0 })
    homeQueries.listHomepageContributorSpotlight.mockResolvedValue({
      week: {
        start: '2026-08-24T00:00:00.000Z',
        endExclusive: '2026-08-31T00:00:00.000Z',
        label: '24–30 August 2026',
      },
      entries: [],
    })

    const [{ metadata }, { default: HomePage }] = await Promise.all([
      import('@/app/layout'),
      import('@/app/page'),
    ])
    expect(metadata.metadataBase?.toString()).toBe('https://rnawiki.com/')
    expect(metadata.openGraph).toMatchObject({ url: 'https://rnawiki.com/' })
    expect(metadata.robots).toMatchObject({ index: false, follow: false })

    const rendered = (await HomePage()) as unknown as {
      props: {
        children: Array<{
          props: { dangerouslySetInnerHTML?: { __html: string } }
        }>
      }
    }
    const serialized = rendered.props.children[0]?.props.dangerouslySetInnerHTML?.__html
    expect(serialized).toBeTypeOf('string')
    expect(JSON.parse(serialized ?? '')).toMatchObject({
      '@graph': [
        { '@id': 'https://rnawiki.com/#organization', url: 'https://rnawiki.com/' },
        { '@id': 'https://rnawiki.com/#website', url: 'https://rnawiki.com/' },
      ],
    })
  })
})
