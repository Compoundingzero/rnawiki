#!/usr/bin/env python
"""Phase 4 section 18 item 2 — a structure-equality relation needs a structure.

`docs/specs/phase4-generators.md` section 18 item 2, from the lead's reading of slop draw 12:

    **"Same structure as" requires a structure**: an InChIKey of a single heavy atom or an element
    (activated charcoal "same structure as tantalum carbide") never makes a relation; the rule needs
    ≥ 2 heavy atoms and identical full keys.

Activated Charcoal and Tantalum Carbide are both recorded against `OKTJSMMVPCPJKN-UHFFFAOYSA-N`,
which is the InChIKey of one carbon atom. The key is identical and the statement is still empty: an
element's key describes the element, not a shared molecular structure, and two records that both
reduce to one atom have nothing structural in common to state. The same holds for Krypton and
Krypton Kr-81m, Xenon and Xenon Xe-127, Technetium Tc-99m, and the zinc cation.

This step is a projection over the revision Phase 3 published, exactly as
`scripts/revamp/identity_relations_v6.py` is: it re-resolves nothing, invents no relation and
changes no other row. It reads `relations-v6.parquet` and `canonical-v6.ndjson` and writes
`relations-v7.parquet` and `canonical-v7.ndjson` with every structure-equality relation that fails
the test removed from both. The v5 and v6 files stay on disk beside them, because the resolution's
own record of what it found must remain readable.

The test, applied to a relation whose whole claim is that two structures are the same:

  1. both pages carry a recorded full InChIKey, and the two are identical — the standard block
     included, so two records that differ in stereochemistry or isotope are not "the same
     structure"; and
  2. the structure that key describes has at least two heavy atoms.

Heavy atoms are counted with RDKit from the SMILES the corpus records for that structure — the
identity revision's own `structure.smiles`, else the SMILES PubChem published for the page. A
relation whose structure the corpus cannot count is removed too and counted separately: the rule
requires a structure, and a claim about a structure nothing describes is not one the page may make.

    .venv-corpus/bin/python scripts/revamp/identity_relations_v7.py

Output: `data/revamp/identity/relations-v7.parquet`, `data/revamp/identity/canonical-v7.ndjson`,
`data/revamp/identity/relations-v7-summary.json`.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter
from pathlib import Path

import pandas as pd
from rdkit import Chem, RDLogger

RDLogger.DisableLog("rdApp.*")

ROOT = Path(__file__).resolve().parents[2]
IDENTITY = ROOT / "data/revamp/identity"

# The relations whose whole claim is that two structures are identical. Every other relation in the
# vocabulary names a *difference* — a salt, an ester, a stereoisomer, an isotopologue, a component —
# and states something about the pair that survives without a heavy-atom count. `same-structure-as`
# is the one that says only "these are the same structure", and on a one-atom key it says nothing.
STRUCTURE_EQUALITY_RELATIONS = ("same-structure-as",)
MIN_HEAVY_ATOMS = 2


def kind(relation: str) -> str:
    """The relation's canonical spelling. The corpus writes both `same_structure_as` and the dash."""
    return (relation or "").strip().lower().replace("_", "-")


def is_structure_equality(relation: str) -> bool:
    return kind(relation) in STRUCTURE_EQUALITY_RELATIONS


