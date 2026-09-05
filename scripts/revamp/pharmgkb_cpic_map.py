"""Map PharmGKB/ClinPGx and CPIC records onto corpus-20k pages.

Phase 2 item 16 of docs/specs/revamp-2026-09.md.

Reads the archives under data/sources/pharmgkb-cpic/<date>/raw/ straight from
the ZIPs, applies the four mapping rules in the priority order the spec sets,
and writes data/sources/pharmgkb-cpic/{mapped.parquet,coverage.json,
name-candidates-for-review.json,unmatched-records.json}.

Mapping rules as applied here
-----------------------------
(a) `unii`  PharmGKB publishes no UNII (one cross-reference in 5,313 records),
    so the UNII of a PharmGKB chemical is resolved through the FDA UNII records
    file already held at data/corpus-20k/raw/fda-unii/. Three resolution routes
    are used, each recorded per row in value.match.uniiResolvedBy and each
    required to be unambiguous (exactly one UNII):
      inchikey     PharmGKB InChIKey equals the FDA record INCHIKEY
      pubchem-cid  PharmGKB PubChem CID equals the FDA record PUBCHEM
      rxnorm       PharmGKB RxNorm CUI equals the FDA record RXCUI
    Routes are tried in that order and a disagreement between routes is counted
    and reported in coverage.json.
(b) `inchikey`  the InChIKey computed by RDKit from the PharmGKB InChI equals a
    corpus page InChIKey.
(c) `skeleton`  the first 14 characters agree while the full keys differ. The
    row is linked with form_of_target set to the PharmGKB InChIKey, the exact
    form the source holds. Never merged.
(d) `name-candidate`  the normalised name (scripts/revamp/salts.txt) lands on
    one corpus page and no rule above fired. A name landing on several pages is
    dropped, unless every one of those pages carries the same UNII, which is one
    substance held on duplicate pages awaiting the Phase 3 identity work rather
    than an ambiguous name. Every page reached this way goes to the Phase 3
    review list. Where the page and the PharmGKB record independently agree on a
    PubChem CID, an RxNorm CUI or a ChEMBL id, that agreement is recorded in
    value.match.registryAgreement so Phase 3 can order the list.
    A multi-ingredient PharmGKB record ("sulfamethoxazole / trimethoprim",
    "thioacetazone and isoniazid") maps to each component page and, where the
    corpus holds a combination page for exactly those components, to that page
    too.

PharmGKB records typed only as a drug class carry no structure and are excluded
from the name route: a class name landing on a substance page would be a wrong
mapping, not a weak one.

Fields written
--------------
pgx                    one row per clinical (summary) annotation naming this
                       page's substance: gene, variant or haplotype, level of
                       evidence 1A-4, score, phenotype category, phenotype text,
                       PMID and evidence counts and the annotation URL.
pgxCpicGuideline       one row per CPIC gene-drug pair for this page: whether a
                       CPIC guideline exists, its name, its URL, the genes it
                       covers and the CPIC level of the pair. Existence and gene
                       only. No dosing, no recommendation text, and the CPIC
                       recommendation and dosing tables are not retrieved.
pgxDrugLabel           one row per regulator drug-label annotation: regulator,
                       PGx testing level, the genes named and the label flags.
pgxGeneAssociations    one row per curated gene-chemical relationship: gene,
                       association direction, evidence types, PK/PD flags and
                       PMID count.
"""

from __future__ import annotations

import ast
import collections
import csv
import io
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from rdkit import RDLogger
from rdkit.Chem.inchi import InchiToInchiKey

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index, normalise_name  # noqa: E402

RDLogger.DisableLog("rdApp.*")
csv.field_size_limit(10**9)

DATE = "2026-09-06"
SRC = Path("data/sources/pharmgkb-cpic")
RAW = SRC / DATE / "raw"
UNII_RECORDS = Path("data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt")

PHARMGKB_LICENCE = "CC BY-SA 4.0 (ClinPGx/PharmGKB)"
CPIC_LICENCE = "CC0 1.0 Universal (CPIC)"
CLINPGX = "https://www.clinpgx.org"

PHARMGKB_SOURCE_DATE = "2026-09-05"  # archive CREATED_*.txt, verified below
CPIC_SOURCE_DATE = DATE

SCHEMA = pa.schema([
    ("key", pa.string()),
    ("tier", pa.int64()),
    ("field", pa.string()),
    ("value", pa.string()),
    ("source_record_id", pa.string()),
    ("source_url", pa.string()),
    ("source_date", pa.string()),
    ("match_rule", pa.string()),
    ("form_of_target", pa.string()),
    ("licence", pa.string()),
])

RULE_ORDER = {"unii": 0, "inchikey": 1, "skeleton": 2, "name-candidate": 3}

