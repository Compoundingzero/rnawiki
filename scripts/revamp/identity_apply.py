#!/usr/bin/env python
"""Step 3.4 application: execute the adjudicated identity decisions against canonical-v2.

Input is the lead's adjudication, not a new judgment. `data/revamp/identity/apply-list.csv` holds
the rows the identity rules already license (13 rows, 10 distinct pairs, LICENSED-MERGE and
LICENSED-FORM_OF); `data/revamp/identity/hold-list.csv` holds the 64 pairs that stay exactly as
they are. This script applies the first list, leaves the second untouched, and records what it
refused.

What it does, in this order:

1.  **Merges, with a transitive-closure check.** The licensed merges are unioned one at a time on
    top of the merges canonical-v2 already carries (`mergedFrom`). Before a merge is kept, the
    component it would create is tested against every pair the corpus records as separated - the
    `EXCEPTION-*` decisions of step 3.2 (combination, biosimilar, isotopologue, metal-complex,
    ester), the `EXCEPTION-*` relation rows, and every held pair - and against a live structural
    re-run of `identity_resolve.exception_class` over each new pair inside the component. A merge
    that would join two separated pages is refused, reverted and listed with the pair that blocked
    it. The citrate rows are applied first, so a held pair that names a citrate page is re-expressed
    against the surviving page before anyone reopens it (`hold-list-v3.csv`).

2.  **Licensed form-of links.** Each LICENSED-FORM_OF pair keeps two pages and carries an edge in
    both directions. The note is generated from the structure difference by
    `identity_resolve.form_note` (docs/specs/phase4-generators.md section 6, identity-resolution.md
    sections 3.1-3.8): the child-to-parent edge takes the relation and sentence that difference
    produces, the parent-to-child edge is the `form_of` back-reference. Edges already recorded by
    step 3.2 are confirmed, not duplicated.

3.  **Trial reassignment extended from stereo descriptors to salt and ester forms.** Step 3.2's
    rule R14 moved a registry study off a stereo-split child page when the study's intervention
    named the parent. Section 6 of the generator spec extends the same rule to salt, hydrate and
    ester forms: `A form page renders only facts recorded against the form itself`. A page is a form
    of a parent when removing one trailing salt, hydrate, ester or counter-ion token at a time from
    its printed name (`scripts/revamp/salts.txt`, `ESTER_WORDS`, `CATION_WORDS`, plus the
    hemi/mono/di/tri/tetra/penta/sesqui/bis/tris prefixes those files already spell out on other
    entries) reaches a name exactly one other live page prints. A study on the form page moves to
    the parent when every registry intervention recorded for that study on the form page is that
    parent name. Where two or more pages print the same stripped name, or none does, no study moves
    and the reason is counted.

4.  **Biosimilars (docs/specs/phase4-generators.md section 11).** The FDA Purple Book decides
    which of the pages carrying a four-letter suffix is a biosimilar and of what: the row whose
    `proper_name` is the name the page itself prints, licensed under `351(k)`, names the reference
    product. Where that reference product is the name printed by the one live page the
    `biosimilar_of` relation points at, the relation's note becomes the sentence the page opens
    with - `X is a biosimilar of Y` - and a registry study whose every recorded intervention on the
    biosimilar page names only that reference product moves to the reference page
    (`R14c-REFERENCE-PRODUCT-TRIAL`). A suffixed page the Purple Book licenses under `351(a)` is a
    biologic in its own right, not a biosimilar; its note is left exactly as Phase 3 wrote it and
    no study moves off it.

5.  **The section 12 corrections, written as the v5 revision.** Three things measure 2 found, all
    of them decided by a register and none of them by this script:

    *   **351(a) merges.** The FDA gives every biological proper name a four-letter suffix, and
        Phase 3 read the suffix as the mark of a biosimilar. Where the Purple Book licenses the
        page's own proper name under `351(a)` and the page's UNII is the unsuffixed INN page's, the
        two are one substance: R1 (identical UNII) licenses the merge and the biosimilar exception
        does not apply. The INN page survives, the suffixed proper name becomes a synonym and the
        suffixed slug redirects. `biosimilar_of` is kept only where a `351(k)` row licenses the
        page: the suffix alone never makes a biosimilar.
    *   **Same-name pairs.** Two live pages that print one name and serve `<slug>` and `<slug>-<n>`
        are partitioned: a registry study whose every recorded intervention on the losing page is
        that shared name belongs to the page the registers rank first (K1 over K2 over K3 over K4,
        the unsuffixed slug). The other page keeps only what it holds against its own identifiers,
        and a page left with nothing of its own falls below its tier's threshold, which is the
        honest state of a record holding no independent fact.
    *   **Combination products sharing a component.** Two products built from one substance share
        that substance's recorded synonyms, so the registry matcher put the same studies on both.
        A study belongs to the combination whose full component set its recorded interventions
        name; where they name neither product in full it goes to the component page that records
        the same study; where none of those holds nothing moves and the reason is counted.

Outputs, all under `data/revamp/identity/`. The v3 revision — `canonical-v3.ndjson`,
`relations-v3.parquet`, `display-names-v3.csv`, `redirect-plan-v3.csv`,
`trial-reassignments-v4.csv`, `hold-list-v3.csv` — is written unchanged, and the revision this run
publishes is the v5 one beside it: `canonical-v5.ndjson`, `relations-v5.parquet`,
`display-names-v5.csv`, `redirect-plan-v5.csv`, `trial-reassignments-v5.csv`, `hold-list-v5.csv`
and `combination-components-v5.csv`. Both are summarised in `apply-summary.json`.

    identity_apply.py --out-dir data/revamp/identity
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

import identity_resolve as IR                                            # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
IDENTITY = ROOT / "data/revamp/identity"
CANONICAL_V2 = IDENTITY / "canonical-v2.ndjson"
PAGE_SLUGS = IDENTITY / "page-slugs.csv"
DISPLAY_NAMES = IDENTITY / "display-names.csv"
RELATIONS = IDENTITY / "relations.parquet"
REDIRECT_PLAN = IDENTITY / "redirect-plan.csv"
TRIALS = IDENTITY / "trial-reassignments.csv"
APPLY_LIST = IDENTITY / "apply-list.csv"
HOLD_LIST = IDENTITY / "hold-list.csv"
SPINE_ATTACHED = IDENTITY / "spine-attached.parquet"
GSRS_SPINE = ROOT / "data/sources/gsrs/spine.parquet"
DECISIONS = ROOT / "data/revamp/identity-decisions.csv"
REGISTRY_MATCHES = ROOT / "data/corpus-20k/registry/matches"
PURPLE_BOOK = ROOT / "data/sources/orange-purple-book/mapped.parquet"

MAX_PRINT_ROWS = 50

# Multiplier prefixes the salt list already spells out on some of its entries (hemisulfate,
# hemifumarate, disuccinate, dimaleate, trihydrochloride). A prefix in front of a listed salt or
# ester word is the same counter-ion in a different stoichiometry, never a different substance.
FORM_PREFIX = re.compile(r"^(hemi|mono|di|tri|tetra|penta|sesqui|bis|tris)(.+)$")

TRIAL_COLUMNS = ["nct", "from_key", "to_key", "matched_name", "action", "rule", "reason"]
REDIRECT_COLUMNS = ["old_slug", "new_slug", "reason"]
RELATION_COLUMNS = ["page_a", "page_b", "relation", "note", "rule", "evidence"]
COMPONENT_COLUMNS = ["key", "slug", "printed_name", "components", "component_keys",
                     "shares_component_with"]


# ---------------------------------------------------------------------------------------------
# loading
# ---------------------------------------------------------------------------------------------

def read_csv_rows(path: Path) -> list[dict]:
    with path.open() as handle:
        return list(csv.DictReader(handle))


def load_pages(normalise: IR.NameNormaliser) -> dict[str, dict]:
    """canonical-v2 records, in the page shape `identity_resolve` works on."""
    pages: dict[str, dict] = {}
    with CANONICAL_V2.open() as handle:
        for line in handle:
            record = json.loads(line)
            structure = record.get("structure") or {}
            pages[record["key"]] = {
                "key": record["key"],
                "keyRank": record["keyRank"],
                "displayName": record.get("displayName") or record["key"],
                "synonyms": record.get("synonyms") or [],
                "isCombination": bool(record.get("isCombination")),
                "isBiologic": bool(record.get("isBiologic")),
                "smiles": IR.clean(structure.get("smiles")),
                "existingSlug": IR.clean(record.get("existingSlug")),
                "adoptedSlug": IR.clean(record.get("adoptedSlug")),
                "record": record,
            }

    attached = pd.read_parquet(SPINE_ATTACHED)
    for row in attached.itertuples(index=False):
        page = pages.get(row.key)
        if page is None:
            continue
        page["tier"] = int(row.tier)
        page["unii"] = IR.clean(row.unii)
        page["inchikey"] = IR.clean(row.inchikey)
        page["inchikey14"] = IR.clean(row.inchikey14)
        page["active_moiety_unii"] = IR.clean(row.active_moiety_unii)
        page["parent_unii"] = IR.clean(row.parent_unii)

    for row in read_csv_rows(PAGE_SLUGS):
        page = pages.get(row["key"])
        if page is not None:
            page["slug"] = IR.clean(row["slug"])
            page["indexable"] = row["indexable"].lower() in ("t", "true")

    for page in pages.values():
        page.setdefault("slug", page.get("adoptedSlug") or page.get("existingSlug"))
        page.setdefault("indexable", False)
        page.setdefault("tier", 0)
        for field in ("unii", "inchikey", "inchikey14", "active_moiety_unii", "parent_unii"):
            page.setdefault(field, None)
        page["normalised"] = normalise(page["displayName"])

    spine = pd.read_parquet(GSRS_SPINE, columns=["unii", "smiles"])
    by_unii = {IR.clean(row.unii): IR.clean(row.smiles) for row in spine.itertuples(index=False)
               if IR.clean(row.unii)}
    IR.enrich_smiles(pages, {unii: {"smiles": smiles} for unii, smiles in by_unii.items()})
    return pages


def live_slug(page: dict) -> str | None:
    """The slug the site serves for this page, in the order `redirect_check.py` reads them."""
    return page.get("slug") or page.get("adoptedSlug") or page.get("existingSlug")


# ---------------------------------------------------------------------------------------------
# the adjudicated pairs
# ---------------------------------------------------------------------------------------------

def apply_pairs(rows: list[dict], pages: dict[str, dict]) -> tuple[list[dict], list[dict]]:
    """One entry per distinct pair, merges first and in file order, then the form-of pairs."""
    merges: list[dict] = []
    form_of: list[dict] = []
    seen: set[frozenset] = set()
    for index, row in enumerate(rows):
        a = row["page_a"].strip()
        b = (row["resolved_page_b"] or row["page_b"]).strip()
        if not a or not b or a == b:
            continue
        pair = frozenset((a, b))
        if pair in seen:
            continue
        seen.add(pair)
        entry = {
            "page_a": a,
            "page_b": b,
            "classification": row["classification"].strip(),
            "name_a": row["name_a"],
            "name_b": row["name_b"],
            "reach": row["reach"],
            "tier": row["tier"],
            "licence_ground": row["licence_ground"],
            "second_evidence": row["second_evidence"],
            "row": index + 2,
            "missing": [k for k in (a, b) if k not in pages],
        }
        (merges if entry["classification"] == "LICENSED-MERGE" else form_of).append(entry)
    return merges, form_of


def separated_pairs(pages: dict[str, dict], relations: pd.DataFrame,
                    holds: list[dict]) -> dict[frozenset, str]:
    """Every page pair the corpus records as kept apart, with the reason it is kept apart."""
    separated: dict[frozenset, str] = {}
    decisions = pd.read_csv(DECISIONS, keep_default_na=False, dtype=str)
    for row in decisions.itertuples(index=False):
        if not str(row.rule).startswith("EXCEPTION-"):
            continue
        if not str(row.page_a).strip() or not str(row.page_b).strip():
            continue
        separated.setdefault(frozenset((row.page_a, row.page_b)),
                             f"step 3.2 {row.rule} keeps these pages separate")
    for row in relations.itertuples(index=False):
        if str(row.rule).startswith("EXCEPTION-"):
            separated.setdefault(frozenset((row.page_a, row.page_b)),
                                 f"step 3.2 {row.rule} keeps these pages separate")
    for row in holds:
        a = row["page_a"].strip()
        b = (row["resolved_page_b"] or row["page_b"]).strip()
        if a and b and a != b:
            separated.setdefault(frozenset((a, b)),
                                 "the pair is on the hold list and stays unchanged")
    return separated


# ---------------------------------------------------------------------------------------------
# merges
# ---------------------------------------------------------------------------------------------

def run_merges(merges: list[dict], pages: dict[str, dict],
               separated: dict[frozenset, str]) -> tuple[dict[str, str], list[dict], list[dict]]:
    """Apply the licensed merges. Returns merge map (absorbed key -> survivor), applied, refused."""
    union = IR.Union()
    everything: set[str] = set()

    # Seed with the merges canonical-v2 already carries, so the closure covers them too.
    for key, page in pages.items():
        union.find(key)
        everything.add(key)
        for absorbed in page["record"].get("mergedFrom") or []:
            everything.add(absorbed)
            union.union(absorbed, key)

    def component_members() -> dict[str, set[str]]:
        grouped: dict[str, set[str]] = defaultdict(set)
        for item in everything:
            grouped[union.find(item)].add(item)
        return grouped

    members = component_members()

    applied: list[dict] = []
    refused: list[dict] = []
    for entry in merges:
        if entry["missing"]:
            refused.append({**entry, "refusal": "one side of the pair is not a page in "
                                                f"canonical-v2: {', '.join(entry['missing'])}"})
            continue
        a, b = entry["page_a"], entry["page_b"]
        root_a, root_b = union.find(a), union.find(b)
        if root_a == root_b:
            applied.append({**entry, "note": "the two pages are already one component"})
            continue
        component = members[root_a] | members[root_b]

        blocked = None
        for pair, reason in separated.items():
            first, second = tuple(pair) if len(pair) == 2 else (None, None)
            if first in component and second in component:
                blocked = {"pair": sorted(pair), "why": reason}
                break
        if blocked is None:
            for other in sorted(members[root_b]):
                for one in sorted(members[root_a]):
                    page_one, page_other = pages.get(one), pages.get(other)
                    if page_one is None or page_other is None:
                        continue
                    exception = IR.exception_class(page_one, page_other)
                    if exception:
                        blocked = {"pair": [one, other],
                                   "why": f"{exception[0]}: {exception[2]}"}
                        break
                if blocked:
                    break
        if blocked is not None:
            refused.append({**entry,
                            "refusal": "the merge would join two pages an exception class keeps "
                                       f"separate ({' + '.join(blocked['pair'])}): {blocked['why']}"})
            continue

        union.union(a, b)
        members = component_members()
        applied.append({**entry, "note": "merged"})

    merge_map: dict[str, str] = {}
    for group in members.values():
        live = [pages[k] for k in sorted(group) if k in pages]
        if len(live) < 2:
            continue
        survivor = IR.pick_survivor(live)
        for page in live:
            if page["key"] != survivor["key"]:
                merge_map[page["key"]] = survivor["key"]

    for entry in applied:
        a, b = entry["page_a"], entry["page_b"]
        survivor = merge_map.get(a, a) if a in merge_map else merge_map.get(b, b)
        entry["survivor"] = survivor
        entry["absorbed"] = sorted(k for k in (a, b) if merge_map.get(k) == survivor)
    return merge_map, applied, refused


# ---------------------------------------------------------------------------------------------
# form-of edges
# ---------------------------------------------------------------------------------------------

def note_provenance(relation: str) -> list[str]:
    """The stored fields the generated sentence for this relation reads."""
    base = ["canonical-v2.displayName (both pages)",
            "spine-attached.unii or spine-attached.inchikey where two pages print one name"]
    if relation == "isotopologue_of":
        return base + ["structure.smiles isotope labels (both pages)"]
    if relation in ("salt_of", "hydrate_of", "parent_of"):
        return base + ["structure.smiles covalent fragments (both pages)",
                       "fragment InChIKey skeleton -> counter-ion name"]
    if relation == "stereoisomer_of":
        return base + ["spine-attached.inchikey stereo block, characters 15-25 (both pages)",
                       "structure.smiles CIP stereo codes (both pages)"]
    if relation == "ionised_form_of":
        return base + ["spine-attached.inchikey protonation flag (both pages)",
                       "structure.smiles net formal charge (both pages)"]
    return base + ["spine-attached.inchikey connectivity block, characters 1-14 (both pages)"]


def run_form_of(form_of: list[dict], pages: dict[str, dict], merge_map: dict[str, str],
                relations: pd.DataFrame) -> tuple[list[dict], list[dict], list[dict]]:
    """Add the licensed form-of edges both ways. Existing step 3.2 edges are confirmed, not doubled."""
    existing: dict[frozenset, list[str]] = defaultdict(list)
    for row in relations.itertuples(index=False):
        existing[frozenset((row.page_a, row.page_b))].append(row.relation)

    new_rows: list[dict] = []
    applied: list[dict] = []
    refused: list[dict] = []
    for entry in form_of:
        a_key = merge_map.get(entry["page_a"], entry["page_a"])
        b_key = merge_map.get(entry["page_b"], entry["page_b"])
        if entry["missing"]:
            refused.append({**entry, "refusal": "one side of the pair is not a page in "
                                                f"canonical-v2: {', '.join(entry['missing'])}"})
            continue
        if a_key == b_key:
            refused.append({**entry, "refusal": "a licensed merge joined the two pages, so there "
                                                "is no second page to link"})
            continue
        a, b = pages[a_key], pages[b_key]
        # Two pages that print one name are told apart in the note by the first identifier they
        # do not share: the UNII when it differs, the recorded structure when it does not.
        if (a.get("unii") and a["unii"] == b.get("unii")
                and IR.punct_norm(a["displayName"]) == IR.punct_norm(b["displayName"])):
            a, b = {**a, "unii": None}, {**b, "unii": None}
        parent = IR.pick_form_parent(a, b, None)
        child = b if parent is a else a
        note, relation = IR.form_note(child, parent, None)
        back = (f"{IR.page_label(parent, child)} is the parent form recorded for "
                f"{IR.page_label(child, parent)}.")
        evidence = json.dumps({"a": child["displayName"], "b": parent["displayName"],
                               "inchikey_child": child.get("inchikey"),
                               "inchikey_parent": parent.get("inchikey"),
                               "origin": "identity-3.4-apply",
                               "applyRow": entry["row"]}, sort_keys=True)
        pair = frozenset((child["key"], parent["key"]))
        had = sorted(set(existing.get(pair, [])))
        new_rows.append({"page_a": child["key"], "page_b": parent["key"],
                         "relation": relation, "note": note,
                         "rule": "LICENSED-FORM_OF-3.4", "evidence": evidence})
        new_rows.append({"page_a": parent["key"], "page_b": child["key"],
                         "relation": "form_of", "note": back,
                         "rule": "LICENSED-FORM_OF-3.4", "evidence": evidence})
        applied.append({**entry, "child": child["key"], "parent": parent["key"],
                        "relation": relation, "note": note, "backNote": back,
                        "edgesWritten": 2,
                        "edgesAlreadyRecorded": had,
                        "provenance": note_provenance(relation)})
    return new_rows, applied, refused


# ---------------------------------------------------------------------------------------------
# trial reassignment, extended to salt and ester forms
# ---------------------------------------------------------------------------------------------

def form_word(token: str, salt_words: set[str]) -> bool:
    if token in salt_words or token in IR.ESTER_WORDS or token in IR.CATION_WORDS:
        return True
    match = FORM_PREFIX.match(token)
    return bool(match and (match.group(2) in salt_words or match.group(2) in IR.ESTER_WORDS))


def strip_steps(name: str, normaliser: IR.NameNormaliser, salt_words: set[str]) -> list[tuple[str, str]]:
    """Names reached by removing one salt, hydrate, ester or counter-ion token at a time."""
    tokens = IR.punct_norm(name).split()
    steps: list[tuple[str, str]] = []
    removed: list[str] = []
    while len(tokens) > 1:
        moved = False
        for word in normaliser.salt_words:
            parts = word.split()
            if len(tokens) > len(parts) and tokens[-len(parts):] == parts:
                removed = parts + removed
                tokens = tokens[: -len(parts)]
                moved = True
                break
        if not moved and form_word(tokens[-1], salt_words):
            removed = [tokens[-1]] + removed
            tokens = tokens[:-1]
            moved = True
        elif not moved and tokens[0] in IR.CATION_WORDS:
            removed = removed + [tokens[0]]
            tokens = tokens[1:]
            moved = True
        if not moved:
            break
        steps.append((" ".join(tokens), " ".join(removed)))
    return steps


def form_parents(pages: dict[str, dict], printed: dict[str, str],
                 normaliser: IR.NameNormaliser) -> tuple[dict[str, dict], Counter]:
    """Form page -> the one live page whose printed name is that page's name minus its form words."""
    salt_words = set(normaliser.salt_words)
    by_printed: dict[str, list[str]] = defaultdict(list)
    for key in pages:
        by_printed[IR.punct_norm(printed[key])].append(key)

    parents: dict[str, dict] = {}
    reasons: Counter = Counter()
    for key in pages:
        outcome = "no shorter name is reached by removing a salt, hydrate or ester token"
        for stem, removed in strip_steps(printed[key], normaliser, salt_words):
            candidates = [k for k in by_printed.get(stem, []) if k != key]
            if len(candidates) == 1:
                parents[key] = {"parent": candidates[0], "stem": stem, "removed": removed}
                outcome = "form page linked to the page that prints the stripped name"
                break
            if len(candidates) > 1:
                outcome = "two or more pages print the stripped name, so no parent is decidable"
                break
            outcome = "no page prints the stripped name"
        reasons[outcome] += 1
    return parents, reasons


