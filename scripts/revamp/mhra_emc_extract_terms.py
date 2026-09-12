"""Extract the verbatim terms text from the saved MHRA and emc legal pages.

Block-level tags become line breaks so the saved .txt keeps the wording and the clause
boundaries of the published page. Nothing is paraphrased, reordered or omitted.
"""
from __future__ import annotations

import html
import pathlib
import re

DAY = "2026-09-06"
LEGAL = pathlib.Path("data/sources/mhra-emc") / DAY / "legal"

BLOCK = r"(?:p|div|li|ul|ol|h[1-6]|section|article|br|tr|dt|dd|table|main|header|footer|button)"

PAGES = [
    ("emc-privacy-notice-and-legal.html", "emc-legal-and-privacy-notice.verbatim.txt",
     "https://www.medicines.org.uk/emc/privacy-notice-and-legal"),
    ("emc-about-the-emc.html", "emc-about-the-emc.verbatim.txt",
     "https://www.medicines.org.uk/emc/about-the-emc"),
    ("mhra-products-about.html", "mhra-products-about-this-service.verbatim.txt",
     "https://products.mhra.gov.uk/about/"),
    ("govuk-terms-conditions.html", "govuk-terms-and-conditions.verbatim.txt",
     "https://www.gov.uk/help/terms-conditions"),
    ("ogl-v3.html", "open-government-licence-v3.verbatim.txt",
     "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"),
]


def to_text(raw: str) -> str:
    body = re.search(r"<main.*?</main>", raw, re.S) or re.search(r"<body.*?</body>", raw, re.S)
    seg = body.group(0) if body else raw
    seg = re.sub(r"<script.*?</script>", "", seg, flags=re.S)
    seg = re.sub(r"<style.*?</style>", "", seg, flags=re.S)
    seg = re.sub(rf"</?{BLOCK}\b[^>]*>", "\n", seg, flags=re.I)
    seg = re.sub(r"<[^>]+>", "", seg)
    seg = html.unescape(seg)
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in seg.split("\n")]
    out, blank = [], False
    for ln in lines:
        if ln:
            out.append(ln)
            blank = False
        elif not blank and out:
            out.append("")
            blank = True
    return "\n".join(out).strip() + "\n"


for src, dst, url in PAGES:
    raw = (LEGAL / src).read_text(encoding="utf-8", errors="replace")
    text = to_text(raw)
    header = (
        f"Verbatim text of {url}\n"
        f"Retrieved {DAY} (see requests.log for the exact timestamp, HTTP status and byte count).\n"
        f"Extracted from the saved HTML at legal/{src} by scripts/revamp/mhra_emc_extract_terms.py.\n"
        f"{'-' * 78}\n\n"
    )
    (LEGAL / dst).write_text(header + text, encoding="utf-8")
    print(f"{dst}: {len(text)} chars")
