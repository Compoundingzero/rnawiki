#!/usr/bin/env python
"""Phase 6.1 — what a dossier page ships (docs/specs/revamp-2026-09.md, step 6.1).

    .venv-corpus/bin/python scripts/revamp/payload_audit.py \
        --base-url http://127.0.0.1:3197 --out data/revamp/payload-audit-before.json

The question 6.1 asks is whether the dossier is sent to the reader twice: once as the HTML the
server rendered and again as JSON inside the React Server Components stream that Next.js inlines
into the same document. This script measures that on one page set and records the four numbers the
step names, per page and as medians.

Per page:

  htmlBytes          the served document, as bytes on the wire before compression
  rscBytes           the flight stream, decoded. Next.js inlines it as a run of
                     `self.__next_f.push([1,"<chunk>"])` calls whose argument is a JavaScript string
                     literal; the stream is those literals decoded and concatenated.
  rscModuleBytes     the stream's module and hint rows (`<id>:I[...]`, `<id>:H...`). These name
                     client chunks to load. They are the framework's own overhead and carry no
                     dossier content, so they are counted and then set aside.
  rscDossierBytes    rscBytes - rscModuleBytes: the rows carrying the page's own tree and text.
  dossierTextBytes   the rendered dossier text in the HTML: the text nodes inside <main>, outside
                     <script> and <style>, of at least MIN_NODE_CHARS characters. A text node is the
                     unit React also emits as a string in the flight stream, so it is the unit on
                     which the two can be compared without inventing a boundary.
  overlapBytes       of those bytes, the ones whose whole text node also appears verbatim in the
                     flight stream. This is the double-shipped dossier.
  liveTextToHtml     document.body.innerText / document.documentElement.outerHTML, measured in a
                     browser after hydration — the corpus-20k live measure
                     (scripts/corpus-20k/gate2/browser-checks.ts), unchanged.

The page set is the eight live samples named in the spec's step 0.3 plus a seeded draw of 100 pages
from the build's own indexable set, which is what its tier-1 and tier-2 sitemaps publish. A sample
the build does not serve is recorded as absent rather than replaced.

Nothing here judges the page. It reports bytes.
"""

from __future__ import annotations

import argparse
import html as html_module
import json
import random
import re
import statistics
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[2]

# The eight samples of docs/specs/revamp-2026-09.md step 0.3, in the order it names them.
SAMPLES = (
    "metformin",
    "cysteamine",
    "rofecoxib",
    "sirolimus",
    "carbidopa-levodopa",
    "cdx-3379",
    "1-2-distearoyl-sn-glycero-3-phosphocholine",
    "amlodipine",
)

SITEMAP_INDEX = "/sitemap.xml"
INDEXABLE_SITEMAPS = ("tier-1", "tier-2")
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"

# A text node shorter than this is a separator, a unit or a single word: matching it against a
# 200 KB stream would report a coincidence, not a shipped dossier.
MIN_NODE_CHARS = 20

DEFAULT_RANDOM_PAGES = 100
DEFAULT_SEED = 20260908

FLIGHT_PUSH = re.compile(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)')
MODULE_ROW = re.compile(r"^\d+:[IH]")
SCRIPT_OR_STYLE = re.compile(r"<(script|style)\b.*?</\1>", re.S)
MAIN_REGION = re.compile(r"<main[^>]*>(.*?)</main>", re.S)
TAG = re.compile(r"<[^>]+>")
WHITESPACE = re.compile(r"\s+")


# ---------------------------------------------------------------------------------------------
# fetching


