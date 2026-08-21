import { readFileSync } from 'node:fs'
import { baseMoiety, type BrandCandidate, type SponsorCandidate } from './normalise'
import { CACHE_FILES, SOURCE_FILES, requireSourceFile, sourceFileExists } from './paths'

/**
 * Reads the three openFDA corpora and the pre-extracted SPL label index, and folds them into one
 * record per active moiety.
 *
 * The unit is the MOIETY, not the product. openFDA has 137,198 NDC products and 29,270
 * applications; a reader wants one page for metformin, not 233. baseMoiety() does the collapsing.
 */

export interface AggregatedSubstance {
  moiety: string
  /** Every raw ingredient spelling seen, with counts — the salt forms live here. */
  rawNames: Map<string, number>
  brands: BrandCandidate[]
  sponsors: SponsorCandidate[]
  routes: Map<string, number>
  dosageForms: Map<string, number>
  /** Earliest approved ORIG submission year across all applications. */
  firstApprovalYear: number | null
  applicationKinds: Record<string, number>
  marketingStatuses: Record<string, number>
  marketingCategories: Record<string, number>
  unii: Set<string>
  /** How many distinct products list this moiety — a real popularity signal. */
  productCount: number
  /**
   * The 9-digit NDC product codes this moiety appears in. CMS publishes drug prices keyed on the
   * 11-digit package NDC, whose first nine digits are this code, so carrying it lets the price
   * join run on an identifier instead of on a drug name.
   */
  ndcProductCodes: Set<string>
  sources: Set<string>
  label?: LabelText
}

export interface LabelText {
  indications_and_usage?: string
  mechanism_of_action?: string
  description?: string
  clinical_pharmacology?: string
  pharmacodynamics?: string
  purpose?: string
}

interface DrugsFdaProduct {
  brand_name?: string
  active_ingredients?: Array<{ name?: string; strength?: string }>
  dosage_form?: string
  route?: string
  marketing_status?: string
}

interface DrugsFdaRecord {
  application_number?: string
  sponsor_name?: string
  products?: DrugsFdaProduct[]
  submissions?: Array<{
    submission_type?: string
    submission_status?: string
    submission_status_date?: string
  }>
}

interface NdcRecord {
  product_ndc?: string
  brand_name?: string
  generic_name?: string
  labeler_name?: string
  marketing_category?: string
  dosage_form?: string
  route?: string[]
  active_ingredients?: Array<{ name?: string; strength?: string }>
  openfda?: { unii?: string[] }
}

/**
 * NDC categories that describe raw material rather than a medicine anyone takes. A page for
 * "bulk ingredient acetaminophen" is noise, and it would double every common drug.
 */
const NON_PRODUCT_CATEGORIES = new Set([
  'BULK INGREDIENT',
  'DRUG FOR FURTHER PROCESSING',
  'BULK INGREDIENT FOR HUMAN PRESCRIPTION COMPOUNDING',
  'EXPORT ONLY',
])

function applicationKind(applicationNumber: string): string {
  if (applicationNumber.startsWith('BLA')) return 'BLA'
  if (applicationNumber.startsWith('NDA')) return 'NDA'
  if (applicationNumber.startsWith('ANDA')) return 'ANDA'
  return 'OTHER'
}

function originalApprovalYear(record: DrugsFdaRecord): number | null {
  for (const submission of record.submissions ?? []) {
    if (submission.submission_type !== 'ORIG' || submission.submission_status !== 'AP') continue
    const date = submission.submission_status_date
    if (date && date.length >= 4) {
      const year = Number.parseInt(date.slice(0, 4), 10)
      if (Number.isFinite(year)) return year
    }
  }
  return null
}

function emptySubstance(moiety: string): AggregatedSubstance {
  return {
    moiety,
    rawNames: new Map(),
    brands: [],
    sponsors: [],
    routes: new Map(),
    dosageForms: new Map(),
    firstApprovalYear: null,
    applicationKinds: {},
    marketingStatuses: {},
    marketingCategories: {},
    unii: new Set(),
    productCount: 0,
    ndcProductCodes: new Set(),
    sources: new Set(),
  }
}

function bump(counter: Record<string, number>, key: string | undefined): void {
  if (!key) return
  counter[key] = (counter[key] ?? 0) + 1
}

