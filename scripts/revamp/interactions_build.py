"""Build the three-tier interaction table for Phase 4.1.

Reads the cleared Phase 2 sources and the integrated field records and writes

    data/revamp/interactions/interactions.parquet
    data/revamp/interactions/checked-sources.parquet
    data/revamp/interactions/build-summary.json
    data/revamp/interactions/lexicon-dropped.csv

The rules, the counterpart resolution, the confidence bands and the reason each
input is read from where it is read are fixed in docs/specs/interaction-rules.md.
Nothing here writes medical prose: every column is a stored value, a verbatim
label sentence, or a coded reading of one whose matched words are kept beside it.

Usage:
    .venv-corpus/bin/python scripts/revamp/interactions_build.py [--run-date YYYY-MM-DD]
                                                                [--disable RULE_ID ...]
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIELDS_V2 = os.path.join(ROOT, "data", "revamp", "fields-v2")
IDENTITY = os.path.join(ROOT, "data", "revamp", "identity")
OUT_DIR = os.path.join(ROOT, "data", "revamp", "interactions")
OPENFDA_MAPPED = os.path.join(ROOT, "data", "sources", "openfda-label", "mapped.parquet")
INXIGHT_MAPPED = os.path.join(ROOT, "data", "sources", "inxight", "mapped.parquet")
UNII_NAMES = os.path.join(ROOT, "data", "corpus-20k", "raw", "fda-unii", "UNII_Names_4Aug2026.txt")
SALTS = os.path.join(ROOT, "scripts", "revamp", "salts.txt")

MODELS = ("clinical", "development", "longevity")

# ---------------------------------------------------------------- normalising

NON_ALNUM = re.compile(r"[^a-z0-9]+")
WS = re.compile(r"\s+")

ABBREV = {
    "st", "e.g", "eg", "i.e", "ie", "vs", "approx", "dr", "inc", "ltd", "etc",
    "no", "fig", "u.s", "mr", "ms", "ca", "cf", "al",
}
SPLIT_POINT = re.compile(r"(?<=[.;])\s+")

ENZYME_ALIAS = {
    "CYP3A": "CYP3A4",
    "CYP3A4/5": "CYP3A4",
    "CYP3A4/CYP3A5": "CYP3A4",
    "P-GLYCOPROTEIN": "P-gp",
    "P-GP": "P-gp",
    "PGP": "P-gp",
    "ABCB1": "P-gp",
    "MDR1": "P-gp",
}


def norm_name(text: str) -> str:
    return WS.sub(" ", NON_ALNUM.sub(" ", text.lower())).strip()


def canon_enzyme(enzyme):
    if not enzyme:
        return None
    e = str(enzyme).strip()
    return ENZYME_ALIAS.get(e.upper(), e)


def split_sentences(block: str):
    """Split on '.' or ';' plus whitespace, but not after a known abbreviation."""
    text = WS.sub(" ", block).strip()
    parts = SPLIT_POINT.split(text)
    out = []
    for part in parts:
        if out:
            tail = out[-1].rstrip()
            last = ""
            if tail[-1:] in ".;":
                last = tail[:-1].split(" ")[-1].lower()
            if last in ABBREV or (len(last) == 1 and last.isalpha()):
                out[-1] = tail + " " + part
                continue
        out.append(part)
    return [s.strip() for s in out if s.strip()]


# ------------------------------------------------------------------ the cues

INTERACTION_CUES = (
    "concomitant", "concomitantly", "coadminist", "co-administ", "co administ",
    "in combination with", "combination with", "concurrent use", "concurrently",
    "together with", "patients taking", "patients receiving", "when used with",
    "when given with", "avoid use with", "do not use with", "should not be used with",
    "interaction", "interacts",
)
NEGATION_CUES = (
    "did not affect", "no effect on", "not altered", "did not alter",
    "no clinically significant", "no significant", "unchanged", "did not result in",
    "no dose adjustment", "did not change", "no change in",
)
INCREASE_CUES = ("increase", "increased", "increases", "increasing", "higher", "elevat", "greater")
DECREASE_CUES = ("decrease", "decreased", "decreases", "reduc", "lower", "lowered", "diminish")
EXPOSURE_WORDS = ("exposure", "concentration", "plasma", "auc", "cmax", "level", "serum",
                  "systemic")
CONTRA_CUES = ("contraindicated",)
# A name followed by one of these is a laboratory measurement, not a medicine taken
# alongside: "prothrombin time", "platelet count". Exposure words such as "level" and
# "concentration" are deliberately absent: "digoxin levels" is an interaction statement.
MEASUREMENT_FOLLOWERS = ("time", "times", "ratio", "count", "counts", "index")
AVOID_CUES = ("avoid", "not recommended", "should not be", "use caution", "monitor", "caution")

QT_CUES = (
    "qt prolongation", "prolongation of the qt", "prolongs the qt", "prolong the qt",
    "qtc interval", "qt interval prolongation", "torsade",
)

ENZYME_IN_SENTENCE = re.compile(
    r"\b(CYP\s?[0-9]+[A-Z]+[0-9]*(?:/[0-9]+)?|P-?gp|P-glycoprotein|BCRP|OATP1B[13]|OAT[123]|"
    r"OCT[123]|MATE-?[12]K?|UGT[0-9A-Z]*|BSEP|MRP[0-9])\b",
    re.I,
)


def direction_from_sentence(sentence: str):
    low = sentence.lower()
    hits = [c for c in NEGATION_CUES if c in low]
    if hits:
        return "no change stated", "; ".join(hits)
    hits = [c for c in CONTRA_CUES if c in low]
    if hits:
        return "contraindicated with", "; ".join(hits)
    has_exposure = any(w in low for w in EXPOSURE_WORDS)
    up = [c for c in INCREASE_CUES if c in low]
    down = [c for c in DECREASE_CUES if c in low]
    if has_exposure and up and not down:
        return "exposure increase stated", "; ".join(up)
    if has_exposure and down and not up:
        return "exposure decrease stated", "; ".join(down)
    if has_exposure and up and down:
        return "interaction stated; direction not stated", "; ".join(up + down)
    hits = [c for c in AVOID_CUES if c in low]
    if hits:
        return "avoid or monitor", "; ".join(hits)
    return "interaction stated; direction not stated", ""


# ------------------------------------------------------------------- loading


def load_salt_suffixes():
    out = set()
    with open(SALTS, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#"):
                out.add(line.lower())
    return out


SYNONYM_KINDS = ("display", "common", "inn", "usan", "ban", "jan", "salt")
UNII_NAME_TYPES = ("of", "cn", "sys")


def load_identity():
    keys = {}
    unii_to_keys = defaultdict(set)
    name_to_keys = defaultdict(set)
    with open(os.path.join(IDENTITY, "canonical-v2.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            rec = json.loads(line)
            key = rec["key"]
            keys[key] = {"displayName": rec.get("displayName") or key, "unii": rec.get("unii")}
            if rec.get("unii"):
                unii_to_keys[rec["unii"].strip().upper()].add(key)
            names = [(rec.get("displayName"), "display")]
            for syn in rec.get("synonyms") or []:
                names.append((syn.get("name"), syn.get("kind")))
            for name, kind in names:
                if not name or kind not in SYNONYM_KINDS:
                    continue
                name_to_keys[norm_name(name)].add(key)
    spine = pd.read_parquet(os.path.join(IDENTITY, "spine-attached.parquet"))
    identified = set()
    for rec in spine.itertuples(index=False):
        if isinstance(rec.unii, str) and rec.unii.strip():
            identified.add(rec.key)
        elif isinstance(rec.inchikey, str) and rec.inchikey.strip():
            identified.add(rec.key)
        for col in (rec.unii, rec.active_moiety_unii, rec.parent_unii):
            if isinstance(col, str) and col.strip():
                unii_to_keys[col.strip().upper()].add(rec.key)
    rel = pd.read_parquet(os.path.join(IDENTITY, "relations.parquet"))
    related = defaultdict(set)
    for a, b in zip(rel["page_a"], rel["page_b"]):
        related[a].add(b)
        related[b].add(a)
    with open(os.path.join(IDENTITY, "display-names.csv"), encoding="utf-8") as fh:
        for rowrec in csv.DictReader(fh):
            if rowrec["key"] in keys:
                keys[rowrec["key"]]["displayName"] = rowrec["disambiguated_display_name"]
    return {"keys": keys, "unii_to_keys": unii_to_keys, "name_to_keys": name_to_keys,
            "related": related, "identified": identified}


def load_unii_names(unii_to_keys):
    """Normalised UNII name to page keys, brand and code name types excluded."""
    out = defaultdict(set)
    with open(UNII_NAMES, encoding="utf-8", errors="replace") as fh:
        fh.readline()
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3 or parts[1].strip().lower() not in UNII_NAME_TYPES:
                continue
            targets = unii_to_keys.get(parts[2].strip().upper())
            if not targets:
                continue
            values = [parts[0]]
            if len(parts) > 3:
                values.append(parts[3])
            for value in values:
                if value:
                    out[norm_name(value)] |= targets
    return out


def edit_distance_at_most(a, b, limit):
    if abs(len(a) - len(b)) > limit:
        return False
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        current = [i]
        for j, cb in enumerate(b, start=1):
            current.append(min(previous[j] + 1, current[j - 1] + 1,
                               previous[j - 1] + (ca != cb)))
        if min(current) > limit:
            return False
        previous = current
    return previous[-1] <= limit


def name_is_related(form, display, unii_forms):
    """Is this form a variant of the page's own name rather than a class term?"""
    if form in unii_forms:
        return True
    if not display:
        return False
    if form == display:
        return True
    if display.startswith(form + " ") or form.startswith(display + " "):
        return True
    if " " not in form and " " not in display:
        return edit_distance_at_most(form, display, 2)
    return False


