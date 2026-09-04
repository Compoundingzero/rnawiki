"""Focused cases for the Phase 3 derived-seed executor.

One firing page and one non-firing page per kept seed (1-17), plus the R2 suppression cases
for seeds 1, 2 and 6, plus an end-to-end run of the CLI over a tiny fixture corpus.

Every fixture in this file is a test fixture and nothing else: no value here is ever written
to data/. Run with pytest, or directly:

    .venv-corpus/bin/python tests/unit/corpus-20k/test_derived_seeds.py
"""

from __future__ import annotations

import importlib.util
import json
import os
import shutil
import sys
import tempfile
from datetime import date

_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
_MODULE_PATH = os.path.join(_ROOT, "scripts", "corpus-20k", "derived", "compute.py")

_spec = importlib.util.spec_from_file_location("corpus20k_derived_compute", _MODULE_PATH)
compute = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(compute)

AS_OF = date(2026, 9, 4)
SOURCE = {"kind": "label", "id": "FIXTURE-1", "url": "https://example.invalid/fixture"}
_TEMP_DIRS = []


def F(value, source=None, source_date="2020-01-01"):
    """A present field in the R9 envelope."""
    return {
        "state": "present",
        "value": value,
        "source": source or SOURCE,
        "sourceDate": source_date,
        "lastVerified": "2026-09-01",
        "verbatim": True,
    }


def page(key, model="LONGEVITY", **fields):
    return {"key": key, "displayName": key.title(), "model": model, "fields": fields}


def trial(nct, keys, **kwargs):
    record = {"nct": nct, "keys": list(keys)}
    record.update(kwargs)
    return record


def publication(pmid, keys, **kwargs):
    record = {"pmid": pmid, "keys": list(keys)}
    record.update(kwargs)
    return record


def aggregate(key, **kwargs):
    """A per-page registry aggregate in the shape Phase 2 publishes."""
    record = {"key": key, "displayName": key.title(), "studies": kwargs.pop("studies", 1)}
    record.update(kwargs)
    return record


def make_ctx(pages, trials=(), publications=(), aggregates=(), suppressed=(), as_of=AS_OF):
    import duckdb

    out_dir = tempfile.mkdtemp(prefix="derived-seeds-test-")
    _TEMP_DIRS.append(out_dir)
    suppressed_keys = set(suppressed)
    built = [compute.build_page(p, suppressed_keys) for p in pages]
    built = [p for p in built if p is not None]
    registry = {
        "trials": {}, "publications": {}, "aggregates": {},
        "trialCount": 0, "publicationCount": 0, "aggregateCount": 0, "matchCount": 0, "files": [],
    }
    from collections import defaultdict

    trials_by_key = defaultdict(list)
    pubs_by_key = defaultdict(list)
    for record in trials:
        parsed = compute.build_trial(record)
        assert parsed is not None, "fixture trial did not parse: %r" % (record,)
        registry["trialCount"] += 1
        for key in parsed.keys:
            trials_by_key[key].append(parsed)
    for record in publications:
        parsed = compute.build_publication(record)
        assert parsed is not None, "fixture publication did not parse: %r" % (record,)
        registry["publicationCount"] += 1
        for key in parsed.keys:
            pubs_by_key[key].append(parsed)
    for record in aggregates:
        parsed = compute.build_aggregate(record)
        assert parsed is not None, "fixture aggregate did not parse: %r" % (record,)
        registry["aggregates"][parsed["key"]] = parsed
    registry["trials"] = trials_by_key
    registry["publications"] = pubs_by_key

    ctx = compute.Context(built, registry, as_of, out_dir)
    con = duckdb.connect()
    compute.build_indexes(ctx, con)
    con.close()
    return ctx


def run(ctx, seed_number, key):
    seed = next(s for s in compute.SEEDS if s["number"] == seed_number)
    return seed["fn"](ctx, ctx.pages_by_key[key])


# --------------------------------------------------------------------------- seed 1

def test_seed_01_fires_when_a_positive_parenteral_animal_result_meets_an_oral_bioavailability():
    ctx = make_ctx([
        page(
            "fires",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}}),
            ladder=F([{"organism": "mouse", "evidenceKind": "lifespan", "route": "IP", "direction": "increased", "citation": {"pmid": "1"}}]),
        )
    ])
    result = run(ctx, 1, "fires")
    assert result is not None
    assert result["slots"] == {"route": "IP", "organism": "mouse"}
    assert result["values"]["oralBioavailability"]["value"] == 5
    assert result["values"]["oralBioavailability"]["unit"] == "%"
    assert result["values"]["oralBioavailability"]["source"] == SOURCE


def test_seed_01_does_not_fire_when_the_animal_result_was_oral():
    ctx = make_ctx([
        page(
            "quiet",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}}),
            ladder=F([{"organism": "mouse", "evidenceKind": "lifespan", "route": "oral", "direction": "increased"}]),
        )
    ])
    assert run(ctx, 1, "quiet") is None


def test_seed_01_does_not_fire_without_a_recorded_positive_direction():
    ctx = make_ctx([
        page(
            "undirected",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}}),
            ladder=F([{"organism": "mouse", "evidenceKind": "lifespan", "route": "IP"}]),
        )
    ])
    assert run(ctx, 1, "undirected") is None


# --------------------------------------------------------------------------- seed 2

def test_seed_02_fires_and_never_computes_a_washout_number():
    ctx = make_ctx(
        [page("fires", biomarkers=F(["HOMA-IR"]), kinetics=F({"halfLife": {"value": 6, "unit": "h"}}))],
        trials=[trial("NCT00000001", ["fires"], primaryOutcomes=["HOMA-IR"], enrollment=20, resultDirection="increased")],
    )
    result = run(ctx, 2, "fires")
    assert result is not None
    assert result["slots"]["biomarker"] == "HOMA-IR"
    assert result["values"]["tests"] == {
        "a_biomarkerMeasuredInHumans": True,
        "b_halfLifeRecorded": True,
        "c_smallHumanTrialReportedEffect": True,
    }
    assert result["values"]["halfLife"]["value"] == 6
    assert result["values"]["washoutDerivableInPrinciple"] is True
    serialized = json.dumps(result)
    assert "washoutNumber" not in serialized
    assert "washoutDays" not in serialized
    assert "washoutHours" not in serialized


