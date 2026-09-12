"""Write data/sources/chembl/2026-09-05/manifest.json.

Every file retrieved today gets its URL, retrieval timestamp, HTTP status, byte
count and SHA256, read back from requests.log. The ChEMBL 37 files the
corpus-20k run already downloaded are listed separately with their SHA256 so the
manifest shows what was reused rather than refetched.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

DATE = "2026-09-05"
ROOT = Path("data/sources/chembl") / DATE
RAW = ROOT / "raw"
LEGAL = ROOT / "legal"
LOG = ROOT / "requests.log"
HELD = Path("data/corpus-20k/raw/chembl")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def request_index() -> dict[str, dict]:
    index: dict[str, dict] = {}
    for line in LOG.read_text().splitlines():
        parts = line.split("\t")
        if len(parts) != 5:
            continue
        ts, url, status, nbytes, outfile = parts
        index[outfile] = {"url": url, "retrieved_at": ts, "http_status": status, "bytes": int(nbytes or 0)}
    return index


def describe(paths: list[Path], index: dict[str, dict]) -> list[dict]:
    out: list[dict] = []
    for path in sorted(paths):
        entry = index.get(str(path), {})
        out.append(
            {
                "path": str(path),
                "url": entry.get("url"),
                "retrieved_at": entry.get("retrieved_at"),
                "http_status": entry.get("http_status"),
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
        )
    return out


def main() -> int:
    index = request_index()
    raw_files = describe(sorted(RAW.glob("*.json")), index)
    legal_files = describe(sorted(LEGAL.glob("*")), index)
    held_files = [
        {"path": str(path), "bytes": path.stat().st_size, "sha256": sha256(path)}
        for path in sorted(HELD.glob("*"))
        if path.is_file()
    ]

    manifest = {
        "source": "chembl",
        "source_name": "ChEMBL 37 (EMBL-EBI)",
        "source_version": "ChEMBL 37",
        "retrieval_date": DATE,
        "retrieval_route": (
            "ChEMBL REST API at https://www.ebi.ac.uk/chembl/api/data, sequential, one request at a "
            "time with a 0.5 s minimum interval; the bulk FTP release was not re-downloaded because "
            "the corpus-20k run already holds chembl_37_chemreps.txt.gz and the molecule, mechanism, "
            "indication and warning tables, listed below under previously_retrieved."
        ),
        "base_url": "https://www.ebi.ac.uk/chembl/api/data",
        "licence": {
            "name": "Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)",
            "url": "https://ftp.ebi.ac.uk/pub/databases/chembl/ChEMBLdb/latest/LICENSE",
            "local_copy": "data/sources/chembl/2026-09-05/legal/chembl-ftp-LICENSE.txt",
            "terms_of_use_url": "https://www.ebi.ac.uk/about/terms-of-use/",
            "terms_of_use_local_copy": "data/sources/chembl/2026-09-05/legal/ebi-terms-of-use.html",
            "attribution_required": True,
            "share_alike": True,
            "redistribution_permitted": True,
            "commercial_use_permitted": True,
        },
        "robots": {
            "url": "https://www.ebi.ac.uk/robots.txt",
            "local_copy": "data/sources/chembl/2026-09-05/legal/ebi-robots.txt",
            "finding": (
                "No Disallow rule covers /chembl or /chembl/api. The wildcard agent group sets "
                "Crawl-Delay: 10, which addresses crawlers; this run uses the documented REST API as a "
                "single sequential client at one request every 0.5 s and fetched no HTML page of the site."
            ),
        },
        "api_key": "None. The ChEMBL REST API is open and offers no key registration.",
        "endpoints_used": [
            "activity (molecule_chembl_id__in, target_chembl_id__in, pchembl_value__isnull=false)",
            "compound_record (molecule_chembl_id__in)",
            "document (only=document_chembl_id,year)",
            "molecule (molecule_chembl_id__in, for corpus ids below max_phase 1)",
            "atc_class",
        ],
        "api_calls": len([f for f in raw_files if f["url"]]),
        "raw_files": raw_files,
        "legal_files": legal_files,
        "previously_retrieved": {
            "note": (
                "Downloaded by the corpus-20k run on 2026-09-04 and reused unchanged; not refetched. "
                "molecules-*.json is the molecule endpoint filtered to max_phase__gte=1 (16,784 records)."
            ),
            "directory": str(HELD),
            "files": held_files,
        },
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"manifest: {len(raw_files)} raw files, {len(legal_files)} legal files, {len(held_files)} reused files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