def load_fields():
    """Per page: display name, model, targets, mechanism classes, ATC, consulted lists."""
    pages = {}
    for model in MODELS:
        for path in sorted(glob.glob(os.path.join(FIELDS_V2, model, "batch-*.ndjson"))):
            with open(path, encoding="utf-8") as fh:
                for line in fh:
                    rec = json.loads(line)
                    fields = rec["fields"]
                    page = {
                        "key": rec["key"],
                        "displayName": rec.get("displayName") or rec["key"],
                        "model": rec.get("model"),
                        "targets": [],
                        "classes": [],
                        "atc": [],
                        "consulted": [],
                    }

                    def present(name):
                        entry = fields.get(name)
                        if entry and entry.get("state") == "present":
                            return entry.get("value")
                        return None

                    target = present("target")
                    if isinstance(target, dict):
                        for merged in target.get("mergedTargets") or []:
                            page["targets"].append({
                                "key": merged.get("targetKey"),
                                "name": merged.get("targetName"),
                                "evidence": [
                                    {"pharmacology": ev.get("pharmacology"),
                                     "source": ev.get("source")}
                                    for ev in merged.get("evidence") or []
                                ],
                            })
                    mech = present("mechanismClass")
                    if isinstance(mech, dict):
                        for mrow in mech.get("chemblMechanisms") or []:
                            if mrow.get("targetChemblId") and mrow.get("actionType"):
                                page["targets"].append({
                                    "key": mrow["targetChemblId"],
                                    "name": mrow.get("targetChemblId"),
                                    "evidence": [{"pharmacology": mrow["actionType"],
                                                  "source": "chembl-mechanism"}],
                                })
                        for stmt in mech.get("classStatements") or []:
                            page["classes"].append({
                                "source": stmt.get("source"),
                                "kind": stmt.get("kind"),
                                "statement": (stmt.get("statement") or "").strip(),
                            })
                    reg = present("regulatory")
                    if isinstance(reg, dict):
                        sg = reg.get("SG") or {}
                        page["atc"] = [c for c in (sg.get("atcCodes") or [])
                                       if isinstance(c, str)
                                       and re.match(r"^[A-Z][0-9]{2}[A-Z]{2}", c)]
                    consulted = []
                    for name in ("interactions", "cyp_profile"):
                        entry = fields.get(name) or {}
                        for item in entry.get("consulted") or []:
                            consulted.append(item)
                        value = entry.get("value")
                        if isinstance(value, dict):
                            for item in value.get("sourcesChecked") or []:
                                consulted.append(item)
                    seen = []
                    for item in consulted:
                        if item not in seen:
                            seen.append(item)
                    page["consulted"] = seen
                    page["lastVerified"] = (
                        (fields.get("cyp_profile") or {}).get("lastVerified")
                        or (fields.get("interactions") or {}).get("lastVerified"))
                    pages[rec["key"]] = page
    return pages


