import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'

import { BACKGROUND_SOURCE_KINDS } from '@/lib/background/types'
import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import { valueDigest } from '@/lib/agents/core/identity'
import { REVIEW_REASONS } from '@/lib/agents/core/types'
import type { LoadedCurrentAgentPackage } from '@/lib/agents/persistence'
import { REGISTERED_DATASET_AGENTS } from './registry'
import {
  currentAgentInputDigest,
  datasetAgentImplementationDigest,
  validateQueueSelectionContract,
} from './current-run'
import type { CurrentAgentManifest, CurrentAgentRunArtifact } from './current-run'

const digestSchema = z.string().regex(/^[0-9a-f]{64}$/u)
const prefixedDigestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/u)
const neurodeCategorySchema = z.enum([
  'STRUCTURAL_VALIDATOR',
  'DATA_QUALITY_DETECTOR',
  'COVERAGE_DETECTOR',
  'CROSS_SOURCE_RELATION',
  'PRIORITIZATION_FEATURE',
  'PUBLIC_AGGREGATE',
])
const neurodeContractSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    purpose: z.string().min(1),
    owner: z.string().min(1),
    category: neurodeCategorySchema,
    inputSchemaId: z.string().min(1),
    outputSchemaId: z.string().min(1),
    dependencies: z.array(z.unknown()),
    sourceRequirements: z.array(z.unknown()),
    inputContent: z.object({
      authored: z.enum(['NONE', 'READ_ONLY']),
      fetched: z.enum(['NONE', 'READ_ONLY']),
    }),
    seedPolicy: z.object({ mode: z.string().min(1) }).passthrough(),
    cacheDigest: prefixedDigestSchema,
    reasonCodes: z.array(z.string()),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
    medicalBoundary: z.object({
      llmRuntime: z.literal(false),
      authorsMedicalClaims: z.literal(false),
      rewritesMedicalContent: z.literal(false),
      selectsSources: z.literal(false),
      resolvesSourceDisagreements: z.literal(false),
      changesMedicalConclusions: z.literal(false),
      namesPatientActions: z.literal(false),
      outputKind: z.string().min(1),
    }),
    consumers: z.array(z.string().min(1)).min(1),
    outputPath: z.string().min(1),
    tests: z.array(z.string().min(1)).min(1),
    limitations: z.array(z.string().min(1)),
    allowZeroInput: z.boolean(),
  })
  .passthrough()
const neurodeNodeSchema = z
  .object({
    neurodeId: z.string().min(1),
    neurodeVersion: z.string().min(1),
    contractCacheDigest: prefixedDigestSchema,
    category: neurodeCategorySchema,
    status: z.enum(['SUCCEEDED', 'CACHED', 'FAILED', 'BLOCKED']),
    inputDigest: prefixedDigestSchema.nullable(),
    inputDigestComplete: z.boolean(),
    outputDigest: prefixedDigestSchema.nullable(),
    recordsConsidered: z.number().int().nonnegative().nullable(),
    recordsUsed: z.number().int().nonnegative().nullable(),
  })
  .passthrough()
const neurodeRunManifestSchema = z
  .object({
    schema: z.literal('rnawiki/neurode-run-manifest/v1'),
    runId: z.string().min(1),
    status: z.literal('SUCCEEDED'),
    failureCode: z.null(),
    requestedNeurodeIds: z.array(z.string().min(1)),
    plannedNeurodeIds: z.array(z.string().min(1)),
    nodes: z.array(neurodeNodeSchema).min(1),
  })
  .passthrough()
const sourceSchema = z
  .object({
    sourceKey: z.string().min(3),
    kind: z.enum(BACKGROUND_SOURCE_KINDS),
    identifier: z.string().min(1),
    label: z.string().min(1),
    locator: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    effectiveDate: z.string().min(1).optional(),
    retrievedAt: z.string().min(1),
    excerpt: z.string().min(1).optional(),
  })
  .refine((source) => source.sourceKey === `${source.kind}:${source.identifier}`, {
    message: 'Evidence sourceKey must equal kind:identifier.',
    path: ['sourceKey'],
  })
