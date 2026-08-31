import { describe, expect, it } from 'vitest'

import type { DatasetAgent } from '@/lib/agents/core/types'
import type { RegisteredDatasetAgent } from '@/scripts/agents/registry'
import {
  NeurodeContractError,
  validateNeurodeContract,
  type NeurodeContract,
  type NeurodeDefinition,
  type NeurodeDependency,
} from '@/lib/neurodes/contracts'
import { NeurodeGraph, NeurodeGraphError } from '@/lib/neurodes/graph'
import {
  adaptDatasetAgent,
  adaptOperationalDatasetAgent,
  NeurodeRegistry,
  NeurodeRegistryError,
} from '@/lib/neurodes/registry'
import {
  NEURODE_CACHE_ENTRY_SCHEMA,
  NeurodeRunError,
  NeurodeRunner,
  neurodeOutputDigest,
  type NeurodeCache,
  type NeurodeCacheEntry,
  type NeurodeInputEnvelope,
} from '@/lib/neurodes/runner'
import { serializeNeurodeRunManifest } from '@/lib/neurodes/run-manifest'
import { currentAgentInputDigest } from '@/scripts/agents/current-run'
import { REGISTERED_DATASET_AGENTS } from '@/scripts/agents/registry'

const DIGEST_A = `sha256:${'a'.repeat(64)}`
const DIGEST_B = `sha256:${'b'.repeat(64)}`
const FIXED_TIME = new Date('2026-08-31T00:00:00.000Z')

function contract(id: string, overrides: Partial<NeurodeContract> = {}): NeurodeContract {
  return {
    id,
    version: '1.0.0',
    purpose: `Compute inert fixture output for ${id}.`,
    owner: 'RNAWiki maintainers',
    category: 'DATA_QUALITY_DETECTOR',
    inputSchemaId: `test/${id}-input/v1`,
    outputSchemaId: `test/${id}-output/v1`,
    dependencies: [],
    sourceRequirements: [],
    inputContent: { authored: 'READ_ONLY', fetched: 'NONE' },
    seedPolicy: { mode: 'NONE' },
    cacheDigest: DIGEST_A,
    reasonCodes: [],
    visibility: 'PRIVATE',
    medicalBoundary: {
      llmRuntime: false,
      authorsMedicalClaims: false,
      rewritesMedicalContent: false,
      selectsSources: false,
      resolvesSourceDisagreements: false,
      changesMedicalConclusions: false,
      namesPatientActions: false,
      outputKind: 'OPERATIONAL_RECORD',
    },
    consumers: ['unit-test'],
    outputPath: `memory:${id}`,
    tests: ['tests/unit/neurodes/framework.test.ts'],
    limitations: [],
    allowZeroInput: false,
    ...overrides,
  }
}

function definition(
  id: string,
  options: {
    dependencies?: readonly NeurodeDependency[]
    outputSchemaId?: string
    execute?: NeurodeDefinition['execute']
    contract?: Partial<NeurodeContract>
  } = {},
): NeurodeDefinition {
  return {
    contract: contract(id, {
      ...options.contract,
      dependencies: options.dependencies ?? options.contract?.dependencies ?? [],
      outputSchemaId:
        options.outputSchemaId ?? options.contract?.outputSchemaId ?? `test/${id}-output/v1`,
    }),
    execute:
      options.execute ??
      (({ input }) => ({
        output: { id, input },
        recordsUsed: 1,
      })),
  }
}

function completeInput(
  value: unknown = { value: 1 },
  overrides: Partial<NeurodeInputEnvelope> = {},
): NeurodeInputEnvelope {
  return {
    value,
    recordCount: 1,
    digest: DIGEST_B,
    digestComplete: true,
    ...overrides,
  }
}

async function rejectedRun(promise: Promise<unknown>): Promise<NeurodeRunError> {
  try {
    await promise
  } catch (error) {
    expect(error).toBeInstanceOf(NeurodeRunError)
    return error as NeurodeRunError
  }
  throw new Error('Expected the neurode run to reject.')
}

class MemoryCache implements NeurodeCache {
  readonly entries: Map<string, NeurodeCacheEntry>
  gets = 0
  sets = 0
  closes = 0

  constructor(entries: ReadonlyMap<string, NeurodeCacheEntry> = new Map()) {
    this.entries = new Map(entries)
  }

