import { createHash } from 'node:crypto'

import { stableJsonStringify } from '@/lib/stable-json'

import {
  isSha256Digest,
  type NeurodeCloseable,
  type NeurodeContract,
  type NeurodeDefinition,
  type NeurodeResourceScope,
} from './contracts'
import { NeurodeGraph } from './graph'
import {
  createNeurodeRunManifest,
  type NeurodeCacheStatus,
  type NeurodeNodeRunManifest,
  type NeurodeRunManifest,
} from './run-manifest'

export const NEURODE_CACHE_ENTRY_SCHEMA = 'rnawiki/neurode-cache-entry/v1' as const

export interface NeurodeInputEnvelope<TInput = unknown> {
  value: TInput
  /** Explicit coverage count; the runner never infers a successful zero from an empty value. */
  recordCount: number
  /** Digest of all external input represented by value. */
  digest?: string
  /** False when the digest omits any input that could affect output. */
  digestComplete: boolean
  /** Component identities keyed by NeurodeSourceRequirement.id. */
  sourceDigests?: Readonly<Record<string, string>>
}

export interface NeurodeCacheEntry {
  schema: typeof NEURODE_CACHE_ENTRY_SCHEMA
  neurodeId: string
  neurodeVersion: string
  contractCacheDigest: string
  inputDigest: string
  outputDigest: string
  output: unknown
  recordsUsed: number
  reasonCodes: readonly string[]
}

/** A runner owns this cache handle for one run and closes it before returning. */
export interface NeurodeCache {
  get(key: string): NeurodeCacheEntry | undefined | Promise<NeurodeCacheEntry | undefined>
  set(key: string, entry: NeurodeCacheEntry): void | Promise<void>
  close?(): void | Promise<void>
}

export interface NeurodeRunRequest {
  /** Omit for the complete graph. A partial request automatically includes every prerequisite. */
  requestedIds?: readonly string[]
  inputs: Readonly<Record<string, NeurodeInputEnvelope>>
  /** Used only by contracts whose seedPolicy is PROVIDED. */
  seeds?: Readonly<Record<string, number>>
}

export interface NeurodeRunResult {
  outputs: ReadonlyMap<string, unknown>
  manifest: NeurodeRunManifest
}

export type NeurodeRunFailureCode =
  | 'MISSING_INPUT'
  | 'INVALID_INPUT_COUNT'
  | 'ZERO_INPUT_NOT_ALLOWED'
  | 'INVALID_INPUT_DIGEST'
  | 'INVALID_SOURCE_DIGEST'
  | 'SEED_POLICY_VIOLATION'
  | 'CACHE_READ_FAILED'
  | 'CACHE_WRITE_FAILED'
  | 'CACHE_INTEGRITY_FAILED'
  | 'EXECUTION_FAILED'
  | 'INVALID_EXECUTION_RESULT'
  | 'NON_JSON_OUTPUT'
  | 'UNDECLARED_REASON_CODE'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'RESOURCE_CLOSE_FAILED'
  | 'CACHE_CLOSE_FAILED'

export class NeurodeRunError extends Error {
  constructor(
    readonly code: NeurodeRunFailureCode,
    readonly manifest: NeurodeRunManifest,
    options?: { cause?: unknown },
  ) {
    super(`Neurode run failed with ${code}.`, options)
    this.name = 'NeurodeRunError'
  }
}

class NodeFailure extends Error {
  constructor(
    readonly code: NeurodeRunFailureCode,
    options?: { cause?: unknown },
  ) {
    super(code, options)
    this.name = 'NodeFailure'
  }
}

class ResourceScope implements NeurodeResourceScope {
  readonly #resources: NeurodeCloseable[] = []
  readonly #registered = new Set<NeurodeCloseable>()
  #closed = false

  use<TResource extends NeurodeCloseable>(resource: TResource): TResource {
    if (this.#closed) throw new NodeFailure('RESOURCE_CLOSE_FAILED')
    if (!this.#registered.has(resource)) {
      this.#registered.add(resource)
      this.#resources.push(resource)
    }
    return resource
  }

  async closeAll(): Promise<void> {
    this.#closed = true
    const failures: unknown[] = []
    for (let index = this.#resources.length - 1; index >= 0; index -= 1) {
      const resource = this.#resources[index]
      if (resource === undefined) continue
      try {
        await resource.close()
      } catch (error) {
        failures.push(error)
      }
    }
    if (failures.length > 0) {
      throw new NodeFailure('RESOURCE_CLOSE_FAILED', { cause: new AggregateError(failures) })
    }
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function assertJsonValue(value: unknown, seen = new Set<object>()): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new NodeFailure('NON_JSON_OUTPUT')
    return
  }
  if (typeof value !== 'object') throw new NodeFailure('NON_JSON_OUTPUT')
  if (seen.has(value)) throw new NodeFailure('NON_JSON_OUTPUT')
  seen.add(value)

  if (Array.isArray(value)) {
    for (const entry of value) assertJsonValue(entry, seen)
    seen.delete(value)
    return
  }

  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new NodeFailure('NON_JSON_OUTPUT')
  }
  for (const entry of Object.values(value as Record<string, unknown>)) {
    assertJsonValue(entry, seen)
  }
  seen.delete(value)
}