def test_seed_02_reports_which_of_the_three_tests_is_missing():
    ctx = make_ctx(
        [page("partial", biomarkers=F(["HOMA-IR"]))],
        trials=[trial("NCT00000002", ["partial"], primaryOutcomes=["HOMA-IR"], enrollment=400, resultDirection="increased")],
    )
    result = run(ctx, 2, "partial")
    assert result is not None
    assert result["values"]["missing"] == ["b_halfLifeRecorded", "c_smallHumanTrialReportedEffect"]
    assert "halfLife" not in result["values"]


def test_seed_02_does_not_fire_when_no_human_trial_measured_the_biomarker():
    ctx = make_ctx(
        [page("quiet", biomarkers=F(["HOMA-IR"]), kinetics=F({"halfLife": {"value": 6, "unit": "h"}}))],
        trials=[trial("NCT00000003", ["quiet"], primaryOutcomes=["Tumour response"], enrollment=20)],
    )
    assert run(ctx, 2, "quiet") is None


# --------------------------------------------------------------------------- seed 3

def test_seed_03_fires_on_two_stopped_trials_and_clusters_their_reasons():
    ctx = make_ctx([
        page(
            "fires",
            trialfailures=F([
                {"nct": "NCT00000010", "status": "Terminated", "whyStopped": "Terminated for futility at interim analysis"},
                {"nct": "NCT00000011", "status": "Terminated", "whyStopped": "Slow accrual"},
            ]),
        )
    ])
    result = run(ctx, 3, "fires")
    assert result is not None
    assert result["slots"]["n"] == 2
    assert set(result["slots"]["reasonList"]) == {"futility/efficacy", "accrual/recruitment"}
    clusters = {row["cluster"]: row for row in result["values"]["clusters"]}
    assert clusters["futility/efficacy"]["ncts"] == ["NCT00000010"]
    assert clusters["futility/efficacy"]["reasons"][0]["whyStopped"] == "Terminated for futility at interim analysis"


def test_seed_03_does_not_fire_on_a_single_stopped_trial():
    ctx = make_ctx([
        page("quiet", trialfailures=F([{"nct": "NCT00000012", "status": "Terminated", "whyStopped": "Slow accrual"}]))
    ])
    assert run(ctx, 3, "quiet") is None


# --------------------------------------------------------------------------- seed 4

def test_seed_04_fires_and_separates_measured_from_never_measured_endpoints():
    ctx = make_ctx(
        [page("fires", humanceiling=F({"longestDurationDays": 180, "largestN": 60, "anyAgingEndpoint": True, "trials": ["NCT00000020"]}))],
        trials=[trial("NCT00000020", ["fires"], primaryOutcomes=["Change in grip strength"], enrollment=60)],
    )
    result = run(ctx, 4, "fires")
    assert result is not None
    measured = {row["endpoint"] for row in result["values"]["measured"]}
    assert measured == {"grip strength"}
    assert "lifespan" in result["values"]["neverMeasured"]
    assert "grip strength" not in result["values"]["neverMeasured"]


def test_seed_04_does_not_fire_without_a_human_evidence_ceiling():
    ctx = make_ctx(
        [page("quiet")],
        trials=[trial("NCT00000021", ["quiet"], primaryOutcomes=["Change in grip strength"])],
    )
    assert run(ctx, 4, "quiet") is None


# --------------------------------------------------------------------------- seed 5

def test_seed_05_fires_when_another_corpus_compound_shares_the_enzyme():
    ctx = make_ctx([
        page("fires", interactions=F({"cyp": [{"statement": "CYP3A4 substrate"}]})),
        page("other", interactions=F({"cyp": [{"statement": "Inhibits CYP3A4"}]})),
    ])
    result = run(ctx, 5, "fires")
    assert result is not None
    node = result["values"]["nodes"][0]
    assert node["node"] == "CYP3A4"
    assert node["kind"] == "cyp"
    assert node["thisCompoundRole"] == "substrate"
    assert node["sharedWithCount"] == 1
    assert node["sharedWith"][0]["key"] == "other"
    assert node["sharedWith"][0]["role"] == "inhibitor"


def test_seed_05_does_not_fire_when_no_other_compound_shares_the_enzyme():
    ctx = make_ctx([
        page("alone", interactions=F({"cyp": [{"statement": "CYP2D6 substrate"}]})),
        page("other", interactions=F({"cyp": [{"statement": "CYP3A4 substrate"}]})),
    ])
    assert run(ctx, 5, "alone") is None


def test_seed_05_index_is_bipartite_node_to_pages():
    ctx = make_ctx([
        page("a", interactions=F({"transporters": [{"statement": "P-gp substrate"}]})),
        page("b", interactions=F({"transporters": [{"statement": "P-gp inhibitor"}]})),
    ])
    index_path = os.path.join(ctx.out_dir, "indexes", "enzyme-transporter.ndjson")
    rows = [json.loads(line) for line in open(index_path, encoding="utf-8")]
    assert [row["node"] for row in rows] == ["P-gp"]
    assert {member["key"] for member in rows[0]["pages"]} == {"a", "b"}
    assert set(rows[0].keys()) == {"node", "kind", "pages"}  # node -> pages only


# --------------------------------------------------------------------------- seed 6

def test_seed_06_fires_on_stored_sentences_stating_an_effect_and_a_duration():
    """Amended 2026-09-04: the registry snapshot records no direction, so seed 6 reads the stored
    evidence sentences instead. A sentence qualifies only when its own words state both."""
    ctx = make_ctx([
        page(
            "fires",
            ladder=F({"rungs": [
                {"rung": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "Insulin sensitivity",
                 "sentence": "Insulin sensitivity increased over a 12-week course.", "pmid": "30"},
                {"rung": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "Insulin sensitivity",
                 "sentence": "No significant effect on insulin sensitivity was seen over 24 months.", "pmid": "31"},
            ]}),
        )
    ])
    result = run(ctx, 6, "fires")
    assert result is not None
    assert result["slots"]["endpoint"] == "Insulin sensitivity"
    shortest = result["values"]["shortestReportingEffect"]
    assert shortest["pmid"] == "30"
    assert shortest["durationVerbatim"] == "12-week"
    assert shortest["origin"] == "organism-ladder human rung"
    assert result["values"]["longestReportingNone"]["pmid"] == "31"
    assert result["values"]["qualifyingSentenceCount"] == 2


def test_seed_06_does_not_fire_on_a_sentence_that_states_no_duration():
    ctx = make_ctx([
        page(
            "quiet",
            ladder=F({"rungs": [
                {"rung": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "Insulin sensitivity",
                 "sentence": "Insulin sensitivity increased.", "pmid": "32"},
            ]}),
        )
    ])
    assert run(ctx, 6, "quiet") is None


