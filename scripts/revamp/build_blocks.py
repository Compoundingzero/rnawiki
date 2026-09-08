#!/usr/bin/env python
"""Phase 4 steps 4.2, 4.3 and the controlled block — the per-page block data tables.

Reads the integrated field records (`data/revamp/fields-v2`, schema in
`docs/specs/field-integration.md`) and writes the three tables the Phase 4 renderers consume:

  data/revamp/blocks/registration.parquet   "Where it's registered" (§2, §3), every page
  data/revamp/blocks/patent.parquet         "Generic and patent" (§5), every page
  data/revamp/blocks/controlled.parquet     the scheduled-list entries themselves
  data/revamp/jurisdiction-unmapped.csv     every source string the map in §2 does not carry
  data/revamp/blocks/registers.json         the register names and dates the builder read
  data/revamp/blocks/jurisdiction-map.json  the map, as this builder holds it
  data/revamp/blocks/coverage.json          per-block, per-tier coverage

    scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
        --models data/corpus-20k/tiers/model-assignment.ndjson \
        --relations data/revamp/identity/relations.parquet \
        --out-dir data/revamp/blocks

Every line these tables carry is assembled from stored values and carries, in `provenance`, the
field path of each value in it. Nothing is written that a source did not state: a register that
holds no record for a page produces the "Not found in <register> as of <date>" line that Operating
Rule 9 requires, and a register that was never cleared says so in its own words rather than
reporting an absence it did not measure.

Two rules from `docs/specs/phase4-generators.md` §3 are the reason this runs at corpus scale
rather than in a renderer:

  * United States applications collapse to one summary line carrying the counts, with the
    application ids in the row's `disclosure`. One line per application is the rendering that
    produced Tier 2's repeated register rows and is forbidden.
  * Two stitched NCATS Inxight records on one page merge by jurisdiction and never sum. Counts are
    merged by taking the distinct recorded statuses and the widest recorded date span; the number
    of stitch records merged is kept so the row states what it merged.
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import sys
from collections import Counter, OrderedDict, defaultdict

import pandas as pd

# --------------------------------------------------------------------------- the map (§2)

JURISDICTION_ORDER = ["SG", "US", "AU", "UK", "EU", "JP", "CA"]

JURISDICTION_LABELS = {
    "SG": "Singapore",
    "US": "United States",
    "AU": "Australia",
    "UK": "United Kingdom",
    "EU": "European Union",
    "JP": "Japan",
    "CA": "Canada",
}

JURISDICTION_SOURCE_STRINGS = {
    "sg": "SG", "singapore": "SG", "hsa": "SG", "hsa listing": "SG",
    "hsa listing of registered therapeutic products": "SG", "moh sdl": "SG", "moh maf": "SG",
    "mda schedules": "SG", "misuse of drugs act": "SG", "poisons act schedules": "SG",
    "poisons act": "SG", "poisons rules": "SG",
    "us": "US", "usa": "US", "united states": "US", "drugs@fda": "US", "orange book": "US",
    "fda orange book": "US", "purple book": "US", "openfda ndc": "US", "fda": "US",
    "au": "AU", "australia": "AU", "susmp": "AU", "poisons standard": "AU", "tga": "AU",
    "artg": "AU",
    "uk": "UK", "gb": "UK", "united kingdom": "UK", "great britain": "UK", "mhra": "UK",
    "eu": "EU", "ema": "EU", "europe": "EU", "european union": "EU",
    "european medicines agency": "EU",
    "jp": "JP", "japan": "JP", "pmda": "JP", "japan (pmda)": "JP",
    "ca": "CA", "canada": "CA", "health canada": "CA", "health canada dpd": "CA",
}


def resolve_jurisdiction(source_string):
    if not source_string:
        return None
    return JURISDICTION_SOURCE_STRINGS.get(" ".join(str(source_string).strip().lower().split()))


# --------------------------------------------------------------------------- small helpers


def iter_ndjson(path):
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def entry(record, name):
    value = (record.get("fields") or {}).get(name)
    return value if isinstance(value, dict) else {}


def value_of(record, name):
    value = entry(record, name).get("value")
    return value if isinstance(value, dict) else {}


def block(container, name):
    value = container.get(name)
    return value if isinstance(value, dict) else {}


def rows(container, name):
    value = container.get(name)
    return [r for r in value if isinstance(r, dict)] if isinstance(value, list) else []


def strings(container, name):
    value = container.get(name)
    return [s for s in value if isinstance(s, str)] if isinstance(value, list) else []


def join(parts):
    return " · ".join([p for p in parts if p])


# --------------------------------------------------------------------------- provenance (§11)


def walk(value, path):
    """Does the dotted `path` — `[]` for "any element of this list" — reach a recorded value?"""
    if not path:
        return value is not None
    head, _, rest = path.partition(".")
    if head.endswith("[]"):
        head = head[:-2]
        if head:
            if not isinstance(value, dict) or head not in value:
                return False
            value = value[head]
        if not isinstance(value, list):
            return False
        return any(walk(item, rest) for item in value)
    if isinstance(value, list):
        return any(walk(item, path) for item in value)
    if not isinstance(value, dict) or head not in value:
        return False
    return walk(value[head], rest)


def has_path(record, path):
    """`fields.regulatory.value.SG.status` against this page's own stored record."""
    return walk(record, path)


def carried(record, *paths):
    """Only the paths this record actually carries.

    §11: "Provenance of an absence cites the field path that was searched and the register's date
    …, never a path the record does not carry." The line builders below look for several values and
    write a line out of the ones they find; naming a key the record does not hold made 469 of 1,632
    traces in slop draw 1 unresolvable. Every builder now names what it read.
    """
    return [path for path in paths if has_path(record, path)]


def searched(record, paths, register, date):
    """The trace for values looked for and not found: the paths searched, and the register's date.

    Section 11: "Provenance of an absence cites the field path that was searched and the register's
    date, never a path the record does not carry." Both halves are here. Only the paths this record
    genuinely does not carry are named, and they are named as absent rather than as the source of a
    value; the register that was read and the date it was read on are stated beside them, because
    an absence is a fact about a register on a day and not a fact about the substance.

    The shape is fixed, because `tests/test_render_safety.py` and `scripts/revamp/slop_draw.py`
    resolve it by executing it: every path named must be absent from this page's own stored record,
    and a register and a date must be stated. Passing the same paths to `carried` and to `searched`
    makes the union of the two non-empty for any path list: a path is in exactly one of them.
    """
    absent = [path for path in paths if not has_path(record, path)]
    if not absent:
        return []
    return ["searched and not recorded: %s; register: %s as of %s" % (
        ", ".join(absent),
        register,
        date or "an unrecorded date",
    )]


def plural(n, word):
    return "%d %s%s" % (n, word, "" if n == 1 else "s")


# --------------------------------------------------------------------------- register dates


