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

| Metric                                        | Value                                                   |
| --------------------------------------------- | ------------------------------------------------------- |
| Raw inventory records (`drugs` rows)          | 9,859                                                   |
| Rows passing the public placeholder filter    | 9,857                                                   |
| Placeholder identities (`tbd`, `header`)      | 2                                                       |
| Unique canonical entities                     | pending the inventory resolver (provisional 9,852)      |
| Aliases (`drug_aliases`)                      | 27,859 (brand 24,216; salt_form 3,596; inn 47)          |
| Owner-curated redirects                       | 0                                                       |
| Unresolved identities                         | pending the resolver                                    |
| Exact source objects                          | 100 evidence sources; 100 source snapshots; 100 fetches |
| Exact source bindings / assertion checks      | 751 / 751                                               |
| Exact excerpts                                | pending projection (3,093 rows hold a quotable excerpt) |
| Structured source pointers                    | 6,741 rows with registry identifiers                    |
| Approved medicines (FDA, accelerated, EMA)    | 3,141                                                   |
| Investigational (phase 2/3, pre-clinical)     | 391                                                     |
| Supplements (`Non-FDA / Dietary Supplement`)  | 6,149                                                   |
| Botanicals / organisms (biological identity)  | 2,999                                                   |
| Combination products (recorded composition)   | 35                                                      |
| Biologics (protein, mAb, peptide, RNA, gene)  | 849                                                     |
| Registry-only identities                      | pending the resolver                                    |
| Records with legacy trial rows                | 6,515 (31,232 trial rows)                               |
| Records with posted trial results             | NOT_OBSERVABLE in the legacy shape; pending registry    |
| Recorded pivotal results                      | 18                                                      |
| Applicability records                         | 22                                                      |
| Programmes / current publications             | 0 / 0                                                   |
| Published evidence readings                   | 0                                                       |
| Reviewed programme conclusions                | 0                                                       |
| Genuine review decisions                      | 0 (no verdict, contribution or agent-queue decisions)   |
| Indexable dossiers (live sitemap, 2026-09-02) | 165                                                     |
| Sitemap dossiers (live)                       | 165 of 174 URLs                                         |
| Noindex dossiers (live policy)                | 9,692                                                   |
| Robots-blocked dossiers                       | 0 (`/api/` and `/healthz` only)                         |
| Orphan dossiers                               | pending the crawl audit                                 |
| Recorded-background envelopes                 | 9,855 (6,424 transcribed; 3,276 extracted; 155 curated) |
| Engine validation runs                        | 9,855                                                   |

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

All work is on `release-c1/full-corpus-completion`. Implementation was fanned out to Opus agents
with disjoint file ownership; contracts, migrations, integration and verification stayed with the
main session.

### W1 Canonical inventory (done)

- `lib/inventory/` holds the `InventoryResolution` contract, the fixed entity-class rule table and
  the pure resolver. `scripts/inventory/resolve-inventory.ts` writes `data/inventory/*` and
  `--check` regenerates and compares; `scripts/inventory/apply-inventory.ts` writes
  `inventory_resolutions` and one `MERGED` ledger row per duplicate (idempotent; a second run writes
  nothing).
- Result over the restored production copy: 9,859 = 9,852 canonical + 5 duplicate redirects + 0
  historical redirects + 2 justified gone + 0 manual review. The five duplicates are punctuation-only
  name variants; both placeholders (`tbd`, `header`) now answer 410.
- Warnings recorded, never merged on: 5,389 shared registry identifiers, 373 alias slugs that
  spell another record's slug, 50 name-only identities, 2 rows without a background envelope.

### W2 Source registry and auditable searches (done)

- ClinicalTrials.gov: `scripts/dossier-completion/fetch-clinicaltrials-snapshot.ts` took one paged
  API v2 sweep (601,158 studies, data timestamp 2026-09-01T09:00:05, SHA-256
  `00b7ca207938fb44fc4d24fd14ce1f4c2cc2e2e718cd1a9fb5c5163ce5858e27`), and
  `match-trial-registry.ts` ran the exact-name pass for every canonical entity: 3,569 entities
  matched 224,946 registrations. Unmatched name hits are not attributed.
- PubMed: `run-pubmed-searches.ts` recorded one exact-phrase clinical-trial-type search per
  canonical entity (9,852 succeeded, 0 unreachable); `import-pubmed-searches.ts` stored them.
- Local label archive: `build-label-sections-index.ts` reduced 87,141 labels to their declared
  substances and read sections (80,443 with prose), so "section absent" and "section read, nothing
  extracted" are distinguishable from "never read".
