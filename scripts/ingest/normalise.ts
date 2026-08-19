import type { ApprovalStatus, DrugModality } from '@/lib/types'

/**
 * The judgement layer of the ingest, and the file most worth getting right: everything downstream
 * inherits its decisions about what a substance is called, what kind of molecule it is, and
 * whether it is approved.
 *
 * Every rule here is derived from a published, checkable system — USAN/INN stems, FDA application
 * types, NDC marketing categories — never from a guess about a particular drug. That is what makes
 * the classification reproducible instead of an opinion.
 */

// ---------------------------------------------------------------------------
// Base moiety — collapsing salt and hydrate forms onto one page
// ---------------------------------------------------------------------------

/**
 * FDA data names the *salt*, not the drug: METFORMIN HYDROCHLORIDE, LISINOPRIL DIHYDRATE,
 * ATORVASTATIN CALCIUM. A reader looking for metformin wants one page, not 233. Stripping the
 * suffix is what merges them.
 *
 * The loop repeats because real names stack them — AMLODIPINE BESYLATE MONOHYDRATE — and a single
 * pass would leave one behind.
 */
const SALT_SUFFIXES = [
  'HYDROCHLORIDE', 'HYDROBROMIDE', 'SODIUM', 'POTASSIUM', 'CALCIUM', 'MAGNESIUM', 'SULFATE',
  'SULPHATE', 'PHOSPHATE', 'ACETATE', 'TARTRATE', 'BITARTRATE', 'MALEATE', 'FUMARATE', 'CITRATE',
  'MESYLATE', 'MESILATE', 'BESYLATE', 'TOSYLATE', 'SUCCINATE', 'LACTATE', 'GLUCONATE', 'NITRATE',
  'CHLORIDE', 'BROMIDE', 'IODIDE', 'OXALATE', 'PAMOATE', 'STEARATE', 'PALMITATE', 'DIHYDRATE',
  'MONOHYDRATE', 'ANHYDROUS', 'TRIHYDRATE', 'HEMIHYDRATE', 'DISODIUM', 'DIPOTASSIUM', 'HYCLATE',
  'VALERATE', 'PROPIONATE', 'DIPROPIONATE', 'FUROATE', 'BENZOATE', 'SALICYLATE', 'AXETIL',
  'OLAMINE', 'TROMETHAMINE', 'MALATE', 'ASPARTATE', 'GLUTAMATE', 'NAPSYLATE', 'EDISYLATE',
  'XINAFOATE', 'LAURYL SULFATE',
] as const

export function baseMoiety(name: string): string {
  // Source data uses "||" to join the ingredients of a combination product, and DSLD group names
  // carry a parenthesised synonym ("Vitamin D (Cholecalciferol)"). Left in, the first produces a
  // page titled "Abacavir || Dolutegravir || Lamivudine" and the second produces a second Vitamin D.
  let n = name
    .split('||')[0]
    ?.replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/^[\s,.;]+|[\s,.;]+$/g, '') ?? ''
  let changed = true
  while (changed) {
    changed = false
    for (const suffix of SALT_SUFFIXES) {
      if (n.endsWith(` ${suffix}`) && n.length > suffix.length + 2) {
        n = n.slice(0, -(suffix.length + 1)).trim()
        changed = true
      }
    }
  }
  return n
}

// ---------------------------------------------------------------------------
// Display name
// ---------------------------------------------------------------------------

/** Tokens that must not be title-cased, because their real capitalisation carries meaning. */
const KEEP_AS_IS = new Set([
  'PEG', 'DNA', 'RNA', 'HCL', 'HBR', 'USP', 'NF', 'EDTA', 'DHA', 'EPA', 'MSM', 'NAD', 'NMN',
  'CoQ10', 'MCT', 'ATP', 'GABA', 'HMB', 'SAM-E', 'BCAA', 'IU', 'II', 'III', 'IV', 'VI', 'VII',
  'VIII', 'IX', 'XI', 'XII', 'XIII', 'A', 'B', 'C', 'D', 'E', 'K',
])

/** INN convention keeps Greek-letter glycosylation suffixes lowercase: "epoetin alfa". */
const LOWERCASE_SUFFIXES = new Set([
  'alfa', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'pegol', 'aviv', 'dulce', 'and', 'or',
  'with', 'in', 'of', 'the',
])

