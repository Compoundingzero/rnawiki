#!/usr/bin/env python
"""Phase 4 — extend the R2 suppression trigger to the `controlled` field.

`docs/specs/phase4-generators.md` §4 and `docs/specs/revamp-2026-09.md` Operating Rule 9 require
that a substance carrying a controlled-substance schedule is treated exactly as an R2-suppressed
record is: derived seeds 1 (bioavailability gap), 2 (N-of-1 designability) and 6 (time-to-signal)
do not exist for it, and the dose question is withheld.

The Phase 2 integration wrote the schedules themselves onto a new field, `controlled`
(`docs/specs/field-integration.md` §3). This script reads that field and writes an extended copy
of the R2 assignments file, so every downstream stage that already reads assignments — the derived
executor, the question deriver, the loader — picks the extension up with no rule of its own.

    scripts/revamp/controlled_suppression.py \
        --fields-dir data/revamp/fields-v2 \
        --assignments data/corpus-20k/suppression/assignments.ndjson \
        --models data/corpus-20k/tiers/model-assignment.ndjson \
        --out data/revamp/suppression/assignments-v2.ndjson \
        --summary data/revamp/suppression/controlled-suppression.json

The trigger, stated exactly
--------------------------
A page fires the controlled trigger when the `controlled` field records any of:

  * SG — one or more entries in `value.SG.schedules`, that is a Misuse of Drugs Act 1973 First or
    Fourth Schedule item, a Poisons Act 1938 Schedule item, or a Poisons Rules schedule item, read
    from Singapore Statutes Online;
  * US — a Drug Enforcement Administration schedule, either on `value.US.schedule` or on the
    page's `regulatory` field under `US.deaSchedule` or `US.controlledSubstanceSchedule`, as
    recorded on the openFDA NDC product record;
  * AU — a Poisons Standard (SUSMP) entry in Schedule 8 or Schedule 9, on
    `value.AU.controlledUnderSchedule8or9` or an entry in `value.AU.schedules` whose schedule
    number is 8 or 9.

No other value fires it. An HSA forensic classification is a supply restriction, not a schedule,
and the field records it as such; it is not read here. A SUSMP entry in Schedules 2 to 7 is not
read here. A schedule that a register did not state stays unstated: the trigger reads recorded
entries only and never infers one from an absence.

The class recorded is `S2`, the existing controlled-substance-schedule test in
`docs/specs/suppression-classes.md`, because that is the test these registers answer. Every page
the trigger newly suppresses carries an `evidence` row per register naming the register, the
schedule and the statute or instrument version the schedule was read at, so the reason is on the
record rather than in this script.

Output
------
`--out` is the R2 assignments file with three changes and nothing else: `suppressed` becomes true
on a triggered page, `S2` joins `classes` where it is not already there, and the register evidence
rows are appended. Two keys are added for audit: `controlledTrigger` (bool) and
`controlledTriggerBasis` (the register codes that fired). Every other value on every line is
copied through unchanged, including lines the trigger does not touch.

The ATC group name
------------------
`docs/specs/phase4-generators.md` §15(1) requires the supervision answer to name a therapeutic
class by its ATC code *and* the register's own name for that code. The suppression pass recorded
the code alone ("L01FX06 (antineoplastic)"), so this script resolves the name from the ChEMBL
`atc_class` download — the same release the code was read from — and writes it onto the evidence
row as `label` ("L01FX06, other antineoplastic agents"). The longest group prefix the register
publishes wins: level 4, then level 3, then level 2. A code the register does not publish a group
for keeps its code and gains no name, and the renderer prints what is there. Nothing else on the
row is touched, and no name is invented.
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from collections import Counter

ATC_RAW_GLOB = "data/sources/chembl/2026-09-05/raw/atc_class-*.json"
ATC_CODE = re.compile(r"\b([A-Z]\d{2}[A-Z]{0,2}\d{0,2})\b")
#: The classes whose evidence value is an ATC code (docs/specs/suppression-classes.md S1, S4, S7,
#: S9). S2's values are statute schedules and S6's are the boxed warning's own subjects.
ATC_CLASSES = {"S1", "S4", "S7", "S9"}


def load_atc_group_names():
    """ATC group code -> the register's own name for it, from the ChEMBL atc_class download."""
    names = {}
    for path in sorted(glob.glob(ATC_RAW_GLOB)):
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
        for row in payload.get("atc") or []:
            for level in ("level1", "level2", "level3", "level4"):
                code = row.get(level)
                description = row.get(level + "_description")
                if code and description:
                    names.setdefault(str(code).strip().upper(), str(description).strip())
    return names


def atc_label(value, names):
    """"L01FX06, other antineoplastic agents" for a value carrying an ATC code, else None."""
    match = ATC_CODE.search(str(value or "").upper())
    if not match:
        return None
    code = match.group(1)
    for length in range(min(len(code), 5), 0, -1):
        group = code[:length]
        name = names.get(group)
        if name:
            # The code named is the group the name belongs to, not the substance code inside it:
            # "L01CA, vinca alkaloids and analogues", never "L01CA02, vinca alkaloids and
            # analogues", which would read as if the substance code were the class.
            #
            # The register writes its top three levels in capitals and its fourth in sentence
            # case. A capitalised heading inside a sentence reads as shouting, so a wholly
            # capitalised name is lowercased and every other name is kept exactly as published.
            return "%s, %s" % (group, name.lower() if name.isupper() else name)
    return None


