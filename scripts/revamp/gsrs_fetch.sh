#!/bin/bash
# Resumable download of the GSRS public bulk dump.
# Retries three times with exponential backoff, then falls back to the mirror host.
set -u
ROOT="/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
D="$ROOT/data/sources/gsrs/2026-09-05"
LOG="$D/requests.log"
OUT="$D/raw/dump-public-2026-08-06.gsrs"
EXPECT=329396273
UA="rnawiki-revamp-ingest/1.0 (felix360506@gmail.com)"
PRIMARY="https://gsrs.ncats.nih.gov/assets/downloads/dump-public-2026-08-06.gsrs"
MIRROR="https://gsrs-dev-public.ncats.io/assets/downloads/dump-public-2026-08-06.gsrs"

try_url () {
  local url="$1" attempt="$2"
  local code
  code=$(curl -sS -A "$UA" -L -C - --max-time 7200 --speed-time 120 --speed-limit 1024 \
         -w "%{http_code} %{size_download}" -o "$OUT" "$url")
  printf '%s\t%s\t%s\tattempt=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$url" "$code" "$attempt" >> "$LOG"
  local sz
  sz=$(stat -f%z "$OUT" 2>/dev/null || echo 0)
  [ "$sz" = "$EXPECT" ]
}

for i in 1 2 3; do
  if try_url "$PRIMARY" "$i"; then echo "COMPLETE primary attempt $i"; exit 0; fi
  sleep $((5 * 2 ** i))
done
for i in 1 2 3; do
  if try_url "$MIRROR" "mirror-$i"; then echo "COMPLETE mirror attempt $i"; exit 0; fi
  sleep $((5 * 2 ** i))
done
echo "INCOMPLETE size=$(stat -f%z "$OUT" 2>/dev/null || echo 0) expected=$EXPECT"
exit 1