- Curated gap: the 155 hand-curated envelopes had never been passed through the label extractor.
  `scripts/background/build-curated-gap-extraction.ts` ran the same extractor over them and wrote
  `data/registries/curated-gap-extraction.json`; 145 records gained modules (population statements
  139, mechanism 134, safety 132, recorded uses 128, molecular identity 115, interaction signals
  66, adverse reactions 50, pharmacokinetics 14). A curated module always wins; every attached value
  is marked `extracted`. Ten supplements without FDA label prose gained nothing. Side effect,
  recorded for the owner: 50 curated rows no longer show `nameFamily`, because a formula from the
  row's own label now identifies them.

### W3 Evidence-reading architecture and migrations (done)

- Migration `0022_full_corpus_completion`: `inventory_resolutions`, `dossier_completion_assessments`
  (status agrees with counts by check constraint), `source_search_records` (unique per record,
  search kind and search space), `dossier_completion_review_decisions` (append-only trigger).
- `lib/dossier-completion/types.ts` defines 20 sections, the ten terminal states and six visible
  non-terminal states; `resolve.ts` is the pure resolver; `view.ts` carries reader labels.
- The stored assessment and identity resolution travel on `DrugDossier` and
  `MedicineDossierViewModel`, so the page, `/api/drugs/{slug}` and the exporter read one object.

### W4 Dossier completion and rendering (done)

- `scripts/dossier-completion/run-completion.ts` assessed all 9,852 canonical records; `--check`
  re-derives every assessment and reports 0 changed. `content_changed_at` moves only when the input
  digest moves.
- Final state: 9,852 COMPLETE, 0 INCOMPLETE; 6,494 records carry a suggested human read (a label
  section exists whose deterministic extraction found no qualifying statement, or posted registry
  results that have not been transcribed). Section states across the corpus: 12,218 exact
  source-backed, 57,542 exact structured, 8 source-stated not established, 93,286 searched with no
  qualifying record, 1,138 results not posted, 32,848 not applicable. Every reviewed-conclusion
  section is `NOT_APPLICABLE` because no development programme exists.
- `components/dossier/DossierCompletionAssessment.tsx` renders every section's state, basis,
  counts and safe source links inside the evidence disclosure, with raw codes in a labelled
  technical disclosure; the navigator lists it. No other record is ever named or linked.

### W5 Discovery (done in code; production submission pending owner go-ahead)

- Third indexability path `indexable_canonical_record`; sitemap merges publication, legacy and
  canonical reports one per medicine (9,852 indexable of 9,857 public rows; 5 redirect sources
  excluded), cached in-process for 15 minutes. Placeholder slugs answer 410 from middleware.
- Canonical records emit a claim-free JSON-LD graph with `dateModified` from the assessment;
  metadata descriptions are unique per record and quote only class, counts and search outcome.
- `scripts/discovery/submit-indexnow.ts` (dry run by default), `monitor-discovery.ts` (resumable;
  classifies only `DISCOVERY_READY`, never crawled or indexed) and the `--orphan-audit` mode of
  `scripts/quality/audit-public-search.ts` exist with tests. `llms.txt` and
  `docs/seo-indexing-policy.md` describe the state vocabulary.

### W6 Review workflows (done)

- `/review-queue/completion` (steward or admin, noindex) lists incomplete records, suggested human
  reads and identity warnings; `POST /api/completion-review` records an append-only decision bound to
  the exact assessment digest; stale digests are refused. A decision never changes public content.

### W7 Semantic engine (done; no vector index by rule)

- Migration `0023_semantic_reading_units`: `evidence_reading_units` (unit id is the SHA-256 of the
  exact content; kinds RECORDED_VALUE, RECORDED_STATEMENT, POPULATION_STATEMENT,
  ADVERSE_REACTION_LIST, CONSENSUS_READING, SEARCH_RESULT, SECTION_STATE; assertions ASSERTED,
  NEGATED, ABSENT; GIN index over a generated tsvector) and the append-only
  `result_debugger_corrections` table.
- `scripts/semantic/project-units.ts` projected 273,110 units for the 9,852 canonical records;
  `--check` reports 0 changed on a re-run. Absences are units too: every terminal absence state
  becomes an ABSENT unit carrying the assessment's basis sentence, and a source-stated
  "not established" becomes NEGATED.
- Lexical baseline (PostgreSQL full-text search at unit level) with deterministic scope gates
  (exact entity match, population and formulation words, refusal of two-medicine or ambiguous
  queries) and retrieval-free absence and boundary lookups. Template-generated benchmark of 1,943
  queries over a 2,000-unit pool, seed 20260902: gated recall@5 0.933 lexical against 0.956 for a
  local dense model (`Xenova/bge-small-en-v1.5`, CPU). The pass rule for a pgvector shadow index
  (dense ahead by at least 5 points) was not met, and `vector` is not installed locally, so no
  vector migration exists. `docs/semantic-engine.md` records both reasons and the commands.
