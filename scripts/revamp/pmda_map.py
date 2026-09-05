"""Map PMDA approved-product records onto corpus pages and write mapped.parquet + coverage.json.

PMDA's English list carries no UNII, no InChIKey and no structure: it names an active ingredient in
JAN/INN English. The confirmation the spec requires is obtained by resolving that ingredient name
against the FDA UNII name file already held at data/corpus-20k/raw/fda-unii/, then applying the
four mapping rules in their priority order:

  unii           the ingredient name resolves to exactly one UNII and a corpus page carries it
  inchikey       that UNII carries a full InChIKey that a corpus page carries
  skeleton       that UNII's InChIKey skeleton (14) matches a corpus page; linked form_of, not merged
  name-candidate the normalised name matches a corpus page name with no UNII or InChIKey agreement

Multi-ingredient rows map to each component and, where the corpus holds a combination page whose
components are exactly the mapped set, to that page as well.
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corpus_join import CANONICAL, load_corpus_index, normalise_name  # noqa: E402

PULL_DATE = "2026-09-06"
BASE = Path("data/sources/pmda")
PARSED = BASE / PULL_DATE / "parsed" / "approvals.ndjson"
UNII_NAMES = Path("data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt")
UNII_RECORDS = Path("data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt")
DRUGCENTRAL = Path("data/sources/drugcentral/mapped.parquet")

SOURCE_URL = ("https://www.pmda.go.jp/english/review-services/reviews/"
              "approved-information/drugs/0002.html")
LICENCE = ("Public Data License 1.0 (公共データ利用規約 第1.0版); attribution to PMDA with the page "
           "URL required; commercial use and redistribution permitted; no share-alike")
FIELD = "regulatory.JP"

# Name types used for confirmation: common, official and systematic names. Brand names ("bn") and
# code identifiers ("cd") are excluded — a brand name is not evidence of substance identity here.
CONFIRMING_NAME_TYPES = {"cn", "of", "sys"}

QUALIFIERS = re.compile(
    r"\((?:genetical\s+recombination|genetical\s+recombination\)[^)]*|recombinant|"
    r"genetical recombination\s*\[[^\]]*\])\)?", re.I)


def top_level_split(text: str, seps: tuple[str, ...]) -> list[str]:
    """Split on separators that are outside parentheses and square brackets."""
    parts, buf, depth = [], [], 0
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth = max(0, depth - 1)
        if depth == 0 and ch in seps:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    parts.append("".join(buf))
    return [p.strip() for p in parts if p.strip()]


def light_normalise(raw: str) -> str:
    """Lowercase and fold punctuation, keeping the salt and stereo words the name actually carries."""
    text = QUALIFIERS.sub(" ", raw or "").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


class Resolver:
    def __init__(self, idx):
        self.idx = idx
        # Two levels: the name exactly as written (so "amlodipine besilate" and "amlodipine" are
        # different substances) and the spec's normalised form (so a JAN salt spelling still
        # reaches the parent). The exact level is tried first.
        self.exact_to_unii: dict[str, set[str]] = defaultdict(set)
        self.name_to_unii: dict[str, set[str]] = defaultdict(set)
        self.unii_inchikey: dict[str, str] = {}
        with UNII_NAMES.open(encoding="utf-8", errors="replace", newline="") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                if row.get("TYPE") not in CONFIRMING_NAME_TYPES:
                    continue
                unii = (row.get("UNII") or "").strip().upper()
                if not unii:
                    continue
                raw_name = row.get("NAME") or ""
                light = light_normalise(raw_name)
                if len(light) >= 3:
                    self.exact_to_unii[light].add(unii)
                norm = normalise_name(raw_name, idx.salts)
                if len(norm) >= 3:
                    self.name_to_unii[norm].add(unii)
        with UNII_RECORDS.open(encoding="utf-8", errors="replace", newline="") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                ik = (row.get("INCHIKEY") or "").strip().upper()
                unii = (row.get("UNII") or "").strip().upper()
                if unii and ik:
                    self.unii_inchikey[unii] = ik
        # The names each corpus page carries as written, before any salt suffix is stripped.
        # idx.name_to_keys is built by stripping salts from the page's own names too, so
        # "Calcium Lactate" and "Calcium Palmitate" are both indexed under "calcium". This
        # index is what tells a parent match ("Vilanterol trifenatate" reaching the page
        # actually named "Vilanterol") apart from two different salts of a shared parent.
        self.page_light_names: dict[str, set[str]] = defaultdict(set)
        with CANONICAL.open(encoding="utf-8") as fh:
            for line in fh:
                rec = json.loads(line)
                key = rec["key"]
                names = [rec.get("displayName") or ""]
                for syn in rec.get("synonyms") or []:
                    names.append(syn.get("name") or "")
                for raw_name in names:
                    token = light_normalise(raw_name)
                    if len(token) >= 3:
                        self.page_light_names[key].add(token)

    def resolves(self, raw: str) -> bool:
        light = light_normalise(raw)
        norm = normalise_name(QUALIFIERS.sub(" ", raw), self.idx.salts)
        if len(norm) < 3 and len(light) < 3:
            return False
        return (light in self.exact_to_unii or norm in self.name_to_unii
                or norm in self.idx.name_to_keys)


def join_wrapped_lines(cell: str, resolver: Resolver) -> list[str]:
    """Rejoin PDF line wraps inside one ingredient cell; keep genuine separate ingredients apart."""
    lines = [l.strip() for l in cell.split("\n") if l.strip()]
    if not lines:
        return []
    out = [lines[0]]
    for line in lines[1:]:
        prev = out[-1]
        if prev.endswith("-"):
            # The hyphen is part of the name (a locant, a stereo letter, a conjugate); keep it.
            out[-1] = prev + line
            continue
        if prev.endswith((",", "/", "+")) or line[0] in "/+":
            out.append(line)
            continue
        if line[0].islower() or line[0] in "([":
            # A wrap can fall inside a word ("Ethinylestrad" / "iol") or between words.
            if resolver.resolves(prev + " " + line) or not resolver.resolves(prev + line):
                out[-1] = prev + " " + line
            else:
                out[-1] = prev + line
            continue
        # The line starts a new word in title case: a wrap and a new ingredient look the same.
        # Decide by which reading resolves against the UNII name file or a corpus page name.
        joined = prev + " " + line
        if resolver.resolves(joined):
            out[-1] = joined
        elif resolver.resolves(prev) and resolver.resolves(line):
            out.append(line)
        else:
            out[-1] = joined
    return out


def split_on_commas(text: str) -> list[str]:
    """Split on top-level commas, but never inside a numbered list such as a vaccine serotype set."""
    parts = top_level_split(text, (",",))
    if len(parts) == 1:
        return parts
    merged = [parts[0]]
    for part in parts[1:]:
        if re.match(r"^\d", part) or re.search(r"\d$", merged[-1]):
            merged[-1] = merged[-1] + ", " + part
        else:
            merged.append(part)
    return merged


def components_of(raw: str, resolver: Resolver) -> list[str]:
    if not raw:
        return []
    if re.match(r"(?i)^n/?a\b", raw.strip()):
        return []
    pieces: list[str] = []
    for chunk in join_wrapped_lines(raw, resolver):
        # Older rows number the ingredients of one entry "(1) X (2) Y"; the markers are separators.
        chunk = re.sub(r"\(?\s*\d{1,2}\s*\)", "\u0001", chunk)
        for enumerated in chunk.split("\u0001"):
            for part in top_level_split(enumerated, ("/", "+")):
                for sub in split_on_commas(part):
                    for piece in re.split(r"(?<=[a-z0-9\)])\s+and\s+(?=[A-Za-z])", sub):
                        piece = re.sub(r"^(?:and|with)\s+", "", piece.strip(" .;"), flags=re.I)
                        piece = piece.strip(" .;")
                        if len(piece) >= 3 and re.search(r"[A-Za-z]{3}", piece):
                            pieces.append(piece)
    seen, out = set(), []
    for p in pieces:
        if p.lower() not in seen:
            seen.add(p.lower())
            out.append(p)
    return out


def match_component(name: str, resolver: Resolver, idx, stats: Counter,
                    sibling_rejects: list[dict]):
    """Return (rule, keys, form_of_target, unii_note) for one ingredient name.

    A name that resolves to several UNIIs sitting on several different corpus pages is not an exact
    UNII match: it is an unconfirmed name, and it goes to the Phase 3 review list rather than
    stamping an approval onto every page the name could mean.
    """
    cleaned = QUALIFIERS.sub(" ", name)
    light = light_normalise(name)
    norm = normalise_name(cleaned, idx.salts)
    if len(norm) < 3 and len(light) < 3:
        return None, [], None, None

    for level, token, table in (("exact", light, resolver.exact_to_unii),
                                ("normalised", norm, resolver.name_to_unii)):
        if len(token) < 3:
            continue
        uniis = sorted(table.get(token, ()))
        if not uniis:
            continue
        keys: list[str] = []
        for unii in uniis:
            for key in idx.unii_to_keys.get(unii, []):
                if key not in keys:
                    keys.append(key)
        if keys:
            if len(uniis) == 1 or len(keys) == 1:
                stats[f"unii_match_via_{level}_name"] += 1
                return "unii", keys, None, ";".join(uniis)
            stats[f"ambiguous_{level}_name_{len(uniis)}_uniis"] += 1
            continue
        if len(uniis) == 1:
            ik = resolver.unii_inchikey.get(uniis[0])
            if ik:
                ik_keys = list(idx.inchikey_to_keys.get(ik, []))
                if ik_keys:
                    stats["inchikey_match"] += 1
                    return "inchikey", ik_keys, None, uniis[0]
                skel_keys = list(idx.skeleton_to_keys.get(ik[:14], []))
                if skel_keys:
                    stats["skeleton_match"] += 1
                    # The PMDA substance holds no page of its own here: name it as the form_of
                    # target so the link reads from the related page to the source record.
                    target = (f"PMDA:{name.strip()} (UNII {uniis[0]}) — "
                              "a different form of this substance; no page in this corpus")
                    return "skeleton", skel_keys, target, uniis[0]

    name_keys = idx.name_to_keys.get(norm, [])
    if name_keys:
        # Rule (d) is a candidate on a normalised name, and normalisation strips the counter-ion
        # from the page's own name as well as from the PMDA name. Where the page needed its own
        # salt stripped to meet this name, the two are different salts of a shared parent, or two
        # unrelated substances sharing a cation: "Calcium gluconate hydrate" and "Oxalic Acid"
        # both reduce to "calcium". Such a pair is not a candidate for this substance's approval,
        # so it is held out of the mapped rows and written to the review file with its reason.
        kept, rejected = [], []
        for key in name_keys:
            (kept if norm in resolver.page_light_names.get(key, ()) else rejected).append(key)
        for key in rejected:
            sibling_rejects.append({
                "key": key,
                "corpus_display_name": idx.display.get(key),
                "pmda_name": name.strip(),
                "normalised_to": norm,
                "reason": ("the page name matches only after its own salt or counter-ion was "
                           "stripped, so this is a different substance sharing a normalised "
                           "name, not a form of the substance PMDA approved"),
            })
        if kept:
            stats["name_candidate"] += 1
            return "name-candidate", kept, None, None
        stats["name_candidate_all_siblings_rejected"] += 1
        return "sibling-salt-only", [], None, None
    return None, [], None, None


def main() -> int:
    idx = load_corpus_index()
    resolver = Resolver(idx)
    records = [json.loads(l) for l in PARSED.open(encoding="utf-8")]

    rows: list[dict] = []
    name_candidates: list[dict] = []
    unmatched: list[dict] = []
    sibling_rejects: list[dict] = []
    stats = Counter()
    matched_keys_by_tier: dict[int, set[str]] = defaultdict(set)
    rule_counts = Counter()
    emitted: set[tuple[str, str]] = set()

    for rec in records:
        raw = rec.get("active_ingredient_raw") or ""
        parts = components_of(raw, resolver)
        if not parts:
            stats["records_without_mappable_ingredient"] += 1
            unmatched.append({"source_record_id": rec["source_record_id"],
                              "reason": "no active ingredient named in the PMDA row",
                              "active_ingredient_raw": raw or None,
                              "brand_names": rec["brand_names"],
                              "approval_date": rec["approval_date"]})
            continue
        record_hits: list[tuple[str, str, str | None, str]] = []
        record_misses: list[str] = []
        sibling_only_parts: set[str] = set()
        for part in parts:
            rule, keys, form_of, unii = match_component(part, resolver, idx, stats,
                                                        sibling_rejects)
            if not keys:
                if rule == "sibling-salt-only":
                    sibling_only_parts.add(part)
                record_misses.append(part)
                continue
            for key in keys:
                record_hits.append((key, rule, form_of if rule == "skeleton" else None, part))

        # A combination page whose components are exactly the mapped component pages.
        component_keys = frozenset(k for k, _, _, _ in record_hits)
        if len(component_keys) >= 2:
            for combo_key, members in idx.combination_components.items():
                if members == component_keys:
                    record_hits.append((combo_key, "name-candidate", None, raw.replace("\n", " ")))

        if not record_hits:
            stats["records_unmatched"] += 1
            unmatched.append({"source_record_id": rec["source_record_id"],
                              "reason": ("no corpus page for any named ingredient"
                                         if sibling_only_parts != set(parts) else
                                         "every named ingredient reaches a corpus page only "
                                         "through a normalised name shared by counter-ion, not "
                                         "by substance; held out and listed in "
                                         "name-candidates-held-out.json"),
                              "active_ingredient_raw": raw,
                              "components": parts,
                              "brand_names": rec["brand_names"],
                              "approval_date": rec["approval_date"]})
            continue
        if record_misses:
            stats["records_partially_matched"] += 1
        stats["records_matched"] += 1

        for key, rule, form_of, part in record_hits:
            dedupe = (key, rec["source_record_id"] + "|" + part)
            if dedupe in emitted:
                continue
            emitted.add(dedupe)
            tier = idx.tier_of(key)
            value = {
                "approved": True,
                "year": rec["approval_year"],
                "source": "PMDA List of Approved Products (New Drugs), English",
                "agency": "Pharmaceuticals and Medical Devices Agency (PMDA), Japan",
                "approval_date": rec["approval_date"],
                "approval_type": rec["approval_type"],
                "review_category": rec["review_category"],
                "active_ingredient_as_listed": part,
                "active_ingredient_cell_as_listed": raw.replace("\n", " "),
                "brand_names_in_japan": rec["brand_names"],
                "applicant": rec["applicant"],
                "listing_note": rec["notes"],
                "listing": "List of Approved Products (New Drugs), April 2004 to February 2026",
                "pdf_page": rec["pdf_page"],
            }
            if rule == "skeleton":
                value["form_relationship"] = (
                    "PMDA approved a different form (salt, ester, hydrate or stereoisomer) of the "
                    "substance on this page; the approval is recorded as a linked form, not merged")
            rows.append({
                "key": key,
                "tier": tier,
                "field": FIELD,
                "value": json.dumps(value, ensure_ascii=False),
                "source_record_id": rec["source_record_id"],
                "source_url": SOURCE_URL,
                "source_date": PULL_DATE,
                "match_rule": rule,
                "form_of_target": form_of or "",
                "licence": LICENCE,
            })
            rule_counts[rule] += 1
            matched_keys_by_tier[tier].add(key)
            if rule == "name-candidate":
                name_candidates.append({
                    "key": key,
                    "tier": tier,
                    "corpus_display_name": idx.display.get(key),
                    "pmda_name": part,
                    "source_record_id": rec["source_record_id"],
                    "approval_date": rec["approval_date"],
                    "needs": "UNII or InChIKey confirmation before this approval is shown on the page",
                })
        for miss in record_misses:
            reason = ("ingredient names no corpus page and resolves to no corpus UNII"
                      if miss not in sibling_only_parts else
                      "ingredient reaches a corpus page only through a normalised name that the "
                      "page shares by counter-ion, not by substance; held out and listed in "
                      "name-candidates-for-review.json")
            unmatched.append({"source_record_id": rec["source_record_id"],
                              "reason": reason,
                              "component": miss,
                              "active_ingredient_raw": raw,
                              "approval_date": rec["approval_date"]})

    df = pd.DataFrame(rows, columns=["key", "tier", "field", "value", "source_record_id",
                                     "source_url", "source_date", "match_rule",
                                     "form_of_target", "licence"])
    df.to_parquet(BASE / "mapped.parquet", index=False)

    # Cross-check against DrugCentral's PMDA flag.
    crosscheck = {"drugcentral_mapped_parquet_present": DRUGCENTRAL.exists()}
    if DRUGCENTRAL.exists():
        dc = pd.read_parquet(DRUGCENTRAL, columns=["key", "field", "value", "tier"])
        dc_jp = dc[dc["field"] == "regulatory.JP"]
        dc_keys = set(dc_jp["key"])
        pm_keys = set(df["key"])
        both = dc_keys & pm_keys
        crosscheck.update({
            "drugcentral_pages_with_regulatory_JP": len(dc_keys),
            "pmda_pages_with_regulatory_JP": len(pm_keys),
            "pages_in_both": len(both),
            "pages_only_in_drugcentral": len(dc_keys - pm_keys),
            "pages_only_in_pmda": len(pm_keys - dc_keys),
            "agreement_rate_over_union": round(len(both) / len(dc_keys | pm_keys), 4) if (dc_keys | pm_keys) else None,
            "discrepancy_reading": (
                "DrugCentral's PMDA flag comes from its 2023-11-01 release and marks any Japanese "
                "approval it holds; the PMDA list covers new-drug approvals from April 2004 only. "
                "A page only in DrugCentral is a Japanese approval outside that window or one PMDA "
                "lists under a name that resolves to no UNII here; a page only in PMDA is an "
                "approval DrugCentral's 2023 release does not carry, including every approval after "
                "November 2023."
            ),
            "pages_only_in_drugcentral_list": [
                {"key": k, "display_name": idx.display.get(k, k), "tier": idx.tier_of(k)}
                for k in sorted(dc_keys - pm_keys)],
            "pages_only_in_pmda_list": [
                {"key": k, "display_name": idx.display.get(k, k), "tier": idx.tier_of(k)}
                for k in sorted(pm_keys - dc_keys)],
        })
        dc_release = "2023-11-01"
        after_release = {
            row["key"] for _, row in df.iterrows()
            if (json.loads(row["value"]).get("approval_date") or "") > dc_release
        }
        crosscheck["drugcentral_release_date"] = dc_release
        crosscheck["pmda_pages_whose_only_approval_postdates_the_drugcentral_release"] = len(
            after_release - dc_keys)
    with open(BASE / "drugcentral-pmda-crosscheck.json", "w", encoding="utf-8") as fh:
        json.dump(crosscheck, fh, indent=2, ensure_ascii=False)

    fields_by_tier = {str(t): {FIELD: len(keys)} for t, keys in sorted(matched_keys_by_tier.items())}
    coverage = {
        "source": "pmda",
        "dataset": "PMDA List of Approved Products (New Drugs), English, April 2004 to February 2026",
        "source_url": SOURCE_URL,
        "source_date": PULL_DATE,
        "licence": LICENCE,
        "corpus_pages_total": len(idx.tier),
        "pmda_records_parsed": len(records),
        "pmda_ingredient_components_seen": sum(
            len(components_of(r.get("active_ingredient_raw") or "", resolver)) for r in records),
        "pages_matched_by_tier": {str(t): len(k) for t, k in sorted(matched_keys_by_tier.items())},
        "pages_matched_total": len(set(df["key"])),
        "fields_gained_by_tier": fields_by_tier,
        "rows_written": len(df),
        "match_rule_row_counts": dict(rule_counts),
        "match_rule_page_counts": {
            rule: len(set(df[df["match_rule"] == rule]["key"])) for rule in sorted(set(df["match_rule"]))
        },
        "records_matched": stats["records_matched"],
        "records_partially_matched": stats["records_partially_matched"],
        "unmatched_record_count": stats["records_unmatched"] + stats["records_without_mappable_ingredient"],
        "unmatched_breakdown": {
            "no_corpus_page_for_any_named_ingredient": stats["records_unmatched"],
            "row_names_no_active_ingredient_in_the_source": stats["records_without_mappable_ingredient"],
        },
        "unmatched_component_rows": sum(1 for u in unmatched if "component" in u),
        "name_candidates_sent_to_phase_3_review": len(name_candidates),
        "name_candidate_pages": len({c["key"] for c in name_candidates}),
        "name_pairs_held_out_as_shared_counter_ion": len(sibling_rejects),
        "name_pairs_held_out_pages": len({c["key"] for c in sibling_rejects}),
        "name_pairs_held_out_file": "data/sources/pmda/name-candidates-held-out.json",
        "resolution_diagnostics": {k: v for k, v in sorted(stats.items())
                                   if k.startswith(("unii_match", "ambiguous", "inchikey", "skeleton", "name_candidate"))},
        "drugcentral_crosscheck": "data/sources/pmda/drugcentral-pmda-crosscheck.json",
    }
    with open(BASE / "coverage.json", "w", encoding="utf-8") as fh:
        json.dump(coverage, fh, indent=2, ensure_ascii=False)
    with open(BASE / "name-candidates-for-review.json", "w", encoding="utf-8") as fh:
        json.dump(name_candidates, fh, indent=2, ensure_ascii=False)
    with open(BASE / "name-candidates-held-out.json", "w", encoding="utf-8") as fh:
        json.dump(sibling_rejects, fh, indent=2, ensure_ascii=False)
    with open(BASE / "unmatched-records.json", "w", encoding="utf-8") as fh:
        json.dump(unmatched, fh, indent=2, ensure_ascii=False)

    print(json.dumps(coverage, indent=2, ensure_ascii=False))
    print(json.dumps(crosscheck, indent=2, ensure_ascii=False)[:1500])
    return 0


if __name__ == "__main__":
    sys.exit(main())
