#!/usr/bin/env python3
"""Step 3.4 — join the first identity pass and the second opinion, and classify each
second-opinion verdict by whether docs/specs/identity-resolution.md licenses applying it
on the evidence the second opinion cites.

Nothing is applied. The script writes four artefacts and one machine-readable summary:

  data/revamp/identity/second-opinion-classified.csv  every pair, both passes, classification, reach
  data/revamp/identity/apply-list.csv                 LICENSED-MERGE and LICENSED-FORM_OF rows
  data/revamp/identity/hold-list.csv                  pairs a person still has to decide, ordered by reach then tier
  data/revamp/identity-review.md                      the lead's adjudication draft
  data/revamp/identity/adjudication-summary.json      counts, reach split, review minutes, issues

Licensing rules, taken from docs/specs/identity-resolution.md and applied to the evidence the
second opinion cites, each check confirmed against the corpus's own recorded identifiers in
data/revamp/identity/spine-attached.parquet:

  LICENSED-MERGE     identical UNII with no exception class in play (ester, prodrug, stereoisomer,
                     biosimilar, combination, isotopologue, metal complex) and no K1/K2 structure
                     conflict; or identical full InChIKey; or a GSRS salt-to-parent link confirmed
                     by an FDA active-moiety match and a largest-fragment match.
  LICENSED-FORM_OF   an identical InChIKey skeleton with different full keys (spec §3.4/§5.1); or a
                     GSRS salt or ester relation cited without moiety confirmation (spec §3.2).
  LICENSED-SEPARATE  every `separate` verdict: it leaves the two pages exactly as they are.
  NOT-LICENSED       everything else — name-only merges, merges at medium or low confidence,
                     structure-conflict pairs, pairs §2 reserves for a person (K1/K2 disagreement),
                     and the rows that record a merge already in force rather than a decision.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
IDENT = ROOT / "data" / "revamp" / "identity"

REMAINDER = IDENT / "remainder.csv"
SECOND = IDENT / "second-opinion.csv"
FIRST_DECISIONS = ROOT / "data" / "revamp" / "identity-decisions.csv"
MERGE_MAP = IDENT / "merge-map.json"
RELATIONS = IDENT / "relations.parquet"
CANONICAL = IDENT / "canonical-v2.ndjson"
SPINE = IDENT / "spine-attached.parquet"
PRESENCE = ROOT / "data" / "revamp" / "presence-applicable.ndjson"
THRESHOLDS = ROOT / "data" / "revamp" / "thresholds.json"

OUT_CLASSIFIED = IDENT / "second-opinion-classified.csv"
OUT_APPLY = IDENT / "apply-list.csv"
OUT_HOLD = IDENT / "hold-list.csv"
OUT_REVIEW = ROOT / "data" / "revamp" / "identity-review.md"
OUT_SUMMARY = IDENT / "adjudication-summary.json"
OUT_WORKLOG = ROOT / "data" / "revamp" / "worklog-entries" / "3.4.md"

SECONDS_PER_HELD_PAIR = 60

# ---------------------------------------------------------------------------
# patterns

FULL_INCHIKEY = re.compile(r"\b([A-Z]{14})-([A-Z]{10})-([A-Z])\b")
SKELETON = re.compile(r"\b([A-Z]{14})\b")
UNII = re.compile(r"\b([A-Z0-9]{10})\b")
PAGE_KEY = re.compile(
    r"COMBO:\{[^}]*\}|COMBO:NAME:[a-z0-9 ./'\-]+|HOLD:existing:[a-z0-9\-]+|K[1-4]:[A-Za-z0-9#\-.]+"
)
TRAILING_WORD = re.compile(r"\s+([A-Za-z0-9#\-.]+)")
MERGE_MAP_CLAIM = re.compile(r"records\s+([^\s;,]+)\s+->\s+([^\s;,]+)")

EXCEPTION_CLASS_WORDS = {
    "ester": re.compile(r"\bester|\bacyl|\bpropionate\b|\bdipropionate\b|\bacetate\b|\bdiacetate\b"
                        r"|\benanthate\b|\bdecanoate\b|\bundecylenate\b|\bsuccinate ester\b"),
    "prodrug": re.compile(r"\bprodrug"),
    "stereoisomer": re.compile(r"\bstereoisomer|\bstereochem|\bracem|\bdiastereomer|\benantiomer"),
    "biosimilar": re.compile(r"\bbiosimilar"),
    "combination": re.compile(r"\bcombination\b|\bcomponent sets\b|§3\.7"),
    "isotopologue": re.compile(r"\bisotopolog|\bdeuterat|\bisotope\b|\btc 99m\b|\btechnetium\b"),
    "metal complex": re.compile(r"\bmetal complex\b|\bligand\b|\bchelat"),
}

K1K2_HOLD_REASON = "§2 holds a K1/K2 disagreement"
ALREADY_MERGED_REASON = "the named item no longer names two live corpus pages"
NAME_GROUP_REASON = "two pages collide on a display name"

REACH_ORDER = {"indexable": 0, "band": 1, "rest": 2}


# ---------------------------------------------------------------------------
# loading


def read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def load_presence() -> dict[str, dict]:
    out = {}
    with PRESENCE.open(encoding="utf-8") as fh:
        for line in fh:
            row = json.loads(line)
            out[row["key"]] = row
    return out


def load_display_names(wanted: set[str]) -> dict[str, str]:
    names: dict[str, str] = {}
    with CANONICAL.open(encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            row = json.loads(line)
            key = row.get("key")
            if key in wanted:
                names[key] = row.get("displayName") or key
            if len(names) == len(wanted):
                break
    return names


def load_spine() -> dict[str, dict]:
    frame = pd.read_parquet(SPINE)
    cols = ["unii", "unii_source", "inchikey", "inchikey14", "active_moiety_unii",
            "parent_unii", "substance_class", "tier"]
    out: dict[str, dict] = {}
    for row in frame.to_dict("records"):
        rec = {}
        for col in cols:
            value = row.get(col)
            rec[col] = None if value is None or (isinstance(value, float) and pd.isna(value)) else value
        out[row["key"]] = rec
    return out


def load_relations() -> dict[tuple[str, str], list[str]]:
    frame = pd.read_parquet(RELATIONS)
    out: dict[tuple[str, str], list[str]] = defaultdict(list)
    for row in frame.to_dict("records"):
        out[(row["page_a"], row["page_b"])].append(row["relation"])
    return out


def load_first_decisions() -> dict[tuple[str, str], list[dict]]:
    out: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in read_csv(FIRST_DECISIONS):
        out[(row["page_a"], row["page_b"])].append(row)
    return out


# ---------------------------------------------------------------------------
# reach


def build_reach(presence: dict[str, dict], thresholds: dict) -> tuple[dict[str, str], dict]:
    """indexable = the tier's derived threshold is met.

    band = the pages of a tier that has no derived threshold, at or above that tier's own
    `ruleAnswerAfterStubFloor` — the count the unchanged rule proposes and the all-pairs line
    check then rejects. That set is the one thresholds.json measures as sitting just over the
    lines. Where a tier does hold a threshold, its rule-answer set is the indexable set, so the
    tier contributes no band. rest = every other page.
    """
    spec = {}
    for tier_name, tier in thresholds["tiers"].items():
        number = int(tier_name.replace("tier", ""))
        spec[number] = {
            "threshold": tier.get("threshold"),
            "ruleAnswer": tier.get("ruleAnswerAfterStubFloor"),
        }
    reach: dict[str, str] = {}
    for key, row in presence.items():
        rule = spec.get(row["tier"], {})
        threshold, rule_answer = rule.get("threshold"), rule.get("ruleAnswer")
        if threshold is not None and row["present"] >= threshold:
            reach[key] = "indexable"
        elif threshold is None and rule_answer is not None and row["present"] >= rule_answer:
            reach[key] = "band"
        else:
            reach[key] = "rest"
    return reach, spec


# ---------------------------------------------------------------------------
# evidence reading


def cited(text: str) -> dict:
    """What the second opinion's own sentence claims, before any confirmation."""
    lowered = text.lower()
    full_keys = {"-".join(m.groups()) for m in FULL_INCHIKEY.finditer(text)}
    skeletons = set(SKELETON.findall(text)) | {k.split("-")[0] for k in full_keys}
    return {
        "identical_unii": bool(re.search(r"(identical|same|shared) UNII", text, re.I)),
        "identical_full_inchikey": bool(re.search(r"(identical|same) full InChIKey", text, re.I)),
        "skeleton_claim": bool(
            re.search(r"skeleton", lowered)
            and re.search(r"differ|different|vs\b|against\b", lowered)
        ),
        "gsrs_salt_or_ester": bool(
            re.search(r"gsrs|fda|§3\.1|§3\.2", lowered)
            and re.search(
                r"salt|solvate|hydrate|parent substance|active moiety|ester|acyl|adds \w+ to",
                lowered,
            )
        ),
        "active_moiety": "active moiety" in lowered,
        "full_keys": full_keys,
        "skeletons": skeletons,
        "unii_tokens": set(UNII.findall(text)),
    }


