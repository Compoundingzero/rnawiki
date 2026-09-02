import { createHash } from 'node:crypto'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import type { AttributionWarning, EntityClass, IdentitySource } from '@/lib/inventory/types'
import { stableJsonStringify } from '@/lib/stable-json'

import {
  DOSSIER_COMPLETION_RESOLVER_VERSION,
  DOSSIER_SECTION_IDS,
  isTerminalSectionState,
  type DossierCompletionAssessment,
  type DossierSectionId,
  type SectionAssessment,
  type SectionBasisKind,
  type SectionSourceRef,
  type SectionState,
} from './types'

/**
 * The pure dossier-completion resolver.
 *
 * Every rule reads stored facts and answers "which honest state did this section reach?". The
 * rules never write a value into a section, never choose between disagreeing sources and never
 * turn an absence into a finding. Where a section rests on a search, the basis names the exact
 * search space (a dated archive, a hashed registry snapshot, a query) so a reader can repeat it.
 *
 * Two distinctions are kept everywhere:
 * - "the read sections of this label carry no qualifying statement" is different from "no label
 *   names this entity", and both are different from "the section was never read";
 * - "registered" is different from "results posted", and both are different from "measured".
 */

export interface LabelMatch {
  setId: string
  /** Declared active substances on the label; 1 means the label is about this entity alone. */
  declared: number
  sections: string[]
  productTypes: string[]
}

export interface SearchRecordInput {
  status: 'SUCCEEDED' | 'UNREACHABLE' | 'FAILED'
  sourceIdentifier: string
  requestedAt: string
  resultCount: number | null
  error: string | null
  /** For the registry search: the stored match envelope. */
  matched: unknown[]
}

export interface CompletionInput {
  drug: {
    id: string
    slug: string
    name: string
    dossierDepth: 'stub' | 'curated' | 'flagship'
    modality: string
    approvalStatus: string
    recordedBackground: MedicineRecordedBackground | null
    legacyTrials: Array<{ trialId: string; phase?: string; endpointStatus?: string }>
    keyAudits: Array<{ evidenceSource?: string; doi?: string }>
    sourceProvenance: string[]
    molecularSchema: {
      smilesString?: string
      chemicalFormula?: string
      sequence5to3?: string
    } | null
  }
  resolution: {
    entityClass: EntityClass
    identitySources: IdentitySource[]
    attributionWarnings: AttributionWarning[]
  }
  duplicateRecords: Array<{ slug: string; recordedBackground: MedicineRecordedBackground | null }>
  labels: LabelMatch[]
  /** The fixed section vocabulary the label index reads; anything else was never read. */
  readLabelSections: readonly string[]
  archives: {
    labelArchive: string
    ndcDirectory: string
    drugsAtFda: string
    supplementDatabase: string
    pricingFile: string
    compoundDatabase: string
    taxonomy: string
    substanceRegistry: string
  }
  registrySearch: SearchRecordInput | null
  literatureSearch: SearchRecordInput | null
  programmes: { total: number; published: number }
  /**
   * Whether the deterministic label extractor has been run for this record. True for the extracted
   * and transcribed tiers by construction, and for hand-curated records once the curated-gap
   * extraction registry has been built over them. False means a label section may exist unread.
   */
  labelExtractorRan: boolean
}

interface RegistryMatchEnvelope {
  totalMatchedStudies?: number
  storedStudies?: number
  withPostedResults?: number
  studies?: Array<{
    nctId?: string
    hasResults?: boolean
    resultsFirstPostDate?: string | null
    overallStatus?: string | null
    eligibility?: {
      sex?: string | null
      minimumAge?: string | null
      maximumAge?: string | null
      stdAges?: string[]
      healthyVolunteers?: boolean | null
    }
    primaryOutcomes?: Array<{ measure?: string }>
  }>
}

type Background = MedicineRecordedBackground
type BackgroundModule = keyof Background

interface ModuleHit {
  module: BackgroundModule
  value: unknown
  ownerSlug: string
  onDuplicate: boolean
}

const SUBSTANCE_MODULES_ON_INGREDIENTS = new Set<BackgroundModule>([
  'mechanism',
  'pharmacokinetics',
  'molecularIdentity',
  'interactionSignals',
  'recordedUses',
])

const BIOLOGIC_MODALITIES = new Set([
  'Recombinant Protein / Biologic',
  'Monoclonal Antibody (mAb)',
  'Peptide / GLP-1 Agonist',
  'CRISPR / Gene Therapy',
  'ASO (Antisense Oligonucleotide)',
  'siRNA (Small Interfering RNA)',
  'mRNA Vaccine / Therapeutic',
])

const PRICED_CLASSES = new Set<EntityClass>([
  'APPROVED_MEDICINE',
  'APPROVED_BIOLOGIC',
  'OFF_LABEL_OR_COMPOUNDED',
  'WITHDRAWN_MEDICINE',
  'COMBINATION_PRODUCT',
  'MARKETED_PRODUCT_INGREDIENT',
])

const MAX_REFS = 12

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/** Collect every recorded source object beneath a module value, de-duplicated and bounded. */
function collectSourceRefs(
  value: unknown,
  refs = new Map<string, SectionSourceRef>(),
): SectionSourceRef[] {
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      for (const item of node) visit(item)
      return
    }
    const record = node as Record<string, unknown>
    if (typeof record.kind === 'string' && typeof record.identifier === 'string') {
      const key = `${record.kind}:${record.identifier}`
      if (!refs.has(key)) {
        refs.set(key, {
          kind: record.kind,
          identifier: record.identifier,
          label: typeof record.label === 'string' ? record.label : undefined,
          retrievedAt: typeof record.retrievedAt === 'string' ? record.retrievedAt : undefined,
        })
      }
    }
    for (const child of Object.values(record)) visit(child)
  }
  visit(value)
  return [...refs.values()].slice(0, MAX_REFS)
}

