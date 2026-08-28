import { describe, expect, it } from 'vitest'

import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import { findForbiddenPhrases } from '@/lib/agents/core/types'
import {
  separatingSaltTerms,
  substanceSynonymAgent,
  type SubstanceSynonymDataset,
  type SynonymCandidateGroup,
} from '@/lib/agents/dataset/substance-synonyms'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is exercised against the real corpus rather than a fixture. Its filters exist to survive
 * the things the corpus actually contains — combination labels naming six ingredients, allergenic
 * panels naming fifteen, a base and its salt sharing one identifier — and a fixture built from the
 * cases the author remembered would test the author's memory, not the agent.
 */
const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const RUN = substanceSynonymAgent.run({ corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' })
const DATASET: SubstanceSynonymDataset = RUN.output
const ALL_GROUPS: SynonymCandidateGroup[] = [
  ...DATASET.registryIdentifierGroups,
  ...DATASET.sharedDocumentGroups,
]

/** Every word that, standing between two names, marks a base and one of its salts or esters. */
const SALT_OR_ESTER_WORDS = [
  'hydrochloride',
  'sulfate',
  'sulphate',
  'bisulfate',
  'phosphate',
  'nitrate',
  'carbonate',
  'bicarbonate',
  'hydroxide',
  'chloride',
  'bromide',
  'iodide',
  'fluoride',
  'acetate',
  'citrate',
  'tartrate',
  'succinate',
  'maleate',
  'fumarate',
  'malate',
  'oxalate',
  'lactate',
  'gluconate',
  'mesylate',
  'besylate',
  'tosylate',
  'pamoate',
  'benzoate',
  'salicylate',
  'stearate',
  'palmitate',
  'propionate',
  'valerate',
  'decanoate',
  'enanthate',
  'cypionate',
  'furoate',
  'hydrate',
  'monohydrate',
  'dihydrate',
  'anhydrous',
]

describe('substance synonym agent', () => {
  it('runs over the whole corpus and reports what it could see', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBeGreaterThan(0)
    expect(RUN.coverage.used).toBeLessThan(RUN.coverage.considered)
    expect(ALL_GROUPS.length).toBeGreaterThan(0)
    expect(DATASET.registryIdentifierGroups.length).toBeGreaterThan(0)
  })

  it('reproduces its output exactly for the same corpus and seed', () => {
    const first = substanceSynonymAgent.run({
      corpus: CORPUS,
      seed: 20260828,
      runDate: '2026-08-28',
    })
    const second = substanceSynonymAgent.run({
      corpus: [...CORPUS].reverse(),
      seed: 20260828,
      runDate: '2026-08-28',
    })
    // Reversing the corpus as well as rerunning it: a group built from a Map's insertion order
    // would pass a plain rerun and change here, which is exactly the failure a rerun is meant to
    // catch.
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  /* --- The correctness property. --------------------------------------------------------- */

  it('never puts a base and one of its salts or esters in the same group', () => {
    for (const group of ALL_GROUPS) {
      const slugs = group.members.map((member) => member.slug)
      for (let left = 0; left < slugs.length; left += 1) {
        for (let right = left + 1; right < slugs.length; right += 1) {
          const leftSlug = slugs[left]!
          const rightSlug = slugs[right]!
          const leftWords = new Set(leftSlug.split('-'))
          const rightWords = new Set(rightSlug.split('-'))
          const separating = SALT_OR_ESTER_WORDS.filter(
            (word) => leftWords.has(word) !== rightWords.has(word),
          )
          expect(
            separating,
            `${leftSlug} and ${rightSlug} are separated by ${separating.join(', ')}`,
          ).toEqual([])
        }
      }
    }
  })

  it('excludes the salt-form cases the corpus actually contains, rather than silently dropping them', () => {
    expect(DATASET.saltFormExclusions.length).toBeGreaterThan(0)
    expect(DATASET.signalCounts.saltFormPairsExcluded).toBe(DATASET.saltFormExclusions.length)
    const excluded = new Map(
      DATASET.saltFormExclusions.map((entry) => [entry.slugs.join('|'), entry.separatingTerms]),
    )
    expect([...excluded.keys()]).toContain('clopidogrel|clopidogrel-bisulfate')
    expect(excluded.get('clopidogrel|clopidogrel-bisulfate')).toEqual(['bisulfate'])
    expect(excluded.get('lithium|lithium-citrate')).toEqual(['citrate'])
    expect(excluded.get('fluoride|sodium-fluoride')).toEqual(['sodium'])
  })

  it('separates a base from its salt for the pairs the research names, whether or not they are grouped', () => {
    expect(separatingSaltTerms('barium-sulfate', 'barium-acetate')).toEqual(['acetate', 'sulfate'])
    expect(separatingSaltTerms('metoprolol-succinate', 'metoprolol-tartrate')).toEqual([
      'succinate',
      'tartrate',
    ])
    expect(separatingSaltTerms('metoprolol', 'metoprolol-succinate')).toEqual(['succinate'])
    // Two names for one oxide, not a base and its salt: the counterion word is on both sides of the
    // difference rather than added to one name, so the pair survives.
    expect(separatingSaltTerms('alumina', 'aluminum-oxide')).toEqual([])
    expect(separatingSaltTerms('pyrithione-zinc', 'zinc-pyrithione')).toEqual([])
  })

  it('keys every group on an identifier or document its members genuinely share', () => {
    for (const group of DATASET.registryIdentifierGroups) {
      expect(group.members.length).toBeGreaterThan(1)
      for (const member of group.members) {
        const background = ALL_RECORDED_BACKGROUND[member.slug]
        expect(background, `${member.slug} is in the corpus`).toBeDefined()
        expect(background?.registryIdentifiers?.unii).toBe(group.sharedKey)
      }
    }
    for (const group of DATASET.sharedDocumentGroups) {
      // Pairs only: chaining would key a group on a document one member never held, which is the
      // failure this assertion exists to catch.
      expect(group.members.length).toBe(2)
      for (const member of group.members) {
        expect(member.sourceIdentifiers, `${member.slug} holds ${group.sharedKey}`).toContain(
          group.sharedKey,
        )
      }
    }
  })

  it('finds the synonym groups the corpus is known to hold', () => {
    const byKey = new Map(
      DATASET.registryIdentifierGroups.map((group) => [
        group.members.map((member) => member.slug).join('|'),
        group,
      ]),
    )
    expect([...byKey.keys()]).toContain('alumina|aluminum-oxide')
    expect([...byKey.keys()]).toContain('aflibercept|aflibercept-mrbb')
    expect([...byKey.keys()]).toContain('anemone-pulsatilla|pulsatilla-vulgaris')
    expect(byKey.get('alumina|aluminum-oxide')?.sharedKey).toBe('LMI26O6933')
  })

  it('keeps the two signals apart and never mixes them into one list', () => {
    for (const group of DATASET.registryIdentifierGroups) {
      expect(group.evidence).toBe('SHARED_REGISTRY_IDENTIFIER')
    }
    for (const group of DATASET.sharedDocumentGroups) {
      expect(group.evidence).toBe('SHARED_SOURCE_DOCUMENT')
      // A pair the identifier already carries is not repeated under weaker evidence.
      const uniis = group.members.map(
        (member) => ALL_RECORDED_BACKGROUND[member.slug]?.registryIdentifiers?.unii,
      )
      const shared = uniis.filter((unii) => unii !== undefined)
      expect(new Set(shared).size === 1 && shared.length > 1).toBe(false)
    }
  })

  it('ranks the identifier signal above the document signal in the queue', () => {
    const queue = RUN.queue ?? []
    expect(queue.length).toBeGreaterThan(0)
    for (const candidate of queue) expect(candidate.reason).toBe('POSSIBLE_DUPLICATE_SUBSTANCE')
    const priorities = queue.map((candidate) => candidate.priority)
    expect([...priorities].sort((left, right) => right - left)).toEqual(priorities)
    const identifierSlugs = new Set(
      DATASET.registryIdentifierGroups.flatMap((group) =>
        group.members.map((member) => member.slug),
      ),
    )
    const lastIdentifierIndex = queue.reduce(
      (best, candidate, index) => (identifierSlugs.has(candidate.slug) ? index : best),
      -1,
    )
    const firstDocumentIndex = queue.findIndex((candidate) => !identifierSlugs.has(candidate.slug))
    if (firstDocumentIndex >= 0) expect(lastIdentifierIndex).toBeLessThan(firstDocumentIndex)
  })

  it('asks a person the question instead of proposing the merge', () => {
    for (const candidate of RUN.queue ?? []) {
      expect(candidate.question).toMatch(
        /^Does this record name the same registered substance as /u,
      )
      expect(candidate.question).toContain('Nothing here decides that')
      expect(candidate.question).not.toMatch(/\b(?:merge these|has been merged|are the same)\b/iu)
      expect(candidate.sources.length).toBeGreaterThan(0)
    }
  })

  it('marks readings in different units as not comparable rather than as a disagreement', () => {
    for (const group of ALL_GROUPS) {
      for (const comparison of group.comparisons) {
        const units = new Set(comparison.readings.map((reading) => reading.unit ?? ''))
        if (units.size > 1 && comparison.state === 'differ') {
          // A differ verdict across mixed units is only allowed where no parsed number was
          // available on both sides, in which case the comparison is of wording and says so.
          expect(comparison.note).toContain('wording')
        }
      }
      expect(group.agreeingFields + group.differingFields + group.notComparableFields).toBe(
        group.comparisons.length,
      )
    }
  })

  it('refuses to compare a volume recorded in L against one recorded in L/kg', () => {
    // The corpus holds no group where two members record one field in different units, so this
    // branch is exercised on a constructed pair. Mixing 40 L with 0.6 L/kg would manufacture a
    // disagreement the sources never had, and it is the one comparison that must fail closed.
    const source = {
      kind: 'FDA_LABEL' as const,
      identifier: 'unit-mismatch-case',
      label: 'constructed case',
      retrievedAt: '2026-08-28',
    }
    const pair: AgentCorpusEntry[] = [
      ['aaa-example', 40, 'L', '40 L'],
      ['aaa-example-alternative-name', 0.6, 'L/kg', '0.6 L/kg'],
    ].map(([slug, numeric, unit, display]) => ({
      slug: slug as string,
      name: slug as string,
      background: {
        version: 'medicine-background/v1' as const,
        authoredAt: '2026-08-28',
        registryIdentifiers: { unii: 'ZZZZ000001', source },
        pharmacokinetics: {
          routeAsRecorded: 'oral',
          volumeOfDistribution: {
            display: display as string,
            numeric: numeric as number,
            unit: unit as string,
            populationContext: 'healthy adults, single dose',
            source,
          },
        },
      },
    }))
    const run = substanceSynonymAgent.run({ corpus: pair, seed: 1, runDate: '2026-08-28' })
    const group = run.output.registryIdentifierGroups[0]
    expect(group).toBeDefined()
    const comparison = group?.comparisons.find(
      (entry) => entry.field === 'pharmacokinetics.volumeOfDistribution',
    )
    expect(comparison?.state).toBe('not_comparable')
    expect(comparison?.note).toContain('L and L/kg')
    expect(comparison?.readings.map((reading) => reading.display)).toEqual(['40 L', '0.6 L/kg'])
    expect(group?.notComparableFields).toBe(1)
  })

  it('puts no advice or medical claim into anything a reader sees', () => {
    const readerFacing: string[] = [
      substanceSynonymAgent.description,
      RUN.coverage.reason,
      ...RUN.caveats,
    ]
    for (const candidate of RUN.queue ?? []) {
      readerFacing.push(candidate.question, candidate.basis)
    }
    for (const group of ALL_GROUPS) {
      readerFacing.push(group.sharedKeyLabel)
      for (const member of group.members) readerFacing.push(member.name)
      for (const comparison of group.comparisons) {
        readerFacing.push(comparison.field, comparison.note)
        for (const reading of comparison.readings) {
          readerFacing.push(reading.display, reading.populationContext, reading.unit ?? '')
        }
      }
    }
    for (const text of readerFacing) {
      expect(findForbiddenPhrases(text), `forbidden phrase in: ${text}`).toEqual([])
    }
  })

  it('reports every stage of the filtering, so an empty list is readable', () => {
    const counts = DATASET.signalCounts
    expect(counts.recordsCarryingUnii).toBeGreaterThan(0)
    expect(counts.uniiValuesSharedByMoreThanOneRecord).toBe(
      DATASET.registryIdentifierGroups.length + DATASET.saltFormExclusions.length,
    )
    expect(counts.sharedDocumentsConsidered).toBeGreaterThan(0)
    expect(counts.documentPairsRejectedForMultipleDeclaredSubstances).toBeGreaterThan(0)
    expect(counts.documentPairsRejectedForUnrelatedNames).toBeGreaterThanOrEqual(0)
    expect(counts.documentPairsAlreadyCarriedByIdentifier).toBeGreaterThanOrEqual(0)
  })
})