class Registers:
    """Register names, and the date each was read on, taken from the records themselves.

    A page that holds no block for a register still has to say "Not found in <register> as of
    <date>", and the date has to be the date that register was actually read on. Rather than
    carrying a constant, the builder collects the dates the records state and uses the latest one
    each register carries, recording every distinct date it saw.
    """

    NAMES = {
        "SG": "the HSA Listing of Registered Therapeutic Products",
        "US": "Drugs@FDA or the FDA Orange Book",
        "AU": "the Poisons Standard (SUSMP)",
        "EU": "the EMA register of centrally authorised medicines",
        "JP": "the PMDA List of Approved Products (New Drugs)",
        "CA": "the Health Canada Drug Product Database",
    }

    def __init__(self):
        self.dates = defaultdict(Counter)

    def see(self, code, date):
        if date:
            self.dates[code][str(date)] += 1

    def date(self, code):
        seen = self.dates.get(code)
        return max(seen) if seen else None

    def as_json(self):
        return {
            code: {
                "register": self.NAMES.get(code),
                "dateUsed": self.date(code),
                "datesRecorded": dict(sorted(self.dates.get(code, Counter()).items())),
            }
            for code in JURISDICTION_ORDER
            if code != "UK"
        }


# --------------------------------------------------------------------------- Inxight merge


def merge_curated(records):
    """Merge stitched Inxight records for one jurisdiction. Never sums a count (§3)."""
    statuses = OrderedDict()
    registers, sponsors, products, applications = [], [], [], []
    earliest = None
    latest = None
    for record in records:
        for name in (record.get("statusCounts") or {}):
            statuses.setdefault(name, 0)
            statuses[name] = max(statuses[name], (record.get("statusCounts") or {}).get(name) or 0)
        for target, key in (
            (registers, "upstreamRegisters"),
            (sponsors, "sponsors"),
            (products, "products"),
            (applications, "approvalApplicationIds"),
        ):
            for item in strings(record, key):
                if item not in target:
                    target.append(item)
        for key, keep in (("earliestRecordedDate", "min"), ("latestRecordedDate", "max")):
            date = record.get(key)
            if not date:
                continue
            if keep == "min":
                earliest = date if earliest is None else min(earliest, date)
            else:
                latest = date if latest is None else max(latest, date)
    provenance = [r.get("provenance") for r in records if isinstance(r.get("provenance"), dict)]
    return {
        "recordsMerged": len(records),
        "statuses": list(statuses),
        "activeRecords": max([r.get("activeRecords") or 0 for r in records] or [0]),
        "earliestRecordedDate": earliest,
        "latestRecordedDate": latest,
        "upstreamRegisters": registers,
        "sponsors": sponsors,
        "products": products,
        "approvalApplicationIds": applications,
        "sourceDate": max([p.get("source_date") for p in provenance if p.get("source_date")] or [None]) if provenance else None,
        "sourceUrl": provenance[0].get("source_url") if provenance else None,
        "licence": provenance[0].get("licence") if provenance else None,
    }


# --------------------------------------------------------------------------- SG schedule clause


SEE_SCHEDULES = "see the controlled-substance schedules below"


def schedule_clauses(controlled_sg):
    """The Singapore line's class words, and a pointer to the schedules themselves (§3, §13(4)).

    §13(4): the schedules render once, in the controlled-substance schedules table, and this line
    names the class and then says where to read them. It carried the statute, its version and the
    count of Poisons Rules schedules as well, and every one of those was printed again, in full, a
    few rows below. The schedule name the statute itself carries is split on its em dash — the part
    before it is the schedule, the part after it the class — and the class is what a reader needs
    here; neither half is reworded.
    """
    entries = rows(controlled_sg, "schedules")

    out = []
    for item in entries:
        if "Misuse of Drugs" not in str(item.get("statute") or ""):
            continue
        schedule = str(item.get("schedule") or "")
        _, _, tail = schedule.partition(" \u2014 ")
        clause = tail.strip() or schedule.strip()
        if clause and clause not in out:
            out.append(clause)

    poisons = any(
        str(e.get("statute") or "") in ("Poisons Act 1938", "Poisons Rules") for e in entries
    )
    if poisons and not out:
        out.append("on a Singapore poisons schedule")
    if out:
        out.append(SEE_SCHEDULES)
    return out


# --------------------------------------------------------------------------- the seven lines


def line_sg(record, registers):
    regulatory = value_of(record, "regulatory")
    controlled = value_of(record, "controlled")
    sg = block(regulatory, "SG")
    sg_controlled = block(controlled, "SG")
    as_of = sg.get("asOf")
    registers.see("SG", as_of)
    provenance = carried(
        record, "fields.regulatory.value.SG.status", "fields.regulatory.value.SG.asOf"
    )

    clauses = schedule_clauses(sg_controlled)
    if clauses:
        provenance += carried(record, "fields.controlled.value.SG.schedules[].schedule")

    absence = ""
    if sg.get("status") == "registered":
        status = "Registered (HSA)"
        parts = []
        forensic = sg.get("forensicClassification")
        short = {"Prescription Only": "POM", "Pharmacy Only": "P", "General Sale List": "GSL"}.get(forensic)
        if short:
            parts.append(short)
            provenance += carried(record, "fields.regulatory.value.SG.forensicClassification")
        parts.extend(clauses)
        parts.append("checked %s" % as_of if as_of else None)
        detail = join(parts)
    else:
        date = as_of or registers.date("SG")
        status = sg.get("statement") or "Not found in %s as of %s" % (Registers.NAMES["SG"], date)
        sg_paths = ["fields.regulatory.value.SG.statement", "fields.regulatory.value.SG.productCount"]
        provenance += carried(record, *sg_paths)
        provenance += searched(record, sg_paths, Registers.NAMES["SG"], date)
        parts = list(clauses)
        detail = join(parts)
        # An SG row that names a Misuse of Drugs Act or Poisons Act schedule has found something,
        # and is not furniture even though the HSA listing holds no product for it.
        absence = "" if clauses else "not found"

    disclosure = {}
    if sg.get("productCount"):
        disclosure["registeredProducts"] = sg.get("productCount")
        disclosure["products"] = strings(sg, "products")[:20]
        disclosure["licenceHolders"] = strings(sg, "licenceHolders")[:20]
        disclosure["atcCodes"] = strings(sg, "atcCodes")[:20]
    if sg.get("forensicClassificationPlain"):
        disclosure["supplyClassification"] = sg["forensicClassificationPlain"]
        disclosure["supplyClassificationNote"] = sg.get("forensicClassificationNote")
    if sg_controlled.get("statement") and not clauses:
        disclosure["controlledStatement"] = sg_controlled["statement"]
    return (status, detail, sg.get("register") or Registers.NAMES["SG"],
            as_of or registers.date("SG"), provenance, disclosure, absence)


