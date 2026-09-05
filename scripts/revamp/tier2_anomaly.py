#!/usr/bin/env python3
"""Phase 1.4 — why Tier 2 passed 26 of 4,477.

For each of the eleven fields a Tier 2 (CLINICAL) page carries — the nine inside `fields` plus
the two the loader lifts, `doseStudied` and `approvalDate` — the CSV records:

  * presence before, over the old denominator: the 4,477 Tier 2 pages that the "26 of 4,477"
    figure divides by, and, beside it, over the pages that actually carry the field;
  * presence after, over the pages where the field applies under `docs/specs/field-applicability.md`;
  * how the correction moved: the pages the correction removed from the denominator, and the
    recorded `present` entries a structural rule removed from both sides;
  * which bucket the field falls in.

Bucket rule, stated so it can be checked:

    data fact       the field is absent on more than 1,000 Tier 2 pages where it applies — a gap
                    a Phase 2 source can fill at scale.
    schema artefact the applicability correction removes the field from more than 5 % of Tier 2
                    pages, or drops recorded present entries.
    both            both hold.
    neither         neither holds.

Two summary rows close the file: the Tier 2 pass count at the old corpus-wide threshold of 11,
counted both the old way and over the corrected count, and the pass count at the new Tier 2
threshold from `data/revamp/thresholds.json`.

No network access.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/revamp/tier2-anomaly.csv"
PRESENCE = ROOT / "data/revamp/presence-applicable.ndjson"
APPLICABLE_CENSUS = ROOT / "data/revamp/field-census-applicable.csv"
BEFORE_CENSUS = ROOT / "data/revamp/field-census-before.csv"
THRESHOLDS = ROOT / "data/revamp/thresholds.json"
META_V4 = ROOT / "data/corpus-20k/gate1b/page-meta-v4.json"

TIER2_PAGES = 4477
CLINICAL_FIELDS = [
    "indication",
    "labelKinetics",
    "interactions",
    "adverseEvents",
    "faers",
    "trialHistory",
    "trialFailures",
    "regulatory",
    "withdrawal",
    "doseStudied",
    "approvalDate",
]
DATA_FACT_PAGES = 1000
SCHEMA_ARTEFACT_SHARE = 0.05


def read_csv(path: Path) -> dict[str, dict]:
    with path.open(encoding="utf-8", newline="") as handle:
        return {row["field"]: row for row in csv.DictReader(handle)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default=str(OUT))
    args = parser.parse_args()

    before = read_csv(BEFORE_CENSUS)
    after = read_csv(APPLICABLE_CENSUS)
    thresholds = json.loads(THRESHOLDS.read_text(encoding="utf-8"))
    t2 = thresholds["tiers"]["tier2"]
    tier2_threshold = t2["threshold"]
    rule_answer = t2["ruleAnswerAfterStubFloor"]
    # Where the lexical line rejects every set the bucket rule can offer, the tier has no final
    # threshold. The pass count is then reported at the bucket rule's own answer, labelled as such,
    # because that is the number the "26 of 4,477" comparison is about.
    pass_threshold = tier2_threshold if tier2_threshold is not None else rule_answer
    pass_label = (
        f"the new Tier 2 threshold {tier2_threshold}"
        if tier2_threshold is not None
        else f"the Tier 2 bucket-rule answer {rule_answer} (no count clears the lexical line, so "
             "Tier 2 has no final threshold)"
    )

    presence = {}
    for line in PRESENCE.open(encoding="utf-8"):
        if line.strip():
            row = json.loads(line)
            presence[row["key"]] = row
    tier2 = [r for r in presence.values() if r["tier"] == 2]
    assert len(tier2) == TIER2_PAGES, len(tier2)

    meta = json.loads(META_V4.read_text(encoding="utf-8"))
    old_pass_11 = sum(1 for k, r in presence.items() if r["tier"] == 2 and meta[k]["presentFields"] >= 11)
    corrected_pass_11 = sum(1 for r in tier2 if r["present"] >= 11)
    new_pass = sum(1 for r in tier2 if r["present"] >= pass_threshold)

    header = [
        "row_kind",
        "field",
        "tier2_pages",
        "pages_carrying_field",
        "present_before",
        "present_pct_before_over_4477",
        "present_pct_before_over_carrying",
        "applicable_after",
        "present_after",
        "present_pct_after_over_applicable",
        "pages_left_denominator",
        "share_left_denominator",
        "present_entries_dropped_by_rule",
        "absent_where_applicable",
        "bucket",
    ]
    rows = []
    for name in CLINICAL_FIELDS:
        b = before[name]
        a = after[name]
        carrying = int(b["tier2_pages"])
        present_before = int(b["tier2_present_count"])
        applicable = int(a["tier2_applicable"])
        present_after = int(a["tier2_present"])
        dropped = int(a["tier2_present_dropped_by_rule"])
        left = TIER2_PAGES - applicable
        share_left = left / TIER2_PAGES
        absent_applicable = applicable - present_after
        data_fact = absent_applicable > DATA_FACT_PAGES
        schema = share_left > SCHEMA_ARTEFACT_SHARE or dropped > 0
        bucket = (
            "both" if (data_fact and schema)
            else "data fact" if data_fact
            else "schema artefact" if schema
            else "neither"
        )
        rows.append(
            {
                "row_kind": "field",
                "field": name,
                "tier2_pages": TIER2_PAGES,
                "pages_carrying_field": carrying,
                "present_before": present_before,
                "present_pct_before_over_4477": round(100.0 * present_before / TIER2_PAGES, 4),
                "present_pct_before_over_carrying": float(b["tier2_present_pct"]),
                "applicable_after": applicable,
                "present_after": present_after,
                "present_pct_after_over_applicable": float(a["tier2_present_pct_of_applicable"]),
                "pages_left_denominator": left,
                "share_left_denominator": round(share_left, 4),
                "present_entries_dropped_by_rule": dropped,
                "absent_where_applicable": absent_applicable,
                "bucket": bucket,
            }
        )

    def summary(field, before_val, after_val, note):
        return {
            "row_kind": "summary",
            "field": field,
            "tier2_pages": TIER2_PAGES,
            "pages_carrying_field": "",
            "present_before": before_val,
            "present_pct_before_over_4477": round(100.0 * before_val / TIER2_PAGES, 4),
            "present_pct_before_over_carrying": "",
            "applicable_after": "",
            "present_after": after_val,
            "present_pct_after_over_applicable": round(100.0 * after_val / TIER2_PAGES, 4),
            "pages_left_denominator": "",
            "share_left_denominator": "",
            "present_entries_dropped_by_rule": "",
            "absent_where_applicable": "",
            "bucket": note,
        }

    rows.append(
        summary(
            "pass count at the old corpus-wide threshold 11",
            old_pass_11,
            corrected_pass_11,
            "before = loader present-field count of 11 possible (page-meta-v4); after = the same "
            "threshold of 11 read against the corrected present-over-applicable count",
        )
    )
    rows.append(
        summary(
            f"pass count at {pass_label}",
            old_pass_11,
            new_pass,
            "before = the recorded 26 at threshold 11; after = pages whose corrected count reaches "
            f"{pass_label}, derived in data/revamp/thresholds.json",
        )
    )

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f"tier 2 pages {TIER2_PAGES}; old threshold 11 pass {old_pass_11}; "
          f"corrected count at 11 {corrected_pass_11}; at {pass_label} pass {new_pass}")
    for row in rows:
        if row["row_kind"] != "field":
            continue
        print(
            f"{row['field']:<14} before {row['present_pct_before_over_4477']:>7.2f}% -> after "
            f"{row['present_pct_after_over_applicable']:>7.2f}% over {row['applicable_after']:>5} "
            f"applicable; absent where applicable {row['absent_where_applicable']:>5}  {row['bucket']}"
        )
    print(f"csv={os.path.relpath(out_path, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
