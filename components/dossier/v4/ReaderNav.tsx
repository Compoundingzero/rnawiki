/**
 * Page-local navigation for the plain-HTML medicine reader.
 *
 * These are ordinary fragment links. They work without JavaScript; the document island adds a
 * current-section marker and moves focus to the destination heading after activation.
 */
export function ReaderNav({
  hasForms,
  hasHumanResults = true,
  hasBodyPath = false,
  hasChangeHistory = false,
  answerLabel = 'The short answer',
  editorial = false,
  variant = 'both',
}: {
  hasForms: boolean
  hasHumanResults?: boolean
  hasBodyPath?: boolean
  hasChangeHistory?: boolean
  answerLabel?: string
  editorial?: boolean
  /** Split the mobile control from the desktop rail so each can sit in the right reading order. */
  variant?: 'mobile' | 'desktop' | 'both'
}) {
  const links = editorial
    ? ([
        ['#answer', 'At a glance'],
        ['#safety', 'Safety and interactions'],
        ['#human-results', 'Results in people'],
        ['#body-path', 'Path through the body'],
        ['#felt-result', 'Why results may differ'],
        ['#measures', 'What was measured'],
        ['#forms', 'Product and form'],
        ['#unknowns', 'What remains unknown'],
        ['#claim-checks', 'How the claim was checked'],
        ['#sources', 'Sources and record'],
        ...(hasChangeHistory ? ([['#change-history', 'What changed on this page']] as const) : []),
      ] as const)
    : ([
        ['#answer', answerLabel],
        ['#safety', 'Safety'],
        ...(hasHumanResults ? ([['#human-results', 'Human studies']] as const) : []),
        ...(hasBodyPath ? ([['#body-path', 'Path through the body']] as const) : []),
        ...(hasForms ? ([['#forms', 'Names and forms']] as const) : []),
        ['#sources', 'Sources and record'],
        ...(hasChangeHistory ? ([['#change-history', 'What changed on this page']] as const) : []),
      ] as const)

  const items = links.map(([href, label]) => (
    <li key={href}>
      <a href={href}>{label}</a>
    </li>
  ))

  return (
    <>
      {variant !== 'mobile' ? (
        <nav aria-label="On this medicine page" className="dv4-nav dv4-simple-nav" data-reader-nav>
          <p className="dv4-nav-title">On this page</p>
          <ol>{items}</ol>
        </nav>
      ) : null}
      {variant !== 'desktop' ? (
        <details className="dv4-mobile-contents">
          <summary>Contents</summary>
          <nav aria-label="On this medicine page" data-reader-nav>
            <ol>{items}</ol>
          </nav>
        </details>
      ) : null}
    </>
  )
}
