#!/usr/bin/env python
"""Phase 0e (R2) — suppression class assignment.

Executes docs/specs/suppression-classes.md over data/corpus-20k/identity/canonical.ndjson.
Every test is evaluated from data on disk; nothing is judged. A record for which no S1-S9
source returned any observation, and which is not positively cleared by S11, is suppressed
with unknown=true.

Documented source limits (carried into summary.json):
  - S4: the NIOSH hazardous-drug list was never fetched (no cleared bulk source). S4 therefore
    rests on ATC L01 and on label text containing "cytotoxic".
  - S5: there is no cleared bulk FDA REMS list. S5 therefore rests on label text mentioning
    "REMS" or "Risk Evaluation and Mitigation".
  - S2: only the DEA schedule is available (openFDA NDC dea_schedule). MHRA and HSA schedules
    were not fetched, so UK/Singapore control status contributes nothing.
  - S8: EMA Medicine.csv records a status but no reason, so only Suspended/Revoked are read as
    safety actions; the reasoned withdrawal signal comes from ChEMBL/Open Targets drug_warning
    (warningType "Withdrawn", which carries a toxicity class) and ChEMBL withdrawn_flag.
  - Open Targets drug_molecule 26.06 carries no blackBoxWarning/hasBeenWithdrawn column; those
    facts are read from Open Targets drug_warning and from ChEMBL molecule black_box_warning.
"""

from __future__ import annotations

import csv
import gzip
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
D = lambda *p: os.path.join(ROOT, *p)
I = lambda *p: os.path.join(INGEST, *p)

OUT_DIR = D("data", "corpus-20k", "suppression")

# ---------------------------------------------------------------- normalising

_NON = re.compile(r"[^a-z0-9]+")
SALT_WORDS = {
    "hydrochloride", "hcl", "sodium", "potassium", "calcium", "magnesium", "sulfate",
    "sulphate", "phosphate", "acetate", "maleate", "tartrate", "citrate", "mesylate",
    "besylate", "fumarate", "succinate", "bromide", "chloride", "nitrate", "oxalate",
    "tosylate", "dihydrate", "monohydrate", "hydrate", "anhydrous", "malate", "lactate",
    "bitartrate", "hydrobromide", "gluconate", "carbonate", "benzoate", "stearate",
    "trihydrate", "disodium", "dipotassium", "salt", "base",
}


def norm(s):
    if not s:
        return ""
    return _NON.sub(" ", str(s).lower()).strip()


def strip_salt(n):
    parts = [p for p in n.split(" ") if p]
    while len(parts) > 1 and parts[-1] in SALT_WORDS:
        parts.pop()
    return " ".join(parts)


# ---------------------------------------------------------------- canonical

print("[1/9] canonical.ndjson", flush=True)
records = []
by_chembl = defaultdict(set)
by_unii = defaultdict(set)
by_rxcui = defaultdict(set)
by_name = defaultdict(set)
by_stripped = defaultdict(set)

with open(D("data", "corpus-20k", "identity", "canonical.ndjson"), encoding="utf-8") as fh:
    for idx, line in enumerate(fh):
        r = json.loads(line)
        names = set()
        if r.get("displayName"):
            names.add(r["displayName"])
        for s in r.get("synonyms") or []:
            if s.get("name"):
                names.add(s["name"])
        existing = [
            sr["id"] for sr in (r.get("sourceRecords") or [])
            if sr.get("source") == "existing" and sr.get("id")
        ]
        if r.get("existingSlug"):
            existing.append(r["existingSlug"])
        rec = {
            "i": idx,
            "key": r["key"],
            "displayName": r.get("displayName") or r["key"],
            "chemblId": r.get("chemblId"),
            "unii": r.get("unii"),
            "rxcui": r.get("rxcui"),
            "existing": sorted(set(existing)),
            "isBiologic": bool(r.get("isBiologic")),
            "isCombination": bool(r.get("isCombination")),
        }
        records.append(rec)
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

N = len(records)
print(f"      {N} canonical records", flush=True)

