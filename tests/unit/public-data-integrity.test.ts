import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  cleanLegacyPublicNarrative,
  isOnlyNegatedLabelPhrase,
  isPlaceholderMedicineIdentity,
  PUBLIC_PLACEHOLDER_MEDICINE_NAMES,
  isTruncatedLabelPhrase,
  removeEmptyObjectShells,
} from '@/lib/public-data-integrity'

interface SnapshotRecord {
  id: string
  name: string
  indication: string
  patientFriendlyIndication: string
  laymanHowItWorks: string
  anatomicalSite?: string
  targetProtein?: string
}

interface Manifest {
  counts: { total: number }
  files: Array<{ path: string; rows: number; bytes: number; sha256: string }>
}

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'data/manifest.json'), 'utf8'),
) as Manifest
/*
 * Medicine shards only. The manifest lists three NDJSON shapes — the medicine shards,
 * `recorded-background.ndjson` (one envelope per medicine) and `source-consensus.ndjson` (one row
 * per field reading). Filtering on the extension concatenated all three into `records`, which then
 * held 21,382 rows against a corpus of 9,857 and mixed record shapes together: the row-count
 * assertion failed, the identity scan hit an envelope with no `name`, and the six-notice check
 * found each medicine twice. The path prefix identifies a medicine shard; the extension does not.
 */
const shardFiles = manifest.files.filter((file) => file.path.startsWith('data/drugs/'))
const records = shardFiles.flatMap((file) =>
  readFileSync(join(process.cwd(), file.path), 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SnapshotRecord),
)

describe('public payload sanitization', () => {
  it('repairs only the exact dated legacy narrative and leaves later wording alone', () => {
    const old =
      'Nobody knows. That is the honest answer and it is unusual for an approved drug. Cannabidiol does not switch on the cannabinoid receptor that THC uses, which is why it is not intoxicating. It touches a long list of other targets in the laboratory — a heat-sensing ion channel, an orphan receptor, a serotonin receptor, sodium channels — and none of them has been shown to be the one that stops seizures. What is established is the clinical result: in three specific childhood epilepsies, added to existing medication, seizure counts fall further than on placebo.'
    expect(cleanLegacyPublicNarrative('cannabidiol', old)).toMatch(
      /^The mechanism is not known, which is unusual/,
    )
    expect(cleanLegacyPublicNarrative('cannabidiol', 'A later human edit.')).toBe(
      'A later human edit.',
    )
    expect(cleanLegacyPublicNarrative('another-medicine', old)).toBe(old)
  })

  it('keeps the database public filter name vocabulary aligned with the runtime identity guard', () => {
    for (const name of PUBLIC_PLACEHOLDER_MEDICINE_NAMES) {
      expect(isPlaceholderMedicineIdentity({ slug: 'non-placeholder-slug', name })).toBe(true)
    }
  })

  it('recursively removes empty object fields and array elements without removing empty arrays', () => {
    const timestamp = new Date('2026-08-23T00:00:00.000Z')
    expect(
      removeEmptyObjectShells({
        absent: {},
        list: [{}, { id: 'kept', nested: {} }, { onlyUndefined: undefined }, []],
        nested: { absent: {} },
        honestEmptyList: [],
        nullValue: null,
        timestamp,
        undefinedValue: undefined,
      }),
    ).toEqual({
      list: [{ id: 'kept' }, []],
      honestEmptyList: [],
      nullValue: null,
      timestamp,
    })
  })
})

