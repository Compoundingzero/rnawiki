# Dossier v4 — publication states

Every public medicine gets a compass page. What changes between them is not the design but how much
the page is allowed to assert. `lib/dossier-v4/publication-state.ts` is the single source of that
decision, and it is deliberately not spread through components: a rule in five places is a rule that
will disagree with itself.

No record falls back to the previous design. The worst case is a compass page that is honest about
holding almost nothing.

## The five states

| State              | What it means                                                  | May show a conclusion | Indexable | Banner |
| ------------------ | -------------------------------------------------------------- | --------------------- | --------- | ------ |
| `reviewed`         | A person signed off a conclusion against the evidence          | yes                   | yes       | no     |
| `preliminary`      | Source-linked wording exists, nobody signed it off             | yes, always labelled  | no        | yes    |
| `limited`          | The record loads and holds nothing that can carry a conclusion | no                    | no        | yes    |
| `correction_hold`  | Identity is in doubt                                           | no                    | no        | yes    |
| `pipeline_failure` | A step broke on our side                                       | no                    | no        | yes    |

The order is evaluated worst first. A failure outranks a doubt, a doubt outranks a conclusion, and a
conclusion has to be signed off to count as one.

## Measured across the corpus

Run over all 10,250 public slugs in the local database:

| State            | Pages |
| ---------------- | ----- |
| preliminary      | 6,896 |
| limited          | 3,351 |
| correction hold  | 1     |
| pipeline failure | 0     |
| no record at all | 2     |

There is no reviewed page, because `reviewed_claims` is empty for every medicine. That is the honest
state of the corpus, not a defect in the rollout.

## How a record moves up

A record reaches `preliminary` when it has source-linked wording: an approved first-read answer, a
recorded explanation, a written-up study, or a body path. It reaches `reviewed` when a person signs
off a conclusion through the review workflow. Nothing else promotes a page, and no flag does.

## Indexing

Only `reviewed` is indexable. The corpus validation asserts the inverse directly: a page in any
other state that reports itself indexable is a critical failure. A record with no corpus page is
never indexable whatever else it holds, because it has not passed the identity and source gates that
decide indexing.

## Where the state is visible

- In the view model, as `model.publication`.
- On the rendered page, as `data-publication-state` on the root element and a banner above the fold.
- In `data/dossier-v4/corpus-validation.json` and the per-state slug lists beside it.
- In the corpus summary at `data/dossier-v4/corpus-validation-summary.md`.
