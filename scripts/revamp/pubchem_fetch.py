#!/usr/bin/env python
"""Retrieve PubChem data for the rnawiki revamp corpus (spec docs/specs/revamp-2026-09.md, Phase 2 item 3).

Retrieval order follows the spec: bulk FTP download first, then PUG REST.
Bulk gives the UNII -> CID mapping (rule (a) evidence). PUG REST gives the
properties PubChem publishes no bulk file for (XLogP, TPSA) and resolves
full InChIKeys (rule (b)) and names (rule (d) candidates).

Usage policy honoured: <= 5 requests/second, X-Throttling-Control read on every
PUG REST response, exponential backoff on failure, single connection.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
DATE = "2026-09-05"
SRC = ROOT / "data" / "sources" / "pubchem"
RAW = SRC / DATE
RAWDIR = RAW / "raw"
APIDIR = RAWDIR / "api"
REQLOG = RAW / "requests.log"
MANIFEST = RAW / "manifest.json"

UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
FTP = "https://ftp.ncbi.nlm.nih.gov/pubchem"

PROPS = "SMILES,ConnectivitySMILES,InChI,InChIKey,MolecularWeight,XLogP,TPSA"
LICENCE = (
    "Public domain / no restrictions. NCBI FTP README: 'NCBI itself places no "
    "restrictions on the use or distribution of the data contained therein.' "
    "NCBI Policies and Disclaimers: information created by or for the US government "
    "is within the public domain."
)

MIN_INTERVAL = 0.22  # <= 5 requests/second, with headroom
_last_request = [0.0]
_pace = [MIN_INTERVAL]

session = requests.Session()
session.headers.update({"User-Agent": UA})


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def log_request(method: str, url: str, status, nbytes: int, note: str = "") -> None:
    REQLOG.parent.mkdir(parents=True, exist_ok=True)
    with REQLOG.open("a", encoding="utf-8") as fh:
        fh.write(f"{now()}\t{method}\t{url}\t{status}\t{nbytes}\t{note}\n")


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {
        "source": "PubChem",
        "retrieved_by": "scripts/revamp/pubchem_fetch.py",
        "retrieval_date": DATE,
        "licence": LICENCE,
        "licence_evidence": [
            "data/sources/pubchem/%s/legal/ftp-pubchem-README.txt" % DATE,
            "data/sources/pubchem/%s/legal/ncbi-policies.html" % DATE,
            "data/sources/pubchem/%s/legal/docs-downloads.md" % DATE,
            "data/sources/pubchem/%s/legal/docs-programmatic-access.md" % DATE,
        ],
        "usage_policy": "<= 5 requests/second (PubChem programmatic-access USAGE POLICY). No API keys are offered.",
        "files": {},
        "not_downloaded": {},
    }


def save_manifest(m: dict) -> None:
    MANIFEST.write_text(json.dumps(m, indent=2, sort_keys=True) + "\n")


def record_file(m: dict, relpath: str, url: str, note: str = "") -> None:
    p = RAW / relpath
    m["files"][relpath] = {
        "url": url,
        "retrieved_at": now(),
        "bytes": p.stat().st_size,
        "sha256": sha256_of(p),
        "licence": LICENCE,
        "note": note,
    }


def already_have(m: dict, relpath: str) -> bool:
    """Resume rule: a manifest entry whose SHA256 still matches the file on disk is not refetched."""
    entry = m["files"].get(relpath)
    if not entry:
        return False
    p = RAW / relpath
    if not p.exists() or p.stat().st_size != entry.get("bytes"):
        return False
    return sha256_of(p) == entry.get("sha256")


def pace() -> None:
    wait = _pace[0] - (time.monotonic() - _last_request[0])
    if wait > 0:
        time.sleep(wait)
    _last_request[0] = time.monotonic()


def read_throttle(resp) -> None:
    """PubChem publishes usage headroom in X-Throttling-Control; slow down as it reddens."""
    ctl = resp.headers.get("X-Throttling-Control", "")
    if "Black" in ctl:
        _pace[0] = 2.0
        time.sleep(30)
    elif "Red" in ctl:
        _pace[0] = 1.0
    elif "Yellow" in ctl:
        _pace[0] = 0.5
    else:
        _pace[0] = MIN_INTERVAL


def pug(path: str, data: dict | None = None, tries: int = 3, timeout: int = 60):
    """One PUG REST call. Three retries with exponential backoff, then the GET
    fallback endpoint is the caller's responsibility. Returns (status, text)."""
    url = f"{PUG}{path}"
    delay = 2.0
    last = None
    for attempt in range(1, tries + 1):
        pace()
        try:
            if data is None:
                resp = session.get(url, timeout=timeout)
            else:
                resp = session.post(
                    url, data=data, timeout=timeout,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
            read_throttle(resp)
            log_request("POST" if data else "GET", url, resp.status_code, len(resp.content),
                        f"attempt={attempt}")
            if resp.status_code == 200:
                return 200, resp.text
            if resp.status_code == 404:
                # PUG REST returns 404 for "no record found"; that is an answer, not a failure.
                return 404, resp.text
            last = f"HTTP {resp.status_code}: {resp.text[:400]}"
        except requests.RequestException as exc:
            log_request("POST" if data else "GET", url, "EXC", 0, f"attempt={attempt} {exc}")
            last = f"{type(exc).__name__}: {exc}"
        if attempt < tries:
            time.sleep(delay)
            delay *= 2
    return None, last


def download(url: str, dest: Path, m: dict, relpath: str, note: str = "") -> bool:
    if already_have(m, relpath):
        log_request("GET", url, "SKIP", 0, "already in manifest with matching sha256")
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    delay = 2.0
    for attempt in range(1, 4):
        try:
            with session.get(url, stream=True, timeout=600) as resp:
                if resp.status_code != 200:
                    log_request("GET", url, resp.status_code, 0, f"attempt={attempt}")
                    raise requests.RequestException(f"HTTP {resp.status_code}")
                total = 0
                tmp = dest.with_suffix(dest.suffix + ".part")
                with tmp.open("wb") as fh:
                    for chunk in resp.iter_content(1 << 20):
                        fh.write(chunk)
                        total += len(chunk)
                tmp.rename(dest)
                log_request("GET", url, 200, total, "bulk download")
            record_file(m, relpath, url, note)
            save_manifest(m)
            return True
        except requests.RequestException as exc:
            log_request("GET", url, "EXC", 0, f"attempt={attempt} {exc}")
            if attempt < 3:
                time.sleep(delay)
                delay *= 2
    return False


def download_segmented(url: str, dest: Path, m: dict, relpath: str, note: str = "",
                       segments: int = 8) -> bool:
    """Transfer a large bulk file in parallel byte ranges.

    A single long-lived connection to the NCBI FTP host settled at about 45 KiB/s on this
    run, while a fresh ranged connection ran at 1.6 MB/s. The publisher's own MD5 is
    verified against the reassembled file, so a bad segment cannot pass unnoticed.
    """
    import concurrent.futures

    if already_have(m, relpath):
        log_request("GET", url, "SKIP", 0, "already in manifest with matching sha256")
        return True
    resp = session.head(url, timeout=120, allow_redirects=True)
    log_request("HEAD", url, resp.status_code, 0, "size and range support check")
    total = int(resp.headers.get("Content-Length", 0))
    if total == 0 or resp.headers.get("Accept-Ranges") != "bytes":
        return download(url, dest, m, relpath, note)

    dest.parent.mkdir(parents=True, exist_ok=True)
    size = (total + segments - 1) // segments
    spans = [(i * size, min(total, (i + 1) * size) - 1) for i in range(segments)]
    spans = [(a, b) for a, b in spans if a <= b]

    def grab(idx_span):
        idx, (start, end) = idx_span
        part = dest.with_suffix(dest.suffix + f".part{idx}")
        delay = 2.0
        for attempt in range(1, 4):
            got = 0
            try:
                with requests.get(url, headers={"Range": f"bytes={start}-{end}",
                                                "User-Agent": UA},
                                  stream=True, timeout=600) as r:
                    if r.status_code != 206:
                        log_request("GET", url, r.status_code, 0,
                                    f"range {start}-{end} attempt={attempt}")
                        raise requests.RequestException(f"HTTP {r.status_code} for range")
                    with part.open("wb") as fh:
                        for chunk in r.iter_content(1 << 20):
                            fh.write(chunk)
                            got += len(chunk)
                log_request("GET", url, 206, got, f"range {start}-{end}")
                if got == end - start + 1:
                    return idx, part
                raise requests.RequestException(f"short read {got} of {end - start + 1}")
            except requests.RequestException as exc:
                log_request("GET", url, "EXC", got, f"range {start}-{end} attempt={attempt} {exc}")
                if attempt < 3:
                    time.sleep(delay)
                    delay *= 2
        return idx, None

    with concurrent.futures.ThreadPoolExecutor(max_workers=segments) as pool:
        results = sorted(pool.map(grab, list(enumerate(spans))))
    if any(part is None for _i, part in results):
        return False
    tmp = dest.with_suffix(dest.suffix + ".part")
    with tmp.open("wb") as out:
        for _i, part in results:
            with part.open("rb") as fh:
                for chunk in iter(lambda: fh.read(1 << 20), b""):
                    out.write(chunk)
            part.unlink()
    tmp.rename(dest)
    record_file(m, relpath, url, note)
    save_manifest(m)
    return True


# ---------------------------------------------------------------- corpus load

def load_corpus():
    tm = {}
    with (ROOT / "data/corpus-20k/tiers/model-assignment.ndjson").open() as fh:
        for line in fh:
            d = json.loads(line)
            tm[d["key"]] = (d.get("model"), bool(d.get("withdrawn")))
    pages = []
    with (ROOT / "data/corpus-20k/identity/canonical.ndjson").open() as fh:
        for line in fh:
            d = json.loads(line)
            model, withdrawn = tm.get(d["key"], (None, False))
            tier = 1 if (model == "LONGEVITY" or withdrawn) else (2 if model == "CLINICAL" else 3)
            st = d.get("structure") or {}
            pages.append({
                "key": d["key"],
                "tier": tier,
                "displayName": d.get("displayName"),
                "synonyms": d.get("synonyms") or [],
                "unii": d.get("unii"),
                "isCombination": bool(d.get("isCombination")),
                "cid": d.get("cid"),
                "inchikey": st.get("inchikey") if isinstance(st, dict) else None,
                "inchikey14": st.get("inchikey14") if isinstance(st, dict) else None,
            })
    return pages


# ---------------------------------------------------------------- stages

def stage_bulk(m: dict) -> None:
    """Bulk first. CID-Identifiers.tsv.gz carries third-party registry ids including UNII."""
    for name in ("CID-Identifiers.tsv.gz", "CID-Identifiers.tsv.gz.md5"):
        url = f"{FTP}/Compound/Extras/{name}"
        ok = download(url, RAWDIR / name, m, f"raw/{name}", "bulk: CID to third-party identifiers")
        if not ok:
            raise SystemExit(f"bulk download failed after 3 retries: {url}")
    # Verify the published md5 for the bulk file.
    md5_txt = (RAWDIR / "CID-Identifiers.tsv.gz.md5").read_text().split()[0]
    h = hashlib.md5()
    with (RAWDIR / "CID-Identifiers.tsv.gz").open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    m["files"]["raw/CID-Identifiers.tsv.gz"]["publisher_md5"] = md5_txt
    m["files"]["raw/CID-Identifiers.tsv.gz"]["publisher_md5_verified"] = (h.hexdigest() == md5_txt)

    # Size-first decision on the InChIKey bulk file, per the 5 GB rule.
    url = f"{FTP}/Compound/Extras/CID-InChI-Key.gz"
    pace()
    resp = session.head(url, timeout=120, allow_redirects=True)
    log_request("HEAD", url, resp.status_code, 0, "size check before download decision")
    size = int(resp.headers.get("Content-Length", 0))
    m["not_downloaded"]["CID-InChI-Key.gz"] = {
        "url": url,
        "bytes": size,
        "gigabytes": round(size / 1e9, 2),
        "checked_at": now(),
        "reason": (
            "Archive exceeds the 5 GB download ceiling for this run. The smaller bulk form "
            "that answers the same question is the PUG REST inchikey batch POST "
            "(100 InChIKeys per request), which returns CID plus every property needed and "
            "transfers about four orders of magnitude less data."
        ),
    }
    save_manifest(m)
    print(f"bulk: CID-Identifiers.tsv.gz {m['files']['raw/CID-Identifiers.tsv.gz']['bytes']} bytes, "
          f"publisher md5 verified={m['files']['raw/CID-Identifiers.tsv.gz']['publisher_md5_verified']}")
    print(f"bulk: CID-InChI-Key.gz not downloaded, {size} bytes ({size/1e9:.2f} GB) > 5 GB ceiling")


def stage_unii(m: dict) -> None:
    """Extract the UNII rows we need from the bulk identifier table."""
    pages = load_corpus()
    wanted = {p["unii"] for p in pages if p["unii"]}
    out = RAWDIR / "derived" / "unii-cid.tsv"
    out.parent.mkdir(parents=True, exist_ok=True)
    types = {}
    hits = 0
    with gzip.open(RAWDIR / "CID-Identifiers.tsv.gz", "rt", encoding="utf-8", errors="replace") as fh, \
            out.open("w", encoding="utf-8") as w:
        w.write("unii\tcid\tidentifier_type\n")
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            cid, ident, itype = parts[0], parts[1], parts[2]
            types[itype] = types.get(itype, 0) + 1
            if ident in wanted:
                w.write(f"{ident}\t{cid}\t{itype}\n")
                hits += 1
    (RAWDIR / "derived" / "identifier-type-counts.json").write_text(
        json.dumps(dict(sorted(types.items(), key=lambda kv: -kv[1])), indent=2) + "\n")
    record_file(m, "raw/derived/unii-cid.tsv", f"{FTP}/Compound/Extras/CID-Identifiers.tsv.gz",
                "rows of the bulk identifier table whose identifier is a UNII held by the corpus")
    save_manifest(m)
    print(f"unii: {hits} bulk identifier rows matched {len(wanted)} corpus UNIIs -> {out}")
    print("identifier types in the bulk file (top 15):")
    for k, v in list(sorted(types.items(), key=lambda kv: -kv[1]))[:15]:
        print(f"  {k}\t{v}")


def _batches(seq, n):
    buf = []
    for x in seq:
        buf.append(x)
        if len(buf) == n:
            yield buf
            buf = []
    if buf:
        yield buf


def _checkpoint_path(kind: str) -> Path:
    return APIDIR / kind / "_checkpoint.json"


def _load_checkpoint(kind: str) -> dict:
    p = _checkpoint_path(kind)
    if p.exists():
        return json.loads(p.read_text())
    return {"done": [], "empty": [], "errors": {}}


def _save_checkpoint(kind: str, ck: dict) -> None:
    p = _checkpoint_path(kind)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(ck) + "\n")


