#!/usr/bin/env python
"""Retrieve the DDInter 2.0 interaction description table.

/server/interact-with/<id>/ returns an interaction_id per pair; the text of the interaction lives
in the table behind /server/interaction-source/ (8,466 distinct descriptions with mechanism flags).
Both are needed for the Phase 4 validation comparison, which reads what DDInter states about a pair.

DDInter 2.0 is CC BY-NC-SA 4.0; everything written here stays under data/validation/.

Usage: ddinter_fetch_descriptions.py <YYYY-MM-DD>
Resume-safe: a page already on disk whose SHA256 matches manifest.json is not refetched.
"""
from __future__ import annotations

import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ddinter_fetch_interactions import BASE, LICENCE, ROOT, now, post, sha256_of  # noqa: E402

PAGE_SIZE = 2000
PAUSE_S = 0.7


def main() -> int:
    date = sys.argv[1]
    base_dir = os.path.join(ROOT, "data", "validation", "ddinter", date)
    page_dir = os.path.join(base_dir, "raw", "interaction-source")
    os.makedirs(page_dir, exist_ok=True)
    log_path = os.path.join(base_dir, "requests.log")
    manifest_path = os.path.join(base_dir, "manifest.json")
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    known = {rec["url"]: rec for rec in manifest["files"]}

    url = f"{BASE}/server/interaction-source/"
    records: list[dict] = []
    start, page_no, total = 0, 0, None
    while total is None or start < total:
        note = f"draw=1&start={start}&length={PAGE_SIZE}"
        out_path = os.path.join(page_dir, f"page-{page_no:04d}.json")
        prior = known.get(f"{url}#{note}")
        if prior and os.path.exists(out_path) and sha256_of(out_path) == prior.get("sha256"):
            body = open(out_path, "rb").read()
            status, refetched = prior["http_status"], False
        else:
            body, status = post(url, {"draw": 1, "start": start, "length": PAGE_SIZE}, log_path, note)
            with open(out_path, "wb") as fh:
                fh.write(body)
            refetched = True
            time.sleep(PAUSE_S)
        parsed = json.loads(body)
        total = parsed["recordsTotal"]
        records.append({
            "url": f"{url}#{note}",
            "file": os.path.relpath(out_path, base_dir),
            "http_status": status,
            "bytes": len(body),
            "sha256": sha256_of(out_path),
            "retrieved_utc": now() if refetched else prior.get("retrieved_utc"),
            "records": len(parsed["data"]),
            "records_total": total,
            "kind": "raw",
            "licence": LICENCE,
            "refetched": refetched,
        })
        print(f"interaction-source page {page_no}: {len(parsed['data'])} of {total}")
        start += PAGE_SIZE
        page_no += 1

    keep = [r for r in manifest["files"] if not r["url"].startswith(f"{url}#")]
    manifest["files"] = keep + records
    manifest["total_bytes"] = sum(r["bytes"] for r in manifest["files"])
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    print(f"manifest updated: {len(manifest['files'])} files, {manifest['total_bytes']} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
