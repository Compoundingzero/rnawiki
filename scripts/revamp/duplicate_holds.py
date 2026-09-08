#!/usr/bin/env python
"""The duplicate hold (docs/specs/phase4-generators.md §13 item 14).

Reads the rendered duplicate check's own outputs and decides, for every indexable-to-indexable
pair still at or above the 0.5 line after the §13 generator rules, which of the two pages is held:

    the page with fewer own facts carries `noindex,follow` and a link to the other,
    until Felix decides which of the two the corpus keeps.

"Own facts" is the ruler's own numerator — the count of present fields among the fields that apply
to that page, from `presence-applicable-*.ndjson` — because that is the number the indexable
decision is already made on. A tie is broken on the slug so the choice is the same on every run and
never on the order a CSV happened to hold.

Nothing here merges, renames or deletes a page. The pair is written to the held list for a person to
read, with the default `docs/specs/phase4-generators.md` §13 item 14 states: one page per product.

    scripts/revamp/duplicate_holds.py \\
        --summary data/revamp/rendered-dups-v7-summary.json \\
        --pairs data/revamp/rendered-dups-v7.csv \\
        --presence data/revamp/presence-applicable-v7.ndjson \\
        --slugs data/revamp/identity/page-slugs.csv \\
        --out data/revamp/identity/duplicate-holds.csv \\
        --hold-list data/revamp/identity/hold-list-v5.csv

Outputs
    data/revamp/identity/duplicate-holds.csv   held_slug, held_key, link_slug, link_key, jaccard,
                                               reason, held_present, link_present, source
    the hold list, appended                    one row per pair, with the recorded default
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

HOLD_SOURCE = "rendered duplicate check, docs/specs/phase4-generators.md §13 item 14"
HOLD_DEFAULT = (
    "one page per product — the two records describe one product and the corpus keeps one page "
    "for it; until that is decided the page with fewer own facts is noindex,follow and links to "
    "the other"
)


def summary_reason(summary: dict) -> str:
    """The reason class the check recorded for its indexable pairs.

    The pairs CSV carries the two sides, the width and the score; the reason class is a summary
    figure. Where exactly one class holds indexable pairs, that class is the reason and is named on
    the held row; where more than one does, the row says so rather than picking.
    """
    named = [
        name
        for name, counts in (summary.get("reasons") or {}).items()
        if int((counts or {}).get("indexablePairs") or 0) > 0
    ]
    return named[0] if len(named) == 1 else ""


def read_pairs(path: Path) -> list[dict[str, str]]:
    """Every distinct indexable-to-indexable pair the check flagged, once per pair."""
    seen: dict[tuple[str, str], dict[str, str]] = {}
    with path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("indexable_a") != "true" or row.get("indexable_b") != "true":
                continue
            if row.get("set_a") != "indexable" or row.get("set_b") != "indexable":
                continue
            pair = tuple(sorted((row["page_a"], row["page_b"])))
            held = seen.get(pair)
            jaccard = float(row.get("jaccard") or 0)
            if held is None or jaccard > float(held["jaccard"]):
                seen[pair] = {
                    "page_a": pair[0],
                    "page_b": pair[1],
                    "jaccard": f"{jaccard:.4f}",
                    "reason": row.get("reason") or "",
                }
    return [seen[key] for key in sorted(seen)]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--summary", type=Path, required=True)
    parser.add_argument("--pairs", type=Path, required=True)
    parser.add_argument("--presence", type=Path, required=True)
    parser.add_argument("--slugs", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--hold-list", type=Path, required=True)
    args = parser.parse_args(argv)

    summary = json.loads(args.summary.read_text())
    pairs = read_pairs(args.pairs)
    recorded_reason = summary_reason(summary)
    for pair in pairs:
        if not pair["reason"]:
            pair["reason"] = recorded_reason
    flagged = int(summary.get("indexablePairsFlagged") or 0)

    key_of: dict[str, str] = {}
    name_of: dict[str, str] = {}
    tier_of: dict[str, str] = {}
    with args.slugs.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            key_of[row["slug"]] = row["key"]
            name_of[row["slug"]] = row.get("display_name") or row["slug"]
            tier_of[row["slug"]] = row.get("tier") or ""

    present: dict[str, int] = {}
    with args.presence.open(encoding="utf-8") as handle:
        for line in handle:
            record = json.loads(line)
            present[record["key"]] = int(record.get("present") or 0)

    holds = []
    for pair in pairs:
        sides = []
        for slug in (pair["page_a"], pair["page_b"]):
            key = key_of.get(slug, "")
            sides.append((present.get(key, 0), slug, key))
        # Fewer own facts is held; a tie is broken on the slug, so the choice never depends on the
        # order the check's CSV happened to hold.
        sides.sort(key=lambda side: (side[0], side[1]))
        held, link = sides[0], sides[1]
        holds.append(
            {
                "held_slug": held[1],
                "held_key": held[2],
                "link_slug": link[1],
                "link_key": link[2],
                "jaccard": pair["jaccard"],
                "reason": pair["reason"],
                "held_present": held[0],
                "link_present": link[0],
                "source": HOLD_SOURCE,
            }
        )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "held_slug",
                "held_key",
                "link_slug",
                "link_key",
                "jaccard",
                "reason",
                "held_present",
                "link_present",
                "source",
            ],
        )
        writer.writeheader()
        for row in holds:
            writer.writerow(row)

    appended = 0
    if holds:
        with args.hold_list.open(encoding="utf-8", newline="") as handle:
            existing_rows = list(csv.DictReader(handle))
            fieldnames = list(existing_rows[0].keys()) if existing_rows else []
        if not fieldnames:
            with args.hold_list.open(encoding="utf-8", newline="") as handle:
                fieldnames = next(csv.reader(handle))
        already = {(row.get("page_a"), row.get("page_b")) for row in existing_rows}
        with args.hold_list.open("a", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            for row in holds:
                if (row["held_key"], row["link_key"]) in already:
                    continue
                writer.writerow(
                    {
                        name: ""
                        for name in fieldnames
                    }
                    | {
                        key: value
                        for key, value in {
                            "page_a": row["held_key"],
                            "page_b": row["link_key"],
                            "resolved_page_b": row["link_key"],
                            "name_a": name_of.get(row["held_slug"], row["held_slug"]),
                            "name_b": name_of.get(row["link_slug"], row["link_slug"]),
                            "reach": "indexable",
                            "tier": tier_of.get(row["held_slug"], ""),
                            "second_verdict": "duplicate_hold",
                            "confidence": "measured",
                            "recommended_default": HOLD_DEFAULT,
                            "first_pass_reason": (
                                "the rendered duplicate check measures these two pages at "
                                f"{row['jaccard']} Jaccard after the §13 generator rules "
                                f"(reason class {row['reason'] or 'unclassified'})"
                            ),
                            "second_evidence": (
                                f"own facts: {row['held_slug']} {row['held_present']}, "
                                f"{row['link_slug']} {row['link_present']}"
                            ),
                            "licence_ground": HOLD_SOURCE,
                        }.items()
                        if key in fieldnames
                    }
                )
                appended += 1

    print(
        json.dumps(
            {
                "indexablePairsFlaggedInSummary": flagged,
                "distinctIndexablePairs": len(pairs),
                "holds": len(holds),
                "appendedToHoldList": appended,
                "out": str(args.out),
                "holdList": str(args.hold_list),
                "pairs": [
                    f"{row['held_slug']} held, links to {row['link_slug']} ({row['jaccard']})"
                    for row in holds
                ],
            },
            indent=1,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
