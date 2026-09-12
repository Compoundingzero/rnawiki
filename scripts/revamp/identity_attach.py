#!/usr/bin/env python
"""Step 3.1: attach an InChIKey and a UNII to every corpus page from the Phase 2 outputs.

InChIKey precedence, spec `docs/specs/revamp-2026-09.md` Phase 3.1:

    page structure  ->  PubChem exact  ->  GSRS spine by UNII

and the source of the key that won is recorded on the row. A key that was calculated from a
structure rather than read out of a register is labelled as computed: `gsrs-spine-computed` for the
GSRS spine's own `computed-rdkit` rows, `computed-rdkit` for a key this script derives with RDKit
from a SMILES the corpus or a source already holds.

UNII precedence:

    page key (K1 rank)  ->  page `unii` field  ->  GSRS spine by full InChIKey  ->  PubChem CID -> GSRS

The K1 page key and the page `unii` field disagree on 3,238 pages and 1,865 K1 pages carry no
`unii` field at all (Inxight join defect, recorded 2026-09-05), so every GSRS spine lookup indexes
both identifiers and the row records which one answered.

    identity_attach.py --out-dir data/revamp/identity
"""

from __future__ import annotations

import argparse
import json
import csv
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem import inchi as rd_inchi

RDLogger.DisableLog("rdApp.*")

ROOT = Path(__file__).resolve().parents[2]
CANONICAL = ROOT / "data/corpus-20k/identity/canonical.ndjson"
PRESENCE = ROOT / "data/revamp/presence-applicable.ndjson"
GSRS_SPINE = ROOT / "data/sources/gsrs/spine.parquet"
GSRS_MAPPED = ROOT / "data/sources/gsrs/mapped.parquet"
PUBCHEM_MAPPED = ROOT / "data/sources/pubchem/mapped.parquet"
PUBCHEM_RAW = ROOT / "data/sources/pubchem/2026-09-05/raw"

TIERS = (1, 2, 3)


def blank(value) -> bool:
    return value is None or (isinstance(value, float) and value != value) or str(value).strip() == ""


def clean(value):
    return None if blank(value) else str(value).strip()


def load_pages() -> list[dict]:
    tier_by_key: dict[str, int] = {}
    with PRESENCE.open() as handle:
        for line in handle:
            row = json.loads(line)
            tier_by_key[row["key"]] = int(row["tier"])
    pages = []
    with CANONICAL.open() as handle:
        for line in handle:
            record = json.loads(line)
            structure = record.get("structure") or {}
            pages.append(
                {
                    "key": record["key"],
                    "keyRank": record["keyRank"],
                    "tier": tier_by_key.get(record["key"], 0),
                    "displayName": record.get("displayName"),
                    "page_inchikey": clean(structure.get("inchikey")),
                    "page_smiles": clean(structure.get("smiles")),
                    "page_unii": clean(record.get("unii")),
                    "page_cid": clean(record.get("cid")),
                }
            )
    return pages


def key_unii(key: str) -> str | None:
    """The UNII named by a K1 page key. The key, not the `unii` field, is the canonical identifier."""
    return key[3:] if key.startswith("K1:") and len(key) > 3 else None


def key_inchikey(key: str) -> str | None:
    return key[3:] if key.startswith("K2:") and len(key) > 3 else None


def load_spine() -> tuple[dict[str, dict], dict[str, list[str]]]:
    frame = pd.read_parquet(
        GSRS_SPINE,
        columns=[
            "unii",
            "preferred_name",
            "substance_class",
            "inchikey",
            "inchikey_source",
            "parent_unii",
            "active_moiety_unii",
            "smiles",
        ],
    )
    by_unii: dict[str, dict] = {}
    by_inchikey: dict[str, list[str]] = defaultdict(list)
    for row in frame.itertuples(index=False):
        unii = clean(row.unii)
        if unii is None:
            continue
        record = {
            "unii": unii,
            "preferred_name": clean(row.preferred_name),
            "substance_class": clean(row.substance_class),
            "inchikey": clean(row.inchikey),
            "inchikey_source": clean(row.inchikey_source),
            "parent_unii": clean(row.parent_unii),
            "active_moiety_unii": clean(row.active_moiety_unii),
            "smiles": clean(row.smiles),
        }
        by_unii[unii] = record
        if record["inchikey"]:
            by_inchikey[record["inchikey"]].append(unii)
    return by_unii, dict(by_inchikey)


