"""Pass 2 of the openFDA drug-label ingest: map SPL sections onto corpus pages.

Reads the pass-1 index, resolves every SPL record to corpus pages with the
mapping rules of the revamp spec, re-streams the fourteen archives to pull
section text for the resolved records only, and writes the per-archive row
shards that `openfda_label_finalise.py` deduplicates into mapped.parquet.

    .venv-corpus/bin/python scripts/revamp/openfda_label_map.py

Two rules from `docs/specs/phase4-generators.md` §15 item 2 decide which SPL
reaches a page, and both are applied here rather than downstream, because a
label that should never have been joined must not be written into the shards at
all.

**The page's own UNII has to be among the label's active ingredients.** The
corpus index holds, per page, the UNII the page's key carries and the UNII its
`unii` field carries (`corpus_join.load_corpus_index`), and a page is matched
only when one of those appears in `openfda.unii`. The RxCUI fallback is gone: an
RxCUI names a clinical drug concept, not the substance the page is, and it
cannot answer the question this rule asks. A combination page is reached only
when every one of its components was matched by UNII on the same label, which is
the same test applied to each component in turn.

**Unapproved product categories are excluded.** Acetyldigitoxin was quoting a
homeopathic cosmetology label and a nail liquid's directions were rendering as
an indication, both by way of a correct UNII match onto a product that is not an
approved medicine. A label is dropped when any of these holds:

  * an active ingredient name or SPL product data element carries ``[HPUS]``
    (the Homeopathic Pharmacopoeia marker);
  * an ``openfda.product_type`` or ``openfda.route`` string names a homeopathic
    product;
  * a product name ends in homeopathic potency notation (``30C``, ``7X``,
    ``200CK``, ``LM3``) and no NDA, ANDA or BLA is recorded beside it
    (§19 item 1);
  * the FDA NDC directory's marketing category for this SPL names
    ``HOMEOPATHIC`` or ``UNAPPROVED`` (``UNAPPROVED HOMEOPATHIC``,
    ``UNAPPROVED DRUG OTHER``, ``UNAPPROVED MEDICAL GAS``, and the drug-shortage
    category);
  * the word "homeopathic" or "anthroposophic" appears in the label's purpose,
    indications or description (§19 item 1 adds the purpose section and the
    anthroposophic word: "for constitutional treatments based on homeopathic and
    anthroposophic indications" is not an indication of the substance);
  * the label carries no ``openfda.application_number`` and its product type is
    neither ``HUMAN PRESCRIPTION DRUG`` nor ``HUMAN OTC DRUG``.

Every drop is counted by reason in `map-stats.json`, with the pages that lose
every label and the pages that lose some. The set ids the index-level tests
exclude are written to `parsed/excluded-set-ids.json` for every indexed label,
matched or not, beside the record-level exclusions of the labels that were
streamed; `scripts/corpus-20k/tiers/assign-models.py` reads that file so the
`otc-label` ground for the model assignment and the label mapping refuse the
same SPLs.
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

def _archive_dir() -> Path:
    """The bulk-download directory, beside the repository rather than under it.

    The ingest tree is a sibling of the checkout (`../rnawiki-ingest-data`), so a
    second checkout of the same branch reads the same 2.1 GB of archives instead
    of a path that names one machine's first checkout.
    """
    candidate = Path(__file__).resolve().parents[2].parent / "rnawiki-ingest-data" / "openfda"
    if candidate.is_dir():
        return candidate
    raise SystemExit(f"openFDA label archives not found at {candidate}")


ARCHIVE_DIR = _archive_dir()
NDC_FILE = ARCHIVE_DIR / "drug-ndc-0001-of-0001.json"
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
    """Return ({page key: match rule}, [normalised names that only matched by name]).

    §15(2): a page is matched only where the UNII its key or its `unii` field
    carries is one of the label's own `openfda.unii` values. `idx.unii_to_keys`
    is built from exactly those two identifiers, so a hit in it *is* that test.
    A combination page joins only when every component it names was matched by
    UNII on this label.
    """
    matched: dict[str, str] = {}
    for u in unii:
        for key in idx.unii_to_keys.get(u.strip().upper(), ()):
            matched.setdefault(key, "unii")
    candidates: list[str] = []
    if not matched:
        for raw in list(generic) + list(substance):
            for part in re.split(r"\s+and\s+|,|;|/", raw):
                norm = normalise_name(part, idx.salts)
                if len(norm) >= 3 and norm in idx.name_to_keys:
                    candidates.append(norm)
    elif len(matched) >= 2:
        pages = {key for key, rule in matched.items() if rule == "unii"}
        for combo_key, components in idx.combination_components.items():
            if combo_key not in matched and components and components <= pages:
                matched[combo_key] = "unii"
    return matched, sorted(set(candidates))


HOMEOPATHIC = re.compile(r"homeopath|anthroposoph", re.I)
HPUS = re.compile(r"\[\s*HPUS\s*\]", re.I)
HUMAN_DRUG_TYPES = {"HUMAN PRESCRIPTION DRUG", "HUMAN OTC DRUG"}

# §19 item 1: homeopathic potency notation, as the Homeopathic Pharmacopoeia writes it — a decimal
# (X), centesimal (C), Korsakovian (CK) or fifty-millesimal (LM) dilution — and as a product name
# carries it, which is as the name's last token ("Arnica Montana 200C", "Sulphur 12X", "Stannum
# Pentas 7X, 11X, 18X, 30X"). The position matters: "Technetium Tc 99M Sestamibi" is an approved
# radiopharmaceutical whose isotope number sits mid-name, "3M Skin and Nasal Antiseptic" and
# "4X Medicated Toothache and Gum Gel" carry the token first, and none of the three is a dilution.
POTENCY_TOKEN = re.compile(r"\A(?:\d+\s?(?:CK|[XCM])|LM\s?\d+)\Z", re.I)
# The register's own mark of an approval on a label. Measured over the 262,271 indexed labels: no
# label whose product name ends in a potency token carries one, so the conjunction removes nothing
# a register approved and protects any later product whose name happens to end in such a token.
APPROVAL_APPLICATION = re.compile(r"^(?:NDA|ANDA|BLA)", re.I)


def ends_in_potency(name: str) -> bool:
    """True where the product name's last token is a homeopathic potency."""
    parts = str(name).strip().rstrip(".;,").split()
    if not parts:
        return False
    return bool(POTENCY_TOKEN.match(parts[-1].rstrip(".;,")))


