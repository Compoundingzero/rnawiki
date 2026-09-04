#!/usr/bin/env python
"""Measure page overlap across a corpus of extracted page texts (risk R3).

    measure.py --pages <ndjson of {key, text[, tier]}> --out <dir> [--sample <slug list>]
               [--exhaustive] [--no-controls] [--sweep] [--matched-size N ...]

Writes into ``--out``:

    summary.json        corpus-level distributions, controls, null model, matched-size blocks
    per-page.ndjson     one row per page: nearest-neighbour maxima, partners, shared-word share
    above-target.ndjson every page above the uniqueness target, and which page it shares with
    missed-merges.json  the 16x8 >= 0.6 sweep (only with --sweep)
    run.json            parameters, timings, peak RSS, pages/second

Nothing here fetches anything; page text is prepared upstream.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from harness import (  # noqa: E402
    BATCH_SIZE,
    DEFAULT_PERMUTATIONS,
    DEFAULT_SEED,
    DEFAULT_MIN_CANDIDATES,
    BACKFILL_STRUCTURES,
    NEIGHBOUR_BANDS,
    NEIGHBOUR_ROWS,
    SHARED_WORD_FRACTION,
    SWEEP_BANDS,
    SWEEP_ROWS,
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    expected_nearest_neighbour,
    lsh_neighbours,
    lsh_threshold,
    make_hash_seeds,
    missed_merge_sweep,
    other_page_filler,
    own_text_filler,
    peak_rss_mb,
    per_page_rows,
    random_pair_scores,
    tier_medians,
)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pages", required=True, type=Path, help="NDJSON of {key, text[, tier]}")
    parser.add_argument("--out", required=True, type=Path, help="output directory")
    parser.add_argument("--sample", type=Path, help="file of page keys, one per line, to restrict to")
    parser.add_argument("--exhaustive", action="store_true", help="score every pair instead of LSH candidates")
    parser.add_argument("--no-controls", dest="controls", action="store_false", help="skip the two filler controls")
    parser.add_argument("--sweep", action="store_true", help="also run the 16x8 >= 0.6 missed-merge sweep")
    parser.add_argument("--matched-size", type=int, action="append", default=None,
                        help="also report at this sample size (repeatable; default 324 and 803)")
    parser.add_argument("--target-positional", type=float, default=0.20)
    parser.add_argument("--target-lexical", type=float, default=0.40)
    parser.add_argument("--sweep-threshold", type=float, default=0.60)
    parser.add_argument("--sweep-bands", type=int, default=SWEEP_BANDS)
    parser.add_argument("--sweep-rows", type=int, default=SWEEP_ROWS)
    parser.add_argument("--permutations", type=int, default=DEFAULT_PERMUTATIONS)
    parser.add_argument("--batch", type=int, default=BATCH_SIZE)
    parser.add_argument("--bands", type=int, default=NEIGHBOUR_BANDS,
                        help="LSH bands for the nearest-neighbour pass (spec default 32)")
    parser.add_argument("--rows", type=int, default=NEIGHBOUR_ROWS,
                        help="LSH rows per band (spec default 4)")
    parser.add_argument("--max-bucket", type=int, default=512)
    parser.add_argument("--rerank", type=int, default=64)
    parser.add_argument("--min-candidates", type=int, default=DEFAULT_MIN_CANDIDATES,
                        help="widen the candidate net for pages the primary structure starves")
    parser.add_argument("--no-cascade", dest="cascade", action="store_false",
                        help="spec-literal: use only the primary band structure, no backfill")
    parser.add_argument("--cache-pages", type=int, default=2000)
    parser.add_argument("--null-samples", type=int, default=20000)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--label", default="", help="free-text label recorded in run.json")
    return parser.parse_args(argv)


def load_sample(path: Path | None) -> set[str] | None:
    if path is None:
        return None
    keys: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        keys.add(line.split("\t")[0].split(",")[0])
    return keys


def neighbours(store: PageStore, args: argparse.Namespace, subset=None):
    if args.exhaustive:
        return exhaustive_neighbours(store, subset)
    return lsh_neighbours(
        store,
        subset,
        bands=args.bands,
        rows=args.rows,
        max_bucket=args.max_bucket,
        rerank=args.rerank,
        seed=args.seed,
        min_candidates=args.min_candidates,
        backfill=BACKFILL_STRUCTURES if args.cascade else (),
    )


def measure_block(store: PageStore, result, subset, label: str) -> dict:
    members = list(range(store.size)) if subset is None else list(subset)
    pos = result.positional[members]
    lex = result.lexical[members]
    return {
        "label": label,
        "pages": len(members),
        "positional": distribution(pos),
        "lexical": distribution(lex),
    }


def run_control(source, args, seeds, name, transform, subset_size=None) -> dict:
    store = PageStore(args.out / f"control-{name}.duckdb", cache_pages=args.cache_pages)
    try:
        build_store(source, store, seeds, batch=args.batch, transform=transform, keep_word_rows=False)
        result = neighbours(store, args)
        block = measure_block(store, result, None, f"control:{name}")
        block["medianTokens"] = int(np.median([store.n_tokens(i) for i in range(store.size)]))
        return block
    finally:
        store.close()


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()

    wanted = load_sample(args.sample)
    source = SourceIndex.build(args.pages, wanted)
    if wanted is not None:
        missing = sorted(wanted - set(source.keys))
        if missing:
            print(f"warning: {len(missing)} sample keys absent from {args.pages}", file=sys.stderr)
    n_pages = len(source.offsets)
    if n_pages < 2:
        print("fewer than two pages: nothing to measure", file=sys.stderr)
        return 2

    seeds = make_hash_seeds(args.permutations, args.seed)
    store = PageStore(args.out / "pages.duckdb", cache_pages=args.cache_pages)
    build_stats = build_store(source, store, seeds, batch=args.batch)

    result = neighbours(store, args)
    shared_share = store.shared_word_share()

    # per-page rows and the pages above target
    per_page_path = args.out / "per-page.ndjson"
    above_path = args.out / "above-target.ndjson"
    above_count = {"positional": 0, "lexical": 0}
    with per_page_path.open("w", encoding="utf-8") as pp, above_path.open("w", encoding="utf-8") as ab:
        for row in per_page_rows(store, result, shared_share):
            pp.write(json.dumps(row) + "\n")
            over_pos = row["positional"] > args.target_positional
            over_lex = row["lexical"] > args.target_lexical
            if over_pos:
                above_count["positional"] += 1
            if over_lex:
                above_count["lexical"] += 1
            if over_pos or over_lex:
                ab.write(json.dumps({
                    "key": row["key"],
                    "positional": row["positional"],
                    "positionalPartner": row["positionalPartner"],
                    "lexical": row["lexical"],
                    "lexicalPartner": row["lexicalPartner"],
                    "overPositionalTarget": over_pos,
                    "overLexicalTarget": over_lex,
                }) + "\n")

    # null model: the corpus-size adjustment
    null_pos, null_lex = random_pair_scores(store, samples=args.null_samples, seed=args.seed)
    matched_sizes = args.matched_size or [324, 803]
    null_model = {
        "randomPairPositional": distribution(null_pos),
        "randomPairLexical": distribution(null_lex),
        "expectedNearestNeighbour": {
            "full": {
                "pages": store.size,
                "positional": expected_nearest_neighbour(null_pos, store.size, seed=args.seed),
                "lexical": expected_nearest_neighbour(null_lex, store.size, seed=args.seed),
            },
            "matched": [
                {
                    "pages": size,
                    "positional": expected_nearest_neighbour(null_pos, size, seed=args.seed),
                    "lexical": expected_nearest_neighbour(null_lex, size, seed=args.seed),
                }
                for size in matched_sizes
                if size >= 2
            ],
        },
        "note": (
            "Nearest-neighbour maxima rise with corpus size alone. Compare an observed maximum "
            "with the expected maximum over the same number of draws before reading a rise as a "
            "change in the pages."
        ),
    }

    # matched-size blocks: the same measurement restricted to a fixed-size draw
    rng = np.random.default_rng(args.seed)
    matched_blocks = []
    for size in matched_sizes:
        if size < 2 or size >= store.size:
            continue
        subset = sorted(rng.choice(store.size, size=size, replace=False).tolist())
        sub_result = exhaustive_neighbours(store, subset) if size <= 1500 else neighbours(store, subset)
        block = measure_block(store, sub_result, subset, f"matched-{size}")
        block["mode"] = sub_result.mode
        block["sharedWordShareMedian"] = round(float(np.median(shared_share[subset])), 6)
        matched_blocks.append(block)

    controls = []
    if args.controls:
        controls.append(run_control(source, args, seeds, "other", other_page_filler(source, args.seed)))
        controls.append(run_control(source, args, seeds, "self", own_text_filler()))

    sweep = None
    if args.sweep:
        sweep = missed_merge_sweep(
            store,
            threshold=args.sweep_threshold,
            max_bucket=args.max_bucket,
            seed=args.seed,
            bands=args.sweep_bands,
            rows=args.sweep_rows,
        )
        (args.out / "missed-merges.json").write_text(json.dumps(sweep, indent=2), encoding="utf-8")

    full_block = measure_block(store, result, None, "full-corpus")
    full_block["mode"] = result.mode
    summary = {
        "pages": store.size,
        "medianTokens": int(np.median([store.n_tokens(i) for i in range(store.size)])),
        "medianShingles": int(np.median([store.n_shingles(i) for i in range(store.size)])),
        "full": full_block,
        "matched": matched_blocks,
        "sharedWordShare": {
            "definition": f"share of a page's word occurrences whose word appears on more than "
                          f"{SHARED_WORD_FRACTION:.0%} of the other pages",
            "median": round(float(np.median(shared_share)), 6),
            "p90": round(float(np.percentile(shared_share, 90)), 6),
            "byTier": tier_medians(store, shared_share),
        },
        "aboveTarget": {
            "targetPositional": args.target_positional,
            "targetLexical": args.target_lexical,
            "positional": above_count["positional"],
            "lexical": above_count["lexical"],
            "file": above_path.name,
        },
        "controls": controls,
        "nullModel": null_model,
        "missedMergeSweep": None if sweep is None else {
            "threshold": args.sweep_threshold,
            "bands": args.sweep_bands,
            "rows": args.sweep_rows,
            "analyticThreshold": round(lsh_threshold(args.sweep_bands, args.sweep_rows), 4),
            "pairs": len(sweep),
        },
    }
    (args.out / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    elapsed = time.perf_counter() - started
    run = {
        "label": args.label,
        "pagesFile": str(args.pages),
        "sampleFile": None if args.sample is None else str(args.sample),
        "pages": store.size,
        "mode": result.mode,
        "parameters": {
            "shingle": 5,
            "permutations": args.permutations,
            "batch": args.batch,
            "neighbourBands": args.bands,
            "neighbourRows": args.rows,
            "neighbourAnalyticThreshold": round(lsh_threshold(args.bands, args.rows), 4),
            "neighbourBandsAreSpecDefault": args.bands == NEIGHBOUR_BANDS and args.rows == NEIGHBOUR_ROWS,
            "sweepBands": SWEEP_BANDS,
            "sweepRows": SWEEP_ROWS,
            "sweepAnalyticThreshold": round(lsh_threshold(SWEEP_BANDS, SWEEP_ROWS), 4),
            "cascade": args.cascade,
            "candidateStructures": [list(s) for s in result.structures],
            "backfilledPages": result.backfilled_pages,
            "minCandidates": args.min_candidates,
            "maxBucket": args.max_bucket,
            "rerank": args.rerank,
            "cachePages": args.cache_pages,
            "seed": args.seed,
        },
        "timings": {
            "buildSeconds": round(build_stats.seconds, 3),
            "neighbourSeconds": round(result.seconds, 3),
            "totalSeconds": round(elapsed, 3),
            "pagesPerSecond": round(store.size / elapsed, 2) if elapsed > 0 else None,
        },
        "work": {
            "tokens": build_stats.tokens,
            "vocabulary": build_stats.vocabulary,
            "candidatesConsidered": result.candidates_total,
            "pairsScoredExactly": result.pairs_scored,
            "largestBucket": max(result.bucket_sizes) if result.bucket_sizes else None,
        },
        "peakRssMb": peak_rss_mb(),
    }
    (args.out / "run.json").write_text(json.dumps(run, indent=2), encoding="utf-8")
    store.close()

    print(json.dumps({"summary": str(args.out / "summary.json"), "run": run["timings"], "peakRssMb": run["peakRssMb"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
