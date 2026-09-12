#!/usr/bin/env python
"""Measure how much of a render's text is carried by lines that repeat across the corpus.

Two figures per render directory, both named in `docs/specs/phase4-generators.md` §11 and in the
measure-v5 worklog entry:

  commonLineWordShare  the share of the corpus's words carried by lines that appear on more than
                       half of all pages. A line is counted once per page it appears on, and its
                       words are counted once per appearance, so the figure answers "of every word
                       the corpus prints, what share is printed by a line most pages also print".
  medianWords          the median page's word count over the same render.

    common_line_share.py data/revamp/render-v6/text data/revamp/render-v6/text-with-furniture

Each argument is a directory of `batch-*.ndjson` page-text batches (`page_text_v5.ts`, or the
corpus-20k v4 render). Output is JSON on stdout and, with --out, to a file.
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def measure(text_dir: Path) -> dict:
    page_lines: list[list[str]] = []
    words_per_page: list[int] = []
    pages_carrying: Counter[str] = Counter()
    for path in sorted(text_dir.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for raw in handle:
                raw = raw.strip()
                if not raw:
                    continue
                row = json.loads(raw)
                lines = [line for line in (row.get("text") or "").splitlines() if line.strip()]
                page_lines.append(lines)
                words_per_page.append(sum(len(line.split()) for line in lines))
                for line in set(lines):
                    pages_carrying[line] += 1
    pages = len(page_lines)
    half = pages / 2
    common = {line for line, count in pages_carrying.items() if count > half}
    total_words = 0
    common_words = 0
    for lines in page_lines:
        for line in lines:
            count = len(line.split())
            total_words += count
            if line in common:
                common_words += count
    return {
        "textDir": str(text_dir.relative_to(ROOT)) if text_dir.is_relative_to(ROOT) else str(text_dir),
        "pages": pages,
        "words": total_words,
        "distinctLines": len(pages_carrying),
        "linesOnMoreThanHalfOfPages": len(common),
        "wordsOnThoseLines": common_words,
        "commonLineWordShare": round(common_words / total_words, 6) if total_words else 0.0,
        "medianWords": int(statistics.median(words_per_page)) if words_per_page else 0,
        "meanWords": round(sum(words_per_page) / pages, 1) if pages else 0.0,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("text_dirs", nargs="+", type=Path)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()
    results = [measure(d) for d in args.text_dirs]
    payload = {"generated": "scripts/revamp/common_line_share.py", "renders": results}
    text = json.dumps(payload, indent=2)
    print(text)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