# PharmGKB writes a multi-ingredient record as "a / b" or "a and b".
COMBINATION_SPLIT = re.compile(r"\s*/\s*|\s+and\s+")


def jval(obj: dict) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False)


def read_tsv(zip_path: Path, member: str) -> list[dict]:
    with zipfile.ZipFile(zip_path) as zf:
        with zf.open(member) as fh:
            text = io.TextIOWrapper(fh, encoding="utf-8", newline="")
            return list(csv.DictReader(text, delimiter="\t"))


def archive_created(zip_path: Path) -> str:
    with zipfile.ZipFile(zip_path) as zf:
        for name in zf.namelist():
            if name.startswith("CREATED_"):
                return name[len("CREATED_"):-len(".txt")]
    raise SystemExit(f"{zip_path} carries no CREATED_*.txt stamp")


def split_list(raw: str | None, sep: str) -> list[str]:
    if not raw:
        return []
    return [p.strip() for p in raw.split(sep) if p.strip()]


# --------------------------------------------------------------------------
# FDA UNII bridge
# --------------------------------------------------------------------------

def load_unii_bridge() -> dict[str, dict[str, list[str]]]:
    by_inchikey: dict[str, set] = collections.defaultdict(set)
    by_cid: dict[str, set] = collections.defaultdict(set)
    by_rxcui: dict[str, set] = collections.defaultdict(set)
    with UNII_RECORDS.open(newline="", encoding="utf-8", errors="replace") as fh:
        for row in csv.DictReader(fh, delimiter="\t"):
            unii = (row.get("UNII") or "").strip().upper()
            if not unii:
                continue
            ik = (row.get("INCHIKEY") or "").strip().upper()
            if ik:
                by_inchikey[ik].add(unii)
            cid = (row.get("PUBCHEM") or "").strip()
            if cid:
                by_cid[cid].add(unii)
            rx = (row.get("RXCUI") or "").strip()
            if rx:
                by_rxcui[rx].add(unii)
    return {
        "inchikey": {k: sorted(v) for k, v in by_inchikey.items()},
        "pubchem-cid": {k: sorted(v) for k, v in by_cid.items()},
        "rxnorm": {k: sorted(v) for k, v in by_rxcui.items()},
    }


def load_corpus_registry_ids() -> tuple[dict[str, str], dict[str, str]]:
    """Per-page PubChem CID and RxNorm CUI, for the name-candidate agreement check."""
    key_cid: dict[str, str] = {}
    key_rxcui: dict[str, str] = {}
    with Path("data/corpus-20k/identity/canonical.ndjson").open() as fh:
        for line in fh:
            rec = json.loads(line)
            key = rec["key"]
            cid = rec.get("cid")
            if cid:
                key_cid[key] = str(cid)
            rx = rec.get("rxcui")
            if rx:
                key_rxcui[key] = str(rx)
    return key_cid, key_rxcui


# --------------------------------------------------------------------------
# PharmGKB chemical records
# --------------------------------------------------------------------------

class Chemical:
    __slots__ = (
        "acc", "name", "types", "generic", "trade", "inchi", "inchikey",
        "rxcuis", "cids", "chembls", "atc", "is_drug_class_only",
    )

    def __init__(self, row: dict) -> None:
        self.acc = row["PharmGKB Accession Id"].strip()
        self.name = (row.get("Name") or "").strip()
        self.types = {t.strip() for t in split_list(row.get("Type"), ",")}
        self.generic = [n.strip(' "') for n in split_list(row.get("Generic Names"), ",")]
        self.trade = [n.strip(' "') for n in split_list(row.get("Trade Names"), ",")]
        self.inchi = (row.get("InChI") or "").strip()
        self.inchikey = ""
        self.rxcuis = split_list(row.get("RxNorm Identifiers"), ",")
        self.cids = split_list(row.get("PubChem Compound Identifiers"), ",")
        self.atc = split_list(row.get("ATC Identifiers"), ",")
        self.chembls = [
            tok.split(":", 1)[1].strip().upper()
            for tok in split_list(row.get("Cross-references"), ", ")
            if tok.startswith("ChEMBL:")
        ]
        self.is_drug_class_only = "Drug Class" in self.types and not (
            self.types & {"Drug", "Prodrug", "Small Molecule", "Metabolite", "Ion"}
        )


def compute_inchikeys(chemicals: list[Chemical]) -> dict[str, int]:
    stats = {"with_inchi": 0, "inchikey_computed": 0, "inchi_unparsable": 0}
    for chem in chemicals:
        if not chem.inchi:
            continue
        stats["with_inchi"] += 1
        try:
            key = InchiToInchiKey(chem.inchi)
        except Exception:
            key = None
        if key:
            chem.inchikey = key.strip().upper()
            stats["inchikey_computed"] += 1
        else:
            stats["inchi_unparsable"] += 1
    return stats


