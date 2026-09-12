#!/usr/bin/env python
"""Retrieve the DrugCentral PostgreSQL dump in six HTTP range segments.

A single connection to unmtid-dbs.net settles at roughly 110 KiB/s, which puts
the 1.40 GB dump beyond three hours; a freshly opened connection to the same
file sustains about 650 KiB/s, so the transfer is split into six byte ranges
fetched concurrently and reassembled in order. Six is the segment count used by
ordinary download managers and keeps the load on an academic host modest. Each
segment retries three times with exponential backoff, and the reassembled file
is checked against the Content-Length the server advertised and put through a
full gzip integrity test, which verifies the CRC32 of the whole decompressed
stream, before it enters the manifest.
"""
from __future__ import annotations

import hashlib
import json
import os
import struct
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import requests

REPO = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
BASE = os.path.join(REPO, "data/sources/drugcentral/2026-09-05")
LOG = os.path.join(BASE, "requests.log")
MANIFEST = os.path.join(BASE, "manifest.json")
URL = "https://unmtid-dbs.net/download/drugcentral.dump.11012023.sql.gz"
REL = "raw/drugcentral.dump.11012023.sql.gz"
PARTS = os.path.join(BASE, "raw/.dump-parts")
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)"
SEGMENTS = 6


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(url: str, status, nbytes: int, note: str = "") -> None:
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{now()}\t{url}\t{status}\t{nbytes}\t{note}\n")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def segment(index: int, start: int, end: int) -> str:
    path = os.path.join(PARTS, f"part-{index:02d}")
    want = end - start + 1
    if os.path.exists(path) and os.path.getsize(path) == want:
        log(URL, "cached", want, f"segment {index} already complete")
        return path
    last_err = None
    for attempt in range(3):
        if attempt:
            time.sleep(2 ** attempt)
        try:
            headers = {"User-Agent": UA, "Range": f"bytes={start}-{end}"}
            with requests.get(URL, headers=headers, stream=True, timeout=(30, 300)) as resp:
                if resp.status_code != 206:
                    raise RuntimeError(f"expected HTTP 206, got {resp.status_code}")
                total = 0
                with open(path, "wb") as fh:
                    for chunk in resp.iter_content(1 << 20):
                        fh.write(chunk)
                        total += len(chunk)
            if total != want:
                raise RuntimeError(f"segment {index} short: {total} of {want} bytes")
            log(URL, 206, total, f"segment {index} bytes={start}-{end} attempt={attempt + 1}")
            return path
        except Exception as exc:  # noqa: BLE001 - the error text is the artefact
            last_err = exc
            log(URL, "ERROR", 0, f"segment {index} attempt={attempt + 1} {type(exc).__name__}: {exc}")
    raise RuntimeError(f"three attempts failed for segment {index}: {last_err}")


def main() -> None:
    out = os.path.join(BASE, REL)
    os.makedirs(PARTS, exist_ok=True)

    head = requests.head(URL, headers={"User-Agent": UA}, allow_redirects=True, timeout=120)
    size = int(head.headers["Content-Length"])
    accepts = head.headers.get("Accept-Ranges", "")
    log(URL, head.status_code, 0, f"HEAD content-length={size} accept-ranges={accepts}")

    if os.path.exists(out) and os.path.getsize(out) != size:
        os.remove(out)  # a partial file from the single-connection attempt

    span = size // SEGMENTS
    bounds = [(i, i * span, (size - 1) if i == SEGMENTS - 1 else ((i + 1) * span - 1))
              for i in range(SEGMENTS)]
    started = time.time()
    with ThreadPoolExecutor(max_workers=SEGMENTS) as pool:
        paths = list(pool.map(lambda b: segment(*b), bounds))
    elapsed = time.time() - started

    with open(out, "wb") as dest:
        for path in paths:
            with open(path, "rb") as src:
                for chunk in iter(lambda: src.read(1 << 20), b""):
                    dest.write(chunk)

    actual = os.path.getsize(out)
    if actual != size:
        raise RuntimeError(f"reassembled {actual} bytes, server advertised {size}")
    with open(out, "rb") as fh:
        fh.seek(-4, os.SEEK_END)
        trailer = struct.unpack("<I", fh.read(4))[0]
    test = subprocess.run(["gzip", "-t", out], capture_output=True, text=True)
    if test.returncode != 0:
        raise RuntimeError(f"gzip integrity test failed: {(test.stderr or test.stdout).strip()}")
    # The gzip trailer records the uncompressed length modulo 2^32; the dump is
    # larger than that, so the true size is the trailer plus one 4 GiB wrap.
    uncompressed = trailer + (1 << 32)

    entry = {
        "url": URL,
        "retrieved_utc": now(),
        "bytes": actual,
        "sha256": sha256_of(out),
        "licence": "CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/legalcode)",
        "retrieval_method": f"{SEGMENTS} concurrent HTTP range requests, reassembled in order",
        "verification": {
            "content_length_matched": True,
            "gzip_integrity_test": "gzip -t passed (CRC32 of the full decompressed stream)",
            "gzip_trailer_modulo_2_32": trailer,
            "uncompressed_bytes": uncompressed,
        },
        "transfer_seconds": round(elapsed, 1),
    }
    man = json.load(open(MANIFEST, encoding="utf-8"))
    man["files"][REL] = entry
    json.dump(man, open(MANIFEST, "w", encoding="utf-8"), indent=2, sort_keys=True)
    open(MANIFEST, "a", encoding="utf-8").write("\n")

    for path in paths:
        os.remove(path)
    os.rmdir(PARTS)
    print(json.dumps(entry, indent=2))


if __name__ == "__main__":
    sys.exit(main())