# ---------------------------------------------------------------- the lexicon


class Lexicon:
    """Longest-match phrase lookup from a normalised name to a single page key."""

    MAX_TOKENS = 6

    def __init__(self):
        self.by_first = defaultdict(list)
        self.size = 0

    def add(self, phrase, key):
        tokens = tuple(phrase.split())
        if not tokens:
            return
        self.by_first[tokens[0]].append((tokens, key))
        self.size += 1

    def finish(self):
        for first in self.by_first:
            self.by_first[first].sort(key=lambda item: -len(item[0]))

    def find(self, tokens):
        """Return (page key, matched surface, start, end) with no overlaps."""
        out = []
        i = 0
        n = len(tokens)
        while i < n:
            best = None
            for phrase, key in self.by_first.get(tokens[i], ()):
                span = len(phrase)
                if i + span <= n and tuple(tokens[i:i + span]) == phrase:
                    best = (key, " ".join(phrase), i, i + span)
                    break
            if best:
                out.append(best)
                i = best[3]
            else:
                i += 1
        return out


def strip_salt(phrase, salts):
    tokens = phrase.split()
    changed = False
    while len(tokens) > 1 and tokens[-1] in salts:
        tokens.pop()
        changed = True
    return " ".join(tokens) if changed else None


MIN_INTERACTION_PAGES = 20
MAX_OTHER_RATIO = 0.20
MAX_AMBIGUOUS_CANDIDATES = 12


def resolve_ambiguity(form, candidates, display_of, related):
    """A name shared by a substance and its own salt or ester belongs to the substance.

    Returns the page key, or None when the candidates are genuinely different
    substances and the name cannot be linked.
    """
    exact = [k for k in candidates if display_of.get(k) == form]
    if len(exact) == 1:
        return exact[0]
    if len(candidates) > MAX_AMBIGUOUS_CANDIDATES:
        return None
    ordered = sorted(candidates)
    seen = {ordered[0]}
    frontier = [ordered[0]]
    while frontier:
        current = frontier.pop()
        for other in related.get(current, ()):
            if other in candidates and other not in seen:
                seen.add(other)
                frontier.append(other)
    if seen != set(candidates):
        return None
    return min(ordered, key=lambda k: (len(display_of.get(k) or k), k))


CLASS_FORM_MIN_LENGTH = 5


def build_lexicon(identity, unii_names, salts, interaction_sections, other_sections):
    """Return (lexicon, dropped rows).

    A lexicon entry maps a normalised surface form to a page key, or to None when
    the form names a counterpart the corpus holds no page for (a drug class, a page
    without a substance identifier, an ambiguous name). Both are counterparts; only
    the first carries a page link.
    """
    unii_forms_by_key = defaultdict(set)
    for phrase, keys in unii_names.items():
        for key in keys:
            unii_forms_by_key[key].add(phrase)

    candidates = defaultdict(set)
    from_display = set()
    for phrase, keys in identity["name_to_keys"].items():
        candidates[phrase] |= keys
    for phrase, keys in unii_names.items():
        candidates[phrase] |= keys
        from_display.add(phrase)
    for phrase in list(candidates):
        stripped = strip_salt(phrase, salts)
        if stripped:
            candidates[stripped] |= candidates[phrase]
            if phrase in from_display:
                from_display.add(stripped)

    display_of = {k: norm_name(v["displayName"]) for k, v in identity["keys"].items()}
    identified = identity["identified"]

    dropped = []
    resolved = {}
    unresolved = {}
    for phrase, keys in candidates.items():
        tokens = phrase.split()
        if not tokens or len(tokens) > Lexicon.MAX_TOKENS:
            continue
        if not any(ch.isalpha() for ch in phrase):
            dropped.append({"form": phrase, "reason": "no letter in the form",
                            "pages": len(keys)})
            continue
        if len(tokens) == 1 and len(phrase) < 5:
            dropped.append({"form": phrase,
                            "reason": "single token shorter than 5 characters",
                            "pages": len(keys)})
            continue
        if len(keys) > 1:
            key = resolve_ambiguity(phrase, keys, display_of, identity["related"])
            if key is None:
                unresolved[phrase] = ("ambiguous: %d pages carry this name and they are not "
                                      "forms of one substance" % len(keys))
                continue
        else:
            key = next(iter(keys))
        if key not in identified:
            unresolved[phrase] = ("the page carries no UNII and no InChIKey, so the name "
                                  "cannot be resolved to a substance")
            continue
        if phrase in from_display or name_is_related(phrase, display_of.get(key),
                                                     unii_forms_by_key.get(key, ())):
            resolved[phrase] = key
        else:
            unresolved[phrase] = ("names a class or a group, not this page's substance "
                                  "(no variant of %r and no UNII name for it)"
                                  % (display_of.get(key) or key))

    # Non-discriminating forms. A form as common in the label sections that are not
    # about interactions as in those that are is a general clinical word, not the
    # name of a co-administered medicine.
    probe = Lexicon()
    for phrase in list(resolved) + list(unresolved):
        probe.add(phrase, resolved.get(phrase))
    probe.finish()
    df_int = defaultdict(set)
    df_other = defaultdict(set)
    pages_int = set()
    pages_other = set()
    for page_key, text in interaction_sections:
        pages_int.add(page_key)
        for _key, surface, _s, _e in probe.find(norm_name(text).split()):
            df_int[surface].add(page_key)
    for page_key, text in other_sections:
        pages_other.add(page_key)
        for _key, surface, _s, _e in probe.find(norm_name(text).split()):
            df_other[surface].add(page_key)

    lex = Lexicon()
    kept_resolved = 0
    kept_unlinked = []
    for phrase in list(resolved) + list(unresolved):
        seen_int = len(df_int.get(phrase, ()))
        seen_other = len(df_other.get(phrase, ()))
        if seen_int >= MIN_INTERACTION_PAGES and seen_other >= MAX_OTHER_RATIO * seen_int:
            dropped.append({
                "form": phrase,
                "reason": ("non-discriminating: on %d of %d pages with interaction text and "
                           "%d of %d pages with indication or population text"
                           % (seen_int, len(pages_int), seen_other, len(pages_other))),
                "pages": 1})
            continue
        if phrase in resolved:
            lex.add(phrase, resolved[phrase])
            kept_resolved += 1
            continue
        # A counterpart with no page link is kept only when it names a group of
        # medicines, which is what a label writes when it means more than one drug.
        # A singular name whose page link was rejected adds nothing a reader can check.
        if not phrase.split()[-1].endswith("s") or len(phrase) < CLASS_FORM_MIN_LENGTH:
            dropped.append({"form": phrase,
                            "reason": "no page link and not a group name: " + unresolved[phrase],
                            "pages": 1})
            continue
        lex.add(phrase, None)
        kept_unlinked.append({"form": phrase, "reason": unresolved[phrase],
                              "interaction_pages": seen_int})
    lex.finish()
    return lex, dropped, kept_resolved, kept_unlinked


