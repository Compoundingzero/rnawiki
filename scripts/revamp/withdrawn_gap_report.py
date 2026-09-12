#!/usr/bin/env python3
"""Measure what the withdrawal field can and cannot be filled with, given that the
WITHDRAWN 2.0 database (Charite) could not be retrieved.

WITHDRAWN 2.0 is the only source in the Phase 2 list that publishes a withdrawal
*reason* alongside country and year. Its web application returns 404 on every path
and its predecessor host does not resolve (evidence:
data/sources/withdrawn/2026-09-05/retry-evidence.txt). This script quantifies the
resulting hole using only sources already held under a verified licence, so the
lead can size the loss rather than assume it.

Inputs
  data/corpus-20k/tiers/model-assignment.ndjson   key, model, withdrawn
  data/corpus-20k/identity/canonical.ndjson       key, chemblId, unii, displayName
  data/corpus-20k/raw/chembl/molecules-*.json     withdrawn_flag (ChEMBL 37)
  data/sources/inxight/mapped.parquet             marketingStatus rows

Output
  data/sources/withdrawn/coverage.json            blocked-source coverage report
  data/sources/withdrawn/withdrawal-gap.csv       per-tier gap table

ChEMBL 37 carries only the boolean `withdrawn_flag`. The `withdrawn_year`,
`withdrawn_country`, `withdrawn_reason` and `withdrawn_class` columns were removed
from the ChEMBL molecule endpoint after release 29, so ChEMBL cannot substitute for
WITHDRAWN on reason, country or year. Inxight marketing status carries a
jurisdiction and record dates, but those date a marketing record, not a withdrawal
decision, and are not written into a withdrawal year here.
"""
from __future__ import annotations

import csv
import glob
import json
import pathlib
from collections import defaultdict

import pandas as pd

DATE = "2026-09-05"
ROOT = pathlib.Path(__file__).resolve().parents[2]
TIERS = ROOT / "data" / "corpus-20k" / "tiers" / "model-assignment.ndjson"
CANONICAL = ROOT / "data" / "corpus-20k" / "identity" / "canonical.ndjson"
CHEMBL_GLOB = str(ROOT / "data" / "corpus-20k" / "raw" / "chembl" / "molecules-*.json")
INXIGHT = ROOT / "data" / "sources" / "inxight" / "mapped.parquet"
OUT_DIR = ROOT / "data" / "sources" / "withdrawn"

# Inxight statusCounts keys that denote a product no longer marketed.
INACTIVE_STATUS = {
    "Withdrawn",
    "Discontinued",
    "Previously Marketed",
    "Never Marketed",
    "Withdrawn from market",
}


def tier_of(model: str, withdrawn: bool) -> int:
    if model == "LONGEVITY" or withdrawn:
        return 1
    if model == "CLINICAL":
        return 2
    return 3


