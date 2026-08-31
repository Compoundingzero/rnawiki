import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  authoredStrings,
  findForbiddenPhrases,
  type AgentCorpusEntry,
  type AgentRun,
  type ReviewCandidateIndexEntry,
} from '@/lib/agents/core/types'
import { candidateKey } from '@/lib/agents/core/identity'
import { valueDigest } from '@/lib/agents/core/identity'
import type { NeurodeContract } from '@/lib/neurodes/contracts'
import { NeurodeGraph } from '@/lib/neurodes/graph'
import { adaptOperationalDatasetAgent, NeurodeRegistry } from '@/lib/neurodes/registry'
import type { NeurodeNodeRunManifest, NeurodeRunManifest } from '@/lib/neurodes/run-manifest'
import { NeurodeRunner } from '@/lib/neurodes/runner'
import {
  AGENT_RUN_SEED,
  REGISTERED_DATASET_AGENTS,
  type AgentAudienceLane,
  type AgentReviewSeverity,
  type RegisteredDatasetAgent,
} from './registry'

export const CURRENT_AGENT_RUN_SCHEMA = 'rnawiki-current-agent-run/v1' as const
export const CURRENT_AGENT_MANIFEST_SCHEMA = 'rnawiki-current-agent-manifest/v1' as const

export interface CurrentAgentRunArtifact {
  schema: typeof CURRENT_AGENT_RUN_SCHEMA
  historicalPreRepair: false
  eligibleForActiveReview: true
  corpus: { commit: string; digest: string }
  inputDigest: string
  neurode?: {
    contract: NeurodeContract
    node: NeurodeNodeRunManifest
  }
  review: {
    reasonSchemaVersion: string
    evidenceIdentityVersion: string
    policy: Record<string, { audienceLane: AgentAudienceLane; severity: AgentReviewSeverity }>
  }
  run: ReturnType<RegisteredDatasetAgent['agent']['run']>
}

export interface CurrentAgentManifestEntry {
  agentId: string
  agentVersion: string
  reasonSchemaVersion: string
  evidenceIdentityVersion: string
  path: string
  dependencies: readonly string[]
  sourceRequirements: readonly string[]
  implementationFiles?: readonly string[]
  implementationDigest?: string
  inputDigest: string
  outputDigest: string
  /** Candidates retained as full evidence-bearing rows in the operational review queue. */
  candidateCount: number
  /** Complete eligible universe before any declared deterministic sampling. */
  availableCandidateCount: number
  candidateSelectionMode: 'complete' | 'sampled'
  findingCount: number
  candidateReasons: readonly string[]
  consumers: RegisteredDatasetAgent['consumers']
  limitations: readonly string[]
  allowZeroCandidates: boolean
  neurodeContract?: NeurodeContract
}

export interface CurrentAgentManifest {
  schema: typeof CURRENT_AGENT_MANIFEST_SCHEMA
  historicalPreRepair: false
  eligibleForActiveReview: true
  corpusCommit: string
  corpusDigest: string
  generatedAt: string
  runDate: string
  seed: number
  records: number
  neurodeRunManifest?: NeurodeRunManifest
  artifacts: readonly CurrentAgentManifestEntry[]
  totals: { candidates: number; findings: number }
}

