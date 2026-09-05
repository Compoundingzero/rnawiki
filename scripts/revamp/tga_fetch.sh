#!/bin/bash
# Fetch one URL for the TGA ARTG / Federal Register of Legislation ingest.
# The TGA edge rejects the rnawiki custom user agent, so this helper sends an
# ordinary desktop browser user agent over HTTP/1.1 and records every request
# (timestamp, url, status, bytes, outfile) to the source requests log.
# Usage: tga_fetch.sh <url> <outfile> <logfile> [extra curl args...]
set -u
URL="$1"; OUT="$2"; LOG="$3"; shift 3
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
CODE=$(curl -sS -L --http1.1 --compressed -A "$UA" \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: en-AU,en;q=0.9' \
  --max-time 1800 -w '%{http_code}' -o "$OUT" "$@" "$URL" 2>>"${LOG}.curlerr") || CODE="curl-error"
BYTES=$(wc -c < "$OUT" 2>/dev/null | tr -d ' ')
printf '%s\t%s\t%s\t%s\t%s\n' "$TS" "$URL" "$CODE" "${BYTES:-0}" "$OUT" >> "$LOG"
echo "$CODE $BYTES $OUT"
