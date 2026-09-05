"""Map the FDA Orange Book and Purple Book pull onto corpus-20k pages.

Orange Book `products.txt`, `patent.txt` and `exclusivity.txt` and the Purple
Book monthly product listing are joined to pages by the Phase 2 mapping rules in
priority order:

  (a) UNII exact.  An Orange Book ingredient string or a Purple Book proper name
      is resolved to a UNII through the FDA UNII names file, then that UNII is
      matched against the page's UNII.
  (b) Full InChIKey exact, taking the InChIKey of the resolved UNII from the FDA
      UNII records file.
  (c) InChIKey skeleton (first 14 characters) -> linked as form_of, never merged.
  (d) Normalised name -> candidate only.  A candidate is emitted with match_rule
      'name-candidate' and listed in name-candidates-for-review.json for Phase 3;
      it is suppressed where the page is already bound to some source record by
      UNII or InChIKey.

Salt and prodrug naming: an ingredient recorded as a salt ("AMLODIPINE
BESYLATE") is resolved twice, once as written and once after the shared
scripts/revamp/salts.txt suffix strip, so both the salt page and the parent
substance page receive the product record.  Both are identifier-confirmed
matches and carry match_rule 'unii'; the count reached only through the
salt-stripped name is reported separately in coverage.json.

Multi-ingredient products map to each component page and, where the corpus holds
a combination page whose components are exactly the resolved set, to that page.

Outputs, all under data/sources/orange-purple-book/:
  mapped.parquet, coverage.json, name-candidates-for-review.json,
  unmatched-records.json
"""

from __future__ import annotations

import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import date, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd  # noqa: E402

from corpus_join import load_corpus_index, normalise_name  # noqa: E402

ROOT = "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
PULL_DATE = "2026-09-05"
PULL = os.path.join(ROOT, "data", "sources", "orange-purple-book", PULL_DATE)
OUT_DIR = os.path.join(ROOT, "data", "sources", "orange-purple-book")
OB = os.path.join(PULL, "raw", "orange-book")
PB_CSV = os.path.join(PULL, "raw", "purplebook-search-August-2026-data-download.csv")
UNII_NAMES = os.path.join(ROOT, "data", "corpus-20k", "raw", "fda-unii", "UNII_Names_4Aug2026.txt")
UNII_RECORDS = os.path.join(ROOT, "data", "corpus-20k", "raw", "fda-unii", "UNII_Records_4Aug2026.txt")

LICENCE = "US Government work, public domain (FDA)"
OB_URL = "https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files"
PB_URL = ("https://www.accessdata.fda.gov/drugsatfda_docs/PurpleBook/2026/"
          "purplebook-search-August-data-download.csv")

# Orange Book data-file dates come from the pull manifest, which reads each zip
# member's extended-timestamp extra field (a Unix epoch second, so UTC outright).
# Reading them here rather than restating them keeps `source_date` on every row
# identical to the manifest and to `coverage.json`.
_MANIFEST_DATES = json.load(open(
    os.path.join(ROOT, "data", "sources", "orange-purple-book", PULL_DATE, "manifest.json"),
    encoding="utf-8"))["datasets"]["orange_book"]["data_file_dates"]
OB_PRODUCTS_DATE = _MANIFEST_DATES["products.txt"]
OB_PATENT_DATE = _MANIFEST_DATES["patent.txt"]
OB_EXCLUSIVITY_DATE = _MANIFEST_DATES["exclusivity.txt"]
PB_REPORT_MONTH = "2026-08"
PB_SOURCE_DATE = "2026-08-31"

# `as of` line for expiry arithmetic: the Orange Book products data-file date.
AS_OF = date.fromisoformat(OB_PRODUCTS_DATE)
PB_AS_OF = date(2026, 8, 31)

MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}

PRIOR_1982 = "Approved Prior to Jan 1, 1982"

# Two-digit years in the Purple Book CSV.  Approval and licensure dates cannot
# fall after the report month, so a two-digit year that would place them there is
# read as 19yy.  Exclusivity expiry dates run from the 1990 orphan expiries to
# the 2040s, so the split for those sits at 60.
PB_PAST_FIELDS = {"Approval Date", "Inter. Approval Date", "Date of First Licensure"}
PB_EXPIRY_SPLIT = 60


def parse_ob_date(text: str) -> date | None:
    """'Aug 24, 2026' -> date.  Returns None for the pre-1982 marker and blanks."""
    text = (text or "").strip()
    m = re.match(r"^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})$", text)
    if not m:
        return None
    month = MONTHS.get(m.group(1).lower())
    if not month:
        return None
    return date(int(m.group(3)), month, int(m.group(2)))


def parse_pb_date(text: str, field: str) -> date | None:
    """'23-Jul-86' -> date, resolving the two-digit year by the field's direction."""
    text = (text or "").strip()
    m = re.match(r"^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$", text)
    if not m:
        return None
    month = MONTHS.get(m.group(2).lower())
    if not month:
        return None
    raw_year = m.group(3)
    if len(raw_year) == 4:
        year = int(raw_year)
    else:
        yy = int(raw_year)
        if field in PB_PAST_FIELDS:
            year = 2000 + yy if date(2000 + yy, month, int(m.group(1))) <= PB_AS_OF else 1900 + yy
        else:
            year = 2000 + yy if yy <= PB_EXPIRY_SPLIT else 1900 + yy
    return date(year, month, int(m.group(1)))