function bumpMap(counter: Map<string, number>, key: string | undefined): void {
  if (!key) return
  counter.set(key, (counter.get(key) ?? 0) + 1)
}

/**
 * Vaccines and some biologics list their active ingredient as a development codename —
 * "BNT162B2 OMICRON (LP.8.1)" for Comirnaty, "CX-051869" for Spikevax. A page titled BNT162B2 is
 * a page nobody searches for, and the readable name is sitting in the same record's generic_name
 * field ("COVID-19 Vaccine, mRNA"). This is a source substitution, not an invention.
 */
const CODENAME_PATTERN = /^[A-Z]{2,5}[- ]?\d{3,6}(?![A-Z]*[AEIOU][A-Z]{2})/

export function looksLikeCodename(name: string): boolean {
  return CODENAME_PATTERN.test(name.trim().toUpperCase())
}

export function aggregateOpenFda(): Map<string, AggregatedSubstance> {
  const index = new Map<string, AggregatedSubstance>()
  const get = (moiety: string): AggregatedSubstance => {
    let entry = index.get(moiety)
    if (!entry) {
      entry = emptySubstance(moiety)
      index.set(moiety, entry)
    }
    return entry
  }

  // --- Drugs@FDA: the approval record ---------------------------------------
  const drugsFda = JSON.parse(readFileSync(requireSourceFile(SOURCE_FILES.drugsFda), 'utf8')) as {
    results?: DrugsFdaRecord[]
  }

  for (const record of drugsFda.results ?? []) {
    const applicationNumber = record.application_number ?? ''
    const kind = applicationKind(applicationNumber)
    const year = originalApprovalYear(record)
    const sponsorName = (record.sponsor_name ?? '').trim()

    for (const product of record.products ?? []) {
      const names = rejoinParenSplits(
        (product.active_ingredients ?? [])
          .map((ingredient) => ingredient.name?.trim())
          .filter((name): name is string => Boolean(name)),
      )
      if (names.length === 0) continue

      const singleIngredient = names.length === 1

      for (const rawName of names) {
        const moiety = baseMoiety(rawName)
        if (moiety.length < 3) continue

        const entry = get(moiety)
        entry.productCount += 1
        entry.rawNames.set(
          rawName.toUpperCase(),
          (entry.rawNames.get(rawName.toUpperCase()) ?? 0) + 1,
        )
        entry.sources.add('openFDA Drugs@FDA')
        bump(entry.applicationKinds, kind)
        bump(entry.marketingStatuses, product.marketing_status)
        bumpMap(entry.routes, product.route)
        bumpMap(entry.dosageForms, product.dosage_form)

        if (year !== null && (entry.firstApprovalYear === null || year < entry.firstApprovalYear)) {
          entry.firstApprovalYear = year
        }
        if (product.brand_name) {
          entry.brands.push({ name: product.brand_name.trim(), singleIngredient, count: 1 })
        }
        if (sponsorName) {
          entry.sponsors.push({
            name: sponsorName,
            year,
            fromApplication: true,
            applicationKind: kind,
            count: 1,
          })
        }
      }
    }
  }

  // --- NDC: what is actually on a shelf, including OTC and homeopathic -------
  const ndc = JSON.parse(readFileSync(requireSourceFile(SOURCE_FILES.ndc), 'utf8')) as {
    results?: NdcRecord[]
  }

  for (const record of ndc.results ?? []) {
    const category = record.marketing_category ?? ''
    if (NON_PRODUCT_CATEGORIES.has(category)) continue

    let names = rejoinParenSplits(
      (record.active_ingredients ?? [])
        .map((ingredient) => ingredient.name?.trim())
        .filter((name): name is string => Boolean(name)),
    )
    if (names.length === 0) continue

    // Substitute the readable generic name when every active ingredient is a codename.
    const generic = record.generic_name?.trim()
    if (generic && names.every((name) => looksLikeCodename(name))) {
      names = [generic]
    }

    const singleIngredient = names.length === 1
    const labeler = (record.labeler_name ?? '').trim()

    for (const rawName of names) {
      const moiety = baseMoiety(rawName)
      if (moiety.length < 3) continue

      const entry = get(moiety)
      entry.productCount += 1
      entry.rawNames.set(
        rawName.toUpperCase(),
        (entry.rawNames.get(rawName.toUpperCase()) ?? 0) + 1,
      )
      entry.sources.add('openFDA NDC Directory')
      bump(entry.marketingCategories, category)
      bumpMap(entry.dosageForms, record.dosage_form)
      for (const route of record.route ?? []) bumpMap(entry.routes, route)
      for (const unii of record.openfda?.unii ?? []) entry.unii.add(unii)
      if (record.product_ndc) entry.ndcProductCodes.add(record.product_ndc)

      if (record.brand_name) {
        entry.brands.push({ name: record.brand_name.trim(), singleIngredient, count: 1 })
      }
      if (labeler) {
        // Ranked below application sponsors by pickSponsor — an NDC labeler is frequently a
        // repackager, and even when it is not, it is the distributor rather than the innovator.
        entry.sponsors.push({
          name: labeler,
          year: null,
          fromApplication: false,
          applicationKind: category,
          count: 1,
        })
      }
    }
  }

  attachLabelText(index)
  return index
}

