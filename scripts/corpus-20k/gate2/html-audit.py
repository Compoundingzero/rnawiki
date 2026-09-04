#!/usr/bin/env python
"""Gate 2 server-HTML audit.

Fetches the server HTML for a slug list and reports, per page and in aggregate:

  * text-to-HTML, the crawl figure: visible characters of the whole document / HTML bytes
  * the reading column's own share, for reference
  * RSC payload bytes: the total length of the inline Next.js flight payload the document carries
    (``self.__next_f.push`` script chunks), which is the number the disclosure spec asks to reduce
  * empty elements: a heading, paragraph, list item, definition term/value, summary, link or
    button in ``<main>`` whose text is empty and which carries no image or control
  * placeholder phrases: lorem ipsum, TBD, TODO, coming soon, placeholder, undefined, null,
    [object Object], NaN
  * blocks: the ``data-block`` values in document order, so suppression can be checked

    html-audit.py --base http://localhost:3111 --slugs <tsv> --out <json> [--concurrency 20]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract import extract  # noqa: E402
from fetch import USER_AGENT, read_rows  # noqa: E402

PLACEHOLDER = re.compile(
    r"\b(lorem ipsum|tbd|todo|coming soon|placeholder|\[object object\]|undefined|null|nan)\b",
    re.I,
)
CHECKED_TAGS = {"h1", "h2", "h3", "h4", "p", "li", "dd", "dt", "td", "th", "summary", "a", "button"}
SELF_CLOSING = {"img", "svg", "input", "select", "textarea", "br", "hr"}
RSC_CHUNK = re.compile(r"self\.__next_f\.push\(", re.I)


class _Audit(HTMLParser):
    """Empty-element and block-order scan over ``<main>``."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[dict] = []
        self.main_depth: int | None = None
        self.skip = 0
        self.empty: list[str] = []
        self.blocks: list[str] = []

    def handle_starttag(self, tag, attrs):
        adict = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
            return
        if tag in SELF_CLOSING:
            for frame in self.stack:
                frame["control"] = True
            return
        self.stack.append({"tag": tag, "text": False, "control": False, "attrs": adict})
        if tag == "main" and self.main_depth is None:
            self.main_depth = len(self.stack)
        if "data-block" in adict:
            self.blocks.append(adict["data-block"])

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            return
        if tag in SELF_CLOSING:
            return
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                frame = self.stack[index]
                inside_main = self.main_depth is not None and index + 1 >= self.main_depth
                if (
                    inside_main
                    and tag in CHECKED_TAGS
                    and not frame["text"]
                    and not frame["control"]
                    and frame["attrs"].get("aria-hidden") != "true"
                ):
                    classes = frame["attrs"].get("class", "")
                    self.empty.append(f"{tag}.{classes}")
                if self.main_depth is not None and index + 1 == self.main_depth:
                    self.main_depth = None
                del self.stack[index:]
                break

    def handle_data(self, data):
        if self.skip or not data.strip():
            return
        for frame in self.stack:
            frame["text"] = True
            frame["control"] = frame["control"]


def audit_one(base: str, row: dict, timeout: float) -> dict:
    url = f"{base}/d/{row['slug']}"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        html = response.read().decode("utf-8", errors="replace")
        status = response.status
    parser = _Audit()
    parser.feed(html)
    parser.close()
    text = extract(html)
    rsc = 0
    for match in RSC_CHUNK.finditer(html):
        end = html.find("</script>", match.start())
        rsc += (end if end > 0 else len(html)) - match.start()
    html_bytes = len(html.encode("utf-8"))
    return {
        "key": row["key"],
        "slug": row["slug"],
        "status": status,
        "htmlBytes": html_bytes,
        "visibleChars": text["fullChars"],
        "columnChars": text["chars"],
        "crawlTextToHtml": round(text["fullChars"] / html_bytes, 5) if html_bytes else None,
        "columnTextToHtml": round(text["chars"] / html_bytes, 5) if html_bytes else None,
        "rscBytes": rsc,
        "rscShare": round(rsc / html_bytes, 4) if html_bytes else None,
        "emptyElements": parser.empty,
        "placeholder": sorted({m.group(0).lower() for m in PLACEHOLDER.finditer(text["fullText"])}),
        "blocks": parser.blocks,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", required=True)
    parser.add_argument("--slugs", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--concurrency", type=int, default=20)
    parser.add_argument("--timeout", type=float, default=60.0)
    args = parser.parse_args()

    rows = read_rows(args.slugs)
    started = time.time()
    results = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        for result in pool.map(lambda row: audit_one(args.base, row, args.timeout), rows):
            results.append(result)
            if len(results) % 100 == 0:
                print(f"  {len(results)}/{len(rows)}", flush=True)

    empty_total = sum(len(r["emptyElements"]) for r in results)
    empty_kinds = Counter(k for r in results for k in r["emptyElements"])
    placeholder_pages = [r["slug"] for r in results if r["placeholder"]]
    ratios = sorted(r["crawlTextToHtml"] for r in results if r["crawlTextToHtml"] is not None)
    summary = {
        "base": args.base,
        "pages": len(results),
        "seconds": round(time.time() - started, 2),
        "emptyElements": empty_total,
        "emptyElementKinds": empty_kinds.most_common(10),
        "pagesWithEmptyElement": sum(1 for r in results if r["emptyElements"]),
        "placeholderPages": placeholder_pages,
        "crawlTextToHtml": {
            "median": ratios[len(ratios) // 2] if ratios else None,
            "min": ratios[0] if ratios else None,
            "max": ratios[-1] if ratios else None,
        },
        "rscBytes": {
            "median": sorted(r["rscBytes"] for r in results)[len(results) // 2] if results else None,
        },
        "perPage": results,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(summary, indent=1), encoding="utf-8")
    print(
        json.dumps({k: v for k, v in summary.items() if k != "perPage"}, indent=1)[:2000]
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
