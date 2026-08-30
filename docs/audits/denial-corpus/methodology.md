# How the Denial Corpus figures are measured

Every number in `data/audits/denial-corpus/baseline.json` is produced by
`npm run audit:denial-corpus`, which reads only checked-in generated data. No clock, no random draw,
no network call and no database enters the `measurements` object, so two runs on the same tree
produce byte-identical output and any diff means the corpus changed.

This file exists because the failure it prevents already happened three times. `sourceMaterial` was
documented at 5,644 rows when it held 7,127; the agent tables described a corpus of 3,008 records
when the agents ran on 9,855; and the rejection of chemical fingerprints was argued against a
connection-table count of 144 when the corpus holds 3,204. Each was a number written down once and
never re-derived.

## Definitions that materially change a figure

Several counts depend on a choice. The choice is made once, here, rather than per consumer.

### Clinical modules

A module says something about what the medicine **does**, as opposed to what it is called, how it is
classified, or how many products contain it:

`pharmacokinetics`, `mechanism`, `safety`, `commonAdverseReactions`, `populationStatements`,
`interactionSignals`, `recordedUses`, `pivotalResults`, `titration`, `anatomyTargets`,
`applicability`.

### Pharmacology modules

The clinical set **minus `recordedUses`**. A `recordedUses` entry is a quoted INDICATIONS sentence
and is the lowest bar in the group; counting it as pharmacology inflates the figure by roughly half,
because a large number of rows hold it and nothing else clinical.

### A quotable sentence

A record counts as holding one when its serialized envelope contains an `excerpt` key anywhere.

**This differs from a figure quoted in the 30 August audit.** That pass reported 5,015 rows holding
a module "whose values carry a fetched excerpt" and 4,840 with none. This script measures 3,089 and
6,766 under the stricter definition above. Both are defensible; they are not the same question, and
only the one implemented here is reproducible. The `transcribed` tier (6,428 rows) has no excerpts
by construction — the registries return structured fields with no sentence behind them — so a figure
near 6,428 is the expected floor for "no quotable sentence".

### Unit comparability in the disagreement count

`consensusDisjointAcrossUnits` partitions readings by a trailing unit token extracted with a regular
expression. It reports **43** of the 234 numerically-disjoint fields as spanning more than one unit,
where a narrower hand analysis during the audit found 18.

The difference is not a contradiction: this measure counts a reading whose unit failed to parse
(`"6.5 days"` stored with no unit) as its own partition, and an unparsed unit genuinely **is** not
comparable to a parsed one. The stricter number counts only readings where two different units were
both successfully parsed. Phase 8 replaces this heuristic with a real comparability contract; until
then the figure here is an upper bound on non-comparability and is labelled as such.

### Provenance tier

Read from the record-level `provenanceTier`. An absent value means `curated`, which is what every
hand-authored record is. Note this is a property of the **record**, not of each value: a curated
record may carry modules contributed by a registry source.

## What the numbers do not mean

- A passing engine check means "internally structured enough for review". It never means the value
  is medically true, safe or effective.
- A record counted under "explicit non-establishment" means a source printed that something was not
  established. It is not a statement about danger.
- A `SILENT` classification on a record whose label was never read means only that nobody looked. It
  must never be added to a verified absence, and the two are reported separately.
- A count of stored patient-action or pros-and-cons entries is a count of what is **stored**, not of
  what is published. The public serializer withholds both; that is proved by test, not by this count.

## Reproducing

```bash
npm run audit:denial-corpus
```

Outputs, all overwritten wholesale:

| File                                            | Contents                                                 |
| ----------------------------------------------- | -------------------------------------------------------- |
| `data/audits/denial-corpus/baseline.json`       | the full measurement object                              |
| `data/audits/denial-corpus/baseline.md`         | the same figures as a readable table set                 |
| `data/audits/denial-corpus/input-manifest.json` | measurement digest plus SHA-256 of every generated input |

The measurement digest is the SHA-256 of `baseline.json`. Quote it whenever a document cites a
figure, so a reader can tell which corpus state the figure came from.