# per-record observation accumulators
obs = [dict(
    atc=set(), routes=set(), dea=set(), dosage_forms=set(), product_types=set(),
    label_declared=False, boxed_present=False, boxed_terms=set(), boxed_snip=None,
    teratogen=set(), rems=None, cytotoxic=None, withdrawn=[], any_source=set(),
    chembl_bbw=False, ema_status=set(), entity_class=None, abuse_text=False,
) for _ in range(N)]


def touch(idx, source):
    obs[idx]["any_source"].add(source)


def match(unii=None, rxcui=None, names=(), allow_stripped=True):
    """Resolve an external record onto canonical indexes. Identifier joins win; name
    joins are used only when they are unambiguous enough to be safe."""
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


# ---------------------------------------------------------------- ChEMBL molecules

print("[2/9] ChEMBL molecules (ATC, black box, withdrawn, route flags)", flush=True)
import glob

for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "molecules-*.json"))):
    for m in json.load(open(f, encoding="utf-8"))["molecules"]:
        cid = m.get("molecule_chembl_id")
        idxs = by_chembl.get(cid, set())
        if not idxs and m.get("pref_name"):
            idxs = match(names=[m["pref_name"]])
        if not idxs:
            continue
        atcs = [a for a in (m.get("atc_classifications") or []) if a]
        for i in idxs:
            o = obs[i]
            if atcs:
                o["atc"] |= set(atcs)
                touch(i, "chembl:atc")
            if m.get("black_box_warning"):
                o["chembl_bbw"] = True
                touch(i, "chembl:black_box_warning")
            if m.get("withdrawn_flag"):
                o["withdrawn"].append(("ChEMBL molecule withdrawn_flag", cid))
                touch(i, "chembl:withdrawn_flag")
            if m.get("parenteral"):
                o["routes"].add("PARENTERAL")
            if m.get("oral"):
                o["routes"].add("ORAL")
            if m.get("topical"):
                o["routes"].add("TOPICAL")
            if m.get("oral") or m.get("parenteral") or m.get("topical"):
                touch(i, "chembl:route_flags")

# ---------------------------------------------------------------- ChEMBL drug_warning

print("[3/9] ChEMBL drug_warning", flush=True)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "warning-*.json"))):
    for w in json.load(open(f, encoding="utf-8"))["drug_warnings"]:
        idxs = set()
        for cid in (w.get("molecule_chembl_id"), w.get("parent_molecule_chembl_id")):
            if cid:
                idxs |= by_chembl.get(cid, set())
        if not idxs:
            continue
        wtype = w.get("warning_type")
        wclass = w.get("warning_class")
        for i in idxs:
            o = obs[i]
            touch(i, "chembl:drug_warning")
            if wtype == "Withdrawn":
                o["withdrawn"].append((
                    f"ChEMBL drug_warning Withdrawn ({wclass or 'reason not recorded'}; "
                    f"{w.get('warning_country') or 'country not recorded'}"
                    f"{'; ' + str(w.get('warning_year')) if w.get('warning_year') else ''})",
                    w.get("molecule_chembl_id"),
                ))
            if wtype == "Black Box Warning":
                o["chembl_bbw"] = True
            if wclass == "teratogenicity":
                o["teratogen"].add(
                    f"ChEMBL drug_warning toxicity class teratogenicity ({wtype})")

# ---------------------------------------------------------------- Open Targets drug_warning

print("[4/9] Open Targets drug_warning", flush=True)
try:
    import duckdb

    con = duckdb.connect()
    rows = con.execute(
        "select chemblIds, warningType, toxicityClass, country, year, description "
        "from read_parquet('%s')" %
        D("data", "corpus-20k", "raw", "open-targets", "drug_warning", "*.parquet")
    ).fetchall()
    for chembl_ids, wtype, tox, country, year, desc in rows:
        idxs = set()
        for cid in (chembl_ids or []):
            idxs |= by_chembl.get(cid, set())
        if not idxs:
            continue
        for i in idxs:
            o = obs[i]
            touch(i, "opentargets:drug_warning")
            if wtype == "Withdrawn":
                o["withdrawn"].append((
                    f"Open Targets drug_warning Withdrawn ({tox or 'reason not recorded'}; "
                    f"{country or 'country not recorded'}"
                    f"{'; ' + str(year) if year else ''})", ",".join(chembl_ids or [])))
            if wtype == "Black Box Warning":
                o["chembl_bbw"] = True
            if tox == "teratogenicity":
                o["teratogen"].add(
                    f"Open Targets drug_warning toxicity class teratogenicity ({wtype})")
    ot_warning_rows = len(rows)
