"""Cross-check `data/sources/clinicaltrials/mapped.parquet` against two independent
records of the same snapshot: the corpus-20k aggregates (`registry/aggregates/`,
built by TypeScript in the earlier run) and the raw snapshot lines themselves.

Nothing here is fetched. The check exists so the Phase 2 claim "the snapshot holds
results_posted, enrolment, phase, status and completion date per trial" is backed by
a comparison a reader can rerun, not by assertion.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_verify_mapped.py [YYYY-MM-DD]
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import date as date_cls
from pathlib import Path

import pyarrow.parquet as pq

AGGREGATES_DIR = Path("data/corpus-20k/registry/aggregates")
MAPPED = Path("data/sources/clinicaltrials/mapped.parquet")
SNAPSHOT = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/clinicaltrials/20260901T090005/studies.ndjson"
)


def main(pull_date: str) -> int:
    table = pq.read_table(MAPPED)
    by_page: dict[str, dict[str, dict]] = {}
    for key, field, value in zip(
        table["key"].to_pylist(), table["field"].to_pylist(), table["value"].to_pylist()
    ):
        by_page.setdefault(key, {})[field] = json.loads(value)

    agreed = Counter()
    disagreed = Counter()
    examples: dict[str, list] = {}
    aggregate_pages = 0

    for path in sorted(AGGREGATES_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                agg = json.loads(line)
                aggregate_pages += 1
                key = agg["key"]
                mapped = by_page.get(key)
                if mapped is None:
                    disagreed["pageMissingFromMapped"] += 1
                    examples.setdefault("pageMissingFromMapped", []).append(key)
                    continue
                checks = [
                    ("trials", agg["studies"], mapped["registry.trialCount"]["trials"]),
                    ("hasResults", agg["hasResults"], mapped["registry.hasResults"]["withResults"]),
                    ("byPhase", agg["byPhase"], mapped["registry.phases"]["byPhase"]),
                    (
                        "byOverallStatus",
                        agg["byOverallStatus"],
                        mapped["registry.statuses"]["byOverallStatus"],
                    ),
                    ("enrolmentMax", agg["enrolment"]["max"], mapped["registry.enrolment"]["max"]),
                    ("enrolmentMin", agg["enrolment"]["min"], mapped["registry.enrolment"]["min"]),
                    ("enrolmentN", agg["enrolment"]["n"], mapped["registry.enrolment"]["n"]),
                    (
                        "enrolmentMedian",
                        agg["enrolment"]["median"],
                        mapped["registry.enrolment"]["median"],
                    ),
                    ("firstStartDate", agg["firstStartDate"], mapped["registry.completionDates"]["firstStartDate"]),
                    (
                        "lastCompletionDate",
                        (agg.get("lastCompletionDate") or {}).get("date"),
                        mapped["registry.completionDates"]["lastCompletionDate"],
                    ),
                    (
                        "stoppedTrials",
                        len(agg["stopped"]),
                        mapped["registry.whyStopped"]["stoppedWithReason"],
                    ),
                ]
                for name, left, right in checks:
                    if name in ("byPhase", "byOverallStatus"):
                        same = dict(sorted(left.items())) == dict(sorted(right.items()))
                    else:
                        same = left == right
                    if same:
                        agreed[name] += 1
                    else:
                        disagreed[name] += 1
                        bucket = examples.setdefault(name, [])
                        if len(bucket) < 5:
                            bucket.append({"key": key, "aggregate": left, "mapped": right})

    # Spot-check five pages back to the raw snapshot line for every field taken.
    spot_keys = sorted(by_page)[:: max(1, len(by_page) // 5)][:5]
    spot_ncts = {
        nct: key
        for key in spot_keys
        for nct in by_page[key]["registry.trialCount"]["ncts"][:3]
    }
    spot_results = []
    with SNAPSHOT.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            study = json.loads(line)
            protocol = study.get("protocolSection") or {}
            nct = (protocol.get("identificationModule") or {}).get("nctId")
            if nct not in spot_ncts:
                continue
            key = spot_ncts[nct]
            mapped = by_page[key]
            status_mod = protocol.get("statusModule") or {}
            design = protocol.get("designModule") or {}
            raw = {
                "status": status_mod.get("overallStatus"),
                "completionDate": (status_mod.get("completionDateStruct") or {}).get("date"),
                "hasResults": bool(study.get("hasResults")),
                "phases": design.get("phases") or [],
                "enrollment": (design.get("enrollmentInfo") or {}).get("count"),
            }
            got = {
                "status": next(
                    r["status"] for r in mapped["registry.statuses"]["perTrial"] if r["nct"] == nct
                ),
                "completionDate": next(
                    r["completionDate"]
                    for r in mapped["registry.completionDates"]["perTrial"]
                    if r["nct"] == nct
                ),
                "hasResults": any(
                    r["nct"] == nct for r in mapped["registry.hasResults"]["resultsPosted"]
                ),
                "phases": next(
                    r["phases"] for r in mapped["registry.phases"]["perTrial"] if r["nct"] == nct
                ),
                "enrollment": next(
                    (
                        r["enrollment"]
                        for r in mapped["registry.enrolment"]["perTrial"]
                        if r["nct"] == nct
                    ),
                    None,
                ),
            }
            if not raw["phases"]:
                raw["phases"] = ["NA_OR_UNSTATED"]
            spot_results.append({"nct": nct, "key": key, "match": raw == got, "raw": raw, "mapped": got})

    # Top-up merge: every per-trial completion-date row should carry a date-type key,
    # and the values should be exactly what the cached top-up responses hold.
    raw_dir = Path("data/sources/clinicaltrials") / pull_date / "raw"
    topup: dict[str, str | None] = {}
    for path in sorted(raw_dir.glob("topup-*.json")):
        for study in json.loads(path.read_text()).get("studies") or []:
            protocol = study.get("protocolSection") or {}
            nct = (protocol.get("identificationModule") or {}).get("nctId")
            if nct:
                topup[nct] = (
                    (protocol.get("statusModule") or {}).get("completionDateStruct") or {}
                ).get("type")
    type_rows = 0
    type_agree = 0
    type_disagree: list[dict] = []
    for key, fields in by_page.items():
        for row in fields["registry.completionDates"]["perTrial"]:
            if "completionDateType" not in row:
                type_disagree.append({"key": key, "nct": row["nct"], "reason": "key absent"})
                continue
            type_rows += 1
            if row["completionDateType"] == topup.get(row["nct"]):
                type_agree += 1
            elif len(type_disagree) < 5:
                type_disagree.append(
                    {
                        "key": key,
                        "nct": row["nct"],
                        "mapped": row["completionDateType"],
                        "topup": topup.get(row["nct"]),
                    }
                )

    report = {
        "schema": "rnawiki-revamp-clinicaltrials-mapped-verification/v1",
        "checkedAt": pull_date,
        "aggregatePagesRead": aggregate_pages,
        "mappedPages": len(by_page),
        "agreed": dict(sorted(agreed.items())),
        "disagreed": dict(sorted(disagreed.items())),
        "disagreementExamples": examples,
        "topUpStudiesCached": len(topup),
        "completionDateTypeRowsChecked": type_rows,
        "completionDateTypeRowsAgreeing": type_agree,
        "completionDateTypeDisagreements": type_disagree,
        "rawLineSpotChecks": len(spot_results),
        "rawLineSpotChecksMatching": sum(1 for r in spot_results if r["match"]),
        "rawLineSpotCheckDetail": spot_results,
    }
    out = Path("data/sources/clinicaltrials") / pull_date / "mapped-verification.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({k: report[k] for k in (
        "aggregatePagesRead", "mappedPages", "agreed", "disagreed",
        "topUpStudiesCached", "completionDateTypeRowsChecked",
        "completionDateTypeRowsAgreeing", "completionDateTypeDisagreements",
        "rawLineSpotChecks", "rawLineSpotChecksMatching")}, indent=2))
    print(json.dumps({k: v[:2] for k, v in examples.items()}, indent=2)[:2500])
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
