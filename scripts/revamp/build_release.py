#!/usr/bin/env python
"""Build the open corpus release candidate — revamp step 6.5.

What this produces is the redistributable part of the corpus: identity, the field values whose
sources permit redistribution and commercial use, the interaction table with its rule ids, the
registration/patent/controlled blocks, the Tier 3 sections, and the derived sections — with a
README that states the schema and the licence of every field, a LICENSES.md copied from the
repository's own licence record, a CITATION.cff, and a SHA256SUMS over every file.

The licence gate
----------------
`docs/data/LICENSES.md` records, per source, whether redistribution and commercial use are
permitted. A value enters the release only when its source's row says yes to both and the grant is
a licence, not a case-by-case permission. Those grants fall into four classes, all of them
compatible with redistributing the record under attribution:

  public-domain   US Government works and CC0 dedications (ClinicalTrials.gov, openFDA/DailyMed,
                  Drugs@FDA, the Orange and Purple Books, GSRS, PubChem, NCATS Inxight, PubMed
                  metadata, Open Targets)
  cc-by           UniProt (CC BY 4.0); the Poisons Standard (SUSMP) from the Federal Register of
                  Legislation (CC BY 4.0)
  cc-by-sa        ChEMBL (3.0), DrugCentral (4.0), IUPHAR/BPS Guide to PHARMACOLOGY (4.0)
  open-attribution  open government licences that grant redistribution and commercial use in
                  their own words rather than through Creative Commons: the Singapore Open Data
                  Licence 1.0 (HSA), the AGC clause-13 permission for Singapore Statutes Online,
                  the EMA copyright and limited reproduction notice, Japan's Public Data License
                  1.0 (PMDA), the Open Government Licence – Canada 2.0 (Health Canada), and the
                  JAX Mouse Phenome Database terms for the NIA ITP workbooks

The fourth class is a deliberate reading of step 6.5, which asks for "public domain, CC BY or
CC BY-SA … excludes DDInter and anything non-commercial or unresolved". Read literally the first
clause would drop Singapore registration status — the Open Data Licence the spec's own mission
paragraph cites as "commercial use permitted", and the gap this run existed to close — while the
second clause, which is the test the step then applies, keeps it. Both clauses are satisfied by
including grants that permit redistribution and commercial use, and the release names the licence
of every field so a reader can drop the fourth class if they read it differently. Each source is
listed with its class in README.md; moving a token in SOURCE_LICENCES to `excluded` removes it.

Excluded, with the reason recorded in the release's own README and in exclusions.json:

  DDInter 2.0            CC BY-NC-SA 4.0. Never joined to the corpus at all; held for validation
                         only at data/validation/ddinter and read by nothing here.
  ClinPGx / PharmGKB     CC BY-SA 4.0 with two added conditions ("Under no circumstances can
                         ClinPGx data be sold", and a research-purpose term). Those rows live in
                         data/revamp/fields-v2-gated, which this script never opens.
  Europe PMC             The reusable grant covers metadata and abstracts, but the values are
                         verbatim sentences whose licence is the individual article's and is not
                         established per record.
  MHRA / emc             No reuse licence; nothing was ever retrieved.
  TGA ARTG               All rights reserved, commercial use refused; nothing was ever retrieved.
                         The Australian scheduling data in the corpus is the Poisons Standard from
                         the Federal Register of Legislation, CC BY 4.0, which is a different
                         source and is included.
  WITHDRAWN database     Licence not established; nothing was ever retrieved. The withdrawal
                         reasons in the corpus are ChEMBL 37 drug_warning records, CC BY-SA 3.0.
  DrugBank identifiers   No DrugBank licence is held, so the drugbankId carried on legacy identity
                         records is dropped from pages.ndjson.

A source token this table does not know is a hard failure that names the page and the field, so a
new source cannot enter a release unexamined.

Usage:
  .venv-corpus/bin/python scripts/revamp/build_release.py
  .venv-corpus/bin/python scripts/revamp/build_release.py --date 2026-09-06 --no-tarball

Exit codes: 0 success, 2 a required input is missing, 3 an unknown source token was found.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path

import pandas

REPO_ROOT = Path(__file__).resolve().parents[2]
REVAMP = REPO_ROOT / "data" / "revamp"
RELEASE_ROOT = REPO_ROOT / "data" / "release"
LICENSES_MD = REPO_ROOT / "docs" / "data" / "LICENSES.md"

CANONICAL = REVAMP / "identity" / "canonical-v3.ndjson"
RELATIONS = REVAMP / "identity" / "relations-v3.parquet"
PRESENCE = REVAMP / "presence-applicable-v5.ndjson"
FIELDS_DIR = REVAMP / "fields-v2"
INTERACTIONS = REVAMP / "interactions" / "interactions.parquet"
BLOCKS = REVAMP / "blocks"
TIER3_SECTIONS = REVAMP / "tier3-sections.parquet"
DERIVED_DIR = REVAMP / "derived-v2"

RELEASE_LICENCE = "CC BY-SA 4.0"
REPOSITORY_URL = "https://github.com/Compoundingzero/rnawiki"
PRINT_ROW_CAP = 50

INCLUDED_CLASSES = ("public-domain", "cc-by", "cc-by-sa", "open-attribution")


class Licence:
    """One source's licence, as recorded in docs/data/LICENSES.md."""

    def __init__(self, source: str, licence: str, licence_class: str, reason: str = "") -> None:
        self.source = source
        self.licence = licence
        self.licence_class = licence_class
        self.reason = reason

    @property
    def included(self) -> bool:
        return self.licence_class in INCLUDED_CLASSES

    def as_dict(self) -> dict:
        record = {"source": self.source, "licence": self.licence, "class": self.licence_class}
        if self.reason:
            record["reason"] = self.reason
        return record


