#!/usr/bin/env python
"""Phase 3 — derived seed computation.

Executes ``docs/specs/derived-content.md`` (the ten mandated seeds 1-10 and the seven kept
own seeds 11-17) over the assembled field records, the registry records and the R2
suppression assignments. Seeds 18-21 were rejected in the spec and are not computed, not
declared and not counted here.

    compute.py --fields data/corpus-20k/fields \
               --registry data/corpus-20k/registry \
               --assignments data/corpus-20k/suppression/assignments.ndjson \
               --out data/corpus-20k/derived

Writes, under ``--out``:

  * ``seed-NN-<slug>.ndjson`` — one line per page that fires the seed: the key, the display
    name, the R7 slot values and the seed's values, every value carrying the source and the
    dates recorded for it upstream.
  * ``indexes/enzyme-transporter.ndjson`` and ``indexes/target.ndjson`` — the two corpus-wide
    bipartite indexes seeds 5 and 13 need. Both are node -> pages; no medicine-to-medicine
    row is ever stored.
  * ``fire-counts.json`` — per seed ``{ computable, fires, sample (10 keys), discarded, reason }``
    plus the file it wrote and the inputs it read.

What this stage does NOT do
---------------------------
* It writes no prose and no question strings. Question wording is produced by the R7
  executor (``docs/specs/question-derivation.md``) from the ``slots`` object each record
  carries. Every string emitted here is either a key, a controlled vocabulary token, or a
  value copied verbatim from a source field.
* It derives nothing the computability column does not state. In particular seed 2 records
  the half-life and the fact that a washout follows from it *in principle*, and never
  computes a washout number (``washoutNumber`` is not an output key at all). Seed 18
  (human-equivalent dose) does not exist.
* Suppression (R2): seeds 1, 2 and 6 are never computed for a suppressed page — the page is
  absent from those files, not present with a flag. The same guard is applied by code, not
  by hand, to any seed whose spec wording names the reader.

Input shapes
------------
*Registry* — read from the published Phase 2 shape (`rnawiki-corpus-20k-registry-match/v1`):
``registry/aggregates/*.ndjson`` carries one pre-aggregated record per page (``stopped``,
``enrolment {max, median, n}``, ``longestDuration``, ``hasResults``,
``completedOverTwoYearsWithoutResults``, ``primaryOutcomes``, ``conditions``, ``ongoing``,
``firstStartDate``), and ``registry/matches/*.ndjson`` carries the page -> NCT mapping, which
no seed needs and which is counted and skipped. Per-trial records and publication records are
also accepted when an input supplies them, and every seed prefers per-trial detail when it is
there. Two facts the aggregate cannot express are reported rather than guessed:

  * no direction of a trial's primary result — seed 6 is ``computable: false``, and seed 2's
    test (c) is ``"unknown"``, which is kept distinct from ``false``;
  * no latest completion date per page (only the longest trial's, and the completed-without-
    results list) — seed 15 is ``computable: false``, and the reason names the field
    (``lastCompletionDate``) that would make it computable.

Seed 16 reports the aggregate's max, median and n, and omits the count under 30 rather than
reporting a 0 the source does not support.

*Fields* — ``data/corpus-20k/fields/`` had not been written when this executor was built, so
the field record shape follows ``docs/specs/field-models.md``: one record per page with
``key``, ``displayName``, ``model`` and ``fields``. Every accessor tolerates reasonable
variation: a field may be addressed by its model name, by its spec number, or by a small alias
set, and a field entry may be the full ``{value, source, sourceDate, lastVerified, verbatim}``
envelope of R9 or a bare value. Where a required input is missing entirely the seed is
reported ``computable: false`` with the reason, never silently zero.

Recorded-fact discipline
------------------------
Two computations look like derivation and are declared here:

  * seed 6 duration — a recorded ``durationDays``/``duration`` field is used when present.
    When it is absent but both the start date and the completion date are recorded, the span
    between those two recorded dates is used and the record carries
    ``durationSource: "recorded start and completion dates"`` together with both dates, so a
    renderer can quote the dates rather than the span.
  * seed 15 years-since and seed 12's two-year cut — both are measured against an explicit
    ``--as-of`` date which is written into every record and into fire-counts.json.

Nothing else converts, extrapolates or rescales a source value.
"""

from __future__ import annotations

import argparse
import glob
import gzip
import io
import json
import os
import re
import statistics
import sys
from collections import defaultdict
from datetime import date, datetime, timezone

try:  # duckdb does the corpus-wide index work and the fire-count aggregation
    import duckdb
except Exception as exc:  # pragma: no cover - environment guard
    duckdb = None
    _DUCKDB_ERROR = exc
else:
    _DUCKDB_ERROR = None


# --------------------------------------------------------------------------- constants

MIN_FIRES = 40  # a seed firing on fewer than this is discarded (spec)
SHARE_LIST_CAP = 50  # bounded co-member list for seeds 5 and 13; count is always exact

ORGANISM_LADDER = [
    "yeast",
    "c. elegans",
    "drosophila",
    "mouse",
    "rat",
    "dog",
    "nhp",
    "human",
]

ORGANISM_ALIASES = {
    "saccharomyces cerevisiae": "yeast",
    "s. cerevisiae": "yeast",
    "budding yeast": "yeast",
    "yeast": "yeast",
    "caenorhabditis elegans": "c. elegans",
    "c elegans": "c. elegans",
    "c. elegans": "c. elegans",
    "celegans": "c. elegans",
    "nematode": "c. elegans",
    "worm": "c. elegans",
    "drosophila melanogaster": "drosophila",
    "drosophila": "drosophila",
    "fruit fly": "drosophila",
    "fly": "drosophila",
    "mus musculus": "mouse",
    "mouse": "mouse",
    "mice": "mouse",
    "murine": "mouse",
    "rattus norvegicus": "rat",
    "rat": "rat",
    "rats": "rat",
    "dog": "dog",
    "dogs": "dog",
    "canine": "dog",
    "beagle": "dog",
    "nhp": "nhp",
    "non-human primate": "nhp",
    "nonhuman primate": "nhp",
    "primate": "nhp",
    "macaque": "nhp",
    "rhesus": "nhp",
    "marmoset": "nhp",
    "monkey": "nhp",
    "human": "human",
    "humans": "human",
    "man": "human",
    "homo sapiens": "human",
}

# Routes that make seed 1 fire: a positive non-human finding given other than by mouth.
PARENTERAL_ROUTES = {
    "iv": "IV",
    "i.v.": "IV",
    "intravenous": "IV",
    "intravenously": "IV",
    "ip": "IP",
    "i.p.": "IP",
    "intraperitoneal": "IP",
    "intraperitoneally": "IP",
    "sc": "SC",
    "s.c.": "SC",
    "subcutaneous": "SC",
    "subcutaneously": "SC",
    "subq": "SC",
}

ORAL_ROUTES = {"oral", "orally", "po", "p.o.", "by mouth", "gavage", "oral gavage", "drinking water", "diet", "dietary", "chow"}

# An explicitly recorded positive direction. A finding with no recorded direction is not
# treated as positive: the seed simply does not fire.
POSITIVE_DIRECTIONS = {
    "positive",
    "increase",
    "increased",
    "increases",
    "extended",
    "extension",
    "lifespan extension",
    "prolonged",
    "improved",
    "improvement",
    "benefit",
    "beneficial",
    "significant",
    "significant increase",
    "met",
    "met primary endpoint",
    "reduced mortality",
}

NULL_DIRECTIONS = {
    "none",
    "no effect",
    "null",
    "negative",
    "not significant",
    "no significant effect",
    "no significant difference",
    "no difference",
    "no benefit",
    "failed",
    "did not meet",
    "did not meet primary endpoint",
    "unchanged",
}

# Rule-based stop-reason lexicon for seed 3. Clusters are tried in this precedence; the
# record also carries every cluster whose lexicon matched.
STOP_CLUSTERS = [
    (
        "safety",
        [
            "safety",
            "toxicity",
            "toxic",
            "adverse event",
            "adverse events",
            "adverse reaction",
            "serious adverse",
            "sae",
            "tolerability",
            "not tolerated",
            "death",
            "deaths",
            "mortality signal",
            "hepatotox",
            "cardiotox",
            "nephrotox",
            "risk to participants",
            "dsmb",
            "data safety monitoring",
        ],
    ),
    (
        "futility/efficacy",
        [
            "futility",
            "futile",
            "lack of efficacy",
            "lack of effect",
            "no efficacy",
            "insufficient efficacy",
            "efficacy",
            "did not meet",
            "failed to meet",
            "interim analysis",
            "primary endpoint not",
            "no benefit",
            "ineffective",
        ],
    ),
    (
        "accrual/recruitment",
        [
            "accrual",
            "recruitment",
            "recruiting",
            "enrollment",
            "enrolment",
            "enroll",
            "enrol",
            "unable to recruit",
            "insufficient participants",
            "low participation",
            "no participants",
            "slow accrual",
            "poor accrual",
        ],
    ),
    (
        "funding/business",
        [
            "funding",
            "funds",
            "financial",
            "finance",
            "budget",
            "business",
            "business reasons",
            "strategic",
            "portfolio",
            "commercial",
            "company decision",
            "resources",
            "lack of resources",
            "acquisition",
            "bankrupt",
            "insolvency",
            "supply",
            "drug supply",
        ],
    ),
    (
        "sponsor decision unspecified",
        [
            "sponsor decision",
            "decision of the sponsor",
            "sponsor's decision",
            "terminated by sponsor",
            "sponsor terminated",
            "sponsor discontinued",
            "administrative",
            "administrative reasons",
            "pi decision",
            "investigator decision",
            "principal investigator left",
            "study closed",
        ],
    ),
]

# Audience endpoints (seed 4, seed 9). Verbatim from the spec, with an exact matching table.
AUDIENCE_ENDPOINTS = {
    "lifespan": ["lifespan", "life span", "life-span", "survival", "overall survival", "all-cause mortality", "all cause mortality", "mortality"],
    "healthspan": ["healthspan", "health span", "health-span"],
    "frailty": ["frailty", "frailty index", "frail"],
    "function": [
        "physical function",
        "physical performance",
        "functional capacity",
        "gait speed",
        "walking speed",
        "6-minute walk",
        "six-minute walk",
        "6 minute walk",
        "sppb",
        "short physical performance battery",
        "chair stand",
        "sit to stand",
        "timed up and go",
        "activities of daily living",
    ],
    "epigenetic age": [
        "epigenetic age",
        "epigenetic clock",
        "dna methylation age",
        "dnam age",
        "methylation age",
        "horvath",
        "hannum",
        "grimage",
        "phenoage",
        "dunedinpace",
        "biological age",
        "age acceleration",
    ],
    "vo2max": ["vo2max", "vo2 max", "vo₂max", "peak oxygen uptake", "maximal oxygen uptake", "maximal oxygen consumption", "cardiorespiratory fitness", "peak vo2"],
    "grip strength": ["grip strength", "handgrip", "hand grip", "hand-grip strength"],
    "insulin sensitivity": [
        "insulin sensitivity",
        "insulin resistance",
        "homa-ir",
        "homa ir",
        "homair",
        "euglycemic clamp",
        "hyperinsulinemic",
        "glucose clamp",
        "oral glucose tolerance",
        "ogtt",
        "glucose disposal",
    ],
    "inflammatory markers": [
        "c-reactive protein",
        "c reactive protein",
        "crp",
        "hs-crp",
        "hscrp",
        "interleukin-6",
        "interleukin 6",
        "il-6",
        "il6",
        "tnf-alpha",
        "tnf alpha",
        "tnfa",
        "tnf-a",
        "inflammatory marker",
        "inflammatory markers",
        "inflammation",
    ],
}

CYP_RE = re.compile(r"\bCYP\s?([0-9]{1,2}[A-Z]{1,2}[0-9]{0,2})\b", re.IGNORECASE)

TRANSPORTER_TOKENS = {
    "p-gp": "P-gp",
    "pgp": "P-gp",
    "p-glycoprotein": "P-gp",
    "abcb1": "P-gp",
    "mdr1": "P-gp",
    "bcrp": "BCRP",
    "abcg2": "BCRP",
    "oatp1b1": "OATP1B1",
    "slco1b1": "OATP1B1",
    "oatp1b3": "OATP1B3",
    "slco1b3": "OATP1B3",
    "oat1": "OAT1",
    "oat3": "OAT3",
    "oct1": "OCT1",
    "oct2": "OCT2",
    "mate1": "MATE1",
    "mate2-k": "MATE2-K",
    "mate2k": "MATE2-K",
    "mrp2": "MRP2",
    "abcc2": "MRP2",
    "bsep": "BSEP",
    "abcb11": "BSEP",
    "ent1": "ENT1",
    "pept1": "PEPT1",
}

ROLE_WORDS = [
    ("inhibitor", "inhibitor"),
    ("inhibits", "inhibitor"),
    ("inhibition", "inhibitor"),
    ("inducer", "inducer"),
    ("induces", "inducer"),
    ("induction", "inducer"),
    ("substrate", "substrate"),
    ("metabolized by", "substrate"),
    ("metabolised by", "substrate"),
]

JURISDICTIONS_SEED17 = ["US", "EU", "UK", "CA", "SG"]  # AU and JP are UNKNOWN (Phase 0a)

APPROVED_STATUSES = {"approved", "authorised", "authorized", "marketed", "licensed"}
STOPPED_STATUSES = {"withdrawn", "suspended", "revoked", "discontinued", "terminated", "failed"}


# --------------------------------------------------------------------------- primitives

_NON = re.compile(r"[^a-z0-9]+")


def norm(value) -> str:
    """Lower-case, punctuation-collapsed form used for every exact-term comparison."""
    if value is None:
        return ""
    return _NON.sub(" ", str(value).lower()).strip()


def as_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    return [value]


def first_str(mapping, *names):
    """First non-empty string among the named keys of a mapping."""
    if not isinstance(mapping, dict):
        return None
    for name in names:
        if name in mapping and mapping[name] not in (None, "", [], {}):
            value = mapping[name]
            if isinstance(value, (str, int, float)):
                return str(value)
    return None


def first_any(mapping, *names):
    if not isinstance(mapping, dict):
        return None
    for name in names:
        if name in mapping and mapping[name] not in (None, "", [], {}):
            return mapping[name]
    return None


def to_int(value):
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    match = re.search(r"-?\d+", str(value))
    return int(match.group(0)) if match else None


def to_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    text = norm(value)
    if text in {"true", "yes", "y", "1"}:
        return True
    if text in {"false", "no", "n", "0"}:
        return False
    return None


_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_date(value):
    """Return (verbatim, date) for a recorded date. The verbatim string is what is emitted."""
    if value is None:
        return (None, None)
    if isinstance(value, dict):
        value = first_any(value, "value", "date", "dateString", "text")
        if value is None:
            return (None, None)
    text = str(value).strip()
    if not text:
        return (None, None)
    match = re.match(r"^(\d{4})-(\d{2})-(\d{2})", text)
    if match:
        try:
            return (text, date(int(match.group(1)), int(match.group(2)), int(match.group(3))))
        except ValueError:
            return (text, None)
    match = re.match(r"^(\d{4})-(\d{2})$", text)
    if match:
        return (text, date(int(match.group(1)), int(match.group(2)), 1))
    match = re.match(r"^(\d{4})$", text)
    if match:
        return (text, date(int(match.group(1)), 1, 1))
    match = re.match(r"^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$", text)
    if match:
        month = _MONTHS.get(match.group(1)[:3].lower())
        if month:
            try:
                return (text, date(int(match.group(3)), month, int(match.group(2))))
            except ValueError:
                return (text, None)
    match = re.match(r"^([A-Za-z]{3,9})\s+(\d{4})$", text)
    if match:
        month = _MONTHS.get(match.group(1)[:3].lower())
        if month:
            return (text, date(int(match.group(2)), month, 1))
    return (text, None)


