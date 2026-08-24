import { describe, expect, it } from 'vitest'

import {
  commandFrom,
  disposableDatabaseName,
  isLocalDatabaseUrl,
  quoteDisposableDatabaseIdentifier,
} from '@/scripts/with-disposable-database'

describe('disposable database runner safety', () => {
  it('passes only the command after the separator and requires a command', () => {
    expect(commandFrom(['--', 'npm', 'run', 'test:integration'])).toEqual([
      'npm',
      'run',
      'test:integration',
    ])
    expect(() => commandFrom(['--'])).toThrow(/Usage:/)
    expect(() => commandFrom([])).toThrow(/Usage:/)
  })

  it('accepts only local PostgreSQL connection URLs', () => {
    expect(isLocalDatabaseUrl('postgresql://tester@localhost:5432/rnawiki_dev')).toBe(true)
    expect(isLocalDatabaseUrl('postgres://tester@127.0.0.1/rnawiki_dev')).toBe(true)
    expect(isLocalDatabaseUrl('postgresql://tester@[::1]/rnawiki_dev')).toBe(true)
    expect(isLocalDatabaseUrl('postgresql://tester@db.example.com/rnawiki')).toBe(false)
    expect(isLocalDatabaseUrl('https://localhost/rnawiki')).toBe(false)
  })

  it('creates and quotes only the runner-owned database-name pattern', () => {
    const name = disposableDatabaseName(1_787_500_000_000, '0123456789')
    expect(name).toBe('rnawiki_test_1787500000000_0123456789')
    expect(quoteDisposableDatabaseIdentifier(name)).toBe('"rnawiki_test_1787500000000_0123456789"')
    expect(() => quoteDisposableDatabaseIdentifier('rnawiki_dev')).toThrow(/Refusing/)
    expect(() =>
      quoteDisposableDatabaseIdentifier('rnawiki_test_ok"; drop database postgres'),
    ).toThrow(/Refusing/)
    expect(() => disposableDatabaseName(1_787_500_000_000, '../unsafe')).toThrow(/safe/)
  })
})
