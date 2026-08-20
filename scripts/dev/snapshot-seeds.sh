#!/bin/sh
# Snapshots the seed-data directory every 90s while research agents are writing to it.
# Several agents can end up assigned to the same file after a transport failure, and each writes
# the WHOLE file — so a stale agent finishing late can overwrite a newer, fuller version. These
# snapshots make that recoverable instead of fatal.
REPO="/Users/admin/ClaudeRepo/Claude Projects/RNAwiki"
BASE="/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/77ab22c1-2080-4fbf-b136-403682dd6f2e/scratchpad/seed-snapshots"
while true; do
  DEST="$BASE/$(date +%H%M%S)"
  mkdir -p "$DEST"
  cp "$REPO"/scripts/seed-data/*.ts "$DEST"/ 2>/dev/null
  TOTAL=$(grep -h "^    slug:" "$REPO"/scripts/seed-data/*.ts 2>/dev/null | wc -l | tr -d ' ')
  echo "$(date +%H:%M:%S) $TOTAL dossiers -> $DEST"
  sleep 90
done