def load_marketing_categories() -> dict[str, set[str]]:
    """SPL document id -> the marketing categories the NDC directory records for it.

    The label archives carry no marketing category; the NDC directory carries one
    per product and names the SPL it was listed under, so the join is the
    register's own link between the two files.
    """
    by_spl: dict[str, set[str]] = {}
    with NDC_FILE.open(encoding="utf-8") as handle:
        rows = json.load(handle)["results"]
    for row in rows:
        category = str(row.get("marketing_category") or "").upper().strip()
        if not category:
            continue
        spl = row.get("spl_id")
        for value in spl if isinstance(spl, list) else [spl]:
            if value:
                by_spl.setdefault(str(value), set()).add(category)
    return by_spl


def index_exclusion(product_type, route, application_number, categories, names=()) -> str | None:
    """The exclusion reason readable from the index row and the NDC categories, or None."""
    types = {str(p).upper().strip() for p in product_type if p}
    routes = {str(r).upper().strip() for r in route if r}
    apps = [str(a).strip() for a in application_number if a and str(a).strip()]
    if any(HOMEOPATHIC.search(value) for value in types | routes):
        return "openFDA product type or route names a homeopathic product"
    if any("HOMEOPATHIC" in category for category in categories):
        return "NDC marketing category names a homeopathic product"
    if any("UNAPPROVED" in category for category in categories):
        return "NDC marketing category names an unapproved product"
    if not apps and not (types & HUMAN_DRUG_TYPES):
        return "no application number and not a human prescription or OTC drug product"
    if any(ends_in_potency(name) for name in names if name) and not any(
        APPROVAL_APPLICATION.match(app) for app in apps
    ):
        return (
            "a product name ends in homeopathic potency notation and no NDA, ANDA or BLA "
            "is recorded"
        )
    return None


