import type { MolecularSchema } from '@/lib/types'
import { slugify } from '@/lib/ids'
import type { AggregatedSubstance } from './openfda'
import type { SupplementIngredient } from './dsld'
import {
  classifyApprovalStatus,
  classifyModality,
  extractPatientFriendlyIndication,
  extractTarget,
  pickBrandNames,
  pickSponsor,
  titleCaseDrugName,
  trimToSentence,
} from './normalise'

/**
 * Turns one aggregated substance into a database row.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: ingestion fills IDENTITY and REGULATORY facts, and nothing
 * else. Every field below is either copied from a source record, derived from one by a documented
 * rule, or left empty. There is no field here whose value this pipeline composed.
 *
 * That is why oneSentenceVerdict, laymanHowItWorks, pricing, substitutes, conditionContext,
 * mechanismSteps, keyAudits and trials are all empty or null on an ingested row: they are
 * editorial judgements, a contributor makes them, and a plausible-sounding sentence generated here
 * would be indistinguishable on the page from one a pharmacologist wrote. Leaving them blank is
 * what makes the difference visible.
 */

export interface IngestStructure {
  smiles?: string
  formula?: string
  molecularWeight?: number
  iupacName?: string
  xlogp?: number
  source: string
}

export interface BuildInput {
  substance: AggregatedSubstance
  supplement?: SupplementIngredient | undefined
  structure?: IngestStructure | undefined
}

export interface DrugInsert {
  id: string
  slug: string
  name: string
  tradeName: string | null
  sponsor: string
  targetGene: string
  targetProtein: string
  modality: ReturnType<typeof classifyModality>['modality']
  approvalStatus: ReturnType<typeof classifyApprovalStatus>['status']
  approvalYear: number | null
  indication: string
  patientFriendlyIndication: string
  oneSentenceVerdict: string
  laymanHowItWorks: string
  dossierDepth: 'stub'
  molecularSchema: MolecularSchema | null
  sourceProvenance: string[]
  /** Not persisted — carried so the loader can order, build aliases and report. */
  productCount: number
  moiety: string
  saltForms: string[]
  brandNames: string[]
  classificationRules: { modality: string; approval: string }
}

export interface SkipDecision {
  keep: boolean
  reason: string
}

/**
 * Names that are chemistry-catalogue entries, packaging artefacts or proprietary blends rather
 * than substances a reader would look up. Filtered explicitly, and every skip is logged with its
 * reason — a silent filter is a lie about coverage.
 */