def exception_classes(*texts: str) -> list[str]:
    blob = " ".join(t for t in texts if t).lower()
    return sorted(name for name, pattern in EXCEPTION_CLASS_WORDS.items() if pattern.search(blob))


def confirm(a: dict | None, b: dict | None, claim: dict) -> dict:
    """What the corpus's own recorded identifiers confirm about the pair."""
    ua = (a or {}).get("unii")
    ub = (b or {}).get("unii")
    ika = (a or {}).get("inchikey")
    ikb = (b or {}).get("inchikey")
    s14a = (a or {}).get("inchikey14")
    s14b = (b or {}).get("inchikey14")
    ama = (a or {}).get("active_moiety_unii")
    amb = (b or {}).get("active_moiety_unii")
    pua = (a or {}).get("parent_unii")
    pub = (b or {}).get("parent_unii")

    same_unii = bool(ua and ub and ua == ub)
    same_full = bool(ika and ikb and ika == ikb)
    same_skeleton = bool(s14a and s14b and s14a == s14b)
    structure_conflict = bool(s14a and s14b and s14a != s14b)

    # An FDA active-moiety match: one page's recorded active moiety (or GSRS parent) is the other
    # page's own substance.
    moiety_parent = None
    if ub and (ama == ub or pua == ub):
        moiety_parent = "b"
    elif ua and (amb == ua or pub == ua):
        moiety_parent = "a"

    # A largest-fragment match: the parent skeleton the evidence names is the skeleton the parent
    # page itself carries.
    parent_skeleton = s14b if moiety_parent == "b" else (s14a if moiety_parent == "a" else None)
    fragment_match = bool(parent_skeleton and parent_skeleton in claim["skeletons"])

    return {
        "same_unii": same_unii,
        "same_full_inchikey": same_full,
        "same_skeleton_different_full": same_skeleton and bool(ika and ikb and ika != ikb),
        "structure_conflict": structure_conflict,
        "moiety_match": moiety_parent is not None,
        "moiety_parent_side": moiety_parent,
        "fragment_match": fragment_match,
    }


