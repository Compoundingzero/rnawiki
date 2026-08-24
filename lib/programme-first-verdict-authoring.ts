import { createHash } from 'node:crypto'

import { z } from 'zod'

import {
  CLAIM_DIRECTIONS,
  CLAIM_NATURES,
  EVIDENCE_NODE_CLAIM_RELATIONSHIPS,
  EVIDENCE_NODE_TYPES,
  EVIDENCE_STATES,
  MECHANISM_EVIDENCE_BASES,
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_TIMELINE_DATE_BASES,
  PROGRAMME_TIMELINE_EVENT_TYPES,
  PROGRAMME_VERDICT_FIELD_PATHS,
  STOPPED_PROGRAMME_VERDICTS,
  STUDY_INTERPRETABILITY_CRITERIA,
  STUDY_INTERPRETABILITY_STATES,
  VERDICT_CLAIM_RELATIONSHIPS,
  VERDICT_CONFIDENCE_LEVELS,
} from '@/lib/evidence/types'
import { stableJsonStringify } from '@/lib/stable-json'

export const PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION =
  'programme-first-verdict-authoring/v1' as const

const idSchema = z.string().trim().min(1).max(64)
const claimKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9][a-z0-9._-]{0,127}$/)
const presentationKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_-]{0,63}$/)
const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum)
const optionalText = (maximum: number) => requiredText(maximum).nullable().default(null)
const optionalDate = z.string().date().nullable().default(null)
const optionalTimestamp = z.string().datetime({ offset: true }).nullable().default(null)

function normalizeDecimal(value: string | null): string | null {
  if (value === null) return null
  const negative = value.startsWith('-')
  const unsigned = negative ? value.slice(1) : value
  const [integer = '0', fraction = ''] = unsigned.split('.')
  const normalizedInteger = integer.replace(/^0+(?=\d)/, '') || '0'
  const normalizedFraction = fraction.replace(/0+$/, '')
  const magnitude = normalizedFraction
    ? `${normalizedInteger}.${normalizedFraction}`
    : normalizedInteger
  if (/^0(?:\.0*)?$/.test(magnitude)) return '0'
  return negative ? `-${magnitude}` : magnitude
}

function fitsExactClaimNumericDomain(value: string): boolean {
  const normalized = normalizeDecimal(value)!
  const unsigned = normalized.startsWith('-') ? normalized.slice(1) : normalized
  const [integer, fraction = ''] = unsigned.split('.')
  return integer!.length <= 20 && fraction.length <= 10
}

const claimLinkSchema = z
  .object({
    claimKey: claimKeySchema,
    relationship: z.enum(EVIDENCE_NODE_CLAIM_RELATIONSHIPS),
  })
  .strict()

const verdictClaimLinkSchema = z
  .object({
    claimKey: claimKeySchema,
    relationship: z.enum(VERDICT_CLAIM_RELATIONSHIPS),
  })
  .strict()

const claimSchema = z
  .object({
    claimKey: claimKeySchema,
    programmeTrialId: idSchema.nullable().default(null),
    evidenceNodeType: z.enum(EVIDENCE_NODE_TYPES).nullable().default(null),
    nature: z.enum(CLAIM_NATURES),
    direction: z.enum(CLAIM_DIRECTIONS),
    plainLanguageText: requiredText(4_000),
    technicalText: optionalText(12_000),
    population: optionalText(4_000),
    intervention: optionalText(4_000),
    comparator: optionalText(4_000),
    dose: optionalText(2_000),
    route: optionalText(160),
    duration: optionalText(160),
    endpoint: optionalText(4_000),
    endpointHierarchy: z
      .enum(['PRIMARY', 'SECONDARY', 'EXPLORATORY', 'NOT_APPLICABLE'])
      .nullable()
      .default(null),
    outcomeType: z
      .enum(['PATIENT_OUTCOME', 'SURROGATE', 'SAFETY', 'OPERATIONAL', 'OTHER'])
      .nullable()
      .default(null),
    numericValue: z
      .string()
      .trim()
      .regex(/^-?\d+(?:\.\d+)?$/)
      .max(64)
      .nullable()
      .default(null),
    numericUnitRequired: z.boolean(),
    numericUnit: optionalText(120),
    resultDate: optionalDate,
    participantOutcome: z.boolean().nullable().default(null),
    comparatorValue: optionalText(2_000),
    comparatorGroup: optionalText(2_000),
    presentedAsPatientBenefit: z.boolean().nullable().default(null),
    exploratoryNatureDisclosed: z.boolean().nullable().default(null),
    stoppingReason: z.boolean(),
    conflictsWithClaimKeys: z.array(claimKeySchema).max(100).default([]),
    uncertaintyInterval: optionalText(240),
    timepoint: optionalText(200),
    reviewerInterpretation: optionalText(8_000),
    lastVerifiedAt: optionalTimestamp,
    sourceSnapshotIds: z.array(idSchema).min(1).max(100),
  })
  .strict()