/**
 * FDA source data is ALL CAPS. Printing it raw makes every page look like a shouted database dump,
 * which is exactly what a wiki must not look like.
 */
/**
 * Tokens whose correct form is neither ALL CAPS nor Title Case. "COVID-19 VACCINE, MRNA" must not
 * become "Covid-19 Vaccine, Mrna" -- these are proper names with fixed capitalisation.
 */
const FIXED_CASE: Readonly<Record<string, string>> = {
  MRNA: 'mRNA', SIRNA: 'siRNA', TRNA: 'tRNA', RRNA: 'rRNA', SNRNA: 'snRNA', CDNA: 'cDNA',
  'COVID-19': 'COVID-19', COVID: 'COVID', 'SARS-COV-2': 'SARS-CoV-2', HIV: 'HIV', HPV: 'HPV',
  HBV: 'HBV', HCV: 'HCV', RSV: 'RSV', BCG: 'BCG', PCSK9: 'PCSK9', 'GLP-1': 'GLP-1',
  'IL-2': 'IL-2', 'IL-6': 'IL-6', 'TNF-ALPHA': 'TNF-alpha', 'PD-1': 'PD-1', 'PD-L1': 'PD-L1',
  LDL: 'LDL', HDL: 'HDL', 'L-CARNITINE': 'L-Carnitine', 'L-THEANINE': 'L-Theanine',
  'D-RIBOSE': 'D-Ribose', 'N-ACETYLCYSTEINE': 'N-Acetylcysteine',
}

