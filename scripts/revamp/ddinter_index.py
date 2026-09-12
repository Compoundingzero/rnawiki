#!/usr/bin/env python
"""Build the DDInter 2.0 validation index and its name to UNII candidate map.

DDInter 2.0 is CC BY-NC-SA 4.0. It is never joined into the corpus, never rendered and never in
the release candidate. This script therefore writes nothing under data/sources/ and produces no
mapped.parquet. It writes, under data/validation/ddinter/:

  index.parquet                 one row per unordered DDInter drug pair, keyed by DDInter id,
                                drug name and DrugBank id, with severity, mechanism flags and the
                                interaction text, for the Phase 4 comparison
  name-unii-candidates.parquet  DDInter drug name to corpus page and UNII, candidates only:
                                DDInter publishes no UNII, InChIKey or structure identifier, so no
                                candidate here is confirmed by mapping rule (a) or (b)
  coverage.json                 what the pull holds, which corpus pages the candidates would reach
                                per tier, and what is unmatched

Usage: ddinter_index.py <YYYY-MM-DD>
"""
from __future__ import annotations

import csv
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corpus_join import CANONICAL, load_corpus_index, load_salts, normalise_name  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = "https://ddinter2.scbdd.com"
LICENCE = "CC BY-NC-SA 4.0"
RESTRICTION = (
    "Validation only, non-commercial licence. Never joined into the corpus, never rendered, "
    "never in the release candidate. Use is gated on Felix's confirmation (docs/revamp/BLOCKERS.md)."
)
LEVEL_NAME = {3: "Major", 2: "Moderate", 1: "Minor", 0: "Unknown"}
LEVEL_CODE = {v: k for k, v in LEVEL_NAME.items()}
MECH_FLAGS = [
    "absorption", "distribution", "metabolism", "excretion",
    "synergistic_effect", "antagonistic_effect", "others",
]
# DDInter names a route- or formulation-specific entry by appending a parenthesised qualifier:
# "Calcipotriol (topical)", "Doxorubicin (liposomal)", "Chloramphenicol (ophthalmic)". The
# qualifier is neither a salt nor a counter-ion, so it is stripped here and not added to the
# shared scripts/revamp/salts.txt, whose contract is salt, counter-ion and hydrate suffixes.
# The qualifier is kept in its own column because a topical and a systemic entry are different
# exposures and the Phase 4 comparison must be able to tell them apart.
TRAILING_QUALIFIER = re.compile(r"\s*\(([^()]*)\)\s*$")


def split_qualifier(raw: str) -> tuple[str, str]:
    m = TRAILING_QUALIFIER.search(raw or "")
    if not m:
        return raw or "", ""
    return TRAILING_QUALIFIER.sub("", raw).strip(), m.group(1).strip().lower()


def pair_key(a: str, b: str) -> tuple[str, str]:
    return (a, b) if _num(a) <= _num(b) else (b, a)


def _num(ddid: str) -> int:
    m = re.search(r"(\d+)$", ddid or "")
    return int(m.group(1)) if m else 0


def read_bulk(raw_dir: str) -> tuple[dict, dict, int]:
    """Returns pair -> level name, ddinter id -> name, row count."""
    pairs: dict[tuple[str, str], str] = {}
    names: dict[str, str] = {}
    rows = 0
    for path in sorted(glob.glob(os.path.join(raw_dir, "ddinter_downloads_code_*.csv"))):
        with open(path, encoding="utf-8-sig") as fh:
            for rec in csv.DictReader(fh):
                rows += 1
                a, b = rec["DDInterID_A"], rec["DDInterID_B"]
                names.setdefault(a, rec["Drug_A"])
                names.setdefault(b, rec["Drug_B"])
                pairs[pair_key(a, b)] = rec["Level"]
    return pairs, names, rows


def read_drug_list(raw_dir: str) -> dict[str, dict]:
    drugs: dict[str, dict] = {}
    for path in sorted(glob.glob(os.path.join(raw_dir, "drug-source", "page-*.json"))):
        with open(path, encoding="utf-8") as fh:
            for rec in json.load(fh)["data"]:
                drugs[rec["internalID"]] = {
                    "name": rec.get("name") or "",
                    "display": rec.get("display") or "",
                    "drugbank_id": (rec.get("drugbank_id") or "").strip(),
                }
    return drugs


