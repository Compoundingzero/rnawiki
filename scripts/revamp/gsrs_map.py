#!/usr/bin/env python
"""Phase 2 source 2 — GSRS / FDA Global Substance Registration System.

Reads the GSRS public bulk dump (gzip, one substance JSON per line, the JSON
preceded by tab-delimited dump columns) and writes three artefacts:

  data/sources/gsrs/spine.parquet   one row per GSRS substance: the Phase 3
                                    identity spine (unii, preferred_name,
                                    substance_class, inchikey, parent_unii,
                                    active_moiety_unii, synonyms).
  data/sources/gsrs/mapped.parquet  one row per corpus page x field value, for
                                    the fields GSRS supplies beyond the FDA UNII
                                    flat files already held on disk.
  data/sources/gsrs/coverage.json   pages matched per tier, fields gained per
                                    tier, unmatched GSRS records, name
                                    candidates sent to the Phase 3 review list.

Mapping rules are applied to each GSRS record in the priority order set by
docs/specs/revamp-2026-09.md Phase 2:

  (a) UNII exact
  (b) full InChIKey exact
  (c) InChIKey skeleton (first 14 characters) -> linked as form_of, never merged
  (d) normalised name -> candidate only, needing (a) or (b) confirmation; with
      (a) and (b) already failed no confirmation exists, so every name match is
      written with match_rule "name-candidate" and listed for Phase 3 review.

InChIKeys absent from the dump structure block are computed from the recorded
SMILES with RDKit; the computation is recorded per row in
inchikey_source so a computed key is never presented as a registry value.
"""

from __future__ import annotations

import argparse
import gzip
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "gsrs"
LICENCE = "US Government work, public domain (FDA/NCATS)"

# Relationship type strings are written "<related substance role>-><this record's
# role>". Verified on two records in the dump: FYTATE SODIUM (a salt) carries
# "PARENT->SALT/SOLVATE" pointing at FYTIC ACID, and carvedilol free base
# carries "SALT/SOLVATE->PARENT" pointing at carvedilol hydrochloride.
REL_PARENT_OF_THIS = "PARENT->SALT/SOLVATE"
REL_ACTIVE_MOIETY = "ACTIVE MOIETY"

FORM_RELATION_TYPES = {
    "PARENT->SALT/SOLVATE",
    "SALT/SOLVATE->PARENT",
    "ANHYDROUS->SOLVATE",
    "SOLVATE->ANHYDROUS",
    "ENANTIOMER->RACEMATE",
    "RACEMATE->ENANTIOMER",
    "DIASTEREOISOMER->PARENT",
    "PARENT->DIASTEREOISOMER",
}

STEREO_PREFIX = re.compile(
    r"^(?:"
    r"\(\s*[+-]?\s*(?:[rszecdl]|rs|sr|ar|as|\+|-|\+/-|±)\s*\)|"
    r"[\[\(]\s*(?:\d+[rszec],?\s*)+\s*[\]\)]|"
    r"d|l|dl|dj|rac|racemic|cis|trans|alpha|beta|gamma|delta|epsilon|omega|"
    r"n|o|s|p|z|e|r|meso|syn|anti|endo|exo|ortho|meta|para|sec|tert|iso|neo|"
    r"levo|dextro|\+|-|±"
    r")[\s,\-]+",
    re.IGNORECASE,
)

