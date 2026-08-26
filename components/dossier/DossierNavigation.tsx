export interface DossierNavigationProps {
  className?: string
  hasEvidence: boolean
  hasMechanism: boolean
  hasStudyEvidence: boolean
  safetyHref?: string
}

interface NavigationLink {
  href: string
  label: string
}

/**
 * Dossier-only navigation over one canonical, server-rendered record. These are ordinary links,
 * not audience modes: they never swap, rewrite, or hide medical claims.
 */
export function DossierNavigation({
  className,
  hasEvidence,
  hasMechanism,
  hasStudyEvidence,
  safetyHref,
}: DossierNavigationProps) {
  const sectionLinks: NavigationLink[] = [
    { href: '#what-it-is', label: 'Answer' },
    ...(hasEvidence || hasStudyEvidence
      ? [{ href: hasEvidence ? '#evidence-support' : '#study-measurements', label: 'Evidence' }]
      : []),
    ...(safetyHref ? [{ href: safetyHref, label: 'Safety' }] : []),
    ...(hasMechanism ? [{ href: '#mechanism-map', label: 'How it works' }] : []),
    { href: '#sources', label: 'Sources' },
  ]

  return (
    <div
      className={`sticky top-14 z-30 -mx-4 mt-8 min-w-0 overflow-hidden border-y border-black/[0.08] bg-[#F5F5F7]/95 backdrop-blur-xl sm:-mx-8 ${className ?? ''}`}
      data-testid="dossier-local-navigation"
    >
      <nav aria-label="Medicine dossier sections" className="mx-auto min-w-0 max-w-[1180px]">
        <ul className="flex min-w-0 flex-wrap items-center gap-1 px-4 sm:px-8">
          {sectionLinks.map((link, index) => (
            <li key={link.href} className="min-w-0">
              <a
                href={link.href}
                aria-current={index === 0 ? 'location' : undefined}
                className={`inline-flex min-h-11 max-w-full items-center border-b-2 px-2.5 [overflow-wrap:anywhere] text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A66D8] sm:px-3 ${index === 0 ? 'border-[#0A66D8] text-[#0A66D8]' : 'border-transparent text-[#515154] hover:border-black/20 hover:text-[#0A66D8]'}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
