import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import {
  classifyEntity,
  type EntityClass,
  type EntityClassInput,
} from '@/lib/inventory/entity-class'
import { isPlaceholderMedicineIdentity } from '@/lib/public-data-integrity'
import { stableJsonStringify } from '@/lib/stable-json'
import {
  addFormCandidates,
  resolveByForm,
  SALT_OR_ESTER_SUFFIXES,
  type FormIndex,
} from '@/scripts/background/build-extracted-background'

/**
 * Triages every "empty" medicine-class record: a canonical record none of whose six statement
 * sections rests on a source. For each one it decides, from stored fields and the label archive
 * index alone, why it is empty, and writes the decision with its evidence.
 *
 * Reads the database; never writes to it. Outputs go to `docs/audits/empty-records/`:
 *
 *   medicine-class-triage.ndjson   one line per empty medicine-class record, with evidence
 *   class-changes.ndjson           records whose entity class rule 5 changes, with evidence
 *   trailing-tokens.json           every trailing token on a single-substance label name in the
 *                                  index, and whether the salt/ester table selects it
 *   summary.json                   counts per class and bucket, fractions, class-change pairs
 *
 * Usage:
 *   npx tsx scripts/inventory/audit-empty-records.ts [--label-index=<label-sections-index.json>]
 *                                                   [--out-dir=docs/audits/empty-records]
 *
 * The label index defaults to `$RNAWIKI_INGEST_DATA/label-sections-index.json`, the same file the
 * completion runner reads.
 *
 * Buckets, in the order they are tested:
 *
 *   SALT_OR_ESTER_LABEL_EXISTS      no label names the bare name (or a recorded salt-form or INN
 *                                   alias), but exactly one salt, ester or hydrate form of the name
 *                                   has its own single-substance label (`resolveByForm`).
 *   DISCONTINUED_NO_CURRENT_LABEL   no label under any form. The evidence records whether a
 *                                   Drugs@FDA application or a product listing is recorded, and
 *                                   whether the fallback declined because several forms exist.
 *   INGREDIENT_MISCLASSIFIED        labels exist, every one is a non-prescription product, none
 *                                   declares the record as its only active substance, and no
 *                                   Drugs@FDA application is recorded — the same four facts as
 *                                   entity-class rule 5, read here from the index rather than
 *                                   from the stored label-presence module.
 *   EXTRACTOR_MISSED                a single-substance label carrying at least one read section
 *                                   exists and nothing was recorded from it.
 *   SINGLE_LABEL_WITHOUT_READ_SECTION   a single-substance label exists but carries none of the
 *                                   sections the extractor reads.
 *   MULTI_SUBSTANCE_LABELS_ONLY     every label declares the record together with other
 *                                   substances, and rule 5 does not apply (a prescription label
 *                                   or an application is recorded). A statement about one
 *                                   substance is not read from such a label.
 *
 * The last two are not among the four buckets the triage set out to fill; they are reported
 * rather than forced into one.
 */

const SIX_STATEMENT_SECTIONS = [
  'recorded-uses',
  'mechanism',
  'safety-statements',
  'adverse-reactions',
  'pharmacokinetics',
  'population-statements',
] as const

const SOURCE_BACKED_STATES = new Set([
  'EXACT_SOURCE_BACKED',
  'EXACT_STRUCTURED_SOURCE_DATA',
  'REVIEWED_INTERPRETATION',
  'SOURCE_STATED_NON_ESTABLISHMENT',
  'REPRESENTED_SOURCE_CONFLICT',
])

const MEDICINE_CLASSES: readonly EntityClass[] = [
  'APPROVED_MEDICINE',
  'APPROVED_BIOLOGIC',
  'INVESTIGATIONAL_MEDICINE',
  'OFF_LABEL_OR_COMPOUNDED',
  'WITHDRAWN_MEDICINE',
]

const PRESCRIPTION_PRODUCT_TYPES = new Set(['HUMAN PRESCRIPTION DRUG', 'CELLULAR THERAPY'])

export const TRIAGE_BUCKETS = [
  'SALT_OR_ESTER_LABEL_EXISTS',
  'DISCONTINUED_NO_CURRENT_LABEL',
  'INGREDIENT_MISCLASSIFIED',
  'EXTRACTOR_MISSED',
  'SINGLE_LABEL_WITHOUT_READ_SECTION',
  'MULTI_SUBSTANCE_LABELS_ONLY',
] as const
export type TriageBucket = (typeof TRIAGE_BUCKETS)[number]

interface LabelSectionsEntry {
  setId: string
  names: string[]
  declared: number
  productTypes: string[]
  effectiveTime?: string
  sections: string[]
}

