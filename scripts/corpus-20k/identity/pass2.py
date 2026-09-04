#!/usr/bin/env python
"""Phase 2c — IDENTITY PASS 2. Salt/solvate under-merges, the ethane/dimethyl split, and the
re-application of both across every derived artefact.

Pass 1 keyed every FDA-registered substance on its own UNII (K1), so a page keyed on a salt's UNII
never met the page keyed on the parent's UNII: the two are different keys and the structure key was
never consulted. This pass recomputes the parent structure from each K1 UNII's own SMILES and merges
a salt or solvate form onto the parent page when the parent page exists.

  Merge rule (M-SALT-P2), executed exactly as docs/specs/identity-resolution.md §1 and §3.1 state:
    - the parent structure comes from the executor's own rule (identity/resolve.py structure_facts),
      which removes counter-ions, solvates and hydrates and nothing else, and which keeps the whole
      substance as its own moiety when every fragment is a counter-ion or an inorganic ion;
    - a page merges only when exactly one core moiety survives, every removed fragment is a
      recognised counter-ion or solvate (the executor's catalog, plus the monatomic ions Na, K, Li,
      Ca, Mg, NH4, H and the halides, plus water/nitrate/sulfate/phosphate/carbonate), and another
      page already holds that parent InChIKey;
    - a removed fragment that is any other element blocks the merge and is reported. A metal held in
      a chelate is not a counter-ion: stripping it would turn gadoteridol into its free ligand and
      carboplatin into a different platinum compound. Those pages stay split and are listed.
    - esters, prodrugs, isotopologues and stereoisomers never merge here, because the fragment
      parent removes only disconnected fragments and their covalent structure is unchanged.
    - a page held by CONFLICT-K1-K2 (keyRank HOLD) neither merges nor receives a merge: §2 holds it
      out of merging until a person decides.

  Split rule (S-SPLIT-P2): the legacy slug `dimethyl` (dimethyl fumarate, Tecfidera) was attached in
  pass 1 to UNII L99N5N533T, which is ethane. The slug, its names, its legacy source record and the
  registry, model and suppression rows it dragged onto the ethane page move to the dimethyl fumarate
  page K1:FO2303MNI2. Nothing is invented: every moved row is a row that already existed.

  Stage `detect` also scans for the same pattern elsewhere — an existing slug whose legacy names
  appear nowhere in its page's own UNII_Names rows but name exactly one other page — and lists them.
  Nothing beyond the ethane case is moved automatically; a name collision is a person's call.

Every rewritten file is copied to data/corpus-20k/pass2-pre/<path> before it is touched and is
recorded with scripts/corpus-20k/batch.ts the moment it is written, so a run cut off between two
files leaves the ledger true for every file already written.

No host is contacted. Every source is read from disk.

  .venv-corpus/bin/python scripts/corpus-20k/identity/pass2.py [--stage all|detect|canonical|...]
"""

from __future__ import annotations

import argparse
import csv
import glob
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
PY = os.path.join(ROOT, ".venv-corpus", "bin", "python")
CORPUS = os.path.join(ROOT, "data", "corpus-20k")
WORK = os.path.join(ROOT, "tmp", "corpus-20k-pass2")
PRE = os.path.join(CORPUS, "pass2-pre")

IDENTITY_DIR = os.path.join(CORPUS, "identity")
CANONICAL = os.path.join(IDENTITY_DIR, "canonical.ndjson")
DECISIONS = os.path.join(IDENTITY_DIR, "decisions.ndjson")
MERGE_MAP = os.path.join(IDENTITY_DIR, "merge-map-pass2.json")
COLLISIONS = os.path.join(IDENTITY_DIR, "slug-collisions-pass2.json")
RECON_DIR = os.path.join(CORPUS, "reconciliation")
TIERS = os.path.join(CORPUS, "tiers", "model-assignment.ndjson")
SUPPRESSION = os.path.join(CORPUS, "suppression", "assignments.ndjson")
FIELDS_DIR = os.path.join(CORPUS, "fields")
MODEL_DIRS = {"LONGEVITY": os.path.join(FIELDS_DIR, "longevity"),
              "CLINICAL": os.path.join(FIELDS_DIR, "clinical"),
              "DEVELOPMENT": os.path.join(FIELDS_DIR, "development")}
MATCH_DIR = os.path.join(CORPUS, "registry", "matches")
AGG_DIR = os.path.join(CORPUS, "registry", "aggregates")
UNII_RECORDS = os.path.join(CORPUS, "raw", "fda-unii", "UNII_Records_4Aug2026.txt")
UNII_NAMES = os.path.join(CORPUS, "raw", "fda-unii", "UNII_Names_4Aug2026.txt")
CT_DIR = os.path.join(INGEST, "clinicaltrials", "20260901T090005")

PHASE = "2c"
TODAY = date.today().isoformat()
NOW = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
DATE_CT = "2026-09-01"
DATE_UNII = "2026-08-04"
CT_NOTE = "ClinicalTrials.gov API v2 studies snapshot 2026-09-01T09:00:05"
BATCH_SIZE = 250
LIST_CAP = 500
TWO_YEARS_MS = 2 * 365.25 * 24 * 3600 * 1000
ACTIVE_STATUSES = {"RECRUITING", "NOT_YET_RECRUITING", "ENROLLING_BY_INVITATION",
                   "ACTIVE_NOT_RECRUITING", "AVAILABLE"}

ETHANE_KEY = "K1:L99N5N533T"
DMF_KEY = "K1:FO2303MNI2"
DMF_SLUG = "dimethyl"
# The names the legacy `dimethyl` record carried. They name dimethyl fumarate, not ethane.
DMF_LEGACY_NAMES = {"dimethyl", "dimethyl fumarate", "dimethyl fumarate kit", "tecfidera"}

LONGEVITY_REASON_CODES = {"broad-slice", "nia-itp", "registry-ageing-term", "pathway"}
CLINICAL_REASON_CODES = {"chembl-approval", "drugsfda", "orange-book", "ema", "health-canada",
                         "otc-label", "entity-class"}
MODEL_RANK = {"LONGEVITY": 3, "CLINICAL": 2, "DEVELOPMENT": 1}
NAME_KINDS = {"display", "salt", "inn", "usan", "ban", "code"}
SUPPRESSING_TESTS = {"S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"}

_NON = re.compile(r"[^a-z0-9]+")
_ALPHA = re.compile(r"^[A-Za-z]+$")


# ----------------------------------------------------------------------------- small helpers

def log(msg):
    print(f"[pass2] {msg}", flush=True)


def rel(path):
    return os.path.relpath(path, ROOT)


def norm(s):
    return _NON.sub(" ", (s or "").lower()).strip()


def title_case_as_printed(name):
    """Title-case a UNII display name without touching a token that is not plain letters."""
    out = []
    for token in name.split(" "):
        out.append(token[:1].upper() + token[1:].lower() if _ALPHA.match(token) else token)
    return " ".join(out)


def run(cmd, env=None, cwd=ROOT):
    log("      $ " + " ".join(cmd))
    e = dict(os.environ)
    e.update(env or {})
    proc = subprocess.run(cmd, cwd=cwd, env=e, text=True, capture_output=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout[-4000:] + "\n" + proc.stderr[-4000:] + "\n")
        raise SystemExit(f"command failed: {' '.join(cmd)}")
    return proc.stdout


def read_ndjson(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)


def preserve(path):
    """Copy a file to data/corpus-20k/pass2-pre/ before it is first rewritten."""
    if not os.path.exists(path):
        return
    dest = os.path.join(PRE, os.path.relpath(path, CORPUS))
    if os.path.exists(dest):
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(path, dest)


