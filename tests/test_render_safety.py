"""Phase 4 rendering rules, checked over every rendered page.

`docs/specs/revamp-2026-09.md` 4.1 names this file: the interaction rendering rules "are
unit-tested in `tests/test_render_safety.py`". It reads what the renderer actually wrote —
`data/revamp/render-v7/{text-with-furniture,provenance-with-furniture}/batch-*.ndjson`, the page as
a browser paints it — rather than a fixture, because a rule that holds on a fixture and not on the
corpus is not a rule.

Run it with the corpus environment:

    .venv-corpus/bin/python -m pytest tests/test_render_safety.py

What is asserted, and where each rule comes from:

  1. Every interaction line begins with its tier in words (§4: "the tier label is a visible
     element, not a class").
  2. Every Tier C line begins "Predicted from mechanism:" and carries a derivation — the inputs
     named verbatim, not a bare verdict.
  3. The words "safe", "no interaction" standing alone, and "safe to combine" never appear in
     generated text (Operating Rule 9). Verbatim source quotations are excluded from this scan and
     are separately proved to be quotations: a label's own sentence is the label's words, is shown
     inside quotation marks with its record id and effective date, and is not text this site wrote.
     The sanctioned statement "No interaction found in … as of …" is the wording Operating Rule 9
     prescribes and is required, not forbidden.
  4. Every page renders either an interaction line or the "No interaction found in … as of …"
     statement. A page that renders neither would leave a reader unable to tell whether nothing was
     found or nothing was looked for.
  5. A page carrying a controlled-substance schedule renders no dose, timing, route, frequency or
     combination-protocol sentence.
  6. An unknown register reads "Not found in … as of …" — never a blank, and never silence.
  7. No raw class, seed or rule identifier reaches the rendered text (§7).
  8. Every rendered sentence has a provenance entry naming the stored field or computed value it
     came from (4.7(a)).
  9. Every one of those traces resolves — executed, not assumed (§11). A trace naming a stored
     field must reach a recorded value on that page's own record, and the trace of an absence must
     name paths the record really does not carry, beside the register that was read and the date it
     was read on. The absence rule runs over all 28,832 pages; the whole resolver, over every class
     of trace the corpus uses, runs over a seeded, tier-stratified sample.
 10. The render and the page agree (§11): the text `page_text_v5 --with-furniture` writes is the
     text a browser paints, in the same order. The comparison itself is
     `scripts/revamp/dom_parity.py`, which needs a local build; this file asserts its result.
"""

from __future__ import annotations

import json
import os
import random
import re
import sys
from collections import Counter
from typing import Any, Iterator

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RENDER_DIR = os.path.join(ROOT, "data", "revamp", "render-v7")
# §11: the ruler reads the page without its furniture and these rules read it with, because they
# are rules about what a reader meets. `Not found in [register] as of [date]` is furniture and is
# still on the page; a test reading the furniture-free text would assert that the page had stopped
# saying something it says. `page_text_v5 --with-furniture` writes the painted text beside the
# furniture-free one, and where it has not been written the furniture-free render is read and the
# furniture rules are exercised on whatever it carries.
FURNITURE_TEXT_DIR = os.path.join(RENDER_DIR, "text-with-furniture")
FURNITURE_PROVENANCE_DIR = os.path.join(RENDER_DIR, "provenance-with-furniture")
PAINTED = os.path.isdir(FURNITURE_TEXT_DIR)
TEXT_DIR = FURNITURE_TEXT_DIR if PAINTED else os.path.join(RENDER_DIR, "text")
PROVENANCE_DIR = (
    FURNITURE_PROVENANCE_DIR if PAINTED else os.path.join(RENDER_DIR, "provenance")
)
# The furniture-free text, which the ruler reads and from which every furniture line is absent.
FREE_TEXT_DIR = os.path.join(RENDER_DIR, "text")
BLOCKS_DIR = os.path.join(ROOT, "data", "revamp", "page-blocks")
FIELDS_DIR = os.path.join(ROOT, "data", "revamp", "fields-v2")
DOM_PARITY = os.path.join(RENDER_DIR, "dom-parity.json")