def fetch(url: str, timeout: int = 60, attempts: int = 3) -> tuple[int, bytes]:
    """GET a URL, retrying a transport failure with backoff. Returns (status, body bytes)."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return int(response.status), response.read()
        except urllib.error.HTTPError as error:
            return int(error.code), b""
        except Exception:
            if attempt == attempts - 1:
                return 0, b""
            time.sleep(2 * (attempt + 1))
    return 0, b""


def sitemap_indexable_slugs(base_url: str, issues: list[str]) -> list[str]:
    """The slugs the build itself calls indexable: its tier-1 and tier-2 sitemap children."""
    status, body = fetch(f"{base_url}{SITEMAP_INDEX}")
    if status != 200 or not body:
        issues.append(f"sitemap index answered {status}; the indexable set could not be enumerated")
        return []
    children = set()
    for loc in ElementTree.fromstring(body).iter(f"{SITEMAP_NS}loc"):
        location = (loc.text or "").strip()
        if location.endswith(".xml"):
            children.add(location.rsplit("/", 1)[1][: -len(".xml")])
    slugs: list[str] = []
    seen: set[str] = set()
    for child in INDEXABLE_SITEMAPS:
        if child not in children:
            issues.append(f"sitemap index does not list {child}.xml")
            continue
        status, body = fetch(f"{base_url}/sitemaps/{child}.xml")
        if status != 200 or not body:
            issues.append(f"sitemap child {child}.xml answered {status}")
            continue
        for loc in ElementTree.fromstring(body).iter(f"{SITEMAP_NS}loc"):
            location = (loc.text or "").strip()
            if "/d/" not in location:
                continue
            slug = location.rsplit("/d/", 1)[1].split("?", 1)[0].split("#", 1)[0]
            if slug not in seen:
                seen.add(slug)
                slugs.append(slug)
    return slugs


# ---------------------------------------------------------------------------------------------
# the two payloads


def flight_stream(html: str) -> str:
    """The RSC payload Next.js inlines, decoded from the JavaScript string literals carrying it."""
    return "".join(json.loads(match.group(1)) for match in FLIGHT_PUSH.finditer(html))


def module_row_bytes(stream: str) -> int:
    """The stream's module and hint rows: the chunk manifest, not the page's content."""
    return sum(
        len(line.encode("utf-8")) for line in stream.splitlines() if MODULE_ROW.match(line)
    )


def matchable(stream: str) -> str:
    """The stream as text to search.

    Rendered text sits inside the flight stream's own JSON strings, so a quotation mark in the page
    is a `\\"` there and a backslash is a `\\\\`. Undoing those two escapes compares the characters
    the reader sees with the characters the stream carries, and collapsing whitespace removes the
    only other difference between a text node and its serialised form.
    """
    return WHITESPACE.sub(" ", stream).replace('\\"', '"').replace("\\\\", "\\")


def dossier_text_nodes(html: str) -> list[str]:
    """The rendered dossier's text nodes: inside <main>, outside script and style."""
    region = MAIN_REGION.search(html)
    if region is None:
        return []
    body = SCRIPT_OR_STYLE.sub("", region.group(1))
    nodes = []
    for raw in TAG.split(body):
        node = WHITESPACE.sub(" ", html_module.unescape(raw)).strip()
        if len(node) >= MIN_NODE_CHARS:
            nodes.append(node)
    return nodes


def measure_document(html_bytes: bytes) -> dict[str, Any]:
    html = html_bytes.decode("utf-8", errors="replace")
    stream = flight_stream(html)
    stream_bytes = len(stream.encode("utf-8"))
    modules = module_row_bytes(stream)
    dossier_stream_bytes = max(stream_bytes - modules, 0)

    haystack = matchable(stream)
    nodes = dossier_text_nodes(html)
    text_bytes = sum(len(node.encode("utf-8")) for node in nodes)
    overlap_nodes = [node for node in nodes if node in haystack]
    overlap_bytes = sum(len(node.encode("utf-8")) for node in overlap_nodes)

    total = len(html_bytes)
    return {
        "htmlBytes": total,
        "rscBytes": stream_bytes,
        "rscModuleBytes": modules,
        "rscDossierBytes": dossier_stream_bytes,
        "rscShare": round(dossier_stream_bytes / total, 6) if total else None,
        "dossierTextNodes": len(nodes),
        "dossierTextBytes": text_bytes,
        "overlapNodes": len(overlap_nodes),
        "overlapBytes": overlap_bytes,
        "overlapShare": round(overlap_bytes / text_bytes, 6) if text_bytes else None,
    }


# ---------------------------------------------------------------------------------------------
# the live measure


def live_text_to_html(base_url: str, paths: list[str], issues: list[str]) -> dict[str, Any]:
    """innerText over outerHTML after hydration, the corpus-20k live measure, per path."""
    from playwright.sync_api import sync_playwright

    measured: dict[str, Any] = {}
    with sync_playwright() as engine:
        browser = engine.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        for path in paths:
            try:
                response = page.goto(f"{base_url}{path}", wait_until="networkidle", timeout=60000)
                status = response.status if response else 0
                if status != 200:
                    issues.append(f"{path} answered {status} in the browser; no live figure for it")
                    measured[path] = None
                    continue
                inner, outer = page.evaluate(
                    "() => [ (document.body.innerText || '').replace(/\\s+/g, ' ').trim().length,"
                    " document.documentElement.outerHTML.length ]"
                )
                measured[path] = {
                    "innerTextLength": inner,
                    "outerHtmlLength": outer,
                    "liveTextToHtml": round(inner / outer, 6) if outer else None,
                }
            except Exception as error:  # a navigation that never completed
                issues.append(f"{path} did not render in the browser: {type(error).__name__}")
                measured[path] = None
        context.close()
        browser.close()
    return measured


# ---------------------------------------------------------------------------------------------
# main


