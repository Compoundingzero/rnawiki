#!/usr/bin/env python
"""Step 3.2: resolve corpus page identity against the molecular spine attached in 3.1.

The rules and their order are fixed by `docs/specs/revamp-2026-09.md` Phase 3.2 and
`docs/specs/identity-resolution.md`:

    R1  identical UNII                     -> merge, unless an exception class applies
    R2  identical full InChIKey            -> merge
    R3  identical skeleton, keys differ    -> keep separate, link form_of both ways, write a form note
    R4  same normalised name, different skeleton -> different substances; disambiguate the display name
    R5  same normalised name, no structure on either side -> review list

Exception classes that never merge, whatever the identifiers say: combination products (§3.7),
biosimilars (§3.6), stereoisomers (§3.4), esters and prodrugs (§3.2), isotopologues (§3.8) and
metal complexes that differ in their metal.

Candidate pairs come from every source of evidence that links two corpus pages: a shared UNII, a
shared full InChIKey, a shared InChIKey skeleton, a shared normalised name (salt and stereo words
stripped with `scripts/revamp/salts.txt`), and the GSRS salt/parent, enantiomer/racemate, active
moiety and mixture-membership relationships. Within one evidence group every page is paired with
the group's survivor candidate: that covers every page and every decision the group can produce,
and a full clique adds no further information to a merge map or a relation edge.

The named identity backlog runs through the same rules: the 697 suspected merges, the 214 slug
collisions, the 55 held `CONFLICT-K1-K2` records and the items the lead recorded in
`data/revamp/phase1-reading-backlog.md`.

    identity_resolve.py --out-dir data/revamp/identity \
        --decisions data/revamp/identity-decisions.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

import pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem import Descriptors, inchi as rd_inchi
from rdkit.Chem import rdMolDescriptors

RDLogger.DisableLog("rdApp.*")

ROOT = Path(__file__).resolve().parents[2]
CANONICAL = ROOT / "data/corpus-20k/identity/canonical.ndjson"
ATTACHED = ROOT / "data/revamp/identity/spine-attached.parquet"
PAGE_SLUGS = ROOT / "data/revamp/identity/page-slugs.csv"
GSRS_SPINE = ROOT / "data/sources/gsrs/spine.parquet"
GSRS_MAPPED = ROOT / "data/sources/gsrs/mapped.parquet"
PUBCHEM_MAPPED = ROOT / "data/sources/pubchem/mapped.parquet"
PUBCHEM_UNMATCHED = ROOT / "data/revamp/pubchem-unmatched-pages.csv"
INXIGHT_MAPPED = ROOT / "data/sources/inxight/mapped.parquet"
SALTS = ROOT / "scripts/revamp/salts.txt"
SUSPECTED = ROOT / "data/corpus-20k/identity/suspected-missed-merges.json"
COLLISIONS = ROOT / "data/corpus-20k/identity/slug-collisions-pass2.json"
DECISIONS_IN = ROOT / "data/corpus-20k/identity/decisions.ndjson"
REGISTRY_MATCHES = ROOT / "data/corpus-20k/registry/matches"
IDENTITY_KEYS = ROOT / "data/corpus-20k/identity/stages/keys.parquet"

MAX_PRINT_ROWS = 50

# Covalent modifications: an ester or a prodrug is its own substance (§3.2) and never merges.
ESTER_WORDS = {
    "acetate", "acetonide", "aceponate", "benzoate", "besylate", "butyrate", "caproate",
    "caprylate", "cipionate", "cypionate", "decanoate", "dipropionate", "enantate", "enanthate",
    "furoate", "heptanoate", "hexanoate", "isobutyrate", "laurate", "monohydrate ester",
    "octanoate", "oleate", "palmitate", "phenylpropionate", "pivalate", "propionate",
    "undecanoate", "undecylenate", "valerate",
}

# Leading or trailing stereo descriptors removed when two names are compared for the same substance.
STEREO_TOKENS = {
    "r", "s", "rs", "sr", "rac", "racemic", "racemate", "d", "l", "dl", "levo", "dextro",
    "e", "z", "plus", "minus",
}

# Counter-ion words that a register prints in front of the moiety name rather than behind it, so
# `Sodium Hyaluronate` and `Hyaluronate` are one moiety under §3.1. Only the counter-ions §3.1
# contemplates are here: group 1 and group 2 metals, ammonium and the organic salt formers. A
# transition metal, a lanthanide or a radionuclide is part of what the substance is, not a
# counter-ion, so those names are deliberately absent.
CATION_WORDS = {
    "sodium", "disodium", "trisodium", "tetrasodium", "monosodium", "potassium", "dipotassium",
    "tripotassium", "monopotassium", "calcium", "hemicalcium", "dicalcium", "magnesium",
    "lithium", "barium", "strontium", "ammonium", "diammonium", "meglumine", "dimeglumine",
    "diolamine", "olamine", "trolamine", "benzathine", "choline", "tromethamine", "betaine",
}

# Group 1 and group 2 metals: the only metals that make a counter-ion rather than a substance.
COUNTER_ION_METALS = {"Li", "Na", "K", "Rb", "Cs", "Be", "Mg", "Ca", "Sr", "Ba"}

# Chemical-class and property words. A page whose name ends in one of these names a family of
# substances, not a substance; combined with a GSRS and a PubChem non-match it goes to review.
CLASS_WORDS = {
    "acids", "alcohols", "aldehydes", "alkaloids", "alkylglycerols", "amides", "amines",
    "anthocyanins", "anthocyanosides", "bioflavonoids", "carotenoids", "catechins", "ceramides",
    "esters", "flavanols", "flavanones", "flavones", "flavonoids", "flavonones", "glucosides",
    "glycosides", "glycosaminoglycans", "isoflavones", "ketones", "lignans", "lipids", "minerals",
    "oils", "peptides", "phenols", "phospholipids", "phytosterols", "polyamine", "polyamines",
    "polyphenols", "polysaccharides", "proanthocyanidins", "proteins", "saponins", "sterols",
    "steroids", "sugars", "tannins", "terpenes", "terpenoids", "triglycerides", "vitamins",
}

# GSRS writes a relationship type on a substance record as "X->Y", where the substance the record
# points at plays role X and the record itself plays role Y. `Carvedilol` carries
# `SALT/SOLVATE->PARENT -> CARVEDILOL HYDROCHLORIDE`: the target is the salt, the record the parent.
# Every type is reduced to the role the target plays, so no later code has to re-read the direction.
GSRS_TARGET_ROLE = {
    "SALT/SOLVATE->PARENT": "target_is_salt",
    "SOLVATE->ANHYDROUS": "target_is_salt",
    "PARENT->SALT/SOLVATE": "target_is_parent",
    "ANHYDROUS->SOLVATE": "target_is_parent",
    "ENANTIOMER->RACEMATE": "target_is_enantiomer",
    "RACEMATE->ENANTIOMER": "target_is_racemate",
}
INVERSE_ROLE = {
    "target_is_salt": "target_is_parent",
    "target_is_parent": "target_is_salt",
    "target_is_enantiomer": "target_is_racemate",
    "target_is_racemate": "target_is_enantiomer",
    "target_is_mixture": "target_is_component",
    "target_is_component": "target_is_mixture",
    "target_is_active_moiety": "target_is_active_moiety",
}

METAL_ATOMIC_NUMBERS = (
    set(range(21, 31)) | set(range(39, 49)) | set(range(72, 81))
    | {3, 4, 11, 12, 13, 19, 20, 31, 32, 37, 38, 49, 50, 51, 55, 56, 81, 82, 83, 88}
    | set(range(57, 72)) | set(range(89, 104))
)

# Counter-ion and solvate fragments, keyed by the fragment's InChIKey skeleton. Every name here is
# the ordinary salt name a label would print.
COUNTER_ION_BY_SKELETON = {
    "VEXZGXHMUGYJMC": "hydrochloride",     # HCl
    "CPELXLSAUQHCOX": "hydrobromide",      # HBr
    "XMBWDFGMSWQBCA": "hydroiodide",       # HI
    "XLYOFNOQVPJJNP": "hydrate",           # water
    "QAOWNCQODCNURD": "sulfate",           # sulfuric acid
    "NBIIXXVUZAFLBC": "phosphate",         # phosphoric acid
    "AIRQXVHTDBRLPB": "mesylate",          # methanesulfonic acid (alternate skeleton below)
    "AFVFQIVMOAPDHO": "mesylate",          # methanesulfonic acid
    "KKEYFWRCBNTPAC": "terephthalate",
    "QTBSBXVTEAMEQO": "acetate",
    "KRKNYBCHXYNGOX": "citrate",
    "FEWJPZIEWOKRBE": "tartrate",
    "VZCYOOQTPOCHFL": "fumarate-or-maleate",
    "BTJIUGUIPKRLHP": "nitrate",
    "QAOWNCQODCNURD-SULFURIC": "sulfate",
    "LSNNMFCWUKXFEE": "sulfite",
    "BDAGIHXWWSANSR": "formate",
    "ZMANZCXQSJIPKH": "trolamine",
    "IAZDPXIOMUYVGZ": "dimethyl-sulfoxide",
    "QSJXEFYPDANLFS": "oxalate",
    "MUBZPKHOEPUJKR": "oxalate",
    "YMWUJEATGCHHMB": "dichloromethane",
    "LFQSCWFLJHTTHZ": "ethanolate",
    "OKKJLVBELUTLKV": "methanolate",
    "AFOSIXZFDONLBT": "benzenesulfonate",
    "SRSXLGNVWSONIS": "besylate",
    "JOXIMZWYDAKGHI": "tosylate",
    "ZWEHNKRNPOVVGH": "butanone",
    "NBBJYMSMWIIQGU": "propionaldehyde",
    "KDYFGRWQOYBRFD": "succinate",
    "TYQCGQRIZGCHNB": "phenolate",
    "WHUUTDBJXJRKMK": "glutamate",
    "COLNVLDHVKWLRT": "phenylalaninate",
    "DHMQDGOQFOQNFH": "glycinate",
    "PWKSKIMOESPYIA": "acetylcysteinate",
    "IPCSVZSSVZVIGE": "palmitate",
    "QIQXTHQIDYTFRH": "stearate",
    "ZQPPMHVWECSIRJ": "maleate",
    "WSFSSNUMVMOOMR": "formaldehyde",
    "QGZKDVFQNNGYKY": "ammonium",
    "FAPWRFPIFSIZLT": "sodium-chloride",
    "HEMHJVSKTPXQMS": "sodium-hydroxide",
    "KWYUFKZDYYNOTN": "potassium-hydroxide",
    "PWHULOQIROXLJO": "manganese",
}

# Single-atom or single-ion counter-ions, keyed by the element symbol of the whole fragment.
COUNTER_ION_BY_ELEMENT = {
    "Na": "sodium", "K": "potassium", "Li": "lithium", "Ca": "calcium", "Mg": "magnesium",
    "Zn": "zinc", "Fe": "iron", "Al": "aluminium", "Ba": "barium", "Cl": "chloride",
    "Br": "bromide", "I": "iodide", "F": "fluoride", "Ag": "silver", "Cu": "copper",
    "Mn": "manganese", "Cr": "chromium", "Co": "cobalt", "Ni": "nickel", "Sr": "strontium",
    "Cs": "caesium", "Rb": "rubidium", "Bi": "bismuth", "Pt": "platinum", "Au": "gold",
}

HYDRATE_PREFIX = {1: "mono", 2: "di", 3: "tri", 4: "tetra", 5: "penta", 6: "hexa", 7: "hepta",
                  8: "octa", 9: "nona", 10: "deca"}


# --------------------------------------------------------------------------------------------
# small helpers
# --------------------------------------------------------------------------------------------

def blank(value) -> bool:
    return value is None or (isinstance(value, float) and value != value) or str(value).strip() == ""


def clean(value):
    return None if blank(value) else str(value).strip()


def strip_cations(name: str) -> str:
    tokens = name.split()
    while len(tokens) > 1 and tokens[0] in CATION_WORDS:
        tokens = tokens[1:]
    while len(tokens) > 1 and tokens[-1] in CATION_WORDS:
        tokens = tokens[:-1]
    return " ".join(tokens)


def punct_norm(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", str(text).lower())).strip()


def load_salt_words() -> list[str]:
    words = []
    for line in SALTS.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            words.append(punct_norm(line))
    return sorted({w for w in words if w}, key=lambda w: (-len(w.split()), w))


class NameNormaliser:
    """Normalised name: lower case, punctuation to spaces, salt/form and stereo words removed."""

    def __init__(self, salt_words: list[str]) -> None:
        self.salt_words = salt_words
        self.salt_set = set(salt_words)

    def strip_stereo(self, tokens: list[str]) -> list[str]:
        while tokens and tokens[0] in STEREO_TOKENS:
            tokens = tokens[1:]
        while tokens and tokens[-1] in STEREO_TOKENS:
            tokens = tokens[:-1]
        return tokens

    def strip_salts(self, tokens: list[str]) -> list[str]:
        changed = True
        while changed and len(tokens) > 1:
            changed = False
            for word in self.salt_words:
                parts = word.split()
                if len(tokens) > len(parts) and tokens[-len(parts):] == parts:
                    tokens = tokens[: -len(parts)]
                    changed = True
                    break
        return tokens

    def __call__(self, name: str) -> str:
        tokens = punct_norm(name).split()
        tokens = self.strip_stereo(tokens)
        tokens = self.strip_salts(tokens)
        tokens = self.strip_stereo(tokens)
        return " ".join(tokens)


# --------------------------------------------------------------------------------------------
# structure helpers
# --------------------------------------------------------------------------------------------

_MOL_CACHE: dict[str, object] = {}


def mol_from_smiles(smiles: str | None):
    if not smiles:
        return None
    if smiles not in _MOL_CACHE:
        _MOL_CACHE[smiles] = Chem.MolFromSmiles(smiles)
    return _MOL_CACHE[smiles]


def fragments(mol):
    if mol is None:
        return []
    try:
        return list(Chem.GetMolFrags(mol, asMols=True, sanitizeFrags=True))
    except Exception:
        return list(Chem.GetMolFrags(mol, asMols=True, sanitizeFrags=False))


@lru_cache(maxsize=None)
def _signature_for_smiles(smiles: str) -> tuple[str, str, str]:
    """(InChIKey skeleton, molecular formula, single-element symbol or '') for one fragment."""
    frag = Chem.MolFromSmiles(smiles)
    if frag is None:
        loose = Chem.MolFromSmiles(smiles, sanitize=False)
        if loose is None:
            return "", smiles, ""
        try:
            Chem.SanitizeMol(loose)
            frag = loose
        except Exception:
            symbols = {atom.GetSymbol() for atom in loose.GetAtoms()}
            element = next(iter(symbols)) if len(symbols) == 1 and loose.GetNumAtoms() <= 2 else ""
            return "", smiles, element
    try:
        formula = rdMolDescriptors.CalcMolFormula(frag)
    except Exception:
        formula = smiles
    try:
        key = rd_inchi.MolToInchiKey(frag) or ""
    except Exception:
        key = ""
    symbols = {atom.GetSymbol() for atom in frag.GetAtoms()}
    element = next(iter(symbols)) if len(symbols) == 1 and frag.GetNumAtoms() <= 2 else ""
    return key[:14], formula, element


def fragment_signature(frag) -> tuple[str, str, str]:
    try:
        smiles = Chem.MolToSmiles(frag)
    except Exception:
        smiles = None
    if not smiles:
        return "", "", ""
    return _signature_for_smiles(smiles)


def largest_fragment(mol):
    frags = fragments(mol)
    if not frags:
        return None
    return max(frags, key=lambda f: (f.GetNumHeavyAtoms(), Descriptors.MolWt(f)))


def is_parent_moiety(frag) -> bool:
    """§3.1a: nothing merges onto a single atom or an inorganic-only record."""
    if frag is None:
        return False
    heavy = frag.GetNumHeavyAtoms()
    carbons = sum(1 for atom in frag.GetAtoms() if atom.GetAtomicNum() == 6)
    return heavy >= 2 and carbons >= 1


def counter_ion_name(frag) -> str:
    skeleton, formula, element = fragment_signature(frag)
    if skeleton and skeleton in COUNTER_ION_BY_SKELETON:
        return COUNTER_ION_BY_SKELETON[skeleton]
    if element and element in COUNTER_ION_BY_ELEMENT:
        return COUNTER_ION_BY_ELEMENT[element]
    symbols = {atom.GetSymbol() for atom in frag.GetAtoms()}
    if len(symbols) == 1:
        only = symbols.pop()
        if only in COUNTER_ION_BY_ELEMENT:
            return COUNTER_ION_BY_ELEMENT[only]
    return f"counter-ion {formula}"


def isotope_signature(mol) -> tuple:
    if mol is None:
        return ()
    return tuple(sorted((atom.GetIsotope(), atom.GetSymbol()) for atom in mol.GetAtoms() if atom.GetIsotope()))


def metal_signature(mol) -> tuple:
    if mol is None:
        return ()
    return tuple(sorted({atom.GetSymbol() for atom in mol.GetAtoms()
                         if atom.GetAtomicNum() in METAL_ATOMIC_NUMBERS}))


def stereo_codes(mol) -> tuple:
    if mol is None:
        return ()
    try:
        Chem.AssignStereochemistry(mol, cleanIt=True, force=True)
    except Exception:
        return ()
    codes = []
    for atom in mol.GetAtoms():
        if atom.HasProp("_CIPCode"):
            codes.append((atom.GetIdx(), atom.GetProp("_CIPCode")))
    return tuple(codes)


def net_charge(mol) -> int:
    if mol is None:
        return 0
    return sum(atom.GetFormalCharge() for atom in mol.GetAtoms())


def name_stereo_descriptor(name: str) -> str | None:
    match = re.search(r"\(([RS]|\+|-|RS|SR)\)", str(name).upper())
    if match:
        token = match.group(1)
        return {"R": "(R)", "S": "(S)", "+": "(+)", "-": "(-)"}.get(token, f"({token})")
    return None


# --------------------------------------------------------------------------------------------
# form notes
# --------------------------------------------------------------------------------------------

def page_label(page: dict, other: dict) -> str:
    """The page's display name, qualified when the other page in the note carries the same name."""
    name = page["displayName"]
    if punct_norm(name) != punct_norm(other["displayName"]):
        return name
    if page.get("unii"):
        return f"{name} (UNII {page['unii']})"
    if page.get("inchikey"):
        return f"{name} (structure {page['inchikey']})"
    return f"{name} (record {page['key']})"