const candidateSchema = z
  .object({
    slug: z.string().min(1),
    fieldPath: z.string().min(1),
    reason: z.enum(REVIEW_REASONS),
    question: z.string().min(1),
    priority: z.number().finite(),
    basis: z.string().min(1),
    sources: z.array(z.string()),
    evidence: z.object({
      schema: z.literal('agent-review-evidence/v2'),
      observation: z.record(z.unknown()),
      identityObservation: z.record(z.unknown()).refine((value) => Object.keys(value).length > 0),
      sourceReadings: z.array(sourceSchema),
    }),
  })
  .superRefine((candidate, context) => {
    const readingKeys = new Set(candidate.evidence.sourceReadings.map((source) => source.sourceKey))
    for (const [index, sourceKey] of candidate.sources.entries()) {
      if (!readingKeys.has(sourceKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Declared candidate source is missing from exact evidence readings.',
          path: ['sources', index],
        })
      }
    }
  })
const candidateIndexSchema = z.object({
  slug: z.string().min(1),
  fieldPath: z.string().min(1),
  reason: z.enum(REVIEW_REASONS),
  priority: z.number().finite(),
})
const artifactSchema = z.object({
  schema: z.literal('rnawiki-current-agent-run/v1'),
  historicalPreRepair: z.literal(false),
  eligibleForActiveReview: z.literal(true),
  corpus: z.object({ commit: z.string().regex(/^[0-9a-f]{40}$/u), digest: digestSchema }),
  inputDigest: digestSchema,
  neurode: z.object({
    contract: neurodeContractSchema,
    node: neurodeNodeSchema,
  }),
  review: z.object({
    reasonSchemaVersion: z.string().min(1),
    evidenceIdentityVersion: z.string().min(1),
    policy: z.record(
      z.object({
        audienceLane: z.enum(['ordinary', 'biotech', 'chemist', 'quantitative']),
        severity: z.enum(['low', 'medium', 'high', 'blocking']),
      }),
    ),
  }),
  run: z
    .object({
      agent: z.string().min(1),
      version: z.string().min(1),
      runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
      seed: z.number().int(),
      parameters: z.record(z.union([z.string(), z.number(), z.boolean()])),
      coverage: z.object({
        considered: z.number().int().positive(),
        used: z.number().int().nonnegative(),
        reason: z.string().min(1),
      }),
      output: z.unknown(),
      queue: z.array(candidateSchema).optional(),
      queueSelection: z
        .object({
          mode: z.literal('sampled'),
          availableCandidates: z.number().int().nonnegative(),
          retainedCandidates: z.number().int().nonnegative(),
          selectionRule: z.string().min(1),
          seed: z.number().int(),
          retrieval: z.string().min(1),
          completeCandidateIndex: z.array(candidateIndexSchema),
        })
        .optional(),
      caveats: z.array(z.string().min(1)),
    })
    .passthrough(),
})