# --------------------------------------------------------------------- tiers

COLUMNS = [
    "page_a", "page_a_display", "page_b", "page_b_display", "counterpart_name",
    "counterpart_unii", "pair_id", "tier", "direction", "mechanism", "source",
    "source_record_id", "source_url", "source_date", "set_id", "effective_time",
    "label_section", "licence", "rule_id", "confidence", "sentence", "derivation",
    "match_basis", "provenance",
]


def make_row(**kwargs):
    base = {col: None for col in COLUMNS}
    base.update(kwargs)
    return base


def pair_key(a, b):
    if not b:
        return a
    return "|".join(sorted((a, b)))


def tier_a(openfda, identity, lex, pages):
    sections = ("drug_interactions", "contraindications", "warnings_and_cautions")
    frame = openfda[openfda["field"].isin(sections)]
    rows = []
    stats = Counter()
    related = identity["related"]
    keys = identity["keys"]
    for record in frame.itertuples(index=False):
        page_a = record.key
        try:
            blocks = json.loads(record.value)
        except (TypeError, ValueError):
            continue
        if isinstance(blocks, str):
            blocks = [blocks]
        for block in blocks:
            if not isinstance(block, str):
                continue
            for sentence in split_sentences(block):
                if not 20 <= len(sentence) <= 2000:
                    continue
                low = sentence.lower()
                cues = [c for c in INTERACTION_CUES if c in low]
                if record.field != "drug_interactions" and not cues:
                    continue
                sentence_tokens = norm_name(sentence).split()
                matches = lex.find(sentence_tokens)
                if not matches:
                    stats["sentences_with_no_counterpart"] += 1
                    continue
                seen_counterparts = set()
                for key_b, surface, _s, end in matches:
                    if end < len(sentence_tokens) and \
                            sentence_tokens[end] in MEASUREMENT_FOLLOWERS:
                        stats["dropped_laboratory_measurement"] += 1
                        continue
                    if key_b is not None and (key_b == page_a
                                              or key_b in related.get(page_a, ())):
                        stats["dropped_self_or_related"] += 1
                        continue
                    marker = key_b or ("name:" + surface)
                    if marker in seen_counterparts:
                        continue
                    seen_counterparts.add(marker)
                    if key_b is None:
                        stats["rows_without_a_page_link"] += 1
                    direction, cue = direction_from_sentence(sentence)
                    found = ENZYME_IN_SENTENCE.search(sentence)
                    if cue:
                        derivation = "direction cue: " + cue
                    elif cues:
                        derivation = "interaction cue: " + "; ".join(cues)
                    else:
                        derivation = "named counterpart in the drug_interactions section"
                    rows.append(make_row(
                        page_a=page_a,
                        page_a_display=(pages.get(page_a) or {}).get("displayName")
                        or keys.get(page_a, {}).get("displayName"),
                        page_b=key_b,
                        page_b_display=(keys.get(key_b, {}).get("displayName")
                                        if key_b else None),
                        counterpart_name=surface,
                        counterpart_unii=(keys.get(key_b, {}).get("unii") if key_b else None),
                        pair_id=pair_key(page_a, key_b),
                        tier="A",
                        direction=direction,
                        mechanism=canon_enzyme(found.group(0)) if found else None,
                        source="openfda-label",
                        source_record_id=record.source_record_id,
                        source_url=record.source_url,
                        source_date=record.source_date,
                        set_id=record.source_record_id,
                        effective_time=record.source_date,
                        label_section=record.field,
                        licence=record.licence,
                        rule_id="A-label-statement",
                        confidence="documented",
                        sentence=sentence,
                        derivation=derivation,
                        match_basis="name matched in the label sentence, resolved to the page",
                        provenance=json.dumps({
                            "sentence": "openfda-label mapped.parquet field=%s set_id=%s"
                                        % (record.field, record.source_record_id),
                            "direction": "cue words matched in that sentence",
                            "counterpart": ("lexicon surface '%s' resolved to %s" % (surface, key_b))
                            if key_b else
                            ("lexicon surface '%s'; the corpus holds no page for it" % surface),
                            "mechanism": "enzyme or transporter named in that sentence",
                        }),
                    ))
                    stats["rows"] += 1
    return rows, dict(stats)


ROLE_DIRECTION = {
    "substrate": "substrate of {}",
    "inhibitor": "inhibits {}",
    "inducer": "induces {}",
    "activator": "activates {}",
    "suppressor": "suppresses {}",
    "binder": "binds {}",
}


