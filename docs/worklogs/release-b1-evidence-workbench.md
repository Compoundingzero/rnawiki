# Release B1 evidence workbench worklog

**Started:** 2026-08-31  
**Status:** in progress — production deployment is blocked until every B1 gate passes

## Starting state

| Fact                                           | Verified value                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Starting `origin/main`                         | `911a2d76fa8de531cff3eb9a31fbe5d01a73cacf`                                                           |
| Working branch                                 | `release-b1/evidence-workbench`                                                                      |
| Initial worktree                               | clean; local and remote divergence `0 0`                                                             |
| Database migration level in the tree           | `0019_recorded_background_freshness`                                                                 |
| Web deployment                                 | `df550e60-054d-4fea-b77a-4d6fc4d236d7`, `SUCCESS`, commit `911a2d76fa8de531cff3eb9a31fbe5d01a73cacf` |
| Source Sync deployment                         | `c729e9b9-1a9a-436e-a9a3-fb00f845544e`, `SUCCESS`, six-hour private schedule                         |
| Latest successful dataset publication at start | GitHub Actions run `33383491462`                                                                     |
| Latest successful CI at start                  | GitHub Actions run `33386993624`                                                                     |
| Existing stashes                               | two; preserved and not touched                                                                       |
| Historical pre-repair queue                    | 2,005 generated candidates; audit-only, never eligible for active import                             |
| Current checked-in agent outputs               | ten files, all dated 2026-08-30, also totalling 2,005 candidates and still pre-repair                |

The three short A.1 object names `39a9b99`, `e2cbfa3`, and `2b729e3` named by the handoff are not
reachable Git objects after the final merge. The reachable, documented implementation commits are
`a1a6624` (durable freshness), `d1df72d` (copy repairs and unified gate), and `642e26b` (bounded
worker). This worklog records the discrepancy instead of inventing missing history.

## Protected continuity evidence

- `stash@{0}`: `WIP on main: d9f3e00 Write down the rule the rate-limit incidents produced`
- `stash@{1}`: `On main: preserve post-deployment jargon experiments before morning rollback 2026-08-24`
- Preserved openFDA archive and hashes remain outside the repository.
- Preserved pre-repair snapshot remains at `/Users/admin/rnawiki-ingest-data/pre-repair-snapshot/`.
- No RNAWiki source-sync, publication, enrichment, test, or migration process was running at start.
- Dormant Claude-era watcher shells were read-only and were not terminated or reused.

## Starting agent output hashes

| Agent output                                | SHA-256                                                            | Queue |
| ------------------------------------------- | ------------------------------------------------------------------ | ----: |
| `adverse-reaction-term-structure.json`      | `601257b9fb9a4305acdce549f056f45445dd25f5a214f96c68a66b2a9179a709` |   395 |
| `coverage-ledger.json`                      | `bead47d9b6edb3adf5f40aecc21c25d2e702b216135f5ddbbda7fc61039c5ee9` |    96 |
| `enzyme-and-transporter-documentation.json` | `0a19553a5e5dc5057b14ba4a8b84e7f595026d9dac56da10a9f6d944f8fdd59c` |   114 |
| `evidence-density.json`                     | `7722c1d27997beff72aebfc1acca038adc29534a619c32ed71444ec3c97d9d38` |    40 |
| `excerpt-integrity.json`                    | `a9a026e8341e940bcec8d339602f90c72081af3745a92df7662700327c0407ec` |     0 |
| `mechanism-text-grouping.json`              | `d22b98985369b85c09a874e981cb546304df16246b1739f4dbf969e04f9db5d4` |     5 |
| `numeric-distributions.json`                | `2edc57da95ccc8d368079979c76e71154d12a680873810596fa575d516b1945c` |     0 |
| `peer-group-anomaly-screen.json`            | `914d20aca71dc272d17c76955a0465d05ae164dc87ab2b3fd19e7885c6e1947b` |   119 |
| `silence-ledger.json`                       | `8e3cea736866e25b1f63283691e4609ea7fed60a67a0cdb7320b76788f10cba1` |    40 |
| `substance-synonyms.json`                   | `862903a7c50a426efabd2ae00d954985fa6a90a98b15b43029fdcd94541b9df4` | 1,196 |

The original pre-repair package outside Git records the same enzyme-agent hash plus immutable
hashes for the pre-repair corpus, consensus, and audit baseline. Release B1 will preserve this
history under `data/audits/agents/pre-release-a/` by reference and hash; it will not activate it.

## Commands and decisions

- Refreshed `origin` before branching; handoff commit remained current.
- Read Release A/A.1 worklogs, required commits, agent contract, migrations 0017–0019, release
  backlog, public export boundaries, source-freshness design, and current service evidence before
  editing.
- Chose the prompt's two-stage shape within one branch: B1A review loop first, B1B public readers
  and audience projections second. Neither stage may deploy independently unless its complete gate
  and production-safety checks pass.
- Runtime LLM use, automatic medical writing, source selection, verdicts, corrections, and medicine
  mutation remain forbidden. Human decisions may affect queue presentation only.

## Untouched baseline