def form_note(child: dict, parent: dict, relation_hint: str | None) -> tuple[str, str]:
    """One line describing how `child` differs from `parent`, plus the relation name."""
    child_name = page_label(child, parent)
    parent_name = page_label(parent, child)
    cm = mol_from_smiles(child.get("smiles"))
    pm = mol_from_smiles(parent.get("smiles"))

    # Isotopic labelling, §3.8.
    ci, pi = isotope_signature(cm), isotope_signature(pm)
    if ci != pi and (ci or pi):
        extra = [f"{iso}{sym}" for iso, sym in (set(ci) - set(pi))] or [f"{iso}{sym}" for iso, sym in (set(pi) - set(ci))]
        label = ", ".join(sorted(extra))
        if ci and not pi:
            return f"{child_name} is the {label} labelled form of {parent_name}.", "isotopologue_of"
        if pi and not ci:
            return f"{child_name} is the unlabelled form of {parent_name}, which carries {label}.", "isotopologue_of"
        return f"{child_name} and {parent_name} differ in isotopic labelling ({label}).", "isotopologue_of"

    # Salts, solvates and hydrates, §3.1.
    if cm is not None and pm is not None:
        cfrags, pfrags = fragments(cm), fragments(pm)
        c_sig = Counter(fragment_signature(f)[:2] for f in cfrags)
        p_sig = Counter(fragment_signature(f)[:2] for f in pfrags)
        extra = c_sig - p_sig
        missing = p_sig - c_sig
        if extra and not missing:
            by_name: Counter = Counter()
            for frag in cfrags:
                signature = fragment_signature(frag)[:2]
                if extra.get(signature):
                    by_name[counter_ion_name(frag)] += 1
                    extra[signature] -= 1
            if list(by_name) == ["hydrate"]:
                count = by_name["hydrate"]
                prefix = HYDRATE_PREFIX.get(count, f"{count}-")
                return f"{child_name} is the {prefix}hydrate of {parent_name}.", "hydrate_of"
            parts = []
            for ion, count in sorted(by_name.items()):
                parts.append(ion if count == 1 else f"{count} {ion}")
            joined = " and ".join(parts)
            return f"{child_name} is the {joined} salt of {parent_name}.", "salt_of"
        if missing and not extra:
            note, _ = form_note(parent, child, relation_hint)
            return (f"{child_name} is the parent moiety of {parent_name}; {note[0].lower()}{note[1:]}",
                    "parent_of")

    # Stereochemistry, §3.4.
    child_key = child.get("inchikey") or ""
    parent_key = parent.get("inchikey") or ""
    if len(child_key) >= 25 and len(parent_key) >= 25 and child_key[:14] == parent_key[:14]:
        child_block, parent_block = child_key[15:25], parent_key[15:25]
        if child_block != parent_block:
            # docs/specs/phase4-generators.md §15 item 6. A record whose InChIKey carries the
            # undefined-stereo block (UHFFFAOYSA) states no configuration at all, so no
            # stereochemical relation to it can be named: neither record is the other's
            # diastereomer or enantiomer, and the note says what the two records do share and what
            # one of them does not record.
            child_flat = child_block.startswith("UHFFFAOYSA")
            parent_flat = parent_block.startswith("UHFFFAOYSA")
            if parent_flat and not child_flat:
                return (f"{child_name} and {parent_name} have the same connectivity; "
                        f"{parent_name} is recorded without stereochemistry."), "stereoisomer_of"
            if child_flat and not parent_flat:
                return (f"{child_name} and {parent_name} have the same connectivity; "
                        f"{child_name} is recorded without stereochemistry."), "stereoisomer_of"
            child_codes, parent_codes = stereo_codes(cm), stereo_codes(pm)
            if child_codes and parent_codes and len(child_codes) == len(parent_codes):
                differing = [
                    (a, b) for a, b in zip(child_codes, parent_codes) if a[1] != b[1]
                ]
                inverted = len(differing) == len(child_codes)
                if inverted and len(child_codes) == 1:
                    return (f"{child_name} is the ({child_codes[0][1]})-enantiomer of {parent_name}, "
                            f"the ({parent_codes[0][1]})-enantiomer."), "stereoisomer_of"
                if inverted:
                    return f"{child_name} is the enantiomer of {parent_name}.", "stereoisomer_of"
                if differing:
                    return f"{child_name} is a diastereomer of {parent_name}.", "stereoisomer_of"
                # §15 item 6, the case mecillinam and amdinocillin are: every recorded stereocentre
                # holds the same configuration in both records, so neither is a stereoisomer of the
                # other in the sense the word carries. The InChIKeys differ elsewhere in the
                # stereochemistry layer — a double bond's geometry, or a centre one record leaves
                # undefined — and the note says exactly that rather than naming a relation the
                # structures do not have.
                return (f"{child_name} and {parent_name} have the same connectivity and the same "
                        f"configuration at every recorded stereocentre; their records differ "
                        f"elsewhere in the InChIKey's stereochemistry layer."), "stereoisomer_of"
            return (f"{child_name} and {parent_name} share the connectivity skeleton "
                    f"{child_key[:14]} and differ in the recorded stereochemistry."), "stereoisomer_of"
        if child_key[-1] != parent_key[-1]:
            delta = net_charge(cm) - net_charge(pm)
            if delta:
                sign = "anion" if delta < 0 else "cation"
                return (f"{child_name} is the {sign} of {parent_name} "
                        f"(net charge difference {delta:+d})."), "ionised_form_of"
            return (f"{child_name} and {parent_name} share the connectivity skeleton "
                    f"{child_key[:14]} and differ only in the InChIKey protonation flag."), "form_of"

    if relation_hint == "target_is_parent":
        return (f"{child_name} is a salt or solvate form of {parent_name}, recorded by the FDA "
                f"substance register."), "salt_of"
    if relation_hint == "target_is_racemate":
        return f"{child_name} is an enantiomer of the racemate {parent_name}.", "stereoisomer_of"
    return (f"{child_name} and {parent_name} are recorded as related forms of one substance by the "
            f"FDA substance register."), "form_of"


