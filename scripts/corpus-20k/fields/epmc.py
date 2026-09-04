#!/usr/bin/env python
"""Cached, rate-limited Europe PMC REST client for the Phase 2 field extractors.

Legal gate (data/corpus-20k/legal-gate.json, source `europe_pmc`): robots ALLOW for the REST
paths; licence CLEAR_FOR_METADATA_ONLY — "Take citations, identifiers and abstracts; never store
or render full text". The gate's own note plans conservatively at <= 3 requests/second, so that is
the ceiling used here even though the phase brief allows 5.

Every response is cached at data/corpus-20k/raw/europepmc/<sha256 of the request URL>.json and a
cached query is never refetched. The cache file keeps only the bibliographic fields the extractor
reads (id/source/pmid/pmcid/doi/title/authorString/journal/pubYear/firstPublicationDate/
abstractText) plus a `_cache` block recording the exact URL, the fetch time, the HTTP status and
the original response size — the licence permits citations, identifiers and abstracts and nothing
more, so the rest of the payload is dropped rather than stored.

Every request is appended to data/corpus-20k/legal/requests.log as
`<iso8601Z>\t<url>\t<status>\t<bytes>`.
"""

from __future__ import annotations

import hashlib
import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CACHE_DIR = os.path.join(ROOT, "data", "corpus-20k", "raw", "europepmc")
LOG_PATH = os.path.join(ROOT, "data", "corpus-20k", "legal", "requests.log")
BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
USER_AGENT = "RNAWiki-corpus-20k/1.0"
MAX_RPS = 3.0  # legal-gate.json europe_pmc note

KEEP_FIELDS = (
    "id", "source", "pmid", "pmcid", "doi", "title", "authorString",
    "pubYear", "firstPublicationDate", "abstractText",
)

os.makedirs(CACHE_DIR, exist_ok=True)

_log_lock = threading.Lock()
_rate_lock = threading.Lock()
_next_slot = [0.0]

_stats = {"fetched": 0, "cached": 0, "errors": 0, "bytes": 0}
_stats_lock = threading.Lock()


def stats() -> dict:
    with _stats_lock:
        return dict(_stats)


def build_url(query: str, page_size: int = 25) -> str:
    return BASE + "?" + urllib.parse.urlencode({
        "query": query,
        "format": "json",
        "resultType": "core",
        "pageSize": str(page_size),
    })


def cache_path(url: str) -> str:
    return os.path.join(CACHE_DIR, hashlib.sha256(url.encode("utf-8")).hexdigest() + ".json")


def _log(url: str, status, size: int) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with _log_lock:
        with open(LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write(f"{stamp}\t{url}\t{status}\t{size}\n")


def _throttle() -> None:
    gap = 1.0 / MAX_RPS
    with _rate_lock:
        now = time.monotonic()
        slot = max(now, _next_slot[0])
        _next_slot[0] = slot + gap
    delay = slot - time.monotonic()
    if delay > 0:
        time.sleep(delay)


def _trim(payload: dict, url: str, status, raw_size: int) -> dict:
    results = ((payload.get("resultList") or {}).get("result")) or []
    kept = []
    for r in results:
        row = {k: r.get(k) for k in KEEP_FIELDS if r.get(k) is not None}
        journal = ((r.get("journalInfo") or {}).get("journal") or {}).get("title")
        if journal:
            row["journalTitle"] = journal
        kept.append(row)
    return {
        "_cache": {
            "url": url,
            "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "httpStatus": status,
            "originalBytes": raw_size,
            "kept": "bibliographic fields and abstracts only "
                    "(Europe PMC licence: metadata and abstracts, never full text)",
        },
        "hitCount": payload.get("hitCount"),
        "request": payload.get("request"),
        "results": kept,
    }


def search(query: str, page_size: int = 25, retries: int = 3) -> dict:
    """Return the trimmed Europe PMC result for `query`, from cache when present."""
    url = build_url(query, page_size)
    path = cache_path(url)
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as fh:
                doc = json.load(fh)
            with _stats_lock:
                _stats["cached"] += 1
            return doc
        except (json.JSONDecodeError, OSError):
            pass  # a truncated cache file is refetched

    last_error = None
    for attempt in range(retries):
        _throttle()
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT,
                                                   "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                status = resp.status
            _log(url, status, len(raw))
            with _stats_lock:
                _stats["fetched"] += 1
                _stats["bytes"] += len(raw)
            doc = _trim(json.loads(raw.decode("utf-8")), url, status, len(raw))
            tmp = path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(doc, fh, ensure_ascii=False)
            os.replace(tmp, path)
            return doc
        except urllib.error.HTTPError as exc:
            body = b""
            try:
                body = exc.read()
            except Exception:  # noqa: BLE001
                pass
            _log(url, exc.code, len(body))
            last_error = f"HTTP {exc.code}"
            if exc.code in (400, 404):
                break
            time.sleep(2 ** attempt)
        except Exception as exc:  # noqa: BLE001
            _log(url, "ERROR", 0)
            last_error = str(exc)[:200]
            time.sleep(2 ** attempt)

    with _stats_lock:
        _stats["errors"] += 1
    return {"_cache": {"url": url, "error": last_error}, "hitCount": None, "results": []}
