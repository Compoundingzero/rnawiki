#!/usr/bin/env python
"""Promote the next slice of the residual band into the sitemap — revamp step 6.6.

The residual band
-----------------
A page is in the residual band when it sits below its tier's corrected threshold but at or above
the count at which that tier's rule-answer set clears the positional overlap line without clearing
the lexical one. In the thresholds record that is the count the size-matched bucket rule proposed,
or, where the record names none, the smallest count in `lineCheckSteps` whose set has
`clearsPositionalLine` true and `clearsLexicalLine` false. Those pages are distinct enough in
structure to stand alone and still too alike in wording to index as a block, which is why they were
held back rather than dropped, and why they are released in slices that are measured before the
next one follows.

The count compared against the threshold is the corrected present-over-applicable count from
`data/revamp/presence-applicable-v5.ndjson` — present fields over fields that can apply to that
page's model — not the raw 15-field count the corpus-20k run used.

A tier whose record carries no threshold contributes no band pages. Tier 3 has none, so no Tier 3
page can ever be promoted, and the run fails loudly if one appears in the band.

The promotion rule
------------------
The next slice is 500 pages of the band, ordered by corrected present-over-applicable count
descending, then by the number of hubs the page belongs to (from `data/revamp/hubs/members.parquet`
when it exists) descending, then by page key. It is promoted only when the previously promoted
slice, 28 or more days after it was submitted, shows at least 70% of its pages indexed and at most
20% "crawled, currently not indexed" in Search Console. Both inputs step 6.6 names are read:
`data/revamp/gsc/ingested.parquet`, written by `scripts/revamp/gsc_ingest.py` from the manual CSV
exports, and `data/revamp/gsc/<date>/index-coverage.csv`, written by `scripts/revamp/gsc_pull.py`
from the URL Inspection API. A page with no Search Console row is not indexed; a slice with no row for any of its
pages is no data, not a failure, and promotes nothing either way. On failure the script names the
pages that did not make it and promotes nothing.

The first slice has no predecessor to measure, so it is promoted on its own.

Output
------
`data/revamp/promotion/promoted.ndjson` is the append-only ledger the sitemap reads: one record per
promoted page carrying its slice id and the date. `data/revamp/promotion/gate-<slice>.json` records
each evaluation, pass or fail, and a failing slice also writes
`data/revamp/promotion/regressed-<slice>.csv`. `data/revamp/promotion/integration-plan.md` states
the exact hook that turns the ledger into sitemap entries.

Usage:
  .venv-corpus/bin/python scripts/revamp/promote_band.py              # dry run, decides nothing
  .venv-corpus/bin/python scripts/revamp/promote_band.py --apply      # write the ledger

Exit codes: 0 ran (whether or not it promoted), 2 a required input is missing, 3 a Tier 3 page or a
page with no slug reached the band.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pandas

REPO_ROOT = Path(__file__).resolve().parents[2]
REVAMP = REPO_ROOT / "data" / "revamp"
PROMOTION_DIR = REVAMP / "promotion"
PROMOTED = PROMOTION_DIR / "promoted.ndjson"
PRESENCE = REVAMP / "presence-applicable-v5.ndjson"
CANONICAL = REVAMP / "identity" / "canonical-v3.ndjson"
HUB_MEMBERS = REVAMP / "hubs" / "members.parquet"
GSC_DIR = REVAMP / "gsc"
GSC_INGESTED = GSC_DIR / "ingested.parquet"

SLICE_SIZE = 500
INDEXED_FLOOR = 0.70
CRAWLED_NOT_INDEXED_CEILING = 0.20
SETTLE_DAYS = 28
ORIGIN = "https://rnawiki.com"
PRINT_ROW_CAP = 50

HUB_KEY_COLUMNS = ("page", "page_key", "key", "member", "member_key", "leaf", "leaf_key", "slug")


def shown(path: Path) -> str:
    """A path as the repo sees it, or its full path when it lies outside the repository."""
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def thresholds_path() -> Path:
    newer = REVAMP / "thresholds-v6.json"
    return newer if newer.exists() else REVAMP / "thresholds-v5.json"


def tier_number(name: str) -> int | None:
    digits = "".join(character for character in name if character.isdigit())
    return int(digits) if digits else None


def band_floor(tier_record: dict, lines: dict) -> tuple[int | None, str]:
    """The count at which this tier's set clears positional but not lexical, and how it was read."""
    positional_line = lines.get("positional")
    lexical_line = lines.get("lexical")
    steps = tier_record.get("lineCheckSteps") or []
    by_threshold = {step.get("threshold"): step for step in steps}

    recorded = tier_record.get("ruleAnswerAfterStubFloor")
    if recorded is None:
        recorded = tier_record.get("ruleAnswerUnguarded")
    if recorded is not None:
        step = by_threshold.get(recorded)
        if step is not None and step.get("clearsPositionalLine") and not step.get("clearsLexicalLine"):
            return int(recorded), f"rule answer {recorded} recorded in the thresholds file"

    for step in sorted(steps, key=lambda item: item.get("threshold") or 0):
        clears_positional = step.get("clearsPositionalLine")
        clears_lexical = step.get("clearsLexicalLine")
        if clears_positional is None and positional_line is not None:
            clears_positional = (step.get("positionalAllPairs") or 1.0) <= positional_line
        if clears_lexical is None and lexical_line is not None:
            clears_lexical = (step.get("lexicalSizeMatchedSet") or 1.0) <= lexical_line
        if clears_positional and not clears_lexical:
            return int(step["threshold"]), (
                f"smallest count in lineCheckSteps clearing positional "
                f"({step.get('positionalAllPairs')}) and not lexical ({step.get('lexicalSizeMatchedSet')})"
            )
    return None, "no count in this tier clears the positional line while failing the lexical one"