def load_registry() -> dict[str, list[dict]]:
    registry: dict[str, list[dict]] = {}
    for path in sorted(glob.glob(str(REGISTRY_MATCHES / "*.ndjson"))):
        with open(path) as handle:
            for line in handle:
                record = json.loads(line)
                registry[record["key"]] = record.get("nctIds") or []
    return registry


def run_trial_moves(pages: dict[str, dict], printed: dict[str, str],
                    normaliser: IR.NameNormaliser) -> tuple[list[dict], dict]:
    parents, reasons = form_parents(pages, printed, normaliser)
    registry = load_registry()
    rows: list[dict] = []
    children = 0
    for key, link in sorted(parents.items()):
        matches = registry.get(key) or []
        if not matches:
            continue
        parent_key, stem = link["parent"], link["stem"]
        by_nct: dict[str, list[dict]] = defaultdict(list)
        for match in matches:
            by_nct[match.get("nct")].append(match)
        moved_here = 0
        child_name, parent_name = printed[key], printed[parent_key]
        for nct, group in sorted(by_nct.items()):
            names = [IR.punct_norm(m.get("matchedName", "")) for m in group]
            if not nct or any(name != stem for name in names):
                continue
            rows.append({
                "nct": nct,
                "from_key": key,
                "to_key": parent_key,
                "matched_name": group[0].get("matchedName"),
                "action": "move",
                "rule": "R14b-PARENT-NAME-TRIAL-FORM",
                "reason": (f"every registry intervention recorded for this study on the "
                           f"{child_name} page names {parent_name}; {child_name} is that name "
                           f"plus {link['removed']}, so the study belongs to the parent page"),
            })
            moved_here += 1
        if moved_here:
            children += 1
    summary = {
        "formPagesLinkedToAParent": len(parents),
        "pagesByOutcome": dict(sorted(reasons.items())),
        "childPagesWithMovedStudies": children,
        "studiesMoved": len(rows),
    }
    return rows, summary


