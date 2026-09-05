#!/usr/bin/env python3
"""Phase 2 integration — merge every cleared Phase 2 mapped source onto the corpus field records.

Reads the corpus-20k field batches (`data/corpus-20k/fields/{longevity,clinical,development}/
batch-*.ndjson`), the tier assignment, and every cleared source's `data/sources/<source>/
mapped.parquet`, and writes per-page field records in the SAME schema to `--fields-out`
(default `data/revamp/fields-v2/`), in batches of 1,000 pages per model directory.

Every value a source contributes carries its own provenance object
`{source, source_record_id, source_url, source_date, licence}`, and every field entry carries the
full list of contributing provenance objects under `sources`.

The precedence rules applied here are written out in `docs/specs/field-integration.md`. The two
that decide most of the merge:

  * the existing corpus value is kept, and a new source is added beside it, unless the new source
    is strictly more specific on the ladder recorded for that field;
  * a negative register finding ("not found in the HSA listing as of 2026-08-07", an Inxight
    `interactionFound: false` row, an ARTG status that was never retrieved) is written into the
    value so the page can render it, and never makes the field `present`.

PharmGKB/ClinPGx and CPIC rows are licence-gated: they are written to `--gated-out`
(default `data/revamp/fields-v2-gated/`) as `pgx` entries flagged `licence_gated: true`, and are
excluded from the rendering set and from every presence count until the BLOCKERS decision.

DDInter is never read by this script.

The script is idempotent: it rewrites both output trees from the corpus files and the mapped
parquets on every run, and clears stale batches first.
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import shutil
from collections import defaultdict, Counter
from datetime import date, timezone, datetime
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
FIELDS_DIR = ROOT / "data/corpus-20k/fields"
ASSIGNMENT = ROOT / "data/corpus-20k/tiers/model-assignment.ndjson"
SOURCES_DIR = ROOT / "data/sources"
DEFAULT_OUT = ROOT / "data/revamp/fields-v2"
DEFAULT_GATED_OUT = ROOT / "data/revamp/fields-v2-gated"
SPEC_OUT = ROOT / "docs/specs/field-integration.md"

MODEL_DIRS = ("longevity", "clinical", "development")
MODEL_OF_DIR = {"longevity": "LONGEVITY", "clinical": "CLINICAL", "development": "DEVELOPMENT"}
BATCH_SIZE = 1000
COLS = ["key", "field", "value", "source_record_id", "source_url", "source_date", "licence",
        "match_rule", "form_of_target"]

# text budgets, applied at load so the whole merge fits in memory
SECTION_CHARS = 2000
SENTENCE_CHARS = 600
MAX_SENTENCES = 30

ENZYME_RE = re.compile(
    r"^(CYP|UGT|SULT|NAT[12]|FMO\d|ALDH|ADH\d|MAO|COMT|TPMT|DPYD|GSTP|GSTM|CES\d|CBR|XDH|POR)",
    re.I)
TRANSPORTER_RE = re.compile(
    r"(P-?GP|P-?GLYCOPROTEIN|ABCB1|ABCG2|BCRP|OATP|SLCO|SLC22|OAT\d|OCT\d|OCTN|MATE\d?|MRP\d|"
    r"ABCC\d|NTCP|SLC10A1|PEPT\d|ENT\d|BSEP|ABCB11)", re.I)

NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "+00:00")


# ----------------------------------------------------------------------------------------------
# small helpers


LICENCE_SHORT = {
    "chembl": "CC BY-SA 3.0",
    "clinicaltrials": "US Government work, public domain (National Library of Medicine)",
    "drugcentral": "CC BY-SA 4.0",
    "ema": "EMA reuse with acknowledgement, commercial use permitted",
    "gsrs": "US Government work, public domain (FDA/NCATS)",
    "hsa-singapore": "Singapore Open Data Licence version 1.0",
    "inxight": "Public domain (US Government work, NCATS/NIH)",
    "iuphar": "CC BY-SA 4.0 (contents); ODbL (database)",
    "openfda-label": "CC0 1.0 Universal",
    "orange-purple-book": "US Government work, public domain (FDA)",
    "pharmgkb-cpic": "CC BY-SA 4.0 (ClinPGx/PharmGKB); CC0 1.0 (CPIC)",
    "pmda": "Public Data License 1.0 (PMDA); attribution required",
    "pubchem": "Public domain (US Government work, NCBI)",
    "tga-artg": "CC BY 4.0 (Federal Register of Legislation)",
    "uniprot": "CC BY 4.0",
    "withdrawn": "CC BY-SA 3.0",
    "mhra-emc": "no reuse licence found; nothing retrieved",
}

LICENCE_FULL: dict[str, str] = {}


def prov(row: dict, source: str) -> dict:
    """The provenance carried on every value row. `licence` is the source's licence under its
    short name; the licence text exactly as the source publishes it is recorded once per source in
    data/revamp/fields-v2/integration-summary.json and in docs/data/LICENSES.md."""
    full = row.get("licence")
    if full and source not in LICENCE_FULL:
        LICENCE_FULL[source] = full
    return {
        "source": source,
        "source_record_id": row.get("source_record_id"),
        "source_url": row.get("source_url"),
        "source_date": row.get("source_date"),
        "licence": LICENCE_SHORT.get(source, full),
    }


def clip(text, limit=SECTION_CHARS):
    if not isinstance(text, str):
        return text
    text = " ".join(text.split())
    return text if len(text) <= limit else text[:limit]


def sentences(section: str) -> list[str]:
    flat = " ".join((section or "").split())
    parts = re.split(r"(?<=[.;])\s+(?=[A-Z0-9(])", flat)
    out = []
    for part in parts:
        part = part.strip()
        if len(part) < 20:
            continue
        out.append(part[:SENTENCE_CHARS])
        if len(out) >= MAX_SENTENCES:
            break
    return out


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def make_entry(state, value, srcs, *, note=None, consulted=None, verbatim=False,
               source_date=None, run_date=None, extra=None):
    """One field entry in the corpus schema, with provenance on the entry and on every value row."""
    first = srcs[0] if srcs else None
    entry = {
        "state": state,
        "value": value,
        "source": None if first is None else {
            "kind": first["source"],
            "id": first["source_record_id"],
            "url": first["source_url"],
            "licence": first["licence"],
        },
        "sourceDate": source_date or (first["source_date"] if first else None),
        "lastVerified": run_date,
        "verbatim": verbatim,
    }
    if srcs:
        entry["sources"] = srcs
    if note:
        entry["note"] = note
    if consulted:
        entry["consulted"] = consulted
    if extra:
        entry.update(extra)
    return entry


def incumbent_dict(incumbent):
    """The incumbent value as a dict the merge can extend. A recorded value that is not a mapping
    (a list of mechanism rows, a list of stopped trials) is carried unchanged under
    `recordedValue` so nothing the corpus already held is dropped."""
    value = incumbent.get("value")
    if isinstance(value, dict):
        return dict(value)
    if value is None:
        return {}
    return {"recordedValue": value}


def dedupe_provs(rows: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for p in rows:
        if not p:
            continue
        k = (p.get("source"), p.get("source_record_id"))
        if k in seen:
            continue
        seen.add(k)
        out.append(p)
    return out


# ----------------------------------------------------------------------------------------------
# loading the mapped sources


def load_source(name: str, wanted: dict[str, int], trim=None):
    """key -> field -> [{'v': parsed value, 'p': provenance, 'm': match_rule, 'f': form_of_target}]"""
    path = SOURCES_DIR / name / "mapped.parquet"
    out: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    if not path.exists():
        return out, {"status": "absent at run time", "rows": 0, "pages": 0}
    handle = pq.ParquetFile(path)
    rows = 0
    if handle.metadata.num_rows:
        for batch in handle.iter_batches(batch_size=20000, columns=COLS):
            for r in batch.to_pylist():
                field = r["field"]
                if field not in wanted:
                    continue
                bucket = out[r["key"]][field]
                if len(bucket) >= wanted[field]:
                    continue
                raw = r["value"]
                try:
                    value = json.loads(raw) if isinstance(raw, str) else raw
                except (TypeError, ValueError):
                    value = raw
                if trim is not None:
                    value = trim(field, value)
                bucket.append({"v": value, "p": prov(r, name),
                               "m": r.get("match_rule"), "f": r.get("form_of_target")})
                rows += 1
    return out, {"status": "mapped", "rowsKept": rows, "pages": len(out)}


def trim_openfda(field, value):
    if field == "cyp_profile":
        return value
    return [clip(v) for v in as_list(value)]


def trim_uniprot(field, value):
    if field == "targetProtein" and isinstance(value, dict):
        return {k: value.get(k) for k in
                ("accession", "entryName", "proteinName", "geneName", "genes", "organism",
                 "chemblTargetIds", "drugCentralIds", "length")}
    if field == "biologicSequence" and isinstance(value, dict):
        return {k: value.get(k) for k in ("accession", "entryName", "length")}
    return value


def trim_inxight(field, value):
    if field == "marketingStatus" and isinstance(value, dict):
        out = {k: value.get(k) for k in
               ("jurisdiction", "activeRecords", "eventCount", "earliestRecordedDate",
                "latestRecordedDate", "statusCounts", "upstreamRegisters")}
        out["sponsors"] = (value.get("sponsors") or [])[:5]
        out["products"] = (value.get("products") or [])[:5]
        out["approvalApplicationIds"] = (value.get("approvalApplicationIds") or [])[:10]
        return out
    if field == "pk" and isinstance(value, dict):
        return {k: v for k, v in value.items()
                if k.startswith("pk_") or k in ("id", "compound_id", "frdbVersion")}
    if field == "adverseEvents" and isinstance(value, dict):
        out = {k: value.get(k) for k in ("event", "frequency", "severity", "frdbVersion")}
        study = value.get("study") or {}
        out["study"] = {k: study.get(k) for k in
                        ("toxicity_age_group", "toxicity_dose_value", "toxicity_dose_units",
                         "toxicity_duration", "toxicity_duration_units", "toxicity_routes",
                         "toxicity_population_size", "toxicity_source_uri")}
        return out
    return value


def trim_hsa(field, value):
    if field == "hsaProduct" and isinstance(value, dict):
        return {k: value.get(k) for k in
                ("licenceNumber", "productName", "licenceHolder", "approvalDate",
                 "forensicClassification", "atcCode", "dosageForm", "routeOfAdministration",
                 "strength")}
    return value


def trim_drugcentral(field, value):
    caps = {"indications": 60, "off_label_uses": 40, "contraindications": 60,
            "adverse_events_faers": 40, "mechanism_targets": 40, "target_bioactivities": 40,
            "pharmacologic_action": 30}
    if field in caps and isinstance(value, list):
        return value[: caps[field]]
    return value


def trim_chembl(field, value):
    return value


def trim_ct(field, value):
    if not isinstance(value, dict):
        return value
    if field == "registry.whyStopped":
        v = dict(value)
        v["perTrial"] = (v.get("perTrial") or [])[:20]
        return v
    if field == "registry.trialCount":
        v = {k: value.get(k) for k in ("interventional", "byStudyType", "total", "studies")}
        v["ncts"] = (value.get("ncts") or [])[:20]
        v["nctCount"] = len(value.get("ncts") or [])
        return v
    if field == "registry.hasResults":
        v = {k: value.get(k) for k in ("completed", "completedWithoutResults")}
        v["resultsPostedCount"] = len(value.get("resultsPosted") or [])
        v["completedWithoutResultsNcts"] = [r.get("nct") for r in
                                            (value.get("completedWithoutResultsNcts") or [])][:10]
        return v
    if field == "registry.enrolment":
        return {k: value.get(k) for k in ("n", "min", "median", "max")}
    return {k: v for k, v in value.items() if k != "perTrial"}


def trim_obpb(field, value):
    if field == "patentStatus" and isinstance(value, dict):
        out = {k: value.get(k) for k in ("as_of", "orange_book_data_file_dates")}
        for scope in ("all_products_containing_this_substance", "single_ingredient_products"):
            block = value.get(scope)
            if not isinstance(block, dict):
                continue
            keep = {k: v for k, v in block.items()
                    if k not in ("applications", "reference_listed_drug_products",
                                 "therapeutic_equivalence_codes")}
            keep["application_count"] = len(block.get("applications") or [])
            keep["applications"] = (block.get("applications") or [])[:20]
            keep["reference_listed_drug_products"] = (
                block.get("reference_listed_drug_products") or [])[:4]
            keep["therapeutic_equivalence_codes"] = (
                block.get("therapeutic_equivalence_codes") or [])[:12]
            out[scope] = keep
        return out
    if field == "orangeBookProducts" and isinstance(value, dict):  # counts and ids only
        return {k: value.get(k) for k in
                ("application_number", "application_type", "approval_date", "marketing_type",
                 "reference_listed_drug", "therapeutic_equivalence_code", "is_single_ingredient_product",
                 "ingredient", "applicant")}
    if field == "purpleBookProducts" and isinstance(value, dict):
        return {k: value.get(k) for k in
                ("bla_number", "license_type", "licensure_status", "marketing_status",
                 "approval_date", "applicant", "exclusivity_expiration_date")}
    return value


# ----------------------------------------------------------------------------------------------
# per-field builders


def build_interactions(incumbent, page, run_date, filled):
    """Tier A = openFDA label drug_interactions sentences. Tier B = Inxight curated DDI rows,
    including the rows that record `interactionFound: false`."""
    label_rows, curated = [], []
    srcs = []
    for row in page["openfda"].get("drug_interactions", []):
        found = []
        for text in as_list(row["v"]):
            found.extend(sentences(text))
        if found:
            label_rows.append({"tier": "A", "labelSection": "drug_interactions",
                               "sentences": [t[:400] for t in found[:10]],
                               "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["inxight"].get("ddi", []):
        v = row["v"] or {}
        curated.append({
            "tier": "B",
            "interactionFound": bool(v.get("interactionFound")),
            "role": v.get("role"),
            "target": v.get("target"),
            "targetName": v.get("targetName"),
            "targetClass": v.get("targetClass"),
            "targetChembl": v.get("targetChembl"),
            "magnitudeReported": v.get("magnitudeReported"),
            "evidenceUri": v.get("evidenceUri"),
            "provenance": row["p"],
        })
        srcs.append(row["p"])
    if not label_rows and not curated:
        return None
    value = incumbent_dict(incumbent)
    for key in ("cyp", "transporters"):
        value.setdefault(key, [])
    value["labelStatements"] = label_rows[:3]
    value["curatedInteractions"] = curated[:20]
    value["curatedInteractionsFound"] = sum(1 for r in curated if r["interactionFound"])
    value["curatedInteractionsNotFound"] = sum(1 for r in curated if not r["interactionFound"])
    value["sourcesChecked"] = [
        "openFDA drug label drug_interactions",
        "NCATS Inxight Drugs curated drug-drug interaction dataset",
    ]
    affirmative = bool(label_rows) or value["curatedInteractionsFound"] > 0
    state = "present" if (incumbent.get("state") == "present" or affirmative) else incumbent.get("state", "absent")
    if incumbent.get("state") != "present" and state == "present":
        filled.append(("interactions", sorted({p["source"] for p in srcs})))
    base = incumbent.get("sources") or []
    entry = make_entry(state, value, dedupe_provs(base + srcs), run_date=run_date,
                       verbatim=True,
                       source_date=incumbent.get("sourceDate"))
    if incumbent.get("source") and not base:
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_kinetics(incumbent, page, run_date, field_name, filled):
    """label > curated parameter table. The label prose is the statement; the Inxight FRDB
    parameter rows are added beside it and never overwrite a label value."""
    if incumbent.get("state") == "not-applicable":
        return None
    statements, srcs = [], []
    for row in page["openfda"].get("pharmacokinetics", []):
        for text in as_list(row["v"]):
            statements.append({"labelSection": "pharmacokinetics", "statement": text,
                               "provenance": row["p"]})
        srcs.append(row["p"])
    params = []
    for row in page["inxight"].get("pk", []):
        params.append({**(row["v"] or {}), "provenance": row["p"]})
        srcs.append(row["p"])
    if not statements and not params:
        return None
    value = incumbent_dict(incumbent)
    if statements:
        value["labelStatements"] = statements[:2]
    if params:
        value["curatedParameters"] = params
    value["precedence"] = "openFDA label pharmacokinetics, then the NCATS Inxight FRDB parameter rows"
    was = incumbent.get("state")
    state = "present"
    if was != "present":
        filled.append((field_name, sorted({p["source"] for p in srcs})))
    base = incumbent.get("sources") or []
    entry = make_entry(state, value, dedupe_provs(base + srcs), run_date=run_date, verbatim=True,
                       source_date=incumbent.get("sourceDate"))
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_cyp_profile(page, run_date):
    rows, srcs = [], []
    for row in page["openfda"].get("cyp_profile", []):
        v = row["v"] or {}
        rows.append({"enzyme": v.get("enzyme"), "role": v.get("role"),
                     "strength": v.get("strength"), "basis": v.get("basis"),
                     "labelSection": v.get("section"), "sentence": clip(v.get("sentence"), SENTENCE_CHARS),
                     "evidence": "openFDA label sentence", "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["inxight"].get("ddi", []):
        v = row["v"] or {}
        target = (v.get("target") or "") or (v.get("targetName") or "")
        if not target:
            continue
        if not (ENZYME_RE.search(target) or TRANSPORTER_RE.search(target)
                or ENZYME_RE.search(v.get("targetName") or "")
                or TRANSPORTER_RE.search(v.get("targetName") or "")):
            continue
        rows.append({"enzyme": target, "role": v.get("role"), "strength": None,
                     "basis": "curated", "labelSection": None,
                     "targetName": v.get("targetName"), "targetChembl": v.get("targetChembl"),
                     "interactionFound": bool(v.get("interactionFound")),
                     "evidence": "NCATS Inxight curated DDI row", "provenance": row["p"]})
        srcs.append(row["p"])
    consulted = ["openFDA drug label pharmacokinetics/drug_interactions CYP and transporter extraction",
                 "NCATS Inxight Drugs curated drug-drug interaction dataset (enzyme and transporter rows)"]
    if not rows:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    merged: dict[tuple, dict] = {}
    for r in rows:
        k = ((r.get("enzyme") or "").upper(), (r.get("role") or "").lower())
        if k not in merged:
            merged[k] = {"enzyme": r.get("enzyme"), "role": r.get("role"), "evidence": [], "sources": []}
        merged[k]["evidence"].append(r)
        merged[k]["sources"].append(r["provenance"])
        if r.get("strength") and not merged[k].get("strength"):
            merged[k]["strength"] = r["strength"]
    for row in merged.values():
        row["evidence"] = [{**e, "sentence": clip(e.get("sentence"), 300)}
                           if e.get("sentence") else e for e in row["evidence"][:2]]
        row["sources"] = dedupe_provs(row["sources"])
    value = {
        "rows": list(merged.values())[:20],
        "enzymes": sorted({(r.get("enzyme") or "").upper() for r in rows if ENZYME_RE.search(r.get("enzyme") or "")}),
        "transporters": sorted({(r.get("enzyme") or "").upper() for r in rows if TRANSPORTER_RE.search(r.get("enzyme") or "")}),
        "byRole": dict(Counter((r.get("role") or "unstated").lower() for r in rows)),
        "sourcesChecked": consulted,
    }
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date, verbatim=True), \
        sorted({p["source"] for p in srcs})


def build_adverse_events(incumbent, page, run_date, filled):
    label_rows, curated, srcs = [], [], []
    for section in ("warnings_and_cautions", "overdosage"):
        for row in page["openfda"].get(section, []):
            for text in as_list(row["v"]):
                label_rows.append({"labelSection": section, "statement": text, "provenance": row["p"]})
            srcs.append(row["p"])
    for row in page["inxight"].get("adverseEvents", []):
        v = row["v"] or {}
        curated.append({**v, "provenance": row["p"]})
        srcs.append(row["p"])
    faers_rows = page["drugcentral"].get("adverse_events_faers", [])
    if not label_rows and not curated:
        return None
    value = incumbent_dict(incumbent)
    if label_rows:
        value["labelSections"] = label_rows[:4]
    if curated:
        value["curatedEvents"] = curated[:15]
        value["curatedEventCount"] = len(curated)
    if faers_rows:
        value["faersReference"] = {
            "field": "faers",
            "statement": "DrugCentral's FAERS disproportionality rows for this substance are "
                         "recorded on the faers field of this page and are spontaneous reports, "
                         "never incidence",
            "provenance": faers_rows[0]["p"],
        }
    was = incumbent.get("state")
    if was != "present":
        filled.append(("adverseEvents", sorted({p["source"] for p in srcs})))
    base = incumbent.get("sources") or []
    entry = make_entry("present", value, dedupe_provs(base + srcs), run_date=run_date, verbatim=True,
                       source_date=incumbent.get("sourceDate"))
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_faers(incumbent, page, run_date, filled):
    rows = page["drugcentral"].get("adverse_events_faers", [])
    if not rows or incumbent.get("state") == "present":
        return None
    terms, srcs = [], []
    for row in rows:
        for r in as_list(row["v"]):
            terms.append({"term": r.get("meddra_name"), "meddraCode": r.get("meddra_code"),
                          "meddraLevel": r.get("meddra_level"),
                          "count": r.get("reports_drug_and_event"),
                          "llr": r.get("llr"), "llrThreshold": r.get("llr_threshold"),
                          "aboveThreshold": r.get("above_threshold")})
        srcs.append(row["p"])
    if not terms:
        return None
    terms.sort(key=lambda t: (-(t["count"] or 0), t["term"] or ""))
    value = {"reportType": "spontaneous reports", "terms": terms[:25],
             "statement": "counts of spontaneous reports naming this substance and this reaction; "
                          "a count is never an incidence rate",
             "analysisWindow": "not stated by the source"}
    filled.append(("faers", sorted({p["source"] for p in srcs})))
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date)


def build_indication(incumbent, page, run_date, filled):
    label_rows, srcs = [], []
    for row in page["openfda"].get("indications_and_usage", []):
        for text in as_list(row["v"]):
            label_rows.append({"labelSection": "indications_and_usage", "statement": text,
                               "provenance": row["p"]})
        srcs.append(row["p"])
    structured = []
    for row in page["drugcentral"].get("indications", []):
        for r in as_list(row["v"]):
            structured.append({"condition": r.get("concept_name"), "snomed": r.get("snomed_conceptid"),
                               "umls": r.get("umls_cui"), "relationship": r.get("relationship_name"),
                               "approved": True, "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["drugcentral"].get("off_label_uses", []):
        for r in as_list(row["v"]):
            structured.append({"condition": r.get("concept_name"), "snomed": r.get("snomed_conceptid"),
                               "umls": r.get("umls_cui"), "relationship": r.get("relationship_name"),
                               "approved": False, "provenance": row["p"]})
        srcs.append(row["p"])
    curated = []
    for row in page["inxight"].get("uses", []):
        v = row["v"] or {}
        approved = bool(v.get("approvedUseText"))
        curated.append({"condition": v.get("condition"), "kind": v.get("kind"),
                        "approvedUse": approved,
                        "useClass": "approved" if approved else "off-label or class use",
                        "approvedUseText": clip(v.get("approvedUseText"), SENTENCE_CHARS),
                        "highestPhase": v.get("highestPhase"),
                        "upstreamDataset": v.get("upstreamDataset"), "provenance": row["p"]})
        srcs.append(row["p"])
    if not (label_rows or structured or curated):
        return None
    value = incumbent_dict(incumbent)
    if incumbent.get("state") != "present" and label_rows:
        value["statement"] = label_rows[0]["statement"]
        value["labelSection"] = "indications_and_usage"
    if label_rows:
        value["labelStatements"] = label_rows[:2]
    if structured:
        value["structuredIndications"] = structured[:25]
    if curated:
        value["curatedUses"] = curated
    value["precedence"] = ("openFDA label indications_and_usage statement, then DrugCentral OMOP "
                           "indication and off-label rows, then NCATS Inxight uses")
    was = incumbent.get("state")
    if was != "present":
        filled.append(("indication", sorted({p["source"] for p in srcs})))
    base = incumbent.get("sources") or []
    entry = make_entry("present", value, dedupe_provs(base + srcs), run_date=run_date, verbatim=True,
                       source_date=incumbent.get("sourceDate"))
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_contraindications(page, run_date):
    label_rows, structured, srcs = [], [], []
    for row in page["openfda"].get("contraindications", []):
        for text in as_list(row["v"]):
            label_rows.append({"labelSection": "contraindications", "statement": text,
                               "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["drugcentral"].get("contraindications", []):
        for r in as_list(row["v"]):
            structured.append({"condition": r.get("concept_name"), "snomed": r.get("snomed_conceptid"),
                               "umls": r.get("umls_cui"), "provenance": row["p"]})
        srcs.append(row["p"])
    consulted = ["openFDA drug label contraindications section",
                 "DrugCentral omop_relationship contraindication rows"]
    if not (label_rows or structured):
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    value = {"sourcesChecked": consulted}
    if label_rows:
        value["labelStatements"] = label_rows[:2]
    if structured:
        value["structured"] = structured[:25]
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date, verbatim=True), \
        sorted({p["source"] for p in srcs})


def build_boxed_warning(page, run_date):
    rows, srcs = [], []
    for row in page["openfda"].get("boxed_warning", []):
        for text in as_list(row["v"]):
            rows.append({"labelSection": "boxed_warning", "statement": text, "provenance": row["p"]})
        srcs.append(row["p"])
    consulted = ["openFDA drug label boxed_warning section"]
    if not rows:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    value = {"statements": rows[:2], "sourcesChecked": consulted}
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date, verbatim=True), \
        sorted({p["source"] for p in srcs})


UK_STATEMENT = "UK register not cleared for this run"


def build_regulatory(incumbent, page, run_date, sg_row, filled):
    value = incumbent_dict(incumbent)
    srcs = []
    contributing = set()

    # --- US: keep the corpus Drugs@FDA / Orange Book reading; add the curated marketing status
    us = dict(value.get("US") or {})
    inx_by_jur: dict[str, list] = defaultdict(list)
    for row in page["inxight"].get("marketingStatus", []):
        v = row["v"] or {}
        inx_by_jur[str(v.get("jurisdiction"))].append({**v, "provenance": row["p"]})
        srcs.append(row["p"])
    if inx_by_jur.get("US"):
        us["curatedMarketingStatus"] = inx_by_jur["US"]
        contributing.add("inxight")
    for row in page["drugcentral"].get("regulatory.US", []):
        v = row["v"] or {}
        us["drugCentral"] = {**v, "provenance": row["p"]}
        srcs.append(row["p"])
        contributing.add("drugcentral")
        if not us.get("status") or us.get("status") == "unknown":
            us["previousStatus"] = us.get("status")
            us["status"] = v.get("status")
    if us:
        value["US"] = us

    # --- EU: EMA is the register; DrugCentral's EMA approval row is recorded beside it
    eu = dict(value.get("EU") or {})
    ema_records = []
    for row in page["ema"].get("regulatory.EU", []):
        v = row["v"] or {}
        ema_records.append({
            "register": "EMA medicines register",
            "recordId": v.get("ema_product_number"),
            "medicineName": v.get("medicine_name") or v.get("name"),
            "statusVerbatim": v.get("authorisation_status") or v.get("status"),
            "activeSubstance": v.get("active_substance_as_published"),
            "atcCodes": v.get("atc_codes_human"),
            "dates": v.get("dates"),
            "url": row["p"]["source_url"],
            "provenance": row["p"],
        })
        srcs.append(row["p"])
    ema_records = ema_records[:8]
    if ema_records:
        held = {r.get("recordId") for r in (eu.get("records") or [])}
        eu.setdefault("records", [])
        for r in ema_records:
            if r["recordId"] not in held:
                eu["records"].append(r)
        statuses = {str(r["statusVerbatim"]).lower() for r in ema_records}
        if "authorised" in statuses:
            eu["status"] = "approved"
        elif not eu.get("status"):
            eu["status"] = "recorded"
        contributing.add("ema")
    for row in page["drugcentral"].get("regulatory.EU", []):
        eu["drugCentral"] = {**(row["v"] or {}), "provenance": row["p"]}
        srcs.append(row["p"])
        contributing.add("drugcentral")
    if eu:
        value["EU"] = eu

    # --- JP: PMDA is the register; DrugCentral's PMDA flag is cross-checked and disagreement named
    jp = dict(value.get("JP") or {})
    pmda_records = []
    for row in page["pmda"].get("regulatory.JP", []):
        v = row["v"] or {}
        pmda_records.append({
            "register": "PMDA List of Approved Products (New Drugs), English",
            "recordId": row["p"]["source_record_id"],
            "approved": v.get("approved"),
            "approvalDate": v.get("approval_date"),
            "year": v.get("year"),
            "activeIngredient": v.get("active_ingredient_as_listed"),
            "brandNamesInJapan": v.get("brand_names_in_japan"),
            "applicant": v.get("applicant"),
            "listingNote": v.get("listing_note"),
            "provenance": row["p"],
        })
        srcs.append(row["p"])
    dc_jp = None
    for row in page["drugcentral"].get("regulatory.JP", []):
        dc_jp = {**(row["v"] or {}), "provenance": row["p"]}
        srcs.append(row["p"])
    if pmda_records:
        jp["records"] = pmda_records
        jp["status"] = "approved" if any(r.get("approved") for r in pmda_records) else "recorded"
        contributing.add("pmda")
    if dc_jp is not None:
        jp["drugCentral"] = dc_jp
        contributing.add("drugcentral")
    if pmda_records or dc_jp is not None:
        dc_says_approved = bool(dc_jp and dc_jp.get("status") == "approved")
        pmda_says_approved = any(r.get("approved") for r in pmda_records)
        if dc_says_approved and not pmda_records:
            jp["discrepancy"] = ("DrugCentral records a PMDA approval that the PMDA English list of "
                                 "approved new drugs read on 2026-09-06 does not carry for this "
                                 "substance. Both readings are kept; neither overrides the other.")
        elif pmda_says_approved and dc_jp is not None and not dc_says_approved:
            jp["discrepancy"] = ("The PMDA English list records an approval that DrugCentral's PMDA "
                                 "flag does not. Both readings are kept; neither overrides the other.")
        else:
            jp["discrepancy"] = None
        if not jp.get("status"):
            jp["status"] = "recorded"
        value["JP"] = jp

    # --- AU: the SUSMP schedule is the cleared fact; ARTG status was never retrieved
    au_rows = page["tga-artg"].get("regulatory.AU", [])
    if au_rows:
        entries = []
        note = None
        for row in au_rows:
            v = row["v"] or {}
            note = v.get("artgStatusNote") or note
            entries.append({
                "register": v.get("registerName"),
                "instrument": v.get("instrumentCommonName"),
                "instrumentRegisterId": v.get("instrumentRegisterId"),
                "susmpSchedule": v.get("susmpSchedule"),
                "susmpScheduleTitle": v.get("susmpScheduleTitle"),
                "appendixD": v.get("appendixD"),
                "entryName": v.get("entryName"),
                "entryText": clip(v.get("entryText"), SENTENCE_CHARS),
                "provenance": row["p"],
            })
            srcs.append(row["p"])
        value["AU"] = {
            "status": "scheduled in the Poisons Standard",
            "artgStatus": None,
            "artgStatusNote": note,
            "records": entries,
        }
        contributing.add("tga-artg")

    # --- SG: the HSA listing, on every page, registered or not found
    if sg_row is not None:
        registered = sg_row["status"] == "registered"
        sg = {
            "status": "registered" if registered else "not found",
            "statement": sg_row["statement"],
            "register": "HSA Listing of Registered Therapeutic Products",
            "asOf": sg_row["as_of"],
            "retrievedOn": sg_row["retrieved_on"],
            "productCount": sg_row["product_count"],
            "provenance": {"source": "hsa-singapore",
                           "source_record_id": sg_row.get("match_rule") or "listing scan",
                           "source_url": sg_row["source_url"],
                           "source_date": sg_row["as_of"],
                           "licence": sg_row["licence"]},
        }
        for row in page["hsa-singapore"].get("regulatorySG", []):
            v = row["v"] or {}
            sg["forensicClassification"] = v.get("forensicClassification")
            sg["forensicClassificationPlain"] = v.get("forensicClassificationPlain")
            srcs.append(row["p"])
        for row in page["hsa-singapore"].get("hsaRegistrants", []):
            sg["licenceHolders"] = (row["v"] or {}).get("licenceHolders")
        for row in page["hsa-singapore"].get("hsaAtcCodes", []):
            sg["atcCodes"] = (row["v"] or {}).get("atcCodes")
        products = [{**(r["v"] or {}), "provenance": r["p"]}
                    for r in page["hsa-singapore"].get("hsaProduct", [])]
        if products:
            sg["products"] = products[:6]
        value["SG"] = sg
        if registered:
            contributing.add("hsa-singapore")

    # --- UK: not cleared. --- CA: whatever the corpus already held, unchanged.
    value["UK"] = {
        "status": "not cleared",
        "statement": UK_STATEMENT,
        "reason": "The MHRA products database and emc publish no bulk or API route under terms "
                  "permitting reuse, so nothing was retrieved. See docs/revamp/BLOCKERS.md#mhra-emc.",
    }
    if inx_by_jur:
        ranked = sorted(inx_by_jur.items(),
                        key=lambda kv: -sum((r.get("eventCount") or 0) for r in kv[1]))[:8]
        value["curatedMarketingStatusByJurisdiction"] = {j: rows for j, rows in sorted(ranked)}
        value["curatedMarketingStatusJurisdictionsNotListed"] = sorted(
            set(inx_by_jur) - {j for j, _ in ranked})
        value["curatedMarketingStatusNote"] = (
            "NCATS Inxight Drugs records marketing events per jurisdiction from upstream product "
            "registers. It is not itself a national register and does not set the status line for "
            "any jurisdiction here."
        )

    affirmative = bool(contributing - {"hsa-singapore"}) or "hsa-singapore" in contributing
    was = incumbent.get("state")
    state = "present" if (was == "present" or affirmative) else was or "absent"
    if was != "present" and state == "present":
        filled.append(("regulatory", sorted(contributing)))
    base = incumbent.get("sources") or []
    entry = make_entry(state, value if value else None, dedupe_provs(base + srcs),
                       run_date=run_date, source_date=incumbent.get("sourceDate"))
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    if state != "present":
        entry["consulted"] = (incumbent.get("consulted") or []) + [
            "EMA medicines register", "PMDA approved new drugs (English)",
            "TGA Poisons Standard (SUSMP)", "HSA Listing of Registered Therapeutic Products"]
    return entry


def build_controlled(page, run_date, incumbent_regulatory, sg_row):
    us, au, sg = None, None, None
    srcs = []
    reg_value = incumbent_regulatory.get("value") or {}
    dea = ((reg_value.get("US") or {}).get("deaSchedule")) if isinstance(reg_value, dict) else None
    if dea:
        reg_source = incumbent_regulatory.get("source") or {}
        us_prov = {
            "source": "openfda-ndc, as recorded on this page's regulatory field",
            "source_record_id": reg_source.get("id"),
            "source_url": reg_source.get("url") or "https://api.fda.gov/drug/ndc.json",
            "source_date": incumbent_regulatory.get("sourceDate"),
            "licence": "CC0 1.0 Universal",
        }
        us = {"jurisdiction": "US", "register": "US Drug Enforcement Administration schedule as "
                                                "recorded on the openFDA NDC product record",
              "schedule": dea, "provenance": us_prov}
        srcs.append(us_prov)
    for row in page["tga-artg"].get("regulatory.AU", []):
        v = row["v"] or {}
        schedule = v.get("susmpSchedule")
        if not schedule:
            continue
        au = au or {"jurisdiction": "AU", "register": "Standard for the Uniform Scheduling of "
                                                      "Medicines and Poisons (SUSMP)",
                    "instrument": v.get("instrumentCommonName"),
                    "instrumentRegisterId": v.get("instrumentRegisterId"),
                    "schedules": [], "appendixD": v.get("appendixD"), "provenance": row["p"]}
        au["schedules"].append({"schedule": schedule, "title": v.get("susmpScheduleTitle"),
                                "entryText": clip(v.get("entryText"), SENTENCE_CHARS)})
        srcs.append(row["p"])
    if au:
        au["controlledUnderSchedule8or9"] = any(s["schedule"] in ("8", "9") for s in au["schedules"])
    for row in page["hsa-singapore"].get("hsaForensicClass", []):
        v = row["v"] or {}
        sg = {"jurisdiction": "SG",
              "register": "HSA Listing of Registered Therapeutic Products, forensic classification",
              "forensicClassification": v.get("class"),
              "plainLanguage": v.get("plainLanguage"),
              "asOf": v.get("asOf"),
              "note": "This is the HSA supply classification of the registered product. The "
                      "Misuse of Drugs Act First Schedule and the Poisons Act schedules were not "
                      "retrieved for this run, so no Singapore controlled-drug class is recorded.",
              "provenance": row["p"]}
        srcs.append(row["p"])
    consulted = ["US DEA schedule as recorded on the openFDA NDC product record",
                 "TGA Standard for the Uniform Scheduling of Medicines and Poisons, June 2026",
                 "HSA forensic classification (the Singapore Misuse of Drugs Act and Poisons Act "
                 "schedules were not retrieved for this run)"]
    if not (us or au or sg):
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    value = {"sourcesChecked": consulted}
    if us:
        value["US"] = us
    if au:
        value["AU"] = au
    if sg:
        value["SG"] = sg
    value["controlledAnywhereIngested"] = bool(
        us or (au and au.get("controlledUnderSchedule8or9")))
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date), \
        sorted({p["source"] for p in srcs})


def target_key(chembl, uniprot, name):
    if chembl:
        return f"chembl:{chembl}"
    if uniprot:
        return f"uniprot:{uniprot}"
    return f"name:{(name or '').strip().upper()}"


def build_target(incumbent, page, run_date, filled):
    merged: dict[str, dict] = {}
    srcs = []

    def touch(chembl, uniprot, name, source_label, detail, p):
        k = target_key(chembl, uniprot, name)
        if k not in merged:
            merged[k] = {"targetKey": k, "targetName": name,
                         "identifiers": {"chembl": chembl, "uniprot": uniprot},
                         "evidence": [], "sources": []}
        row = merged[k]
        if name and not row.get("targetName"):
            row["targetName"] = name
        for field, val in (("chembl", chembl), ("uniprot", uniprot)):
            if val and not row["identifiers"].get(field):
                row["identifiers"][field] = val
        row["evidence"].append({"source": source_label, **detail, "provenance": p})
        row["sources"].append(source_label)

    for row in page["inxight"].get("targets", []):
        v = row["v"] or {}
        chembl = v.get("targetId") if v.get("targetIdType") == "ChEMBL" else None
        touch(chembl, None, v.get("label"), "inxight",
              {"pharmacology": v.get("pharmacology"), "potencyType": v.get("potencyType"),
               "evidenceUri": v.get("evidenceUri"), "upstreamDataset": v.get("upstreamDataset")},
              row["p"])
        srcs.append(row["p"])
    for row in page["drugcentral"].get("mechanism_targets", []):
        for r in as_list(row["v"]):
            touch(None, r.get("accession"), r.get("target_name") or r.get("gene"), "drugcentral",
                  {"actionType": r.get("action_type"), "gene": r.get("gene"),
                   "targetClass": r.get("target_class"), "organism": r.get("organism"),
                   "actValue": r.get("act_value"), "actType": r.get("act_type"),
                   "actSource": r.get("act_source"), "moaSource": r.get("moa_source")},
                  row["p"])
        srcs.append(row["p"])
    for row in page["iuphar"].get("iupharTargets", []):
        v = row["v"] or {}
        touch(None, v.get("targetUniprot") or v.get("uniprot"),
              v.get("targetName") or v.get("target"), "iuphar",
              {"action": v.get("action"), "interactionType": v.get("interactionType"),
               "affinityMedian": v.get("affinityMedian"), "affinityUnits": v.get("affinityUnits"),
               "endogenous": v.get("endogenous"), "gtopdbVersion": v.get("gtopdbVersion")},
              row["p"])
        srcs.append(row["p"])
    for row in page["chembl"].get("activities", []):
        v = row["v"] or {}
        if not v.get("targetChemblId"):
            continue
        touch(v.get("targetChemblId"), None, v.get("targetPrefName") or v.get("targetName"),
              "chembl",
              {"mechanismActionType": v.get("mechanismActionType"),
               "standardType": v.get("standardType"), "pchembl": v.get("pchembl"),
               "assayType": v.get("assayType")},
              row["p"])
        srcs.append(row["p"])
    for row in page["uniprot"].get("targetProtein", []):
        v = row["v"] or {}
        touch(None, v.get("accession"), v.get("proteinName") or v.get("entryName"), "uniprot",
              {"entryName": v.get("entryName"), "gene": v.get("geneName") or v.get("genes"),
               "organism": v.get("organism"), "chemblTargetIds": v.get("chemblTargetIds")},
              row["p"])
        srcs.append(row["p"])

    if not merged:
        return None
    for row in merged.values():
        row["sources"] = sorted(set(row["sources"]))
        row["evidence"] = row["evidence"][:3]
    value = incumbent_dict(incumbent)
    value["mergedTargets"] = sorted(merged.values(), key=lambda r: r["targetKey"])[:25]
    value["mergedTargetCount"] = len(merged)
    value["mergedFrom"] = sorted({s for r in merged.values() for s in r["sources"]})
    was = incumbent.get("state")
    if was == "not-applicable":
        value["supersededRule"] = {
            "previousState": "not-applicable",
            "previousNote": incumbent.get("note"),
            "reason": "the previous rule read only the ChEMBL and Open Targets mechanism tables, "
                      "which are keyed on a ChEMBL molecule id this page does not hold; the "
                      "sources listed under mergedFrom are keyed on UNII, InChIKey or accession "
                      "and do state a target for this page",
        }
        filled.append(("target", sorted(value["mergedFrom"])))
    elif was != "present":
        filled.append(("target", sorted(value["mergedFrom"])))
    base = incumbent.get("sources") or []
    entry = make_entry("present", value, dedupe_provs(base + srcs), run_date=run_date)
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_mechanism_class(incumbent, page, run_date, filled):
    rows, srcs = [], []
    for row in page["inxight"].get("mechanism", []):
        v = row["v"] or {}
        rows.append({"source": "inxight", "kind": v.get("kind"), "statement": v.get("statement"),
                     "upstreamDataset": v.get("upstreamDataset"), "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["drugcentral"].get("pharmacologic_action", []):
        for r in as_list(row["v"]):
            rows.append({"source": "drugcentral", "kind": r.get("class_type"),
                         "statement": r.get("name"), "classCode": r.get("class_code"),
                         "vocabulary": r.get("source"), "provenance": row["p"]})
        srcs.append(row["p"])
    for row in page["iuphar"].get("iupharTargets", []):
        v = row["v"] or {}
        if v.get("action"):
            rows.append({"source": "iuphar", "kind": "ligand action",
                         "statement": v.get("action"),
                         "target": v.get("targetName") or v.get("target"), "provenance": row["p"]})
            srcs.append(row["p"])
    if not rows:
        return None
    incumbent_value = incumbent.get("value")
    value = {"chemblMechanisms": incumbent_value if isinstance(incumbent_value, list) else [],
             "classStatements": rows[:40],
             "mergedFrom": sorted({r["source"] for r in rows})}
    if isinstance(incumbent_value, dict):
        value.update({k: v for k, v in incumbent_value.items() if k not in value})
    was = incumbent.get("state")
    if was == "not-applicable":
        value["supersededRule"] = {
            "previousState": "not-applicable",
            "previousNote": incumbent.get("note"),
            "reason": "the previous rule read only the ChEMBL mechanism table, which is keyed on a "
                      "ChEMBL molecule id this page does not hold",
        }
    if was != "present":
        filled.append(("mechanismClass", value["mergedFrom"]))
    base = incumbent.get("sources") or []
    entry = make_entry("present", value, dedupe_provs(base + srcs), run_date=run_date)
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def build_potency(page, run_date):
    groups: dict[tuple, dict] = {}
    srcs = []
    for row in page["chembl"].get("activities", []):
        v = row["v"] or {}
        pch = v.get("pchembl")
        if pch in (None, ""):
            continue
        try:
            pch = float(pch)
        except (TypeError, ValueError):
            continue
        k = (v.get("targetChemblId"), v.get("assayType"), v.get("standardType"))
        g = groups.setdefault(k, {"targetChemblId": k[0], "assayType": k[1],
                                  "standardType": k[2], "values": [],
                                  "exampleAssayDescription": clip(v.get("assayDescription"), 300),
                                  "provenance": row["p"]})
        g["values"].append(pch)
        srcs.append(row["p"])
    consulted = ["ChEMBL 37 activities with a pChEMBL value, grouped per target and assay type"]
    if not groups:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    rows = []
    for g in groups.values():
        vals = sorted(g.pop("values"))
        mid = len(vals) // 2
        median = vals[mid] if len(vals) % 2 else (vals[mid - 1] + vals[mid]) / 2
        rows.append({**g, "n": len(vals), "medianPChembl": round(median, 3),
                     "minPChembl": vals[0], "maxPChembl": vals[-1]})
    rows.sort(key=lambda r: (-(r["medianPChembl"] or 0), str(r["targetChemblId"])))
    value = {"assayGroups": rows[:40],
             "unit": "pChEMBL, the negative base-ten logarithm of the molar activity value as "
                     "ChEMBL computes it",
             "sourcesChecked": consulted}
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date), ["chembl"]


def build_publication_years(page, run_date):
    consulted = ["ChEMBL 37 compound_record document years"]
    rows = page["chembl"].get("publicationYears", [])
    if not rows:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    v = rows[0]["v"] or {}
    value = {"documentCount": v.get("documentCount"), "documentsWithYear": v.get("documentsWithYear"),
             "firstYear": v.get("first"), "lastYear": v.get("last"),
             "moleculeChemblId": v.get("moleculeChemblId"), "sourcesChecked": consulted}
    if value["documentCount"] in (None, 0):
        return make_entry("absent", None, dedupe_provs([rows[0]["p"]]), consulted=consulted,
                          run_date=run_date), []
    return make_entry("present", value, dedupe_provs([r["p"] for r in rows]), run_date=run_date), \
        ["chembl"]


def build_patent_status(incumbent, page, run_date, filled):
    ob_products = page["orange-purple-book"].get("orangeBookProducts", [])
    pb_products = page["orange-purple-book"].get("purpleBookProducts", [])
    status_rows = page["orange-purple-book"].get("patentStatus", [])
    purple_rows = page["orange-purple-book"].get("purpleBook", [])
    patents = page["orange-purple-book"].get("orangeBookPatents", [])
    exclusivity = page["orange-purple-book"].get("orangeBookExclusivity", [])
    srcs = []

    eligible = bool(ob_products) or bool(pb_products)
    if not eligible:
        note = (incumbent.get("note") if incumbent.get("state") == "not-applicable" else None) or (
            "the Orange Book lists patents only against an approved US application and the Purple "
            "Book lists exclusivity only against a licensed biologic; this page carries neither an "
            "Orange Book product record nor a Purple Book product record in the FDA data files "
            "read on 2026-08-14 and 2026-08-31, so the field does not apply")
        return make_entry("not-applicable", {"eligible": False, "eligibilityBasis": note},
                          [], note=note, run_date=run_date), []

    value = {
        "eligible": True,
        "eligibilityBasis": ("this page holds an FDA Orange Book product record (US-approved small "
                             "molecule)" if ob_products else
                             "this page holds an FDA Purple Book product record (licensed biologic)"),
        "orangeBookProductCount": len(ob_products),
        "purpleBookProductCount": len(pb_products),
    }
    for row in status_rows:
        value["orangeBookSummary"] = row["v"]
        srcs.append(row["p"])
    for row in purple_rows:
        value["purpleBookSummary"] = row["v"]
        srcs.append(row["p"])
    if ob_products:
        applications = sorted({f"{r['v'].get('application_type')} {r['v'].get('application_number')}"
                               for r in ob_products if r["v"]})
        value["applications"] = applications[:20]
        value["referenceListedDrug"] = any((r["v"] or {}).get("reference_listed_drug")
                                           for r in ob_products)
        value["therapeuticEquivalenceCodes"] = sorted(
            {(r["v"] or {}).get("therapeutic_equivalence_code") for r in ob_products
             if (r["v"] or {}).get("therapeutic_equivalence_code")})
        first_generic = sorted({(r["v"] or {}).get("approval_date") for r in ob_products
                                if (r["v"] or {}).get("application_type") == "ANDA"
                                and (r["v"] or {}).get("approval_date")})
        value["firstGenericApprovalDate"] = first_generic[0] if first_generic else None
        for r in ob_products:
            srcs.append(r["p"])
    if patents:
        value["patents"] = [{**(r["v"] or {}), "provenance": r["p"]} for r in patents[:10]]
        value["patentCount"] = len(patents)
        for r in patents:
            srcs.append(r["p"])
    if exclusivity:
        value["exclusivity"] = [{**(r["v"] or {}), "provenance": r["p"]} for r in exclusivity[:10]]
        for r in exclusivity:
            srcs.append(r["p"])
    if pb_products:
        value["purpleBookProducts"] = [{**(r["v"] or {}), "provenance": r["p"]}
                                       for r in pb_products[:4]]
        for r in pb_products:
            srcs.append(r["p"])

    affirmative = bool(patents or exclusivity or status_rows or purple_rows or ob_products or pb_products)
    if not affirmative:
        return make_entry("absent", value, dedupe_provs(srcs), run_date=run_date,
                          note="the page is eligible but the Orange Book and Purple Book files "
                               "list no patent or exclusivity for it"), []
    if incumbent.get("state") != "present":
        filled.append(("patentStatus", ["orange-purple-book"]))
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date), ["orange-purple-book"]


def build_withdrawal(incumbent, page, run_date, filled):
    """The withdrawn boolean is fixed by the rule in docs/specs/field-models.md and is never changed
    here. Only a missing reason is filled."""
    rows = page["withdrawn"].get("withdrawal", [])
    inx = page["inxight"].get("marketingStatus", [])
    value = incumbent_dict(incumbent)
    srcs = []
    added = []
    for row in rows:
        v = row["v"] or {}
        added.append({"reason": v.get("reason"), "reasonTerm": v.get("reasonTerm"),
                      "reasonClass": v.get("reasonClass"), "country": v.get("country"),
                      "year": v.get("year"), "assertedBy": v.get("assertedBy"),
                      "references": v.get("references"), "provenance": row["p"]})
        srcs.append(row["p"])
    if not added:
        return None
    has_reason = bool(value.get("reason"))
    value.setdefault("withdrawn", incumbent.get("value", {}).get("withdrawn")
                     if isinstance(incumbent.get("value"), dict) else None)
    value["statedReasons"] = added
    if not has_reason:
        value["reason"] = added[0]["reason"]
        value["reasonSource"] = added[0]["provenance"]
    marketed = []
    for row in inx:
        v = row["v"] or {}
        counts = v.get("statusCounts") or {}
        marketed.append({"jurisdiction": v.get("jurisdiction"), "statusCounts": counts,
                         "latestRecordedDate": v.get("latestRecordedDate"), "provenance": row["p"]})
    if marketed:
        value["curatedMarketingStatus"] = marketed[:12]
    was = incumbent.get("state")
    if was != "present":
        filled.append(("withdrawal", ["withdrawn"]))
    base = incumbent.get("sources") or []
    entry = make_entry("present", value, dedupe_provs(base + srcs), run_date=run_date)
    if was == "present" and incumbent.get("source"):
        entry["source"] = incumbent["source"]
        entry["sourceDate"] = incumbent.get("sourceDate")
    return entry


def registry_value(page):
    ct = page["clinicaltrials"]
    if not ct:
        return None, []
    value, srcs = {}, []
    for field, key in (("registry.trialCount", "trialCount"),
                       ("registry.phases", "phases"),
                       ("registry.statuses", "statuses"),
                       ("registry.completionDates", "completionDates"),
                       ("registry.design", "design"),
                       ("registry.enrolment", "enrolment"),
                       ("registry.hasResults", "hasResults"),
                       ("registry.whyStopped", "whyStopped")):
        rows = ct.get(field, [])
        if not rows:
            continue
        value[key] = rows[0]["v"]
        srcs.append(rows[0]["p"])
    if not value:
        return None, []
    return value, srcs


def build_registry(page, run_date):
    consulted = ["ClinicalTrials.gov API v2 studies snapshot 2026-09-01"]
    value, srcs = registry_value(page)
    if not value:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    completion = value.get("completionDates") or {}
    value["completionDateTypes"] = {
        "actual": completion.get("completionDateActual"),
        "estimated": completion.get("completionDateEstimated"),
        "unstated": completion.get("completionDateTypeUnstated"),
    }
    value["sourcesChecked"] = consulted
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date), ["clinicaltrials"]


def build_sponsor(incumbent, page, run_date, filled):
    if incumbent.get("state") == "present":
        return None
    value, srcs = registry_value(page)
    if not value:
        return None
    counts = (value.get("trialCount") or {})
    if not counts:
        return None
    return_value = {"registryStudies": counts.get("interventional") or counts.get("nctCount"),
                    "statement": "the registry snapshot matched studies to this page; the lead "
                                 "sponsor names are read from those study records",
                    "ncts": (counts.get("ncts") or [])[:20]}
    filled.append(("sponsor", ["clinicaltrials"]))
    return make_entry("present", return_value, dedupe_provs(srcs), run_date=run_date)


def build_why_stopped(incumbent, page, run_date, filled):
    if incumbent.get("state") == "present":
        return None
    rows = page["clinicaltrials"].get("registry.whyStopped", [])
    if not rows:
        return None
    v = rows[0]["v"] or {}
    per_trial = [r for r in (v.get("perTrial") or []) if r.get("whyStopped")]
    if not per_trial:
        return None
    filled.append(("whyStopped", ["clinicaltrials"]))
    return make_entry("present", per_trial, dedupe_provs([rows[0]["p"]]), run_date=run_date,
                      verbatim=True)


def build_trial_history(incumbent, page, run_date, filled):
    if incumbent.get("state") == "present":
        return None
    value, srcs = registry_value(page)
    if not value:
        return None
    counts = value.get("trialCount") or {}
    phases = value.get("phases") or {}
    statuses = value.get("statuses") or {}
    results = value.get("hasResults") or {}
    if not counts:
        return None
    out = {"registeredStudies": counts.get("interventional") or counts.get("nctCount"),
           "byPhase": phases.get("byPhase"),
           "byOverallStatus": statuses.get("byOverallStatus"),
           "studiesWithPostedResults": len(results.get("resultsPosted") or []),
           "registry": "clinicaltrials.gov/api/v2 studies snapshot 2026-09-01"}
    filled.append(("trialHistory", ["clinicaltrials"]))
    return make_entry("present", out, dedupe_provs(srcs), run_date=run_date)


def build_identifiers(page, run_date):
    value, srcs = {}, []
    pc = {}
    for field in ("cid", "mw", "tpsa", "xlogp", "inchikey", "smiles", "inchi"):
        rows = page["pubchem"].get(field, [])
        if rows:
            pc[field] = rows[0]["v"]
            srcs.append(rows[0]["p"])
    if pc:
        value["pubchem"] = pc
    accessions = []
    for row in page["uniprot"].get("targetProtein", []):
        v = row["v"] or {}
        if v.get("accession"):
            accessions.append({"accession": v["accession"], "entryName": v.get("entryName"),
                               "provenance": row["p"]})
        srcs.append(row["p"])
    if accessions:
        value["uniprotTargets"] = accessions[:8]
        value["uniprotAccessions"] = sorted({a["accession"] for a in accessions})
    for row in page["uniprot"].get("biologicSequence", []):
        value.setdefault("uniprotBiologicSequences", []).append({**(row["v"] or {}),
                                                                 "provenance": row["p"]})
        srcs.append(row["p"])
    gsrs = {}
    for field, key in (("gsrs_substance_class", "substanceClass"),
                       ("gsrs_record_status", "recordStatus"),
                       ("gsrs_preferred_name", "preferredName")):
        rows = page["gsrs"].get(field, [])
        if rows:
            gsrs[key] = rows[0]["v"]
            srcs.append(rows[0]["p"])
    if gsrs:
        value["gsrs"] = gsrs
    consulted = ["PubChem PUG REST compound record", "UniProtKB target and sequence records",
                 "FDA GSRS public substance dump 2026-08-06"]
    if not value:
        return make_entry("absent", None, [], consulted=consulted, run_date=run_date), []
    value["sourcesChecked"] = consulted
    contributors = sorted({p["source"] for p in srcs})
    return make_entry("present", value, dedupe_provs(srcs), run_date=run_date), contributors


def build_pgx(page, run_date):
    value, srcs = {}, []
    for field, key, cap in (("pgx", "clinicalAnnotations", 60),
                            ("pgxGeneAssociations", "geneAssociations", 60),
                            ("pgxDrugLabel", "drugLabelAnnotations", 30),
                            ("pgxCpicGuideline", "cpicGuidelines", 30)):
        rows = page["pharmgkb-cpic"].get(field, [])
        if not rows:
            continue
        value[key] = [{**(r["v"] or {}), "provenance": r["p"]} for r in rows[:cap]]
        srcs.extend(r["p"] for r in rows)
    if not value:
        return None
    entry = make_entry("present", value, dedupe_provs(srcs), run_date=run_date,
                       extra={"licence_gated": True,
                              "gate": "PharmGKB/ClinPGx CC BY-SA 4.0 share-alike and CPIC terms; "
                                      "excluded from the rendering set and from every presence "
                                      "count until the decision recorded in "
                                      "docs/revamp/BLOCKERS.md#clinpgx"})
    return entry


# ----------------------------------------------------------------------------------------------
# driver


def read_assignment():
    out = {}
    with ASSIGNMENT.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            model = row.get("model", "")
            withdrawn = bool(row.get("withdrawn"))
            tier = 1 if (model == "LONGEVITY" or withdrawn) else (2 if model == "CLINICAL" else 3)
            out[row["key"]] = {"model": model, "withdrawn": withdrawn, "tier": tier}
    return out


def read_sg_status():
    path = SOURCES_DIR / "hsa-singapore/regulatory-sg-status.parquet"
    if not path.exists():
        return {}
    table = pq.read_table(path)
    return {r["key"]: r for r in table.to_pylist()}


EMPTY = {}


def clear_tree(root: Path):
    for model_dir in MODEL_DIRS:
        d = root / model_dir
        if d.exists():
            for f in d.glob("batch-*.ndjson"):
                f.unlink()
        d.mkdir(parents=True, exist_ok=True)


class BatchWriter:
    def __init__(self, root: Path, model_dir: str, size: int):
        self.dir = root / model_dir
        self.size = size
        self.index = 0
        self.count = 0
        self.handle = None
        self.pages = 0

    def write(self, record):
        if self.handle is None or self.count >= self.size:
            self.close()
            self.index += 1
            self.handle = (self.dir / f"batch-{self.index:04d}.ndjson").open("w", encoding="utf-8")
            self.count = 0
        self.handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        self.count += 1
        self.pages += 1

    def close(self):
        if self.handle is not None:
            self.handle.close()
            self.handle = None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fields-in", default=str(FIELDS_DIR))
    parser.add_argument("--fields-out", default=str(DEFAULT_OUT))
    parser.add_argument("--gated-out", default=str(DEFAULT_GATED_OUT))
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    parser.add_argument("--run-date", default=date.today().isoformat())
    args = parser.parse_args()

    fields_in = Path(args.fields_in)
    out_root = Path(args.fields_out)
    gated_root = Path(args.gated_out)
    run_date = args.run_date

    assignment = read_assignment()
    sg_status = read_sg_status()

    wanted = {
        "openfda-label": ({"drug_interactions": 6, "pharmacokinetics": 6, "cyp_profile": 60,
                           "indications_and_usage": 6, "contraindications": 6, "boxed_warning": 6,
                           "warnings_and_cautions": 6, "overdosage": 4}, trim_openfda),
        "inxight": ({"ddi": 40, "pk": 12, "uses": 24, "targets": 30, "mechanism": 16,
                     "adverseEvents": 30, "marketingStatus": 16}, trim_inxight),
        "drugcentral": ({"indications": 4, "off_label_uses": 4, "contraindications": 4,
                         "adverse_events_faers": 4, "mechanism_targets": 4,
                         "pharmacologic_action": 4, "regulatory.US": 4, "regulatory.EU": 4,
                         "regulatory.JP": 4}, trim_drugcentral),
        "chembl": ({"activities": 400, "publicationYears": 2}, trim_chembl),
        "iuphar": ({"iupharTargets": 40}, None),
        "uniprot": ({"targetProtein": 30, "biologicSequence": 4}, trim_uniprot),
        "pubchem": ({"cid": 1, "mw": 1, "tpsa": 1, "xlogp": 1, "inchikey": 1, "smiles": 1,
                     "inchi": 1}, None),
        "gsrs": ({"gsrs_substance_class": 1, "gsrs_record_status": 1,
                  "gsrs_preferred_name": 1}, None),
        "orange-purple-book": ({"patentStatus": 1, "orangeBookPatents": 40,
                                "orangeBookExclusivity": 20, "purpleBook": 1,
                                "orangeBookProducts": 120, "purpleBookProducts": 12}, trim_obpb),
        "withdrawn": ({"withdrawal": 8}, None),
        "ema": ({"regulatory.EU": 12}, None),
        "pmda": ({"regulatory.JP": 12}, None),
        "tga-artg": ({"regulatory.AU": 12}, None),
        "hsa-singapore": ({"regulatorySG": 1, "hsaForensicClass": 1, "hsaRegistrants": 1,
                           "hsaAtcCodes": 1, "hsaProduct": 12}, trim_hsa),
        "clinicaltrials": ({"registry.trialCount": 1, "registry.phases": 1, "registry.statuses": 1,
                            "registry.completionDates": 1, "registry.design": 1,
                            "registry.enrolment": 1, "registry.hasResults": 1,
                            "registry.whyStopped": 1}, trim_ct),
        "pharmgkb-cpic": ({"pgx": 60, "pgxGeneAssociations": 60, "pgxDrugLabel": 30,
                           "pgxCpicGuideline": 30}, None),
        "mhra-emc": ({}, None),
    }

    loaded: dict[str, dict] = {}
    load_report: dict[str, dict] = {}
    for name, (fields, trim) in wanted.items():
        index, report = load_source(name, fields, trim)
        loaded[name] = index
        load_report[name] = report
        print(f"loaded {name:20} pages={report.get('pages', 0):6} rows={report.get('rowsKept', 0):7} "
              f"status={report['status']}", flush=True)

    clear_tree(out_root)
    clear_tree(gated_root)

    new_fields = ["cyp_profile", "contraindications", "boxedWarning", "controlled", "potency",
                  "publicationYears", "registry", "identifiers"]

    # counters
    fills: dict[str, dict[int, int]] = defaultdict(lambda: defaultdict(int))
    fill_sources: dict[str, dict[int, Counter]] = defaultdict(lambda: defaultdict(Counter))
    written = 0
    gated_pages = 0
    patent_eligible = 0
    patent_filled = 0
    sg_counts = Counter()
    unassigned = 0

    for model_dir in MODEL_DIRS:
        writer = BatchWriter(out_root, model_dir, args.batch_size)
        gated_writer = BatchWriter(gated_root, model_dir, args.batch_size)
        for batch in sorted(glob.glob(str(fields_in / model_dir / "batch-*.ndjson"))):
            with open(batch, encoding="utf-8") as handle:
                for line in handle:
                    if not line.strip():
                        continue
                    record = json.loads(line)
                    key = record["key"]
                    meta = assignment.get(key)
                    if meta is None:
                        unassigned += 1
                        continue
                    tier = meta["tier"]
                    page = {name: loaded[name].get(key, EMPTY) for name in loaded}
                    page["openfda"] = page["openfda-label"]
                    fields = record.setdefault("fields", {})
                    filled: list[tuple[str, list[str]]] = []

                    def replace(name, entry):
                        if entry is not None:
                            fields[name] = entry

                    if "interactions" in fields:
                        replace("interactions",
                                build_interactions(fields["interactions"], page, run_date, filled))
                    for kin in ("kinetics", "labelKinetics"):
                        if kin in fields:
                            replace(kin, build_kinetics(fields[kin], page, run_date, kin, filled))
                    if "adverseEvents" in fields:
                        replace("adverseEvents",
                                build_adverse_events(fields["adverseEvents"], page, run_date, filled))
                    if "faers" in fields:
                        replace("faers", build_faers(fields["faers"], page, run_date, filled))
                    if "indication" in fields:
                        replace("indication",
                                build_indication(fields["indication"], page, run_date, filled))
                    if "target" in fields:
                        replace("target", build_target(fields["target"], page, run_date, filled))
                    if "mechanismClass" in fields:
                        replace("mechanismClass",
                                build_mechanism_class(fields["mechanismClass"], page, run_date, filled))
                    if "withdrawal" in fields:
                        replace("withdrawal",
                                build_withdrawal(fields["withdrawal"], page, run_date, filled))
                    if "sponsor" in fields:
                        replace("sponsor", build_sponsor(fields["sponsor"], page, run_date, filled))
                    if "whyStopped" in fields:
                        replace("whyStopped",
                                build_why_stopped(fields["whyStopped"], page, run_date, filled))
                    if "trialHistory" in fields:
                        replace("trialHistory",
                                build_trial_history(fields["trialHistory"], page, run_date, filled))

                    regulatory_incumbent = fields.get(
                        "regulatory",
                        {"state": "absent", "value": None,
                         "consulted": ["the DEVELOPMENT model carried no regulatory field before "
                                       "this integration"]})
                    fields["regulatory"] = build_regulatory(
                        regulatory_incumbent, page, run_date, sg_status.get(key), filled)
                    sg_block = (fields["regulatory"].get("value") or {}).get("SG")
                    sg_counts[sg_block["status"] if sg_block else "no HSA row for this page"] += 1

                    # new fields, written on every record
                    entry, contributors = build_cyp_profile(page, run_date)
                    fields["cyp_profile"] = entry
                    if entry["state"] == "present":
                        filled.append(("cyp_profile", contributors))
                    entry, contributors = build_contraindications(page, run_date)
                    fields["contraindications"] = entry
                    if entry["state"] == "present":
                        filled.append(("contraindications", contributors))
                    entry, contributors = build_boxed_warning(page, run_date)
                    fields["boxedWarning"] = entry
                    if entry["state"] == "present":
                        filled.append(("boxedWarning", contributors))
                    entry, contributors = build_controlled(page, run_date, regulatory_incumbent,
                                                           sg_status.get(key))
                    fields["controlled"] = entry
                    if entry["state"] == "present":
                        filled.append(("controlled", contributors))
                    entry, contributors = build_potency(page, run_date)
                    fields["potency"] = entry
                    if entry["state"] == "present":
                        filled.append(("potency", contributors))
                    entry, contributors = build_publication_years(page, run_date)
                    fields["publicationYears"] = entry
                    if entry["state"] == "present":
                        filled.append(("publicationYears", contributors))
                    entry, contributors = build_registry(page, run_date)
                    fields["registry"] = entry
                    if entry["state"] == "present":
                        filled.append(("registry", contributors))
                    entry, contributors = build_identifiers(page, run_date)
                    fields["identifiers"] = entry
                    if entry["state"] == "present":
                        filled.append(("identifiers", contributors))

                    incumbent_patent = fields.get("patentStatus", {"state": "absent", "value": None})
                    entry, contributors = build_patent_status(incumbent_patent, page, run_date, filled)
                    fields["patentStatus"] = entry
                    if (entry["value"] or {}).get("eligible"):
                        patent_eligible += 1
                        if entry["state"] == "present":
                            patent_filled += 1

                    for name, contributors in filled:
                        fills[name][tier] += 1
                        for c in contributors:
                            fill_sources[name][tier][c] += 1

                    writer.write(record)
                    written += 1

                    pgx = build_pgx(page, run_date)
                    if pgx is not None:
                        gated_writer.write({"key": key, "model": record.get("model")
                                            or MODEL_OF_DIR[model_dir],
                                            "fields": {"pgx": pgx}})
                        gated_pages += 1
        writer.close()
        gated_writer.close()

    summary = {
        "generated": "scripts/revamp/integrate_sources.py",
        "runDate": run_date,
        "generatedAt": NOW,
        "fieldsIn": os.path.relpath(fields_in, ROOT),
        "fieldsOut": os.path.relpath(out_root, ROOT),
        "gatedOut": os.path.relpath(gated_root, ROOT),
        "batchSize": args.batch_size,
        "pagesWritten": written,
        "pagesInBatchesNotInAssignment": unassigned,
        "gatedPagesWritten": gated_pages,
        "sources": {name: {**report, "licence": LICENCE_SHORT.get(name),
                            "licence_full_text_as_published": LICENCE_FULL.get(name)}
                    for name, report in load_report.items()},
        "newFields": new_fields + ["patentStatus (existing field, re-filled from the Orange Book "
                                   "and Purple Book)"],
        "fieldsFilled": {name: {f"tier{t}": n for t, n in sorted(counts.items())}
                         for name, counts in sorted(fills.items())},
        "fillSources": {name: {f"tier{t}": dict(c) for t, c in sorted(counts.items())}
                        for name, counts in sorted(fill_sources.items())},
        "sgRegistrationStatus": dict(sg_counts),
        "patentEligiblePages": patent_eligible,
        "patentFilledPages": patent_filled,
        "ddinter": "never read by this script",
    }
    (out_root / "integration-summary.json").write_text(
        json.dumps(summary, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\npages written: {written} -> {os.path.relpath(out_root, ROOT)}")
    print(f"gated pgx pages: {gated_pages} -> {os.path.relpath(gated_root, ROOT)}")
    print(f"patent eligible {patent_eligible}, filled {patent_filled}")
    print(f"SG status: {dict(sg_counts)}")
    print(f"{'field':<20} {'T1':>7} {'T2':>7} {'T3':>7}   sources")
    for name, counts in sorted(fills.items()):
        srcs = sorted({s for c in fill_sources[name].values() for s in c})
        print(f"{name:<20} {counts.get(1,0):>7} {counts.get(2,0):>7} {counts.get(3,0):>7}   "
              f"{','.join(srcs)[:60]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
