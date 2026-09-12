/**
 * The corpus document's header: the wordmark, the medicine search, and nothing else.
 *
 * It paints the same bar `components/SiteHeader.tsx` paints on a dossier view, in the same classes,
 * with the interactive parts left to the document's one script: the script fills the listbox, moves
 * the selection, and opens the field on a small screen. Everything here is in the served HTML, so
 * the field is usable as a form control and the wordmark is a link before any script runs.
 *
 * The account and feedback controls are not here. They belong to the React shell, and a corpus
 * record carries no control that needs an account, so the document stays identical for every
 * reader and can be cached as one response. The footer links to the front page, where signing in
 * is one click.
 */
const SEARCH_ICON = (
  <svg
    aria-hidden="true"
    className="w-3.5 h-3.5 text-[#6E6E73] shrink-0 mr-1.5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

export function DocumentHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-black/[0.06]">
      <div className="max-w-[1180px] sm:px-8 mx-auto px-4">
        <div className="relative flex h-14 items-center justify-between gap-3 sm:h-16">
          <div className="flex items-center gap-3 shrink-0">
            <a className="flex items-center gap-2 select-none shrink-0" href="/">
              <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
                <span className="font-serif text-[#0A66D8]">RNA</span>Wiki
              </span>
            </a>
          </div>

          <div
            className="hidden z-50 min-w-0 flex-1 sm:relative sm:inset-auto sm:top-auto sm:mx-auto sm:block sm:max-w-md sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
            id="rnawiki-search-shell"
          >
            <div className="relative" id="rnawiki-search">
              <div className="flex items-center bg-[#F5F5F7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071E3]/20 focus-within:border-[#0071E3] rounded-full px-3 py-1.5 border border-black/[0.06] transition-all">
                {SEARCH_ICON}
                <input
                  aria-autocomplete="list"
                  aria-controls="rnawiki-search-listbox"
                  aria-expanded="false"
                  aria-label="Search by medicine, condition, gene, or protein"
                  autoComplete="off"
                  className="w-full bg-transparent text-xs text-[#1D1D1F] focus:outline-none placeholder:text-[#6E6E73] font-medium"
                  id="rnawiki-search-input"
                  placeholder="Search medicines, conditions, trials..."
                  role="combobox"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-expanded="false"
              aria-label="Search medicines"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#424245] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] sm:hidden"
              id="rnawiki-search-toggle"
              type="button"
            >
              {SEARCH_ICON}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
