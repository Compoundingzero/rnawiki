#!/usr/bin/env python3
"""Map the HSA Singapore Listing of Registered Therapeutic Products onto corpus
pages and write `data/sources/hsa-singapore/mapped.parquet` plus its coverage
report.

The HSA listing carries no chemical identifier: its only substance column is a
free-text `Activeingredients` string. The revamp spec's mapping rules are
identifier-first, so every ingredient string is first resolved to a UNII through
the FDA UNII names file (`data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt`)
and only then matched to a page:

  (a) UNII exact               - the resolved UNII is held by a page
  (b) full InChIKey exact      - the resolved UNII's InChIKey is held by a page
  (c) InChIKey skeleton        - first 14 characters, emitted as `form_of`
  (d) normalised name          - candidate only, for ingredient strings that
                                 resolve to no UNII; sent to the Phase 3 review
                                 list

Ingredient-string grammar observed in the 2026-08-07 release and handled here:
  `&&`                 separates the components of a combination product
  `X eqv Y`, `X EQV Y`, `X eqv. to Y`   X is the salt actually present, Y is the
                                        active moiety; both are resolved, and
                                        the moiety is preferred as the page target
  `123.4mg`, `5% w/v`  strength tokens inside the ingredient text
  `(...)`              qualifiers such as `(DRIED GEL)` or `(rDNA, ...)`

A multi-component product maps to every component page and additionally to a
combination page whose recorded components are exactly the set of component
pages resolved for that product.

Outputs:
  data/sources/hsa-singapore/mapped.parquet
  data/sources/hsa-singapore/regulatory-sg-status.parquet  (all corpus pages)
  data/sources/hsa-singapore/coverage.json
  data/sources/hsa-singapore/name-candidates-for-review.csv
  data/sources/hsa-singapore/unmatched-records.csv
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
sys.setrecursionlimit(10000)

import pandas as pd  # noqa: E402

from corpus_join import load_corpus_index, normalise_name  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "data" / "sources" / "hsa-singapore"
UNII_NAMES = ROOT / "data" / "corpus-20k" / "raw" / "fda-unii" / "UNII_Names_4Aug2026.txt"
UNII_RECORDS = (
    ROOT / "data" / "corpus-20k" / "raw" / "fda-unii" / "UNII_Records_4Aug2026.txt"
)

DATASET_ID = "d_767279312753558cbf19d48344577084"
PORTAL_URL = f"https://data.gov.sg/datasets/{DATASET_ID}/view"
LICENCE = "Singapore Open Data Licence version 1.0"

# Forensic classification, strictest first. HSA's three published values.
FORENSIC_ORDER = ["Prescription Only", "Pharmacy Only", "General Sale List"]
FORENSIC_PLAIN = {
    "Prescription Only": (
        "Prescription Only Medicine (POM): supplied in Singapore only against a "
        "prescription"
    ),
    "Pharmacy Only": (
        "Pharmacy Only Medicine (P): supplied in Singapore only by or under the "
        "supervision of a pharmacist, without a prescription"
    ),
    "General Sale List": (
        "General Sale List (GSL): may be sold in Singapore in general retail "
        "outlets"
    ),
}

# `eqv`, `eqv.`, `equiv`, `equiv to`, `equivalent to`, `eq to` all mark the
# active moiety that follows the salt actually present in the product.
EQV = re.compile(
    r"\s+(?:eqv|equv|equiv|equivalent|equ|eq|corresponding)\.?\s+(?:to\s+)?",
    re.IGNORECASE,
)

# Pharmaceutical-form qualifiers that HSA appends to an ingredient name. They
# are not counter-ions, so they are stripped here rather than in the shared
# salt list.
QUALIFIER = re.compile(
    r"\b(?:micronised|micronized|sterile|synthetic|highly\s+purified|purified|"
    r"dried|powder|pellets|recombinant|base|bp|usp|ep|jp|ph\.?\s?eur\.?)\b",
    re.IGNORECASE,
)

# Conjunction remnants left behind once a bracketed qualifier is removed, as in
# `Entrectinib (Form A) or (Form C)`.
CONJUNCTION_TAIL = re.compile(r"\s+(?:or|and|plus|with)\s*$", re.IGNORECASE)

# A normalised name that is nothing but a counter-ion or element must never be
# used to reach a page through the salt-stripped route: "sodium chloride"
# stripped to "sodium" would otherwise land on the sodium page.
COUNTER_ION_ONLY = {
    "sodium", "potassium", "calcium", "magnesium", "zinc", "aluminium",
    "aluminum", "iron", "ammonium", "lithium", "chloride", "bromide",
    "iodide", "hydroxide", "oxide", "carbonate", "bicarbonate", "acid",
    "water", "alcohol",
}
# A strength token may be glued to the substance name (`Irinotecan34.66mg/vial`)
# and may end the string on a percent sign, so the leading boundary is a digit
# boundary rather than a word boundary and no trailing word boundary is required.
STRENGTH = re.compile(
    r"(?<!\d)\d+(?:[.,]\d+)?\s*"
    r"(?:mg|mcg|ug|µg|g|kg|ml|l|iu|i\.u\.|units?|u|%)"
    r"(?![a-z])(?:\s*(?:w/w|w/v|v/v|v/w))?(?:\s*/\s*[a-z]+)?",
    re.IGNORECASE,
)
# `1H2O` and `2H2O` are hydrate counts written in formula notation.
HYDRATE_FORMULA = re.compile(r"\b\d*\s*H2O\b", re.IGNORECASE)
RATIO = re.compile(r"\(\s*\d+\s*:\s*\d+\s*\)")
PARENS = re.compile(r"\([^()]*\)")
_PUNCT_KEY = re.compile(r"[^a-z0-9]+")


def punct_key(raw: str) -> str:
    return _PUNCT_KEY.sub(" ", raw.strip().lower()).strip()


def clean_component(text: str) -> str:
    """Strip strength tokens, ratios and bracketed qualifiers."""
    out = RATIO.sub(" ", text)
    prev = None
    while prev != out:
        prev = out
        out = PARENS.sub(" ", out)
    out = STRENGTH.sub(" ", out)
    out = HYDRATE_FORMULA.sub(" ", out)
    out = QUALIFIER.sub(" ", out)
    out = re.sub(r"\s+", " ", out).strip(" ,;.-")
    out = CONJUNCTION_TAIL.sub("", out).strip(" ,;.-")
    return out


def split_components(raw: str) -> list[str]:
    parts = [p.strip() for p in raw.split("&&")]
    return [p for p in parts if p]


def component_candidates(component: str) -> list[tuple[str, str]]:
    """Return (role, name) candidates for one component, moiety first.

    `role` is `moiety` for the substance after an `eqv` marker, `salt` for the
    substance before it, and `whole` when the component carries no marker.
    """
    pieces = [p.strip() for p in EQV.split(component) if p.strip()]
    out: list[tuple[str, str]] = []
    if len(pieces) >= 2:
        moiety, salt = pieces[-1], pieces[0]
        for role, text in (("moiety", moiety), ("salt", salt)):
            for variant in (clean_component(text), text.strip()):
                if variant and (role, variant) not in out:
                    out.append((role, variant))
    else:
        for variant in (clean_component(component), component.strip()):
            if variant and ("whole", variant) not in out:
                out.append(("whole", variant))
    return out


def load_unii_names() -> tuple[dict[str, set], dict[str, set]]:
    """Return (exact punctuation-normalised name -> UNIIs, salt-stripped -> UNIIs)."""
    exact: dict[str, set] = {}
    stripped: dict[str, set] = {}
    salts = None
    from corpus_join import load_salts

    salts = load_salts()
    with UNII_NAMES.open(encoding="utf-8", errors="replace") as fh:
        header = fh.readline()
        if "UNII" not in header:
            raise RuntimeError(f"unexpected UNII names header: {header!r}")
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            name, _type, unii = parts[0], parts[1], parts[2]
            if not name or not unii:
                continue
            key = punct_key(name)
            if len(key) >= 3:
                exact.setdefault(key, set()).add(unii)
                norm = normalise_name(name, salts)
                if len(norm) >= 3 and norm != key:
                    stripped.setdefault(norm, set()).add(unii)
                elif len(norm) >= 3:
                    stripped.setdefault(norm, set()).add(unii)
    return exact, stripped


def load_unii_records() -> tuple[dict[str, str], dict[str, str]]:
    """Return (UNII -> InChIKey, UNII -> display name)."""
    inchikey: dict[str, str] = {}
    display: dict[str, str] = {}
    with UNII_RECORDS.open(encoding="utf-8", errors="replace") as fh:
        header = fh.readline().rstrip("\n").split("\t")
        i_unii = header.index("UNII")
        i_ik = header.index("INCHIKEY")
        i_dn = header.index("DISPLAY_NAME")
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) <= max(i_unii, i_ik, i_dn):
                continue
            unii = parts[i_unii].strip()
            if not unii:
                continue
            ik = parts[i_ik].strip().upper()
            if ik:
                inchikey[unii] = ik
            dn = parts[i_dn].strip()
            if dn:
                display[unii] = dn
    return inchikey, display


def parse_date(raw: str) -> str | None:
    """HSA approval dates are d/m/YYYY. Return ISO or None."""
    raw = (raw or "").strip()
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", raw)
    if not m:
        return None
    day, month, year = (int(x) for x in m.groups())
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    return f"{year:04d}-{month:02d}-{day:02d}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True, help="retrieval date directory, YYYY-MM-DD")
    args = ap.parse_args()

    date_dir = SOURCE_DIR / args.date
    manifest = json.loads((date_dir / "manifest.json").read_text())
    source_date = (manifest.get("dataset_last_updated") or "")[:10] or args.date
    csv_path = date_dir / "raw" / "hsa-registered-therapeutic-products.csv"

    idx = load_corpus_index()
    exact_names, stripped_names = load_unii_names()
    unii_to_inchikey, unii_display = load_unii_records()

    rows = list(csv.DictReader(csv_path.open(encoding="utf-8-sig")))

    controlled_path = SOURCE_DIR / "controlled-substances.parquet"
    controlled_summary_path = SOURCE_DIR / "controlled-substances-summary.json"
    controlled_by_key: dict[str, list[dict]] = {}
    controlled_note = (
        "Singapore Statutes Online schedules not present at "
        f"{controlled_path.relative_to(ROOT)} when this mapping ran"
    )
    if controlled_path.exists():
        cdf = pd.read_parquet(controlled_path)

        def _text(value):
            """Parquet nulls arrive as NaN, which is not representable in JSON."""
            if value is None or (isinstance(value, float) and value != value):
                return None
            text = str(value).strip()
            return text or None

        for rec in cdf.to_dict("records"):
            key = _text(rec.get("key"))
            if not key:
                continue
            entry = {
                "substance": _text(rec.get("substance")),
                "schedule": _text(rec.get("schedule")),
                "scheduleCode": _text(rec.get("schedule_code")),
                "itemNumber": _text(rec.get("item_number")),
                "statute": _text(rec.get("statute")),
                "statuteCitation": _text(rec.get("statute_citation")),
                "statuteUrl": _text(rec.get("source_url")),
                "statuteVersionDate": _text(rec.get("version_date")),
                "matchRule": _text(rec.get("match_rule")) or "unii",
                "matchedName": _text(rec.get("matched_name")),
                "matchedUnii": _text(rec.get("unii")),
            }
            note = _text(rec.get("paragraph_note"))
            if note:
                entry["paragraphNote"] = note
            form_of = _text(rec.get("form_of_target"))
            if form_of:
                entry["formOfTarget"] = form_of
            controlled_by_key.setdefault(key, []).append(entry)
        controlled_note = (
            f"{len(controlled_by_key)} pages carry a Misuse of Drugs Act or "
            "Poisons Act schedule entry from "
            f"{controlled_path.relative_to(ROOT)}"
        )

    # --- resolve each distinct ingredient component once --------------------
    resolution_cache: dict[str, dict] = {}
    stats = collections.Counter()

    def resolve(component: str) -> dict:
        """Resolve one ingredient string to UNIIs through the FDA UNII names file.

        Two ordered sets are returned. `exact_uniis` come from a
        punctuation-normalised exact match on a registered FDA substance name and
        are tried first. `stripped_uniis` come from the shared salt-stripped
        normaliser and are tried only when the exact set reaches no page, which
        is what lets `THEOPHYLLINE` reach the page keyed on the UNII of
        `THEOPHYLLINE ANHYDROUS`.
        """
        if component in resolution_cache:
            return resolution_cache[component]
        exact_uniis: list[str] = []
        stripped_uniis: list[str] = []
        resolved_by = None
        resolved_name = None
        role_used = None
        for role, name in component_candidates(component):
            key = punct_key(name)
            if len(key) < 3:
                continue
            hits = exact_names.get(key)
            if hits:
                for unii in sorted(hits):
                    if unii not in exact_uniis:
                        exact_uniis.append(unii)
                if resolved_by is None:
                    resolved_by = "fda-unii-name-exact"
                    resolved_name = name
                    role_used = role
            norm = normalise_name(name, idx.salts)
            if len(norm) >= 3 and norm not in COUNTER_ION_ONLY:
                shits = stripped_names.get(norm)
                if shits:
                    for unii in sorted(shits):
                        if unii not in stripped_uniis:
                            stripped_uniis.append(unii)
                    if resolved_by is None:
                        resolved_by = "fda-unii-name-salt-stripped"
                        resolved_name = name
                        role_used = role
        result = {
            "component": component,
            "exact_uniis": exact_uniis,
            "stripped_uniis": stripped_uniis,
            "uniis": exact_uniis + [u for u in stripped_uniis if u not in exact_uniis],
            "resolved_by": resolved_by,
            "resolved_name": resolved_name,
            "role": role_used,
            "ambiguous": len(exact_uniis) > 1,
        }
        resolution_cache[component] = result
        return result

    def pages_for(resolved: dict, component: str) -> list[dict]:
        """Apply the four mapping rules to one resolved component.

        Within each rule the exact-name UNIIs are tried before the salt-stripped
        UNIIs, so a widened name never displaces a match the registered name
        already made.
        """
        tiers = [
            ("fda-unii-name-exact", resolved["exact_uniis"]),
            ("fda-unii-name-salt-stripped", resolved["stripped_uniis"]),
        ]

        def by_unii(uniis: list[str]) -> list[dict]:
            out: list[dict] = []
            seen: set[str] = set()
            for unii in uniis:
                for key in idx.unii_to_keys.get(unii, []):
                    if key in seen:
                        continue
                    seen.add(key)
                    out.append(
                        {
                            "key": key,
                            "match_rule": "unii",
                            "form_of_target": None,
                            "matched_unii": unii,
                            "matched_inchikey": unii_to_inchikey.get(unii),
                        }
                    )
            return out

        def by_inchikey(uniis: list[str]) -> list[dict]:
            out: list[dict] = []
            seen: set[str] = set()
            for unii in uniis:
                ik = unii_to_inchikey.get(unii)
                if not ik:
                    continue
                for key in idx.inchikey_to_keys.get(ik, []):
                    if key in seen:
                        continue
                    seen.add(key)
                    out.append(
                        {
                            "key": key,
                            "match_rule": "inchikey",
                            "form_of_target": None,
                            "matched_unii": unii,
                            "matched_inchikey": ik,
                        }
                    )
            return out

        def by_skeleton(uniis: list[str]) -> list[dict]:
            out: list[dict] = []
            seen: set[str] = set()
            for unii in uniis:
                ik = unii_to_inchikey.get(unii)
                if not ik:
                    continue
                for key in idx.skeleton_to_keys.get(ik[:14], []):
                    if key in seen:
                        continue
                    seen.add(key)
                    out.append(
                        {
                            "key": key,
                            "match_rule": "skeleton",
                            # The page holds the skeleton; the HSA product holds
                            # this exact form of it, linked and never merged.
                            "form_of_target": ik,
                            "matched_unii": unii,
                            "matched_inchikey": ik,
                        }
                    )
            return out

        for rule_fn in (by_unii, by_inchikey, by_skeleton):
            for level, uniis in tiers:
                if not uniis:
                    continue
                hits = rule_fn(uniis)
                if hits:
                    for hit in hits:
                        hit["name_resolution"] = level
                    return hits

        # (d) normalised name, candidate only.
        out: list[dict] = []
        for _role, name in component_candidates(component):
            norm = normalise_name(name, idx.salts)
            if len(norm) < 3 or norm in COUNTER_ION_ONLY:
                continue
            keys = idx.name_to_keys.get(norm)
            if not keys:
                continue
            if len(keys) > 1:
                stats["name_candidates_dropped_ambiguous_page"] += 1
                continue
            for key in keys:
                out.append(
                    {
                        "key": key,
                        "match_rule": "name-candidate",
                        "form_of_target": None,
                        "matched_unii": None,
                        "matched_inchikey": None,
                        "candidate_name": name,
                        "normalised_name": norm,
                        "name_resolution": "corpus-page-name-normalised",
                    }
                )
            break
        return out

    # --- walk the register --------------------------------------------------
    per_page_products: dict[str, list[dict]] = collections.defaultdict(list)
    per_page_rules: dict[str, set] = collections.defaultdict(set)
    per_page_form_of: dict[str, set] = collections.defaultdict(set)
    per_page_uniis: dict[str, set] = collections.defaultdict(set)
    product_rows: list[dict] = []
    unmatched: list[dict] = []
    name_candidate_rows: list[dict] = []
    combination_hits: dict[str, list[dict]] = collections.defaultdict(list)
    matched_licences: set[str] = set()

    for rec in rows:
        licence_no = rec["LicenceNo"].strip()
        ingredient_raw = rec["Activeingredients"].strip()
        components = split_components(ingredient_raw)
        product = {
            "licenceNumber": licence_no,
            "productName": rec["Productname"].strip(),
            "licenceHolder": rec["Licenseholder"].strip(),
            "approvalDate": parse_date(rec["Approvaldate"]),
            "approvalDateAsPublished": rec["Approvaldate"].strip(),
            "forensicClassification": rec["Forensicclassification"].strip(),
            "atcCode": rec["ATCCode"].strip() or None,
            "dosageForm": rec["Dosageform"].strip() or None,
            "routeOfAdministration": rec["RouteofAdministration"].strip() or None,
            "manufacturer": rec["Manufacturer"].strip() or None,
            "countryOfManufacturer": rec["Countryofmanufacturer"].strip() or None,
            "strength": rec["Strength"].strip() or None,
            "activeIngredientsAsPublished": ingredient_raw,
            "componentCount": len(components),
        }

        component_page_keys: list[set] = []
        any_match = False
        for component in components:
            resolved = resolve(component)
            if resolved["uniis"]:
                stats["components_resolved_to_unii"] += 1
                if resolved["ambiguous"]:
                    stats["components_ambiguous_unii"] += 1
            else:
                stats["components_unresolved"] += 1
            matches = pages_for(resolved, component)
            component_page_keys.append({m["key"] for m in matches})
            if not matches:
                continue
            any_match = True
            for m in matches:
                key = m["key"]
                entry = dict(product)
                entry["componentAsPublished"] = component
                entry["componentRole"] = resolved["role"]
                entry["matchedSubstanceName"] = (
                    unii_display.get(m["matched_unii"])
                    if m["matched_unii"]
                    else m.get("candidate_name")
                )
                entry["matchedUnii"] = m["matched_unii"]
                entry["nameResolution"] = m.get("name_resolution") or resolved["resolved_by"]
                if m["match_rule"] == "name-candidate":
                    entry["confirmation"] = (
                        "none; this ingredient name resolved to no UNII in the FDA "
                        "UNII names file, so the page link is a candidate for the "
                        "Phase 3 review list and is not an identifier match"
                    )
                    name_candidate_rows.append(
                        {
                            "key": key,
                            "tier": idx.tier_of(key),
                            "page": idx.display.get(key, key),
                            "licenceNumber": licence_no,
                            "productName": product["productName"],
                            "componentAsPublished": component,
                            "candidateName": m.get("candidate_name"),
                            "normalisedName": m.get("normalised_name"),
                        }
                    )
                per_page_products[key].append(entry)
                per_page_rules[key].add(m["match_rule"])
                if m["form_of_target"]:
                    per_page_form_of[key].add(m["form_of_target"])
                if m["matched_unii"]:
                    per_page_uniis[key].add(m["matched_unii"])
                product_rows.append(
                    {
                        "key": key,
                        "tier": idx.tier_of(key),
                        "field": "hsaProduct",
                        "value": json.dumps(entry, ensure_ascii=False),
                        "source_record_id": licence_no,
                        "source_url": PORTAL_URL,
                        "source_date": source_date,
                        "match_rule": m["match_rule"],
                        "form_of_target": m["form_of_target"],
                        "licence": LICENCE,
                    }
                )
        if any_match:
            matched_licences.add(licence_no)
        else:
            unmatched.append(
                {
                    "licenceNumber": licence_no,
                    "productName": product["productName"],
                    "activeIngredients": ingredient_raw,
                    "forensicClassification": product["forensicClassification"],
                    "reason": (
                        "no component of this product resolved to a UNII held by a "
                        "corpus page, to an InChIKey or skeleton held by a page, or "
                        "to a single page by normalised name"
                    ),
                }
            )

        # Combination page: every component resolved, and some combination page
        # records exactly that component set.
        if len(components) >= 2 and all(component_page_keys):
            for combo_key, parts in idx.combination_components.items():
                if len(parts) != len(component_page_keys):
                    continue
                assignment = []
                remaining = set(parts)
                ok = True
                for keyset in component_page_keys:
                    overlap = keyset & remaining
                    if not overlap:
                        ok = False
                        break
                    chosen = sorted(overlap)[0]
                    assignment.append(chosen)
                    remaining.discard(chosen)
                if ok and not remaining:
                    combination_hits[combo_key].append(
                        {"licenceNumber": licence_no, "components": assignment}
                    )

    for combo_key, hits in combination_hits.items():
        for hit in hits:
            licence_no = hit["licenceNumber"]
            src = next(
                (r for r in rows if r["LicenceNo"].strip() == licence_no), None
            )
            if src is None:
                continue
            entry = {
                "licenceNumber": licence_no,
                "productName": src["Productname"].strip(),
                "licenceHolder": src["Licenseholder"].strip(),
                "approvalDate": parse_date(src["Approvaldate"]),
                "forensicClassification": src["Forensicclassification"].strip(),
                "atcCode": src["ATCCode"].strip() or None,
                "dosageForm": src["Dosageform"].strip() or None,
                "routeOfAdministration": src["RouteofAdministration"].strip() or None,
                "strength": src["Strength"].strip() or None,
                "activeIngredientsAsPublished": src["Activeingredients"].strip(),
                "matchedAsCombinationOf": hit["components"],
                "componentCount": len(hit["components"]),
            }
            per_page_products[combo_key].append(entry)
            per_page_rules[combo_key].add("unii")
            product_rows.append(
                {
                    "key": combo_key,
                    "tier": idx.tier_of(combo_key),
                    "field": "hsaProduct",
                    "value": json.dumps(entry, ensure_ascii=False),
                    "source_record_id": licence_no,
                    "source_url": PORTAL_URL,
                    "source_date": source_date,
                    "match_rule": "unii",
                    "form_of_target": None,
                    "licence": LICENCE,
                }
            )
            stats["combination_page_rows"] += 1

    # --- per-page aggregate fields -----------------------------------------
    def best_rule(rules: set) -> str:
        for rule in ("unii", "inchikey", "skeleton", "name-candidate"):
            if rule in rules:
                return rule
        return "name-candidate"

    subsidy_statement = {
        "status": "not published as open data",
        "statement": (
            "No drug-level subsidy list is published on data.gov.sg as of "
            f"{args.date}. All 4,616 datasets in the portal catalogue were read "
            "and searched; the Ministry of Health dataset "
            "d_586ee0cbc5c79ff8167a46132a405239 (Healthcare Schemes and "
            "Subsidies) names the Standard Drug List and the Medication "
            "Assistance Fund as two of 26 schemes but carries no medicine. The "
            "Ministry of Health publishes its subsidised-drug list only as a "
            "paginated in-page table at "
            "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/"
            "list-of-subsidised-drugs/, which offers no bulk or API route and "
            "states no reuse licence, so it was not retrieved."
        ),
        "searchedOn": args.date,
        "evidence": [
            f"data/sources/hsa-singapore/{args.date}/raw/search/catalogue.json",
            f"data/sources/hsa-singapore/{args.date}/raw/search/catalogue-matches.json",
            f"data/sources/hsa-singapore/{args.date}/raw/search/"
            "moh-healthcare-schemes-records.json",
        ],
    }

    mapped_rows: list[dict] = list(product_rows)
    matched_pages = sorted(per_page_products)

    for key in matched_pages:
        products = per_page_products[key]
        tier = idx.tier_of(key)
        rule = best_rule(per_page_rules[key])
        form_of = sorted(per_page_form_of[key]) or None
        classes = collections.Counter(
            p["forensicClassification"] for p in products if p.get("forensicClassification")
        )
        strictest = next((c for c in FORENSIC_ORDER if c in classes), None)
        dates = sorted(p["approvalDate"] for p in products if p.get("approvalDate"))
        atc = sorted({p["atcCode"] for p in products if p.get("atcCode")})
        holders = sorted({p["licenceHolder"] for p in products if p.get("licenceHolder")})
        controlled = controlled_by_key.get(key)

        regulatory = {
            "jurisdiction": "Singapore",
            "register": "HSA Listing of Registered Therapeutic Products",
            "status": "registered",
            "statusStatement": (
                f"Registered with the Health Sciences Authority: "
                f"{len(products)} product licence"
                f"{'s' if len(products) != 1 else ''} as of {source_date}"
            ),
            "asOf": source_date,
            "retrievedOn": args.date,
            "productCount": len(products),
            "forensicClassification": strictest,
            "forensicClassificationPlain": FORENSIC_PLAIN.get(strictest),
            "forensicClassificationCounts": dict(classes),
            "earliestApprovalDate": dates[0] if dates else None,
            "latestApprovalDate": dates[-1] if dates else None,
            "atcCodes": atc,
            "licenceHolderCount": len(holders),
            "matchRule": rule,
            "subsidy": subsidy_statement,
            "controlledStatus": controlled
            or {
                "status": (
                    "not listed in the Misuse of Drugs Act First Schedule or the "
                    "Poisons Act schedules retrieved for this run"
                )
            },
        }
        mapped_rows.append(
            {
                "key": key,
                "tier": tier,
                "field": "regulatorySG",
                "value": json.dumps(regulatory, ensure_ascii=False),
                "source_record_id": DATASET_ID,
                "source_url": PORTAL_URL,
                "source_date": source_date,
                "match_rule": rule,
                "form_of_target": form_of[0] if form_of else None,
                "licence": LICENCE,
            }
        )
        if strictest:
            mapped_rows.append(
                {
                    "key": key,
                    "tier": tier,
                    "field": "hsaForensicClass",
                    "value": json.dumps(
                        {
                            "class": strictest,
                            "plainLanguage": FORENSIC_PLAIN[strictest],
                            "counts": dict(classes),
                            "asOf": source_date,
                        },
                        ensure_ascii=False,
                    ),
                    "source_record_id": DATASET_ID,
                    "source_url": PORTAL_URL,
                    "source_date": source_date,
                    "match_rule": rule,
                    "form_of_target": None,
                    "licence": LICENCE,
                }
            )
        if holders:
            mapped_rows.append(
                {
                    "key": key,
                    "tier": tier,
                    "field": "hsaRegistrants",
                    "value": json.dumps(
                        {"licenceHolders": holders, "asOf": source_date},
                        ensure_ascii=False,
                    ),
                    "source_record_id": DATASET_ID,
                    "source_url": PORTAL_URL,
                    "source_date": source_date,
                    "match_rule": rule,
                    "form_of_target": None,
                    "licence": LICENCE,
                }
            )
        if atc:
            mapped_rows.append(
                {
                    "key": key,
                    "tier": tier,
                    "field": "hsaAtcCodes",
                    "value": json.dumps(
                        {"atcCodes": atc, "asOf": source_date}, ensure_ascii=False
                    ),
                    "source_record_id": DATASET_ID,
                    "source_url": PORTAL_URL,
                    "source_date": source_date,
                    "match_rule": rule,
                    "form_of_target": None,
                    "licence": LICENCE,
                }
            )

    # Controlled-substance rows for pages that carry a schedule entry, whether or
    # not the substance is a registered therapeutic product.
    for key, entries in controlled_by_key.items():
        tier = idx.tier_of(key)
        mapped_rows.append(
            {
                "key": key,
                "tier": tier,
                "field": "sgControlledStatus",
                "value": json.dumps(
                    {
                        "jurisdiction": "Singapore",
                        "entries": entries,
                        "retrievedOn": args.date,
                    },
                    ensure_ascii=False,
                ),
                "source_record_id": "sso.agc.gov.sg",
                "source_url": "https://sso.agc.gov.sg/",
                "source_date": max(
                    (e.get("statuteVersionDate") or "") for e in entries
                )
                or args.date,
                # The strictest rule that reached this page: an identifier match
                # is preferred, and a skeleton match is recorded as `form_of`.
                "match_rule": next(
                    (
                        rule
                        for rule in ("unii", "inchikey", "skeleton")
                        if any(e.get("matchRule") == rule for e in entries)
                    ),
                    "unii",
                ),
                "form_of_target": next(
                    (e["formOfTarget"] for e in entries if e.get("formOfTarget")),
                    None,
                ),
                "licence": (
                    "Singapore legislation, reproduced with the permission of the "
                    "Attorney-General's Chambers under clause 13 of the Singapore "
                    "Statutes Online Terms of Use"
                ),
            }
        )

    mapped = pd.DataFrame(
        mapped_rows,
        columns=[
            "key",
            "tier",
            "field",
            "value",
            "source_record_id",
            "source_url",
            "source_date",
            "match_rule",
            "form_of_target",
            "licence",
        ],
    )
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    mapped.to_parquet(SOURCE_DIR / "mapped.parquet", index=False)

    # --- SG registration status on every corpus page (Gate G2) -------------
    all_keys = sorted(idx.tier)
    status_rows = []
    matched_set = set(matched_pages)
    for key in all_keys:
        if key in matched_set:
            status = "registered"
            statement = (
                "Registered with the Health Sciences Authority: "
                f"{len(per_page_products[key])} product licence"
                f"{'s' if len(per_page_products[key]) != 1 else ''} in the "
                f"Listing of Registered Therapeutic Products as of {source_date}"
            )
        else:
            status = "not found"
            statement = (
                "Not found in the HSA Listing of Registered Therapeutic Products "
                f"as of {source_date}"
            )
        controlled = controlled_by_key.get(key)
        if controlled:
            schedules = sorted({e["schedule"] for e in controlled if e.get("schedule")})
            versions = sorted(
                {e["statuteVersionDate"] for e in controlled if e.get("statuteVersionDate")}
            )
            controlled_status = "listed"
            controlled_statement = (
                "Listed in Singapore statutory control: "
                + "; ".join(schedules)
                + f" (statute text in force as of {', '.join(versions)}, "
                f"retrieved {args.date})"
            )
        else:
            schedules = []
            versions = []
            controlled_status = "not listed"
            controlled_statement = (
                "Not listed in the Misuse of Drugs Act 1973 First or Fourth "
                "Schedule, the Poisons Act 1938 Schedule or the Poisons Rules "
                f"schedules retrieved on {args.date}"
            )
        status_rows.append(
            {
                "key": key,
                "tier": idx.tier_of(key),
                "page": idx.display.get(key, key),
                "status": status,
                "statement": statement,
                "controlled_status": controlled_status,
                "controlled_statement": controlled_statement,
                "controlled_schedules": json.dumps(schedules, ensure_ascii=False),
                "statute_version_dates": json.dumps(versions, ensure_ascii=False),
                "as_of": source_date,
                "retrieved_on": args.date,
                "product_count": len(per_page_products.get(key, [])),
                "match_rule": best_rule(per_page_rules[key]) if key in matched_set else None,
                "source_url": PORTAL_URL,
                "licence": LICENCE,
            }
        )
    status_df = pd.DataFrame(status_rows)
    status_df.to_parquet(SOURCE_DIR / "regulatory-sg-status.parquet", index=False)

    # --- coverage -----------------------------------------------------------
    pages_by_tier = collections.Counter(idx.tier_of(k) for k in matched_pages)
    fields_by_tier: dict[str, collections.Counter] = {
        "1": collections.Counter(),
        "2": collections.Counter(),
        "3": collections.Counter(),
    }
    seen_field_page: set[tuple[str, str]] = set()
    for row in mapped_rows:
        pair = (row["key"], row["field"])
        if pair in seen_field_page:
            continue
        seen_field_page.add(pair)
        fields_by_tier[str(row["tier"])][row["field"]] += 1
    rules_by_tier: dict[str, collections.Counter] = collections.defaultdict(
        collections.Counter
    )
    page_rule_seen: set[tuple[str, str]] = set()
    for row in mapped_rows:
        pair = (row["key"], row["match_rule"])
        if pair in page_rule_seen:
            continue
        page_rule_seen.add(pair)
        rules_by_tier[row["match_rule"]][str(row["tier"])] += 1

    name_candidate_pages = sorted({r["key"] for r in name_candidate_rows})
    coverage = {
        "source": "hsa-singapore",
        "source_name": (
            "Health Sciences Authority, Listing of Registered Therapeutic Products"
        ),
        "dataset_id": DATASET_ID,
        "source_url": PORTAL_URL,
        "source_date": source_date,
        "retrieval_date": args.date,
        "licence": LICENCE,
        "register_records": len(rows),
        "register_records_matched": len(matched_licences),
        "unmatched_records": len(unmatched),
        "corpus_pages": len(idx.tier),
        "pages_matched_by_tier": {str(t): pages_by_tier.get(t, 0) for t in (1, 2, 3)},
        "pages_matched_total": len(matched_pages),
        "fields_gained_by_tier": {
            tier: dict(sorted(counter.items())) for tier, counter in fields_by_tier.items()
        },
        "mapped_rows": len(mapped_rows),
        "pages_by_match_rule_and_tier": {
            rule: dict(sorted(counts.items())) for rule, counts in rules_by_tier.items()
        },
        "components_resolved_to_unii": stats["components_resolved_to_unii"],
        "components_unresolved": stats["components_unresolved"],
        "components_ambiguous_unii": stats["components_ambiguous_unii"],
        "name_candidates_dropped_ambiguous_page": stats[
            "name_candidates_dropped_ambiguous_page"
        ],
        "name_candidates_sent_to_review": len(name_candidate_rows),
        "name_candidate_pages": len(name_candidate_pages),
        "name_candidate_review_list": (
            "data/sources/hsa-singapore/name-candidates-for-review.csv"
        ),
        "combination_page_rows": stats["combination_page_rows"],
        "combination_pages_matched": len(combination_hits),
        "sg_registration_status_all_pages": (
            "data/sources/hsa-singapore/regulatory-sg-status.parquet"
        ),
        "sg_registration_status_counts": {
            "registered": len(matched_pages),
            "not found": len(all_keys) - len(matched_pages),
        },
        "subsidy": subsidy_statement,
        "controlled_substances": {
            "note": controlled_note,
            "table": str(controlled_path.relative_to(ROOT)),
            "pages_with_a_schedule_entry": len(controlled_by_key),
            "pages_with_a_schedule_entry_by_tier": dict(
                sorted(
                    collections.Counter(
                        idx.tier_of(k) for k in controlled_by_key
                    ).items()
                )
            ),
            "summary": (
                json.loads(controlled_summary_path.read_text())
                if controlled_summary_path.exists()
                else None
            ),
        },
        "unmatched_record_list": "data/sources/hsa-singapore/unmatched-records.csv",
        "forensic_classification_counts_in_register": dict(
            collections.Counter(r["Forensicclassification"].strip() for r in rows)
        ),
        "method": {
            "identifier_confirmation": (
                "Every ingredient string is resolved to a UNII through "
                "data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt before any "
                "page match. A page match by UNII, InChIKey or InChIKey skeleton "
                "is identifier-confirmed; an ingredient string that resolves to "
                "no UNII reaches a page only as a name candidate and goes to the "
                "Phase 3 review list."
            ),
            "combination_products": (
                "`&&` separates the components of a combination product. Every "
                "component is mapped to its own page. A combination page is "
                "additionally matched only when its recorded component set is "
                "exactly the set of component pages resolved for that product."
            ),
            "salt_and_moiety": (
                "`X eqv Y` marks X as the salt present and Y as the active "
                "moiety. Both are resolved; the moiety is preferred as the page "
                "target. Where only a salt resolves and its InChIKey skeleton "
                "matches a page, the row is emitted with match_rule `skeleton` "
                "and form_of_target set to that InChIKey, never merged."
            ),
        },
    }
    (SOURCE_DIR / "coverage.json").write_text(json.dumps(coverage, indent=1))

    with (SOURCE_DIR / "name-candidates-for-review.csv").open("w", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "key",
                "tier",
                "page",
                "licenceNumber",
                "productName",
                "componentAsPublished",
                "candidateName",
                "normalisedName",
            ],
        )
        writer.writeheader()
        writer.writerows(name_candidate_rows)

    with (SOURCE_DIR / "unmatched-records.csv").open("w", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "licenceNumber",
                "productName",
                "activeIngredients",
                "forensicClassification",
                "reason",
            ],
        )
        writer.writeheader()
        writer.writerows(unmatched)

    print(
        json.dumps(
            {
                "mapped_rows": len(mapped_rows),
                "pages_matched": len(matched_pages),
                "pages_by_tier": {str(t): pages_by_tier.get(t, 0) for t in (1, 2, 3)},
                "register_records": len(rows),
                "records_matched": len(matched_licences),
                "unmatched": len(unmatched),
                "name_candidates": len(name_candidate_rows),
                "combination_pages": len(combination_hits),
            },
            indent=1,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
