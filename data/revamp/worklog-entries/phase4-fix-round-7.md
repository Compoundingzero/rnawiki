### Phase 4 — fix round 7, the five rules of §17

`docs/specs/phase4-generators.md` §17 items 1 to 5, from the lead's reading of slop draw 10, and
item 6's mechanical checks for 2 to 5. Every one is a generator or a builder change; no page was
edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/interactions_build.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/validate_interactions.py
.venv-corpus/bin/python scripts/revamp/display_names_v6.py
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v12
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v12
rm -rf data/revamp/render-v11
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
npx vitest run tests/unit/corpus-render-safety.test.ts tests/unit/corpus-suppression-block.test.ts
npm run typecheck ; npx eslint <the changed files> ; npm run test:unit
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:PORT \
    --out data/revamp/self-audit-round7.json
rm -rf .next/cache ; npm run gate
```

---

#### 1. Additive-class membership comes from the substance's own class (§17 item 1)

The C3 rule paired Rivaroxaban with "Compound solution of sodium chloride" and with Glycine.
Neither is an anticoagulant. Both pages carried an anticoagulant ATC code because
`interactions_build.load_fields` read membership off `fields.regulatory.value.SG.atcCodes`, which
is the set of codes on the **product licences** the HSA listing holds for a substance: a saline
infusion licensed as a heparin solution put `B01AB51` on Sodium Chloride and an aspirin/glycine
tablet put `B01AC06` on Glycine.

Two inputs changed, both narrowing what may state a class:

- **ATC** is now ChEMBL's, read from `data/sources/chembl/mapped.parquet` field `atc`, whose every
  row carries the `moleculeChemblId` it was published against. A code there classifies the
  substance and never something it was formulated into. 4,138 pages carry one; 1,540 carried an
  HSA product ATC, which C3 no longer reads.
- **A class statement** is read only from DrugCentral and Inxight, the two vocabularies that record
  a pharmacologic class against the substance record. IUPHAR's ligand action is an action at a
  target; it matched no class term in this corpus and states none.

**Excluded entity classes.** §17 asks for counterparts "whose entity class is excipient, vehicle,
solution, mineral salt or water" to be excluded, and neither vocabulary that carries an entity class
here names those five: GSRS's substance class is `chemical`, `protein`, `mixture` and five more, and
the corpus's own `entityClass` is `APPROVED_MEDICINE`, `SUPPLEMENT_INGREDIENT` and ten more. A GSRS
class cannot even be read per page — a page carries every GSRS record its identifiers matched, and
Alteplase, Danaparoid and Doxepin each carry a `mixture` record beside their own, so reading that
column would have deleted three anticoagulants from the class. The class is therefore read off the
same stored evidence membership is read off, by three tests, each recorded with what it removed:

| Test | Pages excluded |
| --- | --- |
| a DrugCentral or Inxight class naming a pharmaceutic-aid role (`excipients`, `pharmaceutic aids`, `pharmaceutical vehicles`, `solvents`, `sweetening agents`, `coloring agents`, `aerosol propellants` and 14 more) | **53** |
| a ChEMBL molecule ATC under `A12` (mineral supplements), `B05` (blood substitutes and perfusion solutions) or `V07` (all other non-therapeutic products) — the WHO's own words for a mineral salt, a solution and a vehicle | **98** |
| the FDA substance register's UNII for water, `059QF0KO0R` | **1** |

An excluded page keeps every other tier: a label that names it is still label-documented evidence
about the page it is on.

**The rebuild.** Tier A (342,224 rows) and Tier B (18,297) are byte-identical to the round-6 build;
only C3 moved. Published C3 rows **132,308 → 216,880**: **8,680 removed, 93,252 added, 123,628
unchanged**. The removals are the product-ATC members — Sodium Chloride, Glycine and the other
solution and excipient records — and the 152 pages the entity-class tests exclude; the additions are
the substances ChEMBL's molecule ATC classifies and the HSA listing does not. Rivaroxaban's page
holds 129 Tier C rows and **none** of them is saline, glycine or water.

**Validation, re-run on the published rows** (`data/revamp/interaction-validation.json`; the
2026-09-06 figures are kept beside the new ones under `previous_measurements`, and
`docs/specs/interaction-rules.md` §7b tabulates both). `likely` reaches label-adjudicated precision
**0.9956** over 457 adjudicated pairs against the 0.60 bar; overall **0.9799** over 1,939 pairs;
recall **0.1209** (v11: 0.9956 / 0.9828 / 0.1079). Every rule's adjudicated precision is within
0.015 of its earlier value on a larger adjudicated denominator, and **no rule falls under 0.40**, so
the disabled list is unchanged: C2-shared-target-same-direction, C3-additive-hepatotoxic and
C3-additive-nephrotoxic stay disabled for the reasons §7 records.

---

#### 2. Withdrawal clauses merge identical events across sources (§17 item 2)

Urethane's record carries three S8 rows: ChEMBL's `withdrawn_flag`, which is the flag alone, and the
same withdrawal — carcinogenicity, eight countries, 1963 — from ChEMBL's `drug_warning` and from
Open Targets. `clauseFor('S8')` read them row by row, so the block printed three items, the first of
them "no reason recorded with the flag", ahead of two that gave the same reason twice.

`lib/corpus/suppression-labels.ts` now reads the register's own event shape — `reason; jurisdiction;
…; year` — and groups on it. Identical events merge into one item naming every register that
recorded it; a source that recorded no reason (the bare flag, or the literal `reason not recorded`
the registers write in the first slot) is dropped wherever another source recorded a reason for the
same jurisdictions and year, and survives only where nothing explains the withdrawal at all.
Urethane reads once: "carcinogenicity, Germany, Denmark, Brazil, Egypt, Italy, Cuba, United States,
Japan, 1963 (ChEMBL; Open Targets)". Zopiclone loses the `reason not recorded, Norway, 1987` item
that stood beside `carcinogenicity, Norway, 1987`. Rofecoxib keeps both of its two different
reasons for the same jurisdiction and year, because two reasons are two facts.

§13(2)'s rule that a register's column name is storage vocabulary still applies, so the registers
are named "ChEMBL; Open Targets" and not "ChEMBL drug_warning".

---

#### 3. A relation to a page printing the same name uses that page's disambiguated name (§17 item 3)

"Stereoisomer of Suprofen" on the page titled Suprofen names two records with one name.
`display-names-v5.csv` does not cover the pair: `identity_resolve.py` writes it for the R4 collision
set — two pages sharing a normalised name with **different skeletons** — and every pair here shares
a skeleton. They are the stereoisomer, salt, component and combination pairs the identity stage
deliberately kept apart, which R4 never looks at.

`scripts/revamp/display_names_v6.py` writes the revision that covers them, from stored records only,
by a ladder whose first rung that tells every page in a group apart wins: recorded composition →
stereo descriptor in the recorded name → recorded stereochemistry → FDA substance register name →
FDA UNII → ChEMBL molecule identifier → InChIKey. **322 rows over 158 groups, 0 groups left
unresolved**: recorded stereochemistry 166, ChEMBL molecule identifier 92, InChIKey 38, FDA UNII 12,
recorded composition 10, register name 4. Suprofen's pair reads "Suprofen (recorded without
stereochemistry)" and "Suprofen (with recorded stereochemistry)".

Two decisions are recorded rather than assumed.

- **The wording is not "(racemate)".** §17's example writes it, and §15 item 6 forbids it: an
  InChIKey with no stereo layer states that no stereochemistry was recorded and nothing more, and
  "racemate", "enantiomer" and "diastereomer" are each a claim the absence does not carry. The
  disambiguator says what the record says.
- **The page's own title does not change.** `display-names-v6.csv` carries both sets and an
  `applies_to` column says which is which: a `page-title` row is the §6 collision the identity stage
  resolved and the page prints it as its `h1`; a `relation-label` row names the page inside another
  page's relation row. Renaming 322 pages would move their titles, their JSON-LD, their sitemap
  entries and every measurement keyed on a title, and §17 item 3 asks for the link text. This is
  reversible: the two sets differ by one column.

The name travels as data, not as a recomputation: `page_blocks.py` puts it on the relation,
`materialise.ts` stores it in `page_relations.label` (a column migration 0026 already created and
nothing wrote), `dossier-page.ts` prefers it to the counterpart's own title, and `page-text.ts`
reads the same field, so the page and the measured text print one name. **762 relation rows** now
carry a disambiguated counterpart name. A counterpart the corpus holds no name for is not named by
its storage key: the row is dropped, as both surfaces already dropped it.

---

#### 4. Unconfirmed relation notes render only in the technical disclosure (§17 item 4)

"PRUSSIAN BLUE INSOLUBLE and Hydrogen Cyanide are linked by an FDA salt or solvate relationship, and
neither the structures nor the printed names confirm that one is a salt of the other" opened the
page as its form-of note, where the note's whole job is to say what this record is a form of. It
says the opposite: that the corpus cannot say.

`page_blocks.py` withholds a `formOf` section whose rule is an unconfirmed one
(`R6-GSRS-SALT-UNCONFIRMED`, and any later rule id ending `-UNCONFIRMED`) and writes it instead as
`relationNotes`. `materialise.ts` stores those as their own `relationNote` section so neither the
form-of note above the page nor the computed sections below it can paint them; `dossier-page.ts`
filters them out of both and hands them to `RelationsRows`, which shows them inside a closed
`<details>` beside the relation rows; `page-text.ts` writes them as markup in the same place, so the
render and the DOM still agree. **303 notes on 249 pages** moved. The sentence is not dropped: a
reader who opens the control meets exactly what the identity stage recorded.

`related_form_of` was not usable as the test — 562 of its 930 edges are `EXCEPTION-METAL-COMPLEX`,
whose note is a finding — so the rule id decides it.

---

#### 5. A component or mixture name is never a salt form (§17 item 5)

"WATER" printed under Oxygen's salt forms. It is not a form of oxygen: it is the FDA substance
register's own name for the page this corpus calls **Aqua** (`K1:059QF0KO0R`), and it reached
Oxygen's alias list as a legacy `salt_form` alias from a product the two share ("NINA WATER").

The rule is decided once, corpus-wide, in `page_blocks.salt_form_corrections`, because it needs
every page's names and the loader reads one tier at a time. A `salt`-kind synonym leaves the
salt-form list when all three hold: it does not carry this record's own name at token boundaries;
it is a recorded name (display, common, INN, USAN, BAN or JAN) of at least one **other** corpus
page; and every relation this record holds with those pages is a component or mixture one
(`component_of`, `contains`), or there is none. It keeps its place under "Also called": the register
recorded the name against this record and the page still says so.

**203 names on 154 pages** move. A name that carries the record's own name is never touched —
"Vincristine Sulfate" under Vincristine and "Cisapride Monohydrate" under Cisapride are forms the
corpus holds no page for — and nor is a name whose page this record holds a salt, ester,
stereoisomer, parent or active-moiety edge with, because that edge is the corpus saying the two are
forms of one substance. `materialise.ts` writes the corrected kind into `page_synonyms` and
`page-text.ts` prints it in the measured text, so the page's "Salt form" heading and the render's
`(salt)` tag move together.

---

#### 6. The mechanical checks (§17 item 6)

**`scripts/revamp/self_audit.py`** gains four rules, each read off the served DOM:

- *a withdrawal clause states each event once and no flag beside a reason* — splits the clause on
  `"; "` outside brackets (the register list uses the same separator), and fails on a repeated
  event or on a flag-only item beside a reasoned one;
- *a relation row never names the page it is on* — the row's name against the `h1`;
- *an unconfirmed relation note renders only inside a closed disclosure* — the note's sentence
  against the extraction taken with every disclosure closed;
- *the salt-form list holds no component or mixture name* — the names under the "Salt form" heading
  against the page's own component and mixture relation rows.

Two new extractions carry them: the `h1` and the header's name groups by their heading.

**`tests/test_render_safety.py`** gains four cases over the render, the provenance map, the page
bundles and the identity records: the withdrawal clause states each event once and never strands an
unreasoned event beside a reasoned one for the same jurisdictions and year; no relation row names
the page it is on and at least one prints a disambiguated name; every withheld note is absent from
the provenance map's prose and present in the render's disclosure, and no form-of note repeats it;
and no `salt`-kind synonym that names another corpus page reachable only by a component or mixture
relation survives in the salt-form list. Each asserts its own observability — a rule that could
not fire on this corpus fails rather than passing silently.

**Vitest**: `corpus-suppression-block.test.ts` gains three cases on `supervisionClauses` (the
urethane merge, the zopiclone drop, and the two-reason and bare-flag cases that must survive);
`corpus-render-safety.test.ts` gains four (the disambiguated relation row, the unconfirmed note
inside the closed control and absent from the form-of region, the corrected kind in `renderPage`'s
measured text, and the "Salt form" heading never over a component name).

---

#### The re-render

`data/revamp/render-v12/{text,text-with-furniture,provenance}`, **28,657 pages**. Furniture-free
**9,396,017** words (v11: 9,230,774); with furniture **13,319,614** (v11: 13,157,611).
**1,106,785** provenance entries, **0** without a trace (v11: 1,087,950 / 0). The rise is the 93,252
added interaction rows reaching the pages they belong to, against the words the merged withdrawal
clauses and the withheld relation notes take out. `data/revamp/render-v11` was deleted after v12 was
written: one render revision is kept.

#### Tests

- `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
  **55 passed, 0 skipped** (51 at fix round 6; the four new cases are this round's). Before the
  measurement wrote `render-v12/dom-parity.json` the parity rule skipped itself and the run was
  54 passed, 1 skipped; it is re-run after the measurement and the parity rule passes on it.
- `npm run typecheck`: clean. `npx eslint` on the nine changed TypeScript files: **0 problems**.
  `npx prettier --write` on the same: one file reformatted.
- `npm run test:unit`: **180 files, 2,661 passed, 9 skipped** (2,654 at v11).
