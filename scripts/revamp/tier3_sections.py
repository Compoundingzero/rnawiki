#!/usr/bin/env python
"""Phase 4 step 4.5 — the four Tier 3 computed sections, data side.

Executes `docs/specs/revamp-2026-09.md` §Phase 4.5 under the wordings fixed in
`docs/specs/phase4-generators.md` §8. Four sections are computed for every page whose inputs
exist; a section never fires without its inputs, and a missing value stays missing and is
described as missing rather than filled.

    .venv-corpus/bin/python scripts/revamp/tier3_sections.py

Writes:

  * ``data/revamp/tier3-sections.parquet`` — one row per emitted sentence, columns
    ``page`` (corpus key), ``section`` (neighbour | potency | timeline | formOf),
    ``values`` (JSON: every computed value the sentence rests on, plus the page tier),
    ``provenance`` (JSON: ``{"sentence": <the rendered sentence>, "fields": {token -> the
    stored field or computed value it comes from}}``), ``sentence_template_id``.
  * ``data/revamp/tier3-sections-counts.json`` — firing counts per section per tier, per
    sentence template, the approved reference set, the recorded decisions and the issues.

Sections and their inputs
-------------------------
(a) ``neighbour`` — nearest approved structural neighbour. Morgan fingerprints, radius 2,
    2048 bits, over ``data/revamp/identity/canonical-v2.ndjson`` ``structure.smiles``.
    Tanimoto against every approved compound that holds a structure. Approved is read from
    ``data/revamp/fields-v2`` ``regulatory``: a ``US``, ``EU``, ``JP`` or ``CA`` block whose
    status is ``approved``, or an NCATS Inxight marketing record carrying a ``USApprovalRx``,
    ``USApprovalOTC`` or ``USApprovalAllergenic`` status. The top match renders at similarity
    >= 0.40. The differing substituent is named from an rdFMCS maximum common substructure
    comparison; when RDKit cannot name it the clause is omitted and the sentence carries the
    similarity and the neighbour's status only, exactly as §8 requires the sentence to stop
    after the similarity value.
(b) ``potency`` — rank and percentile among the compounds holding a pChEMBL value against the
    same primary target, from ``fields-v2`` ``potency``. The primary target is the mechanism
    target: a ChEMBL mechanism target recorded on the page's ``target`` field. A page that
    holds pChEMBL values but no mechanism target has no primary target and does not fire.
    The comparator group is (target, assay type); the assay type is stated in the sentence.
(c) ``timeline`` — first and last publication year from ``fields-v2`` ``publicationYears``;
    target validation or target headwind from the registry rows of every page sharing the
    mechanism target; the originating organisation from the NCATS Inxight marketing records.
(d) ``formOf`` — the Phase 3 relation notes from ``data/revamp/identity/relations.parquet``,
    verbatim, for the relations that state what this page is a form or part of.

Recorded decisions, each reversible and each listed in the counts file
----------------------------------------------------------------------
D1  A page linked to the query by any Phase 3 relation is excluded from the neighbour
    candidates. A salt, ester, stereoisomer, isotopologue or same-structure page scores at or
    near 1.00 and states nothing the form-of note does not already state. The count of pages
    whose top match changed under this exclusion is reported.
D2  The substituent difference is named only when exactly one of the two molecules carries
    exactly one side chain off the maximum common substructure and that side chain is in the
    named-group table. A two-sided swap is not a "differs by a X substituent" fact and is not
    described as one.
D3  The potency comparator group is (target, assay type), and a compound's value in that group
    is the n-weighted mean of the ChEMBL per-standard-type median pChEMBL values it holds
    there. pChEMBL is defined by ChEMBL to unify IC50, Ki, Kd, EC50, AC50 and Potency on one
    negative-log molar scale, so one rank across the standard types inside one assay type is
    the scale's intended use. Every standard type in the group is recorded in ``values``.
D4  "Five or more comparators" is read as a group of five or more compounds, which is the
    group size the §8 sentence states ("Among 14 compounds ..."). The count under the stricter
    reading (five comparators besides the page itself) is also reported.
D5  Target validation requires a dated approval: another page sharing the mechanism target,
    approved, whose earliest recorded approval date falls after this page's last publication
    year. Where no approval date is recorded the claim cannot be made and is not made.
D6  The originating organisation is emitted only where the earliest dated Inxight marketing
    record on the page names exactly one sponsor, and where that sponsor string is one name
    rather than several packed behind a "|" or a ";". Where the record names several, no single
    organisation originated the compound on this evidence and none is named.
D7  Validation and headwind are alternatives; where both hold, validation is emitted, because
    an approval against the target is the stronger recorded fact. Both flags stay in
    ``values``.
D8  At most six form-of notes render inline, following §7's six-row rule; the remainder is
    carried as a count in ``values`` for the disclosure.
D9  ``target`` is a DEVELOPMENT-model field, so a ChEMBL mechanism target is recorded only on
    Tier 3 pages, while CLINICAL and LONGEVITY pages record their targets as UniProt
    accessions under ``identifiers.uniprotTargets``. Left unjoined, "an approved drug has
    since been approved against this target" could never see an approved drug and "the last
    three trials on the target" could never see an approved drug's trials. The two are joined
    on the cross-reference the DEVELOPMENT records already carry — ``target.value
    .mergedTargets[].evidence[].chemblTargetIds`` against the merged target's UniProt
    accession — so a target is one key across all three models. A ChEMBL target bridging to
    more than one accession is a complex or a family and keeps its ChEMBL key.
D11 A Phase 3 relation note is a decision-log sentence: most carry a trailing clause naming
    the identity-spec section that governed the decision ("...; §3.2 keeps an ester on its own
    page"), and some name a UNII or a structure key to tell two same-named pages apart. §7
    forbids a raw record id or rule id in prose, so the trailing spec clause is dropped and a
    note still carrying a UNII or an InChIKey after that is not rendered at all. Every
    relation stays in ``values`` with its note verbatim for the technical disclosure, and the
    count of notes withheld is reported.
D12 An organisation name that already ends in a full stop ("... Co., Ltd.") takes the
    sentence's own full stop rather than a second one.
D10 One potency sentence renders per page: the comparator group with the most compounds, then
    the most activities, then the assay type in alphabetical order. The ranks in the page's
    other assay types are carried in ``values`` for the disclosure. Two sentences of one
    template on one page is the template repetition the slop gate exists to catch.
"""

from __future__ import annotations

import csv
import glob
import json
import math
import multiprocessing
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from rdkit import Chem, RDLogger
from rdkit.Chem import rdFingerprintGenerator, rdFMCS
from rdkit.DataStructs import BulkTanimotoSimilarity

RDLogger.DisableLog("rdApp.*")

ROOT = Path(__file__).resolve().parents[2]

FIELDS_GLOB = "data/revamp/fields-v2/*/batch-*.ndjson"
CANONICAL = Path("data/revamp/identity/canonical-v2.ndjson")
CANONICAL_V3 = Path("data/revamp/identity/canonical-v3.ndjson")
DISPLAY_NAMES = Path("data/revamp/identity/display-names.csv")
RELATIONS = Path("data/revamp/identity/relations-v3.parquet")
RELATIONS_FALLBACK = Path("data/revamp/identity/relations.parquet")
SPINE = Path("data/revamp/identity/spine-attached.parquet")
TRIAL_REASSIGNMENTS = Path("data/revamp/identity/trial-reassignments-v3.csv")
TRIAL_REASSIGNMENTS_FALLBACK = Path("data/revamp/identity/trial-reassignments.csv")
MODEL_ASSIGNMENT = Path("data/corpus-20k/tiers/model-assignment.ndjson")
SUPPRESSION = Path("data/corpus-20k/suppression/assignments.ndjson")
REGISTRY_AGGREGATES = Path("data/corpus-20k/registry/aggregates")

OUT_PARQUET = Path("data/revamp/tier3-sections.parquet")
OUT_COUNTS = Path("data/revamp/tier3-sections-counts.json")

