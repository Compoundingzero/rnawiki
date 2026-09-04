#!/usr/bin/env python
"""Phase 2b stage 1 — AUGMENT. Seven corrections applied in place to the Phase 2 field records.

Everything here rewrites existing artefacts; nothing new is invented. Each stage names the source
that states the value it writes, keeps the source's own words, and records what it could not find.

  1 recut       "age-related" alone stops assigning LONGEVITY. The recut is executed by the real
                rule (scripts/corpus-20k/tiers/assign-models.py with RECUT_AGE_RELATED_ONLY=1), and
                the result is accepted only if it differs from the recorded assignment in exactly
                the pages this stage predicted. The moved pages are then extracted by the CLINICAL
                and DEVELOPMENT extractors themselves (--only-keys), so their lines are the lines a
                full run of those extractors would have written.
  2 pathway     LONGEVITY field 8 also admits a Europe PMC abstract sentence that names the
                compound, a pathway term and a mechanism verb together. The query, the sentence
                test and the citation live in extract-longevity.py; this stage re-runs it.
  3 doseStudied field 15b, for every LONGEVITY and CLINICAL page: registry intervention text for
                humans, the ITP cohort dose as written for mice. Recorded beside `fields`, never
                inside it: the spec makes it a sub-field of field 9, so it moves no coverage count.
  4 approvalDate ChEMBL first_approval (a year) and, where a register prints one, the Drugs@FDA
                approval date and the EMA marketing-authorisation date, each with its source.
  5 aggregates  lastCompletionDate = the latest completion date over the page's completed studies,
                read from the ClinicalTrials.gov snapshot rows themselves.
  6 names       A K1 page whose display name is not one of the FDA UNII names for its own UNII is
                renamed to that UNII's display name; the old name is kept as a `fragment` synonym.
  7 coverage    scripts/corpus-20k/fields/coverage.py re-measures every model and rewrites
                coverage-summary.json and coverage-report.md.

Legal: the only host contacted is Europe PMC, through scripts/corpus-20k/fields/epmc.py, at most
3 requests a second, cached under data/corpus-20k/raw/europepmc and logged to
data/corpus-20k/legal/requests.log. Every other source is read from disk.

  .venv-corpus/bin/python scripts/corpus-20k/fields/augment.py [--stage all|recut|moved|...]
"""

from __future__ import annotations

import argparse
import csv
import glob
import html
import json
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INGEST = os.path.abspath(os.path.join(ROOT, "..", "rnawiki-ingest-data"))
D = lambda *p: os.path.join(ROOT, *p)  # noqa: E731
I = lambda *p: os.path.join(INGEST, *p)  # noqa: E731

PY = os.path.join(ROOT, ".venv-corpus", "bin", "python")
WORK = D("tmp", "corpus-20k-augment")
CORPUS = D("data", "corpus-20k")
FIELDS_DIR = os.path.join(CORPUS, "fields")
LONGEVITY_DIR = os.path.join(FIELDS_DIR, "longevity")
CLINICAL_DIR = os.path.join(FIELDS_DIR, "clinical")
DEVELOPMENT_DIR = os.path.join(FIELDS_DIR, "development")
AGGREGATE_DIR = os.path.join(CORPUS, "registry", "aggregates")
MATCH_DIR = os.path.join(CORPUS, "registry", "matches")
CT_DIR = I("clinicaltrials", "20260901T090005")
BATCH_SIZE = 250
TODAY = date.today().isoformat()
STEP = "fields-augment"
AGG_STEP = "registry-aggregates-v2"
PHASE = "2b"

DATE_CT = "2026-09-01"
DATE_ITP = "2026-09-04"
DATE_CHEMBL = "2026-09-04"
DATE_EMA = "2026-09-04"
DATE_UNII = "2026-08-04"
CT_NOTE = "ClinicalTrials.gov API v2 studies snapshot 2026-09-01T09:00:05"

_NON = re.compile(r"[^a-z0-9]+")
SALT_WORDS = {
    "hydrochloride", "hcl", "sodium", "potassium", "calcium", "magnesium", "sulfate", "sulphate",
    "phosphate", "acetate", "maleate", "tartrate", "citrate", "mesylate", "besylate", "fumarate",
    "succinate", "bromide", "chloride", "nitrate", "oxalate", "tosylate", "dihydrate",
    "monohydrate", "hydrate", "anhydrous", "malate", "lactate", "bitartrate", "hydrobromide",
    "gluconate", "carbonate", "benzoate", "stearate", "trihydrate", "disodium", "dipotassium",
    "salt", "base",
}
SAFE_KINDS = {"display", "inn", "usan", "ban", "jan", "brand", "salt", "code"}


def norm(s):
    return _NON.sub(" ", str(s or "").lower()).strip()


def strip_salt(n):
    parts = [p for p in n.split(" ") if p]
    while len(parts) > 1 and parts[-1] in SALT_WORDS:
        parts.pop()
    return " ".join(parts)


def log(msg):
    print(msg, flush=True)


def rel(path):
    return os.path.relpath(path, ROOT)


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


def write_ndjson(path, rows):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    os.replace(tmp, path)


def state_report():
    path = os.path.join(WORK, "report.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    return {"issues": []}


def save_report(rep):
    os.makedirs(WORK, exist_ok=True)
    with open(os.path.join(WORK, "report.json"), "w", encoding="utf-8") as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)


def note_issue(rep, text):
    if text not in rep["issues"]:
        rep["issues"].append(text)


def record_batch(step, batch_no, path, records, phase=PHASE):
    run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", phase, "--step", step,
         "--batch", str(batch_no), "--file", rel(path), "--records", str(records)])


