"""Map the on-disk ClinicalTrials.gov snapshot onto corpus pages.

Phase 2 item 17 of `docs/specs/revamp-2026-09.md`. The registry was already matched
to pages during corpus-20k (`scripts/corpus-20k/registry/match.ts`, output
`data/corpus-20k/registry/matches/`), so this script refetches nothing: it reuses
those page-to-NCT links, re-reads the per-trial facts straight out of the snapshot,
and writes one row per page and field.

The registry publishes no UNII, InChIKey or structure of any kind on any study
record, so mapping rules (a), (b) and (c) of the spec cannot fire for this source.
Every link is a normalised-name link, made by `normalizeInterventionName` over
intervention names and intervention other-names against page display names and
synonyms, with a four-character minimum key length. Rows are therefore written with
`match_rule = name-candidate`, and every page is listed for Phase 3 review with the
structural identifier the page itself holds, so a reviewer can see which links have
a corpus-side anchor and which have none.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_map.py [YYYY-MM-DD]
"""

from __future__ import annotations

import csv
import json
import statistics
import sys
from collections import Counter, defaultdict
from datetime import date as date_cls
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index  # noqa: E402

SNAPSHOT_DIR = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/clinicaltrials/20260901T090005"
)
STUDIES = SNAPSHOT_DIR / "studies.ndjson"
SNAPSHOT_MANIFEST = SNAPSHOT_DIR / "manifest.json"
MATCHES_DIR = Path("data/corpus-20k/registry/matches")
AGGREGATES_DIR = Path("data/corpus-20k/registry/aggregates")

OUT_PARQUET = Path("data/sources/clinicaltrials/mapped.parquet")
OUT_COVERAGE = Path("data/sources/clinicaltrials/coverage.json")
REVIEW_CSV = Path("data/revamp/name-candidates/clinicaltrials.csv")

SOURCE_URL = "https://clinicaltrials.gov/api/v2/studies"
STUDY_URL = "https://clinicaltrials.gov/study/"
LICENCE = (
    "US Government work, public domain (National Library of Medicine). "
    "NLM Web Policies: works produced by the U.S. government are not subject to "
    "copyright protection in the United States and may be freely used or reproduced "
    "without permission. Attribution requested, not required: "
    "\"Source: National Library of Medicine\". "
    "Evidence: data/sources/clinicaltrials/2026-09-06/legal/"
)

FIELDS = [
    "registry.trialCount",
    "registry.hasResults",
    "registry.enrolment",
    "registry.phases",
    "registry.statuses",
    "registry.completionDates",
    "registry.whyStopped",
    "registry.design",
]

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

STOPPED_STATUSES = {"TERMINATED", "SUSPENDED", "WITHDRAWN"}


