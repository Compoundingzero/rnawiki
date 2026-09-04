#!/usr/bin/env python
"""Phase 2 step `model-assignment` — apply docs/specs/field-models.md "Assignment".

Every record gets exactly one of LONGEVITY, CLINICAL, DEVELOPMENT, with the reasons that put it
there. Nothing is judged: each reason names the source that stated it.

Source limits carried into summary.json:
  - The NIA ITP lifespan workbooks label a cohort arm with a short code ("Rapa", "ACA"), not an
    agent name. The code-to-agent legend is read from the cached JAX MPD ITP project page
    (data/corpus-20k/legal/terms/jax-itp-project.html), which prints "rapamycin (Rapa)" beside the
    cohort and dose. Codes the legend does not print are resolved only when the same cohort and the
    same printed dose identify exactly one legend row; anything left over is reported unmapped.
  - ChEMBL mechanism records carry a target ChEMBL id but no gene symbol. Symbols come from Open
    Targets drug_mechanism_of_action joined to the Open Targets target table.
  - Health Canada records a product status, not a withdrawal reason, except where the status text
    itself states one ("CANCELLED (SAFETY ISSUE)").
"""

from __future__ import annotations

import csv
import glob
import html
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
D = lambda *p: os.path.join(ROOT, *p)
I = lambda *p: os.path.join(INGEST, *p)
OUT_DIR = os.environ.get("MODEL_OUT_DIR") or D("data", "corpus-20k", "tiers")
os.makedirs(OUT_DIR, exist_ok=True)

# Phase 2b recut (driven by scripts/corpus-20k/fields/augment.py). With RECUT_AGE_RELATED_ONLY=1 a
# page whose only ageing-lexicon evidence is the bare term "age-related" no longer takes LONGEVITY:
# an age-related condition (age-related macular degeneration) is not longevity work. Every other
# reason, and every recorded detail string, is untouched, so the file differs only where that one
# reason was a page's whole case for the model.
RECUT_AGE_RELATED_ONLY = os.environ.get("RECUT_AGE_RELATED_ONLY") == "1"
AGE_RELATED_ONLY_DETAIL = re.compile(r"\(terms: age-related\)$")

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
# Names recorded as an identity, not as collected free text. The `common` synonym kind carries
# whatever a source once printed near the record ("everolimus" and "mtor inhibitors" both sit under
# sirolimus), so a name join on it attributes one register entry to the wrong compound.
SAFE_KINDS = {"display", "inn", "usan", "ban", "jan", "brand", "salt", "code"}
by_safe = defaultdict(set)
by_collapsed = defaultdict(set)
by_key = {}
slug_to_index = {}

