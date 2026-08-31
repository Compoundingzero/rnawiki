The robots can now point to a suspicious medicine fact, show the exact sentence they read, and remember what a person decided.

# Release B1 — evidence workbench and public dataset readers

Release B1 puts the repaired corpus behind one deterministic review loop and four source-first public
dataset readers. The release is deployed and directly production-verified. It does not let a
detector, score, reviewer decision, or freshness check rewrite a medicine fact. Production contains
**zero genuine agent-review decisions**, so calibration is inactive and the queue says that there is
not enough review history to calibrate a reason.

## Release identity

| Fact                              | Verified value                                       |
| --------------------------------- | ---------------------------------------------------- |
| Starting `origin/main`            | `911a2d76fa8de531cff3eb9a31fbe5d01a73cacf`           |
| Final branch / tested release SHA | `5f9c59a4752561850ac125401d3e09794616b8a0`           |
| Immutable published corpus SHA    | `91a275f3bd1d3e72b25a3e6593c2e89a2c65cc98`           |
| Merged and published `main` SHA   | `6e234c6cea25c2337b202cb2dfb52988ee01772f`           |
| Production migrations             | 22, through `0021_source_binding_revisions`          |
| Release status                    | Complete, deployed, and directly production-verified |

The implementation branch was merged by focused, non-rewritten commits. The release includes a
portable representation for derived transcendental numbers in the numeric agent and a stable
slug-and-field order for source-consensus publication. Neither changes a medical value, candidate
identity, histogram count, or median-based summary.

## Backup and database rehearsal

Before the first production write, PostgreSQL 18.6 produced the custom-format archive
`~/rnawiki-backups/release-b1-20260901.pRTNXH/rnawiki-pre-b1.pgcustom`. It is 20,642,251 bytes,
has SHA-256 `2e4501b434d802bfcfba36294ee90f92bbba8441e8e15d430ad2b0637be60c8d`,
and `pg_restore --list` reads all 717 TOC entries.

All 22 migrations ran twice from an empty PostgreSQL 18 database; the second pass was a no-op. The
same custom archive was then restored with its 20 applied migrations and 9,859 medicine rows.
Migrations 0020 and 0021 applied, and a second pass was again a no-op. The rehearsal then:

- applied the exact 734-row `sourceConsensus` transition once and changed zero rows on replay;
- proved that every medicine field outside `recorded_background.sourceConsensus` retained its
  digest;
- imported 3,123 current occurrences and ten current-run pointers, then changed nothing on a second
  import;
- created zero review decisions and activated no historical pre-repair item; and
- removed every task-created rehearsal database afterward.

The production transition produced the same 734 guarded changes. Its idempotent replay reported 734
already-current rows and zero updates. The medicine row count stayed 9,859 and the protected-field
digest stayed unchanged.

## Historical evidence is not current work

The immutable package at
[`data/audits/agents/pre-release-a/manifest.json`](../../data/audits/agents/pre-release-a/manifest.json)
describes ten pre-Release-A runs over 9,855 records, dated 2026-08-30, with **2,005 legacy unkeyed
candidates**. It points to 52,276,208 original output bytes by immutable Git commit, blob id, byte
count, and SHA-256 instead of duplicating them.

Those rows have `historical_pre_repair=true` and `eligible_for_active_review=false`. They were not
imported into production. Their individual removed, new, source-changed, or value-changed identities
cannot be reconstructed honestly because the old format did not store semantic field paths,
candidate keys, occurrence keys, value digests, source-snapshot digests, or reason-schema versions.

## Current deterministic runs

All ten registered agents ran over the repaired 9,855-envelope corpus with date `2026-08-31` and seed
`20260828`. The current manifest binds them to immutable published corpus commit
`91a275f3bd1d3e72b25a3e6593c2e89a2c65cc98`; the corpus digest remains
`559289a2a3413d7371833ad7ff365c761098a80924196f86617610fd1a2732cf`. The runner executed the
suite twice before writing; `npm run agents:check` independently reproduced the checked-in bytes.
The current package contains **3,123 conceptual candidates** and **42,607 agent-specific finding
rows**. A finding row is structural output, not a confirmed defect.

