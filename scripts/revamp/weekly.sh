#!/usr/bin/env bash
#
# The weekly Search Console loop — revamp Phase 8, implementing the rule in step 6.6.
#
# It exercises no judgment. It refreshes Search Console data, lets scripts/revamp/promote_band.py
# apply the promotion rule, and, when that rule promoted a slice, reloads the affected tiers so the
# sitemap and the pages' robots directives move together, submits the tier to IndexNow, and appends
# a dated entry to docs/worklogs/revamp-2026-09.md with indexed counts per tier, the
# "crawled, currently not indexed" counts and the impressions delta.
#
# Two ways to run it:
#
#   claude -p "run scripts/revamp/weekly.sh and append the result to the worklog"
#
#   # crontab -e — Mondays at 09:15 Singapore time, output kept for the next reader
#   15 9 * * 1 cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion" && \
#     ./scripts/revamp/weekly.sh --apply >> data/revamp/promotion/weekly.log 2>&1
#
# Without --apply nothing changes what the site advertises: the Search Console refresh runs, the
# promotion rule is evaluated, the run's own output is kept at
# data/revamp/promotion/weekly-<date>.out, and the worklog entry is printed rather than appended.
# With --apply the ledger, the load, the IndexNow submission and the worklog entry all happen, and
# the promotion ledger grows by one slice at most. The write steps are
# behind a flag because a promotion changes what the public site advertises, and because
# materialise.ts refuses to write to a remote database without --production-confirmed anyway.
#
# Environment it reads:
#   GSC_SERVICE_ACCOUNT_JSON  when set, the loop pulls from the Search Console API
#   GSC_EXPORT_DIR            when set, the directory of manual CSV exports to ingest instead
#   DATABASE_URL              read by materialise.ts for the reload; unchanged by this script
#
# Exit codes: 0 the loop ran, 2 it could not run (wrong directory, missing interpreter), 3 a step
# it depends on failed and the reason is printed.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON="$REPO_ROOT/.venv-corpus/bin/python"
PROMOTION_DIR="$REPO_ROOT/data/revamp/promotion"
LEDGER="$PROMOTION_DIR/promoted.ndjson"
WORKLOG="$REPO_ROOT/docs/worklogs/revamp-2026-09.md"
TODAY="$(date -u +%Y-%m-%d)"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

APPLY=0
for argument in "$@"; do
  case "$argument" in
    --apply) APPLY=1 ;;
    *) echo "unknown argument: $argument" >&2; exit 2 ;;
  esac
done

if [ ! -x "$PYTHON" ]; then
  echo "no interpreter at $PYTHON" >&2
  exit 2
fi
cd "$REPO_ROOT"
mkdir -p "$PROMOTION_DIR"

echo "=== $STAMP weekly loop, apply=$APPLY ==="

# ---------------------------------------------------------------- 1. Search Console

GSC_STEP="skipped"
if [ -n "${GSC_SERVICE_ACCOUNT_JSON:-}" ]; then
  echo "--- pulling Search Console (gsc_pull.py) ---"
  if "$PYTHON" scripts/revamp/gsc_pull.py; then
    GSC_STEP="pulled from the API into data/revamp/gsc/$TODAY/"
  else
    GSC_STEP="gsc_pull.py failed; the promotion rule decides on the data already on disk"
    echo "$GSC_STEP" >&2
  fi
elif [ -n "${GSC_EXPORT_DIR:-}" ]; then
  echo "--- ingesting Search Console exports from $GSC_EXPORT_DIR ---"
  if "$PYTHON" scripts/revamp/gsc_ingest.py "$GSC_EXPORT_DIR"; then
    GSC_STEP="ingested $GSC_EXPORT_DIR into data/revamp/gsc/ingested.parquet"
  else
    GSC_STEP="gsc_ingest.py failed on $GSC_EXPORT_DIR; the promotion rule decides on the data already on disk"
    echo "$GSC_STEP" >&2
  fi
else
  GSC_STEP="no GSC_SERVICE_ACCOUNT_JSON and no GSC_EXPORT_DIR, so no new Search Console data this week"
  echo "$GSC_STEP"
fi

# ---------------------------------------------------------------- 2. the promotion rule

echo "--- promotion rule (promote_band.py) ---"
BEFORE=0
if [ -f "$LEDGER" ]; then BEFORE="$(wc -l < "$LEDGER" | tr -d ' ')"; fi

if [ "$APPLY" -eq 1 ]; then
  "$PYTHON" scripts/revamp/promote_band.py --apply --today "$TODAY" | tee "$PROMOTION_DIR/weekly-$TODAY.out"
else
  "$PYTHON" scripts/revamp/promote_band.py --today "$TODAY" | tee "$PROMOTION_DIR/weekly-$TODAY.out"
fi

AFTER=0
if [ -f "$LEDGER" ]; then AFTER="$(wc -l < "$LEDGER" | tr -d ' ')"; fi
PROMOTED=$((AFTER - BEFORE))
echo "pages promoted this run: $PROMOTED"

# ---------------------------------------------------------------- 3. sitemap and IndexNow

# The sitemap is not a file: /sitemaps/tier-n.xml is rendered from corpus_pages.indexable
# (lib/corpus/sitemap.ts tierSitemapEntries), and the same column decides each page's robots
# directive (app/d/[slug]/page.tsx). Regenerating the sitemap therefore means reloading the tier
# with the promotion ledger applied, which is the hook described in
# data/revamp/promotion/integration-plan.md. One flag moves the sitemap entry and the robots tag
# together, so a promoted page can never be advertised while it still says noindex.
TIERS_TOUCHED=""
if [ "$PROMOTED" -gt 0 ]; then
  TIERS_TOUCHED="$("$PYTHON" - "$LEDGER" "$TODAY" <<'PY'
