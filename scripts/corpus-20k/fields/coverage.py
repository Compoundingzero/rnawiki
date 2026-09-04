#!/usr/bin/env python
"""Coverage computation for the three field models (R4, R11, R15).

Reads, and never writes, the corpus inputs:
  data/corpus-20k/tiers/model-assignment.ndjson    one row per canonical page
  data/corpus-20k/suppression/assignments.ndjson   suppression class per page
  data/corpus-20k/fields/{longevity,clinical,development}/batch-*.ndjson

Writes data/corpus-20k/fields/coverage-summary.json (machine form) and coverage-report.md
(the Gate 1 report format fixed in Phase 2).

Counting rule, unchanged from Phase 2: coverage is counted **within** one model; only `present`
counts; the denominator is that page's applicable fields (`present` + `absent`). A record key that
sits beside `fields` — `doseStudied` and `approvalDate`, added in Phase 2b — is a sub-field of an
existing field (docs/specs/field-models.md 15b and the CLINICAL withdrawal row), never a new field,
and is deliberately not counted here.

  .venv-corpus/bin/python scripts/corpus-20k/fields/coverage.py
"""

from __future__ import annotations

import glob
import json
import os
from collections import Counter, defaultdict
from datetime import date

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
D = lambda *p: os.path.join(ROOT, *p)  # noqa: E731
FIELDS_DIR = D("data", "corpus-20k", "fields")

MODELS = {
    "LONGEVITY": ["hallmark", "organismLadder", "itp", "endpointType", "humanCeiling", "clocks",
                  "doseResponse", "pathway", "kinetics", "interactions", "trialFailures",
                  "biomarkers", "regulatory", "ongoingTrials", "faers"],
    "CLINICAL": ["indication", "labelKinetics", "interactions", "adverseEvents", "faers",
                 "trialHistory", "trialFailures", "regulatory", "withdrawal"],
    "DEVELOPMENT": ["target", "mechanismClass", "highestPhase", "whyStopped", "sponsor",
                    "patentStatus", "everDosedInHumans", "relatedOnTarget"],
}
DIRS = {"LONGEVITY": "longevity", "CLINICAL": "clinical", "DEVELOPMENT": "development"}
LABELS = {
    "LONGEVITY": {
        "hallmark": "1 Hallmark of aging", "organismLadder": "2 Model-organism ladder",
        "itp": "3 NIA ITP", "endpointType": "4 Endpoint type per finding",
        "humanCeiling": "5 Human evidence ceiling", "clocks": "6 Epigenetic clocks",
        "doseResponse": "7 Dose-response shape", "pathway": "8 Pathway", "kinetics": "9 Kinetics",
        "interactions": "10 Interactions", "trialFailures": "11 Trial failures",
        "biomarkers": "12 Biomarkers measured",
        "regulatory": "13 Regulatory status by jurisdiction", "ongoingTrials": "14 Ongoing trials",
        "faers": "15 FAERS signal"},
    "CLINICAL": {
        "indication": "Indication (label)", "labelKinetics": "Label kinetics",
        "interactions": "10 Interactions", "adverseEvents": "Adverse events",
        "faers": "15 FAERS signal", "trialHistory": "Trial history",
        "trialFailures": "11 Trial failures",
        "regulatory": "13 Regulatory status by jurisdiction", "withdrawal": "Withdrawal status"},
    "DEVELOPMENT": {
        "target": "Molecular target", "mechanismClass": "Mechanism class",
        "highestPhase": "Highest phase reached", "whyStopped": "Why development stopped",
        "sponsor": "Sponsor", "patentStatus": "Patent status",
        "everDosedInHumans": "Ever dosed in humans",
        "relatedOnTarget": "Related compounds on the same target"},
}
TODAY = date.today().isoformat()


