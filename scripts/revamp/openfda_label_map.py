"""Pass 2 of the openFDA drug-label ingest: map SPL sections onto corpus pages.

Reads the pass-1 index, resolves every SPL record to corpus pages with the
mapping rules of the revamp spec, re-streams the fourteen archives to pull
section text for the resolved records only, and writes the per-archive row
shards that `openfda_label_finalise.py` deduplicates into mapped.parquet.

    .venv-corpus/bin/python scripts/revamp/openfda_label_map.py
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index, normalise_name  # noqa: E402
from openfda_label_cyp import extract as extract_cyp  # noqa: E402
from openfda_label_index import SECTIONS, as_list  # noqa: E402
from openfda_label_stream import iter_label_records  # noqa: E402

ARCHIVE_DIR = Path(
    "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/openfda"
)
DATE = "2026-09-05"
BASE = Path("data/sources/openfda-label")
PARSED = BASE / DATE / "parsed"
SHARDS = PARSED / "shards"
LICENCE = "CC0 1.0 Universal (public domain dedication)"
SOURCE_URL = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={set_id}"

WS = re.compile(r"\s+")


def value_hash(text: str) -> str:
    return hashlib.sha256(WS.sub(" ", text.strip().lower()).encode()).hexdigest()[:32]


def iso_date(effective_time: int) -> str:
    s = str(effective_time)
    if len(s) == 8 and s.isdigit():
        return f"{s[0:4]}-{s[4:6]}-{s[6:8]}"
    return ""


def resolve(idx, unii, rxcui, generic, substance) -> tuple[dict[str, str], list[str]]:
    """Return ({page key: match rule}, [normalised names that only matched by name])."""
    matched: dict[str, str] = {}
    for u in unii:
        for key in idx.unii_to_keys.get(u.strip().upper(), ()):
            matched.setdefault(key, "unii")
    if not matched:
        for r in rxcui:
            for key in idx.rxcui_to_keys.get(str(r).strip(), ()):
                matched.setdefault(key, "rxcui")
    candidates: list[str] = []
    if not matched:
        for raw in list(generic) + list(substance):
            for part in re.split(r"\s+and\s+|,|;|/", raw):
                norm = normalise_name(part, idx.salts)
                if len(norm) >= 3 and norm in idx.name_to_keys:
                    candidates.append(norm)
    elif len(matched) >= 2:
        pages = set(matched)
        for combo_key, components in idx.combination_components.items():
            if combo_key not in matched and components and components <= pages:
                matched[combo_key] = "unii"
    return matched, sorted(set(candidates))


SCHEMA = pa.schema(
    [
        ("key", pa.string()),
        ("tier", pa.int8()),
        ("field", pa.string()),
        ("value", pa.string()),
        ("source_record_id", pa.string()),
        ("source_url", pa.string()),
        ("source_date", pa.string()),
        ("match_rule", pa.string()),
        ("form_of_target", pa.string()),
        ("licence", pa.string()),
        ("value_hash", pa.string()),
        ("effective_time", pa.int32()),
        ("version", pa.int32()),
    ]
)


def main() -> None:
    SHARDS.mkdir(parents=True, exist_ok=True)
    idx = load_corpus_index()
    index_table = pq.read_table(PARSED / "label-index.parquet")
    print(f"index rows: {index_table.num_rows}", flush=True)

    cols = index_table.to_pydict()
    # Newest record wins per set_id; ties break on the higher SPL version.
    best: dict[str, tuple[int, int, str, int]] = {}
    for i in range(index_table.num_rows):
        sid = cols["set_id"][i]
        if not sid:
            continue
        rank = (cols["effective_time"][i], cols["version"][i])
        cur = best.get(sid)
        if cur is None or rank > (cur[0], cur[1]):
            best[sid] = (rank[0], rank[1], cols["archive"][i], cols["ordinal"][i])

    keep: dict[tuple[str, int], dict] = {}
    name_candidates: dict[str, dict] = {}
    stats = {
        "index_rows": index_table.num_rows,
        "distinct_set_ids": len(best),
        "superseded_records": index_table.num_rows - len(best),
        "resolved_by_unii": 0,
        "resolved_by_rxcui": 0,
        "unmatched_records": 0,
        "combination_pages_reached": set(),
        "unmatched_by_product_type": {},
        "unmatched_without_any_unii": 0,
        "unmatched_without_any_wanted_section": 0,
        "unmatched_distinct_uniis": 0,
    }
    unmatched_uniis: dict[str, dict] = {}

    for i in range(index_table.num_rows):
        sid = cols["set_id"][i]
        if not sid:
            stats["unmatched_records"] += 1
            continue
        chosen = best[sid]
        if (chosen[2], chosen[3]) != (cols["archive"][i], cols["ordinal"][i]):
            continue
        matched, candidates = resolve(
            idx, cols["unii"][i], cols["rxcui"][i],
            cols["generic_name"][i], cols["substance_name"][i],
        )
        if matched:
            rules = set(matched.values())
            if "unii" in rules:
                stats["resolved_by_unii"] += 1
            else:
                stats["resolved_by_rxcui"] += 1
            for k in matched:
                if k in idx.combination_components:
                    stats["combination_pages_reached"].add(k)
            keep[(cols["archive"][i], cols["ordinal"][i])] = {
                "set_id": sid,
                "effective_time": cols["effective_time"][i],
                "version": cols["version"][i],
                "matched": matched,
                "names": list(cols["generic_name"][i]) + list(cols["substance_name"][i])
                + list(cols["brand_name"][i]),
            }
        else:
            stats["unmatched_records"] += 1
            ptype = (cols["product_type"][i] or ["UNSTATED"])[0]
            stats["unmatched_by_product_type"][ptype] = (
                stats["unmatched_by_product_type"].get(ptype, 0) + 1
            )
            if not cols["unii"][i]:
                stats["unmatched_without_any_unii"] += 1
            if not any(cols["sections_present"][i]):
                stats["unmatched_without_any_wanted_section"] += 1
            for u in cols["unii"][i]:
                token = u.strip().upper()
                if not token:
                    continue
                seen = unmatched_uniis.setdefault(
                    token, {"unii": token, "labels": 0, "names": [], "product_types": []}
                )
                seen["labels"] += 1
                for name in list(cols["substance_name"][i])[:4]:
                    if name not in seen["names"] and len(seen["names"]) < 6:
                        seen["names"].append(name)
                for ptype in cols["product_type"][i]:
                    if ptype not in seen["product_types"]:
                        seen["product_types"].append(ptype)
            for norm in candidates:
                entry = name_candidates.setdefault(
                    norm,
                    {
                        "normalised_name": norm,
                        "corpus_keys": idx.name_to_keys[norm],
                        "corpus_tiers": [idx.tier_of(k) for k in idx.name_to_keys[norm]],
                        "label_set_ids": [],
                        "label_records": 0,
                        "confirmation_needed": "UNII or InChIKey; the label carries neither "
                        "a UNII nor an RxCUI that resolves to a corpus page",
                    },
                )
                entry["label_records"] += 1
                if len(entry["label_set_ids"]) < 25:
                    entry["label_set_ids"].append(sid)

    print(
        f"records kept: {len(keep)}  unmatched: {stats['unmatched_records']}  "
        f"name candidates: {len(name_candidates)}",
        flush=True,
    )

    by_archive: dict[str, dict[int, dict]] = {}
    for (archive, ordinal), rec in keep.items():
        by_archive.setdefault(archive, {})[ordinal] = rec

    cyp_unassigned = 0
    started = time.time()
    for archive in sorted(ARCHIVE_DIR.glob("label-*.zip")):
        wanted = by_archive.get(archive.name, {})
        shard = SHARDS / f"{archive.stem}.parquet"
        if shard.exists():
            print(
                f"{archive.name}: shard present with "
                f"{pq.read_metadata(shard).num_rows} rows, not re-extracted",
                flush=True,
            )
            continue
        rows = {name: [] for name in SCHEMA.names}
        writer = pq.ParquetWriter(shard, SCHEMA, compression="zstd")
        written = 0

        def flush() -> None:
            nonlocal rows, written
            if not rows["key"]:
                return
            writer.write_table(pa.table(rows, schema=SCHEMA))
            written += len(rows["key"])
            rows = {name: [] for name in SCHEMA.names}

        if not wanted:
            writer.close()
            continue
        for ordinal, rec in iter_label_records(archive):
            meta = wanted.get(ordinal)
            if meta is None:
                continue
            sections = {s: as_list(rec.get(s)) for s in SECTIONS}
            entries, unassigned = extract_cyp(sections, meta["names"])
            cyp_unassigned += unassigned
            source_url = SOURCE_URL.format(set_id=meta["set_id"])
            source_date = iso_date(meta["effective_time"])
            payloads: list[tuple[str, str, str]] = []
            for section, blocks in sections.items():
                if not blocks:
                    continue
                payloads.append((section, json.dumps(blocks), value_hash(" ".join(blocks))))
            for entry in entries:
                payload = dict(entry, set_id=meta["set_id"])
                payloads.append((
                    "cyp_profile",
                    json.dumps(payload),
                    value_hash("|".join([
                        entry["enzyme"], entry["role"], entry["strength"] or "",
                        entry["basis"],
                    ])),
                ))
            for key, rule in meta["matched"].items():
                tier = idx.tier_of(key)
                for field, value, vhash in payloads:
                    rows["key"].append(key)
                    rows["tier"].append(tier)
                    rows["field"].append(field)
                    rows["value"].append(value)
                    rows["source_record_id"].append(meta["set_id"])
                    rows["source_url"].append(source_url)
                    rows["source_date"].append(source_date)
                    rows["match_rule"].append(rule)
                    rows["form_of_target"].append(None)
                    rows["licence"].append(LICENCE)
                    rows["value_hash"].append(vhash)
                    rows["effective_time"].append(meta["effective_time"])
                    rows["version"].append(meta["version"])
            if len(rows["key"]) >= 100_000:
                flush()
        flush()
        writer.close()
        print(
            f"{archive.name}: {len(wanted)} labels -> {written} rows "
            f"({round(time.time() - started)}s)",
            flush=True,
        )

    stats["combination_pages_reached"] = sorted(stats["combination_pages_reached"])
    stats["unmatched_distinct_uniis"] = len(unmatched_uniis)
    with (BASE / "unmatched-uniis.ndjson").open("w") as fh:
        for entry in sorted(unmatched_uniis.values(), key=lambda e: -e["labels"]):
            fh.write(json.dumps(entry) + "\n")
    previous = PARSED / "map-stats.json"
    if cyp_unassigned == 0 and previous.exists():
        cyp_unassigned = json.loads(previous.read_text()).get("cyp_mentions_unassigned", 0)
    stats["cyp_mentions_unassigned"] = cyp_unassigned
    (PARSED / "map-stats.json").write_text(json.dumps(stats, indent=2) + "\n")
    with (BASE / "name-candidates.ndjson").open("w") as fh:
        for entry in sorted(name_candidates.values(), key=lambda e: -e["label_records"]):
            fh.write(json.dumps(entry) + "\n")
    print("shards written to", SHARDS)


if __name__ == "__main__":
    main()