export function titleCaseDrugName(upper: string): string {
  const cleaned = upper.replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''

  return cleaned
    .split(' ')
    .map((word, index) => {
      // Punctuation the token carries (a trailing comma, wrapping parens) must survive the lookup.
      const leading = /^[^A-Za-z0-9]*/.exec(word)?.[0] ?? ''
      const trailing = /[^A-Za-z0-9]*$/.exec(word)?.[0] ?? ''
      const core = word.slice(leading.length, word.length - trailing.length)
      const fixed = FIXED_CASE[core.toUpperCase()]
      if (fixed) return leading + fixed + trailing

      const bare = word.replace(/[^A-Za-z0-9]/g, '')
      if (KEEP_AS_IS.has(bare.toUpperCase()) && bare.length <= 5) return bare.toUpperCase()
      const lower = word.toLowerCase()
      // "and", "of" etc. stay lowercase unless they open the name.
      if (index > 0 && LOWERCASE_SUFFIXES.has(lower)) return lower
      // Hyphenated and slashed compounds capitalise each part: "Carbidopa-Levodopa".
      return lower.replace(/(^|[-/(])([a-z0-9])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
    })
    .join(' ')
}

// ---------------------------------------------------------------------------
// Modality — USAN/INN stems are published nomenclature, not inference
// ---------------------------------------------------------------------------

export interface ModalityInput {
  moiety: string
  /** FDA application kinds seen for this substance, e.g. { NDA: 3, ANDA: 88, BLA: 0 }. */
  applicationKinds: Readonly<Record<string, number>>
  /** NDC marketing categories seen, e.g. { 'OTC MONOGRAPH DRUG': 12 }. */
  marketingCategories: Readonly<Record<string, number>>
  /** The SPL label's mechanism-of-action / description text, when one was found. */
  labelText?: string | undefined
  /** True when the substance came from the NIH supplement database. */
  fromSupplementDatabase?: boolean | undefined
}

export interface ModalityDecision {
  modality: DrugModality
  /** Which rule fired. Stored so a wrong classification can be traced to its cause. */
  rule: string
}

const STEM_RULES: ReadonlyArray<{ test: RegExp; modality: DrugModality; rule: string }> = [
  // Oligonucleotides. -siran and -rsen are the two INN stems, but they do not by themselves
  // separate siRNA from antisense — the label's own words do, so those are handled before this
  // list runs (see classifyModality). These are the fallbacks when there is no label.
  { test: /siran$/i, modality: 'siRNA (Small Interfering RNA)', rule: 'INN stem -siran (siRNA)' },
  { test: /rsen$/i, modality: 'ASO (Antisense Oligonucleotide)', rule: 'INN stem -rsen (antisense)' },

  // Gene and cell therapies. -vec (vector), -cel (cell), -gene (gene therapy component).
  { test: /(parvovec|repvec|vec)$/i, modality: 'CRISPR / Gene Therapy', rule: 'INN stem -vec (viral vector)' },
  { test: /(temcel|leucel|cel)$/i, modality: 'CRISPR / Gene Therapy', rule: 'INN stem -cel (cell therapy)' },
  { test: /gene\s+\w+$/i, modality: 'CRISPR / Gene Therapy', rule: 'INN two-word gene-therapy name' },

  // Antibodies. -mab is the stem; the sub-stems (-ximab, -zumab, -umab) all end in it.
  { test: /mab$/i, modality: 'Monoclonal Antibody (mAb)', rule: 'INN stem -mab (monoclonal antibody)' },

  // Fusion proteins and enzymes come before the peptide stems, because -cept and -ase are
  // recombinant proteins even though some end in letters the peptide rules would also match.
  { test: /cept$/i, modality: 'Recombinant Protein / Biologic', rule: 'INN stem -cept (receptor fusion)' },
  { test: /(ase|dase|teplase|uplase)$/i, modality: 'Recombinant Protein / Biologic', rule: 'INN stem -ase (enzyme)' },
  { test: /(poetin|stim|kin|feron)$/i, modality: 'Recombinant Protein / Biologic', rule: 'INN stem for a cytokine/growth factor' },
  { test: /^(INSULIN|SOMATROPIN|MENOTROPINS|FOLLITROPIN|CHORIOGONADOTROPIN)\b/i, modality: 'Recombinant Protein / Biologic', rule: 'named recombinant hormone' },
  { test: /^(COAGULATION FACTOR|ANTIHEMOPHILIC FACTOR|FACTOR (VIII|IX|VIIA))/i, modality: 'Recombinant Protein / Biologic', rule: 'named clotting factor' },

  // Peptides. -tide is the general stem; -relin, -actide, -pressin are peptide hormone stems.
  { test: /tide$/i, modality: 'Peptide / GLP-1 Agonist', rule: 'INN stem -tide (peptide)' },
  { test: /(relin|actide|pressin|ocin)$/i, modality: 'Peptide / GLP-1 Agonist', rule: 'INN stem for a peptide hormone' },
]

/**
 * A label mentioning "messenger RNA" is usually naming the drug's TARGET, not the drug. Spinraza's
 * label says it is "an antisense oligonucleotide" and, two sentences later, that it acts on "SMN2
 * messenger RNA" -- a loose mRNA marker files an ASO under mRNA on the strength of its target.
 * So the mRNA rule requires the label to say the product ITSELF is one, and it runs after the
 * antisense check rather than before it.
 */
const MRNA_MARKERS =
  /\b(nucleoside[- ]modified (messenger rna|mrna)|mrna vaccine|is an? (modified )?(messenger rna|mrna)\b|lipid nanoparticle[- ]encapsulated (messenger rna|mrna))/i
const SIRNA_MARKERS = /\bsmall interfering (ribonucleic acid|rna)|\bsirna\b|\brna interference\b/i
const ASO_MARKERS = /\bantisense oligonucleotide\b|\bantisense\b/i
const GENE_THERAPY_MARKERS = /\b(adeno-associated virus|aav|lentiviral vector|gene therapy|crispr|cas9|genome edit)\b/i

const SUPPLEMENT_CATEGORIES = new Set([
  'UNAPPROVED HOMEOPATHIC',
  'DIETARY SUPPLEMENT',
])

export function classifyModality(input: ModalityInput): ModalityDecision {
  const name = input.moiety.toUpperCase()
  const label = input.labelText ?? ''

  // The label is the strongest evidence there is: it is the manufacturer telling the regulator
  // what the molecule is. It runs before the stem table so that, for example, an -rsen compound
  // whose label says "small interfering" is not filed under antisense on the strength of a suffix.
  if (label) {
    if (SIRNA_MARKERS.test(label)) {
      return { modality: 'siRNA (Small Interfering RNA)', rule: 'SPL label states RNA interference' }
    }
    if (ASO_MARKERS.test(label)) {
      return { modality: 'ASO (Antisense Oligonucleotide)', rule: 'SPL label states antisense oligonucleotide' }
    }
    if (MRNA_MARKERS.test(label)) {
      return { modality: 'mRNA Vaccine / Therapeutic', rule: 'SPL label states the product is messenger RNA' }
    }
    if (GENE_THERAPY_MARKERS.test(label)) {
      return { modality: 'CRISPR / Gene Therapy', rule: 'SPL label states a gene-therapy vector or genome edit' }
    }
  }

  // Vaccines carry no INN stem, and their SPL label is filed under a codename rather than the
  // readable generic name, so the name itself is the only signal available for them.
  if (/\bMRNA\b/.test(name)) {
    return { modality: 'mRNA Vaccine / Therapeutic', rule: 'substance name states messenger RNA' }
  }
  if (/\bSIRNA\b/.test(name)) {
    return { modality: 'siRNA (Small Interfering RNA)', rule: 'substance name states siRNA' }
  }

  for (const rule of STEM_RULES) {
    if (rule.test.test(name)) return { modality: rule.modality, rule: rule.rule }
  }

  // Supplement sources and supplement-shaped marketing categories.
  if (input.fromSupplementDatabase) {
    return { modality: 'Nutraceutical / Botanical', rule: 'listed in the NIH Dietary Supplement Label Database' }
  }
  for (const category of Object.keys(input.marketingCategories)) {
    if (SUPPLEMENT_CATEGORIES.has(category)) {
      return { modality: 'Nutraceutical / Botanical', rule: `NDC marketing category "${category}"` }
    }
  }

  // A biologics licence with no clearer signal is a biologic. This catches vaccines, blood
  // products and allergenic extracts that carry no INN stem at all.
  if ((input.applicationKinds.BLA ?? 0) > 0 || input.marketingCategories.BLA) {
    return { modality: 'Recombinant Protein / Biologic', rule: 'licensed under a BLA' }
  }

  return { modality: 'Small Molecule', rule: 'default: no biologic stem or category matched' }
}

// ---------------------------------------------------------------------------
// Approval status
// ---------------------------------------------------------------------------

export interface ApprovalInput {
  applicationKinds: Readonly<Record<string, number>>
  marketingCategories: Readonly<Record<string, number>>
  /** FDA marketing statuses seen: Prescription, Over-the-counter, Discontinued, None. */
  marketingStatuses: Readonly<Record<string, number>>
  fromSupplementDatabase?: boolean | undefined
}

export interface ApprovalDecision {
  status: ApprovalStatus
  rule: string
}

export function classifyApprovalStatus(input: ApprovalInput): ApprovalDecision {
  const kinds = input.applicationKinds
  const categories = input.marketingCategories

  // Order matters. An FDA application is stronger evidence than a marketing category, and a
  // supplement that also has an approved drug application (melatonin, magnesium, niacin) is an
  // approved drug — the supplement listing does not downgrade it.
  if ((kinds.NDA ?? 0) > 0 || (kinds.BLA ?? 0) > 0) {
    return { status: 'FDA Approved', rule: 'approved under an NDA or BLA' }
  }
  if ((kinds.ANDA ?? 0) > 0) {
    // A generic is an approved copy of an approved drug. Calling it anything else would be wrong.
    return { status: 'FDA Approved', rule: 'approved under an ANDA (generic of an approved drug)' }
  }
  if (categories['OTC MONOGRAPH DRUG'] || categories['OTC MONOGRAPH FINAL'] || categories['OTC MONOGRAPH NOT FINAL']) {
    return { status: 'FDA Approved', rule: 'marketed under an OTC monograph' }
  }
  if (input.fromSupplementDatabase || categories['UNAPPROVED HOMEOPATHIC']) {
    return { status: 'Non-FDA / Dietary Supplement', rule: 'dietary supplement or homeopathic listing, no FDA approval' }
  }
  if (categories['UNAPPROVED DRUG OTHER'] || categories['UNAPPROVED DRUG FOR USE IN DRUG SHORTAGE'] || categories['UNAPPROVED MEDICAL GAS']) {
    return { status: 'Off-Label / Compounded', rule: 'marketed without an approved application' }
  }
  if (categories['EMERGENCY USE AUTHORIZATION']) {
    return { status: 'Accelerated Approval', rule: 'emergency use authorization' }
  }

  // Nothing in these sources supports a claim of EMA approval, so it is never emitted here.
  return { status: 'Pre-clinical / Open Source', rule: 'no approval evidence in any source' }
}

// ---------------------------------------------------------------------------
// Sponsor — the innovator, not whoever last put it in a box
// ---------------------------------------------------------------------------

/**
 * NDC labeler names are dominated by repackagers: firms that buy finished product and relabel it.
 * Left in, "Metformin" ends up sponsored by Bryant Ranch Prepack, which is true of a bottle and
 * false of the drug. Matched as substrings because these firms appear under many legal variants.
 */
const REPACKAGER_MARKERS = [
  'BRYANT RANCH', 'A-S MEDICATION', 'REMEDYREPACK', 'PROFICIENT RX', 'NUCARE', 'PREFERRED PHARMACEUTICALS',
  'QUALITY CARE', 'REDPHARM', 'DENTON PHARMA', 'DIRECTRX', 'DIRECT RX', 'ASCLEMED', 'PD-RX',
  'LAKE ERIE MEDICAL', 'BLENHEIM', "ST. MARY'S MEDICAL PARK", 'ST MARYS MEDICAL PARK', 'APHENA',
  'CLINICAL SOLUTIONS', 'UNIT DOSE', 'MEDSOURCE', 'NORTHWIND', 'BLUEPOINT', 'REPACK', 'RE-PACK',
  'DISPENSING SOLUTIONS', 'PHYSICIANS TOTAL CARE', 'STAT RX', 'GENERAL INJECTABLES', 'CARDINAL HEALTH',
  'MCKESSON', 'MAJOR PHARMACEUTICALS', 'AVPAK', 'AVKARE', 'HF ACQUISITION', 'HENRY SCHEIN',
  'MEDVANTX', 'RPK PHARMACEUTICALS', 'ADVANCED RX', 'LIBERTY PHARMACEUTICALS', 'TIME CAP',
] as const

export function isRepackager(name: string): boolean {
  const upper = name.toUpperCase()
  return REPACKAGER_MARKERS.some((marker) => upper.includes(marker))
}

export interface SponsorCandidate {
  name: string
  /** The application's approval year, when known. Earliest wins — that is the innovator. */
  year: number | null
  /** True when the name came from a Drugs@FDA sponsor field rather than an NDC labeler field. */
  fromApplication: boolean
  applicationKind: string
  count: number
}

export function pickSponsor(candidates: readonly SponsorCandidate[]): string {
  const usable = candidates.filter((c) => c.name && !isRepackager(c.name))
  if (usable.length === 0) return ''

  const rank = (c: SponsorCandidate): number => {
    // An originator application beats a generic one, which beats an NDC labeler record.
    if (c.fromApplication && (c.applicationKind === 'NDA' || c.applicationKind === 'BLA')) return 0
    if (c.fromApplication) return 1
    return 2
  }

  const sorted = [...usable].sort((a, b) => {
    const byRank = rank(a) - rank(b)
    if (byRank !== 0) return byRank
    // Earliest approval is the innovator; a null year sorts last.
    const ay = a.year ?? Number.POSITIVE_INFINITY
    const by = b.year ?? Number.POSITIVE_INFINITY
    if (ay !== by) return ay - by
    return b.count - a.count
  })

  const winner = sorted[0]?.name ?? ''
  return formatSponsorName(winner)
}

/**
 * Drugs@FDA sponsor fields are ALL CAPS and heavily abbreviated ("SAREPTA THERAPS INC"). Expanding
 * the abbreviations that appear at scale and title-casing the rest turns a database field into
 * something readable, without inventing a name that is not there.
 */
const SPONSOR_ABBREVIATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bPHARMS?\b/gi, 'Pharmaceuticals'],
  [/\bTHERAPS?\b/gi, 'Therapeutics'],
  [/\bLABS?\b/gi, 'Laboratories'],
  [/\bCORP\b/gi, 'Corporation'],
  [/\bINTL\b/gi, 'International'],
  [/\bIND\b/gi, 'Industries'],
  [/\bPRODS?\b/gi, 'Products'],
  [/\bHLTHCARE\b/gi, 'Healthcare'],
]

