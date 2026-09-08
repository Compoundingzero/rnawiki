#!/usr/bin/env python
"""Phase 5 step 5.1-5.2 — build the hub set from stored fields (docs/specs/hubs.md).

    .venv-corpus/bin/python scripts/revamp/hubs_build.py

Reads only recorded artefacts and writes only values those artefacts already carry. Nothing here
selects a verdict, writes a medical claim or invents a member: a hub is a grouping of pages that
already share a stored target, a stored ATC level-4 code or a stored pathway statement, and every
sentence it emits is assembled from the members' own stored numbers and names with the provenance
of each slot recorded beside it.

Outputs, all under ``data/revamp/hubs``:

    members.parquet     hub_id, type, name, definition, definition_source, page, membership_evidence,
                        member_role
    hubs.parquet        hub_id, type, name, slug, member_count, approved_count, relevance,
                        rank_score, first_batch
    tables.parquet      one row per hub x member, every column of docs/specs/hubs.md section 2
                        item 2, as values
    syntheses.parquet   hub_id, template_id (H1-H7), sentence, provenance (JSON)
    counts.json         hubs per type, members, syntheses per template

Membership (docs/specs/hubs.md section 1):

  target   a page whose ``target`` field names the target; the hub needs five members and either
           one approved member or three that reached a clinical phase.
  class    a page whose HSA registration record carries an ATC code; the hub is the level-4 code
           (the first five characters, ``A10BD``) and needs five members.
  pathway  a LONGEVITY page whose ``pathway`` field names the pathway *in a stored sentence that
           also names the page*; five members.

The naming condition on a pathway is the rule ``docs/specs/phase4-generators.md`` section 7 already
binds onto the other Europe PMC quotation this corpus stores: a sentence renders only when it
contains the page's display name or a recorded synonym, salt and hydrate suffixes stripped.
Without it a single review sentence — "cannabinoids modulate mTOR, AMPK and Beclin-1" — enrols its
page in four pathway hubs at once, and the mTOR hub becomes a list of every longevity record rather
than the compounds whose stored evidence is about mTOR.

The IUPHAR ligand-class alternative that section 1 offers for a class hub is not built: the IUPHAR
rows this corpus holds carry a ligand *action* against one target ("Inhibition", "Antagonist"),
which is not a class of compounds, so grouping on it would produce a hub of everything that
inhibits anything. The reason is recorded in counts.json under ``vocabulariesNotUsed``.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable, Iterator

import pyarrow as pa
import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
FIELDS = ROOT / "data/revamp/fields-v2"
DERIVED = ROOT / "data/revamp/derived-v2"
QUESTIONS_V2 = ROOT / "data/revamp/questions-v2"
QUESTIONS_V1 = ROOT / "data/corpus-20k/questions"
IDENTITY = ROOT / "data/revamp/identity/canonical-v5.ndjson"
RELATIONS = ROOT / "data/revamp/identity/relations-v3.parquet"
TIERS = ROOT / "data/corpus-20k/tiers/model-assignment.ndjson"
INTERACTIONS = ROOT / "data/revamp/interactions/interactions.parquet"
PATENT = ROOT / "data/revamp/blocks/patent.parquet"
REGISTRATION = ROOT / "data/revamp/blocks/registration.parquet"
SG_STATUS = ROOT / "data/sources/hsa-singapore/regulatory-sg-status.parquet"
SLUG_MAP = ROOT / "data/revamp/identity/page-slugs.csv"
OUT = ROOT / "data/revamp/hubs"

MODELS = ("longevity", "clinical", "development")
JURISDICTIONS = ("SG", "US", "AU", "UK", "EU", "JP", "CA")
JURISDICTION_LABELS = {
    "SG": "Singapore",
    "US": "United States",
    "AU": "Australia",
    "UK": "United Kingdom",
    "EU": "European Union",
    "JP": "Japan",
    "CA": "Canada",
}
APPROVED_STATUSES = {"approved", "registered"}
WITHDRAWN_STATUSES = {"withdrawn", "refused", "suspended", "revoked"}
# The comparison table prints the register's own codes (POM / P / GSL); the prose uses the
# ordinary words, because a raw enum belongs in a labelled technical disclosure and not in a
# sentence a newcomer reads first.
FORENSIC_SHORT = {
    "Prescription Only": "POM",
    "Pharmacy Only": "P",
    "General Sale List": "GSL",
}
FORENSIC_WORDS = {
    "POM": "prescription-only",
    "P": "pharmacy-only",
    "GSL": "general sale",
    "": "class not recorded",
}
PHASE_ORDER = {
    "EARLY_PHASE1": 0.5,
    "PHASE1": 1.0,
    "PHASE2": 2.0,
    "PHASE3": 3.0,
    "PHASE4": 4.0,
}
ATC_LEVEL5 = re.compile(r"^[A-Z]\d{2}[A-Z]{2}\d{2}$")
ATC_LEVEL4 = re.compile(r"^[A-Z]\d{2}[A-Z]{2}$")
MINIMUM_MEMBERS = 5
# Every group a builder looked at and did not turn into a hub, with the reason it gave. The CI
# link-graph check reads this rather than re-deriving the rule, so the reason a page carries is the
# reason the build recorded when it made the decision.
GROUP_REJECTIONS: list[dict[str, Any]] = []
FIRST_BATCH_TARGETS = 23
FIRST_BATCH_PATHWAYS = 10
SALTS = ROOT / "scripts/revamp/salts.txt"
# The interaction engine's own recorded class names (docs/specs/phase4-generators.md section 4).
# The glossary on the hub page spells each one out; the sentence uses the recorded word so the
# reader can find the same row in the member page's interaction block.
ADDITIVE_CLASS_WORDS = {
    "hypotensive": "hypotensive",
    "QT-prolonging": "QT-prolonging",
    "CNS-depressant": "CNS-depressant",
    "anticoagulant-antiplatelet": "anticoagulant-antiplatelet",
    "hypoglycaemic": "hypoglycaemic",
    "serotonergic": "serotonergic",
    "hyperkalaemic": "hyperkalaemic",
}


# --------------------------------------------------------------------------------------------
# small helpers
# --------------------------------------------------------------------------------------------


def read_ndjson(path: Path) -> Iterator[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def read_ndjson_dir(directory: Path) -> Iterator[dict[str, Any]]:
    for path in sorted(directory.glob("*.ndjson")):
        yield from read_ndjson(path)


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or "unnamed"


def field(page: dict[str, Any], name: str) -> dict[str, Any] | None:
    entry = page.get("fields", {}).get(name)
    if isinstance(entry, dict) and entry.get("state") == "present":
        return entry
    return None


def value_of(page: dict[str, Any], name: str) -> Any:
    entry = field(page, name)
    return None if entry is None else entry.get("value")


def source_date(entry: dict[str, Any] | None) -> str:
    if not entry:
        return ""
    return str(entry.get("sourceDate") or "")


def plural(count: int, singular: str, many: str | None = None) -> str:
    return singular if count == 1 else (many or singular + "s")


# A recorded name can contain a comma of its own — "PROPAFENONE, (R)-", and the combination page
# "Sitagliptin, Metformin" — so a comma cannot separate names. The middle dot can, and it is the
# separator the comparison table already uses for a member's indications.
NAME_SEPARATOR = " \u00b7 "


def join_names(names: Iterable[str], limit: int) -> str:
    listed = list(names)[:limit]
    return NAME_SEPARATOR.join(listed)


def load_salt_suffixes() -> list[str]:
    suffixes: list[str] = []
    for line in SALTS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            suffixes.append(line.lower())
    return suffixes


SALT_SUFFIXES = load_salt_suffixes()


def normalise_name(value: str) -> str:
    """Lowercase, punctuation-free, with a trailing salt or hydrate token removed."""
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"\[[^\]]*\]", " ", text)
    text = re.sub(r"\([^)]*\)", " ", text)
    text = re.sub(r"[^A-Za-z0-9]+", " ", text).strip().lower()
    changed = True
    while changed and text:
        changed = False
        for suffix in SALT_SUFFIXES:
            if text.endswith(" " + suffix):
                text = text[: -(len(suffix) + 1)].strip()
                changed = True
    return text


# --------------------------------------------------------------------------------------------
# member facts
# --------------------------------------------------------------------------------------------


class Member:
    """Everything a hub needs about one page, read once from the stored fields."""

    __slots__ = (
        "key",
        "model",
        "display_name",
        "prose_name",
        "slug",
        "tier",
        "targets",
        "atc_codes",
        "atc_as_of",
        "pathways",
        "jurisdiction_status",
        "approved_jurisdictions",
        "forensic_class",
        "forensic_plain",
        "sg_registered",
        "controlled_sg_mda",
        "highest_phase",
        "highest_phase_label",
        "withdrawn",
        "withdrawn_reason",
        "withdrawn_where",
        "withdrawn_year",
        "indications",
        "indication_count",
        "potency_by_target",
        "trials",
        "completed_trials",
        "results_posted",
        "itp_tested",
        "ageing_endpoint",
        "organisms",
        "generic_available",
        "role",
        "first_question",
        "stop_clusters",
        "stopped_trials",
        "oldest_unposted",
        "target_names",
        "names",
        "raw_synonyms",
        "sg_product_count",
    )

    def __init__(self, key: str) -> None:
        self.key = key
        self.model = ""
        self.display_name = key
        self.prose_name = key
        self.slug = ""
        self.tier = 0
        self.raw_synonyms: list[dict[str, Any]] = []
        self.targets: dict[str, dict[str, Any]] = {}
        self.atc_codes: list[str] = []
        self.atc_as_of = ""
        self.pathways: dict[str, dict[str, Any]] = {}
        self.jurisdiction_status: dict[str, str] = {}
        self.approved_jurisdictions: list[str] = []
        self.forensic_class = ""
        self.forensic_plain = ""
        self.sg_registered = False
        self.controlled_sg_mda = False
        self.highest_phase = 0.0
        self.highest_phase_label = ""
        self.withdrawn = False
        self.withdrawn_reason = ""
        self.withdrawn_where = ""
        self.withdrawn_year = ""
        self.indications: list[str] = []
        self.indication_count = 0
        self.potency_by_target: dict[str, dict[str, Any]] = {}
        self.trials = 0
        self.completed_trials = 0
        self.results_posted = 0
        self.itp_tested = False
        self.ageing_endpoint = False
        self.organisms: list[str] = []
        self.generic_available = "no record"
        self.role = "development"
        self.first_question = ""
        self.stop_clusters: list[tuple[str, int]] = []
        self.stopped_trials = 0
        self.oldest_unposted: tuple[str, str] | None = None
        self.target_names: dict[str, str] = {}
        self.names: set[str] = set()
        self.sg_product_count = 0


def read_regulatory(member: Member, page: dict[str, Any]) -> None:
    entry = field(page, "regulatory")
    if entry is None or not isinstance(entry.get("value"), dict):
        return
    value = entry["value"]
    for code in JURISDICTIONS:
        row = value.get(code)
        if not isinstance(row, dict):
            continue
        status = (row.get("status") or "").strip()
        if status:
            member.jurisdiction_status[code] = status
        if status in APPROVED_STATUSES:
            member.approved_jurisdictions.append(code)
        if status in WITHDRAWN_STATUSES:
            member.withdrawn = True
            member.withdrawn_where = member.withdrawn_where or JURISDICTION_LABELS[code]
    singapore = value.get("SG")
    if isinstance(singapore, dict):
        member.sg_registered = singapore.get("status") == "registered"
        member.forensic_class = FORENSIC_SHORT.get(singapore.get("forensicClassification") or "", "")
        member.forensic_plain = singapore.get("forensicClassificationPlain") or ""
        member.atc_as_of = singapore.get("asOf") or ""
        try:
            member.sg_product_count = int(singapore.get("productCount") or 0)
        except (TypeError, ValueError):
            member.sg_product_count = 0
        for code in singapore.get("atcCodes") or []:
            if isinstance(code, str) and ATC_LEVEL5.match(code.strip().upper()):
                member.atc_codes.append(code.strip().upper())
        controlled = (singapore.get("controlledDetail") or {}) if isinstance(
            singapore.get("controlledDetail"), dict
        ) else {}
        schedules = controlled.get("schedules") if isinstance(controlled, dict) else None
        if isinstance(schedules, list):
            for schedule in schedules:
                statute = ""
                if isinstance(schedule, dict):
                    statute = str(schedule.get("statute") or schedule.get("list") or "")
                if "Misuse of Drugs" in statute:
                    member.controlled_sg_mda = True


def read_controlled(member: Member, page: dict[str, Any]) -> None:
    value = value_of(page, "controlled")
    if not isinstance(value, dict):
        return
    singapore = value.get("SG")
    if isinstance(singapore, dict):
        for schedule in singapore.get("schedules") or []:
            if not isinstance(schedule, dict):
                continue
            statute = str(schedule.get("statute") or singapore.get("register") or "")
            if "Misuse of Drugs" in statute:
                member.controlled_sg_mda = True


def read_phase(member: Member, page: dict[str, Any]) -> None:
    value = value_of(page, "highestPhase")
    if not isinstance(value, dict):
        return
    chembl = value.get("chembl")
    if isinstance(chembl, dict):
        try:
            phase = float(chembl.get("maxPhase"))
        except (TypeError, ValueError):
            phase = 0.0
        if phase > member.highest_phase:
            member.highest_phase = phase
            member.highest_phase_label = f"ChEMBL max phase {chembl.get('maxPhase')}"
    registry = value.get("registry")
    if isinstance(registry, dict):
        label = str(registry.get("highestPhase") or "")
        phase = PHASE_ORDER.get(label, 0.0)
        if phase > member.highest_phase:
            member.highest_phase = phase
            member.highest_phase_label = f"registry {label.replace('_', ' ').lower()}"


def read_withdrawal(member: Member, page: dict[str, Any]) -> None:
    value = value_of(page, "withdrawal")
    if not isinstance(value, dict):
        return
    if value.get("withdrawn") is True:
        member.withdrawn = True
        member.withdrawn_reason = str(value.get("reason") or "")
        jurisdictions = value.get("jurisdictions")
        if isinstance(jurisdictions, list) and jurisdictions:
            member.withdrawn_where = ", ".join(str(item) for item in jurisdictions[:2])
        member.withdrawn_year = str(value.get("date") or "")


def read_indications(member: Member, page: dict[str, Any]) -> None:
    """The approved indications the table's column names.

    DrugCentral's `omop_relationship` rows arrive as `structuredIndications` with a `condition`, a
    `relationship` and an `approved` flag; Inxight's arrive as `curatedUses` with a `condition` and
    an `approvedUse` flag. Only a row whose relationship is an indication and whose approval flag is
    set is counted, so a contraindication or an off-label use never reaches the column.
    """
    value = value_of(page, "indication")
    if not isinstance(value, dict):
        return
    listed: list[str] = []
    for row in value.get("structuredIndications") or []:
        if not isinstance(row, dict):
            continue
        if row.get("relationship") != "indication" or row.get("approved") is not True:
            continue
        condition = row.get("condition")
        if isinstance(condition, str) and condition.strip():
            listed.append(condition.strip())
    for row in value.get("curatedUses") or []:
        if not isinstance(row, dict) or row.get("approvedUse") is not True:
            continue
        condition = row.get("condition")
        if isinstance(condition, str) and condition.strip():
            listed.append(condition.strip())
    seen: set[str] = set()
    unique = []
    for name in listed:
        folded = name.casefold()
        if folded not in seen:
            seen.add(folded)
            unique.append(name)
    member.indications = unique[:12]
    member.indication_count = len(unique)


def read_potency(member: Member, page: dict[str, Any]) -> None:
    value = value_of(page, "potency")
    if not isinstance(value, dict):
        return
    for group in value.get("assayGroups") or []:
        if not isinstance(group, dict):
            continue
        target = group.get("targetChemblId")
        median = group.get("medianPChembl")
        if not target or median is None:
            continue
        held = member.potency_by_target.get(target)
        if held is None or float(median) > float(held["median"]):
            member.potency_by_target[target] = {
                "median": float(median),
                "assayType": "binding" if group.get("assayType") == "B" else "functional"
                if group.get("assayType") == "F"
                else str(group.get("assayType") or ""),
                "standardType": str(group.get("standardType") or ""),
                "n": int(group.get("n") or 0),
            }


def read_registry(member: Member, page: dict[str, Any]) -> None:
    value = value_of(page, "registry")
    if not isinstance(value, dict):
        return
    counts = value.get("trialCount")
    if isinstance(counts, dict):
        for name in ("nctCount", "interventional", "total"):
            candidate = counts.get(name)
            if isinstance(candidate, int) and candidate > member.trials:
                member.trials = candidate
    results = value.get("hasResults")
    if isinstance(results, dict):
        member.completed_trials = int(results.get("completed") or 0)
        member.results_posted = int(results.get("resultsPostedCount") or 0)


def read_longevity(member: Member, page: dict[str, Any]) -> None:
    itp = value_of(page, "itp")
    if isinstance(itp, dict) and itp.get("tested") is True:
        member.itp_tested = True
    ceiling = value_of(page, "humanCeiling")
    if isinstance(ceiling, dict) and ceiling.get("anyAgingEndpoint") is True:
        member.ageing_endpoint = True
    ladder = value_of(page, "organismLadder")
    if isinstance(ladder, dict):
        counts = ladder.get("countsPerRung")
        if isinstance(counts, dict):
            member.organisms = [str(rung) for rung in counts.keys()]


def read_targets(member: Member, page: dict[str, Any]) -> None:
    entry = field(page, "target")
    if entry is None or not isinstance(entry.get("value"), dict):
        return
    for row in entry["value"].get("mergedTargets") or []:
        if not isinstance(row, dict):
            continue
        key = row.get("targetKey")
        if not isinstance(key, str) or ":" not in key:
            continue
        namespace, _, identifier = key.partition(":")
        if not identifier.strip():
            # A `name:` row with nothing after the colon identifies no target. Grouping on it
            # would build one hub out of every page whose source named a target it could not
            # resolve, so the row is dropped and counted rather than given a hub.
            continue
        name = row.get("targetName")
        identifiers = row.get("identifiers") if isinstance(row.get("identifiers"), dict) else {}
        entry_name = ""
        gene = ""
        organism = ""
        sources: list[str] = []
        urls: list[str] = []
        dates: list[str] = []
        chembl_targets: list[str] = []
        for evidence in row.get("evidence") or []:
            if not isinstance(evidence, dict):
                continue
            sources.append(str(evidence.get("source") or ""))
            if evidence.get("entryName") and not entry_name:
                entry_name = str(evidence["entryName"])
            if evidence.get("gene") and not gene:
                gene = str(evidence["gene"])
            if evidence.get("organism") and not organism:
                organism = str(evidence["organism"])
            for chembl_id in evidence.get("chemblTargetIds") or []:
                if isinstance(chembl_id, str) and chembl_id:
                    chembl_targets.append(chembl_id)
            provenance = evidence.get("provenance")
            if isinstance(provenance, dict):
                if provenance.get("source_url"):
                    urls.append(str(provenance["source_url"]))
                if provenance.get("source_date"):
                    dates.append(str(provenance["source_date"]))
        if isinstance(identifiers.get("chembl"), str) and identifiers["chembl"]:
            chembl_targets.append(identifiers["chembl"])
        if namespace == "chembl":
            chembl_targets.append(identifier)
        member.targets[key] = {
            "targetName": name if isinstance(name, str) else "",
            "entryName": entry_name,
            "gene": gene,
            "organism": organism,
            "chembl": identifiers.get("chembl"),
            "chemblTargets": sorted(set(chembl_targets)),
            "uniprot": identifiers.get("uniprot"),
            "sources": sorted({source for source in sources if source}),
            "url": urls[0] if urls else "",
            "sourceDate": max(dates) if dates else "",
        }


def read_pathways(member: Member, page: dict[str, Any]) -> None:
    entry = field(page, "pathway")
    if entry is None or not isinstance(entry.get("value"), list):
        return
    for row in entry["value"]:
        if not isinstance(row, dict):
            continue
        name = row.get("pathway")
        if not isinstance(name, str) or not name:
            continue
        held = member.pathways.setdefault(
            name,
            {
                "pmids": [],
                "sentences": [],
                "sourceDate": str(row.get("sourceDate") or ""),
                "url": "",
                "evidence": str(row.get("evidence") or ""),
            },
        )
        if row.get("pmid"):
            held["pmids"].append(str(row["pmid"]))
        sentence = row.get("sentence") or row.get("statement")
        if isinstance(sentence, str) and sentence:
            held["sentences"].append(sentence)
        source = row.get("source")
        if isinstance(source, dict) and source.get("url") and not held["url"]:
            held["url"] = str(source["url"])


def assign_role(member: Member) -> None:
    if member.withdrawn:
        member.role = "withdrawn"
    elif member.approved_jurisdictions:
        member.role = "approved"
    elif member.highest_phase >= 1.0:
        member.role = "clinical"
    else:
        member.role = "development"


def load_members() -> dict[str, Member]:
    members: dict[str, Member] = {}
    for model in MODELS:
        for page in read_ndjson_dir(FIELDS / model):
            key = page["key"]
            member = Member(key)
            member.model = str(page.get("model") or "")
            member.display_name = str(page.get("displayName") or key)
            read_regulatory(member, page)
            read_controlled(member, page)
            read_phase(member, page)
            read_withdrawal(member, page)
            read_indications(member, page)
            read_potency(member, page)
            read_registry(member, page)
            read_longevity(member, page)
            read_targets(member, page)
            read_pathways(member, page)
            assign_role(member)
            members[key] = member
    return members


PAGE_KEY = re.compile(r"^(K1|K2|K3|COMBO|NAME):")


def attach_published_routes(members: dict[str, Member]) -> dict[str, int]:
    """The slug and the printed name the corpus publishes for each page.

    `data/revamp/identity/page-slugs.csv` is the route map the corpus load writes: it is what
    `/d/<slug>` resolves to and what the member page prints in its `h1`. Deriving a slug from a
    display name instead produced 4,567 links that named no published page (algeldrate is filed at
    `/d/algeldrate`, not at `/d/k1-03j11k103c`), so the map is read rather than re-derived, and the
    hub prints the same name the page it links to prints.
    """
    matched = 0
    with SLUG_MAP.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            member = members.get(row["key"])
            if member is None:
                continue
            matched += 1
            if row.get("slug"):
                member.slug = row["slug"]
            if row.get("display_name"):
                member.display_name = row["display_name"]
    return {"pagesWithPublishedRoute": matched}


def attach_identity(members: dict[str, Member]) -> None:
    for record in read_ndjson(IDENTITY):
        member = members.get(record["key"])
        if member is None:
            continue
        # The printed name and the slug come from the published route map, read after this.
        # Only the synonyms are taken here: the pathway naming rule matches a stored sentence
        # against every recorded name of the page, not only the one it prints.
        synonyms = [row for row in (record.get("synonyms") or []) if isinstance(row, dict)]
        # Kept in the register's own case: `finalise_names` reads them for section 10's rule, and a
        # normalised name cannot say whether the register wrote a name in capitals.
        member.raw_synonyms = synonyms
        if record.get("displayName"):
            normalised = normalise_name(str(record["displayName"]))
            if len(normalised) >= 4:
                member.names.add(normalised)
        for synonym in synonyms:
            if isinstance(synonym.get("name"), str):
                normalised = normalise_name(synonym["name"])
                if len(normalised) >= 4:
                    member.names.add(normalised)


VOCABULARY_TAG = re.compile(r"\s*\[[^\]]*\]\s*$")


def is_all_caps_register_string(name: str) -> bool:
    return name == name.upper() and sum(1 for c in name if c.isalpha()) >= 2


def readable_display_name(display_name: str, synonyms: list[dict[str, Any]]) -> str:
    """Section 10's rule, the same one `scripts/corpus-20k/render/page-text.ts` applies.

    A register writes a substance name in full capitals and it reads as shouting inside a sentence.
    Where a `common`, `inn` or `merged-page` synonym is that same record in readable case — the
    register's bracketed vocabulary tag removed — the hub prints it. Nothing else replaces a
    register string: a synonym naming a shorter substance is a different record, and printing it
    would put a parent's name on a salt's page. The loader applies the same rule to
    `corpus_pages.display_name`, so the hub and the page it links print one name.
    """
    name = (display_name or "").strip()
    if not name or not is_all_caps_register_string(name):
        return display_name
    target = normalise_name(name)
    same: list[str] = []
    absorbed: list[str] = []
    for synonym in synonyms:
        kind = str(synonym.get("kind") or "").lower()
        if kind not in ("common", "inn", "merged-page"):
            continue
        candidate = VOCABULARY_TAG.sub("", str(synonym.get("name") or "")).strip()
        if (
            not candidate
            or is_all_caps_register_string(candidate)
            or not re.search(r"[a-z]", candidate)
        ):
            continue
        token = normalise_name(candidate)
        if token == target:
            same.append(candidate)
        elif kind == "merged-page" and target.startswith(token + " "):
            absorbed.append(candidate)
    if same:
        return sorted(same)[0]
    if absorbed:
        return sorted(absorbed, key=lambda value: (-len(value), value))[0]
    return display_name


def finalise_names(members: dict[str, Member]) -> dict[str, int]:
    """Settle the printed name after the published route map has been read.

    A page no register names keeps its identifier in the comparison table, where the column is the
    record, and is left out of the synthesis's named lists, where a bare page key would read as a
    compound name. It is still a member: counted, ranked and linked.

    Section 10's readable-name rule is applied here, on the route map's name, so the hub prints
    exactly what `corpus_pages.display_name` holds after the load applies the same rule.
    """
    unnamed = 0
    readable = 0
    for member in members.values():
        printed = readable_display_name(member.display_name, member.raw_synonyms)
        if printed != member.display_name:
            member.display_name = printed
            readable += 1
        if PAGE_KEY.match(member.display_name):
            member.prose_name = ""
            unnamed += 1
        else:
            member.prose_name = member.display_name
        if not member.slug:
            member.slug = slugify(member.display_name)
        normalised = normalise_name(member.display_name)
        if len(normalised) >= 4:
            member.names.add(normalised)
    return {
        "pagesWithNoPrintableName": unnamed,
        "pagesPrintingAReadableSynonym": readable,
    }


def filter_pathways_to_named_sentences(members: dict[str, Member]) -> dict[str, int]:
    """Keep a pathway statement only where the stored sentence names the page.

    `docs/specs/phase4-generators.md` section 7: a Europe PMC quotation renders only when the
    sentence contains the page's display name or a recorded synonym, case-insensitive, with salt
    suffixes stripped. A hub is built from those statements, so it inherits the rule.
    """
    dropped = 0
    kept = 0
    for member in members.values():
        if not member.pathways:
            continue
        survivors: dict[str, dict[str, Any]] = {}
        for name, fact in member.pathways.items():
            matched = [
                sentence
                for sentence in fact["sentences"]
                if any(alias in normalise_name(sentence) for alias in member.names)
            ]
            if matched:
                fact["sentences"] = matched
                survivors[name] = fact
                kept += 1
            else:
                dropped += 1
        member.pathways = survivors
    return {"pathwayStatementsKept": kept, "pathwayStatementsDropped": dropped}


def attach_tiers(members: dict[str, Member]) -> None:
    table = pq.read_table(SG_STATUS, columns=["key", "tier"]).to_pydict()
    for key, tier in zip(table["key"], table["tier"]):
        member = members.get(key)
        if member is not None:
            try:
                member.tier = int(tier)
            except (TypeError, ValueError):
                member.tier = 0


def attach_generic(members: dict[str, Member]) -> None:
    table = pq.read_table(
        PATENT, columns=["page", "eligible", "generic_available"]
    ).to_pydict()
    for page, eligible, generic in zip(
        table["page"], table["eligible"], table["generic_available"]
    ):
        member = members.get(page)
        if member is None:
            continue
        if str(eligible) != "True":
            member.generic_available = "no record"
        elif str(generic) == "True":
            member.generic_available = "yes"
        elif str(generic) == "False":
            member.generic_available = "no"
        else:
            member.generic_available = "no record"


def attach_questions(members: dict[str, Member]) -> None:
    directory = QUESTIONS_V2 if QUESTIONS_V2.is_dir() else QUESTIONS_V1
    for record in read_ndjson_dir(directory):
        member = members.get(record.get("key", ""))
        if member is None:
            continue
        questions = record.get("questions")
        if isinstance(questions, list) and questions:
            first = questions[0]
            if isinstance(first, dict) and first.get("text"):
                member.first_question = str(first["text"])


def attach_seed_three(members: dict[str, Member]) -> None:
    path = DERIVED / "seed-03-failure-autopsy.ndjson"
    if not path.exists():
        return
    for record in read_ndjson(path):
        member = members.get(record.get("key", ""))
        if member is None:
            continue
        values = record.get("values") or {}
        clusters = values.get("clusters")
        if isinstance(clusters, list):
            member.stop_clusters = [
                (str(row.get("cluster")), int(row.get("count") or 0))
                for row in clusters
                if isinstance(row, dict) and row.get("cluster")
            ]
            member.stopped_trials = sum(count for _, count in member.stop_clusters)


def attach_seed_twelve(members: dict[str, Member]) -> None:
    path = DERIVED / "seed-12-registry-to-publication-gap.ndjson"
    if not path.exists():
        return
    for record in read_ndjson(path):
        member = members.get(record.get("key", ""))
        if member is None:
            continue
        values = record.get("values") or {}
        oldest: tuple[str, str] | None = None
        for trial in values.get("unreportedTrials") or []:
            if not isinstance(trial, dict):
                continue
            nct = str(trial.get("nct") or "")
            completion = str(trial.get("completionDate") or "")
            if not nct or not completion:
                continue
            if oldest is None or completion < oldest[1]:
                oldest = (nct, completion)
        member.oldest_unposted = oldest


# --------------------------------------------------------------------------------------------
# hubs
# --------------------------------------------------------------------------------------------


class Hub:
    __slots__ = (
        "hub_id",
        "type",
        "name",
        "slug",
        "definition",
        "definition_source",
        "members",
        "evidence",
        "relevance",
        "rank_score",
        "first_batch",
        "chembl_targets",
    )

    def __init__(self, hub_type: str, name: str, slug: str) -> None:
        self.type = hub_type
        self.name = name
        self.slug = slug
        self.hub_id = f"{hub_type}/{slug}"
        self.definition = ""
        self.definition_source = ""
        self.members: list[Member] = []
        self.evidence: dict[str, str] = {}
        self.relevance = 0.5
        self.rank_score = 0.0
        self.first_batch = False
        self.chembl_targets: list[str] = []

    def potency_for(self, member: "Member") -> dict[str, Any] | None:
        best: dict[str, Any] | None = None
        for chembl_id in self.chembl_targets:
            held = member.potency_by_target.get(chembl_id)
            if held is not None and (best is None or held["median"] > best["median"]):
                best = held
        return best

    def counted(self, role: str) -> int:
        return sum(1 for member in self.members if member.role == role)

    @property
    def approved_count(self) -> int:
        return self.counted("approved")


def primary_protein_name(value: str) -> str:
    """The UniProt protein name without its trailing pile of bracketed aliases.

    UniProt prints "Alpha-2A adrenergic receptor (Alpha-2 adrenergic receptor subtype C10)
    (Alpha-2A adrenoreceptor) ...". The first name is the record's recommended name; the rest are
    the same protein said again, and repeating them on the page would be the same words on every
    receptor hub.
    """
    out: list[str] = []
    depth = 0
    for character in value:
        if character == "(":
            depth += 1
        elif character == ")":
            depth = max(0, depth - 1)
        elif depth == 0:
            out.append(character)
    trimmed = re.sub(r"\s+", " ", "".join(out)).strip(" ,;")
    return trimmed or value.strip()


def unique_slug(base: str, taken: set[str], suffix: str) -> str:
    slug = base
    if slug in taken:
        slug = f"{base}-{slugify(suffix)}"
    counter = 2
    while slug in taken:
        slug = f"{base}-{counter}"
        counter += 1
    taken.add(slug)
    return slug


TARGET_MERGE_JACCARD = 0.5
HUMAN_ORGANISM = "Homo sapiens"


def target_group_key(fact: dict[str, Any], raw_key: str) -> str:
    """The key that puts one protein's records in one group.

    A compound's stored target rows name the same protein under three different identifiers: a
    UniProt accession per species (P35348 is the human alpha-1A adrenergic receptor, P43140 the rat
    one), a gene symbol from ChEMBL or DrugCentral (ADRA1A), and a UniProt entry name whose prefix
    is shared by every species of the same protein (ADA1A_HUMAN, ADA1A_RAT). Grouping on the raw
    accession splits one receptor into a human hub and a rodent hub that list overlapping
    compounds; grouping on the entry-name prefix keeps them together and lets the definition print
    every accession with its organism. Gene symbol is the fallback where UniProt did not map, and
    the raw key the fallback where neither exists.
    """
    entry = str(fact.get("entryName") or "")
    if "_" in entry:
        return "entry:" + entry.split("_", 1)[0].upper()
    gene = str(fact.get("gene") or "")
    if gene:
        return "gene:" + gene.upper()
    return raw_key


def merge_by_member_overlap(
    groups: dict[str, set[str]], line: float
) -> list[tuple[frozenset[str], list[str]]]:
    """Complete-linkage components: every pair inside a component meets ``line`` Jaccard.

    Single linkage was tried first and chained. A ~0.5 edge from the carbonic anhydrases to
    ABCB1 and another from ABCB1 to polyphenol oxidase 2 put all three in one component, and the
    resulting page named eleven unrelated proteins as one target. Complete linkage cannot chain:
    a group joins a component only when it meets the line against every group already in it.
    Candidates are still found through an inverted index on the member keys, so no pair is scored
    unless it shares at least one member.
    """
    keys = sorted(groups, key=lambda key: (-len(groups[key]), key))
    by_member: dict[str, list[str]] = defaultdict(list)
    for key in keys:
        for member_key in groups[key]:
            by_member[member_key].append(key)

    neighbours: dict[str, set[str]] = defaultdict(set)
    seen: set[tuple[str, str]] = set()
    for sharers in by_member.values():
        if len(sharers) < 2:
            continue
        for i in range(len(sharers)):
            for j in range(i + 1, len(sharers)):
                left, right = sorted((sharers[i], sharers[j]))
                if (left, right) in seen:
                    continue
                seen.add((left, right))
                a, b = groups[left], groups[right]
                if len(a & b) / len(a | b) >= line:
                    neighbours[left].add(right)
                    neighbours[right].add(left)

    assigned: set[str] = set()
    merged: list[tuple[frozenset[str], list[str]]] = []
    for key in keys:
        if key in assigned:
            continue
        component = [key]
        assigned.add(key)
        for candidate in sorted(neighbours[key], key=lambda item: (-len(groups[item]), item)):
            if candidate in assigned:
                continue
            if all(other in neighbours[candidate] for other in component):
                component.append(candidate)
                assigned.add(candidate)
        pooled: set[str] = set()
        for member_key in component:
            pooled |= groups[member_key]
        merged.append((frozenset(pooled), component))
    merged.sort(key=lambda item: item[1][0])
    return merged


def build_target_hubs(members: dict[str, Member]) -> list[Hub]:
    """Group pages by the target their stored target field names (docs/specs/hubs.md section 1)."""
    facts: dict[str, dict[str, Any]] = {}
    for member in members.values():
        for key, fact in member.targets.items():
            held = facts.setdefault(key, dict(fact))
            for name in ("targetName", "entryName", "gene", "organism", "chembl", "url"):
                if not held.get(name) and fact.get(name):
                    held[name] = fact[name]
            held["sources"] = sorted(set(held.get("sources", [])) | set(fact.get("sources", [])))
            held["chemblTargets"] = sorted(
                set(held.get("chemblTargets", [])) | set(fact.get("chemblTargets", []))
            )
            if fact.get("sourceDate", "") > held.get("sourceDate", ""):
                held["sourceDate"] = fact["sourceDate"]

    group_of = {key: target_group_key(fact, key) for key, fact in facts.items()}
    raw_keys_of: dict[str, list[str]] = defaultdict(list)
    for key, group in group_of.items():
        raw_keys_of[group].append(key)

    grouped: dict[str, set[str]] = defaultdict(set)
    for member in members.values():
        for key in member.targets:
            grouped[group_of[key]].add(member.key)

    qualified: dict[str, set[str]] = {}
    for group, unique_members in sorted(grouped.items()):
        if len(unique_members) < MINIMUM_MEMBERS:
            GROUP_REJECTIONS.append(
                {
                    "kind": "target",
                    "group": group,
                    "members": sorted(unique_members),
                    "reason": f"the target group holds {len(unique_members)} pages, "
                    f"under the {MINIMUM_MEMBERS} docs/specs/hubs.md section 1 requires",
                }
            )
            continue
        roles = Counter(members[member_key].role for member_key in unique_members)
        clinical_reach = sum(
            1 for member_key in unique_members if members[member_key].highest_phase >= 1.0
        )
        if roles["approved"] < 1 and clinical_reach < 3:
            GROUP_REJECTIONS.append(
                {
                    "kind": "target",
                    "group": group,
                    "members": sorted(unique_members),
                    "reason": f"the target group holds {len(unique_members)} pages but "
                    f"{roles['approved']} approved and {clinical_reach} that reached a clinical "
                    "phase, under the one approved or three clinical docs/specs/hubs.md section 1 "
                    "requires",
                }
            )
            continue
        qualified[group] = unique_members

    components = merge_by_member_overlap(qualified, TARGET_MERGE_JACCARD)

    hubs: list[Hub] = []
    taken: set[str] = set()
    for member_keys, groups in components:
        # The largest group leads: it names the hub and opens the definition, so the printed name
        # and the first protein named are the same protein.
        ordered = sorted(groups, key=lambda item: (-len(qualified[item]), item))
        described = [describe_group(raw_keys_of[group], facts) for group in ordered]
        # Three registers naming the same protein ("Angiotensin-converting enzyme" from UniProt,
        # ChEMBL and an Inxight source string) is one protein, and printing it three times says
        # nothing. The extra registers stay in definition_source and in the membership evidence.
        seen_proteins: set[str] = set()
        deduped: list[dict[str, Any]] = []
        for entry in described:
            folded = entry["protein"].casefold()
            if folded in seen_proteins:
                continue
            seen_proteins.add(folded)
            deduped.append(entry)
        described = deduped
        lead = described[0]
        hub = Hub("target", lead["symbol"], unique_slug(slugify(lead["symbol"]), taken, lead["accession"]))
        hub.members = sorted(
            (members[key] for key in member_keys), key=lambda item: item.display_name.casefold()
        )
        if len(described) == 1:
            hub.definition = f"{lead['protein']}, {lead['register']}"
        else:
            listed = "; ".join(
                f"{entry['protein']} ({entry['register']})" for entry in described[1:6]
            )
            more = f"; and {len(described) - 6} more in the record below" if len(described) > 6 else ""
            hub.definition = (
                f"{lead['protein']}, {lead['register']}, with "
                + (
                    "one further protein"
                    if len(described) == 2
                    else f"{len(described) - 1} further proteins"
                )
                + f" the same compounds reach: {listed}{more}"
            )
        dates = [entry["date"] for entry in described if entry["date"]]
        hub.definition_source = "; ".join(entry["register"] for entry in described) + (
            f", read {max(dates)}" if dates else ""
        )
        hub.chembl_targets = sorted(
            {chembl for entry in described for chembl in entry["chemblTargets"]}
        )
        component_raw = {key for group in groups for key in raw_keys_of[group]}
        hub.evidence = {}
        for member in hub.members:
            named = sorted(key for key in member.targets if key in component_raw)
            evidence_sources = sorted(
                {source for key in named for source in member.targets[key]["sources"]}
            )
            hub.evidence[member.key] = (
                "target field names "
                + ", ".join(named)
                + " from "
                + ", ".join(evidence_sources or ["the stored target row"])
            )
        hubs.append(hub)
    return hubs


def describe_group(raw_keys: list[str], facts: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """One protein, described from its records, the human record preferred.

    A group holds one protein's records across the species the sources named. The printed protein
    name and accession come from the human record where the corpus holds one, because the reader
    is looking at medicines given to people; the other accessions stay in ``chemblTargets`` and in
    each member's own membership evidence.
    """
    def rank(key: str) -> tuple[int, str]:
        fact = facts[key]
        human = 0 if str(fact.get("organism") or "").startswith(HUMAN_ORGANISM) else 1
        return (human, key)

    ordered = sorted(raw_keys, key=rank)
    lead = facts[ordered[0]]
    symbol = str(lead.get("gene") or "")
    if not symbol:
        entry = str(lead.get("entryName") or "")
        symbol = entry.split("_", 1)[0] if "_" in entry else ""
    if not symbol:
        symbol = primary_protein_name(str(lead.get("targetName") or "")) or ordered[0]
    accession = str(lead.get("uniprot") or "")
    if accession:
        register = f"UniProt {accession}"
    elif lead.get("chembl"):
        accession = str(lead["chembl"])
        register = f"ChEMBL {accession}"
    else:
        accession = ordered[0].split(":", 1)[-1]
        register = f"source record {accession}"
    dates = [str(facts[key].get("sourceDate") or "") for key in ordered]
    return {
        "symbol": symbol,
        "protein": primary_protein_name(str(lead.get("targetName") or symbol)),
        "accession": accession,
        "register": register,
        "date": max(dates) if dates else "",
        "chemblTargets": sorted(
            {chembl for key in ordered for chembl in facts[key].get("chemblTargets") or []}
        ),
    }


def build_class_hubs(members: dict[str, Member]) -> list[Hub]:
    grouped: dict[str, dict[str, Member]] = defaultdict(dict)
    full_codes: dict[str, set[str]] = defaultdict(set)
    as_of: dict[str, str] = {}
    for member in members.values():
        for code in member.atc_codes:
            level4 = code[:5]
            if not ATC_LEVEL4.match(level4):
                continue
            grouped[level4][member.key] = member
            full_codes[level4].add(code)
            if member.atc_as_of > as_of.get(level4, ""):
                as_of[level4] = member.atc_as_of

    hubs: list[Hub] = []
    taken: set[str] = set()
    for code, group in sorted(grouped.items()):
        if len(group) < MINIMUM_MEMBERS:
            GROUP_REJECTIONS.append(
                {
                    "kind": "class",
                    "group": code,
                    "members": sorted(group),
                    "reason": f"the ATC level-4 group {code} holds {len(group)} pages, under the "
                    f"{MINIMUM_MEMBERS} docs/specs/hubs.md section 1 requires",
                }
            )
            continue
        hub = Hub("class", code, unique_slug(code.lower(), taken, code))
        hub.members = sorted(group.values(), key=lambda item: item.display_name.casefold())
        codes = ", ".join(sorted(full_codes[code]))
        hub.definition = (
            f"Anatomical Therapeutic Chemical group {code}; Singapore product licences record "
            f"{codes}"
        )
        hub.definition_source = (
            "HSA Listing of Registered Therapeutic Products"
            + (f", as of {as_of[code]}" if as_of.get(code) else "")
        )
        hub.evidence = {
            member.key: "HSA product record carries ATC "
            + ", ".join(sorted(item for item in member.atc_codes if item.startswith(code)))
            for member in hub.members
        }
        hubs.append(hub)
    return hubs


def build_pathway_hubs(members: dict[str, Member]) -> list[Hub]:
    grouped: dict[str, dict[str, Member]] = defaultdict(dict)
    dates: dict[str, str] = {}
    for member in members.values():
        if member.model != "LONGEVITY":
            continue
        for name, fact in member.pathways.items():
            grouped[name][member.key] = member
            if fact.get("sourceDate", "") > dates.get(name, ""):
                dates[name] = fact["sourceDate"]

    hubs: list[Hub] = []
    taken: set[str] = set()
    for name, group in sorted(grouped.items()):
        if len(group) < MINIMUM_MEMBERS:
            GROUP_REJECTIONS.append(
                {
                    "kind": "pathway",
                    "group": name,
                    "members": sorted(group),
                    "reason": f"the pathway group {name} holds {len(group)} longevity pages, "
                    f"under the {MINIMUM_MEMBERS} docs/specs/hubs.md section 1 requires",
                }
            )
            continue
        hub = Hub("pathway", name, unique_slug(slugify(name), taken, name))
        hub.members = sorted(group.values(), key=lambda item: item.display_name.casefold())
        hub.definition = (
            f"{name}; {len(hub.members)} longevity records whose stored abstract sentence names "
            f"both the compound and {name}"
        )
        hub.definition_source = "Europe PMC abstract sentences" + (
            f", read {dates[name]}" if dates.get(name) else ""
        )
        hub.evidence = {
            member.key: "a stored abstract sentence names both this compound and "
            + name
            + (
                " (PubMed " + ", ".join(member.pathways[name]["pmids"][:3]) + ")"
                if member.pathways[name]["pmids"]
                else ""
            )
            for member in hub.members
        }
        hubs.append(hub)
    return hubs


def rank_hubs(hubs: list[Hub]) -> None:
    for hub in hubs:
        if hub.type == "target":
            relevant = any(member.itp_tested or member.ageing_endpoint for member in hub.members)
            hub.relevance = 1.0 if relevant else 0.5
        else:
            hub.relevance = 1.0
        hub.rank_score = round(hub.approved_count * hub.relevance, 4)

    for hub_type, limit in (("target", FIRST_BATCH_TARGETS), ("pathway", FIRST_BATCH_PATHWAYS)):
        of_type = [hub for hub in hubs if hub.type == hub_type]
        of_type.sort(
            key=lambda item: (-item.rank_score, -len(item.members), item.name.casefold())
        )
        for hub in of_type[:limit]:
            hub.first_batch = True


# --------------------------------------------------------------------------------------------
# comparison table
# --------------------------------------------------------------------------------------------


def status_word(member: Member, code: str) -> str:
    status = member.jurisdiction_status.get(code, "")
    if not status:
        return "not found"
    if status in {"unknown", "not found"}:
        return "not found"
    return status


def sort_rank(member: Member) -> tuple[int, float, str]:
    if member.role == "approved":
        return (0, -float(len(member.approved_jurisdictions)), member.display_name.casefold())
    if member.role == "clinical":
        return (1, -member.highest_phase, member.display_name.casefold())
    if member.role == "development":
        return (2, 0.0, member.display_name.casefold())
    return (3, 0.0, member.display_name.casefold())


def table_rows(hub: Hub) -> list[dict[str, Any]]:
    rows = []
    for index, member in enumerate(sorted(hub.members, key=sort_rank)):
        potency = ""
        if hub.type == "target":
            held = hub.potency_for(member)
            if held:
                potency = f"{held['median']:.2f} ({held['assayType'] or held['standardType']})"
        rows.append(
            {
                "hub_id": hub.hub_id,
                "hub_type": hub.type,
                "ordinal": index,
                "page": member.key,
                "name": member.display_name,
                "slug": member.slug,
                "approval_sg": status_word(member, "SG"),
                "approval_us": status_word(member, "US"),
                "approval_au": status_word(member, "AU"),
                "approval_uk": status_word(member, "UK"),
                "approval_eu": status_word(member, "EU"),
                "approval_jp": status_word(member, "JP"),
                "approval_ca": status_word(member, "CA"),
                "sg_forensic_class": member.forensic_class or "not listed",
                "generic_available": member.generic_available,
                "potency": potency,
                "indications": " · ".join(member.indications[:3]),
                "indication_count": member.indication_count,
                "withdrawn_reason": member.withdrawn_reason,
                "withdrawn_where": member.withdrawn_where,
                "trials_count": member.trials,
                "results_posted_share": (
                    f"{member.results_posted}/{member.completed_trials}"
                    if member.completed_trials
                    else ""
                ),
                "tier": member.tier,
                "member_role": member.role,
                "first_question": member.first_question,
            }
        )
    return rows


# --------------------------------------------------------------------------------------------
# syntheses, templates H1 - H7
# --------------------------------------------------------------------------------------------


def load_interaction_pairs() -> tuple[dict[str, set[tuple[str, str]]], set[tuple[str, str]]]:
    """Additive-class predicted pairs by class, and every label-documented pair."""
    table = pq.read_table(
        INTERACTIONS, columns=["page_a", "page_b", "tier", "rule_id"]
    ).to_pydict()
    additive: dict[str, set[tuple[str, str]]] = defaultdict(set)
    documented: set[tuple[str, str]] = set()
    for page_a, page_b, tier, rule in zip(
        table["page_a"], table["page_b"], table["tier"], table["rule_id"]
    ):
        if not page_a or not page_b:
            continue
        pair = (page_a, page_b) if page_a <= page_b else (page_b, page_a)
        if tier == "A":
            documented.add(pair)
        elif tier == "C" and isinstance(rule, str) and rule.startswith("C3-additive-"):
            additive[rule[len("C3-additive-") :]].add(pair)
    return additive, documented


"""The seven synthesis templates of docs/specs/hubs.md section 2 item 3.