def write_ndjson(path, rows):
    """Write the new version beside the old, keep the old under pass2-pre/, then swap it in."""
    preserve(path)
    tmp = path + ".pass2"
    with open(tmp, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    os.replace(tmp, path)


def write_json(path, obj):
    preserve(path)
    tmp = path + ".pass2"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    os.replace(tmp, path)


def batch_paths(directory):
    return sorted(glob.glob(os.path.join(directory, "batch-*.ndjson")))


def state_report():
    path = os.path.join(WORK, "report.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    return {"issues": [], "stages": [], "batchNos": {}}


def save_report(rep):
    os.makedirs(WORK, exist_ok=True)
    with open(os.path.join(WORK, "report.json"), "w", encoding="utf-8") as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)


def note_issue(rep, text):
    if text not in rep["issues"]:
        rep["issues"].append(text)


def count_records(path):
    if path.endswith(".ndjson"):
        with open(path, encoding="utf-8") as fh:
            return sum(1 for line in fh if line.strip())
    return 1


def checkpoint(rep, path, step, records=None):
    """Record one rewritten file the moment it is written (idempotent on phase+step+batch)."""
    ledger = rep.setdefault("batchNos", {})
    entry = f"{step}\t{rel(path)}"
    if entry not in ledger:
        used = [v for k, v in ledger.items() if k.startswith(step + "\t")]
        ledger[entry] = (max(used) + 1) if used else 1
    run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--step", step,
         "--batch", str(ledger[entry]), "--file", rel(path),
         "--records", str(count_records(path) if records is None else records)])
    save_report(rep)


def mark_done(step):
    run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--done", step])


def done_stage(rep, name):
    if name not in rep["stages"]:
        rep["stages"].append(name)
    save_report(rep)


# ----------------------------------------------------------------------------- sources on disk

