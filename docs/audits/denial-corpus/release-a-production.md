# Release A — deployed and verified in production

Deployed **2026-08-30T17:05:36Z**, deployment `0e395635-e062-4529-bd20-4925f753ec9f`, status SUCCESS.
Verified by inspecting production directly rather than by trusting Railway's report.

|                                    |                                                                 |
| ---------------------------------- | --------------------------------------------------------------- |
| Starting SHA                       | `d65a3d5`                                                       |
| Final branch SHA                   | `b6835e6`                                                       |
| **Merged main SHA**                | **`5faaa912efb0f91256eceedbc696759aa3c7ce8b`**                  |
| Project / environment / service    | RNAwiki `328c5ae7` / production `d92fd6a6` / RNAwiki `ddd37771` |
| Previous release (rollback target) | `e49912b3-6d0d-4ad8-9365-c525f296ce03` (2026-08-28)             |
| Migrations applied                 | `0017_agent_review_memory`, `0018_engine_validation_runs`       |

## Backup

Taken before any production write, from the authoritative database.

|              |                                                                      |
| ------------ | -------------------------------------------------------------------- |
| Format       | `pg_dump` custom, PostgreSQL 18.6                                    |
| Size         | 11 MB                                                                |
| SHA-256      | `b913e2ad2a9a4a3d7f260168ba84c746469b73ed76f864541355e731480b9136`   |
| Location     | `~/rnawiki-ingest-data/backups/` (outside the repository)            |
| **Verified** | `pg_restore --list` reads it: 632 TOC entries, 54 TABLE DATA entries |

The first attempt produced a 0-byte file because the local `pg_dump` was 16.15 against a 18.6
server. An empty file whose hash is the empty-string hash is not a backup, so it was taken again
with the matching client and verified by listing its contents.

## Production, before and after

| Measure                           |       Before |     After |
| --------------------------------- | -----------: | --------: |
| Drug rows                         |        9,859 |     9,859 |
| **Rows with recorded background** |      **155** | **9,855** |
| Migrations applied                |           17 |        19 |
| Engine validation runs            | table absent | **9,855** |
| — passed                          |            — |     9,855 |
| — applied                         |            — |     9,855 |
| Engine findings                   | table absent |         0 |

`recorded_background` went from the 155 curated records to 9,855 — the extracted and transcribed
tiers reached a reader for the first time. Production was serving 1.6% of the corpus it holds.

Re-derived from production, matching the release manifest exactly:

| Measure                          |                                          Production |
| -------------------------------- | --------------------------------------------------: |
| Tiers                            |   transcribed 6,424 · extracted 3,276 · curated 155 |
| Comparison states                |        agree 1,427 · differ 231 · not_comparable 12 |
| Largest interaction signal count |                                                 164 |
| Records above the old cap of 12  |                                                 466 |
| Role polarity                    | negated 7,261 · asserted 4,439 · not recorded 7,824 |

## The dress rehearsal predicted it exactly

Before deploying, the production dump was restored into a disposable database and the exact
`preDeployCommand` was run against it. It reported 9,855 envelopes applied, 0 slugs missing, 9,855
runs persisted, 0 findings. Production then produced the same numbers.

## Reader surfaces, checked live

| Check                      | Result                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repaired dispersion record | `abiraterone` half-life reads **`12 ± 5 hours`, numeric 12** (was `5 hours`); volume of distribution `19,669 ± 13,358 L`, numeric 19669 (was `13,358 L`) — both with their excerpts |
| Corpus reaching the page   | `/d/propranolol` renders **101 background rows** (previously 3)                                                                                                                     |
| Conflicting state          | "Sources differ" present on `/d/propranolol` and `/d/abiraterone`                                                                                                                   |
| Floating navigator         | Present, with `aria-expanded` and the amber conflict badge. Served in HTML as `Sections &amp; feedback`                                                                             |
| Orphaned footnote marker   | `/d/alpine-strawberry` reads "Used for hives." — the asterisk pointing at a cut disclaimer is gone                                                                                  |
| `NO_SAFE_USE_STATEMENT`    | `/d/abiraterone` renders the explicit sentence rather than an empty card                                                                                                            |
| `SAFE_PLAIN_USE`           | `/d/oxymetazoline` renders a neutral use line                                                                                                                                       |

## Public boundary, checked live

`oxymetazoline` stores 3 `homeRemedies` and 3 `conventionalRx` in the database. The anonymous API
returns:

- `homeRemedies`: **0**
- `prosAndCons`: **absent from every alternative**
- `howItCompares`: **3 retained**, which are the programme-scoped comparator facts
- no `clinicalPrecaution`, no `reagentsAndBuffer`

Stored data is unchanged; the boundary decides what leaves.

## Question issues

| Measure                              |             Value |
| ------------------------------------ | ----------------: |
| `differ` fields                      |               231 |
| Reachable from a question            |           **231** |
| Unreachable                          |             **0** |
| Unmapped consensus fields            |             **0** |
| `not_comparable` shown as a conflict |             **0** |
| Records carrying a question conflict |               173 |
| Stale questions                      | **0** — see below |

Stale is fully implemented and emits nothing, because `verify:background` computes drift at run time
and does not write it into the envelope. A stale state that cannot be traced to the source a
question depends on must never be emitted, so the count is zero rather than inferred from the
dossier-wide freshness flag.

## Tests

1,787 unit tests across 130 files · 13 export integration tests · 8 engine-persistence integration
tests · migration replay from zero **and** against a database restored from production.

## The one thing not finished

**The committed export artifacts in `data/` were not regenerated from production.**

The export _code_ is deployed and proven — `recorded-background.ndjson` and
`source-consensus.ndjson` are emitted with schema versions, per-file licences, limitation notes and
verified hashes, and 13 integration tests cover inclusion, exclusion and reproducibility.

What could not run is the exporter _against production from this machine_. `db/ssl.ts` requires a
verified server certificate and states there is no bypass; Railway's public proxy presents a
self-signed chain, so the connection is refused. That is the project's own rule working as intended.
The `preDeployCommand` succeeds because it runs inside Railway's network against the private host.

Consequence: `data/manifest.json` still declares CC BY-SA 4.0 and the audit's licence line stays red
until an export runs. Every source of truth the exporter reads from already says CC BY 4.0.

Exact next command, from inside the Railway environment or the scheduled export job:

```bash
npm run export:dataset   # writes data/, including recorded-background.ndjson, and regenerates the manifest
```

## Rollback

Not needed; recorded for completeness.

```bash
railway redeploy --service RNAwiki   # or redeploy e49912b3-6d0d-4ad8-9365-c525f296ce03
/opt/homebrew/Cellar/postgresql@18/18.6/bin/pg_restore \
  --dbname "$DATABASE_PUBLIC_URL" --clean --no-owner --no-acl \
  ~/rnawiki-ingest-data/backups/rnawiki-production-*.dump
```

Migrations 0017 and 0018 are additive — four tables, two enums, one nullable column, no `ALTER` on an
existing column — so leaving them applied after an application rollback is safe. Nothing outside the
new tables reads them.
