# Identity resolution rule (R1) — designed once, executed mechanically

**Status:** rule fixed 2026-09-04 (Fable). Execution, counts and the worked examples are produced by
`scripts/corpus-20k/identity/*` (Opus) and recorded under `data/corpus-20k/identity/`. This file is
the contract; a change to it invalidates the execution.

## 1. What a page is

One page = one **canonical moiety**: the neutral parent structure that remains after removing
counter-ions, solvates and hydrates, **and nothing else**. Covalent modifications stay. So:

- metformin and metformin hydrochloride → one moiety (the hydrochloride is a salt);
- testosterone, testosterone enanthate and testosterone cypionate → three moieties (esters are
  covalent; their half-lives are the content);
- valaciclovir and aciclovir → two moieties (a prodrug is a different covalent structure);
- R-lipoic acid, S-lipoic acid and racemic lipoic acid → three moieties (stereo is kept, §3.4).

"Active moiety" in FDA GSRS terms is broader (it de-esterifies). We do **not** use that
relationship for merging; see §2.

## 2. Canonical key, in precedence order

The executor computes every key it can for a record, then picks the first available in this order.
The chosen key and the rule id are logged on every record.

| Rank | Key                                                                 | How it is formed                                                                                                                                                                                                                                                                                                                             | Rule id              |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| K1   | `UNII` of the **parent substance**                                  | The record's own UNII when GSRS marks it a parent (no salt/solvate relationship), else the UNII reached by following GSRS `SALT/SOLVATE → PARENT` relationships. GSRS `ACTIVE MOIETY` relationships that cross a covalent bond (ester, prodrug) are **not** followed.                                                                        | `K1-UNII-PARENT`     |
| K2   | `InChIKey` of the largest covalent fragment, **full 27 characters** | Strip counter-ions/solvates from the structure (RDKit largest-fragment after `SaltRemover`/`rdMolStandardize.FragmentParent`), neutralise charges, recompute the InChIKey. The first 14 characters (connectivity) group candidates; the stereo block (chars 15–23) and protonation flag decide splits (§3.4).                                | `K2-INCHIKEY-PARENT` |
| K3   | ChEMBL parent                                                       | `molecule_hierarchy.parent_chembl_id` when the record has a ChEMBL id but no structure of its own.                                                                                                                                                                                                                                           | `K3-CHEMBL-PARENT`   |
| K4   | Name family                                                         | Normalised name (existing `data/registries/name-family.json` rules: lower-case, strip salt words, strip stereo prefixes only when §3.4 says the record is unspecified, strip "extract/powder/oil"), for records with no structure and no UNII (botanicals, some supplement ingredients). Two K4 records merge only on exact family equality. | `K4-NAME-FAMILY`     |

A record that resolves to K1 **and** K2 must agree (same parent): disagreement is logged as
`CONFLICT-K1-K2` and the record is held out of merging until a person decides. Never resolved by
majority.

Biologics (proteins, antibodies, cell and gene therapies, biosimilars): K1 only. A biosimilar has its
own UNII and is its own page (§3.6); no structure key is computed for a sequence.

## 3. Merge and split rules by ambiguity class

