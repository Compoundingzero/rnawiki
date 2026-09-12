#!/usr/bin/env python
"""Step 0.3: record the Playwright navigations in the legal request log.

scripts/corpus-20k/gate2/browser-checks.ts is run unchanged, so it does not write the request log
that gate2/fetch.py writes. The legal gate requires a recorded line for anything fetched over the
network, so the navigations that run recorded - eight dossier pages at two viewport widths and the
home page at three - are appended here from the run's own output file, one line per navigation.
Sub-resources the browser loaded for each navigation are not itemised; the note says so.

    baseline_log_browser_requests.py --checks data/revamp/baseline/browser-checks-live.json
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REQUEST_LOG = ROOT / "data" / "corpus-20k" / "legal" / "requests.log"
AGENT = "Playwright chromium via scripts/corpus-20k/gate2/browser-checks.ts (own-site baseline)"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checks", type=Path, required=True)
    args = parser.parse_args()
    checks = json.loads(args.checks.read_text(encoding="utf-8"))
    base = checks["base"]
    at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    lines = []
    for slug, per_width in checks["samples"].items():
        for width, audit in per_width.items():
            lines.append(
                {
                    "at": at,
                    "url": f"{base}/d/{slug}",
                    "status": 200,
                    "bytes": audit["outerHtmlLength"],
                    "viewport": width,
                    "agent": AGENT,
                    "note": "browser navigation; the page's sub-resource requests are not itemised",
                }
            )
    for width in checks["homeSearchBar"]["measured"]:
        lines.append(
            {
                "at": at,
                "url": f"{base}/",
                "status": 200,
                "bytes": None,
                "viewport": width,
                "agent": AGENT,
                "note": "browser navigation; the page's sub-resource requests are not itemised",
            }
        )
    with REQUEST_LOG.open("a", encoding="utf-8") as log:
        for line in lines:
            log.write(json.dumps(line) + "\n")
    print(json.dumps({"appended": len(lines), "log": str(REQUEST_LOG.relative_to(ROOT))}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
