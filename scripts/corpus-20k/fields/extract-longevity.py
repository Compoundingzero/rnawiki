#!/usr/bin/env python
"""Phase 2, stage 2 — the LONGEVITY field extractor (docs/specs/field-models.md, 15 fields).

Scope: every page assigned model LONGEVITY in data/corpus-20k/tiers/model-assignment.ndjson.
Output: data/corpus-20k/fields/longevity/batch-NNNN.ndjson, 250 pages per file.

Editorial rules enforced in code, not by convention:
  * Every present value is copied verbatim from the source and carries {kind, id, url} plus the
    source record's own date (R9) and today's verification date.
  * No number is computed that the source does not state. The ITP per-animal workbooks are read
    for the cohort facts they print (agent, dose, age at start, sexes, animals recorded); no
    median, no percent change, no survival statistic is derived from them.
  * Every organism finding names its organism, and the endpoint type comes from the finding
    sentence's own words.
  * A stopped trial carries the registry's own whyStopped and nothing else.
  * `absent` means every mapped source was consulted and returned nothing. `not-applicable` names
    the rule that excludes the field for this record's class.

Stages: `--stage fetch` only warms the Europe PMC cache; `--stage build` only composes from the
cache and the on-disk sources; the default runs both. A rerun skips batch files that already exist
with a recorded batch in data/corpus-20k/state.json.
"""

from __future__ import annotations

import argparse
import csv
import glob
import html
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import epmc  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
D = lambda *p: os.path.join(ROOT, *p)  # noqa: E731
I = lambda *p: os.path.join(INGEST, *p)  # noqa: E731

OUT_DIR = os.environ.get("LONGEVITY_OUT_DIR") or D("data", "corpus-20k", "fields", "longevity")
NO_RECORD = os.environ.get("LONGEVITY_NO_RECORD") == "1"
# Phase 2b (scripts/corpus-20k/fields/augment.py): FORCE rewrites batch files the ledger already
# records, KEEP_SUMMARY keeps the summary in data/corpus-20k/fields/ during a no-record rerun.
FORCE = os.environ.get("LONGEVITY_FORCE") == "1"
KEEP_SUMMARY = os.environ.get("LONGEVITY_KEEP_SUMMARY") == "1"
FIELDS_DIR = D("data", "corpus-20k", "fields")
BATCH_SIZE = 250
TODAY = "2026-09-04"

# ---------------------------------------------------------------- source dates (R9)
# A source record's own date where it has one, else the archive/export date recorded in
# data/corpus-20k/state.json when that file was taken.
SRC = {
    "ctgov": {"kind": "clinicaltrials.gov", "date": "2026-09-01",
              "note": "ClinicalTrials.gov API v2 snapshot 2026-09-01T09:00:05"},
    "itp": {"kind": "jax-mpd-itp", "date": "2026-09-04",
            "note": "JAX Mouse Phenome Database NIA ITP lifespan workbooks, downloaded 2026-09-04"},
    "chembl": {"kind": "chembl", "date": "2026-09-04", "release": "chembl_37"},
    "opentargets": {"kind": "open-targets", "date": "2026-06-24", "release": "26.06"},
    "openfda": {"kind": "openfda", "date": "2026-08-28"},
    "ema": {"kind": "ema", "date": "2026-09-04"},
    "healthcanada": {"kind": "health-canada-dpd", "date": "2026-09-04"},
}

FIELD_NAMES = [
    "hallmark", "organismLadder", "itp", "endpointType", "humanCeiling", "clocks",
    "doseResponse", "pathway", "kinetics", "interactions", "trialFailures", "biomarkers",
    "regulatory", "ongoingTrials", "faers",
]

_NON = re.compile(r"[^a-z0-9]+")
SALT_WORDS = {
    "hydrochloride", "hcl", "sodium", "potassium", "calcium", "magnesium", "sulfate", "sulphate",
    "phosphate", "acetate", "maleate", "tartrate", "citrate", "mesylate", "besylate", "fumarate",
    "succinate", "bromide", "chloride", "nitrate", "oxalate", "tosylate", "dihydrate",
    "monohydrate", "hydrate", "anhydrous", "malate", "lactate", "bitartrate", "hydrobromide",
    "gluconate", "carbonate", "benzoate", "stearate", "trihydrate", "disodium", "dipotassium",
    "salt", "base",
}
SAFE_KINDS = {"display", "inn", "usan", "ban", "jan", "brand", "salt", "code"}


def norm(s):
    return _NON.sub(" ", str(s or "").lower()).strip()


def strip_salt(n):
    parts = [p for p in n.split(" ") if p]
    while len(parts) > 1 and parts[-1] in SALT_WORDS:
        parts.pop()
    return " ".join(parts)


# ---------------------------------------------------------------- sentence handling

_ABBREV = re.compile(
    r"\b(?:e\.g|i\.e|vs|cf|approx|Fig|et al|Dr|Mr|Mrs|Prof|No|St|Jr|Sr|ca|ref|Refs|"
    r"[A-Z]|p|pp|mg|kg|mL|wt|sp|spp|var|min|max|s\.c|i\.p|i\.v|p\.o)\.\s")


_HEADING = re.compile(r"<h[1-6]>.*?</h[1-6]>", re.I | re.S)


def _split_block(text):
    protected = _ABBREV.sub(lambda m: m.group(0).replace(".", "\x00"), text)
    parts, start = [], 0
    for m in re.finditer(r"(?<=[.!?])[\"')\]]*\s+(?=[A-Z0-9(\[\"'])", protected):
        parts.append(text[start:m.start()].strip())
        start = m.end()
    tail = text[start:].strip()
    if tail:
        parts.append(tail)
    return parts


def sentences(text: str):
    """Split an abstract into sentences without altering a single character of the kept span.
    Europe PMC stores structured abstracts with `<h4>` section headings; a heading ends a sentence
    and is not itself kept."""
    if not text:
        return []
    out = []
    pos, blocks = 0, []
    for m in _HEADING.finditer(text):
        blocks.append(text[pos:m.start()])
        pos = m.end()
    blocks.append(text[pos:])
    for block in blocks:
        out.extend(_split_block(block))
    return [x for x in out if len(x) >= 20]


_TAG = re.compile(r"<[^>]+>")


def dedupe_key(sentence: str) -> str:
    """Markup-insensitive identity for a sentence: a preprint and its published version carry the
    same words with different tags."""
    return re.sub(r"\s+", " ", _TAG.sub("", sentence)).strip().lower()


def rx_any(terms):
    return re.compile("|".join(terms), re.I)


# A compound name inside a protein or receptor name is not a mention of the compound. "mechanistic
# target of rapamycin" names mTOR; "sirolimus-eluting stent" names a device. A sentence match is
# rejected when every occurrence of the name sits in one of these constructions.
NAME_CONTEXT_REJECT = re.compile(
    r"(?:mechanistic |mammalian )?target of\s+$|receptor for\s+$|"
    r"\breceptor\b[^.]{0,12}$", re.I)


def names_in_sentence(rx, sentence):
    """True when the sentence names the compound outside a protein/receptor construction."""
    if not rx:
        return False
    for m in rx.finditer(sentence):
        if not NAME_CONTEXT_REJECT.search(sentence[max(0, m.start() - 40):m.start()]):
            return True
    return False


# ---------------------------------------------------------------- vocabularies

HALLMARKS = [
    ("genomic instability", r"genomic instabilit(?:y|ies)|genome instabilit(?:y|ies)"),
    ("telomere attrition", r"telomere attrition"),
    ("epigenetic alterations", r"epigenetic alteration(?:s)?"),
    ("loss of proteostasis", r"loss of proteostasis|proteostasis (?:loss|collapse|decline)"),
    ("disabled macroautophagy", r"disabled macroautophagy|macroautophagy"),
    ("deregulated nutrient sensing", r"deregulated nutrient[- ]sensing|nutrient[- ]sensing"),
    ("mitochondrial dysfunction", r"mitochondrial dysfunction"),
    ("cellular senescence", r"cellular senescence|cell senescence"),
    ("stem cell exhaustion", r"stem cell exhaustion"),
    ("altered intercellular communication", r"altered intercellular communication|"
                                            r"intercellular communication"),
    ("chronic inflammation", r"chronic inflammation|inflammaging|inflamm-aging|inflamm-ageing"),
    ("dysbiosis", r"dysbiosis"),
]
HALLMARK_RX = [(name, re.compile(pat, re.I)) for name, pat in HALLMARKS]

# Query groups: the hallmark terms are OR-ed into two queries rather than twelve, then every
# hallmark is matched at the sentence level. The matched term is always the hallmark's own words.
HALLMARK_QUERY_GROUPS = [
    ['ABSTRACT:"genomic instability"', 'ABSTRACT:"telomere attrition"',
     'ABSTRACT:"epigenetic alterations"', 'ABSTRACT:"loss of proteostasis"',
     'ABSTRACT:"macroautophagy"', 'ABSTRACT:"nutrient sensing"'],
    ['ABSTRACT:"mitochondrial dysfunction"', 'ABSTRACT:"cellular senescence"',
     'ABSTRACT:"stem cell exhaustion"', 'ABSTRACT:"intercellular communication"',
     'ABSTRACT:"chronic inflammation"', 'ABSTRACT:"dysbiosis"'],
]

RUNGS = [
    ("yeast", r"Saccharomyces", 'ABSTRACT:"Saccharomyces"'),
    ("C. elegans", r"C\.\s?elegans|Caenorhabditis",
     'ABSTRACT:"Caenorhabditis" OR ABSTRACT:"C. elegans"'),
    ("Drosophila", r"Drosophila", 'ABSTRACT:"Drosophila"'),
    ("mouse", r"\bmice\b|\bmouse\b", 'ABSTRACT:"mice" OR ABSTRACT:"mouse"'),
    ("rat", r"\brats?\b", 'ABSTRACT:"rat" OR ABSTRACT:"rats"'),
    ("dog", r"\bdogs?\b", 'ABSTRACT:"dog" OR ABSTRACT:"dogs"'),
    ("NHP", r"marmoset|macaque|rhesus|primate",
     'ABSTRACT:"marmoset" OR ABSTRACT:"macaque" OR ABSTRACT:"rhesus" OR ABSTRACT:"primate"'),
]
RUNG_RX = [(name, re.compile(pat, re.I)) for name, pat, _ in RUNGS]
ORGANISM_QUERY_GROUPS = [
    ["yeast", "C. elegans", "Drosophila"],
    ["mouse", "rat"],
    ["dog", "NHP"],
]
AGEING_OUTCOME = ('(ABSTRACT:"lifespan" OR ABSTRACT:"longevity" OR ABSTRACT:"healthspan" OR '
                  'ABSTRACT:"survival" OR ABSTRACT:"aging" OR ABSTRACT:"ageing")')
AGEING_RX = re.compile(r"lifespan|life span|longevity|healthspan|health span|surviv\w*|"
                       r"\bag(?:e)?ing\b", re.I)

