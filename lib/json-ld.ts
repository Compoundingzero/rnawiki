// Structured data for public RNAWiki pages. The JSON is inserted as raw script text, so literal
// HTML delimiters must be escaped before the browser parses it. Keep raw JSON-LD insertion
// confined to `serialiseJsonLd`; a bare `JSON.stringify` would allow stored text containing
// `</script>` to end the script element early.

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { ProgrammeSummaryFieldPath } from '@/lib/evidence/types'
import { resolveLegacyPublicContentDate } from '@/lib/seo/indexability'
import { dossierCanonicalRecordSummary } from '@/lib/seo/metadata'
import type { DrugDossier, DrugModality } from '@/lib/types'

const SCHEMA_CONTEXT = 'https://schema.org' as const
const SITE_NAME = 'RNAWiki'
const SITE_DESCRIPTION =
  'Plain-language medicine records that show what studies measured, which sources support each conclusion, and what remains unknown.'

/** Botanicals and supplement ingredients use schema.org's `DietarySupplement`. */
export type DrugJsonLdType = 'Drug' | 'DietarySupplement'

export function jsonLdTypeForModality(modality: DrugModality): DrugJsonLdType {
  return modality === 'Nutraceutical / Botanical' ? 'DietarySupplement' : 'Drug'
}

export interface JsonLdReference {
  '@id': string
}

export interface PropertyValueJsonLd {
  '@type': 'PropertyValue'
  propertyID: string
  value: string
}

export interface OrganizationJsonLd {
  '@type': 'Organization'
  '@id': string
  name: string
  url: string
}

export interface WebSiteJsonLd {
  '@type': 'WebSite'
  '@id': string
  url: string
  name: string
  description: string
  inLanguage: 'en'
  publisher: JsonLdReference
}

export interface PersonJsonLd {
  '@type': 'Person'
  '@id': string
  name: string
  url?: string
  alternateName?: string
}

export interface CreativeWorkJsonLd {
  '@type': 'CreativeWork'
  '@id': string
  name: string
  url?: string
  identifier?: Array<string | PropertyValueJsonLd>
}

export interface ListItemJsonLd {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export interface BreadcrumbListJsonLd {
  '@type': 'BreadcrumbList'
  '@id': string
  itemListElement: ListItemJsonLd[]
}

/** Properties supported by recorded medicine data. Optional fields are omitted when empty. */
export interface DrugJsonLd {
  '@context': typeof SCHEMA_CONTEXT
  '@type': DrugJsonLdType
  name: string
  url: string
  alternateName?: string
  description?: string
  activeIngredient?: string
  mechanismOfAction?: string
}

export interface MedicineEntityJsonLd extends Omit<DrugJsonLd, '@context'> {
  '@id': string
  mainEntityOfPage: JsonLdReference
  /** Recorded external registry identifiers only — never looked up, resolved or inferred. */
  identifier?: PropertyValueJsonLd[]
  sameAs?: string[]
}

export interface DossierPageJsonLd {
  '@type': ['MedicalWebPage', 'WebPage']
  '@id': string
  url: string
  name: string
  description?: string
  inLanguage: 'en'
  isPartOf: JsonLdReference
  publisher: JsonLdReference
  mainEntity: JsonLdReference
  about: JsonLdReference
  breadcrumb: JsonLdReference
  author?: JsonLdReference
  citation: JsonLdReference[]
  datePublished?: string
  dateModified: string
  lastReviewed?: string
}

export interface ProfilePageJsonLd {
  '@type': 'ProfilePage'
  '@id': string
  url: string
  name: string
  inLanguage: 'en'
  isPartOf: JsonLdReference
  publisher: JsonLdReference
  mainEntity: JsonLdReference
}

export type SiteJsonLdNode = OrganizationJsonLd | WebSiteJsonLd
export type DossierJsonLdNode =
  | SiteJsonLdNode
  | DossierPageJsonLd
  | MedicineEntityJsonLd
  | BreadcrumbListJsonLd
  | PersonJsonLd
  | CreativeWorkJsonLd
export type ProfileJsonLdNode = SiteJsonLdNode | ProfilePageJsonLd | PersonJsonLd

/** A corpus record states its identity, its recorded identifiers and its place in the site. */
export interface CorpusMedicineJsonLd {
  '@type': 'Drug' | 'MedicalEntity'
  '@id': string
  name: string
  url: string
  alternateName?: string[]
  description?: string
  /** Recorded registry identifiers only — the same rows the page shows under "The exact record". */
  identifier?: PropertyValueJsonLd[]
  sameAs?: string[]
}

export type CorpusJsonLdNode = SiteJsonLdNode | CorpusMedicineJsonLd | BreadcrumbListJsonLd

export interface JsonLdGraph<Node> {
  '@context': typeof SCHEMA_CONTEXT
  '@graph': Node[]
}

export interface SiteJsonLdOptions {
  /** Absolute public site root, normally `https://rnawiki.com`. */
  siteUrl: string
}

export interface DossierJsonLdOptions extends SiteJsonLdOptions {
  /** Absolute canonical URL for this medicine/programme answer. */
  url: string
  /** Must come from the shared public index-eligibility decision. */
  eligible: boolean
}

/** The deliberately small public identity surface rendered on `/u/[handle]`. */
export interface ProfileJsonLdInput {
  handle: string
  name: string
  /** Account-supplied only. It remains visible as such on the profile but is not identity schema. */
  orcid?: string
}

export interface ProfileJsonLdOptions extends SiteJsonLdOptions {
  /** Absolute canonical contributor profile URL. */
  url: string
}

/** Trimmed text, or undefined when there is nothing to say. */
function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : undefined
}