const evidenceNodeSchema = z
  .object({
    nodeType: z.enum(EVIDENCE_NODE_TYPES),
    state: z.enum(EVIDENCE_STATES),
    plainSummary: requiredText(4_000),
    professionalSummary: requiredText(8_000),
    rationale: requiredText(8_000),
    visible: z.boolean(),
    presentedAsPositive: z.boolean().nullable(),
    presentedAsNegative: z.boolean().nullable(),
    lastVerifiedAt: optionalTimestamp,
    claimLinks: z.array(claimLinkSchema).min(1).max(100),
  })
  .strict()

const interpretabilityAssessmentSchema = z
  .object({
    programmeTrialId: idSchema,
    criterion: z.enum(STUDY_INTERPRETABILITY_CRITERIA),
    state: z.enum(STUDY_INTERPRETABILITY_STATES),
    explanation: requiredText(8_000),
    lastVerifiedAt: optionalTimestamp,
    claimLinks: z.array(claimLinkSchema).min(1).max(100),
  })
  .strict()

const conclusionSchema = z
  .object({
    verdictCode: z.enum(STOPPED_PROGRAMME_VERDICTS).nullable(),
    publicLabel: requiredText(2_000),
    professionalLabel: requiredText(4_000),
    indicationScope: requiredText(4_000),
    populationScope: requiredText(4_000),
    doseExposureScope: requiredText(4_000),
    periodScope: requiredText(2_000),
    trialScope: requiredText(4_000),
    outcomeScope: requiredText(4_000),
    plainMechanism: requiredText(4_000),
    bestSupportedFinding: requiredText(4_000),
    mainLimitation: requiredText(4_000),
    oneSentenceReason: requiredText(4_000),
    whatWasDisproven: z.array(requiredText(4_000)).max(100),
    whatWasNotDisproven: z.array(requiredText(4_000)).max(100),
    whatRemainsUnknown: z.array(requiredText(4_000)).max(100),
    confidence: z.enum(VERDICT_CONFIDENCE_LEVELS),
    confidenceExplanation: requiredText(4_000),
    conditionsThatWouldChangeVerdict: z.array(requiredText(4_000)).max(100),
    sourceDependent: z.boolean(),
    claimLinks: z.array(verdictClaimLinkSchema).min(1).max(200),
  })
  .strict()

const mechanismStepSchema = z
  .object({
    stepKey: presentationKeySchema,
    stepOrder: z.number().int().min(1).max(5),
    plainTitle: requiredText(240),
    plainDescription: requiredText(2_000),
    technicalDescription: optionalText(4_000),
    evidenceBasis: z.enum(MECHANISM_EVIDENCE_BASES),
    claimLinks: z.array(claimLinkSchema).min(1).max(100),
  })
  .strict()

const timelineEventSchema = z
  .object({
    eventKey: presentationKeySchema,
    eventDate: z.string().date(),
    eventType: z.enum(PROGRAMME_TIMELINE_EVENT_TYPES),
    dateBasis: z.enum(PROGRAMME_TIMELINE_DATE_BASES),
    plainTitle: requiredText(240),
    plainDescription: requiredText(2_000),
    technicalDescription: optionalText(4_000),
    programmeTrialId: idSchema.nullable().default(null),
    sourceSnapshotId: idSchema,
    claimLinks: z.array(claimLinkSchema).min(1).max(100),
  })
  .strict()

