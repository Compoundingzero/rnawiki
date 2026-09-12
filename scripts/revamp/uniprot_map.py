#!/usr/bin/env python3
"""Map the UniProt pull onto rnawiki corpus pages.

Two fields are produced.

targetProtein   One row per (page, target accession). The page-to-target link comes from the
                already-mapped target tables on disk (DrugCentral, IUPHAR) and from ChEMBL
                drug_mechanism / Open Targets mechanism_of_action joined through the ChEMBL
                molecule. match_rule is the rule by which that upstream record was tied to the
                page: DrugCentral and IUPHAR rows carry their own recorded rule; ChEMBL and
                Open Targets rows are graded here against the ChEMBL molecule's own InChIKey
                (full key -> inchikey, first 14 -> skeleton, otherwise name-candidate, since a
                ChEMBL molecule record carries no UNII).

biologicSequence  One row per (biologic page, accession). UniProt carries no UNII and a protein
                has no InChIKey, so neither rule (a) nor rule (b) can confirm any of these; every
                row is match_rule name-candidate and every one is written to the Phase 3 review
                list. Two name routes are used: the drug and trade names inside a UniProt
                PHARMACEUTICAL comment, and exact normalised matches against the recommended,
                alternative and cleaved-chain protein names of reviewed human entries.

Writes data/sources/uniprot/mapped.parquet, coverage.json, name-candidates-for-review.json,
unmatched-records.json.
"""
import json, os, re, sys
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATE = "2026-09-05"
RAW = os.path.join(ROOT, "data/sources/uniprot", DATE, "raw")
OUTDIR = os.path.join(ROOT, "data/sources/uniprot")
DERIVED = os.path.join(ROOT, "data/revamp/uniprot")
LICENCE = "CC BY 4.0"
SRC_DATE = "2026-09-02"          # UniProt release 2026_03 date, from x-uniprot-release-date
RELEASE = "2026_03"
p = lambda *a: os.path.join(ROOT, *a)

RULE_RANK = {"unii": 0, "inchikey": 1, "skeleton": 2, "name-candidate": 3}

# ---------- name normalisation (rule d) ----------
SALTS = [l.strip().lower() for l in open(p("scripts/revamp/salts.txt"))
         if l.strip() and not l.startswith("#")]
SALTS.sort(key=lambda s: -len(s.split()))
STEREO = re.compile(r"^(\(\s*[+\-±]?\s*\)|\(?[rsdlrs]{1,2}\)|[dl]|\(?[+\-±]\)?|"
                    r"[0-9,]*[a-z]?-?(?:alpha|beta|gamma|delta|epsilon|omega)-)[\s\-]+", re.I)


def norm(name):
    if not name:
        return ""
    s = str(name).lower().strip()
    s = re.sub(r"\s*\[[^\]]*\]\s*", " ", s)
    prev = None
    while prev != s:
        prev = s
        s = STEREO.sub("", s)
    s = re.sub(r"[^a-z0-9]+", " ", s).strip()
    changed = True
    while changed:
        changed = False
        for salt in SALTS:
            if s.endswith(" " + salt):
                s = s[: -(len(salt) + 1)].strip()
                changed = True
    return re.sub(r"\s+", " ", s).strip()


# ---------- read the UniProt pull ----------
def read_tsv(name):
    path = os.path.join(RAW, name)
    return pd.read_csv(path, sep="\t", dtype=str, keep_default_na=False, quoting=3)


targets = read_tsv("target-records.tsv")
pharm = read_tsv("pharmaceutical.tsv")
human = read_tsv("human-reviewed.tsv")
print(f"target-records={len(targets)} pharmaceutical={len(pharm)} human-reviewed={len(human)}",
      file=sys.stderr)

ct2acc = json.load(open(os.path.join(DERIVED, "chembl-target-to-accession.json")))
isoform_base = json.load(open(os.path.join(DERIVED, "identifier-normalisation.json"))
                         )["isoform_ids_reduced_to_base"]