def year_of(dt, verbatim):
    if dt is not None:
        return dt.year
    if verbatim:
        match = re.search(r"\b(1[89]\d{2}|20\d{2}|21\d{2})\b", str(verbatim))
        if match:
            return int(match.group(1))
    return None


def organism_of(value):
    """Map a recorded organism string onto the eight-rung ladder, or None."""
    text = norm(value)
    if not text:
        return None
    if text in ORGANISM_ALIASES:
        return ORGANISM_ALIASES[text]
    for alias, rung in ORGANISM_ALIASES.items():
        if re.search(r"\b" + re.escape(alias) + r"\b", text):
            return rung
    return None


def route_of(value):
    """Return ('IV'|'IP'|'SC'|'oral'|None, verbatim) for a recorded route string."""
    if value is None:
        return (None, None)
    verbatim = str(value)
    text = norm(value)
    if not text:
        return (None, None)
    if text in PARENTERAL_ROUTES:
        return (PARENTERAL_ROUTES[text], verbatim)
    if text in ORAL_ROUTES:
        return ("oral", verbatim)
    for alias, canonical in PARENTERAL_ROUTES.items():
        if re.search(r"(^|\s)" + re.escape(alias) + r"(\s|$)", text):
            return (canonical, verbatim)
    for alias in ORAL_ROUTES:
        if re.search(r"(^|\s)" + re.escape(alias) + r"(\s|$)", text):
            return ("oral", verbatim)
    return (None, verbatim)


# Amendment of 2026-09-04 (Phase 2c): the assembled organism-ladder rungs carry no `route`
# field — the extractor stores the abstract sentence itself. Seed 1's study route is therefore
# read from the sentence's own route word. The vocabulary is closed and the matched text is
# carried verbatim; nothing is inferred from a compound name, a formulation or a title.
SENTENCE_ROUTE_WORDS = (
    ("IP", r"intraperitoneally|intraperitoneal|i\.p\."),
    ("IV", r"intravenously|intravenous|i\.v\."),
    ("SC", r"subcutaneously|subcutaneous|s\.c\."),
    ("oral", r"orally|oral|gavage|in the diet|in drinking water"),
)
SENTENCE_ROUTE_PATTERN = re.compile(
    "|".join("(?P<%s>%s)" % (canonical.replace(".", ""), pattern) for canonical, pattern in SENTENCE_ROUTE_WORDS),
    re.IGNORECASE,
)
_SENTENCE_ROUTE_GROUPS = {canonical.replace(".", ""): canonical for canonical, _ in SENTENCE_ROUTE_WORDS}


def sentence_route(text):
    """('IV'|'IP'|'SC'|'oral'|None, verbatim) from a stored sentence's own route word.

    The first route word the sentence prints wins, and the verbatim value is exactly the
    characters matched. A sentence with no route word yields (None, None): seed 1 then has no
    route to state and does not fire on that finding.
    """
    if not text:
        return (None, None)
    match = SENTENCE_ROUTE_PATTERN.search(str(text))
    if match is None:
        return (None, None)
    for group, canonical in _SENTENCE_ROUTE_GROUPS.items():
        if match.group(group):
            return (canonical, match.group(group))
    return (None, None)


def direction_of(record):
    """True / False / None for a recorded result direction. None means 'not recorded'."""
    if not isinstance(record, dict):
        return None
    explicit = first_any(record, "reportedEffect", "hasEffect", "positive", "effectReported")
    flag = to_bool(explicit)
    if flag is not None:
        return flag
    raw = first_str(
        record,
        "resultDirection",
        "direction",
        "effectDirection",
        "outcomeDirection",
        "result",
        "outcome",
        "finding",
    )
    if raw is None:
        return None
    text = norm(raw)
    if text in NULL_DIRECTIONS:
        return False
    if text in POSITIVE_DIRECTIONS:
        return True
    for phrase in sorted(NULL_DIRECTIONS, key=len, reverse=True):
        if phrase in text:
            return False
    for phrase in sorted(POSITIVE_DIRECTIONS, key=len, reverse=True):
        if phrase in text:
            return True
    return None


DURATION_PATTERN = re.compile(r"(\d+)[- ](day|week|month|year)s?", re.IGNORECASE)
DURATION_UNIT_ORDER = {"day": 1, "week": 7, "month": 30, "year": 365}


def duration_in_sentence(text):
    r"""The first duration a sentence states, as {verbatim, number, unit}, or None.

    The pattern is the one fixed in docs/specs/field-models.md:
    ``(\d+)[- ](day|week|month|year)s?``. One guard is applied to it: a match whose digits are
    the fractional part of a decimal ("1.85 years") is skipped, because that is an effect size
    the source states, not a duration.
    """
    if not text:
        return None
    text = str(text)
    for match in DURATION_PATTERN.finditer(text):
        start = match.start(1)
        if start >= 2 and text[start - 1] in ".," and text[start - 2].isdigit():
            continue
        return {
            "verbatim": match.group(0),
            "number": int(match.group(1)),
            "unit": match.group(2).lower(),
        }
    return None


def sentence_effect(text):
    """True / False / None for an effect a stored sentence states in its own words.

    The same lexicons the registry route uses; the longest matching phrase wins, and a null
    phrase wins a tie so that "no significant increase" never reads as an increase.
    """
    normalized = norm(text)
    if not normalized:
        return None
    padded = " " + normalized + " "
    best_length = 0
    best = None
    for phrase, flag in [(p, False) for p in NULL_DIRECTIONS] + [(p, True) for p in POSITIVE_DIRECTIONS]:
        needle = " " + norm(phrase) + " "
        if needle in padded and len(needle) > best_length:
            best_length = len(needle)
            best = flag
    return best


def audience_endpoint_of(text):
    """Exact-table match of a recorded outcome string onto the audience endpoint list."""
    normalized = norm(text)
    if not normalized:
        return None
    padded = " " + normalized + " "
    for endpoint, terms in AUDIENCE_ENDPOINTS.items():
        for term in terms:
            if " " + norm(term) + " " in padded:
                return endpoint
    return None


# --------------------------------------------------------------------------- field access

# Every model's fields, keyed by the alias set an assembler might plausibly have used.
FIELD_ALIASES = {
    # LONGEVITY (15)
    "hallmarks": (1, ["hallmarks", "hallmarksofaging", "hallmarkofaging", "hallmark", "aginghallmarks"]),
    "ladder": (2, ["ladder", "modelorganismladder", "organismladder", "modelorganism", "rungs", "organisms"]),
    "itp": (3, ["itp", "niaitp", "nia_itp", "interventionstestingprogram"]),
    "endpointtype": (4, ["endpointtype", "endpointtypeperfinding", "endpointtypes"]),
    "humanceiling": (5, ["humanceiling", "humanevidenceceiling", "humanevidence", "ceiling"]),
    "clocks": (6, ["clocks", "epigeneticclocks", "epigeneticclock"]),
    "doseresponse": (7, ["doseresponse", "doseresponseshape", "responseshape"]),
    "pathway": (8, ["pathway", "pathways"]),
    "kinetics": (9, ["kinetics", "labelkinetics", "pharmacokinetics", "pk"]),
    "interactions": (10, ["interactions", "interaction", "druginteractions"]),
    "trialfailures": (11, ["trialfailures", "failedtrials", "stoppedtrials", "trialfailure"]),
    "biomarkers": (12, ["biomarkers", "biomarkersmeasured", "measuredbiomarkers"]),
    "regulatorystatus": (13, ["regulatorystatus", "regulatorystatusbyjurisdiction", "jurisdictions", "regulatory", "statusbyjurisdiction"]),
    "ongoingtrials": (14, ["ongoingtrials", "ongoing", "runningtrials", "activetrials"]),
    "faers": (15, ["faers", "faerssignal", "adversereportsignal", "spontaneousreports"]),
    # CLINICAL extras
    "indication": (None, ["indication", "indications", "labelindication"]),
    "adverseevents": (None, ["adverseevents", "adversereactions", "labeladverseevents", "adverseeventsections"]),
    "trialhistory": (None, ["trialhistory", "trialcounts", "trialsbyphase"]),
    "withdrawalstatus": (None, ["withdrawalstatus", "withdrawal", "withdrawn"]),
    # DEVELOPMENT
    "moleculartarget": (None, ["moleculartarget", "target", "targets", "moleculartargets"]),
    "mechanismclass": (None, ["mechanismclass", "mechanism", "moa", "actiontype"]),
    "highestphase": (None, ["highestphase", "maxphase", "highestphasereached", "phase"]),
    "whystopped": (None, ["whystopped", "whydevelopmentstopped", "developmentstopped", "stopreason"]),
    "sponsor": (None, ["sponsor", "sponsors"]),
    "patentstatus": (None, ["patentstatus", "patent"]),
    "everdosed": (None, ["everdosed", "everdosedinhumans", "everdosedinhuman", "humanexposure"]),
    "relatedcompounds": (None, ["relatedcompounds", "relatedontarget", "sametargetcompounds", "related"]),
}


def _alias_index():
    index = {}
    for canonical, (number, aliases) in FIELD_ALIASES.items():
        for alias in aliases:
            index[alias] = canonical
        if number is not None:
            for pattern in (str(number), "field%d" % number, "f%d" % number, "field_%d" % number):
                index[pattern] = canonical
    return index


ALIAS_INDEX = _alias_index()


def _alias_key(raw_key):
    return _NON.sub("", str(raw_key).lower())


class FieldValue:
    """A present field: its value plus the R9 provenance envelope."""

    __slots__ = ("name", "value", "source", "source_date", "last_verified", "verbatim", "state")

    def __init__(self, name, value, source=None, source_date=None, last_verified=None, verbatim=None, state="present"):
        self.name = name
        self.value = value
        self.source = source
        self.source_date = source_date
        self.last_verified = last_verified
        self.verbatim = verbatim
        self.state = state

    def provenance(self):
        out = {}
        if self.source is not None:
            out["source"] = self.source
        if self.source_date is not None:
            out["sourceDate"] = self.source_date
        if self.last_verified is not None:
            out["lastVerified"] = self.last_verified
        if self.verbatim is not None:
            out["verbatim"] = self.verbatim
        return out

    def sourced(self, value=None, **extra):
        out = {"value": self.value if value is None else value}
        out.update(self.provenance())
        out.update(extra)
        return out


def _normalize_field_entry(name, entry):
    """Accept the full R9 envelope, a bare value, or a list of values."""
    if entry is None:
        return None
    if isinstance(entry, dict) and "state" in entry:
        state = norm(entry.get("state"))
        if state != "present":
            return None
        value = entry.get("value", entry.get("values"))
        if value is None:
            # An envelope with the payload inline rather than under "value".
            value = {k: v for k, v in entry.items() if k not in {"state", "source", "sourceDate", "lastVerified", "verbatim"}}
            if not value:
                return None
        return FieldValue(
            name,
            value,
            source=entry.get("source"),
            source_date=entry.get("sourceDate") or entry.get("source_date"),
            last_verified=entry.get("lastVerified") or entry.get("last_verified"),
            verbatim=entry.get("verbatim"),
        )
    if isinstance(entry, dict) and ("value" in entry or "values" in entry):
        value = entry.get("value", entry.get("values"))
        if value in (None, "", [], {}):
            return None
        return FieldValue(
            name,
            value,
            source=entry.get("source"),
            source_date=entry.get("sourceDate") or entry.get("source_date"),
            last_verified=entry.get("lastVerified") or entry.get("last_verified"),
            verbatim=entry.get("verbatim"),
        )
    if entry in ("", [], {}, None):
        return None
    return FieldValue(name, entry)


class Page:
    """One canonical page: identity, model, suppression, and its normalized fields."""

    __slots__ = ("key", "display_name", "model", "suppressed", "fields", "raw")

    def __init__(self, key, display_name, model, suppressed, fields, raw=None):
        self.key = key
        self.display_name = display_name
        self.model = model
        self.suppressed = suppressed
        self.fields = fields
        self.raw = raw or {}

    def field(self, name):
        return self.fields.get(name)


def build_page(record, suppressed_keys, display_names=None):
    key = first_str(record, "key", "canonicalKey", "canonical_key", "pageKey", "slug", "id")
    if not key:
        return None
    display = first_str(record, "displayName", "display_name", "name", "title") or (display_names or {}).get(key) or key
    model = (first_str(record, "model", "fieldModel", "field_model", "tierModel") or "").upper()
    raw_fields = record.get("fields")
    if not isinstance(raw_fields, dict):
        raw_fields = {k: v for k, v in record.items() if k not in {"key", "canonicalKey", "displayName", "name", "model", "fieldModel", "suppressed", "tier"}}
    fields = {}
    for raw_key, entry in raw_fields.items():
        canonical = ALIAS_INDEX.get(_alias_key(raw_key))
        if canonical is None:
            continue
        value = _normalize_field_entry(canonical, entry)
        if value is not None and canonical not in fields:
            fields[canonical] = value
    suppressed = key in suppressed_keys
    flag = to_bool(record.get("suppressed"))
    if flag is True:
        suppressed = True
    return Page(key, display, model, suppressed, fields, record)


# --------------------------------------------------------------------------- IO

def open_maybe_gzip(path):
    if path.endswith(".gz"):
        return io.TextIOWrapper(gzip.open(path, "rb"), encoding="utf-8")
    return open(path, encoding="utf-8")


def iter_ndjson(path):
    with open_maybe_gzip(path) as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                print("  ! %s:%d unparsable JSON (%s); line skipped" % (os.path.basename(path), line_number, exc), file=sys.stderr)


def iter_records(directory):
    """Every record under a directory: NDJSON lines, or JSON arrays / {records:[...]}."""
    if not directory or not os.path.isdir(directory):
        return
    paths = []
    for pattern in ("**/*.ndjson", "**/*.ndjson.gz", "**/*.jsonl", "**/*.jsonl.gz", "**/*.json"):
        paths.extend(glob.glob(os.path.join(directory, pattern), recursive=True))
    for path in sorted(set(paths)):
        if os.path.basename(path).startswith("."):
            continue
        if path.endswith(".json") and not path.endswith(".ndjson"):
            try:
                with open_maybe_gzip(path) as handle:
                    payload = json.load(handle)
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
            if isinstance(payload, list):
                for record in payload:
                    if isinstance(record, dict):
                        yield path, record
            elif isinstance(payload, dict):
                for container in ("records", "rows", "pages", "trials", "publications", "data"):
                    if isinstance(payload.get(container), list):
                        for record in payload[container]:
                            if isinstance(record, dict):
                                yield path, record
                        break
            continue
        for record in iter_ndjson(path):
            if isinstance(record, dict):
                yield path, record


def load_assignments(path):
    """R2 assignments -> (suppressed keys, display names, record count).

    The assignments file is also the corpus's name table: the assembled field records carry
    only the canonical key, so the display name a renderer needs is read from here.
    """
    suppressed = set()
    names = {}
    total = 0
    if not path or not os.path.exists(path):
        return suppressed, names, 0
    for record in iter_ndjson(path):
        key = first_str(record, "key", "canonicalKey", "pageKey")
        if not key:
            continue
        total += 1
        display = first_str(record, "displayName", "display_name", "name")
        if display:
            names[key] = display
        if to_bool(record.get("suppressed")) is True:
            suppressed.add(key)
    return suppressed, names, total


