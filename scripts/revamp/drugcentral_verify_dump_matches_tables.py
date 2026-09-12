#!/usr/bin/env python
"""Check the bulk dump against the per-table CSV exports.

The mapping reads the CSV exports taken from the public read-only instance. The
dump is the publisher's own bulk artefact. This streams the dump, counts the
rows in each table's COPY block, and compares those counts with the exports, so
the claim that both routes carry the same release is checked rather than
assumed. Nothing is written to disk beyond the small result file.
"""
from __future__ import annotations

import csv
import gzip
import json
import os

csv.field_size_limit(1 << 27)

REPO = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
BASE = os.path.join(REPO, "data/sources/drugcentral/2026-09-05")
DUMP = os.path.join(BASE, "raw/drugcentral.dump.11012023.sql.gz")
TABLES = os.path.join(BASE, "raw/tables")
OUT = os.path.join(REPO, "data/sources/drugcentral/dump-vs-tables-check.json")

WANTED = [
    "structures", "identifier", "synonyms", "omop_relationship", "act_table_full",
    "pharma_class", "approval", "approval_type", "faers", "parentmol",
    "struct2parent", "atc", "struct2atc",
]

counts: dict[str, int] = {}
current = None
rows = 0
with gzip.open(DUMP, "rt", encoding="utf-8", errors="replace") as fh:
    for line in fh:
        if current is None:
            if line.startswith("COPY public."):
                name = line.split("COPY public.", 1)[1].split(" ", 1)[0].strip('"')
                if name in WANTED:
                    current, rows = name, 0
        elif line.startswith("\\."):
            counts[current] = rows
            current = None
        else:
            rows += 1

result = {"dump": os.path.basename(DUMP), "tables": {}, "all_match": True}
for name in WANTED:
    with open(os.path.join(TABLES, f"{name}.csv"), encoding="utf-8", newline="") as fh:
        exported = sum(1 for _ in csv.reader(fh)) - 1
    in_dump = counts.get(name)
    match = in_dump == exported
    result["tables"][name] = {"rows_in_dump": in_dump, "rows_in_export": exported,
                              "match": match}
    result["all_match"] = result["all_match"] and match

json.dump(result, open(OUT, "w", encoding="utf-8"), indent=2, sort_keys=True)
open(OUT, "a", encoding="utf-8").write("\n")
print(json.dumps(result, indent=2))
