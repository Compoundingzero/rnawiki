#!/usr/bin/env python3
"""Page the whole data.gov.sg dataset catalogue and search it for MOH medicine
subsidy datasets (Standard Drug List, Medication Assistance Fund).

The v2 public API exposes a paginated dataset listing at
`/v2/public/api/datasets?page=N` and ignores a `query` parameter, so the only
way to search the catalogue over the API is to read every page and match
locally. Output: raw/search/catalogue.json (every dataset record) and
raw/search/catalogue-matches.json (records whose name, description or agency
mention a medicine-subsidy term).
"""
from __future__ import annotations

import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

DATE = os.environ.get("HSA_SG_DATE", "2026-09-05")
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "sources" / "hsa-singapore" / DATE / "raw" / "search"
LOG = ROOT / "data" / "sources" / "hsa-singapore" / DATE / "requests.log"
BASE = "https://api-production.data.gov.sg/v2/public/api/datasets?page={}"
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"

TERMS = [
    "standard drug list", "medication assistance fund", "subsid", "drug list",
    "medicine", "medication", "pharmac", "formulary", "health sciences authority",
    "therapeutic product", "ministry of health",
]


def log(url: str, status: str, nbytes: int, path: str) -> None:
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with LOG.open("a") as fh:
        fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{path}\n")


def get(url: str) -> tuple[int, bytes]:
    last = None
    for attempt in range(3):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code == 429:
                time.sleep(2 ** attempt * 5)
                continue
            return exc.code, exc.read()
        except Exception as exc:  # noqa: BLE001 - network transport failures
            last = exc
            time.sleep(2 ** attempt * 2)
    raise RuntimeError(f"three attempts failed for {url}: {last!r}")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    datasets: list[dict] = []
    page = 1
    pages = None
    while True:
        url = BASE.format(page)
        status, body = get(url)
        log(url, str(status), len(body), str(OUT / "catalogue.json"))
        if status != 200:
            raise RuntimeError(f"page {page} returned {status}: {body[:300]!r}")
        payload = json.loads(body)["data"]
        pages = payload["pages"]
        datasets.extend(payload["datasets"])
        if page >= pages:
            break
        page += 1
        time.sleep(0.25)

    (OUT / "catalogue.json").write_text(
        json.dumps({"pages": pages, "count": len(datasets), "datasets": datasets}, indent=1)
    )

    matches = []
    for rec in datasets:
        blob = " ".join(
            str(rec.get(k) or "") for k in ("name", "description", "managedBy")
        ).lower()
        hit = [t for t in TERMS if t in blob]
        if hit:
            matches.append({
                "datasetId": rec.get("datasetId"),
                "name": rec.get("name"),
                "managedBy": rec.get("managedBy"),
                "status": rec.get("status"),
                "lastUpdatedAt": rec.get("lastUpdatedAt"),
                "terms": hit,
                "description": (rec.get("description") or "")[:400],
            })
    (OUT / "catalogue-matches.json").write_text(json.dumps(matches, indent=1))
    print(f"catalogue pages={pages} datasets={len(datasets)} matches={len(matches)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
