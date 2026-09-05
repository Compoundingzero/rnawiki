#!/usr/bin/env python
"""Map NCATS Inxight Drugs records onto rnawiki corpus pages.

Inputs
  data/corpus-20k/identity/canonical.ndjson      one line per page
  data/corpus-20k/tiers/model-assignment.ndjson  model and withdrawn flag per page
  data/sources/inxight/<date>/raw/frdb/*.tsv     Fast Response Database bulk tables
  data/sources/inxight/<date>/raw/stitcher/*.gz  stitched drug records from the public API
  data/corpus-20k/raw/fda-unii/UNII_Records_*.txt  UNII to InChIKey resolver for source keys
  scripts/revamp/salts.txt                       salt suffixes for name normalisation

Outputs
  data/sources/inxight/mapped.parquet
  data/sources/inxight/coverage.json
  data/sources/inxight/name-candidates-for-review.csv

Mapping rules are applied in the order set by docs/specs/revamp-2026-09.md Phase 2:
UNII exact, then full InChIKey exact, then InChIKey skeleton as a form_of link,
then normalised name as an unconfirmed candidate.
"""
import argparse
import base64
import csv
import glob
import gzip
import json
import os
import re
import sys
from collections import Counter, defaultdict

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

csv.field_size_limit(1 << 30)

LICENCE = "Public domain (US Government work; NCATS/NIH, no copyright asserted)"
FRDB_VERSION = "2024-12-30"
FRDB_URL = "https://drugs.ncats.io/downloads-public/frdb-v2024-12-30.zip"
STITCH_URL = "https://stitcher.ncats.io/api/stitches/latest/{key}"

# Upstream datasets whose *descriptive content* (mechanism, target, use statements) may be
# republished. Every one is a public register or an NCATS/FDA product; see docs/data/LICENSES.md.
# Registry *events* are handled separately: those rows carry only facts (jurisdiction, status
# kind, date, product, sponsor, application id) and are admitted from any source except the
# denied list, with the originating register named in the row.
ALLOWED_SOURCES = {
    "FRDB, December 2024",
    "FRDB, October 2021",
    "NCATS Pharmaceutical Collection, April 2012",
    "G-SRS, March 2025",
    "Drugs@FDA",
    "FDA NDC",
    "DailyMed Rx, December 2021",
    "OrangeBook",
    "EMA",
    "DPD",
    "ClinicalTrials, February 2021",
    "G-SRS, July 2023",
    "OTC Monographs, December 2018",
    "FDA Excipients, December 2018",
    "FDA NADA and ANADAs, December 2018",
    "CBER-BLAs",
    "Withdrawn and Shortage Drugs List Feb 2018",
}
# Excluded and why. DrugBank is CC BY-NC 4.0 and the revamp spec forbids assuming a
# DrugBank licence; the Broad list and the Manufacturing Encyclopedia carry no licence
# grant that could be verified from their own terms pages.
DENIED_SOURCES = {
    "DrugBank, July 2020": "DrugBank CC BY-NC 4.0; no licence assumed (spec Phase 2)",
    "Broad Institute Drug List 2024-03-05": "no verifiable reuse licence on source terms page",
    "Pharmaceutical Manufacturing Encyclopedia (Third Edition)": "copyrighted reference work",
}

STEREO_PREFIX = re.compile(
    r"^(?:\(\s*(?:[rszne+\-±]|rs|sr|\d+[rs](?:\s*,\s*\d+[rs])*)\s*\)|"
    r"\(\s*[+\-±]\s*/?\s*[+\-]?\s*\)|"
    r"[dl]|dl|ld|rac|racemic|cis|trans|meso|[nsoc])"
    r"[\-\s‐-―]+",
    re.IGNORECASE,
)
NON_ALNUM = re.compile(r"[^a-z0-9]+")
UNII_RE = re.compile(r"^[0-9A-Z]{10}$")


def load_salts(path):
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip().lower()
            if line and not line.startswith("#"):
                out.append(line)
    # longest first so "dihydrogen phosphate" wins over "phosphate"
    return sorted(set(out), key=lambda s: (-len(s.split()), -len(s)))