# --------------------------------------------------------------------------
# Matching
# --------------------------------------------------------------------------

def match_chemical(chem, idx, bridge, key_cid, key_rxcui, stats) -> list[dict]:
    """Return the page matches for one PharmGKB chemical, strongest rule only."""

    # (a) UNII, resolved through the FDA UNII records file.
    resolved: list[tuple[str, str]] = []  # (unii, route)
    seen_route_uniis: dict[str, list[str]] = {}
    if chem.inchikey:
        hits = bridge["inchikey"].get(chem.inchikey, [])
        if hits:
            seen_route_uniis["inchikey"] = hits
    for cid in chem.cids:
        hits = bridge["pubchem-cid"].get(cid, [])
        if hits:
            seen_route_uniis.setdefault("pubchem-cid", []).extend(hits)
    for rx in chem.rxcuis:
        hits = bridge["rxnorm"].get(rx, [])
        if hits:
            seen_route_uniis.setdefault("rxnorm", []).extend(hits)
    for route in ("inchikey", "pubchem-cid", "rxnorm"):
        hits = sorted(set(seen_route_uniis.get(route, [])))
        if len(hits) == 1:
            resolved.append((hits[0], route))
        elif len(hits) > 1:
            stats["unii_route_ambiguous_" + route] += 1
    if len({u for u, _ in resolved}) > 1:
        stats["unii_route_conflict"] += 1
    if resolved:
        unii, route = resolved[0]
        pages = idx.unii_to_keys.get(unii, [])
        if pages:
            return [
                {
                    "key": key,
                    "match_rule": "unii",
                    "form_of_target": None,
                    "match": {
                        "rule": "unii",
                        "unii": unii,
                        "uniiResolvedBy": route,
                        "uniiRoutesAgreeing": sorted({r for u, r in resolved if u == unii}),
                        "pharmgkbInchikey": chem.inchikey or None,
                    },
                }
                for key in pages
            ]

    # (b) full InChIKey.
    if chem.inchikey:
        pages = idx.inchikey_to_keys.get(chem.inchikey, [])
        if pages:
            return [
                {
                    "key": key,
                    "match_rule": "inchikey",
                    "form_of_target": None,
                    "match": {"rule": "inchikey", "pharmgkbInchikey": chem.inchikey},
                }
                for key in pages
            ]

        # (c) skeleton: same first 14 characters, different full key. Rule (b)
        # returned nothing above, so no page here carries this exact full key.
        skeleton = chem.inchikey[:14]
        pages = idx.skeleton_to_keys.get(skeleton, [])
        if pages:
            return [
                {
                    "key": key,
                    "match_rule": "skeleton",
                    # The page holds the skeleton; the PharmGKB record holds this
                    # exact form of it. Linked as form_of, never merged.
                    "form_of_target": chem.inchikey,
                    "match": {
                        "rule": "skeleton",
                        "pharmgkbInchikey": chem.inchikey,
                        "skeleton": skeleton,
                    },
                }
                for key in pages
            ]

    # (d) normalised name, candidate only.
    if chem.is_drug_class_only:
        stats["name_route_skipped_drug_class"] += 1
        return []

    def name_pages(raw: str) -> tuple[str, list[str]] | None:
        """Pages for one name, or None when the name is ambiguous or unknown.

        A name that lands on several pages is dropped, except where every page
        carries the same UNII: that is one substance held on duplicate pages
        awaiting the Phase 3 identity work, not an ambiguous name.
        """
        norm = normalise_name(raw, idx.salts)
        if len(norm) < 3:
            return None
        keys = idx.name_to_keys.get(norm)
        if not keys:
            return None
        if len(keys) > 1:
            # A single ingredient name also indexes the combination pages that
            # contain it. Those are not what the ingredient name denotes.
            single = [k for k in keys if k not in idx.combination_components]
            if len(single) == 1:
                stats["name_candidates_kept_dropping_combination_page"] += 1
                return norm, single
            keys = single or keys
        if len(keys) > 1:
            uniis = {idx.key_unii.get(k) for k in keys}
            if len(uniis) != 1 or None in uniis:
                stats["name_candidates_dropped_ambiguous_page"] += 1
                return None
            stats["name_candidates_kept_duplicate_pages_same_unii"] += 1
        return norm, list(keys)

    def as_hit(key: str, role: str, raw: str, norm: str) -> dict:
        agreement = []
        if key_cid.get(key) and key_cid[key] in chem.cids:
            agreement.append("pubchemCid")
        if key_rxcui.get(key) and key_rxcui[key] in chem.rxcuis:
            agreement.append("rxnorm")
        for chembl in chem.chembls:
            if key in idx.chembl_to_keys.get(chembl, []):
                agreement.append("chemblId")
                break
        return {
            "key": key,
            "match_rule": "name-candidate",
            "form_of_target": None,
            "match": {
                "rule": "name-candidate",
                "matchedOn": role,
                "candidateName": raw,
                "normalisedName": norm,
                "registryAgreement": sorted(set(agreement)),
                "confirmedByUniiOrInchikey": False,
            },
        }

    # Multi-ingredient record: map to each component page and to the
    # combination page when the corpus holds one for exactly those components.
    parts = [p.strip() for p in COMBINATION_SPLIT.split(chem.name) if p.strip()]
    if len(parts) > 1:
        component_hits: list[dict] = []
        component_keys: set = set()
        for part in parts:
            resolved_part = name_pages(part)
            if not resolved_part:
                continue
            norm, keys = resolved_part
            for key in keys:
                component_hits.append(as_hit(key, "combination-component", part, norm))
                component_keys.add(key)
        if len(component_keys) >= 2:
            for combo_key, members in idx.combination_components.items():
                if set(members) == component_keys:
                    component_hits.append(
                        as_hit(combo_key, "combination-page", chem.name,
                               normalise_name(chem.name, idx.salts))
                    )
                    stats["combination_pages_matched"] += 1
            stats["combination_records_matched"] += 1
            return component_hits

    for role, raw in (
        [("name", chem.name)]
        + [("generic", n) for n in chem.generic]
        + [("trade", n) for n in chem.trade]
    ):
        resolved_name = name_pages(raw)
        if not resolved_name:
            continue
        norm, keys = resolved_name
        return [as_hit(key, role, raw, norm) for key in keys]
    return []


