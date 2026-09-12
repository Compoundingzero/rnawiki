"""Retrieve the PMDA English List of Approved Products (New Drugs) and the legal pages.

PMDA's Site Policy (https://www.pmda.go.jp/0048.html, English at /english/0013.html) states, under
"Notes on Downloading Information", that downloads must be limited to the minimum necessary, that
bulk/frequent downloading is prohibited, and that automatic crawling/downloading applications are
not permitted. This script therefore performs a fixed, enumerated list of four requests: two legal
pages, one index page, and the single consolidated PDF that PMDA itself publishes as the whole
English approved-products list (April 2004 to February 2026). It follows no links, discovers no
URLs, and sleeps between requests. Re-running it skips any file whose SHA256 already matches the
manifest entry.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta

import requests

JST = timezone(timedelta(hours=9))
SGT = timezone(timedelta(hours=8))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PULL_DATE = "2026-09-06"
BASE = os.path.join(ROOT, "data", "sources", "pmda", PULL_DATE)
RAW = os.path.join(BASE, "raw")
LEGAL = os.path.join(BASE, "legal")
REQLOG = os.path.join(BASE, "requests.log")

UA = "rnawiki-research/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)"

LICENCE = (
    "Public Data License 1.0 (公共データ利用規約 第1.0版, Digital Agency of Japan), applied by the "
    "PMDA Site Policy to all content on www.pmda.go.jp unless otherwise indicated. Attribution to "
    "PMDA with the page URL is required; a statement of editing is required when the content is "
    "edited. Commercial use and redistribution are permitted. No share-alike obligation."
)

REQUESTS = [
    {
        "url": "https://www.pmda.go.jp/0048.html",
        "path": os.path.join(LEGAL, "site-policy-ja.html"),
        "role": "legal",
        "note": "Authoritative Japanese Site Policy (licence terms and download restrictions).",
    },
    {
        "url": "https://www.pmda.go.jp/english/0013.html",
        "path": os.path.join(LEGAL, "site-policy-en.html"),
        "role": "legal",
        "note": "English Site Policy (machine translation of /0048.html, per PMDA's own banner).",
    },
    {
        "url": "https://www.digital.go.jp/resources/open_data/public_data_license_v1.0",
        "path": os.path.join(LEGAL, "public-data-license-1.0.html"),
        "role": "legal",
        "note": "Public Data License 1.0 as published by Japan's Digital Agency; the licence the PMDA Site Policy applies.",
    },
    {
        "url": "https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html",
        "path": os.path.join(RAW, "approved-products-index-en.html"),
        "role": "index",
        "note": "English 'List of Approved Products / New Drugs' index page; carries exactly one file link.",
    },
    {
        "url": "https://www.pmda.go.jp/files/000281190.pdf",
        "path": os.path.join(RAW, "new-drugs-approved-2004-04-to-2026-02.pdf"),
        "role": "data",
        "note": "List of Approved Products (New Drugs), April 2004 to February 2026, linked from the index page.",
    },
]


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def log_request(url: str, status, nbytes, attempt: int, error: str = "") -> None:
    stamp = datetime.now(SGT).isoformat(timespec="seconds")
    with open(REQLOG, "a", encoding="utf-8") as fh:
        fh.write(f"{stamp}\t{url}\tstatus={status}\tbytes={nbytes}\tattempt={attempt}\t{error}\n")


def fetch(url: str, dest: str) -> tuple[str, int]:
    """Three attempts with exponential backoff. Returns (retrieved_iso, bytes)."""
    last = None
    for attempt in range(1, 4):
        try:
            resp = requests.get(url, headers={"User-Agent": UA}, timeout=180)
            body = resp.content
            log_request(url, resp.status_code, len(body), attempt)
            if resp.status_code != 200:
                raise RuntimeError(f"HTTP {resp.status_code} for {url}")
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as fh:
                fh.write(body)
            return datetime.now(SGT).isoformat(timespec="seconds"), len(body)
        except Exception as exc:  # noqa: BLE001 - the error text is the deliverable on failure
            last = exc
            log_request(url, "ERROR", 0, attempt, repr(exc))
            if attempt < 3:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"three attempts failed for {url}: {last!r}")


def main() -> int:
    os.makedirs(RAW, exist_ok=True)
    os.makedirs(LEGAL, exist_ok=True)
    manifest_path = os.path.join(BASE, "manifest.json")
    prior = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as fh:
            for entry in json.load(fh).get("files", []):
                prior[entry["path"]] = entry

    files = []
    for spec in REQUESTS:
        rel = os.path.relpath(spec["path"], ROOT)
        old = prior.get(rel)
        if old and os.path.exists(spec["path"]) and sha256_of(spec["path"]) == old["sha256"]:
            print(f"kept   {rel} ({old['bytes']} bytes, sha256 unchanged)")
            files.append(old)
            continue
        retrieved, nbytes = fetch(spec["url"], spec["path"])
        digest = sha256_of(spec["path"])
        print(f"pulled {rel} ({nbytes} bytes)")
        files.append(
            {
                "path": rel,
                "url": spec["url"],
                "role": spec["role"],
                "note": spec["note"],
                "retrieved": retrieved,
                "bytes": nbytes,
                "sha256": digest,
                "licence": LICENCE,
            }
        )
        time.sleep(3)

    manifest = {
        "source": "pmda",
        "source_full_name": "Pharmaceuticals and Medical Devices Agency (PMDA), Japan",
        "pull_date": PULL_DATE,
        "pull_timezone": "Asia/Singapore (UTC+08:00)",
        "dataset": "List of Approved Products — New Drugs (English), April 2004 to February 2026",
        "licence": LICENCE,
        "licence_url": "https://www.pmda.go.jp/english/0013.html",
        "licence_source_of_truth_url": "https://www.pmda.go.jp/0048.html",
        "public_data_license_1_0_url": "https://www.digital.go.jp/resources/open_data/public_data_license_v1.0",
        "attribution_required_text": (
            "Source: Pharmaceuticals and Medical Devices Agency (PMDA) website "
            "(https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html); "
            "reformatted by rnawiki from the published PDF."
        ),
        "robots_txt": "none served; see legal/robots-check.json",
        "retrieval_constraint": (
            "PMDA Site Policy prohibits bulk, frequent or automated crawling downloads and requires "
            "downloads be kept to the minimum necessary. This pull is four requests in total: two "
            "legal pages, one index page and the one consolidated PDF that constitutes the entire "
            "English dataset. No crawling was performed."
        ),
        "files": files,
    }
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
    print(f"manifest {os.path.relpath(manifest_path, ROOT)} — {len(files)} files, "
          f"{sum(f['bytes'] for f in files)} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