function httpUrl(value: string | null | undefined): string | undefined {
  const candidate = text(value)
  if (!candidate) return undefined

  try {
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function requiredHttpUrl(value: string, label: string): string {
  const url = httpUrl(value)
  if (!url) throw new TypeError(`${label} must be an absolute HTTP(S) URL.`)
  const withoutFragment = new URL(url)
  withoutFragment.hash = ''
  return withoutFragment.toString()
}

function publicSiteRoot(value: string): string {
  const url = new URL(requiredHttpUrl(value, 'siteUrl'))
  url.pathname = '/'
  url.search = ''
  url.hash = ''
  return url.toString()
}

function fragmentUrl(url: string, fragment: string): string {
  const parsed = new URL(url)
  parsed.hash = fragment
  return parsed.toString()
}

function schemaDate(value: string | null | undefined): string | undefined {
  const candidate = text(value)
  if (!candidate || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(candidate)) return undefined
  const parsed = new Date(candidate)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (candidate.length === 10 && parsed.toISOString().slice(0, 10) !== candidate) return undefined
  return candidate
}

function latestSchemaDate(values: Array<string | null | undefined>): string | undefined {
  return values
    .flatMap((value) => schemaDate(value) ?? [])
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]
}

type ClaimLikeSummaryFieldPath = Extract<
  ProgrammeSummaryFieldPath,
  'summary.plainMechanism' | 'summary.bestSupportedFinding'
>

/**
 * A claim-like schema field is only safe when its exact summary dependency closes over the
 * sources that this graph can emit. This deliberately validates the full field -> claim -> source
 * chain instead of treating the dossier-wide source list as support for every sentence.
 */
function hasExactEmittedSummaryEvidence(
  dossier: MedicineDossierViewModel,
  fieldPath: ClaimLikeSummaryFieldPath,
): boolean {
  const evidence = dossier.summaryEvidence?.[fieldPath]
  if (!evidence || evidence.fieldPath !== fieldPath) return false

  const claimIds = evidence.claimIds.flatMap((claimId) => text(claimId) ?? [])
  const sourceIds = evidence.sourceIds.flatMap((sourceId) => text(sourceId) ?? [])
  if (
    claimIds.length === 0 ||
    claimIds.length !== evidence.claimIds.length ||
    sourceIds.length === 0 ||
    sourceIds.length !== evidence.sourceIds.length ||
    evidence.sourceClaimBindings.length === 0
  ) {
    return false
  }

  const expectedClaimIds = new Set(claimIds)
  const expectedSourceIds = new Set(sourceIds)
  const emittedSourceIds = new Set(
    dossier.sources.flatMap((source) => {
      const sourceId = text(source.id)
      return sourceId && text(source.label) ? [sourceId] : []
    }),
  )
  if ([...expectedSourceIds].some((sourceId) => !emittedSourceIds.has(sourceId))) return false

  const boundClaimIds = new Set<string>()
  const boundSourceIds = new Set<string>()
  for (const binding of evidence.sourceClaimBindings) {
    const claimId = text(binding.claimId)
    const sourceId = text(binding.sourceId)
    if (
      !claimId ||
      !sourceId ||
      !text(binding.statement) ||
      !expectedClaimIds.has(claimId) ||
      !expectedSourceIds.has(sourceId) ||
      !emittedSourceIds.has(sourceId)
    ) {
      return false
    }
    boundClaimIds.add(claimId)
    boundSourceIds.add(sourceId)
  }

  return (
    [...expectedClaimIds].every((claimId) => boundClaimIds.has(claimId)) &&
    [...expectedSourceIds].every((sourceId) => boundSourceIds.has(sourceId))
  )
}

function exactPublishedFinding(dossier: MedicineDossierViewModel): string | undefined {
  if (
    dossier.bindingState !== 'published_programme' ||
    dossier.readerSummary.whatStudiesFoundSourceFieldPath !== 'summary.bestSupportedFinding' ||
    !hasExactEmittedSummaryEvidence(dossier, 'summary.bestSupportedFinding')
  ) {
    return undefined
  }
  return text(dossier.readerSummary.whatStudiesFound)
}

function exactPublishedMechanism(dossier: MedicineDossierViewModel): string | undefined {
  if (
    dossier.bindingState !== 'published_programme' ||
    !hasExactEmittedSummaryEvidence(dossier, 'summary.plainMechanism')
  ) {
    return undefined
  }
  return text(dossier.mechanismSummary.change)
}

/**
 * True only when the recorded source label itself names this medicine — ignoring letter case and
 * a trailing parenthetical such as "(THC)" — on a non-letter boundary. This keeps a recorded
 * constituent CID from being promoted into an identifier for the whole medicine: a
 * plant-preparation record whose structure source cites one molecule ("Cannabis (Plant
 * Preparation)" citing dronabinol's CID) stays unlinked, and a substring inside a longer
 * molecule name ("Morphine" inside "hydromorphone") does not count as a match.
 */
function labelNamesMedicine(label: string, medicineName: string): boolean {
  const haystack = label.toLowerCase()
  const full = medicineName.trim().toLowerCase()
  const withoutTrailingParenthetical = full.replace(/\s*\(.*$/, '').trim()
  const candidates = [...new Set([full, withoutTrailingParenthetical])].filter(
    (candidate) => candidate.length >= 3,
  )
  const isLetter = (character: string | undefined) =>
    character !== undefined && /[a-z]/.test(character)
  return candidates.some((candidate) => {
    for (
      let start = haystack.indexOf(candidate);
      start !== -1;
      start = haystack.indexOf(candidate, start + 1)
    ) {
      if (!isLetter(haystack[start - 1]) && !isLetter(haystack[start + candidate.length])) {
        return true
      }
    }
    return false
  })
}

/**
 * The exact recorded molecular identity source, accepted only when it is already a PubChem
 * compound URL and its recorded label names this medicine. The CID is extracted mechanically
 * from the recorded URL — nothing is looked up, resolved or inferred — and every other recorded
 * shape (a DOI, a paper, another registry, a URL with extra path/query, a constituent recorded
 * under a different name) is omitted rather than approximated.
 */
function recordedPubChemCompound(
  source: { label?: string; identifier?: string } | undefined,
  medicineName: string | null | undefined,
): { cid: string; url: string } | undefined {
  const identifier = text(source?.identifier)
  const label = text(source?.label)
  const name = text(medicineName)
  if (!identifier || !label || !name) return undefined

  let parsed: URL
  try {
    parsed = new URL(identifier)
  } catch {
    return undefined
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'pubchem.ncbi.nlm.nih.gov' ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.port !== '' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    return undefined
  }
  const cid = /^\/compound\/([1-9][0-9]{0,15})\/?$/.exec(parsed.pathname)?.[1]
  if (!cid || !labelNamesMedicine(label, name)) return undefined
  return { cid, url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` }
}

function hasExactLegacyAnswerBinding(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
): boolean {
  const binding = dossier.readerSummary.authoredEvidenceBinding
  return Boolean(
    dossier.bindingState === 'legacy_record' &&
    drug.dossierDepth === 'flagship' &&
    binding?.kind === 'legacy_answer_and_evidence_fingerprint' &&
    binding.version === 'legacy-ten-second-answer/v2' &&
    /^sha256:[a-f0-9]{64}$/.test(binding.fingerprint) &&
    text(dossier.readerSummary.usedFor) &&
    text(dossier.readerSummary.whatStudiesFound) &&
    text(dossier.readerSummary.biggestLimit),
  )
}

function exactLegacyFinding(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
): string | undefined {
  return hasExactLegacyAnswerBinding(drug, dossier)
    ? text(dossier.readerSummary.whatStudiesFound)
    : undefined
}

function siteNodes(siteUrl: string): {
  root: string
  organization: OrganizationJsonLd
  website: WebSiteJsonLd
} {
  const root = publicSiteRoot(siteUrl)
  const organizationId = fragmentUrl(root, 'organization')
  const websiteId = fragmentUrl(root, 'website')
  return {
    root,
    organization: {
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE_NAME,
      url: root,
    },
    website: {
      '@type': 'WebSite',
      '@id': websiteId,
      url: root,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': organizationId },
    },
  }
}

/** Connected publisher and website identity for the site root. */
export function siteJsonLdGraph({ siteUrl }: SiteJsonLdOptions): JsonLdGraph<SiteJsonLdNode> {
  const site = siteNodes(siteUrl)
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [site.organization, site.website],
  }
}

export function drugJsonLd(
  drug: DrugDossier,
  url: string,
  dossier?: MedicineDossierViewModel,
): DrugJsonLd {
  const jsonLd: DrugJsonLd = {
    '@context': SCHEMA_CONTEXT,
    '@type': jsonLdTypeForModality(drug.modality),
    name: drug.name,
    url,
  }

  // `name` is the active moiety; `tradeName` is the brand name.
  const tradeName = text(drug.tradeName)
  if (tradeName) jsonLd.alternateName = tradeName

  // Only a reviewed programme with exact field-level provenance may supply a medical conclusion.
  // Legacy medicine-wide prose is not exposed as though it had a reviewed publication boundary.
  const description =
    dossier?.bindingState === 'published_programme'
      ? exactPublishedFinding(dossier)
      : dossier?.bindingState === 'programme_unpublished'
        ? text(
            `${drug.name}: RNAWiki has not published a reviewed conclusion for ${dossier.selectedProgrammeLabel} yet.`,
          )
        : dossier
          ? exactLegacyFinding(drug, dossier)
          : undefined
  if (description) jsonLd.description = description

  // A target gene or protein is not an active ingredient.
  const activeIngredient = text(drug.name)
  if (activeIngredient) jsonLd.activeIngredient = activeIngredient

  const mechanism =
    dossier?.bindingState === 'published_programme' ? exactPublishedMechanism(dossier) : undefined
  if (mechanism) jsonLd.mechanismOfAction = mechanism

  return jsonLd
}

function dossierAuthorPersonNode(
  dossier: MedicineDossierViewModel,
  siteRoot: string,
): PersonJsonLd | null {
  const handle = text(dossier.conclusion?.authorHandle)
  if (!handle) return null
  const profileUrl = new URL(`/u/${encodeURIComponent(handle)}`, siteRoot).toString()
  return {
    '@type': 'Person',
    '@id': fragmentUrl(profileUrl, 'person'),
    name: `@${handle}`,
    url: profileUrl,
  }
}

function sourceCreativeWorks(
  dossier: MedicineDossierViewModel,
  pageUrl: string,
): Array<{ node: CreativeWorkJsonLd; reference: JsonLdReference }> {
  return dossier.sources.flatMap((source, index) => {
    const name = text(source.label)
    if (!name) return []
    // The dossier page renders `<li id="source-{id}">` with the exact stored snapshot id
    // (components/MedicineDossierV2.tsx), so this fragment must use the same characters.
    // Percent-encoding here broke parity for legacy ids such as `doi:10.1056/...`; the URL hash
    // setter still escapes the few characters URL syntax cannot carry raw.
    const id = fragmentUrl(pageUrl, `source-${text(source.id) ?? String(index + 1)}`)
    const externalUrl = httpUrl(source.href) ?? httpUrl(source.canonicalLocator)
    const identifiers: Array<string | PropertyValueJsonLd> = []
    const identifier = text(source.identifier)
    const snapshotHash = text(source.snapshotHash)
    if (identifier) identifiers.push(identifier)
    if (snapshotHash) {
      identifiers.push({ '@type': 'PropertyValue', propertyID: 'sha256', value: snapshotHash })
    }

    const node: CreativeWorkJsonLd = {
      '@type': 'CreativeWork',
      '@id': id,
      name,
    }
    if (externalUrl) node.url = externalUrl
    if (identifiers.length > 0) node.identifier = identifiers
    return [{ node, reference: { '@id': id } }]
  })
}

function legacySourceCreativeWorks(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  pageUrl: string,
): Array<{ node: CreativeWorkJsonLd; reference: JsonLdReference }> {
  const sources = sourceCreativeWorks(dossier, pageUrl)
  const names = new Set(sources.map(({ node }) => node.name.trim().toLowerCase()))
  for (const [index, rawLabel] of (drug.sourceProvenance ?? []).entries()) {
    const name = text(rawLabel)
    if (!name || names.has(name.toLowerCase())) continue
    names.add(name.toLowerCase())
    const id = fragmentUrl(pageUrl, `legacy-provenance-${index + 1}`)
    sources.push({
      node: { '@type': 'CreativeWork', '@id': id, name },
      reference: { '@id': id },
    })
  }
  return sources
}

function legacyDossierJsonLdGraph(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  siteUrl: string,
  url: string,
): JsonLdGraph<DossierJsonLdNode> | null {
  if (!hasExactLegacyAnswerBinding(drug, dossier)) return null

  const pageUrl = requiredHttpUrl(url, 'url')
  const publicContentDate = resolveLegacyPublicContentDate(drug.lastEditedAt, drug.recentAuditDate)
  const description = exactLegacyFinding(drug, dossier)
  const medicineName = text(drug.name)
  const usedFor = text(dossier.readerSummary.usedFor)
  const limitation = text(dossier.readerSummary.biggestLimit)
  const citations = legacySourceCreativeWorks(drug, dossier, pageUrl)
  if (!publicContentDate || !description || !medicineName || !usedFor || !limitation) return null
  if (citations.length === 0) return null

  const site = siteNodes(siteUrl)
  const pageId = fragmentUrl(pageUrl, 'webpage')
  const medicineId = fragmentUrl(pageUrl, 'medicine')
  const breadcrumbId = fragmentUrl(pageUrl, 'breadcrumb')
  const legacyEntity = drugJsonLd(drug, pageUrl, dossier)
  const medicine: MedicineEntityJsonLd = {
    '@type': legacyEntity['@type'],
    '@id': medicineId,
    name: legacyEntity.name,
    url: legacyEntity.url,
    mainEntityOfPage: { '@id': pageId },
  }
  if (legacyEntity.alternateName) medicine.alternateName = legacyEntity.alternateName
  if (legacyEntity.description) medicine.description = legacyEntity.description
  if (legacyEntity.activeIngredient) medicine.activeIngredient = legacyEntity.activeIngredient

  // Recorded registry identifiers from the background layer take precedence: they were fetched
  // from the registry itself at authoring time and are rendered visibly in "Registry identifiers".
  // The structure-source URL extraction remains the fallback for records without that layer;
  // either way the graph repeats a recorded fact shown on the page and nothing more.
  const recordedIdentifiers = drug.recordedBackground?.registryIdentifiers
  const recordedCid =
    recordedIdentifiers?.pubchemCid && /^[1-9]\d{0,15}$/.test(recordedIdentifiers.pubchemCid)
      ? recordedIdentifiers.pubchemCid
      : undefined
  const pubChem = recordedCid
    ? { cid: recordedCid, url: `https://pubchem.ncbi.nlm.nih.gov/compound/${recordedCid}` }
    : recordedPubChemCompound(dossier.medicineRecord.molecular?.source, drug.name)
  if (pubChem) {
    const identifiers: Array<{ '@type': 'PropertyValue'; propertyID: string; value: string }> = [
      { '@type': 'PropertyValue', propertyID: 'PubChem CID', value: pubChem.cid },
    ]
    if (
      recordedCid &&
      recordedIdentifiers?.unii &&
      /^[0-9A-Z]{10}$/.test(recordedIdentifiers.unii)
    ) {
      identifiers.push({
        '@type': 'PropertyValue',
        propertyID: 'FDA UNII',
        value: recordedIdentifiers.unii,
      })
    }
    if (
      recordedCid &&
      recordedIdentifiers?.casNumber &&
      /^\d{2,7}-\d{2}-\d$/.test(recordedIdentifiers.casNumber)
    ) {
      identifiers.push({
        '@type': 'PropertyValue',
        propertyID: 'CAS Registry Number',
        value: recordedIdentifiers.casNumber,
      })
    }
    medicine.identifier = identifiers
    medicine.sameAs = [pubChem.url]
  }

  const lastReviewed = resolveLegacyPublicContentDate(null, drug.recentAuditDate)?.toISOString()
  const page: DossierPageJsonLd = {
    '@type': ['MedicalWebPage', 'WebPage'],
    '@id': pageId,
    url: pageUrl,
    name: `${medicineName} medicine evidence summary`,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': site.website['@id'] },
    publisher: { '@id': site.organization['@id'] },
    mainEntity: { '@id': medicineId },
    about: { '@id': medicineId },
    breadcrumb: { '@id': breadcrumbId },
    citation: citations.map(({ reference }) => reference),
    dateModified: publicContentDate.toISOString(),
    ...(lastReviewed ? { lastReviewed } : {}),
  }
  const breadcrumb: BreadcrumbListJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: site.root },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Medicines',
        item: new URL('/browse', site.root).toString(),
      },
      { '@type': 'ListItem', position: 3, name: medicineName, item: pageUrl },
    ],
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [
      site.organization,
      site.website,
      page,
      medicine,
      breadcrumb,
      ...citations.map(({ node }) => node),
    ],
  }
}

