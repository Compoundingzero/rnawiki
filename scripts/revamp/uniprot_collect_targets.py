#!/usr/bin/env python3
"""Collect the corpus target universe for the UniProt ingest.

Reads whatever target-bearing files are on disk at run time:
  - data/sources/drugcentral/mapped.parquet   (UniProt accessions, own match_rule)
  - data/sources/iuphar/mapped.parquet        (UniProt accessions, own match_rule)
  - data/corpus-20k/raw/chembl/mechanism-*.json     (ChEMBL target ids)
  - data/corpus-20k/raw/open-targets/drug_mechanism_of_action/*.parquet (Ensembl gene ids)
  - data/corpus-20k/raw/open-targets/target/*.parquet  (Ensembl -> UniProt accession)

Writes:
  data/revamp/uniprot/page-target-links.parquet  key, tier, target_ref, target_ref_kind,
                                                 match_rule, form_of_target, link_source, source_record_id
  data/revamp/uniprot/chembl-target-ids.txt      distinct ChEMBL target ids needing resolution
  data/revamp/uniprot/accessions-known.txt       distinct accessions already resolved locally
  data/revamp/uniprot/biologic-pages.parquet     key, tier, displayName, names[] for biologic pages
"""
import json, glob, os, sys, re
import duckdb, pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "data/revamp/uniprot")
os.makedirs(OUT, exist_ok=True)
p = lambda *a: os.path.join(ROOT, *a)

# ---------- corpus identity ----------
tier_of, model_of = {}, {}
for line in open(p("data/corpus-20k/tiers/model-assignment.ndjson")):
    r = json.loads(line)
    model_of[r["key"]] = r["model"]
    tier_of[r["key"]] = 1 if (r["model"] == "LONGEVITY" or r.get("withdrawn")) else (2 if r["model"] == "CLINICAL" else 3)

pages = {}
by_chembl = {}
by_inchikey = {}
by_skeleton = {}
for line in open(p("data/corpus-20k/identity/canonical.ndjson")):
    r = json.loads(line)
    k = r["key"]
    st = r.get("structure") or {}
    rec = {
        "key": k, "displayName": r.get("displayName"), "unii": r.get("unii"),
        "chemblId": r.get("chemblId"), "isBiologic": bool(r.get("isBiologic")),
        "inchikey": (st or {}).get("inchikey"), "inchikey14": (st or {}).get("inchikey14"),
        "synonyms": [s.get("name") for s in (r.get("synonyms") or []) if s.get("name")],
    }
    pages[k] = rec
    if rec["chemblId"]:
        by_chembl.setdefault(rec["chemblId"], []).append(k)
    if rec["inchikey"]:
        by_inchikey.setdefault(rec["inchikey"], []).append(k)
    if rec["inchikey14"]:
        by_skeleton.setdefault(rec["inchikey14"], []).append(k)
print(f"pages={len(pages)} with_chembl={len(by_chembl)} with_inchikey={len(by_inchikey)}", file=sys.stderr)

# ---------- ChEMBL molecule structures (to grade the ChEMBL/OT page link) ----------
mol_ik = {}
for f in sorted(glob.glob(p("data/corpus-20k/raw/chembl/molecules-*.json"))):
    for m in json.load(open(f))["molecules"]:
        ms = m.get("molecule_structures") or {}
        ik = ms.get("standard_inchi_key")
        if ik:
            mol_ik[m["molecule_chembl_id"]] = ik
print(f"chembl molecules with inchikey={len(mol_ik)}", file=sys.stderr)

def grade_chembl_link(chembl_id):
    """Return (key, match_rule, form_of_target) list for a ChEMBL molecule id.

    Priority per spec: (b) full InChIKey exact, (c) skeleton -> form_of, (d) otherwise the
    corpus-held chemblId association is not structurally confirmable -> name-candidate.
    UNII (rule a) is not available on ChEMBL molecule records, so it cannot apply here.
    """
    ik = mol_ik.get(chembl_id)
    out = []
    if ik:
        if ik in by_inchikey:
            return [(k, "inchikey", None) for k in by_inchikey[ik]]
        sk = ik[:14]
        if sk in by_skeleton:
            parents = by_inchikey.get(ik, [])
            for k in by_skeleton[sk]:
                out.append((k, "skeleton", parents[0] if parents else chembl_id))
            return out
    for k in by_chembl.get(chembl_id, []):
        out.append((k, "name-candidate", None))
    return out

rows = []

def add(key, target_ref, kind, match_rule, form_of, link_source, srid):
    if key not in tier_of:
        return
    rows.append(dict(key=key, tier=tier_of[key], target_ref=target_ref, target_ref_kind=kind,
                     match_rule=match_rule, form_of_target=form_of,
                     link_source=link_source, source_record_id=srid))

con = duckdb.connect()