except Exception as exc:  # pragma: no cover
    ot_warning_rows = 0
    print("      Open Targets drug_warning unreadable:", exc, flush=True)

# ---------------------------------------------------------------- EMA

print("[5/9] EMA Medicine.csv (ATC, suspension/revocation)", flush=True)
ema_rows = 0
with open(D("data", "corpus-20k", "raw", "ema", "Medicine.csv"), encoding="utf-8-sig",
          newline="") as fh:
    for row in csv.DictReader(fh):
        if (row.get("Category") or "").strip() != "Human":
            continue
        ema_rows += 1
        names = []
        for col in ("International non-proprietary name (INN) / common name", "Active substance",
                    "Name of medicine"):
            v = (row.get(col) or "").strip()
            if v:
                for piece in re.split(r"[\n;,/]+", v):
                    piece = piece.strip()
                    if piece:
                        names.append(piece)
        idxs = match(names=names)
        if not idxs:
            continue
        atc_raw = (row.get("ATC code (human)") or "").strip()
        atcs = [a.strip().upper() for a in re.split(r"[\s,;]+", atc_raw) if len(a.strip()) >= 3]
        status = (row.get("Medicine status") or "").strip()
        for i in idxs:
            o = obs[i]
            if atcs:
                o["atc"] |= set(atcs)
                touch(i, "ema:atc")
            if status:
                o["ema_status"].add(status)
                touch(i, "ema:status")
            if status in ("Suspended", "Revoked"):
                o["withdrawn"].append((f"EMA marketing authorisation {status.lower()}",
                                       row.get("EMA product number")))

# ---------------------------------------------------------------- openFDA NDC

print("[6/9] openFDA NDC archive (dea_schedule, route, product type, dosage form)", flush=True)
ndc = json.load(open(I("openfda", "drug-ndc-0001-of-0001.json"), encoding="utf-8"))["results"]
ndc_matched = 0
for p in ndc:
    ings = p.get("active_ingredients") or []
    single = len(ings) == 1
    of = p.get("openfda") or {}
    names = []
    if single and ings[0].get("name"):
        names.append(ings[0]["name"])
    if p.get("generic_name"):
        names.append(p["generic_name"])
    idxs = match(unii=of.get("unii"), rxcui=None, names=names)
    if not idxs:
        continue
    ndc_matched += 1
    routes = [r.upper() for r in (p.get("route") or []) if r]
    dea = p.get("dea_schedule")
    ptype = p.get("product_type")
    dform = (p.get("dosage_form") or "").upper()
    # openfda.unii on an NDC product can list UNIIs beyond the product's own active
    # ingredients (the SPL set may cover a combination), which would attach a schedule to the
    # wrong substance. Schedule, product type and dosage form therefore use a strict join:
    # a single active ingredient, and a UNII only when the product declares exactly one.
    strict = set()
    if single:
        strict_unii = (of.get("unii") or [None])[0] if len(of.get("unii") or []) == 1 else None
        strict = match(unii=strict_unii, names=names)
    for i in idxs:
        o = obs[i]
        if routes:
            o["routes"] |= set(routes)
            touch(i, "openfda-ndc:route")
    for i in strict:
        o = obs[i]
        if dform:
            o["dosage_forms"].add(dform)
        if dea:
            o["dea"].add(dea)
            touch(i, "openfda-ndc:dea_schedule")
        if ptype:
            o["product_types"].add(ptype)
            touch(i, "openfda-ndc:product_type")
del ndc

# ---------------------------------------------------------------- label sections index