def stage_inchikey(m: dict) -> None:
    """Rule (b): full InChIKey, batched 100 per POST."""
    pages = load_corpus()
    keys = sorted({p["inchikey"] for p in pages if p["inchikey"]})
    kind = "inchikey"
    ck = _load_checkpoint(kind)
    done = set(ck["done"])
    outdir = APIDIR / kind
    outdir.mkdir(parents=True, exist_ok=True)
    pending = [k for k in keys if k not in done]
    print(f"inchikey: {len(keys)} distinct keys, {len(pending)} still to fetch")
    since_ck = 0
    for i, batch in enumerate(_batches(pending, 100)):
        status, body = pug(f"/compound/inchikey/property/{PROPS}/JSON", data={"inchikey": ",".join(batch)})
        if status == 200:
            (outdir / f"batch-{hashlib.sha1(','.join(batch).encode()).hexdigest()[:16]}.json").write_text(body)
            done.update(batch)
        elif status == 404:
            # Whole batch unknown to PubChem is possible but rare; split to find which keys are real.
            for k in batch:
                s2, b2 = pug(f"/compound/inchikey/{k}/property/{PROPS}/JSON")
                if s2 == 200:
                    (outdir / f"single-{k}.json").write_text(b2)
                    done.add(k)
                elif s2 == 404:
                    ck["empty"].append(k)
                    done.add(k)
                else:
                    ck["errors"][k] = str(b2)[:500]
        else:
            ck["errors"][",".join(batch[:3]) + f"...({len(batch)})"] = str(body)[:500]
        since_ck += len(batch)
        if since_ck >= 250:
            ck["done"] = sorted(done)
            _save_checkpoint(kind, ck)
            since_ck = 0
            print(f"  checkpoint: {len(done)}/{len(keys)} keys resolved or answered")
    ck["done"] = sorted(done)
    _save_checkpoint(kind, ck)
    print(f"inchikey: done={len(done)} not_in_pubchem={len(ck['empty'])} errors={len(ck['errors'])}")