export function neurodeOutputDigest(value: unknown): string {
  assertJsonValue(value)
  return `sha256:${sha256(stableJsonStringify(value))}`
}

function validateReasonCodes(contract: NeurodeContract, values: readonly string[]): string[] {
  const declared = new Set(contract.reasonCodes)
  for (const value of values) {
    if (!declared.has(value)) throw new NodeFailure('UNDECLARED_REASON_CODE')
  }
  return [...new Set(values)].sort()
}

function resolveSeed(contract: NeurodeContract, provided: number | undefined): number | undefined {
  if (contract.seedPolicy.mode === 'NONE') {
    if (provided !== undefined) throw new NodeFailure('SEED_POLICY_VIOLATION')
    return undefined
  }
  if (contract.seedPolicy.mode === 'FIXED') {
    if (provided !== undefined && provided !== contract.seedPolicy.seed) {
      throw new NodeFailure('SEED_POLICY_VIOLATION')
    }
    return contract.seedPolicy.seed
  }
  if (!Number.isSafeInteger(provided)) throw new NodeFailure('SEED_POLICY_VIOLATION')
  return provided
}

function inspectInputCompleteness(
  contract: NeurodeContract,
  input: NeurodeInputEnvelope,
): { complete: boolean; sourceDigests: Readonly<Record<string, string>> } {
  if (input.digest !== undefined && !isSha256Digest(input.digest)) {
    throw new NodeFailure('INVALID_INPUT_DIGEST')
  }
  if (input.digestComplete && input.digest === undefined) {
    throw new NodeFailure('INVALID_INPUT_DIGEST')
  }

  const sourceDigests = input.sourceDigests ?? {}
  for (const digest of Object.values(sourceDigests)) {
    if (!isSha256Digest(digest)) throw new NodeFailure('INVALID_SOURCE_DIGEST')
  }
  const requiredSourcesPresent = contract.sourceRequirements
    .filter((requirement) => requirement.requiredForCompleteInput)
    .every((requirement) => sourceDigests[requirement.id] !== undefined)

  return {
    complete: input.digestComplete && input.digest !== undefined && requiredSourcesPresent,
    sourceDigests,
  }
}

function aggregateInputDigest(input: {
  contract: NeurodeContract
  externalDigest: string
  sourceDigests: Readonly<Record<string, string>>
  dependencyDigests: Readonly<Record<string, string>>
  seed: number | undefined
}): string {
  return `sha256:${sha256(
    stableJsonStringify({
      schema: 'rnawiki/neurode-complete-input/v1',
      neurodeId: input.contract.id,
      neurodeVersion: input.contract.version,
      contractCacheDigest: input.contract.cacheDigest,
      externalDigest: input.externalDigest,
      sourceDigests: input.sourceDigests,
      dependencyDigests: input.dependencyDigests,
      seed: input.seed ?? null,
    }),
  )}`
}

export function neurodeCacheKey(input: {
  neurodeId: string
  neurodeVersion: string
  contractCacheDigest: string
  inputDigest: string
}): string {
  return `neurode_cache_${sha256(stableJsonStringify(input))}`
}

function initialNodeManifest(
  definition: NeurodeDefinition,
  dependencyIds: readonly string[],
): NeurodeNodeRunManifest {
  return {
    neurodeId: definition.contract.id,
    neurodeVersion: definition.contract.version,
    contractCacheDigest: definition.contract.cacheDigest,
    category: definition.contract.category,
    inputSchemaId: definition.contract.inputSchemaId,
    outputSchemaId: definition.contract.outputSchemaId,
    dependencyIds,
    status: 'BLOCKED',
    cacheStatus: 'NOT_ATTEMPTED',
    cacheKey: null,
    inputDigest: null,
    inputDigestComplete: false,
    outputDigest: null,
    recordsConsidered: null,
    recordsUsed: null,
    reasonCodes: [],
    startedAt: null,
    completedAt: null,
    failureCode: null,
  }
}

