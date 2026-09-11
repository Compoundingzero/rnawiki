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

Before and after screenshots and page facts: `data/dossier-v4/benchmark/{before,after}/` at
1440x1200, 390x844 and 320x800 for the four gold slugs, both captured with the same script against
the same local build.

### A correction to the first measurement

The first Phase 0 capture reported five internal keys leaking into the v3 reader layer, including
the canonical key `K1:MU72812GK0`. **That was wrong, and the error was mine.** The capture excluded
`#evidence-receipts` as the technical layer, which is a v4 section id; on a v3 page the technical
layer is `#deep-evidence`, so v3's entire technical disclosure was counted as reader text. Those
keys are inside the labelled disclosure, where the project's copy rules allow them.

Two further measurement faults were found and fixed while capturing the after set:

- joining every text node with a space made a table row read as one 131-word sentence, and made
  `textContent` invent camelCase tokens such as `recordedHarms` out of two adjacent cells;
- the shared sentence splitter only breaks before a capital, so a list of lowercase registry terms
  read as one sentence of the paragraph above it.

The capture now collects text per leaf block, joins each block's own text nodes with spaces, drops
text hidden from the accessibility tree, and audits sentence length one block at a time. Both the
before and after sets were re-captured with it, so the table below compares like with like.

### The comparison, creatine-monohydrate

| Measure | Before (v3) | After (v4) |
| --- | --- | --- |
| Sections | 24 | 37 |
| Reader blocks | 436 | 1192 |
| Reader sentences over 30 words | 6 | 10 |
| Reader sentences over 20 words | 30 | 39 |
| Internal keys in the reader layer | 0 | 0 |
| Unscoped certainty words | 3 | 0 |
| Horizontal overflow at 320 px | none | none |
| axe violations from page markup | none | none |
| axe violations from the site footer | target-size | target-size |

The v4 page carries 2.7 times the reader content, so the over-30 count is lower as a proportion
(1.4% against 0.8%). The ten that remain are five distinct sentences of stored curated prose that
this rebuild may not rewrite: three mechanism details citing Harris and Volek, the recorded note on
which creatine forms are sold, and the Tribulus correction reason. They are listed under
medical_content_blockers in `data/dossier-v4/session-state.json` for a content reviewer.

First viewport before: a serif medicine name, a supervision line, a link list, then a two-column
grid of nine question cards whose first three visible answers are an identity sentence, an
unreviewed legacy use sentence, and "RNAWiki has not yet published a reviewed conclusion for this
use." A reader learns what the record lacks before learning what the substance does.

First viewport after: one quiet identity line, five purpose anchors, then a display sentence saying
what creatine does inside muscle, why people take it, the strongest recorded human result with its
origin label, and the limit that matters most — for creatine, that a promising survival gain in a
mouse model of amyotrophic lateral sclerosis did not appear in 175 patients.

### Component inventory

**Preserve and reuse.** `components/document/DocumentShell`, `lib/document/render`,
`lib/corpus/tokens.css`, `lib/dossier-v3/taxonomy.ts`, `claims.ts`, `copy-contract.ts`,
`stored-keys.ts`, `trial-roles.ts`, `goals.ts`, `load.ts` inputs, migration 0034, the corrections
ledger and the trial-role classifier. `buildDossierV4` calls `buildDossierV3` rather than
reimplementing it, so every safety rule v3 enforces is inherited.

**Demote.** The v3 reader surface stays reachable behind its own flag. `QuestionBlock`,
`ExactRecord`, `RelationsRows`, `HubRows`, `SourceList` and `RegistrationBlock` move into the v4
technical disclosure and out of the reader path.

**Retire from the primary path.** The v3 `DecisionCard` nine-field grid, the v3 `GoalLens`
fieldset, the v3 `Navigator`, and the `DeepEvidence` section wrapper. v4 replaces all four.

## Status at the end of this session

All six phases are done. The full `npm run gate` chain was run twice. The first run, at commit
`ebb4db1`, passed with exit code 0. The second, at the final commit, exited 1 on a single browser
test: `tests/e2e/legacy-identity-correction.spec.ts` failed with `apiRequestContext.post: read
ECONNRESET`. That spec does not touch dossier-v4, passes on its own, and the whole 66-test browser
suite passes on re-run, so it is a connection flake rather than a logic failure. Every other stage
passed in both runs.

| Check | Result |
| --- | --- |
| typecheck | passed |
| lint | 0 errors, 53 pre-existing style warnings |
| check:copy | 541 files, 0 hits |
| format | clean |
| drizzle-kit check | clean |
| unit | 2813 passed, 9 skipped, 187 files |
| integration | 185 passed, 28 files |
| build | passed |
| browser | 66 passed |

### What exists

`lib/dossier-v4/` — taxonomy, copy, concepts, outcome classifier, reader-text guard, view model,
loader, document, stylesheet. `components/dossier/v4/` — primitives, orientation, evidence,
personal, closing, page shell. `scripts/dossier-v4/` — capture and check-gate.
`app/d/[slug]/route.ts` checks `DOSSIER_V4_SLUGS` before `DOSSIER_V3_SLUGS`.

### The four gold pages

| Slug | Mode | Hero result origin | Sections with nothing found |
| --- | --- | --- | --- |
| creatine-monohydrate | self-experiment planner | written into the record | clashes |
| semaglutide | clinician questions | approved first-read answer | which form |
| metformin | clinician questions | written into the record | none |
| inclisiran | clinician questions | approved first-read answer | clashes, which form, alternatives, its story |

All four pass every gate. Inclisiran's concept primer opens on messenger RNA then small interfering
RNA, and its claim decoder states that no completed trial has measured whether it prevents heart
attacks or strokes. Metformin's states that the trial designed to test whether it slows ageing has
never enrolled anyone.

### Not done

- No reviewed claim exists for any medicine, so no page renders a reviewed conclusion.
- The community lane is built and switched off. Intake needs a licence and consent review.
- No model is trained. The identity gate on `graph_versions` stays closed by design.
- The site footer's touch targets fail at mobile widths, on every page including the home page.
  Out of scope here; the fix is one padding rule.
- Nothing is pushed, merged or deployed.

### Exact next command

```bash
cd "Project RNAwiki/RNAwiki-biohacker-rebuild"
npx tsx scripts/dossier-v4/check-gate.ts --slugs <slug>
PORT=3100 DOSSIER_V4_SLUGS=<slug> npm run start
```

### Rollback

Unset `DOSSIER_V4_SLUGS`. The next request serves v3; unset `DOSSIER_V3_SLUGS` too and every page is
the corpus document again. v4 adds no table, no column and no migration, so there is nothing to roll
back in the database.
