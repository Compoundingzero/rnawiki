#!/usr/bin/env python
"""Step 0.3 input lists: rebuild the exact URL set the corpus-20k Phase 5 measurement fetched.

The Phase 5 MEASURE stage fetched 1,592 dossier pages (the seeded 803 draw, the seeded 324 draw,
the 636 indexed URLs of sitemaps/tier-1.xml + tier-2.xml, and the eight sample pages) and recorded
every fetched row - key, slug, tier - in data/corpus-20k/final/html-text/live-dossiers.ndjson.
That file is the record of what was fetched, so the union list is rebuilt from it rather than
re-derived, and the per-set key lists are the ones the scorer ran on
(data/corpus-20k/final/lists/*.txt).

Also fetches the live sitemap index and its four children, so the indexed count per tier is read
from the site as served today rather than from a stored list. Every request is appended to
data/corpus-20k/legal/requests.log in the same shape gate2/fetch.py writes.

    baseline_lists.py --out data/revamp/baseline
"""

from __future__ import annotations

import argparse
import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FINAL = ROOT / "data" / "corpus-20k" / "final"
REQUEST_LOG = ROOT / "data" / "corpus-20k" / "legal" / "requests.log"
USER_AGENT = "RNAWiki-gate2-measurement/1.0 (+https://rnawiki.com; own-site baseline)"
SITEMAPS = ["sitemap.xml", "sitemaps/tier-1.xml", "sitemaps/tier-2.xml", "sitemaps/browse.xml", "sitemaps/pages.xml"]


def fetch(url: str, log) -> str:
    started = time.time()
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        body = response.read()
        status = response.status
    log.write(
        json.dumps(
            {
                "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "url": url,
                "status": status,
                "bytes": len(body),
                "elapsedMs": int((time.time() - started) * 1000),
                "agent": USER_AGENT,
            }
        )
        + "\n"
    )
    log.flush()
    return body.decode("utf-8", errors="replace")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=ROOT / "data" / "revamp" / "baseline")
    parser.add_argument("--base", default="https://rnawiki.com")
    args = parser.parse_args()
    lists = args.out / "lists"
    lists.mkdir(parents=True, exist_ok=True)
    (args.out / "sitemaps").mkdir(parents=True, exist_ok=True)

    rows = []
    seen = set()
    for line in (FINAL / "html-text" / "live-dossiers.ndjson").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        if record["key"] in seen:
            continue
        seen.add(record["key"])
        rows.append((record["key"], record["slug"], record["tier"]))
    (lists / "union.tsv").write_text("".join(f"{k}\t{s}\t{t}\n" for k, s, t in rows), encoding="utf-8")

    sample_slugs = [
        "metformin", "cysteamine", "rofecoxib", "sirolimus", "carbidopa-levodopa",
        "cdx-3379", "1-2-distearoyl-sn-glycero-3-phosphocholine", "amlodipine",
    ]
    by_slug = {s: (k, t) for k, s, t in rows}
    missing = [s for s in sample_slugs if s not in by_slug]
    (lists / "samples.tsv").write_text(
        "".join(f"{by_slug[s][0]}\t{s}\t{by_slug[s][1]}\n" for s in sample_slugs if s in by_slug),
        encoding="utf-8",
    )

    with REQUEST_LOG.open("a", encoding="utf-8") as log:
        sitemap_urls = {}
        for name in SITEMAPS:
            xml = fetch(f"{args.base}/{name}", log)
            (args.out / "sitemaps" / name.split("/")[-1]).write_text(xml, encoding="utf-8")
            sitemap_urls[name] = re.findall(r"<loc>([^<]+)</loc>", xml)

    tier1 = [u for u in sitemap_urls["sitemaps/tier-1.xml"] if "/d/" in u]
    tier2 = [u for u in sitemap_urls["sitemaps/tier-2.xml"] if "/d/" in u]
    result = {
        "unionRows": len(rows),
        "unionSource": "data/corpus-20k/final/html-text/live-dossiers.ndjson (the Phase 5 fetch record)",
        "sampleSlugs": sample_slugs,
        "sampleRowsWritten": len(sample_slugs) - len(missing),
        "sampleSlugsMissingFromUnion": missing,
        "sitemapIndexChildren": sitemap_urls["sitemap.xml"],
        "sitemapChildCounts": {name: len(urls) for name, urls in sitemap_urls.items()},
        "indexedPerTier": {"tier1": len(tier1), "tier2": len(tier2), "tier3": 0},
        "indexedTotal": len(tier1) + len(tier2),
        "tier3InAnySitemapChild": 0,
        "setKeyLists": {
            name: sum(1 for line in (FINAL / "lists" / f"{name}.txt").read_text(encoding="utf-8").splitlines() if line.strip())
            for name in ["draw803", "draw324", "indexed", "matched604", "matched252"]
        },
    }
    (args.out / "lists.json").write_text(json.dumps(result, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