/**
 * The graph for a canonical record that carries no reviewed answer and no provenance-bound legacy
 * answer. It states what the page is (a medicine record with an explicit per-section completeness
 * state), when its states last changed, and the recorded registry identifiers shown on the page.
 * It carries no finding, no mechanism and no citation, because the record asserts none.
 */
function canonicalRecordJsonLdGraph(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  siteUrl: string,
  url: string,
): JsonLdGraph<DossierJsonLdNode> | null {
  const assessment = drug.completionAssessment
  const resolution = drug.inventoryResolution
  if (!assessment || resolution?.resolutionStatus !== 'CANONICAL_ENTITY') return null
  const medicineName = text(drug.name)
  const dateModified = schemaDate(assessment.contentChangedAt)
  if (!medicineName || !dateModified) return null

  const pageUrl = requiredHttpUrl(url, 'url')
  const site = siteNodes(siteUrl)
  const pageId = fragmentUrl(pageUrl, 'webpage')
  const medicineId = fragmentUrl(pageUrl, 'medicine')
  const breadcrumbId = fragmentUrl(pageUrl, 'breadcrumb')
  const legacyEntity = drugJsonLd(drug, pageUrl, dossier)
  const medicine: MedicineEntityJsonLd = {
    '@type': legacyEntity['@type'],
    '@id': medicineId,
    name: legacyEntity.name,
    url: legacyEntity.url,
    mainEntityOfPage: { '@id': pageId },
  }
  if (legacyEntity.alternateName) medicine.alternateName = legacyEntity.alternateName

  const recordedIdentifiers = drug.recordedBackground?.registryIdentifiers
  const identifiers: PropertyValueJsonLd[] = []
  if (recordedIdentifiers?.pubchemCid && /^[1-9]\d{0,15}$/.test(recordedIdentifiers.pubchemCid)) {
    identifiers.push({
      '@type': 'PropertyValue',
      propertyID: 'PubChem CID',
      value: recordedIdentifiers.pubchemCid,
    })
    medicine.sameAs = [
      `https://pubchem.ncbi.nlm.nih.gov/compound/${recordedIdentifiers.pubchemCid}`,
    ]
  }
  if (recordedIdentifiers?.unii && /^[0-9A-Z]{10}$/.test(recordedIdentifiers.unii)) {
    identifiers.push({
      '@type': 'PropertyValue',
      propertyID: 'FDA UNII',
      value: recordedIdentifiers.unii,
    })
  }
  if (recordedIdentifiers?.casNumber && /^\d{2,7}-\d{2}-\d$/.test(recordedIdentifiers.casNumber)) {
    identifiers.push({
      '@type': 'PropertyValue',
      propertyID: 'CAS Registry Number',
      value: recordedIdentifiers.casNumber,
    })
  }
  if (identifiers.length > 0) medicine.identifier = identifiers

  const registry = assessment.sections.find((section) => section.id === 'trial-registry')
  const conclusion = assessment.sections.find((section) => section.id === 'reviewed-conclusion')
  const description = dossierCanonicalRecordSummary(medicineName, {
    entityClass: resolution.entityClass,
    applicableSectionCount: assessment.applicableSectionCount,
    terminalSectionCount: assessment.terminalSectionCount,
    registeredTrials:
      registry?.state === 'EXACT_STRUCTURED_SOURCE_DATA'
        ? true
        : registry?.state === 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH'
          ? false
          : null,
    reviewedConclusion: conclusion?.state === 'REVIEWED_INTERPRETATION',
  })

  const page: DossierPageJsonLd = {
    '@type': ['MedicalWebPage', 'WebPage'],
    '@id': pageId,
    url: pageUrl,
    name: `${medicineName} medicine record`,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': site.website['@id'] },
    publisher: { '@id': site.organization['@id'] },
    mainEntity: { '@id': medicineId },
    about: { '@id': medicineId },
    breadcrumb: { '@id': breadcrumbId },
    citation: [],
    dateModified,
  }
  const breadcrumb: BreadcrumbListJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: site.root },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Medicines',
        item: new URL('/browse', site.root).toString(),
      },
      { '@type': 'ListItem', position: 3, name: medicineName, item: pageUrl },
    ],
  }
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [site.organization, site.website, page, medicine, breadcrumb],
  }
}

