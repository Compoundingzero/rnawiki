# Full corpus completion worklog

Started: 2026-09-02 (Asia/Singapore). Machine-readable ledger:
[`full-corpus-completion.json`](./full-corpus-completion.json).

Mission: universal public discovery readiness for every legitimate canonical dossier, complete
dossier resolution (no silent knowledge gaps, no invented content), then the evidence-reading
semantic engine.

## Handoff and preservation

- Starting commit: `d00f27b00a95bfa25366096cc1fb960ba54f411f` (`origin/main` and local `main` agree).
- The main checkout at `ClaudeRepo/Claude Projects/RNAwiki` sits on `release-b2/medicine-dossier-v3`
  with an uncommitted, mid-flight Release B2 change set: 39 modified/deleted tracked files and six
  untracked files (`data/agents/public/`, `docs/worklogs/release-b2-medicine-dossier-v3.md`,
  `lib/contributions/medicine.ts`, `lib/dossier-module-registry.ts`,
  `scripts/agents/public-package.ts`, `scripts/check/agent-publication-privacy.ts`). That tree does
  not typecheck (`lib/dossier-module-registry.ts` imports a `lib/dossier-surface-v3` module that
  does not exist yet, and `tests/integration/programme-contributions.test.ts` fails against the
  changed proposal schema). None of it was staged, reverted, formatted or edited.
- This mission works in a separate git worktree of the same repository:
  `ClaudeRepo/Claude Projects/RNAwiki-corpus-completion` on branch
  `release-c1/full-corpus-completion`, created from the starting commit. The B2 privacy work
  (queue-free public agent aggregates) remains a B2 deliverable and is listed as a dependency for
  the eventual merge, not re-implemented here.
- Stashes preserved and untouched: `stash@{0}` (`WIP on main: d9f3e00 …`) and `stash@{1}`
  (`On main: preserve post-deployment jargon experiments …`).
- Hand-maintained seed batches 19, 20 and 27–30 are user-owned and are not edited or staged.

## Environment

- Local PostgreSQL 18.6 (Homebrew). `rnawiki_dev` is at migration 10 of 22 and `rnawiki_ui_check`
  at 17 of 22; neither is used. Per the recorded project rule, `rnawiki_dev` is never repaired.
- Working database `rnawiki_corpus_completion`: restored from the Release B1 production custom
  archive `/Users/admin/rnawiki-backups/release-b1-20260901.pRTNXH/rnawiki-pre-b1.pgcustom`
  (SHA-256 `2e4501b434d802bfcfba36294ee90f92bbba8441e8e15d430ad2b0637be60c8d`, matching the B1
  worklog) with the PostgreSQL 18 `pg_restore`, then migrated with `npm run db:migrate` from 20 to
  22 applied migrations. It is a copy of production as of 2026-09-01 01:31 local time.
- Local source archives at `/Users/admin/rnawiki-ingest-data`: openFDA Drugs@FDA, NDC, Orange
  Book, 14 label zips (hashes in `archive-hashes.txt`), the 1.6 GB `label-index.ndjson` (87,096
  labels with their read sections) and `label-presence.ndjson`.
- Production (Railway project `RNAwiki`): web service `RNAwiki`, worker `RNA Intelligence Source
  Sync`, `Postgres`; all `SUCCESS`. Production sets `INDEXNOW_ENABLED=true` with a key, and
  `SITE_URL=https://rnawiki.com`; the crawl guard passes through `RAILWAY_ENVIRONMENT_NAME`. No
  production write, deploy or variable change has been made by this mission.
- No local embedding model (no `ollama`, no `torch`, no `sentence_transformers`) and no `pgvector`
  extension are installed. The semantic phase records this as a constraint.

## Baseline (recomputed 2026-09-02, not taken from the prompt)

Source: the restored production copy above unless marked otherwise.

