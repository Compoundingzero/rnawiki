/**
 * Every dataset agent, in the order a reader would meet them.
 *
 * The registry is explicit rather than discovered from the filesystem so that adding an agent is a
 * reviewed change: an agent that reaches the corpus without anyone deciding it should is exactly
 * the failure this project's contracts exist to prevent.
 */

import type { DatasetAgent } from '@/lib/agents/core/types'
import { silenceLedgerAgent } from '@/lib/agents/dataset/silence-ledger'
import { mechanismGroupingAgent } from '@/lib/agents/dataset/mechanism-classes'
import { peerAnomalyAgent } from '@/lib/agents/dataset/peer-anomaly'
import { enzymeDocumentationAgent } from '@/lib/agents/dataset/enzyme-documentation'
import { substanceSynonymAgent } from '@/lib/agents/dataset/substance-synonyms'
import { evidenceDensityAgent } from '@/lib/agents/dataset/evidence-density'
import { numericDistributionsAgent } from '@/lib/agents/dataset/numeric-distributions'
import { reactionCooccurrenceAgent } from '@/lib/agents/dataset/reaction-cooccurrence'
import { excerptIntegrityAgent } from '@/lib/agents/dataset/excerpt-integrity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- agents differ only in output type
export const DATASET_AGENTS: ReadonlyArray<DatasetAgent<any>> = [
  silenceLedgerAgent,
  mechanismGroupingAgent,
  peerAnomalyAgent,
  enzymeDocumentationAgent,
  substanceSynonymAgent,
  evidenceDensityAgent,
  numericDistributionsAgent,
  reactionCooccurrenceAgent,
  excerptIntegrityAgent,
]

/**
 * The seed every scheduled run uses.
 *
 * Fixed rather than drawn, because a seed that changed between runs would make every rerun
 * disagree with the run a person reviewed, and the disagreement would look like the corpus
 * changing rather than the seed.
 */
export const AGENT_RUN_SEED = 20260828
