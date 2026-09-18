# Making a medicine page more valuable to a beginner

Measured 2026-09-18 against the local corpus and the live site. Every number here was recomputed;
the commands are at the foot.

## Start with what is already good, because it should not be rewritten

The house bar is under 20 words per sentence, hard fail over 30
(`docs/dossier-v4-plain-language-contract.md`). Measured on the live creatine page, reader-facing
text only:

| Measure                        | Value |
| ------------------------------ | ----- |
| Sentences a reader meets       | 692   |
| Mean words per sentence        | 8.5   |
| Median / p90 / max             | 7 / 15 / **29** |
| Sentences over 20 words        | 23 (3.3%) |
| Sentences over 30 words        | **0** |

So the "a five-year-old can follow a sentence" job is **already done**. The page is written in short
plain sentences and the hero does the hard part well — *"a small rechargeable battery"* for
phosphocreatine is exactly the register a beginner needs. Rewriting these sentences would be churn
against a target already met.

The page is also structurally complete: 6,513 of the 10,250 pages carry at least one human result,
and a rich page answers what it does, whether it fits your goal, who was studied, what the limit is,
what form to buy, what goes wrong, what it clashes with, what to measure and what people report.

**A useful structural fact: there is no middle.** A page either has at least one human result
(6,513) or it has nothing at all (3,737). Zero pages sit in between. That is what makes the two
leaks below separable.

## Where beginner value actually leaks

### 1. Machinery reached the reader — fixed

Three strings written for the pipeline were rendering in the reader layer, on live pages:

| String a reader met | Where it came from | Pages |
| --- | --- | --- |
| "§ A fixed RNAWiki sentence" | `ORIGIN_SHORT.contract_sentence` / `ORIGIN_LABELS.contract_sentence`, rendered by `OriginNote` under every statement | the pages with no reviewed conclusion |
| "slug and display name present" | `canonical_metadata_valid` gate detail, rendered in the reader-visible "Checks this page had to pass" list | every page |
| "Canonical metadata present" | the same gate's label | every page |

The page carries a gate called **"No internal keys in reader text"** that is supposed to prevent
exactly this, so the gate and the page disagreed. Fixed at source: the labels now read "RNAWiki
wording" / "RNAWiki's own standing wording", "The name and the stored record agree", and "the page
name and the stored identity match". Verified after the change: machinery in the reader layer is
`none` on all four pages tested.

### 2. A record with nothing was dressed as a dossier — fixed

See `docs/revamp/thin-page-remediation.md`. 2,436 pages now render 5 sections instead of 16, no nav,
no chips, and **131 → 52 reader-facing sentences**.

### 3. 1,301 pages still do it, one notch less badly — **the largest remaining problem**

A page with no human evidence but some mechanism or recorded use is not "empty", so it still renders
the full dossier. Measured in process:

| Page | Sections | Nav links | Chips | Reader sentences |
| --- | --- | --- | --- | --- |
| `2-butoxyethyl-laurate` | 16 | 20 | 5 | **280** |
| `3-hydroxy-1-methylguanine` | 16 | 20 | 5 | **279** |

**1,301 pages are in this state.** A beginner meets roughly 280 sentences on a page that has no
study to report, because the sections render their scaffolding and the navigator advertises them.
This is the same defect the short page fixed, and it is the single highest-value thing left.

The fix is *not* to reuse the short page: these records have a real mechanism explanation and a real
recorded use, and deleting those would lose information a reader came for. The fix is to keep the
hero and safety and stop printing the sections that have nothing — which means extending
`lib/dossier-v4/section-visibility.ts` from "hide the absent states" to "hide a section whose
entries carry nothing specific to this substance". That is a change to what a thin record asserts, so
it belongs with the publication gates and needs a corpus re-validation, not a quick edit.

### 4. One visible string repeats 9–10 times per page

Measured most-repeated visible line, rich and thin pages alike: **"Where this came from"**, 9–10
copies. It is the provenance disclosure summary under each statement, so each copy is doing a job —
but a reader meets the same six words ten times. Worth shortening to one word ("Sources") or
numbering them.

### 5. The identity line can assert something the record does not support

`1-2-hexanediol` is a cosmetic preservative; the strip said **"Prescription medicine · Prescription
only"** while the body said supervision had never been recorded. 2,261 of the empty records are
botanicals and 502 are supplements, so a slice of them are classed as medicines they are not. There
is no code fix: the classification is data. It is the largest remaining source of a *misleading*
identity line, which is worse than a missing one.

### 6. One beginner question the page never answers: cost

A biohacker deciding what to try wants to know what it costs. Nothing on any page carries a price,
and `PracticalReality` covers what taking it involves but not what it costs. This is a data gap, not
a copy problem, and it should be sourced like any other fact if it is added.

## Ranked, with the measurement behind each

| # | Change | Pages | Evidence | Effort |
| --- | --- | --- | --- | --- |
| 1 | Stop printing sections that hold nothing specific to the substance | **1,301** | 280 reader sentences measured on two of them | Medium — changes what a thin record asserts; needs corpus re-validation |
| 2 | Fix substance-type classification for cosmetic/supplement records | part of 2,261 botanical + 502 supplement | `1-2-hexanediol` says "Prescription medicine" | Data work |
| 3 | Shorten the repeated provenance label | all | 9–10 copies per page | Small |
| 4 | Add cost, sourced | all, where a source exists | no price anywhere | Data work |
| 5 | Extend the short page to bucket D of the remediation note | 170 | homeopathic labels hold no clinical text | Small once #1 is decided |

## What I deliberately did not recommend

- **A "how much should I take" block.** `docs/privacy-and-medical-safety-boundaries.md` says the page
  never generates individualised prescription dosing, and that dose text appears only inside the
  deep-evidence layer exactly as the label recorded it. Adding a dose block would break a deliberate
  safety boundary, not improve the page.
- **Stripping the collapsed disclosures.** They hold the provenance a sceptical reader opened the
  page for, and the fold is the design. Measured earlier: 24 `<details>` render and none is open.
- **Rewording the shared sentences once per drug.** That is filler with extra steps and it defeats
  the measurement rather than the problem.
- **Flattening the goal-by-goal matrix.** Its repeated "nothing in the sources checked" cells are the
  information: they say which goals have no registered measure. That is structure, not slop.

## How to reproduce

```bash
# Reader-facing volume, structure and machinery leaks for any page.
npx tsx --tsconfig tsconfig.render-scripts.json \
  scripts/dossier-v4/verify-reader-layer.ts creatine-monohydrate 2-butoxyethyl-laurate 1-2-hexanediol

# Words per sentence and the longest sentences, reader text only.
#   strip the body of every closed <details>, cut at id="technical-record", then split on punctuation.

# The populations quoted above.
#   data/dossier-v4/corpus-inventory.csv                    10,250 pages, per-page counts
#   data/dossier-v4/unavailable-records.json                 the repo's own empty-record classification
```
