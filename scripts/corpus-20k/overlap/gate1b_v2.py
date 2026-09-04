#!/usr/bin/env python
"""Gate 1b re-measure (Phase 2c): rebuild the harness inputs from the re-rendered page text and
reproduce every Phase 2b MEASURE figure on the same definitions, sets and seeds.

Stages (run in order):

    build   read data/corpus-20k/render/text/batch-*.ndjson + questions/, write the harness inputs
            under data/corpus-20k/render/v2/ and the page metadata under data/corpus-20k/gate1b/
    folds   the size-matched basis: a seeded permutation of the indexed set cut into 803-page
            folds, each scored exhaustively; per-page rows, present-field buckets, the threshold
    shared  shared 5-grams with the size-matched nearest neighbour, attributed to their line

Reconstructed from the committed v1 artefacts, which the v1 driver was not committed alongside:
the fold order is ``default_rng(20260904).permutation(n)`` over the sorted indexed key list, folds
are consecutive 803-page chunks, the short last fold is padded back to 803 with
``rng.choice(<pages already in complete folds>, need, replace=False)`` drawn from the same
generator and only its own members are kept; the 803 and 324 draws are
``rng.choice(n, 803)`` then ``rng.choice(n, 324)`` from one fresh ``default_rng(20260904)``.
All three reconstructions were verified against the v1 files before use.

No network access. Nothing here fetches anything.
"""

from __future__ import annotations

import argparse
import glob
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from harness import (  # noqa: E402
    DEFAULT_SEED,
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    make_hash_seeds,
    normalise_tokens,
    per_page_rows,
    tier_medians,
)

ROOT = Path(__file__).resolve().parents[3]
TEXT_DIR = ROOT / "data/corpus-20k/render/text"
QUESTIONS_DIR = ROOT / "data/corpus-20k/questions"
OUT_PAGES = ROOT / "data/corpus-20k/render/v2"
OUT_GATE = ROOT / "data/corpus-20k/gate1b"
FOLD_SIZE = 803
DRAWS = (803, 324)


# ------------------------------------------------------------------------------------------
# build