def count_records(path):
    if path.endswith(".ndjson"):
        with open(path, encoding="utf-8") as fh:
            return sum(1 for line in fh if line.strip())
    return 1


def checkpoint(rep, path, records=None, step=STEP):
    """Record one rewritten file the moment it is written.

    A run cut off between two files must leave the ledger true for every file already written, so
    every stage checkpoints each file itself and `stage_record` only closes what is left. The batch
    number for a path is stable (the ledger keeps it), and `recordBatch` is idempotent on
    phase+step+batch, so re-recording a file a later stage rewrote refreshes its digest in place.
    """
    ledger = rep.setdefault("batchNos", {})
    entry = f"{step}\t{rel(path)}"
    if entry not in ledger:
        used = [v for k, v in ledger.items() if k.startswith(step + "\t")]
        ledger[entry] = (max(used) + 1) if used else 1
    record_batch(step, ledger[entry], path,
                 count_records(path) if records is None else records)
    save_report(rep)


# ==================================================================== stage 1: the recut

AGE_TERMS = re.compile(r"\(terms: ([^)]*)\)")


def predicted_recut(assignment_rows):
    """Pages whose whole case for LONGEVITY is the bare term "age-related"."""
    moved = []
    for a in assignment_rows:
        if a["model"] != "LONGEVITY":
            continue
        codes = {r["code"] for r in a.get("reasons") or []}
        if codes - {"registry-ageing-term"}:
            continue
        terms = set()
        for r in a.get("reasons") or []:
            for detail in r.get("detail") or []:
                m = AGE_TERMS.search(detail)
                if m:
                    terms |= {t.strip() for t in m.group(1).split(",") if t.strip()}
        if terms == {"age-related"}:
            moved.append(a["key"])
    return moved


def stage_recut(rep):
    log("[1] recut: re-running the model assignment with RECUT_AGE_RELATED_ONLY=1")
    out_dir = os.path.join(WORK, "tiers")
    os.makedirs(out_dir, exist_ok=True)
    current = list(read_ndjson(os.path.join(CORPUS, "tiers", "model-assignment.ndjson")))
    predicted = set(predicted_recut(current))
    log(f"      predicted {len(predicted)} pages leave LONGEVITY")

    run([PY, "scripts/corpus-20k/tiers/assign-models.py"],
        env={"MODEL_OUT_DIR": out_dir, "RECUT_AGE_RELATED_ONLY": "1"})

    new = list(read_ndjson(os.path.join(out_dir, "model-assignment.ndjson")))
    if len(new) != len(current):
        raise SystemExit(f"recut produced {len(new)} rows, expected {len(current)}")
    changed, other_changes = {}, 0
    by_key_new = {}
    for old, fresh in zip(current, new):
        if old["key"] != fresh["key"]:
            raise SystemExit("recut changed the row order; refusing to install")
        by_key_new[fresh["key"]] = fresh
        if old["model"] != fresh["model"]:
            changed[fresh["key"]] = (old["model"], fresh["model"])
        elif json.dumps(old, sort_keys=True) != json.dumps(fresh, sort_keys=True):
            other_changes += 1
    if set(changed) != predicted:
        raise SystemExit(
            f"recut moved {len(changed)} pages, predicted {len(predicted)}; "
            f"unexpected: {sorted(set(changed) ^ predicted)[:10]}")
    if any(old != "LONGEVITY" for old, _ in changed.values()):
        raise SystemExit("recut moved a page that was not LONGEVITY; refusing to install")
    if other_changes:
        note_issue(rep, f"the recut rerun also restated {other_changes} rows that did not change "
                        f"model (register or detail strings); they were installed as produced")
    to_model = Counter(newm for _, newm in changed.values())
    log(f"      moved {len(changed)} pages: {dict(to_model)} (other row changes: {other_changes})")

    shutil.copyfile(os.path.join(out_dir, "model-assignment.ndjson"),
                    os.path.join(CORPUS, "tiers", "model-assignment.ndjson"))
    if os.path.exists(os.path.join(out_dir, "summary.json")):
        shutil.copyfile(os.path.join(out_dir, "summary.json"),
                        os.path.join(CORPUS, "tiers", "summary.json"))
    with open(os.path.join(WORK, "moved.json"), "w", encoding="utf-8") as fh:
        json.dump({k: v[1] for k, v in changed.items()}, fh, indent=1)
    for model, name in (("CLINICAL", "moved-clinical.txt"), ("DEVELOPMENT", "moved-development.txt")):
        with open(os.path.join(WORK, name), "w", encoding="utf-8") as fh:
            for k, (_, m) in sorted(changed.items()):
                if m == model:
                    fh.write(k + "\n")
    rep["recutMoved"] = len(changed)
    rep["recutTo"] = {"clinical": to_model.get("CLINICAL", 0),
                      "development": to_model.get("DEVELOPMENT", 0)}
    rep["recutExamples"] = [{"key": k, "to": v[1],
                             "displayName": by_key_new[k].get("displayName")}
                            for k, v in sorted(changed.items())[:10]]
    save_report(rep)
    checkpoint(rep, os.path.join(CORPUS, "tiers", "model-assignment.ndjson"))


# ==================================================================== stage 2: the moved pages

def batch_paths(directory):
    return sorted(glob.glob(os.path.join(directory, "batch-*.ndjson")))