def iter_ndjson(path):
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def field_value(record, name):
    entry = (record.get("fields") or {}).get(name)
    if not isinstance(entry, dict):
        return {}
    value = entry.get("value")
    return value if isinstance(value, dict) else {}


def read_trigger(record):
    """Return (basis codes, evidence rows) for one field record."""
    controlled = field_value(record, "controlled")
    regulatory = field_value(record, "regulatory")
    basis = []
    evidence = []

    sg = controlled.get("SG") if isinstance(controlled.get("SG"), dict) else {}
    schedules = sg.get("schedules") or []
    if schedules:
        basis.append("SG-MDA-POISONS")
        for entry in schedules:
            if not isinstance(entry, dict):
                continue
            # Only the Misuse of Drugs Act schedules are the narrow controlled test (section 14
            # item 1). A Poisons Act or Poisons Rules entry is a prescription classification, and
            # docs/specs/phase4-generators.md §15(1) forbids one as evidence in the supervision
            # answer, so it is not recorded as S2 evidence at all; the registration block states
            # it, which is where section 13 item 4 puts it.
            statute = str(entry.get("statute") or entry.get("statuteCitation") or "")
            evidence.append(
                {
                    "test": "S2",
                    "narrow": "Misuse of Drugs" in statute,
                    "source": entry.get("statuteCitation") or entry.get("statute") or sg.get("register"),
                    "value": "%s (statute version %s)"
                    % (entry.get("schedule"), entry.get("statuteVersionDate") or "not stated"),
                }
            )

    au = controlled.get("AU") if isinstance(controlled.get("AU"), dict) else {}
    au_entries = [
        entry
        for entry in (au.get("schedules") or [])
        if isinstance(entry, dict) and str(entry.get("schedule")) in {"8", "9"}
    ]
    if au.get("controlledUnderSchedule8or9") is True or au_entries:
        basis.append("AU-SUSMP-8-9")
        if au_entries:
            for entry in au_entries:
                evidence.append(
                    {
                        "test": "S2",
                        "source": au.get("instrument") or au.get("register"),
                        "value": "Schedule %s (%s)" % (entry.get("schedule"), entry.get("title") or "title not stated"),
                    }
                )
        else:
            evidence.append(
                {
                    "test": "S2",
                    "source": au.get("instrument") or au.get("register"),
                    "value": "recorded as a Schedule 8 or Schedule 9 entry",
                }
            )

    us = controlled.get("US") if isinstance(controlled.get("US"), dict) else {}
    us_reg = regulatory.get("US") if isinstance(regulatory.get("US"), dict) else {}
    us_schedule = us.get("schedule") or us_reg.get("deaSchedule") or us_reg.get("controlledSubstanceSchedule")
    if us_schedule:
        basis.append("US-DEA")
        evidence.append(
            {
                "test": "S2",
                "source": us.get("register")
                or "US Drug Enforcement Administration schedule as recorded on the openFDA NDC product record",
                "value": str(us_schedule),
            }
        )

    return basis, evidence


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fields-dir", required=True)
    parser.add_argument("--assignments", required=True)
    parser.add_argument("--models", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--summary", required=True)
    args = parser.parse_args(argv)

    paths = sorted(glob.glob(os.path.join(args.fields_dir, "**", "batch-*.ndjson"), recursive=True))
    if not paths:
        print("no field batches under %s" % args.fields_dir, file=sys.stderr)
        return 2

    triggers = {}
    narrow = set()  # the Misuse of Drugs Act alone, without the Poisons Act and Poisons Rules
    pages_read = 0
    for path in paths:
        for record in iter_ndjson(path):
            key = record.get("key")
            if not key:
                continue
            pages_read += 1
            basis, evidence = read_trigger(record)
            if basis:
                triggers[key] = (basis, evidence)
                sg = field_value(record, "controlled").get("SG") or {}
                mda = any(
                    isinstance(e, dict) and "Misuse of Drugs" in str(e.get("statute") or "")
                    for e in (sg.get("schedules") or [])
                )
                if mda or "AU-SUSMP-8-9" in basis or "US-DEA" in basis:
                    narrow.add(key)

    tiers = {}
    for record in iter_ndjson(args.models):
        key = record.get("key")
        if key:
            tiers[key] = 1 if (record.get("model") == "LONGEVITY" or record.get("withdrawn") is True) else (
                2 if record.get("model") == "CLINICAL" else 3
            )

    atc_names = load_atc_group_names()
    atc_labelled = 0
    atc_unnamed = 0

    already = 0
    newly = 0
    basis_counts = Counter()
    newly_by_tier = Counter()
    triggered_by_tier = Counter()
    lines_written = 0
    keys_in_assignments = set()

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as out:
        for record in iter_ndjson(args.assignments):
            key = record.get("key")
            keys_in_assignments.add(key)
            hit = triggers.get(key)
            if hit:
                basis, evidence = hit
                for code in basis:
                    basis_counts[code] += 1
                triggered_by_tier[tiers.get(key, 0)] += 1
                if record.get("suppressed") is True:
                    already += 1
                else:
                    newly += 1
                    newly_by_tier[tiers.get(key, 0)] += 1
                record["suppressed"] = True
                classes = list(record.get("classes") or [])
                # docs/specs/phase4-generators.md section 14 item 1: the supervision answer is
                # built from the S1-S9 classes and names a controlled schedule under the Singapore
                # Misuse of Drugs Act, a United States DEA schedule or an Australian Poisons
                # Standard Schedule 8 or 9. A Singapore Poisons Act or Poisons Rules schedule is a
                # prescription classification (section 10 measured 1,836 pages with it against 241
                # without), and offering it as a reason for supervision is the non-sequitur the
                # reading of draw 4 found on Piroxicam: "AU scheduled in the Poisons Standard: the
                # registers' classification of Piroxicam". S2 is therefore recorded only on the
                # narrow test. The page keeps `suppressed` and the controlled trigger either way,
                # so no dose, timing or route text is written for it; what changes is that a
                # prescription class is no longer stated as a supervision reason, and the schedule
                # renders in the registration block, which is where section 13 item 4 puts it.
                if key in narrow and "S2" not in classes:
                    classes.append("S2")
                record["classes"] = classes
                rows = list(record.get("evidence") or [])
                if key in narrow:
                    # §15(1): the S2 clause is built from these rows, so only the rows the narrow
                    # test itself rests on are recorded. A Poisons Act or Poisons Rules schedule is
                    # a prescription classification and never a supervision reason.
                    rows.extend(
                        {k: v for k, v in row.items() if k != "narrow"}
                        for row in evidence
                        if row.get("narrow", True)
                    )
                record["evidence"] = rows
                record["controlledTrigger"] = True
                record["controlledTriggerBasis"] = basis
            else:
                record["controlledTrigger"] = False
                record["controlledTriggerBasis"] = []
            # §15(1): the ATC-based classes name the register's own group name beside the code.
            for row in record.get("evidence") or []:
                if not isinstance(row, dict) or row.get("test") not in ATC_CLASSES:
                    continue
                label = atc_label(row.get("value"), atc_names)
                if label:
                    row["label"] = label
                    atc_labelled += 1
                elif ATC_CODE.search(str(row.get("value") or "").upper()):
                    atc_unnamed += 1
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            lines_written += 1

    missing = sorted(set(triggers) - keys_in_assignments)

    summary = {
        "generatedBy": "scripts/revamp/controlled_suppression.py",
        "spec": ["docs/specs/phase4-generators.md#4", "docs/specs/suppression-classes.md"],
        "inputs": {
            "fieldsDir": args.fields_dir,
            "pagesRead": pages_read,
            "assignments": args.assignments,
            "assignmentLines": lines_written,
        },
        "output": args.out,
        "trigger": {
            "pagesFiring": len(triggers),
            "byRegister": dict(basis_counts),
            "byTier": {str(k): v for k, v in sorted(triggered_by_tier.items())},
        },
        "suppression": {
            "alreadySuppressedUnderR2": already,
            "newlySuppressedByControlledField": newly,
            "newlySuppressedByTier": {str(k): v for k, v in sorted(newly_by_tier.items())},
        },
        "narrowerReading": {
            "definition": "the Misuse of Drugs Act 1973 schedules only, without the Poisons Act 1938 "
            "Schedule and the Poisons Rules schedules, plus the same US DEA and AU SUSMP 8/9 tests",
            "pagesFiring": len(narrow),
            # section 14 item 1: this is the test that records the S2 class and its evidence. The
            # wider test above still sets `suppressed` and the controlled trigger, so a page
            # carrying only a prescription schedule keeps its no-dose path and states the schedule
            # in the registration block instead of offering it as a supervision reason.
            "recordsClassS2": True,
            "pagesSuppressedWithoutClassS2": len(set(triggers) & keys_in_assignments) - len(
                narrow & keys_in_assignments
            ),
        },
        "triggeredKeysNotInAssignments": missing,
        "atcGroupNames": {
            "source": ATC_RAW_GLOB,
            "groupCodesRead": len(atc_names),
            "evidenceRowsNamed": atc_labelled,
            "evidenceRowsWithACodeTheRegisterPublishesNoGroupFor": atc_unnamed,
        },
    }
    with open(args.summary, "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
        handle.write("\n")

    print("pages read              %d" % pages_read)
    print("controlled trigger      %d pages" % len(triggers))
    print("  by register           %s" % dict(basis_counts))
    print("already suppressed      %d" % already)
    print("newly suppressed        %d" % newly)
    print("newly suppressed / tier %s" % {str(k): v for k, v in sorted(newly_by_tier.items())})
    print("narrower reading        %d pages" % len(narrow))
    print("wrote                   %s" % args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