/**
 * A connected graph for a reviewed, sourced dossier. The explicit `eligible` input is mandatory,
 * and the publication/source checks are repeated here so an accidental caller cannot emit a rich
 * medical graph for a stub or an unpublished programme.
 */
export function dossierJsonLdGraph(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  { eligible, siteUrl, url }: DossierJsonLdOptions,
): JsonLdGraph<DossierJsonLdNode> | null {
  if (!eligible) return null
  if (dossier.bindingState === 'legacy_record') {
    return (
      legacyDossierJsonLdGraph(drug, dossier, siteUrl, url) ??
      canonicalRecordJsonLdGraph(drug, dossier, siteUrl, url)
    )
  }
  if (
    dossier.bindingState !== 'published_programme' ||
    !dossier.conclusion ||
    dossier.sources.length === 0
  ) {
    return canonicalRecordJsonLdGraph(drug, dossier, siteUrl, url)
  }

  const medicineName = text(drug.name)
  const programmeLabel = text(dossier.selectedProgrammeLabel)
  const publishedAt = schemaDate(dossier.review.publishedAt)
  const reviewedAt = latestSchemaDate([
    dossier.review.reviewedAt,
    ...dossier.conclusion.reviewers.map((reviewer) => reviewer.reviewedAt),
  ])
  if (!medicineName || !programmeLabel || !publishedAt || !reviewedAt) return null

  const pageUrl = requiredHttpUrl(url, 'url')
  const site = siteNodes(siteUrl)
  const pageId = fragmentUrl(pageUrl, 'webpage')
  const medicineId = fragmentUrl(pageUrl, 'medicine')
  const breadcrumbId = fragmentUrl(pageUrl, 'breadcrumb')
  const author = dossierAuthorPersonNode(dossier, site.root)
  const citations = sourceCreativeWorks(dossier, pageUrl)
  if (citations.length === 0) return null

  const legacyEntity = drugJsonLd(drug, pageUrl, dossier)
  const medicine: MedicineEntityJsonLd = {
    '@type': legacyEntity['@type'],
    '@id': medicineId,
    name: legacyEntity.name,
    url: legacyEntity.url,
    mainEntityOfPage: { '@id': pageId },
  }
  if (legacyEntity.alternateName) medicine.alternateName = legacyEntity.alternateName
  if (legacyEntity.description) medicine.description = legacyEntity.description
  if (legacyEntity.activeIngredient) medicine.activeIngredient = legacyEntity.activeIngredient
  if (legacyEntity.mechanismOfAction) {
    medicine.mechanismOfAction = legacyEntity.mechanismOfAction
  }
  const description = exactPublishedFinding(dossier)

  const page: DossierPageJsonLd = {
    '@type': ['MedicalWebPage', 'WebPage'],
    '@id': pageId,
    url: pageUrl,
    name: `${medicineName} — ${programmeLabel}`,
    ...(description ? { description } : {}),
    inLanguage: 'en',
    isPartOf: { '@id': site.website['@id'] },
    publisher: { '@id': site.organization['@id'] },
    mainEntity: { '@id': medicineId },
    about: { '@id': medicineId },
    breadcrumb: { '@id': breadcrumbId },
    ...(author ? { author: { '@id': author['@id'] } } : {}),
    citation: citations.map(({ reference }) => reference),
    datePublished: publishedAt,
    dateModified: publishedAt,
    lastReviewed: reviewedAt,
  }
  const breadcrumb: BreadcrumbListJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: site.root },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Medicines',
        item: new URL('/browse', site.root).toString(),
      },
      { '@type': 'ListItem', position: 3, name: medicineName, item: pageUrl },
    ],
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [
      site.organization,
      site.website,
      page,
      medicine,
      breadcrumb,
      ...(author ? [author] : []),
      ...citations.map(({ node }) => node),
    ],
  }
}

