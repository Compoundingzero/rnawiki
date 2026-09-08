#!/usr/bin/env python
"""Phase 6.3 — `redirect_check.py` run where the production database is out of reach.

`scripts/revamp/redirect_check.py` reads the production `medicine_slug_redirects` table through the
Railway CLI before it can simulate the plan. A GitHub Actions runner has neither the CLI nor the
credentials, so this wrapper calls that script's own functions — `read_plan`, `surviving_slugs` and
`check_plan`, imported, not copied — with two committed inputs in place of the two live ones:

  * the universe comes from `data/revamp/ci-sample/slug-union.csv` (`ci_slug_union.py` builds it
    from the dispositions, the recorded production redirect rows and the plan);
  * the production redirect rows come from `data/revamp/identity/legacy-redirects.csv`, the
    committed record of that table.

Nothing else changes: the plan, the canonical identity revision, the page-slug route map and every
rule about orphans, chains and conflicts are the ones `redirect_check.py` applies. A slug that the
plan orphans, a chain of two hops, or a plan row that contradicts a recorded production row fails
this check by name.

    scripts/revamp/ci_redirect_check.py --plan                       # pre-merge, no network
    scripts/revamp/ci_redirect_check.py --live --base-url https://rnawiki.com   # post-deploy

`--live` is `redirect_check.check_live` over the same committed union: every slug requested against
the deployed site, at most four at a time, redirect not followed, passing on 200, 301 or 308, with
every request appended to `data/corpus-20k/legal/requests.log` exactly as that script does it.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import redirect_check  # noqa: E402  (the path is set immediately above)

ROOT = Path(__file__).resolve().parents[2]
UNION = ROOT / "data/revamp/ci-sample/slug-union.csv"
LEGACY_REDIRECTS = ROOT / "data/revamp/identity/legacy-redirects.csv"
PLAN = ROOT / "data/revamp/identity/redirect-plan-v5.csv"
OUT = ROOT / "data/revamp/redirect-check-ci.json"


def read_union(path: Path) -> set[str]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if not rows or "slug" not in rows[0]:
        raise SystemExit(f"{path} has no `slug` column; regenerate it with ci_slug_union.py")
    return {row["slug"].strip() for row in rows if row["slug"].strip()}


def read_recorded_production(path: Path) -> list[tuple[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [
            (row["old_slug"].strip(), row["target_drug_id"].strip())
            for row in csv.DictReader(handle)
            if row["old_slug"].strip()
        ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--plan", action="store_true",
                        help="simulate the redirect plan over the committed union (the pre-merge "
                             "check; makes no network request)")
    parser.add_argument("--live", action="store_true",
                        help="request every slug in the committed union against --base-url")
    parser.add_argument("--base-url", default="https://rnawiki.com")
    parser.add_argument("--plan-file", type=Path, default=PLAN)
    parser.add_argument("--union", type=Path, default=UNION)
    parser.add_argument("--production", type=Path, default=LEGACY_REDIRECTS)
    parser.add_argument("--canonical", type=Path, default=redirect_check.CANONICAL_DEFAULT)
    parser.add_argument("--out", type=Path, default=OUT)
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--timeout", type=float, default=30.0)
    args = parser.parse_args()

    if not args.plan and not args.live:
        parser.error("pass --plan, --live, or both")
    if args.concurrency > 4:
        raise SystemExit("the live check is capped at four concurrent requests")
    for path in (args.union, args.production, args.plan_file, args.canonical):
        if not path.exists():
            raise SystemExit(f"missing input: {path}")

    universe = read_union(args.union.resolve())
    payload = {
        "generatedAt": redirect_check.now(),
        "step": "6.3",
        "runner": "scripts/revamp/ci_redirect_check.py",
        "inputs": {
            "union": str(args.union.resolve().relative_to(ROOT)),
            "productionRedirectTable": str(args.production.resolve().relative_to(ROOT))
            + " (committed record of medicine_slug_redirects; the live table is read on the "
              "workstation by redirect_check.py)",
            "plan": str(args.plan_file.resolve().relative_to(ROOT)),
            "canonical": str(args.canonical.resolve().relative_to(ROOT)),
        },
    }

    failed = False

    if args.plan:
        plan = redirect_check.read_plan(args.plan_file.resolve())
        production = read_recorded_production(args.production.resolve())
        live_slugs = redirect_check.surviving_slugs(plan, args.canonical.resolve())
        result = redirect_check.check_plan(universe, production, plan, live_slugs)
        payload["plan"] = result
        print(f"plan: universe {result['universe']} · served directly {result['servedDirectly']} "
              f"· one hop {result['servedByOneHop']} · orphans {result['orphanCount']} "
              f"· chains {result['chainCount']} · conflicts {result['conflictCount']}")
        for row in result["orphans"][:20]:
            print(f"ORPHAN {row['slug']}: {row['why']}", file=sys.stderr)
            failed = True
        for row in result["chains"][:20]:
            print(f"CHAIN  {row['slug']} -> {row['hop1']} -> {row['hop2']}", file=sys.stderr)
            failed = True
        for row in result["conflicts"][:20]:
            print(f"CONFLICT {row['slug']}: the recorded production table sends it to "
                  f"{row['production_target']}, the plan sends it to {row['plan_target']}",
                  file=sys.stderr)
            failed = True

    if args.live:
        result = redirect_check.check_live(
            args.base_url, sorted(universe), args.concurrency, args.timeout
        )
        payload["live"] = result
        print(f"live: checked {result['checked']} · {result['byStatus']} "
              f"· failures {result['failureCount']}")
        for slug, status in list(result.get("failures", {}).items())[:20]:
            print(f"LIVE   {args.base_url.rstrip('/')}/d/{slug} answered {status}", file=sys.stderr)
            failed = True

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"written to {args.out.resolve().relative_to(ROOT)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