with open(D("data", "corpus-20k", "identity", "canonical.ndjson"), encoding="utf-8") as fh:
    for idx, line in enumerate(fh):
        r = json.loads(line)
        names = set()
        safe_names = set()
        if r.get("displayName"):
            names.add(r["displayName"])
            safe_names.add(r["displayName"])
        for syn in r.get("synonyms") or []:
            if syn.get("name"):
                names.add(syn["name"])
                if syn.get("kind") in SAFE_KINDS:
                    safe_names.add(syn["name"])
        existing = [
            sr["id"] for sr in (r.get("sourceRecords") or [])
            if sr.get("source") == "existing" and sr.get("id")
        ]
        if r.get("existingSlug"):
            existing.append(r["existingSlug"])
        rec = {
            "i": idx, "key": r["key"], "displayName": r.get("displayName") or r["key"],
            "chemblId": r.get("chemblId"), "unii": r.get("unii"), "rxcui": r.get("rxcui"),
            "existing": sorted(set(existing)),
            "isBiologic": bool(r.get("isBiologic")),
            "hasStructure": bool(r.get("structure")),
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
                by_collapsed[n.replace(" ", "")].add(idx)

N = len(records)
print(f"      {N} canonical records", flush=True)

with open(D("data", "corpus-20k", "reconciliation", "matched.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        m = json.loads(line)
        i = by_key.get(m["key"])
        if i is None:
            continue
        for slug in (m.get("existingSlugs") or []) + ([m["pageSlug"]] if m.get("pageSlug") else []):
            slug_to_index.setdefault(slug, i)


def match(unii=None, rxcui=None, names=(), allow_stripped=True):
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


reasons = [[] for _ in range(N)]          # (bucket, code, detail)
withdrawn = [[] for _ in range(N)]        # (source, reason or None)


def add(i, bucket, code, detail):
    reasons[i].append((bucket, code, detail))


# ---------------------------------------------------------------- LONGEVITY A: broad slice

print("[2/9] broad longevity slice", flush=True)
broad_total = 0
broad_mapped = 0
broad_unmapped = []
with open(D("data", "biohacker-pivot", "phase1-records.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        d = json.loads(line)
        if not (d.get("thresholds") or {}).get("broad"):
            continue
        broad_total += 1
        i = slug_to_index.get(d["slug"])
        if i is None:
            hit = match(names=[d.get("name") or "", d["slug"].replace("-", " ")])
            i = min(hit) if len(hit) == 1 else None
        if i is None:
            broad_unmapped.append(d["slug"])
            continue
        broad_mapped += 1
        add(i, "LONGEVITY", "broad-slice", f"biohacker phase 1 broad slice: {d['slug']}")
print(f"      {broad_mapped}/{broad_total} broad slugs mapped to a canonical key", flush=True)

# ---------------------------------------------------------------- LONGEVITY B: NIA ITP

print("[3/9] NIA ITP lifespan cohorts", flush=True)
page = open(D("data", "corpus-20k", "legal", "terms", "jax-itp-project.html"),
            encoding="utf-8", errors="replace").read()
ROW = re.compile(
    r"<td>\s*([^<>]{2,120}?)\s*<nobr>\(([^)]{1,40})\)</nobr>\s*</td>\s*"
    r"<td>.*?>(C\d{4})<.*?</td>\s*<td>\s*([^<]{0,120}?)\s*</td>",
    re.S)
legend = {}          # lower code -> agent name
legend_rows = []     # (code, name, cohort, dose text)
for m in ROW.finditer(page):
    name = html.unescape(m.group(1)).strip()
    code = html.unescape(m.group(2)).strip()
    legend.setdefault(code.lower(), name)
    legend_rows.append((code, name, m.group(3), html.unescape(m.group(4)).strip()))
print(f"      {len(legend)} agent codes read from the cached ITP project page", flush=True)

import pandas as pd  # noqa: E402

QUALIFIER = re.compile(r"_(?:hi|lo|mid|on|cyc|\d+m?|hi_continuous|hi_cycle|hi_start_stop)$", re.I)
observed = {}  # raw group -> set of (cohort, dose text)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "jax-itp", "ITP_C*_Lifespan*.xlsx"))):
    x = pd.ExcelFile(f)
    for sheet in x.sheet_names:
        df = x.parse(sheet)
        if "group" not in df.columns:
            continue
        dose_col = "dose" if "dose" in df.columns else ("Rx(ppm)" if "Rx(ppm)" in df.columns else None)
        cohort_col = "cohort" if "cohort" in df.columns else None
        for _, row in df[[c for c in ("group", dose_col, cohort_col) if c]].drop_duplicates().iterrows():
            g = str(row["group"]).strip()
            if not g or g.lower() in ("nan", "control"):
                continue
            observed.setdefault(g, set()).add(
                (str(row[cohort_col]).strip() if cohort_col else "",
                 str(row[dose_col]).strip() if dose_col else ""))

itp_agent_names = {}   # agent name -> set of raw group codes
itp_unmapped_codes = []
for g, contexts in sorted(observed.items()):
    base = QUALIFIER.sub("", g)
    while base and base.lower() not in legend and "_" in base:
        base = base.rsplit("_", 1)[0]
    name = legend.get(base.lower()) or legend.get(g.lower())
    if not name:
        # Resolve by the cohort and printed dose the project page states for that cohort.
        candidates = set()
        for cohort, dose in contexts:
            digits = set(re.findall(r"\d+", dose))
            for code, agent, row_cohort, row_dose in legend_rows:
                if row_cohort != cohort or not digits:
                    continue
                if digits & set(re.findall(r"\d+", row_dose)):
                    candidates.add(agent)
        if len(candidates) > 1:
            # The workbook code is often the legend code truncated ("TM" for "TM5441"). Keep only
            # candidates whose printed legend code starts with the code the workbook used.
            narrowed = {agent for code, agent, row_cohort, row_dose in legend_rows
                        if agent in candidates and code.lower().startswith(base.lower())}
            if narrowed:
                candidates = narrowed
        if len(candidates) == 1:
            name = candidates.pop()
    if not name:
        itp_unmapped_codes.append(g)
        continue
    itp_agent_names.setdefault(name, set()).add(g)

def name_variants(printed):
    """The ITP page prints greek letters as bare ASCII ("17-a-estradiol", "a-Ketoglutarate") and
    prefixes some agents with a stereo descriptor. Each variant is a rewriting of what the source
    printed, never a different substance."""
    out = [printed]
    greek = re.sub(r"(?<![a-z0-9])a(?=-)", "alpha", printed, flags=re.I)
    greek = re.sub(r"(?<![a-z0-9])b(?=-)", "beta", greek, flags=re.I)
    if greek != printed:
        out.append(greek)
    for variant in list(out):
        stripped = re.sub(r"^\([^)]*\)-?\s*", "", variant).strip()
        if stripped and stripped != variant:
            out.append(stripped)
    return out


def match_agent(printed):
    """Identifier-free name resolution for one ITP agent, safest index first."""
    for variant in name_variants(printed):
        hits = match(names=[variant])
        if hits:
            return hits
    for variant in name_variants(printed):
        collapsed = norm(variant).replace(" ", "")
        hits = by_collapsed.get(collapsed) if len(collapsed) >= 4 else None
        if hits and len(hits) == 1:
            return set(hits)
    return set()


itp_mapped = 0
itp_unmapped_agents = []
for agent, codes in sorted(itp_agent_names.items()):
    parts = re.split(r"\s+plus\s+", agent) if " plus " in agent else [agent]
    hits = set()
    for part in parts:
        hits |= match_agent(part)
    if not hits:
        itp_unmapped_agents.append(agent)
        continue
    itp_mapped += 1
    for i in hits:
        add(i, "LONGEVITY", "nia-itp",
            f"NIA ITP lifespan cohort arm {sorted(codes)} = {agent} (JAX MPD ITP project page)")
for code in itp_unmapped_codes:
    itp_unmapped_agents.append(f"{code} (no agent name printed for this code)")
print(f"      {itp_mapped} ITP agents mapped, {len(itp_unmapped_agents)} unmapped", flush=True)

# ---------------------------------------------------------------- LONGEVITY C: registry lexicon

print("[4/9] registry ageing lexicon", flush=True)
AGEING = re.compile(
    r"\bag(?:e)?ing\b|\blongevity\b|\blifespan\b|\blife span\b|\bhealthspan\b|\bfrailty\b|"
    r"\bsarcopenia\b|\bsenescen\w*|\bsenolytic\w*|\bbiological age\b|\bepigenetic age\b|"
    r"\bage-related\b", re.I)
lex_pages = 0
for f in sorted(glob.glob(D("data", "corpus-20k", "registry", "aggregates", "batch-*.ndjson"))):
    with open(f, encoding="utf-8") as fh:
        for line in fh:
            a = json.loads(line)
            i = by_key.get(a["key"])
            if i is None:
                continue
            terms = set()
            example = None
            for c in a.get("conditions") or []:
                m = AGEING.search(c)
                if m:
                    terms.add(m.group(0).lower())
                    example = example or f'condition "{c}"'
            for o in a.get("primaryOutcomes") or []:
                m = AGEING.search(o.get("measure") or "")
                if m:
                    terms.add(m.group(0).lower())
                    example = example or f'{o["nct"]} primary outcome "{o["measure"]}"'
            if terms:
                lex_pages += 1
                add(i, "LONGEVITY", "registry-ageing-term",
                    f"ClinicalTrials.gov {example} (terms: {', '.join(sorted(terms))})")
print(f"      {lex_pages} pages carry an ageing term in a matched registration", flush=True)

# ---------------------------------------------------------------- LONGEVITY D: pathway

print("[5/9] mechanism pathways", flush=True)
PATHWAY = [
    ("mTOR", re.compile(r"\bmtor\b|\bmechanistic target of rapamycin\b|\bmtorc[12]\b|\bfrap1\b", re.I)),
    ("AMPK", re.compile(r"\bampk\b|\bprkaa[12]?\b|amp-activated protein kinase", re.I)),
    ("sirtuin", re.compile(r"\bsirtuin\b|\bsirt[1-7]\b", re.I)),
    ("senolytic", re.compile(r"\bsenolytic\w*", re.I)),
    ("autophagy", re.compile(r"\bautophag\w*", re.I)),
    ("NAD+", re.compile(r"\bnad\+|\bnampt\b|nicotinamide phosphoribosyltransferase", re.I)),
    ("IGF-1", re.compile(r"\bigf-?1\b|\bigf1r\b|insulin-like growth factor 1", re.I)),
]
pathway_pages = set()


def pathway_hits(text):
    return [name for name, rx in PATHWAY if text and rx.search(text)]


for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "mechanism-*.json"))):
    for mech in json.load(open(f, encoding="utf-8"))["mechanisms"]:
        idxs = set()
        for cid in (mech.get("molecule_chembl_id"), mech.get("parent_molecule_chembl_id")):
            if cid:
                idxs |= by_chembl.get(cid, set())
        if not idxs:
            continue
        text = " ".join(filter(None, [mech.get("mechanism_of_action"), mech.get("mechanism_comment")]))
        hits = pathway_hits(text)
        if not hits:
            continue
        for i in idxs:
            pathway_pages.add(i)
            add(i, "LONGEVITY", "pathway",
                f"ChEMBL mechanism_of_action \"{mech.get('mechanism_of_action')}\" "
                f"({mech.get('molecule_chembl_id')}) names {', '.join(hits)}")

try:
    import duckdb

    con = duckdb.connect()
    symbols = dict(con.execute(
        "select id, approvedSymbol from read_parquet('%s')" %
        D("data", "corpus-20k", "raw", "open-targets", "target", "*.parquet")).fetchall())
    moa = con.execute(
        "select chemblIds, mechanismOfAction, targetName, targets from read_parquet('%s')" %
        D("data", "corpus-20k", "raw", "open-targets", "drug_mechanism_of_action",
          "*.parquet")).fetchall()
    for chembl_ids, mechanism, target_name, targets in moa:
        idxs = set()
        for cid in (chembl_ids or []):
            idxs |= by_chembl.get(cid, set())
        if not idxs:
            continue
        gene_symbols = [symbols.get(t) for t in (targets or []) if symbols.get(t)]
        text = " ".join(filter(None, [mechanism, target_name] + gene_symbols))
        hits = pathway_hits(text)
        if not hits:
            continue
        for i in idxs:
            pathway_pages.add(i)
            add(i, "LONGEVITY", "pathway",
                f"Open Targets mechanism \"{mechanism}\" target {target_name}"
                f"{' [' + ', '.join(gene_symbols) + ']' if gene_symbols else ''} names "
                f"{', '.join(hits)}")
except Exception as exc:  # pragma: no cover
    print("      Open Targets mechanism unreadable:", exc, flush=True)
print(f"      {len(pathway_pages)} pages named an ageing pathway", flush=True)

# ---------------------------------------------------------------- CLINICAL signals

print("[6/9] ChEMBL approval", flush=True)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "molecules-*.json"))):
    for m in json.load(open(f, encoding="utf-8"))["molecules"]:
        cid = m.get("molecule_chembl_id")
        idxs = by_chembl.get(cid, set())
        if not idxs and m.get("pref_name"):
            idxs = match(names=[m["pref_name"]])
        if not idxs:
            continue
        try:
            max_phase = float(m.get("max_phase")) if m.get("max_phase") is not None else None
        except (TypeError, ValueError):
            max_phase = None
        approved = (max_phase == 4.0) or bool(m.get("first_approval"))
        for i in idxs:
            if approved:
                add(i, "CLINICAL", "chembl-approval",
                    f"ChEMBL {cid} max_phase {m.get('max_phase')}"
                    f"{', first_approval ' + str(m['first_approval']) if m.get('first_approval') else ''}")
            if m.get("withdrawn_flag"):
                withdrawn[i].append(("ChEMBL molecule withdrawn_flag", None, cid))

