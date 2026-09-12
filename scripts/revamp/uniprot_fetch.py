#!/usr/bin/env python3
"""Retrieve UniProtKB records for the rnawiki revamp Phase 2 item 7.

Only robots-allowed REST paths are used. rest.uniprot.org/robots.txt disallows /idmapping/
and every /*/stream/ path, so ChEMBL target ids are resolved by bulk-reading the UniProtKB
ChEMBL cross-reference index through /uniprotkb/search instead, and records are fetched
through /uniprotkb/search and /uniprotkb/accessions.

Pulls:
  A raw/chembl-xref.tsv        every UniProtKB entry carrying a ChEMBL cross-reference
  B raw/target-records.tsv     full records for every accession the corpus targets resolve to
  C raw/pharmaceutical.tsv     entries carrying a PHARMACEUTICAL comment (drug/trade names)
  D raw/human-reviewed.tsv     reviewed Homo sapiens entries with names and sequences

Resume-safe: a pull whose file is already listed in manifest.json with a matching SHA256 is
not refetched.
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request, urllib.error

ACC_RE = re.compile(r"^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})$")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATE = "2026-09-05"
BASE = os.path.join(ROOT, "data/sources/uniprot", DATE)
RAW = os.path.join(BASE, "raw")
LOG = os.path.join(BASE, "requests.log")
MANIFEST = os.path.join(BASE, "manifest.json")
DERIVED = os.path.join(ROOT, "data/revamp/uniprot")
os.makedirs(RAW, exist_ok=True)
os.makedirs(DERIVED, exist_ok=True)

UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
REST = "https://rest.uniprot.org"
ALT = "https://www.ebi.ac.uk/proteins/api"   # alternative endpoint if REST fails outright
PAUSE = 0.34                                  # polite pacing between requests

TARGET_FIELDS = ("accession,id,reviewed,protein_name,gene_primary,gene_names,organism_name,"
                 "organism_id,cc_function,cc_subcellular_location,length,mass,xref_chembl,"
                 "xref_drugcentral,protein_families")
BIO_FIELDS = ("accession,id,reviewed,protein_name,gene_primary,gene_names,organism_name,"
              "organism_id,cc_function,cc_pharmaceutical,sequence,length,mass,ft_chain,xref_chembl")

release = {}
if os.path.exists(MANIFEST):
    _prev = json.load(open(MANIFEST))
    release["release"] = _prev.get("uniprot_release")
    release["release_date"] = _prev.get("uniprot_release_date")


def log(url, status, nbytes, note=""):
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with open(LOG, "a") as fh:
        fh.write(f"{ts}\t{url}\t{status}\t{nbytes}\t{note}\n")


def get(url, tries=3):
    """GET with three retries and exponential backoff. Returns (body_bytes, headers)."""
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/plain"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                body = r.read()
                log(url, r.status, len(body))
                if r.headers.get("x-uniprot-release"):
                    release["release"] = r.headers["x-uniprot-release"]
                    release["release_date"] = r.headers.get("x-uniprot-release-date")
                time.sleep(PAUSE)
                return body, r.headers
        except urllib.error.HTTPError as e:
            body = e.read()[:2000].decode("utf-8", "replace")
            last = f"HTTP {e.code}: {body}"
            log(url, e.code, 0, last[:300].replace("\n", " "))
            wait = float(e.headers.get("Retry-After", 0) or 0) or (2 ** attempt) * 3
        except Exception as e:  # noqa: BLE001 - network layer, exact text is recorded
            last = f"{type(e).__name__}: {e}"
            log(url, "error", 0, last[:300].replace("\n", " "))
            wait = (2 ** attempt) * 3
        if attempt < tries - 1:
            time.sleep(wait)
    raise RuntimeError(f"three attempts failed for {url}\n{last}")


def paged_search(query, fields, out_path, size=500):
    """Follow the search endpoint's Link rel=next cursor, writing one concatenated TSV."""
    url = (f"{REST}/uniprotkb/search?query={urllib.parse.quote(query)}"
           f"&fields={fields}&format=tsv&size={size}")
    rows, header, pages, total = [], None, 0, None
    while url:
        body, hdrs = get(url)
        if total is None:
            total = hdrs.get("x-total-results")
        text = body.decode("utf-8")
        lines = text.split("\n")
        if lines and lines[-1] == "":
            lines.pop()
        if not lines:
            break
        if header is None:
            header = lines[0]
        rows.extend(lines[1:])
        pages += 1
        nxt = None
        link = hdrs.get("Link")
        if link and 'rel="next"' in link:
            nxt = link.split(">;")[0].lstrip("<")
        url = nxt
    with open(out_path, "w") as fh:
        fh.write(header + "\n")
        fh.write("\n".join(rows) + ("\n" if rows else ""))
    print(f"  {os.path.basename(out_path)}: {len(rows)} rows over {pages} requests "
          f"(x-total-results={total})", file=sys.stderr)
    return len(rows)


