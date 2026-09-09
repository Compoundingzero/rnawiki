#!/usr/bin/env python
"""Phase 6.3 — the committed inputs the pre-merge checks read.

A GitHub Actions runner holds only what this repository carries. `data/revamp/render-v8/`,
`data/revamp/page-blocks/` and `data/revamp/fields-v2/` are gitignored (they run to hundreds of
megabytes and are rewritten wholesale by their builders), so three of the four required pre-merge
checks would have nothing to read. This script writes the small committed inputs they read instead,
from the working copy of the corpus, and records in a manifest which files and which revision each
one came from.

What it writes, all under `data/revamp/ci-sample/`:

  ruler pair
      `thresholds-v<n>.json`, a byte copy of the newest ruler on disk, and
      `presence-applicable-v<n>-hub-members.ndjson`, the presence rows of the indexable leaves that
      `data/revamp/hubs/members.parquet` records as hub members. `link_graph_check.py --data-only`
      reads this pair. Its rule 2 asks whether an indexable leaf is in a hub or has a recorded
      reason for not being in one, and the second half of that question is answered from
      `data/revamp/fields-v2/`, which CI does not have; over this subset the question is the first
      half alone — every leaf in it must still be in a hub — and a member the hub build drops fails
      the check by name. Rules 1, 3 and 4 read the committed hub parquet files and are checked in
      full. Phase 7 refreshes this pair when the settled ruler lands, and the workstation runs the
      whole of rule 2 against the full presence file and the field records.

  render sample
      `render/{text,text-with-furniture,provenance-with-furniture,blocks}.ndjson.gz`, one gzipped
      NDJSON file each, for the same `--pages` page keys, drawn from the highest `render-v<n>` on
      disk beside `data/revamp/page-blocks/`. `tests/test_render_safety.py --sample` reads them
      through `tests/conftest.py`. The draw is not random alone: every rule in that file that
      asserts it saw something to check (a controlled-substance page, a Poisons Standard row, a
      quoted label sentence, a supervision block on each of its two branches, a not-found register
      line, a trial row) has pages drawn for it first, by name, and the rest of the sample is a
      seeded per-tier fill. `--max-bytes` is the size the committed sample may not exceed.

  robots snapshot
      `robots.ts.snapshot`, a byte copy of `app/robots.ts`. Operating Rule 7 fixes the crawl rules
      for this run; `tests/unit/ci-sitemap-invariants.test.ts` compares the file with this copy so a
      change to them fails a required check instead of reaching a deploy.

    .venv-corpus/bin/python scripts/revamp/ci_sample.py
    .venv-corpus/bin/python scripts/revamp/ci_sample.py --check    # CI: fail if stale
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import random
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable, Iterator

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
REVAMP = ROOT / "data/revamp"
OUT = REVAMP / "ci-sample"
RENDER_OUT = OUT / "render"
HUB_MEMBERS = REVAMP / "hubs/members.parquet"
BLOCKS_DIR = REVAMP / "page-blocks"
CANONICAL = REVAMP / "identity/canonical-v5.ndjson"
ROBOTS = ROOT / "app/robots.ts"

BATCH = re.compile(r"^batch-\d+\.ndjson$")

# The shapes the render-safety rules look for, so the draw can guarantee each rule something to
# check. Each one is quoted from the rule that asserts it saw a page of this kind.
TIER_LINE = re.compile(r"^(Label-documented|Curated|Predicted from mechanism)\b")
QUOTED = re.compile(r'"[^"]*"')
NO_INTERACTION_FOUND = re.compile(r"^No interaction found in .+ as of \d{4}-\d{2}-\d{2}\.$")
CHECKED_IN = re.compile(r"^Checked in .+ as of \d{4}-\d{2}-\d{2}\.$")
ABSENCE_TABLE_CAPTION = "Registers holding no record of this substance"
# docs/specs/phase4-generators.md §15(1): the supervision answer is one clause per recorded class,
# each built from that class's own evidence. These are the clauses' own words; the generic labels
# they replaced said what a class of that kind might be and are on no page.
CLASS_WORDS = tuple(
    phrase.lower()
    for phrase in (
        "World Health Organization ATC class",
        "statute schedules it as a controlled substance",
        "risk to a developing baby",
        "pregnancy-prevention programme",
        "hazardous-medicine class",
        "Risk Evaluation and Mitigation Strategy",
        "boxed warning",
        "route of administration is one a clinician gives",
        "withdrawn or suspended for a safety reason",
        "long-acting or titrated injected form",
        "no classification is recorded for this compound",
    )
)
FURTHER_TRIALS = re.compile(r"^\d+ further recorded trials?\b")


def newest_ruler() -> tuple[Path, Path, str]:
    """The highest `thresholds-v<n>.json` that has its presence file beside it, as the check reads it."""
    found: list[tuple[int, Path, Path]] = []
    for path in sorted(REVAMP.glob("thresholds-v*.json")):
        revision = path.stem[len("thresholds-v"):]
        presence = REVAMP / f"presence-applicable-v{revision}.ndjson"
        if revision.isdigit() and presence.exists():
            found.append((int(revision), path, presence))
    if not found:
        raise SystemExit(f"no thresholds-v<n>.json with a presence file beside it under {REVAMP}")
    revision, thresholds, presence = max(found)
    return thresholds, presence, f"v{revision}"


def newest_render() -> Path:
    """The highest `render-v<n>` carrying both the painted text and its provenance map."""
    found: list[tuple[int, Path]] = []
    for path in sorted(REVAMP.glob("render-v*")):
        revision = path.name[len("render-v"):]
        if not revision.isdigit():
            continue
        if (path / "text-with-furniture").is_dir() and (path / "provenance-with-furniture").is_dir():
            found.append((int(revision), path))
    if not found:
        raise SystemExit(f"no render-v<n> with text-with-furniture and provenance-with-furniture "
                         f"under {REVAMP}; run `npx tsx scripts/revamp/page_text_v5.ts` first")
    return max(found)[1]


def read_ndjson_dir(directory: Path) -> Iterator[tuple[str, dict[str, Any]]]:
    for path in sorted(p for p in directory.iterdir() if BATCH.match(p.name)):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    yield line, json.loads(line)


# ---------------------------------------------------------------------------------------------
# the ruler pair


def write_ruler(check: bool) -> list[tuple[Path, str]]:
    thresholds, presence, revision = newest_ruler()
    per_tier = {
        int(name.removeprefix("tier")): record.get("threshold")
        for name, record in json.loads(thresholds.read_text(encoding="utf-8"))["tiers"].items()
    }
    members = {
        str(row["page"])
        for row in pq.read_table(HUB_MEMBERS, columns=["page"]).to_pylist()
    }
    kept: list[str] = []
    indexable = 0
    with presence.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            threshold = per_tier.get(int(row["tier"]))
            if threshold is None or int(row["present"]) < int(threshold):
                continue
            indexable += 1
            if str(row["key"]) in members:
                kept.append(json.dumps(row, ensure_ascii=False, sort_keys=True))
    if not kept:
        raise SystemExit("no indexable leaf is a hub member; the ruler pair would check nothing")
    print(f"ruler {revision}: {indexable} indexable leaves, {len(kept)} of them hub members")
    return [
        (OUT / thresholds.name, thresholds.read_text(encoding="utf-8")),
        (OUT / f"presence-applicable-{revision}-hub-members.ndjson", "\n".join(sorted(kept)) + "\n"),
    ]


# ---------------------------------------------------------------------------------------------
# the render sample


class Flags:
    """What each page can prove, one bit per rule that asserts it saw a page of that kind."""

    NAMES = (
        "tier-1", "tier-2", "tier-3",
        "controlled", "controlled-schedules", "poisons-standard-row",
        "quoted-interaction-span", "interaction-line", "no-interaction-found",
        "checked-in", "not-found-line", "absence-table",
        "supervision-block", "supervision-in-class-words",
        "trial-row", "composed-sentence",
    )

    def __init__(self) -> None:
        self.by_page: dict[str, set[str]] = defaultdict(set)
        self.tier: dict[str, int] = {}
        self.cost: dict[str, int] = defaultdict(int)

    def mark(self, key: str, name: str) -> None:
        self.by_page[key].add(name)


def scan_text(flags: Flags, directory: Path) -> None:
    for raw, row in read_ndjson_dir(directory):
        key = row["key"]
        flags.cost[key] += len(raw) + 1
        flags.tier[key] = int(row["tier"])
        flags.mark(key, f"tier-{int(row['tier'])}")
        text = row["text"]
        lowered = text.lower()
        if ABSENCE_TABLE_CAPTION in text:
            flags.mark(key, "absence-table")
        if "Not found in" in text:
            flags.mark(key, "not-found-line")
        supervision = "carry a supervision requirement?" in text
        if supervision:
            flags.mark(key, "supervision-block")
            if any(word in lowered for word in CLASS_WORDS):
                flags.mark(key, "supervision-in-class-words")
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
            if NO_INTERACTION_FOUND.match(line):
                flags.mark(key, "no-interaction-found")
            if CHECKED_IN.match(line):
                flags.mark(key, "checked-in")
            if TIER_LINE.match(line):
                flags.mark(key, "interaction-line")
                for span in QUOTED.findall(line):
                    if len(" ".join(span.strip('"').split()).rstrip("…").strip()) >= 12:
                        flags.mark(key, "quoted-interaction-span")


def scan_free_text(flags: Flags, directory: Path) -> None:
    for raw, row in read_ndjson_dir(directory):
        flags.cost[row["key"]] += len(raw) + 1


def scan_blocks(flags: Flags, directory: Path) -> None:
    for raw, row in read_ndjson_dir(directory):
        key = row["key"]
        flags.cost[key] += len(raw) + 1
        if row.get("controlled"):
            flags.mark(key, "controlled")
        schedules = row.get("controlledSchedules") or []
        if schedules:
            flags.mark(key, "controlled-schedules")
        for entry in schedules:
            if entry.get("jurisdiction") == "AU" and entry.get("substanceAsListed"):
                flags.mark(key, "poisons-standard-row")


def scan_provenance(flags: Flags, directory: Path) -> None:
    for raw, row in read_ndjson_dir(directory):
        key = row["key"]
        flags.cost[key] += len(raw) + 1
        for entry in row.get("provenance") or []:
            sentence = entry.get("sentence") or ""
            if entry.get("kind", "sentence") == "sentence":
                flags.mark(key, "composed-sentence")
            elif entry.get("kind") == "row" and (
                sentence.startswith("Trial ") or FURTHER_TRIALS.match(sentence)
            ):
                flags.mark(key, "trial-row")


def choose(flags: Flags, canonical_keys: set[str], pages: int, per_requirement: int,
           seed: int) -> tuple[list[str], dict[str, list[str]]]:
    """Pages for every rule that asserts it saw one, then a seeded per-tier fill."""
    eligible = {
        key
        for key, marks in flags.by_page.items()
        # A page enters the sample only where all four streams hold it, so no rule reads a page
        # whose blocks or provenance the sample lacks.
        if key in canonical_keys and {"composed-sentence"} <= marks and key in flags.tier
    }
    chosen: list[str] = []
    coverage: dict[str, list[str]] = {}
    for name in Flags.NAMES:
        holders = sorted(key for key in eligible if name in flags.by_page[key])
        if not holders:
            raise SystemExit(f"no rendered page proves {name!r}; the sample would leave the rule "
                             "that asserts it with nothing to check")
        take = [key for key in holders if key not in chosen][:per_requirement]
        # Where every holder is already drawn the requirement is met by those pages.
        coverage[name] = (take + [key for key in holders if key in chosen])[:per_requirement]
        chosen.extend(take)

    rng = random.Random(seed)
    by_tier: dict[int, list[str]] = defaultdict(list)
    for key in sorted(eligible - set(chosen)):
        by_tier[flags.tier[key]].append(key)
    tiers = sorted(by_tier)
    while len(chosen) < pages and any(by_tier[tier] for tier in tiers):
        for tier in tiers:
            if len(chosen) >= pages or not by_tier[tier]:
                continue
            pool = by_tier[tier]
            chosen.append(pool.pop(rng.randrange(len(pool))))
    return sorted(chosen), coverage


def write_render_sample(render: Path, keys: set[str]) -> list[tuple[Path, bytes]]:
    sources = {
        "text": render / "text",
        "text-with-furniture": render / "text-with-furniture",
        "provenance-with-furniture": render / "provenance-with-furniture",
        "blocks": BLOCKS_DIR,
    }
    written: list[tuple[Path, bytes]] = []
    for name, directory in sources.items():
        held: dict[str, str] = {}
        for raw, row in read_ndjson_dir(directory):
            if row["key"] in keys:
                held[row["key"]] = raw
        missing = sorted(keys - set(held))
        if missing:
            raise SystemExit(f"{directory} holds no record for {len(missing)} drawn page(s); "
                             f"the first is {missing[0]}")
        body = "\n".join(held[key] for key in sorted(keys)) + "\n"
        # mtime 0 so the same input always produces the same bytes and --check can compare them.
        buffer = gzip.compress(body.encode("utf-8"), compresslevel=9, mtime=0)
        written.append((RENDER_OUT / f"{name}.ndjson.gz", buffer))
    return written


# ---------------------------------------------------------------------------------------------


def emit(files: list[tuple[Path, bytes]], check: bool) -> int:
    """Write every file, or in --check mode report the first that differs."""
    stale: list[str] = []
    for path, payload in files:
        if check:
            if not path.exists():
                stale.append(f"MISSING {path.relative_to(ROOT)}")
            elif path.read_bytes() != payload:
                stale.append(f"STALE   {path.relative_to(ROOT)} "
                             f"({len(path.read_bytes())} bytes committed, {len(payload)} produced)")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    if check and stale:
        for line in stale:
            print(line, file=sys.stderr)
        print("regenerate with: .venv-corpus/bin/python scripts/revamp/ci_sample.py "
              "(the corpus this reads lives on the workstation)", file=sys.stderr)
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pages", type=int, default=200, help="pages in the render sample")
    parser.add_argument("--per-requirement", type=int, default=3,
                        help="pages drawn for each rule that asserts it saw one")
    parser.add_argument("--seed", type=int, default=20260908)
    parser.add_argument("--max-bytes", type=int, default=5_000_000,
                        help="the size the committed sample may not exceed")
    parser.add_argument("--check", action="store_true",
                        help="write nothing; fail if the committed sample is not what the corpus "
                             "on this machine produces")
    args = parser.parse_args()

    files: list[tuple[Path, bytes]] = [
        (path, text.encode("utf-8")) for path, text in write_ruler(args.check)
    ]
    files.append((OUT / "robots.ts.snapshot", ROBOTS.read_bytes()))

    render = newest_render()
    flags = Flags()
    print(f"reading {render.relative_to(ROOT)} and {BLOCKS_DIR.relative_to(ROOT)} …", flush=True)
    scan_text(flags, render / "text-with-furniture")
    scan_free_text(flags, render / "text")
    scan_blocks(flags, BLOCKS_DIR)
    scan_provenance(flags, render / "provenance-with-furniture")
    canonical_keys = {
        json.loads(line)["key"]
        for line in CANONICAL.open(encoding="utf-8")
        if line.strip()
    }

    chosen, coverage = choose(flags, canonical_keys, args.pages, args.per_requirement, args.seed)
    if len(chosen) < args.pages:
        raise SystemExit(f"only {len(chosen)} pages are held by all four streams; "
                         f"{args.pages} were asked for")
    render_files = write_render_sample(render, set(chosen))
    files.extend(render_files)

    tiers: dict[int, int] = defaultdict(int)
    for key in chosen:
        tiers[flags.tier[key]] += 1
    manifest = {
        "generatedBy": "scripts/revamp/ci_sample.py",
        "render": str(render.relative_to(ROOT)),
        "blocks": str(BLOCKS_DIR.relative_to(ROOT)),
        "canonical": str(CANONICAL.relative_to(ROOT)),
        "pages": len(chosen),
        "pagesPerTier": {str(tier): tiers[tier] for tier in sorted(tiers)},
        "seed": args.seed,
        "perRequirement": args.per_requirement,
        "coverage": {name: coverage[name] for name in Flags.NAMES},
        "files": {
            str(path.relative_to(OUT)): {
                "bytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
            }
            for path, payload in sorted(render_files)
        },
        "keys": chosen,
    }
    files.append((RENDER_OUT / "manifest.json",
                  (json.dumps(manifest, indent=1, ensure_ascii=False) + "\n").encode("utf-8")))

    total = sum(len(payload) for _path, payload in files)
    if total > args.max_bytes:
        raise SystemExit(f"the sample is {total} bytes, over the {args.max_bytes} cap; "
                         f"lower --pages")
    status = emit(files, args.check)
    print(f"{len(chosen)} pages ({', '.join(f'tier {t}: {tiers[t]}' for t in sorted(tiers))}), "
          f"{total} bytes in {len(files)} files under {OUT.relative_to(ROOT)}")
    return status


if __name__ == "__main__":
    sys.exit(main())
