#!/usr/bin/env python
"""Step 0.3: read the production counts the corpus-20k final measurement read.

Read-only SQL over the CA-pinned Railway connection, the method recorded in
data/corpus-20k/final/summary.json ("read-only SQL over the Railway TCP proxy, sslmode=verify-ca,
PGSSLSERVERNAME=localhost"). The connection string is read from the Postgres service's
DATABASE_PUBLIC_URL through the Railway CLI and is never printed: it is passed to psql through the
environment, and only query results reach stdout.

Certificate verification is not relaxed. The pinned CA is the one read out of the database
container; PGSSLSERVERNAME=localhost is the only name that certificate asserts (docs/deployment.md,
"Trust anchor / Name checked" table), so the signature chain and the asserted identity are both
still checked.

    baseline_production.py --out data/revamp/baseline/production.json
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROOT_CERT = ROOT.parent / "rnawiki-backups" / "railway" / "postgres-root.crt"

QUERIES = {
    "pagesByTier": "select tier, count(*) from corpus_pages group by tier order by tier",
    "pagesByModel": "select model, count(*) from corpus_pages group by model order by model",
    "indexableByTier": "select tier, count(*) from corpus_pages where indexable group by tier order by tier",
    "suppressedByTier": "select tier, count(*) from corpus_pages where suppressed group by tier order by tier",
    "withdrawnByTier": "select tier, count(*) from corpus_pages where withdrawn group by tier order by tier",
    "corpusPages": "select count(*) from corpus_pages",
    "indexable": "select count(*) from corpus_pages where indexable",
    "redirects": "select count(*) from medicine_slug_redirects",
    "legacyDrugsRows": "select count(*) from drugs",
    "migrationsApplied": "select count(*) from drizzle.__drizzle_migrations",
    "seedFires": "select seed, count(*) from page_seeds group by seed order by seed",
    "seedFiresIndexable": (
        "select s.seed, count(*) from page_seeds s join corpus_pages p on p.key = s.key "
        "where p.indexable group by s.seed order by s.seed"
    ),
    "questionBlocksIndexable": (
        "select q.block, count(distinct q.key) from page_questions q join corpus_pages p on p.key = q.key "
        "where p.indexable group by q.block order by 2 desc, 1"
    ),
    "questionBlocksAll": "select block, count(distinct key) from page_questions group by block order by 2 desc, 1",
}


def connection_url(service: str) -> str:
    raw = subprocess.run(
        ["railway", "variables", "--service", service, "--json"],
        capture_output=True, text=True, check=True, cwd=str(ROOT),
    ).stdout
    url = json.loads(raw)["DATABASE_PUBLIC_URL"]
    joiner = "&" if "?" in url else "?"
    return f"{url}{joiner}sslmode=verify-ca&sslrootcert={ROOT_CERT}"


def run(url: str, sql: str) -> list[list[str]]:
    env = dict(os.environ)
    env["PGSSLSERVERNAME"] = "localhost"
    env["PGSSLROOTCERT"] = str(ROOT_CERT)
    result = subprocess.run(
        ["psql", url, "-X", "-q", "-A", "-t", "-F", "\t", "-v", "ON_ERROR_STOP=1", "-c", sql],
        capture_output=True, text=True, env=env, cwd=str(ROOT),
    )
    if result.returncode != 0:
        message = result.stderr.replace(url, "<connection string withheld>")
        raise SystemExit(f"psql failed for: {sql}\n{message}")
    return [line.split("\t") for line in result.stdout.strip().splitlines() if line.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--service", default="Postgres")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    if not ROOT_CERT.exists():
        raise SystemExit(f"pinned CA not found at {ROOT_CERT}")
    url = connection_url(args.service)

    out: dict[str, object] = {
        "readAt": run(url, "select now()::date")[0][0],
        "method": (
            "read-only SQL over the Railway TCP proxy, DATABASE_PUBLIC_URL of the Postgres service, "
            "sslmode=verify-ca with the CA pinned at rnawiki-backups/railway/postgres-root.crt and "
            "PGSSLSERVERNAME=localhost"
        ),
    }
    for name, sql in QUERIES.items():
        rows = run(url, sql)
        if len(rows) == 1 and len(rows[0]) == 1:
            out[name] = int(rows[0][0])
        else:
            out[name] = {row[0]: int(row[1]) for row in rows}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(out, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