# --------------------------------------------------------------------------------------------
# loading
# --------------------------------------------------------------------------------------------

def load_everything(normalise: NameNormaliser) -> dict:
    pages: dict[str, dict] = {}
    order: list[str] = []
    with CANONICAL.open() as handle:
        for line in handle:
            record = json.loads(line)
            structure = record.get("structure") or {}
            key = record["key"]
            order.append(key)
            pages[key] = {
                "key": key,
                "keyRank": record["keyRank"],
                "ruleId": record.get("ruleId"),
                "displayName": record.get("displayName") or key,
                "synonyms": record.get("synonyms") or [],
                "relations": record.get("relations") or [],
                "sourceRecords": record.get("sourceRecords") or [],
                "structure": structure or None,
                "smiles": clean(structure.get("smiles")),
                "isCombination": bool(record.get("isCombination")),
                "isBiologic": bool(record.get("isBiologic")),
                "chemblId": clean(record.get("chemblId")),
                "cid": clean(record.get("cid")),
                "cas": clean(record.get("cas")),
                "rxcui": clean(record.get("rxcui")),
                "drugbankId": clean(record.get("drugbankId")),
                "existingSlug": clean(record.get("existingSlug")),
                "record": record,
            }

    attached = pd.read_parquet(ATTACHED)
    for row in attached.itertuples(index=False):
        page = pages.get(row.key)
        if page is None:
            continue
        page["tier"] = int(row.tier)
        page["unii"] = clean(row.unii)
        page["unii_source"] = clean(row.unii_source)
        page["inchikey"] = clean(row.inchikey)
        page["inchikey_source"] = clean(row.inchikey_source)
        page["inchikey14"] = clean(row.inchikey14)
        page["active_moiety_unii"] = clean(row.active_moiety_unii)
        page["parent_unii"] = clean(row.parent_unii)
        page["substance_class"] = clean(row.substance_class)

    with PAGE_SLUGS.open() as handle:
        for row in csv.DictReader(handle):
            page = pages.get(row["key"])
            if page is not None:
                page["slug"] = clean(row["slug"])
                page["indexable"] = row["indexable"].lower() in ("t", "true")
    for page in pages.values():
        page.setdefault("slug", page.get("existingSlug"))
        page.setdefault("indexable", False)
        page.setdefault("tier", 0)
        for field in ("unii", "inchikey", "inchikey14", "active_moiety_unii", "parent_unii",
                      "substance_class", "unii_source", "inchikey_source"):
            page.setdefault(field, None)
        page["normalised"] = normalise(page["displayName"])

    spine = pd.read_parquet(GSRS_SPINE, columns=["unii", "preferred_name", "substance_class",
                                                 "inchikey", "smiles"])
    spine_by_unii = {}
    for row in spine.itertuples(index=False):
        unii = clean(row.unii)
        if unii:
            spine_by_unii[unii] = {
                "preferred_name": clean(row.preferred_name),
                "substance_class": clean(row.substance_class),
                "inchikey": clean(row.inchikey),
                "smiles": clean(row.smiles),
            }

    gsrs = pd.read_parquet(GSRS_MAPPED, columns=["key", "field", "value", "form_of_target"])
    gsrs_links: list[tuple[str, str, str]] = []          # (page key, target UNII, relationship)
    gsrs_class: dict[str, str] = {}
    for row in gsrs.itertuples(index=False):
        if row.field == "gsrs_substance_class":
            try:
                gsrs_class[row.key] = json.loads(row.value)
            except (TypeError, ValueError):
                gsrs_class[row.key] = str(row.value)
            continue
        if row.field == "gsrs_form_relationships":
            try:
                payload = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            for item in payload or []:
                target = clean(item.get("unii"))
                role = GSRS_TARGET_ROLE.get(str(item.get("type") or ""))
                if target and role:
                    gsrs_links.append((row.key, target, role))
        elif row.field == "gsrs_parent_substance":
            try:
                payload = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            target = clean((payload or {}).get("unii"))
            if target:
                gsrs_links.append((row.key, target, "target_is_parent"))
        elif row.field == "gsrs_active_moiety":
            try:
                payload = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            target = clean((payload or {}).get("unii"))
            if target:
                gsrs_links.append((row.key, target, "target_is_active_moiety"))
        elif row.field == "gsrs_mixture_membership":
            try:
                payload = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            target = clean((payload or {}).get("mixture_unii"))
            if target:
                gsrs_links.append((row.key, target, "target_is_mixture"))

    pubchem = pd.read_parquet(PUBCHEM_MAPPED, columns=["key", "field", "value", "form_of_target"])
    pubchem_pages = set(pubchem[pubchem.field == "cid"].key)
    pubchem_unmatched = set(pd.read_csv(PUBCHEM_UNMATCHED).key)

    primary_target: dict[str, str] = {}
    if INXIGHT_MAPPED.exists():
        inxight = pd.read_parquet(INXIGHT_MAPPED, columns=["key", "field", "value"])
        for row in inxight[inxight.field == "targets"].itertuples(index=False):
            if row.key in primary_target:
                continue
            try:
                payload = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            label = clean((payload or {}).get("label"))
            if label:
                primary_target[row.key] = label

    registry: dict[str, list[dict]] = {}
    for path in sorted(REGISTRY_MATCHES.glob("*.ndjson")):
        with path.open() as handle:
            for line in handle:
                record = json.loads(line)
                registry[record["key"]] = record.get("nctIds") or []

    return {
        "pages": pages,
        "order": order,
        "spine": spine_by_unii,
        "gsrs_links": gsrs_links,
        "gsrs_class": gsrs_class,
        "pubchem_pages": pubchem_pages,
        "pubchem_unmatched": pubchem_unmatched,
        "registry": registry,
        "primary_target": primary_target,
    }


def enrich_smiles(pages: dict[str, dict], spine: dict[str, dict]) -> None:
    """A page with no SMILES of its own borrows the GSRS structure for its UNII, for form notes."""
    for page in pages.values():
        if page["smiles"]:
            continue
        unii = page.get("unii")
        record = spine.get(unii) if unii else None
        if record and record.get("smiles"):
            page["smiles"] = record["smiles"]


# --------------------------------------------------------------------------------------------
# exception classes
# --------------------------------------------------------------------------------------------

COMBO_MEMBER = re.compile(r"(K\d:[^,}]+)")
BIOSIMILAR_SUFFIX = re.compile(r"^([a-z][a-z0-9]+)\s+([a-z]{4})$")


def combo_members(key: str) -> list[str]:
    if not key.startswith("COMBO:{"):
        return []
    return [m.strip() for m in COMBO_MEMBER.findall(key)]


def combo_component_set(key: str) -> frozenset | None:
    members = combo_members(key)
    return frozenset(members) if members else None


def biosimilar_stem(page: dict) -> str | None:
    """`adalimumab-afzb` -> `adalimumab`. The suffix is the FDA's four-letter biosimilar suffix."""
    raw = punct_norm(page["displayName"])
    match = BIOSIMILAR_SUFFIX.match(raw)
    if not match:
        return None
    stem, suffix = match.group(1), match.group(2)
    if len(stem) < 6 or suffix in STEREO_TOKENS or suffix in CLASS_WORDS:
        return None
    if not re.search(r"(mab|cept|tinib|stim|pase|ase|kin|lin)$", stem):
        return None
    return stem


def exception_class(a: dict, b: dict) -> tuple[str, str, str] | None:
    """(class name, relation from a to b, human reason) when the pair must never merge."""
    a_members, b_members = combo_members(a["key"]), combo_members(b["key"])
    if a["isCombination"] != b["isCombination"] or bool(a_members) != bool(b_members):
        combo, single = (a, b) if (a["isCombination"] or a_members) else (b, a)
        relation = "contains" if combo is a else "component_of"
        return ("combination", relation,
                f"{combo['displayName']} is a combination product and {single['displayName']} is a "
                f"single substance; §3.7 keeps a combination record separate from its components.")
    a_stem, b_stem = biosimilar_stem(a), biosimilar_stem(b)
    if a_stem and not b_stem and b["normalised"] == a_stem:
        return ("biosimilar", "biosimilar_of",
                f"{a['displayName']} carries an FDA biosimilar suffix on {b['displayName']}; §3.6 "
                f"keeps each biosimilar on its own page.")
    if b_stem and not a_stem and a["normalised"] == b_stem:
        return ("biosimilar", "originator_of",
                f"{b['displayName']} carries an FDA biosimilar suffix on {a['displayName']}; §3.6 "
                f"keeps each biosimilar on its own page.")
    am, bm = mol_from_smiles(a.get("smiles")), mol_from_smiles(b.get("smiles"))
    # Both structures must be readable before a structural difference can be asserted. A page with
    # no structure on file is not evidence that the two differ.
    if am is not None and bm is not None:
        ai, bi = isotope_signature(am), isotope_signature(bm)
        if ai != bi:
            return ("isotopologue", "isotopologue_of",
                    f"{a['displayName']} and {b['displayName']} differ in their isotopic layer; §3.8 "
                    f"keeps isotopologues separate.")
        # Only a metal bonded into the moiety itself makes two records different substances. A
        # metal sitting in its own fragment is a counter-ion, and §3.1 merges those.
        a_metals = metal_signature(largest_fragment(am))
        b_metals = metal_signature(largest_fragment(bm))
        if a_metals != b_metals:
            return ("metal-complex", "related_form_of",
                    f"{a['displayName']} and {b['displayName']} carry different metal centres "
                    f"({', '.join(a_metals) or 'none'} against {', '.join(b_metals) or 'none'}).")
    a_last = a["displayName"].lower().split()[-1] if a["displayName"].split() else ""
    b_last = b["displayName"].lower().split()[-1] if b["displayName"].split() else ""
    if (a_last in ESTER_WORDS) != (b_last in ESTER_WORDS):
        ester, parent = (a, b) if a_last in ESTER_WORDS else (b, a)
        if ester["normalised"] == parent["normalised"]:
            relation = "ester_of" if ester is a else "parent_of"
            return ("ester", relation,
                    f"{ester['displayName']} is a covalent ester of {parent['displayName']}; §3.2 "
                    f"keeps an ester on its own page.")
    return None


