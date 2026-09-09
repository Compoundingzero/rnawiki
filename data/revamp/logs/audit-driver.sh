set -euo pipefail
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
PGBIN=/opt/homebrew/opt/postgresql@18/bin
BACKUP="/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom"
PORT=3199
echo "=== restoring the legacy tables"
"$PGBIN/pg_restore" -l "$BACKUP" | grep -E "TABLE DATA public (drugs|inventory_resolutions) " > /tmp/restore-list.txt
wc -l /tmp/restore-list.txt
"$PGBIN/pg_restore" --data-only --no-owner --no-privileges -L /tmp/restore-list.txt -d "$DATABASE_URL" "$BACKUP"
echo "=== loading tiers"
npx tsx scripts/corpus-20k/load/materialise.ts --tier 1 --revamp \
  --thresholds data/revamp/thresholds-v9.json --presence data/revamp/presence-applicable-v10.ndjson \
  --allow-working-database --no-checkpoint
npx tsx scripts/corpus-20k/load/materialise.ts --tier 3 --revamp \
  --thresholds data/revamp/thresholds-v9.json --presence data/revamp/presence-applicable-v10.ndjson \
  --allow-working-database --no-checkpoint
npx tsx scripts/corpus-20k/load/materialise.ts --tier 2 --revamp \
  --thresholds data/revamp/thresholds-v9.json --presence data/revamp/presence-applicable-v10.ndjson \
  --allow-working-database --no-checkpoint
echo "=== hubs"
npx tsx scripts/revamp/hubs_load.ts --allow-working-database
echo "=== build"
rm -rf .next/cache
npm run build > data/revamp/logs/audit-build.log 2>&1
echo "=== server"
npx next start -p $PORT > data/revamp/logs/audit-server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:$PORT/" > /dev/null; then break; fi
  sleep 2
done
echo "=== self audit"
./.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:$PORT \
  --database-url "$DATABASE_URL" --out data/revamp/self-audit-round5.json
echo "=== dom parity"
./.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:$PORT \
  --database-url "$DATABASE_URL" --text-dir data/revamp/render-v10/text \
  --sample 200 --out data/revamp/render-v10/dom-parity.json
echo "=== DONE audit"
