# Records whose page has nothing helpful on it

Measured 2026-09-18 against the local corpus (`rnawiki_indexing_audit_20260913`) and the live site.

## Two denominators, and why both are quoted

| Measure                                                              | Count  | Share of corpus  |
| -------------------------------------------------------------------- | ------ | ---------------- |
| Public medicine pages                                                | 10,250 | —                |
| No human results, no reviewed claims **and** no journey steps        | 3,737  | 36.5%            |
| Fails the repo's own stricter test: no opening sentence, explanation, human evidence or mechanism | 2,436 | 24.7% |
| Of those, still offered to a search engine                           | 0      | 0%               |

The first count comes from `data/dossier-v4/corpus-inventory.csv`, the second from
`scripts/dossier-v4/list-unavailable-records.ts`, which asks the page's own assessment
(`assessRecordSubstance` → `decideMedicinePageIndexing`) rather than a separate rule. They differ
because they ask different questions; the second is the one the page acts on, so the buckets below
are built from it.

**None of them is indexed.** `summary.stillIndexed` is 0. A search engine is not being fed these
pages; a reader who browses the site can still reach them.

## The four buckets, and the fix for each

| Bucket | Count | Share | What it actually is | The fix |
| --- | --- | --- | --- | --- |
| **A** | **1,682** | **69.0%** | Nothing published and nothing will be. A supplement or cosmetic ingredient the corpus classes as a medicine, so no regulator ever assessed it and there is no label, approval or trial to find. 1,526 are non-FDA/supplement. | **No fetch will ever help.** The fix is the page, not the data: stop presenting it as a dossier. Shipped — see below. |
| **B** | 389 | 16.0% | Acquisition gap. No label, approval, product listing or supplement record was found under *any* name the corpus holds. | A name-resolution pass, not another fetch under the same name. Data work. |
| **C** | 195 | 8.0% | Approved and no longer marketed, so no current label exists. All 195 are FDA-approved; the approval record is all that remains. | Pull the withdrawn label from the FDA archive rather than the live endpoint. Data work. |
| **D** | 170 | 7.0% | A label exists but carries no clinical text: homeopathic-style products whose label is ingredients and packaging. A sample of fifteen found twelve with no indication, purpose, description or pharmacology field at all. | Nothing to extract. Same presentation fix as A. |

So **1,852 of the 2,436 (76%) will never be fixed by better retrieval.** They are the end state, and
the only thing wrong with them was the page around them.

## What was shipped

Every record that holds nothing now renders a short page instead of a full dossier. What stays is
what a reader needs on a bare record: the identity strip, the notice naming what RNAWiki searched,
the hero — which carries the register facts the record *does* hold and the honest statement of what
was not found — the concept primer, safety, the source trail, and the audit layer. What goes is the
furniture: the purpose rail, the in-page navigator, and the sections that hold nothing.

Four things are not optional, and the first attempt at this change got it wrong twice before the
test suite settled it. `lib/dossier-v4/section-visibility.ts` names safety and the evidence receipts
as sections that print even when empty, because their emptiness is itself a decision-relevant fact.
`tests/e2e/public-inclisiran-journey.spec.ts` asserts `#substance-action`, `#concept-primer` and
`#evidence-receipts` on a medicine page. Dropping the hero, then the receipts, then the primer each
failed that suite in turn, and each was put back.

Measured on the same basis before (live) and after (in-process render, same instrument):

| | 1,2-Hexanediol before | after | Zingiberene before | after |
| --- | --- | --- | --- | --- |
| Sections in the page | 16 | **5** | 15 | **5** |
| In-page nav links | 21 | **0** | 20 | **0** |
| Purpose-rail chips | 5 | **0** | 5 | **0** |
| Reader-facing sentences | 131 | **52** | — | **54** |

That is a **60% cut** in what a beginner has to read on a page that has nothing to say, and the
twenty-item "On this page" list that advertised sections with nothing in them is gone.

What the page no longer does, all of which it used to:

- advertise sixteen sections, none of which had content;
- offer five purpose chips that all led to empty sections;
- print every section heading with its standing explanation of what the section is for, and an
  absence line under each;
- repeat the same absence at every one of those headings.

## What is still wrong, and is data rather than code

1. **Substance type.** `1-2-hexanediol` is a cosmetic preservative and the corpus classes it
   `prescription_medicine` with availability `prescription_only`. 2,261 of the empty records are
   botanicals and 502 are supplements; a slice of those are classed as medicines they are not. This
   is a corpus classification problem with no code fix, and it is the single largest remaining source
   of a misleading identity line. It also lets the page contradict itself: the strip says
   "Prescription medicine · Prescription only" while the hero, which stays, says no supervision or
   regulatory status is recorded.
2. **Availability `varies_by_jurisdiction` on 2,868 of the empty records.** True but useless to a
   reader who wants to know about their own country. Bucket B is where a real answer would come from.
3. **Buckets B and C are still empty pages.** They are honest now, but they are still pages with
   nothing on them until the name-resolution pass and the FDA-archive pull happen.

## How to reproduce

```bash
# The population and the buckets.
python3 - <<'PY'
import json, collections
d = json.load(open('data/dossier-v4/unavailable-records.json'))
print(d['summary']['empty'], 'empty of', d['summary']['assessed'])
PY

# Rebuild that classification from the database (writes unavailable-records.json).
npx tsx --tsconfig tsconfig.render-scripts.json scripts/dossier-v4/list-unavailable-records.ts

# What a reader now meets, and whether any machinery reached them.
npx tsx --tsconfig tsconfig.render-scripts.json \
  scripts/dossier-v4/verify-reader-layer.ts 1-2-hexanediol zingiberene creatine-monohydrate
```
