"""Corpus join keys and the shared name normaliser for Phase 2 source ingesters.

Reads `data/corpus-20k/identity/canonical.ndjson` and
`data/corpus-20k/tiers/model-assignment.ndjson` and exposes the four mapping
rules of the revamp spec: UNII exact, full InChIKey exact, InChIKey skeleton
(first 14 characters, linked as `form_of` and never merged), and normalised
name as a candidate only.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

CANONICAL = Path("data/corpus-20k/identity/canonical.ndjson")
TIERS = Path("data/corpus-20k/tiers/model-assignment.ndjson")
SALTS = Path("scripts/revamp/salts.txt")

STEREO_PREFIXES = {
    "(+)", "(-)", "(±)", "(+/-)", "(+-)", "(r)", "(s)", "(rs)", "(r,s)",
    "(e)", "(z)", "d", "l", "dl", "rac", "racemic", "levo", "dextro",
}

_PUNCT = re.compile(r"[^a-z0-9]+")


def load_salts() -> list[str]:
    suffixes: list[str] = []
    for line in SALTS.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            suffixes.append(re.sub(r"\s+", " ", line.lower()))
    return sorted(set(suffixes), key=len, reverse=True)


def normalise_name(raw: str, salts: list[str]) -> str:
    """Lowercase, strip stereo prefixes, strip trailing salt/counter-ion words."""
    if not raw:
        return ""
    name = raw.strip().lower()
    # Strip leading stereo descriptors, which are separated by a hyphen or space.
    while True:
        m = re.match(r"^\(?[^\s\-]{1,8}\)?[\s\-]+", name)
        if not m:
            break
        head = m.group(0).strip(" -")
        if head in STEREO_PREFIXES:
            name = name[m.end():]
            continue
        break
    name = _PUNCT.sub(" ", name).strip()
    changed = True
    while changed and name:
        changed = False
        for salt in salts:
            if name.endswith(" " + salt):
                stripped = name[: -(len(salt) + 1)].strip()
                if stripped:
                    name = stripped
                    changed = True
                    break
    return re.sub(r"\s+", " ", name).strip()


def full_normalise_name(raw: str) -> str:
    """Lowercase, punctuation to spaces, whitespace collapsed — and nothing removed.

    `normalise_name` strips trailing counter-ion words so that "amlodipine besylate" and
    "amlodipine" meet. That is right for a salt and wrong for a name whose head is the counter-ion:
    "SODIUM PHOSPHATE", "SODIUM DIACETATE" and "SODIUM CITRATE" all normalise to "sodium", and the
    Poisons Standard's phosphate and diacetate entries landed on the trisodium citrate page
    (docs/specs/phase4-generators.md §13 item 12). A full normalised name is the whole name, so a
    shared token cannot match.
    """
    if not raw:
        return ""
    return re.sub(r"\s+", " ", _PUNCT.sub(" ", raw.strip().lower())).strip()


@dataclass
class CorpusIndex:
    tier: dict[str, int] = field(default_factory=dict)
    display: dict[str, str] = field(default_factory=dict)
    model: dict[str, str] = field(default_factory=dict)
    unii_to_keys: dict[str, list[str]] = field(default_factory=dict)
    rxcui_to_keys: dict[str, list[str]] = field(default_factory=dict)
    inchikey_to_keys: dict[str, list[str]] = field(default_factory=dict)
    skeleton_to_keys: dict[str, list[str]] = field(default_factory=dict)
    name_to_keys: dict[str, list[str]] = field(default_factory=dict)
    #: The page's names normalised without salt stripping, for a rule that requires a whole name.
    full_name_to_keys: dict[str, list[str]] = field(default_factory=dict)
    chembl_to_keys: dict[str, list[str]] = field(default_factory=dict)
    key_unii: dict[str, str] = field(default_factory=dict)
    combination_components: dict[str, frozenset] = field(default_factory=dict)
    salts: list[str] = field(default_factory=list)

    def tier_of(self, key: str) -> int:
        return self.tier.get(key, 3)


def _add(index: dict[str, list[str]], token: str, key: str) -> None:
    bucket = index.setdefault(token, [])
    if key not in bucket:
        bucket.append(key)


def load_corpus_index() -> CorpusIndex:
    salts = load_salts()
    idx = CorpusIndex(salts=salts)

    for line in TIERS.open():
        rec = json.loads(line)
        key = rec["key"]
        model = rec.get("model") or "DEVELOPMENT"
        withdrawn = bool(rec.get("withdrawn"))
        if model == "LONGEVITY" or withdrawn:
            idx.tier[key] = 1
        elif model == "CLINICAL":
            idx.tier[key] = 2
        else:
            idx.tier[key] = 3
        idx.model[key] = model

    for line in CANONICAL.open():
        rec = json.loads(line)
        key = rec["key"]
        idx.display[key] = rec.get("displayName") or key
        # Page keys carry the identifier that keyed the page: K1 is a UNII, K2 a
        # full InChIKey, K3 a ChEMBL id, K4 a normalised name. 1,865 K1 pages
        # hold their UNII only in the key and 1,373 more carry a different UNII
        # in the field, so both are indexed.
        prefix, _, token = key.partition(":")
        unii = (rec.get("unii") or "").strip().upper()
        if prefix == "K1" and token:
            _add(idx.unii_to_keys, token.strip().upper(), key)
            idx.key_unii.setdefault(key, token.strip().upper())
        if unii:
            _add(idx.unii_to_keys, unii, key)
            idx.key_unii[key] = unii
        rxcui = rec.get("rxcui")
        if rxcui:
            _add(idx.rxcui_to_keys, str(rxcui).strip(), key)
        if prefix == "K2" and token:
            _add(idx.inchikey_to_keys, token.strip().upper(), key)
            _add(idx.skeleton_to_keys, token.strip().upper()[:14], key)
        if prefix == "K3" and token:
            _add(idx.chembl_to_keys, token.strip().upper(), key)
        structure = rec.get("structure") or {}
        ik = (structure.get("inchikey") or "").strip().upper()
        if ik:
            _add(idx.inchikey_to_keys, ik, key)
            _add(idx.skeleton_to_keys, ik[:14], key)
        ik14 = (structure.get("inchikey14") or "").strip().upper()
        if ik14:
            _add(idx.skeleton_to_keys, ik14, key)
        names = [rec.get("displayName") or ""]
        for syn in rec.get("synonyms") or []:
            names.append(syn.get("name") or "")
        for name in names:
            norm = normalise_name(name, salts)
            if len(norm) >= 3:
                _add(idx.name_to_keys, norm, key)
            full = full_normalise_name(name)
            if len(full) >= 3:
                _add(idx.full_name_to_keys, full, key)
        contains = [
            r["targetKey"]
            for r in (rec.get("relations") or [])
            if r.get("type") == "contains" and r.get("targetKey")
        ]
        if rec.get("isCombination") and len(contains) >= 2:
            idx.combination_components[key] = frozenset(contains)

    return idx
