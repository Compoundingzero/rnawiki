// Site-wide navigation and medical disclaimer. This is static server-rendered markup.
//
// The link list lives in lib/site-footer-links.ts, shared with the plain-document footer so the
// two cannot drift. The analytics control that used to sit at the end of this row now lives on
// /privacy, with the explanation of what it does beside it.

import Link from 'next/link'

import { FOOTER_LINKS, FOOTER_TRUST_LINES } from '@/lib/site-footer-links'

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-6 text-center text-xs text-[#6E6E73]">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>{FOOTER_TRUST_LINES.identity}</span>
        <span>{FOOTER_TRUST_LINES.terms}</span>
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
              className="inline-flex min-h-11 items-center text-[#6E6E73] hover:text-[#0071E3] hover:underline transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] leading-relaxed text-[#6E6E73]">{FOOTER_TRUST_LINES.notAdvice}</p>
      </div>
    </footer>
  )
}