| Agent                            | Historical candidates | Current candidates |
| -------------------------------- | --------------------: | -----------------: |
| Silence ledger                   |                    40 |                 40 |
| Mechanism text grouping          |                     5 |                  5 |
| Peer-group anomaly screen        |                   119 |                119 |
| Enzyme/transporter documentation |                   114 |                144 |
| Substance synonyms               |                 1,196 |              1,199 |
| Evidence density                 |                    40 |              1,122 |
| Numeric distributions            |                     0 |                  0 |
| Adverse-reaction term structure  |                   395 |                398 |
| Excerpt integrity                |                     0 |                  0 |
| Coverage ledger                  |                    96 |                 96 |
| **Total**                        |             **2,005** |          **3,123** |

Current candidates by reason are 59 `ATTRIBUTION_SUSPECT`, 1,746 `COVERAGE_GAP`, 1,199
`POSSIBLE_DUPLICATE_SUBSTANCE`, and 119 `UNUSUAL_FOR_PEER_GROUP`. Silence deliberately samples 40
of 147,981 eligible questions, and coverage deliberately samples 96 of 9,700 eligible records; both
declare their selection rule and retain a compact index of every eligible item. Every other
candidate-producing agent retains its complete eligible set.

## Production review memory

The active package imported idempotently into the existing migration-0017 memory tables:

| Measure                                      | Production |
| -------------------------------------------- | ---------: |
| Total agent-run rows                         |         27 |
| Current run pointers                         |         11 |
| — current package                            |         10 |
| — source-drift monitor                       |          1 |
| Conceptual occurrences                       |      3,123 |
| All run memberships                          |      6,246 |
| Current package memberships                  |      3,123 |
| Reopened occurrences                         |          0 |
| Genuine review decisions                     |      **0** |
| Correction drafts created by B1 verification |          0 |

All 3,123 current occurrences are `unchanged` because the current agent input bytes did not change;
publication updated only their immutable corpus-commit provenance. The release deployment imported
zero new occurrences, 3,123 new run memberships, changed ten current pointers, and invented zero
decisions. A manual replay of the final published package was then an exact no-op: ten runs, 3,123
candidates, zero new occurrences, zero new memberships, zero changed pointers, and zero invented
decisions.

Audience lanes remain ordinary 1,258, biotech 547, chemist 1,199, and quantitative 119. Severity is
low 1,127, medium 738, high 1,258, and blocking 0. Provenance is curated 41, extracted 2,461, and
transcribed 621.

The private workbench is `/review-queue/agents`. Direct anonymous production checks returned 404 for
the page and 401 for its API; no public review-queue dataset exists. Authorization tests prove that
ordinary accounts are denied while stewards and administrators are allowed, with reviewer identity
derived by the server. The four append-only outcomes are exactly:

- `CORRECTION_NEEDED`
- `NOT_A_PROBLEM`
- `CONFIRMED_AS_RECORDED`
- `NEEDS_MORE_EVIDENCE`

Tests cover every outcome, evidence-snapshot locking, rejection of a stale browser decision,
append-only history, and separation of a correction draft from medicine content. No fake production
decision was inserted to demonstrate the feature. A signed live steward session was not available
from the release environment, so the direct production access check is anonymous and the signed role
matrix is covered by the release's authorization tests.

At zero real decisions, empirical calibration is correctly inactive. The activation floor is 30
real decisions in one exact agent/version/reason-schema/reason/provenance stratum, with at least five
events in each of at least two outcome classes, plus a separately reviewed deterministic fitter and
time-split evaluation. Even then, learned values may reorder work or suppress an unchanged reviewed
occurrence; they may not change medicine or source content, freshness, disagreement, publication, or
a scientific conclusion.

## Neurode boundary

A neurode is implemented as a typed, versioned, independently testable deterministic detector or
transformation node. The graph rejects duplicate ids, missing or ambiguous dependencies, cycles,
incomplete cache identities, and unexpected zero input. It supports partial runs, preserves ordering,
records manifests, and closes resources. All ten current agents declare their input and output
schemas, dependencies, source requirements, candidate reasons, consumer, limitations, and medical
boundary.

No shipped ingestion, detector, freshness, copy, candidate, decision, projection, or publication
path invokes an LLM. No neurode produces treatment advice, a safety or efficacy verdict, a dose, an
interaction recommendation, a source winner, or a medical rewrite.

## Public datasets

The public index at `/datasets` links four read-only, source-first readers:

