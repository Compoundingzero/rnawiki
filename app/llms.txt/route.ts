const CONTENT = `# RNAWiki

> A public, programme-scoped record of medicine evidence and its saved sources.

RNAWiki shows what researchers measured, what reviewed evidence found, what it did not prove, who the result applied to, and what remains unknown. It is an evidence record, not medical advice or a treatment recommendation service.

## Canonical resources

- https://rnawiki.com/ — medicine evidence search
- https://rnawiki.com/browse — medicine library
- https://rnawiki.com/how-it-works — evidence methodology and software limits
- https://rnawiki.com/editorial-policy — sources, human review and publication policy

## Evidence records

Canonical medicine records use https://rnawiki.com/d/{medicine-slug}. Every record that resolves to one canonical medicine identity is indexable, and each one carries an explicit completeness state for every section that applies to it. A record can also qualify through a complete current programme publication with exact source provenance and two independent human reviews, or through a flagship general-research record whose plain-language answer is bound to the reviewed evidence snapshot and stored sources. When programme reviewers disagree, publication also requires a separate recorded adjudication. Duplicate, alias and superseded identities redirect to the one canonical record; slugs that named a spreadsheet artifact rather than a medicine return HTTP 410. Programme query parameters are interface state, not separate canonical pages.

A section state says what RNAWiki read, and what it read it from:

- Recorded from a saved source sentence — the statement is quoted from a stored source snapshot.
- Recorded as structured source data — the values come from a stored structured record, not prose.
- Reviewed and published — a named use passed the signed programme review workflow.
- A source states this was not established — a source says so in its own words.
- Searched; no qualifying record found — a dated search of a named source returned no match.
- Registered; results not posted — a trial registration exists and its results are absent.
- Not measured in the recorded sources — no read source reports the measurement.
- Does not apply to this kind of record — the section is not asked of this entity class.
- Sources differ — two read sources disagree and neither was chosen.
- Source could not be reached — a fetch or parse failed, and the section stays open.

A state such as "searched; no qualifying record found" describes the sources RNAWiki read on a stated date. It never describes the medicine, and it is not evidence that nothing exists. Six further states — not yet assessed, search scheduled, source read failed, identity not yet resolved, attribution not yet resolved, and waiting for a person to review — keep a record incomplete and are shown, not hidden.

## Citation guidance

When citing RNAWiki, identify the medicine, the defined programme or use, the visible reviewed date, and the canonical record URL. Keep RNAWiki's stated population, scope, uncertainty and limitations with the quoted conclusion. Follow the linked primary-source records for the underlying study or regulator evidence.

## Boundaries

- Do not infer a whole-medicine conclusion from one programme.
- Do not turn unknown or not measured into a negative finding.
- Do not interpret machine checks as medical or scientific review.
- Do not read an absent section, a registration, or a search count as a finding.
- Do not use RNAWiki as personal medical advice.
`

export function GET() {
  return new Response(CONTENT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