export interface GeneratedCurrentAgents {
  files: ReadonlyMap<string, string>
  manifest: CurrentAgentManifest
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export function datasetAgentImplementationDigest(
  registration: RegisteredDatasetAgent,
  root = process.cwd(),
): string {
  return valueDigest({
    schema: 'rnawiki/dataset-agent-implementation/v1',
    files: [...registration.implementationFiles].sort(compareText).map((path) => ({
      path,
      digest: sha256(readFileSync(join(root, path), 'utf8')),
    })),
  })
}

export function currentAgentInputDigest(input: {
  registration: RegisteredDatasetAgent
  implementationDigest: string
  corpusDigest: string
  runDate: string
  seed: number
}): string {
  return valueDigest({
    schema: CURRENT_AGENT_RUN_SCHEMA,
    corpusDigest: input.corpusDigest,
    runDate: input.runDate,
    seed: input.seed,
    agentId: input.registration.agent.name,
    agentVersion: input.registration.agent.version,
    reasonSchemaVersion: input.registration.reasonSchemaVersion,
    evidenceIdentityVersion: input.registration.evidenceIdentityVersion,
    implementationDigest: input.implementationDigest,
    dependencies: input.registration.dependencies,
    sourceRequirements: input.registration.sourceRequirements,
  })
}

function serialized(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/** Code-point ordering is identical on every host; locale collation is not. */
function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function validateCommit(commit: string): void {
  if (!/^[0-9a-f]{40}$/u.test(commit)) {
    throw new Error(
      `Corpus commit must be a full 40-character Git SHA, got ${JSON.stringify(commit)}`,
    )
  }
}

function validateRunDate(runDate: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(runDate)) {
    throw new Error(`Run date must be YYYY-MM-DD, got ${JSON.stringify(runDate)}`)
  }
}

function indexedCandidateKey(input: {
  agentName: string
  reasonSchemaVersion: string
  candidate: ReviewCandidateIndexEntry
}): string {
  return candidateKey({
    agent: input.agentName,
    reasonSchemaVersion: input.reasonSchemaVersion,
    subjectType: 'medicine',
    subjectId: input.candidate.slug,
    fieldPath: input.candidate.fieldPath,
    reason: input.candidate.reason,
  })
}

export interface CandidateSelectionSummary {
  mode: 'complete' | 'sampled'
  availableCandidates: number
  retainedCandidates: number
}

/**
 * Proves that a bounded review queue names its complete eligible universe instead of silently
 * presenting a sample as the whole result. Exported so package loading applies the same contract.
 */
export function validateQueueSelectionContract(input: {
  agentName: string
  reasonSchemaVersion: string
  run: Pick<AgentRun<unknown>, 'queue' | 'queueSelection' | 'seed'>
}): CandidateSelectionSummary {
  const queue = input.run.queue ?? []
  const selection = input.run.queueSelection
  if (!selection) {
    return {
      mode: 'complete',
      availableCandidates: queue.length,
      retainedCandidates: queue.length,
    }
  }

  if (
    selection.mode !== 'sampled' ||
    selection.availableCandidates !== selection.completeCandidateIndex.length ||
    selection.retainedCandidates !== queue.length ||
    selection.retainedCandidates <= 0 ||
    selection.availableCandidates <= selection.retainedCandidates ||
    selection.seed !== input.run.seed ||
    selection.selectionRule.trim().length === 0 ||
    selection.retrieval.trim().length === 0
  ) {
    throw new Error(`${input.agentName} has an inconsistent sampled queue audit`)
  }

  const indexed = new Map<string, ReviewCandidateIndexEntry>()
  for (const [index, candidate] of selection.completeCandidateIndex.entries()) {
    if (
      !candidate.slug.trim() ||
      !candidate.fieldPath.trim() ||
      !Number.isFinite(candidate.priority)
    ) {
      throw new Error(`${input.agentName} sampled candidate index ${index} is invalid`)
    }
    const key = indexedCandidateKey({
      agentName: input.agentName,
      reasonSchemaVersion: input.reasonSchemaVersion,
      candidate,
    })
    if (indexed.has(key)) {
      throw new Error(
        `${input.agentName} sampled candidate index contains duplicate identity ${key}`,
      )
    }
    indexed.set(key, candidate)
  }

  for (const [index, candidate] of queue.entries()) {
    const key = indexedCandidateKey({
      agentName: input.agentName,
      reasonSchemaVersion: input.reasonSchemaVersion,
      candidate,
    })
    const indexedCandidate = indexed.get(key)
    if (!indexedCandidate || indexedCandidate.priority !== candidate.priority) {
      throw new Error(
        `${input.agentName} retained candidate ${index} is absent from its complete sampled index`,
      )
    }
  }

  return {
    mode: 'sampled',
    availableCandidates: selection.availableCandidates,
    retainedCandidates: selection.retainedCandidates,
  }
}

function validateCandidateContract(
  registration: RegisteredDatasetAgent,
  artifact: CurrentAgentRunArtifact,
): void {
  const seenConcepts = new Map<string, number>()
  for (const [index, candidate] of (artifact.run.queue ?? []).entries()) {
    if (!candidate.fieldPath.trim()) {
      throw new Error(`${registration.agent.name} candidate ${index} has no semantic fieldPath`)
    }
    if (!Number.isFinite(candidate.priority)) {
      throw new Error(`${registration.agent.name} candidate ${index} has a non-finite priority`)
    }
    if (candidate.evidence.schema !== 'agent-review-evidence/v2') {
      throw new Error(`${registration.agent.name} candidate ${index} has unsupported evidence`)
    }
    if (
      !candidate.evidence.identityObservation ||
      Object.keys(candidate.evidence.identityObservation).length === 0
    ) {
      throw new Error(`${registration.agent.name} candidate ${index} has no identity observation`)
    }
    if (!registration.reviewPolicy[candidate.reason]) {
      throw new Error(
        `${registration.agent.name} candidate ${index} has no routing policy for ${candidate.reason}`,
      )
    }
    const invalidSource = candidate.sources.find((source) => !/^[A-Z][A-Z0-9_]*:.+/u.test(source))
    if (invalidSource) {
      throw new Error(
        `${registration.agent.name} candidate ${index} has a non-canonical source key: ${invalidSource}`,
      )
    }
    const evidenceSourceKeys = new Set(
      candidate.evidence.sourceReadings.map((source) => {
        const canonicalKey = `${source.kind}:${source.identifier}`
        if (source.sourceKey !== canonicalKey) {
          throw new Error(
            `${registration.agent.name} candidate ${index} evidence source ${source.sourceKey} does not match ${canonicalKey}`,
          )
        }
        return source.sourceKey
      }),
    )
    const unboundSource = candidate.sources.find((source) => !evidenceSourceKeys.has(source))
    if (unboundSource) {
      throw new Error(
        `${registration.agent.name} candidate ${index} declares source ${unboundSource} without an exact evidence reading`,
      )
    }
    const concept = candidateKey({
      agent: registration.agent.name,
      reasonSchemaVersion: registration.reasonSchemaVersion,
      subjectType: 'medicine',
      subjectId: candidate.slug,
      fieldPath: candidate.fieldPath,
      reason: candidate.reason,
    })
    const previous = seenConcepts.get(concept)
    if (previous !== undefined) {
      throw new Error(
        `${registration.agent.name} candidates ${previous} and ${index} collapse to one conceptual identity (${candidate.slug} ${candidate.reason} ${candidate.fieldPath})`,
      )
    }
    seenConcepts.set(concept, index)
  }

  for (const [index, candidate] of (
    artifact.run.queueSelection?.completeCandidateIndex ?? []
  ).entries()) {
    if (!registration.reviewPolicy[candidate.reason]) {
      throw new Error(
        `${registration.agent.name} sampled candidate index ${index} has no routing policy for ${candidate.reason}`,
      )
    }
  }
}

export async function generateCurrentAgentRuns(input: {
  corpus: readonly AgentCorpusEntry[]
  corpusCommit: string
  runDate: string
  seed?: number
}): Promise<GeneratedCurrentAgents> {
  validateCommit(input.corpusCommit)
  validateRunDate(input.runDate)
  if (input.corpus.length === 0) {
    throw new Error('Current agent run received zero corpus records')
  }

  const seed = input.seed ?? AGENT_RUN_SEED
  const corpus = [...input.corpus].sort((left, right) => compareText(left.slug, right.slug))
  const corpusDigest = valueDigest(corpus)
  const files = new Map<string, string>()
  const artifacts: CurrentAgentManifestEntry[] = []
  const implementationDigests = new Map(
    REGISTERED_DATASET_AGENTS.map((registration) => [
      registration.agent.name,
      datasetAgentImplementationDigest(registration),
    ]),
  )
  const externalInputDigests = new Map(
    REGISTERED_DATASET_AGENTS.map((registration) => {
      const digest = implementationDigests.get(registration.agent.name)
      if (!digest) throw new Error(`${registration.agent.name} has no implementation digest`)
      return [
        registration.agent.name,
        currentAgentInputDigest({
          registration,
          implementationDigest: digest,
          corpusDigest,
          runDate: input.runDate,
          seed,
        }),
      ]
    }),
  )
  const definitions = REGISTERED_DATASET_AGENTS.map((registration) => {
    const digest = implementationDigests.get(registration.agent.name)
    if (!digest) throw new Error(`${registration.agent.name} has no implementation digest`)
    return adaptOperationalDatasetAgent(registration, {
      owner: 'RNAWiki maintainers',
      implementationCacheDigest: `sha256:${digest}`,
      tests: registration.tests,
      limitations: [
        'Coverage is bounded to the checked-in recorded-background corpus and the declared source requirements.',
      ],
      seedPolicy: { mode: 'FIXED', seed },
      visibility: registration.consumers.includes('public_dataset') ? 'PUBLIC' : 'PRIVATE',
    })
  })
  const registry = new NeurodeRegistry(definitions)
  const graph = new NeurodeGraph(registry.list())
  const runner = new NeurodeRunner({
    graph,
    // Generated packages use their canonical run date, never wall-clock scheduling time.
    clock: () => new Date(`${input.runDate}T00:00:00.000Z`),
  })
  const neurodeResult = await runner.run({
    inputs: Object.fromEntries(
      definitions.map((definition) => {
        const externalDigest = externalInputDigests.get(definition.contract.id)
        if (!externalDigest) throw new Error(`${definition.contract.id} has no input digest`)
        return [
          definition.contract.id,
          {
            value: { corpus, seed, runDate: input.runDate },
            recordCount: corpus.length,
            digest: `sha256:${externalDigest}`,
            digestComplete: true,
            sourceDigests: Object.fromEntries(
              definition.contract.sourceRequirements.map((requirement) => [
                requirement.id,
                `sha256:${valueDigest({
                  schema: requirement.schemaId,
                  corpusDigest,
                  requirementId: requirement.id,
                })}`,
              ]),
            ),
          },
        ]
      }),
    ),
  })
  const definitionById = new Map(
    definitions.map((definition) => [definition.contract.id, definition]),
  )
  const nodeById = new Map(neurodeResult.manifest.nodes.map((node) => [node.neurodeId, node]))

  for (const registration of REGISTERED_DATASET_AGENTS) {
    const { agent } = registration
    const inputDigest = externalInputDigests.get(agent.name)
    const implementation = implementationDigests.get(agent.name)
    const definition = definitionById.get(agent.name)
    const node = nodeById.get(agent.name)
    const run = neurodeResult.outputs.get(agent.name) as ReturnType<typeof agent.run> | undefined
    if (!inputDigest || !implementation || !definition || !node || !run) {
      throw new Error(`${agent.name} has an incomplete formal neurode run`)
    }
    if (run.coverage.considered === 0) {
      throw new Error(`${agent.name} unexpectedly considered zero records`)
    }
    const candidateCount = run.queue?.length ?? 0
    const selection = validateQueueSelectionContract({
      agentName: agent.name,
      reasonSchemaVersion: registration.reasonSchemaVersion,
      run,
    })
    if (candidateCount === 0 && !registration.allowZeroCandidates) {
      throw new Error(`${agent.name} unexpectedly emitted zero review candidates`)
    }

    const violations = authoredStrings({
      output: run.output,
      queue: run.queue,
      caveats: run.caveats,
    }).flatMap((text) => findForbiddenPhrases(text).map((pattern) => `${pattern} :: ${text}`))
    if (violations.length > 0) {
      throw new Error(
        `${agent.name} crossed the medical boundary: ${violations.slice(0, 3).join(' | ')}`,
      )
    }

    const artifact: CurrentAgentRunArtifact = {
      schema: CURRENT_AGENT_RUN_SCHEMA,
      historicalPreRepair: false,
      eligibleForActiveReview: true,
      corpus: { commit: input.corpusCommit, digest: corpusDigest },
      inputDigest,
      neurode: { contract: definition.contract, node },
      review: {
        reasonSchemaVersion: registration.reasonSchemaVersion,
        evidenceIdentityVersion: registration.evidenceIdentityVersion,
        policy: Object.fromEntries(
          Object.entries(registration.reviewPolicy).filter((entry) => entry[1] !== undefined),
        ) as CurrentAgentRunArtifact['review']['policy'],
      },
      run,
    }
    validateCandidateContract(registration, artifact)

    const relativePath = `${agent.name}.json`
    const bytes = serialized(artifact)
    files.set(relativePath, bytes)
    const findingCount = registration.findingCount(run.output)
    artifacts.push({
      agentId: agent.name,
      agentVersion: agent.version,
      reasonSchemaVersion: registration.reasonSchemaVersion,
      evidenceIdentityVersion: registration.evidenceIdentityVersion,
      path: `data/agents/current/${relativePath}`,
      dependencies: registration.dependencies,
      sourceRequirements: registration.sourceRequirements,
      implementationFiles: [...registration.implementationFiles].sort(compareText),
      implementationDigest: implementation,
      inputDigest,
      outputDigest: sha256(bytes),
      candidateCount,
      availableCandidateCount: selection.availableCandidates,
      candidateSelectionMode: selection.mode,
      findingCount,
      candidateReasons: [...new Set((run.queue ?? []).map((candidate) => candidate.reason))].sort(),
      consumers: registration.consumers,
      limitations: run.caveats,
      allowZeroCandidates: registration.allowZeroCandidates,
      neurodeContract: definition.contract,
    })
  }

  const totals = artifacts.reduce(
    (sum, artifact) => ({
      candidates: sum.candidates + artifact.candidateCount,
      findings: sum.findings + artifact.findingCount,
    }),
    { candidates: 0, findings: 0 },
  )
  const manifest: CurrentAgentManifest = {
    schema: CURRENT_AGENT_MANIFEST_SCHEMA,
    historicalPreRepair: false,
    eligibleForActiveReview: true,
    corpusCommit: input.corpusCommit,
    corpusDigest,
    // A supplied canonical run date is deterministic metadata. Wall-clock execution time belongs
    // in the operational worklog and is deliberately not mixed into reproducible artifacts.
    generatedAt: `${input.runDate}T00:00:00.000Z`,
    runDate: input.runDate,
    seed,
    records: corpus.length,
    neurodeRunManifest: neurodeResult.manifest,
    artifacts,
    totals,
  }
  files.set('manifest.json', serialized(manifest))
  return { files, manifest }
}

export function compareGeneratedRuns(
  left: GeneratedCurrentAgents,
  right: GeneratedCurrentAgents,
): string[] {
  const paths = [...new Set([...left.files.keys(), ...right.files.keys()])].sort()
  return paths.filter((path) => left.files.get(path) !== right.files.get(path))
}
