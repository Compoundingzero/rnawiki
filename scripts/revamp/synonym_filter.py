#!/usr/bin/env python
"""Phase 4 section 18 item 1 — the names a page prints under "Also called" and "Salt form".

`docs/specs/phase4-generators.md` section 18 item 1, from the lead's reading of slop draw 12:

    "Also called" lists registry intervention "other names" that are other pages' display names or
    class terms (letrozole lists anastrozole, exemestane, "aromatase inhibitors", "ai", "nsai"), and
    "Salt form" lists product and dosage-form strings ("LETROZOLE TABLETS", "estratest tablets",
    "POISON ADSORBENT"). Rule: a registry-derived name that equals another page's display name or
    synonym, or a class-vocabulary term (ATC class names, pharmacologic action terms, the words
    class/inhibitors/agonists/analogues), is excluded; "Salt form" holds only names that strip to
    the page's own name plus a counter-ion from `scripts/revamp/salts.txt`; dosage-form and product
    strings (tablets, injection, adsorbent, solution …) are trade names when a register records them
    as products, otherwise dropped.

This is a data-level decision, not a sentence: no prose is written here and no name is invented. The
decision is taken once, corpus-wide, because every rule needs every other page's names, and the
loader (`scripts/corpus-20k/load/materialise.ts`) reads one tier at a time. The output is the same
channel section 17 item 5 already uses — a per-page list of `{name, from, to, reason}` corrections
that `scripts/revamp/page_blocks.py` puts on the page bundle, that the loader applies when it writes
`page_synonyms`, and that `scripts/corpus-20k/render/page-text.ts` applies to the measured text — so
the page's headings and the render's bracketed kinds move together or not at all.

    .venv-corpus/bin/python scripts/revamp/synonym_filter.py

Outputs:
  * `data/revamp/identity/synonym-filter-v1.csv` — one row per correction.
  * `data/revamp/identity/synonym-filter-summary.json` — counts by reason and 30 examples.

Every vocabulary this script tests against is read from a recorded source, never hand-written as a
list of drugs:

  * **another page's name**: the display name and the substance-name synonyms (display, common,
    INN, USAN, BAN, JAN) of every other corpus page, from `canonical-v7.ndjson`. A brand is a
    product name and is not a name of the substance, which is why `brand` is not in that set —
    the same reading section 17 item 5 took.
  * **ATC class names**: the level-1 to level-4 descriptions ChEMBL publishes with each ATC code it
    records against a molecule (`data/sources/chembl/mapped.parquet`, field `atc`).
  * **pharmacologic-action terms**: the class statements DrugCentral and Inxight record against the
    substance (`data/revamp/fields-v2`, field `mechanismClass.classStatements`), which is the same
    vocabulary `scripts/revamp/interactions_build.py` reads a class off.
  * **the generic words** section 18 names — class, inhibitors, agonists, antagonists, analogues,
    blockers — with their singulars, which are words about a group of substances and never a name
    of one.
  * **counter-ions**: `scripts/revamp/salts.txt`, unchanged and append-only.
  * **dosage forms**: the forms the HSA listing and the FDA Orange Book publish for their own
    products (`dosageForm`, `dosage_form_and_route`), tokenised — a register's own vocabulary for
    what a product is, plus the words section 18 itself names.
  * **product names**: the product and proprietary names the registers record for this page — the
    HSA listing's `productName`, the Orange Book's `trade_name`, the Purple Book's
    `proprietary_name`, the EMA register's `medicine_name`, and Inxight's marketing-status
    `products`. A dosage-form string a register prints as a product name is a trade name; one no
    register prints is neither a name of the substance nor a product and is dropped.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
from collections import Counter, defaultdict
from typing import Any, Iterable

import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def repo(*parts: str) -> str:
    return os.path.join(ROOT, *parts)


NON_ALNUM = re.compile(r"[^a-z0-9]+")
PARENTHETICAL = re.compile(r"\([^)]*\)")
BRACKETED = re.compile(r"\[[^\]]*\]")

# The kinds that are names of the substance itself. `brand`, `code`, `fragment` and `merged-page`
# are excluded for the reason `docs/specs/interaction-rules.md` section 1 excludes them: a brand is
# a product and a code is a token.
NAME_KINDS = ("display", "common", "inn", "usan", "ban", "jan")

# Open Targets publishes the registry's own "other names" for a molecule — the alias list a trial
# registration and a label carry beside the intervention's name — and `scripts/corpus-20k/identity/
# resolve.py` stores them as `common` and `brand` synonyms under this source. They are the list
# section 18 read letrozole's "anastrozole", "exemestane" and "aromatase inhibitors" out of.
REGISTRY_SOURCES = ("open-targets",)

# The words section 18 names, with their singulars. A word that names a group of substances is
# never a name of one substance.
GENERIC_CLASS_WORDS = {
    "class",
    "classes",
    "inhibitor",
    "inhibitors",
    "agonist",
    "agonists",
    "antagonist",
    "antagonists",
    "analogue",
    "analogues",
    "analog",
    "analogs",
    "blocker",
    "blockers",
}

# The words section 18 itself names as dosage-form or product strings, beside the forms the two
# registers publish. "kit" and "adsorbent" are what a product is, not what a substance is called.
SPEC_FORM_WORDS = {
    "tablet",
    "tablets",
    "capsule",
    "capsules",
    "injection",
    "solution",
    "adsorbent",
    "cream",
    "spray",
    "kit",
}

# Tokens that carry no form on their own and would match half the corpus if they were left in the
# register-derived dosage-form vocabulary.
FORM_TOKEN_STOPWORDS = {
    "and",
    "for",
    "the",
    "with",
    "not",
    "per",
    "use",
    "oral",
    "human",
    "sterile",
    "single",
    "multiple",
    "metered",
    "coated",
    "release",
    "extended",
    "delayed",
    "rel",
    "augmented",
    "chewing",
    "pellets",
    "concentrate",
    "sugar",
    "film",
    "multilayer",
    "orally",
    "enteric",
    "liquid",
    "gelatin",
    "filled",
    "effervescent",
    "disintegrating",
    "radiopharmaceutical",
    "liposomal",
    "lyophilized",
}


def norm(value: Any) -> str:
    """Lowercase, brackets and parentheses removed, punctuation collapsed to single spaces."""
    text = str(value or "").lower()
    text = BRACKETED.sub(" ", PARENTHETICAL.sub(" ", text))
    return NON_ALNUM.sub(" ", text).strip()


def load_salts(path: str) -> list[tuple[str, ...]]:
    """The counter-ion suffixes, longest first, each as a token tuple."""
    suffixes: list[tuple[str, ...]] = []
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            tokens = tuple(norm(line).split())
            if tokens:
                suffixes.append(tokens)
    suffixes.sort(key=len, reverse=True)
    return suffixes


def strip_counter_ions(tokens: list[str], suffixes: list[tuple[str, ...]]) -> tuple[list[str], int]:
    """Strip trailing counter-ion and hydrate suffixes; return what is left and how many came off.

    `scripts/revamp/salts.txt` records its own contract: "matched as a trailing whitespace-delimited
    token sequence". Stripping repeats, because a name carries a counter-ion and a hydrate together
    ("amlodipine besylate monohydrate").
    """
    stripped = 0
    changed = True
    while changed and tokens:
        changed = False
        for suffix in suffixes:
            width = len(suffix)
            if width < len(tokens) and tuple(tokens[-width:]) == suffix:
                tokens = tokens[:-width]
                stripped += 1
                changed = True
                break
    return tokens, stripped


def load_page_names(canonical: str, pages: set[str]) -> tuple[dict[str, str], dict[str, list[dict]]]:
    display: dict[str, str] = {}
    synonyms: dict[str, list[dict]] = {}
    with open(canonical, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            key = record.get("key")
            if key not in pages:
                continue
            display[key] = record.get("displayName") or key
            synonyms[key] = [row for row in (record.get("synonyms") or []) if row.get("name")]
    return display, synonyms


def load_atc_class_names(path: str) -> set[str]:
    """Every ATC level description ChEMBL publishes beside a code it records against a molecule."""
    if not os.path.exists(path):
        raise SystemExit(
            "%s is missing: section 18's class vocabulary reads ChEMBL's ATC level descriptions "
            "from it" % os.path.relpath(path, ROOT)
        )
    frame = pd.read_parquet(path, columns=["field", "value"])
    names: set[str] = set()
    for value in frame[frame["field"] == "atc"]["value"]:
        try:
            record = json.loads(value)
        except (TypeError, ValueError):
            continue
        for level in ("level1Description", "level2Description", "level3Description",
                      "level4Description"):
            text = norm(record.get(level))
            if text:
                names.add(text)
    return names


def load_action_terms(fields_dir: str, sources: Iterable[str]) -> set[str]:
    """The pharmacologic class statements DrugCentral and Inxight record against a substance."""
    wanted = set(sources)
    terms: set[str] = set()
    for model in sorted(os.listdir(fields_dir)):
        model_dir = os.path.join(fields_dir, model)
        if not os.path.isdir(model_dir):
            continue
        for name in sorted(os.listdir(model_dir)):
            if not name.endswith(".ndjson"):
                continue
            with open(os.path.join(model_dir, name), encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line:
                        continue
                    record = json.loads(line)
                    value = (record.get("fields") or {}).get("mechanismClass") or {}
                    value = value.get("value")
                    statements = value.get("classStatements") if isinstance(value, dict) else None
                    for statement in statements or []:
                        if not isinstance(statement, dict):
                            continue
                        if statement.get("source") not in wanted:
                            continue
                        text = norm(statement.get("statement"))
                        if text:
                            terms.add(text)
    return terms


def load_form_tokens(hsa: str, orange: str) -> set[str]:
    """The dosage-form vocabulary the HSA listing and the Orange Book publish for their products."""
    tokens: set[str] = set(SPEC_FORM_WORDS)
    for path, field, column in ((hsa, "hsaProduct", "dosageForm"),
                                (orange, "orangeBookProducts", "dosage_form_and_route")):
        if not os.path.exists(path):
            raise SystemExit(
                "%s is missing: section 18's dosage-form vocabulary is read from the registers' own "
                "published forms" % os.path.relpath(path, ROOT)
            )
        frame = pd.read_parquet(path, columns=["field", "value"])
        for value in frame[frame["field"] == field]["value"]:
            try:
                record = json.loads(value)
            except (TypeError, ValueError):
                continue
            text = record.get(column)
            if not text:
                continue
            head = str(text).split(";")[0]
            for token in norm(head).split():
                if len(token) >= 3 and token not in FORM_TOKEN_STOPWORDS:
                    tokens.add(token)
                    if not token.endswith("s"):
                        tokens.add(token + "s")
    return tokens


def load_product_names(paths: dict[str, str]) -> dict[str, set[str]]:
    """Per page, the product and proprietary names the registers record for it."""
    out: dict[str, set[str]] = defaultdict(set)
    readers = (
        (paths["hsa"], "hsaProduct", lambda record: [record.get("productName")]),
        (paths["orange"], "orangeBookProducts", lambda record: [record.get("trade_name")]),
        (paths["orange"], "purpleBookProducts", lambda record: [record.get("proprietary_name")]),
        (paths["ema"], "regulatory.EU", lambda record: [record.get("medicine_name")]),
        (paths["inxight"], "marketingStatus", lambda record: list(record.get("products") or [])),
    )
    for path, field, pick in readers:
        if not os.path.exists(path):
            raise SystemExit(
                "%s is missing: section 18 decides a dosage-form string by whether a register "
                "prints it as a product name" % os.path.relpath(path, ROOT)
            )
        frame = pd.read_parquet(path, columns=["key", "field", "value"])
        for row in frame[frame["field"] == field].itertuples(index=False):
            try:
                record = json.loads(row.value)
            except (TypeError, ValueError):
                continue
            if not isinstance(record, dict):
                continue
            for name in pick(record):
                text = norm(name)
                if text:
                    out[row.key].add(text)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--canonical", default=repo("data", "revamp", "identity",
                                                    "canonical-v7.ndjson"))
    parser.add_argument("--models", default=repo("data", "revamp", "tiers",
                                                 "model-assignment-v3.ndjson"))
    parser.add_argument("--fields-dir", default=repo("data", "revamp", "fields-v2"))
    parser.add_argument("--salts", default=repo("scripts", "revamp", "salts.txt"))
    parser.add_argument("--chembl", default=repo("data", "sources", "chembl", "mapped.parquet"))
    parser.add_argument("--hsa", default=repo("data", "sources", "hsa-singapore", "mapped.parquet"))
    parser.add_argument("--orange", default=repo("data", "sources", "orange-purple-book",
                                                 "mapped.parquet"))
    parser.add_argument("--ema", default=repo("data", "sources", "ema", "mapped.parquet"))
    parser.add_argument("--inxight", default=repo("data", "sources", "inxight", "mapped.parquet"))
    parser.add_argument("--out", default=repo("data", "revamp", "identity",
                                              "synonym-filter-v1.csv"))
    parser.add_argument("--summary", default=repo("data", "revamp", "identity",
                                                  "synonym-filter-summary.json"))
    parser.add_argument("--examples", type=int, default=30)
    args = parser.parse_args()

    pages: set[str] = set()
    with open(args.models, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                pages.add(json.loads(line)["key"])

    display, synonyms = load_page_names(args.canonical, pages)
    salts = load_salts(args.salts)
    atc_names = load_atc_class_names(args.chembl)
    action_terms = load_action_terms(args.fields_dir, ("drugcentral", "inxight"))
    class_vocabulary = atc_names | action_terms | GENERIC_CLASS_WORDS
    form_tokens = load_form_tokens(args.hsa, args.orange)
    product_names = load_product_names(
        {"hsa": args.hsa, "orange": args.orange, "ema": args.ema, "inxight": args.inxight}
    )

    # The corpus's name index: a normalised, counter-ion-stripped name to the pages that record it
    # as a name of the substance.
    def stripped(text: str) -> str:
        tokens, _ = strip_counter_ions(text.split(), salts)
        return " ".join(tokens)

    by_name: dict[str, set[str]] = defaultdict(set)
    for key in display:
        own = norm(display[key])
        for text in (own, stripped(own)):
            if text:
                by_name[text].add(key)
        for row in synonyms.get(key, []):
            if row.get("kind") not in NAME_KINDS:
                continue
            text = norm(row.get("name"))
            for candidate in (text, stripped(text)):
                if candidate:
                    by_name[candidate].add(key)
    by_name.pop("", None)

    reasons: Counter = Counter()
    kinds_before: Counter = Counter()
    examples: dict[str, list[dict[str, str]]] = defaultdict(list)
    corrections: list[dict[str, str]] = []
    pages_touched: set[str] = set()
    dropped = 0

    for key in sorted(display):
        own_norm = norm(display[key])
        own_tokens = own_norm.split()
        own_stripped = stripped(own_norm)
        products = product_names.get(key, set())
        # One row per stored synonym is not the grain a correction applies at: the loader writes
        # `page_synonyms` keyed on the page, the kind and the lowercased name, so two records of one
        # spelling from two sources are one row on the page. A correction is therefore decided over
        # the whole group, and a group any non-registry source also recorded is not a registry name.
        groups: dict[tuple[str, str], dict[str, Any]] = {}
        for row in synonyms.get(key, []):
            kind = row.get("kind")
            if kind == "display":
                continue
            name = str(row.get("name") or "")
            group = groups.setdefault(
                (str(kind), name.lower()), {"kind": kind, "name": name, "sources": set()}
            )
            group["sources"].add(row.get("source"))
        for group in groups.values():
            kind = group["kind"]
            name = group["name"]
            sources = group["sources"]
            source = "; ".join(sorted(str(item) for item in sources if item))
            registry_only = bool(sources) and all(
                item in REGISTRY_SOURCES for item in sources
            )
            text = norm(name)
            # Only the page's own name is out of scope. Its counter-ion-stripped form is not: on a
            # salt page ("Zinc Sulfate Anhydrous") the stripped form is the moiety ("Zinc"), and a
            # name that is the moiety is not a salt form of this record — it is the other page.
            if not text or text == own_norm:
                continue
            tokens = text.split()
            carries_own = bool(own_tokens) and any(
                tokens[index:index + len(own_tokens)] == own_tokens
                for index in range(len(tokens) - len(own_tokens) + 1)
            )
            has_form_token = any(token in form_tokens for token in tokens)
            is_product = text in products

            rule = to_kind = reason = None

            if registry_only and not carries_own:
                others = by_name.get(text, set()) | by_name.get(stripped(text), set())
                others = others - {key}
                if others:
                    rule = "S18-1a-REGISTRY-NAME-OF-ANOTHER-PAGE"
                    to_kind = "drop"
                    reason = ("a registry-derived name that is the recorded name of %s"
                              % ", ".join(sorted(others)[:3]))
                elif text in class_vocabulary:
                    rule = "S18-1b-REGISTRY-CLASS-TERM"
                    to_kind = "drop"
                    reason = "a registry-derived name that is a class-vocabulary term"
                elif len(tokens) == 1 and tokens[0] in GENERIC_CLASS_WORDS:
                    rule = "S18-1b-REGISTRY-CLASS-TERM"
                    to_kind = "drop"
                    reason = "a registry-derived name that is a class word"

            if rule is None and kind == "salt":
                rest, removed = strip_counter_ions(list(tokens), salts)
                if " ".join(rest) == own_norm and removed > 0:
                    pass  # the page's own name plus a counter-ion: this is a salt form.
                elif has_form_token and is_product:
                    rule = "S18-1d-FORM-STRING-IS-A-PRODUCT"
                    to_kind = "brand"
                    reason = "a dosage-form string a register records as a product name"
                elif has_form_token:
                    rule = "S18-1d-FORM-STRING-NO-PRODUCT"
                    to_kind = "drop"
                    reason = "a dosage-form string no register records as a product name"
                else:
                    rule = "S18-1c-NOT-A-SALT-FORM"
                    to_kind = "common"
                    reason = "not this record's own name plus a counter-ion"

            if rule is None and registry_only and kind != "brand" and has_form_token:
                if is_product:
                    rule = "S18-1d-FORM-STRING-IS-A-PRODUCT"
                    to_kind = "brand"
                    reason = "a dosage-form string a register records as a product name"
                else:
                    rule = "S18-1d-FORM-STRING-NO-PRODUCT"
                    to_kind = "drop"
                    reason = "a dosage-form string no register records as a product name"

            if rule is None:
                continue

            corrections.append({
                "key": key,
                "page": display[key],
                "name": name,
                "from_kind": kind,
                "to_kind": to_kind,
                "source": source,
                "rule": rule,
                "reason": reason,
            })
            if to_kind == "drop":
                dropped += 1
            pages_touched.add(key)
            reasons[rule] += 1
            kinds_before[f"{kind} -> {to_kind}"] += 1
            if len(examples[rule]) < args.examples:
                examples[rule].append({
                    "page": display[key], "name": name, "from": kind, "to": to_kind,
                    "source": source, "reason": reason,
                })

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["key", "page", "name", "from_kind", "to_kind", "source", "rule", "reason"],
        )
        writer.writeheader()
        for row in corrections:
            writer.writerow(row)

    flat_examples: list[dict[str, str]] = []
    rule_order = sorted(examples)
    index = 0
    while len(flat_examples) < args.examples and any(
        index < len(examples[rule]) for rule in rule_order
    ):
        for rule in rule_order:
            if index < len(examples[rule]) and len(flat_examples) < args.examples:
                flat_examples.append({"rule": rule, **examples[rule][index]})
        index += 1

    summary = {
        "generatedBy": "scripts/revamp/synonym_filter.py",
        "spec": "docs/specs/phase4-generators.md#18",
        "corpusPages": len(display),
        "synonymsRead": sum(len(rows) for rows in synonyms.values()),
        "corrections": len(corrections),
        "pagesTouched": len(pages_touched),
        "byRule": dict(sorted(reasons.items())),
        "byKindChange": dict(sorted(kinds_before.items())),
        "dropped": dropped,
        "reassigned": len(corrections) - dropped,
        "vocabularies": {
            "atcClassNames": len(atc_names),
            "pharmacologicActionTerms": len(action_terms),
            "genericClassWords": len(GENERIC_CLASS_WORDS),
            "dosageFormTokens": len(form_tokens),
            "pagesWithARegisterProductName": len(product_names),
            "registrySources": list(REGISTRY_SOURCES),
        },
        "examples": flat_examples,
    }
    with open(args.summary, "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
        handle.write("\n")

    printable = dict(summary)
    printable["examples"] = flat_examples[:10]
    print(json.dumps(printable, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
