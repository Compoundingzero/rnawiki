#!/usr/bin/env python
"""Executes docs/specs/identity-resolution.md (R1) mechanically.

The rule is fixed by the spec; nothing here decides identity policy. It computes K1-K4 for every
input record, applies the §2 precedence and the §3 merge/split table, logs every decision, and
writes the Phase 0c outputs under data/corpus-20k/identity/.

Stages (each records a batch with scripts/corpus-20k/batch.ts):
  join    source records and lookup tables -> identity/stages/*.parquet
  keys    K1..K4, salt/stereo/isotope/fragment analysis (+ PubChem name lookups for keyless rows)
  merges  union-find clustering, merge/split/hold decisions
  combos  combination records keyed by sorted component keys
  outputs canonical.ndjson, summary.json, worked-examples.md, suspected-missed-merges.json
"""

from __future__ import annotations

import csv
import glob
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

import duckdb
import pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem.MolStandardize import rdMolStandardize

RDLogger.DisableLog("rdApp.*")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
RAW = os.path.join(ROOT, "data", "corpus-20k", "raw")
OUT = os.path.join(ROOT, "data", "corpus-20k", "identity")
STAGES = os.path.join(OUT, "stages")
LEGAL_LOG = os.path.join(ROOT, "data", "corpus-20k", "legal", "requests.log")
PUBCHEM_CACHE = os.path.join(RAW, "pubchem", "name-lookups.ndjson")
UA = "RNAWiki-corpus-20k/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)"

os.makedirs(STAGES, exist_ok=True)
os.makedirs(os.path.dirname(PUBCHEM_CACHE), exist_ok=True)

ISSUES: list[str] = []
NAME_UNII_REJECTED: list[dict] = []
NOW = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def log(msg: str) -> None:
    print(f"[identity] {msg}", flush=True)


def batch(step: str, n: int, path: str, records: int, note: str | None = None, done: bool = False) -> None:
    rel = os.path.relpath(path, ROOT)
    cmd = [
        "npx", "tsx", "scripts/corpus-20k/batch.ts",
        "--phase", "0", "--step", step, "--batch", str(n),
        "--file", rel, "--records", str(records),
    ]
    if note:
        cmd += ["--note", note]
    if done:
        cmd += ["--done", step]
    subprocess.run(cmd, cwd=ROOT, check=True, capture_output=True)
    log(f"batch {step}#{n} {rel} records={records}")


# --------------------------------------------------------------------------------------------
# name normalisation — ported from lib/background/name-normalization.ts, plus the K4 additions
# named in §2 (strip stereo prefixes when unspecified, strip extract/powder/oil).
# --------------------------------------------------------------------------------------------

SALT_AND_FORM_WORDS = re.compile(
    r"\b(?:hydrochloride|hcl|sodium|potassium|calcium|sulfate|sulphate|tartrate|maleate|mesylate|"
    r"besylate|fumarate|succinate|citrate|acetate|phosphate|bitartrate|dihydrate|monohydrate|"
    r"anhydrous|micronized|usp|injection|tablets?|capsules?|oral|solution|suspension|cream|ointment|"
    r"gel|spray|trihydrate|hemihydrate|pentahydrate|sesquihydrate|hydrate|hydrous|hydrobromide|hbr|"
    r"monosodium|disodium|dipotassium|tosylate|edisylate|isethionate|napsylate|xinafoate|pamoate|"
    r"embonate|hyclate|meglumine|dimeglumine|tromethamine|trometamol)\b"
)
EXTRACT_WORDS = re.compile(r"\b(?:extract|extracts|powder|powdered|oil|oils|tincture|dried|whole|juice)\b")
STEREO_PREFIX = re.compile(
    r"^(?:\(?[rsdl]\)?|\(\+\)|\(-\)|\(\+/-\)|\(rs\)|dl|rac|racemic|levo|dextro|"
    r"[dl]-|[rs]-|alpha|beta|gamma|delta|cis|trans|[ez])[\s\-]+",
)
PARENTHETICAL = re.compile(r"\([^)]*\)")
NON_ALNUM = re.compile(r"[^a-z0-9]+")

ESTER_WORDS = {
    "enanthate", "heptanoate", "cypionate", "decanoate", "undecanoate", "undecylenate",
    "propionate", "phenylpropionate", "isocaproate", "caproate", "hexanoate", "valerate",
    "butyrate", "palmitate", "pivalate", "dipropionate", "furoate", "benzoate", "laurate",
    "acetonide", "hexanoate", "octanoate", "stearate", "myristate", "oleate", "buciclate",
}


def norm_identity(value: str) -> str:
    return NON_ALNUM.sub(" ", PARENTHETICAL.sub(" ", (value or "").lower())).strip()


def name_family(value: str, stereo_unspecified: bool) -> str:
    text = PARENTHETICAL.sub(" ", (value or "").lower())
    text = NON_ALNUM.sub(" ", text).strip()
    if stereo_unspecified:
        prev = None
        while prev != text:
            prev = text
            text = STEREO_PREFIX.sub("", text)
    text = SALT_AND_FORM_WORDS.sub(" ", text)
    text = EXTRACT_WORDS.sub(" ", text)
    return re.sub(r"\s+", " ", text).strip()


# --------------------------------------------------------------------------------------------
# structure keys
# --------------------------------------------------------------------------------------------

_uncharger = rdMolStandardize.Uncharger()
_struct_cache: dict[str, dict | None] = {}

# Fragments that are counter-ions or solvates rather than the substance (§1). Two tiers, because
# they behave differently when nothing else is left: an organic counter-ion (tier C) and an
# inorganic ion or solvent (tier S).
ORGANIC_COUNTER_ION_SMILES = [
    "OS(=O)(=O)O", "OP(=O)(O)O", "OC(=O)C", "OC(=O)O", "OC(=O)/C=C\\C(=O)O",
    "OC(=O)/C=C/C(=O)O", "OC(=O)C(O)C(O)C(=O)O", "OC(=O)CC(O)(CC(=O)O)C(=O)O",
    "CS(=O)(=O)O", "OS(=O)(=O)c1ccccc1", "Cc1ccc(cc1)S(=O)(=O)O", "OC(=O)CCC(=O)O",
    "OC(=O)c1ccccc1O", "OC(=O)c1ccccc1", "OC(=O)C(=O)O", "OS(=O)(=O)CCO", "OC(=O)CO",
    "OC(=O)C(O)C", "OC(=O)CC(O)C(=O)O", "OC(=O)CCCCC(=O)O", "OC(=O)CCCCCCCC(=O)O",
    "OCC(O)C(O)C(O)C(O)C(=O)O", "NC(CC(=O)O)C(=O)O", "NC(CCC(=O)O)C(=O)O",
    "NC(CCCNC(N)=N)C(=O)O", "NC(CCCCN)C(=O)O", "CNC(CO)C(O)C(O)C(O)CO", "OCC(N)(CO)CO",
    "OCC[N+](C)(C)C", "NCCO", "OCCNCCO", "CCNCC", "NCCN", "OC(=O)CCCCCCCCCCCCCCCCC",
    "OC(=O)CCCCCCCCCCCCCCC", "OC(=O)CCCCCCC/C=C\\CCCCCCCC", "OC(=O)CCCCCCCCCCC",
    "OC(=O)CCCCCCCCCCCCC", "OC(=O)c1cc2ccccc2c(c1O)Cc1c(O)c(cc2ccccc12)C(=O)O",
    "OC(=O)/C=C/c1ccc(O)cc1", "Oc1ccc(cc1)C(=O)O", "OC(=O)c1ccncc1", "OC1CCCCC1",
    "OC(=O)CCCCCCCCC(=O)O", "OC(=O)C(O)(CO)CO", "OS(=O)(=O)CC1CC2CCC1(C)C2(C)C",
    "NCCCCC(N)C(=O)O", "OC(=O)Cc1ccccc1", "OC(=O)C=C", "OC(=O)CCl",
    "NC(=O)c1ccncc1", "C(=O)(O)c1ccc(cc1)S(=O)(=O)O", "OC(=O)CNC(=O)C",
    "OCC(O)CO", "CCO", "CO", "CC(C)=O", "CS(C)=O", "CC#N", "C1CCOC1", "CCOCC",
    "OC(=O)C(F)(F)F", "Cl[Cl]",
]
SOLVENT_SMILES = ["O", "CCO", "CO", "CC(C)=O", "CS(C)=O", "CC#N", "OCC(O)CO", "C1CCOC1", "CCOCC"]

ORGANIC_COUNTER_ION_IK14: set[str] = set()
SOLVENT_IK14: set[str] = set()


def _quiet_key(smiles: str) -> str | None:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    try:
        neutral = _uncharger.uncharge(mol)
        Chem.SanitizeMol(neutral)
        key = Chem.MolToInchiKey(neutral)
        return key[:14] if key else None
    except Exception:
        return None


for _s in ORGANIC_COUNTER_ION_SMILES:
    _k = _quiet_key(_s)
    if _k:
        ORGANIC_COUNTER_ION_IK14.add(_k)
for _s in SOLVENT_SMILES:
    _k = _quiet_key(_s)
    if _k:
        SOLVENT_IK14.add(_k)
COUNTER_ION_IK14 = ORGANIC_COUNTER_ION_IK14 | SOLVENT_IK14


