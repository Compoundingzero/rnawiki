#!/usr/bin/env python3
"""Phase 3 step 3.6 — the rendered duplicate check `docs/specs/identity-resolution.md` §5.3 requires.

§5.3 lists three duplicate detectors that must run before any page ships: structural (shared
InChIKey-14), nominal (equal name families) and **rendered** — "the R3 overlap measure runs over the
data each record would render". The corpus-20k run executed the first two and measured overlap over
the *source text* it was about to load. It never measured the text a browser actually paints, so a
pair whose difference lives only in the input (two biosimilars whose pages carry the originator's
whole trial set, seven vaccine-component pages sharing one trial set verbatim) could not be seen.

What this script does, exactly as `docs/specs/revamp-2026-09.md` Phase 3.6 specifies:

  1. renders, in headless Chromium, at 390 px and 1280 px:
       - every indexable page (the URLs in the live sitemap children `tier-1.xml` and `tier-2.xml`),
       - every hub (Phase 5 builds hubs; the sitemap index has no hub child and the app has no hub
         route, so this set is empty today and the summary records that as a measured zero),
       - a random sample of noindex pages, default 1,000, seeded so the draw is reproducible;
  2. extracts visible text with `innerText` over `main`, with the navigation, the footer, the search
     bar and the supervision block hidden first — `innerText` is layout-dependent, so the elements
     are hidden in the live DOM rather than stripped from a detached clone, which is what makes the
     390 px and 1280 px readings two genuinely different measurements;
  3. cuts each reading into 5-word shingles and takes a 128-permutation MinHash, reusing the
     splitmix64 permutation family, the FNV shingle mixing and the blake2b token vocabulary of
     `scripts/corpus-20k/overlap/harness.py` so this run and the corpus-20k overlap numbers are on
     one ruler;
  4. screens all pairs on the MinHash estimate and scores the survivors on the exact Jaccard of
     their shingle sets, so a flagged pair carries a measured similarity rather than an estimate
     with a +/- 0.04 standard error sitting on the threshold;
  5. writes every pair at or above the threshold to `data/revamp/rendered-dups.csv`, and the counts,
     the sets, the seeds and the reason breakdown to `data/revamp/rendered-dups-summary.json`.

Each flagged pair is given one reason, by this precedence: `biosimilar` (a recorded
`biosimilar-of` relation, a shared UNII base key or a shared stem with distinct four-letter
suffixes), `serotype-component` (both pages are `contains` components of one combination page),
`identical-trial-set` (both pages render the same non-empty set of NCT identifiers),
`stub-template` (neither page renders a single question block, so what matched is the shell), then
`unclassified-overlap` — an honest label for a pair none of the four explain, listed with its
similarity so Phase 4 can look at it.

A count of zero against a reason is ambiguous on its own — the class may not overlap, or no page of
that class may have been drawn — so the summary also carries a `namedClassProbe`: for the two
identity-linked classes it enumerates every pair whose members were both rendered, scores them
whatever their similarity, and reports how many crossed the threshold with the maximum and median
similarity seen. A zero beside a non-zero `pairsRenderedBothSides` is a measurement.

Nothing here decides identity. A flagged pair is evidence for step 3.2 (the same substance, merge)
or for Phase 4 (two substances the generator fails to differentiate); this script only measures.

Fetching. Own-site only, at most `--concurrency` (capped at 4) navigations in flight, every
navigation appended to `data/corpus-20k/legal/requests.log` in the shape that log already uses.
Rendered text is cached under `data/revamp/rendered-text/` (gitignored), keyed by base URL, slug and
width, so a re-run renders only what it has not rendered before; `--refresh` ignores the cache.

Usage:

    .venv-corpus/bin/python scripts/revamp/rendered_dup_check.py
    .venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --sample 200 --threshold 0.45
    .venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://localhost:3000
    .venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --fail-on-indexable   # CI (Phase 6)

`--fail-on-indexable` exits 2 and names the first indexable-to-indexable pair over the threshold.
That is the gate G3 line "rendered-dups.csv zero on the indexable set", and the Phase 6 CI check.

Page identity. The CSV names pages by slug, the identifier in the URL. Slugs come from the run's own
records where they are recorded (KEEP/RETAIN dispositions, the gate 2 crawl lists) and otherwise are
recomputed with the load's own rule (`assignSlugs`/`kebabCase`, `scripts/corpus-20k/load/
materialise.ts:579-648`). A recomputed slug can be wrong where the pre-existing redirect ledger had
reserved the base name, so every rendered page's `h1` is checked against the canonical display name
for the key it was requested for and a mismatch is dropped and counted, never scored.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import hashlib
import json
import random
import re
import sys
import time
import unicodedata
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree

import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "corpus-20k" / "overlap"))

import harness  # noqa: E402  (path is set immediately above)

# ---------------------------------------------------------------------------------------------
# paths and constants

CANONICAL = REPO_ROOT / "data/corpus-20k/identity/canonical.ndjson"
DISPOSITIONS = REPO_ROOT / "data/corpus-20k/reconciliation/dispositions.ndjson"
LEGACY_STAGE = REPO_ROOT / "data/corpus-20k/identity/stages/existing.ndjson"
PAGES_ALL = REPO_ROOT / "data/corpus-20k/render/pages-all.ndjson"
INDEXED_KEYS = REPO_ROOT / "data/corpus-20k/final/lists/indexed.txt"
SLUG_FACT_FILES = (
    REPO_ROOT / "data/corpus-20k/gate2/html-text/crawl.ndjson",
    REPO_ROOT / "data/corpus-20k/final/html-text/live-dossiers.ndjson",
)
SLUG_FACT_TSV_DIR = REPO_ROOT / "data/corpus-20k/gate2/lists"

LEGAL_LOG = REPO_ROOT / "data/corpus-20k/legal/requests.log"
CACHE_DIR = REPO_ROOT / "data/revamp/rendered-text"
OUT_CSV = REPO_ROOT / "data/revamp/rendered-dups.csv"
OUT_SUMMARY = REPO_ROOT / "data/revamp/rendered-dups-summary.json"

SITEMAP_INDEX = "/sitemap.xml"
INDEXABLE_SITEMAPS = ("tier-1", "tier-2")
# `lib/corpus/sitemap.ts:35` — the sitemap index has exactly these four children. None of them is a
# hub sitemap, and `app/` has no hub route: Phase 5 has not run.
KNOWN_SITEMAP_CHILDREN = ("tier-1", "tier-2", "browse", "pages")

SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LEGAL_AGENT = "Playwright chromium via scripts/revamp/rendered_dup_check.py (own-site rendered duplicate check)"
LEGAL_NOTE = "browser navigation; the page's sub-resource requests are not itemised"

DEFAULT_WIDTHS = (390, 1280)
DEFAULT_SAMPLE = 1000
DEFAULT_SAMPLE_SEED = 20260905
DEFAULT_THRESHOLD = 0.5
DEFAULT_CONCURRENCY = 4
MAX_CONCURRENCY = 4
# The MinHash estimate over 128 permutations has a standard error of at most 0.5/sqrt(128) = 0.044.
# Screening 0.10 below the threshold is 2.3 standard errors of headroom before the exact score runs.
SCREEN_MARGIN = 0.10
NAV_TIMEOUT_MS = 45_000
SELECTOR_TIMEOUT_MS = 20_000
NAV_ATTEMPTS = 3

SLUG_MAX = 128
SLUG_BASE_MAX = 120

NCT_RE = re.compile(r"NCT\d{8}")
SUFFIX_RE = re.compile(r"^([a-z][a-z0-9]{3,})-([a-z]{4})$")
SEROTYPE_VOCAB = ("serotype", "antigen", "polysaccharide", "capsular", "strain", "subtype")
DIGIT_RUN_RE = re.compile(r"\d+")

# `main` is the content region (`components/AppShell.tsx:53`). The site header and footer are
# siblings of it, so what is hidden here is what sits *inside* the region: the contents rail
# (`nav.cd-rail`) and its small-screen twin (`details.cd-contents`), any search control, and the
# supervision block (`.cd-supervision`, `components/dossier/corpus/QuestionBlock.tsx:58`). The page
# header band (`header.cd-header`, the title, the recorded names and the register line) is content
# and stays in: it is the part a duplicate pair most often differs by, and dropping it would
# manufacture matches.
EXCLUDE_SELECTOR = (
    "nav, footer, [role='search'], [role='combobox'], [role='listbox'], "
    "input, .cd-rail, .cd-contents, .cd-supervision"
)

EXTRACT_JS = """() => {
  const main = document.querySelector('main');
  if (!main) return null;
  const hidden = [];
  for (const el of main.querySelectorAll(%s)) {
    hidden.push(el.tagName.toLowerCase());
    el.style.display = 'none';
  }
  void main.offsetHeight;
  const heading = main.querySelector('h1');
  return {
    text: main.innerText || '',
    h1: heading ? (heading.innerText || '').trim() : null,
    blocks: main.querySelectorAll('section.cd-block').length,
    hidden: hidden.length,
  };
}""" % json.dumps(EXCLUDE_SELECTOR)


# ---------------------------------------------------------------------------------------------
# slugs: the load's own rule, recomputed


def kebab_case(value: str) -> str:
    """`kebabCase`, `scripts/corpus-20k/load/materialise.ts:582-593`."""
    stripped = unicodedata.normalize("NFKD", value)
    stripped = "".join(c for c in stripped if not unicodedata.combining(c)).lower()
    stripped = re.sub(r"[^a-z0-9]+", "-", stripped).strip("-")
    if len(stripped) <= SLUG_BASE_MAX:
        return stripped
    cut = stripped[:SLUG_BASE_MAX]
    last_hyphen = cut.rfind("-")
    return (cut[:last_hyphen] if last_hyphen > 0 else cut).rstrip("-")


def repo_path(path: Path) -> str:
    """The path as written in a report: relative to the repository when it is inside it."""
    resolved = path.resolve()
    try:
        return str(resolved.relative_to(REPO_ROOT))
    except ValueError:
        return str(resolved)


def read_ndjson(path: Path) -> Iterable[dict]:
    with path.open(encoding="utf-8", errors="replace") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


@dataclass
class CorpusRecord:
    key: str
    display_name: str
    relations: list[dict]
    tier: str | None = None


def load_corpus() -> dict[str, CorpusRecord]:
    records: dict[str, CorpusRecord] = {}
    for row in read_ndjson(CANONICAL):
        records[row["key"]] = CorpusRecord(
            key=row["key"],
            display_name=row.get("displayName") or "",
            relations=list(row.get("relations") or []),
        )
    if PAGES_ALL.exists():
        for row in read_ndjson(PAGES_ALL):
            held = records.get(row["key"])
            if held is not None:
                held.tier = row.get("tier")
    return records


def recorded_slug_facts() -> dict[str, str]:
    """slug -> key pairs this repository already holds, from three recorded sources."""
    facts: dict[str, str] = {}
    for row in read_ndjson(DISPOSITIONS):
        if row.get("disposition") in ("KEEP", "RETAIN"):
            facts.setdefault(row["slug"], row["key"])
    for path in SLUG_FACT_FILES:
        if not path.exists():
            continue
        for row in read_ndjson(path):
            if row.get("slug") and row.get("key"):
                facts.setdefault(row["slug"], row["key"])
    if SLUG_FACT_TSV_DIR.is_dir():
        for path in sorted(SLUG_FACT_TSV_DIR.glob("*.tsv")):
            for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
                parts = line.split("\t")
                if len(parts) >= 2 and parts[0] and parts[1]:
                    facts.setdefault(parts[1], parts[0])
    return facts


def assign_slugs(records: dict[str, CorpusRecord]) -> tuple[dict[str, str], dict[str, str]]:
    """`assignSlugs`, `scripts/corpus-20k/load/materialise.ts:605-648`, plus the recorded facts.

    Returns (key -> slug, key -> provenance) where provenance is `recorded` or `recomputed`.
    """
    slug_by_key: dict[str, str] = {}
    provenance: dict[str, str] = {}
    taken: set[str] = set()

    dispositions = list(read_ndjson(DISPOSITIONS))
    kept = sorted(
        (r for r in dispositions if r.get("disposition") in ("KEEP", "RETAIN")),
        key=lambda r: r["slug"],
    )
    for row in kept:
        if row["key"] not in records or row["key"] in slug_by_key:
            continue
        slug_by_key[row["key"]] = row["slug"]
        provenance[row["key"]] = "recorded"
        taken.add(row["slug"])

    for slug, key in recorded_slug_facts().items():
        taken.add(slug)
        if key in records and key not in slug_by_key:
            slug_by_key[key] = slug
            provenance[key] = "recorded"

    if LEGACY_STAGE.exists():
        for row in read_ndjson(LEGACY_STAGE):
            if row.get("slug"):
                taken.add(row["slug"])
    for row in dispositions:
        if row.get("disposition") == "REDIRECT":
            taken.add(row["slug"])

    for key in sorted(records):
        if key in slug_by_key:
            continue
        base = kebab_case(records[key].display_name) or kebab_case(key) or "record"
        candidate = base
        suffix = 2
        while candidate in taken or len(candidate) > SLUG_MAX:
            candidate = f"{base}-{suffix}"
            suffix += 1
        slug_by_key[key] = candidate
        provenance[key] = "recomputed"
        taken.add(candidate)
    return slug_by_key, provenance


# ---------------------------------------------------------------------------------------------
# page sets


@dataclass
class PageTarget:
    slug: str
    key: str | None
    set_name: str  # indexable | noindex-sample | hub
    tier: str | None = None

    @property
    def path(self) -> str:
        return f"/d/{self.slug}"


def fetch_text(url: str, timeout: int = 60, attempts: int = 3) -> tuple[int, str]:
    """GET a URL, retrying a transport failure with backoff. Returns (status, body).

    A status of 0 means the request never reached an HTTP answer; the caller records that as an
    issue rather than raising, so one dropped connection does not end a 1,600-page run.
    """
    import urllib.error
    import urllib.request

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status, response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as error:
            return error.code, ""
        except Exception:
            if attempt == attempts - 1:
                return 0, ""
            time.sleep(2 * (attempt + 1))
    return 0, ""


def sitemap_slugs(base_url: str, child: str, issues: list[str]) -> list[str]:
    url = f"{base_url}/sitemaps/{child}.xml"
    status, body = fetch_text(url)
    if status != 200 or not body:
        issues.append(f"sitemap child {child}.xml answered {status}; its pages are not in this run")
        return []
    slugs: list[str] = []
    root = ElementTree.fromstring(body)
    for loc in root.iter(f"{SITEMAP_NS}loc"):
        location = (loc.text or "").strip()
        if "/d/" not in location:
            continue
        slugs.append(location.rsplit("/d/", 1)[1].split("?", 1)[0].split("#", 1)[0])
    return slugs


def sitemap_children(base_url: str, issues: list[str]) -> list[str]:
    status, body = fetch_text(f"{base_url}{SITEMAP_INDEX}")
    if status != 200 or not body:
        issues.append(f"sitemap index answered {status}; the indexable set could not be enumerated")
        return []
    root = ElementTree.fromstring(body)
    children = []
    for loc in root.iter(f"{SITEMAP_NS}loc"):
        location = (loc.text or "").strip()
        if location.endswith(".xml"):
            children.append(location.rsplit("/", 1)[1][: -len(".xml")])
    return children


def build_targets(
    base_url: str,
    records: dict[str, CorpusRecord],
    slug_by_key: dict[str, str],
    sample_size: int,
    sample_seed: int,
    issues: list[str],
) -> tuple[list[PageTarget], dict]:
    key_by_slug = {slug: key for key, slug in slug_by_key.items()}

    children = sitemap_children(base_url, issues)
    hub_children = [c for c in children if "hub" in c]
    unexpected = [c for c in children if c not in KNOWN_SITEMAP_CHILDREN]
    if unexpected:
        issues.append(
            "sitemap index carries children this script does not know: "
            + ", ".join(sorted(unexpected))
        )

    indexable: list[PageTarget] = []
    seen: set[str] = set()
    for child in INDEXABLE_SITEMAPS:
        if children and child not in children:
            issues.append(f"sitemap index does not list {child}.xml")
            continue
        for slug in sitemap_slugs(base_url, child, issues):
            if slug in seen:
                continue
            seen.add(slug)
            key = key_by_slug.get(slug)
            indexable.append(
                PageTarget(
                    slug=slug,
                    key=key,
                    set_name="indexable",
                    tier=records[key].tier if key and key in records else None,
                )
            )
    unmapped = sum(1 for t in indexable if t.key is None)
    if unmapped:
        issues.append(f"{unmapped} indexable slugs have no key in the corpus records")

    hubs: list[PageTarget] = []
    for child in hub_children:
        for slug in sitemap_slugs(base_url, child, issues):
            hubs.append(PageTarget(slug=slug, key=None, set_name="hub"))

    indexable_keys = {t.key for t in indexable if t.key}
    if INDEXED_KEYS.exists():
        indexable_keys |= {
            line.strip() for line in INDEXED_KEYS.read_text(encoding="utf-8").splitlines() if line.strip()
        }
    frame = sorted(key for key in slug_by_key if key not in indexable_keys)
    drawn = frame if sample_size >= len(frame) else random.Random(sample_seed).sample(frame, sample_size)
    if sample_size > len(frame):
        issues.append(
            f"--sample {sample_size} exceeds the {len(frame)}-page noindex frame; every page was drawn"
        )
    noindex = [
        PageTarget(
            slug=slug_by_key[key],
            key=key,
            set_name="noindex-sample",
            tier=records[key].tier if key in records else None,
        )
        for key in sorted(drawn)
    ]

    targets = indexable + hubs + noindex
    sets = {
        "indexableRequested": len(indexable),
        "hubsRequested": len(hubs),
        "noindexSampleRequested": len(noindex),
        "noindexFrame": len(frame),
        "sitemapChildren": children,
        "hubSitemapChildren": hub_children,
    }
    return targets, sets


# ---------------------------------------------------------------------------------------------
# rendering


@dataclass
class Rendered:
    slug: str
    key: str | None
    set_name: str
    tier: str | None
    width: int
    status: int
    text: str
    h1: str | None
    blocks: int


def cache_path(base_url: str, slug: str) -> Path:
    digest = hashlib.sha256(f"{base_url}|{slug}".encode("utf-8")).hexdigest()
    return CACHE_DIR / digest[:2] / f"{digest}.json"


class LegalLog:
    """Append-only request log, in the shape `data/corpus-20k/legal/requests.log` already uses."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.handle = self.path.open("a", encoding="utf-8")
        self.lock = asyncio.Lock()
        self.written = 0

    async def record(self, url: str, status: int | None, width: int) -> None:
        line = json.dumps(
            {
                "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "url": url,
                "status": status,
                "bytes": None,
                "viewport": str(width),
                "agent": LEGAL_AGENT,
                "note": LEGAL_NOTE,
            }
        )
        async with self.lock:
            self.handle.write(line + "\n")
            self.handle.flush()
            self.written += 1

    def close(self) -> None:
        self.handle.close()


