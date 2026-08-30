# Release A — scope lock

A narrow correctness release. Its whole purpose is to repair what is measurably wrong and then put
the repaired corpus in front of readers, not to extend the platform.

**Starting point:** `fix/denial-corpus-production` @ `04da169`, 15 commits, clean tree, gate green.
**Remote:** <https://github.com/Compoundingzero/rnawiki/tree/fix/denial-corpus-production>

## In scope

| # | Item | Why it is in a correctness release |
| - | ---- | ---------------------------------- |
| A | Remove canonical interaction truncation | An evidence-bearing list is silently cut to twelve after an alphabetical sort, so the discard is systematic rather than random |
| B | Unit-aware source disagreement | Readings in incompatible units are reported as disagreeing. A false disagreement is the most expensive error this corpus can make, because recording that sources differ *is* the product |
| C | Third first-screen state | The guard currently converts a boundary violation into a dead end. A source-linked recorded use exists on most extracted records and is not being shown |
| D | Question-level `conflicting` and `stale` | The strongest statement the corpus can make is reachable only by scrolling into one module |
| E | Verify engine-finding persistence | Claimed by an earlier phase; not yet proven |
| F | Fence off known-unreliable chemistry | A value already known to be wrong must not reach a public surface |
| G | `recordedBackground` in the bulk export | The asset is absent from the only bulk artifact the project publishes |
| H | Regenerate once, validate, deploy | One regeneration incorporating every repair above |

## Explicitly deferred to Release B

ClinicalTrials.gov posted results · stereochemistry expansion · the full chemistry redesign ·
phosphorus TPSA · additional agents · review-queue UI · active import of the current 2,005
candidates · benchmark packaging · further dossier design · positioning work.

## Standing decisions this release does not reopen

- **Do not guess a phosphorus TPSA contribution.** The corpus holds one phosphorus record and it does
  not reconcile — the module already sits 16.28 Å² above PubChem there before any phosphorus
  contribution, so adding one would widen the gap. One unreconcilable record cannot establish a
  number.
- **Do not import the existing 2,005 candidates as current review work.** They were computed against
  the pre-repair corpus. Importing them would present stale occurrences as live questions and would
  spend reviewer effort on values that regeneration is about to change. They are preserved as a dated
  pre-repair snapshot instead.
- **Do not weaken a test or redefine a metric to pass the gate.** If a count moves unexpectedly, the
  explanation goes in the regeneration report; the metric stays as defined.
- **Do not deploy the current generated corpus.** 23 stored values are equal to their own dispersion
  and 558 document-votes carry them.

## Sequencing, and why

Phases 2–7 land *before* regeneration so that one archive pass incorporates every extraction and
consensus repair. Regenerating twice would double a multi-hour operation and produce two sets of
hashes to reconcile.

The archive download is independent of the code work and runs alongside it.

## Archive

| Fact | Value |
| ---- | ----- |
| Manifest | <https://api.fda.gov/download.json> |
| Export date | 2026-08-28 — the same export the current corpus was built from |
| Label partitions | 14, 1,770.9 MB |
| Plus | drugsfda 9.0 MB · ndc 26.9 MB · orangebook 2.3 MB |
| Total | 1,809.1 MB (1.77 GB) |
| Destination | `~/rnawiki-ingest-data/openfda` — outside the repository, never committed |
| Resumable | Yes; a short file is refetched |

The matching export date matters: regeneration should reproduce the same source excerpts, with only
the repaired parser changing recorded values. A different export would confound a parser repair with
a source change, and the regeneration report could not attribute either.

## Release gate

Deployment is blocked until every one of these holds:

- `valuesEqualToOwnDispersion` = 0, or each exception examined and documented by record and reason
- all 23 historical records rechecked individually
- the 558 document-votes rebuilt from repaired readings
- no substring matching in any evidence-bearing numeric validator
- canonical interaction evidence uncapped, with the P-glycoprotein case present
- unit-incompatible readings never reported as `differ`
- zero first screens speaking an imperative in RNAWiki's own voice
- zero public patient-action entries and zero public named-treatment rankings
- `npm run audit:denial-corpus` and `npm run gate` both green
- migration replay green on an empty and on a production-shaped disposable database
- production backup verified
- generated-output hashes recorded and matching