/** Connected ProfilePage + Person graph using only fields already visible on the public profile. */
export function profileJsonLdGraph(
  profile: ProfileJsonLdInput,
  { siteUrl, url }: ProfileJsonLdOptions,
): JsonLdGraph<ProfileJsonLdNode> {
  const pageUrl = requiredHttpUrl(url, 'url')
  const site = siteNodes(siteUrl)
  const pageId = fragmentUrl(pageUrl, 'profile-page')
  const personId = fragmentUrl(pageUrl, 'person')
  const handle = text(profile.handle)
  const name = text(profile.name)
  if (!handle || !name) throw new TypeError('A public profile needs a name and handle.')

  const person: PersonJsonLd = {
    '@type': 'Person',
    '@id': personId,
    name,
    url: pageUrl,
    alternateName: `@${handle}`,
  }
  const page: ProfilePageJsonLd = {
    '@type': 'ProfilePage',
    '@id': pageId,
    url: pageUrl,
    name: `${name} (@${handle})`,
    inLanguage: 'en',
    isPartOf: { '@id': site.website['@id'] },
    publisher: { '@id': site.organization['@id'] },
    mainEntity: { '@id': personId },
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [site.organization, site.website, page, person],
  }
}

/* ------------------------------------------------------------------ corpus records */

