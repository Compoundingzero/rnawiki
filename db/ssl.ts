import { readFileSync } from 'node:fs'
import type { ConnectionOptions } from 'node:tls'

/**
 * TLS settings for a Postgres connection string. One implementation, used by both the app pool
 * (db/index.ts) and the migration runner (db/migrate.ts), because they disagreed: the app asked
 * for TLS and then switched verification off, and the migrator asked for no TLS at all.
 *
 * WHAT WAS WRONG, in two parts.
 *
 * 1. `ssl: { rejectUnauthorized: false }` for every non-local host. That encrypts the connection
 *    and authenticates nothing, so any host able to intercept the path can present its own
 *    certificate and read or alter everything on it — including the credentials inside
 *    `DATABASE_URL`. Reproduced end to end: a fake server presenting a self-signed certificate for
 *    an unrelated common name completed the handshake and captured the password from the startup
 *    packet. With verification on, the same connection dies before any credential leaves the
 *    process. This matters because `.env.example` and docs/deployment.md direct operators to point
 *    `DATABASE_PUBLIC_URL` at this code "for any script run from outside Railway's network" —
 *    traffic that crosses the public internet carrying the database owner's credentials.
 *
 * 2. The local-host test was `/localhost|127\.0\.0\.1|railway\.internal/.test(connectionString)`,
 *    a substring match against the WHOLE string. It fired on the password and the database name as
 *    well as the host, so `postgresql://user:localhostpw@prod-db.example.com/app` connected in
 *    cleartext to a remote host, and `db.localhost.evil.example` did too. The check now parses the
 *    URL and compares the hostname exactly.
 *
 * ESCAPE HATCH, deliberately explicit. Railway's Postgres template serves a self-signed
 * certificate and publishes no CA, so verification against the public host cannot succeed out of
 * the box. `PGSSLROOTCERT` points at the server's certificate (or its CA) and is the right answer.
 * `DATABASE_SSL_NO_VERIFY=true` restores the old unverified behaviour for an operator who
 * knowingly accepts it, and says so on stderr every time the process starts. It is opt-in because
 * a default nobody chose is a default nobody can be said to have accepted.
 */

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

/** True only for a hostname that cannot leave the machine or Railway's private network. */
export function isLocalDatabaseHost(connectionString: string): boolean {
  let hostname: string
  try {
    hostname = new URL(connectionString).hostname.toLowerCase()
  } catch {
    // An unparseable connection string is not evidence of a local host. Fail towards TLS.
    return false
  }
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.railway.internal')
}

export function databaseSslConfig(connectionString: string): ConnectionOptions | false {
  if (isLocalDatabaseHost(connectionString)) return false

  const caPath = process.env.PGSSLROOTCERT
  if (caPath) {
    return { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8') }
  }

  if (process.env.DATABASE_SSL_NO_VERIFY === 'true') {
    console.warn(
      '[db] DATABASE_SSL_NO_VERIFY=true — the database TLS certificate is NOT being verified. ' +
        'The connection is encrypted but not authenticated, so anything able to intercept it can ' +
        'read the credentials in DATABASE_URL. Set PGSSLROOTCERT to the server certificate instead.'
    )
    return { rejectUnauthorized: false }
  }

  return { rejectUnauthorized: true }
}
