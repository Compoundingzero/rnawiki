#!/usr/bin/env python
"""Phase 2 stage 2 — DEVELOPMENT field extractor (docs/specs/field-models.md, 8 fields).

Every value is copied from a source on disk with that source's own identifier and date (R9).
No external calls. No number the source does not state. Absent = every mapped source consulted
and silent; not-applicable = the field does not apply to this page's class, with the rule named.

Sources (all local):
  ChEMBL 37 molecules / mechanism / indication  data/corpus-20k/raw/chembl/
  Open Targets 26.06 MoA + target parquet       data/corpus-20k/raw/open-targets/
  ClinicalTrials.gov snapshot 2026-09-01        rnawiki-ingest-data/clinicaltrials/20260901T090005/
  registry aggregates + matches                 data/corpus-20k/registry/
  openFDA Orange Book export 2026-08-28         rnawiki-ingest-data/openfda/drug-orangebook-...json
"""

from __future__ import annotations

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
D = os.path.join(ROOT, "data", "corpus-20k")
OUT_DIR = os.environ.get("DEVELOPMENT_OUT_DIR") or os.path.join(D, "fields", "development")
# Phase 2b: extract only the keys listed in this file (one per line); every join is still built over
# the whole DEVELOPMENT scope. DEVELOPMENT_NO_RECORD=1 leaves the batch ledger to the caller.
ONLY_KEYS_FILE = os.environ.get("DEVELOPMENT_ONLY_KEYS")
NO_RECORD = os.environ.get("DEVELOPMENT_NO_RECORD") == "1"
CT_DIR = os.path.join(INGEST, "clinicaltrials", "20260901T090005")

TODAY = date.today().isoformat()
BATCH_SIZE = 250
STEP = "fields-development"
PHASE = "2"

# Source dates: the source record's own date where it has one, else the archive/export date (R9).
CHEMBL_DATE = "2026-09-04"          # ChEMBL 37 export pulled on this date (state.json batches)
CHEMBL_ID = "ChEMBL 37"
OT_DATE = "2026-06-24"              # Open Targets 26.06, built 2026-06-24 (raw/open-targets/README.md)
OT_ID = "Open Targets Platform 26.06"
REGISTRY_DATE = "2026-09-01"        # snapshot dataTimestamp 2026-09-01T09:00:05
OB_DATE = "2026-08-28"              # openFDA Orange Book export meta.last_updated

RELATED_CAP = 40
SPONSOR_CAP = 25

PHASE_ORDER = [
    "PHASE4",
    "PHASE3",
    "PHASE2_PHASE3",
    "PHASE2",
    "PHASE1_PHASE2",
    "PHASE1",
    "EARLY_PHASE1",
    "NA_OR_UNSTATED",
    "NA",
]

issues: list[str] = []


def log(msg: str) -> None:
    print(msg, flush=True)


def norm(s: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (s or "").upper())


def chembl_compound_url(cid: str) -> str:
    return f"https://www.ebi.ac.uk/chembl/compound_report_card/{cid}/"


def chembl_target_url(tid: str) -> str:
    return f"https://www.ebi.ac.uk/chembl/target_report_card/{tid}/"


def present(value, kind, ident, url, source_date, verbatim):
    return {
        "state": "present",
        "value": value,
        "source": {"kind": kind, "id": ident, "url": url},
        "sourceDate": source_date,
        "lastVerified": TODAY,
        "verbatim": verbatim,
    }


def absent(note):
    return {
        "state": "absent",
        "value": None,
        "source": None,
        "sourceDate": None,
        "lastVerified": TODAY,
        "verbatim": False,
        "note": note,
    }


def not_applicable(rule):
    return {
        "state": "not-applicable",
        "value": None,
        "source": None,
        "sourceDate": None,
        "lastVerified": TODAY,
        "verbatim": False,
        "note": rule,
    }


# ---------------------------------------------------------------- inputs

def load_models():
    order, dev = [], set()
    for line in open(os.path.join(D, "tiers", "model-assignment.ndjson")):
        r = json.loads(line)
        if r["model"] == "DEVELOPMENT":
            order.append(r["key"])
            dev.add(r["key"])
    if ONLY_KEYS_FILE:
        wanted = {ln.strip() for ln in open(ONLY_KEYS_FILE) if ln.strip()}
        order = [k for k in order if k in wanted]
    return order, dev