def test_seed_06_does_not_fire_when_every_qualifying_sentence_states_no_effect():
    ctx = make_ctx([
        page(
            "null-only",
            ladder=F({"rungs": [
                {"rung": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "Insulin sensitivity",
                 "sentence": "No significant effect on insulin sensitivity was seen over 24 months.", "pmid": "33"},
            ]}),
        )
    ])
    assert run(ctx, 6, "null-only") is None


# --------------------------------------------------------------------------- seed 7

def test_seed_07_fires_on_sex_split_itp_cohorts():
    ctx = make_ctx([
        page(
            "fires",
            itp=F({
                "tested": True,
                "cohorts": [
                    {"dose": "14 ppm", "ageAtStartMonths": 9, "sex": "male", "outcome": "median lifespan increased 10%", "publication": {"pmid": "9"}},
                    {"dose": "14 ppm", "ageAtStartMonths": 9, "sex": "female", "outcome": "no significant change in median lifespan", "publication": {"pmid": "9"}},
                ],
            }),
        )
    ])
    result = run(ctx, 7, "fires")
    assert result is not None
    assert result["slots"]["organism"] == "mouse"
    assert {row["sex"] for row in result["values"]["results"]} == {"male", "female"}
    assert result["values"]["results"][0]["outcome"] == "median lifespan increased 10%"
    assert result["values"]["results"][0]["doseppm"] == "14 ppm"


def test_seed_07_admits_the_effect_lemma_family_in_a_stored_sentence():
    """Amendment of 2026-09-04: extend/extends/extended/extension all state an effect. "extension"
    is the noun the ITP lifespan publications use, and before the amendment it matched nothing."""
    sentence = "Treatment produced a 10% extension of median lifespan in females but not in males."
    ctx = make_ctx([
        page(
            "lemma",
            ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": sentence, "pmid": "7"}]}),
        )
    ])
    result = run(ctx, 7, "lemma")
    assert result is not None
    row = result["values"]["sexStatements"][0]
    assert row["sentence"] == sentence
    assert "extension" in [term.lower() for term in row["effectTermsVerbatim"]]
    assert [term.lower() for term in row["sexTermsVerbatim"]] == ["females", "males"]


def test_seed_07_does_not_fire_on_a_sentence_stating_no_effect_word():
    ctx = make_ctx([
        page(
            "no-effect-word",
            ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": "Males and females were enrolled in equal numbers.", "pmid": "8"}]}),
        )
    ])
    assert run(ctx, 7, "no-effect-word") is None


def test_seed_07_does_not_fire_on_a_single_sex_cohort():
    ctx = make_ctx([
        page("quiet", itp=F({"tested": True, "cohorts": [{"dose": "14 ppm", "sex": "male", "outcome": "no change"}]}))
    ])
    assert run(ctx, 7, "quiet") is None


# --------------------------------------------------------------------------- seed 8

def test_seed_08_fires_with_two_dated_events_and_a_current_state():
    ctx = make_ctx(
        [page("fires", regulatorystatus=F([{"jurisdiction": "US", "status": "approved", "approvalDate": "1998-03-01", "source": SOURCE}]))],
        trials=[trial("NCT00000040", ["fires"], startDate="2005-06-01")],
        publications=[publication("PMID1", ["fires"], date="1990-01-01")],
    )
    result = run(ctx, 8, "fires")
    assert result is not None
    assert result["slots"]["firstYear"] == 1990
    assert result["slots"]["currentState"] == "approved"
    years = [event["year"] for event in result["values"]["events"]]
    assert years == sorted(years)
    events = {event["event"]: event for event in result["values"]["events"]}
    assert "first human trial" in events
    assert events["first approval"]["date"] == "1998-03-01"


def test_seed_08_does_not_fire_with_fewer_than_two_dated_events():
    ctx = make_ctx(
        [page("quiet", regulatorystatus=F([{"jurisdiction": "US", "status": "approved"}]))],
        publications=[publication("PMID2", ["quiet"], date="1990-01-01")],
    )
    assert run(ctx, 8, "quiet") is None


def test_seed_08_never_dates_an_approval_from_the_source_date():
    """A source date is when the record was published or verified, not an approval date."""
    ctx = make_ctx(
        [page("dated", regulatorystatus=F([{"jurisdiction": "US", "status": "approved"}], source_date="2020-01-01"))],
        publications=[publication("PMID9", ["dated"], date="1990-01-01")],
        trials=[trial("NCT00000041", ["dated"], startDate="2005-06-01")],
    )
    result = run(ctx, 8, "dated")
    assert result is not None
    assert "first approval" not in {event["event"] for event in result["values"]["events"]}


# --------------------------------------------------------------------------- seed 9

def test_seed_09_fires_on_an_ongoing_trial_with_an_audience_endpoint_and_a_readout_date():
    ctx = make_ctx([
        page(
            "fires",
            ongoingtrials=F([
                {"nct": "NCT00000050", "title": "A running trial", "N": 120, "primaryEndpoint": "Frailty index", "completionDate": "2027-12-31"}
            ]),
        )
    ])
    result = run(ctx, 9, "fires")
    assert result is not None
    assert result["slots"]["endpoint"] == "frailty"
    assert result["values"]["trials"][0]["readoutDate"] == "2027-12-31"
    assert result["values"]["trials"][0]["n"] == 120


def test_seed_09_does_not_fire_when_the_endpoint_is_not_an_audience_endpoint():
    ctx = make_ctx([
        page("quiet", ongoingtrials=F([{"nct": "NCT00000051", "primaryEndpoint": "Tumour response rate", "completionDate": "2027-12-31"}]))
    ])
    assert run(ctx, 9, "quiet") is None


# --------------------------------------------------------------------------- seed 10

def test_seed_10_fires_when_a_withdrawal_and_a_register_status_disagree():
    ctx = make_ctx([
        page(
            "fires",
            model="CLINICAL",
            withdrawalstatus=F({"withdrawn": True, "reason": "hepatotoxicity", "jurisdictions": ["US"]}),
            regulatorystatus=F([{"jurisdiction": "EU", "status": "approved", "source": SOURCE, "sourceDate": "2019-01-01"}]),
        )
    ])
    result = run(ctx, 10, "fires")
    assert result is not None
    comparison = result["values"]["contradictions"][0]
    assert comparison["comparison"] == "withdrawal status vs register status"
    assert [value["value"] for value in comparison["values"]] == ["hepatotoxicity", "approved"]