def iso(d: date | None) -> str | None:
    return d.isoformat() if d else None


def split_outside_parens(text: str, seps: str) -> list[str]:
    parts, depth, buf = [], 0, []
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth = max(0, depth - 1)
        if ch in seps and depth == 0:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    parts.append("".join(buf))
    return [p.strip() for p in parts if p.strip()]


class UniiResolver:
    """FDA UNII names -> UNII, with the salt-stripped and suffix-stripped variants."""

    BIOSIM_SUFFIX = re.compile(r"-[a-z]{4}$")

    def __init__(self, salts: list[str]):
        self.salts = salts
        self._cache: dict[str, dict] = {}
        self.exact: dict[str, set[str]] = defaultdict(set)
        self.normalised: dict[str, set[str]] = defaultdict(set)
        with open(UNII_NAMES, encoding="utf-8", errors="replace") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                name = (row.get("NAME") or "").strip()
                unii = (row.get("UNII") or "").strip().upper()
                if not name or not unii:
                    continue
                self.exact[name.upper()].add(unii)
                norm = normalise_name(name, self.salts)
                if len(norm) >= 3:
                    self.normalised[norm].add(unii)
        self.inchikey: dict[str, str] = {}
        self.display: dict[str, str] = {}
        with open(UNII_RECORDS, encoding="utf-8", errors="replace") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                unii = (row.get("UNII") or "").strip().upper()
                if not unii:
                    continue
                key = (row.get("INCHIKEY") or "").strip().upper()
                if key:
                    self.inchikey[unii] = key
                name = (row.get("DISPLAY_NAME") or "").strip()
                if name:
                    self.display[unii] = name

    def resolve(self, raw: str) -> dict:
        """Return the UNIIs for a name as written and for its parent substance.

        Every lookup copies the stored set: the name indexes are shared across
        every call and must never be narrowed by one substance's parent strip.
        """
        cached = self._cache.get(raw)
        if cached is not None:
            return cached

        as_written = set(self.exact.get(raw.strip().upper(), ()))
        method = "unii-names-exact" if as_written else None

        norm = normalise_name(raw, self.salts)
        parent: set[str] = set()
        if norm:
            parent = set(self.normalised.get(norm, ()))
        if not as_written and parent:
            as_written, parent, method = parent, set(), "unii-names-normalised"

        base = raw.strip()
        if not as_written:
            stripped = self.BIOSIM_SUFFIX.sub("", base)
            if stripped != base:
                as_written = set(self.exact.get(stripped.upper(), ()))
                if as_written:
                    method = "unii-names-exact-after-biosimilar-suffix-strip"
        if not as_written:
            bare = re.sub(r"\s*\([^)]*\)\s*$", "", base).strip()
            if bare and bare != base:
                as_written = set(self.exact.get(bare.upper(), ()))
                if as_written:
                    method = "unii-names-exact-after-trailing-parenthetical-strip"

        parent -= as_written
        result = {"unii": as_written, "parent_unii": parent,
                  "method": method, "normalised_name": norm}
        self._cache[raw] = result
        return result


def read_ob(name: str) -> list[dict]:
    with open(os.path.join(OB, name), encoding="utf-8-sig", errors="replace") as fh:
        return list(csv.DictReader(fh, delimiter="~"))


def read_pb() -> list[dict]:
    """The full product listing: the second section of the monthly report."""
    with open(PB_CSV, encoding="utf-8-sig", errors="replace") as fh:
        rows = list(csv.reader(fh))
    header_rows = [i for i, r in enumerate(rows) if r and r[0].strip() == "N/R/U"]
    if len(header_rows) != 2:
        raise SystemExit(f"Purple Book CSV: expected 2 section headers, found {len(header_rows)}")
    header = rows[header_rows[1]]
    out = []
    for r in rows[header_rows[1] + 1:]:
        if len(r) != len(header) or not any(c.strip() for c in r):
            continue
        out.append({k: (v or "").strip() for k, v in zip(header, r)})
    return out


def ingredient_components(raw: str, resolver: UniiResolver, reaches_page) -> list[str]:
    """Split an Orange Book Ingredient string into component substance names.

    The top-level separator is ';' outside brackets.  A token that does not
    itself reach a corpus page is retried as the contents of its trailing
    parenthetical ("TRIPLE SULFA (SULFABENZAMIDE;SULFACETAMIDE;SULFATHIAZOLE)"),
    then split on ',' ("ELEXACAFTOR, IVACAFTOR, TEZACAFTOR") and on '/'
    ("AMPICILLIN/AMPICILLIN TRIHYDRATE"); a split is taken only when every part
    reaches a page, so a genuinely single substance whose name contains one of
    those characters is never broken up.
    """
    components: list[str] = []
    for token in split_outside_parens(raw, ";"):
        if reaches_page(token):
            components.append(token)
            continue
        taken = False
        inner = re.search(r"\(([^()]*)\)\s*$", token)
        if inner:
            for sep in (";", ","):
                parts = split_outside_parens(inner.group(1), sep)
                if len(parts) > 1 and all(reaches_page(p) for p in parts):
                    components.extend(parts)
                    taken = True
                    break
        if taken:
            continue
        for sep in (",", "/"):
            parts = split_outside_parens(token, sep)
            if len(parts) > 1 and all(reaches_page(p) for p in parts):
                components.extend(parts)
                taken = True
                break
        if not taken:
            components.append(token)
    seen, ordered = set(), []
    for c in components:
        if c.upper() not in seen:
            seen.add(c.upper())
            ordered.append(c)
    return ordered


