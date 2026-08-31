# Deploying RNAWiki

Merging to `main` starts the Railway build and deployment. This page records the service layout,
source-check schedule, required environment variables and recovery steps.

## The services

|                      |                                                                |
| -------------------- | -------------------------------------------------------------- |
| Project              | **RNAwiki** (`328c5ae7-2ccb-4d37-8524-ba7029daddae`)           |
| Web service          | **RNAwiki** — capital R-N-A, and the CLI is case-sensitive     |
| Source-check service | **RNA Intelligence Source Sync** — private scheduled worker    |
| Database             | **Postgres** service, private host `postgres.railway.internal` |
| Domain               | https://rnawiki.com                                            |

## What a deploy does

`railway.toml` sets `preDeployCommand = "npm run db:migrate && npm run apply:background"`, so
migrations and the recorded-background dataset both land in a throwaway container **before** the
new version takes traffic. Without the migration step, a deploy that adds a column serves 500s
from the moment it starts until someone remembers to migrate by hand; without the dataset step, a
deploy that adds records shows nothing until someone remembers to load them.

`apply:background` validates every envelope with the background engine before writing and fails
the deploy on any finding, so invalid data cannot reach a live page. It writes only
`drugs.recorded_background`, keyed by slug, skips slugs with no row, and is idempotent. It runs
inside Railway's network against the private database host — the one place the connection needs no
public TLS trust anchor (see `db/ssl.ts`, which deliberately offers no verification bypass).

The healthcheck is `/healthz`, which returns a bare `200 ok` and deliberately **does not touch the
database**. Liveness and readiness are different questions: a transient database blip must not roll
back an otherwise-good deploy.

## Scheduled source checks

The exact Railway display name is **RNA Intelligence Source Sync**. It is one private cron service,
not a web server, and it must have no public or custom domain. Its entry point runs two independent,
bounded workloads in sequence:

1. at most 25 due ClinicalTrials.gov programme sources with four concurrent requests; then
2. at most 25 least-recently-attempted recorded-background source identities with four concurrent
   requests and a 20-minute runtime bound.

An ordinary failed ClinicalTrials item is persisted before the background workload starts. The two
histories remain separate: programme monitoring can create a source-review task, while confirmed
recorded-background drift can create a `SOURCE_DRIFT` candidate. Neither workload automatically
rewrites medical content.

### Persistent Railway service configuration

[`railway.source-sync.toml`](../railway.source-sync.toml) is this service's config-as-code file. In
Railway's service settings, **Custom Config Path** must be the absolute repository path
`/railway.source-sync.toml`. The CLI has no per-upload config-path flag, and the file intentionally
has no service `name` field. The service setting is what prevents a targeted repository-root upload
from applying the web service's default `/railway.toml` to this worker.

The required persistent settings are:

| Path                             | Exact value                                       |
| -------------------------------- | ------------------------------------------------- |
| `build.builder`                  | `NIXPACKS`                                        |
| `build.buildCommand`             | `./node_modules/.bin/tsc --noEmit`                |
| `deploy.preDeployCommand`        | `node --import tsx db/migrate.ts`                 |
| `deploy.startCommand`            | `node --import tsx scripts/source-sync-worker.ts` |
| `deploy.cronSchedule`            | `0 */6 * * *`                                     |
| `deploy.restartPolicyType`       | `ON_FAILURE`                                      |
| `deploy.restartPolicyMaxRetries` | `1`                                               |

Before uploading, inspect the exact service in Railway and read back **Custom Config Path**. After
uploading, inspect the deployment details: each value above must show that it came from
`/railway.source-sync.toml`. Also confirm that the service still has no domain:

```bash
railway environment config --json
railway service list --json
railway up --service "RNA Intelligence Source Sync" --detach
railway deployment list --service "RNA Intelligence Source Sync" --json
```

The detached upload only proves a build was queued. Do not report the worker deployed until its
newest deployment reaches terminal `SUCCESS`; investigate `FAILED` or `CRASHED` before continuing.

The web service is the normal migration owner. The worker repeats the direct migration command as a
pre-deploy guard because Railway may deploy the services independently. New worker code never starts
against an older schema. Direct Node and TypeScript commands also keep npm's production-config
warning out of successful cron logs.

### Worker result and retry semantics

The worker prints one `rnawiki-source-sync/v1` JSON summary, closes its database pool and exits. The
summary contains ClinicalTrials counts and times plus recorded-background source, binding, fetch,
assertion, candidate and runtime-bound counts. It never prints fetched source bodies or environment
values.

Exit behavior is deliberate:

- A ClinicalTrials batch with one or more failed items exits non-zero after the background workload
  has run. Railway retries the whole idempotent worker once.
- Recorded-background `UNREACHABLE`, `UNSUPPORTED` and `FAILED` fetches are persisted operational
  outcomes, not drift, and do not by themselves make the process fail.