# --------------------------------------------------------------------------------------------
# survivor choice
# --------------------------------------------------------------------------------------------

RANK_ORDER = {"K1": 0, "K2": 1, "K3": 2, "K4": 3, "COMBO": 4, "HOLD": 5, "NONE": 6}

# UNII sources strong enough to license a merge: the two the page itself carries, plus an exact
# full-InChIKey match into the FDA register (Phase 2 mapping rule (b)). A UNII reached through a
# PubChem CID is one hop further out and decides nothing on its own.
PAGE_OWN_UNII_SOURCES = {"page-key", "page-field", "gsrs-by-inchikey"}


def survivor_sort_key(page: dict) -> tuple:
    unii = page.get("unii")
    is_parent = 0 if (unii and (not page.get("parent_unii") or page["parent_unii"] == unii)) else 1
    return (
        is_parent,
        RANK_ORDER.get(page["keyRank"], 9),
        0 if page.get("slug") else 1,
        0 if page.get("indexable") else 1,
        page.get("tier", 9),
        len(page["displayName"]),
        page["key"],
    )


def pick_survivor(members: list[dict]) -> dict:
    return sorted(members, key=survivor_sort_key)[0]


def pick_form_parent(a: dict, b: dict, relation_hint: str | None) -> dict:
    """Which of two pages sharing a skeleton is the parent moiety the other is a form of.

    In order: the direction the FDA substance register records; the page with fewer covalent
    fragments (the unsalted, unsolvated moiety); the page whose InChIKey records no stereochemistry
    (a defined stereoisomer is a form of the unspecified record, §3.4); the page whose name carries
    no stereo descriptor; then the survivor order used everywhere else.
    """
    if relation_hint in ("target_is_parent", "target_is_racemate"):
        return b
    if relation_hint in ("target_is_salt", "target_is_enantiomer"):
        return a
    a_frags = len(fragments(mol_from_smiles(a.get("smiles"))))
    b_frags = len(fragments(mol_from_smiles(b.get("smiles"))))
    if a_frags and b_frags and a_frags != b_frags:
        return a if a_frags < b_frags else b
    a_flat = (a.get("inchikey") or "")[15:25].startswith("UHFFFAOYSA")
    b_flat = (b.get("inchikey") or "")[15:25].startswith("UHFFFAOYSA")
    if a_flat != b_flat:
        return a if a_flat else b
    a_stereo = name_stereo_descriptor(a["displayName"]) is not None
    b_stereo = name_stereo_descriptor(b["displayName"]) is not None
    if a_stereo != b_stereo:
        return b if a_stereo else a
    return pick_survivor([a, b])


# --------------------------------------------------------------------------------------------
# resolution
# --------------------------------------------------------------------------------------------

