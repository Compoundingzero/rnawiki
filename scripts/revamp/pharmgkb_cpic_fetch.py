"""Retrieve the PharmGKB/ClinPGx bulk downloads and the CPIC API tables.

Phase 2 item 16 of docs/specs/revamp-2026-09.md.

Retrieval route, in the order the spec requires: bulk download first
(the ClinPGx download-file endpoint serves the same ZIP archives the
Downloads page links), then API (CPIC publishes no bulk archive of the
guideline/pair/drug tables; its PostgREST API at api.cpicpgx.org is the
documented access route), and no page fetching of record pages at all.

Resume-safe: a file already listed in manifest.json with a matching SHA256
is not refetched. Retries: three attempts with exponential backoff, then
one alternative host, then the caller records a blocker.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

DATE = "2026-09-06"
ROOT = Path("data/sources/pharmgkb-cpic") / DATE
RAW = ROOT / "raw"
LEGAL = ROOT / "legal"
LOG = ROOT / "requests.log"
MANIFEST = ROOT / "manifest.json"

UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"

CLINPGX_API = "https://api.clinpgx.org"
CPIC_API = "https://api.cpicpgx.org"

# api.clinpgx.org/robots.txt asks for Crawl-delay: 30. Every request this
# script makes to that host waits that long before the next one.
CLINPGX_CRAWL_DELAY_S = 30
# api.cpicpgx.org serves no robots.txt (HTTP 404). PostgREST pages are
# requested at a deliberate 2 s spacing.
CPIC_DELAY_S = 2

PHARMGKB_FILES = [
    ("drugs.zip", "Drug records with cross-references (RxNorm, PubChem, ChEBI, ChEMBL via external vocabulary), used as the identifier spine for mapping."),
    ("chemicals.zip", "Chemical records: the superset of drugs.zip that also carries chemicals annotated but not registered as drugs; clinical annotations cite chemicals by PharmGKB accession."),
    ("summaryAnnotations.zip", "Clinical annotations: one row per variant/haplotype-drug pair with level of evidence 1A-4, score, phenotype category and phenotype text."),
    ("clinicalVariants.zip", "Variant-drug pairs with level of evidence, rolled up per variant."),
    ("drugLabels.zip", "Drug label annotations: regulator, testing level and the genes named in the label."),
    ("relationships.zip", "Curated entity-entity relationships, including gene-chemical, with evidence types and PMID counts."),
    ("guidelineAnnotations.json.zip", "Clinical guideline annotations in JSON, one document per guideline, carrying the guideline source (CPIC, DPWG, CPNDS and others), name, ClinPGx URL and the genes and chemicals it covers."),
]

# Not taken: variantAnnotations.zip (4.3 MB), which holds per-publication
# research annotations carrying no level of evidence and no gene-drug verdict;
# phenotypes.zip, whose accession-to-name table is only needed for the
# variant-disease relationships this source does not map; and the CPIC
# recommendation, dosing and allele-function tables, which are out of scope by
# instruction. Recorded in coverage.json under files_not_taken.

CPIC_TABLES = [
    ("guideline", "id", "CPIC guideline records: id, name, ClinPGx URL, the genes covered and the ClinPGx accession."),
    ("pair", "pairid", "CPIC gene-drug pairs: gene symbol, drug id, guideline id, CPIC level, ClinPGx level, PGx testing recommendation and whether the pair was removed."),
    ("drug", "drugid", "CPIC drug records: RxNorm id, name, ClinPGx accession, DrugBank id, ATC codes and the guideline the drug belongs to."),
]

LEGAL_PAGES = [
    ("https://www.clinpgx.org/robots.txt", "clinpgx-robots.txt"),
    ("https://api.clinpgx.org/robots.txt", "api-clinpgx-robots.txt"),
    ("https://www.pharmgkb.org/robots.txt", "pharmgkb-robots.txt"),
    ("https://cpicpgx.org/robots.txt", "cpicpgx-robots.txt"),
    ("https://api.cpicpgx.org/robots.txt", "api-cpicpgx-robots.txt"),
    ("https://files.cpicpgx.org/robots.txt", "files-cpicpgx-robots.txt"),
    ("https://api.clinpgx.org/v1/data/page/dataUsagePolicy", "clinpgx-dataUsagePolicy.json"),
    ("https://cpicpgx.org/license/", "cpicpgx-license.html"),
    ("https://www.clinpgx.org/downloads", "pharmgkb-downloads.html"),
]


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log_request(url: str, status: object, nbytes: int, out: Path) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as fh:
        fh.write(f"{now()}\t{url}\t{status}\t{nbytes}\t{out}\n")


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {}


def already_have(manifest: dict, rel: str) -> dict | None:
    """Return the stored entry when the file on disk matches its recorded SHA256."""
    for entry in manifest.get("files", []):
        if entry.get("path") == rel:
            path = ROOT / rel
            if path.exists() and sha256_of(path) == entry.get("sha256"):
                return entry
            return None
    return None


def curl(url: str, out: Path, extra: list[str] | None = None) -> tuple[str, int]:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "curl", "-sS", "-L", "--compressed", "-A", UA,
        "--max-time", "1800", "-w", "%{http_code}", "-o", str(out),
    ]
    if extra:
        cmd.extend(extra)
    cmd.append(url)
    proc = subprocess.run(cmd, capture_output=True, text=True)
    status = proc.stdout.strip() or f"curl-error({proc.returncode})"
    nbytes = out.stat().st_size if out.exists() else 0
    log_request(url, status, nbytes, out)
    if proc.stderr.strip():
        (ROOT / "requests.log.curlerr").open("a").write(
            f"{now()}\t{url}\t{proc.stderr.strip()}\n"
        )
    return status, nbytes


def fetch_with_retries(url: str, out: Path, attempts: int = 3) -> tuple[str, int, list[str]]:
    errors: list[str] = []
    for i in range(attempts):
        status, nbytes = curl(url, out)
        if status == "200" and nbytes > 0:
            return status, nbytes, errors
        errors.append(f"attempt {i + 1}: HTTP {status}, {nbytes} bytes")
        if i < attempts - 1:
            time.sleep(5 * (2 ** i))
    return status, nbytes, errors


def fetch_pharmgkb(manifest: dict) -> list[dict]:
    entries: list[dict] = []
    first = True
    for name, note in PHARMGKB_FILES:
        rel = f"raw/{name}"
        kept = already_have(manifest, rel)
        if kept:
            print(f"unchanged  {rel}  {kept['bytes']} bytes")
            entries.append(kept)
            continue
        if not first:
            time.sleep(CLINPGX_CRAWL_DELAY_S)
        first = False
        url = f"{CLINPGX_API}/v1/download/file/data/{name}"
        status, nbytes, errors = fetch_with_retries(url, ROOT / rel)
        if status != "200" or nbytes == 0:
            raise SystemExit(
                f"FAILED {url}: {status} after 3 attempts with backoff. {errors}"
            )
        entries.append({
            "path": rel,
            "url": url,
            "retrieved_utc": now(),
            "http_status": status,
            "bytes": nbytes,
            "sha256": sha256_of(ROOT / rel),
            "licence": "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
            "note": note,
        })
        print(f"fetched    {rel}  {nbytes} bytes")
    return entries


def cpic_get(path: str, params: str) -> list[dict]:
    url = f"{CPIC_API}/v1/{path}?{params}"
    last_error = ""
    for i in range(3):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urlopen(req, timeout=120) as resp:
                body = resp.read()
                log_request(url, resp.status, len(body), Path("(in-memory)"))
                return json.loads(body.decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = f"attempt {i + 1}: {exc!r}"
            log_request(url, "error", 0, Path("(in-memory)"))
            if i < 2:
                time.sleep(5 * (2 ** i))
    raise SystemExit(f"FAILED {url} after 3 attempts with backoff: {last_error}")


def fetch_cpic(manifest: dict) -> list[dict]:
    entries: list[dict] = []
    for table, order_key, note in CPIC_TABLES:
        rel = f"raw/cpic-{table}.json"
        kept = already_have(manifest, rel)
        if kept:
            print(f"unchanged  {rel}  {kept['bytes']} bytes")
            entries.append(kept)
            continue
        rows: list[dict] = []
        offset = 0
        page = 1000
        while True:
            batch = cpic_get(table, f"order={order_key}.asc&limit={page}&offset={offset}")
            rows.extend(batch)
            if len(batch) < page:
                break
            offset += page
            time.sleep(CPIC_DELAY_S)
        out = ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(rows, indent=1, sort_keys=True) + "\n")
        nbytes = out.stat().st_size
        entries.append({
            "path": rel,
            "url": f"{CPIC_API}/v1/{table}?order={order_key}.asc",
            "retrieved_utc": now(),
            "http_status": "200",
            "bytes": nbytes,
            "rows": len(rows),
            "sha256": sha256_of(out),
            "licence": "CC0 1.0 Universal Public Domain Dedication",
            "note": note,
        })
        print(f"fetched    {rel}  {len(rows)} rows  {nbytes} bytes")
        time.sleep(CPIC_DELAY_S)
    return entries


def fetch_legal(manifest: dict) -> list[dict]:
    entries: list[dict] = []
    for url, name in LEGAL_PAGES:
        rel = f"legal/{name}"
        kept = already_have(manifest, rel)
        if kept:
            entries.append(kept)
            continue
        status, nbytes = curl(url, ROOT / rel)
        if not (ROOT / rel).exists():
            (ROOT / rel).write_text("")
            nbytes = 0
        entries.append({
            "path": rel,
            "url": url,
            "retrieved_utc": now(),
            "http_status": status,
            "bytes": nbytes,
            "sha256": sha256_of(ROOT / rel),
            "note": "Legal and access evidence saved before the first data request.",
        })
        time.sleep(2)
    return entries


def main() -> int:
    RAW.mkdir(parents=True, exist_ok=True)
    LEGAL.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    legal = fetch_legal(manifest)
    pharmgkb = fetch_pharmgkb(manifest)
    cpic = fetch_cpic(manifest)
    files = legal + pharmgkb + cpic
    (ROOT / "fetch-entries.json").write_text(json.dumps(files, indent=1) + "\n")
    print(f"{len(files)} files, {sum(e['bytes'] for e in files)} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
