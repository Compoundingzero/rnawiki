"""Map the EMA medicines output report onto corpus-20k pages.

Reads data/sources/ema/<date>/raw/medicines-output-medicines-report_en.xlsx,
keeps the centrally authorised human medicines, resolves each product's active
substances to a UNII through the FDA UNII name lists already held under
data/corpus-20k/raw/fda-unii/, and joins to corpus pages by the four mapping
rules of docs/specs/revamp-2026-09.md Phase 2, in priority order:

  (a) UNII exact
  (b) full InChIKey exact
  (c) InChIKey skeleton (first 14 characters) linked as form_of, never merged
  (d) normalised name, candidate only, sent to the Phase 3 review list

Writes data/sources/ema/mapped.parquet and data/sources/ema/coverage.json.
"""

from __future__ import annotations

import collections
import json
import re
import sys
from datetime import date as date_cls
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from corpus_join import load_corpus_index, normalise_name  # noqa: E402

UNII_NAMES = Path("data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt")
UNII_RECORDS = Path("data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt")
UNII_NAME_TYPES = ("of", "cn", "sys")  # official, common, systematic; brand and code excluded
LANDING = "https://www.ema.europa.eu/en/medicines/download-medicine-data"
LICENCE = (
    "EMA copyright and limited reproduction notice: reproduction and distribution permitted, "
    "in whole or in part, for non-commercial and commercial purposes, provided EMA is "
    "acknowledged as the source "
    "(https://www.ema.europa.eu/en/about-us/about-website/legal-notice)"
)
FIELD = "regulatory.EU"

_PUNCT = re.compile(r"[^a-z0-9]+")
_AS_SALT = re.compile(r"\s*\(\s*as\s+[^)]*\)\s*$", re.I)
_SPLIT = re.compile(r"[;\n]")

DATE_COLUMNS = {
    "European Commission decision date": "european_commission_decision",
    "Start of rolling review date": "start_of_rolling_review",
    "Start of evaluation date": "start_of_evaluation",
    "Opinion adopted date": "opinion_adopted",
    "Withdrawal of application date": "withdrawal_of_application",
    "Marketing authorisation date": "marketing_authorisation",
    "Refusal of marketing authorisation date": "refusal_of_marketing_authorisation",
    "Withdrawal / expiry / revocation / lapse of marketing authorisation date":
        "withdrawal_expiry_revocation_or_lapse_of_marketing_authorisation",
    "Suspension of marketing authorisation date": "suspension_of_marketing_authorisation",
    "First published date": "first_published",
    "Last updated date": "last_updated",
}

FLAG_COLUMNS = {
    "Accelerated assessment": "accelerated_assessment",
    "Additional monitoring": "additional_monitoring",
    "Advanced therapy": "advanced_therapy",
    "Biosimilar": "biosimilar",
    "Conditional approval": "conditional_approval",
    "Exceptional circumstances": "exceptional_circumstances",
    "Generic": "generic",
    "Orphan medicine": "orphan_medicine",
    "PRIME: priority medicine": "prime_priority_medicine",
    "Patient safety": "patient_safety",
}

SCHEMA = pa.schema(
    [
        ("key", pa.string()),
        ("tier", pa.int8()),
        ("field", pa.string()),
        ("value", pa.string()),
        ("source_record_id", pa.string()),
        ("source_url", pa.string()),
        ("source_date", pa.string()),
        ("match_rule", pa.string()),
        ("form_of_target", pa.string()),
        ("licence", pa.string()),
    ]
)


def strict_name(raw: str) -> str:
    return _PUNCT.sub(" ", raw.strip().lower()).strip()


def iso_date(raw) -> str | None:
    if not isinstance(raw, str):
        return None
    raw = raw.strip()
    m = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", raw)
    if not m:
        return None
    day, month, year = m.groups()
    return f"{year}-{month}-{day}"


def cell(row, column) -> str | None:
    value = row.get(column)
    if isinstance(value, str):
        value = value.strip()
        return value or None
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    return str(value)