def test_seed_10_does_not_fire_when_the_sources_agree():
    ctx = make_ctx([
        page(
            "quiet",
            model="CLINICAL",
            withdrawalstatus=F({"withdrawn": False}),
            regulatorystatus=F([{"jurisdiction": "EU", "status": "approved"}]),
        )
    ])
    assert run(ctx, 10, "quiet") is None


# --------------------------------------------------------------------------- seed 11

def test_seed_11_fires_when_the_top_rung_is_non_human_and_no_human_aging_endpoint_exists():
    ctx = make_ctx([
        page(
            "fires",
            ladder=F([
                {"organism": "C. elegans", "evidenceKind": "lifespan", "citation": {"pmid": "1"}},
                {"organism": "mouse", "evidenceKind": "healthspan", "citation": {"pmid": "2"}},
            ]),
            humanceiling=F({"anyAgingEndpoint": False, "trials": []}),
        )
    ])
    result = run(ctx, 11, "fires")
    assert result is not None
    assert result["slots"]["organism"] == "mouse"
    assert result["slots"]["kind"] == "healthspan"
    assert result["values"]["rungs"] == ["c. elegans", "mouse"]
    assert result["values"]["anyAgingEndpointInHumans"] is False


def test_seed_11_does_not_fire_when_a_human_aging_endpoint_was_measured():
    ctx = make_ctx([
        page(
            "quiet",
            ladder=F([{"organism": "mouse", "evidenceKind": "healthspan"}]),
            humanceiling=F({"anyAgingEndpoint": True}),
        )
    ])
    assert run(ctx, 11, "quiet") is None


# --------------------------------------------------------------------------- seed 12

def test_seed_12_fires_on_a_completed_unreported_trial_older_than_two_years():
    ctx = make_ctx(
        [page("fires")],
        trials=[trial("NCT00000060", ["fires"], status="Completed", completionDate="2020-01-01", hasResults=False, enrollment=40)],
    )
    result = run(ctx, 12, "fires")
    assert result is not None
    assert result["slots"]["n"] == 1
    assert result["values"]["unreportedTrials"][0]["nct"] == "NCT00000060"
    assert result["values"]["asOf"] == "2026-09-04"
    assert result["values"]["cutoff"] == "2024-09-04"


def test_seed_12_does_not_fire_when_the_registry_records_results():
    ctx = make_ctx(
        [page("quiet")],
        trials=[trial("NCT00000061", ["quiet"], status="Completed", completionDate="2020-01-01", hasResults=True)],
    )
    assert run(ctx, 12, "quiet") is None


def test_seed_12_does_not_fire_when_a_publication_cites_the_nct():
    ctx = make_ctx(
        [page("cited")],
        trials=[trial("NCT00000062", ["cited"], status="Completed", completionDate="2020-01-01", hasResults=False)],
        publications=[publication("PMID3", ["cited"], date="2021-01-01", nct="NCT00000062", publicationTypes=["Clinical Trial"])],
    )
    assert run(ctx, 12, "cited") is None


# --------------------------------------------------------------------------- seed 13

def test_seed_13_fires_when_another_compound_aims_at_the_same_target():
    ctx = make_ctx([
        page("fires", model="DEVELOPMENT", moleculartarget=F([{"symbol": "MTOR"}])),
        page(
            "approved-one",
            model="CLINICAL",
            moleculartarget=F([{"symbol": "MTOR"}]),
            regulatorystatus=F([{"jurisdiction": "US", "status": "approved"}]),
        ),
    ])
    result = run(ctx, 13, "fires")
    assert result is not None
    assert result["slots"]["target"] == "MTOR"
    assert result["slots"]["n"] == 1
    row = result["values"]["targets"][0]
    assert row["compounds"][0]["key"] == "approved-one"
    assert row["compounds"][0]["outcome"] == "approved"


def test_seed_13_does_not_fire_on_a_target_no_other_compound_shares():
    ctx = make_ctx([
        page("alone", model="DEVELOPMENT", moleculartarget=F([{"symbol": "PDE5A"}])),
        page("other", model="DEVELOPMENT", moleculartarget=F([{"symbol": "MTOR"}])),
    ])
    assert run(ctx, 13, "alone") is None


# --------------------------------------------------------------------------- seed 14

def test_seed_14_fires_on_a_reported_term_absent_from_the_label():
    ctx = make_ctx([
        page(
            "fires",
            model="CLINICAL",
            faers=F([{"term": "Alopecia", "count": 412, "period": "2004-2025"}, {"term": "Nausea", "count": 900}]),
            adverseevents=F(["Nausea", "Headache"]),
        )
    ])
    result = run(ctx, 14, "fires")
    assert result is not None
    assert [row["term"] for row in result["values"]["reportedNotOnLabel"]] == ["Alopecia"]
    assert result["values"]["reportedNotOnLabel"][0]["count"] == 412
    assert result["values"]["reportKind"] == "spontaneous reports, not incidence"


def test_seed_14_does_not_fire_without_a_captured_label_section():
    ctx = make_ctx([page("quiet", model="CLINICAL", faers=F([{"term": "Alopecia", "count": 412}]))])
    assert run(ctx, 14, "quiet") is None


def test_seed_14_does_not_fire_when_every_reported_term_is_on_the_label():
    ctx = make_ctx([
        page("agrees", model="CLINICAL", faers=F([{"term": "Nausea", "count": 900}]), adverseevents=F(["Nausea"]))
    ])
    assert run(ctx, 14, "agrees") is None


# --------------------------------------------------------------------------- seed 15

def test_seed_15_fires_and_reports_the_year_and_the_record():
    ctx = make_ctx(
        [page("fires")],
        trials=[trial("NCT00000070", ["fires"], completionDate="2019-05-01")],
    )
    result = run(ctx, 15, "fires")
    assert result is not None
    assert result["slots"]["year"] == 2019
    assert result["values"]["latest"]["record"] == "NCT00000070"
    assert result["values"]["yearsSince"] == 7
    assert result["values"]["asOf"] == "2026-09-04"


def test_seed_15_does_not_fire_without_a_dated_human_record():
    ctx = make_ctx([page("quiet")], trials=[trial("NCT00000071", ["quiet"], status="Completed")])
    assert run(ctx, 15, "quiet") is None


# --------------------------------------------------------------------------- seed 16

def test_seed_16_fires_and_reports_max_median_and_the_count_under_thirty():
    ctx = make_ctx(
        [page("fires")],
        trials=[
            trial("NCT00000080", ["fires"], enrollment=12),
            trial("NCT00000081", ["fires"], enrollment=40),
            trial("NCT00000082", ["fires"], enrollment=100),
        ],
    )
    result = run(ctx, 16, "fires")
    assert result is not None
    assert result["values"]["maxN"] == 100
    assert result["values"]["medianN"] == 40
    assert result["values"]["countUnder30"] == 1
    assert result["values"]["largestTrial"]["nct"] == "NCT00000082"