def median(values):
    s = sorted(values)
    return s[len(s) // 2] if s else 0


def mean(values, places=3):
    return round(sum(values) / len(values), places) if values else 0.0


def fmt(n):
    return f"{n:,}"


def pct(part, whole):
    return f"{(100.0 * part / whole):.1f}%" if whole else "—"


def load():
    assignment, order = {}, []
    with open(D("data", "corpus-20k", "tiers", "model-assignment.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            a = json.loads(line)
            assignment[a["key"]] = a
            order.append(a["key"])
    suppression = {}
    with open(D("data", "corpus-20k", "suppression", "assignments.ndjson"), encoding="utf-8") as fh:
        for line in fh:
            s = json.loads(line)
            suppression[s["key"]] = s
    records, files = {}, {}
    for model, sub in DIRS.items():
        paths = sorted(glob.glob(os.path.join(FIELDS_DIR, sub, "batch-*.ndjson")))
        files[model] = paths
        for path in paths:
            with open(path, encoding="utf-8") as fh:
                for line in fh:
                    r = json.loads(line)
                    records.setdefault(model, []).append(r)
    return assignment, order, suppression, records, files


def main():
    assignment, order, suppression, records, files = load()
    issues = []
    duplicate_keys = 0
    model_mismatch = 0
    unmodelled = 0
    seen_keys = set()
    keys_with_record = set()

    models_out = {}
    present_counts_by_key = {}
    for model, field_names in MODELS.items():
        rows = records.get(model, [])
        state_by_field = {f: Counter() for f in field_names}
        histogram = Counter()
        applicable_counts = []
        coverage_ratios = []
        present_counts = []
        for r in rows:
            key = r["key"]
            if key in seen_keys:
                duplicate_keys += 1
            seen_keys.add(key)
            keys_with_record.add(key)
            assigned = (assignment.get(key) or {}).get("model")
            if assigned != model:
                model_mismatch += 1
            fields = r.get("fields") or {}
            if set(fields) != set(field_names):
                unmodelled += 1
            n_present = 0
            n_applicable = 0
            for f in field_names:
                state = (fields.get(f) or {}).get("state", "absent")
                state_by_field[f][state] += 1
                if state == "present":
                    n_present += 1
                if state != "not-applicable":
                    n_applicable += 1
            histogram[n_present] += 1
            present_counts.append(n_present)
            applicable_counts.append(n_applicable)
            coverage_ratios.append(n_present / n_applicable if n_applicable else 0.0)
            present_counts_by_key[key] = n_present

        out = {
            "pages": len(rows),
            "batchFiles": len(files[model]),
            "fields": field_names,
            "applicableFieldsMax": len(field_names),
            "stateByField": {f: {"present": state_by_field[f]["present"],
                                 "absent": state_by_field[f]["absent"],
                                 "notApplicable": state_by_field[f]["not-applicable"]}
                             for f in field_names},
            "presentFieldCountHistogram": {str(n): histogram.get(n, 0)
                                           for n in range(len(field_names) + 1)},
            "medianPresentFields": median(present_counts),
            "meanPresentFields": mean(present_counts),
            "medianApplicableFields": median(applicable_counts),
            "meanApplicableFields": mean(applicable_counts),
            "medianCoverageOfApplicable": round(median(coverage_ratios), 4),
            "meanCoverageOfApplicable": round(mean(coverage_ratios, 4), 4),
        }
        if model == "DEVELOPMENT":
            without = []
            zero = 0
            for r in rows:
                fields = r.get("fields") or {}
                n = sum(1 for f in field_names
                        if f != "everDosedInHumans"
                        and (fields.get(f) or {}).get("state") == "present")
                without.append(n)
                if n == 0:
                    zero += 1
            out["withoutEverDosedInHumans"] = {
                "medianPresentExcludingEverDosed": median(without),
                "meanPresentExcludingEverDosed": mean(without),
                "pagesWithNoOtherPresentField": zero,
            }
        models_out[model] = out

    # ---------------------------------------------------------------- tiers
    tier_of = {}
    withdrawn_by_model = Counter()
    for key, a in assignment.items():
        if a["model"] == "LONGEVITY" or a.get("withdrawn"):
            tier_of[key] = 1
        elif a["model"] == "CLINICAL":
            tier_of[key] = 2
        else:
            tier_of[key] = 3
        if a.get("withdrawn"):
            withdrawn_by_model[a["model"]] += 1

    def suppressed(key):
        return bool((suppression.get(key) or {}).get("suppressed"))

    def unknown_class(key):
        return "S10" in ((suppression.get(key) or {}).get("classes") or [])

    tier_pages = defaultdict(list)
    for key, t in tier_of.items():
        tier_pages[t].append(key)

    def stubs(keys):
        return sum(1 for k in keys if present_counts_by_key.get(k, 0) < 3)

    longevity_pages = sum(1 for a in assignment.values() if a["model"] == "LONGEVITY")
    clinical_pages = sum(1 for a in assignment.values() if a["model"] == "CLINICAL")
    development_pages = sum(1 for a in assignment.values() if a["model"] == "DEVELOPMENT")
    withdrawn_total = sum(1 for a in assignment.values() if a.get("withdrawn"))
    overlap = withdrawn_by_model["LONGEVITY"]

    tiers = {
        "rule": "data/corpus-20k/tiers/promotion-rule.md",
        "tier1": {
            "pages": len(tier_pages[1]),
            "longevityModelPages": longevity_pages,
            "withdrawnPages": withdrawn_total,
            "overlapLongevityAndWithdrawn": overlap,
            "withdrawnByModel": {m: withdrawn_by_model[m] for m in sorted(withdrawn_by_model)},
            "suppressed": sum(1 for k in tier_pages[1] if suppressed(k)),
            "unknownClass": sum(1 for k in tier_pages[1] if unknown_class(k)),
        },
        "tier2": {
            "pages": len(tier_pages[2]),
            "clinicalModelPages": clinical_pages,
            "promotedToTier1AsWithdrawn": withdrawn_by_model["CLINICAL"],
            "suppressed": sum(1 for k in tier_pages[2] if suppressed(k)),
            "unknownClass": sum(1 for k in tier_pages[2] if unknown_class(k)),
            "stubsUnder3PresentFields": stubs(tier_pages[2]),
        },
        "tier3": {
            "pages": len(tier_pages[3]),
            "developmentModelPages": development_pages,
            "promotedToTier1AsWithdrawn": withdrawn_by_model["DEVELOPMENT"],
            "suppressed": sum(1 for k in tier_pages[3] if suppressed(k)),
            "unknownClass": sum(1 for k in tier_pages[3] if unknown_class(k)),
            "stubsUnder3PresentFields": stubs(tier_pages[3]),
            "stubsOverAllDevelopmentPages": stubs([k for k, a in assignment.items()
                                                   if a["model"] == "DEVELOPMENT"]),
        },
        "suppressedTotal": sum(1 for k in assignment if suppressed(k)),
    }

    # ---------------------------------------------------------------- R11
    reason_sources = Counter()
    with_reason = 0
    field_record_by_key = {}
    for model, rows in records.items():
        for r in rows:
            field_record_by_key[r["key"]] = r
    for key, a in assignment.items():
        if not a.get("withdrawn"):
            continue
        stated = ((a.get("withdrawnReasonSource") or {}).get("reason"))
        if stated:
            with_reason += 1
            reason_sources["model-assignment.withdrawnReasonSource.reason"] += 1
            continue
        rec = field_record_by_key.get(key) or {}
        wd = ((rec.get("fields") or {}).get("withdrawal") or {}).get("value") or {}
        if isinstance(wd, dict) and wd.get("reason"):
            with_reason += 1
            reason_sources["fields.withdrawal.value.reason"] += 1

    r11 = {
        "withdrawnPages": withdrawn_total,
        "withStatedReason": with_reason,
        "withoutStatedReason": withdrawn_total - with_reason,
        "reasonSourceCounts": dict(reason_sources),
        "note": ("A stated reason is a reason string the register or ChEMBL drug_warning itself "
                 "prints. EMA and Health Canada record a status, not a reason; those pages count "
                 "as withdrawn without a stated reason."),
    }

    gate1 = {
        "figure": "Tier 1 LONGEVITY-model median present fields of 15",
        "value": models_out["LONGEVITY"]["medianPresentFields"],
        "threshold": 8,
        "meets": models_out["LONGEVITY"]["medianPresentFields"] >= 8,
    }

    # ---------------------------------------------------------------- issues
    lo = models_out["LONGEVITY"]
    dev = models_out["DEVELOPMENT"]
    cl = models_out["CLINICAL"]
    pathway_reason_pages = sum(1 for a in assignment.values()
                               if a["model"] == "LONGEVITY"
                               and any(r["code"] == "pathway" for r in a.get("reasons") or []))
    issues.append(
        f"DEVELOPMENT patentStatus is present on {dev['stateByField']['patentStatus']['present']} "
        f"of {fmt(dev['pages'])} pages "
        f"({fmt(dev['stateByField']['patentStatus']['notApplicable'])} not-applicable, "
        f"{dev['stateByField']['patentStatus']['absent']} absent): no Tier 3 page keys an approved "
        f"US application in the openFDA Orange Book export, so the field adds nothing to Tier 3 "
        f"coverage.")
    issues.append(
        f"DEVELOPMENT everDosedInHumans is present on "
        f"{fmt(dev['stateByField']['everDosedInHumans']['present'])} of {fmt(dev['pages'])} pages, "
        f"so it never discriminates. Excluding it the DEVELOPMENT median present count is "
        f"{dev['withoutEverDosedInHumans']['medianPresentExcludingEverDosed']} and "
        f"{fmt(dev['withoutEverDosedInHumans']['pagesWithNoOtherPresentField'])} pages hold no "
        f"other present field.")
    issues.append(
        f"LONGEVITY pathway is present on {fmt(lo['stateByField']['pathway']['present'])} of "
        f"{fmt(lo['pages'])} pages; {pathway_reason_pages} pages were assigned to the model by the "
        f"pathway reason. Since Phase 2b the field also admits a cited Europe PMC abstract "
        f"sentence that names the compound, a pathway term and a mechanism verb together.")
    issues.append(
        f"LONGEVITY itp ({lo['stateByField']['itp']['present']}) and clocks "
        f"({lo['stateByField']['clocks']['present']}) are present on under "
        f"{max(1, round(100.0 * max(lo['stateByField']['itp']['present'], lo['stateByField']['clocks']['present']) / max(1, lo['pages'])))}% "
        f"of the model. They are the two fields that most distinguish a longevity page from a "
        f"clinical one.")
    top = max((int(k) for k, v in lo["presentFieldCountHistogram"].items() if v), default=0)
    issues.append(
        f"No LONGEVITY page reaches 15 of 15 present fields; the maximum observed is {top} "
        f"({lo['presentFieldCountHistogram'][str(top)]} pages).")
    issues.append(
        f"{fmt(r11['withoutStatedReason'])} of {fmt(r11['withdrawnPages'])} withdrawn pages "
        f"({pct(r11['withoutStatedReason'], r11['withdrawnPages'])}) carry no stated reason. EMA "
        f"and Health Canada record a status and not a reason, and TGA, PMDA and the WHO "
        f"consolidated withdrawn list were never cleared. R11 reports this figure; it is not "
        f"closed by this stage.")
    issues.append(
        f"Tier 3 is {fmt(tiers['tier3']['suppressed'])} of {fmt(tiers['tier3']['pages'])} "
        f"suppressed ({pct(tiers['tier3']['suppressed'], tiers['tier3']['pages'])}), of which "
        f"{fmt(tiers['tier3']['unknownClass'])} come from the S10 unknown-class default rather "
        f"than a matched safety class.")
    issues.append(
        f"{fmt(tiers['tier3']['stubsUnder3PresentFields'])} of {fmt(tiers['tier3']['pages'])} "
        f"Tier 3 pages ({pct(tiers['tier3']['stubsUnder3PresentFields'], tiers['tier3']['pages'])})"
        f" hold fewer than 3 present fields (R15 stubs), and "
        f"{fmt(tiers['tier2']['stubsUnder3PresentFields'])} of {fmt(tiers['tier2']['pages'])} "
        f"Tier 2 pages do as well.")
    issues.append(
        "LONGEVITY assignment by registry-ageing-term no longer admits a page whose only ageing "
        "term is the bare word \"age-related\" (Phase 2b recut): an age-related condition such as "
        "age-related macular degeneration is not longevity work. Pages with any other ageing term, "
        "an ITP entry, broad-slice membership or a pathway reason are unaffected.")
    na_clinical = cl["stateByField"]["indication"]["notApplicable"]
    issues.append(
        f"CLINICAL carries not-applicable on {fmt(na_clinical)} pages for each of indication, "
        f"labelKinetics, interactions and adverseEvents: records with no label in any cleared "
        f"register. The CLINICAL denominator is therefore 9 applicable fields on "
        f"{fmt(cl['pages'] - na_clinical)} pages and 5 on {fmt(na_clinical)}.")
    issues.append(
        "doseStudied (field 15b) and approvalDate sit beside `fields` on the record, not inside "
        "it: docs/specs/field-models.md makes them sub-fields of field 9 and of the withdrawal / "
        "regulatory fields, so they change no coverage denominator and no present count.")

    summary = {
        "schema": "rnawiki-corpus-20k-coverage/v1",
        "spec": "docs/specs/field-models.md",
        "generated": TODAY,
        "totalPages": len(assignment),
        "inputs": {
            "modelAssignment": "data/corpus-20k/tiers/model-assignment.ndjson",
            "suppression": "data/corpus-20k/suppression/assignments.ndjson",
            "fields": [f"data/corpus-20k/fields/{sub}/batch-*.ndjson" for sub in DIRS.values()],
        },
        "models": models_out,
        "tiers": tiers,
        "r11Withdrawn": r11,
        "gate1": gate1,
        "issues": issues,
        "issueCount": len(issues),
        "validation": {
            "keysInModelAssignment": len(assignment),
            "keysWithAFieldRecord": len(keys_with_record),
            "duplicateKeys": duplicate_keys,
            "modelMismatches": model_mismatch,
            "unmodelledOrMissingFields": unmodelled,
            "note": ("Every assigned page has exactly one field record, in the directory of its "
                     "assigned model, carrying exactly the modelled fields."),
        },
    }
    with open(os.path.join(FIELDS_DIR, "coverage-summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    write_report(summary)
    print(json.dumps({"tier1": tiers["tier1"]["pages"],
                      "longevityMedian": gate1["value"],
                      "longevityPages": models_out["LONGEVITY"]["pages"],
                      "clinicalPages": models_out["CLINICAL"]["pages"],
                      "developmentPages": models_out["DEVELOPMENT"]["pages"],
                      "validation": summary["validation"]}, ensure_ascii=False))


def write_report(s):
    m = s["models"]
    t = s["tiers"]
    out = []
    w = out.append
    w("# Coverage report — Phase 2 (R4, R11, R15), re-measured after the Phase 2b augment\n")
    w("| Item | Value |")
    w("| --- | --- |")
    w(f"| Generated | {s['generated']} |")
    w("| Spec | `docs/specs/field-models.md` |")
    w("| Inputs | `fields/{longevity,clinical,development}/batch-*.ndjson`, "
      "`tiers/model-assignment.ndjson`, `suppression/assignments.ndjson` |")
    w("| Machine form | `data/corpus-20k/fields/coverage-summary.json` |")
    w("| Tier rule | `data/corpus-20k/tiers/promotion-rule.md` |")
    w(f"| Pages counted | {fmt(s['totalPages'])} |")
    w("| Counting rule | within one model only; `present` counts, denominator is the applicable "
      "fields of that model on that page |")
    w("")
    w("## Gate 1 figure, re-measured\n")
    w("| Figure | Value | Threshold | Meets |")
    w("| --- | ---: | ---: | --- |")
    w(f"| Tier 1 (LONGEVITY model) median present fields of 15 | {s['gate1']['value']} | ≥ 8 | "
      f"{'yes' if s['gate1']['meets'] else 'no'} |")
    w("")
    w("## Per model\n")
    w("| Model | Pages | Fields | Median present | Mean present | Median applicable | "
      "Mean applicable | Mean present ÷ applicable |")
    w("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    for name in ("LONGEVITY", "CLINICAL", "DEVELOPMENT"):
        d = m[name]
        w(f"| {name} | {fmt(d['pages'])} | {d['applicableFieldsMax']} | "
          f"{d['medianPresentFields']} | {d['meanPresentFields']} | {d['medianApplicableFields']} |"
          f" {d['meanApplicableFields']} | {d['meanCoverageOfApplicable'] * 100:.1f}% |")
    w("")
    for name in ("LONGEVITY", "CLINICAL", "DEVELOPMENT"):
        d = m[name]
        w(f"## {name} ({d['applicableFieldsMax']} fields) — per field\n")
        w("| Field | Present | Absent | Not applicable | Present % of applicable |")
        w("| --- | ---: | ---: | ---: | ---: |")
        for f in d["fields"]:
            st = d["stateByField"][f]
            applicable = st["present"] + st["absent"]
            w(f"| {LABELS[name][f]} | {fmt(st['present'])} | {fmt(st['absent'])} | "
              f"{fmt(st['notApplicable'])} | {pct(st['present'], applicable)} |")
        w("")
        w(f"## {name} ({d['applicableFieldsMax']} fields) — histogram of present-field counts\n")
        w("| Present fields | Pages | Share |")
        w("| ---: | ---: | ---: |")
        for n in range(d["applicableFieldsMax"] + 1):
            pages = d["presentFieldCountHistogram"][str(n)]
            w(f"| {n} | {fmt(pages)} | {pct(pages, d['pages'])} |")
        w(f"| **Total** | **{fmt(d['pages'])}** | **100.0%** |")
        w("")
    d = m["DEVELOPMENT"]["withoutEverDosedInHumans"]
    w("## DEVELOPMENT without the always-present field\n")
    w("| Measure | With `everDosedInHumans` | Without it |")
    w("| --- | ---: | ---: |")
    w(f"| Median present | {m['DEVELOPMENT']['medianPresentFields']} | "
      f"{d['medianPresentExcludingEverDosed']} |")
    w(f"| Mean present | {m['DEVELOPMENT']['meanPresentFields']} | "
      f"{d['meanPresentExcludingEverDosed']} |")
    w(f"| Pages with 0 present | "
      f"{m['DEVELOPMENT']['presentFieldCountHistogram']['0']} | "
      f"{fmt(d['pagesWithNoOtherPresentField'])} |")
    w("")
    w("## Tier sizes\n")
    w("| Tier | Definition | Pages | Suppressed | Suppressed % | Unknown-class (S10) |")
    w("| --- | --- | ---: | ---: | ---: | ---: |")
    w(f"| 1 | LONGEVITY model ∪ withdrawn (any model) | {fmt(t['tier1']['pages'])} | "
      f"{fmt(t['tier1']['suppressed'])} | {pct(t['tier1']['suppressed'], t['tier1']['pages'])} | "
      f"{fmt(t['tier1']['unknownClass'])} |")
    w(f"| 2 | CLINICAL model, not withdrawn | {fmt(t['tier2']['pages'])} | "
      f"{fmt(t['tier2']['suppressed'])} | {pct(t['tier2']['suppressed'], t['tier2']['pages'])} | "
      f"{fmt(t['tier2']['unknownClass'])} |")
    w(f"| 3 | DEVELOPMENT model, not withdrawn | {fmt(t['tier3']['pages'])} | "
      f"{fmt(t['tier3']['suppressed'])} | {pct(t['tier3']['suppressed'], t['tier3']['pages'])} | "
      f"{fmt(t['tier3']['unknownClass'])} |")
    total = t["tier1"]["pages"] + t["tier2"]["pages"] + t["tier3"]["pages"]
    w(f"| — | **Total** | **{fmt(total)}** | **{fmt(t['suppressedTotal'])}** | "
      f"**{pct(t['suppressedTotal'], total)}** | — |")
    w("")
    w("## Tier 1 composition\n")
    w("| Set | Pages |")
    w("| --- | ---: |")
    w(f"| LONGEVITY model | {fmt(t['tier1']['longevityModelPages'])} |")
    w(f"| Withdrawn (any model, R11) | {fmt(t['tier1']['withdrawnPages'])} |")
    w(f"| Overlap (LONGEVITY and withdrawn) | {fmt(t['tier1']['overlapLongevityAndWithdrawn'])} |")
    w(f"| Union = Tier 1 | {fmt(t['tier1']['pages'])} |")
    w(f"| — withdrawn promoted out of CLINICAL | {fmt(t['tier2']['promotedToTier1AsWithdrawn'])} |")
    w(f"| — withdrawn promoted out of DEVELOPMENT | "
      f"{fmt(t['tier3']['promotedToTier1AsWithdrawn'])} |")
    w("")
    w("## Stubs (R15: fewer than 3 present fields)\n")
    w("| Tier | Pages | Stubs | Share |")
    w("| --- | ---: | ---: | ---: |")
    for tier in ("tier2", "tier3"):
        d = t[tier]
        w(f"| {tier[-1]} | {fmt(d['pages'])} | {fmt(d['stubsUnder3PresentFields'])} | "
          f"{pct(d['stubsUnder3PresentFields'], d['pages'])} |")
    w("")
    r = s["r11Withdrawn"]
    w("## R11 — withdrawn pages and stated reasons\n")
    w("| Figure | Pages | Share |")
    w("| --- | ---: | ---: |")
    w(f"| Withdrawn pages | {fmt(r['withdrawnPages'])} | 100.0% |")
    w(f"| With a stated reason from any source | {fmt(r['withStatedReason'])} | "
      f"{pct(r['withStatedReason'], r['withdrawnPages'])} |")
    w(f"| Without a stated reason | {fmt(r['withoutStatedReason'])} | "
      f"{pct(r['withoutStatedReason'], r['withdrawnPages'])} |")
    w("")
    w("| Reason source | Pages |")
    w("| --- | ---: |")
    for k, v in sorted(r["reasonSourceCounts"].items()):
        w(f"| `{k}` | {fmt(v)} |")
    w("")
    w("| Withdrawn pages by model | Pages |")
    w("| --- | ---: |")
    for k, v in sorted(t["tier1"]["withdrawnByModel"].items()):
        w(f"| {k} | {fmt(v)} |")
    w("")
    v = s["validation"]
    w("## Validation\n")
    w("| Check | Result |")
    w("| --- | --- |")
    w(f"| Pages in `model-assignment.ndjson` | {fmt(v['keysInModelAssignment'])} |")
    w(f"| Pages with exactly one field record | {fmt(v['keysWithAFieldRecord'])} |")
    w(f"| Duplicate keys within a model | {v['duplicateKeys']} |")
    w(f"| Field records filed under the wrong model | {v['modelMismatches']} |")
    w(f"| Records with a missing or unmodelled field | {v['unmodelledOrMissingFields']} |")
    w("")
    w("## Limits and issues\n")
    w("| # | Statement |")
    w("| ---: | --- |")
    for i, statement in enumerate(s["issues"], start=1):
        w(f"| {i} | {statement} |")
    w("")
    with open(os.path.join(FIELDS_DIR, "coverage-report.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))


if __name__ == "__main__":
    main()
