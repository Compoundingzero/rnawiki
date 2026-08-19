# RNAwiki — project briefing

**Owner:** Felix. **Live:** https://rnawiki.com.

> Rewritten 2026-08-18, when RNAwiki was rebuilt from a goal-first compound/dosage wiki (vanilla
> JS, Markdown) into the Proof Boundary product (Next.js + Postgres, claim-centered). **Discard any
> older copy of this file.** The old product's briefing is preserved on branch
> `archive/legacy-rnawiki` and tag `legacy-rnawiki-before-proof-boundary`; it describes a different
> application and applies to nothing under `main`. `docs/PRODUCTION_REVAMP_STATE.md` is gone with no
> successor — this file plus `docs/product-principles.md`, `docs/editorial-methodology.md` and
> `docs/evidence-classification.md` are the authoritative state.

## What this is

A claim-centered evidence explainer, not a protocol engine. Per claim: what was measured, what is
inferred, where that sits on the 8-stage Proof Boundary (`biological_rationale_only` →
`regulatory_evidence`), what is still unknown. Concept in
[`docs/product-principles.md`](docs/product-principles.md); vocabulary in
[`docs/evidence-classification.md`](docs/evidence-classification.md).

## Rules that are not negotiable

1. **No dosage, protocol, stacking or procurement guidance, ever, in any form.** Not a calculator,
   not a "how people typically use this," not a sourcing tip. If a claim's `accessRealityNote`
   drifts toward "here's how to get it," that is a defect. This overrides every other instruction in
   this repo.
2. **No fabricated reviewers, citations or approvals.** `components/ProofCard.tsx`'s
   `reviewStatusCopy()` is the only place that decides a review-status line, and it refuses to say
   "reviewed by" unless an `approved` row exists in `reviews` for that claim.
   `publicationStatus === 'published'` is never sufficient — that is editorial workflow, not
   scientific sign-off. Don't route around it with a locally-written status string.
3. **No star ratings, no confidence scores or percentages** — only `Measured`/`Inferred`/`Unknown`
   from `lib/evidence.ts`, unless a number comes straight from a named study (a sample size, a
   quoted p-value). The one built exception is `formatComprehensionAggregate`
   (`lib/comprehension.ts`), gated behind `CLARITY_MIN_RESPONSES` (20) and `CLARITY_MIN_CORRECT_RATE`
   (0.8); it returns `null` below threshold and callers must treat `null` as "show nothing," never
   fall back to a small-sample percentage.
4. **DOI/PMID import is metadata-only.** `lib/metadata-import.ts` (Crossref + NCBI E-utilities)
   returns title/authors/year/journal/doi/pmid for a human editor. It never auto-fills or infers
   `sourceType`, `studyDesign`, `species`, `sampleSize` or `endpoint`.
5. **Comprehension testing is not scientific validation.** "X% of N readers correctly identified
   where the evidence ends" measures whether the *explanation* was clear, not whether the *claim* is
   true. Don't let copy built on it imply otherwise —
   [`docs/editorial-methodology.md`](docs/editorial-methodology.md).
6. **Public pages server-render their core content.** `app/r/[slug]/page.tsx`, `app/page.tsx` and
   friends are server components querying Drizzle directly and must work with JavaScript disabled.
   `'use client'` only for real interactivity: comprehension answering, copy-citation, admin forms.
7. **Prose is gated.** `npm run check:prose` (`scripts/check-prose.ts`) enforces field length caps,
   sentence length, em-dash count and banned preambles. If it fails, cut the sentence; don't raise
   the cap. See [`docs/writing-style.md`](docs/writing-style.md).

## Stack — exact versions (package.json)

Next.js 15.4.0 (App Router) · React 19.1.0 · TypeScript 5.7.3 (strict) · Drizzle ORM 0.44.2 on `pg`
8.11.5 · Zod 3.24.1 · iron-session 8.0.4 · bcryptjs 2.4.3 · satori 0.12.0 + @resvg/resvg-js 2.6.2
(OG images). Tests: Vitest 2.1.8, Playwright 1.49.1. Path alias `@/*` → repo root.

`isomorphic-dompurify` was removed: it was declared but imported nowhere, which advertised an HTML
sanitisation step the codebase does not perform. The one place raw HTML is injected is the record
page's JSON-LD block, and it is handled by escaping in `lib/json-ld.ts`, not by sanitising. If HTML
sanitisation is ever genuinely needed, add the dependency back at the same commit as its first
import.

## Where content lives