  get(key: string): NeurodeCacheEntry | undefined {
    this.gets += 1
    return this.entries.get(key)
  }

  set(key: string, entry: NeurodeCacheEntry): void {
    this.sets += 1
    this.entries.set(key, entry)
  }

  close(): void {
    this.closes += 1
  }
}

describe('neurode contracts and registry', () => {
  it('changes operational run identity when the committed implementation digest changes', () => {
    const registration = REGISTERED_DATASET_AGENTS[0]
    expect(registration).toBeDefined()
    const base = {
      registration: registration!,
      corpusDigest: 'c'.repeat(64),
      runDate: '2026-08-31',
      seed: 20260828,
    }

    expect(currentAgentInputDigest({ ...base, implementationDigest: 'a'.repeat(64) })).not.toBe(
      currentAgentInputDigest({ ...base, implementationDigest: 'b'.repeat(64) }),
    )
  })

  it('requires explicit deterministic, provenance, visibility, and medical-boundary metadata', () => {
    const value = contract('coverage-ledger')
    expect(() => validateNeurodeContract(value)).not.toThrow()

    const unsafe = {
      ...value,
      medicalBoundary: { ...value.medicalBoundary, llmRuntime: true },
    } as unknown as NeurodeContract
    expect(() => validateNeurodeContract(unsafe)).toThrowError(
      expect.objectContaining<Partial<NeurodeContractError>>({
        code: 'INVALID_MEDICAL_BOUNDARY',
      }),
    )
  })

  it('rejects unstable ids, non-SemVer versions, invalid digests, and duplicate reason codes', () => {
    for (const value of [
      contract('Not Stable'),
      contract('stable-id', { version: 'v1' }),
      contract('stable-id', { cacheDigest: 'abc' }),
      contract('stable-id', { reasonCodes: ['COVERAGE_GAP', 'COVERAGE_GAP'] }),
    ]) {
      expect(() => validateNeurodeContract(value)).toThrow(NeurodeContractError)
    }
  })

  it('rejects duplicate stable identities before a graph can bind them', () => {
    expect(() => new NeurodeRegistry([definition('same-id'), definition('same-id')])).toThrowError(
      expect.objectContaining<Partial<NeurodeRegistryError>>({ code: 'DUPLICATE_NEURODE_ID' }),
    )
  })

  it('adapts the existing DatasetAgent contract without altering the agent', async () => {
    const agent: DatasetAgent<{ rows: number }> = {
      name: 'existing-agent',
      version: '1.2.3',
      description: 'Count recorded corpus rows.',
      run(input) {
        return {
          agent: this.name,
          version: this.version,
          runDate: input.runDate,
          seed: input.seed,
          parameters: {},
          coverage: { considered: input.corpus.length, used: input.corpus.length, reason: 'all' },
          output: { rows: input.corpus.length },
          caveats: [],
        }
      },
    }
    const adapted = adaptDatasetAgent(agent, {
      ...contract('placeholder'),
      category: 'DATA_QUALITY_DETECTOR',
      inputSchemaId: 'rnawiki/agent-corpus/v1',
      outputSchemaId: 'rnawiki/agent-run/v1',
      seedPolicy: { mode: 'FIXED', seed: 7 },
      cacheDigest: DIGEST_A,
      outputPath: 'data/agents/existing-agent.json',
      reasonCodes: [],
    })
    const originalRun = agent.run
    const result = await adapted.execute({
      input: { corpus: [], seed: 7, runDate: '2026-08-31' },
      dependencyOutputs: new Map(),
      seed: 7,
      resources: { use: (resource) => resource },
    })

    expect(adapted.contract).toMatchObject({
      id: 'existing-agent',
      version: '1.2.3',
      purpose: 'Count recorded corpus rows.',
    })
    expect(result.output.output).toEqual({ rows: 0 })
    expect(result.recordsUsed).toBe(0)
    expect(agent.run).toBe(originalRun)
    expect(new NeurodeRegistry([adapted]).require('existing-agent')).toBe(adapted)
  })

  it('consumes the current operational registration without treating corpus fields as graph ids', async () => {
    const agent: DatasetAgent<{ rows: number }> = {
      name: 'operational-agent',
      version: '2.0.0',
      description: 'Count inert fixture rows.',
      run(input) {
        return {
          agent: this.name,
          version: this.version,
          runDate: input.runDate,
          seed: input.seed,
          parameters: {},
          coverage: { considered: input.corpus.length, used: input.corpus.length, reason: 'all' },
          output: { rows: input.corpus.length },
          caveats: [],
        }
      },
    }
    const registration = {
      agent,
      reasonSchemaVersion: '1',
      evidenceIdentityVersion: '1',
      category: 'PUBLIC_AGGREGATE',
      implementationFiles: ['tests/unit/neurodes/framework.test.ts'],
      tests: ['tests/unit/neurodes/framework.test.ts'],
      dependencies: ['recorded-background.mechanism'],
      sourceRequirements: ['all recorded source attachments and provenance tier'],
      consumers: ['documented_internal_report'],
      reviewPolicy: {},
      allowZeroCandidates: true,
      findingCount: (output) =>
        typeof (output as { rows?: unknown }).rows === 'number'
          ? (output as { rows: number }).rows
          : 0,
    } satisfies RegisteredDatasetAgent
    const adapted = adaptOperationalDatasetAgent(registration, {
      owner: 'RNAWiki maintainers',
      implementationCacheDigest: DIGEST_A,
      tests: ['tests/unit/neurodes/framework.test.ts'],
      limitations: ['Fixture only.'],
      seedPolicy: { mode: 'FIXED', seed: 7 },
    })

    expect(adapted.contract).toMatchObject({
      id: 'operational-agent',
      dependencies: [],
      outputPath: 'data/agents/current/operational-agent.json',
      consumers: ['documented_internal_report'],
      allowZeroInput: false,
    })
    expect(
      adapted.contract.sourceRequirements.map((requirement) => requirement.origin).sort(),
    ).toEqual(['AUTHORED', 'FETCHED'])
    expect(
      adapted.contract.sourceRequirements.every((requirement) =>
        /^agent-(?:dependency|source)-[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{12}$/u.test(requirement.id),
      ),
    ).toBe(true)
    expect(adapted.contract.cacheDigest).toMatch(/^sha256:[0-9a-f]{64}$/u)
    expect(
      (
        await adapted.execute({
          input: { corpus: [], seed: 7, runDate: '2026-08-31' },
          dependencyOutputs: new Map(),
          seed: 7,
          resources: { use: (resource) => resource },
        })
      ).output.output,
    ).toEqual({ rows: 0 })
  })
})

describe('neurode dependency graph', () => {
  it('uses the same deterministic topological order regardless of registration order', () => {
    const rootA = definition('root-a')
    const rootB = definition('root-b')
    const merge = definition('merge', {
      dependencies: [
        { selector: 'NEURODE_ID', neurodeId: 'root-b' },
        { selector: 'NEURODE_ID', neurodeId: 'root-a' },
      ],
    })
    const tail = definition('tail', {
      dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'merge' }],
    })

    expect(new NeurodeGraph([tail, rootB, merge, rootA]).topologicalIds()).toEqual([
      'root-a',
      'root-b',
      'merge',
      'tail',
    ])
    expect(new NeurodeGraph([rootA, merge, tail, rootB]).topologicalIds()).toEqual([
      'root-a',
      'root-b',
      'merge',
      'tail',
    ])
  })

  it('builds a dependency-closed partial rerun without adding downstream consumers', () => {
    const graph = new NeurodeGraph([
      definition('source'),
      definition('analysis', {
        dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'source' }],
      }),
      definition('publication', {
        dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'analysis' }],
      }),
      definition('unrelated'),
    ])

    expect(graph.plan(['analysis']).definitions.map((node) => node.contract.id)).toEqual([
      'source',
      'analysis',
    ])
  })

  it('rejects duplicate and missing dependencies rather than choosing silently', () => {
    expect(() => new NeurodeGraph([definition('same'), definition('same')])).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'DUPLICATE_NEURODE_ID' }),
    )
    expect(
      () =>
        new NeurodeGraph([
          definition('consumer', {
            dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'missing' }],
          }),
        ]),
    ).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'MISSING_DEPENDENCY' }),
    )
  })

  it('rejects ambiguous schema dependencies and two selectors resolving to one producer', () => {
    const providerA = definition('provider-a', { outputSchemaId: 'shared/output/v1' })
    const providerB = definition('provider-b', { outputSchemaId: 'shared/output/v1' })
    expect(
      () =>
        new NeurodeGraph([
          providerA,
          providerB,
          definition('consumer', {
            dependencies: [{ selector: 'OUTPUT_SCHEMA', outputSchemaId: 'shared/output/v1' }],
          }),
        ]),
    ).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'AMBIGUOUS_DEPENDENCY' }),
    )

    expect(
      () =>
        new NeurodeGraph([
          providerA,
          definition('consumer', {
            dependencies: [
              { selector: 'NEURODE_ID', neurodeId: 'provider-a' },
              { selector: 'OUTPUT_SCHEMA', outputSchemaId: 'shared/output/v1' },
            ],
          }),
        ]),
    ).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'DUPLICATE_DEPENDENCY' }),
    )
  })

  it('rejects cycles, including a self-dependency', () => {
    expect(
      () =>
        new NeurodeGraph([
          definition('alpha', {
            dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'bravo' }],
          }),
          definition('bravo', {
            dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'alpha' }],
          }),
        ]),
    ).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'DEPENDENCY_CYCLE' }),
    )
    expect(
      () =>
        new NeurodeGraph([
          definition('self', {
            dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'self' }],
          }),
        ]),
    ).toThrowError(
      expect.objectContaining<Partial<NeurodeGraphError>>({ code: 'DEPENDENCY_CYCLE' }),
    )
  })
})

