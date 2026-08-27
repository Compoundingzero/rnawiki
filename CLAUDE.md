# RNAWiki project briefing

**Owner:** Felix. **Live site:** https://rnawiki.com.

RNAWiki is a public, programme-scoped record of medicine evidence. The home page stays deliberately
simple. Detailed evidence, review history, sources, mechanism stages, timelines and contribution
controls belong on the dossier and review pages, not on the first screen.

## Non-negotiable boundaries

1. **Never invent medical content.** A missing source, trial result, population, dose, mechanism,
   reviewer or conclusion stays missing and is described honestly. Test fixtures must never become
   production seed data.
2. **Keep one conclusion inside one defined programme.** A reviewed conclusion belongs to one
   indication, population, dose or exposure and set of trials. Do not copy it to the medicine as a
   whole.
3. **Use exact saved sources.** Claims cite immutable source snapshots. A later source change may
   create review work, but it must not silently change an already published record.
4. **Software checks structure; people judge meaning.** RNA Intelligence is deterministic,
   versioned code. It does not call a language model, write medical prose or select a verdict.
5. **Publication is a reviewed transaction.** Reviewers sign the exact proposal and engine digests.
   Editing a candidate invalidates those approvals. The public pointer, exact graph and covered
   source task move together or not at all.
6. **Unknown is not failure.** Keep `UNKNOWN`, `NOT_MEASURED`, `CONTRADICTED`, `MIXED` and
   `CONFIRMED` distinct in storage, rules and reader-facing copy.
7. **Do not expose operational laboratory instructions.** Public molecular context may show recorded
   identity and narrow structure checks. It must not expose synthesis, reagents, quality-control
   recipes or actionable laboratory workflow.

## Current data model

The legacy `drugs` table supplies medicine identity and older, visibly labelled records while the
corpus is moved to the normalized model. It is not a valid source for a programme conclusion.

Normalized evidence starts with `development_programmes` and uses immutable source snapshots,
versioned claims, five evidence-chain nodes, trial-interpretability assessments, explicit dependency
edges and verdict-scoped programme/trial/source/presentation snapshots. Public reads begin at
`programme_current_publications` and follow only the exact graph linked to that revision. Live
staging rows may change without rewriting public history.

Migrations `0003` through `0010` introduce and harden that model. Migration `0011` replaces the old
medicine-wide edit path with sourced name/trade-name corrections and quarantines unsafe historical
pending edits without deleting their audit rows. Migration `0012` adds audited private operational
review, normalized contribution accounting and the parser-exact ClinicalTrials.gov refresh path.

## RNA Intelligence

Group A (`runFullDeterministicSweep`) checks stored molecular or sequence structure where applicable.
It currently runs during ingestion/enrichment and seed validation; there is no public molecular
editor.

Groups B–H (`runEvidenceIntelligence`) check programme scope, sources, dates and study structure,
the five evidence questions, conclusion consistency, plain language and the impact of source
changes. The full engine runs when a canonical programme proposal is prepared and again from locked
database rows during publication. Contribution intake and source monitoring use smaller,
purpose-specific checks and must not be described as full Groups B–H runs.

`programme-presentation/v1` selects RNA Intelligence 2.1. It adds digest-bound checks for three to
five sourced mechanism stages and an optional sourced timeline. Older prepared records remain on
their original 2.0.1 proposal bytes and digests.

The rule catalog and tests are part of the contract: every emitted stable code must be registered and
must have an executable focused case. See `docs/rna-intelligence-v2.md` and
`lib/rna-intelligence/EVIDENCE_INTEGRATION.md`.

## Authoring and review workflows

- **Legacy medicine identity:** any signed-in person may propose exactly one medicine-name or
  trade-name correction with a public HTTP(S) source and explanation. RNAWiki stores but does not
  fetch that submitted URL. One different trusted person decides it. No role auto-publishes.
- **Programme correction or challenge:** the server freezes the selected field, current value,
  source, checks, dependencies and contributor conflict statement. Three independent eligible
  people review the same digest (review states opened before migration 0015 keep their frozen
  two-review policy); disagreement among the recorded decisions requires an independent steward
  decision. Acceptance does not directly mutate the public record.
