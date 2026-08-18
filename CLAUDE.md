# RNAwiki — project briefing

**Owner:** Felix. **Live:** https://rnawiki.com.

> This file was rewritten on 2026-08-18, when RNAwiki was rebuilt from a goal-first compound/
> dosage wiki (vanilla JS, Markdown content, no framework) into the Proof Boundary product
> described below (Next.js + Postgres, database-backed content, claim-centered). **If you are
> reading an older copy of this file anywhere, discard it.** The old product's own briefing is
> preserved unmodified on branch `archive/legacy-rnawiki` and tag
> `legacy-rnawiki-before-proof-boundary` — it describes a different application and does not apply
> to anything under `main` or `proof-boundary-rebuild` going forward. `docs/PRODUCTION_REVAMP_STATE.md`
> is gone; it tracked the old product's build-out and has no successor doc — this file plus
> `docs/product-principles.md` / `docs/editorial-methodology.md` / `docs/evidence-classification.md`
> are now the authoritative state.

---

## What this actually is

A claim-centered evidence explainer, not a protocol engine. A reader looks up a peptide,
supplement, investigational medicine, or gene/RNA therapy and gets, per claim: what was measured,
what's inferred from it, where that sits on an 8-stage **Proof Boundary**
(`biological_rationale_only` → `regulatory_evidence`), and what's still unknown. Full concept in
[`docs/product-principles.md`](docs/product-principles.md).

**Non-negotiable, no exceptions:** no dosage calculators, protocol builders, stacking, or
procurement/self-use guidance anywhere, in any form, ever. This is the one constraint that
overrides every other instruction in this repo.

## The stack — exact versions (package.json)

Next.js 15.4.0 (App Router) · React 19.1.0 · TypeScript 5.7.3 (strict) · Drizzle ORM 0.44.2 on
`pg` 8.11.5 · Zod 3.24.1 · iron-session 8.0.4 (admin/editor/reviewer sessions) · bcryptjs 2.4.3 ·
isomorphic-dompurify 2.16.0 · satori 0.12.0 + @resvg/resvg-js 2.6.2 (OG/share images). Test stack:
Vitest 2.1.8 (unit + integration), Playwright 1.49.1 (e2e). Path alias `@/*` → repo root.

## Where content actually lives

**The database, not files.** This is a real, deliberate change from the old model, where every
compound was a Markdown file under `content/` and `data/*.json` sidecars. Now: `entities`,
`regulatoryStatuses`, `claims`, `mechanismSteps`, `evidenceSources`, `claimEvidence`, `reviews`,
`revisions`, `correctionSubmissions`, `evidenceChanges`, `comprehensionQuestions`/
`comprehensionResponses`, `subscriptions`, `legacyRedirects`, `users` — see
[`db/schema.ts`](db/schema.ts) for the full shape. There is no build step that turns Markdown into
site data anymore. Seed content is TypeScript, not JSON: `scripts/seed-data/*.ts`, typed against
[`lib/seed-types.ts`](lib/seed-types.ts), loaded by `scripts/seed.ts`. Every cited source in a seed
file must be a real, checkable DOI/PMID/NCT/regulatory URL verified at research time — never invent
one, and if you can't verify a claim, leave it out and say so rather than guessing.

Vocabulary (Proof Boundary stages, Measured/Inferred/Unknown, evidence relationships,
comprehension clarity-gate constants) is centralized in [`lib/evidence.ts`](lib/evidence.ts).
Import it; never redeclare the wording or the ordering elsewhere. Stage ordering is enforced in
that file (`PROOF_BOUNDARY_STAGES` array order), not by relying on the Postgres enum's declaration
order in `db/schema.ts` — the two are kept in sync by hand, not by code, so a stage added to one
without the other is a real bug, not a lint failure.

## Rules that are not negotiable

1. **No dosage/protocol/stacking/procurement guidance, ever, in any form.** Not a calculator, not
   a "how people typically use this," not a sourcing tip. If a claim's `accessRealityNote` starts
   drifting toward "here's how to get it," that's a defect, not editorial color.
2. **No fabricated reviewers, citations, or approvals.** `components/ProofCard.tsx`'s
   `reviewStatusCopy()` is the one place that decides what a claim's review-status line says, and
   it deliberately refuses to say "reviewed by" unless an actual `approved` row exists in
   `reviews` for that claim — `publicationStatus === 'published'` alone is never sufficient, because
   that describes editorial workflow, not scientific sign-off. Don't route around it with a
   locally-written status string.