async def render_all(
    targets: list[PageTarget],
    base_url: str,
    widths: tuple[int, ...],
    concurrency: int,
    refresh: bool,
    issues: list[str],
) -> tuple[list[Rendered], dict]:
    from playwright.async_api import async_playwright

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    legal = LegalLog(LEGAL_LOG)
    counters: dict[str, int] = defaultdict(int)
    rendered: list[Rendered] = []
    queue: asyncio.Queue[PageTarget] = asyncio.Queue()

    to_render: list[PageTarget] = []
    for target in targets:
        path = cache_path(base_url, target.slug)
        held = None
        if path.exists() and not refresh:
            try:
                held = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                held = None
        if held and all(str(w) in held.get("widths", {}) for w in widths):
            counters["cached"] += 1
            for width in widths:
                entry = held["widths"][str(width)]
                rendered.append(
                    Rendered(
                        slug=target.slug,
                        key=target.key,
                        set_name=target.set_name,
                        tier=target.tier,
                        width=width,
                        status=entry["status"],
                        text=entry["text"],
                        h1=entry.get("h1"),
                        blocks=entry.get("blocks", 0),
                    )
                )
            continue
        to_render.append(target)

    for target in to_render:
        queue.put_nowait(target)

    fresh: list[Rendered] = []
    lock = asyncio.Lock()
    done = 0
    total = len(to_render)

    async def worker(browser) -> None:
        nonlocal done
        contexts = {}
        pages = {}
        for width in widths:
            contexts[width] = await browser.new_context(
                viewport={"width": width, "height": 900}, user_agent=USER_AGENT
            )
            pages[width] = await contexts[width].new_page()
        try:
            while True:
                try:
                    target = queue.get_nowait()
                except asyncio.QueueEmpty:
                    return
                url = f"{base_url}{target.path}"
                widths_payload: dict[str, dict] = {}
                for width in widths:
                    page = pages[width]
                    status: int | None = None
                    payload = None
                    for attempt in range(NAV_ATTEMPTS):
                        try:
                            response = await page.goto(
                                url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS
                            )
                            status = response.status if response else None
                            if status == 200:
                                await page.wait_for_selector("main", timeout=SELECTOR_TIMEOUT_MS)
                                payload = await page.evaluate(EXTRACT_JS)
                            break
                        except Exception as error:  # navigation, timeout or evaluation
                            if attempt == NAV_ATTEMPTS - 1:
                                async with lock:
                                    counters["render errors"] += 1
                                    if counters["render errors"] <= 5:
                                        issues.append(f"render failed for {url} at {width} px: {error}")
                            else:
                                await asyncio.sleep(2 * (attempt + 1))
                    await legal.record(url, status, width)
                    if payload is None or status != 200:
                        widths_payload = {}
                        break
                    widths_payload[str(width)] = {
                        "status": status,
                        "text": payload["text"],
                        "h1": payload["h1"],
                        "blocks": payload["blocks"],
                    }
                async with lock:
                    done += 1
                    if done % 100 == 0 or done == total:
                        print(f"  rendered {done}/{total} pages", flush=True)
                if not widths_payload:
                    async with lock:
                        counters["pages dropped: no 200 response at both widths"] += 1
                    continue
                record = {
                    "url": url,
                    "slug": target.slug,
                    "key": target.key,
                    "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "widths": widths_payload,
                }
                path = cache_path(base_url, target.slug)
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(record), encoding="utf-8")
                async with lock:
                    for width in widths:
                        entry = widths_payload[str(width)]
                        fresh.append(
                            Rendered(
                                slug=target.slug,
                                key=target.key,
                                set_name=target.set_name,
                                tier=target.tier,
                                width=width,
                                status=entry["status"],
                                text=entry["text"],
                                h1=entry["h1"],
                                blocks=entry["blocks"],
                            )
                        )
        finally:
            for context in contexts.values():
                await context.close()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            await asyncio.gather(*(worker(browser) for _ in range(max(1, min(concurrency, MAX_CONCURRENCY)))))
        finally:
            await browser.close()
    legal.close()

    rendered.extend(fresh)
    counters["rendered"] = len(fresh) // max(1, len(widths))
    counters["requests logged"] = legal.written
    return rendered, dict(counters)


