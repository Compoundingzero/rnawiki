# RNAwiki

**See where the evidence actually ends.**

A reference site for peptides, supplements, investigational medicines, and gene/RNA therapies. For
each claim it separates what a study **measured**, what people **infer** from it, and what stays
**unknown**, then pins the claim to one of 8 Proof Boundary stages from "biological rationale only"
to "regulatory evidence".

RNAwiki has no dosage calculator, no protocol builder, no stacking advice, and no procurement or
self-use guidance, in any form. That is the boundary the product exists to hold, not a missing
feature — see [`docs/product-principles.md`](docs/product-principles.md).

## What changed

This repository previously held a goal-first supplement/protocol wiki with a dosage engine, vanilla
JS, no framework. It is fully retired; nothing carries forward but the domain and the name. The old
application is preserved unmodified at branch
[`archive/legacy-rnawiki`](../../tree/archive/legacy-rnawiki) and tag
`legacy-rnawiki-before-proof-boundary`, not merged into `main` and not developed further.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript strict, server-rendered, Postgres via Drizzle ORM,
Zod on every write path. Exact versions in [`CLAUDE.md`](CLAUDE.md). Content lives in the database,
not Markdown or JSON files — see [`db/schema.ts`](db/schema.ts) — and is human-researched and
human-reviewed through an editorial workflow. AI is neither the differentiator nor the interface.

## Local setup

Node.js 20+ and a local Postgres.

```bash
npm install
cp .env.example .env        # DATABASE_URL, SESSION_SECRET, …
npm run db:migrate          # applies db/migrations/
npm run db:seed             # scripts/seed.ts + scripts/seed-legacy-redirects.ts
npm run dev                 # http://localhost:3000
```

Every variable, including the constraints on `SESSION_SECRET` and the first-administrator bootstrap
pair, is documented in [`docs/deployment.md`](docs/deployment.md).

## Tests

```bash
npm run test:unit          # vitest, tests/unit/**
npm run test:integration   # vitest, tests/integration/** (needs a database)
npm run test:e2e           # Playwright
npm run gate               # typecheck && lint && check:prose && test:unit && test:integration && build
```

Run `npm run gate` before pushing. Don't weaken it to make a change pass.

## Deployment

Merging to `main` triggers a Railway auto-deploy of the service named **`RNAwiki`**, configured by
[`railway.toml`](railway.toml). See [`docs/deployment.md`](docs/deployment.md) for env vars,
build-time constraints, migration sequencing, and rollback.

## Documentation

| Doc | Owns |
|---|---|
| [`docs/product-principles.md`](docs/product-principles.md) | The Proof Boundary concept, the claim-centered model, the reader, banned marketing language |
| [`docs/evidence-classification.md`](docs/evidence-classification.md) | Measured/Inferred/Unknown, evidence relationships, the 8 stages, mechanism vs. outcome |
| [`docs/editorial-methodology.md`](docs/editorial-methodology.md) | Roles, publication workflow, DOI/PMID import boundary, comprehension testing |
| [`docs/writing-style.md`](docs/writing-style.md) | Sentence-level voice rules, enforced by `npm run check:prose` |
| [`docs/deployment.md`](docs/deployment.md) | Railway deploy, env vars, migrations, rollback |
| [`docs/BACKUP_RECOVERY.md`](docs/BACKUP_RECOVERY.md) | Backup state and the open owner decisions |
| [`docs/legacy-removal-map.md`](docs/legacy-removal-map.md) | Old-route 301/410 audit record |
| [`docs/api.md`](docs/api.md) | The public read-only JSON API |
| [`CLAUDE.md`](CLAUDE.md) | Working notes for anyone, human or agent, changing this repo |

## Not medical advice

RNAwiki explains research evidence. It does not provide medical advice, diagnosis, dosing guidance,
or instructions for obtaining or using any substance, approved or unapproved.
