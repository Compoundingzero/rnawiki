/**
 * The two digests a page-statement revision carries, and what each one is for.
 *
 * `contentDigest` is the wording a reviewer signs. Change one character of the proposed text, the
 * reason, the category, the risk class, the attached sources or the evidence packet and the digest
 * moves, so the approvals recorded against the old digest no longer apply to anything. That is how
 * "editing a proposal invalidates its approvals" is enforced: not by remembering to delete rows,
 * but because a review row physically cannot bind to text it was not given.
 *
 * `sourceDigest` is the recorded surface the wording was judged against. This generalises
 * `legacyTenSecondAnswerFingerprint`, which hashes one authored answer against twenty-five fields
 * of a medicine record. That granularity is too wide for a sentence: a registry refresh that
 * changes a trial list would invalidate an approved wording about where a substance acts. Here the
 * surface is narrowed to the fields the addressed sentence is actually built from, so a change that
 * cannot affect the sentence does not stale its approvals, and a change that can, does.
 */
import { createHash } from 'node:crypto'

import { stableJsonStringify } from '@/lib/stable-json'
import type { DrugDossier } from '@/lib/types'

import type { PageStatementChangeCategory, PageStatementKey, PageStatementRiskClass } from './types'

export const PAGE_STATEMENT_DIGEST_VERSION = 'page-statement/v1' as const

function sha256(value: unknown): string {
  return createHash('sha256').update(stableJsonStringify(value), 'utf8').digest('hex')
}

export interface PageStatementContentSurface {
  medicineId: string
  statementKey: PageStatementKey
  proposedText: string
  currentText: string
  reason: string
  changeCategory: PageStatementChangeCategory
  riskClass: PageStatementRiskClass
  evidenceState: string
  sources: ReadonlyArray<Record<string, unknown>>
  evidencePacket: Record<string, unknown>
}

/** The exact bytes three members sign. */
export function pageStatementContentDigest(surface: PageStatementContentSurface): string {
  return sha256({ version: PAGE_STATEMENT_DIGEST_VERSION, content: surface })
}

/**
 * Which stored fields each addressable sentence is built from.
 *
 * These are read straight off the `drugs` record the compass hero reads. A key listed here is
 * hashed into the statement's source digest; anything not listed cannot stale its approvals. The
 * mapping is deliberately generous at the edges — `sourceProvenance` is included everywhere because
 * every hero sentence shows citations beside it, and a citation list that moved is a change a
 * reviewer would want to see again.
 */
const STATEMENT_SOURCE_FIELDS: Record<PageStatementKey, ReadonlyArray<keyof DrugDossier>> = {
  'hero.opening': [
    'patientFriendlyIndication',
    'laymanHowItWorks',
    'indication',
    'sourceProvenance',
  ],
  'hero.explanation': ['laymanHowItWorks', 'mechanismSteps', 'sourceProvenance'],
  'hero.why_people_take_it': ['patientFriendlyIndication', 'indication', 'sourceProvenance'],
  'hero.strongest_result': ['measuredVsInferredSummary', 'trials', 'sourceProvenance'],
  'hero.principal_limit': ['measuredVsInferredSummary', 'trials', 'sourceProvenance'],
  'hero.where_it_acts': ['anatomicalSite', 'targetProtein', 'sourceProvenance'],
  'hero.immediate_change': ['mechanismSteps', 'sourceProvenance'],
}

export function pageStatementSourceFields(
  statementKey: PageStatementKey,
): ReadonlyArray<keyof DrugDossier> {
  return STATEMENT_SOURCE_FIELDS[statementKey]
}

/**
 * The recorded surface one sentence rests on, hashed.
 *
 * Identity is always part of it: a wording approved for one substance must not survive the record
 * being re-identified as another, which is the failure the medicine-wide fingerprint was built to
 * prevent and the one worth keeping.
 */
export function pageStatementSourceDigest(
  record: DrugDossier | null,
  statementKey: PageStatementKey,
): string {
  const fields = STATEMENT_SOURCE_FIELDS[statementKey]
  const surface: Record<string, unknown> = {}
  for (const field of fields) {
    surface[field as string] = record ? (record[field] ?? null) : null
  }
  return sha256({
    version: PAGE_STATEMENT_DIGEST_VERSION,
    statementKey,
    identity: {
      id: record?.id ?? null,
      name: record?.name ?? null,
      modality: record?.modality ?? null,
      approvalStatus: record?.approvalStatus ?? null,
    },
    surface,
  })
}