def load_canonical(dev):
    pages, chembl_to_key, key_name = {}, {}, {}
    for line in open(os.path.join(D, "identity", "canonical.ndjson")):
        r = json.loads(line)
        k = r["key"]
        key_name[k] = r.get("displayName")
        cid = r.get("chemblId")
        if cid and cid not in chembl_to_key:
            chembl_to_key[cid] = k
        if k in dev:
            names = [r.get("displayName") or ""]
            names += [s.get("name") or "" for s in (r.get("synonyms") or [])]
            pages[k] = {
                "displayName": r.get("displayName"),
                "chemblId": cid,
                "isBiologic": bool(r.get("isBiologic")),
                "isCombination": bool(r.get("isCombination")),
                "names": [n for n in names if n],
                "structure": r.get("structure"),
            }
    return pages, chembl_to_key, key_name


def load_suppression(dev):
    out = {}
    for line in open(os.path.join(D, "suppression", "assignments.ndjson")):
        r = json.loads(line)
        if r["key"] in dev:
            out[r["key"]] = bool(r.get("suppressed"))
    return out


def load_chembl_molecules():
    mols = {}
    for f in sorted(glob.glob(os.path.join(D, "raw", "chembl", "molecules-*.json"))):
        for m in json.load(open(f))["molecules"]:
            mp = m.get("max_phase")
            try:
                mpf = float(mp) if mp is not None else None
            except (TypeError, ValueError):
                mpf = None
            mols[m["molecule_chembl_id"]] = {
                "maxPhase": mp,
                "maxPhaseNum": mpf,
                "prefName": m.get("pref_name"),
                "crossReferences": m.get("cross_references") or [],
                "parent": (m.get("molecule_hierarchy") or {}).get("parent_chembl_id"),
            }
    return mols


def load_chembl_mechanism():
    by_mol = defaultdict(list)
    target_to_mols = defaultdict(set)
    for f in sorted(glob.glob(os.path.join(D, "raw", "chembl", "mechanism-*.json"))):
        for r in json.load(open(f))["mechanisms"]:
            row = {
                "actionType": r.get("action_type"),
                "mechanismOfAction": r.get("mechanism_of_action"),
                "targetChemblId": r.get("target_chembl_id"),
                "moleculeChemblId": r.get("molecule_chembl_id"),
                "maxPhase": r.get("max_phase"),
                "refs": [
                    {"type": x.get("ref_type"), "id": x.get("ref_id"), "url": x.get("ref_url")}
                    for x in (r.get("mechanism_refs") or [])
                ],
            }
            for mid in {r.get("molecule_chembl_id"), r.get("parent_molecule_chembl_id")}:
                if mid:
                    by_mol[mid].append(row)
                    if row["targetChemblId"]:
                        target_to_mols[row["targetChemblId"]].add(mid)
    return by_mol, target_to_mols


def load_chembl_indications():
    by_mol = defaultdict(list)
    for f in sorted(glob.glob(os.path.join(D, "raw", "chembl", "indication-*.json"))):
        for r in json.load(open(f))["drug_indications"]:
            row = {
                "efoTerm": r.get("efo_term"),
                "meshHeading": r.get("mesh_heading"),
                "maxPhaseForIndication": r.get("max_phase_for_ind"),
                "refs": [
                    {"type": x.get("ref_type"), "id": x.get("ref_id"), "url": x.get("ref_url")}
                    for x in (r.get("indication_refs") or [])
                ],
            }
            for mid in {r.get("molecule_chembl_id"), r.get("parent_molecule_chembl_id")}:
                if mid:
                    by_mol[mid].append(row)
    return by_mol