# --------------------------------------------------------------------------
# Row builders
# --------------------------------------------------------------------------

def build_rows(chem_pages, chemicals_by_acc, name_to_acc, idx) -> tuple[list[dict], dict]:
    rows: list[dict] = []
    counts: dict = collections.Counter()

    def emit(acc: str, field: str, value: dict, rec_id: str, url: str,
             source_date: str, licence: str) -> None:
        for hit in chem_pages.get(acc, []):
            key = hit["key"]
            payload = dict(value)
            payload["match"] = hit["match"]
            rows.append({
                "key": key,
                "tier": idx.tier_of(key),
                "field": field,
                "value": jval(payload),
                "source_record_id": rec_id,
                "source_url": url,
                "source_date": source_date,
                "match_rule": hit["match_rule"],
                "form_of_target": hit["form_of_target"],
                "licence": licence,
            })
            counts[field] += 1

    # --- clinical (summary) annotations -----------------------------------
    annotations = read_tsv(RAW / "summaryAnnotations.zip", "summary_annotations.tsv")
    for ann in annotations:
        drugs = split_list(ann.get("Drug(s)"), ";")
        value_base = {
            "annotationId": ann["Summary Annotation ID"],
            "gene": ann.get("Gene") or None,
            "variantOrHaplotype": ann.get("Variant/Haplotypes") or None,
            "levelOfEvidence": ann.get("Level of Evidence") or None,
            "levelOverride": ann.get("Level Override") or None,
            "levelModifiers": ann.get("Level Modifiers") or None,
            "score": ann.get("Score") or None,
            "phenotypeCategory": ann.get("Phenotype Category") or None,
            "phenotypes": split_list(ann.get("Phenotype(s)"), ";"),
            "pmidCount": int(ann["PMID Count"]) if (ann.get("PMID Count") or "").isdigit() else None,
            "evidenceCount": int(ann["Evidence Count"]) if (ann.get("Evidence Count") or "").isdigit() else None,
            "specialtyPopulation": ann.get("Specialty Population") or None,
            "latestHistoryDate": ann.get("Latest History Date (YYYY-MM-DD)") or None,
            "drugsInAnnotation": drugs,
            "url": ann.get("URL") or None,
        }
        for drug in drugs:
            acc = name_to_acc.get(drug.lower())
            if not acc:
                counts["annotation_drug_unresolved"] += 1
                continue
            value = dict(value_base)
            value["drug"] = drug
            value["drugPharmgkbId"] = acc
            emit(acc, "pgx", value, ann["Summary Annotation ID"],
                 ann.get("URL") or f"{CLINPGX}/clinicalAnnotation/{ann['Summary Annotation ID']}",
                 PHARMGKB_SOURCE_DATE, PHARMGKB_LICENCE)

    # --- drug label annotations -------------------------------------------
    labels = read_tsv(RAW / "drugLabels.zip", "drugLabels.tsv")
    for lab in labels:
        genes = split_list(lab.get("Genes"), ";")
        value_base = {
            "labelAnnotationId": lab["PharmGKB ID"],
            "annotationName": lab.get("Name") or None,
            "regulator": lab.get("Source") or None,
            "testingLevel": lab.get("Testing Level") or None,
            "genes": genes,
            "variantsOrHaplotypes": split_list(lab.get("Variants/Haplotypes"), ";"),
            "biomarkerFlag": bool(lab.get("Biomarker Flag")),
            "hasPrescribingInfo": bool(lab.get("Has Prescribing Info")),
            "hasDosingInfo": bool(lab.get("Has Dosing Info")),
            "hasAlternateDrug": bool(lab.get("Has Alternate Drug")),
            "hasOtherPrescribingGuidance": bool(lab.get("Has Other Prescribing Guidance")),
            "cancerGenome": bool(lab.get("Cancer Genome")),
            "latestHistoryDate": lab.get("Latest History Date (YYYY-MM-DD)") or None,
            "url": f"{CLINPGX}/labelAnnotation/{lab['PharmGKB ID']}",
        }
        for chem_name in split_list(lab.get("Chemicals"), ";"):
            acc = name_to_acc.get(chem_name.lower())
            if not acc:
                counts["label_chemical_unresolved"] += 1
                continue
            value = dict(value_base)
            value["drug"] = chem_name
            value["drugPharmgkbId"] = acc
            emit(acc, "pgxDrugLabel", value, lab["PharmGKB ID"], value_base["url"],
                 PHARMGKB_SOURCE_DATE, PHARMGKB_LICENCE)

    # --- curated gene-chemical relationships ------------------------------
    rel_url = "https://api.clinpgx.org/v1/download/file/data/relationships.zip"
    for rel in read_tsv(RAW / "relationships.zip", "relationships.tsv"):
        if rel["Entity1_type"] != "Gene" or rel["Entity2_type"] != "Chemical":
            continue
        acc = rel["Entity2_id"].strip()
        if acc not in chemicals_by_acc:
            counts["relationship_chemical_unknown"] += 1
            continue
        pmids = split_list(rel.get("PMIDs"), ";")
        value = {
            "gene": rel.get("Entity1_name") or None,
            "genePharmgkbId": rel.get("Entity1_id") or None,
            "drug": rel.get("Entity2_name") or None,
            "drugPharmgkbId": acc,
            "association": rel.get("Association") or None,
            "evidenceTypes": split_list(rel.get("Evidence"), ","),
            "pharmacokinetic": (rel.get("PK") or "").strip().lower() == "pk",
            "pharmacodynamic": (rel.get("PD") or "").strip().lower() == "pd",
            "pmidCount": len(pmids),
            "url": f"{CLINPGX}/gene/{rel['Entity1_id']}",
        }
        emit(acc, "pgxGeneAssociations", value,
             f"{rel['Entity1_id']}|{rel['Entity2_id']}", rel_url,
             PHARMGKB_SOURCE_DATE, PHARMGKB_LICENCE)

    return rows, counts


