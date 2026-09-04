#!/usr/bin/env python
"""Build the harness's validation corpus without fetching anything.

The 324-record diagnosis (``docs/worklogs/page-overlap-diagnosis.md``) fetched live HTML into a
gitignored ``$SAMPLE_DIR``; that directory is not on disk and ``tmp/build-sample.ts`` /
``tmp/fetch-sample.ts`` are the only survivors (see ``docs/specs/corpus-20k-repo-map.md`` s6).
Fetching is not permitted here, so this builds a **synthetic** 324-page corpus instead, from the
committed dossier export ``data/drugs/*.ndjson``:

* the sample is drawn with the diagnosis's own design, reimplemented from ``tmp/build-sample.ts``
  (30 richest, 30 median, 30 thinnest by evidence-bearing section count, then a proportional draw
  per entity class with the same seeded key), over the same canonical-record population;
* each page's text is the record's own exported field paths and values, in a fixed order. Every
  word comes from the export. No sentence is written here, and nothing is written into ``data/``.

The result is a corpus with the same shape as a dossier page set  a fixed repeated structural
layer over per-record values  but it is NOT the diagnosis's page text. A delta measured on it is
a delta against an exhaustive run of this same harness, not against the diagnosis's numbers.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

EVIDENCE_STATES = {
    "EXACT_SOURCE_BACKED",
    "EXACT_STRUCTURED_SOURCE_DATA",
    "REVIEWED_INTERPRETATION",
    "SOURCE_STATED_NON_ESTABLISHMENT",
    "REPRESENTED_SOURCE_CONFLICT",
}

SKIP_KEYS = {"url"}


def flatten(value, path: str, out: list[str]) -> None:
    if isinstance(value, dict):
        for key in sorted(value):
            if key in SKIP_KEYS:
                continue
            flatten(value[key], f"{path} {key}" if path else key, out)
    elif isinstance(value, list):
        if not value:
            out.append(f"{path} none recorded")
        for item in value:
            flatten(item, path, out)
    elif value is None:
        out.append(f"{path} not recorded")
    elif isinstance(value, bool):
        out.append(f"{path} {'yes' if value else 'no'}")
    else:
        text = str(value).strip()
        out.append(f"{path} {text}" if text else f"{path} not recorded")


def page_text(record: dict) -> str:
    lines: list[str] = []
    flatten(record, "", lines)
    return "\n".join(lines)


def load_records(export_dir: Path) -> list[dict]:
    records: list[dict] = []
    for path in sorted(export_dir.glob("drugs-*.ndjson")):
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    records.append(json.loads(line))
    return records


def seeded(items: list[dict], n: int, seed: int) -> list[dict]:
    """The sampler's deterministic pick, reimplemented from tmp/build-sample.ts."""
    scored = [((index + 1) * 2654435761 + seed) % 4294967296 for index in range(len(items))]
    order = sorted(range(len(items)), key=lambda i: scored[i])
    return [items[i] for i in order[:n]]


def draw_sample(records: list[dict], size: int) -> list[dict]:
    enriched = []
    for r in records:
        resolution = r.get("inventoryResolution") or {}
        if resolution.get("resolutionStatus") != "CANONICAL_ENTITY":
            continue
        completion = r.get("dossierCompletion") or {}
        states = completion.get("sectionStates") or {}
        if not states:
            continue
        enriched.append(
            {
                "record": r,
                "slug": r.get("id"),
                "entityClass": resolution.get("entityClass") or "",
                "evidenceSections": sum(1 for s in states.values() if s in EVIDENCE_STATES),
            }
        )
    enriched.sort(key=lambda e: str(e["slug"]))
    by_evidence = sorted(enriched, key=lambda e: -e["evidenceSections"])
    mid = len(by_evidence) // 2

    picked: dict[str, dict] = {}

    def add(items, stratum):
        for item in items:
            if item["slug"] not in picked:
                picked[item["slug"]] = {**item, "stratum": stratum}

    add(by_evidence[:30], "richest")
    add(by_evidence[mid - 15 : mid + 15], "median")
    add(by_evidence[-30:], "thinnest")
    classes = sorted({e["entityClass"] for e in enriched})
    for cls in classes:
        members = [e for e in enriched if e["entityClass"] == cls]
        want = max(6, round(len(members) / len(enriched) * 210))
        add(seeded(members, min(want, len(members)), len(cls) * 7919), f"class:{cls}")

    sample = list(picked.values())
    if len(sample) > size:
        sample = sample[:size]
    elif len(sample) < size:
        for item in seeded(enriched, len(enriched), 104729):
            if item["slug"] not in picked:
                picked[item["slug"]] = {**item, "stratum": "topup"}
                sample.append(picked[item["slug"]])
            if len(sample) == size:
                break
    return sample


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--export", type=Path, default=Path("data/drugs"))
    parser.add_argument("--out", type=Path, required=True, help="NDJSON of {key, text, tier} to write")
    parser.add_argument("--slugs", type=Path, help="also write the drawn slug list here")
    parser.add_argument("--size", type=int, default=324)
    args = parser.parse_args()

    records = load_records(args.export)
    sample = draw_sample(records, args.size)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as handle:
        for item in sample:
            handle.write(
                json.dumps(
                    {
                        "key": item["slug"],
                        "tier": item["stratum"].split(":")[0],
                        "entityClass": item["entityClass"],
                        "evidenceSections": item["evidenceSections"],
                        "text": page_text(item["record"]),
                    }
                )
                + "\n"
            )
    if args.slugs:
        args.slugs.write_text("\n".join(str(i["slug"]) for i in sample) + "\n", encoding="utf-8")
    print(json.dumps({"pages": len(sample), "out": str(args.out), "sourceRecords": len(records)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
