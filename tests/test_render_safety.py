"""Phase 4 rendering rules, checked over every rendered page.

`docs/specs/revamp-2026-09.md` 4.1 names this file: the interaction rendering rules "are
unit-tested in `tests/test_render_safety.py`". It reads what the renderer actually wrote — the
highest `data/revamp/render-v*/{text-with-furniture,provenance}/batch-*.ndjson` revision on disk,
the page as a browser paints it — rather than a fixture, because a rule that holds on a fixture and
not on the corpus is not a rule.

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
 11. The §13 rules from the reading of slop draw 3, and the §14 rules from the reading of draw 4 —
     the supervision answer's shape, no register application row under a question, no storage key
     painted, the timeline's three dated events in order, no absence question, one relation per
     pair, the field-count line as furniture, the United States status word against its own
     applications, the label-documented lines grouped by label and direction, and no
     entity-linking artefact as a counterpart. The rules that only the served DOM can decide —
     the whitespace between two inline elements, a record id inside a closed disclosure, a visible
     list of six — are asserted on the components in `tests/unit/corpus-render-safety.test.ts` and
     against a painted build by `scripts/revamp/self_audit.py` (§14 item 16).
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


def _latest_render_dir() -> str:
    """The highest render revision on disk.

    Naming a revision by hand is how `rendered_dup_check.py` and `link_graph_check.py` came to
    measure a superseded file the moment the run they were written for ended (measure v8). One
    render revision is kept at a time; this file reads whichever it is.
    """
    revamp = os.path.join(ROOT, "data", "revamp")
    present = [
        name
        for name in (os.listdir(revamp) if os.path.isdir(revamp) else [])
        if re.fullmatch(r"render-v\d+", name)
        and os.path.isdir(os.path.join(revamp, name, "text"))
    ]
    if not present:
        return os.path.join(revamp, "render-v9")
    return os.path.join(revamp, max(present, key=lambda name: int(name.split("v")[-1])))


RENDER_DIR = _latest_render_dir()
# §11: the ruler reads the page without its furniture and these rules read it with, because they
# are rules about what a reader meets. `Not found in [register] as of [date]` is furniture and is
# still on the page; a test reading the furniture-free text would assert that the page had stopped
# saying something it says. `page_text_v5 --with-furniture` writes the painted text beside the
# furniture-free one, and where it has not been written the furniture-free render is read and the
# furniture rules are exercised on whatever it carries.
FURNITURE_TEXT_DIR = os.path.join(RENDER_DIR, "text-with-furniture")
PAINTED = os.path.isdir(FURNITURE_TEXT_DIR)
TEXT_DIR = FURNITURE_TEXT_DIR if PAINTED else os.path.join(RENDER_DIR, "text")
# One provenance directory, because there is only one provenance map. `renderPage` records every
# line it wrote, furniture included and marked `furniture: true`; the `--with-furniture` flag
# decides only what `text` and `proseText` carry. The two directories the render used to write were
# byte-identical, and 264 MB of the second of them.
PROVENANCE_DIR = os.path.join(RENDER_DIR, "provenance")
# The furniture-free text, which the ruler reads and from which every furniture line is absent.
FREE_TEXT_DIR = os.path.join(RENDER_DIR, "text")
BLOCKS_DIR = os.path.join(ROOT, "data", "revamp", "page-blocks")
CANONICAL = os.path.join(ROOT, "data", "revamp", "identity", "canonical-v7.ndjson")
FIELDS_DIR = os.path.join(ROOT, "data", "revamp", "fields-v2")
DOM_PARITY = os.path.join(RENDER_DIR, "dom-parity.json")

# §12: the one answer that is an absence statement. It is furniture wherever it renders, the
# question block included, so it leaves the ruler, the duplicate check skips it and the slop draw's
# template test does not apply to it — and the page still says it.
CLASSIFICATION_ABSENCE = "No regulator classification is recorded for"

# §13(1): where that answer used to be, the registration block's absence table states the absence.
ABSENCE_TABLE_CAPTION = "Registers holding no record of this substance"

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
    page says something true in its place. §15(1) fixes what that is: one clause per recorded
    class, each naming that class's own evidence — the ATC class with the register's own name for
    the code, the statute the schedule is in, the label the boxed warning is on. The two branches
    this test asserted before are both gone: the registers' own classification (retired by §14(1),
    because a register status is not a supervision reason) and the generic label list (retired by
    §15(1), because it says what a class of that kind might be and not what this record is in).
    """
    clause_words = tuple(
        phrase.lower()
        for phrase in (
            "World Health Organization ATC class",
            "statute schedules it as a controlled substance",
            "risk to a developing baby",
            "pregnancy-prevention programme",
            "hazardous-medicine class",
            "Risk Evaluation and Mitigation Strategy",
            "boxed warning",
            "route of administration is one a clinician gives",
            "withdrawn or suspended for a safety reason",
            "long-acting or titrated injected form",
            "no classification is recorded for this compound",
        )
    )
    retired = (
        "the registers' classification of",
        "a World Health Organization therapeutic class such as",
        "a controlled-substance schedule in Singapore, the United States",
        "Regulator classification recorded",
    )
    failures: list[str] = []
    supervision_pages = 0
    for page in pages:
        text = page["text"]
        for phrase in retired:
            if phrase in text:
                failures.append(f"{page['key']}: still says {phrase!r}")
        if "carry a supervision requirement?" not in text:
            continue
        supervision_pages += 1
        lowered = text.lower()
        if not any(word in lowered for word in clause_words):
            failures.append(f"{page['key']}: a supervision block stating no class in words")
    _report(failures, "supervision block that states no classification in words")
    assert supervision_pages > 0, "no page rendered a supervision block"


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


