"""Phase 3 step 3.7 — find the suppressed pages that carry no question block.

A page in suppression class S1-S9 has a regulator classification to state. The dossier template
states it in a supervision block built from the stored question rows; a page whose present-field
count puts it below the stub floor has no question rows at all, so the classification fell through
to the stub's own line, which printed the raw class ids.

This script names those pages from the recorded corpus inputs, so the fix and its verification work
from a list rather than from a search of the rendered site.

    .venv-corpus/bin/python scripts/revamp/suppressed_no_question.py

Reads   data/corpus-20k/questions/batch-*.ndjson   (the derived question list per page)
        data/corpus-20k/suppression/assignments.ndjson (classes and display names)
        data/corpus-20k/tiers/model-assignment.ndjson  (model, and the tier it implies)
Writes  data/revamp/suppressed-no-question.csv
"""

from __future__ import annotations

import csv
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "corpus-20k"
OUT = ROOT / "data" / "revamp" / "suppressed-no-question.csv"

CITED = re.compile(r"^S[1-9]$")


def read_ndjson(path: Path):
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def tier_of(model: str, withdrawn: bool) -> int:
    """The tier a model assignment implies (scripts/corpus-20k/load/materialise.ts `tierOf`)."""
    if model == "LONGEVITY":
        return 1
    if model == "CLINICAL" or withdrawn:
        return 2
    return 3


def main() -> None:
    suppression: dict[str, dict] = {}
    for row in read_ndjson(DATA / "suppression" / "assignments.ndjson"):
        suppression[row["key"]] = row

    assignment: dict[str, dict] = {}
    for row in read_ndjson(DATA / "tiers" / "model-assignment.ndjson"):
        assignment[row["key"]] = row

    hits = []
    for file in sorted(glob.glob(str(DATA / "questions" / "batch-*.ndjson"))):
        for row in read_ndjson(Path(file)):
            questions = row.get("questions") or []
            if questions:
                continue
            classes = row.get("suppressionClasses") or suppression.get(row["key"], {}).get(
                "classes", []
            )
            cited = [code for code in classes if CITED.match(code)]
            if not cited:
                continue
            key = row["key"]
            model = assignment.get(key, {}).get("model", "")
            hits.append(
                {
                    "key": key,
                    "display_name": suppression.get(key, {}).get("displayName", ""),
                    "tier": tier_of(model, bool(assignment.get(key, {}).get("withdrawn"))),
                    "model": model,
                    "suppression_classes": " ".join(classes),
                    "cited_classes": " ".join(cited),
                    "present_fields": row.get("presentFields", ""),
                    "question_rows": 0,
                }
            )

    hits.sort(key=lambda row: row["key"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(hits[0].keys()))
        writer.writeheader()
        writer.writerows(hits)

    tiers: dict[int, int] = {}
    for row in hits:
        tiers[row["tier"]] = tiers.get(row["tier"], 0) + 1
    print(f"{len(hits)} suppressed pages carry an S1-S9 class and no question row.")
    print("by tier: " + ", ".join(f"tier {t}: {n}" for t, n in sorted(tiers.items())))
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