# §12: the one answer that is an absence statement. It is furniture wherever it renders, the
# question block included, so it leaves the ruler, the duplicate check skips it and the slop draw's
# template test does not apply to it — and the page still says it.
CLASSIFICATION_ABSENCE = "No regulator classification is recorded for"

# The resolver is `scripts/revamp/slop_draw.py`'s, imported rather than copied: check 4.7(a) and
# this file must agree about what "resolves" means, and two implementations of that would drift.
sys.path.insert(0, os.path.join(ROOT, "scripts", "revamp"))
import slop_draw  # noqa: E402  (the path is set immediately above)

# How many pages the whole resolver is run over, and the seed that draws them. The absence rule of
# §11 is checked on every page; running every class of trace over every page would read the four
# input directories the draw reads for all 28,832 pages, so that half is a stratified sample.
RESOLVER_SAMPLE = int(os.environ.get("RENDER_SAFETY_SAMPLE", "1000"))
RESOLVER_SEED = 20260907

TIER_LABELS = ("Label-documented", "Curated", "Predicted from mechanism")

# The interaction line's own opening, so a line can be recognised without reading the stored tier.
TIER_LINE = re.compile(r"^(Label-documented|Curated|Predicted from mechanism)\b")

# Operating Rule 9's forbidden wordings. "no interaction" is forbidden on its own and required in
# the exact phrase "no interaction found in", which is why the lookahead is there.
FORBIDDEN = (
    ("safe to combine", re.compile(r"safe to combine", re.IGNORECASE)),
    # The forbidden word is "safe", not "safety": a registry stop reason is the word "safety" and a
    # trial's own primary outcome is a safety measure. Neither is this site calling anything safe.
    ("safe", re.compile(r"\bsafe(?:ly)?\b", re.IGNORECASE)),
    ("no interaction", re.compile(r"\bno interactions?\b(?! found in )", re.IGNORECASE)),
)

# §7: a storage token never reaches prose. `S1`-`S11` are the suppression classes, `seed 4` and
# `seed-04` the derived seeds, and `C1-cyp-inhibitor-substrate` and its siblings the interaction
# rules.
#
# The class pattern is written for how a class token is USED, not for its bare shape, because the
# bare shape is also a compound's name ("Virginiamycin S1", "C-188-9"), a protein's ("Ribosomal
# protein S6 kinase") and an antigen's ("PRE-S1 PROTEIN"). A class token reaches prose one of two
# ways: named as a class ("Classification S2 is recorded for X", the defect §7 was written about),
# or listed with its siblings ("S2, S6"). Both are caught; neither shape is a substance's name.
RAW_TOKENS = (
    (
        "suppression class named as a class",
        re.compile(
            r"\b(?:class|classification|classified|code|category)\b[^.]{0,24}?\bS(?:[1-9]|1[01])\b",
            re.IGNORECASE,
        ),
    ),
    (
        "suppression class list",
        re.compile(r"\bS(?:[1-9]|1[01])\b(?:\s*(?:,|;| and )\s*S(?:[1-9]|1[01])\b)+"),
    ),
    ("seed identifier", re.compile(r"\bseed[\s\-_]?\d+\b", re.IGNORECASE)),
    (
        "interaction rule id",
        re.compile(r"\b(?:A-label-statement|B-inxight-frdb|C[123]-[a-z][A-Za-z0-9-]*)\b"),
    ),
)

# §4 and Operating Rule 9: a controlled substance's page carries regulatory status, pharmacology,
# mechanism and interaction evidence, and never a dose, a schedule of administration, a route or a
# combination protocol. These are the shapes such a sentence takes in the corpus's own vocabulary.
DOSE_SHAPES = (
    ("a dose quantity", re.compile(r"\b\d+(?:\.\d+)?\s?(?:mg|mcg|µg|g|ml|iu|units?)\b(?!\w)", re.IGNORECASE)),
    ("a dosing frequency", re.compile(r"\b(?:once|twice|three times|four times)\s+(?:a|per)\s+(?:day|week|month)\b", re.IGNORECASE)),
    ("a dosing frequency", re.compile(r"\b(?:daily|nightly|hourly)\s+dos(?:e|ing|age)\b", re.IGNORECASE)),
    ("a dosing instruction", re.compile(r"\bdos(?:e|es|ing|age)\s+(?:of|adjust|regimen|schedule|escalat|titrat|reduc|increas)", re.IGNORECASE)),
    ("an administration route", re.compile(r"\b(?:administered|taken|given|injected|infused)\s+(?:orally|intravenously|subcutaneously|intramuscularly|sublingually|by mouth)\b", re.IGNORECASE)),
    ("a combination protocol", re.compile(r"\b(?:co-?administer(?:ed|ation)?|stack(?:ed|ing)?|combine[d]? with)\b\s+(?:at|for|over|using)\b", re.IGNORECASE)),
    ("a self-experiment design", re.compile(r"\b(?:washout|crossover)\s+period\b", re.IGNORECASE)),
)

