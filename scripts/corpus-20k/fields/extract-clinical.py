#!/usr/bin/env python
"""Phase 2 step `clinical-fields` — fill the nine CLINICAL fields of docs/specs/field-models.md.

Scope: every page whose model is CLINICAL in data/corpus-20k/tiers/model-assignment.ndjson.

Editorial rules enforced here:
  - Every present value is verbatim from a source that stated it, with that source's identifier,
    the source record's own date (R9) and today's verification date.
  - No number is computed that a source does not state. Registry phase/status counts and Open
    Targets spontaneous-report counts are copied from the aggregate/table that publishes them.
  - `absent` means every mapped source for that field was consulted and stated nothing.
  - `not-applicable` is used under exactly one stated rule (NA-LABEL-CLASS, below).
  - No network access: every source is read from disk or from the read-only working database.

Sources, and the limit each one imposes:
  - openFDA/DailyMed label archive (label-sections-index.json + label-index.ndjson): the only
    source of indication, label kinetics, interaction and adverse-reaction prose. A page with no
    single-substance label in that archive gets nothing from it.
  - The working database's `drugs.recorded_background` (existing pages only): a previously
    extracted, label-sourced fallback. Its inner FDA_LABEL source and retrievedAt are carried
    through, so the citation still names the label, not RNAWiki.
  - Open Targets 26.06 `openfda_significant_adverse_drug_reactions` (keyed on ChEMBL id only):
    spontaneous FAERS report counts. A page with no ChEMBL id can hold no FAERS row.
  - ClinicalTrials.gov snapshot aggregates (data/corpus-20k/registry/aggregates): trial counts by
    phase and status, and stopped studies with the registry's own whyStopped.
  - `source_search_records` PUBMED_ESEARCH_CLINICAL_TRIAL result_count: stored for existing pages
    only; no new PubMed call is made in this scope.
  - Drugs@FDA, Orange Book, EMA Medicine.csv, Health Canada DPD, openFDA NDC dea_schedule (via the
    suppression assignments, which already read it) and openFDA drug enforcement: register facts
    for regulatory status and withdrawal. TGA, PMDA and any UK or Singapore register were never
    cleared, so AU, JP, UK and SG stay `unknown` with that reason recorded.

  npx-free: .venv-corpus/bin/python scripts/corpus-20k/fields/extract-clinical.py
"""

from __future__ import annotations

import csv
import glob
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
D = lambda *p: os.path.join(ROOT, *p)
I = lambda *p: os.path.join(INGEST, *p)
OUT_DIR = os.environ.get("CLINICAL_OUT_DIR") or D("data", "corpus-20k", "fields", "clinical")
os.makedirs(OUT_DIR, exist_ok=True)
# Phase 2b: extract only the keys listed in this file (one per line). Every join is still built over
# the whole CLINICAL scope, so a restricted run produces exactly the lines a full run would.
ONLY_KEYS_FILE = os.environ.get("CLINICAL_ONLY_KEYS")

TODAY = date.today().isoformat()
BATCH_SIZE = 250
DB_URL = "postgresql://admin@localhost:5432/rnawiki_corpus_completion"
PSQL = "/opt/homebrew/opt/postgresql@18/bin/psql"

# Source dates (R9): the source record's own date where it has one, else the archive/export date.
DATE_OPEN_TARGETS = "2026-06-24"      # Open Targets Platform 26.06 build date (raw/open-targets/README.md)
DATE_CHEMBL = "2026-09-04"            # ChEMBL 37 export fetched on this date (state.batches)
DATE_EMA = "2026-09-04"               # EMA Medicine.csv download; the file carries no export date
DATE_HC = "2026-09-04"                # Health Canada DPD allfiles download
DATE_REGISTRY = "2026-09-01"          # ClinicalTrials.gov snapshot 2026-09-01 (registry/summary.json)
DATE_NDC = "2026-08-28"               # openFDA NDC meta.last_updated

CT_SNAPSHOT = "clinicaltrials.gov/api/v2 studies snapshot 2026-09-01"

FIELDS = ["indication", "labelKinetics", "interactions", "adverseEvents", "faers",
          "trialHistory", "trialFailures", "regulatory", "withdrawal"]

# NA-LABEL-CLASS: for a page whose recorded entity class is SUPPLEMENT_INGREDIENT or
# BOTANICAL_OR_ORGANISM_PREPARATION and which has no label in the openFDA archive, the four
# label-derived fields do not apply to the record's class (docs/specs/field-models.md names exactly
# this case: "label kinetics for a botanical with no label").
NA_CLASSES = {"SUPPLEMENT_INGREDIENT", "BOTANICAL_OR_ORGANISM_PREPARATION"}
NA_RULE = ("NA-LABEL-CLASS: the record's entity class is a supplement ingredient or botanical "
           "preparation and no US drug label names it, so a label field does not apply")
LABEL_FIELDS = ("indication", "labelKinetics", "interactions", "adverseEvents")

_NON = re.compile(r"[^a-z0-9]+")
SALT_WORDS = {
    "hydrochloride", "hcl", "sodium", "potassium", "calcium", "magnesium", "sulfate",
    "sulphate", "phosphate", "acetate", "maleate", "tartrate", "citrate", "mesylate",
    "besylate", "fumarate", "succinate", "bromide", "chloride", "nitrate", "oxalate",
    "tosylate", "dihydrate", "monohydrate", "hydrate", "anhydrous", "malate", "lactate",
    "bitartrate", "hydrobromide", "gluconate", "carbonate", "benzoate", "stearate",
    "trihydrate", "disodium", "dipotassium", "salt", "base",
}
SAFE_KINDS = {"display", "inn", "usan", "ban", "jan", "brand", "salt", "code"}


def norm(s):
    if not s:
        return ""
    return _NON.sub(" ", str(s).lower()).strip()


def strip_salt(n):
    parts = [p for p in n.split(" ") if p]
    while len(parts) > 1 and parts[-1] in SALT_WORDS:
        parts.pop()
    return " ".join(parts)


def log(msg):
    print(msg, flush=True)


# ---------------------------------------------------------------- canonical index

log("[1/12] canonical.ndjson")
records = []
by_chembl = defaultdict(set)
by_unii = defaultdict(set)
by_rxcui = defaultdict(set)
by_name = defaultdict(set)
by_stripped = defaultdict(set)
by_safe = defaultdict(set)
by_key = {}
slug_to_index = {}

