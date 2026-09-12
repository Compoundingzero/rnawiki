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
    # (output file name, statute short name, candidate URLs in preference order)
    #
    # Three forms of each document are kept.
    #
    # `?WholeDoc=1` is the reading view. It carries the long title, the enacting
    # provisions and the table of contents, but not the bodies of the Schedules:
    # SSO loads those through `/Details/GetLazyLoadContent` after the page
    # renders, so the substance lists are absent from that HTML.
    #
    # `?ViewType=Print` returns the print-selection form, not the document.
    #
    # `?ViewType=Pdf` returns the complete document in SSO's published PDF form,
    # Schedules included. That PDF is what the controlled-substance parse reads.
    (
        "misuse-of-drugs-act-1973.html",
        "Misuse of Drugs Act 1973",
        [
            "https://sso.agc.gov.sg/Act/MDA1973?WholeDoc=1",
            "https://sso.agc.gov.sg/Act/MDA1973",
        ],
    ),
    (
        "poisons-act-1938.html",
        "Poisons Act 1938",
        [
            "https://sso.agc.gov.sg/Act/PA1938?WholeDoc=1",
            "https://sso.agc.gov.sg/Act/PA1938",
        ],
    ),
    (
        "poisons-rules.html",
        "Poisons Rules (subsidiary legislation under the Poisons Act 1938)",
        [
            "https://sso.agc.gov.sg/SL/PA1938-R1?WholeDoc=1",
            "https://sso.agc.gov.sg/SL/PA1938-R1",
        ],
    ),
    (
        "misuse-of-drugs-act-1973-print.html",
        "Misuse of Drugs Act 1973 (print-selection form)",
        ["https://sso.agc.gov.sg/Act/MDA1973?ViewType=Print"],
    ),
    (
        "poisons-act-1938-print.html",
        "Poisons Act 1938 (print-selection form)",
        ["https://sso.agc.gov.sg/Act/PA1938?ViewType=Print"],
    ),
    (
        "poisons-rules-print.html",
        "Poisons Rules (print-selection form)",
        ["https://sso.agc.gov.sg/SL/PA1938-R1?ViewType=Print"],
    ),
    (
        "misuse-of-drugs-act-1973.pdf",
        "Misuse of Drugs Act 1973 (published PDF, Schedules included)",
        ["https://sso.agc.gov.sg/Act/MDA1973?ViewType=Pdf"],
    ),
    (
        "poisons-act-1938.pdf",
        "Poisons Act 1938 (published PDF, Schedules included)",
        ["https://sso.agc.gov.sg/Act/PA1938?ViewType=Pdf"],
    ),
    (
        "poisons-rules.pdf",
        "Poisons Rules (published PDF, Schedules included)",
        ["https://sso.agc.gov.sg/SL/PA1938-R1?ViewType=Pdf"],
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

    # Resume: a document already recorded in this date's statutes manifest whose
    # file is still on disk with the recorded SHA256 is carried forward and not
    # requested again.
    already: dict[str, dict] = {}
    already_legal: dict[str, dict] = {}
    if out_manifest.exists():
        previous = json.loads(out_manifest.read_text())
        for doc in previous.get("documents", []):
            path = doc.get("path")
            sha = doc.get("sha256")
            if not path or not sha:
                continue
            disk = ROOT / path
            if disk.exists() and sha256_of(disk) == sha:
                already[pathlib.Path(path).name] = doc
        for rec in previous.get("files", []):
            path = rec.get("path")
            sha = rec.get("sha256")
            if not path or not sha or "stem" in rec:
                continue
            disk = ROOT / path
            if disk.exists() and sha256_of(disk) == sha:
                already_legal[pathlib.Path(path).name] = rec

    for name, url in LEGAL:
        if name in already_legal:
            files.append(already_legal[name])
            continue
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
    for filename, statute, candidates in TARGETS:
        stem = filename.rsplit(".", 1)[0]
        if filename in already:
            documents.append(already[filename])
            files.append(already[filename])
            continue
        got = False
        attempts: list[str] = []
        for url in candidates:
            out = statutes / filename
            try:
                status, body = fetcher.get(url, out)
            except RuntimeError as exc:
                attempts.append(str(exc))
                continue
            if status == 200 and len(body) > 5000:
                documents.append(
                    {
                        "stem": stem,
                        "file": filename,
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
                    "file": filename,
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

    # Fold the statute pull into the source's single date manifest so one file
    # lists every raw artefact with its URL, retrieval time, SHA256 and licence.
    source_manifest = base / "manifest.json"
    if source_manifest.exists():
        combined = json.loads(source_manifest.read_text())
        combined["statutes"] = {
            "manifest": str(out_manifest.relative_to(ROOT)),
            "base_url": manifest["base_url"],
            "robots_txt": manifest["robots_txt"],
            "licence": manifest["licence"],
            "documents": documents,
        }
        others = [
            rec
            for rec in combined.get("files", [])
            if not str(rec.get("path", "")).startswith(
                str((base / "raw" / "statutes").relative_to(ROOT))
            )
            and pathlib.Path(str(rec.get("path", ""))).name
            not in {"robots-sso-agc.txt", "sso-terms-of-use.html"}
        ]
        combined["files"] = others + files
        source_manifest.write_text(json.dumps(combined, indent=1))
    print(json.dumps({"documents": len(documents), "manifest": str(out_manifest)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