const manifestEntrySchema = z.object({
  agentId: z.string().min(1),
  agentVersion: z.string().min(1),
  reasonSchemaVersion: z.string().min(1),
  evidenceIdentityVersion: z.string().min(1),
  path: z.string().min(1),
  dependencies: z.array(z.string().min(1)),
  sourceRequirements: z.array(z.string().min(1)),
  implementationFiles: z.array(z.string().min(1)).min(1),
  implementationDigest: digestSchema,
  inputDigest: digestSchema,
  outputDigest: digestSchema,
  candidateCount: z.number().int().nonnegative(),
  availableCandidateCount: z.number().int().nonnegative(),
  candidateSelectionMode: z.enum(['complete', 'sampled']),
  findingCount: z.number().int().nonnegative(),
  candidateReasons: z.array(z.string()),
  consumers: z.array(
    z.enum(['review_queue', 'public_dataset', 'documented_internal_report', 'experimental']),
  ),
  limitations: z.array(z.string().min(1)),
  allowZeroCandidates: z.boolean(),
  neurodeContract: neurodeContractSchema,
})
const manifestSchema = z.object({
  schema: z.literal('rnawiki-current-agent-manifest/v1'),
  historicalPreRepair: z.literal(false),
  eligibleForActiveReview: z.literal(true),
  corpusCommit: z.string().regex(/^[0-9a-f]{40}$/u),
  corpusDigest: digestSchema,
  generatedAt: z.string().min(1),
  runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
  seed: z.number().int(),
  records: z.number().int().positive(),
  neurodeRunManifest: neurodeRunManifestSchema,
  artifacts: z.array(manifestEntrySchema).min(1),
  totals: z.object({
    candidates: z.number().int().nonnegative(),
    findings: z.number().int().nonnegative(),
  }),
})

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function corpusForDigest(bytes: string, label: string): AgentCorpusEntry[] {
  return bytes
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const row = JSON.parse(line) as Record<string, unknown>
      if (typeof row.slug !== 'string' || typeof row.name !== 'string' || !row.recordedBackground) {
        throw new Error(`${label} contains an invalid recorded-background row`)
      }
      return {
        slug: row.slug,
        name: row.name,
        background: row.recordedBackground as AgentCorpusEntry['background'],
      }
    })
    .sort((left, right) => (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0))
}

