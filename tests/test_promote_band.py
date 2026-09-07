"""Unit tests for scripts/revamp/promote_band.py — revamp step 6.6.

The promotion rule decides whether pages the corpus is holding back enter the sitemap, so the three
outcomes that matter are tested against fixture Search Console data: a slice that earned the next
one, a slice that did not and the pages that failed it, and a slice with no Search Console coverage
at all, which is not the same as a failure. The residual band definition is tested alongside them,
including that a Tier 3 page can never reach it.

Run:
  .venv-corpus/bin/python -m pytest tests/test_promote_band.py -q
"""

from __future__ import annotations

import importlib.util
import json
from datetime import date
from pathlib import Path

import pandas
import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "scripts" / "revamp" / "promote_band.py"

_spec = importlib.util.spec_from_file_location("promote_band", MODULE_PATH)
promote_band = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(promote_band)


LINES = {"positional": 0.20, "lexical": 0.353}


def thresholds_with_band() -> dict:
    """A tier whose set clears positional at 8 and only clears lexical at 12."""
    return {
        "lines": LINES,
        "tiers": {
            "tier1": {
                "threshold": 12,
                "ruleAnswerAfterStubFloor": None,
                "ruleAnswerUnguarded": None,
                "lineCheckSteps": [
                    {
                        "threshold": count,
                        "indexable": 1000 - count,
                        "positionalAllPairs": 0.30 if count < 8 else 0.19,
                        "lexicalSizeMatchedSet": 0.40 if count < 12 else 0.35,
                        "clearsPositionalLine": count >= 8,
                        "clearsLexicalLine": count >= 12,
                        "clearsBothLines": count >= 12,
                    }
                    for count in range(3, 13)
                ],
            }
        },
    }


def thresholds_without_band() -> dict:
    """The shape data/revamp/thresholds-v5.json actually has: nothing clears one line alone."""
    return {
        "lines": LINES,
        "tiers": {
            "tier1": {
                "threshold": 23,
                "ruleAnswerAfterStubFloor": None,
                "ruleAnswerUnguarded": None,
                "lineCheckSteps": [
                    {
                        "threshold": count,
                        "indexable": 100,
                        "positionalAllPairs": 0.21 if count < 23 else 0.198,
                        "lexicalSizeMatchedSet": 0.36 if count < 23 else 0.345,
                        "clearsPositionalLine": count >= 23,
                        "clearsLexicalLine": count >= 23,
                        "clearsBothLines": count >= 23,
                    }
                    for count in range(3, 24)
                ],
            }
        },
    }


def presence_rows(counts: list[int], tier: int = 1) -> list[dict]:
    return [
        {"key": f"K1:{index:04d}", "tier": tier, "model": "LONGEVITY", "applicable": 20, "present": count}
        for index, count in enumerate(counts)
    ]


# --------------------------------------------------------------------------- the residual band


def test_band_is_the_pages_between_the_positional_floor_and_the_threshold():
    presence = presence_rows([7, 8, 9, 11, 12, 15])
    band, floors = promote_band.residual_band(thresholds_with_band(), presence)
    assert floors[1]["floor"] == 8
    assert floors[1]["threshold"] == 12
    assert [row["present"] for row in band] == [8, 9, 11]


def test_band_is_empty_when_no_count_clears_positional_alone():
    presence = presence_rows([5, 10, 20, 23])
    band, floors = promote_band.residual_band(thresholds_without_band(), presence)
    assert floors[1]["floor"] is None
    assert band == []


def test_band_reads_a_recorded_rule_answer_when_the_thresholds_file_names_one():
    thresholds = thresholds_with_band()
    thresholds["tiers"]["tier1"]["ruleAnswerAfterStubFloor"] = 9
    _band, floors = promote_band.residual_band(thresholds, presence_rows([9]))
    assert floors[1]["floor"] == 9
    assert "rule answer 9" in floors[1]["how"]


