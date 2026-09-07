#!/usr/bin/env python3
"""Phase 4.7 — the slop draw.

`docs/specs/revamp-2026-09.md` §4.7 and `docs/specs/phase4-generators.md` §9 fix the draw: 60
rendered pages, 20 per tier, seeded; every sentence of a derived section checked against three
rules; the lead then reads the 60 pages for the logical-sequence test, which is a person's job and
is not attempted here. This script measures (a), (b) and (c) and lays the reading out.

The three rules, as written:

  (a) the sentence traces to a stored field or computed value. Each generator emits a provenance
      map (sentence -> field); `data/revamp/render-v5/provenance/batch-*.ndjson` is that map. A
      sentence the browser paints that the map does not carry fails (a) as untraceable, and a
      sentence whose every recorded trace fails to resolve against the file, field, question,
      seed, source record or computed derivation it names fails (a) as unresolved. Resolution is
      executed, never assumed: see `resolve_trace`.

  (b) after masking drug, target and number tokens, the sentence template appears on no more than
      0.5 % of pages corpus-wide. Corpus-wide is every page of
      `data/revamp/render-v5/text/batch-*.ndjson`, and the share is over pages carrying the
      template, not over occurrences: a template repeated four times on one page is one page.

      `docs/specs/phase4-generators.md` section 11 fixes what (b) is applied to: answer sentences,
      derived-section sentences, computed-section sentences and hub syntheses - the text whose
      words a generator chooses. It is not applied to a question heading, which is the corpus-20k
      template contract and is measured by that contract's own two lines (masked template <= 30 %,
      most-repeated unmasked string <= 0.5 %); nor to furniture, the fixed-vocabulary statements
      section 11 marks `data-furniture`; nor to the h1, which is the display name and masks to a
      bare `<drug>` on every page by construction. Every sentence (b) is not applied to is counted,
      by the reason it was excluded, in `report.json` under `failBExclusions`: the rule's scope is
      reported, never silently narrowed. Tests (a) and (c) apply to everything the page paints
      outside furniture.

  (c) no sentence is a label naming the narrative device: "the problem", "the lesson", "the
      takeaway", "the story".

What counts as a sentence. The provenance map marks each line `sentence` (prose this site composed)
or `row` (a revealed row: a register's own column label beside the value that register wrote). §4.7
is a rule about the site's prose, so the three checks run over `sentence` lines. `row` lines are
counted and reported beside them, never silently dropped.

The pages come from the local build, not from the render files: the draw is over what a browser
paints. The page list is read from the loaded database (`corpus_pages`), the pages are rendered in
headless Chromium at 1280 px with the navigation, the footer, the search control and the contents
rail hidden — the chrome `scripts/revamp/rendered_dup_check.py` hides, minus the supervision block,
which is content the lead must read — and the visible text of `main` is what the checks see.

No network access beyond the local build named by `--base-url`.

Usage:

    .venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3100 \
        --seed 20260906 --out-dir data/revamp/slop-draws/draw-1
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import random
import re
import subprocess
import sys
import time
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass, field as dataclass_field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TEXT_DIR = ROOT / "data/revamp/render-v5/text"
FIELDS_DIR = ROOT / "data/revamp/fields-v2"
QUESTIONS_DIR = ROOT / "data/revamp/questions-v2"
DERIVED_DIR = ROOT / "data/revamp/derived-v2"
BLOCKS_DIR = ROOT / "data/revamp/page-blocks"
CANONICAL = ROOT / "data/revamp/identity/canonical-v3.ndjson"
CANONICAL_V2 = ROOT / "data/revamp/identity/canonical-v2.ndjson"
INTERACTION_RULES = ROOT / "docs/specs/interaction-rules.md"
SOURCES_DIR = ROOT / "data/sources"
LEGAL_LOG = ROOT / "data/corpus-20k/legal/requests.log"

MODEL_DIRS = ("longevity", "clinical", "development")
DEFAULT_SEED = 20260906
DEFAULT_PER_TIER = 20
DEFAULT_WIDTH = 1280
DEFAULT_CONCURRENCY = 4
MAX_CONCURRENCY = 4
TEMPLATE_SHARE_LINE = 0.005
TRUNCATE_WORDS = 700
PAGES_MD_WORD_CAP = 60_000
FAILURES_LISTED_PER_PAGE = 10
NAV_TIMEOUT_MS = 45_000
SELECTOR_TIMEOUT_MS = 20_000
NAV_ATTEMPTS = 3
PRINT_ROWS = 50

USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LEGAL_AGENT = "Playwright chromium via scripts/revamp/slop_draw.py (own-site Phase 4.7 slop draw)"
LEGAL_NOTE = "browser navigation; the page's sub-resource requests are not itemised"

# The chrome `rendered_dup_check.py` hides inside `main`, minus `.cd-supervision`: the supervision
# block is a derived question block with provenance behind it and is part of what the lead reads.
EXCLUDE_SELECTOR = (
    "nav, footer, [role='search'], [role='combobox'], [role='listbox'], "
    "input, .cd-rail, .cd-contents, summary"
)

# Every disclosure is opened before the text is read. A closed `<details>` contributes nothing to
# `innerText`, so leaving them shut would hide the interaction lines and the trial rows the spec
# puts there (`docs/specs/phase4-generators.md` §7) from both the checks and the lead's reading.
# The `<summary>` controls are then hidden with the rest of the chrome: they are labels on a
# control, not sentences the site says.
EXTRACT_JS = """() => {
  const main = document.querySelector('main');
  if (!main) return null;
  for (const details of main.querySelectorAll('details')) details.open = true;
  for (const el of main.querySelectorAll(%s)) el.style.display = 'none';
  void main.offsetHeight;
  const heading = main.querySelector('h1');
  return {
    text: main.innerText || '',
    h1: heading ? (heading.innerText || '').trim() : null,
  };
}""" % json.dumps(EXCLUDE_SELECTOR)

# (c). A sentence *is* a device label when it names the narrative device and nothing else — the
# whole line, or the line's opening clause before a colon or dash.
DEVICE_LABELS = ("the problem", "the lesson", "the takeaway", "the story")
DEVICE_RE = re.compile(
    r"^(?:%s)\s*(?:[:—–-]|$)" % "|".join(re.escape(label) for label in DEVICE_LABELS),
    re.IGNORECASE,
)

# (b) masking.
TOKEN_RE = re.compile(r"[0-9A-Za-z][0-9A-Za-z'’\-\./]*")
DIGIT_RE = re.compile(r"\d")
# Words a name vocabulary can contain that are also ordinary English. Masking them as a drug would
# collapse unrelated templates onto one another, which would make the check *stricter* than §9
# writes it; they are left alone and the list is short and explicit.
NEVER_MASK = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is",
    "it", "its", "no", "not", "of", "on", "or", "than", "that", "the", "this", "to", "was", "were",
    "with", "when", "where", "which", "who", "why", "how", "each", "any", "all", "both", "one",
    "two", "three", "more", "most", "less", "least", "same", "other", "under", "over", "against",
    "checked", "found", "record", "records", "recorded", "page", "pages", "trial", "trials",
    "study", "studies", "source", "sources", "date", "dates", "status", "class", "classes",
}

KNOWN_SOURCE_NAMES = frozenset(
    p.name for p in SOURCES_DIR.iterdir() if p.is_dir()
) if SOURCES_DIR.is_dir() else frozenset()

# The nine additive-effect classes `docs/specs/phase4-generators.md` §4 fixes.
ADDITIVE_CLASSES = frozenset(
    {
        "serotonergic",
        "cns-depressant",
        "anticoagulant",
        "antiplatelet",
        "anticoagulant/antiplatelet",
        "hypotensive",
        "hypoglycaemic",
        "nephrotoxic",
        "hepatotoxic",
        "hyperkalaemic",
        "qt-prolonging",
    }
)

# Derivation notes the interaction engine writes beside a resolving trace. Each names how a value
# was computed; on its own it is not a stored field, so a sentence carrying only these does not
# pass (a). `resolve_trace` marks them `needs-sibling`.
SIBLING_DERIVATIONS = (
    "cue words matched",
    "enzyme or transporter named",
    "perpetrator role ",
    "victim role ",
    "both pages are members of the ",
)


def repo_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path.resolve())


def read_ndjson(path: Path):
    with path.open(encoding="utf-8", errors="replace") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


FOLD_QUOTES = str.maketrans({"\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"'})
# The template paints a small diamond before a source citation; the render text writes the citation
# without it. It is decoration, and it is removed from both sides before they are compared.
FOLD_DECORATION = "\u25c7"


def fold(text: str) -> str:
    """One comparable form for text the browser painted and text the render wrote.

    The two disagree in ways that carry no meaning: the template paints a register line as a label
    element above its value, so `Singapore: Not found …` arrives as two DOM lines; it paints a
    diamond before a source citation that the render text does not write; the page uses a
    typographic apostrophe where the render file uses a straight one; and `innerText` collapses
    whitespace its own way. Folding removes exactly those four differences — Unicode compatibility
    form, straight quotes, no diamond, no colons, whitespace collapsed — and nothing else, so a
    sentence that is genuinely absent from the page stays absent after folding.
    """
    text = unicodedata.normalize("NFKC", text).translate(FOLD_QUOTES)
    text = text.replace(FOLD_DECORATION, " ").replace(":", " ")
    return re.sub(r"\s+", " ", text).strip()


# ----------------------------------------------------------------------------------------------
# the page list, from the loaded database


@dataclass
class Page:
    key: str
    slug: str
    tier: int
    indexable: bool
    present_fields: int


def psql(database_url: str, sql: str) -> list[list[str]]:
    result = subprocess.run(
        ["psql", database_url, "-At", "-F", "\x1f", "-c", sql],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit(f"psql failed: {result.stderr.strip()}")
    rows = []
    for line in result.stdout.splitlines():
        if line:
            rows.append(line.split("\x1f"))
    return rows


def load_pages(database_url: str) -> list[Page]:
    rows = psql(
        database_url,
        'SELECT "key", slug, tier, indexable, present_field_count FROM corpus_pages',
    )
    pages = []
    for key, slug, tier, indexable, present in rows:
        pages.append(
            Page(
                key=key,
                slug=slug,
                tier=int(tier),
                indexable=indexable == "t",
                present_fields=int(present),
            )
        )
    return pages


MIGRATIONS_DIR = ROOT / "db/migrations"


def corpus_page_columns_from_migrations() -> set[str]:
    """`corpus_pages`'s columns as the migrations declare them, for a run with no database.

    `tests/test_render_safety.py` resolves the same traces this script resolves and has no database
    to ask, so the one other place the column list is written down is read instead. A column is
    declared once in the `CREATE TABLE` and once per `ALTER TABLE ... ADD COLUMN`.
    """
    columns: set[str] = set()
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(
            r'CREATE TABLE (?:IF NOT EXISTS )?"corpus_pages" \((.*?)\n\);', text, re.S
        ):
            for line in match.group(1).splitlines():
                name = re.match(r'\s*"([a-z0-9_]+)"', line)
                if name:
                    columns.add(name.group(1))
        for match in re.finditer(
            r'ALTER TABLE "corpus_pages" ADD COLUMN "([a-z0-9_]+)"', text
        ):
            columns.add(match.group(1))
    return columns


def corpus_page_columns(database_url: str | None) -> set[str]:
    if not database_url:
        return corpus_page_columns_from_migrations()
    rows = psql(
        database_url,
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'corpus_pages'",
    )
    return {row[0] for row in rows}


# ----------------------------------------------------------------------------------------------
# (b) — the masked template census over the whole corpus


ENGLISH_WORDS_PATH = Path("/usr/share/dict/words")
MAX_PHRASE_TOKENS = 8


def english_words() -> frozenset[str]:
    """The system word list, used only to stop an ordinary English word being read as a name.

    A recorded synonym set contains words like `orange`, `kingdom`, `standard` and `book`. Masking
    those as drug names would merge sentences that say different things — "United Kingdom" and
    "Orange Book" would become the same template — and the 0.5 % test would then be measuring the
    masker rather than the generator. A single token is masked as a name only when it is not an
    English word, or when it is one of *this page's* own recorded names, which is the case §9 is
    about: the same sentence with a name swapped in.
    """
    if not ENGLISH_WORDS_PATH.exists():
        return frozenset()
    return frozenset(
        word.strip().lower()
        for word in ENGLISH_WORDS_PATH.read_text(encoding="utf-8", errors="replace").splitlines()
        if word.strip()
    )


def name_tokens(name: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(name or "")]


@dataclass
class Vocabulary:
    drug_phrases: set[str]
    drug_singles: set[str]
    target_phrases: set[str]
    target_singles: set[str]
    page_names: dict[str, set[str]]
    counts: dict[str, int]


def build_name_vocabulary() -> Vocabulary:
    """Drug and target names, from the stored identity record and the stored `target` field."""
    words = english_words()
    drug_phrases: set[str] = set()
    drug_singles: set[str] = set()
    target_phrases: set[str] = set()
    target_singles: set[str] = set()
    page_names: dict[str, set[str]] = {}

    def register(name: str | None, phrases: set[str], singles: set[str],
                 page: set[str] | None = None) -> None:
        tokens = name_tokens(name or "")
        if not tokens or len(tokens) > MAX_PHRASE_TOKENS:
            return
        joined = " ".join(tokens)
        if len(tokens) > 1:
            phrases.add(joined)
            if page is not None:
                page.add(joined)
            return
        token = tokens[0]
        if len(token) < 3 or token in NEVER_MASK:
            return
        if page is not None:
            page.add(token)
        if token not in words and not DIGIT_RE.search(token):
            singles.add(token)

    canonical = CANONICAL if CANONICAL.exists() else CANONICAL_V2
    for row in read_ndjson(canonical):
        own: set[str] = set()
        register(row.get("displayName"), drug_phrases, drug_singles, own)
        for synonym in row.get("synonyms") or []:
            name = synonym.get("name") if isinstance(synonym, dict) else synonym
            register(name, drug_phrases, drug_singles, own)
        page_names[row["key"]] = own

    # A target's name sits at different depths in the two recorded shapes — ChEMBL mechanism
    # targets carry `prefName.prefName`, the merged Inxight/IUPHAR targets carry `targetName` — so
    # the value tree is walked and every string under a name-bearing key is taken.
    key_names = {"prefName", "targetName", "preferredName", "name", "label", "geneName"}

    def collect(value, page: set[str]) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                if key in key_names and isinstance(item, str):
                    register(item, target_phrases, target_singles, page)
                else:
                    collect(item, page)
        elif isinstance(value, list):
            for item in value:
                collect(item, page)

    for model in MODEL_DIRS:
        directory = FIELDS_DIR / model
        if not directory.is_dir():
            continue
        for path in sorted(directory.glob("batch-*.ndjson")):
            for row in read_ndjson(path):
                entry = (row.get("fields") or {}).get("target") or row.get("target")
                if isinstance(entry, dict) and entry.get("state") == "present":
                    collect(entry.get("value"), page_names.setdefault(row["key"], set()))

    return Vocabulary(
        drug_phrases=drug_phrases,
        drug_singles=drug_singles,
        target_phrases=target_phrases,
        target_singles=target_singles,
        page_names=page_names,
        counts={
            "drugNamePhrases": len(drug_phrases),
            "drugNameSingleTokens": len(drug_singles),
            "targetNamePhrases": len(target_phrases),
            "targetNameSingleTokens": len(target_singles),
            "englishWords": len(words),
        },
    )


def make_masker(vocabulary: Vocabulary):
    """`mask(sentence, key)` — the sentence with names and numbers replaced by their tag.

    Longest match first, up to eight tokens: a recorded multi-token name becomes one `<drug>` or
    `<target>` tag rather than a run of them. A single token is masked when it is a recorded name
    that is not an English word, or when it is one of the page's own recorded names. Anything
    carrying a digit becomes `<num>`, which covers counts, dates, registry identifiers and doses.
    """
    drug_phrases = vocabulary.drug_phrases
    target_phrases = vocabulary.target_phrases
    drug_singles = vocabulary.drug_singles
    target_singles = vocabulary.target_singles
    page_names = vocabulary.page_names

    def mask(sentence: str, key: str | None = None) -> str:
        own = page_names.get(key or "", frozenset())
        matches = list(TOKEN_RE.finditer(sentence))
        tokens = [m.group(0).lower() for m in matches]
        out: list[str] = []
        index = 0
        total = len(tokens)
        while index < total:
            taken = 0
            tag = None
            for length in range(min(MAX_PHRASE_TOKENS, total - index), 1, -1):
                phrase = " ".join(tokens[index : index + length])
                if phrase in drug_phrases or phrase in own:
                    tag, taken = "<drug>", length
                    break
                if phrase in target_phrases:
                    tag, taken = "<target>", length
                    break
            if tag is None:
                token = tokens[index]
                taken = 1
                if DIGIT_RE.search(token):
                    tag = "<num>"
                elif token in own or token in drug_singles:
                    tag = "<drug>"
                elif token in target_singles:
                    tag = "<target>"
                else:
                    tag = token
            out.append(tag)
            index += taken
        return " ".join(out)

    return mask


def text_dir_fingerprint(text_dir: Path) -> str:
    digest = hashlib.sha256()
    for path in sorted(text_dir.glob("batch-*.ndjson")):
        stat = path.stat()
        digest.update(f"{path.name}:{stat.st_size}:{int(stat.st_mtime)}\n".encode("utf-8"))
    return digest.hexdigest()


def template_census(text_dir: Path, mask, cache_path: Path, refresh: bool) -> tuple[dict[str, int], int]:
    """template -> number of corpus pages carrying it, over every page of the render."""
    fingerprint = text_dir_fingerprint(text_dir)
    if cache_path.exists() and not refresh:
        held = json.loads(cache_path.read_text(encoding="utf-8"))
        if held.get("fingerprint") == fingerprint:
            return held["counts"], held["pages"]

    counts: Counter[str] = Counter()
    pages = 0
    for path in sorted(text_dir.glob("batch-*.ndjson")):
        for row in read_ndjson(path):
            pages += 1
            seen: set[str] = set()
            for line in (row.get("proseText") or "").splitlines():
                line = norm(line)
                if line:
                    seen.add(mask(line, row["key"]))
            for template in seen:
                counts[template] += 1
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps({"fingerprint": fingerprint, "pages": pages, "counts": dict(counts)}),
        encoding="utf-8",
    )
    return dict(counts), pages


# ----------------------------------------------------------------------------------------------
# (a) — resolving one recorded trace


@dataclass
class PageInputs:
    """Everything one sampled page's traces are resolved against."""

    key: str
    fields: dict = dataclass_field(default_factory=dict)
    question_templates: set[str] = dataclass_field(default_factory=set)
    seeds: set[str] = dataclass_field(default_factory=set)
    identity: dict = dataclass_field(default_factory=dict)
    blocks: dict = dataclass_field(default_factory=dict)
    source_kinds: set[str] = dataclass_field(default_factory=set)
    ddi_records: set[str] = dataclass_field(default_factory=set)
    # A combination page's component lines were read off the components' own records, and their
    # traces name whose record each came from (`<path> on <component key>`, section 11). This is
    # component key -> that page's field entries, shared by every page in the draw.
    component_fields: dict = dataclass_field(default_factory=dict)