def tier_b(inxight, identity, pages):
    frame = inxight[inxight["field"] == "ddi"]
    rows = []
    not_found = defaultdict(list)
    stats = Counter()
    keys = identity["keys"]
    for record in frame.itertuples(index=False):
        try:
            value = json.loads(record.value)
        except (TypeError, ValueError):
            continue
        target_name = value.get("targetName") or value.get("target")
        record_id = value.get("inxightRecordId") or record.source_record_id
        if not value.get("interactionFound"):
            not_found[record.key].append(record_id)
            stats["not_found_rows"] += 1
            continue
        role = value.get("role") or ""
        rows.append(make_row(
            page_a=record.key,
            page_a_display=(pages.get(record.key) or {}).get("displayName")
            or keys.get(record.key, {}).get("displayName"),
            counterpart_name=target_name,
            pair_id=pair_key(record.key, None),
            tier="B",
            direction=ROLE_DIRECTION.get(role, "{}").format(
                target_name or "the recorded target"),
            mechanism=("%s of %s" % (role, target_name)) if role and target_name else (role or None),
            source="inxight",
            source_record_id=record_id,
            source_url=record.source_url,
            source_date=record.source_date,
            licence=record.licence,
            rule_id="B-inxight-frdb",
            confidence=value.get("magnitudeReported"),
            derivation=json.dumps({
                "role": role, "target": value.get("target"), "targetName": target_name,
                "targetClass": value.get("targetClass"), "measure": value.get("measure"),
                "concentration": value.get("concentration"),
                "magnitudeReported": value.get("magnitudeReported"),
                "evidenceUri": value.get("evidenceUri"),
                "frdbVersion": value.get("frdbVersion"),
            }),
            match_basis=record.match_rule,
            provenance=json.dumps({
                "direction": "inxight ddi role=%s" % role,
                "counterpart": "inxight ddi targetName",
                "confidence": "inxight ddi magnitudeReported",
                "record": record_id,
            }),
        ))
        stats["rows"] += 1
    return rows, dict(not_found), dict(stats)


# -------------------------------------------------------------------- tier C

ACTION_DIRECTION = {
    "INHIBITOR": "inhibit", "ANTAGONIST": "inhibit", "BLOCKER": "inhibit",
    "NEGATIVE ALLOSTERIC MODULATOR": "inhibit", "INVERSE AGONIST": "inhibit",
    "INHIBITION": "inhibit", "NEGATIVE": "inhibit",
    "AGONIST": "activate", "PARTIAL AGONIST": "activate", "ACTIVATOR": "activate",
    "POSITIVE ALLOSTERIC MODULATOR": "activate", "POSITIVE MODULATOR": "activate",
    "OPENER": "activate", "FULL AGONIST": "activate", "ACTIVATION": "activate",
}
CURATED_MECHANISM_SOURCES = ("chembl-mechanism", "iuphar")

CLASS_TERMS = {
    "serotonergic": {
        "serotonin agonists", "serotonin receptor agonists",
        "selective serotonin reuptake inhibitors", "serotonin uptake inhibitors",
        "serotonin reuptake inhibitor", "tricyclic antidepressant",
        "antidepressive agents, tricyclic", "monoamine oxidase inhibitors",
    },
    "CNS-depressant": {
        "central nervous system depressants", "hypnotics and sedatives", "sedatives",
        "anesthetics", "anesthetics, intravenous", "anesthetics, dissociative",
        "analgesics, opioid", "opioids", "full opioid agonists", "opioid agonist",
        "anti-anxiety agents", "hypnotics", "general anaesthetic", "intravenous anesthetics",
        "anaesthetic",
    },
    "anticoagulant-antiplatelet": {
        "anticoagulants", "anticoagulant", "platelet aggregation inhibitors",
        "platelet aggregation inhibitor", "fibrinolytic agents", "antithrombins",
    },
    "hypotensive": {
        "antihypertensive agents", "antihypertensive", "vasodilator agents", "vasodilator",
        "diuretics", "diuretic", "antihypertensive drugs",
    },
    "hypoglycaemic": {"hypoglycemic agents", "antidiabetic agents", "antidiabetic", "insulin"},
    "nephrotoxic": set(),
    "hepatotoxic": {"agente hepatotoxico"},
    "hyperkalaemic": {"mineralocorticoid receptor antagonists", "potassium sparing diuretics"},
}
CLASS_EXCLUDE = {
    "CNS-depressant": {"anesthetics, local", "local anesthetics"},
    "anticoagulant-antiplatelet": {"coagulants"},
    "hypotensive": {"antihypotensive", "antihypotensive agents"},
}
CLASS_ATC = {
    "serotonergic": {"N06AA", "N06AB", "N06AG", "N02CC"},
    "CNS-depressant": {"N05CD", "N05CF", "N05CM", "N05BA", "N02AA", "N02AB", "N02AE",
                       "N01AB", "N01AF", "N01AH"},
    "anticoagulant-antiplatelet": {"B01AA", "B01AB", "B01AC", "B01AD", "B01AE", "B01AF"},
    "hyperkalaemic": {"C03DA", "C03DB", "C09AA", "C09CA", "C09DA", "C09XA"},
}
CLASS_ATC_PREFIX = {
    "hypotensive": ("C02", "C03", "C07", "C08", "C09"),
    "hypoglycaemic": ("A10",),
}


def cyp_rows(openfda, inxight):
    """Return (perpetrators by (enzyme, role), substrate pages by enzyme)."""
    perpetrators = defaultdict(list)
    substrates = defaultdict(dict)
    for record in openfda[openfda["field"] == "cyp_profile"].itertuples(index=False):
        try:
            value = json.loads(record.value)
        except (TypeError, ValueError):
            continue
        enzyme = canon_enzyme(value.get("enzyme"))
        role = value.get("role")
        if not enzyme or not role:
            continue
        entry = {
            "key": record.key, "enzyme": enzyme, "enzyme_verbatim": value.get("enzyme"),
            "role": role, "strength": value.get("strength"), "basis": value.get("basis"),
            "section": value.get("section"), "sentence": value.get("sentence"),
            "set_id": record.source_record_id, "source": "openfda-label",
            "source_date": record.source_date, "source_url": record.source_url,
            "licence": record.licence,
        }
        if role in ("inhibitor", "inducer") and value.get("strength") in ("strong", "moderate"):
            perpetrators[(enzyme, role)].append(entry)
        if role == "substrate":
            substrates[enzyme].setdefault(record.key, entry)
    for record in inxight[inxight["field"] == "ddi"].itertuples(index=False):
        try:
            value = json.loads(record.value)
        except (TypeError, ValueError):
            continue
        if not value.get("interactionFound") or value.get("role") != "substrate":
            continue
        enzyme = canon_enzyme(value.get("target"))
        if not enzyme:
            continue
        substrates[enzyme].setdefault(record.key, {
            "key": record.key, "enzyme": enzyme, "enzyme_verbatim": value.get("target"),
            "role": "substrate", "strength": None, "basis": "curated", "section": None,
            "sentence": None,
            "set_id": value.get("inxightRecordId") or record.source_record_id,
            "source": "inxight", "source_date": record.source_date,
            "source_url": record.source_url, "licence": record.licence,
        })
    return perpetrators, substrates