def load_presence() -> list[dict]:
    rows = []
    with PRESENCE.open(encoding="utf-8") as handle:
        for line in handle:
            rows.append(json.loads(line))
    return rows


def load_slugs() -> dict[str, str]:
    slugs = {}
    with CANONICAL.open(encoding="utf-8") as handle:
        for line in handle:
            record = json.loads(line)
            if record.get("existingSlug"):
                slugs[record["key"]] = record["existingSlug"]
    return slugs


def load_hub_memberships() -> tuple[dict[str, int], str]:
    if not HUB_MEMBERS.exists():
        return {}, f"{shown(HUB_MEMBERS)} does not exist yet; every page counts 0 hubs"
    frame = pandas.read_parquet(HUB_MEMBERS)
    column = next((name for name in HUB_KEY_COLUMNS if name in frame.columns), None)
    if column is None:
        return {}, (
            f"{shown(HUB_MEMBERS)} carries none of the expected page columns "
            f"{HUB_KEY_COLUMNS}; every page counts 0 hubs"
        )
    counts = Counter(str(value) for value in frame[column].dropna().tolist())
    return dict(counts), f"{len(counts)} pages carry a hub membership, read from column {column!r}"


def residual_band(thresholds: dict, presence: list[dict]) -> tuple[list[dict], dict]:
    lines = thresholds.get("lines", {})
    floors: dict[int, dict] = {}
    for name, record in thresholds.get("tiers", {}).items():
        number = tier_number(name)
        if number is None:
            continue
        threshold = record.get("threshold")
        floor, how = band_floor(record, lines)
        steps = record.get("lineCheckSteps") or []
        below = [step for step in steps if threshold is None or (step.get("threshold") or 0) < threshold]
        nearest = max(below, key=lambda step: step.get("threshold") or 0, default=None)
        floors[number] = {
            "tier": number,
            "threshold": threshold,
            "floor": floor,
            "how": how,
            "eligible": threshold is not None and floor is not None and floor < threshold,
            "nearestStepBelowThreshold": None
            if nearest is None
            else {
                "count": nearest.get("threshold"),
                "pages": nearest.get("indexable"),
                "positionalAllPairs": nearest.get("positionalAllPairs"),
                "lexicalSizeMatchedSet": nearest.get("lexicalSizeMatchedSet"),
                "positionalLine": lines.get("positional"),
                "lexicalLine": lines.get("lexical"),
            },
        }
    band = []
    for row in presence:
        tier = row.get("tier")
        rule = floors.get(tier)
        if not rule or not rule["eligible"]:
            continue
        present = row.get("present")
        if present is None:
            continue
        if rule["floor"] <= present < rule["threshold"]:
            band.append(row)
    return band, floors