import json, sys
ledger, today = sys.argv[1], sys.argv[2]
tiers = sorted({
    str(json.loads(line)["tier"])
    for line in open(ledger, encoding="utf-8")
    if line.strip() and json.loads(line).get("promotedOn") == today
})
print(" ".join(tiers))
PY
)"
  echo "--- tiers with promotions today: ${TIERS_TOUCHED:-none} ---"
  for tier in $TIERS_TOUCHED; do
    if [ "$APPLY" -eq 1 ]; then
      npx tsx scripts/corpus-20k/load/materialise.ts --tier "$tier" --revamp --production-confirmed
      npm run discovery:indexnow -- --tier "$tier" --submit
    else
      echo "would run: npx tsx scripts/corpus-20k/load/materialise.ts --tier $tier --revamp --production-confirmed"
      echo "would run: npm run discovery:indexnow -- --tier $tier --submit"
    fi
  done
else
  echo "--- nothing promoted, so no reload and no IndexNow submission ---"
fi

# ---------------------------------------------------------------- 4. the worklog entry

ENTRY="$("$PYTHON" - "$TODAY" "$STAMP" "$PROMOTED" "${TIERS_TOUCHED:-}" "$GSC_STEP" <<'PY'
"""Compose the worklog entry: indexed and crawled-not-indexed counts per tier, impressions delta."""
import csv, glob, json, os, sys
from collections import defaultdict

today, stamp, promoted, tiers_touched, gsc_step = sys.argv[1:6]
gsc_dir = "data/revamp/gsc"
parquet = os.path.join(gsc_dir, "ingested.parquet")


def normalise(value):
    return " ".join(str(value or "").replace("–", "-").replace("—", "-").lower().split())


indexed = defaultdict(int)
crawled = defaultdict(int)
other = defaultdict(int)
tier_of = {}

if os.path.exists(parquet):
    import pandas

    frame = pandas.read_parquet(parquet)
    for row in frame.itertuples(index=False):
        state = normalise(getattr(row, "index_state", None))
        if not state:
            continue
        tier = str(getattr(row, "tier", None) or "unmatched")
        url = str(getattr(row, "url", "") or "").rstrip("/")
        if url:
            tier_of[url] = tier
        if "indexed" in state and "not indexed" not in state:
            indexed[tier] += 1
        elif "crawled" in state and "not indexed" in state:
            crawled[tier] += 1
        else:
            other[tier] += 1

for path in sorted(glob.glob(os.path.join(gsc_dir, "*", "index-coverage.csv"))):
    with open(path, encoding="utf-8", newline="") as handle:
        for record in csv.DictReader(handle):
            state = normalise(record.get("coverage_state") or record.get("indexing_state"))
            if not state:
                continue
            tier = tier_of.get((record.get("url") or "").strip().rstrip("/"), "unmatched")
            if "indexed" in state and "not indexed" not in state:
                indexed[tier] += 1
            elif "crawled" in state and "not indexed" in state:
                crawled[tier] += 1
            else:
                other[tier] += 1

impressions_line = "impressions: no daily series in data/revamp/gsc/ingested-summary.json"
summary_path = os.path.join(gsc_dir, "ingested-summary.json")
if os.path.exists(summary_path):
    summary = json.load(open(summary_path, encoding="utf-8"))
    series = [row for row in summary.get("daily_series", []) if row.get("impressions") is not None]
    series.sort(key=lambda row: row.get("date") or "")
    if len(series) >= 14:
        recent = sum(row["impressions"] for row in series[-7:])
        prior = sum(row["impressions"] for row in series[-14:-7])
        delta = recent - prior
        impressions_line = (
            f"impressions: {recent:.0f} in the last 7 days of the series against {prior:.0f} in the "
            f"7 before, delta {delta:+.0f}"
        )
    elif series:
        recent = sum(row["impressions"] for row in series)
        impressions_line = (
            f"impressions: {recent:.0f} over the {len(series)} days the series carries; fewer than "
            "14 days, so no week-on-week delta is stated"
        )

tiers = sorted(set(indexed) | set(crawled) | set(other))
lines = [f"### [{stamp}] Phase 8 weekly loop"]
lines.append("")
lines.append("Command: `scripts/revamp/weekly.sh --apply`")
lines.append(f"Output: `data/revamp/promotion/weekly-{today}.out`, `data/revamp/promotion/promoted.ndjson`")
lines.append("")
lines.append(f"- Search Console: {gsc_step}")
lines.append(f"- Promoted: {promoted} pages" + (f" in tier(s) {tiers_touched}" if tiers_touched.strip() else ""))
if tiers:
    lines.append("- Index state by tier:")
    for tier in tiers:
        lines.append(
            f"  - tier {tier}: indexed {indexed[tier]}, crawled but not indexed {crawled[tier]}, "
            f"other state {other[tier]}"
        )
else:
    lines.append("- Index state by tier: no Search Console row carries an index state yet")
lines.append(f"- {impressions_line}")
print("\n".join(lines))
PY
)"

echo "--- worklog entry ---"
echo "$ENTRY"
if [ "$APPLY" -eq 1 ]; then
  printf '\n%s\n' "$ENTRY" >> "$WORKLOG"
  echo "appended to $WORKLOG"
else
  echo "(dry run: not appended; pass --apply)"
fi