def verify_identity(
    rendered: list[Rendered], records: dict[str, CorpusRecord], issues: list[str]
) -> tuple[list[Rendered], int]:
    """Drop a page whose rendered `h1` is not the display name of the key it was requested for."""

    def normalise(value: str) -> str:
        return re.sub(r"\s+", " ", value or "").strip().casefold()

    bad_slugs: set[str] = set()
    for row in rendered:
        if row.key is None or row.key not in records:
            continue
        expected = normalise(records[row.key].display_name)
        got = normalise(row.h1 or "")
        if expected and got and expected != got:
            bad_slugs.add(row.slug)
    if bad_slugs:
        issues.append(
            f"{len(bad_slugs)} requested slugs rendered a different substance than their key names "
            "and were dropped before scoring"
        )
    kept = [row for row in rendered if row.slug not in bad_slugs]
    return kept, len(bad_slugs)


# ---------------------------------------------------------------------------------------------
# shingles, MinHash, pairs


@dataclass
class Scored:
    slug: str
    key: str | None
    set_name: str
    blocks: int
    shingles: np.ndarray
    signature: np.ndarray
    ncts: frozenset[str] = field(default_factory=frozenset)


def score_pages(rows: list[Rendered], vocabulary: harness.TokenVocabulary, seeds: np.ndarray) -> list[Scored]:
    scored: list[Scored] = []
    for row in rows:
        tokens = harness.normalise_tokens(row.text)
        values = vocabulary.encode(tokens)
        shingles = harness.shingle_hashes(values)
        scored.append(
            Scored(
                slug=row.slug,
                key=row.key,
                set_name=row.set_name,
                blocks=row.blocks,
                shingles=shingles,
                signature=harness.minhash_signature(shingles, seeds),
                ncts=frozenset(NCT_RE.findall(row.text)),
            )
        )
    return scored


