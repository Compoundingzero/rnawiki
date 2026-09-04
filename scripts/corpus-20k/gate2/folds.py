#!/usr/bin/env python
"""Size-matched folds for Gate 2.

A nearest-neighbour maximum rises with the number of pages it is drawn against, so a set of 521
pages and a baseline draw of 324 are not comparable until both are scored against the same number
of candidates. This scores every page of a set inside a seeded fold of a fixed size, using the
same fold construction Gate 1b used (``gate1b_v3.fold_membership``), the same shingles and the same
exhaustive scorer, and pools the owners' scores.

    folds.py --pages <ndjson> --out <dir> --fold-size 324 [--label ...]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

OVERLAP = Path(__file__).resolve().parents[1] / "overlap"
sys.path.insert(0, str(OVERLAP))

from harness import (  # noqa: E402
    DEFAULT_SEED,
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    make_hash_seeds,
)
from gate1b_v3 import fold_membership  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pages", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--fold-size", type=int, default=324)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--permutations", type=int, default=128)
    parser.add_argument("--label", default="")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    source = SourceIndex.build(args.pages, None)
    seeds = make_hash_seeds(args.permutations, args.seed)
    store = PageStore(args.out / "pages.duckdb", cache_pages=2000)
    try:
        build_store(source, store, seeds)
        n = store.size
        if n <= args.fold_size:
            folds, owners = [list(range(n))], [list(range(n))]
        else:
            folds, owners, _order = fold_membership(n, args.fold_size, seed=args.seed)
        positional: list[float] = []
        lexical: list[float] = []
        per_page = {}
        for fold, owned in zip(folds, owners):
            result = exhaustive_neighbours(store, fold)
            own = set(owned)
            for index in fold:
                if index not in own:
                    continue
                positional.append(float(result.positional[index]))
                lexical.append(float(result.lexical[index]))
                per_page[store.key(index)] = {
                    "positional": float(result.positional[index]),
                    "lexical": float(result.lexical[index]),
                }
        summary = {
            "label": args.label,
            "pages": n,
            "foldSize": args.fold_size,
            "folds": [len(f) for f in folds],
            "owners": [len(o) for o in owners],
            "positional": distribution(np.array(positional)),
            "lexical": distribution(np.array(lexical)),
        }
        (args.out / "summary.json").write_text(json.dumps(summary, indent=1), encoding="utf-8")
        (args.out / "per-page.json").write_text(json.dumps(per_page), encoding="utf-8")
        print(json.dumps({k: summary[k] for k in ("pages", "foldSize", "folds")}, indent=1))
        print("positional median", summary["positional"]["median"])
        print("lexical median", summary["lexical"]["median"])
    finally:
        store.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
