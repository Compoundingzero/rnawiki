#!/usr/bin/env python
"""Step 0.3: split the live fetch into the per-set page files the corpus-20k scorer reads.

One NDJSON per set, the way the Phase 5 measurement did it (measure.py --sample truncates a page
key at its first comma, so COMBO keys are silently dropped; the recorded workaround is one file per
set). Rows are written in the order of the set's key list, which is the order Phase 5 wrote them in
(data/corpus-20k/final/pages/*.ndjson).

Also writes the crawl text-to-HTML figures: visible characters of the whole document (extract.py's
fullChars) divided by the HTML byte count, per page, and the median over the indexed set, over
every fetched dossier, and per tier.

    baseline_sets.py --fetched data/revamp/baseline/html-text/live-dossiers.ndjson \
        --out data/revamp/baseline
"""

from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FINAL_LISTS = ROOT / "data" / "corpus-20k" / "final" / "lists"
SETS = ["draw803", "draw324", "indexed", "matched604", "matched252"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetched", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    pages_dir = args.out / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    fetched = {}
    order = []
    non200 = []
    for line in args.fetched.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        fetched[record["key"]] = record
        order.append(record["key"])
        if record.get("status") != 200:
            non200.append({"key": record["key"], "slug": record["slug"], "status": record.get("status")})

    written = {}
    missing = {}
    for name in SETS:
        keys = [line.strip() for line in (FINAL_LISTS / f"{name}.txt").read_text(encoding="utf-8").splitlines() if line.strip()]
        absent = [k for k in keys if k not in fetched]
        missing[name] = absent
        with (pages_dir / f"{name}.ndjson").open("w", encoding="utf-8") as out:
            for key in keys:
                if key not in fetched:
                    continue
                record = fetched[key]
                out.write(json.dumps({"key": key, "text": record["text"], "tier": record["tier"]}) + "\n")
        written[name] = len(keys) - len(absent)

    indexed_keys = [line.strip() for line in (FINAL_LISTS / "indexed.txt").read_text(encoding="utf-8").splitlines() if line.strip()]
    with (pages_dir / "indexed-prose.ndjson").open("w", encoding="utf-8") as out:
        for key in indexed_keys:
            if key not in fetched:
                continue
            record = fetched[key]
            out.write(json.dumps({"key": key, "text": record["proseText"], "tier": record["tier"]}) + "\n")
    with (pages_dir / "live.ndjson").open("w", encoding="utf-8") as out:
        for key in order:
            record = fetched[key]
            out.write(json.dumps({"key": key, "text": record["text"], "tier": record["tier"]}) + "\n")

    def crawl(record: dict) -> float | None:
        return record["fullChars"] / record["htmlBytes"] if record.get("htmlBytes") else None

    indexed_ratios = [crawl(fetched[k]) for k in indexed_keys if k in fetched]
    all_ratios = [crawl(r) for r in fetched.values() if crawl(r) is not None]
    by_tier = {}
    for tier in ("tier1", "tier2", "tier3"):
        ratios = [crawl(r) for r in fetched.values() if r.get("tier") == tier and crawl(r) is not None]
        if ratios:
            by_tier[tier] = round(statistics.median(ratios), 5)

    summary = {
        "fetchedPages": len(fetched),
        "status200": len(fetched) - len(non200),
        "non200": non200,
        "setsWritten": written,
        "keysMissingFromFetch": {k: v for k, v in missing.items() if v},
        "crawlTextToHtml": {
            "definition": "extract.py fullChars / htmlBytes, the same figure Gate 2 and the Phase 5 measurement recorded",
            "indexedMedian": round(statistics.median(indexed_ratios), 5),
            "indexedMin": round(min(indexed_ratios), 5),
            "indexedMax": round(max(indexed_ratios), 5),
            "allFetchedMedian": round(statistics.median(all_ratios), 5),
            "byTierMedian": by_tier,
        },
        "perSampleCrawl": {
            r["slug"]: {"crawl": round(crawl(r), 5), "htmlBytes": r["htmlBytes"], "visibleChars": r["fullChars"]}
            for r in fetched.values()
            if r["slug"] in {
                "metformin", "cysteamine", "rofecoxib", "sirolimus", "carbidopa-levodopa",
                "cdx-3379", "1-2-distearoyl-sn-glycero-3-phosphocholine", "amlodipine",
            }
        },
    }
    (args.out / "sets.json").write_text(json.dumps(summary, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
