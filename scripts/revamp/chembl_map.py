"""Map the ChEMBL 37 pull onto rnawiki corpus pages.

Fields produced: `activities` (one row per pChEMBL-valued measurement against a
target the molecule's drug_mechanism record names), `publicationYears` (first and
last ChEMBL document year per molecule, from the compound_record/document join)
and `atc` (WHO ATC code with its five level descriptions).

Matching follows the revamp spec in priority order: UNII exact, full InChIKey
exact, InChIKey skeleton (linked as `form_of`, never merged), normalised name as
a candidate only. ChEMBL publishes no UNII on any endpoint used here, so rule (a)
cannot fire; that is recorded in coverage.json rather than worked around.
"""

from __future__ import annotations

import csv
import glob
import gzip
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402

from corpus_join import load_corpus_index, normalise_name  # noqa: E402

DATE = "2026-09-05"
ROOT = Path("data/sources/chembl")
RAW = ROOT / DATE / "raw"
HELD = Path("data/corpus-20k/raw/chembl")
CANONICAL = Path("data/corpus-20k/identity/canonical.ndjson")
REVIEW = Path("data/revamp/name-candidates")
LICENCE = "CC BY-SA 3.0"
API = "https://www.ebi.ac.uk/chembl/api/data"
MAX_ACTIVITIES_PER_MOLECULE = 1000


def load_held(pattern: str, collection: str, base: Path = HELD) -> list[dict]:
    rows: list[dict] = []
    for path in sorted(glob.glob(str(base / pattern))):
        rows += json.loads(Path(path).read_text())[collection]
    return rows


def page_chembl_ids() -> dict[str, str]:
    out: dict[str, str] = {}
    for line in CANONICAL.open():
        rec = json.loads(line)
        if rec.get("chemblId"):
            out[rec["key"]] = rec["chemblId"].strip()
    return out


def load_molecules() -> dict[str, dict]:
    mols: dict[str, dict] = {}
    for row in load_held("molecules-*.json", "molecules"):
        mols[row["molecule_chembl_id"]] = row
    for row in load_held("molecules-topup-*.json", "molecules", base=RAW):
        mols.setdefault(row["molecule_chembl_id"], row)
    return mols


def load_atc_dictionary() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for row in load_held("atc_class-*.json", "atc", base=RAW):
        out[row["level5"]] = row
    return out


def load_document_years() -> dict[str, int]:
    out: dict[str, int] = {}
    for path in sorted(glob.glob(str(RAW / "document-*.json"))):
        for row in json.loads(Path(path).read_text())["documents"]:
            year = row.get("year")
            if year:
                out[row["document_chembl_id"]] = int(year)
    return out


def load_publication_years(years: dict[str, int]) -> tuple[dict[str, dict], int, int]:
    """molecule -> {first, last, documentCount, documentsWithYear}."""
    docs: dict[str, set[str]] = defaultdict(set)
    records = 0
    for path in sorted(glob.glob(str(RAW / "compound-record-*.json"))):
        for row in json.loads(Path(path).read_text())["compound_records"]:
            records += 1
            if row.get("document_chembl_id"):
                docs[row["molecule_chembl_id"]].add(row["document_chembl_id"])
    out: dict[str, dict] = {}
    without_year = 0
    for mol, doc_ids in docs.items():
        dated = [years[d] for d in doc_ids if d in years]
        if not dated:
            without_year += 1
            continue
        out[mol] = {
            "first": min(dated),
            "last": max(dated),
            "documentCount": len(doc_ids),
            "documentsWithYear": len(dated),
        }
    return out, records, without_year


def mechanism_pairs() -> tuple[set[tuple[str, str]], dict[tuple[str, str], str]]:
    pairs: set[tuple[str, str]] = set()
    action: dict[tuple[str, str], str] = {}
    for row in load_held("mechanism-*.json", "mechanisms"):
        target = row.get("target_chembl_id")
        if not target:
            continue
        for mol in {row["molecule_chembl_id"], row.get("parent_molecule_chembl_id") or row["molecule_chembl_id"]}:
            pairs.add((mol, target))
            if row.get("action_type"):
                action[(mol, target)] = row["action_type"]
    return pairs, action


