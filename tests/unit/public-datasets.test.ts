import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { GET } from '@/app/api/datasets/[dataset]/route'
import {
  buildDossierCompletion,
  buildInventoryResolution,
  clearPublicDatasetCacheForTests,
  derivePublicSilenceScope,
  normalizePublicDatasetQuery,
  PUBLIC_DATASET_IDS,
  PUBLIC_DATASET_MAX_LIMIT,
  publicBackgroundSourceHref,
  publicDatasetAllowedParameters,
  publicDatasetRowMatches,
  publicDatasetSourceCandidates,
  resolveCurrentPublicAgentArtifact,
  type PublicDatasetConsensusReadingRecord,
  type PublicDatasetRow,
  type PublicDatasetSentenceRecord,
  queryPublicDataset,
} from '@/lib/public-datasets'
import { resetRateLimits } from '@/lib/rate-limit'

/** True once the corpus exporter has written the file a dataset reads. */
function artifactPresent(id: (typeof PUBLIC_DATASET_IDS)[number]): boolean {
  return publicDatasetSourceCandidates(id).some((candidate) =>
    existsSync(join(process.cwd(), candidate)),
  )
}

function context(dataset: string) {
  return { params: Promise.resolve({ dataset }) }
}

function request(path: string): Request {
  return new Request(`https://rnawiki.com${path}`, {
    headers: { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200) + 1}` },
  })
}

function isSentenceRecord(value: unknown): value is PublicDatasetSentenceRecord {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'polarity' in value &&
    'sourceIdentifier' in value &&
    'excerpt' in value,
  )
}

afterEach(() => {
  clearPublicDatasetCacheForTests()
  resetRateLimits()
})

describe('public dataset projections', () => {
  it('has exactly six allowlisted identifiers and permits only current post-repair agent runs', () => {
    expect(PUBLIC_DATASET_IDS).toEqual([
      'enzyme-transporter-negatives',
      'source-consensus',
      'silence-ledger',
      'coverage-ledger',
      'inventory-resolution',
      'dossier-completion',
    ])

    for (const id of [
      'enzyme-transporter-negatives',
      'silence-ledger',
      'coverage-ledger',
    ] as const) {
      expect(publicDatasetSourceCandidates(id)).toHaveLength(1)
      expect(publicDatasetSourceCandidates(id)[0]).toMatch(/^data\/agents\/current\//)
    }
    expect(publicDatasetSourceCandidates('source-consensus')).toEqual([
      'data/source-consensus.ndjson',
    ])
    expect(publicDatasetSourceCandidates('inventory-resolution')).toEqual([
      'data/inventory-resolution.ndjson',
    ])
    // The completion corpus is sharded, so the candidate is the published directory and the shard
    // list is read from the manifest rather than guessed from a filename.
    expect(publicDatasetSourceCandidates('dossier-completion')).toEqual(['data/dossier-completion'])
  })

  it('fails closed when the current package is absent instead of serving historical output', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rnawiki-public-agent-missing-'))
    try {
      await expect(
        resolveCurrentPublicAgentArtifact('enzyme-and-transporter-documentation.json', root),
      ).rejects.toThrow('public dataset artifact is unavailable')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it.each(PUBLIC_DATASET_IDS)(
    '%s names every public field and never exposes review work',
    async (id) => {
      if (!artifactPresent(id)) {
        // A dataset whose artifact has not been exported yet refuses to serve rather than
        // serving an older or partial file.
        await expect(queryPublicDataset(id, { limit: 3 })).rejects.toThrow(
          'public dataset artifact is unavailable',
        )
        return
      }
      const page = await queryPublicDataset(id, { limit: 3 })
      expect(page.dataset.id).toBe(id)
      expect(page.dataset.rowCount).toBeGreaterThan(0)
      expect(page.rows.length).toBeGreaterThan(0)
      expect(page.rows.length).toBeLessThanOrEqual(3)
      expect(page.dataset.schema.length).toBeGreaterThan(0)
      expect(page.dataset.methodology.length).toBeGreaterThan(0)
      expect(page.dataset.sourceLimitations.length).toBeGreaterThan(0)
      expect(page.dataset.sourceExamples.length).toBeGreaterThan(0)
      const serialized = JSON.stringify(page)
      expect(serialized).not.toMatch(/\bqueue\b/i)
      expect(serialized).not.toMatch(
        /"(?:review|historicalPreRepair|eligibleForActiveReview|inputDigest|flags)"\s*:/u,
      )
    },
  )

  it('groups every enzyme sentence without truncation and keeps all three polarity counts', async () => {
    const sourcePath = publicDatasetSourceCandidates('enzyme-transporter-negatives')
      .map((candidate) => join(process.cwd(), candidate))
      .find(existsSync)
    expect(sourcePath).toBeDefined()
    const artifact = JSON.parse(readFileSync(sourcePath!, 'utf8')) as {
      run?: { output: { counterparties: Array<{ counterparty: string; mentions: Mention[] }> } }
      output?: { counterparties: Array<{ counterparty: string; mentions: Mention[] }> }
    }
    interface Mention {
      slug: string
      name: string
      role?: string
      polarity?: 'ASSERTED' | 'NEGATED'
      sourceIdentifier: string
      sourceVersion?: string
      sourceEffectiveDate?: string
      excerpt: string
    }
    const counterparties = artifact.run?.output.counterparties ?? artifact.output?.counterparties
    expect(counterparties).toBeDefined()
    const grouped = new Map<
      string,
      { slug: string; counterparty: string; role: string; mentions: Mention[] }
    >()
    let rawMentionCount = 0
    for (const profile of counterparties ?? []) {
      for (const mention of profile.mentions) {
        rawMentionCount += 1
        const role = mention.role ?? 'NOT_RECORDED'
        const key = JSON.stringify([mention.slug, profile.counterparty, role])
        const held = grouped.get(key) ?? {
          slug: mention.slug,
          counterparty: profile.counterparty,
          role,
          mentions: [],
        }
        held.mentions.push(mention)
        grouped.set(key, held)
      }
    }
    const target = [...grouped.values()].sort(
      (left, right) => right.mentions.length - left.mentions.length,
    )[0]!
    expect(target.mentions.length).toBeGreaterThan(1)

    const page = await queryPublicDataset('enzyme-transporter-negatives', {
      q: target.slug,
      counterparty: target.counterparty,
      role: target.role,
      limit: PUBLIC_DATASET_MAX_LIMIT,
    })
    const row = page.rows.find(
      (candidate) =>
        candidate.medicineSlug === target.slug &&
        candidate.counterparty === target.counterparty &&
        candidate.role === target.role,
    )
    expect(row).toBeDefined()
    const sentences = Array.isArray(row?.sentences) ? row.sentences.filter(isSentenceRecord) : []
    expect(sentences).toHaveLength(target.mentions.length)
    expect(Number(row?.assertedCount)).toBe(
      target.mentions.filter((mention) => mention.polarity === 'ASSERTED').length,
    )
    expect(Number(row?.deniedCount)).toBe(
      target.mentions.filter((mention) => mention.polarity === 'NEGATED').length,
    )
    expect(Number(row?.polarityNotRecordedCount)).toBe(
      target.mentions.filter((mention) => mention.polarity === undefined).length,
    )
    expect(sentences.map((sentence) => sentence.sourceIdentifier)).toEqual(
      target.mentions.map((mention) => mention.sourceIdentifier),
    )
    expect(sentences.map((sentence) => sentence.excerpt)).toEqual(
      target.mentions.map((mention) => mention.excerpt),
    )
    expect(sentences.map((sentence) => sentence.sourceVersion)).toEqual(
      target.mentions.map((mention) => mention.sourceVersion ?? null),
    )
    expect(sentences.map((sentence) => sentence.sourceEffectiveDate)).toEqual(
      target.mentions.map((mention) => mention.sourceEffectiveDate ?? null),
    )
    expect(
      page.dataset.coverage.find((metric) => metric.label === 'Source sentence records')?.value,
    ).toBe(rawMentionCount)
    expect(page.dataset.doesNotMean).toContain('not a drug interaction checker')
    expect(page.dataset.doesNotMean).toContain('not dosing or treatment advice')
  })

  it('keeps unextracted context, disagreement, and non-comparability as separate states', async () => {
    const differ = await queryPublicDataset('source-consensus', {
      state: 'differ',
      limit: 20,
    })
    const insufficient = await queryPublicDataset('source-consensus', {
      state: 'insufficient_context',
      limit: 20,
    })
    const notComparable = await queryPublicDataset('source-consensus', {
      state: 'not_comparable',
      limit: 20,
    })

    expect(differ.total).toBe(0)
    expect(insufficient.total).toBeGreaterThan(0)
    expect(notComparable.total).toBeGreaterThan(0)
    expect(differ.rows.every((row) => row.comparisonState === 'differ')).toBe(true)
    expect(insufficient.rows.every((row) => row.comparisonState === 'insufficient_context')).toBe(
      true,
    )
    expect(notComparable.rows.every((row) => row.comparisonState === 'not_comparable')).toBe(true)
    expect(differ.dataset.doesNotMean).toContain('not_comparable')
    expect(differ.dataset.doesNotMean).toContain('not disagreement')
    expect(differ.dataset.doesNotMean).toContain('sources print')
    expect(differ.dataset.filters.find((filter) => filter.parameter === 'state')?.values).toEqual([
      'agree',
      'differ',
      'not_comparable',
      'insufficient_context',
    ])
  })

  it('projects every consensus reading and every represented source without child truncation', async () => {
    const rawRows = readFileSync(join(process.cwd(), 'data/source-consensus.ndjson'), 'utf8')
      .trim()
      .split('\n')
      .map(
        (line) =>
          JSON.parse(line) as {
            readings: Array<{ sourceCount: number; sources: unknown[] }>
            comparisonReasons: string[]
          },
      )
    const projectedRows = []
    for (let offset = 0; ; offset += PUBLIC_DATASET_MAX_LIMIT) {
      const page = await queryPublicDataset('source-consensus', {
        limit: PUBLIC_DATASET_MAX_LIMIT,
        offset,
      })
      projectedRows.push(...page.rows)
      if (page.nextOffset === null) break
    }
    expect(projectedRows).toHaveLength(rawRows.length)

    const rawReadingCount = rawRows.reduce((sum, row) => sum + row.readings.length, 0)
    const rawSourceCount = rawRows.reduce(
      (sum, row) =>
        sum + row.readings.reduce((fieldSum, reading) => fieldSum + reading.sources.length, 0),
      0,
    )
    const projectedReadings = projectedRows.flatMap((row) =>
      Array.isArray(row.readings) ? (row.readings as PublicDatasetConsensusReadingRecord[]) : [],
    )
    expect(projectedReadings).toHaveLength(rawReadingCount)
    expect(projectedReadings.reduce((sum, reading) => sum + reading.sources.length, 0)).toBe(
      rawSourceCount,
    )
    expect(
      projectedRows.reduce(
        (sum, row) =>
          sum + (Array.isArray(row.comparisonReasons) ? row.comparisonReasons.length : 0),
        0,
      ),
    ).toBe(rawRows.reduce((sum, row) => sum + row.comparisonReasons.length, 0))
    for (const reading of projectedReadings) {
      expect(reading.populationContext.trim()).not.toBe('')
      expect(reading.sources).toHaveLength(reading.sourceCount)
      for (const source of reading.sources) {
        expect(source.excerpt).toBeTruthy()
        expect(source.sourceVersion === null || typeof source.sourceVersion === 'string').toBe(true)
        expect(
          source.sourceEffectiveDate === null || typeof source.sourceEffectiveDate === 'string',
        ).toBe(true)
      }
    }
  })

  it('derives clickable sources only from allowlisted kind and identifier adapters', async () => {
    const href = publicBackgroundSourceHref({
      kind: 'FDA_LABEL',
      identifier: '00000000-0000-4000-8000-000000000001',
    })
    expect(href).not.toBeNull()
    expect(new URL(href!).hostname).toBe('api.fda.gov')
    expect(
      publicBackgroundSourceHref({
        kind: 'PUBLISHED_ANALYSIS',
        identifier: 'https://attacker.invalid/not-a-source',
      }),
    ).toBeNull()

    const page = await queryPublicDataset('source-consensus', { limit: 5 })
    const sources = page.rows.flatMap((row) =>
      Array.isArray(row.readings)
        ? (row.readings as PublicDatasetConsensusReadingRecord[]).flatMap(
            (reading) => reading.sources,
          )
        : [],
    )
    expect(sources.length).toBeGreaterThan(0)
    expect(
      sources.every(
        (source) =>
          source.sourceHref === null || new URL(source.sourceHref).hostname === 'api.fda.gov',
      ),
    ).toBe(true)
  })

  it('classifies verified silence from the exact question scope, never unrelated excerpts', () => {
    const fdaSource = {
      kind: 'FDA_LABEL',
      identifier: '00000000-0000-4000-8000-000000000001',
      label: 'Exact-scope fixture label',
      locator: 'https://attacker.invalid/recorded-but-not-trusted',
      retrievedAt: '2026-08-30',
      excerpt: 'Bioavailability was 80 percent.',
    }
    const background = {
      version: 'medicine-background/v1',
      authoredAt: '2026-08-30',
      pharmacokinetics: {
        routeAsRecorded: 'oral',
        bioavailability: {
          display: '80%',
          numeric: 80,
          unit: '%',
          populationContext: 'adults',
          source: fdaSource,
        },
      },
      mechanism: {
        statements: [
          {
            textAsRecorded: 'The mechanism statement is recorded.',
            source: { ...fdaSource, excerpt: 'The mechanism statement is recorded.' },
          },
        ],
      },
    }

    expect(
      derivePublicSilenceScope({
        state: 'SILENT',
        questionId: 'half_life',
        recordedBackground: background,
      }),
    ).toMatchObject({ silenceMeaning: 'NO_QUALIFYING_SOURCE_READ', recordedSourceCount: 0 })
    const exactScope = derivePublicSilenceScope({
      state: 'SILENT',
      questionId: 'bioavailability',
      recordedBackground: background,
    })
    expect(exactScope).toMatchObject({
      silenceMeaning: 'NO_QUALIFYING_SOURCE_READ',
      recordedSourceCount: 0,
    })
    const exactPersistedBinding = derivePublicSilenceScope({
      state: 'SILENT',
      questionId: 'bioavailability',
      recordedBackground: background,
      sourceIdentifiers: [`${fdaSource.kind}:${fdaSource.identifier}`],
    })
    expect(exactPersistedBinding).toMatchObject({
      silenceMeaning: 'SOURCE_READ_NO_ANSWER',
      recordedSourceCount: 1,
    })
    expect(exactPersistedBinding.sources[0]?.sourceLocator).toBe(
      'https://attacker.invalid/recorded-but-not-trusted',
    )
    expect(new URL(exactPersistedBinding.sources[0]!.sourceHref!).hostname).toBe('api.fda.gov')
    expect(
      derivePublicSilenceScope({
        state: 'NOT_ESTABLISHED',
        questionId: 'population_pediatric',
        recordedBackground: background,
      }).silenceMeaning,
    ).toBe('EXPLICIT_NOT_ESTABLISHED')
  })

  it('keeps unverifiable kinds and source records without excerpts distinct', () => {
    const base = {
      version: 'medicine-background/v1',
      authoredAt: '2026-08-30',
    }
    const unverifiable = derivePublicSilenceScope({
      state: 'SILENT',
      questionId: 'molecular_identity',
      sourceIdentifiers: ['RXNORM:12345'],
      recordedBackground: {
        ...base,
        molecularIdentity: {
          molecularFormula: {
            display: 'C2H6O',
            populationContext: 'source compound record',
            source: {
              kind: 'RXNORM',
              identifier: '12345',
              label: 'RxNorm fixture',
              retrievedAt: '2026-08-30',
              excerpt: 'C2H6O',
            },
          },
        },
      },
    })
    expect(unverifiable.silenceMeaning).toBe('SOURCE_KIND_NOT_MACHINE_VERIFIABLE')

    const noExcerpt = derivePublicSilenceScope({
      state: 'SILENT',
      questionId: 'boxed_warning',
      sourceIdentifiers: ['FDA_LABEL:00000000-0000-4000-8000-000000000002'],
      recordedBackground: {
        ...base,
        safety: {
          boxedWarning: {
            textAsRecorded: 'Recorded wording',
            source: {
              kind: 'FDA_LABEL',
              identifier: '00000000-0000-4000-8000-000000000002',
              label: 'No-excerpt fixture',
              retrievedAt: '2026-08-30',
            },
          },
        },
      },
    })
    expect(noExcerpt.silenceMeaning).toBe('SOURCE_RECORDED_NO_QUALIFYING_READ')
  })

  it('keeps silence, explicit non-establishment, and mention-only records distinct', async () => {
    const silent = await queryPublicDataset('silence-ledger', {
      state: 'SILENT',
      limit: 8,
    })
    const notEstablished = await queryPublicDataset('silence-ledger', {
      state: 'NOT_ESTABLISHED',
      limit: 8,
    })
    const sourceReadNoAnswer = await queryPublicDataset('silence-ledger', {
      meaning: 'SOURCE_READ_NO_ANSWER',
      limit: 1,
    })
    const noQualifyingSourceRead = await queryPublicDataset('silence-ledger', {
      meaning: 'NO_QUALIFYING_SOURCE_READ',
      limit: 8,
    })
    const mentionOnly = await queryPublicDataset('silence-ledger', {
      state: 'RECORDED',
      q: 'abacavir',
      limit: 20,
    })

    expect(silent.total).toBeGreaterThan(0)
    expect(notEstablished.total).toBeGreaterThan(0)
    expect(silent.rows.every((row) => row.state === 'SILENT')).toBe(true)
    expect(sourceReadNoAnswer.total).toBe(0)
    expect(noQualifyingSourceRead.total).toBe(silent.total)
    expect(
      noQualifyingSourceRead.rows.every(
        (row) =>
          Array.isArray(row.sourceIdentifiers) &&
          row.sourceIdentifiers.length === 0 &&
          Array.isArray(row.scopedSources) &&
          row.scopedSources.length === 0,
      ),
    ).toBe(true)
    expect(notEstablished.rows.every((row) => row.state === 'NOT_ESTABLISHED')).toBe(true)
    expect(
      notEstablished.rows.every((row) => row.silenceMeaning === 'EXPLICIT_NOT_ESTABLISHED'),
    ).toBe(true)
    expect(mentionOnly.rows.some((row) => row.mentionedWithoutFinding === true)).toBe(true)
    expect(silent.dataset.doesNotMean).toContain('not evidence of safety')
  })

  it('keeps each source-read meaning independently filterable', async () => {
    const meanings = [
      'EXPLICIT_NOT_ESTABLISHED',
      'SOURCE_READ_NO_ANSWER',
      'NO_QUALIFYING_SOURCE_READ',
      'SOURCE_KIND_NOT_MACHINE_VERIFIABLE',
      'SOURCE_RECORDED_NO_QUALIFYING_READ',
    ]
    for (const meaning of meanings) {
      const page = await queryPublicDataset('silence-ledger', { meaning, limit: 3 })
      expect(page.rows.every((row) => row.silenceMeaning === meaning)).toBe(true)
      expect(
        page.dataset.filters.find((filter) => filter.parameter === 'meaning')?.values,
      ).toContain(meaning)
    }
  })

  it('filters coverage by an exact module without turning module count into quality', async () => {
    const page = await queryPublicDataset('coverage-ledger', {
      module: 'mechanism',
      limit: 20,
    })
    expect(page.total).toBeGreaterThan(0)
    expect(
      page.rows.every((row) =>
        Array.isArray(row.modulesPresent)
          ? row.modulesPresent.some((module) => module === 'mechanism')
          : false,
      ),
    ).toBe(true)
    for (const row of page.rows) {
      expect(row.ordinaryQuestionsAnswered).toEqual(expect.any(Array))
      expect(row.specialistModules).toEqual(expect.any(Array))
      expect(row.sourceBoundStatementCount).toEqual(expect.any(Number))
      expect(row.reviewedStatus).toBe('NOT_PUBLICLY_OBSERVABLE')
      expect(row.freshnessStatus).toBe('NOT_PUBLICLY_OBSERVABLE')
      expect(row.conflicts).toEqual(expect.any(Array))
      expect(row.missingQuestions).toEqual(expect.any(Array))
      expect(row.explicitNotEstablishedQuestions).toEqual(expect.any(Array))
      expect(row.noSourceReadState).toMatch(
        /^(?:SOURCE_READ_RECORDED|SOURCE_RECORDED_NO_QUALIFYING_READ|NO_QUALIFYING_SOURCE_RECORDED)$/,
      )
    }
    expect(page.dataset.doesNotMean).toContain('does not mean')
    expect(page.dataset.doesNotMean).toContain('safer')
  })

  it('does not turn unextracted context or not_comparable into coverage conflicts', async () => {
    const page = await queryPublicDataset('coverage-ledger', { q: 'abiraterone', limit: 20 })
    const row = page.rows.find((candidate) => candidate.medicineSlug === 'abiraterone')
    expect(row).toBeDefined()
    expect(row?.conflicts).toEqual([])
    expect(row?.ordinaryQuestionsAnswered).not.toContain('unknown-conflicting-stale')
    expect(row?.specialistModules).not.toContain('sourceConflict')
    expect(row?.specialistModulesNotObservable).toEqual(['staleExactBindings'])
  })

  it('enforces the shared request bound before slicing rows', async () => {
    await expect(
      queryPublicDataset('coverage-ledger', { limit: PUBLIC_DATASET_MAX_LIMIT + 1 }),
    ).rejects.toThrow(`limit must be an integer from 1 to ${PUBLIC_DATASET_MAX_LIMIT}`)
  })
})

describe('GET /api/datasets/[dataset]', () => {
  it('returns only a bounded JSON projection with pagination links', async () => {
    const response = await GET(
      request('/api/datasets/source-consensus?state=insufficient_context&limit=4'),
      context('source-consensus'),
    )
    const body = (await response.json()) as {
      dataset: { id: string }
      page: { returned: number; limit: number; next: string | null; csv: string }
      rows: Array<{ comparisonState: string }>
    }

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(body.dataset.id).toBe('source-consensus')
    expect(body.page.returned).toBe(4)
    expect(body.page.limit).toBe(4)
    expect(body.page.next).toContain('state=insufficient_context')
    expect(body.page.csv).toContain('format=csv')
    expect(body.rows.every((row) => row.comparisonState === 'insufficient_context')).toBe(true)
    expect(JSON.stringify(body)).not.toMatch(/\bqueue\b/i)
  })

  it('serves a bounded CSV projection rather than a source file', async () => {
    const response = await GET(
      request('/api/datasets/coverage-ledger?module=mechanism&limit=3&format=csv'),
      context('coverage-ledger'),
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(response.headers.get('content-disposition')).toContain('rnawiki-coverage-ledger-0.csv')
    expect(response.headers.get('x-total-count')).toMatch(/^\d+$/)
    expect(body.trim().split('\n')).toHaveLength(4)
    expect(body).toContain('"medicineSlug"')
    expect(body).not.toMatch(/queue/i)
  })

  it('keeps a complete grouped sentence array in JSON and losslessly encodes it in CSV', async () => {
    const path =
      '/api/datasets/enzyme-transporter-negatives?q=abacavir&counterparty=CYP3A4&role=INHIBITOR&limit=1'
    const jsonResponse = await GET(request(path), context('enzyme-transporter-negatives'))
    const json = (await jsonResponse.json()) as {
      rows: Array<{
        assertedCount: number
        deniedCount: number
        polarityNotRecordedCount: number
        sentences: PublicDatasetSentenceRecord[]
      }>
    }
    expect(jsonResponse.status).toBe(200)
    expect(json.rows).toHaveLength(1)
    const row = json.rows[0]!
    expect(row.sentences).toHaveLength(
      row.assertedCount + row.deniedCount + row.polarityNotRecordedCount,
    )

    const csvResponse = await GET(
      request(`${path}&format=csv`),
      context('enzyme-transporter-negatives'),
    )
    const csv = await csvResponse.text()
    expect(csvResponse.status).toBe(200)
    expect(csv).toContain('"sentences"')
    expect(csv).toContain('[{""polarity"":')
    for (const sentence of row.sentences) {
      expect(csv).toContain(sentence.sourceIdentifier)
      expect(csv).toContain(sentence.excerpt.replaceAll('"', '""'))
    }
  })

  it('keeps a complete consensus child list in both JSON and CSV', async () => {
    const rawRows = readFileSync(join(process.cwd(), 'data/source-consensus.ndjson'), 'utf8')
      .trim()
      .split('\n')
      .map(
        (line) =>
          JSON.parse(line) as {
            slug: string
            field: string
            readings: Array<{
              display: string
              populationContext: string
              sourceCount: number
              sources: Array<{ identifier: string; excerpt: string }>
            }>
          },
      )
    const target = rawRows
      .flatMap((row) => row.readings.map((reading) => ({ row, reading })))
      .sort((left, right) => right.reading.sources.length - left.reading.sources.length)[0]!
    expect(target.reading.sources.length).toBeGreaterThan(4)
    const path = `/api/datasets/source-consensus?q=${encodeURIComponent(target.row.slug)}&field=${encodeURIComponent(target.row.field)}&limit=10`
    const jsonResponse = await GET(request(path), context('source-consensus'))
    const json = (await jsonResponse.json()) as {
      rows: Array<{ readings: PublicDatasetConsensusReadingRecord[] }>
    }
    expect(jsonResponse.status).toBe(200)
    const projected = json.rows[0]?.readings.find(
      (reading) => reading.display === target.reading.display,
    )
    expect(projected?.populationContext).toBe(target.reading.populationContext)
    expect(projected?.sources).toHaveLength(target.reading.sourceCount)

    const csvResponse = await GET(request(`${path}&format=csv`), context('source-consensus'))
    const csv = await csvResponse.text()
    expect(csvResponse.status).toBe(200)
    const lastSource = target.reading.sources.at(-1)!
    expect(csv).toContain(lastSource.identifier)
    expect(csv).toContain(lastSource.excerpt.replaceAll('"', '""'))
  })

  it('accepts the allowlisted silence-meaning filter', async () => {
    const response = await GET(
      request('/api/datasets/silence-ledger?meaning=NO_QUALIFYING_SOURCE_READ&limit=2'),
      context('silence-ledger'),
    )
    const body = (await response.json()) as {
      rows: Array<{ silenceMeaning: string }>
    }
    expect(response.status).toBe(200)
    expect(body.rows).toHaveLength(2)
    expect(body.rows.every((row) => row.silenceMeaning === 'NO_QUALIFYING_SOURCE_READ')).toBe(true)
  })

  it('rejects unknown datasets, unsupported filters, and oversized pages', async () => {
    const unknown = await GET(request('/api/datasets/private-records'), context('private-records'))
    expect(unknown.status).toBe(404)

    const unsupported = await GET(
      request('/api/datasets/source-consensus?route=CURATED'),
      context('source-consensus'),
    )
    expect(unsupported.status).toBe(422)

    const oversized = await GET(
      request(`/api/datasets/source-consensus?limit=${PUBLIC_DATASET_MAX_LIMIT + 1}`),
      context('source-consensus'),
    )
    expect(oversized.status).toBe(422)

    const duplicate = await GET(
      request('/api/datasets/source-consensus?state=agree&state=differ'),
      context('source-consensus'),
    )
    expect(duplicate.status).toBe(422)
  })
})

describe('dataset discoverability', () => {
  it('links the public reader from the site footer', () => {
    const footer = readFileSync(join(process.cwd(), 'components/SiteFooter.tsx'), 'utf8')
    expect(footer).toContain("href: '/datasets'")
    expect(footer).toContain("label: 'Public datasets'")
  })

  it('keeps raw file access out of the route handlers and browser page', () => {
    const api = readFileSync(join(process.cwd(), 'app/api/datasets/[dataset]/route.ts'), 'utf8')
    const page = readFileSync(join(process.cwd(), 'app/datasets/[dataset]/page.tsx'), 'utf8')
    expect(api).not.toContain('readFile(')
    expect(api).not.toContain('sendFile')
    expect(page).not.toContain('fetch(')
    expect(page).not.toContain('readFile(')
    expect(api).toContain('isPublicDatasetId')
    expect(api).toContain('PUBLIC_DATASET_MAX_LIMIT')
  })

  it('keeps public dataset reading available during account checks', () => {
    const shell = readFileSync(join(process.cwd(), 'components/AppShell.tsx'), 'utf8')
    expect(shell).toContain("pathname.startsWith('/datasets')")
    expect(shell).toContain('sessionActionLocked && !publicReadingStaysAvailable')
  })
})

/**
 * The identity and completion projections read files the corpus exporter writes, so these cases
 * build them from fixture lines rather than from whatever the checked-in snapshot happens to hold.
 * Two rules are pinned here because breaking either one is a release failure rather than a bug:
 * a published identity row never names another record, and a completion state is never described
 * as a fact about a medicine.
 */
describe('record identity and dossier completion projections', () => {
  const INVENTORY_LINES = [
    {
      originalRecordId: 'drg_alpha',
      originalSlug: 'alpha-medicine',
      originalName: 'Alpha medicine',
      entityClass: 'APPROVED_MEDICINE',
      entityClassRule: 'approval-status-is-fda-approved',
      resolutionStatus: 'CANONICAL_ENTITY',
      canonicalSlug: 'alpha-medicine',
      redirectTargetSlug: null,
      identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
      identitySourceKinds: ['PUBCHEM_CID', 'UNII'],
      attributionWarningCodes: ['SHARED_REGISTRY_IDENTIFIER'],
      resolutionEvidence: [],
      contentDigest: 'a'.repeat(64),
      resolverVersion: 'inventory-resolution/v1',
    },
    {
      originalRecordId: 'drg_alpha_dup',
      originalSlug: 'alpha-medicine-2',
      originalName: 'Alpha medicine',
      entityClass: 'APPROVED_MEDICINE',
      entityClassRule: 'approval-status-is-fda-approved',
      resolutionStatus: 'DUPLICATE_OF_CANONICAL_ENTITY',
      canonicalSlug: 'alpha-medicine',
      redirectTargetSlug: 'alpha-medicine',
      identityConfidence: 'NAME_ONLY',
      identitySourceKinds: [],
      attributionWarningCodes: ['NAME_ONLY_IDENTITY'],
      resolutionEvidence: ['Identical name after punctuation removal: alpha-medicine'],
      contentDigest: 'b'.repeat(64),
      resolverVersion: 'inventory-resolution/v1',
    },
    {
      originalRecordId: 'drg_placeholder',
      originalSlug: 'header',
      originalName: 'Header',
      entityClass: 'PLACEHOLDER',
      entityClassRule: 'placeholder-identity',
      resolutionStatus: 'INVALID_IDENTITY_GONE',
      canonicalSlug: 'header',
      redirectTargetSlug: null,
      identityConfidence: 'PLACEHOLDER',
      identitySourceKinds: [],
      attributionWarningCodes: [],
      resolutionEvidence: ['The recorded name identifies no substance.'],
      contentDigest: 'c'.repeat(64),
      resolverVersion: 'inventory-resolution/v1',
    },
  ]

  const COMPLETION_LINES = [
    {
      slug: 'alpha-medicine',
      name: 'Alpha medicine',
      entityClass: 'APPROVED_MEDICINE',
      status: 'COMPLETE',
      resolverVersion: 'dossier-completion/v1',
      inputDigest: 'd'.repeat(64),
      contentChangedAt: '2026-09-01T00:00:00.000Z',
      applicableSectionCount: 2,
      terminalSectionCount: 2,
      nonTerminalSectionIds: [],
      humanReadSuggestedSectionIds: ['literature-search'],
      sections: [
        {
          sectionId: 'identity',
          state: 'EXACT_STRUCTURED_SOURCE_DATA',
          basisKind: 'REGISTRY_IDENTIFIER',
          basis: 'Two registry identifiers are recorded on this record.',
          sourceRefs: [{ kind: 'UNII', identifier: '9100L32L2N' }],
        },
        {
          sectionId: 'literature-search',
          state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
          basisKind: 'PUBMED_SEARCH_RECORD',
          basis: 'A dated search returned no report that met the recorded rule.',
          counts: { searchHits: 4, qualifying: 0 },
          sourceRefs: [{ kind: 'PUBMED_SEARCH', identifier: 'alpha-medicine-2026-09-01' }],
        },
      ],
    },
    {
      slug: 'beta-preparation',
      name: 'Beta preparation',
      entityClass: 'BOTANICAL_OR_ORGANISM_PREPARATION',
      status: 'INCOMPLETE',
      resolverVersion: 'dossier-completion/v1',
      inputDigest: 'e'.repeat(64),
      contentChangedAt: '2026-09-02T00:00:00.000Z',
      applicableSectionCount: 2,
      terminalSectionCount: 1,
      nonTerminalSectionIds: ['trial-registry'],
      humanReadSuggestedSectionIds: [],
      sections: [
        {
          sectionId: 'biological-identity',
          state: 'EXACT_SOURCE_BACKED',
          basisKind: 'TAXONOMY_RECORD',
          basis: 'A taxonomy record names the organism.',
          sourceRefs: [{ kind: 'NCBI_TAXONOMY', identifier: '3562' }],
        },
        {
          sectionId: 'trial-registry',
          state: 'SEARCH_PENDING',
          basisKind: 'NOT_YET_RUN',
          basis: 'The dated registry search for this record has not run.',
          sourceRefs: [],
        },
      ],
    },
  ]

  function writeFixture(name: string, lines: readonly unknown[]): string {
    const directory = mkdtempSync(join(tmpdir(), 'rnawiki-public-dataset-fixture-'))
    const path = join(directory, name)
    writeFileSync(path, `${lines.map((line) => JSON.stringify(line)).join('\n')}\n`)
    return path
  }

  /** Two rows fit in one shard, which is the layout the exporter writes for a small corpus. */
  function writeCompletionShards(lines: readonly unknown[]): string[] {
    return [writeFixture('dossier-completion-001.ndjson', lines)]
  }

  it('publishes an identity resolution without naming any other record', async () => {
    const path = writeFixture('inventory-resolution.ndjson', INVENTORY_LINES)
    try {
      const loaded = await buildInventoryResolution(path, 'data/inventory-resolution.ndjson')
      expect(loaded.descriptor.id).toBe('inventory-resolution')
      expect(loaded.descriptor.rowCount).toBe(3)
      expect(loaded.rows.map((row) => row.resolutionStatus)).toEqual([
        'CANONICAL_ENTITY',
        'DUPLICATE_OF_CANONICAL_ENTITY',
        'INVALID_IDENTITY_GONE',
      ])
      const shared = loaded.rows[0]!
      expect(shared.attributionWarningCodes).toEqual(['SHARED_REGISTRY_IDENTIFIER'])
      // The warning says an identifier is shared. It never says with whom.
      expect(JSON.stringify(shared)).not.toContain('alpha-medicine-2')
      expect(JSON.stringify(loaded)).not.toContain('relatedSlugs')
      const duplicate = loaded.rows[1]!
      expect(duplicate.redirectTargetSlug).toBe('alpha-medicine')
      expect(loaded.descriptor.filters.map((filter) => filter.parameter)).toEqual([
        'q',
        'state',
        'role',
      ])
      expect(loaded.descriptor.doesNotMean).toContain('never treated as evidence to merge')
      expect(publicDatasetAllowedParameters('inventory-resolution')).toEqual(
        new Set(['q', 'limit', 'offset', 'format', 'state', 'role']),
      )
    } finally {
      rmSync(path, { force: true })
    }
  })

  it('refuses an identity line that names one record in relation to another', async () => {
    const path = writeFixture('inventory-resolution.ndjson', [
      { ...INVENTORY_LINES[0], relatedSlugs: ['alpha-medicine-2'] },
    ])
    try {
      await expect(
        buildInventoryResolution(path, 'data/inventory-resolution.ndjson'),
      ).rejects.toThrow('names one record in relation to another')
    } finally {
      rmSync(path, { force: true })
    }
  })

  it('publishes completion states as statements about the sources that were read', async () => {
    const shards = writeCompletionShards(COMPLETION_LINES)
    try {
      const loaded = await buildDossierCompletion(shards, 'data/dossier-completion/*.ndjson')
      expect(loaded.descriptor.id).toBe('dossier-completion')
      expect(loaded.rows.map((row) => row.status)).toEqual(['COMPLETE', 'INCOMPLETE'])
      expect(loaded.rows[0]!.sectionStates).toEqual([
        'identity: EXACT_STRUCTURED_SOURCE_DATA',
        'literature-search: NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
      ])
      expect(loaded.rows[0]!.nonTerminalSectionIds).toEqual([])
      expect(loaded.rows[1]!.nonTerminalSectionIds).toEqual(['trial-registry'])
      expect(loaded.descriptor.doesNotMean).toContain('never the medicine')
      expect(loaded.descriptor.doesNotMean).toContain('not a safety finding')
      expect(loaded.descriptor.filters.map((filter) => filter.parameter)).toEqual([
        'q',
        'state',
        'meaning',
        'module',
      ])
      expect(publicDatasetAllowedParameters('dossier-completion')).toEqual(
        new Set(['q', 'limit', 'offset', 'format', 'state', 'meaning', 'module']),
      )
      // Nothing in the projection carries the resolver's input digest.
      expect(JSON.stringify(loaded)).not.toContain('inputDigest')
    } finally {
      for (const shard of shards) rmSync(shard, { force: true })
    }
  })

  it('reads every shard in the order it is given, as one dataset', async () => {
    const shards = [
      writeFixture('dossier-completion-001.ndjson', [COMPLETION_LINES[0]]),
      writeFixture('dossier-completion-002.ndjson', [COMPLETION_LINES[1]]),
    ]
    try {
      const loaded = await buildDossierCompletion(shards, 'data/dossier-completion/*.ndjson')
      expect(loaded.descriptor.rowCount).toBe(2)
      expect(loaded.rows.map((row) => row.medicineSlug)).toEqual([
        'alpha-medicine',
        'beta-preparation',
      ])
      // A shard that never loaded would leave a smaller dataset that still looks internally
      // consistent, so the count and the order are both asserted.
      expect(loaded.rows.map((row) => row.status)).toEqual(['COMPLETE', 'INCOMPLETE'])
    } finally {
      for (const shard of shards) rmSync(shard, { force: true })
    }
  })

  it('refuses a completion line that holds fewer sections than it declares', async () => {
    const shards = writeCompletionShards([{ ...COMPLETION_LINES[0], applicableSectionCount: 5 }])
    try {
      await expect(
        buildDossierCompletion(shards, 'data/dossier-completion/*.ndjson'),
      ).rejects.toThrow('declares more applicable sections than it holds')
    } finally {
      for (const shard of shards) rmSync(shard, { force: true })
    }
  })

  it('filters identity rows by resolution and kind, and completion rows by state and section', () => {
    const inventoryRows = INVENTORY_LINES.map((line): PublicDatasetRow => ({
      medicineSlug: line.originalSlug,
      medicineName: line.originalName,
      entityClass: line.entityClass,
      resolutionStatus: line.resolutionStatus,
    }))
    const searchFields = ['medicineSlug', 'medicineName']
    const kept = (query: Parameters<typeof normalizePublicDatasetQuery>[0]) =>
      inventoryRows
        .filter((row) =>
          publicDatasetRowMatches(
            'inventory-resolution',
            row,
            normalizePublicDatasetQuery(query),
            searchFields,
          ),
        )
        .map((row) => row.medicineSlug)

    expect(kept({ state: 'CANONICAL_ENTITY' })).toEqual(['alpha-medicine'])
    expect(kept({ role: 'PLACEHOLDER' })).toEqual(['header'])
    expect(kept({ q: 'alpha' })).toEqual(['alpha-medicine', 'alpha-medicine-2'])

    const completionRows: PublicDatasetRow[] = [
      {
        medicineSlug: 'alpha-medicine',
        status: 'COMPLETE',
        statesPresent: ['EXACT_STRUCTURED_SOURCE_DATA', 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH'],
        nonTerminalSectionIds: [],
      },
      {
        medicineSlug: 'beta-preparation',
        status: 'INCOMPLETE',
        statesPresent: ['EXACT_SOURCE_BACKED', 'SEARCH_PENDING'],
        nonTerminalSectionIds: ['trial-registry'],
      },
    ]
    const keptCompletion = (query: Parameters<typeof normalizePublicDatasetQuery>[0]) =>
      completionRows
        .filter((row) =>
          publicDatasetRowMatches('dossier-completion', row, normalizePublicDatasetQuery(query), [
            'medicineSlug',
          ]),
        )
        .map((row) => row.medicineSlug)

    expect(keptCompletion({ state: 'COMPLETE' })).toEqual(['alpha-medicine'])
    expect(keptCompletion({ meaning: 'SEARCH_PENDING' })).toEqual(['beta-preparation'])
    expect(keptCompletion({ module: 'trial-registry' })).toEqual(['beta-preparation'])
    expect(keptCompletion({ module: 'identity' })).toEqual([])
  })
})