# Endpoint type comes from the finding sentence's own terms, in this precedence.
ENDPOINT_TESTS = [
    ("lifespan", re.compile(r"\blife ?span\b|\blongevity\b|\bmaximum life\b|\bmedian surviv\w*|"
                            r"\bmean surviv\w*|\bsurvival curve\w*|\bsurvival time\b|"
                            r"\bmortality\b", re.I)),
    ("healthspan", re.compile(r"\bhealth ?span\b|\bfrailt\w*|\bphysical function\b|"
                              r"\bgrip strength\b|\bmotor function\b|\bcognitive decline\b|"
                              r"\bfunctional decline\b|\bsarcopeni\w*", re.I)),
    ("biomarker", re.compile(r"\bbiomarker\w*|\bepigenetic age\b|\bmethylation age\b|"
                             r"\btelomere length\b|\bserum level\w*|\bplasma level\w*|"
                             r"\bcirculating level\w*|\bconcentration\w*", re.I)),
    ("surrogate", re.compile(r"\bsurrogate\b|\bproxy\b", re.I)),
]
SURVIVAL_RX = re.compile(r"\bsurviv\w*", re.I)
AGED_CONTEXT_RX = re.compile(r"\bag(?:e)?ing\b|\baged\b|\bold\b|\byoung\b|\belderly\b", re.I)


def best_endpoint(measures):
    """The strongest endpoint type any of these registry outcome measures states, with the exact
    measure that stated it. Nothing is ranked that the measures do not say."""
    best = None
    for m in measures:
        if not m:
            continue
        kind = endpoint_type(m)
        if best is None or ENDPOINT_ORDER[kind] < ENDPOINT_ORDER[best[0]]:
            best = (kind, m)
        if best[0] == "lifespan":
            break
    return best or (None, None)


def endpoint_type(sentence: str) -> str:
    for name, rx in ENDPOINT_TESTS:
        if rx.search(sentence):
            return name
    if SURVIVAL_RX.search(sentence) and AGED_CONTEXT_RX.search(sentence):
        return "lifespan"
    return "mechanism-only"


ENDPOINT_ORDER = {"lifespan": 0, "healthspan": 1, "biomarker": 2, "surrogate": 3,
                  "mechanism-only": 4}

CLOCKS = [
    ("Horvath", r"\bHorvath\b"),
    ("Hannum", r"\bHannum\b"),
    ("GrimAge", r"\bGrimAge\b"),
    ("PhenoAge", r"\bPhenoAge\b"),
    ("DunedinPACE", r"\bDunedinPACE\b|\bDunedinPoAm\b"),
    ("epigenetic clock", r"epigenetic clock\w*"),
    ("epigenetic age", r"epigenetic age\w*"),
]
CLOCK_RX = [(n, re.compile(p, re.I)) for n, p in CLOCKS]
CLOCK_QUERY = ('(ABSTRACT:"Horvath" OR ABSTRACT:"Hannum" OR ABSTRACT:"GrimAge" OR '
               'ABSTRACT:"PhenoAge" OR ABSTRACT:"DunedinPACE" OR ABSTRACT:"epigenetic clock" OR '
               'ABSTRACT:"epigenetic age")')

DOSE_SHAPES = [
    ("hormetic", r"hormetic|hormesis"),
    ("U-shaped", r"U-?shaped"),
    ("biphasic", r"biphasic"),
    ("dose-response", r"dose-response|dose response"),
]
DOSE_RX = [(n, re.compile(p, re.I)) for n, p in DOSE_SHAPES]
# Only two of these words are the spec's own shape vocabulary; the others are recorded verbatim
# with shape `unstated` rather than being translated into a shape the source never named.
SHAPE_VOCAB = {"hormetic": "hormetic", "U-shaped": "U-shaped"}
DOSE_QUERY = ('(ABSTRACT:"hormetic" OR ABSTRACT:"hormesis" OR ABSTRACT:"U-shaped" OR '
              'ABSTRACT:"dose-response" OR ABSTRACT:"biphasic")')

PATHWAYS = [
    ("mTOR", r"\bmtor\b|mechanistic target of rapamycin|\bmtorc[12]\b|\bfrap1\b|"
             r"target of rapamycin"),
    ("AMPK", r"\bampk\b|\bprkaa[12]?\b|amp-activated protein kinase"),
    ("sirtuin", r"\bsirtuin\w*|\bsirt[1-7]\b"),
    ("senolytic", r"\bsenolytic\w*"),
    ("autophagy", r"\bautophag\w*"),
    ("NAD+", r"\bnad\+|\bnampt\b|nicotinamide phosphoribosyltransferase|\bnad\b"),
    ("IGF-1", r"\bigf-?1\b|\bigf1r\b|insulin-like growth factor"),
]
PATHWAY_RX = [(n, re.compile(p, re.I)) for n, p in PATHWAYS]

# Phase 2b amendment (docs/specs/field-models.md field 8): a mechanism record rarely prints the
# pathway word, so a pathway is also present when one abstract sentence names this compound, one
# pathway term and one mechanism verb together. The sentence is kept verbatim and cited; nothing is
# inferred from it beyond the three things it says.
PATHWAY_QUERY = ('(ABSTRACT:"mTOR" OR ABSTRACT:"AMPK" OR ABSTRACT:"sirtuin" OR ABSTRACT:"SIRT1" OR '
                 'ABSTRACT:"senolytic" OR ABSTRACT:"autophagy" OR ABSTRACT:"NAD" OR '
                 'ABSTRACT:"NAMPT" OR ABSTRACT:"IGF-1")')
MECHANISM_VERB = re.compile(r"\binhibit\w*|\bactivat\w*|\btarget\w*|\bmodulat\w*|\bvia\b|"
                            r"\bthrough\b|\bdependent\b", re.I)
PATHWAY_SENTENCES_PER_PATHWAY = 3

INTERACTION_QUERY = ('(ABSTRACT:"fasting" OR ABSTRACT:"caloric restriction" OR '
                     'ABSTRACT:"calorie restriction" OR ABSTRACT:"exercise") AND '
                     '(ABSTRACT:"trial" OR ABSTRACT:"randomized" OR ABSTRACT:"randomised")')
INTERACTION_TOPICS = [
    ("fasting", re.compile(r"\bfasting\b|\bfasted\b|intermittent fasting|"
                           r"time-restricted (?:eating|feeding)", re.I)),
    ("caloricRestriction", re.compile(r"calorie restriction|caloric restriction|"
                                      r"\bdietary restriction\b", re.I)),
    ("exercise", re.compile(r"\bexercise\b|\bresistance training\b|\baerobic training\b", re.I)),
]
TRIAL_RX = re.compile(r"\btrial\b|\brandomi[sz]ed\b|\bplacebo\b|\bparticipants?\b", re.I)

CYP_RX = re.compile(r"\bCYP\s?[0-9][A-Z]?[0-9]*\b|cytochrome P450|\bCYP450\b", re.I)
TRANSPORTER_RX = re.compile(r"\bP-gp\b|P-glycoprotein|\bBCRP\b|\bOATP\w*|\bOAT[0-9]\b|"
                            r"\bOCT[0-9]\b|\bMATE[0-9]\b|\bMRP[0-9]\b|\bBSEP\b", re.I)

# Kinetics sentence tests, run over the label's clinical_pharmacology / pharmacokinetics text.
KINETIC_TESTS = [
    ("halfLife", re.compile(r"half-?life|\bt\s?1/2\b|\bt½\b", re.I)),
    ("tmax", re.compile(r"\bT\s?max\b|time to (?:peak|maximum) (?:plasma )?concentration", re.I)),
    ("metabolism", re.compile(r"\bmetaboli[sz]\w*", re.I)),
    ("bioavailability", re.compile(r"bioavailab\w*", re.I)),
]

ITP_QUERY = 'ABSTRACT:"Interventions Testing Program"'
ITP_OUTCOME_RX = re.compile(r"\blife ?span\b|\blongevity\b|\bsurviv\w*|\bmortalit\w*|"
                            r"\bmedian\b|\bmaximum\b", re.I)
ITP_SEX_RX = re.compile(r"\b(?:male|female|men|women)\b", re.I)

AGEING_LEXICON = re.compile(
    r"\bag(?:e)?ing\b|\blongevity\b|\blifespan\b|\blife span\b|\bhealthspan\b|\bfrailty\b|"
    r"\bsarcopenia\b|\bsenescen\w*|\bsenolytic\w*|\bbiological age\b|\bepigenetic age\b|"
    r"\bage-related\b", re.I)

JURISDICTIONS = ["US", "EU", "UK", "CA", "AU", "JP", "SG"]
NOT_CLEARED = {
    "UK": "no UK register was cleared in data/corpus-20k/legal-gate.json",
    "AU": "TGA robots.txt was unretrievable to our agent; the gate was not passed",
    "JP": "PMDA publishes no licence statement and per-product PDFs only; the gate was not passed",
    "SG": "no Singapore register was cleared in data/corpus-20k/legal-gate.json",
}


def field(state, value=None, source=None, source_date=None, verbatim=False, rule=None, note=None):
    out = {"state": state, "value": value, "source": source, "sourceDate": source_date,
           "lastVerified": TODAY if state == "present" else None, "verbatim": bool(verbatim)}
    if rule:
        out["rule"] = rule
    if note:
        out["note"] = note
    return out


def src(kind, ident, url=None):
    return {"kind": kind, "id": ident, "url": url}


# ================================================================= load: canonical + models

def log(msg):
    print(msg, flush=True)


