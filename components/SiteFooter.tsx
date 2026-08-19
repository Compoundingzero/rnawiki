// The site footer — the master reference wireframe's App.tsx footer, class for class, plus two
// rows the wireframe had no need for.
//
// The reference's two lines ("RNAwiki.com • Open Evidence Layer for All Medicines" /
// "Zero advertising • Public knowledge") are untouched: same border, same padding, same #86868B
// on white, same stacked-on-mobile / spread-on-desktop arrangement.
//
// Added below them, deliberately quieter than the reference lines (smaller type, same muted ink):
//
//  1. A single row of navigation the wireframe did not need. It was a two-view demo where every
//     page was reachable from the header; this is a routed site with pages — /browse,
//     /review-queue, /methodology — that otherwise have no permanent way in.
//  2. One line of medical disclaimer. A wireframe holding six fake drugs owed nobody a warning. A
//     public record of real medicines, read by real patients, does.
//
// Neither may compete with the reference's two lines, so both sit at text-[11px] with normal
// weight, under their own hairline, and carry no accent colour until hover.
//
// No 'use client': it is markup and links, so it renders on the server. AppShell (a client
// component) importing it pulls it into that bundle, which is fine — it has no server-only
// dependency and no state.

import Link from 'next/link'

const FOOTER_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/browse', label: 'Browse all medicines' },
  { href: '/review-queue', label: 'Review queue' },
  { href: '/methodology', label: 'How verification works' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-6 text-center text-xs text-[#86868B]">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>RNAwiki.com &bull; Open Evidence Layer for All Medicines</span>
        <span>Zero advertising &bull; Public knowledge</span>
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
              className="text-[#86868B] hover:text-[#0071E3] hover:underline transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] leading-relaxed text-[#86868B]">
          RNAwiki is a public evidence record, not medical advice. Talk to a clinician before
          changing any treatment.
        </p>
      </div>
    </footer>
  )
}