describe('neurode runner', () => {
  it('runs a dependency-closed plan in order and emits a parseable deterministic manifest', async () => {
    const calls: string[] = []
    const source = definition('source', {
      execute: ({ input }) => {
        calls.push('source')
        return { output: { normalized: input }, recordsUsed: 2 }
      },
    })
    const consumer = definition('consumer', {
      dependencies: [{ selector: 'NEURODE_ID', neurodeId: 'source' }],
      execute: ({ dependencyOutputs }) => {
        calls.push('consumer')
        return { output: dependencyOutputs.get('source'), recordsUsed: 2 }
      },
    })
    const graph = new NeurodeGraph([consumer, source, definition('not-requested')])
    const result = await new NeurodeRunner({ graph, clock: () => FIXED_TIME }).run({
      requestedIds: ['consumer'],
      inputs: {
        source: completeInput({ rows: 2 }, { recordCount: 2 }),
        consumer: completeInput(null, { recordCount: 2 }),
      },
    })

    expect(calls).toEqual(['source', 'consumer'])
    expect(result.manifest.plannedNeurodeIds).toEqual(['source', 'consumer'])
    expect(result.manifest.nodes.map((node) => node.neurodeId)).toEqual(['source', 'consumer'])
    expect(result.manifest.nodes.map((node) => node.status)).toEqual(['SUCCEEDED', 'SUCCEEDED'])
    expect(result.manifest.runId).toMatch(/^neurode_run_[0-9a-f]{64}$/u)
    expect(JSON.parse(serializeNeurodeRunManifest(result.manifest))).toEqual(result.manifest)

    const rerun = await new NeurodeRunner({ graph, clock: () => FIXED_TIME }).run({
      requestedIds: ['consumer'],
      inputs: {
        source: completeInput({ rows: 2 }, { recordCount: 2 }),
        consumer: completeInput(null, { recordCount: 2 }),
      },
    })
    expect(serializeNeurodeRunManifest(rerun.manifest)).toBe(
      serializeNeurodeRunManifest(result.manifest),
    )
  })

  it('uses a cache entry only when the full input identity is complete', async () => {
    let executions = 0
    const node = definition('cacheable', {
      execute: () => {
        executions += 1
        return { output: { b: 2, a: 1 }, recordsUsed: 1 }
      },
    })
    const graph = new NeurodeGraph([node])
    const firstCache = new MemoryCache()
    const first = await new NeurodeRunner({
      graph,
      cache: firstCache,
      clock: () => FIXED_TIME,
    }).run({ inputs: { cacheable: completeInput() } })

    expect(first.manifest.nodes[0]?.cacheStatus).toBe('MISS')
    expect(firstCache).toMatchObject({ gets: 1, sets: 1, closes: 1 })
    expect(executions).toBe(1)

    const secondCache = new MemoryCache(firstCache.entries)
    const second = await new NeurodeRunner({
      graph,
      cache: secondCache,
      clock: () => FIXED_TIME,
    }).run({ inputs: { cacheable: completeInput() } })

    expect(second.manifest.nodes[0]?.status).toBe('CACHED')
    expect(second.manifest.nodes[0]?.cacheStatus).toBe('HIT')
    expect(secondCache).toMatchObject({ gets: 1, sets: 0, closes: 1 })
    expect(executions).toBe(1)
    expect(second.outputs.get('cacheable')).toEqual({ a: 1, b: 2 })
    expect(neurodeOutputDigest({ a: 1, b: 2 })).toBe(neurodeOutputDigest({ b: 2, a: 1 }))
  })

  it('bypasses cache when a required source component is absent or input is marked partial', async () => {
    const cache = new MemoryCache()
    let executions = 0
    const node = definition('source-aware', {
      contract: {
        sourceRequirements: [
          {
            id: 'recorded-corpus',
            schemaId: 'rnawiki/recorded-corpus/v1',
            origin: 'AUTHORED',
            visibility: 'PRIVATE',
            requiredForCompleteInput: true,
          },
        ],
      },
      execute: () => ({ output: { execution: (executions += 1) }, recordsUsed: 1 }),
    })
    const first = await new NeurodeRunner({
      graph: new NeurodeGraph([node]),
      cache,
      clock: () => FIXED_TIME,
    }).run({ inputs: { 'source-aware': completeInput() } })

    expect(first.manifest.nodes[0]).toMatchObject({
      cacheStatus: 'BYPASSED_INCOMPLETE_INPUT',
      inputDigest: null,
      inputDigestComplete: false,
    })
    expect(cache).toMatchObject({ gets: 0, sets: 0, closes: 1 })
    expect(executions).toBe(1)

    const partialCache = new MemoryCache()
    const second = await new NeurodeRunner({
      graph: new NeurodeGraph([node]),
      cache: partialCache,
      clock: () => FIXED_TIME,
    }).run({
      inputs: {
        'source-aware': completeInput(undefined, {
          digestComplete: false,
          sourceDigests: { 'recorded-corpus': DIGEST_A },
        }),
      },
    })
    expect(second.manifest.nodes[0]?.cacheStatus).toBe('BYPASSED_INCOMPLETE_INPUT')
    expect(partialCache).toMatchObject({ gets: 0, sets: 0, closes: 1 })

    const completeCache = new MemoryCache()
    const third = await new NeurodeRunner({
      graph: new NeurodeGraph([node]),
      cache: completeCache,
      clock: () => FIXED_TIME,
    }).run({
      inputs: {
        'source-aware': completeInput(undefined, {
          sourceDigests: { 'recorded-corpus': DIGEST_A },
        }),
      },
    })
    expect(third.manifest.nodes[0]).toMatchObject({
      cacheStatus: 'MISS',
      inputDigestComplete: true,
    })
    expect(completeCache).toMatchObject({ gets: 1, sets: 1, closes: 1 })
  })

  it('rejects an unexpected empty input before execution, but permits an explicit empty node', async () => {
    let executed = false
    const nonempty = definition('nonempty', {
      execute: () => {
        executed = true
        return { output: [], recordsUsed: 0 }
      },
    })
    const cache = new MemoryCache()
    const error = await rejectedRun(
      new NeurodeRunner({
        graph: new NeurodeGraph([nonempty]),
        cache,
        clock: () => FIXED_TIME,
      }).run({ inputs: { nonempty: completeInput([], { recordCount: 0 }) } }),
    )
    expect(error.code).toBe('ZERO_INPUT_NOT_ALLOWED')
    expect(error.manifest.nodes[0]).toMatchObject({
      status: 'FAILED',
      failureCode: 'ZERO_INPUT_NOT_ALLOWED',
    })
    expect(executed).toBe(false)
    expect(cache.closes).toBe(1)

    const emptyAllowed = definition('empty-allowed', {
      contract: { allowZeroInput: true },
      execute: () => ({ output: [], recordsUsed: 0 }),
    })
    const result = await new NeurodeRunner({
      graph: new NeurodeGraph([emptyAllowed]),
      clock: () => FIXED_TIME,
    }).run({ inputs: { 'empty-allowed': completeInput([], { recordCount: 0 }) } })
    expect(result.manifest.status).toBe('SUCCEEDED')
  })

  it('closes registered resources in reverse order after success and failure', async () => {
    const successEvents: string[] = []
    const success = definition('resource-success', {
      execute: ({ resources }) => {
        successEvents.push('execute')
        resources.use({
          close: () => {
            successEvents.push('close-one')
          },
        })
        resources.use({
          close: () => {
            successEvents.push('close-two')
          },
        })
        return { output: { ok: true }, recordsUsed: 1 }
      },
    })
    await new NeurodeRunner({
      graph: new NeurodeGraph([success]),
      clock: () => FIXED_TIME,
    }).run({ inputs: { 'resource-success': completeInput() } })
    expect(successEvents).toEqual(['execute', 'close-two', 'close-one'])

    const failureEvents: string[] = []
    const failure = definition('resource-failure', {
      execute: ({ resources }) => {
        resources.use({
          close: () => {
            failureEvents.push('close-one')
          },
        })
        resources.use({
          close: () => {
            failureEvents.push('close-two')
          },
        })
        throw new Error('inert fixture failure')
      },
    })
    const error = await rejectedRun(
      new NeurodeRunner({
        graph: new NeurodeGraph([failure]),
        clock: () => FIXED_TIME,
      }).run({ inputs: { 'resource-failure': completeInput() } }),
    )
    expect(error.code).toBe('EXECUTION_FAILED')
    expect(failureEvents).toEqual(['close-two', 'close-one'])
  })

  it('attempts every resource close even when one close fails', async () => {
    const events: string[] = []
    const node = definition('close-failure', {
      execute: ({ resources }) => {
        resources.use({
          close: () => {
            events.push('close-one')
          },
        })
        resources.use({
          close: () => {
            events.push('close-two')
            throw new Error('inert close failure')
          },
        })
        return { output: { ok: true }, recordsUsed: 1 }
      },
    })
    const error = await rejectedRun(
      new NeurodeRunner({
        graph: new NeurodeGraph([node]),
        clock: () => FIXED_TIME,
      }).run({ inputs: { 'close-failure': completeInput() } }),
    )

    expect(error.code).toBe('RESOURCE_CLOSE_FAILED')
    expect(events).toEqual(['close-two', 'close-one'])
  })

  it('rejects cache collisions and never exposes their payload as a successful output', async () => {
    const node = definition('collision-safe')
    const graph = new NeurodeGraph([node])
    const primingCache = new MemoryCache()
    await new NeurodeRunner({
      graph,
      cache: primingCache,
      clock: () => FIXED_TIME,
    }).run({ inputs: { 'collision-safe': completeInput() } })
    const [key, valid] = [...primingCache.entries][0] ?? []
    expect(key).toBeDefined()
    expect(valid).toBeDefined()
    const corrupt: NeurodeCacheEntry = {
      ...(valid as NeurodeCacheEntry),
      schema: NEURODE_CACHE_ENTRY_SCHEMA,
      output: { changed: true },
    }
    const error = await rejectedRun(
      new NeurodeRunner({
        graph,
        cache: new MemoryCache(new Map([[key as string, corrupt]])),
        clock: () => FIXED_TIME,
      }).run({ inputs: { 'collision-safe': completeInput() } }),
    )
    expect(error.code).toBe('CACHE_INTEGRITY_FAILED')
  })

  it('rejects undeclared reason codes and non-JSON output', async () => {
    const undeclared = definition('undeclared', {
      execute: () => ({ output: {}, recordsUsed: 1, reasonCodes: ['NOT_DECLARED'] }),
    })
    expect(
      (
        await rejectedRun(
          new NeurodeRunner({
            graph: new NeurodeGraph([undeclared]),
            clock: () => FIXED_TIME,
          }).run({ inputs: { undeclared: completeInput() } }),
        )
      ).code,
    ).toBe('UNDECLARED_REASON_CODE')

    const nonJson = definition('non-json', {
      execute: () => ({ output: { missing: undefined }, recordsUsed: 1 }),
    })
    expect(
      (
        await rejectedRun(
          new NeurodeRunner({
            graph: new NeurodeGraph([nonJson]),
            clock: () => FIXED_TIME,
          }).run({ inputs: { 'non-json': completeInput() } }),
        )
      ).code,
    ).toBe('NON_JSON_OUTPUT')
  })
})