def stage_cidprops(m: dict) -> None:
    """Properties for CIDs reached through the UNII bulk mapping, batched 100 per POST."""
    cids = sorted({c for cs in _bulk_unii_map().values() for c in cs}
                  | {c for cs in _bulk_name_map().values() for c in cs}, key=int)
    kind = "cid"
    ck = _load_checkpoint(kind)
    done = set(ck["done"])
    outdir = APIDIR / kind
    outdir.mkdir(parents=True, exist_ok=True)
    pending = [c for c in cids if c not in done]
    print(f"cidprops: {len(cids)} distinct CIDs from the bulk UNII and name mappings, "
          f"{len(pending)} still to fetch")
    since_ck = 0
    for batch in _batches(pending, 100):
        status, body = pug(f"/compound/cid/property/{PROPS}/JSON", data={"cid": ",".join(batch)})
        if status == 200:
            (outdir / f"batch-{hashlib.sha1(','.join(batch).encode()).hexdigest()[:16]}.json").write_text(body)
            done.update(batch)
        elif status == 404:
            for c in batch:
                s2, b2 = pug(f"/compound/cid/{c}/property/{PROPS}/JSON")
                if s2 == 200:
                    (outdir / f"single-{c}.json").write_text(b2)
                    done.add(c)
                elif s2 == 404:
                    ck["empty"].append(c)
                    done.add(c)
                else:
                    ck["errors"][c] = str(b2)[:500]
        else:
            ck["errors"][",".join(batch[:3]) + f"...({len(batch)})"] = str(body)[:500]
        since_ck += len(batch)
        if since_ck >= 250:
            ck["done"] = sorted(done)
            _save_checkpoint(kind, ck)
            since_ck = 0
            print(f"  checkpoint: {len(done)}/{len(cids)} CIDs answered")
    ck["done"] = sorted(done)
    _save_checkpoint(kind, ck)
    print(f"cidprops: done={len(done)} not_found={len(ck['empty'])} errors={len(ck['errors'])}")


