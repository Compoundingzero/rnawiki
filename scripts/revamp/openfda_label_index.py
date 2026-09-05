"""Pass 1 of the openFDA drug-label ingest: build a text-free record index.

Streams all fourteen label archives and writes one row per SPL record holding
only the identity, provenance and section-presence columns. The index is small
enough to join against the corpus in memory, which lets pass 2
(`openfda_label_map.py`) re-stream the archives and pull section text for the
retained set_ids alone. One parquet shard is written per archive as it
completes, so the pass resumes from the last finished archive.

    .venv-corpus/bin/python scripts/revamp/openfda_label_index.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from openfda_label_stream import iter_label_records  # noqa: E402

ARCHIVE_DIR = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/openfda"
)
OUT_DIR = Path("data/sources/openfda-label/2026-09-05/parsed")
SHARD_DIR = OUT_DIR / "index-shards"

SECTIONS = [
    "indications_and_usage",
    "contraindications",
    "warnings_and_cautions",
    "drug_interactions",
    "use_in_specific_populations",
    "overdosage",
    "mechanism_of_action",
    "pharmacokinetics",
    "clinical_pharmacology",
    "boxed_warning",
]

SCHEMA = pa.schema(
    [
        ("archive", pa.string()),
        ("ordinal", pa.int32()),
        ("set_id", pa.string()),
        ("spl_id", pa.string()),
        ("effective_time", pa.int32()),
        ("version", pa.int32()),
        ("unii", pa.list_(pa.string())),
        ("rxcui", pa.list_(pa.string())),
        ("generic_name", pa.list_(pa.string())),
        ("substance_name", pa.list_(pa.string())),
        ("brand_name", pa.list_(pa.string())),
        ("product_type", pa.list_(pa.string())),
        ("route", pa.list_(pa.string())),
        ("application_number", pa.list_(pa.string())),
        ("section_chars", pa.list_(pa.int64())),
        ("sections_present", pa.list_(pa.string())),
    ]
)


def as_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v is not None]
    return [str(value)]


def safe_int(value, limit: int = 2_000_000_000) -> int:
    """A digit string outside the int32 column range is recorded as 0, never guessed."""
    text = str(value or "").strip()
    if not text.isdigit():
        return 0
    number = int(text)
    return number if number <= limit else 0


def empty_rows() -> dict[str, list]:
    return {name: [] for name in SCHEMA.names}


def main() -> None:
    SHARD_DIR.mkdir(parents=True, exist_ok=True)
    archives = sorted(ARCHIVE_DIR.glob("label-*.zip"))
    if len(archives) != 14:
        raise SystemExit(f"expected 14 label archives, found {len(archives)}")

    started = time.time()
    total = 0
    for archive in archives:
        shard = SHARD_DIR / f"{archive.stem}.parquet"
        if shard.exists():
            total += pq.read_metadata(shard).num_rows
            print(f"{archive.name}: shard present, {total} rows so far", flush=True)
            continue
        rows = empty_rows()
        for ordinal, rec in iter_label_records(archive):
            of = rec.get("openfda") or {}
            chars = [sum(len(t) for t in as_list(rec.get(s))) for s in SECTIONS]
            eff = str(rec.get("effective_time") or "")
            rows["archive"].append(archive.name)
            rows["ordinal"].append(ordinal)
            rows["set_id"].append(rec.get("set_id") or "")
            rows["spl_id"].append(rec.get("id") or "")
            rows["effective_time"].append(safe_int(eff) if len(eff) == 8 else 0)
            rows["version"].append(safe_int(rec.get("version")))
            rows["unii"].append(as_list(of.get("unii")))
            rows["rxcui"].append(as_list(of.get("rxcui")))
            rows["generic_name"].append(as_list(of.get("generic_name")))
            rows["substance_name"].append(as_list(of.get("substance_name")))
            rows["brand_name"].append(as_list(of.get("brand_name")))
            rows["product_type"].append(as_list(of.get("product_type")))
            rows["route"].append(as_list(of.get("route")))
            rows["application_number"].append(as_list(of.get("application_number")))
            rows["section_chars"].append(chars)
            rows["sections_present"].append(
                [SECTIONS[i] for i, c in enumerate(chars) if c > 0]
            )
        pq.write_table(pa.table(rows, schema=SCHEMA), shard, compression="zstd")
        total += len(rows["archive"])
        print(
            f"{archive.name}: {len(rows['archive'])} records, running total {total}, "
            f"{round(time.time() - started)}s",
            flush=True,
        )

    table = pa.concat_tables(
        [pq.read_table(SHARD_DIR / f"{a.stem}.parquet") for a in archives]
    )
    out = OUT_DIR / "label-index.parquet"
    pq.write_table(table, out, compression="zstd")
    set_ids = set(table.column("set_id").to_pylist())
    (OUT_DIR / "label-index-summary.json").write_text(
        json.dumps(
            {
                "archives": [a.name for a in archives],
                "records": table.num_rows,
                "distinct_set_ids": len(set_ids),
                "sections_indexed": SECTIONS,
                "seconds": round(time.time() - started, 1),
                "output": str(out),
            },
            indent=2,
        )
        + "\n"
    )
    print(f"wrote {out} with {table.num_rows} rows")


if __name__ == "__main__":
    main()
