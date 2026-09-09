#!/usr/bin/env python
"""Phase 4 — join the block tables into one per-page bundle the TypeScript stages read.

`docs/specs/phase4-generators.md` fixes what each Phase 4 block contains and in what order it
reads. Four separate stages produced that content as columnar tables:

  * `scripts/revamp/build_blocks.py`  -> `data/revamp/blocks/{registration,patent,controlled}.parquet`
  * `scripts/revamp/interactions_build.py` -> `data/revamp/interactions/{interactions,checked-sources}.parquet`
  * `scripts/revamp/tier3_sections.py` -> `data/revamp/tier3-sections.parquet`
  * `scripts/revamp/identity_apply.py`  -> `data/revamp/identity/{relations-v5.parquet,
    display-names-v5.csv, trial-reassignments-v5.csv, combination-components-v5.csv}`

Neither the loader (`scripts/corpus-20k/load/materialise.ts`) nor the renderer
(`scripts/revamp/page_text_v5.ts`) reads Parquet, and neither should hold 535,118 interaction rows
in memory to find the few that belong to one page. This script does the join once, in the language
that owns the tables, and writes one NDJSON line per corpus page:

    .venv-corpus/bin/python scripts/revamp/page_blocks.py

Output: `data/revamp/page-blocks/batch-0001.ndjson` … and `summary.json`.

Nothing here writes a sentence a source did not state. Every line, note and statement in the output
was written by the stage that read the register, and is copied with the `provenance` map that stage
recorded. Where a stage recorded nothing, the key is absent and the reader is told what was checked
and when — never given a blank.

Two caps are applied here and stated in the summary, because they change what a page shows:

  * interactions, per tier: the first `--inline-cap` rows are the page's inline lines, the next
    `--disclosed-cap` sit in the disclosure, and `total` records how many rows the tier holds. A
    page carrying 10,034 label-documented rows cannot render them; it says how many there are.
    Ordering is deterministic — the counterpart's display name, then the source record id — so a
    re-run shows the same rows.
  * controlled-substance rows are copied whole: there are at most nine per page.

The `controlled` flag is NOT recomputed here. It is read from
`data/revamp/suppression/assignments-v2.ndjson`, which `scripts/revamp/controlled_suppression.py`
wrote from the `controlled` field under the narrow test `docs/specs/phase4-generators.md` §4 fixes
(SG Misuse of Drugs Act and Poisons Act schedules, US DEA schedules, AU Poisons Standard Schedules
8 and 9). `controlled.parquet` holds every schedule entry, Schedule 2 to Schedule 10 included, so
reading it as the flag would suppress dosing on a pharmacy medicine.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
from collections import Counter, defaultdict
from typing import Any

import duckdb

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Tier order on the page: documented first, curated next, predicted last (§4).
TIER_ORDER = ["A", "B", "C"]


def repo(*parts: str) -> str:
    return os.path.join(ROOT, *parts)


def clean(value: Any) -> Any:
    """Parquet writes an absent string as NaN or the literal "nan"; both are absences here."""
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, str):
        stripped = value.strip()
        if stripped in ("", "nan", "None", "<NA>"):
            return None
        return value
    try:
        import pandas as pd

        if value is pd.NA:
            return None
    except Exception:
        pass
    return value


def parse_json(value: Any, fallback: Any) -> Any:
    text = clean(value)
    if text is None:
        return fallback
    if isinstance(text, (dict, list)):
        return text
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        return fallback


def rows_of(con: duckdb.DuckDBPyConnection, sql: str) -> list[dict[str, Any]]:
    frame = con.execute(sql).fetchdf()
    columns = list(frame.columns)
    out: list[dict[str, Any]] = []
    for row in frame.itertuples(index=False, name=None):
        out.append({column: clean(value) for column, value in zip(columns, row)})
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--blocks-dir", default=repo("data", "revamp", "blocks"))
    parser.add_argument("--interactions-dir", default=repo("data", "revamp", "interactions"))
    parser.add_argument("--sections", default=repo("data", "revamp", "tier3-sections.parquet"))
    parser.add_argument("--identity-dir", default=repo("data", "revamp", "identity"))
    parser.add_argument(
        "--suppression",
        default=repo("data", "revamp", "suppression", "assignments-v2.ndjson"),
    )
    parser.add_argument(
        "--models", default=repo("data", "revamp", "tiers", "model-assignment-v2.ndjson")
    )
    parser.add_argument("--out-dir", default=repo("data", "revamp", "page-blocks"))
    parser.add_argument("--inline-cap", type=int, default=6)
    parser.add_argument("--disclosed-cap", type=int, default=24)
    parser.add_argument("--batch-size", type=int, default=2000)
    # section 14 item 5: the label-documented rows are grouped by label and direction after they
    # are read, so the read has to see every counterpart a page holds and not the first thirty.
    parser.add_argument("--label-counterpart-cap", type=int, default=400)
    # How many counterparts one grouped label line names before the rest are counted (item 9's
    # six is a rule about rows; a line naming forty names is the wall item 5 is removing).
    parser.add_argument("--named-counterparts", type=int, default=12)
    parser.add_argument(
        "--counterpart-artefacts",
        default=repo("data", "revamp", "interactions", "counterpart-artefacts.csv"),
    )
    args = parser.parse_args()

    con = duckdb.connect()
    blocks = args.blocks_dir
    interactions_dir = args.interactions_dir

    # ---- the corpus's own page list, and the display name each key carries -------------------
    pages: dict[str, dict[str, Any]] = {}
    with open(args.models, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            key = record["key"]
            model = record.get("model") or "DEVELOPMENT"
            withdrawn = bool(record.get("withdrawn"))
            pages[key] = {
                "key": key,
                "displayName": record.get("displayName") or key,
                "model": model,
                "tier": 1 if (model == "LONGEVITY" or withdrawn) else 2 if model == "CLINICAL" else 3,
            }

    # ---- controlled flag and its basis, from the recorded suppression assignments --------------
    controlled: dict[str, list[str]] = {}
    with open(args.suppression, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            if record.get("controlledTrigger"):
                controlled[record["key"]] = list(record.get("controlledTriggerBasis") or [])

    # ---- display-name disambiguation (§6, the same-name pairs) --------------------------------
    disambiguation: dict[str, dict[str, Any]] = {}
    display_names = os.path.join(args.identity_dir, "display-names-v5.csv")
    if os.path.exists(display_names):
        for row in rows_of(
            con, f"select * from read_csv_auto('{display_names}', header=true, all_varchar=true)"
        ):
            key = row.get("key")
            if not key:
                continue
            disambiguated = row.get("disambiguated_display_name")
            if not disambiguated:
                continue
            disambiguation[key] = {
                "displayName": disambiguated,
                "disambiguator": row.get("disambiguator"),
                "basis": row.get("disambiguator_source"),
                "collidesOn": row.get("collides_on"),
            }

    # ---- trials moved to another page (§6 form pairs; R14 extended to salts and esters) --------
    moved: dict[str, dict[str, Any]] = {}
    reassignments = os.path.join(args.identity_dir, "trial-reassignments-v5.csv")
    if os.path.exists(reassignments):
        grouped: dict[tuple[str, str], set[str]] = defaultdict(set)
        rules: dict[tuple[str, str], str] = {}
        for row in rows_of(
            con,
            f"select * from read_csv_auto('{reassignments}', header=true, all_varchar=true) "
            "where action = 'move'",
        ):
            source_key = row.get("from_key")
            target_key = row.get("to_key")
            nct = row.get("nct")
            if not source_key or not target_key or not nct:
                continue
            grouped[(source_key, target_key)].add(nct)
            rules[(source_key, target_key)] = row.get("rule") or ""
        for (source_key, target_key), ncts in grouped.items():
            held = moved.get(source_key)
            if held is not None and held["count"] >= len(ncts):
                continue
            moved[source_key] = {
                "count": len(ncts),
                "toKey": target_key,
                "toName": pages.get(target_key, {}).get("displayName") or target_key,
                "rule": rules[(source_key, target_key)],
            }

    # ---- registration lines ------------------------------------------------------------------
    registration: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows_of(
        con,
        f"select * from '{os.path.join(blocks, 'registration.parquet')}' "
        'order by page, "order", component nulls first, jurisdiction',
    ):
        page = row["page"]
        registration[page].append(
            {
                "jurisdiction": row.get("jurisdiction"),
                "label": row.get("label"),
                "status": row.get("status"),
                "detail": row.get("detail"),
                "source": row.get("source"),
                "dateChecked": row.get("date_checked"),
                "ordinal": int(row["order"]) if row.get("order") is not None else 0,
                "line": row.get("line"),
                "component": row.get("component"),
                # §11: "not found", "not cleared" or "not checked" on a row that states only an
                # absence; empty on a row that states anything affirmative.
                "absence": row.get("absence") or "",
                # §13(6): a curated record filed under "unspecified" names no jurisdiction and no
                # register; it is kept, and the page paints it in the technical disclosure only.
                "disclosed": bool(row.get("disclosed")),
                "disclosure": parse_json(row.get("disclosure"), {}),
                "provenance": parse_json(row.get("provenance"), []),
            }
        )

    # ---- patent line -------------------------------------------------------------------------
    patent: dict[str, dict[str, Any]] = {}
    for row in rows_of(con, f"select * from '{os.path.join(blocks, 'patent.parquet')}'"):
        page = row["page"]
        patent[page] = {
            "eligible": bool(row.get("eligible")),
            "register": row.get("register"),
            "rld": None if row.get("rld") is None else bool(row.get("rld")),
            "earliestUnexpiredPatentExpiry": row.get("earliest_unexpired_patent_expiry"),
            "exclusivityEnd": row.get("exclusivity_end"),
            "genericAvailable": (
                None if row.get("generic_available") is None else bool(row.get("generic_available"))
            ),
            "firstGenericApproval": row.get("first_generic_approval"),
            "teCode": row.get("te_code"),
            "noRecordLine": row.get("no_record_line"),
            "reason": row.get("reason"),
            "line": row.get("line"),
            "absence": bool(row.get("absence")),
            "source": row.get("source"),
            "dateChecked": row.get("date_checked"),
            "disclosure": parse_json(row.get("disclosure"), {}),
            "provenance": parse_json(row.get("provenance"), []),
        }

    # ---- controlled-substance schedule rows ---------------------------------------------------
    controlled_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows_of(
        con,
        f"select * from '{os.path.join(blocks, 'controlled.parquet')}' "
        "order by page, jurisdiction, list, class_or_schedule",
    ):
        controlled_rows[row["page"]].append(
            {
                "jurisdiction": row.get("jurisdiction"),
                "list": row.get("list"),
                "classOrSchedule": row.get("class_or_schedule"),
                "scheduleCode": row.get("schedule_code"),
                "itemNumber": row.get("item_number"),
                "substanceAsListed": row.get("substance_as_listed"),
                "statute": row.get("statute"),
                "statuteUrl": row.get("statute_url"),
                "versionDate": row.get("version_date"),
                "source": row.get("source"),
                "provenance": row.get("provenance"),
            }
        )

    # ---- interactions, capped per tier --------------------------------------------------------
    interaction_totals: dict[str, dict[str, int]] = defaultdict(lambda: {"A": 0, "B": 0, "C": 0})
    interaction_rows: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(
        lambda: {"A": [], "B": [], "C": []}
    )
    kept = args.inline_cap + args.disclosed_cap
    interactions_file = os.path.join(interactions_dir, "interactions.parquet")

    # ---- section 14 item 5: the counterparts that are entity-linking artefacts ----------------
    #
    # `scripts/revamp/counterpart_artefacts.py` decides them from the registers' own records — a
    # GSRS substance class of `structurallyDiverse` (a cell, a tissue, a material, not a medicine)
    # and a printed name that is a bare abbreviation. A row naming one is dropped and counted; the
    # page it named keeps its own page and everything else on it.
    artefacts: dict[str, dict[str, str]] = {}
    if os.path.exists(args.counterpart_artefacts):
        for row in rows_of(
            con,
            "select * from read_csv_auto('%s', header=true, all_varchar=true)"
            % args.counterpart_artefacts,
        ):
            key = row.get("key")
            if key:
                artefacts[key] = {
                    "printedName": row.get("printed_name") or key,
                    "reason": row.get("reason") or "",
                }

    # One line per counterpart, not one per stored row.
    #
    # A label states the same interaction in five places — a table of clinically relevant
    # interactions, a pharmacokinetics table, a warnings paragraph — and the build stored each
    # statement. Rendering all five prints the counterpart's name five times over, which is the
    # repetition §3 forbids of register applications and the Phase 3 duplicate check found on the
    # Tier 2 pages. The first stored row per counterpart is the page's line for that counterpart;
    # `total` counts counterparts, because that is the quantity a reader is asking about, and
    # `rowsRecorded` keeps the stored-row count for the technical disclosure.
    totals_frame = con.execute(
        f"""
        select page_a, tier, count(distinct counterpart) as counterparts, count(*) as n
        from (
          select page_a, tier,
                 lower(coalesce(nullif(counterpart_name, 'nan'),
                                nullif(page_b_display, 'nan'),
                                nullif(page_b, 'nan'), '')) as counterpart
          from '{interactions_file}'
        )
        group by 1, 2
        """
    ).fetchdf()
    interaction_rows_recorded: dict[str, dict[str, int]] = defaultdict(
        lambda: {"A": 0, "B": 0, "C": 0}
    )
    for page, tier, counterparts, n in totals_frame.itertuples(index=False, name=None):
        interaction_totals[page][tier] = int(counterparts)
        interaction_rows_recorded[page][tier] = int(n)

    # `row_number()` over a deterministic order keeps the same rows on every re-run: a page's
    # counterpart name, then the source record the row came from.
    selected = con.execute(
        f"""
        select page_a, page_b, page_b_display, counterpart_name, counterpart_unii, tier,
               direction, mechanism, source, source_record_id, source_url, source_date,
               set_id, effective_time, label_section, licence, rule_id, confidence,
               sentence, derivation, match_basis, provenance
        from (
          select *, row_number() over (
            partition by page_a, tier
            order by counterpart, direction_class, first_of_counterpart
          ) as rank
          from (
            select *,
                   row_number() over (
                     partition by page_a, tier, counterpart, direction_class
                     order by coalesce(nullif(source_record_id, 'nan'), ''),
                              coalesce(nullif(page_b, 'nan'), '')
                   ) as first_of_counterpart
            from (
              select *,
                     lower(coalesce(nullif(counterpart_name, 'nan'),
                                    nullif(page_b_display, 'nan'),
                                    nullif(page_b, 'nan'), '')) as counterpart,
                     -- section 14 item 5: a label states one of a few directions for a
                     -- counterpart, and the page's line is one per label and direction. Every
                     -- other tier keeps one row per counterpart, as section 13 item 3 left it.
                     case when tier = 'A'
                          then coalesce(nullif(direction, 'nan'), '')
                          else '' end as direction_class
              from '{interactions_file}'
            )
          )
          where first_of_counterpart = 1
        )
        where rank <= (case when tier = 'A' then {args.label_counterpart_cap} else {kept} end)
        order by page_a, tier, rank
        """
    ).fetchdf()
    # The counterpart, by the name a reader knows it by.
    #
    # The Tier C additive rules record the counterpart page's key in both name columns, so reading
    # them straight put `COMBO:{IK:BRLQWZUYTZBJKN-UHFFFAOYSA-N,K1:506T60A25R}` on the page where a
    # drug's name belongs. The key is resolved through the corpus's own display names — the
    # disambiguated one where Phase 3 recorded it — and a row whose counterpart cannot be named is
    # dropped and counted rather than printed as a key.
    def display_name_of(key: str | None) -> str | None:
        if not key:
            return None
        held = disambiguation.get(key)
        if held and held.get("displayName"):
            return held["displayName"]
        page = pages.get(key)
        return page["displayName"] if page else None

    def looks_like_a_key(value: str | None) -> bool:
        return bool(value) and (
            value.startswith(("COMBO:", "HOLD:", "PRODUCT:"))
            or bool(re.match(r"^K[1-4]:", value))
        )

    def counterpart_name_of(row: dict[str, Any]) -> str | None:
        resolved = display_name_of(row.get("page_b"))
        if resolved and not looks_like_a_key(resolved):
            return resolved
        for field in ("counterpart_name", "page_b_display"):
            value = row.get(field)
            if value and not looks_like_a_key(value):
                return value
        return None

    columns = list(selected.columns)
    unnameable = 0
    artefact_dropped = 0
    artefact_reasons: Counter = Counter()
    dropped_counterparts: dict[str, dict[str, int]] = defaultdict(
        lambda: {"A": 0, "B": 0, "C": 0}
    )
    for values in selected.itertuples(index=False, name=None):
        row = {column: clean(value) for column, value in zip(columns, values)}
        # section 14 item 5: a counterpart must resolve to a substance page or a recognised drug
        # class. The rows naming a material's record or a bare abbreviation are dropped here, once,
        # with the reason the artefact file recorded and the count in the summary.
        held_artefact = artefacts.get(row.get("page_b") or "")
        if held_artefact is not None:
            artefact_dropped += 1
            artefact_reasons[held_artefact["reason"]] += 1
            # The tier's total counts counterparts, and a dropped one is not a counterpart this
            # page holds. Without this the page said "1 counterparts are recorded … 0 are shown"
            # and had no line to show, which reads as a page hiding something.
            dropped_counterparts[row["page_a"]][row["tier"]] += 1
            continue
        counterpart = counterpart_name_of(row)
        if counterpart is None:
            unnameable += 1
            continue
        interaction_rows[row["page_a"]][row["tier"]].append(
            {
                "counterpartKey": row.get("page_b"),
                "counterpartName": counterpart,
                "counterpartUnii": row.get("counterpart_unii"),
                "direction": row.get("direction"),
                "mechanism": row.get("mechanism"),
                "source": row.get("source"),
                "sourceRecordId": row.get("source_record_id"),
                "sourceUrl": row.get("source_url"),
                "sourceDate": row.get("source_date"),
                "setId": row.get("set_id"),
                "effectiveTime": row.get("effective_time"),
                "labelSection": row.get("label_section"),
                "licence": row.get("licence"),
                "ruleId": row.get("rule_id"),
                "confidence": row.get("confidence"),
                "sentence": row.get("sentence"),
                "derivation": row.get("derivation"),
                "matchBasis": row.get("match_basis"),
                "provenance": parse_json(row.get("provenance"), {}),
            }
        )

    # ---- §13(3): the curated enzyme and transporter rows, grouped into one line per role -------
    #
    # NCATS Inxight's curated dataset records one row per enzyme, and a benzodiazepine carries nine
    # of them. Rendered one to a line they were nine near-identical lines, each repeating the tier
    # word and each carrying a `frdb:ddi:` record id. They are one statement per role — "Substrate
    # of CYP1A2, 2A6, 2B6, 2C19, 2C8, 2C9, 2D6, 2E1 and 3A4" — and the record ids belong in the
    # closed disclosure.
    #
    # Only a row whose counterpart is not a page in this corpus is grouped: a curated row naming
    # another drug is an interaction between two records a reader can follow, and it keeps its own
    # line. Grouping happens here, once, so the render, the loader and the page all read the same
    # already-grouped rows and cannot word them differently.
    ROLE_ORDER = ("substrate", "inhibitor", "inducer")
    grouped_lines = 0
    grouped_from = 0
    for page_key, by_tier in interaction_rows.items():
        rows_b = by_tier.get("B") or []
        if not rows_b:
            continue
        groups: dict[str, dict[str, Any]] = {}
        kept_rows: list[dict[str, Any]] = []
        for row in rows_b:
            derivation = parse_json(row.get("derivation"), None)
            role = (derivation or {}).get("role") if isinstance(derivation, dict) else None
            target = (derivation or {}).get("target") if isinstance(derivation, dict) else None
            if row.get("counterpartKey") or not role or not target:
                kept_rows.append(row)
                continue
            held = groups.setdefault(
                str(role),
                {
                    "targets": [],
                    "recordIds": [],
                    "magnitude": False,
                    "provenance": {},
                    "source": row.get("source"),
                    "sourceUrl": row.get("sourceUrl"),
                    "sourceDate": row.get("sourceDate"),
                    "licence": row.get("licence"),
                    "ruleId": row.get("ruleId"),
                },
            )
            if target not in held["targets"]:
                held["targets"].append(str(target))
            record_id = row.get("sourceRecordId")
            if record_id and record_id not in held["recordIds"]:
                held["recordIds"].append(record_id)
            if (derivation or {}).get("magnitudeReported") == "yes":
                held["magnitude"] = True
            held["provenance"].update(row.get("provenance") or {})
        if not groups:
            continue
        new_rows: list[dict[str, Any]] = []
        for role in sorted(groups, key=lambda item: (ROLE_ORDER.index(item) if item in ROLE_ORDER else len(ROLE_ORDER), item)):
            held = groups[role]
            provenance = dict(held["provenance"])
            provenance["record"] = "; ".join(held["recordIds"])
            new_rows.append(
                {
                    "direction": "%s of %s" % (role, ", ".join(held["targets"])),
                    "mechanism": "%s of %s" % (role, ", ".join(held["targets"])),
                    "source": held["source"],
                    "sourceUrl": held["sourceUrl"],
                    "sourceDate": held["sourceDate"],
                    "licence": held["licence"],
                    "ruleId": held["ruleId"],
                    "groupedRole": role,
                    "groupedTargets": held["targets"],
                    "groupedMagnitude": bool(held["magnitude"]),
                    "groupedRecordIds": held["recordIds"],
                    "provenance": provenance,
                }
            )
        grouped_from += len(rows_b) - len(kept_rows)
        grouped_lines += len(new_rows)
        by_tier["B"] = new_rows + kept_rows
        # The "N counterparts are recorded … M are shown" line counts counterparts, and a grouped
        # line names every counterpart it stands for. The total is corrected by the same amount so
        # the page never says a counterpart is missing that its own line has just named.
        held_total = interaction_totals.get(page_key, {}).get("B")
        if held_total:
            interaction_totals[page_key]["B"] = max(
                len(by_tier["B"]), held_total - (len(rows_b) - len(kept_rows)) + len(new_rows)
            )

    # ---- section 14 item 5: the label-documented rows, grouped by label and direction ----------
    #
    # A DailyMed label states an interaction for twenty-one counterparts, and the build stored one
    # row per counterpart. Rendered a row to a line, Piroxicam's page carried twenty-one
    # label-documented lines, every one of them repeating the same set id and the same effective
    # date and differing only in the counterpart's name and one of three direction phrases. That is
    # a table written as sentences. The page's line is one per (label, direction class), naming
    # every counterpart the label states that direction for.
    #
    # The direction is the label's own phrase with the "; direction not stated" clause taken off:
    # "interaction stated with X, Y and Z" reads as the label's finding, where "interaction stated;
    # direction not stated with X" does not read as English at all.
    label_grouped_lines = 0
    label_grouped_from = 0
    for page_key, by_tier in interaction_rows.items():
        rows_a = by_tier.get("A") or []
        if len(rows_a) < 2:
            continue
        groups: dict[tuple[str, str, str], dict[str, Any]] = {}
        order: list[tuple[str, str, str]] = []
        for row in rows_a:
            direction = (row.get("direction") or "an interaction is stated").strip()
            direction = re.sub(r"\s*;\s*direction not stated\s*$", "", direction)
            group_key = (
                str(row.get("setId") or row.get("sourceRecordId") or ""),
                str(row.get("effectiveTime") or ""),
                direction,
            )
            held = groups.get(group_key)
            if held is None:
                order.append(group_key)
                held = groups[group_key] = {
                    "counterparts": [],
                    "counterpartKeys": [],
                    "counterpartTraces": [],
                    "recordIds": [],
                    "row": row,
                    "direction": direction,
                }
            trace = (row.get("provenance") or {}).get("counterpart")
            if trace and trace not in held["counterpartTraces"]:
                held["counterpartTraces"].append(trace)
            name = row.get("counterpartName")
            if name and name not in held["counterparts"]:
                held["counterparts"].append(name)
            counterpart_key = row.get("counterpartKey")
            if counterpart_key and counterpart_key not in held["counterpartKeys"]:
                held["counterpartKeys"].append(counterpart_key)
            record_id = row.get("sourceRecordId")
            if record_id and record_id not in held["recordIds"]:
                held["recordIds"].append(record_id)
        if len(groups) >= len(rows_a):
            continue
        new_rows: list[dict[str, Any]] = []
        for group_key in order:
            held = groups[group_key]
            base = dict(held["row"])
            names = sorted(held["counterparts"], key=lambda value: value.lower())
            named = names[: args.named_counterparts]
            provenance = dict(base.get("provenance") or {})
            # No `record` entry: every row in a group shares one label, so the group's record is the
            # set id the row already names in its `sentence` trace ("openfda-label mapped.parquet
            # field=drug_interactions set_id=..."). Writing the bare set id under `record` gave the
            # trace classifier a value of no recognised class, which is check (a) failing on a
            # trace that says nothing the row does not already say.
            #
            # The group's counterpart trace is the list of the traces its own rows carried, joined
            # with a middle dot, so the classifier resolves each of them against this page's own
            # record exactly as it resolves a single row's (section 14 item 15). The middle dot and
            # not a semicolon: one lexicon trace reads "lexicon surface 'x'; the corpus holds no
            # page for it", and splitting a joined list on the semicolon would cut that trace in
            # half.
            if held["counterpartTraces"]:
                provenance["counterpart"] = " \u00b7 ".join(held["counterpartTraces"])
            base.update(
                {
                    # A grouped line names several counterparts, so it names no single one: the
                    # counterpart columns would otherwise link the whole group to the first name.
                    "counterpartKey": None,
                    "counterpartName": None,
                    "sourceRecordId": held["recordIds"][0] if held["recordIds"] else None,
                    "direction": held["direction"],
                    "groupedDirection": held["direction"],
                    "groupedCounterparts": named,
                    "groupedCounterpartsBeyond": max(0, len(names) - len(named)),
                    "groupedCounterpartKeys": held["counterpartKeys"],
                    "groupedRecordIds": held["recordIds"],
                    "provenance": provenance,
                }
            )
            new_rows.append(base)
        label_grouped_from += len(rows_a)
        label_grouped_lines += len(new_rows)
        by_tier["A"] = new_rows
        # The "N counterparts are recorded … M are shown" line counts counterparts, and a grouped
        # line names every counterpart it stands for. The total is the number this page's lines
        # actually name, so the page never says a counterpart is missing that it has just named.
        named_total = len({name for row in new_rows for name in (row["groupedCounterparts"] or [])})
        beyond = sum(row["groupedCounterpartsBeyond"] for row in new_rows)
        interaction_totals[page_key]["A"] = named_total + beyond

    checked: dict[str, dict[str, Any]] = {}
    for row in rows_of(
        con, f"select * from '{os.path.join(interactions_dir, 'checked-sources.parquet')}'"
    ):
        checked[row["page"]] = {
            "sourcesChecked": parse_json(row.get("sources_checked"), []),
            "date": row.get("date"),
            "hasLabel": row.get("has_label") == "yes",
            "statementOnly": row.get("statement_only") == "yes",
        }

    # ---- Tier 3 computed sections -------------------------------------------------------------
    # A page holds one nearest-neighbour and one potency sentence, but several timeline sentences
    # (a publication span, a target verdict, an originating organisation) and several form-of notes
    # (a salt that is also an isotopologue). Every recorded sentence is kept, in a stable order.
    sections: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for row in rows_of(
        con,
        f"select * from '{args.sections}' order by page, section, sentence_template_id, values",
    ):
        sections[row["page"]][row["section"]].append(
            {
                "values": parse_json(row.get("values"), {}),
                "provenance": parse_json(row.get("provenance"), {}),
                "templateId": row.get("sentence_template_id"),
            }
        )

    # ---- the combination product's component list (section 12) --------------------------------
    #
    # "The page opens with its component list." Two products built from one substance render nearly
    # the same page, and the first thing that tells them apart is what each is made of. The list is
    # the one `identity_apply.py` recorded from the register's own proper name (or from the
    # combination key's component pages); nothing here parses a name. It leads the form-of notes, so
    # it is the first sentence under the title.
    components_file = os.path.join(args.identity_dir, "combination-components-v5.csv")
    component_notes = 0
    if os.path.exists(components_file):
        for row in rows_of(
            con,
            f"select * from read_csv_auto('{components_file}', header=true, all_varchar=true)",
        ):
            key = row.get("key")
            names = [name for name in (row.get("components") or "").split(" + ") if name]
            if not key or len(names) < 2:
                continue
            sentence = f"Recorded components: {' · '.join(names)}."
            sections[key]["formOf"].insert(
                0,
                {
                    "values": {
                        "sentence": sentence,
                        "components": names,
                        "sharesComponentWith": [
                            other
                            for other in (row.get("shares_component_with") or "").split(";")
                            if other
                        ],
                    },
                    "provenance": {
                        "sentence": sentence,
                        "fields": {
                            "components": "data/revamp/identity/combination-components-v5.csv "
                                          "components, from the register's proper name for the "
                                          "product or the component pages its combination key names"
                        },
                    },
                    "templateId": "COMPONENT-LIST",
                },
            )
            component_notes += 1

    # ---- identity relations (form-of, biosimilar-of, component-of and the rest) ---------------
    relations: dict[str, list[dict[str, Any]]] = defaultdict(list)
    relations_file = os.path.join(args.identity_dir, "relations-v6.parquet")
    if not os.path.exists(relations_file):
        relations_file = os.path.join(args.identity_dir, "relations-v5.parquet")
    for row in rows_of(con, f"select * from '{relations_file}' order by page_a, relation, page_b"):
        page = row["page_a"]
        counterpart = row.get("page_b")
        relations[page].append(
            {
                "relation": row.get("relation"),
                "counterpartKey": counterpart,
                "counterpartName": pages.get(counterpart, {}).get("displayName") or counterpart,
                "note": row.get("note"),
                "rule": row.get("rule"),
            }
        )

    # ---- write ---------------------------------------------------------------------------------
    os.makedirs(args.out_dir, exist_ok=True)
    for name in sorted(os.listdir(args.out_dir)):
        if name.startswith("batch-") and name.endswith(".ndjson"):
            os.remove(os.path.join(args.out_dir, name))

    keys = sorted(pages)
    summary = {
        "generatedBy": "scripts/revamp/page_blocks.py",
        "spec": ["docs/specs/phase4-generators.md#1", "docs/specs/revamp-2026-09.md#phase-4"],
        "pages": len(keys),
        "caps": {"interactionsInline": args.inline_cap, "interactionsDisclosed": args.disclosed_cap},
        "withRegistration": 0,
        "withPatentLine": 0,
        "withControlledSchedule": 0,
        "controlledPages": 0,
        "withInteractionRows": 0,
        "withCheckedSourcesStatementOnly": 0,
        "withoutCheckedSources": 0,
        "withSections": {"neighbour": 0, "potency": 0, "timeline": 0, "formOf": 0},
        "sectionSentences": {"neighbour": 0, "potency": 0, "timeline": 0, "formOf": 0},
        "withComponentList": component_notes,
        "withDisambiguation": 0,
        "withMovedTrials": 0,
        "interactionRowsWritten": 0,
        "interactionRowsDroppedUnnameableCounterpart": 0,
        "curatedRowsGrouped": grouped_from,
        "curatedGroupedLines": grouped_lines,
        "labelRowsGrouped": label_grouped_from,
        "labelGroupedLines": label_grouped_lines,
        "counterpartsDroppedAsArtefacts": artefact_dropped,
        "counterpartsDroppedByReason": dict(sorted(artefact_reasons.items())),
        "files": [],
    }

    summary["interactionRowsDroppedUnnameableCounterpart"] = unnameable

    batch: list[str] = []
    batch_number = 0

    def flush() -> None:
        nonlocal batch, batch_number
        if not batch:
            return
        batch_number += 1
        path = os.path.join(args.out_dir, f"batch-{batch_number:04d}.ndjson")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write("\n".join(batch) + "\n")
        summary["files"].append(
            {"file": os.path.relpath(path, ROOT), "records": len(batch)}
        )
        batch = []

    for key in keys:
        page = pages[key]
        page_registration = registration.get(key, [])
        page_patent = patent.get(key)
        page_controlled_rows = controlled_rows.get(key, [])
        page_sections = {name: list(rows) for name, rows in sections.get(key, {}).items()}
        tiers: dict[str, Any] = {}
        for tier in TIER_ORDER:
            rows = interaction_rows.get(key, {}).get(tier, [])
            total = interaction_totals.get(key, {}).get(tier, 0) - dropped_counterparts.get(
                key, {}
            ).get(tier, 0)
            # A tier with no line left is not a tier this page holds. It used to be written with a
            # total and an empty row list, and the page then said how many counterparts were
            # recorded and showed none of them.
            if total <= 0 or not rows:
                continue
            tiers[tier] = {
                "inline": rows[: args.inline_cap],
                "disclosed": rows[args.inline_cap :],
                "total": total,
                "rowsRecorded": interaction_rows_recorded.get(key, {}).get(tier, 0),
            }
            summary["interactionRowsWritten"] += len(rows)
        record = {
            "key": key,
            "displayName": page["displayName"],
            "model": page["model"],
            "tier": page["tier"],
            "controlled": key in controlled,
            "controlledBasis": controlled.get(key, []),
            "registration": page_registration,
            "controlledSchedules": page_controlled_rows,
            "interactions": {
                "tiers": tiers,
                **({"checked": checked[key]} if key in checked else {}),
            },
            "sections": page_sections,
            "relations": relations.get(key, []),
        }
        if page_patent is not None:
            record["patent"] = page_patent
        if key in disambiguation:
            record["disambiguation"] = disambiguation[key]
            summary["withDisambiguation"] += 1
        if key in moved:
            record["trialsMoved"] = moved[key]
            summary["withMovedTrials"] += 1

        if page_registration:
            summary["withRegistration"] += 1
        if page_patent is not None:
            summary["withPatentLine"] += 1
        if page_controlled_rows:
            summary["withControlledSchedule"] += 1
        if key in controlled:
            summary["controlledPages"] += 1
        if tiers:
            summary["withInteractionRows"] += 1
        if key in checked:
            if not tiers:
                summary["withCheckedSourcesStatementOnly"] += 1
        else:
            summary["withoutCheckedSources"] += 1
        for name in summary["withSections"]:
            rows = page_sections.get(name) or []
            if rows:
                summary["withSections"][name] += 1
                summary["sectionSentences"][name] += len(rows)

        batch.append(json.dumps(record, ensure_ascii=False, sort_keys=True))
        if len(batch) >= args.batch_size:
            flush()
    flush()

    with open(os.path.join(args.out_dir, "summary.json"), "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
        handle.write("\n")

    printable = dict(summary)
    printable["files"] = len(summary["files"])
    print(json.dumps(printable, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
