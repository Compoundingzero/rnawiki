"""Fetch the ChEMBL 37 data the corpus-20k run did not pull.

The run already holds, under `data/corpus-20k/raw/chembl/`: the molecule table
filtered to `max_phase__gte=1`, the complete drug_mechanism, drug_indication and
drug_warning tables, and `chembl_37_chemreps.txt.gz`. This script adds the four
things that are absent:

  documents        the whole document table as (document_chembl_id, year)
  atc              the whole atc_class table, code plus level descriptions
  molecules-topup  molecule records for corpus ChEMBL ids below max_phase 1
  compound_records (molecule, document) pairs for every corpus ChEMBL id
  activities       pChEMBL-valued activities for corpus molecules restricted to
                   the targets their drug_mechanism records name

Every request is logged to requests.log as (timestamp, url, status, bytes,
outfile). Failures retry three times with exponential backoff, then once against
the alternative `?format=json` endpoint form, then abort with the full error.
"""

from __future__ import annotations

import argparse
import glob
import gzip
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://www.ebi.ac.uk/chembl/api/data"
ALT_BASE = "https://www.ebi.ac.uk/chembl/api/data"  # alternative request form, see fetch_json
DATE = "2026-09-05"
ROOT = Path("data/sources/chembl") / DATE
RAW = ROOT / "raw"
LOG = ROOT / "requests.log"
CORPUS_CANONICAL = Path("data/corpus-20k/identity/canonical.ndjson")
HELD = Path("data/corpus-20k/raw/chembl")
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
MIN_INTERVAL = 0.5  # seconds between requests; EBI robots.txt sets Crawl-Delay 10 for crawlers,
                    # this is the documented programmatic API and one request every 0.5 s is
                    # a single sequential client, never parallel.
PAGE_LIMIT = 1000
BATCH = 50

_last_request = [0.0]
_calls = [0]


def _log(ts: str, url: str, status: str, nbytes: int, outfile: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as fh:
        fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{outfile}\n")


def fetch_json(path: str, params: dict[str, str], outfile: str) -> dict:
    """GET one API page with retries, backoff and an alternative endpoint form."""
    attempts: list[str] = []
    urls = [
        f"{BASE}/{path}.json?" + urllib.parse.urlencode(params),
        f"{ALT_BASE}/{path}?" + urllib.parse.urlencode({**params, "format": "json"}),
    ]
    for url_index, url in enumerate(urls):
        tries = 1 if url_index == 1 else 3
        for attempt in range(tries):
            wait = MIN_INTERVAL - (time.time() - _last_request[0])
            if wait > 0:
                time.sleep(wait)
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=300) as resp:
                    payload = resp.read()
                    status = str(resp.status)
                _last_request[0] = time.time()
                _calls[0] += 1
                _log(ts, url, status, len(payload), outfile)
                return json.loads(payload)
            except Exception as exc:  # noqa: BLE001 - the full text goes to the log and the blocker
                _last_request[0] = time.time()
                _calls[0] += 1
                body = ""
                if isinstance(exc, urllib.error.HTTPError):
                    try:
                        body = exc.read()[:500].decode("utf-8", "replace")
                    except Exception:  # noqa: BLE001
                        body = ""
                code = getattr(exc, "code", "error")
                _log(ts, url, f"ERROR:{code}", 0, outfile)
                attempts.append(f"attempt {len(attempts) + 1} {url} -> {type(exc).__name__}: {exc} {body}")
                if attempt < tries - 1:
                    time.sleep(2 ** (attempt + 1))
    raise RuntimeError("ChEMBL request failed after 3 retries and 1 alternative endpoint:\n" + "\n".join(attempts))


def paginate(path: str, params: dict[str, str], collection: str, stem: str, start_page: int = 0) -> int:
    """Write one JSON file per API page under raw/. Returns the number of pages written."""
    offset = start_page * PAGE_LIMIT
    page = start_page
    while True:
        out = RAW / f"{stem}-{page:05d}.json"
        if out.exists():
            try:
                held = json.loads(out.read_text())
                meta = held.get("page_meta", {})
                if not meta.get("next"):
                    return page + 1
                offset += PAGE_LIMIT
                page += 1
                continue
            except json.JSONDecodeError:
                out.unlink()
        body = fetch_json(path, {**params, "limit": str(PAGE_LIMIT), "offset": str(offset)}, str(out))
        out.write_text(json.dumps(body))
        meta = body.get("page_meta", {})
        rows = len(body.get(collection, []))
        if not meta.get("next") or rows == 0:
            return page + 1
        offset += PAGE_LIMIT
        page += 1


def corpus_chembl_ids() -> list[str]:
    ids: set[str] = set()
    for line in CORPUS_CANONICAL.open():
        rec = json.loads(line)
        cid = rec.get("chemblId")
        if cid:
            ids.add(cid.strip())
    return sorted(ids)


def held_molecule_ids() -> set[str]:
    ids: set[str] = set()
    for path in sorted(glob.glob(str(HELD / "molecules-*.json"))):
        for mol in json.loads(Path(path).read_text())["molecules"]:
            ids.add(mol["molecule_chembl_id"])
    return ids


def held_mechanisms() -> list[dict]:
    rows: list[dict] = []
    for path in sorted(glob.glob(str(HELD / "mechanism-*.json"))):
        rows += json.loads(Path(path).read_text())["mechanisms"]
    return rows


