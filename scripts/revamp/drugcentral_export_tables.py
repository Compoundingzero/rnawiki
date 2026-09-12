#!/usr/bin/env python
"""Export the DrugCentral tables named in the revamp spec from the public
read-only PostgreSQL instance that drugcentral.org publishes on its Download
page, as per-table CSV under the dated raw pull.

The instance serves the same release as the bulk dump (dbversion 54,
2023-11-01); the version row is exported alongside so the two can be compared.
Credentials are the public ones printed on the DrugCentral download page and
are read from scripts/revamp/.drugcentral-public-credentials (not committed).
Each export is retried three times with exponential backoff.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

REPO = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
BASE = os.path.join(REPO, "data/sources/drugcentral/2026-09-05")
RAW = os.path.join(BASE, "raw")
LOG = os.path.join(BASE, "requests.log")
MANIFEST = os.path.join(BASE, "manifest.json")
CRED = os.path.join(REPO, "scripts/revamp/.drugcentral-public-credentials")
LICENCE = "CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/legalcode)"

QUERIES = {
    "dbversion": "select version, dtime from public.dbversion",
    "structures": (
        "select id, name, cas_reg_no, inchi, inchikey, smiles, cd_formula, "
        "cd_molweight, clogp, alogs, tpsa, lipinski, stem, mrdef, status, "
        "no_formulations, fda_labels from public.structures"
    ),
    "identifier": "select id, identifier, id_type, struct_id, parent_match from public.identifier",
    "synonyms": "select syn_id, id, name, preferred_name, parent_id, lname from public.synonyms",
    "omop_relationship": (
        "select id, struct_id, concept_id, relationship_name, concept_name, umls_cui, "
        "snomed_full_name, cui_semantic_type, snomed_conceptid from public.omop_relationship"
    ),
    "act_table_full": (
        "select act_id, struct_id, target_id, target_name, target_class, accession, gene, "
        "swissprot, act_value, act_unit, act_type, act_comment, act_source, relation, moa, "
        "moa_source, act_source_url, moa_source_url, action_type, first_in_class, tdl, "
        "act_ref_id, moa_ref_id, organism from public.act_table_full"
    ),
    "pharma_class": "select id, struct_id, type, name, class_code, source from public.pharma_class",
    "approval": "select id, struct_id, approval, type, applicant, orphan from public.approval",
    "approval_type": "select id, descr from public.approval_type",
    "faers": (
        "select id, struct_id, meddra_name, meddra_code, level, llr, llr_threshold, "
        "drug_ae, drug_no_ae, no_drug_ae, no_drug_no_ae from public.faers"
    ),
    "parentmol": (
        "select cd_id, name, cas_reg_no, inchi, nostereo_inchi, smiles, inchikey "
        "from public.parentmol"
    ),
    "struct2parent": "select struct_id, parent_id from public.struct2parent",
    "atc": "select id, code, chemical_substance, l1_code, l1_name, l2_code, l2_name, "
           "l3_code, l3_name, l4_code, l4_name, chemical_substance_count from public.atc",
    "struct2atc": "select struct_id, id, atc_code from public.struct2atc",
}


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(target: str, status, nbytes: int, note: str = "") -> None:
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{now()}\t{target}\t{status}\t{nbytes}\t{note}\n")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    if os.path.exists(MANIFEST):
        with open(MANIFEST, encoding="utf-8") as fh:
            return json.load(fh)
    return {"source": "DrugCentral", "files": {}}


def save_manifest(man: dict) -> None:
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(man, fh, indent=2, sort_keys=True)
        fh.write("\n")


def credentials() -> dict:
    with open(CRED, encoding="utf-8") as fh:
        return json.load(fh)


def export(table: str, query: str, cred: dict) -> dict:
    rel = f"raw/tables/{table}.csv"
    out = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    man = load_manifest()
    prior = man["files"].get(rel)
    if prior and os.path.exists(out) and sha256_of(out) == prior.get("sha256"):
        log(f"pg:{table}", "cached", os.path.getsize(out), "manifest sha256 match, not re-exported")
        return prior

    env = dict(os.environ, PGPASSWORD=cred["password"])
    url = f"postgresql://{cred['host']}:{cred['port']}/{cred['database']}"
    cmd = [
        "psql", "-h", cred["host"], "-p", str(cred["port"]), "-U", cred["user"],
        "-d", cred["database"], "-X", "-q", "-v", "ON_ERROR_STOP=1",
        "-c", f"\\copy ({query}) to '{out}' with (format csv, header true)",
    ]
    last_err = None
    for attempt in range(3):
        if attempt:
            time.sleep(2 ** attempt)
        proc = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=3600)
        if proc.returncode == 0:
            nbytes = os.path.getsize(out)
            with open(out, encoding="utf-8", errors="replace") as fh:
                rows = sum(1 for _ in fh) - 1
            log(f"{url}#{table}", "OK", nbytes, f"attempt={attempt + 1} rows={rows}")
            entry = {
                "url": f"{url} (public read-only instance published on https://drugcentral.org/download)",
                "table": table,
                "query": query,
                "retrieved_utc": now(),
                "bytes": nbytes,
                "rows": rows,
                "sha256": sha256_of(out),
                "licence": LICENCE,
            }
            man = load_manifest()
            man["files"][rel] = entry
            save_manifest(man)
            return entry
        last_err = (proc.stderr or proc.stdout).strip()
        log(f"{url}#{table}", "ERROR", 0, f"attempt={attempt + 1} {last_err[:400]}")
    raise RuntimeError(f"three attempts failed exporting {table}: {last_err}")


if __name__ == "__main__":
    cred = credentials()
    wanted = sys.argv[1:] or list(QUERIES)
    summary = {}
    for table in wanted:
        entry = export(table, QUERIES[table], cred)
        summary[table] = {"rows": entry.get("rows"), "bytes": entry["bytes"]}
    print(json.dumps(summary, indent=2))
