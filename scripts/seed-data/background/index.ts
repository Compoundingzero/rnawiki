/**
 * Aggregates the recorded-background dataset: one `medicine-background/v1` envelope per medicine
 * slug, authored from source artifacts fetched at authoring time (see
 * scripts/background/fetch-medicine-sources.ts) and validated by the deterministic background
 * engine before it can be applied anywhere.
 *
 * Authoring rules for every batch file in this directory:
 * - A value is structured from a fetched artifact, never remembered. The excerpt that contains
 *   the value is stored on its source.
 * - Missing information stays missing. A module a source does not support is simply absent.
 * - Amounts and schedules are recorded exactly as the label or trial protocol states them, as
 *   research context — never as guidance.
 */

import { RANKS_NAMING_ONE_ORGANISM } from '@/lib/background/types'
import type { MedicineRecordedBackground } from '@/lib/background/types'

import { BACKGROUND_BATCH_1 } from './batch-1'
import { BACKGROUND_BATCH_2 } from './batch-2'
import { BACKGROUND_BATCH_3 } from './batch-3'
import { BACKGROUND_BATCH_4 } from './batch-4'
import { BACKGROUND_BATCH_5 } from './batch-5'
import { BACKGROUND_BATCH_6 } from './batch-6'
import { BACKGROUND_BATCH_7 } from './batch-7'
import { BACKGROUND_BATCH_8 } from './batch-8'
import { BACKGROUND_BATCH_9 } from './batch-9'
import { BACKGROUND_BATCH_10 } from './batch-10'
import { BACKGROUND_BATCH_11 } from './batch-11'
import { BACKGROUND_BATCH_12 } from './batch-12'
import { BACKGROUND_BATCH_13 } from './batch-13'
import { BACKGROUND_BATCH_14 } from './batch-14'
import { BACKGROUND_BATCH_15 } from './batch-15'
import { BACKGROUND_BATCH_16 } from './batch-16'
import { BACKGROUND_BATCH_17 } from './batch-17'
import { EXTRACTED_BACKGROUND } from './extracted-background.generated'
import { SOURCE_CONSENSUS } from './source-consensus.generated'
import { COMPOUND_IDENTITY_BACKGROUND } from './compound-identity-background'
import { SUBSTANCE_BACKED_BACKGROUND } from './substance-backed-background'
import { SUPPLEMENT_BACKGROUND } from './supplement-background'
import { LABEL_PRESENCE_BACKGROUND } from './label-presence'
import { COMBINATION_ROW_COMPOSITION } from './combination-row-composition'
import { ACQUISITION_COST_BACKGROUND } from './acquisition-cost'
import { BIOLOGICAL_IDENTITY_BACKGROUND } from './biological-identity'
import { PRODUCT_LISTING_BACKGROUND } from './product-listing'
import { REGULATORY_APPROVAL_BACKGROUND } from './regulatory-approval'
import { SUPPLEMENT_INGREDIENT_BACKGROUND } from './supplement-ingredient'
import { SOURCE_MATERIAL_BACKGROUND } from './source-material'

export type RecordedBackgroundBySlug = Record<string, MedicineRecordedBackground>

const ALL_BATCHES: RecordedBackgroundBySlug[] = [
  BACKGROUND_BATCH_1,
  BACKGROUND_BATCH_2,
  BACKGROUND_BATCH_3,
  BACKGROUND_BATCH_4,
  BACKGROUND_BATCH_5,
  BACKGROUND_BATCH_6,
  BACKGROUND_BATCH_7,
  BACKGROUND_BATCH_8,
  BACKGROUND_BATCH_9,
  BACKGROUND_BATCH_10,
  BACKGROUND_BATCH_11,
  BACKGROUND_BATCH_12,
  BACKGROUND_BATCH_13,
  BACKGROUND_BATCH_14,
  BACKGROUND_BATCH_15,
  BACKGROUND_BATCH_16,
  BACKGROUND_BATCH_17,
]

export const RECORDED_BACKGROUND: RecordedBackgroundBySlug = (() => {
  const merged: RecordedBackgroundBySlug = {}
  for (const batch of ALL_BATCHES) {
    for (const [slug, background] of Object.entries(batch)) {
      if (merged[slug]) {
        throw new Error(`Duplicate recorded-background entry for slug "${slug}".`)
      }
      merged[slug] = background
    }
  }
  return merged
})()

/**
 * The curated corpus plus every deterministically extracted record.
 *
 * Curated work always wins: a slug the hand-authored corpus covers keeps its curated envelope, and
 * an extracted record can only fill a slug that has none. The two tiers stay distinguishable on
 * every value through `provenanceTier`, because a value a person judged and a value a parser
 * matched are different kinds of evidence and are never presented as the same thing.
 */