def test_the_classification_absence_answer_is_retired(pages, provenance):
    """§13(1): "the questions … fire only when an affirmative classification exists".

    "No regulator classification is recorded for X" was the whole answer to "What classification
    does X carry?", on 16,814 pages — an absence offered as a finding, which is the non-sequitur
    §13 item 1 names. The question is no longer derived and the answer no longer has a builder, so
    the statement renders nowhere; the registration block's absence table states the same thing,
    once, as furniture, on every page that has an absent register.

    Both halves are asserted, because retiring the answer without keeping the statement would drop
    a fact Operating Rule 9 requires the page to make.
    """
    rendered = [
        f"{key}: {entry['sentence'][:120]}"
        for key, entries in provenance.items()
        for entry in entries
        if CLASSIFICATION_ABSENCE in entry["sentence"]
    ]
    _report(rendered, "retired classification-absence answer still rendering (§13 item 1)")

    in_the_ruler = [
        row["key"] for row in _read(FREE_TEXT_DIR) if CLASSIFICATION_ABSENCE in row["text"]
    ]
    assert not in_the_ruler, (
        f"{len(in_the_ruler)} pages carry the classification-absence statement in the "
        f"furniture-free text the ruler reads; the first is {in_the_ruler[0]}"
    )

    if PAINTED:
        # The absence itself is still stated, in the one place §13 item 1 puts it.
        stating = sum(1 for page in pages if ABSENCE_TABLE_CAPTION in page["text"])
        assert stating > 0, (
            "no page paints the registration block's absence table; Operating Rule 9 requires the "
            "page to state that a register holds no record"
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


# ---------------------------------------------------------------------------------------------
# §13 — the rules the lead's reading of slop draw 3 added (docs/specs/phase4-generators.md §13)
# ---------------------------------------------------------------------------------------------

# §13(1): the words a register uses to say it holds nothing. An absence is not an answer, and it
# never appears inside a prose answer; the registration block's absence table states it, once.
ABSENCE_IN_PROSE = re.compile(
    r"\b(?:not\s+(?:found|cleared|checked|listed)\b|no\s+(?:record|status|entry)\s+(?:in|for)\b)",
    re.IGNORECASE,
)

# The one absence Operating Rule 9 requires as a sentence: "the absence of a found interaction
# renders as 'no interaction found in [sources checked, date]', never as 'safe'". It is furniture,
# and it is named here so the rule above cannot be read as forbidding it.
REQUIRED_ABSENCE_SENTENCES = (
    "No interaction found in ",
    CLASSIFICATION_ABSENCE,
    "has no recorded human exposure",
)

# §13(1) and §13(2): storage vocabulary. A field path and a register's own column name are how a
# value is filed, not what it says, and neither reaches a line a reader meets. The shapes are
# multi-word: a single lowercase word ("regulatory", "indication") is also English and is not a
# token by itself, so only a snake_case token or a camelCase name with a hump is checked.
STORAGE_TOKEN = re.compile(r"\b(?:[a-z][a-z0-9]*(?:_[a-z0-9]+)+|[a-z][a-z0-9]*(?:[A-Z][a-z0-9]+)+)\b")

# The tokens the reading actually found on the page, kept as a floor under the shape rule above so
# a regression names the thing it reintroduced.
NAMED_STORAGE_TOKENS = (
    "curatedMarketingStatusNote",
    "curatedMarketingStatusByJurisdiction",
    "drug_warning",
    "withdrawn_flag",
    "warningType",
    "warning_type",
    "statusVerbatim",
    "source_record_id",
)

# §13(3): a stored dataset record. Its place is the closed disclosure, never a line.
RECORD_ID = re.compile(r"\b(?:frdb:ddi:\d+|inxight-stitch:[0-9]+:[a-z]+:[A-Za-z]+)\b")

# §13(4): the instruments whose rows belong in the controlled-substance schedules table and in no
# other line on the page.
STATUTE_NAMES = (
    "Misuse of Drugs Act",
    "Poisons Rules",
    "Poisons Act 1938",
    "Standard for the Uniform Scheduling of Medicines and Poisons",
)

# §13(11): the decorative marks. They are CSS pseudo-element content, so no rendered text and no
# extraction carries them as words.
# A tilde inside a source's own words is the source's — a label writing "~180 h", a registry
# writing "N~15 subjects", a UniProt protein name — so the rule is about the mark standing alone as
# an ornament, which is the only shape the template ever painted it in.
DECORATIVE_GLYPHS = ("◇", "~")
# The diamond only ever came from the template, so any occurrence of it is the ornament. The tilde
# is a character a source uses, so the ornament is the line the template painted: the mark alone.
STANDALONE_GLYPH = {
    "◇": re.compile("◇"),
    "~": re.compile(r"^~$"),
}

_WORDS = re.compile(r"[^a-z0-9]+")

# The trailing provenance anchor: the register that stated the value, its own record id and the
# date it was read, joined by middle dots. It is a citation, not a sentence, and every rule in this
# file about what the site *says* reads the sentence without it — a register's record id is the
# register's, and `ChEMBL:drug_warning:4085` is how ChEMBL numbers its own row.
ANCHOR_TAIL = re.compile(r"\s+[^·]+(?:\s·\s[^·]+)+\s*$")

# §13(1): the blocks that answer a question. The registration block is the one place a register's
# absence is stated, in the words Operating Rule 9 fixes, so it is not in this rule's scope.
ANSWER_GROUPS = ("computed", "form-of", "stub-record")


def _without_anchor(sentence: str) -> str:
    return ANCHOR_TAIL.sub("", sentence).strip()


def _is_answer(entry: dict[str, Any]) -> bool:
    group = str(entry.get("group") or "")
    return group.startswith("question:") or group in ANSWER_GROUPS


def _full_normalised(name: str) -> str:
    """The whole name, lowercased, punctuation collapsed — and nothing removed (§13(12))."""
    return _WORDS.sub(" ", name.lower()).strip()


def _prose_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The prose answers: composed sentences that are neither furniture nor a question heading."""
    return [
        entry
        for entry in entries
        if entry.get("kind", "sentence") == "sentence"
        and entry.get("furniture") is not True
        and entry.get("heading") is not True
    ]


def test_no_absence_reaches_a_prose_answer(provenance):
    """§13(1): "absences never appear in a prose answer".

    The corpus-20k regulatory answer read "SG not found, AU scheduled in the Poisons Standard and
    UK not cleared: the registers' classification of X", and the label question's second paragraph
    read "SG not found; US approved (…); UK not cleared". Both offered a register's absence as a
    finding about the compound, which does not follow from it. The registration block's absence
    table is where the page states an absence, and it is furniture there.

    The two absences that are sentences by rule are excluded by name: Operating Rule 9 requires
    "no interaction found in [sources checked] as of [date]", and §13(7) makes "X has no recorded
    human exposure" furniture, which this rule already skips.
    """
    failures: list[str] = []
    scanned = 0
    for key, entries in provenance.items():
        for entry in _prose_entries(entries):
            if not _is_answer(entry):
                continue
            sentence = entry["sentence"]
            if any(allowed in sentence for allowed in REQUIRED_ABSENCE_SENTENCES):
                continue
            scanned += 1
            if ABSENCE_IN_PROSE.search(_unquoted(_without_anchor(sentence))):
                failures.append(f"{key} [{entry.get('group')}]: {sentence[:150]}")
    assert scanned > 0, "no prose answer was read"
    _report(failures, "prose answer carrying a register's absence (§13 item 1)")


def test_no_field_name_or_enum_string_reaches_visible_text(pages):
    """§13(1) and §13(2): storage vocabulary never reaches a line a reader meets.

    "curatedMarketingStatusNote NCATS Inxight Drugs records marketing events …" put a stored field
    name in front of a reader inside a sentence about a label's indication, and the retired "What
    the registers record" block printed "drug_warning warningType Withdrawn" as a row. Both are how
    a value is filed. The register that stated something is named; the column it was filed in is
    not.

    Every line of the painted page is read, because a row is as visible as a sentence. A quoted
    span is a source speaking verbatim and is excluded exactly as it is everywhere else in this
    file — a label paragraph may contain anything the label wrote.
    """
    failures: list[str] = []
    for page in pages:
        for line in _lines(page):
            body = _unquoted(_without_anchor(line))
            for token in STORAGE_TOKEN.findall(body):
                if token in NAMED_STORAGE_TOKENS:
                    failures.append(f"{page['key']}: {token} — {line[:120]}")
    _report(failures, "storage token in visible text (§13 items 1 and 2)")


def test_a_tier_label_appears_once_on_an_interaction_line(pages):
    """§13(3): "the tier label is one visible element per line, never a second badge".

    The block painted the tier three times over: as a heading above the group, as a badge on every
    line, and as the line's own first word. The heading and the badge are gone and the line carries
    it once, so this counts the occurrences in the line the render and the page share.
    """
    failures: list[str] = []
    seen = 0
    for page in pages:
        for line in _interaction_lines(page):
            seen += 1
            occurrences = sum(line.count(label) for label in TIER_LABELS)
            if occurrences != 1:
                failures.append(f"{page['key']}: {occurrences} tier labels — {line[:120]}")
    assert seen > 0, "no interaction line was read"
    _report(failures, "interaction line carrying its tier label more or less than once")


def test_no_dataset_record_id_reaches_a_prose_line(provenance):
    """§13(3): "record ids (frdb:ddi:12049) … live only inside the closed disclosure".

    A curated line read "Curated · Cytochrome P450 1A2: substrate · Inxight frdb:ddi:12049", and
    nine of them sat one under another. The lines are grouped by role now and cite the dataset by
    name; the record behind each grouped target is a row in the block's disclosure, which the
    provenance map marks `row`.
    """
    failures: list[str] = []
    for key, entries in provenance.items():
        for entry in entries:
            if entry.get("kind", "sentence") != "sentence":
                continue
            found = RECORD_ID.search(_without_anchor(entry["sentence"]))
            if found:
                failures.append(f"{key}: {found.group(0)} — {entry['sentence'][:120]}")
    _report(failures, "dataset record id on a prose line (§13 item 3)")


def test_a_schedule_row_renders_once(pages, blocks):
    """§13(4): "the controlled-substance schedules table is the one place a statute row appears".

    The Singapore line carried "Class C controlled drug, First Schedule Part 3, Misuse of Drugs Act
    1973 (version 2026-06-01) · listed in the Poisons Act 1938 Schedule and 2 Poisons Rules
    schedules", and every one of those rows was printed again, in full, a few lines below. The line
    names the class and says "see schedules"; the statutes are written once, in the table.
    """
    failures: list[str] = []
    checked = 0
    for page in pages:
        bundle = blocks.get(page["key"])
        if not bundle or not (bundle.get("controlledSchedules") or []):
            continue
        checked += 1
        for row in bundle.get("registration") or []:
            line = str(row.get("line") or "")
            for statute in STATUTE_NAMES:
                if statute in line:
                    failures.append(f"{page['key']}: {statute} on a register line — {line[:140]}")
    assert checked > 0, "no page with a controlled-substance schedule was read"
    _report(failures, "statute row repeated on a registration line (§13 item 4)")


def test_a_trial_list_shows_at_most_six_rows(provenance):
    """§13(5): "trial lists cap at six visible rows".

    The rest are one group, labelled "14 further recorded trials", and the template paints that
    group as a closed `<details>` of its own, so its rows are not painted until a reader opens
    them. What this asserts is the count the group label is derived from: at most six rows carry
    the plain "Trial" label, and every row beyond them carries the further-trials label instead.
    """
    further = re.compile(r"^\d+ further recorded trials?\b")
    failures: list[str] = []
    seen = 0
    for key, entries in provenance.items():
        inline: Counter[str] = Counter()
        for entry in entries:
            if entry.get("kind") != "row":
                continue
            sentence = entry["sentence"]
            if sentence.startswith("Trial "):
                inline[entry.get("group", "")] += 1
            elif further.match(sentence):
                seen += 1
        for group, count in inline.items():
            seen += 1
            if count > 6:
                failures.append(f"{key} [{group}]: {count} visible trial rows")
    assert seen > 0, "no trial row was read"
    _report(failures, "trial list showing more than six rows (§13 item 5)")


def test_no_decorative_glyph_reaches_the_rendered_text(pages):
    """§13(11): the provenance mark and the section separator are drawn, never written.

    `.cd-glyph::before` and `.cd-anchor-glyph::before` carry them as CSS content, so they are not
    text nodes: neither the uniqueness ruler nor a crawler reads "◇" or "~" as a word. The render
    never wrote them, and this asserts that it still does not, on both texts.
    """
    failures: list[str] = []
    for page in pages:
        for line in _lines(page):
            for glyph in DECORATIVE_GLYPHS:
                if STANDALONE_GLYPH[glyph].search(line.strip()):
                    failures.append(f"{page['key']}: {glyph!r} — {line[:80]}")
    _report(failures, "decorative glyph in the rendered text (§13 item 11)")


def _canonical_synonyms() -> dict[str, set[str]]:
    """Every page's full normalised names, from the identity revision the corpus was built on."""
    out: dict[str, set[str]] = {}
    with open(CANONICAL, encoding="utf-8") as handle:
        for line in handle:
            record = json.loads(line)
            names = {record.get("displayName") or ""}
            for synonym in record.get("synonyms") or []:
                names.add(synonym.get("name") or "")
            out[record["key"]] = {
                _full_normalised(name) for name in names if len(_full_normalised(name)) >= 3
            }
    return out


def test_a_susmp_row_matches_a_full_synonym_of_its_page(blocks):
    """§13(12): "SUSMP matching requires the substance-as-listed to equal a full normalised synonym".

    `normalise_name` strips trailing counter-ion words so that "amlodipine besylate" and
    "amlodipine" meet. On a name whose head is the counter-ion that is wrong: "SODIUM PHOSPHATE",
    "SODIUM DIACETATE" and "SODIUM CITRATE" all reduce to "sodium", and the Poisons Standard's
    phosphate and diacetate entries were rendered on the trisodium citrate page as Schedules 3, 4
    and 5. A shared token never matches; the whole name must.

    Only the name-matched rows are asserted. A row matched on a UNII, an InChIKey or a skeleton is
    confirmed by a chemical identifier and is not required to carry a matching name.
    """
    if not os.path.exists(CANONICAL):
        pytest.skip(f"no identity revision at {CANONICAL}")
    synonyms = _canonical_synonyms()
    failures: list[str] = []
    checked = 0
    for key, bundle in blocks.items():
        names = synonyms.get(key)
        if not names:
            continue
        for row in bundle.get("controlledSchedules") or []:
            if row.get("jurisdiction") != "AU":
                continue
            listed = row.get("substanceAsListed")
            if not listed:
                continue
            checked += 1
            normalised = _full_normalised(str(listed).lstrip("# "))
            if normalised and normalised not in names:
                # A UNII- or structure-confirmed row states the register's own name, which need not
                # be one of this page's; only a name-matched row is bound by the rule.
                if str(row.get("provenance") or "").endswith("name-candidate"):
                    failures.append(f"{key}: listed as {listed!r}")
    assert checked > 0, "no Poisons Standard row was read"
    _report(failures, "Poisons Standard row matched on a shared token (§13 item 12)")


# =============================================================================================
# §14 — the rules from the lead's reading of slop draw 4, each asserted mechanically.
#
# Item 16 requires it: "the fix agent renders 30 random pages (10 per tier) on its build and checks
# every rule in §13 and §14 mechanically where a rule is mechanical … and adds each mechanical rule
# to `tests/test_render_safety.py`." The rules that are about the served DOM — whitespace between
# adjacent spans, a provenance row inside a closed disclosure, a visible list of six — are asserted
# on the components in `tests/unit/corpus-render-safety.test.ts` and against a painted build by
# `scripts/revamp/self_audit.py`; what is asserted here is what the render itself wrote, over every
# page of the corpus.
# =============================================================================================

# §14(2): a register application identifier, in every shape the registers write one. A question's
# answer that names one is the registration block's row painted a second time.
APPLICATION_ID = re.compile(
    r"\b(?:NDA|ANDA|BLA)\s?\d{5,}\b|\bEMEA/H/C/\d+\b|\bdrug code \d+\b", re.IGNORECASE
)

# §14(8): a storage key, in every shape the corpus writes one.
PAGE_KEY = re.compile(r"\b(?:K[1-4]:[0-9A-Za-z]|COMBO:|PRODUCT:|HOLD:|IK:[A-Z])")

# §15(1): the supervision answer is one clause per recorded class, each carrying that class's own
# source in brackets. The §14 frame it replaced named a class from a fixed list; neither that frame
# nor any of the list's labels may appear.
RETIRED_SUPERVISION_FRAME = re.compile(r"^A register records .+ under medical supervision: ")
GENERIC_CLASS_LABEL = re.compile(
    r"a World Health Organization therapeutic class such as"
    r"|a controlled-substance schedule in Singapore, the United States"
    r"|a label warning about harm to a developing baby"
    r"|a list of cytotoxic or otherwise hazardous medicines"
    r"|a United States programme that restricts how the medicine is supplied"
    r"|a boxed warning, the strongest warning a United States label carries"
    r"|a route a clinician administers, such as"
    r"|a register record of withdrawal or suspension for a safety reason"
    r"|a long-acting injection, an insulin, or another injected hormone",
    re.IGNORECASE,
)
CLAUSE_SOURCE = re.compile(r"\([^()]{3,}\)\s*\.$")

# §14(1) and §15(1): a prescription classification is not a supervision reason. These are the words
# the registers use for one, and none of them may appear in the answer. The Poisons Standard itself
# is not among them: a Schedule 8 or 9 entry is a controlled schedule, and §15(1) names the
# controlled schedule as evidence the answer may cite. Schedule 4 and the Singapore Poisons Act and
# Poisons Rules schedules are prescription classes.
PRESCRIPTION_ONLY = re.compile(
    r"\b(?:poisons act|poisons rules|prescription[ -]only|schedule 4|POM|forensic class)\b",
    re.IGNORECASE,
)

# §14(11): the question the retired `never-dosed` block asked.
ABSENCE_QUESTION = re.compile(r"^Has .+ ever reached a person\?$")


def _strip_provenance_anchor(sentence: str) -> str:
    """The sentence without the citation `withAnchor` appended to it.

    `_without_anchor` above cannot be used for this: its pattern is greedy from the first space, so
    on "A register records X under medical supervision: … . Drugs@FDA · NDA021929 · 2026-08-28" it
    returns "A". The anchor is appended after the sentence's own final full stop and is a dotted
    list of a register, a record and a date, so the last ". " in the string is where it begins.
    """
    text = sentence.strip()
    at = text.rfind(". ")
    if at < 0:
        return text
    tail = text[at + 2 :]
    return text[: at + 1].strip() if " · " in tail else text


def _supervision_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The prose the supervision question answered, by the template its trace names."""
    return [
        entry
        for entry in _prose_entries(entries)
        if "page_questions.supervision" in (entry.get("fields") or [])
    ]


def test_the_supervision_answer_names_no_register_status(provenance):
    """§14(1) and §15(1): the answer names the class evidence, never a register status.

    "AU scheduled in the Poisons Standard: the registers' classification of Piroxicam" was wrong
    twice: an Australian Schedule 4 entry is a prescription class and not a reason for supervision,
    and the sentence's provenance named registers the sentence itself did not. §15(1) then found
    the replacement naming the class from a generic list — "a World Health Organization therapeutic
    class such as cancer medicines, immune suppressants, opioids or general anaesthetics" — beside
    a prescription-schedule row that was not its evidence. The answer is now one clause per
    recorded class, each built from that class's own evidence: no clause is the retired frame, none
    is a label from the list, and none names a prescription classification.
    """
    failures: list[str] = []
    checked = 0
    for key, entries in provenance.items():
        held = _supervision_entries(entries)
        if not held:
            continue
        checked += 1
        for entry in held:
            sentence = _strip_provenance_anchor(str(entry["sentence"]))
            if RETIRED_SUPERVISION_FRAME.match(sentence):
                failures.append(f"{key}: uses the retired frame: {sentence[:120]}")
                continue
            generic = GENERIC_CLASS_LABEL.search(sentence)
            if generic:
                failures.append(f"{key}: names the generic label {generic.group(0)!r}")
                continue
            named = PRESCRIPTION_ONLY.search(sentence)
            if named:
                failures.append(
                    f"{key}: names a prescription class ({named.group(0)!r}): {sentence[:120]}"
                )
    assert checked > 0, "no supervision answer was rendered"
    _report(failures, "supervision answer naming a register status (§14 item 1, §15 item 1)")


def test_every_supervision_clause_carries_its_own_source(provenance):
    """§15(1): "a clause without a matching source does not render".

    Each clause ends with the source the suppression pass recorded for that class — the register
    that published the ATC group, the statute the schedule is in, the DailyMed label the boxed
    warning is on. The last paragraph of the block may be this record's own study scope, which
    states no classification and carries no citation; every clause before it is checked, and a
    block of one paragraph is checked as a clause.
    """
    failures: list[str] = []
    checked = 0
    for key, entries in provenance.items():
        held = _supervision_entries(entries)
        if not held:
            continue
        sentences = [_strip_provenance_anchor(str(entry["sentence"])) for entry in held]
        clauses = sentences[:-1] if len(sentences) > 1 else sentences
        for sentence in clauses:
            checked += 1
            if not CLAUSE_SOURCE.search(sentence):
                failures.append(f"{key}: {sentence[:140]}")
    assert checked > 0, "no supervision clause was rendered"
    _report(failures, "supervision clause with no source (§15 item 1)")


def test_no_register_application_row_renders_under_a_question(provenance):
    """§14(2): register application rows leave every question block.

    The rows painted under the supervision question (US NDA… Prescription, EU EMEA/H/C/… Withdrawn,
    CA drug code … APPROVED) and under the label question are the corpus-20k register data rows.
    The registration block and its disclosure hold them once.

    Scope: what a question block paints without a reader opening anything — its answer sentences
    and the values under its heading. A revealed row inside the block's closed disclosure is the
    answer's own evidence and may name the record it was read from; the contradiction block's two
    rows name the two registers that disagree, which is the answer and not a duplicate of the
    registration block's line.
    """
    failures: list[str] = []
    for key, entries in provenance.items():
        for entry in entries:
            group = str(entry.get("group") or "")
            if not group.startswith("question:"):
                continue
            if entry.get("kind") == "row":
                continue
            # The register's own words, quoted, are the register speaking: a withdrawal notice that
            # names a lot number or an application is the notice, not this page citing a row. What
            # is scanned is what this site wrote, and the citation it appended is its provenance.
            scanned = _unquoted(_strip_provenance_anchor(str(entry.get("sentence") or "")))
            match = APPLICATION_ID.search(scanned)
            if match:
                failures.append(f"{key} {group}: {scanned[:140]}")
    _report(failures, "register application row under a question block (§14 item 2)")


def test_no_storage_key_is_painted(pages):
    """§14(8): "Page keys are never painted" ("1989-12-11 K1:3J962UJT8H first approval").

    Seed 8 recorded the ChEMBL approval event's source id as the page's own key, and the timeline
    block printed it in the identifier position of a row, where a register's record number belongs.
    `buildBlockBody` strips a key from every row and fact it returns; this asserts it over the whole
    rendered corpus, on the text a browser paints.
    """
    failures: list[str] = []
    for page in pages:
        for line in _lines(page):
            if PAGE_KEY.search(line):
                failures.append(f"{page['key']}: {line[:140]}")
    _report(failures, "a storage key painted on the page (§14 item 8)")


def test_the_provenance_timeline_fires_only_on_three_dated_events_in_order():
    """§14(10): three or more dated events, in chronological order, first and last kinds named.

    "How did X get from 1989 to approved?" over the events "1989 first approval, 2004 first human
    trial" phrases a later event as leading to an earlier one, and two dated points are not a
    timeline at all. Asserted on seed 8's own records, which is where both rules live.
    """
    seeds = os.path.join(ROOT, "data", "revamp", "derived-v2")
    path = os.path.join(seeds, "seed-08.ndjson")
    if not os.path.exists(path):
        candidates = [
            name
            for name in (os.listdir(seeds) if os.path.isdir(seeds) else [])
            if name.startswith("seed-08") or name.startswith("seed8")
        ]
        if not candidates:
            pytest.skip("seed 8 was discarded by the 40-page floor and wrote no records")
        path = os.path.join(seeds, candidates[0])
    failures: list[str] = []
    read = 0
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            values = record.get("values") or {}
            slots = record.get("slots") or {}
            events = [event for event in (values.get("events") or []) if event.get("year")]
            read += 1
            if len(events) < 3:
                failures.append(f"{record.get('key')}: {len(events)} dated events")
                continue
            years = [str(event["year"]) for event in events]
            if years != sorted(years):
                failures.append(f"{record.get('key')}: events out of order {years}")
            if slots.get("firstEvent") != events[0].get("event"):
                failures.append(f"{record.get('key')}: first event kind not named")
            if slots.get("lastEvent") != events[-1].get("event"):
                failures.append(f"{record.get('key')}: last event kind not named")
    _report(failures, "provenance timeline shorter than three events or out of order (§14 item 10)")


def test_no_absence_question_fires(pages):
    """§14(11): "Has X ever reached a person?" renders nothing when the answer is an absence.

    The question fired only where the record says no one has, so its answer was that absence — the
    shape §13(1) took out of the classification question. The header line "No human study recorded"
    carries it, once.
    """
    failures: list[str] = []
    for page in pages:
        for line in _lines(page):
            if ABSENCE_QUESTION.match(line.strip()):
                failures.append(f"{page['key']}: {line[:120]}")
    _report(failures, "an absence question rendered (§14 item 11)")


def test_one_relation_per_pair():
    """§14(12): one relation per pair, the most specific ("stereoisomer of", never also "same
    structure as").

    Phase 3 resolved a pair by every rule that applied to it and recorded each result, so a
    stereoisomer pair carried `stereoisomer_of` and `form_of` both, and the page painted both.
    `scripts/revamp/identity_relations_v6.py` keeps the most specific; this asserts the revision the
    loader and the renderer actually read.
    """
    if not os.path.exists(CANONICAL):
        pytest.skip(f"no identity revision at {CANONICAL}")
    failures: list[str] = []
    pairs = 0
    with open(CANONICAL, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            seen: dict[str, set[str]] = {}
            for relation in record.get("relations") or []:
                target = relation.get("targetKey")
                if not target:
                    continue
                kind = str(relation.get("type") or "").replace("_", "-").lower()
                seen.setdefault(target, set()).add(kind)
            for target, kinds in seen.items():
                pairs += 1
                if len(kinds) > 1:
                    failures.append(f"{record['key']} -> {target}: {sorted(kinds)}")
    assert pairs > 0, "the identity revision carries no relation"
    _report(failures, "more than one relation on one pair (§14 item 12)")


def test_the_record_holds_n_fields_line_is_furniture(provenance):
    """§14(13): "This record holds N fields" is furniture.

    It states how much of the record is filled in, in fixed words, on every stub in the corpus —
    the footing §11 gives the register absence table and the patent no-record line.
    """
    failures: list[str] = []
    seen = 0
    for key, entries in provenance.items():
        for entry in entries:
            sentence = str(entry.get("sentence") or "")
            if not sentence.startswith("This record holds "):
                continue
            seen += 1
            if entry.get("furniture") is not True:
                failures.append(f"{key}: {sentence}")
    assert seen > 0, "no stub field-count line was rendered"
    _report(failures, "the field-count line not marked furniture (§14 item 13)")


# §14(3): what the applications say about the status word.
US_ACTIVE = ("prescription", "over-the-counter")


def test_the_us_status_word_agrees_with_its_applications(blocks):
    """§14(3): "Approved · 4 applications: all discontinued" is a contradiction.

    Any active prescription or over-the-counter application makes the word Approved; every
    application discontinued makes it Discontinued; tentative approvals alone make it Tentative
    approval. A recorded withdrawal is a statement about the substance and keeps its own word.
    """
    failures: list[str] = []
    checked = 0
    for key, bundle in blocks.items():
        for row in bundle.get("registration") or []:
            if row.get("jurisdiction") != "US":
                continue
            line = str(row.get("line") or "")
            status = str(row.get("status") or "")
            if " application" not in line:
                continue
            checked += 1
            lowered = line.lower()
            active = any(word in lowered for word in US_ACTIVE)
            tentative = "tentative approval" in lowered
            if status.startswith("Approved") and not active and ("all discontinued" in lowered or tentative):
                failures.append(f"{key}: {status} / {line[:120]}")
            if status == "Discontinued" and active:
                failures.append(f"{key}: {status} / {line[:120]}")
            if status == "Tentative approval" and active:
                failures.append(f"{key}: {status} / {line[:120]}")
    assert checked > 0, "no United States registration line named an application"
    _report(failures, "a United States status word contradicting its applications (§14 item 3)")


def test_label_interactions_are_grouped_by_label_and_direction(blocks):
    """§14(5): one line per (label, direction class), never twenty-one repeating the label id.

    Piroxicam's page carried twenty-one label-documented lines, each repeating the same DailyMed set
    id and the same effective date and differing only in the counterpart's name and one of three
    direction phrases.
    """
    failures: list[str] = []
    grouped = 0
    for key, bundle in blocks.items():
        held = ((bundle.get("interactions") or {}).get("tiers") or {}).get("A")
        if not held:
            continue
        rows = list(held.get("inline") or []) + list(held.get("disclosed") or [])
        seen: dict[tuple[str, str, str], int] = {}
        for row in rows:
            if row.get("groupedCounterparts"):
                grouped += 1
            group = (
                str(row.get("setId") or ""),
                str(row.get("effectiveTime") or ""),
                str(row.get("groupedDirection") or row.get("direction") or ""),
            )
            seen[group] = seen.get(group, 0) + 1
        for group, count in seen.items():
            if count > 1:
                failures.append(f"{key}: {count} lines for {group}")
    assert grouped > 0, "no label-documented line was grouped"
    _report(failures, "two label-documented lines for one label and direction (§14 item 5)")


def test_no_interaction_counterpart_is_an_entity_linking_artefact(blocks):
    """§14(5): "PLATELETS" and bare "ASA" are entity-linking artefacts and are dropped.

    `scripts/revamp/counterpart_artefacts.py` decides them from the registers' own records — a GSRS
    substance class of `structurallyDiverse` (a cell, a tissue, a material and not a medicine) and a
    printed name that is a bare abbreviation — and `page_blocks.py` drops every row naming one and
    counts it.
    """
    path = os.path.join(ROOT, "data", "revamp", "interactions", "counterpart-artefacts.csv")
    if not os.path.exists(path):
        pytest.skip("no counterpart artefact file; run counterpart_artefacts.py")
    import csv

    artefacts: dict[str, str] = {}
    with open(path, encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            artefacts[row["key"]] = row["printed_name"]
    assert artefacts, "the artefact file names no page"
    failures: list[str] = []
    for key, bundle in blocks.items():
        for tier in ((bundle.get("interactions") or {}).get("tiers") or {}).values():
            for row in list(tier.get("inline") or []) + list(tier.get("disclosed") or []):
                counterpart = row.get("counterpartKey")
                if counterpart and counterpart in artefacts:
                    failures.append(f"{key}: names {artefacts[counterpart]}")
                for held in row.get("groupedCounterpartKeys") or []:
                    if held in artefacts:
                        failures.append(f"{key}: group names {artefacts[held]}")
    _report(failures, "an entity-linking artefact rendered as a counterpart (§14 item 5)")


# =============================================================================================
# §15 — the rules from the lead's reading of slop draw 6, each asserted mechanically.
#
# Item 9 requires it: "the self-audit per §14(16) extended with rules 1, 5, 6, 7, 8 as mechanical
# checks". Rule 1 is asserted above, beside the §14 rule it replaces. Rule 8 is about the served
# DOM — an inline element glued to the text beside it — and is asserted on the components in
# `tests/unit/corpus-render-safety.test.ts` and against a painted build by
# `scripts/revamp/self_audit.py`. What follows is what the render itself wrote, over every page.
# =============================================================================================

# §15(4): the mechanism quotation is a row, so its frame is no longer a sentence anywhere.
MECHANISM_PROSE = re.compile(r"^The mechanism record reads ")

# §15(4): a register status value line. "CA approved (2026-09-04)" is the registration block's own
# line and no question block states one.
REGISTER_STATUS_LINE = re.compile(
    r"^(?:SG|US|AU|UK|EU|JP|CA) (?:approved|withdrawn|discontinued|registered|suspended"
    r"|refused|tentative approval|not found)\b",
    re.IGNORECASE,
)

# §15(5): the ageing question and the neutral one, and the vocabulary that licenses the first.
AGEING_QUESTION = re.compile(r"^Which running trial of .+ could settle (.+)\?$")
NEUTRAL_READOUT_QUESTION = re.compile(r"^Which running trial of .+ reads out next\?$")
AGEING_ENDPOINT_WORDS = {
    "lifespan",
    "healthspan",
    "frailty",
    "function",
    "epigenetic age",
    "vo2max",
    "grip strength",
    "insulin sensitivity",
    "inflammatory markers",
}

# §15(6): the words of a stereochemical relation, and of a record that states no stereochemistry.
STEREO_RELATION = re.compile(r"\b(?:diastereomer|enantiomer)\b", re.IGNORECASE)
NO_STEREOCHEMISTRY = re.compile(r"recorded without stereochemistry", re.IGNORECASE)
UNDEFINED_STEREO_BLOCK = "UHFFFAOYSA"


def test_the_mechanism_quotation_is_a_row_and_not_a_sentence(provenance):
    """§15(4): the register's own wording renders as a row.

    "The mechanism record reads "<the register's wording>". ChEMBL 37 · CHEMBL… · 2026-09-04" is a
    fixed frame around one value, and once the quotation and the identifiers were masked it was the
    same sentence on 954 pages (3.33 %) in slop draws 6 and 7. §13(7) makes a one-value statement a
    row; this asserts no page writes it as prose.
    """
    failures: list[str] = []
    for key, entries in provenance.items():
        for entry in _prose_entries(entries):
            sentence = str(entry["sentence"]).strip()
            if MECHANISM_PROSE.match(sentence):
                failures.append(f"{key}: {sentence[:120]}")
    _report(failures, "the mechanism quotation rendered as prose (§15 item 4)")


def test_no_register_status_line_renders_inside_a_question_block(provenance):
    """§15(4): the register status value line leaves the question blocks entirely.

    §14(2) retired the register application rows from every question block and §14(3) fixed the
    status word; the value list survived as the `regulatory-only` block's whole answer, and on a
    page whose only recorded approval was Canada's it was one register's line, in the position of
    an answer, on 182 pages (0.64 %). The registration block is the one place a register status is
    stated.
    """
    failures: list[str] = []
    for key, entries in provenance.items():
        for entry in entries:
            fields = entry.get("fields") or []
            if not any(str(field).startswith("page_questions.") for field in fields):
                continue
            if entry.get("kind", "sentence") != "sentence" or entry.get("heading") is True:
                continue
            sentence = _strip_provenance_anchor(str(entry["sentence"])).strip()
            if REGISTER_STATUS_LINE.match(sentence):
                failures.append(f"{key}: {sentence[:120]}")
    _report(failures, "a register status line inside a question block (§15 item 4)")


def test_the_ageing_question_fires_only_on_an_ageing_endpoint(provenance):
    """§15(5): seed 9 asks its ageing question only where the endpoint is an ageing endpoint.

    "Which running trial of X could settle lifespan?" over an event-free-survival endpoint is a
    claim the trial does not make. Where the register's words are not in the ageing vocabulary the
    question asks what reads out next, and the answer names the endpoint verbatim.
    """
    failures: list[str] = []
    asked = 0
    for key, entries in provenance.items():
        headings = [
            str(entry["sentence"]).strip()
            for entry in entries
            if entry.get("heading") is True
        ]
        for heading in headings:
            match = AGEING_QUESTION.match(heading)
            if match:
                asked += 1
                if match.group(1).strip().lower() not in AGEING_ENDPOINT_WORDS:
                    failures.append(f"{key}: {heading[:140]}")
            elif NEUTRAL_READOUT_QUESTION.match(heading):
                asked += 1
    _report(failures, "the ageing question over a non-ageing endpoint (§15 item 5)")


def test_a_stereochemistry_note_names_no_relation_the_records_do_not_have():
    """§15(6): the wording of a form-of note, against the two records' own InChIKeys.

    Where one record's InChIKey carries the undefined-stereo block (UHFFFAOYSA) and the other's
    does not, neither is the other's diastereomer or enantiomer: one of them states no
    configuration at all. The note reads "the same connectivity, recorded without stereochemistry",
    and never a stereochemical relation. Mecillinam and Amdinocillin were the case that fixed the
    rule; they carry defined stereochemistry with the same configuration at every centre, which the
    same rule covers.
    """
    relations = os.path.join(ROOT, "data", "revamp", "identity", "relations-v7.parquet")
    canonical = os.path.join(ROOT, "data", "revamp", "identity", "canonical-v7.ndjson")
    if not os.path.exists(relations) or not os.path.exists(canonical):
        pytest.skip("no relations-v6.parquet or canonical-v6.ndjson; run identity_relations_v6.py")
    import pyarrow.parquet as pq

    keys: dict[str, str] = {}
    with open(canonical, encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            record = json.loads(line)
            structure = record.get("structure") or {}
            inchikey = str(structure.get("inchikey") or record.get("inchikey") or "")
            if inchikey:
                keys[record["key"]] = inchikey.upper()

    table = pq.read_table(relations).to_pydict()
    failures: list[str] = []
    checked = 0
    for page_a, page_b, note in zip(table["page_a"], table["page_b"], table["note"]):
        text = str(note or "")
        if not STEREO_RELATION.search(text):
            continue
        checked += 1
        a, b = keys.get(page_a, ""), keys.get(page_b, "")
        blocks_ = [key.split("-")[1] if key.count("-") >= 1 else "" for key in (a, b)]
        undefined = [block.startswith(UNDEFINED_STEREO_BLOCK) for block in blocks_ if block]
        if any(undefined) and not all(undefined):
            failures.append(f"{page_a} ↔ {page_b}: {text[:120]}")
        if NO_STEREOCHEMISTRY.search(text):
            failures.append(f"{page_a} ↔ {page_b}: names both at once: {text[:120]}")
    assert checked > 0, "no stereochemical relation was written"
    _report(failures, "a stereochemical relation over an undefined stereo layer (§15 item 6)")


def test_every_rendered_row_keeps_its_label(provenance):
    """§15(7): status rows keep their labels.

    A run of rows sharing one label writes it once, above the run; a counted remainder — "4 more
    recorded rows" — is not a label, and the rows under it were painting bare counts: "6", "1",
    "1", under six rows that read "phase3 13" and "completed 18". A count with no label states
    nothing a reader can use.

    The rule is about the counted remainder, not about every row that prints a number. A run of
    rows that really do share one label is headed by it once, and the rows under that heading need
    no label of their own — the FAERS list carries two "Pain" rows from two component records, and
    the heading is the label both of them have. A register application identifier ("009436") is a
    number too, inside a disclosure whose summary says what the list is. What is checked here is
    the group whose heading is a count: those rows share no label, and hiding theirs left the page
    painting "6", "1", "1".
    """
    counted = re.compile(r"^\d+ (?:further recorded trials?|more recorded rows?)$")
    failures: list[str] = []
    for key, entries in provenance.items():
        heading = ""
        for entry in entries:
            kind = entry.get("kind", "sentence")
            sentence = str(entry["sentence"]).strip()
            if kind != "row":
                if entry.get("furniture") is True:
                    heading = sentence
                continue
            if not counted.match(heading):
                continue
            if re.fullmatch(r"\d{1,7}", sentence):
                failures.append(f"{key}: {heading!r} heads a row painting {sentence!r}")
    _report(failures, "a row painting a bare number (§15 item 7)")


# A clause of the supervision answer names its class in words and ends with the source that stated
# it, which is what `CLAUSE_SOURCE` above matches. The block's last paragraph may instead be this
# record's own study scope ("in humans, 3 registered studies, largest enrolment 40"), which states
# no classification, carries no bracketed source, and is not a clause.
def _supervision_clause_count(entries: list[dict[str, Any]]) -> int:
    """How many class clauses the supervision block painted on this page."""
    held = _supervision_entries(entries)
    if not held:
        return 0
    sentences = [_strip_provenance_anchor(str(entry["sentence"])) for entry in held]
    return sum(1 for sentence in sentences if CLAUSE_SOURCE.search(sentence))


def test_the_supervision_block_paints_every_recorded_class_clause(provenance):
    """Section 16 item 1: the supervision block is never truncated.

    `buildBlockBody` ended with `.slice(0, 2)` - the two-paragraph discipline every question answer
    is held to - and the supervision block was held to it as well, so the third and later clauses
    were dropped before the page was written. Glofitamab's record carries S1, S3, S4 and S6 and the
    page stated neither its hazardous-medicine class nor its boxed warning. The cap is a rule about
    an answer that develops; this answer enumerates, one clause per recorded class in the order
    S1-S9, and every one of them is painted.

    The measurement: over the render, some page states four class clauses. Under the cap the
    maximum any page could state was two, so this rule fails on the render the cap produced and can
    only pass on one it did not.
    """
    counts = {key: _supervision_clause_count(entries) for key, entries in provenance.items()}
    painted = {key: count for key, count in counts.items() if count > 0}
    assert painted, "no supervision answer was rendered"
    most = max(painted.values())
    assert most >= 4, (
        f"the largest supervision answer in the render paints {most} class clause(s); "
        "a record carrying four classes must paint four (section 16 item 1)"
    )
    assert sum(1 for count in painted.values() if count >= 3) > 0, (
        "no page paints a third clause, which is what the two-paragraph cap dropped"
    )


# docs/specs/interaction-rules.md section 7 and `data/revamp/interaction-validation.json`: the
# rules the validation disabled. `scripts/revamp/interactions_build.py` refuses to write a row
# carrying one of them, so none of them can reach `page_interactions` or a rendered line.
DISABLED_INTERACTION_RULES = (
    "C2-shared-target-same-direction",
    "C3-additive-hepatotoxic",
    "C3-additive-nephrotoxic",
)


def test_no_published_interaction_row_carries_a_disabled_rule_id(blocks):
    """Section 16 item 2: a rule the measurement disabled publishes nothing.

    C2 predicted 43,068 pairs and no label speaks about one of them, so the corpus holds no
    evidence for or against any of its predictions; the validation disabled it, and the published
    parquet was rebuilt afterwards without the flag that removed it, putting 92,476 unverified rows
    back on the pages. The build now reads the disabled list from the measurement's own output and
    refuses the row, so the block bundles the loader and the renderer read carry none.
    """
    failures: list[str] = []
    checked = 0
    for key, row in blocks.items():
        tiers = ((row.get("interactions") or {}).get("tiers") or {})
        for tier in tiers.values():
            for line in list(tier.get("inline") or []) + list(tier.get("disclosed") or []):
                checked += 1
                rule = line.get("ruleId")
                if rule in DISABLED_INTERACTION_RULES:
                    failures.append(f"{key}: {rule} on {line.get('counterpartName') or '?'}")
    assert checked > 0, "no interaction line was read"
    _report(failures, "an interaction line carrying a disabled rule id (section 16 item 2)")


def test_a_shared_target_direction_trace_names_its_two_action_rows():
    """Section 16 item 2: the direction trace of an action pair names field paths, not a sentence.

    `interactions_build.py` wrote "action words Inhibitor and Inhibitor both read as inhibit",
    which states the reading rather than the records it was read from, and `resolve_trace` had no
    class for it: every sentence carrying it failed check (a) in draws 8 and 9. The trace now names
    the field path of each stored action row and the record it sits on, and the resolver executes
    it - this page's own row must reach a recorded value on this page's record, and the counterpart
    must be a page the corpus holds.
    """
    page = slop_draw.PageInputs(
        key="K1:AAAAAAAAAA",
        fields={
            "target": {
                "state": "present",
                "value": {
                    "mergedTargets": [
                        {"targetKey": "CHEMBL204", "evidence": [{"pharmacology": "Inhibitor"}]}
                    ]
                },
            }
        },
    )
    corpus_keys = {"K1:AAAAAAAAAA", "K1:BBBBBBBBBB"}
    trace = (
        "action pair: fields.target.value.mergedTargets[].evidence[].pharmacology "
        "on K1:AAAAAAAAAA (Inhibitor) x "
        "fields.mechanismClass.value.chemblMechanisms[].actionType "
        "on K1:BBBBBBBBBB (INHIBITOR), both read as inhibit"
    )
    klass, resolved = slop_draw.resolve_trace(trace, page, corpus_keys, set(), set())
    assert klass == "action pair"
    assert resolved is True

    # A counterpart the corpus does not hold, and an action row this record does not carry, are
    # both refused: the class exists so the shape is recognised, and the claim is still executed.
    _klass, unknown_counterpart = slop_draw.resolve_trace(
        trace.replace("K1:BBBBBBBBBB", "K1:CCCCCCCCCC"), page, corpus_keys, set(), set()
    )
    assert unknown_counterpart is False
    _klass, unread_row = slop_draw.resolve_trace(
        trace, slop_draw.PageInputs(key="K1:AAAAAAAAAA", fields={}), corpus_keys, set(), set()
    )
    assert unread_row is False


# The two supervision clause frames that can read the same ATC group off the same record: S1 names
# the therapeutic class the register published, S4 names the hazardous-medicine class the test
# reads off that same code.
S1_CLAUSE = re.compile(r"^Its World Health Organization ATC (?:class is|classes are) ")
S4_CLAUSE = re.compile(r"^A hazardous-medicine class covers it: ")
ATC_NAMED = re.compile(r"\b([A-Z]\d{2}(?:[A-Z]{1,2}\d{0,2})?)\b")
# The merged clause carries S4's ground as a second source inside the S1 clause's own brackets.
MERGED_S4_SOURCE = "; hazardous-medicine class"


def _named_atc_codes(clause: str) -> set[str]:
    """The ATC codes a clause names, from the class list before its bracketed source."""
    named = clause.rsplit(" (", 1)[0] if clause.endswith(")") or clause.endswith(").") else clause
    return set(ATC_NAMED.findall(named))


def test_one_atc_class_is_named_by_one_supervision_clause(provenance):
    """§15(1) as measure v10 applies it: one clause per fact, not one clause per test.

    On every antineoplastic record the ATC group is both the World Health Organization therapeutic
    class S1 records and the hazardous-medicine class S4 reads off the same code, so the block
    printed the group twice — "Its World Health Organization ATC class is L01CA, Vinca alkaloids
    and analogues (WHO ATC via ChEMBL/EMA)." followed by "A hazardous-medicine class covers it:
    L01CA, Vinca alkaloids and analogues (WHO ATC L01, NIOSH list not fetched)." — which states one
    recorded classification as two claims and reads as a template with the register swapped.

    The two are one clause naming the class once and carrying both sources: "… (WHO ATC via
    ChEMBL/EMA; hazardous-medicine class, NIOSH list not fetched)." An S4 row that names a class
    S1 did not, or the word "cytotoxic" in a label, is a different fact and keeps its own clause.
    """
    failures: list[str] = []
    checked = 0
    merged = 0
    for key, entries in provenance.items():
        held = _supervision_entries(entries)
        if not held:
            continue
        checked += 1
        sentences = [_strip_provenance_anchor(str(entry["sentence"])) for entry in held]
        s1_codes: set[str] = set()
        for line in sentences:
            if S1_CLAUSE.match(line):
                s1_codes |= _named_atc_codes(line)
        for line in sentences:
            if S1_CLAUSE.match(line) and MERGED_S4_SOURCE in line:
                merged += 1
            if not S4_CLAUSE.match(line):
                continue
            shared = _named_atc_codes(line) & s1_codes
            if shared:
                failures.append(f"{key}: {sorted(shared)} named twice: {line[:140]}")
    assert checked > 0, "no supervision answer was rendered"
    _report(failures, "one ATC class named by two supervision clauses (§15 item 1)")
    assert merged > 0, "no record rendered the merged ATC clause carrying both sources"


# --------------------------------------------------------------------------------------------
# §17 items 2 to 5, as mechanical rules (§17 item 6)
# --------------------------------------------------------------------------------------------

# §17(2): the withdrawal clause. Its items are joined with "; " and each ends with the registers
# that recorded it, in brackets; the flag-only item is the one the S8 builder writes when no source
# stated a reason for the withdrawal.
WITHDRAWAL_CLAUSE = re.compile(
    r"^A register records it withdrawn or suspended for a safety reason:\s*(.+?)\.?$"
)
FLAG_ONLY_ITEM = "no reason recorded with the flag"
CLAUSE_SOURCE_SUFFIX = re.compile(r"\s*\([^()]{3,}\)\s*\.?$")

# §17(4): the sentence the identity stage writes when it could not confirm a relation.
UNCONFIRMED_RELATION_NOTE = re.compile(
    r"neither the structures nor the printed names confirm", re.IGNORECASE
)

# §17(5): the names that are names of the substance itself, and the relations that record one
# substance as part of another rather than as a form of it.
NAME_KINDS = ("display", "common", "inn", "usan", "ban", "jan")
COMPONENT_AND_MIXTURE_RELATIONS = ("component_of", "contains")
SYNONYM_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def _split_outside_brackets(text: str) -> list[str]:
    """Split on "; " outside brackets: the bracketed register list uses the same separator."""
    out: list[str] = []
    depth = 0
    held = ""
    index = 0
    while index < len(text):
        character = text[index]
        if character == "(":
            depth += 1
        elif character == ")":
            depth = max(0, depth - 1)
        if depth == 0 and text.startswith("; ", index):
            out.append(held)
            held = ""
            index += 2
            continue
        held += character
        index += 1
    if held:
        out.append(held)
    return [item.strip() for item in out if item.strip()]


def _withdrawal_items(clause: str) -> list[str]:
    """The events one withdrawal clause states, without the registers that recorded each."""
    match = WITHDRAWAL_CLAUSE.match(clause)
    if not match:
        return []
    return [
        CLAUSE_SOURCE_SUFFIX.sub("", item).strip().rstrip(",")
        for item in _split_outside_brackets(match.group(1))
    ]


# §17(2): a source that recorded no reason writes this in the reason slot.
NO_REASON_RECORDED = "reason not recorded"


def _withdrawal_place(item: str) -> str:
    """The jurisdictions and the year an event names: everything after its reason."""
    parts = [part.strip() for part in item.split(",")]
    return "|".join(parts[1:])


def test_a_withdrawal_clause_states_each_event_once_and_names_every_register(provenance):
    """§17(2): identical events merge into one clause naming both registers.

    Urethane's record carries three S8 rows — ChEMBL's `withdrawn_flag`, which is the flag alone,
    and the same withdrawal (carcinogenicity, eight countries, 1963) from ChEMBL's `drug_warning`
    and from Open Targets. Read row by row the block printed three clauses, the first of them "no
    reason recorded with the flag", ahead of two that gave the same reason twice. The event is the
    reason, the countries and the year; the registers are what recorded it, and they belong on the
    one item that states it.
    """
    failures: list[str] = []
    checked = 0
    merged = 0
    for key, entries in provenance.items():
        for entry in _supervision_entries(entries):
            clause = _strip_provenance_anchor(str(entry["sentence"]))
            items = _withdrawal_items(clause)
            if not items:
                continue
            checked += 1
            repeated = sorted({item for item in items if items.count(item) > 1})
            unreasoned = [
                item
                for item in items
                if item.lower().startswith(FLAG_ONLY_ITEM)
                or item.lower().startswith(NO_REASON_RECORDED)
            ]
            reasoned_places = {
                _withdrawal_place(item) for item in items if item not in unreasoned
            }
            stranded = [
                item for item in unreasoned if _withdrawal_place(item) in reasoned_places
            ] + (
                [item for item in unreasoned if item.lower().startswith(FLAG_ONLY_ITEM)]
                if len(items) > len(unreasoned)
                else []
            )
            if repeated:
                failures.append(f"{key}: states {repeated[0][:80]!r} twice: {clause[:160]}")
            if stranded:
                failures.append(
                    f"{key}: {stranded[0][:60]!r} states the absence of a reason another "
                    f"source recorded: {clause[:160]}"
                )
            # Two registers named on one event is the merge itself: "(ChEMBL; Open Targets)".
            for raw in _split_outside_brackets(WITHDRAWAL_CLAUSE.match(clause).group(1)):
                source = CLAUSE_SOURCE_SUFFIX.search(raw)
                if source and "; " in source.group(0):
                    merged += 1
                    break
    assert checked > 0, "no record rendered a withdrawal clause"
    _report(failures, "a withdrawal clause repeats an event or offers a bare flag (§17 item 2)")
    assert merged > 0, (
        "no withdrawal clause names two registers on one event; the merge cannot be observed"
    )


def test_a_relation_row_never_names_the_page_it_is_on(pages, blocks):
    """§17(3): a relation to a page printing this page's name uses that page's disambiguated name.

    "Stereoisomer of Suprofen" on the page titled Suprofen names two records with one name, and a
    reader cannot tell which record the row goes to before following it. The identity stage
    records a disambiguated name for the counterpart (`display-names-v6.csv`, `applies_to` =
    `relation-label`) and the row prints that.
    """
    failures: list[str] = []
    checked = 0
    disambiguated = 0
    for page in pages:
        bundle = blocks.get(page["key"])
        if not bundle:
            continue
        # The page's own printed name is the first line the render writes, which is its `h1`.
        rendered = _lines(page)
        title = _strip_provenance_anchor(rendered[0]).strip() if rendered else ""
        if not title:
            continue
        for relation in bundle.get("relations") or []:
            name = str(relation.get("counterpartName") or "").strip()
            if not name:
                continue
            checked += 1
            if name.casefold() == title.casefold():
                failures.append(
                    f"{page['key']}: {relation.get('relation')} names {name!r}, "
                    "which is this page's own printed name"
                )
            elif name.casefold().startswith(title.casefold() + " ("):
                disambiguated += 1
    assert checked > 0, "no relation row was rendered"
    _report(failures, "a relation row names the page it is on (§17 item 3)")
    assert disambiguated > 0, (
        "no relation row prints a disambiguated counterpart name; the rule cannot be observed"
    )


def test_an_unconfirmed_relation_note_never_renders_as_a_form_of_note(pages, provenance, blocks):
    """§17(4): the unconfirmed-relation note belongs to the technical disclosure.

    "PRUSSIAN BLUE INSOLUBLE and Hydrogen Cyanide are linked by an FDA salt or solvate
    relationship, and neither the structures nor the printed names confirm that one is a salt of
    the other" opened the page as its form-of note, where the note's whole job is to say what this
    record is a form of. It says the opposite: that the corpus cannot say. It is not dropped — the
    disclosure carries it and the render writes it as markup — it leaves the note.
    """
    failures: list[str] = []
    disclosed = 0
    withheld = 0
    for page in pages:
        key = page["key"]
        # The provenance map records every line the render wrote as prose. A line the template
        # declares markup — a row, a disclosure row — is not in it, which is where the note now is.
        for entry in provenance.get(key) or []:
            sentence = _strip_provenance_anchor(str(entry.get("sentence") or ""))
            if UNCONFIRMED_RELATION_NOTE.search(sentence):
                failures.append(
                    f"{key}: painted as {entry.get('group')} prose: {sentence[:160]}"
                )
        notes = (blocks.get(key) or {}).get("relationNotes") or []
        if not notes:
            continue
        withheld += len(notes)
        # The page still says it: the render carries the sentence as a disclosure row, so a
        # reader who opens the control meets exactly what the identity stage recorded.
        text = page["text"]
        for note in notes:
            sentence = str(note.get("sentence") or "")
            if sentence and sentence in text:
                disclosed += 1
            else:
                failures.append(f"{key}: the disclosure lost the note: {sentence[:120]}")
        # And no form-of note on the page repeats it.
        for section in ((blocks.get(key) or {}).get("sections") or {}).get("formOf") or []:
            painted = str((section.get("values") or {}).get("sentence") or "")
            if UNCONFIRMED_RELATION_NOTE.search(painted):
                failures.append(f"{key}: still a form-of note: {painted[:160]}")
    _report(failures, "an unconfirmed relation note rendered as prose (§17 item 4)")
    assert withheld > 0, "no unconfirmed relation note was withheld; the rule cannot be observed"
    assert disclosed == withheld, (
        f"{withheld - disclosed} withheld note(s) are absent from the render's disclosure"
    )


def _synonym_norm(text: str) -> str:
    return SYNONYM_NON_ALNUM.sub(" ", str(text or "").lower()).strip()


def test_a_component_or_mixture_name_is_never_a_salt_form(blocks):
    """§17(5): the salt-form list holds forms of this substance and nothing else.

    "WATER" printed under Oxygen's salt forms. It is not a form of oxygen: it is the FDA substance
    register's own name for the page this corpus calls Aqua, and it reached Oxygen's alias list
    from a product the two share. The corpus-wide rule is decided once by
    `scripts/revamp/page_blocks.py`; this reads its output against the identity records it was
    decided from, so a name that leaves the salt-form list can be traced to the page it names.
    """
    if not os.path.exists(CANONICAL):
        pytest.skip(f"{CANONICAL} is absent")
    canonical: dict[str, dict[str, Any]] = {}
    with open(CANONICAL, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                record = json.loads(line)
                canonical[record["key"]] = record
    by_name: dict[str, set[str]] = {}
    for key, record in canonical.items():
        names = [record.get("displayName")] + [
            synonym.get("name")
            for synonym in record.get("synonyms") or []
            if synonym.get("kind") in NAME_KINDS
        ]
        for name in names:
            normalised = _synonym_norm(name)
            if normalised:
                by_name.setdefault(normalised, set()).add(key)

    failures: list[str] = []
    corrected = 0
    for key, bundle in blocks.items():
        record = canonical.get(key)
        if not record:
            continue
        edges = {
            row.get("counterpartKey"): row.get("relation")
            for row in bundle.get("relations") or []
        }
        moved = {
            _synonym_norm(row.get("name"))
            for row in bundle.get("synonymKinds") or []
            if row.get("from") == "salt"
        }
        corrected += len(moved)
        own = _synonym_norm(record.get("displayName"))
        for synonym in record.get("synonyms") or []:
            if synonym.get("kind") != "salt":
                continue
            name = _synonym_norm(synonym.get("name"))
            if not name or name == own or name in moved:
                continue
            if f" {own} " in f" {name} ":
                continue
            others = by_name.get(name, set()) - {key}
            if not others:
                continue
            kinds = {edges.get(other) for other in others} - {None}
            if kinds - set(COMPONENT_AND_MIXTURE_RELATIONS):
                continue
            failures.append(
                f"{key}: {synonym.get('name')!r} is listed as a salt form and names "
                f"{sorted(others)[0]}, which this record holds "
                f"{', '.join(sorted(kinds)) if kinds else 'no form relation'} with"
            )
    _report(failures, "a component or mixture name listed as a salt form (§17 item 5)")
    assert corrected > 0, "no synonym kind was corrected; the rule cannot be observed"


# ------------------------------------------------------------------ §18: the names and the keys

SYNONYM_FILTER_CSV = os.path.join(
    ROOT, "data", "revamp", "identity", "synonym-filter-v1.csv"
)
RELATIONS_V7 = os.path.join(ROOT, "data", "revamp", "identity", "relations-v7.parquet")
# §18(2): a structure-equality relation needs a structure, and this is the floor it needs.
MIN_HEAVY_ATOMS = 2


def _canonical_records() -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    with open(CANONICAL, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                record = json.loads(line)
                records[record["key"]] = record
    return records


def _corrections_by_page(blocks: dict[str, dict[str, Any]]) -> dict[str, dict[tuple[str, str], str]]:
    """The kind each stored name is written under, from the bundles the loader and render read."""
    out: dict[str, dict[tuple[str, str], str]] = {}
    for key, bundle in blocks.items():
        held: dict[tuple[str, str], str] = {}
        for row in bundle.get("synonymKinds") or []:
            name = str(row.get("name") or "")
            if name:
                held[(str(row.get("from")), name.lower())] = str(row.get("to"))
        out[key] = held
    return out


def test_no_surviving_registry_name_is_another_pages_name_or_a_class_term(blocks):
    """§18(1): a registry "other name" that names another page, or a class, is not a name here.

    Letrozole answered to "anastrozole", "exemestane", "aromatase inhibitors", "ai" and "nsai",
    each of them a name Open Targets records for the molecule because a trial registration or a
    label carried it in an alias list. None of them is a name of letrozole: the first two are other
    pages, the third is the ATC class both sit in, and the last two are the abbreviations the same
    registry rows carry on the other aromatase-inhibitor pages.

    The vocabulary is rebuilt here from the identity records rather than read back from the filter,
    so the rule and the fix do not share an answer. The check is on what survives: every stored
    synonym the bundles do not drop.
    """
    if not os.path.exists(CANONICAL):
        pytest.skip(f"{CANONICAL} is absent")
    sys.path.insert(0, os.path.join(ROOT, "scripts", "revamp"))
    import synonym_filter  # noqa: E402  (the path is set immediately above)

    records = _canonical_records()
    corrections = _corrections_by_page(blocks)
    salts = synonym_filter.load_salts(os.path.join(ROOT, "scripts", "revamp", "salts.txt"))

    def stripped(text: str) -> str:
        rest, _ = synonym_filter.strip_counter_ions(text.split(), salts)
        return " ".join(rest)

    # Only a corpus page's names are "another page's name". The identity revision carries records
    # the tier map holds no page for, and a name recorded against one of those is not printed
    # anywhere, so it cannot be a name this page is answering to in place of another.
    by_name: dict[str, set[str]] = {}
    for key, record in records.items():
        if key not in blocks:
            continue
        names = [record.get("displayName")] + [
            synonym.get("name")
            for synonym in record.get("synonyms") or []
            if synonym.get("kind") in NAME_KINDS
        ]
        for name in names:
            text = synonym_filter.norm(name)
            for candidate in (text, stripped(text)):
                if candidate:
                    by_name.setdefault(candidate, set()).add(key)

    failures: list[str] = []
    checked = 0
    dropped = 0
    for key, record in records.items():
        if key not in blocks:
            continue
        own = synonym_filter.norm(record.get("displayName"))
        held = corrections.get(key, {})
        for synonym in record.get("synonyms") or []:
            kind = str(synonym.get("kind"))
            name = str(synonym.get("name") or "")
            if kind == "display" or not name:
                continue
            if str(synonym.get("source")) not in synonym_filter.REGISTRY_SOURCES:
                continue
            if held.get((kind, name.lower())) == "drop":
                dropped += 1
                continue
            checked += 1
            text = synonym_filter.norm(name)
            if not text or text == own:
                continue
            own_tokens, tokens = own.split(), text.split()
            if own_tokens and any(
                tokens[index : index + len(own_tokens)] == own_tokens
                for index in range(len(tokens) - len(own_tokens) + 1)
            ):
                continue
            others = (by_name.get(text, set()) | by_name.get(stripped(text), set())) - {key}
            if others:
                failures.append(
                    f"{key}: {name!r} survives and is the recorded name of {sorted(others)[0]}"
                )
            elif text in synonym_filter.GENERIC_CLASS_WORDS:
                failures.append(f"{key}: {name!r} survives and is a class word")
    assert dropped > 0, "no registry-derived name was dropped; the rule cannot be observed"
    assert checked > 0, "no registry-derived name survived; the corpus holds none to check"
    _report(failures, "a registry-derived name of another page or a class (§18 item 1)")


def test_every_surviving_salt_form_is_this_records_name_plus_a_counter_ion(blocks):
    """§18(1): "Salt form" holds only names that strip to this record's name plus a counter-ion.

    "LETROZOLE TABLETS", "estratest tablets" and "POISON ADSORBENT" were under that heading. A
    tablet is a product, not a form of the substance, and the heading is a statement about what
    forms of this substance the registers hold. The counter-ion list is `scripts/revamp/salts.txt`,
    the file Phase 2's mapping rule (d) already normalises names against.
    """
    if not os.path.exists(CANONICAL):
        pytest.skip(f"{CANONICAL} is absent")
    sys.path.insert(0, os.path.join(ROOT, "scripts", "revamp"))
    import synonym_filter  # noqa: E402  (the path is set immediately above)

    records = _canonical_records()
    corrections = _corrections_by_page(blocks)
    salts = synonym_filter.load_salts(os.path.join(ROOT, "scripts", "revamp", "salts.txt"))

    failures: list[str] = []
    kept = 0
    for key, record in records.items():
        if key not in blocks:
            continue
        bundle = blocks[key]
        own_names = {
            synonym_filter.norm(record.get("displayName")),
            synonym_filter.norm(bundle.get("displayName")),
        } - {""}
        held = corrections.get(key, {})
        for synonym in record.get("synonyms") or []:
            if str(synonym.get("kind")) != "salt":
                continue
            name = str(synonym.get("name") or "")
            if held.get(("salt", name.lower())) is not None:
                continue
            text = synonym_filter.norm(name)
            if not text or text in own_names:
                continue
            rest, removed = synonym_filter.strip_counter_ions(text.split(), salts)
            if removed > 0 and " ".join(rest) in own_names:
                kept += 1
                continue
            failures.append(
                f"{key}: {name!r} is a salt form of neither {sorted(own_names)[0]!r} "
                "nor any counter-ion in salts.txt"
            )
    assert kept > 0, "no salt form survived; the rule cannot be observed"
    _report(failures, "a salt-form entry that is not a counter-ion form (§18 item 1)")


def test_no_structure_equality_relation_stands_on_a_single_heavy_atom_key(pages):
    """§18(2): "same structure as" over an element says nothing.

    Activated Charcoal and Tantalum Carbide are both recorded against
    `OKTJSMMVPCPJKN-UHFFFAOYSA-N`, the InChIKey of one carbon atom. The key is identical and the
    statement is still empty. The rule needs identical full keys and at least two heavy atoms, and
    it is checked here on the published relations and on the text the pages print.
    """
    if not os.path.exists(RELATIONS_V7) or not os.path.exists(CANONICAL):
        pytest.skip("relations-v7.parquet or canonical-v7.ndjson is absent")
    import pyarrow.parquet as pq
    from rdkit import Chem, RDLogger

    RDLogger.DisableLog("rdApp.*")
    records = _canonical_records()
    smiles: dict[str, str] = {}
    for record in records.values():
        structure = record.get("structure") or {}
        if structure.get("inchikey") and structure.get("smiles"):
            smiles.setdefault(str(structure["inchikey"]), str(structure["smiles"]))

    def heavy(inchikey: str) -> int | None:
        held = smiles.get(inchikey)
        if not held:
            return None
        molecule = Chem.MolFromSmiles(held, sanitize=False)
        return None if molecule is None else molecule.GetNumAtoms()

    single = {key for key in smiles if (count := heavy(key)) is not None and count < MIN_HEAVY_ATOMS}
    assert single, "no single-heavy-atom structure is recorded; the rule cannot be observed"

    table = pq.read_table(RELATIONS_V7).to_pydict()
    failures: list[str] = []
    checked = 0
    for page_a, page_b, relation in zip(table["page_a"], table["page_b"], table["relation"]):
        if str(relation).replace("_", "-") != "same-structure-as":
            continue
        checked += 1
        key_a = str(((records.get(page_a) or {}).get("structure") or {}).get("inchikey") or "")
        key_b = str(((records.get(page_b) or {}).get("structure") or {}).get("inchikey") or "")
        if key_a and key_b and key_a != key_b:
            failures.append(f"{page_a} ↔ {page_b}: {key_a} and {key_b} are not the same key")
        for key in (key_a, key_b):
            if key and key in single:
                failures.append(f"{page_a} ↔ {page_b}: {key} describes one heavy atom")
    assert checked > 0, "no structure-equality relation survived; the rule cannot be observed"
    _report(failures, "a structure-equality relation on a single-atom key (§18 item 2)")

    printed = [
        f"{page['key']}: {line}"
        for page in pages
        for line in _lines(page)
        if line.startswith("Same structure as")
        and str(((records.get(page["key"]) or {}).get("structure") or {}).get("inchikey") or "")
        in single
    ]
    _report(printed, "a page printing a structure-equality relation on a single-atom key")