# ---------------------------------------------------------------------------------------------
# biosimilars: the reference product's trials, and the sentence the page opens with
# ---------------------------------------------------------------------------------------------

def name_key(value) -> str:
    """One comparable form for a product name: letters and digits, single-spaced, lower case."""
    return " ".join(re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).split())


def load_purple_book(printed: dict[str, str]) -> dict[str, dict]:
    """Page -> the FDA Purple Book row that licenses *this page's own proper name* as a biosimilar.

    A biosimilar page and the page it is a biosimilar of share one UNII, so the mapped source
    attaches every Purple Book row of that substance to both. The row that speaks about this page
    is the one whose `proper_name` is the name the page prints, and only that row is read here.
    `license_type` is the register's own word: `351(a)` is a biologic licensed in its own right and
    `351(k)` is a biosimilar, so the distinction is the register's and not this script's.
    """
    if not PURPLE_BOOK.exists():
        return {}
    frame = pd.read_parquet(PURPLE_BOOK, columns=["key", "field", "value", "source_date",
                                                  "source_url"])
    frame = frame[frame["field"] == "purpleBookProducts"]
    out: dict[str, dict] = {}
    for key, value, source_date, source_url in zip(frame["key"], frame["value"],
                                                   frame["source_date"], frame["source_url"]):
        if key not in printed:
            continue
        row = json.loads(value)
        if name_key(row.get("proper_name")) != name_key(printed[key]):
            continue
        licence = str(row.get("license_type") or "")
        if not licence.startswith("351(k)"):
            continue
        reference = {name_key(row.get("reference_product_proper_name")),
                     name_key(row.get("reference_product_proprietary_name"))}
        reference.discard("")
        if not reference:
            continue
        held = out.setdefault(key, {"referenceNames": set(), "blaNumbers": [], "licenceTypes": [],
                                    "properName": row.get("proper_name"),
                                    "referenceProperName": row.get("reference_product_proper_name"),
                                    "sourceDate": source_date, "sourceUrl": source_url})
        held["referenceNames"] |= reference
        if row.get("bla_number") and row["bla_number"] not in held["blaNumbers"]:
            held["blaNumbers"].append(row["bla_number"])
        if licence not in held["licenceTypes"]:
            held["licenceTypes"].append(licence)
    return out


def biosimilar_pairs(relations: pd.DataFrame, printed: dict[str, str],
                     purple: dict[str, dict]) -> tuple[dict[str, dict], Counter]:
    """Biosimilar page -> its reference page, where three things all hold.

    Section 11: "the reference is the one live page printing the INN without a suffix". The three
    conditions are the register's, not this script's: the Purple Book licenses this page's own
    proper name under 351(k) against a named reference product; the page the `biosimilar_of`
    relation points at prints that reference product's name; and no other live page prints it, so
    "the one live page" is a fact rather than a choice.
    """
    printed_count: Counter = Counter(name_key(name) for name in printed.values())
    out: dict[str, dict] = {}
    reasons: Counter = Counter()
    rows = relations[relations["relation"] == "biosimilar_of"].to_dict("records")
    for row in rows:
        child, reference = row["page_a"], row["page_b"]
        if child not in printed or reference not in printed:
            reasons["one side is not a live page"] += 1
            continue
        record = purple.get(child)
        if record is None:
            reasons["the Purple Book does not license this page's own name under 351(k)"] += 1
            continue
        reference_printed = name_key(printed[reference])
        if reference_printed not in record["referenceNames"]:
            reasons["the linked page does not print the reference product's name"] += 1
            continue
        if printed_count[reference_printed] != 1:
            reasons["more than one live page prints the reference product's name"] += 1
            continue
        out[child] = {"reference": reference, "referenceNames": record["referenceNames"],
                      "blaNumbers": record["blaNumbers"], "licenceTypes": record["licenceTypes"],
                      "sourceDate": record["sourceDate"], "sourceUrl": record["sourceUrl"],
                      "referenceProperName": record["referenceProperName"]}
        reasons["licensed as a biosimilar of the page it points at"] += 1
    return out, reasons


def run_biosimilar_trial_moves(confirmed: dict[str, dict], printed: dict[str, str],
                               registry: dict[str, list[dict]]) -> tuple[list[dict], dict]:
    """A study that names only the reference product moves to the reference page (section 11).

    The same shape as R14b one section above: every registry intervention recorded for the study on
    this page is read, and the study moves only when all of them name the reference product. The
    names that count are the ones the FDA Purple Book records for the reference product - its
    proper name and its proprietary name - so "names only the reference product" is decided against
    a register rather than against a guess about what a trade name refers to.
    """
    rows: list[dict] = []
    children = 0
    for child, link in sorted(confirmed.items()):
        matches = registry.get(child) or []
        if not matches:
            continue
        by_nct: dict[str, list[dict]] = defaultdict(list)
        for match in matches:
            by_nct[match.get("nct")].append(match)
        moved_here = 0
        child_name, reference_name = printed[child], printed[link["reference"]]
        for nct, group in sorted(by_nct.items()):
            names = [name_key(m.get("matchedName", "")) for m in group]
            if not nct or not names:
                continue
            if any(name not in link["referenceNames"] for name in names):
                continue
            rows.append({
                "nct": nct,
                "from_key": child,
                "to_key": link["reference"],
                "matched_name": group[0].get("matchedName"),
                "action": "move",
                "rule": "R14c-REFERENCE-PRODUCT-TRIAL",
                "reason": (f"every registry intervention recorded for this study on the "
                           f"{child_name} page names the reference product the FDA Purple Book "
                           f"licenses {child_name} against ({reference_name}), so the study "
                           f"belongs to the reference page"),
            })
            moved_here += 1
        if moved_here:
            children += 1
    summary = {
        "biosimilarPagesConfirmedByTheRegister": len(confirmed),
        "biosimilarPagesWithMovedStudies": children,
        "studiesMoved": len(rows),
    }
    return rows, summary