SOURCE_LIST_RE = re.compile(r'^\[(?:"[^"]*"(?:,\s*)?)+\]$')
FIELD_PATH_RE = re.compile(r"^fields\.([A-Za-z0-9_]+)(?:\.(.*))?$")
DDI_RE = re.compile(r"^(?:inxight record )?frdb:ddi:\d+$")
LEXICON_RE = re.compile(r"^lexicon surface '(?P<surface>[^']*)'(?P<tail>.*)$")
BAND_RULE_RE = re.compile(r"^band rule (?P<rule>[A-Za-z0-9\-]+) in (?P<spec>\S+)")
CLASS_RE = re.compile(r"^both pages are members of the (?P<klass>[a-z/\-]+) class$")
# The trace of an absence (docs/specs/phase4-generators.md section 11), as
# `scripts/revamp/build_blocks.py` writes it: the field paths that were searched, the register that
# was read, and the date it was read on. It resolves only if every path named really is absent from
# this page's own stored record - the claim is executed, not taken on trust.
# `<trace> · record K1:XXXXXXXX` - a value read off another page's record, which is how a
# combination page states each component's register line (section 3). The trace inside is an
# ordinary one of any class and is resolved against that record.
ON_RECORD_RE = re.compile(r"^(?P<trace>.+) · record (?P<key>\S.*)$")
SEARCHED_RE = re.compile(
    r"^searched and not recorded: (?P<paths>[^;]+); register: (?P<register>.+?) as of (?P<date>.+)$"
)


