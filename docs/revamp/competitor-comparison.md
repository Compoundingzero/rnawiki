# What the reference works do, and what it says about RNAWiki

Measured 2026-09-18. Section lists and word counts were fetched from each site, not recalled. RNAWiki's
own numbers come from `scripts/dossier-v4/verify-reader-layer.ts` and the reader-text method it uses
(the audit layer cut at `id="technical-record"`, the body of every closed `<details>` removed).

## What could actually be compared

| Source | Fetched | Result |
| --- | --- | --- |
| MedlinePlus | yes | 2,071 words for metformin, 11 sections |
| NHS medicines | yes | 1,339 words for metformin, task-led sections |
| Wikipedia | yes, via the section API | Metformin 41 sections, Creatine 34, Semaglutide 46 |
| RxList | yes | 6,672 words, label prose |
| PubChem | identity API only | CID, formula, weight, SMILES, IUPAC name |
| DrugBank | no | HTTP 403 |
| GoodRx | no | HTTP 403 |
| PubChem web page, ClinicalTrials.gov | no | JavaScript-only, returned 8 and 24 words |

So the useful comparators are MedlinePlus and NHS, which are the two written for a member of the
public, plus Wikipedia for structure and RxList for professional depth.

## The competitor skeletons, verbatim

**MedlinePlus, metformin — 2,071 words:**

> IMPORTANT WARNING · Why is this medication prescribed? · How should this medicine be used? · Other
> uses for this medicine · What special precautions should I follow? · What special dietary
> instructions should I follow? · What should I do if I forget a dose? · What side effects can this
> medication cause? · What should I know about storage and disposal of this medication? · In case of
> emergency/overdose · What other information should I know? · Brand names · Brand names of
> combination products

**NHS, metformin — 1,339 words:**

> How to take metformin (Important · If you miss a dose · If you take too much) · Side effects (Common
> · Non-urgent advice: speak to a pharmacist or doctor if · Serious) · Who can and cannot take it
> (Breastfeeding · Pregnancy) · Taking metformin with other medicines, food and drink (Food and
> alcohol) · Find out more about your medicine

**Wikipedia** — the sections that matter here: Creatine carries **Dosing** (loading phase, maintenance
phase, absorption); Semaglutide carries **Economics** (cost, coverage and supply, by country),
**Legal status**, **Compounded versions** and **Counterfeits**; all three carry a **History** section.

The pattern is unambiguous. **MedlinePlus and NHS are organised by what the reader has to do.
RNAWiki is organised by where each sentence came from.** Both are legitimate, and they are not the
same product: the reader's tasks are the same on every page in a way that the evidence is not, which
is why every consumer reference leads with the same list and RNAWiki answers almost none of it.

## Per task, who answers a beginner

| The reader's task | MedlinePlus | NHS | Wikipedia | RNAWiki |
| --- | --- | --- | --- | --- |
| What does it do / why is it used | yes | yes | yes | **yes** |
| How is it taken | yes | yes | partly | yes |
| What if I miss a dose | yes | yes | no | **no** |
| What should I avoid — food, alcohol, other medicines | yes | yes | yes | partly, as substance pairs |
| What side effects, and which need action | yes | yes | yes | **yes**, with provenance |
| Storage | yes | no | no | **no** |
| Emergency or overdose | yes | yes | yes | **no** |
| What it is sold as / brand names | yes | no | yes | **no — the data exists and is hidden** |
| Cost and coverage | no | no | yes | **no** |
| Legal status | no | yes | yes | **yes** |
| Is the substance actually in my product | no | no | no | **yes** |
| What was measured, in whom, and what it does not settle | no | partly | partly | **yes** |
| What nobody knows yet | no | no | no | **yes** |
| A receipt for every sentence | no | no | no | **yes** |
| What was searched and not found | no | no | no | **yes** |

## Where RNAWiki is already ahead, and should not copy anyone

