"""Step 3.4 independent second opinion on data/revamp/identity/remainder.csv.

Runs without sight of the first pass's verdicts. Each pair is decided on its own recorded
facts, in the evidence order of docs/specs/identity-resolution.md and Phase 3 of
docs/specs/revamp-2026-09.md:

    identical UNII  >  identical full InChIKey  >  identical InChIKey skeleton (form_of)
    >  same name with a different skeleton (different substances)  >  same name, no structure.

Sources read: data/corpus-20k/identity/canonical.ndjson (page records and their structures),
data/corpus-20k/identity/merge-map-pass{2,3}.json (merges an earlier pass already made),
data/sources/gsrs/spine.parquet (UNII, preferred name, substance class, InChIKey, parent
substance, active moiety, synonyms), data/sources/pubchem/mapped.parquet and
data/sources/inxight/mapped.parquet (structure and form_of rows per page), and RDKit for
fragment-parent, counter-ion and element analysis of every SMILES held.

Writes data/revamp/identity/second-opinion.csv with one row per input pair:
page_a, page_b, verdict (merge|separate|form_of), evidence, confidence (high|medium|low).
The evidence string names the rung that fired and the exact values it used, so each verdict
can be traced back to the record that produced it. Prints at most 50 rows.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem.MolStandardize import rdMolStandardize

RDLogger.DisableLog("rdApp.*")

ROOT = Path(__file__).resolve().parents[2]
CANONICAL = ROOT / "data/corpus-20k/identity/canonical.ndjson"
MERGE_MAPS = [
    ROOT / "data/corpus-20k/identity/merge-map-pass2.json",
    ROOT / "data/corpus-20k/identity/merge-map-pass3.json",
]
SPINE = ROOT / "data/sources/gsrs/spine.parquet"
PUBCHEM = ROOT / "data/sources/pubchem/mapped.parquet"
INXIGHT = ROOT / "data/sources/inxight/mapped.parquet"
REMAINDER = ROOT / "data/revamp/identity/remainder.csv"
OUT = ROOT / "data/revamp/identity/second-opinion.csv"

# Vocabulary copied from scripts/corpus-20k/identity/resolve.py so the two passes strip the
# same words. Kept as literals here; the executor's file stays the definition of record.
SALT_AND_FORM_WORDS = re.compile(
    r"\b(?:hydrochloride|hcl|sodium|potassium|calcium|sulfate|sulphate|tartrate|maleate|mesylate|"
    r"besylate|fumarate|succinate|citrate|acetate|phosphate|bitartrate|dihydrate|monohydrate|"
    r"anhydrous|micronized|usp|injection|tablets?|capsules?|oral|solution|suspension|cream|ointment|"
    r"gel|spray|trihydrate|hemihydrate|pentahydrate|sesquihydrate|hydrate|hydrous|hydrobromide|hbr|"
    r"monosodium|disodium|dipotassium|tosylate|edisylate|isethionate|napsylate|xinafoate|pamoate|"
    r"embonate|hyclate|meglumine|dimeglumine|tromethamine|trometamol|nitrate|bromide|chloride|"
    r"gluconate|lactate|malate|magnesium|zinc|carbonate|bicarbonate|iodide|salicylate)\b"
)
ESTER_WORDS = {
    "enanthate", "heptanoate", "cypionate", "decanoate", "undecanoate", "undecylenate",
    "propionate", "phenylpropionate", "isocaproate", "caproate", "hexanoate", "valerate",
    "butyrate", "palmitate", "pivalate", "dipropionate", "furoate", "benzoate", "laurate",
    "acetonide", "octanoate", "stearate", "myristate", "oleate", "buciclate", "diacetate",
    "etabonate", "medoxomil", "axetil", "proxetil", "dipivoxil", "fosil",
}
HYDRATE_WORDS = {"anhydrous", "hydrous", "hydrate", "monohydrate", "dihydrate", "trihydrate",
                 "hemihydrate", "sesquihydrate", "pentahydrate", "micronized", "usp",
                 "unspecified", "form", "solution", "powder", "crystalline"}
NON_ALNUM = re.compile(r"[^a-z0-9]+")
STEREO_TOKENS = {"l", "d", "r", "s", "dl", "rac", "racemic", "alpha", "beta", "gamma", "delta"}
# Words that name an element, a cation or an oxidation state rather than a moiety. §3.1a refuses
# to merge a page onto one of these (magnesium sulfate -> Magnesium, stannous chloride -> Stannous).
ELEMENT_TOKENS = {
    "hydrogen", "ammonium", "ammonia", "sodium", "potassium", "calcium", "magnesium", "zinc",
    "iron", "ferric", "ferrous", "cupric", "cuprous", "copper", "stannous", "stannic", "tin",
    "chromic", "chromous", "chromium", "manganese", "manganous", "mercuric", "mercurous",
    "mercury", "cobaltous", "cobaltic", "cobalt", "thallous", "thallic", "thallium", "bismuth",
    "aluminum", "aluminium", "gallium", "silver", "gold", "platinum", "lithium", "strontium",
    "barium", "nickel", "selenium", "molybdenum", "cation", "anion", "ion", "trisodium",
    "dibasic", "monobasic", "tribasic", "pentaborate", "borate", "oxide", "hydroxide", "acid",
    "unspecified", "form", "elemental", "colloidal", "rubidium", "cesium", "caesium",
}
PARENTHETICAL = re.compile(r"\([^)]*\)")

# Counter-ions that §1 removes: the substance is what remains. Alkali and alkaline-earth
# cations, halides and ammonium carry no separate pharmacology of their own in a salt.
COUNTER_ION_ELEMENTS = {"Na", "K", "Li", "Ca", "Mg", "Cl", "Br", "I", "F", "N", "H", "O", "S", "P", "C", "B"}
INERT_CATIONS = {"Na", "K", "Li", "Ca", "Mg"}
INERT_CATION_WORDS = {"sodium", "potassium", "calcium", "magnesium", "lithium", "ammonium",
                      "monosodium", "disodium", "dipotassium", "trisodium", "hydrogen"}
# Metals whose presence means the metal is the substance being sold, not a counter-ion:
# gallium maltolate, ferric maltol, chromium picolinate, zinc gluconate are drugs about the metal.
ACTIVE_METALS = {
    "Fe", "Zn", "Cr", "Ga", "Al", "Mn", "Cu", "Ag", "Au", "Pt", "Sn", "Bi", "Sb", "Se", "Gd",
    "Tc", "Sr", "Ba", "Co", "Ni", "Mo", "V", "Ti", "Zr", "Y", "La", "Lu", "In", "Tl", "Pb",
    "Hg", "As", "Cd", "Ra", "Re", "Rb", "Cs", "Yb", "Sm", "Ho", "Er", "W", "Nb", "Pd", "Ru",
}


def norm(value: str | None) -> str:
    text = NON_ALNUM.sub(" ", PARENTHETICAL.sub(" ", (value or "").lower())).strip()
    return re.sub(r"\s+", " ", text)


def strip_salt(name: str) -> str:
    return re.sub(r"\s+", " ", SALT_AND_FORM_WORDS.sub(" ", norm(name))).strip()


_struct_cache: dict[str, dict | None] = {}
_uncharger = rdMolStandardize.Uncharger()


def structure_facts(smiles: str | None) -> dict | None:
    """Fragment parent, per-fragment InChIKeys and element inventory for one SMILES."""
    if not smiles:
        return None
    if smiles in _struct_cache:
        return _struct_cache[smiles]
    result = None
    mol = Chem.MolFromSmiles(smiles)
    if mol is not None:
        frags = Chem.GetMolFrags(mol, asMols=True, sanitizeFrags=True)
        frag_rows = []
        for frag in frags:
            try:
                neutral = _uncharger.uncharge(frag)
                frag_rows.append(
                    {
                        "ik": Chem.MolToInchiKey(neutral),
                        "heavy": neutral.GetNumHeavyAtoms(),
                        "carbons": sum(1 for a in neutral.GetAtoms() if a.GetSymbol() == "C"),
                        "elements": {a.GetSymbol() for a in neutral.GetAtoms()},
                    }
                )
            except Exception:
                continue
        if frag_rows:
            try:
                parent = _uncharger.uncharge(rdMolStandardize.FragmentParent(mol))
                parent_ik = Chem.MolToInchiKey(parent)
                parent_carbons = sum(1 for a in parent.GetAtoms() if a.GetSymbol() == "C")
                parent_heavy = parent.GetNumHeavyAtoms()
            except Exception:
                biggest = max(frag_rows, key=lambda r: r["heavy"])
                parent_ik, parent_carbons, parent_heavy = biggest["ik"], biggest["carbons"], biggest["heavy"]
            result = {
                "parent_ik": parent_ik,
                "parent_carbons": parent_carbons,
                "parent_heavy": parent_heavy,
                "nfrags": len(frag_rows),
                "frags": frag_rows,
                "elements": set().union(*(r["elements"] for r in frag_rows)),
            }
    _struct_cache[smiles] = result
    return result


def load_sources() -> dict:
    canon: dict[str, dict] = {}
    for line in CANONICAL.open():
        record = json.loads(line)
        canon[record["key"]] = record

    merge_map: dict[str, str] = {}
    for path in MERGE_MAPS:
        merge_map.update(json.load(path.open()))

    spine = pd.read_parquet(SPINE)
    spine["unii"] = spine["unii"].astype(str)
    by_unii: dict[str, dict] = {}
    by_inchikey: dict[str, list[dict]] = defaultdict(list)
    for row in spine.itertuples(index=False):
        entry = {
            "unii": row.unii,
            "name": row.preferred_name,
            "cls": row.substance_class,
            "ik": row.inchikey,
            "parent": row.parent_unii or "",
            "moiety": row.active_moiety_unii or "",
            "synonyms": row.synonyms,
            "smiles": row.smiles,
        }
        if row.unii and row.unii not in by_unii:
            by_unii[row.unii] = entry
        if isinstance(row.inchikey, str) and len(row.inchikey) > 10:
            by_inchikey[row.inchikey].append(entry)

    # Structures and form_of rows the Phase 2 mappers attached to pages.
    page_structure: dict[str, dict] = {}
    for path in (PUBCHEM, INXIGHT):
        frame = pd.read_parquet(path)
        frame = frame[frame["field"].isin(["structure", "pubchem_structure", "inchikey", "smiles"])]
        for row in frame.itertuples(index=False):
            try:
                value = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            if not isinstance(value, dict):
                continue
            existing = page_structure.setdefault(row.key, {})
            for field in ("inchikey", "smiles", "cid"):
                if value.get(field) and not existing.get(field):
                    existing[field] = value[field]
    return {
        "canon": canon,
        "merge_map": merge_map,
        "by_unii": by_unii,
        "by_inchikey": by_inchikey,
        "page_structure": page_structure,
    }


class Page:
    """Every identity fact held for one corpus page key."""

    def __init__(self, key: str, src: dict):
        self.key = key
        self.record = src["canon"].get(key) or {}
        self.live = key in src["canon"]
        structure = self.record.get("structure") or {}
        mapped = src["page_structure"].get(key, {})
        self.name = self.record.get("displayName") or ""
        self.norm = norm(self.name)
        self.biologic = bool(self.record.get("isBiologic"))
        self.combination = bool(self.record.get("isCombination"))
        self.rank = self.record.get("keyRank")
        # The Inxight join defect: a K1 key can name a different substance form than the page's
        # own unii field, so both are indexed and both are consulted.
        self.uniis: list[str] = []
        if self.record.get("unii"):
            self.uniis.append(self.record["unii"])
        if key.startswith("K1:"):
            key_unii = key.split(":", 1)[1]
            if key_unii not in self.uniis:
                self.uniis.append(key_unii)
        self.key_unii = key.split(":", 1)[1] if key.startswith("K1:") else None
        self.inchikey = structure.get("inchikey") or mapped.get("inchikey")
        self.smiles = structure.get("smiles") or mapped.get("smiles")
        self.facts = structure_facts(self.smiles)
        self.gsrs = [src["by_unii"][u] for u in self.uniis if u in src["by_unii"]]
        # What GSRS calls the substance whose structure this page actually holds.
        self.structure_record = None
        if self.inchikey:
            hits = src["by_inchikey"].get(self.inchikey) or []
            if hits:
                self.structure_record = hits[0]
        self.moieties = {g["moiety"] for g in self.gsrs if g["moiety"]}
        self.parents = {g["parent"] for g in self.gsrs if g["parent"]}
        self.synonyms = set()
        for g in self.gsrs:
            syn = g.get("synonyms")
            if isinstance(syn, str):
                self.synonyms.update(norm(s) for s in syn.split("|") if s)
            elif syn is not None:
                self.synonyms.update(norm(str(s)) for s in list(syn))
        for entry in self.record.get("synonyms") or []:
            self.synonyms.add(norm(entry.get("name")))

    def __repr__(self) -> str:
        return f"<Page {self.key} {self.name}>"


def is_parent_moiety(page: "Page") -> tuple[bool, str]:
    """§3.1a refusal 4: nothing merges onto a bare element, a cation or an inorganic-only record."""
    if page.facts is not None:
        if page.facts["parent_heavy"] < 2 or page.facts["parent_carbons"] < 1:
            return False, (
                f"{page.name} reduces to {page.facts['parent_ik'][:14]} with "
                f"{page.facts['parent_heavy']} heavy atoms and {page.facts['parent_carbons']} carbons"
            )
        return True, ""
    words = [w for w in strip_salt(page.name).split() if w not in STEREO_TOKENS]
    if not words or all(w in ELEMENT_TOKENS for w in words):
        return False, f"'{page.name}' names an element, a cation or an oxidation state, not a moiety"
    return True, ""


def contained_name(long_page: "Page", short_page: "Page") -> list[str] | None:
    """Words the longer name adds, when the shorter name is wholly inside it."""
    long_words = [w for w in norm(long_page.name).split() if w not in STEREO_TOKENS]
    short_words = [w for w in norm(short_page.name).split() if w not in STEREO_TOKENS]
    if not short_words or not long_words:
        return None
    if not set(short_words) <= set(long_words):
        return None
    if all(SALT_AND_FORM_WORDS.fullmatch(w) or w in ELEMENT_TOKENS for w in short_words):
        return None
    extra = [w for w in long_words if w not in short_words]
    return extra or None


def ester_difference(a: Page, b: Page) -> str | None:
    """The ester or acyl word that separates two names, if that is the whole difference."""
    for long_page, short_page in ((a, b), (b, a)):
        extra = contained_name(long_page, short_page)
        if extra and all(w in ESTER_WORDS for w in extra):
            return f"{long_page.name} = {short_page.name} + {'/'.join(extra)}"
        record = long_page.structure_record
        if record:
            short_words = set(norm(short_page.name).split())
            record_extra = [w for w in norm(record["name"]).split() if w not in short_words]
            if record_extra and all(w in ESTER_WORDS for w in record_extra):
                return f"structure on {long_page.key} is GSRS {record['name']} ({record['unii']})"
    return None


def salt_difference(a: Page, b: Page) -> str | None:
    """The salt or hydrate word that separates two names, if that is the whole difference."""
    for long_page, short_page in ((a, b), (b, a)):
        extra = contained_name(long_page, short_page)
        if not extra or any(w in ESTER_WORDS for w in extra):
            continue
        if not all(SALT_AND_FORM_WORDS.fullmatch(w) for w in extra):
            continue
        ok, why = is_parent_moiety(short_page)
        if not ok:
            return f"REFUSED {long_page.name} -> {short_page.name}: {why}"
        return f"{long_page.name} = {short_page.name} + {'/'.join(extra)}"
    return None


def structural_relation(a: Page, b: Page) -> tuple[str, str]:
    """How two held structures stand to each other."""
    fa, fb = a.facts, b.facts
    if not fa or not fb:
        return "unknown", ""
    if a.inchikey and b.inchikey and a.inchikey == b.inchikey:
        return "identical", f"both hold InChIKey {a.inchikey}"
    if fa["parent_ik"] == fb["parent_ik"]:
        salt, parent = (a, b) if fa["nfrags"] > fb["nfrags"] else (b, a)
        salt_facts, parent_facts = (fa, fb) if fa["nfrags"] > fb["nfrags"] else (fb, fa)
        organics = {f["ik"] for f in salt_facts["frags"] if f["carbons"] >= 3}
        if len(organics) > 1:
            return "mixed-salt", (
                f"{salt.name} holds {len(organics)} different organic components "
                f"({', '.join(sorted(ik[:14] for ik in organics))}); which one is the moiety is not "
                "a question the structure answers"
            )
        shared = parent_facts["parent_ik"]
        parent_is_page = parent_facts["nfrags"] == 1
        metals = (salt_facts["elements"] - parent_facts["elements"]) & ACTIVE_METALS
        if metals:
            return "metal-complex", (
                f"{salt.name} carries {'/'.join(sorted(metals))} that {parent.name} does not; "
                f"shared organic fragment {shared[:14]} is the ligand, not the substance"
            )
        if not parent_is_page:
            return "sibling-salts", (
                f"both are salts of {shared[:14]}; neither page is that parent moiety"
            )
        if parent_facts["parent_carbons"] < 2:
            return "mineral", (
                f"shared parent {shared[:14]} has {parent_facts['parent_carbons']} carbon atoms; "
                "an inorganic anion is not a moiety a drug page merges onto"
            )
        return "salt-of", f"{salt.name} is {parent.name} ({shared[:14]}) plus counter-ions or solvate"
    if fa["parent_ik"][:14] == fb["parent_ik"][:14] and fa["nfrags"] > 1 and fb["nfrags"] > 1:
        return "sibling-salts", (
            f"both are salts built on {fa['parent_ik'][:14]}; neither page is that parent moiety, "
            f"and the parents differ ({fa['parent_ik']} vs {fb['parent_ik']})"
        )
    if a.inchikey and b.inchikey and a.inchikey[:14] == b.inchikey[:14]:
        return "skeleton", f"InChIKey skeleton {a.inchikey[:14]} shared; {a.inchikey} vs {b.inchikey}"
    if fa["parent_ik"][:14] == fb["parent_ik"][:14]:
        return "skeleton", f"fragment parents share skeleton {fa['parent_ik'][:14]}"
    for holder, other, hf, of_ in ((a, b, fa, fb), (b, a, fb, fa)):
        if of_["parent_ik"] in {f["ik"] for f in hf["frags"]}:
            return "fragment", (
                f"{other.name} appears only as a fragment of {holder.name}, not as its parent moiety"
            )
    return "different", f"different skeletons {fa['parent_ik'][:14]} vs {fb['parent_ik'][:14]}"


def decide(row: dict, src: dict, name_groups: dict) -> tuple[str, str, str]:
    """Return (verdict, evidence, confidence) for one remainder row."""
    evidence = row["ev"]
    key_a = row["page_a"] if isinstance(row["page_a"], str) else None
    key_b = row["page_b"] if isinstance(row["page_b"], str) else None

    # Rung 0 — the pair named a key that an earlier corpus pass already merged away.
    if key_b is None and evidence.get("keys"):
        live = [k for k in evidence["keys"] if k in src["canon"]]
        dead = [k for k in evidence["keys"] if k not in src["canon"]]
        if len(live) == 1 and len(dead) == 1:
            survivor, seen = src["merge_map"].get(dead[0]), set()
            while survivor in src["merge_map"] and survivor not in seen:
                seen.add(survivor)
                survivor = src["merge_map"][survivor]
            if survivor == live[0]:
                return (
                    "merge",
                    f"R0 already-merged: corpus merge map records {dead[0]} -> {live[0]}; "
                    f"the two names denote one live page ({Page(live[0], src).name})",
                    "high",
                )
            return (
                "separate",
                f"R0 unresolved: {dead[0]} is not a live page and its recorded survivor is "
                f"{survivor or 'not recorded'}, not {live[0]}",
                "low",
            )

    # Rung 0b — a display-name collision row that carries no second key: decide the page
    # against the other members of its own normalised-name group.
    if key_b is None and evidence.get("normalised"):
        page = Page(key_a, src)
        group = [k for k in name_groups[evidence["normalised"]] if k != key_a]
        for other_key in group:
            other = Page(other_key, src)
            if set(page.uniis) & set(other.uniis):
                return (
                    "merge",
                    f"R0b same UNII inside the '{evidence['normalised']}' name group: {key_a} and "
                    f"{other_key} both hold UNII {sorted(set(page.uniis) & set(other.uniis))[0]}",
                    "high",
                )
            if page.inchikey and page.inchikey == other.inchikey:
                return (
                    "merge",
                    f"R0b same full InChIKey inside the '{evidence['normalised']}' name group: "
                    f"{key_a} and {other_key} both hold {page.inchikey}",
                    "high",
                )
        for other_key in group:
            other = Page(other_key, src)
            if page.inchikey and other.inchikey and page.inchikey[:14] == other.inchikey[:14]:
                return (
                    "form_of",
                    f"R0b same skeleton inside the '{evidence['normalised']}' name group: {key_a} "
                    f"{page.inchikey} vs {other_key} {other.inchikey}; stereo layer differs",
                    "high",
                )
        names = ", ".join(sorted({Page(k, src).name for k in group})[:4])
        return (
            "separate",
            f"R0b distinct substances sharing the normalised name '{evidence['normalised']}': "
            f"{page.name} ({page.inchikey or 'no structure'}) against {names}; "
            "disambiguate on the display name, do not merge",
            "high",
        )

    if key_a is None or key_b is None:
        return ("separate", "R0c the row does not name two keys to compare", "low")

    a, b = Page(key_a, src), Page(key_b, src)

    # Combination records: §3.7 keys a combination by its component set.
    if key_a.startswith("COMBO") and key_b.startswith("COMBO"):
        def components(key: str, recorded: list | None) -> set[str]:
            inside = key[key.index("{") + 1 : key.rindex("}")] if "{" in key else ""
            from_key = {part for part in inside.split(",") if part}
            return from_key or set(recorded or [])

        comp_a = components(key_a, evidence.get("components_a"))
        comp_b = components(key_b, evidence.get("components_b"))
        only_a, only_b = sorted(comp_a - comp_b), sorted(comp_b - comp_a)
        if not only_a and not only_b:
            return ("merge", "RC identical component sets", "high")
        pairs = []
        for x in only_a:
            for y in only_b:
                px, py = Page(x, src), Page(y, src)
                ik_x = px.inchikey or (x.split(":", 1)[1] if x.startswith("IK:") else None)
                ik_y = py.inchikey or (y.split(":", 1)[1] if y.startswith("IK:") else None)
                if ik_x and ik_y and ik_x[:14] == ik_y[:14] and ik_x != ik_y:
                    pairs.append(f"{x} and {y} share skeleton {ik_x[:14]} with different stereo")
        if pairs and len(only_a) == 1 and len(only_b) == 1:
            return (
                "form_of",
                "RC the component sets differ only in the stereo form of one component: " + "; ".join(pairs),
                "medium",
            )
        names_a = ", ".join(Page(x, src).name or x for x in only_a) or "nothing"
        names_b = ", ".join(Page(y, src).name or y for y in only_b) or "nothing"
        return (
            "separate",
            f"RC different products under §3.7: {key_a} adds {names_a}, {key_b} adds {names_b}",
            "high",
        )

    # The Inxight join defect (2026-09-05): a K1 page's unii field can name a different substance
    # form than its key. Where both pages carry a key UNII and those keys are separately registered
    # substances, the key is authoritative and a shared field value is an artefact of that join.
    join_defect = ""
    if a.key_unii and b.key_unii and a.key_unii != b.key_unii:
        ga, gb = src["by_unii"].get(a.key_unii), src["by_unii"].get(b.key_unii)
        if ga and gb and norm(ga["name"]) != norm(gb["name"]):
            shared_by_field = {
                u for u in set(a.uniis) & set(b.uniis) if u != a.key_unii or u != b.key_unii
            }
            if shared_by_field:
                dropped = shared_by_field
                join_defect = (
                    f" (the shared UNII {sorted(dropped & set(a.uniis) & set(b.uniis))[0]} sits in a "
                    "page unii field, not in either page key, and is the known Inxight join defect)"
                )
                a.uniis = [a.key_unii]
                b.uniis = [b.key_unii]
                a.moieties = {g["moiety"] for g in [ga] if g["moiety"]}
                b.moieties = {g["moiety"] for g in [gb] if g["moiety"]}
                a.parents = {g["parent"] for g in [ga] if g["parent"]}
                b.parents = {g["parent"] for g in [gb] if g["parent"]}
                a.gsrs, b.gsrs = [ga], [gb]

    shared_unii = sorted(set(a.uniis) & set(b.uniis))
    relation, relation_note = structural_relation(a, b)
    ester = ester_difference(a, b)
    salt = salt_difference(a, b)

    # Rung 1 — identical UNII, unless an exception class in §3 separates the two records.
    if shared_unii:
        unii = shared_unii[0]
        for holder, other in ((a, b), (b, a)):
            rec = holder.structure_record
            if rec and rec["unii"] and rec["unii"] != unii:
                rec_words = norm(rec["name"]).split()
                other_words = norm(other.name).split()
                covers_other = other_words and all(
                    any(w[:5] == r[:5] for r in rec_words) for w in other_words
                )
                added = [
                    w for w in rec_words
                    if not any(w[:5] == o[:5] for o in other_words) and len(w) > 2 and not w.isdigit()
                ]
                if covers_other and added and all(w in HYDRATE_WORDS for w in added):
                    return (
                        "merge",
                        f"R1h identical UNII {unii}; the structure on {holder.key} is GSRS "
                        f"{rec['name']} ({rec['unii']}), the same substance as {other.name} with "
                        f"{'/'.join(added)} on the name. §3.1 removes solvates and hydrates",
                        "high",
                    )
                added = [w for w in added if w not in HYDRATE_WORDS]
                if covers_other and added and holder.facts and holder.facts["nfrags"] == 1:
                    return (
                        "form_of",
                        f"R1x §3.2 exception to the shared UNII {unii}: the structure on {holder.key} is "
                        f"GSRS {rec['name']} ({rec['unii']}), one covalent molecule that adds "
                        f"{'/'.join(added)} to {other.name}. An ester or acyl derivative is a distinct "
                        "substance, so the pages split and link",
                        "high",
                    )
                if covers_other and added and holder.facts and holder.facts["nfrags"] > 1:
                    return (
                        "merge",
                        f"R1s §3.1 the structure on {holder.key} is GSRS {rec['name']} ({rec['unii']}), "
                        f"{holder.facts['nfrags']} fragments: {other.name} plus {'/'.join(added)} as a "
                        "counter-ion or solvate, which §3.1 removes",
                        "high",
                    )
                rec_ester = [w for w in rec_words if w in ESTER_WORDS]
                if rec_ester and not (set(rec_ester) & set(other_words)):
                    return (
                        "form_of",
                        f"R1x §3.2 exception to the shared UNII {unii}: the structure on {holder.key} is "
                        f"GSRS {rec['name']} ({rec['unii']}), the {'/'.join(rec_ester)} ester of "
                        f"{other.name}. An ester is a distinct covalent substance, so the pages split "
                        "and link ester-of",
                        "high",
                    )
                if rec["moiety"] == unii and (ester or relation in ("skeleton", "different", "fragment")):
                    detail = ester or f"GSRS names that structure {rec['name']} ({rec['unii']})"
                    return (
                        "form_of",
                        f"R1x §3.2 exception to the shared UNII {unii}: the structure on {holder.key} is "
                        f"the registered substance {rec['name']} ({rec['unii']}), whose FDA active moiety "
                        f"is {unii}; {detail}. Covalent derivative, so the pages split and link",
                        "high",
                    )
                hydrate_words = {"anhydrous", "hydrate", "monohydrate", "dihydrate", "trihydrate"}
                rec_words = set(norm(rec["name"]).split())
                other_rec = other.structure_record
                other_words = set(norm(other_rec["name"]).split()) if other_rec else set()
                if other_words and rec_words ^ other_words <= hydrate_words:
                    return (
                        "merge",
                        f"R1h identical UNII {unii}; the two structures are the anhydrous and hydrated "
                        f"forms of one substance (GSRS {rec['name']} / {other_rec['name']}). "
                        "§3.1 removes solvates and hydrates",
                        "high",
                    )
                if rec_words and not (rec_words & set(norm(other.name).split())) and not (
                    rec_words & set(norm(holder.name).split())
                ):
                    return (
                        "separate",
                        f"R1z the structure on {holder.key} is GSRS {rec['name']} ({rec['unii']}), a "
                        f"substance neither page is named for; {other.name} ({unii}) is a different "
                        "substance and the shared UNII field on that page is wrong",
                        "high",
                    )
                if rec["moiety"] and rec["moiety"] != unii:
                    return (
                        "separate",
                        f"R1y the structure on {holder.key} is GSRS {rec['name']} ({rec['unii']}), active "
                        f"moiety {rec['moiety']}, a different substance from {other.name} ({unii})",
                        "high",
                    )
        if relation in ("identical", "salt-of") or a.facts is None or b.facts is None:
            note = relation_note or "one page holds no structure of its own"
            confidence = "high"
            if a.facts is None or b.facts is None:
                note += "; §2 keys biologics and name-only records on UNII alone"
            registered = (src["by_unii"].get(unii) or {}).get("ik")
            held = [p.inchikey for p in (a, b) if p.inchikey]
            if registered and held and registered not in held:
                note += (
                    f"; GSRS registers {unii} with InChIKey {registered}, which is not the structure "
                    f"either page holds ({', '.join(held)}), so the structure field needs a fix"
                )
                confidence = "medium"
            return ("merge", f"R1 identical UNII {unii}; {note}", confidence)
        if relation == "skeleton":
            return (
                "merge",
                f"R1 identical UNII {unii} outranks the stereo split: {relation_note}; both pages are "
                f"named {a.name}/{b.name} and GSRS registers one substance under it (§3.4 stereo accident)",
                "medium",
            )
        return (
            "merge",
            f"R1 identical UNII {unii}, but the two held structures disagree ({relation_note}); "
            "the registry identifier is the stronger evidence and the structure conflict needs a data fix",
            "medium",
        )

    # Rung 2 — identical full InChIKey.
    if relation == "identical":
        return ("merge", f"R2 identical full InChIKey: {relation_note}", "high")

    # Rung 3 — identical skeleton, different full key: form_of, never merge.
    if relation == "skeleton":
        same_name = a.norm == b.norm or a.norm in b.synonyms or b.norm in a.synonyms
        if same_name:
            return (
                "form_of",
                f"R3 {relation_note}; the records carry the same name ({a.name} / {b.name}) so the "
                "difference is the stereo or protonation layer alone. §3.2 links these, never merges",
                "medium",
            )
        return (
            "form_of",
            f"R3 {relation_note}; stereoisomer, isotopologue or protonation form under §3.4/§3.8",
            "high",
        )

    # Rung 4 — one page is the parent moiety and the other adds counter-ions or solvate. FDA's
    # recorded active moiety decides whether the counter-ion is the substance being sold, so a
    # mineral salt (calcium citrate, magnesium gluconate) does not fall into its organic acid.
    if relation == "salt-of":
        salt_page = a if (a.facts and b.facts and a.facts["nfrags"] > b.facts["nfrags"]) else b
        parent_page = b if salt_page is a else a
        recorded = sorted({m for m in salt_page.moieties if m})
        if recorded and not (set(recorded) & set(parent_page.uniis)):
            moiety_names = [
                (src["by_unii"].get(m) or {}).get("name") or m for m in recorded
            ]
            return (
                "separate",
                f"R4a {relation_note}, but FDA records the active moiety of {salt_page.name} as "
                f"{'/'.join(moiety_names)} ({'/'.join(recorded)}), not {parent_page.name}; the "
                "counter-ion is the substance being recorded and the organic acid is its carrier",
                "high",
            )
        if recorded:
            return (
                "merge",
                f"R4 §3.1 salt or solvate: {relation_note}; FDA records the active moiety of "
                f"{salt_page.name} as {parent_page.name} ({sorted(set(recorded) & set(parent_page.uniis))[0]})",
                "high",
            )
        return (
            "merge",
            f"R4 §3.1 salt or solvate: {relation_note}; GSRS records no active moiety for "
            f"{salt_page.name}, so the structure is the only evidence",
            "medium",
        )
    if relation == "metal-complex":
        return (
            "separate",
            f"R4x §1 the removed fragment is not a counter-ion: {relation_note}",
            "high",
        )
    if relation == "sibling-salts":
        return (
            "separate",
            f"R4y {relation_note}; §3.1 merges a salt into its parent, and that parent is not "
            "either of these two pages",
            "high",
        )
    if relation == "mineral":
        return ("separate", f"R4z {relation_note}", "high")
    if relation == "fragment":
        return ("separate", f"R4w {relation_note}", "high")

    # Rung 6 — GSRS names the other page only as the parent of a mixed salt: a coformer.
    for holder, other in ((a, b), (b, a)):
        if holder.parents & set(other.uniis) and holder.key_unii and holder.key_unii in holder.moieties:
            return (
                "separate",
                f"R6 the GSRS record on {holder.key} is a mixed salt whose active moiety is "
                f"{holder.name} ({holder.key_unii}); {other.name} is named only as its parent "
                "substance, which is the coformer or counter-ion, not the same substance",
                "high",
            )

    # Rung 5 — FDA active moiety. §1 warns that GSRS de-esterifies, so an ester still splits.
    for holder, other in ((a, b), (b, a)):
        if holder.moieties & set(other.uniis):
            moiety = sorted(holder.moieties & set(other.uniis))[0]
            if ester:
                return (
                    "form_of",
                    f"R5x FDA records {other.name} ({moiety}) as the active moiety of {holder.name}, "
                    f"but the difference is covalent: {ester}. §3.2 splits and links",
                    "high",
                )
            ok, why = is_parent_moiety(other)
            if not ok:
                return (
                    "separate",
                    f"R5z FDA gives {other.name} ({moiety}) as the active moiety of {holder.name}, but "
                    f"§3.1a refuses a merge onto it: {why}",
                    "high",
                )
            return (
                "merge",
                f"R5 FDA active moiety: GSRS gives {other.name} ({moiety}) as the active moiety of "
                f"{holder.name}" + (f"; {salt}" if salt else ""),
                "high" if salt else "medium",
            )

    for holder, other in ((a, b), (b, a)):
        if holder.parents & set(other.uniis):
            if salt and not ester:
                return (
                    "merge",
                    f"R6b GSRS gives {other.name} as the parent substance of {holder.name} and the "
                    f"names differ by salt or hydrate words alone: {salt}",
                    "medium",
                )
            if ester:
                return (
                    "form_of",
                    f"R6c GSRS gives {other.name} as the parent substance of {holder.name}, but the "
                    f"difference is covalent: {ester}",
                    "high",
                )
            parent_ok, parent_why = is_parent_moiety(other)
            child_tokens = [w for w in norm(holder.name).split() if w not in STEREO_TOKENS]
            parent_tokens = [w for w in norm(other.name).split() if w not in STEREO_TOKENS]
            active_metal = [w for w in child_tokens if w in ELEMENT_TOKENS and w not in INERT_CATION_WORDS]

            def matches_parent(word: str) -> bool:
                return any(word[:5] == token[:5] for token in parent_tokens if len(token) >= 4)

            recorded = sorted({m for m in holder.moieties if m})
            if recorded and not (set(recorded) & set(other.uniis)):
                moiety_names = [(src["by_unii"].get(m) or {}).get("name") or m for m in recorded]
                return (
                    "separate",
                    f"R6a GSRS names {other.name} as the parent substance of {holder.name}, but it "
                    f"records the active moiety as {'/'.join(moiety_names)} ({'/'.join(recorded)}); "
                    "the counter-ion is the substance being recorded",
                    "high",
                )
            if parent_ok and not active_metal and all(
                w in INERT_CATION_WORDS or SALT_AND_FORM_WORDS.fullmatch(w) or matches_parent(w)
                for w in child_tokens
            ):
                return (
                    "merge",
                    f"R6e GSRS gives {other.name} as the parent substance of {holder.name}, and every "
                    f"word of '{holder.name}' is either {other.name} itself or an inert counter-ion; "
                    "§3.1 merges the salt into the parent moiety",
                    "medium",
                )
            if active_metal:
                return (
                    "separate",
                    f"R6d GSRS names {other.name} as the parent substance of {holder.name}, but "
                    f"{holder.name} is a {'/'.join(active_metal)} compound: the metal is the substance "
                    f"being recorded and {other.name} is its ligand or counter-ion",
                    "high",
                )
            if not parent_ok:
                return (
                    "separate",
                    f"R6f GSRS names {other.name} as the parent substance of {holder.name}, but §3.1a "
                    f"refuses a merge onto it: {parent_why}",
                    "high",
                )
            return (
                "separate",
                f"R6d GSRS names {other.name} as the parent substance of {holder.name}, yet nothing "
                "in the names or structures makes one a salt or solvate of the other; the link runs "
                "through a coformer",
                "medium",
            )


    # Rung 7 — names alone, and only where there is no structure pair to compare.
    if relation not in ("unknown", "mixed-salt"):
        return (
            "separate",
            f"R8s the two held structures settle it: {relation_note}; a name rule does not overrule "
            "a structure comparison",
            "high",
        )
    if relation == "mixed-salt":
        return (
            "separate",
            f"R8m {relation_note}; §3.1 merges a salt into one parent moiety and no register names "
            f"{a.name} and {b.name} as one substance",
            "medium",
        )
    if salt and salt.startswith("REFUSED"):
        return (
            "separate",
            f"R7z §3.1a refuses the name-based merge: {salt[len('REFUSED '):]}",
            "high",
        )
    if salt and not ester:
        confidence = "medium" if (a.facts is None or b.facts is None) else "low"
        return ("merge", f"R7 §3.1/§3.1a salt or hydrate on the register's printed name: {salt}", confidence)
    if ester:
        return ("form_of", f"R7x §3.2 the names differ by an ester or acyl word: {ester}", "high")
    if a.norm == b.norm:
        held = "no structure on either page" if (a.facts is None and b.facts is None) else (
            "only one page holds a structure, so nothing contradicts the shared name"
        )
        return (
            "merge",
            f"R7y identical name '{a.name}' and {held}; UNIIs {a.uniis or 'none'} / {b.uniis or 'none'}, "
            f"substance classes {[g['cls'] for g in a.gsrs]} / {[g['cls'] for g in b.gsrs]}",
            "medium" if (a.gsrs or b.gsrs) else "low",
        )

    # Rung 8 — different substances.
    if relation == "different":
        return (
            "separate",
            f"R8 different substances: {relation_note}; UNIIs {a.uniis or 'none'} vs {b.uniis or 'none'}",
            "high",
        )
    detail = []
    if a.uniis or b.uniis:
        detail.append(f"UNIIs {a.uniis or 'none'} vs {b.uniis or 'none'}")
    if a.inchikey or b.inchikey:
        detail.append(f"InChIKeys {a.inchikey or 'none'} vs {b.inchikey or 'none'}")
    for holder, other in ((a, b), (b, a)):
        tokens = [w for w in strip_salt(holder.name).split() if w not in STEREO_TOKENS]
        if tokens and all(w in ELEMENT_TOKENS for w in tokens):
            return (
                "separate",
                f"R9b '{holder.name}' names an element, a cation or an oxidation state, not a moiety; "
                f"§3.1a refuses a merge between it and {other.name}",
                "high",
            )
    extract_words = {"extract", "extracts", "powder", "powdered", "oil", "oils", "tincture",
                     "dried", "whole", "juice", "leaf", "root", "seed", "flower", "fruit", "bark"}
    for holder, other in ((a, b), (b, a)):
        extra = contained_name(holder, other)
        if extra and all(w in extract_words for w in extra):
            return (
                "separate",
                f"R9c {holder.name} and {other.name} are different registered preparations of one "
                f"organism ({'/'.join(extra)}); §2 K4 merges only on exact name-family equality and "
                "these two families are not equal",
                "medium",
            )
    names_differ = a.gsrs and b.gsrs and norm(a.gsrs[0]["name"]) != norm(b.gsrs[0]["name"])
    if a.uniis and b.uniis and not set(a.uniis) & set(b.uniis) and names_differ:
        return (
            "separate",
            f"R9a two separately registered FDA substances: {a.name} {a.uniis} and {b.name} "
            f"{b.uniis}, preferred names {a.gsrs[0]['name']} and {b.gsrs[0]['name']}; neither is a "
            f"salt, solvate or stereo form of the other by name or by structure{join_defect}",
            "high",
        )
    return (
        "separate",
        f"R9 no shared identifier and no structure pair to compare ({a.name} vs {b.name}); "
        + "; ".join(detail or ["nothing recorded beyond the names"]),
        "low",
    )


def main() -> int:
    src = load_sources()
    frame = pd.read_csv(REMAINDER)
    frame["ev"] = frame["evidence"].map(json.loads)

    name_groups: dict[str, list[str]] = defaultdict(list)
    for _, row in frame.iterrows():
        normalised = row["ev"].get("normalised")
        if normalised and isinstance(row["page_a"], str):
            name_groups[normalised].append(row["page_a"])
        if normalised and isinstance(row["page_b"], str):
            name_groups[normalised].append(row["page_b"])

    rows = []
    verdicts, confidences, rungs = Counter(), Counter(), Counter()
    for _, row in frame.iterrows():
        verdict, evidence, confidence = decide(row, src, name_groups)
        rungs[evidence.split(" ", 1)[0]] += 1
        verdicts[verdict] += 1
        confidences[confidence] += 1
        rows.append(
            {
                "page_a": row["page_a"] if isinstance(row["page_a"], str) else "",
                "page_b": row["page_b"] if isinstance(row["page_b"], str) else "",
                "verdict": verdict,
                "evidence": evidence,
                "confidence": confidence,
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["page_a", "page_b", "verdict", "evidence", "confidence"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"pairs {len(rows)} -> {OUT.relative_to(ROOT)}")
    print("verdicts " + json.dumps(dict(verdicts)))
    print("confidence " + json.dumps(dict(confidences)))
    print("rung " + json.dumps(dict(sorted(rungs.items()))))
    if "--sample" in sys.argv:
        for record in rows[:40]:
            print(f"  {record['verdict']:9s} {record['confidence']:6s} {record['evidence'][:120]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