Two rules shape the wording, and both come from the measurement rather than from taste.

1. **Values carry the sentence.** Every run of template words is short and is broken by a stored
   value, because a run of five template words is a shared 5-gram on every hub that fires the same
   template, and the uniqueness ruler counts exactly those.
2. **The terms are explained in the page's glossary, not in the sentence.** pChEMBL, the Singapore
   forensic classification and "results posted" are defined once per hub page in the glossary list
   `components/hubs/HubSynthesis.tsx` renders. Repeating the definitions inside the prose would put
   the same forty words on every hub.

A template whose inputs are absent returns None and the hub simply does not carry that sentence.
"""


def sentence_h1(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """What is approved (template H1)."""
    approved = [member for member in hub.members if member.role == "approved"]
    if not approved:
        return None
    jurisdictions: Counter[str] = Counter()
    for member in approved:
        jurisdictions.update(member.approved_jurisdictions)
    spread = ", ".join(
        f"{JURISDICTION_LABELS[code]} {count}" for code, count in jurisdictions.most_common(3)
    )
    singapore = sorted(
        (member for member in approved if member.sg_registered),
        key=lambda item: (-item.sg_product_count, item.display_name.casefold()),
    )
    parts = [f"Approved: {len(approved)} of {len(hub.members)} — {spread}"]
    if singapore:
        by_class: dict[str, list[str]] = defaultdict(list)
        for member in singapore[:5]:
            if member.prose_name:
                by_class[FORENSIC_WORDS[member.forensic_class]].append(member.prose_name)
        listed = "; ".join(
            f"{NAME_SEPARATOR.join(names)} ({words})" for words, names in sorted(by_class.items())
        )
        parts.append(f"Singapore: {listed}")
    indications: Counter[str] = Counter()
    for member in approved:
        indications.update(member.indications)
    if indications:
        named = ", ".join(f"{name} {count}" for name, count in indications.most_common(6))
        parts.append(f"Labelled for: {named}")
    return ". ".join(parts) + ".", {
        "template": "H1",
        "columns": ["approval by jurisdiction", "Singapore forensic class", "approved indications"],
        "fields": [
            "fields.regulatory.value.<jurisdiction>.status",
            "fields.regulatory.value.SG.forensicClassification",
            "fields.regulatory.value.SG.productCount",
            "fields.indication.value.structuredIndications",
        ],
        "members": [member.key for member in singapore[:5]],
    }


def sentence_h2(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """What died and why (template H2)."""
    stopped = [member for member in hub.members if member.stop_clusters]
    withdrawn = [member for member in hub.members if member.role == "withdrawn"]
    if not stopped and not withdrawn:
        return None
    parts: list[str] = []
    if stopped:
        clusters: Counter[str] = Counter()
        for member in stopped:
            for name, count in member.stop_clusters:
                clusters[name] += count
        total = sum(clusters.values())
        spelled = ", ".join(f"{name} {count}" for name, count in clusters.most_common(3))
        busiest = [
            member
            for member in sorted(
                stopped, key=lambda item: (-item.stopped_trials, item.display_name.casefold())
            )
            if member.prose_name
        ][:5]
        who = NAME_SEPARATOR.join(
            f"{member.prose_name} {member.stopped_trials}" for member in busiest
        )
        parts.append(f"Stopped: {len(stopped)} of {len(hub.members)}, {total} trials — {spelled}; {who}")
    if withdrawn:
        ordered = sorted(
            withdrawn,
            key=lambda item: (item.withdrawn_year or "9999", item.display_name.casefold()),
        )
        # A withdrawal whose reason or jurisdiction the registers do not record prints its name
        # and the year alone. The absent reason is an absence, and an absence is furniture
        # (docs/specs/phase4-generators.md section 11), so it belongs in the table cell and not
        # in a sentence that would carry the same two words on every hub.
        named = "; ".join(
            member.prose_name
            + (f" — {member.withdrawn_reason}" if member.withdrawn_reason else "")
            + (f", {member.withdrawn_where}" if member.withdrawn_where else "")
            + (f", {member.withdrawn_year}" if member.withdrawn_year else "")
            for member in ordered[:4]
            if member.prose_name
        )
        parts.append(f"Withdrawn: {len(withdrawn)} — {named}")
    return ". ".join(parts) + ".", {
        "template": "H2",
        "columns": ["withdrawn"],
        "fields": [
            "data/revamp/derived-v2/seed-03-failure-autopsy.ndjson values.clusters",
            "fields.withdrawal.value.reason",
            "fields.withdrawal.value.jurisdictions",
            "fields.withdrawal.value.date",
        ],
        "members": [member.key for member in (stopped[:3] + withdrawn[:3])],
    }


def sentence_h3(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """What a Singapore reader can access (template H3)."""
    registered = [member for member in hub.members if member.sg_registered]
    if not registered:
        return None
    counts = Counter(member.forensic_class for member in registered)
    licences = sum(member.sg_product_count for member in registered)
    controlled = sorted(
        (member for member in hub.members if member.controlled_sg_mda),
        key=lambda item: item.display_name.casefold(),
    )
    classes = ", ".join(
        f"{FORENSIC_WORDS[name]} {counts[name]}"
        for name in ("POM", "P", "GSL", "")
        if counts.get(name)
    )
    text = (
        f"HSA lists {len(registered)} of {len(hub.members)} on {licences} product "
        f"{plural(licences, 'licence')} — {classes}"
    )
    if controlled:
        text += (
            f". Misuse of Drugs Act schedule: {len(controlled)} — "
            f"{join_names((member.prose_name for member in controlled if member.prose_name), 5)}"
        )
    return text + ".", {
        "template": "H3",
        "columns": ["approval by jurisdiction (SG)", "Singapore forensic class"],
        "fields": [
            "fields.regulatory.value.SG.status",
            "fields.regulatory.value.SG.forensicClassification",
            "fields.regulatory.value.SG.productCount",
            "fields.controlled.value.SG.schedules",
        ],
        "members": [member.key for member in registered[:5]],
    }


def sentence_h4(
    hub: Hub,
    additive: dict[str, set[tuple[str, str]]],
    documented: set[tuple[str, str]],
) -> tuple[str, dict[str, Any]] | None:
    """What is predicted from mechanism (template H4)."""
    keys = {member.key for member in hub.members}
    best_class = ""
    best_pairs: set[tuple[str, str]] = set()
    for name, pairs in additive.items():
        inside = {pair for pair in pairs if pair[0] in keys and pair[1] in keys}
        if len(inside) > len(best_pairs):
            best_class, best_pairs = name, inside
    if not best_pairs:
        return None
    overlap = len(best_pairs & documented)
    readable = ADDITIVE_CLASS_WORDS.get(best_class, best_class)
    degree: Counter[str] = Counter()
    for left, right in best_pairs:
        degree[left] += 1
        degree[right] += 1
    by_key = {member.key: member.prose_name for member in hub.members if member.prose_name}
    busiest = NAME_SEPARATOR.join(
        f"{by_key[key]} {count}" for key, count in degree.most_common(5) if key in by_key
    )
    text = (
        f"Predicted additive {readable}: {len(best_pairs)} member "
        f"{plural(len(best_pairs), 'pair')}, {overlap} label-documented — {busiest}"
    )
    return text + ".", {
        "template": "H4",
        "columns": ["name"],
        "fields": [
            f"data/revamp/interactions/interactions.parquet rule_id=C3-additive-{best_class}",
            "data/revamp/interactions/interactions.parquet tier=A",
        ],
        "pairs": len(best_pairs),
        "documented": overlap,
    }


def sentence_h5(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """What the registry-to-publication gap says (template H5)."""
    completed = sum(member.completed_trials for member in hub.members)
    posted = sum(member.results_posted for member in hub.members)
    if completed == 0:
        return None
    unposted: list[tuple[str, str, str]] = []
    for member in hub.members:
        if member.oldest_unposted is None:
            continue
        nct, completion = member.oldest_unposted
        unposted.append((completion, nct, member.display_name))
    unposted.sort()
    text = (
        f"Completed trials: {completed}, results posted {posted} "
        f"({round(100 * posted / completed)}%)"
    )
    if unposted:
        # Three registrations, not one: a single oldest trial is one identifier on a page that
        # otherwise carries counts, and the reader chasing the gap wants the registrations to
        # open. Each is a completed study whose results the registry does not hold.
        listed = NAME_SEPARATOR.join(
            f"{nct} {name} {completion}" for completion, nct, name in unposted[:3]
        )
        text += f". Completed without posted results: {listed}"
    return text + ".", {
        "template": "H5",
        "columns": ["trials (count · results-posted share)"],
        "fields": [
            "fields.registry.value.hasResults.completed",
            "fields.registry.value.hasResults.resultsPostedCount",
            "data/revamp/derived-v2/seed-12-registry-to-publication-gap.ndjson values.unreportedTrials",
        ],
    }


def sentence_h6(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """Potency spread, target hubs only (template H6)."""
    if hub.type != "target":
        return None
    scored = []
    for member in hub.members:
        held = hub.potency_for(member)
        if held is not None and member.prose_name:
            scored.append((member, held))
    if len(scored) < 2:
        return None
    scored.sort(key=lambda item: -item[1]["median"])
    values = [held["median"] for _, held in scored]
    top = scored[: min(3, len(scored) - 1)]
    weakest, weakest_held = scored[-1]
    listed = NAME_SEPARATOR.join(
        f"{member.prose_name} {held['median']:.2f}"
        f" ({held['standardType'] or 'measure unstated'},"
        f" {held['assayType'] or 'assay type unstated'})"
        for member, held in top
    )
    text = (
        f"pChEMBL {min(values):.2f}-{max(values):.2f} across {len(scored)}: "
        f"{listed}; {weakest.prose_name} {weakest_held['median']:.2f}."
    )
    return text, {
        "template": "H6",
        "columns": ["potency"],
        "fields": ["fields.potency.value.assayGroups[].medianPChembl"],
        "members": [member.key for member, _ in scored],
    }


def sentence_h7(hub: Hub) -> tuple[str, dict[str, Any]] | None:
    """Longevity evidence, pathway hubs only (template H7)."""
    if hub.type != "pathway":
        return None
    with_organisms = sorted(
        (member for member in hub.members if member.organisms),
        key=lambda item: (-len(item.organisms), item.display_name.casefold()),
    )
    itp = sorted(
        (member for member in hub.members if member.itp_tested),
        key=lambda item: item.display_name.casefold(),
    )
    if not with_organisms and not itp:
        return None
    organisms: Counter[str] = Counter()
    for member in with_organisms:
        organisms.update(member.organisms)
    listed = ", ".join(f"{name} {count}" for name, count in organisms.most_common(5))
    text = f"Organism ladder: {len(with_organisms)} of {len(hub.members)} — {listed}"
    if itp:
        text += (
            f". Interventions Testing Program: {len(itp)} — "
            f"{join_names((member.prose_name for member in itp if member.prose_name), 6)}"
        )
    return text + ".", {
        "template": "H7",
        "columns": ["name"],
        "fields": [
            "fields.organismLadder.value.countsPerRung",
            "fields.itp.value.cohorts",
        ],
        "members": [member.key for member in (with_organisms[:4] + itp[:4])],
    }


def synthesise(
    hub: Hub,
    additive: dict[str, set[tuple[str, str]]],
    documented: set[tuple[str, str]],
) -> list[tuple[str, str, dict[str, Any]]]:
    produced: list[tuple[str, str, dict[str, Any]]] = []
    builders = (
        ("H1", lambda: sentence_h1(hub)),
        ("H2", lambda: sentence_h2(hub)),
        ("H3", lambda: sentence_h3(hub)),
        ("H4", lambda: sentence_h4(hub, additive, documented)),
        ("H5", lambda: sentence_h5(hub)),
        ("H6", lambda: sentence_h6(hub)),
        ("H7", lambda: sentence_h7(hub)),
    )
    for template_id, builder in builders:
        result = builder()
        if result is None:
            continue
        text, provenance = result
        produced.append((template_id, text, provenance))
    return produced


# --------------------------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------------------------


def write_parquet(path: Path, rows: list[dict[str, Any]], schema: pa.Schema) -> None:
    columns = {name: [row.get(name) for row in rows] for name in schema.names}
    pq.write_table(pa.table(columns, schema=schema), path)


MEMBERS_SCHEMA = pa.schema(
    [
        ("hub_id", pa.string()),
        ("type", pa.string()),
        ("name", pa.string()),
        ("definition", pa.string()),
        ("definition_source", pa.string()),
        ("page", pa.string()),
        ("membership_evidence", pa.string()),
        ("member_role", pa.string()),
    ]
)

HUBS_SCHEMA = pa.schema(
    [
        ("hub_id", pa.string()),
        ("type", pa.string()),
        ("name", pa.string()),
        ("slug", pa.string()),
        ("definition", pa.string()),
        ("definition_source", pa.string()),
        ("member_count", pa.int32()),
        ("approved_count", pa.int32()),
        ("relevance", pa.float64()),
        ("rank_score", pa.float64()),
        ("first_batch", pa.bool_()),
    ]
)

TABLES_SCHEMA = pa.schema(
    [
        ("hub_id", pa.string()),
        ("hub_type", pa.string()),
        ("ordinal", pa.int32()),
        ("page", pa.string()),
        ("name", pa.string()),
        ("slug", pa.string()),
        ("approval_sg", pa.string()),
        ("approval_us", pa.string()),
        ("approval_au", pa.string()),
        ("approval_uk", pa.string()),
        ("approval_eu", pa.string()),
        ("approval_jp", pa.string()),
        ("approval_ca", pa.string()),
        ("sg_forensic_class", pa.string()),
        ("generic_available", pa.string()),
        ("potency", pa.string()),
        ("indications", pa.string()),
        ("indication_count", pa.int32()),
        ("withdrawn_reason", pa.string()),
        ("withdrawn_where", pa.string()),
        ("trials_count", pa.int32()),
        ("results_posted_share", pa.string()),
        ("tier", pa.int32()),
        ("member_role", pa.string()),
        ("first_question", pa.string()),
    ]
)

SYNTHESES_SCHEMA = pa.schema(
    [
        ("hub_id", pa.string()),
        ("template_id", pa.string()),
        ("ordinal", pa.int32()),
        ("sentence", pa.string()),
        ("provenance", pa.string()),
    ]
)


def write_membership_reasons(
    out_path: Path, members: dict[str, Member], hub_member_keys: set[str]
) -> dict[str, int]:
    """Why a page that names a grouping field is in no hub.

    One row per such page, carrying the reason each of its groups was rejected exactly as the
    builder that rejected it recorded. `scripts/revamp/link_graph_check.py` reads this file: an
    indexable leaf with no hub passes only when a reason for it is on record here, or when its
    stored fields name no target, no ATC level-4 code and no pathway at all.
    """
    by_page: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rejection in GROUP_REJECTIONS:
        for key in rejection["members"]:
            by_page[key].append(
                {
                    "kind": rejection["kind"],
                    "group": rejection["group"],
                    "reason": rejection["reason"],
                }
            )
    written = 0
    with out_path.open("w", encoding="utf-8") as handle:
        for key in sorted(by_page):
            if key in hub_member_keys:
                continue
            handle.write(
                json.dumps({"key": key, "reasons": by_page[key]}, sort_keys=True) + "\n"
            )
            written += 1
    return {"pagesWithARecordedReason": written, "groupsRejected": len(GROUP_REJECTIONS)}


def write_load_ndjson(
    out_dir: Path,
    hub_rows: list[dict[str, Any]],
    comparison_rows: list[dict[str, Any]],
    member_rows: list[dict[str, Any]],
    synthesis_rows: list[dict[str, Any]],
) -> dict[str, int]:
    """The same three tables again as NDJSON, in the shape the loader writes.

    `scripts/revamp/hubs_load.ts` runs in Node and reads NDJSON line by line, as
    `scripts/corpus-20k/load/materialise.ts` does. The parquet files stay the analysis artefact;
    these are the load artefact, and they are written from the same rows in the same run so the two
    can never disagree. One row per database row: the comparison table row carries the membership
    evidence beside it, because both are columns of `hub_members`.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    evidence = {
        (row["hub_id"], row["page"]): row["membership_evidence"] for row in member_rows
    }
    written = {"hubs": 0, "members": 0, "syntheses": 0}
    with (out_dir / "hubs.ndjson").open("w", encoding="utf-8") as handle:
        for row in hub_rows:
            handle.write(json.dumps(row, sort_keys=True) + "\n")
            written["hubs"] += 1
    with (out_dir / "hub-members.ndjson").open("w", encoding="utf-8") as handle:
        for row in comparison_rows:
            record = dict(row)
            record.pop("hub_type", None)
            record.pop("name", None)
            record.pop("slug", None)
            record["membership_evidence"] = evidence.get((row["hub_id"], row["page"]), "")
            handle.write(json.dumps(record, sort_keys=True) + "\n")
            written["members"] += 1
    with (out_dir / "hub-syntheses.ndjson").open("w", encoding="utf-8") as handle:
        for row in synthesis_rows:
            handle.write(json.dumps(row, sort_keys=True) + "\n")
            written["syntheses"] += 1
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    members = load_members()
    attach_identity(members)
    routes = attach_published_routes(members)
    routes.update(finalise_names(members))
    pathway_filter = filter_pathways_to_named_sentences(members)
    attach_tiers(members)
    attach_generic(members)
    attach_questions(members)
    attach_seed_three(members)
    attach_seed_twelve(members)

    hubs = build_target_hubs(members) + build_class_hubs(members) + build_pathway_hubs(members)
    rank_hubs(hubs)
    hubs.sort(key=lambda item: (item.type, item.name.casefold()))

    additive, documented = load_interaction_pairs()

    member_rows: list[dict[str, Any]] = []
    hub_rows: list[dict[str, Any]] = []
    comparison_rows: list[dict[str, Any]] = []
    synthesis_rows: list[dict[str, Any]] = []
    per_template: Counter[str] = Counter()

    for hub in hubs:
        hub_rows.append(
            {
                "hub_id": hub.hub_id,
                "type": hub.type,
                "name": hub.name,
                "slug": hub.slug,
                "definition": hub.definition,
                "definition_source": hub.definition_source,
                "member_count": len(hub.members),
                "approved_count": hub.approved_count,
                "relevance": hub.relevance,
                "rank_score": hub.rank_score,
                "first_batch": hub.first_batch,
            }
        )
        for member in hub.members:
            member_rows.append(
                {
                    "hub_id": hub.hub_id,
                    "type": hub.type,
                    "name": hub.name,
                    "definition": hub.definition,
                    "definition_source": hub.definition_source,
                    "page": member.key,
                    "membership_evidence": hub.evidence.get(member.key, ""),
                    "member_role": member.role,
                }
            )
        comparison_rows.extend(table_rows(hub))
        for ordinal, (template_id, text, provenance) in enumerate(
            synthesise(hub, additive, documented)
        ):
            per_template[template_id] += 1
            synthesis_rows.append(
                {
                    "hub_id": hub.hub_id,
                    "template_id": template_id,
                    "ordinal": ordinal,
                    "sentence": text,
                    "provenance": json.dumps(provenance, sort_keys=True),
                }
            )

    write_parquet(args.out / "members.parquet", member_rows, MEMBERS_SCHEMA)
    write_parquet(args.out / "hubs.parquet", hub_rows, HUBS_SCHEMA)
    write_parquet(args.out / "tables.parquet", comparison_rows, TABLES_SCHEMA)
    write_parquet(args.out / "syntheses.parquet", synthesis_rows, SYNTHESES_SCHEMA)
    write_load_ndjson(args.out / "load", hub_rows, comparison_rows, member_rows, synthesis_rows)
    reasons = write_membership_reasons(
        args.out / "membership-reasons.ndjson",
        members,
        {row["page"] for row in member_rows},
    )

    by_type = Counter(hub.type for hub in hubs)
    counts = {
        "generatedBy": "scripts/revamp/hubs_build.py",
        "publishedRoutes": routes,
        "membershipReasons": reasons,
        "spec": "docs/specs/hubs.md",
        "hubsPerType": {name: by_type.get(name, 0) for name in ("target", "class", "pathway")},
        "hubs": len(hubs),
        "members": len(member_rows),
        "distinctMemberPages": len({row["page"] for row in member_rows}),
        "firstBatch": {
            "hubs": sum(1 for hub in hubs if hub.first_batch),
            "target": sum(1 for hub in hubs if hub.first_batch and hub.type == "target"),
            "pathway": sum(1 for hub in hubs if hub.first_batch and hub.type == "pathway"),
            "note": (
                "docs/specs/hubs.md section 4 asks for 20 target and 10 pathway hubs. The corpus "
                f"holds {by_type.get('pathway', 0)} pathway hubs meeting section 1, so the batch "
                f"takes every one of them and {FIRST_BATCH_TARGETS} target hubs to reach 30."
            ),
        },
        "synthesesPerTemplate": {name: per_template.get(name, 0) for name in
                                 ("H1", "H2", "H3", "H4", "H5", "H6", "H7")},
        "syntheses": len(synthesis_rows),
        "memberRoles": dict(Counter(row["member_role"] for row in member_rows)),
        "pathwayNamingRule": {
            **pathway_filter,
            "rule": (
                "docs/specs/phase4-generators.md section 7 — a stored Europe PMC sentence counts "
                "only when it names the page's display name or a recorded synonym"
            ),
        },
        "vocabulariesNotUsed": {
            "iuphar-ligand-class": (
                "the IUPHAR rows this corpus holds record a ligand action against one target "
                "(Inhibition, Antagonist, Agonist), not a class of compounds; grouping on them "
                "would put every inhibitor of anything in one hub"
            ),
            "chebi-has-role": (
                "CHEBI roles recorded here are chemical and organism roles (Homo sapiens "
                "metabolite, environmental contaminants), not a pharmacologic class"
            ),
        },
        "inputs": {
            "fields": str(FIELDS.relative_to(ROOT)),
            "identity": str(IDENTITY.relative_to(ROOT)),
            "tiers": str(SG_STATUS.relative_to(ROOT)),
            "patent": str(PATENT.relative_to(ROOT)),
            "interactions": str(INTERACTIONS.relative_to(ROOT)),
            "seeds": [
                "data/revamp/derived-v2/seed-03-failure-autopsy.ndjson",
                "data/revamp/derived-v2/seed-12-registry-to-publication-gap.ndjson",
            ],
            "questions": str(
                (QUESTIONS_V2 if QUESTIONS_V2.is_dir() else QUESTIONS_V1).relative_to(ROOT)
            ),
        },
    }
    (args.out / "counts.json").write_text(json.dumps(counts, indent=2), encoding="utf-8")
    print(json.dumps({k: counts[k] for k in
                      ("hubsPerType", "hubs", "members", "firstBatch", "synthesesPerTemplate")},
                     indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
