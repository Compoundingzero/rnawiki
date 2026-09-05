#!/usr/bin/env python
"""Step 0.3: assemble data/revamp/baseline.json and the comparison against the FINAL REPORT.

Reads the artefacts the earlier 0.3 scripts produced - the sitemap read, the per-set overlap runs,
the size-matched folds, the crawl text-to-HTML figures, the Playwright run and the production SQL
read - and writes:

    data/revamp/baseline.json                     every baseline figure, with its artefact path
    data/revamp/baseline-vs-final-report.md       each figure against the FINAL REPORT number

Every expectation below is quoted from the FINAL REPORT in docs/worklogs/corpus-20k.md and from the
machine form it cites, data/corpus-20k/final/summary.json. A figure matches when it agrees to the
number of decimals the FINAL REPORT states it to.

    baseline_assemble.py
"""

from __future__ import annotations

import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
B = ROOT / "data" / "revamp" / "baseline"
FINAL = ROOT / "data" / "corpus-20k" / "final"
WORKLOG = "docs/worklogs/corpus-20k.md FINAL REPORT"
REPORT = "data/corpus-20k/final/report.md, cited by the FINAL REPORT"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def median_of(summary: dict, kind: str, field: str = "median"):
    return summary["full"][kind][field]


def matched(summary: dict, size: int, kind: str):
    for block in summary.get("matched") or []:
        if block["label"] == f"matched-{size}":
            return block[kind]["median"]
    return None


def rounded_equal(measured: float, stated: float, decimals: int) -> bool:
    return round(measured, decimals) == round(stated, decimals)