# The values `line_us` reads before it writes "Not found in the United States registers": an
# application id, a marketing status, a status word. A path here is either cited as the source of
# what the line says (`carried`) or named as searched and not recorded (`searched`).
US_ABSENCE_PATHS = [
    "fields.regulatory.value.US.status",
    "fields.regulatory.value.US.evidence[].id",
    "fields.regulatory.value.US.records[].recordId",
    "fields.regulatory.value.US.marketingStatusesAsRecorded",
]

US_STATUS_WORDS = {
    "approved": "Approved",
    "withdrawn": "Withdrawn",
    "supplement": "Approved (supplement)",
    "controlled": "Recorded as a controlled substance",
}

# One application falls in exactly one of these, first match wins, so the summary counts add up to
# the application count. An application recorded "Discontinued; Prescription" is a discontinued
# application: its prescription status describes how it was supplied while it was on the market.
US_CATEGORIES = (
    ("discontinued", ("discontinued", "discn")),
    ("tentative approval", ("tentative",)),
    ("prescription", ("prescription",)),
    ("over-the-counter", ("over-the-counter", "otc")),
)

US_CATEGORY_NOT_STATED = "with no marketing status stated"


def categorise_us(text):
    """The categories a single recorded status string names, in table order."""
    lowered = (text or "").lower()
    return [name for name, tokens in US_CATEGORIES if any(token in lowered for token in tokens)]


def categorise_application(statements):
    """The one category an application falls in, from every status recorded against it."""
    hits = set()
    for statement in statements:
        hits.update(categorise_us(statement))
    for name, _ in US_CATEGORIES:
        if name in hits:
            return name
    return US_CATEGORY_NOT_STATED


def line_us(record, registers):
    regulatory = value_of(record, "regulatory")
    controlled = value_of(record, "controlled")
    us = block(regulatory, "US")
    provenance = []

    evidence = rows(us, "evidence")
    records_ = rows(us, "records")
    # Only a register dates the register. One row kind under `records` is the corpus's own entity
    # classification, which names itself as not a register; its date would otherwise become the
    # date this page claims Drugs@FDA was read on.
    for row in evidence + records_:
        if str(row.get("register") or "").startswith(("Drugs@FDA", "Orange Book", "FDA Orange Book", "openFDA NDC")):
            registers.see("US", row.get("sourceDate"))

    # One entry per application, keyed by its id, so the same application named by both the
    # Drugs@FDA evidence rows and the Orange Book record rows is counted once.
    applications = OrderedDict()
    for row in evidence:
        ident = row.get("id")
        if ident:
            applications.setdefault(ident, []).append(row.get("statement") or "")
            provenance += carried(record, "fields.regulatory.value.US.evidence[].id")
    for row in records_:
        ident = row.get("recordId")
        if ident and str(row.get("register") or "").startswith(("Drugs@FDA", "Orange Book")):
            applications.setdefault(ident, []).append(row.get("statusVerbatim") or "")
            provenance += carried(record, "fields.regulatory.value.US.records[].recordId")

    counts = Counter(categorise_application(statements) for statements in applications.values())

    status_word = US_STATUS_WORDS.get(us.get("status"))
    date = registers.date("US")
    if not applications and not status_word:
        statement = "Not found in %s as of %s" % (Registers.NAMES["US"], date)
        return (
            statement,
            "",
            Registers.NAMES["US"],
            date,
            carried(record, *US_ABSENCE_PATHS)
            + searched(record, US_ABSENCE_PATHS, Registers.NAMES["US"], date),
            us_disclosure(record, us, []),
            "not found",
        )

    parts = []
    if applications:
        summary = plural(len(applications), "application")
        ordered = [name for name, _ in US_CATEGORIES] + [US_CATEGORY_NOT_STATED]
        if len(counts) == 1 and len(applications) > 1:
            breakdown = "all %s" % next(iter(counts))
        else:
            breakdown = ", ".join("%d %s" % (counts[name], name) for name in ordered if counts.get(name))
        parts.append("%s: %s" % (summary, breakdown) if breakdown else summary)
        provenance += carried(record, "fields.regulatory.value.US.evidence[].statement")

    marketing = strings(us, "marketingStatusesAsRecorded")
    if marketing:
        provenance += carried(record, "fields.regulatory.value.US.marketingStatusesAsRecorded")
    rx_otc = [n for n in ("prescription", "over-the-counter") if any(n in categorise_us(m) for m in marketing)]
    if rx_otc and not counts:
        parts.append(", ".join(rx_otc))

    dea = block(controlled, "US").get("schedule") or us.get("deaSchedule") or us.get("controlledSubstanceSchedule")
    if dea:
        parts.append("United States Drug Enforcement Administration schedule %s" % dea)
        provenance += carried(
            record, "fields.controlled.value.US.schedule", "fields.regulatory.value.US.deaSchedule"
        )

    approval = block(us, "approvalDate")
    if approval.get("date"):
        parts.append("first approved %s" % approval["date"])
        provenance += carried(record, "fields.regulatory.value.US.approvalDate.date")

    withdrawn_reason = us.get("withdrawnReason")
    if isinstance(withdrawn_reason, dict) and withdrawn_reason.get("reason"):
        parts.append("withdrawal reason recorded: %s" % withdrawn_reason["reason"])
        provenance += carried(record, "fields.regulatory.value.US.withdrawnReason.reason")
    elif isinstance(withdrawn_reason, str) and withdrawn_reason:
        parts.append("withdrawal reason recorded: %s" % withdrawn_reason)
        provenance += carried(record, "fields.regulatory.value.US.withdrawnReason")

    parts.append("checked %s" % date if date else None)
    status = status_word or "Recorded in %s" % Registers.NAMES["US"]
    provenance += carried(record, "fields.regulatory.value.US.status")
    return (status, join(parts), Registers.NAMES["US"], date, provenance,
            us_disclosure(record, us, list(applications)), "")


def us_disclosure(record, us, application_ids):
    disclosure = {}
    if isinstance(us.get("withdrawnReason"), dict):
        disclosure["withdrawnReason"] = us["withdrawnReason"]
    if application_ids:
        disclosure["applications"] = sorted(application_ids)
    curated = rows(us, "curatedMarketingStatus")
    if curated:
        disclosure["curatedMarketingStatus"] = merge_curated(curated)
        disclosure["curatedMarketingStatusNote"] = (
            "NCATS Inxight Drugs records marketing events per jurisdiction from upstream product "
            "registers. It is not itself a national register."
        )
    drug_central = block(us, "drugCentral")
    if drug_central:
        disclosure["drugCentral"] = {
            "firstApprovalDate": drug_central.get("first_approval_date"),
            "status": drug_central.get("status"),
        }
    return disclosure