function labelRefs(labels: readonly LabelMatch[]): SectionSourceRef[] {
  return labels.slice(0, MAX_REFS).map((label) => ({
    kind: 'FDA_LABEL',
    identifier: label.setId,
    label: `${label.declared === 1 ? 'single-substance' : `${label.declared}-substance`} label`,
  }))
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function completionInputDigest(input: CompletionInput): string {
  return sha256(
    stableJsonStringify({
      resolver: DOSSIER_COMPLETION_RESOLVER_VERSION,
      drug: input.drug,
      resolution: input.resolution,
      duplicateRecords: input.duplicateRecords,
      labels: input.labels,
      readLabelSections: input.readLabelSections,
      archives: input.archives,
      registrySearch: input.registrySearch
        ? { ...input.registrySearch, requestedAt: undefined }
        : null,
      literatureSearch: input.literatureSearch
        ? { ...input.literatureSearch, requestedAt: undefined }
        : null,
      programmes: input.programmes,
      labelExtractorRan: input.labelExtractorRan,
    }),
  )
}

class Resolver {
  private readonly hits = new Map<BackgroundModule, ModuleHit>()

  constructor(private readonly input: CompletionInput) {
    const own = input.drug.recordedBackground
    const consider = (background: Background | null, ownerSlug: string, onDuplicate: boolean) => {
      if (!background) return
      for (const [moduleKey, value] of Object.entries(background) as Array<
        [BackgroundModule, unknown]
      >) {
        if (!isPresent(value) || this.hits.has(moduleKey)) continue
        this.hits.set(moduleKey, { module: moduleKey, value, ownerSlug, onDuplicate })
      }
      // Substance-specific modules recorded on a product's ingredients count for the product.
      for (const ingredient of background.composition?.ingredients ?? []) {
        for (const moduleKey of SUBSTANCE_MODULES_ON_INGREDIENTS) {
          const value = (ingredient as unknown as Record<string, unknown>)[moduleKey]
          if (isPresent(value) && !this.hits.has(moduleKey)) {
            this.hits.set(moduleKey, { module: moduleKey, value, ownerSlug, onDuplicate })
          }
        }
      }
    }
    consider(own, input.drug.slug, false)
    for (const duplicate of input.duplicateRecords) {
      consider(duplicate.recordedBackground, duplicate.slug, true)
    }
  }

  private hit(moduleKey: BackgroundModule): ModuleHit | undefined {
    return this.hits.get(moduleKey)
  }

  private get labels(): LabelMatch[] {
    return this.input.labels
  }

  private labelsWith(sections: readonly string[], singleSubstanceOnly: boolean): LabelMatch[] {
    return this.labels.filter(
      (label) =>
        (!singleSubstanceOnly || label.declared === 1) &&
        label.sections.some((section) => sections.includes(section)),
    )
  }

  private readSectionsClause(sections: readonly string[]): string {
    const read = sections.filter((section) => this.input.readLabelSections.includes(section))
    return read.length > 0 ? read.join(', ') : 'none of the read sections'
  }

  private recorded(
    sectionId: DossierSectionId,
    hit: ModuleHit,
    state: SectionState,
    detail: string,
    counts?: Record<string, number>,
  ): SectionAssessment {
    return {
      sectionId,
      state,
      basisKind: hit.onDuplicate ? 'RECORDED_MODULE_ON_DUPLICATE_RECORD' : 'RECORDED_MODULE',
      basis: hit.onDuplicate
        ? `${detail} Recorded on the merged duplicate record "${hit.ownerSlug}", which now redirects here.`
        : detail,
      sourceRefs: collectSourceRefs(hit.value),
      counts,
    }
  }

  /**
   * The shared label logic for a section read from label text. Returns the honest absence state
   * when no module is recorded: which labels exist, whether any is about this entity alone, and
   * whether the relevant sections were present on those labels.
   */
  private labelAbsence(
    sectionId: DossierSectionId,
    sections: readonly string[],
    substanceSpecific: boolean,
    supplementNote: string,
  ): SectionAssessment {
    const total = this.labels.length
    const single = this.labels.filter((label) => label.declared === 1)
    const eligible = substanceSpecific ? single : this.labels
    const withSection = this.labelsWith(sections, substanceSpecific)
    const counts = {
      labelsNamingEntity: total,
      singleSubstanceLabels: single.length,
      labelsWithReadSection: withSection.length,
    }
    if (withSection.length > 0) {
      // A hand-curated envelope that the extractor has not been run over holds an unread section,
      // not a section the extractor read and found empty. The runner states which case applies.
      if (!this.input.labelExtractorRan) {
        return {
          sectionId,
          state: 'BLOCKED_HUMAN_REVIEW',
          basisKind: 'LABEL_ARCHIVE_SEARCH',
          basis: `${withSection.length} label(s) ${substanceSpecific ? 'about this entity alone ' : 'naming this entity '}carry the read section(s) ${this.readSectionsClause(sections)}, but this record was hand-curated and the deterministic label extractor has not been run for it, so those sections have not been read into the record.`,
          sourceRefs: labelRefs(withSection),
          counts,
          humanReadSuggested: true,
          blockedReason:
            'Run the curated-gap label extraction for this record, or have a person read the named label set and record the statement through the normal reviewed workflow.',
        }
      }
      return {
        sectionId,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'LABEL_SECTION_READ_NO_QUALIFYING_STATEMENT',
        basis: `${withSection.length} label(s) ${substanceSpecific ? 'about this entity alone ' : 'naming this entity '}carry the read section(s) ${this.readSectionsClause(sections)}; the deterministic extractor read them and recorded no statement that met its rules. A person reading the named label set could add one.`,
        sourceRefs: labelRefs(withSection),
        counts,
        humanReadSuggested: true,
      }
    }
    if (eligible.length > 0) {
      return {
        sectionId,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'LABEL_ARCHIVE_SEARCH',
        basis: `${eligible.length} label(s) ${substanceSpecific ? 'about this entity alone ' : 'naming this entity '}were read; none carries ${this.readSectionsClause(sections)}. Sections outside the read set (for example an over-the-counter "Warnings" section) were not read. Label archive dated ${this.input.archives.labelArchive}.`,
        sourceRefs: labelRefs(eligible),
        counts,
        humanReadSuggested: true,
      }
    }
    if (total > 0 && substanceSpecific) {
      return {
        sectionId,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'LABEL_ARCHIVE_SEARCH',
        basis: `${total} label(s) name this entity together with other active substances and none is about it alone; a statement about one substance is only recorded from a label about that substance alone. Label archive dated ${this.input.archives.labelArchive}.`,
        sourceRefs: labelRefs(this.labels),
        counts,
      }
    }
    return {
      sectionId,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'LABEL_ARCHIVE_SEARCH',
      basis: `No label in the openFDA archive dated ${this.input.archives.labelArchive} names this entity as an active substance.${supplementNote}`,
      sourceRefs: [],
      counts,
    }
  }

  identity(): SectionAssessment {
    const { resolution, drug } = this.input
    const shared = resolution.attributionWarnings.some(
      (w) => w.code === 'SHARED_REGISTRY_IDENTIFIER',
    )
    const sharedNote = shared
      ? ' A registry identifier on this record also appears on other records in this corpus; records are kept separate and are not linked.'
      : ''
    if (resolution.identitySources.length > 0) {
      const refs = resolution.identitySources
        .filter((source) => source.kind !== 'FDA_NDC' && source.kind !== 'FDA_LABEL_SET')
        .slice(0, MAX_REFS)
        .map((source) => ({ kind: source.kind, identifier: source.identifier, label: source.path }))
      return {
        sectionId: 'identity',
        state: 'EXACT_STRUCTURED_SOURCE_DATA',
        basisKind: 'REGISTRY_IDENTIFIER',
        basis: `Identity rests on ${resolution.identitySources.length} recorded registry identifier(s) of kind ${[...new Set(resolution.identitySources.map((s) => s.kind))].join(', ')}.${sharedNote}`,
        sourceRefs:
          refs.length > 0
            ? refs
            : resolution.identitySources
                .slice(0, MAX_REFS)
                .map((s) => ({ kind: s.kind, identifier: s.identifier })),
        counts: { registryIdentifiers: resolution.identitySources.length },
      }
    }
    if (drug.sourceProvenance.length > 0 || drug.keyAudits.length > 0) {
      const provenance = drug.sourceProvenance.slice(0, MAX_REFS)
      return {
        sectionId: 'identity',
        state: 'EXACT_STRUCTURED_SOURCE_DATA',
        basisKind: 'LEGACY_RECORD_FIELD',
        basis: `No registry identifier is recorded. Identity rests on the recorded name and the ingest source(s): ${provenance.join('; ') || 'recorded audit sources'}.${sharedNote}`,
        sourceRefs: provenance.map((label) => ({ kind: 'INGEST_PROVENANCE', identifier: label })),
        counts: { registryIdentifiers: 0, provenanceLabels: drug.sourceProvenance.length },
        humanReadSuggested: true,
      }
    }
    return {
      sectionId: 'identity',
      state: 'ATTRIBUTION_UNRESOLVED',
      basisKind: 'NOT_YET_RUN',
      basis: 'No registry identifier, ingest provenance or audit source is recorded for this name.',
      sourceRefs: [],
      blockedReason:
        'A person must record at least one registry identifier or a source for this identity.',
    }
  }

  regulatoryStatus(): SectionAssessment {
    const id: DossierSectionId = 'regulatory-status'
    for (const moduleKey of ['regulatoryApproval', 'productListing', 'labelPresence'] as const) {
      const hit = this.hit(moduleKey)
      if (hit) {
        return this.recorded(
          id,
          hit,
          'EXACT_STRUCTURED_SOURCE_DATA',
          `Recorded regulatory or market status as classified by the ingest rules ("${this.input.drug.approvalStatus}"), backed by the ${moduleKey === 'regulatoryApproval' ? 'Drugs@FDA application register' : moduleKey === 'productListing' ? 'National Drug Code directory' : 'label archive'} record.`,
        )
      }
    }
    for (const moduleKey of ['supplementIngredient', 'supplementMarket'] as const) {
      const hit = this.hit(moduleKey)
      if (hit) {
        return this.recorded(
          id,
          hit,
          'EXACT_STRUCTURED_SOURCE_DATA',
          `Recorded as a supplement ingredient in the NIH Dietary Supplement Label Database; no FDA application, product listing or label names it. Status as classified by the ingest rules: "${this.input.drug.approvalStatus}".`,
        )
      }
    }
    if (this.input.drug.sourceProvenance.length > 0) {
      return {
        sectionId: id,
        state: 'EXACT_STRUCTURED_SOURCE_DATA',
        basisKind: 'LEGACY_RECORD_FIELD',
        basis: `Status "${this.input.drug.approvalStatus}" as classified by the ingest rules from ${this.input.drug.sourceProvenance.join('; ')}; no structured registry module is recorded.`,
        sourceRefs: this.input.drug.sourceProvenance
          .slice(0, MAX_REFS)
          .map((label) => ({ kind: 'INGEST_PROVENANCE', identifier: label })),
        humanReadSuggested: true,
      }
    }
    return {
      sectionId: id,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'LABEL_ARCHIVE_SEARCH',
      basis: `No Drugs@FDA application (${this.input.archives.drugsAtFda}), National Drug Code listing (${this.input.archives.ndcDirectory}), label (${this.input.archives.labelArchive}) or supplement-database ingredient group (${this.input.archives.supplementDatabase}) names this entity. The recorded status "${this.input.drug.approvalStatus}" is a hand-authored classification.`,
      sourceRefs: [],
    }
  }

  recordedUses(): SectionAssessment {
    const hit = this.hit('recordedUses')
    if (hit) {
      const statements = (hit.value as { statements?: unknown[] }).statements ?? []
      return this.recorded(
        'recorded-uses',
        hit,
        'EXACT_SOURCE_BACKED',
        `${statements.length} use statement(s) recorded verbatim from the indications section of the named label(s).`,
        { statements: statements.length },
      )
    }
    return this.labelAbsence(
      'recorded-uses',
      ['indications_and_usage'],
      false,
      ' Supplement-database ingredient records carry no use statement.',
    )
  }

  substanceSection(
    sectionId: DossierSectionId,
    moduleKey: BackgroundModule,
    sections: readonly string[],
    describe: (value: unknown) => { detail: string; counts?: Record<string, number> },
  ): SectionAssessment {
    const hit = this.hit(moduleKey)
    if (hit) {
      const { detail, counts } = describe(hit.value)
      return this.recorded(sectionId, hit, 'EXACT_SOURCE_BACKED', detail, counts)
    }
    return this.labelAbsence(
      sectionId,
      sections,
      true,
      ' Supplement-database ingredient records carry no pharmacology text.',
    )
  }

  pharmacokinetics(): SectionAssessment {
    const consensus = this.hit('sourceConsensus')?.value as
      { fields?: Array<{ field?: string; comparisonState?: string }> } | undefined
    const differing = (consensus?.fields ?? []).filter(
      (field) =>
        field.comparisonState === 'differ' &&
        ['halfLife', 'bioavailability', 'tMax', 'proteinBinding', 'volumeOfDistribution'].includes(
          field.field ?? '',
        ),
    )
    const base = this.substanceSection(
      'pharmacokinetics',
      'pharmacokinetics',
      ['pharmacokinetics', 'clinical_pharmacology'],
      (value) => {
        const record = value as Record<string, unknown>
        const fields = Object.keys(record).filter((key) => isPresent(record[key]))
        return {
          detail: `${fields.length} pharmacokinetic value(s) recorded with the label sentence each was read from: ${fields.join(', ')}.`,
          counts: { recordedFields: fields.length },
        }
      },
    )
    if (base.state === 'EXACT_SOURCE_BACKED' && differing.length > 0) {
      return {
        ...base,
        state: 'SOURCE_CONFLICT',
        basis: `${base.basis} Independent labels print comparable but different values for ${differing.map((f) => f.field).join(', ')}; every reading is kept and none is chosen.`,
        counts: { ...(base.counts ?? {}), differingFields: differing.length },
      }
    }
    return base
  }

  molecularIdentity(): SectionAssessment {
    const id: DossierSectionId = 'molecular-identity'
    const hit = this.hit('molecularIdentity')
    if (hit) {
      return this.recorded(
        id,
        hit,
        'EXACT_STRUCTURED_SOURCE_DATA',
        'Molecular formula and weight recorded from the named compound or label record.',
      )
    }
    const schema = this.input.drug.molecularSchema
    if (schema && (schema.smilesString || schema.chemicalFormula || schema.sequence5to3)) {
      return {
        sectionId: id,
        state: 'EXACT_STRUCTURED_SOURCE_DATA',
        basisKind: 'LEGACY_RECORD_FIELD',
        basis: `A ${schema.sequence5to3 ? 'sequence' : schema.smilesString ? 'SMILES structure' : 'chemical formula'} is recorded on the medicine record from ${this.input.drug.sourceProvenance.find((p) => /pubchem/iu.test(p)) ?? 'the recorded structure source'}.`,
        sourceRefs: [],
      }
    }
    const klass = this.input.resolution.entityClass
    if (klass === 'BOTANICAL_OR_ORGANISM_PREPARATION') {
      return {
        sectionId: id,
        state: 'NOT_APPLICABLE',
        basisKind: 'ENTITY_CLASS_RULE',
        basis:
          'This record is an organism or a preparation of one; it has no single molecular structure to record.',
        sourceRefs: [],
      }
    }
    if (BIOLOGIC_MODALITIES.has(this.input.drug.modality)) {
      return {
        sectionId: id,
        state: 'NOT_APPLICABLE',
        basisKind: 'ENTITY_CLASS_RULE',
        basis: `This record is classified as "${this.input.drug.modality}"; small-molecule compound descriptors do not apply and no sequence is recorded.`,
        sourceRefs: [],
      }
    }
    return {
      sectionId: id,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'COMPOUND_DATABASE_SEARCH',
      basis: `No PubChem compound record was matched to this name when the compound-identity registry was built (${this.input.archives.compoundDatabase}), and no label or structure source records a formula.`,
      sourceRefs: [],
    }
  }

  safetyStatements(): SectionAssessment {
    const hit = this.hit('safety')
    if (hit) {
      const value = hit.value as { boxedWarning?: unknown; contraindications?: unknown[] }
      const counts = {
        boxedWarning: value.boxedWarning ? 1 : 0,
        contraindications: value.contraindications?.length ?? 0,
      }
      return this.recorded(
        'safety-statements',
        hit,
        'EXACT_SOURCE_BACKED',
        `${counts.boxedWarning ? 'A boxed warning and ' : ''}${counts.contraindications} contraindication statement(s) recorded verbatim from the named label(s).`,
        counts,
      )
    }
    return this.labelAbsence(
      'safety-statements',
      ['boxed_warning', 'contraindications', 'warnings_and_cautions'],
      false,
      ' Supplement-database ingredient records carry no warning text.',
    )
  }

  populationStatements(): SectionAssessment {
    const hit = this.hit('populationStatements')
    if (hit) {
      const statements = hit.value as Array<{ state?: string }>
      const counts = {
        studied: statements.filter((s) => s.state === 'STUDIED').length,
        notEstablished: statements.filter((s) => s.state === 'NOT_ESTABLISHED').length,
        statementOnly: statements.filter((s) => s.state === 'STATEMENT_ONLY').length,
      }
      const allNotEstablished =
        counts.notEstablished > 0 && counts.studied === 0 && counts.statementOnly === 0
      return this.recorded(
        'population-statements',
        hit,
        allNotEstablished ? 'SOURCE_STATED_NOT_ESTABLISHED' : 'EXACT_SOURCE_BACKED',
        `${statements.length} population statement(s) recorded verbatim: ${counts.studied} report a studied group, ${counts.notEstablished} state that safety or effectiveness was not established, ${counts.statementOnly} discuss a group without settling it.`,
        counts,
      )
    }
    return this.labelAbsence(
      'population-statements',
      [
        'use_in_specific_populations',
        'pregnancy',
        'pediatric_use',
        'geriatric_use',
        'nursing_mothers',
      ],
      false,
      ' Supplement-database ingredient records carry no population statements.',
    )
  }

  adverseReactions(): SectionAssessment {
    const hit = this.hit('commonAdverseReactions')
    if (hit) {
      const value = hit.value as { eventsAsRecorded?: string[] }
      return this.recorded(
        'adverse-reactions',
        hit,
        'EXACT_SOURCE_BACKED',
        `The label's own most-common-reactions sentence is recorded with ${value.eventsAsRecorded?.length ?? 0} listed event(s); per-event frequencies are not parsed.`,
        { eventsListed: value.eventsAsRecorded?.length ?? 0 },
      )
    }
    return this.labelAbsence(
      'adverse-reactions',
      ['adverse_reactions'],
      false,
      ' Supplement-database ingredient records carry no adverse-reaction text.',
    )
  }

  productVariants(): SectionAssessment {
    const id: DossierSectionId = 'product-variants'
    for (const moduleKey of ['productVariants', 'productListing'] as const) {
      const hit = this.hit(moduleKey)
      if (hit) {
        const count = Array.isArray(hit.value)
          ? hit.value.length
          : ((hit.value as { productCount?: number }).productCount ?? 0)
        return this.recorded(
          id,
          hit,
          'EXACT_STRUCTURED_SOURCE_DATA',
          `${count} marketed product(s) or form(s) recorded from the ${moduleKey === 'productVariants' ? 'named label(s)' : 'National Drug Code directory'}.`,
          { products: count },
        )
      }
    }
    const supplement = this.hit('supplementMarket')
    if (supplement) {
      const count = (supplement.value as { labelCount?: number }).labelCount ?? 0
      return this.recorded(
        id,
        supplement,
        'EXACT_STRUCTURED_SOURCE_DATA',
        `${count} marketed supplement label(s) list this ingredient in the NIH Dietary Supplement Label Database.`,
        { supplementLabels: count },
      )
    }
    return {
      sectionId: id,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'LABEL_ARCHIVE_SEARCH',
      basis: `No National Drug Code listing (${this.input.archives.ndcDirectory}) and no supplement label (${this.input.archives.supplementDatabase}) names this entity as an active ingredient.`,
      sourceRefs: [],
    }
  }

  costContext(): SectionAssessment {
    const id: DossierSectionId = 'cost-context'
    const hit = this.hit('costContext')
    if (hit) {
      return this.recorded(
        id,
        hit,
        'EXACT_STRUCTURED_SOURCE_DATA',
        'Recorded from the Centers for Medicare & Medicaid Services average acquisition cost file, with the unit and payer as the file states them.',
        { entries: Array.isArray(hit.value) ? hit.value.length : 1 },
      )
    }
    if (PRICED_CLASSES.has(this.input.resolution.entityClass)) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'PRICING_FILE_SEARCH',
        basis: `No row of the average acquisition cost file dated ${this.input.archives.pricingFile} matched a product of this entity.`,
        sourceRefs: [],
      }
    }
    return {
      sectionId: id,
      state: 'NOT_APPLICABLE',
      basisKind: 'ENTITY_CLASS_RULE',
      basis:
        'The acquisition cost file covers pharmacy-dispensed drug products; this record is not one.',
      sourceRefs: [],
    }
  }

  sourceConsensus(): SectionAssessment {
    const id: DossierSectionId = 'source-consensus'
    const hit = this.hit('sourceConsensus')
    if (hit) {
      const fields = (hit.value as { fields?: Array<{ comparisonState?: string }> }).fields ?? []
      const counts = {
        agree: fields.filter((f) => f.comparisonState === 'agree').length,
        differ: fields.filter((f) => f.comparisonState === 'differ').length,
        notComparable: fields.filter((f) => f.comparisonState === 'not_comparable').length,
        insufficientContext: fields.filter((f) => f.comparisonState === 'insufficient_context')
          .length,
      }
      return this.recorded(
        id,
        hit,
        counts.differ > 0 ? 'SOURCE_CONFLICT' : 'EXACT_SOURCE_BACKED',
        `${fields.length} field(s) compared across independent labels: ${counts.agree} agree, ${counts.differ} differ, ${counts.notComparable} are not comparable, ${counts.insufficientContext} lack context.`,
        counts,
      )
    }
    const single = this.labels.filter((label) => label.declared === 1)
    if (single.length >= 2) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'LABEL_ARCHIVE_SEARCH',
        basis: `${single.length} labels about this entity alone were read; no comparable numeric readings were recorded from more than one of them.`,
        sourceRefs: labelRefs(single),
        counts: { singleSubstanceLabels: single.length },
      }
    }
    return {
      sectionId: id,
      state: 'NOT_APPLICABLE',
      basisKind: 'LABEL_ARCHIVE_SEARCH',
      basis: `Fewer than two independent source documents about this entity alone exist in the read archives (${single.length} found), so cross-source agreement cannot be assessed.`,
      sourceRefs: labelRefs(single),
      counts: { singleSubstanceLabels: single.length },
    }
  }

  biologicalIdentity(): SectionAssessment {
    const id: DossierSectionId = 'biological-identity'
    const hit = this.hit('biologicalIdentity')
    if (hit) {
      return this.recorded(
        id,
        hit,
        'EXACT_STRUCTURED_SOURCE_DATA',
        'Scientific name and lineage recorded from the NCBI Taxonomy record the name resolved to.',
      )
    }
    const material = this.hit('sourceMaterial')?.value as
      { substanceClassAsRecorded?: string } | undefined
    const organismLike = material?.substanceClassAsRecorded === 'structurallyDiverse'
    if (organismLike) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'TAXONOMY_RECORD',
        basis: `The substance registry classes this record as structurally diverse (organism- or mixture-derived), but its name did not resolve to exactly one NCBI Taxonomy record when the taxonomy registry was built (${this.input.archives.taxonomy}). Ambiguous names are refused rather than guessed.`,
        sourceRefs: [],
      }
    }
    return {
      sectionId: id,
      state: 'NOT_APPLICABLE',
      basisKind: 'ENTITY_CLASS_RULE',
      basis: 'This record is not recorded as an organism or an organism-derived preparation.',
      sourceRefs: [],
    }
  }

  supplementMarket(): SectionAssessment {
    const id: DossierSectionId = 'supplement-market'
    for (const moduleKey of ['supplementMarket', 'supplementIngredient'] as const) {
      const hit = this.hit(moduleKey)
      if (hit) {
        return this.recorded(
          id,
          hit,
          'EXACT_STRUCTURED_SOURCE_DATA',
          'Ingredient group and marketed-label counts recorded from the NIH Dietary Supplement Label Database.',
        )
      }
    }
    return {
      sectionId: id,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'SUPPLEMENT_DATABASE_RECORD',
      basis: `No ingredient group in the NIH Dietary Supplement Label Database (${this.input.archives.supplementDatabase}) matched this name.`,
      sourceRefs: [],
    }
  }

  private registryEnvelope(): RegistryMatchEnvelope | null {
    const search = this.input.registrySearch
    if (!search || search.status !== 'SUCCEEDED') return null
    const envelope = search.matched[0]
    return envelope && typeof envelope === 'object'
      ? (envelope as RegistryMatchEnvelope)
      : { totalMatchedStudies: search.resultCount ?? 0, studies: [] }
  }

  private searchUnavailable(
    sectionId: DossierSectionId,
    search: SearchRecordInput,
    what: string,
  ): SectionAssessment {
    return {
      sectionId,
      state: 'SOURCE_UNAVAILABLE',
      basisKind: 'SOURCE_FETCH_HISTORY',
      basis: `The ${what} could not be completed: ${search.error ?? 'no error recorded'} (${search.status.toLowerCase()} on ${search.requestedAt.slice(0, 10)}). The failed attempt is recorded; nothing was inferred from it.`,
      sourceRefs: [
        { kind: 'SEARCH', identifier: search.sourceIdentifier, retrievedAt: search.requestedAt },
      ],
    }
  }

  private searchPending(sectionId: DossierSectionId, what: string): SectionAssessment {
    return {
      sectionId,
      state: 'SEARCH_PENDING',
      basisKind: 'NOT_YET_RUN',
      basis: `The ${what} has not been run for this record yet.`,
      sourceRefs: [],
      blockedReason: `Run the ${what} and re-assess.`,
    }
  }

  trialRegistry(): SectionAssessment {
    const id: DossierSectionId = 'trial-registry'
    const search = this.input.registrySearch
    if (!search)
      return this.searchPending(id, 'exact-name pass over the ClinicalTrials.gov snapshot')
    if (search.status !== 'SUCCEEDED')
      return this.searchUnavailable(id, search, 'ClinicalTrials.gov snapshot pass')
    const envelope = this.registryEnvelope()!
    const total = envelope.totalMatchedStudies ?? search.resultCount ?? 0
    const refs: SectionSourceRef[] = [
      {
        kind: 'CLINICALTRIALS_SNAPSHOT',
        identifier: search.sourceIdentifier,
        retrievedAt: search.requestedAt,
      },
      ...(envelope.studies ?? [])
        .slice(0, MAX_REFS - 1)
        .flatMap((study) =>
          study.nctId ? [{ kind: 'CLINICALTRIALS', identifier: study.nctId }] : [],
        ),
    ]
    const legacy = this.input.drug.legacyTrials.length
    if (total > 0) {
      return {
        sectionId: id,
        state: 'EXACT_STRUCTURED_SOURCE_DATA',
        basisKind: 'CLINICALTRIALS_SNAPSHOT_EXACT_MATCH',
        basis: `${total} registration(s) in the ClinicalTrials.gov snapshot name this entity exactly as a registered intervention. Registration is a registry fact; it says nothing about results.`,
        sourceRefs: refs,
        counts: {
          matchedRegistrations: total,
          storedRegistrations: envelope.storedStudies ?? 0,
          legacyTrialPointers: legacy,
        },
      }
    }
    return {
      sectionId: id,
      state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      basisKind: 'CLINICALTRIALS_SNAPSHOT_NO_EXACT_MATCH',
      basis: `No registration in the ClinicalTrials.gov snapshot names this entity or an unambiguous alias exactly as a registered intervention. Absence from this exact-name pass is not evidence that no study exists.${legacy > 0 ? ` ${legacy} older registry pointer(s) recorded at ingest remain on the record.` : ''}`,
      sourceRefs: refs,
      counts: { matchedRegistrations: 0, legacyTrialPointers: legacy },
    }
  }

  trialResults(): SectionAssessment {
    const id: DossierSectionId = 'trial-results'
    const mainStudy = this.hit('pivotalResults')
    if (mainStudy) {
      return this.recorded(
        id,
        mainStudy,
        'EXACT_SOURCE_BACKED',
        `${Array.isArray(mainStudy.value) ? mainStudy.value.length : 1} main-study result(s) recorded with the exact sentence each figure was read from.`,
      )
    }
    const search = this.input.registrySearch
    if (!search)
      return this.searchPending(id, 'exact-name pass over the ClinicalTrials.gov snapshot')
    if (search.status !== 'SUCCEEDED')
      return this.searchUnavailable(id, search, 'ClinicalTrials.gov snapshot pass')
    const envelope = this.registryEnvelope()!
    const total = envelope.totalMatchedStudies ?? search.resultCount ?? 0
    const posted =
      envelope.withPostedResults ?? (envelope.studies ?? []).filter((s) => s.hasResults).length
    const postedRefs = (envelope.studies ?? [])
      .filter((s) => s.hasResults && s.nctId)
      .slice(0, MAX_REFS)
      .map((s) => ({
        kind: 'CLINICALTRIALS',
        identifier: s.nctId!,
        retrievedAt: s.resultsFirstPostDate ?? undefined,
      }))
    if (total === 0) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'CLINICALTRIALS_SNAPSHOT_NO_EXACT_MATCH',
        basis:
          'No exactly matching registration exists in the snapshot, so no posted result can be pointed to.',
        sourceRefs: [
          {
            kind: 'CLINICALTRIALS_SNAPSHOT',
            identifier: search.sourceIdentifier,
            retrievedAt: search.requestedAt,
          },
        ],
        counts: { matchedRegistrations: 0, withPostedResults: 0 },
      }
    }
    if (posted === 0) {
      return {
        sectionId: id,
        state: 'RESULTS_NOT_POSTED',
        basisKind: 'CLINICALTRIALS_SNAPSHOT_EXACT_MATCH',
        basis: `None of the ${total} exactly matching registration(s) reports posted results in the snapshot. Unposted results are not a negative finding.`,
        sourceRefs: [
          {
            kind: 'CLINICALTRIALS_SNAPSHOT',
            identifier: search.sourceIdentifier,
            retrievedAt: search.requestedAt,
          },
        ],
        counts: { matchedRegistrations: total, withPostedResults: 0 },
      }
    }
    return {
      sectionId: id,
      state: 'EXACT_STRUCTURED_SOURCE_DATA',
      basisKind: 'CLINICALTRIALS_SNAPSHOT_EXACT_MATCH',
      basis: `${posted} of ${total} exactly matching registration(s) report posted results at the registry. RNAWiki records the posted-results flag only; the results themselves have not been read into this record.`,
      sourceRefs: postedRefs,
      counts: { matchedRegistrations: total, withPostedResults: posted },
      humanReadSuggested: true,
    }
  }

  trialEligibility(): SectionAssessment {
    const id: DossierSectionId = 'trial-eligibility'
    const applicability = this.hit('applicability')
    if (applicability) {
      return this.recorded(
        id,
        applicability,
        'EXACT_SOURCE_BACKED',
        'Main-study eligibility recorded with the exact source sentence.',
      )
    }
    const search = this.input.registrySearch
    if (!search)
      return this.searchPending(id, 'exact-name pass over the ClinicalTrials.gov snapshot')
    if (search.status !== 'SUCCEEDED')
      return this.searchUnavailable(id, search, 'ClinicalTrials.gov snapshot pass')
    const envelope = this.registryEnvelope()!
    const studies = envelope.studies ?? []
    const total = envelope.totalMatchedStudies ?? search.resultCount ?? 0
    if (total === 0) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'CLINICALTRIALS_SNAPSHOT_NO_EXACT_MATCH',
        basis:
          'No exactly matching registration exists in the snapshot, so no enrolment criteria can be pointed to.',
        sourceRefs: [
          {
            kind: 'CLINICALTRIALS_SNAPSHOT',
            identifier: search.sourceIdentifier,
            retrievedAt: search.requestedAt,
          },
        ],
        counts: { matchedRegistrations: 0 },
      }
    }
    const withEligibility = studies.filter(
      (s) =>
        s.eligibility &&
        (s.eligibility.sex || s.eligibility.minimumAge || s.eligibility.stdAges?.length),
    )
    return {
      sectionId: id,
      state: 'EXACT_STRUCTURED_SOURCE_DATA',
      basisKind: 'CLINICALTRIALS_SNAPSHOT_EXACT_MATCH',
      basis: `Structured registry eligibility (sex, age range, standard age groups, healthy volunteers) is recorded for ${withEligibility.length} of ${Math.min(total, studies.length)} stored matching registration(s). These describe who a study set out to enrol, not who benefited.`,
      sourceRefs: withEligibility
        .slice(0, MAX_REFS)
        .flatMap((s) => (s.nctId ? [{ kind: 'CLINICALTRIALS', identifier: s.nctId }] : [])),
      counts: { matchedRegistrations: total, withStructuredEligibility: withEligibility.length },
    }
  }

  literatureSearch(): SectionAssessment {
    const id: DossierSectionId = 'literature-search'
    const search = this.input.literatureSearch
    if (!search) return this.searchPending(id, 'PubMed clinical-trial search')
    if (search.status !== 'SUCCEEDED')
      return this.searchUnavailable(id, search, 'PubMed clinical-trial search')
    const count = search.resultCount ?? 0
    const ref: SectionSourceRef = {
      kind: 'PUBMED_SEARCH',
      identifier: search.sourceIdentifier,
      retrievedAt: search.requestedAt,
    }
    if (count === 0) {
      return {
        sectionId: id,
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'PUBMED_SEARCH_RECORD',
        basis: `A PubMed search for the recorded name as an exact phrase in titles and abstracts, limited to the clinical-trial publication type, returned no record on ${search.requestedAt.slice(0, 10)}.`,
        sourceRefs: [ref],
        counts: { pubmedClinicalTrialRecords: 0 },
      }
    }
    return {
      sectionId: id,
      state: 'EXACT_STRUCTURED_SOURCE_DATA',
      basisKind: 'PUBMED_SEARCH_RECORD',
      basis: `A PubMed search for the recorded name as an exact phrase in titles and abstracts, limited to the clinical-trial publication type, returned ${count} record(s) on ${search.requestedAt.slice(0, 10)}. The count is a search fact; the records were not read and are not attributed to this entity.`,
      sourceRefs: [ref],
      counts: { pubmedClinicalTrialRecords: count },
    }
  }

  reviewedConclusion(): SectionAssessment {
    const id: DossierSectionId = 'reviewed-conclusion'
    const { total, published } = this.input.programmes
    if (published > 0) {
      return {
        sectionId: id,
        state: 'REVIEWED_INTERPRETATION',
        basisKind: 'PROGRAMME_PUBLICATION',
        basis: `${published} development programme(s) carry a published, independently reviewed conclusion for one defined use.`,
        sourceRefs: [],
        counts: { programmes: total, published },
      }
    }
    if (total > 0) {
      return {
        sectionId: id,
        state: 'BLOCKED_HUMAN_REVIEW',
        basisKind: 'PROGRAMME_PUBLICATION',
        basis: `${total} development programme(s) are defined but none has a published reviewed conclusion.`,
        sourceRefs: [],
        counts: { programmes: total, published: 0 },
        blockedReason:
          'Qualified reviewers must review and publish a programme conclusion; software cannot author one.',
      }
    }
    return {
      sectionId: id,
      state: 'NOT_APPLICABLE',
      basisKind: 'NO_PROGRAMME_DEFINED',
      basis:
        'RNAWiki conclusions belong to one defined development programme. No programme has been defined for this record, so there is no use for which a conclusion could be reviewed.',
      sourceRefs: [],
      counts: { programmes: 0, published: 0 },
    }
  }

  assess(): DossierCompletionAssessment {
    const sections: SectionAssessment[] = [
      this.identity(),
      this.regulatoryStatus(),
      this.recordedUses(),
      this.substanceSection(
        'mechanism',
        'mechanism',
        ['mechanism_of_action', 'clinical_pharmacology'],
        (value) => {
          const record = value as { statement?: unknown; targets?: unknown[] }
          return {
            detail:
              'Mechanism statement recorded verbatim from the named label, with every named target present in the excerpt.',
            counts: { targets: Array.isArray(record.targets) ? record.targets.length : 0 },
          }
        },
      ),
      this.pharmacokinetics(),
      this.molecularIdentity(),
      this.safetyStatements(),
      this.populationStatements(),
      this.adverseReactions(),
      this.substanceSection(
        'interaction-signals',
        'interactionSignals',
        ['clinical_pharmacology', 'pharmacokinetics'],
        (value) => ({
          detail: `${Array.isArray(value) ? value.length : 0} enzyme or transporter signal(s) recorded from descriptive label sections only; the regulated interactions section is never read.`,
          counts: { signals: Array.isArray(value) ? value.length : 0 },
        }),
      ),
      this.productVariants(),
      this.costContext(),
      this.sourceConsensus(),
      this.biologicalIdentity(),
      this.supplementMarket(),
      this.trialRegistry(),
      this.trialResults(),
      this.trialEligibility(),
      this.literatureSearch(),
      this.reviewedConclusion(),
    ]
    const ordered = DOSSIER_SECTION_IDS.map((id) => {
      const section = sections.find((candidate) => candidate.sectionId === id)
      if (!section) throw new Error(`section ${id} was not assessed`)
      return section
    })
    const nonTerminal = ordered
      .filter((section) => !isTerminalSectionState(section.state))
      .map((s) => s.sectionId)
    const humanRead = ordered
      .filter((section) => section.humanReadSuggested)
      .map((s) => s.sectionId)
    return {
      drugId: this.input.drug.id,
      canonicalSlug: this.input.drug.slug,
      entityClass: this.input.resolution.entityClass,
      resolverVersion: DOSSIER_COMPLETION_RESOLVER_VERSION,
      inputDigest: completionInputDigest(this.input),
      status: nonTerminal.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
      sections: ordered,
      applicableSectionCount: ordered.length,
      terminalSectionCount: ordered.length - nonTerminal.length,
      nonTerminalSectionIds: nonTerminal,
      humanReadSuggestedSectionIds: humanRead,
    }
  }
}

export function assessDossierCompletion(input: CompletionInput): DossierCompletionAssessment {
  return new Resolver(input).assess()
}

export type { SectionBasisKind }