PUNCT = re.compile(r"[^a-z0-9]+")


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def load_salts(path: Path) -> list[str]:
    suffixes = []
    for line in path.read_text(encoding="utf8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        suffixes.append(line.lower())
    # Longest first so "dihydrogen phosphate" wins over "phosphate".
    return sorted(set(suffixes), key=lambda s: (-len(s.split()), -len(s)))


def strip_stereo(name: str) -> str:
    prev = None
    out = name
    while prev != out:
        prev = out
        out = STEREO_PREFIX.sub("", out, count=1).strip()
    return out


def normalise_name(raw: str, salt_tokens: list[list[str]]) -> str:
    if not raw:
        return ""
    text = unicodedata.normalize("NFKD", raw)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().strip()
    # Registry decorations: "ASPIRIN [USAN]", "ASPIRIN (USP)".
    text = re.sub(r"\s*[\[(][^\])]*[\])]\s*$", " ", text).strip()
    text = strip_stereo(text)
    text = PUNCT.sub(" ", text).strip()
    tokens = text.split()
    changed = True
    while changed and tokens:
        changed = False
        for salt in salt_tokens:
            n = len(salt)
            if len(tokens) > n and tokens[-n:] == salt:
                tokens = tokens[:-n]
                changed = True
                break
    return " ".join(tokens)


def load_corpus(salt_tokens: list[list[str]]) -> dict:
    canonical = ROOT / "data/corpus-20k/identity/canonical.ndjson"
    tiers_path = ROOT / "data/corpus-20k/tiers/model-assignment.ndjson"

    model = {}
    for line in tiers_path.open(encoding="utf8"):
        d = json.loads(line)
        m = d.get("model")
        withdrawn = bool(d.get("withdrawn"))
        if m == "LONGEVITY" or withdrawn:
            tier = 1
        elif m == "CLINICAL":
            tier = 2
        else:
            tier = 3
        model[d["key"]] = tier

    by_unii: dict[str, list[str]] = defaultdict(list)
    by_inchikey: dict[str, list[str]] = defaultdict(list)
    by_skeleton: dict[str, list[str]] = defaultdict(list)
    by_name: dict[str, list[str]] = defaultdict(list)
    tier_of: dict[str, int] = {}
    page_unii: dict[str, str] = {}
    page_inchikey: dict[str, str] = {}

    pages = 0
    for line in canonical.open(encoding="utf8"):
        d = json.loads(line)
        key = d["key"]
        pages += 1
        tier_of[key] = model.get(key, 3)
        unii = (d.get("unii") or "").strip().upper()
        if unii:
            by_unii[unii].append(key)
            page_unii[key] = unii
        st = d.get("structure") or {}
        ik = (st.get("inchikey") or "").strip().upper()
        ik14 = (st.get("inchikey14") or "").strip().upper()
        if ik:
            by_inchikey[ik].append(key)
            page_inchikey[key] = ik
        if not ik14 and ik:
            ik14 = ik[:14]
        if ik14:
            by_skeleton[ik14].append(key)
        names = [d.get("displayName") or ""]
        names += [s.get("name") or "" for s in d.get("synonyms", [])]
        for nm in names:
            norm = normalise_name(nm, salt_tokens)
            if len(norm) >= 4:
                by_name[norm].append(key)

    for table in (by_unii, by_inchikey, by_skeleton, by_name):
        for k, v in table.items():
            table[k] = sorted(set(v))

    log(
        f"corpus: {pages} pages, {len(by_unii)} uniis, {len(by_inchikey)} inchikeys, "
        f"{len(by_skeleton)} skeletons, {len(by_name)} normalised names"
    )
    return {
        "by_unii": by_unii,
        "by_inchikey": by_inchikey,
        "by_skeleton": by_skeleton,
        "by_name": by_name,
        "tier_of": tier_of,
        "page_unii": page_unii,
        "page_inchikey": page_inchikey,
        "pages": pages,
    }


def load_fda_unii_flatfile() -> dict:
    """What the FDA UNII flat files already on disk hold, so that only fields
    GSRS supplies beyond them are written into mapped.parquet."""
    records = ROOT / "data/corpus-20k/raw/fda-unii/UNII_Records_4Aug2026.txt"
    have_structure: set[str] = set()
    have_class: set[str] = set()
    known: set[str] = set()
    inchikey: dict[str, str] = {}
    with records.open(encoding="utf8", errors="replace") as fh:
        header = fh.readline().rstrip("\n").split("\t")
        idx = {name: i for i, name in enumerate(header)}
        for line in fh:
            row = line.rstrip("\n").split("\t")
            if len(row) < len(header):
                row += [""] * (len(header) - len(row))
            unii = row[idx["UNII"]].strip().upper()
            if not unii:
                continue
            known.add(unii)
            ik = row[idx["INCHIKEY"]].strip().upper()
            if ik:
                have_structure.add(unii)
                inchikey[unii] = ik
            elif row[idx["SMILES"]].strip():
                have_structure.add(unii)
            if row[idx["SUBSTANCE_TYPE"]].strip():
                have_class.add(unii)

    names = ROOT / "data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt"
    name_pairs: dict[str, set[tuple[str, str]]] = defaultdict(set)
    with names.open(encoding="utf8", errors="replace") as fh:
        header = fh.readline().rstrip("\n").split("\t")
        idx = {name: i for i, name in enumerate(header)}
        for line in fh:
            row = line.rstrip("\n").split("\t")
            if len(row) < len(header):
                row += [""] * (len(header) - len(row))
            unii = row[idx["UNII"]].strip().upper()
            if not unii:
                continue
            name_pairs[unii].add(
                (row[idx["NAME"]].strip().upper(), row[idx["TYPE"]].strip())
            )
    log(
        f"fda-unii flat files: {len(known)} uniis, {len(have_structure)} with structure, "
        f"{len(have_class)} with substance type, {len(name_pairs)} with names"
    )
    return {
        "known": known,
        "have_structure": have_structure,
        "have_class": have_class,
        "inchikey": inchikey,
        "name_pairs": name_pairs,
    }


def inchikey_from_smiles(smiles: str, cache: dict[str, str | None]) -> str | None:
    if not smiles:
        return None
    if smiles in cache:
        return cache[smiles]
    try:
        from rdkit import Chem
        from rdkit.Chem import inchi as rd_inchi

        mol = Chem.MolFromSmiles(smiles, sanitize=True)
        key = rd_inchi.MolToInchiKey(mol) if mol is not None else None
        key = key.strip().upper() if key else None
    except Exception:
        key = None
    if len(cache) < 400000:
        cache[smiles] = key
    return key


def preferred_name(record: dict) -> str:
    names = record.get("names") or []
    for n in names:
        if n.get("displayName"):
            return (n.get("name") or "").strip()
    for n in names:
        if n.get("preferred"):
            return (n.get("name") or "").strip()
    if names:
        return (names[0].get("name") or "").strip()
    return ""


def iter_records(dump: Path):
    with gzip.open(dump, "rt", encoding="utf8", errors="replace") as fh:
        for lineno, line in enumerate(fh, 1):
            brace = line.find("{")
            if brace < 0:
                continue
            try:
                yield lineno, json.loads(line[brace:])
            except json.JSONDecodeError:
                continue


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump", required=True)
    ap.add_argument("--date", required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    dump = Path(args.dump)
    out_dir = ROOT / "data/sources/gsrs"
    out_dir.mkdir(parents=True, exist_ok=True)
    source_url = (
        "https://gsrs.ncats.nih.gov/assets/downloads/" + dump.name
    )

    salt_suffixes = load_salts(ROOT / "scripts/revamp/salts.txt")
    salt_tokens = [s.split() for s in salt_suffixes]
    corpus = load_corpus(salt_tokens)
    flat = load_fda_unii_flatfile()

    ik_cache: dict[str, str | None] = {}

    spine_rows: list[dict] = []
    mapped_rows: list[dict] = []
    name_candidates: list[dict] = []

    rule_counts = Counter()
    unmatched = 0
    records_seen = 0
    class_counts = Counter()
    computed_inchikeys = 0
    matched_pages_by_tier: dict[int, set[str]] = defaultdict(set)
    fields_by_tier: dict[int, Counter] = defaultdict(Counter)
    new_uniis = 0
    struct_beyond_flat = 0
    class_beyond_flat = 0
    name_ambiguous = 0
    mixture_component_rows = 0
    pages_by_rule_tier: dict[str, dict[int, set]] = defaultdict(lambda: defaultdict(set))

    for lineno, rec in iter_records(dump):
        if args.limit and records_seen >= args.limit:
            break
        records_seen += 1
        if records_seen % 20000 == 0:
            log(f"  {records_seen} records, {len(mapped_rows)} mapped rows")

        unii = (rec.get("approvalID") or "").strip().upper()
        substance_class = rec.get("substanceClass") or ""
        class_counts[substance_class] += 1
        pname = preferred_name(rec)
        struct = rec.get("structure") or {}
        smiles = (struct.get("smiles") or "").strip()
        ik = (struct.get("inchikey") or "").strip().upper()
        ik_source = "gsrs" if ik else ""
        if not ik and unii and unii in flat["inchikey"]:
            ik = flat["inchikey"][unii]
            ik_source = "fda-unii-flatfile"
        if not ik and smiles:
            computed = inchikey_from_smiles(smiles, ik_cache)
            if computed:
                ik = computed
                ik_source = "computed-rdkit"
                computed_inchikeys += 1

        synonyms = [
            {
                "name": (n.get("name") or "").strip(),
                "type": n.get("type") or "",
                "preferred": bool(n.get("preferred")),
                "display": bool(n.get("displayName")),
                "domains": n.get("domains") or [],
            }
            for n in (rec.get("names") or [])
            if (n.get("name") or "").strip()
        ]

        parent_unii = ""
        parent_name = ""
        active_moiety_unii = ""
        active_moiety_name = ""
        form_links = []
        other_rels = []
        for r in rec.get("relationships") or []:
            rtype = (r.get("type") or "").strip()
            related = r.get("relatedSubstance") or {}
            r_unii = (related.get("approvalID") or related.get("linkingID") or "").strip().upper()
            r_name = (related.get("refPname") or "").strip()
            if rtype == REL_PARENT_OF_THIS and r_unii and not parent_unii:
                parent_unii, parent_name = r_unii, r_name
            if rtype == REL_ACTIVE_MOIETY and r_unii and not active_moiety_unii:
                active_moiety_unii, active_moiety_name = r_unii, r_name
            if rtype in FORM_RELATION_TYPES and r_unii:
                form_links.append({"type": rtype, "unii": r_unii, "name": r_name})
            elif rtype and rtype != REL_ACTIVE_MOIETY and r_unii:
                other_rels.append({"type": rtype, "unii": r_unii, "name": r_name})

        codes = [
            {
                "system": (c.get("codeSystem") or "").strip(),
                "code": (c.get("code") or "").strip(),
                "type": c.get("type") or "",
            }
            for c in (rec.get("codes") or [])
            if (c.get("code") or "").strip()
        ]

        spine_rows.append(
            {
                "unii": unii,
                "preferred_name": pname,
                "substance_class": substance_class,
                "inchikey": ik,
                "inchikey_source": ik_source,
                "parent_unii": parent_unii,
                "active_moiety_unii": active_moiety_unii,
                "synonyms": json.dumps(synonyms, ensure_ascii=False),
                "gsrs_uuid": rec.get("uuid") or "",
                "record_status": rec.get("status") or "",
                "definition_type": rec.get("definitionType") or "",
                "definition_level": rec.get("definitionLevel") or "",
                "smiles": smiles,
                "formula": (struct.get("formula") or ""),
                "codes": json.dumps(codes, ensure_ascii=False),
                "source_url": source_url,
                "source_date": args.date,
                "licence": LICENCE,
            }
        )

        if unii and unii not in flat["known"]:
            new_uniis += 1

        # A mixture maps to each component page as well as to its own page:
        # the component UNII is an exact match on rule (a).
        if substance_class == "mixture":
            for comp in ((rec.get("mixture") or {}).get("components") or []):
                sub = comp.get("substance") or {}
                c_unii = (sub.get("approvalID") or sub.get("linkingID") or "").strip().upper()
                if not c_unii:
                    continue
                for c_key in corpus["by_unii"].get(c_unii, []):
                    c_tier = corpus["tier_of"].get(c_key, 3)
                    matched_pages_by_tier[c_tier].add(c_key)
                    pages_by_rule_tier["unii"][c_tier].add(c_key)
                    mapped_rows.append(
                        {
                            "key": c_key,
                            "tier": c_tier,
                            "field": "gsrs_mixture_membership",
                            "value": json.dumps(
                                {
                                    "mixture_unii": unii,
                                    "mixture_name": pname,
                                    "component_unii": c_unii,
                                    "component_name": (sub.get("refPname") or "").strip(),
                                    "component_type": comp.get("type") or "",
                                },
                                ensure_ascii=False,
                            ),
                            "source_record_id": unii or (rec.get("uuid") or ""),
                            "source_url": source_url,
                            "source_date": args.date,
                            "match_rule": "unii",
                            "form_of_target": "",
                            "licence": LICENCE,
                        }
                    )
                    fields_by_tier[c_tier]["gsrs_mixture_membership"] += 1
                    mixture_component_rows += 1

        if (smiles or ik) and unii and unii not in flat["have_structure"]:
            struct_beyond_flat += 1
        if substance_class and unii and unii not in flat["have_class"]:
            class_beyond_flat += 1

        # ---- mapping, in priority order -------------------------------------
        rule = None
        pages: list[str] = []
        if unii and unii in corpus["by_unii"]:
            rule, pages = "unii", corpus["by_unii"][unii]
        elif ik and ik in corpus["by_inchikey"]:
            rule, pages = "inchikey", corpus["by_inchikey"][ik]
        elif ik and ik[:14] in corpus["by_skeleton"]:
            rule, pages = "skeleton", corpus["by_skeleton"][ik[:14]]
        else:
            # Rule (d) asserts a candidate identity, so it fires only where the
            # name points at exactly one page and the record's names do not point
            # at several different pages. An ambiguous name is not a candidate
            # identity and is not written; ambiguity is counted instead.
            cand_pages: set[str] = set()
            seen_norm = set()
            ambiguous = False
            for nm in [pname] + [s["name"] for s in synonyms]:
                norm = normalise_name(nm, salt_tokens)
                if len(norm) < 5 or norm in seen_norm:
                    continue
                seen_norm.add(norm)
                hits = corpus["by_name"].get(norm, [])
                if not hits:
                    continue
                if len(hits) > 1:
                    ambiguous = True
                    continue
                cand_pages.update(hits)
            if len(cand_pages) == 1:
                rule, pages = "name-candidate", sorted(cand_pages)
            elif cand_pages or ambiguous:
                name_ambiguous += 1

        if not rule:
            unmatched += 1
            continue
        rule_counts[rule] += 1

        for key in pages:
            tier = corpus["tier_of"].get(key, 3)
            matched_pages_by_tier[tier].add(key)
            pages_by_rule_tier[rule][tier].add(key)

            def emit(field: str, value, form_target: str = "") -> None:
                mapped_rows.append(
                    {
                        "key": key,
                        "tier": tier,
                        "field": field,
                        "value": json.dumps(value, ensure_ascii=False),
                        "source_record_id": unii or (rec.get("uuid") or ""),
                        "source_url": source_url,
                        "source_date": args.date,
                        "match_rule": rule,
                        "form_of_target": form_target,
                        "licence": LICENCE,
                    }
                )
                fields_by_tier[tier][field] += 1

            if rule == "skeleton":
                # A different form of the same skeleton. Linked, never merged,
                # and no identity field of this substance is copied onto the page.
                emit(
                    "gsrs_form_of",
                    {
                        "unii": unii,
                        "preferred_name": pname,
                        "substance_class": substance_class,
                        "inchikey": ik,
                        "inchikey_source": ik_source,
                        "skeleton": ik[:14],
                        "parent_unii": parent_unii,
                        "active_moiety_unii": active_moiety_unii,
                        "evidence": "InChIKey skeleton match, full keys differ",
                    },
                    form_target=unii,
                )
                continue

            if rule == "name-candidate":
                payload = {
                    "unii": unii,
                    "preferred_name": pname,
                    "substance_class": substance_class,
                    "inchikey": ik,
                    "confirmation": "none; UNII and full InChIKey both failed to match this page",
                    "disposition": "Phase 3 review list",
                }
                emit("gsrs_name_candidate", payload)
                name_candidates.append(
                    {
                        "key": key,
                        "tier": tier,
                        "page_unii": corpus["page_unii"].get(key, ""),
                        "page_inchikey": corpus["page_inchikey"].get(key, ""),
                        "gsrs_unii": unii,
                        "gsrs_preferred_name": pname,
                        "gsrs_inchikey": ik,
                        "gsrs_substance_class": substance_class,
                        "source_url": source_url,
                        "source_date": args.date,
                    }
                )
                continue

            # rule is "unii" or "inchikey": the substance is this page.
            if substance_class:
                emit("gsrs_substance_class", substance_class)
            if pname:
                emit("gsrs_preferred_name", pname)
            if synonyms:
                emit("gsrs_synonyms", synonyms)
            if parent_unii:
                emit(
                    "gsrs_parent_substance",
                    {"unii": parent_unii, "name": parent_name, "relation": REL_PARENT_OF_THIS},
                )
            if active_moiety_unii:
                emit(
                    "gsrs_active_moiety",
                    {"unii": active_moiety_unii, "name": active_moiety_name},
                )
            if form_links:
                emit("gsrs_form_relationships", form_links)
            if other_rels:
                emit("gsrs_relationships", other_rels)
            if rec.get("status") or rec.get("definitionLevel"):
                emit(
                    "gsrs_record_status",
                    {
                        "status": rec.get("status") or "",
                        "definition_type": rec.get("definitionType") or "",
                        "definition_level": rec.get("definitionLevel") or "",
                        "gsrs_uuid": rec.get("uuid") or "",
                    },
                )
            # Structure only where the FDA UNII flat files hold none for this UNII.
            if (smiles or ik) and unii and unii not in flat["have_structure"]:
                emit(
                    "gsrs_structure",
                    {"smiles": smiles, "inchikey": ik, "inchikey_source": ik_source,
                     "formula": struct.get("formula") or ""},
                )



    log(f"parsed {records_seen} records")

    spine = pd.DataFrame(spine_rows)
    pq.write_table(pa.Table.from_pandas(spine, preserve_index=False),
                   out_dir / "spine.parquet", compression="zstd")

    mapped = pd.DataFrame(
        mapped_rows,
        columns=["key", "tier", "field", "value", "source_record_id", "source_url",
                 "source_date", "match_rule", "form_of_target", "licence"],
    )
    pq.write_table(pa.Table.from_pandas(mapped, preserve_index=False),
                   out_dir / "mapped.parquet", compression="zstd")

    review_path = ROOT / "data/revamp/gsrs-name-candidates.csv"
    review_path.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(
        name_candidates,
        columns=["key", "tier", "page_unii", "page_inchikey", "gsrs_unii",
                 "gsrs_preferred_name", "gsrs_inchikey", "gsrs_substance_class",
                 "source_url", "source_date"],
    ).to_csv(review_path, index=False)

    coverage = {
        "source": SOURCE,
        "source_url": source_url,
        "source_date": args.date,
        "licence": LICENCE,
        "dump_records_parsed": records_seen,
        "corpus_pages": corpus["pages"],
        "pages_matched_by_tier": {
            str(t): len(matched_pages_by_tier.get(t, ()))
            for t in (1, 2, 3)
        },
        "pages_matched_total": len(set().union(*matched_pages_by_tier.values()))
        if matched_pages_by_tier else 0,
        "fields_gained_by_tier": {
            str(t): dict(sorted(fields_by_tier.get(t, Counter()).items()))
            for t in (1, 2, 3)
        },
        "mapped_rows": len(mapped_rows),
        "records_by_match_rule": dict(rule_counts),
        "pages_by_match_rule_and_tier": {
            r: {str(t): len(pages_by_rule_tier[r].get(t, ())) for t in (1, 2, 3)}
            for r in sorted(pages_by_rule_tier)
        },
        "unmatched_records": unmatched,
        "records_dropped_for_ambiguous_name": name_ambiguous,
        "mixture_component_rows": mixture_component_rows,
        "name_candidates_sent_to_review": len(name_candidates),
        "name_candidate_pages": len({c["key"] for c in name_candidates}),
        "name_candidate_review_list": str(review_path.relative_to(ROOT)),
        "substance_class_counts": dict(class_counts.most_common()),
        "inchikeys_computed_with_rdkit": computed_inchikeys,
        "gsrs_uniis_absent_from_fda_unii_flatfile": new_uniis,
        "records_with_structure_beyond_flatfile": struct_beyond_flat,
        "records_with_substance_class_beyond_flatfile": class_beyond_flat,
        "spine_rows": len(spine_rows),
    }
    (out_dir / "coverage.json").write_text(
        json.dumps(coverage, indent=2, ensure_ascii=False) + "\n", encoding="utf8"
    )

    log(json.dumps({k: coverage[k] for k in (
        "dump_records_parsed", "pages_matched_by_tier", "mapped_rows",
        "records_by_match_rule", "unmatched_records",
        "name_candidates_sent_to_review")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