def main() -> int:
    idx = load_corpus_index()
    resolver = UniiResolver(idx.salts)

    def reaches_page(name: str) -> bool:
        """True when a substance name reaches a corpus page by rule (a), (b) or (c)."""
        res = resolver.resolve(name)
        for unii in res["unii"] | res["parent_unii"]:
            if idx.unii_to_keys.get(unii):
                return True
            key = resolver.inchikey.get(unii)
            if key and (idx.inchikey_to_keys.get(key) or idx.skeleton_to_keys.get(key[:14])):
                return True
        return False

    products = read_ob("products.txt")
    patents = read_ob("patent.txt")
    exclusivity = read_ob("exclusivity.txt")
    purple = read_pb()

    # ---- resolve every distinct substance name once -------------------------
    substance_names: set[str] = set()
    product_components: dict[int, list[str]] = {}
    for i, row in enumerate(products):
        comps = ingredient_components(row["Ingredient"], resolver, reaches_page)
        product_components[i] = comps
        substance_names.update(comps)
    for row in purple:
        if row.get("Proper Name"):
            substance_names.add(row["Proper Name"])

    resolution: dict[str, dict] = {name: resolver.resolve(name) for name in substance_names}

    # ---- map a substance name to pages by the four rules --------------------
    name_resolution_stats = Counter()
    substance_pages: dict[str, dict] = {}
    pages_bound_by_identifier: set[str] = set()

    for name, res in resolution.items():
        rules: dict[str, str] = {}
        primary: set[str] = set()
        inchikeys: set[str] = set()
        for unii in sorted(res["unii"] | res["parent_unii"]):
            key = resolver.inchikey.get(unii)
            if key:
                inchikeys.add(key)

        for unii in sorted(res["unii"]):                       # (a) UNII exact
            for key in idx.unii_to_keys.get(unii, ()):
                rules[key] = "unii"
        via_parent: set[str] = set()
        for unii in sorted(res["parent_unii"]):                # (a) via parent substance
            for key in idx.unii_to_keys.get(unii, ()):
                if key not in rules:
                    rules[key] = "unii"
                    via_parent.add(key)
        primary = set(rules)

        if not primary:                                        # (b) full InChIKey
            for key_str in sorted(inchikeys):
                for key in idx.inchikey_to_keys.get(key_str, ()):
                    rules.setdefault(key, "inchikey")
            primary = set(rules)

        if primary:
            form_of_target = sorted(primary)[0]
        else:
            identifier = sorted(res["unii"])[0] if res["unii"] else "no UNII resolved"
            form_of_target = (f"FDA-UNII:{identifier} ({name}) "
                              "- no page in this corpus")
        for key_str in sorted(inchikeys):                      # (c) skeleton -> form_of
            for key in idx.skeleton_to_keys.get(key_str[:14], ()):
                if key not in rules:
                    rules[key] = "skeleton"

        pages_bound_by_identifier |= primary
        substance_pages[name] = {
            "rules": rules, "primary": primary, "form_of_target": form_of_target,
            "unii": sorted(res["unii"]), "parent_unii": sorted(res["parent_unii"]),
            "inchikeys": sorted(inchikeys), "via_parent": via_parent,
            "resolution_method": res["method"], "normalised": res["normalised_name"],
        }
        if res["method"]:
            name_resolution_stats[res["method"]] += 1
        else:
            name_resolution_stats["unresolved-to-unii"] += 1

    # (d) normalised name, candidate only, and only where nothing identifies the page
    name_candidates: set[tuple] = set()
    suppressed_name_candidates: set[tuple] = set()
    for name, state in substance_pages.items():
        if state["primary"]:
            continue
        norm = state["normalised"]
        if len(norm) < 3:
            continue
        for key in idx.name_to_keys.get(norm, ()):
            if key in state["rules"]:
                continue
            if key in pages_bound_by_identifier:
                # The page already carries an Orange Book or Purple Book record
                # bound by UNII or InChIKey.  A bare name match is not emitted
                # into mapped.parquet, but it is still handed to Phase 3.
                suppressed_name_candidates.add((key, name))
                continue
            state["rules"][key] = "name-candidate"
            name_candidates.add((key, name))

    # ---- Purple Book proprietary names as candidates ------------------------
    brand_candidates: set[tuple] = set()
    suppressed_brand_candidates: set[tuple] = set()
    pb_brand_pages: dict[str, dict[str, str]] = defaultdict(dict)
    for row in purple:
        proper = row.get("Proper Name") or ""
        if substance_pages.get(proper, {}).get("primary"):
            continue
        for brand in split_outside_parens(row.get("Proprietary Name") or "", ","):
            norm = normalise_name(brand, idx.salts)
            if len(norm) < 3:
                continue
            for key in idx.name_to_keys.get(norm, ()):
                if key in substance_pages.get(proper, {}).get("rules", {}):
                    continue
                if key in pages_bound_by_identifier:
                    suppressed_brand_candidates.add((key, proper, brand))
                    continue
                pb_brand_pages[proper][key] = "name-candidate"
                brand_candidates.add((key, proper, brand))

    # ---- combination pages --------------------------------------------------
    combo_hits: dict[int, set[str]] = defaultdict(set)
    component_keysets: dict[frozenset, list[str]] = defaultdict(list)
    for combo_key, components in idx.combination_components.items():
        component_keysets[components].append(combo_key)
    for i, comps in product_components.items():
        if len(comps) < 2:
            continue
        resolved_pages = []
        for name in comps:
            primary = substance_pages.get(name, {}).get("primary") or set()
            if len(primary) != 1:
                resolved_pages = []
                break
            resolved_pages.append(next(iter(primary)))
        if len(resolved_pages) >= 2:
            for combo_key in component_keysets.get(frozenset(resolved_pages), ()):
                combo_hits[i].add(combo_key)

    # ---- index patents and exclusivity by application/product ---------------
    def app_key(row: dict) -> tuple:
        return (row["Appl_Type"].strip(), row["Appl_No"].strip(), row["Product_No"].strip())

    patents_by_app: dict[tuple, list[dict]] = defaultdict(list)
    for row in patents:
        patents_by_app[app_key(row)].append(row)
    exclusivity_by_app: dict[tuple, list[dict]] = defaultdict(list)
    for row in exclusivity:
        exclusivity_by_app[app_key(row)].append(row)

    # ---- emit -------------------------------------------------------------
    rows_out: list[dict] = []
    seen: set[tuple] = set()
    matched_pages_by_rule: dict[str, set[str]] = defaultdict(set)
    page_products: dict[str, list[tuple[int, str]]] = defaultdict(list)
    unmatched: list[dict] = []
    unmatched_seen: set[str] = set()

    def emit(key, field, value, record_id, url, source_date, rule, form_of):
        dedupe = (key, field, record_id)
        if dedupe in seen:
            return
        seen.add(dedupe)
        matched_pages_by_rule[rule].add(key)
        rows_out.append({
            "key": key,
            "tier": idx.tier_of(key),
            "field": field,
            "value": json.dumps(value, ensure_ascii=False, sort_keys=True),
            "source_record_id": record_id,
            "source_url": url,
            "source_date": source_date,
            "match_rule": rule,
            "form_of_target": form_of if rule == "skeleton" else None,
            "licence": LICENCE,
        })

    for i, row in enumerate(products):
        comps = product_components[i]
        akey = app_key(row)
        record_id = f"orangebook:product:{akey[0]}{akey[1]}-{akey[2]}"
        approval = parse_ob_date(row["Approval_Date"])
        product_value = {
            "ingredient": row["Ingredient"],
            "ingredient_components": comps,
            "dosage_form_and_route": row["DF;Route"],
            "trade_name": row["Trade_Name"],
            "applicant": row["Applicant"],
            "applicant_full_name": row["Applicant_Full_Name"],
            "strength": row["Strength"],
            "application_type": "NDA" if akey[0] == "N" else "ANDA",
            "application_number": akey[1],
            "product_number": akey[2],
            "therapeutic_equivalence_code": row["TE_Code"] or None,
            "approval_date": iso(approval),
            "approval_date_text": row["Approval_Date"],
            "approved_prior_to_1982": row["Approval_Date"].strip() == PRIOR_1982,
            "reference_listed_drug": row["RLD"] == "Yes",
            "reference_standard": row["RS"] == "Yes",
            "marketing_type": row["Type"],
            "is_single_ingredient_product": len(comps) == 1,
        }

        page_rules: dict[str, str] = {}
        form_of_for_page: dict[str, str] = {}
        for name in comps:
            state = substance_pages.get(name)
            if not state:
                continue
            for key, rule in state["rules"].items():
                current = page_rules.get(key)
                order = {"unii": 0, "inchikey": 1, "skeleton": 2, "name-candidate": 3}
                if current is None or order[rule] < order[current]:
                    page_rules[key] = rule
                    if rule == "skeleton" and state["form_of_target"]:
                        form_of_for_page[key] = state["form_of_target"]
        for combo_key in combo_hits.get(i, ()):
            page_rules.setdefault(combo_key, "unii")

        if not page_rules:
            for name in comps:
                if name.upper() in unmatched_seen:
                    continue
                unmatched_seen.add(name.upper())
                state = substance_pages.get(name, {})
                unmatched.append({
                    "dataset": "orange-book",
                    "substance_name": name,
                    "resolved_unii": state.get("unii") or [],
                    "resolution_method": state.get("resolution_method"),
                    "reason": "no UNII, InChIKey, skeleton or name match to a corpus page",
                })
            continue

        for key, rule in page_rules.items():
            page_products[key].append((i, rule))
            emit(key, "orangeBookProducts", product_value, record_id, OB_URL,
                 OB_PRODUCTS_DATE, rule, form_of_for_page.get(key))
            for pat in patents_by_app.get(akey, ()):
                expiry = parse_ob_date(pat["Patent_Expire_Date_Text"])
                emit(key, "orangeBookPatents", {
                    "patent_number": pat["Patent_No"],
                    "expiry_date": iso(expiry),
                    "expiry_date_text": pat["Patent_Expire_Date_Text"],
                    "unexpired_as_of": AS_OF.isoformat() if expiry and expiry > AS_OF else None,
                    "claims_drug_substance": pat["Drug_Substance_Flag"] == "Y",
                    "claims_drug_product": pat["Drug_Product_Flag"] == "Y",
                    "patent_use_code": pat["Patent_Use_Code"] or None,
                    "delisted": pat["Delist_Flag"] == "Y",
                    "submission_date_text": pat["Submission_Date"] or None,
                    "application_type": "NDA" if akey[0] == "N" else "ANDA",
                    "application_number": akey[1],
                    "product_number": akey[2],
                    "trade_name": row["Trade_Name"],
                }, f"orangebook:patent:{akey[0]}{akey[1]}-{akey[2]}-{pat['Patent_No']}",
                    OB_URL, OB_PATENT_DATE, rule, form_of_for_page.get(key))
            for exc in exclusivity_by_app.get(akey, ()):
                expiry = parse_ob_date(exc["Exclusivity_Date"])
                emit(key, "orangeBookExclusivity", {
                    "exclusivity_code": exc["Exclusivity_Code"],
                    "expiry_date": iso(expiry),
                    "expiry_date_text": exc["Exclusivity_Date"],
                    "unexpired_as_of": AS_OF.isoformat() if expiry and expiry > AS_OF else None,
                    "application_type": "NDA" if akey[0] == "N" else "ANDA",
                    "application_number": akey[1],
                    "product_number": akey[2],
                    "trade_name": row["Trade_Name"],
                }, f"orangebook:exclusivity:{akey[0]}{akey[1]}-{akey[2]}-{exc['Exclusivity_Code']}",
                    OB_URL, OB_EXCLUSIVITY_DATE, rule, form_of_for_page.get(key))

    # ---- derived per-page patent status ------------------------------------
    def summarise(indices: list[int]) -> dict:
        apps, te, marketing = set(), set(), set()
        rld_products, generic_dates = [], []
        pat_total = pat_unexpired = pat_delisted = 0
        pat_expiries, unexpired_expiries = [], []
        exc_total = exc_unexpired = 0
        exc_unexpired_list, exc_expiries = [], []
        brand = generic = 0
        for i in indices:
            row = products[i]
            akey = app_key(row)
            apps.add(f"{'NDA' if akey[0] == 'N' else 'ANDA'} {akey[1]}")
            if row["TE_Code"]:
                te.update(c.strip() for c in row["TE_Code"].split(",") if c.strip())
            marketing.add(row["Type"])
            if akey[0] == "N":
                brand += 1
            else:
                generic += 1
                approval = parse_ob_date(row["Approval_Date"])
                if approval:
                    generic_dates.append((approval, akey, row["Trade_Name"]))
                elif row["Approval_Date"].strip() == PRIOR_1982:
                    generic_dates.append((date(1982, 1, 1), akey, row["Trade_Name"]))
            if row["RLD"] == "Yes":
                rld_products.append({
                    "application": f"{'NDA' if akey[0] == 'N' else 'ANDA'} {akey[1]}",
                    "product_number": akey[2],
                    "trade_name": row["Trade_Name"],
                    "approval_date": iso(parse_ob_date(row["Approval_Date"])),
                })
            for pat in patents_by_app.get(akey, ()):
                pat_total += 1
                if pat["Delist_Flag"] == "Y":
                    pat_delisted += 1
                expiry = parse_ob_date(pat["Patent_Expire_Date_Text"])
                if expiry:
                    pat_expiries.append(expiry)
                    if expiry > AS_OF and pat["Delist_Flag"] != "Y":
                        pat_unexpired += 1
                        unexpired_expiries.append(expiry)
            for exc in exclusivity_by_app.get(akey, ()):
                exc_total += 1
                expiry = parse_ob_date(exc["Exclusivity_Date"])
                if expiry:
                    exc_expiries.append(expiry)
                    if expiry > AS_OF:
                        exc_unexpired += 1
                        exc_unexpired_list.append({"code": exc["Exclusivity_Code"],
                                                   "expiry_date": iso(expiry)})
        first_generic = min(generic_dates) if generic_dates else None
        return {
            "product_count": len(indices),
            "brand_product_count": brand,
            "generic_product_count": generic,
            "applications": sorted(apps),
            "therapeutic_equivalence_codes": sorted(te),
            "marketing_types": sorted(marketing),
            "reference_listed_drug": bool(rld_products),
            "reference_listed_drug_products": sorted(
                rld_products, key=lambda x: (x["approval_date"] or "", x["application"]))[:20],
            "first_generic_approval_date": iso(first_generic[0]) if first_generic else None,
            "first_generic_approval_is_pre_1982_marker": bool(
                first_generic and first_generic[0] == date(1982, 1, 1)),
            "first_generic_application": (
                f"ANDA {first_generic[1][1]}" if first_generic else None),
            "first_generic_trade_name": first_generic[2] if first_generic else None,
            "patents": {
                "total": pat_total,
                "unexpired": pat_unexpired,
                "delisted": pat_delisted,
                "earliest_unexpired_expiry": iso(min(unexpired_expiries)) if unexpired_expiries else None,
                "latest_unexpired_expiry": iso(max(unexpired_expiries)) if unexpired_expiries else None,
                "latest_expiry_any": iso(max(pat_expiries)) if pat_expiries else None,
            },
            "exclusivity": {
                "total": exc_total,
                "unexpired": exc_unexpired,
                "unexpired_entries": sorted(
                    exc_unexpired_list, key=lambda x: (x["expiry_date"], x["code"]))[:20],
                "earliest_unexpired_expiry": min(
                    (e["expiry_date"] for e in exc_unexpired_list), default=None),
                "latest_unexpired_expiry": max(
                    (e["expiry_date"] for e in exc_unexpired_list), default=None),
                "latest_expiry_any": iso(max(exc_expiries)) if exc_expiries else None,
            },
        }

    for key, entries in page_products.items():
        order = {"unii": 0, "inchikey": 1, "skeleton": 2, "name-candidate": 3}
        rule = min((r for _, r in entries), key=lambda r: order[r])
        all_idx = sorted({i for i, _ in entries})
        single_idx = [i for i in all_idx if len(product_components[i]) == 1]
        value = {
            "as_of": AS_OF.isoformat(),
            "orange_book_data_file_dates": {
                "products.txt": OB_PRODUCTS_DATE,
                "patent.txt": OB_PATENT_DATE,
                "exclusivity.txt": OB_EXCLUSIVITY_DATE,
            },
            "single_ingredient_products": summarise(single_idx) if single_idx else None,
            "all_products_containing_this_substance": summarise(all_idx),
        }
        form_of = None
        if rule == "skeleton":
            for name, state in substance_pages.items():
                if state["rules"].get(key) == "skeleton" and state["form_of_target"]:
                    form_of = state["form_of_target"]
                    break
        emit(key, "patentStatus", value, f"orangebook:derived:{PB_REPORT_MONTH}",
             OB_URL, OB_PRODUCTS_DATE, rule, form_of)

    # ---- Purple Book -------------------------------------------------------
    pb_page_records: dict[str, list[tuple[dict, str]]] = defaultdict(list)
    for row in purple:
        proper = row.get("Proper Name") or ""
        state = substance_pages.get(proper, {"rules": {}, "form_of_target": None})
        rules = dict(state.get("rules") or {})
        for key, rule in pb_brand_pages.get(proper, {}).items():
            rules.setdefault(key, rule)
        record_id = (f"purplebook:{row['BLA Number']}-{row['Product Number']}"
                     f"-{row['Supplement Number'] or '0'}")
        value = {
            "proper_name": proper,
            "proprietary_name": row.get("Proprietary Name") or None,
            "applicant": row.get("Applicant") or None,
            "bla_number": row.get("BLA Number") or None,
            "product_number": row.get("Product Number") or None,
            "license_number": row.get("License Number") or None,
            "license_type": row.get("License Type") or None,
            "centre": row.get("Center") or None,
            "strength": row.get("Strength") or None,
            "dosage_form": row.get("Dosage Form") or None,
            "route_of_administration": row.get("Route of Administration") or None,
            "product_presentation": row.get("Product Presentation") or None,
            "marketing_status": row.get("Marketing Status") or None,
            "licensure_status": row.get("Licensure") or None,
            "approval_date": iso(parse_pb_date(row.get("Approval Date", ""), "Approval Date")),
            "approval_date_text": row.get("Approval Date") or None,
            "interchangeable_approval_date": iso(parse_pb_date(
                row.get("Inter. Approval Date", ""), "Inter. Approval Date")),
            "reference_product_proper_name": row.get("Ref. Product Proper Name") or None,
            "reference_product_proprietary_name": row.get("Ref. Product Proprietary Name") or None,
            "date_of_first_licensure": iso(parse_pb_date(
                row.get("Date of First Licensure", ""), "Date of First Licensure")),
            "exclusivity_expiration_date": iso(parse_pb_date(
                row.get("Exclusivity Expiration Date", ""), "Exclusivity Expiration Date")),
            "first_interchangeable_exclusivity_expiry": iso(parse_pb_date(
                row.get("First Interchangeable Exclusivity Exp. Date", ""),
                "First Interchangeable Exclusivity Exp. Date")),
            "reference_product_exclusivity_expiry": iso(parse_pb_date(
                row.get("Ref. Product Exclusivity Exp. Date", ""),
                "Ref. Product Exclusivity Exp. Date")),
            "orphan_exclusivity_expiry": iso(parse_pb_date(
                row.get("Orphan Exclusivity Exp. Date", ""), "Orphan Exclusivity Exp. Date")),
            "patent_list_provided": row.get("Patent List Provided", "").upper() == "YES",
            "report_month": PB_REPORT_MONTH,
        }
        if not rules:
            if proper.upper() not in unmatched_seen:
                unmatched_seen.add(proper.upper())
                unmatched.append({
                    "dataset": "purple-book",
                    "substance_name": proper,
                    "resolved_unii": state.get("unii") or [],
                    "resolution_method": state.get("resolution_method"),
                    "reason": "no UNII, InChIKey, skeleton or name match to a corpus page",
                })
            continue
        for key, rule in rules.items():
            pb_page_records[key].append((value, rule))
            emit(key, "purpleBookProducts", value, record_id, PB_URL,
                 PB_SOURCE_DATE, rule,
                 state.get("form_of_target") if rule == "skeleton" else None)

    for key, entries in pb_page_records.items():
        order = {"unii": 0, "inchikey": 1, "skeleton": 2, "name-candidate": 3}
        rule = min((r for _, r in entries), key=lambda r: order[r])
        values = [v for v, _ in entries]

        def dates(fieldname):
            return sorted({v[fieldname] for v in values if v.get(fieldname)})

        unexpired = []
        for v in values:
            for label, fieldname in (
                ("reference product exclusivity", "reference_product_exclusivity_expiry"),
                ("first interchangeable exclusivity", "first_interchangeable_exclusivity_expiry"),
                ("orphan drug exclusivity", "orphan_exclusivity_expiry"),
                ("exclusivity", "exclusivity_expiration_date"),
            ):
                d = v.get(fieldname)
                if d and date.fromisoformat(d) > PB_AS_OF:
                    unexpired.append({"type": label, "expiry_date": d,
                                      "bla_number": v["bla_number"],
                                      "product_number": v["product_number"]})
        unexpired = sorted({(u["type"], u["expiry_date"], u["bla_number"],
                             u["product_number"]) for u in unexpired})
        value = {
            "as_of": PB_AS_OF.isoformat(),
            "report_month": PB_REPORT_MONTH,
            "product_count": len(values),
            "bla_numbers": sorted({v["bla_number"] for v in values if v["bla_number"]}),
            "license_types": sorted({v["license_type"] for v in values if v["license_type"]}),
            "marketing_statuses": sorted({v["marketing_status"] for v in values
                                          if v["marketing_status"]}),
            "centres": sorted({v["centre"] for v in values if v["centre"]}),
            "is_biosimilar_or_interchangeable": any(
                (v["license_type"] or "").startswith("351(k)") for v in values),
            "reference_products": sorted({v["reference_product_proper_name"] for v in values
                                          if v["reference_product_proper_name"]}),
            "earliest_approval_date": min(dates("approval_date"), default=None),
            "date_of_first_licensure": dates("date_of_first_licensure"),
            "exclusivity_expiration_dates": dates("exclusivity_expiration_date"),
            "reference_product_exclusivity_expiry_dates": dates(
                "reference_product_exclusivity_expiry"),
            "first_interchangeable_exclusivity_expiry_dates": dates(
                "first_interchangeable_exclusivity_expiry"),
            "orphan_exclusivity_expiry_dates": dates("orphan_exclusivity_expiry"),
            "unexpired_exclusivity": [
                {"type": t, "expiry_date": d, "bla_number": b, "product_number": p}
                for t, d, b, p in unexpired
            ],
            "any_unexpired_exclusivity": bool(unexpired),
            "patent_list_provided": any(v["patent_list_provided"] for v in values),
        }
        emit(key, "purpleBook", value, f"purplebook:derived:{PB_REPORT_MONTH}",
             PB_URL, PB_SOURCE_DATE, rule, None)

    # ---- write --------------------------------------------------------------
    frame = pd.DataFrame(rows_out, columns=[
        "key", "tier", "field", "value", "source_record_id", "source_url",
        "source_date", "match_rule", "form_of_target", "licence",
    ])
    os.makedirs(OUT_DIR, exist_ok=True)
    frame.to_parquet(os.path.join(OUT_DIR, "mapped.parquet"), index=False, compression="zstd")

    def tier_counts(keys) -> dict:
        out = {"1": 0, "2": 0, "3": 0}
        for k in keys:
            out[str(idx.tier_of(k))] += 1
        return out

    all_matched = set().union(*matched_pages_by_rule.values()) if matched_pages_by_rule else set()
    confirmed = set().union(*(matched_pages_by_rule[r] for r in ("unii", "inchikey", "skeleton")
                              if r in matched_pages_by_rule)) if matched_pages_by_rule else set()
    fields_by_tier: dict[str, dict[str, set]] = defaultdict(lambda: defaultdict(set))
    for row in rows_out:
        fields_by_tier[str(row["tier"])][row["field"]].add(row["key"])

    via_parent_pages = set()
    for state in substance_pages.values():
        via_parent_pages |= state["via_parent"]

    matched_names = {n for n, s in substance_pages.items() if s["rules"]}
    ob_names = {n for comps in product_components.values() for n in comps}
    pb_names = {r["Proper Name"] for r in purple if r.get("Proper Name")}

    unmatched_ob_products = sum(
        1 for i in range(len(products))
        if not any(substance_pages.get(n, {}).get("rules") for n in product_components[i])
        and not combo_hits.get(i))
    unmatched_pb_products = sum(
        1 for r in purple
        if not substance_pages.get(r.get("Proper Name") or "", {}).get("rules")
        and not pb_brand_pages.get(r.get("Proper Name") or ""))

    coverage = {
        "source": "FDA Orange Book and Purple Book",
        "pull_directory": f"data/sources/orange-purple-book/{PULL_DATE}",
        "retrieved": PULL_DATE,
        "licence": LICENCE,
        "licence_url": "https://www.fda.gov/about-fda/about-website/website-policies",
        "datasets": {
            "orange_book": {
                "products_rows": len(products),
                "patent_rows": len(patents),
                "exclusivity_rows": len(exclusivity),
                "data_file_dates": {"products.txt": OB_PRODUCTS_DATE,
                                    "patent.txt": OB_PATENT_DATE,
                                    "exclusivity.txt": OB_EXCLUSIVITY_DATE},
                "distinct_ingredient_components": len(ob_names),
            },
            "purple_book": {
                "product_listing_rows": len(purple),
                "report_month": PB_REPORT_MONTH,
                "distinct_proper_names": len(pb_names),
                "rows_with_exclusivity_expiration_date": sum(
                    1 for r in purple if r.get("Exclusivity Expiration Date", "").strip()),
                "rows_with_reference_product_exclusivity_date": sum(
                    1 for r in purple if r.get("Ref. Product Exclusivity Exp. Date", "").strip()),
                "rows_with_orphan_exclusivity_date": sum(
                    1 for r in purple if r.get("Orphan Exclusivity Exp. Date", "").strip()),
                "rows_with_first_interchangeable_exclusivity_date": sum(
                    1 for r in purple if r.get(
                        "First Interchangeable Exclusivity Exp. Date", "").strip()),
                "rows_with_date_of_first_licensure": sum(
                    1 for r in purple if r.get("Date of First Licensure", "").strip()),
            },
        },
        "date_interpretation": {
            "orange_book": "'Mon DD, YYYY'; 'Approved Prior to Jan 1, 1982' is kept as text and "
                           "flagged, and is treated as 1982-01-01 only when ranking a first "
                           "generic approval, where the flag is carried alongside.",
            "purple_book_two_digit_years": (
                "Approval Date, Inter. Approval Date and Date of First Licensure read as 20yy "
                f"unless that lands after {PB_AS_OF.isoformat()}, in which case 19yy. Exclusivity "
                f"expiry fields read as 20yy for yy<={PB_EXPIRY_SPLIT}, else 19yy."),
            "unexpired_as_of": {"orange_book": AS_OF.isoformat(),
                                "purple_book": PB_AS_OF.isoformat()},
        },
        "corpus_pages_total": len(idx.tier),
        "pages_matched_total": len(all_matched),
        "pages_matched_by_tier": tier_counts(all_matched),
        "pages_matched_by_rule": {
            rule: {"pages": len(keys), "by_tier": tier_counts(keys)}
            for rule, keys in sorted(matched_pages_by_rule.items())
        },
        "pages_confirmed_by_unii_or_structure": {
            "pages": len(confirmed), "by_tier": tier_counts(confirmed)},
        "pages_reached_only_via_salt_stripped_parent_substance": {
            "pages": len(via_parent_pages), "by_tier": tier_counts(via_parent_pages)},
        "fields_gained_by_tier": {
            tier: {f: len(keys) for f, keys in sorted(fields.items())}
            for tier, fields in sorted(fields_by_tier.items())
        },
        "rows_written": len(rows_out),
        "substance_name_resolution": dict(sorted(name_resolution_stats.items())),
        "substance_names_seen": len(substance_pages),
        "substance_names_matched_to_a_page": len(matched_names),
        "unmatched_record_count": unmatched_ob_products + unmatched_pb_products,
        "unmatched_records_breakdown": {
            "orange_book_products": unmatched_ob_products,
            "purple_book_products": unmatched_pb_products,
            "distinct_substance_names_unmatched": len(unmatched),
        },
        "unmatched_records_detail": "unmatched-records.json",
        "name_candidates_sent_to_review": (
            len(name_candidates) + len(brand_candidates)
            + len(suppressed_name_candidates) + len(suppressed_brand_candidates)),
        "name_candidates_emitted_into_mapped_parquet": len(name_candidates) + len(brand_candidates),
        "name_candidates_listed_for_review_only_page_already_bound_by_identifier": (
            len(suppressed_name_candidates) + len(suppressed_brand_candidates)),
        "name_candidate_pages": len(matched_pages_by_rule.get("name-candidate", set())),
        "combination_pages_matched": len({k for hits in combo_hits.values() for k in hits}),
    }
    with open(os.path.join(OUT_DIR, "coverage.json"), "w", encoding="utf-8") as fh:
        json.dump(coverage, fh, indent=2, sort_keys=True)
        fh.write("\n")

    with open(os.path.join(OUT_DIR, "unmatched-records.json"), "w", encoding="utf-8") as fh:
        json.dump(sorted(unmatched, key=lambda x: (x["dataset"], x["substance_name"])),
                  fh, indent=2)
        fh.write("\n")

    def substance_entry(k, name, emitted):
        return {"page_key": k, "page_display_name": idx.display.get(k, k), "tier": idx.tier_of(k),
                "source_dataset": "orange-book" if name in ob_names else "purple-book",
                "matched_on": "substance name", "source_name": name,
                "normalised_name": substance_pages[name]["normalised"],
                "emitted_to_mapped_parquet": emitted,
                "note": None if emitted else
                        "page already carries a record bound by UNII or InChIKey; "
                        "the bare name match is held for Phase 3 rather than emitted",
                "needs": "UNII or InChIKey confirmation"}

    def brand_entry(k, proper, brand, emitted):
        return {"page_key": k, "page_display_name": idx.display.get(k, k), "tier": idx.tier_of(k),
                "source_dataset": "purple-book", "matched_on": "proprietary name",
                "source_name": proper, "proprietary_name": brand,
                "normalised_name": normalise_name(brand, idx.salts),
                "emitted_to_mapped_parquet": emitted,
                "note": None if emitted else
                        "page already carries a record bound by UNII or InChIKey; "
                        "the bare name match is held for Phase 3 rather than emitted",
                "needs": "UNII or InChIKey confirmation"}

    review = (
        [substance_entry(k, name, True) for k, name in name_candidates]
        + [substance_entry(k, name, False) for k, name in suppressed_name_candidates]
        + [brand_entry(k, proper, brand, True) for k, proper, brand in brand_candidates]
        + [brand_entry(k, proper, brand, False) for k, proper, brand in suppressed_brand_candidates]
    )
    review.sort(key=lambda x: (x["tier"], x["page_key"], x["source_name"]))
    with open(os.path.join(OUT_DIR, "name-candidates-for-review.json"), "w", encoding="utf-8") as fh:
        json.dump(review, fh, indent=2)
        fh.write("\n")

    print(json.dumps({k: coverage[k] for k in [
        "pages_matched_total", "pages_matched_by_tier", "pages_matched_by_rule",
        "fields_gained_by_tier", "rows_written", "unmatched_record_count",
        "unmatched_records_breakdown", "name_candidates_sent_to_review",
        "substance_name_resolution", "combination_pages_matched",
        "pages_reached_only_via_salt_stripped_parent_substance",
    ]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
