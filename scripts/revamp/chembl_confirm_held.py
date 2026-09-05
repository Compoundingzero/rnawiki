"""Confirm which ChEMBL 37 drug fields the corpus-20k run already holds.

Phase 2 item 8 of docs/specs/revamp-2026-09.md requires the ChEMBL run to confirm
that drug_mechanism, drug_indication, max_phase, withdrawn_flag/year/reason and
molecule_hierarchy (parent/salt) are held before new fields are fetched. This
script reads the held raw pulls under data/corpus-20k/raw/chembl/, counts each
field, and writes the counts into the already_held_confirmed block of
data/sources/chembl/coverage.json. It reads only files already on disk and makes
no network request.
"""

from __future__ import annotations

import glob
import json
from pathlib import Path

RAW = Path("data/corpus-20k/raw/chembl")
COVERAGE = Path("data/sources/chembl/coverage.json")


def count_molecules() -> dict[str, object]:
    molecules = 0
    max_phase_present = 0
    max_phase_ge_1 = 0
    withdrawn_flag_true = 0
    withdrawn_year_present = 0
    withdrawn_reason_present = 0
    withdrawn_country_present = 0
    hierarchy_present = 0
    hierarchy_salt_of_other_parent = 0
    molecule_keys: set[str] = set()

    for path in sorted(glob.glob(str(RAW / "molecules-*.json"))):
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
        for molecule in payload.get("molecules", []):
            molecules += 1
            molecule_keys.update(molecule.keys())
            if molecule.get("max_phase") is not None:
                max_phase_present += 1
                try:
                    if float(molecule["max_phase"]) >= 1:
                        max_phase_ge_1 += 1
                except (TypeError, ValueError):
                    pass
            if molecule.get("withdrawn_flag"):
                withdrawn_flag_true += 1
            if molecule.get("withdrawn_year") is not None:
                withdrawn_year_present += 1
            if molecule.get("withdrawn_reason") is not None:
                withdrawn_reason_present += 1
            if molecule.get("withdrawn_country") is not None:
                withdrawn_country_present += 1
            hierarchy = molecule.get("molecule_hierarchy")
            if hierarchy is not None:
                hierarchy_present += 1
                parent = hierarchy.get("parent_chembl_id")
                if parent and parent != molecule.get("molecule_chembl_id"):
                    hierarchy_salt_of_other_parent += 1

    return {
        "molecule_records": molecules,
        "max_phase_present": max_phase_present,
        "max_phase_gte_1": max_phase_ge_1,
        "withdrawn_flag_true": withdrawn_flag_true,
        "withdrawn_year_present": withdrawn_year_present,
        "withdrawn_reason_present": withdrawn_reason_present,
        "withdrawn_country_present": withdrawn_country_present,
        "molecule_hierarchy_present": hierarchy_present,
        "molecule_hierarchy_salt_or_child_of_other_parent": hierarchy_salt_of_other_parent,
        "withdrawn_keys_on_molecule_record": sorted(
            key for key in molecule_keys if "withdrawn" in key
        ),
    }


def count_rows(pattern: str, envelope_key: str) -> int:
    total = 0
    for path in sorted(glob.glob(str(RAW / pattern))):
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
        total += len(payload.get(envelope_key, []))
    return total


def main() -> None:
    molecule_counts = count_molecules()

    confirmed = {
        "source_files": str(RAW),
        "molecule_table": molecule_counts,
        "drug_mechanism_rows": count_rows("mechanism-*.json", "mechanisms"),
        "drug_indication_rows": count_rows("indication-*.json", "drug_indications"),
        "drug_warning_rows": count_rows("warning-*.json", "drug_warnings"),
        "chemreps_structures_file": str(RAW / "chembl_37_chemreps.txt.gz"),
        "withdrawn_detail_note": (
            "ChEMBL 37 carries withdrawn_flag on the molecule record and no "
            "withdrawn_reason, withdrawn_year or withdrawn_country field. "
            "Withdrawal detail is published in the drug_warning table, held here "
            "as warning-*.json with warning_type, warning_class, "
            "warning_description, warning_country and warning_year."
        ),
    }

    coverage = json.loads(COVERAGE.read_text(encoding="utf-8"))
    coverage["already_held_confirmed"] = confirmed
    COVERAGE.write_text(
        json.dumps(coverage, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(json.dumps(confirmed, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