export const ALL_RECORDED_BACKGROUND: RecordedBackgroundBySlug = (() => {
  const merged: RecordedBackgroundBySlug = { ...EXTRACTED_BACKGROUND }
  for (const [slug, background] of Object.entries(RECORDED_BACKGROUND)) {
    merged[slug] = background
  }
  // Records built from the substance registry fill rows the extraction pipeline left empty. They
  // never overwrite: extraction ran against a specific label, and a registry entry assembled from
  // the best available label for a substance is the weaker claim of the two.
  for (const [slug, background] of Object.entries(SUBSTANCE_BACKED_BACKGROUND)) {
    if (!merged[slug]) merged[slug] = background
  }

  // Chemical identity is the last resort, and fills only what nothing else reached. A formula is
  // thin next to a pharmacology section; it is also true, and better than the blank page these rows
  // showed before.
  for (const [slug, background] of Object.entries(COMPOUND_IDENTITY_BACKGROUND)) {
    if (!merged[slug]) merged[slug] = background
  }

  // Supplement market data is merged before anything else, so a record that also has extracted or
  // curated content keeps that content and simply gains the market counts. Where a supplement row
  // has nothing else — which is most of them, because supplements are absent from the drug-label
  // archive — this is the whole record.
  for (const [slug, supplement] of Object.entries(SUPPLEMENT_BACKGROUND)) {
    const existing = merged[slug]
    merged[slug] = existing
      ? { ...existing, supplementMarket: supplement.supplementMarket }
      : supplement
  }

  // A combination row gains its ingredient breakdown, attached to whatever record it already has.
  // "Carbidopa, Levodopa" is one row naming two substances, and its page showed a product variant
  // and a count of labels while the registry held both ingredients separately. Each ingredient's
  // data comes from labels about that substance alone, never from the combination's own label, so
  // nothing here attributes a combination's sentence to one of its parts. A record that already
  // carries a composition keeps it.
  for (const [slug, composed] of Object.entries(COMBINATION_ROW_COMPOSITION)) {
    const existing = merged[slug]
    if (existing?.composition) continue
    merged[slug] = existing ? { ...existing, composition: composed.composition } : composed
  }

  // Acquisition cost attaches to whatever record exists. `costContext` had been part of the record
  // model from the start and no source had ever filled it — zero records carried a price — because
  // most published prices are list prices nobody pays. What CMS surveys is what pharmacies actually
  // pay to buy the product, which is an observation rather than an asking price, and the entry says
  // so in its own words. A curated record keeps any price a person authored.
  for (const [slug, priced] of Object.entries(ACQUISITION_COST_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.costContext?.length) continue
    merged[slug] = existing ? { ...existing, costContext: priced.costContext } : priced
  }

  // What the organism IS attaches to whatever record exists. A large part of this corpus is a
  // plant, a fungus, an insect or an animal tissue rather than a molecule, and for those rows no
  // chemical or label source could ever say what the thing is. A taxonomy can, and says nothing
  // else: a name, a rank, a lineage and the other names it is known by.
  for (const [slug, biology] of Object.entries(BIOLOGICAL_IDENTITY_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.biologicalIdentity) continue
    // A row with a molecular formula is a compound, and a compound is not a genus. This is the last
    // guard against a name collision: *Ammonia* is a genus of foraminifera, and the row named
    // "Ammonia" has a formula recorded from a label.
    const identity = biology.biologicalIdentity
    if (
      existing?.molecularIdentity &&
      identity &&
      !RANKS_NAMING_ONE_ORGANISM.has(identity.rankAsRecorded)
    ) {
      continue
    }
    merged[slug] = existing
      ? { ...existing, biologicalIdentity: biology.biologicalIdentity }
      : biology
  }

  // What the product directory lists attaches to whatever record exists. The label archive carries
  // documents; the directory carries products, including every product whose labelling has no prose
  // to read — which is why it reaches the vaccine antigens and biosimilars that nothing else does.
  for (const [slug, listed] of Object.entries(PRODUCT_LISTING_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.productListing) continue
    merged[slug] = existing ? { ...existing, productListing: listed.productListing } : listed
  }

  // When it was approved attaches to whatever record exists. A date orients a reader more than
  // almost anything else on the page, and the corpus could not state one.
  for (const [slug, approved] of Object.entries(REGULATORY_APPROVAL_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.regulatoryApproval) continue
    merged[slug] = existing
      ? { ...existing, regulatoryApproval: approved.regulatoryApproval }
      : approved
  }

  // How the supplement database files the ingredient attaches to whatever record exists. This is
  // the vocabulary match rather than a product count, and it reaches the rows a keyword search of
  // product text never could: no product is named "18-Hydroxyeicosahexaenoic Acid", but the
  // database holds it as a classified ingredient all the same.
  for (const [slug, ingredient] of Object.entries(SUPPLEMENT_INGREDIENT_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.supplementIngredient) continue
    merged[slug] = existing
      ? { ...existing, supplementIngredient: ingredient.supplementIngredient }
      : ingredient
  }

  // What kind of material the substance is attaches to whatever record exists. This is the plant
  // part stated by the registry rather than inferred from a row's name, and it is the open route
  // around a botanical names service that cannot be used.
  for (const [slug, material] of Object.entries(SOURCE_MATERIAL_BACKGROUND)) {
    const existing = merged[slug]
    if (existing?.sourceMaterial) continue
    merged[slug] = existing ? { ...existing, sourceMaterial: material.sourceMaterial } : material
  }

  // Archive presence attaches the same way, and for the same reason. A record with a mechanism
  // gains the fact that eleven published labels name the substance; a record with nothing else is
  // that fact, which is the whole point — half this corpus is botanicals, homeopathic preparations
  // and allergenic extracts whose labels carry no prose to extract but do record that the substance
  // is a declared active ingredient of a marketed product.
  for (const [slug, presence] of Object.entries(LABEL_PRESENCE_BACKGROUND)) {
    const existing = merged[slug]
    merged[slug] = existing ? { ...existing, labelPresence: presence.labelPresence } : presence
  }

  // Cross-source consensus attaches to whichever record exists, curated or extracted. It says what
  // every published label states for a field rather than what one of them states, and it applies
  // equally either way: a curated record benefits from knowing fifty-nine labels agree with it.
  for (const [slug, consensus] of Object.entries(SOURCE_CONSENSUS)) {
    const existing = merged[slug]
    if (existing) merged[slug] = { ...existing, sourceConsensus: consensus }
  }
  return merged
})()
