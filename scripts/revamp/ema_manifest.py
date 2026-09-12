"""Build data/sources/ema/<date>/manifest.json for the EMA Phase 2 pull.

Reads the request log written by scripts/revamp/fetch_log.sh, hashes every file
that log names, and records the EMA reuse terms verbatim from the copyright
notice captured under legal/. Resume-safe: a file already listed in an existing
manifest with a matching SHA256 keeps its recorded retrieval timestamp.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

LICENCE_NAME = (
    "European Medicines Agency copyright and limited reproduction notice: "
    "information and documents made available on EMA's webpages are public and may be "
    "reproduced and/or distributed, totally or in part, irrespective of the means and/or "
    "the formats used, for non-commercial and commercial purposes, provided that EMA is "
    "always acknowledged as the source of the material."
)
LICENCE_URL = "https://www.ema.europa.eu/en/about-us/about-website/legal-notice"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(date: str) -> int:
    root = Path("data/sources/ema") / date
    log = root / "requests.log"
    if not log.exists():
        print(f"no request log at {log}", file=sys.stderr)
        return 1

    manifest_path = root / "manifest.json"
    previous: dict[str, dict] = {}
    if manifest_path.exists():
        for entry in json.loads(manifest_path.read_text()).get("files", []):
            previous[entry["path"]] = entry

    files = []
    for line in log.read_text().splitlines():
        parts = line.split("\t")
        if len(parts) != 5:
            continue
        ts, url, status, byte_count, out = parts
        path = Path(out)
        if not path.exists():
            print(f"request log names a missing file: {out}", file=sys.stderr)
            return 1
        digest = sha256(path)
        prior = previous.get(out)
        retrieved = prior["retrieved"] if prior and prior.get("sha256") == digest else ts
        files.append(
            {
                "path": out,
                "url": url,
                "http_status": int(status) if status.isdigit() else status,
                "retrieved": retrieved,
                "bytes": path.stat().st_size,
                "logged_bytes": int(byte_count),
                "sha256": digest,
                "role": "legal" if "/legal/" in out else ("raw" if "/raw/" in out else "log"),
            }
        )

    headers = root / "raw" / "medicines-output-medicines-report_en.headers.txt"
    last_modified = None
    if headers.exists():
        for line in headers.read_text(errors="replace").splitlines():
            if line.lower().startswith("last-modified:"):
                last_modified = line.split(":", 1)[1].strip()

    derived = []
    licence_text = root / "legal" / "ema-copyright-and-limited-reproduction-notice.txt"
    if licence_text.exists():
        derived.append(
            {
                "path": str(licence_text),
                "derivedFrom": str(root / "legal" / "ema-legal-notice.html"),
                "description": "Verbatim text of the copyright and limited reproduction notice section.",
                "bytes": licence_text.stat().st_size,
                "sha256": sha256(licence_text),
            }
        )

    manifest = {
        "source": "ema",
        "sourceName": "European Medicines Agency, medicines output report (centrally authorised human and veterinary medicines)",
        "retrievalDate": date,
        "retrievalDateNote": (
            "The directory date is the local calendar date (Asia/Singapore, UTC+8). "
            "Every per-file `retrieved` timestamp is UTC."
        ),
        "landingPage": "https://www.ema.europa.eu/en/medicines/download-medicine-data",
        "licence": LICENCE_NAME,
        "licenceUrl": LICENCE_URL,
        "licenceCapture": f"data/sources/ema/{date}/legal/ema-copyright-and-limited-reproduction-notice.txt",
        "attribution": "Source: European Medicines Agency",
        "robotsCapture": f"data/sources/ema/{date}/legal/robots-www.ema.europa.eu.txt",
        "robotsAssessment": (
            "robots.txt for www.ema.europa.eu disallows /core/, /profiles/, /admin/, /search/, "
            "/user/* and /media/oembed. It disallows no path under /en/documents/report/ or "
            "/en/medicines/, and explicitly allows /*/documents/report/*.json$. The two paths "
            "retrieved here, /en/documents/report/medicines-output-medicines-report_en.xlsx and "
            "/en/medicines/download-medicine-data, are permitted."
        ),
        "reportLastModified": last_modified,
        "supersedes": {
            "path": "data/corpus-20k/raw/ema/medicines-output-medicines-report_en.xlsx",
            "sha256": "bb1eadf5eecbc4db033b90f66a9335d57b162c3fa272be198ffaa1a17fbdef1f",
            "reportGenerated": "03/09/2026 - 18:00",
            "reason": (
                "The copy already on disk was generated 03/09/2026 18:00. The published file "
                "carries Last-Modified Sat, 05 Sep 2026 04:02:55 GMT and generates 05/09/2026 06:00, "
                "so it is newer and was refetched. Both hold 2,732 rows, 2,339 of them human."
            ),
        },
        "requestLog": f"data/sources/ema/{date}/requests.log",
        "files": files,
        "derivedFiles": derived,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{manifest_path} {len(files)} files {sum(f['bytes'] for f in files)} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "2026-09-06"))
