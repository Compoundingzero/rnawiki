#!/usr/bin/env python3
"""Phase 2 — the before/after field census delta.

Reads `data/revamp/field-census-before.csv`, `data/revamp/field-census-after.csv` and the fill
provenance `data/revamp/fields-v2/integration-summary.json` written by
`scripts/revamp/integrate_sources.py`, and writes one row per field per tier with the present count
before, the present count after, the delta and the sources that filled it.

A field the corpus did not carry before has an empty "before" and is marked `new_field`. A field
whose pages-carrying count changed (a field the integration wrote onto a model that did not carry
it) records both denominators, so a delta is never read as a coverage share against the wrong base.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIERS = (1, 2, 3)


def read_census(path: Path) -> dict[str, dict]:
    with path.open(encoding="utf-8", newline="") as handle:
        return {row["field"]: row for row in csv.DictReader(handle)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--before", default=str(ROOT / "data/revamp/field-census-before.csv"))
    parser.add_argument("--after", default=str(ROOT / "data/revamp/field-census-after.csv"))
    parser.add_argument("--summary",
                        default=str(ROOT / "data/revamp/fields-v2/integration-summary.json"))
    parser.add_argument("--out", default=str(ROOT / "data/revamp/field-census-delta.csv"))
    args = parser.parse_args()

    before = read_census(Path(args.before))
    after = read_census(Path(args.after))
    summary = json.loads(Path(args.summary).read_text(encoding="utf-8"))
    fill_sources = summary.get("fillSources", {})

    header = ["field", "tier", "pages_carrying_before", "present_before", "pages_carrying_after",
              "present_after", "delta", "present_pct_before", "present_pct_after",
              "filled_by_sources", "pages_filled_this_run", "status"]
    rows = []
    for field in sorted(set(before) | set(after)):
        b = before.get(field)
        a = after.get(field)
        for tier in TIERS:
            pb = int(b[f"tier{tier}_pages"]) if b else 0
            nb = int(b[f"tier{tier}_present_count"]) if b else 0
            pa = int(a[f"tier{tier}_pages"]) if a else 0
            na = int(a[f"tier{tier}_present_count"]) if a else 0
            if pb == 0 and pa == 0:
                continue
            sources = sorted((fill_sources.get(field, {}).get(f"tier{tier}") or {}).items(),
                             key=lambda kv: (-kv[1], kv[0]))
            filled_pages = (summary.get("fieldsFilled", {}).get(field, {}) or {}).get(f"tier{tier}", 0)
            if b is None:
                status = "new_field"
            elif pb != pa:
                status = "written onto a model that did not carry the field before"
            elif na > nb:
                status = "filled"
            elif na == nb:
                status = "unchanged"
            else:
                status = "fell"
            rows.append({
                "field": field, "tier": tier,
                "pages_carrying_before": pb, "present_before": nb,
                "pages_carrying_after": pa, "present_after": na,
                "delta": na - nb,
                "present_pct_before": round(100.0 * nb / pb, 4) if pb else "",
                "present_pct_after": round(100.0 * na / pa, 4) if pa else "",
                "filled_by_sources": ";".join(f"{s}={n}" for s, n in sources),
                "pages_filled_this_run": filled_pages,
                "status": status,
            })

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

    shown = [r for r in rows if r["delta"] or r["status"] == "new_field"]
    print(f"{'field':<20}{'tier':>5}{'before':>9}{'after':>9}{'delta':>8}  sources")
    for r in shown[:45]:
        print(f"{r['field']:<20}{r['tier']:>5}{r['present_before']:>9}{r['present_after']:>9}"
              f"{r['delta']:>8}  {r['filled_by_sources'][:52]}")
    print(f"rows={len(rows)} changed_or_new={len(shown)}")
    print(f"csv={os.path.relpath(out, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