/**
 * The 261,885 SPL labels were pre-extracted to a moiety-keyed index (see the ingest README):
 * numbered section headings stripped, and single-ingredient labels ranked above combination
 * products so METFORMIN does not inherit TRIJARDY XR's three-drug mechanism paragraph.
 *
 * Parsing 1.8 GB of zipped label JSON on every ingest run would add ten minutes for a result that
 * changes only when openFDA publishes, so the index is a build artefact rather than a live read.
 */
function attachLabelText(index: Map<string, AggregatedSubstance>): void {
  if (!sourceFileExists(CACHE_FILES.labelIndex)) {
    console.warn(
      `[openfda] No label index at ${CACHE_FILES.labelIndex}; dossiers will have no indication text.`,
    )
    return
  }

  const labels = JSON.parse(readFileSync(CACHE_FILES.labelIndex, 'utf8')) as Record<
    string,
    LabelText
  >
  let attached = 0

  for (const [moiety, text] of Object.entries(labels)) {
    const entry = index.get(moiety)
    if (!entry) continue
    entry.label = text
    entry.sources.add('openFDA SPL label')
    attached += 1
  }

  console.log(`[openfda] attached label text to ${attached.toLocaleString()} moieties`)
}

export function summariseAggregate(index: Map<string, AggregatedSubstance>): string {
  const withLabel = [...index.values()].filter((entry) => entry.label).length
  const withApplication = [...index.values()].filter(
    (entry) =>
      (entry.applicationKinds.NDA ?? 0) +
        (entry.applicationKinds.BLA ?? 0) +
        (entry.applicationKinds.ANDA ?? 0) >
      0,
  ).length
  return [
    `moieties: ${index.size.toLocaleString()}`,
    `with an FDA application: ${withApplication.toLocaleString()}`,
    `with label text: ${withLabel.toLocaleString()}`,
  ].join(' · ')
}

/**
 * openFDA stores a product's active ingredients as an array, and the upstream Drugs@FDA extract
 * builds that array by splitting one comma-delimited string. A name that legitimately contains a
 * comma is therefore torn in half before it ever reaches us: "LIOTRIX (T4, T3)" arrives as
 * ["LIOTRIX (T4", "T3)"], "MENOTROPINS (FSH, LH)" as ["MENOTROPINS (FSH", "LH)"], and each half is
 * then ingested as its own drug. Twenty-one records in the corpus were fragments like "1000 Mw)"
 * and "T3)" — page titles with no referent.
 *
 * The tear is always at a comma inside brackets, so the brackets identify it: an element with more
 * openers than closers is an opening fragment, and it is rejoined with the elements that follow
 * until the brackets balance. An element that never balances is dropped rather than emitted
 * truncated, because a name ending mid-parenthesis is worse than one missing ingredient.
 */
export function rejoinParenSplits(names: string[]): string[] {
  const depth = (text: string): number =>
    (text.match(/[([]/g) ?? []).length - (text.match(/[)\]]/g) ?? []).length

  const joined: string[] = []
  let pending: string[] = []
  let open = 0

  for (const name of names) {
    if (open > 0) {
      pending.push(name)
      open += depth(name)
      if (open <= 0) {
        joined.push(pending.join(', '))
        pending = []
        open = 0
      }
      continue
    }

    const d = depth(name)
    if (d > 0) {
      pending = [name]
      open = d
    } else {
      joined.push(name)
    }
  }

  // An unterminated fragment is discarded, not emitted half-written.
  return joined
}