class Resolver:
    def __init__(self, data: dict, normalise: NameNormaliser) -> None:
        self.pages = data["pages"]
        self.spine = data["spine"]
        self.gsrs_links = data["gsrs_links"]
        self.link_index: dict[tuple[str, str], str] = {}
        for link_key, link_target, link_relation in data["gsrs_links"]:
            self.link_index.setdefault((link_key, link_target), link_relation)
        self.pubchem_pages = data["pubchem_pages"]
        self.pubchem_unmatched = data["pubchem_unmatched"]
        self.registry = data["registry"]
        self.gsrs_class = data["gsrs_class"]
        self.normalise = normalise
        self.decisions: list[dict] = []
        self.relations: list[dict] = []
        self.merge_pairs: list[tuple[str, str, str]] = []
        self.keep_separate: set[tuple[str, str]] = set()
        self.remainder: list[dict] = []
        self.review: list[dict] = []
        self.seen_pairs: set[tuple[str, str]] = set()
        self.pair_origin: dict[tuple[str, str], set[str]] = defaultdict(set)
        self.by_rule: Counter = Counter()
        self.by_rule_named: Counter = Counter()
        self.named_pairs: set[tuple[str, str]] = set()
        self.combination_pending: list[tuple[str, str, str, bool]] = []

    # -- logging ------------------------------------------------------------
    def log(self, a: str, b: str, rule: str, action: str, evidence: dict, named: bool) -> None:
        self.decisions.append(
            {"page_a": a, "page_b": b, "rule": rule, "action": action,
             "evidence": json.dumps(evidence, sort_keys=True, separators=(",", ":"))}
        )
        self.by_rule[rule] += 1
        if named:
            self.by_rule_named[rule] += 1

    def add_relation(self, a: str, b: str, relation: str, note: str, rule: str, evidence: dict) -> None:
        self.relations.append(
            {"page_a": a, "page_b": b, "relation": relation, "note": note, "rule": rule,
             "evidence": json.dumps(evidence, sort_keys=True, separators=(",", ":"))}
        )

    # -- the rule ladder ----------------------------------------------------
    def resolve_pair(self, key_a: str, key_b: str, origin: str, named: bool = False) -> str:
        if key_a == key_b:
            return "same-page"
        pair = tuple(sorted((key_a, key_b)))
        self.pair_origin[pair].add(origin)
        if named:
            self.named_pairs.add(pair)
        if pair in self.seen_pairs:
            return "already-decided"
        a, b = self.pages.get(pair[0]), self.pages.get(pair[1])
        if a is None or b is None:
            return "unknown-page"
        self.seen_pairs.add(pair)

        base = {"origin": origin, "a": a["displayName"], "b": b["displayName"]}

        # §3.7 keys a combination by the sorted set of its component keys. Two combination records
        # whose component sets differ are different products and cannot be merged on one shared
        # identifier; whether their sets become equal depends on how the components themselves
        # resolve, so the pair waits for the combination pass below.
        set_a, set_b = combo_component_set(a["key"]), combo_component_set(b["key"])
        if set_a is not None and set_b is not None and set_a != set_b:
            self.combination_pending.append((a["key"], b["key"], origin, named))
            return "combination-pending"

        exception = exception_class(a, b)
        if exception is not None:
            klass, relation, reason = exception
            note = reason
            self.add_relation(a["key"], b["key"], relation, note, f"EXCEPTION-{klass.upper()}",
                              {**base, "class": klass})
            inverse = {"contains": "component_of", "component_of": "contains",
                       "biosimilar_of": "originator_of", "originator_of": "biosimilar_of",
                       "ester_of": "parent_of", "parent_of": "ester_of"}.get(relation, relation)
            self.add_relation(b["key"], a["key"], inverse, note, f"EXCEPTION-{klass.upper()}",
                              {**base, "class": klass})
            self.keep_separate.add(pair)
            self.log(a["key"], b["key"], f"EXCEPTION-{klass.upper()}", "keep_separate",
                     {**base, "reason": reason}, named)
            return "keep_separate"

        # R1 identical UNII. Only a UNII the page itself carries counts: a UNII this run derived by
        # looking the page's structure up in the spine is a structure match, and is judged by R2/R3.
        if (a["unii"] and b["unii"] and a["unii"] == b["unii"]
                and a["unii_source"] in PAGE_OWN_UNII_SOURCES
                and b["unii_source"] in PAGE_OWN_UNII_SOURCES):
            # §2: a record that resolves to K1 and K2 must agree. Where the shared UNII and the two
            # recorded structures contradict each other the pair is held, never merged by majority.
            if a["inchikey14"] and b["inchikey14"] and a["inchikey14"] != b["inchikey14"]:
                self.remainder.append(
                    {"page_a": a["key"], "page_b": b["key"],
                     "why_unresolved": "the two pages carry the same UNII but different connectivity "
                                       "skeletons; §2 holds a K1/K2 disagreement for a person",
                     "evidence": json.dumps({**base, "unii": a["unii"],
                                             "unii_source_a": a["unii_source"],
                                             "unii_source_b": b["unii_source"],
                                             "inchikey_a": a["inchikey"],
                                             "inchikey_b": b["inchikey"]}, sort_keys=True)})
                self.log(a["key"], b["key"], "CONFLICT-UNII-VS-STRUCTURE", "remainder",
                         {**base, "unii": a["unii"], "inchikey_a": a["inchikey"],
                          "inchikey_b": b["inchikey"]}, named)
                return "remainder"
            survivor = pick_survivor([a, b])
            other = b if survivor is a else a
            self.merge_pairs.append((other["key"], survivor["key"], "R1-IDENTICAL-UNII"))
            self.log(a["key"], b["key"], "R1-IDENTICAL-UNII", "merge",
                     {**base, "unii": a["unii"], "unii_source_a": a["unii_source"],
                      "unii_source_b": b["unii_source"], "survivor": survivor["key"]}, named)
            return "merge"

        # R2 identical full InChIKey
        if a["inchikey"] and b["inchikey"] and a["inchikey"] == b["inchikey"]:
            # §2 ranks the parent UNII above the structure key. Two pages the FDA registers under
            # different UNIIs are different substances even where one structure key describes both
            # (elemental allotropes, differently sourced preparations); they are linked, not merged.
            if a["unii"] and b["unii"] and a["unii"] != b["unii"]:
                note = (f"{page_label(a, b)} and {page_label(b, a)} share the structure key "
                        f"{a['inchikey']} and are registered by the FDA under different UNIIs "
                        f"({a['unii']} and {b['unii']}).")
                self.add_relation(a["key"], b["key"], "same_structure_as", note,
                                  "R2-SAME-STRUCTURE-DIFFERENT-UNII", base)
                self.add_relation(b["key"], a["key"], "same_structure_as", note,
                                  "R2-SAME-STRUCTURE-DIFFERENT-UNII", base)
                self.keep_separate.add(pair)
                self.log(a["key"], b["key"], "R2-SAME-STRUCTURE-DIFFERENT-UNII", "keep_separate",
                         {**base, "inchikey": a["inchikey"], "unii_a": a["unii"],
                          "unii_b": b["unii"]}, named)
                return "keep_separate"
            survivor = pick_survivor([a, b])
            other = b if survivor is a else a
            self.merge_pairs.append((other["key"], survivor["key"], "R2-IDENTICAL-INCHIKEY"))
            self.log(a["key"], b["key"], "R2-IDENTICAL-INCHIKEY", "merge",
                     {**base, "inchikey": a["inchikey"], "inchikey_source_a": a["inchikey_source"],
                      "inchikey_source_b": b["inchikey_source"], "survivor": survivor["key"]}, named)
            return "merge"

        # R3 identical skeleton, different full key
        if a["inchikey14"] and b["inchikey14"] and a["inchikey14"] == b["inchikey14"]:
            parent = pick_form_parent(a, b, self.relation_hint(a, b))
            child = b if parent is a else a
            note, relation = form_note(child, parent, self.relation_hint(child, parent))
            back = (f"{page_label(parent, child)} is the parent form recorded for "
                    f"{page_label(child, parent)}.")
            self.add_relation(child["key"], parent["key"], relation, note, "R3-SAME-SKELETON",
                              {**base, "skeleton": a["inchikey14"]})
            self.add_relation(parent["key"], child["key"], "form_of", back, "R3-SAME-SKELETON",
                              {**base, "skeleton": a["inchikey14"]})
            self.keep_separate.add(pair)
            self.log(a["key"], b["key"], "R3-SAME-SKELETON", "form_of",
                     {**base, "skeleton": a["inchikey14"], "inchikey_a": a["inchikey"],
                      "inchikey_b": b["inchikey"], "relation": relation, "note": note}, named)
            return "form_of"

        # R4 same normalised name, different skeleton
        if a["normalised"] and a["normalised"] == b["normalised"]:
            if a["inchikey14"] and b["inchikey14"]:
                self.keep_separate.add(pair)
                self.log(a["key"], b["key"], "R4-SAME-NAME-DIFFERENT-SKELETON", "disambiguate",
                         {**base, "normalised": a["normalised"], "skeleton_a": a["inchikey14"],
                          "skeleton_b": b["inchikey14"]}, named)
                return "disambiguate"
            # R5 same name, no structure on either side
            if not a["inchikey14"] and not b["inchikey14"]:
                self.remainder.append(
                    {"page_a": a["key"], "page_b": b["key"],
                     "why_unresolved": "same normalised name and no structure on either page; "
                                       "the identity rules give no evidence that decides them",
                     "evidence": json.dumps({**base, "normalised": a["normalised"],
                                             "unii_a": a["unii"], "unii_b": b["unii"],
                                             "class_a": a["substance_class"],
                                             "class_b": b["substance_class"]}, sort_keys=True)}
                )
                self.log(a["key"], b["key"], "R5-SAME-NAME-NO-STRUCTURE", "review",
                         {**base, "normalised": a["normalised"]}, named)
                return "review"
            # one side has a structure and the other does not
            self.remainder.append(
                {"page_a": a["key"], "page_b": b["key"],
                 "why_unresolved": "same normalised name; one page holds a structure and the other "
                                   "holds none, so no structural rule applies",
                 "evidence": json.dumps({**base, "normalised": a["normalised"],
                                         "inchikey_a": a["inchikey"], "inchikey_b": b["inchikey"],
                                         "unii_a": a["unii"], "unii_b": b["unii"]}, sort_keys=True)}
            )
            self.log(a["key"], b["key"], "R5-SAME-NAME-ONE-STRUCTURE", "review",
                     {**base, "normalised": a["normalised"]}, named)
            return "review"

        return self.resolve_relationship_pair(a, b, origin, named, base)

    INVERSE_RELATION = INVERSE_ROLE

    def relation_hint(self, child: dict, parent: dict) -> str | None:
        parent_unii, child_unii = parent.get("unii"), child.get("unii")
        if parent_unii:
            hit = self.link_index.get((child["key"], parent_unii))
            if hit:
                return hit
        if child_unii:
            hit = self.link_index.get((parent["key"], child_unii))
            if hit:
                return self.INVERSE_RELATION.get(hit, hit)
        return None

    def salt_confirmation(self, child: dict, parent: dict) -> str | None:
        """Evidence that `child` really is a salt or solvate form of `parent`, or None."""
        # Where the FDA records the counter-ion itself as the active moiety, the salt is the
        # medicine and the acid page is not it: lithium citrate is a lithium medicine, calcium
        # gluconate a calcium supplement. Those never merge into the acid.
        moiety = child.get("active_moiety_unii")
        record = self.spine.get(moiety) if moiety else None
        if record and moiety != parent.get("unii"):
            moiety_name = (record.get("preferred_name") or "").strip().upper()
            if moiety_name.endswith(" CATION") or moiety_name in {m.upper() for m in COUNTER_ION_METALS}:
                return None
        cm, pm = mol_from_smiles(child.get("smiles")), mol_from_smiles(parent.get("smiles"))
        if cm is not None and pm is not None:
            child_core, parent_core = largest_fragment(cm), largest_fragment(pm)
            if child_core is not None and parent_core is not None:
                child_key = fragment_signature(child_core)[0]
                parent_key = fragment_signature(parent_core)[0]
                if child_key and child_key == parent_key and is_parent_moiety(parent_core):
                    added = set(metal_signature(cm)) - set(metal_signature(pm))
                    if added - COUNTER_ION_METALS:
                        # A transition metal, a lanthanide or a radionuclide the parent does not
                        # carry is part of what the child substance is, not a counter-ion.
                        return None
                    return "the largest covalent fragment of both pages is the same structure"
            return None
        if not child.get("inchikey") and child["normalised"] and parent["normalised"]:
            child_core = strip_cations(child["normalised"])
            parent_core = strip_cations(parent["normalised"])
            if not parent_core or parent_core in CATION_WORDS or parent_core.endswith(" cation") \
                    or parent_core.endswith(" anion"):
                return None
            if child_core == parent_core:
                return ("the child page holds no structure and its printed name is the parent name "
                        "with salt and counter-ion words removed")
        return None

    def resolve_relationship_pair(self, a: dict, b: dict, origin: str, named: bool,
                                  base: dict) -> str:
        """Pairs linked only by a GSRS relationship, with no shared identifier and no shared name."""
        hint = self.relation_hint(a, b)
        pair = tuple(sorted((a["key"], b["key"])))
        if hint in ("target_is_salt", "target_is_parent"):
            child, parent = (b, a) if hint == "target_is_salt" else (a, b)
            last = child["displayName"].lower().split()[-1] if child["displayName"].split() else ""
            if last in ESTER_WORDS:
                note = (f"{child['displayName']} is a covalent ester of {parent['displayName']}; "
                        f"§3.2 keeps an ester on its own page.")
                self.add_relation(child["key"], parent["key"], "ester_of", note, "R8-GSRS-ESTER", base)
                self.add_relation(parent["key"], child["key"], "parent_of", note, "R8-GSRS-ESTER", base)
                self.keep_separate.add(pair)
                self.log(a["key"], b["key"], "R8-GSRS-ESTER", "keep_separate",
                         {**base, "relationship": hint}, named)
                return "keep_separate"
            # §3.1 merges a salt form into its parent moiety. The register's relationship alone is
            # not enough: the page must actually BE that salt, either because its largest covalent
            # fragment is the parent structure, or, for a page with no structure on file, because
            # its printed name is the parent name plus salt words (§3.1a).
            confirmation = self.salt_confirmation(child, parent)
            if confirmation is None:
                note = (f"{page_label(child, parent)} and {page_label(parent, child)} are linked by "
                        f"an FDA salt or solvate relationship, and neither the structures nor the "
                        f"printed names confirm that one is a salt of the other.")
                self.remainder.append(
                    {"page_a": child["key"], "page_b": parent["key"],
                     "why_unresolved": "an FDA salt/solvate relationship links the pages, but the "
                                       "child page is not a salt form of the parent by structure or "
                                       "by name, so §3.1 does not license a merge",
                     "evidence": json.dumps({**base, "relationship": hint,
                                             "inchikey_child": child["inchikey"],
                                             "inchikey_parent": parent["inchikey"],
                                             "name_child": child["normalised"],
                                             "name_parent": parent["normalised"]}, sort_keys=True)})
                self.add_relation(child["key"], parent["key"], "related_form_of", note,
                                  "R6-GSRS-SALT-UNCONFIRMED", base)
                self.add_relation(parent["key"], child["key"], "related_form_of", note,
                                  "R6-GSRS-SALT-UNCONFIRMED", base)
                self.keep_separate.add(pair)
                self.log(a["key"], b["key"], "R6-GSRS-SALT-UNCONFIRMED", "remainder",
                         {**base, "relationship": hint}, named)
                return "remainder"
            self.merge_pairs.append((child["key"], parent["key"], "R6-GSRS-SALT-TO-PARENT"))
            self.log(a["key"], b["key"], "R6-GSRS-SALT-TO-PARENT", "merge",
                     {**base, "relationship": hint, "survivor": parent["key"],
                      "parent_unii": parent.get("unii"), "confirmation": confirmation}, named)
            return "merge"
        if hint in ("target_is_enantiomer", "target_is_racemate"):
            child, parent = (b, a) if hint == "target_is_enantiomer" else (a, b)
            note, relation = form_note(child, parent, "target_is_racemate")
            self.add_relation(child["key"], parent["key"], "stereoisomer_of", note,
                              "R7-GSRS-ENANTIOMER", base)
            self.add_relation(parent["key"], child["key"], "racemate_of",
                              f"{parent['displayName']} is the racemate recorded for "
                              f"{child['displayName']}.", "R7-GSRS-ENANTIOMER", base)
            self.keep_separate.add(pair)
            self.log(a["key"], b["key"], "R7-GSRS-ENANTIOMER", "keep_separate",
                     {**base, "relationship": hint, "note": note}, named)
            return "keep_separate"
        if hint == "target_is_active_moiety":
            note = (f"{a['displayName']} and {b['displayName']} share an FDA active moiety across a "
                    f"covalent difference; §2 does not follow that relationship for merging.")
            self.add_relation(a["key"], b["key"], "active_moiety_of", note, "R9-GSRS-ACTIVE-MOIETY", base)
            self.add_relation(b["key"], a["key"], "active_moiety_of", note, "R9-GSRS-ACTIVE-MOIETY", base)
            self.keep_separate.add(pair)
            self.log(a["key"], b["key"], "R9-GSRS-ACTIVE-MOIETY", "keep_separate",
                     {**base, "relationship": hint}, named)
            return "keep_separate"
        if hint in ("target_is_mixture", "target_is_component"):
            component, mixture = (a, b) if hint == "target_is_mixture" else (b, a)
            note = (f"{page_label(component, mixture)} is recorded by the FDA substance register as "
                    f"a component of {page_label(mixture, component)}.")
            self.add_relation(component["key"], mixture["key"], "component_of", note,
                              "R10-GSRS-MIXTURE", base)
            self.add_relation(mixture["key"], component["key"], "contains", note,
                              "R10-GSRS-MIXTURE", base)
            self.keep_separate.add(pair)
            self.log(a["key"], b["key"], "R10-GSRS-MIXTURE", "keep_separate",
                     {**base, "relationship": hint}, named)
            return "keep_separate"

        self.remainder.append(
            {"page_a": a["key"], "page_b": b["key"],
             "why_unresolved": "the evidence links the two pages but no rule in the spec's order "
                               "decides them",
             "evidence": json.dumps({**base, "unii_a": a["unii"], "unii_b": b["unii"],
                                     "inchikey_a": a["inchikey"], "inchikey_b": b["inchikey"],
                                     "name_a": a["normalised"], "name_b": b["normalised"],
                                     "gsrs_relationship": hint}, sort_keys=True)}
        )
        self.log(a["key"], b["key"], "UNRESOLVED", "remainder", {**base, "gsrs_relationship": hint},
                 named)
        return "remainder"


