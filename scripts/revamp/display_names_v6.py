"""Disambiguated display names for the pages a relation row has to tell apart (§17 item 3).

`docs/specs/phase4-generators.md` §17 item 3: "A relation to a page printing the same display name
uses that page's disambiguated name, never the bare shared name." Suprofen's page carries
"Stereoisomer of Suprofen" and the page it links to also prints "Suprofen", so the row names two
records with one name and a reader cannot tell which one it goes to.

`data/revamp/identity/display-names-v5.csv` does not cover the pair. It is written by
`identity_resolve.py` for the R4 collision set — two pages that share a **normalised name** and
have **different skeletons** — and every pair here shares a skeleton: they are the stereoisomer,
salt, component and combination pairs the identity stage deliberately kept apart, which R4 never
looks at. This script writes the revision that covers them.

Inputs (all stored, nothing fetched):

    data/revamp/identity/canonical-v5.ndjson       display name, UNII, structure, composition
    data/revamp/identity/display-names-v5.csv      the names already disambiguated
    data/revamp/identity/relations-v6.parquet      which pages a row links
    data/sources/gsrs/mapped.parquet               the FDA substance register's preferred name

Output:

    data/revamp/identity/display-names-v6.csv      the v5 rows and the new ones, with a column
                                                   saying which of the two each row is for

The `applies_to` column is the whole reason the two sets share a file rather than a name. A v5 row
is `page-title`: `page_blocks.py` writes it into the page's `disambiguation` and the page prints it
as its `h1`. A row this script adds is `relation-label`: it names the page **inside another page's
relation row** and changes no page's own title. Renaming 274 pages would move their titles, their
JSON-LD, their sitemap entries and every measurement keyed on a title, and §17 item 3 asks for the
link text.

The ladder, first rung that gives every page in a group a distinct value:

    1. recorded composition          a combination record beside a single-substance record
    2. stereo descriptor in the name  "(R)", "(S)", "(+)", "(-)" as the register printed it
    3. recorded stereochemistry       one InChIKey has no stereo layer and the other has one
    4. FDA substance register name    the GSRS preferred name where it differs from the title
    5. FDA UNII
    6. ChEMBL molecule identifier
    7. InChIKey

Rung 3's words are fixed by §15 item 6: an undefined stereo layer is "recorded without
stereochemistry" and never "racemate", "enantiomer" or "diastereomer", none of which an absent
layer states. A group no rung separates gets no row, is counted, and its relation rows print the
bare name, which is the honest state of two records this corpus cannot yet tell apart.

Usage:
    .venv-corpus/bin/python scripts/revamp/display_names_v6.py
"""

from __future__ import annotations

import argparse
import collections
import csv
import json
import os
import re
import sys

import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDENTITY = os.path.join(ROOT, "data", "revamp", "identity")
GSRS_MAPPED = os.path.join(ROOT, "data", "sources", "gsrs", "mapped.parquet")

COLUMNS = ["key", "current_display_name", "disambiguated_display_name", "disambiguator",
           "disambiguator_source", "collides_on", "collides_with", "applies_to"]

NON_ALNUM = re.compile(r"[^a-z0-9]+")
STEREO_IN_NAME = re.compile(r"\(([RS]|\+|-|RS|SR)\)", re.IGNORECASE)
# The InChIKey's second block. `UHFFFAOYSA` is the block a structure with no recorded
# stereochemistry produces; every other value encodes one.
NO_STEREO_LAYER = "UHFFFAOYSA"


def norm(text):
    return NON_ALNUM.sub(" ", (text or "").lower()).strip()


def inchikey_of(record):
    structure = record.get("structure") or {}
    key = structure.get("inchikey")
    if key:
        return key
    # A K2 page is keyed on its own InChIKey.
    if str(record.get("key", "")).startswith("K2:"):
        return str(record["key"])[3:]
    return None


def stereo_block(inchikey):
    parts = str(inchikey or "").split("-")
    return parts[1] if len(parts) >= 2 else ""


def load_canonical(path):
    pages = {}
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            pages[record["key"]] = record
    return pages