def load_open_targets():
    import pyarrow.parquet as pq

    ensg_name = {}
    for f in sorted(glob.glob(os.path.join(D, "raw", "open-targets", "target", "*.parquet"))):
        t = pq.read_table(f, columns=["id", "approvedSymbol", "approvedName"])
        for i, s, n in zip(
            t.column("id").to_pylist(),
            t.column("approvedSymbol").to_pylist(),
            t.column("approvedName").to_pylist(),
        ):
            ensg_name[i] = {"symbol": s, "approvedName": n}

    moa_by_chembl = defaultdict(list)
    moa_by_text = {}
    for f in sorted(glob.glob(os.path.join(D, "raw", "open-targets", "drug_mechanism_of_action", "*.parquet"))):
        t = pq.read_table(f)
        cols = {c: t.column(c).to_pylist() for c in ["actionType", "mechanismOfAction", "chemblIds", "targetName", "targetType", "targets"]}
        for i in range(t.num_rows):
            row = {
                "actionType": cols["actionType"][i],
                "mechanismOfAction": cols["mechanismOfAction"][i],
                "targetName": cols["targetName"][i],
                "targetType": cols["targetType"][i],
                "targets": cols["targets"][i] or [],
            }
            for cid in cols["chemblIds"][i] or []:
                moa_by_chembl[cid].append(row)
            key = (norm(row["mechanismOfAction"] or ""), (row["actionType"] or "").upper())
            if key[0] and key not in moa_by_text:
                moa_by_text[key] = row
    return ensg_name, moa_by_chembl, moa_by_text


def load_aggregates(dev):
    dev_agg = {}
    all_slim = {}
    for f in sorted(glob.glob(os.path.join(D, "registry", "aggregates", "*.ndjson"))):
        for line in open(f):
            r = json.loads(line)
            k = r["key"]
            all_slim[k] = {
                "hasStopped": bool(r.get("stopped")),
                "hasOngoing": bool(r.get("ongoing")),
                "studies": r.get("studies") or 0,
            }
            if k in dev:
                dev_agg[k] = r
    return dev_agg, all_slim


def load_matches(dev):
    out = {}
    for f in sorted(glob.glob(os.path.join(D, "registry", "matches", "*.ndjson"))):
        for line in open(f):
            r = json.loads(line)
            if r["key"] in dev:
                out[r["key"]] = [x["nct"] for x in (r.get("nctIds") or [])]
    return out


def load_ct_studies(needed: set[str]):
    """One streaming pass: lead sponsor and start date for the NCTs the DEVELOPMENT set uses."""
    out = {}
    path = os.path.join(CT_DIR, "studies.ndjson")
    with open(path) as fh:
        for line in fh:
            i = line.find('"nctId"')
            if i < 0:
                continue
            m = re.search(r'"nctId"\s*:\s*"([^"]+)"', line[i : i + 60])
            if not m or m.group(1) not in needed:
                continue
            r = json.loads(line)
            p = r.get("protocolSection") or {}
            sponsor = ((p.get("sponsorCollaboratorsModule") or {}).get("leadSponsor") or {})
            status = p.get("statusModule") or {}
            out[m.group(1)] = {
                "leadSponsor": sponsor.get("name"),
                "leadSponsorClass": sponsor.get("class"),
                "startDate": (status.get("startDateStruct") or {}).get("date"),
                "overallStatus": status.get("overallStatus"),
            }
    return out


def load_orange_book():
    idx = defaultdict(list)
    d = json.load(open(os.path.join(INGEST, "openfda", "drug-orangebook-0001-of-0001.json")))
    for rec in d["results"]:
        for p in rec.get("products") or []:
            appl = p.get("application_number")
            entry = {
                "applicationNumber": appl,
                "applicationType": p.get("application_type"),
                "brandName": p.get("brand_name"),
                "approvalDate": rec.get("approval_date"),
                "marketingStatus": p.get("marketing_status"),
            }
            for ing in p.get("active_ingredients") or []:
                n = norm(ing.get("name") or "")
                if len(n) >= 4:
                    idx[n].append(entry)
    return idx


# ---------------------------------------------------------------- field builders

