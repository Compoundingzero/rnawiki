#!/usr/bin/env python
"""Phase 4 section 14 item 12 — one relation per pair, the most specific.

`docs/specs/phase4-generators.md` section 14 item 12: "**One relation per pair,** the most
specific ('stereoisomer of', never also 'same structure as')."

Phase 3 resolved each pair by every rule that applied to it, and recorded each result. A pair that
is a stereoisomer pair is also, trivially, a same-structure pair and a form pair, so the identity
revision carries two relation rows for 1,022 directed pairs and the page painted both: "Stereoisomer
of X" above "Same structure as X" is one relation stated twice, at two levels of precision, and the
second says nothing the first does not.

This step is the projection, not a re-resolution. It reads the revision Phase 3 published and
writes the same revision with one relation per directed pair — the most specific one, by the order
below — as `relations-v6.parquet` and `canonical-v6.ndjson`. Nothing else in either file changes,
and both v5 files stay on disk beside them, because the choice of which relation to print is a
rendering decision and the resolution's own record of what it found must remain readable.

The order is by how much a relation says about the pair. `stereoisomer of` names the exact
difference between two structures; `form of` says only that one is a form of the other;
`same structure as` says only that the structures match. A relation earlier in this list is kept
over one later in it; two relations at the same rank cannot occur, because the ranks are distinct.

    .venv-corpus/bin/python scripts/revamp/identity_relations_v6.py

Output: `data/revamp/identity/relations-v6.parquet`, `data/revamp/identity/canonical-v6.ndjson`,
`data/revamp/identity/relations-v6-summary.json`.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
IDENTITY = ROOT / "data/revamp/identity"

# Most specific first. A relation not named here ranks after every one that is, in its own name's
# order, so a vocabulary this list has not caught cannot silently outrank a named relation.
SPECIFICITY = (
    # A licensing fact about two biologics: the most specific thing a register states about a pair.
    "biosimilar-of",
    # The exact chemical difference, named.
    "isotopologue-of",
    "stereoisomer-of",
    "racemate-of",
    "ester-of",
    "prodrug-of",
    "salt-of",
    "hydrate-of",
    "ionised-form-of",
    # Composition and moiety: what one record is made of, or reduces to.
    "active-moiety-of",
    "component-of",
    "contains",
    # Lineage.
    "originator-of",
    "parent-of",
    # The unnamed difference, then structural identity, then a shared target or enzyme.
    "form-of",
    "related-form-of",
    "same-structure-as",
    "same-target",
    "shares-enzyme",
)

RANK = {name: index for index, name in enumerate(SPECIFICITY)}


def kind(relation: str) -> str:
    """The relation's canonical spelling. The corpus writes both `form_of` and `form-of`."""
    return (relation or "").strip().lower().replace("_", "-")


def rank_of(relation: str) -> tuple[int, str]:
    name = kind(relation)
    return (RANK.get(name, len(SPECIFICITY)), name)


def most_specific(relations: list[str]) -> str:
    return sorted(relations, key=rank_of)[0]


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--relations", type=Path, default=IDENTITY / "relations-v5.parquet")
    parser.add_argument("--canonical", type=Path, default=IDENTITY / "canonical-v5.ndjson")
    parser.add_argument("--out-relations", type=Path, default=IDENTITY / "relations-v6.parquet")
    parser.add_argument("--out-canonical", type=Path, default=IDENTITY / "canonical-v6.ndjson")
    parser.add_argument("--summary", type=Path, default=IDENTITY / "relations-v6-summary.json")
    args = parser.parse_args(argv)

    if not args.relations.exists():
        print("no relations parquet at %s" % args.relations, file=sys.stderr)
        return 2

    frame = pd.read_parquet(args.relations)
    before = len(frame)
    frame["_rank"] = [rank_of(value)[0] for value in frame["relation"]]
    frame = frame.sort_values(["page_a", "page_b", "_rank", "relation"], kind="stable")
    kept = frame.drop_duplicates(subset=["page_a", "page_b"], keep="first").drop(columns=["_rank"])
    dropped_rows = before - len(kept)
    args.out_relations.parent.mkdir(parents=True, exist_ok=True)
    kept.to_parquet(args.out_relations, index=False)

    dropped_by_pair: Counter = Counter()
    pairs_deduped = 0
    written = 0
    with args.canonical.open(encoding="utf-8") as source, args.out_canonical.open(
        "w", encoding="utf-8"
    ) as out:
        for line in source:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            relations = record.get("relations")
            if isinstance(relations, list) and relations:
                by_target: dict[str, list[dict]] = {}
                order: list[str] = []
                for entry in relations:
                    if not isinstance(entry, dict):
                        continue
                    target = entry.get("targetKey")
                    if not target:
                        continue
                    if target not in by_target:
                        by_target[target] = []
                        order.append(target)
                    by_target[target].append(entry)
                deduped = []
                for target in order:
                    held = by_target[target]
                    if len(held) > 1:
                        pairs_deduped += 1
                        winner = sorted(held, key=lambda item: rank_of(str(item.get("type") or "")))[0]
                        for entry in held:
                            if entry is not winner:
                                dropped_by_pair[
                                    "%s over %s"
                                    % (kind(str(winner.get("type"))), kind(str(entry.get("type"))))
                                ] += 1
                        deduped.append(winner)
                    else:
                        deduped.append(held[0])
                record["relations"] = deduped
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            written += 1

    summary = {
        "generatedBy": "scripts/revamp/identity_relations_v6.py",
        "spec": "docs/specs/phase4-generators.md#14",
        "relationsIn": before,
        "relationsOut": int(len(kept)),
        "relationRowsDropped": int(dropped_rows),
        "canonicalRecords": written,
        "canonicalPairsDeduped": pairs_deduped,
        "keptOverDropped": dict(sorted(dropped_by_pair.items(), key=lambda item: -item[1])),
    }
    args.summary.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    printable = dict(summary)
    printable["keptOverDropped"] = dict(list(summary["keptOverDropped"].items())[:20])
    print(json.dumps(printable, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
