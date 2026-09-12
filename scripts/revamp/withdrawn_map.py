"""Phase 2 item 10 - withdrawal field mapping.

The assigned source for this item, the WITHDRAWN database (Charite,
cheminfo.charite.de/withdrawn, later bioinformatics.charite.de/withdrawn_3),
publishes no licence or terms-of-use statement for its database contents, and
the only licence attaching to the work is the CC BY-NC 4.0 licence of its two
Nucleic Acids Research papers. Operating rule 8 of docs/specs/revamp-2026-09.md
forbids both a source whose terms cannot be found and a non-commercial licence
joined into rendered pages, so no WITHDRAWN record is retrieved or mapped. The
evidence is in data/revamp/worklog-entries/2.10-blocker.md.

This script instead maps the withdrawal field the item was to fill from the
cross-check sources named in the same item, using only data already held under a
verified licence permitting commercial reuse: the ChEMBL 37 `drug_warning`
endpoint (CC BY-SA 3.0), which carries a withdrawal reason, country, year and
literature or regulatory reference per record. Every emitted row names ChEMBL as
its source; no row is attributed to WITHDRAWN.

Molecules are resolved to corpus pages in the spec's priority order: UNII exact,
full InChIKey exact, InChIKey skeleton as form_of, normalised name as candidate.
A UNII for a ChEMBL molecule is derived from the independent public-domain FDA
UNII files (by InChIKey, else by exact substance name), never from the corpus
page being matched.

Writes data/sources/withdrawn/mapped.parquet and data/sources/withdrawn/coverage.json.
"""

from __future__ import annotations

import csv
import glob
import gzip
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index, normalise_name  # noqa: E402

ROOT = Path(".")
CHEMBL_RAW = ROOT / "data/corpus-20k/raw/chembl"
UNII_DIR = ROOT / "data/corpus-20k/raw/fda-unii"
OUT_DIR = ROOT / "data/sources/withdrawn"
INXIGHT = ROOT / "data/sources/inxight/mapped.parquet"

CHEMBL_LICENCE = "CC BY-SA 3.0"
CHEMBL_SOURCE_DATE = "2026-09-04"
CHEMBL_RETRIEVAL_NOTE = "ChEMBL 37 drug_warning, held at data/corpus-20k/raw/chembl/warning-*.json"


def load_withdrawn_warnings() -> list[dict]:
    rows: list[dict] = []
    for path in sorted(CHEMBL_RAW.glob("warning-*.json")):
        payload = json.loads(path.read_text())
        for rec in payload["drug_warnings"]:
            if rec.get("warning_type") == "Withdrawn":
                rows.append(rec)
    return rows


def load_pref_names(ids: set[str]) -> dict[str, str]:
    names: dict[str, str] = {}
    for path in sorted(CHEMBL_RAW.glob("molecules-*.json")):
        for mol in json.loads(path.read_text())["molecules"]:
            cid = mol.get("molecule_chembl_id")
            if cid in ids and mol.get("pref_name"):
                names[cid] = mol["pref_name"]
    return names


def load_inchikeys(ids: set[str]) -> dict[str, str]:
    keys: dict[str, str] = {}
    with gzip.open(CHEMBL_RAW / "chembl_37_chemreps.txt.gz", "rt") as handle:
        next(handle)
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) > 3 and parts[0] in ids and parts[3]:
                keys[parts[0]] = parts[3].strip().upper()
    return keys


