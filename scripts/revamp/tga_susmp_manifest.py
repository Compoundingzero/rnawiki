"""Build data/sources/tga-artg/<date>/manifest.json from the raw pull and the request log.

Resume-safe: a file already listed in the manifest with a matching SHA256 is
recorded as `unchanged` and is never refetched. Run after scripts/revamp/tga_fetch.sh
has placed the files and appended to requests.log.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROLE_BY_DIR = {"legal": "legal", "raw": "raw"}

# Artefacts that carry no successful HTTP 200 line in requests.log, and why.
NOT_FETCHED = {
    "robots-apps-tga-gov-au.txt": {
        "url": "https://apps.tga.gov.au/robots.txt",
        "http_status": 404,
        "retrieved": "2026-09-05T16:07:51Z",
        "provenance": (
            "The host answered HTTP 404 from IIS: apps.tga.gov.au publishes no robots.txt. "
            "The 404 body is kept as the record of that check."
        ),
    },
    "www-tga-gov-au-retries.txt": {
        "provenance": (
            "Written by this step, not fetched: the verbatim curl output of nine requests to "
            "www.tga.gov.au (three URLs, three attempts each with 0 s, 7 s and 22 s backoff), "
            "every one curl exit 28 with 0 bytes received."
        ),
    },
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_log(path: Path) -> dict[str, dict]:
    """Last successful request per output file."""
    out: dict[str, dict] = {}
    if not path.exists():
        return out
    for line in path.read_text().splitlines():
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        ts, url, code, byte_count, target = parts[0], parts[1], parts[2], parts[3], parts[4]
        name = Path(target.split(" (retry")[0]).name
        if code != "200":
            continue
        out[name] = {
            "url": url,
            "http_status": int(code),
            "retrieved": ts,
            "logged_bytes": int(byte_count),
        }
    return out


def main(pull_date: str) -> int:
    root = Path("data/sources/tga-artg") / pull_date
    if not root.exists():
        print(f"missing pull directory: {root}", file=sys.stderr)
        return 1
    log = read_log(root / "requests.log")
    previous = {}
    manifest_path = root / "manifest.json"
    if manifest_path.exists():
        previous = {f["path"]: f for f in json.loads(manifest_path.read_text()).get("files", [])}

    files = []
    unchanged = 0
    for directory, role in ROLE_BY_DIR.items():
        for path in sorted((root / directory).glob("*")):
            if not path.is_file():
                continue
            rel = str(path)
            digest = sha256(path)
            entry = {
                "path": rel,
                "role": role,
                "bytes": path.stat().st_size,
                "sha256": digest,
            }
            entry.update(log.get(path.name, {}))
            if "url" not in entry:
                entry.update(NOT_FETCHED.get(path.name, {"provenance": "written by this step"}))
            prior = previous.get(rel)
            entry["state"] = "unchanged" if prior and prior.get("sha256") == digest else "written"
            if entry["state"] == "unchanged":
                unchanged += 1
            files.append(entry)

    raw_files = [f for f in files if f["role"] == "raw"]
    manifest = {
        "source": "tga-artg",
        "sourceName": (
            "Poisons Standard (SUSMP) schedule lists — Therapeutic Goods "
            "(Poisons Standard—June 2026) Instrument 2026 (F2026L00633), Federal Register of "
            "Legislation. The Australian Register of Therapeutic Goods half of this source is "
            "blocked; see blocker."
        ),
        "retrievalDate": pull_date,
        "retrievalRoute": (
            "Bulk download of the instrument's authorised Word original from the Federal Register "
            "of Legislation, the route the register's own downloads page links "
            "(https://www.legislation.gov.au/F2026L00633/asmade/downloads). The in-force instrument "
            "was identified through the register's OData API "
            "(https://api.prod.legislation.gov.au/v1/titles?$filter=contains(name,'Poisons Standard')), "
            "which reports F2026L00633 as the only Poisons Standard with status InForce and gives "
            "the Primary Word document size as 966,941 bytes; the downloaded file is exactly that "
            "size. No page of the register was crawled."
        ),
        "landingPage": "https://www.legislation.gov.au/F2026L00633/asmade",
        "instrument": {
            "registerId": "F2026L00633",
            "name": "Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026",
            "commonName": "Poisons Standard June 2026 (SUSMP)",
            "makingDate": "2026-05-27",
            "registeredAt": "2026-05-28T12:59:30Z",
            "status": "InForce",
            "compilationNumber": "0",
        },
        "licence": {
            "name": "Creative Commons Attribution 4.0 International (CC BY 4.0)",
            "url": "https://creativecommons.org/licenses/by/4.0/",
            "terms_of_use_url": "https://www.legislation.gov.au/terms-of-use",
            "terms_of_use_local_copy":
                f"data/sources/tga-artg/{pull_date}/legal/legislation-gov-au-terms-of-use.html",
            "quoted": (
                "With the exception of the Commonwealth Coat of Arms, and where otherwise noted, "
                "all content on the Federal Register of Legislation (the Legislation Register) is "
                "provided under Creative Commons Attribution 4.0 International (the CC BY 4.0 "
                "licence). This licence allows you to share (copy and redistribute in any medium "
                "or format) and to adapt (remix, transform, and build upon) content for any "
                "purpose, even commercially."
            ),
            "attribution_required": True,
            "share_alike": False,
            "redistribution_permitted": True,
            "commercial_use_permitted": True,
            "attribution_text": (
                "Sourced from the Federal Register of Legislation at 6 September 2026. For the "
                "latest information on Australian Government law please go to "
                "https://www.legislation.gov.au."
            ),
        },
        "robots": [
            {
                "url": "https://www.legislation.gov.au/robots.txt",
                "local_copy": f"data/sources/tga-artg/{pull_date}/legal/robots-www-legislation-gov-au.txt",
                "finding": (
                    "User-agent: * with Crawl-delay: 10 and Disallow: /assets/ only. The instrument "
                    "download path is not under /assets/. Four requests were made to this host in "
                    "total, spaced by more than 10 seconds each."
                ),
            },
            {
                "url": "https://www.tga.gov.au/robots.txt",
                "local_copy": f"data/sources/tga-artg/{pull_date}/legal/robots-www-tga-gov-au-wayback-20260202.txt",
                "finding": (
                    "Not retrievable live: nine requests over two days timed out after 30 s with 0 "
                    "bytes received (evidence in legal/www-tga-gov-au-retries.txt). The copy here "
                    "is the Internet Archive capture of 2026-02-02, a stock Drupal robots.txt whose "
                    "Disallow rules cover /core/, /profiles/, /admin/, /search and account paths "
                    "only. Robots is not what blocks this source; the site copyright notice is."
                ),
            },
            {
                "url": "https://www.ebs.tga.gov.au/robots.txt",
                "local_copy": f"data/sources/tga-artg/{pull_date}/legal/robots-www-ebs-tga-gov-au.txt",
                "finding": (
                    "User-agent: * / Disallow: / — the TGA eBS host, which serves the ARTG public "
                    "search and its export, forbids automated retrieval of every path. No eBS data "
                    "path was requested."
                ),
            },
            {
                "url": "https://data.gov.au/robots.txt",
                "local_copy": f"data/sources/tga-artg/{pull_date}/legal/robots-data-gov-au.txt",
                "finding": (
                    "Checked before querying the CKAN API for an openly licensed ARTG "
                    "redistribution. /data/api/ is not disallowed. The search returned no ARTG "
                    "dataset and no resource hosted on tga.gov.au."
                ),
            },
            {
                "url": "https://apps.tga.gov.au/robots.txt",
                "local_copy": f"data/sources/tga-artg/{pull_date}/legal/robots-apps-tga-gov-au.txt",
                "finding": "HTTP 404, no robots.txt. No path on this host was requested.",
            },
        ],
        "blockedComponent": {
            "component": "Australian Register of Therapeutic Goods (active ingredient, ARTG id, ARTG status)",
            "status": "BLOCKED-WITH-EVIDENCE",
            "evidence": "data/revamp/worklog-entries/2.12-blocker.md",
            "tgaCopyrightCaptures": [
                f"data/sources/tga-artg/{pull_date}/legal/tga-copyright-wayback-20251128.html",
                f"data/sources/tga-artg/{pull_date}/legal/tga-copyright-wayback-20250518.html",
            ],
            "quoted": (
                "TGA Copyright page (https://www.tga.gov.au/about-us/using-our-website/copyright, "
                "Internet Archive capture of 2025-11-28, the most recent capture that returns the "
                "page): \"You must not use the whole or any part of the content on this website for "
                "any commercial purposes.\" and \"You are not permitted to re-transmit, distribute "
                "or commercialise the material without our prior written approval.\" The earlier "
                "capture at https://www.tga.gov.au/copyright (2025-05-18) says the same in the "
                "older wording: reproduction is permitted for personal or internal organisational "
                "use \"but only if you or your organisation do not use the reproduction for any "
                "commercial purpose\"."
            ),
        },
        "apiKey": (
            "None. The Federal Register of Legislation OData API is open and offers no key "
            "registration; no credential was created or stored for this source."
        ),
        "requestLog": f"data/sources/tga-artg/{pull_date}/requests.log",
        "rawFileCount": len(raw_files),
        "rawBytes": sum(f["bytes"] for f in raw_files),
        "files": files,
        "derivedFiles": [
            f"data/sources/tga-artg/{pull_date}/parsed/susmp-entries.json",
            "data/sources/tga-artg/mapped.parquet",
            "data/sources/tga-artg/coverage.json",
            "data/sources/tga-artg/name-candidates-for-review.json",
            "data/sources/tga-artg/unmatched-records.json",
        ],
    }
    manifest_path.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
    print(f"{len(files)} files, {unchanged} unchanged, raw {manifest['rawFileCount']} files / "
          f"{manifest['rawBytes']} bytes -> {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "2026-09-06"))
