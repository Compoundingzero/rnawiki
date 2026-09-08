#!/usr/bin/env python
"""Phase 4 section 14 item 5 — the interaction counterparts that are entity-linking artefacts.

A label-documented interaction line names a counterpart, and
`docs/specs/phase4-generators.md` section 14 item 5 fixes what a counterpart may be: "A
counterpart must resolve to a substance page or a recognised drug class; 'PLATELETS' and bare
'ASA' are entity-linking artefacts and are dropped with the count recorded."

Two shapes of artefact are decided here, once, and written to a CSV that
`scripts/revamp/page_blocks.py` reads. Neither is a list of names typed out by hand: both are
tests over what the corpus itself records about the page the label surface was linked to.

  * **A material, not a medicine.** The FDA Global Substance Registration System files a substance
    under a substance class, and `structurallyDiverse` is the class it uses for cells, tissues,
    whole organisms and other materials that have no defined chemical or protein structure. A
    label sentence that says a medicine affects platelets is not naming the transfusion product
    `PLATELETS` (UNII V82T6JEZ99, GSRS class `structurallyDiverse`) as a co-administered medicine;
    the lexicon matched the word to the material's record. The class is the register's own, so the
    drop cites a source rather than a judgement.

  * **A bare abbreviation.** A counterpart whose printed name is a short all-capital token — no
    lowercase letter, at most four characters — names nothing a reader can check against a
    register. `ASA` is the printed name of the aspirin DL-lysine record, which the same label also
    names as `aspirin`; the abbreviation adds a second line for one page under a name that is not
    a medicine's name.

The page whose name is dropped keeps its own page and every other line on it; what is dropped is
the counterpart line, and the count is recorded in the summary and in this file.

    .venv-corpus/bin/python scripts/revamp/counterpart_artefacts.py

Output: `data/revamp/interactions/counterpart-artefacts.csv` (key, printed_name, reason, evidence).
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# GSRS's own class for a substance with no defined chemical or protein structure: a cell, a tissue,
# a whole organism, a plant material. The register's word, not this run's.
MATERIAL_CLASS = "structurallyDiverse"

# A bare abbreviation: all capitals, no lowercase letter, at most four characters.
ABBREVIATION = re.compile(r"^[A-Z0-9][A-Z0-9.\-]{0,3}$")

VOCABULARY_TAG = re.compile(r"\s*\[[^\]]*\]\s*$")


def repo(*parts: str) -> str:
    return os.path.join(ROOT, *parts)


def iter_ndjson(path: str):
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def name_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def printed_name(display_name: str, synonyms) -> str:
    """`printedDisplayName` from `scripts/corpus-20k/render/page-text.ts`, in Python.

    The page prints a title-case common or INN synonym in place of an all-capital register string
    where one exists (section 10), so the abbreviation test has to be applied to the name the page
    actually prints and not to the stored one.
    """
    name = (display_name or "").strip()
    letters = [ch for ch in name if ch.isalpha()]
    if not name or not (name == name.upper() and len(letters) >= 2):
        return display_name
    target = name_token(name)
    same = []
    for synonym in synonyms or []:
        if not isinstance(synonym, dict):
            continue
        kind = str(synonym.get("kind") or "").lower()
        if kind not in ("common", "inn", "merged-page"):
            continue
        candidate = VOCABULARY_TAG.sub("", str(synonym.get("name") or "")).strip()
        if not candidate or not any(ch.islower() for ch in candidate):
            continue
        candidate_letters = [ch for ch in candidate if ch.isalpha()]
        if candidate == candidate.upper() and len(candidate_letters) >= 2:
            continue
        if name_token(candidate) == target:
            same.append(candidate)
    return sorted(same)[0] if same else display_name


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fields-dir", default=repo("data", "revamp", "fields-v2"))
    parser.add_argument("--canonical", default=repo("data", "revamp", "identity", "canonical-v5.ndjson"))
    parser.add_argument(
        "--out", default=repo("data", "revamp", "interactions", "counterpart-artefacts.csv")
    )
    args = parser.parse_args(argv)

    names: dict[str, str] = {}
    if os.path.exists(args.canonical):
        for record in iter_ndjson(args.canonical):
            key = record.get("key")
            if not key:
                continue
            names[key] = printed_name(record.get("displayName") or key, record.get("synonyms"))

    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    paths = sorted(glob.glob(os.path.join(args.fields_dir, "**", "batch-*.ndjson"), recursive=True))
    if not paths:
        print("no field batches under %s" % args.fields_dir, file=sys.stderr)
        return 2
    for path in paths:
        for record in iter_ndjson(path):
            key = record.get("key")
            if not key or key in seen:
                continue
            entry = (record.get("fields") or {}).get("identifiers")
            value = entry.get("value") if isinstance(entry, dict) else None
            gsrs = value.get("gsrs") if isinstance(value, dict) else None
            substance_class = gsrs.get("substanceClass") if isinstance(gsrs, dict) else None
            if substance_class != MATERIAL_CLASS:
                continue
            seen.add(key)
            rows.append(
                {
                    "key": key,
                    "printed_name": names.get(key, key),
                    "reason": "material, not a medicine",
                    "evidence": "GSRS substance class %s" % MATERIAL_CLASS,
                }
            )

    for key, name in names.items():
        if key in seen:
            continue
        if ABBREVIATION.match(name.strip()):
            seen.add(key)
            rows.append(
                {
                    "key": key,
                    "printed_name": name,
                    "reason": "bare abbreviation",
                    "evidence": "the printed name is %d capital characters and the record holds no "
                    "title-case common or INN synonym for it" % len(name.strip()),
                }
            )

    rows.sort(key=lambda row: (row["reason"], row["key"]))
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["key", "printed_name", "reason", "evidence"])
        writer.writeheader()
        writer.writerows(rows)

    by_reason: dict[str, int] = {}
    for row in rows:
        by_reason[row["reason"]] = by_reason.get(row["reason"], 0) + 1
    print(
        json.dumps(
            {
                "generatedBy": "scripts/revamp/counterpart_artefacts.py",
                "spec": "docs/specs/phase4-generators.md#14",
                "out": os.path.relpath(args.out, ROOT),
                "pages": len(rows),
                "byReason": by_reason,
            },
            indent=2,
            sort_keys=True,
        )
    )
    for row in rows[:20]:
        print("  %-28s %-28s %s" % (row["key"][:28], row["printed_name"][:28], row["reason"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