print("[7/9] registers (Drugs@FDA, Orange Book, EMA, Health Canada)", flush=True)
# Per page, the marketing status every register still records for the substance. These sets decide
# the withdrawn flag further down: a register that holds a remaining active, approved or marketed
# entry contradicts a withdrawal claim, whatever another register's status line says.
fda_page_status = defaultdict(set)        # i -> {(marketing status, application number)}
ob_page_status = defaultdict(set)         # i -> {(marketing status, application number)}
daf = json.load(open(I("openfda", "drug-drugsfda-0001-of-0001.json"), encoding="utf-8"))["results"]
for app in daf:
    names, statuses = set(), set()
    for p in app.get("products") or []:
        ings = p.get("active_ingredients") or []
        if len(ings) == 1 and ings[0].get("name"):
            names.add(ings[0]["name"])
        if p.get("marketing_status"):
            statuses.add(p["marketing_status"])
    if not names:
        continue
    idxs = match(names=sorted(names))
    for i in idxs:
        add(i, "CLINICAL", "drugsfda",
            f"Drugs@FDA application {app.get('application_number')} "
            f"({', '.join(sorted(statuses)) or 'marketing status not recorded'})")
    # A product's marketing status belongs to the single active ingredient that product names.
    # Statuses are therefore collected per ingredient, so a combination product in the same
    # application never lends its status to a single-moiety page.
    per_ingredient = defaultdict(set)
    for p in app.get("products") or []:
        ings = p.get("active_ingredients") or []
        if len(ings) != 1 or not ings[0].get("name") or not p.get("marketing_status"):
            continue
        per_ingredient[ings[0]["name"]].add(p["marketing_status"])
    for ingredient, ing_statuses in per_ingredient.items():
        for i in match(names=[ingredient]):
            for s in ing_statuses:
                fda_page_status[i].add((s, str(app.get("application_number") or "")))
