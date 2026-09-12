#!/usr/bin/env python3
"""Map IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb) ligand-target interactions onto
rnawiki corpus pages.

Inputs
  data/sources/iuphar/2026-09-05/raw/{ligands,peptides,interactions,targets_and_families}.csv
  data/corpus-20k/identity/canonical.ndjson
  data/corpus-20k/tiers/model-assignment.ndjson
  scripts/revamp/salts.txt

Outputs
  data/sources/iuphar/mapped.parquet          one row per page x interaction
  data/sources/iuphar/coverage.json           pages matched and fields gained per tier
  data/revamp/name-candidates/iuphar.csv      name-only matches for the Phase 3 review list

Mapping rules are applied per GtoPdb ligand in the priority order set by
docs/specs/revamp-2026-09.md Phase 2:
  (a) UNII exact          - GtoPdb 2026.2 publishes no UNII, so this rule cannot fire.
  (b) full InChIKey exact - match_rule "inchikey"
  (c) InChIKey skeleton   - match_rule "skeleton", linked as form_of, never merged
  (d) normalised name     - match_rule "name-candidate", also written to the review list

A ligand stops at the first rule that produces a match. Where a matched page is a
component of a combination page, the combination page receives the same values with
the component key recorded in the value payload.
"""
from __future__ import annotations

import csv
import html
import json
import pathlib
import re
import sys
import unicodedata
from collections import defaultdict

import pandas as pd

DATE = "2026-09-05"
ROOT = pathlib.Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "sources" / "iuphar" / DATE / "raw"
OUT_DIR = ROOT / "data" / "sources" / "iuphar"
CANONICAL = ROOT / "data" / "corpus-20k" / "identity" / "canonical.ndjson"
TIERS = ROOT / "data" / "corpus-20k" / "tiers" / "model-assignment.ndjson"
SALTS = ROOT / "scripts" / "revamp" / "salts.txt"
REVIEW_DIR = ROOT / "data" / "revamp" / "name-candidates"

SOURCE_VERSION = "2026.2"
SOURCE_DATE = "2026-06-15"
LICENCE = "CC BY-SA 4.0 (contents); ODbL (database) - IUPHAR/BPS Guide to PHARMACOLOGY"
LIGAND_URL = "https://www.guidetopharmacology.org/GRAC/LigandDisplayForward?ligandId={}"

GREEK = {
    "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta",
    "ε": "epsilon", "ζ": "zeta", "η": "eta", "θ": "theta",
    "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu",
    "π": "pi", "ρ": "rho", "σ": "sigma", "τ": "tau",
    "φ": "phi", "χ": "chi", "ψ": "psi", "ω": "omega",
}

STEREO_PREFIX = re.compile(
    r"^(?:"
    r"\((?:[0-9]+[rszec](?:,)?)+\)|"
    r"\((?:r|s|rs|sr|e|z|d|l|dl|\+|-|\+/-|±|\+-)\)|"
    r"rac|racemic|±|\+/-|"
    r"[dl]|dl|ld|cis|trans|meso|alpha|beta|n|o|s"
    r")[\s\-]+",
    re.IGNORECASE,
)

GENERIC_SYNONYM = re.compile(
    r"^(?:compound|cpd|example|analogue|analog|ligand|inhibitor|agonist|antagonist|"
    r"antibody|peptide|derivative|isomer|probe|tool)\b.*\d|^\d+$|\[pmid",
    re.IGNORECASE,
)


def load_salts() -> list[str]:
    lines = [
        line.strip().lower()
        for line in SALTS.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]
    # longest first so "lauryl sulfate" is stripped before "sulfate"
    return sorted(set(lines), key=len, reverse=True)


SALT_SUFFIXES = load_salts()


def strip_markup(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", "", value)
    return value.strip()


def normalise_name(value: str) -> str:
    value = strip_markup(value).lower()
    for greek, word in GREEK.items():
        value = value.replace(greek, word)
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"\((?:r|s|rs|sr)\)", " ", value)
    for _ in range(4):
        stripped = STEREO_PREFIX.sub("", value)
        if stripped == value:
            break
        value = stripped
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    changed = True
    while changed:
        changed = False
        for suffix in SALT_SUFFIXES:
            if value.endswith(" " + suffix) and len(value) > len(suffix) + 3:
                value = value[: -(len(suffix) + 1)].strip()
                changed = True
    value = re.sub(r"\s+", " ", value).strip()
    return value


