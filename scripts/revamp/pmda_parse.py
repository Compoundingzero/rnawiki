"""Parse the PMDA English List of Approved Drugs (April 2004 to February 2026) into records.

Input : data/sources/pmda/<date>/raw/new-drugs-approved-2004-04-to-2026-02.pdf
Output: data/sources/pmda/<date>/parsed/approvals.ndjson  (one JSON object per table row)
        data/sources/pmda/<date>/parsed/parse-report.json (row and field counts, artefact counts)

The PDF is a 207-page table. Its header wording changes across the twenty-two fiscal years it
covers, so column roles are read from each table's own header rather than by position; pages whose
table repeats no header inherit the previous page's role map. Two rendering artefacts in the older
pages are repaired and counted: bold text whose glyphs are emitted twice ("CCoommppaannyy"), and
unmapped glyphs emitted as "(cid:NNNN)".
"""
from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter

import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PULL_DATE = "2026-09-06"
BASE = os.path.join(ROOT, "data", "sources", "pmda", PULL_DATE)
PDF = os.path.join(BASE, "raw", "new-drugs-approved-2004-04-to-2026-02.pdf")
OUT_DIR = os.path.join(BASE, "parsed")

SOURCE_URL = "https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html"
PDF_URL = "https://www.pmda.go.jp/files/000281190.pdf"

MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}

CID_MAP = {"7330": "(", "7331": ")"}
ARTEFACTS = Counter()


def undouble_token(tok: str) -> str:
    """Collapse a token whose glyphs were each emitted twice by the PDF's bold rendering."""
    if len(tok) >= 4 and len(tok) % 2 == 0 and tok[0::2] == tok[1::2]:
        ARTEFACTS["doubled_token"] += 1
        return tok[0::2]
    return tok


def clean(cell: str | None) -> str:
    if not cell:
        return ""
    text = cell

    def _cid(match: re.Match[str]) -> str:
        code = match.group(1)
        ARTEFACTS["cid_glyph"] += 1
        return CID_MAP.get(code, " ")

    text = re.sub(r"\(cid:(\d+)\)", _cid, text)
    text = "\n".join(
        " ".join(undouble_token(t) for t in line.split()) for line in text.split("\n")
    )
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def role_of(header_cell: str) -> str | None:
    h = clean(header_cell).lower().replace("\n", " ")
    if not h:
        return None
    if "date" in h:
        return "approval_date"
    if h.strip().rstrip(".") == "no":
        return "entry_no"
    if "brand name" in h or "trade name" in h:
        return "brand"
    if "ingredient" in h:
        return "active_ingredient"
    if "note" in h or "indication" in h:
        return "notes"
    if "approval" in h or "partial" in h or "supplemental" in h:
        return "approval_type"
    if "category" in h:
        return "review_category"
    return None


def is_header_row(row: list[str | None]) -> bool:
    joined = " ".join(clean(c).lower() for c in row)
    return ("ingredient" in joined and ("category" in joined or "date" in joined))


DATE_LONG = re.compile(r"^([A-Za-z]{3,9})\.?\s*(\d{1,2}),\s*(\d{4})$")
DATE_SHORT = re.compile(r"^(\d{1,2})-([A-Za-z]{3})-(\d{2})$")


def parse_date(raw: str) -> tuple[str | None, int | None]:
    """Return (ISO date, year). Both are None when the cell carries no parsable date."""
    s = clean(raw).replace("\n", " ").strip()
    s = re.sub(r"\(\d+\)", " ", s)      # rows that carry two numbered approvals in one cell
    s = re.sub(r"\s+", " ", s).strip()
    first = re.match(r"^([A-Za-z]{3,9}\.?\s*\d{1,2},\s*\d{4}|\d{1,2}-[A-Za-z]{3}-\d{2})", s)
    if first:
        s = first.group(1)
    m = DATE_LONG.match(s)
    if m:
        mon = MONTHS.get(m.group(1)[:3].lower())
        if mon:
            return f"{int(m.group(3)):04d}-{mon:02d}-{int(m.group(2)):02d}", int(m.group(3))
    m = DATE_SHORT.match(s)
    if m:
        mon = MONTHS.get(m.group(2)[:3].lower())
        if mon:
            year = 2000 + int(m.group(3))
            return f"{year:04d}-{mon:02d}-{int(m.group(1)):02d}", year
    m = re.match(r"^([A-Za-z]{3,9})\.?\s+(\d{4})$", s)
    if m and MONTHS.get(m.group(1)[:3].lower()):
        return None, int(m.group(2))
    return None, None