function validateCacheEntry(input: {
  entry: NeurodeCacheEntry
  contract: NeurodeContract
  inputDigest: string
}): { outputDigest: string; recordsUsed: number; reasonCodes: string[] } {
  const { entry, contract, inputDigest } = input
  try {
    if (
      entry.schema !== NEURODE_CACHE_ENTRY_SCHEMA ||
      entry.neurodeId !== contract.id ||
      entry.neurodeVersion !== contract.version ||
      entry.contractCacheDigest !== contract.cacheDigest ||
      entry.inputDigest !== inputDigest ||
      !Number.isSafeInteger(entry.recordsUsed) ||
      entry.recordsUsed < 0
    ) {
      throw new NodeFailure('CACHE_INTEGRITY_FAILED')
    }
    const outputDigest = neurodeOutputDigest(entry.output)
    if (entry.outputDigest !== outputDigest) throw new NodeFailure('CACHE_INTEGRITY_FAILED')
    return {
      outputDigest,
      recordsUsed: entry.recordsUsed,
      reasonCodes: validateReasonCodes(contract, entry.reasonCodes),
    }
  } catch (error) {
    throw new NodeFailure('CACHE_INTEGRITY_FAILED', { cause: error })
  }
}

export interface NeurodeRunnerOptions {
  graph: NeurodeGraph
  cache?: NeurodeCache
  clock?: () => Date
}

/** Sequential execution keeps observable ordering independent of scheduler timing. */
export class NeurodeRunner {
  readonly #graph: NeurodeGraph
  readonly #cache: NeurodeCache | undefined
  readonly #clock: () => Date

  constructor(options: NeurodeRunnerOptions) {
    this.#graph = options.graph
    this.#cache = options.cache
    this.#clock = options.clock ?? (() => new Date())
  }

