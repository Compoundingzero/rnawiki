/**
 * A load marker says which database it was written against.
 *
 * Rehearsals against a disposable database, the working database and the production load all write
 * their markers into `data/corpus-20k/load/`. Before the target was recorded, the first of them
 * made the others look finished.
 */
import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { loadTargetFingerprint } from '@/scripts/corpus-20k/load/materialise'

const PRODUCTION = 'postgresql://user:secret@db.example.internal:5432/railway'

describe('load marker target fingerprint', () => {
  it('is the sha256 of the host and the database name', () => {
    expect(loadTargetFingerprint(PRODUCTION)).toBe(
      createHash('sha256').update('db.example.internal:5432\nrailway').digest('hex'),
    )
  })

  it('ignores the credentials and the query, so the same target fingerprints the same', () => {
    expect(
      loadTargetFingerprint(
        'postgresql://other:word@db.example.internal:5432/railway?sslmode=verify-ca',
      ),
    ).toBe(loadTargetFingerprint(PRODUCTION))
  })

  it('separates a different host, a different port and a different database', () => {
    const fingerprint = loadTargetFingerprint(PRODUCTION)
    expect(loadTargetFingerprint('postgresql://u@other.example:5432/railway')).not.toBe(fingerprint)
    expect(loadTargetFingerprint('postgresql://u@db.example.internal:5433/railway')).not.toBe(
      fingerprint,
    )
    expect(loadTargetFingerprint('postgresql://u@db.example.internal:5432/rnawiki_dev')).not.toBe(
      fingerprint,
    )
  })

  it('records no credential: the fingerprint cannot be read back into a connection', () => {
    expect(loadTargetFingerprint(PRODUCTION)).not.toContain('secret')
    expect(loadTargetFingerprint(PRODUCTION)).toMatch(/^[0-9a-f]{64}$/)
  })
})
