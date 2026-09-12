#!/usr/bin/env python
"""Pull NCATS Inxight Drugs stitched drug records from the public stitcher API.

One request per distinct UNII held by the corpus identity file. Responses are written
verbatim, one JSON object per line, into gzipped shards under the dated raw directory,
so the pull is resumable: a UNII already present in a completed shard is not refetched.

Usage:
  python scripts/revamp/inxight_fetch_stitcher.py --date 2026-09-05
"""
import argparse
import gzip
import json
import os
import queue
import random
import re
import threading
import time
from datetime import datetime, timezone

import requests

API = "https://stitcher.ncats.io/api/stitches/latest/{key}"
API_ALT = "https://stitcher.ncats.io/api/stitches/v1/{key}"
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
SHARD = 1000


def iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


UNII_RE = re.compile(r"^[0-9A-Z]{10}$")


def corpus_uniis(identity_path):
    """Every UNII the corpus holds for a page.

    A page carries a UNII in two places and they are not always the same substance form:
    the `unii` field, and the identifier embedded in a `K1:` page key. The metformin page
    is keyed K1:9100L32L2N (the free base) while its `unii` field holds 786Z46389E (the
    hydrochloride). Both are exact UNII join keys for that page, so both are fetched.
    """
    known = set()
    with open(identity_path, encoding="utf-8") as fh:
        for line in fh:
            rec = json.loads(line)
            if rec.get("unii"):
                known.add(rec["unii"])
            key = rec.get("key") or ""
            if key.startswith("K1:") and UNII_RE.match(key[3:]):
                known.add(key[3:])
    return sorted(known)


def done_uniis(outdir):
    have = set()
    if not os.path.isdir(outdir):
        return have
    for name in sorted(os.listdir(outdir)):
        if not name.endswith(".ndjson.gz"):
            continue
        path = os.path.join(outdir, name)
        try:
            with gzip.open(path, "rt", encoding="utf-8") as fh:
                for line in fh:
                    have.add(json.loads(line)["unii"])
        except (OSError, EOFError, json.JSONDecodeError):
            os.remove(path)
    return have


def fetch_one(session, unii, log_lock, log_fh):
    delay = 1.0
    last_err = ""
    for attempt in range(3):
        url = API.format(key=unii)
        try:
            resp = session.get(url, timeout=120)
            with log_lock:
                log_fh.write(f"{iso()}\t{url}\t{resp.status_code}\t{len(resp.content)}\tstitcher\n")
            if resp.status_code == 200:
                return {"unii": unii, "url": url, "retrieved": iso(),
                        "status": 200, "stitch": resp.json()}
            if resp.status_code == 404:
                return {"unii": unii, "url": url, "retrieved": iso(),
                        "status": 404, "stitch": None,
                        "error": resp.text[:300]}
            last_err = f"HTTP {resp.status_code}: {resp.text[:300]}"
        except Exception as exc:  # network, timeout, decode
            with log_lock:
                log_fh.write(f"{iso()}\t{url}\tEXC\t0\t{type(exc).__name__}\n")
            last_err = f"{type(exc).__name__}: {exc}"
        time.sleep(delay + random.random() * 0.3)
        delay *= 2
    url = API_ALT.format(key=unii)
    try:
        resp = session.get(url, timeout=120)
        with log_lock:
            log_fh.write(f"{iso()}\t{url}\t{resp.status_code}\t{len(resp.content)}\tstitcher-alt\n")
        if resp.status_code == 200:
            return {"unii": unii, "url": url, "retrieved": iso(),
                    "status": 200, "stitch": resp.json()}
        last_err += f" | alt HTTP {resp.status_code}: {resp.text[:200]}"
    except Exception as exc:
        with log_lock:
            log_fh.write(f"{iso()}\t{url}\tEXC\t0\t{type(exc).__name__}\n")
        last_err += f" | alt {type(exc).__name__}: {exc}"
    return {"unii": unii, "url": API.format(key=unii), "retrieved": iso(),
            "status": 0, "stitch": None, "error": last_err}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    ap.add_argument("--identity", default="data/corpus-20k/identity/canonical.ndjson")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()

    base = os.path.join("data/sources/inxight", args.date)
    outdir = os.path.join(base, "raw", "stitcher")
    os.makedirs(outdir, exist_ok=True)
    log_path = os.path.join(base, "requests.log")

    wanted = corpus_uniis(args.identity)
    have = done_uniis(outdir)
    pending = [u for u in wanted if u not in have]
    print(f"distinct corpus UNIIs: {len(wanted)}; already stored: {len(have)}; to fetch: {len(pending)}")
    if not pending:
        return

    work = queue.Queue()
    for u in pending:
        work.put(u)
    results = queue.Queue()
    log_lock = threading.Lock()
    log_fh = open(log_path, "a", encoding="utf-8")

    def worker():
        session = requests.Session()
        session.headers["User-Agent"] = UA
        while True:
            try:
                unii = work.get_nowait()
            except queue.Empty:
                return
            results.put(fetch_one(session, unii, log_lock, log_fh))
            time.sleep(0.05)

    threads = [threading.Thread(target=worker, daemon=True) for _ in range(args.workers)]
    for t in threads:
        t.start()

    shard_index = len([n for n in os.listdir(outdir) if n.endswith(".ndjson.gz")])
    buf = []
    written = 0
    failures = 0
    start = time.time()

    def flush():
        nonlocal shard_index, buf
        if not buf:
            return
        tmp = os.path.join(outdir, f".shard-{shard_index:04d}.tmp")
        final = os.path.join(outdir, f"shard-{shard_index:04d}.ndjson.gz")
        with gzip.open(tmp, "wt", encoding="utf-8") as fh:
            for rec in buf:
                fh.write(json.dumps(rec, separators=(",", ":")) + "\n")
        os.replace(tmp, final)
        shard_index += 1
        buf = []

    remaining = len(pending)
    while remaining:
        rec = results.get()
        remaining -= 1
        written += 1
        if rec["status"] != 200:
            failures += 1
        buf.append(rec)
        if len(buf) >= SHARD:
            flush()
            rate = written / max(time.time() - start, 1e-6)
            print(f"{written}/{len(pending)} fetched, {failures} non-200, {rate:.1f}/s", flush=True)
    flush()
    log_fh.close()
    print(f"done: {written} fetched, {failures} non-200, shards in {outdir}")


if __name__ == "__main__":
    main()
