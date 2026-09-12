#!/usr/bin/env python
"""Map the retrieved PubChem records onto corpus-20k pages.

Mapping rules are applied in the priority order set by docs/specs/revamp-2026-09.md Phase 2:
  (a) UNII exact          -> match_rule "unii"
  (b) full InChIKey exact -> match_rule "inchikey"
  (c) InChIKey skeleton   -> match_rule "skeleton", emitted as a form_of link only.
                             Properties are never copied across a skeleton match, because
                             a different salt, ester, hydrate or stereoisomer has a
                             different mass and a different partition coefficient.
  (d) normalised name     -> match_rule "name-candidate". Unconfirmed by (a) or (b), so the
                             page goes to the Phase 3 review list and its values are counted
                             as candidates, never as coverage gained.

Writes data/sources/pubchem/mapped.parquet and data/sources/pubchem/coverage.json.
"""
from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pubchem_fetch import (  # noqa: E402
    APIDIR, DATE, RAWDIR, ROOT, SRC, _bulk_name_map, _bulk_unii_map, _load_checkpoint,
    load_corpus, load_salts, normalise_name,
)

LICENCE = "Public domain (US Government work; NCBI places no restrictions on use or distribution)"
SOURCE_DATE = DATE
PROP_FIELDS = [
    ("CID", "cid"),
    ("InChIKey", "inchikey"),
    ("SMILES", "smiles"),
    ("ConnectivitySMILES", "connectivity_smiles"),
    ("InChI", "inchi"),
    ("MolecularWeight", "mw"),
    ("XLogP", "xlogp"),
    ("TPSA", "tpsa"),
]
STRUCTURE_FIELDS = {"inchikey", "smiles", "connectivity_smiles", "inchi"}


def props_from(body: dict) -> list[dict]:
    try:
        return body["PropertyTable"]["Properties"]
    except (KeyError, TypeError):
        return []


def load_records() -> tuple[dict, dict, dict, dict, list]:
    """Return (by_inchikey, by_cid, unii_api_records, name_records, all_records)."""
    by_inchikey: dict[str, list] = defaultdict(list)
    by_cid: dict[str, dict] = {}
    all_records: list[dict] = []

    def absorb(rec: dict) -> None:
        cid = str(rec.get("CID"))
        if cid and cid != "None":
            by_cid.setdefault(cid, rec)
        ik = rec.get("InChIKey")
        if ik:
            by_inchikey[ik].append(rec)
        all_records.append(rec)

    for sub in ("inchikey", "cid"):
        d = APIDIR / sub
        if not d.exists():
            continue
        for f in sorted(d.glob("*.json")):
            if f.name.startswith("_"):
                continue
            for rec in props_from(json.loads(f.read_text())):
                absorb(rec)

    unii_records: dict[str, list] = {}
    d = APIDIR / "unii"
    if d.exists():
        for f in sorted(d.glob("*.json")):
            if f.name.startswith("_"):
                continue
            payload = json.loads(f.read_text())
            recs = props_from(payload.get("body", {}))
            if recs:
                unii_records[payload["unii"]] = recs
                for rec in recs:
                    absorb(rec)

    name_records: dict[str, list] = {}
    d = APIDIR / "name"
    if d.exists():
        for f in sorted(d.glob("*.json")):
            if f.name.startswith("_"):
                continue
            payload = json.loads(f.read_text())
            recs = props_from(payload.get("body", {}))
            if recs:
                name_records[payload["name"]] = recs
                for rec in recs:
                    absorb(rec)

    return by_inchikey, by_cid, unii_records, name_records, all_records


def _conflict(pg, rec, kind):
    return {
        "key": pg["key"], "tier": pg["tier"], "displayName": pg["displayName"],
        "kind": kind, "unii": pg["unii"], "corpus_inchikey": pg["inchikey"],
        "pubchem_cid_for_unii": str(rec.get("CID")),
        "pubchem_inchikey_for_unii": rec.get("InChIKey"),
        "skeletons_match": bool(pg["inchikey"] and rec.get("InChIKey")
                                and pg["inchikey"][:14] == rec.get("InChIKey")[:14]),
    }