APPLICANT = re.compile(r"\(([^()]*(?:Co\.|Ltd|Inc|K\.K\.|Corporation|Corp|Pharma|Pharmaceutical|"
                       r"GmbH|Limited|LLC|Company|Industries|Institute|Kaketsuken|Japan)[^()]*)\)")


def split_brand(cell: str) -> tuple[list[str], str | None]:
    """Separate the brand-name lines from the applicant company in parentheses."""
    text = clean(cell)
    if not text:
        return [], None
    applicants = APPLICANT.findall(text)
    applicant = applicants[-1].strip() if applicants else None
    stripped = APPLICANT.sub(" ", text)
    if applicant is None:
        m = re.search(r"\(([^()]{3,80})\)\s*$", text.replace("\n", " "))
        if m:
            applicant = m.group(1).strip()
            stripped = text.replace("(" + m.group(1) + ")", " ")
    brands = []
    for line in stripped.split("\n"):
        line = line.strip()
        line = re.sub(r"^\(?\d{1,2}\)\s*", "", line)   # rows that number two approvals in one cell
        line = re.sub(r"^\d+\s*", "", line)             # older layouts glue the entry number on
        line = re.sub(r"\s+", " ", line).strip(" ,;")
        if line:
            brands.append(line)
    return brands, applicant


