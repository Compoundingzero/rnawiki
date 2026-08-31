import { createHash } from 'node:crypto'

import type { AgentInput, AgentRun, DatasetAgent } from '@/lib/agents/core/types'
import { authoredStrings, findForbiddenPhrases } from '@/lib/agents/core/types'
import type { ReviewReason } from '@/lib/agents/core/types'
import { stableJsonStringify } from '@/lib/stable-json'

import {
  isSha256Digest,
  NeurodeContractError,
  validateNeurodeContract,
  type NeurodeContract,
  type NeurodeDefinition,
  type NeurodeDependency,
  type NeurodeSeedPolicy,
  type NeurodeVisibility,
} from './contracts'

export class NeurodeRegistryError extends Error {
  constructor(
    readonly code: 'DUPLICATE_NEURODE_ID' | 'UNKNOWN_NEURODE_ID',
    message: string,
    readonly neurodeId: string,
  ) {
    super(message)
    this.name = 'NeurodeRegistryError'
  }
}

/**
 * An explicit, immutable registry. Filesystem discovery is deliberately absent: registering a node
 * is a reviewed decision, and duplicate stable identities must fail before a graph is constructed.
 */
export class NeurodeRegistry {
  readonly #definitions: readonly NeurodeDefinition[]
  readonly #byId: ReadonlyMap<string, NeurodeDefinition>

  constructor(definitions: readonly NeurodeDefinition[]) {
    const byId = new Map<string, NeurodeDefinition>()
    for (const definition of definitions) {
      validateNeurodeContract(definition.contract)
      const id = definition.contract.id
      if (byId.has(id)) {
        throw new NeurodeRegistryError(
          'DUPLICATE_NEURODE_ID',
          `Neurode id "${id}" is registered more than once.`,
          id,
        )
      }
      byId.set(id, definition)
    }
    this.#definitions = Object.freeze([...definitions])
    this.#byId = byId
  }

  list(): readonly NeurodeDefinition[] {
    return this.#definitions
  }

  get(id: string): NeurodeDefinition | undefined {
    return this.#byId.get(id)
  }

  require(id: string): NeurodeDefinition {
    const definition = this.get(id)
    if (definition === undefined) {
      throw new NeurodeRegistryError(
        'UNKNOWN_NEURODE_ID',
        `Neurode id "${id}" is not registered.`,
        id,
      )
    }
    return definition
  }
}

export type DatasetAgentNeurodeMetadata = Omit<NeurodeContract, 'id' | 'version' | 'purpose'>

/**
 * Wraps the existing deterministic DatasetAgent contract without changing or duplicating an agent.
 * The adapter retains the existing authored-string boundary screen and verifies the agent did not
 * report a different identity from the implementation that was registered.
 */
export function adaptDatasetAgent<TOutput>(
  agent: DatasetAgent<TOutput>,
  metadata: DatasetAgentNeurodeMetadata,
): NeurodeDefinition<AgentInput, AgentRun<TOutput>> {
  const contract: NeurodeContract = {
    ...metadata,
    id: agent.name,
    version: agent.version,
    purpose: agent.description,
  }
  validateNeurodeContract(contract)

  return {
    contract,
    execute({ input }) {
      const run = agent.run(input)
      if (run.agent !== agent.name || run.version !== agent.version) {
        throw new NeurodeContractError(
          'INVALID_METADATA',
          `${agent.name}: the DatasetAgent output identity does not match its registry identity.`,
          agent.name,
        )
      }
      return {
        output: run,
        recordsUsed: run.coverage.used,
        reasonCodes: [...new Set(run.queue?.map((candidate) => candidate.reason) ?? [])].sort(),
      }
    },
    validateOutput(run) {
      const violations = authoredStrings({
        output: run.output,
        queue: run.queue,
        caveats: run.caveats,
      }).flatMap(findForbiddenPhrases)
      if (violations.length > 0) {
        throw new NeurodeContractError(
          'INVALID_MEDICAL_BOUNDARY',
          `${agent.name}: authored output crossed the medical-content boundary.`,
          agent.name,
        )
      }
    },
  }
}

/**
 * Structural subset of scripts/agents/registry.ts. Keeping this interface in the library avoids a
 * runtime dependency from reusable orchestration code back into an operational script.
 */
export interface OperationalDatasetAgentRegistration<TOutput = unknown> {
  agent: DatasetAgent<TOutput>
  reasonSchemaVersion: string
  category: NeurodeContract['category']
  /** Recorded-data prerequisites, not executable neurode edges. */
  dependencies: readonly string[]
  sourceRequirements: readonly string[]
  consumers: readonly string[]
  reviewPolicy: Readonly<Partial<Record<ReviewReason, unknown>>>
  allowZeroCandidates: boolean
  findingCount(output: unknown): number
}

export interface OperationalDatasetAgentAdapterOptions {
  owner: string
  /** Digest of the implementation/parameters; registry semantics are folded into it below. */
  implementationCacheDigest: string
  tests: readonly string[]
  limitations: readonly string[]
  seedPolicy: NeurodeSeedPolicy
  graphDependencies?: readonly NeurodeDependency[]
  inputSchemaId?: string
  outputSchemaId?: string
  visibility?: NeurodeVisibility
  outputPath?: string
}

function sourceRequirementId(origin: 'dependency' | 'source', description: string): string {
  const readable = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 36)
    .replace(/-$/u, '')
  const digest = createHash('sha256').update(description, 'utf8').digest('hex')
  return `agent-${origin}-${readable || 'input'}-${digest.slice(0, 12)}`
}

