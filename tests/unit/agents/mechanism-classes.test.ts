import { describe, expect, it } from 'vitest'

import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import { findForbiddenPhrases } from '@/lib/agents/core/types'
import {
  MECHANISM_GROUP_CLUSTER_COUNTS,
  mechanismGroupingAgent,
} from '@/lib/agents/dataset/mechanism-classes'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is run against the real corpus rather than a fixture. Its output is a partition of
 * roughly 1,200 real mechanism statements, and a grouping that behaves on six synthetic documents
 * says nothing about whether it behaves on the only input it will ever have.
 */
const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const SEED = 20260828
const RUN_DATE = '2026-08-28'

const run = mechanismGroupingAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })
// The second run is the determinism check and is deliberately built from a separately constructed
// corpus array, so nothing can pass by holding a reference to the first run's work.
const rerun = mechanismGroupingAgent.run({
  corpus: Object.entries(ALL_RECORDED_BACKGROUND).map(([slug, background]) => ({
    slug,
    name: slug.replace(/-/gu, ' '),
    background,
  })),
  seed: SEED,
  runDate: RUN_DATE,
})

/** Slugs whose record carries at least one non-empty recorded mechanism statement. */
const SLUGS_WITH_MECHANISM_TEXT = new Set(
  CORPUS.filter(
    (entry) =>
      (entry.background.mechanism?.statements ?? [])
        .map((statement) => statement.textAsRecorded)
        .join(' ')
        .trim().length > 0,
  ).map((entry) => entry.slug),
)

describe('mechanism text grouping', () => {
  it('reproduces itself exactly from the same corpus and seed', () => {
    expect(rerun.output).toEqual(run.output)
    expect(rerun.queue).toEqual(run.queue)
    expect(rerun.parameters).toEqual(run.parameters)
    expect(rerun.coverage).toEqual(run.coverage)
    expect(rerun.caveats).toEqual(run.caveats)
  })

  it('places every record with usable mechanism text in exactly one group', () => {
    const seen = new Map<string, number>()
    for (const group of run.output.groups) {
      for (const member of group.members) {
        seen.set(member.slug, (seen.get(member.slug) ?? 0) + 1)
      }
    }
    for (const [slug, count] of seen) {
      expect(count, `${slug} appears in more than one group`).toBe(1)
    }

    const sizes = run.output.groups.reduce((total, group) => total + group.size, 0)
    expect(sizes).toBe(seen.size)
    expect(sizes).toBe(Object.keys(run.output.groupIdBySlug).length)
    expect(sizes).toBe(run.coverage.used)

    // Nothing with mechanism text is silently dropped: a record is either placed or named in
    // `unplaced` with the reason it could not be placed.
    const unplacedSlugs = run.output.unplaced.map((record) => record.slug)
    expect(new Set(unplacedSlugs).size).toBe(unplacedSlugs.length)
    for (const slug of unplacedSlugs) expect(seen.has(slug)).toBe(false)
    expect(new Set([...seen.keys(), ...unplacedSlugs])).toEqual(SLUGS_WITH_MECHANISM_TEXT)
  })

  it('agrees with itself about which group each slug is in', () => {
    for (const group of run.output.groups) {
      for (const member of group.members) {
        expect(run.output.groupIdBySlug[member.slug]).toBe(group.groupId)
      }
    }
    expect(new Set(run.output.groups.map((group) => group.groupId)).size).toBe(
      run.output.groups.length,
    )
  })

  it('reports the whole sweep and picks the cluster count it says it picked', () => {
    expect(run.output.sweep.map((point) => point.clusterCount)).toEqual([
      ...MECHANISM_GROUP_CLUSTER_COUNTS,
    ])
    const best = run.output.sweep.reduce((chosen, point) =>
      point.silhouette > chosen.silhouette ? point : chosen,
    )
    expect(run.output.chosenClusterCount).toBe(best.clusterCount)
    expect(run.parameters.chosenClusterCount).toBe(best.clusterCount)
    for (const point of run.output.sweep) {
      expect(String(run.parameters.silhouetteByClusterCount)).toContain(`${point.clusterCount}:`)
    }
    // A group is never emitted for an emptied cluster, so the group count can fall below k but
    // never exceed it.
    expect(run.output.groups.length).toBeLessThanOrEqual(run.output.chosenClusterCount)
  })

  it('shows how weakly each member is attached instead of hiding it in the mean', () => {
    for (const group of run.output.groups) {
      const cosines = group.members.map((member) => member.cosineToCentroid)
      expect([...cosines].sort((left, right) => right - left)).toEqual(cosines)
      const mean = cosines.reduce((total, value) => total + value, 0) / cosines.length
      expect(group.meanCohesion).toBeCloseTo(mean, 5)
      expect(group.size).toBe(group.members.length)
    }
  })

  it('describes a group only by its distinguishing terms, never by a name', () => {
    for (const group of run.output.groups) {
      // The hazard this agent exists to avoid is a group being labelled with a pharmacological
      // class. The type has no field for one; this asserts the shape stays that way.
      expect(Object.keys(group).sort()).toEqual([
        'groupId',
        'meanCohesion',
        'members',
        'size',
        'termSummary',
        'terms',
      ])
      expect(group.groupId).toMatch(/^mechanism-group-\d+-\d+$/u)
      expect(group.termSummary).toBe(`terms: ${group.terms.map((term) => term.term).join(', ')}`)
    }
  })

  it('routes weakly attached records to a person as a question about the record', () => {
    for (const candidate of run.queue ?? []) {
      expect(SLUGS_WITH_MECHANISM_TEXT.has(candidate.slug)).toBe(true)
      expect(candidate.question.endsWith('?')).toBe(true)
      expect(candidate.sources.length).toBeGreaterThan(0)
    }
    const priorities = (run.queue ?? []).map((candidate) => candidate.priority)
    expect([...priorities].sort((left, right) => right - left)).toEqual(priorities)
    expect(run.queue).toHaveLength(
      run.output.groups.flatMap((group) =>
        group.members.filter((member) => member.cosineToCentroid < 0.1),
      ).length,
    )
    expect(run.queueSelection).toBeUndefined()
  })

  it('keeps every reader-facing string clear of advice and of claims about medicines', () => {
    const strings: string[] = [
      mechanismGroupingAgent.description,
      run.coverage.reason,
      ...run.caveats,
      ...run.output.unplaced.flatMap((record) => [record.name, record.reason]),
      ...run.output.groups.flatMap((group) => [
        group.groupId,
        group.termSummary,
        ...group.terms.map((term) => term.term),
        ...group.members.map((member) => member.name),
      ]),
      ...(run.queue ?? []).flatMap((candidate) => [candidate.question, candidate.basis]),
      ...Object.values(run.parameters).map((value) => String(value)),
    ]
    for (const text of strings) {
      expect(findForbiddenPhrases(text), text).toEqual([])
    }
  })

  it('reports coverage against the whole corpus, not against the part it could use', () => {
    expect(run.coverage.considered).toBe(CORPUS.length)
    expect(run.coverage.used).toBeLessThan(run.coverage.considered)
    expect(run.output.documentCount).toBe(SLUGS_WITH_MECHANISM_TEXT.size)
    expect(run.output.vocabularySize).toBe(run.parameters.vocabularySize)
    expect(run.output.minDocumentFrequency).toBe(run.parameters.minDocumentFrequency)
  })
})