def line_au(record, registers):
    regulatory = value_of(record, "regulatory")
    controlled = value_of(record, "controlled")
    au = block(regulatory, "AU")
    au_controlled = block(controlled, "AU")
    provenance = []

    instrument = au.get("instrument") or au_controlled.get("instrument") or "the Poisons Standard (SUSMP)"
    date = block(au_controlled, "provenance").get("source_date")
    if not date:
        for row in rows(au, "records"):
            date = block(row, "provenance").get("source_date") or date
    registers.see("AU", date)
    date = date or registers.date("AU")

    schedules = []
    for row in rows(au_controlled, "schedules"):
        number = row.get("schedule")
        if number and number not in schedules:
            schedules.append(number)
    if not schedules:
        for row in rows(au, "records"):
            number = row.get("susmpSchedule")
            if number and number not in schedules:
                schedules.append(number)

    artg_note = au.get("artgStatusNote")
    artg_line = "ARTG not checked: the register's terms do not permit reuse"

    absence = ""
    if schedules:
        provenance += carried(record, "fields.controlled.value.AU.schedules[].schedule")
        ordered = sorted(schedules, key=lambda n: (len(str(n)), str(n)))
        # §13(4): the schedule is the class, and the instrument, its version and the substance as
        # listed are written once, in the schedules table below.
        if len(ordered) == 1:
            status = "Schedule %s, %s" % (ordered[0], SEE_SCHEDULES)
        else:
            status = "Schedules %s and %s, %s" % (
                ", ".join(ordered[:-1]),
                ordered[-1],
                SEE_SCHEDULES,
            )
    else:
        status = "Not found in %s as of %s" % (instrument, date)
        au_paths = [
            "fields.controlled.value.AU.schedules[].schedule",
            "fields.regulatory.value.AU.status",
        ]
        provenance += carried(record, *au_paths)
        provenance += searched(record, au_paths, instrument, date)
        # The ARTG clause on this row says the register was not checked, and the schedule search
        # found nothing: the whole row is an absence.
        absence = "not found"

    detail = join([artg_line, "checked %s" % date if date else None])
    disclosure = {"artgStatusReason": artg_note} if artg_note else {}
    entries = [
        {"schedule": r.get("schedule"), "title": r.get("title"), "entryText": r.get("entryText")}
        for r in rows(au_controlled, "schedules")
    ]
    if entries:
        disclosure["poisonsStandardEntries"] = entries[:20]
    if au_controlled.get("appendixD"):
        disclosure["appendixD"] = True
    return status, detail, instrument, date, provenance, disclosure, absence


# The United Kingdom row is the same on every page: the register was not cleared for this run, so
# nothing was read and nothing can be cited as read. What the record carries is the statement and
# the reason; what it does not carry is named as searched and not recorded.
UK_PATHS = ["fields.regulatory.value.UK.statement", "fields.regulatory.value.UK.reason"]


def line_uk(record, registers):
    uk = block(value_of(record, "regulatory"), "UK")
    status = uk.get("statement") or "UK register not cleared for this run"
    return (
        status,
        "",
        "MHRA products database and emc",
        None,
        carried(record, *UK_PATHS)
        + searched(record, UK_PATHS, "MHRA products database and emc", None),
        {"reason": uk.get("reason")} if uk.get("reason") else {},
        "not cleared",
    )


EU_WORD_FROM_STATEMENT = "medicine status "


def line_eu(record, registers):
    eu = block(value_of(record, "regulatory"), "EU")
    provenance = []
    evidence = rows(eu, "evidence")
    for row in evidence:
        registers.see("EU", row.get("sourceDate"))
    date = max([row.get("sourceDate") for row in evidence if row.get("sourceDate")] or [None]) or registers.date("EU")

    words = []
    for row in evidence:
        statement = row.get("statement") or ""
        word = statement.split(EU_WORD_FROM_STATEMENT)[-1].strip() if EU_WORD_FROM_STATEMENT in statement else None
        if word and word not in words:
            words.append(word)
    if words:
        provenance += carried(record, "fields.regulatory.value.EU.evidence[].statement")

    approval = block(eu, "approvalDate")
    absence = ""
    if not words:
        status = "Not found in %s as of %s" % (Registers.NAMES["EU"], date)
        eu_paths = [
            "fields.regulatory.value.EU.status",
            "fields.regulatory.value.EU.evidence[].statement",
        ]
        provenance += carried(record, *eu_paths)
        provenance += searched(record, eu_paths, Registers.NAMES["EU"], date)
        detail = ""
        absence = "not found"
    else:
        head = words[0]
        if head.lower() == "authorised" and approval.get("date"):
            status = "Authorised %s (EMA)" % approval["date"]
            provenance += carried(record, "fields.regulatory.value.EU.approvalDate.date")
        else:
            status = "%s (EMA)" % head
        rest = words[1:]
        detail = join(
            [
                "also recorded as %s" % ", ".join(rest) if rest else None,
                "%s in the register" % plural(len(evidence), "record") if len(evidence) > 1 else None,
                "checked %s" % date if date else None,
            ]
        )
    disclosure = {}
    if evidence:
        disclosure["emaRecords"] = [
            {"productNumber": row.get("id"), "statement": row.get("statement")} for row in evidence[:20]
        ]
    drug_central = block(eu, "drugCentral")
    if drug_central:
        disclosure["drugCentral"] = {"status": drug_central.get("status"),
                                     "firstApprovalDate": drug_central.get("first_approval_date")}
    return (status, detail, "EMA register of centrally authorised medicines", date, provenance,
            disclosure, absence)


def line_jp(record, registers):
    jp = block(value_of(record, "regulatory"), "JP")
    provenance = []
    pmda = rows(jp, "records")
    for row in pmda:
        registers.see("JP", block(row, "provenance").get("source_date"))
    date = registers.date("JP")

    approved = [row for row in pmda if row.get("approved") is True]
    disclosure = {}
    if pmda:
        disclosure["pmdaRecords"] = [
            {
                "recordId": row.get("recordId"),
                "activeIngredient": row.get("activeIngredient"),
                "approvalDate": row.get("approvalDate"),
                "applicant": row.get("applicant"),
                "brandNamesInJapan": strings(row, "brandNamesInJapan")[:10],
            }
            for row in pmda[:20]
        ]
    if jp.get("discrepancy"):
        disclosure["pmdaDrugCentralDiscrepancy"] = jp["discrepancy"]
    drug_central = block(jp, "drugCentral")
    if drug_central:
        disclosure["drugCentral"] = {"status": drug_central.get("status"),
                                     "firstApprovalDate": drug_central.get("first_approval_date")}

    absence = ""
    if approved:
        years = sorted({str(row.get("year")) for row in approved if row.get("year")})
        provenance += carried(
            record,
            "fields.regulatory.value.JP.records[].approved",
            "fields.regulatory.value.JP.records[].year",
        )
        status = "Approved (PMDA, %s)" % years[0] if years else "Approved (PMDA)"
        detail = join(
            [
                "%s in the list" % plural(len(pmda), "record") if len(pmda) > 1 else None,
                "checked %s" % date if date else None,
            ]
        )
    else:
        status = "Not found in %s as of %s" % (Registers.NAMES["JP"], date)
        jp_paths = [
            "fields.regulatory.value.JP.status",
            "fields.regulatory.value.JP.records[].approved",
        ]
        provenance += carried(record, *jp_paths)
        provenance += searched(record, jp_paths, Registers.NAMES["JP"], date)
        detail = ""
        absence = "not found"
        if drug_central.get("status") == "approved":
            detail = (
                "DrugCentral holds a PMDA approval record for this substance dated %s; the PMDA "
                "list read on %s does not carry it"
                % (drug_central.get("first_approval_date") or "an unstated date", date)
            )
            provenance += carried(record, "fields.regulatory.value.JP.drugCentral.status")
            # A DrugCentral approval record on the row is a finding about the substance, whatever
            # the PMDA list holds, so this row is not furniture.
            absence = ""
    if jp.get("note"):
        disclosure["licenceNote"] = jp["note"]
    return (status, detail, "PMDA List of Approved Products (New Drugs), English", date,
            provenance, disclosure, absence)


