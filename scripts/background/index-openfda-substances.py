#!/usr/bin/env python3
"""Reduce openFDA's substance archive to the identity fields RNAWiki records.

The archive is a single 2.4 GB JSON document — larger than the maximum string a Node process can
hold — so the reduction runs here, exactly as it does for the label archive. Nothing is interpreted:
this copies structured fields verbatim and drops everything RNAWiki does not read.

WHY THIS FILE MATTERS. Kew's Medicinal Plant Names Services holds the plant part used for medicinal
botanicals and cannot be used: no published licence, ClaudeBot disallowed in robots.txt, rights
reserved under EU DSM Article 4. FDA's substance registry carries the same fact — the part, the
parent organism, and what kind of material the substance is — as a US Government work. The route
around the block is not a workaround; it is a better source, because it is the registry the labels
themselves are keyed to.

Usage: python3 scripts/background/index-openfda-substances.py <substance.json> <out.ndjson>
"""

import json
import sys


def substance_records(path):
    """Yields whole records from an arbitrarily large JSON array without loading it.

    `raw_decode` is the standard library's C decoder and it stops cleanly at the end of one object,
    reporting where. Walking the file character by character in Python to balance braces was correct
    and unusably slow: 2.4 GB at interpreter speed is hours, and the same work through `raw_decode`
    is minutes.
    """
    decoder = json.JSONDecoder()
    with open(path, "r", encoding="utf-8") as handle:
        buffer = handle.read(8_000_000)
        at = buffer.index('"results"')
        at = buffer.index("[", at) + 1
        buffer = buffer[at:]
        while True:
            buffer = buffer.lstrip(", \t\r\n")
            if buffer.startswith("]"):
                return
            if not buffer:
                chunk = handle.read(8_000_000)
                if not chunk:
                    return
                buffer = chunk
                continue
            try:
                record, offset = decoder.raw_decode(buffer)
            except ValueError:
                # The record straddles the chunk boundary; pull more and try again.
                chunk = handle.read(8_000_000)
                if not chunk:
                    return
                buffer += chunk
                continue
            yield record
            buffer = buffer[offset:]


# Cross-reference systems worth keeping, and why each.
#
# These are IDENTIFIERS, not content: a number that addresses a record in another database. Keeping
# DrugBank's identifier is not keeping DrugBank's data, and the identifier itself comes from a US
# Government file. Systems whose identifiers say nothing a reader or a researcher could use are left
# out rather than hoarded.
#
# INN matters more than it looks. The International Nonproprietary Name is the name a substance goes
# by outside the United States, so it is what makes this corpus navigable from anywhere else.
KEPT_CODE_SYSTEMS = {
    "CAS",
    "PUBCHEM",
    "RXCUI",
    "INN",
    "ChEMBL",
    "CHEBI",
    "NCBI TAXONOMY",
    "EPA CompTox",
    "ECHA (EC/EINECS)",
    "SMS_ID",
    "DRUG BANK",
    "NCI_THESAURUS",
    "INCHIKEY",
    "MERCK INDEX",
}


def codes_of(record):
    """Cross-references, one per system, primary entries preferred."""
    best = {}
    for entry in record.get("codes") or []:
        system = entry.get("code_system")
        code = entry.get("code")
        if not system or not code or system not in KEPT_CODE_SYSTEMS:
            continue
        # A system can carry several codes; the primary one is the substance's own.
        if system not in best or entry.get("type") == "PRIMARY":
            best[system] = {"code": code, "url": entry.get("url")}
    return best


def names_of(record):
    """Every name the registry records, preferred one first."""
    preferred = None
    everything = []
    for entry in record.get("names") or []:
        name = entry.get("name")
        if not name:
            continue
        everything.append(name)
        if entry.get("preferred") and preferred is None:
            preferred = name
    return preferred or (everything[0] if everything else None), everything


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    source_path, out_path = sys.argv[1], sys.argv[2]

    written = 0
    read = 0
    with open(out_path, "w", encoding="utf-8") as out:
        for record in substance_records(source_path):
            read += 1
            unii = record.get("unii")
            preferred, all_names = names_of(record)
            if not unii or not preferred:
                continue

            diverse = record.get("structurally_diverse") or {}
            parent = (diverse.get("parent_substance") or {}).get("name")

            entry = {
                "unii": unii,
                "preferredName": preferred,
                # Capped generously rather than tightly. At 40 the cap bit on 411 records, and the
                # records it bit on are the most-named substances — the common drugs, whose ordinary
                # name can sit past the fortieth synonym. Acetazolamide was unidentifiable for
                # exactly this kind of reason.
                "names": all_names[:200],
                "substanceClass": record.get("substance_class"),
                "part": [value for value in (diverse.get("part") or []) if value],
                "parentSubstance": parent,
                "sourceMaterialClass": diverse.get("source_material_class"),
                "sourceMaterialType": diverse.get("source_material_type"),
                "codes": codes_of(record),
            }
            out.write(json.dumps(entry, ensure_ascii=False))
            out.write("\n")
            written += 1
            if written % 25000 == 0:
                print("[substances] %d written" % written, flush=True)

    print("[substances] read %d, wrote %d" % (read, written))


if __name__ == "__main__":
    main()