def test_a_tier_without_a_threshold_contributes_no_band_pages():
    thresholds = thresholds_with_band()
    thresholds["tiers"]["tier3"] = {
        "threshold": None,
        "ruleAnswerAfterStubFloor": None,
        "ruleAnswerUnguarded": None,
        "lineCheckSteps": [],
    }
    presence = presence_rows([9], tier=1) + presence_rows([9, 10], tier=3)
    band, floors = promote_band.residual_band(thresholds, presence)
    assert floors[3]["eligible"] is False
    assert all(row["tier"] != 3 for row in band)
    assert len(band) == 1


# --------------------------------------------------------------------------- ordering


def test_slice_orders_by_field_count_then_hub_membership_then_key():
    band = presence_rows([9, 9, 11])
    slugs = {row["key"]: row["key"].replace("K1:", "page-") for row in band}
    hubs = {"K1:0000": 1, "K1:0001": 4, "K1:0002": 0}
    rows = promote_band.next_slice(band, set(), slugs, hubs)
    assert [row["key"] for row in rows] == ["K1:0002", "K1:0001", "K1:0000"]
    assert rows[0]["url"] == "https://rnawiki.com/d/page-0002"


def test_slice_is_capped_and_skips_pages_already_promoted():
    band = presence_rows(list(range(9, 12)) * 400)
    slugs = {row["key"]: row["key"].replace("K1:", "page-") for row in band}
    already = {band[0]["key"], band[1]["key"]}
    rows = promote_band.next_slice(band, already, slugs, {})
    assert len(rows) == promote_band.SLICE_SIZE
    assert not ({row["key"] for row in rows} & already)


def test_a_band_page_without_a_slug_stops_the_run():
    band = presence_rows([9])
    with pytest.raises(SystemExit) as raised:
        promote_band.next_slice(band, set(), {}, {})
    assert raised.value.code == 3


# --------------------------------------------------------------------------- the gate


def write_gsc(tmp_path: Path, rows: list[dict]) -> Path:
    frame = pandas.DataFrame(
        rows or [], columns=["url", "record_kind", "corpus_key", "index_state"]
    )
    path = tmp_path / "ingested.parquet"
    frame.to_parquet(path, index=False)
    return path


def ledger_rows(count: int, promoted_on: str) -> list[dict]:
    return [
        {
            "sliceId": "slice-0001",
            "promotedOn": promoted_on,
            "key": f"K1:{index:04d}",
            "slug": f"page-{index:04d}",
            "url": f"https://rnawiki.com/d/page-{index:04d}",
        }
        for index in range(count)
    ]


def test_gate_promotes_the_first_slice_because_there_is_nothing_to_measure():
    gate = promote_band.evaluate_previous([], date(2026, 10, 4))
    assert gate["promote"] is True
    assert gate["verdict"] == "no previous slice"


def test_gate_waits_the_full_28_days(monkeypatch, tmp_path):
    monkeypatch.setattr(promote_band, "GSC_INGESTED", write_gsc(tmp_path, []))
    gate = promote_band.evaluate_previous(ledger_rows(10, "2026-09-06"), date(2026, 9, 20))
    assert gate["promote"] is False
    assert gate["verdict"] == "too early"
    assert "2026-10-04" in gate["detail"]


def test_gate_passes_when_the_slice_indexed(monkeypatch, tmp_path):
    ledger = ledger_rows(10, "2026-09-06")
    rows = [
        {
            "url": row["url"],
            "record_kind": "indexing_urls",
            "corpus_key": row["key"],
            "index_state": "Submitted and indexed" if index < 8 else "Crawled - currently not indexed",
        }
        for index, row in enumerate(ledger)
    ]
    monkeypatch.setattr(promote_band, "GSC_INGESTED", write_gsc(tmp_path, rows))
    gate = promote_band.evaluate_previous(ledger, date(2026, 10, 5))
    assert gate["verdict"] == "passed"
    assert gate["promote"] is True
    assert gate["indexed"] == 8
    assert gate["indexedShare"] == 0.8
    assert gate["crawledNotIndexedShare"] == 0.2


