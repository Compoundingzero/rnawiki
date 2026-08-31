import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  enzymeDocumentationAgent,
  giniCoefficient,
  herfindahlIndex,
  type CounterpartyDocumentationProfile,
} from '@/lib/agents/dataset/enzyme-documentation'
import {
  authoredStrings,
  findForbiddenPhrases,
  type AgentCorpusEntry,
} from '@/lib/agents/core/types'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is run against the whole recorded corpus rather than a fixture. Its subject is the
 * shape of thousands of label sentences — which counterparties get documented, how often a sentence
 * settles a role, how many readings fail their own excerpt — and none of that is observable on a
 * handful of synthetic records.
 */

const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const SEED = 20260828
const RUN_DATE = '2026-08-28'
const RUN = enzymeDocumentationAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })

const AGENT_SOURCE = readFileSync(
  path.resolve(__dirname, '../../../lib/agents/dataset/enzyme-documentation.ts'),
  'utf8',
)

/**
 * Comments are stripped before the source is inspected. The file explains at length why it does not
 * project the bipartite graph onto medicines, and that explanation necessarily uses the vocabulary
 * the code is forbidden to use. Removing comments is what separates the prohibition from a
 * violation of it.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^[^\n]*?\/\/[^\n]*$/gmu, '')
}

const AGENT_CODE = stripComments(AGENT_SOURCE)

function declaredInterfaces(code: string): Array<{ name: string; properties: string[] }> {
  const found: Array<{ name: string; properties: string[] }> = []
  const blocks = code.matchAll(/(?:export\s+)?interface\s+(\w+)\s*\{([\s\S]*?)\n\}/gu)
  for (const block of blocks) {
    const name = block[1] ?? ''
    const body = block[2] ?? ''
    const properties = [...body.matchAll(/^\s{2}(\w+)\??:/gmu)].map((match) => match[1] ?? '')
    found.push({ name, properties })
  }
  return found
}

/** Every plain object in the output tree, so each row can be inspected on its own. */
function collectObjects(
  value: unknown,
  into: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  if (Array.isArray(value)) for (const item of value) collectObjects(item, into)
  else if (value && typeof value === 'object') {
    into.push(value as Record<string, unknown>)
    for (const item of Object.values(value)) collectObjects(item, into)
  }
  return into
}

describe('enzyme and transporter documentation agent', () => {
  it('profiles the counterparties the corpus actually names', () => {
    expect(RUN.agent).toBe('enzyme-and-transporter-documentation')
    expect(RUN.output.counterparties.length).toBeGreaterThan(0)
    expect(RUN.output.recordsConsidered).toBe(CORPUS.length)
    expect(RUN.output.recordsNamingAnyCounterparty).toBeGreaterThan(0)
    expect(RUN.output.recordsNamingNone).toBe(
      RUN.output.recordsConsidered - RUN.output.recordsNamingAnyCounterparty,
    )
  })

  it('reruns identically for the same seed and corpus', () => {
    const again = enzymeDocumentationAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })
    expect(JSON.stringify(again)).toBe(JSON.stringify(RUN))
  })

  it('lets the seed move only the concentration reference, never the recorded dataset', () => {
    const other = enzymeDocumentationAgent.run({ corpus: CORPUS, seed: 7, runDate: RUN_DATE })
    expect(JSON.stringify(other.output.counterparties)).toBe(
      JSON.stringify(RUN.output.counterparties),
    )
    expect(other.output.concentration.giniCoefficient).toBe(
      RUN.output.concentration.giniCoefficient,
    )
    expect(JSON.stringify(other.queue)).toBe(JSON.stringify(RUN.queue))
  })

  it('keeps every reader-facing string clear of advice and of invented values', () => {
    const strings = [
      enzymeDocumentationAgent.description,
      ...authoredStrings(RUN),
      ...Object.values(RUN.parameters).map((value) => String(value)),
    ]
    expect(strings.length).toBeGreaterThan(4000)
    for (const text of strings) {
      expect(findForbiddenPhrases(text), text.slice(0, 160)).toEqual([])
    }
  })
})