def read_descriptions(raw_dir: str) -> dict[str, dict]:
    """The distinct interaction descriptions.

    These are NOT joined to the pair table. The ids the per-drug endpoint returns in
    `interaction_id` run 1 to 302,665 and are row ids of the interaction table; the ids the
    description endpoint returns run -1 to 8,576 and are row ids of the description table. The two
    spaces overlap at the low end by coincidence only: the pair Abacavir-Chlorpromazine carries
    interaction_id 10, and description row 10 is the flumazenil/tricyclic-antidepressant sentence.
    Evidence: data/validation/ddinter/2026-09-06/verification/interaction-id-space.md. DDInter's
    public endpoints expose no link from a pair to its description, so the descriptions are written
    to their own file and the pair table carries severity and mechanism flags instead.
    """
    out: dict[str, dict] = {}
    for path in sorted(glob.glob(os.path.join(raw_dir, "interaction-source", "page-*.json"))):
        with open(path, encoding="utf-8") as fh:
            for rec in json.load(fh)["data"]:
                out[str(rec["id"])] = rec
    return out


def read_endpoint_pairs(raw_dir: str) -> tuple[dict, dict, int, int, dict]:
    """Read every per-drug response.

    A pair is returned by both of its drugs, so each is seen twice. Returns the pair table, the
    id-to-name table, the number of drug responses read, the number of rows read, and a count of
    the pairs whose two sides disagreed on severity (the higher severity is kept and the count is
    reported in coverage.json).
    """
    pairs: dict[tuple[str, str], dict] = {}
    names: dict[str, str] = {}
    drugs_read = rows = 0
    disagreements = Counter()
    for path in sorted(glob.glob(os.path.join(raw_dir, "interact-with*.ndjson"))):
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                rec = json.loads(line)
                drugs_read += 1
                src = rec["idx"]
                if rec.get("name"):
                    names.setdefault(src, rec["name"])
                for row in rec["data"]:
                    rows += 1
                    dst = row["drug_id"]
                    names.setdefault(dst, row.get("drug_name") or "")
                    key = pair_key(src, dst)
                    level = int(row.get("level") or 0)
                    entry = {
                        "level_code": level,
                        "interaction_id": str(row.get("interaction_id") or ""),
                        **{f: row.get(f) == "1" for f in MECH_FLAGS},
                    }
                    prior = pairs.get(key)
                    if prior is None:
                        pairs[key] = entry
                        continue
                    if prior["level_code"] != level:
                        disagreements["severity_differs_between_the_two_sides"] += 1
                        if level > prior["level_code"]:
                            pairs[key] = entry
                    elif prior["interaction_id"] != entry["interaction_id"]:
                        disagreements["same_severity_different_interaction_id"] += 1
    return pairs, names, drugs_read, rows, dict(disagreements)


