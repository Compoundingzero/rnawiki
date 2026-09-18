# Unblocking the missing fields

Follow-up to `docs/revamp/competitor-comparison.md`, whose ranked list marked four reader tasks as
"data work". That verdict was wrong for three of them, and this note corrects it with the rows.

## The answer

**Three of the seven blocked recommendations are not blocked.** The label text is already on disk,
already through the source legal gate, and being read by nobody.

`data/sources/openfda-label/mapped.parquet` holds 124,706 rows of DailyMed Structured Product Label
text under **CC0 1.0 Universal (public domain dedication)**. The `licence` column says so on every
row, not merely in the metadata. Read on 2026-09-18:

| Label section | Rows | Pages | Reader task it answers |
| --- | --- | --- | --- |
| `indications_and_usage` | 30,069 | 2,354 | what it is for |
| `clinical_pharmacology` | 15,775 | 1,861 | how it works |
| `warnings_and_cautions` | 12,404 | 1,638 | **what to watch for** |
| `contraindications` | 12,150 | **1,872** | **who must not take it** |
| `use_in_specific_populations` | 11,672 | **1,609** | **pregnancy, breastfeeding, children, older adults** |
| `drug_interactions` | 11,258 | 1,413 | what it mixes with |
| `pharmacokinetics` | 10,396 | 1,635 | how long it lasts |
| `overdosage` | 8,251 | **1,351** | **what to do if too much is taken** |
| `boxed_warning` | 5,563 | **726** | **the most serious warning the regulator prints** |
| `mechanism_of_action` | 4,995 | 1,608 | how it works |
| `cyp_profile` | 2,173 | 546 | what changes its breakdown |

Only three of those eleven ever became a page field. Every `page_fields` row in the corpus was
enumerated, and the label sections that reach a page are exactly:

```
mechanismClass | 22636
interactions   |  6196
indication     |  5087
```

So `overdosage`, `contraindications`, `warnings_and_cautions`, `use_in_specific_populations` and
`boxed_warning` are **extracted, counted, licence-cleared, on disk, and unreachable from a page.**

This matters most for the audience. A beginner biohacker's first three questions after "what does it
do" are the ones every consumer reference leads with and RNAWiki answers none of:

- **What if I take too much** — MedlinePlus's "In case of emergency/overdose"; held for 1,351 pages.
- **Who must not take it** — NHS's "Who can and cannot take it"; held for 1,872 pages.
- **Pregnancy, breastfeeding, children, older adults** — NHS puts these in that same section; held
  for 1,609 pages.
- **The boxed warning** — the single most safety-critical sentence a regulator prints, held for 726
  pages including metformin's lactic-acidosis warning.

## The catch, which is the real work

The held text is raw SPL prose and **cannot go on the page as it stands**. Verbatim samples:

> `["4 CONTRAINDICATIONS FOLLISTIM AQ Cartridge is contraindicated in women and men who exhibit: Prior
> hypersensitivity to recombinant hFSH products … High levels of FSH indicating primary gonadal
> failure … (see Warnings and Precautions (5.2, 5.3))"]`

> `["10 OVERDOSAGE Aside from the possibility of Ovarian Hyperstimulation Syndrome [see Warnings and
> Precautions (5.2 , 5.3) ] and multiple gestations [see Warnings and Precautions (5.5) ] …"]`

> `["8 USE IN SPECIFIC POPULATIONS Lactation: It is not known whether this drug is excreted in human
> milk. ( 8.2 ) 8.1 Pregnancy Risk Summary …"]`

Section numbers, cross-references and a register a beginner cannot read. `docs/dossier-v4-plain-language-contract.md`
sets a hard limit of 30 words per sentence and forbids internal keys in the reader layer, so raw label
text fails the contract by construction.

**So the work is not plumbing.** It is a translation layer with a per-sentence source binding, which
is what the rest of this page already does for statements. Surfacing the paragraphs untouched would
add exactly the slop the last three releases removed.

## What is still genuinely blocked, and what would unblock it

| Field | Status | What unblocks it |
| --- | --- | --- |
| Storage | Text was never extracted. `storage_and_handling` is absent from the mapped 11. | **`dvc pull` the raw labels**, which needs `B2_KEY_ID`/`B2_APP_KEY` or `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY` — the same credentials already recorded as missing in `docs/revamp/BLOCKERS.md`. The raw JSONs on disk are DVC pointers (1 MB), not data. Alternatively amend the brief, which currently forbids refetching the fourteen openFDA partitions. |
| How it is taken / missed dose | `dosage_and_administration` is not extracted. | Partly a **policy** decision, not a data one: `docs/privacy-and-medical-safety-boundaries.md` says the page never generates individualised prescription dosing. For supplements the same doc already allows a label-recorded amount inside the deep-evidence layer. |
| Cost | No field, no source in the corpus. | A new source through the existing gate. NADAC (US National Average Drug Acquisition Cost) is a US-government public-domain dataset and is the credible route; Cost Plus Drugs publishes prices but needs its terms checked first. |
| Counterfeit and compounded products | No field. | There is a `withdrawn` source and a `regulatory` field already; a plain-language risk line could be derived for the classes where it is real (GLP-1s, peptides) rather than fetched. |
| Substance-type classification | Cosmetic and supplement records classed as prescription medicines. | Corpus curation. An automatic rule would risk mislabelling medicine, so it needs a reviewed pass, not a script. |

## The path, with commands

```bash
# 1. A parquet engine. None is installed: pandas is present but pyarrow, fastparquet, polars and
#    duckdb are not, and the repository's own .venv-corpus has been deleted. The repository's
#    convention is a venv at the repo root.
python3 -m venv .venv-corpus
.venv-corpus/bin/pip install pyarrow

# 2. Confirm the five unused sections and their page counts.
.venv-corpus/bin/python - <<'PY'
import pyarrow.parquet as pq, collections
t = pq.read_table('data/sources/openfda-label/mapped.parquet')
pages = collections.defaultdict(set)
for f, k in zip(t.column('field').to_pylist(), t.column('key').to_pylist()):
    pages[f].add(k)
for f in ('overdosage', 'contraindications', 'use_in_specific_populations',
          'warnings_and_cautions', 'boxed_warning'):
    print(f, 'pages:', len(pages[f]))
print('licence:', set(t.column('licence').to_pylist()))
PY

# 3. Then, in order: extend the field mapping so those five surface, build the plain-language layer
#    with a source binding per sentence, add the reader-layer blocks, and re-run the corpus
#    validation and the full gate before deploying.
```

## Order I would choose, for this audience

1. **Boxed warning and contraindications first** (726 and 1,872 pages). They are the two places where
   a beginner biohacker can be harmed by not knowing, and both are short, high-signal text.
2. **Overdosage** (1,351 pages). The question a frightened person asks at 2am.
3. **Use in specific populations** (1,609 pages). Answers "was this studied in someone like me",
   which is the question the site already exists to answer honestly.
4. Warnings and cautions last: longest text, most translation effort, most likely to become slop.