def load_activities(pairs: set[tuple[str, str]]) -> tuple[dict[str, list[dict]], int, int, dict[str, int]]:
    kept: dict[str, list[dict]] = defaultdict(list)
    fetched = 0
    off_mechanism = 0
    for path in sorted(glob.glob(str(RAW / "activity-*.json"))):
        for row in json.loads(Path(path).read_text())["activities"]:
            fetched += 1
            key = (row.get("molecule_chembl_id"), row.get("target_chembl_id"))
            if key not in pairs:
                off_mechanism += 1
                continue
            kept[row["molecule_chembl_id"]].append(row)
    truncated: dict[str, int] = {}
    for mol, rows in kept.items():
        if len(rows) > MAX_ACTIVITIES_PER_MOLECULE:
            rows.sort(key=lambda r: float(r["pchembl_value"]), reverse=True)
            truncated[mol] = len(rows)
            kept[mol] = rows[:MAX_ACTIVITIES_PER_MOLECULE]
    return kept, fetched, off_mechanism, truncated


def inchikeys(wanted: set[str], molecules: dict[str, dict]) -> dict[str, str]:
    out: dict[str, str] = {}
    for mol in wanted:
        struct = (molecules.get(mol) or {}).get("molecule_structures") or {}
        key = (struct.get("standard_inchi_key") or "").strip().upper()
        if key:
            out[mol] = key
    remaining = wanted - set(out)
    if remaining:
        with gzip.open(HELD / "chembl_37_chemreps.txt.gz", "rt", encoding="utf-8", errors="replace") as fh:
            header = fh.readline().rstrip("\n").split("\t")
            i_id, i_key = header.index("chembl_id"), header.index("standard_inchi_key")
            for line in fh:
                parts = line.rstrip("\n").split("\t")
                if len(parts) > i_key and parts[i_id] in remaining:
                    key = parts[i_key].strip().upper()
                    if key:
                        out[parts[i_id]] = key
    return out


def molecule_names(mol: str, molecules: dict[str, dict]) -> list[str]:
    rec = molecules.get(mol) or {}
    names = [rec.get("pref_name") or ""]
    for syn in rec.get("molecule_synonyms") or []:
        names.append(syn.get("molecule_synonym") or "")
        names.append(syn.get("synonyms") or "")
    return [n for n in names if n]