# --------------------------------------------------------------------------------------------
# union-find over the merges
# --------------------------------------------------------------------------------------------

class Union:
    def __init__(self) -> None:
        self.parent: dict[str, str] = {}

    def find(self, key: str) -> str:
        self.parent.setdefault(key, key)
        root = key
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[key] != root:
            self.parent[key], key = root, self.parent[key]
        return root

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "data/revamp/identity")
    parser.add_argument("--decisions", type=Path, default=ROOT / "data/revamp/identity-decisions.csv")
    args = parser.parse_args()
    out_dir = args.out_dir.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    decisions_path = args.decisions.resolve()

    normalise = NameNormaliser(load_salt_words())
    data = load_everything(normalise)
    pages = data["pages"]
    enrich_smiles(pages, data["spine"])
    resolver = Resolver(data, normalise)

    # ---------------------------------------------------------------- named inputs first
    named_items = {"suspected": 0, "collisions": 0, "holds": 0}
    named_resolved = {"suspected": 0, "collisions": 0, "holds": 0}

    suspected = json.loads(SUSPECTED.read_text())
    named_groups: list[tuple[str, list[str]]] = []
    for group in suspected.get("structural", []):
        if not group.get("suspected"):
            continue
        named_groups.append((f"suspected-structural:{group.get('inchikey14')}",
                             [p["key"] for p in group.get("pages", [])]))
    for group in suspected.get("nominal", []):
        named_groups.append((f"suspected-nominal:{group.get('nameFamily')}",
                             [p["key"] for p in group.get("pages", [])]))
    named_items["suspected"] = len(named_groups)

    collisions = json.loads(COLLISIONS.read_text())
    collision_groups: list[tuple[str, list[str]]] = []
    for row in collisions:
        collision_groups.append((f"slug-collision:{row['slug']}",
                                 [row["page"]] + [m["key"] for m in row.get("matches", [])]))
    named_items["collisions"] = len(collision_groups)

    def run_group(origin: str, keys: list[str], named: bool) -> list[str]:
        live = [k for k in dict.fromkeys(keys) if k in pages]
        if len(live) < 2:
            if named:
                resolver.remainder.append(
                    {"page_a": live[0] if live else "", "page_b": "",
                     "why_unresolved": "the named item no longer names two live corpus pages; an "
                                       "earlier identity pass already merged or dropped them",
                     "evidence": json.dumps({"origin": origin, "keys": list(keys)}, sort_keys=True)})
            return []
        members = [pages[k] for k in live]
        anchor = pick_survivor(members)
        outcomes = []
        for member in members:
            if member["key"] == anchor["key"]:
                continue
            outcomes.append(resolver.resolve_pair(anchor["key"], member["key"], origin, named))
        return outcomes

    for origin, keys in named_groups:
        outcomes = run_group(origin, keys, named=True)
        if outcomes and all(o not in ("remainder", "unknown-page") for o in outcomes):
            named_resolved["suspected"] += 1
    for origin, keys in collision_groups:
        outcomes = run_group(origin, keys, named=True)
        if outcomes and all(o not in ("remainder", "unknown-page") for o in outcomes):
            named_resolved["collisions"] += 1

    # -- the 55 held CONFLICT-K1-K2 records
    holds = []
    with DECISIONS_IN.open() as handle:
        for line in handle:
            record = json.loads(line)
            if record.get("ruleId") == "CONFLICT-K1-K2":
                holds.append(record)
    named_items["holds"] = len(holds)
    slug_to_key = {p["existingSlug"]: k for k, p in pages.items() if p.get("existingSlug")}
    unii_to_key = defaultdict(list)
    for key, page in pages.items():
        if page.get("unii"):
            unii_to_key[page["unii"]].append(key)

    for record in holds:
        source_ids = record.get("sourceRecords") or []
        slug = source_ids[0].split(":", 1)[1] if source_ids and ":" in source_ids[0] else None
        hold_key = f"HOLD:existing:{slug}"
        page_key = hold_key if hold_key in pages else (slug_to_key.get(slug) or hold_key)
        page = pages.get(page_key)
        evidence = record.get("evidence") or {}
        own = clean(evidence.get("inchikey"))
        parent = clean(evidence.get("uniiParentInchikey"))
        unii = clean(evidence.get("unii"))
        if page is None or not own or not parent:
            resolver.remainder.append(
                {"page_a": page_key, "page_b": "",
                 "why_unresolved": "held K1/K2 conflict whose record is not a live corpus page",
                 "evidence": json.dumps({"unii": unii, "inchikey": own,
                                         "uniiParentInchikey": parent}, sort_keys=True)})
            resolver.log(page_key, "", "R11-HOLD-UNRESOLVED", "remainder",
                         {"unii": unii, "inchikey": own, "uniiParentInchikey": parent}, True)
            continue
        base = {"origin": "held-conflict", "unii": unii, "own_inchikey": own,
                "unii_parent_inchikey": parent, "a": page["displayName"]}
        if own[:14] == parent[:14]:
            targets = [k for k in unii_to_key.get(unii, []) if k != page_key]
            if targets:
                other = pages[sorted(targets, key=lambda k: survivor_sort_key(pages[k]))[0]]
                resolver.resolve_pair(page_key, other["key"], "held-conflict", named=True)
                named_resolved["holds"] += 1
                continue
            resolver.log(page_key, "", "R11-HOLD-SAME-SKELETON", "keep_page",
                         {**base, "resolution": "the page's own structure and the structure GSRS "
                                                "records for its UNII share one skeleton, so the "
                                                "conflict is a form difference, not two substances; "
                                                "no second corpus page carries that UNII"}, True)
            named_resolved["holds"] += 1
            continue
        resolver.log(page_key, "", "R12-HOLD-DIFFERENT-SKELETON", "detach_unii",
                     {**base, "resolution": "the page's own structure and the structure GSRS records "
                                            "for its UNII have different connectivity skeletons, so "
                                            "the UNII names a different substance; identity stays on "
                                            "the page's own structure key"}, True)
        named_resolved["holds"] += 1

    # ---------------------------------------------------------------- backlog items
    backlog: dict[str, int] = Counter()

    # (a) K3:nan — one non-null key merged records that share nothing.
    split_records: list[dict] = []
    nan_page = pages.get("K3:nan")
    if nan_page is not None:
        chembl_names = {}
        try:
            key_frame = pd.read_parquet(IDENTITY_KEYS, columns=["rid", "name", "chemblId"])
            for row in key_frame.itertuples(index=False):
                cid = clean(row.chemblId)
                if cid:
                    chembl_names.setdefault(cid, clean(row.name))
        except Exception:
            chembl_names = {}
        for source in nan_page["sourceRecords"]:
            rid = clean(source.get("id"))
            if rid and rid.upper().startswith("CHEMBL") and f"K3:{rid}" not in pages:
                existing = next((r for r in split_records if r["key"] == f"K3:{rid}"), None)
                if existing is not None:
                    # Two source registers named the same ChEMBL molecule; that is one page.
                    existing["sources"].append(source)
                    continue
                split_records.append({"key": f"K3:{rid}", "chemblId": rid,
                                      "displayName": chembl_names.get(rid) or rid,
                                      "sources": [source]})
            elif rid and rid.upper().startswith("CHEMBL"):
                resolver.review.append(
                    {"key": f"K3:{rid}",
                     "reason": "a source record of the K3:nan page already has a page of its own; "
                               "the record is returned to that page rather than split onto a new one",
                     "evidence": json.dumps(source, sort_keys=True)})
            else:
                resolver.review.append(
                    {"key": "K3:nan", "reason": "source record of the K3:nan page carries no stable "
                                                "key, so it cannot be split onto a page of its own",
                     "evidence": json.dumps(source, sort_keys=True)})
                backlog["k3nan-review"] += 1
        resolver.log("K3:nan", "", "R13-SPLIT-NULL-KEY", "split",
                     {"reason": "a null ChEMBL parent produced the key K3:nan, which merged source "
                                "records that share no identifier",
                      "sourceRecords": len(nan_page["sourceRecords"]),
                      "splitInto": len(split_records)}, False)
        backlog["k3nan-split"] = len(split_records)

    # (c) K4 pages whose name is an intervention fragment rather than a substance.
    fragment_rows = 0
    for key, page in pages.items():
        if page["keyRank"] != "K4":
            continue
        if page["unii"] or page["inchikey"] or key in data["pubchem_pages"]:
            continue
        if key not in data["pubchem_unmatched"] or key in data["gsrs_class"]:
            continue
        matches = data["registry"].get(key, [])
        name = page["normalised"] or punct_norm(page["displayName"])
        tokens = punct_norm(page["displayName"]).split()
        strings = sorted({m.get("matchedName", "") for m in matches})
        limb = None
        # Compared without salt-word stripping: inside this pool no register knows the name as a
        # substance, so `Alkaline` <- `Alkaline citrate` is the page name used as a modifier, not a
        # salt of it.
        printed = punct_norm(page["displayName"])
        if matches and all(punct_norm(m.get("matchedName", "")) != printed for m in matches):
            limb = ("the ClinicalTrials.gov intervention strings recorded for this page never name "
                    "it on its own; the page name is a fragment of a longer intervention name")
        elif tokens and (tokens[-1] in CLASS_WORDS or punct_norm(page["displayName"]) in CLASS_WORDS):
            limb = ("the page name is a chemical-class term, not a substance name; no FDA substance "
                    "record and no PubChem compound answers to it")
        if limb is None:
            continue
        resolver.review.append(
            {"key": key, "reason": limb,
             "evidence": json.dumps({"displayName": page["displayName"],
                                     "gsrs": "no substance record matched",
                                     "pubchem": "no compound matched",
                                     "interventionStrings": strings[:8],
                                     "studies": len({m.get("nct") for m in matches})},
                                    sort_keys=True)})
        resolver.log(key, "", "R15-INTERVENTION-FRAGMENT", "review",
                     {"displayName": page["displayName"], "reason": limb}, False)
        fragment_rows += 1
    backlog["intervention-fragments"] = fragment_rows

    # ---------------------------------------------------------------- whole-corpus pass
    def group_by(attribute) -> dict:
        buckets = defaultdict(list)
        for key, page in pages.items():
            value = attribute(page)
            if value:
                buckets[value].append(key)
        return {k: v for k, v in buckets.items() if len(v) > 1}

    corpus_groups: list[tuple[str, list[str]]] = []
    for value, keys in sorted(group_by(lambda p: p["unii"]).items()):
        corpus_groups.append((f"unii:{value}", keys))
    for value, keys in sorted(group_by(lambda p: p["inchikey"]).items()):
        corpus_groups.append((f"inchikey:{value}", keys))
    for value, keys in sorted(group_by(lambda p: p["inchikey14"]).items()):
        if len({pages[k]["inchikey"] for k in keys}) > 1:
            corpus_groups.append((f"skeleton:{value}", keys))
    for value, keys in sorted(group_by(lambda p: p["normalised"]).items()):
        corpus_groups.append((f"name:{value}", keys))

    for origin, keys in corpus_groups:
        run_group(origin, keys, named=False)

    # GSRS relationship edges between two corpus pages.
    for key, target_unii, relation in data["gsrs_links"]:
        if key not in pages:
            continue
        for other in unii_to_key.get(target_unii, []):
            if other != key:
                resolver.resolve_pair(key, other, f"gsrs:{relation}", named=False)

    # ---------------------------------------------------------------- combination records, §3.7
    # A combination is keyed by the sorted set of its component keys. Two combination pages are one
    # record exactly when their component sets are equal once the component merges above are
    # applied; nothing else about a combination page decides it.
    provisional = Union()
    for old_key, survivor_key, _rule in resolver.merge_pairs:
        provisional.union(old_key, survivor_key)

    def mapped_components(key: str) -> frozenset | None:
        members = combo_component_set(key)
        if members is None:
            return None
        return frozenset(provisional.find(m) if m in provisional.parent else m for m in members)

    combo_groups: dict[frozenset, list[str]] = defaultdict(list)
    for key in pages:
        mapped = mapped_components(key)
        if mapped is not None:
            combo_groups[mapped].append(key)
    for mapped, keys in sorted(combo_groups.items(), key=lambda kv: sorted(kv[1])):
        if len(keys) < 2:
            continue
        members = [pages[k] for k in sorted(keys)]
        survivor = pick_survivor(members)
        for member in members:
            if member["key"] == survivor["key"]:
                continue
            resolver.merge_pairs.append((member["key"], survivor["key"], "R16-COMBO-SAME-COMPONENTS"))
            resolver.log(survivor["key"], member["key"], "R16-COMBO-SAME-COMPONENTS", "merge",
                         {"origin": "combination-components", "a": survivor["displayName"],
                          "b": member["displayName"], "components": sorted(mapped),
                          "survivor": survivor["key"]}, False)
    for key_a, key_b, origin, named in resolver.combination_pending:
        if mapped_components(key_a) == mapped_components(key_b):
            continue
        resolver.remainder.append(
            {"page_a": key_a, "page_b": key_b,
             "why_unresolved": "two combination records share an identifier but not their component "
                               "sets; §3.7 keys a combination by its components, so they are "
                               "different products unless a component merge makes the sets equal",
             "evidence": json.dumps({"origin": origin,
                                     "components_a": sorted(mapped_components(key_a) or []),
                                     "components_b": sorted(mapped_components(key_b) or [])},
                                    sort_keys=True)})
        resolver.log(key_a, key_b, "R16-COMBO-DIFFERENT-COMPONENTS", "remainder",
                     {"origin": origin, "a": pages[key_a]["displayName"],
                      "b": pages[key_b]["displayName"]}, named)

    # ---------------------------------------------------------------- components of one product
    # Several single-substance pages carrying the same brand synonym are the components of one
    # marketed product (the 23 Pneumovax serotype antigens are the case the lead recorded). They
    # stay separate pages under §3.7 and are linked to the product so Phase 4 can compose it.
    brand_pages: dict[str, list[str]] = defaultdict(list)
    for key, page in pages.items():
        if page["isCombination"] or combo_members(key):
            continue
        if key in provisional.parent and provisional.find(key) != key:
            continue
        for synonym in page["synonyms"]:
            if str(synonym.get("kind")) == "brand":
                token = punct_norm(synonym.get("name", ""))
                if token:
                    brand_pages[token].append(key)
    product_rows = 0
    for brand, keys in sorted(brand_pages.items()):
        members = sorted(set(keys))
        if len(members) < 3:
            continue
        # A shared brand name alone marks a product line, not a product. The components of one
        # product are the pages the registry gives the same study set, because every study named
        # the product rather than the component; that is the defect the lead recorded.
        trial_sets = {frozenset(m.get("nct") for m in data["registry"].get(key, []))
                      for key in members}
        if len(trial_sets) != 1 or not next(iter(trial_sets)):
            continue
        product_key = f"PRODUCT:NAME:{brand}"
        for key in members:
            note = (f"{pages[key]['displayName']} is one of the {len(members)} substances the corpus "
                    f"records under the product name {brand}; the components stay on their own pages "
                    f"and the product composes them.")
            resolver.add_relation(key, product_key, "component_of", note,
                                  "R17-SHARED-BRAND-COMPONENT",
                                  {"brand": brand, "components": len(members)})
        resolver.review.append(
            {"key": product_key,
             "reason": "several single-substance pages share this product name and the corpus holds "
                       "no page for the product itself; the components are linked to it for Phase 4 "
                       "to compose",
             "evidence": json.dumps({"brand": brand, "components": members[:25],
                                     "componentCount": len(members)}, sort_keys=True)})
        resolver.log(product_key, "", "R17-SHARED-BRAND-COMPONENT", "link_components",
                     {"brand": brand, "componentCount": len(members)}, False)
        product_rows += 1
    backlog["product-component-groups"] = product_rows

    # (b) trials matched by a parent name on a stereo-split child page.
    trial_rows: list[dict] = []
    stereo_pairs = [(r["page_a"], r["page_b"]) for r in resolver.relations
                    if r["relation"] == "stereoisomer_of"]
    for child_key, parent_key in stereo_pairs:
        child, parent = pages.get(child_key), pages.get(parent_key)
        if child is None or parent is None:
            continue
        # Only a page whose own recorded name carries a stereo descriptor can be holding trials
        # that name the parent instead. The parent must carry no descriptor of its own.
        child_descriptor = name_stereo_descriptor(child["displayName"])
        if child_descriptor is None or name_stereo_descriptor(parent["displayName"]) is not None:
            continue
        parent_name = parent["normalised"]
        child_own = punct_norm(child["displayName"])
        if not parent_name:
            continue
        for match in data["registry"].get(child_key, []):
            matched = punct_norm(match.get("matchedName", ""))
            if not matched or matched == child_own:
                continue
            if normalise(matched) == parent_name and matched != child_own:
                descriptor = name_stereo_descriptor(match.get("matchedName", ""))
                if descriptor is not None:
                    continue
                trial_rows.append({
                    "nct": match.get("nct"),
                    "from_key": child_key,
                    "to_key": parent_key,
                    "matched_name": match.get("matchedName"),
                    "action": "move",
                    "rule": "R14-PARENT-NAME-TRIAL",
                    "reason": (f"the registry intervention names {parent['displayName']}, not "
                               f"{child['displayName']}; the trial belongs to the parent page"),
                })
    backlog["trial-reassignments"] = len(trial_rows)
    if trial_rows:
        moved = Counter(r["from_key"] for r in trial_rows)
        for child_key, count in moved.items():
            resolver.log(child_key, "", "R14-PARENT-NAME-TRIAL", "reassign_trials",
                         {"studies": count, "target": next(r["to_key"] for r in trial_rows
                                                           if r["from_key"] == child_key)}, False)


    # ---------------------------------------------------------------- merge map
    union = Union()
    for old, survivor, _rule in resolver.merge_pairs:
        union.union(old, survivor)
    components: dict[str, list[str]] = defaultdict(list)
    for key in {k for pair in resolver.merge_pairs for k in pair[:2]}:
        components[union.find(key)].append(key)

    conflicted: set[str] = set()
    for a, b in resolver.keep_separate:
        if a in union.parent and b in union.parent and union.find(a) == union.find(b):
            conflicted.add(union.find(a))
            resolver.remainder.append(
                {"page_a": a, "page_b": b,
                 "why_unresolved": "a merge chain would join two pages that an exception class keeps "
                                   "separate; the whole chain is held for the second opinion",
                 "evidence": json.dumps({"component": sorted(components[union.find(a)])[:10]},
                                        sort_keys=True)})

    merge_map: dict[str, dict] = {}
    for root, members in components.items():
        if root in conflicted:
            continue
        member_pages = [pages[k] for k in members if k in pages]
        if len(member_pages) < 2:
            continue
        survivor = pick_survivor(member_pages)
        for page in member_pages:
            if page["key"] == survivor["key"]:
                continue
            merge_map[page["key"]] = {
                "survivor": survivor["key"],
                "displayName": survivor["displayName"],
                "slug": survivor.get("slug"),
            }

    # ---------------------------------------------------------------- display-name disambiguation
    disambiguations: list[dict] = []
    collision_sets: dict[str, set[str]] = defaultdict(set)
    for row in resolver.decisions:
        if row["rule"] != "R4-SAME-NAME-DIFFERENT-SKELETON":
            continue
        evidence = json.loads(row["evidence"])
        collision_sets[evidence["normalised"]].update([row["page_a"], row["page_b"]])

    for normalised, keys in sorted(collision_sets.items()):
        live = [pages[k] for k in sorted(keys) if k in pages and k not in merge_map]
        if len(live) < 2:
            continue
        chosen = choose_disambiguators(live, data)
        if chosen is None:
            for page in live:
                resolver.remainder.append(
                    {"page_a": page["key"], "page_b": "",
                     "why_unresolved": "two pages collide on a display name and nothing recorded for "
                                       "them - substance class, primary target, stereo descriptor, "
                                       "UNII or structure - tells one from the other",
                     "evidence": json.dumps({"normalised": normalised,
                                             "displayName": page["displayName"]}, sort_keys=True)})
            continue
        for page in live:
            disambiguator, source = chosen[page["key"]]
            disambiguations.append({
                "key": page["key"],
                "current_display_name": page["displayName"],
                "disambiguated_display_name": f"{page['displayName']} ({disambiguator})",
                "disambiguator": disambiguator,
                "disambiguator_source": source,
                "collides_on": normalised,
                "collides_with": ";".join(p["key"] for p in live if p["key"] != page["key"]),
            })

    # ---------------------------------------------------------------- write everything
    write_csv(decisions_path, resolver.decisions, ["page_a", "page_b", "rule", "action", "evidence"])
    # Ordered by reach, so the second opinion in 3.4 sees the pairs that touch an indexable page
    # first, then the rest by tier.
    def reach(row: dict) -> tuple:
        endpoints = [pages.get(row.get("page_a")), pages.get(row.get("page_b"))]
        endpoints = [p for p in endpoints if p]
        indexable = 0 if any(p.get("indexable") for p in endpoints) else 1
        tier = min((p.get("tier", 9) for p in endpoints), default=9)
        return (indexable, tier, row.get("page_a") or "", row.get("page_b") or "")

    write_csv(out_dir / "remainder.csv", sorted(resolver.remainder, key=reach),
              ["page_a", "page_b", "why_unresolved", "evidence"])
    write_csv(out_dir / "review-list.csv", resolver.review, ["key", "reason", "evidence"])
    write_csv(out_dir / "display-names.csv", disambiguations,
              ["key", "current_display_name", "disambiguated_display_name", "disambiguator",
               "disambiguator_source", "collides_on", "collides_with"])
    write_csv(out_dir / "trial-reassignments.csv", trial_rows,
              ["nct", "from_key", "to_key", "matched_name", "action", "rule", "reason"])
    (out_dir / "merge-map.json").write_text(json.dumps(merge_map, indent=1, sort_keys=True) + "\n")
    # Every edge is rewritten onto the surviving pages, so no relation points at a page the merge
    # map has just removed. Self-edges and edges onto the split-away K3:nan page are dropped.
    def survivor_of(key: str) -> str:
        target = merge_map.get(key)
        return target["survivor"] if target else key

    remapped: list[dict] = []
    seen_edges: set[tuple[str, str, str]] = set()
    dropped_edges = 0
    for relation in resolver.relations:
        page_a, page_b = survivor_of(relation["page_a"]), survivor_of(relation["page_b"])
        if page_a == page_b or page_a == "K3:nan" or page_b == "K3:nan":
            dropped_edges += 1
            continue
        token = (page_a, page_b, relation["relation"])
        if token in seen_edges:
            dropped_edges += 1
            continue
        seen_edges.add(token)
        remapped.append({**relation, "page_a": page_a, "page_b": page_b})
    relations_frame = pd.DataFrame(
        remapped, columns=["page_a", "page_b", "relation", "note", "rule", "evidence"]
    )
    relations_frame.to_parquet(out_dir / "relations.parquet", index=False)

    # ---------------------------------------------------------------- canonical v2 + redirects
    canonical_rows, redirects = build_canonical_v2(
        pages, data, merge_map, disambiguations, relations_frame, split_records, normalise
    )
    with (out_dir / "canonical-v2.ndjson").open("w") as handle:
        for row in canonical_rows:
            handle.write(json.dumps(row, sort_keys=False) + "\n")
    write_csv(out_dir / "redirect-plan.csv", redirects, ["old_slug", "new_slug", "reason"])

    # ---------------------------------------------------------------- summary
    named_total = sum(named_items.values())
    named_done = sum(named_resolved.values())
    summary = {
        "generatedAt": pd.Timestamp.now("UTC").isoformat(),
        "step": "3.2/3.3",
        "namedItems": {"total": named_total, "resolved": named_done,
                       "remaining": named_total - named_done, "byInput": named_items,
                       "resolvedByInput": named_resolved},
        "byRuleNamed": dict(resolver.by_rule_named),
        "byRuleAll": dict(resolver.by_rule),
        "byRuleCorpusOnly": {k: v - resolver.by_rule_named.get(k, 0)
                             for k, v in resolver.by_rule.items()},
        "actions": dict(Counter(d["action"] for d in resolver.decisions)),
        "merges": len(merge_map),
        "mergeComponents": len([r for r in components if r not in conflicted]),
        "conflictedComponents": len(conflicted),
        "formOfEdges": int(len(relations_frame)),
        "disambiguated": len(disambiguations),
        "splits": len(split_records),
        "reviewList": len(resolver.review),
        "remainder": len(resolver.remainder),
        "trialReassignments": len(trial_rows),
        "canonicalV2Pages": len(canonical_rows),
        "redirectPlanRows": len(redirects),
        "backlog": dict(backlog),
    }
    (out_dir / "resolve-summary.json").write_text(json.dumps(summary, indent=2) + "\n")

    print(json.dumps({k: summary[k] for k in
                      ("namedItems", "merges", "formOfEdges", "disambiguated", "splits",
                       "reviewList", "remainder", "trialReassignments", "canonicalV2Pages",
                       "redirectPlanRows", "conflictedComponents")}, indent=1))
    print("by rule (named 966):")
    for rule, count in sorted(resolver.by_rule_named.items(), key=lambda kv: -kv[1])[:MAX_PRINT_ROWS]:
        print(f"  {rule:34s} {count}")
    print("by rule (whole corpus, excluding the named items):")
    for rule, count in sorted(summary["byRuleCorpusOnly"].items(), key=lambda kv: -kv[1])[:MAX_PRINT_ROWS]:
        print(f"  {rule:34s} {count}")
    return 0