def main() -> None:
    tier = {}
    corpus_withdrawn = set()
    for line in TIERS.open():
        r = json.loads(line)
        w = bool(r.get("withdrawn"))
        tier[r["key"]] = tier_of(r.get("model", ""), w)
        if w:
            corpus_withdrawn.add(r["key"])

    chembl_of = {}
    for line in CANONICAL.open():
        r = json.loads(line)
        cid = r.get("chemblId")
        if cid:
            chembl_of[r["key"]] = cid

    chembl_withdrawn = set()
    for path in sorted(glob.glob(CHEMBL_GLOB)):
        blob = json.load(open(path))
        key = next(k for k in blob if k != "page_meta")
        for m in blob[key]:
            if m.get("withdrawn_flag"):
                chembl_withdrawn.add(m["molecule_chembl_id"])
    pages_chembl_withdrawn = {k for k, c in chembl_of.items() if c in chembl_withdrawn}

    pages_inxight_inactive = set()
    inxight_jurisdictions = defaultdict(set)
    df = pd.read_parquet(INXIGHT, columns=["key", "field", "value"])
    for k, v in zip(df[df.field == "marketingStatus"].key,
                    df[df.field == "marketingStatus"].value):
        payload = json.loads(v)
        statuses = set(payload.get("statusCounts", {}))
        if statuses & INACTIVE_STATUS:
            pages_inxight_inactive.add(k)
            j = payload.get("jurisdiction")
            if j and j != "unspecified":
                inxight_jurisdictions[k].add(j)

    any_signal = corpus_withdrawn | pages_chembl_withdrawn | pages_inxight_inactive

    rows = []
    for t in (1, 2, 3):
        in_tier = {k for k, v in tier.items() if v == t}
        rows.append({
            "tier": t,
            "pages": len(in_tier),
            "corpus_withdrawn_flag": len(corpus_withdrawn & in_tier),
            "chembl_withdrawn_flag": len(pages_chembl_withdrawn & in_tier),
            "inxight_inactive_status": len(pages_inxight_inactive & in_tier),
            "any_withdrawal_signal": len(any_signal & in_tier),
            "with_country_available": len({k for k in (any_signal & in_tier)
                                           if inxight_jurisdictions.get(k)}),
            "with_year_available": 0,
            "with_reason_available": 0,
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with (OUT_DIR / "withdrawal-gap.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

    coverage = {
        "source": "withdrawn",
        "sourceName": "WITHDRAWN 2.0 database (Charite, Structural Bioinformatics Group)",
        "attemptedDate": DATE,
        "status": "BLOCKED-WITH-EVIDENCE",
        "blockedReason": (
            "The WITHDRAWN 2.0 web application is offline. Every path under "
            "https://bioinformatics.charite.de/withdrawn_3/ returns HTTP 404, including "
            "the bulk CSV named in the paper's own Data Availability statement and the "
            "link printed on the group's live homepage. The predecessor host "
            "cheminfo.charite.de has no DNS A record. The bulk CSV was never captured by "
            "the Internet Archive. No licence or terms-of-use statement is published on "
            "any surviving page of the database, so its data may not be reused under "
            "Operating Rule 8."
        ),
        "licence": "not established - no licence or terms statement published by the database",
        "rawFiles": 0,
        "rawBytes": 0,
        "mappedParquetWritten": False,
        "mappedParquetReason": (
            "No WITHDRAWN record was retrieved. Writing a mapped.parquet from any other "
            "source under this directory would misattribute that source's provenance."
        ),
        "pagesMatchedByTier": {"1": 0, "2": 0, "3": 0},
        "fieldsGainedByTier": {"1": {}, "2": {}, "3": {}},
        "unmatchedRecords": 0,
        "nameCandidatesSentToReview": 0,
        "evidence": {
            "retryLog": f"data/sources/withdrawn/{DATE}/retry-evidence.txt",
            "requestLog": f"data/sources/withdrawn/{DATE}/requests.log",
            "legalCaptures": f"data/sources/withdrawn/{DATE}/legal/",
            "blockerEntry": "data/revamp/worklog-entries/2.10-blocker.md",
        },
        "withdrawalFieldGap": {
            "note": (
                "Measured from sources already held under a verified licence. WITHDRAWN 2.0 "
                "was the only Phase 2 source publishing a withdrawal reason. ChEMBL 37 "
                "carries withdrawn_flag only; withdrawn_year, withdrawn_country, "
                "withdrawn_reason and withdrawn_class were removed from the ChEMBL molecule "
                "endpoint after release 29. Inxight marketing status carries a jurisdiction "
                "and record dates, but those date a marketing record, not a withdrawal "
                "decision, so no withdrawal year is derivable from it."
            ),
            "perTier": rows,
            "reasonAvailableFromLicensedSources": 0,
            "yearAvailableFromLicensedSources": 0,
        },
    }
    (OUT_DIR / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n")

    for r in rows:
        print(r)
    print("wrote", OUT_DIR / "coverage.json")
    print("wrote", OUT_DIR / "withdrawal-gap.csv")


if __name__ == "__main__":
    main()
