# Deployment

## Deploy flow

Railway auto-deploys on merge to `main`. There is no separate deploy command in normal operation
— pushing to `main` is the deploy trigger. Configuration lives in
[`railway.toml`](../railway.toml):

```toml
[deploy]
healthcheckPath = "/healthz"
healthcheckTimeout = 120
```

Railway will not cut traffic over to a new deployment until `/healthz` returns a successful
response, and gives it up to 120 seconds to start doing so — the previous deployment keeps serving
in the meantime.

**Open item, not a documentation gap:** as of this writing, `app/` has no route implementing
`/healthz`. `railway.toml` already points at it, but the route itself does not yet exist. A deploy
built before that route lands will fail Railway's health check and never go live. This needs to be
built (a minimal route that confirms the app booted and can reach the database is standard) before
the first production deploy of the rebuilt product. This is tracked as build-out work, not
something this document can resolve on its own.

The Railway service is named **`RNAwiki`** (capital R-N-A) — use that exact name with the Railway
CLI/MCP tooling (e.g. `railway variable list --service RNAwiki`).

## Environment variables

From [`.env.example`](../.env.example):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. In production this should be Railway's internal connection string (lower latency, no public exposure); use `DATABASE_PUBLIC_URL` instead only for a script run from outside Railway's network. `db/index.ts` skips TLS only for `localhost` / `127.0.0.1` / `*.railway.internal` hosts — anything else gets `ssl: { rejectUnauthorized: false }`. |
| `SESSION_SECRET` | Yes | Encrypts the admin/editor/reviewer session cookie (iron-session). Must be at least 32 characters (`openssl rand -base64 32`) — `lib/auth.ts` throws on the first session-touching request if it's missing or too short. Rotating it invalidates all existing admin sessions. |
| `SITE_URL` | Yes | Canonical origin used for canonical links, OG images, the sitemap, embeds, and API responses (`lib/canonical.ts`). Should be `https://rnawiki.com` in production. |
| `SITE_NAME` | Yes | Display name used in metadata. |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | Only for first seed | Read only by `scripts/seed.ts` to create the first administrator account. Unset both after the first successful seed run — leaving working bootstrap credentials in a production environment is a standing risk, not a convenience. |
| `NCBI_EUTILS_API_KEY` | Optional | Raises the rate limit on `lib/metadata-import.ts`'s PubMed lookups (NCBI E-utilities). The DOI lookup path (Crossref) needs no key. Absent it, PMID import still works, just at NCBI's lower unauthenticated rate limit. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Transactional email for evidence-change follow alerts (`subscriptions` table). The feature is feature-flagged off when unset — no email sends, subscriptions can still be recorded but nothing is dispatched. |
| `ANALYTICS_WRITE_KEY` | Optional | Privacy-conscious analytics. Feature-flagged off when unset. |

## Production migrations

`npm run db:migrate` runs `tsx db/migrate.ts`, which applies everything under
`db/migrations/` via Drizzle's Postgres migrator. It is idempotent — already-applied migrations
are skipped — so running it more than once is safe.

Run it **before** the new application code that depends on the resulting schema goes live, and
after any migration that a rollback might depend on has already been applied — in practice: run
`npm run db:migrate` against the production database as its own step immediately ahead of, or as
part of, the deploy that ships the code expecting the new schema. Since Railway serves the previous
deployment until the new one passes its health check, a migration that's backward-compatible with
the currently-live code (additive: new tables/columns, not renames or drops of anything still in
use) is the safe default — it lets the old code keep running correctly against the new schema for
the short overlap window, rather than requiring the migration and the deploy to land in the exact
same instant.

**There is currently no separate staging environment — only production.** Every migration and
every deploy goes straight to what `rnawiki.com` serves. This is a real gap: it means schema
changes and new code are both validated for the first time against production data and production
traffic. **Recommendation: add a Railway staging environment** (a second environment in the same
Railway project, pointed at its own Postgres, promoted to production only after a migration and a
deploy have both been exercised there) before this matters more than it already does — i.e., before
the site carries real reader traffic or an editorial team is publishing regularly.

## Rollback

**Application code.** The pre-rebuild application is fully preserved and untouched:
- branch [`archive/legacy-rnawiki`](../../tree/archive/legacy-rnawiki)
- tag `legacy-rnawiki-before-proof-boundary`

To roll the deployed application back to the pre-rebuild product, point Railway's deploy at that
branch or tag (or `git checkout` it in a separate working tree and push that state to whatever ref
Railway is configured to build from). This restores the old vanilla-JS build, not the new one —
treat it as a full product rollback, not a partial one, since the two applications don't share a
schema or a runtime.

**Database.** Rolling back to the pre-rebuild application also implies rolling back to its data
model, which is incompatible with the schema in `db/schema.ts` (this rebuild moved content from
`content/*.md` + `data/*.json` into Postgres tables that did not exist before). A real rollback
needs a database dump taken *before* the rebuild's migrations ran.

That dump exists: taken 2026-08-18, immediately before the production schema was replaced —
`pg_dump -F c` (full data) plus a schema-only companion, stored locally at
`RNAwiki-db-backups/` (sibling to this repo checkout, deliberately outside the git tree — it
contains real user PII/health data from the pre-rebuild `users`, `consent_records`,
`blood_markers`, and `experiments` tables and must never be committed). Verified restorable with
`pg_restore --list` at backup time (348 objects, 45 base tables, matches the pre-rebuild schema).
**This is currently the only copy** — it is not encrypted, not off this machine, and not
duplicated anywhere else. To actually roll back: restore it into a fresh Postgres instance with
`pg_restore -d <target> <dump file>`, then point the archived application's `DATABASE_URL` at that
instance. See `docs/BACKUP_RECOVERY.md` for the broader (separate, still-open) question of
ongoing production backup/PITR, which this one-time pre-rebuild dump does not solve — Railway's
own Postgres PITR and volume backups were confirmed **off** as of 2026-08-15 and remain off unless
explicitly enabled with the owner's approval.