  #now(): string {
    return this.#clock().toISOString()
  }

  async run(request: NeurodeRunRequest): Promise<NeurodeRunResult> {
    const plan = this.#graph.plan(request.requestedIds)
    const startedAt = this.#now()
    const outputs = new Map<string, unknown>()
    const outputDigests = new Map<string, string>()
    const nodes: NeurodeNodeRunManifest[] = []
    let failure: NodeFailure | undefined
    let failureCause: unknown

    for (let index = 0; index < plan.definitions.length; index += 1) {
      const definition = plan.definitions[index]
      if (definition === undefined) continue
      const contract = definition.contract
      const dependencyIds = this.#graph.dependenciesOf(contract.id)
      const base = initialNodeManifest(definition, dependencyIds)
      const nodeStartedAt = this.#now()
      let currentNode: NeurodeNodeRunManifest = { ...base, startedAt: nodeStartedAt }

      try {
        const input = request.inputs[contract.id]
        if (input === undefined) throw new NodeFailure('MISSING_INPUT')
        if (!Number.isSafeInteger(input.recordCount) || input.recordCount < 0) {
          throw new NodeFailure('INVALID_INPUT_COUNT')
        }
        if (input.recordCount === 0 && !contract.allowZeroInput) {
          throw new NodeFailure('ZERO_INPUT_NOT_ALLOWED')
        }
        currentNode = { ...currentNode, recordsConsidered: input.recordCount }

        const seed = resolveSeed(contract, request.seeds?.[contract.id])
        const completeness = inspectInputCompleteness(contract, input)
        const dependencyDigestRecord = Object.fromEntries(
          dependencyIds.map((id) => {
            const digest = outputDigests.get(id)
            if (digest === undefined) throw new NodeFailure('EXECUTION_FAILED')
            return [id, digest]
          }),
        )
        const inputDigest = completeness.complete
          ? aggregateInputDigest({
              contract,
              externalDigest: input.digest as string,
              sourceDigests: completeness.sourceDigests,
              dependencyDigests: dependencyDigestRecord,
              seed,
            })
          : null
        const cacheKey =
          inputDigest === null
            ? null
            : neurodeCacheKey({
                neurodeId: contract.id,
                neurodeVersion: contract.version,
                contractCacheDigest: contract.cacheDigest,
                inputDigest,
              })

        let cacheStatus: NeurodeCacheStatus =
          inputDigest === null
            ? 'BYPASSED_INCOMPLETE_INPUT'
            : this.#cache === undefined
              ? 'DISABLED'
              : 'MISS'
        currentNode = {
          ...currentNode,
          cacheStatus,
          cacheKey,
          inputDigest,
          inputDigestComplete: inputDigest !== null,
        }
        let output: unknown
        let outputDigest: string
        let recordsUsed: number
        let reasonCodes: string[]

        let cached: NeurodeCacheEntry | undefined
        if (this.#cache !== undefined && cacheKey !== null) {
          try {
            cached = await this.#cache.get(cacheKey)
          } catch (error) {
            throw new NodeFailure('CACHE_READ_FAILED', { cause: error })
          }
        }

        if (cached !== undefined && inputDigest !== null) {
          const checked = validateCacheEntry({ entry: cached, contract, inputDigest })
          try {
            definition.validateOutput?.(cached.output)
          } catch (error) {
            throw new NodeFailure('OUTPUT_VALIDATION_FAILED', { cause: error })
          }
          output = cached.output
          outputDigest = checked.outputDigest
          recordsUsed = checked.recordsUsed
          reasonCodes = checked.reasonCodes
          cacheStatus = 'HIT'
        } else {
          const resources = new ResourceScope()
          let executionResult:
            { output: unknown; recordsUsed: number; reasonCodes?: readonly string[] } | undefined
          let executionFailure: unknown
          try {
            executionResult = await definition.execute({
              input: input.value,
              dependencyOutputs: new Map(dependencyIds.map((id) => [id, outputs.get(id)] as const)),
              seed,
              resources,
            })
            if (
              !Number.isSafeInteger(executionResult.recordsUsed) ||
              executionResult.recordsUsed < 0
            ) {
              throw new NodeFailure('INVALID_EXECUTION_RESULT')
            }
            try {
              definition.validateOutput?.(executionResult.output)
            } catch (error) {
              throw new NodeFailure('OUTPUT_VALIDATION_FAILED', { cause: error })
            }
          } catch (error) {
            executionFailure = error
          }

          try {
            await resources.closeAll()
          } catch (error) {
            throw error instanceof NodeFailure
              ? error
              : new NodeFailure('RESOURCE_CLOSE_FAILED', { cause: error })
          }
          if (executionFailure !== undefined) {
            if (executionFailure instanceof NodeFailure) throw executionFailure
            throw new NodeFailure('EXECUTION_FAILED', { cause: executionFailure })
          }
          if (executionResult === undefined) throw new NodeFailure('INVALID_EXECUTION_RESULT')

          output = executionResult.output
          outputDigest = neurodeOutputDigest(output)
          recordsUsed = executionResult.recordsUsed
          reasonCodes = validateReasonCodes(contract, executionResult.reasonCodes ?? [])

          if (this.#cache !== undefined && cacheKey !== null && inputDigest !== null) {
            const entry: NeurodeCacheEntry = {
              schema: NEURODE_CACHE_ENTRY_SCHEMA,
              neurodeId: contract.id,
              neurodeVersion: contract.version,
              contractCacheDigest: contract.cacheDigest,
              inputDigest,
              outputDigest,
              output,
              recordsUsed,
              reasonCodes,
            }
            try {
              await this.#cache.set(cacheKey, entry)
            } catch (error) {
              throw new NodeFailure('CACHE_WRITE_FAILED', { cause: error })
            }
          }
        }

        outputs.set(contract.id, output)
        outputDigests.set(contract.id, outputDigest)
        nodes.push({
          ...currentNode,
          status: cacheStatus === 'HIT' ? 'CACHED' : 'SUCCEEDED',
          cacheStatus,
          cacheKey,
          inputDigest,
          inputDigestComplete: inputDigest !== null,
          outputDigest,
          recordsConsidered: input.recordCount,
          recordsUsed,
          reasonCodes,
          startedAt: nodeStartedAt,
          completedAt: this.#now(),
        })
      } catch (error) {
        failure =
          error instanceof NodeFailure
            ? error
            : new NodeFailure('EXECUTION_FAILED', { cause: error })
        failureCause = error
        nodes.push({
          ...currentNode,
          status: 'FAILED',
          startedAt: nodeStartedAt,
          completedAt: this.#now(),
          failureCode: failure.code,
        })
        for (const blocked of plan.definitions.slice(index + 1)) {
          nodes.push(initialNodeManifest(blocked, this.#graph.dependenciesOf(blocked.contract.id)))
        }
        break
      }
    }

    if (this.#cache?.close !== undefined) {
      try {
        await this.#cache.close()
      } catch (error) {
        if (failure === undefined) {
          failure = new NodeFailure('CACHE_CLOSE_FAILED', { cause: error })
          failureCause = error
        }
      }
    }

    const manifest = createNeurodeRunManifest({
      status: failure === undefined ? 'SUCCEEDED' : 'FAILED',
      failureCode: failure?.code ?? null,
      requestedNeurodeIds: plan.requestedIds,
      plannedNeurodeIds: plan.definitions.map((definition) => definition.contract.id),
      startedAt,
      completedAt: this.#now(),
      nodes,
    })
    if (failure !== undefined) {
      throw new NeurodeRunError(failure.code, manifest, { cause: failureCause ?? failure })
    }
    return { outputs, manifest }
  }
}
