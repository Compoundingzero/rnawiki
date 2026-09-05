"""Build the raw-pull manifest for the FDA Orange Book and Purple Book pull.

Records every retrieved URL, its retrieval timestamp and HTTP status from
`requests.log`, the SHA256 and byte size of every stored file, the zip members
extracted from the Orange Book archive, and the licence statement quoted from
the FDA website-policies page saved under `legal/`.

Resume-safe: a file already listed in an existing manifest.json with a matching
SHA256 is reported as `unchanged` and is never refetched by the caller.
"""

from __future__ import annotations

import hashlib
import json
import os
import struct
import sys
import zipfile
from datetime import datetime, timezone

ROOT = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
DATE = "2026-09-05"
DIR = os.path.join(ROOT, "data", "sources", "orange-purple-book", DATE)
MANIFEST = os.path.join(DIR, "manifest.json")
LOG = os.path.join(DIR, "requests.log")

ARCHIVE_DATE_BASIS = (
    "UTC, from the extended-timestamp extra field (0x5455) the Orange Book archive "
    "stores for each member, whose modification time is a Unix epoch second. The zip's "
    "DOS stamp declares no timezone and is not used alone; `unzip -l` shows the same "
    "instant in the extracting machine's local zone, which displays products.txt as "
    "2026-08-15 00:04 in Singapore for a recorded 2026-08-14T16:04:26Z."
)

LICENCE = "US Government work, public domain (FDA)"
LICENCE_URL = "https://www.fda.gov/about-fda/about-website/website-policies"
LICENCE_TEXT = (
    "Unless otherwise noted, the contents of the FDA website (www.fda.gov) - both "
    "text and graphics - are not copyrighted. They are in the public domain and may "
    "be republished, reprinted and otherwise used freely by anyone without the need "
    "to obtain permission from FDA. Credit to the U.S. Food and Drug Administration "
    "as the source is appreciated but not required."
)

# Which URL produced which stored file. Keys are paths relative to the pull directory.
ORIGIN = {
    "raw/EOBZIP.zip": "https://www.fda.gov/media/76860/download?attachment",
    "raw/purplebook-search-August-2026-data-download.csv":
        "https://www.accessdata.fda.gov/drugsatfda_docs/PurpleBook/2026/"
        "purplebook-search-August-data-download.csv",
    "legal/robots-www.fda.gov.txt": "https://www.fda.gov/robots.txt",
    "legal/robots-www.accessdata.fda.gov.txt": "https://www.accessdata.fda.gov/robots.txt",
    "legal/robots-purplebooksearch.fda.gov.txt": "https://purplebooksearch.fda.gov/robots.txt",
    "legal/fda-website-policies.html": LICENCE_URL,
    "legal/orange-book-data-files-page.html":
        "https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files",
    "legal/purplebook-downloads-page.html": "https://purplebooksearch.fda.gov/downloads",
}

EXTRACTED_FROM = {
    "raw/orange-book/products.txt": "raw/EOBZIP.zip",
    "raw/orange-book/patent.txt": "raw/EOBZIP.zip",
    "raw/orange-book/exclusivity.txt": "raw/EOBZIP.zip",
}


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def archive_member_dates(zip_path: str) -> dict[str, str]:
    """Date each member carries inside the Orange Book archive, in UTC.

    Each member carries an extended-timestamp extra field (header 0x5455) whose
    modification time is a Unix epoch second and therefore states UTC outright.
    That field is authoritative here. The zip's DOS timestamp is read only as a
    cross-check: it declares no timezone, and `unzip -l` renders the extended
    field in the extracting machine's local zone, which is how the same archive
    can display as 08-15 in Singapore while the recorded instant is 08-14 UTC.
    These are the dates the mapping script stamps on every Orange Book row as
    `source_date`.
    """
    dates: dict[str, str] = {}
    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            extra, offset, unix_mtime = info.extra, 0, None
            while offset + 4 <= len(extra):
                header_id, size = struct.unpack_from("<HH", extra, offset)
                body = extra[offset + 4:offset + 4 + size]
                offset += 4 + size
                if header_id == 0x5455 and len(body) >= 5 and body[0] & 1:
                    unix_mtime = struct.unpack_from("<i", body, 1)[0]
            if unix_mtime is None:
                raise SystemExit(
                    f"{info.filename} carries no extended timestamp; the DOS stamp "
                    f"{info.date_time[:3]} declares no timezone and is not used alone")
            dates[info.filename] = datetime.fromtimestamp(
                unix_mtime, timezone.utc).strftime("%Y-%m-%d")
    return dates


def read_requests_log() -> dict[str, dict]:
    entries: dict[str, dict] = {}
    if not os.path.exists(LOG):
        return entries
    for line in open(LOG, encoding="utf-8"):
        parts = line.rstrip("\n").split("\t")
        if len(parts) < 5:
            continue
        ts, url, status, byte_count, outfile = parts[:5]
        rel = os.path.relpath(outfile, DIR) if os.path.isabs(outfile) else \
            os.path.relpath(os.path.join(ROOT, outfile), DIR)
        entries[rel] = {"retrieved_at": ts, "url": url, "http_status": status,
                        "bytes_received": int(byte_count)}
    return entries


