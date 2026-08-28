# Recorded background data

The `medicine-background/v1` layer fills the dossier sections the wireframe shows but the corpus
could not honestly support: how a medicine works, its chemical identity, the enzymes and
transporters that handle it, what its source warns about, which groups the source does and does
not answer for, the reactions reported most often, pharmacokinetics, studied escalation schedules,
product variants, recorded price context, the systemic body map, main-study eligibility and exact
results, and registry identifiers. It lives in `drugs.recorded_background` (migration 0016).

The corpus has two tiers, and they are never presented as the same thing:

- **Curated** (155 medicines) — hand-authored TypeScript batches under
  `scripts/seed-data/background/`, where a person selected and checked each value.
- **Extracted** (5,881 medicines) — `extracted-background.generated.ts`, produced by the
  deterministic parser in `lib/background/label-extraction.ts`. Nobody has checked these, and the
  dossier says so on the page.

Curated always wins on a shared slug. `ALL_RECORDED_BACKGROUND` is the merged corpus; the merge
and its precedence are pinned by `tests/unit/background-corpus-merge.test.ts`.

## Why this dataset is hard to reproduce

The values themselves are public. The discipline around them is the product:

1. **Fetched, never remembered.** Authoring starts from artifacts pulled by
   `scripts/background/fetch-medicine-sources.ts` (openFDA label sections, PubChem, RxNorm) plus
   per-record ClinicalTrials.gov and PubMed fetches. Every numeric value stores the exact fetched
   excerpt that contains it, and Group I of RNA Intelligence verifies number-in-excerpt
   mechanically. A number that was typed from memory cannot pass validation.
2. **Context is part of the value.** Every measurement names who and what it was measured in.
   A bare number fails validation.
3. **Disagreement is data.** Each value carries a concordance state — label-only, corroborated by
   literature, or discrepant with both readings recorded. Publishing the disagreement is the
   honesty competitors skip.
4. **Derived sentences are arithmetic, not prose.** Steady-state notes and cross-currency
   normalizations are produced by the functions in `lib/background/derivations.ts` and re-computed
   by the engine; a mismatch fails validation.
5. **The body map cannot lie.** Authors record region codes from the fixed vocabulary in
   `lib/background/anatomy-regions.ts`; drawing coordinates belong to the vocabulary, so no
   position is ever guessed from free text.

## Boundaries

- These modules are medicine-wide **background**, never a reviewed programme conclusion. Every
  rendered row repeats that frame.
- Amounts and schedules are recorded exactly as the label or trial protocol states them, as
  research context. Group I rejects advice- and commerce-shaped phrasing outright.
- A module a source does not support is absent. A medicine with only registry identifiers is a
  complete, honest entry.
- Excerpts stay under 400 characters: enough to verify a value, never a reproduction of the
  source document.

## Engine

`runBackgroundIntelligence` (`lib/rna-intelligence/background-rules.ts`, version
`rna-intelligence/background-1.4.0`) checks structure only: envelope version, source-identifier
shapes per kind, ISO dates, excerpt length, number-in-excerpt, measurement context, plausibility
ranges by value type, contiguous schedule steps, controlled vocabularies (jurisdictions,
currencies, price types, anatomy regions), derivation equality, concordance/alternate pairing,
registry-identifier shapes, and the forbidden-guidance scan.

Version 1.1.0 adds the checks the quoted modules need. A `RecordedStatement` must match its source
excerpt character for character — that equality is what lets a mechanism sentence or a boxed
warning carry the label's own "patients should be monitored" without the forbidden-guidance scan
rejecting the source's voice as though it were ours. The scan still applies in full to every field
RNAWiki writes in its own voice. Named mechanism targets, interaction counterparties and
adverse-reaction terms must each appear in the recorded excerpt, extending to words the guarantee
that already covered numbers.

Every code has a focused executable case in
`tests/unit/rna-intelligence/background-rule-coverage.test.ts`. People judge meaning; this group
never does.

## Commands

- `npm run check:medicine-content` — validate every envelope (part of `npm run gate`).
- `npm run apply:background` — validate, then write envelopes onto their medicine rows by slug.
  Touches only `recorded_background`; re-running is always safe; unknown slugs are skipped, never
  created. Run it against production after a deploy that adds batches:
  `DATABASE_URL=<production url> npm run apply:background`.
- `npx tsx scripts/background/fetch-medicine-sources.ts <outDir> <slug[:query]> …` — fetch
  authoring artifacts.

## Keeping it current — the freshness loop

`npm run verify:background` re-fetches every cited source and mechanically re-checks the stored
excerpts against the source's current text. No model sits anywhere in this loop. Each excerpt
resolves to one of five states:

- `current` — the excerpt still appears verbatim in the live source.
- `numbers_current` — the excerpt was stitched or the source was reformatted, but every recorded
  number still appears in the live source. The dataset's promise holds.
