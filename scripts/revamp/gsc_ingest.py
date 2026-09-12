#!/usr/bin/env python
"""Normalise manual Search Console CSV exports into data/revamp/gsc/ingested.parquet.

Revamp step 0.4, the path taken when GSC_SERVICE_ACCOUNT_JSON is absent. It reads the
exports a person downloads from the Search Console interface:

  A. Performance -> Pages, date range set to the last 16 months. The download is a ZIP
     or folder whose Pages.csv holds one row per page with clicks, impressions, CTR and
     average position over the whole range. Dates.csv, Queries.csv and the rest are read
     for the daily series where present and ignored otherwise.
  B. Indexing -> Pages. Two downloads together: the report page itself, whose Table.csv
     is the "Why pages aren't indexed" table (reason, source, validation, page count),
     and "View data about indexed pages", whose Table.csv lists the indexed URLs with
     their last-crawl date. Per-reason example-URL downloads are read the same way.

Files are classified by their header row, not by their name, because Search Console gives
several different reports the file name Table.csv. Every URL-bearing row is joined to the
corpus: page URL -> slug -> corpus key -> tier and model, using, in this order,
data/corpus-20k/reconciliation/dispositions.ndjson (which also supplies the disposition
that explains a legacy URL), the existingSlug recorded in identity/canonical.ndjson, and
finally slugify(displayName), the same deterministic rule as lib/ids.ts. A URL that
matches none of the three is reported as unmatched rather than dropped silently.

Output:
  data/revamp/gsc/ingested.parquet   one row per URL per record kind
  data/revamp/gsc/ingested-summary.json  per-tier totals, reason counts, the daily series
Printed: at most 50 rows of per-tier and per-disposition totals.

Usage:
  .venv-corpus/bin/python scripts/revamp/gsc_ingest.py <export-dir-or-zip> [more...]
  .venv-corpus/bin/python scripts/revamp/gsc_ingest.py ~/Downloads/rnawiki.com-Performance-on-Search ~/Downloads/rnawiki.com-Coverage

Exit codes: 0 success, 2 no readable export supplied, 3 exports held no recognised table.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

import pandas

REPO_ROOT = Path(__file__).resolve().parents[2]
CORPUS = REPO_ROOT / "data" / "corpus-20k"
DISPOSITIONS = CORPUS / "reconciliation" / "dispositions.ndjson"
CANONICAL = CORPUS / "identity" / "canonical.ndjson"
PAGES_ALL = CORPUS / "render" / "pages-all.ndjson"
MODEL_ASSIGNMENT = CORPUS / "tiers" / "model-assignment.ndjson"
OUT_DIR = REPO_ROOT / "data" / "revamp" / "gsc"

SLUG_MAX_LENGTH = 96  # lib/ids.ts SLUG_MAX_LENGTH
DOSSIER_PREFIX = "/d/"
PRINT_ROW_CAP = 50


# ---------------------------------------------------------------- slug and URL


def slugify(value: str) -> str:
    """Python mirror of `slugify` in lib/ids.ts, including its hashed fallback."""
    text = unicodedata.normalize("NFKD", value)
    text = "".join(character for character in text if not unicodedata.combining(character))
    text = text.lower()
    text = re.sub(r"['‘’ʼ]", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    capped = text[:SLUG_MAX_LENGTH].rstrip("-")
    if capped:
        return capped
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]
    return f"s-{digest}"


def slug_from_url(url: str) -> str | None:
    """Return the dossier slug in a page URL, or None when the URL is not a dossier."""
    path = unquote(urlparse(url.strip()).path or url.strip())
    if not path.startswith(DOSSIER_PREFIX):
        return None
    slug = path[len(DOSSIER_PREFIX) :].strip("/")
    return slug or None


# ---------------------------------------------------------------- corpus join


def read_ndjson(path: Path):
    if not path.is_file():
        raise SystemExit(f"corpus input missing: {path}")
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def build_slug_index() -> tuple[dict[str, dict], dict[str, dict]]:
    """Return (slug -> {key, disposition, target_slug, match_rule}, key -> {tier, model, display_name})."""
    key_facts: dict[str, dict] = {}
    for row in read_ndjson(PAGES_ALL):
        key_facts.setdefault(row["key"], {})["tier"] = row.get("tier")
    for row in read_ndjson(MODEL_ASSIGNMENT):
        entry = key_facts.setdefault(row["key"], {})
        entry["model"] = row.get("model")
        entry["display_name"] = row.get("displayName")

    slug_index: dict[str, dict] = {}

    # 3. weakest first, so stronger rules overwrite: the deterministic slug of the name.
    for row in read_ndjson(CANONICAL):
        name = row.get("displayName")
        if name:
            slug_index[slugify(name)] = {
                "key": row["key"],
                "disposition": None,
                "target_slug": None,
                "match_rule": "slugify(displayName)",
            }
    # 2. the slug the record already had before the corpus-20k rebuild.
    for row in read_ndjson(CANONICAL):
        existing = row.get("existingSlug")
        if existing:
            slug_index[existing] = {
                "key": row["key"],
                "disposition": None,
                "target_slug": None,
                "match_rule": "canonical.existingSlug",
            }
    # 1. strongest: the reconciliation disposition, which also explains redirected URLs.
    for row in read_ndjson(DISPOSITIONS):
        slug = row.get("slug")
        if not slug:
            continue
        slug_index[slug] = {
            "key": row.get("key"),
            "disposition": row.get("disposition"),
            "target_slug": row.get("targetSlug"),
            "match_rule": "reconciliation.disposition",
        }
    return slug_index, key_facts


def resolve(url: str, slug_index: dict[str, dict], key_facts: dict[str, dict]) -> dict:
    slug = slug_from_url(url)
    if slug is None:
        return {
            "slug": None,
            "corpus_key": None,
            "tier": None,
            "model": None,
            "disposition": None,
            "match_rule": "not a dossier URL",
        }
    entry = slug_index.get(slug)
    if entry is None:
        return {
            "slug": slug,
            "corpus_key": None,
            "tier": None,
            "model": None,
            "disposition": None,
            "match_rule": "unmatched",
        }
    key = entry["key"]
    # A REDIRECT disposition names the slug the old URL now resolves to; take its tier.
    if entry["target_slug"] and entry["target_slug"] != slug:
        target = slug_index.get(entry["target_slug"])
        if target and target.get("key"):
            key = target["key"]
    facts = key_facts.get(key or "", {})
    return {
        "slug": slug,
        "corpus_key": key,
        "tier": facts.get("tier"),
        "model": facts.get("model"),
        "disposition": entry["disposition"],
        "match_rule": entry["match_rule"],
    }


# ---------------------------------------------------------------- export reading


def iter_csv_files(target: Path):
    """Yield (label, header, rows) for every CSV inside a directory, a zip, or a single file."""
    if target.is_dir():
        for path in sorted(target.rglob("*")):
            if path.is_file() and path.suffix.lower() in {".csv", ".zip"}:
                yield from iter_csv_files(path)
        return
    if not target.is_file():
        print(f"skipping {target}: not a file or directory", file=sys.stderr)
        return
    if target.suffix.lower() == ".zip":
        with zipfile.ZipFile(target) as archive:
            for name in sorted(archive.namelist()):
                if name.lower().endswith(".csv"):
                    text = archive.read(name).decode("utf-8-sig")
                    yield from _parse_csv_text(f"{target.name}!{name}", text)
        return
    if target.suffix.lower() == ".csv":
        yield from _parse_csv_text(str(target), target.read_text(encoding="utf-8-sig"))


def _parse_csv_text(label: str, text: str):
    reader = csv.reader(io.StringIO(text))
    rows = [row for row in reader if any(cell.strip() for cell in row)]
    if not rows:
        return
    header = [cell.strip() for cell in rows[0]]
    yield label, header, rows[1:]


def classify(header: list[str]) -> str:
    """Name the Search Console report a CSV came from, using its header alone."""
    lowered = {cell.strip().lower() for cell in header}
    has_url = bool(lowered & {"url", "page", "top pages", "address"})
    if has_url and lowered & {"impressions", "clicks"}:
        return "performance_pages"
    if lowered & {"date"} and lowered & {"indexed", "not indexed"}:
        return "coverage_chart"
    if lowered & {"date"} and lowered & {"impressions", "clicks"} and not has_url:
        return "performance_dates"
    if lowered & {"reason"} and lowered & {"pages"}:
        return "indexing_reasons"
    if has_url and lowered & {"last crawled", "last crawl", "last crawled date"}:
        return "indexing_urls"
    if has_url:
        return "indexing_urls"
    if lowered == {"property", "value"} or lowered & {"property"}:
        return "metadata"
    return "unrecognised"


def column(header: list[str], *names: str) -> int | None:
    lowered = [cell.strip().lower() for cell in header]
    for name in names:
        if name in lowered:
            return lowered.index(name)
    return None


def to_number(value: str) -> float | None:
    text = (value or "").strip().replace(",", "").replace("%", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


# ---------------------------------------------------------------- main


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("exports", nargs="+", help="export directories, zips or CSV files")
    parser.add_argument("--out-dir", default=str(OUT_DIR), help="where ingested.parquet is written")
    arguments = parser.parse_args()

    targets = [Path(path).expanduser() for path in arguments.exports]
    readable = [path for path in targets if path.exists()]
    if not readable:
        print(
            "No readable export supplied. Produce the two exports first; the click path is in "
            "docs/revamp/BLOCKERS.md under step 0.4.",
            file=sys.stderr,
        )
        return 2

    slug_index, key_facts = build_slug_index()

    url_rows: list[dict] = []
    reason_rows: list[dict] = []
    daily_rows: list[dict] = []
    files_seen: list[dict] = []

    for target in readable:
        for label, header, rows in iter_csv_files(target):
            kind = classify(header)
            files_seen.append({"file": label, "kind": kind, "rows": len(rows)})
            if kind == "performance_pages":
                url_at = column(header, "url", "page", "top pages", "address")
                clicks_at = column(header, "clicks")
                impressions_at = column(header, "impressions")
                ctr_at = column(header, "ctr")
                position_at = column(header, "position")
                for row in rows:
                    if url_at is None or url_at >= len(row):
                        continue
                    url = row[url_at].strip()
                    record = {"url": url, "record_kind": "performance_pages", "source_file": label}
                    record["clicks"] = to_number(row[clicks_at]) if clicks_at is not None and clicks_at < len(row) else None
                    record["impressions"] = to_number(row[impressions_at]) if impressions_at is not None and impressions_at < len(row) else None
                    record["ctr"] = to_number(row[ctr_at]) if ctr_at is not None and ctr_at < len(row) else None
                    record["position"] = to_number(row[position_at]) if position_at is not None and position_at < len(row) else None
                    record.update(resolve(url, slug_index, key_facts))
                    url_rows.append(record)
            elif kind == "indexing_urls":
                url_at = column(header, "url", "page", "top pages", "address")
                crawled_at = column(header, "last crawled", "last crawl", "last crawled date")
                state_at = column(header, "reason", "coverage state", "status", "issue")
                for row in rows:
                    if url_at is None or url_at >= len(row):
                        continue
                    url = row[url_at].strip()
                    record = {
                        "url": url,
                        "record_kind": "indexing_urls",
                        "source_file": label,
                        "clicks": None,
                        "impressions": None,
                        "ctr": None,
                        "position": None,
                        "last_crawled": row[crawled_at].strip() if crawled_at is not None and crawled_at < len(row) else None,
                        "index_state": row[state_at].strip() if state_at is not None and state_at < len(row) else None,
                    }
                    record.update(resolve(url, slug_index, key_facts))
                    url_rows.append(record)
            elif kind == "indexing_reasons":
                reason_at = column(header, "reason")
                pages_at = column(header, "pages")
                source_at = column(header, "source")
                for row in rows:
                    if reason_at is None or reason_at >= len(row):
                        continue
                    reason_rows.append(
                        {
                            "reason": row[reason_at].strip(),
                            "source": row[source_at].strip() if source_at is not None and source_at < len(row) else None,
                            "pages": to_number(row[pages_at]) if pages_at is not None and pages_at < len(row) else None,
                            "source_file": label,
                        }
                    )
            elif kind in {"performance_dates", "coverage_chart"}:
                date_at = column(header, "date")
                for row in rows:
                    if date_at is None or date_at >= len(row):
                        continue
                    entry = {"date": row[date_at].strip(), "source_file": label, "kind": kind}
                    for name in ("clicks", "impressions", "indexed", "not indexed"):
                        at = column(header, name)
                        if at is not None and at < len(row):
                            entry[name.replace(" ", "_")] = to_number(row[at])
                    daily_rows.append(entry)

    if not url_rows and not reason_rows and not daily_rows:
        print(
            "The supplied exports held no Performance -> Pages table, no Indexing -> Pages table "
            "and no daily series. Check that the downloads are the two named in "
            "docs/revamp/BLOCKERS.md under step 0.4.",
            file=sys.stderr,
        )
        return 3

    out_dir = Path(arguments.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    columns = [
        "url", "record_kind", "slug", "corpus_key", "tier", "model", "disposition",
        "match_rule", "clicks", "impressions", "ctr", "position", "index_state",
        "last_crawled", "source_file",
    ]
    frame = pandas.DataFrame(url_rows, columns=columns) if url_rows else pandas.DataFrame(columns=columns)
    parquet_path = out_dir / "ingested.parquet"
    frame.to_parquet(parquet_path, index=False)

    # Per-tier totals over the performance rows; per-tier counts over the indexing rows.
    performance = frame[frame["record_kind"] == "performance_pages"]
    indexing = frame[frame["record_kind"] == "indexing_urls"]

    def tier_label(value) -> str:
        return value if isinstance(value, str) and value else "unmatched"

    per_tier: dict[str, dict] = defaultdict(lambda: {"pages": 0, "clicks": 0.0, "impressions": 0.0, "indexing_rows": 0})
    for _, row in performance.iterrows():
        bucket = per_tier[tier_label(row["tier"])]
        bucket["pages"] += 1
        bucket["clicks"] += row["clicks"] or 0
        bucket["impressions"] += row["impressions"] or 0
    for _, row in indexing.iterrows():
        per_tier[tier_label(row["tier"])]["indexing_rows"] += 1

    dispositions = Counter(
        (row["disposition"] if isinstance(row["disposition"], str) and row["disposition"] else "no disposition recorded")
        for _, row in frame.iterrows()
    )

    summary = {
        "schema": "rnawiki-revamp-gsc-ingest/v1",
        "step": "0.4",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "exports": [str(path) for path in readable],
        "files": files_seen,
        "rows": {"url_rows": len(url_rows), "reason_rows": len(reason_rows), "daily_rows": len(daily_rows)},
        "per_tier": {tier: dict(values) for tier, values in sorted(per_tier.items())},
        "per_disposition": dict(dispositions.most_common()),
        "indexing_reasons": reason_rows,
        "daily_series": daily_rows,
        "parquet": str(parquet_path),
    }
    summary_path = out_dir / "ingested-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")

    printed = 0
    print(f"parquet: {parquet_path}  rows={len(frame)}")
    print(f"{'tier':<12}{'pages':>8}{'clicks':>10}{'impressions':>14}{'indexing_rows':>15}")
    for tier, values in sorted(per_tier.items()):
        if printed >= PRINT_ROW_CAP:
            break
        print(f"{tier:<12}{values['pages']:>8}{values['clicks']:>10.0f}{values['impressions']:>14.0f}{values['indexing_rows']:>15}")
        printed += 1
    for disposition, count in dispositions.most_common():
        if printed >= PRINT_ROW_CAP:
            break
        print(f"disposition {disposition}: {count}")
        printed += 1
    for entry in reason_rows:
        if printed >= PRINT_ROW_CAP:
            break
        print(f"reason {entry['reason']}: {entry['pages']}")
        printed += 1
    print(f"summary: {summary_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