- **Canonical implementation and publication:** accepted work is materialized into a complete
  candidate, checked, reviewed by two currently qualified people and published atomically. A source
  task closes only with the exact replacement that resolves it.
- **First publication:** `scripts/create-first-programme-verdict-draft.ts` accepts a complete
  human-authored bundle and defaults to rollback-only validation. It never generates claims,
  evidence states, mechanism text or a conclusion. A commit creates only an unprepared draft; the
  normal prepare, review and publish gates still apply.
- **Complete successor:** `scripts/create-successor-programme-verdict-draft.ts` and the protected
  successor API accept the same complete, strict bundle shape for a programme that already has a
  publication. They replace the candidate trial scope, claims, evidence nodes, study assessments,
  dependencies, presentation and conclusion without changing the public pointer. They default to
  rollback-only validation in the operator command and still require prepare, qualified review and
  publication.
- **ClinicalTrials.gov onboarding:** `scripts/onboard-clinical-trial-programme.ts` defaults to dry
  run and creates registry facts only. It creates no claim, evidence node, reviewer or conclusion.
  Scheduled monitoring currently covers supported ClinicalTrials.gov NCT records, not every source
  type. A parser-exact, non-interpretive registry delta can enter the ordinary contribution review
  path. A change that touches scientific meaning stops and requires a complete successor bundle;
  the monitor never writes replacement medical prose.

## Public copy and interface rules

- Preserve the home page headline and its short search-first layout.
- Use ordinary-language labels in the main view. Raw enums, digests and record ids belong in an
  explicitly labelled technical disclosure.
- Explain acronyms and review terms the first time they appear. Do not use promotional phrases such
  as “AI-powered”, “revolutionary”, “cutting-edge”, “seamless” or “actionable insights”.
- Never imply that a linked source proves a conclusion. Say what exact claim the source supports,
  qualifies or contradicts.
- Public pages must retain one `<main>`, logical heading order, keyboard operation, visible focus,
  adequate contrast and no horizontal overflow at 320 px.

## Data and seed safety

Ingestion may add sourced identity and regulatory facts, but it must not author a verdict or
overwrite reviewed content. Re-running ingestion must preserve curated and published records.

Files under `scripts/seed-data/` contain large hand-maintained datasets. Do not mass-format or
mechanically rewrite them as part of unrelated work. In this workspace, batches 19, 20 and 27–30
contain user-owned changes and must not be edited or staged for deployment.

## Local verification

```bash
cp .env.example .env        # DATABASE_URL and SESSION_SECRET (at least 32 characters)
npm install
npm run db:migrate
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run build
```

`npm run gate` runs typecheck, lint, public-copy checks, formatting, migration metadata checks, unit
tests, disposable-database integration tests, the production build and Playwright browser tests.
Database integration tests must run against a disposable local database.
`scripts/with-disposable-database.ts` creates a uniquely named local test database, migrates it, runs
the supplied command and drops it; it refuses remote hosts and non-test database names.

Playwright fixtures that create qualified reviewers must also use a disposable database. Never
leave known-password privileged test accounts in a shared or production database.

## Stack and deployment

Next.js 15 App Router, React 19, strict TypeScript 5.7, Tailwind v4, Drizzle ORM/PostgreSQL, Zod,
iron-session, Vitest and Playwright. Railway hosts the web service and the ClinicalTrials.gov source
sync service.

Database-backed routes without a dynamic path segment must use
`export const dynamic = 'force-dynamic'`; Railway's build environment cannot resolve the private database host during page
collection. Next.js 15 route params are promises and must be awaited. Remote PostgreSQL connections
must verify the server certificate. There is no certificate-verification bypass.

Do not deploy a migration or scientific workflow after static tests alone. Require a clean migration
replay, PostgreSQL integration tests, production build and the relevant keyboard, accessibility and
responsive browser journey. After deployment, verify the public page, API/export binding, source
freshness and review history against the same current revision.