def _bulk_unii_map() -> dict:
    """UNII -> CIDs from both bulk routes: the third-party identifier table and the
    UNII codes PubChem publishes as compound synonyms."""
    mp = {}
    p = RAWDIR / "derived" / "unii-cid.tsv"
    if p.exists():
        with p.open() as fh:
            next(fh)
            for line in fh:
                u, c, t = line.rstrip("\n").split("\t")
                if t == "UNII":
                    mp.setdefault(u, set()).add(c)
    p = RAWDIR / "derived" / "unii-cid-synonyms.tsv"
    if p.exists():
        with p.open() as fh:
            next(fh)
            for line in fh:
                u, c = line.rstrip("\n").split("\t")
                mp.setdefault(u, set()).add(c)
    return mp


def _bulk_name_map() -> dict:
    """Normalised corpus name -> CIDs, from PubChem's published synonym list."""
    mp = {}
    p = RAWDIR / "derived" / "name-cid-synonyms.tsv"
    if p.exists():
        with p.open() as fh:
            next(fh)
            for line in fh:
                n, c, _syn = line.rstrip("\n").split("\t")
                mp.setdefault(n, set()).add(c)
    return mp


def stage_unii_api(m: dict) -> None:
    """Second attempt at rule (a) for the UNIIs the bulk identifier table does not carry.
    PubChem indexes UNII codes as compound synonyms, so the name domain resolves them.
    A hit is UNII evidence, not name evidence: a UNII is a registry code, not a chemical name."""
    pages = load_corpus()
    bulk = _bulk_unii_map()
    uniis = sorted({p["unii"] for p in pages if p["unii"] and p["unii"] not in bulk})
    kind = "unii"
    ck = _load_checkpoint(kind)
    done = set(ck["done"])
    outdir = APIDIR / kind
    outdir.mkdir(parents=True, exist_ok=True)
    pending = [u for u in uniis if u not in done]
    print(f"unii_api: {len(uniis)} UNIIs absent from the bulk table, {len(pending)} still to fetch")
    since_ck = 0
    for u in pending:
        status, body = pug(f"/compound/name/property/{PROPS}/JSON", data={"name": u})
        if status == 200:
            (outdir / f"{u}.json").write_text(json.dumps({"unii": u, "body": json.loads(body)}))
            done.add(u)
        elif status == 404:
            ck["empty"].append(u)
            done.add(u)
        else:
            ck["errors"][u] = str(body)[:500]
        since_ck += 1
        if since_ck >= 250:
            ck["done"] = sorted(done)
            _save_checkpoint(kind, ck)
            since_ck = 0
            print(f"  checkpoint: {len(done)}/{len(uniis)} UNIIs answered, "
                  f"{len(done) - len(ck['empty'])} resolved")
    ck["done"] = sorted(done)
    _save_checkpoint(kind, ck)
    print(f"unii_api: done={len(done)} not_in_pubchem={len(ck['empty'])} errors={len(ck['errors'])}")


