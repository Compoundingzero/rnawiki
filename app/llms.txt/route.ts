const CONTENT = `# RNAWiki

> A public, programme-scoped record of medicine evidence and its saved sources.

RNAWiki shows what researchers measured, what reviewed evidence found, what it did not prove, who the result applied to, and what remains unknown. It is an evidence record, not medical advice or a treatment recommendation service.

## Canonical resources

- https://rnawiki.com/ — medicine evidence search
- https://rnawiki.com/browse — medicine library
- https://rnawiki.com/how-it-works — evidence methodology and software limits
- https://rnawiki.com/editorial-policy — sources, human review and publication policy

## Evidence records

Canonical medicine records use https://rnawiki.com/d/{medicine-slug}. Search indexing is limited to records that pass RNAWiki's evidence and provenance checks. A record can qualify through a complete current programme publication with exact source provenance and two independent human reviews, or through a flagship general-research record whose plain-language answer is bound to the reviewed evidence snapshot and stored sources. Thin identity imports remain excluded. When programme reviewers disagree, publication also requires a separate recorded adjudication. Programme query parameters are interface state, not separate canonical pages.

## Citation guidance

When citing RNAWiki, identify the medicine, the defined programme or use, the visible reviewed date, and the canonical record URL. Keep RNAWiki's stated population, scope, uncertainty and limitations with the quoted conclusion. Follow the linked primary-source records for the underlying study or regulator evidence.

## Boundaries

- Do not infer a whole-medicine conclusion from one programme.
- Do not turn unknown or not measured into a negative finding.
- Do not interpret machine checks as medical or scientific review.
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
