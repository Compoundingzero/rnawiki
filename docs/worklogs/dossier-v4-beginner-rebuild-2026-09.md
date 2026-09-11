# Dossier v4 — the Substance Compass. Worklog and resume brief

Branch `rebuild/biohacker-dossier`, worktree `Project RNAwiki/RNAwiki-biohacker-rebuild`,
private database `rnawiki_rebuild`. Base commit `ee6a9e9`. Nothing here is pushed or deployed.

## What this rebuild is

Dossier v3 reorganised the corpus record into eleven reader questions. It is still a column of
question cards fed by the pipeline. Dossier v4 replaces the reader surface with a guided sequence —
the Substance Compass — that leads a person with no biology education from *what is this* to *what
happened in people* to *what that does not prove*, and keeps five truth lanes apart:

1. **Body action** — what the substance changes biologically.
2. **Human result** — what happened in people.
3. **Personal reality** — what may be felt, measured or practically burdensome.
4. **Uncertainty** — what is missing, conflicting or not transferable.
5. **Community experience** — consented RNAWiki reports, never mixed with the science.

v3 is not deleted. v4 is a second flag (`DOSSIER_V4_SLUGS`) checked before the v3 flag, and the
whole v3 surface remains reachable by unsetting it.

## The content position this rebuild starts from (measured, 2026-09-11)

```
reviewed_claims        0 rows
dossier_field_states   0 rows
entity_corrections    11 rows  (6 creatine/Tribulus, 5 heading relabels)
```

There is no reviewed claim for any medicine in this database. Therefore **no v4 section may present
a reviewed conclusion.** Every reader-facing sentence on a v4 page comes from exactly one of:

- a stored source row, quoted or counted, labelled with its source and date;
- a deterministic classification of stored rows, labelled with its classifier version;
- a fixed contract sentence owned by `lib/dossier-v4/copy.ts`;
- an explicit absence state.

That constraint is the design, not a limitation to be worked around. The page is honest about a
corpus that has registered studies and mechanism abstracts but no reviewed human conclusions.

## Session protocol

On resume: read this file, then `data/dossier-v4/session-state.json`, then
`git log --oneline -15`. Announce the phase being resumed. Never restart a completed phase.

## Phases

- **Phase 0** — recovery, baseline, before screenshots, component inventory.
- **Phase 1** — v4 contracts: taxonomy, view model, completion states, concepts, copy.
- **Phase 2** — visual system and page shell.
- **Phase 3** — creatine vertical slice.
- **Phase 4** — semaglutide, metformin, inclisiran modes.
- **Phase 5** — tests, accessibility, screenshots, build.
- **Phase 6** — final checkpoint.

## Status

Phase 0 in progress. See `data/dossier-v4/session-state.json` for the machine-readable state and
the exact next command.

## Phase 0 — baseline measured (2026-09-11)

Before screenshots and page facts: `data/dossier-v4/benchmark/before/` at 1440x1200, 390x844 and
320x800 for the four gold slugs, served by the v3 flag from the local build.

What the baseline shows for `creatine-monohydrate`:

| Measure | v3 baseline |
| --- | --- |
| Headings on the page | 62 |
| Sections | 24 |
| Reader sentences over 30 words | 37 of 291 |
| Internal keys leaking into the reader layer | 5 |
| axe violations at 390 px | 1 (target-size, 2 nodes) |
| axe violations at 320 px | 1 (target-size, 3 nodes) |
| Horizontal overflow at 320 px | none |

Two of those are defects v4 has to fix, not just design around. The canonical identity key
`K1:MU72812GK0` and the stored field name `compound_record` both reach reader text today, which is
the "internal database keys must never render publicly" rule failing in production code. Touch
targets under 24 px fail at both mobile widths.

First viewport today: a serif medicine name, a supervision line, a link list, then a two-column
grid of nine question cards whose first three visible answers are an identity sentence, an
unreviewed legacy use sentence, and "RNAWiki has not yet published a reviewed conclusion for this
use." A reader learns what the record lacks before learning what the substance does.

### Component inventory

**Preserve and reuse.** `components/document/DocumentShell`, `lib/document/render`,
`lib/corpus/tokens.css`, `lib/dossier-v3/taxonomy.ts`, `claims.ts`, `copy-contract.ts`,
`stored-keys.ts`, `trial-roles.ts`, `goals.ts`, `load.ts` inputs, migration 0034, the corrections
ledger and the trial-role classifier. The v4 view model reads the same inputs.

**Demote.** The v3 reader surface stays reachable behind its own flag but is no longer the newest
surface. `QuestionBlock`, `ExactRecord`, `RelationsRows`, `HubRows`, `SourceList` and
`RegistrationBlock` move into the v4 technical disclosure and out of the reader path.

**Retire from the primary path.** The v3 `DecisionCard` nine-field grid, the v3 `GoalLens`
fieldset, the v3 `Navigator`, and the `DeepEvidence` section wrapper. v4 replaces all four.
