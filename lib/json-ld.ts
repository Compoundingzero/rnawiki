/**
 * Serialise a JSON-LD object for injection into a <script type="application/ld+json"> block.
 *
 * WHY THIS EXISTS. `JSON.stringify` escapes what JSON requires and nothing else: `<`, `>` and `&`
 * come out literal. A `</script>` sequence inside any stringified value therefore terminates the
 * script element early and everything after it is parsed as markup. The record page's JSON-LD
 * carries `entity.canonicalName` and `entity.aliases`, which are free-text admin fields validated
 * only for length, so an editor could put executable script into a public page — crossing the
 * editor/administrator boundary that publishEntity otherwise enforces, since updateEntity blocks
 * only the draft-to-published transition and an already-published entity can be edited freely.
 *
 * React escapes these fields everywhere else on the page; `dangerouslySetInnerHTML` is the one
 * place it cannot, which is exactly why the escaping has to be explicit here.
 *
 * The three replacements are all legal JSON string escapes, so the emitted text still parses as
 * JSON-LD for any consumer; they are simply inert to an HTML parser. `<` alone would close the
 * `</script>` hole, but `>` and `&` are escaped too so no comment-open (`<!--`) or entity sequence
 * can survive either.
 *
 * Use this for every ld+json block. Never call JSON.stringify into __html directly.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