def test_gate_fails_and_names_every_page_that_did_not_make_it(monkeypatch, tmp_path):
    ledger = ledger_rows(10, "2026-09-06")
    rows = []
    for index, row in enumerate(ledger):
        if index < 5:
            state = "Submitted and indexed"
        elif index < 8:
            state = "Crawled – currently not indexed"
        else:
            continue  # no Search Console row at all for the last two
        rows.append(
            {
                "url": row["url"],
                "record_kind": "indexing_urls",
                "corpus_key": row["key"],
                "index_state": state,
            }
        )
    monkeypatch.setattr(promote_band, "GSC_INGESTED", write_gsc(tmp_path, rows))
    gate = promote_band.evaluate_previous(ledger, date(2026, 10, 5))
    assert gate["verdict"] == "failed"
    assert gate["promote"] is False
    assert gate["indexed"] == 5
    assert gate["crawledNotIndexed"] == 3
    assert len(gate["regressed"]) == 5
    states = {entry["state"] for entry in gate["regressed"]}
    assert states == {"crawled, currently not indexed", "no Search Console row"}
    assert {entry["url"] for entry in gate["regressed"]} == {
        row["url"] for row in ledger[5:]
    }


def test_gate_reports_no_data_rather_than_a_failure(monkeypatch, tmp_path):
    ledger = ledger_rows(10, "2026-09-06")
    monkeypatch.setattr(promote_band, "GSC_INGESTED", write_gsc(tmp_path, []))
    gate = promote_band.evaluate_previous(ledger, date(2026, 10, 5))
    assert gate["verdict"] == "no data"
    assert gate["promote"] is False
    assert "gsc_ingest.py" in gate["detail"]


def test_gate_reports_no_data_when_the_ingest_file_is_absent(monkeypatch, tmp_path):
    monkeypatch.setattr(promote_band, "GSC_INGESTED", tmp_path / "absent.parquet")
    gate = promote_band.evaluate_previous(ledger_rows(3, "2026-09-06"), date(2026, 10, 5))
    assert gate["verdict"] == "no data"
    assert gate["promote"] is False


def test_gate_reads_the_url_inspection_pull_when_there_is_no_ingest_parquet(monkeypatch, tmp_path):
    """gsc_pull.py writes index-coverage.csv per dated pull; the gate reads that too."""
    ledger = ledger_rows(10, "2026-09-06")
    pull_dir = tmp_path / "2026-10-04"
    pull_dir.mkdir()
    with (pull_dir / "index-coverage.csv").open("w", encoding="utf-8", newline="") as handle:
        handle.write("url,coverage_state,verdict,last_crawl_time\n")
        for index, row in enumerate(ledger):
            state = "Submitted and indexed" if index < 8 else "Crawled - currently not indexed"
            handle.write(f"{row['url']},{state},PASS,2026-10-01T00:00:00Z\n")
    monkeypatch.setattr(promote_band, "GSC_DIR", tmp_path)
    monkeypatch.setattr(promote_band, "GSC_INGESTED", tmp_path / "absent.parquet")
    gate = promote_band.evaluate_previous(ledger, date(2026, 10, 5))
    assert gate["verdict"] == "passed"
    assert gate["indexed"] == 8
    assert "index-coverage.csv" in gate["detail"]


def test_index_state_reading_separates_indexed_from_crawled_not_indexed():
    assert promote_band.is_indexed(promote_band.normalise_state("Submitted and indexed"))
    assert promote_band.is_indexed(promote_band.normalise_state("Indexed, though blocked by robots.txt"))
    assert not promote_band.is_indexed(promote_band.normalise_state("Crawled – currently not indexed"))
    assert promote_band.is_crawled_not_indexed(
        promote_band.normalise_state("Crawled – currently not indexed")
    )
    assert not promote_band.is_crawled_not_indexed(
        promote_band.normalise_state("Discovered – currently not indexed")
    )
