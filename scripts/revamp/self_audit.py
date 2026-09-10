#!/usr/bin/env python3
"""Phase 4 section 14 item 16 and section 15 item 9 — the self-audit, against a painted build.

"The fix agent renders 30 random pages (10 per tier) on its build and checks every rule in section
13 and section 14 mechanically where a rule is mechanical (no register status in the supervision
answer; no application row outside the registration block; no painted key or record id; lists <= 6;
provenance only in closed details; event order; one relation per pair; whitespace between spans)."
Section 15 item 9 extends it with items 1, 5, 6, 7 and 8: the supervision answer is one sourced
clause per recorded class and never the generic class-label list; the ageing question fires only on
an ageing endpoint; a stereochemistry note names no relation the two records do not have; a row in
a counted remainder keeps its own label; and no inline element is glued to the text beside it.

Every rule here is checked against what the browser painted, not against the render text: the
render and the page are one text by section 11, and these are the rules that can only be decided on
the served DOM. The text extraction is `scripts/revamp/dom_parity.py`'s — the same exclusions, the
same fold — so one definition of "what the page says" serves the parity check, the slop draw and
this audit. Two extractions are taken per page: what a reader meets with every disclosure closed,
which is what the visible-list and painted-identifier rules read, and the parity extraction with
every disclosure opened, which is what the whole-page rules read.

    .venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3199 \\
        --database-url "$DATABASE_URL" --out data/revamp/self-audit-round4.json

A rule's result is a pass count over the pages it applies to, and every failure is listed with the
page and the offending text, so a re-run after a generator change says exactly what moved.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
import random
import re
import subprocess
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "revamp"))

from dom_parity import EXCLUDE_SELECTOR, fold  # noqa: E402
from synonym_filter import load_salts, norm as synonym_norm, strip_counter_ions  # noqa: E402

LEGAL_LOG = ROOT / "data/corpus-20k/legal/requests.log"
USER_AGENT = "rnawiki-revamp/1.0 (+https://rnawiki.com; felix360506@gmail.com)"
LEGAL_AGENT = "Playwright chromium via scripts/revamp/self_audit.py (own-site section 14 item 16)"
LEGAL_NOTE = "browser navigation; the page's sub-resource requests are not itemised"

DEFAULT_SEED = 20260911
PER_TIER = 10
HUBS = 10
WIDTH = 1280
NAV_TIMEOUT_MS = 45_000
SELECTOR_TIMEOUT_MS = 20_000
NAV_ATTEMPTS = 3
CONCURRENCY = 4

# Section 14 item 9: how many rows of one list a reader meets before the rest sit behind a control.
VISIBLE_ROWS = 6

# Section 14 item 8: a storage key, in every shape the corpus writes one.
PAGE_KEY = re.compile(r"\b(?:K[1-4]:[0-9A-Za-z]|COMBO:|PRODUCT:|HOLD:|IK:[A-Z])")

# Section 14 item 2: a register application identifier, in every shape the registers write one.
APPLICATION_ID = re.compile(
    r"\b(?:NDA|ANDA|BLA)\s?\d{5,}\b|\bEMEA/H/C/\d+\b|\bdrug code \d+\b", re.IGNORECASE
)

# Section 15 item 1: the supervision answer is one clause per recorded class, each built from that
# class's own evidence and carrying that class's own source in brackets. Three things it is never:
# the section 14 frame that named a class from a list, any of the generic class labels themselves,
# and a prescription classification offered as a reason for supervision.
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
# A prescription classification. The Poisons Standard is named without qualification only where the
# schedule is 8 or 9, which is a controlled schedule; Schedule 4 and the Singapore Poisons Act and
# Poisons Rules schedules are prescription classes and are never a supervision reason.
PRESCRIPTION_ONLY = re.compile(
    r"\b(?:poisons act|poisons rules|prescription[ -]only|schedule 4|POM|forensic class)\b",
    re.IGNORECASE,
)
# Every clause ends with the source it was built from, in brackets.
CLAUSE_SOURCE = re.compile(r"\([^()]{3,}\)\s*\.?$")

# Section 15 item 5: the ageing question, and the vocabulary that licenses it. The table is
# `AGEING_ENDPOINTS` in scripts/corpus-20k/derived/compute.py; these are its keys, which are the
# only words the question may name.
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

# Section 15 item 6: a note that says one record carries no stereochemistry cannot also name a
# stereochemical relation between the two.
NO_STEREOCHEMISTRY = re.compile(r"recorded without stereochemistry", re.IGNORECASE)
STEREO_RELATION = re.compile(r"\b(?:diastereomer|enantiomer)\b", re.IGNORECASE)

# Section 14 item 11: the question the retired `never-dosed` block asked.
ABSENCE_QUESTION = re.compile(r"Has .+ ever reached a person\?")

# Section 14 item 10: the provenance question's shape, with both ends dated.
TIMELINE_QUESTION = re.compile(r"^How did .+ get from (.+) in (\d{4}) to (.+) in (\d{4})\?$")

# Section 14 item 3: what the applications say about the status word.
US_ACTIVE = ("prescription", "over-the-counter")

# Section 14 item 14: the words a hub table's absence cell carries.
HUB_ABSENCE_CELL = {
    "—",
    "not found",
    "not cleared",
    "not checked",
    "no record",
    "not listed",
    "no label indication on record",
    "no generic recorded",
}

# Section 17 item 2: the withdrawal clause. Its items are joined with "; " and each ends with the
# registers that recorded it, in brackets; the flag-only item is the one the S8 builder writes when
# no source stated a reason.
WITHDRAWAL_CLAUSE = re.compile(
    r"^A register records it withdrawn or suspended for a safety reason:\s*(.+)$"
)
FLAG_ONLY_ITEM = "no reason recorded with the flag"

# Section 17 item 4: the sentence the identity stage writes when it could not confirm a relation.
UNCONFIRMED_RELATION_NOTE = re.compile(
    r"neither the structures nor the printed names confirm", re.IGNORECASE
)

# Section 17 item 5: the group heading the salt-form list carries, and the relation labels that
# record one substance as part of another rather than as a form of it.
SALT_FORM_GROUP = "salt form"
COMPONENT_RELATION_LABELS = {"contains", "component of"}

# Section 18 item 1: the corrections `scripts/revamp/synonym_filter.py` decided over the whole
# corpus, and the counter-ion list the salt-form rule reads. The page is the surface under audit and
# these are what it was built from, so a name the filter dropped appearing on the page, or a
# salt-form entry that is not this record's name plus a counter-ion, is a fault the DOM can decide.
SYNONYM_FILTER = ROOT / "data/revamp/identity/synonym-filter-v1.csv"
SALTS = ROOT / "scripts/revamp/salts.txt"

# Section 18 item 2: the relation whose whole claim is that two structures are identical, and the
# label the template prints it under.
# Read with `_` and `-` folded to a space, because the relation reaches the page as the stored kind
# where the template has no label for it.
STRUCTURE_EQUALITY_LABELS = {"same structure as"}
IDENTIFIER_INCHIKEY = "inchikey"

RULES = (
    "supervision answer names no register status",
    "no register application row outside the registration block",
    "no storage key painted",
    "no record id painted outside a closed disclosure",
    "every visible list caps at six rows",
    "adjacent inline elements are separated by a text node",
    "the provenance timeline is dated at both ends and in order",
    "no absence question fires",
    "one relation per pair",
    "the United States status word agrees with its applications",
    "a hub table's absence cells carry data-furniture",
    # Section 15 item 9.
    "every supervision clause carries its own source",
    "the ageing question fires only on an ageing endpoint",
    "a stereochemistry note names no relation the records do not have",
    "every row in a counted remainder keeps its label",
    # Section 17 item 6.
    "a withdrawal clause states each event once and no flag beside a reason",
    "a relation row never names the page it is on",
    "an unconfirmed relation note renders only inside a closed disclosure",
    "the salt-form list holds no component or mixture name",
    # Section 18 item 3.
    "no name the synonym filter removed is painted",
    "every salt-form entry is this record's name plus a counter-ion",
    "no structure-equality relation on a single-heavy-atom key",
)


EXTRACT_JS = """() => {
  const main = document.querySelector('main');
  if (!main) return null;

  const closedDisclosure = (node) => {
    for (let el = node; el; el = el.parentElement) {
      if (el.tagName === 'DETAILS' && !el.open) return el;
    }
    return null;
  };
  const text = (node) =>
    node ? (node.innerText || node.textContent || '').replace(/\\s+/g, ' ').trim() : '';

  // What a reader meets: the page as served, every disclosure closed, the chrome and the markup
  // the template declares hidden exactly as `dom_parity.py` hides them.
  const hidden = [...main.querySelectorAll(%(exclude)s)];
  for (const el of hidden) el.dataset.selfAuditHidden = el.style.display || 'unset';
  for (const el of hidden) el.style.display = 'none';
  void main.offsetHeight;
  const painted = main.innerText || '';

  // Every list a reader meets without opening anything, by the element that holds it.
  const visibleLists = [];
  for (const list of main.querySelectorAll(
    'ul.cd-rows, ul.cd-relations, ul.cd-interactions, ul.cd-source-rows, ' +
      'ul.cd-other-registers, dl.cd-facts'
  )) {
    if (closedDisclosure(list)) continue;
    const rows = list.tagName === 'DL'
      ? list.querySelectorAll(':scope > div')
      : list.querySelectorAll(':scope > li');
    visibleLists.push({ selector: list.className, rows: rows.length });
  }

  // Every record id, and whether it is inside a closed disclosure.
  const identifiers = [...main.querySelectorAll('.cd-row-id')].map((el) => ({
    text: text(el),
    closed: Boolean(closedDisclosure(el)),
  }));

  // The supervision block's answer, in painted order. Section 16 item 1 paints the class clauses
  // as list items and leaves the record's own study scope, where it has one, as the paragraph
  // after them, so both element kinds are read and `querySelectorAll` returns them in document
  // order — the clauses first, the scope sentence last, which is the order the rules below read.
  const supervision = [
    ...main.querySelectorAll(
      'section[data-block="supervision"] li.cd-clause, ' +
        'section[data-block="supervision"] p.cd-paragraph',
    ),
  ].map(text);

  // Every question block's visible content: its heading, its facts, its paragraphs. A row inside
  // the block's closed disclosure is the answer's evidence and is not in scope (section 14 item 2).
  const questions = [...main.querySelectorAll('section.cd-block')].map((block) => ({
    heading: text(block.querySelector('h2.cd-question')),
    visible: [
      ...block.querySelectorAll('dl.cd-facts > div, p.cd-paragraph, li.cd-clause'),
    ]
      .filter((el) => !closedDisclosure(el))
      .map(text),
  }));

  // The registration block's jurisdiction lines, label and status apart.
  const registration = [...main.querySelectorAll('section.cd-register li')].map((row) => ({
    label: text(row.querySelector('.cd-register-label')),
    status: text(row.querySelector('.cd-register-status')),
  }));

  // The relation rows, as label and name.
  const relations = [...main.querySelectorAll('section[aria-labelledby="cd-relations-heading"] li')]
    .map((row) => ({
      label: text(row.querySelector('span')),
      name: text(row.querySelector('a')) || text(row.querySelectorAll('span')[1]),
    }));

  // Section 15 item 7: every row a reader can reach, with the label the template painted on it
  // and the heading of the group it sits under. A row inside a counted remainder was painting its
  // value alone: "6", "1", "1", under "4 more recorded rows".
  const rows = [];
  for (const list of main.querySelectorAll('ul.cd-rows')) {
    const details = list.closest('details');
    const heading = details
      ? text(details.querySelector(':scope > summary'))
      : text(list.previousElementSibling && list.previousElementSibling.matches('h3')
          ? list.previousElementSibling
          : null);
    for (const row of list.querySelectorAll(':scope > li')) {
      rows.push({
        heading,
        label: text(row.querySelector('.cd-row-label')),
        value: text(row.querySelector('.cd-row-value')) || text(row),
      });
    }
  }

  // Section 17 item 4: the identity stage's unconfirmed-relation notes, with the control they sit
  // in. The parity extraction hides the whole relations block as markup, so the note is read off
  // the DOM here — text, and whether a closed <details> encloses it.
  const relationNotes = [
    ...main.querySelectorAll('.cd-relation-notes li'),
  ].map((el) => ({ text: text(el), closed: Boolean(closedDisclosure(el)) }));

  // The form-of region, which section 17 item 4 takes the note out of.
  const formOfRegion = text(main.querySelector('section.cd-form-of'));

  // Section 17 item 3: the name this page prints for itself. A relation row that names it is a
  // row pointing at another record by this record's name.
  const title = text(main.querySelector('h1'));

  // Section 17 item 5: the header's name groups, by the label the template heads each with.
  const synonymGroups = [];
  for (const list of main.querySelectorAll('dl.cd-synonyms')) {
    let label = '';
    for (const child of list.children) {
      if (child.tagName === 'DT') label = text(child);
      else if (child.tagName === 'DD') synonymGroups.push({ label, name: text(child) });
    }
  }

  // Section 18 item 3: the identifiers the record prints, by their label. The InChIKey row is what
  // the structure-equality rule reads the page's structure key off.
  const identifierRows = [...main.querySelectorAll('section.cd-record dl > div')].map((row) => ({
    label: text(row.querySelector('dt')),
    value: text(row.querySelector('dd')),
  }));

  // Section 15 item 6: the form-of note, which is a sentence about two records' structures.
  const formOfNotes = [
    ...main.querySelectorAll('section.cd-form-of p.cd-paragraph'),
  ].map(text);

  // A hub table's cells, with the furniture mark the template put on them.
  const hubCells = [...main.querySelectorAll('table td')].map((cell) => ({
    text: text(cell),
    furniture: cell.dataset.furniture === 'true',
  }));

  for (const el of hidden) el.style.display = el.dataset.selfAuditHidden === 'unset' ? '' : el.dataset.selfAuditHidden;

  // The markup, for the whitespace rule: two inline elements that both carry text and meet with
  // nothing between them is what produced "EUEMEA/H/C/005413" in every text extraction.
  const markup = main.innerHTML;

  // The parity extraction: every disclosure open, the same exclusions. `dom_parity.py`'s own.
  for (const details of main.querySelectorAll('details')) details.open = true;
  for (const el of main.querySelectorAll(%(exclude)s)) el.style.display = 'none';
  void main.offsetHeight;
  const opened = main.innerText || '';

  return {
    painted,
    opened,
    markup,
    visibleLists,
    identifiers,
    supervision,
    questions,
    registration,
    relations,
    rows,
    formOfNotes,
    identifierRows,
    hubCells,
    title,
    synonymGroups,
    relationNotes,
    formOfRegion,
  };
}""" % {"exclude": json.dumps(EXCLUDE_SELECTOR)}


# Section 14 item 7 and section 15 item 8. Two shapes, both of which every text extraction reads as
# one word: two inline elements meeting with nothing between them ("EUEMEA/H/C/005413"), and an
# inline element meeting the text beside it ("INTERPRETATIONno human trial recorded").
JOINED_INLINE = re.compile(
    r"<(?:span|a|abbr|time)\b[^>]*>([^<>]+)</(?:span|a|abbr|time)>"
    r"<(?:span|a|abbr|time)\b[^>]*>([^<>]+)<"
)
JOINED_TEXT = re.compile(
    r"<(span|a|abbr|time)\b[^>]*>([^<>]+)</\1>([A-Za-z0-9][^<>]{0,40})"
)


def glued(markup: str) -> list[str]:
    """Every pair of things the markup joins with no text node between them (§15 item 8)."""
    out = [
        f"{match.group(1).strip()}|{match.group(2).strip()}"
        for match in JOINED_INLINE.finditer(markup)
    ]
    out.extend(
        f"{match.group(2).strip()}|{match.group(3).strip()}"
        for match in JOINED_TEXT.finditer(markup)
    )
    return out


@dataclass
class Recorded:
    """What the corpus decided, read once, so the DOM rules have something to check against."""

    dropped: dict[str, set[str]]
    salts: list[tuple[str, ...]]
    single_atom_keys: set[str]


RECORDED = Recorded(dropped={}, salts=[], single_atom_keys=set())


def load_recorded() -> Recorded:
    """The §18 corrections, the counter-ion list, and the keys that describe one heavy atom."""
    dropped: dict[str, set[str]] = defaultdict(set)
    if SYNONYM_FILTER.exists():
        with SYNONYM_FILTER.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                if row.get("to_kind") == "drop" and row.get("key") and row.get("name"):
                    dropped[row["key"]].add(row["name"].strip().casefold())

    # The keys that describe one heavy atom, counted from the structure the identity revision
    # records for them. Derived here rather than read back from the removal list, so the rule and
    # the fix do not share an answer.
    from rdkit import Chem, RDLogger

    RDLogger.DisableLog("rdApp.*")
    single: set[str] = set()
    canonical = ROOT / "data/revamp/identity/canonical-v7.ndjson"
    if canonical.exists():
        with canonical.open(encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                structure = (json.loads(line).get("structure") or {})
                key, smiles = structure.get("inchikey"), structure.get("smiles")
                if not key or not smiles or key in single:
                    continue
                molecule = Chem.MolFromSmiles(smiles, sanitize=False)
                if molecule is not None and molecule.GetNumAtoms() < 2:
                    single.add(key)
    return Recorded(dropped=dict(dropped), salts=load_salts(str(SALTS)), single_atom_keys=single)


@dataclass
class Target:
    kind: str
    tier: int
    path: str
    key: str


@dataclass
class Result:
    failures: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))
    applied: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    passed: dict[str, int] = field(default_factory=lambda: defaultdict(int))


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


def draw(database_url: str, seed: int) -> list[Target]:
    rng = random.Random(seed)
    targets: list[Target] = []
    by_tier: dict[int, list[tuple[str, str]]] = defaultdict(list)
    for key, slug, tier in psql(database_url, 'SELECT "key", slug, tier FROM corpus_pages'):
        by_tier[int(tier)].append((key, slug))
    for tier in sorted(by_tier):
        held = sorted(by_tier[tier])
        for key, slug in rng.sample(held, min(PER_TIER, len(held))):
            targets.append(Target(kind="page", tier=tier, path=f"/d/{slug}", key=key))
    hubs = sorted(
        (row[0], row[1]) for row in psql(database_url, "SELECT type, slug FROM hubs")
    )
    for hub_type, slug in rng.sample(hubs, min(HUBS, len(hubs))):
        targets.append(
            Target(kind="hub", tier=0, path=f"/h/{hub_type}/{slug}", key=f"{hub_type}/{slug}")
        )
    return targets


async def render(targets: list[Target], base_url: str, issues: list[str]) -> dict[str, dict]:
    from playwright.async_api import async_playwright

    LEGAL_LOG.parent.mkdir(parents=True, exist_ok=True)
    log = LEGAL_LOG.open("a", encoding="utf-8")
    queue: asyncio.Queue[Target] = asyncio.Queue()
    for target in targets:
        queue.put_nowait(target)
    out: dict[str, dict] = {}
    lock = asyncio.Lock()

    async def worker(browser) -> None:
        context = await browser.new_context(
            viewport={"width": WIDTH, "height": 900}, user_agent=USER_AGENT
        )
        tab = await context.new_page()
        try:
            while True:
                try:
                    target = queue.get_nowait()
                except asyncio.QueueEmpty:
                    return
                url = f"{base_url}{target.path}"
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
                                "viewport": str(WIDTH),
                                "agent": LEGAL_AGENT,
                                "note": LEGAL_NOTE,
                            }
                        )
                        + "\n"
                    )
                    log.flush()
                if payload is None or status != 200:
                    issues.append(f"{url} answered {status}; it is not in the audit")
                    continue
                out[target.path] = payload
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


def check_page(target: Target, payload: dict, result: Result) -> None:
    where = target.path
    painted = payload["painted"]
    opened = payload["opened"]

    def record(rule: str, ok: bool, detail: str = "") -> None:
        result.applied[rule] += 1
        if ok:
            result.passed[rule] += 1
        else:
            result.failures[rule].append(f"{where}: {detail}")

    # 1 — the supervision answer names the suppression evidence and no register status.
    #
    # The block's first paragraph is the answer; the second states this record's own study scope
    # ("39 registered studies, largest enrolment 491, longest 8.4 years"), which is a fact about
    # the record and not a classification.
    clauses = [sentence for sentence in payload["supervision"] if sentence]
    # The last paragraph may be this record's own study scope ("39 registered studies, largest
    # enrolment 491"), which is a fact about the record and not a classification; it carries no
    # source of its own and is not a clause. The clauses are the ones that cite something.
    for sentence in clauses:
        prescription = PRESCRIPTION_ONLY.search(sentence)
        generic = GENERIC_CLASS_LABEL.search(sentence)
        retired = RETIRED_SUPERVISION_FRAME.match(sentence)
        detail = (
            f"names {prescription.group(0)!r}"
            if prescription
            else f"names the generic label {generic.group(0)!r}"
            if generic
            else "uses the retired frame"
            if retired
            else ""
        )
        record(
            RULES[0],
            prescription is None and generic is None and retired is None,
            f"{detail}: {sentence[:140]}" if detail else sentence[:140],
        )
    # Section 15 item 1: "a clause without a matching source does not render". Every clause but the
    # study-scope sentence ends with the source it was built from, in brackets.
    for sentence in clauses[: max(0, len(clauses) - 1)] or clauses[:1]:
        record(
            RULES[11],
            bool(CLAUSE_SOURCE.search(sentence)),
            sentence[:140],
        )

    # 2 — no register application row in what a question block paints.
    for block in payload["questions"]:
        for line in block["visible"]:
            match = APPLICATION_ID.search(line)
            record(RULES[1], match is None, f"{block['heading'][:60]} — {line[:120]}")

    # 3 — no storage key anywhere the page paints, disclosures opened included.
    keys = [line for line in opened.split("\n") if PAGE_KEY.search(line)]
    record(RULES[2], not keys, keys[0][:140] if keys else "")

    # 4 — a record id is painted only inside a closed disclosure.
    for identifier in payload["identifiers"]:
        record(RULES[3], identifier["closed"], f"painted {identifier['text'][:80]!r}")

    # 5 — every visible list caps at six rows.
    for held in payload["visibleLists"]:
        record(
            RULES[4],
            held["rows"] <= VISIBLE_ROWS,
            f"{held['selector']} paints {held['rows']} rows",
        )

    # 6 — an inline element never meets the text or the element beside it without a text node.
    record(RULES[5], not glued(payload["markup"]), (glued(payload["markup"]) or [""])[0][:140])

    # 7 — the provenance timeline names both ends, dated, in order.
    for block in payload["questions"]:
        match = TIMELINE_QUESTION.match(block["heading"])
        if not match:
            continue
        record(
            RULES[6],
            int(match.group(2)) <= int(match.group(4)) and match.group(1) != match.group(3),
            block["heading"][:140],
        )

    # 8 — no absence question fires.
    record(
        RULES[7],
        not ABSENCE_QUESTION.search(opened),
        (ABSENCE_QUESTION.search(opened).group(0) if ABSENCE_QUESTION.search(opened) else ""),
    )

    # 9 — one relation per pair, the most specific.
    seen: dict[str, set[str]] = defaultdict(set)
    for relation in payload["relations"]:
        if relation["name"]:
            seen[relation["name"]].add(relation["label"])
    for name, labels in seen.items():
        record(RULES[8], len(labels) == 1, f"{name}: {sorted(labels)}")

    # 10 — the United States status word agrees with its applications.
    for row in payload["registration"]:
        if row["label"] != "United States" or " application" not in row["status"]:
            continue
        lowered = row["status"].lower()
        active = any(word in lowered for word in US_ACTIVE)
        tentative = "tentative approval" in lowered
        contradiction = (
            lowered.startswith("approved") and not active and ("all discontinued" in lowered or tentative)
        ) or (lowered.startswith("discontinued") and active)
        record(RULES[9], not contradiction, row["status"][:140])

    # 12 — section 15 item 5: the ageing question fires only on an ageing endpoint, and the
    # neutral question never names one.
    for block in payload["questions"]:
        heading = block["heading"]
        ageing = AGEING_QUESTION.match(heading)
        if ageing:
            record(
                RULES[12],
                ageing.group(1).strip().lower() in AGEING_ENDPOINT_WORDS,
                heading[:140],
            )
        elif NEUTRAL_READOUT_QUESTION.match(heading):
            # The neutral question's answer names the endpoint in the register's own words, and
            # the ageing reading is exactly what it does not have: "lifespan" is the word seed 9
            # was writing over an event-free-survival endpoint.
            body = " ".join(block["visible"]).lower()
            record(RULES[12], "lifespan" not in body, f"{heading[:60]} — {body[:100]}")

    # 13 — section 15 item 6: a note that records one structure without stereochemistry names no
    # stereochemical relation between the two.
    for note in payload["formOfNotes"]:
        if not NO_STEREOCHEMISTRY.search(note):
            continue
        found = STEREO_RELATION.search(note)
        record(RULES[13], found is None, note[:160])

    # 14 — section 15 item 7: a row under a counted remainder keeps its own label. The rows of a
    # run that shares one label are headed by it and need none — the trial remainder's rows carry
    # that heading as their own label — but a heading that counts rows is not the label of a count,
    # and the phase and status lists under one were painting "6", "1", "1" with nothing to say what
    # each number counted.
    for row in payload["rows"]:
        heading = (row["heading"] or "").strip()
        counted = bool(re.match(r"^\d+ (?:further recorded trials?|more recorded rows?)$", heading))
        if not counted:
            continue
        value = (row["value"] or "").strip()
        if not re.fullmatch(r"\d{1,7}", value):
            continue
        record(
            RULES[14],
            bool(row["label"].strip()),
            f"{heading} — a row painting {value!r} and no label",
        )

    # 15 — section 17 item 2: the withdrawal clause states each event once, names every register
    # that recorded it on that one item, and never offers a flag with no reason beside an item
    # that gives one. Urethane painted "no reason recorded with the flag (ChEMBL)" and then the
    # same carcinogenicity event twice, once per register.
    for sentence in clauses:
        match = WITHDRAWAL_CLAUSE.match(sentence)
        if not match:
            continue
        items = [item.strip() for item in match.group(1).split("; ") if item.strip()]
        details = [CLAUSE_SOURCE.sub("", item).strip().rstrip(",") for item in items]
        flag_only = [item for item in details if item.lower().startswith(FLAG_ONLY_ITEM)]
        repeated = [item for item in set(details) if details.count(item) > 1]
        detail = (
            "a flag-only item beside %d reasoned item(s)" % (len(details) - len(flag_only))
            if flag_only and len(details) > len(flag_only)
            else "repeats %r" % repeated[0][:80]
            if repeated
            else ""
        )
        record(RULES[15], not detail, f"{detail}: {sentence[:160]}" if detail else sentence[:160])

    # 16 — section 17 item 3: a relation row names the record it links to, never the record it is
    # on. Two pages both printing "Suprofen" made "Stereoisomer of Suprofen" a row a reader cannot
    # follow, and the disambiguated name is what the row prints now.
    title = (payload.get("title") or "").strip()
    for relation in payload["relations"]:
        name = (relation["name"] or "").strip()
        if not name or not title:
            continue
        record(
            RULES[16],
            name.casefold() != title.casefold(),
            f"{relation['label']} {name!r} is this page's own printed name",
        )

    # 17 — section 17 item 4: a relation the identity stage could not confirm says so inside a
    # closed control, and the form-of note — the sentence that says what this record IS a form of —
    # never carries it.
    for note in payload.get("relationNotes") or []:
        if not UNCONFIRMED_RELATION_NOTE.search(note.get("text") or ""):
            continue
        record(RULES[17], bool(note.get("closed")),
               "painted outside a closed control: %s" % (note.get("text") or "")[:120])
    region = payload.get("formOfRegion") or ""
    found = UNCONFIRMED_RELATION_NOTE.search(region)
    record(RULES[17], found is None,
           region[max(0, found.start() - 60):found.end() + 40] if found else "")

    # 18 — section 17 item 5: a component or mixture name is not a salt form. The page states both
    # in its own markup — the name under the "Salt form" heading and the relation row that records
    # the component or mixture edge — so the contradiction is decidable here.
    component_names = {
        (relation["name"] or "").strip().casefold()
        for relation in payload["relations"]
        if (relation["label"] or "").strip().casefold() in COMPONENT_RELATION_LABELS
    } - {""}
    for group in payload.get("synonymGroups") or []:
        if (group.get("label") or "").strip().casefold() != SALT_FORM_GROUP:
            continue
        name = (group.get("name") or "").strip()
        record(
            RULES[18],
            name.casefold() not in component_names,
            f"{name!r} is listed as a salt form and as a component or mixture",
        )

    # 19 — section 18 item 1: a name the synonym filter removed is not a name of this substance —
    # a registry-derived name of another page, a class term, or a dosage-form string no register
    # prints as a product name — and the page states none of them, under any heading.
    removed = RECORDED.dropped.get(target.key, set())
    if removed:
        painted_names = {
            (group.get("name") or "").strip().casefold()
            for group in payload.get("synonymGroups") or []
        }
        for name in sorted(removed):
            record(RULES[19], name not in painted_names,
                   f"{name!r} was removed by the synonym filter and is painted")

    # 20 — section 18 item 1: "Salt form" holds only names that strip to the page's own name plus a
    # counter-ion from scripts/revamp/salts.txt. A product string, a dosage form and another
    # substance's name are none of those, and each one made the heading a false statement.
    own_forms = {synonym_norm(title)} - {""}
    for group in payload.get("synonymGroups") or []:
        if (group.get("label") or "").strip().casefold() != SALT_FORM_GROUP:
            continue
        name = (group.get("name") or "").strip()
        text = synonym_norm(name)
        if not text or text in own_forms:
            continue
        rest, stripped = strip_counter_ions(text.split(), RECORDED.salts)
        record(RULES[20], stripped > 0 and " ".join(rest) in own_forms,
               f"{name!r} is under Salt form and is not {title!r} plus a counter-ion")

    # 21 — section 18 item 2: a structure-equality relation needs a structure. An InChIKey of one
    # heavy atom describes an element, and two records that both reduce to one atom have nothing
    # structural in common to state.
    page_key = next(
        ((row.get("value") or "").strip()
         for row in payload.get("identifierRows") or []
         if (row.get("label") or "").strip().casefold() == IDENTIFIER_INCHIKEY),
        "",
    )
    if page_key:
        for relation in payload["relations"]:
            label = (relation["label"] or "").strip().casefold().replace("_", " ").replace("-", " ")
            if label not in STRUCTURE_EQUALITY_LABELS:
                continue
            record(RULES[21], page_key not in RECORDED.single_atom_keys,
                   f"{relation['label']} {relation['name']!r} on {page_key}, one heavy atom")

    assert painted is not None


def check_hub(target: Target, payload: dict, result: Result) -> None:
    where = target.path

    def record(rule: str, ok: bool, detail: str = "") -> None:
        result.applied[rule] += 1
        if ok:
            result.passed[rule] += 1
        else:
            result.failures[rule].append(f"{where}: {detail}")

    # The rules a hub shares with a record page.
    record(RULES[5], not glued(payload["markup"]), (glued(payload["markup"]) or [""])[0][:140])
    keys = [line for line in payload["opened"].split("\n") if PAGE_KEY.search(line)]
    record(RULES[2], not keys, keys[0][:140] if keys else "")

    # 11 — every absence cell in the comparison table is furniture, and no stated value is.
    for cell in payload["hubCells"]:
        text = cell["text"].strip()
        absence = text == "" or text.lower() in HUB_ABSENCE_CELL
        record(
            RULES[10],
            cell["furniture"] == absence,
            f"{text[:60]!r} is {'marked' if cell['furniture'] else 'unmarked'}",
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--out", default=str(ROOT / "data/revamp/self-audit-round5.json"))
    args = parser.parse_args(argv)
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required (or pass --database-url)")

    global RECORDED
    RECORDED = load_recorded()

    targets = draw(args.database_url, args.seed)
    issues: list[str] = []
    painted = asyncio.run(render(targets, args.base_url.rstrip("/"), issues))

    result = Result()
    pages_ok = 0
    hubs_ok = 0
    per_target: list[dict] = []
    for target in targets:
        payload = painted.get(target.path)
        if payload is None:
            issues.append(f"{target.path} was not rendered")
            continue
        before = {rule: len(result.failures[rule]) for rule in RULES}
        if target.kind == "page":
            check_page(target, payload, result)
        else:
            check_hub(target, payload, result)
        failed = [rule for rule in RULES if len(result.failures[rule]) > before[rule]]
        if failed:
            per_target.append({"path": target.path, "kind": target.kind, "failedRules": failed})
        elif target.kind == "page":
            pages_ok += 1
        else:
            hubs_ok += 1

    pages = [target for target in targets if target.kind == "page"]
    hubs = [target for target in targets if target.kind == "hub"]
    report = {
        "generatedBy": "scripts/revamp/self_audit.py",
        "spec": [
            "docs/specs/phase4-generators.md#14",
            "docs/specs/phase4-generators.md#15",
            "docs/specs/phase4-generators.md#18",
        ],
        "baseUrl": args.base_url,
        "seed": args.seed,
        "drawn": {"pages": len(pages), "hubs": len(hubs), "perTier": PER_TIER},
        "rendered": {"pages": pages_ok + len(per_target), "hubs": hubs_ok},
        "pages": f"{pages_ok}/{len(pages)}",
        "hubs": f"{hubs_ok}/{len(hubs)}",
        "rulesChecked": len(RULES),
        "rules": {
            rule: {
                "applied": result.applied[rule],
                "passed": result.passed[rule],
                "failed": len(result.failures[rule]),
                "examples": result.failures[rule][:5],
            }
            for rule in RULES
        },
        "targetsWithAFailure": per_target,
        "issues": issues,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"pages {report['pages']}   hubs {report['hubs']}   rules {len(RULES)}")
    for rule in RULES:
        print(
            "  %-62s %5d/%-5d applied %d"
            % (rule[:62], result.passed[rule], result.applied[rule], result.applied[rule])
        )
    for entry in per_target[:20]:
        print(f"  FAILED {entry['path']}: {', '.join(entry['failedRules'])}")
    for rule in RULES:
        for example in result.failures[rule][:3]:
            print(f"    {rule[:40]:40s} {example[:110]}")
    print(f"written to {os.path.relpath(out, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