def main() -> int:
    idx = load_corpus_index()
    page_chembl = page_chembl_ids()
    chembl_to_pages: dict[str, list[str]] = defaultdict(list)
    for page, cid in page_chembl.items():
        chembl_to_pages[cid].append(page)

    molecules = load_molecules()
    atc_dict = load_atc_dictionary()
    years = load_document_years()
    pub_years, compound_records, mols_without_dated_document = load_publication_years(years)
    pairs, action_types = mechanism_pairs()
    activities, activities_fetched, off_mechanism, truncated = load_activities(pairs)

    atc_by_molecule: dict[str, list[str]] = {}
    for mol, rec in molecules.items():
        codes = rec.get("atc_classifications") or []
        if codes:
            atc_by_molecule[mol] = list(codes)

    contributing = set(activities) | set(pub_years) | set(atc_by_molecule)
    keys = inchikeys(contributing, molecules)

    # Match every contributing molecule to corpus pages, strongest rule first.
    matches: dict[str, list[tuple[str, str, str | None]]] = {}
    rule_counts = {"unii": 0, "inchikey": 0, "skeleton": 0, "name-candidate": 0}
    unmatched: list[str] = []
    name_candidate_rows: list[dict] = []
    unconfirmed_candidates = 0
    identity_only: list[str] = []

    for mol in sorted(contributing):
        key = keys.get(mol)
        found: list[tuple[str, str, str | None]] = []
        if key and key in idx.inchikey_to_keys:
            found = [(page, "inchikey", None) for page in idx.inchikey_to_keys[key]]
            rule_counts["inchikey"] += 1
        elif key and key[:14] in idx.skeleton_to_keys:
            found = [(page, "skeleton", page) for page in idx.skeleton_to_keys[key[:14]]]
            rule_counts["skeleton"] += 1
        else:
            pages: list[str] = []
            for name in molecule_names(mol, molecules):
                norm = normalise_name(name, idx.salts)
                if len(norm) >= 3:
                    for page in idx.name_to_keys.get(norm, []):
                        if page not in pages:
                            pages.append(page)
            if pages:
                rule_counts["name-candidate"] += 1
                for page in pages:
                    confirmed = page_chembl.get(page) == mol
                    if not confirmed:
                        unconfirmed_candidates += 1
                    name_candidate_rows.append(
                        {
                            "molecule_chembl_id": mol,
                            "molecule_name": (molecules.get(mol) or {}).get("pref_name") or "",
                            "page_key": page,
                            "page_display_name": idx.display.get(page, ""),
                            "tier": idx.tier_of(page),
                            "confirmed_by_corpus_chembl_id": confirmed,
                        }
                    )
                found = [(page, "name-candidate", None) for page in pages]
            elif mol in chembl_to_pages:
                identity_only.append(mol)
        if found:
            matches[mol] = found
        else:
            unmatched.append(mol)

    rows: list[dict] = []

    def emit(page: str, rule: str, form_of: str | None, field: str, value: dict, record_id: str, url: str) -> None:
        rows.append(
            {
                "key": page,
                "tier": idx.tier_of(page),
                "field": field,
                "value": json.dumps(value, sort_keys=True),
                "source_record_id": record_id,
                "source_url": url,
                "source_date": DATE,
                "match_rule": rule,
                "form_of_target": form_of,
                "licence": LICENCE,
            }
        )

    for mol, targets in matches.items():
        for page, rule, form_of in targets:
            for act in activities.get(mol, []):
                value = {
                    "moleculeChemblId": mol,
                    "targetChemblId": act.get("target_chembl_id"),
                    "targetPrefName": act.get("target_pref_name"),
                    "targetOrganism": act.get("target_organism"),
                    "mechanismActionType": action_types.get((mol, act.get("target_chembl_id"))),
                    "assayType": act.get("assay_type"),
                    "assayChemblId": act.get("assay_chembl_id"),
                    "assayDescription": act.get("assay_description"),
                    "standardType": act.get("standard_type"),
                    "standardRelation": act.get("standard_relation"),
                    "standardValue": act.get("standard_value"),
                    "standardUnits": act.get("standard_units"),
                    "pchembl": act.get("pchembl_value"),
                    "documentChemblId": act.get("document_chembl_id"),
                    "documentYear": act.get("document_year"),
                }
                emit(
                    page,
                    rule,
                    form_of,
                    "activities",
                    value,
                    str(act.get("activity_id")),
                    f"{API}/activity/{act.get('activity_id')}.json",
                )
            if mol in pub_years:
                value = {"moleculeChemblId": mol, **pub_years[mol]}
                emit(
                    page,
                    rule,
                    form_of,
                    "publicationYears",
                    value,
                    f"compound_record:{mol}",
                    f"{API}/compound_record.json?molecule_chembl_id={mol}",
                )
            for code in atc_by_molecule.get(mol, []):
                entry = atc_dict.get(code) or {}
                value = {
                    "moleculeChemblId": mol,
                    "code": code,
                    "level1": entry.get("level1"),
                    "level1Description": entry.get("level1_description"),
                    "level2": entry.get("level2"),
                    "level2Description": entry.get("level2_description"),
                    "level3": entry.get("level3"),
                    "level3Description": entry.get("level3_description"),
                    "level4": entry.get("level4"),
                    "level4Description": entry.get("level4_description"),
                    "level5": entry.get("level5") or code,
                    "whoName": entry.get("who_name"),
                }
                emit(
                    page,
                    rule,
                    form_of,
                    "atc",
                    value,
                    f"{mol}:{code}",
                    f"{API}/atc_class/{code}.json",
                )

    frame = pd.DataFrame(
        rows,
        columns=[
            "key",
            "tier",
            "field",
            "value",
            "source_record_id",
            "source_url",
            "source_date",
            "match_rule",
            "form_of_target",
            "licence",
        ],
    )
    frame["tier"] = frame["tier"].astype("int64")
    for column in frame.columns:
        if column != "tier":
            frame[column] = frame[column].astype("string")
    frame.to_parquet(ROOT / "mapped.parquet", index=False)

    REVIEW.mkdir(parents=True, exist_ok=True)
    review_path = REVIEW / "chembl.csv"
    with review_path.open("w", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "molecule_chembl_id",
                "molecule_name",
                "page_key",
                "page_display_name",
                "tier",
                "confirmed_by_corpus_chembl_id",
            ],
        )
        writer.writeheader()
        for row in sorted(name_candidate_rows, key=lambda r: (r["molecule_chembl_id"], r["page_key"])):
            writer.writerow(row)

    pages_by_tier: dict[str, set[str]] = defaultdict(set)
    fields_by_tier: dict[str, dict[str, dict[str, int]]] = defaultdict(lambda: defaultdict(lambda: {"pages": 0, "values": 0}))
    field_pages: dict[tuple[int, str], set[str]] = defaultdict(set)
    rule_pages: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for row in rows:
        tier = str(row["tier"])
        pages_by_tier[tier].add(row["key"])
        fields_by_tier[tier][row["field"]]["values"] += 1
        field_pages[(row["tier"], row["field"])].add(row["key"])
        rule_pages[row["match_rule"]][tier].add(row["key"])
    for (tier, field), pages in field_pages.items():
        fields_by_tier[str(tier)][field]["pages"] = len(pages)

    corpus_tier_totals: dict[str, int] = defaultdict(int)
    for page in idx.tier:
        corpus_tier_totals[str(idx.tier[page])] += 1

    coverage = {
        "source": "chembl",
        "source_name": "ChEMBL 37 (EMBL-EBI)",
        "source_version": "ChEMBL 37",
        "retrieval_date": DATE,
        "licence": "CC BY-SA 3.0",
        "corpus_pages_total": len(idx.tier),
        "corpus_pages_by_tier": {k: corpus_tier_totals[k] for k in sorted(corpus_tier_totals)},
        "already_held_confirmed": {
            "molecule_table_max_phase_gte_1": len(load_held("molecules-*.json", "molecules")),
            "drug_mechanism_rows": len(load_held("mechanism-*.json", "mechanisms")),
            "drug_indication_rows": len(load_held("indication-*.json", "drug_indications")),
            "drug_warning_rows": len(load_held("warning-*.json", "drug_warnings")),
            "chemreps_structures_file": "data/corpus-20k/raw/chembl/chembl_37_chemreps.txt.gz",
        },
        "source_records": {
            "corpus_chembl_ids": len(chembl_to_pages),
            "molecules_topped_up_below_max_phase_1": len(load_held("molecules-topup-*.json", "molecules", base=RAW)),
            "compound_records_read": compound_records,
            "documents_with_year": len(years),
            "activities_fetched": activities_fetched,
            "activities_off_mechanism_target_discarded": off_mechanism,
            "activities_kept": sum(len(v) for v in activities.values()),
            "molecules_with_activities": len(activities),
            "molecules_with_publication_years": len(pub_years),
            "molecules_with_atc_codes": len(atc_by_molecule),
            "atc_codes_in_dictionary": len(atc_dict),
        },
        "pages_matched_by_tier": {k: len(v) for k, v in sorted(pages_by_tier.items())},
        "pages_matched_total": len({row["key"] for row in rows}),
        "pages_matched_by_tier_and_rule": {
            rule: {tier: len(pages) for tier, pages in sorted(tiers.items())}
            for rule, tiers in sorted(rule_pages.items())
        },
        "fields_gained_by_tier": {
            tier: {field: dict(counts) for field, counts in sorted(fields.items())}
            for tier, fields in sorted(fields_by_tier.items())
        },
        "fields_gained": sorted({row["field"] for row in rows}),
        "mapped_rows": len(rows),
        "molecules_matched_by_rule": rule_counts,
        "unii_rule_note": (
            "ChEMBL 37 publishes no UNII on the molecule, activity, compound_record, document or "
            "atc_class endpoints and none in chembl_37_chemreps.txt.gz, so mapping rule (a) could "
            "not fire for this source. Rule (b) full InChIKey carried the mapping."
        ),
        "withdrawn_reason_note": (
            "ChEMBL 37 carries no withdrawn_reason, withdrawn_year or withdrawn_country field on the "
            "molecule endpoint; the molecule record holds withdrawn_flag only. Withdrawal detail lives "
            "in the drug_warning table already held under data/corpus-20k/raw/chembl/warning-*.json as "
            "warning_type, warning_class, warning_description, warning_country and warning_year."
        ),
        "unmatched_source_records": {
            "contributing_molecules": len(contributing),
            "contributing_molecules_unmatched": len(unmatched),
            "contributing_molecules_unmatched_ids": sorted(unmatched),
            "molecules_matched_by_corpus_chembl_id_only": len(identity_only),
            "molecules_matched_by_corpus_chembl_id_only_detail": {
                mol: chembl_to_pages[mol] for mol in sorted(identity_only)
            },
            "identity_only_note": (
                "These ChEMBL ids are recorded on a corpus page but carry no InChIKey in "
                "chembl_37_chemreps.txt.gz and no name that normalises onto that page, so none of the "
                "four spec mapping rules can fire and no row is written for them. They are listed here "
                "for the Phase 3 identity review."
            ),
            "molecules_with_compound_records_but_no_dated_document": mols_without_dated_document,
            "corpus_chembl_ids_absent_from_molecule_endpoint": sorted(
                set(chembl_to_pages) - set(molecules)
            ),
            "corpus_chembl_ids_absent_note": (
                "These ChEMBL ids are recorded on corpus pages but are not in the held max_phase>=1 "
                "molecule pull and were not returned by the molecule endpoint top-up. Two were checked "
                "individually on 2026-09-05 and answered HTTP 404 "
                "(https://www.ebi.ac.uk/chembl/api/data/molecule/CHEMBL417016.json and "
                ".../CHEMBL1200608.json, logged in requests.log), so they no longer resolve in "
                "ChEMBL 37 and belong on the Phase 3 identity review list."
            ),
        },
        "activity_truncation": {
            "rule": "molecules with more than 1000 qualifying activities keep the 1000 highest pChEMBL",
            "molecules_truncated": len(truncated),
            "detail": dict(sorted(truncated.items(), key=lambda kv: -kv[1])),
        },
        "name_candidates_sent_to_review": {
            "pairs": len(name_candidate_rows),
            "pairs_unconfirmed_by_corpus_chembl_id": unconfirmed_candidates,
            "distinct_pages": len({r["page_key"] for r in name_candidate_rows}),
            "distinct_molecules": len({r["molecule_chembl_id"] for r in name_candidate_rows}),
            "path": str(review_path),
        },
    }
    (ROOT / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n")

    print(json.dumps({k: coverage[k] for k in ("pages_matched_by_tier", "fields_gained", "mapped_rows", "molecules_matched_by_rule")}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
