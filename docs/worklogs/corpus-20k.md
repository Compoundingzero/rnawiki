# Corpus 20k — running log

The rebuild mandated by Felix on 2026-09-04: the corpus expanded toward 20,000+ compounds under
three field models, dossiers rebuilt on the question pattern, deployed to Railway tier by tier,
verified live, submitted to IndexNow, with before/after measurements. The site serves biohackers
from beginner to expert; every decision resolves toward "does this change what a self-experimenter
concludes?". Three approval gates only (Gate 1, Gate 1b, Gate 2), each "proceed without asking"
above its threshold. Everything else: decide, log, continue.

<!-- RESUME BLOCK — keep at the top, rewrite after every batch -->

## RESUME

**Where work is: DONE — the corpus-20k rebuild is in production (2026-09-05).** 28,832 pages on
rnawiki.com (Tier 1 1,719 · Tier 2 4,477 · Tier 3 22,636), 636 indexable at threshold 11, every
tier verified live, Tiers 1–2 submitted to IndexNow, backup and data archive recorded. The FINAL
REPORT below is the deliverable; production numbers supersede earlier sections.

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
npx tsx scripts/corpus-20k/status.ts                       # phase 5-done; load ledger per tier
npx tsx scripts/corpus-20k/deploy/verify-live.ts --base-url https://rnawiki.com --json --require-all
```

**Open for Felix:** (1) the index population — hold threshold 11 (636 URLs) or index the 7–10
band (2,365 more pages at measured medians 0.202 positional / 0.453 lexical); (2) the DrugBank
licence, against the list in the final report; (3) the 214 display-name collisions and 697
suspected missed merges (`identity/slug-collisions-pass2.json`, `identity/suspected-missed-merges.json`)
for a person's pass; (4) the RSC payload (59–64 % of each document) as the next text-to-HTML lever.
**Follow-ups, not blocking:** run the §5.3 rendered duplicate check; give the 39 suppressed Tier 3
pages without a question block a supervision line in the stub template; drop seed 7's stored
rows; fix `overlap/measure.py --sample` truncating COMBO keys at a comma; re-record the frozen
bar's DOM-path string; the legacy `/browse` pager.

**How to resume any later work:** the corpus data is on the workstation only (untracked under
`data/corpus-20k/`, archive branch `archive/corpus-20k-full-history`, tarball in
`rnawiki-backups/corpus-20k-data-2026-09-05/`); the loader refuses production without
`--production-confirmed` and skips batches whose fingerprinted marker matches; never edit an agent
prompt mid-run; every value verbatim with source and date; R2 suppression removes seeds 1, 2, 6.

| Phase | State |
| --- | --- |
| 0 sources / identity / reconciliation / suppression | ✅ |
| 1 recovery of the 20 unreachable compounds | ✅ 19 of 20 |
| 2 assembly, Gate 1 (median 10/15), Gate 1b (threshold 11) | ✅ |
| 3 derived content (13 seeds fire, 4 discarded, 4 rejected) | ✅ |
| 4 disclosure, questions, templates, browse, home | ✅ |
| 5 Gate 2 PROCEED; deploy Tier 1 → 2 → 3; verify; IndexNow; audit; measure | ✅ **live** |
| Final report | ✅ below |

<!-- END RESUME BLOCK -->

## Phase 0a/0b — sources, licences, bulk, calls (2026-09-04)

Full table and per-source notes: `docs/specs/corpus-20k-sources.md`; machine form
`data/corpus-20k/sources.json`; legal gate `data/corpus-20k/legal-gate.json` (24 hosts, 108 logged
requests, robots and terms texts on disk). Repo and database map: `docs/specs/corpus-20k-repo-map.md`.

| Figure | Value |
| --- | ---: |
| ChEMBL 37 molecules with max_phase ≥ 1 | 16,784 |
| Existing canonical records | 9,852 |
| Reachable without a licence (estimate; overlap between the two sets NOT yet measured, assumed ~4,000) | ~22,600 (upper bound 26,636 if disjoint; clears 20,000 only while overlap < ~6,600) |
| Projected API calls, bulk-first plan | 11,616 (under the 50,000 ceiling; four naive lines worth ~80,000 calls replaced by bulk: FAERS via Open Targets ADR parquet, RxCUI from on-disk openFDA archives, literature restricted to Tier 1, OpenAlex dropped) |
| Disk needed for new bulk files | ~10 GB of 29 GB free |

Cleared: ChEMBL (CC BY-SA 3.0: ChEMBL-only fields stay separable so licence can be stated per
field), PubChem (public domain; Identifier Exchange 500,000 ids per job), ClinicalTrials.gov v2
(pageSize capped at 1,000; ~500 ids per request by URL length; its `/api/` robots conflict is
recorded), RxNav REST (RxNorm content only), Open Targets 26.06 (CC0), DailyMed/Orange
Book/Drugs@FDA/openFDA (US government / CC0; label 262,595 records, drugsfda 29,312, ndc 137,637,
orangebook 48,664 already on disk), EMA, Health Canada DPD (OGL-Canada 2.0), NIA ITP via the JAX
Mouse Phenome Database, Europe PMC and PubMed metadata, DrugBank OPEN data only (CC0: vocabulary
1.1 MB, structures 5.2 MB).

Not cleared, and modelled as UNKNOWN where they would have supplied a field: RxNorm full release
(UMLS licence), WHO INN lists (CC BY-NC-SA, account-gated; PDF only), TGA ARTG (robots
unretrievable to our agent: gate not passed → Australian status UNKNOWN), PMDA (no licence
statement, per-product PDFs → Japanese status UNKNOWN), nia.nih.gov itself (human-verification
interstitial; the JAX MPD mirror is used instead), OpenAlex (terms unreadable; dropped), DrugBank
full (CC BY-NC 4.0, no published price — an item for Felix's licence decision), WHO consolidated
withdrawn list (CC BY-NC-SA, URL not located), Google Patents (robots disallow + ToS → patent
status UNKNOWN), the FDA "withdrawn or removed" page (404 at three URLs; substitutes: openFDA
enforcement, Orange Book discontinued, Drugs@FDA marketing status, Open Targets drug_warning).

Identity coverage of the existing 9,852 (from the database; `data/corpus-20k/identity-coverage.json`):
UNII 6,711 · RxCUI 4,766 · CAS 2,738 · PubChem CID 2,081 · ChEMBL 1,208 · InChIKey 0 (stored
nowhere) · any key 6,739 · no key 3,113. DEA schedule and REMS are stored nowhere in the corpus;
R2 sources them fresh (openFDA NDC `dea_schedule`, label sections, Open Targets drug_warning).

Three facts the later phases inherit: the 52,326-pair overlap scorer was never committed (only the
sampler and fetcher under gitignored `tmp/`), so R3's measure is built new; `app/sitemap.ts` is one
file capped at 50,000 URLs, not the index R6 requires; the 20-section order lives in
`lib/dossier-completion/types.ts` (`DOSSIER_SECTION_IDS`), not a database constraint.

## Phase 0c — identity resolution (2026-09-04)

Rule: `docs/specs/identity-resolution.md`. Executor: `scripts/corpus-20k/identity/resolve.py` (RDKit
parent structures; the FDA UNII records file as the spine). Outputs under `data/corpus-20k/identity/`:
`canonical.ndjson`, `decisions.ndjson` (every merge, split and hold with the deciding key),
`worked-examples.md` (30 rows — **for Felix's sanity check**), `suspected-missed-merges.json`,
`summary.json`. DrugBank open data was unreachable without an account (HTTP 403 login wall, no login
attempted), so no DrugBank id came from it; the FDA UNII file (171,912 substances with CAS, RXCUI,
PubChem, InChIKey, SMILES, INN/USAN ids) substitutes for everything else.

| Input | Records |
| --- | ---: |
| `existing-canonical` | 9,852 |
| `chembl-molecules` | 16,784 |
| `open-targets-drug-molecule` | 22,407 |
| `fda-unii-records` | 171,912 |
| `fda-unii-names` | 1,050,022 |
| `ema-medicines` | 2,732 |
| `health-canada-ingredients` | 19,421 |
| `drugbank-open` | 0 |

| Result | Count |
| --- | ---: |
| Canonical pages | 28,966 |
| Merges | 4,307 |
| Splits | 1,256 |
| Holds (K1/K2 conflict, for a person) | 55 |
| No structure (biologics, botanicals, name-only) | 8,891 |
| Combination records | 173 |
| Biologics | 3,451 |
| Existing records merged into another existing record (duplicates in our own corpus) | 864 |
| Suspected missed merges (structural + nominal; the rendered check runs in Phase 2) | 697 |
| PubChem name lookups for keyless existing records | 1,927 |

| Rule | Decisions |
| --- | ---: |
| `CONFLICT-K1-K2` | 55 |
| `M-BRAND` | 392 |
| `M-CODE` | 112 |
| `M-FORMULATION` | 1,198 |
| `M-NAME-VARIANT` | 736 |
| `M-SALT` | 1,854 |
| `M-STEREO-ACCIDENT` | 15 |
| `S-BIOSIMILAR` | 208 |
| `S-COMBO` | 173 |
| `S-ESTER` | 45 |
| `S-ISOTOPE` | 133 |
| `S-STEREO` | 697 |

| Key rank | Pages |
| --- | ---: |
| `COMBO` | 173 |
| `HOLD` | 55 |
| `K1` | 20,128 |
| `K2` | 6,374 |
| `K3` | 495 |
| `K4` | 1,738 |
| `NONE` | 3 |

Executor caveats carried forward: 4,294 structureless records reached a UNII only by name (1,704
further name matches were rejected because the UNII's structure disagreed); substances whose every
fragment is an ion or solvent keep their own page rather than promoting a counter-ion (deliberate
under-merge against a literal §3.1, listed under suspected-missed-merges); prodrug relations exist only
where the name states the parent.

## Phase 0d — reconciliation with the existing 9,852 (R8)

`data/corpus-20k/reconciliation/`: matched None · new None · existing not found in any new source None.
Dispositions over the 9,852 existing slugs: KEEP None · REDIRECT None (slugs that collapsed into
another existing key; each needs a `medicine_slug_redirects` row, a 301 and the sitemap rebuild in the
same change) · RETAIN None (evidence-bearing records absent from the new sources: botanicals,
supplements, OTC ingredients) · RETIRE_410 None. 55 KEEP slugs sit on held K1/K2 conflicts; 3
unkeyed generic records (calcium-potassium-phosphate-citrate, capsule, juice) are RETAINed for a person.

## Phase 0e — suppression classes (R2)

Tests: `docs/specs/suppression-classes.md`. Executor: `scripts/corpus-20k/suppression/assign.py`.
Over None canonical pages: **suppressed None** (unknown-class 17,663: ChEMBL-only keys with
no ATC, label, listing, warning or register entry — none an existing record), **cleared 9,573**. Suppressed
inside the 803 broad longevity slice: — — largely S6 boxed warnings (metformin's lactic acidosis,
sirolimus's infections and malignancy, the antidepressants' suicidality) and S1 immunosuppressants,
which is the mandate's own criterion; these pages keep every factual field and lose seeds 1, 2 and 6.

| Test | Matched |
| --- | ---: |
| `S1` | 841 |
| `S2` | 40 |
| `S3` | 516 |
| `S4` | 455 |
| `S5` | 78 |
| `S6` | 546 |
| `S7` | 174 |
| `S8` | 316 |
| `S9` | 31 |
| `S10` | 17,663 |
| `S11` | 9,573 |

Gaps the executor stated: no NIOSH list (S4 = ATC L01 + "cytotoxic" label text); no bulk REMS source
(S5 from label text, 78 keys); S2 is DEA-only; S8 reasons from ChEMBL/Open Targets warnings and EMA
status words. S1 narrowed after this run (N01 → N01A) and re-applied at the start of Phase 2.

## Phase 1 — the 20 unreachable compounds, one pass

`data/corpus-20k/recovery/report.md` and `attempts.ndjson` (every avenue, every outcome). TGA, PMDA,
WHO INN and Google Patents were not available (gate not passed). Found 19 of 20; excluded 1
(follistatin-344: a protein isoform with no PubChem, ChEMBL, UNII or register entry after 36 avenues;
PubMed holds literature but no identity record to key a page on).

| Compound | Found | Source | Identifiers | Human evidence | Avenues tried |
| --- | --- | --- | --- | --- | ---: |
| bromantane | yes | PubChem | CID 4660557 · ChEMBL CHEMBL4303520 · UNII N1ILS53XWK | pubmed | 32 |
| cardarine (GW501516) | yes | PubChem | CID 9803963 · ChEMBL CHEMBL38943 · UNII 7I2HA1NU22 | registry | 33 |
| DMT | yes | PubChem | CID 6089 · ChEMBL CHEMBL12420 · UNII WUB601BHAA | registry | 37 |
| follistatin-344 | NO | — | CID — · ChEMBL — · UNII — | pubmed | 36 |
| GHB | yes | PubChem | CID 10413 · ChEMBL CHEMBL1342 · UNII 30IW36W5B2 | registry | 34 |
| isotonitazene | yes | PubChem | CID 145721979 · ChEMBL — · UNII ZFY1ZBQ8AV | none | 35 |
| JWH-018 | yes | PubChem | CID 10382701 · ChEMBL CHEMBL561013 · UNII G391998J57 | registry | 32 |
| kratom (mitragynine) | yes | PubChem | CID 3034396 · ChEMBL CHEMBL299031 · UNII EP479K822J | registry | 36 |
| ligandrol (LGD-4033) | yes | PubChem | CID 44137686 · ChEMBL CHEMBL5170587 · UNII 1EJT54415A | registry | 34 |
| LSD | yes | PubChem | CID 5761 · ChEMBL CHEMBL263881 · UNII 8NA5SWF92O | registry | 34 |
| morning glory (LSA / ergine) | yes | PubChem | CID 442072 · ChEMBL CHEMBL227213 · UNII 073830XH10 | registry | 36 |
| muscimol | yes | PubChem | CID 4266 · ChEMBL CHEMBL273481 · UNII D5M179TY2E | registry | 34 |
| phencyclidine | yes | PubChem | CID 6468 · ChEMBL CHEMBL275528 · UNII J1DOI7UV76 | registry | 35 |
| phenibut | yes | PubChem | CID 14113 · ChEMBL CHEMBL315818 · UNII T2M58D6LA8 | pubmed | 37 |
| phenylpiracetam | yes | PubChem | CID 132441 · ChEMBL CHEMBL348639 · UNII 99QW5JU66Y | pubmed | 36 |
| stenabolic (SR9009) | yes | PubChem | CID 57394020 · ChEMBL CHEMBL1961796 · UNII X5DCA09N30 | pubmed | 34 |
| testolone (RAD-140) | yes | PubChem | CID 44200882 · ChEMBL CHEMBL1672635 · UNII 4O87Q44KNC | registry | 32 |
| YK-11 | yes | PubChem | CID 119058028 · ChEMBL — · UNII Z9748J6B0R | pubmed | 31 |
| sermorelin | yes | PubChem | CID 16132413 · ChEMBL CHEMBL428135 · UNII 89243S03TE | registry | 32 |
| ketamine | yes | PubChem | CID 3821 · ChEMBL CHEMBL742 · UNII 690G0D6V8H | registry | 31 |

## Phase 2 — assembly, extraction and Gate 1 (2026-09-04)

Registry match (`scripts/corpus-20k/registry/match.ts`): 8,775 of 28,966 pages hold at least one
ClinicalTrials.gov registration; 155,671 distinct studies matched; nothing capped (275 pages hold
more than 250 studies, all kept). Model assignment (`scripts/corpus-20k/tiers/assign-models.py`):
LONGEVITY 1,219 (all 803 broad-slice slugs mapped, collapsing to 765 pages after merges; 47 ITP
agents mapped, 15 unmapped and listed), CLINICAL 5,044, DEVELOPMENT 22,703. Withdrawn 439 after the
flag was narrowed (a combination row never flags an ingredient; "cancelled pre-market" is not a
withdrawal; a register sets the flag only with no remaining authorised entry or its own safety
wording), 282 with a stated reason (R11: reasons come from ChEMBL/Open Targets warning toxicity
classes; EMA and Health Canada state none; TGA/PMDA/WHO not cleared).

| Model | Pages | Median present | Extractor limit stated |
| --- | ---: | ---: | --- |
| LONGEVITY (15 fields) | 1,219 | **10** | pathway 61 (mechanism text rarely names the pathway word — amended in Phase 2b); ITP 53; clocks 107; hallmark 581 (abstract sentences) |
| CLINICAL (9) | 5,044 | see report | only 2,278 pages match a single-substance label; interactions 697 (OTC monograph labels carry no interaction section) |
| DEVELOPMENT (8) | 22,703 | see report | patent status never present (Orange Book export carries no patent rows); 3,969 pages without a ChEMBL id take not-applicable on target/mechanism |

LONGEVITY per-field present counts: organism ladder 1,190 · endpoint type 1,191 · human ceiling
1,168 · biomarkers 1,097 · regulatory 959 · ongoing trials 936 · trial failures 887 · dose-response
831 · interactions 715 · FAERS 661 · hallmark 581 · kinetics 524 · clocks 107 · pathway 61 · ITP 53.
Histogram of present fields (0…14): 4, 15, 8, 10, 38, 56, 97, 91, 128, 150, 194, 230, 171, 25, 2.
Europe PMC: 10,728 requests at 3 req/s, sentence-level verbatim matches, abstracts cached
(metadata-only per the gate). Full report: `data/corpus-20k/fields/coverage-report.md`.

**Tiers:** Tier 1 = 1,599 (1,219 longevity + 439 withdrawn − 59 overlap) · Tier 2 = 4,664 ·
Tier 3 = 22,703, of which 17,213 stub (< 3 present fields). Promotion rule:
`data/corpus-20k/tiers/promotion-rule.md`.

**>>> GATE 1: PROCEED.** Tier 1 median 10 of 15 (mean 9.0), above the 8 the mandate sets. Recorded
in state as `gate-1`. Two corrections applied in Phase 2b before Gate 1b, both logged as decisions:
"age-related" alone no longer assigns LONGEVITY (134 macular-degeneration programmes), and pathway
admits cited abstract sentences. A display-name artefact from identity ("Dimethyl" for dimethyl
fumarate) is repaired from the FDA UNII display name.

## Phase 2b — augmentation, derived seeds, questions, Gate 1b (2026-09-04)

Augment: 106 pages left LONGEVITY when "age-related" stopped being a standalone trigger (70 →
CLINICAL, 36 → DEVELOPMENT); pathway present rose from 61 to 680 by admitting cited abstract
sentences; doseStudied present on 1,783 pages (human 1,765 from registry intervention names — the
snapshot holds no arm descriptions; mouse 53 from ITP as written); approvalDate on 2,773 CLINICAL
pages; 2,557 display names repaired from the FDA UNII display name. Models after the recut:
LONGEVITY 1,113 · CLINICAL 5,114 · DEVELOPMENT 22,739; Tier 1 1,500 · Tier 2 4,727 · Tier 3 22,739;
LONGEVITY median still 10 of 15.

**Identity defects the repair exposed (fixed in Phase 2c before any load):** the old slug
`dimethyl` (dimethyl fumarate, Tecfidera) was merged onto UNII L99N5N533T, which is ethane — an
old register name collision; and 951 repairs replaced a parent name with a salt/ester/isotope name
because the page is keyed on that form's UNII while the parent has its own page (Atropine →
Atropine Sulfate, Mometasone → Mometasone Furoate): under-merges among the 4,294 name-keyed
records. Phase 2c recomputes the parent structure from every K1 UNII's own SMILES and merges salt
and solvate forms onto the parent page; esters and isotopologues stay split by structure.

Derived seeds (`data/corpus-20k/derived/fire-counts.json`): 3 failure autopsy 2,807 · 4 endpoint
mismatch 1,058 · 5 stack interaction graph 581 · 8 provenance timeline 2,610 · 9 what would change
this 900 · 10 source contradiction 192 · 12 registry-to-publication gap 6,161 (qualified: "no result
posted", the PubMed check was not applicable) · 13 same-target lineage 2,185 · 14 spontaneous-report
disproportion 974 · 16 trial-size ceiling 8,725 · 17 jurisdiction divergence 184. **Discarded under
the 40-page floor:** 1 bioavailability gap (0: no route on ladder entries — re-tried in 2c from the
sentence's route word), 2 N-of-1 (0: no per-trial N in the aggregate — re-tried in 2c with per-trial
enrolment), 6 time-to-signal (2, both name collisions — stays discarded), 7 sex-specific (0: ITP
cohorts carry no sex-split outcome — re-tried in 2c from publication sentences), 11 animal-only
ceiling (0: the longevity set is human-trial-bearing by construction, so only 22 pages have a
non-human top rung — an honest finding about the set, not a defect), 15 evidence age (aggregate
lacked lastCompletionDate — re-tried in 2c). Suppression leak check: 0.

Questions (`data/corpus-20k/questions/metrics.json`): 10,071 pages carry questions; 43,674 distinct
strings; most-repeated string on 0.21 % of pages ("What became of the other 61 compounds aimed at
TUBB?"); highest template share 30.1 % (trial-size; informational, R7 binds strings); five-gram
Jaccard between question sets of random pairs 0.005 after the tails amendment (0.23 before).
1,682 non-stub pages fire no template (DEVELOPMENT pages holding sponsor/target/mechanism only) —
three DEVELOPMENT templates added in 2c.

**Gate 1b (`data/corpus-20k/gate1b/`).** Overlap-measure fit (median delta 0.0). Positional nearest-neighbour
median, size-matched: 324 draw 0.192 · 803 draw **0.205** · indexed candidates 0.208; all-pairs at
4,562 candidates 0.303 (null model expects 0.622 at that size, 0.366 at 803). Live baseline on the
same text definition (exported fields, not rendered prose — not like-for-like, restated at Gate 2):
803 draw 0.647, 324 draw 0.611. Lexical 0.435 over all candidates, 0.377 at or above the threshold.
Shared-word share 0.156 over the indexed set (Tier 1 0.073, Tier 2 0.136, Tier 3 0.406); prose-only
sensitivity 0.048 — the remainder is field-row labels rendered as text. Pages above 0.30 are thin
(median 4 fields, 257 words), not templated. **Threshold: 7 present fields** — boundary 0.197,
indexed 2,267; Tier 2 below threshold 1,846 (+1,644 with no question) → noindex, reachable,
promotable; 449 Tier 1 candidates below threshold → noindex by the same rule (decision logged: the
mandate's Gate 1b wording binds every tier; they stay Tier 1 pages and promote on more data).
**Provisional PROCEED, re-measured once after the Phase 2c identity merges.**

## Phase 2c — identity pass 2 and the re-measure (2026-09-04)

Identity pass 2 (`scripts/corpus-20k/identity/pass2.py`): parent structures recomputed from every K1
UNII's own SMILES; **23 salt/solvate pages merged** into existing parents (M-SALT-P2), the
`dimethyl` slug split from ethane onto dimethyl fumarate (S-SPLIT-P2, slug kept, nothing orphaned);
118 metal complexes deliberately not stripped to their free ligand; 50 salt forms with no parent
page kept. A literal FragmentParent would have made ~220 chemically wrong merges (lithium carbonate
→ "Carbonate Ion"); the executor blocked any merge whose removed fragment is not a recognised
counter-ion or solvate. Corpus 28,943 pages; Tier 1 1,498 · Tier 2 4,724 · Tier 3 22,721;
LONGEVITY median 10. 214 slug/name collisions listed for review at
`data/corpus-20k/identity/slug-collisions-pass2.json`. Aggregates v3 add lastCompletionDate,
enrolmentMin and per-trial enrolments.

Seeds after the retry: 2 N-of-1 designability now fires 602 (the biomarker shape was unreadable
before; per-trial N ≤ 30 from aggregates v3); 15 evidence age 7,332; 7 sex-specific 36 (literal
word list; the lemma family is admitted in 2d); 1 bioavailability gap stays 0 (only 3 non-human
sentences pair a parenteral route with an oral bioavailability value, all suppressed); 6 and 11
stay discarded. Questions: 59,101 distinct strings; most-repeated 0.21 %; three DEVELOPMENT
templates fire on 7,652 blocks; "Who carried" replaces "Who took" (take-family guard).

**Re-measure: 0.247 at the 803 draw, 0.206 at 324 — did not clear, and the cause is mine.** Seed 15
rendered as its own block on 3,689 of 4,558 indexed pages with a standing second paragraph ("No
later publication is recorded.") and two standing row labels — the shared-sentence failure the
constraints forbid. Sensitivity without that block: pooled 0.2105, threshold 7, boundary 0.200,
indexed 2,266. Fix (Phase 2d): evidence age renders as one value inside the human-data block, never
as a block; three CLINICAL templates cover the 1,653 CLINICAL pages that held only regulatory,
indication or trial-history fields; suppression re-run so ethane carries its own reading.

## Phase 3 — derived content, the table (Fable design; counts from the 2c executor run)

| Seed | Computability (from real coverage) | Fires | Question wording (values in braces) | Suppression |
| --- | --- | ---: | --- | --- |
| 1 Bioavailability gap | needs a non-human positive result with a parenteral route word and an oral bioavailability value; 3 pages, all suppressed | 0 → **discarded** | — | absolute |
| 2 N-of-1 designability | biomarker measured in a human trial + half-life present + a human trial with N ≤ 30 | 602 | "Could one person measure {name}'s effect on {biomarker}?" — body names which of the three facts is missing; no washout number | absolute |
| 3 Failure autopsy | ≥ 2 stopped trials with a registry reason | 2,804 | "{n} of {name}'s trials stopped: {reason clusters}?" | none |
| 4 Endpoint mismatch | human trials' primary outcomes vs the audience endpoint list | 1,057 | "What have human trials of {name} actually measured?" | none |
| 5 Stack interaction graph | shared CYP/transporter across ≥ 2 pages | 581 | "Which other compounds share {name}'s {enzyme} pathway?" (rows, markup) | none |
| 6 Time-to-signal | a publication sentence stating both effect and duration | 2 (both name collisions) → **discarded** | — | absolute |
| 7 Sex-specific divergence | male/female + effect word in ITP publication or ladder sentence | 36 → **discarded** (final; the limit is sentences naming a sex) | "Did {name} act differently in male and female {organism}?" | none |
| 8 Provenance timeline | dated first publication / first non-human / first human trial / approval / current state | 2,607 | "How did {name} get from {first year} to {current state}?" (dated event list; appendable) | none |
| 9 What would change this | an ongoing trial on an audience endpoint | 897 | "Which running trial could settle {name}'s effect on {endpoint}?" | none |
| 10 Source contradiction | exact-field disagreement label vs trial vs literature | 192 | "Where do the label and the trials disagree about {name}?" | none |
| 11 Animal-only ceiling | non-human top rung and no human aging endpoint | 0 → **discarded** (the longevity set is human-trial-bearing by construction; the compounds that "die at mouse" sit in Tier 3 without registry trials — an honest finding about the corpus) | — | none |
| 12 Registry-to-publication gap | completed > 2 years, no posted result | 6,148 | "{n} completed trials of {name} never posted a result — which ones?" (qualified: registry result only) | none |
| 13 Same-target lineage | ≥ 2 pages sharing a mechanism target | 2,181 | "What became of the other {n} compounds aimed at {target}?" (rows) | none |
| 14 Spontaneous-report disproportion | FAERS terms absent from the label's adverse-reaction section | 974 | "Which reactions to {name} are reported but not on its label?" | none |
| 15 Evidence age | last completed human trial date | 7,332 | **a value inside the human-data block** ("the last recorded human test completed in {year} ({NCT})"), never its own block | none |
| 16 Trial size ceiling | per-trial enrolments | 8,709 | "{name}'s trials enrolled {median} people at the median — is anything large?" | none |
| 17 Jurisdiction divergence | ≥ 2 jurisdictions in different statuses (US/EU/CA) | 184 | "Drug, supplement or controlled: what is {name} in {jurisdictions}?" | none (register facts) |
| 18 Human-equivalent dose | — | — | **rejected**: derives a number no source states; reads as dosing | — |
| 19 ITP translation map | ≤ 60 compounds | — | **rejected as a per-compound seed**; one shared reference page `/itp` | — |
| 20 Formulation vs trial form | — | — | **rejected**: duplicate of seed 1 | — |
| 21 Evidence score | — | — | **rejected**: a score is an adjudication and reads as a recommendation | — |

Hard guard applied to every body: what was measured, what the source states, what was not; no
sentence with the reader as subject except seed 2's, which never renders under suppression.

## Phase 2d — fixes, Gate 1b final derivation, integration, and GATE 2 (2026-09-05)

Derivation (`fix-a`): evidence age now a value inside the human-data block; three CLINICAL
templates (11,388 pages with questions, 59,040 distinct strings, most-repeated 0.21 %, five-gram
pair mean 0.004); the standing-sentence audit returned **zero** after four more standing sentences
were removed (kinetics, supervision, dose-studied, provenance without years); seed 7 stays at 36
(the limit is sentences that name a sex, not the lexicon); suppression re-run: suppressed 19,335,
unknown 17,621, cleared 9,608. Gate 1b v3: like for like on v2's pages 0.245 → 0.191 on the pages
no CLINICAL template touches; the threshold rule read as bucket-and-cumulative gives 11 (638
indexed), the cumulative reading gives 7 (2,266, cumulative 0.199). Decision: cumulative reading
with the deploy procedure below. Remaining repeated frames measured, not fixed by the executor
(design): "posted no result" 49.6 %, "jurisdictions record no status for" 32.7 %, the constant
never-cleared list "UK, AU, JP, SG" — fixed by design in 5a (rows, not sentences; the constant
list lives on /definitions).

Integration (`fix-b`): migration 0025 (atc_codes, entity_class, top_rung, human_data,
evidence_tier), loader fills them (on 1,498 Tier 1 pages in a disposable load: ATC 651, entity
class 1,317, top rung 1,272, evidence tier 1,498), class facet uses ATC first-level letters (WHO's
group names were never licensed, so the letter alone is printed), tokens unified, ITP doses only
with a printed unit, search results merge corpus hits (HomeSearch bar and popular row byte-identical
to HEAD), orphan monitor follows the sitemap index and reports click depth, `verify-live.ts` for
Phase 5, home tests rewritten.

**>>> GATE 2: PROCEED** (`data/corpus-20k/gate2/`). Seven samples through the real template on an
isolated production build over a disposable database (load throughput 110 pages/s):

| Sample | Slug | Present fields | Questions |
| --- | --- | ---: | ---: |
| data-rich Tier 1 | metformin | 15 | 17 |
| mid Tier 1 (median) | cysteamine | 10 | 14 |
| withdrawn arc | amlodipine | 13 | 16 |
| suppression class (S1/S3/S4/S6) | sirolimus | 15 | 18 |
| Tier 2 standard | carbidopa-levodopa | 3 | 8 |
| Tier 3 experimental | cdx-3379 | 7 | 6 |
| Tier 3 near-empty stub | 1-2-distearoyl-sn-glycero-3-phosphocholine | 1 | 0 |

| Measure | Value | Rule |
| --- | ---: | --- |
| Positional, indexed set (521 pages at threshold 11), size-matched / all pairs | 0.191 / 0.196 | ≤ 0.20 ✓ |
| **Like for like, HTML, same 803 live medicines: live → new** | **0.799 → 0.279** | the before/after that counts |
| Lexical, indexed | 0.355 | ≤ 0.40 ✓ |
| Shared-word share, indexed set (with / without markup rows) | 0.443 / 0.389 | not near zero: 0.146 function words, 0.111 ISO-date digits, 0.181 clinical vocabulary; like for like 0.796 → 0.236 |
| Distinct question strings / most-repeated share | 7,098 / 0.38 % | < 30 % ✓ |
| Crawl text-to-HTML, indexed median (baseline 8.3 %) | **11.2 %** (samples 4.9–13.6 %) | must rise ✓ |
| Live text-to-HTML (baseline 0.07 %) | 3.2–5.5 % | must rise ✓ |
| RSC payload per sample | 17–152 KB | reduced |
| Contrast body / grey rows | 16.1 : 1 / 4.9 : 1 | ≥ 7 / ≥ 4.5 ✓ |
| Heading order, one h1, keyboard focus, empty elements | ok / ok / 0 missing / 0 | ✓ |
| Suppression (sirolimus): seed 1/2/6 blocks / supervision first | 0 / yes | ✓ |
| FROZEN home search bar boxes at 1440/375/320 | 0.00 px difference | ✓ |
| Horizontal overflow at 320 px | 2 of 7 (long unbroken tokens) | **blocker, fixed in 5a** |

Blockers and defects carried into Phase 5a, all logged as decisions: the loader must strip a NUL
byte in three FDA UNII synonym names and read top-level doseStudied (3,528 pages' field counts
disagreed); overflow-wrap on row labels and synonyms; S10-only pages get a classification block,
not a supervision claim; seed 13 rows de-duplicated; CLINICAL frames become rows and value-broken
phrases; the withdrawn flag must require no remaining active application in the register
(amlodipine); identity pass 3 for structureless salt-named duplicates (Oxytocin acetate); the
copy check's word in the specs; the four-audience report regenerated.

**Deploy procedure for the threshold (decision):** in the disposable build, render the
threshold-7 set through HTML and measure; deploy indexing at 7 if the size-matched cumulative
median ≤ 0.20 and the all-pairs median ≤ 0.30, else at 11 with 7–10 as the promotion criterion.

## Phase 5a — pre-load fixes and the Gate 2 recheck (2026-09-05)

Data and loader: 4 control characters stripped from 3 FDA UNII synonym names; doseStudied (6,171
rows) and approvalDate (5,068) now reach `page_fields`, and the loader's present-field count equals
the measurement's on every one of 28,832 pages; the loader's threshold reader was fixed (it had
silently used the stub floor). Withdrawn rule tightened to "no remaining active application in that
register, or the register's own safety wording, or ChEMBL/Open Targets withdrawn": 438 → 663 (310
gained on the Drugs@FDA every-application-discontinued branch with no stated reason; amlodipine
cleared; the curated WITHDRAWN_MEDICINE class kept as its own ground — guarding it would have
dropped ranitidine, terfenadine and diethylstilbestrol). Identity pass 3 merged 111 structureless
salt-named pages (Oxytocin acetate → Oxytocin), 4 candidates blocked by the moiety rule, 56 with no
parent page and 2 ambiguous listed. Corpus **28,832 pages**: Tier 1 1,719 · Tier 2 4,477 · Tier 3
22,636; models LONGEVITY 1,109 · CLINICAL 5,087 · DEVELOPMENT 22,636; suppressed 19,335.

Template and wording: overflow-wrap on every token cell (all seven samples at exactly 320 px);
S10-only pages get a classification block (254 of 5,858 candidates) while S1–S9 pages keep the
supervision block (1,563); seed 13 rows de-duplicated; regulatory statuses render as rows and the
never-cleared registers sentence lives once on /definitions; the unreported-trials paragraph names
its NCT ids. Standing sentences 0; fixed five-grams above 5 % of indexed pages: 2, both four words.
Seed 7 finally: 36 fires, **discarded** (the limit is sentences naming a sex).

**Gate 2 recheck (`data/corpus-20k/gate2/summary-v2.json`).** Threshold 11 → 636 indexed pages:
positional size-matched 0.188 · all pairs 0.196 · lexical 0.369 · crawl text-to-HTML median 10.9 %.
Threshold 7 → 2,249 pages: 0.202 / 0.256 / lexical 0.453 — misses on two counts, so **indexing
deploys at 11 and 7–10 is the promotion band**, re-measured through live HTML after each tier.
Seven samples: 320 px overflow 0 of 7; suppression and S10 block confirmed; frozen bar 0.00 px;
live text-to-HTML 3.3–5.5 % (baseline 0.07 %); RSC payload still 59–64 % of each document (open
item). `npm run gate`: 14 of 18 stages pass; lint (captured third-party file under `data/` walked by
eslint), copy (the word `harness` in these logs — now replaced), format (nine files) and Playwright
(a 4.31 : 1 small link on the home facet strip) are fixed in Phase 5b's hygiene stage before deploy.
The withdrawn sample slot is refilled (amlodipine is no longer withdrawn).

## Phase 5b/5c — gate green, backup, release, deploy, Tier 1 live (2026-09-05)

Hygiene (`15bc55a`): `npm run gate` 18 of 18 stages green; every facet link on the body ground
raised from 4.31 : 1 to 9.2 : 1 with the existing ink token (palette unchanged, bar untouched);
eslint ignores `data/**`; prettier over 46 source files with `.prettierignore` extended for
generated data; the registry's literal "undefined" stop reason quoted in rows; samples file with
rofecoxib as the withdrawn arc (amlodipine kept as a formerly-withdrawn control).

Backup: `rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom`, 131,165,251
bytes, sha256 f66f8fb0…e4cc, 70 table-data entries; production then held 24 migrations, 9,859
medicines, 5 redirects, a single 10,027-URL sitemap.

Release: GitHub refused the push (ten files over 100 MiB among 3.56 GB of tracked corpus data).
Decision logged: the release carries code, specs, worklogs and small evidence; the corpus data
lives on the workstation (branch `archive/corpus-20k-full-history`, 68 commits; tarball
`rnawiki-backups/corpus-20k-data-2026-09-05/corpus-20k-data.tar.zst`, 1.77 GB, sha256
ea3df0c3…fd4e). Release commit `c0b5057` (317 MB added, largest file 24.7 MB, corpus-20k share
52.8 MB), gate green on the branch, **PR #16** merged after one CI flake (a slow e2e spec burned its
retries against the sign-in rate limit; the re-run was green), **Railway deployment 3ef6829f
SUCCESS, migrations 26**. Verified live with empty corpus tables: legacy pages unchanged, `/sitemap.xml`
now an index, robots allows dossiers, frozen bar 0.000 px, `drug_aliases` digest unchanged.

**Tier 1 live:** 1,719 pages loaded at 14.6 pages/s in 7 checkpointed batches; 215 redirect rows
(the rest target later tiers); `tier-1.xml` 610 URLs, all indexable, none missing; 20 of 20 sampled
redirects 301/308; robots ok; 0 vendor hosts; samples all on the new template with 0 empty elements
and 0 placeholders (metformin 17 blocks, supervision first; cysteamine 14; rofecoxib 11 with the
withdrawal stated; sirolimus 18, supervision first, no seed 1/2/6; amlodipine 16, not withdrawn);
320 px clean; frozen bar 0.0 px. The stage stopped before IndexNow on three defects, all fixed in
Phase 5d before Tier 2: corpus pages emit no JSON-LD (the route returned before the legacy schema
script; all 610 read as not discovery-ready); the IndexNow script is not corpus-aware (it would
have announced 756 withheld URLs and missed 45); 93 of 610 records sit four clicks deep through
letter sub-pages (spec amended: the facet index links letter and page sub-pages inline). Also
found: the loader accepted `--production-confirmed` without enforcing it (fixed before the load);
stale disposable-run markers cannot be told from production markers (hardened in 5d);
`discovery:monitor` exhausts Node's heap on the full index (streamed per child in 5d); the sitemap
cache is 15 minutes, so verification runs after the refresh.

## FINAL REPORT — corpus 20k in production (2026-09-05)

Production numbers supersede every earlier figure in this log; the 29 places where an earlier
section's number no longer matches (pre-pass-3 tier sizes, suppressed totals, seed counts) are
listed in `data/corpus-20k/final/report-figures.json` → `contradictions`. Live measurement:
`data/corpus-20k/final/summary.json` and `report.md`.

### What shipped, per tier

| Tier | Pages loaded | Indexable (≥ 11 present fields) | Suppressed | Load rate | Deployment record |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 Longevity + withdrawn arcs | 1,719 | 610 | 755 | 14.6 pages/s | PR #16 → deployment 3ef6829f; `deploy/tier-1.json` |
| 2 Clinical | 4,477 | 26 | 1,062 | 23.1 pages/s | PR #17 (JSON-LD, corpus-aware IndexNow, three-click facets) → deployment 1d8e7949; `deploy/tier-2.json` |
| 3 Development (noindex, out of every sitemap, not robots-disallowed) | 22,636 | 0 by rule | 17,451 | 42.3 pages/s | `deploy/tier-3.json` |
| **Total** | **28,832** | **636** | **19,268** | | migrations 26; 870 redirects all 308; 0 orphans over 9,859 legacy slugs |

Models: LONGEVITY 1,109 · CLINICAL 5,087 · DEVELOPMENT 22,636. Withdrawn 663 (282 with a stated
reason). IndexNow: Tier 1 610 submitted / 610 accepted; Tier 2 26 / 26; Tier 3 refused by the tool
by design. Live checks per tier: samples 200 on the new template, no empty element, no placeholder
(two substring false positives cleared by word-boundary), suppression sweep (0 seed 1/2/6 blocks on
any suppressed page; supervision first), robots allows dossiers, 0 vendor hosts, frozen home
search bar 0.0 px at 1440/375/320, Tier 3 noindex verified on 10 random pages and by exhaustive
intersection (22,636 URLs against the four sitemap children: empty).

### Before / after, matched sizes (the like-for-like figures)

| Measure | Before (live, same medicines) | After (live, same medicines) | Rule |
| --- | ---: | ---: | --- |
| Positional nearest-neighbour median, 803 draw (798 pages after merges) | 0.799 | **0.278** | — |
| Positional, 324 draw (322) | 0.786 | **0.263** | — |
| Shared-word share (>90 % of pages), 604 medicines | 0.796 | **0.207** | target near zero |
| Crawl text-to-HTML, indexed median | 8.3 % | **10.6 %** | must rise ✓ |
| Live text-to-HTML (innerText/outerHTML), samples | 0.07 % | **3.3–5.5 %** | must rise ✓ |

Indexed set on production (636 pages): positional 0.188 size-matched / 0.196 all pairs (null
model expects 0.363 at that size); p90 0.577; lexical 0.353 / 0.369; shared-word share 0.431 with
markup rows, 0.369 prose-only (function words 0.146, ISO-date digits 0.111, clinical vocabulary
0.181 — not near zero and cannot be); 277 of 636 pages sit above 0.20 (the tail is display-name
collisions and same-target lineage pairs). The deployed pages reproduce the pre-deploy Gate 2
recheck to six decimals. Questions on production: 58,525 distinct strings corpus-wide, most
repeated on 0.55 % of pages; 8,464 on the indexable set, most repeated 0.31 %.

### Indexing threshold and what it did to the legacy population

Derived by measurement (Gate 1b, re-derived through rendered HTML): **11 present fields** — the
2,249-page set at 7 missed on positional (0.202) and lexical (0.453). Consequence, live: the
sitemap announces 636 dossier URLs where it announced 9,852; of the 9,852 legacy slugs, 8,987 map
to a corpus page (588 indexable, 8,399 now `noindex, follow`, all answering 200) and 865 redirect
(308) to their merged parent. **9,264 URLs left the index.** The promotion band (7–10 present
fields) holds 2,365 pages: Tier 2 1,230 (257 / 292 / 369 / 312 at 7 / 8 / 9 / 10; their two
fillable absences are interactions 592 and doseStudied 464), Tier 1 383, Tier 3 752 — but a
DEVELOPMENT page cannot reach 11 on an 8-field model (patentStatus has no cleared source, so the
ceiling is 7); a Tier 3 page promotes only by a **model change**: a register approval or label
(6,706 Tier 3 pages have been dosed in humans; 406 reached registry phase 4, 1,234 phase 3), an
ITP entry, an ageing-condition trial or a cited pathway sentence. This is the one decision left
open for Felix: hold 11, or index the 7–10 band (2,365 pages) knowing the measured medians there.

### Identity (R1)

34,897 source records → 28,832 pages. Merges 4,441 (pass 1: 4,307 — salts 1,854, formulations
1,198, name variants 736, brands 392, codes 112, stereo accidents 15; pass 2: 23 salt/solvate
by parent structure; pass 3: 111 salt-named structureless pages), splits 1,257 (stereo 697,
biosimilars 208, combinations 173, isotopes 133, esters 45; the dimethyl/ethane split), 55 K1/K2
conflicts held for a person. 30 worked examples: `identity/worked-examples.md`. Suspected missed
merges 697 (209 protonation-only structural, 488 nominal groups; 20-row sample in
`report-figures.json`); **the §5.3 rendered-overlap check never ran** and is deferred. 214
display-name collisions listed, unresolved (`identity/slug-collisions-pass2.json`).

### Suppression (R2)

19,268 pages suppressed on production; classes by test (last full run over 28,943): S1 ATC 819 ·
S2 DEA 40 · S3 teratogenicity 516 · S4 cytotoxic 455 · S5 REMS 78 · S6 boxed warning 546 · S7
monitored route 174 · S8 safety withdrawal 316 · S9 depot/insulin 31 · S10 unknown 17,621 ·
cleared 9,608. Seeds 1, 2 and 6 exist on no suppressed page (database trigger plus a live sweep of
487 suppressed pages). 39 Tier 3 pages with S1–S9 classes carry no question block at all and state
the classification in the header only — recorded as thin, not as a breach.

### Derived sections, on production

Fires corpus-wide / on the 636 indexable: 2 N-of-1 designability 600 / 333 · 3 failure autopsy
2,771 / 537 · 4 endpoint mismatch 1,054 / 603 · 5 stack interaction graph 575 / 28 · 8 provenance
timeline 2,574 / 473 · 9 what would change this 890 / 258 · 10 source contradiction 191 / 12 · 12
registry-to-publication gap 6,086 / 626 · 13 same-target lineage 2,164 / 0 · 14 spontaneous-report
disproportion 969 / 33 · 15 evidence age (as a value) 7,257 / 634 · 16 trial size 8,615 / 636 · 17
jurisdiction divergence 182 / 63. Discarded under the 40-page floor: 1 bioavailability gap (no
parenteral-route positive sentence outside suppression), 6 time-to-signal (2, name collisions), 7
sex-specific (36), 11 animal-only ceiling (the longevity set is human-trial-bearing by
construction). Rejected by design: 18 human-equivalent dose, 19 ITP map (a reference page instead),
20 formulation form, 21 evidence score.

### Sources — what each contributed (production `page_sources`, 60,826 rows over 28,623 pages)

Per-kind tables in `report-figures.json` → `sourcesContributed`. In words: ChEMBL supplied the
page universe, structures, phases, mechanisms, ATC and warnings (CC BY-SA, noted per page); the
FDA UNII file is the identity spine (171,912 substances; 0 field rows — identity, not content);
openFDA label/NDC/Drugs@FDA/Orange Book/enforcement supplied indications, kinetics, interactions,
adverse reactions, schedules, routes and marketing status; the ClinicalTrials.gov snapshot
supplied every trial field (155,671 studies matched); Europe PMC supplied hallmark, organism-ladder,
clock, dose-response, pathway and fasting/exercise sentences (11,801 cached queries at 3/s); JAX
MPD supplied the ITP cohorts (53 pages); Open Targets supplied FAERS signals, mechanisms and
targets; EMA and Health Canada supplied register statuses and withdrawal; PubChem resolved 1,927
keyless names. UK, AU, JP and SG statuses are UNKNOWN on every page (registers not cleared);
patent status is never present (Orange Book export carries no patent rows).

**What DrugBank holds that no cleared source supplied** (the open subset is behind a login; the
full set is CC BY-NC 4.0, price unpublished): curated drug–drug interactions (our interactions
field is present on 695 of 5,087 CLINICAL pages — the second blocker in the promotion band);
curated indications (2,422 of 5,087); curated targets and mechanism pharmacology for the 3,971
pages without a ChEMBL id; protein sequences and 3D structures; the curated approved / experimental
/ nutraceutical / illicit / withdrawn subsets (17,306 Tier 3 pages fall to the unknown-class
default; 381 withdrawn pages carry no reason); cross-database links. That is the licence decision.

### Still thin, and why

Tier 3: 17,213 stubs; three quarters of the sampled Tier 3 pages carry no question — the honest
shape of ChEMBL-only records. LONGEVITY: pathway 680, kinetics 524, hallmark 581, clocks 107, ITP
53 of 1,109 (source limits, not extraction gaps). Seed 1 never fires. Withdrawn reasons 282 of
663. The RSC payload is still 59–64 % of every corpus document (live text-to-HTML rose from
0.07 % to 3–5 %; the inline payload remains the next lever). The 214 name collisions and 697
suspected merges await a person. The §5.3 rendered duplicate check is deferred. Seed 7's 36 rows
are stored and render nothing. The legacy `/browse` pager still links 18 of 153 pages (legacy-only
dossiers were unreachable by three clicks before this release and now carry noindex anyway).

### The eight sample pages, live

https://rnawiki.com/d/metformin (data-rich Tier 1, 17 questions, suppressed by boxed warning) ·
https://rnawiki.com/d/cysteamine (median Tier 1) · https://rnawiki.com/d/rofecoxib (withdrawn
arc) · https://rnawiki.com/d/sirolimus (suppression class) · https://rnawiki.com/d/carbidopa-levodopa
(Tier 2, noindex) · https://rnawiki.com/d/cdx-3379 (Tier 3) ·
https://rnawiki.com/d/1-2-distearoyl-sn-glycero-3-phosphocholine (Tier 3 stub) ·
https://rnawiki.com/d/amlodipine (formerly-withdrawn control).

### Records

Backup `rnawiki-backups/corpus-20k-2026-09-05/` (sha256 f66f8fb0…); data tarball
`rnawiki-backups/corpus-20k-data-2026-09-05/` (1.77 GB, sha256 ea3df0c3…); full commit history on
local branch `archive/corpus-20k-full-history`; production loads checkpointed under phase 5 in
`data/corpus-20k/state.json` with database-fingerprinted markers under `data/corpus-20k/load/`.

## Risk register (binding; resolved in the phase named)

R1 identity (0c) · R2 safety suppression (0e; sections 1, 2, 6 never render in a suppression class;
unknown class defaults in) · R3 overlap at scale (MinHash/LSH candidates + exact scoring, validated
against the 324-record exhaustive result within 0.02; report matched-size and size-adjusted
figures) · R4 three field models, coverage judged within a model · R5 bulk first, projected calls
under 50,000 · R6 Tier 3 noindex + out of sitemap + NOT robots-disallowed, sitemap index, few
inbound links · R7 questions derived deterministically from data shape and values, no single string
on more than 30% of pages · R8 reconcile by canonical key before insert, never orphan an indexed URL ·
R9 per-field source date + last-verified date, cadence designed not built · R10 relations as markup
never prose · R11 withdrawn compounds verified against free sources, reasons coverage reported ·
R12 every indexed record within 3 clicks of home, faceted entry points · R13 tier-by-tier deploys,
throughput measured · R14 Singapore MASA/HSA: no vendor links, no promotion, prescription status as
register fact · R15 Tier 3 honest and minimal, stubs under 3 fields.

## Constraints (binding through deployment)

FROZEN home search bar. Uniqueness positional ≤ 0.20, lexical ≤ 0.40 per R3; repeated elements are
markup; shared sentences on ONE linked page; absent data renders nothing; section order from
available data. Editorial: report what was studied, never a protocol or dose; every finding names its
organism; verbatim values; stopped trials get the registry reason only; no vendor links; R2 overrides.
Legal gate before every new fetch. Decline all consent banners. Report both text-to-HTML figures
(crawl 8.3% baseline; live 0.07% baseline) at every structural change.

## Model routing

Opus: identity execution, fetches, ingestion, extraction, counting, validation, capture, overlap
execution, question derivation execution, rendering, CI/deploy. Fable: R1 rule design, derived
content design, question derivation rule design, conflicting-evidence calls, disclosure spec, final
synthesis. Default down.

## Log

- 2026-09-04 — Phase 0a/0b survey landed (`a0a00bd`); R1, R2 and field-model specs fixed (`034a438`, `c6f1438`); Wikiwand's eight captures verified (11 confirmed, 9 qualified, 20 added; `data/design-study/findings/wikiwand.*`) — measured question block: 21×22 px blue badge in the left margin, sticky while its answer scrolls; serif question heading; 1 px hairline the width of the 344 px measure; exactly two sans paragraphs; provenance anchor per paragraph as `#Section`; the date lives in the page header and on cards, never inside a block.
- 2026-09-04 — scaffolding; closed decisions recorded; Atlas Obscura captures deleted; Wikiwand's
  eight supplied captures copied to `data/design-study/captures/wikiwand/` with a manifest.