function operationalCacheDigest(
  registration: OperationalDatasetAgentRegistration,
  options: OperationalDatasetAgentAdapterOptions,
): string {
  return `sha256:${createHash('sha256')
    .update(
      stableJsonStringify({
        schema: 'rnawiki/operational-dataset-agent-adapter/v1',
        implementationCacheDigest: options.implementationCacheDigest,
        agentId: registration.agent.name,
        agentVersion: registration.agent.version,
        reasonSchemaVersion: registration.reasonSchemaVersion,
        dependencies: [...registration.dependencies].sort(),
        sourceRequirements: [...registration.sourceRequirements].sort(),
        consumers: [...registration.consumers].sort(),
        reviewPolicy: registration.reviewPolicy,
        allowZeroCandidates: registration.allowZeroCandidates,
        graphDependencies: options.graphDependencies ?? [],
        seedPolicy: options.seedPolicy,
      }),
      'utf8',
    )
    .digest('hex')}`
}

/**
 * Adapts the current operational registration as a neurode without pretending its corpus-field
 * dependencies are runnable graph nodes. Those strings become content-addressed input requirements;
 * actual graph edges remain an explicit bridge supplied by the caller.
 */
export function adaptOperationalDatasetAgent<TOutput>(
  registration: OperationalDatasetAgentRegistration<TOutput>,
  options: OperationalDatasetAgentAdapterOptions,
): NeurodeDefinition<AgentInput, AgentRun<TOutput>> {
  if (!isSha256Digest(options.implementationCacheDigest)) {
    throw new NeurodeContractError(
      'INVALID_CACHE_DIGEST',
      `${registration.agent.name}: implementationCacheDigest must be a lowercase sha256 digest.`,
      registration.agent.name,
    )
  }
  if (
    registration.reasonSchemaVersion.trim().length === 0 ||
    [...registration.dependencies, ...registration.sourceRequirements].some(
      (description) => description.trim().length === 0,
    )
  ) {
    throw new NeurodeContractError(
      'INVALID_SOURCE_REQUIREMENT',
      `${registration.agent.name}: reason schema and input requirement descriptions must be non-empty.`,
      registration.agent.name,
    )
  }
  const authoredRequirements = registration.dependencies.map((description) => ({
    id: sourceRequirementId('dependency', description),
    schemaId: `rnawiki/agent-dependency/${createHash('sha256').update(description).digest('hex')}/v1`,
    origin: 'AUTHORED' as const,
    visibility: 'PRIVATE' as const,
    requiredForCompleteInput: true,
  }))
  const fetchedRequirements = registration.sourceRequirements.map((description) => ({
    id: sourceRequirementId('source', description),
    schemaId: `rnawiki/agent-source/${createHash('sha256').update(description).digest('hex')}/v1`,
    origin: 'FETCHED' as const,
    visibility: 'PRIVATE' as const,
    requiredForCompleteInput: true,
  }))
  const reasonCodes = Object.entries(registration.reviewPolicy)
    .filter(([, policy]) => policy !== undefined)
    .map(([reason]) => reason)
    .sort()
  const adapted = adaptDatasetAgent(registration.agent, {
    owner: options.owner,
    category: registration.category,
    inputSchemaId: options.inputSchemaId ?? 'rnawiki/agent-corpus/v1',
    outputSchemaId: options.outputSchemaId ?? `rnawiki/agent-run/${registration.agent.name}/v1`,
    dependencies: options.graphDependencies ?? [],
    sourceRequirements: [...authoredRequirements, ...fetchedRequirements].sort((left, right) =>
      left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
    ),
    inputContent: { authored: 'READ_ONLY', fetched: 'READ_ONLY' },
    seedPolicy: options.seedPolicy,
    cacheDigest: operationalCacheDigest(registration, options),
    reasonCodes,
    visibility: options.visibility ?? 'PRIVATE',
    medicalBoundary: {
      llmRuntime: false,
      authorsMedicalClaims: false,
      rewritesMedicalContent: false,
      selectsSources: false,
      resolvesSourceDisagreements: false,
      changesMedicalConclusions: false,
      namesPatientActions: false,
      outputKind: reasonCodes.length > 0 ? 'HUMAN_REVIEW_ITEM' : 'COMPUTED_STATISTIC',
    },
    consumers: [...registration.consumers].sort(),
    outputPath: options.outputPath ?? `data/agents/current/${registration.agent.name}.json`,
    tests: options.tests,
    limitations: options.limitations,
    // The operational runner also rejects an empty corpus. Zero candidates is a separate output
    // condition enforced immediately below and must never weaken the input rule.
    allowZeroInput: false,
  })

  return {
    ...adapted,
    async execute(context) {
      const result = await adapted.execute(context)
      const candidateCount = result.output.queue?.length ?? 0
      if (candidateCount === 0 && !registration.allowZeroCandidates) {
        throw new NeurodeContractError(
          'INVALID_METADATA',
          `${registration.agent.name}: the operational contract does not allow zero candidates.`,
          registration.agent.name,
        )
      }
      const findingCount = registration.findingCount(result.output.output)
      if (!Number.isSafeInteger(findingCount) || findingCount < 0) {
        throw new NeurodeContractError(
          'INVALID_METADATA',
          `${registration.agent.name}: findingCount must return a non-negative safe integer.`,
          registration.agent.name,
        )
      }
      return result
    },
  }
}
