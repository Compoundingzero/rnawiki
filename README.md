# RNAwiki

**See where the evidence actually ends.**

RNAwiki is a reference site for peptides, supplements, investigational medicines, and gene/RNA
therapies. For a given compound or treatment, it separates three things that popular coverage
routinely blurs together: what a study actually **measured**, what people **infer** from that
measurement, and what remains **unknown**. Every claim on the site is pinned to a point on an
8-stage **Proof Boundary** — from "biological rationale only" up to "regulatory evidence" — so a
reader can see exactly how far the evidence goes before the inference starts.

RNAwiki does not tell you what to take, how much, or how to get it. It has no dosage calculator,
no protocol builder, no stacking advice, and no procurement or self-use guidance, anywhere, in any
form. That is not a missing feature — it is the boundary the whole product is built to hold. See
[`docs/product-principles.md`](docs/product-principles.md).

## What changed

This repository used to hold a different product: a goal-first supplement/protocol wiki with a
dosage engine, built on vanilla JS with no framework. That product has been fully retired. RNAwiki
is now a claim-centered evidence explainer, rebuilt from scratch as a Next.js + Postgres
application. Nothing from the old build carries forward except the domain and the name.

The old application is preserved, unmodified, at:
- branch [`archive/legacy-rnawiki`](../../tree/archive/legacy-rnawiki)
- tag `legacy-rnawiki-before-proof-boundary`

If you're looking for the compound/protocol/dosage wiki, that's where it lives. It is not merged
into `main` and is not being developed further.

## How it works

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict), server-rendered.
- **Postgres** via **Drizzle ORM** — content (entities, claims, mechanism steps, evidence sources,
  reviews) lives in the database, not in Markdown or JSON files. See
  [`db/schema.ts`](db/schema.ts).
- **Zod** for input validation on every write path.
- An **editorial workflow**, not an AI pipeline. Claims move through draft → editorially complete
  → scientific review required → approved → published (and can be flagged `needs_update` or sent
  to `re_review` when new evidence appears). Content is human-researched and human-reviewed. AI is
  not the differentiator and is not the interface — see
  [`docs/editorial-methodology.md`](docs/editorial-methodology.md).
- Evidence status is always one of **Measured / Inferred / Unknown** — see
  [`lib/evidence.ts`](lib/evidence.ts) and
  [`docs/evidence-classification.md`](docs/evidence-classification.md). No star ratings, no
  numeric confidence scores, unless a number is directly sourced from a named study.

## Local setup

Prerequisites: Node.js 20+, a local Postgres instance.

```bash
git clone <this-repo>
cd rnawiki
npm install
cp .env.example .env        # fill in DATABASE_URL, SESSION_SECRET, etc. — see below
# start your local Postgres, then:
npm run db:migrate          # applies db/migrations/ to your local database
npm run db:seed             # loads scripts/seed-data/*.ts via scripts/seed.ts
npm run dev                 # http://localhost:3000
```

`SESSION_SECRET` must be at least 32 characters (`openssl rand -base64 32`) — the admin session
(`lib/auth.ts`) throws on boot without it. `ADMIN_BOOTSTRAP_EMAIL` /
`ADMIN_BOOTSTRAP_PASSWORD` are only read by `scripts/seed.ts` to create the first administrator
account; unset them after the first run. See [`.env.example`](.env.example) for the full list,
and [`docs/deployment.md`](docs/deployment.md) for what each variable does in production.

## Tests

```bash
npm run test:unit          # vitest, tests/unit/**
npm run test:integration   # vitest, tests/integration/** (needs a database)
npm run test:e2e           # Playwright
npm run gate                # typecheck && lint && test:unit && test:integration && build — the pre-push gate
```

Run `npm run gate` before pushing. It is the same sequence a merge is expected to pass cleanly.

## Deployment

Merging to `main` triggers a Railway auto-deploy, configured by [`railway.toml`](railway.toml).
See [`docs/deployment.md`](docs/deployment.md) for environment variables, the migration
sequencing around a deploy, and rollback. The Railway service is named **`RNAwiki`**.

## Documentation

- [`docs/product-principles.md`](docs/product-principles.md) — the Proof Boundary concept, the
  claim-centered model, who this is for, and the banned marketing-language list.
- [`docs/editorial-methodology.md`](docs/editorial-methodology.md) — the editorial workflow,
  the DOI/PMID import boundary, and comprehension testing.
- [`docs/evidence-classification.md`](docs/evidence-classification.md) — Measured/Inferred/
  Unknown, the 8 Proof Boundary stages, and the two-rail (mechanism vs. outcome) evidence model.
- [`docs/deployment.md`](docs/deployment.md) — Railway deploy flow, environment variables,
  migrations, rollback.
- [`docs/api.md`](docs/api.md) — the public read-only JSON API.
- [`CLAUDE.md`](CLAUDE.md) — working notes for anyone (human or agent) making changes here.

## Not medical advice

RNAwiki explains research evidence. It does not provide medical advice, diagnosis, dosing
guidance, or instructions for obtaining or using any substance, approved or unapproved.