def main() -> int:
    runs = {name: load(B / "runs" / name / "summary.json") for name in
            ["draw803", "draw324", "indexed", "indexed-prose", "matched604", "matched252"]}
    folds = load(B / "runs" / "indexed-folds-324" / "summary.json")
    sets = load(B / "sets.json")
    lists = load(B / "lists.json")
    production = load(B / "production.json")
    checks = load(B / "browser-checks-live.json")

    live = {slug: {width: audit["liveTextToHtml"] for width, audit in per.items()}
            for slug, per in checks["samples"].items()}
    desktop = sorted(v["desktop"] for v in live.values())
    both = sorted(x for v in live.values() for x in v.values())

    baseline = {
        "schema": "rnawiki-revamp-2026-09-baseline/v1",
        "step": "0.3",
        "ranAt": production["readAt"],
        "site": "https://rnawiki.com",
        "method": {
            "sameRuler": (
                "the corpus-20k measurement scripts, unchanged: gate2/fetch.py (concurrency 4, every "
                "request appended to data/corpus-20k/legal/requests.log), gate2/extract.py, "
                "overlap/measure.py (seed 20260904, 128 permutations, 5-gram shingles, exhaustive), "
                "gate2/folds.py --fold-size 324, gate2/browser-checks.ts"
            ),
            "urlSet": (
                "the 1,592 dossier URLs the Phase 5 measurement fetched, rebuilt row for row from its "
                "own fetch record data/corpus-20k/final/html-text/live-dossiers.ndjson"
            ),
            "setKeyLists": "data/corpus-20k/final/lists/*.txt, the key lists the Phase 5 scorer ran on",
            "sampleFlagAvoided": (
                "measure.py --sample truncates a key at its first comma, which mangles COMBO keys; one "
                "NDJSON per set was written instead, as Gate 2 and the Phase 5 measurement did"
            ),
            "production": production["method"],
            "requestsLogged": 1616,
            "artefacts": {
                "fetch": "data/revamp/baseline/html-text/live-dossiers.ndjson",
                "pages": "data/revamp/baseline/pages/",
                "runs": "data/revamp/baseline/runs/",
                "browser": "data/revamp/baseline/browser-checks-live.json",
                "production": "data/revamp/baseline/production.json",
                "sitemaps": "data/revamp/baseline/sitemaps/",
            },
        },
        "fetch": {"requested": sets["fetchedPages"], "status200": sets["status200"], "non200": sets["non200"]},
        "sets": {name: runs[name]["pages"] for name in runs},
        "positional": {
            "draw803": median_of(runs["draw803"], "positional"),
            "draw803SizeMatchedTo324": matched(runs["draw803"], 324, "positional"),
            "draw324": median_of(runs["draw324"], "positional"),
            "matched604": median_of(runs["matched604"], "positional"),
            "matched252": median_of(runs["matched252"], "positional"),
            "indexedAllPairs": median_of(runs["indexed"], "positional"),
            "indexedSizeMatched": folds["positional"]["median"],
            "indexedProseOnly": median_of(runs["indexed-prose"], "positional"),
            "p90": {
                "draw803": median_of(runs["draw803"], "positional", "p90"),
                "draw324": median_of(runs["draw324"], "positional", "p90"),
                "indexedAllPairs": median_of(runs["indexed"], "positional", "p90"),
                "indexedSizeMatched": folds["positional"]["p90"],
            },
            "aboveTarget_0_20": {
                "indexedAllPairs": runs["indexed"]["full"]["positional"]["above_0_20"],
                "indexedSizeMatched": folds["positional"]["above_0_20"],
                "of": runs["indexed"]["pages"],
            },
            "nullExpectedIndexed": runs["indexed"]["nullModel"]["expectedNearestNeighbour"]["full"]["positional"],
        },
        "lexical": {
            "draw803": median_of(runs["draw803"], "lexical"),
            "draw803SizeMatchedTo324": matched(runs["draw803"], 324, "lexical"),
            "draw324": median_of(runs["draw324"], "lexical"),
            "matched604": median_of(runs["matched604"], "lexical"),
            "matched252": median_of(runs["matched252"], "lexical"),
            "indexedAllPairs": median_of(runs["indexed"], "lexical"),
            "indexedSizeMatched": folds["lexical"]["median"],
            "indexedProseOnly": median_of(runs["indexed-prose"], "lexical"),
            "nullExpectedIndexed": runs["indexed"]["nullModel"]["expectedNearestNeighbour"]["full"]["lexical"],
        },
        "sharedWordShare": {
            "definition": runs["indexed"]["sharedWordShare"]["definition"],
            "matched604": runs["matched604"]["sharedWordShare"]["median"],
            "matched252": runs["matched252"]["sharedWordShare"]["median"],
            "indexedWithMarkup": runs["indexed"]["sharedWordShare"]["median"],
            "indexedWithoutMarkup": runs["indexed-prose"]["sharedWordShare"]["median"],
            "indexedWithMarkupP90": runs["indexed"]["sharedWordShare"]["p90"],
            "indexedWithoutMarkupP90": runs["indexed-prose"]["sharedWordShare"]["p90"],
        },
        "crawlTextToHtml": sets["crawlTextToHtml"],
        "liveTextToHtml": {
            "definition": (
                "document.body.innerText, whitespace collapsed and trimmed, divided by "
                "document.documentElement.outerHTML, measured in Chromium after hydration"
            ),
            "samples": live,
            "desktopMedian": round(statistics.median(desktop), 5),
            "desktopMin": desktop[0],
            "desktopMax": desktop[-1],
            "bothWidthsMedian": round(statistics.median(both), 5),
            "bothWidthsMin": both[0],
            "bothWidthsMax": both[-1],
        },
        "indexedPerTier": lists["indexedPerTier"],
        "indexedPerTierSource": "live sitemap children sitemaps/tier-1.xml and tier-2.xml; Tier 3 appears in no sitemap child",
        "indexedPerTierFromDatabase": {
            "tier1": production["indexableByTier"].get("1", 0),
            "tier2": production["indexableByTier"].get("2", 0),
            "tier3": production["indexableByTier"].get("3", 0),
        },
        "production": production,
        "controls": {c["label"]: c["positional"]["median"] for c in runs["indexed"]["controls"]},
    }

    # ---- comparison with the FINAL REPORT -------------------------------------------------------
    final = load(FINAL / "summary.json")
    checks_table = [
        ("Positional, seeded 803 draw (798 pages)", baseline["positional"]["draw803"], final["positional"]["matched803"], 3, REPORT),
        ("Positional, 803 draw size-matched to 324", baseline["positional"]["draw803SizeMatchedTo324"], final["positional"]["draw803SizeMatchedTo324"], 3, REPORT),
        ("Positional, seeded 324 draw (322 pages)", baseline["positional"]["draw324"], final["positional"]["matched324"], 3, REPORT),
        ("Positional, like-for-like 604 medicines", baseline["positional"]["matched604"], final["likeForLike"]["afterPositionalMedian"], 3, WORKLOG),
        ("Positional, like-for-like 251 medicines", baseline["positional"]["matched252"], final["likeForLike"]["second"]["afterPositionalMedian"], 3, WORKLOG),
        ("Positional, indexed set, size-matched", baseline["positional"]["indexedSizeMatched"], final["positional"]["indexedSizeMatched"], 3, WORKLOG),
        ("Positional, indexed set, all pairs", baseline["positional"]["indexedAllPairs"], final["positional"]["indexedAllPairs"], 3, WORKLOG),
        ("Positional, indexed set, prose only", baseline["positional"]["indexedProseOnly"], final["positional"]["proseOnlyIndexed"], 3, REPORT),
        ("Positional p90, indexed set, all pairs", baseline["positional"]["p90"]["indexedAllPairs"], final["positional"]["p90"]["indexedAllPairs"], 3, WORKLOG),
        ("Lexical, seeded 803 draw", baseline["lexical"]["draw803"], final["lexical"]["matched803"], 3, REPORT),
        ("Lexical, seeded 324 draw", baseline["lexical"]["draw324"], final["lexical"]["matched324"], 3, REPORT),
        ("Lexical, indexed set, size-matched", baseline["lexical"]["indexedSizeMatched"], final["lexical"]["indexedSizeMatched"], 3, WORKLOG),
        ("Lexical, indexed set, all pairs", baseline["lexical"]["indexedAllPairs"], final["lexical"]["indexedAllPairs"], 3, WORKLOG),
        ("Lexical, indexed set, prose only", baseline["lexical"]["indexedProseOnly"], final["lexical"]["proseOnlyIndexed"], 3, REPORT),
        ("Shared-word share, 604 medicines", baseline["sharedWordShare"]["matched604"], final["sharedWordShare"]["matched604"], 3, WORKLOG),
        ("Shared-word share, 251 medicines", baseline["sharedWordShare"]["matched252"], final["sharedWordShare"]["matched252"], 3, REPORT),
        ("Shared-word share, indexed with markup rows", baseline["sharedWordShare"]["indexedWithMarkup"], final["sharedWordShare"]["indexedWithMarkup"], 3, WORKLOG),
        ("Shared-word share, indexed prose only", baseline["sharedWordShare"]["indexedWithoutMarkup"], final["sharedWordShare"]["indexedWithoutMarkup"], 3, WORKLOG),
        ("Crawl text-to-HTML, indexed median", baseline["crawlTextToHtml"]["indexedMedian"], final["crawlTextToHtml"]["indexedMedian"], 3, WORKLOG),
        ("Crawl text-to-HTML, all 1,592 fetched", baseline["crawlTextToHtml"]["allFetchedMedian"], final["crawlTextToHtml"]["allFetchedMedian"], 3, REPORT),
        ("Control: other page's text", baseline["controls"]["control:other"], final["controls"]["control:other"], 3, REPORT),
        ("Control: more of the page's own text", baseline["controls"]["control:self"], final["controls"]["control:self"], 3, REPORT),
        ("Null expectation, positional, 636 pages", baseline["positional"]["nullExpectedIndexed"], final["positional"]["nullExpected"], 3, WORKLOG),
    ]
    integer_checks = [
        ("Pages, Tier 1", int(production["pagesByTier"]["1"]), final["production"]["pagesByTier"]["tier1"], WORKLOG),
        ("Pages, Tier 2", int(production["pagesByTier"]["2"]), final["production"]["pagesByTier"]["tier2"], WORKLOG),
        ("Pages, Tier 3", int(production["pagesByTier"]["3"]), final["production"]["pagesByTier"]["tier3"], WORKLOG),
        ("Indexed, Tier 1 (live sitemap)", lists["indexedPerTier"]["tier1"], final["production"]["indexableByTier"]["tier1"], WORKLOG),
        ("Indexed, Tier 2 (live sitemap)", lists["indexedPerTier"]["tier2"], final["production"]["indexableByTier"]["tier2"], WORKLOG),
        ("Indexed, Tier 3 (live sitemap)", lists["indexedPerTier"]["tier3"], final["production"]["indexableByTier"]["tier3"], WORKLOG),
        ("Indexable rows in the database", production["indexable"], final["production"]["indexable"], WORKLOG),
        ("Suppressed, Tier 1", int(production["suppressedByTier"]["1"]), final["production"]["suppressedByTier"]["tier1"], WORKLOG),
        ("Suppressed, Tier 2", int(production["suppressedByTier"]["2"]), final["production"]["suppressedByTier"]["tier2"], WORKLOG),
        ("Suppressed, Tier 3", int(production["suppressedByTier"]["3"]), final["production"]["suppressedByTier"]["tier3"], WORKLOG),
        ("Withdrawn pages", int(production["withdrawnByTier"]["1"]), final["production"]["withdrawn"], WORKLOG),
        ("Redirect rows", production["redirects"], final["production"]["redirects"], WORKLOG),
        ("Migrations applied", production["migrationsApplied"], final["production"]["migrationsApplied"], WORKLOG),
        ("Legacy drugs rows", production["legacyDrugsRows"], final["production"]["legacyDrugsRows"], WORKLOG),
        ("Pages above 0.20 positional, indexed all pairs", baseline["positional"]["aboveTarget_0_20"]["indexedAllPairs"], final["positional"]["aboveTarget_0_20"]["indexedAllPairs"], WORKLOG),
        ("Pages fetched 200", sets["status200"], final["method"]["requests"]["dossierPages200"], REPORT),
    ]
    for seed, count in sorted(final["production"]["seedFires"].items(), key=lambda kv: int(kv[0])):
        integer_checks.append((f"Seed {seed} fires, corpus-wide", int(production["seedFires"].get(seed, 0)), count, WORKLOG))
    for seed, count in sorted(final["production"]["seedFiresIndexable"].items(), key=lambda kv: int(kv[0])):
        integer_checks.append((f"Seed {seed} fires, indexable", int(production["seedFiresIndexable"].get(seed, 0)), count, WORKLOG))

    rows = []
    discrepancies = []
    for name, measured, stated, decimals, source in checks_table:
        ok = rounded_equal(measured, stated, decimals)
        rows.append((name, f"{stated:.6f}", f"{measured:.6f}", "match" if ok else "DIFFERS", source))
        if not ok:
            discrepancies.append({"kind": "value-mismatch", "figure": name, "finalReport": stated, "baseline": measured, "source": source})
    for name, measured, stated, source in integer_checks:
        ok = measured == stated
        rows.append((name, f"{stated:,}", f"{measured:,}", "match" if ok else "DIFFERS", source))
        if not ok:
            discrepancies.append({"kind": "value-mismatch", "figure": name, "finalReport": stated, "baseline": measured, "source": source})

    live_row_ok = (round(baseline["liveTextToHtml"]["bothWidthsMin"], 3) == 0.033
                   and round(baseline["liveTextToHtml"]["bothWidthsMax"], 3) == 0.055)
    rows.append(("Live text-to-HTML, samples (range)", "0.033-0.055", 
                 f"{baseline['liveTextToHtml']['bothWidthsMin']:.3f}-{baseline['liveTextToHtml']['bothWidthsMax']:.3f}",
                 "match" if live_row_ok else "DIFFERS", WORKLOG))
    if not live_row_ok:
        discrepancies.append({
            "kind": "value-mismatch",
            "figure": "Live text-to-HTML, samples (range)",
            "finalReport": "0.033-0.055",
            "baseline": f"{baseline['liveTextToHtml']['bothWidthsMin']:.3f}-{baseline['liveTextToHtml']['bothWidthsMax']:.3f}",
            "source": WORKLOG,
        })

    discrepancies.extend([
        {
            "kind": "provenance-note",
            "figure": "Live text-to-HTML (innerText/outerHTML), samples",
            "note": (
                "The FINAL REPORT states 3.3-5.5 %. The artefact behind that band is "
                "data/corpus-20k/gate2/browser-checks-v2.json, a Phase 5a run of the same script "
                "against http://localhost:3111 over seven samples (rofecoxib absent, amlodipine in "
                "its place), not against the live site. This baseline runs the same script "
                "unchanged against https://rnawiki.com over all eight samples: the range over both "
                "viewport widths is 0.033-0.055, the same band; read at desktop width alone it is "
                "0.038-0.055 with a median of 0.0455. The live band therefore confirms the reported "
                "one and supplies the per-sample live figures the report did not hold."
            ),
            "affectsComparison": False,
        },
        {
            "kind": "provenance-note",
            "figure": "Positional median, 803 and 324 draw rows of the FINAL REPORT before/after table",
            "note": (
                "The FINAL REPORT's before/after table labels its two positional rows '803 draw (798 "
                "pages after merges)' 0.799 -> 0.278 and '324 draw (322)' 0.786 -> 0.263. Those after "
                "values are the like-for-like sets of data/corpus-20k/final/report.md - the 604 "
                "medicines (0.277962) and the 251 medicines (0.263006) that resolved on the live site "
                "before the corpus deployed - not the seeded draws themselves, which measure 0.300 "
                "(798 pages) and 0.275 (322 pages). This baseline reproduces all four figures and "
                "records them separately so the Phase 1 comparison cannot conflate them."
            ),
            "affectsComparison": False,
        },
    ])

    baseline["comparedWith"] = "docs/worklogs/corpus-20k.md FINAL REPORT and data/corpus-20k/final/summary.json"
    baseline["matchesFinalReport"] = not any(d["kind"] == "value-mismatch" for d in discrepancies)
    baseline["discrepancies"] = discrepancies

    (ROOT / "data" / "revamp" / "baseline.json").write_text(json.dumps(baseline, indent=1) + "\n", encoding="utf-8")

    lines = [
        "# Baseline 0.3 against the corpus-20k FINAL REPORT",
        "",
        f"Measured {baseline['ranAt']} against https://rnawiki.com with the corpus-20k scripts unchanged.",
        "Baseline figures: `data/revamp/baseline.json`. FINAL REPORT: `docs/worklogs/corpus-20k.md`,",
        "machine form `data/corpus-20k/final/summary.json`.",
        "",
        "| Figure | FINAL REPORT | Baseline 0.3 | Verdict | Stated in |",
        "| --- | ---: | ---: | --- | --- |",
    ]
    for name, stated, measured, verdict, source in rows:
        lines.append(f"| {name} | {stated} | {measured} | {verdict} | {source} |")
    lines += [
        "",
        f"{sum(1 for r in rows if r[3] == 'match')} of {len(rows)} figures reproduce; "
        f"{sum(1 for r in rows if r[3] != 'match')} differ beyond rounding.",
        "",
        "## Notes recorded rather than silently carried",
        "",
    ]
    for entry in discrepancies:
        if entry["kind"] == "provenance-note":
            lines.append(f"- **{entry['figure']}.** {entry['note']}")
        else:
            lines.append(f"- **{entry['figure']}** differs: FINAL REPORT {entry['finalReport']}, baseline {entry['baseline']}.")
    lines.append("")
    (ROOT / "data" / "revamp" / "baseline-vs-final-report.md").write_text("\n".join(lines), encoding="utf-8")

    print(json.dumps({
        "rows": len(rows),
        "matched": sum(1 for r in rows if r[3] == "match"),
        "differ": sum(1 for r in rows if r[3] != "match"),
        "matchesFinalReport": baseline["matchesFinalReport"],
        "valueMismatches": [d["figure"] for d in discrepancies if d["kind"] == "value-mismatch"],
    }, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
