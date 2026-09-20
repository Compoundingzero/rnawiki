#!/usr/bin/env python3
"""Read-only, bounded SPL sentence candidates for editorial review.

Examples (stdout is JSON; no repository files are written):

  python3 scripts/research/label-candidates.py \
    --input data/sources/openfda-label/mapped.parquet --key K1:Q20Q21Q62J

  python3 scripts/research/label-candidates.py \
    --input label-rows.ndjson --key K1:Q20Q21Q62J \
    --metadata label-index.ndjson

The parquet reader needs ``duckdb`` (already used by the revamp ingest). NDJSON
works with the standard library and follows the mapped.parquet row schema.

The current mapped parquet retains ten SPL sections, a set ID and date, but
*not* product form, route, brand, ingredient count, SPL document ID or version.
An optional exact-set-ID metadata file can fill the former fields when they
were actually recorded. Unknowns stay unknown; labels are never projected
onto every product containing the requested ingredient.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable


# These are the ten section fields retained by openfda_label_map.py. The
# derived cyp_profile field is not verbatim SPL prose and is excluded.
SECTIONS = (
    "boxed_warning",
    "contraindications",
    "indications_and_usage",
    "warnings_and_cautions",
    "drug_interactions",
    "use_in_specific_populations",
    "overdosage",
    "mechanism_of_action",
    "clinical_pharmacology",
    "pharmacokinetics",
)
SECTION_RANK = {section: rank for rank, section in enumerate(SECTIONS)}
SET_ID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
# Prefer complete, source-verbatim sentences. A few SPL sections are one flat
# paragraph with heading and prose; headings may be included in the excerpt.
SENTENCE = re.compile(r"[^.!?]+[.!?](?=\s|$)", re.DOTALL)
NAV_ONLY = re.compile(r"^(?:\d+(?:\.\d+)*\s*)?[A-Z\s:/()\-]{3,}$")


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        return sorted({item.strip() for item in value if isinstance(item, str) and item.strip()})
    return []


def read_rows(path: Path, key: str) -> Iterable[dict[str, Any]]:
    if path.suffix == ".parquet":
        try:
            import duckdb  # type: ignore[import-not-found]
        except ImportError as exc:
            raise RuntimeError("Reading parquet requires duckdb; NDJSON needs no extra package") from exc
        connection = duckdb.connect(database=":memory:")
        try:
            cursor = connection.execute(
                "SELECT key, field, value, source_record_id, source_url, source_date, "
                "match_rule, form_of_target, licence FROM read_parquet(?) WHERE key = ? "
                "AND field IN (" + ",".join("?" for _ in SECTIONS) + ")",
                [str(path), key, *SECTIONS],
            )
            columns = [description[0] for description in cursor.description]
            while batch := cursor.fetchmany(1000):
                for values in batch:
                    yield dict(zip(columns, values))
        finally:
            connection.close()
    elif path.suffix == ".ndjson":
        with path.open(encoding="utf-8") as source:
            for line_number, line in enumerate(source, start=1):
                if not line.strip():
                    continue
                row = json.loads(line)
                if row.get("key") == key and row.get("field") in SECTION_RANK:
                    row["_line"] = line_number
                    yield row
    else:
        raise ValueError("--input must be .parquet or .ndjson")


def read_metadata(
    path: Path | None, revisions: set[tuple[str, str]]
) -> dict[tuple[str, str], dict[str, Any]]:
    if path is None:
        return {}
    if path.suffix != ".ndjson":
        raise ValueError("--metadata must be an NDJSON file")
    found: dict[tuple[str, str], dict[str, Any]] = {}
    dates_by_set: dict[str, set[str]] = defaultdict(set)
    for set_id, date in revisions:
        dates_by_set[set_id].add(date)
    with path.open(encoding="utf-8") as source:
        for line in source:
            if not line.strip():
                continue
            row = json.loads(line)
            set_id = row.get("setId") or row.get("set_id")
            if set_id not in dates_by_set:
                continue
            raw_date = row.get("effectiveTime") or row.get("effective_time") or row.get("sourceDate")
            if raw_date is None:
                if len(dates_by_set[set_id]) != 1:
                    raise ValueError(f"Undated metadata for multiple revisions of set ID {set_id}")
                date = next(iter(dates_by_set[set_id]))
            else:
                date = str(raw_date)
                if re.fullmatch(r"\d{8}", date):
                    date = f"{date[:4]}-{date[4:6]}-{date[6:]}"
                if date not in dates_by_set[set_id]:
                    continue
            # The background label-index shape is flat; a raw SPL row has an
            # openfda annotation. Neither name nor UNII arrays are positional.
            annotation = row.get("openfda") or {}
            metadata = {
                "brandNames": strings(row.get("brandNames") or annotation.get("brand_name")),
                "genericNames": strings(row.get("genericNames") or annotation.get("generic_name")),
                "substanceNames": strings(row.get("substanceNames") or annotation.get("substance_name")),
                "routes": strings(row.get("routes") or annotation.get("route")),
                "dosageForms": strings(row.get("dosageForms") or annotation.get("dosage_form")),
                "declaredSubstanceCount": row.get("declaredSubstanceCount"),
                "splId": row.get("id") or row.get("splId"),
                "version": row.get("version"),
            }
            revision = (set_id, date)
            previous = found.get(revision)
            if previous is not None and previous != metadata:
                raise ValueError(f"Conflicting metadata for set ID {set_id}, date {date}; refusing an ambiguous join")
            found[revision] = metadata
    return found


def section_blocks(value: Any) -> list[str]:
    if not isinstance(value, str):
        raise ValueError("Mapped section value is not a JSON string")
    blocks = json.loads(value)
    if not isinstance(blocks, list) or not all(isinstance(block, str) for block in blocks):
        raise ValueError("Mapped section value must encode an array of SPL text blocks")
    return blocks


def sentence_spans(block: str) -> Iterable[tuple[int, int, str]]:
    for match in SENTENCE.finditer(block):
        start, end = match.span()
        while start < end and block[start].isspace():
            start += 1
        while end > start and block[end - 1].isspace():
            end -= 1
        excerpt = block[start:end]
        if not 45 <= len(excerpt) <= 650:
            continue
        # A period in a numbered cross-reference can leave a dangling tail
        # such as "8 ) • Embryo-fetal toxicity". Do not present that as a claim.
        if re.match(r"^(?:\d+\s*\)|[).,;])", excerpt):
            continue
        if excerpt.lower().endswith("see boxed warning.") or re.search(
            r"\bTable\s+\d+\s+presents\b", excerpt, re.IGNORECASE
        ):
            continue
        if len(re.findall(r"[A-Za-z]{3,}", excerpt)) < 7 or NAV_ONLY.fullmatch(excerpt):
            continue
        letters = [character for character in excerpt if character.isalpha()]
        if letters and sum(character.isupper() for character in letters) / len(letters) > 0.85:
            continue
        yield start, end, excerpt


def scope(metadata: dict[str, Any]) -> dict[str, Any]:
    routes = metadata.get("routes", [])
    forms = metadata.get("dosageForms", [])
    declared = metadata.get("declaredSubstanceCount")
    if not isinstance(declared, int) or declared < 1:
        declared = None
    return {
        "kind": "one_us_spl_product_label",
        "jurisdiction": "US",
        "route": routes[0] if len(routes) == 1 else None,
        "dosageForm": forms[0] if len(forms) == 1 else None,
        "routesOnLabel": routes,
        "dosageFormsOnLabel": forms,
        "formRoutePairing": "not_established" if len(routes) != 1 or len(forms) != 1 else "single_values_on_label",
        "brandNamesOnLabel": metadata.get("brandNames", []),
        "genericNamesOnLabel": metadata.get("genericNames", []),
        "substanceNamesOnLabel": metadata.get("substanceNames", []),
        "declaredSubstanceCount": declared,
        "compositionStatus": "single_declared_substance" if declared == 1 else (
            "multiple_declared_substances" if declared and declared > 1 else "unknown"
        ),
        "ingredientAttribution": "label_match_only_not_an_ingredient_wide_claim",
        "approvalStatus": "not_established_by_this_source",
    }


def extract(
    rows: Iterable[dict[str, Any]], key: str, metadata_path: Path | None = None,
    max_labels: int = 3, max_per_section: int = 2, max_total: int = 24,
    source_path: Path | None = None,
) -> dict[str, Any]:
    materialized: list[dict[str, Any]] = []
    section_values: dict[tuple[str, str, str], str] = {}
    for row in rows:
        set_id = row.get("source_record_id")
        if row.get("key") != key or row.get("field") not in SECTION_RANK:
            continue
        if not isinstance(set_id, str) or not SET_ID.fullmatch(set_id):
            raise ValueError("Mapped row lacks a valid SPL set ID")
        date = row.get("source_date") or None
        if date is not None and (not isinstance(date, str) or not DATE.fullmatch(date)):
            raise ValueError(f"Invalid source date on set ID {set_id}")
        section_blocks(row.get("value"))  # fail closed on malformed input
        section_key = (set_id, date or "", row["field"])
        previous = section_values.get(section_key)
        if previous is not None:
            if previous != row["value"]:
                raise ValueError(
                    f"Conflicting section rows for set ID {set_id}, date {date}, {row['field']}"
                )
            continue
        section_values[section_key] = row["value"]
        materialized.append(row)

    revisions = sorted(
        {(row["source_record_id"], row.get("source_date") or "") for row in materialized},
        key=lambda item: (-int((item[1] or "0000-00-00").replace("-", "")), item[0]),
    )[:max_labels]
    selected = set(revisions)
    chosen_rows = [row for row in materialized if (
        row["source_record_id"], row.get("source_date") or ""
    ) in selected]
    chosen_rows.sort(key=lambda row: (
        -(int((row.get("source_date") or "0000-00-00").replace("-", ""))),
        row["source_record_id"], SECTION_RANK[row["field"]], sha256(row["value"]),
    ))
    metadata = read_metadata(metadata_path, selected)
    counts: dict[tuple[str, str, str], int] = defaultdict(int)
    by_revision: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in chosen_rows:
        set_id = row["source_record_id"]
        field = row["field"]
        date = row.get("source_date") or None
        count_key = (set_id, date or "", field)
        raw_value = row["value"]
        for block_index, block in enumerate(section_blocks(raw_value)):
            for start, end, excerpt in sentence_spans(block):
                if counts[count_key] >= max_per_section:
                    break
                locator = {
                    "key": key,
                    "setId": set_id,
                    "sourceDate": date,
                    "section": field,
                    "sectionValueSha256": sha256(raw_value),
                    "blockIndex": block_index,
                    "startChar": start,
                    "endCharExclusive": end,
                }
                if source_path is not None:
                    locator["sourceFile"] = str(source_path.resolve())
                if "_line" in row:
                    locator["ndjsonLine"] = row["_line"]
                stable_locator = {key: value for key, value in locator.items() if key not in (
                    "sourceFile", "ndjsonLine"
                )}
                record_metadata = metadata.get((set_id, date or ""), {})
                candidate = {
                    "id": sha256(json.dumps(stable_locator, sort_keys=True, separators=(",", ":")))[:24],
                    "draftOnly": True,
                    "reviewStatus": "unreviewed_source_excerpt",
                    "ingredientKey": key,
                    "verbatimExcerpt": excerpt,
                    "section": field,
                    "scope": scope(record_metadata),
                    "source": {
                        "kind": "openFDA_Structured_Product_Labeling",
                        "setId": set_id,
                        "splId": record_metadata.get("splId"),
                        "version": record_metadata.get("version"),
                        "effectiveDate": date,
                        "url": f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={set_id}",
                        "localLocator": locator,
                        "matchRule": row.get("match_rule"),
                        "licence": row.get("licence"),
                    },
                }
                by_revision[(set_id, date or "")].append(candidate)
                counts[count_key] += 1
            if counts[count_key] >= max_per_section:
                break
    # Round-robin across revisions keeps the hard cap from hiding the second
    # product behind a long first label. Order within each label stays section
    # priority, then source-block order.
    candidates: list[dict[str, Any]] = []
    position = 0
    while len(candidates) < max_total:
        added = False
        for revision in revisions:
            bucket = by_revision[revision]
            if position < len(bucket):
                candidates.append(bucket[position])
                added = True
                if len(candidates) >= max_total:
                    break
        if not added:
            break
        position += 1
    return {
        "schema": "rnawiki-label-candidates/v1",
        "draftOnly": True,
        "ingredientKey": key,
        "selection": {
            "maxLabels": max_labels,
            "maxPerSectionPerLabel": max_per_section,
            "maxTotal": max_total,
            "labelRevisionsSelected": len(selected),
            "matchedSectionRows": len(materialized),
            "candidateCount": len(candidates),
        },
        "limitations": [
            "A label statement is scoped to its identified SPL product label, not every product containing this ingredient.",
            "Without exact-set-ID metadata, dosage form, route, composition and product name are unknown.",
            "The mapped source has no SPL version ID; source date and section-value hash locate the retained row, while the DailyMed URL may later show a newer version.",
            "Excerpts are unreviewed and may omit qualifying context elsewhere in the label; they are not medical advice or publication-ready claims.",
        ],
        "candidates": candidates,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--key", required=True, help="Exact corpus ingredient key; never name-matched")
    parser.add_argument("--metadata", type=Path, help="Optional exact-set-ID SPL metadata NDJSON")
    parser.add_argument("--max-labels", type=int, default=3)
    parser.add_argument("--max-per-section", type=int, default=2)
    parser.add_argument("--max-total", type=int, default=24)
    args = parser.parse_args()
    for flag in ("max_labels", "max_per_section", "max_total"):
        if not 1 <= getattr(args, flag) <= 100:
            parser.error(f"--{flag.replace('_', '-')} must be between 1 and 100")
    if not args.input.is_file():
        parser.error(f"source file not found: {args.input}")
    try:
        result = extract(
            read_rows(args.input, args.key), args.key, args.metadata,
            args.max_labels, args.max_per_section, args.max_total,
            args.input,
        )
    except (ValueError, RuntimeError, OSError, json.JSONDecodeError) as exc:
        parser.exit(2, f"label-candidates: {exc}\n")
    json.dump(result, sys.stdout, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