with open(D("data", "corpus-20k", "identity", "canonical.ndjson"), encoding="utf-8") as fh:
    for idx, line in enumerate(fh):
        r = json.loads(line)
        names, safe_names = set(), set()
        if r.get("displayName"):
            names.add(r["displayName"])
            safe_names.add(r["displayName"])
        for syn in r.get("synonyms") or []:
            if syn.get("name"):
                names.add(syn["name"])
                if syn.get("kind") in SAFE_KINDS:
                    safe_names.add(syn["name"])
        existing = [sr["id"] for sr in (r.get("sourceRecords") or [])
                    if sr.get("source") == "existing" and sr.get("id")]
        if r.get("existingSlug"):
            existing.append(r["existingSlug"])
        rec = {
            "i": idx, "key": r["key"], "displayName": r.get("displayName") or r["key"],
            "chemblId": r.get("chemblId"), "unii": r.get("unii"), "rxcui": r.get("rxcui"),
            "existing": sorted(set(existing)),
            "isBiologic": bool(r.get("isBiologic")),
            "isCombination": bool(r.get("isCombination")),
            "names": sorted(names),
        }
        records.append(rec)
        by_key[rec["key"]] = idx
        for slug in rec["existing"]:
            slug_to_index.setdefault(slug, idx)
        if rec["chemblId"]:
            by_chembl[rec["chemblId"]].add(idx)
        if rec["unii"]:
            by_unii[rec["unii"].upper()].add(idx)
        if rec["rxcui"]:
            by_rxcui[str(rec["rxcui"])].add(idx)
        for nm in names:
            n = norm(nm)
            if len(n) >= 4:
                by_name[n].add(idx)
                st = strip_salt(n)
                if st != n and len(st) >= 4:
                    by_stripped[st].add(idx)
        for nm in safe_names:
            n = norm(nm)
            if len(n) >= 4:
                by_safe[n].add(idx)

N = len(records)
log(f"      {N} canonical records")

