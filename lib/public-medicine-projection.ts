import type { EvidenceReviewStatus, ProgrammeStatus, VerdictConfidence } from '@/lib/evidence/types'

/**
 * The public, medicine-level projection of normalized programme evidence.
 *
 * The legacy `drugs.one_sentence_verdict` is deliberately absent. A conclusion may enter this
 * projection only through the authoritative `programme_current_publications` pointer and the
 * exact published verdict revision it names.
 */

export interface PublicMedicineProjectionRow {
  medicineSlug: string
  medicinePatientFriendlyIndication: string
  medicineIndication: string
  programmeId: string | null
  programmeSlug: string | null
  programmeTitle: string | null
  programmeIndication: string | null
  programmeTargetPopulation: string | null
  programmeStatus: ProgrammeStatus | null
  currentVerdictRevisionId: string | null
  currentPublicationPublishedAt: Date | null
  verdictRevisionId: string | null
  verdictRevisionNumber: number | null
  verdictReviewStatus: EvidenceReviewStatus | null
  verdictPublicLabel: string | null
  verdictOneSentenceReason: string | null
  verdictIndicationScope: string | null
  verdictPopulationScope: string | null
  verdictTrialScope: string | null
  verdictOutcomeScope: string | null
  verdictConfidence: VerdictConfidence | null
  verdictEngineVersion: string | null
  verdictInputDigestAlgorithm: string | null
  verdictInputDigest: string | null
  verdictProposalDigestAlgorithm: string | null
  verdictProposalDigest: string | null
}

export interface PublicSourceSnapshotBindingRow {
  verdictRevisionId: string
  sourceSnapshotId: string
}

export interface PublicProgrammePublicationProjection {
  /** Exact revision selected by `programme_current_publications`. */
  verdictRevisionId: string
  revisionNumber: number
  publishedAt: string
  publicLabel: string
  oneSentenceReason: string
  indicationScope: string
  populationScope: string
  trialScope: string
  outcomeScope: string
  confidence: VerdictConfidence
  engineVersion: string
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
  proposalDigestAlgorithm: 'sha256'
  proposalDigest: string
  /** Immutable source snapshots in the reviewed claim, node, assessment, and trial graph. */
  sourceSnapshotIds: string[]
}

export interface PublicProgrammeProjection {
  id: string
  slug: string
  title: string
  indication: string | null
  targetPopulation: string | null
  status: ProgrammeStatus
  currentPublication: PublicProgrammePublicationProjection | null
}

interface MedicinePublicationBinding {
  type: 'programme_publication'
  medicineSlug: string
  programmeId: string
  programmeSlug: string
  verdictRevisionId: string
  revisionNumber: number
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
}

interface MedicineProgrammeBinding {
  type: 'programme'
  medicineSlug: string
  programmeId: string
  programmeSlug: string
}

interface MedicineIdentityBinding {
  type: 'medicine_identity'
  medicineSlug: string
}

export type PublicMedicineCardSummary =
  | {
      kind: 'reviewed_programme'
      text: string
      programmeTitle: string
      binding: MedicinePublicationBinding
    }
  | {
      kind: 'programme_indication'
      text: string
      programmeTitle: string
      binding: MedicineProgrammeBinding
    }
  | {
      kind: 'medicine_indication'
      text: string
      binding: MedicineIdentityBinding
    }
  | {
      kind: 'identity_only'
      text: null
      binding: MedicineIdentityBinding
    }

export interface PublicMedicineProjection {
  schemaVersion: 'public-medicine-projection/v1'
  medicineSlug: string
  programmes: PublicProgrammeProjection[]
  cardSummary: PublicMedicineCardSummary
}

export interface PublicDatasetProgrammeEvidence {
  schemaVersion: 'public-medicine-projection/v1'
  selectedSummary: PublicMedicineCardSummary
  programmes: PublicProgrammeProjection[]
}

export interface PublicMedicineCardView {
  summary: PublicMedicineCardSummary
  context: string | null
  href: string
}

interface MutableMedicineProjection {
  medicineSlug: string
  patientFriendlyIndication: string
  indication: string
  programmes: PublicProgrammeProjection[]
}

const SHA256 = /^[0-9a-f]{64}$/

function text(value: string | null | undefined): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function iso(value: Date): string {
  return value.toISOString()
}