def load_unii_bridges(salts: list[str]) -> tuple[dict[str, str], dict[str, str]]:
    """Return (inchikey -> UNII, normalised name -> UNII) from the FDA UNII files."""
    by_inchikey: dict[str, str] = {}
    records = UNII_DIR / "UNII_Records_4Aug2026.txt"
    with records.open(encoding="utf-8", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            ik = (row.get("INCHIKEY") or "").strip().upper()
            unii = (row.get("UNII") or "").strip().upper()
            if ik and unii and ik not in by_inchikey:
                by_inchikey[ik] = unii

    name_hits: dict[str, set[str]] = defaultdict(set)
    names = UNII_DIR / "UNII_Names_4Aug2026.txt"
    with names.open(encoding="utf-8", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            unii = (row.get("UNII") or "").strip().upper()
            raw = row.get("NAME") or ""
            if not unii or not raw:
                continue
            norm = normalise_name(raw, salts)
            if len(norm) >= 3:
                name_hits[norm].add(unii)
    # Only unambiguous names are usable as an identity bridge.
    by_name = {norm: next(iter(u)) for norm, u in name_hits.items() if len(u) == 1}
    return by_inchikey, by_name


def main() -> None:
    idx = load_corpus_index()
    warnings = load_withdrawn_warnings()

    ids: set[str] = set()
    for rec in warnings:
        for field in ("molecule_chembl_id", "parent_molecule_chembl_id"):
            if rec.get(field):
                ids.add(rec[field])

    pref_names = load_pref_names(ids)
    inchikeys = load_inchikeys(ids)
    unii_by_inchikey, unii_by_name = load_unii_bridges(idx.salts)

    # Resolve every ChEMBL molecule once, in the spec's priority order.
    resolution: dict[str, tuple[str, list[str], str | None]] = {}
    unresolved: set[str] = set()
    for cid in sorted(ids):
        ik = inchikeys.get(cid)
        norm = normalise_name(pref_names.get(cid, ""), idx.salts)

        unii = None
        if ik and ik in unii_by_inchikey:
            unii = unii_by_inchikey[ik]
        elif norm and norm in unii_by_name:
            unii = unii_by_name[norm]

        if unii and unii in idx.unii_to_keys:
            resolution[cid] = ("unii", idx.unii_to_keys[unii], None)
            continue
        if ik and ik in idx.inchikey_to_keys:
            resolution[cid] = ("inchikey", idx.inchikey_to_keys[ik], None)
            continue
        if ik and ik[:14] in idx.skeleton_to_keys:
            targets = idx.skeleton_to_keys[ik[:14]]
            resolution[cid] = ("skeleton", targets, targets[0])
            continue
        if norm and norm in idx.name_to_keys:
            # Rule (d): a name match is a candidate only. UNII and InChIKey were
            # both tried above and neither confirmed this molecule, so every
            # molecule reaching this branch is unconfirmed by construction and
            # its rows go to the Phase 3 review list as well as to the parquet.
            resolution[cid] = ("name-candidate", idx.name_to_keys[norm], None)
            continue
        unresolved.add(cid)

    # Emit one row per page x withdrawal record.
    rows: list[dict] = []
    matched_ids: set[str] = set()
    for rec in warnings:
        cid = rec.get("molecule_chembl_id") or rec.get("parent_molecule_chembl_id")
        parent = rec.get("parent_molecule_chembl_id")
        target_cid = cid if cid in resolution else parent
        if target_cid not in resolution:
            continue
        rule, keys, form_of = resolution[target_cid]
        matched_ids.add(target_cid)
        refs = [r.get("ref_url") for r in (rec.get("warning_refs") or []) if r.get("ref_url")]
        value = {
            "reason": rec.get("warning_description"),
            "reasonClass": rec.get("warning_class"),
            "reasonTerm": rec.get("efo_term"),
            "country": rec.get("warning_country"),
            "year": rec.get("warning_year"),
            "references": refs,
            "chemblMoleculeId": rec.get("molecule_chembl_id"),
            "parentChemblMoleculeId": parent,
            "assertedBy": "ChEMBL 37 drug_warning",
        }
        payload = json.dumps(value, sort_keys=True, ensure_ascii=False)
        for key in keys:
            rows.append(
                {
                    "key": key,
                    "tier": idx.tier_of(key),
                    "field": "withdrawal",
                    "value": payload,
                    "source_record_id": f"ChEMBL:drug_warning:{rec['warning_id']}",
                    "source_url": "https://www.ebi.ac.uk/chembl/api/data/drug_warning/"
                    f"{rec['warning_id']}",
                    "source_date": CHEMBL_SOURCE_DATE,
                    "match_rule": rule,
                    "form_of_target": form_of if rule == "skeleton" else None,
                    "licence": CHEMBL_LICENCE,
                }
            )

    frame = pd.DataFrame(
        rows,
        columns=[
            "key", "tier", "field", "value", "source_record_id",
            "source_url", "source_date", "match_rule", "form_of_target", "licence",
        ],
    ).drop_duplicates(subset=["key", "source_record_id"])

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frame.to_parquet(OUT_DIR / "mapped.parquet", index=False)

    # Cross-check against Inxight marketing status already mapped for this corpus.
    inxight_inactive: set[str] = set()
    if INXIGHT.exists():
        inx = pd.read_parquet(INXIGHT, columns=["key", "field", "value"])
        inx = inx[inx.field == "marketingStatus"]
        for key, raw in zip(inx.key, inx.value):
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if parsed.get("activeRecords") == 0:
                inxight_inactive.add(key)

    corpus_withdrawn = {
        json.loads(line)["key"]
        for line in (ROOT / "data/corpus-20k/tiers/model-assignment.ndjson").open()
        if json.loads(line).get("withdrawn")
    }

    pages = set(frame.key)
    per_tier_pages = Counter(idx.tier_of(k) for k in pages)
    rule_counts = Counter(frame.match_rule)
    with_year = frame.value.map(lambda v: json.loads(v).get("year") is not None).sum()
    with_country = frame.value.map(lambda v: bool(json.loads(v).get("country"))).sum()
    with_reason = frame.value.map(lambda v: bool(json.loads(v).get("reason"))).sum()
    with_ref = frame.value.map(lambda v: bool(json.loads(v).get("references"))).sum()

    fields_by_tier = {
        str(t): {"withdrawal": int(sum(1 for k in pages if idx.tier_of(k) == t))}
        for t in (1, 2, 3)
    }

    coverage = {
        "source": "withdrawn",
        "sourceName": "WITHDRAWN database (Charite) - BLOCKED; withdrawal field mapped from ChEMBL 37 drug_warning instead",
        "date": "2026-09-06",
        "status": "BLOCKED-WITH-EVIDENCE",
        "assignedSource": {
            "name": "WITHDRAWN / WITHDRAWN 2.0 (Charite, Structural Bioinformatics Group)",
            "recordsRetrieved": 0,
            "rowsMapped": 0,
            "blockedReason": (
                "Two independent bars in operating rule 8 fail. (1) The database publishes no "
                "licence, terms-of-use or copyright grant for its contents on any page of either "
                "version - checked the v1 index, help/FAQ, links/download and contact pages and the "
                "v2 index, FAQ, contact and footer, plus the group homepage. (2) The only licence "
                "attaching to the work is CC BY-NC 4.0, the Oxford University Press licence of both "
                "Nucleic Acids Research papers, which forbids commercial re-use; rnawiki.com is a "
                "commercial site. Separately the v2 web application is offline: every path under "
                "bioinformatics.charite.de/withdrawn_3/ returns HTTP 404, and the v1 host "
                "cheminfo.charite.de has no DNS A record."
            ),
            "dataExistsButNotTaken": (
                "Four bulk SDF files from the v1 host are preserved in the Internet Archive "
                "(withdrawn_all.sdf 628,870 bytes; withdrawn_withdrawn.sdf 244,969; "
                "withdrawn_discontinued.sdf 324,993; withdrawn_ema.sdf 60,967), together with about "
                "500 v2 drug_info.php pages. They were deliberately not retrieved because the "
                "licence bar above is independent of availability."
            ),
        },
        "substituteSource": {
            "name": "ChEMBL 37 drug_warning",
            "licence": CHEMBL_LICENCE,
            "commercialUsePermitted": True,
            "held": CHEMBL_RETRIEVAL_NOTE,
            "withdrawnRecords": len(warnings),
            "distinctMoleculeIds": len(ids),
            "moleculeIdsResolvingToAtLeastOnePage": len(ids) - len(unresolved),
            "moleculeIdsUsedAsTheMatchTarget": len(matched_ids),
            "moleculeIdsUsedAsTheMatchTargetNote": (
                "Lower than the resolving count because a warning row carrying both a molecule and "
                "a parent molecule id is mapped once, through whichever id resolves first."
            ),
            "moleculeIdsResolvingToNoPage": len(unresolved),
        },
        "rowsWritten": int(len(frame)),
        "pagesMatchedByTier": {str(t): int(per_tier_pages.get(t, 0)) for t in (1, 2, 3)},
        "pagesMatchedTotal": len(pages),
        "fieldsGainedByTier": fields_by_tier,
        "matchRuleCounts": {k: int(v) for k, v in rule_counts.items()},
        "fieldCompleteness": {
            "rowsWithReason": int(with_reason),
            "rowsWithCountry": int(with_country),
            "rowsWithYear": int(with_year),
            "rowsWithSourceReference": int(with_ref),
        },
        "unmatchedRecords": int(len(unresolved)),
        "nameCandidatesSentToReview": int(rule_counts.get("name-candidate", 0)),
        "crossCheck": {
            "method": "Pages carrying a mapped withdrawal record compared against the corpus "
                      "withdrawn flag and against Inxight marketing status with zero active records.",
            "pagesWithMappedWithdrawal": len(pages),
            "alsoFlaggedWithdrawnInCorpus": len(pages & corpus_withdrawn),
            "notFlaggedWithdrawnInCorpus": len(pages - corpus_withdrawn),
            "alsoInxightInactive": len(pages & inxight_inactive),
            "inxightInactiveTotal": len(inxight_inactive),
            "note": "Inxight marketing status records a jurisdiction and record dates but no "
                    "withdrawal decision date or reason, so it corroborates that a substance is no "
                    "longer marketed and supplies neither a year nor a reason.",
        },
    }
    (OUT_DIR / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n")

    # Per-tier withdrawal availability, superseding the measurement made on
    # 2026-09-05 that recorded zero reasons and zero years as available from a
    # licensed source. ChEMBL 37 drug_warning supplies both.
    page_chembl: dict[str, str] = {}
    for line in (ROOT / "data/corpus-20k/identity/canonical.ndjson").open():
        rec = json.loads(line)
        cid = (rec.get("chemblId") or "").strip().upper()
        if cid:
            page_chembl[rec["key"]] = cid
    chembl_withdrawn_ids = set()
    for path in sorted(CHEMBL_RAW.glob("molecules-*.json")):
        for mol in json.loads(path.read_text())["molecules"]:
            if mol.get("withdrawn_flag"):
                chembl_withdrawn_ids.add(mol["molecule_chembl_id"])

    tier_pages: dict[int, set[str]] = defaultdict(set)
    for key in idx.tier:
        tier_pages[idx.tier_of(key)].add(key)

    per_page_values: dict[str, list[dict]] = defaultdict(list)
    for key, raw in zip(frame.key, frame.value):
        per_page_values[key].append(json.loads(raw))

    gap_rows = []
    for tier in (1, 2, 3):
        members = tier_pages[tier]
        mapped_pages = members & pages
        gap_rows.append({
            "tier": tier,
            "pages": len(members),
            "corpus_withdrawn_flag": len(members & corpus_withdrawn),
            "chembl_withdrawn_flag": sum(
                1 for k in members if page_chembl.get(k) in chembl_withdrawn_ids
            ),
            "inxight_inactive_status": len(members & inxight_inactive),
            "pages_with_mapped_withdrawal_record": len(mapped_pages),
            "with_country_available": sum(
                1 for k in mapped_pages if any(v.get("country") for v in per_page_values[k])
            ),
            "with_year_available": sum(
                1 for k in mapped_pages
                if any(v.get("year") is not None for v in per_page_values[k])
            ),
            "with_reason_available": sum(
                1 for k in mapped_pages if any(v.get("reason") for v in per_page_values[k])
            ),
        })
    pd.DataFrame(gap_rows).to_csv(OUT_DIR / "withdrawal-gap.csv", index=False)

    if rule_counts.get("name-candidate"):
        review = frame[frame.match_rule == "name-candidate"][["key", "source_record_id", "value"]]
        review.to_csv(OUT_DIR / "name-candidates-for-review.csv", index=False)

    print(json.dumps({
        "rows": len(frame),
        "pages": len(pages),
        "pagesByTier": coverage["pagesMatchedByTier"],
        "matchRules": coverage["matchRuleCounts"],
        "unresolvedMolecules": len(unresolved),
    }, indent=2))


if __name__ == "__main__":
    main()