def load_question_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for path in sorted(QUESTIONS_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                counts[row["key"]] = len(row.get("questions") or [])
    return counts


def load_pages() -> list[dict]:
    pages: list[dict] = []
    for path in sorted(TEXT_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    pages.append(json.loads(line))
    return pages


def write_ndjson(path: Path, rows) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            n += 1
    return n


def stage_build() -> dict:
    questions = load_question_counts()
    pages = load_pages()
    missing = [p["key"] for p in pages if p["key"] not in questions]
    meta = {
        p["key"]: {
            "tier": p["tier"],
            "presentFields": p["presentFields"],
            "wordCount": p["wordCount"],
            "proseWordCount": p["proseWordCount"],
            "questions": questions.get(p["key"], 0),
        }
        for p in pages
    }
    by_key = {p["key"]: p for p in pages}

    indexed = sorted(
        k for k, m in meta.items() if m["tier"] in (1, 2) and m["questions"] >= 1
    )
    written = {}
    written["pages-all"] = write_ndjson(
        OUT_PAGES / "pages-all.ndjson",
        ({"key": p["key"], "tier": f"tier{p['tier']}", "text": p["text"]} for p in pages),
    )
    written["pages-indexed"] = write_ndjson(
        OUT_PAGES / "pages-indexed.ndjson",
        (
            {"key": k, "tier": f"tier{meta[k]['tier']}", "text": by_key[k]["text"]}
            for k in indexed
        ),
    )
    written["pages-indexed-prose"] = write_ndjson(
        OUT_PAGES / "pages-indexed-prose.ndjson",
        (
            {"key": k, "tier": f"tier{meta[k]['tier']}", "text": by_key[k]["proseText"]}
            for k in indexed
        ),
    )
    rng = np.random.default_rng(DEFAULT_SEED)
    draws = {}
    for size in DRAWS:
        picked = sorted(rng.choice(len(indexed), size=size, replace=False).tolist())
        keys = [indexed[i] for i in picked]
        draws[size] = keys
        written[f"pages-indexed-{size}"] = write_ndjson(
            OUT_PAGES / f"pages-indexed-{size}.ndjson",
            (
                {"key": k, "tier": f"tier{meta[k]['tier']}", "text": by_key[k]["text"]}
                for k in keys
            ),
        )

    (OUT_GATE / "indexed-keys-v2.txt").write_text("\n".join(indexed) + "\n", encoding="utf-8")
    (OUT_GATE / "page-meta-v2.json").write_text(json.dumps(meta), encoding="utf-8")

    summary = {
        "pages": len(pages),
        "questionRows": len(questions),
        "pagesWithoutQuestionRow": len(missing),
        "byTier": {
            str(t): sum(1 for m in meta.values() if m["tier"] == t) for t in (1, 2, 3)
        },
        "withQuestions": sum(1 for m in meta.values() if m["questions"] >= 1),
        "indexedCandidates": len(indexed),
        "indexedByTier": {
            str(t): sum(1 for k in indexed if meta[k]["tier"] == t) for t in (1, 2)
        },
        "noQuestionByTier": {
            str(t): sum(
                1 for m in meta.values() if m["tier"] == t and m["questions"] == 0
            )
            for t in (1, 2)
        },
        "written": written,
        "draws": {str(s): len(v) for s, v in draws.items()},
    }
    print(json.dumps(summary, indent=2))
    return summary


# ------------------------------------------------------------------------------------------
# folds — the size-matched basis


def fold_membership(n: int, fold_size: int, seed: int = DEFAULT_SEED):
    """Return (folds, owners): each fold is a list of indices into the sorted indexed list;
    owners[i] is the sub-list of that fold whose scores are kept."""
    rng = np.random.default_rng(seed)
    order = rng.permutation(n).tolist()
    complete = (n // fold_size) * fold_size
    folds, owners = [], []
    for start in range(0, complete, fold_size):
        block = order[start : start + fold_size]
        folds.append(block)
        owners.append(list(block))
    tail = order[complete:]
    if tail:
        need = fold_size - len(tail)
        pad = rng.choice(complete, size=need, replace=False).tolist()
        folds.append(list(tail) + [order[i] for i in pad])
        owners.append(list(tail))
    return folds, owners, order


def stage_buckets() -> dict:
    rows = json.loads((OUT_GATE / "matched-per-page-v2.json").read_text(encoding="utf-8"))
    return analyse_matched(rows, folds=None, owners=None)


def stage_folds() -> dict:
    pages_file = OUT_PAGES / "pages-indexed.ndjson"
    source = SourceIndex.build(pages_file, None)
    n = len(source.offsets)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    folds, owners, _order = fold_membership(n, FOLD_SIZE)

    work = OUT_GATE / "work-v2"
    work.mkdir(parents=True, exist_ok=True)
    rows: dict[str, dict] = {}
    for f, (fold, own) in enumerate(zip(folds, owners)):
        store = PageStore(work / f"fold-{f}.duckdb", cache_pages=1000)
        try:
            build_store(source, store, seeds, indices=fold)
            result = exhaustive_neighbours(store)
            share = store.shared_word_share()
            keep = {source.keys[i] for i in own}
            for row in per_page_rows(store, result, share):
                if row["key"] in keep:
                    rows[row["key"]] = row
        finally:
            store.close()
            (work / f"fold-{f}.duckdb").unlink(missing_ok=True)
        print(f"fold {f}: {len(fold)} pages, {len(own)} kept, running total {len(rows)}", flush=True)

    assert len(rows) == n, (len(rows), n)
    (OUT_GATE / "matched-per-page-v2.json").write_text(json.dumps(rows), encoding="utf-8")
    return analyse_matched(rows, folds, owners)


def analyse_matched(rows: dict[str, dict], folds, owners) -> dict:
    n = len(rows)
    meta = json.loads((OUT_GATE / "page-meta-v2.json").read_text(encoding="utf-8"))
    pos = np.array([rows[k]["positional"] for k in rows])
    lex = np.array([rows[k]["lexical"] for k in rows])
    share = np.array([rows[k]["sharedWordShare"] for k in rows])

    fields = {k: meta[k]["presentFields"] for k in rows}
    buckets: dict[str, dict] = {}
    counts = sorted(set(fields.values()))
    for c in counts:
        members = [k for k in rows if fields[k] == c]
        cum = [k for k in rows if fields[k] >= c]
        bp = np.array([rows[k]["positional"] for k in members])
        bl = np.array([rows[k]["lexical"] for k in members])
        cp = np.array([rows[k]["positional"] for k in cum])
        cl = np.array([rows[k]["lexical"] for k in cum])
        buckets[str(c)] = {
            "n": len(members),
            "posMed": float(np.median(bp)),
            "posP90": float(np.percentile(bp, 90)),
            "lexMed": float(np.median(bl)),
            "cumN": len(cum),
            "cumPosMed": float(np.median(cp)),
            "cumLexMed": float(np.median(cl)),
        }

    threshold = None
    for c in counts:
        b = buckets[str(c)]
        if b["posMed"] <= 0.20 and b["cumPosMed"] <= 0.20:
            threshold = c
            break
    indexed_keys = [k for k in rows if fields[k] >= threshold] if threshold is not None else []
    below = [k for k in rows if fields[k] < threshold] if threshold is not None else list(rows)
    thr = {
        "threshold": threshold,
        "indexed": len(indexed_keys),
        "belowByTier": {
            str(t): sum(1 for k in below if meta[k]["tier"] == t) for t in (1, 2)
        },
        "aboveByTier": {
            str(t): sum(1 for k in indexed_keys if meta[k]["tier"] == t) for t in (1, 2)
        },
        "boundaryBucketPositionalMedian": buckets[str(threshold)]["posMed"] if threshold is not None else None,
        "cumulativePositionalMedian": buckets[str(threshold)]["cumPosMed"] if threshold is not None else None,
        "cumulativeLexicalMedian": buckets[str(threshold)]["cumLexMed"] if threshold is not None else None,
        "rule": "smallest present-field count whose own bucket median positional <= 0.20 and whose "
                "cumulative set (pages at or above it) also keeps median <= 0.20",
        "cumulativeOnlyThreshold": next(
            (c for c in counts if buckets[str(c)]["cumPosMed"] <= 0.20), None
        ),
    }
    (OUT_GATE / "buckets-matched-v2.json").write_text(json.dumps(buckets, indent=1), encoding="utf-8")
    (OUT_GATE / "threshold-v2.json").write_text(json.dumps(thr, indent=1), encoding="utf-8")

    pooled = {
        "pages": n,
        "positional": distribution(pos),
        "lexical": distribution(lex),
        "sharedWordShareMedian": round(float(np.median(share)), 6),
        "lexicalAbove_0_40": int((lex > 0.40).sum()),
        "foldSizes": None if folds is None else [len(f) for f in folds],
        "keptPerFold": None if owners is None else [len(o) for o in owners],
    }
    (OUT_GATE / "matched-pooled-v2.json").write_text(json.dumps(pooled, indent=1), encoding="utf-8")
    print(json.dumps({"pooled": pooled, "threshold": thr}, indent=2))
    return {"pooled": pooled, "threshold": thr, "buckets": buckets}


# ------------------------------------------------------------------------------------------
# shared 5-gram attribution


def line_grams(text: str):
    """Return (grams, spanning) where grams maps a 5-gram tuple to True if it lies inside one
    line. A gram seen both inside a line and spanning one counts as inside."""
    lines = text.split("\n")
    tokens: list[str] = []
    line_of: list[int] = []
    for i, line in enumerate(lines):
        for tok in normalise_tokens(line):
            tokens.append(tok)
            line_of.append(i)
    inside: dict[tuple, int] = {}
    spanning: set[tuple] = set()
    for i in range(len(tokens) - 4):
        gram = tuple(tokens[i : i + 5])
        if line_of[i] == line_of[i + 4]:
            inside.setdefault(gram, line_of[i])
        else:
            spanning.add(gram)
    return inside, spanning, lines


def stage_shared() -> dict:
    rows = json.loads((OUT_GATE / "matched-per-page-v2.json").read_text(encoding="utf-8"))
    meta = json.loads((OUT_GATE / "page-meta-v2.json").read_text(encoding="utf-8"))
    texts: dict[str, tuple[str, str]] = {}
    with (OUT_PAGES / "pages-indexed.ndjson").open(encoding="utf-8") as handle:
        for line in handle:
            r = json.loads(line)
            texts[r["key"]] = r["text"]
    prose: dict[str, str] = {}
    with (OUT_PAGES / "pages-indexed-prose.ndjson").open(encoding="utf-8") as handle:
        for line in handle:
            r = json.loads(line)
            prose[r["key"]] = r["text"]

    out = {}
    for target in (0.20, 0.30):
        markup, prose_share, spanning_share, keys = [], [], [], []
        for key, row in rows.items():
            if row["positional"] <= target:
                continue
            partner = row["positionalPartner"]
            if partner is None or partner not in texts:
                continue
            a_inside, a_span, _ = line_grams(texts[key])
            b_inside, b_span, _ = line_grams(texts[partner])
            a_all = set(a_inside) | a_span
            b_all = set(b_inside) | b_span
            shared = a_all & b_all
            if not shared:
                continue
            prose_lines = set(prose.get(key, "").split("\n"))
            a_lines = texts[key].split("\n")
            m = p = s = 0
            for gram in shared:
                if gram in a_inside:
                    line = a_lines[a_inside[gram]]
                    if line in prose_lines:
                        p += 1
                    else:
                        m += 1
                else:
                    s += 1
            total = m + p + s
            markup.append(m / total)
            prose_share.append(p / total)
            spanning_share.append(s / total)
            keys.append(key)
        fields = [meta[k]["presentFields"] for k in keys]
        words = [meta[k]["wordCount"] for k in keys]
        out[f"above_{str(target).replace('.', '_')}"] = {
            "pages": len(keys),
            "markupLinesMean": round(float(np.mean(markup)), 4) if markup else None,
            "proseLinesMean": round(float(np.mean(prose_share)), 4) if prose_share else None,
            "spanningLineBreaksMean": round(float(np.mean(spanning_share)), 4) if spanning_share else None,
            "medianPresentFields": int(np.median(fields)) if fields else None,
            "medianWordCount": int(np.median(words)) if words else None,
        }
    allk = list(rows)
    out["indexedSet"] = {
        "pages": len(allk),
        "medianPresentFields": int(np.median([meta[k]["presentFields"] for k in allk])),
        "medianWordCount": int(np.median([meta[k]["wordCount"] for k in allk])),
    }
    (OUT_GATE / "shared-content-v2.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    print(json.dumps(out, indent=2))
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("stage", choices=["build", "folds", "buckets", "shared"])
    args = parser.parse_args()
    {
        "build": stage_build,
        "folds": stage_folds,
        "buckets": stage_buckets,
        "shared": stage_shared,
    }[args.stage]()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
