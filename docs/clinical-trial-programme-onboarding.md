# ClinicalTrials.gov programme onboarding

This operator command creates the first source-backed programme for a medicine that already exists
in RNAWiki. It reads one exact ClinicalTrials.gov record and stores the registry facts needed to
start monitoring that record.

It does **not** write a medical claim, an evidence-chain answer, a conclusion, a reviewer, or a
publication. An onboarded programme therefore appears as “review not completed” while still showing
its registered study and source. The normal evidence review and publication process remains the
only way to publish a conclusion.

## Safe usage

Preview the operation first. A preview is the default and makes no database changes:

```sh
npm run onboard:clinical-trial -- --medicine inclisiran --nct NCT03399370
```

After checking the JSON output, repeat it with the explicit write flag:

```sh
npm run onboard:clinical-trial -- --medicine inclisiran --nct NCT03399370 --commit
```

Both `--medicine` and `--nct` are required. Unknown and duplicate options are rejected. The command
prints one JSON object so an operator or deployment job can save the exact result.

## What the command verifies

Before any write, the command:

1. resolves the medicine slug to an existing RNAWiki medicine;
2. loads that medicine's saved aliases;
3. fetches the requested `NCT########` record from the official ClinicalTrials.gov v2 API;
4. confirms that the returned NCT number matches the requested number; and
5. confirms that the medicine name or a saved alias appears in a registered intervention name.

The fifth check prevents a valid but unrelated study from being attached to the wrong medicine.

## What is copied

Only structured registry facts are copied: NCT number, acronym and titles, conditions, lead sponsor,
phase, recruitment status, enrolment, dates, whether results are posted, and the matching
intervention name. The complete fetched JSON is also saved as an immutable, SHA-256-addressed source
snapshot.

ClinicalTrials.gov sometimes reports a date as only a year or year and month. RNAWiki keeps that
exact value in the immutable source snapshot but leaves the database `date` column empty; it never
invents a day. Registry status and phase codes are mapped through fixed tables to RNAWiki's display
vocabulary. Unknown codes stay unknown.

## Database guarantees

One transaction inserts or reuses:

- the ClinicalTrials.gov evidence source;
- its immutable source snapshot;
- one identified, unpublished development programme;
- one programme trial linked to that exact snapshot; and
- one successful freshness check with the next check due 24 hours later.

IDs and the programme slug are deterministic. Repeating the same command returns
`ALREADY_ONBOARDED` and does not create duplicates. A collision with an existing programme or trial
that does not have the exact expected source lineage stops the transaction. The command never
updates an existing programme, trial, source snapshot, reviewed record, or published record.

If an existing ClinicalTrials.gov source already has a different newer snapshot, onboarding stops
and asks the operator to run the source monitor first. This prevents onboarding from silently
bypassing the evidence-change review queue.

Later source checks can refresh the cached study status, phase, enrolment, dates, sponsor, and linked
snapshot automatically only while the programme is still unpublished and has no claims,
evidence-chain answers, study-quality assessments, conclusion revisions, dependent dossier fields,
or saved contribution proposals. RNAWiki also compares the rest of the old and new registry payload;
if anything beyond those exact fields changed, the new snapshot stays pending for a person to review.
The earlier immutable snapshot remains available either way.

## Reading the JSON result

The result includes:

- `mode`: `DRY_RUN` or `COMMIT`;
- `outcome`: `WOULD_CREATE`, `CREATED`, or `ALREADY_ONBOARDED`;
- `registry`: the exact structured facts used;
- `records`: the stable source, snapshot, programme, and trial identifiers;
- `writes`: which rows would be or were inserted; and
- `safety`: explicit `false` flags for claims, evidence nodes, conclusions, reviewers, and
  publication.

Errors are also emitted as JSON with a stable error code and a bounded message. A failed command
exits non-zero.
