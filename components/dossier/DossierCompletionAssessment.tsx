import { ExternalLink } from 'lucide-react'

import type {
  DossierCompletionAssessmentView,
  DossierCompletionSectionView,
} from '@/lib/dossier-completion/view'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { InventoryResolutionView } from '@/lib/queries/dossier-completion'
import { resolveRecordedSourceLocator } from '@/lib/source-locator'

/**
 * What this record does and does not have a state for, section by section.
 *
 * The reader problem it answers is the one a corpus of nine thousand registry-derived records
 * creates: a page that shows four recorded modules and says nothing about the other sixteen reads
 * as a page that was abandoned halfway. It is not. Each of those sections was assessed against a
 * named archive, a dated search or a rule, and the outcome was an absence with a reason. This
 * section prints those reasons.
 *
 * Every state here is a statement about the sources RNAWiki read. None is a statement about the
 * medicine, and none is upgraded to a finding: "searched; no qualifying record found" stays a
 * search result, "registered; results not posted" stays a registry fact, and a section a person
 * could improve by reading the named source says so instead of being filled in.
 *
 * Nothing in this section names, links or counts another record. A shared registry identifier is
 * reported as a property of this record alone, because the corpus holds salt/parent pairs,
 * biosimilar families and registry errors under one identifier, and pointing from one to another
 * would assert a sameness the resolver never established.
 */

const RECORDED_STATE_CLASS = 'border-[#B8E7CB] bg-[#EDF8F2] text-[#16764A]'
const ABSENCE_STATE_CLASS = 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]'
const ATTENTION_STATE_CLASS = 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]'

/**
 * Colour groups the states; the badge text always carries the state itself, so colour is never the
 * only signal a reader has.
 */
function stateBadgeClass(section: DossierCompletionSectionView): string {
  if (!section.terminal) return ATTENTION_STATE_CLASS
  if (section.state === 'SOURCE_CONFLICT' || section.state === 'SOURCE_UNAVAILABLE') {
    return ATTENTION_STATE_CLASS
  }
  if (
    section.state === 'EXACT_SOURCE_BACKED' ||
    section.state === 'EXACT_STRUCTURED_SOURCE_DATA' ||
    section.state === 'REVIEWED_INTERPRETATION'
  ) {
    return RECORDED_STATE_CLASS
  }
  return ABSENCE_STATE_CLASS
}

/** Reader-facing names for the source kinds the resolver records. */
const SOURCE_KIND_LABELS: Record<string, string> = {
  FDA_LABEL: 'FDA label',
  FDA_LABEL_SET: 'FDA label',
  FDA_NDC: 'National Drug Code listing',
  FDA_APPLICATION: 'Drugs@FDA application',
  CLINICALTRIALS: 'Registered trial',
  CLINICALTRIALS_SNAPSHOT: 'Trial registry snapshot',
  PUBMED_SEARCH: 'PubMed search',
  SEARCH: 'Recorded search',
  INGEST_PROVENANCE: 'Ingest source',
  UNII: 'FDA substance code',
  CAS: 'CAS number',
  PUBCHEM_CID: 'PubChem compound',
  RXCUI: 'RxNorm concept',
  NCBI_TAXONOMY: 'Taxonomy record',
  DSLD_INGREDIENT_GROUP: 'Supplement ingredient group',
  DSLD: 'Supplement label database record',
  DAILYMED: 'FDA label',
  FDA_DRUGSFDA: 'Drugs@FDA application',
  FDA_UNII: 'FDA substance code',
  PUBCHEM: 'PubChem compound',
  PUBMED: 'PubMed record',
  NADAC: 'Medicare average acquisition cost file',
}