def parse() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    records: list[dict] = []
    report = {
        "pdf": os.path.relpath(PDF, ROOT),
        "pages": 0,
        "tables": 0,
        "header_rows": 0,
        "inherited_header_pages": [],
        "data_rows": 0,
        "continuation_rows": 0,
        "rows_without_date": 0,
        "rows_without_ingredient": 0,
        "reattached_fragments": 0,
        "inherited_merged_ingredient": 0,
        "applicant_only_rows": 0,
        "section_year_outside_row_year": 0,
    }
    roles: list[str | None] | None = None
    section = None
    last_date_iso = last_year = last_category = last_no = last_ingredient = None
    section_re = re.compile(
        r"((?:New Drugs|Products)[^\n]*Approved in[^\n]*"
        r"|Approved in FY\s*\d{4}[^\n]*"
        r"|A [Ll]ist of [Aa]pproved (?:Articles|Items|items|articles)[^\n]*"
        r"|(?:FY\s*\d{4}\s*)?List of Approved Products[^\n]*)")

    with pdfplumber.open(PDF) as pdf:
        report["pages"] = len(pdf.pages)
        for page_no, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            for line in text.split("\n")[:4]:
                m = section_re.search(line)
                if m:
                    heading = clean(m.group(1))
                    if heading != section:
                        section = heading
                        last_date_iso = last_year = last_category = None
                        last_no = last_ingredient = None
                    break
            for table in page.find_tables():
                rows = table.extract()
                if not rows:
                    continue
                joined_head = " ".join(clean(c).lower() for c in rows[0])
                if "review category" in joined_head and "products" in joined_head and len(rows[0]) == 2:
                    continue  # the review-category legend, not an approvals table
                report["tables"] += 1
                start = 0
                header_row = None
                if is_header_row(rows[0]):
                    header_row = rows[0]
                    start = 1
                elif len(rows) > 1 and is_header_row(rows[1]):
                    header_row = rows[1]
                    start = 2
                if header_row is not None:
                    report["header_rows"] += 1
                    roles = [role_of(c) for c in header_row]
                    if roles.count("approval_date") != 1 or roles.count("active_ingredient") != 1:
                        raise SystemExit(
                            f"page {page_no}: header roles not resolvable: {roles} from {header_row}")
                else:
                    report["inherited_header_pages"].append(page_no)
                if roles is None:
                    raise SystemExit(f"page {page_no}: data table before any header row")

                for row_idx, row in enumerate(rows[start:], start=start):
                    if len(row) != len(roles):
                        raise SystemExit(
                            f"page {page_no} row {row_idx}: {len(row)} cells against {len(roles)} roles")
                    cells = {}
                    for role, cell in zip(roles, row):
                        if role:
                            cells[role] = clean(cell)
                    if not any(cells.values()):
                        continue
                    date_iso, year = parse_date(cells.get("approval_date", ""))
                    category = cells.get("review_category", "")
                    entry_no = cells.get("entry_no", "")
                    brand_cell = cells.get("brand", "")
                    ingredient = cells.get("active_ingredient", "")
                    notes = cells.get("notes", "")
                    heads_a_row = bool(date_iso or category or entry_no)

                    if not heads_a_row and not brand_cell:
                        # A cell that pdfplumber split off the row above: reattach the text.
                        if records:
                            report["reattached_fragments"] += 1
                            if ingredient:
                                records[-1]["active_ingredient_raw"] = (
                                    (records[-1]["active_ingredient_raw"] or "") + "\n" + ingredient
                                ).strip()
                            if notes:
                                records[-1]["notes"] = (
                                    (records[-1]["notes"] or "") + "\n" + notes).strip()
                        continue

                    continuation = False
                    if not heads_a_row:
                        continuation = True
                        report["continuation_rows"] += 1
                        date_iso, year = last_date_iso, last_year
                        category = last_category or ""
                        entry_no = last_no or ""
                        if not ingredient:
                            # The ingredient cell is merged across the products of one entry.
                            ingredient = last_ingredient or ""
                            report["inherited_merged_ingredient"] += 1
                    else:
                        last_date_iso, last_year = date_iso, year
                        last_category = category or last_category
                        last_no = entry_no or last_no
                        if ingredient:
                            last_ingredient = ingredient

                    brands, applicant = split_brand(brand_cell)
                    if not brands:
                        # A line carrying only the applicant company for the entry above.
                        if applicant and records and not records[-1]["applicant"]:
                            records[-1]["applicant"] = applicant
                            report["applicant_only_rows"] += 1
                            continue
                        if not ingredient:
                            continue
                    if not date_iso:
                        report["rows_without_date"] += 1
                    if not ingredient:
                        report["rows_without_ingredient"] += 1
                    if not ingredient and not brands:
                        continue
                    if year and section:
                        m_year = re.search(r"(19|20)\d{2}", section)
                        if m_year and not (int(m_year.group(0)) - 1 <= year <= int(m_year.group(0)) + 1):
                            report["section_year_outside_row_year"] += 1
                    report["data_rows"] += 1
                    records.append({
                        "source_record_id": f"pmda:p{page_no:03d}:r{row_idx:02d}",
                        "pdf_page": page_no + 1,
                        "section": section,
                        "review_category": category or None,
                        "entry_no": entry_no or None,
                        "approval_date": date_iso,
                        "approval_year": year,
                        "approval_date_raw": cells.get("approval_date") or None,
                        "brand_names": brands,
                        "applicant": applicant,
                        "approval_type": cells.get("approval_type") or None,
                        "active_ingredient_raw": ingredient or None,
                        "notes": notes or None,
                        "continuation_row": continuation,
                        "source_url": SOURCE_URL,
                        "pdf_url": PDF_URL,
                    })

    with open(os.path.join(OUT_DIR, "approvals.ndjson"), "w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    report["records"] = len(records)
    report["artefacts_repaired"] = dict(ARTEFACTS)
    report["distinct_years"] = sorted({r["approval_year"] for r in records if r["approval_year"]})
    with open(os.path.join(OUT_DIR, "parse-report.json"), "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, ensure_ascii=False)
    print(json.dumps({k: v for k, v in report.items() if k != "inherited_header_pages"},
                     indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(parse())