def test_seed_16_does_not_fire_without_a_recorded_enrolment():
    ctx = make_ctx([page("quiet")], trials=[trial("NCT00000083", ["quiet"], status="Completed")])
    assert run(ctx, 16, "quiet") is None


# --------------------------------------------------------------------------- seed 17

def test_seed_17_fires_when_two_of_the_five_jurisdictions_differ():
    ctx = make_ctx([
        page(
            "fires",
            regulatorystatus=F([
                {"jurisdiction": "US", "status": "supplement", "source": SOURCE, "sourceDate": "2024-01-01"},
                {"jurisdiction": "UK", "status": "controlled", "source": SOURCE, "sourceDate": "2024-01-01"},
                {"jurisdiction": "AU", "status": "unknown"},
            ]),
        )
    ])
    result = run(ctx, 17, "fires")
    assert result is not None
    assert result["slots"]["jurisdictions"] == ["US", "UK"]  # AU is UNKNOWN and never counted
    assert {row["status"] for row in result["values"]["statuses"]} == {"supplement", "controlled"}


def test_seed_17_does_not_fire_when_every_recorded_jurisdiction_agrees():
    ctx = make_ctx([
        page(
            "quiet",
            regulatorystatus=F([
                {"jurisdiction": "US", "status": "approved"},
                {"jurisdiction": "EU", "status": "approved"},
            ]),
        )
    ])
    assert run(ctx, 17, "quiet") is None


# --------------------------------------------------------------------------- suppression (R2)

def _suppression_ctx():
    pages = [
        page(
            "suppressed-one",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}, "halfLife": {"value": 6, "unit": "h"}}),
            ladder=F([
                {"organism": "mouse", "evidenceKind": "lifespan", "route": "IP", "direction": "increased",
                 "sentence": "Median survival increased when the compound was given intraperitoneally to mice.", "pmid": "93"},
                {"organism": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "HOMA-IR",
                 "sentence": "HOMA-IR increased over a 12-week course.", "pmid": "94"},
                {"organism": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "HOMA-IR",
                 "sentence": "No significant effect on HOMA-IR was seen over 24 months.", "pmid": "95"},
            ]),
            biomarkers=F(["HOMA-IR"]),
            trialfailures=F([
                {"nct": "NCT00000090", "whyStopped": "Terminated for futility"},
                {"nct": "NCT00000091", "whyStopped": "Slow accrual"},
            ]),
        ),
        page(
            "cleared-one",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}, "halfLife": {"value": 6, "unit": "h"}}),
            ladder=F([
                {"organism": "mouse", "evidenceKind": "lifespan", "route": "IP", "direction": "increased",
                 "sentence": "Median survival increased when the compound was given intraperitoneally to mice.", "pmid": "90"},
                {"organism": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "HOMA-IR",
                 "sentence": "HOMA-IR increased over a 12-week course.", "pmid": "91"},
                {"organism": "human", "evidenceKind": "biomarker", "primaryOutcomeVerbatim": "HOMA-IR",
                 "sentence": "No significant effect on HOMA-IR was seen over 24 months.", "pmid": "92"},
            ]),
            biomarkers=F(["HOMA-IR"]),
        ),
    ]
    trials = [
        trial("NCT00000092", ["suppressed-one", "cleared-one"], primaryOutcomes=["HOMA-IR"], enrollment=20, startDate="2015-01-01", completionDate="2015-04-01", resultDirection="increased"),
        trial("NCT00000093", ["suppressed-one", "cleared-one"], primaryOutcomes=["HOMA-IR"], enrollment=60, startDate="2016-01-01", completionDate="2018-01-01", resultDirection="no effect"),
    ]
    return make_ctx(pages, trials=trials, suppressed=["suppressed-one"])


def test_seeds_1_2_and_6_are_absent_for_a_suppressed_page_not_flagged():
    ctx = _suppression_ctx()
    for number in (1, 2, 6):
        seed = next(s for s in compute.SEEDS if s["number"] == number)
        records, skipped, considered = compute.compute_seed(ctx, seed)
        keys = [record["key"] for record in records]
        assert "suppressed-one" not in keys, "seed %d leaked a suppressed page" % number
        assert "cleared-one" in keys, "seed %d should still fire on the cleared page" % number
        assert skipped == 1
        assert considered == 1
        assert json.dumps(records).find("suppressed-one") == -1


def test_suppression_is_scoped_to_seeds_1_2_and_6():
    ctx = _suppression_ctx()
    seed_three = next(s for s in compute.SEEDS if s["number"] == 3)
    records, skipped, considered = compute.compute_seed(ctx, seed_three)
    assert [record["key"] for record in records] == ["suppressed-one"]
    assert skipped == 0


def test_every_seed_naming_the_reader_skips_suppressed_pages():
    for seed in compute.SEEDS:
        names_reader = bool(compute.READER_WORDS.search(seed["spec_wording"]))
        if names_reader:
            assert compute.seed_skips_suppressed(seed), "seed %d names the reader and must skip suppressed pages" % seed["number"]
    assert {s["number"] for s in compute.SEEDS if s["suppressionAbsolute"]} == {1, 2, 6}


# --------------------------------------------------------------------------- seed table

def test_only_the_seventeen_kept_seeds_exist():
    numbers = [seed["number"] for seed in compute.SEEDS]
    assert numbers == list(range(1, 18))
    assert 18 not in numbers and 19 not in numbers and 20 not in numbers and 21 not in numbers


# --------------------------------------------------------------------------- end to end