| Page                                     |    Rows | Meaning boundary                                                              |
| ---------------------------------------- | ------: | ----------------------------------------------------------------------------- |
| `/datasets/enzyme-transporter-negatives` |   8,024 | Recorded asserted, denied, and not-recorded roles; not an interaction checker |
| `/datasets/source-consensus`             |   1,681 | Every reading and comparison reason; never a winning source                   |
| `/datasets/silence-ledger`               | 167,535 | Explicit non-establishment remains distinct from silence and no source read   |
| `/datasets/coverage-ledger`              |   9,855 | Observable evidence coverage and explicit gaps by medicine                    |

Each page supplies purpose, non-meaning, methodology, schema, coverage, generated date, limitations,
CC BY 4.0 licence, download/API controls, source examples, correction routing, search, and filters.
The readers expose no patient-action substitute, named-treatment pros and cons, laboratory workflow,
private review data, or unpublished verdict. Direct production inspection of the source-consensus
reader found the expected 1,681 rows, source excerpts, FDA links, query and CSV endpoints, and no
restricted tokens. At a 320-pixel viewport it had no horizontal overflow. The browser suite also
focused each of the four index links and verified keyboard reachability.

The 1,681 comparison fields contain 1,282 `agree`, 0 `differ`, 12 `not_comparable`, and 387
`insufficient_context` states, covering 2,214 printed readings and 49,134 complete source records.
The current parser does not structurally extract enough population and formulation context to call
distinct otherwise-comparable readings disagreements, so they remain `insufficient_context` rather
than being promoted to `differ`.

## Four projections over one record

The ordinary, biotech, chemist, and quantitative views project the same canonical evidence record.
They can change order, grouping, and disclosure depth, but not a claim, measurement, limitation,
excerpt, or source binding.

### Ordinary reader

Measured source-bound eligibility across 9,855 recorded-background records is:

| Question                                        |                 Eligible records |
| ----------------------------------------------- | -------------------------------: |
| What is this used or studied for?               |                            2,751 |
| What happened to people?                        |                               18 |
| How large was the result?                       |                               18 |
| What important harm or limitation was recorded? |                            1,510 |
| Who might this not apply to?                    |                               22 |
| What is unknown, conflicting, or stale?         | 0 observable lower-bound records |

Exact stale bindings are not exported in the checked-in public snapshot, so the last figure is a
lower bound and must not be described as a measured zero for stale evidence. The all-six count is
nonetheless an exact zero because no record satisfies the first five rules.

### Specialist coverage

- Biotech: 2,751 records have source-bound use, 1,632 mechanism, 18 pivotal results, and 22
  applicability; zero records contain all four.
- Chemistry: 4,307 of 9,855 records have at least one represented formula, weight, structure,
  sequence, or source-bound molecular identity, **43.7%** of the corpus. Absence or ambiguity remains
  visible and B1 performs no stereochemistry repair.
- Quantitative: 15 of 22 pivotal results across 14 of 18 records retain printed uncertainty,
  **68.2%** of pivotal results. Observed and derived values, units, assumptions, and comparison state
  remain distinct.
- Source-read boundary: 3,093 records have a qualifying source excerpt and 6,762 do not. All 9,855
  have a qualifying source object, so `no qualifying source recorded` is zero. A source object
  without an excerpt is provenance, not a clinical source read.

## Source Sync

Railway deployment `60dda7bc-2b1c-4365-bd02-4d1e74ee9029` is the private **RNA Intelligence Source
Sync** service built from worker release SHA `411b2116e5c9d8502f3a91dc5447345db09fc468`. It reached
`SUCCESS`, runs `node --import tsx scripts/source-sync-worker.ts`, applies migrations before a run,
has no public domain, and retains the bounded six-hour schedule `0 */6 * * *`.

The manually triggered production execution ran from `2026-08-31T22:30:44.238Z` through
`2026-08-31T22:31:18.013Z`. It selected and processed 25 source identities, completed **25 of 25
fetches**, classified 57 exact assertions as `CURRENT`, classified **0** as `DRIFTED`, and emitted
**0 source-drift candidates**. A temporary network failure would have remained a fetch outcome rather
than drift. This execution therefore created no review claim and rewrote no medical value.