def build_target(page, mech_rows, moa_by_chembl, moa_by_text, ensg_name):
    cid = page["chemblId"]
    items = []
    seen = set()
    for r in mech_rows:
        tid = r["targetChemblId"]
        if not tid or tid in seen:
            continue
        seen.add(tid)
        pref = None
        hit = moa_by_text.get((norm(r["mechanismOfAction"] or ""), (r["actionType"] or "").upper()))
        if hit and hit.get("targetName"):
            pref = {
                "prefName": hit["targetName"],
                "source": {"kind": "open-targets", "id": OT_ID, "url": "https://platform.opentargets.org/"},
                "sourceDate": OT_DATE,
            }
        items.append(
            {
                "kind": "chembl-mechanism-target",
                "targetChemblId": tid,
                "prefName": pref,
                "source": {"kind": "chembl", "id": cid, "url": chembl_compound_url(cid)},
                "sourceDate": CHEMBL_DATE,
                "targetUrl": chembl_target_url(tid),
            }
        )
    ot_items = []
    ot_seen = set()
    for r in moa_by_chembl.get(cid or "", []):
        for ensg in r["targets"]:
            if ensg in ot_seen:
                continue
            ot_seen.add(ensg)
            nm = ensg_name.get(ensg) or {}
            ot_items.append(
                {
                    "kind": "open-targets-moa-target",
                    "ensemblId": ensg,
                    "symbol": nm.get("symbol"),
                    "approvedName": nm.get("approvedName"),
                    "targetName": r.get("targetName"),
                    "source": {"kind": "open-targets", "id": OT_ID, "url": f"https://platform.opentargets.org/target/{ensg}"},
                    "sourceDate": OT_DATE,
                }
            )
    if not items and not ot_items:
        if not cid:
            return not_applicable(
                "no ChEMBL identifier for this page, so neither the ChEMBL mechanism table nor the "
                "Open Targets mechanism-of-action table can be keyed to it"
            )
        return absent("ChEMBL 37 mechanism and Open Targets 26.06 mechanism-of-action hold no target row for this ChEMBL id")
    if items:
        return present(
            {"chemblTargets": items, "openTargetsTargets": ot_items},
            "chembl",
            cid,
            chembl_compound_url(cid),
            CHEMBL_DATE,
            True,
        )
    return present(
        {"chemblTargets": [], "openTargetsTargets": ot_items},
        "open-targets",
        cid,
        f"https://platform.opentargets.org/drug/{cid}",
        OT_DATE,
        True,
    )


def build_mechanism_class(page, mech_rows):
    cid = page["chemblId"]
    if not cid:
        return not_applicable("no ChEMBL identifier for this page, so the ChEMBL mechanism table cannot be keyed to it")
    if not mech_rows:
        return absent("ChEMBL 37 mechanism holds no row for this ChEMBL id")
    items = [
        {
            "actionType": r["actionType"],
            "mechanismOfAction": r["mechanismOfAction"],
            "targetChemblId": r["targetChemblId"],
            "references": r["refs"],
        }
        for r in mech_rows
    ]
    return present(items, "chembl", cid, chembl_compound_url(cid), CHEMBL_DATE, True)


def build_highest_phase(page, mol, agg):
    cid = page["chemblId"]
    value = {}
    if mol and mol.get("maxPhase") is not None:
        value["chembl"] = {
            "maxPhase": mol["maxPhase"],
            "source": {"kind": "chembl", "id": cid, "url": chembl_compound_url(cid)},
            "sourceDate": CHEMBL_DATE,
        }
    if agg:
        by_phase = agg.get("byPhase") or {}
        highest = next((p for p in PHASE_ORDER if by_phase.get(p)), None)
        unknown = [p for p in by_phase if p not in PHASE_ORDER]
        if unknown:
            issues.append(f"registry phase label not in the ordering: {sorted(unknown)[:3]}")
        if highest:
            value["registry"] = {
                "highestPhase": highest,
                "studiesAtThatPhase": by_phase[highest],
                "studiesMatched": agg.get("studies"),
                "byPhase": by_phase,
                "source": {
                    "kind": "clinicaltrials.gov",
                    "id": "studies snapshot 2026-09-01T09:00:05",
                    "url": "https://clinicaltrials.gov/",
                },
                "sourceDate": REGISTRY_DATE,
            }
    if not value:
        return absent("ChEMBL 37 states no max_phase for this page and no ClinicalTrials.gov study matched it")
    if "chembl" in value:
        return present(value, "chembl", cid, chembl_compound_url(cid), CHEMBL_DATE, True)
    return present(
        value,
        "clinicaltrials.gov",
        "studies snapshot 2026-09-01T09:00:05",
        "https://clinicaltrials.gov/",
        REGISTRY_DATE,
        True,
    )