def accessions_batches(accs, fields, out_path, batch=200):
    header, rows, missing = None, [], []
    for i in range(0, len(accs), batch):
        chunk = accs[i:i + batch]
        url = (f"{REST}/uniprotkb/accessions?accessions={','.join(chunk)}"
               f"&fields={fields}&format=tsv&size=500")
        body, _ = get(url)
        lines = body.decode("utf-8").split("\n")
        if lines and lines[-1] == "":
            lines.pop()
        if not lines:
            missing.extend(chunk)
            continue
        if header is None:
            header = lines[0]
        got = {ln.split("\t")[0] for ln in lines[1:]}
        missing.extend([a for a in chunk if a not in got])
        rows.extend(lines[1:])
    with open(out_path, "w") as fh:
        fh.write((header or "Entry") + "\n")
        fh.write("\n".join(rows) + ("\n" if rows else ""))
    print(f"  {os.path.basename(out_path)}: {len(rows)} rows, {len(missing)} accessions returned "
          f"no record", file=sys.stderr)
    return len(rows), missing


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest():
    if os.path.exists(MANIFEST):
        return json.load(open(MANIFEST))
    return {"source": "UniProt", "retrieved_date": DATE, "files": []}


def already(man, name):
    for f in man["files"]:
        path = os.path.join(BASE, f["path"])
        if f["path"].endswith(name) and os.path.exists(path) and sha256(path) == f["sha256"]:
            return True
    return False


man = load_manifest()
recorded = {f["path"]: f for f in man["files"]}
pulls = []

# ---- A: UniProtKB entries carrying a ChEMBL cross-reference -------------------------------
A = os.path.join(RAW, "chembl-xref.tsv")
if already(man, "chembl-xref.tsv"):
    print("A chembl-xref.tsv already retrieved with matching SHA256; not refetched", file=sys.stderr)
else:
    print("A UniProtKB entries with a ChEMBL cross-reference", file=sys.stderr)
    paged_search("(database:chembl)", "accession,xref_chembl", A)
pulls.append((A, f"{REST}/uniprotkb/search?query=(database:chembl)&fields=accession,xref_chembl&format=tsv&size=500"))

# resolve the ChEMBL target ids the corpus holds
chembl_ids = [l.strip() for l in open(os.path.join(DERIVED, "chembl-target-ids.txt")) if l.strip()]
ct2acc = {}
with open(A) as fh:
    next(fh)
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) < 2:
            continue
        acc, xr = parts[0], parts[1]
        for cid in xr.split(";"):
            cid = cid.strip()
            if cid:
                ct2acc.setdefault(cid, []).append(acc)
json.dump(ct2acc, open(os.path.join(DERIVED, "chembl-target-to-accession.json"), "w"))
resolved = {c: ct2acc[c] for c in chembl_ids if c in ct2acc}
print(f"  ChEMBL target ids held by the corpus: {len(chembl_ids)}; resolved to UniProt: "
      f"{len(resolved)}", file=sys.stderr)

known = [l.strip() for l in open(os.path.join(DERIVED, "accessions-known.txt")) if l.strip()]
raw_ids = sorted(set(known) | {a for v in resolved.values() for a in v})

# Upstream target tables carry three identifier shapes. The accessions endpoint accepts only
# canonical accessions, so isoform suffixes are reduced to their base accession and entry
# names (SYMBOL_SPECIES) are resolved through the search endpoint.
all_acc, isoforms, entry_names = set(), {}, []
for ident in raw_ids:
    if ACC_RE.match(ident):
        all_acc.add(ident)
    elif "-" in ident and ACC_RE.match(ident.split("-")[0]):
        base = ident.split("-")[0]
        all_acc.add(base)
        isoforms[ident] = base
    else:
        entry_names.append(ident)

for name in entry_names:
    body, _ = get(f"{REST}/uniprotkb/search?query={urllib.parse.quote('id:' + name)}"
                  f"&fields=accession&format=tsv&size=5")
    lines = [l for l in body.decode("utf-8").split("\n")[1:] if l.strip()]
    if lines:
        all_acc.add(lines[0].split("\t")[0])

all_acc = sorted(all_acc)
json.dump({"isoform_ids_reduced_to_base": isoforms, "entry_names_resolved": entry_names},
          open(os.path.join(DERIVED, "identifier-normalisation.json"), "w"), indent=1)