log("[1/11] canonical identity + model assignment")
canon = {}
with open(D("data", "corpus-20k", "identity", "canonical.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        r = json.loads(line)
        canon[r["key"]] = r

pages = []
with open(D("data", "corpus-20k", "tiers", "model-assignment.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        d = json.loads(line)
        if d["model"] != "LONGEVITY":
            continue
        c = canon.get(d["key"]) or {}
        names, safe = [], []
        display = d.get("displayName") or c.get("displayName") or d["key"]
        names.append(display)
        safe.append(display)
        for syn in c.get("synonyms") or []:
            nm = syn.get("name")
            if nm:
                names.append(nm)
                if syn.get("kind") in SAFE_KINDS:
                    safe.append(nm)
        stripped = strip_salt(norm(display))
        pages.append({
            "key": d["key"], "displayName": display, "names": names, "safeNames": safe,
            "strippedName": stripped,
            "chemblId": c.get("chemblId"), "unii": c.get("unii"), "cid": c.get("cid"),
            "rxcui": c.get("rxcui"),
            "isCombination": bool(c.get("isCombination")), "isBiologic": bool(c.get("isBiologic")),
            "existing": sorted({sr["id"] for sr in (c.get("sourceRecords") or [])
                                if sr.get("source") == "existing" and sr.get("id")} |
                               ({c["existingSlug"]} if c.get("existingSlug") else set())),
            "reasons": [r["code"] for r in (d.get("reasons") or [])],
            "withdrawn": bool(d.get("withdrawn")),
            "withdrawnReasonSource": d.get("withdrawnReasonSource"),
        })
pages.sort(key=lambda p: p["key"])
log(f"      {len(pages)} LONGEVITY pages")

KEYS = {p["key"] for p in pages}
by_key = {p["key"]: p for p in pages}
chembl_page = defaultdict(list)
slug_page = {}
for p in pages:
    if p["chemblId"]:
        chembl_page[p["chemblId"]].append(p)
    for slug in p["existing"]:
        slug_page.setdefault(slug, p)
by_chembl = chembl_page  # pathway / adverse-reaction joins are ChEMBL-id keyed

# ---------------------------------------------------------------- identity join index
# Built over ALL 28,966 canonical records, not only the LONGEVITY subset, so the ambiguity guard
# ("a name that names more than three records decides nothing") behaves exactly as it did in
# scripts/corpus-20k/tiers/assign-models.py. Hits are then narrowed to the LONGEVITY pages.

log("      building the corpus-wide name index for register and ITP joins")
all_records = []
idx_unii = defaultdict(set)
idx_rxcui = defaultdict(set)
idx_safe = defaultdict(set)
idx_name = defaultdict(set)
idx_stripped = defaultdict(set)
idx_collapsed = defaultdict(set)
page_of_index = {}
for i, (ckey, r) in enumerate(canon.items()):
    all_records.append(ckey)
    if r.get("unii"):
        idx_unii[str(r["unii"]).upper()].add(i)
    if r.get("rxcui"):
        idx_rxcui[str(r["rxcui"])].add(i)
    names, safe = set(), set()
    if r.get("displayName"):
        names.add(r["displayName"])
        safe.add(r["displayName"])
    for syn in r.get("synonyms") or []:
        if syn.get("name"):
            names.add(syn["name"])
            if syn.get("kind") in SAFE_KINDS:
                safe.add(syn["name"])
    for nm in names:
        n = norm(nm)
        if len(n) >= 4:
            idx_name[n].add(i)
            st = strip_salt(n)
            if st != n and len(st) >= 4:
                idx_stripped[st].add(i)
    for nm in safe:
        n = norm(nm)
        if len(n) >= 4:
            idx_safe[n].add(i)
            idx_collapsed[n.replace(" ", "")].add(i)
    if ckey in by_key:
        page_of_index[i] = by_key[ckey]


def match_indexes(unii=None, rxcui=None, names=(), allow_stripped=True):
    """The identity-join tiers of scripts/corpus-20k/tiers/assign-models.py, unchanged."""
    hits = set()
    if unii:
        for u in (unii if isinstance(unii, (list, tuple, set)) else [unii]):
            if u:
                hits |= idx_unii.get(str(u).upper(), set())
    if rxcui:
        for c in (rxcui if isinstance(rxcui, (list, tuple, set)) else [rxcui]):
            if c:
                hits |= idx_rxcui.get(str(c), set())
    if hits:
        return hits
    for nm in names:
        n = norm(nm)
        if len(n) < 4:
            continue
        h = idx_safe.get(n)
        if h and len(h) <= 3:
            hits |= h
    if hits:
        return hits
    for nm in names:
        n = norm(nm)
        if len(n) < 4:
            continue
        h = idx_name.get(n)
        if h and len(h) <= 3:
            hits |= h
    if hits:
        return hits
    if allow_stripped:
        for nm in names:
            n = strip_salt(norm(nm))
            if len(n) < 4:
                continue
            h = idx_stripped.get(n) or idx_name.get(n)
            if h and len(h) == 1:
                hits |= h
    return hits


def pages_for_names(names, unii=None, rxcui=None):
    out, seen = [], set()
    for i in match_indexes(unii=unii, rxcui=rxcui, names=list(names or [])):
        p = page_of_index.get(i)
        if p is not None and p["key"] not in seen:
            seen.add(p["key"])
            out.append(p)
    return out


def pages_for_agent(printed):
    """Identifier-free resolution of one printed agent name, safest index first — the ITP path of
    assign-models.py, narrowed to LONGEVITY pages."""
    hits = pages_for_names([printed])
    if hits:
        return hits
    collapsed = norm(printed).replace(" ", "")
    if len(collapsed) >= 4:
        h = idx_collapsed.get(collapsed)
        if h and len(h) == 1:
            p = page_of_index.get(next(iter(h)))
            if p is not None:
                return [p]
    return []


# ---------------------------------------------------------------- ChEMBL synonym names
# ChEMBL molecule_synonyms is a typed name list: INN, USAN, BAN, JAN, MERCK_INDEX, RESEARCH_CODE,
# TRADE_NAME. It is the only source in this corpus that separates a substance name from the class
# words ("biguanide", "mTOR inhibitors") that the untyped `common` synonyms carry, so query names
# come from it. `PND` (the preferred-name dump) is skipped: it holds concatenations and fragments.
NOMENCLATURE_TYPES = {"INN", "USAN", "BAN", "JAN", "MERCK_INDEX", "USP", "ATC", "FDA", "EMA",
                      "BNF", "INN_SPANISH", "INN_FRENCH", "USAN_SUBSTEM"}
CODE_TYPES = {"RESEARCH_CODE"}
_CLEAN_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 .'\u2019\-]{2,39}$")

chembl_synonyms = defaultdict(lambda: defaultdict(set))   # chembl id -> name -> {syn_type}
_wanted_chembl = {p["chemblId"] for p in pages if p["chemblId"]}
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "molecules-*.json"))):
    for m in json.load(open(f, encoding="utf-8"))["molecules"]:
        cid = m.get("molecule_chembl_id")
        if cid not in _wanted_chembl:
            continue
        for syn in (m.get("molecule_synonyms") or []):
            t = (syn.get("syn_type") or "").upper()
            nm = (syn.get("molecule_synonym") or "").strip()
            if t == "PND" or not nm:
                continue
            chembl_synonyms[cid][nm].add(t)


def _stereo_stripped(nm):
    """The rewriting assign-models.py already applies to ITP agent names: a leading parenthetical
    stereo descriptor is dropped. "(-)-RAPAMYCIN" is the source's own printing of "RAPAMYCIN"."""
    out = re.sub(r"^\([^)]*\)-?\s*", "", nm).strip()
    return out if out and out != nm else None


def name_candidates(p):
    """Ranked extra names for this record: nomenclature names first, then research codes, then
    trade names, each shorter before longer. Only names a source printed for THIS ChEMBL id."""
    scored = []
    for nm, types in (chembl_synonyms.get(p["chemblId"]) or {}).items():
        for variant in filter(None, [nm, _stereo_stripped(nm)]):
            if not _CLEAN_NAME.match(variant) or len(variant.split()) > 3:
                continue
            score = 3 if types & NOMENCLATURE_TYPES else (2 if types & CODE_TYPES else 1)
            scored.append((-score, len(variant), variant))
    for syn in (canon.get(p["key"], {}).get("synonyms") or []):
        nm = (syn.get("name") or "").strip()
        if syn.get("kind") in SAFE_KINDS and _CLEAN_NAME.match(nm) and len(nm.split()) <= 3:
            scored.append((-1, len(nm), nm))
    out, seen = [], set()
    for _, _, nm in sorted(scored):
        n = norm(nm)
        if n in seen:
            continue
        seen.add(n)
        out.append(nm)
    return out


def query_names(p):
    """At most four names for the Europe PMC query: the display name, its salt-stripped form and
    the two best-attested source names. Every one is a name a source printed for this record."""
    out, seen = [], set()

    def push(nm):
        nm = (nm or "").strip()
        n = norm(nm)
        if len(n) < 4 or n in seen or len(n.split()) > 4 or not _CLEAN_NAME.match(nm):
            return False
        seen.add(n)
        out.append(nm)
        return True

    push(p["displayName"])
    if p["strippedName"] and p["strippedName"] != norm(p["displayName"]):
        push(p["strippedName"])
    for nm in p["candidateNames"]:
        if len(out) >= 4:
            break
        push(nm)
    return out


def match_names(p):
    """Every name used for sentence-level matching. Untyped `common` synonyms are excluded: they
    carry class words, and a sentence about a class is not a sentence about this compound."""
    out, seen = [], set()
    for nm in [p["displayName"], p["strippedName"]] + list(p["safeNames"]) + p["candidateNames"]:
        n = norm(nm)
        if len(n) < 4 or n in seen:
            continue
        seen.add(n)
        out.append(re.escape(nm.strip()).replace(r"\ ", r"[\s\-]+"))
        if n != nm.strip().lower():
            out.append(re.escape(n).replace(r"\ ", r"[\s\-]+"))
    if not out:
        return None
    return re.compile(r"(?<![A-Za-z0-9])(?:" + "|".join(sorted(set(out), key=len,
                                                              reverse=True)) +
                      r")(?![A-Za-z0-9])", re.I)


for p in pages:
    p["candidateNames"] = name_candidates(p)
    p["queryNames"] = query_names(p)
    p["nameRx"] = match_names(p)
    # Every clause is scoped to ABSTRACT: the finding must be a sentence of an abstract that names
    # the compound, so a paper that only mentions it in its full text is not searched at all.
    p["nameClause"] = "(" + " OR ".join(f'ABSTRACT:"{n}"' for n in p["queryNames"]) + ")" \
        if p["queryNames"] else None
log(f"      {sum(1 for p in pages if p['nameClause'])} pages have a Europe PMC name clause; "
    f"{sum(len(p['queryNames']) for p in pages)} names in total")


# ================================================================= load: suppression

log("[2/11] suppression assignments")
suppressed = {}
with open(D("data", "corpus-20k", "suppression", "assignments.ndjson"), encoding="utf-8") as fh:
    for line in fh:
        d = json.loads(line)
        if d["key"] in KEYS:
            suppressed[d["key"]] = bool(d.get("suppressed"))
log(f"      {sum(1 for v in suppressed.values() if v)} of {len(suppressed)} suppressed")


# ================================================================= load: registry aggregates

log("[3/11] registry aggregates")
agg = {}
for f in sorted(glob.glob(D("data", "corpus-20k", "registry", "aggregates", "batch-*.ndjson"))):
    with open(f, encoding="utf-8") as fh:
        for line in fh:
            a = json.loads(line)
            if a["key"] in KEYS:
                agg[a["key"]] = a
log(f"      {len(agg)} LONGEVITY pages carry a matched registration")

pubmed_ct = {}
pm_path = I("pubmed", "clinical-trial-searches.ndjson")
if os.path.exists(pm_path):
    with open(pm_path, encoding="utf-8") as fh:
        for line in fh:
            d = json.loads(line)
            if d.get("status") != "SUCCEEDED":
                continue
            slug = d.get("canonicalSlug") or d.get("drugId")
            if slug in slug_page and d.get("resultCount"):
                pubmed_ct[slug] = {"count": d["resultCount"], "query": d["query"],
                                   "requestedAt": (d.get("requestedAt") or "")[:10]}
log(f"      {len(pubmed_ct)} pages carry a PubMed clinical-trial search with results")


# ================================================================= load: NIA ITP

log("[4/11] NIA ITP lifespan workbooks")
itp_page = defaultdict(list)   # key -> cohort records
itp_agents_seen = set()
itp_unmapped = []
try:
    import pandas as pd

    page_html = open(D("data", "corpus-20k", "legal", "terms", "jax-itp-project.html"),
                     encoding="utf-8", errors="replace").read()
    ROW = re.compile(
        r"<td>\s*([^<>]{2,120}?)\s*<nobr>\(([^)]{1,40})\)</nobr>\s*</td>\s*"
        r"<td>.*?>(C\d{4})<.*?</td>\s*<td>\s*([^<]{0,120}?)\s*</td>", re.S)
    legend, legend_rows = {}, []
    for m in ROW.finditer(page_html):
        name = html.unescape(m.group(1)).strip()
        code = html.unescape(m.group(2)).strip()
        legend.setdefault(code.lower(), name)
        legend_rows.append((code, name, m.group(3), html.unescape(m.group(4)).strip()))

    QUALIFIER = re.compile(r"_(?:hi|lo|mid|on|cyc|\d+m?|hi_continuous|hi_cycle|hi_start_stop)$",
                           re.I)
    # (cohortYear, group, dose, age_initiation) -> {sex: animals recorded}
    arms = defaultdict(lambda: defaultdict(int))
    arm_file = {}
    for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "jax-itp",
                               "ITP_C*_Lifespan.xlsx"))):
        cohort_year = re.search(r"ITP_C(\d{4})_", os.path.basename(f)).group(1)
        x = pd.ExcelFile(f)
        for sheet in x.sheet_names:
            df = x.parse(sheet)
            if "group" not in df.columns:
                continue
            dose_col = "dose" if "dose" in df.columns else None
            age_col = "age_initiation" if "age_initiation" in df.columns else None
            sex_col = "sex" if "sex" in df.columns else None
            for _, row in df.iterrows():
                g = str(row["group"]).strip()
                if not g or g.lower() in ("nan", "control"):
                    continue
                dose = str(row[dose_col]).strip() if dose_col else ""
                age = str(row[age_col]).strip() if age_col else ""
                sex = str(row[sex_col]).strip() if sex_col else ""
                k = (cohort_year, g, dose, age)
                arms[k][sex] += 1
                arm_file.setdefault(k, os.path.basename(f))

    def resolve_agent(group_code, cohort_year, dose):
        base = QUALIFIER.sub("", group_code)
        while base and base.lower() not in legend and "_" in base:
            base = base.rsplit("_", 1)[0]
        name = legend.get(base.lower()) or legend.get(group_code.lower())
        if name:
            return name
        digits = set(re.findall(r"\d+", dose))
        cands = {agent for code, agent, rc, rd in legend_rows
                 if rc == f"C{cohort_year}" and digits and digits & set(re.findall(r"\d+", rd))}
        if len(cands) > 1:
            narrowed = {agent for code, agent, rc, rd in legend_rows
                        if agent in cands and code.lower().startswith(base.lower())}
            cands = narrowed or cands
        return cands.pop() if len(cands) == 1 else None

    def name_variants(printed):
        out = [printed]
        greek = re.sub(r"(?<![a-z0-9])a(?=-)", "alpha", printed, flags=re.I)
        greek = re.sub(r"(?<![a-z0-9])b(?=-)", "beta", greek, flags=re.I)
        if greek != printed:
            out.append(greek)
        for v in list(out):
            s = re.sub(r"^\([^)]*\)-?\s*", "", v).strip()
            if s and s != v:
                out.append(s)
        return out

    for (cohort_year, group_code, dose, age), sexes in sorted(arms.items()):
        agent = resolve_agent(group_code, cohort_year, dose)
        if not agent:
            itp_unmapped.append(f"C{cohort_year}/{group_code}")
            continue
        itp_agents_seen.add(agent)
        targets = []
        for part in (re.split(r"\s+plus\s+", agent) if " plus " in agent else [agent]):
            for v in name_variants(part):
                hit = pages_for_agent(v)
                if hit:
                    targets.extend(hit)
                    break
        for p in {t["key"]: t for t in targets}.values():
            itp_page[p["key"]].append({
                "cohortYear": f"C{cohort_year}",
                "agentAsWritten": agent,
                "armCode": group_code,
                "doseAsWritten": dose or None,
                "ageAtStartMonthsAsWritten": age or None,
                "sexesPresent": sorted(s for s in sexes if s and s.lower() != "nan"),
                "animalsRecordedPerSex": {s: n for s, n in sorted(sexes.items())
                                          if s and s.lower() != "nan"},
                "file": arm_file[(cohort_year, group_code, dose, age)],
            })