**The database, not files** — a deliberate break from the old Markdown-under-`content/` model with
`data/*.json` sidecars. No build step turns Markdown into site data anymore. Tables: `entities`,
`regulatoryStatuses`, `claims`, `mechanismSteps`, `evidenceSources`, `claimEvidence`, `reviews`,
`revisions`, `correctionSubmissions`, `evidenceChanges`,
`comprehensionQuestions`/`comprehensionResponses`, `subscriptions`, `legacyRedirects`, `users` —
full shape in [`db/schema.ts`](db/schema.ts).

Seed content is TypeScript, not JSON: `scripts/seed-data/*.ts`, typed against
[`lib/seed-types.ts`](lib/seed-types.ts), loaded by `scripts/seed.ts`. Every cited source must be a
real, checkable DOI/PMID/NCT/regulatory URL verified at research time. Never invent one; if you
can't verify a claim, leave it out and say so.

Vocabulary — stages, Measured/Inferred/Unknown, relationships, clarity-gate constants — is
centralized in [`lib/evidence.ts`](lib/evidence.ts). Import it; never redeclare the wording or
ordering.

## Local dev

```bash
cp .env.example .env        # set DATABASE_URL to your local Postgres
npm run db:migrate          # tsx db/migrate.ts
npm run db:seed             # scripts/seed.ts + scripts/seed-legacy-redirects.ts
npm run gate                # typecheck && lint && check:prose && test:unit && test:integration && build
```

Run `gate` before pushing, and don't weaken it to make a change pass — a fix without a gate is a fix
that gets rediscovered. `db/ssl.ts` parses the connection string's hostname and disables TLS only
for `localhost` / `127.0.0.1` / `::1` / `*.railway.internal`; every other host gets TLS with the
certificate **verified**, so a remote database needs `PGSSLROOTCERT`. `DATABASE_SSL_NO_VERIFY=true`
restores the old unverified behaviour and warns on every start — it is opt-in on purpose.
`SESSION_SECRET` must be ≥32 characters or `lib/auth.ts` throws on the first request touching a
session.

## Deploys

Merge to `main` → Railway builds and deploys automatically. Service name is **`RNAwiki`** (capital
R-N-A). `railway.toml` sets `healthcheckPath = "/healthz"` and `healthcheckTimeout = 120`;
`app/healthz/route.ts` returns a bare `200 "ok"` and deliberately does not touch the database. Env
vars, migration sequencing and rollback: [`docs/deployment.md`](docs/deployment.md).

## Gotchas that will otherwise waste time

- **Railway's build container cannot reach `postgres.railway.internal`** — that hostname resolves
  only at runtime. Every DB-backed route without a dynamic segment must set
  `export const dynamic = 'force-dynamic'` (`app/(public)/page.tsx`, `app/(public)/updates/page.tsx`,
  `app/sitemap.ts`) or the production build fails while passing locally.
- `entities.searchVector` and `claims.searchVector` are generated columns using **bare, unqualified
  column names** (`canonical_name`, not `${entities.canonicalName}`) inside the SQL expression.
  Deliberate: qualifying them reintroduces a TS7022 circular self-reference under strict TypeScript.
  Read the comment above `entities` in `db/schema.ts` before "fixing" it.
- Stage ordering comes from the `PROOF_BOUNDARY_STAGES` array in `lib/evidence.ts`, not from the
  Postgres enum's declaration order in `db/schema.ts`. The two are synced **by hand** — a stage added
  to one and not the other is a real bug no lint will catch.
- `lib/comprehension.ts`'s `getQuestionsForClaim` deliberately excludes `correctOptionIndex` from the
  client view; the answer key is read server-side only, in `recordResponse`. Don't add it to a
  client-facing type without re-reading that file's comments. A claim's central Proof Boundary
  question is `displayOrder: 0` by editorial convention, not schema constraint, and the public
  aggregate comes from that question alone.
- `lib/rate-limit.ts` is an in-memory, single-process sliding window (60 req/min on public
  `/api/v1/*`). It resets on every deploy and is **not shared across replicas** — beyond one instance
  the effective site-wide limit becomes `60 × replica count`.
- `lib/session-hash.ts` hashes IP + a coarse user-agent bucket + a rotating daily salt for anonymous
  rate-limiting and dedup. Never log or store the raw IP anywhere longer-lived than that.
- `resolveLegacyRedirect` in `lib/canonical.ts` is a pure function over rules loaded from the
  `legacyRedirects` table. Read [`docs/legacy-removal-map.md`](docs/legacy-removal-map.md) before
  hand-editing redirect logic.
