### Phase 4 — fix round 9, the three data rules of §19

`docs/specs/phase4-generators.md` §19 items 1–3, from the lead's reading of slop draw 14, and item
4's mechanical checks. Two of the three are data-level and one is a rendering cap; none is a
sentence, and no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/openfda_label_map.py          # shards deleted first
.venv-corpus/bin/python scripts/revamp/openfda_label_finalise.py
MODEL_OUT_DIR=data/revamp/tiers MODEL_OUT_FILE=data/revamp/tiers/model-assignment-v3.ndjson \
    RECUT_AGE_RELATED_ONLY=1 .venv-corpus/bin/python scripts/corpus-20k/tiers/assign-models.py
.venv-corpus/bin/python scripts/revamp/integrate_sources.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/interactions_build.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/validate_interactions.py
.venv-corpus/bin/python scripts/revamp/synonym_filter.py
.venv-corpus/bin/python scripts/revamp/controlled_suppression.py --fields-dir data/revamp/fields-v2 \
    --assignments data/corpus-20k/suppression/assignments.ndjson \
    --models data/revamp/tiers/model-assignment-v3.ndjson \
    --out data/revamp/suppression/assignments-v2.ndjson \
    --summary data/revamp/suppression/controlled-suppression.json
.venv-corpus/bin/python scripts/corpus-20k/derived/compute.py --fields data/revamp/fields-v2 \
    --registry data/corpus-20k/registry --assignments data/revamp/suppression/assignments-v2.ndjson \
    --out data/revamp/derived-v2 --as-of 2026-09-06
.venv-corpus/bin/python scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
    --models data/revamp/tiers/model-assignment-v3.ndjson \
    --relations data/revamp/identity/relations-v7.parquet --out-dir data/revamp/blocks
.venv-corpus/bin/python scripts/revamp/tier3_sections.py
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/corpus-20k/questions/derive.ts --fields data/revamp/fields-v2 \
    --seeds data/revamp/derived-v2 --out data/revamp/questions-v2 \
    --suppression data/revamp/suppression/assignments-v2.ndjson
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v14
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v14
.venv-corpus/bin/python scripts/revamp/hubs_build.py
.venv-corpus/bin/python scripts/revamp/hubs_text.py
rm -rf data/revamp/render-v13 .next/cache data/revamp/rendered-text
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
npx vitest run tests/unit/corpus-render-safety.test.ts
npm run typecheck ; npx eslint <the changed files> ; npx prettier --write ; npm run test:unit
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3214 \
    --out data/revamp/self-audit-round9.json
