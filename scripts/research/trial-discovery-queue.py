"""Read-only, paged ClinicalTrials.gov name-candidate discovery for a page slug.

Default source is the mapped registry snapshot, NOT live study results. The mapping
is name-only and cannot substantiate a product, condition, outcome or claim.

Usage:
  python3 scripts/research/trial-discovery-queue.py --slug dapagliflozin
  python3 scripts/research/trial-discovery-queue.py --slug dapagliflozin --limit 20 --offset 20

DuckDB is needed for Parquet. ``--fixture-row-json`` exercises the same queue logic
without DuckDB in isolated tests; it is not a production source option.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

DEFAULT_SLUGS = Path("data/revamp/identity/page-slugs.csv")
DEFAULT_PARQUET = Path("data/sources/clinicaltrials/mapped.parquet")
NCT_RE = re.compile(r"^NCT\d{8}$")


def page_for_slug(path: Path, slug: str) -> dict[str, str] | None:
    """Resolve a unique page key by exact slug; no fuzzy name resolution."""
    found: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            if row.get("slug") == slug:
                found.append(row)
    if len(found) > 1:
        raise ValueError(f"duplicate page slug {slug!r} in {path}")
    return found[0] if found else None


def mapped_row_for_key(parquet: Path, key: str) -> dict[str, Any] | None:
    """Select exactly one registry.hasResults row from the mapped Parquet."""
    try:
        import duckdb
    except ImportError as exc:
        raise RuntimeError(
            "DuckDB is required for mapped.parquet; install it in the Python environment "
            "running this read-only command"
        ) from exc

    con = duckdb.connect(database=":memory:")
    try:
        rows = con.execute(
            """SELECT key, field, value, source_record_id, source_url,
                      source_date, match_rule
               FROM read_parquet(?)
               WHERE key = ? AND field = 'registry.hasResults'""",
            [str(parquet), key],
        ).fetchall()
    finally:
        con.close()
    if len(rows) > 1:
        raise ValueError(f"multiple registry.hasResults rows for page key {key!r}")
    if not rows:
        return None
    fields = (
        "key", "field", "value", "source_record_id", "source_url",
        "source_date", "match_rule",
    )
    return dict(zip(fields, rows[0], strict=True))


def build_queue(
    *,
    slug: str,
    page: dict[str, str] | None,
    mapped_row: dict[str, Any] | None,
    parquet_path: str,
    slugs_path: str,
    limit: int,
    offset: int,
) -> dict[str, Any]:
    if not page:
        return {
            "status": "NO_EXACT_PAGE_SLUG",
            "slug": slug,
            "page": None,
            "source": {"pageSlugPath": slugs_path, "mappedPath": parquet_path},
            "counts": {"totalNameMatchedTrials": 0, "totalResultsPostedCandidates": 0, "returned": 0},
            "candidates": [],
            "caution": "No exact page slug was found; this is not evidence that no trial exists.",
        }

    page_summary = {
        "key": page["key"],
        "slug": page["slug"],
        "tier": page.get("tier"),
        "displayName": page.get("display_name"),
        "indexable": page.get("indexable"),
    }
    source = {
        "pageSlugPath": slugs_path,
        "mappedPath": parquet_path,
        "mappedField": "registry.hasResults",
        "sourceRecordId": mapped_row.get("source_record_id") if mapped_row else None,
        "sourceUrl": mapped_row.get("source_url") if mapped_row else None,
        "sourceDate": mapped_row.get("source_date") if mapped_row else None,
        "matchRule": mapped_row.get("match_rule") if mapped_row else None,
    }
    if mapped_row is None:
        return {
            "status": "NO_MAPPED_REGISTRY_ROW",
            "slug": slug,
            "page": page_summary,
            "source": source,
            "counts": {"totalNameMatchedTrials": 0, "totalResultsPostedCandidates": 0, "returned": 0},
            "candidates": [],
            "caution": "The mapped snapshot has no row for this page key; absence is not evidence that no trial exists.",
        }

    if mapped_row.get("key") != page["key"] or mapped_row.get("field") != "registry.hasResults":
        raise ValueError("mapped row is not registry.hasResults for the exact page key")
    if mapped_row.get("match_rule") != "name-candidate":
        raise ValueError("mapped row is not a name-candidate link; do not relabel it")
    for field in ("source_record_id", "source_url", "source_date"):
        if not isinstance(mapped_row.get(field), str) or not mapped_row[field]:
            raise ValueError(f"mapped row is missing source provenance {field}")

    value = mapped_row.get("value")
    data = json.loads(value) if isinstance(value, str) else value
    if not isinstance(data, dict):
        raise ValueError("registry.hasResults value must be a JSON object")
    posted = data.get("resultsPosted")
    total = data.get("trials")
    with_results = data.get("withResults")
    if not isinstance(posted, list) or not isinstance(total, int) or not isinstance(with_results, int):
        raise ValueError("registry.hasResults is missing required counts or resultsPosted")
    if total < 0 or with_results < 0 or with_results > total or len(posted) != with_results:
        raise ValueError("registry.hasResults counts disagree with resultsPosted")

    seen: set[str] = set()
    candidates: list[dict[str, Any]] = []
    for entry in posted:
        if not isinstance(entry, dict):
            raise ValueError("invalid resultsPosted entry")
        nct = entry.get("nct")
        if not isinstance(nct, str) or not NCT_RE.fullmatch(nct) or nct in seen:
            raise ValueError("invalid or duplicate NCT in resultsPosted")
        date = entry.get("resultsFirstPostDate")
        if date is not None and not isinstance(date, str):
            raise ValueError("invalid resultsFirstPostDate in resultsPosted")
        seen.add(nct)
        candidates.append({
            "status": "NAME_CANDIDATE_UNVERIFIED",
            "nct": nct,
            "studyUrl": f"https://clinicaltrials.gov/study/{nct}",
            "resultsFirstPostDate": date,
            "sourceValuePath": "registry.hasResults.resultsPosted",
            "meaning": "Mapped name candidate with a registry results-posted flag only; no result read or claim verified.",
        })

    # Stable recent-posting order for a bounded queue, not a quality/importance rank.
    candidates.sort(key=lambda row: (row["resultsFirstPostDate"] or "", row["nct"]), reverse=True)
    selected = candidates[offset : offset + limit]
    return {
        "status": "NAME_CANDIDATE_UNVERIFIED",
        "slug": slug,
        "page": page_summary,
        "source": source,
        "counts": {
            "totalNameMatchedTrials": total,
            "totalResultsPostedCandidates": with_results,
            "returned": len(selected),
            "offset": offset,
            "limit": limit,
            "remainingAfterPage": max(0, with_results - offset - len(selected)),
        },
        "candidates": selected,
        "caution": (
            "Every link is an unverified normalized-name match. A posted-results flag is not a result, "
            "and no condition, exact product/form/route, population, outcome or effect is established here. "
            "Open and review each NCT before making a claim."
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--slugs", type=Path, default=DEFAULT_SLUGS)
    parser.add_argument("--parquet", type=Path, default=DEFAULT_PARQUET)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--fixture-row-json", type=Path, help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.limit < 1 or args.limit > 100 or args.offset < 0:
        parser.error("--limit must be 1–100 and --offset must be nonnegative")

    try:
        page = page_for_slug(args.slugs, args.slug)
        row = None
        if page:
            if args.fixture_row_json:
                row = json.loads(args.fixture_row_json.read_text(encoding="utf-8"))
            else:
                row = mapped_row_for_key(args.parquet, page["key"])
        report = build_queue(
            slug=args.slug,
            page=page,
            mapped_row=row,
            parquet_path=str(args.parquet),
            slugs_path=str(args.slugs),
            limit=args.limit,
            offset=args.offset,
        )
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"trial discovery error: {exc}", file=sys.stderr)
        return 2
    json.dump(report, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
