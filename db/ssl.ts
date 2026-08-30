import { readFileSync } from 'node:fs'
import { checkServerIdentity as nodeCheckServerIdentity, type ConnectionOptions } from 'node:tls'

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
 * Railway's public Postgres endpoint may require its certificate (or CA) to be pinned through
 * `PGSSLROOTCERT`. There is intentionally no switch that disables certificate verification:
 * scripts using a public database endpoint fail closed until the operator supplies a trusted CA.
 *
 * WHY `PGSSLSERVERNAME` EXISTS.
 *
 * Railway issues this database a certificate from a private CA, and that certificate carries
 * exactly one identity: `CN=localhost`, `SAN: DNS:localhost`. The public endpoint is a TCP
 * passthrough — it forwards the same certificate byte for byte rather than terminating TLS and
 * presenting one named for the proxy. So a verified connection from outside Railway's network has
 * three possible outcomes, all confirmed against the live endpoint:
 *
 *   - system trust store            -> fails, self-signed certificate in chain
 *   - pinned CA, proxy hostname     -> fails, certificate is not valid for the proxy hostname
 *   - pinned CA, identity localhost -> verifies
 *
 * Only the third can succeed, because it is the only name the certificate actually asserts. This
 * is not a relaxation of verification; both the signature chain and the asserted identity are
 * still checked in full. What changes is which name we require, and the security of that rests on
 * the pinned CA: the trust anchor is private to this database, so a handshake completes only with
 * a server holding a key that CA signed. An interceptor on the path cannot produce one.
 *
 * Two conditions keep that argument true, and both are enforced below rather than documented and
 * hoped for. The override is refused unless `PGSSLROOTCERT` also pins a CA — against the public
 * trust store, accepting a name unrelated to the host dialled would sever the binding between the
 * endpoint and the identity, which is the property hostname verification exists to provide. And
 * the name must be non-empty, since Node treats an empty `servername` as "no SNI, skip the
 * hostname check", which would silently reintroduce exactly the hole this module was written to
 * close.
 *
 * The trust anchor must come from inside Railway (authenticated `railway ssh`, reading the public
 * `root.crt` from the PostgreSQL volume). A certificate scraped from an unauthenticated public
 * connection pins whatever answered, including an interceptor, and proves nothing.
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
  const serverName = process.env.PGSSLSERVERNAME?.trim()

  if (serverName && !caPath) {
    throw new Error(
      'PGSSLSERVERNAME requires PGSSLROOTCERT. Verifying a certificate against a name other than the host dialled is only sound when the trust anchor is a CA you pinned deliberately; against the public trust store it would break the binding between endpoint and identity.',
    )
  }

  if (caPath) {
    const ca = readFileSync(caPath, 'utf8')
    if (!serverName) return { rejectUnauthorized: true, ca }

    /*
     * Both hooks are set because neither alone is sufficient.
     *
     * `servername` is the honest expression of intent and is what a direct `tls.connect` caller
     * needs, but node-postgres overwrites it: `connection.js` assigns `options.servername = host`
     * after spreading this object, for any host that is not a bare IP. Setting it alone silently
     * did nothing, and the connection failed on the proxy hostname.
     *
     * `checkServerIdentity` is the hook node-postgres cannot clobber, so it carries the guarantee.
     * It delegates to Node's own implementation rather than replacing it — the certificate is held
     * to the full standard check, against the name we pinned instead of the name we dialled. A
     * function that returned `undefined` unconditionally would look similar and verify nothing;
     * this one still rejects any certificate that does not assert `serverName`.
     */
    return {
      rejectUnauthorized: true,
      ca,
      servername: serverName,
      checkServerIdentity: (_hostname, certificate) =>
        nodeCheckServerIdentity(serverName, certificate),
    }
  }

  return { rejectUnauthorized: true }
}
