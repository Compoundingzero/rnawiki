/**
 * Every dataset agent, in the order a reader would meet them.
 *
 * The registry is explicit rather than discovered from the filesystem so that adding an agent is a
 * reviewed change: an agent that reaches the corpus without anyone deciding it should is exactly
 * the failure this project's contracts exist to prevent.
 */

import type { DatasetAgent, ReviewReason } from '@/lib/agents/core/types'
import type { NeurodeCategory } from '@/lib/neurodes/contracts'
import { silenceLedgerAgent } from '@/lib/agents/dataset/silence-ledger'
import { mechanismGroupingAgent } from '@/lib/agents/dataset/mechanism-classes'
import { peerAnomalyAgent } from '@/lib/agents/dataset/peer-anomaly'
import { enzymeDocumentationAgent } from '@/lib/agents/dataset/enzyme-documentation'
import { substanceSynonymAgent } from '@/lib/agents/dataset/substance-synonyms'
import { evidenceDensityAgent } from '@/lib/agents/dataset/evidence-density'
import { numericDistributionsAgent } from '@/lib/agents/dataset/numeric-distributions'
import { reactionCooccurrenceAgent } from '@/lib/agents/dataset/reaction-cooccurrence'
import { excerptIntegrityAgent } from '@/lib/agents/dataset/excerpt-integrity'
import { coverageLedgerAgent } from '@/lib/agents/dataset/coverage-ledger'

export const AGENT_AUDIENCE_LANES = ['ordinary', 'biotech', 'chemist', 'quantitative'] as const
export type AgentAudienceLane = (typeof AGENT_AUDIENCE_LANES)[number]

export const AGENT_REVIEW_SEVERITIES = ['low', 'medium', 'high', 'blocking'] as const
export type AgentReviewSeverity = (typeof AGENT_REVIEW_SEVERITIES)[number]

export type AgentOutputConsumer =
  'review_queue' | 'public_dataset' | 'documented_internal_report' | 'experimental'

export interface RegisteredDatasetAgent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry nodes have different outputs
  agent: DatasetAgent<any>
  /** Bumped only when the meaning of one of this agent's review reasons changes. */
  reasonSchemaVersion: string
  /**
   * Bumped only when the candidate-local observation semantics change in a way that makes an old
   * human decision stale. Agent prose and ranking-only changes deliberately do not change it.
   */
  evidenceIdentityVersion: string
  /** One of the six formal B1 neurode categories. */
  category: NeurodeCategory
  /** Detector and shared implementation inputs whose bytes form the run/cache identity. */
  implementationFiles: readonly string[]
  /** Focused executable specifications for this detector. */
  tests: readonly string[]
  dependencies: readonly string[]
  sourceRequirements: readonly string[]
  consumers: readonly AgentOutputConsumer[]
  /** Per-reason routing metadata, persisted with every occurrence rather than inferred by the UI. */
  reviewPolicy: Partial<
    Record<ReviewReason, { audienceLane: AgentAudienceLane; severity: AgentReviewSeverity }>
  >
  /** A clean detector may legitimately emit no work; a coverage queue unexpectedly may not. */
  allowZeroCandidates: boolean
  findingCount(output: unknown): number
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function objectAt(value: unknown, key: string): unknown {
  return value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined
}

function implementationFiles(agentPath: string): readonly string[] {
  return [
    agentPath,
    'scripts/agents/current-run.ts',
    'scripts/agents/registry.ts',
    'lib/agents/core/cluster.ts',
    'lib/agents/core/conformal.ts',
    'lib/agents/core/evidence.ts',
    'lib/agents/core/identity.ts',
    'lib/agents/core/rng.ts',
    'lib/agents/core/statistics.ts',
    'lib/agents/core/text.ts',
    'lib/agents/core/types.ts',
    'lib/background/anatomy-regions.ts',
    'lib/background/derivations.ts',
    'lib/background/printed-numbers.ts',
    'lib/background/types.ts',
    'lib/neurodes/contracts.ts',
    'lib/neurodes/graph.ts',
    'lib/neurodes/registry.ts',
    'lib/neurodes/run-manifest.ts',
    'lib/neurodes/runner.ts',
    'lib/rna-intelligence/background-rules.ts',
    'lib/stable-json.ts',
  ]
}