NOT_FOUND = re.compile(r"\bNot found in .+ as of \d{4}-\d{2}-\d{2}")
NO_INTERACTION_FOUND = re.compile(r"^No interaction found in .+ as of \d{4}-\d{2}-\d{2}\.$")
CHECKED_IN = re.compile(r"^Checked in .+ as of \d{4}-\d{2}-\d{2}\.$")
QUOTED = re.compile(r'"[^"]*"')


def _batches(directory: str) -> list[str]:
    if not os.path.isdir(directory):
        return []
    return [
        os.path.join(directory, name)
        for name in sorted(os.listdir(directory))
        if re.fullmatch(r"batch-\d+\.ndjson", name)
    ]


def _read(directory: str) -> Iterator[dict[str, Any]]:
    for path in _batches(directory):
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    yield json.loads(line)


@pytest.fixture(scope="module")
def pages() -> list[dict[str, Any]]:
    rendered = list(_read(TEXT_DIR))
    if not rendered:
        pytest.skip(
            f"no rendered pages under {TEXT_DIR}; "
            "run `npx tsx scripts/revamp/page_text_v5.ts` first"
        )
    return rendered


@pytest.fixture(scope="module")
def provenance() -> dict[str, list[dict[str, Any]]]:
    return {row["key"]: row.get("provenance") or [] for row in _read(PROVENANCE_DIR)}


@pytest.fixture(scope="module")
def blocks() -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for row in _read(BLOCKS_DIR):
        out[row["key"]] = row
    return out


def _lines(page: dict[str, Any]) -> list[str]:
    return [line for line in page["text"].split("\n") if line.strip()]


def _interaction_lines(page: dict[str, Any]) -> list[str]:
    return [line for line in _lines(page) if TIER_LINE.match(line)]


def _composed_sentences(entries: list[dict[str, Any]]) -> list[str]:
    """Prose this generator composed, as the provenance map marks it.

    A revealed row is a label naming a recorded bucket beside the value a source wrote — "minimum
    safe and biologically effective dose 1" is a ClinicalTrials.gov endpoint category with its
    count, and "Ribosomal protein S6 kinase (P70S6K)" is a target's name. Neither is this site
    speaking, and the renderer marks them `row` for exactly this reason (see `ProvenanceEntry`).
    The rules below about what the site says are applied to what the site says.
    """
    return [entry["sentence"] for entry in entries if entry.get("kind", "sentence") == "sentence"]


def _unquoted(text: str) -> str:
    """The generator's own words: everything outside a verbatim source quotation.

    A quotation is the source speaking — a label's interaction sentence, a registry trial title, a
    paper's dose-response sentence, the registry's own stop wording. The renderer puts every one of
    them inside quotation marks with its record identifier beside it, and
    `test_every_quoted_span_is_a_stored_sentence` proves on the interaction lines that a quoted span
    really is a stored value rather than the generator's words wearing quotation marks. What is
    scanned here is what this site wrote.
    """
    return QUOTED.sub(" ", text)


def _report(failures: list[str], rule: str, limit: int = 8) -> None:
    if not failures:
        return
    shown = "\n".join(failures[:limit])
    raise AssertionError(
        f"{rule}: {len(failures)} failing page(s)/line(s). First {min(limit, len(failures))}:\n{shown}"
    )