/**
 * The property this agent exists to guarantee. A bipartite medicine-to-counterparty structure can
 * always be projected onto medicine pairs, and that projection is a drug-drug interaction lookup
 * however it is labelled. The refusal is checked twice: in the declared types, so no row exists to
 * write a pair into, and in the emitted output, so no object in fact names two medicines.
 */
describe('no medicine-to-medicine structure', () => {
  it('declares no type that can hold two medicine identifiers', () => {
    const interfaces = declaredInterfaces(AGENT_CODE)
    expect(interfaces.length).toBeGreaterThan(5)
    for (const declared of interfaces) {
      const identifiers = declared.properties.filter((property) => /slug/iu.test(property))
      expect(
        identifiers.length,
        `${declared.name} declares ${identifiers.join(', ')}`,
      ).toBeLessThan(2)
    }
    // Exactly one type names a medicine at all; everything else is per counterparty.
    const naming = interfaces.filter((declared) =>
      declared.properties.some((property) => /slug/iu.test(property)),
    )
    expect(naming.map((declared) => declared.name).sort()).toEqual([
      'CounterpartyMention',
      'WithheldMention',
    ])
  })

  it('names no pairing type or pairing identifier in code', () => {
    for (const forbidden of [
      /\bslugs\b/u,
      /\botherSlug\b/u,
      /\bslug[AB]\b/u,
      /\b\w*Pair\w*\b/u,
      /\b\w*Similarity\w*\b/u,
      /\b\w*CoOccurrence\w*\b/u,
      /\b\w*Related\w*\b/u,
    ]) {
      expect(forbidden.test(AGENT_CODE), `${forbidden.source} appears in code`).toBe(false)
    }
  })

  it('emits no object that refers to two different medicines', () => {
    const slugs = new Set(CORPUS.map((entry) => entry.slug))
    const identityOf = new Map<string, string>()
    for (const entry of CORPUS) {
      identityOf.set(entry.slug, entry.slug)
      identityOf.set(entry.name, entry.slug)
    }

    for (const node of collectObjects(RUN, [])) {
      const referenced = new Set<string>()
      for (const [key, value] of Object.entries(node)) {
        if (typeof value !== 'string') continue
        // Excerpts quote label sentences; only a value that IS an identifier counts as a reference.
        const identity = identityOf.get(value)
        if (identity && (key === 'slug' || key === 'name' || slugs.has(value))) {
          referenced.add(identity)
        }
      }
      expect(referenced.size, JSON.stringify(node).slice(0, 200)).toBeLessThan(2)
    }
  })
})

describe('every admitted mention is answerable to its own sentence', () => {
  it('contains the recorded counterparty verbatim in the excerpt of every mention', () => {
    let checked = 0
    for (const profile of RUN.output.counterparties) {
      for (const mention of profile.mentions) {
        expect(
          mention.excerpt.toLowerCase().includes(profile.counterparty.toLowerCase()),
          `${profile.counterparty} → ${mention.slug}`,
        ).toBe(true)
        if (mention.matchesSourceCasing) {
          expect(mention.excerpt).toContain(profile.counterparty)
        }
        checked += 1
      }
    }
    expect(checked).toBe(RUN.output.mentionsAdmitted)
  })

  it('withholds exactly the corpus readings whose counterparty is absent from the excerpt', () => {
    let absent = 0
    let present = 0
    for (const entry of CORPUS) {
      for (const signal of entry.background.interactionSignals ?? []) {
        const excerpt = signal.source.excerpt ?? ''
        if (excerpt.toLowerCase().includes(signal.counterpartyAsRecorded.toLowerCase()))
          present += 1
        else absent += 1
      }
    }
    expect(RUN.output.mentionsWithheldCounterpartyNotInExcerpt).toBe(absent)
    expect(absent).toBeGreaterThan(0)
    expect(RUN.output.mentionsAdmitted + RUN.output.mentionsWithheldExcerptFailedScreen).toBe(
      present,
    )
  })

  it('routes every withheld reading to a person instead of dropping it', () => {
    const attribution = (RUN.queue ?? []).filter((item) => item.reason === 'ATTRIBUTION_SUSPECT')
    expect(
      attribution.reduce((sum, item) => sum + item.evidence.sourceReadings.length, 0),
    ).toBe(
      RUN.output.mentionsWithheldCounterpartyNotInExcerpt +
        RUN.output.mentionsWithheldExcerptFailedScreen,
    )
    for (const item of attribution) {
      expect(item.sources.length).toBeGreaterThan(0)
      expect(item.question.endsWith('?')).toBe(true)
    }
  })

  it('carries source version metadata through an admitted sentence', () => {
    const run = enzymeDocumentationAgent.run({
      corpus: [
        {
          slug: 'versioned-source',
          name: 'Versioned source',
          background: {
            version: 'medicine-background/v1',
            authoredAt: '2026-08-30',
            interactionSignals: [
              {
                counterpartyAsRecorded: 'CYP3A4',
                kind: 'ENZYME',
                roleAsRecorded: 'SUBSTRATE',
                polarity: 'ASSERTED',
                source: {
                  kind: 'FDA_LABEL',
                  identifier: 'versioned-label',
                  label: 'Versioned label',
                  version: 'revision-7',
                  effectiveDate: '2026-08-15',
                  retrievedAt: '2026-08-30',
                  excerpt: 'CYP3A4 was the enzyme recorded for this measured pathway.',
                },
              },
            ],
          },
        },
      ],
      seed: SEED,
      runDate: RUN_DATE,
    })
    expect(run.output.counterparties[0]?.mentions[0]).toMatchObject({
      sourceVersion: 'revision-7',
      sourceEffectiveDate: '2026-08-15',
    })
  })
})