/** Legal-form tokens whose conventional capitalisation is not plain title case. */
const SPONSOR_LEGAL_FORMS: Readonly<Record<string, string>> = {
  INC: 'Inc.', LLC: 'LLC', LP: 'LP', LTD: 'Ltd.', PLC: 'plc', GMBH: 'GmbH', AG: 'AG', SA: 'SA',
  NV: 'NV', BV: 'BV', AS: 'AS', AB: 'AB', KK: 'KK', PTE: 'Pte.', PVT: 'Pvt.', CO: 'Co.',
  USA: 'USA', US: 'US', UK: 'UK', RD: 'R&D',
}

export function formatSponsorName(raw: string): string {
  if (!raw) return ''
  let name = raw.trim().replace(/\s+/g, ' ')

  // Already mixed-case names came from NDC, which stores them properly. Leave them alone.
  if (name !== name.toUpperCase()) return name

  for (const [pattern, replacement] of SPONSOR_ABBREVIATIONS) {
    name = name.replace(pattern, replacement)
  }

  return name
    .split(' ')
    .map((word) => {
      const bare = word.replace(/[^A-Za-z&]/g, '').toUpperCase()
      const legal = SPONSOR_LEGAL_FORMS[bare]
      if (legal) return legal
      return word.toLowerCase().replace(/(^|[-/'])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
    })
    .join(' ')
}

// ---------------------------------------------------------------------------
// Brand names
// ---------------------------------------------------------------------------

export interface BrandCandidate {
  name: string
  /** True when the product this brand belongs to contained exactly one active ingredient. */
  singleIngredient: boolean
  count: number
}

/**
 * A brand list is only useful if it names *this* drug. Three things pollute it: the generic name
 * repeated as a "brand" (which FDA data does constantly), combination products whose brand belongs
 * to two molecules, and dosage-form suffixes that make the same brand look like several.
 */
export function pickBrandNames(
  candidates: readonly BrandCandidate[],
  moiety: string,
  limit = 6,
): string[] {
  const moietyNormalised = moiety.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  const seen = new Map<string, number>()

  // A brand seen ONLY on multi-ingredient products belongs to the combination, not to this
  // molecule: Caduet is amlodipine plus atorvastatin, and listing it as an atorvastatin brand
  // tells a reader something false. Keep such a brand only when no single-ingredient brand exists,
  // which is the legitimate case of a drug sold exclusively in combination.
  const hasSingleIngredientBrand = candidates.some((c) => c.singleIngredient && c.name.trim())
  const usable = hasSingleIngredientBrand ? candidates.filter((c) => c.singleIngredient) : candidates

  for (const candidate of usable) {
    const raw = candidate.name.trim()
    if (!raw) continue

    const upper = raw.toUpperCase()
    // A "brand" that is just the generic name is not a brand.
    if (upper.replace(/[^A-Z0-9]/g, '') === moietyNormalised) continue
    // Combination products: "AMLODIPINE AND ATORVASTATIN", "DAPAGLIFLOZIN AND METFORMIN".
    if (/\bAND\b|\bWITH\b|\//.test(upper) && upper.includes(moiety.split(' ')[0] ?? '')) continue
    // Names that are the generic plus a salt or form word add nothing.
    if (moietyNormalised && upper.replace(/[^A-Z0-9]/g, '').startsWith(moietyNormalised) && raw.length < moiety.length + 14) {
      continue
    }

    // Collapse dosage-form variants onto the parent brand: WEGOVY FLEXTOUCH -> Wegovy.
    const parent = raw.replace(
      /\s+(XR|ER|SR|CR|LA|HD|DS|IR|ODT|FLEXTOUCH|FLEXPEN|SOLOSTAR|KWIKPEN|PEN|INJECTOR|AUTOINJECTOR|SINGLE-DOSE|QLEX)\b.*$/i,
      '',
    ).trim()
    const key = parent.toUpperCase()
    seen.set(key, (seen.get(key) ?? 0) + candidate.count * (candidate.singleIngredient ? 3 : 1))
  }

  return [...seen.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => titleCaseDrugName(name))
}

// ---------------------------------------------------------------------------
// Label text
// ---------------------------------------------------------------------------

/**
 * Truncate at a sentence boundary. Cutting a drug's indication mid-word is the kind of detail that
 * makes a page read as machine spew, and there are thousands of these pages.
 */
export function trimToSentence(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const window = clean.slice(0, max)
  const lastStop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('. '), window.lastIndexOf('? '))
  if (lastStop > max * 0.5) return window.slice(0, lastStop + 1).trim()

  const lastSpace = window.lastIndexOf(' ')
  return `${(lastSpace > 0 ? window.slice(0, lastSpace) : window).trim()}…`
}

/**
 * Reduce an FDA indication to the noun phrase a reader recognises, by EXTRACTION only.
 *
 * The rules below pull a clause that the label already wrote; they never compose a summary. When
 * nothing matches, this returns '' and the dossier shows no patient-friendly indication rather
 * than one this pipeline invented. That distinction is the whole no-fabrication rule in miniature.
 */
const INDICATION_PATTERNS: ReadonlyArray<RegExp> = [
  // Most specific first. The order is the whole design: a label often satisfies several of these,
  // and the earlier ones name the CONDITION while the later ones name the setting it is used in.
  /\bfor\s+the\s+treatment\s+of\s+([^.;:•]{4,140})/i,
  /\bfor\s+the\s+(?:management|prevention|prophylaxis|relief|reduction|control|maintenance)\s+of\s+([^.;:•]{4,140})/i,
  /\bindicated\s+to\s+(?:reduce|lower|improve|increase|prevent|treat|control|relieve|slow|delay|maintain)\s+([^.;:•]{4,140})/i,
  // "indicated as an adjunct to diet and exercise to improve glycemic control in adults with
  // type 2 diabetes" -- the purpose clause after the adjunct preamble is the useful part.
  /\bindicated\s+as\s+an\s+adjunct[^.;:]*?\bto\s+(?:reduce|lower|improve|increase|prevent|treat|control)\s+([^.;:•]{4,140})/i,
  /\bindicated\s+in\s+(?:adults?|adult\s+patients?|pediatric\s+patients?|patients?|children|women|men)\s+(?:and\s+\w+\s+)?with\s+([^.;:•]{4,140})/i,
  /\bindicated\s+for\s+(?:use\s+in\s+)?(?:adults?|patients?)?\s*(?:with\s+)?([^.;:•]{4,140})/i,
  /\bfor\s+the\s+temporary\s+relief\s+of\s+([^.;:•]{4,140})/i,
  /^(?:uses?|purposes?)[:\s]+([^.;:•]{4,140})/i,
  // "…is indicated in combination with a reduced calorie diet…: to reduce the risk of major
  // adverse cardiovascular events" — the clause that matters follows the colon, not the verb.
  /\bindicated\b[^.]{0,120}?:\s*(?:•\s*)?to\s+(?:reduce|lower|improve|increase|prevent|treat|control)\s+([^.;:•]{4,140})/i,
]

/**
 * Captures that are grammatically valid but say nothing. "in combination with a reduced calorie
 * diet" is a real clause after "indicated", and it is exactly the wrong half of the sentence --
 * these guard against a pattern matching the setting instead of the condition.
 */
const INDICATION_REJECTS: ReadonlyArray<RegExp> = [
  /^(?:the\s+)?(?:following|treatment|use|uses|adults?|adult\s+patients?|patients?|pediatric|children|women|men)\s*$/i,
  /^combination\b/i,
  /^(?:an?\s+)?adjunct\b/i,
  /^(?:use\s+)?in\s+(?:adults?|patients?|children)\s*$/i,
  /^(?:certain|various|multiple|other)\b/i,
  // "Symptoms including" / "Symptoms associated with" with nothing after them: the label's own
  // sentence continued past a bullet the extractor could not follow.
  /^symptoms?\s+(?:including|associated)?\s*$/i,
  /^(?:the\s+)?(?:signs?\s+and\s+)?symptoms?\s*$/i,
  /^(?:this|that|it|which|who|whose)\b/i,
]

/** Trailing qualifiers that add length without adding meaning to a one-line indication. */
const INDICATION_TAIL =
  /\s+\b(?:in|for|when|who|whose|as|with)\s+(?:adults?|adult|pediatric|paediatric|patients?|children|infants?|males?|females?|women|men|combination|conjunction|addition)\b.*$/i

export function extractPatientFriendlyIndication(labelIndication: string | undefined): string {
  if (!labelIndication) return ''
  const text = labelIndication.replace(/\s+/g, ' ').trim()

  for (const pattern of INDICATION_PATTERNS) {
    const match = pattern.exec(text)
    const captured = match?.[1]
    if (!captured) continue

    // Clean in passes, not one chain: a parenthetical in the middle ("spinal muscular atrophy
    // (SMA) in pediatric and adult patients") hides the tail from a single-pass strip, and
    // removing the tail then exposes a dangling preposition that needs its own pass.
    let phrase = captured.trim()
    for (let pass = 0; pass < 3; pass += 1) {
      phrase = phrase
        .replace(INDICATION_TAIL, '')
        .replace(/^(?:adults?|adult|pediatric|paediatric|patients?|children|infants?)(?:\s+(?:and|or)\s+\w+)*(?:\s+patients?)?\s+with\s+/i, '')
        .replace(/\s*\([^)]*\)\s*$/, '')
        .replace(/\s+(?:in|for|with|as|to|of|and|or|the|a|an)\s*$/i, '')
        .replace(/[,;:]\s*$/, '')
        .trim()
    }

    if (phrase.length < 4 || phrase.length > 140) continue
    if (!/[a-z]{3}/i.test(phrase)) continue
    if (INDICATION_REJECTS.some((reject) => reject.test(phrase))) continue
    // A capture that is mostly the drug's own brand name is the label restating itself.
    if (/^[A-Z][A-Z0-9-]{3,}\s*(?:®|™)?\s*$/.test(phrase)) continue

    return phrase.charAt(0).toUpperCase() + phrase.slice(1)
  }

  return ''
}

/**
 * Pull a target from a mechanism-of-action paragraph, and only when the label states it outright.
 * Anything less certain stays empty: a wrong target gene on a drug page is worse than none, and
 * this runs over thousands of labels where nobody will check the output by hand.
 */
const TARGET_PATTERNS: ReadonlyArray<{ pattern: RegExp; group: number }> = [
  { pattern: /\b([A-Z][A-Z0-9-]{2,9})\s*(?:receptor\s*)?agonist\b/, group: 1 },
  { pattern: /\b([A-Z][A-Z0-9-]{2,9})\s*(?:receptor\s*)?antagonist\b/, group: 1 },
  { pattern: /\binhibitor\s+of\s+([A-Z][A-Za-z0-9-]{2,24})/, group: 1 },
  { pattern: /\binhibits\s+([A-Z][A-Za-z0-9-]{2,24})/, group: 1 },
  { pattern: /\b([A-Z][A-Z0-9-]{2,9})[- ]directed\b/, group: 1 },
  { pattern: /\bbinds\s+(?:to\s+)?(?:the\s+)?([A-Z][A-Z0-9-]{2,9})\s+receptor\b/, group: 1 },
  { pattern: /\btargets?\s+(?:the\s+)?([A-Z][A-Z0-9-]{2,9})\b/, group: 1 },
]

/** Words that look like gene symbols in capitals but are not. */
const TARGET_STOPWORDS = new Set([
  'FDA', 'USP', 'NDA', 'ANDA', 'BLA', 'USA', 'AUC', 'CMAX', 'TMAX', 'IV', 'IM', 'SC', 'PO',
  'THE', 'AND', 'FOR', 'NOT', 'ITS', 'ONE', 'TWO', 'HAS', 'WAS', 'ARE', 'MAY', 'CAN', 'ALL',
])

export function extractTarget(mechanismText: string | undefined): string {
  if (!mechanismText) return ''
  for (const { pattern, group } of TARGET_PATTERNS) {
    const match = pattern.exec(mechanismText)
    const captured = match?.[group]
    if (!captured) continue
    const symbol = captured.trim()
    if (TARGET_STOPWORDS.has(symbol.toUpperCase())) continue
    if (symbol.length < 3 || symbol.length > 24) continue
    return symbol
  }
  return ''
}