After that run and the final publication, production retained 967 exact bindings, 150 fetches, 150
snapshots, 947 `CURRENT` checks, 20 `NUMBERS_CURRENT` checks, and zero confirmed drift. The safe
medicine digest remained `505d868da82942a2408c609e2954b8e5`; when `sourceConsensus` is excluded,
it remained `d57353af9d5c17602a2c22d31bfcf01f`.

## Production-backed dataset publication

The first final publication attempt, GitHub Actions run
[33446806501](https://github.com/Compoundingzero/rnawiki/actions/runs/33446806501), stopped before
push. Exactly 614 of the 1,681 source-consensus row positions differed even though all 1,681 payloads
were present identically in both outputs. The gate treated positional instability as a
reproducibility failure. The fix sorts source consensus by slug and field and adds a regression test;
it does not change any row payload.

The retry, GitHub Actions run
[33449182747](https://github.com/Compoundingzero/rnawiki/actions/runs/33449182747), passed in 13
minutes 59 seconds. It published the immutable production corpus at
`91a275f3bd1d3e72b25a3e6593c2e89a2c65cc98`, derived the evidence datasets in
`6e234c6cea25c2337b202cb2dfb52988ee01772f`, and left that derived commit as merged `main`.

## Gates and deployments

The complete local gate passed on final tested SHA
`5f9c59a4752561850ac125401d3e09794616b8a0`:

- typecheck and production build;
- lint, with only the two pre-existing warnings in ignored `scripts/tmp/measure-issues.ts`;
- phrase- and path-aware copy scan: 0 findings across 323 public/docs files, 39 imported seed files,
  and 10 public-data files;
- all 9,855 recorded-background envelopes and the 734-row transition contract;
- 14 of 14 dataset artifacts, 9,857 public medicine rows, and CC BY 4.0;
- denial-corpus audit digest
  `8cb0fc7b5b6ff6c2e14bce99c741fb21a73e106ad3be9ef8ae702b8d1b929d06`;
- 2,021 unit tests across 149 files;
- 146 integration tests across 23 files;
- 190 SEO tests across 20 files; and
- 26 of 26 browser tests.

GitHub CI run [33448460086](https://github.com/Compoundingzero/rnawiki/actions/runs/33448460086)
passed against that exact SHA. The final numeric artifact also reproduced byte-for-byte under Node 20
and Node 26.

The live release deployment is `2db6952a-8e08-4875-a8bb-3dce9dbe8f1a`, status `SUCCESS`, exact
commit `6e234c6cea25c2337b202cb2dfb52988ee01772f`, duration 16 seconds, image
`sha256:928e884036d809226c74a8f46a0ad583360569a375c9efb2e4b15d64e20398f6`. Its pre-deploy
ran migrations, the name index, and the agent importer. Direct production requests returned 200 for
`/healthz` and all four dataset APIs. The workbench page remained 404 anonymously, its private API
remained 401, and the nonexistent public review-queue dataset remained 404. The source-consensus page
still showed all 1,681 rows with the verified comparison counts, source excerpts, and source links.

## Rollback and remaining limits

The pre-B1 web deployment is `df550e60-054d-4fea-b77a-4d6fc4d236d7`; the pre-B1 Source Sync
deployment is `c729e9b9-1a9a-436e-a9a3-fb00f845544e`. Migrations 0020 and 0021 are additive and
append-only. An application rollback can leave them in place. A database rollback must first stop the
scheduled Source Sync service, preserve current audit rows, and restore the verified custom archive
with PostgreSQL 18; it must never delete selected rows to simulate rollback.

Known limits are explicit:

- zero genuine production decisions means calibration is inactive;
- legacy candidate-by-candidate continuity is not exactly measurable;
- a signed production steward session was unavailable for a direct live decision, so the release
  correctly relied on automated signed-role tests and did not manufacture a reviewer event;
- public exact-stale coverage is not observable in the checked-in snapshot;
- structured population/formulation context is incomplete, leaving 387 comparison fields as
  `insufficient_context`;
- no record answers all six ordinary-reader questions, and specialist coverage remains sparse; and
- ClinicalTrials.gov posted results, chemistry identity expansion, and interactive evidence visuals
  remain B2, B3, and B4 respectively and were not started.

Both pre-existing Git stashes, the preserved openFDA archive, and its hashes remained untouched.
The verified backup remains outside the repository, and every B1-created local rehearsal database
was removed.
