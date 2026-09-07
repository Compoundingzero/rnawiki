/**
 * The shapes a hub page reads (docs/specs/hubs.md).
 *
 * Every value here was computed by `scripts/revamp/hubs_build.py` from the members' stored fields
 * and written to the `hubs`, `hub_members` and `hub_syntheses` tables by
 * `scripts/revamp/hubs_load.ts`. Nothing on a hub page is written at render time.
 */

/** §1: the three kinds of hub and the criterion each one is built on. */
export const HUB_TYPES = ['target', 'class', 'pathway'] as const
export type HubType = (typeof HUB_TYPES)[number]

/** §2: the row order in the comparison table follows this order. */
export const HUB_MEMBER_ROLES = ['approved', 'clinical', 'development', 'withdrawn'] as const
export type HubMemberRole = (typeof HUB_MEMBER_ROLES)[number]

/** The ordinary-language name of each hub kind, for headings and the `/h` index. */
export const HUB_TYPE_LABEL: Record<HubType, string> = {
  target: 'Target',
  class: 'Mechanism class',
  pathway: 'Pathway',
}

/**
 * What each kind of hub groups, said once on the index page. These sentences describe the grouping
 * rule, not a medical claim: they say which stored field put a page in the hub.
 */
export const HUB_TYPE_DESCRIPTION: Record<HubType, string> = {
  target:
    'Pages whose stored target field names the same protein, in records from UniProt, ChEMBL, ' +
    'IUPHAR, DrugCentral or NCATS Inxight.',
  class:
    'Pages whose Singapore product licence carries the same Anatomical Therapeutic Chemical ' +
    'level-4 code.',
  pathway:
    'Longevity pages whose stored pathway field names the same pathway in a sentence that also ' +
    'names the compound.',
}

/** Role headings in the members list. Each says what the registers record, and nothing more. */
export const HUB_MEMBER_ROLE_LABEL: Record<HubMemberRole, string> = {
  approved: 'Approved in at least one register',
  clinical: 'Reached a clinical phase',
  development: 'In development or preclinical records only',
  withdrawn: 'Withdrawn after approval',
}

export interface HubRecord {
  hubId: string
  type: HubType
  name: string
  slug: string
  definition: string
  definitionSource: string
  memberCount: number
  approvedCount: number
  relevance: number
  rankScore: number
  firstBatch: boolean
}

/** One comparison-table row: values only, in the §2 item 2 column order. */
export interface HubMemberRecord {
  key: string
  slug: string | null
  name: string
  ordinal: number
  memberRole: HubMemberRole
  membershipEvidence: string
  approvalSg: string
  approvalUs: string
  approvalAu: string
  approvalUk: string
  approvalEu: string
  approvalJp: string
  approvalCa: string
  sgForensicClass: string
  genericAvailable: string
  potency: string
  indications: string
  indicationCount: number
  withdrawnReason: string
  withdrawnWhere: string
  trialsCount: number
  resultsPostedShare: string
  tier: number
  firstQuestion: string
}

export interface HubSynthesisRecord {
  ordinal: number
  templateId: string
  sentence: string
  provenance: Record<string, unknown>
}

export interface HubPage {
  hub: HubRecord
  members: HubMemberRecord[]
  syntheses: HubSynthesisRecord[]
}

/** One row of the `/h` index. */
export interface HubIndexRow {
  hubId: string
  type: HubType
  name: string
  slug: string
  memberCount: number
  approvedCount: number
}

/** The jurisdiction columns, in the order §2 item 2 fixes. */
export const HUB_JURISDICTION_COLUMNS = [
  { code: 'SG', label: 'Singapore', field: 'approvalSg' },
  { code: 'US', label: 'United States', field: 'approvalUs' },
  { code: 'AU', label: 'Australia', field: 'approvalAu' },
  { code: 'UK', label: 'United Kingdom', field: 'approvalUk' },
  { code: 'EU', label: 'European Union', field: 'approvalEu' },
  { code: 'JP', label: 'Japan', field: 'approvalJp' },
  { code: 'CA', label: 'Canada', field: 'approvalCa' },
] as const satisfies ReadonlyArray<{
  code: string
  label: string
  field: keyof HubMemberRecord
}>

export function isHubType(value: string): value is HubType {
  return (HUB_TYPES as readonly string[]).includes(value)
}
