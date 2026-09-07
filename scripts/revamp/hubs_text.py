#!/usr/bin/env python
"""Phase 5 step 5.4 — the hub text the uniqueness ruler reads.

    .venv-corpus/bin/python scripts/revamp/hubs_text.py

Writes ``data/revamp/hubs/text/first-batch.ndjson`` (the 30 hubs `hubs.parquet` marks
``first_batch``) and ``data/revamp/hubs/text/all.ndjson`` (every hub), in the shape
``scripts/corpus-20k/overlap/measure.py`` reads: ``{key, text, tier}``.

What goes into the measured text, and why:

  - the h1 the page paints;
  - the one-line definition, which is affirmative content and so is not furniture;
  - the synthesis sentences in template order;
  - the member names as one list line.

What stays out: the comparison table (its cells are values, and
``docs/specs/hubs.md`` section 2 item 2 says so explicitly), the members' own first questions
(they are the member pages' text, measured there), the sources list, and every absence statement,
which ``docs/specs/phase4-generators.md`` section 11 defines as furniture and excludes from the
ruler.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
HUBS = ROOT / "data/revamp/hubs"


def title_line(hub: dict[str, object]) -> str:
    """The h1 as the page paints it. The hub's kind is markup, not a word in the heading."""
    return str(hub["name"])


def member_line(names: list[str]) -> str:
    """The members as one list line, in the comparison table's order.

    No label prefixes it: the word would sit on every hub in the corpus and buy the reader
    nothing that the surrounding markup does not already say. The separator is a middle dot, not a
    comma, because a recorded name can contain a comma of its own ("PROPAFENONE, (R)-").
    """
    return " \u00b7 ".join(names)


def build(out_dir: Path) -> dict[str, int]:
    hubs = pq.read_table(HUBS / "hubs.parquet").to_pylist()
    syntheses = pq.read_table(HUBS / "syntheses.parquet").to_pylist()
    tables = pq.read_table(
        HUBS / "tables.parquet", columns=["hub_id", "ordinal", "name"]
    ).to_pylist()

    by_hub_sentences: dict[str, list[tuple[int, str]]] = {}
    for row in syntheses:
        by_hub_sentences.setdefault(str(row["hub_id"]), []).append(
            (int(row["ordinal"]), str(row["sentence"]))
        )
    by_hub_members: dict[str, list[tuple[int, str]]] = {}
    for row in tables:
        by_hub_members.setdefault(str(row["hub_id"]), []).append(
            (int(row["ordinal"]), str(row["name"]))
        )

    out_dir.mkdir(parents=True, exist_ok=True)
    written = {"all": 0, "first-batch": 0}
    all_path = out_dir / "all.ndjson"
    first_path = out_dir / "first-batch.ndjson"
    with all_path.open("w", encoding="utf-8") as everything, first_path.open(
        "w", encoding="utf-8"
    ) as batch:
        for hub in hubs:
            hub_id = str(hub["hub_id"])
            sentences = [text for _, text in sorted(by_hub_sentences.get(hub_id, []))]
            names = [name for _, name in sorted(by_hub_members.get(hub_id, []))]
            lines = [title_line(hub), str(hub["definition"])]
            lines.extend(sentences)
            if names:
                lines.append(member_line(names))
            record = {"key": hub_id, "text": "\n".join(lines), "tier": 1}
            everything.write(json.dumps(record) + "\n")
            written["all"] += 1
            if hub["first_batch"]:
                batch.write(json.dumps(record) + "\n")
                written["first-batch"] += 1
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=HUBS / "text")
    args = parser.parse_args()
    written = build(args.out)
    print(json.dumps(written, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
