"""Score the mechanism-predicted interactions (tier C) against the label-documented
ones (tier A), per rule, per confidence band and overall.

Two precisions are reported for every rule and band, because an FDA label is not a
complete list of a medicine's interactions and absence from one is not evidence of
absence:

  label_adjudicated_precision  over the pairs the labels actually speak about: a pair
                               a label documents (positive) or a pair a label says was
                               studied with no change stated (negative). This is the
                               measure the bars in docs/specs/interaction-rules.md
                               section 5 apply to, and its coverage is reported beside
                               it so it is never read as more than it is.
  label_coverage_precision     over every predicted pair whose two pages both hold an
                               interaction-bearing label section: the share a label
                               prints. It is bounded above by how much of a medicine's
                               interaction set its label prints; the base rate for a
                               random pair of such pages is reported for comparison.

Recall is over the label-documented pairs and carries no bar.

DDInter is not read: the non-commercial gate in docs/revamp/BLOCKERS.md is not lifted.

    .venv-corpus/bin/python scripts/revamp/validate_interactions.py

Writes data/revamp/interaction-validation.json and prints at most 50 rows.
"""

from __future__ import annotations

import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone

import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INTERACTIONS = os.path.join(ROOT, "data", "revamp", "interactions",
                            "interactions-all-rules.parquet")
PUBLISHED = os.path.join(ROOT, "data", "revamp", "interactions", "interactions.parquet")
BUILD_SUMMARY = os.path.join(ROOT, "data", "revamp", "interactions", "build-summary.json")
CHECKED = os.path.join(ROOT, "data", "revamp", "interactions", "checked-sources.parquet")
OPENFDA_MAPPED = os.path.join(ROOT, "data", "sources", "openfda-label", "mapped.parquet")
OUT = os.path.join(ROOT, "data", "revamp", "interaction-validation.json")

LIKELY_PRECISION_BAR = 0.60
RULE_PRECISION_BAR = 0.40
NEGATIVE_DIRECTION = "no change stated"
INTERACTION_SECTIONS = ("drug_interactions", "contraindications", "warnings_and_cautions")

ALL_RULES = (
    "C1-cyp-inhibitor-substrate",
    "C1-cyp-inducer-substrate",
    "C2-shared-target-same-direction",
    "C3-additive-serotonergic",
    "C3-additive-CNS-depressant",
    "C3-additive-anticoagulant-antiplatelet",
    "C3-additive-hypotensive",
    "C3-additive-hypoglycaemic",
    "C3-additive-nephrotoxic",
    "C3-additive-hepatotoxic",
    "C3-additive-hyperkalaemic",
    "C3-additive-QT-prolonging",
)