def build_why_stopped(agg):
    if not agg:
        return absent("no ClinicalTrials.gov study matched this page, so the registry states no stop reason")
    rows = [
        {
            "nct": s["nct"],
            "status": s.get("status"),
            "whyStopped": s.get("whyStopped"),
            "url": f"https://clinicaltrials.gov/study/{s['nct']}",
        }
        for s in (agg.get("stopped") or [])
        if (s.get("whyStopped") or "").strip()
    ]
    if not rows:
        return absent(
            "matched ClinicalTrials.gov records include no stopped study carrying a whyStopped statement"
        )
    return present(
        rows,
        "clinicaltrials.gov",
        "studies snapshot 2026-09-01T09:00:05",
        "https://clinicaltrials.gov/",
        REGISTRY_DATE,
        True,
    )


OWNER_XREF_SOURCES = {"DRUGBANK_OWNER", "COMPANY", "OWNER"}


def build_sponsor(page, mol, ncts, ct):
    counts = defaultdict(int)
    example = {}
    klass = {}
    for n in ncts:
        s = ct.get(n)
        if not s or not s.get("leadSponsor"):
            continue
        counts[s["leadSponsor"]] += 1
        klass[s["leadSponsor"]] = s.get("leadSponsorClass")
        example.setdefault(s["leadSponsor"], n)
    xrefs = [
        {"source": x.get("xref_src"), "id": x.get("xref_id"), "name": x.get("xref_name")}
        for x in ((mol or {}).get("crossReferences") or [])
        if (x.get("xref_src") or "").upper() in OWNER_XREF_SOURCES
    ]
    if not counts and not xrefs:
        return absent(
            "no matched ClinicalTrials.gov record names a lead sponsor and ChEMBL 37 cross_references "
            "for this molecule state no owner"
        )
    ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    items = [
        {
            "name": name,
            "leadSponsorClass": klass[name],
            "studies": c,
            "exampleNct": example[name],
            "url": f"https://clinicaltrials.gov/study/{example[name]}",
            "source": {"kind": "clinicaltrials.gov", "id": example[name]},
            "sourceDate": REGISTRY_DATE,
        }
        for name, c in ordered[:SPONSOR_CAP]
    ]
    value = {"registryLeadSponsors": items, "chemblOwnerCrossReferences": xrefs}
    if len(ordered) > SPONSOR_CAP:
        value["registryLeadSponsorsTruncated"] = len(ordered) - SPONSOR_CAP
    return present(
        value,
        "clinicaltrials.gov",
        "studies snapshot 2026-09-01T09:00:05",
        "https://clinicaltrials.gov/",
        REGISTRY_DATE,
        True,
    )


OB_RULE = (
    "the Orange Book lists patents only against an approved US application; this page carries no "
    "approved US application in the openFDA Orange Book export, so the field does not apply"
)
OB_NO_PATENT_ROWS = (
    "the page matches an Orange Book product by active-ingredient name, but the openFDA Orange Book "
    "export on disk carries application, product and approval rows only and states no patent row"
)


def build_patent_status(page, ob_index):
    hits = []
    seen = set()
    for name in page["names"]:
        n = norm(name)
        if len(n) < 4:
            continue
        for e in ob_index.get(n, []):
            k = (e["applicationNumber"], e["brandName"])
            if k in seen:
                continue
            seen.add(k)
            hits.append(dict(e, matchedIngredientName=name))
    if not hits:
        return not_applicable(OB_RULE)
    return absent(OB_NO_PATENT_ROWS)


