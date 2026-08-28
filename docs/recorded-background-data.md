# Recorded background data

The `medicine-background/v1` layer fills the dossier sections the wireframe shows but the corpus
could not honestly support: pharmacokinetics, studied escalation schedules, product variants,
recorded price context, the systemic body map, pivotal-study eligibility and exact results, and
registry identifiers. It lives in `drugs.recorded_background` (migration 0016) and is authored as
TypeScript batches under `scripts/seed-data/background/`.

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
`rna-intelligence/background-1.0.0`) checks structure only: envelope version, source-identifier
shapes per kind, ISO dates, excerpt length, number-in-excerpt, measurement context, plausibility
ranges by value type, contiguous schedule steps, controlled vocabularies (jurisdictions,
currencies, price types, anatomy regions), derivation equality, concordance/alternate pairing,
registry-identifier shapes, and the forbidden-guidance scan. Every code has a focused executable
case in `tests/unit/rna-intelligence/background-rule-coverage.test.ts`. People judge meaning;
this group never does.

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

## Diagram-readiness

Rendered visuals draw only from typed fields, never from prose: anatomy targets carry vocabulary
coordinates; pharmacokinetic values carry `numeric` + `unit`; titration steps are ordered
records; cost entries carry numeric ranges with dated FX normalization. Any future chart or
diagram reads those numbers directly, so a visual can never say more than the recorded value.

## Authoring a new batch

Fetch artifacts, structure only what they support, store the excerpt beside every number, compute
derivations by calling the derivation functions, and keep `npm run check:medicine-content` at
zero findings. The authoring rules header in `scripts/seed-data/background/index.ts` is the
contract; independent re-verification against the live sources belongs in review, not in the
author's own run.
