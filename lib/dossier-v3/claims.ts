/**
 * The reviewed-claim contract, as code (docs/plain-language-content-contract.md,
 * docs/evidence-and-outcome-taxonomy.md).
 *
 * A claim draft is validated here before it is written and again when it is read for a page. The
 * validator refuses what the database's CHECK constraints refuse, and more: a plain-language
 * version that strengthens the technical one, an analogy without its "where this breaks" note, a
 * benefit claim whose trial role is not the tested intervention, a kind-specific `structure` that
 * does not carry what its kind needs. It writes nothing and never composes a sentence.
 */
import { createHash } from 'node:crypto'
import { z } from 'zod'

import {
  auditCopy,
  copyPasses,
  plainVersionViolations,
  type ClaimReading,
  type ReadingViolation,
} from './copy-contract'
import {
  CAUSALITY_LEVELS,
  CLAIM_STRENGTH_CODES,
  CLAIM_STRENGTH_RANK,
  CONTRADICTION_STATES,
  EFFECT_DIRECTIONS,
  EFFECT_SCALES,
  EVIDENCE_CLASS_CODES,
  EVIDENCE_ORIGINS,
  INTERACTION_CATEGORIES,
  maximumClaimStrength,
  OUTCOME_CLASS_CODES,
  REVIEWER_STATES,
  TRIAL_ROLE_CODES,
  UNCERTAINTY_LEVELS,
  USER_GOAL_CODES,
  type ClaimStrength,
} from './taxonomy'

export const CLAIM_KINDS = [
  'effect',
  'mechanism_stage',
  'safety',
  'interaction',
  'regulatory_fact',
  'recorded_use',
  'identity_fact',
  'unknown_statement',
] as const
export type ClaimKind = (typeof CLAIM_KINDS)[number]

const evidenceOriginCodes = EVIDENCE_ORIGINS.map((entry) => entry.code) as [string, ...string[]]
const interactionCategoryCodes = INTERACTION_CATEGORIES.map((entry) => entry.code) as [
  string,
  ...string[],
]

/* ------------------------------------------------------------------ kind-specific structure */

export const mechanismStageStructure = z.object({
  /** 1 = substance, 2 = direct target or first action, 3 = pathway or cellular change,
   * 4 = organ or body function, 5 = observed human outcome. */
  stageOrder: z.number().int().min(1).max(5),
  stageRole: z.enum(['substance', 'target', 'pathway', 'organ', 'human_outcome']),
  evidenceOrigin: z.enum(evidenceOriginCodes),
  /** The exact scope the stage is supported in (species, cell type, population). */
  scope: z.string().min(1),
})

export const interactionStructure = z.object({
  counterpartKey: z.string().min(1),
  counterpartName: z.string().min(1),
  category: z.enum(interactionCategoryCodes),
  interactionType: z.string().min(1),
  possibleConsequence: z.string().min(1),
  missingInformation: z.array(z.string()).default([]),
  clinicianQuestion: z.string().min(1),
})

export const safetyStructure = z.object({
  /** `common_effect`, `serious_warning`, `contraindication`, `monitoring`, `population_caution`,
   * `surgery_or_test`, `long_term_uncertainty`. */
  itemKind: z.enum([
    'common_effect',
    'serious_warning',
    'contraindication',
    'monitoring',
    'population_caution',
    'surgery_or_test',
    'long_term_uncertainty',
  ]),
  /** The rate as recorded, with its denominator, or absent where no denominator exists. */
  rateAsRecorded: z.string().optional(),
  denominatorKnown: z.boolean(),
})

export const recordedUseStructure = z.object({
  /** `USER_GOALS` codes this use maps to, chosen by the author and reviewed. */
  goals: z.array(z.enum(USER_GOAL_CODES)).default([]),
  jurisdiction: z.string().optional(),
})

export const effectStructure = z.object({
  goals: z.array(z.enum(USER_GOAL_CODES)).min(1),
  replication: z.enum(['replicated', 'single_study', 'conflicting', 'unknown']).default('unknown'),
  dropoutOrMissingData: z.string().optional(),
  applicabilityLimits: z.array(z.string()).default([]),
})