/**
 * Synonym kinds that name the same substance. An international, United States or trade name is an
 * alternate name for the record; a salt form, a fragment or a development code is not, so those
 * kinds stay out of the graph even though the page lists them.
 */
const CORPUS_ALTERNATE_NAME_KINDS: readonly string[] = ['inn', 'usan', 'brand']

/** Recorded registry identifiers that carry a stable, publicly meaningful property name. */
const CORPUS_IDENTIFIER_PROPERTY_IDS: Record<string, string> = {
  unii: 'FDA UNII',
  chemblId: 'ChEMBL ID',
  pubchemCid: 'PubChem CID',
  cas: 'CAS Registry Number',
}

const MAX_CORPUS_ALTERNATE_NAMES = 10

export interface CorpusJsonLdOptions extends SiteJsonLdOptions {
  /** Absolute canonical URL for this corpus record. */
  url: string
}

/**
 * The graph for a corpus record (docs/specs/dossier-template.md).
 *
 * Every value here is already on the rendered page: the recorded display name, the synonyms the
 * header lists, the identifiers "The exact record" shows, and the first paragraph of the first
 * question. Nothing is looked up, resolved or inferred, and a record the corpus does not index
 * carries no graph at all — a page a crawler is asked not to index is not given a rich description
 * of itself.
 *
 * The type is `Drug` only where the record is a medicine in a drug register (its field model is
 * CLINICAL, or a register recorded a withdrawal). Everything else — a supplement, a research
 * compound, an investigational candidate — is the honest superclass `MedicalEntity`.
 */