function compareText(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

/** Current publications sort first, newest first; every tie has a stable textual fallback. */
function compareProgrammes(left: PublicProgrammeProjection, right: PublicProgrammeProjection) {
  const leftPublished = left.currentPublication?.publishedAt ?? null
  const rightPublished = right.currentPublication?.publishedAt ?? null
  if (leftPublished && rightPublished && leftPublished !== rightPublished) {
    return compareText(rightPublished, leftPublished)
  }
  if (leftPublished && !rightPublished) return -1
  if (!leftPublished && rightPublished) return 1

  const byTitle = compareText(left.title, right.title)
  return byTitle === 0 ? compareText(left.id, right.id) : byTitle
}

function publicationFromRow(
  row: PublicMedicineProjectionRow,
  snapshotIdsByRevision: ReadonlyMap<string, readonly string[]>,
): PublicProgrammePublicationProjection | null {
  // Checking the pointer again in the pure projection keeps an accidental broad join from ever
  // turning an unrelated PUBLISHED revision into public card copy.
  if (
    !row.currentVerdictRevisionId ||
    row.verdictRevisionId !== row.currentVerdictRevisionId ||
    row.verdictReviewStatus !== 'PUBLISHED' ||
    row.verdictRevisionNumber === null ||
    row.verdictRevisionNumber < 1 ||
    !row.currentPublicationPublishedAt ||
    row.verdictInputDigestAlgorithm !== 'sha256' ||
    !row.verdictInputDigest ||
    !SHA256.test(row.verdictInputDigest) ||
    row.verdictProposalDigestAlgorithm !== 'sha256' ||
    !row.verdictProposalDigest ||
    !SHA256.test(row.verdictProposalDigest)
  ) {
    return null
  }

  return {
    verdictRevisionId: row.verdictRevisionId,
    revisionNumber: row.verdictRevisionNumber,
    publishedAt: iso(row.currentPublicationPublishedAt),
    publicLabel: text(row.verdictPublicLabel) ?? '',
    oneSentenceReason: text(row.verdictOneSentenceReason) ?? '',
    indicationScope: text(row.verdictIndicationScope) ?? '',
    populationScope: text(row.verdictPopulationScope) ?? '',
    trialScope: text(row.verdictTrialScope) ?? '',
    outcomeScope: text(row.verdictOutcomeScope) ?? '',
    confidence: row.verdictConfidence ?? 'UNKNOWN',
    engineVersion: text(row.verdictEngineVersion) ?? '',
    inputDigestAlgorithm: 'sha256',
    inputDigest: row.verdictInputDigest,
    proposalDigestAlgorithm: 'sha256',
    proposalDigest: row.verdictProposalDigest,
    sourceSnapshotIds: [...(snapshotIdsByRevision.get(row.verdictRevisionId) ?? [])],
  }
}

function cardSummaryFor(state: MutableMedicineProjection): PublicMedicineCardSummary {
  for (const programme of state.programmes) {
    const publication = programme.currentPublication
    const summary = text(publication?.oneSentenceReason) ?? text(publication?.publicLabel)
    if (publication && summary) {
      return {
        kind: 'reviewed_programme',
        text: summary,
        programmeTitle: programme.title,
        binding: {
          type: 'programme_publication',
          medicineSlug: state.medicineSlug,
          programmeId: programme.id,
          programmeSlug: programme.slug,
          verdictRevisionId: publication.verdictRevisionId,
          revisionNumber: publication.revisionNumber,
          inputDigestAlgorithm: publication.inputDigestAlgorithm,
          inputDigest: publication.inputDigest,
        },
      }
    }
  }

  // A normalized programme indication is preferable to a medicine-wide legacy indication because
  // its scope is explicit. The programme title is retained alongside it for the same reason.
  for (const programme of state.programmes) {
    const indication = text(programme.indication)
    if (indication) {
      return {
        kind: 'programme_indication',
        text: indication,
        programmeTitle: programme.title,
        binding: {
          type: 'programme',
          medicineSlug: state.medicineSlug,
          programmeId: programme.id,
          programmeSlug: programme.slug,
        },
      }
    }
  }

  const indication = text(state.patientFriendlyIndication) ?? text(state.indication)
  if (indication) {
    return {
      kind: 'medicine_indication',
      text: indication,
      binding: { type: 'medicine_identity', medicineSlug: state.medicineSlug },
    }
  }

  return {
    kind: 'identity_only',
    text: null,
    binding: { type: 'medicine_identity', medicineSlug: state.medicineSlug },
  }
}

/**
 * Builds one projection per medicine from bulk query rows. No field in this function accepts the
 * legacy medicine-wide verdict, which makes leaking that conclusion impossible by construction.
 */
export function buildPublicMedicineProjections(
  rows: readonly PublicMedicineProjectionRow[],
  snapshotBindings: readonly PublicSourceSnapshotBindingRow[] = [],
): Map<string, PublicMedicineProjection> {
  const snapshotIdsByRevision = new Map<string, string[]>()
  for (const binding of snapshotBindings) {
    const ids = snapshotIdsByRevision.get(binding.verdictRevisionId) ?? []
    if (!ids.includes(binding.sourceSnapshotId)) ids.push(binding.sourceSnapshotId)
    snapshotIdsByRevision.set(binding.verdictRevisionId, ids)
  }
  for (const ids of snapshotIdsByRevision.values()) ids.sort(compareText)

  const mutable = new Map<string, MutableMedicineProjection>()
  for (const row of rows) {
    const state = mutable.get(row.medicineSlug) ?? {
      medicineSlug: row.medicineSlug,
      patientFriendlyIndication: row.medicinePatientFriendlyIndication,
      indication: row.medicineIndication,
      programmes: [],
    }
    mutable.set(row.medicineSlug, state)

    if (
      !row.programmeId ||
      !row.programmeSlug ||
      !row.programmeTitle ||
      !row.programmeStatus ||
      state.programmes.some((programme) => programme.id === row.programmeId)
    ) {
      continue
    }

    state.programmes.push({
      id: row.programmeId,
      slug: row.programmeSlug,
      title: row.programmeTitle,
      indication: text(row.programmeIndication),
      targetPopulation: text(row.programmeTargetPopulation),
      status: row.programmeStatus,
      currentPublication: publicationFromRow(row, snapshotIdsByRevision),
    })
  }

  const projections = new Map<string, PublicMedicineProjection>()
  for (const state of mutable.values()) {
    state.programmes.sort(compareProgrammes)
    projections.set(state.medicineSlug, {
      schemaVersion: 'public-medicine-projection/v1',
      medicineSlug: state.medicineSlug,
      programmes: state.programmes,
      cardSummary: cardSummaryFor(state),
    })
  }
  return projections
}

/** Creates an explicit identity-only fallback if a caller has a row but no projection query row. */
export function buildLegacyMedicineProjection(input: {
  medicineSlug: string
  patientFriendlyIndication: string
  indication: string
}): PublicMedicineProjection {
  const state: MutableMedicineProjection = {
    medicineSlug: input.medicineSlug,
    patientFriendlyIndication: input.patientFriendlyIndication,
    indication: input.indication,
    programmes: [],
  }
  return {
    schemaVersion: 'public-medicine-projection/v1',
    medicineSlug: state.medicineSlug,
    programmes: [],
    cardSummary: cardSummaryFor(state),
  }
}

/** Plain context shared by home and browse cards; the evidence sentence remains separate. */
export function publicMedicineSummaryContext(summary: PublicMedicineCardSummary): string | null {
  if (summary.kind === 'reviewed_programme') {
    return `Reviewed answer for: ${summary.programmeTitle}`
  }
  if (summary.kind === 'programme_indication') {
    return `Specific use: ${summary.programmeTitle}`
  }
  if (summary.kind === 'medicine_indication') return 'Use listed on the medicine record'
  return null
}

/** Opens the programme whose scoped text appears on the card, or the medicine's default view. */
export function publicMedicineSummaryHref(summary: PublicMedicineCardSummary): string {
  const base = `/d/${encodeURIComponent(summary.binding.medicineSlug)}`
  return summary.binding.type === 'medicine_identity'
    ? base
    : `${base}?programme=${encodeURIComponent(summary.binding.programmeSlug)}`
}

/** Shared card input used without reinterpretation by both the home and browse surfaces. */
export function toPublicMedicineCardView(
  projection: PublicMedicineProjection,
): PublicMedicineCardView {
  return {
    summary: projection.cardSummary,
    context: publicMedicineSummaryContext(projection.cardSummary),
    href: publicMedicineSummaryHref(projection.cardSummary),
  }
}

/** The programme-aware portion embedded in each public NDJSON record. */
export function toPublicDatasetProgrammeEvidence(
  projection: PublicMedicineProjection,
): PublicDatasetProgrammeEvidence {
  return {
    schemaVersion: projection.schemaVersion,
    selectedSummary: projection.cardSummary,
    programmes: projection.programmes,
  }
}