def held_hierarchy() -> dict[str, str]:
    parent: dict[str, str] = {}
    for path in sorted(glob.glob(str(HELD / "molecules-*.json"))):
        for mol in json.loads(Path(path).read_text())["molecules"]:
            node = mol.get("molecule_hierarchy") or {}
            if node.get("parent_chembl_id"):
                parent[mol["molecule_chembl_id"]] = node["parent_chembl_id"]
    return parent


def chemreps_inchikeys(wanted: set[str]) -> dict[str, str]:
    """standard InChIKey per ChEMBL id, from the held chembl_37_chemreps.txt.gz."""
    out: dict[str, str] = {}
    path = HELD / "chembl_37_chemreps.txt.gz"
    with gzip.open(path, "rt", encoding="utf-8", errors="replace") as fh:
        header = fh.readline().rstrip("\n").split("\t")
        i_id = header.index("chembl_id")
        i_key = header.index("standard_inchi_key")
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) <= i_key:
                continue
            cid = parts[i_id]
            if cid in wanted:
                key = parts[i_key].strip().upper()
                if key:
                    out[cid] = key
    return out


def activity_plan() -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    """(query molecule -> targets to ask for, corpus id -> molecule ids to ask for)."""
    corpus = set(corpus_chembl_ids())
    parent = held_hierarchy()
    targets_direct: dict[str, set[str]] = {}
    targets_by_parent: dict[str, set[str]] = {}
    for row in held_mechanisms():
        target = row.get("target_chembl_id")
        if not target:
            continue
        targets_direct.setdefault(row["molecule_chembl_id"], set()).add(target)
        par = row.get("parent_molecule_chembl_id") or row["molecule_chembl_id"]
        targets_by_parent.setdefault(par, set()).add(target)

    query: dict[str, set[str]] = {}
    attribution: dict[str, set[str]] = {}
    for cid in sorted(corpus):
        if cid in targets_direct:
            query.setdefault(cid, set()).update(targets_direct[cid])
            attribution.setdefault(cid, set()).add(cid)
        else:
            par = parent.get(cid)
            if par and par in targets_by_parent:
                query.setdefault(par, set()).update(targets_by_parent[par])
                attribution.setdefault(cid, set()).add(par)
    return query, attribution


def stage_documents() -> None:
    pages = paginate("document", {"only": "document_chembl_id,year"}, "documents", "document")
    print(f"documents: {pages} pages")


def stage_atc() -> None:
    pages = paginate("atc_class", {}, "atc", "atc_class")
    print(f"atc_class: {pages} pages")


def stage_molecules_topup() -> None:
    missing = sorted(set(corpus_chembl_ids()) - held_molecule_ids())
    only = "molecule_chembl_id,pref_name,max_phase,withdrawn_flag,atc_classifications,molecule_hierarchy,molecule_type,molecule_synonyms,first_approval"
    for start in range(0, len(missing), BATCH):
        chunk = missing[start : start + BATCH]
        stem = f"molecules-topup-{start // BATCH:05d}"
        out = RAW / f"{stem}-00000.json"
        if out.exists():
            continue
        paginate("molecule", {"molecule_chembl_id__in": ",".join(chunk), "only": only}, "molecules", stem)
    print(f"molecules-topup: {len(missing)} ids in {(len(missing) + BATCH - 1) // BATCH} batches")


def stage_compound_records() -> None:
    ids = corpus_chembl_ids()
    for start in range(0, len(ids), BATCH):
        chunk = ids[start : start + BATCH]
        stem = f"compound-record-{start // BATCH:05d}"
        out = RAW / f"{stem}-00000.json"
        if out.exists():
            continue
        paginate(
            "compound_record",
            {"molecule_chembl_id__in": ",".join(chunk), "only": "molecule_chembl_id,document_chembl_id"},
            "compound_records",
            stem,
        )
    print(f"compound_records: {len(ids)} ids in {(len(ids) + BATCH - 1) // BATCH} batches")


def stage_activities() -> None:
    query, _ = activity_plan()
    mols = sorted(query)
    only = (
        "molecule_chembl_id,target_chembl_id,target_pref_name,target_organism,pchembl_value,"
        "standard_type,standard_relation,standard_value,standard_units,assay_type,assay_chembl_id,"
        "assay_description,document_chembl_id,document_year,activity_id"
    )
    for start in range(0, len(mols), BATCH):
        chunk = mols[start : start + BATCH]
        targets = sorted({t for m in chunk for t in query[m]})
        stem = f"activity-{start // BATCH:05d}"
        out = RAW / f"{stem}-00000.json"
        if out.exists():
            continue
        paginate(
            "activity",
            {
                "molecule_chembl_id__in": ",".join(chunk),
                "target_chembl_id__in": ",".join(targets),
                "pchembl_value__isnull": "false",
                "only": only,
            },
            "activities",
            stem,
        )
    print(f"activities: {len(mols)} query molecules in {(len(mols) + BATCH - 1) // BATCH} batches")


STAGES = {
    "documents": stage_documents,
    "atc": stage_atc,
    "molecules-topup": stage_molecules_topup,
    "compound-records": stage_compound_records,
    "activities": stage_activities,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("stages", nargs="+", choices=sorted(STAGES) + ["all"])
    args = parser.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    names = sorted(STAGES) if "all" in args.stages else args.stages
    for name in names:
        started = time.time()
        STAGES[name]()
        print(f"  stage {name} done in {time.time() - started:.0f}s, cumulative API calls {_calls[0]}")
    print(f"API calls this run: {_calls[0]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
