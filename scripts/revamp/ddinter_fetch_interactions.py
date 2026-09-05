#!/usr/bin/env python
"""Complete the DDInter 2.0 drug-drug interaction set from the site's own JSON data endpoints.

The Download page ships eight ATC-scoped CSVs (A, B, D, H, L, P, R, V). They hold 160,235
distinct unordered pairs. The live database holds more: amlodipine (DDInter79) carries 802
interactions at /server/interact-with/DDInter79/ against 289 in the CSVs, because a pair whose
two members both sit in an ATC class with no CSV (C, G, J, M, N, S) appears in no file. The
CSVs are therefore retrieved first and this script completes them from the endpoints the site's
own drug pages call, which is the API step of the retrieval order.

Endpoints (POST, DataTables server-side):
  /server/drug-source/            drug list: internalID, name, display, drugbank_id
  /server/interact-with/<id>/     that drug's interactions: partner id and name, level, mechanism flags

DDInter 2.0 is CC BY-NC-SA 4.0. Everything written here stays under data/validation/, is never
mapped into the corpus and is never in the release candidate.

Usage: ddinter_fetch_interactions.py <YYYY-MM-DD> [<shard>/<shards>]
Resume-safe: drug-source pages already on disk with a matching SHA256 in manifest.json are not
refetched, and a drug already present in raw/interact-with.ndjson is not refetched.
"""
from __future__ import annotations

import glob
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE = "https://ddinter2.scbdd.com"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LICENCE = "CC BY-NC-SA 4.0"
LICENCE_URL = f"{BASE}/terms/"
DRUG_PAGE_SIZE = 500
REQUEST_PAUSE_S = 0.7
RETRIES = 3


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def log_request(log_path: str, url: str, status: str, nbytes: int, out: str) -> None:
    with open(log_path, "a", encoding="utf-8") as fh:
        fh.write(f"{now()}\t{url}\t{status}\t{nbytes}\t{out}\n")


def post(url: str, data: dict, log_path: str, note: str) -> tuple[bytes, int]:
    """POST with three attempts and exponential backoff. Raises with the full error text."""
    payload = urllib.parse.urlencode(data).encode()
    errors = []
    for attempt in range(1, RETRIES + 1):
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "User-Agent": UA,
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                body = resp.read()
                log_request(log_path, f"POST {url} ({note})", str(resp.status), len(body), "-")
                return body, resp.status
        except urllib.error.HTTPError as exc:
            body = exc.read()
            log_request(log_path, f"POST {url} ({note})", str(exc.code), len(body), "-")
            errors.append(f"attempt {attempt}: HTTPError {exc.code} {exc.reason}")
        except Exception as exc:  # noqa: BLE001 - full text is kept for the blocker path
            log_request(log_path, f"POST {url} ({note})", "error", 0, "-")
            errors.append(f"attempt {attempt}: {type(exc).__name__}: {exc}")
        if attempt < RETRIES:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{url} [{note}] failed after {RETRIES} attempts: " + " | ".join(errors))