APPROVAL_JURISDICTIONS = ("US", "EU", "JP", "CA")
INXIGHT_APPROVAL_STATUSES = frozenset(
    {"USApprovalRx", "USApprovalOTC", "USApprovalAllergenic"}
)
STOPPED_STATUSES = frozenset({"TERMINATED", "WITHDRAWN"})
NEIGHBOUR_THRESHOLD = 0.40
POTENCY_MIN_GROUP = 5
FORM_OF_INLINE_LIMIT = 6
MCS_TIMEOUT_SECONDS = 2
MCS_MAX_HEAVY_ATOMS = 80
MCS_MAX_HEAVY_ATOM_DELTA = 8
ORIGINATOR_RECENT_YEAR = 2020

IS_FORM_RELATIONS = (
    "form_of",
    "component_of",
    "biosimilar_of",
    "stereoisomer_of",
    "ester_of",
    "active_moiety_of",
    "isotopologue_of",
    "ionised_form_of",
    "same_structure_as",
    "related_form_of",
)
IS_FORM_ORDER = {name: index for index, name in enumerate(IS_FORM_RELATIONS)}

ASSAY_TYPE_WORDS = {
    "B": "binding",
    "F": "functional",
    "A": "ADMET",
    "T": "toxicity",
    "P": "physicochemical",
    "U": "unclassified",
}

JURISDICTION_ORDER = ("US", "EU", "JP", "CA")

TEMPLATES = {
    "t3-neighbour-substituent-v1": (
        "Closest approved compound: {neighbour} (similarity {similarity}); differs by a "
        "{substituent} substituent{location}; {neighbour} is {status}."
    ),
    "t3-neighbour-similarity-v1": (
        "Closest approved compound: {neighbour} (similarity {similarity}); {neighbour} is "
        "{status}."
    ),
    "t3-potency-rank-v1": (
        "Among {n} compounds with a pChEMBL value against {target} ({assay} assays), "
        "{name} ranks {rank} ({percentile} percentile)."
    ),
    "t3-timeline-publication-span-v1": "First publication {first}, last {last} (ChEMBL).",
    "t3-timeline-target-validated-v1": (
        "An approved drug has since been approved against {target} (target validated)."
    ),
    "t3-timeline-target-headwind-v1": (
        "The last three trials on {target} were terminated or withdrawn (target headwind)."
    ),
    "t3-timeline-originator-v1": "Originating organisation: {organisation}.",
    "t3-timeline-originator-no-recent-record-v1": (
        "Originating organisation: {organisation} (no record after 2020)."
    ),
    "t3-form-of-note-v1": "{note}",
}

# Named substituents. Keys are written as attachment-point SMILES and canonicalised on load,
# so the lookup is an exact canonical-SMILES match, never a substring guess.
SUBSTITUENT_NAMES = {
    "*C": "methyl",
    "*CC": "ethyl",
    "*CCC": "propyl",
    "*C(C)C": "isopropyl",
    "*CCCC": "butyl",
    "*C(C)(C)C": "tert-butyl",
    "*C1CC1": "cyclopropyl",
    "*C1CCCCC1": "cyclohexyl",
    "*O": "hydroxy",
    "*OC": "methoxy",
    "*OCC": "ethoxy",
    "*OCCC": "propoxy",
    "*OC(C)C": "isopropoxy",
    "*OC(F)(F)F": "trifluoromethoxy",
    "*F": "fluoro",
    "*Cl": "chloro",
    "*Br": "bromo",
    "*I": "iodo",
    "*N": "amino",
    "*NC": "methylamino",
    "*N(C)C": "dimethylamino",
    "*NCC": "ethylamino",
    "*C#N": "cyano",
    "*[N+](=O)[O-]": "nitro",
    "*C(=O)O": "carboxy",
    "*C(=O)C": "acetyl",
    "*C(=O)N": "carboxamide",
    "*NC(C)=O": "acetamido",
    "*C(=O)OC": "methoxycarbonyl",
    "*C(F)(F)F": "trifluoromethyl",
    "*CO": "hydroxymethyl",
    "*CN": "aminomethyl",
    "*S": "sulfanyl",
    "*SC": "methylsulfanyl",
    "*S(C)(=O)=O": "methanesulfonyl",
    "*S(N)(=O)=O": "sulfamoyl",
    "*C=C": "vinyl",
    "*C#C": "ethynyl",
    "*c1ccccc1": "phenyl",
    "*Oc1ccccc1": "phenoxy",
    "*OS(=O)(=O)O": "sulfooxy",
    "*OP(=O)(O)O": "phosphonooxy",
    "*[O-]": "oxido",
    "*=O": "oxo",
}


def canonical_substituent_table() -> dict[str, str]:
    table: dict[str, str] = {}
    for smiles, name in SUBSTITUENT_NAMES.items():
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            continue
        table[Chem.MolToSmiles(mol)] = name
    return table


CANONICAL_SUBSTITUENTS = canonical_substituent_table()


INCHIKEY = re.compile(r"\b[A-Z]{14}-[A-Z]{10}-[A-Z]\b")
SPEC_CLAUSE = re.compile(r"\s*;\s*§.*$")


def render_relation_note(note: str) -> str | None:
    """The reader-facing half of a Phase 3 relation note, or None when it cannot be shown.

    D11: the trailing clause naming the identity-spec section is dropped, and a note that
    still names a UNII or a structure key is withheld rather than shown with a record id in it.
    """
    if not note:
        return None
    trimmed = SPEC_CLAUSE.sub("", str(note)).strip()
    if not trimmed:
        return None
    if "UNII" in trimmed or INCHIKEY.search(trimmed):
        return None
    if not trimmed.endswith("."):
        trimmed += "."
    return trimmed


def ordinal(number: int) -> str:
    if 10 <= number % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(number % 10, "th")
    return f"{number}{suffix}"


def year_of(value) -> int | None:
    """Read a four-digit year off a date string or an integer, or return None."""
    if value is None:
        return None
    if isinstance(value, int):
        return value if 1800 <= value <= 2100 else None
    text = str(value).strip()
    if len(text) >= 4 and text[:4].isdigit():
        year = int(text[:4])
        return year if 1800 <= year <= 2100 else None
    return None


def load_tiers() -> tuple[dict[str, int], dict[str, str]]:
    spine = pd.read_parquet(SPINE, columns=["key", "tier"])
    tiers = {key: int(tier) for key, tier in zip(spine["key"], spine["tier"])}
    models: dict[str, str] = {}
    with MODEL_ASSIGNMENT.open() as handle:
        for line in handle:
            record = json.loads(line)
            models[record["key"]] = record.get("model")
    return tiers, models


def load_display_names() -> dict[str, str]:
    names: dict[str, str] = {}
    with CANONICAL.open() as handle:
        for line in handle:
            record = json.loads(line)
            if record.get("displayName"):
                names[record["key"]] = record["displayName"]
    if DISPLAY_NAMES.exists():
        with DISPLAY_NAMES.open(newline="") as handle:
            for row in csv.DictReader(handle):
                if row.get("disambiguated_display_name"):
                    names[row["key"]] = row["disambiguated_display_name"]
    return names


def load_structures() -> dict[str, str]:
    structures: dict[str, str] = {}
    with CANONICAL.open() as handle:
        for line in handle:
            record = json.loads(line)
            structure = record.get("structure") or {}
            if structure.get("smiles"):
                structures[record["key"]] = structure["smiles"]
    return structures


def load_relations() -> pd.DataFrame:
    path = RELATIONS if RELATIONS.exists() else RELATIONS_FALLBACK
    frame = pd.read_parquet(path)
    frame.attrs["path"] = str(path)
    return frame


def trial_reassignment_path() -> Path:
    return (
        TRIAL_REASSIGNMENTS
        if TRIAL_REASSIGNMENTS.exists()
        else TRIAL_REASSIGNMENTS_FALLBACK
    )


