"""Deterministic CYP-enzyme and transporter role extraction from SPL text.

Reads the `pharmacokinetics` and `drug_interactions` sections of a label and
returns one entry per (enzyme, role, strength) the sentence states about the
labelled drug. Two bases are emitted and always recorded on the entry:

  explicit                    the sentence names the labelled drug and the role
                              directly ("X is a substrate of CYP3A4",
                              "X inhibits CYP2D6", "X is metabolized by CYP2C9").
  coadministration-exposure   the sentence states that co-administering an
                              inhibitor or inducer of the named enzyme changes
                              the labelled drug's exposure, which places the
                              labelled drug as the substrate of that enzyme.

A sentence that names an enzyme but supports neither pattern yields nothing and
is counted as an unassigned mention. No role is guessed.
"""

from __future__ import annotations

import re

DRUG = "thelabeldrug"

CYP_RE = re.compile(
    r"\b(?:cyp(?:s)?|cytochrome\s+p-?450(?:\s*\(cyp\))?|p-?450)\s*[-\s]?"
    r"(1a1|1a2|1b1|2a6|2b6|2c8|2c9|2c18|2c19|2d6|2e1|2j2|3a4/5|3a4|3a5|3a7|3a|4f2)\b",
    re.I,
)

TRANSPORTERS = [
    ("P-gp", re.compile(r"\b(?:p-?gp|p-?glycoprotein|mdr-?1|abcb1)\b", re.I)),
    ("BCRP", re.compile(r"\b(?:bcrp|abcg2)\b", re.I)),
    ("OATP1B1", re.compile(r"\b(?:oatp\s?-?1b1|slco1b1)\b", re.I)),
    ("OATP1B3", re.compile(r"\b(?:oatp\s?-?1b3|slco1b3)\b", re.I)),
    ("OAT1", re.compile(r"\boat-?1\b", re.I)),
    ("OAT3", re.compile(r"\boat-?3\b", re.I)),
    ("OCT1", re.compile(r"\boct-?1\b", re.I)),
    ("OCT2", re.compile(r"\boct-?2\b", re.I)),
    ("MATE1", re.compile(r"\bmate-?1\b", re.I)),
    ("MATE2-K", re.compile(r"\bmate-?2-?k\b", re.I)),
    ("BSEP", re.compile(r"\b(?:bsep|abcb11)\b", re.I)),
    ("MRP2", re.compile(r"\b(?:mrp-?2|abcc2)\b", re.I)),
    ("NTCP", re.compile(r"\b(?:ntcp|slc10a1)\b", re.I)),
]

STRENGTH_RE = re.compile(r"\b(strong|moderate|weak)\b", re.I)

SELF_REFERENCE = re.compile(
    r"(?:^|(?<=[.;:]\s))(?:it|the drug|this drug|the product|this product|"
    r"the active (?:substance|ingredient)|the parent drug)\b",
    re.I,
)

SENTENCE_SPLIT = re.compile(r"(?<=[.;])\s+")

_TOKENS = r"(?:[\w\-,()/]+\s+)"

# Role phrases that sit immediately before the enzyme name.
ROLE_BEFORE = [
    (re.compile(rf"\bsubstrates?\s+(?:of|for)\s+{_TOKENS}{{0,4}}$", re.I), "substrate"),
    (re.compile(rf"\bmetaboli[sz]ed\s+{_TOKENS}{{0,4}}by\s+{_TOKENS}{{0,4}}$", re.I), "substrate"),
    (re.compile(rf"\bmetabolism\s+{_TOKENS}{{0,6}}by\s+{_TOKENS}{{0,4}}$", re.I), "substrate"),
    (re.compile(rf"\btransported\s+by\s+{_TOKENS}{{0,4}}$", re.I), "substrate"),
    (re.compile(rf"\binhibitors?\s+of\s+{_TOKENS}{{0,4}}$", re.I), "inhibitor"),
    (re.compile(rf"\binhibits?\s+{_TOKENS}{{0,4}}$", re.I), "inhibitor"),
    (re.compile(rf"\binducers?\s+of\s+{_TOKENS}{{0,4}}$", re.I), "inducer"),
    (re.compile(rf"\binduces?\s+{_TOKENS}{{0,4}}$", re.I), "inducer"),
]