def biosimilar_note(child_name: str, reference_name: str, link: dict) -> str:
    """The sentence section 11 fixes, with the register that supports it named after it."""
    licences = ", ".join(sorted(link["licenceTypes"]))
    blas = ", ".join(link["blaNumbers"][:4])
    return (f"{child_name} is a biosimilar of {reference_name}. The FDA Purple Book read on "
            f"{link['sourceDate']} records it as licensed under section 351(k) of the Public "
            f"Health Service Act against {reference_name}"
            + (f", entered as {licences}" if licences else "")
            + (f", biologics licence application {blas}" if blas else "")
            + ".")


def apply_biosimilar_notes(relations: pd.DataFrame, confirmed: dict[str, dict],
                           printed: dict[str, str]) -> tuple[pd.DataFrame, int]:
    """Rewrite the `biosimilar_of` note to the sentence the page opens with (section 11).

    Only the confirmed pages are rewritten. A page carrying an FDA four-letter suffix that the
    Purple Book licenses under 351(a) is a biologic licensed in its own right, not a biosimilar of
    anything, and its recorded note - which says it carries the suffix, and nothing more - stays as
    Phase 3 wrote it.
    """
    rewritten = 0
    notes = []
    for row in relations.to_dict("records"):
        link = confirmed.get(row["page_a"]) if row["relation"] == "biosimilar_of" else None
        if link is None or link["reference"] != row["page_b"]:
            notes.append(row["note"])
            continue
        notes.append(biosimilar_note(printed[row["page_a"]], printed[row["page_b"]], link))
        rewritten += 1
    out = relations.copy()
    out["note"] = notes
    return out, rewritten


# ---------------------------------------------------------------------------------------------
# section 12 — the two partitions, the 351(a) merges, and the combination component list (v5)
# ---------------------------------------------------------------------------------------------

# The register ranks, best first. `docs/specs/phase4-generators.md` section 12: "the page whose key
# the registers rank first (K1 over K2 over K3 over K4; the unsuffixed slug)". K1 is an FDA UNII,
# K2 an InChIKey, K3 a ChEMBL id and K4 a normalised name; the three keys that are none of those —
# a combination, a held record, an unkeyed one — rank after them, in the order written here, and
# never ahead of a register key.
KEY_RANK_ORDER = ("K1", "K2", "K3", "K4", "COMBO", "HOLD", "UNKEYED")

NUMBERED_SLUG = re.compile(r"^(?P<stem>.+)-(?P<ordinal>\d+)$")
# An FDA four-letter suffix on a proper name: "Trastuzumab-Anns", "Faricimab-Svoa".
FDA_SUFFIX = re.compile(r"^(?P<stem>.+?)[-‐]([A-Za-z]{4})$")
# The separators a combination product's proper name uses between its components. The FDA writes
# them as a comma list ending in "and", or as two names joined by "and": "Pertuzumab, Trastuzumab,
# and Hyaluronidase-Zzxf", "Trastuzumab and Hyaluronidase-Oysk".
COMPONENT_SPLIT = re.compile(r"\s*,\s*|\s+and\s+|\s*/\s*", re.IGNORECASE)
LEADING_AND = re.compile(r"^and\s+", re.IGNORECASE)
# A comma inside a register's own inverted name ("PROPAFENONE, (R)-", "Starch, Rice") is not a
# component separator. A combination product's proper name carries the conjunction, and a name
# without one is one substance whose register wrote its qualifier after a comma.
COMPONENT_CONJUNCTION = re.compile(r"(?:,\s*and\s+|\s+and\s+|\s*/\s*)", re.IGNORECASE)
COMBO_KEY = "COMBO:{"


def page_unii(page: dict) -> str | None:
    """The UNII the identity record holds for this page.

    `spine-attached.parquet` carries the page key's own identifier, which for a suffixed biological
    is the UNII with the suffix marker on it (`QC4F7FKK7I#svoa`). The substance's UNII is the one
    the canonical record holds, and it is the one an identity comparison is made on.
    """
    recorded = IR.clean(page["record"].get("unii"))
    if recorded:
        return recorded
    attached = IR.clean(page.get("unii"))
    return attached.split("#", 1)[0] if attached else None


def key_rank_index(key: str) -> int:
    prefix = key.split(":", 1)[0]
    return KEY_RANK_ORDER.index(prefix) if prefix in KEY_RANK_ORDER else len(KEY_RANK_ORDER)


def slug_stem(slug: str | None) -> tuple[str, bool]:
    """`("nebivolol", True)` for `nebivolol-2`; `("nebivolol", False)` for `nebivolol`."""
    if not slug:
        return "", False
    match = NUMBERED_SLUG.match(slug)
    return (match.group("stem"), True) if match else (slug, False)


def same_name_families(pages: dict[str, dict], printed: dict[str, str],
                       live: set[str]) -> list[dict]:
    """Live pages that print one name and serve `<slug>` and `<slug>-<n>` (section 12).

    The family is decided by two recorded facts and nothing else: the name the page prints, and the
    slug the route map publishes. A page that prints a different name is a different record even
    where its slug is numbered, and a numbered slug whose stem no live page serves is not a pair.
    """
    by_name: dict[str, list[str]] = defaultdict(list)
    for key in live:
        by_name[name_key(printed[key])].append(key)

    families: list[dict] = []
    for shared, keys in sorted(by_name.items()):
        if len(keys) < 2 or not shared:
            continue
        by_stem: dict[str, list[str]] = defaultdict(list)
        for key in keys:
            stem, _numbered = slug_stem(live_slug(pages[key]))
            by_stem[stem].append(key)
        for stem, members in sorted(by_stem.items()):
            if len(members) < 2:
                continue
            numbered = [k for k in members if slug_stem(live_slug(pages[k]))[1]]
            if not numbered:
                continue
            ranked = sorted(
                members,
                key=lambda k: (key_rank_index(k), slug_stem(live_slug(pages[k]))[1],
                               live_slug(pages[k]) or "", k),
            )
            families.append({
                "sharedName": shared,
                "slugStem": stem,
                "winner": ranked[0],
                "losers": ranked[1:],
                "ranking": [
                    {"key": k, "keyRank": k.split(":", 1)[0], "slug": live_slug(pages[k]),
                     "printedName": printed[k]}
                    for k in ranked
                ],
            })
    return families


def run_same_name_partition(pages: dict[str, dict], printed: dict[str, str], live: set[str],
                            registry: dict[str, list[dict]]) -> tuple[list[dict], dict]:
    """Studies naming only the shared name go to the register-ranked page (section 12).

    A study is moved only when every registry intervention recorded for it on the losing page is
    the shared name itself. A study that named something recorded against this page alone — its own
    InChIKey-derived synonym, its own brand — names a fact the page holds on its own, and stays.
    """
    families = same_name_families(pages, printed, live)
    rows: list[dict] = []
    reasons: Counter = Counter()
    losers_with_moves = 0
    for family in families:
        winner = family["winner"]
        shared = family["sharedName"]
        for loser in family["losers"]:
            matches = registry.get(loser) or []
            if not matches:
                reasons["the page records no registry study"] += 1
                continue
            by_nct: dict[str, list[dict]] = defaultdict(list)
            for match in matches:
                by_nct[match.get("nct")].append(match)
            moved_here = 0
            for nct, group in sorted(by_nct.items()):
                if not nct:
                    continue
                names = [name_key(m.get("matchedName", "")) for m in group]
                if not names or any(name != shared for name in names):
                    reasons["the study's interventions name more than the shared name"] += 1
                    continue
                rows.append({
                    "nct": nct,
                    "from_key": loser,
                    "to_key": winner,
                    "matched_name": group[0].get("matchedName"),
                    "action": "move",
                    "rule": "R14d-SAME-NAME-REGISTER-RANK",
                    "reason": (f"every registry intervention recorded for this study on the "
                               f"{printed[loser]} page is the name both pages print; the registers "
                               f"rank {winner.split(':', 1)[0]} ahead of "
                               f"{loser.split(':', 1)[0]} and "
                               f"{live_slug(pages[winner])} is the unsuffixed slug, so the study "
                               f"belongs to that page"),
                })
                moved_here += 1
            if moved_here:
                losers_with_moves += 1
                reasons["studies moved to the register-ranked page"] += moved_here
    summary = {
        "families": len(families),
        "pagesPartitioned": sum(len(f["losers"]) for f in families),
        "pagesWithMovedStudies": losers_with_moves,
        "studiesMoved": len(rows),
        "studiesByOutcome": dict(sorted(reasons.items())),
    }
    return rows, summary, families


def component_names(display_name: str) -> list[str]:
    """The component names inside a combination product's proper name, in the register's order."""
    parts = [LEADING_AND.sub("", part.strip(" .")) for part in COMPONENT_SPLIT.split(display_name or "")]
    return [part.strip() for part in parts if part.strip() and name_key(part) not in ("", "and")]