def normalise_name(name, salts):
    if not name:
        return ""
    s = str(name).strip().lower()
    s = s.replace("‐", "-").replace("‑", "-").replace("–", "-").replace("—", "-")
    for _ in range(4):
        new = STEREO_PREFIX.sub("", s, count=1)
        if new == s:
            break
        s = new
    s = re.sub(r"[,;]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    changed = True
    while changed:
        changed = False
        for salt in salts:
            if s.endswith(" " + salt) and len(s) > len(salt) + 1:
                s = s[: -(len(salt) + 1)].strip()
                changed = True
                break
    s = NON_ALNUM.sub("", s)
    return s


def load_corpus(identity_path, assignment_path, salts):
    tier = {}
    with open(assignment_path, encoding="utf-8") as fh:
        for line in fh:
            rec = json.loads(line)
            model = rec.get("model")
            tier[rec["key"]] = 1 if (model == "LONGEVITY" or rec.get("withdrawn")) else (
                2 if model == "CLINICAL" else 3)

    pages = {}
    idx_unii = defaultdict(list)
    idx_ik = defaultdict(list)
    idx_ik14 = defaultdict(list)
    idx_name = defaultdict(list)
    contains = defaultdict(list)  # component key -> [combination keys]

    with open(identity_path, encoding="utf-8") as fh:
        for line in fh:
            rec = json.loads(line)
            key = rec["key"]
            struct = rec.get("structure") or {}
            ik = struct.get("inchikey")
            ik14 = struct.get("inchikey14") or (ik.split("-")[0] if ik else None)
            names = [rec.get("displayName")] + [
                s.get("name") for s in (rec.get("synonyms") or []) if isinstance(s, dict)
            ]
            norm = {normalise_name(n, salts) for n in names if n}
            norm.discard("")
            # A page carries a UNII in two places and they are not always the same substance
            # form: the `unii` field, and the identifier inside a `K1:` key. The metformin
            # page is keyed K1:9100L32L2N (free base) while its `unii` field holds
            # 786Z46389E (hydrochloride). Both are exact UNII join keys for that page.
            page_uniis = []
            if rec.get("unii"):
                page_uniis.append(rec["unii"])
            if key.startswith("K1:") and UNII_RE.match(key[3:]) and key[3:] not in page_uniis:
                page_uniis.append(key[3:])
            pages[key] = {"tier": tier.get(key, 3), "unii": page_uniis[0] if page_uniis else None,
                          "uniis": page_uniis, "ik": ik, "ik14": ik14,
                          "displayName": rec.get("displayName") or "",
                          "isCombination": bool(rec.get("isCombination"))}
            for u in page_uniis:
                idx_unii[u].append(key)
            if ik:
                idx_ik[ik].append(key)
            if ik14:
                idx_ik14[ik14].append(key)
            for n in norm:
                idx_name[n].append(key)
            for rel in rec.get("relations") or []:
                if isinstance(rel, dict) and rel.get("type") == "contains" and rel.get("targetKey"):
                    contains[rel["targetKey"]].append(key)
    return pages, idx_unii, idx_ik, idx_ik14, idx_name, contains


def load_unii_structures(path):
    """UNII -> full InChIKey, from the FDA UNII record dump already held on disk."""
    out = {}
    with open(path, encoding="utf-8", errors="replace") as fh:
        reader = csv.DictReader(fh, delimiter="\t")
        for row in reader:
            ik = (row.get("INCHIKEY") or "").strip()
            unii = (row.get("UNII") or "").strip()
            if unii and ik:
                out[unii] = ik
    return out


class Matcher:
    def __init__(self, pages, idx_unii, idx_ik, idx_ik14, idx_name, contains):
        self.pages = pages
        self.idx_unii = idx_unii
        self.idx_ik = idx_ik
        self.idx_ik14 = idx_ik14
        self.idx_name = idx_name
        self.contains = contains
        self.name_candidates = []

    def match(self, unii=None, inchikey=None, norm_name=None, record_label=""):
        """Return (list of (key, rule, form_of_target), rule_used or None)."""
        if unii and unii in self.idx_unii:
            return [(k, "unii", "") for k in self.idx_unii[unii]], "unii"
        if inchikey and inchikey in self.idx_ik:
            return [(k, "inchikey", "") for k in self.idx_ik[inchikey]], "inchikey"
        if inchikey:
            skel = inchikey.split("-")[0]
            if skel in self.idx_ik14:
                hits = [k for k in self.idx_ik14[skel] if self.pages[k]["ik"] != inchikey]
                if hits:
                    return [(k, "skeleton", inchikey) for k in hits], "skeleton"
        if norm_name and norm_name in self.idx_name:
            hits = self.idx_name[norm_name]
            self.name_candidates.append({
                "source_record": record_label, "normalised_name": norm_name,
                "unii": unii or "", "inchikey": inchikey or "",
                "candidate_pages": "|".join(hits[:10]), "candidate_count": len(hits),
            })
            return [(k, "name-candidate", "") for k in hits], "name-candidate"
        return [], None

    def expand(self, hits):
        """Add the combination pages that contain a matched component page."""
        out = list(hits)
        seen = {h[0] for h in hits}
        for key, rule, form in hits:
            for combo in self.contains.get(key, []):
                if combo not in seen:
                    seen.add(combo)
                    out.append((combo, rule, form))
        return out


def b64_items(value):
    """Stitcher packs curated sub-records as newline separated base64 JSON."""
    out = []
    for part in str(value).split("\n"):
        part = part.strip()
        if not part:
            continue
        try:
            out.append(json.loads(base64.b64decode(part)))
        except Exception:
            continue
    return out


def prop_values(props, name):
    v = props.get(name)
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def parse_npc_target(text):
    parts = str(text).split("|")
    return {"label": parts[0] if parts else "", "organism": parts[1] if len(parts) > 1 else "",
            "genes": [g for g in (parts[2].split("~") if len(parts) > 2 else []) if g],
            "uniprot": [p for p in parts[3:] if p]}


def extract_stitch(rec, node_source):
    """Return {field: [ (value_dict, source_record_suffix) ]} for one stitched record."""
    stitch = rec["stitch"]
    props = stitch.get("sgroup", {}).get("properties", {}) or {}
    out = defaultdict(list)
    denied = Counter()

    def allowed(node):
        src = node_source.get(node)
        if src in DENIED_SOURCES:
            denied[src] += 1
            return None
        if src in ALLOWED_SOURCES:
            return src
        return None

    # mechanism of action
    for item in prop_values(props, "CompoundMOA"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            out["mechanism"].append(({"statement": str(item["value"]), "kind": "pharmacologic class",
                                      "upstreamDataset": src}, f"moa:{item['node']}"))
    for item in prop_values(props, "moa"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            out["mechanism"].append(({"statement": str(item["value"]), "kind": "mechanism of action",
                                      "upstreamDataset": src}, f"moa-curated:{item['node']}"))
    for item in prop_values(props, "Therapeutic Function"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            out["mechanism"].append(({"statement": str(item["value"]), "kind": "therapeutic function",
                                      "upstreamDataset": src}, f"tf:{item['node']}"))

    # targets
    for item in prop_values(props, "targets"):
        src = allowed(item.get("node"))
        if not src:
            continue
        for t in b64_items(item.get("value")):
            out["targets"].append(({
                "label": t.get("primary_target_label"), "targetId": t.get("primary_target_id"),
                "targetIdType": t.get("target_primary_target_type"),
                "pharmacology": t.get("target_pharmacology"),
                "potencyType": t.get("target_primary_potency_type"),
                "evidenceUri": t.get("primary_target_uri"), "upstreamDataset": src,
            }, f"frdb-target:{t.get('target_id')}"))
    for item in prop_values(props, "target"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            for gene in [g for g in str(item["value"]).split("|") if g.strip()]:
                out["targets"].append(({"label": gene, "targetIdType": "gene symbol",
                                        "upstreamDataset": src}, f"gene-target:{item['node']}:{gene}"))
    for item in prop_values(props, "TARGETS"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            parsed = parse_npc_target(item["value"])
            parsed["upstreamDataset"] = src
            out["targets"].append((parsed, f"npc-target:{item['node']}"))

    # approved and off-label uses
    for item in prop_values(props, "conditions"):
        src = allowed(item.get("node"))
        if not src:
            continue
        for c in b64_items(item.get("value")):
            offl = [x for x in str(c.get("offlabel_use") or "").split("|") if x.strip()]
            out["uses"].append(({
                "condition": c.get("name"), "highestPhase": c.get("condition_highest_phase"),
                "approvedUseText": c.get("fda_use"), "offLabelUses": offl,
                "product": c.get("product_name"), "conditionUri": c.get("condition_uri"),
                "highestPhaseUri": c.get("highest_phase_uri"),
                "offLabelUseUri": c.get("offlabel_use_uri"), "upstreamDataset": src,
            }, f"frdb-condition:{c.get('condition_id')}"))
    for item in prop_values(props, "CompoundIndication"):
        src = allowed(item.get("node"))
        if src and item.get("value"):
            out["uses"].append(({"condition": str(item["value"]), "highestPhase": None,
                                 "approvedUseText": None, "offLabelUses": [],
                                 "kind": "indication class", "upstreamDataset": src},
                                f"npc-indication:{item['node']}"))

    # marketing status by jurisdiction, aggregated from the stitched event list
    by_juris = defaultdict(lambda: {"kinds": Counter(), "sources": set(), "sponsors": set(),
                                    "products": set(), "appIds": set(), "start": None,
                                    "latest": None, "active": 0, "total": 0})
    for ev in stitch.get("events") or []:
        src = ev.get("source") or "unattributed"
        if src in DENIED_SOURCES:
            denied[src] += 1
            continue
        # Inxight records some events against several countries in one pipe-joined string;
        # each named country is counted separately. Country labels are kept verbatim.
        raw_j = ev.get("jurisdiction") or "unspecified"
        for j in [x.strip() for x in str(raw_j).split("|") if x.strip()] or ["unspecified"]:
            b = by_juris[j]
            b["total"] += 1
            b["kinds"][ev.get("kind") or "unspecified"] += 1
            b["sources"].add(src)
            if ev.get("sponsor"):
                b["sponsors"].add(ev["sponsor"])
            if ev.get("product"):
                b["products"].add(ev["product"])
            if ev.get("approvalAppId"):
                b["appIds"].add(ev["approvalAppId"])
            if str(ev.get("active")).lower() == "true":
                b["active"] += 1
            d = ev.get("startDate")
            if d:
                b["start"] = d if b["start"] is None else min(b["start"], d)
                b["latest"] = d if b["latest"] is None else max(b["latest"], d)
    for j, b in by_juris.items():
        out["marketingStatus"].append(({
            "jurisdiction": j, "eventCount": b["total"],
            "statusCounts": dict(b["kinds"]), "activeRecords": b["active"],
            "earliestRecordedDate": b["start"], "latestRecordedDate": b["latest"],
            "approvalApplicationIds": sorted(b["appIds"])[:25],
            "products": sorted(b["products"])[:25], "sponsors": sorted(b["sponsors"])[:25],
            "upstreamRegisters": sorted(b["sources"]),
        }, f"jurisdiction:{j}"))

    return out, denied


def stitch_node_sources(stitch):
    out = {}
    for m in stitch.get("sgroup", {}).get("members", []) or []:
        src = m.get("source")
        for k in ("node", "payloadNode"):
            if m.get(k) is not None:
                out[m[k]] = src
    return out


def stitch_identity(stitch):
    """Full InChIKey and preferred names carried by a stitched record."""
    props = stitch.get("sgroup", {}).get("properties", {}) or {}
    iks = []
    for item in prop_values(props, "InChIKey"):
        v = str(item.get("value") or "").strip()
        if re.fullmatch(r"[A-Z]{14}-[A-Z]{10}-[A-Z]", v):
            iks.append(v)
    names = []
    for field in ("PreferredName", "Common Name", "name", "_name", "Chemical Name"):
        for item in prop_values(props, field):
            if item.get("value"):
                names.append(str(item["value"]))
    return iks, names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    ap.add_argument("--identity", default="data/corpus-20k/identity/canonical.ndjson")
    ap.add_argument("--assignment", default="data/corpus-20k/tiers/model-assignment.ndjson")
    ap.add_argument("--unii-records",
                    default="data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt")
    ap.add_argument("--salts", default="scripts/revamp/salts.txt")
    ap.add_argument("--outdir", default="data/sources/inxight")
    ap.add_argument("--raw-base", default=None,
                    help="directory holding the dated raw pull; defaults to <outdir>/<date>")
    args = ap.parse_args()

    base = args.raw_base or os.path.join(args.outdir, args.date)
    salts = load_salts(args.salts)
    pages, idx_unii, idx_ik, idx_ik14, idx_name, contains = load_corpus(
        args.identity, args.assignment, salts)
    matcher = Matcher(pages, idx_unii, idx_ik, idx_ik14, idx_name, contains)
    unii_ik = load_unii_structures(args.unii_records)
    print(f"corpus pages {len(pages)}; unii index {len(idx_unii)}; "
          f"inchikey index {len(idx_ik)}; name index {len(idx_name)}; "
          f"UNII->InChIKey resolver {len(unii_ik)}", flush=True)

    rows = []
    stats = Counter()
    denied_total = Counter()
    matched_pages = defaultdict(set)   # field -> set of keys
    rule_pages = defaultdict(set)      # rule -> set of keys
    unmatched_records = 0
    stitch_records = 0

    def emit(hits, field, value, rec_id, url, sdate):
        payload = json.dumps(value, separators=(",", ":"), sort_keys=True, default=str)
        for key, rule, form in hits:
            rows.append((key, pages[key]["tier"], field, payload, rec_id, url, sdate,
                         rule, form, LICENCE))
            matched_pages[field].add(key)
            rule_pages[rule].add(key)
            stats[f"rows:{field}"] += 1

    # ---------- stitched drug records ----------
    for shard in sorted(glob.glob(os.path.join(base, "raw", "stitcher", "*.ndjson.gz"))):
        with gzip.open(shard, "rt", encoding="utf-8") as fh:
            for line in fh:
                rec = json.loads(line)
                stitch_records += 1
                if rec.get("status") != 200 or not rec.get("stitch"):
                    stats["stitch:no-record"] += 1
                    unmatched_records += 1
                    continue
                stitch = rec["stitch"]
                node_source = stitch_node_sources(stitch)
                iks, names = stitch_identity(stitch)
                hits, rule = matcher.match(
                    unii=rec["unii"], inchikey=iks[0] if iks else None,
                    norm_name=normalise_name(names[0], salts) if names else None,
                    record_label=f"stitcher:{rec['unii']}")
                if not hits:
                    unmatched_records += 1
                    stats["stitch:unmatched"] += 1
                    continue
                hits = matcher.expand(hits)
                fields, denied = extract_stitch(rec, node_source)
                denied_total.update(denied)
                if not fields:
                    stats["stitch:matched-no-fields"] += 1
                url = STITCH_URL.format(key=rec["unii"])
                for field, items in fields.items():
                    for value, suffix in items:
                        emit(hits, field, value,
                             f"inxight-stitch:{stitch.get('id')}:{suffix}", url, args.date)
        print(f"  {os.path.basename(shard)} done; rows so far {len(rows)}", flush=True)

    # ---------- Fast Response Database bulk tables ----------
    frdb = os.path.join(base, "raw", "frdb")

    def read_tsv(name):
        with open(os.path.join(frdb, name), encoding="utf-8", errors="replace") as fh:
            return list(csv.DictReader(fh, delimiter="\t"))

    drugs = read_tsv("frdb-drugs.tsv")
    pk_rows = read_tsv("frdb-pk.tsv")
    tox_rows = read_tsv("frdb-toxicity.tsv")
    ae_rows = read_tsv("frdb-adverseevents.tsv")
    ddi_rows = read_tsv("frdb-ddi.tsv")
    targets_meta = {r["target"]: r for r in read_tsv("frdbmeta-targets.tsv")}

    compound_hits = {}
    frdb_unmatched = 0
    for d in drugs:
        cid = d["compound_id"]
        unii = (d.get("compound_unii") or "").strip()
        ik = unii_ik.get(unii)
        hits, rule = matcher.match(unii=unii or None, inchikey=ik,
                                   norm_name=normalise_name(d.get("compound_name"), salts),
                                   record_label=f"frdb-compound:{cid}:{d.get('compound_name')}")
        if hits:
            compound_hits[cid] = matcher.expand(hits)
            stats[f"frdb-compound-rule:{rule}"] += 1
        else:
            frdb_unmatched += 1
            stats["frdb-compound:unmatched"] += 1
    unmatched_records += frdb_unmatched

    for r in pk_rows:
        hits = compound_hits.get(r["compound_id"])
        if not hits:
            continue
        value = {k: v for k, v in r.items() if v not in ("", None, "-")}
        value["frdbVersion"] = FRDB_VERSION
        emit(hits, "pk", value, f"frdb:pk:{r['id']}", FRDB_URL, FRDB_VERSION)

    tox_by_id = {r["id"]: r for r in tox_rows}
    for r in ae_rows:
        tox = tox_by_id.get(r.get("tox_id"))
        if not tox:
            stats["frdb-ae:no-study"] += 1
            continue
        hits = compound_hits.get(tox["compound_id"])
        if not hits:
            continue
        # Field roles follow frdbmeta-data_model.tsv: adverseevents_liability carries the
        # MedDRA-normalised event name; adverseevents_type records whether the event led to
        # discontinuation or a dose change; adverseevents_frequency_units is not populated.
        value = {
            "event": r.get("adverseevents_liability"),
            "frequency": r.get("adverseevents_frequency"),
            "severity": r.get("adverseevents_severity"),
            "treatmentChange": r.get("adverseevents_type"),
            "doseLimitingToxicity": r.get("adverseevents_dlt"),
            "comment": r.get("adverseevents_comment"),
            "study": {k: v for k, v in tox.items()
                      if k in ("toxicity_species", "toxicity_routes", "toxicity_age_group",
                               "toxicity_health_status", "toxicity_dose_value",
                               "toxicity_dose_units", "toxicity_experiment_type",
                               "toxicity_population_size", "toxicity_source_type",
                               "toxicity_source_uri", "toxicity_duration",
                               "toxicity_duration_units") and v not in ("", None)},
            "frdbVersion": FRDB_VERSION,
        }
        value = {k: v for k, v in value.items() if v not in ("", None, {})}
        emit(hits, "adverseEvents", value, f"frdb:adverseevent:{r['id']}", FRDB_URL, FRDB_VERSION)

    for r in ddi_rows:
        hits = compound_hits.get(r["compound_id"])
        if not hits:
            continue
        tgt = targets_meta.get(r.get("ddi_target") or "", {})
        value = {
            "interactionTier": "B",
            "target": r.get("ddi_target"),
            "targetClass": tgt.get("class") or None,
            "targetName": tgt.get("name") or None,
            "targetChembl": tgt.get("ChEMBL") or None,
            "targetUniprot": (tgt.get("UNIPROT") if tgt.get("UNIPROT") not in ("-", "", None) else None),
            "role": r.get("ddi_relation"),
            "measure": r.get("ddi_type"),
            "activityValue": r.get("ddi_activity") or None,
            "concentration": r.get("ddi_concentration") or None,
            # ddi_magnitude is the standardised finding and includes "no", meaning the
            # curator recorded that this drug does not interact with this target.
            "magnitude": r.get("ddi_magnitude") or None,
            "interactionFound": {"no": False, "yes": True, "weak": True,
                                 "strong": True}.get(r.get("ddi_magnitude")),
            "magnitudeReported": r.get("ddi_reported_magnitude") or None,
            "clinicalEvidence": r.get("ddi_clin_evidence") or None,
            "clinicalSupport": r.get("ddi_clin_support") or None,
            "clinicalComment": r.get("ddi_clin_comment") or None,
            "metabolite": r.get("ddi_metabolyte") or None,
            "comment": r.get("ddi_comment") or None,
            "evidenceUri": r.get("ddi_url") or None,
            "inxightRecordId": f"frdb:ddi:{r['id']}",
            "frdbVersion": FRDB_VERSION,
        }
        value = {k: v for k, v in value.items() if v is not None and v != ""}
        emit(hits, "ddi", value, f"frdb:ddi:{r['id']}", FRDB_URL, FRDB_VERSION)

    # ---------- write ----------
    os.makedirs(args.outdir, exist_ok=True)
    table = pa.Table.from_arrays(
        [pa.array([r[i] for r in rows]) for i in range(10)],
        names=["key", "tier", "field", "value", "source_record_id", "source_url",
               "source_date", "match_rule", "form_of_target", "licence"])
    out_parquet = os.path.join(args.outdir, "mapped.parquet")
    pq.write_table(table, out_parquet, compression="zstd")

    cand_path = os.path.join(args.outdir, "name-candidates-for-review.csv")
    with open(cand_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["source_record", "normalised_name", "unii",
                                           "inchikey", "candidate_pages", "candidate_count"])
        w.writeheader()
        for c in matcher.name_candidates:
            w.writerow(c)

    shared_dir = os.path.join("data/revamp/name-candidates")
    os.makedirs(shared_dir, exist_ok=True)
    shared_path = os.path.join(shared_dir, "inxight.csv")
    with open(shared_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["corpus_key", "corpus_display_name", "corpus_tier", "corpus_unii",
                    "corpus_inchikey", "inxight_record", "normalised_name",
                    "inxight_unii", "inxight_inchikey", "ambiguous_pages_for_name",
                    "confirmation"])
        for c in matcher.name_candidates:
            for key in c["candidate_pages"].split("|"):
                if not key:
                    continue
                pg = pages[key]
                w.writerow([key, pg["displayName"], pg["tier"], pg["unii"] or "", pg["ik"] or "",
                            c["source_record"], c["normalised_name"], c["unii"], c["inchikey"],
                            c["candidate_count"],
                            "none - corpus page and Inxight record share no UNII and no "
                            "InChIKey; needs a human decision"])

    df = pd.DataFrame(rows, columns=["key", "tier", "field", "value", "source_record_id",
                                     "source_url", "source_date", "match_rule",
                                     "form_of_target", "licence"])
    tier_of = {k: v["tier"] for k, v in pages.items()}
    tier_totals = Counter(tier_of.values())
    pages_by_tier = {str(t): int(df[df.tier == t]["key"].nunique()) for t in (1, 2, 3)}
    fields_by_tier = {
        str(t): {f: int(g["key"].nunique()) for f, g in df[df.tier == t].groupby("field")}
        for t in (1, 2, 3)}
    rules_by_tier = {
        str(t): {r: int(g["key"].nunique()) for r, g in df[df.tier == t].groupby("match_rule")}
        for t in (1, 2, 3)}

    stitch_ids = defaultdict(set)
    for r in rows:
        if r[4].startswith("inxight-stitch:"):
            stitch_ids[r[0]].add(r[4].split(":")[1])
    multi_stitch = sum(1 for v in stitch_ids.values() if len(v) > 1)
    juris_pages = defaultdict(set)
    for r in rows:
        if r[2] == "marketingStatus":
            juris_pages[json.loads(r[3])["jurisdiction"]].add(r[0])
    coverage = {
        "source": "inxight",
        "sourceName": "NCATS Inxight Drugs",
        "retrievedDate": args.date,
        "licence": LICENCE,
        "corpusPagesByTier": {str(t): int(tier_totals[t]) for t in (1, 2, 3)},
        "pagesMatchedByTier": pages_by_tier,
        "pagesMatchedByTierPercent": {
            str(t): round(100.0 * pages_by_tier[str(t)] / tier_totals[t], 2) for t in (1, 2, 3)},
        "fieldsGainedByTier": fields_by_tier,
        "matchRulePagesByTier": rules_by_tier,
        "pagesByMatchRule": {r: len(v) for r, v in rule_pages.items()},
        "rowsByField": {f: int(v) for f, v in
                        df.groupby("field").size().items()} if len(df) else {},
        "totalRows": int(len(df)),
        "unmatchedRecordCount": int(unmatched_records),
        "nameCandidatesSentToReview": len(matcher.name_candidates),
        "stitchedRecordsRead": stitch_records,
        "frdbCompoundsRead": len(drugs),
        "frdbCompoundsUnmatched": frdb_unmatched,
        "excludedUpstreamDatasets": {k: {"reason": DENIED_SOURCES[k], "valuesDropped": int(v)}
                                     for k, v in denied_total.items()},
        "marketingStatusPagesByJurisdiction": {
            k: len(v) for k, v in sorted(juris_pages.items(), key=lambda kv: -len(kv[1]))},
        "jurisdictionLabelNote": "Country labels are the source's own strings and are not "
                                 "normalised here; US/USA and EU/European Union/Europe appear as "
                                 "distinct labels and need a documented mapping table before use.",
        "pagesWithMultipleStitchedRecords": multi_stitch,
        "multipleStitchedRecordsNote": "A page whose `unii` field and whose K1: key name two "
                                       "substance forms is joined to both Inxight stitched "
                                       "records, so it can carry two rows for one jurisdiction, "
                                       "each with its own source_record_id. The rows are distinct "
                                       "records, not duplicates; a reader-facing view must merge "
                                       "them by jurisdiction rather than sum them.",
        "counters": {k: int(v) for k, v in sorted(stats.items())},
        "outputs": {"mapped": out_parquet, "nameCandidates": cand_path,
                    "phase3ReviewList": shared_path},
    }
    with open(os.path.join(args.outdir, "coverage.json"), "w", encoding="utf-8") as fh:
        json.dump(coverage, fh, indent=2)
    print(json.dumps({k: coverage[k] for k in
                      ("totalRows", "pagesMatchedByTier", "unmatchedRecordCount",
                       "nameCandidatesSentToReview", "pagesByMatchRule")}, indent=1))


if __name__ == "__main__":
    main()
