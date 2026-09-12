#!/usr/bin/env python
"""Map the DrugCentral 2023 (release 2023-11-01) per-table exports onto the
corpus-20k pages and write mapped.parquet plus coverage.json.

Mapping priority, per the revamp spec Phase 2:
  a) UNII exact
  b) full InChIKey exact
  c) InChIKey skeleton (first 14 characters) -> linked as form_of, never merged
  d) normalised name -> candidate only, needs (a) or (b) confirmation, otherwise
     it is written with match_rule 'name-candidate' and counted for the Phase 3
     review list.

Rules (a) and (b) are treated as one primary layer: a DrugCentral structure
resolves to the set of pages that carry its UNII or its full InChIKey, and each
page records which of the two rules matched it. Pages that share only the
14-character skeleton with that structure are linked as forms of the primary
page when one exists, and otherwise as forms of the DrugCentral structure
itself, which has no page in this corpus.
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
from collections import defaultdict

import pandas as pd

csv.field_size_limit(1 << 27)

REPO = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
TABLES = os.path.join(REPO, "data/sources/drugcentral/2026-09-05/raw/tables")
OUT_DIR = os.path.join(REPO, "data/sources/drugcentral")
CANONICAL = os.path.join(REPO, "data/corpus-20k/identity/canonical.ndjson")
MODELS = os.path.join(REPO, "data/corpus-20k/tiers/model-assignment.ndjson")
SALTS = os.path.join(REPO, "scripts/revamp/salts.txt")

LICENCE = "CC BY-SA 4.0"
RELEASE_DATE = "2023-11-01"
DRUGCARD = "https://drugcentral.org/drugcard/{sid}"

KEY_UNII = re.compile(r"K1:([A-Z0-9]{10})")
KEY_INCHIKEY = re.compile(r"IK:([A-Z]{14}-[A-Z]{10}-[A-Z])")

STEREO_PREFIX = re.compile(
    r"^(?:\(\s*(?:[+-]|±|rs|sr|r|s|e|z|d|l|dl|ld)\s*\)|"
    r"[+-]|±|dl|d|l|rac|racemic|levo|dextro|cis|trans|alpha|beta|gamma|"
    r"n|o|s|r|z|e)[-\s]+",
    re.IGNORECASE,
)


def load_salts() -> list[str]:
    with open(SALTS, encoding="utf-8") as fh:
        return sorted(
            {line.strip().lower() for line in fh if line.strip() and not line.startswith("#")},
            key=len,
            reverse=True,
        )


SALT_SUFFIXES = load_salts()


def normalise_name(raw: str) -> str:
    if not raw:
        return ""
    name = raw.strip().lower()
    name = re.sub(r"[‐-―]", "-", name)
    changed = True
    while changed:
        changed = False
        stripped = STEREO_PREFIX.sub("", name, count=1)
        if stripped != name and stripped:
            name, changed = stripped, True
    name = re.sub(r"[^a-z0-9]+", " ", name).strip()
    salt_set = set(SALT_SUFFIXES)
    changed = True
    while changed:
        changed = False
        for salt in SALT_SUFFIXES:
            if not name.endswith(" " + salt) or len(name) <= len(salt) + 1:
                continue
            residue = name[: -(len(salt) + 1)].strip()
            # Stripping must leave a substance, not a bare counter-ion:
            # "sodium propionate" and "sodium succinate" are different
            # substances and must not both collapse to "sodium".
            tokens = residue.split()
            if len(residue) < 4 or all(tok in salt_set for tok in tokens):
                continue
            name, changed = residue, True
            break
    return re.sub(r"\s+", " ", name).strip()


def read_table(name: str) -> list[dict]:
    with open(os.path.join(TABLES, f"{name}.csv"), encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def blank(value) -> bool:
    return value is None or value == ""


def num(value):
    if blank(value):
        return None
    try:
        f = float(value)
    except ValueError:
        return value
    return int(f) if f.is_integer() else f


# ---------------------------------------------------------------- corpus side

def load_corpus():
    tier_of = {}
    for line in open(MODELS, encoding="utf-8"):
        r = json.loads(line)
        tier_of[r["key"]] = 1 if (r["model"] == "LONGEVITY" or r.get("withdrawn")) else (
            2 if r["model"] == "CLINICAL" else 3
        )
    by_unii, by_ik, by_skel, by_name = (defaultdict(set) for _ in range(4))
    pages = {}
    for line in open(CANONICAL, encoding="utf-8"):
        r = json.loads(line)
        key = r["key"]
        pages[key] = {"tier": tier_of.get(key, 3), "displayName": r.get("displayName")}
        # A page carries a UNII in its `unii` field and, for UNII-ranked keys,
        # inside the key itself; the two differ where the key names the free
        # base and the field names the marketed salt. Both are the page's own
        # recorded UNII, so rule (a) indexes both. The same holds for InChIKey.
        uniis = {r["unii"].strip().upper()} if r.get("unii") else set()
        uniis |= {m.upper() for m in KEY_UNII.findall(key)}
        for u in uniis:
            by_unii[u].add(key)
        struct = r.get("structure") or {}
        inchikeys = set()
        if struct.get("inchikey"):
            inchikeys.add(struct["inchikey"].strip().upper())
        inchikeys |= {m.upper() for m in KEY_INCHIKEY.findall(key)}
        for ikey in inchikeys:
            by_ik[ikey].add(key)
        skeletons = {ikey[:14] for ikey in inchikeys}
        if struct.get("inchikey14"):
            skeletons.add(struct["inchikey14"].strip().upper())
        for skel in skeletons:
            by_skel[skel].add(key)
        names = [r.get("displayName")] + [s.get("name") for s in (r.get("synonyms") or [])]
        for nm in names:
            norm = normalise_name(nm or "")
            if norm:
                by_name[norm].add(key)
    return pages, by_unii, by_ik, by_skel, by_name


# ----------------------------------------------------------- drugcentral side

def build_struct_fields():
    """Return {struct_id: {field: value}} for every field DrugCentral supplies."""
    fields = defaultdict(dict)

    omop = defaultdict(lambda: defaultdict(list))
    for r in read_table("omop_relationship"):
        bucket = {
            "indication": "indications",
            "off-label use": "off_label_uses",
            "contraindication": "contraindications",
        }.get(r["relationship_name"], "other_omop_relationships")
        omop[r["struct_id"]][bucket].append({
            "concept_name": r["concept_name"],
            "snomed_full_name": r["snomed_full_name"] or None,
            "snomed_conceptid": num(r["snomed_conceptid"]),
            "umls_cui": (r["umls_cui"] or "").strip() or None,
            "cui_semantic_type": (r["cui_semantic_type"] or "").strip() or None,
            "concept_id": num(r["concept_id"]),
            "relationship_name": r["relationship_name"],
        })
    for sid, buckets in omop.items():
        for name, rows in buckets.items():
            fields[sid][name] = sorted(rows, key=lambda x: (x["concept_name"] or ""))

    acts = defaultdict(lambda: defaultdict(list))
    for r in read_table("act_table_full"):
        row = {
            "target_name": r["target_name"] or None,
            "target_class": r["target_class"] or None,
            "gene": r["gene"] or None,
            "swissprot": r["swissprot"] or None,
            "accession": r["accession"] or None,
            "organism": r["organism"] or None,
            "action_type": r["action_type"] or None,
            "act_type": r["act_type"] or None,
            "act_value": num(r["act_value"]),
            "act_unit": r["act_unit"] or None,
            "relation": r["relation"] or None,
            "act_source": r["act_source"] or None,
            "act_source_url": r["act_source_url"] or None,
            "moa_source": r["moa_source"] or None,
            "moa_source_url": r["moa_source_url"] or None,
            "target_development_level": r["tdl"] or None,
            "first_in_class": r["first_in_class"] == "1",
            "act_id": num(r["act_id"]),
        }
        bucket = "mechanism_targets" if r["moa"] == "1" else "target_bioactivities"
        acts[r["struct_id"]][bucket].append(row)
    for sid, buckets in acts.items():
        for name, rows in buckets.items():
            fields[sid][name] = sorted(rows, key=lambda x: (x["target_name"] or "", x["act_id"]))

    pharm = defaultdict(list)
    for r in read_table("pharma_class"):
        pharm[r["struct_id"]].append({
            "class_type": r["type"],
            "name": r["name"],
            "class_code": r["class_code"] or None,
            "source": r["source"] or None,
        })
    for sid, rows in pharm.items():
        fields[sid]["pharmacologic_action"] = sorted(
            rows, key=lambda x: (x["class_type"], x["name"] or "")
        )

    agency_field = {"FDA": "regulatory.US", "EMA": "regulatory.EU", "PMDA": "regulatory.JP"}
    approvals = defaultdict(lambda: defaultdict(list))
    for r in read_table("approval"):
        entry = {
            "agency": r["type"],
            "approval_date": r["approval"] or None,
            "applicant": r["applicant"] or None,
            "orphan": {"t": True, "f": False}.get(r["orphan"], None),
        }
        if r["type"] in agency_field:
            approvals[r["struct_id"]][agency_field[r["type"]]].append(entry)
        elif r["type"] == "YEAR INTRODUCED":
            approvals[r["struct_id"]]["year_introduced"].append(entry)
        else:
            approvals[r["struct_id"]]["regulatory.other_agencies"].append(entry)
    for sid, buckets in approvals.items():
        for name, rows in buckets.items():
            rows = sorted(rows, key=lambda x: (x["approval_date"] or "", x["applicant"] or ""))
            if name == "year_introduced":
                fields[sid][name] = rows[0]["approval_date"]
            else:
                fields[sid][name] = {
                    "status": "approved",
                    "first_approval_date": rows[0]["approval_date"],
                    "records": rows,
                }

    faers = defaultdict(list)
    for r in read_table("faers"):
        llr, thr = num(r["llr"]), num(r["llr_threshold"])
        faers[r["struct_id"]].append({
            "meddra_name": r["meddra_name"],
            "meddra_code": num(r["meddra_code"]),
            "meddra_level": r["level"],
            "llr": llr,
            "llr_threshold": thr,
            "above_threshold": (llr is not None and thr is not None and llr >= thr),
            "reports_drug_and_event": num(r["drug_ae"]),
            "reports_drug_no_event": num(r["drug_no_ae"]),
            "reports_event_no_drug": num(r["no_drug_ae"]),
            "reports_neither": num(r["no_drug_no_ae"]),
        })
    for sid, rows in faers.items():
        fields[sid]["adverse_events_faers"] = sorted(
            rows, key=lambda x: (-(x["llr"] or 0), x["meddra_name"] or "")
        )

    atc_by_code = {r["code"]: r for r in read_table("atc")}
    atc = defaultdict(list)
    for r in read_table("struct2atc"):
        a = atc_by_code.get(r["atc_code"])
        atc[r["struct_id"]].append({
            "code": r["atc_code"],
            "l1_name": a["l1_name"] if a else None,
            "l2_name": a["l2_name"] if a else None,
            "l3_name": a["l3_name"] if a else None,
            "l4_name": a["l4_name"] if a else None,
            "chemical_substance": a["chemical_substance"] if a else None,
        })
    for sid, rows in atc.items():
        fields[sid]["atc_codes"] = sorted(rows, key=lambda x: x["code"])

    ids = defaultdict(dict)
    for r in read_table("identifier"):
        ids[r["struct_id"]].setdefault(r["id_type"], []).append(r["identifier"])
    for sid, mapping in ids.items():
        fields[sid]["external_identifiers"] = {k: sorted(v) for k, v in sorted(mapping.items())}

    parent_by_cd = {r["cd_id"]: r for r in read_table("parentmol")}
    for r in read_table("struct2parent"):
        p = parent_by_cd.get(r["parent_id"])
        if p:
            fields[r["struct_id"]]["parent_molecule"] = {
                "name": p["name"],
                "inchikey": p["inchikey"] or None,
                "cas_reg_no": p["cas_reg_no"] or None,
                "drugcentral_parent_id": num(r["parent_id"]),
            }
    return fields


def main() -> None:
    pages, by_unii, by_ik, by_skel, by_name = load_corpus()
    structs = {r["id"]: r for r in read_table("structures")}
    fields = build_struct_fields()

    unii_of = defaultdict(set)
    for r in read_table("identifier"):
        if r["id_type"] == "UNII" and r["identifier"]:
            unii_of[r["struct_id"]].add(r["identifier"].strip().upper())

    names_of = defaultdict(set)
    for sid, s in structs.items():
        if s["name"]:
            names_of[sid].add(s["name"])
    for r in read_table("synonyms"):
        if r["id"] in structs and r["name"]:
            names_of[r["id"]].add(r["name"])

    rows = []
    matched_pages_by_rule = defaultdict(set)
    unmatched_structs = []
    name_candidate_pairs = set()
    seen = set()

    # Pass 1: rules (a), (b) and (c). Rule (d) needs to know which pages the
    # whole corpus already binds by UNII or InChIKey, so it runs afterwards.
    resolved: dict[str, dict] = {}
    pages_bound_by_identifier: dict[str, set] = defaultdict(set)
    for sid in sorted(structs, key=lambda x: int(x)):
        struct = structs[sid]
        if not fields.get(sid):
            unmatched_structs.append({"struct_id": sid, "name": struct["name"],
                                      "reason": "no field values in the tables pulled"})
            continue
        ik = (struct["inchikey"] or "").strip().upper()
        skeleton = ik[:14] if ik else ""
        rule_for_page: dict[str, str] = {}
        for u in unii_of.get(sid, ()):  # (a) UNII exact
            for key in by_unii.get(u, ()):
                rule_for_page[key] = "unii"
        if ik:  # (b) full InChIKey exact
            for key in by_ik.get(ik, ()):
                rule_for_page.setdefault(key, "inchikey")
        primary = set(rule_for_page)
        for key in primary:
            pages_bound_by_identifier[key].add(sid)
        form_of_target = sorted(primary)[0] if primary else (
            f"DRUGCENTRAL:struct_id={sid} ({struct['name']}) — no page in this corpus"
        )
        if skeleton:  # (c) skeleton, linked as form_of, never merged
            for key in by_skel.get(skeleton, set()) - primary:
                rule_for_page[key] = "skeleton"
        resolved[sid] = {"rules": rule_for_page, "primary": primary,
                         "form_of_target": form_of_target}

    suppressed_candidates = 0
    for sid, state in resolved.items():  # (d) normalised name, candidate only
        if state["primary"]:
            continue
        candidates = set()
        for nm in names_of.get(sid, ()):
            norm = normalise_name(nm)
            if norm:
                candidates |= by_name.get(norm, set())
        candidates -= set(state["rules"])
        for key in candidates:
            # A page already bound to some structure by UNII or InChIKey is
            # settled; a bare name match to a different structure would only
            # add noise to the Phase 3 review list.
            if pages_bound_by_identifier.get(key):
                suppressed_candidates += 1
                continue
            state["rules"][key] = "name-candidate"
            name_candidate_pairs.add((key, sid))

    for sid, state in resolved.items():
        struct = structs[sid]
        payload = fields[sid]
        rule_for_page = state["rules"]
        form_of_target = state["form_of_target"]
        if not rule_for_page:
            unmatched_structs.append({"struct_id": sid, "name": struct["name"],
                                      "reason": "no UNII, InChIKey, skeleton or name match to a corpus page"})
            continue

        for key, rule in sorted(rule_for_page.items()):
            matched_pages_by_rule[rule].add(key)
            for field, value in sorted(payload.items()):
                dedupe = (key, field, sid)
                if dedupe in seen:
                    continue
                seen.add(dedupe)
                rows.append({
                    "key": key,
                    "tier": pages[key]["tier"],
                    "field": field,
                    "value": json.dumps(value, ensure_ascii=False, sort_keys=True),
                    "source_record_id": f"drugcentral:struct_id:{sid}",
                    "source_url": DRUGCARD.format(sid=sid),
                    "source_date": RELEASE_DATE,
                    "match_rule": rule,
                    "form_of_target": form_of_target if rule == "skeleton" else None,
                    "licence": LICENCE,
                })

    frame = pd.DataFrame(rows, columns=[
        "key", "tier", "field", "value", "source_record_id", "source_url",
        "source_date", "match_rule", "form_of_target", "licence",
    ])
    os.makedirs(OUT_DIR, exist_ok=True)
    frame.to_parquet(os.path.join(OUT_DIR, "mapped.parquet"), index=False, compression="zstd")

    all_matched = set().union(*matched_pages_by_rule.values()) if matched_pages_by_rule else set()
    confirmed = set().union(*(matched_pages_by_rule[r] for r in ("unii", "inchikey", "skeleton")
                              if r in matched_pages_by_rule)) if matched_pages_by_rule else set()

    def tier_counts(keys):
        out = {"1": 0, "2": 0, "3": 0}
        for k in keys:
            out[str(pages[k]["tier"])] += 1
        return out

    fields_by_tier = defaultdict(lambda: defaultdict(set))
    for row in rows:
        fields_by_tier[str(row["tier"])][row["field"]].add(row["key"])

    unmatched_ids = {u["struct_id"] for u in unmatched_structs}
    withheld = defaultdict(int)
    for r in read_table("omop_relationship"):
        if r["struct_id"] in unmatched_ids:
            withheld[f"omop_relationship:{r['relationship_name']}"] += 1
    for r in read_table("approval"):
        if r["struct_id"] in unmatched_ids:
            withheld[f"approval:{r['type']}"] += 1
    for r in read_table("act_table_full"):
        if r["struct_id"] in unmatched_ids:
            withheld["act_table_full:mechanism" if r["moa"] == "1"
                     else "act_table_full:bioactivity"] += 1
    for r in read_table("faers"):
        if r["struct_id"] in unmatched_ids:
            withheld["faers"] += 1

    coverage = {
        "source": "DrugCentral",
        "release": {"dbversion": 54, "release_date": RELEASE_DATE},
        "retrieved": "2026-09-05",
        "licence": LICENCE,
        "corpus_pages_total": len(pages),
        "drugcentral_structures_total": len(structs),
        "pages_matched_total": len(all_matched),
        "pages_matched_by_tier": tier_counts(all_matched),
        "pages_matched_by_rule": {
            rule: {"pages": len(keys), "by_tier": tier_counts(keys)}
            for rule, keys in sorted(matched_pages_by_rule.items())
        },
        "pages_confirmed_by_structure_or_unii": {
            "pages": len(confirmed), "by_tier": tier_counts(confirmed),
        },
        "fields_gained_by_tier": {
            tier: {field: len(keys) for field, keys in sorted(fields.items())}
            for tier, fields in sorted(fields_by_tier.items())
        },
        "rows_written": len(rows),
        "unmatched_record_count": len(unmatched_structs),
        "unmatched_records_detail": "unmatched-records.json",
        "source_rows_on_unmatched_structures": dict(sorted(withheld.items())),
        "name_candidates_sent_to_review": len(name_candidate_pairs),
        "name_candidates_suppressed_page_already_bound_by_identifier": suppressed_candidates,
        "name_candidate_pages": len(matched_pages_by_rule.get("name-candidate", set())),
    }
    with open(os.path.join(OUT_DIR, "coverage.json"), "w", encoding="utf-8") as fh:
        json.dump(coverage, fh, indent=2, sort_keys=True)
        fh.write("\n")

    with open(os.path.join(OUT_DIR, "unmatched-records.json"), "w", encoding="utf-8") as fh:
        json.dump(sorted(unmatched_structs, key=lambda x: int(x["struct_id"])), fh, indent=2)
        fh.write("\n")

    review = sorted(
        (
            {
                "page_key": k,
                "drugcentral_struct_id": sid,
                "drugcentral_name": structs[sid]["name"],
                "drugcentral_inchikey": structs[sid]["inchikey"] or None,
                "page_display_name": pages[k]["displayName"],
                "tier": pages[k]["tier"],
                "needs": "UNII or InChIKey confirmation",
            }
            for k, sid in name_candidate_pairs
        ),
        key=lambda x: (x["tier"], x["page_key"]),
    )
    with open(os.path.join(OUT_DIR, "name-candidates-for-review.json"), "w", encoding="utf-8") as fh:
        json.dump(review, fh, indent=2)
        fh.write("\n")

    print(json.dumps(coverage, indent=2)[:6000])


if __name__ == "__main__":
    sys.exit(main())