interface LabelSectionsIndex {
  schema: string
  builtAt: string
  labelIndexSha256?: string
  presenceSha256?: string
  readSections: string[]
  labels: number
  entries: LabelSectionsEntry[]
}

interface RawRow {
  id: string
  slug: string
  name: string
  trade_name: string | null
  modality: string
  approval_status: string
  entity_class: EntityClass
  entity_class_rule: string
  aliases: Array<{ alias: string; kind: string }>
  duplicate_names: string[]
  modules: string[]
  composition_count: number
  label_presence: {
    labelCount?: number
    singleSubstanceLabelCount?: number
    productTypesAsRecorded?: string[]
  } | null
  fda_application: string | null
  has_product_listing: boolean
  completion_sections: Array<{ sectionId: string; state: string; basisKind?: string }> | null
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

async function loadRows(): Promise<RawRow[]> {
  const result = await db.execute(sql`
    select d.id, d.slug, d.name, d.trade_name, d.modality, d.approval_status,
      ir.entity_class, ir.entity_class_rule,
      coalesce((select jsonb_agg(jsonb_build_object('alias', a.alias, 'kind', a.kind) order by lower(a.alias), a.kind)
                from drug_aliases a where a.drug_id = d.id), '[]'::jsonb) as aliases,
      coalesce((select jsonb_agg(dd.name order by dd.slug)
                from inventory_resolutions dr join drugs dd on dd.id = dr.drug_id
                where dr.canonical_drug_id = d.id and dr.drug_id <> d.id
                  and dr.resolution_status = 'DUPLICATE_OF_CANONICAL_ENTITY'), '[]'::jsonb) as duplicate_names,
      coalesce((select jsonb_agg(k order by k) from jsonb_object_keys(coalesce(d.recorded_background, '{}'::jsonb)) k), '[]'::jsonb) as modules,
      jsonb_array_length(coalesce(d.recorded_background->'composition'->'ingredients', '[]'::jsonb)) as composition_count,
      d.recorded_background->'labelPresence' as label_presence,
      d.recorded_background->'regulatoryApproval'->>'earliestApplicationNumber' as fda_application,
      (d.recorded_background ? 'productListing') as has_product_listing,
      a.sections as completion_sections
    from drugs d
    join inventory_resolutions ir on ir.drug_id = d.id and ir.resolution_status = 'CANONICAL_ENTITY'
    left join dossier_completion_assessments a on a.drug_id = d.id
    order by d.slug
  `)
  return result.rows as unknown as RawRow[]
}

/** The same name set the completion runner offers the label lookup. */
function lookupNames(row: RawRow): string[] {
  return [
    row.name,
    ...row.duplicate_names,
    ...row.aliases
      .filter((alias) => alias.kind === 'salt_form' || alias.kind === 'inn')
      .map((alias) => alias.alias),
  ]
}

function labelsFor(
  names: readonly string[],
  lookup: Map<string, LabelSectionsEntry[]>,
): LabelSectionsEntry[] {
  const seen = new Map<string, LabelSectionsEntry>()
  for (const name of names) {
    for (const key of new Set([normalizeContentName(name), normalizeIdentityName(name)])) {
      if (key.length < 3) continue
      for (const match of lookup.get(key) ?? []) seen.set(match.setId, match)
    }
  }
  return [...seen.values()].sort((left, right) => left.setId.localeCompare(right.setId))
}

function isEmpty(row: RawRow): boolean {
  const sections = row.completion_sections ?? []
  return !sections.some(
    (section) =>
      (SIX_STATEMENT_SECTIONS as readonly string[]).includes(section.sectionId) &&
      SOURCE_BACKED_STATES.has(section.state),
  )
}

function baseClassInput(row: RawRow): EntityClassInput {
  return {
    slug: row.slug,
    name: row.name,
    modality: row.modality,
    approvalStatus: row.approval_status,
    backgroundModules: row.modules,
    compositionIngredientCount: Number(row.composition_count ?? 0),
    isPlaceholder: isPlaceholderMedicineIdentity({ slug: row.slug, name: row.name }),
  }
}

/** The stored label-presence facts rule 5 reads, exactly as `resolve-inventory` must pass them. */
function labelPresenceInput(
  row: RawRow,
): Pick<
  EntityClassInput,
  'labelProductTypes' | 'singleSubstanceLabelCount' | 'hasRegulatoryApplication'
> {
  const presence = row.label_presence
  return {
    ...(presence?.productTypesAsRecorded
      ? { labelProductTypes: presence.productTypesAsRecorded }
      : {}),
    ...(typeof presence?.singleSubstanceLabelCount === 'number'
      ? { singleSubstanceLabelCount: presence.singleSubstanceLabelCount }
      : {}),
    hasRegulatoryApplication: Boolean(row.fda_application),
  }
}

interface TriageResult {
  bucket: TriageBucket
  evidence: Record<string, unknown>
}

function triage(
  row: RawRow,
  labels: LabelSectionsEntry[],
  readSections: ReadonlySet<string>,
  forms: FormIndex<LabelSectionsEntry>,
): TriageResult {
  const single = labels.filter((label) => label.declared === 1)
  const singleWithRead = single.filter((label) =>
    label.sections.some((section) => readSections.has(section)),
  )
  const productTypes = [...new Set(labels.flatMap((label) => label.productTypes))].sort()
  const anyPrescription = productTypes.some((type) => PRESCRIPTION_PRODUCT_TYPES.has(type))
  const declaredCounts = labels.map((label) => label.declared)
  const common = {
    labelsNamingEntity: labels.length,
    singleSubstanceLabels: single.length,
    singleSubstanceLabelsWithReadSection: singleWithRead.length,
    productTypes,
    fdaApplication: row.fda_application,
    productListingRecorded: row.has_product_listing,
  }

  if (labels.length === 0) {
    const resolution = resolveByForm(
      normalizeContentName(row.name),
      forms,
      (candidate, held) => candidate.setId < held.setId,
    )
    if (resolution.kind === 'MATCHED') {
      return {
        bucket: 'SALT_OR_ESTER_LABEL_EXISTS',
        evidence: {
          ...common,
          form: resolution.form,
          labelName: resolution.labelKey,
          labelSetId: resolution.label.setId,
          labelProductTypes: resolution.label.productTypes,
          labelReadSections: resolution.label.sections.filter((s) => readSections.has(s)),
        },
      }
    }
    return {
      bucket: 'DISCONTINUED_NO_CURRENT_LABEL',
      evidence: {
        ...common,
        formFallback:
          resolution.kind === 'NONE'
            ? 'no single-substance label under any salt, ester or hydrate form'
            : resolution.kind === 'AMBIGUOUS_FORMS'
              ? `declined: more than one form has its own label (${resolution.forms.join(', ')})`
              : `declined: elemental stem (${resolution.forms.join(', ')})`,
      },
    }
  }
  if (!anyPrescription && single.length === 0 && !row.fda_application) {
    return {
      bucket: 'INGREDIENT_MISCLASSIFIED',
      evidence: {
        ...common,
        rule: 'every label is HUMAN OTC DRUG, none declares this record alone, no Drugs@FDA application recorded (entity-class rule 5)',
        declaredSubstanceCountRange: [Math.min(...declaredCounts), Math.max(...declaredCounts)],
        sampleLabelSetIds: labels.slice(0, 5).map((label) => label.setId),
      },
    }
  }
  if (singleWithRead.length > 0) {
    return {
      bucket: 'EXTRACTOR_MISSED',
      evidence: {
        ...common,
        readSectionsPresent: [
          ...new Set(
            singleWithRead.flatMap((label) => label.sections.filter((s) => readSections.has(s))),
          ),
        ].sort(),
        sampleLabelSetIds: singleWithRead.slice(0, 5).map((label) => label.setId),
      },
    }
  }
  if (single.length > 0) {
    return {
      bucket: 'SINGLE_LABEL_WITHOUT_READ_SECTION',
      evidence: { ...common, sampleLabelSetIds: single.slice(0, 5).map((label) => label.setId) },
    }
  }
  return {
    bucket: 'MULTI_SUBSTANCE_LABELS_ONLY',
    evidence: {
      ...common,
      whyNotRule5: anyPrescription
        ? 'a prescription label names it'
        : 'a Drugs@FDA application is recorded',
      declaredSubstanceCountRange: [Math.min(...declaredCounts), Math.max(...declaredCounts)],
      sampleLabelSetIds: labels.slice(0, 5).map((label) => label.setId),
    },
  }
}

function emptyCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>
}

