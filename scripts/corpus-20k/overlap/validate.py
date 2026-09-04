#!/usr/bin/env python
"""Validate the LSH path against an exhaustive run of the same harness.

    validate.py --pages <ndjson> --out <dir> [--corpus-label synthetic-324]

Builds the page store once, then computes every page's nearest-neighbour positional and lexical
maxima twice: exhaustively (every pair) and through the MinHash/LSH candidate path. Reports the
per-page deltas. The spec's rule: **unfit above 0.02 median delta**, and the run says so rather
than proceeding.
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
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    lsh_neighbours,
    lsh_threshold,
    make_hash_seeds,
    peak_rss_mb,
)

FIT_MEDIAN_DELTA = 0.02


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pages", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--corpus-label", default="")
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
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    started = time.perf_counter()
    source = SourceIndex.build(args.pages, None)
    seeds = make_hash_seeds(args.permutations, args.seed)
    store = PageStore(args.out / "validation-pages.duckdb")
    build = build_store(source, store, seeds, batch=args.batch)

    exact = exhaustive_neighbours(store)
    approx = lsh_neighbours(
        store,
        bands=args.bands,
        rows=args.rows,
        max_bucket=args.max_bucket,
        rerank=args.rerank,
        seed=args.seed,
        min_candidates=args.min_candidates,
        backfill=BACKFILL_STRUCTURES if args.cascade else (),
    )

    d_pos = np.abs(exact.positional - approx.positional)
    d_lex = np.abs(exact.lexical - approx.lexical)
    same_partner_pos = int(np.count_nonzero(exact.positional_partner == approx.positional_partner))
    same_partner_lex = int(np.count_nonzero(exact.lexical_partner == approx.lexical_partner))

    rows = []
    for idx in range(store.size):
        rows.append({
            "key": store.key(idx),
            "exactPositional": round(float(exact.positional[idx]), 6),
            "lshPositional": round(float(approx.positional[idx]), 6),
            "deltaPositional": round(float(d_pos[idx]), 6),
            "exactLexical": round(float(exact.lexical[idx]), 6),
            "lshLexical": round(float(approx.lexical[idx]), 6),
            "deltaLexical": round(float(d_lex[idx]), 6),
        })
    (args.out / "validation-per-page.ndjson").write_text(
        "\n".join(json.dumps(r) for r in rows) + "\n", encoding="utf-8"
    )

    median_pos = float(np.median(d_pos))
    median_lex = float(np.median(d_lex))
    fit = median_pos <= FIT_MEDIAN_DELTA and median_lex <= FIT_MEDIAN_DELTA
    elapsed = time.perf_counter() - started

    report = {
        "validationCorpus": args.corpus_label or str(args.pages),
        "pages": store.size,
        "fitRule": f"unfit above {FIT_MEDIAN_DELTA} median delta",
        "fit": fit,
        "delta": {
            "positional": {
                "median": round(median_pos, 6),
                "mean": round(float(d_pos.mean()), 6),
                "p90": round(float(np.percentile(d_pos, 90)), 6),
                "max": round(float(d_pos.max()), 6),
                "pagesExact": int(np.count_nonzero(d_pos == 0)),
            },
            "lexical": {
                "median": round(median_lex, 6),
                "mean": round(float(d_lex.mean()), 6),
                "p90": round(float(np.percentile(d_lex, 90)), 6),
                "max": round(float(d_lex.max()), 6),
                "pagesExact": int(np.count_nonzero(d_lex == 0)),
            },
            "samePartner": {"positional": same_partner_pos, "lexical": same_partner_lex},
        },
        "exhaustive": {
            "positional": distribution(exact.positional),
            "lexical": distribution(exact.lexical),
            "pairsScored": exact.pairs_scored,
            "seconds": round(exact.seconds, 3),
        },
        "lsh": {
            "positional": distribution(approx.positional),
            "lexical": distribution(approx.lexical),
            "pairsScored": approx.pairs_scored,
            "candidatesConsidered": approx.candidates_total,
            "largestBucket": max(approx.bucket_sizes) if approx.bucket_sizes else None,
            "seconds": round(approx.seconds, 3),
            "bands": args.bands,
            "rows": args.rows,
            "analyticThreshold": round(lsh_threshold(args.bands, args.rows), 4),
            "specDefault": args.bands == NEIGHBOUR_BANDS and args.rows == NEIGHBOUR_ROWS,
            "cascade": args.cascade,
            "structures": [list(s) for s in approx.structures],
            "backfilledPages": approx.backfilled_pages,
        },
        "work": {"tokens": build.tokens, "vocabulary": build.vocabulary},
        "timings": {
            "buildSeconds": round(build.seconds, 3),
            "totalSeconds": round(elapsed, 3),
            "pagesPerSecondLsh": round(store.size / (build.seconds + approx.seconds), 2),
            "pagesPerSecondExhaustive": round(store.size / (build.seconds + exact.seconds), 2),
        },
        "peakRssMb": peak_rss_mb(),
    }
    (args.out / "validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    store.close()
    print(json.dumps(report, indent=2))
    return 0 if fit else 1


if __name__ == "__main__":
    raise SystemExit(main())
