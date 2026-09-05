#!/usr/bin/env python3
"""Phase 1.5 — read the pages that sit on the line.

Twenty pages per tier at the tier's threshold, at threshold + 1 and at threshold - 1 (180 pages
where each bucket holds twenty; fewer where a bucket is smaller), drawn with one seeded
generator so the same pages come back on every run. For each page: its title, tier, its present
count over its applicable count, and the first 300 words of its rendered reading column — the
`text` field of data/corpus-20k/render/text/*.ndjson, which is the main content with the site
chrome already excluded.

The file is capped: it must stay under 60,000 words, and the run refuses to write a file that
would exceed the cap rather than truncating silently.

    python scripts/revamp/threshold_sanity.py

No network access.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PRESENCE = ROOT / "data/revamp/presence-applicable.ndjson"
THRESHOLDS = ROOT / "data/revamp/thresholds.json"
TEXT_DIR = ROOT / "data/corpus-20k/render/text"
ASSIGNMENT = ROOT / "data/corpus-20k/tiers/model-assignment.ndjson"
OUT = ROOT / "data/revamp/threshold-sanity.md"

SEED = 20260904
PER_BUCKET = 20
WORDS_PER_PAGE = 300
WORD_CAP = 60000
TIERS = (1, 2, 3)


def first_words(text: str, limit: int) -> tuple[str, int]:
    """The first `limit` whitespace-separated words, line structure kept."""
    kept: list[str] = []
    used = 0
    for line in text.split("\n"):
        words = line.split()
        if not words:
            continue
        if used + len(words) >= limit:
            kept.append(" ".join(words[: limit - used]))
            used = limit
            break
        kept.append(" ".join(words))
        used += len(words)
    return "\n".join(kept), used


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default=str(OUT))
    args = parser.parse_args()

    presence = {}
    for line in PRESENCE.open(encoding="utf-8"):
        if line.strip():
            row = json.loads(line)
            presence[row["key"]] = row

    names = {}
    for line in ASSIGNMENT.open(encoding="utf-8"):
        if line.strip():
            row = json.loads(line)
            names[row["key"]] = row.get("displayName") or row["key"]

    pages = {}
    for path in sorted(TEXT_DIR.glob("batch-*.ndjson")):
        for line in path.open(encoding="utf-8"):
            if line.strip():
                row = json.loads(line)
                pages[row["key"]] = row

    thresholds = json.loads(THRESHOLDS.read_text(encoding="utf-8"))
    rng = np.random.default_rng(SEED)

    out: list[str] = []
    out.append("# Pages on the line (Phase 1.5)\n\n")
    out.append(
        "Written by `scripts/revamp/threshold_sanity.py`. For each tier: twenty pages whose "
        "present-over-applicable count sits one below the line the tier is read at, twenty at it "
        "and twenty one above, drawn from one `numpy.random.default_rng(20260904)`. The table "
        "below names, per tier, what that line is: a derived threshold where the tier has one, the "
        "bucket rule's own answer where the lexical line rejected every set, and the stub floor "
        "where the rule selected nothing. The text is the "
        "first 300 words of the rendered reading column "
        "(`data/corpus-20k/render/text/batch-*.ndjson`, field `text` — main content, site chrome "
        "already excluded). Read the ones at the threshold and ask whether a biohacker gets "
        "anything from them.\n\n"
    )
    out.append("| Tier | Line read | What it is | Pages at −1 | at the line | at +1 |\n")
    out.append("| --- | ---: | --- | ---: | ---: | ---: |\n")

    plan: list[tuple[int, int, str, list[str]]] = []
    for tier in TIERS:
        entry = thresholds["tiers"][f"tier{tier}"]
        thr = entry["threshold"]
        if thr is not None:
            source = "the tier's derived threshold"
        elif entry["ruleAnswerAfterStubFloor"] is not None:
            thr = entry["ruleAnswerAfterStubFloor"]
            source = (
                "the bucket rule's own answer — no count in this tier produced a set that clears "
                "the lexical line, so the tier has no final threshold and this is the count the "
                "positional rule selected"
            )
        else:
            thr = entry["selectionStartedAt"]
            source = (
                "the stub floor of 3 — the bucket rule selected no count in this tier at all, so "
                "this is the lowest count a page could ever be indexed at"
            )
        counts = []
        for offset, label in ((-1, "threshold − 1"), (0, "threshold"), (1, "threshold + 1")):
            level = thr + offset
            members = sorted(k for k, r in presence.items() if r["tier"] == tier and r["present"] == level)
            if len(members) > PER_BUCKET:
                picked = [members[i] for i in sorted(rng.choice(len(members), size=PER_BUCKET, replace=False).tolist())]
            else:
                picked = members
            counts.append(len(picked))
            plan.append((tier, level, label, picked))
        out.append(f"| {tier} | {thr} | {source} | {counts[0]} | {counts[1]} | {counts[2]} |\n")

    body: list[str] = []
    words_used = 0
    for tier, level, label, picked in plan:
        body.append(f"\n## Tier {tier} — {label} (present over applicable = {level}), {len(picked)} pages\n")
        if not picked:
            body.append("\nNo page in this tier holds that count.\n")
            continue
        for key in picked:
            row = presence[key]
            page = pages[key]
            excerpt, used = first_words(page["text"], WORDS_PER_PAGE)
            words_used += used
            body.append(
                f"\n### {names.get(key, key)}\n\n"
                f"Tier {row['tier']} · {row['model']} · {row['present']} of {row['applicable']} "
                f"applicable fields present · rendered page {page['wordCount']} words · `{key}`\n\n"
                "```\n" + excerpt + "\n```\n"
            )

    text = "".join(out) + "".join(body)
    total_words = len(re.findall(r"\S+", text))
    if total_words >= WORD_CAP:
        raise SystemExit(
            f"the file would hold {total_words} words, at or over the {WORD_CAP} cap; "
            "lower PER_BUCKET or WORDS_PER_PAGE and re-run"
        )
    footer = (
        f"\n---\n\n{sum(len(p) for _, _, _, p in plan)} pages, {words_used} words of page text, "
        f"{total_words} words in this file (cap {WORD_CAP}).\n"
    )
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text + footer, encoding="utf-8")
    print(f"pages={sum(len(p) for _, _, _, p in plan)} pageTextWords={words_used} fileWords={total_words + len(re.findall(r'\\S+', footer))}")
    print(f"md={os.path.relpath(out_path, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