READABLE_CLASS = {
    "chemical": "small molecule",
    "protein": "protein",
    "nucleicAcid": "nucleic acid",
    "structurallyDiverse": "botanical or biological source",
    "polymer": "polymer",
    "mixture": "mixture",
    "concept": "substance concept",
    "specifiedSubstanceG1": "specified substance",
}


def substance_class_label(page: dict, data: dict) -> str | None:
    klass = page.get("substance_class") or data["gsrs_class"].get(page["key"])
    if klass:
        return READABLE_CLASS.get(klass, str(klass))
    if page.get("isBiologic"):
        return "biologic"
    return None


def register_name(page: dict, data: dict) -> str | None:
    """The FDA substance register's own preferred name, when it says something the title does not."""
    unii = page.get("unii")
    record = data["spine"].get(unii) if unii else None
    name = (record or {}).get("preferred_name")
    if name and punct_norm(name) != punct_norm(page["displayName"]):
        return name
    return None


def molecular_formula(page: dict) -> str | None:
    mol = mol_from_smiles(page.get("smiles"))
    if mol is None:
        return None
    try:
        return rdMolDescriptors.CalcMolFormula(mol)
    except Exception:
        return None


def choose_disambiguators(live: list[dict], data: dict) -> dict[str, tuple[str, str]] | None:
    """The first disambiguator in the spec's order that tells every colliding page apart.

    The spec draws the disambiguator from the substance class or the primary target. Where those
    are equal across the collision the pages still need distinct names, so the ladder continues
    with the stereo descriptor the register printed, then the FDA UNII, then the structure key.
    """
    options = [
        ("GSRS substance class", lambda page: substance_class_label(page, data)),
        ("Inxight primary target", lambda page: data["primary_target"].get(page["key"])),
        ("stereo descriptor in the recorded name",
         lambda page: name_stereo_descriptor(page["displayName"])),
        ("FDA substance register name", lambda page: register_name(page, data)),
        ("molecular formula", lambda page: molecular_formula(page)),
        ("FDA UNII", lambda page: f"UNII {page['unii']}" if page.get("unii") else None),
        ("InChIKey skeleton",
         lambda page: f"structure {page['inchikey14']}" if page.get("inchikey14") else None),
    ]
    for source, extract in options:
        values = {page["key"]: extract(page) for page in live}
        if all(values.values()) and len(set(values.values())) == len(live):
            return {key: (value, source) for key, value in values.items()}
    return None


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({c: row.get(c, "") for c in columns})


