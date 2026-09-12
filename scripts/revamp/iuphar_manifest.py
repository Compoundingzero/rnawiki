#!/usr/bin/env python3
"""Build data/sources/iuphar/<date>/manifest.json for the GtoPdb bulk pull.

Reads the raw files already on disk plus requests.log, hashes each file, and
records the URL, retrieval timestamp, byte size, SHA256 and licence. Re-running
is safe: a file whose SHA256 already matches the manifest entry keeps its
recorded retrieval timestamp and is not re-hashed into a new entry.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import sys

DATE = "2026-09-05"
ROOT = pathlib.Path(__file__).resolve().parents[2]
DIR = ROOT / "data" / "sources" / "iuphar" / DATE
RAW = DIR / "raw"
LEGAL = DIR / "legal"
MANIFEST = DIR / "manifest.json"
BASE_URL = "https://www.guidetopharmacology.org"

LICENCE = {
    "database": "Open Data Commons Open Database License (ODbL)",
    "contents": "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
    "statement_url": f"{BASE_URL}/about.jsp#license",
    "statement_quote": (
        "The Guide to PHARMACOLOGY database is licensed under the Open Data Commons "
        "Open Database License (ODbL). Its contents are licensed under a Creative "
        "Commons Attribution-ShareAlike 4.0 International License"
    ),
    "attribution_required": True,
    "share_alike": True,
    "redistribution_permitted": True,
    "commercial_use_permitted": True,
    "commercial_access_fee_notice": (
        "The GtoPdb financial sustainability statement asks commercial organisations "
        "that use GtoPdb to pay an annual access fee (GBP 500 small / 1,000 medium / "
        "2,000 large, per organisation). The fee is an access arrangement with the "
        "resource; it is not a restriction written into the ODbL or CC BY-SA 4.0 terms "
        "that cover the database and its contents. Saved at legal/sustainability.html."
    ),
    "citation": (
        "Harding SD et al. (2026) The IUPHAR/BPS Guide to PHARMACOLOGY. "
        "https://www.guidetopharmacology.org/ - GtoPdb version 2026.2, published 2026-06-15."
    ),
}


def sha256(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_request_log() -> dict[str, tuple[str, str, str]]:
    """url -> (last successful timestamp, status, bytes) for guidetopharmacology.org."""
    out: dict[str, tuple[str, str, str]] = {}
    log = DIR / "requests.log"
    if not log.exists():
        return out
    for line in log.read_text(encoding="utf-8").splitlines():
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        ts, url, status, size = parts[0], parts[1], parts[2], parts[3]
        if "guidetopharmacology.org" not in url:
            continue
        if status == "200":
            out[url] = (ts, status, size)
    return out


def main() -> int:
    previous: dict[str, dict] = {}
    if MANIFEST.exists():
        old = json.loads(MANIFEST.read_text(encoding="utf-8"))
        previous = {f["path"]: f for f in old.get("files", [])}

    log = read_request_log()
    files = []
    for path in sorted(list(RAW.glob("*.csv")) + list(LEGAL.glob("*"))):
        rel = str(path.relative_to(DIR))
        digest = sha256(path)
        if rel in previous and previous[rel].get("sha256") == digest:
            files.append(previous[rel])
            continue
        if path.parent == RAW:
            url = f"{BASE_URL}/DATA/{path.name}"
        elif path.name == "robots-raw-response.txt":
            url = f"{BASE_URL}/robots.txt"
        elif path.name == "robots-redirect-target-login.html":
            url = f"{BASE_URL}/login.jsp"
        elif path.name == "robots-headers.txt":
            url = f"{BASE_URL}/robots.txt"
        elif path.name == "sustainability.html":
            url = f"{BASE_URL}/gtopdbSustainability.jsp"
        elif path.name == "about.html":
            url = f"{BASE_URL}/about.jsp"
        elif path.name == "webServices.html":
            url = f"{BASE_URL}/webServices.jsp"
        elif path.name == "download-page.html":
            url = f"{BASE_URL}/download.jsp"
        elif path.name == "DATA-index.html":
            url = f"{BASE_URL}/DATA/"
        else:
            url = ""
        ts, status, _size = log.get(url, ("", "", ""))
        files.append(
            {
                "path": rel,
                "url": url,
                "retrieved_utc": ts,
                "http_status": status,
                "bytes": path.stat().st_size,
                "sha256": digest,
                "licence": LICENCE["contents"],
            }
        )

    manifest = {
        "source": "iuphar",
        "source_name": "IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb)",
        "source_version": "2026.2",
        "source_published": "2026-06-15",
        "retrieval_date": DATE,
        "retrieval_route": "bulk CSV download from https://www.guidetopharmacology.org/DATA/",
        "base_url": BASE_URL,
        "licence": LICENCE,
        "robots_txt": {
            "url": f"{BASE_URL}/robots.txt",
            "http_status": 302,
            "redirect_location": "/login.jsp",
            "note": (
                "No robots.txt is served: the path answers 302 to /login.jsp, so the site "
                "publishes no crawl directives. Headers saved at legal/robots-headers.txt. "
                "Retrieval used the site's published bulk-download directory /DATA/, which "
                "serves 200 without a session, and the documented web service for two "
                "single-record identifier checks. No interactive page was crawled."
            ),
        },
        "access_note": (
            "The interactive .jsp pages of GtoPdb now sit behind a registration or guest "
            "login (download.jsp answers 302 to /login.jsp). The /DATA/ bulk files and the "
            "/services/ web service answer 200 without a session and are the routes used "
            "here."
        ),
        "request_log": "requests.log",
        "request_log_note": (
            "requests.log lines for drugcentral.org and unmtid-dbs.net were written by a "
            "concurrent source-ingester run sharing this workspace and are not part of the "
            "IUPHAR pull. Every guidetopharmacology.org line is."
        ),
        "files": files,
        "total_bytes": sum(f["bytes"] for f in files),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"manifest: {len(files)} files, {manifest['total_bytes']} bytes -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