# Role phrases that sit immediately after the enzyme name.
ROLE_AFTER = [
    (re.compile(rf"^\s*{_TOKENS}{{0,3}}substrates?\b", re.I), "substrate"),
    (re.compile(rf"^\s*{_TOKENS}{{0,3}}inhibitors?\b", re.I), "inhibitor"),
    (re.compile(rf"^\s*{_TOKENS}{{0,3}}induc(?:er|ers|tion)\b", re.I), "inducer"),
]

# A subject other than the labelled drug has taken over before the role phrase.
SUBJECT_BREAK = re.compile(
    r"\b(?:that|which|who|whose|when|if|whereas|because|although|while|unless|"
    r"other|another|any|all|some|most|many|such|these|those|"
    r"agents?|drugs?|medications?|medicinal|compounds?|products?|substances?|"
    r"enzymes?|isozymes?|isoenzymes?|inhibitors?|inducers?|substrates?|"
    r"patients?|subjects?|coadministration|co-administration|"
    r"with|plus|following|after|during|versus|than|from)\b",
    re.I,
)

# The sentence denies the role rather than asserting it.
NEGATION = re.compile(
    r"\b(?:not|no|neither|nor|without|unlikely|minimally|negligible|negligibly|"
    r"minimal|little|lack|lacks|lacking|absence|devoid)\b",
    re.I,
)

COORDINATOR = re.compile(r"\b(?:and|but|or)\b", re.I)

# What may stand between the labelled drug and the role phrase it governs: a
# copula, an auxiliary or an adverb. Anything else — a further noun, a
# preposition, a parenthetical about another product — means the role phrase
# belongs to a different subject.
GAP_HEAD = re.compile(
    r"^[\s,;:]*(?:$|(?:is|are|was|were|be|been|being|has|have|had|does|did|also|"
    r"only|primarily|mainly|predominantly|largely|extensively|partly|partially|"
    r"further|additionally|likewise|appears|appeared|undergoes|underwent|acts|"
    r"acted|itself|however|therefore)\b)",
    re.I,
)

MAX_SUBJECT_GAP = 90


def _strength_before(text: str) -> str | None:
    """Strength stated in the three words that precede the role word."""
    for word in text.split()[-3:]:
        m = STRENGTH_RE.fullmatch(word.strip(",;:()"))
        if m:
            return m.group(1).lower()
    return None


def _subject_is_drug(masked: str, role_start: int) -> bool:
    """True when the labelled drug is the nearest subject before the role phrase."""
    prefix = masked[:role_start]
    drug_at = prefix.rfind(DRUG)
    if drug_at < 0:
        return False
    gap = prefix[drug_at + len(DRUG):]
    if len(gap) > MAX_SUBJECT_GAP:
        return False
    # A coordinator carries the same subject forward, so only the clause after
    # the last one can steal it ("X is an inhibitor of CYP3A4 and also inhibits").
    if not GAP_HEAD.match(gap):
        return False
    clause = COORDINATOR.split(gap)[-1]
    if SUBJECT_BREAK.search(clause) or NEGATION.search(gap):
        return False
    return True


def _assign_role(masked: str, enzyme_pattern: str) -> tuple[str, str | None] | None:
    """Return (role, strength) when the sentence states it of the labelled drug."""
    for m in re.finditer(enzyme_pattern, masked, re.I):
        prefix = masked[: m.start()]
        # The role phrase nearest the enzyme name is the one that governs it.
        before = [
            (hit.start(), role)
            for pattern, role in ROLE_BEFORE
            for hit in [pattern.search(prefix)]
            if hit
        ]
        for start, role in sorted(before, reverse=True):
            if not _subject_is_drug(masked, start):
                continue
            return role, _strength_before(prefix[:start])
        suffix = masked[m.end():]
        for pattern, role in ROLE_AFTER:
            hit = pattern.match(suffix)
            if not hit:
                continue
            if not _subject_is_drug(masked, m.start()):
                continue
            role_word = masked[: m.end() + hit.end()]
            role_word = role_word[: role_word.rfind(" ") + 1] if " " in role_word else role_word
            if NEGATION.search(masked[m.end(): m.end() + hit.end()]):
                continue
            return role, _strength_before(role_word)
    return None