except Exception as exc:  # noqa: BLE001
    log(f"      ITP workbooks unreadable: {exc}")
log(f"      {len(itp_page)} pages carry an ITP cohort arm "
    f"({len(itp_agents_seen)} agents, {len(itp_unmapped)} arm codes unmapped)")


# ================================================================= load: mechanism / pathway

log("[5/11] ChEMBL mechanism + Open Targets mechanism of action")
pathway_hits = defaultdict(list)
for f in sorted(glob.glob(D("data", "corpus-20k", "raw", "chembl", "mechanism-*.json"))):
    for mech in json.load(open(f, encoding="utf-8"))["mechanisms"]:
        targets = []
        for cid in (mech.get("molecule_chembl_id"), mech.get("parent_molecule_chembl_id")):
            if cid:
                targets.extend(by_chembl.get(cid, []))
        if not targets:
            continue
        statement = mech.get("mechanism_of_action") or ""
        extra = " ".join(filter(None, [statement, mech.get("mechanism_comment"),
                                       mech.get("target_pref_name")]))
        named = [n for n, rx in PATHWAY_RX if rx.search(extra)]
        if not named:
            continue
        for p in {t["key"]: t for t in targets}.values():
            for n in named:
                pathway_hits[p["key"]].append({
                    "pathway": n,
                    "statement": statement,
                    "targetPrefName": mech.get("target_pref_name"),
                    "actionType": mech.get("action_type"),
                    "source": src("chembl-mechanism",
                                  f"{mech.get('molecule_chembl_id')}"
                                  f"{'/' + mech['target_chembl_id'] if mech.get('target_chembl_id') else ''}",
                                  f"https://www.ebi.ac.uk/chembl/explore/compound/"
                                  f"{mech.get('molecule_chembl_id')}"),
                    "sourceDate": SRC["chembl"]["date"],
                })

adr_rows = defaultdict(list)
try:
    import duckdb

    con = duckdb.connect()
    symbols = dict(con.execute(
        "select id, approvedSymbol from read_parquet('%s')" %
        D("data", "corpus-20k", "raw", "open-targets", "target", "*.parquet")).fetchall())
    for chembl_ids, mechanism, target_name, tgts in con.execute(
            "select chemblIds, mechanismOfAction, targetName, targets from read_parquet('%s')" %
            D("data", "corpus-20k", "raw", "open-targets", "drug_mechanism_of_action",
              "*.parquet")).fetchall():
        targets = []
        for cid in (chembl_ids or []):
            targets.extend(by_chembl.get(cid, []))
        if not targets:
            continue
        genes = [symbols.get(t) for t in (tgts or []) if symbols.get(t)]
        text = " ".join(filter(None, [mechanism, target_name] + genes))
        named = [n for n, rx in PATHWAY_RX if rx.search(text)]
        if not named:
            continue
        for p in {t["key"]: t for t in targets}.values():
            for n in named:
                pathway_hits[p["key"]].append({
                    "pathway": n,
                    "statement": mechanism,
                    "targetPrefName": target_name,
                    "geneSymbols": genes,
                    "source": src("open-targets-mechanism", ",".join(chembl_ids or []),
                                  "https://platform.opentargets.org/drug/" +
                                  ((chembl_ids or [""])[0])),
                    "sourceDate": SRC["opentargets"]["date"],
                })
    for chembl_id, event, count, llr, critval, meddra in con.execute(
            "select chembl_id, event, count, llr, critval, meddraCode from read_parquet('%s')" %
            D("data", "corpus-20k", "raw", "open-targets",
              "openfda_significant_adverse_drug_reactions", "*.parquet")).fetchall():
        if chembl_id in by_chembl:
            adr_rows[chembl_id].append({"term": event, "count": int(count),
                                        "llr": llr, "criticalValue": critval,
                                        "meddraCode": meddra or None})
except Exception as exc:  # noqa: BLE001
    log(f"      Open Targets parquet unreadable: {exc}")
log(f"      {len(pathway_hits)} pages name an ageing pathway; "
    f"{len(adr_rows)} ChEMBL ids carry adverse-reaction rows")


# ================================================================= load: registers

log("[6/11] registers (Drugs@FDA, Orange Book, openFDA NDC, EMA, Health Canada, entity class)")
reg = defaultdict(lambda: defaultdict(list))  # key -> jurisdiction -> [record]

daf = json.load(open(I("openfda", "drug-drugsfda-0001-of-0001.json"), encoding="utf-8"))["results"]
for app in daf:
    names, statuses = set(), set()
    for prod in app.get("products") or []:
        ings = prod.get("active_ingredients") or []
        if len(ings) == 1 and ings[0].get("name"):
            names.add(ings[0]["name"])
        if prod.get("marketing_status"):
            statuses.add(prod["marketing_status"])
    if not names:
        continue
    for p in pages_for_names(sorted(names)):
        reg[p["key"]]["US"].append({
            "register": "Drugs@FDA",
            "recordId": app.get("application_number"),
            "statusVerbatim": "; ".join(sorted(statuses)) or None,
            "sponsor": app.get("sponsor_name"),
            "url": f"https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event="
                   f"overview.process&ApplNo={(app.get('application_number') or '').lstrip('ANDABLA')}",
            "sourceDate": SRC["openfda"]["date"],
        })
del daf

ob = json.load(open(I("openfda", "drug-orangebook-0001-of-0001.json"), encoding="utf-8"))["results"]
for entry in ob:
    for prod in entry.get("products") or []:
        ings = prod.get("active_ingredients") or []
        if len(ings) != 1 or not ings[0].get("name"):
            continue
        for p in pages_for_names([ings[0]["name"]]):
            reg[p["key"]]["US"].append({
                "register": "Orange Book",
                "recordId": prod.get("application_number"),
                "statusVerbatim": prod.get("marketing_status"),
                "url": "https://www.accessdata.fda.gov/scripts/cder/ob/",
                "sourceDate": SRC["openfda"]["date"],
            })
del ob

ndc = json.load(open(I("openfda", "drug-ndc-0001-of-0001.json"), encoding="utf-8"))["results"]
dea_by_key = {}
otc_by_key = {}
for rec in ndc:
    ings = rec.get("active_ingredients") or []
    if len(ings) != 1 or not ings[0].get("name"):
        continue
    hits = pages_for_names([ings[0]["name"]])
    if not hits:
        continue
    ptype = (rec.get("product_type") or "").upper()
    for p in hits:
        if rec.get("dea_schedule") and p["key"] not in dea_by_key:
            dea_by_key[p["key"]] = {
                "register": "openFDA NDC",
                "recordId": rec.get("product_ndc"),
                "deaSchedule": rec["dea_schedule"],
                "url": "https://open.fda.gov/apis/drug/ndc/",
                "sourceDate": SRC["openfda"]["date"],
            }
        if "OTC" in ptype and p["key"] not in otc_by_key:
            otc_by_key[p["key"]] = {
                "register": "openFDA NDC",
                "recordId": rec.get("product_ndc"),
                "productTypeVerbatim": rec.get("product_type"),
                "url": "https://open.fda.gov/apis/drug/ndc/",
                "sourceDate": SRC["openfda"]["date"],
            }
del ndc

with open(D("data", "corpus-20k", "raw", "ema", "Medicine.csv"), encoding="utf-8-sig",
          newline="") as fh:
    for row in csv.DictReader(fh):
        if (row.get("Category") or "").strip() != "Human":
            continue
        substances = {norm(x) for x in re.split(r"[\n;,/]+", row.get("Active substance") or "")
                      if len(norm(x)) >= 4}
        if len(substances) != 1:
            continue  # a combination authorisation is not a fact about one ingredient
        names = []
        for col in ("International non-proprietary name (INN) / common name", "Active substance",
                    "Name of medicine"):
            v = (row.get(col) or "").strip()
            if v:
                names.extend(x.strip() for x in re.split(r"[\n;,/]+", v) if x.strip())
        status = (row.get("Medicine status") or "").strip()
        if not status:
            continue
        for p in pages_for_names(names):
            reg[p["key"]]["EU"].append({
                "register": "EMA medicines register",
                "recordId": row.get("EMA product number"),
                "statusVerbatim": status,
                "medicineName": row.get("Name of medicine"),
                "url": row.get("Medicine URL") or "https://www.ema.europa.eu/en/medicines",
                "sourceDate": SRC["ema"]["date"],
            })