export const STRUCTURE_BY_KIND: Record<ClaimKind, z.ZodTypeAny> = {
  effect: effectStructure,
  mechanism_stage: mechanismStageStructure,
  safety: safetyStructure,
  interaction: interactionStructure,
  regulatory_fact: z.object({ jurisdiction: z.string().min(1) }),
  recorded_use: recordedUseStructure,
  identity_fact: z.object({ identifierKind: z.string().min(1) }),
  unknown_statement: z.object({ gapKind: z.string().min(1) }),
}

/* ------------------------------------------------------------------ the claim input */

const sourceLocator = z.object({
  snapshotId: z.string().min(1),
  locator: z.string().min(1),
  excerpt: z.string().optional(),
})

export const claimInputSchema = z
  .object({
    subjectKey: z.string().min(1),
    kind: z.enum(CLAIM_KINDS),
    predicate: z.string().min(1).max(80),
    objectText: z.string().min(1),
    plainLanguageVersion: z.string().min(1),
    technicalVersion: z.string().min(1),
    analogy: z.string().optional(),
    analogyBreaks: z.string().optional(),
    evidenceClass: z.enum(EVIDENCE_CLASS_CODES),
    outcomeClass: z.enum(OUTCOME_CLASS_CODES),
    claimStrength: z.enum(CLAIM_STRENGTH_CODES),
    trialIdentifier: z
      .string()
      .regex(/^NCT\d{8}$/)
      .optional(),
    trialRole: z.enum(TRIAL_ROLE_CODES).optional(),
    participants: z.number().int().positive().optional(),
    prespecified: z.boolean().optional(),
    applicablePopulation: z.string().min(1),
    indicationOrGoal: z.string().min(1).max(160),
    formulation: z.string().optional(),
    route: z.string().max(80).optional(),
    doseAsStudied: z.string().optional(),
    duration: z.string().optional(),
    comparator: z.string().optional(),
    direction: z.enum(EFFECT_DIRECTIONS),
    effectScale: z.enum(EFFECT_SCALES),
    baselineValue: z.string().optional(),
    comparatorValue: z.string().optional(),
    effectEstimate: z.string().optional(),
    effectValue: z.number().optional(),
    effectUnit: z.string().max(80).optional(),
    absoluteEffect: z.string().optional(),
    ciLow: z.number().optional(),
    ciHigh: z.number().optional(),
    ciLevel: z.number().min(0).max(100).optional(),
    studyDesign: z.string().optional(),
    causality: z.enum(CAUSALITY_LEVELS),
    uncertainty: z.enum(UNCERTAINTY_LEVELS),
    uncertaintyReasons: z.array(z.string().min(1)).default([]),
    sourceSnapshotIds: z.array(z.string().min(1)).min(1),
    sourceLocators: z.array(sourceLocator).default([]),
    contradictionState: z.enum(CONTRADICTION_STATES).default('unknown'),
    reviewerState: z.enum(REVIEWER_STATES).default('draft'),
    structure: z.record(z.unknown()).default({}),
    riskTier: z.enum(['standard', 'elevated', 'high']).default('standard'),
    contentVersion: z.number().int().min(1).default(1),
    /** The structured readings of the two versions, compared field by field. */
    technicalReading: z.custom<ClaimReading>((value) => typeof value === 'object' && value !== null),
    plainReading: z.custom<ClaimReading>((value) => typeof value === 'object' && value !== null),
  })
  .strict()

export type ClaimInput = z.infer<typeof claimInputSchema>

export interface ClaimValidation {
  ok: boolean
  problems: string[]
  readingViolations: ReadingViolation[]
}

/**
 * Everything the database refuses, plus the content rules only code can check. Returns every
 * problem found rather than the first, so an author fixes a draft in one pass.
 */