def load_trial_reassignments() -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    """Return (nct -> keys the trial moved away from, nct -> keys it moved to).

    The Phase 3 apply step supersedes its own list, so the v3 file is read where it exists.
    Page identity and display names stay on the canonical-v2 spine the rest of Phase 4 reads;
    a trial reassignment is internal to the target-headwind count and carries no such
    cross-block tie.
    """
    moved_from: dict[str, set[str]] = defaultdict(set)
    moved_to: dict[str, set[str]] = defaultdict(set)
    path = trial_reassignment_path()
    if not path.exists():
        return moved_from, moved_to
    with path.open(newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("action") != "move":
                continue
            nct = row.get("nct")
            if not nct:
                continue
            if row.get("from_key"):
                moved_from[nct].add(row["from_key"])
            if row.get("to_key"):
                moved_to[nct].add(row["to_key"])
    return moved_from, moved_to


def load_per_trial() -> dict[str, list[dict]]:
    """page -> per-trial registry rows (nct, status, completionDate) from the aggregates."""
    per_page: dict[str, list[dict]] = {}
    for path in sorted(REGISTRY_AGGREGATES.glob("batch-*.ndjson")):
        with path.open() as handle:
            for line in handle:
                record = json.loads(line)
                rows = record.get("perTrial") or []
                if not rows:
                    continue
                per_page[record["key"]] = [
                    {
                        "nct": row.get("nct"),
                        "status": row.get("status"),
                        "completionDate": row.get("completionDate"),
                    }
                    for row in rows
                    if row.get("nct")
                ]
    return per_page


def read_page_facts() -> tuple[dict[str, dict], Counter, list[str]]:
    """One streaming pass over fields-v2, keeping only what the four sections need."""
    facts: dict[str, dict] = {}
    counts: Counter = Counter()
    assay_types: Counter = Counter()

    for path in sorted(glob.glob(FIELDS_GLOB)):
        with open(path) as handle:
            for line in handle:
                record = json.loads(line)
                key = record["key"]
                fields = record.get("fields") or {}
                counts["pages"] += 1

                regulatory = (fields.get("regulatory") or {}).get("value")
                regulatory = regulatory if isinstance(regulatory, dict) else {}

                approved_in: list[str] = []
                withdrawn_in: list[str] = []
                approval_dates: list[str] = []
                for jurisdiction in APPROVAL_JURISDICTIONS:
                    block = regulatory.get(jurisdiction)
                    if not isinstance(block, dict):
                        continue
                    status = block.get("status")
                    if status == "approved":
                        approved_in.append(jurisdiction)
                    if status == "withdrawn":
                        withdrawn_in.append(jurisdiction)
                    approval_date = block.get("approvalDate")
                    if isinstance(approval_date, dict) and approval_date.get("date"):
                        approval_dates.append(str(approval_date["date"]))
                    elif isinstance(approval_date, str):
                        approval_dates.append(approval_date)

                inxight_approved = False
                sponsor_records: list[dict] = []
                curated = regulatory.get("curatedMarketingStatusByJurisdiction")
                if isinstance(curated, dict):
                    for jurisdiction, rows in curated.items():
                        for row in rows or []:
                            if not isinstance(row, dict):
                                continue
                            status_counts = row.get("statusCounts") or {}
                            is_approval_row = bool(
                                INXIGHT_APPROVAL_STATUSES & set(status_counts.keys())
                            )
                            if is_approval_row:
                                inxight_approved = True
                                if row.get("earliestRecordedDate"):
                                    approval_dates.append(
                                        str(row["earliestRecordedDate"])
                                    )
                            sponsors = [
                                sponsor
                                for sponsor in (row.get("sponsors") or [])
                                if isinstance(sponsor, str) and sponsor.strip()
                            ]
                            if sponsors:
                                sponsor_records.append(
                                    {
                                        "jurisdiction": jurisdiction,
                                        "sponsors": sorted(set(sponsors)),
                                        "earliest": row.get("earliestRecordedDate"),
                                        "latest": row.get("latestRecordedDate"),
                                        "statuses": sorted(status_counts.keys()),
                                        "upstreamRegisters": row.get("upstreamRegisters")
                                        or [],
                                    }
                                )

                withdrawal = (fields.get("withdrawal") or {}).get("value")
                withdrawn = bool(
                    isinstance(withdrawal, dict) and withdrawal.get("withdrawn")
                )
                if isinstance(withdrawal, dict) and withdrawal.get("jurisdictions"):
                    withdrawal_jurisdictions = [
                        str(item) for item in withdrawal["jurisdictions"]
                    ]
                else:
                    withdrawal_jurisdictions = []

                patent = (fields.get("patentStatus") or {}).get("value")
                generic_available = False
                first_generic_date = None
                if isinstance(patent, dict):
                    summary = (patent.get("orangeBookSummary") or {}).get(
                        "all_products_containing_this_substance"
                    ) or {}
                    if summary.get("generic_product_count") or summary.get(
                        "first_generic_approval_date"
                    ):
                        generic_available = True
                        first_generic_date = summary.get("first_generic_approval_date")

                target_value = (fields.get("target") or {}).get("value")
                mechanism_targets: dict[str, str] = {}
                symbols: dict[str, str] = {}
                bridge: dict[str, set[str]] = {}
                if isinstance(target_value, dict):
                    for entry in target_value.get("chemblTargets") or []:
                        if entry.get("kind") != "chembl-mechanism-target":
                            continue
                        target_id = entry.get("targetChemblId")
                        if not target_id:
                            continue
                        pref = entry.get("prefName")
                        if isinstance(pref, dict):
                            pref_name = pref.get("prefName")
                        else:
                            pref_name = pref
                        mechanism_targets[target_id] = pref_name or target_id
                    for entry in target_value.get("openTargetsTargets") or []:
                        if entry.get("symbol") and entry.get("targetName"):
                            symbols[entry["targetName"]] = entry["symbol"]
                    for merged in target_value.get("mergedTargets") or []:
                        accession = (merged.get("identifiers") or {}).get("uniprot")
                        if not accession:
                            continue
                        for evidence in merged.get("evidence") or []:
                            for chembl_id in evidence.get("chemblTargetIds") or []:
                                bridge.setdefault(chembl_id, set()).add(accession)

                identifiers = (fields.get("identifiers") or {}).get("value")
                uniprot_targets: list[str] = []
                if isinstance(identifiers, dict):
                    uniprot_targets = sorted(
                        {
                            entry["accession"]
                            for entry in identifiers.get("uniprotTargets") or []
                            if isinstance(entry, dict) and entry.get("accession")
                        }
                    )

                potency_value = (fields.get("potency") or {}).get("value")
                assay_groups: list[dict] = []
                if isinstance(potency_value, dict):
                    for group in potency_value.get("assayGroups") or []:
                        if (
                            group.get("targetChemblId")
                            and group.get("assayType")
                            and group.get("medianPChembl") is not None
                            and group.get("n")
                        ):
                            assay_groups.append(
                                {
                                    "targetChemblId": group["targetChemblId"],
                                    "assayType": group["assayType"],
                                    "standardType": group.get("standardType"),
                                    "n": int(group["n"]),
                                    "medianPChembl": float(group["medianPChembl"]),
                                    "exampleAssayDescription": group.get(
                                        "exampleAssayDescription"
                                    ),
                                }
                            )
                            assay_types[group["assayType"]] += 1

                publication = (fields.get("publicationYears") or {}).get("value")
                first_year = last_year = document_count = molecule_chembl_id = None
                if isinstance(publication, dict):
                    first_year = year_of(publication.get("firstYear"))
                    last_year = year_of(publication.get("lastYear"))
                    document_count = publication.get("documentCount")
                    molecule_chembl_id = publication.get("moleculeChemblId")

                facts[key] = {
                    "approvedIn": approved_in,
                    "inxightApproved": inxight_approved,
                    "approvalDates": approval_dates,
                    "withdrawn": withdrawn,
                    "withdrawnIn": withdrawn_in or withdrawal_jurisdictions,
                    "genericAvailable": generic_available,
                    "firstGenericApprovalDate": first_generic_date,
                    "mechanismTargets": mechanism_targets,
                    "targetSymbols": symbols,
                    "uniprotTargets": uniprot_targets,
                    "chemblToUniprot": {k: sorted(v) for k, v in bridge.items()},
                    "assayGroups": assay_groups,
                    "firstYear": first_year,
                    "lastYear": last_year,
                    "documentCount": document_count,
                    "moleculeChemblId": molecule_chembl_id,
                    "sponsorRecords": sponsor_records,
                }
    return facts, counts, sorted(assay_types)


def approved(fact: dict) -> bool:
    return bool(fact["approvedIn"]) or fact["inxightApproved"]


def approval_jurisdiction_list(fact: dict) -> list[str]:
    jurisdictions = list(fact["approvedIn"])
    if fact["inxightApproved"] and "US" not in jurisdictions:
        jurisdictions.append("US")
    return [j for j in JURISDICTION_ORDER if j in jurisdictions]


def earliest_approval_year(fact: dict) -> int | None:
    years = [year_of(value) for value in fact["approvalDates"]]
    years = [year for year in years if year is not None]
    return min(years) if years else None


def neighbour_status_clause(fact: dict) -> tuple[str, dict]:
    jurisdictions = approval_jurisdiction_list(fact)
    parts = []
    values: dict = {}
    if jurisdictions:
        parts.append(f"approved ({', '.join(jurisdictions)})")
        values["approvedIn"] = jurisdictions
    if fact["withdrawn"]:
        parts.append("withdrawn")
        values["withdrawn"] = True
        if fact["withdrawnIn"]:
            values["withdrawnIn"] = fact["withdrawnIn"]
    if fact["genericAvailable"]:
        parts.append("generic available")
        values["genericAvailable"] = True
        if fact["firstGenericApprovalDate"]:
            values["firstGenericApprovalDate"] = fact["firstGenericApprovalDate"]
    return ", ".join(parts), values


def build_fingerprints(structures: dict[str, str]) -> tuple[dict[str, object], Counter]:
    """Morgan fingerprints, radius 2, 2048 bits, one per page holding a parseable structure.

    The molecules themselves are not retained: the substituent comparison re-reads the two
    SMILES strings it needs inside its worker process.
    """
    generator = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    fingerprints: dict[str, object] = {}
    counts: Counter = Counter()
    for key, smiles in structures.items():
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            counts["unparseable_smiles"] += 1
            continue
        fingerprints[key] = generator.GetFingerprint(mol)
        counts["fingerprinted"] += 1
    return fingerprints, counts


def side_chains(mol, core_query, match):
    """Side chains of `mol` off the matched core, each as (canonical SMILES, core atom index).

    Returns None when the core cannot be removed cleanly.
    """
    try:
        stripped = Chem.ReplaceCore(mol, core_query, labelByIndex=True)
    except Exception:
        return None
    if stripped is None:
        return []
    try:
        fragments = Chem.GetMolFrags(stripped, asMols=True, sanitizeFrags=False)
    except Exception:
        return None
    results = []
    for fragment in fragments:
        dummies = [atom for atom in fragment.GetAtoms() if atom.GetAtomicNum() == 0]
        if len(dummies) != 1:
            return None
        core_index = dummies[0].GetIsotope()
        editable = Chem.RWMol(fragment)
        for atom in editable.GetAtoms():
            if atom.GetAtomicNum() == 0:
                atom.SetIsotope(0)
                atom.SetAtomMapNum(0)
        try:
            Chem.SanitizeMol(editable)
            smiles = Chem.MolToSmiles(editable)
        except Exception:
            return None
        attachment = match[core_index] if core_index < len(match) else None
        results.append((smiles, attachment))
    return results


def describe_difference(query_mol, neighbour_mol) -> tuple[str | None, str, str | None]:
    """Name the single substituent that separates two molecules.

    Returns (substituent name or None, reason, location clause). The location clause is
    " on the aromatic ring", " on the ring" or "" and is only meaningful when a name is found.
    """
    query_atoms = query_mol.GetNumHeavyAtoms()
    neighbour_atoms = neighbour_mol.GetNumHeavyAtoms()
    if max(query_atoms, neighbour_atoms) > MCS_MAX_HEAVY_ATOMS:
        return None, "molecule larger than the maximum common substructure size limit", None
    if abs(query_atoms - neighbour_atoms) > MCS_MAX_HEAVY_ATOM_DELTA:
        return None, "heavy-atom difference larger than a single substituent", None
    try:
        result = rdFMCS.FindMCS(
            [query_mol, neighbour_mol],
            timeout=MCS_TIMEOUT_SECONDS,
            ringMatchesRingOnly=True,
            completeRingsOnly=True,
        )
    except Exception:
        return None, "maximum common substructure search failed", None
    if result.canceled or not result.smartsString:
        return None, "maximum common substructure search did not complete", None
    core = Chem.MolFromSmarts(result.smartsString)
    if core is None:
        return None, "maximum common substructure is not a usable query", None
    query_match = query_mol.GetSubstructMatch(core)
    neighbour_match = neighbour_mol.GetSubstructMatch(core)
    if not query_match or not neighbour_match:
        return None, "maximum common substructure does not match both molecules", None

    query_chains = side_chains(query_mol, core, query_match)
    neighbour_chains = side_chains(neighbour_mol, core, neighbour_match)
    if query_chains is None or neighbour_chains is None:
        return None, "side chains off the common core could not be isolated", None

    if len(query_chains) == 1 and len(neighbour_chains) == 0:
        chain, parent = query_chains[0], query_mol
        attachment_index = query_chains[0][1]
    elif len(neighbour_chains) == 1 and len(query_chains) == 0:
        chain, parent = neighbour_chains[0], neighbour_mol
        attachment_index = neighbour_chains[0][1]
    else:
        return (
            None,
            "the two molecules differ on both sides of the common core, which is not a "
            "single added substituent",
            None,
        )

    name = CANONICAL_SUBSTITUENTS.get(chain[0])
    if not name:
        return None, "the differing group is not in the named-substituent table", None

    location = ""
    if attachment_index is not None and attachment_index < parent.GetNumAtoms():
        atom = parent.GetAtomWithIdx(attachment_index)
        if atom.GetIsAromatic():
            location = " on the aromatic ring"
        elif atom.IsInRing():
            location = " on the ring"
    return name, "named", location


def name_difference_from_smiles(pair):
    """Pool worker: (query key, query SMILES, neighbour SMILES) -> (key, name, reason, location)."""
    key, query_smiles, neighbour_smiles = pair
    query_mol = Chem.MolFromSmiles(query_smiles)
    neighbour_mol = Chem.MolFromSmiles(neighbour_smiles)
    if query_mol is None or neighbour_mol is None:
        return key, None, "structure could not be parsed", None
    name, reason, location = describe_difference(query_mol, neighbour_mol)
    return key, name, reason, location


def target_display_name(target_id: str, fact: dict, names_by_id: dict[str, str]) -> str:
    pref_name = fact["mechanismTargets"].get(target_id) or names_by_id.get(
        target_id, target_id
    )
    symbol = fact["targetSymbols"].get(pref_name)
    return symbol or pref_name


def main() -> int:
    started = time.time()
    as_of = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    issues: list[str] = []

    print("reading tiers, names, structures", file=sys.stderr, flush=True)
    tiers, models = load_tiers()
    display_names = load_display_names()
    structures = load_structures()
    relations = load_relations()
    print("reading fields-v2", file=sys.stderr, flush=True)
    facts, page_counts, assay_types_seen = read_page_facts()
    print("reading registry aggregates", file=sys.stderr, flush=True)
    per_trial = load_per_trial()
    moved_from, moved_to = load_trial_reassignments()

    suppressed: set[str] = set()
    with SUPPRESSION.open() as handle:
        for line in handle:
            record = json.loads(line)
            if record.get("suppressed"):
                suppressed.add(record["key"])

    missing_structure_keys = [key for key in structures if key not in facts]
    if missing_structure_keys:
        issues.append(
            f"{len(missing_structure_keys)} keys hold a structure in canonical-v2.ndjson but "
            "no field record in fields-v2; they are excluded from every section"
        )
    for key in missing_structure_keys:
        structures.pop(key)

    if CANONICAL_V3.exists():
        successor_keys = set()
        with CANONICAL_V3.open() as handle:
            for line in handle:
                successor_keys.add(json.loads(line)["key"])
        current_keys = set()
        with CANONICAL.open() as handle:
            for line in handle:
                current_keys.add(json.loads(line)["key"])
        dropped = current_keys - successor_keys
        issues.append(
            f"page identity is read from {CANONICAL}, which the rest of Phase 4 reads; "
            f"{CANONICAL_V3} exists and carries {len(successor_keys)} keys against "
            f"{len(current_keys)}, dropping {len(dropped)} of them and adding "
            f"{len(successor_keys - current_keys)}. Trial reassignments already read the v3 "
            "file. Re-running this step against the v3 spine is a one-command change and the "
            "counts above name what it would move"
        )

    pages_without_structure = page_counts["pages"] - len(structures)
    issues.append(
        f"{pages_without_structure} of {page_counts['pages']} pages record no structure in "
        "canonical-v2.ndjson, so the nearest-approved-neighbour section cannot fire on them; "
        "the missing structure is stated on the page rather than filled"
    )

    unknown_assay_types = [t for t in assay_types_seen if t not in ASSAY_TYPE_WORDS]
    if unknown_assay_types:
        issues.append(
            "ChEMBL assay types with no plain-language word: "
            + ", ".join(unknown_assay_types)
            + "; potency rows on those assay types do not fire"
        )

    # ---- relation adjacency and form-of notes -------------------------------------------
    linked: dict[str, set[str]] = defaultdict(set)
    for page_a, page_b in zip(relations["page_a"], relations["page_b"]):
        linked[page_a].add(page_b)
        linked[page_b].add(page_a)

    form_rows = relations[relations["relation"].isin(IS_FORM_RELATIONS)].copy()
    form_rows["order"] = form_rows["relation"].map(IS_FORM_ORDER)
    form_rows = form_rows.sort_values(["page_a", "order", "page_b"], kind="stable")

    rows: list[dict] = []
    fired: dict[str, dict[str, set[str]]] = {
        section: defaultdict(set)
        for section in ("neighbour", "potency", "timeline", "formOf")
    }
    sentence_counts: Counter = Counter()
    decision_counts: Counter = Counter()

    def emit(page: str, section: str, template_id: str, sentence: str, values: dict, provenance_fields: dict) -> None:
        values = dict(values)
        values["tier"] = tiers.get(page)
        values["sentence"] = sentence
        rows.append(
            {
                "page": page,
                "section": section,
                "values": json.dumps(values, sort_keys=True, ensure_ascii=False),
                "provenance": json.dumps(
                    {"sentence": sentence, "fields": provenance_fields},
                    sort_keys=True,
                    ensure_ascii=False,
                ),
                "sentence_template_id": template_id,
            }
        )
        fired[section][str(tiers.get(page))].add(page)
        sentence_counts[template_id] += 1

    # ---- (a) nearest approved structural neighbour ---------------------------------------
    print("fingerprinting", file=sys.stderr, flush=True)
    fingerprints, fingerprint_counts = build_fingerprints(structures)
    if fingerprint_counts["unparseable_smiles"]:
        issues.append(
            f"{fingerprint_counts['unparseable_smiles']} recorded SMILES strings RDKit could "
            "not parse; those pages hold no fingerprint and fire no neighbour section"
        )

    reference_keys = sorted(
        key for key in fingerprints if key in facts and approved(facts[key])
    )
    reference_index = {key: position for position, key in enumerate(reference_keys)}
    reference_fps = [fingerprints[key] for key in reference_keys]
    approved_reference_set = len(reference_keys)
    approved_total = sum(1 for key, fact in facts.items() if approved(fact))

    if not reference_keys:
        issues.append(
            "the approved reference set is empty; the nearest-approved-neighbour section "
            "cannot fire on any page"
        )

    query_keys = sorted(fingerprints)
    substituent_reasons: Counter = Counter()
    matches: list[tuple[str, str, float, int]] = []

    for position_in_run, query in enumerate(query_keys, start=1):
        if not reference_fps:
            break
        if position_in_run % 2000 == 0:
            print(
                f"  neighbour scan {position_in_run}/{len(query_keys)}",
                file=sys.stderr,
                flush=True,
            )
        similarities = numpy.asarray(
            BulkTanimotoSimilarity(fingerprints[query], reference_fps), dtype=float
        )
        self_position = reference_index.get(query)
        without_self = similarities
        if self_position is not None:
            without_self = similarities.copy()
            without_self[self_position] = -1.0
        relation_positions = [
            reference_index[other]
            for other in linked.get(query, ())
            if other in reference_index and reference_index[other] != self_position
        ]
        if relation_positions:
            filtered = without_self.copy()
            filtered[relation_positions] = -1.0
        else:
            filtered = without_self

        best_position = int(filtered.argmax())
        best = float(filtered[best_position])
        if best < NEIGHBOUR_THRESHOLD:
            continue
        if relation_positions:
            unfiltered_position = int(without_self.argmax())
            if (
                float(without_self[unfiltered_position]) >= NEIGHBOUR_THRESHOLD
                and unfiltered_position != best_position
            ):
                decision_counts["D1_top_match_changed_by_relation_exclusion"] += 1
        matches.append(
            (query, reference_keys[best_position], best, len(relation_positions))
        )

    print(f"  neighbour matches at or over {NEIGHBOUR_THRESHOLD}: {len(matches)}", file=sys.stderr, flush=True)

    work = [
        (query, structures[query], structures[neighbour])
        for query, neighbour, _, _ in matches
    ]
    described: dict[str, tuple[str | None, str, str | None]] = {}
    if work:
        with multiprocessing.Pool(processes=max(1, multiprocessing.cpu_count() - 1)) as pool:
            for done, (key, name, reason, location) in enumerate(
                pool.imap_unordered(name_difference_from_smiles, work, chunksize=16),
                start=1,
            ):
                described[key] = (name, reason, location)
                if done % 2000 == 0:
                    print(
                        f"  substituent naming {done}/{len(work)}",
                        file=sys.stderr,
                        flush=True,
                    )

    for query, best_key, best, relation_excluded in matches:
        neighbour_fact = facts[best_key]
        status_clause, status_values = neighbour_status_clause(neighbour_fact)
        if not status_clause:
            issues.append(
                f"approved reference page {best_key} yielded no status clause; it is skipped "
                "as a neighbour"
            )
            continue
        neighbour_name = display_names.get(best_key, best_key)
        similarity_text = f"{best:.2f}"
        name, reason, location = described.get(query, (None, "not attempted", None))
        substituent_reasons[reason] += 1

        values = {
            "neighbourPage": best_key,
            "neighbourName": neighbour_name,
            "similarity": round(float(best), 4),
            "similarityRendered": similarity_text,
            "fingerprint": "Morgan, radius 2, 2048 bits",
            "referenceSetSize": approved_reference_set,
            "relationLinkedPagesExcluded": relation_excluded,
            "status": status_values,
            "substituentReason": reason,
        }
        provenance_fields = {
            neighbour_name: (
                "data/revamp/identity/canonical-v2.ndjson displayName "
                f"(key {best_key}), disambiguated by "
                "data/revamp/identity/display-names.csv where that file names the key"
            ),
            similarity_text: (
                "computed: RDKit Morgan fingerprint, radius 2, 2048 bits, Tanimoto between "
                "canonical-v2.ndjson structure.smiles of this page and of the neighbour"
            ),
            status_clause: (
                "data/revamp/fields-v2 regulatory.value.{US,EU,JP,CA}.status and "
                "regulatory.value.curatedMarketingStatusByJurisdiction[].statusCounts for the "
                "approval; withdrawal.value.withdrawn for the withdrawal; "
                "patentStatus.value.orangeBookSummary."
                "all_products_containing_this_substance.generic_product_count and "
                "first_generic_approval_date for the generic — all read on the neighbour page "
                f"{best_key}"
            ),
        }
        if name:
            values["substituent"] = name
            values["substituentLocation"] = (location or "").strip() or None
            provenance_fields[name] = (
                "computed: RDKit rdFMCS maximum common substructure between the two "
                "canonical-v2.ndjson structure.smiles strings, the single residual side chain "
                "matched against the named-substituent table in this script"
            )
            sentence = TEMPLATES["t3-neighbour-substituent-v1"].format(
                neighbour=neighbour_name,
                similarity=similarity_text,
                substituent=name,
                location=location or "",
                status=status_clause,
            )
            emit(query, "neighbour", "t3-neighbour-substituent-v1", sentence, values, provenance_fields)
        else:
            sentence = TEMPLATES["t3-neighbour-similarity-v1"].format(
                neighbour=neighbour_name,
                similarity=similarity_text,
                status=status_clause,
            )
            emit(query, "neighbour", "t3-neighbour-similarity-v1", sentence, values, provenance_fields)

    # ---- primary target per page ---------------------------------------------------------
    target_names: dict[str, str] = {}
    for fact in facts.values():
        for target_id, pref_name in fact["mechanismTargets"].items():
            target_names.setdefault(target_id, pref_name)

    # A canonical target key. The `target` field exists only on the DEVELOPMENT model, so a
    # mechanism target recorded as a ChEMBL target id on a Tier 3 page and the same protein
    # recorded as a UniProt accession on an approved page would never meet. The DEVELOPMENT
    # records carry the bridge themselves, in target.value.mergedTargets[].evidence[]
    # .chemblTargetIds against the merged target's UniProt accession, so the two are joined on
    # that stored cross-reference. A ChEMBL target that bridges to more than one accession is a
    # complex or a family and keeps its ChEMBL key, which only another ChEMBL id can match.
    chembl_to_uniprot: dict[str, set[str]] = defaultdict(set)
    for fact in facts.values():
        for chembl_id, accessions in fact["chemblToUniprot"].items():
            chembl_to_uniprot[chembl_id].update(accessions)

    def canonical_target(chembl_id: str) -> str:
        accessions = chembl_to_uniprot.get(chembl_id) or set()
        if len(accessions) == 1:
            return "uniprot:" + next(iter(accessions))
        return "chembl:" + chembl_id

    target_to_pages: dict[str, set[str]] = defaultdict(set)
    for key, fact in facts.items():
        for target_id in fact["mechanismTargets"]:
            target_to_pages[canonical_target(target_id)].add(key)
        for accession in fact["uniprotTargets"]:
            target_to_pages["uniprot:" + accession].add(key)

    primary_target: dict[str, str] = {}
    for key, fact in facts.items():
        mechanism = fact["mechanismTargets"]
        if not mechanism:
            continue
        activity = Counter()
        for group in fact["assayGroups"]:
            if group["targetChemblId"] in mechanism:
                activity[group["targetChemblId"]] += group["n"]
        if activity:
            best_count = max(activity.values())
            candidates = sorted(t for t, n in activity.items() if n == best_count)
        else:
            candidates = sorted(mechanism)
        primary_target[key] = candidates[0]

    potency_without_mechanism_target = sum(
        1
        for key, fact in facts.items()
        if fact["assayGroups"] and not fact["mechanismTargets"]
    )
    if potency_without_mechanism_target:
        issues.append(
            f"{potency_without_mechanism_target} pages hold a pChEMBL value but record no "
            "ChEMBL mechanism target, so they have no primary target and fire no potency rank"
        )

    # ---- (b) potency rank ----------------------------------------------------------------
    groups: dict[tuple[str, str], dict[str, dict]] = defaultdict(dict)
    for key, fact in facts.items():
        by_group: dict[tuple[str, str], list[dict]] = defaultdict(list)
        for group in fact["assayGroups"]:
            by_group[(group["targetChemblId"], group["assayType"])].append(group)
        for group_key, entries in by_group.items():
            weight = sum(entry["n"] for entry in entries)
            if not weight:
                continue
            value = sum(entry["medianPChembl"] * entry["n"] for entry in entries) / weight
            groups[group_key][key] = {
                "pchembl": value,
                "n": weight,
                "standardTypes": sorted(
                    {entry["standardType"] for entry in entries if entry["standardType"]}
                ),
            }

    strict_comparator_fires = 0
    potency_candidates: dict[str, list[dict]] = defaultdict(list)
    for (target_id, assay_type), members in groups.items():
        if assay_type not in ASSAY_TYPE_WORDS:
            continue
        group_size = len(members)
        if group_size < POTENCY_MIN_GROUP:
            continue
        ordered = sorted(
            members.items(), key=lambda item: (-item[1]["pchembl"], item[0])
        )
        ranks: dict[str, int] = {}
        previous_value = None
        for position, (key, entry) in enumerate(ordered, start=1):
            if previous_value is not None and math.isclose(
                entry["pchembl"], previous_value, rel_tol=0.0, abs_tol=1e-9
            ):
                ranks[key] = ranks[ordered[position - 2][0]]
            else:
                ranks[key] = position
            previous_value = entry["pchembl"]

        for key, entry in members.items():
            if primary_target.get(key) != target_id:
                continue
            rank = ranks[key]
            percentile = round((group_size - rank) / group_size * 100)
            name = display_names.get(key, key)
            target_name = target_display_name(target_id, facts[key], target_names)
            assay_word = ASSAY_TYPE_WORDS[assay_type]
            sentence = TEMPLATES["t3-potency-rank-v1"].format(
                n=group_size,
                target=target_name,
                assay=assay_word,
                name=name,
                rank=ordinal(rank),
                percentile=ordinal(percentile),
            )
            values = {
                "targetChemblId": target_id,
                "targetName": target_name,
                "assayType": assay_type,
                "assayTypeWord": assay_word,
                "standardTypes": entry["standardTypes"],
                "comparatorCount": group_size,
                "comparatorsBesidesThisPage": group_size - 1,
                "rank": rank,
                "percentile": percentile,
                "pchembl": round(entry["pchembl"], 3),
                "pchemblBasis": (
                    "n-weighted mean of the ChEMBL per-standard-type median pChEMBL values "
                    "this page holds against this target in this assay type"
                ),
                "activityCount": entry["n"],
            }
            provenance_fields = {
                str(group_size): (
                    "computed: the number of corpus pages holding a fields-v2 "
                    "potency.value.assayGroups entry with this targetChemblId and assayType"
                ),
                target_name: (
                    "data/revamp/fields-v2 target.value.chemblTargets[].prefName.prefName, "
                    "with the gene symbol from target.value.openTargetsTargets[].symbol where "
                    "the Open Targets record names the same target"
                ),
                assay_word: (
                    "data/revamp/fields-v2 potency.value.assayGroups[].assayType"
                ),
                name: "data/revamp/identity/canonical-v2.ndjson displayName",
                ordinal(rank): (
                    "computed: descending rank of this page's n-weighted mean pChEMBL among "
                    "the comparator group"
                ),
                ordinal(percentile): (
                    "computed: round((group size - rank) / group size x 100)"
                ),
            }
            potency_candidates[key].append(
                {
                    "sortKey": (-group_size, -entry["n"], assay_type),
                    "sentence": sentence,
                    "values": values,
                    "provenance": provenance_fields,
                    "assayTypeWord": assay_word,
                    "comparatorCount": group_size,
                }
            )

    for key, candidates in potency_candidates.items():
        candidates.sort(key=lambda candidate: candidate["sortKey"])
        chosen = candidates[0]
        values = dict(chosen["values"])
        values["assayTypesNotRendered"] = [
            {
                "assayType": other["values"]["assayType"],
                "comparatorCount": other["values"]["comparatorCount"],
                "rank": other["values"]["rank"],
                "percentile": other["values"]["percentile"],
            }
            for other in candidates[1:]
        ]
        emit(key, "potency", "t3-potency-rank-v1", chosen["sentence"], values, chosen["provenance"])
        if chosen["comparatorCount"] - 1 >= POTENCY_MIN_GROUP:
            strict_comparator_fires += 1

    # ---- (c) activity timeline -----------------------------------------------------------
    approval_year_by_page = {
        key: earliest_approval_year(fact) for key, fact in facts.items()
    }

    trials_by_target: dict[str, list[dict]] = {}

    trial_facts: dict[str, dict] = {}
    for rows_for_page in per_trial.values():
        for row in rows_for_page:
            trial_facts.setdefault(row["nct"], row)

    def target_trials(target_key: str) -> list[dict]:
        cached = trials_by_target.get(target_key)
        if cached is not None:
            return cached
        pages = target_to_pages.get(target_key, set())
        seen: dict[str, dict] = {}
        for page in pages:
            for row in per_trial.get(page, ()):
                nct = row["nct"]
                if page in moved_from.get(nct, ()) and page not in moved_to.get(nct, ()):
                    continue
                seen.setdefault(nct, row)
        for nct, destinations in moved_to.items():
            if nct in seen or not (destinations & pages):
                continue
            row = trial_facts.get(nct)
            if row:
                seen[nct] = row
        dated = [row for row in seen.values() if row.get("completionDate") and row.get("status")]
        dated.sort(key=lambda row: (str(row["completionDate"]), row["nct"]))
        trials_by_target[target_key] = dated
        return dated

    corpus_org_latest: dict[str, str] = {}
    for fact in facts.values():
        for record in fact["sponsorRecords"]:
            latest = record.get("latest") or record.get("earliest")
            if not latest:
                continue
            for sponsor in record["sponsors"]:
                previous = corpus_org_latest.get(sponsor)
                if previous is None or str(latest) > previous:
                    corpus_org_latest[sponsor] = str(latest)

    for key, fact in facts.items():
        name = display_names.get(key, key)
        first_year, last_year = fact["firstYear"], fact["lastYear"]
        if first_year and last_year:
            sentence = TEMPLATES["t3-timeline-publication-span-v1"].format(
                first=first_year, last=last_year
            )
            values = {
                "firstYear": first_year,
                "lastYear": last_year,
                "documentCount": fact["documentCount"],
                "moleculeChemblId": fact["moleculeChemblId"],
            }
            provenance_fields = {
                str(first_year): (
                    "data/revamp/fields-v2 publicationYears.value.firstYear "
                    "(ChEMBL 37 compound_record document years)"
                ),
                str(last_year): (
                    "data/revamp/fields-v2 publicationYears.value.lastYear "
                    "(ChEMBL 37 compound_record document years)"
                ),
            }
            emit(
                key,
                "timeline",
                "t3-timeline-publication-span-v1",
                sentence,
                values,
                provenance_fields,
            )

        target_id = primary_target.get(key)
        validated_page = None
        validated_year = None
        headwind_trials: list[dict] = []
        canonical_id = canonical_target(target_id) if target_id else None
        if canonical_id and last_year:
            for other in sorted(target_to_pages.get(canonical_id, ())):
                if other == key:
                    continue
                other_fact = facts[other]
                if not approved(other_fact):
                    continue
                year = approval_year_by_page.get(other)
                if year is not None and year > last_year:
                    if validated_year is None or year < validated_year:
                        validated_year, validated_page = year, other
        if canonical_id and validated_page is None:
            dated = target_trials(canonical_id)
            if len(dated) >= 3:
                latest_three = dated[-3:]
                if all(row["status"] in STOPPED_STATUSES for row in latest_three):
                    headwind_trials = latest_three

        if canonical_id and (validated_page or headwind_trials):
            target_name = target_display_name(target_id, fact, target_names)
            if validated_page:
                sentence = TEMPLATES["t3-timeline-target-validated-v1"].format(
                    target=target_name
                )
                values = {
                    "targetChemblId": target_id,
                    "targetKey": canonical_id,
                    "targetName": target_name,
                    "validatedByPage": validated_page,
                    "validatedByName": display_names.get(validated_page, validated_page),
                    "approvalYear": validated_year,
                    "pageLastPublicationYear": last_year,
                    "pagesSharingTarget": len(target_to_pages.get(canonical_id, ())),
                    "targetHeadwind": False,
                }
                provenance_fields = {
                    target_name: (
                        "data/revamp/fields-v2 target.value.chemblTargets[].prefName.prefName "
                        "with the Open Targets gene symbol where recorded"
                    ),
                    "An approved drug has since been approved": (
                        "data/revamp/fields-v2 regulatory.value.{US,EU,JP,CA}.status and "
                        "regulatory.value.curatedMarketingStatusByJurisdiction[].statusCounts "
                        f"on page {validated_page}, with its earliest recorded approval date "
                        f"({validated_year}) from regulatory.value.{{US,EU}}.approvalDate.date "
                        "or curatedMarketingStatusByJurisdiction[].earliestRecordedDate, "
                        "compared against this page's publicationYears.value.lastYear"
                    ),
                }
                emit(
                    key,
                    "timeline",
                    "t3-timeline-target-validated-v1",
                    sentence,
                    values,
                    provenance_fields,
                )
            else:
                sentence = TEMPLATES["t3-timeline-target-headwind-v1"].format(
                    target=target_name
                )
                values = {
                    "targetChemblId": target_id,
                    "targetKey": canonical_id,
                    "targetName": target_name,
                    "trials": headwind_trials,
                    "pagesSharingTarget": len(target_to_pages.get(canonical_id, ())),
                    "datedTrialsOnTarget": len(trials_by_target.get(canonical_id, [])),
                    "targetValidated": False,
                }
                provenance_fields = {
                    target_name: (
                        "data/revamp/fields-v2 target.value.chemblTargets[].prefName.prefName "
                        "with the Open Targets gene symbol where recorded"
                    ),
                    "terminated or withdrawn": (
                        "data/corpus-20k/registry/aggregates perTrial[].status and "
                        "perTrial[].completionDate over every page sharing this mechanism "
                        "target, deduplicated by NCT and reassigned by "
                        "data/revamp/identity/trial-reassignments.csv; the three latest dated "
                        "trials are "
                        + ", ".join(
                            f"{row['nct']} ({row['status']}, {row['completionDate']})"
                            for row in headwind_trials
                        )
                    ),
                }
                emit(
                    key,
                    "timeline",
                    "t3-timeline-target-headwind-v1",
                    sentence,
                    values,
                    provenance_fields,
                )

        dated_sponsor_records = [
            record for record in fact["sponsorRecords"] if record.get("earliest")
        ]
        if dated_sponsor_records:
            dated_sponsor_records.sort(
                key=lambda record: (str(record["earliest"]), record["jurisdiction"])
            )
            earliest_record = dated_sponsor_records[0]
            names_one_organisation = len(earliest_record["sponsors"]) == 1 and not any(
                separator in earliest_record["sponsors"][0] for separator in ("|", ";")
            )
            if names_one_organisation:
                organisation = earliest_record["sponsors"][0]
                organisation_rendered = re.sub(r"\.$", "", organisation.strip())
                latest_anywhere = corpus_org_latest.get(organisation)
                latest_year = year_of(latest_anywhere)
                no_recent_record = (
                    latest_year is not None and latest_year <= ORIGINATOR_RECENT_YEAR
                )
                template_id = (
                    "t3-timeline-originator-no-recent-record-v1"
                    if no_recent_record
                    else "t3-timeline-originator-v1"
                )
                sentence = TEMPLATES[template_id].format(
                    organisation=organisation_rendered
                )
                values = {
                    "organisation": organisation,
                    "organisationRendered": organisation_rendered,
                    "earliestRecordedDate": earliest_record["earliest"],
                    "jurisdiction": earliest_record["jurisdiction"],
                    "upstreamRegisters": earliest_record["upstreamRegisters"],
                    "latestRecordedDateAnywhereInCorpus": latest_anywhere,
                    "noRecordAfter2020": bool(no_recent_record),
                }
                provenance_fields = {
                    organisation_rendered: (
                        "data/revamp/fields-v2 regulatory.value."
                        "curatedMarketingStatusByJurisdiction[].sponsors on the record with "
                        "the earliest earliestRecordedDate for this page (NCATS Inxight Drugs)"
                    )
                }
                if no_recent_record:
                    provenance_fields["no record after 2020"] = (
                        "computed: the latest latestRecordedDate on any Inxight marketing "
                        "record naming this organisation anywhere in the corpus is "
                        f"{latest_anywhere}"
                    )
                emit(key, "timeline", template_id, sentence, values, provenance_fields)
            elif len(earliest_record["sponsors"]) == 1:
                decision_counts["D6_packed_sponsor_string_on_earliest_record"] += 1
            else:
                decision_counts["D6_multiple_sponsors_on_earliest_record"] += 1

    # ---- (d) form-of note ----------------------------------------------------------------
    withheld_relation_notes = 0
    for page_a, group in form_rows.groupby("page_a", sort=True):
        if page_a not in facts:
            continue
        records = group.to_dict("records")
        rendered: list[tuple[dict, str]] = []
        for record in records:
            note = render_relation_note(record.get("note"))
            if note is None:
                withheld_relation_notes += 1
                continue
            rendered.append((record, note))
        inline = rendered[:FORM_OF_INLINE_LIMIT]
        remainder = len(rendered) - len(inline)
        for record, note in inline:
            values = {
                "relation": record["relation"],
                "counterpartPage": record["page_b"],
                "counterpartName": display_names.get(record["page_b"], record["page_b"]),
                "rule": record["rule"],
                "evidence": record.get("evidence"),
                "additionalRelationCount": remainder,
                "relationsRecorded": len(records),
                "noteVerbatim": record.get("note"),
            }
            provenance_fields = {
                note: (
                    f"{relations.attrs['path']} note, for the "
                    f"{record['relation']} relation resolved by Phase 3 rule "
                    f"{record['rule']}, with the trailing identity-spec clause removed"
                )
            }
            emit(page_a, "formOf", "t3-form-of-note-v1", sentence=note, values=values, provenance_fields=provenance_fields)

    # ---- write ---------------------------------------------------------------------------
    frame = pd.DataFrame(
        rows,
        columns=["page", "section", "values", "provenance", "sentence_template_id"],
    )
    OUT_PARQUET.parent.mkdir(parents=True, exist_ok=True)
    pq.write_table(pa.Table.from_pandas(frame, preserve_index=False), OUT_PARQUET)

    def tier_breakdown(section: str) -> dict:
        pages = fired[section]
        tier1 = len(pages.get("1", set()))
        tier2 = len(pages.get("2", set()))
        tier3 = len(pages.get("3", set()))
        return {
            "tier1": tier1,
            "tier2": tier2,
            "tier3": tier3,
            "other": tier1 + tier2,
            "total": tier1 + tier2 + tier3,
            "suppressedPages": len(
                {page for group in pages.values() for page in group} & suppressed
            ),
        }

    issues.append(
        "`target` is a DEVELOPMENT-model field: "
        f"{sum(1 for fact in facts.values() if fact['mechanismTargets'])} pages record a ChEMBL "
        "mechanism target and every one of them is Tier 3, so a primary target — and with it "
        "the potency rank and the target sentences — can only be established on a Tier 3 page. "
        "CLINICAL and LONGEVITY pages carry UniProt target accessions under "
        "identifiers.uniprotTargets; those join the target index as comparators and as approved "
        "drugs against the target, but they give those pages no primary target of their own"
    )
    if substituent_reasons.get("maximum common substructure search did not complete"):
        issues.append(
            f"{substituent_reasons['maximum common substructure search did not complete']} "
            f"maximum common substructure searches hit the {MCS_TIMEOUT_SECONDS}-second limit; "
            "those sentences carry the similarity and the neighbour's status without a named "
            "substituent"
        )
    if decision_counts.get("D6_multiple_sponsors_on_earliest_record"):
        issues.append(
            f"{decision_counts['D6_multiple_sponsors_on_earliest_record']} pages name more than "
            "one sponsor on their earliest dated Inxight marketing record, so no single "
            "originating organisation is stated for them"
        )

    counts = {
        "schema": "rnawiki-revamp-tier3-sections/v1",
        "generatedAt": as_of,
        "runSeconds": round(time.time() - started, 1),
        "inputs": {
            "fields": FIELDS_GLOB,
            "structures": str(CANONICAL),
            "displayNames": str(DISPLAY_NAMES),
            "relations": relations.attrs["path"],
            "tiers": str(SPINE),
            "models": str(MODEL_ASSIGNMENT),
            "registryPerTrial": str(REGISTRY_AGGREGATES),
            "trialReassignments": str(trial_reassignment_path()),
            "suppression": str(SUPPRESSION),
        },
        "outputs": {"parquet": str(OUT_PARQUET), "counts": str(OUT_COUNTS)},
        "corpus": {
            "pagesInFields": page_counts["pages"],
            "pagesWithStructure": len(structures),
            "pagesFingerprinted": fingerprint_counts["fingerprinted"],
            "tierCounts": dict(Counter(tiers.values())),
        },
        "approvedReferenceSet": {
            "definition": (
                "a fields-v2 regulatory US, EU, JP or CA block whose status is approved, or an "
                "NCATS Inxight marketing record carrying a USApprovalRx, USApprovalOTC or "
                "USApprovalAllergenic status"
            ),
            "approvedPages": approved_total,
            "approvedPagesWithAStructure": approved_reference_set,
        },
        "fired": {section: tier_breakdown(section) for section in fired},
        "sentences": dict(sorted(sentence_counts.items())),
        "templates": TEMPLATES,
        "templateToSpec": {
            "t3-neighbour-substituent-v1": "phase4-generators.md §8 bullet 1, full wording",
            "t3-neighbour-similarity-v1": (
                "phase4-generators.md §8 bullet 1, the wording with the substituent clause "
                "dropped because RDKit could not name the difference"
            ),
            "t3-potency-rank-v1": "phase4-generators.md §8 bullet 2",
            "t3-timeline-publication-span-v1": "phase4-generators.md §8 bullet 3, sentence 1",
            "t3-timeline-target-validated-v1": (
                "phase4-generators.md §8 bullet 3, sentence 2, validated branch"
            ),
            "t3-timeline-target-headwind-v1": (
                "phase4-generators.md §8 bullet 3, sentence 2, headwind branch"
            ),
            "t3-timeline-originator-v1": (
                "phase4-generators.md §8 bullet 3, sentence 3, without the parenthetical"
            ),
            "t3-timeline-originator-no-recent-record-v1": (
                "phase4-generators.md §8 bullet 3, sentence 3, with the parenthetical"
            ),
            "t3-form-of-note-v1": (
                "phase4-generators.md §8 bullet 4; the wording is the Phase 3 relation note "
                "verbatim"
            ),
        },
        "neighbourSubstituentOutcomes": dict(sorted(substituent_reasons.items())),
        "potency": {
            "comparatorGroups": len(groups),
            "groupsAtOrOverFive": sum(
                1
                for group_key, members in groups.items()
                if len(members) >= POTENCY_MIN_GROUP
                and group_key[1] in ASSAY_TYPE_WORDS
            ),
            "assayTypesSeen": assay_types_seen,
            "firesUnderStricterFiveComparatorReading": strict_comparator_fires,
        },
        "formOf": {
            "relationsInIsFormDirection": int(len(form_rows)),
            "notesWithheldForARecordIdInProse": withheld_relation_notes,
        },
        "decisions": dict(sorted(decision_counts.items())),
        "issues": issues,
    }
    OUT_COUNTS.write_text(json.dumps(counts, indent=2, ensure_ascii=False) + "\n")

    print(json.dumps({k: counts[k] for k in ("fired", "approvedReferenceSet", "sentences")}, indent=2))
    print(f"rows: {len(frame)} -> {OUT_PARQUET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