CA_WORDS = {
    "APPROVED": "Approved",
    "MARKETED": "Marketed",
    "CANCELLED POST MARKET": "Cancelled post market",
    "CANCELLED PRE MARKET": "Cancelled pre market",
    "DORMANT": "Dormant",
    "CANCELLED (SAFETY ISSUE)": "Cancelled for a safety issue",
}


def line_ca(record, registers):
    ca = block(value_of(record, "regulatory"), "CA")
    provenance = []
    evidence = rows(ca, "evidence")
    for row in evidence:
        registers.see("CA", row.get("sourceDate"))
    date = max([row.get("sourceDate") for row in evidence if row.get("sourceDate")] or [None]) or registers.date("CA")

    words = []
    codes = []
    for row in evidence:
        statement = row.get("statement") or ""
        tail = statement.split(": ")[-1].strip()
        word = CA_WORDS.get(tail.upper(), tail if tail else None)
        if word and word not in words:
            words.append(word)
        if row.get("id") and row["id"] not in codes:
            codes.append(row["id"])
    absence = ""
    if words:
        provenance += carried(record, "fields.regulatory.value.CA.evidence[].statement")
        status = "%s (Health Canada Drug Product Database)" % "; ".join(words)
        detail = join(
            [
                plural(len(codes), "drug code") if len(codes) > 1 else None,
                "checked %s" % date if date else None,
            ]
        )
    else:
        status = "Not found in %s as of %s" % (Registers.NAMES["CA"], date)
        ca_paths = [
            "fields.regulatory.value.CA.status",
            "fields.regulatory.value.CA.evidence[].statement",
        ]
        provenance += carried(record, *ca_paths)
        provenance += searched(record, ca_paths, Registers.NAMES["CA"], date)
        detail = ""
        absence = "not found"
    disclosure = {"drugCodes": codes[:20]} if codes else {}
    return (status, detail, "Health Canada Drug Product Database", date, provenance, disclosure,
            absence)


LINE_BUILDERS = {
    "SG": line_sg,
    "US": line_us,
    "AU": line_au,
    "UK": line_uk,
    "EU": line_eu,
    "JP": line_jp,
    "CA": line_ca,
}


# --------------------------------------------------------------------------- other registers


def other_register_rows(record, unmapped_counter, unmapped_example):
    """One row per unmapped jurisdiction string, in the order the record names them (§2)."""
    curated = block(value_of(record, "regulatory"), "curatedMarketingStatusByJurisdiction")
    out = []
    for source_string, records_ in curated.items():
        if resolve_jurisdiction(source_string) is not None:
            continue
        # §13(6): a curated record filed under "unspecified" names no jurisdiction and no register,
        # so it is not a register line. It is kept, in the row's technical disclosure, and marked
        # so the page paints it only there.
        disclosed = str(source_string).strip().lower() == "unspecified"
        unmapped_counter[source_string] += 1
        unmapped_example.setdefault(source_string, record.get("key"))
        merged = merge_curated([r for r in records_ if isinstance(r, dict)])
        statuses = ", ".join(merged["statuses"]) or "recorded with no status"
        span = None
        if merged["earliestRecordedDate"] and merged["latestRecordedDate"]:
            span = (
                merged["earliestRecordedDate"]
                if merged["earliestRecordedDate"] == merged["latestRecordedDate"]
                else "%s to %s" % (merged["earliestRecordedDate"], merged["latestRecordedDate"])
            )
        out.append(
            {
                "jurisdiction": "OTHER",
                "label": source_string,
                "status": "%s (NCATS Inxight Drugs curated record)" % statuses,
                "disclosed": disclosed,
                # §13(6): "upstream registers: ClinicalTrials, February 2021 …" names the files
                # NCATS stitched, not a register that recorded this substance. It is technical
                # provenance and lives in the disclosure.
                "detail": join(
                    [
                        "recorded %s" % span if span else None,
                        "%s merged" % plural(merged["recordsMerged"], "stitched record")
                        if merged["recordsMerged"] > 1
                        else None,
                        "checked %s" % merged["sourceDate"] if merged["sourceDate"] else None,
                    ]
                ),
                "source": "NCATS Inxight Drugs, a curated record of upstream product registers, "
                "not a national register",
                "date_checked": merged["sourceDate"],
                "absence": "",
                "provenance": ["fields.regulatory.value.curatedMarketingStatusByJurisdiction.%s" % source_string],
                "disclosure": {
                    "products": merged["products"][:20],
                    "sponsors": merged["sponsors"][:20],
                    "recordsMerged": merged["recordsMerged"],
                    "upstreamRegisters": merged["upstreamRegisters"][:8],
                },
            }
        )
    return out


# --------------------------------------------------------------------------- patent (§5)