export function corpusDossierJsonLdGraph(
  dossier: CorpusDossier,
  { siteUrl, url }: CorpusJsonLdOptions,
): JsonLdGraph<CorpusJsonLdNode> | null {
  if (!dossier.indexable) return null
  const name = text(dossier.displayName)
  if (!name) return null

  const pageUrl = requiredHttpUrl(url, 'url')
  const site = siteNodes(siteUrl)
  const medicineId = fragmentUrl(pageUrl, 'medicine')
  const breadcrumbId = fragmentUrl(pageUrl, 'breadcrumb')

  const medicine: CorpusMedicineJsonLd = {
    '@type': dossier.model === 'CLINICAL' || dossier.withdrawn ? 'Drug' : 'MedicalEntity',
    '@id': medicineId,
    name,
    url: pageUrl,
  }

  // Kind order, not row order: a record with many trade names would otherwise fill the list with
  // them and leave its international and United States names out.
  const alternateName: string[] = []
  for (const kind of CORPUS_ALTERNATE_NAME_KINDS) {
    for (const group of dossier.synonyms) {
      if (group.kind !== kind) continue
      for (const candidate of group.names) {
        if (alternateName.length >= MAX_CORPUS_ALTERNATE_NAMES) break
        const synonym = text(candidate)
        if (!synonym || synonym.toLowerCase() === name.toLowerCase()) continue
        if (!alternateName.includes(synonym)) alternateName.push(synonym)
      }
    }
  }
  if (alternateName.length > 0) medicine.alternateName = alternateName

  // The page's own opening answer, verbatim. A record with no question block describes nothing.
  const description = text(dossier.blocks[0]?.paragraphs[0]?.text)
  if (description) medicine.description = description

  const identifier: PropertyValueJsonLd[] = []
  const sameAs: string[] = []
  for (const row of dossier.identifiers) {
    const propertyID = CORPUS_IDENTIFIER_PROPERTY_IDS[row.field]
    const value = text(row.value)
    if (!propertyID || !value) continue
    identifier.push({ '@type': 'PropertyValue', propertyID, value })
    const href = httpUrl(row.href)
    if (href && !sameAs.includes(href)) sameAs.push(href)
  }
  if (identifier.length > 0) medicine.identifier = identifier
  if (sameAs.length > 0) medicine.sameAs = sameAs

  const breadcrumb: BreadcrumbListJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: site.root },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Medicines',
        item: new URL('/browse', site.root).toString(),
      },
      { '@type': 'ListItem', position: 3, name, item: pageUrl },
    ],
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [site.organization, site.website, medicine, breadcrumb],
  }
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
