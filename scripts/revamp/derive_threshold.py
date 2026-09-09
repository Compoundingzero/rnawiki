#!/usr/bin/env python3
"""Phase 1.3 — re-derive the indexing threshold per tier over *applicable* fields.

Two halves, both idempotent: every run recomputes from the corpus files and the current
census, so a Phase 2 run that fills a field changes the answer with no manual step.

Half 1 — applicability
    For every page: the field entries its record carries, each classified applicable or
    not-applicable by, in order,

      1. the recorded state — a field already stored `not-applicable` with its rule
         (NA-LABEL-CLASS, NA-COMBINATION, the no-ChEMBL rule) stays not-applicable;
      2. `pending_source` in data/revamp/field-applicability.json — the field leaves the
         denominator while the CURRENT census shows it under 1 % present in every tier, and
         re-enters automatically the moment the census shows it filled;
      3. the structural predicates of the same JSON, each read from recorded page facts:
            itp          only when the page is in the NIA ITP legend
            withdrawal   only when the page is withdrawn
            approvalDate only when the model is CLINICAL or the page is approved in a register
            whyStopped   only when a matched registry study is stopped
            sponsor      only when a matched registry study exists
      4. otherwise applicable.

    The numerator is present AND applicable. A field a structural rule removes leaves both
    numerator and denominator; the count of present fields so removed is reported, never hidden.

    Writes data/revamp/presence-applicable.ndjson and data/revamp/field-census-applicable.csv.

Half 2 — the threshold, per tier
    The measurement basis is `scripts/corpus-20k/overlap/gate1b_v3.py`'s fold machinery and the
    existing page text under data/corpus-20k/render/text/*.ndjson, unchanged: a seeded
    permutation of the sorted key list cut into 803-page folds, each fold scored exhaustively,
    every page keeping the score it earned in its own fold. That is the size-matched basis.

    The population is Gate 1b's own — pages carrying at least one derived question — with its
    tier restriction lifted, because a threshold is now derived for Tier 3 too. Bucketing then
    happens inside each tier. Cutting the folds per tier instead was measured and rejected: it
    packs each fold with same-model pages and lifts every median (Tier 1's best cumulative
    bucket 0.2340, Tier 2's 0.2667, against the 0.1739 the pooled Gate 1b v4 run recorded), so
    reading the 0.20 line against per-tier folds would change the measurement while claiming to
    keep the rule. The per-tier and whole-corpus bases are measured and recorded beside the
    primary one; neither selects.

    The selection rule is gate1b_v3.analyse_matched's, verbatim: the smallest present-field
    count whose own bucket median positional <= 0.20 and whose cumulative set (pages at or
    above it) also keeps median <= 0.20. Only the definition of the count changes — present
    over applicable instead of present out of the model's whole field list.

    One guard is added, and it can only raise a threshold: a count below R15's stub floor of 3
    (`materialise.ts` pageTypeOf: a Tier 3 page under 3 present fields is a stub) is not
    eligible to be selected. Because present <= applicable, every page in an eligible bucket
    holds at least 3 applicable fields, so a 1-of-1 page can never be read as fully covered.
    The unguarded answer is recorded beside the guarded one.

    The selected count is then tested on the set it produces, all-pairs — every pair scored
    exactly, which depends on no fold construction — against positional 0.20 and lexical 0.353.
    If either line is exceeded the threshold rises by the smallest whole step that clears both,
    and the step is recorded. Where the bucket rule selects nothing in a tier, the search starts
    at the stub floor and rises by the same steps, which is recorded as such.

No network access. Nothing here fetches anything.
"""

from __future__ import annotations

import argparse
import csv
import glob
import hashlib
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/corpus-20k/overlap"))

from gate1b_v3 import fold_membership  # noqa: E402
from harness import (  # noqa: E402
    DEFAULT_SEED,
    PageStore,
    SourceIndex,
    build_store,
    distribution,
    exhaustive_neighbours,
    make_hash_seeds,
    per_page_rows,
)

FIELDS_DIR = ROOT / "data/corpus-20k/fields"
# §15(3): the v2 tier map (a DailyMed SPL with no application number is not a register
# approval, so the page is not CLINICAL).
ASSIGNMENT = ROOT / "data/revamp/tiers/model-assignment-v2.ndjson"
REGISTRY_AGG = ROOT / "data/corpus-20k/registry/aggregates"
TEXT_DIR = ROOT / "data/corpus-20k/render/text"
QUESTIONS_DIR = ROOT / "data/corpus-20k/questions"
APPLICABILITY = ROOT / "data/revamp/field-applicability.json"
CENSUS_AFTER = ROOT / "data/revamp/field-census-after.csv"
CENSUS_BEFORE = ROOT / "data/revamp/field-census-before.csv"
OUT_DIR = ROOT / "data/revamp"
WORK_DIR = OUT_DIR / "overlap"
FINAL_SUMMARY = ROOT / "data/corpus-20k/final/summary.json"

MODEL_DIRS = ("longevity", "clinical", "development")
TIERS = (1, 2, 3)
FOLD_SIZE = 803
POSITIONAL_LINE = 0.20
LEXICAL_LINE = 0.353
STUB_FLOOR = 3  # R15 / materialise.ts pageTypeOf: a Tier 3 page under 3 present fields is a stub
APPROVAL_REASON_CODES = {"chembl-approval", "drugsfda", "orange-book", "ema", "health-canada"}
PRIMARY_BASIS = "candidates"
SET_FOLD_SIZE = 324  # scripts/corpus-20k/gate2/folds.py default; the basis 0.353 was measured on
R3_LEXICAL_TARGET = 0.40


# ----------------------------------------------------------------------------------------------
# inputs


def tier_of(model: str, withdrawn: bool) -> int | None:
    if model == "LONGEVITY" or withdrawn:
        return 1
    if model == "CLINICAL":
        return 2
    if model == "DEVELOPMENT":
        return 3
    return None


def read_assignment(path: Path = ASSIGNMENT) -> dict[str, dict]:
    out: dict[str, dict] = {}
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            out[row["key"]] = {
                "model": row.get("model", ""),
                "withdrawn": bool(row.get("withdrawn")),
                "displayName": row.get("displayName") or row["key"],
                "reasons": {r["code"] for r in (row.get("reasons") or [])},
            }
    return out