def combination_pages(pages: dict[str, dict], printed: dict[str, str],
                      live: set[str]) -> dict[str, dict]:
    """Live pages that are a combination of two or more recorded components (section 12).

    Two shapes, both read off what the corpus already stores and neither of them inferred:

    *   a `COMBO:{...}` key names its components as page keys, which is the resolution itself;
    *   otherwise the printed name is the register's own proper name for the product, and it is a
        combination only when it carries the conjunction the FDA writes between components
        ("Trastuzumab and Hyaluronidase-Oysk", "Pertuzumab, Trastuzumab, and Hyaluronidase-Zzxf").
        A comma with no conjunction is a register's inverted name for one substance — "Starch,
        Rice", "PROPAFENONE, (R)-" — and is never split.

    A component resolves to a page when exactly one live page prints that name, or prints it with
    the FDA four-letter suffix removed. A component the corpus holds no page for keeps its name and
    is recorded as unresolved; at least one component must resolve, or there is no page a study
    could be partitioned to.
    """
    by_name: dict[str, list[str]] = defaultdict(list)
    for key in live:
        by_name[name_key(printed[key])].append(key)

    def resolve(name: str, key: str) -> str | None:
        token = name_key(name)
        found = [k for k in by_name.get(token, []) if k != key]
        if not found:
            suffixless = FDA_SUFFIX.match(name.strip())
            if suffixless:
                found = [k for k in by_name.get(name_key(suffixless.group("stem")), [])
                         if k != key]
        return found[0] if len(found) == 1 else None

    out: dict[str, dict] = {}
    for key in sorted(live):
        components: list[dict] = []
        if key.startswith(COMBO_KEY):
            for token in key[len(COMBO_KEY):-1].split(","):
                token = token.strip()
                if token in live and token != key:
                    components.append({"name": printed[token],
                                       "normalised": name_key(printed[token]),
                                       "page": token})
        elif COMPONENT_CONJUNCTION.search(printed[key]):
            names = component_names(printed[key])
            if any(len(name) < 3 or not re.search(r"[A-Za-z]", name) for name in names):
                continue
            components = [{"name": name, "normalised": name_key(name),
                           "page": resolve(name, key)} for name in names]
        if len(components) < 2 or not any(c["page"] for c in components):
            continue
        out[key] = {"components": components,
                    "normalised": [c["normalised"] for c in components]}
    return out


def combination_families(combinations: dict[str, dict]) -> dict[str, list[str]]:
    """Combination page -> the other combination pages that share at least one component."""
    holders: dict[str, list[str]] = defaultdict(list)
    for key, record in combinations.items():
        for token in set(record["normalised"]):
            holders[token].append(key)
    siblings: dict[str, set[str]] = defaultdict(set)
    for token, keys in holders.items():
        if len(keys) < 2:
            continue
        for key in keys:
            siblings[key] |= {other for other in keys if other != key}
    return {key: sorted(value) for key, value in siblings.items() if value}


def names_full_component_set(matched: str, key: str, record: dict, exclusive: set[str]) -> bool:
    """Does this recorded intervention name every component of this product?

    Two ways, both from stored strings: the intervention contains each component name (the FDA's
    own proper name for the product does), or it carries a name the corpus records against this
    product and against no product it shares a component with — its brand. The brand is matched on
    word boundaries inside the intervention, because a registry writes it with a gloss after it
    ("Phesgo (trastuzumab og pertuzumab)"), and only from four characters up, so a short recorded
    string cannot claim a study by appearing inside a longer word."""
    token = name_key(matched)
    if not token:
        return False
    for name in exclusive:
        if len(name) >= 4 and re.search(rf"(?<![a-z0-9]){re.escape(name)}(?![a-z0-9])", token):
            return True
    return all(component in token for component in record["normalised"])


def run_combination_partition(pages: dict[str, dict], printed: dict[str, str], live: set[str],
                              registry: dict[str, list[dict]]) -> tuple[list[dict], dict, dict]:
    """A trial belongs to the combination whose full component set its interventions name (section 12).

    Two combination products that share a component also share the component's recorded synonyms —
    a development code such as `ABP 980` sits on the trastuzumab UNII and therefore on every product
    built from it — and the registry matcher put the same 43 studies on both Phesgo and Herceptin
    Hylecta because of it. The rule reads each study's own recorded interventions: the study stays
    on the product whose whole component set they name, moves to the sibling product whose whole set
    they name, or, where they name neither product in full, goes to the component page that records
    the same study. Where none of the three holds, nothing moves and the reason is counted.
    """
    combinations = combination_pages(pages, printed, live)
    siblings = combination_families(combinations)
    exclusive: dict[str, set[str]] = {}
    for key in siblings:
        family = set(siblings[key])
        own = {name_key(printed[key])}
        for synonym in pages[key]["record"].get("synonyms") or []:
            if synonym.get("kind") in ("brand", "common", "display"):
                own.add(name_key(synonym.get("name")))
        shared_elsewhere: set[str] = set()
        for other in family:
            shared_elsewhere.add(name_key(printed[other]))
            for synonym in pages[other]["record"].get("synonyms") or []:
                shared_elsewhere.add(name_key(synonym.get("name")))
        exclusive[key] = {token for token in own if token and token not in shared_elsewhere}

    rows: list[dict] = []
    reasons: Counter = Counter()
    pages_with_moves = 0
    for key in sorted(siblings):
        matches = registry.get(key) or []
        if not matches:
            continue
        record = combinations[key]
        by_nct: dict[str, list[dict]] = defaultdict(list)
        for match in matches:
            by_nct[match.get("nct")].append(match)
        moved_here = 0
        for nct, group in sorted(by_nct.items()):
            if not nct:
                continue
            names = [m.get("matchedName", "") for m in group]
            if any(names_full_component_set(name, key, record, exclusive[key]) for name in names):
                reasons["the study's interventions name this product's full component set"] += 1
                continue
            target = None
            ground = ""
            for other in siblings[key]:
                other_matches = [m for m in (registry.get(other) or []) if m.get("nct") == nct]
                if other_matches and any(
                    names_full_component_set(m.get("matchedName", ""), other, combinations[other],
                                             exclusive.get(other, set()))
                    for m in other_matches
                ):
                    target, ground = other, "names that product's full component set"
                    break
            if target is None:
                holders = [
                    component["page"]
                    for component in record["components"]
                    if component["page"]
                    and any(m.get("nct") == nct for m in registry.get(component["page"]) or [])
                ]
                holders = sorted(set(holders))
                if len(holders) == 1:
                    target, ground = holders[0], "records the same study against its own name"
            if target is None:
                reasons["no page names the study's interventions in full, so nothing moved"] += 1
                continue
            rows.append({
                "nct": nct,
                "from_key": key,
                "to_key": target,
                "matched_name": names[0],
                "action": "move",
                "rule": "R14e-COMBINATION-COMPONENT-SET",
                "reason": (f"the registry interventions recorded for this study on the "
                           f"{printed[key]} page do not name its full component set "
                           f"({' + '.join(c['name'] for c in record['components'])}); "
                           f"{printed[target]} {ground}"),
            })
            moved_here += 1
        if moved_here:
            pages_with_moves += 1
    summary = {
        "combinationPages": len(combinations),
        "combinationPagesSharingAComponent": len(siblings),
        "pairsSharingAComponent": len({frozenset((key, other))
                                       for key, others in siblings.items() for other in others}),
        "pagesWithMovedStudies": pages_with_moves,
        "studiesMoved": len(rows),
        "studiesByOutcome": dict(sorted(reasons.items())),
    }
    return rows, summary, {key: {**combinations[key], "siblings": siblings[key]}
                           for key in siblings}


def purple_book_own_rows(printed: dict[str, str]) -> dict[str, list[dict]]:
    """Page -> every Purple Book row whose `proper_name` is the name that page prints.

    The same substance's rows are attached to every page carrying its UNII, so a page's own licence
    is the row that names it. `license_type` is the register's own word and is not interpreted here.
    """
    if not PURPLE_BOOK.exists():
        return {}
    frame = pd.read_parquet(PURPLE_BOOK, columns=["key", "field", "value", "source_date",
                                                  "source_url"])
    frame = frame[frame["field"] == "purpleBookProducts"]
    out: dict[str, list[dict]] = defaultdict(list)
    for key, value, source_date, source_url in zip(frame["key"], frame["value"],
                                                   frame["source_date"], frame["source_url"]):
        if key not in printed:
            continue
        row = json.loads(value)
        if name_key(row.get("proper_name")) != name_key(printed[key]):
            continue
        out[key].append({**row, "sourceDate": source_date, "sourceUrl": source_url})
    return dict(out)