# --------------------------------------------------------------------------- registry

PAGE_KEY_FIELDS = (
    "key",
    "keys",
    "canonicalKey",
    "canonicalKeys",
    "compoundKey",
    "compoundKeys",
    "pageKey",
    "pageKeys",
    "medicineKey",
    "medicineKeys",
    "interventionKeys",
    "drugKeys",
)


def record_page_keys(record):
    keys = []
    for name in PAGE_KEY_FIELDS:
        value = record.get(name)
        if value in (None, "", [], {}):
            continue
        for item in as_list(value):
            if isinstance(item, str) and item:
                keys.append(item)
            elif isinstance(item, dict):
                inner = first_str(item, "key", "canonicalKey", "pageKey")
                if inner:
                    keys.append(inner)
    seen = []
    for key in keys:
        if key not in seen:
            seen.append(key)
    return seen


def outcome_strings(value):
    """Flatten a recorded outcome-measure structure to its measure strings."""
    out = []
    for item in as_list(value):
        if isinstance(item, str):
            if item.strip():
                out.append(item.strip())
        elif isinstance(item, dict):
            text = first_str(item, "measure", "outcomeMeasure", "title", "name", "endpoint", "term", "value")
            if text:
                out.append(text)
    return out


class Trial:
    __slots__ = (
        "nct", "keys", "status", "phase", "is_human", "enrollment", "start_verbatim", "start_date",
        "completion_verbatim", "completion_date", "primary_outcomes", "all_outcomes", "conditions",
        "why_stopped", "has_results", "effect", "duration_days", "duration_source", "sex_results",
        "source", "source_date", "last_verified", "raw",
    )


def build_trial(record):
    nct = first_str(record, "nct", "nctId", "nct_id", "nctid", "registryId", "id")
    if not nct or not re.match(r"^NCT\d+$", nct.strip(), re.IGNORECASE):
        return None
    trial = Trial()
    trial.nct = nct.strip().upper()
    trial.keys = record_page_keys(record)
    trial.status = first_str(record, "status", "overallStatus", "recruitmentStatus")
    trial.phase = first_str(record, "phase", "phases")
    organism = first_str(record, "organism", "species", "model")
    rung = organism_of(organism) if organism else None
    trial.is_human = True if rung is None else (rung == "human")
    trial.enrollment = to_int(first_any(record, "enrollment", "enrolment", "N", "n", "participants", "enrollmentCount", "actualEnrollment"))
    trial.start_verbatim, trial.start_date = parse_date(first_any(record, "startDate", "start_date", "start"))
    trial.completion_verbatim, trial.completion_date = parse_date(
        first_any(record, "completionDate", "completion_date", "primaryCompletionDate", "completed", "endDate")
    )
    trial.primary_outcomes = outcome_strings(first_any(record, "primaryOutcomes", "primaryOutcome", "primaryOutcomeMeasures", "primaryEndpoint", "primaryEndpoints"))
    other = outcome_strings(first_any(record, "secondaryOutcomes", "outcomeMeasures", "outcomes", "secondaryOutcomeMeasures"))
    trial.all_outcomes = trial.primary_outcomes + [o for o in other if o not in trial.primary_outcomes]
    trial.conditions = [c for c in outcome_strings(first_any(record, "conditions", "condition")) if c]
    trial.why_stopped = first_str(record, "whyStopped", "why_stopped", "whyStoppedText", "terminationReason")
    trial.has_results = to_bool(first_any(record, "hasResults", "has_results", "resultsPosted", "resultsFirstPosted"))
    trial.effect = direction_of(record)
    duration = to_int(first_any(record, "durationDays", "duration_days"))
    if duration is not None:
        trial.duration_days = duration
        trial.duration_source = "recorded duration field"
    elif trial.start_date and trial.completion_date:
        trial.duration_days = (trial.completion_date - trial.start_date).days
        trial.duration_source = "recorded start and completion dates"
    else:
        trial.duration_days = None
        trial.duration_source = None
    trial.sex_results = as_list(first_any(record, "sexResults", "sexStratifiedResults", "resultsBySex", "bySex"))
    trial.source = record.get("source") or {"kind": "registry", "id": trial.nct}
    trial.source_date = first_str(record, "sourceDate", "source_date", "lastUpdate", "lastUpdatePostDate")
    trial.last_verified = first_str(record, "lastVerified", "last_verified")
    trial.raw = record
    return trial


class Publication:
    __slots__ = (
        "pmid", "doi", "ncts", "keys", "date_verbatim", "date", "is_clinical_trial", "organism",
        "route", "effect", "outcomes", "sex_results", "title", "source", "source_date", "raw",
    )


def build_publication(record):
    pmid = first_str(record, "pmid", "PMID", "pubmedId", "pmcid", "PMCID", "doi", "DOI")
    if not pmid:
        return None
    pub = Publication()
    pub.pmid = pmid
    pub.doi = first_str(record, "doi", "DOI")
    ncts = []
    for item in as_list(first_any(record, "nct", "ncts", "nctIds", "registryIds", "linkedNct")):
        if isinstance(item, str) and re.match(r"^NCT\d+$", item.strip(), re.IGNORECASE):
            ncts.append(item.strip().upper())
    pub.ncts = ncts
    pub.keys = record_page_keys(record)
    pub.date_verbatim, pub.date = parse_date(
        first_any(record, "date", "publicationDate", "pubDate", "year", "firstPublished", "publishedOn")
    )
    kinds = " ".join(str(x) for x in as_list(first_any(record, "publicationTypes", "publicationType", "type", "recordType")) if x)
    flag = to_bool(first_any(record, "isClinicalTrial", "clinicalTrial"))
    if flag is None:
        flag = bool(re.search(r"clinical trial|randomi[sz]ed controlled", kinds, re.IGNORECASE))
    pub.is_clinical_trial = flag
    pub.organism = first_str(record, "organism", "species", "model")
    pub.route = first_str(record, "route", "administrationRoute", "routeOfAdministration")
    pub.effect = direction_of(record)
    pub.outcomes = outcome_strings(first_any(record, "outcomes", "endpoints", "measures", "biomarkers"))
    pub.sex_results = as_list(first_any(record, "sexResults", "sexStratifiedResults", "resultsBySex", "bySex"))
    pub.title = first_str(record, "title")
    pub.source = record.get("source") or {"kind": "literature", "id": pmid}
    pub.source_date = first_str(record, "sourceDate", "source_date")
    pub.raw = record
    return pub


AGGREGATE_MARKERS = ("studies", "byPhase", "byOverallStatus", "enrolment", "enrollment", "primaryOutcomes", "ongoing", "stopped")


def build_aggregate(record):
    """A per-page registry aggregate (`rnawiki-corpus-20k-registry-match/v1` aggregates/*)."""
    key = first_str(record, "key", "canonicalKey", "pageKey")
    if not key:
        return None
    if not any(marker in record for marker in AGGREGATE_MARKERS):
        return None
    enrolment = record.get("enrolment") or record.get("enrollment") or {}
    aggregate = {
        "key": key,
        "displayName": first_str(record, "displayName", "name"),
        "studies": to_int(record.get("studies")),
        "summarised": to_int(record.get("summarised")),
        "byPhase": record.get("byPhase") or {},
        "byOverallStatus": record.get("byOverallStatus") or {},
        "stopped": [s for s in as_list(record.get("stopped")) if isinstance(s, dict)],
        "enrolment": enrolment if isinstance(enrolment, dict) else {},
        "longestDuration": record.get("longestDuration") if isinstance(record.get("longestDuration"), dict) else None,
        "hasResults": to_int(record.get("hasResults")),
        "completedOverTwoYearsWithoutResults": [s for s in as_list(record.get("completedOverTwoYearsWithoutResults")) if isinstance(s, dict)],
        "primaryOutcomes": [s for s in as_list(record.get("primaryOutcomes")) if isinstance(s, dict)],
        "primaryOutcomesTruncated": to_bool(record.get("primaryOutcomesTruncated")),
        "conditions": [c for c in as_list(record.get("conditions")) if c],
        "conditionsTruncated": to_bool(record.get("conditionsTruncated")),
        "ongoing": [s for s in as_list(record.get("ongoing")) if isinstance(s, dict)],
        "firstStartDate": first_str(record, "firstStartDate"),
        # v3 of the aggregate records the latest completion as an object carrying the NCT and its
        # source; v2 recorded nothing at all. Both shapes and a bare date string are accepted, and
        # the object is kept whole so seed 15 can cite the exact study.
        "lastCompletionDate": first_any(record, "lastCompletionDate", "latestCompletionDate"),
        # v3 also publishes one row per matched study. Seed 2's test (c) and any per-trial
        # enrolment question read it; nothing here is summed or re-derived.
        "perTrial": [t for t in as_list(record.get("perTrial")) if isinstance(t, dict)],
    }
    return aggregate


def load_registry(directory):
    """Classify the registry directory: per-page aggregates, per-trial records, publications.

    The Phase 2 registry publishes ``aggregates/*.ndjson`` (one pre-aggregated record per page)
    and ``matches/*.ndjson`` (page -> NCT ids). Per-trial and publication records are also
    accepted when a registry input provides them; the seeds prefer per-trial detail and fall
    back to the aggregate.
    """
    trials_by_key = defaultdict(list)
    pubs_by_key = defaultdict(list)
    aggregates = {}
    trial_count = 0
    pub_count = 0
    match_count = 0
    files = set()
    for path, record in iter_records(directory):
        aggregate = build_aggregate(record)
        if aggregate is not None:
            files.add(path)
            aggregates.setdefault(aggregate["key"], aggregate)
            continue
        trial = build_trial(record)
        if trial is not None:
            files.add(path)
            trial_count += 1
            for key in trial.keys:
                trials_by_key[key].append(trial)
            continue
        pub = build_publication(record)
        if pub is not None:
            files.add(path)
            pub_count += 1
            for key in pub.keys:
                pubs_by_key[key].append(pub)
            continue
        if record.get("nctIds") is not None:  # matches/*: page -> NCT mapping, carried by the aggregate
            files.add(path)
            match_count += 1
    return {
        "trials": trials_by_key,
        "publications": pubs_by_key,
        "aggregates": aggregates,
        "trialCount": trial_count,
        "publicationCount": pub_count,
        "aggregateCount": len(aggregates),
        "matchCount": match_count,
        "files": sorted(files),
    }


# --------------------------------------------------------------------------- context