def not_null(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    text = str(value).strip()
    return text or None


def load_structures(canonical: Path, pubchem: Path) -> tuple[dict[str, str], dict[str, str]]:
    """Per page: the recorded full InChIKey and a SMILES for it."""
    smiles: dict[str, str] = {}
    inchikey: dict[str, str] = {}
    with canonical.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            structure = record.get("structure") or {}
            if structure.get("smiles"):
                smiles[record["key"]] = structure["smiles"]
            if structure.get("inchikey"):
                inchikey[record["key"]] = structure["inchikey"]
    if pubchem.exists():
        frame = pd.read_parquet(pubchem, columns=["key", "field", "value"])
        for row in frame[frame["field"] == "smiles"].itertuples(index=False):
            if row.key in smiles:
                continue
            try:
                value = json.loads(row.value)
            except (TypeError, ValueError):
                value = row.value
            if isinstance(value, str) and value.strip():
                smiles[row.key] = value.strip()
    return smiles, inchikey


def load_spine_keys(spine: Path) -> dict[str, str]:
    """The full InChIKey Phase 3.1 attached to each page, which is the key R2 matched on."""
    if not spine.exists():
        raise SystemExit("%s is missing: the structure keys R2 matched on are read from it" % spine)
    frame = pd.read_parquet(spine, columns=["key", "inchikey"])
    return {
        row.key: value
        for row in frame.itertuples(index=False)
        if (value := not_null(row.inchikey)) is not None
    }


def heavy_atoms(smiles: str | None) -> int | None:
    if not smiles:
        return None
    # `sanitize=False`: a register's SMILES for an element or a salt need not pass valence checks,
    # and the count of heavy atoms does not depend on sanitisation.
    molecule = Chem.MolFromSmiles(smiles, sanitize=False)
    return None if molecule is None else molecule.GetNumAtoms()


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--relations", type=Path, default=IDENTITY / "relations-v6.parquet")
    parser.add_argument("--canonical", type=Path, default=IDENTITY / "canonical-v6.ndjson")
    parser.add_argument("--spine", type=Path, default=IDENTITY / "spine-attached.parquet")
    parser.add_argument(
        "--pubchem", type=Path, default=ROOT / "data/sources/pubchem/mapped.parquet"
    )
    parser.add_argument("--out-relations", type=Path, default=IDENTITY / "relations-v7.parquet")
    parser.add_argument("--out-canonical", type=Path, default=IDENTITY / "canonical-v7.ndjson")
    parser.add_argument("--summary", type=Path, default=IDENTITY / "relations-v7-summary.json")
    args = parser.parse_args(argv)

    if not args.relations.exists():
        print("no relations parquet at %s" % args.relations, file=sys.stderr)
        return 2

    smiles, canonical_keys = load_structures(args.canonical, args.pubchem)
    spine_keys = load_spine_keys(args.spine)

    def structure_key(page: str) -> str | None:
        return canonical_keys.get(page) or spine_keys.get(page)

    def smiles_for(page: str, other: str, key: str | None) -> str | None:
        held = smiles.get(page) or smiles.get(other)
        if held:
            return held
        if key:
            for candidate, recorded in canonical_keys.items():
                if recorded == key and candidate in smiles:
                    return smiles[candidate]
        return None

    verdicts: dict[tuple[str, str], tuple[bool, str, int | None]] = {}

    def verdict(page_a: str, page_b: str) -> tuple[bool, str, int | None]:
        """Does this pair support a structure-equality relation, and if not, why not?"""
        held = verdicts.get((page_a, page_b))
        if held is not None:
            return held
        key_a, key_b = structure_key(page_a), structure_key(page_b)
        if not key_a or not key_b:
            result = (False, "no full InChIKey is recorded for both pages", None)
        elif key_a != key_b:
            result = (False, "the recorded full InChIKeys are not identical", None)
        else:
            count = heavy_atoms(smiles_for(page_a, page_b, key_a))
            if count is None:
                result = (False, "the corpus records no structure for %s to count" % key_a, None)
            elif count < MIN_HEAVY_ATOMS:
                result = (False, "%s describes %d heavy atom" % (key_a, count), count)
            else:
                result = (True, "", count)
        verdicts[(page_a, page_b)] = result
        return result

    frame = pd.read_parquet(args.relations)
    before = len(frame)
    keep: list[bool] = []
    removed_reasons: Counter = Counter()
    removed_rows: list[dict[str, str]] = []
    for row in frame.itertuples(index=False):
        if not is_structure_equality(row.relation):
            keep.append(True)
            continue
        ok, reason, _ = verdict(row.page_a, row.page_b)
        keep.append(ok)
        if not ok:
            removed_reasons[reason] += 1
            removed_rows.append({"page_a": row.page_a, "page_b": row.page_b,
                                 "relation": row.relation, "reason": reason})
    kept = frame[pd.Series(keep, index=frame.index)]
    args.out_relations.parent.mkdir(parents=True, exist_ok=True)
    kept.to_parquet(args.out_relations, index=False)

    canonical_removed = 0
    pages_changed = 0
    written = 0
    with args.canonical.open(encoding="utf-8") as source, args.out_canonical.open(
        "w", encoding="utf-8"
    ) as out:
        for line in source:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            relations = record.get("relations")
            if isinstance(relations, list) and relations:
                survivors = []
                for entry in relations:
                    if (
                        isinstance(entry, dict)
                        and is_structure_equality(str(entry.get("type") or ""))
                        and entry.get("targetKey")
                        and not verdict(record["key"], str(entry["targetKey"]))[0]
                    ):
                        canonical_removed += 1
                        continue
                    survivors.append(entry)
                if len(survivors) != len(relations):
                    pages_changed += 1
                record["relations"] = survivors
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            written += 1

    structure_rows = int(sum(1 for value in frame["relation"] if is_structure_equality(value)))
    summary = {
        "generatedBy": "scripts/revamp/identity_relations_v7.py",
        "spec": "docs/specs/phase4-generators.md#18",
        "test": {
            "relations": list(STRUCTURE_EQUALITY_RELATIONS),
            "minimumHeavyAtoms": MIN_HEAVY_ATOMS,
            "identicalFullInchikeys": True,
        },
        "relationsIn": before,
        "relationsOut": int(len(kept)),
        "structureEqualityRowsIn": structure_rows,
        "structureEqualityRowsOut": structure_rows - len(removed_rows),
        "relationRowsRemoved": len(removed_rows),
        "removedByReason": dict(sorted(removed_reasons.items())),
        "removedRows": removed_rows,
        "canonicalRecords": written,
        "canonicalRelationsRemoved": canonical_removed,
        "canonicalPagesChanged": pages_changed,
    }
    args.summary.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    printable = dict(summary)
    printable["removedRows"] = removed_rows[:20]
    print(json.dumps(printable, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