hc_status = defaultdict(set)
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "status*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) >= 3 and row[0].strip():
                hc_status[row[0].strip()].add(row[2].strip().upper())
hc_ing_count = defaultdict(int)
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "ingred*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) >= 3 and row[0].strip():
                hc_ing_count[row[0].strip()] += 1
for path in glob.glob(D("data", "corpus-20k", "raw", "health-canada", "allfiles*", "ingred*.txt")):
    with open(path, encoding="latin-1", newline="") as fh:
        for row in csv.reader(fh):
            if len(row) < 3 or not row[0].strip():
                continue
            code = row[0].strip()
            if hc_ing_count.get(code) != 1 or code not in hc_status:
                continue
            raw_name = row[2].strip()
            base = re.sub(r"\s*\([^)]*\)\s*$", "", raw_name)
            for p in pages_for_names([base, raw_name]):
                for s in sorted(hc_status[code]):
                    reg[p["key"]]["CA"].append({
                        "register": "Health Canada Drug Product Database",
                        "recordId": code,
                        "statusVerbatim": s,
                        "url": "https://health-products.canada.ca/dpd-bdpp/",
                        "sourceDate": SRC["healthcanada"]["date"],
                    })

entity_class = {}
ec_path = D("data", "corpus-20k", "suppression", "db-entity-classes.tsv")
# The RNAWiki entity class carries no date of its own; R9 falls back to the export date of the
# file it was read from.
ENTITY_CLASS_DATE = None
if os.path.exists(ec_path):
    import datetime as _dt
    ENTITY_CLASS_DATE = _dt.date.fromtimestamp(os.path.getmtime(ec_path)).isoformat()
if os.path.exists(ec_path):
    with open(ec_path, encoding="utf-8") as fh:
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 2 and parts[1]:
                entity_class[parts[0]] = parts[1]
log(f"      registers loaded for {len(reg)} pages; {len(dea_by_key)} carry a DEA schedule")


# ================================================================= load: labels

log("[7/11] openFDA label sections")
want_sections = {"clinical_pharmacology", "pharmacokinetics", "drug_interactions"}
label_pick = {}   # key -> (effectiveTime, setId, names)
si = json.load(open(I("label-sections-index.json"), encoding="utf-8"))
for e in si["entries"]:
    if int(e.get("declared") or 0) != 1:
        continue
    if not (set(e.get("sections") or []) & want_sections):
        continue
    hits = pages_for_names(e.get("names") or [])
    if not hits:
        continue
    eff = str(e.get("effectiveTime") or "")
    for p in hits:
        cur = label_pick.get(p["key"])
        if cur is None or eff > cur[0]:
            label_pick[p["key"]] = (eff, e["setId"], e.get("names") or [])
del si
wanted_setids = {v[1]: k for k, v in label_pick.items()}
log(f"      {len(label_pick)} pages resolve to a single-substance label with a kinetics or "
    f"interaction section; streaming label-index.ndjson")

