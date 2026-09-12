"""Probe the MHRA medicines GraphQL API host found in the products.mhra.gov.uk client bundle.

Three attempts with exponential backoff per endpoint, then the alternative endpoint.
Every request is appended to the source requests log as (timestamp, url, status, bytes, outfile).
Full transcript is written to the legal directory as evidence for the licence decision.
"""
from __future__ import annotations

import json
import pathlib
import subprocess
import time
import datetime

DAY = "2026-09-06"
BASE = pathlib.Path("data/sources/mhra-emc") / DAY
LEGAL = BASE / "legal"
LOG = BASE / "requests.log"
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"

ENDPOINTS = [
    ("https://medicines.api.mhra.gov.uk/graphql", "mhra-medicines-api-graphql"),
    ("https://medicines.api.mhra.gov.uk/", "mhra-medicines-api-root-retry"),
    ("https://api.mhra.gov.uk/", "mhra-api-root"),
]

QUERY = json.dumps({"query": "{__schema{queryType{name}}}"})


def attempt(url: str, name: str, n: int) -> dict:
    out = LEGAL / f"{name}.attempt{n}.txt"
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    proc = subprocess.run(
        [
            "curl", "-sS", "-L", "--compressed", "-A", UA, "--max-time", "60",
            "-w", "%{http_code}", "-o", str(out),
            "-H", "Content-Type: application/json", "--data-binary", QUERY, url,
        ],
        capture_output=True, text=True,
    )
    code = proc.stdout.strip() or "curl-error"
    err = proc.stderr.strip()
    size = out.stat().st_size if out.exists() else 0
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(f"{ts}\t{url}\t{code}\t{size}\t{out}\n")
    return {"timestamp": ts, "url": url, "attempt": n, "status": code,
            "bytes": size, "outfile": str(out), "stderr": err,
            "body_head": out.read_text(errors="replace")[:400] if size else ""}


records = []
for url, name in ENDPOINTS:
    for n in (1, 2, 3):
        rec = attempt(url, name, n)
        records.append(rec)
        if rec["status"].startswith("2"):
            break
        if n < 3:
            time.sleep(2 ** n)

transcript = LEGAL / "mhra-medicines-api-probe.json"
transcript.write_text(json.dumps(records, indent=2), encoding="utf-8")
for r in records:
    print(r["attempt"], r["status"], r["bytes"], r["url"], r["stderr"][:120])
print("transcript:", transcript)