def _classify(frag: dict) -> str:
    """S = inorganic ion or solvent, C = organic counter-ion, K = candidate core moiety."""
    ik14 = frag["inchikey"][:14]
    if not frag["hasCarbon"] or ik14 in SOLVENT_IK14:
        return "S"
    if ik14 in ORGANIC_COUNTER_ION_IK14:
        return "C"
    return "K"


def structure_facts(smiles: str | None, inchi: str | None = None) -> dict | None:
    """Parent InChIKey (§2 K2) plus the facts §3 splits on: salt, stereo, isotope, components.

    §1 removes counter-ions, solvates and hydrates "and nothing else". When every fragment is a
    counter-ion or an inorganic ion there is no distinguished parent moiety, so the whole neutral
    substance is kept as its own moiety rather than silently promoting a counter-ion to the page.
    That under-merges by design; §5.2 reports the pairs it produces.
    """
    cache_key = f"{smiles}|{inchi}"
    if cache_key in _struct_cache:
        return _struct_cache[cache_key]
    result = None
    try:
        mol = Chem.MolFromSmiles(smiles) if smiles else Chem.MolFromInchi(inchi)
        if mol is not None and mol.GetNumAtoms() > 0:
            raw_ik = Chem.MolToInchiKey(mol) or ""
            fragments = []
            for frag in Chem.GetMolFrags(mol, asMols=True, sanitizeFrags=False):
                try:
                    Chem.SanitizeMol(frag)
                    neutral = _uncharger.uncharge(frag)
                    Chem.SanitizeMol(neutral)
                    key = Chem.MolToInchiKey(neutral) or ""
                    if not key:
                        continue
                    fragments.append(
                        {
                            "inchikey": key,
                            "smiles": Chem.MolToSmiles(neutral),
                            "heavyAtoms": neutral.GetNumHeavyAtoms(),
                            "hasCarbon": any(a.GetSymbol() == "C" for a in neutral.GetAtoms()),
                            "mol": neutral,
                        }
                    )
                except Exception:
                    continue
            if fragments:
                for frag in fragments:
                    frag["tier"] = _classify(frag)
                cores = [f for f in fragments if f["tier"] == "K"]
                distinct_cores, seen_core = [], set()
                for frag in sorted(cores, key=lambda f: -f["heavyAtoms"]):
                    if frag["inchikey"][:14] not in seen_core:
                        seen_core.add(frag["inchikey"][:14])
                        distinct_cores.append(frag)
                if len(distinct_cores) == 1:
                    parent = distinct_cores[0]["mol"]
                    parent_reason = "single core moiety; counter-ions and solvates removed"
                    is_salt = len(fragments) > 1
                elif len(distinct_cores) >= 2:
                    parent = distinct_cores[0]["mol"]
                    parent_reason = "multiple core moieties; combination candidate"
                    is_salt = False
                else:
                    parent = _uncharger.uncharge(mol)
                    Chem.SanitizeMol(parent)
                    parent_reason = (
                        "every fragment is a counter-ion, inorganic ion or solvent; the whole "
                        "substance is kept as its own moiety (§1 has no distinguished parent here)"
                    )
                    is_salt = False
                ik = Chem.MolToInchiKey(parent) or ""
                if ik:
                    inchi_text = Chem.MolToInchi(parent) or ""
                    unassigned = Chem.FindMolChiralCenters(
                        parent, includeUnassigned=True, useLegacyImplementation=False
                    )
                    result = {
                        "inchikey": ik,
                        "inchikey14": ik[:14],
                        "smiles": Chem.MolToSmiles(parent),
                        "rawInchikey": raw_ik,
                        "isSalt": is_salt,
                        "parentReason": parent_reason,
                        "hasIsotope": "/i" in inchi_text,
                        "stereoUnspecified": any(c[1] in ("?", "Unassigned") for c in unassigned),
                        "coreCount": len(distinct_cores),
                        "components": [f["inchikey"] for f in distinct_cores],
                        "fragments": [
                            {k: v for k, v in f.items() if k != "mol"} for f in fragments
                        ],
                    }
    except Exception:
        result = None
    _struct_cache[cache_key] = result
    return result


BIOLOGIC_MOLECULE_TYPES = {
    "Protein", "Antibody", "Enzyme", "Cell", "Gene", "Vaccine component",
    "Antibody drug conjugate", "Oligosaccharide",
}
BIOLOGIC_MODALITIES = {
    "Monoclonal Antibody (mAb)", "Recombinant Protein / Biologic",
    "mRNA Vaccine / Therapeutic", "CRISPR / Gene Therapy",
}
BIOLOGIC_SUBSTANCE_TYPES = {"protein", "nucleicAcid", "polymer"}


# --------------------------------------------------------------------------------------------
# stage: join
# --------------------------------------------------------------------------------------------

SYN_KIND = {
    "INN": "inn", "USAN": "usan", "BAN": "ban", "JAN": "jan", "TRADE_NAME": "brand",
    "RESEARCH_CODE": "code", "ATC": "common", "MERCK_INDEX": "common", "FDA": "common",
    "OTHER": "common", "SYSTEMATIC": "systematic", "USP": "common", "BNF": "common",
    "INN_SPANISH": "common", "INN_FRENCH": "common", "INN_RUSSIAN": "common", "DCF": "common",
    "NAME_OF_UNKNOWN_ORIGIN": "common", "USP/INN": "inn",
}
UNII_NAME_KIND = {"of": "common", "sys": "systematic", "cn": "common", "cd": "code", "bn": "brand"}


def load_existing() -> list[dict]:
    rows = []
    path = os.path.join(STAGES, "existing.ndjson")
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def load_chembl() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path in sorted(glob.glob(os.path.join(RAW, "chembl", "molecules-*.json"))):
        with open(path, encoding="utf-8") as handle:
            for m in json.load(handle)["molecules"]:
                cid = m.get("molecule_chembl_id")
                if not cid:
                    continue
                struct = m.get("molecule_structures") or {}
                hier = m.get("molecule_hierarchy") or {}
                out[cid] = {
                    "chemblId": cid,
                    "prefName": m.get("pref_name"),
                    "smiles": struct.get("canonical_smiles"),
                    "inchi": struct.get("standard_inchi"),
                    "sourceInchikey": struct.get("standard_inchi_key"),
                    "parentChembl": hier.get("parent_chembl_id"),
                    "moleculeType": m.get("molecule_type"),
                    "structureType": m.get("structure_type"),
                    "maxPhase": m.get("max_phase"),
                    "prodrug": m.get("prodrug"),
                    "withdrawn": bool(m.get("withdrawn_flag")),
                    "blackBox": m.get("black_box_warning"),
                    "atc": m.get("atc_classifications") or [],
                    "firstApproval": m.get("first_approval"),
                    "synonyms": [
                        (s.get("molecule_synonym"), SYN_KIND.get((s.get("syn_type") or "").upper(), "common"))
                        for s in (m.get("molecule_synonyms") or [])
                        if s.get("molecule_synonym")
                    ],
                }
    return out


def load_open_targets() -> dict[str, dict]:
    con = duckdb.connect()
    frame = con.execute(
        "select id, canonicalSmiles, inchiKey, drugType, name, parentId, synonyms, tradeNames, "
        "crossReferences, childChemblIds, maximumClinicalStage, description "
        f"from read_parquet('{os.path.join(RAW, 'open-targets', 'drug_molecule', '*.parquet')}')"
    ).fetchdf()
    def as_list(value):
        if value is None:
            return []
        try:
            if pd.isna(value):
                return []
        except (TypeError, ValueError):
            pass
        return list(value)

    out: dict[str, dict] = {}
    for row in frame.itertuples(index=False):
        cross = {}
        for ref in as_list(row.crossReferences):
            src = (ref.get("source") or "").lower()
            ids = list(ref.get("ids") or [])
            if ids:
                cross[src] = ids
        out[row.id] = {
            "id": row.id,
            "smiles": row.canonicalSmiles,
            "inchikey": row.inchiKey,
            "drugType": row.drugType,
            "name": row.name,
            "parentId": row.parentId,
            "synonyms": [s.get("label") for s in as_list(row.synonyms) if s.get("label")],
            "tradeNames": [s.get("label") for s in as_list(row.tradeNames) if s.get("label")],
            "childChemblIds": as_list(row.childChemblIds),
            "maxStage": row.maximumClinicalStage,
            "cross": cross,
        }
    con.close()
    return out


