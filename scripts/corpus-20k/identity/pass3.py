#!/usr/bin/env python
"""Phase 5a step `identity-pass3` — the salt-named duplicates identity pass 2 could not reach.

Pass 2 recomputed a parent structure from every K1 page's own UNII SMILES and merged salt and
solvate forms onto the parent. A page with no structure on file — a biologic, a peptide, a
name-only record — has no SMILES to recompute, so `Oxytocin Acetate` and `Sermorelin Acetate` kept
their own pages beside `Oxytocin` and `Sermorelin`. Gate 2 named that as a defect.

The pass-3 rule (docs/specs/identity-resolution.md §3.1a):

    A structureless K1 page merges into another page when its UNII display name, with trailing salt
    and form words removed, equals that page's display name exactly. The survivor is the unsalted
    page. Rule id `M-SALT-P3`.

What it will not do:

  - It never merges a page that has a structure: those are pass 2's, decided on the structure.
  - It never strips an ester word (`enanthate`, `decanoate`, `furoate`, …). An ester is a distinct
    substance and splits under §3.2, so `Testosterone Enanthate` keeps its page.
  - It never merges when the stripped name matches more than one page, or matches no page. Both
    are recorded and left for a person.
  - It never invents the survivor. The survivor must already be a canonical page.

The salt and form vocabulary is the executor's own `SALT_AND_FORM_WORDS`, imported from
`scripts/corpus-20k/identity/resolve.py` rather than restated, plus the words the Phase 5a task
names. The words are removed only from the end of the name, one at a time, so `Sodium Chloride`
(both tokens are salt words, nothing is left in front) is never stripped to nothing.

Everything after the merge map is pass 2's work, not new code: this script loads
`scripts/corpus-20k/identity/pass2.py`, redirects its working directories, phase and rule id to
pass 3, hands it the pass-3 merge map, and runs its canonical, reconciliation, tiers, suppression,
registry-match, aggregate, field and coverage stages unchanged.

    .venv-corpus/bin/python scripts/corpus-20k/identity/pass3.py --stage detect
    .venv-corpus/bin/python scripts/corpus-20k/identity/pass3.py            # detect, then all
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PASS2_PATH = os.path.join(ROOT, "scripts", "corpus-20k", "identity", "pass2.py")

# Targeted substitutions, so pass 2's apply functions run as pass 3 without a second copy of them.
# Only the strings that name *this* pass are changed; the text that records the pass-2 ethane split
# is left exactly as pass 2 wrote it, because that split happened in pass 2.
SUBSTITUTIONS = [
    ('PHASE = "2c"', 'PHASE = "5a"'),
    ('"tmp", "corpus-20k-pass2"', '"tmp", "corpus-20k-pass3"'),
    ('CORPUS, "pass2-pre"', 'CORPUS, "pass3-pre"'),
    ('"merge-map-pass2.json"', '"merge-map-pass3.json"'),
    ('"slug-collisions-pass2.json"', '"slug-collisions-pass3.json"'),
    ('"pass2-summary.json"', '"pass3-summary.json"'),
    ('f"[pass2] {msg}"', 'f"[pass3] {msg}"'),
    ("M-SALT-P2", "M-SALT-P3"),
    ('"identity-pass2"', '"identity-pass3"'),
    ('"reconciliation-pass2"', '"reconciliation-pass3"'),
    ('"tiers-pass2"', '"tiers-pass3"'),
    ('"suppression-pass2"', '"suppression-pass3"'),
    ('"registry-matches-pass2"', '"registry-matches-pass3"'),
    ('"registry-aggregates-v3"', '"registry-aggregates-v4"'),
    ('"fields-pass2"', '"fields-pass3"'),
    ('"coverage-pass2"', '"coverage-pass3"'),
    ("(identity pass 2)", "(identity pass 3)"),
]


def load_pass2():
    with open(PASS2_PATH, encoding="utf-8") as fh:
        source = fh.read()
    for old, new in SUBSTITUTIONS:
        source = source.replace(old, new)
    spec = importlib.util.spec_from_file_location("corpus20k_pass3_apply", PASS2_PATH)
    module = importlib.util.module_from_spec(spec)
    module.__file__ = PASS2_PATH
    sys.modules["corpus20k_pass3_apply"] = module
    exec(compile(source, PASS2_PATH, "exec"), module.__dict__)
    return module


P2 = load_pass2()
log = P2.log
norm = P2.norm

# The salt and form words the Phase 5a task names, plus the executor's own vocabulary.
TASK_SALT_WORDS = {
    "acetate", "hydrochloride", "sulfate", "sodium", "potassium", "calcium", "mesylate",
    "citrate", "tartrate", "maleate", "succinate", "phosphate", "bromide", "chloride",
}


def salt_vocabulary(res):
    """`SALT_AND_FORM_WORDS` is a regular expression of alternatives; read its words back out of
    it rather than restating them, so the two passes cannot drift apart."""
    words = set(re.findall(r"[a-z]+", res.SALT_AND_FORM_WORDS.pattern))
    words -= {"b", "s", "r", "cesu"}                       # regex scaffolding, not words
    words |= TASK_SALT_WORDS
    words |= {"salt", "base", "sulphate", "hydrate", "anhydrous"}
    words -= res.ESTER_WORDS                               # an ester is its own substance (§3.2)
    return {w for w in words if len(w) >= 2}


def strip_trailing(name, vocabulary):
    """Remove trailing salt and form words, one at a time. Returns (stripped, removed words)."""
    parts = [p for p in norm(name).split(" ") if p]
    removed = []
    while len(parts) > 1 and parts[-1] in vocabulary:
        removed.append(parts.pop())
    return " ".join(parts), list(reversed(removed))


def survivor_is_a_moiety(page, smiles_by_unii):
    """Pass 2's skip, applied to the pass-3 survivor: no page merges onto a single atom, onto an
    inorganic-only record, or onto a name-only record no register identifies. Magnesium sulfate
    keeps its page rather than promoting the magnesium ion, exactly as lithium carbonate did."""
    from rdkit import Chem

    if page.get("keyRank") not in ("K1", "K2", "K3"):
        return False, "the only candidate is a name-only record (K4/COMBO/NONE)"
    smiles = (page.get("structure") or {}).get("smiles")
    if not smiles and page.get("unii"):
        smiles = smiles_by_unii.get(page["unii"])
    if not smiles:
        return True, None                       # a biologic or peptide: no structure to judge
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return True, None
    if mol.GetNumHeavyAtoms() < 2:
        return False, "the candidate is a single atom"
    if not any(a.GetSymbol() == "C" for a in mol.GetAtoms()):
        return False, "the candidate carries no carbon: an inorganic record, not a parent moiety"
    return True, None


def detect(rep):
    log("[1] detect: structureless K1 pages whose UNII display name is a salt of another page")
    res = P2.load_resolve()
    vocabulary = salt_vocabulary(res)
    smiles_by_unii, display_by_unii = P2.load_unii_records()
    pages = P2.load_canonical()

    by_display = defaultdict(list)
    for page in pages:
        by_display[norm(page.get("displayName"))].append(page["key"])
    by_key = {p["key"]: p for p in pages}

    merges = {}
    decisions = []
    ambiguous, no_parent, ester_blocked, not_a_moiety = [], [], [], []
    for page in pages:
        if page.get("keyRank") != "K1" or page.get("structure"):
            continue
        unii = page["key"].split(":", 1)[1]
        printed = display_by_unii.get(unii) or page.get("displayName") or ""
        stripped, removed = strip_trailing(printed, vocabulary)
        if not removed or len(stripped) < 3:
            continue
        last = norm(printed).split(" ")[-1]
        if last in res.ESTER_WORDS:
            ester_blocked.append({"key": page["key"], "name": printed})
            continue
        candidates = [k for k in by_display.get(stripped, []) if k != page["key"]]
        if not candidates:
            no_parent.append({"key": page["key"], "name": printed, "stripped": stripped})
            continue
        if len(candidates) > 1:
            ambiguous.append({"key": page["key"], "name": printed, "stripped": stripped,
                              "candidates": candidates})
            continue
        survivor = candidates[0]
        if by_key[survivor].get("keyRank") == "HOLD":
            ambiguous.append({"key": page["key"], "name": printed, "stripped": stripped,
                              "candidates": candidates,
                              "note": "the only candidate is a held K1/K2 conflict"})
            continue
        ok, why = survivor_is_a_moiety(by_key[survivor], smiles_by_unii)
        if not ok:
            not_a_moiety.append({"key": page["key"], "name": printed, "candidate": survivor,
                                 "candidateName": by_key[survivor].get("displayName"),
                                 "why": why})
            continue
        merges[page["key"]] = survivor
        decisions.append({
            "at": P2.NOW, "decision": "merge", "ruleId": "M-SALT-P3",
            "key": survivor, "keyRank": by_key[survivor].get("keyRank"),
            "mergedKey": page["key"],
            "evidence": {"uniiDisplayName": printed, "saltWordsRemoved": removed,
                         "survivorDisplayName": by_key[survivor].get("displayName"),
                         "structure": None},
            "note": ("the merged page has no structure on file, so pass 2 could not reach it; its "
                     "UNII display name minus trailing salt and form words is the survivor's "
                     "display name exactly"),
        })

    # a merged page must never also be a survivor: follow the chain to the page that survives
    for _ in range(4):
        changed = False
        for old, new in list(merges.items()):
            while new in merges:
                new = merges[new]
                changed = True
            if new == old:
                del merges[old]
                changed = True
            else:
                merges[old] = new
        if not changed:
            break

    rep["merges"] = merges
    rep["mergesP3"] = len(merges)
    rep["splitsP3"] = 0
    rep["detectCounts"] = {
        "structurelessK1Pages": sum(1 for p in pages
                                    if p.get("keyRank") == "K1" and not p.get("structure")),
        "merges": len(merges),
        "saltNamedWithNoParentPage": len(no_parent),
        "ambiguousParent": len(ambiguous),
        "esterNamesLeftSplit": len(ester_blocked),
        "candidateNotAParentMoiety": len(not_a_moiety),
        "saltWordsUsed": len(vocabulary),
    }
    rep["blockedNoParentPage"] = no_parent[:200]
    rep["multiSurvivorGroups"] = ambiguous[:200]
    rep["esterBlocked"] = ester_blocked[:200]
    rep["blockedNotAMoiety"] = not_a_moiety[:200]

    # decisions.ndjson is append-only history: the pass-3 rows are added, nothing is rewritten
    P2.preserve(P2.DECISIONS)
    with open(P2.DECISIONS, "a", encoding="utf-8") as fh:
        for row in decisions:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    P2.checkpoint(rep, P2.DECISIONS, "identity-pass3")
    P2.write_json(P2.MERGE_MAP, merges)
    P2.checkpoint(rep, P2.MERGE_MAP, "identity-pass3", len(merges))

    log(f"      {len(merges)} merges · {len(no_parent)} salt-named pages with no parent page · "
        f"{len(ambiguous)} ambiguous · {len(ester_blocked)} ester names left split · "
        f"{len(not_a_moiety)} candidates that are not a parent moiety · "
        f"{len(vocabulary)} salt and form words")
    P2.save_report(rep)
    P2.done_stage(rep, "detect")
    return rep


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage", default="all",
                        choices=["all", "detect", "report"] + [n for n, _ in P2.STAGES if n != "detect"])
    args = parser.parse_args()
    os.makedirs(P2.WORK, exist_ok=True)
    os.makedirs(P2.PRE, exist_ok=True)
    rep = P2.state_report()
    if args.stage in ("all", "detect") and "detect" not in rep.get("stages", []):
        detect(rep)
    for name, fn in P2.STAGES:
        if name == "detect" or args.stage not in ("all", name):
            continue
        if name in rep.get("stages", []) and args.stage == "all":
            log(f"[skip] {name}: already completed in this run")
            continue
        if "merges" not in rep:
            raise SystemExit("run --stage detect first: the merge map is not in tmp/.../report.json")
        fn(rep)
    if args.stage in ("all", "report"):
        rep["mergesP2"] = rep.get("mergesP3", 0)
        rep["splitsP2"] = 0
        P2.stage_report(rep)


if __name__ == "__main__":
    main()