export function validateClaimInput(raw: unknown): ClaimValidation {
  const parsed = claimInputSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      problems: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      readingViolations: [],
    }
  }
  const claim = parsed.data
  const problems: string[] = []

  const cap = maximumClaimStrength(claim.outcomeClass, claim.evidenceClass)
  if (CLAIM_STRENGTH_RANK[claim.claimStrength] > CLAIM_STRENGTH_RANK[cap]) {
    problems.push(
      `claimStrength ${claim.claimStrength} exceeds the cap ${cap} for outcome ${claim.outcomeClass} from ${claim.evidenceClass}`,
    )
  }
  if (claim.analogy && !claim.analogyBreaks?.trim()) {
    problems.push('an analogy needs a sentence saying where it stops being accurate')
  }
  if (claim.uncertainty !== 'low' && claim.uncertaintyReasons.length === 0) {
    problems.push('uncertainty above low needs at least one reason in words')
  }
  if (
    claim.kind === 'effect' &&
    claim.trialIdentifier &&
    claim.trialRole !== 'experimental_intervention' &&
    !['no_reviewed_conclusion', 'mixed_or_contradicted', 'animal_or_cell_only'].includes(
      claim.claimStrength,
    )
  ) {
    problems.push(
      'a benefit claim read from a trial needs the substance to be the tested intervention in it',
    )
  }
  if (claim.effectScale === 'relative' && !claim.absoluteEffect) {
    problems.push(
      'a relative effect must carry the absolute context where it is available; record absoluteEffect or set effectScale to not_measured with a reason',
    )
  }
  const structure = STRUCTURE_BY_KIND[claim.kind].safeParse(claim.structure)
  if (!structure.success) {
    for (const issue of structure.error.issues) {
      problems.push(`structure.${issue.path.join('.')}: ${issue.message}`)
    }
  }
  if (claim.reviewerState === 'reviewed') {
    problems.push('a claim is never created as reviewed; review is a separate transaction')
  }

  for (const [label, text] of [
    ['plainLanguageVersion', claim.plainLanguageVersion],
    ['technicalVersion', claim.technicalVersion],
    ['analogy', claim.analogy ?? ''],
  ] as const) {
    if (!text) continue
    const report = auditCopy(text)
    if (!copyPasses(report)) {
      const hits = [
        ...report.internalKeys.map((hit) => `internal key "${hit.match}"`),
        ...report.forbiddenPhrases.map((hit) => `forbidden phrase "${hit.match}"`),
        ...report.unscopedCertainty.map((hit) => `unscoped "${hit.match}"`),
        ...(report.sentences.over30 > 0 ? [`${report.sentences.over30} sentence(s) over 30 words`] : []),
      ]
      problems.push(`${label}: ${hits.join('; ')}`)
    }
  }

  const readingViolations = plainVersionViolations(claim.technicalReading, claim.plainReading)
  for (const violation of readingViolations) {
    problems.push(`plain version ${violation.reason} (${violation.field})`)
  }

  return { ok: problems.length === 0, problems, readingViolations }
}

/** A stable id for a claim: the subject, the predicate, the object and the content version. */
export function claimId(claim: Pick<ClaimInput, 'subjectKey' | 'kind' | 'predicate' | 'objectText' | 'contentVersion'>): string {
  return createHash('sha256')
    .update(
      [claim.subjectKey, claim.kind, claim.predicate, claim.objectText, String(claim.contentVersion)].join(
        ' ',
      ),
    )
    .digest('hex')
}

/** The status words a Decision Card shows for a set of reviewed claims about one goal. */
export function strongestPublishableStrength(
  claims: ReadonlyArray<{ claimStrength: ClaimStrength; reviewerState: string }>,
): ClaimStrength {
  let best: ClaimStrength = 'no_reviewed_conclusion'
  for (const claim of claims) {
    if (claim.reviewerState !== 'reviewed') continue
    if (CLAIM_STRENGTH_RANK[claim.claimStrength] > CLAIM_STRENGTH_RANK[best]) best = claim.claimStrength
  }
  return best
}