def usable_name(value: str) -> bool:
    return len(value) >= 4 and not value.isdigit()


def read_gtopdb_csv(path: pathlib.Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as fh:
        first = fh.readline()
        if not first.startswith('"# GtoPdb Version'):
            fh.seek(0)
        return list(csv.DictReader(fh))


def load_corpus():
    tier_of: dict[str, int] = {}
    for line in TIERS.open(encoding="utf-8"):
        rec = json.loads(line)
        model = rec.get("model")
        if model == "LONGEVITY" or rec.get("withdrawn"):
            tier = 1
        elif model == "CLINICAL":
            tier = 2
        else:
            tier = 3
        tier_of[rec["key"]] = tier

    pages: dict[str, dict] = {}
    by_unii: dict[str, list[str]] = defaultdict(list)
    by_inchikey: dict[str, list[str]] = defaultdict(list)
    by_skeleton: dict[str, list[str]] = defaultdict(list)
    by_name: dict[str, list[str]] = defaultdict(list)
    contains: dict[str, list[str]] = defaultdict(list)  # component key -> combination keys

    for line in CANONICAL.open(encoding="utf-8"):
        rec = json.loads(line)
        key = rec["key"]
        structure = rec.get("structure") or {}
        page = {
            "key": key,
            "tier": tier_of.get(key, 3),
            "displayName": rec.get("displayName") or "",
            "unii": (rec.get("unii") or "").strip().upper() or None,
            "inchikey": (structure.get("inchikey") or "").strip().upper() or None,
            "inchikey14": (structure.get("inchikey14") or "").strip().upper() or None,
            "isCombination": bool(rec.get("isCombination")),
        }
        pages[key] = page
        if page["unii"]:
            by_unii[page["unii"]].append(key)
        if page["inchikey"]:
            by_inchikey[page["inchikey"]].append(key)
        if page["inchikey14"]:
            by_skeleton[page["inchikey14"]].append(key)
        names = {page["displayName"]}
        for syn in rec.get("synonyms") or []:
            if isinstance(syn, dict) and syn.get("name"):
                names.add(syn["name"])
        seen = set()
        for raw in names:
            norm = normalise_name(raw)
            if usable_name(norm) and norm not in seen:
                seen.add(norm)
                by_name[norm].append(key)
        for rel in rec.get("relations") or []:
            if isinstance(rel, dict) and rel.get("type") == "contains" and rel.get("targetKey"):
                contains[rel["targetKey"]].append(key)

    return pages, by_unii, by_inchikey, by_skeleton, by_name, contains


def load_ligands():
    ligands: dict[str, dict] = {}
    for row in read_gtopdb_csv(RAW / "ligands.csv"):
        lid = row["Ligand ID"].strip()
        synonyms = [
            strip_markup(s)
            for s in (row.get("Synonyms") or "").split("|")
            if s.strip()
        ]
        ligands[lid] = {
            "ligandId": lid,
            "name": strip_markup(row.get("Name", "")),
            "type": row.get("Type", "").strip(),
            "approved": row.get("Approved", "").strip().lower() == "yes",
            "withdrawn": row.get("Withdrawn", "").strip().lower() == "yes",
            "inchikey": (row.get("InChIKey") or "").strip().upper() or None,
            "inn": strip_markup(row.get("INN", "")),
            "synonyms": synonyms,
            "chemblId": (row.get("ChEMBL ID") or "").strip() or None,
            "pubchemCid": (row.get("PubChem CID") or "").strip() or None,
        }
    # peptides.csv carries InChIKeys for some peptide ligands that ligands.csv leaves blank
    for row in read_gtopdb_csv(RAW / "peptides.csv"):
        lid = row["Ligand id"].strip()
        key = (row.get("InChIKey") or "").strip().upper()
        if lid in ligands and key and not ligands[lid]["inchikey"]:
            ligands[lid]["inchikey"] = key
    for row in read_gtopdb_csv(RAW / "ligand_id_mapping.csv"):
        lid = row["Ligand id"].strip()
        if lid not in ligands:
            continue
        ligands[lid]["cas"] = (row.get("CAS") or "").strip() or None
        ligands[lid]["drugCentralId"] = (row.get("Drug Central ID") or "").strip() or None
    return ligands


def load_targets():
    targets: dict[str, dict] = {}
    for row in read_gtopdb_csv(RAW / "targets_and_families.csv"):
        tid = (row.get("Target id") or "").strip()
        if not tid:
            continue
        entry = targets.setdefault(
            tid,
            {
                "targetClass": (row.get("Type") or "").strip() or None,
                "targetFamily": strip_markup(row.get("Family name", "")) or None,
                "hgncSymbol": (row.get("HGNC symbol") or "").strip() or None,
                "humanSwissProt": (row.get("Human SwissProt") or "").strip() or None,
            },
        )
        for field, column in (
            ("targetClass", "Type"),
            ("targetFamily", "Family name"),
            ("hgncSymbol", "HGNC symbol"),
            ("humanSwissProt", "Human SwissProt"),
        ):
            if not entry[field]:
                value = strip_markup(row.get(column, ""))
                if value:
                    entry[field] = value
    return targets


def number_or_none(value: str):
    value = (value or "").strip()
    if not value or value == "-":
        return None
    try:
        return round(float(value), 4)
    except ValueError:
        return None


def blank_to_none(value: str):
    value = strip_markup(value or "")
    return value or None


def unset_to_none(value: str):
    """GtoPdb writes the literal strings "None" and "-" where a field is unset."""
    value = strip_markup(value or "")
    if value in ("", "None", "-"):
        return None
    return value


def build_interactions(targets):
    by_ligand: dict[str, list[dict]] = defaultdict(list)
    total = 0
    no_target = 0
    for index, row in enumerate(read_gtopdb_csv(RAW / "interactions.csv")):
        lid = (row.get("Ligand ID") or "").strip()
        if not lid:
            continue
        total += 1
        if not (blank_to_none(row.get("Target")) or blank_to_none(row.get("Target Ligand"))):
            # Whole-organism or phenotypic activity rows carry no target of any kind
            # (no name, id, gene symbol, UniProt accession or family). They cannot
            # populate iupharTargets, so they are excluded and counted in coverage.json.
            no_target += 1
            continue
        tid = (row.get("Target ID") or "").strip()
        tinfo = targets.get(tid, {})
        pubmed = (row.get("PubMed ID") or "").strip()
        payload = {
            "ligandId": lid,
            "ligandName": strip_markup(row.get("Ligand", "")),
            "target": blank_to_none(row.get("Target")),
            "targetId": tid or None,
            "targetLigand": blank_to_none(row.get("Target Ligand")),
            "targetLigandId": blank_to_none(row.get("Target Ligand ID")),
            "targetLabel": (
                blank_to_none(row.get("Target")) or blank_to_none(row.get("Target Ligand"))
            ),
            "targetGeneSymbol": blank_to_none(row.get("Target Gene Symbol")),
            "targetUniProtId": blank_to_none(row.get("Target UniProt ID")),
            "targetSpecies": unset_to_none(row.get("Target Species")),
            "targetClass": tinfo.get("targetClass"),
            "targetFamily": tinfo.get("targetFamily"),
            "interactionType": unset_to_none(row.get("Type")),
            "action": unset_to_none(row.get("Action")),
            "actionComment": blank_to_none(row.get("Action comment")),
            "selectivity": unset_to_none(row.get("Selectivity")),
            "endogenous": (row.get("Endogenous") or "").strip().lower() == "true",
            "primaryTarget": (row.get("Primary Target") or "").strip().lower() == "true",
            "affinityUnits": unset_to_none(row.get("Affinity Units")),
            "affinityMedian": number_or_none(row.get("Affinity Median")),
            "affinityLow": number_or_none(row.get("Affinity Low")),
            "affinityHigh": number_or_none(row.get("Affinity High")),
            "originalAffinityUnits": unset_to_none(row.get("Original Affinity Units")),
            "originalAffinityRelation": blank_to_none(row.get("Original Affinity Relation")),
            "originalAffinityMedianNm": number_or_none(row.get("Original Affinity Median nm")),
            "concentrationRange": blank_to_none(row.get("concentration Range")),
            "assayDescription": blank_to_none(row.get("Assay Description")),
            "receptorSite": blank_to_none(row.get("Receptor Site")),
            "ligandContext": blank_to_none(row.get("Ligand Context")),
            "pubmedId": pubmed or None,
            "reference": f"https://pubmed.ncbi.nlm.nih.gov/{pubmed}/" if pubmed else None,
            "webpageUrls": blank_to_none(row.get("Webpage URLs")),
            "gtopdbVersion": SOURCE_VERSION,
        }
        record_id = f"gtopdb:interaction:L{lid}:T{tid or 'none'}:r{index}"
        by_ligand[lid].append((record_id, payload))
    return by_ligand, total, no_target


def main() -> int:
    pages, by_unii, by_inchikey, by_skeleton, by_name, contains = load_corpus()
    ligands = load_ligands()
    targets = load_targets()
    interactions_by_ligand, interaction_rows, interaction_rows_no_target = build_interactions(
        targets
    )

    unii_available = False  # GtoPdb 2026.2 publishes no UNII column; verified in-run

    rows = []
    name_candidates = []
    rule_ligand_counts = {"unii": 0, "inchikey": 0, "skeleton": 0, "name-candidate": 0}
    unmatched_ligands = []
    ligands_with_interactions = sorted(interactions_by_ligand)

    for lid in ligands_with_interactions:
        ligand = ligands.get(lid)
        if ligand is None:
            unmatched_ligands.append(lid)
            continue

        matched: list[str] = []
        rule = None
        form_of_target = None

        if unii_available and ligand.get("unii"):
            matched = by_unii.get(ligand["unii"], [])
            if matched:
                rule = "unii"

        if not matched and ligand["inchikey"]:
            matched = by_inchikey.get(ligand["inchikey"], [])
            if matched:
                rule = "inchikey"

        if not matched and ligand["inchikey"] and len(ligand["inchikey"]) >= 14:
            skeleton = ligand["inchikey"][:14]
            matched = by_skeleton.get(skeleton, [])
            if matched:
                rule = "skeleton"
                form_of_target = (
                    f"gtopdb:ligand:{lid}|{ligand['name']}|inchikey={ligand['inchikey']}"
                )

        if not matched:
            candidate_names = [ligand["name"], ligand["inn"]] + ligand["synonyms"]
            hits: list[str] = []
            matched_on = None
            for raw in candidate_names:
                if not raw or GENERIC_SYNONYM.search(raw):
                    continue
                norm = normalise_name(raw)
                if not usable_name(norm):
                    continue
                found = by_name.get(norm)
                if found:
                    hits = found
                    matched_on = (raw, norm)
                    break
            if hits:
                matched = hits
                rule = "name-candidate"
                for key in hits:
                    name_candidates.append(
                        {
                            "corpus_key": key,
                            "corpus_display_name": pages[key]["displayName"],
                            "corpus_tier": pages[key]["tier"],
                            "corpus_unii": pages[key]["unii"] or "",
                            "corpus_inchikey": pages[key]["inchikey"] or "",
                            "gtopdb_ligand_id": lid,
                            "gtopdb_name": ligand["name"],
                            "gtopdb_inchikey": ligand["inchikey"] or "",
                            "gtopdb_chembl_id": ligand["chemblId"] or "",
                            "gtopdb_pubchem_cid": ligand["pubchemCid"] or "",
                            "matched_on_source_name": matched_on[0],
                            "normalised_name": matched_on[1],
                            "ambiguous_pages_for_name": len(hits),
                            "confirmation": (
                                "none - corpus page and GtoPdb ligand share no UNII and no "
                                "InChIKey; needs a human decision"
                            ),
                            "interactions_pending": len(interactions_by_ligand[lid]),
                        }
                    )

        if not matched:
            unmatched_ligands.append(lid)
            continue

        rule_ligand_counts[rule] += 1

        # A page reached directly keeps the direct link; a combination page reached
        # through one of its components records the component it came from. A page
        # that is both is emitted once, as a direct match.
        targets_pages: dict[str, str | None] = {}
        for key in matched:
            targets_pages[key] = None
        for key in matched:
            for combo_key in contains.get(key, []):
                if combo_key not in targets_pages:
                    targets_pages[combo_key] = key

        for key, via_component in targets_pages.items():
            page = pages.get(key)
            if page is None:
                continue
            for record_id, payload in interactions_by_ligand[lid]:
                value = dict(payload)
                value["matchedLigandInChIKey"] = ligand["inchikey"]
                value["ligandApproved"] = ligand["approved"]
                value["ligandWithdrawn"] = ligand["withdrawn"]
                value["ligandType"] = ligand["type"]
                if rule == "name-candidate":
                    value["nameMatchUnconfirmed"] = True
                    value["nameMatchPageCount"] = len(matched)
                if via_component:
                    value["viaComponentPage"] = via_component
                rows.append(
                    {
                        "key": key,
                        "tier": page["tier"],
                        "field": "iupharTargets",
                        "value": json.dumps(value, ensure_ascii=False, sort_keys=True),
                        "source_record_id": record_id,
                        "source_url": LIGAND_URL.format(lid),
                        "source_date": SOURCE_DATE,
                        "match_rule": rule,
                        "form_of_target": form_of_target,
                        "licence": LICENCE,
                    }
                )

    frame = pd.DataFrame(
        rows,
        columns=[
            "key", "tier", "field", "value", "source_record_id", "source_url",
            "source_date", "match_rule", "form_of_target", "licence",
        ],
    )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frame.to_parquet(OUT_DIR / "mapped.parquet", index=False)

    REVIEW_DIR.mkdir(parents=True, exist_ok=True)
    review_path = REVIEW_DIR / "iuphar.csv"
    fieldnames = [
        "corpus_key", "corpus_display_name", "corpus_tier", "corpus_unii", "corpus_inchikey",
        "gtopdb_ligand_id", "gtopdb_name", "gtopdb_inchikey", "gtopdb_chembl_id",
        "gtopdb_pubchem_cid", "matched_on_source_name", "normalised_name",
        "ambiguous_pages_for_name", "confirmation", "interactions_pending",
    ]
    with review_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(name_candidates)

    pages_by_tier: dict[int, set[str]] = defaultdict(set)
    pages_by_tier_rule: dict[str, dict[int, set[str]]] = defaultdict(lambda: defaultdict(set))
    values_by_tier: dict[int, int] = defaultdict(int)
    for row in rows:
        pages_by_tier[row["tier"]].add(row["key"])
        pages_by_tier_rule[row["match_rule"]][row["tier"]].add(row["key"])
        values_by_tier[row["tier"]] += 1

    unmatched_by_type: dict[str, int] = defaultdict(int)
    approved_total = 0
    approved_unmatched = 0
    unmatched_approved_rows = []
    unmatched_set = set(unmatched_ligands)
    for lid in ligands_with_interactions:
        ligand = ligands.get(lid)
        if ligand is None:
            continue
        if ligand["approved"]:
            approved_total += 1
        if lid in unmatched_set:
            unmatched_by_type[ligand["type"] or "unspecified"] += 1
            if ligand["approved"]:
                approved_unmatched += 1
                unmatched_approved_rows.append(
                    {
                        "gtopdb_ligand_id": lid,
                        "gtopdb_name": ligand["name"],
                        "gtopdb_type": ligand["type"],
                        "gtopdb_inchikey": ligand["inchikey"] or "",
                        "gtopdb_chembl_id": ligand["chemblId"] or "",
                        "gtopdb_pubchem_cid": ligand["pubchemCid"] or "",
                        "interactions_unmapped": len(interactions_by_ligand[lid]),
                    }
                )
    unmatched_path = REVIEW_DIR / "iuphar-unmatched-approved.csv"
    with unmatched_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "gtopdb_ligand_id", "gtopdb_name", "gtopdb_type", "gtopdb_inchikey",
                "gtopdb_chembl_id", "gtopdb_pubchem_cid", "interactions_unmapped",
            ],
        )
        writer.writeheader()
        writer.writerows(sorted(unmatched_approved_rows, key=lambda r: r["gtopdb_name"]))

    corpus_tier_totals = defaultdict(int)
    for page in pages.values():
        corpus_tier_totals[page["tier"]] += 1

    combination_pages = {
        row["key"] for row in rows if json.loads(row["value"]).get("viaComponentPage")
    }

    coverage = {
        "source": "iuphar",
        "source_name": "IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb)",
        "source_version": SOURCE_VERSION,
        "source_published": SOURCE_DATE,
        "retrieval_date": DATE,
        "licence": LICENCE,
        "corpus_pages_total": len(pages),
        "corpus_pages_by_tier": {str(t): corpus_tier_totals[t] for t in (1, 2, 3)},
        "source_records": {
            "ligands": len(ligands),
            "ligands_with_at_least_one_interaction": len(ligands_with_interactions),
            "interaction_rows": interaction_rows,
            "interaction_rows_excluded_no_target": interaction_rows_no_target,
            "interaction_rows_mappable": interaction_rows - interaction_rows_no_target,
            "targets": len(targets),
        },
        "pages_matched_by_tier": {
            str(t): len(pages_by_tier.get(t, set())) for t in (1, 2, 3)
        },
        "pages_matched_total": sum(len(v) for v in pages_by_tier.values()),
        "pages_matched_by_tier_and_rule": {
            rule: {str(t): len(tiers.get(t, set())) for t in (1, 2, 3)}
            for rule, tiers in sorted(pages_by_tier_rule.items())
        },
        "fields_gained_by_tier": {
            str(t): (
                {"iupharTargets": {
                    "pages": len(pages_by_tier.get(t, set())),
                    "values": values_by_tier.get(t, 0),
                }}
                if pages_by_tier.get(t)
                else {}
            )
            for t in (1, 2, 3)
        },
        "fields_gained": ["iupharTargets"],
        "mapped_rows": len(frame),
        "ligands_matched_by_rule": rule_ligand_counts,
        "unii_rule_note": (
            "GtoPdb release 2026.2 publishes no UNII in ligands.csv, ligand_id_mapping.csv, "
            "peptides.csv or the /services/ligands/{id}/databaseLinks web service, so mapping "
            "rule (a) produced no matches from this source. Verified against ligand 4779 "
            "(metformin) and 4860 (adalimumab): database links are CAS, ChEBI, ChEMBL, "
            "DrugBank, DrugCentral, PubChem, RCSB PDB, IMGT/mAb-DB and Wikipedia only."
        ),
        "excluded_source_records": {
            "interaction_rows_without_any_target": interaction_rows_no_target,
            "reason": (
                "GtoPdb records these as activity against a whole organism or preparation. "
                "They carry no target name, target id, gene symbol, UniProt accession or "
                "family, so they cannot populate iupharTargets."
            ),
        },
        "unmatched_source_records": {
            "ligands_with_interactions_unmatched": len(unmatched_ligands),
            "interaction_rows_unmatched": sum(
                len(interactions_by_ligand[lid]) for lid in unmatched_ligands
            ),
            "unmatched_by_ligand_type": dict(unmatched_by_type),
            "approved_ligands_with_interactions": approved_total,
            "approved_ligands_unmatched": approved_unmatched,
            "note": (
                "Most unmatched GtoPdb ligands are research tool compounds, radioligands "
                "and unapproved candidates that have no rnawiki page. Approved ligands that "
                "stayed unmatched are the residue worth a Phase 3 look and are listed in "
                "data/revamp/name-candidates/iuphar-unmatched-approved.csv."
            ),
        },
        "name_candidates_sent_to_review": {
            "pairs": len(name_candidates),
            "distinct_pages": len({c["corpus_key"] for c in name_candidates}),
            "distinct_ligands": len({c["gtopdb_ligand_id"] for c in name_candidates}),
            "path": str(review_path.relative_to(ROOT)),
        },
        "combination_pages_mapped_via_component": len(combination_pages),
        "outputs": {
            "mapped_parquet": "data/sources/iuphar/mapped.parquet",
            "raw": f"data/sources/iuphar/{DATE}/",
            "manifest": f"data/sources/iuphar/{DATE}/manifest.json",
        },
    }
    (OUT_DIR / "coverage.json").write_text(
        json.dumps(coverage, indent=2) + "\n", encoding="utf-8"
    )

    print(f"mapped rows: {len(frame)}")
    print(f"pages matched by tier: {coverage['pages_matched_by_tier']}")
    print(f"ligands matched by rule: {rule_ligand_counts}")
    print(f"unmatched ligands with interactions: {len(unmatched_ligands)}")
    print(f"name candidates to review: {len(name_candidates)} -> {review_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
