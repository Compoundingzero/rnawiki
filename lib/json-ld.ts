// Structured data for a dossier page, and the escaping that makes it safe to inline.
//
// THE ESCAPING IS THE POINT OF THIS FILE. A JSON-LD block has to reach the page as raw text inside
// a <script> element, which means `dangerouslySetInnerHTML`, which means the browser's HTML parser
// — not a JSON parser — reads it first. That parser ends the script at the first literal
// `</script>` it sees, wherever it appears. A drug whose `name`, `tradeName` or verdict contained
// `</script><script>…` would therefore close our block and open the attacker's, on every dossier
// page, for every reader.
//
// `serialiseJsonLd` below is the only thing standing between a string in the `drugs` table and
// that outcome. `next.config.mjs` says so out loud too: the site's CSP carries `'unsafe-inline'`
// for `script-src` because the App Router needs it, and the injection risk that leaves open is
// closed at its source — this is the ONLY place in the codebase that injects raw HTML, and it
// escapes `<`, `>` and `&` before it does. Do not add a second injection site, and do not replace
// this with a bare `JSON.stringify`.

import type { DrugDossier, DrugModality } from '@/lib/types'

/**
 * schema.org has two sibling types under `Substance` for what this site catalogues. Botanicals and
 * supplement ingredients are not drugs and must not claim to be — a search engine reading `Drug`
 * for turmeric is being told something false by us, not by the manufacturer.
 */
export type DrugJsonLdType = 'Drug' | 'DietarySupplement'

export function jsonLdTypeForModality(modality: DrugModality): DrugJsonLdType {
  return modality === 'Nutraceutical / Botanical' ? 'DietarySupplement' : 'Drug'
}

/**
 * Only the properties this codebase can fill from recorded data. Every one is optional except the
 * two the page is guaranteed to have, and an absent field is omitted rather than emitted empty:
 * `"description": ""` is a claim that the record has no description, which is a different and
 * wronger statement than saying nothing.
 */
export interface DrugJsonLd {
  '@context': 'https://schema.org'
  '@type': DrugJsonLdType
  name: string
  url: string
  alternateName?: string
  description?: string
  activeIngredient?: string
  mechanismOfAction?: string
}

/** Trimmed text, or undefined when there is nothing to say. */
function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : undefined
}

export function drugJsonLd(drug: DrugDossier, url: string): DrugJsonLd {
  const jsonLd: DrugJsonLd = {
    '@context': 'https://schema.org',
    '@type': jsonLdTypeForModality(drug.modality),
    name: drug.name,
    url,
  }

  // The trade name is the brand; `name` is the active moiety the record is filed under.
  const tradeName = text(drug.tradeName)
  if (tradeName) jsonLd.alternateName = tradeName

  // The verdict first, because it is the sentence a reader would quote. The plain-language
  // indication and then the clinical one are the fallbacks — never a stitched-together sentence.
  const description =
    text(drug.oneSentenceVerdict) ?? text(drug.patientFriendlyIndication) ?? text(drug.indication)
  if (description) jsonLd.description = description

  // `activeIngredient` is the substance itself, so it is the record's own name — the generic or
  // active-moiety name that `name` holds. It is deliberately NOT `targetGene` or `targetProtein`;
  // those are what the drug acts ON, and publishing a target as an ingredient would be wrong in a
  // machine-readable field that nobody proof-reads.
  const activeIngredient = text(drug.name)
  if (activeIngredient) jsonLd.activeIngredient = activeIngredient

  const mechanism = text(drug.laymanHowItWorks)
  if (mechanism) jsonLd.mechanismOfAction = mechanism

  return jsonLd
}

/**
 * The four characters that can break out of an inlined `<script>` block, mapped to JSON escapes.
 *
 * `\uXXXX` inside a JSON string is valid JSON and decodes back to the original character, so a
 * consumer reads exactly the stored text — the escaping changes the bytes on the wire, never the
 * data. U+2028 and U+2029 are here because they are legal in JSON but are line terminators to a
 * JavaScript parser, so a consumer that evaluates the block rather than parsing it would see a
 * syntax error on text a database row can legitimately contain.
 */
const HTML_SENSITIVE = /[<>&\u2028\u2029]/g

const JSON_LD_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/** Serialise for `dangerouslySetInnerHTML`. Read the header of this file before changing it. */
export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(HTML_SENSITIVE, (char) => JSON_LD_ESCAPES[char] ?? char)
}
