// Structured data for dossier pages. The JSON is inserted as raw script text, so literal HTML
// delimiters must be escaped before the browser parses it. Keep raw JSON-LD insertion confined to
// this serializer; a bare `JSON.stringify` would allow stored text containing `</script>` to end
// the script element early.

import type { DrugDossier, DrugModality } from '@/lib/types'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

/**
 * Botanicals and supplement ingredients use schema.org's `DietarySupplement`; other records use
 * `Drug`.
 */
export type DrugJsonLdType = 'Drug' | 'DietarySupplement'

export function jsonLdTypeForModality(modality: DrugModality): DrugJsonLdType {
  return modality === 'Nutraceutical / Botanical' ? 'DietarySupplement' : 'Drug'
}

/**
 * Properties supported by recorded data. Optional fields are omitted when empty.
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

export function drugJsonLd(
  drug: DrugDossier,
  url: string,
  dossier?: MedicineDossierViewModel,
): DrugJsonLd {
  const jsonLd: DrugJsonLd = {
    '@context': 'https://schema.org',
    '@type': jsonLdTypeForModality(drug.modality),
    name: drug.name,
    url,
  }

  // `name` is the active moiety; `tradeName` is the brand name.
  const tradeName = text(drug.tradeName)
  if (tradeName) jsonLd.alternateName = tradeName

  // Only a reviewed programme may supply a conclusion. Legacy medicine-wide verdict prose is not
  // exposed to search engines as though it had a defined use or reviewed publication boundary.
  const description =
    dossier?.bindingState === 'published_programme'
      ? text(dossier.verdict)
      : dossier?.bindingState === 'programme_unpublished'
        ? text(
            `${drug.name}: RNAWiki has not published a reviewed conclusion for ${dossier.selectedProgrammeLabel} yet.`,
          )
        : (text(drug.patientFriendlyIndication) ?? text(drug.indication))
  if (description) jsonLd.description = description

  // A target gene or protein is not an active ingredient.
  const activeIngredient = text(drug.name)
  if (activeIngredient) jsonLd.activeIngredient = activeIngredient

  const mechanism =
    dossier?.bindingState === 'published_programme'
      ? text(dossier.mechanismSummary.change)
      : dossier?.bindingState === 'programme_unpublished'
        ? undefined
        : text(drug.laymanHowItWorks)
  if (mechanism) jsonLd.mechanismOfAction = mechanism

  return jsonLd
}

/**
 * Characters escaped before JSON is inserted into an HTML script element. U+2028 and U+2029 are
 * valid JSON but JavaScript line terminators; `\uXXXX` preserves the decoded value.
 */
const HTML_SENSITIVE = /[<>&\u2028\u2029]/g

const JSON_LD_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/** Serialise JSON-LD for `dangerouslySetInnerHTML`. */
export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(HTML_SENSITIVE, (char) => JSON_LD_ESCAPES[char] ?? char)
}
