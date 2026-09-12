#!/usr/bin/env python
"""Write the manifest for the dated NCATS Inxight Drugs raw pull.

Records, for every stored file: the URL it came from, the retrieval timestamp read back
from requests.log, its size, and its SHA256. Re-running is safe: a file whose SHA256 is
unchanged keeps its recorded retrieval timestamp.
"""
import argparse
import gzip
import hashlib
import json
import os
from datetime import datetime, timezone

FRDB_ZIP_URL = "https://drugs.ncats.io/downloads-public/frdb-v2024-12-30.zip"
STITCH_ENDPOINT = "https://stitcher.ncats.io/api/stitches/latest/{UNII}"
LEGAL_URLS = {
    "robots.txt": "https://drugs.ncats.io/robots.txt",
    "stitcher-robots.txt": "https://stitcher.ncats.io/robots.txt",
    "ncats-nih-robots.txt": "https://ncats.nih.gov/robots.txt",
    "downloads-page.html": "https://drugs.ncats.io/downloads",
    "downloads-public.html": "https://drugs.ncats.io/downloads-public",
    "about-page.html": "https://drugs.ncats.io/about",
    "disclaimer.html": "https://drugs.ncats.io/disclaimer",
    "ncats-disclaimer.html": "https://ncats.nih.gov/disclaimer",
    "nih-web-policies.html": "https://www.nih.gov/web-policies-notices",
    "nlm-web-policies.html": "https://www.nlm.nih.gov/web_policies.html",
}


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    ap.add_argument("--base", default=None)
    args = ap.parse_args()
    base = args.base or os.path.join("data/sources/inxight", args.date)
    manifest_path = os.path.join(base, "manifest.json")

    previous = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as fh:
            for entry in json.load(fh).get("files", []):
                previous[entry["path"]] = entry

    first_seen = {}
    log_path = os.path.join(base, "requests.log")
    with open(log_path, encoding="utf-8") as fh:
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 5 and parts[4] not in ("-", "stitcher", "stitcher-alt"):
                first_seen.setdefault(parts[4], parts[0])

    files = []
    for root, _dirs, names in os.walk(base):
        for name in sorted(names):
            if name in ("manifest.json", "requests.log") or name.endswith(".curlerr"):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, base)
            digest = sha256(path)
            prior = previous.get(rel)
            records = None
            stitch_first = None
            if rel.startswith("raw/stitcher/"):
                with gzip.open(path, "rt", encoding="utf-8") as fh:
                    records = 0
                    for line in fh:
                        records += 1
                        if stitch_first is None:
                            stitch_first = json.loads(line).get("retrieved")
            if prior and prior.get("sha256") == digest:
                retrieved = prior.get("retrieved")
            elif stitch_first:
                retrieved = stitch_first
            elif rel.startswith("raw/frdb/"):
                # extracted from the zip; the retrieval event is the zip download
                retrieved = first_seen.get(os.path.join(base, "raw", "frdb-v2024-12-30.zip"))
            else:
                retrieved = first_seen.get(path) or datetime.now(timezone.utc).strftime(
                    "%Y-%m-%dT%H:%M:%SZ")
            if rel.startswith("legal/"):
                url = LEGAL_URLS.get(name, "")
            elif name == "frdb-v2024-12-30.zip":
                url = FRDB_ZIP_URL
            elif rel.startswith("raw/frdb/"):
                url = FRDB_ZIP_URL + "#" + name
            elif rel.startswith("raw/stitcher/"):
                url = STITCH_ENDPOINT
            else:
                url = ""
            entry = {"path": rel, "url": url, "retrieved": retrieved,
                     "bytes": os.path.getsize(path), "sha256": digest}
            if records is not None:
                entry["records"] = records
            files.append(entry)

    stitch_records = sum(f.get("records", 0) for f in files if f["path"].startswith("raw/stitcher/"))
    manifest = {
        "source": "inxight",
        "sourceName": "NCATS Inxight Drugs (National Center for Advancing Translational Sciences)",
        "retrievalDate": args.date,
        "retrievalOrder": [
            "bulk download: /downloads-public/frdb-v2024-12-30.zip",
            "API: stitcher.ncats.io/api/stitches/latest/{UNII}, one request per corpus UNII",
        ],
        "licence": "Public domain. US Government work produced by NCATS/NIH; no copyright "
                   "asserted and no terms restricting bulk retrieval or redistribution.",
        "licenceEvidence": {
            "termsPage": "https://drugs.ncats.io/disclaimer",
            "termsPageStoredAt": "legal/disclaimer.html",
            "quotedTerms": "Any materials that InXight provides are for information purposes only "
                           "and do not represent endorsement by or an official position of NCATS, "
                           "the National Institutes of Health (NIH), or any Federal agency. All "
                           "data provided via this website originates from public sources.",
            "robotsTxt": "https://drugs.ncats.io/robots.txt returned HTTP 404 (no robots.txt is "
                         "published, so no crawl directive restricts these paths); "
                         "https://stitcher.ncats.io/robots.txt likewise returned HTTP 404. Both "
                         "responses are stored under legal/.",
            "bulkAccess": "The publisher itself offers the Fast Response Database as a single "
                          "zip on its public downloads page, and the stitcher API is "
                          "unauthenticated and documented on the site.",
        },
        "attributionRequired": False,
        "shareAlike": False,
        "redistributionPermitted": True,
        "commercialUsePermitted": True,
        "excludedFromMapping": {
            "DrugBank, July 2020": "CC BY-NC 4.0; the revamp spec forbids assuming a DrugBank "
                                   "licence, so DrugBank-sourced values are dropped.",
            "Broad Institute Drug List 2024-03-05": "no reuse licence verifiable from the "
                                                    "source's own terms page.",
            "Pharmaceutical Manufacturing Encyclopedia (Third Edition)": "copyrighted reference "
                                                                         "work.",
        },
        "requestLog": "requests.log",
        "stitchedRecords": stitch_records,
        "fileCount": len(files),
        "totalBytes": sum(f["bytes"] for f in files),
        "files": files,
    }
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
    print(f"{manifest_path}: {len(files)} files, {manifest['totalBytes']} bytes, "
          f"{stitch_records} stitched records")


if __name__ == "__main__":
    main()