del daf

ob = json.load(open(I("openfda", "drug-orangebook-0001-of-0001.json"), encoding="utf-8"))["results"]
for entry in ob:
    for p in entry.get("products") or []:
        ings = p.get("active_ingredients") or []
        if len(ings) != 1 or not ings[0].get("name"):
            continue
        for i in match(names=[ings[0]["name"]]):
            add(i, "CLINICAL", "orange-book",
                f"Orange Book application {p.get('application_number')} "
                f"({p.get('marketing_status') or 'marketing status not recorded'})")
            if p.get("marketing_status"):
                ob_page_status[i].add((p["marketing_status"],
                                       str(p.get("application_number") or "")))
del ob

ema_page_status = defaultdict(set)
hc_page_status = defaultdict(set)
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
                names.extend(p.strip() for p in re.split(r"[\n;,/]+", v) if p.strip())
        idxs = match(names=names)
        if not idxs:
            continue
        status = (row.get("Medicine status") or "").strip()
        number = row.get("EMA product number")
        # A combination product's authorisation is a fact about that product, not about each of
        # its ingredients. Its withdrawal is therefore never carried onto an ingredient page.
        substances = {norm(p) for p in
                      re.split(r"[\n;,/]+", (row.get("Active substance") or ""))
                      if len(norm(p)) >= 4}
        single_substance = len(substances) == 1
        for i in idxs:
            if status in ("Authorised", "Withdrawn", "Suspended", "Revoked", "Expired",
                          "Not authorised", "Refused"):
                if status in ("Authorised", "Withdrawn", "Suspended", "Revoked", "Expired"):
                    add(i, "CLINICAL", "ema",
                        f"EMA {number}: medicine status {status}")
            if single_substance and status:
                ema_page_status[i].add((status, number))

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
hc_seen = 0
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
            idxs = match(names=[base, raw_name])
            if not idxs:
                continue
            hc_seen += 1
            marketed = {s for s in statuses if s.startswith("MARKETED") or s.startswith("CANCELLED")}
            for i in idxs:
                for s in sorted(marketed):
                    add(i, "CLINICAL", "health-canada",
                        f"Health Canada DPD drug code {code}: {s}")
                # Every status this single-substance code carries, not only the marketed and
                # cancelled ones: an APPROVED or DORMANT entry is a remaining entry and has to be
                # visible to the withdrawn rule.
                if hc_ingredient_count.get(code) == 1:
                    for s in sorted(statuses):
                        hc_page_status[i].add((s, code))