async function main(): Promise<void> {
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const indexPath = flag('label-index') ?? join(dataDir, 'label-sections-index.json')
  const outDir = flag('out-dir') ?? join(process.cwd(), 'docs', 'audits', 'empty-records')
  if (!existsSync(indexPath)) {
    throw new Error(`label sections index not found at ${indexPath}`)
  }
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as LabelSectionsIndex
  if (index.schema !== 'rnawiki-label-sections-index/v1') {
    throw new Error(`unexpected label index schema ${index.schema}`)
  }
  const readSections = new Set(index.readSections)

  // Name lookup and form index, both from the same entries the completion runner reads.
  const lookup = new Map<string, LabelSectionsEntry[]>()
  const forms: FormIndex<LabelSectionsEntry> = new Map()
  const trailing = new Map<string, Set<string>>()
  for (const entry of index.entries) {
    for (const name of entry.names) {
      const list = lookup.get(name) ?? []
      list.push(entry)
      lookup.set(name, list)
    }
    addFormCandidates(forms, entry.names, entry.declared, entry)
    if (entry.declared === 1) {
      for (const name of entry.names) {
        const tokens = name.split(' ')
        if (tokens.length < 2) continue
        const token = tokens[tokens.length - 1]!
        const stems = trailing.get(token) ?? new Set<string>()
        stems.add(tokens.slice(0, -1).join(' '))
        trailing.set(token, stems)
      }
    }
  }

  try {
    const rows = await loadRows()
    const triageLines: string[] = []
    const changeLines: string[] = []
    const byClassBucket = new Map<EntityClass, Record<TriageBucket, number>>()
    const emptyByClass = new Map<EntityClass, number>()
    const changePairs = new Map<string, number>()
    const formMatches: Array<Record<string, unknown>> = []
    const formDeclined: Array<Record<string, unknown>> = []
    let noAssessment = 0
    let emptyTotal = 0
    let rule5IndexAndStoredAgree = 0
    let rule5IndexOnly = 0
    let rule5StoredOnly = 0

    for (const row of rows) {
      // Class change under rule 5, measured over every canonical record.
      const before = classifyEntity(baseClassInput(row))
      const after = classifyEntity({ ...baseClassInput(row), ...labelPresenceInput(row) })
      if (before.entityClass !== after.entityClass) {
        const pair = `${before.entityClass} -> ${after.entityClass}`
        changePairs.set(pair, (changePairs.get(pair) ?? 0) + 1)
        changeLines.push(
          stableJsonStringify({
            slug: row.slug,
            name: row.name,
            approvalStatus: row.approval_status,
            from: before.entityClass,
            to: after.entityClass,
            rule: after.rule,
            storedEntityClass: row.entity_class,
            evidence: {
              labelProductTypes: row.label_presence?.productTypesAsRecorded ?? null,
              labelCount: row.label_presence?.labelCount ?? null,
              singleSubstanceLabelCount: row.label_presence?.singleSubstanceLabelCount ?? null,
              fdaApplication: row.fda_application,
            },
          }),
        )
      }

      if (!row.completion_sections) {
        noAssessment += 1
        continue
      }
      if (!isEmpty(row)) continue
      emptyTotal += 1
      emptyByClass.set(row.entity_class, (emptyByClass.get(row.entity_class) ?? 0) + 1)
      if (!MEDICINE_CLASSES.includes(row.entity_class)) continue

      const labels = labelsFor(lookupNames(row), lookup)
      const result = triage(row, labels, readSections, forms)
      const counts = byClassBucket.get(row.entity_class) ?? emptyCounts(TRIAGE_BUCKETS)
      counts[result.bucket] += 1
      byClassBucket.set(row.entity_class, counts)

      const storedRule5 =
        after.entityClass === 'MARKETED_PRODUCT_INGREDIENT' && after.rule.startsWith('rule-5')
      const indexRule5 = result.bucket === 'INGREDIENT_MISCLASSIFIED'
      if (storedRule5 && indexRule5) rule5IndexAndStoredAgree += 1
      else if (indexRule5) rule5IndexOnly += 1
      else if (storedRule5) rule5StoredOnly += 1

      if (result.bucket === 'SALT_OR_ESTER_LABEL_EXISTS') {
        formMatches.push({ slug: row.slug, entityClass: row.entity_class, ...result.evidence })
      } else if (
        result.bucket === 'DISCONTINUED_NO_CURRENT_LABEL' &&
        typeof result.evidence.formFallback === 'string' &&
        result.evidence.formFallback.startsWith('declined')
      ) {
        formDeclined.push({
          slug: row.slug,
          entityClass: row.entity_class,
          reason: result.evidence.formFallback,
        })
      }

      triageLines.push(
        stableJsonStringify({
          slug: row.slug,
          name: row.name,
          entityClass: row.entity_class,
          entityClassRule: row.entity_class_rule,
          approvalStatus: row.approval_status,
          reclassifiedByRule5: storedRule5 ? after.entityClass : null,
          bucket: result.bucket,
          evidence: result.evidence,
        }),
      )
    }

    // The suffix table checked against the archive it claims to come from.
    const trailingRows = [...trailing.entries()]
      .map(([token, stems]) => ({
        token,
        distinctStems: stems.size,
        stemsThatAreIndexedNames: [...stems].filter((stem) => lookup.has(stem)).length,
        selected: SALT_OR_ESTER_SUFFIXES.has(token),
      }))
      .sort(
        (left, right) =>
          right.distinctStems - left.distinctStems || left.token.localeCompare(right.token),
      )
    const suffixesInIndex = [...SALT_OR_ESTER_SUFFIXES].filter((token) => trailing.has(token))
    const suffixesMissing = [...SALT_OR_ESTER_SUFFIXES].filter((token) => !trailing.has(token))

    const approved = byClassBucket.get('APPROVED_MEDICINE') ?? emptyCounts(TRIAGE_BUCKETS)
    const approvedTotal = emptyByClass.get('APPROVED_MEDICINE') ?? 0
    const summary = {
      schema: 'rnawiki-empty-record-triage/v1',
      labelIndex: {
        path: indexPath,
        builtAt: index.builtAt,
        labels: index.labels,
        labelIndexSha256: index.labelIndexSha256 ?? null,
        presenceSha256: index.presenceSha256 ?? null,
      },
      canonicalRecords: rows.length,
      recordsWithoutCompletionAssessment: noAssessment,
      emptyDefinition: `none of ${SIX_STATEMENT_SECTIONS.join(', ')} is in a source-backed state (${[...SOURCE_BACKED_STATES].join(', ')})`,
      emptyRecords: emptyTotal,
      emptyByEntityClass: Object.fromEntries(
        [...emptyByClass.entries()].sort(([left], [right]) => left.localeCompare(right)),
      ),
      medicineClassTriage: {
        classes: MEDICINE_CLASSES,
        buckets: TRIAGE_BUCKETS,
        byClass: Object.fromEntries(
          MEDICINE_CLASSES.map((entityClass) => [
            entityClass,
            byClassBucket.get(entityClass) ?? emptyCounts(TRIAGE_BUCKETS),
          ]),
        ),
        approvedMedicine: {
          empty: approvedTotal,
          byBucket: approved,
          fractionOfEmpties: Object.fromEntries(
            TRIAGE_BUCKETS.map((bucket) => [
              bucket,
              approvedTotal === 0 ? 0 : Number((approved[bucket] / approvedTotal).toFixed(4)),
            ]),
          ),
        },
      },
      rule5: {
        description:
          'approved status, every label naming the record is a non-prescription product, no label declares it alone, no Drugs@FDA application recorded -> MARKETED_PRODUCT_INGREDIENT',
        classChanges: changeLines.length,
        byPair: Object.fromEntries(
          [...changePairs.entries()].sort(([left], [right]) => left.localeCompare(right)),
        ),
        emptyMedicineClassAgreement: {
          indexAndStoredAgree: rule5IndexAndStoredAgree,
          indexOnly: rule5IndexOnly,
          storedOnly: rule5StoredOnly,
        },
      },
      saltOrEsterFallback: {
        suffixTableSize: SALT_OR_ESTER_SUFFIXES.size,
        suffixesFoundAsTrailingTokenInIndex: suffixesInIndex.length,
        suffixesNotFoundInIndex: suffixesMissing,
        stemsWithSingleSubstanceFormLabels: forms.size,
        matched: formMatches,
        declined: formDeclined,
      },
    }

    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'medicine-class-triage.ndjson'), `${triageLines.join('\n')}\n`)
    writeFileSync(join(outDir, 'class-changes.ndjson'), `${changeLines.join('\n')}\n`)
    writeFileSync(
      join(outDir, 'trailing-tokens.json'),
      `${JSON.stringify({ singleSubstanceTrailingTokens: trailingRows }, null, 2)}\n`,
    )
    writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
    // The JSON outputs live under docs/, which `npm run format` checks; formatting them here keeps
    // a regenerated audit from failing the gate on whitespace alone.
    execFileSync(
      'npx',
      ['prettier', '--write', join(outDir, 'summary.json'), join(outDir, 'trailing-tokens.json')],
      { stdio: 'ignore' },
    )
    console.log(
      `[audit] ${rows.length} canonical records · ${emptyTotal} empty · ${triageLines.length} medicine-class empties triaged · ${changeLines.length} class changes under rule 5 · wrote 4 file(s) to ${outDir}`,
    )
    for (const entityClass of MEDICINE_CLASSES) {
      console.log(`[audit] ${entityClass}: ${JSON.stringify(byClassBucket.get(entityClass) ?? {})}`)
    }
  } finally {
    await closeDatabasePool()
  }
}

if (process.argv[1]?.endsWith('audit-empty-records.ts')) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