def build_cpic_rows(chem_pages, name_to_acc, idx, archive_pairs) -> tuple[list[dict], dict]:
    rows: list[dict] = []
    counts: dict = collections.Counter()
    guidelines = {g["id"]: g for g in json.loads((RAW / "cpic-guideline.json").read_text())}
    drugs = {d["drugid"]: d for d in json.loads((RAW / "cpic-drug.json").read_text())}
    pairs = json.loads((RAW / "cpic-pair.json").read_text())

    acc_of_cpic_drug: dict[str, str] = {}
    for drugid, drug in drugs.items():
        acc = (drug.get("clinpgxid") or "").strip()
        if acc and acc in chem_pages:
            acc_of_cpic_drug[drugid] = acc
            counts["cpic_drug_resolved_by_clinpgx_id"] += 1
        else:
            fallback = name_to_acc.get((drug.get("name") or "").lower())
            if fallback and fallback in chem_pages:
                acc_of_cpic_drug[drugid] = fallback
                counts["cpic_drug_resolved_by_name"] += 1
            else:
                counts["cpic_drug_unmapped"] += 1

    for pair in sorted(pairs, key=lambda p: p["pairid"]):
        acc = acc_of_cpic_drug.get(pair["drugid"])
        if not acc:
            continue
        guideline = guidelines.get(pair.get("guidelineid"))
        value = {
            "gene": pair.get("genesymbol"),
            "drug": drugs[pair["drugid"]].get("name"),
            "drugRxnormId": drugs[pair["drugid"]].get("rxnormid"),
            "drugPharmgkbId": drugs[pair["drugid"]].get("clinpgxid"),
            "cpicLevel": pair.get("cpiclevel"),
            "clinpgxLevel": pair.get("clinpgxlevel"),
            "cpicGuidelineExists": guideline is not None,
            "cpicGuidelineName": guideline["name"] if guideline else None,
            "cpicGuidelineUrl": guideline["url"] if guideline else None,
            "cpicGuidelineGenes": sorted(guideline["genes"]) if guideline else [],
            "cpicPairInPharmgkbGuidelineArchive": (
                (drugs[pair["drugid"]].get("clinpgxid"), pair.get("genesymbol"))
                in archive_pairs
            ),
            "pairRemoved": bool(pair.get("removed")),
            "pairRemovedDate": pair.get("removeddate"),
            "citationPmidCount": len(pair.get("citations") or []),
            "note": (
                "Existence of a CPIC guideline and the gene it involves. "
                "No dosing, recommendation or implementation text is taken from CPIC."
            ),
        }
        url = (guideline["url"] if guideline else "https://api.cpicpgx.org/v1/pair")
        for hit in chem_pages.get(acc, []):
            key = hit["key"]
            payload = dict(value)
            payload["match"] = hit["match"]
            rows.append({
                "key": key,
                "tier": idx.tier_of(key),
                "field": "pgxCpicGuideline",
                "value": jval(payload),
                "source_record_id": f"cpic-pair:{pair['pairid']}",
                "source_url": url,
                "source_date": CPIC_SOURCE_DATE,
                "match_rule": hit["match_rule"],
                "form_of_target": hit["form_of_target"],
                "licence": CPIC_LICENCE,
            })
            counts["pgxCpicGuideline"] += 1
    return rows, counts


