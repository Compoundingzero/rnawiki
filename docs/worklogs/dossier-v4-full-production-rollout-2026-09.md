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
