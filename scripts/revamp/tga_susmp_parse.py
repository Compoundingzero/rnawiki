"""Parse the Poisons Standard (SUSMP) schedule lists out of the Federal Register
of Legislation Word original.

Input : data/sources/tga-artg/<date>/raw/poisons-standard-<label>-<id>.docx
Output: data/sources/tga-artg/<date>/parsed/susmp-entries.json

The instrument is drafted with dedicated paragraph styles. `ActHead1` carries the
`Schedule N—...` headings, `PoisonsStandardScheduleEntry` and `Normal-hanging`
carry the substance entries, and `Paragraph`,
`PoisonsStandardScheduleEntryParagraph` and `PoisonsStandardScheduleEntryCaveat`
carry the qualifications attached to the preceding entry. Hyphens inside
substance names are `w:noBreakHyphen` elements, so runs are walked in document
order rather than read with `itertext`.

Every entry keeps its verbatim text. The substance name is the leading run of
capitalised tokens, which is how the Standard is drafted (section 7 of the
instrument, "References to substances").
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

ENTRY_STYLES = {"PoisonsStandardScheduleEntry", "Normal-hanging"}
QUALIFIER_STYLES = {
    "Paragraph",
    "PoisonsStandardScheduleEntryParagraph",
    "PoisonsStandardScheduleEntryCaveat",
    "paragraphsub",
    "paragraphsub-sub",
    "Normal-hanging",
}

SCHEDULE_HEADING = re.compile(r"^Schedule\s+(\d+)\s*[—–-]\s*(.+)$")

# A leading capitalised token: letters, digits, and the punctuation the Standard
# uses inside substance names. A token containing a lowercase letter ends the name.
_NAME_TOKEN = re.compile(r"[A-Z0-9][A-Z0-9,'’–—\-\.\+\[\]]*")


def paragraphs(docx: Path) -> list[tuple[str, str]]:
    with zipfile.ZipFile(docx) as zf:
        root = ET.fromstring(zf.read("word/document.xml"))
    out: list[tuple[str, str]] = []
    for para in root.iter(W + "p"):
        style = ""
        pPr = para.find(W + "pPr")
        if pPr is not None:
            pStyle = pPr.find(W + "pStyle")
            if pStyle is not None:
                style = pStyle.get(W + "val", "")
        pieces: list[str] = []
        for node in para.iter():
            tag = node.tag
            if tag == W + "t":
                pieces.append(node.text or "")
            elif tag == W + "noBreakHyphen":
                pieces.append("-")
            elif tag == W + "softHyphen":
                pieces.append("")
            elif tag in (W + "tab", W + "br"):
                pieces.append(" ")
        out.append((style, "".join(pieces)))
    return out


def split_name(text: str) -> tuple[str | None, list[str], bool, bool]:
    """Return (substance name, trivial-name aliases, appendix_d, trivial_marked).

    The name is the leading run of capitalised tokens. A parenthesised group is
    part of the name only when its contents carry no lowercase letter, which is
    how the Standard writes systematic names such as
    1-PENTYL-3-(4-METHYL-1-NAPTHOYL)INDOLE while keeping English qualifications
    such as "(excluding its salts and derivatives)" outside the name.
    """
    body = text.strip()
    appendix_d = False
    trivial = False
    while body[:1] in {"#", "*"}:
        if body[0] == "#":
            appendix_d = True
        else:
            trivial = True
        body = body[1:].strip()

    pos = 0
    end = 0
    while pos < len(body):
        char = body[pos]
        if char == " ":
            pos += 1
            continue
        if char == "(":
            close = body.find(")", pos)
            if close == -1 or re.search(r"[a-z]", body[pos + 1:close]):
                break
            pos = end = close + 1
            continue
        m = _NAME_TOKEN.match(body, pos)
        if not m or not re.search(r"[A-Z0-9]", m.group(0)):
            break
        pos = end = m.end()
        if m.group(0).endswith("."):
            break

    name = re.sub(r"\s+", " ", body[:end]).strip().rstrip(".,;: ")
    aliases = [a.strip() for a in re.findall(r"\*\s*\(([^)]+)\)", body) if a.strip()]
    if len(name) < 2:
        return None, aliases, appendix_d, trivial
    return name, aliases, appendix_d, trivial


def main(pull_date: str) -> int:
    root = Path("data/sources/tga-artg") / pull_date
    matches = sorted((root / "raw").glob("poisons-standard-*.docx"))
    if not matches:
        print(f"no Poisons Standard docx under {root / 'raw'}", file=sys.stderr)
        return 1
    docx = matches[0]
    register_id = docx.stem.split("-")[-1]

    paras = paragraphs(docx)
    schedules: dict[str, dict] = {}
    current: dict | None = None
    entry: dict | None = None
    in_schedules = False

    for style, raw in paras:
        text = re.sub(r"\s+", " ", raw).strip()
        if style == "ActHead1":
            m = SCHEDULE_HEADING.match(text)
            if m:
                in_schedules = True
                number = m.group(1)
                current = {
                    "schedule": number,
                    "title": m.group(2).strip(),
                    "entries": [],
                }
                schedules[number] = current
                entry = None
                continue
            # Any other ActHead1 (an Appendix, or the Index) ends the schedules.
            in_schedules = False
            current = None
            entry = None
            continue
        if not in_schedules or current is None or not text:
            continue
        if style in ENTRY_STYLES:
            name, aliases, appendix_d, trivial = split_name(text)
            if name:
                entry = {
                    "name": name,
                    "aliases": aliases,
                    "appendixD": appendix_d,
                    "trivialName": trivial,
                    "text": text,
                    "qualifications": [],
                }
                current["entries"].append(entry)
                continue
            if entry is not None and style == "Normal-hanging":
                entry["qualifications"].append(text)
            continue
        if style in QUALIFIER_STYLES and entry is not None:
            entry["qualifications"].append(text)

    # An entry may be repeated inside one schedule when the Standard lists the
    # same substance under different conditions; both texts are kept.
    payload = {
        "instrument": {
            "registerId": register_id,
            "name": "Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026",
            "commonName": "Poisons Standard June 2026 (SUSMP)",
            "source": f"https://www.legislation.gov.au/{register_id}/asmade",
            "file": str(docx),
        },
        "retrieved": pull_date,
        "scheduleCount": len(schedules),
        "entryCount": sum(len(s["entries"]) for s in schedules.values()),
        "schedules": [schedules[k] for k in sorted(schedules, key=int)],
    }
    out_dir = root / "parsed"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "susmp-entries.json"
    out.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n")

    for s in payload["schedules"]:
        print(f"Schedule {s['schedule']:>2}  entries={len(s['entries']):>5}  {s['title'][:60]}")
    print(f"total entries {payload['entryCount']} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "2026-09-06"))
