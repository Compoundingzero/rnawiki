"""Write the Phase 2 source-14 deliverables for MHRA products and emc.

Source 14 is blocked on terms, not on a transport failure, so the mapped table is written with
its full declared schema and zero rows and the coverage report carries the reason, the evidence
paths and the scope that was forgone. Nothing from either site is joined to a corpus page.

Resume-safe: a file already listed in the manifest with a matching SHA256 is left untouched and
reported as verified rather than rewritten.
"""
from __future__ import annotations

import collections
import datetime
import hashlib
import json
import pathlib

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

DAY = "2026-09-06"
ROOT = pathlib.Path("data/sources/mhra-emc")
BASE = ROOT / DAY
LEGAL = BASE / "legal"
RAW = BASE / "raw"
MANIFEST = BASE / "manifest.json"
REQUESTS = BASE / "requests.log"

CORPUS_TIERS = pathlib.Path("data/corpus-20k/tiers/model-assignment.ndjson")

MAPPED_SCHEMA = pa.schema([
    ("key", pa.string()),
    ("tier", pa.int8()),
    ("field", pa.string()),
    ("value", pa.string()),
    ("source_record_id", pa.string()),
    ("source_url", pa.string()),
    ("source_date", pa.string()),
    ("match_rule", pa.string()),
    ("form_of_target", pa.string()),
    ("licence", pa.string()),
])

LICENCE_MHRA = (
    "No reuse licence published. products.mhra.gov.uk carries no terms-of-use or copyright page "
    "(its Next.js build manifest enumerates every route on the site and none exists); SmPC, PIL and "
    "PAR text is authored by marketing authorisation holders, which is third-party copyright that "
    "the Open Government Licence expressly does not cover and which is not asserted here in any case."
)
LICENCE_EMC = (
    "All rights reserved, Datapharm Ltd. The published Terms prohibit commercial use, populating a "
    "database or knowledge bank from the site, re-circulating material to third parties and "
    "systematically tracking updates. Reuse requires a negotiated licence from Datapharm."
)


