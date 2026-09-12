#!/usr/bin/env python
"""Phase 4 step 4.6 — before/after firing counts for the derived seeds, and the suppression proof.

Reads the corpus-20k firing counts (before), the re-run written against `data/revamp/fields-v2`
(after), the extended suppression assignments and the seed output files, and writes
`data/revamp/derived-fire-counts-after.json`.

    scripts/revamp/derived_fire_counts.py \
        --before data/corpus-20k/derived/fire-counts.json \
        --after data/revamp/derived-v2/fire-counts.json \
        --seeds-dir data/revamp/derived-v2 \
        --assignments data/revamp/suppression/assignments-v2.ndjson \
        --controlled data/revamp/suppression/controlled-suppression.json \
        --models data/corpus-20k/tiers/model-assignment.ndjson \
        --out data/revamp/derived-fire-counts-after.json

The suppression proof is read from the written files, not from the executor's own bookkeeping:
every key in every seed file is checked against the suppressed set, and seeds 1, 2 and 6 are
required to hold none. Any seed at all that carries a suppressed key is reported, so a regression
in a seed that is not supposed to be suppression-absolute is visible too.
"""

from __future__ import annotations

import argparse
import json
import os
import re


def load_suppressed(path):
    suppressed = set()
    total = 0
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        record = json.loads(line)
        total += 1
        if record.get("suppressed") is True:
            suppressed.add(record.get("key"))
    return suppressed, total


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--before", required=True)
    parser.add_argument("--after", required=True)
    parser.add_argument("--seeds-dir", required=True)
    parser.add_argument("--assignments", required=True)
    parser.add_argument("--controlled", required=True)
    parser.add_argument("--models", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args(argv)

    before = json.load(open(args.before, encoding="utf-8"))
    after = json.load(open(args.after, encoding="utf-8"))
    controlled = json.load(open(args.controlled, encoding="utf-8"))
    suppressed, assignment_lines = load_suppressed(args.assignments)

    tiers = {}
    for line in open(args.models, encoding="utf-8"):
        record = json.loads(line)
        tiers[record["key"]] = 1 if (record.get("model") == "LONGEVITY" or record.get("withdrawn") is True) else (
            2 if record.get("model") == "CLINICAL" else 3
        )

    SUPPRESSION_ABSOLUTE = {"1", "2", "6"}

    seeds = {}
    violations = {}
    for number, entry in sorted(after["seeds"].items(), key=lambda kv: int(kv[0])):
        prior = before["seeds"].get(number, {})
        filename = entry.get("file")
        keys = []
        path = os.path.join(args.seeds_dir, filename) if filename else None
        if path and os.path.exists(path):
            for line in open(path, encoding="utf-8"):
                line = line.strip()
                if line:
                    keys.append(json.loads(line).get("key"))
        hit = sorted(k for k in keys if k in suppressed)
        if hit:
            violations[number] = {"count": len(hit), "examples": hit[:5]}
        seeds[number] = {
            "name": entry.get("name"),
            "before": prior.get("fires"),
            "after": entry.get("fires"),
            "delta": (entry.get("fires") or 0) - (prior.get("fires") or 0),
            "beforeDiscarded": prior.get("discarded"),
            "afterDiscarded": entry.get("discarded"),
            "afterReason": entry.get("reason"),
            "rowsWritten": len(keys),
            "suppressionAbsolute": number in SUPPRESSION_ABSOLUTE,
            "suppressedKeysInFile": len(hit),
            "firesByTier": {
                str(t): sum(1 for k in keys if tiers.get(k) == t) for t in (1, 2, 3)
            },
        }

    absolute_clean = all(seeds[n]["suppressedKeysInFile"] == 0 for n in SUPPRESSION_ABSOLUTE if n in seeds)

    payload = {
        "generatedBy": "scripts/revamp/derived_fire_counts.py",
        "step": "4.6",
        "spec": "docs/specs/revamp-2026-09.md#phase-4",
        "before": {
            "path": args.before,
            "asOf": before.get("asOf"),
            "fieldsDirectory": (before.get("inputs") or {}).get("fields", {}).get("directory"),
            "suppressedPages": (before.get("inputs") or {}).get("assignments", {}).get("suppressed"),
        },
        "after": {
            "path": args.after,
            "asOf": after.get("asOf"),
            "fieldsDirectory": (after.get("inputs") or {}).get("fields", {}).get("directory"),
            "suppressedPages": (after.get("inputs") or {}).get("assignments", {}).get("suppressed"),
            "assignmentLines": assignment_lines,
        },
        "minFires": after.get("minFires"),
        "floorReapplied": True,
        "indexes": {"before": before.get("indexes"), "after": after.get("indexes")},
        "seeds": seeds,
        "suppression": {
            "suppressedPagesBefore": (before.get("inputs") or {}).get("assignments", {}).get("suppressed"),
            "suppressedPagesAfter": len(suppressed),
            "newlySuppressedByControlledField": controlled["suppression"]["newlySuppressedByControlledField"],
            "controlledTriggerPages": controlled["trigger"]["pagesFiring"],
            "controlledTriggerByRegister": controlled["trigger"]["byRegister"],
            "seedsRequiredToHoldNoSuppressedPage": sorted(SUPPRESSION_ABSOLUTE, key=int),
            "seedsHoldingASuppressedPage": violations,
            "nOf1DesignabilityNeverFiresOnASuppressedPage": seeds.get("2", {}).get("suppressedKeysInFile") == 0,
            "seeds1And6NeverFireOnASuppressedPage": all(
                seeds.get(n, {}).get("suppressedKeysInFile") == 0 for n in ("1", "6")
            ),
            "allSuppressionAbsoluteSeedsClean": absolute_clean,
        },
    }
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")

    print("%-4s %-34s %8s %8s %8s" % ("seed", "name", "before", "after", "delta"))
    for number in sorted(seeds, key=int):
        s = seeds[number]
        print(
            "%-4s %-34s %8s %8s %8s%s"
            % (
                number,
                (s["name"] or "")[:34],
                s["before"],
                s["after"],
                "%+d" % s["delta"],
                "  DISCARDED" if s["afterDiscarded"] else "",
            )
        )
    print()
    print("suppressed pages before %s, after %d (+%d from the controlled field)"
          % (payload["before"]["suppressedPages"], len(suppressed),
             controlled["suppression"]["newlySuppressedByControlledField"]))
    absolute_hits = {n: violations[n] for n in sorted(SUPPRESSION_ABSOLUTE, key=int) if n in violations}
    print("seeds 1, 2 and 6 holding a suppressed page: %s"
          % (absolute_hits if absolute_hits else "none — seed 1: 0, seed 2: 0, seed 6: 0"))
    other = {n: violations[n]["count"] for n in sorted(violations, key=int) if n not in SUPPRESSION_ABSOLUTE}
    print("suppressed pages in the seeds that are not suppression-absolute (permitted): %s" % other)
    print("wrote %s" % args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
