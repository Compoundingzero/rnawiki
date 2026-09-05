"""Confirm, field by field, what the on-disk ClinicalTrials.gov snapshot holds.

Spec `docs/specs/revamp-2026-09.md` Phase 2 item 17 asks for confirmation that
`results_posted`, enrollment, phase, status and completion date are held per trial
for the trial-size and registry-gap sections. This script streams the snapshot once
and counts, over every study in it, how many carry each field the two sections read,
plus the design fields (allocation, masking, primary purpose) that the sections may
want next. It writes the counts and re-verifies the snapshot SHA256; it makes no
network request.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_confirm_held.py [YYYY-MM-DD]
"""

from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from datetime import date as date_cls
from pathlib import Path

SNAPSHOT_DIR = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/clinicaltrials/20260901T090005"
)
STUDIES = SNAPSHOT_DIR / "studies.ndjson"
SNAPSHOT_MANIFEST = SNAPSHOT_DIR / "manifest.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def main(pull_date: str) -> int:
    out_dir = Path("data/sources/clinicaltrials") / pull_date
    out_dir.mkdir(parents=True, exist_ok=True)

    snapshot_manifest = json.loads(SNAPSHOT_MANIFEST.read_text())
    recorded = snapshot_manifest["studiesSha256"]
    measured = sha256(STUDIES)

    present: Counter[str] = Counter()
    values: dict[str, Counter[str]] = {
        "overallStatus": Counter(),
        "phase": Counter(),
        "studyType": Counter(),
        "enrollmentType": Counter(),
        "designAllocation": Counter(),
        "designMasking": Counter(),
        "designPrimaryPurpose": Counter(),
        "interventionType": Counter(),
    }
    total = 0
    has_results_true = 0
    results_date_when_has_results = 0
    why_stopped_when_stopped = 0
    stopped_statuses = {"TERMINATED", "SUSPENDED", "WITHDRAWN"}
    stopped_total = 0

    with STUDIES.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            total += 1
            study = json.loads(line)
            protocol = study.get("protocolSection") or {}
            ident = protocol.get("identificationModule") or {}
            status_mod = protocol.get("statusModule") or {}
            design = protocol.get("designModule") or {}
            design_info = design.get("designInfo") or {}
            enrol = design.get("enrollmentInfo") or {}
            arms = protocol.get("armsInterventionsModule") or {}

            if ident.get("nctId"):
                present["nctId"] += 1
            if ident.get("briefTitle"):
                present["briefTitle"] += 1

            status = status_mod.get("overallStatus")
            if status:
                present["overallStatus"] += 1
                values["overallStatus"][status] += 1
                if status in stopped_statuses:
                    stopped_total += 1
                    if (status_mod.get("whyStopped") or "").strip():
                        why_stopped_when_stopped += 1
            if (status_mod.get("whyStopped") or "").strip():
                present["whyStopped"] += 1
            for name, field in (
                ("startDate", "startDateStruct"),
                ("primaryCompletionDate", "primaryCompletionDateStruct"),
                ("completionDate", "completionDateStruct"),
                ("resultsFirstPostDate", "resultsFirstPostDateStruct"),
                ("lastUpdatePostDate", "lastUpdatePostDateStruct"),
            ):
                if ((status_mod.get(field) or {}).get("date")):
                    present[name] += 1

            has_results = study.get("hasResults")
            if has_results is not None:
                present["hasResults"] += 1
            if has_results:
                has_results_true += 1
                if ((status_mod.get("resultsFirstPostDateStruct") or {}).get("date")):
                    results_date_when_has_results += 1

            phases = design.get("phases") or []
            if phases:
                present["phase"] += 1
                for phase in phases:
                    values["phase"][phase] += 1
            study_type = design.get("studyType")
            if study_type:
                present["studyType"] += 1
                values["studyType"][study_type] += 1

            if enrol.get("count") is not None:
                present["enrollmentCount"] += 1
            if enrol.get("type"):
                present["enrollmentType"] += 1
                values["enrollmentType"][enrol["type"]] += 1

            if design_info.get("allocation"):
                present["designAllocation"] += 1
                values["designAllocation"][design_info["allocation"]] += 1
            masking = (design_info.get("maskingInfo") or {}).get("masking")
            if masking:
                present["designMasking"] += 1
                values["designMasking"][masking] += 1
            if design_info.get("primaryPurpose"):
                present["designPrimaryPurpose"] += 1
                values["designPrimaryPurpose"][design_info["primaryPurpose"]] += 1

            interventions = arms.get("interventions") or []
            if interventions:
                present["interventions"] += 1
            for intervention in interventions:
                if intervention.get("type"):
                    values["interventionType"][intervention["type"]] += 1

            sponsor = (protocol.get("sponsorCollaboratorsModule") or {}).get("leadSponsor") or {}
            if sponsor.get("name"):
                present["leadSponsorName"] += 1
            if sponsor.get("class"):
                present["leadSponsorClass"] += 1
            if (protocol.get("conditionsModule") or {}).get("conditions"):
                present["conditions"] += 1
            if (protocol.get("outcomesModule") or {}).get("primaryOutcomes"):
                present["primaryOutcomes"] += 1
            eligibility = protocol.get("eligibilityModule") or {}
            if eligibility.get("sex"):
                present["sex"] += 1
            if eligibility.get("minimumAge"):
                present["minimumAge"] += 1
            if eligibility.get("maximumAge"):
                present["maximumAge"] += 1
            if eligibility.get("stdAges"):
                present["stdAges"] += 1
            if eligibility.get("healthyVolunteers") is not None:
                present["healthyVolunteers"] += 1

    audit = {
        "schema": "rnawiki-revamp-clinicaltrials-snapshot-audit/v1",
        "checkedAt": pull_date,
        "snapshotDir": str(SNAPSHOT_DIR),
        "snapshotFile": str(STUDIES),
        "snapshotBytes": STUDIES.stat().st_size,
        "snapshotSha256Recorded": recorded,
        "snapshotSha256Measured": measured,
        "snapshotSha256Matches": recorded == measured,
        "apiVersion": snapshot_manifest["apiVersion"],
        "dataTimestamp": snapshot_manifest["dataTimestamp"],
        "requestedFields": snapshot_manifest["fields"],
        "studiesRecorded": snapshot_manifest["studies"],
        "studiesCounted": total,
        "fieldPresence": {
            name: {"studies": count, "percent": round(100 * count / total, 2)}
            for name, count in sorted(present.items(), key=lambda kv: -kv[1])
        },
        "hasResultsTrue": has_results_true,
        "hasResultsTruePercent": round(100 * has_results_true / total, 2),
        "resultsFirstPostDatePresentWhenHasResults": results_date_when_has_results,
        "stoppedStudies": stopped_total,
        "whyStoppedPresentOnStoppedStudies": why_stopped_when_stopped,
        "valueCounts": {
            name: dict(sorted(counter.items(), key=lambda kv: -kv[1]))
            for name, counter in values.items()
        },
    }
    out = out_dir / "snapshot-field-audit.json"
    out.write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({
        "studiesCounted": total,
        "sha256Matches": audit["snapshotSha256Matches"],
        "fieldPresence": audit["fieldPresence"],
        "hasResultsTrue": has_results_true,
        "stoppedStudies": stopped_total,
        "whyStoppedPresentOnStoppedStudies": why_stopped_when_stopped,
        "out": str(out),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