print("[8/9] openFDA label product types", flush=True)
si = json.load(open(I("label-sections-index.json"), encoding="utf-8"))
otc_pages = 0
for e in si["entries"]:
    if int(e.get("declared") or 0) != 1:
        continue
    ptypes = {str(p).upper() for p in (e.get("productTypes") or [])}
    if "HUMAN OTC DRUG" not in ptypes:
        continue
    idxs = match(names=e.get("names") or [])
    for i in idxs:
        otc_pages += 1
        add(i, "CLINICAL", "otc-label", "openFDA label product type HUMAN OTC DRUG")
del si

class_map = {}
with open(D("data", "corpus-20k", "suppression", "db-entity-classes.tsv"), encoding="utf-8") as fh:
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2 and parts[1]:
            class_map[parts[0]] = parts[1]
CLINICAL_CLASSES = {"APPROVED_MEDICINE", "APPROVED_BIOLOGIC", "WITHDRAWN_MEDICINE",
                    "OFF_LABEL_OR_COMPOUNDED"}
entity_class_withdrawn = {}
for slug, entity_class in class_map.items():
    i = slug_to_index.get(slug)
    if i is None or entity_class not in CLINICAL_CLASSES:
        continue
    add(i, "CLINICAL", "entity-class", f"RNAWiki entity class {entity_class} ({slug})")
    if entity_class == "WITHDRAWN_MEDICINE":
        entity_class_withdrawn[i] = slug
        withdrawn[i].append(("RNAWiki entity class WITHDRAWN_MEDICINE", None, slug))