class UniiResolver:
    """Resolve a substance name to a single UNII using the FDA UNII name lists."""

    def __init__(self, salts: list[str]) -> None:
        self.strict: dict[str, set[str]] = collections.defaultdict(set)
        self.loose: dict[str, set[str]] = collections.defaultdict(set)
        with UNII_NAMES.open(encoding="utf-8", errors="replace") as handle:
            handle.readline()
            for line in handle:
                parts = line.rstrip("\n").split("\t")
                if len(parts) < 3 or parts[1] not in UNII_NAME_TYPES:
                    continue
                name, unii = parts[0], parts[2].strip().upper()
                if not unii:
                    continue
                s = strict_name(name)
                if len(s) >= 3:
                    self.strict[s].add(unii)
                n = normalise_name(name, salts)
                if len(n) >= 3:
                    self.loose[n].add(unii)

        self.display: dict[str, str] = {}
        self.inchikey: dict[str, list[str]] = {}
        with UNII_RECORDS.open(encoding="utf-8", errors="replace") as handle:
            header = handle.readline().rstrip("\n").split("\t")
            col = {name: i for i, name in enumerate(header)}
            for line in handle:
                parts = line.rstrip("\n").split("\t")
                if len(parts) <= col["UNII"]:
                    continue
                unii = parts[col["UNII"]].strip().upper()
                if not unii:
                    continue
                display = parts[col["DISPLAY_NAME"]].strip() if len(parts) > col["DISPLAY_NAME"] else ""
                if display:
                    self.display[unii] = display
                raw_ik = parts[col["INCHIKEY"]].strip().upper() if len(parts) > col["INCHIKEY"] else ""
                # A UNII record may carry several InChIKeys, semicolon separated.
                keys = [k.strip() for k in raw_ik.split(";") if len(k.strip()) == 27]
                if keys:
                    self.inchikey[unii] = keys

    def resolve(self, name: str, corpus_uniis: set[str], salts: list[str]):
        """Return (unii, how) or (None, reason)."""
        s = strict_name(name)
        candidates = set(self.strict.get(s, ()))
        how = "unii_name_exact"
        if not candidates:
            candidates = set(self.loose.get(normalise_name(name, salts), ()))
            how = "unii_name_salt_stripped"
        if not candidates:
            return None, "no_unii_name_match"
        if len(candidates) > 1:
            exact_display = {u for u in candidates if strict_name(self.display.get(u, "")) == s}
            if len(exact_display) == 1:
                return exact_display.pop(), how + "_display_name_tiebreak"
            candidates = exact_display or candidates
        if len(candidates) > 1:
            in_corpus = candidates & corpus_uniis
            if len(in_corpus) == 1:
                return in_corpus.pop(), how + "_corpus_unii_tiebreak"
        if len(candidates) == 1:
            return candidates.pop(), how
        return None, "ambiguous_unii_name_match"


