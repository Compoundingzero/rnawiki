#!/usr/bin/env python
"""Complete the PubChem manifest: legal documents, and a digest of every cached API response.

The cached PUG REST responses number in the thousands, so their per-file SHA256 values live in
raw/api/FILE-DIGESTS.tsv and the manifest carries one entry per cache directory holding the
file count, the total size and a digest over the sorted per-file digests.
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pubchem_fetch import APIDIR, LICENCE, MANIFEST, PUG, PROPS, RAW, load_manifest, save_manifest, sha256_of  # noqa: E402

LEGAL_URLS = {
    "legal/robots-pubchem.txt": "https://pubchem.ncbi.nlm.nih.gov/robots.txt",
    "legal/robots-ftp-ncbi.txt": "https://ftp.ncbi.nlm.nih.gov/robots.txt",
    "legal/docs-programmatic-access.html": "https://pubchem.ncbi.nlm.nih.gov/docs/programmatic-access",
    "legal/docs-downloads.html": "https://pubchem.ncbi.nlm.nih.gov/docs/downloads",
    "legal/ncbi-policies.html": "https://www.ncbi.nlm.nih.gov/home/about/policies/",
    "legal/ftp-pubchem-README.txt": "https://ftp.ncbi.nlm.nih.gov/pubchem/README",
    "legal/ftp-README-Extras.txt": "https://ftp.ncbi.nlm.nih.gov/pubchem/Compound/Extras/README-Extras",
    "legal/docs-programmatic-access.md": "https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/programmatic-access.md",
    "legal/docs-downloads.md": "https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/downloads.md",
    "legal/docs-pug-rest.md": "https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/pug-rest.md",
    "legal/docs-dynamic-request-throttling.md": "https://pubchem.ncbi.nlm.nih.gov/pcfe/docs/markdown/dynamic-request-throttling.md",
    "raw/_ftp-extras-listing.html": "https://ftp.ncbi.nlm.nih.gov/pubchem/Compound/Extras/",
}

ENDPOINTS = {
    "inchikey": f"{PUG}/compound/inchikey/property/{PROPS}/JSON (POST, up to 100 InChIKeys per request)",
    "cid": f"{PUG}/compound/cid/property/{PROPS}/JSON (POST, up to 100 CIDs per request)",
    "unii": f"{PUG}/compound/name/property/{PROPS}/JSON (POST, one UNII code per request)",
    "name": f"{PUG}/compound/name/property/{PROPS}/JSON (POST, one name per request)",
}


def main() -> None:
    m = load_manifest()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for rel, url in LEGAL_URLS.items():
        p = RAW / rel
        if not p.exists():
            continue
        st = p.stat()
        m["files"][rel] = {
            "url": url,
            "retrieved_at": datetime.fromtimestamp(st.st_mtime, timezone.utc).isoformat(timespec="seconds"),
            "bytes": st.st_size,
            "sha256": sha256_of(p),
            "licence": LICENCE,
            "note": "legal and reference document read before the first data request"
            if rel.startswith("legal/") else "bulk directory listing with published file sizes",
        }

    digests_path = APIDIR / "FILE-DIGESTS.tsv"
    lines = ["relative_path\tbytes\tsha256"]
    caches = {}
    for sub, endpoint in ENDPOINTS.items():
        d = APIDIR / sub
        if not d.exists():
            continue
        files = sorted(f for f in d.glob("*.json") if not f.name.startswith("_"))
        per = []
        total = 0
        for f in files:
            h = sha256_of(f)
            n = f.stat().st_size
            total += n
            rel = f.relative_to(RAW).as_posix()
            lines.append(f"{rel}\t{n}\t{h}")
            per.append(h)
        caches[f"raw/api/{sub}/"] = {
            "url": endpoint,
            "retrieved_at": now,
            "files": len(files),
            "bytes": total,
            "sha256_of_sorted_file_digests": hashlib.sha256(
                "\n".join(sorted(per)).encode()).hexdigest(),
            "per_file_digests": "raw/api/FILE-DIGESTS.tsv",
            "licence": LICENCE,
        }
    digests_path.parent.mkdir(parents=True, exist_ok=True)
    digests_path.write_text("\n".join(lines) + "\n")
    st = digests_path.stat()
    m["files"]["raw/api/FILE-DIGESTS.tsv"] = {
        "url": "computed locally from the cached PUG REST responses",
        "retrieved_at": now,
        "bytes": st.st_size,
        "sha256": sha256_of(digests_path),
        "licence": LICENCE,
        "note": "SHA256 of every cached API response, one per line",
    }
    m["api_response_cache"] = caches
    save_manifest(m)
    total_files = sum(c["files"] for c in caches.values()) + len(m["files"])
    total_bytes = sum(c["bytes"] for c in caches.values()) + sum(
        f["bytes"] for f in m["files"].values())
    print(json.dumps({"manifest": str(MANIFEST), "listedFiles": total_files,
                      "listedBytes": total_bytes,
                      "cacheDirectories": {k: v["files"] for k, v in caches.items()}}, indent=2))


if __name__ == "__main__":
    main()