# ---------------------------------------------------------------- the withdrawn rule
#
# One product's cancelled licence is not the substance's withdrawal, and one register's silence is
# not the other registers' answer. `withdrawn` is a claim about the substance, so it is set only
# when one of these holds:
#
#   (a) no register we hold still records an active, approved or marketed entry for the moiety —
#       Drugs@FDA: every single-ingredient product's marketing status is Discontinued; Orange Book:
#       every product DISCONTINUED; EMA: no Authorised entry; Health Canada: no MARKETED, APPROVED
#       or interim-order entry — and at least one of them records that it is gone; or
#   (b) a register states a safety withdrawal for it (Health Canada "CANCELLED (SAFETY ISSUE)" is
#       the only status text among the cleared registers that states one); or
#   (c) ChEMBL records `withdrawn_flag`, or a ChEMBL / Open Targets `drug_warning` of type
#       Withdrawn (appended in steps [6/9] and [9/9]; a stated withdrawal, not an absence).
#
# A Drugs@FDA "None (Tentative Approval)" product never reached the market, so it is neither a
# remaining entry nor a withdrawal, exactly as a Health Canada CANCELLED PRE MARKET status is not.
# The RNAWiki entity class WITHDRAWN_MEDICINE (29 legacy records) is kept as its own ground beside
# (b): a person recorded the withdrawal, so it is a stated fact and not an inference from an
# absence. Guarding it behind (a) was tried and dropped 8 records a register still lists as
# marketed although the medicine is withdrawn (ranitidine, terfenadine, diethylstilbestrol,
# telbivudine, simeprevir, stanozolol, nandrolone decanoate, aducanumab-avwa); the register's own
# lag is not evidence that the withdrawal did not happen.
FDA_LIVE_STATUS = {"Prescription", "Over-the-counter"}
FDA_GONE_STATUS = {"Discontinued"}
OB_LIVE_STATUS = {"HUMAN PRESCRIPTION DRUG", "HUMAN OTC DRUG"}
OB_GONE_STATUS = {"DISCONTINUED"}
EMA_LIVE_STATUS = {"Authorised"}
EMA_GONE_STATUS = {"Withdrawn", "Suspended", "Revoked"}
HC_LIVE_PREFIXES = ("MARKETED", "APPROVED", "AUTHORIZED BY INTERIM ORDER", "RESTRICTED ACCESS")