def classify(first: dict, second: dict, claim: dict, facts: dict, exceptions: list[str]) -> tuple[str, str]:
    verdict = second["verdict"]
    confidence = second["confidence"]
    reason = first["why_unresolved"]

    if verdict == "separate":
        return "LICENSED-SEPARATE", "a separate verdict leaves both pages exactly as they are"

    if K1K2_HOLD_REASON in reason:
        return (
            "NOT-LICENSED",
            "§2 holds a K1/K2 disagreement for a person and never resolves it by majority, so the "
            "second opinion alone does not license a change here",
        )

    if ALREADY_MERGED_REASON in reason:
        return (
            "NOT-LICENSED",
            "the row records a merge already in force from identity pass 2/3, not a decision to "
            "apply; the cited evidence is the corpus merge record, not one of the three licensed "
            "merge evidences",
        )

    if verdict == "form_of":
        if facts["same_skeleton_different_full"]:
            return (
                "LICENSED-FORM_OF",
                "the two pages carry one InChIKey skeleton and different full keys, which §3.4 "
                "and §5.1 split and link",
            )
        if claim["skeleton_claim"] and not facts["structure_conflict"]:
            return (
                "LICENSED-FORM_OF",
                "the evidence cites one shared InChIKey skeleton with the stereo layer differing, "
                "which §3.4 splits and links",
            )
        if claim["gsrs_salt_or_ester"] and not claim["active_moiety"]:
            return (
                "LICENSED-FORM_OF",
                "the evidence cites a GSRS salt or ester relation without moiety confirmation, "
                "which §3.2 links rather than merges",
            )
        return "NOT-LICENSED", "the cited evidence is not a skeleton match and not a GSRS salt or ester relation"

    # verdict == "merge"
    if confidence != "high":
        return "NOT-LICENSED", f"a merge at {confidence} confidence"

    if claim["identical_full_inchikey"]:
        if facts["same_full_inchikey"]:
            if exceptions:
                return "NOT-LICENSED", "an exception class is in play: " + ", ".join(exceptions)
            return "LICENSED-MERGE", "both pages carry the identical full InChIKey recorded in the corpus"
        return (
            "NOT-LICENSED",
            "the cited identical full InChIKey is not what the corpus records for these two pages",
        )

    if claim["identical_unii"]:
        if not facts["same_unii"]:
            return "NOT-LICENSED", "the cited identical UNII is not what the corpus records for these two pages"
        if facts["structure_conflict"]:
            return (
                "NOT-LICENSED",
                "the two pages share a UNII but carry different InChIKey skeletons, which §2 holds",
            )
        if exceptions:
            return "NOT-LICENSED", "an exception class is in play: " + ", ".join(exceptions)
        return "LICENSED-MERGE", "both pages carry the identical UNII recorded in the corpus and no exception class applies"

    if claim["gsrs_salt_or_ester"] and facts["moiety_match"] and facts["fragment_match"]:
        if exceptions:
            return "NOT-LICENSED", "an exception class is in play: " + ", ".join(exceptions)
        return (
            "LICENSED-MERGE",
            "a GSRS salt-to-parent link confirmed by the FDA active moiety the corpus records and "
            "by the parent skeleton the evidence names",
        )

    if claim["gsrs_salt_or_ester"] and facts["moiety_match"]:
        return "NOT-LICENSED", "an FDA active-moiety match with no largest-fragment match to confirm it"

    if facts["same_full_inchikey"]:
        return "LICENSED-MERGE", "both pages carry the identical full InChIKey recorded in the corpus"

    return "NOT-LICENSED", "the cited evidence is a name match, not one of the three licensed merge evidences"