- Recorded-background `DRIFTED` checks are persisted review items and also do not make the process
  fail.
- An unhandled worker, database or persistence error exits non-zero and receives the same one retry.

This distinction stops handled recorded-background provider failures and confirmed drift from
appearing as recurring deployment failures. Configure a Railway deployment/runtime-failure
notification for this service; without an external notification, terminal failures are logged but
nobody is paged.

After each deployment, confirm the six-hour schedule, terminal deployment success and a completed
worker summary. Zero selected ClinicalTrials records is healthy when none is due. Zero selected
background sources is healthy when there is no current excerpt-bearing source to schedule.
`UNSUPPORTED` is expected for source kinds without an adapter; repeated `UNREACHABLE` or `FAILED`
outcomes and any programme record past `next_check_due_at` need operator attention.

To add the first real programme/source pair for an existing medicine, always preview before writing:

```bash
npm run onboard:clinical-trial -- --medicine inclisiran --nct NCT03399370
npm run onboard:clinical-trial -- --medicine inclisiran --nct NCT03399370 --commit
```

The command verifies the medicine/intervention match against the official registry response. It
creates an identified programme, trial, source snapshot and freshness schedule only. It never
creates a claim, evidence answer, reviewer or conclusion. See
[`clinical-trial-programme-onboarding.md`](clinical-trial-programme-onboarding.md) for the complete
safety contract.

## Environment

| Variable         | Notes                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`   | Set by Railway's service reference. Uses the private host at runtime.    |
| `SESSION_SECRET` | ≥ 32 characters or `lib/session.ts` throws on the first session request. |
| `SITE_URL`       | `https://rnawiki.com`. Feeds `metadataBase`, the sitemap and JSON-LD.    |
| `SITE_NAME`      | `RNAWiki`.                                                               |

## Creating the first administrator

Registration never accepts an administrator, steward or trust-level flag. Create the intended
owner's ordinary account through the normal registration flow, verify the email spelling, then run
the one-time bootstrap command inside the production network:

```bash
npm run admin:bootstrap -- \
  --email owner@example.org \
  --confirm-email owner@example.org \
  --reason "Initial production administrator"
```

This command commits immediately; there is no preview mode. It promotes only an existing account,
requires the address twice plus an 8–500 character reason, and succeeds only while the database has
zero administrators and no earlier bootstrap event. A database-wide transaction lock makes two
simultaneous attempts serialize: one may succeed and every later attempt refuses. The immutable
role event records the target, actor, previous/next state, reason and database-set time.

The application currently has no general role-management route. Later administrator or steward
changes are therefore unsupported rather than silently performed by an account field or signup
payload. Do not use ad hoc SQL as an application workflow; add an independently authorized,
append-only role-change process before such changes are needed. As with all PostgreSQL-enforced
guards, a database owner or superuser remains an infrastructure trust root and must be access
controlled separately.

## Running scripts against production

`postgres.railway.internal` resolves **only inside Railway's network**. The safest operator path is
to run ingestion inside that private network. If a public Postgres proxy is unavoidable, pin the
database certificate and use a purpose-limited account rather than the application owner:

```bash
DATABASE_URL="$INGEST_DATABASE_URL" \
PGSSLROOTCERT=/absolute/path/to/postgres-ca.pem \
npx tsx scripts/ingest/run.ts
```

RNAWiki has no certificate-verification bypass. If the public endpoint uses a self-signed
certificate, obtain and verify that certificate out of band, store it securely, and point
`PGSSLROOTCERT` at it. The scheduled dataset workflow requires the same certificate in the
`DATABASE_CA_CERT` secret and a read-only connection string in `DATASET_DATABASE_URL`; it fails if
either is missing.

### The certificate authenticates `localhost`, not the proxy

Railway signs this database's certificate with a private CA and gives it exactly one identity:

```
subject=CN=localhost   issuer=CN=root-ca   X509v3 Subject Alternative Name: DNS:localhost
```

The public endpoint is a **TCP passthrough** — it forwards that certificate byte for byte instead of
terminating TLS and presenting one named for the proxy. Confirmed by comparing the leaf offered on
the public port against `/var/lib/postgresql/data/certs/server.crt` read over `railway ssh`: the
SHA-256 fingerprints are identical. So an external client sees three outcomes:

| Trust anchor       | Name checked   | Result                                         |
| ------------------ | -------------- | ---------------------------------------------- |
| system trust store | proxy hostname | fails — self-signed certificate in chain       |
| pinned `root.crt`  | proxy hostname | fails — certificate is not valid for that host |
| pinned `root.crt`  | `localhost`    | **verifies**                                   |

Only the third can succeed, because it is the only name the certificate asserts. Set
`PGSSLSERVERNAME=localhost` alongside `PGSSLROOTCERT`. This is not a relaxation: the signature chain
and the asserted identity are both still checked, and the trust anchor is private to this database,
so the handshake completes only with a server holding a key that CA signed.

