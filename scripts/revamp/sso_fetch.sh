#!/bin/bash
# Fetch one Singapore Statutes Online URL, honouring the sso.agc.gov.sg
# robots.txt crawl-delay of 6 seconds, and append the request to a log.
# Usage: sso_fetch.sh <url> <outfile> <logfile>
set -u
URL="$1"; OUT="$2"; LOG="$3"
UA="Mozilla/5.0 (compatible; rnawiki-revamp/1.0; +https://rnawiki.com; felix360506@gmail.com)"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CODE=$(curl -sS -L --compressed -A "$UA" -H 'Accept: text/html,application/xhtml+xml,*/*' \
  --max-time 300 -w '%{http_code}' -o "$OUT" "$URL" 2>>"${LOG}.curlerr") || CODE="curl-error"
BYTES=$(wc -c < "$OUT" 2>/dev/null | tr -d ' ')
printf '%s\t%s\t%s\t%s\t%s\n' "$TS" "$URL" "$CODE" "${BYTES:-0}" "$OUT" >> "$LOG"
echo "$CODE $BYTES $OUT"
sleep 6
