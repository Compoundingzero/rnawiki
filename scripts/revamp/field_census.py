#!/usr/bin/env python3
"""Field census over the corpus-20k field batches, grouped by deployment tier.

Rows are field names (the union of every field name emitted by any model, including
the top-level entries such as doseStudied and approvalDate that the loader lifts
alongside the nested `fields` map). Columns are per-tier and total counts of the
three recorded states.

Tier is derived from data/corpus-20k/tiers/model-assignment.ndjson by the promotion
rule in data/corpus-20k/tiers/promotion-rule.md, evaluated in order:

    Tier 1  model == "LONGEVITY" or withdrawn == true
    Tier 2  model == "CLINICAL" and not withdrawn
    Tier 3  model == "DEVELOPMENT" and not withdrawn

The per-tier `pages` column is the number of pages in that tier that carry the field
at all; present + absent + not_applicable equals it. Whole-tier page counts live in
`tierSizes` in the JSON output. `universal_blank` is true when present_pct is below 1
in every tier where the field appears at all.

The script rewrites both outputs from the batches on every run, so re-running it after
Phase 2 fills fields produces the after-census with no manual step.
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import os
from collections import defaultdict

STATES = ("present", "absent", "not-applicable")
TIERS = (1, 2, 3)
MODEL_DIRS = ("longevity", "clinical", "development")
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_FIELDS_DIR = os.path.join(REPO_ROOT, "data", "corpus-20k", "fields")
DEFAULT_ASSIGNMENT = os.path.join(
    REPO_ROOT, "data", "corpus-20k", "tiers", "model-assignment.ndjson"
)
DEFAULT_OUT = os.path.join(REPO_ROOT, "data", "revamp", "field-census-before.csv")


def tier_of(model: str, withdrawn: bool) -> int | None:
    if model == "LONGEVITY" or withdrawn:
        return 1
    if model == "CLINICAL":
        return 2
    if model == "DEVELOPMENT":
        return 3
    return None


def read_assignment(path: str) -> tuple[dict[str, int], dict[int, int], list[str]]:
    tier_by_key: dict[str, int] = {}
    tier_sizes: dict[int, int] = {t: 0 for t in TIERS}
    untiered: list[str] = []
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            tier = tier_of(row.get("model", ""), bool(row.get("withdrawn")))
            if tier is None:
                untiered.append(row["key"])
                continue
            tier_by_key[row["key"]] = tier
            tier_sizes[tier] += 1
    return tier_by_key, tier_sizes, untiered


def field_states(record: dict) -> dict[str, str]:
    """Every field entry on one page: the nested `fields` map plus lifted top-level entries."""
    out: dict[str, str] = {}
    for name, entry in (record.get("fields") or {}).items():
        if isinstance(entry, dict) and "state" in entry:
            out[name] = entry["state"]
    for name, entry in record.items():
        if name == "fields":
            continue
        if isinstance(entry, dict) and "state" in entry:
            out[name] = entry["state"]
    return out


def collect(fields_dir: str, tier_by_key: dict[str, int]):
    # counts[field][tier][state]
    counts: dict[str, dict[int, dict[str, int]]] = defaultdict(
        lambda: {t: {s: 0 for s in STATES} for t in TIERS}
    )
    field_order: list[str] = []
    seen_fields: set[str] = set()
    pages_seen: set[str] = set()
    unknown_state: dict[str, int] = defaultdict(int)
    unassigned_pages = 0

    for model_dir in MODEL_DIRS:
        pattern = os.path.join(fields_dir, model_dir, "batch-*.ndjson")
        for batch in sorted(glob.glob(pattern)):
            with open(batch, encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line:
                        continue
                    record = json.loads(line)
                    key = record["key"]
                    tier = tier_by_key.get(key)
                    if tier is None:
                        unassigned_pages += 1
                        continue
                    pages_seen.add(key)
                    for name, state in field_states(record).items():
                        if name not in seen_fields:
                            seen_fields.add(name)
                            field_order.append(name)
                        if state not in STATES:
                            unknown_state[f"{name}:{state}"] += 1
                            continue
                        counts[name][tier][state] += 1

    missing_pages = sorted(set(tier_by_key) - pages_seen)
    return counts, field_order, len(pages_seen), unassigned_pages, missing_pages, dict(unknown_state)


def build_rows(counts, field_order):
    rows = []
    for name in sorted(field_order):
        per_tier = counts[name]
        row = {"field": name}
        totals = {s: 0 for s in STATES}
        appears_in = []
        blank_in_all = True
        for tier in TIERS:
            c = per_tier[tier]
            pages = sum(c[s] for s in STATES)
            pct = round(100.0 * c["present"] / pages, 4) if pages else 0.0
            row[f"tier{tier}_pages"] = pages
            row[f"tier{tier}_present_count"] = c["present"]
            row[f"tier{tier}_present_pct"] = pct
            row[f"tier{tier}_absent_count"] = c["absent"]
            row[f"tier{tier}_not_applicable_count"] = c["not-applicable"]
            for s in STATES:
                totals[s] += c[s]
            if pages:
                appears_in.append(tier)
                if pct >= 1.0:
                    blank_in_all = False
        total_pages = sum(totals.values())
        row["total_pages"] = total_pages
        row["total_present_count"] = totals["present"]
        row["total_present_pct"] = (
            round(100.0 * totals["present"] / total_pages, 4) if total_pages else 0.0
        )
        row["total_absent_count"] = totals["absent"]
        row["total_not_applicable_count"] = totals["not-applicable"]
        row["tiers_present_in"] = ";".join(str(t) for t in appears_in)
        row["universal_blank"] = bool(appears_in) and blank_in_all
        rows.append(row)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fields-dir", default=DEFAULT_FIELDS_DIR)
    parser.add_argument("--assignment", default=DEFAULT_ASSIGNMENT)
    parser.add_argument("--out", default=DEFAULT_OUT, help="CSV output path")
    parser.add_argument(
        "--out-json",
        default=None,
        help="JSON output path (default: --out with a .json suffix)",
    )
    args = parser.parse_args()

    out_csv = args.out
    out_json = args.out_json or (
        out_csv[: -len(".csv")] + ".json" if out_csv.endswith(".csv") else out_csv + ".json"
    )

    tier_by_key, tier_sizes, untiered = read_assignment(args.assignment)
    counts, field_order, pages_seen, unassigned, missing_pages, unknown_state = collect(
        args.fields_dir, tier_by_key
    )
    rows = build_rows(counts, field_order)
    universal_blank = [r["field"] for r in rows if r["universal_blank"]]

    header = ["field"]
    for tier in TIERS:
        header += [
            f"tier{tier}_pages",
            f"tier{tier}_present_count",
            f"tier{tier}_present_pct",
            f"tier{tier}_absent_count",
            f"tier{tier}_not_applicable_count",
        ]
    header += [
        "total_pages",
        "total_present_count",
        "total_present_pct",
        "total_absent_count",
        "total_not_applicable_count",
        "tiers_present_in",
        "universal_blank",
    ]

    os.makedirs(os.path.dirname(os.path.abspath(out_csv)), exist_ok=True)
    with open(out_csv, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        for row in rows:
            writer.writerow({**row, "universal_blank": "true" if row["universal_blank"] else "false"})

    payload = {
        "generated_from": {
            "fieldsDir": os.path.relpath(args.fields_dir, REPO_ROOT),
            "assignment": os.path.relpath(args.assignment, REPO_ROOT),
        },
        "tierRule": "Tier 1 = LONGEVITY or withdrawn; Tier 2 = remaining CLINICAL; Tier 3 = remaining DEVELOPMENT",
        "tierSizes": {str(t): tier_sizes[t] for t in TIERS},
        "corpusPages": sum(tier_sizes.values()),
        "pagesWithFieldRecords": pages_seen,
        "pagesInAssignmentWithoutFieldRecords": len(missing_pages),
        "pagesInBatchesNotInAssignment": unassigned,
        "pagesWithUnrecognisedModel": untiered,
        "unrecognisedStates": unknown_state,
        "fieldCount": len(rows),
        "universalBlank": universal_blank,
        "fields": rows,
    }
    with open(out_json, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=False)
        handle.write("\n")

    print(
        f"tier sizes: 1={tier_sizes[1]} 2={tier_sizes[2]} 3={tier_sizes[3]} "
        f"total={sum(tier_sizes.values())}; pages with field records={pages_seen}; "
        f"fields={len(rows)}"
    )
    print(
        f"{'field':<20} {'T1 pres/pages':>16} {'T2 pres/pages':>16} "
        f"{'T3 pres/pages':>16} {'total%':>7}  blank"
    )
    for row in rows[:45]:
        cells = []
        for tier in TIERS:
            pages = row[f"tier{tier}_pages"]
            cells.append(
                f"{row[f'tier{tier}_present_count']}/{pages} ({row[f'tier{tier}_present_pct']:.1f}%)"
                if pages
                else "-"
            )
        print(
            f"{row['field']:<20} {cells[0]:>16} {cells[1]:>16} {cells[2]:>16} "
            f"{row['total_present_pct']:>6.1f}%  {'yes' if row['universal_blank'] else ''}"
        )
    print(f"universal_blank ({len(universal_blank)}): {', '.join(universal_blank) or 'none'}")
    print(f"csv={out_csv}")
    print(f"json={out_json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
