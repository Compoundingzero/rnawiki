#!/usr/bin/env python3
"""Parse the Singapore controlled-substance schedules retrieved from Singapore
Statutes Online and map them onto corpus pages.

Input: the published PDFs saved by `sso_sg_statutes_fetch.py` under
`data/sources/hsa-singapore/<date>/raw/statutes/`. SSO's `?WholeDoc=1` reading
view does not contain the Schedule bodies (it loads them through
`/Details/GetLazyLoadContent` after render) and `?ViewType=Print` returns the
print-selection form, so the PDF is the only retrieved form that carries the
substance lists.

Schedules parsed, each of which lists one substance per record:

  Misuse of Drugs Act 1973
    First Schedule Part 1   Class A controlled drugs
    First Schedule Part 2   Class B controlled drugs
    First Schedule Part 3   Class C controlled drugs
    Fourth Schedule         Specified drugs
  Poisons Act 1938
    The Schedule            Poisons List
  Poisons Rules (Cap. 234, R 1)
    First Schedule          Poisons List substances under the rule 10 restrictions
    Third Schedule          Substances sellable only on a practitioner's prescription
    Sixth Schedule          Substances to which rule 28 (transport) applies
    Seventh Schedule        Substances to which rule 33 (colouring) applies

The Misuse of Drugs Act Third and Fifth Schedules are retrieved but not parsed
into this table. The Third Schedule lists controlled equipment, materials and
precursor substances useful for manufacturing controlled drugs; its entries are
unnumbered running text whose alias clauses wrap onto further lines at the same
indent, so record boundaries are not recoverable from the PDF text layer without
guessing, and its subject matter is manufacturing input rather than a medicine's
control status. The Fifth Schedule lists substances excluded from the Act, which
is not a control class. Both facts are stated in the output manifest.

Mapping follows the revamp spec's priority order. Every schedule name is first
resolved to a UNII through the FDA UNII names file; a page is then reached by
UNII, by full InChIKey, or by InChIKey skeleton (recorded as `form_of`, never
merged). A name that resolves to no UNII reaches no page and is written to the
review list instead.

Outputs:
  data/sources/hsa-singapore/controlled-substances.parquet
  data/sources/hsa-singapore/controlled-substances-unmatched.csv
  data/sources/hsa-singapore/controlled-substances-summary.json
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
import pathlib
import re
import shutil
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402

from corpus_join import load_corpus_index, normalise_name  # noqa: E402
from hsa_sg_map import load_unii_names, load_unii_records, punct_key  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "data" / "sources" / "hsa-singapore"

STATUTES = {
    "misuse-of-drugs-act-1973": {
        "statute": "Misuse of Drugs Act 1973",
        "citation": "Misuse of Drugs Act 1973 (2020 Rev Ed)",
        "url": "https://sso.agc.gov.sg/Act/MDA1973",
    },
    "poisons-act-1938": {
        "statute": "Poisons Act 1938",
        "citation": "Poisons Act 1938 (2020 Rev Ed)",
        "url": "https://sso.agc.gov.sg/Act/PA1938",
    },
    "poisons-rules": {
        "statute": "Poisons Rules",
        "citation": "Poisons Rules (Cap. 234, R 1, 1999 Rev Ed)",
        "url": "https://sso.agc.gov.sg/SL/PA1938-R1",
    },
}

VERSION_LINE = re.compile(
    r"version in force from\s+(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(\d{4})"
)
# Running headers, footers and page numbers that the PDF text layer repeats.
FURNITURE = re.compile(
    r"^(?:\s*)(?:"
    r"Informal Consolidation.*|"
    r".*—\s*continued\s*|"
    r"\s*\d{1,4}\s*|"
    r"(?:CAP\.|\[CAP\.).*|"
    r".*\b(?:20\d\d|19\d\d)\s*Ed\.\s*$|"
    r"^\s*2020 Ed\..*|"
    r".*\bp\.\s*\d+\s*\]?\s*$"
    r")$"
)
AMEND_NOTE = re.compile(r"^\s*\[(?:S|G\.N\.|Act)\s.*\]\s*$")
DELETED = re.compile(r"\[\s*Deleted by [^\]]*\]", re.IGNORECASE)
TRAILING_NOTE = re.compile(r"\s*\[(?:S|G\.N\.|Act)\s[^\]]*\]\s*$")
NUMBERED = re.compile(r"^\s{0,8}\(\s*(\d+[A-Z]{0,4})\s*\)\s+(\S.*)$")
# An item number set across a column break, as `(8AAA` on one line and `A)` on
# the next.
SPLIT_NUMBER_HEAD = re.compile(r"^(\s*)\(\s*(\d+[A-Z]{0,4})\s*$")
SPLIT_NUMBER_TAIL = re.compile(r"^([A-Z]{1,4})\)\s*(.*)$")
PLAIN_NUMBERED = re.compile(r"^\s{0,6}(\d+[A-Z]?)\.\s+(\S.*)$")
ALIAS_OPEN = re.compile(r"\((?:also\s+)?known\s+as\s+", re.IGNORECASE)
SOFT_HYPHEN_JOIN = re.compile(r"[‐‑‒–—]")


def pdf_to_text(pdf: pathlib.Path, out: pathlib.Path) -> str:
    """Extract the PDF text layer, preserving line layout."""
    exe = shutil.which("pdftotext")
    if exe:
        subprocess.run(
            [exe, "-layout", "-enc", "UTF-8", str(pdf), str(out)],
            check=True,
            capture_output=True,
        )
        return out.read_text(encoding="utf-8", errors="replace")
    import pdfplumber

    pages = []
    with pdfplumber.open(str(pdf)) as doc:
        for page in doc.pages:
            pages.append(page.extract_text(layout=True) or "")
    text = "\n".join(pages)
    out.write_text(text, encoding="utf-8")
    return text


def version_date(text: str) -> str:
    dates = set()
    for m in VERSION_LINE.finditer(text):
        day, month, year = (int(x) for x in m.groups())
        dates.add(f"{year:04d}-{month:02d}-{day:02d}")
    if not dates:
        raise RuntimeError("no 'version in force from' line found in the PDF text")
    return max(dates)


def strip_furniture(lines: list[str]) -> list[str]:
    kept = []
    for line in lines:
        if not line.strip():
            continue
        if FURNITURE.match(line):
            continue
        stripped = line.strip()
        if stripped in {
            "Misuse of Drugs Act 1973",
            "Poisons Act 1938",
            "Poisons Rules",
        }:
            continue
        if AMEND_NOTE.match(line):
            continue
        kept.append(line)
    return kept


def find_heading(lines: list[str], heading: str, start: int = 0) -> int:
    """Index of the first line that is exactly `heading` (centred), at or after start."""
    for i in range(start, len(lines)):
        if lines[i].strip() == heading:
            return i
    raise RuntimeError(f"heading not found: {heading!r}")


def region(lines: list[str], start_heading: str, end_heading: str) -> list[str]:
    a = find_heading(lines, start_heading)
    b = find_heading(lines, end_heading, a + 1)
    return lines[a + 1 : b]


def clean_entry(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = TRAILING_NOTE.sub("", text).strip()
    text = re.sub(r"\s*\[(?:S|G\.N\.|Act)\s[^\]]*\]", " ", text)
    return re.sub(r"\s+", " ", text).strip(" .;,")


def join_split_numbers(lines: list[str]) -> list[str]:
    """Rejoin an item number broken across two lines by the column break."""
    out: list[str] = []
    i = 0
    while i < len(lines):
        head = SPLIT_NUMBER_HEAD.match(lines[i])
        if head and i + 1 < len(lines):
            tail = SPLIT_NUMBER_TAIL.match(lines[i + 1].strip())
            if tail:
                out.append(
                    f"{head.group(1)}({head.group(2)}{tail.group(1)}) {tail.group(2)}".rstrip()
                )
                i += 2
                continue
        out.append(lines[i])
        i += 1
    return out


def join_wrapped(parts: list[str]) -> str:
    """Join wrapped lines, closing a word that the line break split on a hyphen."""
    text = ""
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if not text:
            text = part
        elif text.endswith("-"):
            text += part
        else:
            text += " " + part
    return text


def numbered_entries(lines: list[str]) -> list[tuple[str, str]]:
    """Collect `(N) text` records, joining wrapped continuation lines."""
    lines = join_split_numbers(lines)
    out: list[tuple[str, str]] = []
    number = None
    buf: list[str] = []

    def flush() -> None:
        if number is None:
            return
        text = clean_entry(join_wrapped(buf))
        if not text or DELETED.search(text):
            return
        out.append((number, text))

    for line in lines:
        m = NUMBERED.match(line)
        if m:
            flush()
            number, buf = m.group(1), [m.group(2)]
            continue
        if number is None:
            continue
        if PLAIN_NUMBERED.match(line) or line.strip().startswith("PART "):
            flush()
            number, buf = None, []
            continue
        buf.append(line.strip())
    flush()
    return out


# A schedule record wraps onto further lines when it is too long for the column.
# The wrapped part is set flush left like a new record, so the break is read from
# the words themselves: a continuation opens with a lowercase word (but not with
# a locant such as `p-Aminobenzene`, which is how a name is set), or it follows a
# line that is plainly unfinished.
LOCANT_START = re.compile(r"^(?:[a-z]{1,5}|[αβγδεζωπ]|N|O|S|P)[\-‐‑’'](?=[A-Z0-9\(])")
LOWER_START = re.compile(r"^[a-zαβγδεζηθικλμνξοπρστυφχψω]")
UNFINISHED_TAIL = re.compile(
    r"(?:[,\-‐‑–:(/]|"
    r"\b(?:and|or|of|the|in|to|by|with|a|an|at|on|for|from|is|are|be|which|"
    r"that|such|any|its|their|both|as|into|containing|having|each|when|not|"
    r"than|more|less|other|say|being|this|these|those|either|no|nor)"
    r")\s*$",
    re.IGNORECASE,
)
CITATION_ONLY = re.compile(r"^[\s\[]*(?:S|G\.N\.|Act|Sp\.)\s*[\d/;\s.,\]]*$")


def line_entries(lines: list[str], skip_prefixes: tuple[str, ...] = ()) -> list[str]:
    """Collect one-substance-per-line records, joining wrapped continuations."""
    out: list[str] = []
    buf: list[str] = []

    def flush() -> None:
        text = clean_entry(join_wrapped(buf))
        if text and not DELETED.search(text):
            out.append(text)

    prev = ""
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(skip_prefixes) or CITATION_ONLY.match(stripped):
            continue
        indented = line[:1] in {" ", "\t"}
        continuation = bool(buf) and (
            indented
            or (LOWER_START.match(stripped) and not LOCANT_START.match(stripped))
            or bool(UNFINISHED_TAIL.search(prev))
        )
        if continuation:
            buf.append(stripped)
        else:
            flush()
            buf = [stripped]
        prev = stripped
    flush()
    return out


def paragraph_blocks(lines: list[str]) -> list[tuple[str, str, list[str]]]:
    """Split a Schedule Part into `(number, opening text, body lines)` paragraphs."""
    out: list[tuple[str, str, list[str]]] = []
    number = None
    opening = ""
    body: list[str] = []
    for line in lines:
        m = PLAIN_NUMBERED.match(line)
        if m:
            if number is not None:
                out.append((number, opening, body))
            number, opening, body = m.group(1), m.group(2).strip(), []
            continue
        if number is None:
            continue
        # A paragraph's opening words can wrap. Keep absorbing lines into the
        # opening until it reaches the colon that introduces the substance list.
        if not body and not opening.endswith(":") and len(opening) < 400:
            opening = (opening + " " + line.strip()).strip()
            continue
        body.append(line)
    if number is not None:
        out.append((number, opening, body))
    return out


def column_entries(lines: list[str]) -> list[str]:
    """Collect substances from a Class B / Class C paragraph.

    Those paragraphs are set as a table of one or two columns whose cells each
    end in a full stop, and a cell too long for its column wraps onto the next
    line. Fields are read in layout order and a field is appended to the open
    record until the record ends in a full stop.
    """
    fields: list[str] = []
    for line in lines:
        for cell in re.split(r"\s{3,}", line.strip()):
            cell = cell.strip()
            if cell:
                fields.append(cell)
    out: list[str] = []
    buf = ""
    for cell in fields:
        if not buf:
            buf = cell
        elif buf.endswith("-"):
            buf += cell
        else:
            buf += " " + cell
        if buf.endswith("."):
            text = clean_entry(buf)
            if text and not DELETED.search(text):
                out.append(text)
            buf = ""
    if buf:
        text = clean_entry(buf)
        if text and not DELETED.search(text):
            out.append(text)
    return out


def split_aliases(text: str) -> tuple[str, list[str]]:
    """Separate a record's own name from its bracketed `(also known as ...)` lists.

    The alias content itself contains brackets — `N\u2019-(1-(5-Fluoropentyl)-2-
    oxoindolin-3-ylidene)benzohydrazide` — so the closing bracket is found by
    counting depth rather than by taking the first `)`.
    """
    kept: list[str] = []
    blocks: list[str] = []
    i = 0
    while True:
        m = ALIAS_OPEN.search(text, i)
        if not m:
            kept.append(text[i:])
            break
        kept.append(text[i : m.start()])
        depth = 1
        j = m.end()
        while j < len(text):
            if text[j] == "(":
                depth += 1
            elif text[j] == ")":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        blocks.append(text[m.end() : j])
        i = min(j + 1, len(text))
    return " ".join(part for part in kept if part), blocks


# Clause openers used by the schedules to qualify a substance name. Cutting at
# the first one that stands outside brackets leaves the substance itself.
CLAUSE = re.compile(
    r"(?:^|[,;])\s*(?:its\b|their\b|which\b|when\b|that is to say\b|"
    r"including\b|prepared\b|except\b|other than\b|and other\b|and any\b|"
    r"alkaloids of\b|derivatives of\b|salts of\b|esters of\b|ethers of\b|"
    r"oxides of\b|chlorides of\b|glycosides of\b|compounds of\b|"
    r"the active\b|active principles\b|the following\b|being\b|any salt\b|"
    r"whether\b|used\b|intended\b|contained\b|for the\b)",
    re.IGNORECASE,
)
LETTERED_SUBITEM = re.compile(r"\s\((?:[a-z]|[ivx]+)\)\s")
# Clause openers that are safe to cut on after plain whitespace as well.
CLAUSE_WS = re.compile(
    r"\s+(?:and other\b|and its\b|and their\b|and any\b|which are\b|"
    r"that is to say\b|when contained\b|intended for\b|other than\b|except\b|"
    r"prepared\b|containing\b)",
    re.IGNORECASE,
)


def _depth_split(text: str, marker: str, require_space: bool = False) -> str:
    """Text up to the first `marker` that stands outside round brackets.

    With `require_space` the marker only counts when a space follows it, so the
    locant comma in `N-Methyl-\u03b1-ethyl-3,4-methylenedioxyphenethylamine` does not
    cut the name in half while the clause comma in `Belladonna, alkaloids of`
    still does.
    """
    depth = 0
    for i, ch in enumerate(text):
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        elif ch == marker and depth == 0:
            if require_space and not text[i + 1 : i + 2].isspace():
                continue
            return text[:i]
    return text


def names_of(entry: str) -> list[str]:
    """Candidate substance names for one schedule record, best guess first.

    The candidates are tried in order against the FDA UNII names file, so a long
    qualified record such as `Belladonna, alkaloids of; its quarternary
    compounds, their salts` offers `Belladonna` as well as the fuller strings,
    and `1-(4-Bromo-2,5-dimethoxyphenyl)propan-2-amine (also known as ... DOB)`
    offers its bracketed aliases.
    """
    text = SOFT_HYPHEN_JOIN.sub("-", entry)
    text = text.replace("\u2019", "'").replace("\u00a0", " ")
    head, alias_blocks = split_aliases(text)
    aliases: list[str] = []
    for block in alias_blocks:
        pieces = [block] + re.split(r"\s+or\s+", block)
        for piece in list(pieces):
            pieces.extend(re.split(r"\s*,\s*", piece))
        for piece in pieces:
            piece = piece.strip(" .;,)")
            if piece and piece not in aliases:
                aliases.append(piece)
    head = LETTERED_SUBITEM.split(head)[0]
    head = _depth_split(head, ";")
    candidates = [head]
    for pattern in (CLAUSE, CLAUSE_WS):
        cut = pattern.search(head)
        if cut and cut.start() > 0:
            candidates.append(head[: cut.start()])
    comma = _depth_split(head, ",", require_space=True)
    if comma != head:
        candidates.append(comma)
        for pattern in (CLAUSE, CLAUSE_WS):
            cut2 = pattern.search(comma)
            if cut2 and cut2.start() > 0:
                candidates.append(comma[: cut2.start()])
    # A trailing bracketed qualifier, as in `Ethylmorphine (3-ethylmorphine)`.
    bare = re.sub(r"\s*\([^()]*\)\s*$", " ", head)
    candidates.append(bare)
    def keep(name: str) -> str | None:
        name = re.sub(r"\s+", " ", name).strip(" .;,-")
        # A fragment with fewer than three letters, such as the bare item code
        # `940` left by an alias list, names no substance.
        if len(name) < 3 or len(re.findall(r"[A-Za-z]", name)) < 3:
            return None
        return name

    heads: list[str] = []
    for name in candidates:
        cleaned = keep(name)
        if cleaned and cleaned not in heads:
            heads.append(cleaned)
    # Shortest first: the substance itself rather than its qualifying clauses.
    heads.sort(key=len)
    out = list(heads)
    for name in aliases:
        cleaned = keep(name)
        if cleaned and cleaned not in out:
            out.append(cleaned)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    args = ap.parse_args()

    date_dir = SOURCE_DIR / args.date
    statutes_dir = date_dir / "raw" / "statutes"
    # The PDF is the retrieved artefact; its extracted text layer is derived,
    # so it is written outside `raw/`.
    text_dir = date_dir / "derived" / "statutes-text"
    text_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads((date_dir / "statutes-manifest.json").read_text())
    by_file = {
        pathlib.Path(d["path"]).name: d
        for d in manifest["documents"]
        if d.get("path")
    }

    texts: dict[str, str] = {}
    versions: dict[str, str] = {}
    for stem in STATUTES:
        pdf = statutes_dir / f"{stem}.pdf"
        if not pdf.exists():
            raise RuntimeError(f"missing retrieved PDF: {pdf}")
        text = pdf_to_text(pdf, text_dir / f"{stem}.txt")
        texts[stem] = text
        versions[stem] = version_date(text)

    records: list[dict] = []

    def add(
        stem: str,
        schedule_code: str,
        schedule: str,
        entries,
        paragraph_note: str | None = None,
    ) -> None:
        for item in entries:
            if isinstance(item, tuple):
                number, entry = item
            else:
                number, entry = None, item
            names = names_of(entry)
            if not names:
                continue
            records.append(
                {
                    "statute": STATUTES[stem]["statute"],
                    "statute_citation": STATUTES[stem]["citation"],
                    "source_url": STATUTES[stem]["url"],
                    "version_date": versions[stem],
                    "schedule_code": schedule_code,
                    "schedule": schedule,
                    "item_number": number,
                    "substance": entry,
                    "primary_name": names[0],
                    "names": names,
                    "paragraph_note": paragraph_note,
                }
            )

    # --- Misuse of Drugs Act 1973 -----------------------------------------
    mda = strip_furniture(texts["misuse-of-drugs-act-1973"].splitlines())
    first = region(mda, "FIRST SCHEDULE", "SECOND SCHEDULE")
    parts: dict[str, list[str]] = {}
    current = None
    for line in first:
        s = line.strip()
        if s in {"PART 1", "PART 2", "PART 3", "PART 4"}:
            current = s
            parts[current] = []
            continue
        if current:
            parts[current].append(line)
    # Part 1 sets its substances as numbered `(N)` items. Parts 2 and 3 set
    # theirs as a one- or two-column table inside paragraph 1 (and, in Part 3,
    # paragraph 1A), so the two forms are read differently. Paragraphs that name
    # no substance — "Any stereoisomeric form of a substance for the time being
    # specified in paragraph 1" and the like — carry no record.
    add(
        "misuse-of-drugs-act-1973",
        "MDA-Sch1-Part1-ClassA",
        "First Schedule Part 1 — Class A controlled drug",
        numbered_entries(parts["PART 1"]),
    )
    for part, code, label in (
        ("PART 2", "MDA-Sch1-Part2-ClassB", "First Schedule Part 2 — Class B controlled drug"),
        ("PART 3", "MDA-Sch1-Part3-ClassC", "First Schedule Part 3 — Class C controlled drug"),
    ):
        for number, opening, body in paragraph_blocks(parts[part]):
            if not re.match(r"(?i)^.*the following substances", opening):
                continue
            note = None
            m = re.match(r"(?i)^(with effect from .*?),\s*the following", opening)
            if m:
                note = m.group(1)
            entries = [(number, e) for e in column_entries(body)]
            add("misuse-of-drugs-act-1973", code, label, entries, note)

    fourth = region(mda, "FOURTH SCHEDULE", "FIFTH SCHEDULE")
    fourth_entries = [
        (m.group(1), clean_entry(m.group(2)))
        for m in (PLAIN_NUMBERED.match(x) for x in fourth)
        if m
    ]
    # Join wrapped continuations of a Fourth Schedule item.
    joined: list[tuple[str, str]] = []
    number = None
    buf: list[str] = []
    for line in fourth:
        m = PLAIN_NUMBERED.match(line)
        if m:
            if number is not None:
                joined.append((number, clean_entry(" ".join(buf))))
            number, buf = m.group(1), [m.group(2)]
        elif number is not None and line.strip() not in {"SPECIFIED DRUGS"}:
            buf.append(line.strip())
    if number is not None:
        joined.append((number, clean_entry(" ".join(buf))))
    add(
        "misuse-of-drugs-act-1973",
        "MDA-Sch4-Specified",
        "Fourth Schedule — specified drug",
        [(n, t) for n, t in joined if t and not DELETED.search(t)],
    )
    del fourth_entries

    # --- Poisons Act 1938, The Schedule (Poisons List) ---------------------
    pa_lines = texts["poisons-act-1938"].splitlines()
    start = None
    for i, line in enumerate(pa_lines):
        if line.strip() == "POISONS LIST":
            start = i
            break
    if start is None:
        raise RuntimeError("POISONS LIST heading not found in the Poisons Act PDF")
    stop = len(pa_lines)
    for j in range(start + 1, len(pa_lines)):
        if pa_lines[j].strip() in {"LEGISLATIVE HISTORY", "COMPARATIVE TABLE"}:
            stop = j
            break
    if stop == len(pa_lines):
        raise RuntimeError(
            "no LEGISLATIVE HISTORY heading found after the Poisons List; the "
            "end of the Schedule could not be bounded"
        )
    pa_body = strip_furniture(pa_lines[start + 1 : stop])
    # The construction rules that open the List are indented lettered paragraphs.
    pa_body = [
        x
        for x in pa_body
        if not re.match(r"^\s*\([a-z]\)\s", x)
        and x.strip()
        not in {
            "In the construction of this List, unless the contrary intention appears —",
            "THE SCHEDULE",
        }
    ]
    add(
        "poisons-act-1938",
        "PA-Schedule-PoisonsList",
        "The Schedule — Poisons List",
        line_entries(pa_body),
    )

    # --- Poisons Rules schedules ------------------------------------------
    pr_raw = texts["poisons-rules"].splitlines()
    pr = strip_furniture(pr_raw)
    for start_h, end_h, code, label, skip in (
        (
            "FIRST SCHEDULE",
            "SECOND SCHEDULE",
            "PR-Sch1-Rule10",
            "Poisons Rules First Schedule — Poisons List substance under the rule 10 special restrictions",
            ("SUBSTANCES FALLING", "SPECIAL RESTRICTIONS", "Rules 10"),
        ),
        (
            "THIRD SCHEDULE",
            "FOURTH SCHEDULE",
            "PR-Sch3-Prescription",
            "Poisons Rules Third Schedule — sale only on a prescription given by a medical practitioner, dentist or veterinary surgeon",
            ("SUBSTANCES REQUIRED", "PRESCRIPTION GIVEN", "VETERINARY SURGEONS", "Rule 15"),
        ),
        (
            "SIXTH SCHEDULE",
            "SEVENTH SCHEDULE",
            "PR-Sch6-Transport",
            "Poisons Rules Sixth Schedule — substance to which rule 28 (transport) applies",
            ("SUBSTANCES TO WHICH", "Rule 28"),
        ),
        (
            "SEVENTH SCHEDULE",
            "EIGHTH SCHEDULE",
            "PR-Sch7-Colouring",
            "Poisons Rules Seventh Schedule — substance to which rule 33 (colouring) applies",
            ("SUBSTANCES TO WHICH", "Rule 33"),
        ),
    ):
        add("poisons-rules", code, label, line_entries(region(pr, start_h, end_h), skip))

    df = pd.DataFrame.from_records(records)
    if df.empty:
        raise RuntimeError("no schedule records parsed")

    # --- map onto corpus pages --------------------------------------------
    # Same identifier-first order as the HSA register mapping: every schedule
    # name is resolved to a UNII through the FDA UNII names file, the exact
    # registered name is tried before the salt-stripped form, and the page is
    # then reached by UNII, by full InChIKey, or by InChIKey skeleton. A name
    # that resolves to no UNII reaches no page.
    idx = load_corpus_index()
    exact_names, stripped_names = load_unii_names()
    unii_to_inchikey, unii_display = load_unii_records()
    salts = idx.salts

    cache: dict[str, dict] = {}

    def resolve(names: list[str]) -> dict:
        cache_key = "\u0000".join(names)
        if cache_key in cache:
            return cache[cache_key]
        exact_uniis: list[str] = []
        stripped_uniis: list[str] = []
        resolved_name = None
        route = None
        for name in names:
            key = punct_key(name)
            if len(key) < 3:
                continue
            for unii in sorted(exact_names.get(key, ())):
                if unii not in exact_uniis:
                    exact_uniis.append(unii)
                    if route is None:
                        route, resolved_name = "unii-name-exact", name
            norm = normalise_name(name, salts)
            if len(norm) >= 3:
                for unii in sorted(stripped_names.get(norm, ())):
                    if unii not in stripped_uniis:
                        stripped_uniis.append(unii)
                        if route is None:
                            route, resolved_name = "unii-name-salt-stripped", name
        out = {
            "exact": exact_uniis,
            "stripped": stripped_uniis,
            "any": bool(exact_uniis or stripped_uniis),
            "route": route,
            "resolved_name": resolved_name,
        }
        cache[cache_key] = out
        return out

    def pages_for(res: dict) -> list[dict]:
        tiers = [("unii-name-exact", res["exact"]), ("unii-name-salt-stripped", res["stripped"])]

        def by(rule: str, uniis: list[str]) -> list[dict]:
            found: list[dict] = []
            seen: set[str] = set()
            for unii in uniis:
                ik = unii_to_inchikey.get(unii)
                if rule == "unii":
                    keys = idx.unii_to_keys.get(unii, [])
                elif rule == "inchikey":
                    keys = idx.inchikey_to_keys.get(ik, []) if ik else []
                else:
                    keys = idx.skeleton_to_keys.get(ik[:14], []) if ik else []
                for key in keys:
                    if key in seen:
                        continue
                    seen.add(key)
                    found.append(
                        {
                            "key": key,
                            "match_rule": rule,
                            "form_of_target": ik if rule == "skeleton" else None,
                            "unii": unii,
                            "inchikey": ik,
                        }
                    )
            return found

        for rule in ("unii", "inchikey", "skeleton"):
            for level, uniis in tiers:
                if not uniis:
                    continue
                hits = by(rule, uniis)
                if hits:
                    for hit in hits:
                        hit["unii_route"] = level
                    return hits
        return []

    rows: list[dict] = []
    unmatched: list[dict] = []
    stats = collections.Counter()

    for rec in records:
        base = {
            "statute": rec["statute"],
            "statute_citation": rec["statute_citation"],
            "source_url": rec["source_url"],
            "version_date": rec["version_date"],
            "schedule_code": rec["schedule_code"],
            "schedule": rec["schedule"],
            "item_number": rec["item_number"],
            "substance": rec["substance"],
            "primary_name": rec["primary_name"],
            "names": json.dumps(rec["names"], ensure_ascii=False),
            "paragraph_note": rec.get("paragraph_note"),
        }
        res = resolve(rec["names"])
        hits = pages_for(res)
        if hits:
            stats[f"matched:{hits[0]['match_rule']}"] += 1
            if len(hits) > 1:
                stats["records_reaching_more_than_one_page"] += 1
            for hit in hits:
                rows.append(
                    {
                        **base,
                        "key": hit["key"],
                        "matched_name": res["resolved_name"],
                        "unii": hit["unii"],
                        "inchikey": hit["inchikey"],
                        "match_rule": hit["match_rule"],
                        "form_of_target": hit["form_of_target"],
                        "unii_route": hit["unii_route"],
                    }
                )
        else:
            stats[
                "unmatched:unii-resolved-no-page" if res["any"] else "unmatched:no-unii"
            ] += 1
            rows.append(
                {
                    **base,
                    "key": None,
                    "matched_name": None,
                    "unii": None,
                    "inchikey": None,
                    "match_rule": None,
                    "form_of_target": None,
                    "unii_route": None,
                }
            )
            unmatched.append(
                {
                    "schedule_code": rec["schedule_code"],
                    "item_number": rec["item_number"] or "",
                    "primary_name": rec["primary_name"],
                    "substance": rec["substance"],
                    "reason": (
                        "resolved to a UNII that no corpus page holds"
                        if res["any"]
                        else "no FDA UNII record for any name in the entry"
                    ),
                }
            )

    out = pd.DataFrame.from_records(rows)
    out_path = SOURCE_DIR / "controlled-substances.parquet"
    out.to_parquet(out_path, index=False)

    unmatched_path = SOURCE_DIR / "controlled-substances-unmatched.csv"
    with unmatched_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(
            fh,
            fieldnames=["schedule_code", "item_number", "primary_name", "substance", "reason"],
        )
        w.writeheader()
        w.writerows(unmatched)

    matched_rows = out[out["key"].notna()]
    # One schedule record can reach several pages, so records are counted on the
    # distinct (schedule, substance) pair and rows on the page mapping.
    distinct = out.drop_duplicates(["schedule_code", "substance"])
    per_schedule = {
        code: {
            "records": int((distinct["schedule_code"] == code).sum()),
            "records_matched": int(
                distinct[(distinct["schedule_code"] == code)]["key"].notna().sum()
            ),
            "page_rows": int((out["schedule_code"] == code).sum()),
            "pages": int(out[out["schedule_code"] == code]["key"].nunique()),
        }
        for code in sorted(out["schedule_code"].unique())
    }
    tiers = collections.Counter(
        idx.tier_of(k) for k in sorted(set(matched_rows["key"].tolist()))
    )
    summary = {
        "source": "singapore-statutes-online",
        "part_of": "hsa-singapore",
        "retrieval_date": args.date,
        "statutes": {
            stem: {
                "statute": STATUTES[stem]["statute"],
                "citation": STATUTES[stem]["citation"],
                "url": STATUTES[stem]["url"],
                "version_date": versions[stem],
                "pdf": str((statutes_dir / f"{stem}.pdf").relative_to(ROOT)),
                "pdf_sha256": by_file.get(f"{stem}.pdf", {}).get("sha256"),
                "text": str((text_dir / f"{stem}.txt").relative_to(ROOT)),
            }
            for stem in STATUTES
        },
        "schedule_records": int(len(distinct)),
        "page_mapping_rows": int(len(out)),
        "distinct_pages_matched": int(matched_rows["key"].nunique()),
        "pages_matched_by_tier": {str(t): int(n) for t, n in sorted(tiers.items())},
        "records_by_schedule": per_schedule,
        "match_outcomes": dict(stats),
        "unmatched_records": int(len(unmatched)),
        "unmatched_list": str(unmatched_path.relative_to(ROOT)),
        "schedules_retrieved_but_not_parsed": {
            "MDA-Sch3-ControlledEquipment": (
                "Misuse of Drugs Act 1973 Third Schedule, controlled equipment, "
                "materials or substances useful for manufacturing controlled drugs. "
                "Its records are unnumbered running text whose alias clauses wrap "
                "onto further lines at the same indent, so record boundaries are "
                "not recoverable from the PDF text layer without guessing, and its "
                "subject is a manufacturing input rather than a medicine's control "
                "class. The retrieved PDF holds the full text at "
                "data/sources/hsa-singapore/" + args.date + "/raw/statutes/"
                "misuse-of-drugs-act-1973.pdf."
            ),
            "MDA-Sch5-Excluded": (
                "Misuse of Drugs Act 1973 Fifth Schedule, excluded substances. "
                "An exclusion from the Act is not a control class, so it carries "
                "no controlled status onto a page."
            ),
        },
        "licence": manifest["licence"],
    }
    summary_path = SOURCE_DIR / "controlled-substances-summary.json"
    summary_path.write_text(json.dumps(summary, indent=1, ensure_ascii=False))
    print(json.dumps({k: summary[k] for k in (
        "schedule_records",
        "page_mapping_rows",
        "distinct_pages_matched",
        "pages_matched_by_tier",
        "records_by_schedule",
        "match_outcomes",
        "unmatched_records",
    )}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
