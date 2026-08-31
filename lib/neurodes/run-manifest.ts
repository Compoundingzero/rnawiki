import { createHash } from 'node:crypto'

import { stableJsonStringify } from '@/lib/stable-json'
import type { NeurodeCategory } from './contracts'

export const NEURODE_RUN_MANIFEST_SCHEMA = 'rnawiki/neurode-run-manifest/v1' as const

export type NeurodeNodeStatus = 'SUCCEEDED' | 'CACHED' | 'FAILED' | 'BLOCKED'
export type NeurodeCacheStatus =
  'HIT' | 'MISS' | 'DISABLED' | 'BYPASSED_INCOMPLETE_INPUT' | 'NOT_ATTEMPTED'

export interface NeurodeNodeRunManifest {
  neurodeId: string
  neurodeVersion: string
  contractCacheDigest: string
  category: NeurodeCategory
  inputSchemaId: string
  outputSchemaId: string
  dependencyIds: readonly string[]
  status: NeurodeNodeStatus
  cacheStatus: NeurodeCacheStatus
  cacheKey: string | null
  inputDigest: string | null
  inputDigestComplete: boolean
  outputDigest: string | null
  recordsConsidered: number | null
  recordsUsed: number | null
  reasonCodes: readonly string[]
  startedAt: string | null
  completedAt: string | null
  failureCode: string | null
}

export interface NeurodeRunManifest {
  schema: typeof NEURODE_RUN_MANIFEST_SCHEMA
  runId: string
  status: 'SUCCEEDED' | 'FAILED'
  failureCode: string | null
  requestedNeurodeIds: readonly string[]
  plannedNeurodeIds: readonly string[]
  startedAt: string
  completedAt: string
  nodes: readonly NeurodeNodeRunManifest[]
}

export interface CreateNeurodeRunManifestInput {
  status: NeurodeRunManifest['status']
  failureCode: string | null
  requestedNeurodeIds: readonly string[]
  plannedNeurodeIds: readonly string[]
  startedAt: string
  completedAt: string
  nodes: readonly NeurodeNodeRunManifest[]
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stableJsonStringify(value), 'utf8').digest('hex')
}

/** Creates a JSON-only, content-addressed manifest without reordering topological node arrays. */
export function createNeurodeRunManifest(input: CreateNeurodeRunManifestInput): NeurodeRunManifest {
  const body = {
    schema: NEURODE_RUN_MANIFEST_SCHEMA,
    status: input.status,
    failureCode: input.failureCode,
    requestedNeurodeIds: [...new Set(input.requestedNeurodeIds)].sort(),
    plannedNeurodeIds: [...input.plannedNeurodeIds],
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    nodes: input.nodes.map((node) => ({
      ...node,
      dependencyIds: [...node.dependencyIds].sort(),
      reasonCodes: [...new Set(node.reasonCodes)].sort(),
    })),
  }
  return {
    ...body,
    runId: `neurode_run_${sha256(body)}`,
  }
}

/** Stable key ordering makes byte comparisons and checked-in manifests meaningful. */
export function serializeNeurodeRunManifest(manifest: NeurodeRunManifest): string {
  return `${stableJsonStringify(manifest)}\n`
}