Run after `npm ci` against starting commit `911a2d76fa8de531cff3eb9a31fbe5d01a73cacf` plus this
worklog only:

- `npm run typecheck`: passed.
- `npm run lint`: passed with two pre-existing warnings in `scripts/tmp/measure-issues.ts`.
- `npm run check:copy`: passed; 0 findings across 296 public/docs files, 39 imported seed files,
  and 10 public-data files.
- `npm run check:dataset-export`: passed; 13/13 files, 9,857 medicine rows, CC BY 4.0.
- `npm run audit:denial-corpus`: passed; digest
  `9bec36d3648101055f39948cc7586e5a65bcca6ddddb39affc8bd4a367d42cf3` and 9,855 records.
- `npm run gate`: passed after formatting this newly created worklog: 1,876 unit tests, 128
  integration tests, production build, and 21 Playwright tests. Both disposable databases were
  dropped.

The first gate invocation stopped at Prettier because the just-created worklog was unformatted. No
product test failed. The worklog was formatted and the complete gate then passed.

## B1 implementation measurements

- Preserved the pre-repair history as a 10-run immutable reference package at
  `data/audits/agents/pre-release-a/`: 9,855 records, 2,005 unkeyed candidates, 52,276,208 referenced
  output bytes, and `eligible_for_active_review=false`.
- Ran all ten registered agents over the repaired 9,855-envelope corpus using run date `2026-08-31`
  and seed `20260828`. The corpus digest is
  `559289a2a3413d7371833ad7ff365c761098a80924196f86617610fd1a2732cf`.
- The runner executed the suite twice before writing. `npm run agents:check` then independently
  regenerated and byte-compared all eleven JSON files; it passed.
- The initial post-repair diagnostic produced 2,230 queue rows. The semantic-identity gate found
  189 duplicate enzyme/transporter source readings of an already represented conceptual question.
  Those are now 189 aggregated source readings, not 189 discarded facts. A subsequent
  queue-completeness audit removed an evidence-density presentation cap; the active package has
  3,123 conceptual candidates and 42,607 agent-specific finding rows.
- Current candidate counts: silence 40, mechanism 5, peer anomaly 119, enzyme/transporter 144,
  synonym identity 1,199, evidence density 1,122, numeric distributions 0, adverse-reaction structure
  398, excerpt integrity 0, and coverage 96.
- Silence ledger explicitly samples 40 of 147,981 eligible questions and coverage ledger samples 96
  of 9,700 eligible records. Both store the selection rule, deterministic seed, available count and
  complete compact candidate index. Every other candidate-producing agent is complete.
- Candidate identity now uses agent, reason-schema version, subject, semantic field path and reason.
  Occurrence identity adds the exact candidate-local observation, every canonical source reading,
  and a separately declared evidence-identity version. The package-wide corpus digest, run version,
  score and wording remain run context and do not reopen unrelated or wording-only occurrences.
- `npm run agents:import:check` validated all ten current artifacts, manifest hashes, 3,123
  candidate contracts, allowlisted paths, and active eligibility without opening a database.
- Migration 0020 plus the focused disposable-database import rehearsal passed: first import inserted
  the run/occurrence/membership/current pointer; an exact second import inserted and changed zero;
  score-only movement created a new run membership but no occurrence; source and value changes each
  reopened as a new occurrence; a missing medicine subject refused activation; zero decisions were
  invented; the medicine row did not change. The disposable database was dropped.
- The neurode framework's focused suite passed 18 tests, covering duplicate ids, missing and
  ambiguous dependencies, cycles, partial plans, complete-digest-only caching, unexpected zero
  input, deterministic manifests, resource cleanup, and the existing dataset-agent adapter.
- The audience-lens and conflict/stale rendering suite passed 64 tests. All four lenses navigate the
  same canonical record, sparse fallbacks remain reachable, and conflict/stale badges no longer
  suppress exact answers or source bindings.
- Created the required PostgreSQL 18 custom-format production backup outside the repository at
  `release-b1-20260901.pRTNXH/rnawiki-pre-b1.pgcustom`: 20,642,251 bytes, 717 archive TOC entries,
  PostgreSQL dump/archive version 18.6, SHA-256
  `2e4501b434d802bfcfba36294ee90f92bbba8441e8e15d430ad2b0637be60c8d`. `pg_restore --list`
  passed. Two superseded plain-text transfer attempts were deleted; only the validated custom
  archive remains.
- Restored the custom archive into an explicitly named local disposable database. Its starting
  state was 20 applied migrations (through 0019), 9,859 medicine rows and zero agent decisions.
  Migration 0020 applied successfully in that earlier rehearsal. Migration 0021 was added later and
  remains subject to the final 0020+0021 restored-backup replay. A separate representative upgrade
  test proved that
  migration 0020 rejects a legacy explanation-less decision without fabricating text, and succeeds
  only after explicit reviewer-authored remediation; that test database was dropped.

## Measurements still to record

- Current production agent-run, candidate, occurrence and real decision counts before and after
  activation.
- Public dataset reader row counts and the final six-question audience coverage report.
- Final current-package import replay against the restored custom backup, full gate, CI,
  deployment, rollback evidence and direct production verification.
