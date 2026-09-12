# Dossier v4 — full production rollout

Repository `Compoundingzero/rnawiki`, worktree `Project RNAwiki/RNAwiki-biohacker-rebuild`,
branch `rebuild/biohacker-dossier`, pull request 19 (draft, base `revamp/2026-09`).
Starting commit `5a5c47e`.

Resume with `npx tsx scripts/dossier-v4/resume.ts`.

## Phase 0 — verified baseline, not taken from prior summaries

Every line below was re-measured in this session.

| Check | Result |
| --- | --- |
| Branch clean and pushed | yes, `5a5c47e` on origin |
| Reviewed claims in the rebuild database | 0 |
| Correction ledger rows | 16 (5 page, 5 registry match, 5 stored field, 1 synonym) |
| Creatine human-ceiling trial list | 119, down from 123 |
| Tribulus studies in registry rows | 0 |
| Tribulus studies in trial roles | 0 |
| Tribulus studies in stored field values | 0 |
| Tribulus synonym on the creatine record | 0 |
| Tribulus studies in graph nodes and edges | 0 |
| Tribulus aliases in search data | 0 |

The creatine and metformin first-read answers remain unbound. Semaglutide and inclisiran still bind.

## The scale this rollout actually faces

| Population | Count |
| --- | --- |
| Legacy medicine records | 9,859 |
| Corpus pages loaded in this local database | 1,698, tier 1 only |
| Legacy records with a corpus page locally | 1,307 |
| Legacy records with no corpus page locally | 8,552 |
| Corpus pages with no legacy record | 391 |
| Medicine URLs in the production sitemap | 636 |

The sitemap is the indexable subset, not the public surface. Sampled production slugs that appear in
no sitemap still answer 200, so the public medicine surface is close to the whole legacy table.

## The architectural blocker this rollout has to clear first

`loadDossierV3Inputs` begins with `loadCorpusDossier(slug)` and returns null when there is no
corpus page. v4 loads on top of it, so **v4 cannot currently render a record that has no corpus
page**, and the route forwards those to the previous React dossier instead.

Locally that is 8,552 of 9,859 records. Until v4 can render from a legacy record alone, "every
public medicine uses v4" is not reachable, and no amount of flag configuration changes that.

That is the first substantive piece of work in this rollout, not a later polish step.

## What this session built

**Substance type and availability, separated.** One recorded modality carried 6,445 of the 9,859
medicines and hid nutrients, supplements and plant preparations in one bucket, which is why every
non-prescription substance read as "over-the-counter medicine". Run over the whole table the new
classifier splits it into 3,982 plant preparations, 2,160 dietary supplements and 305 nutrients.
Availability is resolved separately and never implied by the type. Jurisdiction is never assumed.

**Universal rendering.** `lib/dossier-v4/legacy-shim.ts` builds a corpus-shaped record from a legacy
row, so the one pipeline serves all 10,250 public slugs instead of 1,698. No record falls back to
the previous design.

**Publication states.** One decision per page, in one file, from what the page assembled rather than
from a flag. Anything not reviewed opens with a banner saying what it is.

**Benefit-first opening.** A sentence now has to earn the opening position: stand alone, stay short,
name no amount, avoid undefined abbreviations, and describe a change rather than a journey into the
body. Creatine opens on what it is taken for, not on a dedicated transporter, and its hero limit is
the three-in-eight non-responder finding rather than an animal result about a different disease.

**Dynamic navigation.** The rail is built from the sections the page rendered. A sparse record shows
13 links, creatine 21. Sections whose emptiness is the point — safety, who was studied, which form,
what is unresolved, the receipts — stay in the rail exactly because they are empty.

**Corpus validation.** 10,250 pages built and checked, 0 critical issues.

## Errors this session caught in its own work

Worth recording, because each one would have shipped.

1. The corpus page's withdrawn flag marks 336 records whose approval status reads "FDA Approved".
   Reading it as a substance state labelled 336 approved medicines withdrawn.
2. I then read the suppressed flag as an RNAWiki display decision. It is not: it carries register
   classifications, and reading it my way told a reader that semaglutide's supply was not
   established.
3. A sparse page read "Sources last checked Processing failed." — a field-state label printing where
   a date belongs, on every unprocessed record.
4. My own corpus checker reported twelve pages that were correct: ten quoting boxed warnings, two
   using the word "null" in "a null result across 157 randomised patients".
5. The ledger rows written by the Tribulus prune put a stored field name into the change history, on
   the page that promises no internal keys.