def main() -> int:
    date = sys.argv[1]
    base_dir = os.path.join(ROOT, "data", "validation", "ddinter", date)
    raw_dir = os.path.join(base_dir, "raw")
    out_dir = os.path.join(ROOT, "data", "validation", "ddinter")

    bulk_pairs, bulk_names, bulk_rows = read_bulk(raw_dir)
    drugs = read_drug_list(raw_dir)
    endpoint_pairs, endpoint_names, drugs_read, endpoint_rows, side_disagreements = read_endpoint_pairs(raw_dir)
    descriptions = read_descriptions(raw_dir)

    names: dict[str, str] = dict(bulk_names)
    names.update(endpoint_names)
    for ddid, rec in drugs.items():
        if rec["name"]:
            names[ddid] = rec["name"]

    salts = load_salts()
    norm_cache = {ddid: normalise_name(name, salts) for ddid, name in names.items()}
    qualifier_cache: dict[str, str] = {}
    base_norm_cache: dict[str, str] = {}
    for ddid, name in names.items():
        base, qualifier = split_qualifier(name)
        qualifier_cache[ddid] = qualifier
        base_norm_cache[ddid] = normalise_name(base, salts) if qualifier else norm_cache[ddid]

    all_keys = set(bulk_pairs) | set(endpoint_pairs)
    level_agreement = Counter()
    rows_out = []
    for key in sorted(all_keys, key=lambda k: (_num(k[0]), _num(k[1]))):
        a, b = key
        ep = endpoint_pairs.get(key)
        bulk_level = bulk_pairs.get(key)
        if ep is not None:
            level_code = ep["level_code"]
            interaction_id = ep["interaction_id"]
            flags = {f: ep[f] for f in MECH_FLAGS}
        else:
            level_code = LEVEL_CODE.get(bulk_level, 0)
            interaction_id = ""
            flags = {f: None for f in MECH_FLAGS}
        if bulk_level is not None and ep is not None:
            agree = LEVEL_NAME[level_code] == bulk_level
            level_agreement["agree" if agree else "differ"] += 1
        else:
            agree = None
        provenance = ("bulk-csv+site-endpoint" if (bulk_level is not None and ep is not None)
                      else "bulk-csv" if bulk_level is not None else "site-endpoint")
        rows_out.append({
            "ddinter_id_a": a,
            "drug_name_a": names.get(a, ""),
            "drugbank_id_a": drugs.get(a, {}).get("drugbank_id", ""),
            "name_norm_a": norm_cache.get(a, ""),
            "name_base_norm_a": base_norm_cache.get(a, ""),
            "route_qualifier_a": qualifier_cache.get(a, ""),
            "ddinter_id_b": b,
            "drug_name_b": names.get(b, ""),
            "drugbank_id_b": drugs.get(b, {}).get("drugbank_id", ""),
            "name_norm_b": norm_cache.get(b, ""),
            "name_base_norm_b": base_norm_cache.get(b, ""),
            "route_qualifier_b": qualifier_cache.get(b, ""),
            "level": LEVEL_NAME[level_code],
            "level_code": level_code,
            "level_in_bulk_csv": bulk_level or "",
            "level_sources_agree": agree,
            "interaction_id": interaction_id,
            **{f"mechanism_{f}": flags[f] for f in MECH_FLAGS},
            "provenance": provenance,
            "source_url": f"{BASE}/server/drug-detail/{a}/",
            "source_date": date,
            "licence": LICENCE,
            "usage_restriction": RESTRICTION,
        })

    index = pd.DataFrame(rows_out)
    index_path = os.path.join(out_dir, "index.parquet")
    index.to_parquet(index_path, index=False, compression="zstd")

    descriptions_frame = pd.DataFrame([
        {
            "description_id": str(rec["id"]),
            "level": LEVEL_NAME.get(int(rec.get("level") or 0), "Unknown"),
            "level_code": int(rec.get("level") or 0),
            "interaction_text": rec.get("interaction", ""),
            **{f"mechanism_{f}": rec.get(f) == "1" for f in MECH_FLAGS},
            "source_url": f"{BASE}/server/interaction/",
            "source_date": date,
            "licence": LICENCE,
            "usage_restriction": RESTRICTION,
            "join_note": "DDInter's public endpoints expose no link from a drug pair to its "
                         "description; this id is a row id of the description table and is not the "
                         "interaction_id carried in index.parquet",
        }
        for rec in descriptions.values()
    ])
    descriptions_path = os.path.join(out_dir, "interaction-descriptions.parquet")
    descriptions_frame.to_parquet(descriptions_path, index=False, compression="zstd")

    # Name to UNII candidate map. DDInter publishes no UNII, InChIKey or structure identifier, so
    # mapping rules (a) UNII exact and (b) full InChIKey exact cannot be applied from this source
    # and every row below is a candidate that a corpus-side identifier would have to confirm.
    corpus = load_corpus_index()
    drugbank_to_keys: dict[str, list[str]] = defaultdict(list)
    key_inchikey: dict[str, str] = {}
    with CANONICAL.open() as fh:
        for line in fh:
            rec = json.loads(line)
            key = rec["key"]
            db = (rec.get("drugbankId") or "").strip().upper()
            if db:
                drugbank_to_keys[db].append(key)
            ik = ((rec.get("structure") or {}).get("inchikey") or "").strip().upper()
            if ik:
                key_inchikey[key] = ik

    cand_rows = []
    matched_drugs: set[str] = set()
    pages_by_tier: dict[str, set[str]] = {"1": set(), "2": set(), "3": set()}
    pages_by_rule_tier: dict[str, dict[str, set[str]]] = {
        "drugbank-id": {"1": set(), "2": set(), "3": set()},
        "name-candidate": {"1": set(), "2": set(), "3": set()},
    }
    for ddid in sorted(names, key=_num):
        name = names[ddid]
        norm = norm_cache.get(ddid, "")
        drugbank_id = drugs.get(ddid, {}).get("drugbank_id", "")
        by_rule: dict[str, list[str]] = {}
        if drugbank_id:
            keys = drugbank_to_keys.get(drugbank_id.upper(), [])
            if keys:
                by_rule["drugbank-id"] = keys
        base_norm = base_norm_cache.get(ddid, "")
        for candidate_norm in (norm, base_norm):
            if not candidate_norm:
                continue
            keys = corpus.name_to_keys.get(candidate_norm, [])
            if keys:
                by_rule["name-candidate"] = keys
                matched_norm = candidate_norm
                break
        else:
            matched_norm = ""
        if not by_rule:
            continue
        matched_drugs.add(ddid)
        for rule, keys in by_rule.items():
            for key in keys:
                tier = str(corpus.tier_of(key))
                pages_by_tier[tier].add(key)
                pages_by_rule_tier[rule][tier].add(key)
                cand_rows.append({
                    "ddinter_id": ddid,
                    "ddinter_name": name,
                    "ddinter_display": drugs.get(ddid, {}).get("display", ""),
                    "drugbank_id": drugbank_id,
                    "name_norm": norm,
                    "name_norm_matched": matched_norm if rule == "name-candidate" else "",
                    "route_qualifier": qualifier_cache.get(ddid, ""),
                    "candidate_page_key": key,
                    "candidate_page_display": corpus.display.get(key, ""),
                    "candidate_tier": int(tier),
                    "candidate_unii": corpus.key_unii.get(key, ""),
                    "candidate_inchikey": key_inchikey.get(key, ""),
                    "match_rule": rule,
                    "candidate_count_for_rule": len(keys),
                    "confirmed_by_unii_or_inchikey": False,
                    "source": "DDInter 2.0",
                    "source_date": date,
                    "licence": LICENCE,
                    "usage_restriction": RESTRICTION,
                })
    candidates = pd.DataFrame(cand_rows)
    cand_path = os.path.join(out_dir, "name-unii-candidates.parquet")
    candidates.to_parquet(cand_path, index=False, compression="zstd")

    unmatched = sorted(set(names) - matched_drugs, key=_num)
    with open(os.path.join(out_dir, "unmatched-drugs.csv"), "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["ddinter_id", "ddinter_name", "name_norm", "name_base_norm", "route_qualifier", "drugbank_id"])
        for ddid in unmatched:
            w.writerow([
                ddid, names[ddid], norm_cache.get(ddid, ""), base_norm_cache.get(ddid, ""),
                qualifier_cache.get(ddid, ""), drugs.get(ddid, {}).get("drugbank_id", ""),
            ])

    raw_files = [p for p in glob.glob(os.path.join(raw_dir, "**", "*"), recursive=True) if os.path.isfile(p)]
    coverage = {
        "source": "DDInter 2.0",
        "source_url": BASE,
        "retrieval_date": date,
        "licence": LICENCE,
        "licence_url": f"{BASE}/terms/",
        "usage_restriction": RESTRICTION,
        "mapped_into_corpus": False,
        "in_release_candidate": False,
        "fields_gained_per_tier": {
            "1": [], "2": [], "3": [],
            "note": "No field is gained on any page. DDInter is not joined to the corpus; it is held "
                    "for the Phase 4 validation comparison only, behind the gate in "
                    "docs/revamp/BLOCKERS.md.",
        },
        "raw": {
            "files": len(raw_files),
            "bytes": sum(os.path.getsize(p) for p in raw_files),
        },
        "interactions": {
            "bulk_csv_rows": bulk_rows,
            "bulk_csv_distinct_pairs": len(bulk_pairs),
            "site_endpoint_drugs_read": drugs_read,
            "site_endpoint_rows": endpoint_rows,
            "site_endpoint_distinct_pairs": len(endpoint_pairs),
            "union_distinct_pairs": len(all_keys),
            "pairs_only_in_bulk_csv": len(set(bulk_pairs) - set(endpoint_pairs)),
            "pairs_only_in_site_endpoint": len(set(endpoint_pairs) - set(bulk_pairs)),
            "severity_agreement_where_both_the_csv_and_the_endpoint_hold_the_pair": dict(level_agreement),
            "endpoint_two_sided_disagreements": side_disagreements,
            "severity_distribution": index["level"].value_counts().to_dict(),
            "distinct_interaction_records_seen": len({
                r["interaction_id"] for r in rows_out if r["interaction_id"]
            }),
            "distinct_interaction_descriptions": len(descriptions),
            "pair_to_description_link": "not published. The per-drug endpoint returns an "
                "interaction_id from the interaction table (1 to 302,665) and the description "
                "endpoint returns row ids of the description table (-1 to 8,576); the two overlap "
                "at the low end by coincidence, verified in "
                "data/validation/ddinter/2026-09-06/verification/interaction-id-space.md. The "
                "descriptions are therefore written to interaction-descriptions.parquet unjoined, "
                "and every pair in index.parquet carries severity and the seven mechanism flags.",
        },
        "drugs": {
            "in_drug_list_endpoint": len(drugs),
            "seen_in_interaction_data": len(names),
            "with_drugbank_id": sum(1 for d in drugs.values() if d["drugbank_id"]),
            "matched_to_at_least_one_corpus_page_as_candidate": len(matched_drugs),
            "unmatched": len(unmatched),
        },
        "candidate_pages_per_tier": {
            "note": "Corpus pages a DDInter drug name or DrugBank id would reach. These are candidates "
                    "for the Phase 4 comparison, not a join; no page carries DDInter data.",
            "tier_1": len(pages_by_tier["1"]),
            "tier_2": len(pages_by_tier["2"]),
            "tier_3": len(pages_by_tier["3"]),
            "total": len(pages_by_tier["1"] | pages_by_tier["2"] | pages_by_tier["3"]),
            "by_rule": {
                rule: {f"tier_{t}": len(keys) for t, keys in tiers.items()}
                for rule, tiers in pages_by_rule_tier.items()
            },
        },
        "name_candidates_sent_to_review": int(
            (candidates["match_rule"] == "name-candidate").sum()) if len(candidates) else 0,
        "confirmed_by_unii_or_inchikey": 0,
        "confirmation_note": "DDInter publishes no UNII, InChIKey or structure identifier for its drugs, "
                             "only a drug name and a DrugBank accession, so mapping rules (a) UNII exact "
                             "and (b) full InChIKey exact cannot be applied from this source. Every row in "
                             "name-unii-candidates.parquet is a candidate.",
        "outputs": {
            "index_parquet": os.path.relpath(index_path, ROOT),
            "index_rows": len(index),
            "interaction_descriptions_parquet": os.path.relpath(descriptions_path, ROOT),
            "interaction_description_rows": len(descriptions_frame),
            "name_unii_candidates_parquet": os.path.relpath(cand_path, ROOT),
            "name_unii_candidate_rows": len(candidates),
            "unmatched_drugs_csv": "data/validation/ddinter/unmatched-drugs.csv",
        },
    }
    with open(os.path.join(out_dir, "coverage.json"), "w", encoding="utf-8") as fh:
        json.dump(coverage, fh, indent=2)
        fh.write("\n")

    print(json.dumps({
        "index_rows": len(index),
        "candidate_rows": len(candidates),
        "union_pairs": len(all_keys),
        "only_in_endpoint": coverage["interactions"]["pairs_only_in_site_endpoint"],
        "only_in_bulk": coverage["interactions"]["pairs_only_in_bulk_csv"],
        "candidate_pages": coverage["candidate_pages_per_tier"]["total"],
        "unmatched_drugs": len(unmatched),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