def build_ever_dosed(page, mol, agg, ncts, ct, indications):
    cid = page["chemblId"]
    if agg and (agg.get("studies") or 0) > 0:
        dated = [(ct[n]["startDate"], n) for n in ncts if ct.get(n) and ct[n].get("startDate")]
        dated.sort()
        ev = None
        if dated:
            ev = {
                "kind": "registry-study",
                "nct": dated[0][1],
                "startDate": dated[0][0],
                "url": f"https://clinicaltrials.gov/study/{dated[0][1]}",
            }
        else:
            ev = {
                "kind": "registry-study",
                "nct": None,
                "startDate": agg.get("firstStartDate"),
                "url": "https://clinicaltrials.gov/",
            }
        return present(
            {
                "everDosedInHumans": True,
                "basis": "a ClinicalTrials.gov study matched this page",
                "matchedStudies": agg.get("studies"),
                "evidence": ev,
            },
            "clinicaltrials.gov",
            ev.get("nct") or "studies snapshot 2026-09-01T09:00:05",
            ev["url"],
            REGISTRY_DATE,
            False,
        )
    mp = (mol or {}).get("maxPhaseNum")
    inds = indications.get(cid or "", [])
    if mp is not None and mp >= 1 and inds:
        first = inds[0]
        return present(
            {
                "everDosedInHumans": True,
                "basis": "ChEMBL max_phase is 1 or higher and ChEMBL records a human indication for this molecule",
                "chemblMaxPhase": mol["maxPhase"],
                "evidence": {
                    "kind": "chembl-indication",
                    "indication": first.get("efoTerm") or first.get("meshHeading"),
                    "maxPhaseForIndication": first.get("maxPhaseForIndication"),
                    "references": first.get("refs"),
                    "url": chembl_compound_url(cid),
                },
            },
            "chembl",
            cid,
            chembl_compound_url(cid),
            CHEMBL_DATE,
            False,
        )
    return present(
        {
            "everDosedInHumans": False,
            "basis": "no registry trial or ChEMBL phase record",
            "chemblMaxPhase": (mol or {}).get("maxPhase"),
            "matchedStudies": 0,
            "evidence": None,
        },
        "clinicaltrials.gov+chembl",
        cid or "no ChEMBL id",
        "https://clinicaltrials.gov/",
        REGISTRY_DATE,
        False,
    )


def outcome_for(key, chembl_id, molecules, all_slim):
    mol = molecules.get(chembl_id or "") or {}
    slim = all_slim.get(key) or {}
    if mol.get("maxPhaseNum") == 4.0:
        return "approved"
    if slim.get("hasStopped"):
        return "stopped"
    if slim.get("hasOngoing"):
        return "ongoing"
    return "unknown"


def build_related_on_target(key, page, mech_rows, target_to_mols, chembl_to_key, key_name, molecules, all_slim):
    cid = page["chemblId"]
    if not cid:
        return not_applicable(
            "no ChEMBL identifier for this page, so it holds no ChEMBL mechanism target to share"
        )
    targets = sorted({r["targetChemblId"] for r in mech_rows if r["targetChemblId"]})
    if not targets:
        return absent("ChEMBL 37 mechanism records no target for this ChEMBL id, so no shared-target set exists")
    groups = []
    total = 0
    for tid in targets:
        rows = []
        for mid in sorted(target_to_mols.get(tid, ())):
            k = chembl_to_key.get(mid)
            if not k or k == key:
                continue
            rows.append(
                {
                    "key": k,
                    "displayName": key_name.get(k),
                    "chemblId": mid,
                    "outcome": outcome_for(k, mid, molecules, all_slim),
                }
            )
        seen, dedup = set(), []
        for r in rows:
            if r["key"] in seen:
                continue
            seen.add(r["key"])
            dedup.append(r)
        dedup.sort(key=lambda r: (r["key"]))
        g = {
            "targetChemblId": tid,
            "targetUrl": chembl_target_url(tid),
            "compounds": dedup[:RELATED_CAP],
        }
        if len(dedup) > RELATED_CAP:
            g["truncated"] = len(dedup) - RELATED_CAP
        total += len(dedup)
        groups.append(g)
    if total == 0:
        return absent(
            "no other canonical page in this corpus carries a ChEMBL mechanism row against the same target"
        )
    return present(
        {
            "targets": groups,
            "outcomeRule": (
                "approved = ChEMBL max_phase 4; stopped = a stopped registry study and no approval; "
                "ongoing = an active registry study; otherwise unknown"
            ),
        },
        "chembl",
        cid,
        chembl_compound_url(cid),
        CHEMBL_DATE,
        False,
    )


# ---------------------------------------------------------------- main

def recorded_batches():
    st = json.load(open(os.path.join(D, "state.json")))
    return {b["batch"] for b in st.get("batches", []) if b.get("step") == STEP}


def record(batch_no, path, count):
    if NO_RECORD:
        return
    subprocess.run(
        ["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--step", STEP,
         "--batch", str(batch_no), "--file", path, "--records", str(count)],
        cwd=ROOT, check=True, capture_output=True,
    )