`db/ssl.ts` refuses `PGSSLSERVERNAME` unless `PGSSLROOTCERT` is also set — against the public trust
store, accepting a name unrelated to the host dialled would sever the binding hostname verification
exists to provide.

Obtain the CA from inside Railway, never from the public endpoint:

```bash
railway ssh --service Postgres "cat /var/lib/postgresql/data/certs/root.crt" > postgres-ca.pem
```

Copy only `root.crt` (and `server.crt` for inspection). **Never copy `root.key` or `server.key`.** A
certificate scraped from an unauthenticated public connection pins whatever answered, including an
interceptor, and proves nothing.

Note for `psql` and other libpq clients: libpq verifies against its `host` parameter and has no
equivalent override, so this path works for the Node scripts in this repository. From a shell, reach
the database over `railway ssh` instead.

A full corpus load over the proxy takes a few minutes. It is safe to re-run: every write is an
upsert keyed on slug, and the loader refuses to overwrite a curated dossier's narrative fields.

## Build-time database access

**Railway's build container cannot reach the database.** `postgres.railway.internal` resolves at
runtime only. Any DB-backed route without a dynamic segment must declare:

```ts
export const dynamic = 'force-dynamic'
```

Currently: `app/page.tsx`, `app/browse/page.tsx`, `app/review-queue/page.tsx`, `app/sitemap.ts`.
Miss one and the production build fails while passing perfectly on your machine.

## Rolling back

Railway keeps previous deploys; redeploy one from the dashboard or `railway redeploy`. **A rollback
does not undo a migration.** Existing audit rows are preserved, but an older image may not understand
new enum values, tables or publication rules. Read the migration-specific stop conditions below and
prefer a corrected forward deployment. Take a verified backup before any manual database change:

```bash
PGSSLMODE=verify-full \
PGSSLROOTCERT=/absolute/path/to/postgres-ca.pem \
psql "$BACKUP_DATABASE_URL" -t -A -c \
  "SELECT coalesce(json_agg(row_to_json(d))::text,'[]') FROM drugs d" > backup.json
```

`BACKUP_DATABASE_URL` must belong to a purpose-limited account that can read the required tables
but cannot change them. Obtain and verify the CA file out of band; do not weaken certificate
verification for a backup.

`pg_dump` will refuse if your client is older than the server (Railway runs Postgres 18); a JSON
export through `psql` is version-agnostic and this database is small enough for it.

Migration 0010 deserves an extra publication stop even though it preserves legacy rows. It adds
digest-bound mechanism/timeline tables and replaces the dependency-surface enum and publication
validator functions. An older image does not understand those rows. If the 0010 application must be
rolled back, disable canonical presentation authoring, preparation and publication; leave the 0010
schema and audit rows in place; and deploy a corrected forward migration. Do not delete presentation
rows to make the older image appear compatible. The exact export list, function/trigger restoration
order and enum/table downgrade order are in
[`programme-publication-bundles.md`](programme-publication-bundles.md#migration-0010-rollback-and-forward-restore).

Migration 0012 adds append-only physician-verification, feedback-resolution and first-admin audit
records; database-derived accepted/rejected contribution counters; and the task-bound
ClinicalTrials.gov source-refresh workflow. Pre-0012 feedback marked resolved is reopened because
it has no trustworthy actor, time or reason. Pre-0012 physician badge decisions are returned to
`none` because the old submission path did not retain the professional name and workplace email
needed for an auditable review; affected users must resubmit. The migration does not invent those
missing facts. Export these operational audit tables and contribution review states before any
rollback. It also replaces the contribution-type enum transactionally to add `SOURCE_REFRESH`; an
older image does not understand those proposals. Do not delete or rewrite them to make an older
application image appear compatible; stop private review/source-refresh writes and deploy a
corrected forward migration.

Migration 0019 adds append-only recorded-background bindings, fetch attempts and assertion checks;
the Release A.1 application adds the `SOURCE_DRIFT` candidate reason used by the private worker. An
older image does not read question-level background drift, but its medical envelopes remain
unchanged. Before an incompatible rollback, stop **RNA Intelligence Source Sync** and preserve
evidence sources, snapshots, bindings, fetches, checks, agent runs and candidates. Leave the additive
schema and audit rows in place; do not delete history or edit a medicine merely to make an older
worker start. Deploy a corrected forward version before restarting the schedule.

## After a deploy

```bash
curl -sI https://rnawiki.com/healthz          # 200
curl -s https://rnawiki.com/api/search?q=metf # returns Metformin
railway logs --service RNAwiki | tail -20     # migrations ran, server ready
# Also inspect the latest `RNA Intelligence Source Sync` cron run and its JSON summary.
```