export const REGISTERED_DATASET_AGENTS: readonly RegisteredDatasetAgent[] = [
  {
    agent: silenceLedgerAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'COVERAGE_DETECTOR',
    implementationFiles: implementationFiles('lib/agents/dataset/silence-ledger.ts'),
    tests: ['tests/unit/agents/silence-ledger.test.ts'],
    dependencies: ['recorded-background', 'source-coverage'],
    sourceRequirements: ['recorded source reads by fixed question set'],
    consumers: ['review_queue', 'public_dataset'],
    reviewPolicy: { COVERAGE_GAP: { audienceLane: 'ordinary', severity: 'medium' } },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'medicines')),
  },
  {
    agent: mechanismGroupingAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'CROSS_SOURCE_RELATION',
    implementationFiles: implementationFiles('lib/agents/dataset/mechanism-classes.ts'),
    tests: ['tests/unit/agents/mechanism-classes.test.ts'],
    dependencies: ['recorded-background.mechanism'],
    sourceRequirements: ['source-bound recorded mechanism statements'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: { COVERAGE_GAP: { audienceLane: 'biotech', severity: 'low' } },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'groups')),
  },
  {
    agent: peerAnomalyAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'PRIORITIZATION_FEATURE',
    implementationFiles: implementationFiles('lib/agents/dataset/peer-anomaly.ts'),
    tests: ['tests/unit/agents/peer-anomaly.test.ts'],
    dependencies: ['recorded-background.pharmacokinetics'],
    sourceRequirements: ['source-bound recorded values with units and population context'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: {
      UNUSUAL_FOR_PEER_GROUP: { audienceLane: 'quantitative', severity: 'medium' },
    },
    allowZeroCandidates: true,
    findingCount: (output) => {
      const quantities = objectAt(output, 'quantities')
      return Array.isArray(quantities)
        ? quantities.reduce(
            (count, quantity) => count + arrayLength(objectAt(quantity, 'flags')),
            0,
          )
        : 0
    },
  },
  {
    agent: enzymeDocumentationAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'DATA_QUALITY_DETECTOR',
    implementationFiles: implementationFiles('lib/agents/dataset/enzyme-documentation.ts'),
    tests: ['tests/unit/agents/enzyme-documentation.test.ts'],
    dependencies: ['recorded-background.interactionSignals'],
    sourceRequirements: ['descriptive source excerpts naming the recorded counterparty'],
    consumers: ['review_queue', 'public_dataset'],
    reviewPolicy: {
      ATTRIBUTION_SUSPECT: { audienceLane: 'biotech', severity: 'high' },
      COVERAGE_GAP: { audienceLane: 'biotech', severity: 'medium' },
    },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'counterparties')),
  },
  {
    agent: substanceSynonymAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'CROSS_SOURCE_RELATION',
    implementationFiles: implementationFiles('lib/agents/dataset/substance-synonyms.ts'),
    tests: ['tests/unit/agents/substance-synonyms.test.ts'],
    dependencies: ['recorded-background.registryIdentifiers', 'recorded-background.sources'],
    sourceRequirements: ['recorded identifiers and all side-by-side source readings'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: {
      POSSIBLE_DUPLICATE_SUBSTANCE: { audienceLane: 'chemist', severity: 'high' },
    },
    allowZeroCandidates: true,
    findingCount: (output) =>
      arrayLength(objectAt(output, 'registryIdentifierGroups')) +
      arrayLength(objectAt(output, 'sharedDocumentGroups')),
  },
  {
    agent: evidenceDensityAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'PRIORITIZATION_FEATURE',
    implementationFiles: implementationFiles('lib/agents/dataset/evidence-density.ts'),
    tests: ['tests/unit/agents/evidence-density.test.ts'],
    dependencies: ['recorded-background'],
    sourceRequirements: ['all source attachments in each recorded envelope'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: { COVERAGE_GAP: { audienceLane: 'ordinary', severity: 'low' } },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'perMedicine')),
  },
  {
    agent: numericDistributionsAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'PUBLIC_AGGREGATE',
    implementationFiles: implementationFiles('lib/agents/dataset/numeric-distributions.ts'),
    tests: ['tests/unit/agents/numeric-distributions.test.ts'],
    dependencies: ['recorded-background.numeric-values'],
    sourceRequirements: ['recorded values with explicit units'],
    consumers: ['documented_internal_report'],
    reviewPolicy: {},
    allowZeroCandidates: true,
    findingCount: (output) => {
      const fields = objectAt(output, 'fields')
      return Array.isArray(fields)
        ? fields.reduce((count, field) => count + arrayLength(objectAt(field, 'distributions')), 0)
        : 0
    },
  },
  {
    agent: reactionCooccurrenceAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'CROSS_SOURCE_RELATION',
    implementationFiles: implementationFiles('lib/agents/dataset/reaction-cooccurrence.ts'),
    tests: ['tests/unit/agents/reaction-cooccurrence.test.ts'],
    dependencies: ['recorded-background.commonAdverseReactions'],
    sourceRequirements: ['source excerpts containing every recorded reaction term'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: {
      ATTRIBUTION_SUSPECT: { audienceLane: 'biotech', severity: 'high' },
      COVERAGE_GAP: { audienceLane: 'biotech', severity: 'medium' },
    },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'terms')),
  },
  {
    agent: excerptIntegrityAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'STRUCTURAL_VALIDATOR',
    implementationFiles: implementationFiles('lib/agents/dataset/excerpt-integrity.ts'),
    tests: ['tests/unit/agents/excerpt-integrity.test.ts'],
    dependencies: ['recorded-background', 'background-engine'],
    sourceRequirements: ['exact value/excerpt source binding'],
    consumers: ['review_queue', 'documented_internal_report'],
    reviewPolicy: {
      ATTRIBUTION_SUSPECT: { audienceLane: 'quantitative', severity: 'blocking' },
    },
    allowZeroCandidates: true,
    findingCount: (output) => arrayLength(objectAt(output, 'entries')),
  },
  {
    agent: coverageLedgerAgent,
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    category: 'COVERAGE_DETECTOR',
    implementationFiles: implementationFiles('lib/agents/dataset/coverage-ledger.ts'),
    tests: ['tests/unit/agents/coverage-ledger.test.ts'],
    dependencies: ['recorded-background', 'source-coverage'],
    sourceRequirements: ['all recorded source attachments and provenance tier'],
    consumers: ['review_queue', 'public_dataset'],
    reviewPolicy: { COVERAGE_GAP: { audienceLane: 'ordinary', severity: 'medium' } },
    allowZeroCandidates: false,
    findingCount: (output) => arrayLength(objectAt(output, 'entries')),
  },
]

export const DATASET_AGENTS: ReadonlyArray<DatasetAgent<unknown>> = REGISTERED_DATASET_AGENTS.map(
  ({ agent }) => agent,
)

export function registeredAgent(agentName: string): RegisteredDatasetAgent {
  const match = REGISTERED_DATASET_AGENTS.find(({ agent }) => agent.name === agentName)
  if (!match) throw new Error(`Unregistered dataset agent: ${agentName}`)
  return match
}

/**
 * The seed every scheduled run uses.
 *
 * Fixed rather than drawn, because a seed that changed between runs would make every rerun
 * disagree with the run a person reviewed, and the disagreement would look like the corpus
 * changing rather than the seed.
 */
export const AGENT_RUN_SEED = 20260828