describe('per-counterparty tallies', () => {
  const byName = new Map<string, CounterpartyDocumentationProfile>(
    RUN.output.counterparties.map((profile) => [profile.counterparty, profile]),
  )

  it('accounts for every mention in the role, section and kind tallies', () => {
    let total = 0
    for (const profile of RUN.output.counterparties) {
      const { substrate, inhibitor, inducer, roleNotStated } = profile.roles
      const roleTotal = [substrate, inhibitor, inducer].reduce(
        (sum, tally) => sum + tally.asserted + tally.negated + tally.polarityNotRecorded,
        0,
      )
      expect(roleTotal + roleNotStated).toBe(profile.medicinesRecording)
      const { clinicalPharmacology, pharmacokinetics, sectionNotStated } = profile.sections
      expect(clinicalPharmacology + pharmacokinetics + sectionNotStated).toBe(
        profile.medicinesRecording,
      )
      expect(profile.kinds.enzyme + profile.kinds.transporter).toBe(profile.medicinesRecording)
      expect(profile.mentions.length).toBe(profile.medicinesRecording)
      total += profile.medicinesRecording
    }
    expect(total).toBe(RUN.output.mentionsAdmitted)
  })

  /**
   * The defect this separation exists to prevent. Roughly two thirds of the role-bearing counts in
   * this profile are denials — "does not inhibit CYP3A4" — and a tally with one counter per role
   * added them to the assertions, so the published number said the opposite of its own sources.
   */
  it('counts a denied role as a denial and never as an assertion', () => {
    const denialsExist = RUN.output.counterparties.some((profile) =>
      [profile.roles.substrate, profile.roles.inhibitor, profile.roles.inducer].some(
        (tally) => tally.negated > 0,
      ),
    )
    expect(denialsExist).toBe(true)

    for (const profile of RUN.output.counterparties) {
      for (const tally of [
        profile.roles.substrate,
        profile.roles.inhibitor,
        profile.roles.inducer,
      ]) {
        expect(tally.asserted).toBeGreaterThanOrEqual(0)
        expect(tally.negated).toBeGreaterThanOrEqual(0)
        expect(tally.polarityNotRecorded).toBeGreaterThanOrEqual(0)
      }
      // Every role-bearing mention carries its polarity onto the row, so a consumer of the JSON
      // can reconstruct the distinction rather than having to trust the tally.
      for (const mention of profile.mentions) {
        if (mention.role === undefined) expect(mention.polarity).toBeUndefined()
      }
    }
  })

  it('agrees with the mentions it publishes about which roles were denied', () => {
    for (const profile of RUN.output.counterparties) {
      const negatedMentions = profile.mentions.filter(
        (mention) => mention.role !== undefined && mention.polarity === 'NEGATED',
      ).length
      const negatedTallied =
        profile.roles.substrate.negated +
        profile.roles.inhibitor.negated +
        profile.roles.inducer.negated
      expect(negatedTallied).toBe(negatedMentions)
    }
  })

  it('reports the role-less share the parser refused to guess at', () => {
    expect(RUN.output.roleNotStatedShare).toBeGreaterThan(0)
    const roleless = RUN.output.counterparties.reduce(
      (sum, profile) => sum + profile.roles.roleNotStated,
      0,
    )
    expect(Math.round(RUN.output.roleNotStatedShare * RUN.output.mentionsAdmitted)).toBe(roleless)
  })

  it('keeps variant recorded spellings apart rather than merging them', () => {
    expect(byName.has('P-GP')).toBe(true)
    expect(byName.has('P-GLYCOPROTEIN')).toBe(true)
    const mate = byName.get('MATE')
    expect(mate?.longerRecordedSpellings).toContain('MATE1')
    expect(mate?.longerRecordedSpellings).not.toContain('MATE')
  })

  it('orders counterparties by how many records name them', () => {
    const degrees = RUN.output.counterparties.map((profile) => profile.medicinesRecording)
    expect([...degrees].sort((left, right) => right - left)).toEqual(degrees)
  })
})

