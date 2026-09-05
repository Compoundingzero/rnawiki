"""Map the Poisons Standard (SUSMP) schedule lists onto corpus-20k pages.

Reads data/sources/tga-artg/<date>/parsed/susmp-entries.json, resolves each
schedule entry's substance name to a UNII against the FDA UNII name lists already
held under data/corpus-20k/raw/fda-unii/, and joins to corpus pages by the four
mapping rules of docs/specs/revamp-2026-09.md Phase 2, in priority order:

  (a) UNII exact
  (b) full InChIKey exact
  (c) InChIKey skeleton (first 14 characters) linked as form_of, never merged
  (d) normalised name, candidate only, sent to the Phase 3 review list

Writes data/sources/tga-artg/mapped.parquet and data/sources/tga-artg/coverage.json.

The Australian Register of Therapeutic Goods half of regulatory.AU is not in this
output. The TGA website copyright notice permits personal and internal
non-commercial reproduction only and forbids re-transmission, distribution and
commercialisation without written Commonwealth permission, and the TGA eBS host
serves `User-agent: * / Disallow: /`. The blocker and its evidence are in
data/revamp/worklog-entries/2.12-blocker.md.
"""

from __future__ import annotations

import collections
import json
import re
import sys
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index, normalise_name  # noqa: E402
from ema_map import UniiResolver, strict_name  # noqa: E402

FIELD = "regulatory.AU"
LICENCE = (
    "CC BY 4.0 (Creative Commons Attribution 4.0 International). Federal Register of "
    "Legislation terms governing the use of this website: all content except the "
    "Commonwealth Coat of Arms is provided under CC BY 4.0; reuse requires a link to the "
    "relevant Legislation Register page and attribution to the Federal Register of "
    "Legislation with a link to the licence and an indication of any changes "
    "(https://www.legislation.gov.au/terms-of-use)"
)
ATTRIBUTION = (
    "Sourced from the Federal Register of Legislation at 6 September 2026. For the latest "
    "information on Australian Government law please go to https://www.legislation.gov.au."
)
ARTG_NOTE = (
    "Australian Register of Therapeutic Goods status was not retrieved. The TGA website "
    "copyright notice permits reproduction for personal or internal organisational use only, "
    "on condition the reproduction is not used for any commercial purpose, and states that "
    "re-transmission, distribution and commercialisation require prior written Commonwealth "
    "approval; the TGA eBS host serves User-agent: * / Disallow: /. See "
    "data/revamp/worklog-entries/2.12-blocker.md."
)

SCHEMA = pa.schema(
    [
        ("key", pa.string()),
        ("tier", pa.int8()),
        ("field", pa.string()),
        ("value", pa.string()),
        ("source_record_id", pa.string()),
        ("source_url", pa.string()),
        ("source_date", pa.string()),
        ("match_rule", pa.string()),
        ("form_of_target", pa.string()),
        ("licence", pa.string()),
    ]
)

# Words the Standard uses for a class of substances rather than one substance.
CLASS_TAIL = re.compile(
    r"\b(COMPOUNDS|DERIVATIVES|SALTS|SPP|ESTERS|ETHERS|ANALOGUES|HOMOLOGUES|ALKALOIDS)$"
)


