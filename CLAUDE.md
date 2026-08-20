# RNAwiki — project briefing

**Owner:** Felix. **Live:** https://rnawiki.com.

> Rewritten 2026-08-20, when RNAwiki was rebuilt from the Proof Boundary product into the **Open
> Drug Evidence Audit Layer** defined by the master reference wireframe. **Discard any older copy of
> this file.** The Proof Boundary product — 8-stage evidence ladder, comprehension tests,
> correction submissions, `/r/[slug]` record pages — is preserved at tag
> `archive/proof-boundary-2026-08-20` and applies to nothing under `main`. `docs/product-principles.md`,
> `docs/editorial-methodology.md` and `docs/evidence-classification.md` are gone with no successor.

## The master reference

`/Users/admin/Downloads/rnawiki---open-drug-evidence-audit-layer` is a Vite/React wireframe and it
is **the specification** for how this product looks, feels and behaves. When the code and the
reference disagree, the reference is right. Never modify anything inside that folder.

Four divergences from it are deliberate and must not be reverted:

1. **localStorage became the server.** The wireframe kept the user and the drug ledger in
   `localStorage`; here every read is a server query and every write is an API call.
2. **The verified-physician badge is earned, not granted.** `DoctorVerificationModal` awarded the
   blue check after a 900 ms `setTimeout`. Here, submitting credentials sets
   `verificationState = 'pending'` and a steward approves by hand. `isVerifiedPhysician()` in
   `components/app-context.tsx` and the server's `verificationState === 'verified'` check are the
   only things that render the badge. Nothing may route around them.
3. **Hard-coded per-drug fallbacks are deleted.** The wireframe printed
   `drug.id === 'inclisiran' ? 'AUGUCAUUGGAUCACUGCU' : …` for structures and anatomical sites.
   Inventing a sequence for a drug that has none is fabricated science. Absent data renders the
   contribute state.
4. **Accessibility the wireframe lacked** — real `<button>`s, focus traps, Escape-to-close,
   `aria-label` on icon-only controls — added without changing the visual design.

## Rules that are not negotiable

1. **Never fabricate a fact.** No invented sequence, SMILES, molecular weight, synthesis cost,
   retail price, markup, trial result, DOI, sponsor or count. A field with no source stays null and
   the page says so. This overrides every other instruction in this repo.
2. **The engine is deterministic and stays that way.** Nothing under `lib/rna-intelligence/` may
   call a generative model or use randomness. Same input, same report, same verification hash —
   `runFullDeterministicSweep` hashes the _input_, never the timestamp.
3. **An engine failure is an instant rejection.** `decideEditRouting` checks `enginePassed` before
   it checks trust tier, so a steward cannot publish a structurally broken edit. The server always
   re-runs the sweep; a client-computed report is a suggestion, not a verdict.
4. **Ingestion never authors narrative.** `scripts/ingest/` fills identity and regulatory facts
   only. Verdicts, mechanisms, pricing and alternatives are curated (`dossierDepth`
   `curated`/`flagship`) or absent. A re-ingest must never overwrite a curated field.
5. **Dosage and protocol content ships as the reference shows it.** The natural-substitute
   "Recommended Usage" line and the laboratory workflow section are part of the specification.
   Protocols stay at the reference's phase-level abstraction. The site-wide medical disclaimer in
   `components/SiteFooter.tsx` is not optional.
6. **Public pages server-render their core content.** Routes are server components querying Drizzle
   directly. `'use client'` is for real interactivity: search, the mechanism carousel, the editor,
   the modals. Client components are still server-rendered to HTML on first load, so a dossier is
   readable with JavaScript disabled.

## Stack — exact versions (package.json)

Next.js 15.4 (App Router) · React 19.1 · TypeScript 5.7 (strict, `noUncheckedIndexedAccess`) ·
Tailwind v4 (no config file — tokens live in `app/globals.css` `@theme`) · lucide-react ·
Drizzle ORM 0.44 on `pg` 8.11 · Zod 3.24 · iron-session 8 · bcryptjs 2.4.
Tests: Vitest 2.1, Playwright 1.49. Path alias `@/*` → repo root.

## The RNA Intelligence engine

`lib/rna-intelligence/` is the deterministic validation pipeline every edit passes through.

- **Layer 1** (`layer1-sequence.ts`) — the A/U/C/G alphabet with thymine auto-transcribed and
  reported, the triplet reading frame, start/stop codons, open reading frame and premature stops,
  exact molecular weight from composition, a real SMILES tokenizer (`smiles.ts`) producing Hill
  formula and implicit-hydrogen counts, and peptide backbone validation that survives a
  parenthesised side-chain conjugate.
