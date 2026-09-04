/**
 * The sites the design study captures, one entry per site, with the exact pages Phase 1 measured
 * so that Phase 3 captures land on the same pages. A2 sites carry a candidate content page; the
 * legal gate verifies each URL exists and may replace `content` with a better public page, recording
 * the replacement in state.json.
 *
 * Keys are the identifiers used in data/design-study/state.json and as capture directory names
 * (after `dirName()`). Do not rename a key once captures exist under it.
 */

export type Track = 'A1' | 'A2' | 'baseline'

export interface StudySite {
  key: string
  track: Track
  /** Index / landing page. */
  index: string
  /** Content-heavy page used for scroll-depth captures and the reading column. */
  content: string
  /** Where to look for terms of service; the legal gate verifies and may replace. */
  termsCandidates: string[]
  note?: string
}

export const SITES: StudySite[] = [
  // --- A1: the ten reference sites (Phase 1 pages) ---
  {
    key: 'wikiwand.com',
    track: 'A1',
    index: 'https://www.wikiwand.com/',
    content: 'https://www.wikiwand.com/en/articles/Metformin',
    termsCandidates: [
      'https://www.wikiwand.com/terms',
      'https://www.wikiwand.com/en/terms-of-service',
    ],
    note: 'Blocked by a Cloudflare interstitial in Phase 1. Retry through a real Chrome profile before declaring unreachable.',
  },
  {
    key: 'stripe.com/docs',
    track: 'A1',
    index: 'https://docs.stripe.com/payments',
    content: 'https://docs.stripe.com/api/charges',
    termsCandidates: [
      'https://stripe.com/legal/consumer',
      'https://stripe.com/legal/ssa',
      'https://docs.stripe.com/terms',
    ],
  },
  {
    key: 'vercel.com/docs',
    track: 'A1',
    index: 'https://vercel.com/docs',
    content: 'https://vercel.com/docs/deployments',
    termsCandidates: ['https://vercel.com/legal/terms'],
  },
  {
    key: 'linear.app/method',
    track: 'A1',
    index: 'https://linear.app/method',
    content: 'https://linear.app/method/introduction',
    termsCandidates: ['https://linear.app/terms'],
  },
  {
    key: 'quantamagazine.org',
    track: 'A1',
    index: 'https://www.quantamagazine.org/',
    content:
      'https://www.quantamagazine.org/genome-duplication-is-a-radical-evolutionary-gamble-20260902/',
    termsCandidates: [
      'https://www.quantamagazine.org/terms-conditions/',
      'https://www.quantamagazine.org/terms/',
    ],
  },
  {
    key: 'theverge.com',
    track: 'A1',
    index: 'https://www.theverge.com/',
    content: 'https://www.theverge.com/tech/988265/anker-sleep-earbuds-4-pro-price-date-specs',
    termsCandidates: [
      'https://www.voxmedia.com/legal/terms-of-use',
      'https://www.theverge.com/legal/terms-of-use',
    ],
  },
  {
    key: 'smashingmagazine.com',
    track: 'A1',
    index: 'https://www.smashingmagazine.com/',
    content:
      'https://www.smashingmagazine.com/2026/08/rethinking-data-visualisation-ux-approach-dashboards/',
    termsCandidates: [
      'https://www.smashingmagazine.com/terms-of-use/',
      'https://www.smashingmagazine.com/privacy-policy/',
    ],
  },
  {
    key: 'pudding.cool',
    track: 'A1',
    index: 'https://pudding.cool/',
    content: 'https://pudding.cool/2026/07/essential-words',
    termsCandidates: ['https://pudding.cool/about/', 'https://pudding.cool/terms/'],
  },
  {
    key: 'atlasobscura.com',
    track: 'A1',
    index: 'https://www.atlasobscura.com/',
    content: 'https://www.atlasobscura.com/articles/all-places-in-the-atlas-on-one-map',
    termsCandidates: [
      'https://www.atlasobscura.com/terms',
      'https://www.atlasobscura.com/terms-of-use',
    ],
  },
  {
    key: 'awwwards.com',
    track: 'A1',
    index: 'https://www.awwwards.com/',
    content: 'https://www.awwwards.com/websites/',
    termsCandidates: ['https://www.awwwards.com/terms-of-use/', 'https://www.awwwards.com/terms/'],
  },

  // --- A2: the nine community sites of Track B (information design) ---
  {
    key: 'openhumans.org',
    track: 'A2',
    index: 'https://www.openhumans.org/',
    content: 'https://www.openhumans.org/explore-share/',
    termsCandidates: [
      'https://www.openhumans.org/terms/',
      'https://www.openhumans.org/terms-of-use/',
    ],
  },
  {
    key: 'biohackrxiv (osf.io)',
    track: 'A2',
    index: 'https://osf.io/preprints/biohackrxiv',
    content: 'https://osf.io/preprints/biohackrxiv/discover',
    termsCandidates: [
      'https://github.com/CenterForOpenScience/cos.io/blob/master/TERMS_OF_USE.md',
      'https://osf.io/terms',
    ],
    note: 'Content page: the legal gate should replace `content` with one public preprint page found through api.osf.io.',
  },
  {
    key: 'wiki.biohack.me',
    track: 'A2',
    index: 'https://wiki.biohack.me/',
    content: 'https://wiki.biohack.me/index.php?title=Magnets',
    termsCandidates: [
      'https://wiki.biohack.me/index.php?title=Biohack.me_Wiki:General_disclaimer',
      'https://wiki.biohack.me/index.php?title=Biohack.me_Wiki:Copyrights',
    ],
    note: 'Largely implants and cybernetics; say so rather than forcing it to fit.',
  },
  {
    key: 'longevity wiki (url to verify)',
    track: 'A2',
    index: 'https://longevitywiki.org/',
    content: 'https://longevitywiki.org/',
    termsCandidates: [],
    note: 'Canonical URL must be verified by the legal gate before anything else; candidates include longevitywiki.org, en.longevitywiki.org, www.longevitywiki.org. Record what resolved.',
  },
  {
    key: 'forum.quantifiedself.com',
    track: 'A2',
    index: 'https://forum.quantifiedself.com/',
    content: 'https://forum.quantifiedself.com/latest',
    termsCandidates: [
      'https://forum.quantifiedself.com/tos',
      'https://forum.quantifiedself.com/guidelines',
    ],
    note: 'A forum. Screenshots for information-design study only; extract nothing.',
  },
  {
    key: 'longecity.org',
    track: 'A2',
    index: 'https://www.longecity.org/forum/',
    content: 'https://www.longecity.org/forum/forum/3-supplements/',
    termsCandidates: [
      'https://www.longecity.org/forum/terms/',
      'https://www.longecity.org/forum/page/terms',
    ],
    note: 'A forum. Screenshots for information-design study only; extract nothing.',
  },
  {
    key: 'experiment.com',
    track: 'A2',
    index: 'https://experiment.com/',
    content: 'https://experiment.com/discover',
    termsCandidates: ['https://experiment.com/terms', 'https://experiment.com/legal/terms'],
    note: 'Content page: the legal gate should replace `content` with one public project page.',
  },
  {
    key: 'zenodo.org',
    track: 'A2',
    index: 'https://zenodo.org/',
    content: 'https://zenodo.org/search?q=longevity',
    termsCandidates: ['https://about.zenodo.org/terms/', 'https://about.zenodo.org/policies/'],
    note: 'Content page: the legal gate should replace `content` with one public record page found through the Zenodo REST API.',
  },
  {
    key: 'sphere.diybio.org',
    track: 'A2',
    index: 'https://sphere.diybio.org/',
    content: 'https://sphere.diybio.org/',
    termsCandidates: ['https://sphere.diybio.org/terms', 'https://diybio.org/terms'],
    note: 'Content page: the legal gate should replace `content` with one public project page if one exists.',
  },

  // --- baseline: our own site, no legal gate needed ---
  {
    key: 'rnawiki.com',
    track: 'baseline',
    index: 'https://rnawiki.com/',
    content: 'https://rnawiki.com/d/metformin',
    termsCandidates: [],
    note: 'Our own site. Captured as the baseline the reference captures are judged against. The capture tool is tested here first.',
  },
]

export function siteByKey(key: string): StudySite {
  const site = SITES.find((s) => s.key === key)
  if (!site) throw new Error(`Unknown study site key: ${key}`)
  return site
}

/** Directory-safe name, matching the Phase 1 JSON naming (`stripe_com_docs`). */
export function dirName(key: string): string {
  return key
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