def test_every_interaction_line_carries_its_tier_label_in_words(pages):
    """§4: the tier label is a visible element on every line, not a class on an element."""
    failures: list[str] = []
    seen = 0
    for page in pages:
        for line in _interaction_lines(page):
            seen += 1
            if not any(line.startswith(label) for label in TIER_LABELS):
                failures.append(f"{page['key']}: {line[:160]}")
    assert seen > 0, "no interaction line was rendered anywhere in the corpus"
    _report(failures, "interaction line without a tier label")


def test_predicted_lines_open_with_the_words_and_show_a_derivation(pages):
    """§4: a Tier C line begins "Predicted from mechanism:" and names its inputs."""
    failures: list[str] = []
    seen = 0
    for page in pages:
        for line in _interaction_lines(page):
            if not line.startswith("Predicted from mechanism"):
                continue
            seen += 1
            if not line.startswith("Predicted from mechanism: "):
                failures.append(f"{page['key']}: no colon after the tier label — {line[:160]}")
                continue
            body = line[len("Predicted from mechanism: ") :]
            # The derivation is what stands before the direction arrow, or the whole body where the
            # rule states a class membership rather than a direction.
            derivation = body.split(" → ")[0].strip()
            if len(derivation) < 8:
                failures.append(f"{page['key']}: no derivation — {line[:160]}")
    assert seen > 0, "no predicted interaction line was rendered anywhere in the corpus"
    _report(failures, "predicted line without a derivation")


def test_the_forbidden_words_never_appear_in_generated_text(pages, provenance):
    """Operating Rule 9. Verbatim source quotations are the source's words, not generated text."""
    failures: list[str] = []
    scanned = 0
    for page in pages:
        for line in _composed_sentences(provenance.get(page["key"], [])):
            scanned += 1
            generated = _unquoted(line)
            for word, pattern in FORBIDDEN:
                if pattern.search(generated):
                    failures.append(f"{page['key']}: \"{word}\" in — {line[:200]}")
    assert scanned > 0, "no composed sentence was scanned"
    _report(failures, "forbidden word in generated text")


def test_no_line_anywhere_says_safe_to_combine(pages):
    """The one phrase no source writes either: it could only be this site's own conclusion."""
    failures = [
        f"{page['key']}: {line[:200]}"
        for page in pages
        for line in _lines(page)
        if re.search(r"safe to combine", line, re.IGNORECASE)
    ]
    _report(failures, '"safe to combine" anywhere in the rendered text')


def test_every_quoted_span_is_a_stored_sentence(pages, blocks):
    """The exemption above is only sound if a quotation really is one: prove it on the sample.

    Every quoted span on an interaction line must be a prefix of a sentence the interaction build
    stored for that page. A generator that wrote its own words inside quotation marks to slip past
    the forbidden-word scan would fail here.
    """
    failures: list[str] = []
    checked = 0
    for page in pages:
        bundle = blocks.get(page["key"])
        if not bundle:
            continue
        stored: set[str] = set()
        for tier in (bundle.get("interactions") or {}).get("tiers", {}).values():
            for row in list(tier.get("inline") or []) + list(tier.get("disclosed") or []):
                # A Tier A line quotes the label sentence; a Tier C line quotes the substrate
                # statement from inside its derivation. Both are stored values on the row.
                for field in ("sentence", "derivation"):
                    value = row.get(field)
                    if value:
                        stored.add(" ".join(str(value).split()))
        for line in _interaction_lines(page):
            for span in QUOTED.findall(line):
                inner = " ".join(span.strip('"').split()).rstrip("…").strip()
                if len(inner) < 12:
                    continue
                checked += 1
                if not any(inner in held for held in stored):
                    failures.append(f"{page['key']}: quoted span is not a stored sentence — {inner[:120]}")
    assert checked > 0, "no quoted interaction span was found to check"
    _report(failures, "quoted span that is not a stored source sentence")


def test_every_page_states_an_interaction_or_says_where_it_looked(pages):
    """§4: the statement is present whether or not the block has a row."""
    failures: list[str] = []
    statements = Counter()
    for page in pages:
        lines = _lines(page)
        has_line = any(TIER_LINE.match(line) for line in lines)
        statement = next(
            (
                line
                for line in lines
                if NO_INTERACTION_FOUND.match(line) or CHECKED_IN.match(line)
            ),
            None,
        )
        if statement is not None:
            statements["affirmative" if CHECKED_IN.match(statement) else "not-found"] += 1
        if has_line:
            continue
        if statement is None or not NO_INTERACTION_FOUND.match(statement):
            failures.append(f"{page['key']}: no interaction line and no not-found statement")
    _report(failures, "page with neither an interaction line nor a not-found statement")
    assert statements["not-found"] > 0, "no page carried the not-found statement"