def rule_c1(perpetrators, substrates, identity, pages):
    rows = []
    stats = Counter()
    related = identity["related"]
    keys = identity["keys"]
    for (enzyme, role), entries in perpetrators.items():
        objects = substrates.get(enzyme) or {}
        mechanism = "%s %s" % (enzyme, "inhibition" if role == "inhibitor" else "induction")
        rule = ("C1-cyp-inhibitor-substrate" if role == "inhibitor"
                else "C1-cyp-inducer-substrate")
        for perp in entries:
            page_a = perp["key"]
            for page_b, sub in objects.items():
                if page_b == page_a or page_b in related.get(page_a, ()):
                    stats["dropped_self_or_related"] += 1
                    continue
                display_b = ((pages.get(page_b) or {}).get("displayName")
                             or keys.get(page_b, {}).get("displayName") or page_b)
                if role == "inhibitor":
                    direction = "expected increased exposure of %s" % display_b
                else:
                    direction = "expected decreased exposure of %s" % display_b
                band = ("likely" if perp["strength"] == "strong"
                        and sub["source"] == "openfda-label" else "possible")
                if sub["source"] == "openfda-label":
                    sub_where = "label, set_id %s" % sub["set_id"]
                else:
                    sub_where = "Inxight %s" % sub["set_id"]
                derivation = ("%s %s %s (label, set_id %s) x %s substrate (%s)"
                              % (perp["strength"], perp["enzyme_verbatim"], role,
                                 perp["set_id"], sub["enzyme_verbatim"], sub_where))
                if sub.get("sentence"):
                    derivation += "; substrate statement: \"%s\"" % sub["sentence"]
                rows.append(make_row(
                    page_a=page_a,
                    page_a_display=(pages.get(page_a) or {}).get("displayName")
                    or keys.get(page_a, {}).get("displayName"),
                    page_b=page_b, page_b_display=display_b,
                    counterpart_name=display_b,
                    counterpart_unii=keys.get(page_b, {}).get("unii"),
                    pair_id=pair_key(page_a, page_b),
                    tier="C", direction=direction, mechanism=mechanism,
                    source=("openfda-label" if sub["source"] == "openfda-label"
                            else "openfda-label+inxight"),
                    source_record_id=json.dumps([perp["set_id"], sub["set_id"]]),
                    source_url=perp["source_url"],
                    source_date=max(str(perp["source_date"] or ""),
                                    str(sub["source_date"] or "")),
                    set_id=perp["set_id"], effective_time=perp["source_date"],
                    label_section=perp.get("section"), licence=perp["licence"],
                    rule_id=rule, confidence=band,
                    sentence=perp.get("sentence"), derivation=derivation,
                    match_basis="enzyme identity between the two stored rows",
                    provenance=json.dumps({
                        "direction": "perpetrator role %s on %s paired with a stored substrate "
                                     "role for %s" % (role, enzyme, enzyme),
                        "perpetrator": "openfda-label cyp_profile set_id %s" % perp["set_id"],
                        "object": "%s record %s" % (sub["source"], sub["set_id"]),
                        "confidence": "band rule C1 in docs/specs/interaction-rules.md section 5",
                    }),
                ))
                stats["rows"] += 1
    return rows, dict(stats)


def rule_c2(pages, identity):
    groups = defaultdict(dict)
    for key, page in pages.items():
        for target in page["targets"]:
            tkey = target.get("key")
            if not tkey:
                continue
            for ev in target["evidence"]:
                action = (ev.get("pharmacology") or "").strip().upper()
                direction = ACTION_DIRECTION.get(action)
                if not direction:
                    continue
                slot = groups[(tkey, direction)].setdefault(
                    key, {"name": target.get("name"), "curated": False, "sources": set(),
                          "action": ev.get("pharmacology")})
                if ev.get("source") in CURATED_MECHANISM_SOURCES:
                    slot["curated"] = True
                if ev.get("source"):
                    slot["sources"].add(ev["source"])
    rows = []
    stats = Counter()
    related = identity["related"]
    keys = identity["keys"]
    for (tkey, direction), members in groups.items():
        if len(members) < 2:
            continue
        items = sorted(members.items())
        for i, (a, ainfo) in enumerate(items):
            for b, binfo in items[i + 1:]:
                if b in related.get(a, ()):
                    stats["dropped_related"] += 1
                    continue
                band = "likely" if ainfo["curated"] and binfo["curated"] else "possible"
                target_name = ainfo["name"] or binfo["name"] or tkey
                derivation = ("%s at %s (%s) x %s at %s (%s)"
                              % (ainfo["action"], target_name,
                                 ", ".join(sorted(ainfo["sources"])),
                                 binfo["action"], target_name,
                                 ", ".join(sorted(binfo["sources"]))))
                for src, dst, sinfo, dinfo in ((a, b, ainfo, binfo), (b, a, binfo, ainfo)):
                    rows.append(make_row(
                        page_a=src,
                        page_a_display=(pages.get(src) or {}).get("displayName"),
                        page_b=dst,
                        page_b_display=(pages.get(dst) or {}).get("displayName"),
                        counterpart_name=(pages.get(dst) or {}).get("displayName"),
                        counterpart_unii=keys.get(dst, {}).get("unii"),
                        pair_id=pair_key(a, b),
                        tier="C",
                        direction="additive effect at %s" % target_name,
                        mechanism="both %s %s" % (direction, target_name),
                        source="fields-v2 target and mechanismClass",
                        source_record_id=tkey,
                        rule_id="C2-shared-target-same-direction",
                        confidence=band,
                        derivation=derivation,
                        match_basis="same merged target key, same action direction",
                        provenance=json.dumps({
                            "direction": "action words %s and %s both read as %s"
                                         % (sinfo["action"], dinfo["action"], direction),
                            "target": "merged target key %s" % tkey,
                            "confidence": "band rule C2 in docs/specs/interaction-rules.md "
                                          "section 5",
                        }),
                    ))
                    stats["rows"] += 1
    return rows, dict(stats)


