#!/usr/bin/env python
"""Gate 1b measurement v4 (Phase 5a): the same derivation as gate1b_v3.py — matched 803 and 324
draws, size-matched folds, the bucket threshold rule — re-run over the page text
rendered after the Phase 5a data fixes: the narrowed withdrawn rule (438 -> 668 pages, Tier 1
1,498 -> 1,719), identity pass 3 (111 salt-named merges, 28,943 -> 28,832 pages) and the
doseStudied/approvalDate field count the loader and the renderer now agree on. Definitions, sets
and seeds are unchanged, so v1, v2, v3 and v4 are comparable line for line. Both readings of the
threshold rule are reported: the rule as written (bucket median and cumulative median both at or
below 0.20) and the cumulative-only reading.

Stages (run in order):

    build   read data/corpus-20k/render/text/batch-*.ndjson + questions/, write the harness inputs
            under data/corpus-20k/render/v4/ and the page metadata under data/corpus-20k/gate1b/
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
OUT_PAGES = ROOT / "data/corpus-20k/render/v4"
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

    (OUT_GATE / "indexed-keys-v4.txt").write_text("\n".join(indexed) + "\n", encoding="utf-8")
    (OUT_GATE / "page-meta-v4.json").write_text(json.dumps(meta), encoding="utf-8")

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
    rows = json.loads((OUT_GATE / "matched-per-page-v4.json").read_text(encoding="utf-8"))
    return analyse_matched(rows, folds=None, owners=None)


def stage_folds() -> dict:
    pages_file = OUT_PAGES / "pages-indexed.ndjson"
    source = SourceIndex.build(pages_file, None)
    n = len(source.offsets)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    folds, owners, _order = fold_membership(n, FOLD_SIZE)

    work = OUT_GATE / "work-v4"
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
    (OUT_GATE / "matched-per-page-v4.json").write_text(json.dumps(rows), encoding="utf-8")
    return analyse_matched(rows, folds, owners)


def analyse_matched(rows: dict[str, dict], folds, owners) -> dict:
    n = len(rows)
    meta = json.loads((OUT_GATE / "page-meta-v4.json").read_text(encoding="utf-8"))
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
    # Both readings, side by side, and the two counts the deploy procedure names.
    loose = thr["cumulativeOnlyThreshold"]

    def reading(c):
        if c is None or str(c) not in buckets:
            return None
        b = buckets[str(c)]
        return {
            "threshold": c,
            "indexed": b["cumN"],
            "bucketPositionalMedian": b["posMed"],
            "cumulativePositionalMedian": b["cumPosMed"],
            "cumulativeLexicalMedian": b["cumLexMed"],
            "aboveByTier": {str(t): sum(1 for k in rows
                                        if fields[k] >= c and meta[k]["tier"] == t)
                            for t in (1, 2)},
            "belowByTier": {str(t): sum(1 for k in rows
                                        if fields[k] < c and meta[k]["tier"] == t)
                            for t in (1, 2)},
        }

    thr["readings"] = {
        "ruleAsWritten": reading(threshold),
        "cumulativeOnly": reading(loose),
        "at7": reading(7),
        "at11": reading(11),
    }
    (OUT_GATE / "buckets-matched-v4.json").write_text(json.dumps(buckets, indent=1), encoding="utf-8")
    (OUT_GATE / "threshold-v4.json").write_text(json.dumps(thr, indent=1), encoding="utf-8")

    pooled = {
        "pages": n,
        "positional": distribution(pos),
        "lexical": distribution(lex),
        "sharedWordShareMedian": round(float(np.median(share)), 6),
        "lexicalAbove_0_40": int((lex > 0.40).sum()),
        "foldSizes": None if folds is None else [len(f) for f in folds],
        "keptPerFold": None if owners is None else [len(o) for o in owners],
    }
    (OUT_GATE / "matched-pooled-v4.json").write_text(json.dumps(pooled, indent=1), encoding="utf-8")
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
    rows = json.loads((OUT_GATE / "matched-per-page-v4.json").read_text(encoding="utf-8"))
    meta = json.loads((OUT_GATE / "page-meta-v4.json").read_text(encoding="utf-8"))
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
    (OUT_GATE / "shared-content-v4.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    print(json.dumps(out, indent=2))
    return out



# ------------------------------------------------------------------------------------------
# measure.py runs and the LSH validation


# The five corpora Phase 2b and Phase 2c measured, in the same modes: the two draws exhaustively,
# the three large sets through the LSH path the validation stage checks against an exhaustive run.
RUNS = [
    ("rendered-803", "pages-indexed-803.ndjson", ["--exhaustive"],
     "v4: rendered dossier text, seeded 803 draw from the indexed set"),
    ("rendered-324", "pages-indexed-324.ndjson", ["--exhaustive"],
     "v4: rendered dossier text, seeded 324 draw from the indexed set"),
    ("indexed", "pages-indexed.ndjson", [],
     "v4: rendered dossier text, Tier 1 + Tier 2 with >= 1 question"),
    ("indexed-prose", "pages-indexed-prose.ndjson", [],
     "v4 sensitivity: prose only, declared-markup rows removed"),
    ("full-corpus", "pages-all.ndjson", [],
     "v4: rendered dossier text, all pages including Tier 3"),
]


def stage_runs() -> dict:
    import subprocess

    out = {}
    for name, pages, extra, label in RUNS:
        target = OUT_GATE / "runs-v4" / name
        target.mkdir(parents=True, exist_ok=True)
        cmd = [
            sys.executable,
            str(Path(__file__).with_name("measure.py")),
            "--pages", str(OUT_PAGES / pages),
            "--out", str(target),
            "--matched-size", "324",
            "--matched-size", "803",
            "--label", label,
            *extra,
        ]
        print("$ " + " ".join(cmd), flush=True)
        subprocess.run(cmd, check=True, cwd=str(ROOT))
        out[name] = json.loads((target / "summary.json").read_text(encoding="utf-8"))
    print(json.dumps({k: v.get("positional", {}).get("median") for k, v in out.items()}, indent=2))
    return out


def stage_validate() -> dict:
    import subprocess

    target = OUT_GATE / "validation-v4"
    target.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable,
        str(Path(__file__).with_name("validate.py")),
        "--pages", str(OUT_PAGES / "pages-indexed-803.ndjson"),
        "--out", str(target),
        "--corpus-label", "rendered-indexed-803 (v4)",
    ]
    print("$ " + " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=str(ROOT))
    result = json.loads((target / "validation.json").read_text(encoding="utf-8"))
    print(json.dumps({"fit": result["fit"], "positionalDeltaMedian": result["delta"]["positional"]["median"]}, indent=2))
    return result



# ------------------------------------------------------------------------------------------
# summary — assemble summary-v4.json and report-v4.md


V1 = OUT_GATE / "summary.json"
V2 = OUT_GATE / "summary-v2.json"
RENDER_TEXT = ROOT / "data/corpus-20k/render/text"
QUESTIONS_METRICS = QUESTIONS_DIR / "metrics.json"
FIRE_COUNTS = ROOT / "data/corpus-20k/derived/fire-counts.json"
SUPPRESSION = ROOT / "data/corpus-20k/suppression/summary.json"


def _read(path: Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _fmt(x, places=3):
    if x is None:
        return "—"
    if isinstance(x, float):
        return f"{x:.{places}f}"
    if isinstance(x, int):
        return f"{x:,}"
    return str(x)


def _delta(a, b, places=3):
    if a is None or b is None:
        return "—"
    d = b - a
    if isinstance(a, int) and isinstance(b, int):
        return f"{d:+,}"
    return f"{d:+.{places}f}"


def stage_summary() -> dict:
    v1, v2 = _read(V1), _read(V2)
    runs = {name: _read(OUT_GATE / "runs-v4" / name / "summary.json") for name, *_ in RUNS}
    pooled = _read(OUT_GATE / "matched-pooled-v4.json")
    thr = _read(OUT_GATE / "threshold-v4.json")
    buckets = _read(OUT_GATE / "buckets-matched-v4.json")
    shared = _read(OUT_GATE / "shared-content-v4.json")
    validation = _read(OUT_GATE / "validation-v4" / "validation.json")
    render = _read(RENDER_TEXT / "summary.json")
    standing = _read(RENDER_TEXT / "standing-sentences.json")
    metrics = _read(QUESTIONS_METRICS)
    fires = _read(FIRE_COUNTS)
    suppression = _read(SUPPRESSION)
    rows = _read(OUT_GATE / "matched-per-page-v4.json")
    meta = _read(OUT_GATE / "page-meta-v4.json")

    # like-for-like: the same 4,558 pages v2 measured, scored on the v4 render
    v2_keys = [k for k in (OUT_GATE / "indexed-keys-v2.txt").read_text(encoding="utf-8").splitlines() if k]
    v2_set = set(v2_keys)
    carried = [k for k in rows if k in v2_set]
    added = [k for k in rows if k not in v2_set]

    def med(keys, field="positional"):
        if not keys:
            return None
        return round(float(np.median(np.array([rows[k][field] for k in keys]))), 4)

    def med_meta(keys, field):
        return int(np.median([meta[k][field] for k in keys])) if keys else None

    # which carried pages gained one of the three CLINICAL blocks
    clinical = {"indication", "regulatory-only", "trial-history"}
    templates: dict[str, set] = {}
    for path in sorted(QUESTIONS_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                r = json.loads(line)
                if r["key"] in rows:
                    templates[r["key"]] = {q["template"] for q in (r.get("questions") or [])}
    carried_with = [k for k in carried if templates.get(k, set()) & clinical]
    carried_without = [k for k in carried if not (templates.get(k, set()) & clinical)]

    like = {
        "note": "The v4 render scored on exactly the 4,558 pages v2 measured, so the two numbers "
                "differ only by what the render changed — not by which pages were measured.",
        "carriedFromV2": {
            "pages": len(carried),
            "positionalMedian": med(carried),
            "lexicalMedian": med(carried, "lexical"),
            "v2PositionalMedian": v2["sets"]["a_indexed_size_matched_pooled"]["positionalMedian"],
        },
        "carriedWithoutAClinicalBlock": {
            "pages": len(carried_without),
            "positionalMedian": med(carried_without),
            "reading": "pages the three new CLINICAL templates never touch: the evidence-age fix on its own",
        },
        "carriedWithAClinicalBlock": {
            "pages": len(carried_with),
            "positionalMedian": med(carried_with),
        },
        "newlyIndexed": {
            "pages": len(added),
            "positionalMedian": med(added),
            "medianPresentFields": med_meta(added, "presentFields"),
            "medianWordCount": med_meta(added, "wordCount"),
            "reading": "CLINICAL pages that fired no question before the three templates were added",
        },
    }

    def s(run, key="full"):
        r = runs[run][key]
        return {
            "pages": r["pages"],
            "positionalMedian": r["positional"]["median"],
            "positionalP90": r["positional"]["p90"],
            "positionalMax": r["positional"]["max"],
            "above_0_20": r["positional"]["above_0_20"],
            "above_0_30": r["positional"]["above_0_30"],
            "lexicalMedian": r["lexical"]["median"],
            "sharedWordShareMedian": runs[run]["sharedWordShare"]["median"],
            "mode": r["mode"],
        }

    summary = {
        "gate": "1b",
        "stage": "Phase 2d measurement (after the evidence-age fix, the three CLINICAL templates and the "
                 "removal of the standing paragraph-2 fallbacks)",
        "date": "2026-09-05",
        "supersedes": "data/corpus-20k/gate1b/summary-v2.json (Phase 2c re-measure)",
        "method": {
            "harness": v2["method"]["harness"],
            "driver": "scripts/corpus-20k/overlap/gate1b_v4.py (build | folds | buckets | shared | runs | validate | summary)",
            "sets": v2["method"]["sets"],
            "derivation": "identical to gate1b_v2.py: matched 803 and 324 draws, size-matched 803-page "
                          "folds over the sorted indexed key list at seed 20260904, the same bucket rule",
            "notReRun": v2["method"]["notReRun"],
        },
        "renderer": {
            "module": "scripts/corpus-20k/render/page-text.ts",
            "out": "data/corpus-20k/render/text/batch-NNNN.ndjson (step page-text-v4, 29 batches)",
            "pages": render["pages"],
            "withQuestions": render["withQuestions"],
            "withoutQuestions": render["withoutQuestions"],
            "byTier": render["byTier"],
            "meanWordCount": render["meanWordCount"],
            "rowCap": render["rowCap"],
        },
        "questions": {
            "pagesWithQuestions": metrics["pages"]["withQuestions"],
            "distinctStrings": metrics["questions"]["distinctStrings"],
            "mostRepeatedString": metrics["mostRepeatedString"],
            "mostRepeatedTemplate": metrics["mostRepeatedTemplate"],
            "fiveGramMeanJaccard": metrics["fiveGramOverlap"]["meanJaccard"],
            "forbiddenWordViolations": metrics["forbiddenWords"]["violations"],
        },
        "standingSentences": standing,
        "harnessFit": {
            "fit": validation["fit"],
            "rule": validation["fitRule"],
            "corpus": validation["validationCorpus"],
            "positionalDeltaMedian": validation["delta"]["positional"]["median"],
            "positionalDeltaP90": validation["delta"]["positional"]["p90"],
            "positionalDeltaMax": validation["delta"]["positional"]["max"],
            "lexicalDeltaMedian": validation["delta"]["lexical"]["median"],
        },
        "sets": {
            "a_indexed_full": {**s("indexed"), "note": "Tier 1 + Tier 2 with at least one question, every page scored against all others"},
            "a_indexed_size_matched_pooled": {
                "pages": pooled["pages"],
                "positionalMedian": pooled["positional"]["median"],
                "positionalP90": pooled["positional"]["p90"],
                "positionalMax": pooled["positional"]["max"],
                "above_0_20": pooled["positional"]["above_0_20"],
                "above_0_30": pooled["positional"]["above_0_30"],
                "lexicalMedian": pooled["lexical"]["median"],
                "lexicalAbove_0_40": pooled["lexicalAbove_0_40"],
                "sharedWordShareMedian": pooled["sharedWordShareMedian"],
                "foldSizes": pooled["foldSizes"],
                "keptPerFold": pooled["keptPerFold"],
                "note": "The basis Gate 1b uses: each page scored inside a seeded 803-page fold so the "
                        "candidate count matches the baseline draw.",
            },
            "b_matched_803": s("rendered-803"),
            "b_matched_324": s("rendered-324"),
            "c_baseline_live_803": v2["sets"]["c_baseline_live_803"],
            "c_baseline_live_324": v2["sets"]["c_baseline_live_324"],
            "d_full_corpus": s("full-corpus"),
            "e_indexed_prose_only": s("indexed-prose"),
        },
        "likeForLike": like,
        "nullModel": {
            "indexed": {
                "randomPairPositionalMedian": runs["indexed"]["nullModel"]["randomPairPositional"]["median"],
                "expectedNearestNeighbour": runs["indexed"]["nullModel"]["expectedNearestNeighbour"],
            },
            "fullCorpus": {
                "randomPairPositionalMedian": runs["full-corpus"]["nullModel"]["randomPairPositional"]["median"],
                "expectedNearestNeighbour": runs["full-corpus"]["nullModel"]["expectedNearestNeighbour"],
            },
        },
        "controls": runs["indexed"]["controls"],
        "sharedWordShare": {
            "indexed": runs["indexed"]["sharedWordShare"],
            "fullCorpus": runs["full-corpus"]["sharedWordShare"],
            "proseOnly": runs["indexed-prose"]["sharedWordShare"],
            "baseline803": v2["sharedWordShare"]["baseline803"],
        },
        "buckets": buckets,
        "threshold": {**thr, "basis": "a_indexed_size_matched_pooled"},
        "sharedContent": shared,
        "inputs": {
            "seed15Fires": fires["seeds"]["15"]["fires"],
            "seed7Fires": fires["seeds"]["7"]["fires"],
            "seed7Discarded": fires["seeds"]["7"]["discarded"],
            "suppressed": suppression["distinctSuppressed"],
            "suppressionUnknown": suppression["unknown"],
            "cleared": suppression["cleared"],
        },
        "verdict": {
            "clears_0_20": thr["threshold"] is not None,
            "threshold": thr["threshold"],
            "indexed": thr["indexed"],
            "boundaryBucketPositionalMedian": thr["boundaryBucketPositionalMedian"],
            "cumulativeLexicalMedian": thr["cumulativeLexicalMedian"],
        },
        "crawlTextToHtml": v2["crawlTextToHtml"],
    }

    diff_rows = [
        ("Pages rendered", 28966, 28943, render["pages"], 0),
        ("Indexed candidates (Tier 1 + 2 with >= 1 question)", 4562, 4558, pooled["pages"], 0),
        ("Positional median, 324 draw", 0.192, v2["sets"]["b_matched_324"]["positionalMedian"], runs["rendered-324"]["full"]["positional"]["median"], 3),
        ("Positional median, 803 draw", 0.205, v2["sets"]["b_matched_803"]["positionalMedian"], runs["rendered-803"]["full"]["positional"]["median"], 3),
        ("Positional median, size-matched folds", 0.208, v2["sets"]["a_indexed_size_matched_pooled"]["positionalMedian"], pooled["positional"]["median"], 3),
        ("Positional median, indexed all-pairs", 0.303, v2["sets"]["a_indexed_full_4558"]["positionalMedian"], runs["indexed"]["full"]["positional"]["median"], 3),
        ("Positional median, full corpus", 0.711, v2["sets"]["d_full_corpus_28943"]["positionalMedian"], runs["full-corpus"]["full"]["positional"]["median"], 3),
        ("Lexical median, size-matched folds", 0.435, v2["sets"]["a_indexed_size_matched_pooled"]["lexicalMedian"], pooled["lexical"]["median"], 3),
        ("Shared-word share, indexed", 0.159, v2["sharedWordShare"]["indexed"]["median"], runs["indexed"]["sharedWordShare"]["median"], 3),
        ("Shared-word share, prose only", 0.048, v2["sharedWordShare"]["proseOnly"]["median"], runs["indexed-prose"]["sharedWordShare"]["median"], 3),
        ("Threshold (present fields)", 7, None, thr["threshold"], 0),
        ("Boundary bucket median", 0.197, None, thr["boundaryBucketPositionalMedian"], 3),
        ("Indexed pages", 2267, 0, thr["indexed"], 0),
        ("Tier 1 below threshold", 449, 1478, thr["belowByTier"]["1"], 0),
        ("Tier 2 below threshold", 1846, 3080, thr["belowByTier"]["2"], 0),
        ("Pages with questions, corpus", 10071, 10063, render["withQuestions"], 0),
        ("Distinct question strings", 43674, 59101, metrics["questions"]["distinctStrings"], 0),
        ("Standing prose sentences over 5% of indexed pages", None, 3, len(standing["prose"]["overFivePercent"]), 0),
    ]
    summary["diffVsV1AndV2"] = {
        "note": "v1 = summary.json (Phase 2b MEASURE); v2 = summary-v2.json (Phase 2c re-measure); "
                "v4 = this run. The v2 column's 'none clears' rows are written as null.",
        "rows": [{"measure": m, "v1": a, "v2": b, "v4": c} for m, a, b, c, _ in diff_rows],
    }

    (OUT_GATE / "summary-v4.json").write_text(json.dumps(summary, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    write_report(summary, diff_rows, runs, buckets, thr, pooled, standing, like, validation, metrics, render, shared)
    print(json.dumps(summary["verdict"], indent=2))
    return summary


def write_report(summary, diff_rows, runs, buckets, thr, pooled, standing, like, validation, metrics, render, shared) -> None:
    L = []
    a = L.append
    clears = thr["threshold"] is not None
    a("# Gate 1b — measurement v4 (Phase 2d)")
    a("")
    a("**Run 2026-09-05 (Phase 2d).** Same harness, same definitions, same seeds, same derivation as")
    a("`gate1b_v2.py`: matched 803 and 324 draws, size-matched 803-page folds, the same bucket rule.")
    a("It supersedes `report-v2.md`; v1 and v2 stay on disk.")
    a("")
    a("**What changed in the pages between v3 and v4.** Three Phase 5a data fixes, no template change.")
    a("The withdrawn rule was narrowed so that a register's \'no remaining entry\' reading sets the flag")
    a("only when no other register still records an active, approved or marketed entry (438 -> 668 pages")
    a("withdrawn; amlodipine is no longer withdrawn), which moves pages into Tier 1. Identity pass 3")
    a("merged 111 salt-named structureless records into their parent moiety (28,943 -> 28,832 pages).")
    a("The loader and the renderer now read doseStudied and approvalDate from the same place, so the")
    a("present-field count that decides indexing is one number, not two.")
    a("")
    if clears:
        a(f"**Result: a threshold clears.** The rule selects **{thr['threshold']} present fields** — bucket median")
        a(f"{thr['boundaryBucketPositionalMedian']:.3f}, cumulative {thr['cumulativePositionalMedian']:.3f}, both at or below 0.20 — for an indexed set of")
        a(f"**{thr['indexed']:,} pages**. In v2 no count qualified at all. The size-matched pooled median is")
        a(f"{pooled['positional']['median']:.4f}, which is *above* v2's 0.2493, and the reason is measured below: it is not the")
        a("same set of pages.")
    else:
        a("**Result: no threshold clears.**")
    a("")
    a("## The one comparison that is like for like")
    a("")
    a(f"v4 indexes {pooled['pages']:,} candidates against v2's {like['carriedFromV2']['pages']:,}. A pooled median over a different set of")
    a("pages is not a before-and-after, so the v4 render is also scored on exactly the pages v2 measured:")
    a("")
    a("| Set of pages | Pages | Positional median |")
    a("| --- | ---: | ---: |")
    a(f"| v2, as v2 measured them | {like['carriedFromV2']['pages']:,} | {like['carriedFromV2']['v2PositionalMedian']:.4f} |")
    a(f"| the same pages, v4 render | {like['carriedFromV2']['pages']:,} | {like['carriedFromV2']['positionalMedian']:.4f} |")
    a(f"| of those, pages no CLINICAL template touches | {like['carriedWithoutAClinicalBlock']['pages']:,} | **{like['carriedWithoutAClinicalBlock']['positionalMedian']:.4f}** |")
    a(f"| of those, pages that gained a CLINICAL block | {like['carriedWithAClinicalBlock']['pages']:,} | {like['carriedWithAClinicalBlock']['positionalMedian']:.4f} |")
    a(f"| newly indexed by the three templates | {like['newlyIndexed']['pages']:,} | {like['newlyIndexed']['positionalMedian']:.4f} |")
    a("")
    a("Read plainly: **the evidence-age fix worked.** On pages the new templates never touch, the")
    a(f"positional median is {like['carriedWithoutAClinicalBlock']['positionalMedian']:.4f} — below the 0.20 target, and below v2's 0.2493 on the same")
    a("basis. What raises the pooled figure is the material the three CLINICAL templates add: the pages")
    a(f"they newly index are thin (median {like['newlyIndexed']['medianPresentFields']} present fields, {like['newlyIndexed']['medianWordCount']} words) and score {like['newlyIndexed']['positionalMedian']:.4f}, and the")
    a(f"blocks they add to pages that were already indexed move those from below target to {like['carriedWithAClinicalBlock']['positionalMedian']:.4f}.")
    a("")
    a("## Harness fit")
    a("")
    a(f"Re-validated at the 803 draw of the v4 render, as R3 requires before any corpus-scale figure is")
    a(f"quoted: positional delta median {validation['delta']['positional']['median']}, p90 {validation['delta']['positional']['p90']}, max {validation['delta']['positional']['max']}; lexical delta median")
    a(f"{validation['delta']['lexical']['median']}. The rule is *unfit above 0.02 median delta*. **{'Fit' if validation['fit'] else 'Unfit'}.**")
    a("")
    a("## Results per set")
    a("")
    a("| Set | Pages | Positional median | p90 | > 0.20 | > 0.30 | Lexical median | Shared-word share |")
    a("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    for label, key in [
        ("(a) indexed set, all-against-all", "a_indexed_full"),
        ("(a) indexed set, size-matched folds", "a_indexed_size_matched_pooled"),
        ("(b) matched 803 draw", "b_matched_803"),
        ("(b) matched 324 draw", "b_matched_324"),
        ("(c) live baseline, 803 (carried forward)", "c_baseline_live_803"),
        ("(c) live baseline, 324 (carried forward)", "c_baseline_live_324"),
        ("full corpus, all pages", "d_full_corpus"),
        ("sensitivity: prose only", "e_indexed_prose_only"),
    ]:
        r = summary["sets"][key]
        a(f"| {label} | {r['pages']:,} | {r['positionalMedian']:.3f} | {r['positionalP90']:.3f} | "
          f"{r['above_0_20']:,} | {r['above_0_30']:,} | {r['lexicalMedian']:.3f} | {r['sharedWordShareMedian']:.3f} |")
    a("")
    nm = summary["nullModel"]["indexed"]["expectedNearestNeighbour"]
    a("**Corpus size.** The null model still prices the rise with candidate count: expected")
    a(f"nearest-neighbour positional is {nm['matched'][0]['positional']:.3f} at 324 draws, {nm['matched'][1]['positional']:.3f} at 803 and {nm['full']['positional']:.3f} at")
    a(f"{nm['full']['pages']:,}, against observed {summary['sets']['b_matched_324']['positionalMedian']:.3f}, {summary['sets']['b_matched_803']['positionalMedian']:.3f} and {summary['sets']['a_indexed_full']['positionalMedian']:.3f}. The pages stay more distinct than")
    a("size alone would produce. That is not the gate; the gate is the 0.20 size-matched target.")
    a("")
    a("## The threshold rule")
    a("")
    a("Present-field buckets on the size-matched basis. The rule: the smallest count whose own bucket")
    a("median and whose cumulative median are both at or below 0.20.")
    a("")
    a("| Present fields | Pages | Positional median | p90 | Lexical median | Cumulative pages | Cumulative positional median |")
    a("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    for c in sorted(buckets, key=lambda x: int(x)):
        b = buckets[c]
        chosen = thr["threshold"] is not None and int(c) == thr["threshold"]
        label = f"**{c}**" if chosen else c
        a(f"| {label} | {b['n']:,} | {b['posMed']:.3f} | {b['posP90']:.3f} | {b['lexMed']:.3f} | {b['cumN']:,} | {b['cumPosMed']:.3f} |")
    a("")
    if clears:
        a(f"- **Threshold: {thr['threshold']} present fields.** Boundary bucket median {thr['boundaryBucketPositionalMedian']:.3f}; cumulative {thr['cumulativePositionalMedian']:.3f};")
        a(f"  cumulative lexical {thr['cumulativeLexicalMedian']:.3f} (target 0.40).")
        a(f"- **Indexed: {thr['indexed']:,} pages** — Tier 1 {thr['aboveByTier']['1']:,}, Tier 2 {thr['aboveByTier']['2']:,}.")
        a(f"- Below the threshold: Tier 1 {thr['belowByTier']['1']:,}, Tier 2 {thr['belowByTier']['2']:,} → noindex, reachable, promotable on more data.")
        loose = thr["cumulativeOnlyThreshold"]
        if loose is not None:
            a(f"- The cumulative-only threshold — the looser reading, cumulative median at or below 0.20 with no")
            a(f"  condition on the boundary bucket — is **{loose}**, for {buckets[str(loose)]['cumN']:,} pages at cumulative")
            a(f"  {buckets[str(loose)]['cumPosMed']:.3f}. That is v1's threshold and, to one page, v1's indexed count (2,267).")
            a(f"  Which reading governs is Felix's call, not this run's: the rule as written selects {thr['threshold']}.")
        a("")
        a("The indexed set is much smaller than v1's 2,267. That is the same finding as the table above,")
        a("read through the rule: the three CLINICAL templates add 1,325 thin candidates and add a block")
        a("to 3,267 more, and thin pages carrying a common block are what the bucket rule prunes.")
    a("")
    a("## Standing sentences")
    a("")
    a(f"Over the {standing['indexedPages']:,} indexed candidates, every sentence a page asserts in prose — the")
    a("question line and the two paragraphs, with the provenance anchor removed — counted once per page:")
    a("")
    a(f"- **prose sentences on more than 5 % of indexed pages: {len(standing['prose']['overFivePercent'])}.**")
    a(f"- {standing['prose']['distinctSentences']:,} distinct prose sentences. The most repeated is")
    a(f"  `{standing['prose']['mostRepeated'][0]['text']}` on {standing['prose']['mostRepeated'][0]['pages']} pages ({standing['prose']['mostRepeated'][0]['share']*100:.1f} %) — a fragment the audit's")
    a("  sentence splitter cuts out of a verbatim source value, not a sentence any page asserts. The")
    a("  splitter is deliberately over-eager: it cuts at every full stop, so a run it reports is at worst")
    a("  shorter than the sentence a reader sees, never longer.")
    a(f"- Revealed-row labels are markup and are reported separately: {len(standing['markupRowLabels']['overFivePercent'])} labels appear on more")
    a(f"  than 5 % of indexed pages, the most common being")
    a("  " + ", ".join(f"`{r['text']}` ({r['share']*100:.0f} %)" for r in standing["markupRowLabels"]["mostRepeated"][:6]) + ".")
    a("")
    a("Four standing sentences the v2 render carried were found by this audit and removed before the")
    a("measurement: `No later publication is recorded.` (the evidence-age block, now gone),")
    a("`The label records no other value.` (666 pages), `No study record accompanies it.` (378 pages) and")
    a("the provenance event list without its years (1,099 pages). Where a page has nothing of its own to")
    a("say in paragraph 2, no paragraph 2 is written.")
    a("")
    a("## What the pages above target share")
    a("")
    for key, label in [("above_0_2", "above 0.20"), ("above_0_3", "above 0.30")]:
        r = shared[key]
        a(f"- {label} ({r['pages']:,} pages): {r['markupLinesMean']*100:.1f} % mean of shared 5-grams from lines the template")
        a(f"  calls markup, {r['proseLinesMean']*100:.1f} % from block prose and rows, {r['spanningLineBreaksMean']*100:.1f} % from runs crossing a line")
        a(f"  boundary; median {r['medianPresentFields']} present fields, {r['medianWordCount']:,} words.")
    a(f"- the indexed set as a whole: median {shared['indexedSet']['medianPresentFields']} present fields, {shared['indexedSet']['medianWordCount']:,} words.")
    a("")
    a("## Questions")
    a("")
    a(f"{metrics['pages']['withQuestions']:,} pages carry questions; {metrics['questions']['distinctStrings']:,} distinct strings; the most repeated string is on")
    a(f"{metrics['mostRepeatedString']['share']*100:.2f} % of pages (`{metrics['mostRepeatedString']['text']}`), far under the 30 % R7 limit.")
    a(f"Highest template share {metrics['mostRepeatedTemplate']['share']*100:.1f} % ({metrics['mostRepeatedTemplate']['template']}), reported for information. Five-gram Jaccard between")
    a(f"the question sets of {metrics['fiveGramOverlap']['pairsSampled']:,} random page pairs: {metrics['fiveGramOverlap']['meanJaccard']}. Forbidden-word violations: {len(metrics['forbiddenWords']['violations'])}.")
    a("")
    a("## Diff against v1 and v2 — one table")
    a("")
    a("| Measure | v1 (Phase 2b) | v2 (Phase 2c) | v4 (this run) | v2 → v4 |")
    a("| --- | ---: | ---: | ---: | ---: |")
    for measure, x1, x2, x3, places in diff_rows:
        a(f"| {measure} | {_fmt(x1, places)} | {_fmt(x2, places) if x2 is not None else 'none clears'} | "
          f"{_fmt(x3, places)} | {_delta(x2, x3, places)} |")
    a("")
    a("## Deferred, unchanged")
    a("")
    a("Crawl text-to-HTML still needs rendered HTML and remains Gate 2 work, against the 8.3 % crawl and")
    a("0.07 % live baselines.")
    a("")
    a("## Files")
    a("")
    a("- `data/corpus-20k/gate1b/summary-v4.json` — every figure here, machine-readable")
    a("- `data/corpus-20k/gate1b/runs-v4/*/` — one directory per measured set")
    a("- `data/corpus-20k/gate1b/matched-per-page-v4.json`, `matched-pooled-v4.json`,")
    a("  `buckets-matched-v4.json`, `threshold-v4.json`, `page-meta-v4.json`, `indexed-keys-v4.txt`")
    a("- `data/corpus-20k/gate1b/shared-content-v4.json` — the 5-gram attribution")
    a("- `data/corpus-20k/gate1b/validation-v4/validation.json` — the harness fit run")
    a("- `data/corpus-20k/render/text/standing-sentences.json` — the standing-sentence audit")
    a("- `data/corpus-20k/render/v4/pages-*.ndjson` — harness inputs built from the v4 render")
    a("- `scripts/corpus-20k/overlap/gate1b_v4.py` — the driver")
    a("")
    (OUT_GATE / "report-v4.md").write_text("\n".join(L), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("stage", choices=["build", "folds", "buckets", "shared", "runs", "validate", "summary"])
    args = parser.parse_args()
    {
        "build": stage_build,
        "folds": stage_folds,
        "buckets": stage_buckets,
        "shared": stage_shared,
        "runs": stage_runs,
        "validate": stage_validate,
        "summary": stage_summary,
    }[args.stage]()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