def test_controlled_pages_carry_no_dose_timing_route_or_combination_sentence(pages, blocks):
    """§4 and Operating Rule 9, over the pages the controlled trigger actually fired on.

    This one is scanned over the whole rendered line, quotations included. On a controlled page the
    rule holds whoever wrote the words: a registry trial title saying "320 mg/d" is dosing text on
    the page whether or not the registry wrote it, and `renderPage` drops such a line rather than
    rendering it (`CONTROLLED_DOSE_PATTERNS`).
    """
    failures: list[str] = []
    controlled_seen = 0
    for page in pages:
        bundle = blocks.get(page["key"])
        if not bundle or not bundle.get("controlled"):
            continue
        controlled_seen += 1
        for line in _lines(page):
            for what, pattern in DOSE_SHAPES:
                match = pattern.search(line)
                if match:
                    failures.append(f"{page['key']}: {what} — {line[:200]}")
    assert controlled_seen > 0, "no controlled-substance page was rendered"
    _report(failures, "dose, timing, route or combination text on a controlled-substance page")


def test_controlled_pages_carry_no_withheld_block(pages, blocks):
    """The four withheld blocks (§4) leave no trace at all — not even their question."""
    withheld_questions = (
        re.compile(r"\bWhat dose\b", re.IGNORECASE),
        re.compile(r"\bhow much of .* reaches the blood", re.IGNORECASE),
        re.compile(r"\bcould .* be tested on one person\b", re.IGNORECASE),
        re.compile(r"\bhow long before .* would show\b", re.IGNORECASE),
    )
    failures: list[str] = []
    for page in pages:
        bundle = blocks.get(page["key"])
        if not bundle or not bundle.get("controlled"):
            continue
        for line in _lines(page):
            for pattern in withheld_questions:
                if pattern.search(line):
                    failures.append(f"{page['key']}: withheld block rendered — {line[:160]}")
    _report(failures, "withheld question block on a controlled-substance page")


def test_unknown_registers_read_not_found_with_the_date(pages):
    """§3: an unknown reads "Not found in [register] as of [date]", never a blank."""
    failures: list[str] = []
    pages_with_not_found = 0
    for page in pages:
        found = [line for line in _lines(page) if "Not found in" in line]
        if found:
            pages_with_not_found += 1
        for line in found:
            if not NOT_FOUND.search(line):
                failures.append(f"{page['key']}: not-found line without a date — {line[:200]}")
    _report(failures, "not-found line missing its register or date")
    assert pages_with_not_found > 0, "no page carried a not-found register line"


def test_no_raw_class_seed_or_rule_identifier_reaches_the_text(pages, provenance):
    """§7: labels come from the ordinary-language tables; a storage token never reaches prose.

    Scanned over composed prose. A recorded name is not prose: "Ribosomal protein S6 kinase" is a
    target's name and "A-sp-T-sp-T-sp-G" is an oligonucleotide's, and both sit in revealed rows and
    synonym lists that the template declares markup.
    """
    failures: list[str] = []
    scanned = 0
    for page in pages:
        for line in _composed_sentences(provenance.get(page["key"], [])):
            scanned += 1
            generated = _unquoted(line)
            for what, pattern in RAW_TOKENS:
                match = pattern.search(generated)
                if match:
                    failures.append(f"{page['key']}: {what} \"{match.group(0)}\" — {line[:200]}")
    assert scanned > 0, "no composed sentence was scanned"
    _report(failures, "raw storage identifier in composed prose")