def normalise_state(value) -> str:
    text = "" if value is None else str(value)
    return " ".join(text.replace("–", "-").replace("—", "-").lower().split())


def is_indexed(state: str) -> bool:
    return "indexed" in state and "not indexed" not in state


def is_crawled_not_indexed(state: str) -> bool:
    return "crawled" in state and "not indexed" in state


def gsc_states() -> tuple[dict[str, list[str]], dict[str, list[str]], str]:
    """Index states from Search Console, keyed by corpus key and by URL.

    Both inputs step 6.6 names are read. `gsc_ingest.py` normalises the manual CSV exports into
    `ingested.parquet`, whose `index_state` column carries the state. `gsc_pull.py` writes its own
    `index-coverage.csv` per dated pull, one row per URL inspected, whose `coverage_state` column
    carries the same thing in the URL Inspection API's words. Reading both means the loop works
    whether the data arrived through the interface or the API, and neither is silently preferred:
    the states are pooled per URL and a URL counts as indexed when any of them says so.
    """
    by_key: dict[str, list[str]] = defaultdict(list)
    by_url: dict[str, list[str]] = defaultdict(list)
    notes: list[str] = []

    if not GSC_INGESTED.exists():
        notes.append(f"{shown(GSC_INGESTED)} does not exist")
    else:
        frame = pandas.read_parquet(GSC_INGESTED)
        if "index_state" not in frame.columns:
            notes.append(f"{shown(GSC_INGESTED)} carries no index_state column")
        else:
            rows = 0
            for row in frame.itertuples(index=False):
                state = normalise_state(getattr(row, "index_state", None))
                if not state:
                    continue
                rows += 1
                key = getattr(row, "corpus_key", None)
                url = getattr(row, "url", None)
                if key:
                    by_key[str(key)].append(state)
                if url:
                    by_url[str(url).rstrip("/")].append(state)
            notes.append(f"{rows} rows carry an index state in {shown(GSC_INGESTED)}")

    pull_rows = 0
    pull_files = 0
    for path in sorted(GSC_DIR.glob("*/index-coverage.csv")):
        pull_files += 1
        with path.open(encoding="utf-8", newline="") as handle:
            for record in csv.DictReader(handle):
                url = (record.get("url") or "").strip()
                state = normalise_state(
                    record.get("coverage_state") or record.get("indexing_state") or record.get("verdict")
                )
                if not url or not state:
                    continue
                pull_rows += 1
                by_url[url.rstrip("/")].append(state)
    if pull_files:
        notes.append(
            f"{pull_rows} rows carry a coverage state across {pull_files} "
            f"{shown(GSC_DIR)}/<date>/index-coverage.csv pulls"
        )

    return dict(by_key), dict(by_url), "; ".join(notes) if notes else "no Search Console input found"


