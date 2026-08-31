/**
 * The common contract for a deterministic RNAWiki processing node (a "neurode").
 *
 * A neurode may calculate over recorded data or route an observation to a person. It may not use
 * an LLM at runtime, author a medical claim, change recorded medicine content, choose between
 * sources, or turn an observation into patient advice. Those boundaries are declared here and
 * validated at registry construction rather than left as comments beside individual runners.
 */

export const NEURODE_CATEGORIES = [
  'STRUCTURAL_VALIDATOR',
  'DATA_QUALITY_DETECTOR',
  'COVERAGE_DETECTOR',
  'CROSS_SOURCE_RELATION',
  'PRIORITIZATION_FEATURE',
  'PUBLIC_AGGREGATE',
] as const

export type NeurodeCategory = (typeof NEURODE_CATEGORIES)[number]

export type NeurodeVisibility = 'PUBLIC' | 'PRIVATE'
export type NeurodeInputOrigin = 'AUTHORED' | 'FETCHED'
export type NeurodeReadPolicy = 'NONE' | 'READ_ONLY'

export interface NeurodeSourceRequirement {
  /** Stable name used to bind a supplied component digest to this requirement. */
  id: string
  schemaId: string
  origin: NeurodeInputOrigin
  visibility: NeurodeVisibility
  /** Missing optional inputs may reduce coverage but do not make the cache identity incomplete. */
  requiredForCompleteInput: boolean
}

/**
 * Most dependencies name the producer exactly. A schema selector is available for deliberately
 * interchangeable producers, but is accepted only when exactly one registered neurode provides
 * that schema. Zero providers is missing; two providers is ambiguous.
 */
export type NeurodeDependency =
  | { selector: 'NEURODE_ID'; neurodeId: string }
  | { selector: 'OUTPUT_SCHEMA'; outputSchemaId: string }

export type NeurodeSeedPolicy =
  { mode: 'NONE' } | { mode: 'FIXED'; seed: number } | { mode: 'PROVIDED' }

export type NeurodeOutputKind =
  'COMPUTED_STATISTIC' | 'STRUCTURAL_RELATION' | 'HUMAN_REVIEW_ITEM' | 'OPERATIONAL_RECORD'

/** Literal false fields make every prohibited capability explicit in a registered contract. */
export interface NeurodeMedicalBoundary {
  llmRuntime: false
  authorsMedicalClaims: false
  rewritesMedicalContent: false
  selectsSources: false
  resolvesSourceDisagreements: false
  changesMedicalConclusions: false
  namesPatientActions: false
  outputKind: NeurodeOutputKind
}

export interface NeurodeContract {
  /** Lowercase kebab-case identity; stable across implementation releases. */
  id: string
  /** SemVer for the implementation and its declared behaviour. */
  version: string
  purpose: string
  owner: string
  category: NeurodeCategory
  inputSchemaId: string
  outputSchemaId: string
  dependencies: readonly NeurodeDependency[]
  sourceRequirements: readonly NeurodeSourceRequirement[]
  /** Explicitly distinguishes the two content origins even when one side is unused. */
  inputContent: {
    authored: NeurodeReadPolicy
    fetched: NeurodeReadPolicy
  }
  seedPolicy: NeurodeSeedPolicy
  /** Digest of implementation, parameters, and semantics that affect output. */
  cacheDigest: string
  /** Codes this neurode is allowed to emit; prose is not an identity. */
  reasonCodes: readonly string[]
  visibility: NeurodeVisibility
  medicalBoundary: NeurodeMedicalBoundary
  /** Named systems or people that consume this output. */
  consumers: readonly string[]
  /** Repository path or durable store locator; output is never written by the framework itself. */
  outputPath: string
  /** Focused tests that establish this node's declared behaviour. */
  tests: readonly string[]
  /** Known coverage or method limits. Empty is an explicit declaration, not an omitted field. */
  limitations: readonly string[]
  /** Zero records are normally a broken input, not a successful empty analysis. */
  allowZeroInput: boolean
}

export interface NeurodeCloseable {
  close(): void | Promise<void>
}

export interface NeurodeResourceScope {
  /** Registers ownership with the current execution and returns the same resource for convenience. */
  use<TResource extends NeurodeCloseable>(resource: TResource): TResource
}

export interface NeurodeExecutionContext<TInput> {
  input: TInput
  /** Keys are resolved stable neurode ids, never schema selectors. */
  dependencyOutputs: ReadonlyMap<string, unknown>
  seed: number | undefined
  resources: NeurodeResourceScope
}