with open(D("data", "corpus-20k", "reconciliation", "matched.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        m = json.loads(line)
        i = by_key.get(m["key"])
        if i is None:
            continue
        for slug in (m.get("existingSlugs") or []) + ([m["pageSlug"]] if m.get("pageSlug") else []):
            slug_to_index.setdefault(slug, i)


def match(unii=None, rxcui=None, names=(), allow_stripped=True):
    """Identity-first, then safe-name, then any-name, then salt-stripped. Same order as the model
    assignment step, so a page is joined to a register row by the same evidence in both."""
    hits = set()
    if unii:
        for u in (unii if isinstance(unii, (list, tuple, set)) else [unii]):
            if u:
                hits |= by_unii.get(str(u).upper(), set())
    if rxcui:
        for c in (rxcui if isinstance(rxcui, (list, tuple, set)) else [rxcui]):
            if c:
                hits |= by_rxcui.get(str(c), set())
    if hits:
        return hits
    for nm in names:
        n = norm(nm)
        if len(n) < 4:
            continue
        h = by_safe.get(n)
        if h and len(h) <= 3:
            hits |= h
    if hits:
        return hits
    for nm in names:
        n = norm(nm)
        if len(n) < 4:
            continue
        h = by_name.get(n)
        if h and len(h) <= 3:
            hits |= h
    if hits:
        return hits
    if allow_stripped:
        for nm in names:
            n = strip_salt(norm(nm))
            if len(n) < 4:
                continue
            h = by_stripped.get(n) or by_name.get(n)
            if h and len(h) == 1:
                hits |= h
    return hits


# ---------------------------------------------------------------- scope

log("[2/12] model assignment (CLINICAL scope)")
clinical_order = []
clinical = set()
assign = {}
with open(D("data", "corpus-20k", "tiers", "model-assignment.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        a = json.loads(line)
        if a["model"] != "CLINICAL":
            continue
        i = by_key.get(a["key"])
        if i is None:
            continue
        clinical_order.append(i)
        clinical.add(i)
        assign[i] = a
log(f"      {len(clinical_order)} CLINICAL pages")
if ONLY_KEYS_FILE:
    _wanted = {ln.strip() for ln in open(ONLY_KEYS_FILE, encoding="utf-8") if ln.strip()}
    clinical_order = [i for i in clinical_order if records[i]["key"] in _wanted]
    log(f"      restricted to {len(clinical_order)} pages named in {ONLY_KEYS_FILE}")

suppressed = {}
dea_schedule = {}
with open(D("data", "corpus-20k", "suppression", "assignments.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        s = json.loads(line)
        i = by_key.get(s["key"])
        if i is None:
            continue
        suppressed[i] = bool(s.get("suppressed"))
        for ev in s.get("evidence") or []:
            if ev.get("test") == "S2" and ev.get("value"):
                dea_schedule[i] = ev["value"]

entity_class = {}
with open(D("data", "corpus-20k", "suppression", "db-entity-classes.tsv"), encoding="utf-8") as fh:
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2 and parts[1]:
            i = slug_to_index.get(parts[0])
            if i is not None:
                entity_class.setdefault(i, parts[1])

# ---------------------------------------------------------------- label selection

log("[3/12] label-sections-index.json — choose one label per page")
WANT_SECTIONS = ("indications_and_usage", "pharmacokinetics", "clinical_pharmacology",
                 "drug_interactions", "adverse_reactions", "description")
candidates = defaultdict(list)
si = json.load(open(I("label-sections-index.json"), encoding="utf-8"))
for e in si["entries"]:
    if int(e.get("declared") or 0) != 1:
        continue          # a multi-substance label states nothing about one ingredient alone
    sections = set(e.get("sections") or [])
    if not sections & set(WANT_SECTIONS):
        continue
    idxs = match(names=e.get("names") or [])
    if not idxs:
        continue
    ptypes = {str(p).upper() for p in (e.get("productTypes") or [])}
    rank = (1 if "HUMAN PRESCRIPTION DRUG" in ptypes else 0,
            len(sections & set(WANT_SECTIONS)),
            str(e.get("effectiveTime") or ""))
    for i in idxs:
        if i in clinical:
            candidates[i].append((rank, e["setId"], str(e.get("effectiveTime") or ""),
                                  sorted(ptypes)))
del si

chosen = {}
for i, cands in candidates.items():
    cands.sort(key=lambda c: c[0], reverse=True)
    chosen[i] = cands[0]
setid_to_pages = defaultdict(list)
for i, (_, setid, _, _) in chosen.items():
    setid_to_pages[setid].append(i)
log(f"      {len(chosen)} CLINICAL pages matched a single-substance label "
    f"({len(setid_to_pages)} distinct labels)")

log("[4/12] label-index.ndjson — read the chosen labels (single streaming pass)")
label_text = {}
wanted = set(setid_to_pages)
seen = 0
with open(I("label-index.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        # cheap pre-filter before parsing 1.6 GB of JSON
        if not wanted:
            break
        sid = line[11:47]
        if sid not in wanted:
            continue
        d = json.loads(line)
        if d.get("setId") not in wanted:
            continue
        label_text[d["setId"]] = {
            "effectiveTime": d.get("effectiveTime"),
            "sections": {k: v for k, v in (d.get("sections") or {}).items()
                         if k in WANT_SECTIONS},
        }
        wanted.discard(d["setId"])
        seen += 1
log(f"      {seen} label bodies read; {len(wanted)} chosen setIds not present in the body file")

# ---------------------------------------------------------------- database

log("[5/12] working database — recorded_background and stored PubMed counts")


def psql_json(query):
    out = subprocess.run([PSQL, DB_URL, "-tAc", query], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr[:500])
    return out.stdout


rb_by_slug = {}
raw = psql_json(
    "select slug || E'\\t' || replace(recorded_background::text, E'\\n', ' ') "
    "from drugs where recorded_background is not null")
for line in raw.splitlines():
    if "\t" not in line:
        continue
    slug, payload = line.split("\t", 1)
    try:
        rb_by_slug[slug] = json.loads(payload)
    except json.JSONDecodeError:
        continue
log(f"      {len(rb_by_slug)} recorded_background rows")

pubmed_by_slug = {}
raw = psql_json(
    "select d.slug || E'\\t' || coalesce(s.result_count,0)::text || E'\\t' || "
    "coalesce(s.source_identifier,'') || E'\\t' || to_char(s.requested_at,'YYYY-MM-DD') "
    "from source_search_records s join drugs d on d.id = s.drug_id "
    "where s.search_kind = 'PUBMED_ESEARCH_CLINICAL_TRIAL' and s.status = 'SUCCEEDED'")
for line in raw.splitlines():
    parts = line.split("\t")
    if len(parts) == 4:
        pubmed_by_slug[parts[0]] = {"count": int(parts[1]), "query": parts[2], "date": parts[3]}
log(f"      {len(pubmed_by_slug)} stored PubMed clinical-trial counts")


def rb_for(rec, wants=None):
    """The first existing slug whose recorded_background holds the node this field needs; falls
    back to any recorded_background so the caller can report what it consulted."""
    fallback = (None, None)
    for slug in rec["existing"]:
        rb = rb_by_slug.get(slug)
        if not rb:
            continue
        if wants is None or wants in rb:
            return slug, rb
        if fallback == (None, None):
            fallback = (slug, rb)
    return fallback


# ---------------------------------------------------------------- registry aggregates

log("[6/12] registry aggregates")
aggregates = {}
for f in sorted(glob.glob(D("data", "corpus-20k", "registry", "aggregates", "batch-*.ndjson"))):
    with open(f, encoding="utf-8") as fh:
        for line in fh:
            a = json.loads(line)
            i = by_key.get(a["key"])
            if i is not None and i in clinical:
                aggregates[i] = {
                    "studies": a.get("studies"),
                    "byPhase": a.get("byPhase") or {},
                    "byOverallStatus": a.get("byOverallStatus") or {},
                    "hasResults": a.get("hasResults"),
                    "stopped": a.get("stopped") or [],
                }
log(f"      {len(aggregates)} CLINICAL pages carry a registry aggregate")

# ---------------------------------------------------------------- Open Targets ADR

log("[7/12] Open Targets FAERS spontaneous-report table")
adr = defaultdict(list)
try:
    import duckdb
except ImportError:  # pragma: no cover
    duckdb = None
try:
    if duckdb is None:
        raise RuntimeError("duckdb is not installed")
    rows = duckdb.connect().execute(
        "select chembl_id, event, count, llr, critval from read_parquet('%s') order by count desc"
        % D("data", "corpus-20k", "raw", "open-targets",
            "openfda_significant_adverse_drug_reactions", "*.parquet")).fetchall()
    for chembl_id, event, count, llr, critval in rows:
        if chembl_id and len(adr[chembl_id]) < 10:
            adr[chembl_id].append({"term": event, "reportCount": int(count),
                                   "likelihoodRatio": float(llr) if llr is not None else None,
                                   "criticalValue": float(critval) if critval is not None else None})
except Exception as exc:  # pragma: no cover
    log(f"      Open Targets ADR unreadable: {exc}")
log(f"      {len(adr)} ChEMBL molecules carry a FAERS reaction row")

# ---------------------------------------------------------------- registers

log("[8/12] Drugs@FDA and Orange Book")
us_facts = defaultdict(list)
daf = json.load(open(I("openfda", "drug-drugsfda-0001-of-0001.json"), encoding="utf-8"))
daf_date = (daf.get("meta") or {}).get("last_updated") or "2026-08-28"
for app in daf["results"]:
    names, statuses = set(), set()
    for p in app.get("products") or []:
        ings = p.get("active_ingredients") or []
        if len(ings) == 1 and ings[0].get("name"):
            names.add(ings[0]["name"])
        if p.get("marketing_status"):
            statuses.add(p["marketing_status"])
    if not names:
        continue
    for i in match(names=sorted(names)):
        if i in clinical:
            us_facts[i].append({
                "register": "Drugs@FDA",
                "id": app.get("application_number"),
                "statement": f"application {app.get('application_number')}: "
                             f"{', '.join(sorted(statuses)) or 'marketing status not recorded'}",
                "statuses": sorted(statuses),
                "url": "https://api.fda.gov/drug/drugsfda.json",
                "sourceDate": daf_date,
            })
del daf

ob = json.load(open(I("openfda", "drug-orangebook-0001-of-0001.json"), encoding="utf-8"))
ob_date = (ob.get("meta") or {}).get("last_updated") or "2026-08-28"
for entry in ob["results"]:
    for p in entry.get("products") or []:
        ings = p.get("active_ingredients") or []
        if len(ings) != 1 or not ings[0].get("name"):
            continue
        for i in match(names=[ings[0]["name"]]):
            if i in clinical and len(us_facts[i]) < 40:
                us_facts[i].append({
                    "register": "FDA Orange Book",
                    "id": p.get("application_number"),
                    "statement": f"application {p.get('application_number')}: "
                                 f"{p.get('marketing_status') or 'marketing status not recorded'}",
                    "statuses": [p.get("marketing_status")] if p.get("marketing_status") else [],
                    "url": "https://api.fda.gov/drug/drugsfda.json",
                    "sourceDate": ob_date,
                })
del ob

log("[9/12] EMA and Health Canada registers")
ema_facts = defaultdict(list)
with open(D("data", "corpus-20k", "raw", "ema", "Medicine.csv"), encoding="utf-8-sig",
          newline="") as fh:
    for row in csv.DictReader(fh):
        if (row.get("Category") or "").strip() != "Human":
            continue
        names = []
        for col in ("International non-proprietary name (INN) / common name", "Active substance",
                    "Name of medicine"):
            v = (row.get(col) or "").strip()
            if v:
                names.extend(p.strip() for p in re.split(r"[\n;,/]+", v) if p.strip())
        idxs = {i for i in match(names=names) if i in clinical}
        if not idxs:
            continue
        substances = {norm(p) for p in re.split(r"[\n;,/]+", (row.get("Active substance") or ""))
                      if len(norm(p)) >= 4}
        status = (row.get("Medicine status") or "").strip()
        if not status:
            continue
        for i in idxs:
            ema_facts[i].append({"status": status, "id": row.get("EMA product number"),
                                 "medicine": (row.get("Name of medicine") or "").strip(),
                                 "singleSubstance": len(substances) == 1})

hc_status_by_code = defaultdict(set)
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "status*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) >= 3 and row[0].strip():
                hc_status_by_code[row[0].strip()].add(row[2].strip().upper())
hc_ingredient_count = defaultdict(int)
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "ingred*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) >= 3 and row[0].strip():
                hc_ingredient_count[row[0].strip()] += 1
hc_facts = defaultdict(list)
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "ingred*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) < 3 or not row[0].strip():
                continue
            code = row[0].strip()
            statuses = hc_status_by_code.get(code)
            if not statuses:
                continue
            raw_name = row[2].strip()
            base = re.sub(r"\s*\([^)]*\)\s*$", "", raw_name)
            idxs = {i for i in match(names=[base, raw_name]) if i in clinical}
            if not idxs:
                continue
            for i in idxs:
                for s in sorted(statuses):
                    if not (s.startswith("MARKETED") or s.startswith("APPROVED")
                            or s.startswith("CANCELLED")):
                        continue
                    if len(hc_facts[i]) < 40:
                        hc_facts[i].append({"status": s, "id": code,
                                            "singleIngredient": hc_ingredient_count.get(code) == 1})

log("[10/12] ChEMBL withdrawn_flag, Open Targets drug_warning, openFDA enforcement")
chembl_withdrawn = {}
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "molecules-*.json"))):
    for m in json.load(open(f, encoding="utf-8"))["molecules"]:
        if not m.get("withdrawn_flag"):
            continue
        cid = m.get("molecule_chembl_id")
        for i in by_chembl.get(cid, set()):
            if i in clinical:
                chembl_withdrawn[i] = cid

chembl_warnings = defaultdict(list)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "warning-*.json"))):
    for w in json.load(open(f, encoding="utf-8"))["drug_warnings"]:
        if w.get("warning_type") != "Withdrawn":
            continue
        idxs = set()
        for cid in (w.get("molecule_chembl_id"), w.get("parent_molecule_chembl_id")):
            if cid:
                idxs |= by_chembl.get(cid, set())
        for i in idxs:
            if i in clinical:
                chembl_warnings[i].append({
                    "reason": w.get("warning_class") or w.get("warning_description"),
                    "country": w.get("warning_country"), "year": w.get("warning_year"),
                    "id": w.get("molecule_chembl_id")})

ot_warnings = defaultdict(list)
try:
    rows = duckdb.connect().execute(
        "select chemblIds, warningType, toxicityClass, country, year, description "
        "from read_parquet('%s')" %
        D("data", "corpus-20k", "raw", "open-targets", "drug_warning", "*.parquet")).fetchall()
    for chembl_ids, wtype, tox, country, year, desc in rows:
        if wtype != "Withdrawn":
            continue
        idxs = set()
        for cid in (chembl_ids or []):
            idxs |= by_chembl.get(cid, set())
        for i in idxs:
            if i in clinical:
                ot_warnings[i].append({
                    "warningType": wtype, "toxicityClass": tox, "country": country,
                    "year": int(year) if year is not None else None,
                    "description": desc, "id": (chembl_ids or [None])[0]})
except Exception as exc:  # pragma: no cover
    log(f"      Open Targets drug_warning unreadable: {exc}")

enforcement = defaultdict(list)
enf = json.load(open(D("data", "corpus-20k", "raw", "openfda",
                       "drug-enforcement-0001-of-0001.json"), encoding="utf-8"))
enf_date = (enf.get("meta") or {}).get("last_updated") or "2026-08-27"
for r in enf["results"]:
    if r.get("classification") != "Class I":
        continue
    of = r.get("openfda") or {}
    idxs = match(unii=of.get("unii"), rxcui=of.get("rxcui"),
                 names=(of.get("substance_name") or []), allow_stripped=False)
    for i in idxs:
        if i in clinical and len(enforcement[i]) < 5:
            enforcement[i].append({
                "recallNumber": r.get("recall_number"),
                "classification": r.get("classification"),
                "reasonForRecall": r.get("reason_for_recall"),
                "recallInitiationDate": r.get("recall_initiation_date"),
                "productDescription": r.get("product_description"),
                "status": r.get("status"),
            })
del enf

# ---------------------------------------------------------------- text helpers

SENT = re.compile(r"(?<=[.;])\s+(?=[A-Z0-9(•\[])")
HEADING = re.compile(
    r"^\s*(?:\d+(?:\.\d+)*\s+)?(INDICATIONS AND USAGE|ADVERSE REACTIONS|DRUG INTERACTIONS|"
    r"CLINICAL PHARMACOLOGY|PHARMACOKINETICS|DESCRIPTION|Indications and Usage|"
    r"Adverse Reactions|Drug Interactions|Pharmacokinetics)\s*", re.I)


def clip(text, limit):
    """Truncate on a word boundary so the stored string stays an exact prefix of the source."""
    if not text:
        return text
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    space = cut.rfind(" ")
    return (cut[:space] if space > limit // 2 else cut).rstrip(" ,;:-")


BOILERPLATE = re.compile(
    r"\s*(?:To report SUSPECTED ADVERSE REACTIONS|Call your doctor for medical advice about side "
    r"effects|You may report side effects to FDA)", re.I)


def sentences(text):
    if not text:
        return []
    text = HEADING.sub("", text.strip(), count=1)
    text = re.sub(r"\s+", " ", text)
    return [s.strip() for s in SENT.split(text) if s.strip()]


def label_sections(i):
    c = chosen.get(i)
    if not c:
        return None, None, None
    body = label_text.get(c[1])
    if not body:
        return None, None, None
    return c[1], body.get("effectiveTime"), body.get("sections") or {}


def label_source(setid, effective_time):
    d = None
    if effective_time and re.fullmatch(r"\d{8}", str(effective_time)):
        d = f"{effective_time[:4]}-{effective_time[4:6]}-{effective_time[6:]}"
    return ({"kind": "FDA_LABEL", "id": setid,
             "url": f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={setid}"},
            d or "2026-08-30")


def rb_source(node, slug):
    """Carry the label citation stored inside recorded_background, not RNAWiki as the source."""
    src = (node or {}).get("source") or {}
    ident = src.get("identifier")
    if src.get("kind") == "FDA_LABEL" and ident:
        return ({"kind": "FDA_LABEL", "id": ident,
                 "url": f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={ident}"},
                src.get("retrievedAt") or "2026-08-30")
    return ({"kind": src.get("kind") or "RNAWIKI_RECORDED_BACKGROUND", "id": ident or slug,
             "url": f"https://rnawiki.com/medicines/{slug}"},
            src.get("retrievedAt") or "2026-08-30")


def present(value, source, source_date, verbatim=True):
    return {"state": "present", "value": value, "source": source,
            "sourceDate": source_date, "lastVerified": TODAY, "verbatim": bool(verbatim)}


def absent(consulted):
    return {"state": "absent", "value": None, "source": None, "sourceDate": None,
            "lastVerified": TODAY, "verbatim": False, "consulted": consulted}


def not_applicable(rule):
    return {"state": "not-applicable", "value": None, "source": None, "sourceDate": None,
            "lastVerified": TODAY, "verbatim": False, "rule": rule}


# ---------------------------------------------------------------- field extractors

MEASURE = {
    "halfLife": (re.compile(r"half[- ]?li(?:fe|ves)", re.I),
                 re.compile(r"(\d+(?:\.\d+)?(?:\s*(?:to|-|–|±)\s*\d+(?:\.\d+)?)?)\s*"
                            r"(hours?|hrs?|h\b|days?|minutes?|min\b|weeks?)", re.I)),
    "tmax": (re.compile(r"\bt\s?max\b|time to (?:reach )?(?:peak|maximum) (?:plasma )?"
                        r"concentration|peak (?:plasma )?concentrations?\b", re.I),
             re.compile(r"(\d+(?:\.\d+)?(?:\s*(?:to|-|–|±)\s*\d+(?:\.\d+)?)?)\s*"
                        r"(hours?|hrs?|h\b|minutes?|min\b|days?)", re.I)),
    "bioavailability": (re.compile(r"bioavailab", re.I),
                        re.compile(r"(\d+(?:\.\d+)?(?:\s*(?:to|-|–|±)\s*\d+(?:\.\d+)?)?)\s*(%)")),
}
METABOLISM = re.compile(r"\bmetaboli[sz]", re.I)
INTERACTION_TERM = re.compile(
    r"\bCYP\s?\d[A-Z]\d?\b|\bcytochrome P[- ]?450\b|\bP-?gp\b|\bP-?glycoprotein\b|\bBCRP\b|"
    r"\bOATP\d?[A-Z]?\d?\b|\bOAT\d\b|\bOCT\d\b|\bMATE\d?[- ]?K?\b|\bUGT\d[A-Z]\d?\b|"
    r"\btransporter\b", re.I)
COMMON_AE = re.compile(
    r"(most common(?:ly reported)? (?:adverse|side)[^.;]{0,80}|"
    r"adverse reactions (?:reported )?in (?:≥|>=|greater than or equal to)\s?\d+%[^.;]{0,60}|"
    r"the most frequent(?:ly reported)? adverse[^.;]{0,80})", re.I)


def field_indication(i, rec, sections, setid, eff):
    text = (sections or {}).get("indications_and_usage")
    sents = sentences(text)
    if sents:
        value = clip(" ".join(sents[:2]), 800)
        src, d = label_source(setid, eff)
        return present({"statement": value, "labelSection": "indications_and_usage"}, src, d)
    slug, rb = rb_for(rec, "recordedUses")
    uses = ((rb or {}).get("recordedUses") or {}).get("statements") or []
    if uses:
        src, d = rb_source(uses[0], slug)
        value = " ".join(s.get("textAsRecorded", "") for s in uses[:2]).strip()[:800]
        if value:
            return present({"statement": value, "labelSection": "indications_and_usage"}, src, d)
    return absent(["openFDA label indications_and_usage", "recorded_background.recordedUses"])


def field_label_kinetics(i, rec, sections, setid, eff):
    pool = []
    for name in ("pharmacokinetics", "clinical_pharmacology", "description"):
        for s in sentences((sections or {}).get(name)):
            pool.append((name, s))
    out = {}
    for measure, (kw, num) in MEASURE.items():
        for section, s in pool:
            if not kw.search(s):
                continue
            m = num.search(s)
            if not m:
                continue
            out[measure] = {"value": m.group(1).strip(), "unit": m.group(2).strip(),
                            "verbatim": clip(s, 600), "labelSection": section}
            break
    for section, s in pool:
        if METABOLISM.search(s):
            out["metabolism"] = {"value": None, "unit": None, "verbatim": clip(s, 600),
                                 "labelSection": section}
            break
    if out:
        src, d = label_source(setid, eff)
        return present(out, src, d)
    slug, rb = rb_for(rec, "pharmacokinetics")
    pk = (rb or {}).get("pharmacokinetics") or {}
    stored = {}
    for key, target in (("halfLife", "halfLife"), ("tmax", "tmax"),
                        ("bioavailability", "bioavailability")):
        node = pk.get(key)
        if isinstance(node, dict) and node.get("display"):
            stored[target] = {"value": node.get("display"), "unit": node.get("unit"),
                              "verbatim": (node.get("source") or {}).get("excerpt"),
                              "labelSection": "recorded_background.pharmacokinetics"}
    if stored:
        first = next(iter(stored))
        node = pk.get(first if first != "tmax" else "tmax")
        src, d = rb_source(node, slug)
        return present(stored, src, d)
    return absent(["openFDA label pharmacokinetics/clinical_pharmacology",
                   "recorded_background.pharmacokinetics"])


def field_interactions(i, rec, sections, setid, eff):
    hits = []
    for name in ("drug_interactions", "pharmacokinetics", "clinical_pharmacology"):
        for s in sentences((sections or {}).get(name)):
            if INTERACTION_TERM.search(s) and len(s) > 25:
                hits.append({"statement": clip(s, 600), "labelSection": name,
                             "terms": sorted({t.upper() for t in INTERACTION_TERM.findall(s)})
                             if INTERACTION_TERM.findall(s) else []})
            if len(hits) >= 8:
                break
        if len(hits) >= 8:
            break
    if hits:
        for h in hits:
            h["terms"] = sorted({m.group(0).upper() for m in INTERACTION_TERM.finditer(h["statement"])})
        src, d = label_source(setid, eff)
        return present(hits, src, d)
    slug, rb = rb_for(rec, "interactionSignals")
    signals = (rb or {}).get("interactionSignals") or []
    if signals:
        keep, seen_ex = [], set()
        for sig in signals:
            ex = (sig.get("source") or {}).get("excerpt")
            if not ex or ex in seen_ex:
                continue
            seen_ex.add(ex)
            keep.append({"statement": clip(ex, 600),
                         "labelSection": sig.get("labelSection"),
                         "terms": [sig.get("counterpartyAsRecorded")] if
                         sig.get("counterpartyAsRecorded") else []})
            if len(keep) >= 8:
                break
        if keep:
            src, d = rb_source(signals[0], slug)
            return present(keep, src, d)
    return absent(["openFDA label drug_interactions", "openFDA label pharmacokinetics",
                   "recorded_background.interactionSignals"])


def field_adverse_events(i, rec, sections, setid, eff):
    for name in ("adverse_reactions", "indications_and_usage", "clinical_pharmacology"):
        for s in sentences((sections or {}).get(name)):
            if COMMON_AE.search(s):
                statement = BOILERPLATE.split(s)[0]
                src, d = label_source(setid, eff)
                return present({"statement": clip(statement, 800), "labelSection": name}, src, d)
    slug, rb = rb_for(rec, "commonAdverseReactions")
    car = (rb or {}).get("commonAdverseReactions")
    if isinstance(car, dict) and (car.get("eventsAsRecorded") or car.get("source")):
        src, d = rb_source(car, slug)
        return present({"eventsAsRecorded": car.get("eventsAsRecorded") or [],
                        "thresholdAsRecorded": car.get("thresholdAsRecorded"),
                        "statement": (car.get("source") or {}).get("excerpt"),
                        "labelSection": "adverse_reactions"}, src, d)
    sents = sentences((sections or {}).get("adverse_reactions"))
    if sents:
        src, d = label_source(setid, eff)
        return present({"statement": clip(BOILERPLATE.split(" ".join(sents[:2]))[0], 800),
                        "labelSection": "adverse_reactions",
                        "note": "the label states no \"most common adverse reactions\" sentence; "
                                "the opening of the adverse reactions section is recorded instead"},
                       src, d)
    return absent(["openFDA label adverse_reactions",
                   "recorded_background.commonAdverseReactions"])


def field_faers(i, rec):
    cid = rec["chemblId"]
    rows = adr.get(cid) if cid else None
    if rows:
        return present(
            {"reportKind": "spontaneous reports collected by the FDA Adverse Event Reporting "
                           "System; a report count is not an incidence rate",
             "reactions": rows},
            {"kind": "OPEN_TARGETS_FAERS", "id": cid,
             "url": f"https://platform.opentargets.org/drug/{cid}"},
            DATE_OPEN_TARGETS, verbatim=True)
    return absent(["Open Targets 26.06 openfda_significant_adverse_drug_reactions"
                   + ("" if cid else " (page holds no ChEMBL id, the table's only key)")])


def field_trial_history(i, rec):
    agg = aggregates.get(i)
    pubmed = None
    for slug in rec["existing"]:
        if slug in pubmed_by_slug:
            pubmed = (slug, pubmed_by_slug[slug])
            break
    if agg:
        value = {"registeredStudies": agg["studies"], "byPhase": agg["byPhase"],
                 "byOverallStatus": agg["byOverallStatus"],
                 "studiesWithPostedResults": agg["hasResults"], "registry": CT_SNAPSHOT}
        if pubmed:
            value["pubmedClinicalTrialCount"] = {
                "count": pubmed[1]["count"], "query": pubmed[1]["query"],
                "sourceDate": pubmed[1]["date"],
                "source": {"kind": "PUBMED_ESEARCH", "id": pubmed[0],
                           "url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"}}
        return present(value,
                       {"kind": "CLINICALTRIALS_SNAPSHOT", "id": rec["key"],
                        "url": "https://clinicaltrials.gov/"}, DATE_REGISTRY)
    if pubmed and pubmed[1]["count"] > 0:
        return present({"registeredStudies": 0,
                        "pubmedClinicalTrialCount": {"count": pubmed[1]["count"],
                                                     "query": pubmed[1]["query"]},
                        "registry": CT_SNAPSHOT},
                       {"kind": "PUBMED_ESEARCH", "id": pubmed[0],
                        "url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"},
                       pubmed[1]["date"])
    return absent([CT_SNAPSHOT, "stored PUBMED_ESEARCH_CLINICAL_TRIAL counts"])


def field_trial_failures(i, rec):
    agg = aggregates.get(i)
    stopped = (agg or {}).get("stopped") or []
    rows = [{"nct": s.get("nct"), "status": s.get("status"),
             "whyStopped": s.get("whyStopped")} for s in stopped if s.get("nct")]
    if rows:
        return present(rows, {"kind": "CLINICALTRIALS_SNAPSHOT", "id": rec["key"],
                              "url": "https://clinicaltrials.gov/"}, DATE_REGISTRY)
    return absent([CT_SNAPSHOT + " (stopped studies)"])


JURISDICTIONS = ["US", "EU", "UK", "CA", "AU", "JP", "SG"]
NO_SOURCE = {
    "UK": "no UK register was cleared for use in this corpus",
    "AU": "the TGA ARTG robots file was unretrievable to our agent, so it was never cleared",
    "JP": "PMDA publishes no licence statement for reuse, so it was never cleared",
    "SG": "no Singapore register was cleared for use in this corpus",
}


def field_regulatory(i, rec):
    out = {}
    stated = False

    us = us_facts.get(i) or []
    schedule = dea_schedule.get(i)
    us_evidence = [{"register": f["register"], "id": f["id"], "statement": f["statement"],
                    "sourceDate": f["sourceDate"]} for f in us[:8]]
    us_statuses = {s for f in us for s in f.get("statuses") or []}
    if schedule:
        us_evidence.append({"register": "openFDA NDC", "id": schedule,
                            "statement": f"dea_schedule {schedule}", "sourceDate": DATE_NDC})
    if us_statuses & {"Prescription", "Over-the-counter", "OTC"}:
        us_status = "approved"
    elif us:
        us_status = "approved"
    elif schedule:
        us_status = "controlled"
    else:
        us_status = "unknown"
    if us_status != "unknown":
        stated = True
    out["US"] = {"status": us_status, "controlledSubstanceSchedule": schedule,
                 "marketingStatusesAsRecorded": sorted(us_statuses),
                 "evidence": us_evidence,
                 "sources": ["Drugs@FDA", "FDA Orange Book", "openFDA NDC dea_schedule"]}

    ema = ema_facts.get(i) or []
    ema_statuses = {f["status"] for f in ema}
    if "Authorised" in ema_statuses:
        eu_status = "approved"
    elif ema_statuses & {"Withdrawn", "Revoked", "Suspended"}:
        eu_status = "withdrawn"
    elif ema_statuses:
        eu_status = "unknown"
    else:
        eu_status = "unknown"
    if eu_status != "unknown":
        stated = True
    out["EU"] = {"status": eu_status,
                 "evidence": [{"register": "EMA Medicine.csv", "id": f["id"],
                               "statement": f"{f['medicine']}: medicine status {f['status']}",
                               "sourceDate": DATE_EMA} for f in ema[:8]],
                 "sources": ["EMA Medicine.csv"]}

    hc = hc_facts.get(i) or []
    hc_statuses = {f["status"] for f in hc}
    live = {s for s in hc_statuses if s.startswith("MARKETED") or s.startswith("APPROVED")}
    safety_cancel = {s for s in hc_statuses if s.startswith("CANCELLED") and "SAFETY" in s}
    if live:
        ca_status = "approved"
    elif safety_cancel:
        ca_status = "withdrawn"
    elif hc_statuses:
        ca_status = "unknown"
    else:
        ca_status = "unknown"
    if ca_status != "unknown":
        stated = True
    out["CA"] = {"status": ca_status,
                 "evidence": [{"register": "Health Canada DPD", "id": f["id"],
                               "statement": f"drug code {f['id']}: {f['status']}",
                               "sourceDate": DATE_HC} for f in hc[:8]],
                 "sources": ["Health Canada Drug Product Database"]}

    for j in ("UK", "AU", "JP", "SG"):
        out[j] = {"status": "unknown", "evidence": [], "sources": [],
                  "note": NO_SOURCE[j]}

    if stated:
        return present(out, {"kind": "REGISTER_SET", "id": rec["key"],
                             "url": "https://api.fda.gov/drug/drugsfda.json"}, DATE_NDC)
    return absent(["Drugs@FDA", "FDA Orange Book", "openFDA NDC dea_schedule",
                   "EMA Medicine.csv", "Health Canada DPD"])


def field_withdrawal(i, rec):
    a = assign.get(i) or {}
    jurisdictions = []
    reasons = []
    evidence = []
    primary_source = None
    primary_date = None

    for w in ot_warnings.get(i) or []:
        country = w.get("country")
        if country:
            jurisdictions.append(country)
        if w.get("toxicityClass") or w.get("description"):
            reasons.append({"reason": w.get("toxicityClass") or w.get("description"),
                            "country": country, "year": w.get("year"),
                            "source": "Open Targets 26.06 drug_warning"})
        evidence.append({"source": "Open Targets 26.06 drug_warning",
                         "statement": f"warningType Withdrawn"
                                      f"{'; ' + str(country) if country else ''}"
                                      f"{'; ' + str(w['year']) if w.get('year') else ''}"
                                      f"{'; ' + w['toxicityClass'] if w.get('toxicityClass') else ''}",
                         "id": w.get("id"), "sourceDate": DATE_OPEN_TARGETS})
        if primary_source is None:
            primary_source = {"kind": "OPEN_TARGETS_DRUG_WARNING", "id": w.get("id"),
                              "url": f"https://platform.opentargets.org/drug/{w.get('id')}"}
            primary_date = DATE_OPEN_TARGETS

    for w in chembl_warnings.get(i) or []:
        if w.get("country"):
            jurisdictions.append(w["country"])
        if w.get("reason"):
            reasons.append({"reason": w["reason"], "country": w.get("country"),
                            "year": w.get("year"), "source": "ChEMBL 37 drug_warning"})
        evidence.append({"source": "ChEMBL 37 drug_warning",
                         "statement": f"warning_type Withdrawn"
                                      f"{'; ' + str(w['country']) if w.get('country') else ''}"
                                      f"{'; ' + str(w['year']) if w.get('year') else ''}",
                         "id": w.get("id"), "sourceDate": DATE_CHEMBL})
        if primary_source is None:
            primary_source = {"kind": "CHEMBL_DRUG_WARNING", "id": w.get("id"),
                              "url": f"https://www.ebi.ac.uk/chembl/compound_report_card/{w.get('id')}/"}
            primary_date = DATE_CHEMBL

    ema = [f for f in (ema_facts.get(i) or []) if f["singleSubstance"]]
    ema_statuses = {f["status"] for f in ema}
    if ema_statuses and "Authorised" not in ema_statuses:
        for f in ema:
            if f["status"] in ("Withdrawn", "Revoked", "Suspended"):
                jurisdictions.append("European Union")
                evidence.append({"source": "EMA Medicine.csv",
                                 "statement": f"{f['medicine']}: medicine status {f['status']}"
                                              " (EMA records a status, not a reason)",
                                 "id": f["id"], "sourceDate": DATE_EMA})
                if primary_source is None:
                    primary_source = {"kind": "EMA_MEDICINE_REGISTER", "id": f["id"],
                                      "url": "https://www.ema.europa.eu/en/medicines"}
                    primary_date = DATE_EMA
                break

    hc = [f for f in (hc_facts.get(i) or []) if f["singleIngredient"]]
    hc_statuses = {f["status"] for f in hc}
    hc_live = {s for s in hc_statuses if s.startswith("MARKETED") or s.startswith("APPROVED")}
    for f in hc:
        s = f["status"]
        if not s.startswith("CANCELLED") or "PRE MARKET" in s:
            continue
        if hc_live and "SAFETY" not in s:
            continue
        jurisdictions.append("Canada")
        m = re.search(r"\(([^)]+)\)", s)
        if m and "SAFETY" in m.group(1):
            reasons.append({"reason": m.group(1).title(), "country": "Canada", "year": None,
                            "source": "Health Canada DPD status"})
        evidence.append({"source": "Health Canada DPD",
                         "statement": f"drug code {f['id']}: {s}", "id": f["id"],
                         "sourceDate": DATE_HC})
        if primary_source is None:
            primary_source = {"kind": "HEALTH_CANADA_DPD", "id": f["id"],
                              "url": "https://health-products.canada.ca/dpd-bdpp/"}
            primary_date = DATE_HC
        break

    cid = chembl_withdrawn.get(i)
    if cid:
        evidence.append({"source": "ChEMBL 37 molecule withdrawn_flag",
                         "statement": "withdrawn_flag true (ChEMBL 37 states the flag and no "
                                      "reason; withdrawn_reason is not published in this release)",
                         "id": cid, "sourceDate": DATE_CHEMBL})
        if primary_source is None:
            primary_source = {"kind": "CHEMBL_MOLECULE", "id": cid,
                              "url": f"https://www.ebi.ac.uk/chembl/compound_report_card/{cid}/"}
            primary_date = DATE_CHEMBL

    # Every source above states a withdrawal. A Class I recall does not: it withdraws named lots
    # or products, not the substance, so it is recorded as evidence without setting the flag.
    withdrawal_stated = bool(evidence)

    recalls = enforcement.get(i) or []
    for r in recalls:
        evidence.append({"source": "openFDA drug enforcement",
                         "statement": f"Class I recall {r['recallNumber']}: "
                                      f"{r['reasonForRecall']}",
                         "id": r["recallNumber"], "sourceDate": enf_date})
        reasons.append({"reason": r["reasonForRecall"], "country": "United States",
                        "year": (r.get("recallInitiationDate") or "")[:4] or None,
                        "source": "openFDA drug enforcement Class I recall"})
    if recalls and primary_source is None:
        primary_source = {"kind": "OPENFDA_ENFORCEMENT", "id": recalls[0]["recallNumber"],
                          "url": "https://api.fda.gov/drug/enforcement.json"}
        primary_date = enf_date

    if a.get("withdrawn") and not withdrawal_stated:
        wrs = a.get("withdrawnReasonSource") or {}
        evidence.append({"source": wrs.get("source") or "model assignment",
                         "statement": wrs.get("source") or "withdrawal recorded",
                         "id": wrs.get("id"), "sourceDate": DATE_CHEMBL})
        if wrs.get("reason"):
            reasons.append({"reason": wrs["reason"], "country": None, "year": None,
                            "source": wrs.get("source")})
        primary_source = {"kind": "REGISTER_SET", "id": wrs.get("id") or rec["key"],
                          "url": "https://platform.opentargets.org/"}
        primary_date = DATE_CHEMBL
        withdrawal_stated = True

    if not evidence:
        return absent(["ChEMBL 37 withdrawn_flag and drug_warning",
                       "Open Targets 26.06 drug_warning", "EMA Medicine.csv medicine status",
                       "Health Canada DPD status", "openFDA drug enforcement Class I recalls"])

    def dedupe(rows):
        out, seen_rows = [], set()
        for row in rows:
            marker = json.dumps(row, sort_keys=True, ensure_ascii=False)
            if marker in seen_rows:
                continue
            seen_rows.add(marker)
            out.append(row)
        return out

    reasons = dedupe(reasons)
    evidence = dedupe(evidence)
    if recalls and not withdrawal_stated:
        jurisdictions.append("United States")
    dates = sorted({str(r.get("year")) for r in reasons if r.get("year")} |
                   {str(r.get("recallInitiationDate")) for r in recalls
                    if r.get("recallInitiationDate")})
    if withdrawal_stated:
        note = (None if reasons else
                "every source that records this withdrawal states a status, not a reason")
    else:
        note = ("no register states that this substance was withdrawn; what is recorded here is an "
                "FDA Class I recall of named products or lots, with the recall's own reason")
    value = {
        "withdrawn": bool(withdrawal_stated),
        "jurisdictions": sorted({j for j in jurisdictions if j}),
        "reason": reasons[0]["reason"] if reasons else None,
        "reasons": reasons,
        "date": dates[0] if dates else None,
        "evidence": evidence,
        "note": note,
    }
    return present(value, primary_source, primary_date,
                   verbatim=bool(reasons))


# ---------------------------------------------------------------- run

log("[11/12] extracting fields")
present_by_field = defaultdict(int)
state_counts = defaultdict(lambda: defaultdict(int))
issues = []
batch_files = []
lines = []
batch_no = 0
written_pages = 0


def flush(batch_no, lines):
    """A rerun never rewrites a batch file that already exists (the batch ledger records it)."""
    path = os.path.join(OUT_DIR, f"batch-{batch_no:04d}.ndjson")
    if os.path.exists(path):
        log(f"      batch {batch_no:04d}: already on disk, left unchanged")
        return path
    with open(path, "w", encoding="utf-8") as out:
        for line in lines:
            out.write(line + "\n")
    return path


for n, i in enumerate(clinical_order):
    rec = records[i]
    setid, eff, sections = label_sections(i)
    has_label = bool(sections)
    na = (not has_label) and entity_class.get(i) in NA_CLASSES

    fields = {}
    fields["indication"] = (not_applicable(NA_RULE) if na
                            else field_indication(i, rec, sections, setid, eff))
    fields["labelKinetics"] = (not_applicable(NA_RULE) if na
                               else field_label_kinetics(i, rec, sections, setid, eff))
    fields["interactions"] = (not_applicable(NA_RULE) if na
                              else field_interactions(i, rec, sections, setid, eff))
    fields["adverseEvents"] = (not_applicable(NA_RULE) if na
                               else field_adverse_events(i, rec, sections, setid, eff))
    fields["faers"] = field_faers(i, rec)
    fields["trialHistory"] = field_trial_history(i, rec)
    fields["trialFailures"] = field_trial_failures(i, rec)
    fields["regulatory"] = field_regulatory(i, rec)
    fields["withdrawal"] = field_withdrawal(i, rec)

    for f in FIELDS:
        state_counts[f][fields[f]["state"]] += 1
        if fields[f]["state"] == "present":
            present_by_field[f] += 1

    lines.append(json.dumps({
        "key": rec["key"],
        "displayName": rec["displayName"],
        "model": "CLINICAL",
        "fields": fields,
        "suppressed": bool(suppressed.get(i, False)),
    }, ensure_ascii=False))
    written_pages += 1

    if len(lines) == BATCH_SIZE:
        batch_no += 1
        batch_files.append((batch_no, flush(batch_no, lines), len(lines)))
        log(f"      batch {batch_no:04d}: {len(lines)} pages "
            f"({written_pages}/{len(clinical_order)})")
        lines = []

if lines:
    batch_no += 1
    batch_files.append((batch_no, flush(batch_no, lines), len(lines)))
    log(f"      batch {batch_no:04d}: {len(lines)} pages ({written_pages}/{len(clinical_order)})")

log("[12/12] summary")
summary = {
    "schema": "rnawiki-corpus-20k-clinical-fields/v1",
    "spec": "docs/specs/field-models.md",
    "model": "CLINICAL",
    "pages": written_pages,
    "batches": len(batch_files),
    "presentByField": dict(present_by_field),
    "stateByField": {f: dict(state_counts[f]) for f in FIELDS},
    "labelMatches": len(chosen),
    "labelBodiesRead": seen,
    "requests": 0,
    "lastVerified": TODAY,
    "files": [{"batch": b, "path": os.path.relpath(p, ROOT), "records": c}
              for b, p, c in batch_files],
    "issues": issues,
}
_summary_path = (os.path.join(OUT_DIR, "clinical-summary.json") if ONLY_KEYS_FILE
                 else D("data", "corpus-20k", "fields", "clinical-summary.json"))
with open(_summary_path, "w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2, ensure_ascii=False)
    fh.write("\n")
print(json.dumps({k: v for k, v in summary.items() if k != "files"}, ensure_ascii=False))
