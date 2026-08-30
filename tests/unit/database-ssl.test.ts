import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { ConnectionOptions, PeerCertificate } from 'node:tls'

import { afterEach, describe, expect, it } from 'vitest'

import { databaseSslConfig, isLocalDatabaseHost } from '@/db/ssl'

describe('database TLS policy', () => {
  const previousUnsafeOverride = process.env.DATABASE_SSL_NO_VERIFY
  const previousRootCert = process.env.PGSSLROOTCERT
  const previousServerName = process.env.PGSSLSERVERNAME

  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }

  afterEach(() => {
    restore('DATABASE_SSL_NO_VERIFY', previousUnsafeOverride)
    restore('PGSSLROOTCERT', previousRootCert)
    restore('PGSSLSERVERNAME', previousServerName)
  })

  const CA_TEXT = '-----BEGIN CERTIFICATE-----\nnot a real certificate\n-----END CERTIFICATE-----\n'
  const writeCa = (): string => {
    const path = join(mkdtempSync(join(tmpdir(), 'rnawiki-ssl-')), 'root.crt')
    writeFileSync(path, CA_TEXT)
    return path
  }

  const REMOTE = 'postgresql://user:pass@hayabusa.proxy.rlwy.net:42528/railway'

  it('disables TLS only for exact local or Railway-private hostnames', () => {
    expect(isLocalDatabaseHost('postgresql://user:pass@localhost/db')).toBe(true)
    expect(isLocalDatabaseHost('postgresql://user:pass@postgres.railway.internal/db')).toBe(true)
    expect(isLocalDatabaseHost('postgresql://user:localhost@db.example.com/db')).toBe(false)
    expect(isLocalDatabaseHost('postgresql://user:pass@localhost.example.com/db')).toBe(false)
  })

  it('cannot be configured to trust an unauthenticated remote certificate', () => {
    process.env.DATABASE_SSL_NO_VERIFY = 'true'
    delete process.env.PGSSLROOTCERT
    delete process.env.PGSSLSERVERNAME
    expect(databaseSslConfig('postgresql://user:pass@db.example.com/rnawiki')).toEqual({
      rejectUnauthorized: true,
    })
  })

  /**
   * Railway signs this database's certificate with a private CA and gives it one identity,
   * `CN=localhost` / `SAN: DNS:localhost`. The public endpoint is a TCP passthrough, so an external
   * client is offered that same certificate under the proxy's hostname and verification fails on
   * the name rather than on the chain. `PGSSLSERVERNAME` selects the name to check. It must never
   * become a way to check nothing.
   */
  describe('verifying against the name the certificate actually asserts', () => {
    it('checks the requested name while still requiring a valid chain', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = 'localhost'
      expect(databaseSslConfig(REMOTE)).toMatchObject({
        rejectUnauthorized: true,
        ca: CA_TEXT,
        servername: 'localhost',
      })
    })

    /**
     * node-postgres assigns `options.servername = host` after spreading this config, so the
     * `servername` key alone is silently discarded and the connection fails on the proxy hostname.
     * The guarantee has to live somewhere node-postgres does not overwrite.
     */
    it('carries the name check in the hook node-postgres cannot overwrite', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = 'localhost'
      expect(typeof (databaseSslConfig(REMOTE) as ConnectionOptions).checkServerIdentity).toBe(
        'function',
      )
    })

    it('still rejects a certificate that does not assert the pinned name', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = 'localhost'
      const check = (databaseSslConfig(REMOTE) as ConnectionOptions).checkServerIdentity!
      const asserting = (name: string) =>
        ({ subject: { CN: name }, subjectaltname: `DNS:${name}` }) as unknown as PeerCertificate

      // Delegating to Node's own check, not replacing it: the matching name passes and every other
      // name is refused. A stub that always returned undefined would pass the line above and fail here.
      expect(check('hayabusa.proxy.rlwy.net', asserting('localhost'))).toBeUndefined()
      expect(check('hayabusa.proxy.rlwy.net', asserting('evil.example.com'))).toBeInstanceOf(Error)
      expect(check('localhost', asserting('hayabusa.proxy.rlwy.net'))).toBeInstanceOf(Error)
    })

    it('refuses the override when no CA is pinned, rather than quietly ignoring it', () => {
      delete process.env.PGSSLROOTCERT
      process.env.PGSSLSERVERNAME = 'localhost'
      // Accepting a name unrelated to the host dialled is only sound against a deliberately pinned
      // anchor. Against the public store it would sever endpoint from identity, so this fails loudly.
      expect(() => databaseSslConfig(REMOTE)).toThrow(/PGSSLSERVERNAME requires PGSSLROOTCERT/)
    })

    it('keeps verification on when the override is absent', () => {
      process.env.PGSSLROOTCERT = writeCa()
      delete process.env.PGSSLSERVERNAME
      const config = databaseSslConfig(REMOTE)
      expect(config).toEqual({ rejectUnauthorized: true, ca: CA_TEXT })
      expect(config).not.toHaveProperty('servername')
    })

    it('treats an empty override as absent, because Node reads it as "skip the hostname check"', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = ''
      expect(databaseSslConfig(REMOTE)).not.toHaveProperty('servername')
    })

    it('treats a whitespace-only override as absent for the same reason', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = '   '
      expect(databaseSslConfig(REMOTE)).not.toHaveProperty('servername')
    })

    it('trims a name that arrived with stray whitespace from a shell or secret store', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = '  localhost\n'
      expect(databaseSslConfig(REMOTE)).toMatchObject({ servername: 'localhost' })
    })

    it('never lets the override switch verification off', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.DATABASE_SSL_NO_VERIFY = 'true'
      for (const name of ['localhost', 'evil.example.com', '*']) {
        process.env.PGSSLSERVERNAME = name
        expect(databaseSslConfig(REMOTE)).toMatchObject({ rejectUnauthorized: true })
      }
    })

    it('does not apply the override to a local or Railway-private host, which needs no TLS', () => {
      process.env.PGSSLROOTCERT = writeCa()
      process.env.PGSSLSERVERNAME = 'localhost'
      expect(databaseSslConfig('postgresql://user:pass@localhost/db')).toBe(false)
      expect(databaseSslConfig('postgresql://user:pass@postgres.railway.internal/db')).toBe(false)
    })

    it('still refuses the override without a CA even for an unparseable connection string', () => {
      // An unparseable string is not evidence of a local host, so it reaches the remote branch.
      delete process.env.PGSSLROOTCERT
      process.env.PGSSLSERVERNAME = 'localhost'
      expect(() => databaseSslConfig('not a url')).toThrow(/PGSSLSERVERNAME requires PGSSLROOTCERT/)
    })

    it('fails closed when the pinned CA file is missing instead of connecting unverified', () => {
      process.env.PGSSLROOTCERT = '/nonexistent/rnawiki-root.crt'
      process.env.PGSSLSERVERNAME = 'localhost'
      expect(() => databaseSslConfig(REMOTE)).toThrow(/ENOENT/)
    })
  })
})
