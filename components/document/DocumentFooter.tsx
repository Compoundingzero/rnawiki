/**
 * The plain document's footer: the same links `components/SiteFooter.tsx` carries, as plain
 * anchors, from the same shared list.
 *
 * Nothing is appended to this row at runtime any more. The document's script used to add an
 * "Analytics choices" button once it knew a measurement id was configured, which made this footer
 * differ from the React one depending on the environment. The consent control now lives on
 * /privacy, linked from here like anything else.
 */
import { FOOTER_LINKS, FOOTER_TRUST_LINES } from '@/lib/site-footer-links'

export function DocumentFooter() {
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
          id="rnawiki-footer-nav"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              className="inline-flex min-h-11 items-center text-[#6E6E73] hover:text-[#0071E3] hover:underline transition"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-[11px] leading-relaxed text-[#6E6E73]">{FOOTER_TRUST_LINES.notAdvice}</p>
      </div>
    </footer>
  )
}