export interface NeurodeExecutionResult<TOutput> {
  output: TOutput
  /** Number of records that contributed to output, which may be lower than input coverage. */
  recordsUsed: number
  /** A deterministic subset of the reason codes declared by the contract. */
  reasonCodes?: readonly string[]
}

export interface NeurodeDefinition<TInput = unknown, TOutput = unknown> {
  contract: NeurodeContract
  execute(
    context: NeurodeExecutionContext<TInput>,
  ): NeurodeExecutionResult<TOutput> | Promise<NeurodeExecutionResult<TOutput>>
  /** Optional deterministic boundary check, also run for values restored from cache. */
  validateOutput?(output: TOutput): void
}

export type NeurodeContractErrorCode =
  | 'INVALID_ID'
  | 'INVALID_VERSION'
  | 'INVALID_METADATA'
  | 'INVALID_SCHEMA_ID'
  | 'INVALID_DEPENDENCY'
  | 'DUPLICATE_SOURCE_REQUIREMENT'
  | 'INVALID_SOURCE_REQUIREMENT'
  | 'INVALID_SEED_POLICY'
  | 'INVALID_CACHE_DIGEST'
  | 'DUPLICATE_REASON_CODE'
  | 'INVALID_REASON_CODE'
  | 'INVALID_MEDICAL_BOUNDARY'

export class NeurodeContractError extends Error {
  constructor(
    readonly code: NeurodeContractErrorCode,
    message: string,
    readonly neurodeId?: string,
  ) {
    super(message)
    this.name = 'NeurodeContractError'
  }
}

const ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u
const SCHEMA_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u
const REASON_CODE_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/u

function requireText(value: string, field: string, id: string): void {
  if (value.trim().length === 0 || /[\r\n]/u.test(value)) {
    throw new NeurodeContractError(
      'INVALID_METADATA',
      `${id}: ${field} must be a non-empty single-line string.`,
      id,
    )
  }
}

function requireSchemaId(value: string, field: string, id: string): void {
  if (!SCHEMA_PATTERN.test(value)) {
    throw new NeurodeContractError(
      'INVALID_SCHEMA_ID',
      `${id}: ${field} must be a stable non-whitespace schema id.`,
      id,
    )
  }
}

function requireUniqueText(values: readonly string[], field: string, id: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    requireText(value, field, id)
    if (seen.has(value)) {
      throw new NeurodeContractError(
        'INVALID_METADATA',
        `${id}: ${field} contains the duplicate value "${value}".`,
        id,
      )
    }
    seen.add(value)
  }
}