- **Layer 2** (`layer2-structure.ts`) — a Zuker-style O(n³) fold (`fold.ts`) over the published
  Turner 2004 nearest-neighbour parameters (`turner-params.ts`), producing a real MFE in kcal/mol
  and dot-bracket notation; Lipinski and Crippen descriptors (`descriptors.ts`) for small molecules.
  Same algorithm class and same parameter set as ViennaRNA, in TypeScript, because there is no Rust
  toolchain in the deploy container. The boundary is a single module — swapping in a WASM core is a
  one-file change.
- **Layer 3** (`layer3-protocol.ts`) — a real DAG: duplicate ids, dangling dependencies, cycles via
  Kahn's algorithm, and phase progression along every edge against `CANONICAL_PHASE_ORDER`. An
  empty workflow passes with a warning; most of the corpus has no documented protocol and that is
  not an error.

`docs/api-contract.md` is the agreed shape between the client and every route handler. Change it
there first.

## Where content lives

**The database.** Tables: `drugs`, `community_notes`, `note_upvotes`, `revisions`, `saved_drugs`,
`users`, `feedback`, `ingest_runs`, `drug_aliases` — full shape in `db/schema.ts`.

Two populations, and the difference matters:

- **Ingested stubs** — every FDA-registered active moiety and NIH-listed supplement ingredient,
  built by `scripts/ingest/` from openFDA Drugs@FDA, the NDC Directory, SPL labels, PubChem and the
  NIH Dietary Supplement Label Database. Real identity and regulatory facts, no narrative.
- **Curated dossiers** — `scripts/seed-data/*.ts`, the flagship records with verdicts, mechanism
  steps, pricing, alternatives and cited audits. Every citation must be a real, checkable
  DOI/PMID/NCT/regulatory URL verified at research time. Never invent one; if you cannot verify it,
  leave it out and say so.

## Local dev

```bash
cp .env.example .env        # DATABASE_URL -> your local Postgres; SESSION_SECRET >= 32 chars
npm run db:migrate
npm run ingest:download     # ~2 GB of public source data, resumable
npm run ingest              # build the corpus (--dry-run to preview, --limit N to sample)
npm run db:seed             # the curated flagship dossiers
npm run gate                # typecheck && lint && test:unit && test:integration && build
```

Run `gate` before pushing, and don't weaken it to make a change pass. `db/ssl.ts` disables TLS only
for `localhost` / `127.0.0.1` / `::1` / `*.railway.internal`; every other host gets TLS with the
certificate **verified**, so a remote database needs `PGSSLROOTCERT`. `DATABASE_SSL_NO_VERIFY=true`
restores the old unverified behaviour and warns on every start.

## Deploys

Merge to `main` → Railway builds and deploys automatically. Service name is **`RNAwiki`** (capital
R-N-A). `railway.toml` sets `healthcheckPath = "/healthz"`; `app/healthz/route.ts` returns a bare
`200 "ok"` and deliberately does not touch the database — a transient DB blip must not roll back a
good deploy.

## Gotchas that will otherwise waste time

- **Railway's build container cannot reach `postgres.railway.internal`** — that hostname resolves
  only at runtime. Every DB-backed route without a dynamic segment must set
  `export const dynamic = 'force-dynamic'` (`app/page.tsx`, `app/browse/page.tsx`, `app/sitemap.ts`)
  or the production build fails while passing locally.
- **Next.js 15 route params are a Promise.** `{ params }: { params: Promise<{ slug: string }> }`,
  and you must `await` it. This is the single most common porting bug in this codebase.
- `drugs.searchVector` is a generated column using **bare, unqualified column names**
  (`patient_friendly_indication`, not `${drugs.patientFriendlyIndication}`). Deliberate: qualifying
  them reintroduces a TS7022 circular self-reference under strict TypeScript. Read the comment
  above the column in `db/schema.ts` before "fixing" it.
- The modality and approval-status vocabularies exist **twice** — as TypeScript unions in
  `lib/types.ts` and as pgEnums in `db/schema.ts` — and are synced **by hand**. A value added to one
  and not the other is a real bug no lint will catch.
- `lib/rate-limit.ts` is an in-memory, single-process sliding window. It resets on every deploy and
  is **not shared across replicas** — beyond one instance the effective site-wide limit becomes
  `limit × replica count`.
- `lib/session-hash.ts` hashes IP + a coarse user-agent bucket + a rotating daily salt. Never log or
  store the raw IP anywhere longer-lived than that.
- PubChem renamed `CanonicalSMILES` in 2025. `scripts/ingest/pubchem.ts` documents the property
  names actually observed against the live API — verify before trusting a column that comes back
  empty.
