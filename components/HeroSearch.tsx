/**
 * The homepage's primary control. A plain GET form so it works without JavaScript; there is no
 * client-side behaviour worth the bundle here, so this stays a server component.
 *
 * Label and placeholder are the same string on purpose. The label is visually hidden, so the
 * placeholder is the only naming a sighted reader gets, and a screen-reader user must hear the
 * same words rather than a second, differently worded prompt.
 *
 * `search--hero` is a size modifier only. It exists so this one instance can be the dominant
 * element inside the homepage's feature panel without enlarging the header, browse and search-page
 * forms that share `.search`. It must not diverge in structure: the same label, the same input, the
 * same submit button, still a plain GET form that works with JavaScript off.
 */
const SEARCH_LABEL = 'Medicine, treatment or health claim'

export function HeroSearch() {
  return (
    <form role="search" action="/search" method="get" className="search search--hero">
      <label htmlFor="q" className="skip-link">
        {SEARCH_LABEL}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        className="search__input"
        placeholder={SEARCH_LABEL}
        autoComplete="off"
      />
      <button type="submit" className="search__btn">
        Check the evidence
      </button>
    </form>
  )
}
