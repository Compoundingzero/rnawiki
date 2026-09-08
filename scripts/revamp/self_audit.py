#!/usr/bin/env python3
"""Phase 4 section 14 item 16 — the self-audit, against a painted build.

"The fix agent renders 30 random pages (10 per tier) on its build and checks every rule in section
13 and section 14 mechanically where a rule is mechanical (no register status in the supervision
answer; no application row outside the registration block; no painted key or record id; lists <= 6;
provenance only in closed details; event order; one relation per pair; whitespace between spans)."

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

# Section 14 item 1: the one shape the supervision answer takes, and the words of a prescription
# classification, which is not a supervision reason.
SUPERVISION_ANSWER = re.compile(r"^A register records .+ under medical supervision: ")
PRESCRIPTION_ONLY = re.compile(
    r"\b(?:poisons standard|poisons act|poisons rules|prescription[ -]only|schedule 4|POM"
    r"|forensic class)\b"
)

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

  // The supervision block's answer paragraphs.
  const supervision = [
    ...main.querySelectorAll('section[data-block="supervision"] p.cd-paragraph'),
  ].map(text);

  // Every question block's visible content: its heading, its facts, its paragraphs. A row inside
  // the block's closed disclosure is the answer's evidence and is not in scope (section 14 item 2).
  const questions = [...main.querySelectorAll('section.cd-block')].map((block) => ({
    heading: text(block.querySelector('h2.cd-question')),
    visible: [
      ...block.querySelectorAll('dl.cd-facts > div, p.cd-paragraph'),
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
    hubCells,
  };
}""" % {"exclude": json.dumps(EXCLUDE_SELECTOR)}


JOINED_INLINE = re.compile(
    r"<(?:span|a|abbr|time)\b[^>]*>([^<>]+)</(?:span|a|abbr|time)>"
    r"<(?:span|a|abbr|time)\b[^>]*>([^<>]+)<"
)


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
    answer = next((sentence for sentence in payload["supervision"] if sentence), None)
    if answer is not None:
        named = PRESCRIPTION_ONLY.search(answer)
        record(
            RULES[0],
            bool(SUPERVISION_ANSWER.match(answer)) and named is None,
            answer[:160] if named is None else f"names {named.group(0)!r}: {answer[:120]}",
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

    # 6 — two inline elements that both carry text never meet without a text node.
    joined = [
        f"{match.group(1).strip()}|{match.group(2).strip()}"
        for match in JOINED_INLINE.finditer(payload["markup"])
    ]
    record(RULES[5], not joined, joined[0][:140] if joined else "")

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
    joined = [
        f"{match.group(1).strip()}|{match.group(2).strip()}"
        for match in JOINED_INLINE.finditer(payload["markup"])
    ]
    record(RULES[5], not joined, joined[0][:140] if joined else "")
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
    parser.add_argument("--out", default=str(ROOT / "data/revamp/self-audit-round4.json"))
    args = parser.parse_args(argv)
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required (or pass --database-url)")

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
        "spec": "docs/specs/phase4-generators.md#14",
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