/** Turn an unmapped code into words, so no raw enum reaches the main view. */
function humanise(code: string): string {
  const words = code
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function sourceKindLabel(kind: string): string {
  return SOURCE_KIND_LABELS[kind] ?? humanise(kind)
}

/** Plain-word names for the counts the resolver records behind a state. */
const COUNT_LABELS: Record<string, string> = {
  registryIdentifiers: 'registry identifiers recorded',
  provenanceLabels: 'ingest sources recorded',
  labelsNamingEntity: 'labels name this substance',
  labelsWithReadSection: 'of those labels had the section read',
  singleSubstanceLabels: 'labels are about this substance alone',
  recordedFields: 'values recorded with the sentence they came from',
  differingFields: 'values where independent labels differ',
  boxedWarning: 'boxed warnings recorded',
  contraindications: 'contraindication statements recorded',
  studied: 'groups a label reports as studied',
  notEstablished: 'groups a label says were not established',
  statementOnly: 'groups a label discusses without settling',
  agree: 'compared values agree between labels',
  differ: 'compared values differ between labels',
  notComparable: 'compared values cannot be set side by side',
  insufficientContext: 'compared values lack the context to read them',
  matchedRegistrations: 'registry records match the recorded name exactly',
  storedRegistrations: 'registry records stored on this record',
  legacyTrialPointers: 'trial pointers carried by the older record',
  withPostedResults: 'of the matched records have posted results',
  withStructuredEligibility: 'of the matched records carry eligibility text',
  pubmedClinicalTrialRecords: 'published clinical-trial reports returned by the search',
  programmes: 'defined programmes',
  published: 'programmes with a published conclusion',
  targets: 'named targets',
  signals: 'named enzymes or transporters',
  statements: 'statements recorded word for word',
  eventsListed: 'events listed in the recorded sentence',
  products: 'marketed products or forms recorded',
  supplementLabels: 'marketed supplement labels list this ingredient',
  entries: 'price entries recorded',
}

function countLabel(key: string): string {
  return COUNT_LABELS[key] ?? humanise(key).toLowerCase()
}

/**
 * The basis kind, when the projection carries it.
 *
 * The reader-facing view deliberately drops storage codes, so this reads the field defensively
 * rather than widening the section type: the disclosure prints the kind the moment the projection
 * carries one, and prints the state code alone until then.
 */
function basisKindCode(section: DossierCompletionSectionView): string | undefined {
  const value = (section as { basisKind?: unknown }).basisKind
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** A JSON field path is a machine locator, so it never appears beside a reader-facing citation. */
function isFieldPath(value: string): boolean {
  return /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$/.test(value)
}

const RESOLUTION_STATUS_COPY: Record<InventoryResolutionView['resolutionStatus'], string> = {
  CANONICAL_ENTITY: 'This name is kept as its own record.',
  ALIAS_OF_CANONICAL_ENTITY:
    'This name is recorded as another spelling of a record kept under a different name, and readers are sent there.',
  DUPLICATE_OF_CANONICAL_ENTITY:
    'This row repeats a record kept under a different name, and readers are sent there.',
  HISTORICAL_REDIRECT: 'This address is an older one and now sends readers to the record kept.',
  INVALID_IDENTITY_GONE: 'This row never named a medicine, so no page is served for it.',
  MANUAL_IDENTITY_REVIEW_REQUIRED:
    'A person still has to settle which record this name belongs to.',
}

const IDENTITY_CONFIDENCE_COPY: Record<string, string> = {
  REGISTRY_IDENTIFIER_RECORDED: 'Identity rests on at least one recorded registry identifier.',
  NAME_ONLY: 'Identity rests on the recorded name; no registry identifier is recorded.',
  PLACEHOLDER: 'The row holds a placeholder name and identifies nothing.',
}

function identitySentence(resolution: InventoryResolutionView): string {
  const parts = [
    RESOLUTION_STATUS_COPY[resolution.resolutionStatus] ?? 'How this name resolves is recorded.',
    IDENTITY_CONFIDENCE_COPY[resolution.identityConfidence],
    resolution.identifierSharedWithOtherRecords
      ? 'A registry identifier on this record also appears on other records; the records are kept separate and are not joined here.'
      : undefined,
  ]
  return parts.filter((part): part is string => Boolean(part)).join(' ')
}

function SectionSources({ section }: { section: DossierCompletionSectionView }) {
  if (section.sourceRefs.length === 0) return null
  return (
    <ul
      className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm leading-6"
      aria-label={`Sources behind ${section.label}`}
    >
      {section.sourceRefs.map((ref) => {
        const locator = resolveRecordedSourceLocator(ref.kind, ref.identifier)
        const note = ref.label && !isFieldPath(ref.label) ? ref.label : undefined
        const text = `${sourceKindLabel(ref.kind)} ${ref.identifier}`
        return (
          <li key={`${ref.kind}:${ref.identifier}`} className="min-w-0 max-w-full break-words">
            {locator?.href ? (
              <a
                href={locator.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 max-w-full items-center gap-1 break-words font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
              >
                {text}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="break-words text-[#515154]">{text}</span>
            )}
            {note && <span className="text-[#6E6E73]"> — {note}</span>}
            {ref.retrievedAt && (
              <span className="text-[#6E6E73]"> — read {ref.retrievedAt.slice(0, 10)}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SectionRow({ section }: { section: DossierCompletionSectionView }) {
  const counts = Object.entries(section.counts ?? {}).filter(([, value]) => Number.isFinite(value))
  return (
    <li id={`record-completeness-${section.id}`} className="min-w-0 scroll-mt-24 py-4">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 break-words text-base font-semibold leading-6 text-[#1D1D1F]">
          {section.label}
        </p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 ${stateBadgeClass(section)}`}
        >
          {section.stateLabel}
        </span>
      </div>
      <p className="mt-1 break-words text-base leading-7 text-[#515154]">{section.basis}</p>
      {counts.length > 0 && (
        <ul className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm leading-6 text-[#6E6E73]">
          {counts.map(([key, value]) => (
            <li key={key} className="break-words">
              {value} {countLabel(key)}
            </li>
          ))}
        </ul>
      )}
      <SectionSources section={section} />
      {section.humanReadSuggested && (
        <p className="mt-2 break-words text-sm leading-6 text-[#424245]">
          A person could add more by reading the named source.
        </p>
      )}
      {section.blockedReason && (
        <p className="mt-2 break-words text-sm leading-6 text-[#8A4B00]">
          What has to happen: {section.blockedReason}
        </p>
      )}
    </li>
  )
}

function TechnicalDisclosure({ view }: { view: DossierCompletionAssessmentView }) {
  return (
    <details className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-4">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
        Technical record: state codes and digests
      </summary>
      <p className="mt-2 break-all font-mono text-[11px] leading-5 text-[#6E6E73]">
        {view.resolverVersion} · input digest {view.inputDigest}
      </p>
      <ul className="mt-2 space-y-1 break-all font-mono text-[11px] leading-5 text-[#6E6E73]">
        {view.sections.map((section) => (
          <li key={`code-${section.id}`}>
            {section.id} · {section.state}
            {basisKindCode(section) ? ` · ${basisKindCode(section)}` : ''}
          </li>
        ))}
      </ul>
    </details>
  )
}

/**
 * The completeness section. Rendered only when the record carries an assessment, so a page never
 * offers an empty completeness claim.
 */
export function DossierCompletionAssessment({ dossier }: { dossier: MedicineDossierViewModel }) {
  const view = dossier.completionAssessment
  if (!view) return null

  const resolution = dossier.inventoryResolution
  const stillOpen = view.sections.filter((section) => !section.terminal)

  return (
    <section
      id="record-completeness"
      aria-labelledby="record-completeness-heading"
      className="scroll-mt-24 border-t border-black/[0.09] py-8 sm:py-10"
      data-testid="dossier-completion-assessment"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0066CC]">
            Record completeness
          </p>
          <h3
            id="record-completeness-heading"
            className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[28px]"
          >
            How complete this record is
          </h3>
          <p className="max-w-2xl text-base leading-7 text-[#515154]">{view.statusCopy}</p>
          <p className="max-w-2xl text-base leading-7 text-[#515154]">
            States last changed on {view.contentChangedAt.slice(0, 10)}.
          </p>
          {resolution && (
            <p className="max-w-2xl text-base leading-7 text-[#515154]">
              {identitySentence(resolution)}
            </p>
          )}
        </div>
        <p className="shrink-0 rounded-full border border-black/[0.1] bg-white px-2.5 py-1 font-mono text-xs leading-5 text-[#424245]">
          {view.terminalSectionCount} of {view.applicableSectionCount} sections have a state
        </p>
      </div>

      {view.status === 'INCOMPLETE' && stillOpen.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#F0D89A] bg-[#FFF8E7] p-4 sm:p-5">
          <h4 className="text-base font-semibold leading-6 text-[#1D1D1F]">Still open</h4>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#515154]">
            These sections have not reached a state yet. Each one is listed again below with what
            was found so far.
          </p>
          <ul className="mt-3 space-y-1 text-sm leading-6">
            {stillOpen.map((section) => (
              <li key={`open-${section.id}`} className="break-words">
                <a
                  href={`#record-completeness-${section.id}`}
                  className="font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                >
                  {section.label}
                </a>
                <span className="text-[#515154]"> — {section.stateLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="mt-6 min-w-0 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {view.sections.map((section) => (
          <SectionRow key={section.id} section={section} />
        ))}
      </ol>

      <TechnicalDisclosure view={view} />
    </section>
  )
}