def exact_jaccard(a: np.ndarray, b: np.ndarray) -> float:
    if a.size == 0 and b.size == 0:
        return 0.0
    shared = harness.intersection_size(a, b)
    union = a.size + b.size - shared
    return float(shared / union) if union else 0.0


def flag_pairs(scored: list[Scored], threshold: float) -> list[tuple[int, int, float]]:
    """All pairs at or above the threshold: MinHash screen, then exact Jaccard on the survivors."""
    if len(scored) < 2:
        return []
    signatures = np.vstack([s.signature for s in scored])
    n_perm = signatures.shape[1]
    screen = max(0.0, threshold - SCREEN_MARGIN)
    flagged: list[tuple[int, int, float]] = []
    chunk = 256
    for start in range(0, len(scored), chunk):
        block = signatures[start : start + chunk]
        matches = (block[:, None, :] == signatures[None, :, :]).sum(axis=2) / n_perm
        for local, row in enumerate(matches):
            i = start + local
            candidates = np.nonzero(row >= screen)[0]
            for j in candidates:
                j = int(j)
                if j <= i:
                    continue
                value = exact_jaccard(scored[i].shingles, scored[j].shingles)
                if value >= threshold:
                    flagged.append((i, j, value))
    return flagged


# ---------------------------------------------------------------------------------------------
# reasons