def sha256(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_requests() -> dict[str, list[dict]]:
    """Map each written file to the requests that produced it, newest last."""
    by_file: dict[str, list[dict]] = collections.defaultdict(list)
    if not REQUESTS.exists():
        return by_file
    for line in REQUESTS.read_text(encoding="utf-8").splitlines():
        parts = line.split("\t")
        if len(parts) != 5:
            continue
        ts, url, status, size, outfile = parts
        by_file[outfile].append(
            {"url": url, "retrieved": ts, "http_status": status, "bytes": int(size)}
        )
    return by_file


def tier_counts() -> dict[str, int]:
    counts: collections.Counter[int] = collections.Counter()
    with CORPUS_TIERS.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            model = (row.get("model") or "").upper()
            if model == "LONGEVITY" or row.get("withdrawn"):
                tier = 1
            elif model == "CLINICAL":
                tier = 2
            else:
                tier = 3
            counts[tier] += 1
    return {str(t): counts[t] for t in (1, 2, 3)}


def sitemap_scope() -> dict[str, int]:
    import re

    path = RAW / "products-mhra-sitemap.xml"
    text = path.read_text(encoding="utf-8", errors="replace")
    locs = re.findall(r"<loc><!\[CDATA\[(.*?)\]\]></loc>", text)
    counts: collections.Counter[str] = collections.Counter()
    for loc in locs:
        seg = loc.replace("https://products.mhra.gov.uk", "").strip("/").split("/")[0].split("?")[0]
        counts[seg or "site-root"] += 1
    return {"urls_total": len(locs), **{k: v for k, v in counts.most_common()}}


existing = {}
if MANIFEST.exists():
    prior = json.loads(MANIFEST.read_text(encoding="utf-8"))
    existing = {f["path"]: f.get("sha256") for f in prior.get("files", [])}

by_file = read_requests()
files, verified, hashed = [], 0, 0
for path in sorted(list(LEGAL.rglob("*")) + list(RAW.rglob("*"))):
    if not path.is_file():
        continue
    rel = path.relative_to(BASE).as_posix()
    digest = sha256(path)
    if existing.get(rel) == digest:
        verified += 1
    else:
        hashed += 1
    reqs = by_file.get(str(path), [])
    files.append({
        "path": rel,
        "bytes": path.stat().st_size,
        "sha256": digest,
        "requests": reqs,
        "url": reqs[-1]["url"] if reqs else None,
        "retrieved": reqs[-1]["retrieved"] if reqs else None,
        "http_status": reqs[-1]["http_status"] if reqs else None,
        "derived_from": None if reqs else "written locally from the retrieved files in this directory",
    })

raw_files = [f for f in files if f["path"].startswith("raw/")]
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

manifest = {
    "source": "mhra-emc",
    "source_name": "MHRA products database (products.mhra.gov.uk) and emc, the electronic medicines compendium (www.medicines.org.uk)",
    "phase2_item": 14,
    "retrieval_date": DAY,
    "written": now,
    "status": "BLOCKED-WITH-EVIDENCE",
    "status_reason": (
        "emc forbids this use in its published Terms; products.mhra.gov.uk publishes no reuse terms "
        "and offers no bulk file and no working or permitted API. No SmPC, PIL or PAR content was "
        "retrieved from either site."
    ),
    "licence": {
        "products.mhra.gov.uk": LICENCE_MHRA,
        "www.medicines.org.uk (emc)": LICENCE_EMC,
        "licence_evidence": [
            "legal/TERMS-DETERMINATION.md",
            "legal/emc-legal-and-privacy-notice.verbatim.txt",
            "legal/govuk-terms-and-conditions.verbatim.txt",
            "legal/open-government-licence-v3.verbatim.txt",
        ],
        "licence_urls": [
            "https://www.medicines.org.uk/emc/privacy-notice-and-legal",
            "https://www.gov.uk/help/terms-conditions",
            "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
        ],
    },
    "content_retrieved": {
        "smpc_pil_par_documents": 0,
        "note": (
            "Only robots.txt, legal and about pages, the client bundles needed to establish whether "
            "an API exists, the data.gov.uk dataset listing, the API probe transcript and the "
            "products sitemap were retrieved. The sitemap is kept to measure the forgone scope and "
            "is joined to nothing."
        ),
    },
    "file_count": len(files),
    "raw_file_count": len(raw_files),
    "raw_bytes": sum(f["bytes"] for f in raw_files),
    "total_bytes": sum(f["bytes"] for f in files),
    "files": files,
}
MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

table = pa.table({name: pa.array([], type=typ) for name, typ in zip(MAPPED_SCHEMA.names, MAPPED_SCHEMA.types)}, schema=MAPPED_SCHEMA)
mapped_path = ROOT / "mapped.parquet"
pq.write_table(table, mapped_path)

tiers = tier_counts()
coverage = {
    "source": "mhra-emc",
    "phase2_item": 14,
    "status": "BLOCKED-WITH-EVIDENCE",
    "retrieval_date": DAY,
    "written": now,
    "reason": (
        "Neither site clears this use. emc's published Terms prohibit commercial use, populating a "
        "database from the site, re-circulating material and systematically tracking updates; "
        "rnawiki.com is a commercial site whose Phase 2 purpose is exactly database population. "
        "products.mhra.gov.uk publishes no terms of use or copyright statement at any route on the "
        "site, has no bulk file and no dataset on data.gov.uk, and its two machine endpoints are the "
        "site's own Azure search backend (key issued to the site, not to this project, no terms, no "
        "registration route) and a GraphQL host that returned HTTP 503 on every attempt. Operating "
        "rule 8 forbids scraping a source whose terms cannot be found. Evidence: "
        "data/sources/mhra-emc/2026-09-06/legal/TERMS-DETERMINATION.md."
    ),
    "records_ingested": 0,
    "pages_matched_by_tier": {"1": 0, "2": 0, "3": 0},
    "pages_matched_total": 0,
    "corpus_pages_by_tier": tiers,
    "fields_gained_by_tier": {"1": {}, "2": {}, "3": {}},
    "fields_gained": [],
    "fields_not_gained": {
        "regulatory.UK": "not populated; UK status stays \"UK register not cleared for this run\"",
        "smpcInteractions": "not populated; SmPC section 4.5 was not retrieved",
        "smpcPharmacodynamics": "not populated; SmPC section 5.1 was not retrieved",
    },
    "unmatched_records": 0,
    "unmatched_records_note": "No record was ingested, so there is no unmatched record. This is zero because nothing was taken, not because everything matched.",
    "name_candidates_sent_to_review": 0,
    "match_rules_used": [],
    "forgone_scope": {
        "note": "Counted from the robots-declared sitemap, kept at raw/products-mhra-sitemap.xml and joined to nothing.",
        "products_mhra_sitemap": sitemap_scope(),
        "sitemap_lastmod": "2026-05-20",
        "emc_documents_claimed_by_site": "more than 14,000 documents (emc About page, legal/emc-about-the-emc.verbatim.txt)",
    },
    "unblock_route": (
        "A negotiated content licence from Datapharm for emc, or a published reuse licence or "
        "documented API from MHRA for products.mhra.gov.uk. Recorded in docs/revamp/BLOCKERS.md."
    ),
    "mapped_parquet": {
        "path": "data/sources/mhra-emc/mapped.parquet",
        "rows": 0,
        "schema": [f"{n}:{t}" for n, t in zip(MAPPED_SCHEMA.names, [str(t) for t in MAPPED_SCHEMA.types])],
        "note": "Written with the full declared schema and zero rows so the Phase 2 integration reads every source the same way. It contains no value because none may be taken.",
    },
}
(ROOT / "coverage.json").write_text(json.dumps(coverage, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print(f"manifest: {MANIFEST}  files={len(files)} verified_unchanged={verified} hashed={hashed}")
print(f"raw: {len(raw_files)} files / {manifest['raw_bytes']} bytes; all files {manifest['total_bytes']} bytes")
print(f"mapped: {mapped_path} rows={pq.read_metadata(mapped_path).num_rows} cols={len(MAPPED_SCHEMA.names)}")
print(f"coverage: {ROOT / 'coverage.json'} tiers={tiers}")
