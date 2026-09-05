#!/usr/bin/env python
"""Close the DDInter 2.0 manifest: every file in the retrieval directory carries a SHA256.

The fetchers record the files they request. This walks the whole retrieval directory and adds any
file not yet listed (the endpoint-shape probes kept as evidence under verification/, the request
log, the fetch transcript), so that manifest.json accounts for the directory as it stands.

Usage: ddinter_finalise_manifest.py <YYYY-MM-DD>
"""
from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ddinter_fetch_interactions import LICENCE, ROOT, now, sha256_of  # noqa: E402

KIND_BY_DIR = {"raw": "raw", "legal": "legal", "verification": "verification"}


def main() -> int:
    date = sys.argv[1]
    base_dir = os.path.join(ROOT, "data", "validation", "ddinter", date)
    manifest_path = os.path.join(base_dir, "manifest.json")
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    listed: set[str] = set()
    for rec in manifest["files"]:
        entry = rec.get("file") or ""
        for name in (entry if isinstance(entry, list) else [entry]):
            listed.add(os.path.normpath(name))
            for kind in ("legal", "raw"):
                listed.add(os.path.normpath(os.path.join(kind, name)))

    added = []
    for dirpath, _dirs, files in os.walk(base_dir):
        for name in sorted(files):
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, base_dir)
            if rel == "manifest.json" or os.path.normpath(rel) in listed:
                continue
            top = rel.split(os.sep)[0]
            added.append({
                "url": None,
                "file": rel,
                "kind": KIND_BY_DIR.get(top, "run-artefact"),
                "bytes": os.path.getsize(full),
                "sha256": sha256_of(full),
                "recorded_utc": now(),
                "licence": LICENCE if top in ("raw", "verification") else None,
                "note": "written by this run, not a retrieved document" if top not in KIND_BY_DIR
                        else "retrieved during this run; the request is in requests.log",
            })
    manifest["files"].extend(added)
    manifest["total_bytes"] = sum(r["bytes"] for r in manifest["files"])
    manifest["file_count"] = len(manifest["files"])
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    print(f"added {len(added)} files; manifest now {manifest['file_count']} files, "
          f"{manifest['total_bytes']} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
