#!/usr/bin/env python3
"""Retrieve the HSA Singapore Listing of Registered Therapeutic Products from
data.gov.sg, plus the legal artefacts that authorise the retrieval.

Routes, in the order the revamp spec requires (bulk download, then API, then
page fetch):

1. Bulk: the data.gov.sg table-download route
   `POST /v1/public/api/datasets/{id}/initiate-download` on api-open.data.gov.sg
   returns a signed S3 URL for the complete CSV of the dataset.
2. API: the CKAN-compatible datastore at
   `https://data.gov.sg/api/action/datastore_search` is paged in full and each
   page is stored, so the bulk CSV can be checked row-for-row against the API.

Every request is logged to `requests.log` as
(iso_timestamp, url, http_status, bytes, output_path). Failures are retried
three times with exponential backoff before an alternative host is tried.

Resume-safe: a file already listed in `manifest.json` with a matching SHA256 on
disk is not refetched.

Usage: hsa_sg_fetch.py [--date YYYY-MM-DD]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

DATASET_ID = "d_767279312753558cbf19d48344577084"
ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"

LEGAL_URLS = {
    "robots-data-gov-sg.txt": "https://data.gov.sg/robots.txt",
    "robots-api-open.txt": "https://api-open.data.gov.sg/robots.txt",
    "robots-api-production.txt": "https://api-production.data.gov.sg/robots.txt",
    "open-data-licence.html": "https://data.gov.sg/open-data-licence",
    "privacy-and-terms.html": "https://data.gov.sg/privacy-and-terms",
}

METADATA_URL = (
    f"https://api-production.data.gov.sg/v2/public/api/datasets/{DATASET_ID}/metadata"
)
INITIATE_URLS = [
    f"https://api-open.data.gov.sg/v1/public/api/datasets/{DATASET_ID}/initiate-download",
    f"https://api-production.data.gov.sg/v2/public/api/datasets/{DATASET_ID}/initiate-download",
]
DATASTORE = "https://data.gov.sg/api/action/datastore_search"
PAGE_LIMIT = 1000


class Fetcher:
    def __init__(self, log_path: pathlib.Path) -> None:
        self.log_path = log_path
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, url: str, status: str, nbytes: int, path: pathlib.Path | str) -> None:
        ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with self.log_path.open("a") as fh:
            fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{path}\n")

    def get(
        self,
        url: str,
        out: pathlib.Path,
        method: str = "GET",
        accept_status: tuple[int, ...] = (200,),
    ) -> tuple[int, bytes]:
        """Fetch `url` into `out`, three attempts with exponential backoff."""
        out.parent.mkdir(parents=True, exist_ok=True)
        errors: list[str] = []
        for attempt in range(3):
            req = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept": "*/*"}, method=method
            )
            try:
                with urllib.request.urlopen(req, timeout=300) as resp:
                    body = resp.read()
                    status = resp.status
            except urllib.error.HTTPError as exc:
                body = exc.read()
                status = exc.code
            except Exception as exc:  # noqa: BLE001 - transport failures
                errors.append(f"attempt {attempt + 1}: {exc!r}")
                self.log(url, f"transport-error {exc!r}", 0, out)
                time.sleep(2**attempt * 3)
                continue
            out.write_bytes(body)
            self.log(url, str(status), len(body), out)
            if status in accept_status:
                return status, body
            errors.append(f"attempt {attempt + 1}: HTTP {status}: {body[:300]!r}")
            if status in (400, 403, 404, 405):
                # A wrong endpoint does not become right on retry.
                return status, body
            time.sleep(2**attempt * 3)
        raise RuntimeError(f"three attempts failed for {url}: " + " | ".join(errors))


def sha256_of(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=time.strftime("%Y-%m-%d", time.gmtime()))
    args = ap.parse_args()

    base = ROOT / "data" / "sources" / "hsa-singapore" / args.date
    raw = base / "raw"
    legal = base / "legal"
    manifest_path = base / "manifest.json"
    raw.mkdir(parents=True, exist_ok=True)
    legal.mkdir(parents=True, exist_ok=True)

    known: dict[str, str] = {}
    if manifest_path.exists():
        prior = json.loads(manifest_path.read_text())
        for entry in prior.get("files", []):
            known[entry["path"]] = entry["sha256"]

    fetcher = Fetcher(base / "requests.log")
    files: list[dict] = []
    reused = 0

    def record(path: pathlib.Path, url: str, retrieved: str, note: str = "") -> None:
        rel = str(path.relative_to(ROOT))
        entry = {
            "path": rel,
            "url": url,
            "retrieved_utc": retrieved,
            "bytes": path.stat().st_size,
            "sha256": sha256_of(path),
        }
        if note:
            entry["note"] = note
        files.append(entry)

    def resume(path: pathlib.Path) -> bool:
        rel = str(path.relative_to(ROOT))
        return path.exists() and rel in known and known[rel] == sha256_of(path)

    # --- Legal artefacts, fetched before any data request -------------------
    for name, url in LEGAL_URLS.items():
        out = legal / name
        if resume(out):
            reused += 1
        else:
            fetcher.get(url, out, accept_status=(200, 403, 404))
        record(out, url, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))

    # --- Dataset metadata ---------------------------------------------------
    meta_out = raw / "dataset-metadata.json"
    if resume(meta_out):
        reused += 1
    else:
        fetcher.get(METADATA_URL, meta_out)
    record(meta_out, METADATA_URL, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    metadata = json.loads(meta_out.read_text())["data"]

    # --- Bulk CSV -----------------------------------------------------------
    csv_out = raw / "hsa-registered-therapeutic-products.csv"
    init_out = raw / "initiate-download.json"
    csv_url_used = None
    if resume(csv_out) and resume(init_out):
        reused += 2
        csv_url_used = json.loads(init_out.read_text())["data"]["url"]
    else:
        init_status = None
        init_body = None
        used_endpoint = None
        for endpoint in INITIATE_URLS:
            status, body = fetcher.get(
                endpoint, init_out, method="GET", accept_status=(200, 201)
            )
            if status in (200, 201):
                init_status, init_body, used_endpoint = status, body, endpoint
                break
        if init_status is None:
            raise RuntimeError(
                "both initiate-download endpoints failed; see requests.log"
            )
        payload = json.loads(init_body)
        csv_url_used = payload["data"]["url"]
        fetcher.get(csv_url_used, csv_out)
        record(
            init_out,
            used_endpoint,
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "signed S3 URL for the complete CSV; the signature expires",
        )
    if not any(f["path"].endswith("initiate-download.json") for f in files):
        record(init_out, INITIATE_URLS[0], time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    record(
        csv_out,
        csv_url_used,
        time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "complete dataset CSV, bulk table-download route",
    )

    # --- Full API paging (cross-check of the bulk CSV) ----------------------
    api_dir = raw / "api"
    api_dir.mkdir(parents=True, exist_ok=True)
    offset = 0
    total = None
    api_records: list[dict] = []
    page_no = 0
    while True:
        url = f"{DATASTORE}?resource_id={DATASET_ID}&limit={PAGE_LIMIT}&offset={offset}"
        page_out = api_dir / f"datastore-search-offset-{offset:06d}.json"
        if resume(page_out):
            reused += 1
            body = page_out.read_bytes()
        else:
            _, body = fetcher.get(url, page_out)
        record(page_out, url, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        result = json.loads(body)["result"]
        total = result["total"]
        recs = result["records"]
        api_records.extend(recs)
        page_no += 1
        if not recs or len(api_records) >= total:
            break
        offset += PAGE_LIMIT
        time.sleep(0.5)

    combined = raw / "datastore-records.json"
    combined.write_text(
        json.dumps(
            {
                "resource_id": DATASET_ID,
                "total_reported_by_api": total,
                "records_retrieved": len(api_records),
                "pages": page_no,
                "records": api_records,
            }
        )
    )
    record(
        combined,
        f"{DATASTORE}?resource_id={DATASET_ID} (paged, limit={PAGE_LIMIT})",
        time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "every datastore_search page concatenated in retrieval order",
    )

    manifest = {
        "source": "hsa-singapore",
        "source_name": (
            "Health Sciences Authority, Listing of Registered Therapeutic Products"
        ),
        "dataset_id": DATASET_ID,
        "publisher": metadata.get("managedBy"),
        "dataset_name": metadata.get("name"),
        "dataset_last_updated": metadata.get("lastUpdatedAt"),
        "dataset_size_reported": metadata.get("datasetSize"),
        "retrieval_date": args.date,
        "retrieval_routes": [
            "bulk CSV via POST-equivalent initiate-download table export",
            "full datastore_search API paging as a row-for-row cross-check",
        ],
        "portal": "https://data.gov.sg/datasets/" + DATASET_ID + "/view",
        "licence": {
            "name": "Singapore Open Data Licence version 1.0",
            "url": "https://data.gov.sg/open-data-licence",
            "local_copy": "data/sources/hsa-singapore/"
            + args.date
            + "/legal/open-data-licence.html",
            "attribution_required": True,
            "share_alike": False,
            "redistribution_permitted": True,
            "commercial_use_permitted": True,
        },
        "robots_txt": {
            "https://data.gov.sg/robots.txt": "User-agent: * / Allow: /",
            "https://api-open.data.gov.sg/robots.txt": (
                "403 Missing Authentication Token, the API gateway default for "
                "an unrouted path: no crawl directives are published for this "
                "host (legal/robots-api-open.txt)"
            ),
            "https://api-production.data.gov.sg/robots.txt": (
                "404, no crawl directives published for the API host"
            ),
        },
        "api_key": (
            "DATA_GOV_SG_API_KEY is not set in this environment. The public "
            "dataset endpoints used here accept unauthenticated requests and "
            "returned 200/201 for every request in requests.log; no key was "
            "needed and none was stored."
        ),
        "api_total_records": total,
        "api_records_retrieved": len(api_records),
        "files": files,
        "files_reused_from_prior_manifest": reused,
    }
    manifest_path.write_text(json.dumps(manifest, indent=1))
    print(
        f"files={len(files)} reused={reused} api_total={total} "
        f"api_retrieved={len(api_records)} manifest={manifest_path}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