def walk_value(value, path: str) -> bool:
    """Does `path` (dotted, `[]` for "any element of this list") reach a recorded value?"""
    if not path:
        return True
    head, _, rest = path.partition(".")
    if head.endswith("[]"):
        head = head[:-2]
        if head:
            if not isinstance(value, dict) or head not in value:
                return False
            value = value[head]
        if not isinstance(value, list):
            return False
        return any(walk_value(item, rest) for item in value)
    if isinstance(value, list):
        return any(walk_value(item, path) for item in value)
    if not isinstance(value, dict) or head not in value:
        return False
    return walk_value(value[head], rest)


def field_path_resolves(page: PageInputs, path: str) -> bool:
    """Does `fields.<name>.<rest>` reach a recorded value on this page's own stored record?"""
    match = FIELD_PATH_RE.match(path.strip())
    if not match:
        return False
    entry = page.fields.get(match.group(1))
    if entry is None:
        return False
    return walk_value(entry, match.group(2) or "")


def resolve_trace(trace: str, page: PageInputs, corpus_keys: set[str], columns: set[str],
                  rule_ids: set[str]) -> tuple[str, bool]:
    """Return (class, resolved). `needs-sibling` classes resolve only beside another trace."""
    trace = trace.strip()
    if not trace:
        return "empty", False

    match = ON_RECORD_RE.match(trace)
    if match:
        # The component's own record, not this page's. Resolving it against the combination page
        # would look for a jurisdiction key that page never carried, which is the defect section 11
        # names. The trace inside is resolved by the ordinary rules, against that record.
        held = page.component_fields.get(match.group("key"))
        if held is None:
            return "another record: not read", False
        klass, ok = resolve_trace(
            match.group("trace"),
            PageInputs(key=match.group("key"), fields=held),
            corpus_keys,
            columns,
            rule_ids,
        )
        return f"{klass} on another record", ok

    match = SEARCHED_RE.match(trace)
    if match:
        # An absence resolves when what it claims is true of the record: every path it names is
        # missing, and it names the register that was read and the day it was read on.
        paths = [part.strip() for part in match.group("paths").split(",") if part.strip()]
        stated = bool(match.group("register").strip()) and bool(match.group("date").strip())
        return "absence", bool(paths) and stated and not any(
            field_path_resolves(page, path) for path in paths
        )

    match = FIELD_PATH_RE.match(trace)
    if match:
        name, rest = match.group(1), match.group(2) or ""
        entry = page.fields.get(name)
        if entry is None:
            return "field", False
        return "field", walk_value(entry, rest)

    if trace.startswith("page_questions."):
        return "question", trace.split(".", 1)[1] in page.question_templates

    if trace.startswith("seeds."):
        return "seed", trace.split(".", 1)[1] in page.seeds

    if trace.startswith("identity."):
        return "identity", trace.split(".", 1)[1] in page.identity

    if trace.startswith("corpus_pages."):
        column = trace.split(".", 1)[1].split()[0]
        return "page-column", column in columns

    if trace.startswith("data/"):
        candidate = ROOT / trace.split()[0]
        return "repository file", candidate.exists()

    if SOURCE_LIST_RE.match(trace):
        try:
            names = json.loads(trace)
        except json.JSONDecodeError:
            return "source list", False
        return "source list", bool(names) and all(
            name in KNOWN_SOURCE_NAMES or name in page.source_kinds for name in names
        )

    if DDI_RE.match(trace):
        record = trace.rsplit(" ", 1)[-1]
        return "inxight ddi record", record in page.ddi_records

    match = LEXICON_RE.match(trace)
    if match:
        tail = match.group("tail")
        if "the corpus holds no page for it" in tail:
            return "lexicon surface", True
        resolved = tail.strip()
        resolved = resolved.split("resolved to", 1)[-1].strip() if "resolved to" in tail else ""
        return "lexicon surface", resolved in corpus_keys

    match = BAND_RULE_RE.match(trace)
    if match:
        return "interaction rule", match.group("rule") in rule_ids

    match = CLASS_RE.match(trace)
    if match:
        return "additive class", match.group("klass") in ADDITIVE_CLASSES

    if trace.startswith("computed:"):
        return "computed value", len(trace) > len("computed:")

    head = trace.split()[0]
    if head in KNOWN_SOURCE_NAMES:
        return "source record", True

    for prefix in SIBLING_DERIVATIONS:
        if trace.startswith(prefix):
            return "needs-sibling derivation", False

    return "unrecognised", False