def main(pull_date: str) -> int:
    root = Path("data/sources/tga-artg") / pull_date
    parsed_path = root / "parsed" / "susmp-entries.json"
    if not parsed_path.exists():
        print(f"missing parsed entries: {parsed_path}", file=sys.stderr)
        return 1
    parsed = json.loads(parsed_path.read_text())
    manifest_path = root / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {"files": []}

    instrument = parsed["instrument"]
    register_id = instrument["registerId"]
    page_url = f"https://www.legislation.gov.au/{register_id}/asmade"

    idx = load_corpus_index()
    corpus_uniis = set(idx.unii_to_keys)
    resolver = UniiResolver(idx.salts)

    rows: list[dict] = []
    pages_by_tier: dict[int, set[str]] = {1: set(), 2: set(), 3: set()}
    pages_by_tier_rule: dict[int, collections.Counter] = {
        1: collections.Counter(), 2: collections.Counter(), 3: collections.Counter()
    }
    rule_counts = collections.Counter()
    schedule_entry_counts = collections.Counter()
    schedule_matched_entries = collections.Counter()
    schedule_pages: dict[str, set[str]] = collections.defaultdict(set)
    substance_outcome = collections.Counter()
    name_candidates: dict[str, dict] = {}
    ambiguous: dict[str, dict] = {}
    unmatched_entries: list[dict] = []
    truncated_names: list[dict] = []

    for schedule in parsed["schedules"]:
        number = schedule["schedule"]
        title = schedule["title"]
        for position, entry in enumerate(schedule["entries"], start=1):
            schedule_entry_counts[number] += 1
            name = entry["name"]
            record_id = f"frl:{register_id}:schedule-{number}:{position:04d}"

            # A name the parser could not close (it ends on a bond hyphen or an
            # unclosed bracket) is recorded and not matched.
            if name.endswith("-") or name.count("(") != name.count(")"):
                truncated_names.append(
                    {
                        "schedule": number,
                        "sourceRecordId": record_id,
                        "extractedName": name,
                        "entryText": entry["text"],
                    }
                )
                unmatched_entries.append(
                    {
                        "schedule": number,
                        "sourceRecordId": record_id,
                        "name": name,
                        "reason": "systematic_name_not_closed_by_parser",
                        "entryText": entry["text"],
                    }
                )
                substance_outcome["parser_open_name"] += 1
                continue

            base_record = {
                "jurisdiction": "AU",
                "register": "SUSMP",
                "registerName": "Standard for the Uniform Scheduling of Medicines and Poisons",
                "instrumentName": instrument["name"],
                "instrumentCommonName": instrument["commonName"],
                "instrumentRegisterId": register_id,
                "susmpSchedule": number,
                "susmpScheduleTitle": title,
                "entryName": name,
                "entryText": entry["text"],
                "appendixD": entry["appendixD"],
                "artgStatus": None,
                "artgStatusNote": ARTG_NOTE,
            }
            if entry["aliases"]:
                base_record["entryAliases"] = entry["aliases"]
            if entry["qualifications"]:
                base_record["entryQualifications"] = entry["qualifications"]
            if entry["trivialName"]:
                base_record["trivialNameMarked"] = True

            candidate_names = [name] + list(entry["aliases"])
            matched: dict[str, tuple[str, str | None, dict]] = {}

            for raw_name in candidate_names:
                unii, how = resolver.resolve(raw_name, corpus_uniis, idx.salts)
                provenance = {
                    "matched_substance": raw_name,
                    "matched_on": "entry_name" if raw_name == name else "entry_alias",
                    "substance_resolution": how,
                }
                if unii:
                    provenance["matched_unii"] = unii
                    inchikeys = resolver.inchikey.get(unii, [])
                    if inchikeys:
                        provenance["matched_inchikey"] = inchikeys
                    keys = idx.unii_to_keys.get(unii)
                    if keys:
                        substance_outcome["unii"] += 1
                        for key in keys:
                            matched.setdefault(key, ("unii", None, provenance))
                        continue
                    by_inchikey = [k for ik in inchikeys for k in idx.inchikey_to_keys.get(ik, ())]
                    if by_inchikey:
                        substance_outcome["inchikey"] += 1
                        for key in by_inchikey:
                            matched.setdefault(key, ("inchikey", None, provenance))
                        continue
                    by_skeleton = [k for ik in inchikeys for k in idx.skeleton_to_keys.get(ik[:14], ())]
                    if by_skeleton:
                        substance_outcome["skeleton"] += 1
                        for key in by_skeleton:
                            matched.setdefault(key, ("skeleton", unii, provenance))
                        continue
                elif how == "ambiguous_unii_name_match":
                    s = strict_name(raw_name)
                    bucket = (
                        resolver.strict.get(s)
                        or resolver.loose.get(normalise_name(raw_name, idx.salts))
                        or set()
                    )
                    ambiguous.setdefault(
                        raw_name,
                        {
                            "substance": raw_name,
                            "candidate_uniis": sorted(bucket),
                            "candidate_uniis_in_corpus": sorted(bucket & corpus_uniis),
                            "entries": [],
                        },
                    )["entries"].append(record_id)

                norm = normalise_name(raw_name, idx.salts)
                keys = idx.name_to_keys.get(norm) if len(norm) >= 3 else None
                if keys:
                    substance_outcome["name-candidate"] += 1
                    for key in keys:
                        matched.setdefault(key, ("name-candidate", None, provenance))
                    candidate = name_candidates.setdefault(
                        raw_name,
                        {
                            "substance": raw_name,
                            "normalised": norm,
                            "candidate_page_keys": [],
                            "entries": [],
                            "reason": how,
                            "classEntry": bool(CLASS_TAIL.search(raw_name)),
                            "shortName": len(norm) <= 4,
                        },
                    )
                    for key in keys:
                        if key not in candidate["candidate_page_keys"]:
                            candidate["candidate_page_keys"].append(key)
                    candidate["entries"].append(record_id)
                else:
                    substance_outcome["unresolved"] += 1

            if not matched:
                unmatched_entries.append(
                    {
                        "schedule": number,
                        "sourceRecordId": record_id,
                        "name": name,
                        "reason": "no_corpus_page_for_this_substance",
                        "entryText": entry["text"],
                    }
                )
                continue

            schedule_matched_entries[number] += 1
            for key, (rule, form_of, provenance) in sorted(matched.items()):
                tier = idx.tier_of(key)
                pages_by_tier[tier].add(key)
                pages_by_tier_rule[tier][rule] += 1
                rule_counts[rule] += 1
                schedule_pages[number].add(key)
                record = dict(base_record)
                record.update(provenance)
                record["match_rule"] = rule
                if rule == "skeleton":
                    record["relation_to_page"] = "form_of"
                if rule == "name-candidate":
                    record["confirmation"] = (
                        "unconfirmed: the Poisons Standard carries no chemical identifier and no "
                        "UNII or InChIKey confirmed this substance name; sent to the Phase 3 "
                        "review list"
                    )
                rows.append(
                    {
                        "key": key,
                        "tier": tier,
                        "field": FIELD,
                        "value": json.dumps(record, sort_keys=True, ensure_ascii=False),
                        "source_record_id": record_id,
                        "source_url": page_url,
                        "source_date": pull_date,
                        "match_rule": rule,
                        "form_of_target": form_of,
                        "licence": LICENCE,
                    }
                )

    out = Path("data/sources/tga-artg/mapped.parquet")
    pq.write_table(pa.Table.from_pylist(rows, schema=SCHEMA), out, compression="zstd")

    review_path = Path("data/sources/tga-artg/name-candidates-for-review.json")
    review_path.write_text(
        json.dumps(
            {
                "source": "tga-artg",
                "generated": pull_date,
                "rule": (
                    "revamp-2026-09 Phase 2 mapping rule (d): a normalised-name match is a "
                    "candidate until a UNII or InChIKey confirms it. Every entry below is "
                    "unconfirmed. classEntry marks a Poisons Standard entry that names a class "
                    "of substances rather than one substance; shortName marks a normalised name "
                    "of four characters or fewer, where a collision is more likely."
                ),
                "count": len(name_candidates),
                "candidates": sorted(name_candidates.values(), key=lambda c: c["substance"]),
                "ambiguousUniiResolutions": sorted(ambiguous.values(), key=lambda c: c["substance"]),
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )

    unmatched_path = Path("data/sources/tga-artg/unmatched-records.json")
    unmatched_path.write_text(
        json.dumps(
            {
                "source": "tga-artg",
                "generated": pull_date,
                "count": len(unmatched_entries),
                "records": unmatched_entries,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )

    matched_pages = set().union(*pages_by_tier.values()) if rows else set()
    coverage = {
        "source": "tga-artg",
        "sourceName": (
            "Poisons Standard (SUSMP) schedule lists, Therapeutic Goods "
            "(Poisons Standard—June 2026) Instrument 2026, Federal Register of Legislation"
        ),
        "status": "mapped-partial",
        "statusReason": (
            "The SUSMP schedule half of regulatory.AU is mapped. The ARTG half (active "
            "ingredient, ARTG id, ARTG status) is BLOCKED-WITH-EVIDENCE: the TGA website "
            "copyright notice allows personal or internal non-commercial reproduction only and "
            "requires prior written Commonwealth approval to re-transmit, distribute or "
            "commercialise, and www.ebs.tga.gov.au serves User-agent: * / Disallow: /. "
            "www.tga.gov.au was also unreachable from this workstation across nine attempts on "
            "two days. Evidence: data/revamp/worklog-entries/2.12-blocker.md."
        ),
        "retrievalDate": pull_date,
        "instrument": instrument,
        "licence": LICENCE,
        "attribution": ATTRIBUTION,
        "rawFiles": manifest.get("rawFileCount", 0),
        "rawBytes": manifest.get("rawBytes", 0),
        "legalArtefacts": sum(1 for f in manifest.get("files", []) if f.get("role") == "legal"),
        "schedulesParsed": [s["schedule"] for s in parsed["schedules"]],
        "scheduleScopeNote": (
            "Schedules 2 to 9 are the range named in the Phase 2 brief. Schedule 10 "
            "(substances of such danger to health as to warrant prohibition of supply and use) "
            "is parsed and mapped alongside them because it is the same list structure in the "
            "same instrument and it changes what a reader may lawfully obtain in Australia. "
            "Schedule 1 is intentionally blank in the Standard."
        ),
        "sourceEntries": parsed["entryCount"],
        "sourceEntriesBySchedule": {k: schedule_entry_counts[k] for k in sorted(schedule_entry_counts, key=int)},
        "entriesMatched": sum(schedule_matched_entries.values()),
        "entriesMatchedBySchedule": {k: schedule_matched_entries[k] for k in sorted(schedule_matched_entries, key=int)},
        "mappedRows": len(rows),
        "pagesMatchedByTier": {str(t): len(pages_by_tier[t]) for t in (1, 2, 3)},
        "pagesMatchedTotal": len(matched_pages),
        "pagesMatchedBySchedule": {k: len(schedule_pages[k]) for k in sorted(schedule_pages, key=int)},
        "fieldsGainedByTier": {
            str(t): ({FIELD: len(pages_by_tier[t])} if pages_by_tier[t] else {}) for t in (1, 2, 3)
        },
        "fieldsGained": [FIELD],
        "matchRuleCounts": dict(rule_counts),
        "matchRuleCountsByTier": {str(t): dict(pages_by_tier_rule[t]) for t in (1, 2, 3)},
        "substanceResolutionOutcomes": dict(substance_outcome),
        "unmatchedRecords": len(unmatched_entries),
        "unmatchedRecordsFile": str(unmatched_path),
        "nameCandidatesSentToReview": len(name_candidates),
        "ambiguousUniiResolutions": len(ambiguous),
        "nameCandidateFile": str(review_path),
        "parserOpenNames": len(truncated_names),
        "parserOpenNameExamples": truncated_names[:10],
        "mappedParquet": str(out),
        "manifest": str(manifest_path),
        "saltListChange": (
            "scripts/revamp/salts.txt was read and not extended. Poisons Standard entries are "
            "written as the substance name with the conditions of scheduling in following prose, "
            "and the trailing tokens that failed to resolve are class words (COMPOUNDS, "
            "DERIVATIVES, SALTS, SPP) and plant genus names, not counter-ions, so no suffix was "
            "appended."
        ),
        "method": (
            "The Poisons Standard carries no UNII, InChIKey, CAS or structure. Each schedule "
            "entry's substance name, and any trivial name the Standard marks with an asterisk, "
            "was resolved to a UNII against the FDA UNII name lists (types of/cn/sys; brand and "
            "code names excluded), exact punctuation-normalised name first, then the shared "
            "salt-stripped normaliser. A name resolving to more than one UNII is disambiguated by "
            "an exact UNII preferred-name match, then by a single corpus-present UNII; anything "
            "still ambiguous is not treated as a UNII match. A resolved UNII joins the corpus by "
            "UNII, then by its full InChIKey, then by InChIKey skeleton as form_of. A substance "
            "with no resolved UNII joins by normalised name as an unconfirmed candidate only."
        ),
    }
    Path("data/sources/tga-artg/coverage.json").write_text(
        json.dumps(coverage, indent=2, ensure_ascii=False) + "\n"
    )

    print(json.dumps({k: coverage[k] for k in (
        "sourceEntries", "entriesMatched", "mappedRows", "pagesMatchedByTier",
        "pagesMatchedTotal", "matchRuleCounts", "nameCandidatesSentToReview",
        "ambiguousUniiResolutions", "unmatchedRecords", "parserOpenNames",
    )}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "2026-09-06"))
