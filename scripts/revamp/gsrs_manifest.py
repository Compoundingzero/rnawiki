#!/usr/bin/env python
"""Write data/sources/gsrs/<date>/manifest.json.

Resume-safe: a file already listed with a matching SHA256 keeps its recorded
retrieval timestamp and is not re-hashed against a different value.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

URLS = {
    "raw/dump-public-2026-08-06.gsrs":
        "https://gsrs.ncats.nih.gov/assets/downloads/dump-public-2026-08-06.gsrs",
    "legal/robots.txt": "https://gsrs.ncats.nih.gov/robots.txt",
    "legal/fda-website-policies.html":
        "https://www.fda.gov/about-fda/about-website/website-policies",
    "legal/fda-gsrs-page.html":
        "https://www.fda.gov/industry/fda-data-standards-advisory-board/"
        "fdas-global-substance-registration-system",
    "legal/precisionfda-uniisearch.html": "https://precision.fda.gov/uniisearch",
    "legal/usa-gov-copyright.html": "https://www.usa.gov/government-copyright",
    "legal/ncats-robots.txt": "https://ncats.nih.gov/robots.txt",
    "legal/dump-head.txt":
        "https://gsrs.ncats.nih.gov/assets/downloads/dump-public-2026-08-06.gsrs (HEAD)",
    "legal/gsrs-app-main.js":
        "https://gsrs.ncats.nih.gov/main.7bf32f449a289080.js",
    "legal/gsrs-dataset-index.json":
        "https://gsrs.ncats.nih.gov/main.7bf32f449a289080.js (embedded dataset index)",
}

LICENCE_TEXT = (
    "US Government work, public domain. GSRS public substance data is produced by the "
    "U.S. Food and Drug Administration and published by NIH's National Center for "
    "Advancing Translational Sciences. FDA's website policy, saved at "
    "legal/fda-website-policies.html, states: \"Unless otherwise noted, the contents of "
    "the FDA website (www.fda.gov) - both text and graphics - are not copyrighted. They "
    "are in the public domain and may be republished, reprinted and otherwise used freely "
    "by anyone without the need to obtain permission from FDA. Credit to the U.S. Food and "
    "Drug Administration as the source is appreciated but not required.\" "
    "gsrs.ncats.nih.gov serves no robots.txt (HTTP 404, saved at legal/robots.txt), so no "
    "crawl directive was in force; the bulk dump linked from the site's own home page was "
    "used rather than page fetching."
)
LICENCE_URL = "https://www.fda.gov/about-fda/about-website/website-policies"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    args = ap.parse_args()

    base = ROOT / "data/sources/gsrs" / args.date
    manifest_path = base / "manifest.json"
    previous = {}
    if manifest_path.exists():
        old = json.loads(manifest_path.read_text(encoding="utf8"))
        previous = {f["path"]: f for f in old.get("files", [])}

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    files = []
    for rel in sorted(URLS):
        p = base / rel
        if not p.exists():
            continue
        digest = sha256(p)
        prior = previous.get(rel)
        retrieved = prior["retrieved"] if prior and prior.get("sha256") == digest else now
        files.append(
            {
                "path": rel,
                "url": URLS[rel],
                "retrieved": retrieved,
                "bytes": p.stat().st_size,
                "sha256": digest,
            }
        )

    manifest = {
        "source": "gsrs",
        "source_name": "GSRS / FDA Global Substance Registration System",
        "retrieval_date": args.date,
        "dataset": "dump-public-2026-08-06.gsrs (GSRS public data export, 177,121 records)",
        "dataset_published": "2026-08-06",
        "retrieval_method":
            "bulk download of the public data export linked from gsrs.ncats.nih.gov; "
            "the API was used only to read the dataset index and one record while "
            "confirming the dump schema",
        "licence": "US Government work, public domain (FDA/NCATS)",
        "licence_url": LICENCE_URL,
        "licence_text": LICENCE_TEXT,
        "request_log": "requests.log",
        "files": files,
        "total_bytes": sum(f["bytes"] for f in files),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"files": len(files), "bytes": manifest["total_bytes"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