export function loadCurrentAgentPackage(root = process.cwd()): LoadedCurrentAgentPackage {
  const currentDir = join(root, 'data', 'agents', 'current')
  const manifest = manifestSchema.parse(
    JSON.parse(readFileSync(join(currentDir, 'manifest.json'), 'utf8')),
  ) as unknown as CurrentAgentManifest
  const artifacts = new Map<string, CurrentAgentRunArtifact>()
  const ids = new Set<string>()
  const registrationById = new Map(
    REGISTERED_DATASET_AGENTS.map((registration) => [registration.agent.name, registration]),
  )
  const manifestNeurodeNodes = new Map(
    manifest.neurodeRunManifest?.nodes.map((node) => [node.neurodeId, node]) ?? [],
  )

  for (const entry of manifest.artifacts) {
    if (ids.has(entry.agentId)) throw new Error(`Duplicate current agent id: ${entry.agentId}`)
    ids.add(entry.agentId)
    const registration = registrationById.get(entry.agentId)
    if (!registration) throw new Error(`Unregistered current agent id: ${entry.agentId}`)
    const expectedImplementationFiles = [...registration.implementationFiles].sort()
    const implementationDigest = datasetAgentImplementationDigest(registration, root)
    const expectedInputDigest = currentAgentInputDigest({
      registration,
      implementationDigest,
      corpusDigest: manifest.corpusDigest,
      runDate: manifest.runDate,
      seed: manifest.seed,
    })
    if (
      JSON.stringify(entry.implementationFiles) !== JSON.stringify(expectedImplementationFiles) ||
      entry.implementationDigest !== implementationDigest ||
      entry.inputDigest !== expectedInputDigest
    ) {
      throw new Error(`${entry.agentId} implementation or complete-input identity is stale`)
    }
    const expectedPath = `data/agents/current/${entry.agentId}.json`
    if (entry.path !== expectedPath) {
      throw new Error(`${entry.agentId} has a non-allowlisted artifact path: ${entry.path}`)
    }
    const bytes = readFileSync(join(root, entry.path), 'utf8')
    if (sha256(bytes) !== entry.outputDigest) {
      throw new Error(`${entry.agentId} does not match its manifest output digest`)
    }
    const artifact = artifactSchema.parse(JSON.parse(bytes)) as unknown as CurrentAgentRunArtifact
    const candidateCount = artifact.run.queue?.length ?? 0
    const selection = validateQueueSelectionContract({
      agentName: entry.agentId,
      reasonSchemaVersion: entry.reasonSchemaVersion,
      run: artifact.run,
    })
    if (
      artifact.run.agent !== entry.agentId ||
      artifact.run.version !== entry.agentVersion ||
      artifact.review.reasonSchemaVersion !== entry.reasonSchemaVersion ||
      artifact.review.evidenceIdentityVersion !== entry.evidenceIdentityVersion ||
      artifact.inputDigest !== entry.inputDigest ||
      artifact.corpus.commit !== manifest.corpusCommit ||
      artifact.corpus.digest !== manifest.corpusDigest ||
      artifact.run.runDate !== manifest.runDate ||
      artifact.run.seed !== manifest.seed ||
      candidateCount !== entry.candidateCount ||
      selection.availableCandidates !== entry.availableCandidateCount ||
      selection.mode !== entry.candidateSelectionMode
    ) {
      throw new Error(`${entry.agentId} artifact identity or candidate count does not match`)
    }
    const manifestNode = manifestNeurodeNodes.get(entry.agentId)
    if (
      !artifact.neurode ||
      !manifestNode ||
      artifact.neurode.contract.id !== entry.agentId ||
      artifact.neurode.contract.version !== entry.agentVersion ||
      artifact.neurode.contract.cacheDigest !== entry.neurodeContract?.cacheDigest ||
      artifact.neurode.node.neurodeId !== entry.agentId ||
      artifact.neurode.node.inputDigest !== manifestNode.inputDigest ||
      artifact.neurode.node.outputDigest !== manifestNode.outputDigest ||
      manifestNode.status !== 'SUCCEEDED' ||
      manifestNode.inputDigestComplete !== true
    ) {
      throw new Error(`${entry.agentId} formal neurode contract or run manifest does not match`)
    }
    artifacts.set(entry.agentId, artifact)
  }

  const registeredIds = REGISTERED_DATASET_AGENTS.map(({ agent }) => agent.name).sort()
  const packagedIds = [...ids].sort()
  if (JSON.stringify(packagedIds) !== JSON.stringify(registeredIds)) {
    throw new Error(
      `Current agent package registry coverage differs. Expected ${registeredIds.join(', ')}, found ${packagedIds.join(', ')}`,
    )
  }

  const publicCorpus = readFileSync(join(root, 'data', 'recorded-background.ndjson'), 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const row = JSON.parse(line) as Record<string, unknown>
      if (typeof row.slug !== 'string' || typeof row.name !== 'string' || !row.recordedBackground) {
        throw new Error('The public recorded-background corpus contains an invalid row')
      }
      return row
    })

  const worktreeCorpusForDigest = corpusForDigest(
    readFileSync(join(root, 'data', 'recorded-background.ndjson'), 'utf8'),
    'The public recorded-background corpus',
  )
  // CI and publication retain Git metadata and prove that the declared commit contains these exact
  // corpus bytes. Railway's runtime image deliberately omits `.git`; the importer still verifies
  // the checked-in corpus digest there, without making production depend on repository history.
  const committedCorpusForDigest = existsSync(join(root, '.git'))
    ? corpusForDigest(
        execFileSync('git', ['show', `${manifest.corpusCommit}:data/recorded-background.ndjson`], {
          cwd: root,
          encoding: 'utf8',
          maxBuffer: 256 * 1024 * 1024,
        }),
        `Corpus commit ${manifest.corpusCommit}`,
      )
    : null

  if (
    manifest.records !== publicCorpus.length ||
    manifest.corpusDigest !== valueDigest(worktreeCorpusForDigest) ||
    (committedCorpusForDigest !== null &&
      manifest.corpusDigest !== valueDigest(committedCorpusForDigest)) ||
    manifest.totals.candidates !==
      manifest.artifacts.reduce((sum, artifact) => sum + artifact.candidateCount, 0) ||
    manifest.totals.findings !==
      manifest.artifacts.reduce((sum, artifact) => sum + artifact.findingCount, 0)
  ) {
    throw new Error('Current agent manifest totals do not match the checked-in package')
  }

  const provenanceBySlug = new Map(
    publicCorpus.map((row) => [
      row.slug as string,
      typeof row.provenanceTier === 'string' ? row.provenanceTier : 'curated',
    ]),
  )
  const recordedBackgroundDigestBySlug = new Map(
    publicCorpus.map((row) => [row.slug as string, valueDigest(row.recordedBackground)]),
  )
  return { manifest, artifacts, provenanceBySlug, recordedBackgroundDigestBySlug }
}