def clean(v):
    v = (v or "").strip()
    return v if v and v != "nan" else None


def function_summary(cc):
    """First sentence-run of the FUNCTION comment, with the FUNCTION: tag and evidence removed."""
    t = clean(cc)
    if not t:
        return None
    t = re.sub(r"^FUNCTION:\s*", "", t)
    t = re.sub(r"\s*\((?:By similarity|Probable|Potential)\)", "", t)
    t = re.sub(r"\s*\((?:PubMed|Ref\.)[^)]*\)", "", t)
    t = re.sub(r"\s*\{ECO:[^}]*\}", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t or None


target_rec = {}
tcols = {c: i for i, c in enumerate(targets.columns)}
for row in targets.itertuples(index=False, name=None):
    acc = row[tcols["Entry"]]
    target_rec[acc] = {
        "accession": acc,
        "entryName": clean(row[tcols["Entry Name"]]),
        "reviewed": clean(row[tcols["Reviewed"]]),
        "proteinName": clean(row[tcols["Protein names"]]),
        "geneSymbol": clean(row[tcols["Gene Names (primary)"]]),
        "geneNames": clean(row[tcols["Gene Names"]]),
        "organism": clean(row[tcols["Organism"]]),
        "organismId": clean(row[tcols["Organism (ID)"]]),
        "functionSummary": function_summary(row[tcols["Function [CC]"]]),
        "subcellularLocation": clean(row[tcols["Subcellular location [CC]"]]),
        "length": clean(row[tcols["Length"]]),
        "mass": clean(row[tcols["Mass"]]),
        "chemblTargetIds": [x for x in (clean(row[tcols["ChEMBL"]]) or "").split(";") if x],
        "drugCentralIds": [x for x in (clean(row[tcols["DrugCentral"]]) or "").split(";") if x],
        "proteinFamilies": clean(row[tcols["Protein families"]]),
        "uniprotRelease": RELEASE,
    }
print(f"target records indexed={len(target_rec)}", file=sys.stderr)

# ---------- targetProtein rows ----------
links = pd.read_parquet(os.path.join(DERIVED, "page-target-links.parquet"))
best = {}
unresolved_chembl_targets = set()
missing_records = set()
for r in links.itertuples():
    if r.target_ref_kind == "accession":
        accs = [isoform_base.get(r.target_ref, r.target_ref)]
    else:
        accs = ct2acc.get(r.target_ref, [])
        if not accs:
            unresolved_chembl_targets.add(r.target_ref)
    for acc in accs:
        rec = target_rec.get(acc)
        if rec is None:
            missing_records.add(acc)
            continue
        k = (r.key, acc)
        cur = best.get(k)
        cand = dict(key=r.key, tier=int(r.tier), acc=acc, match_rule=r.match_rule,
                    form_of_target=r.form_of_target,
                    link_sources={r.link_source}, link_records={r.source_record_id})
        if cur is None:
            best[k] = cand
        else:
            cur["link_sources"].add(r.link_source)
            cur["link_records"].add(r.source_record_id)
            if RULE_RANK[r.match_rule] < RULE_RANK[cur["match_rule"]]:
                cur["match_rule"] = r.match_rule
                cur["form_of_target"] = r.form_of_target

rows = []
for (key, acc), b in best.items():
    v = dict(target_rec[acc])
    v["linkSources"] = sorted(b["link_sources"])
    v["linkRecordIds"] = sorted(x for x in b["link_records"] if x)
    rows.append(dict(
        key=key, tier=b["tier"], field="targetProtein", value=json.dumps(v, sort_keys=True),
        source_record_id=f"uniprotkb:{acc}",
        source_url=f"https://www.uniprot.org/uniprotkb/{acc}/entry",
        source_date=SRC_DATE, match_rule=b["match_rule"],
        form_of_target=b["form_of_target"], licence=LICENCE))
print(f"targetProtein rows={len(rows)} unresolved chembl targets={len(unresolved_chembl_targets)} "
      f"accessions with no fetched record={len(missing_records)}", file=sys.stderr)

# ---------- biologic pages ----------
bio_pages = {}
for line in open(p("data/corpus-20k/identity/canonical.ndjson")):
    rec = json.loads(line)
    if not rec.get("isBiologic"):
        continue
    common, brand = set(), set()
    for s in (rec.get("synonyms") or []):
        n = norm(s.get("name"))
        if len(n) < 5:
            continue
        (brand if s.get("kind") == "brand" else common).add(n)
    own = norm(rec.get("displayName"))
    bio_pages[rec["key"]] = {"displayName": rec.get("displayName"),
                             "own": {own} if len(own) >= 5 else set(),
                             "common": common, "brand": brand, "unii": rec.get("unii")}

tier_of = {}
for line in open(p("data/corpus-20k/tiers/model-assignment.ndjson")):
    r = json.loads(line)
    tier_of[r["key"]] = 1 if (r["model"] == "LONGEVITY" or r.get("withdrawn")) else (
        2 if r["model"] == "CLINICAL" else 3)

# by_drug_name is used for the PHARMACEUTICAL route, where UniProt itself supplies a drug or
# trade name, so a page's brand and common synonyms are legitimate match targets. by_own_name is
# used for the protein-name route: a corpus page commonly carries its TARGET's name as a synonym
# (the tocilizumab page lists IL-6RA), so matching a protein name against anything other than the
# page's own display name attaches the target's sequence to the drug. Only the display name is
# allowed there.
by_drug_name, by_own_name = {}, {}
for k, v in bio_pages.items():
    for n in v["own"] | v["common"] | v["brand"]:
        by_drug_name.setdefault(n, []).append(k)
    for n in v["own"]:
        by_own_name.setdefault(n, []).append(k)
print(f"biologic pages={len(bio_pages)} drug-name keys={len(by_drug_name)} "
      f"own-name keys={len(by_own_name)}", file=sys.stderr)


def protein_name_variants(field):
    """Recommended, parenthesised alternative and cleaved-chain names from 'Protein names'."""
    t = clean(field)
    if not t:
        return []
    out = []
    cleaved = re.search(r"\[Cleaved into:\s*(.*?)\]\s*$", t)
    if cleaved:
        for part in cleaved.group(1).split(";"):
            out.append(re.sub(r"\s*\([^)]*\)", "", part).strip())
        t = t[: cleaved.start()].strip()
    t = re.sub(r"\s*\[Includes:.*$", "", t)
    head = re.split(r"\s*\(", t, maxsplit=1)
    out.append(head[0].strip())
    out.extend(re.findall(r"\(([^()]+)\)", t))
    return [x for x in out if x]


TRADE_SPLIT = re.compile(r"\s+(?:and|or)\s+|,\s*")


def pharmaceutical_names(comment):
    """Drug and trade names named in a PHARMACEUTICAL comment.

    UniProt writes these as 'PHARMACEUTICAL: Available under the name(s) X (Company) and Y
    (Company). ...'. Only the segment before the first sentence stop is read, and the
    parenthesised company is dropped.
    """
    t = clean(comment)
    if not t:
        return []
    t = re.sub(r"^PHARMACEUTICAL:\s*", "", t)
    m = re.search(r"[Aa]vailable (?:under|as) (?:the )?(?:names?|trade names?)?\s*(.*?)(?:\.\s|\.$)", t)
    seg = m.group(1) if m else t.split(".")[0]
    seg = re.sub(r"\s*\([^)]*\)", " ", seg)
    return [x.strip() for x in TRADE_SPLIT.split(seg) if x.strip()]


bio_rows = []
bio_seen = set()
review = []


def add_bio(key, acc, rec, route, matched_name):
    if (key, acc) in bio_seen:
        return
    bio_seen.add((key, acc))
    v = dict(rec)
    v["matchedOn"] = route
    v["matchedName"] = matched_name
    bio_rows.append(dict(
        key=key, tier=tier_of.get(key), field="biologicSequence",
        value=json.dumps(v, sort_keys=True), source_record_id=f"uniprotkb:{acc}",
        source_url=f"https://www.uniprot.org/uniprotkb/{acc}/entry", source_date=SRC_DATE,
        match_rule="name-candidate", form_of_target=None, licence=LICENCE))
    review.append({"key": key, "displayName": bio_pages[key]["displayName"],
                   "pageUnii": bio_pages[key]["unii"], "tier": tier_of.get(key),
                   "field": "biologicSequence", "accession": acc,
                   "uniprotProteinName": rec["proteinName"], "route": route,
                   "matchedName": matched_name,
                   "confirmation": "UniProt supplies no UNII and a protein has no InChIKey, so "
                                   "rule (a) and rule (b) cannot confirm this match"})


def seq_record(row, cols):
    return {
        "accession": row[cols["Entry"]],
        "entryName": clean(row[cols["Entry Name"]]),
        "reviewed": clean(row[cols["Reviewed"]]),
        "proteinName": clean(row[cols["Protein names"]]),
        "geneSymbol": clean(row[cols["Gene Names (primary)"]]),
        "organism": clean(row[cols["Organism"]]),
        "organismId": clean(row[cols["Organism (ID)"]]),
        "functionSummary": function_summary(row[cols["Function [CC]"]]),
        "pharmaceuticalUse": clean(row[cols["Pharmaceutical use"]]),
        "sequence": clean(row[cols["Sequence"]]),
        "length": clean(row[cols["Length"]]),
        "mass": clean(row[cols["Mass"]]),
        "chains": clean(row[cols["Chain"]]),
        "uniprotRelease": RELEASE,
    }


# route 1: PHARMACEUTICAL comment drug and trade names
cols = {c: i for i, c in enumerate(pharm.columns)}
used_acc = set()
for row in pharm.itertuples(index=False, name=None):
    rec = seq_record(row, cols)
    for nm in pharmaceutical_names(row[cols["Pharmaceutical use"]]):
        n = norm(nm)
        if len(n) < 5:
            continue
        for key in by_drug_name.get(n, []):
            add_bio(key, rec["accession"], rec, "pharmaceutical-comment-name", nm)
            used_acc.add(rec["accession"])

# route 2: exact normalised protein-name match on reviewed human entries
hcols = {c: i for i, c in enumerate(human.columns)}
for row in human.itertuples(index=False, name=None):
    variants = protein_name_variants(row[hcols["Protein names"]])
    hits = []
    for nm in variants:
        if nm.startswith("EC "):
            continue
        n = norm(nm)
        if len(n) < 5:
            continue
        for key in by_own_name.get(n, []):
            hits.append((key, nm))
    if not hits:
        continue
    rec = seq_record(row, hcols)
    for key, nm in hits:
        add_bio(key, rec["accession"], rec, "protein-name-exact", nm)
        used_acc.add(rec["accession"])

print(f"biologicSequence rows={len(bio_rows)} pages={len({r['key'] for r in bio_rows})}",
      file=sys.stderr)

# ---------- write ----------
mapped = pd.DataFrame(rows + bio_rows, columns=[
    "key", "tier", "field", "value", "source_record_id", "source_url", "source_date",
    "match_rule", "form_of_target", "licence"])
mapped["tier"] = mapped["tier"].astype("int64")
mapped.to_parquet(os.path.join(OUTDIR, "mapped.parquet"), index=False)

json.dump(review, open(os.path.join(OUTDIR, "name-candidates-for-review.json"), "w"), indent=1)

retrieved_acc = set(targets["Entry"]) | set(pharm["Entry"]) | set(human["Entry"])
matched_acc = {r["source_record_id"].split(":", 1)[1] for r in rows + bio_rows}
unmatched = sorted(retrieved_acc - matched_acc)
json.dump({
    "retrieved_accessions": len(retrieved_acc),
    "accessions_joined_to_at_least_one_page": len(matched_acc),
    "unmatched_records": len(unmatched),
    "unmatched_breakdown": {
        "reviewed_human_entries_no_corpus_page_names_them":
            len(set(human["Entry"]) - matched_acc),
        "target_records_no_corpus_page_links_to_them":
            len(set(targets["Entry"]) - matched_acc),
        "pharmaceutical_entries_no_corpus_page_names_them":
            len(set(pharm["Entry"]) - matched_acc),
    },
    "corpus_chembl_target_ids_unresolved_in_uniprot": sorted(unresolved_chembl_targets),
    "accessions_with_no_uniprot_record_returned": sorted(missing_records),
    "sample_unmatched": unmatched[:50],
}, open(os.path.join(OUTDIR, "unmatched-records.json"), "w"), indent=1)


def per_tier(df):
    return {str(t): int(n) for t, n in df.groupby("tier")["key"].nunique().items()}


cov = {
    "source": "UniProt (UniProtKB)",
    "uniprot_release": RELEASE,
    "release_date": SRC_DATE,
    "retrieved": DATE,
    "licence": LICENCE,
    "licence_url": "https://www.uniprot.org/help/license",
    "endpoint": "https://rest.uniprot.org",
    "robots_disallowed_paths_avoided": ["/idmapping/", "/uniprotkb/stream/", "/docs/"],
    "corpus_pages": len(tier_of),
    "pages_matched_total": int(mapped["key"].nunique()),
    "pages_matched_by_tier": per_tier(mapped),
    "fields_gained": ["targetProtein", "biologicSequence"],
    "fields_gained_by_tier": {
        f: {"pages": per_tier(g), "rows": {str(t): int(n) for t, n in g.groupby("tier").size().items()}}
        for f, g in mapped.groupby("field")
    },
    "rows_by_match_rule": {k: int(v) for k, v in mapped["match_rule"].value_counts().items()},
    "match_rule_meaning": {
        "targetProtein": "the rule by which the upstream target-asserting record (DrugCentral, "
                         "IUPHAR, ChEMBL drug_mechanism, Open Targets mechanism_of_action) was "
                         "tied to the page; UniProt itself carries no UNII or InChIKey",
        "biologicSequence": "name-candidate for every row; UniProt carries no UNII and a protein "
                            "has no InChIKey, so rules (a) and (b) cannot confirm any of them",
    },
    "target_link_sources": {k: int(v) for k, v in links["link_source"].value_counts().items()},
    "chembl_target_ids_held_by_corpus": int(links.loc[links.target_ref_kind == "chembl_target",
                                                      "target_ref"].nunique()),
    "chembl_target_ids_resolved_to_uniprot":
        int(links.loc[links.target_ref_kind == "chembl_target", "target_ref"].nunique()
            - len(unresolved_chembl_targets)),
    "distinct_target_accessions_attached": int(
        pd.Series([r["source_record_id"] for r in rows]).nunique()),
    "biologic_pages_in_corpus": len(bio_pages),
    "biologic_pages_with_a_sequence_candidate": int(len({r["key"] for r in bio_rows})),
    "unmatched_records": len(unmatched),
    "name_candidates_sent_to_review": len(review),
    "name_candidates_by_field": {
        "biologicSequence": len(review),
        "targetProtein": int((mapped[mapped.field == "targetProtein"].match_rule
                              == "name-candidate").sum()),
    },
}
json.dump(cov, open(os.path.join(OUTDIR, "coverage.json"), "w"), indent=1)
print(json.dumps({k: cov[k] for k in ["pages_matched_total", "pages_matched_by_tier",
                                      "rows_by_match_rule", "unmatched_records",
                                      "name_candidates_sent_to_review",
                                      "biologic_pages_with_a_sequence_candidate"]}, indent=1))
