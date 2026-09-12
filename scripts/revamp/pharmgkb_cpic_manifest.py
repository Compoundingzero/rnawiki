"""Assemble data/sources/pharmgkb-cpic/<date>/manifest.json.

Reads the per-file entries the fetch script recorded, copies the licence text
carried inside the PharmGKB archives out to legal/, and writes the manifest
that makes the pull resume-safe: a file listed here with a matching SHA256 is
never refetched.
"""

from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path

DATE = "2026-09-06"
ROOT = Path("data/sources/pharmgkb-cpic") / DATE
ENTRIES = ROOT / "fetch-entries.json"
MANIFEST = ROOT / "manifest.json"


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def export_archive_licence() -> dict:
    """Copy the LICENSE.txt that ships inside every PharmGKB archive to legal/."""
    out = ROOT / "legal" / "pharmgkb-archive-LICENSE.txt"
    with zipfile.ZipFile(ROOT / "raw" / "chemicals.zip") as zf:
        text = zf.read("LICENSE.txt")
    out.write_bytes(text)
    return {
        "path": "legal/pharmgkb-archive-LICENSE.txt",
        "url": "https://api.clinpgx.org/v1/download/file/data/chemicals.zip#LICENSE.txt",
        "retrieved_utc": None,
        "http_status": "200",
        "bytes": len(text),
        "sha256": sha256_of(out),
        "note": (
            "The licence file ClinPGx ships inside every data archive, copied "
            "out unchanged. It is the licence grant that attaches to the "
            "downloaded records themselves."
        ),
    }


def export_usage_policy_html() -> dict:
    """Write the data usage policy's HTML body out of the saved API response.

    www.clinpgx.org is a JavaScript application, so the policy page itself
    returns a shell to curl. The application reads the policy from this API
    route; the HTML it renders is extracted here so the licence terms can be
    read without running the application.
    """
    saved = json.loads((ROOT / "legal" / "clinpgx-dataUsagePolicy.json").read_text())
    html = saved["data"]["markdown"]["html"]
    out = ROOT / "legal" / "clinpgx-dataUsagePolicy.html"
    out.write_text(html)
    return {
        "path": "legal/clinpgx-dataUsagePolicy.html",
        "url": "https://api.clinpgx.org/v1/data/page/dataUsagePolicy#data.markdown.html",
        "retrieved_utc": None,
        "http_status": "200",
        "bytes": out.stat().st_size,
        "sha256": sha256_of(out),
        "note": (
            "The HTML body carried inside the saved API response, extracted "
            "unchanged. This is the page that grants CC BY-SA 4.0 for "
            "ClinPGx/PharmGKB and CC0 1.0 for CPIC."
        ),
    }