def test_every_rendered_sentence_traces_to_a_stored_field(pages, provenance):
    """4.7(a): each generated sentence carries a provenance entry naming what it came from."""
    if not provenance:
        pytest.skip(f"no provenance under {PROVENANCE_DIR}")
    missing_pages: list[str] = []
    missing_fields: list[str] = []
    for page in pages:
        entries = provenance.get(page["key"])
        if entries is None:
            missing_pages.append(page["key"])
            continue
        recorded = {entry["sentence"] for entry in entries}
        for entry in entries:
            if not entry.get("fields"):
                missing_fields.append(f"{page['key']}: {entry['sentence'][:160]}")
        for line in _lines(page):
            normalised = " ".join(line.split())
            if normalised not in recorded:
                # Markup lines — headings, the synonyms line, the identifiers panel — are declared
                # markup by the template and are not sentences the page asserts.
                continue
    _report(missing_pages, "page with no provenance record")
    _report(missing_fields, "rendered sentence with no field behind it")


def test_the_registration_block_is_on_every_page(pages):
    """4.2: "this block must be on 100% of pages including Tier 3"."""
    failures = [page["key"] for page in pages if "Where it's registered" not in page["text"]]
    _report(failures, "page with no registration block")


def test_a_recorded_classification_never_reads_as_a_token(pages):
    """§7's positive half: where a class is stated, it is stated in words.

    Catching the token in a regular expression is only half the rule; the other half is that the
    page says something true in its place. A supervision block takes one of two branches. Where the
    registers themselves classified the record it states their classification ("US approved, EU
    approved, UK not cleared, AU scheduled in the Poisons Standard and SG not found"). Where only the
    corpus's own R2 class is on file it states that class in the words
    `docs/specs/suppression-classes.md` fixes. Both are asserted here, and the stub line that used to
    print the tokens is asserted gone.
    """
    class_words = tuple(
        phrase.lower()
        for phrase in (
            "World Health Organization therapeutic class",
            "controlled-substance schedule",
            "harm to a developing baby",
            "cytotoxic",
            "restricts how the medicine is supplied",
            "boxed warning",
            "injection into a vein",
            "withdrawal or suspension for a safety reason",
            "long-acting injection",
            "no classification found in the registers checked",
        )
    )
    failures: list[str] = []
    supervision_pages = 0
    stated_in_class_words = 0
    stated_by_the_registers = 0
    for page in pages:
        text = page["text"]
        if "Regulator classification recorded" in text:
            failures.append(f"{page['key']}: the stub line still names classes as tokens")
        # The block's own question, not a phrase that can turn up inside a quoted label: a probiotic
        # label says "intended for use under medical supervision" and that is the label speaking.
        if "carry a supervision requirement?" not in text and "A register records " not in text:
            continue
        supervision_pages += 1
        lowered = text.lower()
        if any(word in lowered for word in class_words):
            stated_in_class_words += 1
        if "the registers' classification of" in text or "classifications of" in text:
            stated_by_the_registers += 1
        if not any(word in lowered for word in class_words) and (
            "the registers' classification of" not in text and "classifications of" not in text
        ):
            failures.append(f"{page['key']}: a supervision block stating neither branch")
    _report(failures, "supervision block that states no classification in words")
    assert supervision_pages > 0, "no page rendered a supervision block"
    assert stated_in_class_words > 0, "no page stated an R2 class in the spec's words"
    assert stated_by_the_registers > 0, "no page stated the registers' own classification"


# ---------------------------------------------------------------------------------------------
# §11 — every trace resolves, and the render agrees with the page


