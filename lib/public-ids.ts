/**
 * Parsing and sanitising the two kinds of untrusted text that reach a public database query: a
 * numeric row id from a URL segment, and free text from a query string or slug.
 *
 * WHY BOTH LIVE HERE. Each one had the same defect in more than one place at once, and a helper
 * that only one route imports fixes only that route.
 *
 * `parsePublicId` replaces `Number(raw)` + `Number.isInteger`. That guard let two whole classes of
 * input through to Postgres. Above the int4 range — `/api/v1/claims/2147483648`,
 * `/embed/claim/99999999999` — `Number.isInteger` is still true, the value binds against an
 * `integer` column, and the driver raises `value "2147483648" is out of range for type integer`,
 * which the route's catch turned into a 500 on a path whose own comment promises "malformed id is
 * just another way to not find a claim — same uniform 404". And `Number()` accepts hex, exponent,
 * decimal-point, signed and whitespace-padded spellings, so `/api/v1/claims/0x3F8`, `/1.016e3`,
 * `/1016.0`, `/+1016` and `/%201016%20` each served a byte-identical copy of claim 1016 at another
 * URL, every one of them cacheable for an hour. One record, one URL.
 *
 * `sanitisePublicText` strips C0 control characters. A NUL byte anywhere in a query string or slug
 * made Postgres reject the bound parameter outright (SQLSTATE 22021, "invalid byte sequence for
 * encoding UTF8: 0x00"), so `/search?q=%00`, `/api/v1/search?q=%00` and
 * `/api/v1/entities/bpc%00-157` all returned 500s. The failure happens at parameter binding rather
 * than inside any one query, so it has to be stopped before the value reaches Drizzle, and it has
 * to be stopped in every entry point rather than in one of them. A control character in user input
 * is a no-match, never a server error: callers get back a string that simply finds nothing.
 *
 * Written as a character-code scan rather than a regular expression on purpose. A regex over the
 * control range trips `no-control-regex`, and the only ways to keep the regex are to disable the
 * rule or to weaken the range — neither of which is worth doing to save four lines.
 */

/** Largest value a Postgres `integer` column can hold. Row ids here are `serial`, i.e. int4. */
export const MAX_POSTGRES_INT = 2147483647

/**
 * A public row id, or `null` when the text is not the canonical decimal spelling of an id that
 * could exist. `null` always means 404 — never a 500, and never a second URL for one record.
 */
export function parsePublicId(raw: string): number | null {
  // Canonical decimal only: no sign, no leading zero, no separators, no exponent, no whitespace.
  if (!/^[1-9][0-9]{0,9}$/.test(raw)) return null
  const id = Number(raw)
  return id <= MAX_POSTGRES_INT ? id : null
}

/**
 * Free text on its way into a query. Drops NUL and the other C0 control characters plus DEL, which
 * no legitimate search phrase or slug contains and which Postgres refuses to bind. Tab, newline and
 * carriage return become a single space so a pasted multi-line phrase still searches as words.
 */
export function sanitisePublicText(raw: string): string {
  let out = ''
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0
    if (code === 0x09 || code === 0x0a || code === 0x0d) {
      out += ' '
      continue
    }
    if (code < 0x20 || code === 0x7f) continue
    out += ch
  }
  return out
}
