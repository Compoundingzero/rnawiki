"""Pass 3 of the openFDA drug-label ingest: deduplicate shards and report coverage.

Collapses the per-archive shards to one row per (page, field, distinct value),
keeping the newest label that carries that value, and writes mapped.parquet and
coverage.json.

    .venv-corpus/bin/python scripts/revamp/openfda_label_finalise.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import duckdb

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index  # noqa: E402
from openfda_label_index import SECTIONS  # noqa: E402

DATE = "2026-09-05"
BASE = Path("data/sources/openfda-label")
PARSED = BASE / DATE / "parsed"
SHARDS = PARSED / "shards"
MAPPED = BASE / "mapped.parquet"
COVERAGE = BASE / "coverage.json"


def main() -> None:
    idx = load_corpus_index()
    con = duckdb.connect()
    con.execute("PRAGMA memory_limit='6GB'")
    con.execute(f"PRAGMA temp_directory='{PARSED / 'duckdb-temp'}'")
    shard_glob = str(SHARDS / "*.parquet")

    con.execute(
        f"""
        CREATE TABLE deduped AS
        SELECT key, tier, field, value, source_record_id, source_url, source_date,
               match_rule, form_of_target, licence
        FROM (
            SELECT *, row_number() OVER (
                PARTITION BY key, field, value_hash
                ORDER BY effective_time DESC, version DESC, source_record_id
            ) AS rn
            FROM read_parquet('{shard_glob}')
        )
        WHERE rn = 1
        """
    )
    con.execute(
        f"""
        COPY (SELECT key, tier, field, value, source_record_id, source_url,
                     source_date, match_rule, form_of_target, licence
              FROM deduped ORDER BY tier, key, field, source_date DESC)
        TO '{MAPPED}' (FORMAT PARQUET, COMPRESSION ZSTD)
        """
    )

    raw_rows = con.execute(
        f"SELECT count(*) FROM read_parquet('{shard_glob}')"
    ).fetchone()[0]
    mapped_rows = con.execute("SELECT count(*) FROM deduped").fetchone()[0]

    pages_by_tier = {
        str(t): n
        for t, n in con.execute(
            "SELECT tier, count(DISTINCT key) FROM deduped GROUP BY tier ORDER BY tier"
        ).fetchall()
    }
    rows_by_rule = {
        r: n
        for r, n in con.execute(
            "SELECT match_rule, count(*) FROM deduped GROUP BY match_rule"
        ).fetchall()
    }
    pages_by_rule = {
        r: n
        for r, n in con.execute(
            "SELECT match_rule, count(DISTINCT key) FROM deduped GROUP BY match_rule"
        ).fetchall()
    }

    fields_by_tier: dict[str, dict[str, int]] = {"1": {}, "2": {}, "3": {}}
    for tier, field, pages in con.execute(
        "SELECT tier, field, count(DISTINCT key) FROM deduped GROUP BY tier, field"
    ).fetchall():
        fields_by_tier[str(tier)][field] = pages

    cyp = con.execute(
        """
        SELECT count(*) AS rows, count(DISTINCT key) AS pages
        FROM deduped WHERE field = 'cyp_profile'
        """
    ).fetchone()
    cyp_roles = {
        r: n
        for r, n in con.execute(
            """
            SELECT json_extract_string(value, '$.role'), count(*)
            FROM deduped WHERE field = 'cyp_profile' GROUP BY 1
            """
        ).fetchall()
    }
    cyp_basis = {
        b: n
        for b, n in con.execute(
            """
            SELECT json_extract_string(value, '$.basis'), count(*)
            FROM deduped WHERE field = 'cyp_profile' GROUP BY 1
            """
        ).fetchall()
    }
    cyp_top = con.execute(
        """
        SELECT json_extract_string(value, '$.enzyme') AS enzyme,
               count(DISTINCT key) AS pages
        FROM deduped WHERE field = 'cyp_profile'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 20
        """
    ).fetchall()

    stats = json.loads((PARSED / "map-stats.json").read_text())
    index_summary = json.loads((PARSED / "label-index-summary.json").read_text())
    candidates = [
        json.loads(line)
        for line in (BASE / "name-candidates.ndjson").read_text().splitlines()
        if line.strip()
    ]

    corpus_totals = {str(t): sum(1 for v in idx.tier.values() if v == t) for t in (1, 2, 3)}
    coverage = {
        "source": "openfda-label",
        "source_description": "openFDA drug label bulk JSON (DailyMed Structured Product "
        "Labeling), 14-partition export retrieved 2026-08-28",
        "retrieved": "2026-08-28",
        "processed": DATE,
        "licence": "CC0 1.0 Universal (public domain dedication)",
        "licence_url": "https://open.fda.gov/license/",
        "records_in_export": index_summary["records"],
        "distinct_set_ids": stats["distinct_set_ids"],
        "superseded_records_dropped": stats["superseded_records"],
        "unmatched_records": stats["unmatched_records"],
        "records_resolved_by_unii": stats["resolved_by_unii"],
        "records_resolved_by_rxcui": stats["resolved_by_rxcui"],
        "corpus_pages_by_tier": corpus_totals,
        "pages_matched_by_tier": pages_by_tier,
        "pages_matched_pct_by_tier": {
            t: round(100.0 * pages_by_tier.get(t, 0) / corpus_totals[t], 2)
            for t in ("1", "2", "3")
        },
        "fields_gained_by_tier": fields_by_tier,
        "fields": SECTIONS + ["cyp_profile"],
        "rows_before_dedup": raw_rows,
        "rows_in_mapped_parquet": mapped_rows,
        "rows_by_match_rule": rows_by_rule,
        "pages_by_match_rule": pages_by_rule,
        "combination_pages_reached_via_components": len(
            stats["combination_pages_reached"]
        ),
        "cyp_profile": {
            "rows": cyp[0],
            "pages": cyp[1],
            "by_role": cyp_roles,
            "by_basis": cyp_basis,
            "top_enzymes_by_pages": [{"enzyme": e, "pages": p} for e, p in cyp_top],
            "mentions_with_no_assignable_role": stats["cyp_mentions_unassigned"],
        },
        "name_candidates_sent_to_review": {
            "distinct_normalised_names": len(candidates),
            "label_records_behind_them": sum(c["label_records"] for c in candidates),
            "corpus_pages_touched": len({k for c in candidates for k in c["corpus_keys"]}),
            "file": str(BASE / "name-candidates.ndjson"),
            "rule": "mapping rule (d): a normalised-name hit is a candidate only and "
            "carries no field value into mapped.parquet until a UNII or InChIKey "
            "confirms it; these go to the Phase 3 review list",
        },
        "match_rule_note": "match_rule 'rxcui' records an exact openfda.rxcui to page "
        "rxcui identifier match. It is the second mapping route named in the Phase 2 "
        "brief for this source and sits between rule (a) and rule (d); it is kept as "
        "its own value rather than folded into 'unii' or 'name-candidate'.",
    }
    COVERAGE.write_text(json.dumps(coverage, indent=2) + "\n")
    print(json.dumps({k: coverage[k] for k in (
        "records_in_export", "unmatched_records", "pages_matched_by_tier",
        "rows_in_mapped_parquet", "rows_by_match_rule",
    )}, indent=2))
    print("wrote", MAPPED, "and", COVERAGE)


if __name__ == "__main__":
    main()