def load_unii() -> tuple[dict[str, dict], dict[str, list[tuple[str, str]]]]:
    records: dict[str, dict] = {}
    path = os.path.join(RAW, "fda-unii", "UNII_Records_4Aug2026.txt")
    with open(path, encoding="utf-8", errors="replace", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            unii = (row.get("UNII") or "").strip()
            if not unii:
                continue
            records[unii] = {
                "unii": unii,
                "displayName": (row.get("UTF8_DISPLAY_NAME") or row.get("DISPLAY_NAME") or "").strip(),
                "cas": (row.get("RN") or "").strip(),
                "rxcui": (row.get("RXCUI") or "").strip(),
                "cid": (row.get("PUBCHEM") or "").strip(),
                "inchikey": (row.get("INCHIKEY") or "").strip(),
                "smiles": (row.get("SMILES") or "").strip(),
                "ingredientType": (row.get("INGREDIENT_TYPE") or "").strip(),
                "substanceType": (row.get("SUBSTANCE_TYPE") or "").strip(),
                "innId": (row.get("INN_ID") or "").strip(),
                "usanId": (row.get("USAN_ID") or "").strip(),
                "emaSubstanceId": (row.get("SMSID") or "").strip(),
            }
    names: dict[str, list[tuple[str, str]]] = defaultdict(list)
    npath = os.path.join(RAW, "fda-unii", "UNII_Names_4Aug2026.txt")
    with open(npath, encoding="utf-8", errors="replace", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            unii = (row.get("UNII") or "").strip()
            name = (row.get("NAME") or "").strip()
            if unii and name:
                names[unii].append((name, UNII_NAME_KIND.get((row.get("TYPE") or "").strip(), "common")))
    return records, names


def load_ema() -> list[dict]:
    frame = pd.read_csv(os.path.join(RAW, "ema", "Medicine.csv"))
    inn_col = "International non-proprietary name (INN) / common name"
    rows = []
    for _, row in frame.iterrows():
        rows.append(
            {
                "product": str(row.get("Name of medicine") or ""),
                "inn": str(row.get(inn_col) or ""),
                "substance": str(row.get("Active substance") or ""),
                "number": str(row.get("EMA product number") or ""),
            }
        )
    return rows


def load_health_canada() -> list[str]:
    names: list[str] = []
    path = os.path.join(RAW, "health-canada", "allfiles", "ingred.txt")
    with open(path, encoding="utf-8", errors="replace", newline="") as handle:
        for row in csv.reader(handle):
            if len(row) > 2 and row[2].strip():
                names.append(row[2].strip())
    return names


def stage_join() -> dict:
    log("join: reading sources")
    existing = load_existing()
    chembl = load_chembl()
    open_targets = load_open_targets()
    unii_records, unii_names = load_unii()
    ema = load_ema()
    hc_names = load_health_canada()

    drugbank_path = os.path.join(RAW, "drugbank-open")
    drugbank_files = [f for f in os.listdir(drugbank_path) if not f.endswith(".html")]
    if not drugbank_files:
        ISSUES.append(
            "DrugBank Open Data unavailable: raw/drugbank-open holds only "
            "drugbank-vocabulary.DENIED-403-login.html (recorded batch, 403 login wall). "
            "DrugBank ids, CAS, UNII, synonyms, InChIKey and SMILES from source (c) are absent; "
            "DrugBank ids on output rows come from existing registryIdentifiers and Open Targets "
            "cross-references only."
        )

    # Lookup indexes used by the keys stage.
    by_cas: dict[str, str] = {}
    by_rxcui: dict[str, str] = {}
    by_cid: dict[str, str] = {}
    by_name: dict[str, str] = {}
    parent_index: dict[str, str] = {}
    for unii, rec in unii_records.items():
        if rec["cas"]:
            by_cas.setdefault(rec["cas"], unii)
        if rec["rxcui"]:
            by_rxcui.setdefault(rec["rxcui"], unii)
        if rec["cid"]:
            by_cid.setdefault(rec["cid"], unii)
    for unii, entries in unii_names.items():
        for name, _kind in entries:
            key = norm_identity(name)
            if len(key) >= 3:
                by_name.setdefault(key, unii)
    for unii, rec in unii_records.items():
        key = norm_identity(rec["displayName"])
        if len(key) >= 3:
            by_name.setdefault(key, unii)

    # §2 K1: a UNII is a parent substance when its own recorded structure already IS its parent.
    log(f"join: computing parent structure for {sum(1 for r in unii_records.values() if r['smiles']):,} UNII structures")
    parent_rank = {"INGREDIENT SUBSTANCE": 0, "SPECIFIED SUBSTANCE": 1, "UNSPECIFIED INGREDIENT": 2,
                   "IONIC MOIETY": 3, "MOLECULAR FRAGMENT": 4}
    best: dict[str, tuple] = {}
    for unii, rec in unii_records.items():
        if not rec["smiles"]:
            continue
        facts = structure_facts(rec["smiles"])
        if not facts:
            continue
        rec["parentInchikey"] = facts["inchikey"]
        rec["isSalt"] = facts["isSalt"]
        own = rec["inchikey"] or facts["rawInchikey"]
        rec["ownInchikey"] = own
        if own == facts["inchikey"]:
            rank = (
                parent_rank.get(rec["ingredientType"], 5),
                0 if rec["substanceType"] == "chemical" else 1,
                0 if rec["innId"] else 1,
                unii,
            )
            if facts["inchikey"] not in best or rank < best[facts["inchikey"]]:
                best[facts["inchikey"]] = rank
                parent_index[facts["inchikey"]] = unii

    lookups = {
        "byCas": by_cas, "byRxcui": by_rxcui, "byCid": by_cid, "byName": by_name,
        "parentIndex": parent_index,
    }
    with open(os.path.join(STAGES, "unii-lookups.json"), "w", encoding="utf-8") as handle:
        json.dump({k: v for k, v in lookups.items()}, handle)
    batch("identity-join", 1, os.path.join(STAGES, "unii-lookups.json"),
          sum(len(v) for v in lookups.values()),
          note="UNII lookup indexes: CAS/RXCUI/CID/name -> UNII, parent-InChIKey -> parent UNII")

    ema_by_name: dict[str, list[str]] = defaultdict(list)
    for row in ema:
        for part in re.split(r"[;/]", row["inn"] or ""):
            key = norm_identity(part)
            if len(key) >= 3:
                ema_by_name[key].append(row["product"])
    hc_by_name: dict[str, int] = Counter()
    for name in hc_names:
        key = norm_identity(name)
        if len(key) >= 3:
            hc_by_name[key] += 1

    frame = pd.DataFrame(
        [{"source": k, "records": v} for k, v in {
            "existing-canonical": len(existing),
            "chembl-molecules": len(chembl),
            "open-targets-drug-molecule": len(open_targets),
            "fda-unii-records": len(unii_records),
            "fda-unii-names": sum(len(v) for v in unii_names.values()),
            "ema-medicines": len(ema),
            "health-canada-ingredients": len(hc_names),
            "drugbank-open": 0,
        }.items()]
    )
    frame.to_parquet(os.path.join(STAGES, "join-inputs.parquet"))
    batch("identity-join", 2, os.path.join(STAGES, "join-inputs.parquet"), int(frame["records"].sum()),
          note="input record counts per source", done=True)

    return {
        "existing": existing, "chembl": chembl, "openTargets": open_targets,
        "unii": unii_records, "uniiNames": unii_names, "lookups": lookups,
        "emaByName": dict(ema_by_name), "hcByName": dict(hc_by_name),
        "inputs": {row.source: int(row.records) for row in frame.itertuples(index=False)},
    }


# --------------------------------------------------------------------------------------------
# stage: keys
# --------------------------------------------------------------------------------------------

def build_records(data: dict) -> list[dict]:
    """One row per candidate page-bearing record: existing DB rows plus the ChEMBL/Open Targets union."""
    chembl, ot = data["chembl"], data["openTargets"]
    records: dict[str, dict] = {}

    for cid in set(chembl) | set(ot):
        c = chembl.get(cid, {})
        o = ot.get(cid, {})
        synonyms = [(n, k, "chembl") for n, k in c.get("synonyms", [])]
        synonyms += [(n, "common", "open-targets") for n in o.get("synonyms", [])]
        synonyms += [(n, "brand", "open-targets") for n in o.get("tradeNames", [])]
        cross = o.get("cross", {})
        records[f"chembl:{cid}"] = {
            "rid": f"chembl:{cid}",
            "sourceRecords": ([{"source": "chembl", "id": cid}] if c else [])
            + ([{"source": "open-targets", "id": cid}] if o else []),
            "name": c.get("prefName") or o.get("name") or cid,
            "synonyms": synonyms,
            "smiles": c.get("smiles") or o.get("smiles"),
            "inchi": c.get("inchi"),
            "chemblId": cid,
            "chemblParent": c.get("parentChembl") or o.get("parentId"),
            "childChemblIds": o.get("childChemblIds", []),
            "moleculeType": c.get("moleculeType") or o.get("drugType"),
            "structureType": c.get("structureType"),
            "prodrug": c.get("prodrug"),
            "maxPhase": c.get("maxPhase"),
            "withdrawn": c.get("withdrawn"),
            "unii": None,
            "cas": None,
            "rxcui": None,
            "cid": (cross.get("pubchem") or [None])[0],
            "drugbankId": (cross.get("drugbank") or [None])[0],
            "entityClass": None,
            "modality": None,
            "existingSlug": None,
        }

    for row in data["existing"]:
        reg = row.get("registry") or {}
        linked = chembl.get(reg.get("chemblId") or "", {})
        synonyms = [(a["alias"], (a.get("kind") or "common_name").replace("common_name", "common")
                     .replace("salt_form", "salt"), "existing") for a in row.get("aliases", [])]
        if row.get("tradeName"):
            synonyms.append((row["tradeName"], "brand", "existing"))
        records[f"existing:{row['slug']}"] = {
            "rid": f"existing:{row['slug']}",
            "sourceRecords": [{"source": "existing", "id": row["slug"]}],
            "name": row["name"],
            "synonyms": synonyms,
            "smiles": linked.get("smiles"),
            "inchi": linked.get("inchi"),
            "chemblId": reg.get("chemblId"),
            "chemblParent": None,
            "childChemblIds": [],
            "moleculeType": None,
            "structureType": None,
            "prodrug": None,
            "maxPhase": None,
            "withdrawn": row.get("approvalStatus") == "Withdrawn",
            "unii": reg.get("unii"),
            "cas": reg.get("casNumber"),
            "rxcui": reg.get("rxcui"),
            "cid": reg.get("pubchemCid"),
            "drugbankId": reg.get("drugBankId"),
            "emaSubstanceId": reg.get("emaSubstanceId"),
            "entityClass": row.get("entityClass"),
            "modality": row.get("modality"),
            "existingSlug": row["slug"],
        }
    return list(records.values())


def pubchem_lookup(names: list[tuple[str, str]]) -> dict[str, dict]:
    """PubChem PUG-REST name -> CID/InChIKey/SMILES. <=5 req/s, every request logged, cached."""
    cache: dict[str, dict] = {}
    if os.path.exists(PUBCHEM_CACHE):
        with open(PUBCHEM_CACHE, encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    row = json.loads(line)
                    cache[row["query"]] = row
    todo = [(rid, name) for rid, name in names if name not in cache]
    if not todo:
        return cache
    log(f"keys: {len(todo):,} PubChem name lookups (5 req/s ceiling)")
    handle = open(PUBCHEM_CACHE, "a", encoding="utf-8")
    legal = open(LEGAL_LOG, "a", encoding="utf-8")
    done = 0
    batch_no = 0
    for _rid, name in todo:
        url = (
            "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"
            + urllib.parse.quote(name, safe="")
            + "/property/InChI,InChIKey,MolecularFormula/JSON"
        )
        status, body = 0, b""
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                status, body = resp.status, resp.read()
        except urllib.error.HTTPError as err:
            status, body = err.code, b""
        except Exception:
            status, body = 0, b""
        legal.write(f"{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}\t{url}\t{status}\t{len(body)}\n")
        row = {"query": name, "status": status, "at": NOW, "cid": None, "inchikey": None, "inchi": None}
        if status == 200 and body:
            try:
                props = json.loads(body)["PropertyTable"]["Properties"]
                if props:
                    row["cid"] = props[0].get("CID")
                    row["inchikey"] = props[0].get("InChIKey")
                    row["inchi"] = props[0].get("InChI")
            except Exception:
                pass
        cache[name] = row
        handle.write(json.dumps(row) + "\n")
        done += 1
        if done % 250 == 0:
            handle.flush()
            legal.flush()
            batch_no += 1
            batch("identity-pubchem-names", batch_no, PUBCHEM_CACHE, len(cache),
                  note=f"PubChem PUG-REST name lookups, {done}/{len(todo)} of this run")
        time.sleep(0.21)
    handle.close()
    legal.close()
    batch_no += 1
    batch("identity-pubchem-names", batch_no, PUBCHEM_CACHE, len(cache),
          note=f"PubChem PUG-REST name lookups complete ({done} new)", done=True)
    return cache


def stage_keys(data: dict) -> list[dict]:
    log("keys: building record universe")
    records = build_records(data)
    unii_recs = data["unii"]
    lk = data["lookups"]
    parent_index = lk["parentIndex"]

    # Only a name that a source offers AS the substance's name may resolve a UNII: brand names name
    # products and research codes name programmes, and both mis-resolve.
    name_kinds = {"inn", "usan", "ban", "jan", "common", "display"}

    def resolve_unii(rec: dict) -> tuple[str | None, str]:
        if rec.get("unii") and rec["unii"] in unii_recs:
            return rec["unii"], "recorded"
        if rec.get("cas") and rec["cas"] in lk["byCas"]:
            return lk["byCas"][rec["cas"]], "cas"
        if rec.get("rxcui") and rec["rxcui"] in lk["byRxcui"]:
            return lk["byRxcui"][rec["rxcui"]], "rxcui"
        if rec.get("cid") and str(rec["cid"]) in lk["byCid"]:
            return lk["byCid"][str(rec["cid"])], "pubchem-cid"
        candidates = [rec["name"]] + [n for n, k, _s in rec["synonyms"] if k in name_kinds]
        for name in candidates:
            key = norm_identity(name)
            if len(key) >= 4 and key in lk["byName"]:
                return lk["byName"][key], "name"
        return None, "none"

    rejected: list[dict] = []
    log(f"keys: computing structures and keys for {len(records):,} records")
    for i, rec in enumerate(records):
        if i and i % 5000 == 0:
            log(f"keys: {i:,}/{len(records):,}")
        unii, how = resolve_unii(rec)
        rec["unii"] = unii
        rec["uniiVia"] = how
        urec = unii_recs.get(unii) if unii else None
        if urec:
            rec["cas"] = rec.get("cas") or urec["cas"] or None
            rec["rxcui"] = rec.get("rxcui") or urec["rxcui"] or None
            rec["cid"] = rec.get("cid") or urec["cid"] or None
            rec["substanceType"] = urec["substanceType"]
            rec["uniiParentInchikey"] = urec.get("parentInchikey")
        smiles = rec.get("smiles") or (urec["smiles"] if urec else None)
        facts = structure_facts(smiles, rec.get("inchi"))
        rec["structureSmiles"] = smiles
        rec["facts"] = facts

        rec["isBiologic"] = bool(
            (rec.get("moleculeType") in BIOLOGIC_MOLECULE_TYPES)
            or (rec.get("modality") in BIOLOGIC_MODALITIES)
            or (rec.get("entityClass") == "APPROVED_BIOLOGIC")
            or (not facts and rec.get("substanceType") in BIOLOGIC_SUBSTANCE_TYPES)
        ) and not facts

        k2 = facts["inchikey"] if facts else None
        k1 = None
        k1_from = None
        if facts and k2 in parent_index:
            k1, k1_from = parent_index[k2], "parent-index"
        if urec and urec.get("parentInchikey") and k2 and urec["parentInchikey"] == k2 and not k1:
            k1, k1_from = unii, "own-parent"
        if not facts and unii:
            k1, k1_from = unii, "no-structure"
        rec["k1"], rec["k1From"] = k1, k1_from
        rec["k2"] = k2
        rec["uniiParentInchikey"] = urec.get("parentInchikey") if urec else None
        rec["k3"] = rec.get("chemblParent") if (not k2 and rec.get("chemblParent")) else None
        if not k2 and not rec.get("chemblParent") and rec.get("chemblId"):
            rec["k3"] = rec["chemblId"]
        rec["k4"] = None
        if not k1 and not k2 and not rec["k3"]:
            fam = name_family(rec["name"], True)
            rec["k4"] = fam or None

        # §3.6: a four-letter FDA biosimilar suffix names a different product from the originator,
        # and both may carry the originator's UNII. The suffixed record is pinned to its own page.
        rec["biosimilarSuffix"] = biosimilar_suffix(rec)

        # §2: K1 and K2 must agree — but only where the record actually carries a UNII. A UNII
        # reached by matching a name is an inference, not a recorded identifier: when its structure
        # disagrees the name match is wrong, so the association is dropped and counted, never held
        # as an identity conflict for a person to adjudicate.
        rec["conflict"] = False
        if urec and facts and urec.get("parentInchikey") and urec["parentInchikey"] != k2:
            if how in ("recorded", "cas", "rxcui", "pubchem-cid"):
                rec["conflict"] = True
            else:
                rejected.append({"rid": rec["rid"], "name": rec["name"], "unii": unii})
                rec["unii"] = None
                rec["uniiVia"] = "name-rejected"
                if rec.get("k1From") == "own-parent":
                    rec["k1"], rec["k1From"] = None, None
                if not rec["k1"] and k2 in parent_index:
                    rec["k1"], rec["k1From"] = parent_index[k2], "parent-index"

    keyless = [
        (r["rid"], r["name"]) for r in records
        if r.get("existingSlug") and not r["k1"] and not r["k2"] and not r["k3"]
    ]
    lookups = pubchem_lookup(keyless) if keyless else {}
    resolved = 0
    for rec in records:
        if rec.get("existingSlug") and not rec["k1"] and not rec["k2"] and not rec["k3"]:
            row = lookups.get(rec["name"])
            if row and row.get("inchi"):
                facts = structure_facts(None, row["inchi"])
                if facts:
                    rec["facts"] = facts
                    rec["structureSmiles"] = facts["smiles"]
                    rec["k2"] = facts["inchikey"]
                    rec["cid"] = rec.get("cid") or row.get("cid")
                    if facts["inchikey"] in parent_index:
                        rec["k1"], rec["k1From"] = parent_index[facts["inchikey"]], "parent-index"
                    rec["k4"] = None
                    rec["isBiologic"] = False
                    resolved += 1
    if keyless:
        log(f"keys: PubChem resolved {resolved:,} of {len(keyless):,} keyless existing records")
    log(f"keys: {len(rejected):,} name-matched UNII associations rejected on structural disagreement")
    with open(os.path.join(STAGES, "rejected-name-unii.json"), "w", encoding="utf-8") as handle:
        json.dump(rejected, handle, indent=1)
    NAME_UNII_REJECTED.extend(rejected)

    frame = pd.DataFrame(
        [
            {
                "rid": r["rid"], "name": r["name"], "k1": r["k1"], "k2": r["k2"], "k3": r["k3"],
                "k4": r["k4"], "inchikey14": (r["facts"] or {}).get("inchikey14"),
                "isSalt": (r["facts"] or {}).get("isSalt"), "isBiologic": r["isBiologic"],
                "conflict": r["conflict"], "existingSlug": r["existingSlug"],
                "chemblId": r["chemblId"], "unii": r["unii"], "uniiVia": r["uniiVia"],
            }
            for r in records
        ]
    )
    frame.to_parquet(os.path.join(STAGES, "keys.parquet"))
    batch("identity-keys", 1, os.path.join(STAGES, "keys.parquet"), len(frame),
          note=f"K1-K4 per record; {len(keyless)} keyless existing rows sent to PubChem, {resolved} resolved",
          done=True)
    return records


# --------------------------------------------------------------------------------------------
# stage: merges
# --------------------------------------------------------------------------------------------

class Union:
    def __init__(self) -> None:
        self.parent: dict[str, str] = {}

    def find(self, a: str) -> str:
        self.parent.setdefault(a, a)
        while self.parent[a] != a:
            self.parent[a] = self.parent[self.parent[a]]
            a = self.parent[a]
        return a

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


COMBINATION_NAME = re.compile(r"\s(?:and|with|plus)\s|;|\s\+\s|/")


def detect_combination(rec: dict, single_ik14: set[str]) -> list[str] | None:
    """§3.7. Returns component parent InChIKeys when the record is a combination.

    A second core moiety only counts when that moiety is also recorded somewhere as a substance on
    its own; otherwise a large counter-ion this list does not know would invent a combination.
    """
    facts = rec.get("facts")
    if facts and facts.get("coreCount", 0) >= 2:
        components = [ik for ik in facts["components"] if ik[:14] in single_ik14]
        if len(components) >= 2:
            return sorted(components)
    if rec.get("entityClass") == "COMBINATION_PRODUCT":
        return []
    # A record with no structure cannot be split by fragments, so a combination can only be read
    # from its name. Without this a product page merges onto whichever ingredient a name match hit.
    if not facts and not rec.get("biosimilarSuffix") and COMBINATION_NAME.search(rec["name"] or ""):
        return []
    return None


def stage_merges(records: list[dict]) -> tuple[dict, list[dict]]:
    decisions: list[dict] = []
    by_rid = {r["rid"]: r for r in records}

    single = {
        rec["facts"]["inchikey14"]
        for rec in records
        if rec.get("facts") and rec["facts"].get("coreCount", 0) <= 1
    }

    for rec in records:
        rec["combinationComponents"] = detect_combination(rec, single)
        rec["isCombination"] = rec["combinationComponents"] is not None

    holds = []
    for rec in records:
        if rec["conflict"]:
            holds.append(rec)
            decisions.append(
                {
                    "at": NOW, "sourceRecords": [rec["rid"]], "decision": "hold",
                    "key": None, "keyRank": None, "ruleId": "CONFLICT-K1-K2",
                    "evidence": {
                        "unii": rec["unii"],
                        "inchikey": rec["k2"],
                        "uniiParentInchikey": rec.get("uniiParentInchikey"),
                    },
                    "note": "K1 and K2 name different parents; held out of merging for a person to decide (§2).",
                }
            )

    union = Union()
    key_nodes: dict[str, list[str]] = defaultdict(list)
    for rec in records:
        union.find(rec["rid"])
        if rec["isCombination"] or rec["conflict"]:
            continue
        if rec.get("biosimilarSuffix"):
            continue  # §3.6: its own page, related to the originator, never merged into it
        links = []
        if rec["k1"]:
            links.append(f"K1:{rec['k1']}")
        if rec["k2"]:
            links.append(f"K2:{rec['k2']}")
        if not rec["k1"] and not rec["k2"] and rec["k3"]:
            links.append(f"K3:{rec['k3']}")
        if rec["k4"]:
            links.append(f"K4:{rec['k4']}")
        for node in links:
            union.union(node, rec["rid"])
            key_nodes[node].append(rec["rid"])

    clusters: dict[str, list[dict]] = defaultdict(list)
    for rec in records:
        clusters[union.find(rec["rid"])].append(rec)

    return {"clusters": clusters, "singleIk14": single, "holds": holds}, decisions


# --------------------------------------------------------------------------------------------
# stage: outputs
# --------------------------------------------------------------------------------------------

def choose_display_name(members: list[dict]) -> str:
    for kind in ("inn",):
        for rec in members:
            for name, k, _src in rec["synonyms"]:
                if k == kind and name:
                    return name.strip()
    for rec in members:
        if rec.get("existingSlug"):
            return rec["name"]
    for rec in members:
        if rec.get("chemblId") and rec.get("name"):
            return rec["name"]
    return members[0]["name"]


ARTICLE_PREFIX = re.compile(r"^(?:a|an|the)\s", re.IGNORECASE)
CODE_SHAPED = re.compile(r"^[a-z]{1,6}[\s-]?\d{2,7}([\s-]?[a-z0-9]{1,4})?$")


def merge_rule(members: list[dict]) -> tuple[str, str]:
    """Which §3 rule explains a merge, decided on what actually differs between the members."""
    if any((r.get("facts") or {}).get("isSalt") for r in members):
        return "M-SALT", "salt or solvate form merged into the parent moiety"
    stripped = {name_family(r["name"], True) for r in members}
    kept = {name_family(r["name"], False) for r in members}
    if len(stripped) == 1 and len(kept) > 1:
        return "M-STEREO-ACCIDENT", "one registered substance recorded with and without a stereo prefix"
    names = [norm_identity(r["name"]) for r in members]
    if any(CODE_SHAPED.match(n) for n in names):
        return "M-CODE", "development code name merged into the structure it names"
    brand_names = {
        norm_identity(n) for r in members for n, k, _s in r["synonyms"] if k == "brand"
    }
    if brand_names & set(names):
        return "M-BRAND", "single-ingredient brand merged into its moiety"
    if len(set(names)) > 1:
        return "M-NAME-VARIANT", "different recorded names for one structure"
    return "M-FORMULATION", "records of one moiety recorded under the same name"


def build_pages(state: dict, records: list[dict], data: dict, decisions: list[dict]) -> list[dict]:
    clusters = state["clusters"]
    pages: list[dict] = []
    unii_names = data["uniiNames"]
    unii_recs = data["unii"]
    ema_by_name = data["emaByName"]
    hc_by_name = data["hcByName"]

    for members in clusters.values():
        members = sorted(members, key=lambda r: r["rid"])
        if members[0]["isCombination"]:
            continue  # built in the combos stage
        if len(members) == 1 and members[0]["conflict"]:
            key_rank, key, rule = "HOLD", f"HOLD:{members[0]['rid']}", "CONFLICT-K1-K2"
        else:
            key = key_rank = rule = None
            for rank, field, rid in (("K1", "k1", "K1-UNII-PARENT"), ("K2", "k2", "K2-INCHIKEY-PARENT"),
                                     ("K3", "k3", "K3-CHEMBL-PARENT"), ("K4", "k4", "K4-NAME-FAMILY")):
                values = sorted({m[field] for m in members if m.get(field)})
                if values:
                    key, key_rank, rule = f"{rank}:{values[0]}", rank, rid
                    break
            if not key:
                key, key_rank, rule = f"UNKEYED:{members[0]['rid']}", "NONE", "NO-KEY"
            suffix = members[0].get("biosimilarSuffix")
            if suffix:
                key, rule = f"{key}#{suffix}", "S-BIOSIMILAR"

        facts = next((m["facts"] for m in members if m.get("facts")), None)
        synonyms: list[dict] = []
        seen = set()

        def add_syn(name: str, kind: str, source: str) -> None:
            if not name or ARTICLE_PREFIX.match(name.strip()):
                return
            norm = norm_identity(name)
            if not norm or norm in seen or len(synonyms) >= 60:
                return
            seen.add(norm)
            synonyms.append({"name": name.strip(), "kind": kind, "source": source})

        display = choose_display_name(members)
        add_syn(display, "display", "identity")
        for rec in members:
            add_syn(rec["name"], "common", rec["sourceRecords"][0]["source"] if rec["sourceRecords"] else "identity")
            for name, kind, src in rec["synonyms"]:
                if kind == "salt" or SALT_AND_FORM_WORDS.search((name or "").lower()):
                    kind = "salt"
                add_syn(name, kind, src)
        uniis = sorted({m["unii"] for m in members if m["unii"]})
        # Only the page's own registered substance contributes registry names, and only names it
        # offers as names of the substance: a substance record for a combination lists its partners'
        # names too, and letting those in is how one page ends up answering to another's name.
        taken = 0
        for name, kind in unii_names.get(uniis[0], []) if uniis else []:
            if kind in ("common", "brand", "code") and taken < 12:
                add_syn(name, kind, "fda-unii")
                taken += 1
        matched_ema = matched_hc = False
        for rec in members:
            fam = norm_identity(rec["name"])
            for product in ema_by_name.get(fam, [])[:5]:
                add_syn(product, "brand", "ema")
                matched_ema = True
            if fam in hc_by_name:
                matched_hc = True

        page = {
            "key": key,
            "keyRank": key_rank,
            "ruleId": rule,
            "displayName": display,
            "synonyms": synonyms,
            "relations": [],
            "sourceRecords": [s for m in members for s in m["sourceRecords"]]
            + [{"source": "fda-unii", "id": u} for u in uniis],
            "structure": (
                {"inchikey": facts["inchikey"], "inchikey14": facts["inchikey14"], "smiles": facts["smiles"]}
                if facts else None
            ),
            "isCombination": False,
            "isBiologic": bool(members[0]["isBiologic"] and not facts),
            "chemblId": next((m["chemblId"] for m in members if m.get("chemblId")), None),
            "unii": uniis[0] if uniis else None,
            "cid": next((m["cid"] for m in members if m.get("cid")), None),
            "cas": next((m["cas"] for m in members if m.get("cas")), None),
            "rxcui": next((m["rxcui"] for m in members if m.get("rxcui")), None),
            "drugbankId": next((m["drugbankId"] for m in members if m.get("drugbankId")), None),
            "existingSlug": next((m["existingSlug"] for m in members if m.get("existingSlug")), None),
            "_members": members,
            "_ema": matched_ema,
            "_hc": matched_hc,
        }
        if unii_recs.get(page["unii"], {}).get("substanceType") in BIOLOGIC_SUBSTANCE_TYPES and not facts:
            page["isBiologic"] = True
        pages.append(page)

        if len(members) > 1:
            rule_id, note = merge_rule(members)
            decisions.append(
                {
                    "at": NOW,
                    "sourceRecords": [m["rid"] for m in members],
                    "decision": "merge",
                    "key": key,
                    "keyRank": key_rank,
                    "ruleId": rule_id,
                    "evidence": {
                        "unii": page["unii"],
                        "inchikey": page["structure"]["inchikey"] if page["structure"] else None,
                        "chemblParent": next((m["chemblParent"] for m in members if m.get("chemblParent")), None),
                        "nameFamily": name_family(display, True) or None,
                    },
                    "note": note,
                }
            )
    return pages


def stage_combos(records: list[dict], pages: list[dict], decisions: list[dict]) -> list[dict]:
    ik_to_key = {}
    name_to_key: dict[str, str] = {}
    for page in pages:
        if page["structure"]:
            ik_to_key.setdefault(page["structure"]["inchikey"], page["key"])
    for page in pages:
        name_to_key.setdefault(norm_identity(page["displayName"]), page["key"])
    for page in pages:
        for member in page.get("_members", []):
            name_to_key.setdefault(norm_identity(member["name"]), page["key"])

    # Component resolution may also split on a comma; combination *detection* may not, because a
    # systematic chemical name is full of commas.
    component_split = re.compile(r"\s(?:and|with|plus)\s|;|\s\+\s|/|,")

    def keys_from_name(name: str) -> list[str]:
        parts = [p.strip() for p in component_split.split(name or "") if p and p.strip()]
        found = []
        for part in parts:
            key = name_to_key.get(norm_identity(part)) or name_to_key.get(name_family(part, True))
            if key and key not in found:
                found.append(key)
        return sorted(found) if len(found) >= 2 else []

    grouped: dict[str, list[dict]] = defaultdict(list)
    for rec in records:
        if not rec["isCombination"]:
            continue
        components = rec["combinationComponents"] or []
        component_keys = sorted(ik_to_key.get(ik, f"IK:{ik}") for ik in components)
        if not component_keys:
            component_keys = keys_from_name(rec["name"])
        key = ("COMBO:{" + ",".join(component_keys) + "}") if component_keys else f"COMBO:NAME:{name_family(rec['name'], True)}"
        rec["componentKeys"] = component_keys
        rec["componentsResolved"] = bool(component_keys)
        grouped[key].append(rec)

    combos = []
    for key, members in grouped.items():
        members = sorted(members, key=lambda r: r["rid"])
        component_keys = members[0].get("componentKeys") or []
        synonyms, seen = [], set()
        for rec in members:
            for name, kind, src in [(rec["name"], "common", rec["sourceRecords"][0]["source"] if rec["sourceRecords"] else "identity")] + rec["synonyms"]:
                norm = norm_identity(name)
                if name and norm and norm not in seen and len(synonyms) < 60:
                    seen.add(norm)
                    synonyms.append({"name": name.strip(), "kind": kind, "source": src})
        facts = next((m["facts"] for m in members if m.get("facts")), None)
        combos.append(
            {
                "key": key,
                "keyRank": "COMBO",
                "ruleId": "S-COMBO",
                "displayName": members[0]["name"],
                "synonyms": synonyms,
                "relations": [{"type": "contains", "targetKey": k} for k in component_keys],
                "sourceRecords": [s for m in members for s in m["sourceRecords"]],
                "structure": (
                    {"inchikey": facts["inchikey"], "inchikey14": facts["inchikey14"], "smiles": facts["smiles"]}
                    if facts else None
                ),
                "isCombination": True,
                "isBiologic": False,
                "chemblId": next((m["chemblId"] for m in members if m.get("chemblId")), None),
                "unii": next((m["unii"] for m in members if m.get("unii")), None),
                "cid": next((m["cid"] for m in members if m.get("cid")), None),
                "cas": next((m["cas"] for m in members if m.get("cas")), None),
                "rxcui": next((m["rxcui"] for m in members if m.get("rxcui")), None),
                "drugbankId": next((m["drugbankId"] for m in members if m.get("drugbankId")), None),
                "existingSlug": next((m["existingSlug"] for m in members if m.get("existingSlug")), None),
                "_members": members,
            }
        )
        decisions.append(
            {
                "at": NOW,
                "sourceRecords": [m["rid"] for m in members],
                "decision": "split",
                "key": key,
                "keyRank": "COMBO",
                "ruleId": "S-COMBO",
                "evidence": {"components": component_keys},
                "note": "combination product keyed by the sorted set of component keys; never merged into one component",
            }
        )
    return combos


BIOSIMILAR_SUFFIX = re.compile(r"^([a-z]{5,}(?:-[a-z]+)*)-([a-z]{4})$")
# Four-letter words that end an ordinary substance name and are not FDA biosimilar suffixes.
NOT_A_SUFFIX = {
    "acid", "salt", "base", "free", "gene", "cell", "root", "leaf", "seed", "bark", "wort",
    "plus", "type", "gold", "iron", "zinc", "mate", "alfa", "beta", "gamma", "aqua", "milk",
    "meal", "husk", "peel", "hull", "vera", "gums", "tree", "wood", "bean", "corn", "rice",
    "form", "gene", "acid", "resin", "oleo", "musk", "bulb", "stem", "herb", "pulp", "hair",
    "skin", "bone", "horn", "shell", "egg", "whey", "soya", "kelp", "cake",
}


def biosimilar_suffix(rec: dict) -> str | None:
    """§3.6. A suffixed biologic product name, never a two-word chemical name ending in a word."""
    if rec.get("facts") or not rec.get("isBiologic"):
        return None
    match = BIOSIMILAR_SUFFIX.match(norm_identity(rec["name"] or "").replace(" ", "-"))
    if not match or match.group(2) in NOT_A_SUFFIX:
        return None
    return match.group(2)


def add_relations(pages: list[dict], decisions: list[dict]) -> dict:
    by_key = {p["key"]: p for p in pages}
    by_ik14: dict[str, list[dict]] = defaultdict(list)
    by_family: dict[str, list[dict]] = defaultdict(list)
    for page in pages:
        if page["structure"]:
            by_ik14[page["structure"]["inchikey14"]].append(page)
        fam = name_family(page["displayName"], True)
        if fam:
            by_family[fam].append(page)

    split_counts = Counter()

    # §3.4 / §3.8 — same connectivity, different full key.
    structural_report = []
    for ik14, group in by_ik14.items():
        if len(group) < 2:
            continue
        keys = sorted({p["key"] for p in group})
        if len(keys) < 2:
            continue
        isotope = any(
            (m.get("facts") or {}).get("hasIsotope") for p in group for m in p.get("_members", [])
        )
        stereo_blocks = {k.split("-")[1][:8] for k in keys if len(k.split("-")) > 1}
        protonation_only = not isotope and len(stereo_blocks) == 1
        rule = "S-ISOTOPE" if isotope else "S-STEREO"
        relation = "isotopologue-of" if isotope else "stereoisomer-of"
        anchor = sorted(group, key=lambda p: (not bool(p["existingSlug"]), p["key"]))[0]
        for page in group:
            if page["key"] == anchor["key"]:
                continue
            unspecified = all(
                (m.get("facts") or {}).get("stereoUnspecified") for m in anchor.get("_members", []) if m.get("facts")
            )
            rel_type = "racemate-of" if (relation == "stereoisomer-of" and unspecified) else relation
            page["relations"].append({"type": rel_type, "targetKey": anchor["key"]})
            split_counts[rule] += 1
        decisions.append(
            {
                "at": NOW,
                "sourceRecords": [s["id"] for p in group for s in p["sourceRecords"]],
                "decision": "split",
                "key": None,
                "keyRank": group[0]["keyRank"],
                "ruleId": rule,
                "evidence": {"inchikey14": ik14, "keys": keys},
                "note": "same connectivity block, different full InChIKey (stereo or isotopic layer)",
            }
        )
        structural_report.append(
            {
                "inchikey14": ik14,
                "separatedBy": (
                    "isotopic layer" if isotope
                    else "protonation flag only" if protonation_only
                    else "stereo layer"
                ),
                "explainedBy": None if protonation_only else rule,
                "suspected": bool(protonation_only),
                "pages": [
                    {"key": p["key"], "displayName": p["displayName"],
                     "inchikey": p["structure"]["inchikey"] if p["structure"] else None}
                    for p in group
                ],
            }
        )

    # §3.2 — ester / prodrug names split from the parent they name.
    family_index: dict[str, dict] = {}
    for page in pages:
        fam = name_family(page["displayName"], True)
        if fam and fam not in family_index:
            family_index[fam] = page
    for page in pages:
        for member in page.get("_members", []):
            fam = name_family(member["name"], True)
            if fam and fam not in family_index:
                family_index[fam] = page
    for page in pages:
        words = norm_identity(page["displayName"]).split()
        if len(words) >= 2 and words[-1] in ESTER_WORDS:
            base = " ".join(words[:-1])
            parent = family_index.get(name_family(base, True))
            if parent and parent["key"] != page["key"]:
                page["relations"].append({"type": "ester-of", "targetKey": parent["key"]})
                split_counts["S-ESTER"] += 1
                decisions.append(
                    {
                        "at": NOW,
                        "sourceRecords": [s["id"] for s in page["sourceRecords"]],
                        "decision": "split",
                        "key": page["key"],
                        "keyRank": page["keyRank"],
                        "ruleId": "S-ESTER",
                        "evidence": {"parentKey": parent["key"], "esterWord": words[-1]},
                        "note": "covalent ester of a recorded moiety: distinct structure, distinct page",
                    }
                )
        if any((m.get("prodrug") in (1, "1")) for m in page.get("_members", [])):
            page.setdefault("_prodrug", True)

    # §3.6 — biosimilar four-letter suffix.
    for page in pages:
        member = page.get("_members", [{}])[0]
        if not member.get("biosimilarSuffix"):
            continue
        match = BIOSIMILAR_SUFFIX.match(norm_identity(member["name"]).replace(" ", "-"))
        if not match:
            continue
        originator = family_index.get(name_family(match.group(1).replace("-", " "), True))
        if originator and originator["key"] != page["key"]:
            page["relations"].append({"type": "biosimilar-of", "targetKey": originator["key"]})
            split_counts["S-BIOSIMILAR"] += 1
            decisions.append(
                {
                    "at": NOW,
                    "sourceRecords": [s["id"] for s in page["sourceRecords"]],
                    "decision": "split",
                    "key": page["key"],
                    "keyRank": page["keyRank"],
                    "ruleId": "S-BIOSIMILAR",
                    "evidence": {"originatorKey": originator["key"], "suffix": match.group(2)},
                    "note": "suffixed biosimilar is its own page, linked to the originator",
                }
            )

    # §5.2 nominal duplicate check.
    nominal = []
    for fam, group in by_family.items():
        keys = {p["key"] for p in group}
        if len(keys) < 2:
            continue
        explained = set()
        for page in group:
            for rel in page["relations"]:
                if rel["targetKey"] in keys:
                    explained.add(page["key"])
        unexplained = [p for p in group if p["key"] not in explained]
        if len({p["key"] for p in unexplained}) >= 2:
            nominal.append(
                {
                    "nameFamily": fam,
                    "reason": "equal name families, different canonical keys, no §3 split rule links them",
                    "pages": [
                        {"key": p["key"], "displayName": p["displayName"], "keyRank": p["keyRank"],
                         "inchikey": p["structure"]["inchikey"] if p["structure"] else None,
                         "existingSlug": p["existingSlug"]}
                        for p in unexplained
                    ],
                }
            )

    return {"structural": structural_report, "nominal": nominal, "splitCounts": split_counts}


# --------------------------------------------------------------------------------------------
# worked examples (§6)
# --------------------------------------------------------------------------------------------

EXAMPLES: list[tuple[str, str, list[str]]] = [
    ("3.1 Salts", "metformin / metformin hydrochloride", ["metformin", "metformin hydrochloride"]),
    ("3.1 Salts", "sertraline / sertraline hydrochloride", ["sertraline", "sertraline hydrochloride"]),
    ("3.1 Salts", "bupropion / bupropion hydrochloride", ["bupropion", "bupropion hydrochloride"]),
    ("3.1 Salts", "naltrexone / naltrexone hydrochloride", ["naltrexone", "naltrexone hydrochloride"]),
    ("3.1 Salts", "lithium carbonate vs lithium citrate", ["lithium carbonate", "lithium citrate", "lithium"]),
    ("3.2 Esters", "testosterone / enanthate / cypionate / undecanoate",
     ["testosterone", "testosterone enanthate", "testosterone cypionate", "testosterone undecanoate"]),
    ("3.2 Prodrugs", "valaciclovir / aciclovir", ["valaciclovir", "valacyclovir", "aciclovir", "acyclovir"]),
    ("3.2 Prodrugs", "prednisone / prednisolone", ["prednisone", "prednisolone"]),
    ("3.2 Esters", "nandrolone / nandrolone decanoate", ["nandrolone", "nandrolone decanoate"]),
    ("3.3 INN/USAN", "paracetamol / acetaminophen", ["paracetamol", "acetaminophen"]),
    ("3.3 INN/USAN", "adrenaline / epinephrine", ["adrenaline", "epinephrine"]),
    ("3.3 INN/USAN", "salbutamol / albuterol", ["salbutamol", "albuterol"]),
    ("3.3 INN/USAN", "ciclosporin / cyclosporine", ["ciclosporin", "cyclosporine", "cyclosporin"]),
    ("3.3b Brand", "Glucophage", ["glucophage", "metformin"]),
    ("3.3b Brand / 3.9", "Ozempic / Wegovy / Rybelsus", ["ozempic", "wegovy", "rybelsus", "semaglutide"]),
    ("3.3b Brand / 3.7", "Januvia vs Janumet", ["januvia", "janumet", "sitagliptin"]),
    ("3.5 Codes", "MK-677 / ibutamoren / L-163,191", ["mk 677", "mk677", "ibutamoren", "l 163191", "ibutamoren mesylate"]),
    ("3.5 Codes", "GW501516 / cardarine", ["gw501516", "gw 501516", "cardarine", "endurobol"]),
    ("3.5 Codes", "SR9009 / stenabolic", ["sr9009", "sr 9009", "stenabolic"]),
    ("3.5 Codes", "LGD-4033 / ligandrol", ["lgd 4033", "lgd4033", "ligandrol"]),
    ("3.5 Codes", "RAD-140 / testolone", ["rad 140", "rad140", "testolone"]),
    ("3.5 Codes", "BPC-157", ["bpc 157", "bpc157", "pentadecapeptide bpc 157"]),
    ("3.4 Stereo", "lipoic acid R / S / racemic",
     ["lipoic acid", "alpha lipoic acid", "r lipoic acid", "s lipoic acid", "thioctic acid"]),
    ("3.4 Stereo", "citalopram / escitalopram", ["citalopram", "escitalopram"]),
    ("3.4 Stereo", "omeprazole / esomeprazole", ["omeprazole", "esomeprazole"]),
    ("3.4 Stereo", "modafinil / armodafinil", ["modafinil", "armodafinil"]),
    ("3.6 Biosimilars", "adalimumab and its suffixed products",
     ["adalimumab", "adalimumab atto", "adalimumab adbm", "adalimumab adaz", "adalimumab bwwd"]),
    ("3.6 Biosimilars", "insulin glargine / -yfgn", ["insulin glargine", "insulin glargine yfgn"]),
    ("3.6 Biosimilars", "filgrastim / -sndz", ["filgrastim", "filgrastim sndz", "tbo filgrastim"]),
    ("3.7 Combination", "amoxicillin + clavulanate", ["amoxicillin", "clavulanate potassium", "clavulanic acid", "co amoxiclav"]),
    ("3.7 Combination", "carbidopa + levodopa", ["carbidopa", "levodopa", "carbidopa and levodopa"]),
    ("3.7 Combination", "metformin + sitagliptin", ["metformin", "sitagliptin", "sitagliptin and metformin hydrochloride"]),
    ("3.8 Isotope", "deutetrabenazine / tetrabenazine", ["deutetrabenazine", "tetrabenazine"]),
]


def write_worked_examples(pages: list[dict], path: str) -> int:
    index: dict[str, dict] = {}
    # Priority matters: a page answers first to its own display name, then to the names its source
    # records were filed under, and only then to a synonym some registry attached to it.
    for page in pages:
        key = norm_identity(page["displayName"])
        if key and key not in index:
            index[key] = page
    for page in pages:
        for member in page.get("_members", []):
            key = norm_identity(member["name"])
            if key and key not in index:
                index[key] = page
    for page in pages:
        for synonym in page["synonyms"]:
            key = norm_identity(synonym["name"])
            if key and key not in index:
                index[key] = page

    lines = [
        "# Worked examples — identity resolution (R1)",
        "",
        f"Computed {NOW} by `scripts/corpus-20k/identity/resolve.py` from the joined Phase 0a/0b",
        "sources. Every row is real output: keys are the ones the executor stored, and a name absent",
        "from every source is said to be absent rather than guessed.",
        "",
        "| Class | Names in play | Keys computed | Decision | Rule id | Resulting page(s) |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    produced = 0
    for cls, title, names in EXAMPLES:
        found: dict[str, dict] = {}
        missing = []
        for name in names:
            page = index.get(norm_identity(name))
            if page:
                found.setdefault(page["key"], page)
            else:
                missing.append(name)
        if not found:
            lines.append(
                f"| {cls} | {title} | — | absent | — | none: no source in this corpus records "
                f"{', '.join(names)} |"
            )
            produced += 1
            continue
        keys = "<br>".join(f"`{k}`" for k in sorted(found))
        rules = sorted({p["ruleId"] for p in found.values()})
        rels = sorted({r["type"] for p in found.values() for r in p["relations"]})
        if len(found) == 1:
            decision = "merge" if len(names) > 1 else "single page"
        else:
            decision = "split"
        rule_text = ", ".join(f"`{r}`" for r in rules)
        if rels:
            rule_text += " · relations " + ", ".join(f"`{r}`" for r in rels)
        page_text = "<br>".join(
            f"{p['displayName']}"
            + (f" (existing `{p['existingSlug']}`)" if p["existingSlug"] else " (new)")
            for p in sorted(found.values(), key=lambda x: x["key"])
        )
        note = f" · not found: {', '.join(missing)}" if missing else ""
        lines.append(f"| {cls} | {title}{note} | {keys} | {decision} | {rule_text} | {page_text} |")
        produced += 1
    lines += [
        "",
        "The rendered-overlap check (§5.3) is not in this table: it runs in Phase 2 against the data",
        "each record would render, using the R3 MinHash/LSH harness described in",
        "`docs/specs/overlap-harness.md`.",
        "",
    ]
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    return produced


# --------------------------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------------------------

def main() -> None:
    started = time.time()
    data = stage_join()
    records = stage_keys(data)
    state, decisions = stage_merges(records)
    pages = build_pages(state, records, data, decisions)
    combos = stage_combos(records, pages, decisions)

    stage_frame = pd.DataFrame(
        [{"key": p["key"], "keyRank": p["keyRank"], "ruleId": p["ruleId"], "members": len(p["_members"])}
         for p in pages]
    )
    stage_frame.to_parquet(os.path.join(STAGES, "merges.parquet"))
    batch("identity-merges", 1, os.path.join(STAGES, "merges.parquet"), len(stage_frame),
          note="clusters after §2 precedence and §3 merge rules", done=True)

    combo_frame = pd.DataFrame(
        [{"key": c["key"], "members": len(c["_members"])} for c in combos],
        columns=["key", "members"],
    )
    combo_frame.to_parquet(os.path.join(STAGES, "combos.parquet"))
    batch("identity-combos", 1, os.path.join(STAGES, "combos.parquet"), len(combo_frame),
          note="combination records keyed by sorted component keys (§3.7)", done=True)

    all_pages = pages + combos
    seen_keys: dict[str, int] = {}
    for page in sorted(all_pages, key=lambda p: (p["key"], p["_members"][0]["rid"])):
        if page["key"] in seen_keys:
            seen_keys[page["key"]] += 1
            page["key"] = f"{page['key']}~{seen_keys[page['key']]}"
            ISSUES.append(f"key collision disambiguated: {page['key']}")
        else:
            seen_keys[page["key"]] = 0
    checks = add_relations(all_pages, decisions)

    # decisions log
    dec_path = os.path.join(OUT, "decisions.ndjson")
    with open(dec_path, "w", encoding="utf-8") as handle:
        for row in decisions:
            handle.write(json.dumps(row, default=str) + "\n")

    # canonical.ndjson
    ISSUES.append(
        "Open Targets records the trade names of combination products among a molecule's synonyms, "
        "so a brand synonym carried on a single-moiety page (Eucreas on metformin) is not evidence "
        "that the brand is single-ingredient. Every synonym keeps the source that supplied it. The "
        "§3.3b brand merge was applied only where the record itself resolved to one moiety."
    )
    ISSUES.append(
        "prodrug-of and ester-of relations are emitted only where a name states the modification "
        "(testosterone enanthate -> testosterone). A prodrug whose name does not name its parent "
        "(valaciclovir/aciclovir, prednisone/prednisolone) is split onto its own page correctly, "
        "but carries no relation: no source cleared in Phase 0a/0b records that metabolic "
        "relationship in a parseable field, and R1 forbids inventing one."
    )
    ISSUES.append(
        "A record with no structure can only reach a UNII by matching a name. That match is the "
        "weakest link in this execution: nothing can verify it, and it decides the page such a "
        "record lands on. The count is reported as structurelessRecordsKeyedByNameMatchedUnii and "
        "these rows are the ones Phase 0d reconciliation should read first."
    )
    canon_path = os.path.join(OUT, "canonical.ndjson")
    with open(canon_path, "w", encoding="utf-8") as handle:
        for page in sorted(all_pages, key=lambda p: p["key"]):
            row = {k: v for k, v in page.items() if not k.startswith("_")}
            handle.write(json.dumps(row, default=str) + "\n")

    # summary
    merges = [d for d in decisions if d["decision"] == "merge"]
    splits = [d for d in decisions if d["decision"] == "split"]
    holds = [d for d in decisions if d["decision"] == "hold"]
    by_rule = Counter(d["ruleId"] for d in decisions)
    k_rank = Counter(p["keyRank"] for p in all_pages)

    existing_merged = []
    for page in all_pages:
        slugs = sorted({m["existingSlug"] for m in page["_members"] if m.get("existingSlug")})
        if len(slugs) > 1:
            existing_merged.append({"key": page["key"], "displayName": page["displayName"], "slugs": slugs})
    existing_merged_count = sum(len(e["slugs"]) - 1 for e in existing_merged)

    no_structure = sum(1 for p in all_pages if not p["structure"])
    combinations = sum(1 for p in all_pages if p["isCombination"])
    biologics = sum(1 for p in all_pages if p["isBiologic"])

    suspected = {
        "generatedAt": NOW,
        "spec": "docs/specs/identity-resolution.md §5",
        "structural": checks["structural"],
        "nominal": checks["nominal"],
        "rendered": {
            "status": "deferred",
            "note": "§5.3 (MinHash/LSH candidates, exact positional scoring over rendered data, "
                    "pairs > 0.60) runs in Phase 2 with the R3 harness; it cannot run before the "
                    "corpus is assembled.",
        },
        "counts": {
            "structuralGroups": len(checks["structural"]),
            "structuralSuspected": sum(1 for g in checks["structural"] if g.get("suspected")),
            "nominalGroups": len(checks["nominal"]),
            "total": sum(1 for g in checks["structural"] if g.get("suspected")) + len(checks["nominal"]),
        },
    }
    with open(os.path.join(OUT, "suspected-missed-merges.json"), "w", encoding="utf-8") as handle:
        json.dump(suspected, handle, indent=1, default=str)

    examples = write_worked_examples(all_pages, os.path.join(OUT, "worked-examples.md"))

    summary = {
        "generatedAt": NOW,
        "spec": "docs/specs/identity-resolution.md",
        "script": "scripts/corpus-20k/identity/resolve.py",
        "runtimeSeconds": round(time.time() - started, 1),
        "inputs": data["inputs"],
        "recordUniverse": len(records),
        "canonical": len(all_pages),
        "merges": len(merges),
        "splits": len(splits),
        "holds": len(holds),
        "byRule": dict(sorted(by_rule.items())),
        "kRank": dict(sorted(k_rank.items())),
        "activeSubstanceNameMatches": {
            "ema": sum(1 for p in all_pages if p.get("_ema")),
            "healthCanada": sum(1 for p in all_pages if p.get("_hc")),
        },
        "noStructure": no_structure,
        "combinations": combinations,
        "combinationsWithoutResolvedComponents": sum(
            1 for p in all_pages if p["isCombination"] and not p["relations"]
        ),
        "structurelessRecordsKeyedByNameMatchedUnii": sum(
            1 for r in records if not r.get("facts") and r.get("uniiVia") == "name"
        ),
        "biologics": biologics,
        "existingMergedIntoExisting": {
            "count": existing_merged_count,
            "groups": existing_merged,
        },
        "nameMatchedUniiRejected": len(NAME_UNII_REJECTED),
        "suspectedMissedMerges": suspected["counts"],
        "pubchemLookups": sum(1 for _ in open(PUBCHEM_CACHE, encoding="utf-8")) if os.path.exists(PUBCHEM_CACHE) else 0,
        "workedExamples": examples,
        "issues": ISSUES,
    }
    with open(os.path.join(OUT, "summary.json"), "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=1, default=str)

    batch("identity-outputs", 1, canon_path, len(all_pages), note="canonical pages (one line per page)")
    batch("identity-outputs", 2, dec_path, len(decisions), note="merge/split/hold decisions (§4)")
    batch("identity-outputs", 3, os.path.join(OUT, "summary.json"), 1, note="Phase 0c summary")
    batch("identity-outputs", 4, os.path.join(OUT, "suspected-missed-merges.json"),
          len(checks["structural"]) + len(checks["nominal"]), note="§5.1 structural and §5.2 nominal checks")
    batch("identity-outputs", 5, os.path.join(OUT, "worked-examples.md"), examples,
          note="§6 worked examples computed from real data", done=True)

    print(json.dumps(summary["kRank"]))
    log(f"done in {summary['runtimeSeconds']}s: {len(all_pages):,} canonical pages")


if __name__ == "__main__":
    main()