def read_ledger() -> list[dict]:
    if not PROMOTED.exists():
        return []
    records = []
    with PROMOTED.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def evaluate_previous(ledger: list[dict], today: date) -> dict:
    """Whether the last promoted slice earned the next one."""
    if not ledger:
        return {
            "verdict": "no previous slice",
            "promote": True,
            "detail": "nothing has been promoted yet, so this is the first slice and there is "
            "nothing to measure",
        }
    last_id = ledger[-1]["sliceId"]
    slice_rows = [row for row in ledger if row["sliceId"] == last_id]
    promoted_on = date.fromisoformat(slice_rows[0]["promotedOn"])
    age = (today - promoted_on).days
    if age < SETTLE_DAYS:
        return {
            "verdict": "too early",
            "promote": False,
            "sliceId": last_id,
            "promotedOn": promoted_on.isoformat(),
            "ageDays": age,
            "detail": f"{last_id} was promoted {age} days ago; the rule waits {SETTLE_DAYS} days, "
            f"so the next evaluation is on {(promoted_on + timedelta(days=SETTLE_DAYS)).isoformat()}",
        }

    by_key, by_url, source_note = gsc_states()
    indexed = []
    crawled_not_indexed = []
    unseen = []
    seen = 0
    for row in slice_rows:
        states = (by_key.get(row["key"]) or []) + (by_url.get(str(row["url"]).rstrip("/")) or [])
        if states:
            seen += 1
        if any(is_indexed(state) for state in states):
            indexed.append(row)
        elif any(is_crawled_not_indexed(state) for state in states):
            crawled_not_indexed.append(row)
        else:
            unseen.append(row)
    total = len(slice_rows)
    if seen == 0:
        return {
            "verdict": "no data",
            "promote": False,
            "sliceId": last_id,
            "promotedOn": promoted_on.isoformat(),
            "ageDays": age,
            "sliceSize": total,
            "detail": f"no Search Console row covers any page of {last_id}. {source_note}. Run "
            "scripts/revamp/gsc_ingest.py over a fresh export, or scripts/revamp/gsc_pull.py with "
            "GSC_SERVICE_ACCOUNT_JSON set, before this can be decided",
        }
    indexed_share = len(indexed) / total
    crawled_share = len(crawled_not_indexed) / total
    passed = indexed_share >= INDEXED_FLOOR and crawled_share <= CRAWLED_NOT_INDEXED_CEILING
    return {
        "verdict": "passed" if passed else "failed",
        "promote": passed,
        "sliceId": last_id,
        "promotedOn": promoted_on.isoformat(),
        "ageDays": age,
        "sliceSize": total,
        "indexed": len(indexed),
        "indexedShare": round(indexed_share, 4),
        "crawledNotIndexed": len(crawled_not_indexed),
        "crawledNotIndexedShare": round(crawled_share, 4),
        "notSeen": len(unseen),
        "regressed": [
            {"key": row["key"], "slug": row["slug"], "url": row["url"], "state": "crawled, currently not indexed"}
            for row in crawled_not_indexed
        ]
        + [
            {"key": row["key"], "slug": row["slug"], "url": row["url"], "state": "no Search Console row"}
            for row in unseen
        ],
        "detail": f"{len(indexed)}/{total} indexed ({indexed_share:.1%}, floor {INDEXED_FLOOR:.0%}), "
        f"{len(crawled_not_indexed)}/{total} crawled but not indexed ({crawled_share:.1%}, "
        f"ceiling {CRAWLED_NOT_INDEXED_CEILING:.0%}). {source_note}",
    }