def _field_records() -> Iterator[dict[str, Any]]:
    """Every page's stored field record, one at a time; nothing is held after it is read."""
    for model in ("longevity", "clinical", "development"):
        directory = os.path.join(FIELDS_DIR, model)
        if not os.path.isdir(directory):
            continue
        for path in sorted(os.listdir(directory)):
            if not re.fullmatch(r"batch-\d+\.ndjson", path):
                continue
            with open(os.path.join(directory, path), encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if line:
                        yield json.loads(line)


def _page_fields(record: dict[str, Any]) -> dict[str, Any]:
    """The field entries of one record, in the shape the resolver reads them."""
    entries = dict(record.get("fields") or {})
    for name, entry in record.items():
        if name != "fields" and isinstance(entry, dict) and "state" in entry:
            entries.setdefault(name, entry)
    return entries


def test_the_trace_of_an_absence_names_paths_the_record_does_not_carry(provenance):
    """§11, over every page: an absence cites what was searched, and it really is absent.

    "Provenance of an absence cites the field path that was searched and the register's date …
    never a path the record does not carry." Slop draw 1 measured the opposite: 469 of 1,632 field
    traces named a jurisdiction key the page's own record does not hold, so an honest sentence was
    carrying a trace nobody could follow. The claim is executed here — every path the trace names
    must be missing from that page's stored record, and the register and the date must be stated.
    """
    if not provenance:
        pytest.skip(f"no provenance under {PROVENANCE_DIR}")
    # Which record each absence is about. A combination page states each component's register
    # line from the component's own record and the trace says so (`… · record <key>`), so the
    # claim is resolved against that record and not against the page carrying the line.
    wanted: dict[str, set[str]] = {}
    for key, entries in provenance.items():
        for entry in entries:
            for trace in entry.get("fields") or []:
                trace = trace.strip()
                on_record = slop_draw.ON_RECORD_RE.match(trace)
                record_key, inner = (
                    (on_record.group("key"), on_record.group("trace")) if on_record else (key, trace)
                )
                if slop_draw.SEARCHED_RE.match(inner):
                    wanted.setdefault(record_key, set()).add(inner)
    assert wanted, "no absence carried a searched-and-not-recorded trace anywhere in the corpus"

    failures: list[str] = []
    checked = 0
    pages_seen = 0
    for record in _field_records():
        traces = wanted.pop(record.get("key"), None)
        if traces is None:
            continue
        pages_seen += 1
        page = slop_draw.PageInputs(key=record["key"], fields=_page_fields(record))
        for trace in sorted(traces):
            checked += 1
            match = slop_draw.SEARCHED_RE.match(trace)
            if match is None:
                failures.append(f"{record['key']}: unreadable absence trace — {trace[:160]}")
                continue
            if not match.group("register").strip() or not match.group("date").strip():
                failures.append(f"{record['key']}: absence with no register or date — {trace[:160]}")
            for path in (part.strip() for part in match.group("paths").split(",")):
                if path and slop_draw.field_path_resolves(page, path):
                    failures.append(
                        f"{record['key']}: the record carries {path}, which the trace calls absent"
                    )
    _report(failures, "absence trace that the record contradicts")
    _report(sorted(wanted), "record named by an absence trace that has no stored field record")
    assert checked > 0, "no absence trace was resolved"
    assert pages_seen > 1000, f"only {pages_seen} records carried an absence trace"


def test_every_trace_on_a_sampled_page_resolves(pages, provenance):
    """§11 and 4.7(a), with `slop_draw`'s own resolver, over a seeded tier-stratified sample.

    Draw 1's check (a) failed on 128 sentences because a trace named something that is not there.
    The same resolver runs here, over every class of trace the corpus uses — a stored field, an
    absence, a question template, a derived seed, a repository file, a source record, an
    interaction rule, a corpus_pages column — so a generator that starts citing a path it did not
    read fails in the test suite rather than in the next draw.
    """
    if not provenance:
        pytest.skip(f"no provenance under {PROVENANCE_DIR}")
    by_tier: dict[int, list[str]] = {}
    for page in pages:
        by_tier.setdefault(int(page["tier"]), []).append(page["key"])
    rng = random.Random(RESOLVER_SEED)
    drawn: list[str] = []
    per_tier = max(1, RESOLVER_SAMPLE // max(1, len(by_tier)))
    for tier in sorted(by_tier):
        held = sorted(by_tier[tier])
        drawn.extend(rng.sample(held, min(per_tier, len(held))))
    keys = set(drawn)

    inputs = slop_draw.load_page_inputs(keys)
    columns = slop_draw.corpus_page_columns(None)
    rule_ids = slop_draw.interaction_rule_ids()
    corpus_keys = {page["key"] for page in pages}

    failures: list[str] = []
    classes: Counter = Counter()
    checked = 0
    for key in sorted(keys):
        page_inputs = inputs.get(key)
        assert page_inputs is not None, f"{key}: no stored inputs"
        for entry in provenance.get(key) or []:
            traces = entry.get("fields") or []
            if not traces:
                failures.append(f"{key}: no trace at all — {entry['sentence'][:120]}")
                continue
            resolutions = [
                slop_draw.resolve_trace(trace, page_inputs, corpus_keys, columns, rule_ids)
                for trace in traces
            ]
            for klass, ok in resolutions:
                classes[f"{klass}: {'resolved' if ok else 'unresolved'}"] += 1
                checked += 1
            if not any(ok for _klass, ok in resolutions):
                failures.append(
                    f"{key}: no trace resolved ({traces[0][:100]}) — {entry['sentence'][:100]}"
                )
    assert checked > 0, "no trace was resolved"
    _report(failures, f"sentence whose traces do not resolve (classes: {dict(classes)})")


def test_the_classification_absence_answer_is_furniture_wherever_it_renders(pages, provenance):
    """§12: "No regulator classification is recorded for X" is furniture, question block included.

    Three things follow from that one decision and all three are asserted here, because marking it
    in one place and not the others is exactly the state §12 was written to correct — it was
    furniture in the stub record and prose in the question block.

      1. Every recorded instance of the statement is marked `furniture` in the provenance map.
      2. The page still says it: the statement is in the painted text.
      3. The ruler does not read it: no line of the furniture-free render carries it.
    """
    unmarked: list[str] = []
    marked = 0
    for key, entries in provenance.items():
        for entry in entries:
            if CLASSIFICATION_ABSENCE not in entry["sentence"]:
                continue
            if entry.get("furniture") is True:
                marked += 1
            else:
                unmarked.append(f"{key}: {entry['sentence'][:120]}")
    _report(unmarked, "classification-absence answer rendered as prose rather than furniture")

    painted = sum(
        1 for page in pages if CLASSIFICATION_ABSENCE in page["text"]
    )
    if PAINTED:
        assert marked > 0, "no page records the classification-absence statement at all"
        assert painted > 0, (
            "the statement is marked furniture but no page paints it; Operating Rule 9 requires "
            "the page to state the absence"
        )

    in_the_ruler = [
        row["key"]
        for row in _read(FREE_TEXT_DIR)
        if CLASSIFICATION_ABSENCE in row["text"]
    ]
    assert not in_the_ruler, (
        f"{len(in_the_ruler)} pages carry the classification-absence statement in the "
        f"furniture-free text the ruler reads; the first is {in_the_ruler[0]}"
    )


def test_the_render_and_the_painted_page_agree(pages):
    """§11: "a sentence the page paints but the render lacks, or the reverse, fails this file".

    The comparison is `scripts/revamp/dom_parity.py`: it loads the build, renders a seeded
    200-page sample in headless Chromium with every disclosure opened, the chrome, the template
    markup and the furniture hidden, and compares that text with what `page_text_v5` wrote for the
    same pages, in both directions and in order. §12 fixes that unit — main-region text lines
    outside furniture — and `scripts/revamp/slop_draw.py` imports the same extraction, so one
    number describes parity. It needs a database and a server, which a unit test has neither of, so
    the measurement is a command and this is the assertion on its result:

        npx tsx scripts/revamp/page_text_v5.ts
        npx tsx scripts/with-disposable-database.ts -- npx tsx scripts/corpus-20k/load/materialise.ts \\
            --tier 1 --revamp --thresholds data/revamp/thresholds-v7.json
        npx next start -p 3142
        .venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3142
    """
    if not os.path.exists(DOM_PARITY):
        pytest.skip(
            f"no parity report at {DOM_PARITY}; run scripts/revamp/dom_parity.py against a local "
            "build first (the command is in this test's docstring)"
        )
    report = json.loads(open(DOM_PARITY, encoding="utf-8").read())
    totals = report.get("totals") or {}
    compared = totals.get("pages compared", 0)
    assert compared >= 200, (
        f"the parity report compared {compared} pages; §11 asks for a 200-page sample"
    )
    failures: list[str] = []
    for entry in report.get("pages") or []:
        for name in ("renderLinesNotPainted", "paintedLinesNotInRender", "renderLinesOutOfOrder"):
            for line in entry.get(name) or []:
                failures.append(f"{entry['key']} {name}: {line[:160]}")
    _report(failures, "line on which the render and the painted page disagree")
    assert totals.get("pages disagreeing", 0) == 0