def load_page_inputs(keys: set[str], database_url: str | None = None) -> dict[str, PageInputs]:
    component_fields: dict = {}
    inputs = {key: PageInputs(key=key, component_fields=component_fields) for key in keys}

    # The blocks are read first, because a combination page's component lines name the component
    # pages whose records they were read off and those records have to be read in the same pass
    # over `fields-v2` as the pages' own.
    for path in sorted(BLOCKS_DIR.glob("batch-*.ndjson")):
        for row in read_ndjson(path):
            held = inputs.get(row.get("key"))
            if held is None:
                continue
            held.blocks = row
            # The curated interaction record ids, from the blocks the render read. The loader
            # writes the same ids into `page_interactions`, so a run with a database reads them
            # there as well and gets a superset; a run without one is not left unable to resolve a
            # curated line's trace.
            for tier in ((row.get("interactions") or {}).get("tiers") or {}).values():
                for line in list(tier.get("inline") or []) + list(tier.get("disclosed") or []):
                    source_id = line.get("sourceRecordId")
                    if isinstance(source_id, str) and source_id:
                        held.ddi_records.add(source_id)
            for line in row.get("registration") or []:
                for trace in line.get("provenance") or []:
                    match = ON_RECORD_RE.match(str(trace))
                    if match:
                        component_fields.setdefault(match.group("key"), {})

    wanted = keys | set(component_fields)
    for model in MODEL_DIRS:
        directory = FIELDS_DIR / model
        if not directory.is_dir():
            continue
        for path in sorted(directory.glob("batch-*.ndjson")):
            for row in read_ndjson(path):
                if row["key"] not in wanted:
                    continue
                entries = dict(row.get("fields") or {})
                for name, entry in row.items():
                    if name != "fields" and isinstance(entry, dict) and "state" in entry:
                        entries.setdefault(name, entry)
                if row["key"] in component_fields:
                    component_fields[row["key"]] = entries
                held = inputs.get(row["key"])
                if held is None:
                    continue
                held.fields = entries
                for entry in entries.values():
                    source = entry.get("source") if isinstance(entry, dict) else None
                    if isinstance(source, str):
                        held.source_kinds.add(source)
                    elif isinstance(source, dict) and isinstance(source.get("kind"), str):
                        held.source_kinds.add(source["kind"])
                    elif isinstance(source, list):
                        for item in source:
                            if isinstance(item, str):
                                held.source_kinds.add(item)
                            elif isinstance(item, dict) and isinstance(item.get("kind"), str):
                                held.source_kinds.add(item["kind"])

    for path in sorted(QUESTIONS_DIR.glob("batch-*.ndjson")):
        for row in read_ndjson(path):
            held = inputs.get(row["key"])
            if held is None:
                continue
            for question in row.get("questions") or []:
                if question.get("template"):
                    held.question_templates.add(question["template"])
                if question.get("block"):
                    held.question_templates.add(question["block"])

    for path in sorted(DERIVED_DIR.glob("seed-*.ndjson")):
        seed_id = "seed" + path.name.split("-")[1]
        for row in read_ndjson(path):
            held = inputs.get(row.get("key"))
            if held is not None:
                held.seeds.add(seed_id)
                held.seeds.add(seed_id.replace("seed0", "seed"))

    canonical = CANONICAL if CANONICAL.exists() else CANONICAL_V2
    for row in read_ndjson(canonical):
        held = inputs.get(row["key"])
        if held is not None:
            held.identity = row

    if database_url:
        rows = psql(
            database_url,
            'SELECT "key", source_record_id FROM page_interactions '
            "WHERE source_record_id IS NOT NULL",
        )
        for key, source_id in rows:
            held = inputs.get(key)
            if held is not None:
                held.ddi_records.add(source_id)

    return inputs