| Metric                                          | Value                                                   |
| ----------------------------------------------- | ------------------------------------------------------- |
| Raw inventory records (`drugs` rows)            | 9,859                                                   |
| Rows passing the public placeholder filter      | 9,857                                                   |
| Placeholder identities (`tbd`, `header`)        | 2                                                       |
| Unique canonical entities                       | pending the inventory resolver (provisional 9,852)      |
| Aliases (`drug_aliases`)                        | 27,859 (brand 24,216; salt_form 3,596; inn 47)          |
| Owner-curated redirects                         | 0                                                       |
| Unresolved identities                           | pending the resolver                                    |
| Exact source objects                            | 100 evidence sources; 100 source snapshots; 100 fetches |
| Exact source bindings / assertion checks        | 751 / 751                                               |
| Exact excerpts                                  | pending projection (3,093 rows hold a quotable excerpt) |
| Structured source pointers                      | 6,741 rows with registry identifiers                    |
| Approved medicines (FDA, accelerated, EMA)      | 3,141                                                   |
| Investigational (phase 2/3, pre-clinical)       | 391                                                     |
| Supplements (`Non-FDA / Dietary Supplement`)    | 6,149                                                   |
| Botanicals / organisms (biological identity)    | 2,999                                                   |
| Combination products (recorded composition)     | 35                                                      |
| Biologics (protein, mAb, peptide, RNA, gene)    | 849                                                     |
| Registry-only identities                        | pending the resolver                                    |
| Records with legacy trial rows                  | 6,515 (31,232 trial rows)                               |
| Records with posted trial results               | NOT_OBSERVABLE in the legacy shape; pending registry    |
| Recorded pivotal results                        | 18                                                      |
| Applicability records                           | 22                                                      |
| Programmes / current publications               | 0 / 0                                                   |
| Published evidence readings                     | 0                                                       |
| Reviewed programme conclusions                  | 0                                                       |
| Genuine review decisions                        | 0 (no verdict, contribution or agent-queue decisions)   |
| Indexable dossiers (live sitemap, 2026-09-02)   | 165                                                     |
| Sitemap dossiers (live)                         | 165 of 174 URLs                                         |
| Noindex dossiers (live policy)                  | 9,692                                                   |
| Robots-blocked dossiers                         | 0 (`/api/` and `/healthz` only)                         |
| Orphan dossiers                                 | pending the crawl audit                                 |
| Recorded-background envelopes                   | 9,855 (6,424 transcribed; 3,276 extracted; 155 curated) |
| Engine validation runs                          | 9,855                                                   |

Live checks on 2026-09-02: `/d/1000-mw` returns 200 with `noindex, follow`; `/d/inclisiran`
returns 200 with `index, follow`; `/r/{slug}` and `/c/{slug}` return 301 to `/d/{slug}`;
`/api/drugs/{slug}` returns 200; `/llms.txt` returns 200.

## Identity signals measured before resolution

- Five pairs share an identical name after removing every non-alphanumeric character
  (`coenzyme-q10`/`coenzyme-q-10`, `fructooligosaccharides`/`fructo-oligosaccharides`,
  `hydroxyethylcellulose`/`hydroxyethyl-cellulose`, `omega-3-acid-ethyl-esters`/
  `omega-3acid-ethyl-esters`, `risedronate-sodium-hemi-pentahydrate`/
  `risedronate-sodium-hemipentahydrate`).
- 552 UNII values and 108 PubChem CIDs are shared by more than one row. Inspection shows salt/parent
  pairs (`clopidogrel`/`clopidogrel-bisulfate`), biosimilar suffix families (`aflibercept`,
  `aflibercept-jbvf`, …), combination/ingredient leakage (`bempedoic-acid`/
  `bempedoic-acid-ezetimibe`) and name-matched registry errors (`peptide`/
  `helminthosporium-carbonum-toxin-i`). A shared identifier is therefore recorded as an attribution
  warning, never as merge evidence.
- 374 alias slugs coincide with another record's canonical slug; 2,062 alias slugs have more than
  one owner. The route resolver already prefers the direct slug and fails closed on ambiguity.

## Decisions

1. Identity merges use only exact deterministic evidence: identical name after punctuation
   removal. Salts, stereoisomers, metabolites, formulations, combinations, brands, botanical
   preparations, organisms, biologics, vaccines and RNA constructs are never merged automatically.
2. Discovery readiness is decoupled from strict dossier completeness. A canonical entity becomes
   indexable once it has a resolution record and a completion assessment whose every applicable
   section carries an explicit visible state. Objective 2 passes only when every section is
   terminal (no pending search, no failed parse, no unresolved attribution).
3. The reviewed-conclusion section is `NOT_APPLICABLE` with a stated justification when no
   development programme exists, because RNAWiki conclusions are programme-scoped. It becomes a
   human-review blocker only when a programme exists without a publication.
4. Trial-registry evidence uses a dated, hashed ClinicalTrials.gov snapshot (API v2, 601,158
   studies on 2026-09-01) and exact normalized intervention-name matching. Registration never
   becomes a result; unmatched name hits are counted, not attributed.

## Implementation record

Pending; each workstream is tracked in the JSON ledger.

## Verification record

Pending.
