#!/usr/bin/env python
"""Phase 6.3 — the committed slug union the pre-merge redirect check reads.

`scripts/revamp/redirect_check.py` builds its universe from three places: the 9,852 corpus-20k
reconciliation dispositions, the production `medicine_slug_redirects` table read over the CA-pinned
Railway connection, and the redirect plan. A GitHub Actions runner has neither the Railway CLI nor
the production credentials, so the universe is written here, once, from the two files this
repository carries and the plan, and committed. `scripts/revamp/ci_redirect_check.py` reads it.

The three inputs, and why each one is in the union:

  * `data/corpus-20k/reconciliation/dispositions.ndjson` — every slug the corpus-20k run published.
  * `data/revamp/identity/legacy-redirects.csv` — the 870 rows of the production redirect table as
    the identity work recorded them. The live table is the authority; this file is the committed
    record of it, and the post-deploy live half re-requests every slug against the real site, so a
    row that has drifted shows up there as a status, not as a silent pass.
  * `data/revamp/identity/redirect-plan-v5.csv` — the plan under review, whose `old_slug` values are
    part of the universe the plan must serve.

Every row carries the source that put the slug in the union, so a later reader can tell a legacy
slug from a planned one without re-deriving the file.

    .venv-corpus/bin/python scripts/revamp/ci_slug_union.py
    .venv-corpus/bin/python scripts/revamp/ci_slug_union.py --check    # CI: fail if stale
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DISPOSITIONS = ROOT / "data/corpus-20k/reconciliation/dispositions.ndjson"
LEGACY_REDIRECTS = ROOT / "data/revamp/identity/legacy-redirects.csv"
PLAN = ROOT / "data/revamp/identity/redirect-plan-v5.csv"
OUT = ROOT / "data/revamp/ci-sample/slug-union.csv"

HEADER = ("slug", "sources")


def build(dispositions: Path, legacy: Path, plan: Path) -> list[tuple[str, str]]:
    sources: dict[str, set[str]] = {}

    def note(slug: str, source: str) -> None:
        slug = slug.strip()
        if slug:
            sources.setdefault(slug, set()).add(source)

    with dispositions.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                note(json.loads(line)["slug"], "disposition")

    with legacy.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            note(row["old_slug"], "production-redirect")

    with plan.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            note(row["old_slug"], "plan")

    return [(slug, " ".join(sorted(sources[slug]))) for slug in sorted(sources)]


def render(rows: list[tuple[str, str]]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(HEADER)
    writer.writerows(rows)
    return buffer.getvalue()


def read_union(path: Path) -> list[str]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [row["slug"] for row in csv.DictReader(handle) if row["slug"].strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dispositions", type=Path, default=DISPOSITIONS)
    parser.add_argument("--legacy-redirects", type=Path, default=LEGACY_REDIRECTS)
    parser.add_argument("--plan", type=Path, default=PLAN)
    parser.add_argument("--out", type=Path, default=OUT)
    parser.add_argument("--check", action="store_true",
                        help="write nothing; fail if the committed file is not what the inputs "
                             "produce, naming the first slug that differs")
    args = parser.parse_args()

    for path in (args.dispositions, args.legacy_redirects, args.plan):
        if not path.exists():
            raise SystemExit(f"missing input: {path}")

    rows = build(args.dispositions, args.legacy_redirects, args.plan)
    text = render(rows)

    if args.check:
        if not args.out.exists():
            raise SystemExit(f"{args.out} does not exist; run this script without --check")
        held = args.out.read_text(encoding="utf-8")
        if held == text:
            print(f"slug union current: {len(rows)} slugs in {args.out.relative_to(ROOT)}")
            return 0
        want = [slug for slug, _sources in rows]
        have = read_union(args.out)
        missing = sorted(set(want) - set(have))
        extra = sorted(set(have) - set(want))
        print(f"{args.out.relative_to(ROOT)} is stale: {len(have)} slugs committed, "
              f"{len(want)} produced by the inputs", file=sys.stderr)
        for slug in missing[:20]:
            print(f"MISSING {slug}: the inputs name it and the committed union does not",
                  file=sys.stderr)
        for slug in extra[:20]:
            print(f"EXTRA   {slug}: the committed union names it and the inputs do not",
                  file=sys.stderr)
        if not missing and not extra:
            print("the slug sets match; the recorded sources column differs", file=sys.stderr)
        print("regenerate with: .venv-corpus/bin/python scripts/revamp/ci_slug_union.py",
              file=sys.stderr)
        return 1

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(text, encoding="utf-8")
    counts: dict[str, int] = {}
    for _slug, source in rows:
        counts[source] = counts.get(source, 0) + 1
    print(f"{len(rows)} slugs written to {args.out.relative_to(ROOT)}")
    for source, count in sorted(counts.items()):
        print(f"  {source}: {count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