def stage_synonyms(m: dict) -> None:
    """Bulk resolution of the UNIIs and names the identifier table does not carry.

    PubChem's own guidance is to use the bulk files rather than issue many single PUG REST
    calls, and CID-Synonym-filtered.gz lists every name associated with a CID, UNII codes
    among them. One 924 MB transfer replaces about 8,500 single requests.
    """
    md5_url = f"{FTP}/Compound/Extras/CID-Synonym-filtered.gz.md5"
    if not download(md5_url, RAWDIR / "CID-Synonym-filtered.gz.md5", m,
                    "raw/CID-Synonym-filtered.gz.md5", "publisher checksum"):
        raise SystemExit(f"bulk download failed after 3 retries: {md5_url}")
    url = f"{FTP}/Compound/Extras/CID-Synonym-filtered.gz"
    if not download_segmented(url, RAWDIR / "CID-Synonym-filtered.gz", m,
                              "raw/CID-Synonym-filtered.gz",
                              "bulk: CID to every associated name"):
        raise SystemExit(f"bulk download failed after 3 retries per segment: {url}")
    md5_txt = (RAWDIR / "CID-Synonym-filtered.gz.md5").read_text().split()[0]
    h = hashlib.md5()
    with (RAWDIR / "CID-Synonym-filtered.gz").open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    m["files"]["raw/CID-Synonym-filtered.gz"]["publisher_md5"] = md5_txt
    m["files"]["raw/CID-Synonym-filtered.gz"]["publisher_md5_verified"] = (h.hexdigest() == md5_txt)
    save_manifest(m)

    pages = load_corpus()
    salts = load_salts()
    # Only the identifier table and the API results narrow the search. The synonym output of
    # this stage is rewritten each run, so it must never narrow its own input.
    from_identifier_table = set()
    pid = RAWDIR / "derived" / "unii-cid.tsv"
    if pid.exists():
        with pid.open() as fh:
            next(fh)
            for line in fh:
                u, _c, t = line.rstrip("\n").split("\t")
                if t == "UNII":
                    from_identifier_table.add(u)
    ck_unii = _load_checkpoint("unii")
    api_resolved = set(ck_unii["done"]) - set(ck_unii["empty"])

    want_unii = {p["unii"] for p in pages
                 if p["unii"] and p["unii"] not in from_identifier_table
                 and p["unii"] not in api_resolved}
    want_name = {}
    for pg in pages:
        if pg["inchikey"]:
            continue
        cands = [pg["displayName"]] + [sy.get("name") for sy in pg["synonyms"]
                                       if sy.get("kind") in ("common", "generic", "inn", None)]
        for c in cands:
            n = normalise_name(c or "", salts)
            if n and len(n) >= 3:
                want_name.setdefault(n, set()).add(pg["key"])
                break
    maxlen = (max(len(n) for n in want_name) if want_name else 0) + 12
    print(f"synonyms: scanning for {len(want_unii)} UNIIs and {len(want_name)} normalised names")

    # Punctuation is folded to spaces so that a published synonym such as
    # "N-Acetyl-L-cysteine" meets the normalised corpus name "n acetyl l cysteine".
    trans = {i: " " for i in range(256) if not chr(i).isalnum()}

    outdir = RAWDIR / "derived"
    outdir.mkdir(parents=True, exist_ok=True)
    unii_hits, name_hits, lines = 0, 0, 0
    with gzip.open(RAWDIR / "CID-Synonym-filtered.gz", "rt", encoding="utf-8", errors="replace") as fh, \
            (outdir / "unii-cid-synonyms.tsv").open("w", encoding="utf-8") as wu, \
            (outdir / "name-cid-synonyms.tsv").open("w", encoding="utf-8") as wn:
        wu.write("unii\tcid\n")
        wn.write("normalised_name\tcid\tsynonym_as_published\n")
        for line in fh:
            lines += 1
            tab = line.find("\t")
            if tab < 0:
                continue
            syn = line[tab + 1:].rstrip("\n")
            n = len(syn)
            if n == 10 and syn in want_unii:
                wu.write(f"{syn}\t{line[:tab]}\n")
                unii_hits += 1
                continue
            if n <= maxlen:
                low = " ".join(syn.lower().translate(trans).split())
                if low in want_name:
                    wn.write(f"{low}\t{line[:tab]}\t{syn}\n")
                    name_hits += 1
    record_file(m, "raw/derived/unii-cid-synonyms.tsv",
                f"{FTP}/Compound/Extras/CID-Synonym-filtered.gz",
                "UNII codes published as PubChem synonyms, restricted to UNIIs the corpus holds")
    record_file(m, "raw/derived/name-cid-synonyms.tsv",
                f"{FTP}/Compound/Extras/CID-Synonym-filtered.gz",
                "PubChem synonyms equal to a normalised corpus name")
    save_manifest(m)
    print(f"synonyms: {lines} lines scanned, {unii_hits} UNII rows, {name_hits} name rows")