def main():
    log("loading model assignment")
    order, dev = load_models()
    log(f"DEVELOPMENT pages: {len(order)}")

    log("loading canonical identity")
    pages, chembl_to_key, key_name = load_canonical(dev)
    suppressed = load_suppression(dev)

    log("loading ChEMBL molecules / mechanism / indication")
    molecules = load_chembl_molecules()
    mech_by_mol, target_to_mols = load_chembl_mechanism()
    indications = load_chembl_indications()

    log("loading Open Targets MoA and target names")
    ensg_name, moa_by_chembl, moa_by_text = load_open_targets()

    log("loading registry aggregates and matches")
    agg_dev, all_slim = load_aggregates(dev)
    matches = load_matches(dev)

    needed = set()
    for k in order:
        needed.update(matches.get(k, []))
    log(f"streaming ClinicalTrials.gov snapshot for {len(needed)} matched NCT records")
    ct = load_ct_studies(needed)
    missing = len(needed) - len(ct)
    if missing:
        issues.append(f"{missing} matched NCT ids are absent from the 2026-09-01 snapshot file")

    log("loading Orange Book export")
    ob_index = load_orange_book()

    done = recorded_batches()
    field_names = [
        "target", "mechanismClass", "highestPhase", "whyStopped",
        "sponsor", "patentStatus", "everDosedInHumans", "relatedOnTarget",
    ]
    present_by_field = {f: 0 for f in field_names}
    state_counts = {f: defaultdict(int) for f in field_names}

    total_batches = (len(order) + BATCH_SIZE - 1) // BATCH_SIZE
    written = 0
    for bi in range(total_batches):
        batch_no = bi + 1
        path = os.path.join(OUT_DIR, f"batch-{batch_no:04d}.ndjson")
        chunk = order[bi * BATCH_SIZE : (bi + 1) * BATCH_SIZE]
        lines = []
        for key in chunk:
            page = pages[key]
            cid = page["chemblId"]
            mol = molecules.get(cid or "")
            mech_rows = mech_by_mol.get(cid or "", [])
            agg = agg_dev.get(key)
            ncts = matches.get(key, [])
            fields = {
                "target": build_target(page, mech_rows, moa_by_chembl, moa_by_text, ensg_name),
                "mechanismClass": build_mechanism_class(page, mech_rows),
                "highestPhase": build_highest_phase(page, mol, agg),
                "whyStopped": build_why_stopped(agg),
                "sponsor": build_sponsor(page, mol, ncts, ct),
                "patentStatus": build_patent_status(page, ob_index),
                "everDosedInHumans": build_ever_dosed(page, mol, agg, ncts, ct, indications),
                "relatedOnTarget": build_related_on_target(
                    key, page, mech_rows, target_to_mols, chembl_to_key, key_name, molecules, all_slim
                ),
            }
            for f, v in fields.items():
                state_counts[f][v["state"]] += 1
                if v["state"] == "present":
                    present_by_field[f] += 1
            lines.append(
                json.dumps(
                    {
                        "key": key,
                        "model": "DEVELOPMENT",
                        "fields": fields,
                        "suppressed": suppressed.get(key, False),
                    },
                    ensure_ascii=False,
                )
            )
        if batch_no in done and os.path.exists(path):
            log(f"batch {batch_no}/{total_batches} skipped (already recorded)")
            written += len(chunk)
            continue
        with open(path, "w") as fh:
            fh.write("\n".join(lines) + "\n")
        record(batch_no, os.path.relpath(path, ROOT), len(chunk))
        written += len(chunk)
        log(f"batch {batch_no}/{total_batches} wrote {len(chunk)} pages -> {os.path.relpath(path, ROOT)}")

    if not NO_RECORD:
        subprocess.run(
            ["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--done", STEP],
            cwd=ROOT, check=True, capture_output=True,
        )

    summary = {
        "pages": written,
        "batches": total_batches,
        "presentByField": present_by_field,
        "stateByField": {f: dict(c) for f, c in state_counts.items()},
        "requests": 0,
        "issues": sorted(set(issues)),
    }
    summary_path = (os.path.join(OUT_DIR, "development-summary.json") if ONLY_KEYS_FILE
                    else os.path.join(D, "fields", "development-summary.json"))
    with open(summary_path, "w") as fh:
        json.dump(summary, fh, indent=2)
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