COADMIN_RE = re.compile(
    r"\b(?:co-?administration|co-?administered|concomitant|concurrent|"
    r"when\s+(?:used|given|taken)\s+with|use\s+with)\b", re.I)

EXPOSURE_RE = re.compile(
    r"\b(?:auc|cmax|c\s?max|exposure|plasma\s+concentrations?|serum\s+concentrations?|"
    r"plasma\s+levels?|blood\s+levels?|systemic\s+exposure|bioavailability)\b", re.I)

PERPETRATOR_TEMPLATE = (
    r"(?:(?:strong|moderate|weak)\s+)?(?:{e}\s+(?:and\s+[\w-]+\s+)?(?:inhibitors?|inducers?)"
    r"|(?:inhibitors?|inducers?)\s+of\s+[^.;]{{0,40}}?{e})"
)


def _enzyme_tokens(text: str) -> list[tuple[str, str]]:
    """Return (canonical_name, regex_source) for every enzyme named in the text."""
    found: dict[str, str] = {}
    for m in CYP_RE.finditer(text):
        digits = m.group(1).upper().replace("3A4/5", "3A4")
        canonical = f"CYP{digits}"
        found[canonical] = (
            rf"\b(?:cyp|cytochrome\s+p-?450|p-?450)\s*[-\s]?{re.escape(digits.lower())}\b"
        )
    for canonical, pattern in TRANSPORTERS:
        if pattern.search(text):
            found[canonical] = pattern.pattern
    return sorted(found.items())


def _mask_drug(sentence: str, name_patterns: list[re.Pattern]) -> str:
    masked = sentence
    for pat in name_patterns:
        masked = pat.sub(DRUG, masked)
    masked = SELF_REFERENCE.sub(DRUG, masked)
    return masked


def build_name_patterns(names: list[str]) -> list[re.Pattern]:
    """Regexes matching the labelled drug's own names, longest first."""
    cleaned: list[str] = []
    for name in names:
        n = re.sub(r"\s+", " ", (name or "").strip())
        n = re.sub(r"\s*\([^)]*\)\s*$", "", n).strip()
        if len(n) >= 4 and not n.isdigit():
            cleaned.append(n)
    cleaned = sorted(set(cleaned), key=len, reverse=True)[:25]
    return [re.compile(rf"\b{re.escape(n)}\b", re.I) for n in cleaned]


def extract(sections: dict[str, list[str]], names: list[str]) -> tuple[list[dict], int]:
    """Return (entries, unassigned_mentions) for one label."""
    name_patterns = build_name_patterns(names)
    entries: dict[tuple[str, str, str | None, str], dict] = {}
    unassigned = 0

    for section in ("pharmacokinetics", "drug_interactions"):
        for block in sections.get(section) or []:
            for sentence in SENTENCE_SPLIT.split(block):
                sentence = re.sub(r"\s+", " ", sentence).strip()
                if not (20 <= len(sentence) <= 1200):
                    continue
                tokens = _enzyme_tokens(sentence)
                if not tokens:
                    continue
                masked = _mask_drug(sentence, name_patterns)
                if DRUG not in masked:
                    unassigned += len(tokens)
                    continue
                for canonical, epat in tokens:
                    hit = _assign_role(masked, epat)
                    basis = "explicit"
                    if hit is None:
                        if (
                            COADMIN_RE.search(masked)
                            and EXPOSURE_RE.search(masked)
                            and not NEGATION.search(masked)
                            and re.search(PERPETRATOR_TEMPLATE.format(e=epat), masked, re.I)
                        ):
                            hit = ("substrate", None)
                            basis = "coadministration-exposure"
                    if hit is None:
                        unassigned += 1
                        continue
                    role, strength = hit
                    key = (canonical, role, strength, basis)
                    if key not in entries:
                        entries[key] = {
                            "enzyme": canonical,
                            "role": role,
                            "strength": strength,
                            "basis": basis,
                            "section": section,
                            "sentence": sentence,
                        }
    return list(entries.values()), unassigned
