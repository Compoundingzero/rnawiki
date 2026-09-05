"""Write `data/sources/clinicaltrials/<date>/manifest.json`.

Two kinds of file are listed. The 2026-09-01 API v2 snapshot was already on disk
under `rnawiki-ingest-data/clinicaltrials/` and the Phase 2 brief forbids refetching
it, so it is listed in place, by absolute path, with its SHA256 measured again here
rather than copied from its own manifest. The top-up responses fetched on the
retrieval date are listed under `raw/`, each with its own SHA256, together with the
legal captures.

Resume-safe by construction: `clinicaltrials_topup_fetch.py` skips any batch whose
cached response already parses and holds only expected ids, so re-running the pair
re-verifies rather than refetches.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_manifest.py [YYYY-MM-DD]
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import date as date_cls, datetime, timezone
from pathlib import Path

SNAPSHOT_DIR = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/clinicaltrials/20260901T090005"
)
LICENCE_URL = "https://www.nlm.nih.gov/web_policies.html#copyright"
LICENCE_TEXT = (
    "US Government work, public domain (National Library of Medicine). NLM Web "
    "Policies, Copyright: \"Works produced by the U.S. government are not subject to "
    "copyright protection in the United States. Any such works found on National "
    "Library of Medicine (NLM) Web sites may be freely used or reproduced without "
    "permission in the U.S. Please acknowledge NLM as the source of the information "
    "by including the phrase 'Courtesy of the National Library of Medicine' or "
    "'Source: National Library of Medicine.'\" Verbatim capture: "
    "legal/nlm-copyright-statement.txt. Scope determination for the fields taken: "
    "legal/TERMS-DETERMINATION.md"
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def entry(path: Path, url: str, retrieved: str, note: str) -> dict:
    stat = path.stat()
    return {
        "path": str(path),
        "url": url,
        "retrievedAt": retrieved,
        "bytes": stat.st_size,
        "sha256": sha256(path),
        "note": note,
    }


def main(pull_date: str) -> int:
    root = Path("data/sources/clinicaltrials") / pull_date
    raw_dir = root / "raw"
    legal_dir = root / "legal"
    snapshot_manifest = json.loads((SNAPSHOT_DIR / "manifest.json").read_text())
    snapshot_retrieved = snapshot_manifest["completedAt"]

    existing = {}
    manifest_path = root / "manifest.json"
    if manifest_path.exists():
        for record in json.loads(manifest_path.read_text()).get("files", []):
            existing[record["path"]] = record

    files: list[dict] = []
    for name in ("studies.ndjson", "manifest.json", "checkpoint.json"):
        path = SNAPSHOT_DIR / name
        files.append(
            entry(
                path,
                "https://clinicaltrials.gov/api/v2/studies (paged, pageSize=1000, 602 pages)",
                snapshot_retrieved,
                "Snapshot already on disk before this step and not refetched, per the Phase 2 "
                "brief. SHA256 measured here and compared with the value recorded in the "
                "snapshot's own manifest.",
            )
        )

    modified = datetime.fromtimestamp(
        max((p.stat().st_mtime for p in raw_dir.glob("topup-*.json")), default=0),
        tz=timezone.utc,
    ).strftime("%Y-%m-%dT%H:%M:%SZ")
    for path in sorted(raw_dir.glob("topup-*.json")):
        prior = existing.get(str(path))
        record = (
            prior
            if prior and prior.get("bytes") == path.stat().st_size and prior.get("sha256") == sha256(path)
            else entry(
                path,
                "https://clinicaltrials.gov/api/v2/studies?filter.ids=<400 NCT ids>&fields="
                "NCTId|StartDate|StartDateType|PrimaryCompletionDate|PrimaryCompletionDateType|"
                "CompletionDate|CompletionDateType|DesignInterventionModel&pageSize=1000",
                modified,
                "Date-type and intervention-model top-up for the studies already linked to a "
                "corpus page. Exact ids per call are reproducible from "
                "scripts/revamp/clinicaltrials_topup_fetch.py, which batches the sorted matched "
                "NCT list 400 at a time.",
            )
        )
        files.append(record)

    for path in sorted(legal_dir.glob("*")):
        if path.name == "TERMS-DETERMINATION.md":
            url = "written by this step from the captures beside it"
        elif path.name == "nlm-copyright-statement.txt":
            url = "verbatim extract of nlm-web-policies.html"
        elif path.name.startswith("nlm-"):
            url = f"https://www.nlm.nih.gov/{path.name.replace('nlm-', '').replace('.html', '.html')}"
        else:
            url = "https://clinicaltrials.gov/" + path.name.replace("clinicaltrials-", "").replace(
                ".html", ""
            )
        files.append(entry(path, url, pull_date, "Legal capture; see legal/TERMS-DETERMINATION.md"))

    manifest = {
        "schema": "rnawiki-revamp-source-manifest/v1",
        "source": "clinicaltrials",
        "sourceName": "ClinicalTrials.gov, National Library of Medicine",
        "retrievalDate": pull_date,
        "licence": LICENCE_TEXT,
        "licenceUrl": LICENCE_URL,
        "attribution": "Source: National Library of Medicine",
        "robotsTxt": "legal/clinicaltrials-robots.txt",
        "requestsLog": str(root / "requests.log"),
        "snapshotSha256Recorded": snapshot_manifest["studiesSha256"],
        "snapshotSha256Measured": next(
            f["sha256"] for f in files if f["path"].endswith("studies.ndjson")
        ),
        "files": files,
        "fileCount": len(files),
        "totalBytes": sum(f["bytes"] for f in files),
    }
    manifest["snapshotSha256Matches"] = (
        manifest["snapshotSha256Recorded"] == manifest["snapshotSha256Measured"]
    )
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(
        json.dumps(
            {
                "fileCount": manifest["fileCount"],
                "totalBytes": manifest["totalBytes"],
                "snapshotSha256Matches": manifest["snapshotSha256Matches"],
                "manifest": str(manifest_path),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