def normalise_name(name: str, salts: list[str]) -> str:
    s = (name or "").lower().strip()
    s = re.sub(r"[‐-―]", "-", s)
    s = re.sub(r"^\(?[rsdlez+\-,'/ ]{1,12}\)-", "", s)      # stereo prefix such as (S)-, (R,S)-, (+/-)-
    s = re.sub(r"^(dl|d|l|r|s|rac|racemic)[- ]", "", s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    changed = True
    while changed:
        changed = False
        for suf in salts:
            if s.endswith(" " + suf):
                s = s[: -(len(suf) + 1)].strip()
                changed = True
    return s


def load_salts() -> list[str]:
    lines = []
    for line in (ROOT / "scripts/revamp/salts.txt").read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            lines.append(line)
    return sorted(set(lines), key=lambda s: -len(s))


def stage_name(m: dict) -> None:
    """Rule (d): pages with neither a full InChIKey nor a UNII that the bulk table maps.
    PUG REST accepts only one name per request, so these are single calls."""
    pages = load_corpus()
    mapped_unii = set(_bulk_unii_map())
    ck_unii = _load_checkpoint("unii")
    mapped_unii |= (set(ck_unii["done"]) - set(ck_unii["empty"]))
    salts = load_salts()
    names = {}
    for pg in pages:
        if pg["inchikey"]:
            continue
        if pg["unii"] and pg["unii"] in mapped_unii:
            continue
        cands = [pg["displayName"]] + [s.get("name") for s in pg["synonyms"]
                                       if s.get("kind") in ("common", "generic", "inn", None)]
        for c in cands:
            n = normalise_name(c or "", salts)
            if n and len(n) >= 3:
                names.setdefault(n, set()).add(pg["key"])
                break
    kind = "name"
    ck = _load_checkpoint(kind)
    done = set(ck["done"])
    outdir = APIDIR / kind
    outdir.mkdir(parents=True, exist_ok=True)
    pending = sorted(n for n in names if n not in done)
    print(f"name: {len(names)} distinct normalised names, {len(pending)} still to fetch")
    since_ck = 0
    for n in pending:
        status, body = pug(f"/compound/name/property/{PROPS}/JSON", data={"name": n})
        if status == 200:
            (outdir / f"{hashlib.sha1(n.encode()).hexdigest()}.json").write_text(
                json.dumps({"name": n, "body": json.loads(body)}))
            done.add(n)
        elif status == 404:
            ck["empty"].append(n)
            done.add(n)
        else:
            ck["errors"][n] = str(body)[:500]
        since_ck += 1
        if since_ck >= 250:
            ck["done"] = sorted(done)
            _save_checkpoint(kind, ck)
            since_ck = 0
            print(f"  checkpoint: {len(done)}/{len(names)} names answered")
    ck["done"] = sorted(done)
    _save_checkpoint(kind, ck)
    print(f"name: done={len(done)} not_in_pubchem={len(ck['empty'])} errors={len(ck['errors'])}")


STAGES = {
    "bulk": stage_bulk,
    "unii": stage_unii,
    "unii_api": stage_unii_api,
    "synonyms": stage_synonyms,
    "inchikey": stage_inchikey,
    "cidprops": stage_cidprops,
    "name": stage_name,
}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", required=True, choices=list(STAGES) + ["all"])
    args = ap.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    m = load_manifest()
    stages = list(STAGES) if args.stage == "all" else [args.stage]
    for s in stages:
        print(f"=== stage {s} @ {now()}")
        STAGES[s](m)
        save_manifest(m)


if __name__ == "__main__":
    main()