def fetch_drug_list(raw_dir: str, log_path: str, manifest_files: dict) -> tuple[list[dict], list[dict]]:
    """Page through /server/drug-source/, saving each response verbatim."""
    page_dir = os.path.join(raw_dir, "drug-source")
    os.makedirs(page_dir, exist_ok=True)
    url = f"{BASE}/server/drug-source/"
    records: list[dict] = []
    page_records: list[dict] = []
    start = 0
    page_no = 0
    total = None
    while total is None or start < total:
        out_path = os.path.join(page_dir, f"page-{page_no:04d}.json")
        note = f"draw=1&start={start}&length={DRUG_PAGE_SIZE}"
        prior = manifest_files.get(f"{url}#{note}")
        if prior and os.path.exists(out_path) and sha256_of(out_path) == prior.get("sha256"):
            body = open(out_path, "rb").read()
            status = prior["http_status"]
            refetched = False
        else:
            body, status = post(url, {"draw": 1, "start": start, "length": DRUG_PAGE_SIZE}, log_path, note)
            with open(out_path, "wb") as fh:
                fh.write(body)
            refetched = True
            time.sleep(REQUEST_PAUSE_S)
        parsed = json.loads(body)
        total = parsed["recordsTotal"]
        records.extend(parsed["data"])
        page_records.append({
            "url": f"{url}#{note}",
            "file": os.path.relpath(out_path, os.path.dirname(raw_dir)),
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
        print(f"drug-source page {page_no}: {len(parsed['data'])} of {total}")
        start += DRUG_PAGE_SIZE
        page_no += 1
    return records, page_records


def fetch_interactions(
    drugs: list[dict], raw_dir: str, log_path: str, shard: int = 0, shards: int = 1
) -> tuple[str, int, list[str]]:
    """One request per drug into an append-only NDJSON. Returns (path, drugs written, failures).

    With shards > 1 the drug list is split by position and each worker appends to its own file, so
    that several workers can share the pull without interleaving lines. Every worker reads every
    shard file first, so a drug already retrieved by any worker is not requested again.
    """
    out_path = os.path.join(
        raw_dir,
        "interact-with.ndjson" if shards == 1 else f"interact-with.part-{shard}-of-{shards}.ndjson",
    )
    done: set[str] = set()
    for existing in sorted(glob.glob(os.path.join(raw_dir, "interact-with*.ndjson"))):
        with open(existing, encoding="utf-8") as fh:
            for line in fh:
                try:
                    done.add(json.loads(line)["idx"])
                except (json.JSONDecodeError, KeyError):
                    continue
    if shards > 1:
        drugs = [d for i, d in enumerate(drugs) if i % shards == shard]
    failures: list[str] = []
    written = 0
    with open(out_path, "a", encoding="utf-8") as fh:
        for i, drug in enumerate(drugs, 1):
            idx = drug["internalID"]
            if idx in done:
                continue
            url = f"{BASE}/server/interact-with/{idx}/"
            try:
                body, status = post(url, {"draw": 1, "start": 0, "length": 100000}, log_path, "length=100000")
                parsed = json.loads(body)
            except (RuntimeError, json.JSONDecodeError) as exc:
                failures.append(f"{idx}: {exc}")
                continue
            if len(parsed["data"]) != parsed["recordsTotal"]:
                failures.append(
                    f"{idx}: server returned {len(parsed['data'])} of {parsed['recordsTotal']} in one page"
                )
            fh.write(json.dumps({
                "idx": idx,
                "name": drug.get("name"),
                "drugbank_id": drug.get("drugbank_id"),
                "http_status": status,
                "records_total": parsed["recordsTotal"],
                "retrieved_utc": now(),
                "data": parsed["data"],
            }, ensure_ascii=False) + "\n")
            written += 1
            if written % 100 == 0:
                fh.flush()
                print(f"{i}/{len(drugs)} drugs, {written} written")
            time.sleep(REQUEST_PAUSE_S)
    return out_path, written, failures


def main() -> int:
    date = sys.argv[1]
    base_dir = os.path.join(ROOT, "data", "validation", "ddinter", date)
    raw_dir = os.path.join(base_dir, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    log_path = os.path.join(base_dir, "requests.log")
    manifest_path = os.path.join(base_dir, "manifest.json")
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    manifest_files = {rec["url"]: rec for rec in manifest["files"]}

    drugs, page_records = fetch_drug_list(raw_dir, log_path, manifest_files)
    print(f"drug list: {len(drugs)} records")

    shard, shards = 0, 1
    if len(sys.argv) > 2:
        shard, shards = (int(x) for x in sys.argv[2].split("/"))
    ndjson_path, written, failures = fetch_interactions(drugs, raw_dir, log_path, shard, shards)
    lines = sum(
        1
        for p in glob.glob(os.path.join(raw_dir, "interact-with*.ndjson"))
        for _ in open(p, encoding="utf-8")
    )
    print(f"interactions: {written} drugs fetched this run, {lines} drugs on file, {len(failures)} failures")

    if shards > 1 and written and lines < len(drugs):
        print(f"shard {shard}/{shards} done ({written} written); manifest is written by the run that "
              f"completes the last shard")
        return 0

    endpoint_files = sorted(glob.glob(os.path.join(raw_dir, "interact-with*.ndjson")))
    endpoint_record = {
        "url": f"{BASE}/server/interact-with/<DDInterID>/",
        "file": [os.path.relpath(p, base_dir) for p in endpoint_files],
        "http_status": 200,
        "bytes": sum(os.path.getsize(p) for p in endpoint_files),
        "sha256": {os.path.relpath(p, base_dir): sha256_of(p) for p in endpoint_files},
        "retrieved_utc": now(),
        "records": lines,
        "kind": "raw",
        "licence": LICENCE,
        "note": "one POST per DDInter drug id, length=100000, 0.7 s between requests per worker, "
                "three workers over disjoint slices of the drug list; each line is one drug's full "
                "server response with the request metadata",
        "failures": failures,
    }
    keep = [r for r in manifest["files"] if not r["url"].startswith(f"{BASE}/server/")]
    manifest["files"] = keep + page_records + [endpoint_record]
    manifest["total_bytes"] = sum(r["bytes"] for r in manifest["files"])
    manifest["retrieval_method"] = (
        "bulk download of the eight ATC CSVs on the Download page, then the site's own JSON data "
        "endpoints (/server/drug-source/ and /server/interact-with/<id>/) to complete the pairs the "
        "CSVs omit; legal pages retrieved before the first data request"
    )
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    if failures:
        with open(os.path.join(base_dir, "fetch-failures.txt"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(failures) + "\n")
    print(f"manifest updated: {len(manifest['files'])} files, {manifest['total_bytes']} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