label_sections = {}
if wanted_setids:
    with open(I("label-index.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            head = line[:60]
            m = re.search(r'"setId":\s*"([^"]+)"', head)
            if not m or m.group(1) not in wanted_setids:
                continue
            d = json.loads(line)
            label_sections[d["setId"]] = {
                "effectiveTime": d.get("effectiveTime"),
                "sections": d.get("sections") or {},
                "substanceNames": d.get("substanceNames") or [],
            }
            if len(label_sections) == len(wanted_setids):
                break
log(f"      {len(label_sections)} label records read")


# ================================================================= load: recorded background

log("[8/11] recorded_background from the working database")
recorded = {}
try:
    psql = "/opt/homebrew/opt/postgresql@18/bin/psql"
    out = subprocess.run(
        [psql, "postgresql://admin@localhost:5432/rnawiki_corpus_completion", "-Atc",
         "select json_build_object('slug', slug, 'pk', recorded_background->'pharmacokinetics', "
         "'ix', recorded_background->'interactionSignals')::text from drugs "
         "where recorded_background ? 'pharmacokinetics' or "
         "recorded_background ? 'interactionSignals'"],
        capture_output=True, text=True, check=True, timeout=300)
    for line in out.stdout.splitlines():
        if not line.strip():
            continue
        d = json.loads(line)
        if d["slug"] in slug_page:
            recorded[d["slug"]] = d
except Exception as exc:  # noqa: BLE001
    log(f"      database unreadable: {exc}")
log(f"      {len(recorded)} LONGEVITY pages carry recorded_background kinetics or interactions")


# ================================================================= Europe PMC queries

def page_queries(p):
    """Nine queries per page. Hallmark and organism terms are OR-ed into groups rather than run
    one term at a time; the sentence-level match still names the exact term that matched."""
    if not p["nameClause"]:
        return []
    n = p["nameClause"]
    q = []
    for i, group in enumerate(HALLMARK_QUERY_GROUPS):
        q.append((f"hallmark{i}", f'{n} AND ({" OR ".join(group)})', 50))
    for i, rungs in enumerate(ORGANISM_QUERY_GROUPS):
        clause = " OR ".join(dict.fromkeys(
            c for name, _, c in RUNGS if name in rungs for c in [c]))
        q.append((f"organism{i}", f"{n} AND ({clause}) AND {AGEING_OUTCOME}", 50))
    q.append(("itp", f"{n} AND {ITP_QUERY}", 25))
    q.append(("clocks", f"{n} AND {CLOCK_QUERY}", 25))
    q.append(("dose", f"{n} AND {DOSE_QUERY}", 25))
    q.append(("interactions", f"{n} AND {INTERACTION_QUERY}", 25))
    q.append(("pathway", f"{n} AND {PATHWAY_QUERY}", 50))
    return q


def run_fetch(target_pages):
    jobs = []
    for p in target_pages:
        for slot, query, size in page_queries(p):
            jobs.append((p["key"], slot, query, size))
    log(f"[9/11] Europe PMC: {len(jobs)} queries over {len(target_pages)} pages "
        f"(<= {epmc.MAX_RPS} req/s)")
    done = [0]

    def work(job):
        _, _, query, size = job
        epmc.search(query, size)
        done[0] += 1
        if done[0] % 500 == 0:
            s = epmc.stats()
            log(f"      {done[0]}/{len(jobs)} queries — fetched {s['fetched']}, "
                f"cached {s['cached']}, errors {s['errors']}")

    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(work, jobs))
    s = epmc.stats()
    log(f"      done — fetched {s['fetched']}, from cache {s['cached']}, errors {s['errors']}")


def epmc_results(p, slot):
    for s, query, size in page_queries(p):
        if s == slot:
            return epmc.search(query, size).get("results") or []
    return []


def pub_source(r):
    pmid = r.get("pmid")
    return src("europepmc", f"PMID:{pmid}" if pmid else r.get("id"),
               f"https://europepmc.org/article/MED/{pmid}" if pmid
               else f"https://europepmc.org/search?query={r.get('id')}")


def pub_date(r):
    return r.get("firstPublicationDate") or (str(r["pubYear"]) if r.get("pubYear") else None)


# ================================================================= field builders

def build_hallmark(p):
    if not p["nameClause"]:
        return field("absent", note="no name long enough to query Europe PMC with")
    found = defaultdict(list)
    for i in range(len(HALLMARK_QUERY_GROUPS)):
        for r in epmc_results(p, f"hallmark{i}"):
            for s in sentences(r.get("abstractText") or ""):
                if not names_in_sentence(p["nameRx"], s):
                    continue
                for name, rx in HALLMARK_RX:
                    m = rx.search(s)
                    if not m or len(found[name]) >= 3:
                        continue
                    full = m.group(0).strip().lower() == name
                    if any(f["pmid"] == r.get("pmid") or
                           dedupe_key(f["sentence"]) == dedupe_key(s) for f in found[name]):
                        continue
                    found[name].append({
                        "hallmark": name, "termAsPrinted": m.group(0),
                        "matchedFullPhrase": full, "sentence": s,
                        "pmid": r.get("pmid"), "year": r.get("pubYear"),
                        "title": r.get("title"),
                        "source": pub_source(r), "sourceDate": pub_date(r),
                    })
    items = [x for name, _ in HALLMARKS for x in found.get(name, [])]
    if not items:
        return field("absent", note="Europe PMC returned no abstract sentence naming this "
                                    "compound and a López-Otín 2023 hallmark term")
    return field("present", items,
                 source=src("europepmc", "search", "https://europepmc.org/"),
                 source_date=max((x["sourceDate"] or "") for x in items) or None, verbatim=True)


def build_ladder(p):
    rungs = {}
    counts = {}
    if p["nameClause"]:
        for i, group in enumerate(ORGANISM_QUERY_GROUPS):
            for r in epmc_results(p, f"organism{i}"):
                for s in sentences(r.get("abstractText") or ""):
                    if not names_in_sentence(p["nameRx"], s) or not AGEING_RX.search(s):
                        continue
                    for name, rx in RUNG_RX:
                        if name not in group or not rx.search(s):
                            continue
                        kind = endpoint_type(s)
                        counts[name] = counts.get(name, 0) + 1
                        cur = rungs.get(name)
                        better = (cur is None
                                  or ENDPOINT_ORDER[kind] < ENDPOINT_ORDER[cur["evidenceKind"]]
                                  or (ENDPOINT_ORDER[kind] == ENDPOINT_ORDER[cur["evidenceKind"]]
                                      and (r.get("pubYear") or "") > (cur.get("year") or "")))
                        if better:
                            rungs[name] = {
                                "rung": name, "evidenceKind": kind, "endpointType": kind,
                                "sentence": s, "pmid": r.get("pmid"), "year": r.get("pubYear"),
                                "title": r.get("title"),
                                "source": pub_source(r), "sourceDate": pub_date(r),
                            }
    # The human rung is a register fact, not a literature sentence.
    a = agg.get(p["key"])
    if a and a.get("studies"):
        outcomes = [o for o in (a.get("primaryOutcomes") or []) if (o.get("measure") or "")]
        conditions = a.get("conditions") or []
        ageing_outcomes = [o for o in outcomes if AGEING_LEXICON.search(o["measure"])]
        ageing_conditions = [c for c in conditions if AGEING_LEXICON.search(c)]
        pool = ageing_outcomes or outcomes
        kind, measure = best_endpoint([o["measure"] for o in pool])
        kind = kind or "mechanism-only"
        chosen = next((o for o in pool if o["measure"] == measure), None)
        nct = chosen.get("nct") if chosen else None
        rungs["human"] = {
            "rung": "human", "evidenceKind": kind, "endpointType": kind,
            "primaryOutcomeVerbatim": chosen["measure"] if chosen else None,
            "agingConditionVerbatim": ageing_conditions[0] if ageing_conditions else None,
            "registeredStudies": a["studies"],
            "nct": nct,
            "source": src("clinicaltrials.gov", nct or f"{a['studies']} matched registrations",
                          f"https://clinicaltrials.gov/study/{nct}" if nct
                          else "https://clinicaltrials.gov/"),
            "sourceDate": SRC["ctgov"]["date"],
        }
        counts["human"] = a["studies"]
    for slug in p["existing"]:
        if slug in pubmed_ct and "human" in rungs:
            rungs["human"]["pubmedClinicalTrialPublications"] = pubmed_ct[slug]["count"]
    if not rungs:
        return field("absent", note="Europe PMC and the ClinicalTrials.gov snapshot returned no "
                                    "sentence or registration naming this compound with an "
                                    "organism and a lifespan, healthspan or survival term")
    order = [n for n, _, _ in RUNGS] + ["human"]
    items = [rungs[n] for n in order if n in rungs]
    return field("present",
                 {"rungs": items,
                  "countsPerRung": {n: counts[n] for n in order if n in counts},
                  "rungsWithEvidence": len(items), "rungsPossible": len(order)},
                 source=src("europepmc+clinicaltrials.gov", "organism ladder",
                            "https://europepmc.org/"),
                 source_date=max((x.get("sourceDate") or "") for x in items) or None,
                 verbatim=True)


def build_itp(p):
    cohorts = itp_page.get(p["key"]) or []
    if not cohorts:
        return field("absent", value={"tested": False},
                     note="the NIA ITP lifespan workbooks (JAX MPD, cohorts C2004-C2021) carry no "
                          "arm whose agent resolves to this record")
    publications = []
    if p["nameClause"]:
        for r in epmc_results(p, "itp"):
            for s in sentences(r.get("abstractText") or ""):
                if not names_in_sentence(p["nameRx"], s) or not ITP_OUTCOME_RX.search(s):
                    continue
                publications.append({
                    "outcomeSentence": s,
                    "sexSpecific": bool(ITP_SEX_RX.search(s)),
                    "endpointType": endpoint_type(s),
                    "pmid": r.get("pmid"), "year": r.get("pubYear"), "title": r.get("title"),
                    "source": pub_source(r), "sourceDate": pub_date(r),
                })
                if len(publications) >= 8:
                    break
    return field("present",
                 {"tested": True,
                  "cohorts": cohorts,
                  "publications": publications,
                  "note": "cohort rows are the workbook's own printed values; no median, percent "
                          "change or survival statistic is derived from the per-animal data"},
                 source=src("jax-mpd-itp",
                            ", ".join(sorted({c["file"] for c in cohorts})),
                            "https://phenome.jax.org/projects/ITP1"),
                 source_date=SRC["itp"]["date"], verbatim=True)


def build_endpoint_type(p, ladder, itp, ceiling):
    seen = Counter()
    where = []
    if ladder["state"] == "present":
        for r in ladder["value"]["rungs"]:
            seen[r["endpointType"]] += 1
            where.append({"field": "organismLadder", "rung": r["rung"],
                          "endpointType": r["endpointType"]})
    if itp["state"] == "present":
        for pub in itp["value"].get("publications") or []:
            seen[pub["endpointType"]] += 1
            where.append({"field": "itp", "pmid": pub["pmid"],
                          "endpointType": pub["endpointType"]})
        if not (itp["value"].get("publications") or []):
            seen["lifespan"] += 1
            where.append({"field": "itp", "cohorts": len(itp["value"]["cohorts"]),
                          "endpointType": "lifespan",
                          "basis": "the ITP lifespan workbooks record survival age per animal"})
    if ceiling["state"] == "present":
        et = ceiling["value"].get("endpointType")
        if et:
            seen[et] += 1
            where.append({"field": "humanCeiling", "endpointType": et})
    if not seen:
        return field("absent", note="no finding in fields 2, 3 or 5 carried an endpoint term")
    return field("present", {"counts": dict(seen), "assignments": where,
                             "rule": "the endpoint type is read from the finding's own words, in "
                                     "the precedence lifespan > healthspan > biomarker > "
                                     "surrogate > mechanism-only"},
                 source=src("derived-from-fields", "2,3,5", None),
                 source_date=TODAY, verbatim=False)


def build_ceiling(p):
    a = agg.get(p["key"])
    if not a or not a.get("studies"):
        return field("absent", note="no ClinicalTrials.gov registration in the 2026-09-01 "
                                    "snapshot matched this record")
    outcomes = [o for o in (a.get("primaryOutcomes") or []) if (o.get("measure") or "")]
    measures = [o["measure"] for o in outcomes]
    conditions = a.get("conditions") or []
    ageing_outcomes = [o["measure"] for o in outcomes if AGEING_LEXICON.search(o["measure"])]
    ageing_conditions = [c for c in conditions if AGEING_LEXICON.search(c)]
    ageing_matches = ageing_outcomes + ageing_conditions
    ld = a.get("longestDuration") or {}
    trials = sorted({o.get("nct") for o in (a.get("primaryOutcomes") or []) if o.get("nct")} |
                    {t.get("nct") for t in (a.get("ongoing") or []) if t.get("nct")} |
                    {t.get("nct") for t in (a.get("stopped") or []) if t.get("nct")})
    _kind, endpoint_source = best_endpoint(ageing_outcomes or measures)
    value = {
        "longestDurationDays": ld.get("days"),
        "longestDurationTrial": ld.get("nct"),
        "longestDurationStart": ld.get("startDate"),
        "longestDurationCompletion": ld.get("completionDate"),
        "largestN": (a.get("enrolment") or {}).get("max"),
        "anyAgingEndpoint": bool(ageing_matches),
        "agingEndpointMatches": ageing_outcomes[:5],
        "agingConditionMatches": ageing_conditions[:5],
        "registeredStudies": a["studies"],
        "byPhase": a.get("byPhase"),
        "trials": trials[:500],
        "trialsListed": len(trials),
        "endpointType": _kind,
        "endpointTypeFrom": endpoint_source or None,
    }
    for slug in p["existing"]:
        if slug in pubmed_ct:
            value["pubmedClinicalTrialPublications"] = pubmed_ct[slug]
            break
    return field("present", value,
                 source=src("clinicaltrials.gov", SRC["ctgov"]["note"],
                            "https://clinicaltrials.gov/"),
                 source_date=SRC["ctgov"]["date"], verbatim=True)


def build_clocks(p):
    if not p["nameClause"]:
        return field("absent", note="no name long enough to query Europe PMC with")
    items = []
    for r in epmc_results(p, "clocks"):
        for s in sentences(r.get("abstractText") or ""):
            if not names_in_sentence(p["nameRx"], s):
                continue
            for name, rx in CLOCK_RX:
                m = rx.search(s)
                if not m:
                    continue
                if any(dedupe_key(x["sentence"]) == dedupe_key(s) for x in items):
                    break
                items.append({"clock": name, "clockAsPrinted": m.group(0), "sentence": s,
                              "endpointType": "biomarker",
                              "pmid": r.get("pmid"), "year": r.get("pubYear"),
                              "title": r.get("title"),
                              "source": pub_source(r), "sourceDate": pub_date(r)})
                break
        if len(items) >= 6:
            break
    if not items:
        return field("absent", note="Europe PMC returned no abstract sentence naming this "
                                    "compound and a named epigenetic clock")
    return field("present", items, source=src("europepmc", "epigenetic clock search",
                                              "https://europepmc.org/"),
                 source_date=max((x["sourceDate"] or "") for x in items) or None, verbatim=True)


def build_dose_response(p):
    if not p["nameClause"]:
        return field("absent", note="no name long enough to query Europe PMC with")
    items = []
    for r in epmc_results(p, "dose"):
        for s in sentences(r.get("abstractText") or ""):
            if not names_in_sentence(p["nameRx"], s):
                continue
            for name, rx in DOSE_RX:
                m = rx.search(s)
                if not m:
                    continue
                if any(dedupe_key(x["sentence"]) == dedupe_key(s) for x in items):
                    break
                items.append({
                    "shape": SHAPE_VOCAB.get(name, "unstated"),
                    "wordAsPrinted": m.group(0),
                    "flagged": name in ("hormetic", "U-shaped"),
                    "sentence": s, "pmid": r.get("pmid"), "year": r.get("pubYear"),
                    "title": r.get("title"),
                    "source": pub_source(r), "sourceDate": pub_date(r)})
                break
        if len(items) >= 5:
            break
    if not items:
        return field("absent", value={"shape": "unstated"},
                     note="Europe PMC returned no abstract sentence naming this compound and a "
                          "dose-response shape word")
    items.sort(key=lambda x: (x["shape"] == "unstated", -(int(x["year"]) if
                                                          str(x.get("year") or "").isdigit()
                                                          else 0)))
    headline = next((x["shape"] for x in items if x["shape"] != "unstated"), "unstated")
    return field("present",
                 {"shape": headline, "flagged": headline in ("hormetic", "U-shaped"),
                  "findings": items},
                 source=src("europepmc", "dose-response search", "https://europepmc.org/"),
                 source_date=max((x["sourceDate"] or "") for x in items) or None, verbatim=True)


def pathway_literature(p):
    """Abstract sentences that name this compound, one pathway term and one mechanism verb."""
    if not p["nameClause"]:
        return []
    per_pathway, out, seen = Counter(), [], set()
    for r in epmc_results(p, "pathway"):
        for s in sentences(r.get("abstractText") or ""):
            if not names_in_sentence(p["nameRx"], s):
                continue
            if not MECHANISM_VERB.search(s):
                continue
            for name, rx in PATHWAY_RX:
                if not rx.search(s):
                    continue
                if per_pathway[name] >= PATHWAY_SENTENCES_PER_PATHWAY:
                    continue
                sig = (name, dedupe_key(s))
                if sig in seen:
                    continue
                seen.add(sig)
                per_pathway[name] += 1
                out.append({
                    "pathway": name,
                    "sentence": s,
                    "statement": s,
                    "pmid": r.get("pmid"),
                    "year": r.get("pubYear"),
                    "title": r.get("title"),
                    "evidence": "europepmc-abstract-sentence",
                    "source": pub_source(r),
                    "sourceDate": pub_date(r),
                })
    return out


def build_pathway(p):
    hits = pathway_hits.get(p["key"]) or []
    seen, items = set(), []
    for h in hits:
        sig = (h["pathway"], h["statement"])
        if sig in seen:
            continue
        seen.add(sig)
        h = dict(h)
        h.setdefault("evidence", "mechanism-record")
        items.append(h)
    lit = pathway_literature(p)
    if not items and not lit:
        note = ("ChEMBL mechanism and Open Targets mechanism-of-action rows were consulted, and "
                "Europe PMC abstracts were searched for a sentence naming this compound with a "
                "pathway term and a mechanism verb; none names a pathway in the vocabulary")
        if not p["chemblId"]:
            note = ("this record carries no ChEMBL id, so no ChEMBL or Open Targets mechanism row "
                    "is keyed to it, and no Europe PMC abstract sentence names it with a pathway "
                    "term and a mechanism verb")
        return field("absent", note=note)
    all_items = items + lit
    if items and lit:
        source = src("chembl+open-targets+europepmc", p["chemblId"],
                     f"https://www.ebi.ac.uk/chembl/explore/compound/{p['chemblId']}"
                     if p["chemblId"] else "https://europepmc.org/")
    elif items:
        source = src("chembl+open-targets", p["chemblId"],
                     f"https://www.ebi.ac.uk/chembl/explore/compound/{p['chemblId']}"
                     if p["chemblId"] else None)
    else:
        source = src("europepmc", "pathway abstract search", "https://europepmc.org/")
    return field("present", all_items, source=source,
                 source_date=max((x["sourceDate"] or "") for x in all_items) or None,
                 verbatim=True)


def _label_for(p):
    pick = label_pick.get(p["key"])
    if not pick:
        return None, None
    return pick[1], label_sections.get(pick[1])


def build_kinetics(p):
    if p["isCombination"]:
        return field("not-applicable",
                     rule="NA-COMBINATION: this record is a combination of active substances; "
                          "label kinetics belongs to each single substance, not to the combination")
    out = {}
    # 1. an existing page's recorded background wins: it is already an extracted label sentence.
    for slug in p["existing"]:
        rb = recorded.get(slug)
        if not rb or not rb.get("pk"):
            continue
        pk = rb["pk"]
        for key, target in (("halfLife", "halfLife"), ("tmax", "tmax"),
                            ("bioavailability", "bioavailability"),
                            ("metabolism", "metabolism")):
            v = pk.get(key)
            if not isinstance(v, dict):
                continue
            s = v.get("source") or {}
            out[target] = {
                "value": v.get("display") or v.get("value"),
                "unit": v.get("unit"),
                "sentence": s.get("excerpt"),
                "source": src("recorded-background/FDA_LABEL", s.get("identifier"),
                              f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="
                              f"{s.get('identifier')}" if s.get("identifier") else None),
                "sourceDate": s.get("retrievedAt"),
            }
        break
    # 2. the label's own clinical_pharmacology / pharmacokinetics sentences fill what is missing.
    if len(out) < len(KINETIC_TESTS):
        set_id, lab = _label_for(p)
        if lab:
            text = " ".join(filter(None, [lab["sections"].get("clinical_pharmacology"),
                                          lab["sections"].get("pharmacokinetics")]))
            eff = lab.get("effectiveTime")
            eff_date = f"{eff[:4]}-{eff[4:6]}-{eff[6:8]}" if eff and len(eff) == 8 else eff
            for s in sentences(text):
                if not names_in_sentence(p["nameRx"], s):
                    continue
                for target, rx in KINETIC_TESTS:
                    if target in out or not rx.search(s):
                        continue
                    out[target] = {
                        "value": None, "unit": None, "sentence": s,
                        "source": src("openfda-label", set_id,
                                      f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?"
                                      f"setid={set_id}"),
                        "sourceDate": eff_date,
                    }
    if not out:
        return field("absent",
                     note="no recorded background kinetics and no single-substance FDA label "
                          "sentence naming this compound with a half-life, Tmax, metabolism or "
                          "bioavailability term")
    return field("present", out,
                 source=src("openfda-label", (label_pick.get(p["key"]) or ("", None, None))[1],
                            None),
                 source_date=max((v["sourceDate"] or "") for v in out.values()) or None,
                 verbatim=True)


def build_interactions(p):
    cyp, transporters = [], []
    for slug in p["existing"]:
        rb = recorded.get(slug)
        for sig in (rb or {}).get("ix") or []:
            s = sig.get("source") or {}
            row = {
                "kind": sig.get("kind"), "role": sig.get("roleAsRecorded"),
                "counterparty": sig.get("counterpartyAsRecorded"),
                "polarity": sig.get("polarity"),
                "sentence": s.get("excerpt"), "labelSection": sig.get("labelSection"),
                "source": src("recorded-background/FDA_LABEL", s.get("identifier"),
                              f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="
                              f"{s.get('identifier')}" if s.get("identifier") else None),
                "sourceDate": s.get("retrievedAt"),
            }
            bucket = cyp if (sig.get("kind") == "CYP" or
                             CYP_RX.search(sig.get("counterpartyAsRecorded") or "")) \
                else transporters
            if row["sentence"] and not any(x["sentence"] == row["sentence"] and
                                           x["counterparty"] == row["counterparty"]
                                           for x in bucket):
                bucket.append(row)
    if not cyp and not transporters:
        set_id, lab = _label_for(p)
        if lab:
            eff = lab.get("effectiveTime")
            eff_date = f"{eff[:4]}-{eff[4:6]}-{eff[6:8]}" if eff and len(eff) == 8 else eff
            for s in sentences(lab["sections"].get("drug_interactions") or ""):
                m = CYP_RX.search(s)
                t = TRANSPORTER_RX.search(s)
                if not m and not t:
                    continue
                row = {"sentence": s, "labelSection": "drug_interactions",
                       "source": src("openfda-label", set_id,
                                     f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?"
                                     f"setid={set_id}"),
                       "sourceDate": eff_date}
                if m and len(cyp) < 8:
                    cyp.append({**row, "counterparty": m.group(0)})
                if t and len(transporters) < 8:
                    transporters.append({**row, "counterparty": t.group(0)})
    topics = {}
    if p["nameClause"]:
        for r in epmc_results(p, "interactions"):
            for s in sentences(r.get("abstractText") or ""):
                if not names_in_sentence(p["nameRx"], s) or not TRIAL_RX.search(s):
                    continue
                for name, rx in INTERACTION_TOPICS:
                    if name in topics or not rx.search(s):
                        continue
                    topics[name] = {"statement": s, "pmid": r.get("pmid"),
                                    "year": r.get("pubYear"), "title": r.get("title"),
                                    "source": pub_source(r), "sourceDate": pub_date(r)}
    if not cyp and not transporters and not topics:
        return field("absent",
                     note="the label drug-interaction section, the recorded interaction signals "
                          "and a Europe PMC fasting/caloric-restriction/exercise trial search all "
                          "returned nothing naming this compound")
    value = {"cyp": cyp, "transporters": transporters,
             "fasting": topics.get("fasting"),
             "caloricRestriction": topics.get("caloricRestriction"),
             "exercise": topics.get("exercise")}
    dates = [x["sourceDate"] for x in cyp + transporters if x.get("sourceDate")] + \
            [v["sourceDate"] for v in topics.values() if v.get("sourceDate")]
    return field("present", value, source=src("openfda-label+europepmc", p["key"], None),
                 source_date=max(dates) if dates else None, verbatim=True)


def build_trial_failures(p):
    a = agg.get(p["key"])
    if not a:
        return field("absent", note="no ClinicalTrials.gov registration matched this record")
    stopped = a.get("stopped") or []
    if not stopped:
        return field("absent",
                     note=f"{a.get('studies', 0)} matched registrations, none with a stopped "
                          f"status carrying a registry reason")
    items = [{"nct": s.get("nct"), "status": s.get("status"),
              "whyStopped": s.get("whyStopped"),
              "source": src("clinicaltrials.gov", s.get("nct"),
                            f"https://clinicaltrials.gov/study/{s.get('nct')}"),
              "sourceDate": SRC["ctgov"]["date"]} for s in stopped]
    return field("present", items,
                 source=src("clinicaltrials.gov", SRC["ctgov"]["note"],
                            "https://clinicaltrials.gov/"),
                 source_date=SRC["ctgov"]["date"], verbatim=True)


def build_ongoing(p):
    a = agg.get(p["key"])
    if not a:
        return field("absent", note="no ClinicalTrials.gov registration matched this record")
    ongoing = a.get("ongoing") or []
    if not ongoing:
        return field("absent",
                     note=f"{a.get('studies', 0)} matched registrations, none with a recruiting "
                          f"or active status")
    items = [{"nct": t.get("nct"), "title": t.get("title"), "n": t.get("n"),
              "primaryEndpoint": t.get("primaryOutcome"), "status": t.get("status"),
              "completionDate": t.get("completionDate"),
              "source": src("clinicaltrials.gov", t.get("nct"),
                            f"https://clinicaltrials.gov/study/{t.get('nct')}"),
              "sourceDate": SRC["ctgov"]["date"]} for t in ongoing]
    return field("present", items,
                 source=src("clinicaltrials.gov", SRC["ctgov"]["note"],
                            "https://clinicaltrials.gov/"),
                 source_date=SRC["ctgov"]["date"], verbatim=True)


def build_faers(p):
    rows = adr_rows.get(p["chemblId"]) if p["chemblId"] else None
    if not rows:
        note = ("the Open Targets 26.06 openfda_significant_adverse_drug_reactions table holds no "
                "row for this ChEMBL id")
        if not p["chemblId"]:
            note = ("this record carries no ChEMBL id, and the Open Targets adverse-reaction "
                    "table is keyed only by ChEMBL id")
        return field("absent", note=note)
    top = sorted(rows, key=lambda r: -r["count"])[:10]
    return field("present",
                 {"reportType": "spontaneous reports",
                  "terms": top,
                  "analysisWindow": "not stated in the Open Targets 26.06 "
                                    "openfda_significant_adverse_drug_reactions file; the release "
                                    "was built 2026-06-24 from openFDA FAERS",
                  "caution": "spontaneous report counts, never incidence"},
                 source=src("open-targets-adr", p["chemblId"],
                            f"https://platform.opentargets.org/drug/{p['chemblId']}"),
                 source_date=SRC["opentargets"]["date"], verbatim=True)


def build_regulatory(p):
    out = {}
    records = reg.get(p["key"]) or {}
    # --- US
    us = records.get("US") or []
    us_records = list(us)
    dea = dea_by_key.get(p["key"])
    otc = otc_by_key.get(p["key"])
    ec = None
    for slug in p["existing"]:
        if slug in entity_class:
            ec = (slug, entity_class[slug])
            break
    approved = any((r.get("statusVerbatim") or "").lower().find("prescription") >= 0 or
                   (r.get("statusVerbatim") or "").lower().find("over-the-counter") >= 0 or
                   (r.get("statusVerbatim") or "").lower().find("discontinued") >= 0 or
                   r.get("register") in ("Drugs@FDA", "Orange Book") for r in us)
    withdrawn_us = p["withdrawn"] and bool(us)
    if withdrawn_us:
        status = "withdrawn"
    elif approved:
        status = "approved"
    elif dea:
        status = "controlled"
    elif otc or (ec and ec[1] == "SUPPLEMENT_INGREDIENT"):
        status = "supplement"
    else:
        status = "unknown"
    if dea:
        us_records.append(dea)
    if otc:
        us_records.append(otc)
    if ec:
        us_records.append({"register": "RNAWiki entity class (not a register; the corpus's own "
                                       "classification of this record)",
                           "recordId": ec[0], "statusVerbatim": ec[1], "url": None,
                           "sourceDate": ENTITY_CLASS_DATE})
    out["US"] = {"status": status, "deaSchedule": dea["deaSchedule"] if dea else None,
                 "records": us_records[:10],
                 "withdrawnReason": p["withdrawnReasonSource"] if withdrawn_us else None}
    # --- EU
    eu = records.get("EU") or []
    eu_status = "unknown"
    if eu:
        statuses = {(r.get("statusVerbatim") or "") for r in eu}
        if "Authorised" in statuses:
            eu_status = "approved"
        elif statuses & {"Withdrawn", "Suspended", "Revoked"}:
            eu_status = "withdrawn"
        elif statuses & {"Refused", "Not authorised"}:
            eu_status = "unscheduled"
        else:
            eu_status = "unknown"
    out["EU"] = {"status": eu_status, "records": eu[:10]}
    # --- CA
    ca = records.get("CA") or []
    ca_status = "unknown"
    if ca:
        statuses = {(r.get("statusVerbatim") or "") for r in ca}
        if any(s.startswith("MARKETED") or s.startswith("APPROVED") for s in statuses):
            ca_status = "approved"
        elif any(s.startswith("CANCELLED") and "PRE MARKET" not in s for s in statuses):
            ca_status = "withdrawn"
    out["CA"] = {"status": ca_status, "records": ca[:10]}
    for j, why in NOT_CLEARED.items():
        out[j] = {"status": "unknown", "records": [], "reason": why}
    known = [j for j in JURISDICTIONS if out[j]["status"] != "unknown"]
    if not known:
        return field("absent", value=out,
                     note="Drugs@FDA, Orange Book, openFDA NDC, the EMA medicines register and "
                          "the Health Canada DPD were consulted and none holds a single-substance "
                          "record for this compound; UK, AU, JP and SG registers are not cleared")
    dates = [r.get("sourceDate") for j in JURISDICTIONS for r in out[j]["records"]
             if r.get("sourceDate")]
    return field("present", out,
                 source=src("registers", ", ".join(known),
                            "https://open.fda.gov/apis/drug/"),
                 source_date=max(dates) if dates else None, verbatim=True)


# ---------------------------------------------------------------- biomarker vocabulary

_UNIT_RX = re.compile(
    r"\b(?:mg|kg|g|mcg|µg|ug|ng|pg|ml|dl|l|mmol|umol|µmol|nmol|iu|u|%|percent|"
    r"mm ?hg|bpm|score|units?|points?|ratio|per cent)\b", re.I)
_PREFIX_RX = re.compile(
    r"^(?:mean |median |absolute |percent(?:age)? |number of |proportion of |change (?:from|in) "
    r"baseline (?:in |of |for )?|change (?:in|of|from) |the |a )+", re.I)
_TRAIL_RX = re.compile(r"\s*(?:\[[^\]]*\]|\([^)]*\))\s*$")


_VERB_LEAD = re.compile(
    r"^(?:to |and |or |of |describe|determine|evaluate|assess|compare|measure|estimate|"
    r"characteri[sz]e|examine|investigate|explore|demonstrate|establish|identify|test)\b", re.I)


def biomarker_term(measure: str) -> str:
    t = (measure or "").strip().lower()
    t = _TRAIL_RX.sub("", t)
    t = re.sub(r"\s*\([^)]*\)", " ", t)
    t = re.sub(r"\s*\[[^\]]*\]", " ", t)
    t = _PREFIX_RX.sub("", t)
    t = re.sub(r"\bparticipants?\b|\bsubjects?\b|\bpatients?\b|\bwith\b", " ", t)
    t = _UNIT_RX.sub(" ", t)
    t = re.sub(r"[^a-z0-9+\-/ ]+", " ", t)
    t = t.replace("-", " ")          # "progression-free" and "progression free" are one term
    t = re.sub(r"\s+", " ", t).strip(" -/")
    t = re.sub(r"^(?:and|or|of|the|a|in|for|by)\s+", "", t)
    # A measure written as a sentence ("describe natural history") is a study aim, not an endpoint
    # name; it is dropped rather than normalised into a vocabulary term.
    if _VERB_LEAD.match(t) or len(t) > 60:
        return ""
    return t


log("[10/11] biomarker vocabulary across the LONGEVITY set")
vocab_variants = defaultdict(Counter)
page_terms = defaultdict(list)
for p in pages:
    a = agg.get(p["key"])
    if not a:
        continue
    for o in (a.get("primaryOutcomes") or []):
        measure = (o.get("measure") or "").strip()
        term = biomarker_term(measure)
        if len(term) < 4 or len(term) > 90:
            continue
        vocab_variants[term][measure] += 1
        page_terms[p["key"]].append((term, measure, o.get("nct"), o.get("timeFrame")))
VOCAB = {t: v for t, v in vocab_variants.items() if sum(v.values()) >= 2}
vocab_path = os.path.join(FIELDS_DIR, "biomarker-vocabulary.json")
with open(vocab_path, "w", encoding="utf-8") as fh:
    json.dump({
        "schema": "rnawiki-corpus-20k-biomarker-vocabulary/v1",
        "builtFrom": "ClinicalTrials.gov primary outcome measures of every LONGEVITY-model page "
                     "in data/corpus-20k/registry/aggregates",
        "snapshot": SRC["ctgov"]["note"],
        "builtAt": TODAY,
        "rule": "lower-cased, bracketed text and units stripped, counting prefixes removed; a term "
                "enters the vocabulary at two or more verbatim occurrences. Every term keeps the "
                "verbatim measures it was built from.",
        "termsTotal": len(vocab_variants),
        "termsInVocabulary": len(VOCAB),
        "terms": {t: {"count": sum(v.values()),
                      "verbatimVariants": [{"measure": m, "count": c}
                                           for m, c in v.most_common(10)]}
                  for t, v in sorted(VOCAB.items(), key=lambda kv: -sum(kv[1].values()))},
    }, fh, ensure_ascii=False, indent=1)
    fh.write("\n")
log(f"      {len(VOCAB)} controlled terms of {len(vocab_variants)} observed "
    f"-> {os.path.relpath(vocab_path, ROOT)}")


def build_biomarkers(p):
    rows = page_terms.get(p["key"]) or []
    kept, seen = [], set()
    for term, measure, nct, tf in rows:
        if term not in VOCAB or term in seen:
            continue
        if p["nameRx"] and p["nameRx"].search(term):
            continue  # "safety of sirolimus" names the compound, not a biomarker
        seen.add(term)
        kept.append({"term": term, "measureVerbatim": measure, "nct": nct, "timeFrame": tf,
                     "source": src("clinicaltrials.gov", nct,
                                   f"https://clinicaltrials.gov/study/{nct}"),
                     "sourceDate": SRC["ctgov"]["date"]})
    if not kept:
        note = "no ClinicalTrials.gov registration matched this record"
        if rows:
            note = ("every primary outcome measure on this record's registrations normalised to a "
                    "term seen only once across the LONGEVITY set, so none entered the controlled "
                    "vocabulary")
        elif agg.get(p["key"]):
            note = "the matched registrations record no primary outcome measure"
        return field("absent", note=note)
    return field("present",
                 {"terms": [k["term"] for k in kept][:40], "measures": kept[:40],
                  "vocabulary": "data/corpus-20k/fields/biomarker-vocabulary.json"},
                 source=src("clinicaltrials.gov", SRC["ctgov"]["note"],
                            "https://clinicaltrials.gov/"),
                 source_date=SRC["ctgov"]["date"], verbatim=True)


# ================================================================= compose + write

def build_page(p):
    hallmark = build_hallmark(p)
    ladder = build_ladder(p)
    itp = build_itp(p)
    ceiling = build_ceiling(p)
    fields = {
        "hallmark": hallmark,
        "organismLadder": ladder,
        "itp": itp,
        "endpointType": build_endpoint_type(p, ladder, itp, ceiling),
        "humanCeiling": ceiling,
        "clocks": build_clocks(p),
        "doseResponse": build_dose_response(p),
        "pathway": build_pathway(p),
        "kinetics": build_kinetics(p),
        "interactions": build_interactions(p),
        "trialFailures": build_trial_failures(p),
        "biomarkers": build_biomarkers(p),
        "regulatory": build_regulatory(p),
        "ongoingTrials": build_ongoing(p),
        "faers": build_faers(p),
    }
    return {"key": p["key"], "model": "LONGEVITY", "displayName": p["displayName"],
            "fields": fields, "suppressed": bool(suppressed.get(p["key"], False))}


def recorded_batches():
    try:
        st = json.load(open(D("data", "corpus-20k", "state.json"), encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return set()
    return {b["file"] for b in st.get("batches", [])
            if b.get("step") == "fields-longevity"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", choices=["fetch", "build", "all"], default="all")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--keys", default="", help="comma-separated keys; testing only")
    args = ap.parse_args()

    target = pages
    if args.keys:
        wanted = {k.strip() for k in args.keys.split(",") if k.strip()}
        target = [p for p in pages if p["key"] in wanted]
    elif args.limit:
        target = pages[:args.limit]
    if args.stage in ("fetch", "all"):
        run_fetch(target)
    if args.stage == "fetch":
        return

    log("[11/11] composing fields and writing batches")
    already = recorded_batches()
    os.makedirs(OUT_DIR, exist_ok=True)
    present = Counter()
    absent = Counter()
    na = Counter()
    issues = []
    batches = 0
    written = 0
    for start in range(0, len(target), BATCH_SIZE):
        chunk = target[start:start + BATCH_SIZE]
        n = start // BATCH_SIZE + 1
        rel = f"data/corpus-20k/fields/longevity/batch-{n:04d}.ndjson"
        path = os.path.join(OUT_DIR, f"batch-{n:04d}.ndjson")
        batches += 1
        if os.path.exists(path) and rel in already and not FORCE:
            with open(path, encoding="utf-8") as fh:
                for line in fh:
                    rec = json.loads(line)
                    written += 1
                    for name, f in rec["fields"].items():
                        (present if f["state"] == "present" else
                         na if f["state"] == "not-applicable" else absent)[name] += 1
            log(f"batch {n:04d} — skipped, already recorded ({len(chunk)} pages)")
            continue
        rows = []
        for p in chunk:
            try:
                rec = build_page(p)
            except Exception as exc:  # noqa: BLE001
                issues.append(f"{p['key']}: {type(exc).__name__}: {exc}")
                continue
            rows.append(rec)
            for name, f in rec["fields"].items():
                (present if f["state"] == "present" else
                 na if f["state"] == "not-applicable" else absent)[name] += 1
        with open(path, "w", encoding="utf-8") as fh:
            for rec in rows:
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
        written += len(rows)
        if not NO_RECORD:
            subprocess.run(
                ["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", "2", "--step",
                 "fields-longevity", "--batch", str(n), "--file", rel, "--records", str(len(rows))],
                cwd=ROOT, check=True, capture_output=True)
        log(f"batch {n:04d} — {len(rows)} pages -> {rel}")

    counts = Counter()
    for r in [json.loads(l) for f in sorted(glob.glob(os.path.join(OUT_DIR, "batch-*.ndjson")))
              for l in open(f, encoding="utf-8")]:
        counts[sum(1 for f in r["fields"].values() if f["state"] == "present")] += 1
    medians = sorted(k for k, v in counts.items() for _ in range(v))
    median = medians[len(medians) // 2] if medians else 0

    summary = {
        "schema": "rnawiki-corpus-20k-fields-longevity/v1",
        "model": "LONGEVITY",
        "spec": "docs/specs/field-models.md",
        "pages": written,
        "batches": batches,
        "presentByField": {k: present.get(k, 0) for k in FIELD_NAMES},
        "absentByField": {k: absent.get(k, 0) for k in FIELD_NAMES},
        "notApplicableByField": {k: na.get(k, 0) for k in FIELD_NAMES},
        "presentFieldCountHistogram": {str(k): counts[k] for k in sorted(counts)},
        "medianPresentFields": median,
        "europePmc": epmc.stats(),
        "issues": issues,
    }
    with open(os.path.join(FIELDS_DIR if (KEEP_SUMMARY or not NO_RECORD) else OUT_DIR,
                           "longevity-summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    if not NO_RECORD:
        subprocess.run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", "2",
                        "--done", "fields-longevity"], cwd=ROOT, check=True, capture_output=True)
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