class Context:
    """Everything a seed reads, with one accessor per registry fact.

    Each accessor prefers per-trial registry records when the input provides them and falls
    back to the per-page aggregate. ``capabilities`` records which registry facts the input
    can express at all, so a seed the input cannot support is reported as not computable with
    the exact missing fact rather than as zero fires.
    """

    def __init__(self, pages, registry, as_of, out_dir):
        self.pages = pages
        self.pages_by_key = {p.key: p for p in pages}
        self.trials = registry["trials"]
        self.publications = registry["publications"]
        self.aggregates = registry.get("aggregates", {})
        self.registry_trial_count = registry["trialCount"]
        self.registry_publication_count = registry["publicationCount"]
        self.as_of = as_of
        self.out_dir = out_dir
        self.enzyme_index = {}
        self.target_index = {}
        self.page_enzymes = defaultdict(list)
        self.page_targets = defaultdict(list)
        self.notes = []
        self.capabilities = self._capabilities()

    def _capabilities(self):
        capabilities = set()
        if self.aggregates:
            capabilities.add("registryAggregates")
        if self.registry_trial_count:
            capabilities.add("perTrialRecords")
        if self.registry_publication_count:
            capabilities.add("publications")
        for trials in self.trials.values():
            for trial in trials:
                if trial.effect is not None:
                    capabilities.add("trialResultDirections")
                if trial.completion_date is not None:
                    capabilities.add("perTrialCompletionDates")
                if trial.enrollment is not None:
                    capabilities.add("perTrialEnrolments")
        for aggregate in self.aggregates.values():
            if aggregate.get("lastCompletionDate"):
                capabilities.add("latestCompletionDate")
            for row in aggregate.get("perTrial") or ():
                if to_int(first_any(row, "enrollment", "enrolment", "n", "N")) is not None:
                    capabilities.add("perTrialEnrolments")
        if "perTrialCompletionDates" in capabilities:
            capabilities.add("latestCompletionDate")
        if self.registry_publication_count:
            capabilities.add("latestCompletionDate")
        return capabilities

    # -- raw records ------------------------------------------------------
    def human_trials(self, key):
        return [t for t in self.trials.get(key, []) if t.is_human]

    def pubs(self, key):
        return self.publications.get(key, [])

    def aggregate(self, key):
        return self.aggregates.get(key)

    # -- unified registry facts -------------------------------------------
    def registry_source(self, key, nct=None):
        return {"kind": "registry", "id": nct} if nct else {"kind": "registry", "page": key}

    def stopped_trials(self, key):
        """[{nct, status, whyStopped, source}] — trials the registry records as stopped."""
        rows = [
            {"nct": t.nct, "status": t.status, "whyStopped": t.why_stopped, "source": t.source, "sourceDate": t.source_date}
            for t in self.trials.get(key, [])
            if t.why_stopped
        ]
        if rows:
            return rows
        aggregate = self.aggregate(key)
        if not aggregate:
            return []
        return [
            {
                "nct": first_str(entry, "nct"),
                "status": first_str(entry, "status"),
                "whyStopped": first_str(entry, "whyStopped", "why_stopped"),
                "source": self.registry_source(key, first_str(entry, "nct")),
                "sourceDate": None,
            }
            for entry in aggregate["stopped"]
            if first_str(entry, "whyStopped", "why_stopped")
        ]

    def primary_outcomes(self, key):
        """[(nct, measure)] over the page's human trials."""
        rows = []
        for trial in self.human_trials(key):
            for measure in trial.primary_outcomes or trial.all_outcomes:
                rows.append((trial.nct, measure))
        if rows:
            return rows
        aggregate = self.aggregate(key)
        if not aggregate:
            return []
        return [
            (first_str(entry, "nct"), first_str(entry, "measure", "outcome", "title"))
            for entry in aggregate["primaryOutcomes"]
            if first_str(entry, "measure", "outcome", "title")
        ]

    def conditions(self, key):
        rows = []
        for trial in self.trials.get(key, []):
            rows.extend(trial.conditions)
        if rows:
            return rows
        aggregate = self.aggregate(key)
        return list(aggregate["conditions"]) if aggregate else []

    def ongoing_trials(self, key):
        """[{nct, title, n, primaryEndpoints, completionDate, source}] from the registry."""
        rows = []
        for trial in self.trials.get(key, []):
            if trial.status and norm(trial.status).replace(" ", "_") in {"recruiting", "active_not_recruiting", "enrolling_by_invitation", "not_yet_recruiting"}:
                rows.append({
                    "nct": trial.nct,
                    "title": first_str(trial.raw, "title", "briefTitle"),
                    "n": trial.enrollment,
                    "primaryEndpoints": trial.primary_outcomes,
                    "completionDate": trial.completion_verbatim,
                    "source": trial.source,
                    "sourceDate": trial.source_date,
                })
        if rows:
            return rows
        aggregate = self.aggregate(key)
        if not aggregate:
            return []
        out = []
        for entry in aggregate["ongoing"]:
            nct = first_str(entry, "nct")
            endpoints = outcome_strings(first_any(entry, "primaryOutcome", "primaryOutcomes", "primaryEndpoint"))
            out.append({
                "nct": nct,
                "title": first_str(entry, "title"),
                "n": to_int(first_any(entry, "n", "N", "enrolment", "enrollment")),
                "primaryEndpoints": endpoints,
                "completionDate": first_str(entry, "completionDate", "completion"),
                "source": self.registry_source(key, nct),
                "sourceDate": None,
            })
        return out

    def completed_without_results(self, key):
        """Completed trials the registry records without posted results, with their dates."""
        rows = []
        for trial in self.human_trials(key):
            if trial.has_results is False and (trial.completion_date or trial.completion_verbatim):
                rows.append({
                    "nct": trial.nct,
                    "status": trial.status,
                    "completionDate": trial.completion_verbatim,
                    "completionDateParsed": trial.completion_date,
                    "n": trial.enrollment,
                    "source": trial.source,
                    "sourceDate": trial.source_date,
                })
        if rows:
            return rows
        aggregate = self.aggregate(key)
        if not aggregate:
            return []
        out = []
        for entry in aggregate["completedOverTwoYearsWithoutResults"]:
            nct = first_str(entry, "nct")
            verbatim, parsed = parse_date(first_any(entry, "completionDate", "completion"))
            out.append({
                "nct": nct,
                "status": None,
                "completionDate": verbatim,
                "completionDateParsed": parsed,
                "n": None,
                "source": self.registry_source(key, nct),
                "sourceDate": None,
            })
        return out

    def enrolments(self, key):
        """{max, median, n, countUnder30?, trials?} — per-trial when available, else aggregate."""
        sized = [t for t in self.human_trials(key) if t.enrollment is not None]
        if sized:
            values = sorted(t.enrollment for t in sized)
            largest = max(sized, key=lambda t: (t.enrollment, t.nct))
            return {
                "max": largest.enrollment,
                "median": statistics.median(values),
                "n": len(values),
                "countUnder30": sum(1 for v in values if v < 30),
                "largestTrial": {"nct": largest.nct, "n": largest.enrollment, "source": largest.source, "sourceDate": largest.source_date},
                "trials": [{"nct": t.nct, "n": t.enrollment, "source": t.source, "sourceDate": t.source_date} for t in sorted(sized, key=lambda t: (-t.enrollment, t.nct))],
                "basis": "per-trial registry records",
            }
        aggregate = self.aggregate(key)
        if not aggregate or not aggregate["enrolment"]:
            return None
        enrolment = aggregate["enrolment"]
        maximum = to_int(enrolment.get("max"))
        count = to_int(enrolment.get("n"))
        if maximum is None or count is None:
            return None
        out = {
            "max": maximum,
            "median": enrolment.get("median"),
            "n": count,
            "basis": "registry aggregate (per-trial enrolments are not published, so the count under 30 is not stated)",
            "source": self.registry_source(key),
        }
        if enrolment.get("countUnder30") is not None:
            out["countUnder30"] = to_int(enrolment["countUnder30"])
        return out

    def per_trial_enrolments(self, key):
        """[{nct, n, phase, status, source, sourceDate}] — one row per recorded study.

        Per-trial registry records when the input carries them, else the aggregate's own
        ``perTrial`` rows (registry aggregate v3). Rows without a recorded enrolment are dropped:
        an unstated enrolment is not a small one.
        """
        rows = [
            {
                "nct": trial.nct,
                "n": trial.enrollment,
                "phase": trial.phase,
                "status": trial.status,
                "source": trial.source,
                "sourceDate": trial.source_date,
            }
            for trial in self.human_trials(key)
            if trial.enrollment is not None
        ]
        if rows:
            return rows
        aggregate = self.aggregate(key)
        if not aggregate:
            return []
        out = []
        for row in aggregate.get("perTrial") or ():
            enrolment = to_int(first_any(row, "enrollment", "enrolment", "n", "N"))
            if enrolment is None:
                continue
            nct = first_str(row, "nct")
            out.append({
                "nct": nct,
                "n": enrolment,
                "phase": first_str(row, "phase"),
                "status": first_str(row, "status"),
                "source": self.registry_source(key, nct),
                "sourceDate": first_str(row, "sourceDate"),
            })
        return out

    def first_human_trial_start(self, key):
        """(verbatim, date, nct|None) for the earliest recorded human trial start."""
        started = [t for t in self.human_trials(key) if t.start_verbatim]
        if started:
            first = min(started, key=lambda t: (t.start_date or date.max, t.nct))
            return (first.start_verbatim, first.start_date, first.nct)
        aggregate = self.aggregate(key)
        if aggregate and aggregate["firstStartDate"]:
            verbatim, parsed = parse_date(aggregate["firstStartDate"])
            return (verbatim, parsed, None)
        return (None, None, None)

    def latest_human_completion(self, key):
        """The latest recorded completion, only when the input can express 'latest'."""
        dated = [t for t in self.human_trials(key) if t.completion_date]
        if dated:
            latest = max(dated, key=lambda t: (t.completion_date, t.nct))
            return {
                "kind": "trial completion",
                "date": latest.completion_verbatim,
                "parsed": latest.completion_date,
                "record": latest.nct,
                "recordKind": "NCT",
                "source": latest.source,
                "sourceDate": latest.source_date,
            }
        aggregate = self.aggregate(key)
        recorded = aggregate["lastCompletionDate"] if aggregate else None
        if recorded:
            # v3 records {date, nct, over, source, sourceDate}; v2 and a hand-written input may
            # record a bare date string. Only the date the aggregate itself states is read.
            entry = recorded if isinstance(recorded, dict) else {"date": recorded}
            verbatim, parsed = parse_date(first_any(entry, "date", "completionDate", "value"))
            if parsed:
                nct = first_str(entry, "nct")
                return {
                    "kind": "trial completion",
                    "date": verbatim,
                    "parsed": parsed,
                    "record": nct,
                    "recordKind": "NCT" if nct else None,
                    "over": first_str(entry, "over"),
                    "source": entry.get("source") or self.registry_source(key, nct),
                    "sourceDate": first_str(entry, "sourceDate"),
                }
        return None


# --------------------------------------------------------------------------- extraction helpers

def ladder_rungs(page):
    """[(rung, entry)] from field 2, ordered low to high on the eight-rung ladder."""
    field = page.field("ladder")
    if field is None:
        return []
    rungs = []
    value = field.value
    entries = []
    if isinstance(value, dict):
        if "rungs" in value:
            entries = as_list(value["rungs"])
        else:
            for name, entry in value.items():
                if isinstance(entry, dict):
                    entry = dict(entry)
                    entry.setdefault("organism", name)
                    entries.append(entry)
                elif isinstance(entry, list):
                    for item in entry:
                        if isinstance(item, dict):
                            item = dict(item)
                            item.setdefault("organism", name)
                            entries.append(item)
    else:
        entries = as_list(value)
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        rung = organism_of(first_str(entry, "organism", "rung", "species", "model"))
        if rung is None:
            continue
        rungs.append((rung, entry))
    rungs.sort(key=lambda pair: ORGANISM_LADDER.index(pair[0]))
    return rungs


def kinetics_parameter(page, *names):
    """A named kinetics parameter as (value_dict, provenance_dict) or (None, None)."""
    field = page.field("kinetics")
    if field is None or not isinstance(field.value, dict):
        return (None, None)
    for name in names:
        for candidate in (name, name.lower(), name.upper()):
            if candidate in field.value and field.value[candidate] not in (None, "", [], {}):
                entry = field.value[candidate]
                if not isinstance(entry, dict):
                    entry = {"value": entry}
                provenance = field.provenance()
                for source_key, target_key in (("source", "source"), ("sourceDate", "sourceDate"), ("lastVerified", "lastVerified"), ("verbatim", "verbatim")):
                    if entry.get(source_key) not in (None, "", [], {}):
                        provenance[target_key] = entry[source_key]
                return (entry, provenance)
    # a flattened form: kinetics.halfLife written as its own field entry
    return (None, None)


def kinetics_value_object(entry, provenance, parameter):
    out = {"parameter": parameter, "value": entry.get("value", entry.get("val"))}
    if entry.get("unit") not in (None, ""):
        out["unit"] = entry["unit"]
    if entry.get("route") not in (None, ""):
        out["route"] = entry["route"]
    out.update(provenance or {})
    return out


def itp_cohorts(page):
    field = page.field("itp")
    if field is None:
        return (None, [])
    value = field.value
    if isinstance(value, dict):
        tested = to_bool(value.get("tested"))
        cohorts = [c for c in as_list(value.get("cohorts")) if isinstance(c, dict)]
    else:
        tested = None
        cohorts = [c for c in as_list(value) if isinstance(c, dict)]
    return (tested, cohorts)


def biomarker_terms(page):
    """Field 12 entries as [(term, entry)] with the entry kept for provenance.

    The assembled field records ``{terms: [...], measures: [{term, measureVerbatim, nct, ...}]}``.
    The ``measures`` rows are read first because each already names the study that measured the
    term; the bare ``terms`` list supplies anything the measures do not cover. A plain list of
    strings or dicts (the shape the focused tests use) is still accepted.
    """
    field = page.field("biomarkers")
    if field is None:
        return []
    terms = []
    seen = set()

    def add(term, entry):
        if not term:
            return
        text = str(term).strip()
        key = norm(text)
        if not text or not key or key in seen:
            return
        seen.add(key)
        terms.append((text, entry if isinstance(entry, dict) else {}))

    value = field.value
    if isinstance(value, dict) and ("measures" in value or "terms" in value):
        for entry in as_list(value.get("measures")):
            if isinstance(entry, dict):
                add(first_str(entry, "term", "biomarker", "name", "measure", "measureVerbatim"), entry)
        for entry in as_list(value.get("terms")):
            if isinstance(entry, str):
                add(entry, {})
            elif isinstance(entry, dict):
                add(first_str(entry, "term", "biomarker", "name", "measure", "value"), entry)
        return terms

    for entry in as_list(value):
        if isinstance(entry, str):
            add(entry, {})
        elif isinstance(entry, dict):
            add(first_str(entry, "term", "biomarker", "name", "measure", "value"), entry)
    return terms


def jurisdiction_statuses(page):
    field = page.field("regulatorystatus")
    if field is None:
        return {}
    out = {}
    value = field.value
    entries = []
    if isinstance(value, dict):
        for name, entry in value.items():
            if isinstance(entry, dict):
                entry = dict(entry)
                entry.setdefault("jurisdiction", name)
                entries.append(entry)
            elif isinstance(entry, str):
                entries.append({"jurisdiction": name, "status": entry})
    else:
        entries = [e for e in as_list(value) if isinstance(e, dict)]
    for entry in entries:
        jurisdiction = (first_str(entry, "jurisdiction", "region", "country", "code") or "").upper()
        status = first_str(entry, "status", "value")
        if not jurisdiction or not status:
            continue
        # A register entry carries its own evidence rows (register, id, statement, date); use
        # them as the source so each jurisdiction row cites the register it came from.
        evidence = [e for e in as_list(entry.get("evidence")) if isinstance(e, dict)]
        source = entry.get("source") or field.source
        source_date = entry.get("sourceDate") or field.source_date
        if evidence:
            first = evidence[0]
            source = {
                "kind": "register",
                "register": first_str(first, "register", "source"),
                "id": first_str(first, "id"),
            }
            source_date = first_str(first, "sourceDate") or source_date
        out[jurisdiction] = {
            "jurisdiction": jurisdiction,
            "status": status,
            "statusNormalized": norm(status),
            "source": source,
            "sourceDate": source_date,
            "lastVerified": entry.get("lastVerified") or field.last_verified,
        }
        if evidence:
            out[jurisdiction]["evidence"] = [
                {
                    "register": first_str(e, "register", "source"),
                    "id": first_str(e, "id"),
                    "statement": first_str(e, "statement", "value"),
                    "sourceDate": first_str(e, "sourceDate"),
                }
                for e in evidence[:10]
            ]
        registers = [r for r in as_list(entry.get("sources")) if isinstance(r, str)]
        if registers:
            out[jurisdiction]["registers"] = registers
    return out


def interaction_nodes(page):
    """[(node, kind, role, entry)] from field 10 — CYP enzymes and named transporters."""
    field = page.field("interactions")
    if field is None:
        return []
    value = field.value
    buckets = []
    if isinstance(value, dict):
        for name in ("cyp", "cyps", "enzymes", "CYP"):
            if value.get(name):
                buckets.append(("cyp", as_list(value[name])))
        for name in ("transporters", "transporter"):
            if value.get(name):
                buckets.append(("transporter", as_list(value[name])))
        if not buckets:
            buckets.append((None, [v for v in value.values() if isinstance(v, (dict, str))]))
    else:
        buckets.append((None, as_list(value)))

    nodes = []
    for declared_kind, entries in buckets:
        for entry in entries:
            if isinstance(entry, str):
                entry = {"statement": entry}
            if not isinstance(entry, dict):
                continue
            text = " ".join(
                str(entry.get(name))
                for name in ("enzyme", "transporter", "name", "id", "symbol", "statement", "text", "value", "role", "direction", "type")
                if entry.get(name) not in (None, "", [], {})
            )
            role = first_str(entry, "role", "direction", "type", "interactionType")
            role_normalized = None
            if role:
                for word, canonical in ROLE_WORDS:
                    if word in norm(role):
                        role_normalized = canonical
                        break
            if role_normalized is None:
                for word, canonical in ROLE_WORDS:
                    if word in norm(text):
                        role_normalized = canonical
                        break
            found = []
            for match in CYP_RE.finditer(text):
                found.append(("CYP" + match.group(1).upper(), "cyp"))
            lowered = " " + norm(text) + " "
            for token, canonical in TRANSPORTER_TOKENS.items():
                if " " + norm(token) + " " in lowered:
                    found.append((canonical, "transporter"))
            if not found:
                explicit = first_str(entry, "enzyme", "transporter", "symbol", "name", "id")
                if explicit and declared_kind:
                    found.append((explicit.strip(), declared_kind))
            for node, kind in found:
                nodes.append((node, kind, role_normalized or "unstated", entry))
    deduped = {}
    for node, kind, role, entry in nodes:
        deduped.setdefault((node, kind, role), entry)
    return [(node, kind, role, entry) for (node, kind, role), entry in deduped.items()]


def target_symbols(page):
    """[(node, entry)] from the molecular-target field.

    The assembled field carries two named lists: ChEMBL mechanism targets (keyed by
    ``targetChemblId``, labelled by ``prefName``) and Open Targets mechanism-of-action targets
    (keyed by gene ``symbol``). Both are indexed, each under its own identifier, with the
    recorded label kept for display. A plain list of symbols or strings is also accepted.
    """
    field = page.field("moleculartarget")
    if field is None:
        return []
    out = []
    value = field.value

    def add(node, label, kind, entry):
        if not node:
            return
        out.append((str(node).strip(), {
            "label": label,
            "kind": kind,
            "source": entry.get("source") if isinstance(entry, dict) else None,
            "sourceDate": entry.get("sourceDate") if isinstance(entry, dict) else None,
            "url": (entry.get("targetUrl") or (entry.get("source") or {}).get("url")) if isinstance(entry, dict) else None,
        }))

    if isinstance(value, dict) and ("chemblTargets" in value or "openTargetsTargets" in value):
        for entry in as_list(value.get("chemblTargets")):
            if not isinstance(entry, dict):
                continue
            pref = entry.get("prefName")
            label = pref.get("prefName") if isinstance(pref, dict) else (pref if isinstance(pref, str) else None)
            add(first_str(entry, "targetChemblId", "chemblTargetId", "id"), label, "chembl-target", entry)
        for entry in as_list(value.get("openTargetsTargets")):
            if not isinstance(entry, dict):
                continue
            label = first_str(entry, "approvedName", "targetName", "name")
            add(first_str(entry, "symbol", "approvedSymbol") or first_str(entry, "ensemblId"), label, "gene-symbol", entry)
    else:
        for entry in as_list(value):
            if isinstance(entry, str):
                if entry.strip():
                    add(entry.strip(), None, "unstated", {})
            elif isinstance(entry, dict):
                node = first_str(entry, "symbol", "target", "targetSymbol", "approvedSymbol", "targetChemblId", "chemblTargetId", "name", "id", "value")
                add(node, first_str(entry, "prefName", "approvedName", "targetName", "name"), "unstated", entry)

    deduped = {}
    for node, entry in out:
        deduped.setdefault(node, entry)
    return list(deduped.items())


