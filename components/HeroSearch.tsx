/**
 * The homepage's primary control. A plain GET form so it works without JavaScript; there is no
 * client-side behaviour worth the bundle here, so this stays a server component.
 */
export function HeroSearch() {
  return (
    <form role="search" action="/search" method="get" className="search">
      <label htmlFor="q" className="skip-link">
        Search a name or health claim
      </label>
      <input
        id="q"
        name="q"
        type="search"
        className="search__input"
        placeholder="Search a name or health claim"
        autoComplete="off"
      />
      <button type="submit" className="search__btn">
        Check the evidence
      </button>
    </form>
  )
}