def build_canonical_v2(pages, data, merge_map, disambiguations, relations_frame, split_records,
                       normalise) -> tuple[list[dict], list[dict]]:
    """Apply the merges, the split and the display-name changes to a new canonical revision."""
    new_names = {row["key"]: row["disambiguated_display_name"] for row in disambiguations}
    absorbed: dict[str, list[str]] = defaultdict(list)
    for old, target in merge_map.items():
        absorbed[target["survivor"]].append(old)

    relations_by_page: dict[str, list[dict]] = defaultdict(list)
    for row in relations_frame.itertuples(index=False):
        relations_by_page[row.page_a].append(
            {"type": row.relation, "targetKey": row.page_b, "note": row.note, "rule": row.rule}
        )

    rows: list[dict] = []
    redirects: list[dict] = []

    for key, page in pages.items():
        if key in merge_map or key == "K3:nan":
            continue
        record = dict(page["record"])
        merged_keys = sorted(absorbed.get(key, []))
        synonyms = list(record.get("synonyms") or [])
        seen = {punct_norm(s.get("name", "")) for s in synonyms}
        identifiers = ("chemblId", "unii", "cid", "cas", "rxcui", "drugbankId")
        for old in merged_keys:
            other = pages[old]
            for synonym in [{"name": other["displayName"], "kind": "merged-page",
                             "source": "identity-3.2"}] + list(other["synonyms"]):
                token = punct_norm(synonym.get("name", ""))
                if token and token not in seen:
                    seen.add(token)
                    synonyms.append(synonym)
            record["sourceRecords"] = (record.get("sourceRecords") or []) + (other["sourceRecords"] or [])
            for field in identifiers:
                if not record.get(field) and other["record"].get(field):
                    record[field] = other["record"][field]
            if not record.get("existingSlug") and other["record"].get("existingSlug"):
                record["existingSlug"] = other["record"]["existingSlug"]
        record["synonyms"] = synonyms

        # A survivor without a slug of its own adopts one from the pages it absorbs, so no legacy
        # URL is left without a page. A survivor whose own slug is only a numbered variant of an
        # absorbed page's slug adopts the unnumbered one and redirects its own. Every other
        # absorbed slug redirects to the survivor's.
        survivor_slug = page.get("slug")
        merged_slugs = sorted({pages[o].get("slug") for o in merged_keys if pages[o].get("slug")})
        if not survivor_slug and merged_slugs:
            survivor_slug = merged_slugs[0]
            record["existingSlug"] = survivor_slug
            record["adoptedSlug"] = survivor_slug
        elif survivor_slug:
            stem = re.sub(r"-\d+$", "", survivor_slug)
            if stem != survivor_slug and stem in merged_slugs:
                redirects.append({
                    "old_slug": survivor_slug,
                    "new_slug": stem,
                    "reason": f"MERGED: {key} adopted the unnumbered slug of a page it absorbed",
                })
                merged_slugs = [s for s in merged_slugs if s != stem]
                survivor_slug = stem
                record["existingSlug"] = stem
                record["adoptedSlug"] = stem
        for old_slug in merged_slugs:
            if old_slug != survivor_slug:
                redirects.append({
                    "old_slug": old_slug,
                    "new_slug": survivor_slug or "",
                    "reason": f"MERGED into {key} by identity pass 3.2",
                })
        seen_source = set()
        deduped = []
        for source in record.get("sourceRecords") or []:
            token = (source.get("source"), source.get("id"))
            if token not in seen_source:
                seen_source.add(token)
                deduped.append(source)
        record["sourceRecords"] = deduped
        if key in new_names:
            record["displayName"] = new_names[key]
        existing = {(r.get("type"), r.get("targetKey")) for r in (record.get("relations") or [])}
        merged_relations = list(record.get("relations") or [])
        for relation in relations_by_page.get(key, []):
            token = (relation["type"], relation["targetKey"])
            if token not in existing and relation["targetKey"] not in merge_map:
                existing.add(token)
                merged_relations.append(relation)
        record["relations"] = merged_relations
        record["mergedFrom"] = merged_keys
        rows.append(record)

    nan_page = pages.get("K3:nan")
    if nan_page is not None:
        for split in split_records:
            rows.append({
                "key": split["key"],
                "keyRank": "K3",
                "ruleId": "K3-CHEMBL-PARENT",
                "displayName": split["displayName"],
                "synonyms": [{"name": split["displayName"], "kind": "display",
                              "source": "identity-3.2-split"}],
                "relations": [],
                "sourceRecords": split["sources"],
                "structure": None,
                "isCombination": False,
                "isBiologic": False,
                "chemblId": split["chemblId"],
                "unii": None, "cid": None, "cas": None, "rxcui": None, "drugbankId": None,
                "existingSlug": None,
                "splitFrom": "K3:nan",
            })
        if nan_page.get("slug") and split_records:
            target = next(
                (s for s in split_records
                 if punct_norm(s["displayName"]) == punct_norm(nan_page["displayName"])),
                split_records[0],
            )
            redirects.append({
                "old_slug": nan_page["slug"],
                "new_slug": slugify(target["displayName"]),
                "reason": "SPLIT: the K3:nan page held records that share no identifier; its slug "
                          "follows the record whose name the page carried",
            })

    rows.sort(key=lambda r: r["key"])
    seen_slug = set()
    deduped_redirects = []
    for row in sorted(redirects, key=lambda r: r["old_slug"]):
        if row["old_slug"] and row["new_slug"] and row["old_slug"] != row["new_slug"] \
                and row["old_slug"] not in seen_slug:
            seen_slug.add(row["old_slug"])
            deduped_redirects.append(row)
    return rows, deduped_redirects


def slugify(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", str(name).lower())).strip("-")


if __name__ == "__main__":
    sys.exit(main())