def append_pages(directory, new_lines):
    """Append record lines to a batch directory, filling the last file to BATCH_SIZE first."""
    if not new_lines:
        return []
    paths = batch_paths(directory)
    touched = []
    queue = list(new_lines)
    if paths:
        last = paths[-1]
        rows = [json.loads(l) for l in open(last, encoding="utf-8") if l.strip()]
        room = BATCH_SIZE - len(rows)
        if room > 0:
            take, queue = queue[:room], queue[room:]
            write_ndjson(last, rows + take)
            touched.append(last)
    n = len(batch_paths(directory))
    while queue:
        n += 1
        take, queue = queue[:BATCH_SIZE], queue[BATCH_SIZE:]
        path = os.path.join(directory, f"batch-{n:04d}.ndjson")
        write_ndjson(path, take)
        touched.append(path)
    return touched


def stage_moved(rep):
    log("[2] the moved pages: extracting them with the CLINICAL and DEVELOPMENT extractors")
    if rep.get("movedAppended"):
        log("      already appended in this run (the append is not repeatable); skipping")
        return
    touched = {"clinical": [], "development": []}
    counts = {}
    for model, keyfile, script, out_name, env_prefix in (
            ("CLINICAL", "moved-clinical.txt", "scripts/corpus-20k/fields/extract-clinical.py",
             "clinical", "CLINICAL"),
            ("DEVELOPMENT", "moved-development.txt",
             "scripts/corpus-20k/fields/extract-development.py", "development", "DEVELOPMENT")):
        keys_path = os.path.join(WORK, keyfile)
        keys = [l.strip() for l in open(keys_path, encoding="utf-8") if l.strip()]
        counts[out_name] = len(keys)
        if not keys:
            continue
        out_dir = os.path.join(WORK, out_name)
        shutil.rmtree(out_dir, ignore_errors=True)
        os.makedirs(out_dir, exist_ok=True)
        env = {f"{env_prefix}_ONLY_KEYS": keys_path, f"{env_prefix}_OUT_DIR": out_dir}
        if env_prefix == "DEVELOPMENT":
            env["DEVELOPMENT_NO_RECORD"] = "1"
        run([PY, script], env=env)
        rows = []
        for path in batch_paths(out_dir):
            rows.extend(read_ndjson(path))
        got = {r["key"] for r in rows}
        missing = [k for k in keys if k not in got]
        if missing:
            note_issue(rep, f"{len(missing)} recut pages produced no {model} field record "
                            f"(first: {missing[:3]})")
        target = CLINICAL_DIR if model == "CLINICAL" else DEVELOPMENT_DIR
        touched[out_name] = append_pages(target, rows)
        log(f"      {model}: {len(rows)} pages appended, "
            f"{len(touched[out_name])} batch files touched")
    rep["movedExtracted"] = counts
    rep["touchedDevelopment"] = [rel(p) for p in touched["development"]]
    rep["movedAppended"] = True
    save_report(rep)
    for name in ("clinical", "development"):
        for path in touched[name]:
            checkpoint(rep, path)


# ==================================================================== stage 3: longevity rerun