def patent_row(record, fda_dates):
    field = entry(record, "patentStatus")
    value = field.get("value") if isinstance(field.get("value"), dict) else {}
    state = field.get("state")
    source_date = field.get("sourceDate")
    row = {
        "page": record.get("key"),
        "eligible": bool(value.get("eligible")),
        "register": None,
        "rld": None,
        "earliest_unexpired_patent_expiry": None,
        "exclusivity_end": None,
        "generic_available": None,
        "first_generic_approval": None,
        "te_code": None,
        "no_record_line": None,
        "reason": None,
        "line": None,
        "absence": False,
        "source": "FDA Orange Book and FDA Purple Book data files",
        "date_checked": source_date,
        "provenance": json.dumps([]),
        "disclosure": json.dumps({}),
    }

    if state == "present" and value.get("orangeBookSummary"):
        summary = block(block(value, "orangeBookSummary"), "all_products_containing_this_substance")
        patents = block(summary, "patents")
        exclusivity = block(summary, "exclusivity")
        te_codes = strings(summary, "therapeutic_equivalence_codes")
        generic_count = summary.get("generic_product_count") or 0
        first_generic = summary.get("first_generic_approval_date")
        row["register"] = "FDA Orange Book"
        row["rld"] = bool(summary.get("reference_listed_drug"))
        row["earliest_unexpired_patent_expiry"] = patents.get("earliest_unexpired_expiry")
        # An expiry that has already passed is not an end date the block can state, so the column
        # holds only an unexpired one and the expired date stays in the disclosure.
        row["exclusivity_end"] = exclusivity.get("earliest_unexpired_expiry")
        row["generic_available"] = generic_count > 0
        row["first_generic_approval"] = first_generic
        row["te_code"] = te_codes[0] if te_codes else None
        row["date_checked"] = block(value, "orangeBookSummary").get("as_of") or source_date
        parts = [
            "RLD: %s" % ("yes" if row["rld"] else "no"),
            "earliest unexpired patent expiry %s" % row["earliest_unexpired_patent_expiry"]
            if row["earliest_unexpired_patent_expiry"]
            else "no unexpired patent listed",
            "exclusivity ends %s" % row["exclusivity_end"] if row["exclusivity_end"] else "no unexpired exclusivity listed",
            "generic available: yes, first generic approved %s" % first_generic
            if generic_count and first_generic
            else ("generic available: yes" if generic_count else "generic available: no"),
            "TE code %s" % ", ".join(te_codes) if te_codes else None,
            "checked %s" % row["date_checked"],
        ]
        row["line"] = join(parts)
        row["provenance"] = json.dumps(
            carried(
                record,
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.reference_listed_drug",
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.patents.earliest_unexpired_expiry",
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.exclusivity",
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.generic_product_count",
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.first_generic_approval_date",
                "fields.patentStatus.value.orangeBookSummary.all_products_containing_this_substance.therapeutic_equivalence_codes",
            )
        )
        row["disclosure"] = json.dumps(
            {
                "applications": strings(value, "applications")[:40],
                "applicationCount": summary.get("application_count"),
                "patentCount": value.get("patentCount"),
                "marketingTypes": strings(summary, "marketing_types"),
                "latestExclusivityExpiryIncludingExpired": exclusivity.get("latest_expiry_any"),
                "exclusivityEntriesTotal": exclusivity.get("total"),
                "exclusivityEntriesUnexpired": exclusivity.get("unexpired"),
            }
        )
        return row

    if state == "present" and value.get("purpleBookSummary"):
        purple = block(value, "purpleBookSummary")
        row["register"] = "FDA Purple Book"
        row["no_record_line"] = "No US patent or exclusivity data on record"
        row["reason"] = "biologic: see Purple Book exclusivity"
        expiry = strings(purple, "exclusivity_expiration_dates") + strings(
            purple, "reference_product_exclusivity_expiry_dates"
        )
        row["exclusivity_end"] = min(expiry) if expiry else None
        row["date_checked"] = purple.get("as_of") or source_date
        row["line"] = join(
            [
                row["no_record_line"],
                row["reason"],
                "%s under %s"
                % (
                    plural(purple.get("product_count") or 0, "licensed product"),
                    ", ".join("BLA %s" % b for b in strings(purple, "bla_numbers")[:6])
                    or "no BLA number listed",
                ),
                "exclusivity expiry %s" % row["exclusivity_end"] if row["exclusivity_end"] else "no unexpired exclusivity listed",
                "checked %s" % row["date_checked"],
            ]
        )
        row["provenance"] = json.dumps(
            carried(
                record,
                "fields.patentStatus.value.eligibilityBasis",
                "fields.patentStatus.value.purpleBookSummary.bla_numbers",
                "fields.patentStatus.value.purpleBookSummary.product_count",
                "fields.patentStatus.value.purpleBookSummary.exclusivity_expiration_dates",
            )
        )
        row["disclosure"] = json.dumps(
            {
                "blaNumbers": strings(purple, "bla_numbers")[:20],
                "licenseTypes": strings(purple, "license_types"),
                "marketingStatuses": strings(purple, "marketing_statuses"),
                "isBiosimilarOrInterchangeable": purple.get("is_biosimilar_or_interchangeable"),
                "earliestApprovalDate": purple.get("earliest_approval_date"),
            }
        )
        return row

    basis = value.get("eligibilityBasis") or field.get("note")
    # §11: the only US-register finding this page carries is that there is none, in fixed words, on
    # 25,226 pages. The Purple Book branch above carries BLA numbers and an exclusivity date, which
    # is a finding, and is not marked.
    row["absence"] = True
    row["no_record_line"] = "No US patent or exclusivity data on record"
    row["reason"] = "not an approved US small molecule"
    orange, purple_date = fda_dates.get("orange"), fda_dates.get("purple")
    read_on = ", ".join(
        part
        for part in (
            "Orange Book read %s" % orange if orange else None,
            "Purple Book read %s" % purple_date if purple_date else None,
        )
        if part
    )
    row["date_checked"] = source_date or orange
    row["line"] = join([row["no_record_line"], row["reason"], read_on or None])
    # §11: the trace of an absence names the paths that were searched and the register's own read
    # date. A record with no `patentStatus` field at all carries neither path, and saying it did was
    # the defect slop draw 1 measured; `searched` names them as absent instead.
    patent_paths = ["fields.patentStatus.value.eligibilityBasis",
                    "fields.patentStatus.value.orangeBookSummary",
                    "fields.patentStatus.value.purpleBookSummary"]
    row["provenance"] = json.dumps(
        carried(record, *patent_paths)
        + searched(record, patent_paths, "FDA Orange Book and FDA Purple Book data files",
                   orange or purple_date or source_date)
    )
    row["disclosure"] = json.dumps({"eligibilityBasis": basis} if basis else {})
    return row


# --------------------------------------------------------------------------- controlled