def main() -> int:
    previous = {}
    if os.path.exists(MANIFEST):
        old = json.load(open(MANIFEST, encoding="utf-8"))
        previous = {f["path"]: f for f in old.get("files", [])}

    log = read_requests_log()
    member_dates = archive_member_dates(os.path.join(DIR, "raw/EOBZIP.zip"))
    files = []
    for rel in sorted(set(ORIGIN) | set(EXTRACTED_FROM)):
        path = os.path.join(DIR, rel)
        if not os.path.exists(path):
            raise SystemExit(f"missing expected file: {rel}")
        digest = sha256(path)
        entry = {
            "path": rel,
            "sha256": digest,
            "bytes": os.path.getsize(path),
            "licence": LICENCE,
            "licence_url": LICENCE_URL,
        }
        if rel in EXTRACTED_FROM:
            member = os.path.basename(rel)
            entry["data_file_date"] = member_dates[member]
            entry["data_file_date_basis"] = ARCHIVE_DATE_BASIS
        else:
            entry["retrieved_date_utc"] = log.get(rel, {}).get("retrieved_at", "")[:10]
        if rel in ORIGIN:
            entry["url"] = ORIGIN[rel]
            entry.update({k: v for k, v in log.get(rel, {}).items() if k != "url"})
        else:
            entry["extracted_from"] = EXTRACTED_FROM[rel]
            entry["url"] = ORIGIN[EXTRACTED_FROM[rel]]
            entry["retrieved_at"] = log.get(EXTRACTED_FROM[rel], {}).get("retrieved_at")
        prior = previous.get(rel)
        entry["state"] = "unchanged" if prior and prior.get("sha256") == digest else "written"
        files.append(entry)

    manifest = {
        "source": "FDA Orange Book and Purple Book",
        "source_directory": f"data/sources/orange-purple-book/{DATE}",
        "pull_date": DATE,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "retrieval_method": "bulk download of the published data files; no page scraping of records",
        "licence": LICENCE,
        "licence_url": LICENCE_URL,
        "licence_text": LICENCE_TEXT,
        "datasets": {
            "orange_book": {
                "title": "Approved Drug Products with Therapeutic Equivalence Evaluations "
                         "(Orange Book) downloadable data files",
                "page": "https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files",
                "archive_url": ORIGIN["raw/EOBZIP.zip"],
                "members": ["products.txt", "patent.txt", "exclusivity.txt"],
                "format": "ASCII text, tilde (~) delimited",
                "data_file_dates": {
                    "products.txt": member_dates["products.txt"],
                    "patent.txt": member_dates["patent.txt"],
                    "exclusivity.txt": member_dates["exclusivity.txt"],
                },
                "data_file_date_basis": ARCHIVE_DATE_BASIS,
            },
            "purple_book": {
                "title": "Purple Book: Database of Licensed Biological Products, "
                         "monthly data download (August 2026 report)",
                "page": "https://purplebooksearch.fda.gov/downloads",
                "file_url": ORIGIN["raw/purplebook-search-August-2026-data-download.csv"],
                "report_month": "2026-08",
                "structure": "two sections; rows 4-33 are the monthly change report, "
                             "row 35 is the header of the full product listing",
            },
        },
        "robots": {
            "www.fda.gov": {
                "status": 200,
                "saved": "legal/robots-www.fda.gov.txt",
                "relevant_directives": "User-agent: * Crawl-Delay: 30; /media/ is not disallowed",
                "observed": "30 s between requests to www.fda.gov",
            },
            "www.accessdata.fda.gov": {
                "status": 200,
                "saved": "legal/robots-www.accessdata.fda.gov.txt",
                "relevant_directives": "User-agent: * disallows /drugsatfda_docs/rems/ only; "
                                       "/drugsatfda_docs/PurpleBook/ is permitted. Non-standard "
                                       "Hit-rate: 30 and Visiting-hours: 23:00EDT-05:00EDT apply "
                                       "to indexing crawlers.",
                "observed": "one request for one published data file, 30 s after the previous "
                            "request; no crawl or index of the site was performed",
            },
            "purplebooksearch.fda.gov": {
                "status": 404,
                "saved": "legal/robots-purplebooksearch.fda.gov.txt",
                "relevant_directives": "no robots.txt published (IIS 404 page saved as evidence); "
                                       "no crawl restrictions declared",
                "observed": "one request for the downloads listing page",
            },
        },
        "requests_log": "requests.log",
        "files": files,
    }
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    print(json.dumps({"files": len(files),
                      "bytes": sum(f["bytes"] for f in files),
                      "written": sum(1 for f in files if f["state"] == "written"),
                      "unchanged": sum(1 for f in files if f["state"] == "unchanged")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