def read_matches() -> dict[str, list[dict]]:
    """page key -> [{nct, matchedName, role}], deduplicated on NCT, order preserved."""
    per_page: dict[str, list[dict]] = {}
    for path in sorted(MATCHES_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                record = json.loads(line)
                key = record["key"]
                seen: set[str] = set()
                links: list[dict] = []
                for entry in record.get("nctIds") or []:
                    nct = entry.get("nct")
                    if not nct or nct in seen:
                        continue
                    seen.add(nct)
                    links.append(entry)
                if links:
                    per_page[key] = links
    return per_page


def read_snapshot(wanted: set[str]) -> dict[str, dict]:
    """Slim per-trial record for every wanted NCT, straight from the snapshot."""
    trials: dict[str, dict] = {}
    with STUDIES.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            study = json.loads(line)
            protocol = study.get("protocolSection") or {}
            nct = ((protocol.get("identificationModule") or {}).get("nctId"))
            if not nct or nct not in wanted:
                continue
            status_mod = protocol.get("statusModule") or {}
            design = protocol.get("designModule") or {}
            design_info = design.get("designInfo") or {}
            enrol = design.get("enrollmentInfo") or {}
            phases = design.get("phases") or []
            trials[nct] = {
                "nct": nct,
                "status": status_mod.get("overallStatus"),
                "whyStopped": (status_mod.get("whyStopped") or "").strip() or None,
                "startDate": (status_mod.get("startDateStruct") or {}).get("date"),
                "primaryCompletionDate": (
                    status_mod.get("primaryCompletionDateStruct") or {}
                ).get("date"),
                "completionDate": (status_mod.get("completionDateStruct") or {}).get("date"),
                "resultsFirstPostDate": (
                    status_mod.get("resultsFirstPostDateStruct") or {}
                ).get("date"),
                "lastUpdatePostDate": (
                    status_mod.get("lastUpdatePostDateStruct") or {}
                ).get("date"),
                "hasResults": bool(study.get("hasResults")),
                "phase": phases[0] if len(phases) == 1 else (phases or None),
                "phases": phases,
                "studyType": design.get("studyType"),
                "enrollment": enrol.get("count"),
                "enrollmentType": enrol.get("type"),
                "allocation": design_info.get("allocation"),
                "masking": (design_info.get("maskingInfo") or {}).get("masking"),
                "primaryPurpose": design_info.get("primaryPurpose"),
            }
    return trials


def read_topup(pull_date: str) -> dict[str, dict]:
    """Date types and intervention model for the matched studies.

    The 2026-09-01 snapshot requested `StartDate`, `PrimaryCompletionDate` and
    `CompletionDate` without their `*Type` companions, so it cannot distinguish an
    ACTUAL date from an ESTIMATED one, and it did not request
    `DesignInterventionModel`. `clinicaltrials_topup_fetch.py` fetched both for the
    matched studies only; this reads the cached responses.
    """
    raw_dir = Path("data/sources/clinicaltrials") / pull_date / "raw"
    extra: dict[str, dict] = {}
    for path in sorted(raw_dir.glob("topup-*.json")):
        payload = json.loads(path.read_text())
        for study in payload.get("studies") or []:
            protocol = study.get("protocolSection") or {}
            nct = (protocol.get("identificationModule") or {}).get("nctId")
            if not nct:
                continue
            status_mod = protocol.get("statusModule") or {}
            design_info = (protocol.get("designModule") or {}).get("designInfo") or {}
            extra[nct] = {
                "startDateType": (status_mod.get("startDateStruct") or {}).get("type"),
                "primaryCompletionDateType": (
                    status_mod.get("primaryCompletionDateStruct") or {}
                ).get("type"),
                "completionDateType": (status_mod.get("completionDateStruct") or {}).get("type"),
                "interventionModel": design_info.get("interventionModel"),
            }
    return extra


def date_sort_key(value: str | None) -> str:
    """ClinicalTrials.gov dates are YYYY, YYYY-MM or YYYY-MM-DD; pad for ordering."""
    if not value:
        return ""
    parts = value.split("-")
    while len(parts) < 3:
        parts.append("01")
    return "-".join(p.zfill(2) if i else p.zfill(4) for i, p in enumerate(parts))


def main(pull_date: str) -> int:
    snapshot_manifest = json.loads(SNAPSHOT_MANIFEST.read_text())
    snapshot_id = (
        f"clinicaltrials.gov:api-v2-studies-snapshot:{snapshot_manifest['dataTimestamp']}"
    )
    source_date = snapshot_manifest["dataTimestamp"][:10]

    idx = load_corpus_index()
    per_page = read_matches()
    wanted = {entry["nct"] for links in per_page.values() for entry in links}
    trials = read_snapshot(wanted)

    topup = read_topup(pull_date)
    topup_applied = 0
    for nct, record in trials.items():
        extra = topup.get(nct)
        if extra is None:
            record.update(
                {
                    "startDateType": None,
                    "primaryCompletionDateType": None,
                    "completionDateType": None,
                    "interventionModel": None,
                }
            )
            continue
        record.update(extra)
        topup_applied += 1
    topup_missing = sorted(n for n in trials if n not in topup)

    missing_ncts = wanted - set(trials)
    pages_not_in_corpus = sorted(k for k in per_page if k not in idx.tier)

    rows: list[dict] = []
    pages_by_tier: dict[int, set[str]] = {1: set(), 2: set(), 3: set()}
    fields_by_tier: dict[int, Counter[str]] = {1: Counter(), 2: Counter(), 3: Counter()}
    pages_with_structure = 0
    pages_without_structure = 0
    review_rows: list[dict] = []
    ambiguous_links = 0
    trial_pairs = 0

    key_inchikey: dict[str, str] = {}
    for inchikey_value, keys in idx.inchikey_to_keys.items():
        for k in keys:
            key_inchikey.setdefault(k, inchikey_value)

    key_by_nct: dict[str, list[str]] = defaultdict(list)
    for key, links in per_page.items():
        if key not in idx.tier:
            continue
        for entry in links:
            key_by_nct[entry["nct"]].append(key)

    for key in sorted(per_page):
        if key not in idx.tier:
            continue
        tier = idx.tier_of(key)
        links = [e for e in per_page[key] if e["nct"] in trials]
        if not links:
            continue
        page_trials = [trials[e["nct"]] for e in links]
        page_trials.sort(key=lambda t: t["nct"])
        trial_pairs += len(page_trials)
        ambiguous_links += sum(1 for e in links if len(key_by_nct[e["nct"]]) > 1)

        unii = idx.key_unii.get(key)
        inchikey = key_inchikey.get(key)
        pages_by_tier[tier].add(key)

        def emit(field: str, value: dict) -> None:
            rows.append(
                {
                    "key": key,
                    "tier": tier,
                    "field": field,
                    "value": json.dumps(value, sort_keys=True, ensure_ascii=False),
                    "source_record_id": snapshot_id,
                    "source_url": SOURCE_URL,
                    "source_date": source_date,
                    "match_rule": "name-candidate",
                    "form_of_target": None,
                    "licence": LICENCE,
                }
            )
            fields_by_tier[tier][field] += 1

        # 1. trial count
        emit(
            "registry.trialCount",
            {
                "trials": len(page_trials),
                "interventional": sum(1 for t in page_trials if t["studyType"] == "INTERVENTIONAL"),
                "observational": sum(1 for t in page_trials if t["studyType"] == "OBSERVATIONAL"),
                "byStudyType": dict(
                    sorted(
                        Counter(t["studyType"] or "UNSTATED" for t in page_trials).items(),
                        key=lambda kv: -kv[1],
                    )
                ),
                "ncts": [t["nct"] for t in page_trials],
                "studyUrlPrefix": STUDY_URL,
                "snapshot": snapshot_manifest["dataTimestamp"],
            },
        )

        # 2. results posted
        with_results = [t for t in page_trials if t["hasResults"]]
        completed = [t for t in page_trials if t["status"] == "COMPLETED"]
        completed_no_results = [t for t in completed if not t["hasResults"]]
        emit(
            "registry.hasResults",
            {
                "trials": len(page_trials),
                "withResults": len(with_results),
                "withoutResults": len(page_trials) - len(with_results),
                "completed": len(completed),
                "completedWithoutResults": len(completed_no_results),
                "resultsPosted": [
                    {"nct": t["nct"], "resultsFirstPostDate": t["resultsFirstPostDate"]}
                    for t in with_results
                ],
                "completedWithoutResultsNcts": [
                    {"nct": t["nct"], "completionDate": t["completionDate"]}
                    for t in completed_no_results
                ],
            },
        )

        # 3. enrolment
        enrolments = [t["enrollment"] for t in page_trials if isinstance(t["enrollment"], int)]
        # statistics.median returns the mean of the two middle values on an even count,
        # exactly as the corpus-20k TypeScript aggregate does; keep the .5 rather than
        # truncating it, so the two records of the same snapshot agree value for value.
        median = statistics.median(enrolments) if enrolments else None
        if median is not None and float(median).is_integer():
            median = int(median)
        emit(
            "registry.enrolment",
            {
                "n": len(enrolments),
                "trialsWithoutEnrolment": len(page_trials) - len(enrolments),
                "min": min(enrolments) if enrolments else None,
                "max": max(enrolments) if enrolments else None,
                "median": median,
                "sum": sum(enrolments) if enrolments else None,
                "perTrial": [
                    {
                        "nct": t["nct"],
                        "enrollment": t["enrollment"],
                        "type": t["enrollmentType"],
                    }
                    for t in page_trials
                    if isinstance(t["enrollment"], int)
                ],
            },
        )

        # 4. phases
        phase_counter: Counter[str] = Counter()
        for t in page_trials:
            for phase in (t["phases"] or ["NA_OR_UNSTATED"]):
                phase_counter[phase] += 1
        emit(
            "registry.phases",
            {
                "byPhase": dict(sorted(phase_counter.items(), key=lambda kv: -kv[1])),
                "perTrial": [
                    {"nct": t["nct"], "phases": t["phases"] or ["NA_OR_UNSTATED"]}
                    for t in page_trials
                ],
            },
        )

        # 5. statuses
        status_counter = Counter(t["status"] or "UNSTATED" for t in page_trials)
        emit(
            "registry.statuses",
            {
                "byOverallStatus": dict(sorted(status_counter.items(), key=lambda kv: -kv[1])),
                "perTrial": [{"nct": t["nct"], "status": t["status"]} for t in page_trials],
            },
        )

        # 6. completion dates
        completion_dates = [t for t in page_trials if t["completionDate"]]
        starts = [t for t in page_trials if t["startDate"]]
        completed_dated = [t for t in completed if t["completionDate"]]
        emit(
            "registry.completionDates",
            {
                "trialsWithCompletionDate": len(completion_dates),
                "trialsWithoutCompletionDate": len(page_trials) - len(completion_dates),
                "firstStartDate": min(
                    (t["startDate"] for t in starts), key=date_sort_key, default=None
                ),
                "lastCompletionDate": max(
                    (t["completionDate"] for t in completed_dated),
                    key=date_sort_key,
                    default=None,
                ),
                "lastCompletionDateOver": "studies whose registry overall status is COMPLETED",
                "lastActualCompletionDate": max(
                    (
                        t["completionDate"]
                        for t in completed_dated
                        if t["completionDateType"] == "ACTUAL"
                    ),
                    key=date_sort_key,
                    default=None,
                ),
                "lastActualCompletionDateOver": (
                    "studies whose registry overall status is COMPLETED and whose completion "
                    "date the sponsor marked ACTUAL"
                ),
                "completionDateActual": sum(
                    1 for t in completion_dates if t["completionDateType"] == "ACTUAL"
                ),
                "completionDateEstimated": sum(
                    1 for t in completion_dates if t["completionDateType"] == "ESTIMATED"
                ),
                "completionDateTypeUnstated": sum(
                    1 for t in completion_dates if not t["completionDateType"]
                ),
                "perTrial": [
                    {
                        "nct": t["nct"],
                        "startDate": t["startDate"],
                        "startDateType": t["startDateType"],
                        "primaryCompletionDate": t["primaryCompletionDate"],
                        "primaryCompletionDateType": t["primaryCompletionDateType"],
                        "completionDate": t["completionDate"],
                        "completionDateType": t["completionDateType"],
                    }
                    for t in page_trials
                ],
            },
        )

        # 7. why stopped
        stopped = [t for t in page_trials if t["status"] in STOPPED_STATUSES]
        emit(
            "registry.whyStopped",
            {
                "stoppedTrials": len(stopped),
                "stoppedWithReason": sum(1 for t in stopped if t["whyStopped"]),
                "stoppedWithoutReason": sum(1 for t in stopped if not t["whyStopped"]),
                "perTrial": [
                    {
                        "nct": t["nct"],
                        "status": t["status"],
                        "whyStopped": t["whyStopped"],
                        "completionDate": t["completionDate"],
                    }
                    for t in stopped
                ],
            },
        )

        # 8. design
        interventional = [t for t in page_trials if t["studyType"] == "INTERVENTIONAL"]
        emit(
            "registry.design",
            {
                "interventionalTrials": len(interventional),
                "byAllocation": dict(
                    sorted(
                        Counter(
                            t["allocation"] or "UNSTATED" for t in interventional
                        ).items(),
                        key=lambda kv: -kv[1],
                    )
                ),
                "byMasking": dict(
                    sorted(
                        Counter(t["masking"] or "UNSTATED" for t in interventional).items(),
                        key=lambda kv: -kv[1],
                    )
                ),
                "byPrimaryPurpose": dict(
                    sorted(
                        Counter(
                            t["primaryPurpose"] or "UNSTATED" for t in interventional
                        ).items(),
                        key=lambda kv: -kv[1],
                    )
                ),
                "byInterventionModel": dict(
                    sorted(
                        Counter(
                            t["interventionModel"] or "UNSTATED" for t in interventional
                        ).items(),
                        key=lambda kv: -kv[1],
                    )
                ),
                "randomised": sum(1 for t in interventional if t["allocation"] == "RANDOMIZED"),
                "nonRandomised": sum(
                    1 for t in interventional if t["allocation"] == "NON_RANDOMIZED"
                ),
                "perTrial": [
                    {
                        "nct": t["nct"],
                        "allocation": t["allocation"],
                        "masking": t["masking"],
                        "primaryPurpose": t["primaryPurpose"],
                        "interventionModel": t["interventionModel"],
                    }
                    for t in interventional
                ],
            },
        )

        structure_anchor = []
        if unii:
            structure_anchor.append(f"unii:{unii}")
        if inchikey:
            structure_anchor.append(f"inchikey:{inchikey}")
        review_rows.append(
            {
                "key": key,
                "tier": tier,
                "displayName": idx.display.get(key, key),
                "trials": len(page_trials),
                "matchedNames": "; ".join(
                    sorted({e.get("matchedName") or "" for e in links if e.get("matchedName")})[:5]
                ),
                "roles": "; ".join(sorted({e.get("role") or "" for e in links})),
                "pageStructuralAnchor": "; ".join(structure_anchor) or "none",
                "confirmedByUniiOrInchikey": "no",
                "reason": (
                    "ClinicalTrials.gov publishes no UNII, InChIKey or structure on any study "
                    "record, so a registry link can never be confirmed by rule (a) or (b)."
                ),
            }
        )
        if structure_anchor:
            pages_with_structure += 1
        else:
            pages_without_structure += 1

    table = pa.Table.from_pylist(rows, schema=SCHEMA)
    OUT_PARQUET.parent.mkdir(parents=True, exist_ok=True)
    pq.write_table(table, OUT_PARQUET, compression="zstd")

    REVIEW_CSV.parent.mkdir(parents=True, exist_ok=True)
    with REVIEW_CSV.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(review_rows[0].keys()))
        writer.writeheader()
        writer.writerows(review_rows)

    aggregate_pages = set()
    for path in sorted(AGGREGATES_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    aggregate_pages.add(json.loads(line)["key"])

    matched_pages = set().union(*pages_by_tier.values())
    coverage = {
        "source": "clinicaltrials",
        "sourceName": "ClinicalTrials.gov, API v2 studies snapshot",
        "status": "mapped",
        "retrievalDate": pull_date,
        "snapshotRefetched": False,
        "snapshotRefetchNote": (
            "The snapshot of 2026-09-01T09:00:05 was already on disk at "
            f"{STUDIES} and the Phase 2 brief forbids refetching it. Its recorded SHA256 was "
            f"re-verified byte for byte before use (data/sources/clinicaltrials/{pull_date}/"
            "snapshot-field-audit.json). The only registry requests made on the retrieval date "
            "are the date-type and intervention-model top-up described under topUpFetched, plus "
            "four legal pages; every request is in requests.log."
        ),
        "licence": LICENCE,
        "attribution": "Source: National Library of Medicine",
        "snapshot": {
            "apiVersion": snapshot_manifest["apiVersion"],
            "dataTimestamp": snapshot_manifest["dataTimestamp"],
            "studies": snapshot_manifest["studies"],
            "sha256": snapshot_manifest["studiesSha256"],
        },
        "rawFiles": 3,
        "rawBytes": sum(
            (SNAPSHOT_DIR / name).stat().st_size
            for name in ("studies.ndjson", "manifest.json", "checkpoint.json")
        ),
        "corpusPagesByTier": {str(t): sum(1 for k in idx.tier if idx.tier_of(k) == t) for t in (1, 2, 3)},
        "corpusPagesTotal": len(idx.tier),
        "pagesMatchedByTier": {str(t): len(pages_by_tier[t]) for t in (1, 2, 3)},
        "pagesMatchedTotal": len(matched_pages),
        "fieldsGained": FIELDS,
        "fieldsGainedByTier": {str(t): dict(fields_by_tier[t]) for t in (1, 2, 3)},
        "mappedRows": len(rows),
        "pageTrialPairs": trial_pairs,
        "distinctTrialsUsed": len({n for n in wanted if n in trials}),
        "matchRuleCounts": {"name-candidate": len(matched_pages)},
        "matchRuleCountsByTier": {
            str(t): {"name-candidate": len(pages_by_tier[t])} for t in (1, 2, 3)
        },
        "matchRuleNote": (
            "Rules (a) UNII, (b) full InChIKey and (c) InChIKey skeleton cannot fire for this "
            "source: no ClinicalTrials.gov study record carries a UNII, an InChIKey or a "
            "structure. Every link is rule (d), a normalised intervention name, made by "
            "scripts/corpus-20k/registry/match.ts during corpus-20k and reused unchanged."
        ),
        "topUpFetched": {
            "reason": (
                "The 2026-09-01 snapshot requested StartDate, PrimaryCompletionDate and "
                "CompletionDate but not their *Type companions, so it records a date with no way "
                "to tell an ACTUAL date from an ESTIMATED one, and it did not request "
                "DesignInterventionModel. Both are read by the trial-size and registry-gap "
                "sections: a last completion date that is an estimate is a plan, not an event."
            ),
            "fields": [
                "StartDateType",
                "PrimaryCompletionDateType",
                "CompletionDateType",
                "DesignInterventionModel",
            ],
            "scope": "the studies already linked to a corpus page, not the whole registry",
            "calls": len(list((Path("data/sources/clinicaltrials") / pull_date / "raw").glob("topup-*.json"))),
            "idsPerCall": 400,
            "ceilingForThisStep": 500,
            "studiesCovered": topup_applied,
            "studiesNotReturned": len(topup_missing),
            "studiesNotReturnedSample": topup_missing[:20],
            "callsToAddTheSameFieldsForTheWholeRegistry": 602,
            "callsToAddTheSameFieldsForTheWholeRegistryMethod": (
                "601,158 studies at the measured pageSize ceiling of 1,000 per page; the "
                "snapshot run itself took 602 pages."
            ),
        },
        "unmatchedRecords": len(missing_ncts),
        "unmatchedRecordsNote": (
            "Studies linked to a page by the corpus-20k matcher that are absent from the "
            "2026-09-01 snapshot."
        ),
        "studiesInSnapshotNotLinkedToAnyPage": snapshot_manifest["studies"] - len(
            {n for n in wanted if n in trials}
        ),
        "pagesInMatchesAbsentFromCurrentCorpus": len(pages_not_in_corpus),
        "pagesInMatchesAbsentFromCurrentCorpusSample": pages_not_in_corpus[:20],
        "corpus20kSummaryReconciliation": {
            "finding": (
                "data/corpus-20k/registry/summary.json describes an earlier match run and no "
                "longer describes the files beside it. It reports 8,775 pages with studies, "
                "328,324 page-study pairs and 155,671 distinct studies, and its files list names "
                "72 batch files totalling 17,550 records. The matches and aggregates directories "
                "on disk hold 70 files, 8,663 records each side, 326,420 page-study pairs and "
                "155,645 distinct studies, and aggregates-v3.json (generated 2026-09-05) agrees "
                "with the files at 8,663 pages and 155,645 studies. The two files summary.json "
                "names that are absent from disk are matches/batch-0036.ndjson and "
                "aggregates/batch-0036.ndjson, 25 records each."
            ),
            "measured": {
                "summaryPagesWithStudies": 8775,
                "summaryStudiesMatched": 328324,
                "summaryDistinctStudiesMatched": 155671,
                "summaryFilesListed": 72,
                "summaryFilesMissingOnDisk": [
                    "data/corpus-20k/registry/matches/batch-0036.ndjson",
                    "data/corpus-20k/registry/aggregates/batch-0036.ndjson",
                ],
                "filesOnDiskPages": len(aggregate_pages),
                "filesOnDiskPageTrialPairs": trial_pairs,
                "filesOnDiskDistinctStudies": len({n for n in wanted if n in trials}),
            },
            "actionTaken": (
                "This step maps the files on disk, which aggregates-v3.json corroborates. "
                "summary.json is not used as a count anywhere in this coverage report. Phase 3 "
                "should either regenerate summary.json or record it as superseded; it is stale, "
                "not wrong about a different thing."
            ),
        },
        "pagesInCorpus20kAggregates": len(aggregate_pages),
        "aggregatePagesNotRemapped": len(aggregate_pages - matched_pages),
        "nameCandidatesSentToReview": len(review_rows),
        "nameCandidateFile": str(REVIEW_CSV),
        "nameCandidatePagesWithCorpusSideStructuralId": pages_with_structure,
        "nameCandidatePagesWithoutCorpusSideStructuralId": pages_without_structure,
        "ambiguousPageTrialLinks": ambiguous_links,
        "ambiguousPageTrialLinksNote": (
            "Page-trial links whose NCT is also linked to at least one other page. A trial of a "
            "combination product legitimately belongs to the combination page and to each "
            "component page, so these are not errors; they are counted so a reviewer can see how "
            "much of the mapping is shared."
        ),
        "saltListChange": (
            "scripts/revamp/salts.txt was read by corpus_join.load_corpus_index and not extended. "
            "The name normalisation used for these links is the corpus-20k TypeScript "
            "normalizeInterventionName, which stripped salt, dose and dosage-form words at match "
            "time; no new suffix was found to add."
        ),
        "mappedParquet": str(OUT_PARQUET),
        "manifest": f"data/sources/clinicaltrials/{pull_date}/manifest.json",
        "snapshotFieldAudit": f"data/sources/clinicaltrials/{pull_date}/snapshot-field-audit.json",
    }
    OUT_COVERAGE.write_text(json.dumps(coverage, indent=2, ensure_ascii=False) + "\n")

    print(
        json.dumps(
            {
                k: coverage[k]
                for k in (
                    "status",
                    "mappedRows",
                    "pagesMatchedByTier",
                    "pagesMatchedTotal",
                    "pageTrialPairs",
                    "distinctTrialsUsed",
                    "unmatchedRecords",
                    "pagesInMatchesAbsentFromCurrentCorpus",
                    "aggregatePagesNotRemapped",
                    "nameCandidatesSentToReview",
                    "nameCandidatePagesWithCorpusSideStructuralId",
                    "topUpFetched",
                    "ambiguousPageTrialLinks",
                )
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
