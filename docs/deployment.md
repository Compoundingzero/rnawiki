# Deploying RNAwiki

Merge to `main` → Railway builds and deploys. That is the whole flow; everything below is what to
know when it goes wrong.

## The service

| | |
|---|---|
| Project | **RNAwiki** (`328c5ae7-2ccb-4d37-8524-ba7029daddae`) |
| App service | **RNAwiki** — capital R-N-A, and the CLI is case-sensitive |
| Database | **Postgres** service, private host `postgres.railway.internal` |
| Domain | https://rnawiki.com |

## What a deploy does

`railway.toml` sets `preDeployCommand = "npm run db:migrate"`, so migrations run in a throwaway
container **before** the new version takes traffic. Without it, a deploy that adds a column serves
500s from the moment it starts until someone remembers to migrate by hand.

The healthcheck is `/healthz`, which returns a bare `200 ok` and deliberately **does not touch the
database**. Liveness and readiness are different questions: a transient database blip must not roll
back an otherwise-good deploy.

## Environment

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Set by Railway's service reference. Uses the private host at runtime. |
| `SESSION_SECRET` | ≥ 32 characters or `lib/session.ts` throws on the first session request. |
| `SITE_URL` | `https://rnawiki.com`. Feeds `metadataBase`, the sitemap and JSON-LD. |
| `SITE_NAME` | `RNAwiki`. |

## Running scripts against production

`postgres.railway.internal` resolves **only inside Railway's network**. From a laptop you need the
Postgres service's `DATABASE_PUBLIC_URL`, which goes through a TCP proxy:

```bash
PU=$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)
DATABASE_URL="$PU" DATABASE_SSL_NO_VERIFY=true npx tsx scripts/ingest/run.ts
```

`DATABASE_SSL_NO_VERIFY=true` is needed because Railway's Postgres template serves a **self-signed
certificate and publishes no CA**, so verification against the public host cannot succeed out of the
box. It warns on every start, on purpose. The better answer is `PGSSLROOTCERT` pointing at the
server certificate; the escape hatch exists because a default nobody chose is a default nobody can
be said to have accepted.

A full corpus load over the proxy takes a few minutes. It is safe to re-run: every write is an
upsert keyed on slug, and the loader refuses to overwrite a curated dossier's narrative fields.

## The trap that will cost you an afternoon

**Railway's build container cannot reach the database.** `postgres.railway.internal` resolves at
runtime only. Any DB-backed route without a dynamic segment must declare:

```ts
export const dynamic = 'force-dynamic'
```

Currently: `app/page.tsx`, `app/browse/page.tsx`, `app/review-queue/page.tsx`, `app/sitemap.ts`.
Miss one and the production build fails while passing perfectly on your machine.

## Rolling back

Railway keeps previous deploys; redeploy one from the dashboard or `railway redeploy`. **A rollback
does not undo a migration.** Migrations here are additive, so an older image runs against a newer
schema without complaint — but if you ever write a destructive one, take a backup first:

```bash
PGSSLMODE=require psql "$PU" -t -A -c \
  "SELECT coalesce(json_agg(row_to_json(d))::text,'[]') FROM drugs d" > backup.json
```

`pg_dump` will refuse if your client is older than the server (Railway runs Postgres 18); a JSON
export through `psql` is version-agnostic and this database is small enough for it.

## After a deploy

```bash
curl -sI https://rnawiki.com/healthz          # 200
curl -s https://rnawiki.com/api/search?q=metf # returns Metformin
railway logs --service RNAwiki | tail -20     # migrations ran, server ready
```