def controlled_rows(record):
    controlled = value_of(record, "controlled")
    key = record.get("key")
    out = []
    sg = block(controlled, "SG")
    for item in rows(sg, "schedules"):
        out.append(
            {
                "page": key,
                "jurisdiction": "SG",
                "list": item.get("statuteCitation") or item.get("statute"),
                "class_or_schedule": item.get("schedule"),
                "schedule_code": item.get("scheduleCode"),
                "item_number": item.get("itemNumber"),
                "substance_as_listed": item.get("substanceAsListed"),
                "statute": item.get("statute"),
                "statute_url": item.get("statuteUrl"),
                "version_date": item.get("statuteVersionDate"),
                "source": "Singapore Statutes Online",
                "provenance": "fields.controlled.value.SG.schedules[]",
            }
        )
    au = block(controlled, "AU")
    for item in rows(au, "schedules"):
        out.append(
            {
                "page": key,
                "jurisdiction": "AU",
                "list": au.get("register") or "Standard for the Uniform Scheduling of Medicines and Poisons (SUSMP)",
                "class_or_schedule": "Schedule %s" % item.get("schedule") if item.get("schedule") else None,
                "schedule_code": item.get("title"),
                "item_number": None,
                "substance_as_listed": item.get("entryText"),
                "statute": au.get("instrument"),
                "statute_url": block(au, "provenance").get("source_url"),
                "version_date": block(au, "provenance").get("source_date"),
                "source": "Federal Register of Legislation",
                "provenance": "fields.controlled.value.AU.schedules[]",
            }
        )
    us = block(controlled, "US")
    if us.get("schedule"):
        out.append(
            {
                "page": key,
                "jurisdiction": "US",
                "list": us.get("register"),
                "class_or_schedule": us.get("schedule"),
                "schedule_code": None,
                "item_number": None,
                "substance_as_listed": None,
                "statute": "Controlled Substances Act schedule as recorded on the openFDA NDC product record",
                "statute_url": block(us, "provenance").get("source_url"),
                "version_date": block(us, "provenance").get("source_date"),
                "source": "openFDA NDC",
                "provenance": "fields.controlled.value.US.schedule",
            }
        )
    else:
        regulatory_us = block(value_of(record, "regulatory"), "US")
        schedule = regulatory_us.get("deaSchedule") or regulatory_us.get("controlledSubstanceSchedule")
        if schedule:
            out.append(
                {
                    "page": key,
                    "jurisdiction": "US",
                    "list": "US Drug Enforcement Administration schedule as recorded on the openFDA NDC product record",
                    "class_or_schedule": schedule,
                    "schedule_code": None,
                    "item_number": None,
                    "substance_as_listed": None,
                    "statute": "Controlled Substances Act schedule as recorded on the openFDA NDC product record",
                    "statute_url": None,
                    "version_date": None,
                    "source": "openFDA NDC",
                    "provenance": (
                        "fields.regulatory.value.US.deaSchedule"
                        if has_path(record, "fields.regulatory.value.US.deaSchedule")
                        else "fields.regulatory.value.US.controlledSubstanceSchedule"
                    ),
                }
            )
    return out