print("[7/9] openFDA label sections index (product type, boxed-warning presence)", flush=True)
si = json.load(open(I("label-sections-index.json"), encoding="utf-8"))
for e in si["entries"]:
    if int(e.get("declared") or 0) != 1:
        continue
    idxs = match(names=e.get("names") or [])
    if not idxs:
        continue
    secs = set(e.get("sections") or [])
    ptypes = set(e.get("productTypes") or [])
    for i in idxs:
        o = obs[i]
        o["label_declared"] = True
        touch(i, "openfda-label:section-index")
        if ptypes:
            o["product_types"] |= ptypes
        if "boxed_warning" in secs:
            o["boxed_present"] = True
del si

# ---------------------------------------------------------------- label text

print("[8/9] openFDA label index text (boxed warning, teratogenicity, REMS, cytotoxic, routes)",
      flush=True)

BOXED_TERMS = [
    ("death or fatality", re.compile(r"\bdeaths?\b|\bfatal|\bfatalit", re.I)),
    ("respiratory depression", re.compile(r"respiratory depression", re.I)),
    ("addiction, abuse or misuse", re.compile(r"\baddiction\b|\babuse\b|\bmisuse\b|\bdependence\b", re.I)),
    ("suicidality", re.compile(r"suicidal|suicidality|suicide", re.I)),
    ("embryo-fetal toxicity", re.compile(r"embryo[- ]?fetal|fetal harm|fetal toxicity|teratogen", re.I)),
    ("serious infections", re.compile(r"serious infection", re.I)),
    ("malignancy", re.compile(r"malignanc|lymphoma|\bcancers?\b", re.I)),
    ("cardiovascular death", re.compile(r"cardiovascular death|cardiac death|cardiovascular thrombotic", re.I)),
    ("hepatotoxicity requiring monitoring", re.compile(r"hepatotoxic|hepatic failure|liver failure|hepatic injury|liver injury", re.I)),
    ("QT prolongation or torsades", re.compile(r"\bqt\b|qtc|torsade", re.I)),
    ("agranulocytosis", re.compile(r"agranulocytosis|neutropenia", re.I)),
    ("lactic acidosis", re.compile(r"lactic acidosis", re.I)),
]
# S3 reads only the sections the spec names (boxed warning, "Warnings and Precautions"), and only
# embryo-fetal toxicity language. The bare word "teratogenic" is excluded: in older labels it is a
# subheading ("Teratogenic Effects: Pregnancy Category C") that does not itself suppress.
RE_TERATO = re.compile(
    r"embryo[- ]?fetal toxicity|can cause fetal harm|may cause fetal harm|"
    r"will cause fetal harm|\bfetal toxicity\b", re.I)
RE_CATX = re.compile(r"pregnancy category\s*:?\s*x\b", re.I)
RE_REMS = re.compile(r"\bREMS\b|Risk Evaluation and Mitigation", re.I)
RE_CYTOTOX = re.compile(r"cytotoxic", re.I)
RE_MEDGUIDE_ONLY = re.compile(r"medication guide", re.I)

TEXT_SECTIONS = ("boxed_warning", "warnings_and_cautions", "pregnancy",
                 "use_in_specific_populations", "drug_abuse_and_dependence", "description",
                 "dosage_forms_and_strengths", "how_supplied")