def crosscheck_clinical_variants() -> dict:
    """clinicalVariants.tsv restates every clinical annotation keyed by variant.

    Comparing it against summary_annotations.tsv checks that the level of
    evidence carried into mapped.parquet is the level ClinPGx publishes in both
    of its own renderings of the same annotations. The two files write a
    multi-gene annotation with different separators, so gene lists are compared
    as sets.
    """
    def genes(raw: str) -> tuple:
        return tuple(sorted(g.strip() for g in re.split(r"[;,]", raw or "") if g.strip()))

    summary = collections.Counter(
        (r["Variant/Haplotypes"], genes(r["Gene"]), r["Level of Evidence"])
        for r in read_tsv(RAW / "summaryAnnotations.zip", "summary_annotations.tsv")
    )
    variants = collections.Counter(
        (r["variant"], genes(r["gene"]), r["level of evidence"])
        for r in read_tsv(RAW / "clinicalVariants.zip", "clinicalVariants.tsv")
    )
    return {
        "summary_annotation_rows": sum(summary.values()),
        "clinical_variant_rows": sum(variants.values()),
        "rows_agreeing_on_variant_genes_and_level": sum((summary & variants).values()),
        "rows_only_in_summary_annotations": sum((summary - variants).values()),
        "rows_only_in_clinical_variants": sum((variants - summary).values()),
    }