def main(pull_date: str) -> int:
    root = Path("data/sources/ema") / pull_date
    xlsx = root / "raw" / "medicines-output-medicines-report_en.xlsx"
    if not xlsx.exists():
        print(f"missing raw pull: {xlsx}", file=sys.stderr)
        return 1
    manifest = json.loads((root / "manifest.json").read_text())
    report_generated = None
    head = pd.read_excel(xlsx, sheet_name="Medicine", header=None, nrows=1, engine="openpyxl")
    if head.shape[1] > 3 and isinstance(head.iat[0, 3], str):
        report_generated = head.iat[0, 3].strip()

    idx = load_corpus_index()
    corpus_uniis = set(idx.unii_to_keys)
    resolver = UniiResolver(idx.salts)

    frame = pd.read_excel(xlsx, sheet_name="Medicine", header=8, engine="openpyxl")
    frame.columns = [str(c).replace("\n", " ").strip() for c in frame.columns]
    human = frame[frame["Category"] == "Human"].copy()
    veterinary = int((frame["Category"] != "Human").sum())

    rows: list[dict] = []
    stats = collections.Counter()
    status_counts = collections.Counter()
    status_pages: dict[str, set[str]] = collections.defaultdict(set)
    matched_products: set[str] = set()
    unmatched_products: list[dict] = []
    partly_matched: list[dict] = []
    pages_by_tier: dict[int, set[str]] = {1: set(), 2: set(), 3: set()}
    pages_by_tier_rule: dict[int, collections.Counter] = {
        1: collections.Counter(), 2: collections.Counter(), 3: collections.Counter()
    }
    rule_counts = collections.Counter()
    name_candidates: dict[str, dict] = {}
    ambiguous: dict[str, dict] = {}
    combination_pages: set[str] = set()
    substance_outcome = collections.Counter()

    for _, row in human.iterrows():
        product_number = cell(row, "EMA product number") or ""
        medicine_name = cell(row, "Name of medicine") or ""
        status = cell(row, "Medicine status") or "not stated"
        status_counts[status] += 1
        url = cell(row, "Medicine URL") or LANDING

        substances: list[tuple[str, str]] = []
        seen_norm: set[str] = set()
        for column, origin in (
            ("Active substance", "active_substance"),
            ("International non-proprietary name (INN) / common name", "inn"),
        ):
            raw = cell(row, column)
            if not raw:
                continue
            for part in _SPLIT.split(raw):
                part = _AS_SALT.sub("", part.strip()).strip()
                if not part:
                    continue
                marker = strict_name(part)
                if len(marker) < 3 or marker in seen_norm:
                    continue
                seen_norm.add(marker)
                substances.append((part, origin))

        dates = {}
        for column, name in DATE_COLUMNS.items():
            value = iso_date(row.get(column))
            if value:
                dates[name] = value
        flags = {}
        for column, name in FLAG_COLUMNS.items():
            value = cell(row, column)
            if value in ("Yes", "No"):
                flags[name] = value == "Yes"
        atc = [a.strip() for a in re.split(r"[;,\n]", cell(row, "ATC code (human)") or "") if a.strip()]
        revision = row.get("Revision number")
        base_record = {
            "agency": "EMA",
            "jurisdiction": "EU",
            "procedure": "centralised",
            "medicine_name": medicine_name,
            "ema_product_number": product_number,
            "status": status,
            "opinion_status": cell(row, "Opinion status"),
            "inn_or_common_name": cell(row, "International non-proprietary name (INN) / common name"),
            "active_substance_as_published": cell(row, "Active substance"),
            "atc_codes_human": atc,
            "therapeutic_area_mesh": cell(row, "Therapeutic area (MeSH)"),
            "pharmacotherapeutic_group": cell(row, "Pharmacotherapeutic group (human)"),
            "marketing_authorisation_holder": cell(row, "Marketing authorisation developer / applicant / holder"),
            "latest_procedure_affecting_product_information": cell(row, "Latest procedure affecting product information"),
            "revision_number": int(revision) if isinstance(revision, float) and not pd.isna(revision) else None,
            "dates": dates,
            "flags": flags,
            "medicine_url": cell(row, "Medicine URL"),
            "report_generated": report_generated,
        }
        base_record = {k: v for k, v in base_record.items() if v not in (None, "", [], {})}

        matched: dict[str, tuple[str, str | None, dict]] = {}
        for raw_name, origin in substances:
            unii, how = resolver.resolve(raw_name, corpus_uniis, idx.salts)
            provenance = {
                "matched_substance": raw_name,
                "matched_on": origin,
                "substance_resolution": how,
            }
            if unii:
                provenance["matched_unii"] = unii
                inchikeys = resolver.inchikey.get(unii, [])
                if inchikeys:
                    provenance["matched_inchikey"] = inchikeys
                keys = idx.unii_to_keys.get(unii)
                if keys:
                    substance_outcome["unii"] += 1
                    for key in keys:
                        matched.setdefault(key, ("unii", None, provenance))
                    continue
                by_inchikey = [k for ik in inchikeys for k in idx.inchikey_to_keys.get(ik, ())]
                if by_inchikey:
                    substance_outcome["inchikey"] += 1
                    for key in by_inchikey:
                        matched.setdefault(key, ("inchikey", None, provenance))
                    continue
                by_skeleton = [k for ik in inchikeys for k in idx.skeleton_to_keys.get(ik[:14], ())]
                if by_skeleton:
                    substance_outcome["skeleton"] += 1
                    for key in by_skeleton:
                        # form_of_target names the substance the page is linked as a form of:
                        # the UNII the EMA active substance resolved to.
                        matched.setdefault(key, ("skeleton", unii, provenance))
                    continue
            elif how == "ambiguous_unii_name_match":
                s = strict_name(raw_name)
                bucket = resolver.strict.get(s) or resolver.loose.get(normalise_name(raw_name, idx.salts)) or set()
                ambiguous.setdefault(
                    raw_name,
                    {
                        "substance": raw_name,
                        "candidate_uniis": sorted(bucket),
                        "candidate_uniis_in_corpus": sorted(bucket & corpus_uniis),
                        "products": [],
                    },
                )["products"].append(product_number)

            norm = normalise_name(raw_name, idx.salts)
            keys = idx.name_to_keys.get(norm) if len(norm) >= 3 else None
            if keys:
                substance_outcome["name-candidate"] += 1
                for key in keys:
                    matched.setdefault(key, ("name-candidate", None, provenance))
                entry = name_candidates.setdefault(
                    raw_name,
                    {
                        "substance": raw_name,
                        "normalised": norm,
                        "candidate_page_keys": [],
                        "products": [],
                        "reason": how,
                    },
                )
                for key in keys:
                    if key not in entry["candidate_page_keys"]:
                        entry["candidate_page_keys"].append(key)
                entry["products"].append(product_number)
            else:
                substance_outcome["unresolved"] += 1

        confirmed = {k for k, (rule, _, _) in matched.items() if rule in ("unii", "inchikey")}
        if len(confirmed) >= 2:
            for combo_key, components in idx.combination_components.items():
                if combo_key not in matched and components and components <= confirmed:
                    matched[combo_key] = (
                        "unii",
                        None,
                        {
                            "matched_on": "combination_of_confirmed_components",
                            "component_page_keys": sorted(components),
                        },
                    )
                    combination_pages.add(combo_key)

        if not matched:
            stats["unmatched_products"] += 1
            unmatched_products.append(
                {
                    "ema_product_number": product_number,
                    "medicine_name": medicine_name,
                    "status": status,
                    "substances": [s for s, _ in substances],
                }
            )
            continue

        matched_products.add(product_number)
        if len(confirmed) < len(
            {strict_name(s) for s, _ in substances}
        ) and any(rule == "name-candidate" for rule, _, _ in matched.values()):
            partly_matched.append(
                {"ema_product_number": product_number, "medicine_name": medicine_name}
            )

        for key, (rule, form_of, provenance) in sorted(matched.items()):
            tier = idx.tier_of(key)
            pages_by_tier[tier].add(key)
            status_pages[status].add(key)
            pages_by_tier_rule[tier][rule] += 1
            rule_counts[rule] += 1
            record = dict(base_record)
            record.update(provenance)
            record["match_rule"] = rule
            if rule == "skeleton":
                record["relation_to_page"] = "form_of"
            if rule == "name-candidate":
                record["confirmation"] = (
                    "unconfirmed: no UNII or InChIKey confirmation was found for this substance name; "
                    "sent to the Phase 3 review list"
                )
            rows.append(
                {
                    "key": key,
                    "tier": tier,
                    "field": FIELD,
                    "value": json.dumps(record, sort_keys=True, ensure_ascii=False),
                    "source_record_id": f"ema:medicine:{product_number}",
                    "source_url": url,
                    "source_date": pull_date,
                    "match_rule": rule,
                    "form_of_target": form_of,
                    "licence": LICENCE,
                }
            )

    table = pa.Table.from_pylist(rows, schema=SCHEMA)
    out = Path("data/sources/ema/mapped.parquet")
    pq.write_table(table, out, compression="zstd")

    fields_by_tier = {
        str(t): ({FIELD: len(pages_by_tier[t])} if pages_by_tier[t] else {}) for t in (1, 2, 3)
    }
    review_path = Path("data/sources/ema/name-candidates-for-review.json")
    review_payload = {
        "source": "ema",
        "generated": pull_date,
        "rule": "revamp-2026-09 Phase 2 mapping rule (d): a normalised-name match is a candidate "
                "until a UNII or InChIKey confirms it. Every entry below is unconfirmed.",
        "count": len(name_candidates),
        "candidates": sorted(name_candidates.values(), key=lambda c: c["substance"]),
        "ambiguousUniiResolutions": sorted(ambiguous.values(), key=lambda c: c["substance"]),
    }
    review_path.write_text(json.dumps(review_payload, indent=2, ensure_ascii=False) + "\n")

    unmatched_path = Path("data/sources/ema/unmatched-records.json")
    unmatched_path.write_text(
        json.dumps(
            {
                "source": "ema",
                "generated": pull_date,
                "count": len(unmatched_products),
                "records": unmatched_products,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )

    coverage = {
        "source": "ema",
        "sourceName": "European Medicines Agency, medicines output report",
        "status": "mapped",
        "retrievalDate": pull_date,
        "reportGenerated": report_generated,
        "reportLastModified": manifest.get("reportLastModified"),
        "supersedes": manifest.get("supersedes"),
        "licence": LICENCE,
        "attribution": "Source: European Medicines Agency",
        "rawFiles": len(manifest["files"]),
        "rawBytes": sum(f["bytes"] for f in manifest["files"]),
        "recordsInReport": int(len(frame)),
        "humanRecords": int(len(human)),
        "veterinaryRecordsExcluded": veterinary,
        "humanRecordsByStatus": dict(sorted(status_counts.items(), key=lambda kv: -kv[1])),
        "productsMatched": len(matched_products),
        "productsUnmatched": len(unmatched_products),
        "productsMatchedOnlyByUnconfirmedName": len(partly_matched),
        "mappedRows": len(rows),
        "corpusPagesByTier": {str(t): sum(1 for k in idx.tier if idx.tier_of(k) == t) for t in (1, 2, 3)},
        "corpusPagesTotal": len(idx.tier),
        "pagesMatchedByTier": {str(t): len(pages_by_tier[t]) for t in (1, 2, 3)},
        "pagesMatchedTotal": len(set().union(*pages_by_tier.values())) if rows else 0,
        "fieldsGainedByTier": fields_by_tier,
        "fieldsGained": [FIELD],
        "pagesConfirmedByUniiOrFullInchikey": len(
            {r["key"] for r in rows if r["match_rule"] in ("unii", "inchikey")}
        ),
        "pagesLinkedOnlyBySkeletonAsFormOf": len(
            {r["key"] for r in rows if r["match_rule"] == "skeleton"}
            - {r["key"] for r in rows if r["match_rule"] in ("unii", "inchikey")}
        ),
        "pagesReachedOnlyByUnconfirmedName": len(
            {r["key"] for r in rows if r["match_rule"] == "name-candidate"}
            - {r["key"] for r in rows if r["match_rule"] in ("unii", "inchikey", "skeleton")}
        ),
        "pagesByEmaStatus": {
            status: len(pages)
            for status, pages in sorted(status_pages.items(), key=lambda kv: -len(kv[1]))
        },
        "matchRuleCounts": dict(rule_counts),
        "matchRuleCountsByTier": {str(t): dict(pages_by_tier_rule[t]) for t in (1, 2, 3)},
        "substanceResolutionOutcomes": dict(substance_outcome),
        "combinationPagesReached": len(combination_pages),
        "unmatchedRecords": len(unmatched_products),
        "unmatchedRecordsFile": str(unmatched_path),
        "nameCandidatesSentToReview": len(name_candidates),
        "ambiguousUniiResolutions": len(ambiguous),
        "nameCandidateFile": str(review_path),
        "mappedParquet": str(out),
        "manifest": str(root / "manifest.json"),
        "saltListChange": (
            "scripts/revamp/salts.txt was read and not extended. Every EMA active-substance string "
            "that failed to reach a page was checked for an unlisted trailing counter-ion token; the "
            "residue is vaccine antigens, viral strains and cell therapies (attenuated, adjuvanted, "
            "adsorbed, recombinant, toxoid, strain), not salts, so no suffix was appended."
        ),
        "method": (
            "EMA publishes no UNII, InChIKey or structure. Each product's active substance and INN "
            "strings were resolved to a UNII against the FDA UNII name lists (types of/cn/sys; brand "
            "and code names excluded), exact punctuation-normalised name first, then the shared "
            "salt-stripped normaliser. A name resolving to more than one UNII is disambiguated by an "
            "exact UNII preferred-name match, then by a single corpus-present UNII; anything still "
            "ambiguous is not treated as a UNII match. A resolved UNII joins the corpus by UNII, then "
            "by its full InChIKey, then by InChIKey skeleton as form_of. A substance with no resolved "
            "UNII joins by normalised name as an unconfirmed candidate only."
        ),
    }
    Path("data/sources/ema/coverage.json").write_text(json.dumps(coverage, indent=2, ensure_ascii=False) + "\n")

    print(json.dumps({k: coverage[k] for k in (
        "humanRecords", "productsMatched", "productsUnmatched", "mappedRows",
        "pagesMatchedByTier", "pagesMatchedTotal", "matchRuleCounts",
        "nameCandidatesSentToReview", "ambiguousUniiResolutions", "combinationPagesReached",
    )}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else date_cls.today().isoformat()))