- `drifted` — a recorded number no longer appears in the live source. This is a work item: the
  output names the exact slug, module path and source so a person re-authors that entry from a
  fresh artifact. Drift never rewrites anything automatically.
- `unreachable` — the source could not be fetched on this run.
- `unverifiable_kind` — the source kind has no stable machine-readable endpoint (NICE/BNF, NADAC,
  EMA, DOIs); those entries rely on the authoring-time artifact.

The script exits non-zero on drift (pass `--report-only` to just report), so it can run on a
schedule beside the ClinicalTrials source-sync worker and page the operator the same way. This is
what keeps the dataset self-updating without generated prose: sources move, the loop detects the
exact entry that moved, and a person re-records it.

## The companion dataset: computed molecular properties

`molecular-properties/v1` (`lib/background/molecular-properties.ts`) holds PubChem's computed
descriptors — formula, weight, XLogP lipophilicity, hydrogen-bond counts, polar surface area,
rotatable bonds, complexity, SMILES, InChIKey — for every recorded medicine that carries a PubChem
CID in its `registryIdentifiers`.

Nothing in it is authored. `npm run build:molecular` fetches each record by the CID the verified
background layer already holds and regenerates
`scripts/seed-data/background/molecular-properties.generated.ts` wholesale, so refreshing is
re-running the script and `git diff` is the change report. There is no wording to structure and no
judgement to make, which is why this dataset needs no engine of its own: a test asserts it can
never introduce an identifier the verified corpus does not hold.

It exists for the chemist's and biotech researcher's view — chemical space, property distributions,
and an arithmetic rule-of-five summary that always reports its four components and never a verdict
on a molecule. Antibodies and peptides without a computed PubChem record are simply absent rather
than approximated.

## Extraction at corpus scale

Hand-authoring reached 155 medicines. Extraction reaches thousands because it inverts the usual
order: the parser finds a value inside a sentence and stores _that sentence_ as the excerpt, so the
number-in-excerpt guarantee holds by construction, with no model in the loop and nothing to
hallucinate.

The pipeline is two steps:

1. `scripts/background/index-openfda-labels.py <archiveDir> <out.ndjson> [medicineRows.json]` —
   reduces openFDA's bulk label archive (14 partitions, ~262k labels, one download from
   <https://api.fda.gov/download.json>) to the sections the extractors read. It runs in Python
   because a decompressed partition exceeds the longest string a Node process can hold. Passing the
   medicine list filters to labels the corpus can reach, which is what makes the wider section set
   affordable.
2. `npx tsx scripts/background/build-extracted-background.ts <index.ndjson>` — matches medicines to
   labels by generic, brand and substance name, extracts, and writes the generated file.

Two boundaries are absolute: a curated record is never overwritten, and every extracted envelope
must pass Group I before it is written. An extraction that produced something structurally wrong is
dropped, not published.

What the parser refuses is as load-bearing as what it records, and each refusal is pinned by a test
in `tests/unit/label-extraction.test.ts`:

- A **free fraction is never recorded as protein binding.** Losartan's label states "free fractions
  of 1.3%" for a medicine that is 98.7% bound; capturing it would invert the value. The parser skips
  rather than doing arithmetic the label did not print.
- A **per-kilogram volume keeps its unit.** "0.14 L/kg" is never stored as "0.14 L".
- A **sentence with two candidate quantities is skipped.** Two numbers in one sentence is exactly
  the ambiguity the parser will not resolve on its own.
- A **half-life stated in days gets no invented hour figure.** It is recorded for display and stays
  off every numeric axis.
- An **implausible magnitude is dropped**, because a 900% bioavailability means the pattern matched
  the wrong quantity.
- An **interaction role is attached only when one sentence states exactly one role.** Interaction
  prose routinely names two at once, and deciding which attaches to which counterparty is judgement
  the parser does not have.
- **Per-event adverse-reaction percentages are never parsed out of label tables.** Only the
  threshold and list a source prints in a single sentence are recorded, because pairing a number to
  an event across table text would put a wrong frequency on a real harm.

## The attribution guarantee

The excerpt guarantee proves a sentence was printed. It cannot prove the sentence was **about this
medicine**, and that turned out to matter enormously. A multi-ingredient document — an allergenic
extract naming ninety-one pollens, a homeopathic combination naming gold among thirty-five other
things — prints sentences that belong to none of its substances individually. One such document was
supplying the same mechanism, safety and identity to ninety-one different pollen records.

A substance-specific module may therefore only be recorded from a document declaring exactly one
active substance, enforced by `I_ATTRIBUTION_TOO_BROAD` rather than by the pipeline alone. Shared-UNII
collisions fell from 832 groups over 3,964 slugs to 28 over 56, and every one that remains is a
genuine synonym.

