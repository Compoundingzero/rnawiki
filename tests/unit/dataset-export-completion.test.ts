import { describe, expect, it } from 'vitest'

import {
  completionRowProblems,
  completionShardProblems,
  inventoryLedgerProblems,
  inventoryRowProblems,
  isDossierCompletionShard,
  MAX_PUBLISHED_FILE_BYTES,
  oversizedFileProblems,
} from '../../scripts/check/dataset-export'

/**
 * The published-dataset check reads the identity and completion artifacts as a downloader receives
 * them. Two contracts are worth more than the schema itself.
 *
 * The first is accounting. Every original record lands in exactly one bucket, and the buckets have
 * to add back up to the rows on disk — otherwise a record can go missing between the database and
 * the download and the file will still look internally consistent.
 *
 * The second is that a published identity row never names another record. The database keeps
 * `relatedSlugs` on an attribution warning because a reviewer needs to see which rows share a
 * registry identifier. A shared identifier is not evidence that two rows are one substance, so
 * publishing those names would put two medicines on one line and invite the exact inference the
 * resolver refuses to make.
 */

const CANONICAL_ROW = {
  originalRecordId: 'drg_alpha',
  originalSlug: 'alpha-medicine',
  originalName: 'Alpha medicine',
  entityClass: 'APPROVED_MEDICINE',
  entityClassRule: 'approval-status-is-fda-approved',
  resolutionStatus: 'CANONICAL_ENTITY',
  canonicalSlug: 'alpha-medicine',
  redirectTargetSlug: null,
  identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
  identitySourceKinds: ['UNII'],
  attributionWarningCodes: ['SHARED_REGISTRY_IDENTIFIER'],
  resolutionEvidence: [],
  contentDigest: 'a'.repeat(64),
  resolverVersion: 'inventory-resolution/v1',
}

const COMPLETE_ROW = {
  slug: 'alpha-medicine',
  name: 'Alpha medicine',
  entityClass: 'APPROVED_MEDICINE',
  status: 'COMPLETE',
  resolverVersion: 'dossier-completion/v1',
  inputDigest: 'b'.repeat(64),
  contentChangedAt: '2026-09-01T00:00:00.000Z',
  applicableSectionCount: 1,
  terminalSectionCount: 1,
  nonTerminalSectionIds: [],
  humanReadSuggestedSectionIds: [],
  sections: [
    {
      sectionId: 'identity',
      state: 'EXACT_STRUCTURED_SOURCE_DATA',
      basisKind: 'REGISTRY_IDENTIFIER',
      basis: 'One registry identifier is recorded on this record.',
      sourceRefs: [{ kind: 'UNII', identifier: '9100L32L2N' }],
    },
  ],
}

