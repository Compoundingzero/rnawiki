"""Write the raw-pull manifest for the openFDA drug-label archives.

The fourteen partition archives were downloaded on 2026-08-30 and are held at
`rnawiki-ingest-data/openfda/`; the revamp brief forbids refetching them, so
`data/sources/openfda-label/2026-09-05/raw/` links to them and this manifest
records the download URL, the retrieval timestamp, the SHA256 and the licence
for each. Resume-safe: a file already listed with a matching SHA256 is left as
recorded and is not rehashed.

    .venv-corpus/bin/python scripts/revamp/openfda_label_manifest.py
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import zipfile
from pathlib import Path

DATE = "2026-09-05"
BASE = Path("data/sources/openfda-label") / DATE
RAW = BASE / "raw"
LEGAL = BASE / "legal"
MANIFEST = BASE / "manifest.json"
DOWNLOAD_BASE = "https://download.open.fda.gov/drug/label/"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 22), b""):
            h.update(chunk)
    return h.hexdigest()


def utc(ts: float) -> str:
    return dt.datetime.fromtimestamp(ts, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main() -> None:
    existing: dict[str, dict] = {}
    if MANIFEST.exists():
        for entry in json.loads(MANIFEST.read_text()).get("files", []):
            existing[entry["path"]] = entry

    sums = {}
    sumfile = RAW / "SHA256SUMS.txt"
    for line in sumfile.read_text().splitlines():
        digest, name = line.split(maxsplit=1)
        sums[name.strip()] = digest

    files = []
    for link in sorted(RAW.glob("label-*.zip")):
        target = link.resolve()
        rel = str(link)
        recorded = existing.get(rel)
        digest = sums[target.name]
        if recorded and recorded.get("sha256") == digest:
            files.append(recorded)
            continue
        with zipfile.ZipFile(target) as zf:
            info = zf.infolist()[0]
            member = info.filename
            packaged = dt.datetime(*info.date_time).strftime("%Y-%m-%dT%H:%M:%S")
        stat = target.stat()
        files.append(
            {
                "path": rel,
                "stored_at": str(target),
                "url": DOWNLOAD_BASE + member + ".zip",
                "member": member,
                "bytes": stat.st_size,
                "sha256": digest,
                "retrieved_at": utc(stat.st_mtime),
                "openfda_export_packaged_at": packaged,
                "licence": "CC0 1.0 Universal (public domain dedication)",
                "licence_url": "https://open.fda.gov/license/",
            }
        )

    for path in sorted(LEGAL.glob("*")):
        rel = str(path)
        recorded = existing.get(rel)
        digest = sha256(path)
        if recorded and recorded.get("sha256") == digest:
            files.append(recorded)
            continue
        files.append(
            {
                "path": rel,
                "url": None,
                "bytes": path.stat().st_size,
                "sha256": digest,
                "retrieved_at": utc(path.stat().st_mtime),
                "licence": "US Government work",
            }
        )

    urls = {
        "https://open.fda.gov/robots.txt": "HTTP 403 (AccessDenied from the S3 origin; "
        "open.fda.gov serves no robots.txt). No request for data was made to that host "
        "by this ingest: the fourteen archives were already on disk.",
        "https://download.open.fda.gov/robots.txt": "HTTP 403 (AccessDenied from the S3 "
        "origin; the bulk-download host serves no robots.txt).",
        "https://www.fda.gov/robots.txt": "HTTP 200, saved to legal/www.fda.gov-robots.txt.",
        "https://api.fda.gov/robots.txt": "HTTP 404.",
        "https://dailymed.nlm.nih.gov/robots.txt": "HTTP 200, saved to "
        "legal/dailymed.nlm.nih.gov-robots.txt.",
        "https://open.fda.gov/license/": "HTTP 200. States: the content, data, "
        "documentation, code and related materials on openFDA are public domain and "
        "made available with a Creative Commons CC0 1.0 Universal dedication, "
        "including for commercial purposes, without asking permission.",
        "https://open.fda.gov/terms/": "HTTP 200, saved to legal/open.fda.gov-terms.html.",
        "https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm": "HTTP 200. "
        "DailyMed publishes the same SPL content under NLM terms; the bytes used here "
        "come from the openFDA bulk export, not from DailyMed.",
        "https://api.fda.gov/download.json": "HTTP 200, saved to "
        "legal/api.fda.gov-download.json. Records the live export state at 2026-09-05.",
    }

    live = json.loads((LEGAL / "api.fda.gov-download.json").read_text())
    live_label = live["results"]["drug"]["label"]

    manifest = {
        "source": "openfda-label",
        "endpoint": "openFDA drug/label bulk download (DailyMed Structured Product Labeling)",
        "retrieved_at": "2026-08-30T15:27:00Z",
        "processed_at": DATE,
        "licence": "CC0 1.0 Universal (public domain dedication)",
        "licence_url": "https://open.fda.gov/license/",
        "licence_text": "As noted in the terms of service, unless otherwise noted, the "
        "content, data, documentation, code, and related materials on openFDA is public "
        "domain and made available with a Creative Commons CC0 1.0 Universal dedication. "
        "Under CC0, FDA has dedicated the work to the public domain by waiving all rights "
        "to the work worldwide under copyright law, including all related and neighboring "
        "rights, to the extent allowed by law. You can copy, modify, distribute and "
        "perform the work, even for commercial purposes, all without asking permission.",
        "retrieval_route": "bulk download (the first route the spec requires). The "
        "fourteen partition archives were downloaded on 2026-08-30 into "
        "rnawiki-ingest-data/openfda/ and the revamp brief forbids refetching them; "
        "raw/ holds symbolic links to those exact files and every SHA256 below was "
        "computed from the bytes on disk on 2026-09-05.",
        "robots_and_terms": urls,
        "live_export_at_processing_time": {
            "checked": "2026-09-05",
            "export_date": live_label["export_date"],
            "total_records": live_label["total_records"],
            "partitions": len(live_label["partitions"]),
            "note": "The live export is newer than the archives on disk. The difference "
            "is recorded rather than closed, because the brief forbids refetching this "
            "source.",
        },
        "files": files,
        "total_bytes": sum(f["bytes"] for f in files),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"wrote {MANIFEST}: {len(files)} files, {manifest['total_bytes']} bytes")


if __name__ == "__main__":
    main()