def interaction_rule_ids() -> set[str]:
    """The rule ids `docs/specs/interaction-rules.md` defines, and the families they belong to.

    A rule id is `A1`, `C1-cyp-inhibitor-substrate`, `C3-additive-hypotensive` and so on; a trace
    names either the full id or its family (`band rule C3`). ATC classification codes such as
    `C09AA` appear in the same document and are not rule ids, so the pattern requires either a
    bare family letter-and-digit or a family followed by a lower-case hyphenated name.
    """
    if not INTERACTION_RULES.exists():
        return set()
    text = INTERACTION_RULES.read_text(encoding="utf-8")
    full = set(re.findall(r"\b([ABC]\d-[a-z][a-z0-9]*(?:-[a-z0-9]+)*)\b", text))
    return full | {rule.split("-", 1)[0] for rule in full}


# ----------------------------------------------------------------------------------------------
# rendering the sampled pages


@dataclass
class RenderedPage:
    key: str
    slug: str
    tier: int
    url: str
    status: int
    text: str
    h1: str | None


async def render_pages(pages: list[Page], base_url: str, concurrency: int,
                       issues: list[str]) -> list[RenderedPage]:
    from playwright.async_api import async_playwright

    LEGAL_LOG.parent.mkdir(parents=True, exist_ok=True)
    log = LEGAL_LOG.open("a", encoding="utf-8")
    queue: asyncio.Queue[Page] = asyncio.Queue()
    for page in pages:
        queue.put_nowait(page)
    out: list[RenderedPage] = []
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
                    except Exception as error:
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
                        issues.append(f"{url} answered {status}; it is not in the draw")
                    else:
                        out.append(
                            RenderedPage(
                                key=target.key,
                                slug=target.slug,
                                tier=target.tier,
                                url=url,
                                status=status,
                                text=payload["text"],
                                h1=payload["h1"],
                            )
                        )
                    if len(out) % 10 == 0 and out:
                        print(f"  rendered {len(out)}/{len(pages)}", flush=True)
        finally:
            await context.close()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            await asyncio.gather(
                *(worker(browser) for _ in range(max(1, min(concurrency, MAX_CONCURRENCY))))
            )
        finally:
            await browser.close()
    log.close()
    order = {page.key: index for index, page in enumerate(pages)}
    out.sort(key=lambda r: order[r.key])
    return out


# ----------------------------------------------------------------------------------------------
# classifying a line into the block it belongs to


REGISTER_LINE_RE = re.compile(
    r"^(Singapore|United States|Australia|United Kingdom|European Union|Japan|Canada|"
    r"Other registers)\b"
)