def run_351a_merges(pages: dict[str, dict], printed: dict[str, str], live: set[str],
                    own_rows: dict[str, list[dict]]) -> tuple[dict[str, str], list[dict], Counter]:
    """A suffixed proper name licensed under 351(a) with the INN page's UNII is that page (section 12).

    The FDA gives a four-letter suffix to every biological proper name, biosimilar or not. Phase 3
    read the suffix as the marker of a biosimilar, which put a licensed-in-its-own-right biologic on
    a page of its own carrying the reference product's UNII. Section 12 corrects it: where the
    Purple Book licenses the page's own proper name under 351(a) and the page's UNII is the
    unsuffixed INN page's, R1 — identical UNII — licenses the merge, and the biosimilar exception
    does not apply. Where any row licenses the page under 351(k) the pages stay apart.
    """
    by_name: dict[str, list[str]] = defaultdict(list)
    for key in live:
        by_name[name_key(printed[key])].append(key)

    merge_map: dict[str, str] = {}
    applied: list[dict] = []
    reasons: Counter = Counter()
    for key in sorted(own_rows):
        if key not in live:
            continue
        licences = sorted({str(row.get("license_type") or "") for row in own_rows[key]})
        suffix = FDA_SUFFIX.match(printed[key].strip())
        if not suffix:
            continue
        if any(licence.startswith("351(k)") for licence in licences):
            reasons["the Purple Book licenses this proper name under 351(k)"] += 1
            continue
        if not any(licence.startswith("351(a)") for licence in licences):
            reasons["the Purple Book records no 351(a) or 351(k) licence for this proper name"] += 1
            continue
        unii = page_unii(pages[key])
        if not unii:
            reasons["the suffixed page records no UNII"] += 1
            continue
        candidates = [
            other for other in by_name.get(name_key(suffix.group("stem")), [])
            if other != key and page_unii(pages[other]) == unii
        ]
        if len(candidates) != 1:
            reasons["no single live page prints the unsuffixed name with the same UNII"] += 1
            continue
        inn = candidates[0]
        merge_map[key] = inn
        applied.append({
            "suffixed": key,
            "suffixedName": printed[key],
            "inn": inn,
            "innName": printed[inn],
            "unii": unii,
            "licenceTypes": licences,
            "blaNumbers": sorted({str(row.get("bla_number")) for row in own_rows[key]
                                  if row.get("bla_number")}),
            "sourceDate": own_rows[key][0].get("sourceDate"),
            "suffixedSlug": live_slug(pages[key]),
            "innSlug": live_slug(pages[inn]),
        })
        reasons["merged into the unsuffixed INN page under R1 (identical UNII)"] += 1
    return merge_map, applied, reasons


def keep_only_351k_biosimilar_edges(relations: pd.DataFrame,
                                    own_rows: dict[str, list[dict]]) -> tuple[pd.DataFrame, dict]:
    """`biosimilar_of` is kept only where the register licenses the page under 351(k) (section 12)."""
    licensed = {
        key for key, rows in own_rows.items()
        if any(str(row.get("license_type") or "").startswith("351(k)") for row in rows)
    }
    kept: list[dict] = []
    dropped: list[dict] = []
    for row in relations.to_dict("records"):
        if row["relation"] == "biosimilar_of" and row["page_a"] not in licensed:
            dropped.append(row)
            continue
        kept.append(row)
    summary = {
        "edgesBefore": int((relations["relation"] == "biosimilar_of").sum()),
        "edgesKept": sum(1 for row in kept if row["relation"] == "biosimilar_of"),
        "edgesDropped": len(dropped),
        "droppedPages": sorted({row["page_a"] for row in dropped})[:MAX_PRINT_ROWS],
    }
    return pd.DataFrame(kept, columns=RELATION_COLUMNS), summary


# ---------------------------------------------------------------------------------------------
# rebuilding the revision
# ---------------------------------------------------------------------------------------------

def build_canonical_v3(pages: dict[str, dict], merge_map: dict[str, str], printed: dict[str, str],
                       relation_rows: list[dict]) -> tuple[list[dict], list[dict]]:
    absorbed_by: dict[str, list[str]] = defaultdict(list)
    for old, survivor in merge_map.items():
        absorbed_by[survivor].append(old)

    added_relations: dict[str, list[dict]] = defaultdict(list)
    for row in relation_rows:
        added_relations[row["page_a"]].append(
            {"type": row["relation"], "targetKey": row["page_b"], "note": row["note"],
             "rule": row["rule"]})

    identifiers = ("chemblId", "unii", "cid", "cas", "rxcui", "drugbankId")
    records: list[dict] = []
    redirects: list[dict] = []
    for key, page in pages.items():
        if key in merge_map:
            continue
        record = dict(page["record"])
        merged_keys = sorted(absorbed_by.get(key, []))
        synonyms = list(record.get("synonyms") or [])
        seen = {IR.punct_norm(s.get("name", "")) for s in synonyms}
        for old in merged_keys:
            other = pages[old]
            incoming = [{"name": printed[old], "kind": "merged-page", "source": "identity-3.4"}]
            incoming += list(other["synonyms"])
            for synonym in incoming:
                token = IR.punct_norm(synonym.get("name", ""))
                if token and token not in seen:
                    seen.add(token)
                    synonyms.append(synonym)
            record["sourceRecords"] = ((record.get("sourceRecords") or [])
                                       + (other["record"].get("sourceRecords") or []))
            for field in identifiers:
                if not record.get(field) and other["record"].get(field):
                    record[field] = other["record"][field]
        record["synonyms"] = synonyms

        # An absorbed page's slug is inherited only when the survivor serves no slug of its own;
        # otherwise that slug redirects, and a record claiming it as well would serve it twice.
        survivor_slug = live_slug(page)
        merged_slugs = sorted({live_slug(pages[o]) for o in merged_keys if live_slug(pages[o])})
        if not survivor_slug and merged_slugs:
            survivor_slug = merged_slugs[0]
            record["existingSlug"] = survivor_slug
            record["adoptedSlug"] = survivor_slug
        elif survivor_slug:
            stem = re.sub(r"-\d+$", "", survivor_slug)
            if stem != survivor_slug and stem in merged_slugs:
                redirects.append({
                    "old_slug": survivor_slug,
                    "new_slug": stem,
                    "reason": f"MERGED: {key} adopted the unnumbered slug of a page it absorbed",
                })
                merged_slugs = [s for s in merged_slugs if s != stem]
                survivor_slug = stem
                record["existingSlug"] = stem
                record["adoptedSlug"] = stem
        for old_slug in merged_slugs:
            if old_slug != survivor_slug:
                redirects.append({
                    "old_slug": old_slug,
                    "new_slug": survivor_slug or "",
                    "reason": f"MERGED into {key} by the adjudicated identity decisions (3.4)",
                })

        seen_source = set()
        deduped = []
        for source in record.get("sourceRecords") or []:
            token = (source.get("source"), source.get("id"))
            if token not in seen_source:
                seen_source.add(token)
                deduped.append(source)
        record["sourceRecords"] = deduped

        override = {(relation["type"], relation["targetKey"]): relation
                    for relation in added_relations.get(key, [])}
        relations = []
        seen_relation = set()
        for relation in (record.get("relations") or []) + added_relations.get(key, []):
            target = merge_map.get(relation.get("targetKey"), relation.get("targetKey"))
            if not target or target == key:
                continue
            token = (relation.get("type"), target)
            if token in seen_relation:
                continue
            seen_relation.add(token)
            relations.append(override.get(token, {**relation, "targetKey": target}))
        record["relations"] = relations
        record["mergedFrom"] = sorted(set(record.get("mergedFrom") or []) | set(merged_keys))
        records.append(record)

    records.sort(key=lambda r: r["key"])
    return records, redirects


def merge_redirect_plan(existing: list[dict], new_rows: list[dict]) -> list[dict]:
    plan: dict[str, dict] = {}
    for row in existing + new_rows:
        old, new = row["old_slug"], row["new_slug"]
        if not old or not new or old == new or old in plan:
            continue
        plan[old] = {"old_slug": old, "new_slug": new, "reason": row["reason"]}
    # A plan row whose target is itself redirected is flattened, so no reader takes two hops.
    for row in plan.values():
        seen = {row["old_slug"]}
        target = row["new_slug"]
        while target in plan and target not in seen:
            seen.add(target)
            target = plan[target]["new_slug"]
        row["new_slug"] = target
    return sorted(plan.values(), key=lambda r: r["old_slug"])


def rebuild_display_names(rows: list[dict], merge_map: dict[str, str]) -> tuple[list[dict], list[dict]]:
    kept: list[dict] = []
    dropped: list[dict] = []
    for row in rows:
        if row["key"] in merge_map:
            dropped.append({"key": row["key"], "why": "the page merged into "
                                                      f"{merge_map[row['key']]}"})
            continue
        others = [k for k in row["collides_with"].split(";") if k and k not in merge_map]
        if not others:
            dropped.append({"key": row["key"], "why": "every page it collided with merged away, "
                                                      "so the page prints its own name again"})
            continue
        kept.append({**row, "collides_with": ";".join(sorted(others))})
    return kept, dropped


def rebuild_relations(relations: pd.DataFrame, merge_map: dict[str, str],
                      new_rows: list[dict]) -> tuple[pd.DataFrame, int]:
    override = {(row["page_a"], row["page_b"], row["relation"]): row for row in new_rows}
    used: set[tuple] = set()
    rows: list[dict] = []
    seen: set[tuple] = set()
    dropped = 0
    for row in relations.to_dict("records"):
        a = merge_map.get(row["page_a"], row["page_a"])
        b = merge_map.get(row["page_b"], row["page_b"])
        if a == b:
            dropped += 1
            continue
        token = (a, b, row["relation"])
        if token in seen:
            dropped += 1
            continue
        seen.add(token)
        if token in override:
            used.add(token)
            rows.append(override[token])
        else:
            rows.append({**row, "page_a": a, "page_b": b})
    for token, row in override.items():
        if token not in used:
            rows.append(row)
    return pd.DataFrame(rows, columns=RELATION_COLUMNS), dropped


def rebuild_trials(existing: list[dict], new_rows: list[dict],
                   merge_map: dict[str, str], live: set[str]) -> tuple[list[dict], dict]:
    rows: list[dict] = []
    seen: set[tuple] = set()
    counts = Counter()
    for row in existing + new_rows:
        from_key = merge_map.get(row["from_key"], row["from_key"])
        to_key = merge_map.get(row["to_key"], row["to_key"])
        if from_key == to_key:
            counts["dropped: a merge put both pages on one page"] += 1
            continue
        if from_key not in live or to_key not in live:
            counts["dropped: one side is not a live page"] += 1
            continue
        token = (row["nct"], from_key)
        if token in seen:
            counts["dropped: the study already moves off this page"] += 1
            continue
        seen.add(token)
        counts[row["rule"]] += 1
        rows.append({**row, "from_key": from_key, "to_key": to_key})
    rows.sort(key=lambda r: (r["rule"], r["from_key"], r["nct"]))
    return rows, dict(sorted(counts.items()))