def test_cli_writes_seed_files_indexes_and_fire_counts():
    work = tempfile.mkdtemp(prefix="derived-cli-test-")
    _TEMP_DIRS.append(work)
    fields_dir = os.path.join(work, "fields")
    registry_dir = os.path.join(work, "registry")
    out_dir = os.path.join(work, "derived")
    os.makedirs(fields_dir)
    os.makedirs(registry_dir)

    pages = [
        page(
            "alpha",
            kinetics=F({"bioavailability": {"value": 5, "unit": "%"}}),
            ladder=F([{"organism": "mouse", "evidenceKind": "lifespan", "route": "IP", "direction": "increased"}]),
        ),
        page(
            "beta",
            kinetics=F({"bioavailability": {"value": 9, "unit": "%"}}),
            ladder=F([{"organism": "rat", "evidenceKind": "lifespan", "route": "SC", "direction": "increased"}]),
        ),
    ]
    with open(os.path.join(fields_dir, "batch-000.ndjson"), "w", encoding="utf-8") as handle:
        for record in pages:
            handle.write(json.dumps(record) + "\n")
    with open(os.path.join(registry_dir, "trials.ndjson"), "w", encoding="utf-8") as handle:
        handle.write(json.dumps(trial("NCT00000100", ["alpha"], enrollment=25, completionDate="2019-05-01")) + "\n")
    assignments = os.path.join(work, "assignments.ndjson")
    with open(assignments, "w", encoding="utf-8") as handle:
        handle.write(json.dumps({"key": "beta", "suppressed": True, "classes": ["S6"]}) + "\n")
        handle.write(json.dumps({"key": "alpha", "suppressed": False, "classes": ["S11"]}) + "\n")

    code = compute.main([
        "--fields", fields_dir,
        "--registry", registry_dir,
        "--assignments", assignments,
        "--out", out_dir,
        "--as-of", "2026-09-04",
    ])
    assert code == 0

    with open(os.path.join(out_dir, "fire-counts.json"), encoding="utf-8") as handle:
        summary = json.load(handle)
    assert set(summary["seeds"]) == {str(n) for n in range(1, 18)}
    assert "18" not in summary["seeds"]
    for entry in summary["seeds"].values():
        assert set(("computable", "fires", "sample", "discarded", "reason")) <= set(entry)
        assert len(entry["sample"]) <= 10
    assert summary["asOf"] == "2026-09-04"
    assert summary["seeds"]["1"]["fires"] == 1  # beta is suppressed and never computed
    assert summary["seeds"]["1"]["discarded"] is True  # below the 40-page floor
    assert summary["seeds"]["1"]["reason"].startswith("discarded:")

    seed_one = [json.loads(line) for line in open(os.path.join(out_dir, "seed-01-bioavailability-gap.ndjson"), encoding="utf-8")]
    assert [record["key"] for record in seed_one] == ["alpha"]
    assert not os.path.exists(os.path.join(out_dir, "seed-18-human-equivalent-dose.ndjson"))
    assert sorted(os.listdir(os.path.join(out_dir, "indexes"))) == ["enzyme-transporter.ndjson", "target.ndjson"]
    files = sorted(f for f in os.listdir(out_dir) if f.endswith(".ndjson"))
    assert len(files) == 17


def test_cli_reports_seeds_as_not_computable_when_an_input_directory_is_missing():
    work = tempfile.mkdtemp(prefix="derived-cli-empty-")
    _TEMP_DIRS.append(work)
    out_dir = os.path.join(work, "derived")
    assignments = os.path.join(work, "assignments.ndjson")
    open(assignments, "w", encoding="utf-8").close()
    code = compute.main([
        "--fields", os.path.join(work, "missing-fields"),
        "--registry", os.path.join(work, "missing-registry"),
        "--assignments", assignments,
        "--out", out_dir,
        "--as-of", "2026-09-04",
    ])
    assert code == 0
    with open(os.path.join(out_dir, "fire-counts.json"), encoding="utf-8") as handle:
        summary = json.load(handle)
    assert summary["seeds"]["1"]["computable"] is False
    assert "field records" in summary["seeds"]["1"]["reason"]
    assert summary["seeds"]["15"]["computable"] is False
    assert "registry records" in summary["seeds"]["15"]["reason"]
    assert all(entry["fires"] == 0 for entry in summary["seeds"].values())


# --------------------------------------------------------------------------- registry aggregate shape

def test_registry_aggregates_drive_seed_03():
    ctx = make_ctx(
        [page("agg")],
        aggregates=[aggregate("agg", stopped=[
            {"nct": "NCT00000200", "status": "TERMINATED", "whyStopped": "Sponsor decision"},
            {"nct": "NCT00000201", "status": "TERMINATED", "whyStopped": "Study halted for safety: hepatotoxicity"},
        ])],
    )
    result = run(ctx, 3, "agg")
    assert result is not None
    clusters = {row["cluster"]: row for row in result["values"]["clusters"]}
    assert set(clusters) == {"safety", "sponsor decision unspecified"}
    assert clusters["safety"]["ncts"] == ["NCT00000201"]


def test_registry_aggregates_drive_seed_04():
    ctx = make_ctx(
        [page("agg", humanceiling=F({"anyAgingEndpoint": True, "trials": ["NCT00000210"]}))],
        aggregates=[aggregate("agg", primaryOutcomes=[
            {"nct": "NCT00000210", "measure": "Change in hs-CRP", "timeFrame": "12 weeks"},
        ])],
    )
    result = run(ctx, 4, "agg")
    assert result is not None
    assert [row["endpoint"] for row in result["values"]["measured"]] == ["inflammatory markers"]
    assert result["values"]["measured"][0]["records"][0]["record"] == "NCT00000210"


def test_registry_aggregates_drive_seed_09():
    ctx = make_ctx(
        [page("agg")],
        aggregates=[aggregate("agg", ongoing=[
            {"nct": "NCT00000220", "title": "A running trial", "n": 200, "primaryOutcome": "Gait speed", "completionDate": "2028-01-31"},
        ])],
    )
    result = run(ctx, 9, "agg")
    assert result is not None
    assert result["slots"]["endpoint"] == "function"
    assert result["values"]["trials"][0]["readoutDate"] == "2028-01-31"
    assert result["values"]["trials"][0]["n"] == 200


def test_registry_aggregates_drive_seed_12_and_record_the_missing_publication_check():
    ctx = make_ctx(
        [page("agg")],
        aggregates=[aggregate("agg", completedOverTwoYearsWithoutResults=[
            {"nct": "NCT00000230", "completionDate": "2015-01"},
        ])],
    )
    result = run(ctx, 12, "agg")
    assert result is not None
    assert result["values"]["unreportedTrials"][0]["nct"] == "NCT00000230"
    assert "publicationCheck" in result["values"]


def test_registry_aggregates_drive_seed_16_without_claiming_a_count_under_thirty():
    ctx = make_ctx(
        [page("agg")],
        aggregates=[aggregate("agg", enrolment={"max": 62538, "median": 1191, "n": 27})],
    )
    result = run(ctx, 16, "agg")
    assert result is not None
    assert result["values"]["maxN"] == 62538
    assert result["values"]["medianN"] == 1191
    assert "countUnder30" not in result["values"]  # per-trial enrolments are not published
    assert "per-trial enrolments are not published" in result["values"]["basis"]


