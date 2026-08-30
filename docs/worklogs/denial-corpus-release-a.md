# Release A — scope lock

A narrow correctness release. Its whole purpose is to repair what is measurably wrong and then put
the repaired corpus in front of readers, not to extend the platform.

**Starting point:** `fix/denial-corpus-production` @ `04da169`, 15 commits, clean tree, gate green.
**Remote:** <https://github.com/Compoundingzero/rnawiki/tree/fix/denial-corpus-production>

## In scope

| #   | Item                                     | Why it is in a correctness release                                                                                                                                                        |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Remove canonical interaction truncation  | An evidence-bearing list is silently cut to twelve after an alphabetical sort, so the discard is systematic rather than random                                                            |
| B   | Unit-aware source disagreement           | Readings in incompatible units are reported as disagreeing. A false disagreement is the most expensive error this corpus can make, because recording that sources differ _is_ the product |
| C   | Third first-screen state                 | The guard currently converts a boundary violation into a dead end. A source-linked recorded use exists on most extracted records and is not being shown                                   |
| D   | Question-level `conflicting` and `stale` | The strongest statement the corpus can make is reachable only by scrolling into one module                                                                                                |
| E   | Verify engine-finding persistence        | Claimed by an earlier phase; not yet proven                                                                                                                                               |
| F   | Fence off known-unreliable chemistry     | A value already known to be wrong must not reach a public surface                                                                                                                         |
| G   | `recordedBackground` in the bulk export  | The asset is absent from the only bulk artifact the project publishes                                                                                                                     |
| H   | Regenerate once, validate, deploy        | One regeneration incorporating every repair above                                                                                                                                         |

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

Phases 2–7 land _before_ regeneration so that one archive pass incorporates every extraction and
consensus repair. Regenerating twice would double a multi-hour operation and produce two sets of
hashes to reconcile.

The archive download is independent of the code work and runs alongside it.

## Archive

| Fact             | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Manifest         | <https://api.fda.gov/download.json>                                       |
| Export date      | 2026-08-28 — the same export the current corpus was built from            |
| Label partitions | 14, 1,770.9 MB                                                            |
| Plus             | drugsfda 9.0 MB · ndc 26.9 MB · orangebook 2.3 MB                         |
| Total            | 1,809.1 MB (1.77 GB)                                                      |
| Destination      | `~/rnawiki-ingest-data/openfda` — outside the repository, never committed |
| Resumable        | Yes; a short file is refetched                                            |

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

---

## Archive acquisition — done

| Fact                | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| Downloaded          | 2026-08-30, from the manifest at <https://api.fda.gov/download.json>      |
| Export date         | 2026-08-28                                                                |
| Label partitions    | 14, saved as `label-01.zip` … `label-14.zip`                              |
| On disk             | 2.2 GB in `~/rnawiki-ingest-data/openfda`                                 |
| Per-file SHA-256    | `~/rnawiki-ingest-data/archive-hashes.txt`                                |
| Pre-repair snapshot | `~/rnawiki-ingest-data/pre-repair-snapshot/` with `pre-repair-hashes.txt` |

Pre-repair hashes, for the regeneration report:

```
e68157b555e6eec9ecc0747dfee879996f77a89e389266907d7a11417e9673f2  baseline.json
0a19553a5e5dc5057b14ba4a8b84e7f595026d9dac56da10a9f6d944f8fdd59c  enzyme-and-transporter-documentation.json
115d508be751926be60dd12e7424e067f0724a258541b581b3544cc68790e225  extracted-background.generated.ts
c66438859ef0e0ca78077dee1656baf1f127e6812efe347cf4cca9e5de44b90d  source-consensus.generated.ts
```

### The indexer bug this exposed

The first index run reported `wrote 0 labels, skipped 0` **and exited 0.**

`index-openfda-labels.py` discovered partitions by openFDA's published name,
`drug-label-0001-of-0014.json.zip`, while `scripts/ingest/download.ts` deliberately renames each
partition to `label-01.zip` as it saves it. Pointed at the directory the project's own downloader
produces, the indexer matched nothing — and said so as success.

That is the DSLD failure again, in a different place: a refusal arriving as a successful response,
recorded as an answer. Had the regeneration continued, it would have rebuilt the corpus from an
empty index and every extracted record would have vanished, with a green exit code the whole way.

Both names are now accepted, and a run that indexes zero labels raises instead of returning. Against
the real archive: **80,444 labels kept, 181,827 skipped, 262,271 examined**, plus an 87,096-label
presence stream.
