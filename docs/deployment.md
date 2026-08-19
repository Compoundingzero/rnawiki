# Deployment

## Deploy flow

Railway auto-deploys on merge to `main`. There is no separate deploy command. The Railway service
is named **`RNAwiki`** (capital R-N-A) — use that exact name with the CLI/MCP tooling, e.g.
`railway variable list --service RNAwiki`.

[`railway.toml`](../railway.toml):

```toml
[deploy]
healthcheckPath = "/healthz"
healthcheckTimeout = 120
```

Railway keeps the previous deployment serving until `/healthz` returns success, for up to 120
seconds. `app/healthz/route.ts` returns a bare `200 "ok"` and deliberately touches nothing — a
database outage should not also fail the health check and pull a working app server out of rotation.

## Build-time database access: there is none

Railway's **build container has no network path to `postgres.railway.internal`** — that hostname
resolves only at runtime, inside the deployed service's network. Any route Next prerenders at build
time while querying the database fails the deploy outright.

Every DB-backed route without a dynamic segment therefore sets `export const dynamic =
'force-dynamic'`: `app/(public)/page.tsx`, `app/(public)/updates/page.tsx`, `app/sitemap.ts`.
Dynamic routes like `/r/[slug]` are unaffected, since Next never statically renders them without an
explicit `generateStaticParams`. A new DB-backed static route without `force-dynamic` breaks the
production build while passing locally.

## Environment variables

From [`.env.example`](../.env.example):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. Use Railway's internal string in production; use `DATABASE_PUBLIC_URL` only for scripts run from outside Railway's network. `db/ssl.ts` parses the hostname and skips TLS only for `localhost`, `127.0.0.1`, `::1` and `*.railway.internal` — everything else gets TLS with the certificate **verified**. |
| `PGSSLROOTCERT` | Only for a remote database | Path to the database server's certificate (or its CA). Required for any connection over `DATABASE_PUBLIC_URL`, because Railway's Postgres serves a self-signed certificate and publishes no CA, so verification cannot succeed without it. |
| `DATABASE_SSL_NO_VERIFY` | No | Set to `true` to fall back to an encrypted-but-unauthenticated connection. Last resort: anything able to intercept the path can then present its own certificate and read the credentials in `DATABASE_URL`. Prints a warning on every start. |
| `SESSION_SECRET` | Yes | Encrypts the admin/editor/reviewer session cookie (iron-session). At least 32 characters (`openssl rand -base64 32`); `lib/auth.ts` throws on the first session-touching request otherwise. Rotating it invalidates all admin sessions. |
| `SITE_URL` | Yes | Canonical origin for canonical links, OG images, sitemap, embeds and API responses (`lib/canonical.ts`). `https://rnawiki.com` in production. |
| `SITE_NAME` | Yes | Display name in metadata. |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | First seed only | Read only by `scripts/seed.ts` to create the first administrator. Unset both after the first successful seed — live bootstrap credentials in production are a standing risk. |
| `NCBI_EUTILS_API_KEY` | Optional | Raises the rate limit on `lib/metadata-import.ts`'s PubMed lookups. PMID import still works without it, at NCBI's unauthenticated rate. Crossref (DOI) needs no key. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Transactional email for evidence-change alerts. Feature-flagged off when unset: subscriptions still record, nothing dispatches. |
| `ANALYTICS_WRITE_KEY` | Optional | Privacy-conscious analytics. Feature-flagged off when unset. |

## Production migrations

`npm run db:migrate` runs `tsx db/migrate.ts`, applying everything under `db/migrations/` via
Drizzle's migrator. It is idempotent — re-running is safe.

Run it **before** the code that depends on the new schema goes live: as its own step immediately
ahead of, or as part of, that deploy. Because Railway serves the old deployment until the new one
passes its health check, prefer backward-compatible migrations — additive columns and tables, not
renames or drops of anything still in use. That lets the old code keep working through the overlap
window instead of requiring migration and deploy to land in the same instant.

**Known gap: there is no staging environment, only production.** Every migration and every deploy is
validated for the first time against production data and production traffic. Fix: a second Railway
environment in the same project with its own Postgres, promoted only after a migration and a deploy
have both been exercised there. Do it before the site carries real reader traffic or an editorial
team publishes regularly.

## Rollback

**Application code.** The pre-rebuild application is preserved untouched at branch
[`archive/legacy-rnawiki`](../../tree/archive/legacy-rnawiki) and tag
`legacy-rnawiki-before-proof-boundary`. Point Railway's deploy at that branch or tag. This is a full
product rollback — the two applications share no schema and no runtime.

**Database.** The archived application's data model is incompatible with `db/schema.ts`; the rebuild
moved content from `content/*.md` + `data/*.json` into tables that did not exist before. A real
rollback needs a dump taken before the rebuild's migrations ran.

That dump exists, taken 2026-08-18 immediately before the production schema was replaced:

- `pg_dump -F c` (full data) plus a schema-only companion
- stored at `RNAwiki-db-backups/`, a sibling of this repo checkout, deliberately outside the git
  tree — it holds real PII/health data from the pre-rebuild `users`, `consent_records`,
  `blood_markers` and `experiments` tables and must never be committed
- verified with `pg_restore --list` at backup time: 348 objects, 45 base tables, matching the
  pre-rebuild schema
- **currently the only copy** — unencrypted, on one machine, duplicated nowhere

To restore: `pg_restore -d <target> <dump file>` into a fresh Postgres instance, then point the
archived application's `DATABASE_URL` at it.

This one-time dump says nothing about backups of the *current* database. Railway Postgres PITR and
volume backups were confirmed **off** as of 2026-08-15 and remain off pending the owner's approval
— see [`docs/BACKUP_RECOVERY.md`](BACKUP_RECOVERY.md).
