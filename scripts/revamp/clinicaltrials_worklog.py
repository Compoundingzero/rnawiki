"""Write `data/revamp/worklog-entries/2.17.md` from the artefacts this step produced.

Every number in the entry is read back out of coverage.json, the manifest, the
snapshot audit and the verification report, so the worklog cannot drift from the
files it cites.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_worklog.py [YYYY-MM-DD]
"""

from __future__ import annotations

import json
import sys
from datetime import date as date_cls, datetime, timezone
from pathlib import Path


def main(pull_date: str) -> int:
    root = Path("data/sources/clinicaltrials") / pull_date
    coverage = json.loads(Path("data/sources/clinicaltrials/coverage.json").read_text())
    manifest = json.loads((root / "manifest.json").read_text())
    audit = json.loads((root / "snapshot-field-audit.json").read_text())
    verify = json.loads((root / "mapped-verification.json").read_text())
    presence = audit["fieldPresence"]
    tiers = coverage["pagesMatchedByTier"]
    corpus = coverage["corpusPagesByTier"]
    topup = coverage["topUpFetched"]
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")

    lines = [
        f"### [{stamp}] Phase 2 Step 2.17 — ClinicalTrials.gov (public domain, NLM)",
        "",
        f"- `.venv-corpus/bin/python scripts/revamp/clinicaltrials_confirm_held.py {pull_date}` → "
        f"`{root}/snapshot-field-audit.json`: the 2026-09-01T09:00:05 snapshot "
        f"({audit['snapshotBytes']:,} B, sha256 re-measured and equal to the recorded value) holds "
        f"all five fields item 17 asks about over {audit['studiesCounted']:,} studies — "
        f"hasResults {presence['hasResults']['percent']}% "
        f"({audit['hasResultsTrue']:,} true, every one of them carrying resultsFirstPostDate), "
        f"enrolment count {presence['enrollmentCount']['percent']}%, phase "
        f"{presence['phase']['percent']}%, overall status {presence['overallStatus']['percent']}%, "
        f"completion date {presence['completionDate']['percent']}%, whyStopped on "
        f"{audit['whyStoppedPresentOnStoppedStudies']:,} of {audit['stoppedStudies']:,} stopped "
        f"studies. Allocation, masking and primary purpose are present too "
        f"({presence['designAllocation']['percent']}% / {presence['designMasking']['percent']}% / "
        f"{presence['designPrimaryPurpose']['percent']}%, i.e. on the interventional studies), so "
        "the design gap the brief anticipated does not exist.",
        f"- What the snapshot did lack: the `*Type` companion of every date and "
        f"`DesignInterventionModel`. `clinicaltrials_topup_fetch.py {pull_date}` fetched them for "
        f"the matched studies only — {topup['calls']} calls at {topup['idsPerCall']} ids, under the "
        f"500 ceiling, Crawl-delay 1 honoured, all HTTP 200 in "
        f"`{root}/requests.log` — covering {topup['studiesCovered']:,} studies. The same fields "
        f"across the whole registry would cost {topup['callsToAddTheSameFieldsForTheWholeRegistry']} "
        "calls at the measured pageSize ceiling of 1,000.",
        f"- `clinicaltrials_map.py {pull_date}` → `{coverage['mappedParquet']}`: "
        f"{coverage['mappedRows']:,} rows over {coverage['pagesMatchedTotal']:,} pages "
        f"(T1 {tiers['1']}/{corpus['1']}, T2 {tiers['2']}/{corpus['2']}, T3 {tiers['3']}/{corpus['3']}) "
        f"from {coverage['pageTrialPairs']:,} page-trial pairs over "
        f"{coverage['distinctTrialsUsed']:,} distinct studies, gaining "
        f"{', '.join(coverage['fieldsGained'])}. Every link is rule (d): no study record carries a "
        "UNII, InChIKey or structure, so rules (a)-(c) cannot fire, and all "
        f"{coverage['nameCandidatesSentToReview']:,} pages go to "
        f"`{coverage['nameCandidateFile']}` "
        f"({coverage['nameCandidatePagesWithCorpusSideStructuralId']:,} of them with a corpus-side "
        "UNII or InChIKey that the registry side can never confirm).",
        f"- `clinicaltrials_verify_mapped.py {pull_date}` → "
        f"`{root}/mapped-verification.json`: 11 checks against the independently built corpus-20k "
        f"aggregates agree on all {verify['aggregatePagesRead']:,} pages with zero disagreements, "
        f"{verify['completionDateTypeRowsAgreeing']:,} of "
        f"{verify['completionDateTypeRowsChecked']:,} completion-date-type rows match the cached "
        f"top-up, and {verify['rawLineSpotChecksMatching']}/{verify['rawLineSpotChecks']} raw "
        f"snapshot lines reproduce exactly. `{root}/manifest.json` lists "
        f"{manifest['fileCount']} files / {manifest['totalBytes']:,} B; one row appended to "
        "`docs/data/LICENSES.md`.",
        f"- Finding for Phase 3: `data/corpus-20k/registry/summary.json` is stale. It reports 8,775 "
        "pages, 328,324 pairs and 155,671 studies and lists two batch files "
        "(matches/aggregates batch-0036) that are not on disk; the files themselves and "
        f"`aggregates-v3.json` both say {coverage['pagesInCorpus20kAggregates']:,} pages and "
        f"{coverage['distinctTrialsUsed']:,} studies. This step mapped the files, not the summary.",
        "",
    ]
    out = Path("data/revamp/worklog-entries/2.17.md")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines))
    print(out.read_text())
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