def test_seed_02_marks_test_c_unknown_when_the_registry_cannot_express_it():
    ctx = make_ctx(
        [page("agg", biomarkers=F(["HOMA-IR"]), kinetics=F({"halfLife": {"value": 6, "unit": "h"}}))],
        aggregates=[aggregate("agg", primaryOutcomes=[{"nct": "NCT00000240", "measure": "Change in HOMA-IR"}])],
    )
    result = run(ctx, 2, "agg")
    assert result is not None
    assert result["values"]["tests"]["c_smallHumanTrialReportedEffect"] == "unknown"
    assert result["values"]["missing"] == []  # unknown is not the same as missing
    assert result["values"]["notDeterminable"][0]["test"] == "c_smallHumanTrialReportedEffect"


def test_aggregate_only_registry_reports_seed_15_as_not_computable_without_a_completion_date():
    ctx = make_ctx([page("agg")], aggregates=[aggregate("agg", enrolment={"max": 10, "median": 10, "n": 1})])
    seed_fifteen = next(s for s in compute.SEEDS if s["number"] == 15)
    computable, reason = compute.computability(ctx, seed_fifteen, True, True)
    assert computable is False and "lastCompletionDate" in reason


def test_seed_06_needs_no_registry_capability_once_it_reads_stored_sentences():
    """Its Phase 2b form needed a recorded result direction the snapshot does not carry. The
    amended form reads the field records, so an aggregate-only registry no longer blocks it; the
    seed is still discarded, on its fire count (2), not on computability."""
    ctx = make_ctx([page("agg")], aggregates=[aggregate("agg", enrolment={"max": 10, "median": 10, "n": 1})])
    seed_six = next(s for s in compute.SEEDS if s["number"] == 6)
    computable, reason = compute.computability(ctx, seed_six, True, True)
    assert computable is True and reason is None


def test_the_published_registry_aggregate_batch_parses():
    """Guard against the real Phase 2 shape drifting away from this executor."""
    batch = os.path.join(_ROOT, "data", "corpus-20k", "registry", "aggregates", "batch-0001.ndjson")
    if not os.path.exists(batch):
        return
    with open(batch, encoding="utf-8") as handle:
        records = [json.loads(line) for line in handle][:25]
    parsed = [compute.build_aggregate(record) for record in records]
    assert all(p is not None for p in parsed)
    assert all(isinstance(p["enrolment"], dict) and isinstance(p["primaryOutcomes"], list) for p in parsed)
    assert any(p["stopped"] or p["ongoing"] or p["primaryOutcomes"] for p in parsed)


def test_a_matches_record_is_not_mistaken_for_a_trial_or_a_publication():
    record = {"key": "some-page", "nctIds": [{"nct": "NCT00000250", "matchedName": "Example", "role": "intervention"}]}
    assert compute.build_trial(record) is None
    assert compute.build_publication(record) is None
    assert compute.build_aggregate(record) is None


def test_seed_17_cites_the_register_that_recorded_each_status():
    """The real regulatory field is keyed by jurisdiction and carries register evidence rows."""
    ctx = make_ctx([
        page(
            "registers",
            model="CLINICAL",
            regulatory=F({
                "US": {"status": "unknown", "evidence": [], "sources": ["Drugs@FDA"]},
                "CA": {
                    "status": "approved",
                    "evidence": [{"register": "Health Canada DPD", "id": "14912", "statement": "drug code 14912: MARKETED", "sourceDate": "2026-09-04"}],
                    "sources": ["Health Canada Drug Product Database"],
                },
                "UK": {"status": "controlled", "evidence": [{"register": "Example register", "id": "7", "statement": "Schedule 2", "sourceDate": "2026-01-02"}]},
            }),
        )
    ])
    result = run(ctx, 17, "registers")
    assert result is not None
    assert result["slots"]["jurisdictions"] == ["UK", "CA"] or result["slots"]["jurisdictions"] == ["CA", "UK"]
    rows = {row["jurisdiction"]: row for row in result["values"]["statuses"]}
    assert "US" not in rows  # recorded as unknown, and never counted
    assert rows["CA"]["source"]["register"] == "Health Canada DPD"
    assert rows["CA"]["sourceDate"] == "2026-09-04"
    assert rows["CA"]["evidence"][0]["statement"] == "drug code 14912: MARKETED"


def test_the_published_field_batches_parse():
    """Guard against the real Phase 2 field shape drifting away from this executor."""
    import glob as _glob

    batches = []
    for model_dir in sorted(_glob.glob(os.path.join(_ROOT, "data", "corpus-20k", "fields", "*"))):
        if os.path.isdir(model_dir):
            found = sorted(_glob.glob(os.path.join(model_dir, "*.ndjson")))
            batches.extend(found[:1])  # the first batch of every model directory
    if not batches:
        return
    seen_models = set()
    for path in batches:
        with open(path, encoding="utf-8") as handle:
            records = [json.loads(line) for line in handle][:25]
        for record in records:
            built = compute.build_page(record, set())
            assert built is not None
            assert built.model in {"LONGEVITY", "CLINICAL", "DEVELOPMENT"}
            seen_models.add(built.model)
            # every field name in the record maps onto a canonical field this executor knows
            for name in (record.get("fields") or {}):
                assert compute.ALIAS_INDEX.get(compute._alias_key(name)) is not None, (
                    "unmapped field name %r in %s" % (name, os.path.basename(path))
                )
    assert seen_models


# ------------------------------------------------- Phase 2c amendments (seeds 1, 2, 7, 15)

def test_seed_01_reads_the_study_route_from_the_ladder_sentence():
    """The assembled rungs carry a sentence and no route field; the route word is the source's."""
    sentence = "A single dose of the compound administered to mice intraperitoneally increased median survival."
    ctx = make_ctx([
        page(
            "sentence-route",
            kinetics=F({"bioavailability": {"value": 12, "unit": "%"}}),
            ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": sentence, "pmid": "1"}]}),
        )
    ])
    result = run(ctx, 1, "sentence-route")
    assert result is not None
    assert result["slots"] == {"route": "IP", "organism": "mouse"}
    finding = result["values"]["positiveFindings"][0]
    assert finding["routeVerbatim"] == "intraperitoneally"  # verbatim, not the canonical token
    assert finding["sentence"] == sentence


def test_seed_01_does_not_fire_when_the_sentence_names_an_oral_route():
    ctx = make_ctx([
        page(
            "oral-sentence",
            kinetics=F({"bioavailability": {"value": 12, "unit": "%"}}),
            ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": "Mice fed the compound in the diet lived longer.", "pmid": "2"}]}),
        )
    ])
    assert run(ctx, 1, "oral-sentence") is None


