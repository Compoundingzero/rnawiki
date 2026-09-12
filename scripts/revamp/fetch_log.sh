#!/bin/bash
# Fetch one URL, append (iso_timestamp, url, http_status, bytes, outfile) to a requests log.
# Usage: fetch_log.sh <url> <outfile> <logfile> [extra curl args...]
set -u
URL="$1"; OUT="$2"; LOG="$3"; shift 3
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CODE=$(curl -sS -L --compressed -A "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)" \
  --max-time 1800 -w '%{http_code}' -o "$OUT" "$@" "$URL" 2>>"${LOG}.curlerr") || CODE="curl-error"
BYTES=$(wc -c < "$OUT" 2>/dev/null | tr -d ' ')
printf '%s\t%s\t%s\t%s\t%s\n' "$TS" "$URL" "$CODE" "${BYTES:-0}" "$OUT" >> "$LOG"
echo "$CODE $BYTES $OUT"