withdrawn_live_registers = defaultdict(set)
for i in set(fda_page_status) | set(ob_page_status) | set(ema_page_status) | set(hc_page_status) \
        | set(entity_class_withdrawn):
    fda = {s for s, _ in fda_page_status.get(i, ())}
    ob_st = {s for s, _ in ob_page_status.get(i, ())}
    ema = {s for s, _ in ema_page_status.get(i, ())}
    hc = {s for s, _ in hc_page_status.get(i, ())}

    live = set()
    if fda & FDA_LIVE_STATUS:
        live.add("Drugs@FDA")
    if ob_st & OB_LIVE_STATUS:
        live.add("Orange Book")
    if ema & EMA_LIVE_STATUS:
        live.add("EMA")
    if any(s.startswith(HC_LIVE_PREFIXES) for s in hc):
        live.add("Health Canada DPD")
    if live:
        withdrawn_live_registers[i] = live

    # (b) a stated safety withdrawal stands whatever else a register still lists
    for s, code in sorted(hc_page_status.get(i, ())):
        if "SAFETY" in s and s.startswith("CANCELLED") and "PRE MARKET" not in s:
            m = re.search(r"\(([^)]+)\)", s)
            reason = m.group(1).title() if m else None
            withdrawn[i].append((f"Health Canada DPD status {s}", reason, code))
            break

    if live:
        continue

    # (a) nothing is left standing in any register; record what each register says is gone
    if fda and fda <= FDA_GONE_STATUS:
        numbers = sorted({n for s, n in fda_page_status[i] if n})[:5]
        withdrawn[i].append((
            "Drugs@FDA: every application for this moiety is Discontinued", None,
            ", ".join(numbers)))
    if ob_st and ob_st <= OB_GONE_STATUS:
        numbers = sorted({n for s, n in ob_page_status[i] if n})[:5]
        withdrawn[i].append((
            "Orange Book: every listed product is DISCONTINUED", None, ", ".join(numbers)))
    for s, number in sorted(ema_page_status.get(i, ())):
        if s in EMA_GONE_STATUS:
            withdrawn[i].append((f"EMA marketing authorisation {s.lower()}", None, number))
            break
    for s, code in sorted(hc_page_status.get(i, ())):
        if s.startswith("CANCELLED") and "PRE MARKET" not in s and "SAFETY" not in s:
            withdrawn[i].append((f"Health Canada DPD status {s}", None, code))
            break

# ---------------------------------------------------------------- withdrawal reasons

print("[9/9] withdrawal reasons", flush=True)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "warning-*.json"))):
    for w in json.load(open(f, encoding="utf-8"))["drug_warnings"]:
        if w.get("warning_type") != "Withdrawn":
            continue
        idxs = set()
        for cid in (w.get("molecule_chembl_id"), w.get("parent_molecule_chembl_id")):
            if cid:
                idxs |= by_chembl.get(cid, set())
        for i in idxs:
            withdrawn[i].append((
                "ChEMBL drug_warning Withdrawn"
                f" ({w.get('warning_country') or 'country not recorded'}"
                f"{'; ' + str(w.get('warning_year')) if w.get('warning_year') else ''})",
                w.get("warning_class") or w.get("warning_description") or None,
                w.get("molecule_chembl_id")))
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
            withdrawn[i].append((
                f"Open Targets drug_warning Withdrawn ({country or 'country not recorded'}"
                f"{'; ' + str(year) if year else ''})", tox or desc or None,
                ",".join(chembl_ids or [])))
except Exception as exc:  # pragma: no cover
    print("      Open Targets drug_warning unreadable:", exc, flush=True)

# ---------------------------------------------------------------- assign

print("assigning models", flush=True)
counts = {"LONGEVITY": 0, "CLINICAL": 0, "DEVELOPMENT": 0}
per_reason = defaultdict(int)
withdrawn_total = 0
withdrawn_with_reason = 0
out_path = os.path.join(OUT_DIR, "model-assignment.ndjson")
with open(out_path, "w", encoding="utf-8") as out:
    for i, rec in enumerate(records):
        effective = reasons[i]
        if RECUT_AGE_RELATED_ONLY:
            effective = [r for r in reasons[i]
                         if not (r[0] == "LONGEVITY" and r[1] == "registry-ageing-term"
                                 and AGE_RELATED_ONLY_DETAIL.search(r[2]))]
        buckets = {b for b, _, _ in effective}
        if "LONGEVITY" in buckets:
            model = "LONGEVITY"
        elif "CLINICAL" in buckets:
            model = "CLINICAL"
        else:
            model = "DEVELOPMENT"
        counts[model] += 1
        by_code = {}
        for b, c, d in reasons[i]:
            if b != model:
                continue
            details = by_code.setdefault(c, [])
            if d not in details and len(details) < 5:
                details.append(d)
        kept = [{"code": c, "detail": by_code[c],
                 "occurrences": sum(1 for b, cc, _ in reasons[i] if b == model and cc == c)}
                for c in sorted(by_code)]
        for c in by_code:
            per_reason[f"{model}/{c}"] += 1
        if model == "DEVELOPMENT":
            per_reason["DEVELOPMENT/no-approval-and-no-longevity-signal"] += 1
        w = withdrawn[i]
        reason_source = None
        if w:
            withdrawn_total += 1
            with_reason = [x for x in w if x[1]]
            if with_reason:
                withdrawn_with_reason += 1
                reason_source = {"source": with_reason[0][0], "reason": with_reason[0][1],
                                 "id": with_reason[0][2]}
            else:
                reason_source = {"source": w[0][0], "reason": None, "id": w[0][2]}
        out.write(json.dumps({
            "key": rec["key"],
            "displayName": rec["displayName"],
            "model": model,
            "reasons": kept,
            "withdrawn": bool(w),
            "withdrawnReasonSource": reason_source,
        }, ensure_ascii=False) + "\n")