def test_seed_01_does_not_fire_when_the_sentence_states_no_route():
    ctx = make_ctx([
        page(
            "no-route",
            kinetics=F({"bioavailability": {"value": 12, "unit": "%"}}),
            ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": "The compound increased median survival in mice.", "pmid": "3"}]}),
        )
    ])
    assert run(ctx, 1, "no-route") is None


BIOMARKER_FIELD = {
    "terms": ["homa ir"],
    "measures": [{"term": "homa ir", "measureVerbatim": "Change in HOMA-IR", "nct": "NCT00000300"}],
    "vocabulary": "data/corpus-20k/fields/biomarker-vocabulary.json",
}


def test_seed_02_reads_the_assembled_biomarker_field_and_the_aggregate_per_trial_rows():
    """Test (c) is a recorded human enrolment of 30 or fewer, from aggregate v3 `perTrial`."""
    ctx = make_ctx(
        [page("v3", biomarkers=F(BIOMARKER_FIELD), kinetics=F({"halfLife": {"value": 6, "unit": "h"}}))],
        aggregates=[aggregate(
            "v3",
            primaryOutcomes=[{"nct": "NCT00000300", "measure": "Change in HOMA-IR"}],
            perTrial=[
                {"nct": "NCT00000300", "enrollment": 18, "phase": "PHASE2", "status": "COMPLETED"},
                {"nct": "NCT00000301", "enrollment": 240, "phase": "PHASE3", "status": "COMPLETED"},
            ],
        )],
    )
    result = run(ctx, 2, "v3")
    assert result is not None
    assert result["values"]["tests"]["c_smallHumanTrialReportedEffect"] is True
    assert result["values"]["smallestHumanTrial"]["nct"] == "NCT00000300"
    assert result["values"]["smallestHumanTrial"]["n"] == 18
    assert result["values"]["humanTrialsAtOrUnder30"] == 1
    # the registry states no direction of a primary result, and the seed never invents one
    assert "the registry states no direction" in result["values"]["smallestHumanTrial"]["rule"]


def test_seed_02_test_c_is_false_when_every_recorded_enrolment_is_over_thirty():
    ctx = make_ctx(
        [page("large", biomarkers=F(BIOMARKER_FIELD), kinetics=F({"halfLife": {"value": 6, "unit": "h"}}))],
        aggregates=[aggregate(
            "large",
            primaryOutcomes=[{"nct": "NCT00000300", "measure": "Change in HOMA-IR"}],
            perTrial=[{"nct": "NCT00000300", "enrollment": 240}],
        )],
    )
    result = run(ctx, 2, "large")
    assert result is not None
    assert result["values"]["tests"]["c_smallHumanTrialReportedEffect"] is False
    assert "smallestHumanTrial" not in result["values"]


def test_seed_07_fires_on_a_sentence_naming_a_sex_and_an_effect():
    sentence = "Epicatechin did not increase lifespan in female mice, while male mice lived longer."
    ctx = make_ctx([
        page("sexed", ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": sentence, "pmid": "40973907"}]}))
    ])
    result = run(ctx, 7, "sexed")
    assert result is not None
    assert result["slots"]["organism"] == "mouse"
    statement = result["values"]["sexStatements"][0]
    assert statement["origin"] == "organism ladder"
    assert statement["sentence"] == sentence
    assert statement["sexTermsVerbatim"] == ["female", "male"]
    assert "did not" in statement["effectTermsVerbatim"]


def test_seed_07_reads_an_itp_publication_sentence():
    sentence = "Halofuginone increased median lifespan in male but not female UM-HET3 mice."
    ctx = make_ctx([
        page("itp-pub", itp=F({"tested": True, "cohorts": [], "publications": [{"outcomeSentence": sentence, "pmid": "40973907", "year": "2026"}]}))
    ])
    result = run(ctx, 7, "itp-pub")
    assert result is not None
    assert result["values"]["sexStatements"][0]["origin"] == "ITP publication"
    assert result["values"]["sexStatements"][0]["organism"] == "mouse"


def test_seed_07_does_not_fire_on_a_sentence_that_states_no_effect_word():
    ctx = make_ctx([
        page("bare", ladder=F({"rungs": [{"rung": "mouse", "evidenceKind": "lifespan", "sentence": "Male and female mice were assigned to the two arms.", "pmid": "4"}]}))
    ])
    assert run(ctx, 7, "bare") is None


def test_seed_15_reads_the_aggregate_v3_last_completion_date_object():
    ctx = make_ctx(
        [page("v3-age")],
        aggregates=[aggregate("v3-age", lastCompletionDate={
            "date": "2021-06-30",
            "nct": "NCT00000310",
            "over": "studies whose registry overall status is COMPLETED",
            "source": {"kind": "clinicaltrials.gov", "id": "NCT00000310"},
            "sourceDate": "2026-09-01",
        })],
    )
    result = run(ctx, 15, "v3-age")
    assert result is not None
    assert result["slots"]["year"] == 2021
    assert result["values"]["latest"]["record"] == "NCT00000310"
    assert result["values"]["latest"]["recordKind"] == "NCT"
    assert result["values"]["latest"]["source"]["id"] == "NCT00000310"
    assert result["values"]["yearsSince"] == 5


def test_seed_15_is_computable_once_the_aggregate_states_a_last_completion_date():
    ctx = make_ctx(
        [page("v3-age")],
        aggregates=[aggregate("v3-age", lastCompletionDate={"date": "2021-06-30", "nct": "NCT00000310"})],
    )
    seed_fifteen = next(s for s in compute.SEEDS if s["number"] == 15)
    computable, reason = compute.computability(ctx, seed_fifteen, True, True)
    assert computable is True and reason is None


# --------------------------------------------------------------------------- runner

def _cleanup():
    for path in _TEMP_DIRS:
        shutil.rmtree(path, ignore_errors=True)


if __name__ == "__main__":
    failures = 0
    passed = 0
    tests = [(name, obj) for name, obj in sorted(globals().items()) if name.startswith("test_") and callable(obj)]
    for name, fn in tests:
        try:
            fn()
        except Exception as exc:  # noqa: BLE001 - a standalone runner reports every failure
            failures += 1
            import traceback

            print("FAIL %s: %s" % (name, exc))
            traceback.print_exc()
        else:
            passed += 1
            print("ok   %s" % name)
    _cleanup()
    print("\n%d passed, %d failed, %d total" % (passed, failures, len(tests)))
    sys.exit(1 if failures else 0)