def rekey_hold_list(rows: list[dict], merge_map: dict[str, str]) -> tuple[list[dict], list[dict]]:
    out: list[dict] = []
    rekeyed: list[dict] = []
    for row in rows:
        updated = dict(row)
        changes = {}
        for field in ("page_a", "page_b", "resolved_page_b"):
            value = (row.get(field) or "").strip()
            if value and value in merge_map:
                updated[field] = merge_map[value]
                changes[field] = {"before": value, "after": merge_map[value]}
        if changes:
            rekeyed.append({"name_a": row["name_a"], "name_b": row["name_b"], "changes": changes})
        out.append(updated)
    return out, rekeyed


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in columns})


# ---------------------------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out-dir", type=Path, default=IDENTITY)
    args = parser.parse_args()
    out = args.out_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)

    normaliser = IR.NameNormaliser(IR.load_salt_words())
    pages = load_pages(normaliser)
    display_rows = read_csv_rows(DISPLAY_NAMES)
    printed = {row["key"]: row["current_display_name"] for row in display_rows}
    printed = {key: printed.get(key) or page["displayName"] for key, page in pages.items()}
    relations = pd.read_parquet(RELATIONS)
    holds = read_csv_rows(HOLD_LIST)

    merges, form_of = apply_pairs(read_csv_rows(APPLY_LIST), pages)
    separated = separated_pairs(pages, relations, holds)
    merge_map, merges_applied, merges_refused = run_merges(merges, pages, separated)
    new_relation_rows, form_applied, form_refused = run_form_of(form_of, pages, merge_map, relations)

    records, new_redirects = build_canonical_v3(pages, merge_map, printed, new_relation_rows)
    live_keys = {record["key"] for record in records}
    plan = merge_redirect_plan(read_csv_rows(REDIRECT_PLAN), new_redirects)
    display_kept, display_dropped = rebuild_display_names(display_rows, merge_map)
    relations_v3, relations_dropped = rebuild_relations(relations, merge_map, new_relation_rows)
    trial_new, trial_summary = run_trial_moves(pages, printed, normaliser)

    # Section 11's biosimilar rule, on the same registry matches R14b reads: the FDA Purple Book
    # says which pages are biosimilars and of what, the relation says which page the corpus holds
    # the reference on, and a study naming only the reference product moves there.
    live_printed = {key: name for key, name in printed.items() if key in live_keys}
    purple = load_purple_book(live_printed)
    confirmed, biosimilar_reasons = biosimilar_pairs(relations_v3, live_printed, purple)
    biosimilar_new, biosimilar_summary = run_biosimilar_trial_moves(
        confirmed, live_printed, load_registry()
    )
    relations_v3, notes_rewritten = apply_biosimilar_notes(relations_v3, confirmed, live_printed)

    trials, trial_counts = rebuild_trials(
        read_csv_rows(TRIALS), trial_new + biosimilar_new, merge_map, live_keys
    )
    hold_v3, hold_rekeyed = rekey_hold_list(holds, merge_map)

    # ---- section 12: the v5 revision ---------------------------------------------------------
    #
    # Three corrections the rendered duplicate check and measure 2 found, applied on top of v3:
    # the 351(a) merges (a suffixed proper name licensed in its own right is the INN page), the
    # same-name partition, and the combination-component partition. v3 is written unchanged above
    # so the revision this run replaces stays readable beside the one it publishes.
    registry_matches = load_registry()
    own_rows = purple_book_own_rows(live_printed)
    merges_351a, merges_351a_applied, merges_351a_reasons = run_351a_merges(
        pages, printed, live_keys, own_rows
    )
    merge_map_v5 = {**merge_map, **merges_351a}
    for absorbed in list(merge_map_v5):
        survivor = merge_map_v5[absorbed]
        seen = {absorbed}
        while survivor in merge_map_v5 and survivor not in seen:
            seen.add(survivor)
            survivor = merge_map_v5[survivor]
        merge_map_v5[absorbed] = survivor

    records_v5, redirects_v5 = build_canonical_v3(pages, merge_map_v5, printed, new_relation_rows)
    live_v5 = {record["key"] for record in records_v5}
    printed_v5 = {key: name for key, name in printed.items() if key in live_v5}
    plan_v5 = merge_redirect_plan(read_csv_rows(REDIRECT_PLAN), redirects_v5)
    display_v5, display_v5_dropped = rebuild_display_names(display_rows, merge_map_v5)
    relations_v5, relations_v5_dropped = rebuild_relations(relations, merge_map_v5,
                                                           new_relation_rows)
    relations_v5, biosimilar_edges = keep_only_351k_biosimilar_edges(relations_v5, own_rows)
    confirmed_v5, biosimilar_reasons_v5 = biosimilar_pairs(
        relations_v5, printed_v5, load_purple_book(printed_v5)
    )
    biosimilar_new_v5, biosimilar_summary_v5 = run_biosimilar_trial_moves(
        confirmed_v5, printed_v5, registry_matches
    )
    relations_v5, notes_rewritten_v5 = apply_biosimilar_notes(relations_v5, confirmed_v5,
                                                              printed_v5)
    same_new, same_summary, same_families = run_same_name_partition(
        pages, printed, live_v5, registry_matches
    )
    combo_new, combo_summary, combo_records = run_combination_partition(
        pages, printed, live_v5, registry_matches
    )
    trials_v5, trial_counts_v5 = rebuild_trials(
        read_csv_rows(TRIALS),
        trial_new + biosimilar_new_v5 + same_new + combo_new,
        merge_map_v5,
        live_v5,
    )
    hold_v5, hold_v5_rekeyed = rekey_hold_list(holds, merge_map_v5)
    component_rows = [
        {
            "key": key,
            "slug": live_slug(pages[key]) or "",
            "printed_name": printed[key],
            "components": " + ".join(component["name"] for component in record["components"]),
            "component_keys": ";".join(component["page"] or "" for component in record["components"]),
            "shares_component_with": ";".join(record["siblings"]),
        }
        for key, record in sorted(combo_records.items())
    ]

    with (out / "canonical-v3.ndjson").open("w") as handle:
        for record in records:
            handle.write(json.dumps(record, sort_keys=True) + "\n")
    relations_v3.to_parquet(out / "relations-v3.parquet", index=False)
    write_csv(out / "display-names-v3.csv", display_kept, list(display_rows[0].keys()))
    write_csv(out / "redirect-plan-v3.csv", plan, REDIRECT_COLUMNS)
    write_csv(out / "trial-reassignments-v4.csv", trials, TRIAL_COLUMNS)
    write_csv(out / "hold-list-v3.csv", hold_v3, list(holds[0].keys()))

    with (out / "canonical-v5.ndjson").open("w") as handle:
        for record in records_v5:
            handle.write(json.dumps(record, sort_keys=True) + "\n")
    relations_v5.to_parquet(out / "relations-v5.parquet", index=False)
    write_csv(out / "display-names-v5.csv", display_v5, list(display_rows[0].keys()))
    write_csv(out / "redirect-plan-v5.csv", plan_v5, REDIRECT_COLUMNS)
    write_csv(out / "trial-reassignments-v5.csv", trials_v5, TRIAL_COLUMNS)
    write_csv(out / "hold-list-v5.csv", hold_v5, list(holds[0].keys()))
    write_csv(out / "combination-components-v5.csv", component_rows, COMPONENT_COLUMNS)

    summary = {
        "generatedAt": pd.Timestamp.now('UTC').strftime("%Y-%m-%dT%H:%M:%SZ"),
        "step": "3.4 application",
        "inputs": {
            "apply": str(APPLY_LIST.relative_to(ROOT)),
            "hold": str(HOLD_LIST.relative_to(ROOT)),
            "canonicalV2": str(CANONICAL_V2.relative_to(ROOT)),
            "relations": str(RELATIONS.relative_to(ROOT)),
            "decisions": str(DECISIONS.relative_to(ROOT)),
            "registryMatches": str(REGISTRY_MATCHES.relative_to(ROOT)),
        },
        "pages": {
            "before": len(pages),
            "after": len(records),
            "mergedAway": len(merge_map),
        },
        "appliedByRule": {
            "LICENSED-MERGE": len([e for e in merges_applied]),
            "LICENSED-FORM_OF": len(form_applied),
        },
        "merges": [
            {"pair": [e["page_a"], e["page_b"]], "names": [e["name_a"], e["name_b"]],
             "survivor": e.get("survivor"), "absorbed": e.get("absorbed"),
             "survivorName": printed.get(e.get("survivor")),
             "survivorSlug": live_slug(pages[e["survivor"]]) if e.get("survivor") in pages else None,
             "reach": e["reach"], "tier": e["tier"], "ground": e["licence_ground"],
             "applyRow": e["row"], "note": e["note"]}
            for e in merges_applied
        ],
        "formOf": [
            {"pair": [e["page_a"], e["page_b"]], "names": [e["name_a"], e["name_b"]],
             "child": e["child"], "parent": e["parent"], "relation": e["relation"],
             "note": e["note"], "backNote": e["backNote"], "edgesWritten": e["edgesWritten"],
             "edgesAlreadyRecorded": e["edgesAlreadyRecorded"],
             "provenance": {e["note"]: e["provenance"], e["backNote"]: e["provenance"]},
             "applyRow": e["row"]}
            for e in form_applied
        ],
        "refused": [
            {"pair": [e["page_a"], e["page_b"]], "names": [e["name_a"], e["name_b"]],
             "classification": e["classification"], "applyRow": e["row"],
             "reason": e["refusal"]}
            for e in merges_refused + form_refused
        ],
        "closureCheck": {
            "separatedPairsChecked": len(separated),
            "sources": ["identity-decisions.csv EXCEPTION-* rows",
                        "relations.parquet EXCEPTION-* rows",
                        "hold-list.csv pairs",
                        "identity_resolve.exception_class re-run over every new pair in a component"],
        },
        "heldPairsRekeyed": hold_rekeyed,
        "trialReassignment": {
            **trial_summary,
            "rule": "R14b-PARENT-NAME-TRIAL-FORM",
            "provenance": {
                "every registry intervention recorded for this study on the <form> page names "
                "<parent>; <form> is that name plus <form words>, so the study belongs to the "
                "parent page": [
                    "display-names.csv current_display_name or canonical-v2.displayName (both pages)",
                    "registry/matches/*.ndjson matchedName for every match of that NCT on the "
                    "form page",
                    "scripts/revamp/salts.txt, identity_resolve.ESTER_WORDS and "
                    "identity_resolve.CATION_WORDS for the removed tokens",
                ]
            },
            "rowsByRule": trial_counts,
            "rowsBefore": len(read_csv_rows(TRIALS)),
            "rowsAfter": len(trials),
        },
        "biosimilars": {
            **biosimilar_summary,
            "rule": "R14c-REFERENCE-PRODUCT-TRIAL",
            "relationRowsRewrittenToTheSection11Sentence": notes_rewritten,
            "pagesByOutcome": dict(sorted(biosimilar_reasons.items())),
            "provenance": {
                "<biosimilar> is a biosimilar of <reference>": [
                    "data/sources/orange-purple-book/mapped.parquet purpleBookProducts rows whose "
                    "proper_name is the name this page prints, license_type 351(k)",
                    "reference_product_proper_name and reference_product_proprietary_name on the "
                    "same rows",
                    "relations-v3 biosimilar_of page_b, which must print that reference name and "
                    "must be the only live page that does",
                ],
                "every registry intervention recorded for this study on the <biosimilar> page "
                "names the reference product": [
                    "registry/matches/*.ndjson matchedName for every match of that NCT on the "
                    "biosimilar page",
                    "the Purple Book reference product names above",
                ],
            },
        },
        "relations": {
            "before": int(len(relations)),
            "after": int(len(relations_v3)),
            "writtenByLicensedFormOf": len(new_relation_rows),
            "droppedOrRetargetedByMerges": relations_dropped,
        },
        "displayNames": {
            "before": len(display_rows),
            "after": len(display_kept),
            "dropped": display_dropped,
        },
        "redirectPlan": {
            "v2Rows": len(read_csv_rows(REDIRECT_PLAN)),
            "v3Rows": len(plan),
            "newRows": [row for row in plan
                        if row["old_slug"] not in {r["old_slug"]
                                                   for r in read_csv_rows(REDIRECT_PLAN)}],
        },
        "v5": {
            "spec": "docs/specs/phase4-generators.md#12",
            "pages": {"v3": len(records), "v5": len(records_v5),
                      "mergedAway": len(merge_map_v5)},
            "merges351a": {
                "rule": "R1-IDENTICAL-UNII over an FDA 351(a) licence; the biosimilar exception "
                        "does not apply (section 12)",
                "merged": len(merges_351a),
                "pagesByOutcome": dict(sorted(merges_351a_reasons.items())),
                "applied": merges_351a_applied[:MAX_PRINT_ROWS],
                "provenance": {
                    "<suffixed proper name> is the same substance as <INN>": [
                        "data/sources/orange-purple-book/mapped.parquet purpleBookProducts rows "
                        "whose proper_name is the name this page prints, license_type 351(a)",
                        "canonical-v2 unii on both pages, identical",
                        "the unsuffixed name is printed by exactly one other live page",
                    ]
                },
            },
            "biosimilarEdges": biosimilar_edges,
            "biosimilars": {
                **biosimilar_summary_v5,
                "relationRowsRewrittenToTheSection12Sentence": notes_rewritten_v5,
                "pagesByOutcome": dict(sorted(biosimilar_reasons_v5.items())),
            },
            "sameNamePartition": {
                "rule": "R14d-SAME-NAME-REGISTER-RANK",
                **same_summary,
                "familiesListed": [
                    {"sharedName": family["sharedName"], "slugStem": family["slugStem"],
                     "winner": family["winner"], "losers": family["losers"],
                     "ranking": family["ranking"]}
                    for family in same_families[:MAX_PRINT_ROWS]
                ],
                "provenance": {
                    "every registry intervention recorded for this study on the <page> page is "
                    "the name both pages print": [
                        "registry/matches/*.ndjson matchedName for every match of that NCT on the "
                        "losing page",
                        "page-slugs.csv display_name on both pages (the shared name)",
                        "page-slugs.csv slug on both pages (the unsuffixed slug)",
                        "canonical-v2 key prefix on both pages (the register rank)",
                    ]
                },
            },
            "combinationPartition": {
                "rule": "R14e-COMBINATION-COMPONENT-SET",
                **combo_summary,
                "provenance": {
                    "the registry interventions recorded for this study on the <product> page do "
                    "not name its full component set": [
                        "registry/matches/*.ndjson matchedName for every match of that NCT on the "
                        "combination page",
                        "page-slugs.csv display_name, split on the register's own component "
                        "separators",
                        "canonical-v2 synonyms of kind brand, common or display on the product and "
                        "on every product it shares a component with",
                    ]
                },
            },
            "relations": {"before": int(len(relations)), "after": int(len(relations_v5)),
                          "droppedOrRetargetedByMerges": relations_v5_dropped},
            "displayNames": {"after": len(display_v5), "dropped": display_v5_dropped},
            "redirectPlan": {"v3Rows": len(plan), "v5Rows": len(plan_v5)},
            "trialReassignments": {"rowsAfter": len(trials_v5), "rowsByRule": trial_counts_v5},
            "heldPairsRekeyed": hold_v5_rekeyed,
            "outputs": {
                "canonical": "data/revamp/identity/canonical-v5.ndjson",
                "relations": "data/revamp/identity/relations-v5.parquet",
                "displayNames": "data/revamp/identity/display-names-v5.csv",
                "redirectPlan": "data/revamp/identity/redirect-plan-v5.csv",
                "trialReassignments": "data/revamp/identity/trial-reassignments-v5.csv",
                "holdList": "data/revamp/identity/hold-list-v5.csv",
                "combinationComponents":
                    "data/revamp/identity/combination-components-v5.csv",
            },
        },
        "outputs": {
            "canonical": "data/revamp/identity/canonical-v3.ndjson",
            "relations": "data/revamp/identity/relations-v3.parquet",
            "displayNames": "data/revamp/identity/display-names-v3.csv",
            "redirectPlan": "data/revamp/identity/redirect-plan-v3.csv",
            "trialReassignments": "data/revamp/identity/trial-reassignments-v4.csv",
            "holdList": "data/revamp/identity/hold-list-v3.csv",
        },
    }
    (out / "apply-summary.json").write_text(json.dumps(summary, indent=2) + "\n")

    print(f"pages {summary['pages']['before']} -> {summary['pages']['after']} "
          f"({summary['pages']['mergedAway']} merged away)")
    print(f"merges applied {len(merges_applied)} · form-of applied {len(form_applied)} "
          f"· refused {len(summary['refused'])}")
    print(f"redirect plan {summary['redirectPlan']['v2Rows']} -> {summary['redirectPlan']['v3Rows']} rows")
    print(f"trial reassignments {summary['trialReassignment']['rowsBefore']} -> "
          f"{summary['trialReassignment']['rowsAfter']} rows "
          f"({trial_summary['studiesMoved']} studies moved off "
          f"{trial_summary['childPagesWithMovedStudies']} form pages)")
    print(f"biosimilars: {len(confirmed)} pages licensed under 351(k) against the page they point "
          f"at; {biosimilar_summary['studiesMoved']} studies naming only the reference product "
          f"moved off {biosimilar_summary['biosimilarPagesWithMovedStudies']} of them; "
          f"{notes_rewritten} relation notes now open \"X is a biosimilar of Y\"")
    for row in summary["merges"][:MAX_PRINT_ROWS]:
        print(f"  MERGE   {row['absorbed']} -> {row['survivor']} ({row['survivorName']})")
    for row in summary["formOf"][:MAX_PRINT_ROWS]:
        print(f"  FORM_OF {row['child']} {row['relation']} {row['parent']}: {row['note']}")
    for row in summary["refused"][:MAX_PRINT_ROWS]:
        print(f"  REFUSED {row['pair']}: {row['reason']}", file=sys.stderr)
    print(f"v5 (section 12): {len(merges_351a)} suffixed 351(a) pages merged into their INN page; "
          f"{biosimilar_edges['edgesKept']} biosimilar_of edges kept of "
          f"{biosimilar_edges['edgesBefore']}; "
          f"{same_summary['pagesPartitioned']} same-name pages partitioned "
          f"({same_summary['studiesMoved']} studies moved); "
          f"{combo_summary['combinationPagesSharingAComponent']} combination pages sharing a "
          f"component partitioned ({combo_summary['studiesMoved']} studies moved); "
          f"redirect plan {len(plan_v5)} rows; trial reassignments {len(trials_v5)} rows")
    for row in merges_351a_applied[:MAX_PRINT_ROWS]:
        print(f"  351(a) {row['suffixed']} ({row['suffixedName']}) -> {row['inn']} "
              f"({row['innName']}), UNII {row['unii']}")
    print(f"written to {(out / 'apply-summary.json').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
