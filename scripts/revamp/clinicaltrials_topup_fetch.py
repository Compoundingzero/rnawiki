"""Fetch the four per-trial fields the 2026-09-01 snapshot did not request.

The snapshot asked the API for `StartDate`, `PrimaryCompletionDate` and
`CompletionDate` but not their `*Type` companions, so it records date values with no
way to tell an ACTUAL date from an ESTIMATED one, and it did not request
`DesignInterventionModel`. Both matter to the trial-size and registry-gap sections:
a "last completion date" that is an estimate is a plan, not an event, and a
single-group study is not the same evidence as a parallel-group one.

Only the 155,645 studies already linked to a corpus page are fetched, in batches of
400 ids against `filter.ids`, which is 390 calls — the Phase 2 brief's ceiling for
fetching inside this step is 500. `Crawl-delay: 1` from clinicaltrials.gov/robots.txt
is honoured between calls. Three retries with exponential backoff, then the run
stops and reports the batch that failed.

Resume-safe: a batch whose cached file already parses and holds the expected ids is
not refetched.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_topup_fetch.py [YYYY-MM-DD]
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date as date_cls, datetime, timezone
from pathlib import Path

MATCHES_DIR = Path("data/corpus-20k/registry/matches")
ENDPOINT = "https://clinicaltrials.gov/api/v2/studies"
FIELDS = (
    "NCTId|StartDate|StartDateType|PrimaryCompletionDate|PrimaryCompletionDateType"
    "|CompletionDate|CompletionDateType|DesignInterventionModel"
)
BATCH = 400
CRAWL_DELAY = 1.0
USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"


def matched_ncts() -> list[str]:
    ncts: set[str] = set()
    for path in sorted(MATCHES_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    for entry in json.loads(line).get("nctIds") or []:
                        ncts.add(entry["nct"])
    return sorted(ncts)


def log(log_path: Path, url: str, status: str, size: int, out: str) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(f"{stamp}\t{url}\t{status}\t{size}\t{out}\n")


def cached_ok(path: Path, ids: list[str]) -> bool:
    if not path.exists():
        return False
    try:
        payload = json.loads(path.read_text())
    except json.JSONDecodeError:
        return False
    got = {
        (s.get("protocolSection") or {}).get("identificationModule", {}).get("nctId")
        for s in payload.get("studies") or []
    }
    return got.issubset(set(ids)) and len(got) > 0


def main(pull_date: str) -> int:
    root = Path("data/sources/clinicaltrials") / pull_date
    raw_dir = root / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    log_path = root / "requests.log"

    ncts = matched_ncts()
    batches = [ncts[i : i + BATCH] for i in range(0, len(ncts), BATCH)]
    print(f"{len(ncts)} matched studies · {len(batches)} calls at {BATCH} ids each")
    if len(batches) >= 500:
        print("ABORT: this would exceed the 500-call ceiling for fetching inside this step")
        return 2

    fetched = 0
    reused = 0
    for index, ids in enumerate(batches, start=1):
        out = raw_dir / f"topup-{index:04d}.json"
        if cached_ok(out, ids):
            reused += 1
            continue
        query = urllib.parse.urlencode(
            {"filter.ids": ",".join(ids), "fields": FIELDS, "pageSize": 1000}
        )
        url = f"{ENDPOINT}?{query}"
        last_error = ""
        for attempt in range(3):
            if attempt:
                time.sleep(2**attempt)
            try:
                request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(request, timeout=180) as response:
                    body = response.read()
                    status = str(response.status)
                out.write_bytes(body)
                log(log_path, url, status, len(body), str(out))
                if not cached_ok(out, ids):
                    last_error = f"response parsed but held no expected id (bytes={len(body)})"
                    continue
                fetched += 1
                last_error = ""
                break
            except (urllib.error.HTTPError, urllib.error.URLError, OSError, TimeoutError) as exc:
                last_error = f"{type(exc).__name__}: {exc}"
                log(log_path, url, f"error:{type(exc).__name__}", 0, str(out))
        if last_error:
            print(f"FAILED batch {index}/{len(batches)} after 3 attempts: {last_error}")
            print(f"command: GET {url[:300]}...")
            return 1
        time.sleep(CRAWL_DELAY)
        if index % 50 == 0:
            print(f"{index}/{len(batches)} calls")

    print(json.dumps({"calls": len(batches), "fetched": fetched, "reusedFromCache": reused}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
