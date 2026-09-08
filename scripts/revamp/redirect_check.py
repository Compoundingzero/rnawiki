#!/usr/bin/env python
"""Step 3.5: prove that no URL the site has ever published is lost.

Two checks, both written to `data/revamp/redirect-check.json`.

(a) live. Every slug in the union of all slugs ever published - the 9,852 reconciliation
    dispositions plus the 870 rows of the production `medicine_slug_redirects` table - is requested
    on the live site, at most four at a time, without following the redirect. A slug passes on 200,
    301 or 308. Every request is appended to `data/corpus-20k/legal/requests.log`.

(b) plan. The redirect plan from 3.2 is simulated over the same union together with the production
    redirect table. The check proves two things: no slug is orphaned (every one resolves to a page
    that exists after the merges), and no redirect chain is longer than one hop.

The production connection string is read from the Postgres service through the Railway CLI and is
never printed. Certificate verification is not relaxed: sslmode=verify-ca against the CA read out
of the database container, with PGSSLSERVERNAME=localhost, the only name that certificate asserts.

    redirect_check.py --base-url https://rnawiki.com --plan data/revamp/identity/redirect-plan.csv

The live half also runs against a build served on this machine, which is how the plan is proved
before it is deployed: `--base-url http://127.0.0.1:<port>`. Plain HTTP is accepted only for a
loopback host; every other base URL must be https, and the check itself is unchanged.

The script exits non-zero and names the offending slug when either check fails, so it can run as a
CI gate.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
import http.client
import threading
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROOT_CERT = ROOT.parent / "rnawiki-backups" / "railway" / "postgres-root.crt"
DISPOSITIONS = ROOT / "data/corpus-20k/reconciliation/dispositions.ndjson"
PAGE_SLUGS = ROOT / "data/revamp/identity/page-slugs.csv"
CANONICAL_V2 = ROOT / "data/revamp/identity/canonical-v2.ndjson"
# §11: every check recomputes slugs from the revision this run publishes. Section 12 makes that
# `canonical-v5` — v3 with the 351(a) merges applied — and the v3 file stays readable beside it.
CANONICAL_V3 = ROOT / "data/revamp/identity/canonical-v3.ndjson"
CANONICAL_V5 = ROOT / "data/revamp/identity/canonical-v5.ndjson"
CANONICAL_DEFAULT = next(
    (path for path in (CANONICAL_V5, CANONICAL_V3, CANONICAL_V2) if path.exists()), CANONICAL_V2
)
REQUEST_LOG = ROOT / "data/corpus-20k/legal/requests.log"

USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
ACCEPTED = (200, 301, 308)
PAGE_PREFIX = "/d/"


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------------------------
# inputs
# ---------------------------------------------------------------------------------------------

def connection_url(service: str) -> str:
    raw = subprocess.run(
        ["railway", "variables", "--service", service, "--json"],
        capture_output=True, text=True, check=True, cwd=str(ROOT),
    ).stdout
    url = json.loads(raw)["DATABASE_PUBLIC_URL"]
    joiner = "&" if "?" in url else "?"
    return f"{url}{joiner}sslmode=verify-ca&sslrootcert={ROOT_CERT}"


def production_redirects(service: str) -> list[tuple[str, str]]:
    url = connection_url(service)
    env = dict(os.environ)
    env["PGSSLSERVERNAME"] = "localhost"
    env["PGSSLROOTCERT"] = str(ROOT_CERT)
    sql = "select old_slug, target_drug_id from medicine_slug_redirects order by old_slug"
    result = subprocess.run(
        ["psql", url, "-X", "-q", "-A", "-t", "-F", "\t", "-v", "ON_ERROR_STOP=1", "-c", sql],
        capture_output=True, text=True, env=env, cwd=str(ROOT),
    )
    if result.returncode != 0:
        raise SystemExit("psql failed reading medicine_slug_redirects: "
                         + result.stderr.replace(url, "<connection string withheld>"))
    rows = []
    for line in result.stdout.strip().splitlines():
        if not line.strip():
            continue
        old, target = line.split("\t", 1)
        rows.append((old.strip(), target.strip()))
    return rows


def read_page_slugs() -> dict[str, str]:
    with PAGE_SLUGS.open() as handle:
        return {row["key"]: row["slug"] for row in csv.DictReader(handle) if row["slug"]}


def read_plan(path: Path) -> list[tuple[str, str, str]]:
    with path.open() as handle:
        return [(row["old_slug"], row["new_slug"], row["reason"]) for row in csv.DictReader(handle)]


def surviving_slugs(plan: list[tuple[str, str, str]], canonical: Path = CANONICAL_DEFAULT) -> set[str]:
    """The slugs that still serve a page once the merges and adoptions in `canonical` are applied."""
    by_key = read_page_slugs()
    live: set[str] = set()
    with canonical.open() as handle:
        for line in handle:
            record = json.loads(line)
            slug = by_key.get(record["key"]) or record.get("adoptedSlug") or record.get("existingSlug")
            if slug:
                live.add(slug)
    for old, _new, _reason in plan:
        live.discard(old)
    for _old, new, _reason in plan:
        live.add(new)
    return live


# ---------------------------------------------------------------------------------------------
# (a) live
# ---------------------------------------------------------------------------------------------

def check_live(base_url: str, slugs: list[str], concurrency: int, timeout: float) -> dict:
    """At most `concurrency` connections, each kept alive and reused, one HEAD at a time on each."""
    parsed = urllib.parse.urlsplit(base_url)
    host = parsed.netloc
    hostname = parsed.hostname or ""
    loopback = hostname in ("localhost", "127.0.0.1", "::1")
    if parsed.scheme == "https":
        plain = False
    elif parsed.scheme == "http" and loopback:
        # The same check, run against a build served on this machine. Plain HTTP is accepted only
        # for a loopback host, so nothing over a network is ever requested without TLS.
        plain = True
    else:
        raise SystemExit("the live check speaks https, or http to a loopback host")
    lock = threading.Lock()
    handle = REQUEST_LOG.open("a")
    results: dict[str, int | str] = {}
    local = threading.local()

    def connection() -> http.client.HTTPConnection:
        existing = getattr(local, "connection", None)
        if existing is None:
            existing = (
                http.client.HTTPConnection(host, timeout=timeout)
                if plain
                else http.client.HTTPSConnection(host, timeout=timeout)
            )
            local.connection = existing
        return existing

    def head(path: str) -> int:
        for attempt in (1, 2):
            conn = connection()
            try:
                conn.request("HEAD", path, headers={"User-Agent": USER_AGENT, "Host": host,
                                                    "Accept": "*/*"})
                response = conn.getresponse()
                response.read()
                return response.status
            except Exception:
                try:
                    conn.close()
                except Exception:
                    pass
                local.connection = None
                if attempt == 2:
                    raise
        raise RuntimeError("unreachable")

    def fetch(slug: str) -> None:
        path = f"{PAGE_PREFIX}{urllib.parse.quote(slug)}"
        url = f"{base_url.rstrip('/')}{PAGE_PREFIX}{slug}"
        status: int | str
        try:
            status = head(path)
        except Exception as error:                                  # network or DNS failure
            status = f"{type(error).__name__}: {error}"
        with lock:
            results[slug] = status
            handle.write(json.dumps({
                "at": now(), "url": url, "status": status, "bytes": None, "viewport": None,
                "agent": f"{USER_AGENT} via scripts/revamp/redirect_check.py",
                "note": "HEAD, redirect not followed; legacy slug reachability check (step 3.5)",
            }) + "\n")

    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        list(pool.map(fetch, slugs))
    handle.close()

    failures = {slug: status for slug, status in results.items() if status not in ACCEPTED}
    counts: dict[str, int] = {}
    for status in results.values():
        counts[str(status)] = counts.get(str(status), 0) + 1
    return {
        "baseUrl": base_url,
        "checked": len(results),
        "concurrency": concurrency,
        "accepted": list(ACCEPTED),
        "byStatus": dict(sorted(counts.items())),
        "failures": dict(sorted(failures.items())[:50]),
        "failureCount": len(failures),
        "pass": not failures,
        "requestLog": str(REQUEST_LOG.relative_to(ROOT)),
    }


# ---------------------------------------------------------------------------------------------
# (b) plan
# ---------------------------------------------------------------------------------------------

def check_plan(universe: set[str], production: list[tuple[str, str]],
               plan: list[tuple[str, str, str]], live: set[str]) -> dict:
    redirects: dict[str, str] = {}
    conflicts: list[dict] = []
    for old, target in production:
        redirects[old] = target
    for old, new, reason in plan:
        if old in redirects and redirects[old] != new:
            conflicts.append({"slug": old, "production_target": redirects[old],
                              "plan_target": new, "reason": reason})
        redirects[old] = new

    orphans: list[dict] = []
    chains: list[dict] = []
    resolved = 0
    direct = 0
    for slug in sorted(universe | set(redirects)):
        if slug in live:
            direct += 1
            continue
        target = redirects.get(slug)
        if target is None:
            orphans.append({"slug": slug, "why": "not a live page slug and no redirect covers it"})
            continue
        if target in live:
            resolved += 1
            continue
        if target in redirects:
            chains.append({"slug": slug, "hop1": target, "hop2": redirects[target]})
        else:
            orphans.append({"slug": slug, "target": target,
                            "why": "the redirect target is not a live page slug after the merges"})

    return {
        "universe": len(universe),
        "redirectRows": len(redirects),
        "productionRows": len(production),
        "planRows": len(plan),
        "liveSlugsAfterPlan": len(live),
        "servedDirectly": direct,
        "servedByOneHop": resolved,
        "orphans": orphans[:50],
        "orphanCount": len(orphans),
        "chains": chains[:50],
        "chainCount": len(chains),
        "conflicts": conflicts[:50],
        "conflictCount": len(conflicts),
        "pass": not orphans and not chains and not conflicts,
    }


# ---------------------------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default="https://rnawiki.com")
    parser.add_argument("--plan", type=Path,
                        default=ROOT / "data/revamp/identity/redirect-plan-v5.csv")
    parser.add_argument("--out", type=Path, default=ROOT / "data/revamp/redirect-check.json")
    parser.add_argument("--canonical", type=Path, default=CANONICAL_DEFAULT,
                        help="the canonical revision whose pages the plan must land on; the merges "
                             "a later revision applies change which slugs still serve a page")
    parser.add_argument("--service", default="Postgres")
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--skip-live", action="store_true",
                        help="run the plan simulation only (the live check needs the public site)")
    parser.add_argument("--live-from", type=Path,
                        help="reuse the live result recorded in an earlier run's JSON instead of "
                             "requesting the site again; the live universe does not depend on the "
                             "plan, so a plan change does not invalidate it")
    args = parser.parse_args()
    if args.concurrency > 4:
        raise SystemExit("the live check is capped at four concurrent requests")

    production = production_redirects(args.service)
    universe = {json.loads(line)["slug"] for line in DISPOSITIONS.open()}
    universe |= {old for old, _target in production}
    plan = read_plan(args.plan.resolve())
    canonical = args.canonical.resolve()
    live = surviving_slugs(plan, canonical)

    payload = {
        "generatedAt": now(),
        "step": "3.5",
        "inputs": {
            "dispositions": str(DISPOSITIONS.relative_to(ROOT)),
            "productionRedirectTable": "medicine_slug_redirects (CA-pinned read)",
            "plan": str(args.plan.resolve().relative_to(ROOT)),
            "canonical": str(canonical.relative_to(ROOT)),
        },
    }
    payload["plan"] = check_plan(universe, production, plan, live)
    if args.live_from:
        earlier = json.loads(args.live_from.resolve().read_text())
        payload["live"] = earlier["live"]
        payload["live"]["reusedFrom"] = str(args.live_from.resolve().relative_to(ROOT))
        payload["live"]["reusedAt"] = earlier.get("generatedAt")
    elif args.skip_live:
        payload["live"] = {"pass": None, "note": "skipped with --skip-live"}
    else:
        payload["live"] = check_live(args.base_url, sorted(universe), args.concurrency, args.timeout)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2) + "\n")

    plan_result, live_result = payload["plan"], payload["live"]
    print(f"plan: universe {plan_result['universe']} · served directly {plan_result['servedDirectly']} "
          f"· one hop {plan_result['servedByOneHop']} · orphans {plan_result['orphanCount']} "
          f"· chains {plan_result['chainCount']} · conflicts {plan_result['conflictCount']}")
    if live_result.get("pass") is not None:
        print(f"live: checked {live_result['checked']} · {live_result['byStatus']} "
              f"· failures {live_result['failureCount']}")
    print(f"written to {args.out.resolve().relative_to(ROOT)}")

    failed = False
    for row in plan_result["orphans"][:20]:
        print(f"ORPHAN {row['slug']}: {row['why']}", file=sys.stderr)
        failed = True
    for row in plan_result["chains"][:20]:
        print(f"CHAIN  {row['slug']} -> {row['hop1']} -> {row['hop2']}", file=sys.stderr)
        failed = True
    for row in plan_result["conflicts"][:20]:
        print(f"CONFLICT {row['slug']}: production sends it to {row['production_target']}, "
              f"the plan sends it to {row['plan_target']}", file=sys.stderr)
        failed = True
    for slug, status in list(live_result.get("failures", {}).items())[:20]:
        print(f"LIVE   /d/{slug} answered {status}", file=sys.stderr)
        failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