summary = {
    "schema": "rnawiki-corpus-20k-model-assignment/v1",
    "spec": "docs/specs/field-models.md",
    "totalRecords": N,
    "counts": counts,
    "perReason": dict(sorted(per_reason.items())),
    "broadSlice": {"records": broad_total, "mapped": broad_mapped,
                   "unmappedSlugs": broad_unmapped},
    "itp": {"legendCodes": len(legend), "agentsMapped": itp_mapped,
            "agentsUnmapped": itp_unmapped_agents,
            "cohortArmCodesSeen": len(observed)},
    "registryAgeingTermPages": lex_pages,
    "pathwayPages": len(pathway_pages),
    "withdrawn": {"total": withdrawn_total, "withStatedReason": withdrawn_with_reason,
                  "withoutStatedReason": withdrawn_total - withdrawn_with_reason,
                  "pagesWithARemainingActiveRegisterEntry": len(withdrawn_live_registers),
                  "rule": ("set only when no cleared register still records an active, approved or "
                           "marketed entry for the moiety and one of them records that it is gone; "
                           "or a register states a safety withdrawal; or ChEMBL records "
                           "withdrawn_flag or a drug_warning of type Withdrawn")},
    "sourceLimits": [
        "The ITP workbooks label an arm with a code; the agent name comes from the cached JAX MPD "
        "ITP project page legend, and codes that legend does not print are reported unmapped.",
        "Health Canada records a status, not a reason, except where the status text states one.",
        "EMA Medicine.csv records a status with no reason.",
        "TGA, PMDA and the WHO consolidated withdrawn list were never cleared, so Australian, "
        "Japanese and WHO withdrawal facts contribute nothing.",
        "A Health Canada CANCELLED PRE MARKET status is recorded as a register fact but does not "
        "set the withdrawn flag: the product never reached the market.",
        "A combination product's withdrawal is never carried onto an ingredient page: the EMA and "
        "Health Canada withdrawal flags are set only from rows naming exactly one active substance.",
        "One cancelled product licence is not the substance's withdrawal, and one register's "
        "silence is not another register's answer. A register's 'no remaining entry' reading sets "
        "the withdrawn flag only when no cleared register (Drugs@FDA, Orange Book, EMA, Health "
        "Canada DPD) still records an active, approved or marketed entry for the moiety. A stated "
        "safety cancellation and a ChEMBL withdrawn_flag or drug_warning of type Withdrawn set it "
        "on their own, because each states the withdrawal rather than inferring it from an absence.",
        "Drugs@FDA and the Orange Book record a marketing status but never a withdrawal reason, "
        "and neither states a safety withdrawal; the FDA's own withdrawn-or-removed list was "
        "unreachable (404 at three URLs), so a US safety withdrawal enters only through ChEMBL or "
        "Open Targets drug_warning.",
        "A Drugs@FDA 'None (Tentative Approval)' product never reached the market: like a Health "
        "Canada CANCELLED PRE MARKET status it is neither a remaining entry nor a withdrawal.",
        "The ageing lexicon is applied exactly as docs/specs/field-models.md words it. The term "
        "\"age-related\" therefore pulls in age-related macular degeneration programmes, which are "
        "age-related conditions rather than longevity work; every such page records the condition "
        "text that matched, so the set can be re-cut without re-running the match.",
    ],
}
with open(os.path.join(OUT_DIR, "summary.json"), "w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2, ensure_ascii=False)
    fh.write("\n")
print(json.dumps({k: v for k, v in summary.items() if k not in ("perReason", "sourceLimits")},
                 ensure_ascii=False)[:3000], flush=True)