def median_of(values: list[float]) -> float | None:
    return round(statistics.median(values), 6) if values else None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:3197", help="a running build")
    parser.add_argument("--random-pages", type=int, default=DEFAULT_RANDOM_PAGES)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument(
        "--out", type=Path, default=ROOT / "data/revamp/payload-audit-before.json"
    )
    parser.add_argument(
        "--skip-live",
        action="store_true",
        help="measure the document only; the live figure needs a browser",
    )
    args = parser.parse_args(argv)
    base_url = args.base_url.rstrip("/")
    started = time.time()
    issues: list[str] = []

    indexable = sitemap_indexable_slugs(base_url, issues)
    sample_slugs = list(SAMPLES)
    pool = [slug for slug in indexable if slug not in set(sample_slugs)]
    if args.random_pages > len(pool):
        issues.append(
            f"--random-pages {args.random_pages} exceeds the {len(pool)}-page indexable pool; "
            "every page was drawn"
        )
        drawn = sorted(pool)
    else:
        drawn = sorted(random.Random(args.seed).sample(pool, args.random_pages))

    targets = [("sample", slug) for slug in sample_slugs] + [("indexable", slug) for slug in drawn]

    pages: dict[str, Any] = {}
    for set_name, slug in targets:
        path = f"/d/{slug}"
        status, body = fetch(f"{base_url}{path}")
        if status != 200 or not body:
            issues.append(f"{path} answered {status}; it is not in this measurement")
            pages[path] = {"set": set_name, "status": status, "measured": False}
            continue
        record = measure_document(body)
        record["set"] = set_name
        record["status"] = status
        record["measured"] = True
        pages[path] = record

    if not args.skip_live:
        served = [path for path, record in pages.items() if record.get("measured")]
        for path, live in live_text_to_html(base_url, served, issues).items():
            pages[path]["live"] = live

    def values(field: str, subset: str | None = None, live: bool = False) -> list[float]:
        out = []
        for record in pages.values():
            if not record.get("measured"):
                continue
            if subset is not None and record["set"] != subset:
                continue
            holder = record.get("live") if live else record
            if not holder:
                continue
            value = holder.get(field)
            if value is not None:
                out.append(float(value))
        return out

    summary = {
        "schema": "rnawiki-revamp-payload-audit/v1",
        "spec": "docs/specs/revamp-2026-09.md step 6.1",
        "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "baseUrl": base_url,
        "seed": args.seed,
        "minNodeChars": MIN_NODE_CHARS,
        "pageSet": {
            "samplesRequested": len(sample_slugs),
            "samplesMeasured": sum(
                1 for r in pages.values() if r.get("measured") and r["set"] == "sample"
            ),
            "indexablePoolSize": len(pool),
            "randomPagesRequested": args.random_pages,
            "randomPagesMeasured": sum(
                1 for r in pages.values() if r.get("measured") and r["set"] == "indexable"
            ),
        },
        "medians": {
            "all": {
                "rscShare": median_of(values("rscShare")),
                "overlapShare": median_of(values("overlapShare")),
                "htmlBytes": median_of(values("htmlBytes")),
                "rscDossierBytes": median_of(values("rscDossierBytes")),
                "dossierTextBytes": median_of(values("dossierTextBytes")),
                "overlapBytes": median_of(values("overlapBytes")),
                "liveTextToHtml": median_of(values("liveTextToHtml", live=True)),
            },
            "samples": {
                "rscShare": median_of(values("rscShare", "sample")),
                "overlapShare": median_of(values("overlapShare", "sample")),
                "liveTextToHtml": median_of(values("liveTextToHtml", "sample", live=True)),
            },
            "indexableDraw": {
                "rscShare": median_of(values("rscShare", "indexable")),
                "overlapShare": median_of(values("overlapShare", "indexable")),
                "liveTextToHtml": median_of(values("liveTextToHtml", "indexable", live=True)),
            },
        },
        "floors": {
            "liveTextToHtmlFloor": 0.15,
            "liveTextToHtmlTarget": 0.25,
            "note": "step 6.1's floor and target for the live median on the indexable set",
        },
        "runtimeMinutes": round((time.time() - started) / 60.0, 2),
        "issues": issues,
        "pages": pages,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(summary, indent=1) + "\n", encoding="utf-8")

    medians = summary["medians"]["all"]
    print(f"pages measured: {sum(1 for r in pages.values() if r.get('measured'))} of {len(targets)}")
    print(f"median RSC dossier share of the document: {medians['rscShare']}")
    print(f"median dossier text also in the RSC stream: {medians['overlapShare']}")
    print(f"median live text-to-HTML: {medians['liveTextToHtml']}")
    print(f"  on the indexable draw: {summary['medians']['indexableDraw']['liveTextToHtml']}")
    print(f"out: {args.out}")
    for issue in issues[:20]:
        print(f"issue: {issue}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
