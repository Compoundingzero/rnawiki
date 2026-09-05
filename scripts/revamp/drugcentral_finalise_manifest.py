#!/usr/bin/env python
"""Complete the DrugCentral manifest: exact CSV record counts, licence terms
as read from the DrugCentral licence page, and the retrieval-policy findings.
"""
from __future__ import annotations

import csv
import json
import os
from datetime import datetime, timezone

csv.field_size_limit(1 << 27)

BASE = os.path.join(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion",
    "data/sources/drugcentral/2026-09-05",
)
MANIFEST = os.path.join(BASE, "manifest.json")

man = json.load(open(MANIFEST, encoding="utf-8"))

for rel, entry in man["files"].items():
    if rel.endswith(".csv") and rel.startswith("raw/tables/"):
        with open(os.path.join(BASE, rel), encoding="utf-8", newline="") as fh:
            entry["rows"] = sum(1 for _ in csv.reader(fh)) - 1

man["source"] = "DrugCentral"
man["publisher"] = "Division of Translational Informatics, University of New Mexico"
man["release"] = {
    "name": "DrugCentral 2023",
    "dbversion": 54,
    "release_timestamp": "2023-11-01T12:10:57.835",
    "verified_from": "raw/tables/dbversion.csv, exported from the public read-only instance",
}
man["retrieved_date"] = "2026-09-05"
man["licence"] = {
    "name": "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
    "url": "https://creativecommons.org/licenses/by-sa/4.0/legalcode",
    "stated_at": "https://drugcentral.org/privacy",
    "text_as_published": (
        "DrugCentral License. DrugCentral is available under Creative Commons "
        "license, download and use of this resource evidences your agreement to "
        "all the terms and conditions of license."
    ),
    "citation": "Ursu O. et al., DrugCentral, Nucleic Acids Research. https://doi.org/10.1093/nar/gkw993",
    "attribution_required": True,
    "share_alike": True,
    "redistribution_permitted": True,
    "commercial_use_permitted": True,
}
man["retrieval_policy"] = {
    "robots_txt": "neither drugcentral.org nor unmtid-dbs.net serves robots.txt (HTTP 404 on both); "
                  "see legal/robots-check.json",
    "terms_reviewed": ["https://drugcentral.org/privacy", "https://drugcentral.org/download"],
    "bulk_access": "explicitly offered by the publisher: a PostgreSQL dump and a public read-only "
                   "PostgreSQL instance, both linked from https://drugcentral.org/download",
    "pages_scraped": "none; no HTML page of the site was parsed for data, only for its download "
                     "links and licence text",
    "request_log": "requests.log",
}
man["bulk_download_size_check"] = {
    "url": "https://unmtid-dbs.net/download/drugcentral.dump.11012023.sql.gz",
    "content_length_bytes": 1400714190,
    "under_5gb_limit": True,
    "note": "the archive size was read from a HEAD request and recorded before the "
            "transfer was started, per the disk rule; the dump expands to "
            "4,977,219,505 bytes, so it was kept compressed and the tables were "
            "read from the public instance instead of being restored locally",
    "uncompressed_bytes": 4977219505,
}
transfer = man["files"].get("raw/drugcentral.dump.11012023.sql.gz")
if transfer:
    transfer["transfer_seconds"] = 2738
    transfer["transfer_note"] = (
        "06:48:09Z to 07:33:47Z UTC across six range segments, about 512 KiB/s "
        "aggregate; a single connection to the same file settled at about 110 KiB/s"
    )

json.dump(man, open(MANIFEST, "w", encoding="utf-8"), indent=2, sort_keys=True)
open(MANIFEST, "a", encoding="utf-8").write("\n")
print(json.dumps({"files": len(man["files"]),
                  "total_bytes": sum(f["bytes"] for f in man["files"].values()),
                  "updated": datetime.now(timezone.utc).isoformat()}, indent=2))
