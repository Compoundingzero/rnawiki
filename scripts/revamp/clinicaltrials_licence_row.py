"""Append the ClinicalTrials.gov row to the shared `docs/data/LICENSES.md`.

The file is written by every Phase 2 ingester, so this makes exactly one append of
exactly one line, with O_APPEND, and does nothing if that line is already present.
It never rewrites a line another ingester wrote.

Usage: .venv-corpus/bin/python scripts/revamp/clinicaltrials_licence_row.py
"""

from __future__ import annotations

import os
from pathlib import Path

LICENSES = Path("docs/data/LICENSES.md")

ROW = (
    "| ClinicalTrials.gov API v2 (studies snapshot 2026-09-01T09:00:05, reused from disk; "
    "plus a StartDateType / PrimaryCompletionDateType / CompletionDateType / "
    "DesignInterventionModel top-up over the 155,645 matched studies) "
    "| https://clinicaltrials.gov/api/v2/studies "
    "| 2026-09-01 (snapshot); 2026-09-06 (top-up, robots and licence pages) "
    "| US Government work, public domain. NLM Web Policies, Copyright: \"Works produced by the "
    "U.S. government are not subject to copyright protection in the United States. Any such "
    "works found on National Library of Medicine (NLM) Web sites may be freely used or "
    "reproduced without permission in the U.S.\" Verbatim capture: "
    "data/sources/clinicaltrials/2026-09-06/legal/nlm-copyright-statement.txt; full page: "
    "legal/nlm-web-policies.html. The clinicaltrials.gov terms-and-conditions and about-api "
    "pages are an Angular shell with no server-rendered text (both 94,295 bytes, sha256 "
    "17c3746f…), so no statement here is attributed to them; scope reasoning for the "
    "sponsor-entered fields taken is in legal/TERMS-DETERMINATION.md. robots.txt carries "
    "Disallow: /api/ for the same API its operator documents and publishes; the conflict is "
    "recorded there and Crawl-delay: 1 was honoured "
    "| no — \"Source: National Library of Medicine\" requested, not required; used anyway "
    "| no "
    "| yes "
    "| yes |"
)


def main() -> int:
    text = LICENSES.read_text(encoding="utf-8") if LICENSES.exists() else ""
    if ROW in text:
        print("already present, no append made")
        return 0
    payload = ROW + "\n"
    if text and not text.endswith("\n"):
        payload = "\n" + payload
    fd = os.open(LICENSES, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
    try:
        os.write(fd, payload.encode("utf-8"))
    finally:
        os.close(fd)
    print(f"appended 1 row ({len(payload)} bytes) to {LICENSES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