def main() -> int:
    entries = json.loads(ENTRIES.read_text())
    entries.append(export_archive_licence())
    entries.append(export_usage_policy_html())

    for entry in entries:
        path = ROOT / entry["path"]
        if not path.exists():
            raise SystemExit(f"missing file listed in fetch entries: {path}")
        actual = sha256_of(path)
        if actual != entry["sha256"]:
            raise SystemExit(
                f"{path} changed on disk since it was fetched: "
                f"{entry['sha256']} -> {actual}"
            )

    manifest = {
        "source": "pharmgkb-cpic",
        "source_name": (
            "PharmGKB / ClinPGx pharmacogenomics knowledge base, and the "
            "Clinical Pharmacogenetics Implementation Consortium (CPIC) "
            "gene-drug pair and guideline tables"
        ),
        "retrieval_date": DATE,
        "pharmgkb_archive_created": "2026-09-05",
        "retrieval_route": (
            "Bulk ZIP download from the ClinPGx download-file endpoint "
            "(https://api.clinpgx.org/v1/download/file/data/<name>.zip), which "
            "serves the same archives the ClinPGx Downloads page links, then "
            "the CPIC PostgREST API at https://api.cpicpgx.org/v1/ for the "
            "guideline, pair and drug tables. CPIC publishes no bulk archive of "
            "those tables, so the API is the documented bulk route. No record "
            "page was fetched."
        ),
        "base_urls": [
            "https://api.clinpgx.org",
            "https://www.clinpgx.org",
            "https://api.cpicpgx.org",
        ],
        "site_rename_note": (
            "PharmGKB has been renamed ClinPGx. www.pharmgkb.org answers and "
            "serves the ClinPGx application; api.pharmgkb.org no longer "
            "resolves (curl: (6) Could not resolve host: api.pharmgkb.org), and "
            "the download endpoint is api.clinpgx.org. The archives still carry "
            "PharmGKB accessions and the licence text names both."
        ),
        "licence": {
            "pharmgkb": {
                "name": (
                    "Creative Commons Attribution-ShareAlike 4.0 International "
                    "(CC BY-SA 4.0)"
                ),
                "statement_url": "https://www.clinpgx.org/page/dataUsagePolicy",
                "statement_quote": (
                    "ClinPGx/PharmGKB grants use of its data and contents under "
                    "the Creative Commons Attribution-ShareAlike 4.0 "
                    "International License."
                ),
                "archive_licence_file": "legal/pharmgkb-archive-LICENSE.txt",
                "additional_conditions_quoted": [
                    "Under no circumstances can ClinPGx data be sold for other's private or commercial use. (LICENSE.txt shipped in every archive)",
                    "to use the data for research purposes and not with any intent to offer all or any part of the data for sale as a commercial item (Terms and Conditions of Use, dataUsagePolicy)",
                    "ShareAlike: If you alter, amend, reuse or otherwise change ClinPGx data you agree that if you distribute such product, all recipients shall first agree to be subject to this license. (LICENSE.txt)",
                ],
                "attribution_required": True,
                "share_alike": True,
                "redistribution_permitted": True,
                "commercial_use_permitted": (
                    "Permitted by the CC BY-SA 4.0 grant, which expressly allows "
                    "commercial use. The conditions ClinPGx adds bar selling the "
                    "data and state a research purpose; they do not bar "
                    "displaying attributed, share-alike records on a site that "
                    "is itself commercial, and rnawiki.com does not sell the "
                    "data. The wording is recorded verbatim above so the "
                    "decision can be revisited."
                ),
                "citation": (
                    "ClinPGx (formerly PharmGKB), https://www.clinpgx.org/, "
                    "archives created 2026-09-05, retrieved 2026-09-06."
                ),
            },
            "cpic": {
                "name": "CC0 1.0 Universal Public Domain Dedication",
                "statement_url": "https://www.clinpgx.org/page/dataUsagePolicy",
                "statement_quote": (
                    "CPIC resources are freely available for use by anyone. All "
                    "curated content published by CPIC is available free of "
                    "restriction under the CC0 1.0 Universal (CC0 1.0) Public "
                    "Domain Dedication."
                ),
                "attribution_required": False,
                "attribution_requested": True,
                "share_alike": False,
                "redistribution_permitted": True,
                "commercial_use_permitted": True,
                "citation": (
                    "CPIC. https://api.cpicpgx.org/v1/ accessed 2026-09-06, "
                    "table version numbers in raw/cpic-*.json. CPIC requests "
                    "that the primary source at ClinPGx be named and that "
                    "content be marked as subject to update."
                ),
                "trademark_note": (
                    "CPIC is a registered service mark of the US Department of "
                    "Health and Human Services, and CPIC states that its logo "
                    "and acronym may not be reproduced on another website "
                    "without NIH permission. No logo is stored. The acronym is "
                    "stored, in the field name pgxCpicGuideline and in guideline "
                    "names and notes, because the same policy directs that "
                    "content be cited as CPIC with the URL and access date; "
                    "whether that use needs NIH permission is a question for "
                    "Felix before these rows are rendered."
                ),
            },
        },
        "robots_txt": [
            {
                "url": "https://www.clinpgx.org/robots.txt",
                "http_status": 200,
                "path": "legal/clinpgx-robots.txt",
                "effect": "Disallows /literature/ for SiteimproveBot only. Nothing here is disallowed.",
            },
            {
                "url": "https://api.clinpgx.org/robots.txt",
                "http_status": 200,
                "path": "legal/api-clinpgx-robots.txt",
                "effect": "Allow: / for all agents with Crawl-delay: 30. Every request to this host in the pull waited 30 seconds.",
            },
            {
                "url": "https://cpicpgx.org/robots.txt",
                "http_status": 200,
                "path": "legal/cpicpgx-robots.txt",
                "effect": "Disallows /wp-admin/ only.",
            },
            {
                "url": "https://api.cpicpgx.org/robots.txt",
                "http_status": 404,
                "path": "legal/api-cpicpgx-robots.txt",
                "effect": "No robots.txt is served. Requests were spaced 2 seconds apart.",
            },
            {
                "url": "https://files.cpicpgx.org/robots.txt",
                "http_status": 404,
                "path": "legal/files-cpicpgx-robots.txt",
                "effect": "No robots.txt is served. No file was taken from this host.",
            },
        ],
        "access_note": (
            "https://cpicpgx.org/license/ answers 302 to "
            "https://www.clinpgx.org/page/dataUsagePolicy, so CPIC's licence and "
            "PharmGKB's are published on one page; that page is saved as "
            "legal/clinpgx-dataUsagePolicy.json with the rendered HTML beside "
            "it. www.clinpgx.org is a JavaScript application whose pages return "
            "a 2,505-byte shell to curl, which is why the licence was taken "
            "from the API route that the application itself reads."
        ),
        "working_files": {
            "fetch-entries.json": (
                "Per-file record the fetch script writes and this script reads "
                "to build the manifest. Regenerated on every fetch; the manifest "
                "below is the authoritative list."
            )
        },
        "request_log": "requests.log",
        "request_log_note": (
            "Every request this pull made, with timestamp, URL, HTTP status, "
            "bytes and output path. curl transport errors are appended to "
            "requests.log.curlerr."
        ),
        "files": entries,
        "total_bytes": sum(e["bytes"] for e in entries),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=1) + "\n")
    print(f"{len(entries)} files, {manifest['total_bytes']} bytes -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