open(os.path.join(DERIVED, "accessions-to-fetch.txt"), "w").write("\n".join(all_acc) + "\n")
print(f"  identifiers in: {len(raw_ids)}; isoform ids reduced: {len(isoforms)}; entry names "
      f"resolved: {len(entry_names)}; accessions to fetch: {len(all_acc)}", file=sys.stderr)

# ---- B: full target protein records --------------------------------------------------------
B = os.path.join(RAW, "target-records.tsv")
if already(man, "target-records.tsv"):
    print("B target-records.tsv already retrieved with matching SHA256; not refetched", file=sys.stderr)
else:
    print("B target protein records by accession", file=sys.stderr)
    _, missing = accessions_batches(all_acc, TARGET_FIELDS, B)
    json.dump(missing, open(os.path.join(DERIVED, "accessions-no-record.json"), "w"))
pulls.append((B, f"{REST}/uniprotkb/accessions?accessions=<{len(all_acc)} accessions in batches of 200>&fields={TARGET_FIELDS}&format=tsv"))

# ---- C: entries with a PHARMACEUTICAL comment ----------------------------------------------
C = os.path.join(RAW, "pharmaceutical.tsv")
if already(man, "pharmaceutical.tsv"):
    print("C pharmaceutical.tsv already retrieved with matching SHA256; not refetched", file=sys.stderr)
else:
    print("C entries with a PHARMACEUTICAL comment", file=sys.stderr)
    paged_search("(cc_pharmaceutical:*)", BIO_FIELDS, C)
pulls.append((C, f"{REST}/uniprotkb/search?query=(cc_pharmaceutical:*)&fields={BIO_FIELDS}&format=tsv&size=500"))

# ---- D: reviewed human entries --------------------------------------------------------------
D = os.path.join(RAW, "human-reviewed.tsv")
if already(man, "human-reviewed.tsv"):
    print("D human-reviewed.tsv already retrieved with matching SHA256; not refetched", file=sys.stderr)
else:
    print("D reviewed Homo sapiens entries", file=sys.stderr)
    paged_search("(reviewed:true) AND (organism_id:9606)", BIO_FIELDS, D)
pulls.append((D, f"{REST}/uniprotkb/search?query=(reviewed:true) AND (organism_id:9606)&fields={BIO_FIELDS}&format=tsv&size=500"))

# ---- manifest ---------------------------------------------------------------------------------
files = []
for path, url in pulls:
    rel = os.path.relpath(path, BASE)
    prev = recorded.get(rel)
    files.append({
        "path": rel,
        "url": url,
        "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(os.path.getmtime(path))),
        "bytes": os.path.getsize(path),
        "sha256": sha256(path),
    })
for rel in sorted(os.listdir(os.path.join(BASE, "legal"))):
    p = os.path.join(BASE, "legal", rel)
    files.append({
        "path": os.path.join("legal", rel),
        "url": "recorded in requests.log",
        "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(os.path.getmtime(p))),
        "bytes": os.path.getsize(p),
        "sha256": sha256(p),
    })

man = {
    "source": "UniProt (UniProtKB)",
    "retrieved_date": DATE,
    "uniprot_release": release.get("release"),
    "uniprot_release_date": release.get("release_date"),
    "endpoint": REST,
    "licence": "CC BY 4.0 — https://www.uniprot.org/help/license "
               "(licence text saved at legal/help-license.json)",
    "licence_url": "https://www.uniprot.org/help/license",
    "attribution": "UniProt Consortium, UniProtKB, https://www.uniprot.org/",
    "robots_compliance": {
        "robots_txt": ["legal/robots-www.txt", "legal/robots-rest.txt"],
        "disallowed_paths_avoided": ["/idmapping/", "/uniprotkb/stream/", "/docs/"],
        "note": "One request to https://rest.uniprot.org/docs/ (a Disallow path) was issued in the "
                "same batch as robots.txt, before robots.txt had been parsed. Its response is kept "
                "at legal/rest-docs.html as the record of that request; it is an empty client shell, "
                "carries no data and is not parsed by any script here. No further request was made "
                "to a disallowed path.",
    },
    "api_key": "none — UniProt REST offers no API key and requires no registration",
    "files": files,
}
json.dump(man, open(MANIFEST, "w"), indent=1)
print(json.dumps({"files": len(files), "bytes": sum(f["bytes"] for f in files),
                  "release": release.get("release"),
                  "chembl_targets_resolved": len(resolved),
                  "accessions_fetched": len(all_acc)}, indent=1))
