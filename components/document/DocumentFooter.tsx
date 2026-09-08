/**
 * The corpus document's footer: the same links `components/SiteFooter.tsx` carries, as plain
 * anchors, plus the front-page link that stands in for the header's account control.
 *
 * The analytics-choices control is a button in the React shell. Here the document's script adds it
 * to this list once it knows a measurement id is configured, so a reader with scripts off is not
 * shown a control that cannot do anything.
 */
const FOOTER_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/browse', label: 'Browse all medicines' },
  { href: '/h', label: 'Compare by target, class or pathway' },
  { href: '/datasets', label: 'Public datasets' },
  { href: '/how-it-works', label: 'How this works' },
  { href: '/editorial-policy', label: 'Editorial policy' },
  { href: '/review-queue', label: 'Review queue' },
  { href: '/', label: 'Sign in on the front page' },
]

export function DocumentFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-6 text-center text-xs text-[#6E6E73]">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>RNAWiki.com &bull; Public medicine evidence</span>
        <span>No advertising &bull; Free to read</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5 pt-4 border-t border-black/[0.04] space-y-2">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px]"
          id="rnawiki-footer-nav"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              className="text-[#6E6E73] hover:text-[#0071E3] hover:underline transition"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-[11px] leading-relaxed text-[#6E6E73]">
          RNAWiki is a public evidence record, not medical advice. Talk to a clinician before
          changing any treatment.
        </p>
      </div>
    </footer>
  )
}