/** Validates declarations only and never executes a neurode or mutates its contract. */
export function validateNeurodeContract(contract: NeurodeContract): void {
  const id = contract.id
  if (!ID_PATTERN.test(id)) {
    throw new NeurodeContractError(
      'INVALID_ID',
      `Neurode id "${id}" must be lowercase kebab-case.`,
      id,
    )
  }
  if (!SEMVER_PATTERN.test(contract.version)) {
    throw new NeurodeContractError(
      'INVALID_VERSION',
      `${id}: version "${contract.version}" is not SemVer.`,
      id,
    )
  }

  requireText(contract.purpose, 'purpose', id)
  requireText(contract.owner, 'owner', id)
  requireSchemaId(contract.inputSchemaId, 'inputSchemaId', id)
  requireSchemaId(contract.outputSchemaId, 'outputSchemaId', id)
  requireText(contract.outputPath, 'outputPath', id)
  requireUniqueText(contract.consumers, 'consumers', id)
  requireUniqueText(contract.tests, 'tests', id)
  requireUniqueText(contract.limitations, 'limitations', id)
  if (
    contract.consumers.length === 0 ||
    contract.tests.length === 0 ||
    !NEURODE_CATEGORIES.includes(contract.category) ||
    !['PUBLIC', 'PRIVATE'].includes(contract.visibility) ||
    !['NONE', 'READ_ONLY'].includes(contract.inputContent.authored) ||
    !['NONE', 'READ_ONLY'].includes(contract.inputContent.fetched) ||
    typeof contract.allowZeroInput !== 'boolean'
  ) {
    throw new NeurodeContractError(
      'INVALID_METADATA',
      `${id}: consumers and tests must each declare at least one entry.`,
      id,
    )
  }

  for (const dependency of contract.dependencies) {
    if (dependency.selector === 'NEURODE_ID') {
      if (!ID_PATTERN.test(dependency.neurodeId)) {
        throw new NeurodeContractError(
          'INVALID_DEPENDENCY',
          `${id}: dependency id "${dependency.neurodeId}" is invalid.`,
          id,
        )
      }
      continue
    }
    if (dependency.selector === 'OUTPUT_SCHEMA') {
      requireSchemaId(dependency.outputSchemaId, 'dependency outputSchemaId', id)
      continue
    }
    const exhaustive: never = dependency
    throw new NeurodeContractError(
      'INVALID_DEPENDENCY',
      `${id}: dependency selector "${String((exhaustive as { selector?: unknown }).selector)}" is invalid.`,
      id,
    )
  }

  const sourceIds = new Set<string>()
  for (const requirement of contract.sourceRequirements) {
    if (!ID_PATTERN.test(requirement.id)) {
      throw new NeurodeContractError(
        'INVALID_SOURCE_REQUIREMENT',
        `${id}: source requirement id "${requirement.id}" is invalid.`,
        id,
      )
    }
    requireSchemaId(requirement.schemaId, 'source requirement schemaId', id)
    if (
      !['AUTHORED', 'FETCHED'].includes(requirement.origin) ||
      !['PUBLIC', 'PRIVATE'].includes(requirement.visibility) ||
      typeof requirement.requiredForCompleteInput !== 'boolean' ||
      (requirement.origin === 'AUTHORED' && contract.inputContent.authored === 'NONE') ||
      (requirement.origin === 'FETCHED' && contract.inputContent.fetched === 'NONE')
    ) {
      throw new NeurodeContractError(
        'INVALID_SOURCE_REQUIREMENT',
        `${id}: source requirement "${requirement.id}" contradicts the declared content policy.`,
        id,
      )
    }
    if (sourceIds.has(requirement.id)) {
      throw new NeurodeContractError(
        'DUPLICATE_SOURCE_REQUIREMENT',
        `${id}: source requirement "${requirement.id}" is declared more than once.`,
        id,
      )
    }
    sourceIds.add(requirement.id)
  }

  if (contract.seedPolicy.mode === 'FIXED' && !Number.isSafeInteger(contract.seedPolicy.seed)) {
    throw new NeurodeContractError(
      'INVALID_SEED_POLICY',
      `${id}: a fixed seed must be a safe integer.`,
      id,
    )
  }
  if (!['NONE', 'FIXED', 'PROVIDED'].includes(contract.seedPolicy.mode)) {
    throw new NeurodeContractError('INVALID_SEED_POLICY', `${id}: seed policy is invalid.`, id)
  }
  if (!SHA256_PATTERN.test(contract.cacheDigest)) {
    throw new NeurodeContractError(
      'INVALID_CACHE_DIGEST',
      `${id}: cacheDigest must be a lowercase sha256 digest.`,
      id,
    )
  }

  const reasons = new Set<string>()
  for (const reason of contract.reasonCodes) {
    if (!REASON_CODE_PATTERN.test(reason)) {
      throw new NeurodeContractError(
        'INVALID_REASON_CODE',
        `${id}: reason code "${reason}" is invalid.`,
        id,
      )
    }
    if (reasons.has(reason)) {
      throw new NeurodeContractError(
        'DUPLICATE_REASON_CODE',
        `${id}: reason code "${reason}" is declared more than once.`,
        id,
      )
    }
    reasons.add(reason)
  }

  const boundary = contract.medicalBoundary
  if (
    boundary.llmRuntime !== false ||
    boundary.authorsMedicalClaims !== false ||
    boundary.rewritesMedicalContent !== false ||
    boundary.selectsSources !== false ||
    boundary.resolvesSourceDisagreements !== false ||
    boundary.changesMedicalConclusions !== false ||
    boundary.namesPatientActions !== false ||
    ![
      'COMPUTED_STATISTIC',
      'STRUCTURAL_RELATION',
      'HUMAN_REVIEW_ITEM',
      'OPERATIONAL_RECORD',
    ].includes(boundary.outputKind)
  ) {
    throw new NeurodeContractError(
      'INVALID_MEDICAL_BOUNDARY',
      `${id}: runtime LLM use and automatic medical judgement are forbidden.`,
      id,
    )
  }
}

export function isSha256Digest(value: string): boolean {
  return SHA256_PATTERN.test(value)
}