def load_pubchem_exact() -> tuple[dict[str, dict], dict[str, dict], dict[str, dict], dict[str, str]]:
    """PubChem's own property records, indexed by page key, by CID, by UNII, plus CID -> UNII."""
    by_page: dict[str, dict] = {}
    frame = pd.read_parquet(PUBCHEM_MAPPED, columns=["key", "field", "value", "match_rule"])
    # Phase 2 mapping rule (d): a name match is a candidate, not a match, until a UNII or a full
    # InChIKey confirms it. An unconfirmed name candidate never supplies a structure to a page.
    wanted = frame[frame.field.isin(["inchikey", "smiles", "cid"])
                   & frame.match_rule.isin(["unii", "inchikey"])]
    for row in wanted.itertuples(index=False):
        raw = row.value
        try:
            value = json.loads(raw)
        except (TypeError, ValueError):
            value = raw
        by_page.setdefault(row.key, {})[row.field] = clean(value)

    by_cid: dict[str, dict] = {}
    by_unii: dict[str, dict] = {}
    for path in sorted(PUBCHEM_RAW.glob("api/*/*.json")):
        try:
            payload = json.loads(path.read_text())
        except ValueError:
            continue
        properties = (payload.get("body") or {}).get("PropertyTable", {}).get("Properties") or []
        for prop in properties:
            cid = prop.get("CID")
            record = {
                "inchikey": clean(prop.get("InChIKey")),
                "smiles": clean(prop.get("SMILES")),
                "cid": str(cid) if cid is not None else None,
            }
            if record["cid"]:
                by_cid.setdefault(record["cid"], record)
        unii = clean(payload.get("unii"))
        if unii and properties:
            prop = properties[0]
            by_unii.setdefault(
                unii,
                {
                    "inchikey": clean(prop.get("InChIKey")),
                    "smiles": clean(prop.get("SMILES")),
                    "cid": str(prop.get("CID")) if prop.get("CID") is not None else None,
                },
            )

    cid_to_unii: dict[str, str] = {}
    derived = PUBCHEM_RAW / "derived/unii-cid.tsv"
    if derived.exists():
        with derived.open() as handle:
            reader = csv.DictReader(handle, delimiter="\t")
            for row in reader:
                unii = clean(row.get("unii"))
                cid = clean(row.get("cid"))
                if unii and cid and cid not in cid_to_unii:
                    cid_to_unii[cid] = unii
    return by_page, by_cid, by_unii, cid_to_unii


def computed_inchikey(smiles: str | None) -> str | None:
    if not smiles:
        return None
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    try:
        key = rd_inchi.MolToInchiKey(mol)
    except Exception:
        return None
    return key or None