rm -rf .next/cache ; npm run gate
```

---

#### 1. A homeopathic product is neither a label nor an approval (§19 item 1)

Lead (Pb) sat in Tier 2 because Health Canada's Drug Product Database lists homeopathic products
against it, and the register's rows reached the page as "Canada: Marketed". A homeopathic product
listing is not an approval, and the register says so itself.

**What the extract records, read rather than assumed.** The four DPD extracts on disk hold no
product number with an `HM` prefix: all 58,087 product rows carry an eight-digit DIN or the string
"Not Applicable/non applicable", and `drug.txt`'s class column holds only Human, Veterinary,
Disinfectant and Radiopharmaceutical. The register identifies these products in its `QRYM_SCHEDULE`
table instead, whose schedule value for them is the word `HOMEOPATHIC` — the class Health Canada
issues a DIN-HM under — on **5,571 drug codes**. That column is the identification every stage
below reads; it is quoted in `docs/specs/field-models.md` beside the rule.

**Three stages consumed those rows and all three now refuse them.**

| Stage | What it did with a homeopathic row | Now |
| --- | --- | --- |
| `scripts/corpus-20k/tiers/assign-models.py` | a CLINICAL ground, and a "remaining register entry" the withdrawal rule is guarded by | neither: **11,883** ingredient rows skipped |
| `scripts/revamp/integrate_sources.py` | copied into `regulatory.CA.evidence`, with `status: approved` | kept and marked `productClass: homeopathic`; **3,262** rows on **603** pages, and **432** pages whose Canadian evidence is *all* homeopathic lose the `approved` status word |
| `scripts/revamp/build_blocks.py` | rendered "Marketed", "Approved", "Cancelled post market" | renders "Homeopathic product listed, DIN-HM class" |

The correction is applied at the integration rather than in the corpus-20k extractor, so the
recorded extraction stays what it was and one stage decides the rule for the whole corpus — the
channel §17(5) and §18(1) already use.

**The label half.** `scripts/revamp/openfda_label_map.py` gains three tests §15(2) did not carry:
the `purpose` section joins the indications and the description in the prose scan, the word
`anthroposophic` joins `homeopathic` in it, and a product name whose **last token** is a homeopathic
potency (`30C`, `7X`, `200CK`, `LM3`) is refused where no NDA, ANDA or BLA is recorded beside it.
The position and the application test are both measured rather than assumed: over the 262,271
indexed labels, 567 names carry potency notation anywhere and only 477 carry it as the last token —
the difference is "Technetium Tc 99M Sestamibi" (an approved radiopharmaceutical whose isotope
number sits mid-name), "3M Skin and Nasal Antiseptic" and "4X Medicated Toothache and Gum Gel" —
and **none** of the 477 carries an NDA, ANDA or BLA, so the conjunction removes nothing a register
approved.

Labels refused rose from **11,232 to 11,273**, **41 of them** by the potency rule; the prose rule
still fires on 4. The set ids every refusal names are written to
`data/sources/openfda-label/2026-09-05/parsed/excluded-set-ids.json` (**186,795** of them, the
index-level tests evaluated over every indexed label), and `assign-models.py` reads that file so the
`otc-label` CLINICAL ground refuses exactly what the mapping refuses: **5,301** labels, against the
5,295 the no-application-number rule alone refused before, with **1** left for that rule to catch.

**Tier sizes** (`data/revamp/tiers/model-assignment-v3.ndjson` against v2, 28,832 records):

| Model | v2 | v3 |
| --- | --- | --- |
| LONGEVITY | 1,109 | **1,109** |
| CLINICAL | 4,531 | **4,126** |
| DEVELOPMENT | 23,192 | **23,597** |

405 pages move from CLINICAL to DEVELOPMENT. The withdrawn flag moves by one, 660 → **661**: taking
homeopathic rows out of the "remaining entry" guard drops the pages with a live register entry from
3,679 to 3,092, and on all but one of them another register still stands.

**The three pages §19 named, and what the register actually says about each.** Lead moves CLINICAL
→ DEVELOPMENT: every one of its eight Canadian drug codes is filed under `HOMEOPATHIC`. Adonis
vernalis stays CLINICAL, and correctly: of its four codes, 1449, 9031 and 9032 are homeopathic and
**3558 is not**, so the register holds a non-homeopathic product for it. The holly page (Ilex
Aquifolium Flowering Top) also stays CLINICAL, on drug code 1039 — "TONIC TEA FOR COLDS", schedule
`NON-PRESCRIPTION DRUGS`. Neither of those two is a DIN-HM listing, so §19's rule does not reach
them and is not widened to; both are recorded here rather than described as fixed.

**What the pages print.** 602 pages now carry a homeopathic Canada line: 431 print it alone
("Canada: Homeopathic product listed, DIN-HM class (Health Canada Drug Product Database) · 4 drug
codes · checked 2026-09-04") and 171 print it beside the words the register's other rows carry.

---

#### 2. The nearest-neighbour comparison needs a structure on both sides (§19 item 2)

Lead's Morgan fingerprint and uranium's are both empty, so their Tanimoto similarity is 1.00 and the
section read "closest approved compound: uranium, similarity 1.00" — a number about two empty bit
vectors, not a finding about either element. `scripts/revamp/tier3_sections.py` now skips a
structure of fewer than two heavy atoms in `build_fingerprints`, which removes it as a query **and**
as a reference in one place, so the rule holds on both sides of every comparison by construction.

**114 recorded structures** hold fewer than two heavy atoms; pages fingerprinted fall from 20,017 to
**19,903**. Neighbour matches at or over 0.40 fall from 8,740 to **8,645: 95 rows removed**, of
which 86 carried the similarity sentence and 9 the substituent sentence.
`tier3-sections.parquet` holds **29,806** rows against 29,901.

---

#### 3. Predicted lines cap at six visible rows per rule class (§19 item 3)

Rescinnamine painted a run of twenty hypotensive lines because the cap was taken over the whole
predicted tier, and a tier is not what a reader reads: one mechanism rule matching 353 counterparts
is one thing being said 353 times.

`groupPredictedByRuleClass` in `scripts/corpus-20k/render/page-text.ts` splits the predicted rows
into their rule classes, in the order the classes first appear, each capped at
`PREDICTED_VISIBLE_ROWS` (6) visible rows with the remainder behind that class's own control. It is
re-exported through `lib/corpus/page-text.ts`, and both surfaces call it: `renderPage` writes the
groups in that order, and `components/dossier/corpus/InteractionsBlock.tsx` paints one `<ul>` and
one counted `<details>` per class. Tiers A and B keep the flag the block stage stored. The
checked-sources statement sits outside every group and stays visible.

Because one rule class is now one list, §14(9)'s "every visible list caps at six rows" holds on the
predicted block without a second rule, and the DOM check reads the cap off the list.

---

#### 4. The mechanical checks (§19 item 4)

**`scripts/revamp/self_audit.py`** gains three rules and two payload extractions (the computed
sections' rows, and every visible predicted list with its row count). The `Recorded` loader gains
the DPD's own homeopathic drug codes, read from `schedule*.txt`, and the display names of the
records whose structure is one heavy atom — so each rule checks the DOM against the register or the
identity revision, never against the stage that applied the fix.

- *no Health Canada homeopathic row is rendered as an approval* — the page's Canadian drug codes
  against the register's schedule table, and the Canada line's own words;
- *no nearest-approved-neighbour row on a single-heavy-atom structure* — the page's InChIKey and the
  neighbour's printed name against the single-atom set;
- *every visible predicted-interaction list caps at six rows*.

**`tests/test_render_safety.py`** gains three corpus-wide cases:

- a homeopathic Health Canada row is never an approval — in the field record (the row is marked and
  the jurisdiction loses `approved`), in the tier map (no CLINICAL ground names a homeopathic drug
  code) and in the render (the Canada line states the listing and carries no approval word);
- no neighbour section in `tier3-sections.parquet` stands on a structure of fewer than two heavy
  atoms, on either side, and no page prints such a row;
- predicted lines are painted grouped by rule class — every painted line is read back to the rule
  that produced it through the stored counterpart, and a class is one contiguous run.

**Vitest** (`tests/unit/corpus-render-safety.test.ts`) gains four cases: the registration block
paints a homeopathic Canada line and adds no approval word; the computed-section component paints no
neighbour row where the corpus computed none; `groupPredictedByRuleClass` caps at six per class in
first-appearance order; and the interactions block paints two capped lists with their own counted
controls while the checked-sources statement stays visible.

**One line beyond §19, the observation measure v13 recorded.** `page-text.ts` wrote a relation row's
label from the stored type with only the dash replaced, so 94 rows read `same_structure_as X` while
the page painted `same structure as X`. Both separators are replaced now, and the render carries
**0** enum relation labels.

**A second fault beyond §19, found by this round's self-audit and fixed here.** The first self-audit
run failed on two of its thirty pages: `/d/acebutolol-2` and `/d/trihexyphenidyl-2` each painted
"Stereoisomer of Acebutolol" / "Stereoisomer of Trihexyphenidyl" — the bare name the two pages
share, which is the thing §17(3) exists to stop. The page bundle carried the right name on both;
the loss was downstream and in both surfaces at once. `materialise.ts` and `page-text.ts` looked the
stored name up by **relation kind and counterpart**, and the two files that carry a pair do not
always agree on the kind: `relations-v7.parquet` records Acebutolol ↔ Acebutolol as `form_of` one
way and `stereoisomer_of` the other, while `canonical-v7.ndjson` records `stereoisomer-of` both
ways. The kind-keyed lookup therefore missed on **119 relation rows over 119 pages**, and each
printed the bare shared name.

The disambiguated name belongs to the page a row points at, not to the kind of relation that
reaches it, so both surfaces now fall back to a counterpart-keyed lookup, identically; the
kind-specific key is still tried first. Measured on the corpus after the fix: **0** rows print a
related page's own printed title where the identity stage recorded a disambiguated name for the
counterpart.

`tests/test_render_safety.py`'s §17(3) case was checking the page bundle — the stage that decided
the name — and so could not see a fault that happened after it. It now recomputes the name each
surface prints and compares it with the page's own printed title, corpus-wide.

**What that rule still cannot reach, recorded and not described as fixed.** Seven rows on seven
pages name a counterpart that prints their own title and for which no disambiguated name exists:
four `HOLD:existing:*` records — amdinocillin, arimoclomol, cisapride and vincristine — which are
published (noindex) pages. `scripts/revamp/display_names_v6.py` builds its collision groups from
`relations-v6.parquet`, which carries no edge to a `HOLD:existing:*` record, so the identity stage
never wrote a `relation-label` row for one. Re-running that stage against the v7 revision is the
change that would close it; it is a Phase 3 change with corpus-wide reach that this round is not
scoped to make and could not verify inside it. The test asserts the set of four so the gap cannot
grow unnoticed.

---

#### The re-render

`data/revamp/render-v14/{text,text-with-furniture,provenance}`, **28,657 pages**. Furniture-free
**9,378,239** words (v13: 9,387,610). **1,105,602** provenance entries, **0** without a trace
(v13: 1,106,785). The word count is the one after the §17(3) correction below, which added a
parenthetical to 119 relation rows. `data/revamp/render-v13` was deleted after v14 was written: one render revision
is kept.

#### Tests

- `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
  **61 passed, 0 skipped** (58 passed, 0 skipped at measure v13; the three §19 cases are this
  round's). Before the measurement runs, the parity rule skips itself — it asserts the result of
  `dom_parity.py` — and the suite reads 60 passed, 1 skipped; the count above is the one after
  `render-v14/dom-parity.json` exists.
- `npx vitest run tests/unit/corpus-render-safety.test.ts`: **86 passed** (82 at fix round 8).
- `npm run typecheck`: clean. `npx eslint` on the changed TypeScript files: **0 problems**.
  `npx prettier --write`: one file reformatted.
- `npm run test:unit`: **180 files, 2,668 passed, 9 skipped** (2,664 at v13).