class ReasonModel:
    def __init__(self, records: dict[str, CorpusRecord]) -> None:
        self.records = records
        self.biosimilar: dict[str, set[str]] = defaultdict(set)
        self.component_of: dict[str, set[str]] = defaultdict(set)
        for key, record in records.items():
            for relation in record.relations:
                kind = (relation.get("type") or "").lower()
                target = relation.get("targetKey")
                if not target:
                    continue
                if kind == "biosimilar-of":
                    self.biosimilar[key].add(target)
                    self.biosimilar[target].add(key)
                elif kind == "contains":
                    self.component_of[target].add(key)

    @staticmethod
    def base_key(key: str | None) -> str | None:
        return key.split("#", 1)[0] if key else None

    def display(self, key: str | None) -> str:
        record = self.records.get(key or "")
        return record.display_name if record else ""

    def is_biosimilar_pair(self, a: Scored, b: Scored) -> bool:
        if a.key and b.key:
            if b.key in self.biosimilar.get(a.key, ()):
                return True
            if "#" in a.key or "#" in b.key:
                if self.base_key(a.key) == self.base_key(b.key):
                    return True
        left = SUFFIX_RE.match(re.sub(r"\s+", "-", self.display(a.key).strip().lower()))
        right = SUFFIX_RE.match(re.sub(r"\s+", "-", self.display(b.key).strip().lower()))
        if left and right and left.group(1) == right.group(1) and left.group(2) != right.group(2):
            return True
        if left and not right and left.group(1) == self.display(b.key).strip().lower():
            return True
        if right and not left and right.group(1) == self.display(a.key).strip().lower():
            return True
        return False

    def is_serotype_component_pair(self, a: Scored, b: Scored) -> bool:
        if a.key and b.key:
            shared = self.component_of.get(a.key, set()) & self.component_of.get(b.key, set())
            if shared:
                return True
        left = self.display(a.key).lower()
        right = self.display(b.key).lower()
        if not left or not right:
            return False
        if not any(word in left for word in SEROTYPE_VOCAB):
            return False
        if not any(word in right for word in SEROTYPE_VOCAB):
            return False
        return DIGIT_RUN_RE.sub("#", left) == DIGIT_RUN_RE.sub("#", right)

    def named_class_pairs(self, scored: list[Scored]) -> dict[str, list[tuple[int, int]]]:
        """The pairs the two identity-linked reason classes name, among the pages actually rendered.

        A zero in `reasons` is otherwise unreadable: it could mean the class does not overlap, or
        that no page of that class was drawn. Enumerating the class members that were rendered, and
        scoring them whatever their similarity, tells the two apart.
        """
        index: dict[str, int] = {}
        for position, page in enumerate(scored):
            if page.key:
                index.setdefault(page.key, position)

        biosimilar: set[tuple[int, int]] = set()
        for key, position in index.items():
            for partner in self.biosimilar.get(key, ()):  # recorded `biosimilar-of` relations
                other = index.get(partner)
                if other is not None and other != position:
                    biosimilar.add((min(position, other), max(position, other)))

        by_combination: dict[str, list[int]] = defaultdict(list)
        for key, position in index.items():
            for combination in self.component_of.get(key, ()):
                by_combination[combination].append(position)
        serotype: set[tuple[int, int]] = set()
        for members in by_combination.values():
            ordered = sorted(set(members))
            for left in range(len(ordered)):
                for right in range(left + 1, len(ordered)):
                    serotype.add((ordered[left], ordered[right]))

        return {"biosimilar": sorted(biosimilar), "serotype-component": sorted(serotype)}

    def reason(self, a: Scored, b: Scored) -> str:
        if self.is_biosimilar_pair(a, b):
            return "biosimilar"
        if self.is_serotype_component_pair(a, b):
            return "serotype-component"
        if a.ncts and a.ncts == b.ncts:
            return "identical-trial-set"
        if a.blocks == 0 and b.blocks == 0:
            return "stub-template"
        return "unclassified-overlap"