def read_registry() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path in sorted(REGISTRY_AGG.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                out[row["key"]] = {
                    "studies": int(row.get("studies") or 0),
                    "stopped": len(row.get("stopped") or []),
                }
    return out


def field_entries(record: dict) -> dict[str, dict]:
    """Every field entry on one page: the nested `fields` map plus the loader's lifted top-level
    entries (`liftTopLevelFields`, materialise.ts:535-550). A field the record does not carry is
    not a field of that page."""
    out: dict[str, dict] = {}
    for name, entry in (record.get("fields") or {}).items():
        if isinstance(entry, dict) and "state" in entry:
            out[name] = entry
    for name, entry in record.items():
        if name == "fields":
            continue
        if isinstance(entry, dict) and "state" in entry:
            out.setdefault(name, entry)
    return out


def read_records(fields_dir: Path = FIELDS_DIR):
    for model_dir in MODEL_DIRS:
        for path in sorted((fields_dir / model_dir).glob("batch-*.ndjson")):
            with path.open(encoding="utf-8") as handle:
                for line in handle:
                    if line.strip():
                        yield json.loads(line)


def read_census(path: Path) -> dict[str, dict]:
    rows: dict[str, dict] = {}
    with path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            rows[row["field"]] = row
    return rows


def census_path(explicit: str | None) -> Path:
    if explicit:
        return Path(explicit)
    return CENSUS_AFTER if CENSUS_AFTER.exists() else CENSUS_BEFORE


def read_pages_text(text_dir: Path = TEXT_DIR) -> dict[str, dict]:
    pages: dict[str, dict] = {}
    for path in sorted(text_dir.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    row = json.loads(line)
                    pages[row["key"]] = row
    return pages


def read_question_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for path in sorted(QUESTIONS_DIR.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    row = json.loads(line)
                    counts[row["key"]] = len(row.get("questions") or [])
    return counts


# ----------------------------------------------------------------------------------------------
# half 1 — applicability


def pending_source_fields(spec: dict, census: dict[str, dict]) -> tuple[set[str], dict[str, str]]:
    """A declared pending_source field stays out of the denominator only while the CURRENT census
    shows it under 1 % present in every tier it appears in. It re-enters automatically."""
    out: set[str] = set()
    notes: dict[str, str] = {}
    for name in spec.get("pending_source", []):
        row = census.get(name)
        if row is None:
            out.add(name)
            notes[name] = "declared pending_source; the current census carries no row for it"
            continue
        pcts = []
        for tier in TIERS:
            if int(row[f"tier{tier}_pages"]) > 0:
                pcts.append(float(row[f"tier{tier}_present_pct"]))
        if pcts and max(pcts) >= 1.0:
            notes[name] = (
                f"re-entered the denominator: the current census shows {max(pcts):.4f} % present "
                "in at least one tier"
            )
        else:
            out.add(name)
            best = f"{max(pcts):.4f}" if pcts else "0"
            notes[name] = f"pending_source: highest tier presence in the current census is {best} %"
    return out, notes


def classify_page(entries: dict[str, dict], meta: dict, reg: dict, pending: set[str],
                  restrict: set[str] | None = None):
    """Return (applicable, present, structural_na, recorded_na, pending_na, dropped_present) as
    sets of field names for one page. `restrict` limits the field list — used to reproduce
    coverage.py's fifteen-field Gate 1 basis, which excludes the loader's lifted entries."""
    withdrawal = entries.get("withdrawal")
    withdrawal_value = (withdrawal or {}).get("value")
    page_withdrawn = bool(meta["withdrawn"]) or (
        isinstance(withdrawal_value, dict) and withdrawal_value.get("withdrawn") is True
    )
    structural = {
        "itp": "nia-itp" in meta["reasons"] or entries.get("itp", {}).get("state") == "present",
        "withdrawal": page_withdrawn,
        "approvalDate": (
            meta["model"] == "CLINICAL"
            or bool(meta["reasons"] & APPROVAL_REASON_CODES)
            or entries.get("approvalDate", {}).get("state") == "present"
        ),
        "whyStopped": reg["stopped"] > 0 or entries.get("whyStopped", {}).get("state") == "present",
        "sponsor": reg["studies"] > 0 or entries.get("sponsor", {}).get("state") == "present",
    }
    applicable: set[str] = set()
    present: set[str] = set()
    structural_na: set[str] = set()
    recorded_na: set[str] = set()
    pending_na: set[str] = set()
    dropped: set[str] = set()
    for name, entry in entries.items():
        if restrict is not None and name not in restrict:
            continue
        state = entry.get("state")
        if state == "not-applicable":
            recorded_na.add(name)
            continue
        if name in pending:
            pending_na.add(name)
            if state == "present":
                dropped.add(name)
            continue
        if name in structural and not structural[name]:
            structural_na.add(name)
            if state == "present":
                dropped.add(name)
            continue
        applicable.add(name)
        if state == "present":
            present.add(name)
    return applicable, present, structural_na, recorded_na, pending_na, dropped


def build_presence(spec: dict, census: dict[str, dict], fields_dir: Path = FIELDS_DIR,
                   assignment_path: Path = ASSIGNMENT):
    assignment = read_assignment(assignment_path)
    registry = read_registry()
    pending, pending_notes = pending_source_fields(spec, census)

    rows: list[dict] = []
    # census[field][tier] -> {carried, applicable, present, present_applicable, recorded_na,
    #                         structural_na, present_dropped}
    tally: dict[str, dict[int, dict[str, int]]] = defaultdict(
        lambda: {t: defaultdict(int) for t in TIERS}
    )
    field_order: list[str] = []
    seen: set[str] = set()
    dropped_present: dict[str, int] = defaultdict(int)
    unassigned = 0

    for record in read_records(fields_dir):
        key = record["key"]
        meta = assignment.get(key)
        if meta is None:
            unassigned += 1
            continue
        tier = tier_of(meta["model"], meta["withdrawn"])
        if tier is None:
            unassigned += 1
            continue
        entries = field_entries(record)
        reg = registry.get(key, {"studies": 0, "stopped": 0})
        app, pres, struct_na, rec_na, pend_na, dropped = classify_page(entries, meta, reg, pending)

        for name, entry in sorted(entries.items()):
            if name not in seen:
                seen.add(name)
                field_order.append(name)
            cell = tally[name][tier]
            cell["carried"] += 1
            if entry.get("state") == "present":
                cell["present"] += 1
            if name in rec_na:
                cell["recorded_na"] += 1
            elif name in pend_na:
                cell["pending_na"] += 1
            elif name in struct_na:
                cell["structural_na"] += 1
            else:
                cell["applicable"] += 1
                if name in pres:
                    cell["present_applicable"] += 1
            if name in dropped:
                cell["present_dropped"] += 1
                dropped_present[name] += 1

        applicable = len(app)
        present = len(pres)
        rows.append(
            {
                "key": key,
                "tier": tier,
                "model": meta["model"],
                "applicable": applicable,
                "present": present,
                "share": round(present / applicable, 6) if applicable else 0.0,
            }
        )

    return rows, tally, field_order, dict(dropped_present), pending, pending_notes, unassigned, assignment


def write_presence(rows: list[dict], tag: str = "") -> Path:
    path = OUT_DIR / f"presence-applicable{tag}.ndjson"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in sorted(rows, key=lambda r: r["key"]):
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    return path


def write_applicable_census(tally, field_order, census, tag: str = "") -> Path:
    path = OUT_DIR / f"field-census-applicable{tag}.csv"
    header = ["field"]
    for tier in TIERS:
        header += [
            f"tier{tier}_pages_carrying",
            f"tier{tier}_applicable",
            f"tier{tier}_present",
            f"tier{tier}_present_pct_of_applicable",
            f"tier{tier}_present_pct_before",
            f"tier{tier}_recorded_not_applicable",
            f"tier{tier}_structural_not_applicable",
            f"tier{tier}_pending_source_not_applicable",
            f"tier{tier}_present_dropped_by_rule",
        ]
    header += [
        "total_applicable",
        "total_present",
        "total_present_pct_of_applicable",
        "total_present_pct_before",
    ]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        for name in sorted(field_order):
            row = {"field": name}
            tot_app = tot_pres = 0
            before = census.get(name, {})
            for tier in TIERS:
                cell = tally[name][tier]
                app = cell["applicable"]
                pres = cell["present_applicable"]
                tot_app += app
                tot_pres += pres
                row[f"tier{tier}_pages_carrying"] = cell["carried"]
                row[f"tier{tier}_applicable"] = app
                row[f"tier{tier}_present"] = pres
                row[f"tier{tier}_present_pct_of_applicable"] = (
                    round(100.0 * pres / app, 4) if app else 0.0
                )
                row[f"tier{tier}_present_pct_before"] = float(
                    before.get(f"tier{tier}_present_pct", 0.0) or 0.0
                )
                row[f"tier{tier}_recorded_not_applicable"] = cell["recorded_na"]
                row[f"tier{tier}_structural_not_applicable"] = cell["structural_na"]
                row[f"tier{tier}_pending_source_not_applicable"] = cell["pending_na"]
                row[f"tier{tier}_present_dropped_by_rule"] = cell["present_dropped"]
            row["total_applicable"] = tot_app
            row["total_present"] = tot_pres
            row["total_present_pct_of_applicable"] = (
                round(100.0 * tot_pres / tot_app, 4) if tot_app else 0.0
            )
            row["total_present_pct_before"] = float(before.get("total_present_pct", 0.0) or 0.0)
            writer.writerow(row)
    return path


# ----------------------------------------------------------------------------------------------
# half 2 — overlap measurement


CACHE_PREFIX = ""


def cache_name(name: str) -> str:
    """Cache basename for one scored set. A run over a text directory other than the default
    carries that directory's tag, so two renders can be measured without either invalidating the
    other's cached fold scores."""
    return f"{CACHE_PREFIX}{name}"


def fingerprint(keys: list[str], pages: dict[str, dict]) -> str:
    digest = hashlib.sha256()
    for key in keys:
        digest.update(key.encode("utf-8"))
        digest.update(b"\x00")
        digest.update(pages[key]["text"].encode("utf-8"))
        digest.update(b"\x01")
    return digest.hexdigest()


def write_pages_file(path: Path, keys: list[str], pages: dict[str, dict], tiers: dict[str, int]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for key in keys:
            handle.write(
                json.dumps(
                    {"key": key, "tier": f"tier{tiers[key]}", "text": pages[key]["text"]},
                    ensure_ascii=False,
                )
                + "\n"
            )


def score_size_matched(name: str, keys: list[str], pages, tiers, refresh: bool) -> dict[str, dict]:
    """gate1b_v3's size-matched basis, unchanged: seeded permutation cut into 803-page folds,
    each fold scored exhaustively, each page keeping the score from the fold that owns it."""
    cache = WORK_DIR / f"sm-{cache_name(name)}.json"
    fp = fingerprint(keys, pages)
    if cache.exists() and not refresh:
        held = json.loads(cache.read_text(encoding="utf-8"))
        if held.get("fingerprint") == fp and held.get("foldSize") == FOLD_SIZE:
            return held["rows"]
    pages_file = WORK_DIR / f"pages-{cache_name(name)}.ndjson"
    write_pages_file(pages_file, keys, pages, tiers)
    source = SourceIndex.build(pages_file, None)
    n = len(source.offsets)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    folds, owners, _order = fold_membership(n, FOLD_SIZE)
    rows: dict[str, dict] = {}
    for f, (fold, own) in enumerate(zip(folds, owners)):
        store = PageStore(WORK_DIR / f"work-{cache_name(name)}-{f}.duckdb", cache_pages=1000)
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
            (WORK_DIR / f"work-{cache_name(name)}-{f}.duckdb").unlink(missing_ok=True)
        print(f"  [{name}] fold {f}: {len(fold)} pages, {len(own)} kept, total {len(rows)}", flush=True)
    assert len(rows) == n, (len(rows), n)
    pages_file.unlink(missing_ok=True)
    cache.write_text(
        json.dumps({"fingerprint": fp, "foldSize": FOLD_SIZE, "rows": rows}), encoding="utf-8"
    )
    return rows


def score_all_pairs(name: str, keys: list[str], pages, tiers, refresh: bool) -> dict:
    """Every pair of the set scored exactly."""
    cache = WORK_DIR / f"ap-{cache_name(name)}.json"
    fp = fingerprint(keys, pages)
    if cache.exists() and not refresh:
        held = json.loads(cache.read_text(encoding="utf-8"))
        if held.get("fingerprint") == fp:
            return held["summary"]
    pages_file = WORK_DIR / f"pages-ap-{cache_name(name)}.ndjson"
    write_pages_file(pages_file, keys, pages, tiers)
    source = SourceIndex.build(pages_file, None)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    store = PageStore(WORK_DIR / f"work-ap-{cache_name(name)}.duckdb", cache_pages=max(2000, len(keys) + 16))
    try:
        build_store(source, store, seeds)
        result = exhaustive_neighbours(store)
        share = store.shared_word_share()
        rows = list(per_page_rows(store, result, share))
    finally:
        store.close()
        (WORK_DIR / f"work-ap-{cache_name(name)}.duckdb").unlink(missing_ok=True)
    pages_file.unlink(missing_ok=True)
    pos = np.array([r["positional"] for r in rows])
    lex = np.array([r["lexical"] for r in rows])
    sws = np.array([r["sharedWordShare"] for r in rows])
    summary = {
        "pages": len(rows),
        "pairsScored": int(result.pairs_scored),
        "positional": distribution(pos),
        "lexical": distribution(lex),
        "sharedWordShareMedian": round(float(np.median(sws)), 6),
        "positionalAbove_0_20": int((pos > 0.20).sum()),
        "lexicalAbove_0_40": int((lex > 0.40).sum()),
    }
    cache.write_text(json.dumps({"fingerprint": fp, "summary": summary}), encoding="utf-8")
    return summary


def score_set_size_matched(name: str, keys: list[str], pages, tiers, refresh: bool,
                           fold_size: int = SET_FOLD_SIZE) -> dict:
    """The set re-measured on its own size-matched basis, exactly as Gate 2 measured the
    threshold-7 and threshold-11 sets (`scripts/corpus-20k/gate2/folds.py`, fold size 324, the
    same fold construction and the same exhaustive scorer). This is the basis the recorded
    lexical figure of 0.353 was measured on, so it is the basis the lexical line is read on."""
    cache = WORK_DIR / f"sms-{cache_name(name)}.json"
    fp = fingerprint(keys, pages)
    if cache.exists() and not refresh:
        held = json.loads(cache.read_text(encoding="utf-8"))
        if held.get("fingerprint") == fp and held.get("foldSize") == fold_size:
            return held["summary"]
    pages_file = WORK_DIR / f"pages-sms-{cache_name(name)}.ndjson"
    write_pages_file(pages_file, keys, pages, tiers)
    source = SourceIndex.build(pages_file, None)
    seeds = make_hash_seeds(seed=DEFAULT_SEED)
    store = PageStore(WORK_DIR / f"work-sms-{cache_name(name)}.duckdb", cache_pages=max(2000, len(keys) + 16))
    try:
        build_store(source, store, seeds)
        n = store.size
        if n <= fold_size:
            folds, owners = [list(range(n))], [list(range(n))]
        else:
            folds, owners, _order = fold_membership(n, fold_size, seed=DEFAULT_SEED)
        share = store.shared_word_share()
        positional: list[float] = []
        lexical: list[float] = []
        shares: list[float] = []
        for fold, owned in zip(folds, owners):
            result = exhaustive_neighbours(store, fold)
            own = set(owned)
            for index in fold:
                if index in own:
                    positional.append(float(result.positional[index]))
                    lexical.append(float(result.lexical[index]))
                    shares.append(float(share[index]))
        summary = {
            "pages": n,
            "foldSize": fold_size,
            "folds": [len(f) for f in folds],
            "positional": distribution(np.array(positional)),
            "lexical": distribution(np.array(lexical)),
            "sharedWordShareMedian": round(float(np.median(np.array(shares))), 6),
        }
    finally:
        store.close()
        (WORK_DIR / f"work-sms-{cache_name(name)}.duckdb").unlink(missing_ok=True)
    pages_file.unlink(missing_ok=True)
    cache.write_text(json.dumps({"fingerprint": fp, "foldSize": fold_size, "summary": summary}),
                     encoding="utf-8")
    return summary


def buckets_and_threshold(rows: dict[str, dict], counts_by_key: dict[str, int], floor: int):
    """gate1b_v3.analyse_matched's bucket construction and selection rule, verbatim, over the
    present-over-applicable count. `floor` is the stub floor: a count below it is not eligible."""
    fields = {k: counts_by_key[k] for k in rows}
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
    unguarded = None
    for c in counts:
        b = buckets[str(c)]
        if b["posMed"] <= POSITIONAL_LINE and b["cumPosMed"] <= POSITIONAL_LINE:
            unguarded = c
            break
    guarded = None
    for c in counts:
        if c < floor:
            continue
        b = buckets[str(c)]
        if b["posMed"] <= POSITIONAL_LINE and b["cumPosMed"] <= POSITIONAL_LINE:
            guarded = c
            break
    return buckets, counts, unguarded, guarded


# ----------------------------------------------------------------------------------------------
# driver


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--census", default=None, help="census CSV (default: after if present, else before)")
    parser.add_argument("--refresh", action="store_true", help="recompute cached overlap scores")
    parser.add_argument("--applicability-only", action="store_true")
    parser.add_argument("--fields-dir", default=str(FIELDS_DIR),
                        help="directory of per-model field batches (default: the corpus-20k fields)")
    parser.add_argument("--assignments", default=str(ASSIGNMENT),
                        help="the tier map: one NDJSON row per key with its model and withdrawn "
                             "flag, which tier_of reads to place a page in Tier 1, 2 or 3. The "
                             "default is the v2 map §15(3) produced (a DailyMed SPL with no "
                             "application number is not a register approval). Naming it is how a "
                             "run states which map it measured; the rule that reads it is "
                             "unchanged.")
    parser.add_argument("--text-dir", default=str(TEXT_DIR),
                        help="directory of rendered page-text batches to measure overlap on "
                             "(default: the corpus-20k v4 render). This is the furniture-free "
                             "text and it is the gate figure "
                             "(docs/specs/phase4-generators.md §11). The rule, the fold "
                             "construction, the population and both lines are unchanged; only "
                             "which render the text comes from changes.")
    parser.add_argument("--with-furniture-text-dir", default=None,
                        help="the same pages rendered with their furniture "
                             "(scripts/revamp/page_text_v5.ts --with-furniture). Given both, the "
                             "selected set of each tier is scored a second time on this text and "
                             "the figure is reported beside the gate figure, so the before/after "
                             "comparison is stated on both definitions of the page's text and "
                             "neither is hidden. It never selects a threshold.")
    parser.add_argument("--out", default=str(OUT_DIR / "thresholds.json"),
                        help="thresholds JSON path; the markdown, the presence file and the "
                             "applicable census take the same stem's suffix")
    args = parser.parse_args()

    fields_dir = Path(args.fields_dir)
    assignment_path = Path(args.assignments)
    text_dir = Path(args.text_dir)
    furniture_dir = Path(args.with_furniture_text_dir) if args.with_furniture_text_dir else None
    out_json = Path(args.out)
    stem = out_json.stem
    tag = stem[len("thresholds"):] if stem.startswith("thresholds") else f"-{stem}"

    global CACHE_PREFIX
    if text_dir.resolve() != TEXT_DIR.resolve():
        CACHE_PREFIX = (
            os.path.relpath(text_dir, ROOT).replace("/", "_").replace(".", "_") + "-"
        )

    spec = json.loads(APPLICABILITY.read_text(encoding="utf-8"))
    cpath = census_path(args.census)
    census = read_census(cpath)

    (rows, tally, field_order, dropped_present, pending, pending_notes, unassigned,
     assignment) = build_presence(spec, census, fields_dir, assignment_path)
    presence_path = write_presence(rows, tag)
    census_out = write_applicable_census(tally, field_order, census, tag)
    print(f"pages={len(rows)} unassigned={unassigned} census={os.path.relpath(cpath, ROOT)}")
    print(f"tier map -> {os.path.relpath(assignment_path, ROOT)}")
    print(f"presence -> {os.path.relpath(presence_path, ROOT)}")
    print(f"applicable census -> {os.path.relpath(census_out, ROOT)}")
    if args.applicability_only:
        return 0

    by_key = {r["key"]: r for r in rows}
    tiers = {r["key"]: r["tier"] for r in rows}
    counts_by_key = {r["key"]: r["present"] for r in rows}
    pages = read_pages_text(text_dir)
    furniture_pages = read_pages_text(furniture_dir) if furniture_dir is not None else None
    questions = read_question_counts()
    WORK_DIR.mkdir(parents=True, exist_ok=True)

    # A page the render does not cover is not a page this run publishes. `page_text_v5.ts` renders
    # exactly the keys the identity revision holds, and the corpus loader loads exactly those keys,
    # so a field record left over from a page a merge absorbed has no text and no URL. It leaves the
    # ruler with the reason recorded, rather than stopping the measurement or being counted as a
    # page that measures nothing.
    absorbed = sorted(k for k in by_key if k not in pages)
    if absorbed:
        print(
            f"{len(absorbed)} pages hold a field record but no rendered text and are not in this "
            f"run's corpus; first: {absorbed[:3]}"
        )
        for key in absorbed:
            by_key.pop(key, None)
            tiers.pop(key, None)
            counts_by_key.pop(key, None)
        rows = [r for r in rows if r["key"] in by_key]
        # The presence file is what the loader reads to decide `indexable`, so it describes the
        # same corpus the thresholds were derived over and not one page more.
        presence_path = write_presence(rows, tag)
        print(f"presence rewritten over this run's corpus -> "
              f"{os.path.relpath(presence_path, ROOT)}")

    final = json.loads(FINAL_SUMMARY.read_text(encoding="utf-8"))
    recorded_null_lexical = final["lexical"]["nullExpected"]
    recorded_verdict_lexical = final["verdict"]["lexicalMeasured"]

    result: dict = {
        "generated": "scripts/revamp/derive_threshold.py",
        "fieldsDir": os.path.relpath(fields_dir, ROOT),
        "census": os.path.relpath(cpath, ROOT),
        "pageText": {
            "dir": os.path.relpath(text_dir, ROOT),
            "render": (
                "v4 — page-meta-v4.json reproduces every presentFields value in these files "
                "exactly, while page-meta-v3.json disagrees on 158 keys and carries 111 keys "
                "the render no longer holds. These files are therefore the current render, "
                "and gate1b_v3's rule is applied to them unchanged."
                if text_dir.resolve() == TEXT_DIR.resolve()
                else
                "a render other than the corpus-20k v4 text. gate1b_v3's rule, the fold "
                "construction, the population and both lines are applied to it unchanged, so the "
                "only difference from the run over "
                f"`{os.path.relpath(TEXT_DIR, ROOT)}` is the text itself."
            ),
            "pages": len(pages),
            "furniture": (
                "furniture-free (docs/specs/phase4-generators.md §11): the register rows whose "
                "status is an absence, the checked-sources statement on a page with no interaction "
                "row, the patent no-record line and the S10-only classification line are on the "
                "page and are not in this text. Before Phase 4 an absence rendered nothing and was "
                "not in the measured text either, so this is the like-for-like comparison."
            ),
        },
        **(
            {
                "pageTextWithFurniture": {
                    "dir": os.path.relpath(furniture_dir, ROOT),
                    "pages": len(furniture_pages or {}),
                    "note": (
                        "the same pages with their furniture, scored on the set the furniture-free "
                        "text selected. Reported, never used to select."
                    ),
                }
            }
            if furniture_dir is not None
            else {}
        ),
        "rule": "smallest present-field count whose own bucket median positional <= 0.20 and whose "
                "cumulative set (pages at or above it) also keeps median <= 0.20 "
                "(scripts/corpus-20k/overlap/gate1b_v3.py:263-268, unchanged; the count is now "
                "present over applicable)",
        "basis": {
            "primary": PRIMARY_BASIS,
            "definition": "Gate 1b's own measured population — pages carrying at least one derived "
                          "question (gate1b_v3.stage_build: `tier in (1,2) and questions >= 1`) — "
                          "with the tier restriction lifted, because a threshold is now derived for "
                          "Tier 3 as well. Folds of 803 over the pooled population, seed "
                          f"{DEFAULT_SEED}. Bucketing happens inside each tier.",
            "whyNotPerTier": "A nearest-neighbour maximum depends on which 802 pages a page is "
                             "scored against, not only how many. Cutting the folds per tier packs "
                             "each fold with same-model pages and lifts every median: on the "
                             "per-tier basis Tier 1's best bucket sits at 0.2340 and Tier 2's at "
                             "0.2667, against 0.1739 for the cumulative set the pooled Gate 1b run "
                             "recorded at v4. The 0.20 line was calibrated on the pooled basis, so "
                             "reading it against per-tier folds would change the measurement while "
                             "claiming to keep the rule. Both alternatives are recorded under "
                             "basisSensitivity and neither is used to select.",
            "allPairsCheckIsBasisFree": "The size-matched step only proposes a count. The lines are "
                                        "then tested on the set itself, every pair scored exactly, "
                                        "which depends on no fold construction at all.",
        },
        "guard": {
            "stubFloor": STUB_FLOOR,
            "statement": "a bucket below the stub floor of 3 is not eligible to be selected "
                         "(materialise.ts pageTypeOf: a Tier 3 page under 3 present fields is a "
                         "stub). present <= applicable, so every page in an eligible bucket holds "
                         "at least 3 applicable fields and a 1-of-1 page can never read as fully "
                         "covered. The guard can only raise a threshold.",
        },
        "lines": {
            "positional": POSITIONAL_LINE,
            "lexical": LEXICAL_LINE,
            "positionalBasis": "all pairs of the resulting set, every pair scored exactly — the "
                               "basis the recorded 0.195831 was measured on",
            "lexicalBasis": "the resulting set re-measured in size-matched folds of "
                            f"{SET_FOLD_SIZE} (scripts/corpus-20k/gate2/folds.py) — the basis the "
                            "recorded 0.352953 was measured on. Reading a size-matched line against "
                            "an all-pairs figure would compare two different measurements: the "
                            "corpus-20k set that shipped measures 0.352953 size-matched and "
                            "0.368746 all pairs, so an all-pairs reading of 0.353 would reject the "
                            "shipped set too.",
            "lexicalNote": "0.353 is data/corpus-20k/final/summary.json verdict.lexicalMeasured "
                           f"({recorded_verdict_lexical}), the threshold-11 set's size-matched "
                           "lexical median, not that file's lexical.nullExpected, which is "
                           f"{recorded_null_lexical}. 0.353 is the stricter of the two and is the "
                           "line used.",
            "r3LexicalTarget": R3_LEXICAL_TARGET,
        },
        "pendingSource": {"excluded": sorted(pending), "notes": pending_notes},
        "presentFieldsDroppedByAStructuralRule": dropped_present,
        "tiers": {},
    }

    # ---- the three measurement bases -------------------------------------------------------
    candidate_keys = sorted(k for k in by_key if questions.get(k, 0) >= 1)
    all_keys = sorted(by_key)
    basis_rows: dict[str, dict[str, dict]] = {}
    print(f"basis candidates: {len(candidate_keys)} pages (>= 1 question, all tiers)")
    basis_rows["candidates"] = score_size_matched("candidates", candidate_keys, pages, tiers, args.refresh)
    print(f"basis corpus: {len(all_keys)} pages")
    basis_rows["corpus"] = score_size_matched("corpus", all_keys, pages, tiers, args.refresh)
    for tier in TIERS:
        keys = sorted(k for k, t in tiers.items() if t == tier)
        basis_rows[f"tier{tier}"] = score_size_matched(f"tier{tier}", keys, pages, tiers, args.refresh)

    result["basis"]["populations"] = {
        "candidates": len(candidate_keys),
        "corpus": len(all_keys),
        **{f"tier{t}": sum(1 for k in tiers.values() if k == t) for t in TIERS},
    }

    for tier in TIERS:
        keys = sorted(k for k, t in tiers.items() if t == tier)
        cand_keys = [k for k in keys if questions.get(k, 0) >= 1]

        def buckets_for(basis: str):
            rows_b = basis_rows[basis] if basis.startswith("tier") else {
                k: v for k, v in basis_rows[basis].items() if tiers[k] == tier
            }
            return buckets_and_threshold(rows_b, counts_by_key, STUB_FLOOR)

        buckets, counts, unguarded, guarded = buckets_for(PRIMARY_BASIS)
        sensitivity = {}
        for basis in ("corpus", f"tier{tier}"):
            _b, _c, _u, _g = buckets_for(basis)
            sensitivity[basis] = {
                "pagesMeasured": _b and sum(v["n"] for v in _b.values()),
                "ruleAnswerUnguarded": _u,
                "ruleAnswerAfterStubFloor": _g,
                "bestBucketPositionalMedian": min(v["cumPosMed"] for v in _b.values()) if _b else None,
            }

        applicable_lt3 = [k for k in keys if by_key[k]["applicable"] < STUB_FLOOR]
        applicable_1 = [k for k in keys if by_key[k]["applicable"] == 1]

        steps = []
        start = guarded if guarded is not None else STUB_FLOOR
        chosen = start
        max_count = max(counts_by_key[k] for k in keys)
        while chosen is not None and chosen <= max_count:
            set_keys = sorted(k for k in keys if counts_by_key[k] >= chosen)
            if not set_keys:
                chosen = None
                break
            ap = score_all_pairs(f"tier{tier}-t{chosen}", set_keys, pages, tiers, args.refresh)
            sms = score_set_size_matched(f"tier{tier}-t{chosen}", set_keys, pages, tiers, args.refresh)
            pos_med = ap["positional"]["median"]
            lex_med = sms["lexical"]["median"]
            ok = pos_med <= POSITIONAL_LINE and lex_med <= LEXICAL_LINE
            steps.append(
                {
                    "threshold": chosen,
                    "indexable": len(set_keys),
                    "positionalAllPairs": pos_med,
                    "positionalSizeMatchedSet": sms["positional"]["median"],
                    "lexicalSizeMatchedSet": lex_med,
                    "lexicalAllPairs": ap["lexical"]["median"],
                    "clearsPositionalLine": pos_med <= POSITIONAL_LINE,
                    "clearsLexicalLine": lex_med <= LEXICAL_LINE,
                    "clearsR3LexicalTarget": lex_med <= R3_LEXICAL_TARGET,
                    "clearsBothLines": ok,
                }
            )
            print(f"    tier {tier} candidate {chosen}: n={len(set_keys)} posAllPairs={pos_med:.6f} "
                  f"lexSizeMatched={lex_med:.6f} ok={ok}", flush=True)
            if ok:
                break
            nxt = chosen + 1
            chosen = nxt if nxt <= max_count else None

        entry: dict = {
            "pages": len(keys),
            "pagesInPrimaryBasis": len(cand_keys),
            "medianApplicable": int(np.median([by_key[k]["applicable"] for k in keys])),
            "medianPresent": int(np.median([counts_by_key[k] for k in keys])),
            "ruleAnswerUnguarded": unguarded,
            "ruleAnswerAfterStubFloor": guarded,
            "selectionStartedAt": start,
            "selectionStartNote": None if guarded is not None else
                "the size-matched bucket rule selected no count in this tier, so the search for a "
                "set that clears both all-pairs lines starts at the stub floor and rises",
            "threshold": chosen,
            "raisedBy": None if chosen is None else chosen - start,
            "lineCheckSteps": steps,
            "buckets": buckets,
            "basisSensitivity": sensitivity,
            "stubs": {
                "applicableUnder3": len(applicable_lt3),
                "applicableEqualTo1": len(applicable_1),
                "note": "pages that cannot reach the stub floor because they hold fewer than 3 "
                        "applicable fields; they are never indexable and never count as covered",
            },
            "withQuestions": len(cand_keys),
        }
        if chosen is not None:
            set_keys = sorted(k for k in keys if counts_by_key[k] >= chosen)
            ap = score_all_pairs(f"tier{tier}-t{chosen}", set_keys, pages, tiers, args.refresh)
            sms = score_set_size_matched(f"tier{tier}-t{chosen}", set_keys, pages, tiers, args.refresh)
            entry.update(
                {
                    "indexable": len(set_keys),
                    "indexableWithQuestions": sum(1 for k in set_keys if questions.get(k, 0) >= 1),
                    "positionalSizeMatchedDerivation": buckets.get(str(chosen), {}).get("cumPosMed"),
                    "lexicalSizeMatchedDerivation": buckets.get(str(chosen), {}).get("cumLexMed"),
                    "positionalSizeMatched": sms["positional"]["median"],
                    "lexicalSizeMatched": sms["lexical"]["median"],
                    "positionalAllPairs": ap["positional"]["median"],
                    "lexicalAllPairs": ap["lexical"]["median"],
                    "positionalAllPairsP90": ap["positional"]["p90"],
                    "sharedWordShareSizeMatched": sms["sharedWordShareMedian"],
                    "sharedWordShareAllPairs": ap["sharedWordShareMedian"],
                    "allPairs": ap,
                    "sizeMatchedSet": sms,
                    "clearsPositional": ap["positional"]["median"] <= POSITIONAL_LINE,
                    "clearsLexical": sms["lexical"]["median"] <= LEXICAL_LINE,
                }
            )
            if furniture_pages is not None:
                # The same set, the same rule, the same lines — the other definition of the page's
                # text. Cache files are namespaced so the two runs never read one another's scores.
                # `main` already declares `CACHE_PREFIX` global, above, where it sets the gate
                # prefix; declaring it a second time inside the same function is a syntax error.
                gate_prefix = CACHE_PREFIX
                CACHE_PREFIX = (
                    os.path.relpath(furniture_dir, ROOT).replace("/", "_").replace(".", "_") + "-"
                )
                fap = score_all_pairs(
                    f"tier{tier}-t{chosen}", set_keys, furniture_pages, tiers, args.refresh
                )
                fsms = score_set_size_matched(
                    f"tier{tier}-t{chosen}", set_keys, furniture_pages, tiers, args.refresh
                )
                CACHE_PREFIX = gate_prefix
                entry["withFurniture"] = {
                    "positionalAllPairs": fap["positional"]["median"],
                    "lexicalAllPairs": fap["lexical"]["median"],
                    "positionalSizeMatched": fsms["positional"]["median"],
                    "lexicalSizeMatched": fsms["lexical"]["median"],
                    "sharedWordShareAllPairs": fap["sharedWordShareMedian"],
                    "clearsPositional": fap["positional"]["median"] <= POSITIONAL_LINE,
                    "clearsLexical": fsms["lexical"]["median"] <= LEXICAL_LINE,
                }
        else:
            entry.update(
                {
                    "indexable": 0,
                    "indexableWithQuestions": 0,
                    "positionalSizeMatched": None,
                    "lexicalSizeMatched": None,
                    "positionalAllPairs": None,
                    "lexicalAllPairs": None,
                    "clearsPositional": False,
                    "clearsLexical": False,
                    "note": "no present-field count at or above the stub floor produces a set that "
                            "holds both lines, so no page of this tier is indexable under the "
                            "unchanged rule",
                }
            )
        result["tiers"][f"tier{tier}"] = entry
        print(
            f"  tier {tier}: rule={unguarded} guarded={guarded} final={chosen} "
            f"indexable={entry['indexable']}"
        )
        if entry.get("withFurniture"):
            print(
                f"    with furniture: positional {entry['withFurniture']['positionalAllPairs']} "
                f"lexical {entry['withFurniture']['lexicalSizeMatched']} "
                "(reported beside the gate figure, never selecting)"
            )

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(result, indent=1) + "\n", encoding="utf-8")
    md_path = write_markdown(result, by_key, out_json.with_suffix(".md"))
    print(f"thresholds -> {os.path.relpath(out_json, ROOT)}")
    print(f"markdown   -> {os.path.relpath(md_path, ROOT)}")
    return 0


def write_markdown(result: dict, by_key: dict, path: Path | None = None) -> Path:
    path = path or (OUT_DIR / "thresholds.md")
    out: list[str] = []
    out.append("# Per-tier indexing thresholds over applicable fields (Phase 1.3)\n")
    out.append(
        "Generated by `scripts/revamp/derive_threshold.py`. Machine-readable twin: "
        "`data/revamp/thresholds.json`.\n"
    )
    out.append("## Method\n")
    out.append(f"- Rule, unchanged: {result['rule']}\n")
    out.append(
        "- Basis: `scripts/corpus-20k/overlap/gate1b_v3.py`'s fold machinery — "
        f"`fold_membership(n, {FOLD_SIZE}, seed={DEFAULT_SEED})`, each fold scored by "
        "`harness.exhaustive_neighbours`, each page keeping the score from the fold that owns it.\n"
    )
    out.append(f"- Page text: `{result['pageText']['dir']}`. {result['pageText']['render']}\n")
    out.append(f"- Population: {result['basis']['definition']}\n")
    out.append(f"- Why not per-tier folds: {result['basis']['whyNotPerTier']}\n")
    out.append(f"- {result['basis']['allPairsCheckIsBasisFree']}\n")
    out.append(f"- Stub floor: {result['guard']['statement']}\n")
    out.append(
        f"- Lines: positional {POSITIONAL_LINE} on the all-pairs basis; lexical {LEXICAL_LINE} on "
        f"the set's own size-matched basis. {result['lines']['lexicalBasis']} "
        f"{result['lines']['lexicalNote']}\n"
    )
    excluded = ", ".join(result["pendingSource"]["excluded"]) or "none"
    out.append(f"- `pending_source` fields out of the denominator this run: {excluded}.\n")
    dropped = result["presentFieldsDroppedByAStructuralRule"]
    if dropped:
        detail = ", ".join(f"{k} {v}" for k, v in sorted(dropped.items()))
        out.append(
            f"- Present field entries a structural rule removed from both numerator and "
            f"denominator: {detail}. Nothing is hidden: these are recorded states whose value "
            "contradicts the rule that would make the field apply.\n"
        )
    out.append("\n## Result\n")
    out.append(
        "| Tier | Pages | Median applicable | Rule answer | After stub floor | Threshold | "
        "Indexable | Positional, all pairs (line 0.20) | Lexical, size-matched (line 0.353) | "
        "Positional, size-matched | Lexical, all pairs |\n"
    )
    out.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n")
    for tier in TIERS:
        e = result["tiers"][f"tier{tier}"]

        def fmt(v):
            return "—" if v is None else (f"{v:.6f}" if isinstance(v, float) else str(v))

        out.append(
            f"| {tier} | {e['pages']} | {e['medianApplicable']} | {fmt(e['ruleAnswerUnguarded'])} | "
            f"{fmt(e['ruleAnswerAfterStubFloor'])} | {fmt(e['threshold'])} | {e['indexable']} | "
            f"{fmt(e['positionalAllPairs'])} | {fmt(e['lexicalSizeMatched'])} | "
            f"{fmt(e['positionalSizeMatched'])} | {fmt(e['lexicalAllPairs'])} |\n"
        )
    for tier in TIERS:
        e = result["tiers"][f"tier{tier}"]
        out.append(f"\n## Tier {tier}\n\n")
        if e["threshold"] is None:
            out.append(f"{e['note']}\n\n")
        sens = e["basisSensitivity"]
        out.append(
            "Rule answer by measurement basis — primary (Gate 1b's pooled population) "
            f"{e['ruleAnswerAfterStubFloor']}, whole corpus "
            f"{sens['corpus']['ruleAnswerAfterStubFloor']}, this tier's own folds "
            f"{sens[f'tier{tier}']['ruleAnswerAfterStubFloor']}.\n\n"
        )
        out.append(
            f"Pages {e['pages']} ({e['pagesInPrimaryBasis']} of them in the primary basis); median "
            f"applicable fields {e['medianApplicable']}; median present "
            f"over applicable {e['medianPresent']}; pages holding fewer than {STUB_FLOOR} "
            f"applicable fields {e['stubs']['applicableUnder3']} (of which exactly one applicable "
            f"field: {e['stubs']['applicableEqualTo1']}).\n\n"
        )
        if e["lineCheckSteps"]:
            out.append(
                "Line check — positional on the all-pairs basis, lexical on the set's own "
                f"size-matched basis (folds of {SET_FOLD_SIZE}):\n\n"
            )
            out.append(
                "| Candidate threshold | Set size | Positional, all pairs (line 0.20) | "
                "Lexical, size-matched (line 0.353) | Positional, size-matched | Lexical, all pairs | "
                "Clears both |\n"
            )
            out.append("| ---: | ---: | ---: | ---: | ---: | ---: | --- |\n")
            for s in e["lineCheckSteps"]:
                out.append(
                    f"| {s['threshold']} | {s['indexable']} | {s['positionalAllPairs']:.6f} | "
                    f"{s['lexicalSizeMatchedSet']:.6f} | {s['positionalSizeMatchedSet']:.6f} | "
                    f"{s['lexicalAllPairs']:.6f} | {'yes' if s['clearsBothLines'] else 'no'} |\n"
                )
            if e["raisedBy"]:
                out.append(
                    f"\nThe rule's answer {e['ruleAnswerAfterStubFloor']} failed a line, so the "
                    f"threshold was raised by {e['raisedBy']} whole step"
                    f"{'s' if e['raisedBy'] != 1 else ''} to {e['threshold']}.\n"
                )
        out.append("\nBuckets (present over applicable):\n\n")
        out.append("| Count | Pages | Bucket positional median | Bucket p90 | Bucket lexical median | Pages at or above | Cumulative positional median | Cumulative lexical median |\n")
        out.append("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n")
        for c in sorted(e["buckets"], key=lambda x: int(x)):
            b = e["buckets"][c]
            out.append(
                f"| {c} | {b['n']} | {b['posMed']:.6f} | {b['posP90']:.6f} | {b['lexMed']:.6f} | "
                f"{b['cumN']} | {b['cumPosMed']:.6f} | {b['cumLexMed']:.6f} |\n"
            )
    path.write_text("".join(out), encoding="utf-8")
    return path


if __name__ == "__main__":
    raise SystemExit(main())