# ---------------------------------------------------------------------------
# main


def main() -> int:
    remainder = read_csv(REMAINDER)
    second = read_csv(SECOND)
    if len(remainder) != len(second):
        raise SystemExit(f"row counts differ: remainder {len(remainder)} vs second opinion {len(second)}")
    for a, b in zip(remainder, second):
        if (a["page_a"], a["page_b"]) != (b["page_a"], b["page_b"]):
            raise SystemExit(f"row order differs at {a['page_a']} | {a['page_b']}")

    presence = load_presence()
    thresholds = json.loads(THRESHOLDS.read_text(encoding="utf-8"))
    reach_of, tier_spec = build_reach(presence, thresholds)
    spine = load_spine()
    relations = load_relations()
    merge_map = json.loads(MERGE_MAP.read_text(encoding="utf-8"))
    first_decisions = load_first_decisions()

    rows: list[dict] = []
    issues: list[str] = []
    contradicted: list[dict] = []
    already_merged: list[dict] = []
    name_group: list[dict] = []

    for index, (first, second_row) in enumerate(zip(remainder, second)):
        key_a = first["page_a"].strip()
        key_b = first["page_b"].strip()
        counterpart_source = "page_b"
        if not key_b:
            found = []
            for match in PAGE_KEY.finditer(second_row["evidence"]):
                candidate = match.group(0)
                # a K4 name-family key holds spaces, so extend the match word by word while the
                # corpus still recognises the longer key
                tail = second_row["evidence"][match.end():]
                extended = candidate
                while True:
                    step = TRAILING_WORD.match(tail)
                    if not step:
                        break
                    longer = extended + " " + step.group(1)
                    if longer not in spine:
                        break
                    extended = longer
                    tail = tail[step.end():]
                if extended in spine and extended != key_a:
                    found.append(extended)
            key_b = found[0] if found else ""
            counterpart_source = "second-opinion evidence" if key_b else "none recorded"

        try:
            first_evidence = json.loads(first["evidence"])
        except json.JSONDecodeError:
            first_evidence = {}

        claim = cited(second_row["evidence"])
        facts = confirm(spine.get(key_a), spine.get(key_b), claim)
        exceptions = exception_classes(second_row["evidence"], first["why_unresolved"])
        classification, ground = classify(first, second_row, claim, facts, exceptions)

        keys = [k for k in (key_a, key_b) if k in presence]
        reach = min((reach_of[k] for k in keys), key=lambda r: REACH_ORDER[r]) if keys else "rest"
        tier = min((presence[k]["tier"] for k in keys), default=3)

        existing = sorted(set(relations.get((key_a, key_b), []) + relations.get((key_b, key_a), [])))
        first_actions = sorted(
            {d["action"] for d in first_decisions.get((first["page_a"], first["page_b"]), [])}
        )

        row = {
            "page_a": first["page_a"],
            "page_b": first["page_b"],
            "first_pass_reason": first["why_unresolved"],
            "second_verdict": second_row["verdict"],
            "second_evidence": second_row["evidence"],
            "confidence": second_row["confidence"],
            "classification": classification,
            "reach": reach,
            # working columns kept for the lead, after the eight the brief names
            "tier": tier,
            "licence_ground": ground,
            "resolved_page_b": key_b,
            "page_b_source": counterpart_source,
            "name_a": first_evidence.get("a") or first_evidence.get("name_a")
            or first_evidence.get("name_child") or first_evidence.get("displayName") or "",
            "name_b": first_evidence.get("b") or first_evidence.get("name_b")
            or first_evidence.get("name_parent") or "",
            "exception_classes": "; ".join(exceptions),
            "corpus_confirms": "; ".join(
                name for name in
                ("same_unii", "same_full_inchikey", "same_skeleton_different_full",
                 "structure_conflict", "moiety_match", "fragment_match")
                if facts[name]
            ),
            "existing_relations": "; ".join(existing),
            "first_pass_actions": "; ".join(first_actions),
            "row_index": index,
        }
        rows.append(row)

        claims_no_structure = bool(
            re.search(r"holds no structure|no structure of its own", second_row["evidence"], re.I)
        )
        both_hold_structure = bool(
            (spine.get(key_a) or {}).get("inchikey") and (spine.get(key_b) or {}).get("inchikey")
        )
        if second_row["verdict"] == "merge" and (
            (claim["identical_full_inchikey"] and not facts["same_full_inchikey"])
            or (claim["identical_unii"] and not facts["same_unii"])
            or (claims_no_structure and both_hold_structure)
        ):
            row["mismatch"] = (
                "the corpus records a structure on both pages, so the sentence's premise that one "
                "page holds none does not hold"
                if claims_no_structure and both_hold_structure
                else "the corpus does not record the identifier the sentence names for this pair"
            )
            contradicted.append(row)
        if ALREADY_MERGED_REASON in first["why_unresolved"]:
            already_merged.append(row)
        if NAME_GROUP_REASON in first["why_unresolved"]:
            name_group.append(row)

    # ------------------------------------------------------------------ checks
    # every already-merged row: the named source key is gone from the live corpus and the survivor
    # is live. That is what makes it a record rather than a decision.
    unverified_merges = []
    for row in already_merged:
        match = MERGE_MAP_CLAIM.search(row["second_evidence"])
        if not match:
            unverified_merges.append(row)
            continue
        source, survivor = match.group(1), match.group(2)
        if source in presence or survivor not in presence:
            unverified_merges.append(row)

    display_wanted = set()
    for row in rows:
        display_wanted.add(row["page_a"])
        if row["resolved_page_b"]:
            display_wanted.add(row["resolved_page_b"])
    names = load_display_names(display_wanted)
    for row in rows:
        if not row["name_a"]:
            row["name_a"] = names.get(row["page_a"], "")
        if not row["name_b"] and row["resolved_page_b"]:
            row["name_b"] = names.get(row["resolved_page_b"], "")

    def label(key: str) -> str:
        if not key:
            return "(no second page recorded)"
        return f"{names.get(key, key)} — `{key}`"

    counts = Counter(row["classification"] for row in rows)
    apply_rows = [r for r in rows if r["classification"] in ("LICENSED-MERGE", "LICENSED-FORM_OF")]
    held_rows = [
        r for r in rows
        if r["classification"] == "NOT-LICENSED" and ALREADY_MERGED_REASON not in r["first_pass_reason"]
    ]
    held_rows.sort(key=lambda r: (REACH_ORDER[r["reach"]], r["tier"], r["page_a"], r["page_b"]))
    held_by_reach = Counter(r["reach"] for r in held_rows)
    review_minutes = round(len(held_rows) * SECONDS_PER_HELD_PAIR / 60)

    def unordered(row: dict) -> tuple[str, str]:
        return tuple(sorted((row["page_a"], row["resolved_page_b"])))

    apply_pairs = {unordered(r) for r in apply_rows}
    held_pairs = {unordered(r) for r in held_rows}
    overlap_keys = (
        {k for pair in apply_pairs for k in pair if k}
        & {k for pair in held_pairs for k in pair if k}
    )

    # ------------------------------------------------------------------ issues
    if contradicted:
        issues.append(
            f"{len(contradicted)} second-opinion merge rows rest on a sentence the corpus record does "
            f"not bear out (spine-attached.parquet); each is held, and the rows are listed in "
            f"data/revamp/identity-review.md under \"Where the second opinion and the corpus record "
            f"disagree\""
        )
    duplicate_rows = len(rows) - len({(r["page_a"], r["page_b"]) for r in rows})
    if duplicate_rows:
        issues.append(
            f"{duplicate_rows} of the {len(rows)} rows repeat a pair already present under a different "
            f"origin; the apply and hold lists carry one row per pair and name the repeats"
        )
    if unverified_merges:
        issues.append(
            f"{len(unverified_merges)} of the {len(already_merged)} already-merged rows could not be "
            f"confirmed against presence-applicable.ndjson"
        )
    else:
        issues.append(
            f"all {len(already_merged)} already-merged rows confirmed against "
            f"presence-applicable.ndjson: the named source key is absent from the live corpus and the "
            f"survivor is present, so the merge is in force and the row carries no decision"
        )
    issues.append(
        "none of the 150 already-merged source keys appears in identity/merge-map.json, which holds "
        f"{len(merge_map)} entries and records this run's pass-4 merges only; the pass 2/3 merges are "
        "evidenced by the source key's absence from the live corpus instead"
    )
    if overlap_keys:
        issues.append(
            f"{len(overlap_keys)} page(s) appear on both the apply list and the hold list "
            f"({', '.join(sorted(overlap_keys))}); apply the licensed row before the held pair is "
            f"reopened so the held pair is decided against the surviving page"
        )
    chain_rows = [r for r in apply_rows if "merge chain" in r["first_pass_reason"]]
    if chain_rows:
        issues.append(
            f"{len(chain_rows)} apply-list rows come from the pairs the first pass held as a whole "
            f"chain because an exception class separates another link of that chain; applying them "
            f"needs the transitive closure checked so no exception-separated pages are joined"
        )
    issues.append(
        "the residual band has no recorded definition in data/revamp, so this script defines it from "
        "thresholds.json: a tier with no derived threshold contributes its own "
        "ruleAnswerAfterStubFloor set (tier 2 at 8 present fields), which is the set thresholds.json "
        "measures as clearing the positional line and missing the lexical line; tier 1 holds a "
        "threshold so its rule-answer set is the indexable set, and tier 3 has no rule answer"
    )

    # ------------------------------------------------------------------ writes
    IDENT.mkdir(parents=True, exist_ok=True)
    classified_fields = [
        "page_a", "page_b", "first_pass_reason", "second_verdict", "second_evidence",
        "confidence", "classification", "reach", "tier", "licence_ground", "resolved_page_b",
        "page_b_source", "name_a", "name_b", "exception_classes", "corpus_confirms",
        "existing_relations", "first_pass_actions",
    ]
    with OUT_CLASSIFIED.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=classified_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    apply_fields = [
        "page_a", "page_b", "resolved_page_b", "name_a", "name_b", "classification", "reach",
        "tier", "confidence", "licence_ground", "second_evidence", "corpus_confirms",
        "existing_relations", "first_pass_reason", "duplicate_of_row", "chain_held_by_first_pass",
    ]
    seen_apply: dict[tuple[str, str], int] = {}
    with OUT_APPLY.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=apply_fields, extrasaction="ignore")
        writer.writeheader()
        for row in sorted(apply_rows, key=lambda r: (REACH_ORDER[r["reach"]], r["tier"], r["page_a"])):
            pair = unordered(row)
            out = dict(row)
            out["duplicate_of_row"] = seen_apply.get(pair, "")
            out["chain_held_by_first_pass"] = "yes" if "merge chain" in row["first_pass_reason"] else "no"
            seen_apply.setdefault(pair, row["row_index"])
            writer.writerow(out)

    hold_fields = [
        "page_a", "page_b", "resolved_page_b", "name_a", "name_b", "reach", "tier",
        "second_verdict", "confidence", "recommended_default", "licence_ground",
        "first_pass_reason", "second_evidence", "corpus_confirms", "existing_relations",
        "duplicate_of_row",
    ]

    def recommended_default(row: dict) -> str:
        if row["second_verdict"] == "merge":
            return "separate — the rules do not license this merge, and §1 keeps two pages until one is licensed"
        if row["second_verdict"] == "form_of":
            existing = row["existing_relations"]
            return (
                f"the existing state — the corpus already records {existing} between these pages"
                if existing else
                "the existing state — the two pages stay as they are and no relation is recorded"
            )
        return "the existing state"

    seen_hold: dict[tuple[str, str], int] = {}
    with OUT_HOLD.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=hold_fields, extrasaction="ignore")
        writer.writeheader()
        for row in held_rows:
            pair = unordered(row)
            out = dict(row)
            out["recommended_default"] = recommended_default(row)
            out["duplicate_of_row"] = seen_hold.get(pair, "")
            seen_hold.setdefault(pair, row["row_index"])
            writer.writerow(out)

    write_review(
        rows=rows, counts=counts, held_rows=held_rows, held_by_reach=held_by_reach,
        review_minutes=review_minutes, apply_rows=apply_rows, already_merged=already_merged,
        name_group=name_group, contradicted=contradicted, issues=issues, label=label,
        recommended_default=recommended_default, tier_spec=tier_spec, presence=presence,
        reach_of=reach_of,
    )

    summary = {
        "pairs": len(rows),
        "distinctPairs": len({(r["page_a"], r["page_b"]) for r in rows}),
        "classified": {
            "LICENSED-MERGE": counts.get("LICENSED-MERGE", 0),
            "LICENSED-FORM_OF": counts.get("LICENSED-FORM_OF", 0),
            "LICENSED-SEPARATE": counts.get("LICENSED-SEPARATE", 0),
            "NOT-LICENSED": counts.get("NOT-LICENSED", 0),
        },
        "applyRows": len(apply_rows),
        "applyDistinctPairs": len(apply_pairs),
        "held": len(held_rows),
        "heldDistinctPairs": len(held_pairs),
        "heldByReach": {
            "indexable": held_by_reach.get("indexable", 0),
            "band": held_by_reach.get("band", 0),
            "rest": held_by_reach.get("rest", 0),
        },
        "reviewMinutes": review_minutes,
        "underTwoHours": review_minutes < 120,
        "alreadyMergedRows": len(already_merged),
        "nameGroupRows": len(name_group),
        "reachDefinition": {
            "indexable": "the page's tier holds a derived threshold in thresholds.json and the page meets it",
            "band": "the page's tier holds no derived threshold and the page is at or above that tier's ruleAnswerAfterStubFloor",
            "rest": "every other page",
            "perTier": {str(k): v for k, v in tier_spec.items()},
        },
        "issues": issues,
        "outputs": {
            "classified": str(OUT_CLASSIFIED.relative_to(ROOT)),
            "apply": str(OUT_APPLY.relative_to(ROOT)),
            "hold": str(OUT_HOLD.relative_to(ROOT)),
            "review": str(OUT_REVIEW.relative_to(ROOT)),
        },
    }
    OUT_SUMMARY.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")

    print(f"pairs {len(rows)} over {summary['distinctPairs']} distinct pairs")
    for name in ("LICENSED-MERGE", "LICENSED-FORM_OF", "LICENSED-SEPARATE", "NOT-LICENSED"):
        print(f"  {name:18s} {counts.get(name, 0)}")
    print(f"held {len(held_rows)} ({dict(held_by_reach)}), review {review_minutes} min, "
          f"under two hours: {review_minutes < 120}")
    print(f"apply {len(apply_rows)} rows over {len(apply_pairs)} distinct pairs")
    for issue in issues:
        print(f"  issue: {issue[:160]}")
    return 0