function dependencyShape<const Paths extends readonly [string, ...string[]]>(paths: Paths) {
  return z
    .object(
      Object.fromEntries(
        paths.map((path) => [path, z.array(claimKeySchema).min(1).max(100)]),
      ) as Record<Paths[number], z.ZodArray<typeof claimKeySchema>>,
    )
    .strict()
}

const summaryDependenciesSchema = dependencyShape(PROGRAMME_SUMMARY_FIELD_PATHS)
const verdictDependenciesSchema = dependencyShape(PROGRAMME_VERDICT_FIELD_PATHS)

export const programmeFirstVerdictAuthoringBundleSchema = z
  .object({
    schemaVersion: z.literal(PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION),
    programmeId: idSchema,
    proposalAsOfDate: z.string().date(),
    conflictsOfInterest: requiredText(4_000),
    programmeTrialIds: z.array(idSchema).min(1).max(100),
    claims: z.array(claimSchema).min(1).max(500),
    evidenceNodes: z.array(evidenceNodeSchema).length(EVIDENCE_NODE_TYPES.length),
    interpretabilityAssessments: z.array(interpretabilityAssessmentSchema).max(500),
    conclusion: conclusionSchema,
    dependencies: z
      .object({
        summary: summaryDependenciesSchema,
        verdict: verdictDependenciesSchema,
      })
      .strict(),
    presentation: z
      .object({
        mechanismSteps: z.array(mechanismStepSchema).min(3).max(5),
        timelineEvents: z.array(timelineEventSchema).max(100),
      })
      .strict(),
  })
  .strict()
  .superRefine((bundle, context) => {
    const trialIds = new Set(bundle.programmeTrialIds)
    if (trialIds.size !== bundle.programmeTrialIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['programmeTrialIds'],
        message: 'Programme trial ids must be unique.',
      })
    }

    const claimKeys = new Set(bundle.claims.map((claim) => claim.claimKey))
    if (claimKeys.size !== bundle.claims.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['claims'],
        message: 'Claim keys must be unique within the authored bundle.',
      })
    }
    const requireClaim = (claimKey: string, path: (string | number)[]) => {
      if (!claimKeys.has(claimKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: `Claim key ${claimKey} is not authored in this bundle.`,
        })
      }
    }

    bundle.claims.forEach((claim, claimIndex) => {
      if (claim.programmeTrialId && !trialIds.has(claim.programmeTrialId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['claims', claimIndex, 'programmeTrialId'],
          message: 'A claim may reference only a trial explicitly scoped by this bundle.',
        })
      }
      if (new Set(claim.sourceSnapshotIds).size !== claim.sourceSnapshotIds.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['claims', claimIndex, 'sourceSnapshotIds'],
          message: 'A claim may cite each exact source snapshot only once.',
        })
      }
      if (new Set(claim.conflictsWithClaimKeys).size !== claim.conflictsWithClaimKeys.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['claims', claimIndex, 'conflictsWithClaimKeys'],
          message: 'A claim may identify each conflicting claim only once.',
        })
      }
      if (claim.numericValue && !fitsExactClaimNumericDomain(claim.numericValue)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['claims', claimIndex, 'numericValue'],
          message:
            'A numeric claim must fit the exact database domain: at most 20 integer and 10 fractional digits after normalization.',
        })
      }
      for (const [conflictIndex, conflictKey] of claim.conflictsWithClaimKeys.entries()) {
        requireClaim(conflictKey, ['claims', claimIndex, 'conflictsWithClaimKeys', conflictIndex])
        if (conflictKey === claim.claimKey) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['claims', claimIndex, 'conflictsWithClaimKeys', conflictIndex],
            message: 'A claim cannot conflict with itself.',
          })
        }
      }
    })

    const validateLinks = (
      links: readonly { claimKey: string; relationship: string }[],
      path: (string | number)[],
    ) => {
      const keys = links.map((link) => link.claimKey)
      if (new Set(keys).size !== keys.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Each target may link a claim only once.',
        })
      }
      links.forEach((link, index) => requireClaim(link.claimKey, [...path, index, 'claimKey']))
    }

    const nodeTypes = new Set(bundle.evidenceNodes.map((node) => node.nodeType))
    if (nodeTypes.size !== bundle.evidenceNodes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidenceNodes'],
        message: 'A first-publication bundle may contain only one revision per evidence-node type.',
      })
    }
    bundle.evidenceNodes.forEach((node, nodeIndex) => {
      validateLinks(node.claimLinks, ['evidenceNodes', nodeIndex, 'claimLinks'])
      for (const [linkIndex, link] of node.claimLinks.entries()) {
        const claim = bundle.claims.find((candidate) => candidate.claimKey === link.claimKey)
        if (claim?.evidenceNodeType && claim.evidenceNodeType !== node.nodeType) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['evidenceNodes', nodeIndex, 'claimLinks', linkIndex],
            message: 'The claim evidence-node type does not match this node.',
          })
        }
      }
    })

    const asOfEnd = new Date(`${bundle.proposalAsOfDate}T23:59:59.999Z`)
    const requireVerifiedByAsOf = (value: string | null, path: (string | number)[]) => {
      if (value && new Date(value) > asOfEnd) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Verification time cannot be after the proposal as-of date.',
        })
      }
    }
    bundle.claims.forEach((claim, index) =>
      requireVerifiedByAsOf(claim.lastVerifiedAt, ['claims', index, 'lastVerifiedAt']),
    )
    bundle.evidenceNodes.forEach((node, index) =>
      requireVerifiedByAsOf(node.lastVerifiedAt, ['evidenceNodes', index, 'lastVerifiedAt']),
    )

    const assessmentKeys = bundle.interpretabilityAssessments.map(
      (assessment) => `${assessment.programmeTrialId}\u001f${assessment.criterion}`,
    )
    if (new Set(assessmentKeys).size !== assessmentKeys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['interpretabilityAssessments'],
        message: 'Each trial criterion may be assessed only once in this bundle.',
      })
    }
    bundle.interpretabilityAssessments.forEach((assessment, assessmentIndex) => {
      if (!trialIds.has(assessment.programmeTrialId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['interpretabilityAssessments', assessmentIndex, 'programmeTrialId'],
          message: 'An assessment may reference only a trial explicitly scoped by this bundle.',
        })
      }
      validateLinks(assessment.claimLinks, [
        'interpretabilityAssessments',
        assessmentIndex,
        'claimLinks',
      ])
      if (!assessment.claimLinks.some((link) => link.relationship === 'SUPPORTS')) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['interpretabilityAssessments', assessmentIndex, 'claimLinks'],
          message: 'Every interpretability answer needs a supporting claim.',
        })
      }
      requireVerifiedByAsOf(assessment.lastVerifiedAt, [
        'interpretabilityAssessments',
        assessmentIndex,
        'lastVerifiedAt',
      ])
    })
    for (const trialId of new Set(
      bundle.interpretabilityAssessments.map((assessment) => assessment.programmeTrialId),
    )) {
      const represented = new Set(
        bundle.interpretabilityAssessments
          .filter((assessment) => assessment.programmeTrialId === trialId)
          .map((assessment) => assessment.criterion),
      )
      for (const criterion of STUDY_INTERPRETABILITY_CRITERIA) {
        if (!represented.has(criterion)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['interpretabilityAssessments'],
            message: `Trial ${trialId} must cover ${criterion}; omit that trial's assessments rather than inventing a partial answer.`,
          })
        }
      }
    }

    validateLinks(bundle.conclusion.claimLinks, ['conclusion', 'claimLinks'])
    if (!bundle.conclusion.claimLinks.some((link) => link.relationship === 'SUPPORTING')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conclusion', 'claimLinks'],
        message: 'The conclusion requires at least one supporting claim.',
      })
    }
    const conclusionClaimKeys = new Set(bundle.conclusion.claimLinks.map((link) => link.claimKey))

    for (const fieldPath of PROGRAMME_SUMMARY_FIELD_PATHS) {
      if (
        new Set(bundle.dependencies.summary[fieldPath]).size !==
        bundle.dependencies.summary[fieldPath].length
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dependencies', 'summary', fieldPath],
          message: 'A summary field may depend on each claim only once.',
        })
      }
      bundle.dependencies.summary[fieldPath].forEach((claimKey, index) => {
        requireClaim(claimKey, ['dependencies', 'summary', fieldPath, index])
        if (!conclusionClaimKeys.has(claimKey)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dependencies', 'summary', fieldPath, index],
            message:
              'A summary dependency must use a claim linked directly to this conclusion revision.',
          })
        }
      })
    }
    for (const fieldPath of PROGRAMME_VERDICT_FIELD_PATHS) {
      if (
        new Set(bundle.dependencies.verdict[fieldPath]).size !==
        bundle.dependencies.verdict[fieldPath].length
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dependencies', 'verdict', fieldPath],
          message: 'A verdict field may depend on each claim only once.',
        })
      }
      bundle.dependencies.verdict[fieldPath].forEach((claimKey, index) => {
        requireClaim(claimKey, ['dependencies', 'verdict', fieldPath, index])
        if (!conclusionClaimKeys.has(claimKey)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dependencies', 'verdict', fieldPath, index],
            message:
              'A verdict dependency must use a claim linked directly to this conclusion revision.',
          })
        }
      })
    }

    const steps = bundle.presentation.mechanismSteps
    if (new Set(steps.map((step) => step.stepKey)).size !== steps.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['presentation', 'mechanismSteps'],
        message: 'Mechanism step keys must be unique.',
      })
    }
    const orders = steps.map((step) => step.stepOrder).sort((left, right) => left - right)
    if (orders.some((order, index) => order !== index + 1)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['presentation', 'mechanismSteps'],
        message: 'Mechanism step order must be contiguous from one.',
      })
    }
    steps.forEach((step, stepIndex) => {
      validateLinks(step.claimLinks, ['presentation', 'mechanismSteps', stepIndex, 'claimLinks'])
      if (
        !step.claimLinks.some(
          (link) => link.relationship === 'SUPPORTS' || link.relationship === 'QUALIFIES',
        )
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['presentation', 'mechanismSteps', stepIndex, 'claimLinks'],
          message: 'A mechanism step needs a supporting or qualifying claim.',
        })
      }
    })

    const events = bundle.presentation.timelineEvents
    if (new Set(events.map((event) => event.eventKey)).size !== events.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['presentation', 'timelineEvents'],
        message: 'Timeline event keys must be unique.',
      })
    }
    events.forEach((event, eventIndex) => {
      validateLinks(event.claimLinks, ['presentation', 'timelineEvents', eventIndex, 'claimLinks'])
      if (event.programmeTrialId && !trialIds.has(event.programmeTrialId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['presentation', 'timelineEvents', eventIndex, 'programmeTrialId'],
          message: 'A timeline event may reference only a trial explicitly scoped by this bundle.',
        })
      }
      const exactSupport = event.claimLinks.some((link) => {
        if (link.relationship !== 'SUPPORTS') return false
        return bundle.claims
          .find((claim) => claim.claimKey === link.claimKey)
          ?.sourceSnapshotIds.includes(event.sourceSnapshotId)
      })
      if (!exactSupport) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['presentation', 'timelineEvents', eventIndex],
          message:
            'A timeline event snapshot must be cited by one claim linked as SUPPORTS to that event.',
        })
      }
    })

    // The locked proposal builder discovers claims from scientific graph links before it loads
    // dependencies. A dependency alone therefore cannot introduce a reviewed claim.
    const graphLinkedClaimKeys = new Set([
      ...bundle.conclusion.claimLinks.map((link) => link.claimKey),
      ...bundle.evidenceNodes.flatMap((node) => node.claimLinks.map((link) => link.claimKey)),
      ...bundle.interpretabilityAssessments.flatMap((assessment) =>
        assessment.claimLinks.map((link) => link.claimKey),
      ),
      ...bundle.presentation.mechanismSteps.flatMap((step) =>
        step.claimLinks.map((link) => link.claimKey),
      ),
      ...bundle.presentation.timelineEvents.flatMap((event) =>
        event.claimLinks.map((link) => link.claimKey),
      ),
    ])
    bundle.claims.forEach((claim, claimIndex) => {
      if (!graphLinkedClaimKeys.has(claim.claimKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['claims', claimIndex],
          message:
            'Every authored claim must have a scientific graph link; a dependency alone cannot introduce a reviewed claim.',
        })
      }
    })
  })