| Class                              | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                           | Example                                           | Rule id                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------- |
| 3.1 Salt forms                     | **MERGE** into the parent moiety; every salt name becomes a synonym with kind `salt`. Kinetic differences between salts are not a page.                                                                                                                                                                                                                                                                                                        | metformin / metformin HCl                         | `M-SALT`                         |
| 3.2 Esters and prodrugs            | **SPLIT.** Distinct covalent structure → distinct K2 → distinct page. Link each ester/prodrug to its parent with relation `ester-of` / `prodrug-of` (markup, never prose).                                                                                                                                                                                                                                                                     | testosterone enanthate → `ester-of` testosterone  | `S-ESTER`                        |
| 3.3 INN vs USAN vs BAN             | **MERGE** (synonyms of one structure). Display name = INN when WHO lists one; USAN/BAN as synonyms of kind `usan`/`ban`.                                                                                                                                                                                                                                                                                                                       | paracetamol (acetaminophen)                       | `M-NAME-VARIANT`                 |
| 3.3b Brand vs generic              | **MERGE** a single-ingredient brand into its moiety as synonym kind `brand` with the product's formulation noted; a **multi-ingredient brand is a combination record** (3.7).                                                                                                                                                                                                                                                                  | Glucophage → metformin; Janumet → combination     | `M-BRAND` / `S-COMBO`            |
| 3.4 Stereoisomers                  | **SPLIT** when the two are distinct substances in a source (distinct UNIIs, or distinct ChEMBL parents, or one is "unspecified/racemic" and the other has defined stereo). Link with `stereoisomer-of` / `racemate-of`. **MERGE** only when the same substance is recorded with and without stereo _by accident_ (identical UNII, or one source omits stereo for a substance that has only one marketed form): decided by UNII, never by name. | escitalopram / citalopram; R-lipoic / lipoic acid | `S-STEREO` / `M-STEREO-ACCIDENT` |
| 3.5 Development code names         | **MERGE** into the structure they name (ChEMBL/PubChem synonyms). A code with no resolvable structure stays a K4 record flagged `code-only`.                                                                                                                                                                                                                                                                                                   | MK-677 = ibutamoren = L-163,191                   | `M-CODE`                         |
| 3.6 Biosimilars                    | **SPLIT.** Each biosimilar UNII is its own page linked `biosimilar-of` the originator UNII. The unsuffixed originator record must exist; if only suffixed records exist, the earliest-approved one is the originator page.                                                                                                                                                                                                                     | adalimumab-atto → adalimumab                      | `S-BIOSIMILAR`                   |
| 3.7 Combination products           | **SPLIT** into a combination record keyed by the **sorted set of component keys** (`COMBO:{k1,k2,…}`), linked `contains` to each component page. A combination is never merged into one component.                                                                                                                                                                                                                                             | amoxicillin + clavulanate                         | `S-COMBO`                        |
| 3.8 Isotopes, deuterated analogues | **SPLIT** (different InChIKey isotopic layer). Link `isotopologue-of`.                                                                                                                                                                                                                                                                                                                                                                         | deutetrabenazine / tetrabenazine                  | `S-ISOTOPE`                      |
| 3.9 Formulations of one moiety     | **MERGE** (oral vs injectable semaglutide are one page); formulation kinetics render inside the page as data rows.                                                                                                                                                                                                                                                                                                                             | Rybelsus, Ozempic → semaglutide                   | `M-FORMULATION`                  |

## 3.1a Salt forms of a structureless record — pass 3 (added 2026-09-05, Phase 5a)

§3.1 merges a salt form into its parent moiety, and identity pass 2 executed it by recomputing a
parent structure from each K1 page's own UNII SMILES. A record with **no structure on file** — a
biologic, a peptide, a name-only substance — has no SMILES to recompute, so `Oxytocin Acetate` and
`Sermorelin Acetate` kept their own pages beside `Oxytocin` and `Sermorelin`. Gate 2 recorded that
as a defect. Pass 3 closes it on the register's printed name instead of on structure.

**Rule `M-SALT-P3`.** A canonical page **merges into another page** when all of these hold:

1. its key rank is K1 and it holds **no structure**;
2. its **FDA UNII display name**, with trailing salt and form words removed one at a time, equals
   another page's display name exactly (both normalised: lower case, punctuation to spaces);
3. exactly **one** page matches that stripped name;
4. the survivor is a **parent moiety**: key rank K1, K2 or K3, and — where it has a structure — at
   least two heavy atoms and at least one carbon.

The survivor is the unsalted page. The merged page's own name becomes a synonym of kind `salt`; its
synonyms, source records, relations, identifiers, existing slug, registrations, aggregates and
present field values union onto the survivor exactly as in pass 2.

**Salt and form vocabulary.** The executor's own `SALT_AND_FORM_WORDS` (read out of
`scripts/corpus-20k/identity/resolve.py`, not restated) plus the words the phase names — acetate,
hydrochloride, sulfate, sodium, potassium, calcium, mesylate, citrate, tartrate, maleate,
succinate, phosphate, bromide, chloride — less every `ESTER_WORDS` entry. 59 words in all.

**What the rule refuses**, each counted and listed rather than merged:

| Refusal                                                            | Why                                                                                                                                                                                                                                                                 | Count |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: |
| The last word is an ester (`enanthate`, `decanoate`, `furoate`, …) | An ester is a distinct substance and splits under §3.2                                                                                                                                                                                                              |     0 |
| The stripped name matches no page                                  | There is no parent page to merge into                                                                                                                                                                                                                               |    56 |
| The stripped name matches more than one page                       | A person decides which (triptorelin, ziconotide: a K1 and a K2 record each)                                                                                                                                                                                         |     2 |
| The candidate is not a parent moiety                               | Pass 2's own skip: no page merges onto a single atom, an inorganic-only record, or a name-only record (magnesium sulfate → Magnesium; stannous chloride → Stannous; ferric pyrophosphate citrate → Ferric Pyrophosphate; ferric ammonium citrate → Ferric Ammonium) |     4 |

**Measured result (2026-09-05).** 6,571 structureless K1 pages considered · **111 merges** ·
28,943 → **28,832 pages** · 13 slugs adopted by the survivor · **1 existing slug redirected**
(`formaldehyde-solution` → `formaldehyde`) · 0 URLs orphaned. Mostly oligonucleotide sodium salts
(`inotersen sodium`, `patisiran sodium`), peptide acetates (`teriparatide acetate`,
`tesamorelin acetate`) and heparin sodiums. Six survivors changed model because the merged page
carried the ageing reasons; four of those moved to LONGEVITY, whose extractor contacts Europe PMC
and was not re-run, so their LONGEVITY field record was re-keyed from the merged salt page's own
record (Doxepin, Colesevelam, Inclisiran, Bulevirtide) — recorded values only, nothing re-read.

**Known limit.** `polyestradiol phosphate → Polyestradiol` merges on the register's naming although
the phosphate there is a polymer linkage rather than a counter-ion; the merged page has no structure
on file, so nothing in the data separates the two cases.

## 4. What gets logged, per decision

`data/corpus-20k/identity/decisions.ndjson`, one line per merge or split:
`{ at, sourceRecords: [ids…], decision: "merge"|"split"|"hold", key, keyRank, ruleId, evidence: { unii?, inchikey?, chemblParent?, nameFamily?, relationships? }, note? }`.
Every canonical record carries `identity: { key, keyRank, ruleId, synonyms: [{name, kind, source}], relations: [{type, targetKey}] }`.

## 5. Duplicate detection before any page renders

1. **Structural:** any two canonical records sharing InChIKey-14 but different full keys are listed
   with the stereo/isotope layers that separate them (expected splits) — the executor prints them so
   accidental splits are visible.
2. **Nominal:** any two canonical records whose name families are equal, or whose synonym sets
   intersect, but whose keys differ → `suspected-missed-merge` unless a 3.x split rule explains it.
3. **Rendered:** the R3 overlap measure (MinHash/LSH candidates, exact positional scoring) runs over the
   data each record would render; any pair > 0.60 positional → `suspected-missed-merge`, reported,
   never silently shipped.

Output: `data/corpus-20k/identity/suspected-missed-merges.json` and the counts in the Phase 0
table.

## 6. Worked examples to produce (30, all seven classes plus 3.8/3.9)

Salts: metformin·HCl; sertraline·HCl; bupropion·HCl; naltrexone·HCl; lithium carbonate vs citrate.
Esters/prodrugs: testosterone / enanthate / cypionate / undecanoate; valaciclovir / aciclovir;
prednisone / prednisolone; nandrolone / nandrolone decanoate. INN/USAN/BAN: paracetamol/
acetaminophen; adrenaline/epinephrine; salbutamol/albuterol; ciclosporin/cyclosporine. Brand:
Glucophage; Ozempic/Wegovy/Rybelsus; Januvia vs Janumet. Codes: MK-677/ibutamoren/L-163,191;
GW501516/cardarine; SR9009/stenabolic; LGD-4033/ligandrol; RAD-140/testolone; BPC-157.
Stereo: lipoic acid R/S/rac; citalopram/escitalopram; omeprazole/esomeprazole; modafinil/
armodafinil. Biosimilars: adalimumab and its suffixed products; insulin glargine / -yfgn;
filgrastim / -sndz. Combinations: amoxicillin+clavulanate; carbidopa+levodopa; metformin+sitagliptin.
Isotope: deutetrabenazine/tetrabenazine.

Each example row: names in play · keys computed · decision · rule id · what the page(s) will be.