def block_of(sentence: str, traces: list[str]) -> str:
    """Which block of `docs/specs/phase4-generators.md` §1 the sentence belongs to.

    The line's own shape decides first, because a question block reads regulatory fields too and a
    trace naming `fields.regulatory` does not make a sentence a register line.
    """
    joined = " ".join(traces)
    if REGISTER_LINE_RE.match(sentence):
        return "registration"
    if sentence.startswith("No interaction found in") or "checked-sources.parquet" in joined:
        return "interactions: checked-sources statement"
    if sentence.startswith(("Label-documented", "Curated", "Predicted from mechanism")):
        return "interactions"
    if "No US patent or exclusivity data on record" in sentence or "orange-purple-book" in joined:
        return "generic and patent"
    if any(trace.startswith("page_questions.") for trace in traces):
        return "question block"
    if any(trace.startswith("seeds.") for trace in traces):
        return "derived seed"
    if "tier3-sections" in joined or "RDKit" in joined or "pChEMBL" in joined:
        return "computed section"
    if "hubs" in joined or any(trace.startswith("hub.") for trace in traces):
        return "hub synthesis"
    if any(trace.startswith("identity.") for trace in traces) or "display-names" in joined:
        return "header"
    if "fields.regulatory" in joined:
        return "registration"
    return "other"


# (b)'s scope, as section 11 fixes it: the blocks whose wording a generator chooses.
#
# `question block` is the answer, `derived seed` the derived sections, `computed section` the Tier 3
# computed sentences and `hub synthesis` the H1-H7 sentences of a hub page. Everything else on the
# page is either a statement the spec fixes verbatim (the register lines, the checked-sources
# statement, the no-record patent line), a recorded name (the h1), or furniture.
TEMPLATE_TEST_BLOCKS = frozenset(
    {"question block", "derived seed", "computed section", "hub synthesis"}
)


def template_test_applies(entry: dict, block: str) -> tuple[bool, str]:
    """Does the template test apply to this sentence, and if not, under which exclusion?

    The order is the order section 11 states the exclusions in, and the first that holds is the one
    reported, so a furniture line that is also outside the four blocks is counted once.
    """
    if entry.get("heading") is True:
        return False, "question heading (the corpus-20k template contract)"
    if entry.get("furniture") is True:
        return False, "furniture"
    if block == "header":
        return False, "the h1 and the header line"
    if block not in TEMPLATE_TEST_BLOCKS:
        return False, f"outside the sentences the generator words: {block}"
    return True, ""