Substance identity is resolved only from labels naming a single substance, and cites the label that
established it. An earlier attempt paired openFDA's `substance_name` and `unii` arrays positionally,
on the evidence that they are the same length. They are not aligned: checked against single-substance
labels, 15% of pairings disagreed, and one combination label paired guaifenesin and phenylephrine
each with the other's identifier. Identity also keeps the salt words that content matching strips,
because barium sulfate and barium acetate are not the same substance.

## Polarity: what a label denies

Roughly three quarters of the role-bearing sentences in this corpus are negative findings —
"abacavir does not inhibit human CYP3A4, CYP2D6, or CYP2C9" is a real result from a real study. A
parser that matched the verb and ignored the negation recorded every one of them as the opposite of
what the label said, and 2,028 signals were inverted this way before it was caught.

Roles now carry `polarity`, so a denial survives as a denial: 700 asserted, 1,511 negated, and 2,015
counterparties recorded with no role at all because the sentence both asserts and denies and which
negation scopes which name is not something a parser can decide. `I_INTERACTION_POLARITY_MISSING`
makes a role without polarity a validation failure, because a role recorded from "does not inhibit"
and shown as "inhibits" states the opposite of its own source.

Roles are also read only from descriptive sections. 21 CFR 201.57(c)(8) makes Section 7 the place
for clinically significant interactions and the instructions for preventing them; a role taken from
there is inferred from regulated advice rather than stated as a property.

## Diagram projections

`lib/background/diagram-projections.ts` turns the corpus into typed, renderer-agnostic views.
Three rules keep a drawn chart as honest as the record behind it: a point exists only when the
underlying value carries a machine-readable number, code or ordered step; every point carries the
source that was fetched for it, so a tooltip can show the exact excerpt; and a record missing the
typed field is absent from the projection rather than estimated onto it, with coverage reported
so a chart can state how much of the corpus it draws.

| Projection               | What it draws                                                                                | Anchored on                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `durationOfActionScale`  | Every recorded half-life on one logarithmic hour axis, with deterministic bands              | `pharmacokinetics.halfLife.numeric`                                                 |
| `bodyRegionAtlas`        | The corpus inverted into body regions — which medicines act where, and what each source says | `anatomyTargets[].regionCode` + vocabulary coordinates                              |
| `exposureTimeline`       | One medicine's peak, half-life and derived steady-state marks on an hour axis                | numeric half-life, with `derived` flagged per marker                                |
| `titrationLadder`        | The recorded escalation schedule as ordered rungs                                            | `titration.steps`                                                                   |
| `completenessMatrix`     | Which modules each record actually holds, and corpus-wide shares                             | module presence                                                                     |
| `sourceComposition`      | The dataset's provenance profile by source kind                                              | every recorded `source`                                                             |
| `metabolicPathwayIndex`  | Which recorded medicines each named enzyme appears in, inverted for a network view           | enzyme names inside the verified excerpt of `pharmacokinetics.metabolismAsRecorded` |
| `handlingNetwork`        | A bipartite network of medicines and the enzymes or transporters a source named for them     | `interactionSignals[]`                                                              |
| `evidenceGapMatrix`      | How often the corpus answers, declines to answer, or says nothing for each group             | `populationStatements[]` and their absence                                          |
| `sharedReactionIndex`    | Reactions more than one medicine records as most common, each on its own printed threshold   | `commonAdverseReactions.eventsAsRecorded`                                           |
| `sizePersistenceScatter` | Molecular weight against half-life, every point checkable against two quoted sentences       | `molecularIdentity.molecularWeight.numeric` + `pharmacokinetics.halfLife.numeric`   |

The pathway index reports strictly what labels name. Sharing a metabolic route is a recorded fact
about metabolism, never a statement about interactions, safety, or what anyone should do — an
enzyme is indexed only when its name appears in the fetched excerpt, so the token is one a source
actually printed rather than a summary's paraphrase.

The comparative projections are what a normalized corpus makes possible and a per-medicine scrape
does not: one schema, one unit, one controlled anatomy vocabulary across every record. A medicine
whose half-life was published only in days never appears on the hour axis, because the dataset
does not convert a value its source did not state.

## Authoring a new batch

Fetch artifacts, structure only what they support, store the excerpt beside every number, compute
derivations by calling the derivation functions, and keep `npm run check:medicine-content` at
zero findings. The authoring rules header in `scripts/seed-data/background/index.ts` is the
contract; independent re-verification against the live sources belongs in review, not in the
author's own run.

The `evidenceGapMatrix` is the projection a reader cannot get anywhere else. Any medicine site will
show what a label says about children; none of them show how much of the corpus never addresses the
question at all. Silence and a stated negative are counted separately and never merge into one bar,
because "the source says effectiveness was not established" and "the source says nothing" are
different facts about the evidence.
