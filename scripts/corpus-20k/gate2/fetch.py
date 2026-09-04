#!/usr/bin/env python
"""Gate 2 page fetcher.

    fetch.py --base http://localhost:3111 --slugs <file> --out <ndjson> --concurrency 20
    fetch.py --base https://rnawiki.com --slugs <file> --out <ndjson> --concurrency 4 --log <ndjson>

Reads a tab-separated slug file (``key<TAB>slug<TAB>tier``; slug alone is accepted), fetches
``<base>/d/<slug>`` for each row and writes one NDJSON record per page holding the extracted
visible text (scripts/corpus-20k/gate2/extract.py), the status code and the HTML byte count.

Every request is logged when ``--log`` is given: the legal gate requires a recorded request line
for anything fetched over the network, and the live baseline reads our own site.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract import extract  # noqa: E402

USER_AGENT = "RNAWiki-gate2-measurement/1.0 (+https://rnawiki.com; own-site baseline)"


def read_rows(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) == 1:
            rows.append({"key": parts[0], "slug": parts[0], "tier": None})
        else:
            rows.append(
                {
                    "key": parts[0],
                    "slug": parts[1],
                    "tier": parts[2] if len(parts) > 2 else None,
                }
            )
    return rows


def fetch_one(base: str, row: dict, timeout: float, retries: int) -> dict:
    url = f"{base}/d/{row['slug']}"
    started = time.time()
    last_error = None
    for attempt in range(retries + 1):
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                body = response.read()
                status = response.status
            html = body.decode("utf-8", errors="replace")
            result = extract(html)
            result.update(
                {
                    "key": row["key"],
                    "slug": row["slug"],
                    "tier": row["tier"],
                    "url": url,
                    "status": status,
                    "elapsedMs": int((time.time() - started) * 1000),
                }
            )
            return result
        except urllib.error.HTTPError as error:
            return {
                "key": row["key"],
                "slug": row["slug"],
                "tier": row["tier"],
                "url": url,
                "status": error.code,
                "text": "",
                "proseText": "",
                "fullText": "",
                "chars": 0,
                "proseChars": 0,
                "fullChars": 0,
                "words": 0,
                "htmlBytes": 0,
                "elapsedMs": int((time.time() - started) * 1000),
            }
        except Exception as error:  # network hiccup: retry, then record the failure
            last_error = repr(error)
            time.sleep(0.5 * (attempt + 1))
    return {
        "key": row["key"],
        "slug": row["slug"],
        "tier": row["tier"],
        "url": url,
        "status": 0,
        "error": last_error,
        "text": "",
        "proseText": "",
        "fullText": "",
        "chars": 0,
        "proseChars": 0,
        "fullChars": 0,
        "words": 0,
        "htmlBytes": 0,
        "elapsedMs": int((time.time() - started) * 1000),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", required=True)
    parser.add_argument("--slugs", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--log", type=Path)
    parser.add_argument("--concurrency", type=int, default=8)
    parser.add_argument("--timeout", type=float, default=60.0)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--keep-text", action="store_true", help="write the extracted text out")
    args = parser.parse_args()

    rows = read_rows(args.slugs)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    started = time.time()
    written = 0
    ok = 0
    log_handle = args.log.open("a", encoding="utf-8") if args.log else None
    try:
        with args.out.open("w", encoding="utf-8") as out, ThreadPoolExecutor(
            max_workers=args.concurrency
        ) as pool:
            for result in pool.map(
                lambda row: fetch_one(args.base, row, args.timeout, args.retries), rows
            ):
                if log_handle is not None:
                    log_handle.write(
                        json.dumps(
                            {
                                "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                                "url": result["url"],
                                "status": result["status"],
                                "bytes": result["htmlBytes"],
                                "elapsedMs": result["elapsedMs"],
                                "agent": USER_AGENT,
                            }
                        )
                        + "\n"
                    )
                if not args.keep_text:
                    result.pop("fullText", None)
                out.write(json.dumps(result) + "\n")
                written += 1
                if result["status"] == 200:
                    ok += 1
                if written % 100 == 0:
                    print(f"  {written}/{len(rows)}", flush=True)
    finally:
        if log_handle is not None:
            log_handle.close()

    elapsed = time.time() - started
    print(
        json.dumps(
            {
                "base": args.base,
                "requested": len(rows),
                "written": written,
                "ok200": ok,
                "seconds": round(elapsed, 2),
                "pagesPerSecond": round(written / elapsed, 3) if elapsed else None,
                "out": str(args.out),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