# --------------------------------------------------------------------------- main


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fields-dir", required=True)
    parser.add_argument("--models", required=True)
    parser.add_argument("--relations", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--unmapped-csv", default="data/revamp/jurisdiction-unmapped.csv")
    args = parser.parse_args(argv)

    os.makedirs(args.out_dir, exist_ok=True)

    tiers, names = {}, {}
    for record in iter_ndjson(args.models):
        key = record["key"]
        tiers[key] = 1 if (record.get("model") == "LONGEVITY" or record.get("withdrawn") is True) else (
            2 if record.get("model") == "CLINICAL" else 3
        )
        names[key] = record.get("displayName") or key

    contains = defaultdict(list)
    relations = pd.read_parquet(args.relations)
    for page_a, page_b, relation in zip(relations["page_a"], relations["page_b"], relations["relation"]):
        if relation == "contains":
            contains[page_a].append(page_b)

    paths = sorted(glob.glob(os.path.join(args.fields_dir, "**", "batch-*.ndjson"), recursive=True))
    if not paths:
        print("no field batches under %s" % args.fields_dir, file=sys.stderr)
        return 2

    registers = Registers()

    # Pass one reads every record for the dates the registers state, so a page holding no block
    # for a register still reports the date that register was actually read on; and it keeps the
    # records a combination page's component lines will need. The corpus does not fit in memory,
    # so nothing else is held between the passes.
    wanted_components = {c for parents in contains.values() for c in parents}
    component_records = {}
    fda_dates = {}
    pages_read = 0
    for path in paths:
        for record in iter_ndjson(path):
            key = record.get("key")
            if not key:
                continue
            pages_read += 1
            for code in JURISDICTION_ORDER:
                if code == "UK":
                    continue
                LINE_BUILDERS[code](record, registers)
            patent_value = entry(record, "patentStatus").get("value")
            if isinstance(patent_value, dict):
                for key_name, target in (("orangeBookSummary", "orange"), ("purpleBookSummary", "purple")):
                    as_of = block(patent_value, key_name).get("as_of")
                    if as_of:
                        fda_dates[target] = max(fda_dates.get(target, ""), as_of)
            if key in wanted_components:
                component_records[key] = record

    registration = []
    unmapped_counter = Counter()
    unmapped_example = {}
    component_rows = 0
    patents = []
    controlled = []

    for path in paths:
      for record in iter_ndjson(path):
        key = record.get("key")
        if not key:
            continue
        order = 0
        for code in JURISDICTION_ORDER:
            status, detail, source, date, provenance, disclosure, absence = LINE_BUILDERS[code](
                record, registers
            )
            registration.append(
                {
                    "page": key,
                    "component": None,
                    "jurisdiction": code,
                    "label": JURISDICTION_LABELS[code],
                    "status": status,
                    "detail": detail,
                    "source": source,
                    "date_checked": date,
                    "order": order,
                    "line": join([status, detail]),
                    "absence": absence,
                    "disclosed": False,
                    "disclosure": json.dumps(disclosure, ensure_ascii=False) if disclosure else "{}",
                    "provenance": json.dumps(sorted(set(provenance))),
                }
            )
            order += 1
        for row in other_register_rows(record, unmapped_counter, unmapped_example):
            registration.append(
                {
                    "page": key,
                    "component": None,
                    "jurisdiction": row["jurisdiction"],
                    "label": row["label"],
                    "status": row["status"],
                    "detail": row["detail"],
                    "source": row["source"],
                    "date_checked": row["date_checked"],
                    "order": order,
                    "line": join([row["status"], row["detail"]]),
                    "absence": row["absence"],
                    "disclosed": bool(row["disclosed"]),
                    "disclosure": json.dumps(row["disclosure"], ensure_ascii=False),
                    "provenance": json.dumps(row["provenance"]),
                }
            )
            order += 1

        # A combination product lists each component's line under the component name (§3).
        for component in contains.get(key, []):
            component_record = component_records.get(component)
            if component_record is None:
                continue
            component_name = names.get(component, component)
            for code in JURISDICTION_ORDER:
                status, detail, source, date, provenance, disclosure, absence = LINE_BUILDERS[
                    code
                ](component_record, registers)
                registration.append(
                    {
                        "page": key,
                        "component": component_name,
                        "jurisdiction": code,
                        "label": JURISDICTION_LABELS[code],
                        "status": status,
                        "detail": detail,
                        "source": source,
                        "date_checked": date,
                        "order": order,
                        "line": join([status, detail]),
                        "absence": absence,
                        "disclosed": False,
                        "disclosure": json.dumps(disclosure, ensure_ascii=False) if disclosure else "{}",
                        # §11: a component's line was read off the component's own record, not off
                        # this page's, and the trace says whose record it is. Resolving it against
                        # the combination page would look for a jurisdiction key that page never
                        # had, which is the defect §11 names.
                        "provenance": json.dumps(
                            sorted({"%s · record %s" % (trace, component) for trace in provenance})
                        ),
                    }
                )
                order += 1
                component_rows += 1

        patents.append(patent_row(record, fda_dates))
        controlled.extend(controlled_rows(record))

    registration_df = pd.DataFrame(registration)
    patent_df = pd.DataFrame(patents)
    controlled_df = pd.DataFrame(controlled)

    registration_df.to_parquet(os.path.join(args.out_dir, "registration.parquet"), index=False)
    patent_df.to_parquet(os.path.join(args.out_dir, "patent.parquet"), index=False)
    controlled_df.to_parquet(os.path.join(args.out_dir, "controlled.parquet"), index=False)

    os.makedirs(os.path.dirname(args.unmapped_csv) or ".", exist_ok=True)
    with open(args.unmapped_csv, "w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["source_string", "pages", "example_page", "seen_in", "rendered_as"])
        for source_string, count in unmapped_counter.most_common():
            writer.writerow(
                [
                    source_string,
                    count,
                    unmapped_example.get(source_string),
                    "fields.regulatory.value.curatedMarketingStatusByJurisdiction",
                    "Other registers, with this string verbatim",
                ]
            )

    with open(os.path.join(args.out_dir, "registers.json"), "w", encoding="utf-8") as handle:
        json.dump(registers.as_json(), handle, indent=2, sort_keys=True)
        handle.write("\n")
    with open(os.path.join(args.out_dir, "jurisdiction-map.json"), "w", encoding="utf-8") as handle:
        json.dump(
            {
                "order": JURISDICTION_ORDER,
                "labels": JURISDICTION_LABELS,
                "sourceStrings": JURISDICTION_SOURCE_STRINGS,
            },
            handle,
            indent=2,
            sort_keys=True,
        )
        handle.write("\n")

    registration_df["tier"] = registration_df["page"].map(tiers)
    patent_df["tier"] = patent_df["page"].map(tiers)
    controlled_pages = set(controlled_df["page"]) if len(controlled_df) else set()

    def per_tier(pages):
        counts = Counter(tiers.get(p) for p in pages)
        return {str(t): counts.get(t, 0) for t in (1, 2, 3)}

    own = registration_df[registration_df["component"].isna()]
    not_found = own[own["status"].str.startswith("Not found", na=False)]
    # The United Kingdom register was never read, so a UK row is neither an affirmative status nor
    # a "not found": it states that the register was not cleared. It is counted on its own.
    affirmative = own[
        (~own["status"].str.startswith("Not found", na=False)) & (own["jurisdiction"] != "UK")
    ]
    coverage = {
        "generatedBy": "scripts/revamp/build_blocks.py",
        "spec": ["docs/specs/phase4-generators.md#2", "docs/specs/phase4-generators.md#3",
                 "docs/specs/phase4-generators.md#5"],
        "pagesInCorpus": pages_read,
        "pagesPerTier": per_tier(set(own["page"])),
        "registration": {
            "rows": int(len(registration_df)),
            "pages": int(own["page"].nunique()),
            "pagesPerTier": per_tier(set(own["page"])),
            "rowsPerJurisdiction": {k: int(v) for k, v in own["jurisdiction"].value_counts().items()},
            "componentRows": component_rows,
            "otherRegisterRows": int((registration_df["jurisdiction"] == "OTHER").sum()),
            "notFoundRowsPerJurisdiction": {
                k: int(v) for k, v in not_found["jurisdiction"].value_counts().items()
            },
            "affirmativeRowsPerJurisdiction": {
                code: int((affirmative["jurisdiction"] == code).sum())
                for code in JURISDICTION_ORDER
                if code != "UK"
            },
            "affirmativePagesPerJurisdictionPerTier": {
                code: per_tier(set(affirmative.loc[affirmative["jurisdiction"] == code, "page"]))
                for code in JURISDICTION_ORDER
                if code != "UK"
            },
            "unitedKingdomRows": {
                "rows": int((own["jurisdiction"] == "UK").sum()),
                "state": "the register was not cleared for this run; neither an affirmative status "
                "nor a not-found finding",
            },
        },
        "patent": {
            "rows": int(len(patent_df)),
            "pages": int(patent_df["page"].nunique()),
            "pagesPerTier": per_tier(set(patent_df["page"])),
            "eligible": int(patent_df["eligible"].sum()),
            "eligiblePerTier": per_tier(set(patent_df.loc[patent_df["eligible"], "page"])),
            "orangeBookRows": int((patent_df["register"] == "FDA Orange Book").sum()),
            "purpleBookRows": int((patent_df["register"] == "FDA Purple Book").sum()),
            "noRecord": int(patent_df["no_record_line"].notna().sum()),
            "noRecordPerTier": per_tier(set(patent_df.loc[patent_df["no_record_line"].notna(), "page"])),
            "noRecordReasons": {k: int(v) for k, v in patent_df["reason"].value_counts().items()},
            "withUnexpiredPatent": int(patent_df["earliest_unexpired_patent_expiry"].notna().sum()),
            "withUnexpiredExclusivity": int(patent_df["exclusivity_end"].notna().sum()),
            "genericAvailable": int((patent_df["generic_available"] == True).sum()),  # noqa: E712
            "withTeCode": int(patent_df["te_code"].notna().sum()),
        },
        "controlled": {
            "rows": int(len(controlled_df)),
            "pages": len(controlled_pages),
            "pagesPerTier": per_tier(controlled_pages),
            "rowsPerJurisdiction": {k: int(v) for k, v in controlled_df["jurisdiction"].value_counts().items()}
            if len(controlled_df)
            else {},
            "pagesPerJurisdiction": {
                code: int(controlled_df.loc[controlled_df["jurisdiction"] == code, "page"].nunique())
                for code in ("SG", "AU", "US")
            }
            if len(controlled_df)
            else {},
        },
        "jurisdictionUnmapped": {
            "distinctSourceStrings": len(unmapped_counter),
            "rows": int(sum(unmapped_counter.values())),
            "csv": args.unmapped_csv,
            "top": dict(unmapped_counter.most_common(10)),
        },
    }
    with open(os.path.join(args.out_dir, "coverage.json"), "w", encoding="utf-8") as handle:
        json.dump(coverage, handle, indent=2, sort_keys=True)
        handle.write("\n")

    print("registration  %7d rows over %d pages (%d component rows, %d other-register rows)"
          % (len(registration_df), own["page"].nunique(), component_rows,
             coverage["registration"]["otherRegisterRows"]))
    print("patent        %7d rows over %d pages (%d no-record)"
          % (len(patent_df), patent_df["page"].nunique(), coverage["patent"]["noRecord"]))
    print("controlled    %7d rows over %d pages" % (len(controlled_df), len(controlled_pages)))
    print("unmapped      %7d distinct source strings, %d rows"
          % (len(unmapped_counter), sum(unmapped_counter.values())))
    print("wrote %s and %s" % (args.out_dir, args.unmapped_csv))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
