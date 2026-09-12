#!/usr/bin/env python
"""Retrieve DDInter 2.0 bulk downloads into data/validation/ddinter/<date>/.

DDInter 2.0 is CC BY-NC-SA 4.0. It is retrieved for the Phase 4 validation comparison only,
is stored outside data/sources/, is never mapped into the corpus and is never in the release.

Usage: ddinter_fetch.py <YYYY-MM-DD>
Resume-safe: a file already listed in manifest.json with a matching SHA256 on disk is not refetched.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE = "https://ddinter2.scbdd.com"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LICENCE = "CC BY-NC-SA 4.0"
LICENCE_URL = f"{BASE}/terms/"

ATC_CODES = ["A", "B", "D", "H", "L", "P", "R", "V"]
BULK_FILES = [
    (f"{BASE}/static/media/download/ddinter_downloads_code_{c}.csv", f"ddinter_downloads_code_{c}.csv")
    for c in ATC_CODES
]
LEGAL_FILES = [
    (f"{BASE}/terms/", "terms.html"),
    (f"{BASE}/", "homepage.html"),
    (f"{BASE}/statistics/", "statistics.html"),
    (f"{BASE}/download/", "download-page.html"),
    (f"{BASE}/explanation/", "explanation.html"),
    (f"{BASE}/robots.txt", "robots.txt"),
    (f"{BASE}/server/drug/", "server-drug.html"),
]


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def log_request(log_path: str, url: str, status: str, nbytes: int, out: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(log_path, "a", encoding="utf-8") as fh:
        fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{out}\n")


def fetch(url: str, out_path: str, log_path: str, attempts: int = 3) -> dict:
    """Fetch one URL with `attempts` tries and exponential backoff. Returns a manifest record."""
    last_error = ""
    for attempt in range(1, attempts + 1):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "identity"})
        started = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                body = resp.read()
                status = resp.status
                headers = dict(resp.headers.items())
            with open(out_path, "wb") as fh:
                fh.write(body)
            log_request(log_path, url, str(status), len(body), out_path)
            return {
                "url": url,
                "file": os.path.basename(out_path),
                "http_status": status,
                "bytes": len(body),
                "sha256": sha256_of(out_path),
                "retrieved_utc": started,
                "last_modified": headers.get("Last-Modified"),
                "content_type": headers.get("Content-Type"),
                "attempts": attempt,
                "licence": LICENCE,
                "licence_url": LICENCE_URL,
            }
        except urllib.error.HTTPError as exc:
            body = exc.read()
            with open(out_path, "wb") as fh:
                fh.write(body)
            log_request(log_path, url, str(exc.code), len(body), out_path)
            last_error = f"HTTPError {exc.code} {exc.reason}"
            if exc.code == 404:
                return {
                    "url": url,
                    "file": os.path.basename(out_path),
                    "http_status": exc.code,
                    "bytes": len(body),
                    "sha256": sha256_of(out_path),
                    "retrieved_utc": started,
                    "last_modified": None,
                    "content_type": exc.headers.get("Content-Type"),
                    "attempts": attempt,
                    "licence": LICENCE,
                    "licence_url": LICENCE_URL,
                    "note": "no robots.txt is published at this path; the server answered 404",
                }
        except Exception as exc:  # noqa: BLE001 - the full text is recorded for the blocker path
            last_error = f"{type(exc).__name__}: {exc}"
            log_request(log_path, url, "error", 0, out_path)
        if attempt < attempts:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{url} failed after {attempts} attempts: {last_error}")


def main() -> int:
    date = sys.argv[1]
    base_dir = os.path.join(ROOT, "data", "validation", "ddinter", date)
    raw_dir = os.path.join(base_dir, "raw")
    legal_dir = os.path.join(base_dir, "legal")
    for d in (raw_dir, legal_dir):
        os.makedirs(d, exist_ok=True)
    log_path = os.path.join(base_dir, "requests.log")
    manifest_path = os.path.join(base_dir, "manifest.json")

    known: dict[str, dict] = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as fh:
            prior = json.load(fh)
        for rec in prior.get("files", []):
            known[rec["url"]] = rec

    records = []
    for url, name, target_dir in (
        [(u, n, legal_dir) for u, n in LEGAL_FILES] + [(u, n, raw_dir) for u, n in BULK_FILES]
    ):
        out_path = os.path.join(target_dir, name)
        prior = known.get(url)
        if prior and os.path.exists(out_path) and sha256_of(out_path) == prior.get("sha256"):
            rec = dict(prior)
            rec["refetched"] = False
            records.append(rec)
            print(f"cached {name} {rec['bytes']}")
            continue
        rec = fetch(url, out_path, log_path)
        rec["refetched"] = True
        rec["kind"] = "legal" if target_dir == legal_dir else "raw"
        records.append(rec)
        print(f"fetched {name} {rec['http_status']} {rec['bytes']}")
        time.sleep(1.0)

    for rec in records:
        rec.setdefault("kind", "legal" if rec["file"].endswith(".html") or rec["file"] == "robots.txt" else "raw")

    manifest = {
        "source": "DDInter 2.0",
        "source_url": BASE,
        "retrieval_date": date,
        "retrieval_method": "bulk download from the site's Download page (no API is offered); "
                            "legal pages retrieved before the first data request",
        "licence": LICENCE,
        "licence_url": LICENCE_URL,
        "licence_text": (
            "Data licensing: The DDInter data is made available under a Creative Commons "
            "Attribution-NonCommercial-ShareAlike 4.0 International license. Except as otherwise "
            "provided in any additional terms for a service, you may print or download content from "
            "the services for your own personal, non-commercial, informational or scholarly use. "
            "(verbatim from https://ddinter2.scbdd.com/terms/, retrieved " + date + "; "
            "local copy legal/terms.html)"
        ),
        "robots_txt": "HTTP 404 — no robots.txt is published; no crawl directive exists to observe. "
                      "Local copy legal/robots.txt.",
        "usage_restriction": "VALIDATION ONLY. Non-commercial licence. Stored under data/validation/, "
                             "never under data/sources/, never mapped into the corpus, never in the "
                             "release candidate. Use is gated on Felix's confirmation "
                             "(docs/revamp/BLOCKERS.md).",
        "citation": "Xiong G, et al. DDInter 2.0: an enhanced drug interaction resource with "
                    "expanded data coverage, new interaction types, and improved user interface. "
                    "Nucleic Acids Research 2025.",
        "files": records,
        "total_bytes": sum(r["bytes"] for r in records),
    }
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, sort_keys=False)
        fh.write("\n")
    print(f"manifest {manifest_path} files={len(records)} bytes={manifest['total_bytes']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