export type ProgrammeFirstVerdictAuthoringBundle = z.infer<
  typeof programmeFirstVerdictAuthoringBundleSchema
>

function canonicalLinks<T extends { claimKey: string; relationship: string }>(links: readonly T[]) {
  return [...links].sort(
    (left, right) =>
      codeUnitCompare(left.claimKey, right.claimKey) ||
      codeUnitCompare(left.relationship, right.relationship),
  )
}

function codeUnitCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

export function canonicalizeFirstVerdictBundle(
  bundle: ProgrammeFirstVerdictAuthoringBundle,
): ProgrammeFirstVerdictAuthoringBundle {
  return {
    ...bundle,
    programmeTrialIds: [...bundle.programmeTrialIds].sort(codeUnitCompare),
    claims: [...bundle.claims]
      .map((claim) => ({
        ...claim,
        numericValue: normalizeDecimal(claim.numericValue),
        conflictsWithClaimKeys: [...claim.conflictsWithClaimKeys].sort(codeUnitCompare),
        lastVerifiedAt: claim.lastVerifiedAt ? new Date(claim.lastVerifiedAt).toISOString() : null,
        sourceSnapshotIds: [...claim.sourceSnapshotIds].sort(codeUnitCompare),
      }))
      .sort((left, right) => codeUnitCompare(left.claimKey, right.claimKey)),
    evidenceNodes: [...bundle.evidenceNodes]
      .map((node) => ({
        ...node,
        lastVerifiedAt: node.lastVerifiedAt ? new Date(node.lastVerifiedAt).toISOString() : null,
        claimLinks: canonicalLinks(node.claimLinks),
      }))
      .sort((left, right) => codeUnitCompare(left.nodeType, right.nodeType)),
    interpretabilityAssessments: [...bundle.interpretabilityAssessments]
      .map((assessment) => ({
        ...assessment,
        lastVerifiedAt: assessment.lastVerifiedAt
          ? new Date(assessment.lastVerifiedAt).toISOString()
          : null,
        claimLinks: canonicalLinks(assessment.claimLinks),
      }))
      .sort(
        (left, right) =>
          codeUnitCompare(left.programmeTrialId, right.programmeTrialId) ||
          codeUnitCompare(left.criterion, right.criterion),
      ),
    conclusion: {
      ...bundle.conclusion,
      claimLinks: canonicalLinks(bundle.conclusion.claimLinks),
    },
    dependencies: {
      summary: Object.fromEntries(
        PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath) => [
          fieldPath,
          [...bundle.dependencies.summary[fieldPath]].sort(codeUnitCompare),
        ]),
      ) as ProgrammeFirstVerdictAuthoringBundle['dependencies']['summary'],
      verdict: Object.fromEntries(
        PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath) => [
          fieldPath,
          [...bundle.dependencies.verdict[fieldPath]].sort(codeUnitCompare),
        ]),
      ) as ProgrammeFirstVerdictAuthoringBundle['dependencies']['verdict'],
    },
    presentation: {
      mechanismSteps: [...bundle.presentation.mechanismSteps]
        .map((step) => ({ ...step, claimLinks: canonicalLinks(step.claimLinks) }))
        .sort(
          (left, right) =>
            left.stepOrder - right.stepOrder || codeUnitCompare(left.stepKey, right.stepKey),
        ),
      timelineEvents: [...bundle.presentation.timelineEvents]
        .map((event) => ({ ...event, claimLinks: canonicalLinks(event.claimLinks) }))
        .sort(
          (left, right) =>
            codeUnitCompare(left.eventDate, right.eventDate) ||
            codeUnitCompare(left.eventKey, right.eventKey),
        ),
    },
  }
}

export function canonicalFirstVerdictBundleDigest(
  bundle: ProgrammeFirstVerdictAuthoringBundle,
): string {
  return createHash('sha256')
    .update(stableJsonStringify(canonicalizeFirstVerdictBundle(bundle)), 'utf8')
    .digest('hex')
}

export function deterministicFirstVerdictId(parts: readonly string[]): string {
  const material = parts.map((part) => `${part.length}:${part}`).join('|')
  return createHash('sha256').update(material, 'utf8').digest('hex')
}
