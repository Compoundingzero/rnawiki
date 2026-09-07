#!/usr/bin/env python
"""Phase 5 step 5.4 — measure hub uniqueness with the corpus-20k ruler.

    .venv-corpus/bin/python scripts/revamp/hubs_measure.py --set first-batch
    .venv-corpus/bin/python scripts/revamp/hubs_measure.py --set all

The first batch is 30 pages, so every pair is scored exactly
(``scripts/corpus-20k/overlap/measure.py --exhaustive``). The full hub set is larger than the
324-page baseline draw, and a nearest-neighbour maximum rises with the number of pages it is drawn
against, so it is scored in seeded size-matched folds of 324
(``scripts/corpus-20k/gate2/folds.py``) exactly as Gate 2 scored the corpus. Both write the
positional and lexical medians against the two lines
``docs/specs/hubs.md`` section 4 sets: 0.20 positional and 0.353 lexical, the latter being the
lexical null the corpus-20k run measured.

Neither line is ever moved here. A failing set is a failing set, and the fix is the template.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HUBS = ROOT / "data/revamp/hubs"
MEASURE = ROOT / "scripts/corpus-20k/overlap/measure.py"
FOLDS = ROOT / "scripts/corpus-20k/gate2/folds.py"
POSITIONAL_LINE = 0.20
LEXICAL_LINE = 0.353
FOLD_SIZE = 324


def run(command: list[str]) -> None:
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stdout + result.stderr)
        raise SystemExit(result.returncode)


def count_lines(path: Path) -> int:
    with path.open(encoding="utf-8") as handle:
        return sum(1 for _ in handle)


def measure_first_batch(work: Path) -> dict[str, object]:
    pages = HUBS / "text/first-batch.ndjson"
    out = work / "first-batch"
    run(
        [
            sys.executable,
            str(MEASURE),
            "--pages",
            str(pages),
            "--out",
            str(out),
            "--exhaustive",
            "--label",
            "revamp phase 5 hub first batch",
        ]
    )
    summary = json.loads((out / "summary.json").read_text(encoding="utf-8"))
    positional = summary["full"]["positional"]
    lexical = summary["full"]["lexical"]
    return {
        "set": "first-batch",
        "method": "scripts/corpus-20k/overlap/measure.py --exhaustive (every pair scored)",
        "pages": summary["pages"],
        "pairs": summary["pages"] * (summary["pages"] - 1) // 2,
        "medianTokens": summary["medianTokens"],
        "positional": {
            "median": positional["median"],
            "p90": positional["p90"],
            "max": positional["max"],
            "line": POSITIONAL_LINE,
            "pass": positional["median"] < POSITIONAL_LINE,
        },
        "lexical": {
            "median": lexical["median"],
            "p90": lexical["p90"],
            "max": lexical["max"],
            "line": LEXICAL_LINE,
            "pass": lexical["median"] < LEXICAL_LINE,
        },
        "expectedNearestNeighbour": summary["nullModel"]["expectedNearestNeighbour"],
        "sharedWordShare": summary["sharedWordShare"]["median"],
        "pass": positional["median"] < POSITIONAL_LINE and lexical["median"] < LEXICAL_LINE,
    }


def measure_all(work: Path) -> dict[str, object]:
    pages = HUBS / "text/all.ndjson"
    total = count_lines(pages)
    out = work / "all"
    if total > FOLD_SIZE:
        run(
            [
                sys.executable,
                str(FOLDS),
                "--pages",
                str(pages),
                "--out",
                str(out),
                "--fold-size",
                str(FOLD_SIZE),
                "--label",
                "revamp phase 5 hubs, every hub",
            ]
        )
        summary = json.loads((out / "summary.json").read_text(encoding="utf-8"))
        method = (
            f"scripts/corpus-20k/gate2/folds.py --fold-size {FOLD_SIZE} "
            "(seeded size-matched folds, every pair inside a fold scored)"
        )
        folds = summary["folds"]
    else:
        run(
            [
                sys.executable,
                str(MEASURE),
                "--pages",
                str(pages),
                "--out",
                str(out),
                "--exhaustive",
                "--label",
                "revamp phase 5 hubs, every hub",
            ]
        )
        raw = json.loads((out / "summary.json").read_text(encoding="utf-8"))
        summary = {"pages": raw["pages"], "positional": raw["full"]["positional"], "lexical": raw["full"]["lexical"]}
        method = "scripts/corpus-20k/overlap/measure.py --exhaustive (every pair scored)"
        folds = [raw["pages"]]
    positional = summary["positional"]
    lexical = summary["lexical"]
    return {
        "set": "all",
        "method": method,
        "pages": summary["pages"],
        "folds": folds,
        "positional": {
            "median": positional["median"],
            "p90": positional["p90"],
            "max": positional["max"],
            "line": POSITIONAL_LINE,
            "pass": positional["median"] < POSITIONAL_LINE,
        },
        "lexical": {
            "median": lexical["median"],
            "p90": lexical["p90"],
            "max": lexical["max"],
            "line": LEXICAL_LINE,
            "pass": lexical["median"] < LEXICAL_LINE,
        },
        "pass": positional["median"] < POSITIONAL_LINE and lexical["median"] < LEXICAL_LINE,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--set", choices=("first-batch", "all", "both"), default="both")
    args = parser.parse_args()
    written: list[str] = []
    with tempfile.TemporaryDirectory(prefix="hubs-measure-") as temporary:
        work = Path(temporary)
        if args.set in ("first-batch", "both"):
            record = measure_first_batch(work)
            path = HUBS / "measure-first-batch.json"
            path.write_text(json.dumps(record, indent=1) + "\n", encoding="utf-8")
            written.append(str(path.relative_to(ROOT)))
            print(json.dumps(record, indent=1))
        if args.set in ("all", "both"):
            record = measure_all(work)
            path = HUBS / "measure-all.json"
            path.write_text(json.dumps(record, indent=1) + "\n", encoding="utf-8")
            written.append(str(path.relative_to(ROOT)))
            print(json.dumps(record, indent=1))
    print(json.dumps({"written": written}, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