def pick_spine_unii(candidates: list[str], spine: dict[str, dict]) -> str | None:
    """One InChIKey can carry several UNIIs. Prefer a parent record, then the lowest UNII."""
    if not candidates:
        return None
    parents = [u for u in candidates if not spine[u]["parent_unii"] or spine[u]["parent_unii"] == u]
    pool = parents or candidates
    return sorted(pool)[0]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "data/revamp/identity")
    args = parser.parse_args()
    args.out_dir = args.out_dir.resolve()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    pages = load_pages()
    spine, spine_by_inchikey = load_spine()
    pc_page, pc_cid, pc_unii, cid_to_unii = load_pubchem_exact()

    rows = []
    for page in pages:
        key = page["key"]
        candidates_unii = []
        k_unii = key_unii(key)
        if k_unii:
            candidates_unii.append(("page-key", k_unii))
        if page["page_unii"] and page["page_unii"] not in [u for _, u in candidates_unii]:
            candidates_unii.append(("page-field", page["page_unii"]))

        # --- InChIKey -------------------------------------------------------
        inchikey = None
        inchikey_source = None

        if page["page_inchikey"]:
            inchikey, inchikey_source = page["page_inchikey"], "page-structure"
        elif key_inchikey(key):
            inchikey, inchikey_source = key_inchikey(key), "page-key-inchikey"

        if inchikey is None:
            pubchem = pc_page.get(key) or {}
            if pubchem.get("inchikey"):
                inchikey, inchikey_source = pubchem["inchikey"], "pubchem-exact"
            else:
                cid = page["page_cid"] or (pubchem.get("cid") if pubchem else None)
                if cid and pc_cid.get(str(cid), {}).get("inchikey"):
                    inchikey, inchikey_source = pc_cid[str(cid)]["inchikey"], "pubchem-exact"
                else:
                    for label, unii in candidates_unii:
                        hit = pc_unii.get(unii)
                        if hit and hit.get("inchikey"):
                            inchikey = hit["inchikey"]
                            inchikey_source = "pubchem-exact"
                            break

        if inchikey is None:
            for label, unii in candidates_unii:
                record = spine.get(unii)
                if record and record["inchikey"]:
                    inchikey = record["inchikey"]
                    computed = record["inchikey_source"] == "computed-rdkit"
                    stem = "gsrs-spine-computed" if computed else "gsrs-spine"
                    inchikey_source = stem if label == "page-key" else f"{stem}-via-unii-field"
                    break

        if inchikey is None:
            smiles = page["page_smiles"]
            if not smiles:
                pubchem = pc_page.get(key) or {}
                smiles = pubchem.get("smiles")
            if not smiles:
                for _label, unii in candidates_unii:
                    record = spine.get(unii)
                    if record and record["smiles"]:
                        smiles = record["smiles"]
                        break
            derived = computed_inchikey(smiles)
            if derived:
                inchikey, inchikey_source = derived, "computed-rdkit"

        # --- UNII -----------------------------------------------------------
        unii = None
        unii_source = None
        for label, candidate in candidates_unii:
            if candidate:
                unii, unii_source = candidate, label
                break

        if unii is None and inchikey:
            chosen = pick_spine_unii(spine_by_inchikey.get(inchikey, []), spine)
            if chosen:
                unii, unii_source = chosen, "gsrs-by-inchikey"

        if unii is None:
            cid = page["page_cid"] or (pc_page.get(key) or {}).get("cid")
            candidate = cid_to_unii.get(str(cid)) if cid else None
            if candidate and candidate in spine:
                unii, unii_source = candidate, "pubchem-cid-to-gsrs"

        record = spine.get(unii) if unii else None
        rows.append(
            {
                "key": key,
                "tier": page["tier"],
                "unii": unii,
                "unii_source": unii_source,
                "inchikey": inchikey,
                "inchikey_source": inchikey_source,
                "inchikey14": inchikey[:14] if inchikey else None,
                "active_moiety_unii": (record or {}).get("active_moiety_unii"),
                "parent_unii": (record or {}).get("parent_unii"),
                "substance_class": (record or {}).get("substance_class"),
            }
        )

    frame = pd.DataFrame(rows)
    out_parquet = args.out_dir / "spine-attached.parquet"
    frame.to_parquet(out_parquet, index=False)

    coverage: dict[str, dict] = {}
    for field, column in (("unii", "unii"), ("inchikey", "inchikey"), ("skeleton", "inchikey14")):
        per_tier = {}
        for tier in TIERS:
            subset = frame[frame.tier == tier]
            have = int(subset[column].notna().sum())
            per_tier[f"tier{tier}"] = {
                "pages": int(len(subset)),
                "with": have,
                "percent": round(100.0 * have / len(subset), 2) if len(subset) else 0.0,
            }
        have = int(frame[column].notna().sum())
        per_tier["all"] = {
            "pages": int(len(frame)),
            "with": have,
            "percent": round(100.0 * have / len(frame), 2),
        }
        coverage[field] = per_tier

    sources = {
        "inchikey_source": {k: int(v) for k, v in Counter(frame.inchikey_source.dropna()).most_common()},
        "unii_source": {k: int(v) for k, v in Counter(frame.unii_source.dropna()).most_common()},
    }
    payload = {
        "generatedAt": pd.Timestamp.now("UTC").isoformat(),
        "step": "3.1",
        "inputs": {
            "canonical": str(CANONICAL.relative_to(ROOT)),
            "tiers": str(PRESENCE.relative_to(ROOT)),
            "gsrsSpine": str(GSRS_SPINE.relative_to(ROOT)),
            "gsrsMapped": str(GSRS_MAPPED.relative_to(ROOT)),
            "pubchemMapped": str(PUBCHEM_MAPPED.relative_to(ROOT)),
        },
        "pages": int(len(frame)),
        "coverage": coverage,
        "sources": sources,
    }
    (args.out_dir / "coverage.json").write_text(json.dumps(payload, indent=2) + "\n")

    print(f"pages {len(frame)} -> {out_parquet.relative_to(ROOT)}")
    for field, per_tier in coverage.items():
        line = "  ".join(f"{t}={v['with']}/{v['pages']}" for t, v in per_tier.items())
        print(f"{field:9s} {line}")
    print("inchikey sources:", sources["inchikey_source"])
    print("unii sources:", sources["unii_source"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