# ---------- DrugCentral ----------
dc = p("data/sources/drugcentral/mapped.parquet")
if os.path.exists(dc):
    df = con.execute(
        "select key, field, value, match_rule, form_of_target, source_record_id from read_parquet(?) "
        "where field in ('mechanism_targets','target_bioactivities')", [dc]).df()
    for r in df.itertuples():
        try:
            v = json.loads(r.value)
        except Exception:
            continue
        for t in (v if isinstance(v, list) else [v]):
            acc = (t or {}).get("accession")
            if not acc:
                continue
            for a in str(acc).split("|"):
                a = a.strip()
                if a:
                    add(r.key, a, "accession", r.match_rule, r.form_of_target, "drugcentral", r.source_record_id)
    print(f"drugcentral link rows so far={len(rows)}", file=sys.stderr)

# ---------- IUPHAR ----------
iu = p("data/sources/iuphar/mapped.parquet")
if os.path.exists(iu):
    df = con.execute("select key, value, match_rule, form_of_target, source_record_id from read_parquet(?)", [iu]).df()
    for r in df.itertuples():
        try:
            v = json.loads(r.value)
        except Exception:
            continue
        for t in (v if isinstance(v, list) else [v]):
            acc = (t or {}).get("targetUniProtId")
            if not acc:
                continue
            for a in re.split(r"[|,;]", str(acc)):
                a = a.strip()
                if a:
                    add(r.key, a, "accession", r.match_rule, r.form_of_target, "iuphar", r.source_record_id)
    print(f"+iuphar link rows={len(rows)}", file=sys.stderr)

# ---------- ChEMBL drug_mechanism ----------
n_mech = 0
for f in sorted(glob.glob(p("data/corpus-20k/raw/chembl/mechanism-*.json"))):
    for m in json.load(open(f))["mechanisms"]:
        tid = m.get("target_chembl_id")
        if not tid:
            continue
        n_mech += 1
        seen = set()
        for mid in (m.get("molecule_chembl_id"), m.get("parent_molecule_chembl_id")):
            if not mid:
                continue
            for key, rule, form in grade_chembl_link(mid):
                if (key, tid) in seen:
                    continue
                seen.add((key, tid))
                add(key, tid, "chembl_target", rule, form, "chembl-mechanism",
                    f"chembl:mec_id:{m.get('mec_id')}")
print(f"+chembl mechanisms={n_mech} link rows={len(rows)}", file=sys.stderr)

# ---------- Open Targets ----------
ot_t = p("data/corpus-20k/raw/open-targets/target/*.parquet")
ens2acc = {}
if glob.glob(ot_t):
    df = con.execute("select id, proteinIds from read_parquet(?)", [ot_t]).df()
    for r in df.itertuples():
        accs = []
        pids = r.proteinIds
        if pids is None or not hasattr(pids, '__iter__'):
            continue
        for pi in pids:
            d = dict(pi) if not isinstance(pi, dict) else pi
            if d.get("source") == "uniprot_swissprot":   # reviewed entry only; trembl/obsolete are not target records
                accs.append(d.get("id"))
        if accs:
            ens2acc[r.id] = accs
    print(f"open-targets ensembl->uniprot={len(ens2acc)}", file=sys.stderr)

ot_m = p("data/corpus-20k/raw/open-targets/drug_mechanism_of_action/*.parquet")
if glob.glob(ot_m):
    df = con.execute("select chemblIds, targets, actionType from read_parquet(?)", [ot_m]).df()
    for r in df.itertuples():
        cids = list(r.chemblIds) if hasattr(r.chemblIds, '__iter__') else []
        tgts = list(r.targets) if hasattr(r.targets, '__iter__') else []
        for cid in cids:
            links = grade_chembl_link(cid)
            if not links:
                continue
            for ens in tgts:
                for acc in ens2acc.get(ens, []):
                    for key, rule, form in links:
                        add(key, acc, "accession", rule, form, "open-targets", f"open-targets:{cid}:{ens}")
    print(f"+open-targets link rows={len(rows)}", file=sys.stderr)

links = pd.DataFrame(rows).drop_duplicates(subset=["key", "target_ref", "link_source"])
links.to_parquet(os.path.join(OUT, "page-target-links.parquet"), index=False)

acc = sorted(set(links.loc[links.target_ref_kind == "accession", "target_ref"]))
ctid = sorted(set(links.loc[links.target_ref_kind == "chembl_target", "target_ref"]))
open(os.path.join(OUT, "accessions-known.txt"), "w").write("\n".join(acc) + "\n")
open(os.path.join(OUT, "chembl-target-ids.txt"), "w").write("\n".join(ctid) + "\n")

bio = [dict(key=k, tier=tier_of.get(k), displayName=v["displayName"], unii=v["unii"],
            names=json.dumps([v["displayName"]] + v["synonyms"]))
       for k, v in pages.items() if v["isBiologic"] and k in tier_of]
pd.DataFrame(bio).to_parquet(os.path.join(OUT, "biologic-pages.parquet"), index=False)

print(json.dumps({
    "link_rows": int(len(links)),
    "pages_with_target_link": int(links.key.nunique()),
    "accessions_known": len(acc),
    "chembl_target_ids": len(ctid),
    "biologic_pages": len(bio),
    "by_link_source": links.link_source.value_counts().to_dict(),
    "by_match_rule": links.match_rule.value_counts().to_dict(),
}, indent=1))