describe('published identity rows', () => {
  it('accepts a complete row and every declared resolution state', () => {
    expect(inventoryRowProblems(CANONICAL_ROW, 1)).toEqual({
      problems: [],
      resolutionStatus: 'CANONICAL_ENTITY',
    })
    expect(
      inventoryRowProblems(
        {
          ...CANONICAL_ROW,
          resolutionStatus: 'DUPLICATE_OF_CANONICAL_ENTITY',
          redirectTargetSlug: 'alpha-medicine',
          resolutionEvidence: ['Identical name after punctuation removal'],
        },
        2,
      ).problems,
    ).toEqual([])
  })

  it('reports a row that names another record through a warning', () => {
    const { problems } = inventoryRowProblems(
      {
        ...CANONICAL_ROW,
        attributionWarnings: [
          { code: 'SHARED_REGISTRY_IDENTIFIER', relatedSlugs: ['alpha-medicine-2'] },
        ],
      },
      7,
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('line 7')
    expect(problems[0]).toContain('relatedSlugs')
  })

  it('reports an undeclared resolution state and a missing identity field', () => {
    const { problems, resolutionStatus } = inventoryRowProblems(
      { ...CANONICAL_ROW, resolutionStatus: 'MERGED', entityClassRule: '' },
      3,
    )
    expect(resolutionStatus).toBeNull()
    expect(problems.join(' ')).toContain('entityClassRule is blank or absent')
    expect(problems.join(' ')).toContain('not a declared resolution state')
  })
})

describe('the identity ledger balances', () => {
  it('accounts for every published row across the five buckets', () => {
    const counts = new Map([
      ['CANONICAL_ENTITY', 9852],
      ['DUPLICATE_OF_CANONICAL_ENTITY', 5],
      ['INVALID_IDENTITY_GONE', 2],
    ])
    expect(inventoryLedgerProblems(counts, 9859)).toEqual([])
  })

  it('counts a record waiting for a person rather than dropping it', () => {
    const counts = new Map([
      ['CANONICAL_ENTITY', 2],
      ['MANUAL_IDENTITY_REVIEW_REQUIRED', 1],
    ])
    expect(inventoryLedgerProblems(counts, 3)).toEqual([])
  })

  it('reports a row that reached the file without a bucket', () => {
    const counts = new Map([['CANONICAL_ENTITY', 2]])
    expect(inventoryLedgerProblems(counts, 3).join(' ')).toContain(
      'publishes 3 row(s) but its statuses account for 2',
    )
  })

  it('reports an undeclared state instead of silently ignoring it', () => {
    const counts = new Map([
      ['CANONICAL_ENTITY', 2],
      ['MERGED', 1],
    ])
    expect(inventoryLedgerProblems(counts, 3).join(' ')).toContain(
      'undeclared resolution state MERGED',
    )
  })
})

describe('published completion rows', () => {
  it('accepts a row whose sections match its declared count', () => {
    expect(completionRowProblems(COMPLETE_ROW, 1)).toEqual([])
  })

  it('reports a section count that disagrees with the sections held', () => {
    expect(
      completionRowProblems({ ...COMPLETE_ROW, applicableSectionCount: 4 }, 2).join(' '),
    ).toContain('declares 4 applicable section(s) but holds 1')
  })

  it('reports a state outside the sixteen declared states', () => {
    expect(
      completionRowProblems(
        {
          ...COMPLETE_ROW,
          sections: [{ ...COMPLETE_ROW.sections[0], state: 'LOOKS_FINE' }],
        },
        3,
      ).join(' '),
    ).toContain('sections[0].state is not a declared section state')
  })

  it('names the shard the row came from', () => {
    expect(
      completionRowProblems(
        { ...COMPLETE_ROW, applicableSectionCount: 4 },
        12,
        'data/dossier-completion/dossier-completion-007.ndjson',
      ).join(' '),
    ).toContain('data/dossier-completion/dossier-completion-007.ndjson line 12')
  })

  it('accepts a non-terminal state and holds the status to it', () => {
    const pending = {
      ...COMPLETE_ROW,
      status: 'INCOMPLETE',
      terminalSectionCount: 0,
      nonTerminalSectionIds: ['identity'],
      sections: [
        {
          ...COMPLETE_ROW.sections[0],
          state: 'SEARCH_PENDING',
          basisKind: 'NOT_YET_RUN',
          basis: 'The dated search has not run.',
        },
      ],
    }
    expect(completionRowProblems(pending, 4)).toEqual([])
    expect(completionRowProblems({ ...pending, status: 'COMPLETE' }, 5).join(' ')).toContain(
      'status disagrees with its unresolved section list',
    )
  })
})

/**
 * The completion corpus outgrew a single file: one line carries every applicable section with its
 * basis sentence and its source refs, so at corpus scale the file passed 100 MB and the host
 * refuses it. It is now sharded exactly like the medicine corpus, and both halves of that contract
 * are checked here — that the shards are declared, and that no published file approaches the bound
 * again.
 */
describe('the completion corpus is published as shards', () => {
  it('recognises a numbered shard and nothing else', () => {
    expect(isDossierCompletionShard('data/dossier-completion/dossier-completion-001.ndjson')).toBe(
      true,
    )
    expect(isDossierCompletionShard('data/dossier-completion/dossier-completion-010.ndjson')).toBe(
      true,
    )
    expect(isDossierCompletionShard('data/dossier-completion.ndjson')).toBe(false)
    expect(isDossierCompletionShard('data/dossier-completion/notes.ndjson')).toBe(false)
    expect(isDossierCompletionShard('data/drugs/drugs-001.ndjson')).toBe(false)
  })

  it('accepts a manifest that declares at least one shard', () => {
    expect(
      completionShardProblems([
        'data/manifest.json',
        'data/dossier-completion/dossier-completion-001.ndjson',
        'data/dossier-completion/dossier-completion-002.ndjson',
      ]),
    ).toEqual([])
  })

  it('reports a manifest that declares no shard at all', () => {
    expect(completionShardProblems(['data/manifest.json']).join(' ')).toContain(
      'declares no data/dossier-completion/dossier-completion-NNN.ndjson shard',
    )
  })

  it('reports a file in the shard directory that is not a numbered shard', () => {
    const problems = completionShardProblems([
      'data/dossier-completion/dossier-completion-001.ndjson',
      'data/dossier-completion/everything.ndjson',
    ])
    expect(problems.join(' ')).toContain('everything.ndjson is not a dossier-completion-NNN.ndjson')
  })
})

describe('no published file approaches the size the host refuses', () => {
  it('accepts files under the bound', () => {
    expect(
      oversizedFileProblems([
        { path: 'data/drugs/drugs-001.ndjson', bytes: 11_000_000 },
        { path: 'data/recorded-background.ndjson', bytes: 63_198_719 },
      ]),
    ).toEqual([])
  })

  it('names a file over the bound and says what to do about it', () => {
    const problems = oversizedFileProblems([
      { path: 'data/dossier-completion.ndjson', bytes: MAX_PUBLISHED_FILE_BYTES + 1 },
    ])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('data/dossier-completion.ndjson')
    expect(problems[0]).toContain('Shard it.')
  })
})