def compound_outcome(ctx, page):
    """approved / stopped / ongoing / unstated, from recorded facts only (seed 13 rows)."""
    statuses = jurisdiction_statuses(page)
    for entry in statuses.values():
        if entry["statusNormalized"] in APPROVED_STATUSES:
            return "approved", {"basis": "regulatory status", "jurisdiction": entry["jurisdiction"], "value": entry["status"], "source": entry.get("source"), "sourceDate": entry.get("sourceDate")}
    withdrawal = page.field("withdrawalstatus")
    if withdrawal is not None:
        value = withdrawal.value
        flag = to_bool(value.get("withdrawn")) if isinstance(value, dict) else to_bool(value)
        if flag is True:
            return "stopped", {"basis": "withdrawal status", "value": (value.get("reason") if isinstance(value, dict) else None), "source": withdrawal.source, "sourceDate": withdrawal.source_date}
    why = page.field("whystopped")
    if why is not None:
        return "stopped", {"basis": "development stopped", "value": why.value if isinstance(why.value, str) else None, "source": why.source, "sourceDate": why.source_date}
    ongoing = page.field("ongoingtrials")
    if ongoing is not None and as_list(ongoing.value):
        return "ongoing", {"basis": "ongoing trials", "source": ongoing.source, "sourceDate": ongoing.source_date}
    if ctx.ongoing_trials(page.key):
        return "ongoing", {"basis": "registry ongoing trials"}
    failures = page.field("trialfailures")
    if failures is not None and as_list(failures.value):
        return "stopped", {"basis": "trial failures", "source": failures.source, "sourceDate": failures.source_date}
    return "unstated", {"basis": "no recorded status"}


def trial_failure_entries(page, ctx):
    """Field 11 entries (or the DEVELOPMENT why-stopped list), else the registry's stopped list."""
    entries = []
    field = page.field("trialfailures") or page.field("whystopped")
    if field is not None:
        for entry in as_list(field.value):
            if isinstance(entry, dict):
                nct = first_str(entry, "nct", "nctId", "id")
                why = first_str(entry, "whyStopped", "why_stopped", "reason")
                status = first_str(entry, "status")
                if why:
                    entries.append({
                        "nct": nct,
                        "status": status,
                        "whyStopped": why,
                        "source": entry.get("source") or field.source or ({"kind": "registry", "id": nct} if nct else None),
                        "sourceDate": entry.get("sourceDate") or field.source_date,
                        "lastVerified": entry.get("lastVerified") or field.last_verified,
                    })
    if not entries:
        for row in ctx.stopped_trials(page.key):
            entries.append({
                "nct": row.get("nct"),
                "status": row.get("status"),
                "whyStopped": row["whyStopped"],
                "source": row.get("source"),
                "sourceDate": row.get("sourceDate"),
                "lastVerified": None,
            })
    deduped = {}
    for entry in entries:
        deduped.setdefault((entry.get("nct"), entry["whyStopped"]), entry)
    return list(deduped.values())


def cluster_stop_reason(reason):
    """(primary cluster, all matched clusters) for a verbatim registry reason."""
    text = " " + norm(reason) + " "
    matched = []
    for cluster, terms in STOP_CLUSTERS:
        for term in terms:
            if " " + norm(term) in text or norm(term) + " " in text:
                matched.append(cluster)
                break
    if not matched:
        return ("other", [])
    return (matched[0], matched)


def ongoing_trial_entries(page, ctx):
    field = page.field("ongoingtrials")
    entries = []
    if field is not None:
        for entry in as_list(field.value):
            if not isinstance(entry, dict):
                continue
            nct = first_str(entry, "nct", "nctId", "id")
            endpoint_values = outcome_strings(first_any(entry, "primaryEndpoint", "primaryOutcome", "primaryOutcomes", "endpoint"))
            completion_verbatim, completion_date = parse_date(first_any(entry, "completionDate", "completion", "readout", "primaryCompletionDate"))
            entries.append({
                "nct": nct,
                "title": first_str(entry, "title", "name"),
                "n": to_int(first_any(entry, "N", "n", "enrollment", "enrolment")),
                "primaryEndpoints": endpoint_values,
                "completionDate": completion_verbatim,
                "completionDateParsed": completion_date,
                "source": entry.get("source") or field.source or ({"kind": "registry", "id": nct} if nct else None),
                "sourceDate": entry.get("sourceDate") or field.source_date,
                "lastVerified": entry.get("lastVerified") or field.last_verified,
            })
    return entries


# --------------------------------------------------------------------------- indexes (5, 13)

def build_indexes(ctx, con):
    """Build the two corpus-wide bipartite indexes with duckdb and write them out."""
    con.execute("DROP TABLE IF EXISTS page_enzyme")
    con.execute(
        "CREATE TABLE page_enzyme (page VARCHAR, display VARCHAR, node VARCHAR, kind VARCHAR, role VARCHAR)"
    )
    con.execute("DROP TABLE IF EXISTS page_target")
    con.execute("CREATE TABLE page_target (page VARCHAR, display VARCHAR, node VARCHAR, label VARCHAR, kind VARCHAR)")

    enzyme_rows = []
    target_rows = []
    for page in ctx.pages:
        for node, kind, role, entry in interaction_nodes(page):
            ctx.page_enzymes[page.key].append((node, kind, role, entry))
            enzyme_rows.append((page.key, page.display_name, node, kind, role))
        for symbol, entry in target_symbols(page):
            ctx.page_targets[page.key].append((symbol, entry))
            target_rows.append((page.key, page.display_name, symbol, entry.get("label"), entry.get("kind")))

    if enzyme_rows:
        con.executemany("INSERT INTO page_enzyme VALUES (?,?,?,?,?)", enzyme_rows)
    if target_rows:
        con.executemany("INSERT INTO page_target VALUES (?,?,?,?,?)", target_rows)

    enzyme_index = {}
    for node, kind, members in con.execute(
        """
        SELECT node, any_value(kind) AS kind,
               list(DISTINCT struct_pack(page := page, display := display, role := role)) AS members
        FROM page_enzyme GROUP BY node ORDER BY node
        """
    ).fetchall():
        enzyme_index[node] = {
            "node": node,
            "kind": kind,
            "pages": sorted(({"key": m["page"], "displayName": m["display"], "role": m["role"]} for m in members), key=lambda m: m["key"]),
        }
    ctx.enzyme_index = enzyme_index

    target_index = {}
    for node, label, kind, members in con.execute(
        """
        SELECT node, any_value(label) AS label, any_value(kind) AS kind,
               list(DISTINCT struct_pack(page := page, display := display)) AS members
        FROM page_target GROUP BY node ORDER BY node
        """
    ).fetchall():
        target_index[node] = {
            "node": node,
            "label": label,
            "kind": kind,
            "pages": sorted(({"key": m["page"], "displayName": m["display"]} for m in members), key=lambda m: m["key"]),
        }
    ctx.target_index = target_index

    index_dir = os.path.join(ctx.out_dir, "indexes")
    os.makedirs(index_dir, exist_ok=True)
    write_ndjson(os.path.join(index_dir, "enzyme-transporter.ndjson"), (enzyme_index[k] for k in sorted(enzyme_index)))
    write_ndjson(os.path.join(index_dir, "target.ndjson"), (target_index[k] for k in sorted(target_index)))
    return {
        "enzymeNodes": len(enzyme_index),
        "enzymeRows": len(enzyme_rows),
        "targetNodes": len(target_index),
        "targetRows": len(target_rows),
    }


