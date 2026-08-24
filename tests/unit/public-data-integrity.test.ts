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
const shardFiles = manifest.files.filter((file) => file.path.endsWith('.ndjson'))
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

  it('contains no honest, honestly, or plainly self-certifier in any public string field', () => {
    const matches: string[] = []
    const visit = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        if (/\b(?:honest(?:ly)?|plainly)\b/i.test(value)) matches.push(path)
        return
      }
      if (Array.isArray(value)) {
        value.forEach((entry, index) => visit(entry, `${path}[${index}]`))
        return
      }
      if (!value || typeof value !== 'object') return
      for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        visit(entry, `${path}.${key}`)
      }
    }

    for (const record of records) visit(record, record.id)
    expect(matches).toEqual([])
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
