#!/usr/bin/env python3
"""Phase 1.6 — re-evaluate corpus-20k Gates 1, 1b and 2 under the corrected ruler.

Gate 1  `scripts/corpus-20k/fields/coverage.py:main()` compares the Tier 1 LONGEVITY median
        present-field count out of 15 against 8. Recomputed here as the median present count over
        applicable fields, on two bases: coverage.py's own fifteen-field list (the loader's lifted
        `doseStudied` and `approvalDate` excluded, `coverage.py:12-16`) and the loader's field list
        (`liftTopLevelFields`, which is what Gate 1b's count uses). The bar of 8 of 15 is restated
        as the share it is, 8/15, and applied to the corrected denominator.

Gate 1b The per-tier thresholds derived in `scripts/revamp/derive_threshold.py` and the sets they
        produce, tested against positional 0.20 and lexical 0.353.

Gate 2  The set that would now be indexed — Tier 1 and Tier 2 at or above their thresholds; Tier 3
        carries `noindex` and is in no sitemap, so its threshold is a promotion criterion, not an
        indexing one — measured from the same page text on both bases Gate 2 used: size-matched
        folds of 324 (`scripts/corpus-20k/gate2/folds.py`) and every pair scored exactly. Gate 2's
        HTML-level checks — crawl text-to-HTML, RSC payload share, empty elements, filler phrases,
        `data-block` order, and the browser journey at 320 px — read rendered HTML from a running
        deployment and are re-run in Phase 7, not here.

    python scripts/revamp/reevaluate_gates.py

No network access.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/revamp"))
sys.path.insert(0, str(ROOT / "scripts/corpus-20k/overlap"))

from derive_threshold import (  # noqa: E402
    APPLICABILITY,
    LEXICAL_LINE,
    POSITIONAL_LINE,
    census_path,
    classify_page,
    field_entries,
    read_assignment,
    read_census,
    read_pages_text,
    read_records,
    read_registry,
    pending_source_fields,
    score_all_pairs,
    tier_of,
)
from gate1b_v3 import fold_membership  # noqa: E402
from harness import (  # noqa: E402
    DEFAULT_SEED,
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    make_hash_seeds,
)

THRESHOLDS = ROOT / "data/revamp/thresholds.json"
COVERAGE_SUMMARY = ROOT / "data/corpus-20k/fields/coverage-summary.json"
GATE2_SUMMARY = ROOT / "data/corpus-20k/gate2/summary-v2.json"
THRESHOLD_V4 = ROOT / "data/corpus-20k/gate1b/threshold-v4.json"
OUT = ROOT / "data/revamp/gates-reevaluated.json"
WORK = ROOT / "data/revamp/overlap"

GATE1_BAR_FIELDS = 8
GATE1_BAR_OF = 15
GATE2_FOLD_SIZE = 324
LIFTED = {"doseStudied", "approvalDate"}


def lower_median(values: list[int]) -> int:
    """coverage.py:69-71 — the upper element on even counts, no interpolation."""
    s = sorted(values)
    return s[len(s) // 2] if s else 0


def size_matched(name: str, keys: list[str], pages: dict, tiers: dict, fold_size: int) -> dict:
    WORK.mkdir(parents=True, exist_ok=True)
    pages_file = WORK / f"pages-g2-{name}.ndjson"
    with pages_file.open("w", encoding="utf-8") as handle:
        for key in keys:
            handle.write(
                json.dumps({"key": key, "tier": f"tier{tiers[key]}", "text": pages[key]["text"]},
                           ensure_ascii=False) + "\n"
            )
    source = SourceIndex.build(pages_file, None)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    store = PageStore(WORK / f"work-g2-{name}.duckdb", cache_pages=max(2000, len(keys) + 16))
    try:
        build_store(source, store, seeds)
        n = store.size
        if n <= fold_size:
            folds, owners = [list(range(n))], [list(range(n))]
        else:
            folds, owners, _order = fold_membership(n, fold_size, seed=DEFAULT_SEED)
        positional: list[float] = []
        lexical: list[float] = []
        share = store.shared_word_share()
        shares: list[float] = []
        for fold, owned in zip(folds, owners):
            result = exhaustive_neighbours(store, fold)
            own = set(owned)
            for index in fold:
                if index in own:
                    positional.append(float(result.positional[index]))
                    lexical.append(float(result.lexical[index]))
                    shares.append(float(share[index]))
        out = {
            "pages": n,
            "foldSize": fold_size,
            "folds": [len(f) for f in folds],
            "positional": distribution(np.array(positional)),
            "lexical": distribution(np.array(lexical)),
            "sharedWordShareMedian": round(float(np.median(np.array(shares))), 6),
        }
    finally:
        store.close()
        (WORK / f"work-g2-{name}.duckdb").unlink(missing_ok=True)
    pages_file.unlink(missing_ok=True)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()

    spec = json.loads(APPLICABILITY.read_text(encoding="utf-8"))
    census = read_census(census_path(None))
    pending, _notes = pending_source_fields(spec, census)
    assignment = read_assignment()
    registry = read_registry()
    thresholds = json.loads(THRESHOLDS.read_text(encoding="utf-8"))
    coverage = json.loads(COVERAGE_SUMMARY.read_text(encoding="utf-8"))
    gate2_recorded = json.loads(GATE2_SUMMARY.read_text(encoding="utf-8"))
    v4 = json.loads(THRESHOLD_V4.read_text(encoding="utf-8"))

    coverage_fields = set(coverage["models"]["LONGEVITY"]["stateByField"].keys())

    # ---- Gate 1 -------------------------------------------------------------------------------
    present_15: list[int] = []
    applicable_15: list[int] = []
    share_15: list[float] = []
    present_all: list[int] = []
    applicable_all: list[int] = []
    share_all: list[float] = []
    raw_present_15: list[int] = []
    for record in read_records():
        meta = assignment.get(record["key"])
        if meta is None or meta["model"] != "LONGEVITY":
            continue
        entries = field_entries(record)
        reg = registry.get(record["key"], {"studies": 0, "stopped": 0})
        app15, pres15, *_ = classify_page(entries, meta, reg, pending, restrict=coverage_fields)
        appall, presall, *_ = classify_page(entries, meta, reg, pending)
        present_15.append(len(pres15))
        applicable_15.append(len(app15))
        share_15.append(len(pres15) / len(app15) if app15 else 0.0)
        present_all.append(len(presall))
        applicable_all.append(len(appall))
        share_all.append(len(presall) / len(appall) if appall else 0.0)
        raw_present_15.append(
            sum(1 for n, e in entries.items() if n in coverage_fields and e.get("state") == "present")
        )

    bar_share = GATE1_BAR_FIELDS / GATE1_BAR_OF
    median_applicable_15 = lower_median(applicable_15)
    corrected_median_15 = lower_median(present_15)
    corrected_median_share_15 = float(np.median(np.array(share_15)))
    equivalent_bar_15 = bar_share * median_applicable_15
    gate1 = {
        "figure": "Tier 1 LONGEVITY median present fields, counted over applicable fields",
        "codePath": "scripts/corpus-20k/fields/coverage.py:main() lines 286-291; median at 69-71",
        "recorded": {
            "value": coverage["gate1"]["value"],
            "threshold": coverage["gate1"]["threshold"],
            "meets": coverage["gate1"]["meets"],
            "basis": "median present out of 15 named fields, applicability ignored",
        },
        "pages": len(present_15),
        "coverageFifteenFieldBasis": {
            "fields": sorted(coverage_fields),
            "medianPresentRaw": lower_median(raw_present_15),
            "medianApplicable": median_applicable_15,
            "medianPresentOverApplicable": corrected_median_15,
            "medianCoverageShare": round(corrected_median_share_15, 6),
            "equivalentBarAsAShare": round(bar_share, 6),
            "equivalentBarInFields": round(equivalent_bar_15, 4),
            "meets": corrected_median_share_15 >= bar_share,
        },
        "loaderFieldListBasis": {
            "note": "the field list the loader counts, liftTopLevelFields included — the same list "
                    "Gate 1b's threshold is measured on",
            "medianApplicable": lower_median(applicable_all),
            "medianPresentOverApplicable": lower_median(present_all),
            "medianCoverageShare": round(float(np.median(np.array(share_all))), 6),
            "meets": float(np.median(np.array(share_all))) >= bar_share,
        },
        "delta": {
            "medianPresent": corrected_median_15 - coverage["gate1"]["value"],
            "statement": f"recorded median {coverage['gate1']['value']} of 15 against a bar of "
                         f"{GATE1_BAR_FIELDS}; corrected median {corrected_median_15} of "
                         f"{median_applicable_15} applicable, a share of "
                         f"{corrected_median_share_15:.4f} against the same bar restated as "
                         f"{bar_share:.4f}",
        },
    }
    gate1["result"] = "PASSED" if gate1["coverageFifteenFieldBasis"]["meets"] else "FAILED"

    # ---- Gate 1b ------------------------------------------------------------------------------
    gate1b = {
        "figure": "per-tier present-over-applicable threshold and the set it produces",
        "codePath": "scripts/corpus-20k/overlap/gate1b_v3.py:analyse_matched lines 236-268",
        "recorded": {
            "threshold": 11,
            "indexed": 636,
            "note": "11 is gate1b_v3's answer on the v3 render, kept as the deploy procedure's "
                    "fallback after threshold 7 missed the size-matched line by 0.002454; the same "
                    "rule on the v4 render selected 10 with 1,057 indexed "
                    "(data/corpus-20k/gate1b/threshold-v4.json)",
            "v4RuleAnswer": v4["threshold"],
            "v4Indexed": v4["indexed"],
        },
        "lines": {"positional": POSITIONAL_LINE, "lexical": LEXICAL_LINE},
        "tiers": {},
    }
    for tier in (1, 2, 3):
        e = thresholds["tiers"][f"tier{tier}"]
        gate1b["tiers"][f"tier{tier}"] = {
            "threshold": e["threshold"],
            "indexable": e["indexable"],
            "positionalSizeMatched": e["positionalSizeMatched"],
            "positionalAllPairs": e["positionalAllPairs"],
            "lexicalSizeMatched": e["lexicalSizeMatched"],
            "lexicalAllPairs": e["lexicalAllPairs"],
            "ruleAnswerAfterStubFloor": e["ruleAnswerAfterStubFloor"],
            "lineCheckSteps": e["lineCheckSteps"],
            "clearsPositional": e["clearsPositional"],
            "clearsLexical": e["clearsLexical"],
            "result": "PASSED" if (e["clearsPositional"] and e["clearsLexical"]) else "FAILED",
        }
    indexed_tiers = [gate1b["tiers"][f"tier{t}"] for t in (1, 2)]
    gate1b["result"] = (
        "PASSED" if all(t["result"] == "PASSED" for t in indexed_tiers) else "FAILED"
    )
    gate1b["resultNote"] = (
        "Tier 3 carries noindex and appears in no sitemap (Operating rule 7), so its threshold is a "
        "promotion criterion and its line result does not decide this gate; it is recorded above."
    )

    # ---- Gate 2 -------------------------------------------------------------------------------
    presence = {}
    for line in (ROOT / "data/revamp/presence-applicable.ndjson").open(encoding="utf-8"):
        if line.strip():
            row = json.loads(line)
            presence[row["key"]] = row
    pages = read_pages_text()
    tiers = {k: r["tier"] for k, r in presence.items()}

    indexed_keys: list[str] = []
    per_tier_counts = {}
    for tier in (1, 2):
        thr = thresholds["tiers"][f"tier{tier}"]["threshold"]
        keys = sorted(k for k, r in presence.items() if r["tier"] == tier and thr is not None and r["present"] >= thr)
        per_tier_counts[f"tier{tier}"] = len(keys)
        indexed_keys.extend(keys)
    indexed_keys.sort()

    sm = size_matched("indexed", indexed_keys, pages, tiers, GATE2_FOLD_SIZE)
    ap = score_all_pairs("gate2-indexed", indexed_keys, pages, tiers, args.refresh)

    recorded_t11 = gate2_recorded["threshold11"]
    gate2 = {
        "figure": "the indexed set measured from the same page text",
        "codePath": "scripts/corpus-20k/gate2/folds.py (size-matched, fold size 324) and "
                    "scripts/corpus-20k/overlap/harness.py:exhaustive_neighbours (all pairs)",
        "set": {
            "definition": "Tier 1 and Tier 2 pages at or above their tier threshold; Tier 3 is "
                          "noindex and is not in the indexed set",
            "pages": len(indexed_keys),
            "byTier": per_tier_counts,
        },
        "sizeMatched": sm,
        "allPairs": {
            "pages": ap["pages"],
            "pairsScored": ap["pairsScored"],
            "positional": ap["positional"],
            "lexical": ap["lexical"],
            "sharedWordShareMedian": ap["sharedWordShareMedian"],
            "positionalAbove_0_20": ap["positionalAbove_0_20"],
        },
        "recorded": {
            "sizeMatchedPositionalMedian": recorded_t11["sizeMatchedCumulative"]["positionalMedian"],
            "allPairsPositionalMedian": recorded_t11["allPairs"]["positionalMedian"],
            "sizeMatchedLexicalMedian": recorded_t11["sizeMatchedCumulative"]["lexicalMedian"],
            "allPairsLexicalMedian": recorded_t11["allPairs"]["lexicalMedian"],
            "sharedWordShareMedian": recorded_t11["sharedWordShare"]["withMarkup"]["median"],
            "indexedCount": gate2_recorded["thresholdDecision"]["indexedCount"],
        },
        "htmlLevelChecks": "crawl text-to-HTML, RSC payload share, empty elements, the filler-phrase "
                           "scan, data-block order and the 320 px browser journey read rendered HTML "
                           "from a running deployment; they are re-run in Phase 7, not here",
    }
    gate2["delta"] = {
        "sizeMatchedPositionalMedian": round(
            sm["positional"]["median"] - gate2["recorded"]["sizeMatchedPositionalMedian"], 6
        ),
        "allPairsPositionalMedian": round(
            ap["positional"]["median"] - gate2["recorded"]["allPairsPositionalMedian"], 6
        ),
        "sizeMatchedLexicalMedian": round(
            sm["lexical"]["median"] - gate2["recorded"]["sizeMatchedLexicalMedian"], 6
        ),
        "indexedCount": len(indexed_keys) - gate2["recorded"]["indexedCount"],
        "sharedWordShareMedian": round(
            sm["sharedWordShareMedian"] - gate2["recorded"]["sharedWordShareMedian"], 6
        ),
    }
    gate2["result"] = (
        "PASSED"
        if sm["positional"]["median"] <= POSITIONAL_LINE
        and ap["positional"]["median"] <= POSITIONAL_LINE
        and sm["lexical"]["median"] <= LEXICAL_LINE
        else "FAILED"
    )

    payload = {
        "generated": "scripts/revamp/reevaluate_gates.py",
        "thresholds": "data/revamp/thresholds.json",
        "gate1": gate1,
        "gate1b": gate1b,
        "gate2": gate2,
    }
    OUT.write_text(json.dumps(payload, indent=1) + "\n", encoding="utf-8")

    print(f"Gate 1  {gate1['result']}: {gate1['delta']['statement']}")
    for tier in (1, 2, 3):
        t = gate1b["tiers"][f"tier{tier}"]
        print(
            f"Gate 1b tier {tier} {t['result']}: threshold {t['threshold']} "
            f"(bucket rule answered {t['ruleAnswerAfterStubFloor']}) -> {t['indexable']} pages, "
            f"positional {t['positionalAllPairs']} all pairs, lexical {t['lexicalSizeMatched']} "
            "size-matched"
        )
    print(
        f"Gate 2  {gate2['result']}: {len(indexed_keys)} indexed "
        f"(recorded {gate2['recorded']['indexedCount']}), size-matched positional "
        f"{sm['positional']['median']} (recorded {gate2['recorded']['sizeMatchedPositionalMedian']}), "
        f"all pairs {ap['positional']['median']} (recorded {gate2['recorded']['allPairsPositionalMedian']}), "
        f"lexical {sm['lexical']['median']} (recorded {gate2['recorded']['sizeMatchedLexicalMedian']}), "
        f"shared-word share {sm['sharedWordShareMedian']}"
    )
    print(f"json={os.path.relpath(OUT, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