label_lines = 0
label_matched = 0
with open(I("label-index.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        label_lines += 1
        if label_lines % 20000 == 0:
            print(f"      {label_lines} labels read", flush=True)
        e = json.loads(line)
        declared_single = int(e.get("declaredSubstanceCount") or 0) == 1
        names = list(e.get("substanceNames") or []) + list(e.get("genericNames") or [])
        idxs = match(unii=e.get("unii"), rxcui=e.get("rxcui"), names=names)
        if not idxs:
            continue
        label_matched += 1
        routes = [r.upper() for r in (e.get("routes") or []) if r]
        secs = e.get("sections") or {}
        boxed = secs.get("boxed_warning") or ""
        blob = " ".join(secs.get(k) or "" for k in TEXT_SECTIONS)
        terms = set()
        if boxed:
            for label, rx in BOXED_TERMS:
                if rx.search(boxed):
                    terms.add(label)
        wc_text = secs.get("warnings_and_cautions") or ""
        terato = RE_TERATO.search(boxed) or RE_TERATO.search(wc_text)
        catx = RE_CATX.search(
            boxed + " " + wc_text + " " + (secs.get("pregnancy") or "") + " " +
            (secs.get("use_in_specific_populations") or ""))
        rems = RE_REMS.search(blob)
        cyto = RE_CYTOTOX.search(blob)
        abuse = bool(secs.get("drug_abuse_and_dependence"))
        for i in idxs:
            o = obs[i]
            if routes:
                o["routes"] |= set(routes)
                touch(i, "openfda-label:route")
            if not declared_single:
                continue
            o["label_declared"] = True
            touch(i, "openfda-label:text")
            if abuse:
                o["abuse_text"] = True
            if boxed:
                o["boxed_present"] = True
                o["boxed_terms"] |= terms
                if o["boxed_snip"] is None:
                    o["boxed_snip"] = re.sub(r"\s+", " ", boxed)[:200]
            if terato:
                o["teratogen"].add(
                    "openFDA label boxed warning or warnings and precautions: " +
                    re.sub(r"\s+", " ", terato.group(0)).lower()[:80])
            if catx:
                o["teratogen"].add("openFDA label text: former FDA pregnancy category X")
            if rems and o["rems"] is None:
                o["rems"] = "openFDA label text mentions " + rems.group(0)
            if cyto and o["cytotoxic"] is None:
                o["cytotoxic"] = 'openFDA label text contains "cytotoxic"'

print(f"      {label_lines} labels read, {label_matched} joined", flush=True)

# ---------------------------------------------------------------- database entity classes

print("[9/9] database entity classes and product context", flush=True)
slug_class = {}
with open(D("data", "corpus-20k", "suppression", "db-entity-classes.tsv"), encoding="utf-8") as fh:
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2 and parts[1]:
            slug_class[parts[0]] = parts[1]

for i, r in enumerate(records):
    for slug in r["existing"]:
        ec = slug_class.get(slug)
        if ec:
            obs[i]["entity_class"] = ec
            touch(i, "database:entity_class")
            break

# ---------------------------------------------------------------- teratogenic REMS roster

TERATO_REMS_NAMES = {
    "isotretinoin", "thalidomide", "lenalidomide", "pomalidomide", "mycophenolate mofetil",
    "mycophenolic acid", "mycophenolate", "bosentan", "ambrisentan", "macitentan", "riociguat",
    "acitretin", "vismodegib", "sonidegib", "lenalidomide hydrochloride",
}

# ---------------------------------------------------------------- ATC prefix tests

S1_PREFIXES = [
    ("L01", "antineoplastic"),
    ("L04", "immunosuppressant"),
    ("N01A", "general anaesthetic"),
    ("N02A", "opioid analgesic"),
    ("M01C", "specific antirheumatic (gold, penicillamine)"),
    ("V10", "therapeutic radiopharmaceutical"),
    ("J06", "immune sera and immunoglobulin"),
    ("B01AB", "parenteral heparin anticoagulant"),
    ("B01AE", "direct thrombin inhibitor"),
    ("C01A", "cardiac glycoside"),
    ("C01B", "class I/III antiarrhythmic"),
    ("A16AB", "enzyme replacement"),
    ("L03AA", "colony-stimulating factor"),
    ("G03XB", "antiprogestogen (mifepristone)"),
]
H01_PREFIX = "H01"

MONITORED_ROUTES = {
    "INTRAVENOUS", "INTRATHECAL", "INTRA-ARTERIAL", "INTRAARTERIAL", "EPIDURAL",
    "INTRAVITREAL", "INTRACARDIAC", "INFUSION", "INTRAVENOUS DRIP", "INTRACAVERNOUS",
    "INTRAVENTRICULAR", "INTRACAUDAL", "PERFUSION, CARDIAC",
}
INJECTABLE_ROUTES = {
    "INTRAVENOUS", "INTRAMUSCULAR", "SUBCUTANEOUS", "INTRA-ARTICULAR", "INTRATHECAL",
    "INTRALESIONAL", "INTRADERMAL", "EPIDURAL", "PARENTERAL", "INFUSION", "INTRA-ARTERIAL",
}
DEPOT_ESTERS = re.compile(
    r"decanoate|palmitate|pamoate|enanthate|lauroxil|undecanoate|cypionate|propionate|"
    r"acetonide|hexanoate|monohydrate depot", re.I)
DEPOT_FORMS = re.compile(r"EXTENDED[- ]RELEASE|IMPLANT", re.I)

# ---------------------------------------------------------------- evaluate

print("evaluating tests", flush=True)
TESTS = [f"S{n}" for n in range(1, 12)]
counts = {t: 0 for t in TESTS}
examples = {t: [] for t in TESTS}
out_path = os.path.join(OUT_DIR, "assignments.ndjson")
suppressed_total = 0
unknown_total = 0
cleared_total = 0

longevity_broad = set()
with open(D("data", "biohacker-pivot", "phase1-records.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        d = json.loads(line)
        if (d.get("thresholds") or {}).get("broad"):
            longevity_broad.add(d["slug"])
suppressed_in_longevity = []

with open(out_path, "w", encoding="utf-8") as out:
    for i, r in enumerate(records):
        o = obs[i]
        atc = sorted(o["atc"])
        routes = set(o["routes"])
        classes = []
        evidence = []

        def hit(test, source, value):
            if test not in classes:
                classes.append(test)
            evidence.append({"test": test, "source": source, "value": value})

        # -- S1 ATC class
        for code in atc:
            for pref, meaning in S1_PREFIXES:
                if code.startswith(pref):
                    hit("S1", "WHO ATC via ChEMBL/EMA", f"{code} ({meaning})")
                    break
            if code.startswith(H01_PREFIX) and (routes & INJECTABLE_ROUTES):
                # the spec scopes H01 to hormones "given parenterally": positive route evidence
                # is required, an absent route is not read as parenteral
                hit("S1", "WHO ATC via ChEMBL/EMA",
                    f"{code} (pituitary/hypothalamic hormone; recorded parenteral route "
                    f"{', '.join(sorted(routes & INJECTABLE_ROUTES))})")

        # -- S2 controlled substance schedule (DEA only; MHRA/HSA not fetched)
        for s in sorted(o["dea"]):
            if s in ("CI", "CII"):
                hit("S2", "openFDA NDC dea_schedule", s)

        # -- S3 teratogenicity
        for t in sorted(o["teratogen"]):
            hit("S3", "openFDA label text / drug_warning toxicity class", t)
        nm = strip_salt(norm(r["displayName"]))
        if nm in TERATO_REMS_NAMES:
            hit("S3", "pregnancy-prevention REMS roster named in the R2 spec", r["displayName"])

        # -- S4 cytotoxic / hazardous (NIOSH list not fetched)
        for code in atc:
            if code.startswith("L01"):
                hit("S4", "WHO ATC L01 (NIOSH list not fetched)", code)
                break
        if o["cytotoxic"]:
            hit("S4", "openFDA label text (NIOSH list not fetched)", o["cytotoxic"])

        # -- S5 REMS (no cleared bulk REMS list; label text only)
        if o["rems"]:
            hit("S5", "openFDA label text (no cleared bulk FDA REMS list)", o["rems"])

        # -- S6 boxed warning naming a listed harm
        if o["boxed_present"] and o["boxed_terms"]:
            hit("S6", "openFDA label boxed_warning",
                "; ".join(sorted(o["boxed_terms"]))[:300])

        # -- S7 route requiring monitored administration
        if routes and routes <= MONITORED_ROUTES:
            hit("S7", "openFDA label/NDC route", ", ".join(sorted(routes)))
        for code in atc:
            if code.startswith("M03A"):
                hit("S7", "WHO ATC M03A (neuromuscular blocker)", code)
                break

        # -- S8 withdrawn for safety
        seen_w = set()
        for text, ref in o["withdrawn"]:
            if text in seen_w:
                continue
            seen_w.add(text)
            hit("S8", "ChEMBL / Open Targets drug_warning, EMA register", text)

        # -- S9 depot antipsychotics, insulin, injectable hormones
        forms = " ".join(sorted(o["dosage_forms"]))
        depot_name = bool(DEPOT_ESTERS.search(r["displayName"] or ""))
        depot_form = bool(DEPOT_FORMS.search(forms)) and bool(routes & INJECTABLE_ROUTES)
        for code in atc:
            if code.startswith("N05A") and (depot_name or depot_form):
                hit("S9", "WHO ATC N05A with a depot form",
                    f"{code}; {'depot ester in the recorded name' if depot_name else 'extended-release injectable form: ' + forms[:120]}")
                break
        for code in atc:
            if code.startswith("A10A"):
                hit("S9", "WHO ATC A10A (insulin)", code)
                break
        # the spec exempts oral corticosteroids and oral androgens from S9, so a recorded oral
        # route blocks the H02/G03B branch
        injectable_not_oral = bool(routes & INJECTABLE_ROUTES) and "ORAL" not in routes
        if injectable_not_oral:
            for code in atc:
                if code.startswith("H02"):
                    hit("S9", "WHO ATC H02, injectable route and no recorded oral route",
                        f"{code}; {', '.join(sorted(routes & INJECTABLE_ROUTES))}")
                    break
        if injectable_not_oral or depot_name:
            for code in atc:
                if code.startswith("G03B"):
                    hit("S9", "WHO ATC G03B, injectable ester or injectable-only route",
                        f"{code}; {'depot ester in the recorded name' if depot_name else ', '.join(sorted(routes & INJECTABLE_ROUTES))}")
                    break

        suppressing = [c for c in classes if c in
                       ("S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9")]

        # -- S11 positively cleared
        cleared_reason = None
        ec = o["entity_class"]
        if not suppressing:
            if ec in ("SUPPLEMENT_INGREDIENT", "BOTANICAL_OR_ORGANISM_PREPARATION",
                      "MARKETED_PRODUCT_INGREDIENT"):
                cleared_reason = f"database entity class {ec}"
            elif "HUMAN OTC DRUG" in o["product_types"] and not o["boxed_present"]:
                cleared_reason = "openFDA product type HUMAN OTC DRUG with no boxed warning"
            elif o["label_declared"]:
                cleared_reason = "openFDA label present and no S1-S9 test matched"
        if cleared_reason:
            hit("S11", "database entity class / openFDA label", cleared_reason)

        # -- S10 unknown
        unknown = False
        if not suppressing and not cleared_reason:
            if not o["any_source"]:
                unknown = True
                hit("S10", "no S1-S9 source returned a value",
                    "no ATC, schedule, label, warning or register record joined to this key")
            else:
                # a source answered and nothing suppressed: cleared by the same reading of S10
                hit("S11", "S1-S9 sources answered and none matched",
                    "observations from: " + ", ".join(sorted(o["any_source"]))[:300])
                cleared_reason = "S1-S9 sources answered and none matched"

        suppressed = bool(suppressing) or unknown
        if suppressed:
            suppressed_total += 1
        if unknown:
            unknown_total += 1
        if not suppressed:
            cleared_total += 1

        for t in classes:
            counts[t] += 1
            if len(examples[t]) < 25:
                examples[t].append(r["displayName"])

        if suppressed:
            for slug in r["existing"]:
                if slug in longevity_broad:
                    suppressed_in_longevity.append({
                        "slug": slug, "key": r["key"], "displayName": r["displayName"],
                        "classes": classes,
                    })
                    break

        out.write(json.dumps({
            "key": r["key"],
            "displayName": r["displayName"],
            "suppressed": suppressed,
            "classes": classes,
            "evidence": evidence,
            "unknown": unknown,
        }, ensure_ascii=False) + "\n")

print(f"      wrote {out_path}", flush=True)

summary = {
    "schema": "rnawiki-corpus-20k-suppression/v1",
    "spec": "docs/specs/suppression-classes.md",
    "input": "data/corpus-20k/identity/canonical.ndjson",
    "totalRecords": N,
    "distinctSuppressed": suppressed_total,
    "unknown": unknown_total,
    "cleared": cleared_total,
    "byTest": {t: {"matched": counts[t], "examples": examples[t]} for t in TESTS},
    "sourceLimits": {
        "S2": "Only the DEA schedule is available (openFDA NDC dea_schedule, single-ingredient "
              "products). MHRA Misuse of Drugs and HSA Misuse of Drugs Act schedules were not "
              "fetched, so UK and Singapore control status contributes nothing to S2.",
        "S4": "The NIOSH hazardous-drug list was not fetched (no cleared bulk source). S4 rests "
              "on WHO ATC L01 and on openFDA label text containing \"cytotoxic\".",
        "S5": "There is no cleared bulk FDA REMS list. S5 rests on openFDA label text mentioning "
              "\"REMS\" or \"Risk Evaluation and Mitigation\", so it cannot distinguish a "
              "medication-guide-only REMS from a restricted-distribution REMS and will over-match.",
        "S8": "EMA Medicine.csv records a status but no reason, so only Suspended and Revoked are "
              "read as safety actions. The reasoned withdrawal signal comes from ChEMBL and Open "
              "Targets drug_warning (warningType \"Withdrawn\", carrying a toxicity class) and "
              "from the ChEMBL molecule withdrawn_flag. Health Canada DPD records "
              "CANCELLED POST MARKET without a reason and is not used for S8.",
        "openTargets": "Open Targets 26.06 drug_molecule carries no blackBoxWarning or "
                       "hasBeenWithdrawn column; those facts are read from Open Targets "
                       "drug_warning and the ChEMBL molecule black_box_warning field.",
        "S10": "S10 fires only when no S1-S9 source returned any observation for the key. A key "
               "where a source answered and no test matched is cleared under S11.",
    },
    "diagnostics": {
        "keysWithAnyObservation": sum(1 for o in obs if o["any_source"]),
        "keysWithLabel": sum(1 for o in obs if o["label_declared"]),
        "keysWithAtc": sum(1 for o in obs if o["atc"]),
        "keysWithBoxedWarning": sum(1 for o in obs if o["boxed_present"]),
        "keysWithDeaSchedule": sum(1 for o in obs if o["dea"]),
        "keysWithRoutes": sum(1 for o in obs if o["routes"]),
        "unknownWithChemblId": sum(
            1 for i, r in enumerate(records)
            if not obs[i]["any_source"] and r["chemblId"]),
        "unknownWithExistingSlug": sum(
            1 for i, r in enumerate(records)
            if not obs[i]["any_source"] and r["existing"]),
    },
    "sourcesRead": {
        "chemblMolecules": len(glob.glob(D("data", "corpus-20k", "raw", "chembl", "molecules-*.json"))),
        "chemblWarningFiles": len(glob.glob(D("data", "corpus-20k", "raw", "chembl", "warning-*.json"))),
        "openTargetsDrugWarningRows": ot_warning_rows,
        "emaHumanRows": ema_rows,
        "openfdaNdcMatchedProducts": ndc_matched,
        "openfdaLabelsRead": label_lines,
        "openfdaLabelsJoined": label_matched,
        "databaseEntityClasses": len(slug_class),
    },
    "longevityBroad803": {
        "sliceSize": len(longevity_broad),
        "suppressedCount": len(suppressed_in_longevity),
        "suppressed": sorted(suppressed_in_longevity, key=lambda x: x["slug"]),
    },
}
with open(os.path.join(OUT_DIR, "summary.json"), "w", encoding="utf-8") as fh:
    json.dump(summary, fh, ensure_ascii=False, indent=1)

print(json.dumps({
    "total": N, "suppressed": suppressed_total, "unknown": unknown_total,
    "cleared": cleared_total,
    "byTest": {t: counts[t] for t in TESTS},
    "suppressedInLongevity803": len(suppressed_in_longevity),
}))