def load_pharmgkb_cpic_guideline_pairs() -> tuple[set, int]:
    """(drug accession, gene symbol) pairs covered by a CPIC-sourced ClinPGx
    guideline annotation, used to cross-check the CPIC API against the PharmGKB
    guideline archive.

    The archive keys a guideline annotation per drug, not per guideline, so the
    CPIC API's guideline accession never appears in it; the drug-and-gene pair
    is the only join the two publications share.
    """
    pairs: set = set()
    documents = 0
    with zipfile.ZipFile(RAW / "guidelineAnnotations.json.zip") as zf:
        for name in sorted(zf.namelist()):
            if not name.endswith(".json"):
                continue
            documents += 1
            guideline = (json.loads(zf.read(name)).get("guideline") or {})
            if guideline.get("source") != "CPIC":
                continue
            chemicals = guideline.get("relatedChemicals") or []
            genes = guideline.get("relatedGenes") or []
            if isinstance(chemicals, str):
                chemicals = ast.literal_eval(chemicals)
            if isinstance(genes, str):
                genes = ast.literal_eval(genes)
            for chem in chemicals:
                for gene in genes:
                    if chem.get("id") and gene.get("symbol"):
                        pairs.add((chem["id"], gene["symbol"]))
    return pairs, documents


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main() -> int:
    created = archive_created(RAW / "chemicals.zip")
    if created != PHARMGKB_SOURCE_DATE:
        raise SystemExit(
            f"archive CREATED stamp {created} does not match the recorded "
            f"source date {PHARMGKB_SOURCE_DATE}"
        )

    idx = load_corpus_index()
    bridge = load_unii_bridge()
    key_cid, key_rxcui = load_corpus_registry_ids()

    chem_rows = read_tsv(RAW / "chemicals.zip", "chemicals.tsv")
    chemicals = [Chemical(r) for r in chem_rows]
    inchi_stats = compute_inchikeys(chemicals)
    chemicals_by_acc = {c.acc: c for c in chemicals}
    name_to_acc = {c.name.lower(): c.acc for c in chemicals}

    stats: dict = collections.Counter()
    chem_pages: dict[str, list[dict]] = {}
    unmatched: list[dict] = []
    for chem in sorted(chemicals, key=lambda c: c.acc):
        hits = match_chemical(chem, idx, bridge, key_cid, key_rxcui, stats)
        if hits:
            chem_pages[chem.acc] = sorted(hits, key=lambda h: h["key"])
            stats["records_matched"] += 1
            stats["records_matched_" + hits[0]["match_rule"]] += 1
        else:
            stats["records_unmatched"] += 1
            unmatched.append({
                "pharmgkbId": chem.acc,
                "name": chem.name,
                "types": sorted(chem.types),
                "hasInchi": bool(chem.inchi),
                "inchikey": chem.inchikey or None,
                "rxnormIds": chem.rxcuis,
                "pubchemCids": chem.cids,
            })

    archive_pairs, guideline_documents = load_pharmgkb_cpic_guideline_pairs()
    level_crosscheck = crosscheck_clinical_variants()
    rows, counts = build_rows(chem_pages, chemicals_by_acc, name_to_acc, idx)
    cpic_rows, cpic_counts = build_cpic_rows(chem_pages, name_to_acc, idx, archive_pairs)
    rows.extend(cpic_rows)
    counts.update(cpic_counts)

    rows.sort(key=lambda r: (r["key"], r["field"], r["source_record_id"]))
    table = pa.Table.from_pylist(rows, schema=SCHEMA)
    pq.write_table(table, SRC / "mapped.parquet", compression="zstd")

    # ---- coverage --------------------------------------------------------
    pages_by_tier: dict[str, set] = collections.defaultdict(set)
    rule_pages: dict[str, dict[str, set]] = collections.defaultdict(lambda: collections.defaultdict(set))
    field_pages: dict[str, dict[str, set]] = collections.defaultdict(lambda: collections.defaultdict(set))
    for row in rows:
        tier = str(row["tier"])
        pages_by_tier[tier].add(row["key"])
        rule_pages[row["match_rule"]][tier].add(row["key"])
        field_pages[row["field"]][tier].add(row["key"])

    best_rule_per_page: dict[str, str] = {}
    for row in rows:
        key, rule = row["key"], row["match_rule"]
        if key not in best_rule_per_page or RULE_ORDER[rule] < RULE_ORDER[best_rule_per_page[key]]:
            best_rule_per_page[key] = rule
    pages_identifier_confirmed = sum(
        1 for r in best_rule_per_page.values() if r in ("unii", "inchikey")
    )

    name_candidates = []
    for acc, hits in chem_pages.items():
        for hit in hits:
            if hit["match_rule"] != "name-candidate":
                continue
            chem = chemicals_by_acc[acc]
            name_candidates.append({
                "key": hit["key"],
                "tier": idx.tier_of(hit["key"]),
                "pageDisplayName": idx.display.get(hit["key"]),
                "pharmgkbId": acc,
                "pharmgkbName": chem.name,
                "matchedOn": hit["match"]["matchedOn"],
                "candidateName": hit["match"]["candidateName"],
                "normalisedName": hit["match"]["normalisedName"],
                "registryAgreement": hit["match"]["registryAgreement"],
                "confirmedByUniiOrInchikey": False,
                "reviewReason": (
                    "Rule (d) name match. The spec confirms a name candidate only "
                    "with a UNII or full InChIKey; neither is available for this "
                    "PharmGKB record, so the pairing is unresolved."
                ),
            })
    name_candidates.sort(
        key=lambda c: (-len(c["registryAgreement"]), c["tier"], c["key"])
    )

    coverage = {
        "source": "pharmgkb-cpic",
        "source_name": "PharmGKB / ClinPGx clinical annotations, drug label annotations and curated relationships; CPIC gene-drug pairs and guidelines",
        "retrieval_date": DATE,
        "pharmgkb_archive_created": created,
        "cpic_api_retrieved": CPIC_SOURCE_DATE,
        "licence": {
            "pharmgkb": PHARMGKB_LICENCE,
            "cpic": CPIC_LICENCE,
        },
        "corpus_pages_total": len(idx.tier),
        "corpus_pages_by_tier": {
            t: sum(1 for v in idx.tier.values() if v == int(t)) for t in ("1", "2", "3")
        },
        "source_records": {
            "pharmgkb_chemicals": len(chemicals),
            "pharmgkb_chemicals_with_inchi": inchi_stats["with_inchi"],
            "pharmgkb_inchikeys_computed": inchi_stats["inchikey_computed"],
            "pharmgkb_inchi_unparsable": inchi_stats["inchi_unparsable"],
            "pharmgkb_clinical_annotations": len(
                read_tsv(RAW / "summaryAnnotations.zip", "summary_annotations.tsv")
            ),
            "pharmgkb_drug_label_annotations": len(
                read_tsv(RAW / "drugLabels.zip", "drugLabels.tsv")
            ),
            "pharmgkb_gene_chemical_relationships": counts.get("pgxGeneAssociations", 0),
            "pharmgkb_guideline_annotation_documents": guideline_documents,
            "pharmgkb_cpic_guideline_drug_gene_pairs": len(archive_pairs),
            "cpic_guidelines": len(json.loads((RAW / "cpic-guideline.json").read_text())),
            "cpic_gene_drug_pairs": len(json.loads((RAW / "cpic-pair.json").read_text())),
            "cpic_drugs": len(json.loads((RAW / "cpic-drug.json").read_text())),
        },
        "pages_matched_by_tier": {t: len(pages_by_tier.get(t, ())) for t in ("1", "2", "3")},
        "pages_matched_total": len(best_rule_per_page),
        "pages_identifier_confirmed": pages_identifier_confirmed,
        "pages_by_match_rule_and_tier": {
            rule: {t: len(rule_pages[rule].get(t, ())) for t in ("1", "2", "3")}
            for rule in sorted(rule_pages)
        },
        "fields_gained_by_tier": {
            fld: {t: len(field_pages[fld].get(t, ())) for t in ("1", "2", "3")}
            for fld in sorted(field_pages)
        },
        "rows_by_field": {f: int(counts[f]) for f in sorted(field_pages)},
        "rows_total": len(rows),
        "unmatched_records": stats["records_unmatched"],
        "matched_records": stats["records_matched"],
        "name_candidates_sent_to_review": len(name_candidates),
        "name_candidates_with_registry_agreement": sum(
            1 for c in name_candidates if c["registryAgreement"]
        ),
        "match_diagnostics": {k: int(v) for k, v in sorted(stats.items())},
        "record_resolution_diagnostics": {
            k: int(v) for k, v in sorted(counts.items())
            if k not in field_pages
        },
        "level_of_evidence_crosscheck": level_crosscheck,
        "files_not_taken": {
            "variantAnnotations.zip": (
                "Per-publication research annotations. They carry no level of "
                "evidence and no gene-drug verdict, so they add nothing to the "
                "pgx fields this source contributes."
            ),
            "phenotypes.zip": (
                "The phenotype accession-to-name table is needed only for the "
                "variant-disease relationships this source does not map; the "
                "clinical annotations carry their phenotype text inline."
            ),
            "cpic recommendation, dosing and allele-function tables": (
                "CPIC dosing content is out of scope by instruction: this source "
                "records that a CPIC guideline exists and which gene it involves, "
                "never the dosing."
            ),
        },
        "method_notes": {
            "unii_rule": (
                "PharmGKB publishes no UNII (one cross-reference in 5,313 "
                "records), so rule (a) resolves the UNII of a PharmGKB chemical "
                "through the FDA UNII records file at "
                "data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt by full "
                "InChIKey, then PubChem CID, then RxNorm CUI, each required to "
                "return exactly one UNII. The route used is on every row at "
                "value.match.uniiResolvedBy."
            ),
            "tautomer_limit": (
                "PharmGKB stores some structures in a tautomer that differs from "
                "the FDA and PubChem depiction; warfarin is stored with the "
                "hydroxyl on the lactone oxygen, giving InChIKey "
                "QTXVAVXCBMYBJW-UHFFFAOYSA-N where FDA UNII 5Q7ZVV76EI records "
                "PJVWKTKQMONHTI-UHFFFAOYSA-N. The InChI hydrogen layer is inside "
                "the first InChIKey block, so such a record matches neither by "
                "full key nor by skeleton and falls to the PubChem CID or RxNorm "
                "UNII route, or to a name candidate."
            ),
            "name_rule": (
                "A normalised name is emitted only when it lands on exactly one "
                "corpus page and no stronger rule fired. Records typed only as a "
                "drug class are excluded from the name route entirely."
            ),
            "cpic_scope": (
                "CPIC rows carry guideline existence, guideline name and URL, the "
                "genes the guideline covers and the CPIC level of the gene-drug "
                "pair. No dosing or recommendation text is retrieved or stored."
            ),
        },
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    (SRC / "coverage.json").write_text(json.dumps(coverage, indent=1, sort_keys=False) + "\n")
    (SRC / "name-candidates-for-review.json").write_text(
        json.dumps(name_candidates, indent=1) + "\n"
    )
    unmatched.sort(key=lambda u: u["pharmgkbId"])
    (SRC / "unmatched-records.json").write_text(json.dumps(unmatched, indent=1) + "\n")

    print(f"rows {len(rows)}  pages {len(best_rule_per_page)}  "
          f"tiers {coverage['pages_matched_by_tier']}")
    print(f"by rule {coverage['pages_by_match_rule_and_tier']}")
    print(f"fields {coverage['rows_by_field']}")
    print(f"unmatched records {stats['records_unmatched']}  "
          f"name candidates {len(name_candidates)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
