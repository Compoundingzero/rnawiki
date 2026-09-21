# Why a medicine page cannot carry content

Written 2026-09-21 after tracing one page end to end. This is the answer to "why can't the page be
launched with the content it needs", and it is not a rendering problem.

## The chain, traced on creatine

`creatine-monohydrate` is the flagship beginner-biohacker substance. Its live page is 11,777 bytes
and leads with:

> **No source-linked answer for this substance**
> This record cannot yet connect a use, a measured human result or a path through the body to an
> inspectable source.

Measured on that record with `scripts/dossier-v4/verify-reader-layer.ts`:

```
substance.empty   : true (score 0)
hero statements   : simpleAction:contract_sentence/0url  whyPeopleCare:absent/0url
                    actionDetail:absent/0url             bodyLocation:absent/0url
human evidence    : 0 curated cards, 0 registry snapshots
```

A page needs one of **three** things to say anything. All three are closed for this record, and for
every supplement and botanical in the corpus:

| Route to an answer | What it requires | Why it closes |
| --- | --- | --- |
| A recorded label sentence | `recordedBackground.mechanism` or `.uses` with a `citation.url` | Creatine's `recordedBackground` has no `mechanism` and no `uses` key at all. It holds `labelPresence`, `productListing`, `registryIdentifiers`, `sourceMaterial`, `supplementIngredient`, `supplementMarket`. A supplement has no FDA label to quote. |
| A registry-matched trial | `humanResults.trialSnapshots` — an NCT id plus a registry role that supports a tested claim | Creatine's studies are pre-registry: Harris 1992, Greenhaff 1994, Volek 1999. There is no NCT id to match, so the card builder at `lib/dossier-v4/view-model.ts:1491` drops every one of them. |
| A reviewed claim | `origin === 'reviewed_claim'` with a result scope | `reviewed_claims == 0` for all 10,250 pages. This route has never been taken by any record. |

Score 0 means `substance.empty`, which means "no source-linked answer", which also means the page is
not offered to a search engine.

## The root cause is a missing field, not missing effort

The obvious repair is to let a curated trial answer the page. It cannot be done:

```ts
export interface ClinicalTrialRecord {
  trialId: string
  phase: string
  sampleSize: number
  primaryEndpoint: string
  endpointStatus?: 'met' | 'not_met' | 'not_reported'
  endpointMet: boolean
  statisticalPValue: string
  unreportedAdverseSignals?: string
  independentReplicationStatus: 'Replicated' | 'Partially Replicated' | 'Unreplicated' | 'Failed to Replicate'
}
```

**There is no citation field.** Not a DOI, not a URL, not a study label. A curated trial record is
structurally incapable of being source-linked, so no amount of code can make it count as an answer.
The data model enforces Codex's rule — "a DOI somewhere in the legacy bibliography does not bind a
particular authored sentence to that paper" — by making the binding impossible to express.

That is why every code change I shipped this session removed noise rather than added substance: there
was no unused evidence in the render path to surface. The evidence is absent one layer down.

## The constraint that decides how this can be fixed

`railway.toml` is explicit, in the repository's own words:

> Medical evidence is never written by the automatic deployment hook. A reviewed corpus transition is
> a separate operator action with exact expected-value digests, row locks, and an idempotent replay
> check.

So the deploy is allowed to write **schema**, **`drug_aliases` via `apply:name-index`**, and
**agent packages**. It is forbidden from writing a medicine fact.

That produces the asymmetry the user has been feeling:

- **Re-rendering existing data is deployable.** Every fix shipped this session was this kind: the
  registry-name dump folded, the dose question that contradicted its own page suppressed, the
  duplicated sentence removed, brand names moved into the reader layer.
- **New facts are not deployable.** A citation on a trial, a new substance row, label section text —
  each needs a reviewed corpus transition run by an operator against production, which no deploy and
  no local run here can do.

## What is genuinely available, in order of value per unit of work

### 1. A citation field on the trial model — unlocks the largest population

Add `citation?: { label: string; url: string }` to `ClinicalTrialRecord`, populate it from the
bibliography the curated seed data already carries per study, then let the card builder accept a
cited trial without an NCT id and let `assessRecordSubstance` count it. Every supplement and botanical
with a curated study gains an answer.

- Code: small. Data: a binding pass over the curated trials. Ship: **needs a corpus transition.**

### 2. The five label sections already extracted and unsurfaced

`data/sources/openfda-label/mapped.parquet` is **in the repository and ships with every deploy**, and
it is CC0 on every row:

| Section | Rows | Pages |
| --- | --- | --- |
| `contraindications` | 12,150 | 1,872 |
| `warnings_and_cautions` | 12,404 | 1,638 |
| `use_in_specific_populations` | 11,672 | 1,609 |
| `overdosage` | 8,251 | 1,351 |
| `boxed_warning` | 5,563 | 726 |

Only `mechanismClass`, `interactions` and `indication` ever became page fields. This is the one large
body of real, licence-cleared, deployable content that no reader can reach.

- Code: a parquet reader in the pipeline plus a translation layer, because raw SPL prose fails the
  plain-language contract (section numbers, `[see Warnings and Precautions (5.2, 5.3)]`).
- Ship: **deployable**, because the file itself already ships.

### 3. The curated mechanism the page stopped reading

`drugs.mechanism_steps` holds creatine's real mechanism prose, including the 5 g dose that the page
still prints. The hero no longer reads it, because it is authored prose without a sentence-level
binding. Rendering it under an origin label that says exactly that — authored, not quoted — is honest
and is a re-render of existing data.

- Code: small. Ship: **deployable.**

### 4. The goal index

`page_registry_aggregate` is empty against 326,420 rows in `page_registry_studies`, and the
`conditions` needed to map a trial to a goal are absent from the study table, from the clinicaltrials
mapped parquet (eight `registry.*` fields, no conditions) and from the completion snapshot. So this
needs a fetch from ClinicalTrials.gov before it can be materialised.

## What I would not do

- **Loosen `sourceBound`.** Verified unnecessary: metformin's statements are `stored_source` with URLs
  and its page answers. The gate works. The records that fail it fail for lack of a source, not for
  lack of a rule.
- **Render raw label text.** A boxed warning is the highest-value text in medicine and also the most
  dangerous to paraphrase. It needs the translation layer and a per-sentence source binding, or it
  becomes the slop this work exists to remove.
- **Invent an answer for a record that has none.** The current honest "no source-linked answer" state
  is correct for 2,436 pages; the fix is to give the other records a citation, not to soften the
  wording.