def record_exclusion(record) -> str | None:
    """The exclusion reason readable only from the full SPL record, or None."""
    ingredients = as_list(record.get("spl_product_data_elements")) + as_list(
        record.get("active_ingredient")
    )
    if any(HPUS.search(text) for text in ingredients):
        return "an active ingredient carries the [HPUS] homeopathic marker"
    prose = (
        as_list(record.get("purpose"))
        + as_list(record.get("indications_and_usage"))
        + as_list(record.get("description"))
    )
    if any(HOMEOPATHIC.search(text) for text in prose):
        return (
            "the purpose, indications or description name the product homeopathic or "
            "anthroposophic"
        )
    return None


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

    categories = load_marketing_categories()
    print(f"NDC marketing categories for {len(categories)} SPL documents", flush=True)

    keep: dict[tuple[str, int], dict] = {}
    name_candidates: dict[str, dict] = {}
    stats = {
        "index_rows": index_table.num_rows,
        "distinct_set_ids": len(best),
        "superseded_records": index_table.num_rows - len(best),
        "resolved_by_unii": 0,
        "unmatched_records": 0,
        "combination_pages_reached": set(),
        "unmatched_by_product_type": {},
        "unmatched_without_any_unii": 0,
        "unmatched_without_any_wanted_section": 0,
        "unmatched_distinct_uniis": 0,
        "excluded_labels": 0,
        "excluded_by_reason": {},
        "pages_reached_before_exclusion": 0,
        "pages_reached_after_exclusion": 0,
        "pages_losing_every_label": 0,
        "pages_losing_some_labels": 0,
    }
    unmatched_uniis: dict[str, dict] = {}
    excluded_set_ids: dict[str, str] = {}
    pages_before: set[str] = set()
    pages_after: set[str] = set()
    excluded_pages: set[str] = set()

    for i in range(index_table.num_rows):
        sid = cols["set_id"][i]
        if not sid:
            stats["unmatched_records"] += 1
            continue
        chosen = best[sid]
        if (chosen[2], chosen[3]) != (cols["archive"][i], cols["ordinal"][i]):
            continue
        index_reason = index_exclusion(
            cols["product_type"][i],
            cols["route"][i],
            cols["application_number"][i],
            categories.get(cols["spl_id"][i], set()),
            list(cols["brand_name"][i])
            + list(cols["generic_name"][i])
            + list(cols["substance_name"][i]),
        )
        if index_reason is not None:
            excluded_set_ids[sid] = index_reason
        matched, candidates = resolve(
            idx, cols["unii"][i], cols["rxcui"][i],
            cols["generic_name"][i], cols["substance_name"][i],
        )
        if matched:
            stats["resolved_by_unii"] += 1
            pages_before.update(matched)
            reason = index_reason
            if reason is not None:
                stats["excluded_labels"] += 1
                stats["excluded_by_reason"][reason] = (
                    stats["excluded_by_reason"].get(reason, 0) + 1
                )
                excluded_pages.update(matched)
                continue
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
            stats["shards_reused"] = stats.get("shards_reused", 0) + 1
            for rec in wanted.values():
                pages_after.update(rec["matched"])
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
            reason = record_exclusion(rec)
            if reason is not None:
                excluded_set_ids[meta["set_id"]] = reason
                stats["excluded_labels"] += 1
                stats["excluded_by_reason"][reason] = (
                    stats["excluded_by_reason"].get(reason, 0) + 1
                )
                excluded_pages.update(meta["matched"])
                continue
            pages_after.update(meta["matched"])
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
    stats["pages_reached_before_exclusion"] = len(pages_before)
    stats["pages_reached_after_exclusion"] = len(pages_after)
    stats["pages_losing_every_label"] = len(excluded_pages - pages_after)
    stats["pages_losing_some_labels"] = len(excluded_pages & pages_after)
    with (BASE / "unmatched-uniis.ndjson").open("w") as fh:
        for entry in sorted(unmatched_uniis.values(), key=lambda e: -e["labels"]):
            fh.write(json.dumps(entry) + "\n")
    previous = PARSED / "map-stats.json"
    if cyp_unassigned == 0 and previous.exists():
        cyp_unassigned = json.loads(previous.read_text()).get("cyp_mentions_unassigned", 0)
    stats["cyp_mentions_unassigned"] = cyp_unassigned
    (PARSED / "map-stats.json").write_text(json.dumps(stats, indent=2) + "\n")
    (PARSED / "excluded-set-ids.json").write_text(
        json.dumps(
            {
                "note": (
                    "SPL set ids the label mapping refuses, by the reason it read. The index-level "
                    "reasons are evaluated over every indexed label; the record-level reasons over "
                    "the labels this run streamed."
                ),
                "count": len(excluded_set_ids),
                "reasons": dict(sorted(excluded_set_ids.items())),
            },
            indent=2,
        )
        + "\n"
    )
    with (BASE / "name-candidates.ndjson").open("w") as fh:
        for entry in sorted(name_candidates.values(), key=lambda e: -e["label_records"]):
            fh.write(json.dumps(entry) + "\n")
    print("shards written to", SHARDS)


if __name__ == "__main__":
    main()
