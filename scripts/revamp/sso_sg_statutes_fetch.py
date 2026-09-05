#!/usr/bin/env python3
"""Retrieve the Misuse of Drugs Act First Schedule and the Poisons Act schedules
from Singapore Statutes Online.

Terms observed, from the copy saved under this run's `legal/` directory:

* `sso.agc.gov.sg/robots.txt` allows every path except `/search` and sets
  `crawl-delay: 6`. No page under `/search` is requested and every request is
  followed by a six-second pause.
* SSO Terms of Use clause 13 grants permission to reproduce Singapore
  legislation. Clause 13(d) makes automated extraction conditional on being
  carried out between 3 a.m. and 7 a.m. Singapore time, not in an abusive,
  intrusive or deceptive manner, and without affecting SSO's performance. This
  script refuses to issue a request outside that window, identifies itself and
  its operator in the User-Agent, and waits six seconds between requests.
* Clause 13(a) requires the reproduction to state that the legislation is
  subject to Singapore Government copyright and is reproduced with AGC's
  permission, and to tell readers they may check SSO for the latest version.
  That notice is written into the manifest and carried on every mapped row.

Usage: sso_sg_statutes_fetch.py --date YYYY-MM-DD [--wait-for-window]
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request
import zoneinfo

ROOT = pathlib.Path(__file__).resolve().parents[2]
SGT = zoneinfo.ZoneInfo("Asia/Singapore")
UA = (
    "Mozilla/5.0 (compatible; rnawiki-revamp/1.0; +https://rnawiki.com; "
    "felix360506@gmail.com)"
)
CRAWL_DELAY = 6
WINDOW_START = 3
WINDOW_END = 7

TARGETS = [
    # (output stem, statute short name, candidate URLs in preference order)
    (
        "misuse-of-drugs-act-1973",
        "Misuse of Drugs Act 1973",
        [
            "https://sso.agc.gov.sg/Act/MDA1973?WholeDoc=1",
            "https://sso.agc.gov.sg/Act/MDA1973",
        ],
    ),
    (
        "poisons-act-1938",
        "Poisons Act 1938",
        [
            "https://sso.agc.gov.sg/Act/PA1938?WholeDoc=1",
            "https://sso.agc.gov.sg/Act/PA1938",
        ],
    ),
    (
        "poisons-rules",
        "Poisons Rules (subsidiary legislation under the Poisons Act 1938)",
        [
            "https://sso.agc.gov.sg/SL/PA1938-R1?WholeDoc=1",
            "https://sso.agc.gov.sg/SL/PA1938-R1",
        ],
    ),
]

LEGAL = [
    ("robots-sso-agc.txt", "https://sso.agc.gov.sg/robots.txt"),
    ("sso-terms-of-use.html", "https://sso.agc.gov.sg/Terms-of-Use"),
]

ATTRIBUTION = (
    "Singapore legislation reproduced from Singapore Statutes Online is subject "
    "to the copyright of the Singapore Government and is reproduced with the "
    "permission of the Attorney-General's Chambers. Readers may check Singapore "
    "Statutes Online (https://sso.agc.gov.sg) for the latest version of the "
    "legislation. Singapore Statutes Online is an unofficial version and is not "
    "the authoritative text."
)


def in_window(now: datetime.datetime | None = None) -> bool:
    now = now or datetime.datetime.now(SGT)
    return WINDOW_START <= now.hour < WINDOW_END


def seconds_to_window(now: datetime.datetime | None = None) -> int:
    now = now or datetime.datetime.now(SGT)
    if in_window(now):
        return 0
    target = now.replace(hour=WINDOW_START, minute=2, second=0, microsecond=0)
    if target <= now:
        target += datetime.timedelta(days=1)
    return int((target - now).total_seconds())


class SsoFetcher:
    def __init__(self, log_path: pathlib.Path) -> None:
        self.log_path = log_path
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.last_request = 0.0

    def log(self, url: str, status: str, nbytes: int, path: pathlib.Path | str) -> None:
        ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with self.log_path.open("a") as fh:
            fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{path}\n")

    def get(self, url: str, out: pathlib.Path) -> tuple[int, bytes]:
        if not in_window():
            raise RuntimeError(
                "refusing to request "
                + url
                + ": Singapore Statutes Online Terms of Use clause 13(d) allows "
                "automated extraction only between 3 a.m. and 7 a.m. Singapore "
                "time; local Singapore time is now "
                + datetime.datetime.now(SGT).strftime("%Y-%m-%d %H:%M:%S")
            )
        out.parent.mkdir(parents=True, exist_ok=True)
        errors: list[str] = []
        for attempt in range(3):
            wait = CRAWL_DELAY - (time.monotonic() - self.last_request)
            if wait > 0:
                time.sleep(wait)
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": UA,
                    "Accept": "text/html,application/xhtml+xml,*/*",
                    "Accept-Language": "en-SG,en;q=0.9",
                },
            )
            try:
                with urllib.request.urlopen(req, timeout=180) as resp:
                    body = resp.read()
                    status = resp.status
            except urllib.error.HTTPError as exc:
                body = exc.read()
                status = exc.code
            except Exception as exc:  # noqa: BLE001 - transport failures
                self.last_request = time.monotonic()
                errors.append(f"attempt {attempt + 1}: {exc!r}")
                self.log(url, f"transport-error {exc!r}", 0, out)
                time.sleep(2**attempt * CRAWL_DELAY)
                continue
            self.last_request = time.monotonic()
            out.write_bytes(body)
            self.log(url, str(status), len(body), out)
            if status == 200:
                return status, body
            errors.append(f"attempt {attempt + 1}: HTTP {status}")
            time.sleep(2**attempt * CRAWL_DELAY)
        raise RuntimeError(f"three attempts failed for {url}: " + " | ".join(errors))


def sha256_of(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    ap.add_argument(
        "--wait-for-window",
        action="store_true",
        help="sleep until the 3 a.m.-7 a.m. Singapore-time window opens",
    )
    args = ap.parse_args()

    base = ROOT / "data" / "sources" / "hsa-singapore" / args.date
    statutes = base / "raw" / "statutes"
    legal = base / "legal"
    log = base / "requests.log"
    out_manifest = base / "statutes-manifest.json"

    if args.wait_for_window and not in_window():
        delay = seconds_to_window()
        print(
            f"waiting {delay}s for the 03:00-07:00 Singapore-time extraction "
            "window required by SSO Terms of Use clause 13(d)",
            flush=True,
        )
        time.sleep(delay)

    fetcher = SsoFetcher(log)
    files: list[dict] = []

    for name, url in LEGAL:
        out = legal / name
        status, _ = fetcher.get(url, out)
        files.append(
            {
                "path": str(out.relative_to(ROOT)),
                "url": url,
                "http_status": status,
                "retrieved_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "bytes": out.stat().st_size,
                "sha256": sha256_of(out),
            }
        )

    documents: list[dict] = []
    for stem, statute, candidates in TARGETS:
        got = False
        attempts: list[str] = []
        for url in candidates:
            out = statutes / f"{stem}.html"
            try:
                status, body = fetcher.get(url, out)
            except RuntimeError as exc:
                attempts.append(str(exc))
                continue
            if status == 200 and len(body) > 5000:
                documents.append(
                    {
                        "stem": stem,
                        "statute": statute,
                        "url": url,
                        "path": str(out.relative_to(ROOT)),
                        "bytes": out.stat().st_size,
                        "sha256": sha256_of(out),
                        "retrieved_utc": time.strftime(
                            "%Y-%m-%dT%H:%M:%SZ", time.gmtime()
                        ),
                    }
                )
                files.append(documents[-1])
                got = True
                break
            attempts.append(f"{url} -> HTTP {status}, {len(body)} bytes")
        if not got:
            documents.append(
                {
                    "stem": stem,
                    "statute": statute,
                    "url": None,
                    "path": None,
                    "attempts": attempts,
                    "error": "no candidate URL returned a usable document",
                }
            )

    manifest = {
        "source": "singapore-statutes-online",
        "part_of": "hsa-singapore",
        "retrieval_date": args.date,
        "retrieved_within_window": "03:00-07:00 Asia/Singapore",
        "retrieval_local_time": datetime.datetime.now(SGT).isoformat(),
        "base_url": "https://sso.agc.gov.sg/",
        "robots_txt": "allows all paths except /search; crawl-delay 6",
        "licence": {
            "name": (
                "Singapore legislation reproduced under clause 13 of the "
                "Singapore Statutes Online Terms of Use"
            ),
            "url": "https://sso.agc.gov.sg/Terms-of-Use",
            "attribution_required": True,
            "share_alike": False,
            "redistribution_permitted": True,
            "commercial_use_permitted": True,
            "conditions": [
                "state that the legislation is subject to Singapore Government "
                "copyright and is reproduced with AGC's permission",
                "tell readers they may check SSO for the latest version",
                "the reproducer is responsible for the accuracy of what it "
                "reproduces",
                "no suggestion of AGC or SSO association or endorsement",
                "automated extraction only between 3 a.m. and 7 a.m. Singapore "
                "time, not abusive, intrusive or deceptive, and without "
                "affecting SSO's performance",
            ],
            "attribution_notice": ATTRIBUTION,
        },
        "documents": documents,
        "files": files,
    }
    out_manifest.write_text(json.dumps(manifest, indent=1))
    print(json.dumps({"documents": len(documents), "manifest": str(out_manifest)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