def stage_longevity(rep):
    log("[3] longevity: re-running the extractor (pathway augmentation, recut scope)")
    before = 0
    moved = set(json.load(open(os.path.join(WORK, "moved.json"), encoding="utf-8")))
    for path in batch_paths(LONGEVITY_DIR):
        for r in read_ndjson(path):
            if r["key"] in moved:
                continue
            if (r["fields"].get("pathway") or {}).get("state") == "present":
                before += 1
    rep["pathwayBefore"] = before
    log(f"      pathway present before, over the pages that stay LONGEVITY: {before}")

    out = run([PY, "scripts/corpus-20k/fields/extract-longevity.py"],
              env={"LONGEVITY_FORCE": "1", "LONGEVITY_NO_RECORD": "1",
                   "LONGEVITY_KEEP_SUMMARY": "1"})
    summary = json.loads(out.strip().splitlines()[-1])
    pages = summary["pages"]
    expected_files = max(1, (pages + BATCH_SIZE - 1) // BATCH_SIZE)
    for path in batch_paths(LONGEVITY_DIR)[expected_files:]:
        os.remove(path)
        log(f"      removed {rel(path)} (the recut scope needs {expected_files} batch files)")
    after = sum(1 for path in batch_paths(LONGEVITY_DIR) for r in read_ndjson(path)
                if r["fields"]["pathway"]["state"] == "present")
    rep["pathwayAfter"] = after
    rep["longevityPages"] = pages
    rep["europePmcRequests"] = summary.get("europePmc", {}).get("fetched", 0)
    if summary.get("issues"):
        note_issue(rep, f"the longevity extractor reported {len(summary['issues'])} page issues; "
                        f"first: {summary['issues'][0][:160]}")
    rep["europePmcCached"] = summary.get("europePmc", {}).get("cached", 0)
    log(f"      pathway present after: {after} over {pages} pages; "
        f"Europe PMC fetched {rep['europePmcRequests']}, "
        f"served from cache {rep['europePmcCached']}")
    save_report(rep)
    for path in batch_paths(LONGEVITY_DIR):
        checkpoint(rep, path)


# ==================================================================== registry snapshot facts

def stage_ct_facts(rep):
    """One pass over the ClinicalTrials.gov snapshot for the studies matched to a page."""
    out_path = os.path.join(WORK, "ct-facts.json")
    if os.path.exists(out_path):
        log("[4] registry snapshot facts: already on disk")
        return
    log("[4] registry snapshot facts: streaming the 2026-09-01 snapshot")
    wanted = set()
    for path in batch_paths(MATCH_DIR):
        for r in read_ndjson(path):
            for hit in r["nctIds"]:
                wanted.add(hit["nct"])
    log(f"      {len(wanted)} matched NCT ids")
    facts = {}
    n = 0
    with open(os.path.join(CT_DIR, "studies.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            n += 1
            if n % 100000 == 0:
                log(f"      {n} studies read, {len(facts)} matched")
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            ps = d.get("protocolSection") or {}
            nct = ((ps.get("identificationModule") or {}).get("nctId"))
            if not nct or nct not in wanted:
                continue
            status = (ps.get("statusModule") or {})
            arms = (ps.get("armsInterventionsModule") or {})
            names = []
            for iv in arms.get("interventions") or []:
                if iv.get("name"):
                    names.append(iv["name"])
                for other in iv.get("otherNames") or []:
                    if other:
                        names.append(other)
            descriptions = [x for x in
                            [iv.get("description") for iv in arms.get("interventions") or []] +
                            [a.get("description") for a in arms.get("armGroups") or []] if x]
            facts[nct] = {
                "status": status.get("overallStatus"),
                "completionDate": ((status.get("completionDateStruct") or {}).get("date")),
                "primaryCompletionDate": ((status.get("primaryCompletionDateStruct") or {})
                                          .get("date")),
                "interventions": names,
                "descriptions": descriptions,
            }
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(facts, fh, ensure_ascii=False)
    with_desc = sum(1 for f in facts.values() if f["descriptions"])
    log(f"      {len(facts)} matched studies read; {with_desc} carry an intervention or arm "
        f"description")
    if with_desc == 0:
        note_issue(rep,
                   "the ClinicalTrials.gov snapshot on disk was fetched with a fixed field list "
                   "(manifest.json) that excludes InterventionDescription and "
                   "ArmGroupDescription, so no arm or intervention description exists to quote. "
                   "doseStudied for humans therefore quotes the registry's own intervention name, "
                   "which is the only dose-bearing registry text in the snapshot; no new "
                   "ClinicalTrials.gov request was made (only Europe PMC is cleared for fetching "
                   "in this stage).")
    save_report(rep)


def load_ct_facts():
    with open(os.path.join(WORK, "ct-facts.json"), encoding="utf-8") as fh:
        return json.load(fh)


# ==================================================================== stage 5: doseStudied

DOSE_TOKEN = re.compile(
    r"(?<![A-Za-z0-9])\d+(?:[.,]\d+)?\s?(?:%|mg/kg|mcg/kg|ug/kg|µg/kg|g/kg|mg/m2|mg/mL|mg/ml|"
    r"mg|mcg|µg|ug|IU|iu|units?|U/kg|ppm|mmol|nmol|µmol|umol|mL|ml|litres?|grams?|kg|g)"
    r"(?![A-Za-z])", re.I)
ROUTE_RX = re.compile(
    r"\b(oral(?:ly)?|by mouth|per os|p\.o\.|intravenous(?:ly)?|i\.v\.|IV|infusion|"
    r"subcutaneous(?:ly)?|s\.c\.|intramuscular(?:ly)?|i\.m\.|topical(?:ly)?|inhaled|inhalation|"
    r"sublingual|transdermal|intraperitoneal|intranasal|nasal|ophthalmic|eye drops?|rectal|"
    r"vaginal|intrathecal|intravitreal|buccal|injection|tablet|capsule|patch)\b")
DOSE_ENTRY_CAP = 20


def itp_legend():
    """(agent, cohort) -> the dose exactly as the JAX MPD ITP project page prints it."""
    page = open(os.path.join(CORPUS, "legal", "terms", "jax-itp-project.html"),
                encoding="utf-8", errors="replace").read()
    row = re.compile(
        r"<td>\s*([^<>]{2,120}?)\s*<nobr>\(([^)]{1,40})\)</nobr>\s*</td>\s*"
        r"<td>.*?>(C\d{4})<.*?</td>\s*<td>\s*([^<]{0,120}?)\s*</td>", re.S)
    out = {}
    for m in row.finditer(page):
        agent = html.unescape(m.group(1)).strip()
        cohort = m.group(3)
        dose = html.unescape(m.group(4)).strip()
        if dose:
            out[(norm(agent), cohort)] = dose
    return out


def page_names(canon_row):
    names = set()
    display = (canon_row or {}).get("displayName")
    if display:
        names.add(norm(display))
        names.add(strip_salt(norm(display)))
    for syn in (canon_row or {}).get("synonyms") or []:
        if syn.get("kind") in SAFE_KINDS and syn.get("name"):
            names.add(norm(syn["name"]))
    return {n for n in names if len(n) >= 4}


def human_doses(key, matches, ct, names):
    out, seen = [], set()
    for hit in matches.get(key) or []:
        nct = hit["nct"]
        fact = ct.get(nct)
        if not fact:
            continue
        matched = norm(hit.get("matchedName") or "")
        candidates = list(fact["descriptions"]) + list(fact["interventions"])
        for text in candidates:
            if not DOSE_TOKEN.search(text):
                continue
            n = norm(text)
            if not any(nm in n for nm in names) and not (matched and matched in n):
                continue
            if text in seen:
                continue
            seen.add(text)
            source_field = ("interventions[].description or armGroups[].description"
                            if text in fact["descriptions"] else "interventions[].name")
            route = ROUTE_RX.search(text)
            out.append({
                "organism": "human",
                "doseText": text,
                "route": route.group(0) if route else None,
                "source": {"kind": "clinicaltrials.gov", "id": nct,
                           "url": f"https://clinicaltrials.gov/study/{nct}",
                           "field": source_field, "snapshot": CT_NOTE},
                "sourceDate": DATE_CT,
            })
            if len(out) >= DOSE_ENTRY_CAP:
                return out
    return out


def mouse_doses(itp_field, legend):
    if not itp_field or itp_field.get("state") != "present":
        return []
    out = []
    for cohort in (itp_field.get("value") or {}).get("cohorts") or []:
        agent = cohort.get("agentAsWritten") or ""
        year = cohort.get("cohortYear")
        printed = legend.get((norm(agent), year))
        if printed:
            dose_text, field_name = printed, "JAX MPD ITP project page cohort legend, dose column"
        elif cohort.get("doseAsWritten"):
            dose_text = cohort["doseAsWritten"]
            field_name = f"{cohort.get('file')} column \"dose\""
        else:
            continue
        out.append({
            "organism": "mouse",
            "doseText": dose_text,
            "route": None,
            "routeNote": ("the ITP cohort row prints a concentration and no route word; nothing "
                          "further is recorded"),
            "cohort": year,
            "armCode": cohort.get("armCode"),
            "source": {"kind": "jax-mpd-itp", "id": f"{agent} {year}".strip(),
                       "url": "https://phenome.jax.org/projects/ITP1", "field": field_name},
            "sourceDate": DATE_ITP,
        })
    return out


def dose_field(entries, had_studies, had_itp):
    if entries:
        organisms = sorted({e["organism"] for e in entries})
        return {
            "state": "present",
            "value": entries,
            "source": {"kind": "clinicaltrials.gov+jax-mpd-itp" if len(organisms) > 1
                       else ("clinicaltrials.gov" if organisms == ["human"] else "jax-mpd-itp"),
                       "id": None, "url": None},
            "sourceDate": max(e["sourceDate"] for e in entries),
            "lastVerified": TODAY,
            "verbatim": True,
            "note": ("field 15b of docs/specs/field-models.md: a sub-field of field 9, not a "
                     "further model field. Every entry is the source's own text for what was "
                     "given in a study; it is not a recommendation."),
        }
    consulted = []
    if had_studies:
        consulted.append("the matched ClinicalTrials.gov registrations in the 2026-09-01 snapshot "
                         "(no intervention text in them states a dose)")
    else:
        consulted.append("ClinicalTrials.gov: this page matches no registration")
    consulted.append("the NIA ITP lifespan cohorts" if had_itp
                     else "the NIA ITP lifespan cohorts (this page has no ITP arm)")
    return {"state": "absent", "value": None, "source": None, "sourceDate": None,
            "lastVerified": None, "verbatim": False,
            "note": "consulted: " + "; ".join(consulted)}


# ==================================================================== stage 5b: approvalDate

def load_approval_sources():
    chembl = {}
    for path in sorted(glob.glob(os.path.join(CORPUS, "raw", "chembl", "molecules-*.json"))):
        with open(path, encoding="utf-8") as fh:
            for mol in json.load(fh)["molecules"]:
                if mol.get("first_approval") and mol.get("molecule_chembl_id"):
                    chembl[mol["molecule_chembl_id"]] = int(mol["first_approval"])
    fda_by_app, fda_by_name = {}, defaultdict(set)
    with open(I("openfda", "drug-drugsfda-0001-of-0001.json"), encoding="utf-8") as fh:
        payload = json.load(fh)
    for app in payload["results"]:
        number = app.get("application_number")
        dates = []
        for sub in app.get("submissions") or []:
            if sub.get("submission_status") == "AP" and sub.get("submission_type") == "ORIG" \
                    and sub.get("submission_status_date"):
                dates.append(sub["submission_status_date"])
        if not number or not dates:
            continue
        fda_by_app[number] = min(dates)
        for product in app.get("products") or []:
            ings = product.get("active_ingredients") or []
            if len(ings) == 1 and ings[0].get("name"):
                fda_by_name[norm(ings[0]["name"])].add(number)
    del payload
    ema_by_number, ema_by_name = {}, defaultdict(set)
    with open(os.path.join(CORPUS, "raw", "ema", "Medicine.csv"), encoding="utf-8-sig",
              newline="") as fh:
        for row in csv.DictReader(fh):
            if (row.get("Category") or "").strip() != "Human":
                continue
            printed = (row.get("Marketing authorisation date") or "").strip()
            number = (row.get("EMA product number") or "").strip()
            if not printed or not number:
                continue
            ema_by_number[number] = {"printed": printed, "medicine":
                                     (row.get("Name of medicine") or "").strip()}
            for col in ("International non-proprietary name (INN) / common name", "Active substance",
                        "Name of medicine"):
                for part in re.split(r"[\n;,/]+", row.get(col) or ""):
                    n = norm(part)
                    if len(n) >= 4:
                        ema_by_name[n].add(number)
    return chembl, fda_by_app, fda_by_name, ema_by_number, ema_by_name


def iso_from_fda(value):
    return f"{value[0:4]}-{value[4:6]}-{value[6:8]}" if value and len(value) == 8 else None


def iso_from_ema(value):
    m = re.match(r"^(\d{2})/(\d{2})/(\d{4})$", value or "")
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else None


def build_approval(record, canon_row, sources):
    chembl, fda_by_app, fda_by_name, ema_by_number, ema_by_name = sources
    names = page_names(canon_row)
    value = {}

    cid = (canon_row or {}).get("chemblId")
    if cid and cid in chembl:
        value["chemblFirstApproval"] = {
            "year": chembl[cid],
            "source": {"kind": "chembl", "id": cid, "field": "molecule.first_approval",
                       "url": f"https://www.ebi.ac.uk/chembl/explore/compound/{cid}"},
            "sourceDate": DATE_CHEMBL,
        }

    regulatory = ((record.get("fields") or {}).get("regulatory") or {}).get("value") or {}
    apps = set()
    for ev in (regulatory.get("US") or {}).get("evidence") or []:
        if ev.get("register") in ("Drugs@FDA", "FDA Orange Book") and ev.get("id"):
            apps.add(ev["id"])
    for nm in names:
        apps |= fda_by_name.get(nm, set())
    dated = sorted((fda_by_app[a], a) for a in apps if a in fda_by_app)
    if dated:
        printed, number = dated[0]
        value["US"] = {
            "date": iso_from_fda(printed),
            "dateAsPrinted": printed,
            "application": number,
            "applicationsConsidered": len(dated),
            "source": {"kind": "drugsfda", "id": number,
                       "field": "submissions[] submission_type ORIG, submission_status AP, "
                                "submission_status_date",
                       "url": "https://api.fda.gov/drug/drugsfda.json"},
            "sourceDate": "2026-08-28",
        }

    numbers = set()
    for ev in (regulatory.get("EU") or {}).get("evidence") or []:
        if ev.get("id"):
            numbers.add(ev["id"])
    for nm in names:
        numbers |= ema_by_name.get(nm, set())
    ema_dated = []
    for number in numbers:
        row = ema_by_number.get(number)
        if row:
            ema_dated.append((iso_from_ema(row["printed"]) or "9999", number, row))
    ema_dated.sort()
    if ema_dated:
        iso, number, row = ema_dated[0]
        value["EU"] = {
            "date": None if iso == "9999" else iso,
            "dateAsPrinted": row["printed"],
            "medicine": row["medicine"],
            "productNumber": number,
            "medicinesConsidered": len(ema_dated),
            "source": {"kind": "ema", "id": number,
                       "field": "Medicine.csv \"Marketing authorisation date\"",
                       "url": "https://www.ema.europa.eu/en/medicines"},
            "sourceDate": DATE_EMA,
        }

    if not value:
        return {"state": "absent", "value": None, "source": None, "sourceDate": None,
                "lastVerified": None, "verbatim": False,
                "note": ("consulted: ChEMBL 37 molecule.first_approval, the Drugs@FDA original "
                         "approval submissions and the EMA marketing-authorisation date; none "
                         "states an approval date for this record")}
    return {
        "state": "present",
        "value": value,
        "source": {"kind": "+".join(sorted({"chembl" if "chemblFirstApproval" in value else "",
                                            "drugsfda" if "US" in value else "",
                                            "ema" if "EU" in value else ""} - {""})),
                   "id": None, "url": None},
        "sourceDate": max([v["sourceDate"] for v in value.values()]),
        "lastVerified": TODAY,
        "verbatim": True,
        "note": ("a sub-field of the withdrawal and regulatory fields "
                 "(docs/specs/field-models.md), mirrored into both where those fields are present; "
                 "not counted as a further CLINICAL field"),
    }


# ==================================================================== stage 5 driver

def stage_fields(rep):
    log("[5] doseStudied for LONGEVITY and CLINICAL, approvalDate for CLINICAL")
    ct = load_ct_facts()
    legend = itp_legend()
    canon = {r["key"]: r for r in read_ndjson(os.path.join(CORPUS, "identity", "canonical.ndjson"))}
    matches = {}
    for path in batch_paths(MATCH_DIR):
        for r in read_ndjson(path):
            matches[r["key"]] = r["nctIds"]
    sources = load_approval_sources()

    dose_present = 0
    dose_pages = 0
    human_pages = 0
    mouse_pages = 0
    approval_present = 0
    touched = []

    for directory, model in ((LONGEVITY_DIR, "LONGEVITY"), (CLINICAL_DIR, "CLINICAL")):
        for path in batch_paths(directory):
            rows = list(read_ndjson(path))
            for r in rows:
                key = r["key"]
                names = page_names(canon.get(key))
                human = human_doses(key, matches, ct, names) if names or matches.get(key) else []
                mouse = mouse_doses((r.get("fields") or {}).get("itp"), legend)
                entries = mouse + human
                r["doseStudied"] = dose_field(entries, bool(matches.get(key)),
                                              ((r.get("fields") or {}).get("itp") or {})
                                              .get("state") == "present")
                dose_pages += 1
                if entries:
                    dose_present += 1
                if human:
                    human_pages += 1
                if mouse:
                    mouse_pages += 1
                if model == "CLINICAL":
                    approval = build_approval(r, canon.get(key), sources)
                    r["approvalDate"] = approval
                    if approval["state"] == "present":
                        approval_present += 1
                        value = approval["value"]
                        withdrawal = (r["fields"].get("withdrawal") or {})
                        if withdrawal.get("state") == "present" and isinstance(
                                withdrawal.get("value"), dict):
                            withdrawal["value"]["approvalDate"] = value
                        regulatory = (r["fields"].get("regulatory") or {})
                        if regulatory.get("state") == "present" and isinstance(
                                regulatory.get("value"), dict):
                            for juris in ("US", "EU"):
                                if juris in value and isinstance(regulatory["value"].get(juris),
                                                                 dict):
                                    regulatory["value"][juris]["approvalDate"] = value[juris]
            write_ndjson(path, rows)
            touched.append(path)
            log(f"      {rel(path)}: {len(rows)} pages")
            rep["doseStudiedPresent"] = dose_present
            rep["doseStudiedPages"] = dose_pages
            rep["doseStudiedHumanPages"] = human_pages
            rep["doseStudiedMousePages"] = mouse_pages
            rep["approvalDatePresent"] = approval_present
            checkpoint(rep, path, len(rows))
    rep["doseStudiedPresent"] = dose_present
    rep["doseStudiedPages"] = dose_pages
    rep["doseStudiedHumanPages"] = human_pages
    rep["doseStudiedMousePages"] = mouse_pages
    rep["approvalDatePresent"] = approval_present
    log(f"      doseStudied present on {dose_present} of {dose_pages} pages "
        f"(human {human_pages}, mouse {mouse_pages}); approvalDate present on {approval_present}")
    save_report(rep)


# ==================================================================== stage 6: display names

_ALPHA = re.compile(r"^[A-Za-z]+$")


def title_case_as_printed(name):
    """Title-case the UNII display name without touching a token that is not plain letters:
    a stereo descriptor, a locant or a formula fragment stays exactly as the register prints it."""
    out = []
    for token in name.split(" "):
        out.append(token[:1].upper() + token[1:].lower() if _ALPHA.match(token) else token)
    return " ".join(out)


def load_unii_names():
    names = defaultdict(set)
    with open(os.path.join(CORPUS, "raw", "fda-unii", "UNII_Names_4Aug2026.txt"),
              encoding="utf-8", errors="replace") as fh:
        reader = csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        i_name, i_unii, i_display = (header.index("NAME"), header.index("UNII"),
                                     header.index("DISPLAY_NAME"))
        for row in reader:
            if len(row) <= max(i_name, i_unii, i_display):
                continue
            names[row[i_unii]].add(norm(row[i_name]))
            names[row[i_unii]].add(norm(row[i_display]))
    display = {}
    with open(os.path.join(CORPUS, "raw", "fda-unii", "UNII_Records_4Aug2026.txt"),
              encoding="utf-8", errors="replace") as fh:
        reader = csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        i_unii, i_display = header.index("UNII"), header.index("DISPLAY_NAME")
        for row in reader:
            if len(row) > max(i_unii, i_display) and row[i_display]:
                display[row[i_unii]] = row[i_display]
    return names, display


def stage_names(rep):
    log("[6] display-name repair from the FDA UNII names file")
    unii_names, unii_display = load_unii_names()
    canonical_path = os.path.join(CORPUS, "identity", "canonical.ndjson")
    rows = list(read_ndjson(canonical_path))
    repairs = {}
    no_names_file = 0
    for r in rows:
        if r.get("keyRank") != "K1":
            continue
        unii = r["key"].split(":", 1)[1]
        known = unii_names.get(unii)
        if not known:
            no_names_file += 1
            continue
        old = r.get("displayName") or ""
        if norm(old) in known:
            continue
        printed = unii_display.get(unii)
        if not printed:
            continue
        new = title_case_as_printed(printed)
        if norm(new) == norm(old):
            continue
        repairs[r["key"]] = {"old": old, "new": new, "unii": unii, "uniiDisplayName": printed}
        r["displayName"] = new
        synonyms = r.get("synonyms") or []
        if old and not any(norm(s.get("name")) == norm(old) and s.get("kind") == "fragment"
                           for s in synonyms):
            synonyms.append({"name": old, "kind": "fragment", "source": "fda-unii-name-repair",
                             "note": ("the name this page carried before the FDA UNII names file "
                                      "for its own UNII was checked")})
        if not any(norm(s.get("name")) == norm(new) for s in synonyms):
            synonyms.insert(0, {"name": new, "kind": "display", "source": "fda-unii",
                                "sourceDate": DATE_UNII})
        r["synonyms"] = synonyms
    write_ndjson(canonical_path, rows)
    log(f"      {len(repairs)} K1 display names repaired "
        f"({no_names_file} K1 keys have no row in the UNII names file)")
    with open(os.path.join(WORK, "name-repairs.json"), "w", encoding="utf-8") as fh:
        json.dump(repairs, fh, indent=1, ensure_ascii=False)
    checkpoint(rep, canonical_path)

    def repair_display(path, changed_counter):
        rows = list(read_ndjson(path))
        changed = False
        for r in rows:
            fix = repairs.get(r.get("key"))
            if fix and r.get("displayName") == fix["old"]:
                r["displayName"] = fix["new"]
                changed = True
                changed_counter[0] += 1
        if changed:
            write_ndjson(path, rows)
        return changed

    touched = []
    counter = [0]
    for path in (os.path.join(CORPUS, "tiers", "model-assignment.ndjson"),
                 os.path.join(CORPUS, "suppression", "assignments.ndjson")):
        if repair_display(path, counter):
            touched.append(path)
            checkpoint(rep, path)
    for directory in (LONGEVITY_DIR, CLINICAL_DIR, DEVELOPMENT_DIR):
        for path in batch_paths(directory):
            if repair_display(path, counter):
                touched.append(path)
                checkpoint(rep, path)
    rep["namesRepaired"] = len(repairs)
    rep["nameRowsRewritten"] = counter[0]
    rep["nameExamples"] = [{"key": k, "from": v["old"], "to": v["new"], "unii": v["unii"]}
                           for k, v in sorted(repairs.items())[:20]]
    rep["nameTouchedFiles"] = [rel(p) for p in touched]
    if no_names_file:
        note_issue(rep, f"{no_names_file} K1 keys name a UNII with no row in "
                        f"UNII_Names_4Aug2026.txt; their display names were left untouched")
    with open(os.path.join(WORK, "name-repairs.json"), "w", encoding="utf-8") as fh:
        json.dump(repairs, fh, indent=1, ensure_ascii=False)
    save_report(rep)


# ==================================================================== stage 7: aggregates

def date_key(value):
    """A registry date is YYYY, YYYY-MM or YYYY-MM-DD; compare on the text the registry printed."""
    if not value:
        return ""
    parts = str(value).split("-")
    return "-".join([parts[0].zfill(4)] +
                    [p.zfill(2) for p in parts[1:]] +
                    ["00"] * (3 - len(parts)))


def stage_aggregates(rep):
    log("[7] registry aggregates: lastCompletionDate over completed studies")
    ct = load_ct_facts()
    matches = {}
    for path in batch_paths(MATCH_DIR):
        for r in read_ndjson(path):
            matches[r["key"]] = [h["nct"] for h in r["nctIds"]]
    repairs = {}
    path = os.path.join(WORK, "name-repairs.json")
    if os.path.exists(path):
        repairs = json.load(open(path, encoding="utf-8"))
    pages_with = 0
    files = []
    for path in batch_paths(AGGREGATE_DIR):
        rows = list(read_ndjson(path))
        for r in rows:
            fix = repairs.get(r["key"])
            if fix and r.get("displayName") == fix["old"]:
                r["displayName"] = fix["new"]
            best = None
            for nct in matches.get(r["key"], []):
                fact = ct.get(nct)
                if not fact or fact.get("status") != "COMPLETED":
                    continue
                value = fact.get("completionDate")
                if not value:
                    continue
                if best is None or date_key(value) > date_key(best["completionDate"]):
                    best = {"nct": nct, "completionDate": value}
            if best:
                pages_with += 1
                r["lastCompletionDate"] = {
                    "date": best["completionDate"],
                    "nct": best["nct"],
                    "over": "studies whose registry overall status is COMPLETED",
                    "source": {"kind": "clinicaltrials.gov", "id": best["nct"],
                               "url": f"https://clinicaltrials.gov/study/{best['nct']}",
                               "snapshot": CT_NOTE},
                    "sourceDate": DATE_CT,
                }
            else:
                r["lastCompletionDate"] = None
        write_ndjson(path, rows)
        files.append((path, len(rows)))
        log(f"      {rel(path)}: {len(rows)} rows")
        rep["lastCompletionDatePages"] = pages_with
        checkpoint(rep, path, len(rows), step=AGG_STEP)
    rep["lastCompletionDatePages"] = pages_with
    rep["aggregateFiles"] = len(files)
    save_report(rep)


# ==================================================================== stage 8: coverage + ledger

def stage_coverage(rep):
    log("[8] coverage")
    out = run([PY, "scripts/corpus-20k/fields/coverage.py"])
    result = json.loads(out.strip().splitlines()[-1])
    rep["tier1"] = result["tier1"]
    rep["longevityMedian"] = result["longevityMedian"]
    rep["coverage"] = result
    validation = result.get("validation") or {}
    for field_name in ("duplicateKeys", "modelMismatches", "unmodelledOrMissingFields"):
        if validation.get(field_name):
            note_issue(rep, f"coverage validation reports {validation[field_name]} {field_name}")
    if validation.get("keysWithAFieldRecord") != validation.get("keysInModelAssignment"):
        note_issue(rep, f"{validation['keysInModelAssignment'] - validation['keysWithAFieldRecord']}"
                        f" assigned pages hold no field record")
    save_report(rep)
    for path in (os.path.join(FIELDS_DIR, "coverage-summary.json"),
                 os.path.join(FIELDS_DIR, "coverage-report.md")):
        checkpoint(rep, path)


def stage_record(rep):
    log("[9] closing the ledger for step " + STEP)
    files = [os.path.join(CORPUS, "tiers", "model-assignment.ndjson"),
             os.path.join(CORPUS, "identity", "canonical.ndjson"),
             os.path.join(CORPUS, "suppression", "assignments.ndjson")]
    files += batch_paths(LONGEVITY_DIR) + batch_paths(CLINICAL_DIR)
    files += [D(p) for p in rep.get("touchedDevelopment") or []]
    files += [os.path.join(FIELDS_DIR, "coverage-summary.json"),
              os.path.join(FIELDS_DIR, "coverage-report.md")]
    ledger = rep.setdefault("batchNos", {})
    for path in files:
        if f"{STEP}\t{rel(path)}" not in ledger:
            checkpoint(rep, path)
    run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--done", AGG_STEP])
    run(["npx", "tsx", "scripts/corpus-20k/batch.ts", "--phase", PHASE, "--done", STEP])
    rep["recordedFiles"] = sum(1 for k in ledger if k.startswith(STEP + "\t"))
    rep["recordedAggregateFiles"] = sum(1 for k in ledger if k.startswith(AGG_STEP + "\t"))
    save_report(rep)


# ==================================================================== main

STAGES = [
    ("recut", stage_recut),
    ("moved", stage_moved),
    ("longevity", stage_longevity),
    ("ct-facts", stage_ct_facts),
    ("fields", stage_fields),
    ("names", stage_names),
    ("aggregates", stage_aggregates),
    ("coverage", stage_coverage),
    ("record", stage_record),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", default="all",
                    help="all, or one of: " + ", ".join(name for name, _ in STAGES))
    ap.add_argument("--from-stage", default=None)
    args = ap.parse_args()
    os.makedirs(WORK, exist_ok=True)
    rep = state_report()
    names = [n for n, _ in STAGES]
    if args.from_stage:
        start = names.index(args.from_stage)
        selected = names[start:]
    elif args.stage == "all":
        selected = names
    else:
        selected = [args.stage]
    for name, fn in STAGES:
        if name in selected:
            fn(rep)
    save_report(rep)
    print(json.dumps(rep, ensure_ascii=False))


if __name__ == "__main__":
    main()