def main():
    frame = pd.read_parquet(INTERACTIONS)
    published = pd.read_parquet(PUBLISHED)
    with open(BUILD_SUMMARY, encoding="utf-8") as fh:
        build = json.load(fh)
    excluded_from_publication = set(build.get("disabled_rules") or [])
    openfda = pd.read_parquet(OPENFDA_MAPPED)
    checked = pd.read_parquet(CHECKED)
    sectioned = set(openfda.loc[openfda["field"].isin(INTERACTION_SECTIONS), "key"])
    corpus_pages = set(checked["page"])
    sectioned &= corpus_pages

    tier_a = frame[frame["tier"] == "A"]
    tier_c = frame[frame["tier"] == "C"]
    linked_a = tier_a[tier_a["page_b"].notna()]

    positives = set()
    negatives = set()
    for pair, direction in zip(linked_a["pair_id"], linked_a["direction"]):
        if direction == NEGATIVE_DIRECTION:
            negatives.add(pair)
        else:
            positives.add(pair)
    negatives -= positives
    adjudicated = positives | negatives

    def both_sectioned(pair):
        parts = pair.split("|")
        return len(parts) == 2 and parts[0] in sectioned and parts[1] in sectioned

    coverage_positives = {p for p in positives if both_sectioned(p)}
    possible_pairs = len(sectioned) * (len(sectioned) - 1) // 2
    base_rate = len(coverage_positives) / possible_pairs if possible_pairs else None

    def score(predicted):
        adjudged = predicted & adjudicated
        adj_hits = adjudged & positives
        covered = {p for p in predicted if both_sectioned(p)}
        cov_hits = covered & coverage_positives
        return {
            "predicted_pairs": len(predicted),
            "label_adjudicated_pairs": len(adjudged),
            "label_adjudicated_true": len(adj_hits),
            "label_adjudicated_false": len(adjudged) - len(adj_hits),
            "label_adjudicated_precision":
                round(len(adj_hits) / len(adjudged), 4) if adjudged else None,
            "both_pages_have_an_interaction_section": len(covered),
            "label_coverage_precision":
                round(len(cov_hits) / len(covered), 4) if covered else None,
            "label_coverage_precision_over_base_rate":
                round((len(cov_hits) / len(covered)) / base_rate, 1)
                if covered and base_rate else None,
            "recall": round(len(predicted & positives) / len(positives), 4) if positives else None,
        }

    by_rule_pairs = defaultdict(set)
    by_band_pairs = defaultdict(set)
    by_rule_band_pairs = defaultdict(set)
    rows_per_rule = defaultdict(int)
    all_c_pairs = set()
    for pair, rule, band in zip(tier_c["pair_id"], tier_c["rule_id"], tier_c["confidence"]):
        by_rule_pairs[rule].add(pair)
        by_band_pairs[band].add(pair)
        by_rule_band_pairs[(rule, band)].add(pair)
        rows_per_rule[rule] += 1
        all_c_pairs.add(pair)

    overall = score(all_c_pairs)
    by_band = {band: score(pairs) for band, pairs in sorted(by_band_pairs.items())}
    by_rule = {rule: score(by_rule_pairs.get(rule, set())) for rule in ALL_RULES}
    by_rule_and_band = {"%s / %s" % (rule, band): score(pairs)
                        for (rule, band), pairs in sorted(by_rule_band_pairs.items())}

    disabled = []
    for rule in ALL_RULES:
        result = by_rule[rule]
        precision = result["label_adjudicated_precision"]
        if result["predicted_pairs"] == 0:
            if rule not in by_rule_pairs:
                disabled.append({
                    "rule_id": rule,
                    "label_adjudicated_precision": None,
                    "predicted_pairs": 0,
                    "reason": ("the rule fired on no pair: the cleared pharmacologic-action "
                               "vocabularies name no member of this class, so the parquet "
                               "carries no row for it"),
                })
            continue
        if precision is None:
            disabled.append({
                "rule_id": rule,
                "label_adjudicated_precision": None,
                "predicted_pairs": result["predicted_pairs"],
                "label_documented_pairs": result["label_adjudicated_true"],
                "reason": ("no label speaks about any of its %d predicted pairs and none is "
                           "label-documented, so the rule cannot be measured and is not "
                           "published" % result["predicted_pairs"]),
            })
        elif precision < RULE_PRECISION_BAR:
            disabled.append({
                "rule_id": rule,
                "label_adjudicated_precision": precision,
                "predicted_pairs": result["predicted_pairs"],
                "reason": ("label-adjudicated precision %.4f is below the %.2f bar in "
                           "docs/specs/interaction-rules.md section 5"
                           % (precision, RULE_PRECISION_BAR)),
            })

    likely = by_band.get("likely", {})
    likely_precision = likely.get("label_adjudicated_precision")
    result = {
        "run": "revamp 2026-09 Phase 4.1 interaction validation",
        "method": "docs/specs/interaction-rules.md section 6",
        "universe": {
            "corpus_pages": len(corpus_pages),
            "pages_with_an_interaction_bearing_label_section": len(sectioned),
            "label_documented_pairs": len(positives),
            "label_pairs_studied_with_no_change_stated": len(negatives),
            "label_documented_pairs_where_both_pages_have_such_a_section":
                len(coverage_positives),
            "possible_pairs_among_those_pages": possible_pairs,
            "base_rate_a_random_such_pair_is_label_documented":
                round(base_rate, 6) if base_rate else None,
            "tier_c_predicted_pairs": len(all_c_pairs),
            "tier_c_rows": int(len(tier_c)),
        },
        "bars": {
            "likely_precision_at_least": LIKELY_PRECISION_BAR,
            "rule_disabled_below_precision": RULE_PRECISION_BAR,
            "measure_the_bars_apply_to": "label_adjudicated_precision",
            "likely_precision_measured": likely_precision,
            "likely_precision_meets_the_bar":
                bool(likely_precision is not None and likely_precision >= LIKELY_PRECISION_BAR),
            "likely_pairs_the_labels_adjudicate": likely.get("label_adjudicated_pairs"),
        },
        "overall": overall,
        "by_band": by_band,
        "by_rule": by_rule,
        "by_rule_and_band": by_rule_and_band,
        "rows_per_rule_measured": dict(sorted(rows_per_rule.items())),
        "published": {
            "parquet": "data/revamp/interactions/interactions.parquet",
            "rows": int(len(published)),
            "rules_excluded": sorted(excluded_from_publication),
            "measured_table": "data/revamp/interactions/interactions-all-rules.parquet",
            "rows_measured": int(len(frame)),
        },
        "disabled": disabled,
        "ddinter": ("not used. DDInter 2.0 is CC BY-NC-SA and rnawiki.com is commercial; the "
                    "gate in docs/revamp/BLOCKERS.md is not lifted, so DDInter is neither a "
                    "second reference here nor joined to any page."),
        "notes": [
            ("An FDA label prints a fraction of the interactions a medicine has. Aprepitant's "
             "label names 23 counterparts while its own statement that it is a strong CYP3A4 "
             "inhibitor implicates every CYP3A4 substrate in the corpus. Counting every "
             "unmentioned pair as a false positive would therefore measure how much a label "
             "prints, not whether a prediction is right, which is why the bars apply to the "
             "pairs the labels adjudicate and the coverage measure is reported beside them."),
            ("label_adjudicated_precision rests on a small denominator: the labels state that a "
             "pair was studied with no change on %d pairs corpus-wide. Every rule's adjudicated "
             "pair count is reported so the number is read with its evidence."
             % len(negatives)),
            ("Tier A itself is a parsed reading of label prose. Its counterpart links were "
             "measured while building them: analyte pages that share a name with a medicine "
             "(prothrombin, angiotensin II, norepinephrine) still reach a small share of Tier A "
             "rows, recorded in data/revamp/interactions/lexicon-dropped.csv and "
             "docs/specs/interaction-rules.md section 1."),
        ],
    }

    # The earlier measurement stays beside the new one. A re-measurement after a rule's inputs
    # changed is only readable against what the rule scored before, and section 17 item 1 asks for
    # the figures to be written beside the earlier ones rather than over them. Only the top-level
    # `disabled` array binds the build; the kept runs are a record.
    previous = []
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as fh:
            held = json.load(fh)
        previous = list(held.get("previous_measurements") or [])
        previous.append({key: held.get(key) for key in
                         ("run", "measured_at", "bars", "overall", "by_band", "by_rule",
                          "rows_per_rule_measured", "published", "disabled", "universe")})
        previous = [entry for entry in previous if entry.get("overall")][-8:]
    result["previous_measurements"] = previous
    result["measured_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, sort_keys=True)

    lines = [
        "pages with an interaction-bearing label section: %d; label-documented pairs %d; "
        "pairs a label studied with no change stated %d"
        % (len(sectioned), len(positives), len(negatives)),
        "base rate a random pair of those pages is label-documented: %s" % (
            round(base_rate, 6) if base_rate else None),
        "overall  adjudicated precision %-7s (%d pairs) coverage precision %-7s recall %s"
        % (overall["label_adjudicated_precision"], overall["label_adjudicated_pairs"],
           overall["label_coverage_precision"], overall["recall"]),
    ]
    for band, res in by_band.items():
        lines.append("band %-9s adjudicated %-7s (%d pairs) coverage %-7s recall %s"
                     % (band, res["label_adjudicated_precision"],
                        res["label_adjudicated_pairs"], res["label_coverage_precision"],
                        res["recall"]))
    for rule in ALL_RULES:
        res = by_rule[rule]
        lines.append("rule %-40s adjudicated %-7s (%d pairs) coverage %-7s recall %-7s rows %d"
                     % (rule, res["label_adjudicated_precision"],
                        res["label_adjudicated_pairs"], res["label_coverage_precision"],
                        res["recall"], rows_per_rule.get(rule, 0)))
    for entry in disabled:
        lines.append("DISABLED %s: %s" % (entry["rule_id"], entry["reason"]))
    lines.append("published parquet %d rows; rules excluded: %s"
                 % (len(published), ", ".join(sorted(excluded_from_publication)) or "none"))
    print("\n".join(lines[:50]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
