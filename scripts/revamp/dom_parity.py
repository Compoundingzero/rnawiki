#!/usr/bin/env python3
"""Phase 4 §11 — the render and the DOM must agree.

`docs/specs/phase4-generators.md` §11 fixes it: "`page_text_v5` mirrors the painted order and
content of the page (jurisdiction order, every sentence); a sentence the page paints but the render
lacks, or the reverse, fails `tests/test_render_safety.py`."

This script is the measurement behind that assertion. It reads the pages a local build actually
holds, renders a seeded, tier-stratified sample in headless Chromium with every disclosure opened
and the shared chrome hidden, and compares what the browser painted with the line list
`scripts/revamp/page_text_v5.ts` wrote for the same page.

`docs/specs/phase4-generators.md` section 12 fixes the unit: **main-region text lines outside
furniture**. Furniture — the register absence table, the checked-sources statement on a page with
no interaction row, the patent no-record line, the S10-only classification line and the "No
regulator classification is recorded for X" answer — is hidden in the browser by
`[data-furniture]` and is absent from the render's furniture-free text, so both sides of the
comparison hold the same lines and one number describes parity. `scripts/revamp/slop_draw.py`
imports this module's extraction, fold and comparison rather than writing a second one.

Three things are checked, all of them over the same folded form:

  * every line the render wrote is somewhere in the painted text (nothing the render claims is
    missing from the page);
  * every line the browser painted is somewhere in the render text (nothing the page says is
    missing from the render);
  * the render's lines appear in the painted text in the render's own order (the jurisdiction
    order, and every block's order).

Folding removes the four differences that carry no meaning and nothing else: Unicode
compatibility form, straight quotes, the decorative diamond the source line paints, and the colon
the register rows put between a label element and its value. It is the fold
`scripts/revamp/slop_draw.py` already uses, for the same reason.

The comparison is by containment rather than by equality of line lists because the template paints
one render line as two DOM lines wherever a label element sits above its value, and paints a table
row's cells with tab separators. Containment in the folded whole is exact about content and about
order, and indifferent to where the template breaks a line.

    .venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3142 \
        --text-dir data/revamp/render-v7/text --sample 200

No network access beyond the local build named by `--base-url`.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import re
import subprocess
import sys
import time
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEGAL_LOG = ROOT / "data/corpus-20k/legal/requests.log"

# `page_text_v5.ts` writes here by default: the page without its furniture, which is what the
# browser side of this comparison also excludes (section 12).
DEFAULT_TEXT_DIR = ROOT / "data/revamp/render-v7/text"
DEFAULT_OUT = ROOT / "data/revamp/render-v7/dom-parity.json"
DEFAULT_SEED = 20260906
DEFAULT_SAMPLE = 200
DEFAULT_WIDTH = 1280
CONCURRENCY = 4
NAV_TIMEOUT_MS = 45_000
SELECTOR_TIMEOUT_MS = 20_000
NAV_ATTEMPTS = 3
PRINT_ROWS = 50

USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LEGAL_AGENT = "Playwright chromium via scripts/revamp/dom_parity.py (own-site Phase 4 §11 parity)"
LEGAL_NOTE = "browser navigation; the page's sub-resource requests are not itemised"

# The chrome the render excludes by rule: navigation, footer, the search control, the contents rail
# and the `<summary>` labels on the disclosures.
CHROME_SELECTOR = (
    "nav, footer, [role='search'], [role='combobox'], [role='listbox'], "
    "input, .cd-rail, .cd-contents, summary"
)

# What the dossier template itself declares markup, element by element. `renderPage` marks the same
# lines `markup` and keeps them out of `proseText`; this list is the DOM side of that one decision,
# so the two sides of the comparison hold the same definition of what the page *says*.
#
#   .cd-synonyms/.cd-more-names  the other recorded names, a definition list
#   .cd-source-line              the register and last-checked line under the title
#   .cd-badges                   the identity triplet
#   .cd-section-heading          every block heading
#   .cd-group-heading            every group heading inside a block or a disclosure
#   .cd-badge-cell               the question block's number
#   .cd-interpretation           the label on an interpretation paragraph
#   .cd-ladder                   the organism ladder diagram
#   .cd-visually-hidden          a heading a sighted reader is not shown
#   .cd-row-dates                the recorded/last-checked line under a disclosure's rows
#   .cd-record                   the identifiers panel
#   .cd-relations                the relation rows
#   .cd-relation-notes           §17(4): the identity stage's unconfirmed-relation notes, inside
#                                the relations block's closed control. The block is markup on both
#                                sides by the line above it; its notes are the same block's
#                                technical record and `renderPage` writes them as markup too.
#   .cd-source-rows/.cd-licence/.cd-definitions  the source list, its licences and its two links
#   .cd-glyph                    the one ornament between regions
#
# `[data-furniture]` joins them for the reason section 11 gives and section 12 makes one rule: a
# statement whose only content is an absence, in fixed words, on 25,000 pages. It is on the page and
# it is not one of the page's own lines, so neither side of the parity comparison carries it.
MARKUP_SELECTOR = (
    ".cd-synonyms, .cd-more-names, .cd-source-line, .cd-badges, .cd-section-heading, "
    ".cd-group-heading, .cd-badge-cell, .cd-interpretation, .cd-row-dates, .cd-ladder, "
    ".cd-visually-hidden, .cd-record, .cd-relations, .cd-relation-notes, .cd-source-rows, "
    ".cd-licence, "
    ".cd-definitions, .cd-glyph, [data-furniture]"
)

EXCLUDE_SELECTOR = f"{CHROME_SELECTOR}, {MARKUP_SELECTOR}"

EXTRACT_JS = """() => {
  const main = document.querySelector('main');
  if (!main) return null;
  for (const details of main.querySelectorAll('details')) details.open = true;
  for (const el of main.querySelectorAll(%s)) el.style.display = 'none';
  void main.offsetHeight;
  return { text: main.innerText || '' };
}""" % json.dumps(EXCLUDE_SELECTOR)

FOLD_QUOTES = str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"'})
# The two glyphs the template paints as separators and the render text writes as characters: the
# diamond before a source citation, and the middle dot between the parts of a register line.
FOLD_DECORATION = ("◇", "·")


def fold(text: str) -> str:
    """One comparable form for painted text and rendered text (see the module docstring)."""
    text = unicodedata.normalize("NFKC", text).translate(FOLD_QUOTES)
    for glyph in FOLD_DECORATION:
        text = text.replace(glyph, " ")
    text = text.replace(":", " ")
    # `innerText` returns what CSS painted, so a heading the stylesheet sets in capitals arrives in
    # capitals. Letter case is presentation here and is folded away on both sides.
    return re.sub(r"\s+", " ", text).strip().casefold()


@dataclass
class Page:
    key: str
    slug: str
    tier: int


def psql(database_url: str, sql: str) -> list[list[str]]:
    result = subprocess.run(
        ["psql", database_url, "-At", "-F", "\x1f", "-c", sql],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit(f"psql failed: {result.stderr.strip()}")
    return [line.split("\x1f") for line in result.stdout.splitlines() if line]


def load_pages(database_url: str) -> list[Page]:
    rows = psql(database_url, 'SELECT "key", slug, tier FROM corpus_pages')
    return [Page(key=row[0], slug=row[1], tier=int(row[2])) for row in rows]


def sample(pages: list[Page], size: int, seed: int) -> list[Page]:
    by_tier: dict[int, list[Page]] = defaultdict(list)
    for page in sorted(pages, key=lambda p: p.key):
        by_tier[page.tier].append(page)
    tiers = sorted(by_tier)
    per_tier = max(1, size // max(1, len(tiers)))
    rng = random.Random(seed)
    drawn: list[Page] = []
    for tier in tiers:
        held = by_tier[tier]
        drawn.extend(rng.sample(held, min(per_tier, len(held))))
    # Any shortfall (a tier smaller than its share) is made up from what is left, in key order.
    if len(drawn) < size:
        taken = {page.key for page in drawn}
        rest = [page for page in sorted(pages, key=lambda p: p.key) if page.key not in taken]
        drawn.extend(rest[: size - len(drawn)])
    return sorted(drawn, key=lambda p: p.key)


def read_render(text_dir: Path, keys: set[str]) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for path in sorted(text_dir.glob("batch-*.ndjson")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                record = json.loads(line)
                if record["key"] in keys:
                    # `proseText` is the page without the parts the template declares markup —
                    # the same set `MARKUP_SELECTOR` hides in the browser.
                    out[record["key"]] = [
                        row for row in record["proseText"].split("\n") if row.strip()
                    ]
    return out


async def render_pages(pages: list[Page], base_url: str, issues: list[str]) -> dict[str, str]:
    from playwright.async_api import async_playwright

    LEGAL_LOG.parent.mkdir(parents=True, exist_ok=True)
    log = LEGAL_LOG.open("a", encoding="utf-8")
    queue: asyncio.Queue[Page] = asyncio.Queue()
    for page in pages:
        queue.put_nowait(page)
    out: dict[str, str] = {}
    lock = asyncio.Lock()

    async def worker(browser) -> None:
        context = await browser.new_context(
            viewport={"width": DEFAULT_WIDTH, "height": 900}, user_agent=USER_AGENT
        )
        tab = await context.new_page()
        try:
            while True:
                try:
                    target = queue.get_nowait()
                except asyncio.QueueEmpty:
                    return
                url = f"{base_url}/d/{target.slug}"
                status = 0
                payload = None
                for attempt in range(NAV_ATTEMPTS):
                    try:
                        response = await tab.goto(
                            url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS
                        )
                        status = response.status if response else 0
                        if status == 200:
                            await tab.wait_for_selector("main", timeout=SELECTOR_TIMEOUT_MS)
                            payload = await tab.evaluate(EXTRACT_JS)
                        break
                    except Exception as error:  # noqa: BLE001 - reported, then retried
                        if attempt == NAV_ATTEMPTS - 1:
                            issues.append(f"render failed for {url}: {error}")
                        else:
                            await asyncio.sleep(2 * (attempt + 1))
                async with lock:
                    log.write(
                        json.dumps(
                            {
                                "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                                "url": url,
                                "status": status or None,
                                "bytes": None,
                                "viewport": str(DEFAULT_WIDTH),
                                "agent": LEGAL_AGENT,
                                "note": LEGAL_NOTE,
                            }
                        )
                        + "\n"
                    )
                    log.flush()
                    if payload is None or status != 200:
                        issues.append(f"{url} answered {status}; it is not in the sample")
                    else:
                        out[target.key] = payload["text"]
                    if len(out) % 25 == 0 and out:
                        print(f"  rendered {len(out)}/{len(pages)}", flush=True)
        finally:
            await context.close()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            await asyncio.gather(*(worker(browser) for _ in range(CONCURRENCY)))
        finally:
            await browser.close()
    log.close()
    return out


def compare(render_lines: list[str], painted_text: str) -> dict:
    """The three checks of §11, over the folded forms."""
    painted_folded = fold(painted_text)
    painted_lines = [row for row in painted_text.split("\n") if row.strip()]
    render_folded = fold("\n".join(render_lines))

    missing_from_page: list[str] = []
    out_of_order: list[str] = []
    cursor = 0
    for line in render_lines:
        needle = fold(line)
        if not needle:
            continue
        at = painted_folded.find(needle)
        if at < 0:
            missing_from_page.append(line)
            continue
        forward = painted_folded.find(needle, cursor)
        if forward < 0:
            out_of_order.append(line)
        else:
            cursor = forward + len(needle)

    missing_from_render: list[str] = []
    for line in painted_lines:
        needle = fold(line)
        if not needle:
            continue
        if needle not in render_folded:
            missing_from_render.append(line)

    return {
        "renderLinesNotPainted": missing_from_page,
        "paintedLinesNotInRender": missing_from_render,
        "renderLinesOutOfOrder": out_of_order,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--text-dir", default=str(DEFAULT_TEXT_DIR))
    parser.add_argument("--sample", type=int, default=DEFAULT_SAMPLE)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    args = parser.parse_args(argv)

    if not args.database_url:
        raise SystemExit("DATABASE_URL is required (or pass --database-url)")
    text_dir = Path(args.text_dir)
    if not text_dir.is_dir():
        raise SystemExit(f"no render text under {text_dir}")

    pages = sample(load_pages(args.database_url), args.sample, args.seed)
    render = read_render(text_dir, {page.key for page in pages})
    issues: list[str] = []
    painted = asyncio.run(render_pages(pages, args.base_url.rstrip("/"), issues))

    per_page: list[dict] = []
    totals = Counter()
    for page in pages:
        text = painted.get(page.key)
        lines = render.get(page.key)
        if text is None:
            totals["pages not rendered"] += 1
            continue
        if lines is None:
            totals["pages with no render record"] += 1
            issues.append(f"{page.key}: no render text under {text_dir}")
            continue
        result = compare(lines, text)
        totals["pages compared"] += 1
        counts = {name: len(value) for name, value in result.items()}
        for name, count in counts.items():
            totals[name] += count
        if any(counts.values()):
            totals["pages disagreeing"] += 1
        per_page.append({"key": page.key, "slug": page.slug, "tier": page.tier, **result})

    report = {
        "generatedBy": "scripts/revamp/dom_parity.py",
        "spec": "docs/specs/phase4-generators.md#11",
        "baseUrl": args.base_url,
        "textDir": os.path.relpath(text_dir, ROOT),
        "seed": args.seed,
        "requested": args.sample,
        "exclusions": EXCLUDE_SELECTOR,
        "totals": dict(sorted(totals.items())),
        "issues": issues,
        "pages": per_page,
    }
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(json.dumps(report["totals"], indent=2))
    shown = 0
    for entry in per_page:
        for name in ("renderLinesNotPainted", "paintedLinesNotInRender", "renderLinesOutOfOrder"):
            for line in entry[name]:
                if shown >= PRINT_ROWS:
                    break
                print(f"  {name[:14]:14s} {entry['key'][:28]:28s} {line[:90]}")
                shown += 1
    print(f"written to {os.path.relpath(out_path, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