Every one of the twenty sources in the brief is a summary someone wrote. None carries a per-sentence
receipt, three visibly different tiers of result, a stated limit beside every result, a consolidated
block naming what was searched and not found, or a per-substance identity check. That is the product.
It is also why the writing quality is not the problem: at a mean of 8.5 words per sentence, a median
of 7 and nothing over the 30-word hard fail, the prose is already at or better than MedlinePlus.

**The gap is coverage of reader tasks, not readability.**

## The volume problem, measured

| Page | Reader-facing words |
| --- | --- |
| RNAWiki creatine monohydrate | 5,871 |
| RNAWiki semaglutide | 5,802 |
| RNAWiki 1,2-hexanediol, after the thin-record fix | 706 |
| MedlinePlus metformin | 2,071 |
| NHS metformin | 1,339 |

RNAWiki says roughly **2.8×** what MedlinePlus says about a drug. The extra is provenance and
evidence detail, which is the point of the site, but it means a beginner has to work harder to find
the four answers they came for.

## Ranked, with the measurement behind each

| # | Change | Evidence | Effort |
| --- | --- | --- | --- |
| 1 | **Brand and product names in the reader layer — shipped this turn.** Semaglutide now reads "Ozempic, Rybelsus, Wegovy, Kayshild, Kyinsu" under the identity strip. | 29,339 brand rows in `page_synonyms`; on the live metformin page "Glucophage" appeared 11 times and **0** of them were reader-visible. MedlinePlus makes it a top-level section. | Done |
| 2 | **A reader-task block** answering how it is taken, what to avoid, and what to do about a missed or doubled dose | Every consumer reference leads with these; RNAWiki answers none. `privacy-and-medical-safety-boundaries.md` already sets the limit: no individualised prescription dosing, clinician-question framing for supervised substances. | Medium, policy-bounded |
| 3 | **Cost and coverage** | Wikipedia gives semaglutide a whole Economics section; GoodRx and Cost Plus exist for nothing else. No price appears anywhere on RNAWiki. | Data work |
| 4 | **Counterfeits and compounded products** | Wikipedia carries both for semaglutide specifically. A biohacker buying peptides or GLP-1s meets this risk first and RNAWiki states it nowhere in the reader layer. | Data work |
| 5 | **Storage**, where it decides whether the product works | MedlinePlus has it; semaglutide needs a cold chain, creatine degrades in solution. | Data work |
| 6 | The 1,301 pages with no human evidence that still serve ~280 reader sentences | See `docs/revamp/beginner-page-upgrades.md`. | Medium |

## What I deliberately did not recommend

- **Copying Wikipedia's Dosing sections.** For a prescription or controlled substance that breaks
  `docs/privacy-and-medical-safety-boundaries.md`, which is a deliberate safety boundary and not an
  oversight. For a supplement the policy already allows a label-recorded amount inside the
  deep-evidence layer; promoting it into the reader layer would be a policy decision for the owner,
  not a gap to close by copying.
- **Copying MedlinePlus's task skeleton wholesale.** It is written for a patient under a prescriber.
  A biohacker self-experimenting needs the limits and the provenance, which RNAWiki already gives and
  MedlinePlus does not.
- **Adopting RxList's volume** (6,672 words of label prose) or **DrugBank's field dump**. Both are
  worse for a beginner than what is already there.

## How to reproduce

```bash
# Competitor section lists — small, stable, and the reason these are quotable.
#   https://en.wikipedia.org/w/api.php?action=parse&page=Metformin&prop=sections&format=json&formatversion=2
#   https://medlineplus.gov/druginfo/meds/a696005.html
#   https://www.nhs.uk/medicines/metformin/

# PubChem identity for one compound.
#   https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/metformin/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON

# RNAWiki's own numbers, per page, including whether a brand name reaches a reader.
npx tsx --tsconfig tsconfig.render-scripts.json \
  scripts/dossier-v4/verify-reader-layer.ts metformin semaglutide creatine-monohydrate

# The synonym kinds behind the brand line.
psql -d rnawiki_indexing_audit_20260913 -c "select kind, count(*) from page_synonyms group by kind order by 2 desc;"
```
