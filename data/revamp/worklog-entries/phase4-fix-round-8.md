### Phase 4 — fix round 8, the two data-level rules of §18

`docs/specs/phase4-generators.md` §18 items 1 and 2, from the lead's reading of slop draw 12, and
item 3's mechanical checks. Both faults are data-level — a name and a relation, neither of them a
sentence — so both are decided by a stage that reads the whole corpus and applied by the loader and
the render, and no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/identity_relations_v7.py
.venv-corpus/bin/python scripts/revamp/synonym_filter.py
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v13
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v13
rm -rf data/revamp/render-v12 .next/cache
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
npx vitest run tests/unit/corpus-render-safety.test.ts tests/unit/corpus-suppression-block.test.ts
npm run typecheck ; npx eslint <the changed files> ; npx prettier --write ; npm run test:unit
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:PORT \
    --out data/revamp/self-audit-round8.json
rm -rf .next/cache ; npm run gate
```

---

#### 1. The names a page prints (§18 item 1)

Letrozole's header read "Also called … anastrozole, aromatase inhibitors, ai, exemestane, le, nsai
…" and its Salt form group read "LETROZOLE TABLETS". None of those is a name of letrozole:
anastrozole and exemestane are two other pages, "aromatase inhibitors" is the ATC class all three
sit in, "ai" and "nsai" are the abbreviations the same registry rows carry on all three, and a
tablet is a product.

All of them arrive on one path. `scripts/corpus-20k/identity/resolve.py` stores Open Targets'
`synonyms` and `tradeNames` — the registry's own other-names list for a molecule — as `common` and
`brand` synonyms under the source `open-targets`, and it files any name matching a salt-or-form word
regex under the kind `salt`, a regex whose word list holds `injection`, `tablets?`, `capsules?`,
`solution`, `cream`, `gel` and `spray` beside the counter-ions. So a registry alias list reached the
header, and a dosage form reached the heading that states what forms of the substance exist.

`scripts/revamp/synonym_filter.py` decides the correction once, corpus-wide, and writes
`data/revamp/identity/synonym-filter-v1.csv` and `synonym-filter-summary.json`. It is the channel
§17(5) already uses: `page_blocks.py` merges its rows with the §17(5) corrections onto the page
bundle, `materialise.ts` applies them when it writes `page_synonyms`, and `page-text.ts` applies them
to the measured text, so the page's headings and the render's bracketed kinds move together.

Every vocabulary is read from a recorded source; none is a hand-written list of drugs.

| Vocabulary | Read from | Size |
| --- | --- | --- |
| another page's name | display name and display/common/INN/USAN/BAN/JAN synonyms of every corpus page, `canonical-v7.ndjson` | 28,657 pages |
| ATC class names | `data/sources/chembl/mapped.parquet` field `atc`, level-1 to level-4 descriptions | **898** |
| pharmacologic-action terms | DrugCentral and Inxight class statements in `data/revamp/fields-v2` (`mechanismClass.classStatements`) | **1,179** |
| generic class words | §18's own list, with singulars | 14 |
| counter-ions | `scripts/revamp/salts.txt`, unchanged | 196 |
| dosage forms | the HSA listing's `dosageForm` and the Orange Book's `dosage_form_and_route`, tokenised, plus §18's own words | **134** |
| product names | HSA `productName`, Orange Book `trade_name`, Purple Book `proprietary_name`, EMA `medicine_name`, Inxight marketing-status `products` | 12,155 pages |

**The rules and what each moved.** 208,812 stored synonyms were read; the filter decided **8,721**
corrections on **3,001** pages, and merged with §17(5)'s the page bundles carry **8,747** on
**3,010** pages, of which **3,856** remove a name and **4,891** re-file one. Every one of the
**6,271** names that leave the salt-form list is accounted for: 4,812 to "Also called", 78 to a
trade name, 1,381 removed.

| Rule | Correction | Rows |
| --- | --- | --- |
| a registry-derived name that is another page's recorded name | drop | **2,350** |
| a registry-derived name that is a class-vocabulary term | drop | **28** |
| a `salt` name that is not this record's own name plus a counter-ion | → `common` | **4,786** |
| a dosage-form string a register records as a product name | → `brand` | **79** |
| a dosage-form string no register records as a product name | drop | **1,478** |

Three decisions are recorded rather than assumed.

- **The drop is scoped to registry-derived names, and to the group's every source.** §18's rule is
  about the registry's other-names list, and the loader writes one `page_synonyms` row per page,
  kind and lowercased name — so the decision is taken over that group, and a group any other
  register also recorded is not a registry name and is not dropped. On this corpus no group is
  mixed, so the grain changes nothing here and stops a later source from being deleted by proxy.
- **A name that carries the page's own name is never dropped.** "letrozole sie" carries
  "letrozole"; "amlodipine besylate component of lotrel" carries "amlodipine". The first test any
  registry name meets is whether it contains this record's name at token boundaries.
- **The page's own name is out of scope; its counter-ion-stripped form is not.** On a salt page —
  "Zinc Sulfate Anhydrous" — the stripped form is the moiety, "Zinc", and a salt-kind name that is
  the moiety is a name of the other page, not a form of this one. Fifteen such names were kept as
  salt forms until this was corrected, among them "Lysine" under Lysine Aspartate and
  "Calcium (as sulfate)" under Calcium Sulfate Anhydrous.

**Precedence.** §17(5) and §18(1) overlap and neither contains the other: §17(5) takes a name out of
the salt-form list because it is another page's component or mixture name; §18(1) takes one out
because it is not this record's name plus a counter-ion, and drops it where it is a registry name of
another page or a dosage-form string no register prints. `page_blocks.merge_synonym_corrections`
resolves a name both reach to the stronger answer — drop over brand over a re-filed kind — so a name
the registers do not hold as a name of this substance is never printed under a different heading
instead. 185 §17(5) rows survive as the answer for their name; ten of those are names §18(1)'s
salt test alone would have kept.

**What the salt-form list now holds: 1,574 names, every one of them this record's own name plus a
counter-ion from `salts.txt`** — "Vincristine Sulfate" under Vincristine, "Clobetasol Propionate"
under Clobetasol — measured over the corpus with the correction applied, **0 violations**.

**What §18's rule does not reach, recorded rather than described as fixed.** Two things.

A registry abbreviation no other page carries and no vocabulary names survives: letrozole's header
still reads "ltz", "lz" and "letrozole sie" beside its real names, because §18's two tests are "is
another page's name" and "is a class term", and those three are neither. The five §18 names it did
list — anastrozole, exemestane, aromatase inhibitors, ai, nsai — are all gone, the first two as
other pages and the last three as names Anastrozole and Exemestane also carry.

678 synonyms that are
another page's display name survive, because their source is not the registry: 176 from ChEMBL, 145
from the FDA substance-name repair, 106 legacy `salt` aliases, 84 from the FDA substance register.
Most are correct — "Alclometasone Dipropionate" under Alclometasone is a salt form the corpus holds
a page for, and "Iobenguane Sulfate I-131" is a merged page's own name — and the rest (a page whose
`common` list names its parent, such as "Dapagliflozin" under DAPAGLIFLOZIN PROPANEDIOL) are outside
what §18 asks for. The mechanical check below is written to the rule, not to a broader claim.

---

#### 2. "Same structure as" requires a structure (§18 item 2)

Activated Charcoal and Tantalum Carbide are both recorded against `OKTJSMMVPCPJKN-UHFFFAOYSA-N`, the
InChIKey of one carbon atom, and R2 linked them because the keys are identical and the UNIIs are
not. The keys really are identical and the statement is still empty: an element's key describes the
element, and two records that both reduce to one atom have nothing structural in common to state.

`scripts/revamp/identity_relations_v7.py` is the projection §14(12)'s v6 script already models: it
re-resolves nothing and reads the revision Phase 3 published. A relation whose whole claim is that
two structures are identical — `same-structure-as`, the only one in the vocabulary that says that
and nothing more — survives only where both pages carry a recorded full InChIKey, the two are
identical, and the structure that key describes holds **at least two heavy atoms**, counted with
RDKit from the SMILES the identity revision or PubChem records for it.

**136 structure-equality rows in, 126 out: 10 directed rows removed, five pairs**, every one of them
a single heavy atom — Krypton ↔ Krypton Kr-81m, Xenon ↔ Xenon Xe-127, Technetium Tc-99m ↔ Technetium
Tc 99m Arcitumomab, Zinc Cation ↔ Velmanase alfa, Activated Charcoal ↔ Tantalum Carbide. No row was
removed for a key mismatch (every surviving pair's full keys agree) and none for a missing structure.
`canonical-v7.ndjson` loses the same relation on **8 records**; the two remaining directed entries
on those pairs are `isotopologue-of` rows, which name a difference rather than an identity and are
untouched.

`relations-v6.parquet` and `canonical-v6.ndjson` stay on disk beside the v7 files, as the v5 files
stayed beside v6. Every reader moves together: `page_blocks.py`, `tier3_sections.py`,
`hubs_build.py`, `page_text_v5.ts`, `materialise.ts`, `redirect_check.py`, `rendered_dup_check.py`,
`slop_draw.py`, `build_release.py`, `ci_sample.py` and `tests/test_render_safety.py`.

`tier3-sections.parquet` was **not** rebuilt, and that is a measured decision rather than an
omission: the form-of note is written from the relations table, and **0 of its 3,588 formOf rows
cite a `same_structure_as` relation** — the note fires on the more specific form relations — so no
sentence in it names a removed pair. The removed relations reached the page only as relation rows,
which `materialise.ts` writes from `canonical-v7`.

---

#### 3. The mechanical checks (§18 item 3)

**`scripts/revamp/self_audit.py`** gains three rules, each read off the served DOM, and a
`Recorded` loader that reads what the corpus decided so the DOM has something to be checked against.
The single-heavy-atom key set is derived here from the identity revision's own SMILES rather than
read back from the removal list, so the rule and the fix do not share an answer.

- *no name the synonym filter removed is painted* — every dropped name for this page against the
  header's name groups, under any heading;
- *every salt-form entry is this record's name plus a counter-ion* — each name under the "Salt form"
  heading, stripped against `salts.txt`, against the page's own `h1`;
- *no structure-equality relation on a single-heavy-atom key* — a "Same structure as" row against
  the InChIKey the record prints in its exact-record disclosure.

**`tests/test_render_safety.py`** gains three corpus-wide cases, each rebuilding its vocabulary from
the identity records rather than reading the filter's output back:

- no surviving registry-derived synonym is another corpus page's recorded name or a class word
  (asserting both that names were dropped and that names survived, so neither half can pass
  vacuously);
- every surviving `salt` synonym strips to this record's own name plus a counter-ion;
- no `same-structure-as` row in `relations-v7.parquet` stands on a key of fewer than two heavy
  atoms or on two different keys, and no page prints such a row in the render.

**Vitest** (`tests/unit/corpus-render-safety.test.ts`) gains three cases: a `drop` correction removes
the name from the measured text and never re-files it under another heading; a corrected kind still
prints beside a dropped name on the same page; and a page holding no structure-equality relation
prints none.

---

#### The re-render

`data/revamp/render-v13/{text,text-with-furniture,provenance}`, **28,657 pages**. Furniture-free
**9,387,610** words (v12: 9,396,017); with furniture **13,310,711** (v12: 13,319,614).
**1,106,785** provenance entries, **0** without a trace, unchanged from v12: no sentence was added or
removed this round, only names inside the header line and two relation rows. `data/revamp/render-v12`
was deleted after v13 was written: one render revision is kept.

#### Tests

- `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
  **57 passed, 1 skipped** (55 passed at fix round 7; the three new cases are this round's). The
  skip is the parity rule, which asserts the result of `dom_parity.py` and skips itself until the
  measurement has written `render-v13/dom-parity.json`; it is re-run after the measurement and
  passes on it.
- `npx vitest run tests/unit/corpus-render-safety.test.ts`: **82 passed** (79 at fix round 7).
- `npm run typecheck`: clean. `npx eslint` on the changed TypeScript files: **0 problems**.
  `npx prettier --write`: one file reformatted.
- `npm run test:unit`: **180 files, 2,664 passed, 9 skipped** (2,661 at v12).