# ---------------------------------------------------------------------------------------------
# main


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default="https://rnawiki.com", help="site to render against")
    parser.add_argument("--sample", type=int, default=DEFAULT_SAMPLE, help="noindex pages to draw")
    parser.add_argument("--seed", type=int, default=DEFAULT_SAMPLE_SEED, help="seed for that draw")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD, help="Jaccard to flag at")
    parser.add_argument(
        "--fail-on-indexable",
        action="store_true",
        help="exit non-zero naming the first flagged indexable pair (the Phase 6 CI check)",
    )
    parser.add_argument("--concurrency", type=int, default=DEFAULT_CONCURRENCY, help=f"max {MAX_CONCURRENCY}")
    parser.add_argument(
        "--widths",
        default=",".join(str(w) for w in DEFAULT_WIDTHS),
        help="comma-separated viewport widths",
    )
    parser.add_argument("--refresh", action="store_true", help="re-render pages already cached")
    parser.add_argument("--csv", type=Path, default=OUT_CSV)
    parser.add_argument("--summary", type=Path, default=OUT_SUMMARY)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    started = time.time()
    base_url = args.base_url.rstrip("/")
    widths = tuple(int(w) for w in args.widths.split(",") if w.strip())
    issues: list[str] = []

    records = load_corpus()
    slug_by_key, provenance = assign_slugs(records)
    targets, sets = build_targets(base_url, records, slug_by_key, args.sample, args.seed, issues)
    print(
        f"targets: {sets['indexableRequested']} indexable, {sets['hubsRequested']} hubs, "
        f"{sets['noindexSampleRequested']} noindex (frame {sets['noindexFrame']})",
        flush=True,
    )

    rendered, counters = asyncio.run(
        render_all(targets, base_url, widths, args.concurrency, args.refresh, issues)
    )
    rendered, dropped = verify_identity(rendered, records, issues)

    vocabulary = harness.TokenVocabulary()
    seeds = harness.make_hash_seeds(harness.DEFAULT_PERMUTATIONS, harness.DEFAULT_SEED)
    reasons = ReasonModel(records)

    by_width: dict[int, list[Rendered]] = defaultdict(list)
    for row in rendered:
        by_width[row.width].append(row)

    rows_out: list[dict] = []
    per_width: dict[str, dict] = {}
    reason_counts: dict[str, dict[str, int]] = defaultdict(lambda: {"pairs": 0, "indexablePairs": 0})
    for width in sorted(by_width):
        page_rows = sorted(by_width[width], key=lambda r: r.slug)
        scored = score_pages(page_rows, vocabulary, seeds)
        flagged = flag_pairs(scored, args.threshold)
        indexable_here = 0
        for i, j, value in flagged:
            a, b = scored[i], scored[j]
            reason = reasons.reason(a, b)
            both_indexable = a.set_name == "indexable" and b.set_name == "indexable"
            indexable_here += 1 if both_indexable else 0
            reason_counts[reason]["pairs"] += 1
            reason_counts[reason]["indexablePairs"] += 1 if both_indexable else 0
            rows_out.append(
                {
                    "page_a": a.slug,
                    "page_b": b.slug,
                    "width": width,
                    "jaccard": round(value, 4),
                    "indexable_a": "true" if a.set_name == "indexable" else "false",
                    "indexable_b": "true" if b.set_name == "indexable" else "false",
                    "_reason": reason,
                }
            )
        probe: dict[str, dict] = {}
        for class_name, class_pairs in reasons.named_class_pairs(scored).items():
            values = [exact_jaccard(scored[i].shingles, scored[j].shingles) for i, j in class_pairs]
            probe[class_name] = {
                "pairsRenderedBothSides": len(class_pairs),
                "pairsOverThreshold": sum(1 for v in values if v >= args.threshold),
                "maxJaccard": round(max(values), 4) if values else None,
                "medianJaccard": round(float(np.median(values)), 4) if values else None,
            }
        per_width[str(width)] = {
            "pagesScored": len(scored),
            "pairsFlagged": len(flagged),
            "indexablePairsFlagged": indexable_here,
            "namedClassProbe": probe,
        }

    rows_out.sort(key=lambda r: (r["width"], -r["jaccard"], r["page_a"], r["page_b"]))
    args.csv.parent.mkdir(parents=True, exist_ok=True)
    with args.csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["page_a", "page_b", "width", "jaccard", "indexable_a", "indexable_b"])
        for row in rows_out:
            writer.writerow(
                [row["page_a"], row["page_b"], row["width"], row["jaccard"], row["indexable_a"], row["indexable_b"]]
            )

    rendered_slugs = {row.set_name: set() for row in rendered}
    for row in rendered:
        rendered_slugs[row.set_name].add(row.slug)
    pairs_flagged = len(rows_out)
    indexable_pairs = sum(1 for row in rows_out if row["indexable_a"] == "true" and row["indexable_b"] == "true")
    runtime_minutes = round((time.time() - started) / 60.0, 2)

    summary = {
        "schema": "rnawiki-revamp-rendered-dup-check/v1",
        "spec": "docs/specs/revamp-2026-09.md#phase-3 step 3.6; docs/specs/identity-resolution.md §5.3",
        "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "baseUrl": base_url,
        "widths": list(widths),
        "threshold": args.threshold,
        "sampleSeed": args.seed,
        "minhash": {
            "permutations": harness.DEFAULT_PERMUTATIONS,
            "shingleWords": harness.SHINGLE_N,
            "permutationSeed": harness.DEFAULT_SEED,
            "permutationFamily": "splitmix64(shingle XOR seed_i), scripts/corpus-20k/overlap/harness.py",
            "screenMargin": SCREEN_MARGIN,
            "scoring": "MinHash screens; the reported jaccard is the exact shingle-set Jaccard",
        },
        "rendered": {
            "indexable": len(rendered_slugs.get("indexable", ())),
            "noindexSample": len(rendered_slugs.get("noindex-sample", ())),
            "hubs": len(rendered_slugs.get("hub", ())),
        },
        "sets": sets,
        "slugSources": {
            "recorded": sum(1 for v in provenance.values() if v == "recorded"),
            "recomputed": sum(1 for v in provenance.values() if v == "recomputed"),
        },
        "pagesDroppedOnIdentityCheck": dropped,
        # `runtimeMinutes` is only the cost of a cold run when `pagesFromCache` is zero; a run that
        # reused the cache is a scoring run, and says so here rather than looking like a fast render.
        "pagesRenderedThisRun": counters.get("rendered", 0),
        "pagesFromCache": counters.get("cached", 0),
        "renderCounters": counters,
        "perWidth": per_width,
        "pairsFlagged": pairs_flagged,
        "indexablePairsFlagged": indexable_pairs,
        "reasons": {k: v for k, v in sorted(reason_counts.items(), key=lambda kv: -kv[1]["pairs"])},
        "exclusions": EXCLUDE_SELECTOR,
        "runtimeMinutes": runtime_minutes,
        "outputs": {
            "pairs": repo_path(args.csv),
            "cache": repo_path(CACHE_DIR),
            "requestLog": repo_path(LEGAL_LOG),
        },
        "issues": issues,
    }
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.summary.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")

    print(f"rendered: {summary['rendered']}")
    print(f"pages dropped on the display-name check: {dropped}")
    for width in sorted(per_width):
        w = per_width[width]
        print(
            f"  {width} px: {w['pagesScored']} pages scored, {w['pairsFlagged']} pairs flagged, "
            f"{w['indexablePairsFlagged']} of them indexable-to-indexable"
        )
    print(f"pairs flagged at >= {args.threshold}: {pairs_flagged} ({indexable_pairs} indexable)")
    for reason, counts in summary["reasons"].items():
        print(f"  {reason}: {counts['pairs']} pairs, {counts['indexablePairs']} indexable")
    for width in sorted(per_width):
        for class_name, probe in per_width[width]["namedClassProbe"].items():
            print(
                f"  probe {width} px {class_name}: {probe['pairsRenderedBothSides']} pairs rendered "
                f"both sides, {probe['pairsOverThreshold']} over the threshold, "
                f"max Jaccard {probe['maxJaccard']}"
            )
    print(f"csv: {args.csv}")
    print(f"summary: {args.summary}")
    print(f"runtime: {runtime_minutes} minutes")
    for issue in issues[:10]:
        print(f"issue: {issue}")

    if args.fail_on_indexable and indexable_pairs:
        first = next(r for r in rows_out if r["indexable_a"] == "true" and r["indexable_b"] == "true")
        print(
            "FAIL: indexable pages render as duplicates. First pair: "
            f"/d/{first['page_a']} and /d/{first['page_b']} at {first['width']} px, "
            f"Jaccard {first['jaccard']}.",
            file=sys.stderr,
        )
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
