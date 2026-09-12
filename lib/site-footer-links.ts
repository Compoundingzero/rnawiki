/**
 * The public footer, defined once.
 *
 * There are two footers — `components/SiteFooter.tsx` for React pages and
 * `components/document/DocumentFooter.tsx` for the plain-HTML document routes, which include every
 * medicine page. They carried the same list by hand and had already drifted: the document footer
 * had a seventh item the React one did not, and a script appended an eighth to one of them at
 * runtime. Defining the list here is what keeps the two honest, and a unit test asserts they match.
 *
 * The list is short on purpose. A footer link earns its place by being somewhere a reader actually
 * needs to get to from the bottom of a page, and four of the six that were here did not:
 *
 *   - **Editorial policy** stated six rules that the evidence surface already states in context,
 *     and its one unique paragraph — what analytics collects and how to withdraw consent — is a
 *     privacy disclosure that belonged on a privacy page. The route now redirects to the review and
 *     corrections section of How RNAWiki works.
 *   - **Analytics choices** put a consent control in the site's furniture on every page. The right
 *     to change or withdraw that choice is preserved and now lives on `/privacy`, with the
 *     explanation beside it rather than three clicks away.
 *   - **Sign in on the front page** was a link to the home page describing what to do once you got
 *     there. The document footer carried it; the React footer never did.
 *   - **Public datasets** serves researchers, who reach it from How RNAWiki works and from the
 *     technical layer of a medicine page. It is not a primary reader need at the foot of every page.
 */
export interface FooterLink {
  href: string
  label: string
}

export const FOOTER_LINKS: ReadonlyArray<FooterLink> = [
  { href: '/browse', label: 'Browse medicines' },
  // docs/specs/hubs.md §3: the `/h` index has to be reachable from the site's own navigation, or
  // no hub is. The home page keeps its frozen search bar and gains nothing.
  { href: '/h', label: 'Compare' },
  { href: '/how-it-works', label: 'How RNAWiki works' },
  { href: '/review-queue', label: 'Review and improve' },
  // Kept because it carries a real control, not because a footer is expected to have one: this is
  // where a reader changes or withdraws the analytics choice the consent panel asked them for.
  { href: '/privacy', label: 'Privacy' },
]

/** Shown above the links on every page. Each line is a claim, so each one has to stay true. */
export const FOOTER_TRUST_LINES = {
  identity: 'RNAWiki.com · Public medicine evidence',
  terms: 'No advertising · Free to read',
  notAdvice:
    'RNAWiki is a public evidence record, not medical advice. Talk to a clinician before changing any treatment.',
} as const