3. **No star ratings, no numeric confidence scores or percentages** — only `Measured` / `Inferred`
   / `Unknown` from `lib/evidence.ts`, unless a number is directly sourced from a named study (a
   sample size, a p-value quoted from the paper). The one exception already built is the
   comprehension aggregate string in `lib/comprehension.ts`
   (`formatComprehensionAggregate`) — and even that is gated behind `CLARITY_MIN_RESPONSES` (20)
   and `CLARITY_MIN_CORRECT_RATE` (0.8) and returns `null` below threshold; callers must treat
   `null` as "show nothing," never fall back to a small-sample percentage.
4. **DOI/PMID import is metadata-only.** `lib/metadata-import.ts` (Crossref + NCBI E-utilities)
   returns title/authors/year/journal/doi/pmid for a human editor to review — it never
   auto-fills or infers `sourceType`, `studyDesign`, `species`, `sampleSize`, or `endpoint`. Those
   stay manual editorial judgment calls, always.
5. **Comprehension testing is not scientific validation.** The public "X% of N readers correctly
   identified where the evidence ends" line measures whether the *explanation* was clear, not
   whether the *claim* is true. Don't let copy built on top of it imply otherwise. See
   `docs/editorial-methodology.md`.
6. **Public pages server-render their core content.** `app/r/[slug]/page.tsx`, `app/page.tsx`,
   etc. are server components querying Drizzle directly — they must work with JavaScript disabled.
   `'use client'` only for genuine interactivity (comprehension answering, copy-citation button,
   admin forms).

## How deploys work

`railway.toml` sets `healthcheckPath = "/healthz"`, `healthcheckTimeout = 120`. **As of this
writing there is no `/healthz` route implemented yet** (`app/` has no matching file) — that's
open work, not a documentation gap; don't assume a deploy will pass health checks until it exists.
Railway service name is **`RNAwiki`** (capital R-N-A). Deploy flow: merge to `main` → Railway
builds and deploys automatically. Full detail, including required env vars and migration
sequencing, in [`docs/deployment.md`](docs/deployment.md).

## Local dev database

```bash
cp .env.example .env        # set DATABASE_URL to your local Postgres
npm run db:migrate          # tsx db/migrate.ts — applies db/migrations/
npm run db:seed             # tsx scripts/seed.ts — loads scripts/seed-data/*.ts
```

`db/index.ts` disables TLS only for `localhost` / `127.0.0.1` / `*.railway.internal` connection
strings; anything else gets `ssl: { rejectUnauthorized: false }`. `SESSION_SECRET` must be ≥32
characters or `lib/auth.ts` throws on the first request that touches a session.

## Before you push

```bash
npm run gate   # typecheck && lint && test:unit && test:integration && build
```
Run it. Don't weaken it to make a change pass — same convention as the old repo's build gates: a
fix without a gate is a fix that gets rediscovered.

## Gotchas that will otherwise waste time

- `entities.searchVector` and `claims.searchVector` are Postgres generated columns using **bare,
  unqualified column names** (`canonical_name`, not `${entities.canonicalName}`) inside the SQL
  expression — this is deliberate, not a typo. Qualifying them reintroduces a TS7022 circular
  self-reference under this project's strict TypeScript settings. See the comment above
  `entities` in `db/schema.ts` before "fixing" it.
- `lib/comprehension.ts`'s `getQuestionsForClaim` deliberately excludes `correctOptionIndex` from
  the view sent to the client — the answer key is only ever read server-side, inside
  `recordResponse`. Don't add it to a client-facing type without re-reading that file's comments.
  A claim's central Proof Boundary question is `displayOrder: 0` by editorial convention (not
  schema-enforced); the public comprehension aggregate is computed from that question alone.
- `lib/rate-limit.ts` is an in-memory, single-process sliding window (60 req/min for the public
  `/api/v1/*` routes). It resets on every deploy and is **not shared across replicas** — if Railway
  ever scales this service beyond one instance, the effective site-wide limit becomes
  `60 × replica count`, not 60/min. Fine for one instance; not "correct" beyond that.
  `docs/api.md` documents the resulting behavior for API consumers.
- `lib/session-hash.ts` hashes IP + a coarse user-agent bucket + a rotating daily salt for
  anonymous rate-limiting/dedup (comprehension responses, correction submissions) — never log or
  store the raw IP anywhere longer-term than that.
- Legacy route handling (`resolveLegacyRedirect` in `lib/canonical.ts`) is a pure function over
  rules loaded from the `legacyRedirects` table — see `docs/legacy-removal-map.md` for the actual
  route mapping (owned separately; don't hand-edit redirect logic without reading it first).
