# Denial Corpus execution worklog

A resumable record of the remediation described in `docs/audits/denial-corpus/`. Another session
should be able to read this file and continue without guessing what was done or why.

## Starting state

| Fact                  | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| Starting branch       | `main`                                                            |
| Starting commit       | `8186a66ed97c1a78da56ba8aca9f0044d282f6eb`                        |
| Working branch        | `fix/denial-corpus-production`                                    |
| Working tree at start | dirty — 14 modified files, 0 untracked                            |
| Preserved patch       | `<scratchpad>/preserve/working-tree-8186a66.patch` (22,015 lines) |
| Stashes present       | `stash@{0}`, `stash@{1}` — **preserved, not touched**             |

Dirty files carried onto the branch (all from the 30 August audit session, all tested green before
the branch was cut — 1,674 unit tests passing, typecheck, lint and format clean, all 9,855 envelopes
validating):

```
M data/agents/enzyme-and-transporter-documentation.json
M docs/dataset-agents.md
M lib/agents/dataset/enzyme-documentation.ts
M lib/background/label-extraction.ts
M lib/background/printed-numbers.ts
M lib/dossier-read-serializer.ts
M lib/medicine-dossier-view-model.ts
M lib/public-medicine-language.ts
M lib/rna-intelligence/background-rules.ts
M tests/unit/agents/enzyme-documentation.test.ts
M tests/unit/dossier-read-serializer.test.ts
M tests/unit/label-extraction.test.ts
M tests/unit/printed-numbers.test.ts
M tests/unit/public-medicine-language.test.ts
```

**These are not to be reimplemented.** They already contain: the public-boundary repair (Phase 2),
the first-screen instruction-voice guard (part of Phase 3), the quantity-parser dispersion fix and
token-based numeric witness (part of Phase 6), and the enzyme-agent polarity split. They are
committed in reviewable units below rather than replaced.

## Safety rules honoured throughout

- No `git reset --hard`, no `git clean`, no history rewrite, no force-push.
- Stashes untouched.
- Working-tree patch saved outside the repository before the first edit.
- Seed data under `scripts/seed-data/` is never mass-rewritten; batches 19, 20 and 27–30 are
  user-owned and are not edited or staged.
- Public exposure is controlled at the serializer and projection boundaries, never by deleting
  stored source material.

## Known external blocker

**The openFDA bulk label archive is not present on this machine.** Phase 6C (regeneration of
`extracted-background.generated.ts` and `source-consensus.generated.ts`) and the record-level
curated-skip repair both depend on it. Everything that does not depend on the archive proceeds; the
archive-gated work is marked BLOCKED with the exact command to run, and Release A cannot deploy
until it completes. See the Phase 6 entry.

## Phase log

### Phase 0 — Reproducible baseline · DONE · `a3dfc08`

`npm run audit:denial-corpus` measures the corpus deterministically into
`data/audits/denial-corpus/{baseline.json,baseline.md,input-manifest.json}`. The measurements object
takes no clock, no random draw and no network result, so two runs on one tree are byte-identical.

Measured at `a3dfc08` (digest `94d7efd1…`):

| Fact                                     | Value                                             |
| ---------------------------------------- | ------------------------------------------------- |
| Records                                  | 9,855                                             |
| Tiers                                    | curated 155 · extracted 3,272 · transcribed 6,428 |
| Rows with any clinical module            | 3,029                                             |
| Rows with any pharmacology module        | 2,101                                             |
| Rows with no quotable sentence           | 6,766                                             |
| Role polarity                            | asserted 796 · negated 1,724 · not recorded 2,365 |
| Explicit non-establishment               | 1,361                                             |
| Consensus fields marked disjoint         | 234 (191 same unit · 43 spanning units)           |
| **Values equal to their own dispersion** | **23**                                            |
| Records at the interaction cap           | 200                                               |
| Licence declarations consistent          | **false** — CC-BY-4.0 vs CC-BY-SA-4.0             |

`docs/audits/denial-corpus/methodology.md` records the definitions that move a figure, including two
where this script disagrees with the 30 August audit (quotable-sentence definition; unit
comparability). Both disagreements are stated rather than reconciled by picking the flattering
number.

### Phase 2 — Public boundary · DONE · `f2c90fa`

`serializePublicDossier` spread the whole dossier and stripped only the laboratory workflow.
`substitutes.homeRemedies` (892 patient-action entries) and `conventionalRx[].prosAndCons` (1,441
named-treatment rankings) both reached the anonymous API across 489 records. `homeRemedies` reached
no page — the view model never projected it — so the endpoint was its only exit.

