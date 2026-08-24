import { afterEach, describe, expect, it } from 'vitest'

import { databaseSslConfig, isLocalDatabaseHost } from '@/db/ssl'

describe('database TLS policy', () => {
  const previousUnsafeOverride = process.env.DATABASE_SSL_NO_VERIFY

  afterEach(() => {
    if (previousUnsafeOverride === undefined) delete process.env.DATABASE_SSL_NO_VERIFY
    else process.env.DATABASE_SSL_NO_VERIFY = previousUnsafeOverride
  })

  it('disables TLS only for exact local or Railway-private hostnames', () => {
    expect(isLocalDatabaseHost('postgresql://user:pass@localhost/db')).toBe(true)
    expect(isLocalDatabaseHost('postgresql://user:pass@postgres.railway.internal/db')).toBe(true)
    expect(isLocalDatabaseHost('postgresql://user:localhost@db.example.com/db')).toBe(false)
    expect(isLocalDatabaseHost('postgresql://user:pass@localhost.example.com/db')).toBe(false)
  })

  it('cannot be configured to trust an unauthenticated remote certificate', () => {
    process.env.DATABASE_SSL_NO_VERIFY = 'true'
    expect(databaseSslConfig('postgresql://user:pass@db.example.com/rnawiki')).toEqual({
      rejectUnauthorized: true,
    })
  })
})
