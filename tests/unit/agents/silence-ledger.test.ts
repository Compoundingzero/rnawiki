import { describe, expect, it } from 'vitest'

import type { AgentCorpusEntry, AgentRun } from '@/lib/agents/core/types'
import { findForbiddenPhrases } from '@/lib/agents/core/types'
import {
  SILENCE_QUESTIONS,
  SILENCE_QUESTION_IDS,
  SILENCE_QUESTION_SET_VERSION,
  SILENCE_STATES,
  silenceLedgerAgent,
  silenceQuestionForPopulation,
  type SilenceLedger,
} from '@/lib/agents/dataset/silence-ledger'
import { STUDIED_POPULATIONS } from '@/lib/background/types'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is run against the real corpus rather than a fixture. A ledger of silences is only
 * meaningful at corpus scale, and the failure this test exists to catch — a record shape that
 * lands in no state or in two — is a shape no hand-written fixture would contain.
 */
const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const SEED = 20260828
const RUN_DATE = '2026-08-28'

const run = silenceLedgerAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })

/** Every string the run puts in front of a reader, including nested queue and roll-up text. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out)
  } else if (value !== null && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, out)
  }
  return out
}

describe('silence ledger question set', () => {
  it('is fixed, versioned, and free of duplicate questions', () => {
    expect(SILENCE_QUESTION_SET_VERSION).toBe('silence-questions/v1')
    expect(new Set(SILENCE_QUESTION_IDS).size).toBe(SILENCE_QUESTION_IDS.length)
    expect(SILENCE_QUESTIONS.map((question) => question.id)).toEqual([...SILENCE_QUESTION_IDS])
  })

  it('carries every studied population, so no recorded evidence state is dropped', () => {
    for (const population of STUDIED_POPULATIONS) {
      const id = silenceQuestionForPopulation(population)
      expect(SILENCE_QUESTION_IDS).toContain(id)
      const question = SILENCE_QUESTIONS.find((item) => item.id === id)
      expect(question?.distinguishesNotEstablished).toBe(true)
    }
  })

  it('declares which questions cannot observe an explicit "not established"', () => {
    const distinguishing = SILENCE_QUESTIONS.filter(
      (question) => question.distinguishesNotEstablished,
    )
    expect(distinguishing).toHaveLength(STUDIED_POPULATIONS.length)
  })
})

describe('silence ledger over the recorded corpus', () => {
  it('classifies every record it considered', () => {
    expect(CORPUS.length).toBeGreaterThan(2000)
    expect(run.coverage.considered).toBe(CORPUS.length)
    expect(run.coverage.used).toBe(CORPUS.length)
    expect(run.output.medicines).toHaveLength(CORPUS.length)
  })

  // The correctness property: exactly one state per medicine-question pair, and roll-up counts
  // that sum to the number of medicines for every question. A pair that fell through a classifier
  // or was counted twice would move a public silence count without changing anything visible.
  it('puts every medicine-question pair in exactly one state', () => {
    for (const ledger of run.output.medicines) {
      const seen = new Set<string>()
      for (const entry of ledger.entries) {
        expect(seen.has(entry.questionId), `${ledger.slug} ${entry.questionId}`).toBe(false)
        seen.add(entry.questionId)
        expect(SILENCE_STATES).toContain(entry.state)
      }
      expect(ledger.entries.map((entry) => entry.questionId)).toEqual([...SILENCE_QUESTION_IDS])
      expect(ledger.recorded + ledger.notEstablished + ledger.silent).toBe(
        SILENCE_QUESTION_IDS.length,
      )
    }
  })

  it('rolls up to the number of medicines on every question', () => {
    expect(run.output.rollUp).toHaveLength(SILENCE_QUESTION_IDS.length)
    expect(new Set(run.output.rollUp.map((question) => question.questionId)).size).toBe(
      SILENCE_QUESTION_IDS.length,
    )

    for (const question of run.output.rollUp) {
      expect(question.medicines).toBe(CORPUS.length)
      expect(
        question.recorded + question.notEstablished + question.silent,
        question.questionId,
      ).toBe(CORPUS.length)
      expect(question.recordedByTier.curated + question.recordedByTier.extracted).toBe(
        question.recorded,
      )
      expect(question.silentByTier.curated + question.silentByTier.extracted).toBe(question.silent)
    }
  })

  it('recounts the roll-up independently from the per-medicine ledgers', () => {
    for (const question of run.output.rollUp) {
      const entries = run.output.medicines.map((ledger) =>
        ledger.entries.find((entry) => entry.questionId === question.questionId),
      )
      const count = (state: string) => entries.filter((entry) => entry?.state === state).length
      expect(count('RECORDED'), question.questionId).toBe(question.recorded)
      expect(count('NOT_ESTABLISHED'), question.questionId).toBe(question.notEstablished)
      expect(count('SILENT'), question.questionId).toBe(question.silent)
    }
  })

  it('totals the pairs it claims to have classified', () => {
    const { totals } = run.output
    expect(totals.pairs).toBe(totals.medicines * totals.questions)
    expect(totals.recorded + totals.notEstablished + totals.silent).toBe(totals.pairs)
    expect(run.output.rollUp.reduce((sum, question) => sum + question.silent, 0)).toBe(
      totals.silent,
    )
  })

  it('reports NOT_ESTABLISHED only where a source can state it', () => {
    const populationIds = new Set(STUDIED_POPULATIONS.map(silenceQuestionForPopulation))
    for (const ledger of run.output.medicines) {
      for (const entry of ledger.entries) {
        if (entry.state === 'NOT_ESTABLISHED') {
          expect(populationIds.has(entry.questionId), entry.questionId).toBe(true)
        }
      }
    }
  })

  it('keeps sources on answered entries and none on silent ones', () => {
    for (const ledger of run.output.medicines) {
      for (const entry of ledger.entries) {
        if (entry.state === 'SILENT') {
          expect(entry.sources, `${ledger.slug} ${entry.questionId}`).toHaveLength(0)
        } else {
          expect(entry.sources.length, `${ledger.slug} ${entry.questionId}`).toBeGreaterThan(0)
          expect(new Set(entry.sources).size).toBe(entry.sources.length)
        }
      }
    }
  })

  it('finds silence somewhere and an answer somewhere, or the ledger is measuring nothing', () => {
    expect(run.output.totals.silent).toBeGreaterThan(0)
    expect(run.output.totals.recorded).toBeGreaterThan(0)
  })
})

describe('silence ledger review queue', () => {
  it('queues coverage gaps only, ranked, and never proposes an edit', () => {
    expect(run.queue?.length ?? 0).toBeGreaterThan(0)
    const queue = run.queue ?? []
    for (const candidate of queue) {
      expect(candidate.reason).toBe('COVERAGE_GAP')
      expect(candidate.basis).toContain('not of the medicine')
      expect(run.output.medicines.some((ledger) => ledger.slug === candidate.slug)).toBe(true)
    }
    const priorities = queue.map((candidate) => candidate.priority)
    expect([...priorities].sort((left, right) => right - left)).toEqual(priorities)
  })

  it('queues only records that are actually silent on the question named', () => {
    const byPrompt = new Map(
      run.output.rollUp.map((question) => [question.prompt, question.questionId] as const),
    )
    for (const candidate of run.queue ?? []) {
      const prompt = [...byPrompt.keys()].find((text) => candidate.question.startsWith(text))
      expect(prompt, candidate.question).toBeDefined()
      const questionId = byPrompt.get(prompt ?? '')
      const ledger = run.output.medicines.find((item) => item.slug === candidate.slug)
      const entry = ledger?.entries.find((item) => item.questionId === questionId)
      expect(entry?.state, `${candidate.slug} ${String(questionId)}`).toBe('SILENT')
    }
  })
})

describe('silence ledger discipline', () => {
  it('reproduces itself exactly on the same seed and run date', () => {
    const again = silenceLedgerAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })
    expect(JSON.stringify(again)).toBe(JSON.stringify(run))
  })

  it('lets the seed change only the ordering of equally ranked queue items', () => {
    const other = silenceLedgerAgent.run({ corpus: CORPUS, seed: SEED + 1, runDate: RUN_DATE })
    expect(JSON.stringify(other.output)).toBe(JSON.stringify(run.output))
  })

  it('keeps every reader-facing string clear of advice and of claims about medicines', () => {
    const strings = collectStrings(run as AgentRun<SilenceLedger>)
    expect(strings.length).toBeGreaterThan(100)
    for (const text of strings) {
      expect(findForbiddenPhrases(text), text).toEqual([])
    }
    expect(findForbiddenPhrases(silenceLedgerAgent.description)).toEqual([])
  })

  it('states the limits a reader needs, in plain words', () => {
    const caveats = run.caveats.join(' ').toLowerCase()
    expect(caveats).toContain('documents')
    expect(caveats).toContain('not evidence of safety')
    expect(caveats).toContain('sections that were read')
    expect(caveats).toContain('boxed warning')
    expect(run.caveats.length).toBeGreaterThanOrEqual(6)
  })

  it('carries its run identity, so a dataset can be traced back to the code that made it', () => {
    expect(run.agent).toBe('silence-ledger')
    expect(run.version).toBe(silenceLedgerAgent.version)
    expect(run.runDate).toBe(RUN_DATE)
    expect(run.seed).toBe(SEED)
    expect(run.parameters.questionSetVersion).toBe(SILENCE_QUESTION_SET_VERSION)
    expect(run.output.questionSetVersion).toBe(SILENCE_QUESTION_SET_VERSION)
  })
})