def main() -> None:
    pages = load_corpus()
    salts = load_salts()
    by_inchikey, by_cid, unii_records, name_records, all_records = load_records()
    bulk_unii = _bulk_unii_map()
    bulk_names = _bulk_name_map()
    for n, cs in bulk_names.items():
        recs = [by_cid[c] for c in sorted(cs, key=int) if c in by_cid]  # lowest CID first
        if recs:
            name_records.setdefault(n, recs)

    # PubChem can hold more than one CID for a single InChIKey. The lowest CID is the
    # primary record, so every list a match is drawn from is ordered by CID.
    def _cid_order(rec):
        try:
            return int(rec.get("CID"))
        except (TypeError, ValueError):
            return 1 << 62

    for ik in by_inchikey:
        by_inchikey[ik].sort(key=_cid_order)

    skeleton_index: dict[str, list] = defaultdict(list)
    for rec in all_records:
        ik = rec.get("InChIKey")
        if ik and len(ik) >= 14:
            skeleton_index[ik[:14]].append(rec)
    for sk in skeleton_index:
        skeleton_index[sk].sort(key=_cid_order)

    # The name a page was queried under, rebuilt exactly as the fetch stage built it.
    page_name: dict[str, str] = {}
    resolved_unii = set(bulk_unii) | set(unii_records)
    for pg in pages:
        if pg["inchikey"] or (pg["unii"] and pg["unii"] in resolved_unii):
            continue
        cands = [pg["displayName"]] + [s.get("name") for s in pg["synonyms"]
                                       if s.get("kind") in ("common", "generic", "inn", None)]
        for c in cands:
            n = normalise_name(c or "", salts)
            if n and len(n) >= 3:
                page_name[pg["key"]] = n
                break

    rows = []
    matched_by_tier = Counter()
    matched_by_rule_tier = Counter()
    fields_by_tier = defaultdict(Counter)
    candidate_fields_by_tier = defaultdict(Counter)
    used_cids = set()
    unmatched_pages = []
    name_candidates = []
    cid_agreement = Counter()
    inchikey_agreement = Counter()

    def row(pg, cid, field, value, rule, form_of_target):
        rows.append({
            "key": pg["key"], "tier": pg["tier"], "field": field,
            "value": json.dumps(value), "source_record_id": f"CID{cid}",
            "source_url": f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
            "source_date": SOURCE_DATE, "match_rule": rule,
            "form_of_target": form_of_target, "licence": LICENCE,
        })
        if rule == "name-candidate":
            candidate_fields_by_tier[pg["tier"]][field] += 1
        else:
            fields_by_tier[pg["tier"]][field] += 1

    def emit_form_of(pg, rec):
        """Rule (c). A skeleton match is a link between two different substances, so the
        only thing written is the link. Mass and partition coefficient differ between
        forms and are never copied across."""
        cid = str(rec.get("CID"))
        used_cids.add(cid)
        row(pg, cid, "form_of",
            {"cid": rec.get("CID"), "inchikey": rec.get("InChIKey"),
             "relation": "shares the InChIKey skeleton with this page; the full keys differ"},
            "skeleton", rec.get("InChIKey"))

    def emit(pg, rec, rule, form_of_target=None):
        cid = str(rec.get("CID"))
        used_cids.add(cid)
        if pg["isCombination"]:
            # A multi-ingredient product is not one molecule. The compound PubChem matched is
            # a component of the product, so it is written as a component relation and never
            # as the page's own identifier, mass or partition coefficient.
            row(pg, cid, "component",
                {prop_out: rec.get(prop_in) for prop_in, prop_out in PROP_FIELDS
                 if rec.get(prop_in) not in (None, "")},
                rule, form_of_target)
            return
        for prop, field in PROP_FIELDS:
            if field in STRUCTURE_FIELDS and pg["inchikey"]:
                continue  # the corpus already holds this structure; nothing is gained
            val = rec.get(prop)
            if val is None or val == "":
                continue
            row(pg, cid, field, val, rule, form_of_target)

    def _record_second_route(pg, unii_rec, conflicts, row_, formof_counts, used):
        """The UNII registry points at a compound other than the structure the page records.
        A shared InChIKey skeleton makes that a salt, ester, hydrate or stereoisomer relation,
        so it is written as a form_of link and the two are never merged. Different skeletons
        make them different substances, which is an identity question for Phase 3 rather than
        a field this run may fill."""
        ik = unii_rec.get("InChIKey") or ""
        if pg["inchikey"] and ik[:14] == pg["inchikey"][:14]:
            cid = str(unii_rec.get("CID"))
            used.add(cid)
            row_(pg, cid, "form_of",
                 {"cid": unii_rec.get("CID"), "inchikey": ik,
                  "relation": "the substance PubChem records for this page's UNII; shares the "
                              "InChIKey skeleton, so it is a salt, ester, hydrate or stereoisomer form"},
                 "skeleton", ik)
            formof_counts[pg["tier"]] += 1
        else:
            conflicts.append(_conflict(pg, unii_rec, "unii-record-is-a-different-substance"))

    structure_conflicts = []
    formof_links_by_tier = Counter()

    for pg in pages:
        tier = pg["tier"]

        # (a) UNII exact, from the bulk identifier table first, then the name-domain lookup.
        unii_rec = None
        if pg["unii"]:
            if pg["unii"] in bulk_unii:
                for c in sorted(bulk_unii[pg["unii"]], key=int):
                    if c in by_cid:
                        unii_rec = by_cid[c]
                        break
            if unii_rec is None and pg["unii"] in unii_records:
                unii_rec = unii_records[pg["unii"]][0]

        # (b) full InChIKey exact
        ik_rec = by_inchikey.get(pg["inchikey"], [None])[0] if pg["inchikey"] else None

        rec = None          # the record whose values may be written onto this page
        rule = None
        form_of_target = None

        if pg["inchikey"]:
            # The page states its own structure. Only a record carrying that exact full
            # InChIKey describes the same molecule, so only such a record may supply
            # mass, partition coefficient or polar surface area.
            if ik_rec is not None:
                rec = ik_rec
                same = unii_rec is not None and str(unii_rec.get("CID")) == str(ik_rec.get("CID"))
                rule = "unii" if same else "inchikey"
                if unii_rec is not None and not same:
                    _record_second_route(pg, unii_rec, structure_conflicts, row,
                                         formof_links_by_tier, used_cids)
            elif pg["inchikey14"]:
                for cand in skeleton_index.get(pg["inchikey14"], []):
                    if cand.get("InChIKey") != pg["inchikey"]:
                        rec, rule = cand, "skeleton"
                        form_of_target = cand.get("InChIKey")
                        break
                if rec is None and unii_rec is not None:
                    structure_conflicts.append(_conflict(pg, unii_rec, "unii-record-differs-no-exact-structure"))
            if rec is None and ik_rec is None and unii_rec is not None and not pg["inchikey14"]:
                structure_conflicts.append(_conflict(pg, unii_rec, "unii-record-differs-no-exact-structure"))
        else:
            # The page has no structure of its own, so the UNII record is the identity
            # evidence and nothing competes with it.
            if unii_rec is not None:
                rec, rule = unii_rec, "unii"
            else:
                n = page_name.get(pg["key"])
                if n and n in name_records:
                    rec, rule = name_records[n][0], "name-candidate"
                    name_candidates.append({
                        "key": pg["key"], "tier": tier, "displayName": pg["displayName"],
                        "normalised_name": n, "unii_held_by_corpus": pg["unii"] or "",
                        "pubchem_cid": str(rec.get("CID")), "pubchem_inchikey": rec.get("InChIKey"),
                        "cids_returned_for_name": len(name_records[n]),
                        "corpus_cid": str(pg["cid"] or ""),
                        "corpus_cid_agrees": (str(pg["cid"]) == str(rec.get("CID"))) if pg["cid"] else "",
                        "confirmation": "none: the page holds no InChIKey, and no UNII that PubChem recognises",
                    })

        if rec is None:
            unmatched_pages.append({"key": pg["key"], "tier": tier,
                                    "displayName": pg["displayName"],
                                    "has_unii": bool(pg["unii"]),
                                    "has_inchikey": bool(pg["inchikey"]),
                                    "is_combination": pg["isCombination"]})
            continue

        if rule != "skeleton":
            if pg["cid"]:
                cid_agreement["agree" if str(pg["cid"]) == str(rec.get("CID")) else "differ"] += 1
            else:
                cid_agreement["corpus_had_none"] += 1
            if pg["inchikey"]:
                inchikey_agreement["agree" if pg["inchikey"] == rec.get("InChIKey") else "differ"] += 1

        matched_by_tier[tier] += 1
        matched_by_rule_tier[(rule, tier)] += 1
        if rule == "skeleton":
            emit_form_of(pg, rec)
        else:
            emit(pg, rec, rule, form_of_target)

    df = pd.DataFrame(rows, columns=["key", "tier", "field", "value", "source_record_id",
                                     "source_url", "source_date", "match_rule",
                                     "form_of_target", "licence"])
    SRC.mkdir(parents=True, exist_ok=True)
    df.to_parquet(SRC / "mapped.parquet", index=False)

    fetched_cids = {str(r.get("CID")) for r in all_records if r.get("CID") is not None}
    unmatched_source_records = len(fetched_cids - used_cids)

    coverage = {
        "source": "PubChem",
        "retrieval_date": DATE,
        "licence": LICENCE,
        "corpusPages": len(pages),
        "pagesMatchedByTier": {str(t): matched_by_tier[t] for t in (1, 2, 3)},
        "pagesMatchedByTierAndRuleNote": (
            "One primary rule per page. A form_of link added alongside a primary match is "
            "counted in formOfLinksByTier, not here, so these buckets do not overlap."),
        "formOfLinksByTier": {str(t): formof_links_by_tier[t] for t in (1, 2, 3)},
        "pagesMatchedByTierAndRule": {
            str(t): {r: matched_by_rule_tier[(r, t)]
                     for r in ("unii", "inchikey", "skeleton", "name-candidate")
                     if matched_by_rule_tier[(r, t)]}
            for t in (1, 2, 3)},
        "fieldsGainedByTier": {str(t): dict(sorted(fields_by_tier[t].items())) for t in (1, 2, 3)},
        "candidateFieldsByTier": {str(t): dict(sorted(candidate_fields_by_tier[t].items()))
                                  for t in (1, 2, 3)},
        "fieldsGainedTotal": dict(sorted(
            sum((fields_by_tier[t] for t in (1, 2, 3)), Counter()).items())),
        "candidateFieldsTotal": dict(sorted(
            sum((candidate_fields_by_tier[t] for t in (1, 2, 3)), Counter()).items())),
        "fetchedCompoundRecords": len(fetched_cids),
        "unmatchedSourceRecords": unmatched_source_records,
        "unmatchedSourceRecordsNote": (
            "PubChem compound records retrieved but attached to no page. A name lookup can "
            "return several CIDs; only the first is attached, so the rest count here."),
        "pagesUnmatched": len(unmatched_pages),
        "pagesUnmatchedByTier": dict(Counter(str(u["tier"]) for u in unmatched_pages)),
        "nameCandidatesSentToReview": len(name_candidates),
        "corpusCidAgreement": dict(cid_agreement),
        "corpusInchikeyAgreement": dict(inchikey_agreement),
        "structureConflictsForPhase3": len(structure_conflicts),
        "structureConflictsNote": (
            "Pages whose UNII PubChem maps to a compound that is not the structure the page "
            "records. No property is written from such a record: an ester or a parent has a "
            "different mass. Where the two share an InChIKey skeleton the relation is emitted "
            "as form_of instead."),
        "combinationPages": sum(1 for p in pages if p["isCombination"]),
        "combinationPagesNote": (
            "A multi-ingredient product is not one molecule, so a matched compound is written "
            "to it as a component relation carrying that compound's own values, never as the "
            "page's identifier, mass or partition coefficient."),
        "rows": len(df),
        "outputs": {
            "mapped": "data/sources/pubchem/mapped.parquet",
            "nameCandidates": "data/revamp/pubchem-name-candidates.csv",
            "unmatchedPages": "data/revamp/pubchem-unmatched-pages.csv",
            "structureConflicts": "data/revamp/pubchem-structure-conflicts.csv",
        },
    }
    (SRC / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n")

    rev = ROOT / "data" / "revamp"
    rev.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(name_candidates).to_csv(rev / "pubchem-name-candidates.csv", index=False)
    pd.DataFrame(unmatched_pages).to_csv(rev / "pubchem-unmatched-pages.csv", index=False)
    pd.DataFrame(structure_conflicts).to_csv(rev / "pubchem-structure-conflicts.csv", index=False)

    print(json.dumps({k: coverage[k] for k in (
        "corpusPages", "pagesMatchedByTier", "pagesMatchedByTierAndRule", "fieldsGainedTotal",
        "pagesUnmatched", "pagesUnmatchedByTier", "nameCandidatesSentToReview",
        "formOfLinksByTier", "unmatchedSourceRecords", "corpusCidAgreement", "corpusInchikeyAgreement",
        "structureConflictsForPhase3", "rows")}, indent=2))


if __name__ == "__main__":
    main()