def load_v5(path):
    rows = []
    if not os.path.exists(path):
        return rows
    with open(path, encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            rows.append({column: row.get(column, "") for column in COLUMNS[:-1]})
    return rows


def load_register_names(pages):
    """The FDA substance register's preferred name for each page's own UNII."""
    out = {}
    if not os.path.exists(GSRS_MAPPED):
        return out
    unii_of = {key: (record.get("unii") or "") for key, record in pages.items()}
    table = pq.read_table(GSRS_MAPPED, columns=["key", "field", "value", "source_record_id"])
    for row in table.to_pylist():
        if row["field"] != "gsrs_preferred_name":
            continue
        key = row["key"]
        if key not in pages:
            continue
        # Only the page's own substance record names it; a page carries every GSRS record its
        # identifiers matched, and a mixture's preferred name is not this substance's name.
        recorded = str(row.get("source_record_id") or "")
        if unii_of.get(key) and recorded and unii_of[key] not in recorded:
            continue
        try:
            name = json.loads(row["value"])
        except (TypeError, ValueError):
            name = row["value"]
        if isinstance(name, str) and name.strip():
            out.setdefault(key, name.strip())
    return out


def composition_label(record):
    return "combination record" if record.get("isCombination") else "single substance record"


def rungs(group, pages, register_names, printed):
    """(source, {key: value}) for every rung, in the order the docstring fixes."""
    yield ("recorded composition",
           {key: composition_label(pages[key]) for key in group})

    def named_stereo(key):
        match = STEREO_IN_NAME.search(printed[key])
        if not match:
            return None
        token = match.group(1).upper()
        return {"R": "(R)", "S": "(S)", "+": "(+)", "-": "(-)"}.get(token, "(%s)" % token)

    yield ("stereo descriptor in the recorded name", {key: named_stereo(key) for key in group})

    def stereo_state(key):
        block = stereo_block(inchikey_of(pages[key]))
        if not block:
            return None
        # §15(6): an absent stereo layer states that no stereochemistry was recorded and nothing
        # more. It never names a racemate, an enantiomer or a diastereomer.
        return ("recorded without stereochemistry" if block == NO_STEREO_LAYER
                else "with recorded stereochemistry")

    yield ("recorded stereochemistry", {key: stereo_state(key) for key in group})

    def register_name(key):
        name = register_names.get(key)
        if name and norm(name) != norm(printed[key]):
            return name
        return None

    yield ("FDA substance register name", {key: register_name(key) for key in group})
    yield ("FDA UNII",
           {key: ("UNII %s" % pages[key]["unii"]) if pages[key].get("unii") else None
            for key in group})
    # Two records the FDA register keys on one UNII — the two Insulin Pork records both carry
    # AVT680JB39 — are still two molecules in ChEMBL, and that is the identifier that tells them
    # apart. It is also the only one a page with no UNII and no structure carries.
    yield ("ChEMBL molecule identifier",
           {key: ("ChEMBL %s" % pages[key]["chemblId"]) if pages[key].get("chemblId") else None
            for key in group})
    yield ("InChIKey",
           {key: ("structure %s" % inchikey_of(pages[key])) if inchikey_of(pages[key]) else None
            for key in group})


def choose(group, pages, register_names, printed):
    for source, values in rungs(group, pages, register_names, printed):
        if all(values.get(key) for key in group) and len(set(values.values())) == len(group):
            return source, values
    return None, None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--identity-dir", default=IDENTITY)
    parser.add_argument("--out", default=os.path.join(IDENTITY, "display-names-v6.csv"))
    parser.add_argument("--summary",
                        default=os.path.join(IDENTITY, "display-names-v6-summary.json"))
    args = parser.parse_args()

    pages = load_canonical(os.path.join(args.identity_dir, "canonical-v5.ndjson"))
    v5 = load_v5(os.path.join(args.identity_dir, "display-names-v5.csv"))
    already = {row["key"] for row in v5}
    printed = {}
    for key, record in pages.items():
        printed[key] = record.get("displayName") or key
    for row in v5:
        if row["key"] in printed and row.get("disambiguated_display_name"):
            printed[row["key"]] = row["disambiguated_display_name"]

    relations_file = os.path.join(args.identity_dir, "relations-v6.parquet")
    if not os.path.exists(relations_file):
        relations_file = os.path.join(args.identity_dir, "relations-v5.parquet")
    relations = pq.read_table(relations_file, columns=["page_a", "page_b"]).to_pylist()

    # Every group of pages that a relation row joins and that print one name.
    groups = collections.defaultdict(set)
    for row in relations:
        a, b = row["page_a"], row["page_b"]
        if a not in pages or b not in pages:
            continue
        if norm(printed[a]) != norm(printed[b]):
            continue
        groups[norm(printed[a])] |= {a, b}

    register_names = load_register_names(pages)
    added = []
    unresolved = []
    for shared, keys in sorted(groups.items()):
        group = sorted(keys)
        if any(key in already for key in group):
            # One half already carries a page title of its own; the pair is told apart by that.
            continue
        source, values = choose(group, pages, register_names, printed)
        if source is None:
            unresolved.append({"collides_on": shared, "keys": group})
            continue
        for key in group:
            added.append({
                "key": key,
                "current_display_name": printed[key],
                "disambiguated_display_name": "%s (%s)" % (printed[key], values[key]),
                "disambiguator": values[key],
                "disambiguator_source": source,
                "collides_on": shared,
                "collides_with": ";".join(other for other in group if other != key),
                "applies_to": "relation-label",
            })

    rows = [{**row, "applies_to": "page-title"} for row in v5] + added
    rows.sort(key=lambda row: (row["applies_to"], row["key"]))
    with open(args.out, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in COLUMNS})

    summary = {
        "generatedBy": "scripts/revamp/display_names_v6.py",
        "spec": "docs/specs/phase4-generators.md#17",
        "rowsFromV5": len(v5),
        "rowsAdded": len(added),
        "groupsCovered": len({row["collides_on"] for row in added}),
        "groupsWithNoDistinguishingRecord": len(unresolved),
        "unresolved": unresolved[:50],
        "bySource": dict(collections.Counter(row["disambiguator_source"] for row in added)),
        "out": os.path.relpath(args.out, ROOT),
    }
    with open(args.summary, "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
    print(json.dumps({key: summary[key] for key in
                      ("rowsFromV5", "rowsAdded", "groupsCovered",
                       "groupsWithNoDistinguishingRecord", "bySource")}, indent=2))
    for row in added[:20]:
        print("  %s -> %s" % (row["key"], row["disambiguated_display_name"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
