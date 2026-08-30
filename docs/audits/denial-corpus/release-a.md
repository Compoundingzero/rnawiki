# Release A — DEPLOYED 2026-08-30

> **Superseded.** This page recorded why the release was held. All three blockers were completed and
> the release deployed as `5faaa912` / deployment `0e395635-e062-4529-bd20-4925f753ec9f`. See
> `release-a-production.md` for what production actually holds. The original reasoning is kept below
> because the decision to hold was correct at the time.

## Original status: NOT SHIPPED, gate not met

The corpus is repaired and the repair is proved. The release is **not** deployed, because three of
the eight items this release defined for itself are not done, and deploying against an unmet gate is
the exact failure this whole exercise exists to prevent.

**Branch:** <https://github.com/Compoundingzero/rnawiki/tree/fix/denial-corpus-production>
**Head:** `008532f` · 20 commits · remote matches local · not merged into `main`.

## What changes for a reader

- A medicine page carries a floating control that is the section navigator, the coverage map and the
  feedback entry. Each row states whether that section holds recorded content, whether sources
  differ, or whether nothing is documented — computed per record, so a registry-only row does not
  offer twenty-one dead destinations.
- The first screen no longer prints a copied instruction as RNAWiki's own answer. Where it cannot
  safely speak, it now **quotes the source with attribution** instead of showing a dead sentence, and
  says plainly when it has nothing safe rather than showing an empty card.
- Where independent labels print numbers that cannot be compared without a body weight nobody stated,
  the page says so instead of calling it a disagreement.

## What data was repaired

|                                                  | Before |     After |
| ------------------------------------------------ | -----: | --------: |
| Values equal to their own dispersion             |     23 |     **0** |
| Records holding more than 12 interaction signals |      0 |   **466** |
| Largest interaction signal count                 |     12 |   **164** |
| Label-stated role denials recorded               |  1,724 | **7,261** |
| Consensus fields                                 |  1,626 |     1,670 |

Full accounting, with commands and hashes: `release-a-regeneration.md`.

## Why this is not deployed

Release A defined eight items. Five are done. Three are not:

| Item                                          | State                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| D — question-level `conflicting` and `stale`  | **not done**                                                                  |
| E — engine-finding persistence                | **verified absent.** The `engine_findings` table exists; nothing writes to it |
| G — `recordedBackground` in the public export | **not done**                                                                  |

Item G matters most for a deploy decision. The regenerated 33.5 MB corpus is the thing worth
publishing, and it is still absent from the only bulk artifact the project ships. Deploying now would
put the repaired data on the site while leaving the asset unreachable in bulk, and would leave the
licence-consistency check red — `data/manifest.json` still declares CC BY-SA 4.0 and is only fixed by
an export run.

Credentials are **not** the blocker. The Railway CLI is authenticated and the environment is
unambiguous: project `RNAwiki` `328c5ae7-2ccb-4d37-8524-ba7029daddae`, environment `production`
`d92fd6a6-1f4c-4065-bddf-86d05c1b9495`. The blocker is the gate.

## Why phosphorus TPSA was not guessed

The corpus holds exactly one phosphorus record, sitagliptin phosphate monohydrate, and it does not
reconcile: the module's nitrogen/oxygen sum already sits 16.28 Å² **above** PubChem's stored value
before any phosphorus contribution, so pricing phosphorus would widen the gap rather than close it.
One unreconcilable record cannot establish a number. Sulfur was priced because four environments were
each derived arithmetically from this corpus's own stored values and cross-checked on a second
record; phosphorus has no second record to check against.

## Why the old 2,005 candidates were not imported

They were computed against the pre-repair corpus, whose inputs have since moved substantially —
interaction signals from a capped 12 to a maximum of 164, role denials from 1,724 to 7,261. Importing
them would present stale occurrences as live questions and spend reviewer effort on values the
regeneration has already changed. They are preserved as a dated pre-repair snapshot at
`~/rnawiki-ingest-data/pre-repair-snapshot/`.

## Rollback

Nothing is merged and nothing is deployed, so there is nothing to roll back. Should the branch later
be merged and deployed:

```bash
# application
railway rollback --service RNAwiki          # or redeploy the previous release id from the dashboard

# generated corpus — the pre-repair files and their hashes
ls ~/rnawiki-ingest-data/pre-repair-snapshot/
git checkout 04da169 -- scripts/seed-data/background/extracted-background.generated.ts \
                        scripts/seed-data/background/source-consensus.generated.ts
DATABASE_URL=<production url> npm run apply:background

# migration 0017 is additive only: four new tables, two new enums, no ALTER on an existing column.
# Leaving it applied is safe; nothing outside the new tables reads them.
```

## Next

`docs/worklogs/denial-corpus-release-b-backlog.md`, in dependency order. The first three items close
the review loop whose substrate this release built.