const NON_SUBSTANCE_PATTERNS: ReadonlyArray<{ pattern: RegExp; reason: string }> = [
  { pattern: /^[\d\W]+$/, reason: 'no letters' },
  {
    pattern: /^(WATER|PURIFIED WATER|STERILE WATER|ALCOHOL|ETHYL ALCOHOL|GLYCERIN|GLYCERINE)$/i,
    reason: 'solvent or vehicle, not an active substance',
  },
  // Tablet fillers, binders and coatings. They are genuinely listed as ingredients on thousands of
  // labels, which is exactly why they float to the top of any popularity ordering -- and a wiki
  // page for "Magnesium Stearate" is a page nobody came for.
  {
    pattern:
      /^(CELLULOSE|MICROCRYSTALLINE CELLULOSE|MAGNESIUM STEARATE|STEARIC ACID|SILICON DIOXIDE|TITANIUM DIOXIDE|CROSCARMELLOSE|SODIUM STARCH GLYCOLATE|HYPROMELLOSE|POVIDONE|POLYSORBATE 80|SHELLAC|CARNAUBA WAX|TALC|DEXTRIN|MALTODEXTRIN|SUCROSE|LACTOSE|CORN STARCH|STARCH|SILICA|COLOR|FLAVOR|NATURAL FLAVOR)$/i,
    reason: 'excipient (filler, binder, coating or colourant)',
  },
  { pattern: /\bPROPRIETARY BLEND\b/i, reason: 'proprietary blend with no named substance' },
  { pattern: /^\(/, reason: 'IUPAC systematic name, not a drug name' },
  {
    pattern: /\d[,-]\d.*\b(YL|OXY|AMINO|METHYL|ETHYL)\b.*\d/i,
    reason: 'IUPAC systematic name, not a drug name',
  },
]

const MAX_NAME_LENGTH = 120

export function shouldIngest(input: BuildInput): SkipDecision {
  const { substance, supplement } = input
  const moiety = substance.moiety

  if (moiety.length < 3) return { keep: false, reason: 'name shorter than 3 characters' }
  if (moiety.length > MAX_NAME_LENGTH) {
    return {
      keep: false,
      reason: `name longer than ${MAX_NAME_LENGTH} characters (systematic name)`,
    }
  }
  for (const { pattern, reason } of NON_SUBSTANCE_PATTERNS) {
    if (pattern.test(moiety)) return { keep: false, reason }
  }

  const hasApplication =
    (substance.applicationKinds.NDA ?? 0) +
      (substance.applicationKinds.BLA ?? 0) +
      (substance.applicationKinds.ANDA ?? 0) >
    0

  // A substance with no label, no FDA application, one lone product listing and no supplement
  // record is almost always a data artefact. Anything with any of those four survives.
  if (!hasApplication && !substance.label && !supplement && substance.productCount < 2) {
    return {
      keep: false,
      reason: 'single product listing with no application, label or supplement record',
    }
  }

  return { keep: true, reason: 'kept' }
}

export function buildDossierRow(input: BuildInput): DrugInsert {
  const { substance, supplement, structure } = input

  // DSLD group names carry a parenthesised qualifier -- "Vitamin D (Mixed)", "Vitamin D
  // (Cholecalciferol)". baseMoiety already strips it for keying, so leaving it in the display name
  // produced a page titled with the parenthetical while a second page held the plain name.
  const supplementName = supplement?.group
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const displayName = titleCaseDrugName(supplementName || substance.moiety)
  const labelText = [
    substance.label?.mechanism_of_action,
    substance.label?.description,
    substance.label?.clinical_pharmacology,
  ]
    .filter(Boolean)
    .join(' ')

  const modality = classifyModality({
    moiety: substance.moiety,
    applicationKinds: substance.applicationKinds,
    marketingCategories: substance.marketingCategories,
    labelText: labelText || undefined,
    fromSupplementDatabase: Boolean(supplement),
    supplementCategory: supplement?.category,
  })

  const approval = classifyApprovalStatus({
    applicationKinds: substance.applicationKinds,
    marketingCategories: substance.marketingCategories,
    marketingStatuses: substance.marketingStatuses,
    fromSupplementDatabase: Boolean(supplement),
  })

  const brands = pickBrandNames(substance.brands, substance.moiety)

  // "Sponsor" is a regulatory role: the party that holds the application. A dietary supplement has
  // no application and therefore no sponsor, so whatever name the NDC labeler field happens to
  // carry -- often a contract manufacturer in another country -- would be presented as something
  // it is not. Only an actual FDA application supplies a sponsor.
  const hasApplicationSponsor = substance.sponsors.some((candidate) => candidate.fromApplication)
  const sponsor = hasApplicationSponsor ? pickSponsor(substance.sponsors) : ''

  const rawIndication = substance.label?.indications_and_usage ?? substance.label?.purpose ?? ''
  const indication = rawIndication ? trimToSentence(rawIndication, 600) : ''
  const patientFriendlyIndication = extractPatientFriendlyIndication(rawIndication)
  const target = extractTarget(substance.label?.mechanism_of_action)

  const provenance = [...substance.sources]
  if (supplement) provenance.push('NIH Dietary Supplement Label Database')
  if (structure) provenance.push(structure.source)

  // A structure block is written only when PubChem actually returned one. isMachineVerifiedStructure
  // stays false and no verificationHash is set: ingestion does not run the RNA Intelligence sweep,
  // and a verification hash that did not come from an actual sweep would be a forged certificate.
  const molecularSchema: MolecularSchema | null = structure
    ? {
        structureType: 'small_molecule_smiles',
        smilesString: structure.smiles,
        chemicalFormula: structure.formula,
        molecularWeight: structure.molecularWeight
          ? `${structure.molecularWeight.toFixed(2)} g/mol`
          : undefined,
        logP: structure.xlogp,
        isMachineVerified: false,
        laboratoryWorkflow: [],
      }
    : null

  // Every string below is capped to its column width. Postgres raises 22001 and aborts the whole
  // 500-row batch on a single over-long value, so the cap belongs here rather than in the loader:
  // one 400-character brand list would otherwise cost 499 unrelated rows.
  const slug = cap(slugify(displayName), 92)

  return {
    id: slug,
    slug,
    name: cap(displayName, 300),
    tradeName: brands.length > 0 ? cap(brands.join(' / '), 400) : null,
    sponsor: cap(sponsor, 300),
    targetGene: cap(target, 200),
    // The label states a target, not a protein name distinct from it. Duplicating the symbol into
    // targetProtein would be inventing a second fact from one; it stays empty for a contributor.
    targetProtein: '',
    modality: modality.modality,
    approvalStatus: approval.status,
    approvalYear: substance.firstApprovalYear,
    indication,
    patientFriendlyIndication,
    oneSentenceVerdict: '',
    laymanHowItWorks: '',
    dossierDepth: 'stub',
    molecularSchema,
    sourceProvenance: [...new Set(provenance)],
    productCount: substance.productCount + (supplement?.labelCount ?? 0),
    moiety: substance.moiety,
    saltForms: [...substance.rawNames.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => titleCaseDrugName(name)),
    brandNames: brands,
    classificationRules: { modality: modality.rule, approval: approval.rule },
  }
}

/**
 * Slugs must be unique, and two source records can normalise to the same one.
 *
 * The original comment here said that happened because "two different substances" could share a
 * slug, and gave "Vitamin B-12" and "Vitamin B 12" as the example — which is one substance spelled
 * two ways, and describes the bug rather than the case. Suffixing produced eleven pairs of pages
 * with identical titles: `vitamin-c` carrying six sources and a real indication, and `vitamin-c-2`
 * carrying one source and nothing at all, both called "Vitamin C".
 *
 * Rows with the same display name are now merged. Rows that merely slugify alike keep the suffix
 * and are reported, because those the pipeline genuinely cannot judge.
 */

/** The row that knows more, and how much more it knows. */
function informationScore(row: DrugInsert): number {
  const filled = [
    row.tradeName,
    row.sponsor,
    row.targetGene,
    row.indication,
    row.patientFriendlyIndication,
    row.laymanHowItWorks,
  ].filter((value) => typeof value === 'string' && value.trim().length > 0).length
  return filled * 1000 + row.sourceProvenance.length * 100 + row.productCount
}

/**
 * Folds `other` into `keep`. Every field the survivor left empty is taken from the loser, and the
 * list fields are unioned — the loser is about to stop existing, and anything it alone knew would
 * go with it.
 */
function mergeDuplicate(keep: DrugInsert, other: DrugInsert): void {
  const preferString = (a: string, b: string): string => (a.trim().length > 0 ? a : b)
  keep.tradeName = keep.tradeName ?? other.tradeName
  keep.sponsor = preferString(keep.sponsor, other.sponsor)
  keep.targetGene = preferString(keep.targetGene, other.targetGene)
  keep.targetProtein = preferString(keep.targetProtein, other.targetProtein)
  keep.indication = preferString(keep.indication, other.indication)
  keep.patientFriendlyIndication = preferString(
    keep.patientFriendlyIndication,
    other.patientFriendlyIndication,
  )
  keep.oneSentenceVerdict = preferString(keep.oneSentenceVerdict, other.oneSentenceVerdict)
  keep.laymanHowItWorks = preferString(keep.laymanHowItWorks, other.laymanHowItWorks)
  keep.approvalYear = keep.approvalYear ?? other.approvalYear
  keep.molecularSchema = keep.molecularSchema ?? other.molecularSchema
  keep.sourceProvenance = [...new Set([...keep.sourceProvenance, ...other.sourceProvenance])]
  keep.saltForms = [...new Set([...keep.saltForms, ...other.saltForms])]
  keep.brandNames = [...new Set([...keep.brandNames, ...other.brandNames])]
  keep.productCount += other.productCount
  // An FDA approval outranks a supplement listing: the same substance sold both ways is still an
  // approved drug, and saying otherwise on the page understates what is known about it.
  if (other.approvalStatus === 'FDA Approved') keep.approvalStatus = other.approvalStatus
}
/** Truncate to a column width without leaving a dangling separator. */
function cap(value: string, max: number): string {
  if (value.length <= max) return value
  return value.slice(0, max).replace(/[\s/-]+$/, '')
}

export function assignUniqueSlugs(rows: DrugInsert[]): DrugInsert[] {
  // Same display name, same substance. Done first, so the survivor takes the unsuffixed slug.
  const byName = new Map<string, DrugInsert>()
  const merged: string[] = []
  const kept: DrugInsert[] = []

  for (const row of rows) {
    const key = row.name.trim().toLowerCase()
    const existing = byName.get(key)
    if (!existing) {
      byName.set(key, row)
      kept.push(row)
      continue
    }
    if (informationScore(row) > informationScore(existing)) {
      // The newcomer knows more: it takes the survivor's place in the output, in position.
      mergeDuplicate(row, existing)
      kept[kept.indexOf(existing)] = row
      byName.set(key, row)
    } else {
      mergeDuplicate(existing, row)
    }
    merged.push(row.name)
  }

  if (merged.length > 0) {
    console.log(
      `[build] merged ${merged.length} records that shared a display name: ${merged.slice(0, 8).join(', ')}`,
    )
  }

  const taken = new Set<string>()
  const collisions: string[] = []

  for (const row of kept) {
    let candidate = row.slug
    let suffix = 2
    while (taken.has(candidate)) {
      const marker = `-${suffix}`
      candidate = `${row.slug.slice(0, 92 - marker.length)}${marker}`
      suffix += 1
    }
    if (candidate !== row.slug) collisions.push(`${row.name} (${row.slug} -> ${candidate})`)
    taken.add(candidate)
    row.slug = candidate
    row.id = candidate
  }

  // These are different names that slugify alike. Reported in full rather than sampled: each one
  // is a judgement the pipeline could not make, and there should never be many.
  if (collisions.length > 0) {
    console.log(`[build] ${collisions.length} slugs collided between differently-named records:`)
    for (const line of collisions) console.log(`   ${line}`)
  }
  return kept
}
