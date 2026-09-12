#!/usr/bin/env python
"""Logged, resume-safe retrieval for the DrugCentral source pull.

Every request is appended to requests.log as url, status, bytes. Files whose
SHA256 already matches the manifest entry are not refetched. Failures retry
three times with exponential backoff before the caller records a blocker.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone

import requests

BASE = os.path.join(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion",
    "data/sources/drugcentral/2026-09-05",
)
LOG = os.path.join(BASE, "requests.log")
MANIFEST = os.path.join(BASE, "manifest.json")
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)"


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(url: str, status, nbytes: int, note: str = "") -> None:
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{now()}\t{url}\t{status}\t{nbytes}\t{note}\n")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    if os.path.exists(MANIFEST):
        with open(MANIFEST, encoding="utf-8") as fh:
            return json.load(fh)
    return {"source": "DrugCentral", "files": {}}


def save_manifest(man: dict) -> None:
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(man, fh, indent=2, sort_keys=True)
        fh.write("\n")


def head(url: str) -> dict:
    resp = requests.head(url, headers={"User-Agent": UA}, allow_redirects=True, timeout=120)
    size = int(resp.headers.get("Content-Length", "0") or 0)
    log(url, resp.status_code, 0, f"HEAD content-length={size} type={resp.headers.get('Content-Type','')}")
    return {"status": resp.status_code, "length": size, "url": resp.url,
            "type": resp.headers.get("Content-Type", "")}


def fetch(url: str, rel_out: str, expect_sha: str | None = None) -> dict:
    out = os.path.join(BASE, rel_out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    man = load_manifest()
    prior = man["files"].get(rel_out)
    if prior and os.path.exists(out) and sha256_of(out) == prior.get("sha256"):
        log(url, "cached", os.path.getsize(out), "manifest sha256 match, not refetched")
        return prior

    last_err = None
    for attempt in range(3):
        if attempt:
            delay = 2 ** attempt
            time.sleep(delay)
        try:
            with requests.get(url, headers={"User-Agent": UA}, stream=True, timeout=(30, 900)) as resp:
                resp.raise_for_status()
                total = 0
                with open(out, "wb") as fh:
                    for chunk in resp.iter_content(1 << 20):
                        fh.write(chunk)
                        total += len(chunk)
            log(url, 200, total, f"attempt={attempt + 1}")
            digest = sha256_of(out)
            if expect_sha and digest != expect_sha:
                raise ValueError(f"sha256 mismatch: got {digest}, expected {expect_sha}")
            entry = {
                "url": url,
                "retrieved_utc": now(),
                "bytes": total,
                "sha256": digest,
                "licence": "CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/legalcode)",
            }
            man = load_manifest()
            man["files"][rel_out] = entry
            save_manifest(man)
            return entry
        except Exception as exc:  # noqa: BLE001 - the error text is the artefact
            last_err = exc
            log(url, "ERROR", 0, f"attempt={attempt + 1} {type(exc).__name__}: {exc}")
    raise RuntimeError(f"three attempts failed for {url}: {last_err}")


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "head":
        print(json.dumps(head(sys.argv[2]), indent=2))
    elif mode == "get":
        print(json.dumps(fetch(sys.argv[2], sys.argv[3]), indent=2))
    else:
        raise SystemExit("mode must be head or get")
