#!/usr/bin/env python3
"""Count the structured-data blocks and the `<main>` elements a built page serves.

Phase 6.2's invariant list (docs/specs/revamp-2026-09.md operating rule 7 and the public copy
rules in CLAUDE.md) requires one `<main>` per public page, and the corpus-20k gate recorded one
JSON-LD block per dossier. Step 6.1 rewrote `/d/*` and `/h/*` as server-written documents
(`lib/document/render.tsx`), so both facts are re-measured on every build rather than assumed.

The sample is drawn from the loaded database's own page list, one deterministic draw per seed:
`--sample` indexable pages and `--sample` pages the load marked noindex, plus the hubs the build
publishes when `--hubs` is given. Every page is fetched once from the running build; the counts are
the served bytes'.

The split is the rule, not a convenience. A structured-data block describes a page to a search
engine, and a page the ruler excluded from the index is not offered to one: an indexable page
carries exactly one JSON-LD block and a noindex page carries none. Drawing by tier instead measured
whichever mix of the two a tier happened to hold — under the corpus-20k ruler most of Tier 1 was
indexable and the difference did not show; under the revamp ruler 292 of Tier 1's 1,697 pages are,
and a tier draw reported every noindex page it happened to draw as a failure.

    scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3199 \
        --sample 20 --seed 20260912 --out data/revamp/jsonld-v11.json
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

LD_JSON = re.compile(rb'<script[^>]+type=["\']application/ld\+json["\'][^>]*>', re.IGNORECASE)
MAIN_OPEN = re.compile(rb"<main\b", re.IGNORECASE)


def psql(database_url: str, sql: str) -> list[list[str]]:
    result = subprocess.run(
        ["psql", database_url, "-At", "-F", "\t", "-c", sql],
        check=True,
        capture_output=True,
        text=True,
        env={**os.environ, "PGCLIENTENCODING": "UTF8"},
    )
    rows = []
    for line in result.stdout.splitlines():
        if line:
            rows.append(line.split("\t"))
    return rows


def fetch(url: str, timeout: float) -> tuple[int, bytes]:
    request = urllib.request.Request(url, headers={"User-Agent": "rnawiki-jsonld-check/1"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:3199")
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--sample", type=int, default=20)
    parser.add_argument("--seed", type=int, default=20260912)
    parser.add_argument("--hubs", type=int, default=0, help="hub pages to add to the draw")
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--out", type=Path, default=ROOT / "data/revamp/jsonld-check.json")
    args = parser.parse_args(argv)

    if not args.database_url:
        raise SystemExit("DATABASE_URL is required: the draw reads the loaded build's page list.")

    started = time.time()
    base = args.base_url.rstrip("/")
    pages = psql(
        args.database_url,
        "SELECT slug, tier, indexable FROM corpus_pages ORDER BY slug",
    )
    rng = random.Random(args.seed)
    indexable = [slug for slug, _tier, flag in pages if flag == "t"]
    noindex: dict[str, list[str]] = {}
    for slug, tier, flag in pages:
        if flag != "t":
            noindex.setdefault(tier, []).append(slug)
    if not indexable:
        raise SystemExit("the loaded build marks no page indexable; there is nothing to check")

    drawn: list[tuple[str, str]] = [
        (f"/d/{slug}", "indexable")
        for slug in rng.sample(indexable, min(args.sample, len(indexable)))
    ]
    # The noindex half is spread over the tiers, because a stub and a full page that both fell
    # below the ruler must each carry no block.
    tiers = sorted(noindex)
    per_tier = max(1, args.sample // max(1, len(tiers)))
    taken: list[str] = []
    for tier in tiers:
        pool = noindex[tier]
        taken.extend(rng.sample(pool, min(per_tier, len(pool))))
    while len(taken) < args.sample and tiers:
        tier = max(tiers, key=lambda t: len(noindex[t]))
        pool = [slug for slug in noindex[tier] if slug not in taken]
        if not pool:
            break
        taken.append(rng.choice(pool))
    drawn.extend((f"/d/{slug}", "noindex") for slug in taken[: args.sample])

    if args.hubs:
        hub_rows = psql(args.database_url, "SELECT slug FROM hubs ORDER BY slug")
        hub_slugs = [row[0] for row in hub_rows]
        for slug in rng.sample(hub_slugs, min(args.hubs, len(hub_slugs))):
            drawn.append((f"/h/{slug}", "hub"))

    results = []
    failures = []
    for path, kind in drawn:
        status, body = fetch(f"{base}{path}", args.timeout)
        ld = len(LD_JSON.findall(body))
        mains = len(MAIN_OPEN.findall(body))
        row = {"path": path, "kind": kind, "status": status, "jsonLdBlocks": ld, "mainElements": mains}
        results.append(row)
        wanted = 0 if kind == "noindex" else 1
        if status != 200 or ld != wanted or mains != 1:
            failures.append(row)

    report = {
        "schema": "rnawiki-revamp-jsonld-split/v1",
        "spec": "docs/specs/revamp-2026-09.md operating rule 7; CLAUDE.md public copy rules",
        "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "baseUrl": base,
        "seed": args.seed,
        "requested": args.sample,
        "hubsRequested": args.hubs,
        "fetched": len(results),
        "indexableDrawn": sum(1 for r in results if r["kind"] == "indexable"),
        "noindexDrawn": sum(1 for r in results if r["kind"] == "noindex"),
        "indexableWithExactlyOneBlock":
            sum(1 for r in results if r["kind"] == "indexable" and r["jsonLdBlocks"] == 1),
        "noindexWithZeroBlocks":
            sum(1 for r in results if r["kind"] == "noindex" and r["jsonLdBlocks"] == 0),
        "pagesWithExactlyOneMain": sum(1 for r in results if r["mainElements"] == 1),
        "failures": failures,
        "rows": results,
        "runtimeSeconds": round(time.time() - started, 2),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        f"{len(results)} fetched · one JSON-LD block on "
        f"{report['indexableWithExactlyOneBlock']}/{report['indexableDrawn']} indexable · "
        f"none on {report['noindexWithZeroBlocks']}/{report['noindexDrawn']} noindex · "
        f"one <main> on {report['pagesWithExactlyOneMain']} · {len(failures)} failures -> {args.out}"
    )
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
