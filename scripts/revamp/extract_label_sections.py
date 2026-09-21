"""Pull the held label sections the site never surfaced, for the records that can show them.

`data/sources/openfda-label/mapped.parquet` holds 124,706 rows of DailyMed Structured Product
Label text under CC0, and only three of its eleven sections ever became a page field
(`mechanismClass`, `interactions`, `indication`). The rest are extracted, licence-cleared, on disk
and unreachable.

This writes them to a small artifact the app can read, as **verbatim quotations with their own
citation**, never paraphrased. Rewriting a regulator's contraindication text is the slop this work
exists to remove, and a quotation needs no rewriting to be honest.

Two things the artifact must carry, both learned from the repository's own worked precedent
(`scripts/research/label-worked-metformin.md`):

* A `source_url` per row, so the reader can read the rest of the label at the source. The mapped
  parquet does **not** retain route, dosage form, SPL document id, version or application, so a
  quotation must be presented as one product's label rather than the substance as a whole.
* A `source_date`, so the reader knows which revision was quoted.

Usage:
    python3 scripts/revamp/extract_label_sections.py            # write the artifact
    python3 scripts/revamp/extract_label_sections.py --report    # counts and sizes only
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/sources/openfda-label/mapped.parquet"
OUT = ROOT / "data/sources/openfda-label/label-sections.json"

# The five sections that answer a task a reader actually has, in the order the consumer references
# lead with them: the regulator's strongest warning, who must not take it, what to watch for, who it
# was never studied in, and what happens if too much is taken.
SECTIONS = (
    "boxed_warning",
    "contraindications",
    "warnings_and_cautions",
    "use_in_specific_populations",
    "overdosage",
)

# The public records only: a reader can reach tier 1 and 2. Keeping tier 3 would multiply the
# artifact for pages that are noindex and reachable only by direct link.
MAX_TIER = 2

# A boxed warning fits well inside this. A long warnings section does not, so it is cut and the
# `source_url` beside it is how a reader reads the rest. Truncation is stated in the artifact.
MAX_CHARS = 2400

# The artifact is keyed by slug so the page can look its own sections up without a join. The parquet
# is keyed by corpus key, so the two are bridged here; a record whose key has no public slug is
# dropped, because no page can reach it.
DB = os.environ.get("RNAWIKI_AUDIT_DB", "rnawiki_indexing_audit_20260913")


def slug_by_key() -> dict[str, str]:
    query = "select key, slug from corpus_pages where slug is not null"
    done = subprocess.run(
        ["psql", "-d", DB, "-tAc", query], capture_output=True, text=True, check=True
    )
    mapping: dict[str, str] = {}
    for line in done.stdout.splitlines():
        if "|" in line:
            key, slug = line.split("|", 1)
            mapping[key] = slug
    return mapping


def blocks(value: str) -> list[str]:
    """`value` is a JSON array of label blocks. Fall back to the raw string when it is not."""
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return [value.strip()] if value else []
    if isinstance(parsed, list):
        return [str(block).strip() for block in parsed if str(block).strip()]
    return [str(parsed).strip()]


def main() -> None:
    report_only = "--report" in sys.argv
    table = pq.read_table(
        SOURCE,
        columns=[
            "key",
            "tier",
            "field",
            "value",
            "source_url",
            "source_record_id",
            "source_date",
            "licence",
        ],
    )

    out: dict[str, dict] = {}
    kept_rows = 0
    dropped_tier = 0
    truncated = 0

    columns = {name: table.column(name).to_pylist() for name in table.schema.names}
    for index in range(table.num_rows):
        field = columns["field"][index]
        if field not in SECTIONS:
            continue
        tier = columns["tier"][index]
        if tier is not None and int(tier) > MAX_TIER:
            dropped_tier += 1
            continue

        text = " ".join(blocks(columns["value"][index]))
        if not text:
            continue
        cut = False
        if len(text) > MAX_CHARS:
            text = text[:MAX_CHARS].rstrip()
            cut = True
            truncated += 1

        key = columns["key"][index]
        entry = out.setdefault(key, {"sections": {}})
        section = entry["sections"].setdefault(field, {})
        section["text"] = text
        if cut:
            section["truncated"] = True
        section["sourceUrl"] = columns["source_url"][index]
        section["sourceRecordId"] = columns["source_record_id"][index]
        section["sourceDate"] = columns["source_date"][index]
        section["licence"] = columns["licence"][index]
        kept_rows += 1

    slugs = slug_by_key()
    by_slug: dict[str, dict] = {}
    for key, entry in out.items():
        slug = slugs.get(key)
        if not slug:
            continue
        entry["key"] = key
        by_slug[slug] = entry

    payload = {
        "note": (
            "Verbatim DailyMed Structured Product Label text, CC0, quoted with its own citation. "
            "Each entry is one product's label, not the substance as a whole: the source parquet "
            "does not retain route, dosage form, SPL document id or application. Sections over "
            f"{MAX_CHARS} characters are cut, and `truncated` says so; read the rest at sourceUrl."
        ),
        "sections": list(SECTIONS),
        "maxChars": MAX_CHARS,
        "records": by_slug,
    }

    print(f"keys with at least one section: {len(out)}")
    print(f"reachable by slug:             {len(by_slug) if not report_only else len(out)}")
    print(f"section rows kept:             {kept_rows}")
    print(f"rows dropped as tier > {MAX_TIER}:   {dropped_tier}")
    print(f"rows truncated:                {truncated}")
    for field in SECTIONS:
        pages = sum(1 for entry in out.values() if field in entry["sections"])
        print(f"  {field:32} {pages} records")

    if report_only:
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    print(f"\nwrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    main()