def qt_members(openfda):
    out = {}
    frame = openfda[openfda["field"].isin(("warnings_and_cautions", "boxed_warning"))]
    for record in frame.itertuples(index=False):
        if record.key in out:
            continue
        try:
            blocks = json.loads(record.value)
        except (TypeError, ValueError):
            continue
        if isinstance(blocks, str):
            blocks = [blocks]
        for block in blocks:
            if not isinstance(block, str):
                continue
            for sentence in split_sentences(block):
                low = sentence.lower()
                cue = next((c for c in QT_CUES if c in low), None)
                if cue:
                    out[record.key] = {
                        "sentence": sentence, "cue": cue,
                        "set_id": record.source_record_id,
                        "source_date": record.source_date,
                        "section": record.field, "licence": record.licence,
                        "source_url": record.source_url,
                    }
                    break
            if record.key in out:
                break
    return out


def rule_c3(pages, identity, qt):
    membership = defaultdict(dict)
    for key, page in pages.items():
        terms = {}
        for c in page["classes"]:
            statement = (c["statement"] or "").strip().lower()
            if statement:
                terms.setdefault(statement, c)
        codes = {c[:5] for c in page["atc"]}
        for klass, wanted in CLASS_TERMS.items():
            if set(terms) & CLASS_EXCLUDE.get(klass, set()):
                continue
            hits = [terms[t] for t in wanted if t in terms]
            sources = {h["source"] for h in hits if h.get("source")}
            atc_hits = []
            for code in codes:
                if code in CLASS_ATC.get(klass, set()) or \
                        code.startswith(CLASS_ATC_PREFIX.get(klass, ())):
                    atc_hits.append(code)
            if atc_hits:
                sources.add("atc")
            if not hits and not atc_hits:
                continue
            membership[klass][key] = {
                "terms": sorted({h["statement"] for h in hits}),
                "atc": sorted(atc_hits),
                "sources": sorted(sources),
            }
    for key, info in qt.items():
        if key in pages:
            membership["QT-prolonging"][key] = {
                "terms": [], "atc": [], "sources": ["openfda-label"],
                "sentence": info["sentence"], "set_id": info["set_id"],
                "source_date": info["source_date"], "section": info["section"],
                "licence": info["licence"], "cue": info["cue"],
            }
    rows = []
    stats = Counter()
    related = identity["related"]
    keys = identity["keys"]
    for klass, members in membership.items():
        stats["members:%s" % klass] = len(members)
        items = sorted(members.items())
        for i, (a, ainfo) in enumerate(items):
            for b, binfo in items[i + 1:]:
                if b in related.get(a, ()):
                    stats["dropped_related"] += 1
                    continue
                band = ("likely" if len(ainfo["sources"]) >= 2 and len(binfo["sources"]) >= 2
                        else "possible")
                for src, dst, sinfo, dinfo in ((a, b, ainfo, binfo), (b, a, binfo, ainfo)):
                    basis_s = "; ".join(sinfo["terms"] + sinfo["atc"]) or sinfo.get("cue") or ""
                    basis_d = "; ".join(dinfo["terms"] + dinfo["atc"]) or dinfo.get("cue") or ""
                    rows.append(make_row(
                        page_a=src,
                        page_a_display=(pages.get(src) or {}).get("displayName"),
                        page_b=dst,
                        page_b_display=(pages.get(dst) or {}).get("displayName"),
                        counterpart_name=(pages.get(dst) or {}).get("displayName"),
                        counterpart_unii=keys.get(dst, {}).get("unii"),
                        pair_id=pair_key(a, b),
                        tier="C",
                        direction="additive %s effect" % klass,
                        mechanism="%s class membership on both pages" % klass,
                        source="+".join(sorted(set(sinfo["sources"]) | set(dinfo["sources"]))),
                        source_record_id=sinfo.get("set_id"),
                        source_date=str(sinfo.get("source_date") or ""),
                        set_id=sinfo.get("set_id"),
                        effective_time=sinfo.get("source_date"),
                        label_section=sinfo.get("section"),
                        licence=sinfo.get("licence"),
                        rule_id="C3-additive-%s" % klass,
                        confidence=band,
                        sentence=sinfo.get("sentence"),
                        derivation="%s x %s" % (basis_s, basis_d),
                        match_basis="shared additive-effect class from pharmacologic action",
                        provenance=json.dumps({
                            "direction": "both pages are members of the %s class" % klass,
                            "membership_a": sinfo["sources"],
                            "membership_b": dinfo["sources"],
                            "confidence": "band rule C3 in docs/specs/interaction-rules.md "
                                          "section 5",
                        }),
                    ))
                    stats["rows"] += 1
    return rows, dict(stats)


# ------------------------------------------------------------------- writing