def next_slice(
    band: list[dict], promoted_keys: set[str], slugs: dict[str, str], hubs: dict[str, int]
) -> list[dict]:
    candidates = []
    for row in band:
        key = row["key"]
        if key in promoted_keys:
            continue
        slug = slugs.get(key)
        if not slug:
            print(f"page in the residual band carries no slug: {key}", file=sys.stderr)
            raise SystemExit(3)
        candidates.append(
            {
                "key": key,
                "slug": slug,
                "url": f"{ORIGIN}/d/{slug}",
                "tier": row["tier"],
                "model": row.get("model"),
                "present": row["present"],
                "applicable": row.get("applicable"),
                "hubMemberships": hubs.get(key, hubs.get(slug, 0)),
            }
        )
    candidates.sort(key=lambda item: (-item["present"], -item["hubMemberships"], item["key"]))
    return candidates[:SLICE_SIZE]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write the ledger; without it nothing is written")
    parser.add_argument("--today", default=date.today().isoformat(), help="evaluation date, YYYY-MM-DD")
    arguments = parser.parse_args()
    today = date.fromisoformat(arguments.today)

    path = thresholds_path()
    for required in (path, PRESENCE, CANONICAL):
        if not required.exists():
            print(f"missing input: {required}", file=sys.stderr)
            return 2

    thresholds = json.loads(path.read_text(encoding="utf-8"))
    presence = load_presence()
    band, floors = residual_band(thresholds, presence)
    for row in band:
        if row.get("tier") == 3:
            print(f"Tier 3 page reached the residual band: {row['key']}", file=sys.stderr)
            return 3

    slugs = load_slugs()
    hubs, hub_note = load_hub_memberships()
    ledger = read_ledger()
    promoted_keys = {row["key"] for row in ledger}
    gate = evaluate_previous(ledger, today)

    print(f"thresholds: {shown(path)}")
    for tier in sorted(floors):
        rule = floors[tier]
        print(
            f"  tier {tier}: threshold {rule['threshold']}, band floor {rule['floor']} — {rule['how']}"
        )
        nearest = rule.get("nearestStepBelowThreshold")
        if rule["floor"] is None and nearest:
            print(
                f"    nearest count below the threshold: {nearest['count']} "
                f"({nearest['pages']} pages) measures positional {nearest['positionalAllPairs']} "
                f"against the {nearest['positionalLine']} line and lexical "
                f"{nearest['lexicalSizeMatchedSet']} against {nearest['lexicalLine']}; it fails both, "
                "so those pages are not a residual band and stay noindex"
            )
    print(f"residual band: {len(band)} pages; {len(promoted_keys)} already promoted")
    print(f"hub membership: {hub_note}")
    print(f"gate on the previous slice: {gate['verdict']} — {gate['detail']}")

    if gate.get("regressed"):
        PROMOTION_DIR.mkdir(parents=True, exist_ok=True)
        regressed_path = PROMOTION_DIR / f"regressed-{gate['sliceId']}.csv"
        with regressed_path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=["key", "slug", "url", "state"])
            writer.writeheader()
            writer.writerows(gate["regressed"])
        print(f"pages that did not make it: {len(gate['regressed'])} → {shown(regressed_path)}")
        for row in gate["regressed"][:PRINT_ROW_CAP]:
            print(f"  {row['state']:34s}  {row['url']}")
        if len(gate["regressed"]) > PRINT_ROW_CAP:
            print(f"  ... {len(gate['regressed']) - PRINT_ROW_CAP} more in the CSV")

    if not gate["promote"]:
        print("promoted nothing")
        if arguments.apply:
            PROMOTION_DIR.mkdir(parents=True, exist_ok=True)
            (PROMOTION_DIR / f"gate-{today.isoformat()}.json").write_text(
                json.dumps({"evaluatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                            "gate": gate, "bandSize": len(band), "floors": floors}, indent=1),
                encoding="utf-8",
            )
        return 0

    slice_rows = next_slice(band, promoted_keys, slugs, hubs)
    if not slice_rows:
        print("the residual band holds no page that has not already been promoted; promoted nothing")
        return 0

    slice_number = len({row["sliceId"] for row in ledger}) + 1
    slice_id = f"slice-{slice_number:04d}"
    print(f"next slice: {slice_id}, {len(slice_rows)} pages")
    for row in slice_rows[:PRINT_ROW_CAP]:
        print(f"  tier {row['tier']}  present {row['present']:>3}  hubs {row['hubMemberships']:>2}  {row['url']}")
    if len(slice_rows) > PRINT_ROW_CAP:
        print(f"  ... {len(slice_rows) - PRINT_ROW_CAP} more")

    if not arguments.apply:
        print("dry run; pass --apply to write the ledger")
        return 0

    PROMOTION_DIR.mkdir(parents=True, exist_ok=True)
    with PROMOTED.open("a", encoding="utf-8") as handle:
        for row in slice_rows:
            record = dict(row)
            record["sliceId"] = slice_id
            record["promotedOn"] = today.isoformat()
            record["thresholds"] = path.name
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
    (PROMOTION_DIR / f"gate-{slice_id}.json").write_text(
        json.dumps(
            {
                "evaluatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "sliceId": slice_id,
                "promoted": len(slice_rows),
                "gate": gate,
                "bandSize": len(band),
                "floors": floors,
            },
            indent=1,
        ),
        encoding="utf-8",
    )
    print(f"wrote {len(slice_rows)} records to {shown(PROMOTED)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
