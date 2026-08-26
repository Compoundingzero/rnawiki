// Site-wide navigation and medical disclaimer. This is static server-rendered markup.

import Link from 'next/link'

const FOOTER_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/browse', label: 'Browse all medicines' },
  { href: '/how-it-works', label: 'How this works' },
  { href: '/editorial-policy', label: 'Editorial policy' },
  { href: '/review-queue', label: 'Review queue' },
]

export function SiteFooter() {
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
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#6E6E73] hover:text-[#0071E3] hover:underline transition"
            >
              {link.label}
            </Link>
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