def write_parquet(rows, path, columns):
    table = pa.table({col: pa.array([r.get(col) for r in rows], type=pa.string())
                      for col in columns})
    pq.write_table(table, path, compression="zstd")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-date", default="2026-09-06")
    parser.add_argument("--disable", action="append", default=[])
    args = parser.parse_args()
    disabled = set(args.disable)
    os.makedirs(OUT_DIR, exist_ok=True)

    print("reading identity", flush=True)
    identity = load_identity()
    salts = load_salt_suffixes()
    unii_names = load_unii_names(identity["unii_to_keys"])
    print("  pages %d, uniis %d, unii name forms %d"
          % (len(identity["keys"]), len(identity["unii_to_keys"]), len(unii_names)), flush=True)

    print("reading integrated field records", flush=True)
    pages = load_fields()
    print("  field records %d" % len(pages), flush=True)

    print("reading mapped sources", flush=True)
    openfda = pd.read_parquet(OPENFDA_MAPPED)
    inxight = pd.read_parquet(INXIGHT_MAPPED)
    label_pages = set(openfda["key"].unique())
    interaction_sections = [
        (r.key, r.value) for r in
        openfda[openfda["field"].isin(
            ("drug_interactions", "contraindications", "warnings_and_cautions")
        )].itertuples(index=False) if isinstance(r.value, str)
    ]
    other_sections = [
        (r.key, r.value) for r in
        openfda[openfda["field"].isin(
            ("indications_and_usage", "use_in_specific_populations")
        )].itertuples(index=False) if isinstance(r.value, str)
    ]

    print("building the counterpart lexicon", flush=True)
    lex, dropped, kept_resolved, kept_unlinked = build_lexicon(
        identity, unii_names, salts, interaction_sections, other_sections)
    print("  lexicon forms %d (page-linked %d, named only %d), dropped %d"
          % (lex.size, kept_resolved, len(kept_unlinked), len(dropped)), flush=True)
    with open(os.path.join(OUT_DIR, "lexicon-dropped.csv"), "w", newline="",
              encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["form", "reason", "pages"])
        writer.writeheader()
        writer.writerows(sorted(dropped, key=lambda d: (d["reason"], d["form"])))
    with open(os.path.join(OUT_DIR, "lexicon-named-only.csv"), "w", newline="",
              encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["form", "reason", "interaction_pages"])
        writer.writeheader()
        writer.writerows(sorted(kept_unlinked,
                                key=lambda d: (-d["interaction_pages"], d["form"])))

    print("tier A", flush=True)
    rows_a, stats_a = tier_a(openfda, identity, lex, pages)
    print("  %d rows" % len(rows_a), flush=True)

    print("tier B", flush=True)
    rows_b, not_found, stats_b = tier_b(inxight, identity, pages)
    print("  %d rows" % len(rows_b), flush=True)

    print("tier C", flush=True)
    perpetrators, substrates = cyp_rows(openfda, inxight)
    rows_c1, stats_c1 = rule_c1(perpetrators, substrates, identity, pages)
    rows_c2, stats_c2 = rule_c2(pages, identity)
    qt = qt_members(openfda)
    rows_c3, stats_c3 = rule_c3(pages, identity, qt)
    print("  C1 %d, C2 %d, C3 %d" % (len(rows_c1), len(rows_c2), len(rows_c3)), flush=True)

    every_row = rows_a + rows_b + rows_c1 + rows_c2 + rows_c3
    # The complete table, every rule included, is what the validation measures; the
    # published table is that table without the rules the measurement disabled.
    write_parquet(every_row, os.path.join(OUT_DIR, "interactions-all-rules.parquet"), COLUMNS)
    all_rows = [r for r in every_row if r["rule_id"] not in disabled]
    if disabled:
        print("  disabled rules %s removed %d rows"
              % (sorted(disabled), len(every_row) - len(all_rows)), flush=True)

    write_parquet(all_rows, os.path.join(OUT_DIR, "interactions.parquet"), COLUMNS)

    print("checked sources", flush=True)
    with_rows = defaultdict(set)
    for r in all_rows:
        with_rows[r["tier"]].add(r["page_a"])
    any_row = set()
    for keyset in with_rows.values():
        any_row |= keyset
    checked_rows = []
    for key, page in pages.items():
        sources = list(page["consulted"])
        if key in not_found:
            ids = not_found[key]
            sources.append(
                "NCATS Inxight Drugs curated drug-drug interaction dataset: %d rows checked "
                "and none found (%s%s)"
                % (len(ids), ", ".join(ids[:5]), " and others" if len(ids) > 5 else ""))
        checked_rows.append({
            "page": key,
            "display_name": page["displayName"],
            "model": page["model"],
            "sources_checked": json.dumps(sources),
            "date": page.get("lastVerified") or args.run_date,
            "has_label": "yes" if key in label_pages else "no",
            "rows_tier_a": "yes" if key in with_rows.get("A", ()) else "no",
            "rows_tier_b": "yes" if key in with_rows.get("B", ()) else "no",
            "rows_tier_c": "yes" if key in with_rows.get("C", ()) else "no",
            "statement_only": "no" if key in any_row else "yes",
        })
    checked_columns = ["page", "display_name", "model", "sources_checked", "date", "has_label",
                       "rows_tier_a", "rows_tier_b", "rows_tier_c", "statement_only"]
    write_parquet(checked_rows, os.path.join(OUT_DIR, "checked-sources.parquet"),
                  checked_columns)

    pages_per_rule = defaultdict(set)
    for r in all_rows:
        pages_per_rule[r["rule_id"]].add(r["page_a"])
    summary = {
        "run_date": args.run_date,
        "disabled_rules": sorted(disabled),
        "rows_per_tier": dict(Counter(r["tier"] for r in all_rows)),
        "rows_per_rule": dict(Counter(r["rule_id"] for r in all_rows)),
        "rows_per_band": dict(Counter(r["confidence"] for r in all_rows if r["tier"] == "C")),
        "pages_with_rows_per_tier": {t: len(v) for t, v in with_rows.items()},
        "pages_with_rows_per_rule": {k: len(v) for k, v in pages_per_rule.items()},
        "pages_total": len(pages),
        "pages_with_only_the_checked_sources_statement":
            sum(1 for r in checked_rows if r["statement_only"] == "yes"),
        "pages_with_a_label": len(label_pages & set(pages)),
        "lexicon_forms": lex.size,
        "lexicon_forms_page_linked": kept_resolved,
        "lexicon_forms_named_only": len(kept_unlinked),
        "lexicon_dropped": len(dropped),
        "tier_a_stats": stats_a,
        "tier_b_stats": stats_b,
        "tier_c1_stats": stats_c1,
        "tier_c2_stats": stats_c2,
        "tier_c3_stats": stats_c3,
        "qt_member_pages": len(qt),
        "ddinter": "not read: the non-commercial gate in docs/revamp/BLOCKERS.md is not lifted",
    }
    with open(os.path.join(OUT_DIR, "build-summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, sort_keys=True)

    print(json.dumps({k: summary[k] for k in
                      ("rows_per_tier", "rows_per_rule", "rows_per_band",
                       "pages_with_rows_per_tier",
                       "pages_with_only_the_checked_sources_statement",
                       "qt_member_pages")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