def load_resolve():
    """The executor's own structure rule, imported rather than restated."""
    spec = importlib.util.spec_from_file_location(
        "corpus20k_resolve", os.path.join(ROOT, "scripts", "corpus-20k", "identity", "resolve.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_unii_records():
    smiles, display = {}, {}
    with open(UNII_RECORDS, encoding="utf-8", errors="replace") as fh:
        reader = csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        i_u, i_d, i_s = header.index("UNII"), header.index("DISPLAY_NAME"), header.index("SMILES")
        for row in reader:
            if len(row) <= max(i_u, i_d, i_s):
                continue
            if row[i_s].strip():
                smiles[row[i_u]] = row[i_s].strip()
            if row[i_d].strip():
                display[row[i_u]] = row[i_d].strip()
    return smiles, display


def load_unii_names():
    names = defaultdict(set)
    with open(UNII_NAMES, encoding="utf-8", errors="replace") as fh:
        reader = csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        i_n, i_u, i_d = header.index("NAME"), header.index("UNII"), header.index("DISPLAY_NAME")
        for row in reader:
            if len(row) <= max(i_n, i_u, i_d):
                continue
            names[row[i_u]].add(norm(row[i_n]))
            names[row[i_u]].add(norm(row[i_d]))
    return names


def load_canonical():
    return list(read_ndjson(CANONICAL))


# ----------------------------------------------------------------------------- stage: detect

ALLOWED_MONATOMIC = {"Na", "K", "Li", "Ca", "Mg", "Cl", "Br", "I", "F", "H"}


def make_fragment_test(res):
    from rdkit import Chem

    def frag_ok(smiles):
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return False
        key = Chem.MolToInchiKey(mol) or ""
        if key[:14] in res.COUNTER_ION_IK14:
            return True
        symbols = {a.GetSymbol() for a in mol.GetAtoms()}
        heavy = mol.GetNumHeavyAtoms()
        if heavy == 1 and symbols <= ALLOWED_MONATOMIC:
            return True
        if heavy == 0 and symbols <= {"H"}:            # a bare proton in a written-out salt
            return True
        if heavy == 1 and symbols <= {"N"}:            # ammonia / ammonium
            return True
        if heavy <= 1 and symbols <= {"O"}:            # water / hydroxide
            return True
        if heavy <= 4 and symbols <= {"N", "O"}:       # nitrate, nitrite
            return True
        if heavy <= 5 and symbols <= {"S", "O"}:       # sulfate, sulfite
            return True
        if heavy <= 5 and symbols <= {"P", "O"}:       # phosphate
            return True
        if heavy <= 4 and symbols <= {"C", "O"}:       # carbonate, bicarbonate
            return True
        return False

    return frag_ok


def parent_is_a_moiety(fact):
    """The task's skip: no page merges onto a single atom or an inorganic-only parent. Read from
    the fragment facts the executor already computed, not from re-parsing the canonical SMILES —
    a hypervalent metal cage (antimony in stibogluconate) does not survive a round trip."""
    if fact["coreCount"] >= 1:
        core = fact["components"][0][:14]
        for frag in fact["fragments"]:
            if frag["inchikey"][:14] == core:
                return frag["heavyAtoms"] >= 2 and frag["hasCarbon"]
        return False
    heavy = sum(f["heavyAtoms"] for f in fact["fragments"])
    return heavy >= 2 and any(f["hasCarbon"] for f in fact["fragments"])


def stage_detect(rep):
    log("[1] detect: parent structure for every K1 page, from its own UNII SMILES")
    res = load_resolve()
    frag_ok = make_fragment_test(res)
    smiles_by_unii, display_by_unii = load_unii_records()
    pages = load_canonical()
    by_key = {p["key"]: p for p in pages}

    facts, saltform = {}, {}
    counts = Counter()
    blocked_fragments = Counter()
    for page in pages:
        if page["keyRank"] != "K1":
            continue
        unii = page["key"].split(":", 1)[1]
        smiles = smiles_by_unii.get(unii)
        if not smiles:
            counts["k1-no-smiles"] += 1
            continue
        fact = res.structure_facts(smiles)
        if not fact:
            counts["k1-unparsable"] += 1
            continue
        if not parent_is_a_moiety(fact):
            # single-atom or inorganic-only parent: nothing to merge a page onto
            counts["k1-single-atom-or-inorganic"] += 1
            continue
        facts[page["key"]] = fact
        counts["k1-usable"] += 1
        if not fact["isSalt"] or fact["coreCount"] != 1:
            saltform[page["key"]] = False
            continue
        core14 = fact["components"][0][:14]
        ok = True
        for frag in fact["fragments"]:
            if frag["inchikey"][:14] == core14:
                continue
            if not frag_ok(frag["smiles"]):
                ok = False
                blocked_fragments[frag["smiles"]] += 1
                break
        saltform[page["key"]] = ok
        counts["salt-form" if ok else "salt-form-blocked"] += 1

    # candidate survivors: any page whose own recorded structure is that parent, plus every K1 page
    # whose UNII SMILES already is that parent.
    groups = defaultdict(set)
    for key, fact in facts.items():
        groups[fact["inchikey"]].add(key)
    for page in pages:
        structure = page.get("structure") or {}
        if structure.get("inchikey") in groups:
            groups[structure["inchikey"]].add(page["key"])

    merges, blocked_no_parent, multi = {}, [], []
    for parent, members in groups.items():
        salts = [m for m in members if saltform.get(m)]
        if not salts:
            continue
        survivors = [m for m in members
                     if not saltform.get(m) and not m.startswith("HOLD:")]
        salts = [m for m in salts if not m.startswith("HOLD:")]
        if not survivors:
            blocked_no_parent.extend(salts)
            continue
        if len(survivors) > 1:
            multi.append({"parent": parent,
                          "candidates": [{"key": m, "displayName": by_key[m]["displayName"]}
                                         for m in sorted(survivors)]})
        survivors.sort(key=lambda m: (0 if m.startswith("K1:") else 1,
                                      -len(by_key[m].get("sourceRecords") or []),
                                      0 if by_key[m].get("existingSlug") else 1, m))
        for salt in salts:
            if salt != survivors[0]:
                merges[salt] = survivors[0]

    log(f"      {counts['k1-usable']} K1 pages with a usable parent structure "
        f"({counts['k1-no-smiles']} have no SMILES, "
        f"{counts['k1-single-atom-or-inorganic']} resolve to a single atom or an inorganic-only "
        f"parent, {counts['k1-unparsable']} do not parse)")
    log(f"      {counts['salt-form']} salt or solvate forms; {counts['salt-form-blocked']} blocked "
        f"by a fragment that is not a counter-ion; {len(merges)} merge onto a parent page")

    write_json(MERGE_MAP, dict(sorted(merges.items())))
    checkpoint(rep, MERGE_MAP, "identity-pass2", len(merges))

    # ---- the slug/name collision scan (§2 of the mandate: list, never auto-move)
    collisions = stage_collisions(pages, by_key)
    write_json(COLLISIONS, collisions)
    checkpoint(rep, COLLISIONS, "identity-pass2", len(collisions))

    # ---- decisions (§4 of docs/specs/identity-resolution.md)
    decision_rows = []
    for old, new in sorted(merges.items()):
        fact = facts[old]
        decision_rows.append({
            "at": NOW,
            "sourceRecords": [f"{s['source']}:{s['id']}" for s in by_key[old].get("sourceRecords") or []],
            "decision": "merge",
            "key": new,
            "keyRank": by_key[new]["keyRank"],
            "ruleId": "M-SALT-P2",
            "evidence": {
                "unii": old.split(":", 1)[1],
                "inchikey": fact["inchikey"],
                "mergedFrom": old,
                "mergedFromName": by_key[old]["displayName"],
                "survivorName": by_key[new]["displayName"],
                "removedFragments": [f["smiles"] for f in fact["fragments"]
                                     if f["inchikey"][:14] != fact["components"][0][:14]],
            },
            "note": ("the page's own UNII SMILES is a salt or solvate of the parent structure the "
                     "survivor already holds; §3.1 merges the salt into the parent moiety and keeps "
                     "its names as synonyms of kind salt"),
        })
    decision_rows.append({
        "at": NOW,
        "sourceRecords": ["existing:dimethyl", "chembl:CHEMBL135626", "fda-unii:FO2303MNI2"],
        "decision": "split",
        "key": DMF_KEY,
        "keyRank": "K1",
        "ruleId": "S-SPLIT-P2",
        "evidence": {
            "unii": "L99N5N533T",
            "inchikey": "OTMSDBZUPAUEDD-UHFFFAOYSA-N",
            "collidingSlug": DMF_SLUG,
            "namesMoved": sorted(DMF_LEGACY_NAMES),
        },
        "note": ("the legacy slug `dimethyl` names dimethyl fumarate (Tecfidera); pass 1 attached it "
                 "to UNII L99N5N533T, which is ethane. The slug, its names, its legacy source record "
                 "and the registry, model and suppression rows it carried move to K1:FO2303MNI2; the "
                 "ethane page keeps only names its own UNII attests."),
    })
    preserve(DECISIONS)
    with open(DECISIONS, "a", encoding="utf-8") as fh:
        for row in decision_rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    checkpoint(rep, DECISIONS, "identity-pass2")

    rep["merges"] = merges
    rep["mergesP2"] = len(merges)
    rep["splitsP2"] = 1
    rep["detectCounts"] = dict(counts)
    rep["blockedNoParentPage"] = len(blocked_no_parent)
    rep["blockedFragments"] = blocked_fragments.most_common(25)
    rep["multiSurvivorGroups"] = multi
    rep["slugCollisions"] = collisions
    if counts["salt-form-blocked"]:
        note_issue(rep, (
            f"{counts['salt-form-blocked']} K1 pages whose UNII SMILES separates into a core plus a "
            f"metal or other fragment that is not a recognised counter-ion were NOT merged "
            f"(gadolinium, technetium, lutetium, platinum, iron, bismuth and the like). Removing "
            f"such a fragment would replace a metal complex with its free ligand, which §1 does not "
            f"permit."))
    if blocked_no_parent:
        note_issue(rep, (
            f"{len(blocked_no_parent)} salt or solvate forms have no page holding their parent "
            f"structure, so they stay their own page; §3.1 merges into a parent that exists, and "
            f"this pass never creates one."))
    save_report(rep)
    done_stage(rep, "detect")
    return merges


def stage_collisions(pages, by_key):
    """An existing slug whose legacy names are absent from its page's own UNII_Names rows but name
    exactly one other page. Listed, never moved: which record the slug belongs to is a person's
    call, and this pass moves only the ethane case the mandate names."""
    unii_names = load_unii_names()
    repairs_path = os.path.join(ROOT, "tmp", "corpus-20k-augment", "name-repairs.json")
    repairs = {}
    if os.path.exists(repairs_path):
        with open(repairs_path, encoding="utf-8") as fh:
            repairs = json.load(fh)
    by_display = defaultdict(set)
    for page in pages:
        by_display[norm(page["displayName"])].add(page["key"])
    out = []
    for page in pages:
        if page["keyRank"] != "K1" or not page.get("existingSlug"):
            continue
        known = unii_names.get(page["key"].split(":", 1)[1])
        if not known:
            continue
        legacy = set()
        repair = repairs.get(page["key"])
        if repair:
            legacy.add(repair["old"])
        for synonym in page.get("synonyms") or []:
            if synonym.get("source") == "existing" and synonym.get("kind") in NAME_KINDS:
                legacy.add(synonym.get("name"))
        legacy = {n for n in legacy if n and "/" not in n}
        if not legacy or any(norm(n) in known for n in legacy):
            continue
        hits = defaultdict(set)
        for name in legacy:
            owners = {k for k in by_display.get(norm(name), ()) if k != page["key"]}
            if len(owners) != 1:
                continue                       # a name on many pages is a product mix, not a clash
            other = owners.pop()
            if other.startswith("COMBO:") and page["key"] in other:
                continue                       # a component of its own combination record
            hits[other].add(name)
        if hits:
            out.append({
                "slug": page["existingSlug"],
                "page": page["key"],
                "pageName": page["displayName"],
                "legacyNames": sorted(legacy)[:8],
                "matches": [{"key": k, "displayName": by_key[k]["displayName"],
                             "names": sorted(v)} for k, v in sorted(hits.items())],
            })
    log(f"      {len(out)} existing slugs whose legacy names name another page")
    return out


# ----------------------------------------------------------------------------- stage: canonical

def merge_synonyms(survivor, merged):
    """Union. The merged page's own display name becomes a synonym of kind salt (§3.1); every other
    synonym keeps the kind it was recorded under, so a brand stays a brand and collected free text
    stays `common`."""
    out = list(survivor.get("synonyms") or [])
    seen = {(norm(s.get("name")), s.get("kind")) for s in out}
    names_present = {norm(s.get("name")) for s in out}

    def add(name, kind, source, note=None):
        if not name or norm(name) in names_present or (norm(name), kind) in seen:
            return
        row = {"name": name, "kind": kind, "source": source}
        if note:
            row["note"] = note
        out.append(row)
        seen.add((norm(name), kind))
        names_present.add(norm(name))

    add(merged["displayName"], "salt", "identity-pass2",
        "the name of the salt or solvate form merged into this page (M-SALT-P2)")
    for synonym in merged.get("synonyms") or []:
        kind = synonym.get("kind")
        add(synonym.get("name"), "salt" if kind == "display" else kind,
            synonym.get("source") or "identity-pass2", synonym.get("note"))
    return out


def stage_canonical(rep):
    log("[2] canonical.ndjson: merges, the split, and the survivor unions")
    merges = rep["merges"]
    _, display_by_unii = load_unii_records()
    unii_names = load_unii_names()
    pages = load_canonical()
    by_key = {p["key"]: p for p in pages}

    renamed, adopted_slugs, redirects = [], [], []
    for old, new in sorted(merges.items()):
        merged, survivor = by_key[old], by_key[new]
        survivor["synonyms"] = merge_synonyms(survivor, merged)
        seen = {(s["source"], s["id"]) for s in survivor.get("sourceRecords") or []}
        for record in merged.get("sourceRecords") or []:
            if (record["source"], record["id"]) not in seen:
                survivor.setdefault("sourceRecords", []).append(record)
                seen.add((record["source"], record["id"]))
        relations = {json.dumps(r, sort_keys=True) for r in survivor.get("relations") or []}
        for relation in merged.get("relations") or []:
            token = json.dumps(relation, sort_keys=True)
            if token not in relations:
                survivor.setdefault("relations", []).append(relation)
                relations.add(token)
        for field in ("chemblId", "unii", "cid", "cas", "rxcui", "drugbankId"):
            if not survivor.get(field) and merged.get(field):
                survivor[field] = merged[field]
        if not survivor.get("existingSlug") and merged.get("existingSlug"):
            survivor["existingSlug"] = merged["existingSlug"]
            adopted_slugs.append({"slug": merged["existingSlug"], "from": old, "to": new})
        elif survivor.get("existingSlug") and merged.get("existingSlug"):
            redirects.append({"slug": merged["existingSlug"], "to": survivor["existingSlug"],
                              "from": old, "toKey": new})
        # display name: the parent's own UNII display name
        if survivor["keyRank"] == "K1":
            unii = survivor["key"].split(":", 1)[1]
            known = unii_names.get(unii) or set()
            printed = display_by_unii.get(unii)
            if printed and norm(survivor["displayName"]) not in known:
                renamed.append({"key": new, "from": survivor["displayName"],
                                "to": title_case_as_printed(printed)})
                survivor["displayName"] = title_case_as_printed(printed)

    # ---- the ethane / dimethyl fumarate split
    ethane, dmf = by_key.get(ETHANE_KEY), by_key.get(DMF_KEY)
    if ethane is None or dmf is None:
        raise SystemExit("the ethane or dimethyl fumarate page is missing from canonical.ndjson")
    moved_synonyms = [s for s in ethane.get("synonyms") or []
                      if norm(s.get("name")) in DMF_LEGACY_NAMES]
    ethane["synonyms"] = [s for s in ethane.get("synonyms") or []
                          if norm(s.get("name")) not in DMF_LEGACY_NAMES]
    if not any(norm(s.get("name")) == norm(ethane["displayName"]) for s in ethane["synonyms"]):
        ethane["synonyms"].insert(0, {"name": ethane["displayName"], "kind": "display",
                                      "source": "fda-unii", "sourceDate": DATE_UNII})
    moved_records = [r for r in ethane.get("sourceRecords") or [] if r["source"] == "existing"]
    ethane["sourceRecords"] = [r for r in ethane.get("sourceRecords") or []
                               if r["source"] != "existing"]
    ethane["existingSlug"] = None
    dmf_seen = {(norm(s.get("name")), s.get("kind")) for s in dmf.get("synonyms") or []}
    for synonym in moved_synonyms:
        if synonym.get("kind") in ("display", "fragment"):
            continue                                  # the ethane page's own display artefacts
        if (norm(synonym.get("name")), synonym.get("kind")) in dmf_seen:
            continue
        dmf.setdefault("synonyms", []).append(
            {**synonym, "note": "moved from the legacy `dimethyl` record (S-SPLIT-P2)"})
        dmf_seen.add((norm(synonym.get("name")), synonym.get("kind")))
    record_seen = {(r["source"], r["id"]) for r in dmf.get("sourceRecords") or []}
    for record in moved_records:
        if (record["source"], record["id"]) not in record_seen:
            dmf.setdefault("sourceRecords", []).append(record)
    dmf["existingSlug"] = DMF_SLUG

    survivors = set(merges.values())
    rows = [p for p in pages if p["key"] not in merges]
    write_ndjson(CANONICAL, rows)
    checkpoint(rep, CANONICAL, "identity-pass2", len(rows))

    rep["pagesAfter"] = len(rows)
    rep["renamedSurvivors"] = renamed
    rep["adoptedSlugs"] = adopted_slugs
    rep["newRedirects"] = redirects
    rep["splitMovedSynonyms"] = [s["name"] for s in moved_synonyms]
    rep["splitMovedSourceRecords"] = moved_records
    log(f"      {len(rows)} pages after {len(merges)} merges "
        f"({len(survivors)} survivors, {len(renamed)} renamed from the UNII display name)")
    save_report(rep)
    done_stage(rep, "canonical")


# ----------------------------------------------------------------------------- stage: reconcile

def stage_reconciliation(rep):
    log("[3] reconciliation: dispositions, matched, new, not-found")
    merges = rep["merges"]
    redirect_slugs = {r["slug"]: r for r in rep["newRedirects"]}
    canonical = {p["key"]: p for p in load_canonical()}

    # ---- dispositions.ndjson
    path = os.path.join(RECON_DIR, "dispositions.ndjson")
    rows = list(read_ndjson(path))
    redirected = 0
    repointed = 0
    for row in rows:
        if row.get("slug") == DMF_SLUG and row.get("key") == ETHANE_KEY:
            row["key"] = DMF_KEY
            row["reason"] = ("the legacy `dimethyl` record names dimethyl fumarate; the slug moves "
                             "to K1:FO2303MNI2 (S-SPLIT-P2) and keeps its URL")
            repointed += 1
            continue
        target = merges.get(row.get("key"))
        if not target:
            continue
        survivor_slug = (canonical.get(target) or {}).get("existingSlug")
        if row.get("slug") in redirect_slugs and survivor_slug:
            row["disposition"] = "REDIRECT"
            row["targetSlug"] = survivor_slug
            row["key"] = target
            row["reason"] = (f"merged into the parent moiety {target} by M-SALT-P2; the slug "
                             f"redirects to {survivor_slug}")
            redirected += 1
        else:
            row["key"] = target
            row["reason"] = (row.get("reason") or "") + \
                f" | re-pointed to {target} by M-SALT-P2 (identity pass 2)"
            repointed += 1
    write_ndjson(path, rows)
    checkpoint(rep, path, "reconciliation-pass2", len(rows))

    # ---- matched / new / not-found: keyed on the canonical key.
    # A page belongs to exactly one of the three. When a merged page's row and its survivor's row
    # sit in different files, the merged row is dropped: the survivor's own row already stands, and
    # a merged page here never carried an existing slug of its own.
    home = {}
    for name in ("matched", "new", "not-found"):
        for row in read_ndjson(os.path.join(RECON_DIR, f"{name}.ndjson")):
            key = merges.get(row.get("key"), row.get("key"))
            if row.get("key") not in merges:
                home[key] = name
    for name in ("matched", "new", "not-found"):
        path = os.path.join(RECON_DIR, f"{name}.ndjson")
        rows = list(read_ndjson(path))
        by_key = {}
        out = []
        for row in rows:
            key = merges.get(row.get("key"), row.get("key"))
            if row.get("key") in merges and home.get(key) not in (None, name):
                continue
            row["key"] = key
            if key in by_key:                       # fold the merged row into the survivor's row
                target = by_key[key]
                for field in ("existingSlugs", "collapsedSlugs", "newSources", "sources"):
                    if field in target or field in row:
                        merged_list = list(dict.fromkeys(
                            (target.get(field) or []) + (row.get(field) or [])))
                        target[field] = merged_list
                target["evidenceSections"] = max(target.get("evidenceSections") or 0,
                                                 row.get("evidenceSections") or 0)
                target["sourceRefs"] = max(target.get("sourceRefs") or 0,
                                           row.get("sourceRefs") or 0)
                continue
            by_key[key] = row
            out.append(row)
        # the split: the dimethyl fumarate page now holds the slug, the ethane page holds none
        if name == "matched":
            ethane_rows = [r for r in out if r["key"] == ETHANE_KEY]
            dmf_row = next((r for r in out if r["key"] == DMF_KEY), None)
            for row in ethane_rows:
                if dmf_row is None:
                    row["key"] = DMF_KEY
                    row["displayName"] = canonical[DMF_KEY]["displayName"]
                    row["ruleId"] = "S-SPLIT-P2"
                    dmf_row = row
                else:
                    dmf_row["existingSlugs"] = list(dict.fromkeys(
                        (dmf_row.get("existingSlugs") or []) + (row.get("existingSlugs") or [])))
                    out = [r for r in out if r is not row]
        if name == "new":
            out = [r for r in out if r["key"] != DMF_KEY]
            ethane = canonical.get(ETHANE_KEY)
            if ethane and not any(r["key"] == ETHANE_KEY for r in out):
                out.append({
                    "key": ETHANE_KEY, "keyRank": "K1", "displayName": ethane["displayName"],
                    "sources": sorted({r["source"] for r in ethane.get("sourceRecords") or []}),
                    "unii": ethane.get("unii"), "chemblId": ethane.get("chemblId"),
                    "cid": ethane.get("cid"), "cas": ethane.get("cas"),
                    "rxcui": ethane.get("rxcui"), "isCombination": ethane.get("isCombination"),
                    "isBiologic": ethane.get("isBiologic"),
                    "hasStructure": bool(ethane.get("structure")),
                })
        write_ndjson(path, out)
        checkpoint(rep, path, "reconciliation-pass2", len(out))
        log(f"      {name}: {len(out)} rows")

    rep["redirectsWritten"] = redirected
    rep["dispositionsRepointed"] = repointed
    save_report(rep)
    done_stage(rep, "reconciliation")
    mark_done("reconciliation-pass2")


# ----------------------------------------------------------------------------- stage: tiers

def merge_reasons(a, b):
    out, seen = [], {}
    for row in (a or []) + (b or []):
        code = row.get("code")
        if code in seen:
            target = seen[code]
            for detail in row.get("detail") or []:
                if detail not in target.setdefault("detail", []):
                    target["detail"].append(detail)
            target["occurrences"] = (target.get("occurrences") or 0) + (row.get("occurrences") or 0)
            continue
        copy = json.loads(json.dumps(row))
        seen[code] = copy
        out.append(copy)
    return out


def model_from_reasons(reasons):
    codes = {r.get("code") for r in reasons or []}
    if codes & LONGEVITY_REASON_CODES:
        return "LONGEVITY"
    if codes & CLINICAL_REASON_CODES:
        return "CLINICAL"
    return "DEVELOPMENT"


def stage_tiers(rep):
    log("[4] tiers/model-assignment.ndjson")
    merges = rep["merges"]
    canonical = {p["key"]: p for p in load_canonical()}
    rows = list(read_ndjson(TIERS))
    by_key = {r["key"]: r for r in rows}
    model_changes = []

    for old, new in sorted(merges.items()):
        merged, survivor = by_key.get(old), by_key.get(new)
        if merged is None or survivor is None:
            continue
        before = survivor["model"]
        survivor["reasons"] = merge_reasons(survivor.get("reasons"), merged.get("reasons"))
        if MODEL_RANK[merged["model"]] > MODEL_RANK[survivor["model"]]:
            survivor["model"] = merged["model"]
        survivor["withdrawn"] = bool(survivor.get("withdrawn")) or bool(merged.get("withdrawn"))
        if not survivor.get("withdrawnReasonSource") and merged.get("withdrawnReasonSource"):
            survivor["withdrawnReasonSource"] = merged["withdrawnReasonSource"]
        if survivor["model"] != before:
            model_changes.append({"key": new, "from": before, "to": survivor["model"]})

    # ---- the split: the reasons the ethane page carried all name dimethyl fumarate
    ethane, dmf = by_key.get(ETHANE_KEY), by_key.get(DMF_KEY)
    moved_reasons = []
    if ethane and dmf:
        keep, move = [], []
        for reason in ethane.get("reasons") or []:
            text = json.dumps(reason).lower()
            if any(name in text for name in ("dimethyl", "dmf_", "tecfidera")) or \
                    reason.get("code") == "registry-ageing-term":
                move.append(reason)
            else:
                keep.append(reason)
        moved_reasons = [r.get("code") for r in move]
        ethane["reasons"] = keep
        before = ethane["model"]
        ethane["model"] = model_from_reasons(keep)
        if ethane["model"] != before:
            model_changes.append({"key": ETHANE_KEY, "from": before, "to": ethane["model"],
                                  "why": "S-SPLIT-P2"})
        dmf["reasons"] = merge_reasons(dmf.get("reasons"), move)
        dmf["model"] = model_from_reasons(dmf["reasons"])

    for row in rows:
        page = canonical.get(row["key"])
        if page and row.get("displayName") != page["displayName"]:
            row["displayName"] = page["displayName"]
    rows = [r for r in rows if r["key"] not in merges]
    write_ndjson(TIERS, rows)
    checkpoint(rep, TIERS, "tiers-pass2", len(rows))

    counts = Counter(r["model"] for r in rows)
    rep["modelCounts"] = dict(counts)
    rep["modelChanges"] = model_changes
    rep["splitMovedReasons"] = moved_reasons
    log(f"      {len(rows)} rows · {dict(counts)} · {len(model_changes)} pages changed model")
    save_report(rep)
    done_stage(rep, "tiers")
    mark_done("tiers-pass2")


# ----------------------------------------------------------------------------- stage: suppression

def stage_suppression(rep):
    log("[5] suppression/assignments.ndjson")
    merges = rep["merges"]
    canonical = {p["key"]: p for p in load_canonical()}
    rows = list(read_ndjson(SUPPRESSION))
    by_key = {r["key"]: r for r in rows}
    cleared = 0

    for old, new in sorted(merges.items()):
        merged, survivor = by_key.get(old), by_key.get(new)
        if merged is None or survivor is None:
            continue
        classes = list(dict.fromkeys((survivor.get("classes") or []) + (merged.get("classes") or [])))
        evidence, seen = [], set()
        for row in (survivor.get("evidence") or []) + (merged.get("evidence") or []):
            token = (row.get("test"), row.get("source"), row.get("value"))
            if token in seen:
                continue
            seen.add(token)
            evidence.append(row)
        has_evidence = any(e.get("test") != "S10" for e in evidence)
        unknown = bool(survivor.get("unknown") or merged.get("unknown")) and not has_evidence
        if (survivor.get("unknown") or merged.get("unknown")) and not unknown:
            classes = [c for c in classes if c != "S10"]
            evidence = [e for e in evidence if e.get("test") != "S10"]
            cleared += 1
        survivor["classes"] = classes
        survivor["evidence"] = evidence
        survivor["unknown"] = unknown
        survivor["suppressed"] = bool(set(classes) & SUPPRESSING_TESTS) or unknown

    # ---- the split: every S1-S9 observation on the ethane page belonged to the `dimethyl` record
    ethane = by_key.get(ETHANE_KEY)
    if ethane:
        ethane["classes"] = ["S10"]
        ethane["evidence"] = [{
            "test": "S10",
            "source": "identity pass 2 (S-SPLIT-P2)",
            "value": ("every S1-S9 observation recorded against this key was an observation about "
                      "dimethyl fumarate, carried in on the legacy `dimethyl` record; that record "
                      "moved to K1:FO2303MNI2 and no source now answers for this key"),
        }]
        ethane["unknown"] = True
        ethane["suppressed"] = True

    for row in rows:
        page = canonical.get(row["key"])
        if page and row.get("displayName") != page["displayName"]:
            row["displayName"] = page["displayName"]
    rows = [r for r in rows if r["key"] not in merges]
    write_ndjson(SUPPRESSION, rows)
    checkpoint(rep, SUPPRESSION, "suppression-pass2", len(rows))
    rep["suppressedAfter"] = sum(1 for r in rows if r.get("suppressed"))
    rep["s10ClearedByMerge"] = cleared
    log(f"      {len(rows)} rows · {rep['suppressedAfter']} suppressed · "
        f"{cleared} S10 unknowns cleared by a merge")
    note_issue(rep, (
        "the ethane page (K1:L99N5N533T) keeps suppression class S10 (unknown) after the split: it "
        "is still withheld, but the S1 ATC and S8 register facts it used to show belonged to "
        "dimethyl fumarate and were removed rather than restated. A full re-run of "
        "scripts/corpus-20k/suppression/assign.py is the way to give it its own reading."))
    save_report(rep)
    done_stage(rep, "suppression")
    mark_done("suppression-pass2")


# ----------------------------------------------------------------------------- stage: registry

def stage_registry_matches(rep):
    log("[6] registry/matches: union of NCT ids")
    merges = rep["merges"]
    canonical = {p["key"]: p for p in load_canonical()}
    ethane_names = {norm(canonical[ETHANE_KEY]["displayName"])} if ETHANE_KEY in canonical else set()
    for synonym in (canonical.get(ETHANE_KEY) or {}).get("synonyms") or []:
        ethane_names.add(norm(synonym.get("name")))

    files = {}
    rows_by_key = {}
    order = []
    for path in batch_paths(MATCH_DIR):
        for row in read_ndjson(path):
            rows_by_key[row["key"]] = row
            order.append(row["key"])
            files[row["key"]] = path

    moved_to_dmf = 0
    ethane_row = rows_by_key.get(ETHANE_KEY)
    if ethane_row:
        keep, move = [], []
        for hit in ethane_row["nctIds"]:
            (keep if norm(hit.get("matchedName")) in ethane_names else move).append(hit)
        ethane_row["nctIds"] = keep
        moved_to_dmf = len(move)
        dmf_row = rows_by_key.get(DMF_KEY)
        if move:
            if dmf_row is None:
                dmf_row = {"key": DMF_KEY, "nctIds": []}
                rows_by_key[DMF_KEY] = dmf_row
                order.append(DMF_KEY)
            have = {h["nct"] for h in dmf_row["nctIds"]}
            for hit in move:
                if hit["nct"] not in have:
                    dmf_row["nctIds"].append(hit)
                    have.add(hit["nct"])
            dmf_row["nctIds"].sort(key=lambda h: h["nct"])

    for old, new in sorted(merges.items()):
        merged = rows_by_key.pop(old, None)
        if merged is None:
            continue
        survivor = rows_by_key.get(new)
        if survivor is None:
            merged["key"] = new
            rows_by_key[new] = merged
            continue
        have = {h["nct"] for h in survivor["nctIds"]}
        for hit in merged["nctIds"]:
            if hit["nct"] not in have:
                survivor["nctIds"].append(hit)
                have.add(hit["nct"])
        survivor["nctIds"].sort(key=lambda h: h["nct"])

    seen = set()
    out = []
    for key in order:
        if key in seen or key not in rows_by_key:
            continue
        seen.add(key)
        row = rows_by_key[key]
        if row["nctIds"]:
            out.append(row)

    for path in batch_paths(MATCH_DIR):
        preserve(path)
    for path in batch_paths(MATCH_DIR):
        os.remove(path)
    written = write_batches(out, MATCH_DIR)
    for path, count in written:
        checkpoint(rep, path, "registry-matches-pass2", count)
    rep["registryPages"] = len(out)
    rep["splitNctsMovedToDmf"] = moved_to_dmf
    log(f"      {len(out)} pages hold at least one registration; "
        f"{moved_to_dmf} studies moved from the ethane page to dimethyl fumarate")
    save_report(rep)
    done_stage(rep, "registry-matches")
    mark_done("registry-matches-pass2")


def write_batches(rows, directory):
    os.makedirs(directory, exist_ok=True)
    written = []
    for start in range(0, len(rows), BATCH_SIZE):
        number = start // BATCH_SIZE + 1
        path = os.path.join(directory, f"batch-{number:04d}.ndjson")
        tmp = path + ".pass2"
        with open(tmp, "w", encoding="utf-8") as fh:
            for row in rows[start:start + BATCH_SIZE]:
                fh.write(json.dumps(row, ensure_ascii=False) + "\n")
        os.replace(tmp, path)
        written.append((path, min(BATCH_SIZE, len(rows) - start)))
    return written


# ----------------------------------------------------------------------------- stage: aggregates

def text_or_none(value):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def parse_date_ms(value):
    if not value:
        return None
    match = re.match(r"^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$", value)
    if not match:
        return None
    year, month, day = int(match.group(1)), int(match.group(2) or 1), int(match.group(3) or 1)
    try:
        return datetime(year, month, day, tzinfo=timezone.utc).timestamp() * 1000
    except ValueError:
        return None


def date_key(value):
    if not value:
        return ""
    parts = str(value).split("-")
    return "-".join([parts[0].zfill(4)] + [p.zfill(2) for p in parts[1:]] +
                    ["00"] * (3 - len(parts)))


def median(values):
    if not values:
        return None
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return round((ordered[middle - 1] + ordered[middle]) / 2 * 100) / 100


def summarise_snapshot(wanted):
    """One pass over the snapshot, keeping only what an aggregate row reads."""
    cache = os.path.join(WORK, "ct-summaries.ndjson")
    if os.path.exists(cache):
        log("      snapshot summaries already on disk")
        summaries = {}
        for row in read_ndjson(cache):
            summaries[row["nctId"]] = row
        if wanted <= set(summaries):
            return summaries
        log("      cached summaries do not cover every matched study; re-reading the snapshot")
    manifest_path = os.path.join(CT_DIR, "manifest.json")
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    if manifest.get("schema") != "rnawiki-clinicaltrials-snapshot/v1" or not manifest.get("consistent"):
        raise SystemExit(f"{CT_DIR} is not a consistent snapshot")
    summaries = {}
    read = 0
    with open(os.path.join(CT_DIR, "studies.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            read += 1
            if read % 100000 == 0:
                log(f"      {read} studies read, {len(summaries)} matched")
            try:
                raw = json.loads(line)
            except json.JSONDecodeError:
                continue
            protocol = raw.get("protocolSection") or {}
            nct = text_or_none((protocol.get("identificationModule") or {}).get("nctId"))
            if not nct or nct not in wanted:
                continue
            status = protocol.get("statusModule") or {}
            design = protocol.get("designModule") or {}
            enrollment = design.get("enrollmentInfo") or {}
            summaries[nct] = {
                "nctId": nct,
                "briefTitle": text_or_none((protocol.get("identificationModule") or {}).get("briefTitle")),
                "overallStatus": text_or_none(status.get("overallStatus")),
                "phases": [p for p in (design.get("phases") or []) if isinstance(p, str)],
                "hasResults": raw.get("hasResults") is True,
                "startDate": text_or_none((status.get("startDateStruct") or {}).get("date")),
                "completionDate": text_or_none((status.get("completionDateStruct") or {}).get("date")),
                "whyStopped": text_or_none(status.get("whyStopped")),
                "enrollment": enrollment.get("count") if isinstance(enrollment.get("count"), int) else None,
                "conditions": [c for c in (protocol.get("conditionsModule") or {}).get("conditions") or []
                               if isinstance(c, str)][:10],
                "primaryOutcomes": [
                    {"measure": text_or_none(o.get("measure")),
                     "timeFrame": text_or_none(o.get("timeFrame"))}
                    for o in ((protocol.get("outcomesModule") or {}).get("primaryOutcomes") or [])
                    if text_or_none(o.get("measure"))][:10],
            }
    if read != manifest.get("studies"):
        raise SystemExit(f"snapshot holds {read} studies but its manifest says {manifest['studies']}")
    os.makedirs(WORK, exist_ok=True)
    tmp = cache + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        for row in summaries.values():
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    os.replace(tmp, cache)
    return summaries


def stage_aggregates(rep):
    log("[7] registry/aggregates: recomputed as v3 (lastCompletionDate, enrolmentMin, perTrial)")
    canonical = {p["key"]: p for p in load_canonical()}
    matches = []
    wanted = set()
    for path in batch_paths(MATCH_DIR):
        for row in read_ndjson(path):
            matches.append(row)
            for hit in row["nctIds"]:
                wanted.add(hit["nct"])
    log(f"      {len(matches)} pages · {len(wanted)} distinct matched studies")
    summaries = summarise_snapshot(wanted)

    now = datetime.now(timezone.utc).timestamp() * 1000
    rows = []
    missing_summary = 0
    for match in matches:
        page = canonical.get(match["key"])
        if page is None:
            continue
        studies = []
        for hit in match["nctIds"]:
            study = summaries.get(hit["nct"])
            if study is None:
                missing_summary += 1
                continue
            studies.append(study)
        by_phase, by_status = Counter(), Counter()
        stopped, enrolments, conditions, outcomes, ongoing = [], [], [], [], []
        completed_no_results, per_trial = [], []
        outcome_seen, condition_seen = set(), set()
        conditions_truncated = outcomes_truncated = False
        has_results = 0
        first_start = first_start_ms = None
        longest = None
        last_completion = None
        for study in studies:
            phases = study["phases"] or ["NA_OR_UNSTATED"]
            for phase in phases:
                by_phase[phase] += 1
            status = study["overallStatus"] or "UNSTATED"
            by_status[status] += 1
            if study["whyStopped"]:
                stopped.append({"nct": study["nctId"], "status": study["overallStatus"],
                                "whyStopped": study["whyStopped"]})
            if isinstance(study["enrollment"], int):
                enrolments.append(study["enrollment"])
            if study["hasResults"]:
                has_results += 1
            for condition in study["conditions"]:
                if condition in condition_seen:
                    continue
                if len(condition_seen) >= LIST_CAP:
                    conditions_truncated = True
                    break
                condition_seen.add(condition)
                conditions.append(condition)
            for outcome in study["primaryOutcomes"]:
                if outcome["measure"] in outcome_seen:
                    continue
                if len(outcomes) >= LIST_CAP:
                    outcomes_truncated = True
                    break
                outcome_seen.add(outcome["measure"])
                outcomes.append({"nct": study["nctId"], "measure": outcome["measure"],
                                 "timeFrame": outcome["timeFrame"]})
            start_ms = parse_date_ms(study["startDate"])
            end_ms = parse_date_ms(study["completionDate"])
            if start_ms is not None and (first_start_ms is None or start_ms < first_start_ms):
                first_start_ms, first_start = start_ms, study["startDate"]
            if start_ms is not None and end_ms is not None and end_ms >= start_ms:
                days = round((end_ms - start_ms) / 86_400_000)
                if longest is None or days > longest["days"]:
                    longest = {"nct": study["nctId"], "days": days,
                               "startDate": study["startDate"],
                               "completionDate": study["completionDate"]}
            if study["overallStatus"] == "COMPLETED" and not study["hasResults"] and \
                    end_ms is not None and now - end_ms > TWO_YEARS_MS:
                completed_no_results.append({"nct": study["nctId"],
                                             "completionDate": study["completionDate"]})
            if study["overallStatus"] in ACTIVE_STATUSES:
                ongoing.append({"nct": study["nctId"], "title": study["briefTitle"],
                                "n": study["enrollment"],
                                "primaryOutcome": study["primaryOutcomes"][0]["measure"]
                                if study["primaryOutcomes"] else None,
                                "completionDate": study["completionDate"]})
            if study["overallStatus"] == "COMPLETED" and study["completionDate"]:
                if last_completion is None or \
                        date_key(study["completionDate"]) > date_key(last_completion["completionDate"]):
                    last_completion = {"nct": study["nctId"],
                                       "completionDate": study["completionDate"]}
            per_trial.append({
                "nct": study["nctId"],
                "enrollment": study["enrollment"],
                "phase": "/".join(study["phases"]) if study["phases"] else "NA_OR_UNSTATED",
                "status": study["overallStatus"],
                "completionDate": study["completionDate"],
            })
        per_trial.sort(key=lambda r: r["nct"])
        rows.append({
            "key": match["key"],
            "displayName": page["displayName"],
            "studies": len(match["nctIds"]),
            "summarised": len(studies),
            "byPhase": dict(by_phase),
            "byOverallStatus": dict(by_status),
            "stopped": stopped,
            "enrolment": {"max": max(enrolments) if enrolments else None,
                          "min": min(enrolments) if enrolments else None,
                          "median": median(enrolments), "n": len(enrolments)},
            "enrolmentMin": min(enrolments) if enrolments else None,
            "longestDuration": longest,
            "hasResults": has_results,
            "completedOverTwoYearsWithoutResults": completed_no_results,
            "primaryOutcomes": outcomes,
            "primaryOutcomesTruncated": outcomes_truncated,
            "conditions": conditions,
            "conditionsTruncated": conditions_truncated,
            "ongoing": ongoing,
            "firstStartDate": first_start,
            "lastCompletionDate": ({
                "date": last_completion["completionDate"],
                "nct": last_completion["nct"],
                "over": "studies whose registry overall status is COMPLETED",
                "source": {"kind": "clinicaltrials.gov", "id": last_completion["nct"],
                           "url": f"https://clinicaltrials.gov/study/{last_completion['nct']}",
                           "snapshot": CT_NOTE},
                "sourceDate": DATE_CT,
            } if last_completion else None),
            "perTrial": per_trial,
        })

    for path in batch_paths(AGG_DIR):
        preserve(path)
    for path in batch_paths(AGG_DIR):
        os.remove(path)
    written = write_batches(rows, AGG_DIR)
    for path, count in written:
        checkpoint(rep, path, "registry-aggregates-v3", count)
    summary = {
        "schema": "rnawiki-corpus-20k-registry-aggregate/v3",
        "generated": TODAY,
        "snapshot": CT_NOTE,
        "pages": len(rows),
        "distinctStudies": len(wanted),
        "addedInV3": ["lastCompletionDate (recomputed over COMPLETED studies)",
                      "enrolment.min and enrolmentMin",
                      "perTrial [{nct, enrollment, phase, status, completionDate}]"],
        "nctsWithoutASummary": missing_summary,
        "pagesWithLastCompletionDate": sum(1 for r in rows if r["lastCompletionDate"]),
        "pagesWithPerTrialEnrolment": sum(
            1 for r in rows if any(t["enrollment"] is not None for t in r["perTrial"])),
    }
    path = os.path.join(CORPUS, "registry", "aggregates-v3.json")
    write_json(path, summary)
    checkpoint(rep, path, "registry-aggregates-v3", 1)
    if missing_summary:
        note_issue(rep, f"{missing_summary} matched NCT ids have no row in the snapshot and were "
                        f"left out of the v3 aggregate for their page")
    rep["aggregatesV3"] = len(rows)
    rep["aggregateSummary"] = summary
    log(f"      {len(rows)} aggregate rows written as v3")
    save_report(rep)
    done_stage(rep, "aggregates")
    mark_done("registry-aggregates-v3")


# ----------------------------------------------------------------------------- stage: fields

def merge_field_records(survivor, merged):
    fields = dict(survivor.get("fields") or {})
    taken = []
    for name, value in (merged.get("fields") or {}).items():
        current = fields.get(name)
        if current is None:
            # a field the survivor's model does not carry: R4 judges coverage inside one model, so
            # a DEVELOPMENT field never lands on a CLINICAL page
            continue
        if current.get("state") == "present":
            continue
        if value.get("state") == "present":
            copy = json.loads(json.dumps(value))
            note = copy.get("note")
            copy["note"] = ((note + " | ") if note else "") + \
                "value carried from the salt form merged into this page (M-SALT-P2)"
            fields[name] = copy
            taken.append(name)
    survivor["fields"] = fields
    for name in ("doseStudied", "approvalDate"):
        if name in merged and (name not in survivor or not survivor.get(name)):
            survivor[name] = merged[name]
    return taken


def stage_fields(rep):
    log("[8] fields: merge the field records, move pages whose model changed")
    merges = rep["merges"]
    canonical = {p["key"]: p for p in load_canonical()}
    models = {r["key"]: r["model"] for r in read_ndjson(TIERS)}
    suppressed = {r["key"]: bool(r.get("suppressed")) for r in read_ndjson(SUPPRESSION)}

    records = {}
    location = {}
    for model, directory in MODEL_DIRS.items():
        for path in batch_paths(directory):
            for row in read_ndjson(path):
                records[row["key"]] = row
                location[row["key"]] = model

    carried = 0
    for old, new in sorted(merges.items()):
        merged, survivor = records.get(old), records.get(new)
        if merged is None:
            continue
        if survivor is None:
            continue
        carried += len(merge_field_records(survivor, merged))
        records.pop(old, None)
        location.pop(old, None)

    # displayName, suppressed and model follow the assignment written in stage 4
    regenerate = defaultdict(list)
    for key, row in records.items():
        target = models.get(key)
        if target is None:
            continue
        page = canonical.get(key)
        if page and "displayName" in row:
            row["displayName"] = page["displayName"]
        row["suppressed"] = suppressed.get(key, row.get("suppressed"))
        if target != location.get(key):
            regenerate[target].append(key)
            row["model"] = target

    rep["fieldsCarried"] = carried
    rep["fieldsRegenerated"] = {k: len(v) for k, v in regenerate.items()}

    # a page whose model changed is re-extracted by the model's own extractor
    for model, keys in regenerate.items():
        if not keys:
            continue
        fresh = regenerate_lines(model, keys)
        for key, row in fresh.items():
            records[key] = row
            location[key] = model
        missing = [k for k in keys if k not in fresh]
        if missing:
            note_issue(rep, f"{len(missing)} page(s) that moved to {model} produced no field "
                            f"record from the {model} extractor (first: {missing[:3]})")
            for key in missing:
                records.pop(key, None)

    grouped = defaultdict(list)
    for key, row in records.items():
        grouped[models.get(key, row.get("model"))].append(row)
    for model, directory in MODEL_DIRS.items():
        rows = sorted(grouped.get(model, []), key=lambda r: r["key"])
        for path in batch_paths(directory):
            preserve(path)
        for path in batch_paths(directory):
            os.remove(path)
        written = write_batches(rows, directory)
        for path, count in written:
            checkpoint(rep, path, "fields-pass2", count)
        log(f"      {model}: {len(rows)} records in {len(written)} files")
        rep.setdefault("fieldCounts", {})[model] = len(rows)
    save_report(rep)
    done_stage(rep, "fields")
    mark_done("fields-pass2")


def regenerate_lines(model, keys):
    """Re-extract the named pages with the model's own extractor, into a scratch directory."""
    scripts = {"CLINICAL": ("scripts/corpus-20k/fields/extract-clinical.py", "CLINICAL"),
               "DEVELOPMENT": ("scripts/corpus-20k/fields/extract-development.py", "DEVELOPMENT"),
               "LONGEVITY": ("scripts/corpus-20k/fields/extract-longevity.py", "LONGEVITY")}
    script, prefix = scripts[model]
    if model == "LONGEVITY":
        log("      LONGEVITY re-extraction is not run here: the longevity extractor's fetch stage "
            "contacts Europe PMC and this pass makes no request. The pages are listed instead.")
        return {}
    keys_path = os.path.join(WORK, f"regenerate-{model.lower()}.txt")
    os.makedirs(WORK, exist_ok=True)
    with open(keys_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(sorted(keys)) + "\n")
    out_dir = os.path.join(WORK, f"regenerate-{model.lower()}")
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir, exist_ok=True)
    env = {f"{prefix}_ONLY_KEYS": keys_path, f"{prefix}_OUT_DIR": out_dir,
           f"{prefix}_NO_RECORD": "1"}
    run([PY, script], env=env)
    fresh = {}
    for path in batch_paths(out_dir):
        for row in read_ndjson(path):
            fresh[row["key"]] = row
    log(f"      {model}: {len(fresh)} of {len(keys)} pages re-extracted")
    return fresh


# ----------------------------------------------------------------------------- stage: coverage

def stage_coverage(rep):
    log("[9] coverage: re-measuring every model")
    for name in ("coverage-summary.json", "coverage-report.md"):
        preserve(os.path.join(FIELDS_DIR, name))
    out = run([PY, "scripts/corpus-20k/fields/coverage.py"])
    result = json.loads(out.strip().splitlines()[-1])
    for name in ("coverage-summary.json", "coverage-report.md"):
        checkpoint(rep, os.path.join(FIELDS_DIR, name), "coverage-pass2", 1)
    with open(os.path.join(FIELDS_DIR, "coverage-summary.json"), encoding="utf-8") as fh:
        summary = json.load(fh)
    rep["coverage"] = result
    rep["tier1"] = summary["tiers"]["tier1"]["pages"]
    rep["tier2"] = summary["tiers"]["tier2"]["pages"]
    rep["tier3"] = summary["tiers"]["tier3"]["pages"]
    rep["longevityMedian"] = summary["models"]["LONGEVITY"]["medianPresentFields"]
    log(f"      tier1 {rep['tier1']} · tier2 {rep['tier2']} · tier3 {rep['tier3']} · "
        f"LONGEVITY median {rep['longevityMedian']}")
    save_report(rep)
    done_stage(rep, "coverage")
    mark_done("coverage-pass2")


# ----------------------------------------------------------------------------- report

def stage_report(rep):
    note_issue(rep, (
        "data/corpus-20k/questions, derived and render still hold the pre-pass-2 key set: they are "
        "rebuilt from these artefacts and must be regenerated before any load."))
    result = {
        "mergesP2": rep.get("mergesP2", 0),
        "splitsP2": rep.get("splitsP2", 0),
        "pagesAfter": rep.get("pagesAfter"),
        "newRedirects": len(rep.get("newRedirects") or []),
        "slugCollisionsListed": [f"{c['slug']} | {c['page']} | {c['matches'][0]['key']}"
                                 for c in rep.get("slugCollisions") or []],
        "tier1": rep.get("tier1"),
        "tier2": rep.get("tier2"),
        "tier3": rep.get("tier3"),
        "longevityMedian": rep.get("longevityMedian"),
        "aggregatesV3": rep.get("aggregatesV3"),
        "issues": rep.get("issues") or [],
    }
    path = os.path.join(IDENTITY_DIR, "pass2-summary.json")
    write_json(path, {**result, "detectCounts": rep.get("detectCounts"),
                      "modelCounts": rep.get("modelCounts"),
                      "modelChanges": rep.get("modelChanges"),
                      "renamedSurvivors": rep.get("renamedSurvivors"),
                      "adoptedSlugs": rep.get("adoptedSlugs"),
                      "blockedNoParentPage": rep.get("blockedNoParentPage"),
                      "blockedFragments": rep.get("blockedFragments"),
                      "multiSurvivorGroups": rep.get("multiSurvivorGroups"),
                      "merges": rep.get("merges"),
                      "slugCollisions": rep.get("slugCollisions")})
    checkpoint(rep, path, "identity-pass2", 1)
    mark_done("identity-pass2")
    save_report(rep)
    print(json.dumps(result, ensure_ascii=False))


# ----------------------------------------------------------------------------- main

STAGES = [
    ("detect", stage_detect),
    ("canonical", stage_canonical),
    ("reconciliation", stage_reconciliation),
    ("tiers", stage_tiers),
    ("suppression", stage_suppression),
    ("registry-matches", stage_registry_matches),
    ("aggregates", stage_aggregates),
    ("fields", stage_fields),
    ("coverage", stage_coverage),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage", default="all",
                        choices=["all", "report"] + [n for n, _ in STAGES])
    args = parser.parse_args()
    os.makedirs(WORK, exist_ok=True)
    os.makedirs(PRE, exist_ok=True)
    rep = state_report()
    for name, fn in STAGES:
        if args.stage not in ("all", name):
            continue
        if name in rep.get("stages", []) and args.stage == "all":
            log(f"[skip] {name}: already completed in this run")
            continue
        if name != "detect" and "merges" not in rep:
            raise SystemExit("run --stage detect first: the merge map is not in tmp/.../report.json")
        fn(rep)
    if args.stage in ("all", "report"):
        stage_report(rep)


if __name__ == "__main__":
    main()