- `POST /api/result-debugger` records genuine steward corrections only; the table holds 0 rows and
  nothing synthetic was inserted.

### W8 Testing and release verification

- Unit suite: 2,230 passing after the corpus change (two corpus-pinned agent tests were updated to
  the new half-life spread and to a corpus-independent leader assertion).
- Full gate, disposable-database integration tests, production build and browser journeys are
  recorded in the verification record below when run.

## Decisions recorded for the owner

- Duplicate records redirect rather than merge module data; the canonical record's assessment
  credits modules recorded on the merged duplicate and says where they live.
- Every canonical record indexes once assessed, including records whose sections are mostly
  "searched; no qualifying record found". The page says what was searched and where.
- The curated-gap attachment runs before the name-family fallback; move it after the
  `NAME_FAMILY` loop in `scripts/seed-data/background/index.ts` to restore `nameFamily` on the 50
  affected curated rows.
- `/review-queue/completion` and `/review-queue/search-indexing` are reachable by URL only; neither
  is linked from `/review-queue`. Linking them is a one-line owner decision.

## Verification record

`npm run gate` on `dde8bfc` (2026-09-02, local, disposable databases created and dropped):

| Step                                            | Result                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- |
| typecheck, lint, check:copy                     | pass (0 copy hits across 348 public/docs files)            |
| check:medicine-content                          | pass, 9,855 envelopes, 0 findings                          |
| audit:denial-corpus, agents:check, import:check | pass against the regenerated 2026-09-02 agent package      |
| check:agent-datasets, four-audience, consensus  | pass                                                       |
| check:dataset-export                            | pass, 25 files, 9,857 records, largest file 64.6 MB        |
| check:seo                                       | pass, 24 files, 265 tests                                  |
| format, drizzle-kit check                       | pass                                                       |
| test:unit                                       | pass, 163 files, 2,238 tests                               |
| test:integration                                | pass, 26 files, 167 tests                                  |
| build                                           | pass                                                       |
| test:e2e                                        | 26 of 27 passed; the identity dataset page overflowed by   |
|                                                 | 2 px at 320 px (a 64-character digest); fixed with a       |
|                                                 | break-anywhere rule for unbroken tokens and re-run (below) |

Browser checks against the working database on 2026-09-02: `/d/metformin` renders "How complete
this record is" with 159 items, no link to any other record and a closed technical disclosure; no
horizontal overflow at 375 px or 320 px; `/d/tbd` answers 410 with `noindex`; `/d/coenzyme-q-10`
redirects permanently to `/d/coenzyme-q10`; `/sitemap.xml` lists 9,852 dossiers and 9,863 URLs
with no redirect or gone slug; `/api/drugs/metformin` carries the same completion assessment and
identity resolution as the page; `/d/abalone` carries a unique description and a JSON-LD
`dateModified`.

The corpus publication chain ran end to end: export, snapshot commit `c895392`, `agents:run`
(2026-09-02), manifest attachment, and every check.

## Release and resume commands

Nothing has been written to production. The exact sequence, in order:

```bash
# 1. Merge or deploy the branch; Railway applies migrations 0022 and 0023 in preDeployCommand.
# 2. Against production (from inside Railway, or with PGSSLROOTCERT pinned), in this order:
npm run apply:background          # attaches the curated-gap modules (validated, only recorded_background)
npm run inventory:apply           # writes inventory_resolutions and the 5 MERGED ledger rows
npm run completion:match-trials   # needs the local snapshot; or copy source_search_records from the working copy
npm run completion:pubmed:import  # same
npm run completion:run            # assesses all canonical records; --check must then report 0 changed
npm run semantic:project          # optional: projects evidence-reading units
# 3. Discovery, once the deployment serves the new sitemap:
npx tsx scripts/discovery/submit-indexnow.ts             # dry run: counts only
npx tsx scripts/discovery/submit-indexnow.ts --submit --json
npx tsx scripts/discovery/monitor-discovery.ts --origin https://rnawiki.com --resume
npm run audit:search -- --origin https://rnawiki.com --orphan-audit --max-urls 12000
```

The registry snapshot and PubMed records live on this machine under
`/Users/admin/rnawiki-ingest-data`; the simplest production path for `source_search_records` is
`pg_dump --table=source_search_records` from `rnawiki_corpus_completion` restored into production,
because the rows are content-addressed and idempotent.

Discovery states: every canonical dossier is `DISCOVERY_READY` in code. `SUBMITTED_FOR_DISCOVERY`,
`CRAWLED_OBSERVED`, `INDEXED_OBSERVED` and `CITED_OR_RETRIEVED_OBSERVED` are `NOT_OBSERVABLE` until
the deployment, the IndexNow submission and a Search Console reading exist.