def write_review(*, rows, counts, held_rows, held_by_reach, review_minutes, apply_rows,
                 already_merged, name_group, contradicted, issues, label,
                 recommended_default, tier_spec, presence, reach_of) -> None:
    out: list[str] = []
    w = out.append

    total = len(rows)
    held_merge = [r for r in held_rows if r["second_verdict"] == "merge"]
    held_form = [r for r in held_rows if r["second_verdict"] == "form_of"]

    w("# Identity adjudication, step 3.4 — draft for the lead")
    w("")
    w("Generated by `scripts/revamp/identity_adjudicate.py` from "
      "`data/revamp/identity/remainder.csv` (first pass) and "
      "`data/revamp/identity/second-opinion.csv` (second pass). Nothing here has been applied.")
    w("")
    w("Every classification asks one question: does a rule already written in "
      "`docs/specs/identity-resolution.md` license applying the second opinion's verdict on the "
      "evidence that second opinion cites? Each cited identifier is then checked against the "
      "corpus's own record in `data/revamp/identity/spine-attached.parquet`, so a verdict resting "
      "on an identifier the corpus does not hold is not licensed.")
    w("")
    w("## Counts")
    w("")
    w("| Classification | Pairs | What it means |")
    w("| --- | ---: | --- |")
    w(f"| LICENSED-MERGE | {counts.get('LICENSED-MERGE', 0)} | identical UNII with no exception class, "
      "identical full InChIKey, or a GSRS salt-to-parent link confirmed by both an FDA active-moiety "
      "match and a largest-fragment match |")
    w(f"| LICENSED-FORM_OF | {counts.get('LICENSED-FORM_OF', 0)} | one InChIKey skeleton with different "
      "full keys, or a GSRS salt or ester relation cited without moiety confirmation |")
    w(f"| LICENSED-SEPARATE | {counts.get('LICENSED-SEPARATE', 0)} | the verdict leaves both pages "
      "exactly as they are |")
    w(f"| NOT-LICENSED | {counts.get('NOT-LICENSED', 0)} | no rule in the spec licenses the verdict on "
      "the evidence cited |")
    w(f"| **Total** | **{total}** | |")
    w("")
    w(f"The {counts.get('NOT-LICENSED', 0)} unlicensed rows divide in two: {len(already_merged)} record "
      f"a merge identity pass 2/3 already put in force and carry no decision (listed in their own "
      f"section below), and **{len(held_rows)} are pairs a person still has to decide**.")
    w("")
    w("## Review time")
    w("")
    w(f"{len(held_rows)} held pairs at 60 seconds each is **{review_minutes} minutes**, which is "
      f"{'under' if review_minutes < 120 else 'over'} two hours.")
    w("")
    if review_minutes < 120:
        w("Nothing further has to be decided by rule to bring it under. Two rule-derived reductions are "
          "already reflected in that number and are recorded here so the lead can see them:")
        w("")
        w(f"- the {len(already_merged)} already-merged rows are excluded, because the source key each "
          f"names is already absent from the live corpus and its survivor is present, so there is no "
          f"pair left to decide;")
        w(f"- the {counts.get('LICENSED-SEPARATE', 0)} separate verdicts are excluded, because a "
          f"separate verdict changes nothing and needs no decision to leave the pages as they are.")
    w("")
    w("## Held pairs by reach")
    w("")
    w("| Reach | Held pairs |")
    w("| --- | ---: |")
    for name in ("indexable", "band", "rest"):
        w(f"| {name} | {held_by_reach.get(name, 0)} |")
    w("")
    w("Reach is read from `data/revamp/presence-applicable.ndjson` against "
      "`data/revamp/thresholds.json`, and a pair takes the strongest reach of its two pages.")
    w("")
    w("- **indexable** — the page's tier holds a derived threshold and the page meets it. "
      f"Tier 1's threshold is {tier_spec.get(1, {}).get('threshold')} present fields over applicable; "
      "tiers 2 and 3 hold no threshold, so no page of theirs is indexable.")
    w("- **band** — the residual band. A tier with no derived threshold contributes the set at or above "
      "its own `ruleAnswerAfterStubFloor`: the count the unchanged rule proposes and the all-pairs line "
      f"check then rejects. That is tier 2 at {tier_spec.get(2, {}).get('ruleAnswer')} present fields, "
      "the set `thresholds.json` measures at positional 0.138846 (clearing the 0.20 line) and lexical "
      "0.412005 (over the 0.353 line). Tier 1 holds a threshold, so its rule-answer set is the "
      "indexable set and it contributes no band; tier 3 has no rule answer at all.")
    w("- **rest** — every other page.")
    w("")
    w("## Notes the lead should read before deciding")
    w("")
    for issue in issues:
        w(f"- {issue}")
    w("")

    if contradicted:
        w("## Where the second opinion and the corpus record disagree")
        w("")
        w("Each of these merge rows rests on a sentence that "
          "`data/revamp/identity/spine-attached.parquet` does not bear out. They are held, and the "
          "disagreement is itself a data question worth answering before the pair is decided.")
        w("")
        w("| Pages | Verdict | What the second opinion says | Why the corpus record disagrees |")
        w("| --- | --- | --- | --- |")
        for row in contradicted:
            w(f"| {row['name_a'] or row['page_a']} / {row['name_b'] or row['resolved_page_b']} "
              f"| {row['second_verdict']} / {row['confidence']} "
              f"| {row['second_evidence'][:150].replace('|', '/')} "
              f"| {row['mismatch']} |")
        w("")

    w(f"## Held pairs ({len(held_rows)})")
    w("")
    w(f"{len(held_merge)} carry a merge verdict and {len(held_form)} a form_of verdict. The "
      "recommended default is derived only from the spec: a merge the rules do not license defaults to "
      "separate, because §1 keeps one page per canonical moiety and nothing has established that these "
      "two are one; a form_of defaults to the existing state, because a link is a record of a "
      "relationship the spec already writes elsewhere and adding one is not forced by the evidence "
      "cited.")
    w("")
    for position, row in enumerate(held_rows, start=1):
        w(f"### {position}. {row['name_a'] or row['page_a']} / "
          f"{row['name_b'] or row['resolved_page_b'] or '(within a name group)'}")
        w("")
        w(f"- Pages: {label(row['page_a'])} and {label(row['resolved_page_b'])}")
        w(f"- Reach: **{row['reach']}** (tier {row['tier']})")
        w(f"- First pass did not decide because: {row['first_pass_reason']}")
        w(f"- Second pass says: **{row['second_verdict']}** at {row['confidence']} confidence — "
          f"{row['second_evidence']}")
        w(f"- The corpus's own record confirms: {row['corpus_confirms'] or 'no shared identifier'}"
          + (f"; exception class in play: {row['exception_classes']}" if row["exception_classes"] else ""))
        if row["existing_relations"]:
            w(f"- Relation already recorded between these pages: {row['existing_relations']}")
        w(f"- Why no rule licenses the second verdict: {row['licence_ground']}")
        w(f"- **Recommended default:** {recommended_default(row)}")
        w("")

    w(f"## Merges already in force ({len(already_merged)})")
    w("")
    w("These rows name an item that no longer names two live corpus pages: identity pass 2 or 3 merged "
      "them and the surviving page is the one the corpus holds. The second opinion's `merge` verdict "
      "here records that merge rather than proposing one, so there is nothing to apply and nothing to "
      "decide. Each row was confirmed against `data/revamp/presence-applicable.ndjson`: the merged-away "
      "key is absent from the live corpus and the survivor is present.")
    w("")
    w("| Merged-away key | Survivor | Survivor page | Reach |")
    w("| --- | --- | --- | --- |")
    for row in already_merged:
        match = MERGE_MAP_CLAIM.search(row["second_evidence"])
        source, survivor = (match.group(1), match.group(2)) if match else ("", "")
        w(f"| `{source}` | `{survivor}` | {label(survivor).split(' — ')[0]} | {row['reach']} |")
    w("")

    w(f"## Decided inside a normalised-name group ({len(name_group)})")
    w("")
    w("These rows carry no second page: the first pass raised them as a display-name collision inside "
      "one normalised-name group, and the second opinion answered against the whole group rather than "
      "against a single counterpart. Where its evidence names the counterpart page, that key is "
      "resolved here and shown; the classification is the same test applied to the rest.")
    w("")
    w("| Page | Counterpart named in the evidence | Verdict | Classification | Reach |")
    w("| --- | --- | --- | --- | --- |")
    for row in name_group:
        w(f"| {row['name_a'] or row['page_a']} — `{row['page_a']}` "
          f"| {('`' + row['resolved_page_b'] + '`') if row['resolved_page_b'] else 'none resolved'} "
          f"| {row['second_verdict']} / {row['confidence']} | {row['classification']} | {row['reach']} |")
    w("")

    w(f"## Apply list ({len(apply_rows)} rows)")
    w("")
    w("Written in full to `data/revamp/identity/apply-list.csv`. Nothing has been applied.")
    w("")
    w("| Pages | Verdict | Reach | Licence ground |")
    w("| --- | --- | --- | --- |")
    for row in sorted(apply_rows, key=lambda r: (REACH_ORDER[r["reach"]], r["tier"], r["page_a"])):
        w(f"| {row['name_a'] or row['page_a']} / {row['name_b'] or row['resolved_page_b']} "
          f"| {row['classification'].replace('LICENSED-', '')} | {row['reach']} | {row['licence_ground']} |")
    w("")

    OUT_REVIEW.write_text("\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