`howItCompares` is retained: it is overwhelmingly a recorded fact about one trial's own comparator
arm, which is a single-programme statement. Stored rows are unmodified; the boundary decides what
leaves. Five tests, including one asserting the stored dossier is never mutated.

### Phase 3 — First-screen voice · PARTIAL · `784b8fb`

629 of the 3,640 rows that render a real use line were label furniture or an instruction, plus 194
orphaned footnote markers. The guard is case-sensitive on the heading arm so a genuine FDA sunscreen
monograph indication survives; that control is a test.

**Not yet done:** the prompt's three-state model. The guard currently sends a refused line to the
existing "still needs a clear, short description" fallback rather than to
`RECORDED_LABEL_STATEMENT_REQUIRES_QUOTING`, which would show the source-linked recorded-use
sentence in quotation styling. That third state is available — `recordedUses` is present on 84% of
extracted records — and is the right next step. Tracked as the top remaining reader item.

### Phase 4 — Engine memory · DONE (persistence) · `b5dd376`

`lib/agents/core/identity.ts` gives a candidate two identities. `candidateKey` is stable while the
question is the same and deliberately excludes the prose, the counts and the agent patch version.
`occurrenceKey` changes when the value, a source, the parser or the corpus changes. 16 tests,
including two collision cases that caught real separator bugs during implementation.

Migration `0017_agent_review_memory` adds `agent_runs`, `agent_review_candidates`,
`agent_queue_decisions` and `engine_findings`. Purely additive — no ALTER on an existing column.
**Replayed from zero on a disposable database.**

Four decision outcomes, not two. `CONFIRMED_AS_RECORDED` is kept distinct from `NOT_A_PROBLEM`
because an extremeness screen has no other way to learn that a flagged value is extreme and correct.

**Not yet done:** the ingest of the existing 2,005 candidates through the new contract, and the
authenticated review-queue UI. The substrate exists; nothing writes to it yet.

### Phase 6 — Quantity parser · PARTIAL · `7613e7b`

Parser repaired: `QUANTITY_SPREAD` shared by all six quantity patterns, so `12 ± 5 hours` stores 12.
Numeric witness is by-value at all five call sites (was two of five). Digits fastened to an uppercase
name are no longer read as quantities; the rule keys on case because openFDA really prints
"approximately1 hour" with the space missing in the source.

**BLOCKED — the archive.** The 23 stored values equal to their own dispersion are unchanged, and
`source-consensus.generated.ts` carries the same readings amplified to 558 document-votes.
Regeneration needs the openFDA bulk label archive, which is not on this machine.

Exact command once the archive is present:

```bash
scripts/background/index-openfda-labels.py <archiveDir> <out.ndjson> <medicineRows.json>
npx tsx scripts/background/build-extracted-background.ts <out.ndjson>
npx tsx scripts/background/build-source-consensus.ts <out.ndjson>
npm run audit:denial-corpus   # measurementIntegrity.valuesEqualToOwnDispersion must reach 0
```

**Release A cannot deploy until that returns zero.** Deploying first would ship the defects to a
much larger audience, because the deploy also multiplies the visible corpus roughly sixtyfold.

### Phase 18 — Dossier navigator · DONE · `817d1ff`

Floating control that is the section navigator, the coverage map and the feedback entry. Every row
carries the section's coverage computed from the record, so a registry-only row does not offer
twenty-one empty destinations. `conflicting` gets a count on the closed button, which is the first
time a source disagreement is visible without scrolling into the module.

Emits only states it can determine: `stale` and `restricted` are in the type but not emitted,
because per-question freshness is dossier-level and restricted material never reaches the view model.

8 unit tests. 6 Playwright journeys written covering keyboard operation, Escape focus return,
disclosure opening on jump, feedback reachability and a 320px viewport.

**Verification note.** The Browser pane cannot exercise this interactively: the dev CSP blocks
`eval` in the Next.js dev runtime, so React never hydrates there (`reactAttached: false`, and the
account control stays on "Checking account…"). That is environmental and affects the whole app, not
this component. The server-rendered control is present and correct with `aria-expanded="false"`.
Interactive proof requires the Playwright run, which needs a production build.

---

## Remaining, in dependency order

1. Archive regeneration (Phase 6C) — gates Release A.
2. Ingest the 2,005 candidates and build the review-queue UI (Phase 4E/4F).
3. The third first-screen state (Phase 3).
4. Remove the alphabetical interaction cap and add the truncation census (Phase 7).
5. Unit-aware disagreement contract (Phase 8).
6. `conflicting` and `stale` in the question registry (Phase 10).
7. `recordedBackground` in the public export (Phase 15).
8. Datasets area (Phase 16), CTG posted results (Phase 17) — Release B.