describe('concentration measures', () => {
  it('agrees with the profiles it summarises', () => {
    const degrees = RUN.output.counterparties.map((profile) => profile.medicinesRecording)
    const top = RUN.output.counterparties[0]
    expect(RUN.output.concentration.counterpartiesDocumented).toBe(degrees.length)
    expect(RUN.output.concentration.topCounterparty).toBe(top?.counterparty)
    expect(RUN.output.concentration.topCounterpartyShare).toBeCloseTo(
      (top?.medicinesRecording ?? 0) / RUN.output.mentionsAdmitted,
      6,
    )
    expect(RUN.output.concentration.giniCoefficient).toBeCloseTo(giniCoefficient(degrees), 6)
    expect(RUN.output.concentration.herfindahlIndex).toBeCloseTo(herfindahlIndex(degrees), 6)
  })

  it('computes the two indices against values worked out independently', () => {
    // A perfectly even split: Gini 0, Herfindahl 1/n.
    expect(giniCoefficient([5, 5, 5, 5])).toBeCloseTo(0, 12)
    expect(herfindahlIndex([5, 5, 5, 5])).toBeCloseTo(0.25, 12)
    // One holder of everything: Gini (n-1)/n, Herfindahl 1.
    expect(giniCoefficient([0, 0, 0, 8])).toBeCloseTo(0.75, 12)
    expect(herfindahlIndex([0, 0, 0, 8])).toBeCloseTo(1, 12)
    // Worked by hand for [1, 2, 3, 4]: (2*30)/(4*10) - 5/4 = 0.25.
    expect(giniCoefficient([1, 2, 3, 4])).toBeCloseTo(0.25, 12)
    expect(herfindahlIndex([1, 2, 3, 4])).toBeCloseTo(0.3, 12)
  })

  it('separates the observed spread from a chance allocation of the same mentions', () => {
    const concentration = RUN.output.concentration
    expect(concentration.uniformReferenceDraws).toBe(200)
    expect(concentration.uniformReferenceGiniMedian).toBeLessThan(concentration.giniCoefficient)
    expect(concentration.uniformReferenceDrawsAtOrAboveObserved).toBe(0)
  })
})

describe('honesty of the run record', () => {
  it('reports coverage against the whole corpus, not against what it used', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBe(RUN.output.recordsNamingAnyCounterparty)
    expect(RUN.coverage.used).toBeLessThan(RUN.coverage.considered)
    expect(RUN.coverage.reason).toContain('name no enzyme or transporter')
  })

  it('states the limits a reader of the dataset needs', () => {
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toContain('ICH M12')
    expect(caveats).toContain('Documentation frequency is not importance')
    expect(caveats).toContain('no relation between one medicine and another')
    expect(caveats).toContain('neither reassurance nor alarm')
    expect(RUN.caveats.length).toBeGreaterThanOrEqual(8)
  })
})
