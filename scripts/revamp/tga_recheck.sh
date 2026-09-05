#!/usr/bin/env bash
# Re-check reachability of www.tga.gov.au with a normal desktop browser user agent over HTTP/1.1.
# Phase 2 step 2.12. Writes verbatim curl output to the legal/ evidence file and appends to requests.log.
# Three attempts per URL with 0 s, 7 s and 22 s backoff, matching the first gate attempt.
set -u
ROOT="/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
D="$ROOT/data/sources/tga-artg/2026-09-06"
OUT="$D/legal/www-tga-gov-au-retries-2.txt"
LOG="$D/requests.log"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
for U in https://www.tga.gov.au/robots.txt https://www.tga.gov.au/about-us/using-our-website/copyright; do
  for i in 1 2 3; do
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "=== attempt $i $U at $TS ===" >> "$OUT"
    RES=$(curl -sS -4 --http1.1 --compressed -m 30 \
      -H "User-Agent: $UA" \
      -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
      -H 'Accept-Language: en-AU,en;q=0.9' \
      -o "$D/legal/.probe.tmp" -w 'http_code=%{http_code} size=%{size_download}' "$U" 2>&1; echo " exit=$?")
    echo "$RES" >> "$OUT"
    CODE=$(printf '%s' "$RES" | sed -n 's/.*http_code=\([0-9]*\).*/\1/p')
    printf '%s\t%s\t%s\t0\t%s (recheck attempt %s)\n' "$TS" "$U" "${CODE:-000}" "$OUT" "$i" >> "$LOG"
    case $i in 1) sleep 7;; 2) sleep 22;; esac
  done
done
rm -f "$D/legal/.probe.tmp"