PUBLIC_DOMAIN = "public-domain"
CC_BY = "cc-by"
CC_BY_SA = "cc-by-sa"
OPEN_ATTRIBUTION = "open-attribution"
EXCLUDED = "excluded"

# Keys are the source tokens the corpus writes, lowercased. A composite token joined with "+" is
# split and every part must be included.
SOURCE_LICENCES: dict[str, Licence] = {
    "chembl": Licence("ChEMBL 37", "CC BY-SA 3.0", CC_BY_SA),
    "atc": Licence(
        "ATC classification as distributed by ChEMBL 37 (atc_class)", "CC BY-SA 3.0", CC_BY_SA
    ),
    "drugcentral": Licence("DrugCentral 2023", "CC BY-SA 4.0", CC_BY_SA),
    "iuphar": Licence(
        "IUPHAR/BPS Guide to PHARMACOLOGY 2026.2",
        "CC BY-SA 4.0 (contents); ODbL (database)",
        CC_BY_SA,
    ),
    "uniprot": Licence("UniProtKB release 2026_03", "CC BY 4.0", CC_BY),
    "tga-artg": Licence(
        "Poisons Standard (SUSMP), Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026, "
        "F2026L00633, Federal Register of Legislation",
        "CC BY 4.0",
        CC_BY,
        "the corpus writes this token for the Australian scheduling data; the Australian Register "
        "of Therapeutic Goods itself was never retrieved and contributes no value",
    ),
    "inxight": Licence("NCATS Inxight Drugs", "Public domain (US Government work)", PUBLIC_DOMAIN),
    "pubchem": Licence("PubChem", "Public domain (NIH/NCBI)", PUBLIC_DOMAIN),
    "gsrs": Licence("GSRS public data export (FDA/NCATS)", "Public domain", PUBLIC_DOMAIN),
    "clinicaltrials": Licence("ClinicalTrials.gov API v2", "Public domain (US Government work)", PUBLIC_DOMAIN),
    "clinicaltrials.gov": Licence("ClinicalTrials.gov API v2", "Public domain (US Government work)", PUBLIC_DOMAIN),
    "clinicaltrials_snapshot": Licence(
        "ClinicalTrials.gov API v2 studies snapshot", "Public domain (US Government work)", PUBLIC_DOMAIN
    ),
    "registry": Licence(
        "ClinicalTrials.gov API v2",
        "Public domain (US Government work)",
        PUBLIC_DOMAIN,
        "the token the derived seeds write when the cited record is an NCT registry entry",
    ),
    "openfda-label": Licence("openFDA drug label / DailyMed SPL", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "fda_label": Licence("openFDA drug label / DailyMed SPL", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "openfda_enforcement": Licence("openFDA enforcement", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "openfda-ndc": Licence("openFDA NDC", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "openfda ndc": Licence("openFDA NDC", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "drugsfda": Licence("Drugs@FDA (openFDA)", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "drugs@fda": Licence("Drugs@FDA (openFDA)", "CC0 1.0 Universal", PUBLIC_DOMAIN),
    "orange-purple-book": Licence(
        "FDA Orange Book and Purple Book data files", "Public domain (US Government work)", PUBLIC_DOMAIN
    ),
    "open-targets": Licence("Open Targets Platform 26.06", "CC0 1.0", PUBLIC_DOMAIN),
    "open-targets-adr": Licence("Open Targets Platform 26.06", "CC0 1.0", PUBLIC_DOMAIN),
    "open_targets_faers": Licence("Open Targets Platform 26.06 (FAERS)", "CC0 1.0", PUBLIC_DOMAIN),
    "open_targets_drug_warning": Licence(
        "Open Targets Platform 26.06 (drug warnings)", "CC0 1.0", PUBLIC_DOMAIN
    ),
    "pubmed_esearch": Licence("PubMed E-utilities metadata (NLM)", "Public domain", PUBLIC_DOMAIN),
    "withdrawn": Licence(
        "ChEMBL 37 drug_warning (the corpus writes this token for withdrawal reasons)",
        "CC BY-SA 3.0",
        CC_BY_SA,
        "the WITHDRAWN database itself was never retrieved and contributes no value",
    ),
    "hsa-singapore": Licence(
        "HSA Listing of Registered Therapeutic Products (data.gov.sg)",
        "Singapore Open Data Licence 1.0",
        OPEN_ATTRIBUTION,
    ),
    "sso": Licence(
        "Singapore Statutes Online (AGC)",
        "AGC Terms of Use clause 13 permission",
        OPEN_ATTRIBUTION,
    ),
    "ema": Licence(
        "European Medicines Agency medicines register",
        "EMA copyright and limited reproduction notice",
        OPEN_ATTRIBUTION,
    ),
    "ema_medicine_register": Licence(
        "European Medicines Agency medicines register",
        "EMA copyright and limited reproduction notice",
        OPEN_ATTRIBUTION,
    ),
    "pmda": Licence(
        "PMDA List of Approved Products (New Drugs), English",
        "Public Data License 1.0 (Japan)",
        OPEN_ATTRIBUTION,
    ),
    "health-canada": Licence(
        "Health Canada Drug Product Database", "Open Government Licence – Canada 2.0", OPEN_ATTRIBUTION
    ),
    "jax-mpd-itp": Licence(
        "NIA ITP lifespan workbooks via JAX Mouse Phenome Database",
        "MPD terms: contributors waive copyright; cite the ITP publication",
        OPEN_ATTRIBUTION,
    ),
    "registers": Licence(
        "composite of the registers above", "per constituent register", OPEN_ATTRIBUTION
    ),
    "register": Licence(
        "composite of the registers above", "per constituent register", OPEN_ATTRIBUTION
    ),
    "recorded-background/fda_label": Licence(
        "openFDA drug label / DailyMed SPL, through the corpus's recorded-background registry",
        "CC0 1.0 Universal",
        PUBLIC_DOMAIN,
    ),
    "register_set": Licence(
        "composite of the registers above", "per constituent register", OPEN_ATTRIBUTION
    ),
    "europepmc": Licence(
        "Europe PMC",
        "Europe PMC terms: metadata and abstracts reusable; full text per article licence",
        EXCLUDED,
        "the values are verbatim sentences whose licence is the individual article's and is not "
        "established per record",
    ),
    "ddinter": Licence("DDInter 2.0", "CC BY-NC-SA 4.0", EXCLUDED, "non-commercial"),
    "pharmgkb": Licence(
        "PharmGKB / ClinPGx",
        "CC BY-SA 4.0 with added no-sale and research-purpose conditions",
        EXCLUDED,
        "the added conditions are not a free redistribution grant",
    ),
    "clinpgx": Licence(
        "PharmGKB / ClinPGx",
        "CC BY-SA 4.0 with added no-sale and research-purpose conditions",
        EXCLUDED,
        "the added conditions are not a free redistribution grant",
    ),
    "cpic": Licence("CPIC", "CC0 1.0", EXCLUDED, "carried only alongside the ClinPGx rows, which are excluded"),
    "mhra-emc": Licence("MHRA products database and emc", "No reuse licence", EXCLUDED, "no licence"),
    "drugbank": Licence("DrugBank", "No licence held", EXCLUDED, "no DrugBank licence is held"),
}

# Register names as the block tables write them, mapped to a source token above.
REGISTER_TOKENS = {
    "hsa listing of registered therapeutic products": "hsa-singapore",
    "drugs@fda or the fda orange book": "drugsfda",
    "drugs@fda": "drugsfda",
    "fda orange book": "orange-purple-book",
    "fda purple book": "orange-purple-book",
    "fda orange book and fda purple book data files": "orange-purple-book",
    "ema register of centrally authorised medicines": "ema_medicine_register",
    "ema medicine.csv": "ema_medicine_register",
    "pmda list of approved products (new drugs), english": "pmda",
    "health canada drug product database": "health-canada",
    "the poisons standard (susmp)": "tga-artg",
    "poisons standard june 2026 (susmp)": "tga-artg",
    "federal register of legislation": "tga-artg",
    "singapore statutes online": "sso",
    "openfda ndc": "openfda-ndc",
    "ncats inxight drugs, a curated record of upstream product registers, not a national register": "inxight",
    "mhra products database and emc": "mhra-emc",
}


class UnknownSource(Exception):
    def __init__(self, token: str, where: str) -> None:
        super().__init__(f"unknown source token {token!r} at {where}")
        self.token = token
        self.where = where


def licences_for(token: str, where: str) -> list[Licence]:
    """Every licence a source token stands for. Raises UnknownSource, naming where it was found."""
    parts = [part.strip() for part in str(token).split("+") if part.strip()]
    found: list[Licence] = []
    for part in parts:
        key = part.lower()
        if key.startswith("openfda-ndc"):
            key = "openfda-ndc"
        entry = SOURCE_LICENCES.get(key)
        if entry is None:
            entry = SOURCE_LICENCES.get(REGISTER_TOKENS.get(key, ""), None)
        if entry is None:
            raise UnknownSource(part, where)
        found.append(entry)
    if not found:
        raise UnknownSource(str(token), where)
    return found


def token_included(token: str, where: str) -> tuple[bool, list[Licence]]:
    entries = licences_for(token, where)
    return all(entry.included for entry in entries), entries


# --------------------------------------------------------------------------- identity


def load_presence() -> dict[str, dict]:
    rows: dict[str, dict] = {}
    with PRESENCE.open(encoding="utf-8") as handle:
        for line in handle:
            record = json.loads(line)
            rows[record["key"]] = record
    return rows


def load_relations() -> dict[str, list[dict]]:
    frame = pandas.read_parquet(RELATIONS)
    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in frame.itertuples(index=False):
        grouped[row.page_a].append(
            {
                "page": row.page_b,
                "relation": row.relation,
                "note": row.note,
                "rule": row.rule,
            }
        )
    return grouped


def write_pages(out_dir: Path, presence: dict[str, dict], counters: Counter) -> tuple[int, set[str]]:
    relations = load_relations()
    written = 0
    keys: set[str] = set()
    with (out_dir / "pages.ndjson").open("w", encoding="utf-8") as out:
        with CANONICAL.open(encoding="utf-8") as handle:
            for line in handle:
                record = json.loads(line)
                key = record["key"]
                keys.add(key)
                measured = presence.get(key, {})
                if record.get("drugbankId"):
                    counters["pages.drugbankId dropped (no DrugBank licence)"] += 1
                page = {
                    "key": key,
                    "slug": record.get("existingSlug"),
                    "displayName": record.get("displayName"),
                    "tier": measured.get("tier"),
                    "model": measured.get("model"),
                    "isCombination": record.get("isCombination"),
                    "isBiologic": record.get("isBiologic"),
                    "identifiers": {
                        "unii": record.get("unii"),
                        "cas": record.get("cas"),
                        "cid": record.get("cid"),
                        "chemblId": record.get("chemblId"),
                        "rxcui": record.get("rxcui"),
                    },
                    "structure": record.get("structure"),
                    "synonyms": record.get("synonyms", []),
                    "mergedFrom": record.get("mergedFrom", []),
                    "ruleId": record.get("ruleId"),
                    "sourceRecords": record.get("sourceRecords", []),
                    "relations": relations.get(key, []),
                    "fieldCounts": {
                        "applicable": measured.get("applicable"),
                        "present": measured.get("present"),
                    },
                }
                out.write(json.dumps(page, ensure_ascii=False, sort_keys=True) + "\n")
                written += 1
    return written, keys


# --------------------------------------------------------------------------- fields


def derived_inputs(value) -> list[str]:
    """The field names a `derived-from-fields` value was computed from, where it records them."""
    if isinstance(value, dict):
        assignments = value.get("assignments")
        if isinstance(assignments, list):
            names = [item.get("field") for item in assignments if isinstance(item, dict)]
            return [name for name in names if name]
    return []


def write_fields(
    out_dir: Path, presence: dict[str, dict], counters: Counter, field_licences: dict
) -> tuple[int, int, int]:
    batches = sorted(FIELDS_DIR.glob("*/batch-*.ndjson"))
    if not batches:
        print(f"no field batches under {FIELDS_DIR}", file=sys.stderr)
        raise SystemExit(2)
    pages = kept = dropped = 0
    with (out_dir / "fields.ndjson").open("w", encoding="utf-8") as out:
        for batch in batches:
            with batch.open(encoding="utf-8") as handle:
                for line in handle:
                    record = json.loads(line)
                    key = record["key"]
                    measured = presence.get(key, {})
                    included: dict[str, dict] = {}
                    omitted: dict[str, str] = {}
                    deferred: list[tuple[str, dict]] = []
                    for name, value in record.get("fields", {}).items():
                        source = value.get("source")
                        token = source.get("kind") if isinstance(source, dict) else None
                        if not token:
                            # An absent or not-applicable field carries no source and no third
                            # party's content: the record of what is not held is the corpus's own.
                            included[name] = dict(value)
                            included[name]["licence"] = None
                            kept += 1
                            continue
                        if str(token).lower() == "derived-from-fields":
                            deferred.append((name, value))
                            continue
                        allowed, entries = token_included(token, f"{key} field {name}")
                        if allowed:
                            copy = dict(value)
                            copy["licence"] = [entry.licence for entry in entries]
                            copy["licenceSources"] = [entry.source for entry in entries]
                            included[name] = copy
                            kept += 1
                            field_licences[name].update(entry.source for entry in entries)
                        else:
                            blocked = [entry for entry in entries if not entry.included]
                            reason = "; ".join(
                                f"{entry.source}: {entry.licence}"
                                + (f" ({entry.reason})" if entry.reason else "")
                                for entry in blocked
                            )
                            omitted[name] = f"source excluded — {reason}"
                            dropped += 1
                            counters[f"field dropped: {name} ({token})"] += 1
                    for name, value in deferred:
                        inputs = derived_inputs(value.get("value"))
                        missing = [item for item in inputs if item in omitted]
                        if not inputs:
                            missing = sorted(omitted)
                        if missing:
                            omitted[name] = (
                                "computed from fields this release omits: " + ", ".join(sorted(set(missing)))
                            )
                            dropped += 1
                            counters[f"field dropped: {name} (derived from omitted fields)"] += 1
                            continue
                        copy = dict(value)
                        copy["licence"] = [RELEASE_LICENCE]
                        copy["licenceSources"] = ["RNAWiki, computed from the fields named in the value"]
                        included[name] = copy
                        kept += 1
                        field_licences[name].add("RNAWiki (computed)")
                    out.write(
                        json.dumps(
                            {
                                "key": key,
                                "slug": record.get("existingSlug"),
                                "displayName": record.get("displayName"),
                                "model": record.get("model"),
                                "tier": measured.get("tier"),
                                "fields": included,
                                "omittedFields": omitted,
                            },
                            ensure_ascii=False,
                            sort_keys=True,
                        )
                        + "\n"
                    )
                    pages += 1
    return pages, kept, dropped


# --------------------------------------------------------------------------- tables


def filter_frame(
    frame: pandas.DataFrame, column: str, label: str, counters: Counter
) -> pandas.DataFrame:
    """Drop rows whose source column names an excluded source. Unknown tokens fail the build."""
    verdicts: dict[str, bool] = {}
    keep = []
    for index, value in enumerate(frame[column].tolist()):
        token = "" if value is None else str(value)
        if token not in verdicts:
            allowed, _entries = token_included(token, f"{label} row {index} column {column}")
            verdicts[token] = allowed
        keep.append(verdicts[token])
        if not verdicts[token]:
            counters[f"{label} row dropped ({token})"] += 1
    return frame[pandas.Series(keep, index=frame.index)]


def write_interactions(out_dir: Path, counters: Counter) -> dict:
    frame = pandas.read_parquet(INTERACTIONS)
    frame = filter_frame(frame, "source", "interactions", counters)
    licences = []
    for source, recorded in zip(frame["source"].tolist(), frame["licence"].tolist()):
        if isinstance(recorded, str) and recorded.strip():
            licences.append(recorded)
        else:
            entries = licences_for(str(source), "interactions licence backfill")
            licences.append("; ".join(sorted({entry.licence for entry in entries})))
    frame = frame.assign(licence=licences)
    frame.to_parquet(out_dir / "interactions.parquet", index=False)
    return {
        "rows": int(len(frame)),
        "byTier": {str(tier): int(count) for tier, count in frame["tier"].value_counts().items()},
        "ruleIds": sorted(str(value) for value in frame["rule_id"].dropna().unique()),
    }


def write_blocks(out_dir: Path, counters: Counter) -> dict:
    blocks_dir = out_dir / "blocks"
    blocks_dir.mkdir(parents=True, exist_ok=True)
    summary = {}
    for name in ("registration", "patent", "controlled"):
        frame = pandas.read_parquet(BLOCKS / f"{name}.parquet")
        # A register named in a block row is the register the corpus checked; where nothing could
        # be retrieved the row carries the corpus's own statement of that, not the register's
        # content, so it is kept and the statement says so.
        for column in ("source", "register"):
            if column in frame.columns:
                unknown = set()
                for value in frame[column].dropna().unique():
                    try:
                        licences_for(str(value), f"{name}.{column}")
                    except UnknownSource as error:
                        unknown.add(error.token)
                if unknown:
                    raise UnknownSource(sorted(unknown)[0], f"{name}.{column}")
        frame.to_parquet(blocks_dir / f"{name}.parquet", index=False)
        summary[name] = int(len(frame))
        counters[f"blocks/{name}.parquet rows"] += int(len(frame))
    return summary


def write_tier3_sections(out_dir: Path) -> dict:
    frame = pandas.read_parquet(TIER3_SECTIONS)
    frame.to_parquet(out_dir / "tier3-sections.parquet", index=False)
    return {
        "rows": int(len(frame)),
        "bySection": {str(k): int(v) for k, v in frame["section"].value_counts().items()},
    }


def source_tokens_in(node, found: set[str]) -> None:
    """Collect every source a derived record cites.

    A source appears in two shapes: `"source": {"kind": ...}`, written by the field builders, and
    `"provenance": {"source": "<token>", "licence": ...}`, written by the source mappers. A bare
    `kind` elsewhere in a record names a kind of event or record, not a source, and is not read
    here — that is why the walk looks only under those two keys.
    """
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "source" and isinstance(value, dict) and isinstance(value.get("kind"), str):
                found.add(value["kind"])
                continue
            if key == "provenance" and isinstance(value, dict) and isinstance(value.get("source"), str):
                found.add(value["source"])
                continue
            source_tokens_in(value, found)
    elif isinstance(node, list):
        for item in node:
            source_tokens_in(item, found)


def write_derived(out_dir: Path, counters: Counter) -> dict:
    derived_dir = out_dir / "derived"
    derived_dir.mkdir(parents=True, exist_ok=True)
    summary: dict[str, dict] = {}
    for path in sorted(DERIVED_DIR.glob("seed-*.ndjson")):
        kept = dropped = 0
        with path.open(encoding="utf-8") as handle, (derived_dir / path.name).open(
            "w", encoding="utf-8"
        ) as out:
            for line in handle:
                record = json.loads(line)
                tokens: set[str] = set()
                source_tokens_in(record, tokens)
                blocked = []
                for token in tokens:
                    allowed, entries = token_included(token, f"{path.name} page {record.get('key')}")
                    if not allowed:
                        blocked.extend(entry.source for entry in entries if not entry.included)
                if blocked:
                    dropped += 1
                    counters[f"derived record dropped: {path.name} ({sorted(set(blocked))[0]})"] += 1
                    continue
                out.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
                kept += 1
        summary[path.name] = {"kept": kept, "dropped": dropped}
    return summary


# --------------------------------------------------------------------------- release files


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_citation(out_dir: Path, release_date: str) -> None:
    (out_dir / "CITATION.cff").write_text(
        "\n".join(
            [
                "cff-version: 1.2.0",
                "message: If you use this dataset, please cite it and the upstream sources named in LICENSES.md.",
                "title: RNAWiki open drug corpus",
                f"version: {release_date}",
                f"date-released: {release_date}",
                "type: dataset",
                "authors:",
                "  - name: RNAWiki",
                "    given-names: Felix",
                "    website: https://rnawiki.com",
                f"license: {RELEASE_LICENCE}",
                f"repository-code: {REPOSITORY_URL}",
                "url: https://rnawiki.com",
                "abstract: >-",
                "  Identity, field values, drug-interaction rows, registration, patent and controlled-substance",
                "  blocks, Tier 3 sections and derived sections for the RNAWiki drug and longevity corpus,",
                "  limited to the sources whose licences permit redistribution and commercial use. Each value",
                "  carries the source and the licence it came under; the compilation is CC BY-SA 4.0 and the",
                "  upstream records stay under their own licences, which LICENSES.md and README.md list.",
                "",
            ]
        ),
        encoding="utf-8",
    )


def write_readme(out_dir: Path, release_date: str, summary: dict, field_licences: dict) -> None:
    included_sources = sorted(
        {
            (entry.source, entry.licence, entry.licence_class)
            for entry in SOURCE_LICENCES.values()
            if entry.included
        }
    )
    excluded_sources = sorted(
        {
            (entry.source, entry.licence, entry.reason)
            for entry in SOURCE_LICENCES.values()
            if not entry.included
        }
    )
    lines: list[str] = []
    lines.append(f"# RNAWiki open drug corpus, {release_date}")
    lines.append("")
    lines.append(
        "A record of what is known about "
        f"{summary['pages']['rows']:,} substances and substance combinations: identity, field values, "
        "drug-interaction rows with the rule that produced each one, registration, patent and "
        "controlled-substance blocks, Tier 3 sections and derived sections."
    )
    lines.append("")
    lines.append(
        "The compilation is released under "
        f"{RELEASE_LICENCE}. The upstream records inside it stay under their own licences: every "
        "value names its source and that source's licence, and `LICENSES.md` carries the full "
        "licence text as published, with the retrieval date and the terms for each one. Attribution "
        "for a source that requires it is the wording in `LICENSES.md`, not this file."
    )
    lines.append("")
    lines.append("## What is in the release")
    lines.append("")
    lines.append("| File | Rows | What it holds |")
    lines.append("| --- | --- | --- |")
    lines.append(
        f"| `pages.ndjson` | {summary['pages']['rows']:,} | one record per page: key, slug, display name, "
        "tier, model, identifiers, synonyms, merge history, relations to other pages, and the "
        "applicable/present field counts |"
    )
    lines.append(
        f"| `fields.ndjson` | {summary['fields']['pages']:,} | one record per page holding its field "
        f"values ({summary['fields']['valuesKept']:,} values kept, {summary['fields']['valuesDropped']:,} "
        "omitted for licence) — each value carries its state, source, source date and licence, and "
        "`omittedFields` names every field left out and why |"
    )
    lines.append(
        f"| `interactions.parquet` | {summary['interactions']['rows']:,} | interaction rows in tiers "
        "A (a statement read from a drug label), B (a curated interaction record) and C (predicted "
        "from mechanism), each with `rule_id`, `derivation`, `source`, `source_url` and `licence` |"
    )
    for name, rows in summary["blocks"].items():
        lines.append(f"| `blocks/{name}.parquet` | {rows:,} | the {name} block as rendered, with provenance |")
    lines.append(
        f"| `tier3-sections.parquet` | {summary['tier3Sections']['rows']:,} | the per-compound Tier 3 "
        "sections with the fields each sentence was built from |"
    )
    derived_kept = sum(item["kept"] for item in summary["derived"].values())
    lines.append(
        f"| `derived/seed-*.ndjson` | {derived_kept:,} | the derived sections, one file per seed, each "
        "record carrying the values and sources it was computed from |"
    )
    lines.append("| `LICENSES.md` | — | every source, its URL, retrieval date, licence and terms |")
    lines.append("| `CITATION.cff` | — | citation metadata |")
    lines.append("| `SHA256SUMS` | — | SHA256 of every file above |")
    lines.append("")
    lines.append("## Tiers, and what a missing value means")
    lines.append("")
    lines.append(
        "Tier 1 (Longevity), Tier 2 (Clinical) and Tier 3 (Development) are the three field models the "
        "corpus uses; a page's tier decides which fields can apply to it at all. A field that is "
        "`absent` was looked for and not found, and the `note` says where it was looked for. A field "
        "that is `not-applicable` cannot apply to that page's model. Neither is a gap in the data and "
        "neither should be read as a negative finding: an interaction that no source records is "
        "recorded as not found in the sources checked on the date checked, never as an absence of "
        "interaction."
    )
    lines.append("")
    lines.append("## Licence gate")
    lines.append("")
    lines.append(
        "A value is in this release only where its source's row in `LICENSES.md` records that "
        "redistribution and commercial use are both permitted. Those sources are:"
    )
    lines.append("")
    lines.append("| Source | Licence | Class |")
    lines.append("| --- | --- | --- |")
    for source, licence, licence_class in included_sources:
        lines.append(f"| {source} | {licence} | {licence_class} |")
    lines.append("")
    lines.append("Excluded, and why:")
    lines.append("")
    lines.append("| Source | Licence | Why it is not here |")
    lines.append("| --- | --- | --- |")
    for source, licence, reason in excluded_sources:
        lines.append(f"| {source} | {licence} | {reason or 'not a redistribution grant'} |")
    lines.append("")
    lines.append(
        "DDInter 2.0 and the ClinPGx/PharmGKB pharmacogenomic rows are not merely filtered out of "
        "this build: they are held outside the corpus entirely, at `data/validation/ddinter` and "
        "`data/revamp/fields-v2-gated`, and the build reads neither path."
    )
    lines.append("")
    lines.append("## Per-field provenance")
    lines.append("")
    lines.append("| Field | Sources that fill it in this release |")
    lines.append("| --- | --- |")
    for field in sorted(field_licences):
        sources = ", ".join(sorted(field_licences[field]))
        lines.append(f"| `{field}` | {sources} |")
    lines.append("")
    consistency = summary["consistency"]
    missing_identity = len(consistency["measuredWithoutIdentityRecord"])
    missing_measurement = len(consistency["identityRecordWithoutMeasurement"])
    if missing_identity or missing_measurement:
        lines.append("## Known gaps in this build")
        lines.append("")
        lines.append(
            f"`pages.ndjson` is built from the identity pass and `fields.ndjson` from the field "
            f"pass, and the two disagree on {missing_identity + missing_measurement} pages: "
            f"{missing_identity} pages carry field values but no identity record, and "
            f"{missing_measurement} identity records carry no measured field counts. The keys are "
            "listed in `build-summary.json` under `consistency`. Neither file was padded to hide "
            "the difference."
        )
        lines.append("")
    lines.append("## How it was built")
    lines.append("")
    lines.append(
        f"`scripts/revamp/build_release.py`, run on {summary['builtAt']} against git commit "
        f"`{summary['commit']}`. Inputs: `data/revamp/identity/canonical-v3.ndjson`, "
        "`data/revamp/fields-v2`, `data/revamp/interactions/interactions.parquet`, "
        "`data/revamp/blocks`, `data/revamp/tier3-sections.parquet` and `data/revamp/derived-v2`."
    )
    lines.append("")
    (out_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def write_sha256sums(out_dir: Path) -> None:
    entries = []
    for path in sorted(out_dir.rglob("*")):
        if path.is_file() and path.name != "SHA256SUMS":
            entries.append((sha256_of(path), path.relative_to(out_dir).as_posix()))
    (out_dir / "SHA256SUMS").write_text(
        "".join(f"{digest}  {name}\n" for digest, name in entries), encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="release date, YYYY-MM-DD")
    parser.add_argument("--no-tarball", action="store_true", help="build the directory only")
    arguments = parser.parse_args()

    for required in (CANONICAL, RELATIONS, PRESENCE, INTERACTIONS, TIER3_SECTIONS, LICENSES_MD):
        if not required.exists():
            print(f"missing input: {required}", file=sys.stderr)
            return 2

    out_dir = RELEASE_ROOT / f"rnawiki-corpus-{arguments.date}"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    counters: Counter = Counter()
    field_licences: dict[str, set[str]] = defaultdict(set)
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, capture_output=True, text=True
    ).stdout.strip()

    try:
        presence = load_presence()
        pages, page_keys = write_pages(out_dir, presence, counters)
        field_pages, kept, dropped = write_fields(out_dir, presence, counters, field_licences)
        interactions = write_interactions(out_dir, counters)
        blocks = write_blocks(out_dir, counters)
        tier3 = write_tier3_sections(out_dir)
        derived = write_derived(out_dir, counters)
    except UnknownSource as error:
        print(f"BUILD FAILED: {error}", file=sys.stderr)
        print(
            "Add the source to SOURCE_LICENCES with the licence its row in docs/data/LICENSES.md "
            "records, or mark it excluded. No release is written until it is classified.",
            file=sys.stderr,
        )
        return 3

    shutil.copyfile(LICENSES_MD, out_dir / "LICENSES.md")

    summary = {
        "builtAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "commit": commit,
        "releaseDate": arguments.date,
        "licence": RELEASE_LICENCE,
        "pages": {"rows": pages},
        "fields": {"pages": field_pages, "valuesKept": kept, "valuesDropped": dropped},
        "consistency": {
            "measuredWithoutIdentityRecord": sorted(set(presence) - page_keys),
            "identityRecordWithoutMeasurement": sorted(page_keys - set(presence)),
        },
        "interactions": interactions,
        "blocks": blocks,
        "tier3Sections": tier3,
        "derived": derived,
        "includedSources": {
            key: entry.as_dict() for key, entry in SOURCE_LICENCES.items() if entry.included
        },
        "excludedSources": {
            key: entry.as_dict() for key, entry in SOURCE_LICENCES.items() if not entry.included
        },
    }

    write_citation(out_dir, arguments.date)
    write_readme(out_dir, arguments.date, summary, field_licences)
    (out_dir / "exclusions.json").write_text(
        json.dumps(
            {
                "excludedSources": summary["excludedSources"],
                "droppedCounts": dict(counters),
            },
            indent=1,
            sort_keys=True,
        ),
        encoding="utf-8",
    )
    (out_dir / "build-summary.json").write_text(
        json.dumps(summary, indent=1, sort_keys=True), encoding="utf-8"
    )
    write_sha256sums(out_dir)

    print(f"release: {out_dir.relative_to(REPO_ROOT)}")
    print(f"  pages.ndjson          {pages:,}")
    print(f"  fields.ndjson         {field_pages:,} pages, {kept:,} values kept, {dropped:,} omitted")
    print(f"  interactions.parquet  {interactions['rows']:,} rows {interactions['byTier']}")
    print(f"  blocks                {blocks}")
    print(f"  tier3-sections        {tier3['rows']:,}")
    print(f"  derived               {sum(item['kept'] for item in derived.values()):,} kept, "
          f"{sum(item['dropped'] for item in derived.values()):,} dropped")
    for reason, count in counters.most_common(PRINT_ROW_CAP):
        print(f"  {count:>9,}  {reason}")

    if arguments.no_tarball:
        return 0

    tarball = RELEASE_ROOT / f"rnawiki-corpus-{arguments.date}.tar.zst"
    if tarball.exists():
        tarball.unlink()
    result = subprocess.run(
        ["tar", "--zstd", "-cf", str(tarball), "-C", str(RELEASE_ROOT), out_dir.name],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"tar failed for {tarball}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        return 3
    digest = sha256_of(tarball)
    (RELEASE_ROOT / f"{tarball.name}.sha256").write_text(f"{digest}  {tarball.name}\n", encoding="utf-8")
    print(f"tarball: {tarball.relative_to(REPO_ROOT)}  {tarball.stat().st_size:,} bytes")
    print(f"sha256:  {digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