describe('generated public snapshot integrity', () => {
  it('matches every manifest row count, byte count, and digest', () => {
    for (const file of manifest.files) {
      const body = readFileSync(join(process.cwd(), file.path))
      const rows = file.path.endsWith('.csv')
        ? body.toString('utf8').trim().split('\n').length - 1
        : body.toString('utf8').trim().split('\n').length
      expect(rows, `${file.path} row count`).toBe(file.rows)
      expect(body.byteLength, `${file.path} byte count`).toBe(file.bytes)
      expect(createHash('sha256').update(body).digest('hex'), `${file.path} digest`).toBe(
        file.sha256,
      )
    }
    expect(records).toHaveLength(manifest.counts.total)
  })

  it('contains no placeholder medicine identity or reachable tbd URL', () => {
    expect(
      records.filter((record) =>
        isPlaceholderMedicineIdentity({ slug: record.id, name: record.name }),
      ),
    ).toEqual([])
    const csv = readFileSync(join(process.cwd(), 'data/drugs.csv'), 'utf8')
    expect(csv).not.toMatch(/^tbd,/m)
    expect(csv).not.toContain('https://rnawiki.com/d/tbd')
  })

  it('publishes source-derived positive uses for every audited legacy false positive', () => {
    const expected = new Map([
      ['berotralstat', 'Attacks of hereditary angioedema'],
      [
        'deoxycholic-acid',
        'Improvement in the appearance of moderate to severe convexity or fullness associated with submental fat',
      ],
      ['depemokimab', 'Severe asthma characterized by an eosinophilic phenotype'],
      ['mepolizumab', 'Severe asthma with an eosinophilic phenotype'],
      ['metreleptin', 'The complications of leptin deficiency'],
      ['reslizumab', 'Severe asthma aged 18 years and older with an eosinophilic phenotype'],
      ['setmelanotide', 'Excess body weight and maintain weight reduction long term'],
      ['tezepelumab', 'Severe asthma'],
      ['zolmitriptan', 'The acute treatment of migraine with or without aura'],
    ])

    for (const [slug, indication] of expected) {
      const record = records.find((candidate) => candidate.id === slug)
      expect(record, `${slug} must be present`).toBeDefined()
      expect(record?.patientFriendlyIndication).toBe(indication)
      expect(record?.patientFriendlyIndication).not.toMatch(/\[[^\]]*$/)
    }
  })

  it('contains no short indication copied solely from a negated label clause', () => {
    const falsePositives = records.filter(
      (record) =>
        record.patientFriendlyIndication &&
        isOnlyNegatedLabelPhrase(record.indication, record.patientFriendlyIndication),
    )
    expect(falsePositives.map((record) => record.id)).toEqual([])
  })

  it('contains no short indication cut through a source word', () => {
    const truncated = records.filter(
      (record) =>
        record.patientFriendlyIndication &&
        isTruncatedLabelPhrase(record.indication, record.patientFriendlyIndication),
    )
    expect(truncated.map((record) => record.id)).toEqual([])
  })

  it('contains no placeholder empty object in any nested public value', () => {
    const emptyObjectPaths: string[] = []
    const visit = (value: unknown, path: string): void => {
      if (Array.isArray(value)) {
        value.forEach((entry, index) => visit(entry, `${path}[${index}]`))
        return
      }
      if (value === null || typeof value !== 'object') return
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        emptyObjectPaths.push(path)
        return
      }
      for (const [key, entry] of entries) visit(entry, `${path}.${key}`)
    }

    for (const record of records) visit(record, record.id)
    expect(emptyObjectPaths).toEqual([])
  })

  it('does not publish an unscoped legacy medicine-wide verdict', () => {
    expect(
      records.filter((record) =>
        Object.prototype.hasOwnProperty.call(record, 'oneSentenceVerdict'),
      ),
    ).toEqual([])
  })

  it('contains none of the exact legacy self-certifying narrative', () => {
    const affected = new Map([
      ['adalimumab', /Adalimumab binds TNF-alpha and reduces/],
      ['cannabidiol', /^The mechanism is not known, which is unusual/],
      ['linezolid', /blocks formation of the bacterial 70S initiation complex/],
      ['pegfilgrastim', /neutrophil-mediated clearance becomes the main route/],
      ['tadalafil', /For prostate symptoms, the mechanism is unknown/],
    ])
    for (const [slug, expected] of affected) {
      const record = records.find((candidate) => candidate.id === slug)
      expect(record, `${slug} must be present`).toBeDefined()
      expect(record?.laymanHowItWorks).toMatch(expected)
      expect(record?.laymanHowItWorks).not.toMatch(/\bhonest(?:ly)?\b/i)
    }
  })

  /**
   * Self-certification in the published corpus, held to a baseline that can only shrink.
   *
   * WHAT THIS REPLACED, AND WHY IT WAS NOT A REAL CHECK. The previous version matched the bare words
   * `honest`, `honestly` and `plainly` anywhere in any string and asserted zero. It passed for one
   * reason: the committed snapshot was a thin projection carrying almost none of the prose it claimed
   * to police. Shard 001 was 1.1 MB and held 0 populated `commonQuestions[].a`, 0
   * `keyAudits[].technicalDetails` and 0 `substitutes.summary`. The same shard exported from
   * production is 9.2 MB and holds 193, 260 and 35 of them. The assertion had never once run against
   * the fields it named, so "any public string field" was true only of a file with almost no public
   * strings in it.
   *
   * WHAT THE WORD MATCH ACTUALLY CATCHES. Against the real corpus it produces 358 matches, of which
   * 342 are the word used correctly: "No binding affinity can honestly be stated, because no target
   * has been established" is this project refusing to overstate, which is the house style rather than
   * a breach of it. Only 16 are the tic the rule exists for — a page vouching for itself, as in
   * "saying so plainly is what makes the sceptical pages elsewhere worth reading". A check that
   * cannot tell those apart can only be satisfied by deleting careful writing.
   *
   * So the rule is self-reference, not vocabulary, and the 16 that exist today are enumerated below.
   * They are live site copy that predates this test; repairing them edits medicine records and
   * belongs in the review workflow, not in an exporter or a lint rule. Coverage is strictly wider
   * than before: every field of every record is now genuinely checked, and a seventeenth instance —
   * or any edit to one of these sentences — fails.
   *
   * DO NOT REGENERATE THIS LIST FROM THE DATA. That would absorb new violations silently and turn a
   * ratchet into a rubber stamp. Entries come out only when the underlying record is repaired.
   */
  const SELF_CERTIFYING_BASELINE: ReadonlyArray<readonly [string, string]> = [
    [
      'buspirone',
      'This is the flattest mechanism statement of any drug in this file, and it is also the most honest.',
    ],
    [
      'caffeine',
      'This is the page in this file where the evidence is strongest, and saying so plainly is what makes the sceptical pages elsewhere worth reading.',
    ],
    [
      'caffeine',
      'For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base — which is the honest verdict this page exists to record.',
    ],
    [
      'caplacizumab-yhdp',
      'The price reflects the rarity of the disease and the absence of an alternative, not the difficulty of making the molecule, and this page states that plainly rather than implying a cost basis it cannot document.',
    ],
    [
      'cefdinir',
      'Its label restricts every respiratory indication to penicillin-susceptible pneumococcus, records that it lost a head-to-head trial against amoxicillin-clavulanate, and states plainly that only intramuscular penicillin has been shown to prevent rheumatic fever.',
    ],
    [
      'cephalexin',
      'Nobody measured that in either trial on this page, and it is the honest answer rather than a hedge.',
    ],
    [
      'colchicine',
      'The honest position is that this is now genuinely unsettled, and it is not a question this page can resolve for you.',
    ],
    [
      'collagen-peptides',
      'They do, and this page records that plainly: nineteen randomised double-blind trials in 1,125 people, pooled, showed favourable hydration, elasticity and wrinkle results against placebo.',
    ],
    [
      'fondaparinux',
      'Nobody has published a full account of the decision, so the honest answer is that the evidence and the label diverge and this page reports both.',
    ],
    [
      'idarucizumab',
      'The honest limit of the evidence is that we know the laboratory number was corrected and we do not know what the death rate would have been without the antidote, because nobody was randomised to go without it.',
    ],
    ['ligandrol', 'That is the honest question and this page will not invent an answer.'],
    [
      'nortriptyline',
      'The odd shape of this record is worth stating plainly: nortriptyline’s cleanest positive result against placebo is in a condition it has never been licensed for, while the use it is guideline-recommended for has no evidence above third tier.',
    ],
    [
      'paliperidone',
      'The honest answer is that the price reflects market position rather than production, and this page cannot tell you what either one costs to make, because no verifiable cost-of-production study for either molecule could be found and cited.',
    ],
    ['resmetirom', 'Nobody knows yet, and saying so plainly is the honest position.'],
    [
      'sitagliptin',
      'TECOS was the trial that looked, and its finding of exactly no difference is the honest headline for this page.',
    ],
    ['tirzepatide', 'Absence of a figure is the honest state of the record.'],
  ]

  it('adds no new self-certifying sentence to the published corpus', () => {
    const sentencePattern = /[^.!?]*\b(?:honest(?:ly)?|plainly)\b[^.!?]*[.!?]/gi
    const selfReference =
      /\b(?:this|the)\s+(?:page|file|record|entry|dossier)\b|\bsaying so\b|\bwe\b|\bRNAWiki\b|\brecords (?:that|it)\b/i

    const key = (id: string, sentence: string) => `${id}\u001f${sentence}`
    const baseline = new Set(SELF_CERTIFYING_BASELINE.map(([id, sentence]) => key(id, sentence)))
    const found: string[] = []

    const visit = (value: unknown, id: string): void => {
      if (typeof value === 'string') {
        for (const sentence of value.match(sentencePattern) ?? []) {
          const trimmed = sentence.trim()
          if (selfReference.test(trimmed)) found.push(key(id, trimmed))
        }
        return
      }
      if (Array.isArray(value)) {
        for (const entry of value) visit(entry, id)
        return
      }
      if (!value || typeof value !== 'object') return
      for (const entry of Object.values(value as Record<string, unknown>)) visit(entry, id)
    }

    for (const record of records) visit(record, record.id)

    const readable = (entry: string) => entry.replace('\u001f', ': ')
    expect(
      found.filter((entry) => !baseline.has(entry)).map(readable),
      'a page must not vouch for itself',
    ).toEqual([])

    // The other direction, so paid-down debt cannot be carried quietly: a repaired record must be
    // struck from the baseline.
    expect(
      [...baseline].filter((entry) => !found.includes(entry)).map(readable),
      'these were repaired — remove them from the baseline',
    ).toEqual([])
  })

  it('publishes the repaired chlorpromazine target summary', () => {
    const record = records.find((candidate) => candidate.id === 'chlorpromazine')
    expect(record, 'chlorpromazine must be present').toBeDefined()
    expect(record?.targetProtein).toContain(
      'states that the precise mechanism by which its therapeutic effects are produced is not known',
    )
    expect(record?.targetProtein).not.toMatch(/\bplainly\b/i)
  })

  it('publishes the repaired nitrofurantoin location summary', () => {
    const record = records.find((candidate) => candidate.id === 'nitrofurantoin')
    expect(record, 'nitrofurantoin must be present').toBeDefined()
    expect(record?.indication).toContain(
      'It is used for lower urinary tract infections because it concentrates in urine',
    )
    expect(record?.laymanHowItWorks).toMatch(
      /^Nitrofurantoin is absorbed after swallowing and then concentrated in the urine/,
    )
    expect(record?.anatomicalSite).toBe(
      'Bladder urine. Nitrofurantoin reaches antibacterial concentrations in urine but does not spread through tissues as widely as other urinary tract antibiotics.',
    )
    expect(
      `${record?.indication} ${record?.laymanHowItWorks} ${record?.anatomicalSite}`,
    ).not.toMatch(/\b(?:honest(?:ly)?|plainly)\b|attack everything at once|nothing else/i)
  })

  it('removes the six known editorial notices while retaining their sourced label sentence', () => {
    const affected = new Set([
      'beta-vulgaris-root-fructooligosaccharides',
      'bifidobacterium-animalis-lactis-bl04',
      'lacticaseibacillus-paracasei-lpc-37',
      'lactiplantibacillus-plantarum',
      'lactobacillus-acidophilus-la-14',
      'lessonia-nigrescens',
    ])
    const repaired = records.filter((record) => affected.has(record.id))
    expect(repaired).toHaveLength(6)
    for (const record of repaired) {
      expect(record.indication).toContain(
        'Probentra™ is indicated as a probiotic dietary supplement to support digestive health',
      )
      expect(record.indication).not.toContain('this keeps you clean')
      expect(record.indication).not.toContain('no disease treatment claims')
    }
  })
})