def write_ndjson(path, records):
    count = 0
    with open(path, "w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True, default=str))
            handle.write("\n")
            count += 1
    return count


# --------------------------------------------------------------------------- seeds

def seed_01(ctx, page):
    """Bioavailability gap. LONGEVITY/CLINICAL; suppression absolute."""
    entry, provenance = kinetics_parameter(page, "bioavailability", "oralBioavailability", "F")
    if entry is None:
        return None
    route, _ = route_of(entry.get("route"))
    if route is not None and route != "oral":
        return None  # the recorded bioavailability is not the oral one
    positives = []
    for rung, rung_entry in ladder_rungs(page):
        if rung == "human":
            continue
        citation = rung_entry.get("citation") if isinstance(rung_entry.get("citation"), dict) else {}
        sentence = first_str(rung_entry, "sentence")
        # Amendment of 2026-09-04 (Phase 2c): the route is the sentence's own route word, carried
        # verbatim. A recorded `route` field is still honoured where an input supplies one, but the
        # assembled corpus stores only the sentence.
        canonical_route, route_verbatim = sentence_route(sentence)
        if canonical_route is None:
            route_source = first_any(rung_entry, "route", "administrationRoute") or (citation.get("route") if citation else None)
            canonical_route, route_verbatim = route_of(route_source)
        if canonical_route not in {"IV", "IP", "SC"}:
            continue
        effect = direction_of(rung_entry)
        if effect is None:
            effect = direction_of(citation)
        if effect is None and sentence:
            effect = sentence_effect(sentence)
        if effect is not True:
            continue
        row = {
            "organism": rung,
            "organismVerbatim": first_str(rung_entry, "organism", "species") or rung,
            "route": canonical_route,
            "routeVerbatim": route_verbatim,
            "evidenceKind": first_str(rung_entry, "evidenceKind", "kind"),
            "source": rung_entry.get("citation") or rung_entry.get("source"),
            "sourceDate": rung_entry.get("sourceDate") or (citation.get("date") if citation else None),
        }
        if sentence:
            row["sentence"] = sentence
            row["routeReadFrom"] = "the sentence's own route word"
        if first_str(rung_entry, "pmid"):
            row["pmid"] = first_str(rung_entry, "pmid")
        if first_str(rung_entry, "title"):
            row["title"] = first_str(rung_entry, "title")
        positives.append(row)
    if not positives:
        return None
    top = positives[-1]
    return {
        "slots": {"route": top["route"], "organism": top["organism"]},
        "values": {
            "positiveFindings": positives,
            "oralBioavailability": kinetics_value_object(entry, provenance, "bioavailability"),
        },
    }


def seed_02(ctx, page):
    """N-of-1 designability. LONGEVITY only; suppression absolute.

    Reports which of (a)(b)(c) hold. Never computes a washout number: (b) records the
    half-life and the statement that a washout follows from it in principle.
    """
    human_trials = ctx.human_trials(page.key)
    outcomes = ctx.primary_outcomes(page.key)  # [(nct, measure)] from trials or the aggregate

    measured = []
    for term, entry in biomarker_terms(page):
        matches = []
        declared_nct = first_str(entry, "nct", "nctId", "trialId")
        if declared_nct:
            for nct, measure in outcomes:
                if nct and nct.upper() == declared_nct.upper():
                    matches.append((nct, measure))
        if not matches:
            normalized = norm(term)
            for nct, measure in outcomes:
                if normalized and normalized in norm(measure):
                    matches.append((nct, measure))
        if matches:
            measured.append({
                "term": term,
                "trials": sorted({nct for nct, _ in matches if nct}),
                "outcomeMeasures": sorted({measure for _, measure in matches if measure}),
                "source": entry.get("source") or (page.field("biomarkers").source if page.field("biomarkers") else None),
                "sourceDate": entry.get("sourceDate") or (page.field("biomarkers").source_date if page.field("biomarkers") else None),
            })
    if not measured:
        return None  # (a) is the value the question carries; without it there is no question

    half_entry, half_provenance = kinetics_parameter(page, "halfLife", "half_life", "t12", "t1/2")
    b_holds = half_entry is not None

    # Amendment of 2026-09-04 (Phase 2c): (c) is "a human trial small enough for one person's
    # result to be the size of the recorded evidence" — an enrolment of 30 or fewer in the
    # registry's own per-trial rows (aggregate v3 `perTrial`, or per-trial records where the input
    # carries them). The direction of that trial's primary result is not part of the test: the
    # ClinicalTrials.gov snapshot states none, and inventing one would be a claim no source makes.
    measured_trials = {nct for m in measured for nct in m["trials"] if nct}
    small = [row for row in ctx.per_trial_enrolments(page.key) if row["n"] is not None and row["n"] <= 30]
    c_determinable = "perTrialEnrolments" in ctx.capabilities
    smallest = None
    if small:
        chosen = min(small, key=lambda row: (row["n"], str(row["nct"])))
        smallest = {
            "nct": chosen["nct"],
            "n": chosen["n"],
            "source": chosen["source"],
            "sourceDate": chosen["sourceDate"],
            "rule": "the smallest recorded human enrolment at or below 30; the registry states no direction of its result",
        }
        if chosen["phase"]:
            smallest["phase"] = chosen["phase"]
        if chosen["status"]:
            smallest["status"] = chosen["status"]
        if chosen["nct"] in measured_trials:
            smallest["measuredBiomarkers"] = sorted(
                {m["term"] for m in measured if chosen["nct"] in m["trials"]}
            )
        smallest_count = len(small)
    else:
        smallest_count = 0

    if smallest is not None:
        c_state = True
    elif c_determinable:
        c_state = False
    else:
        c_state = "unknown"
    tests = {
        "a_biomarkerMeasuredInHumans": True,
        "b_halfLifeRecorded": b_holds,
        "c_smallHumanTrialReportedEffect": c_state,
    }
    missing = [name for name, held in tests.items() if held is False]
    values = {
        "tests": tests,
        "missing": missing,
        "biomarkers": measured,
    }
    if c_state == "unknown":
        values["notDeterminable"] = [{
            "test": "c_smallHumanTrialReportedEffect",
            "reason": "the registry input records no per-trial enrolment for this page",
        }]
    if b_holds:
        values["halfLife"] = kinetics_value_object(half_entry, half_provenance, "halfLife")
        values["washoutDerivableInPrinciple"] = True
    if smallest is not None:
        values["smallestHumanTrial"] = smallest
        values["humanTrialsAtOrUnder30"] = smallest_count
    return {"slots": {"biomarker": measured[0]["term"]}, "values": values}


def seed_03(ctx, page):
    """Failure autopsy. Any model; >= 2 stopped trials with a recorded whyStopped."""
    entries = trial_failure_entries(page, ctx)
    if len(entries) < 2:
        return None
    clusters = defaultdict(list)
    for entry in entries:
        primary, matched = cluster_stop_reason(entry["whyStopped"])
        clusters[primary].append({
            "nct": entry.get("nct"),
            "status": entry.get("status"),
            "whyStopped": entry["whyStopped"],
            "clustersMatched": matched,
            "source": entry.get("source"),
            "sourceDate": entry.get("sourceDate"),
            "lastVerified": entry.get("lastVerified"),
        })
    ordered = [name for name, _ in STOP_CLUSTERS] + ["other"]
    cluster_rows = [
        {"cluster": name, "count": len(clusters[name]), "ncts": [r["nct"] for r in clusters[name] if r.get("nct")], "reasons": clusters[name]}
        for name in ordered
        if name in clusters
    ]
    return {
        "slots": {"n": len(entries), "reasonList": [row["cluster"] for row in cluster_rows]},
        "values": {"stoppedTrialCount": len(entries), "clusters": cluster_rows},
    }


def seed_04(ctx, page):
    """Endpoint mismatch. LONGEVITY; field 5 present with trials."""
    ceiling = page.field("humanceiling")
    if ceiling is None:
        return None
    value = ceiling.value if isinstance(ceiling.value, dict) else {}
    trial_ids = [str(t) for t in as_list(value.get("trials")) if t]
    if not trial_ids and not ctx.human_trials(page.key):
        return None

    measured = defaultdict(list)
    for nct, outcome in ctx.primary_outcomes(page.key):
        endpoint = audience_endpoint_of(outcome)
        if endpoint:
            measured[endpoint].append({"outcome": outcome, "record": nct, "recordKind": "NCT" if nct else None, "source": ctx.registry_source(page.key, nct), "sourceDate": None})
    for term, entry in biomarker_terms(page):
        endpoint = audience_endpoint_of(term)
        if endpoint:
            record = first_str(entry, "nct", "pmid", "trialId")
            measured[endpoint].append({
                "outcome": term,
                "record": record,
                "recordKind": "NCT" if record and record.upper().startswith("NCT") else ("PMID" if record else None),
                "source": entry.get("source") or (page.field("biomarkers").source if page.field("biomarkers") else None),
                "sourceDate": entry.get("sourceDate"),
            })
    for pub in ctx.pubs(page.key):
        if not pub.is_clinical_trial:
            continue
        for outcome in pub.outcomes:
            endpoint = audience_endpoint_of(outcome)
            if endpoint:
                measured[endpoint].append({"outcome": outcome, "record": pub.pmid, "recordKind": "PMID", "source": pub.source, "sourceDate": pub.source_date})

    if not measured and not trial_ids and not ctx.primary_outcomes(page.key):
        return None
    never = [e for e in AUDIENCE_ENDPOINTS if e not in measured]
    return {
        "slots": {"n": len(measured)},
        "values": {
            "humanCeiling": ceiling.sourced(),
            "measured": [{"endpoint": endpoint, "records": rows} for endpoint, rows in sorted(measured.items())],
            "neverMeasured": never,
        },
    }


def seed_05(ctx, page):
    """Stack interaction graph. Any model; corpus-wide bipartite index built once."""
    nodes = ctx.page_enzymes.get(page.key) or []
    if not nodes:
        return None
    rows = []
    for node, kind, role, entry in sorted(nodes, key=lambda n: (n[1], n[0], n[2])):
        index_entry = ctx.enzyme_index.get(node)
        if not index_entry:
            continue
        others = [m for m in index_entry["pages"] if m["key"] != page.key]
        if not others:
            continue
        rows.append({
            "node": node,
            "kind": kind,
            "thisCompoundRole": role,
            "sharedWithCount": len(others),
            "sharedWith": others[:SHARE_LIST_CAP],
            "truncated": len(others) > SHARE_LIST_CAP,
            "source": entry.get("source") or (page.field("interactions").source if page.field("interactions") else None),
            "sourceDate": entry.get("sourceDate") or (page.field("interactions").source_date if page.field("interactions") else None),
        })
    if not rows:
        return None
    return {
        "slots": {"enzymeList": [row["node"] for row in rows], "enzyme": rows[0]["node"]},
        "values": {"nodes": rows},
    }


def seed_06(ctx, page):
    """Time-to-signal, amended 2026-09-04 (docs/specs/field-models.md, derived-content.md).

    The ClinicalTrials.gov snapshot records no direction of a primary result, so the registry
    route is not computable. The amended rule takes the LONGEVITY evidence sentences that are
    already stored verbatim with a citation: an organism-ladder human rung sentence, or an
    epigenetic-clock sentence. A sentence qualifies only when its own words state BOTH an
    effect (positive or null, from the recorded direction lexicon) and a duration matching
    ``(\\d+)[- ](day|week|month|year)s?``. Nothing is converted, summed or inferred: the
    duration is carried as the matched text, and the sentence as printed.
    """
    candidates = []
    for rung, entry in ladder_rungs(page):
        if rung != "human":
            continue
        sentence = first_str(entry, "sentence")
        if not sentence:
            continue
        candidates.append(("organism-ladder human rung", entry, sentence,
                           first_str(entry, "primaryOutcomeVerbatim", "endpointType", "evidenceKind")))
    clocks = page.field("clocks")
    if clocks is not None:
        for entry in as_list(clocks.value):
            if not isinstance(entry, dict):
                continue
            sentence = first_str(entry, "sentence")
            if not sentence:
                continue
            candidates.append(("epigenetic clock", entry, sentence,
                               first_str(entry, "clockAsPrinted", "clock")))
    if not candidates:
        return None

    qualifying = []
    for origin, entry, sentence, endpoint in candidates:
        effect = sentence_effect(sentence)
        if effect is None:
            continue
        duration = duration_in_sentence(sentence)
        if duration is None:
            continue
        if not endpoint:
            continue
        qualifying.append({
            "origin": origin,
            "effectStated": effect,
            "endpoint": endpoint,
            "durationVerbatim": duration["verbatim"],
            "durationNumber": duration["number"],
            "durationUnit": duration["unit"],
            "sentence": sentence,
            "pmid": first_str(entry, "pmid"),
            "title": first_str(entry, "title"),
            "nct": first_str(entry, "nct"),
            "source": entry.get("source") or entry.get("citation"),
            "sourceDate": entry.get("sourceDate"),
        })
    if not qualifying:
        return None

    with_effect = [row for row in qualifying if row["effectStated"] is True]
    if not with_effect:
        return None

    def rank(row):
        # ordering key only; it is never rendered, and the page carries the verbatim duration
        return (row["durationNumber"] * DURATION_UNIT_ORDER[row["durationUnit"]], row["sentence"])

    shortest = min(with_effect, key=rank)
    without = [row for row in qualifying if row["effectStated"] is False]
    values = {
        "shortestReportingEffect": shortest,
        "qualifyingSentenceCount": len(qualifying),
        "reportingEffectCount": len(with_effect),
        "rule": (
            "a stored evidence sentence whose own words state an effect and a duration; "
            "the shortest and longest are selected on a nominal day ordering that is never rendered"
        ),
    }
    if without:
        values["longestReportingNone"] = max(without, key=rank)
    return {"slots": {"endpoint": shortest["endpoint"]}, "values": values}


# Amendment of 2026-09-04 (Phase 2c): the ITP lifespan workbooks record cohorts by sex but no
# per-sex outcome, and no registry or publication record in this corpus carries a sex-stratified
# result. What is stored is the source's own sentence. A sentence qualifies for seed 7 when its own
# words name a sex AND state an effect; both matched fragments are carried verbatim and nothing is
# compared, ranked or summarised across them.
SEX_TERM_PATTERN = re.compile(r"\b(males|females|male|female)\b", re.IGNORECASE)
# Amendment of 2026-09-04 (docs/specs/derived-content.md seed 7): the effect words admit the whole
# lemma family. "extend" alone did not match "extension", which is the noun the ITP lifespan
# publications actually use ("a 10% extension of median lifespan in females"), so a sentence that
# states an effect in those words was read as stating none. Nothing is inferred from a match: the
# matched fragment is carried verbatim and no sentence is compared, ranked or summarised.
SEX_EFFECT_PATTERN = re.compile(
    r"extend|extension|prolong|increase|longer|no effect|did not", re.IGNORECASE
)


def sex_statement(text):
    """(sexTerms, effectTerms) verbatim when a sentence names a sex and states an effect."""
    if not text:
        return None
    sexes = [m.group(0) for m in SEX_TERM_PATTERN.finditer(str(text))]
    if not sexes:
        return None
    effects = [m.group(0) for m in SEX_EFFECT_PATTERN.finditer(str(text))]
    if not effects:
        return None
    return (unique_strings(sexes), unique_strings(effects))


def unique_strings(items):
    out = []
    for item in items:
        if item not in out:
            out.append(item)
    return out


def itp_publications(page):
    field = page.field("itp")
    if field is None or not isinstance(field.value, dict):
        return []
    return [p for p in as_list(field.value.get("publications")) if isinstance(p, dict)]


def seed_07(ctx, page):
    """Sex-specific divergence. LONGEVITY; ITP sex-split cohorts, a sex-stratified record, or a
    stored sentence whose own words name a sex and state an effect."""
    tested, cohorts = itp_cohorts(page)
    itp_rows = []
    for cohort in cohorts:
        sex = first_str(cohort, "sex", "gender")
        outcome = first_str(cohort, "outcome", "result", "finding")
        if not sex or not outcome:
            continue
        itp_rows.append({
            "organism": "mouse",
            "sex": sex,
            "outcome": outcome,
            "doseppm": first_any(cohort, "dose", "doseppm", "dosePpm", "ppm"),
            "ageAtStartMonths": first_any(cohort, "ageAtStartMonths", "ageAtStart", "ageMonths"),
            "publication": cohort.get("publication") or cohort.get("source"),
            "source": cohort.get("source") or (page.field("itp").source if page.field("itp") else {"kind": "nia-itp"}),
            "sourceDate": cohort.get("sourceDate") or (page.field("itp").source_date if page.field("itp") else None),
        })
    itp_sexes = {norm(row["sex"]) for row in itp_rows}

    other_rows = []
    for trial in ctx.trials.get(page.key, []):
        for entry in trial.sex_results:
            if not isinstance(entry, dict):
                continue
            sex = first_str(entry, "sex", "gender")
            outcome = first_str(entry, "outcome", "result", "finding", "value")
            if sex and outcome:
                other_rows.append({
                    "organism": organism_of(first_str(trial.raw, "organism", "species")) or "human",
                    "sex": sex,
                    "outcome": outcome,
                    "record": trial.nct,
                    "recordKind": "NCT",
                    "source": trial.source,
                    "sourceDate": trial.source_date,
                })
    for pub in ctx.pubs(page.key):
        for entry in pub.sex_results:
            if not isinstance(entry, dict):
                continue
            sex = first_str(entry, "sex", "gender")
            outcome = first_str(entry, "outcome", "result", "finding", "value")
            if sex and outcome:
                other_rows.append({
                    "organism": organism_of(pub.organism) or pub.organism,
                    "sex": sex,
                    "outcome": outcome,
                    "record": pub.pmid,
                    "recordKind": "PMID",
                    "source": pub.source,
                    "sourceDate": pub.source_date,
                })

    statement_rows = []
    for rung, entry in ladder_rungs(page):
        sentence = first_str(entry, "sentence")
        found = sex_statement(sentence)
        if found is None:
            continue
        statement_rows.append({
            "origin": "organism ladder",
            "organism": rung,
            "sexTermsVerbatim": found[0],
            "effectTermsVerbatim": found[1],
            "sentence": sentence,
            "pmid": first_str(entry, "pmid"),
            "year": first_str(entry, "year"),
            "title": first_str(entry, "title"),
            "source": entry.get("source") or entry.get("citation"),
            "sourceDate": first_str(entry, "sourceDate"),
        })
    for publication in itp_publications(page):
        sentence = first_str(publication, "outcomeSentence", "sentence")
        found = sex_statement(sentence)
        if found is None:
            continue
        statement_rows.append({
            # the NIA Interventions Testing Program is a mouse lifespan programme; the organism is
            # the field's own, not a reading of the sentence
            "origin": "ITP publication",
            "organism": "mouse",
            "sexTermsVerbatim": found[0],
            "effectTermsVerbatim": found[1],
            "sentence": sentence,
            "pmid": first_str(publication, "pmid"),
            "year": first_str(publication, "year"),
            "title": first_str(publication, "title"),
            "source": publication.get("source") or (page.field("itp").source if page.field("itp") else None),
            "sourceDate": first_str(publication, "sourceDate") or (page.field("itp").source_date if page.field("itp") else None),
        })

    by_organism = defaultdict(set)
    for row in other_rows:
        by_organism[row["organism"]].add(norm(row["sex"]))
    other_ok = any(len(sexes) >= 2 for sexes in by_organism.values())

    if len(itp_sexes) < 2 and not other_ok and not statement_rows:
        return None
    if len(itp_sexes) >= 2:
        organism = "mouse"
    elif other_ok:
        organism = next(o for o, s in by_organism.items() if len(s) >= 2)
    else:
        organism = statement_rows[0]["organism"]
    values = {"results": itp_rows + other_rows}
    if itp_rows:
        values["itpTested"] = tested
    if statement_rows:
        values["sexStatements"] = statement_rows
        values["rule"] = (
            "a stored sentence whose own words name a sex and state an effect; both fragments are "
            "carried verbatim and no comparison between them is computed"
        )
    return {"slots": {"organism": organism}, "values": values}


def seed_08(ctx, page):
    """Evidence provenance timeline. Any model; ordered dated events, each with its source."""
    events = []

    earliest_pub = None
    for pub in ctx.pubs(page.key):
        if pub.date is None and pub.date_verbatim is None:
            continue
        if earliest_pub is None or (pub.date and earliest_pub.date and pub.date < earliest_pub.date) or (earliest_pub.date is None and pub.date):
            earliest_pub = pub
    if earliest_pub is not None:
        events.append({
            "event": "first publication",
            "date": earliest_pub.date_verbatim,
            "year": year_of(earliest_pub.date, earliest_pub.date_verbatim),
            "record": earliest_pub.pmid,
            "source": earliest_pub.source,
            "sourceDate": earliest_pub.source_date,
        })

    best = None
    for rung, entry in ladder_rungs(page):
        if rung == "human":
            continue
        citation = entry.get("citation") if isinstance(entry.get("citation"), dict) else {}
        verbatim, parsed = parse_date(first_any(entry, "date", "year", "sourceDate") or (first_any(citation, "date", "year") if citation else None))
        if verbatim is None:
            continue
        if best is None or (parsed and best[1] and parsed < best[1]) or (best[1] is None and parsed):
            best = (verbatim, parsed, rung, entry)
    if best is not None:
        events.append({
            "event": "first non-human result",
            "date": best[0],
            "year": year_of(best[1], best[0]),
            "organism": best[2],
            "source": best[3].get("citation") or best[3].get("source"),
        })

    start_verbatim, start_parsed, start_nct = ctx.first_human_trial_start(page.key)
    if start_verbatim:
        events.append({
            "event": "first human trial",
            "date": start_verbatim,
            "year": year_of(start_parsed, start_verbatim),
            "record": start_nct,
            "source": ctx.registry_source(page.key, start_nct),
            "sourceDate": None,
        })

    # First approval: only an explicitly recorded approval date counts. The date a source was
    # published or last verified is not an approval date and is never used as one.
    approval = None
    statuses_field = page.field("regulatorystatus")
    raw_entries = []
    if statuses_field is not None:
        value = statuses_field.value
        raw_entries = list(value.values()) if isinstance(value, dict) else as_list(value)
    for entry in raw_entries:
        if not isinstance(entry, dict):
            continue
        status = first_str(entry, "status", "value")
        if not status or norm(status) not in APPROVED_STATUSES:
            continue
        verbatim, parsed = parse_date(first_any(entry, "approvalDate", "firstApprovalDate", "dateOfApproval", "authorisationDate"))
        if verbatim is None:
            continue
        jurisdiction = (first_str(entry, "jurisdiction", "region", "country", "code") or "").upper()
        if approval is None or (parsed and approval[1] and parsed < approval[1]):
            approval = (verbatim, parsed, {"jurisdiction": jurisdiction, "source": entry.get("source") or statuses_field.source})
    if approval is None:
        verbatim, parsed = parse_date(first_any(page.raw, "firstApprovalDate", "approvalDate"))
        if verbatim is not None:
            approval = (verbatim, parsed, {"jurisdiction": None, "source": page.raw.get("approvalSource")})
    if approval is not None:
        events.append({
            "event": "first approval",
            "date": approval[0],
            "year": year_of(approval[1], approval[0]),
            "jurisdiction": approval[2].get("jurisdiction"),
            "source": approval[2].get("source"),
        })

    current_state = None
    current_source = None
    statuses = jurisdiction_statuses(page)
    for jurisdiction in JURISDICTIONS_SEED17:
        entry = statuses.get(jurisdiction)
        if entry and entry["statusNormalized"] != "unknown":
            current_state = entry["status"]
            current_source = entry.get("source")
            break
    if current_state is None:
        phase = page.field("highestphase")
        if phase is not None:
            current_state = str(phase.value if not isinstance(phase.value, dict) else phase.value.get("value"))
            current_source = phase.source
    if current_state is None:
        return None

    dated = [e for e in events if e.get("year") is not None]
    if len(dated) < 2:
        return None
    dated.sort(key=lambda e: (e["year"], e["event"]))
    return {
        "slots": {"firstYear": dated[0]["year"], "currentState": current_state},
        "values": {"events": dated, "currentState": {"value": current_state, "source": current_source}},
    }


def seed_09(ctx, page):
    """What would change this. LONGEVITY/CLINICAL; field 14 ongoing trials, else the registry."""
    rows = []
    entries = ongoing_trial_entries(page, ctx)
    if not entries:
        entries = [
            {
                "nct": row.get("nct"),
                "title": row.get("title"),
                "n": row.get("n"),
                "primaryEndpoints": row.get("primaryEndpoints") or [],
                "completionDate": row.get("completionDate"),
                "source": row.get("source"),
                "sourceDate": row.get("sourceDate"),
                "lastVerified": None,
            }
            for row in ctx.ongoing_trials(page.key)
        ]
    for entry in entries:
        if not entry["completionDate"]:
            continue
        for endpoint_text in entry["primaryEndpoints"]:
            endpoint = audience_endpoint_of(endpoint_text)
            if not endpoint:
                continue
            rows.append({
                "nct": entry["nct"],
                "title": entry["title"],
                "n": entry["n"],
                "primaryEndpoint": endpoint_text,
                "audienceEndpoint": endpoint,
                "readoutDate": entry["completionDate"],
                "source": entry["source"],
                "sourceDate": entry["sourceDate"],
                "lastVerified": entry["lastVerified"],
            })
            break
    if not rows:
        return None
    rows.sort(key=lambda r: (str(r["readoutDate"]), str(r["nct"])))
    return {
        "slots": {"endpoint": rows[0]["audienceEndpoint"], "n": len(rows)},
        "values": {"trials": rows},
    }


def _kinetics_alternates(page, parameter_names):
    """All recorded values for one kinetic parameter, when the assembler kept alternates."""
    entry, provenance = kinetics_parameter(page, *parameter_names)
    if entry is None:
        return []
    values = [kinetics_value_object(entry, provenance, parameter_names[0])]
    for alternate in as_list(entry.get("alternatives") or entry.get("alternates") or entry.get("otherSources")):
        if isinstance(alternate, dict):
            values.append(kinetics_value_object(alternate, {
                "source": alternate.get("source"),
                "sourceDate": alternate.get("sourceDate"),
                "verbatim": alternate.get("verbatim"),
            }, parameter_names[0]))
    return values


def seed_10(ctx, page):
    """Source contradiction. CLINICAL/LONGEVITY; exact-field comparison only, no adjudication."""
    contradictions = []

    for names in (["halfLife", "half_life", "t12"], ["bioavailability", "oralBioavailability"], ["tmax", "tMax"]):
        values = _kinetics_alternates(page, names)
        if len(values) < 2:
            continue
        distinct = {(str(v.get("value")), str(v.get("unit"))) for v in values}
        if len(distinct) > 1:
            contradictions.append({"comparison": "kinetics:" + names[0], "values": values})

    indication = page.field("indication")
    if indication is not None:
        label_terms = [t for t in outcome_strings(indication.value) if t] or ([str(indication.value)] if isinstance(indication.value, str) else [])
        registry_conditions = ctx.conditions(page.key)
        if label_terms and registry_conditions:
            label_normalized = {norm(t) for t in label_terms}
            registry_normalized = {norm(c) for c in registry_conditions}
            if not (label_normalized & registry_normalized):
                contradictions.append({
                    "comparison": "indication vs registry conditions",
                    "values": [
                        {"value": label_terms, "source": indication.source, "sourceDate": indication.source_date},
                        {"value": sorted(set(registry_conditions)), "source": {"kind": "registry"}, "sourceDate": None},
                    ],
                })

    withdrawal = page.field("withdrawalstatus")
    if withdrawal is not None:
        value = withdrawal.value if isinstance(withdrawal.value, dict) else {}
        if to_bool(value.get("withdrawn")) is True or to_bool(withdrawal.value) is True:
            for entry in jurisdiction_statuses(page).values():
                if entry["statusNormalized"] in APPROVED_STATUSES:
                    contradictions.append({
                        "comparison": "withdrawal status vs register status",
                        "values": [
                            {"value": value.get("reason") or "withdrawn", "source": withdrawal.source, "sourceDate": withdrawal.source_date},
                            {"value": entry["status"], "jurisdiction": entry["jurisdiction"], "source": entry.get("source"), "sourceDate": entry.get("sourceDate")},
                        ],
                    })
                    break

    statuses_field = page.field("regulatorystatus")
    if statuses_field is not None:
        for entry in as_list(statuses_field.value if not isinstance(statuses_field.value, dict) else list(statuses_field.value.values())):
            if not isinstance(entry, dict):
                continue
            alternates = [a for a in as_list(entry.get("alternatives") or entry.get("conflicting")) if isinstance(a, dict)]
            status = first_str(entry, "status", "value")
            if status and alternates:
                distinct = {norm(status)} | {norm(first_str(a, "status", "value")) for a in alternates}
                if len(distinct) > 1:
                    contradictions.append({
                        "comparison": "register status disagreement",
                        "jurisdiction": (first_str(entry, "jurisdiction", "region", "country") or "").upper(),
                        "values": [{"value": status, "source": entry.get("source"), "sourceDate": entry.get("sourceDate")}]
                        + [{"value": first_str(a, "status", "value"), "source": a.get("source"), "sourceDate": a.get("sourceDate")} for a in alternates],
                    })

    if not contradictions:
        return None
    return {"slots": {"n": len(contradictions)}, "values": {"contradictions": contradictions}}


def seed_11(ctx, page):
    """Animal-only ceiling. LONGEVITY; top rung non-human AND field 5 anyAgingEndpoint false."""
    rungs = ladder_rungs(page)
    if not rungs:
        return None
    top_rung, top_entry = rungs[-1]
    if top_rung == "human":
        return None
    ceiling = page.field("humanceiling")
    if ceiling is None or not isinstance(ceiling.value, dict):
        return None
    if to_bool(ceiling.value.get("anyAgingEndpoint")) is not False:
        return None
    kind = first_str(top_entry, "evidenceKind", "kind", "endpointType")
    if not kind:
        return None
    return {
        "slots": {"organism": top_rung, "kind": kind, "endpoint": kind},
        "values": {
            "topRung": {
                "organism": top_rung,
                "organismVerbatim": first_str(top_entry, "organism", "species") or top_rung,
                "evidenceKind": kind,
                "source": top_entry.get("citation") or top_entry.get("source"),
                "sourceDate": top_entry.get("sourceDate"),
            },
            "rungs": [r for r, _ in rungs],
            "anyAgingEndpointInHumans": False,
            "humanCeilingSource": ceiling.provenance(),
        },
    }


def seed_12(ctx, page):
    """Registry-to-publication gap: completed > 2 years before --as-of, no results, no citing record."""
    cutoff_year = ctx.as_of.year - 2
    cutoff = date(cutoff_year, ctx.as_of.month, ctx.as_of.day) if (ctx.as_of.month, ctx.as_of.day) != (2, 29) else date(cutoff_year, 2, 28)
    citing = set()
    for pub in ctx.pubs(page.key):
        if pub.is_clinical_trial:
            citing.update(pub.ncts)
    rows = []
    for row in ctx.completed_without_results(page.key):
        parsed = row.get("completionDateParsed")
        if parsed is not None and parsed >= cutoff:
            continue
        if parsed is None and not row.get("completionDate"):
            continue
        if row.get("nct") in citing:
            continue
        rows.append({k: v for k, v in row.items() if k != "completionDateParsed"})
    if not rows:
        return None
    rows.sort(key=lambda r: (str(r["completionDate"]), str(r["nct"])))
    values = {"unreportedTrials": rows, "asOf": ctx.as_of.isoformat(), "cutoff": cutoff.isoformat()}
    if "publications" not in ctx.capabilities:
        values["publicationCheck"] = (
            "not applied: the registry input holds no publication records, so these are trials "
            "with no result posted to the registry, which is not the same as never published"
        )
    return {"slots": {"n": len(rows)}, "values": values}


def _target_slot(row):
    """The R7 {target} slot: the gene symbol when one is recorded, else the recorded label."""
    if row.get("targetKind") == "gene-symbol":
        return row["target"]
    return row.get("targetLabel") or row["target"]


def seed_13(ctx, page):
    """Same-target lineage. DEVELOPMENT/CLINICAL; target shared by >= 2 corpus compounds."""
    targets = ctx.page_targets.get(page.key) or []
    if not targets:
        return None
    rows = []
    for symbol, entry in sorted(targets, key=lambda t: t[0]):
        index_entry = ctx.target_index.get(symbol)
        if not index_entry:
            continue
        # A compound can appear twice under one target where the index holds it under two records,
        # and the same compound routinely appears under several of this page's targets. Both are
        # the same related compound, and the renderer's revealed rows are one row per compound.
        others = []
        seen_here = set()
        for member in index_entry["pages"]:
            if member["key"] == page.key or member["key"] in seen_here:
                continue
            seen_here.add(member["key"])
            others.append(member)
        if not others:
            continue
        rows.append({
            "target": symbol,
            "targetLabel": entry.get("label"),
            "targetKind": entry.get("kind"),
            "targetUrl": entry.get("url"),
            # The count stays exact and un-deduplicated across targets: it states how many other
            # corpus compounds share THIS target, which is a fact about the target.
            "sharedWithCount": len(others),
            "_others": others,
            "source": entry.get("source") or (page.field("moleculartarget").source if page.field("moleculartarget") else None),
            "sourceDate": entry.get("sourceDate") or (page.field("moleculartarget").source_date if page.field("moleculartarget") else None),
        })
    if not rows:
        return None
    rows.sort(key=lambda r: (-r["sharedWithCount"], r["target"]))
    # Gate 2 defect: the row cap was applied to each target's list before the page's lists were
    # reconciled, so a compound sharing three targets filled three of the twenty revealed rows and
    # was counted three times in the outcome tally. De-duplicate across the page's targets FIRST,
    # in the order the rows are presented, and cap what survives. A target row whose every compound
    # was already listed above it is dropped: it would render a heading over nothing.
    listed = set()
    deduplicated = []
    for row in rows:
        others = row.pop("_others")
        fresh = [m for m in others if m["key"] not in listed]
        members = []
        for member in fresh[:SHARE_LIST_CAP]:
            listed.add(member["key"])
            other_page = ctx.pages_by_key.get(member["key"])
            outcome, basis = compound_outcome(ctx, other_page) if other_page else ("unstated", {"basis": "page not loaded"})
            members.append({"key": member["key"], "displayName": member["displayName"], "outcome": outcome, "outcomeBasis": basis})
        if not members:
            continue
        row["compounds"] = members
        row["truncated"] = len(fresh) > SHARE_LIST_CAP
        # How many of this target's shared compounds are listed on a row above this one. Recorded
        # so the count and the list can be read together without either being restated.
        row["alsoListedAbove"] = len(others) - len(fresh)
        deduplicated.append(row)
    if not deduplicated:
        return None
    return {
        "slots": {"target": _target_slot(deduplicated[0]), "n": deduplicated[0]["sharedWithCount"]},
        "values": {"targets": deduplicated, "distinctCompounds": len(listed)},
    }


def _faers_terms(page):
    field = page.field("faers")
    if field is None:
        return []
    out = []
    for entry in as_list(field.value if not isinstance(field.value, dict) else (field.value.get("terms") or field.value.get("reactions") or [])):
        if isinstance(entry, str):
            out.append({"term": entry, "count": None, "period": None, "source": field.source, "sourceDate": field.source_date})
        elif isinstance(entry, dict):
            term = first_str(entry, "term", "reaction", "name", "meddraTerm", "value")
            if not term:
                continue
            out.append({
                "term": term,
                "count": to_int(first_any(entry, "count", "reports", "n")),
                "period": first_str(entry, "period", "window"),
                "source": entry.get("source") or field.source,
                "sourceDate": entry.get("sourceDate") or field.source_date,
            })
    return out


def _label_reaction_terms(page):
    field = page.field("adverseevents")
    if field is None:
        return None  # the label section was not captured; the set difference cannot be stated
    terms = []
    value = field.value
    if isinstance(value, dict):
        value = value.get("terms") or value.get("reactions") or list(value.values())
    for entry in as_list(value):
        if isinstance(entry, str):
            terms.append(entry)
        elif isinstance(entry, dict):
            term = first_str(entry, "term", "reaction", "name", "value")
            if term:
                terms.append(term)
    return terms


def seed_14(ctx, page):
    """Spontaneous-report disproportion: FAERS terms minus the label's reaction terms."""
    faers = _faers_terms(page)
    if not faers:
        return None
    label_terms = _label_reaction_terms(page)
    if label_terms is None:
        return None
    label_normalized = {norm(t) for t in label_terms if t}
    unlisted = [t for t in faers if norm(t["term"]) not in label_normalized]
    if not unlisted:
        return None
    unlisted.sort(key=lambda t: (-(t["count"] or 0), norm(t["term"])))
    return {
        "slots": {"n": len(unlisted), "term": unlisted[0]["term"]},
        "values": {
            "reportedNotOnLabel": unlisted,
            "labelTermCount": len(label_normalized),
            "reportKind": "spontaneous reports, not incidence",
            "labelSource": (page.field("adverseevents").provenance() if page.field("adverseevents") else None),
        },
    }


def seed_15(ctx, page):
    """Evidence age: the latest human trial completion or clinical-trial publication."""
    candidates = []
    latest_trial = ctx.latest_human_completion(page.key)
    if latest_trial is not None:
        candidates.append(latest_trial)
    for pub in ctx.pubs(page.key):
        if pub.is_clinical_trial and (pub.date or pub.date_verbatim):
            candidates.append({
                "kind": "clinical-trial publication",
                "date": pub.date_verbatim,
                "parsed": pub.date,
                "record": pub.pmid,
                "recordKind": "PMID",
                "source": pub.source,
                "sourceDate": pub.source_date,
            })
    dated = [c for c in candidates if c["parsed"] is not None]
    if not dated:
        return None
    latest = max(dated, key=lambda c: (c["parsed"], str(c["record"])))
    year = latest["parsed"].year
    later = [
        {"record": c["record"], "recordKind": c["recordKind"], "date": c["date"], "source": c["source"]}
        for c in dated
        if c["parsed"] > latest["parsed"]
    ]
    record = {k: v for k, v in latest.items() if k != "parsed"}
    return {
        "slots": {"year": year},
        "values": {
            "latest": record,
            "yearsSince": ctx.as_of.year - year,
            "asOf": ctx.as_of.isoformat(),
            "laterPublications": later,
        },
    }


def seed_16(ctx, page):
    """Trial size ceiling: max, median and the count under 30, over recorded human enrolments."""
    enrolments = ctx.enrolments(page.key)
    if not enrolments:
        return None
    values = {
        "trialCount": enrolments["n"],
        "maxN": enrolments["max"],
        "medianN": enrolments["median"],
        "basis": enrolments.get("basis"),
    }
    for optional in ("countUnder30", "largestTrial", "trials", "source"):
        if enrolments.get(optional) is not None:
            values[optional] = enrolments[optional]
    return {
        "slots": {"median": enrolments["median"], "N": enrolments["max"], "n": enrolments["n"]},
        "values": values,
    }


def seed_17(ctx, page):
    """Jurisdiction divergence: >= 2 of US/EU/UK/CA/SG recorded in different statuses."""
    statuses = jurisdiction_statuses(page)
    rows = []
    for jurisdiction in JURISDICTIONS_SEED17:
        entry = statuses.get(jurisdiction)
        if not entry or entry["statusNormalized"] in {"unknown", ""}:
            continue
        rows.append(entry)
    if len(rows) < 2:
        return None
    if len({r["statusNormalized"] for r in rows}) < 2:
        return None
    return {
        "slots": {"jurisdictions": [r["jurisdiction"] for r in rows]},
        "values": {"statuses": [{k: v for k, v in r.items() if k != "statusNormalized"} for r in rows]},
    }


# --------------------------------------------------------------------------- seed table

SEEDS = [
    {
        "number": 1, "slug": "bioavailability-gap", "name": "Bioavailability gap",
        "models": {"LONGEVITY", "CLINICAL"}, "fn": seed_01, "suppressionAbsolute": True,
        "spec_wording": "The {organism} result for {name} used the {route} route; what does the oral form reach?",
        "requires": {"fields"},
    },
    {
        "number": 2, "slug": "n-of-1-designability", "name": "N-of-1 designability",
        "models": {"LONGEVITY"}, "fn": seed_02, "suppressionAbsolute": True,
        "spec_wording": "Could one person measure {name}'s effect on {biomarker}?",
        "requires": {"fields", "registry"},
    },
    {
        "number": 3, "slug": "failure-autopsy", "name": "Failure autopsy",
        "models": None, "fn": seed_03, "suppressionAbsolute": False,
        "spec_wording": "Why did {n} trials of {name} stop?",
        "requires": {"fields"},
    },
    {
        "number": 4, "slug": "endpoint-mismatch", "name": "Endpoint mismatch",
        "models": {"LONGEVITY"}, "fn": seed_04, "suppressionAbsolute": False,
        "spec_wording": "What have human trials of {name} actually measured?",
        "requires": {"fields", "registry"},
    },
    {
        "number": 5, "slug": "stack-interaction-graph", "name": "Stack interaction graph",
        "models": None, "fn": seed_05, "suppressionAbsolute": False,
        "spec_wording": "Which other compounds share {name}'s {enzyme} pathway?",
        "requires": {"fields"},
    },
    {
        "number": 6, "slug": "time-to-signal", "name": "Time-to-signal",
        "models": {"LONGEVITY"}, "fn": seed_06, "suppressionAbsolute": True,
        "spec_wording": "How long did trials of {name} run before reporting an effect on {endpoint}?",
        "requires": {"fields"},
    },
    {
        "number": 7, "slug": "sex-specific-divergence", "name": "Sex-specific divergence",
        "models": {"LONGEVITY"}, "fn": seed_07, "suppressionAbsolute": False,
        "spec_wording": "Did {name} act differently in male and female {organism}?",
        "requires": {"fields"},
    },
    {
        "number": 8, "slug": "evidence-provenance-timeline", "name": "Evidence provenance timeline",
        "models": None, "fn": seed_08, "suppressionAbsolute": False,
        "spec_wording": "How did {name} get from {first-event year} to {current state}?",
        "requires": {"fields", "registry"},
    },
    {
        "number": 9, "slug": "what-would-change-this", "name": "What would change this",
        "models": {"LONGEVITY", "CLINICAL"}, "fn": seed_09, "suppressionAbsolute": False,
        "spec_wording": "Which running trial could settle {name}'s effect on {endpoint}?",
        "requires": {"fields"},
    },
    {
        "number": 10, "slug": "source-contradiction", "name": "Source contradiction",
        "models": {"CLINICAL", "LONGEVITY"}, "fn": seed_10, "suppressionAbsolute": False,
        "spec_wording": "Where do the label and the trials disagree about {name}?",
        "requires": {"fields"},
    },
    {
        "number": 11, "slug": "animal-only-ceiling", "name": "Animal-only ceiling",
        "models": {"LONGEVITY"}, "fn": seed_11, "suppressionAbsolute": False,
        "spec_wording": "How far up the organism ladder has {name} been tested for {endpoint}?",
        "requires": {"fields"},
    },
    {
        "number": 12, "slug": "registry-to-publication-gap", "name": "Registry-to-publication gap",
        "models": None, "fn": seed_12, "suppressionAbsolute": False,
        "spec_wording": "How many completed trials of {name} never reported a result?",
        "requires": {"registry"},
    },
    {
        "number": 13, "slug": "same-target-lineage", "name": "Same-target lineage",
        "models": {"DEVELOPMENT", "CLINICAL"}, "fn": seed_13, "suppressionAbsolute": False,
        "spec_wording": "What happened to the other compounds aimed at {target}?",
        "requires": {"fields"},
    },
    {
        "number": 14, "slug": "spontaneous-report-disproportion", "name": "Spontaneous-report disproportion",
        "models": None, "fn": seed_14, "suppressionAbsolute": False,
        "spec_wording": "Which reactions to {name} are reported but not on its label?",
        "requires": {"fields"},
    },
    {
        "number": 15, "slug": "evidence-age", "name": "Evidence age",
        "models": None, "fn": seed_15, "suppressionAbsolute": False,
        "spec_wording": "When was {name} last tested in people?",
        "requires": {"registry"},
        "capabilities": {"latestCompletionDate"},
    },
    {
        "number": 16, "slug": "trial-size-ceiling", "name": "Trial size ceiling",
        "models": None, "fn": seed_16, "suppressionAbsolute": False,
        "spec_wording": "How large were the human trials of {name}?",
        "requires": {"registry"},
    },
    {
        "number": 17, "slug": "jurisdiction-divergence", "name": "Jurisdiction divergence",
        "models": None, "fn": seed_17, "suppressionAbsolute": False,
        "spec_wording": "Is {name} a drug, a supplement or controlled, and where?",
        "requires": {"fields"},
    },
]

READER_WORDS = re.compile(r"\b(you|your|yourself)\b", re.IGNORECASE)


def seed_skips_suppressed(seed):
    """R2: seeds 1, 2 and 6 absolutely, plus any seed whose wording names the reader."""
    return bool(seed["suppressionAbsolute"]) or bool(READER_WORDS.search(seed["spec_wording"]))


def seed_file_name(seed):
    return "seed-%02d-%s.ndjson" % (seed["number"], seed["slug"])


def seed_applies(seed, page):
    if seed["models"] is None:
        return True
    if not page.model:
        return True  # model not recorded upstream: do not exclude the page on a missing value
    return page.model in seed["models"]


# --------------------------------------------------------------------------- run

def compute_seed(ctx, seed):
    """Run one seed over the corpus; returns (records, skipped_suppressed, pages_considered)."""
    skip_suppressed = seed_skips_suppressed(seed)
    records = []
    skipped = 0
    considered = 0
    for page in ctx.pages:
        if skip_suppressed and page.suppressed:
            skipped += 1
            continue
        if not seed_applies(seed, page):
            continue
        considered += 1
        try:
            result = seed["fn"](ctx, page)
        except Exception as exc:  # a malformed upstream record must not abort the run
            print("  ! seed %d failed on %s: %s" % (seed["number"], page.key, exc), file=sys.stderr)
            continue
        if not result:
            continue
        record = {
            "key": page.key,
            "displayName": page.display_name,
            "seed": seed["number"],
            "seedSlug": seed["slug"],
            "model": page.model or None,
            "slots": result["slots"],
            "values": result["values"],
        }
        records.append(record)
    records.sort(key=lambda r: r["key"])
    return records, skipped, considered


CAPABILITY_REASONS = {
    "trialResultDirections": (
        "the registry input records no direction of a trial's primary result, which this seed's "
        "computability column requires (ClinicalTrials.gov summaries carry no result direction)"
    ),
    "latestCompletionDate": (
        "the registry input records no latest completion date per page: the aggregate carries "
        "completion dates only for the longest trial and for completed-without-results trials. "
        "Add lastCompletionDate to the registry aggregate, or supply per-trial completion dates"
    ),
    "perTrialEnrolments": "the registry input records no per-trial enrolment",
    "publications": "the registry input holds no publication records",
}


def computability(ctx, seed, have_fields, have_registry):
    """(computable, reason) — an input or a registry fact a seed needs that is absent."""
    missing = []
    if "fields" in seed["requires"] and not have_fields:
        missing.append("field records")
    if "registry" in seed["requires"] and not have_registry:
        missing.append("registry records")
    if missing:
        return False, "not computable: no %s were read from the input directories" % " or ".join(missing)
    for capability in sorted(seed.get("capabilities") or ()):
        if capability not in ctx.capabilities:
            return False, "not computable: " + CAPABILITY_REASONS.get(capability, "the registry input cannot express %s" % capability)
    return True, None


def main(argv=None):
    parser = argparse.ArgumentParser(description="Compute the Phase 3 derived seeds (docs/specs/derived-content.md).")
    parser.add_argument("--fields", required=True, help="directory of assembled field records (NDJSON)")
    parser.add_argument("--registry", required=True, help="directory of registry trial and publication records (NDJSON)")
    parser.add_argument("--assignments", required=True, help="R2 suppression assignments NDJSON")
    parser.add_argument("--out", required=True, help="output directory")
    parser.add_argument("--as-of", default=None, help="date the two-year cut (seed 12) and years-since (seed 15) are measured against; default today (UTC)")
    parser.add_argument("--min-fires", type=int, default=MIN_FIRES, help="a seed firing on fewer pages is discarded (default 40)")
    parser.add_argument("--seeds", default=None, help="comma-separated seed numbers to compute (default all kept seeds)")
    parser.add_argument("--require-inputs", action="store_true", help="exit non-zero when an input directory is missing or empty")
    args = parser.parse_args(argv)

    if duckdb is None:
        print("duckdb is required: %s" % _DUCKDB_ERROR, file=sys.stderr)
        return 2

    if args.as_of:
        _, as_of = parse_date(args.as_of)
        if as_of is None:
            print("--as-of must be a date (YYYY-MM-DD)", file=sys.stderr)
            return 2
    else:
        as_of = datetime.now(timezone.utc).date()

    os.makedirs(args.out, exist_ok=True)

    print("[1/5] suppression assignments", flush=True)
    suppressed_keys, display_names, assignment_count = load_assignments(args.assignments)
    print("      %d assignments, %d suppressed" % (assignment_count, len(suppressed_keys)), flush=True)

    print("[2/5] field records", flush=True)
    pages = []
    seen_keys = set()
    field_files = set()
    for path, record in iter_records(args.fields):
        page = build_page(record, suppressed_keys, display_names)
        if page is None or page.key in seen_keys:
            continue
        seen_keys.add(page.key)
        field_files.add(path)
        pages.append(page)
    pages.sort(key=lambda p: p.key)
    have_fields = bool(pages)
    print("      %d pages from %d files" % (len(pages), len(field_files)), flush=True)

    print("[3/5] registry records", flush=True)
    registry = load_registry(args.registry)
    have_registry = bool(registry["trialCount"] or registry["publicationCount"] or registry["aggregateCount"])
    print("      %d aggregate pages, %d trials, %d publications, %d match records"
          % (registry["aggregateCount"], registry["trialCount"], registry["publicationCount"], registry["matchCount"]), flush=True)

    if args.require_inputs and not (have_fields and have_registry):
        print("required inputs missing (fields=%s registry=%s)" % (have_fields, have_registry), file=sys.stderr)
        return 3

    ctx = Context(pages, registry, as_of, args.out)
    con = duckdb.connect()

    print("[4/5] corpus-wide indexes (seeds 5 and 13)", flush=True)
    index_stats = build_indexes(ctx, con)
    print("      %d enzyme/transporter nodes, %d target nodes" % (index_stats["enzymeNodes"], index_stats["targetNodes"]), flush=True)

    selected = None
    if args.seeds:
        selected = {int(part.strip()) for part in args.seeds.split(",") if part.strip()}

    print("[5/5] seeds", flush=True)
    con.execute("DROP TABLE IF EXISTS fires")
    con.execute("CREATE TABLE fires (seed INTEGER, key VARCHAR)")

    fire_counts = {}
    for seed in SEEDS:
        if selected is not None and seed["number"] not in selected:
            continue
        computable, reason = computability(ctx, seed, have_fields, have_registry)
        records, skipped, considered = ([], 0, 0) if not computable else compute_seed(ctx, seed)
        path = os.path.join(args.out, seed_file_name(seed))
        write_ndjson(path, records)
        if records:
            con.executemany("INSERT INTO fires VALUES (?,?)", [(seed["number"], r["key"]) for r in records])
        fires, sample = con.execute(
            "SELECT count(*), list(key ORDER BY key)[1:10] FROM fires WHERE seed = ?", [seed["number"]]
        ).fetchone()
        discarded = computable and fires < args.min_fires
        if not computable:
            final_reason = reason
        elif discarded:
            final_reason = "discarded: fires on %d of the %d pages in this seed's models, below the %d-page floor" % (fires, considered, args.min_fires)
        else:
            final_reason = "computed over %d pages in this seed's models" % considered
        entry = {
            "name": seed["name"],
            "computable": bool(computable),
            "fires": int(fires),
            "sample": list(sample or []),
            "discarded": bool(discarded),
            "reason": final_reason,
            "pagesConsidered": considered,
            "models": sorted(seed["models"]) if seed["models"] else "any",
            "file": seed_file_name(seed),
        }
        if seed_skips_suppressed(seed):
            entry["suppressedPagesSkipped"] = skipped
            entry["suppression"] = "absolute: suppressed pages are absent from this file"
        fire_counts[str(seed["number"])] = entry
        print("      seed %-2d %-34s fires=%-6d %s" % (seed["number"], seed["slug"], fires, "DISCARDED" if discarded else ("NOT COMPUTABLE" if not computable else "")), flush=True)

    summary = {
        "spec": "docs/specs/derived-content.md",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "asOf": as_of.isoformat(),
        "minFires": args.min_fires,
        "inputs": {
            "fields": {"directory": args.fields, "pages": len(pages), "files": len(field_files)},
            "registry": {
                "directory": args.registry,
                "aggregatePages": registry.get("aggregateCount", 0),
                "matchRecords": registry.get("matchCount", 0),
                "trials": registry["trialCount"],
                "publications": registry["publicationCount"],
                "files": len(registry["files"]),
                "capabilities": sorted(ctx.capabilities),
            },
            "assignments": {"path": args.assignments, "records": assignment_count, "suppressed": len(suppressed_keys)},
        },
        "indexes": index_stats,
        "seeds": fire_counts,
    }
    with open(os.path.join(args.out, "fire-counts.json"), "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, ensure_ascii=False, sort_keys=True)
        handle.write("\n")
    con.close()
    print("wrote %s" % os.path.join(args.out, "fire-counts.json"), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