# ----------------------------------------------------------------------------------------------
# the report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:3000", help="the local build")
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED, help="seeds the draw")
    parser.add_argument("--per-tier", type=int, default=DEFAULT_PER_TIER)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "data/revamp/slop-draws/draw-1")
    parser.add_argument("--text-dir", type=Path, default=TEXT_DIR)
    parser.add_argument(
        "--provenance-dir",
        type=Path,
        default=None,
        help="the provenance map written beside --text-dir by page_text_v5.ts; defaults to the "
             "`provenance` directory of the same render, so the sentences checked and the traces "
             "they are checked against always come from one render",
    )
    parser.add_argument("--concurrency", type=int, default=DEFAULT_CONCURRENCY)
    parser.add_argument("--truncate-words", type=int, default=TRUNCATE_WORDS)
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--refresh-census", action="store_true")
    args = parser.parse_args(argv)

    if not args.database_url:
        raise SystemExit("DATABASE_URL is required: the draw reads the loaded build's page list.")

    started = time.time()
    base_url = args.base_url.rstrip("/")
    out_dir: Path = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    issues: list[str] = []

    # ---- the draw ---------------------------------------------------------------------------
    pages = load_pages(args.database_url)
    by_tier: dict[int, list[Page]] = defaultdict(list)
    for page in pages:
        by_tier[page.tier].append(page)
    rng = random.Random(args.seed)
    drawn: list[Page] = []
    for tier in (1, 2, 3):
        pool = sorted(by_tier.get(tier, []), key=lambda p: p.key)
        if len(pool) < args.per_tier:
            issues.append(
                f"tier {tier} holds {len(pool)} loaded pages, fewer than the {args.per_tier} the "
                "draw asks for; every page of the tier is in the draw"
            )
            drawn.extend(pool)
            continue
        drawn.extend(rng.sample(pool, args.per_tier))
    print(f"drawn: {len(drawn)} pages ({', '.join(str(len(by_tier[t])) for t in (1, 2, 3))} loaded)")

    keys = {page.key for page in drawn}

    # ---- the corpus-wide template census ------------------------------------------------------
    print("building the name vocabulary and the corpus-wide template census …", flush=True)
    vocabulary = build_name_vocabulary()
    mask = make_masker(vocabulary)
    census, census_pages = template_census(
        args.text_dir,
        mask,
        ROOT / "data/revamp/slop-draws/template-census.json",
        args.refresh_census,
    )
    share_limit = TEMPLATE_SHARE_LINE * census_pages
    print(
        f"census: {len(census)} templates over {census_pages} pages; a template on more than "
        f"{share_limit:.1f} pages fails (b)"
    )

    # ---- provenance and inputs for the drawn pages --------------------------------------------
    provenance: dict[str, list[dict]] = {}
    render_keys: set[str] = set()
    provenance_dir: Path = args.provenance_dir or (args.text_dir.parent / "provenance")
    for path in sorted(provenance_dir.glob("batch-*.ndjson")):
        for row in read_ndjson(path):
            render_keys.add(row["key"])
            if row["key"] in keys:
                provenance[row["key"]] = row["provenance"]
    loaded_keys = {page.key for page in pages}
    without_render = sorted(loaded_keys - render_keys)
    unloaded_render = sorted(render_keys - loaded_keys)
    if without_render:
        issues.append(
            f"{len(without_render)} loaded pages have no record in {repo_path(provenance_dir)}; "
            f"the first is {without_render[0]}. A page in the draw with no provenance record is "
            "reported as one page-level failure, not as a failure per line."
        )
    if unloaded_render:
        issues.append(
            f"{len(unloaded_render)} pages in {repo_path(provenance_dir)} are not in the loaded "
            f"corpus; the first is {unloaded_render[0]}"
        )
    rendered_text: dict[str, dict] = {}
    for path in sorted(args.text_dir.glob("batch-*.ndjson")):
        for row in read_ndjson(path):
            if row["key"] in keys:
                rendered_text[row["key"]] = row

    inputs = load_page_inputs(keys, args.database_url)
    columns = corpus_page_columns(args.database_url)
    rule_ids = interaction_rule_ids()
    corpus_keys = {page.key for page in pages}

    # ---- render the drawn pages ---------------------------------------------------------------
    print(f"rendering {len(drawn)} pages from {base_url} …", flush=True)
    rendered = asyncio.run(render_pages(drawn, base_url, args.concurrency, issues))
    print(f"rendered {len(rendered)} pages")

    # ---- the checks ---------------------------------------------------------------------------
    page_reports: list[dict] = []
    totals = Counter()
    trace_classes = Counter()
    fail_b_by_block = Counter()
    # Section 11: every sentence the template test was not applied to, by the exclusion that
    # removed it, so the scope of the rule is on the report beside its failures.
    fail_b_exclusions = Counter()
    fail_b_exclusions_by_block = Counter()
    fail_b_examples: dict[str, dict] = {}

    for page in rendered:
        if page.key not in provenance:
            page_reports.append(
                {
                    "key": page.key,
                    "slug": page.slug,
                    "tier": page.tier,
                    "url": page.url,
                    "h1": page.h1,
                    "sentences": 0,
                    "failures": [
                        {
                            "check": "a",
                            "sentence": page.h1 or page.slug,
                            "block": "whole page",
                            "reason": "the render's provenance map carries no record for this "
                                      "page, so no sentence on it traces to anything",
                        }
                    ],
                }
            )
            totals["fail a"] += 1
            totals["pages with no provenance record"] += 1
            continue

        entries = provenance[page.key]
        painted = fold(page.text)
        held = rendered_text.get(page.key, {})
        render_text = fold(held.get("text") or "")

        failures: list[dict] = []
        counted = 0
        for entry in entries:
            sentence = norm(entry["sentence"])
            if entry.get("kind") != "sentence":
                totals["row lines"] += 1
                continue
            counted += 1
            traces = entry.get("fields") or []
            block = block_of(sentence, traces)

            # The sentence has to be on the page the browser painted, or the map describes a page
            # nobody sees. This is not one of §4.7's three checks; it is what makes the draw a draw
            # of rendered pages, and it is counted and reported on its own.
            if fold(sentence) not in painted:
                totals["sentences not painted"] += 1
                failures.append(
                    {
                        "check": "rendered",
                        "sentence": sentence,
                        "block": block,
                        "reason": "the provenance map carries this sentence but the rendered page "
                                  "does not paint it",
                    }
                )

            # (a)
            resolutions = [
                resolve_trace(trace, inputs[page.key], corpus_keys, columns, rule_ids)
                for trace in traces
            ]
            for klass, ok in resolutions:
                trace_classes[f"{klass}: {'resolved' if ok else 'unresolved'}"] += 1
            unrecognised = [
                traces[index]
                for index, (klass, _ok) in enumerate(resolutions)
                if klass == "unrecognised"
            ]
            if not traces:
                failures.append({"check": "a", "sentence": sentence, "block": block,
                                 "reason": "the provenance entry names no field"})
            elif unrecognised:
                failures.append({"check": "a", "sentence": sentence, "block": block,
                                 "reason": f"trace of no recognised class: {unrecognised[0]}"})
            elif not any(ok for _klass, ok in resolutions):
                failures.append({"check": "a", "sentence": sentence, "block": block,
                                 "reason": f"no recorded trace resolved: {traces[0]}"})

            # (b), over the sentences section 11 puts in its scope; the rest are counted here
            # as exclusions and reported.
            applies, exclusion = template_test_applies(entry, block)
            if not applies:
                fail_b_exclusions[exclusion] += 1
                fail_b_exclusions_by_block[f"{exclusion} · {block}"] += 1
            template = mask(sentence, page.key)
            carrying = census.get(template, 0)
            if applies and carrying > share_limit:
                share = carrying / census_pages
                failures.append(
                    {
                        "check": "b",
                        "sentence": sentence,
                        "block": block,
                        "template": template,
                        "pagesCarrying": carrying,
                        "share": round(share, 6),
                        "reason": f"the masked template is on {carrying} pages ({share:.2%})",
                    }
                )
                fail_b_by_block[block] += 1
                fail_b_examples.setdefault(
                    block, {"template": template, "pagesCarrying": carrying, "sentence": sentence}
                )

            # (c)
            if DEVICE_RE.match(sentence):
                failures.append({"check": "c", "sentence": sentence, "block": block,
                                 "reason": "the sentence is a label naming the narrative device"})

        # Painted prose the render does not account for. A line of five words or more that neither
        # appears in the render's own text nor carries one of the map's sentences inside it is text
        # on the page that no recorded stage wrote. It is reported as a rendering divergence rather
        # than as an (a) failure: (a) is about whether a recorded sentence traces to a stored
        # value, and this is about the page and the render disagreeing.
        long_sentences = [
            fold(entry["sentence"])
            for entry in entries
            if len(entry["sentence"].split()) >= 6
        ]
        unaccounted: list[str] = []
        for line in page.text.splitlines():
            line = norm(line)
            if len(line.split()) < 5:
                continue
            folded = fold(line)
            if not folded or folded in render_text:
                continue
            if any(candidate and candidate in folded for candidate in long_sentences):
                continue
            unaccounted.append(line)
        if unaccounted:
            totals["painted lines with no render record"] += len(unaccounted)
            for line in unaccounted[:5]:
                failures.append(
                    {
                        "check": "rendered",
                        "sentence": line,
                        "block": "painted line with no render record",
                        "reason": "the browser paints this line and neither the render text nor "
                                  "the provenance map carries it",
                    }
                )

        totals["sentences"] += counted
        for failure in failures:
            totals[f"fail {failure['check']}"] += 1
        page_reports.append(
            {
                "key": page.key,
                "slug": page.slug,
                "tier": page.tier,
                "url": page.url,
                "h1": page.h1,
                "sentences": counted,
                "paintedLinesWithNoRenderRecord": len(unaccounted),
                "failures": failures,
            }
        )

    # ---- report.json ---------------------------------------------------------------------------
    report = {
        "generated": "scripts/revamp/slop_draw.py",
        "spec": ["docs/specs/revamp-2026-09.md#phase-4", "docs/specs/phase4-generators.md#9"],
        "baseUrl": base_url,
        "seed": args.seed,
        "perTier": args.per_tier,
        "drawn": len(drawn),
        "rendered": len(rendered),
        "width": DEFAULT_WIDTH,
        "textDir": repo_path(args.text_dir),
        "census": {
            "pages": census_pages,
            "templates": len(census),
            "line": TEMPLATE_SHARE_LINE,
            "pagesLimit": share_limit,
            "maskedNames": vocabulary.counts,
        },
        "sentences": totals["sentences"],
        "rowLines": totals["row lines"],
        "sentencesNotPainted": totals["sentences not painted"],
        "paintedLinesWithNoRenderRecord": totals["painted lines with no render record"],
        "failA": totals["fail a"],
        "failB": totals["fail b"],
        "failC": totals["fail c"],
        "failRendered": totals["fail rendered"],
        "failABreakdown": {
            "pagesWithNoProvenanceRecord": totals["pages with no provenance record"],
        },
        "renderDivergenceNote": (
            "`failRendered` counts the two directions in which the page a browser paints and "
            "`data/revamp/render-v5` disagree: a sentence the provenance map records that the page "
            "does not paint, and a line of five words or more the page paints that the render "
            "neither writes nor carries inside one of its sentences. It is not one of §4.7's three "
            "checks. It matters because the thresholds and the template census are measured on the "
            "render text, so where the two disagree those measurements describe text no reader "
            "sees."
        ),
        "loadedPagesWithNoRenderRecord": len(without_render),
        "renderRecordsNotLoaded": len(unloaded_render),
        "failBByBlock": dict(fail_b_by_block.most_common()),
        "failBExamplePerBlock": fail_b_examples,
        "failBScope": sorted(TEMPLATE_TEST_BLOCKS),
        "failBExclusions": dict(fail_b_exclusions.most_common()),
        "failBExclusionsByBlock": dict(fail_b_exclusions_by_block.most_common()),
        "failBScopeNote": (
            "docs/specs/phase4-generators.md §11 scopes the template test to answer sentences, "
            "derived-section sentences, computed-section sentences and hub syntheses. A question "
            "heading is the corpus-20k template contract and is measured by that contract's own "
            "two lines; furniture is the fixed-vocabulary absence statements §11 marks "
            "data-furniture; the h1 is the display name and masks to a bare <drug> on every page "
            "by construction; and the register lines (§3), the checked-sources statement (§4) and "
            "the no-record patent line (§5) are wordings the spec fixes rather than a generator "
            "choosing them. `failB` is the rule over its scope; `failBExclusions` counts every "
            "sentence it was not applied to, by the exclusion that removed it, so the scope is on "
            "the report beside the result."
        ),
        "traceClasses": dict(trace_classes.most_common()),
        "pages": page_reports,
        "issues": issues,
        "elapsedSeconds": round(time.time() - started, 1),
    }
    # ---- pages.md ------------------------------------------------------------------------------
    lines: list[str] = []
    lines.append("# Slop draw 1 — the 60 pages, as the local build painted them\n")
    lines.append(
        f"Seed {args.seed}, {args.per_tier} pages per tier, rendered at {DEFAULT_WIDTH} px from "
        f"`{base_url}`. Machine-readable twin: `report.json`.\n"
    )
    lines.append(
        "Each page below lists what checks (a), (b) and (c) found first, then the visible text of "
        f"`main` with the navigation, the footer, the search control and the contents rail hidden, "
        f"truncated at {args.truncate_words} words. The logical-sequence test — consecutive claims "
        "must follow from each other — is the lead's reading, not a measurement, and nothing here "
        "attempts it.\n"
    )
    for entry, page in zip(page_reports, rendered):
        lines.append(f"\n---\n\n## Tier {entry['tier']} — {entry['h1'] or entry['slug']}\n")
        lines.append(f"`{entry['key']}` · `{entry['url']}` · {entry['sentences']} sentences\n")
        if entry["failures"]:
            lines.append(f"\n**Failures ({len(entry['failures'])})**\n\n")
            for failure in entry["failures"][:FAILURES_LISTED_PER_PAGE]:
                quoted = failure["sentence"]
                if len(quoted) > 140:
                    quoted = quoted[:140].rstrip() + " …"
                lines.append(f"- **({failure['check']})** {failure['reason']} — “{quoted}”\n")
            remaining = len(entry["failures"]) - FAILURES_LISTED_PER_PAGE
            if remaining > 0:
                lines.append(
                    f"- … and {remaining} more on this page; every one is in `report.json`.\n"
                )
        else:
            lines.append("\n**No failure recorded by checks (a), (b) or (c).**\n")
        lines.append("\n```\n")
        # The rendered line breaks carry the block structure the lead reads, so the truncation
        # runs over the line stream and keeps whole lines.
        total_words = len(page.text.split())
        kept: list[str] = []
        budget = args.truncate_words
        for line in page.text.splitlines():
            count = len(line.split())
            if count > budget:
                break
            kept.append(line)
            budget -= count
        body = "\n".join(kept)
        if len(kept) < len(page.text.splitlines()):
            body += (
                f"\n[truncated at {args.truncate_words} words; the page holds {total_words}]"
            )
        lines.append(body + "\n```\n")
    body = "".join(lines)
    actual_words = len(body.split())
    if actual_words > PAGES_MD_WORD_CAP:
        issues.append(
            f"pages.md holds {actual_words} words, over the {PAGES_MD_WORD_CAP} cap"
        )
    report["pagesMarkdownWords"] = actual_words
    (out_dir / "report.json").write_text(json.dumps(report, indent=1) + "\n", encoding="utf-8")
    (out_dir / "pages.md").write_text(body, encoding="utf-8")

    # ---- printed summary, at most 50 rows -------------------------------------------------------
    print(f"\nsentences {totals['sentences']}  rows {totals['row lines']}  "
          f"not painted {totals['sentences not painted']}  "
          f"painted lines with no render record {totals['painted lines with no render record']}")
    print(f"fail (a) {totals['fail a']}  fail (b) {totals['fail b']}  fail (c) {totals['fail c']}")
    print(f"fail (b) scope: {', '.join(report['failBScope'])}")
    for reason, count in report["failBExclusions"].items():
        print(f"  (b) not applied to {count} sentences: {reason}")
    rows_left = PRINT_ROWS

    def show(line: str) -> None:
        nonlocal rows_left
        if rows_left > 0:
            print(line)
            rows_left -= 1

    for block, count in fail_b_by_block.most_common(10):
        show(f"  (b) {block}: {count}")
    reasons: Counter[str] = Counter()
    for entry in page_reports:
        for failure in entry["failures"]:
            if failure["check"] in ("a", "c"):
                reasons[f"({failure['check']}) {failure['block']}: {failure['reason'][:80]}"] += 1
    for reason, count in reasons.most_common(20):
        show(f"  {count}x {reason}")
    for issue in issues[:10]:
        show(f"  issue: {issue[:150]}")
    if rows_left <= 0:
        print("  … the rest is in report.json")
    print(f"\nreport -> {repo_path(out_dir / 'report.json')}")
    print(f"pages  -> {repo_path(out_dir / 'pages.md')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
