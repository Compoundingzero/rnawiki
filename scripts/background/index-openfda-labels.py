#!/usr/bin/env python3
"""Index openFDA's bulk drug-label archive down to the labels and fields the extractors read.

The archive is 14 partitions of roughly a gigabyte each once decompressed, which exceeds the
maximum string length a Node process can hold, so the reduction step runs here. Nothing is
interpreted: this copies label section text verbatim and drops every field the extractors do not
use, producing one compact NDJSON record per label.

Passing the medicine list narrows the output to labels the corpus can actually reach, which is what
makes it affordable to keep the wider set of sections the extractors read.

Usage: python3 scripts/background/index-openfda-labels.py <archiveDir> <outFile.ndjson>
                                                          [medicineRows.json]
                                                          [--presence=<file.ndjson>]

`--presence` writes a second, unfiltered stream carrying only structured identity for every label:
names, declared substance count, product types and routes. It exists because the filtered stream
drops labels with no readable prose, which is most botanical, homeopathic and allergenic labelling
— and those labels still record that a substance is a declared active ingredient of a marketed
product, which is the only honest thing many rows in this corpus have.
"""

import json
import os
import re
import sys
import zipfile

# Each section is capped at the length the extractors actually read. The values differ because the
# sections differ: a mechanism statement is a paragraph, while clinical pharmacology is a chapter.
SECTION_BUDGETS = {
    "indications_and_usage": 12000,
    "dosage_forms_and_strengths": 6000,
    "clinical_pharmacology": 40000,
    "pharmacokinetics": 40000,
    "mechanism_of_action": 12000,
    "pharmacodynamics": 12000,
    "description": 12000,
    "contraindications": 8000,
    "boxed_warning": 8000,
    "drug_interactions": 20000,
    "warnings_and_cautions": 20000,
    "adverse_reactions": 20000,
    "use_in_specific_populations": 20000,
    "pregnancy": 8000,
    "pediatric_use": 8000,
    "geriatric_use": 8000,
    "nursing_mothers": 6000,
    "overdosage": 6000,
    "clinical_studies": 30000,
    "drug_abuse_and_dependence": 8000,
    "how_supplied": 6000,
}

# Sections that decide whether a label is worth keeping at all, and what each is worth. A label
# with none of these carries nothing any extractor reads.
SECTION_SCORES = {
    "pharmacokinetics": 4,
    "clinical_pharmacology": 3,
    "mechanism_of_action": 3,
    "description": 2,
    "dosage_forms_and_strengths": 2,
    "clinical_studies": 2,
    "contraindications": 1,
    "drug_interactions": 1,
    "boxed_warning": 1,
    "indications_and_usage": 1,
    "adverse_reactions": 1,
    "use_in_specific_populations": 1,
    "how_supplied": 1,
}

SALT_AND_FORM_WORDS = (
    r"hydrochloride|hcl|sodium|potassium|calcium|sulfate|sulphate|tartrate|maleate|mesylate|"
    r"besylate|fumarate|succinate|citrate|acetate|phosphate|bitartrate|dihydrate|monohydrate|"
    r"anhydrous|micronized|usp|injection|tablets?|capsules?|oral|solution|suspension|cream|"
    r"ointment|gel|spray|"
    # Water of crystallisation and unambiguous counterions, added after "ATORVASTATIN CALCIUM" and
    # "ATORVASTATIN CALCIUM TRIHYDRATE" on one label were counted as two substances, which made
    # Lipitor read as a combination product and cost it both its aliases and its substance data.
    # 405 labels were being miscounted this way.
    #
    # Deliberately NOT here: bicarbonate, carbonate, chloride and oxide. Each is a real active
    # ingredient in real products — sodium bicarbonate in the omeprazole combination, calcium
    # carbonate as an antacid — and stripping them would collapse genuine combinations into one
    # of their ingredients, which is the opposite mistake and a worse one.
    r"trihydrate|hemihydrate|pentahydrate|sesquihydrate|hydrate|hydrous|hydrobromide|hbr|"
    r"monosodium|disodium|dipotassium|tosylate|edisylate|isethionate|napsylate|xinafoate|"
    r"pamoate|embonate|hyclate|meglumine|dimeglumine|tromethamine|trometamol"
)
PARENTHETICAL = re.compile(r"\([^)]*\)")
SALT_AND_FORM = re.compile(r"\b(?:%s)\b" % SALT_AND_FORM_WORDS)
NON_ALNUM = re.compile(r"[^a-z0-9]+")


def normalize_name(value):
    """Mirrors normalizeName in build-extracted-background.ts. The two must agree exactly."""
    lowered = value.lower()
    lowered = PARENTHETICAL.sub(" ", lowered)
    lowered = SALT_AND_FORM.sub(" ", lowered)
    return NON_ALNUM.sub(" ", lowered).strip()


def load_wanted_names(path):
    with open(path, encoding="utf-8") as handle:
        rows = json.load(handle)
    wanted = set()
    for row in rows:
        candidates = [row.get("name")]
        trade = row.get("tradeName")
        if trade:
            candidates.extend(re.split(r"\s*[/,]\s*", trade))
        for candidate in candidates:
            if not candidate:
                continue
            key = normalize_name(candidate)
            if len(key) >= 3:
                wanted.add(key)
    return wanted


def first_text(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        joined = "\n".join(item for item in value if isinstance(item, str))
        return joined or None
    return None


def score(sections):
    return sum(points for key, points in SECTION_SCORES.items() if sections.get(key))


def presence_record(result, openfda, set_id):
    """The structured facts about a label that hold whether or not it has readable prose.

    The extraction stream keeps only labels carrying a section an extractor reads, which is right
    for extraction and wrong for counting. Roughly half the corpus is botanicals, homeopathic
    preparations and allergenic extracts whose labels carry no pharmacology at all, so they scored
    zero and left those rows blank — while the same labels plainly record that the substance is a
    declared active ingredient of a marketed product, in stated forms, by stated routes.

    That is a fact about the archive, it is checkable against the set ids kept here, and it is not
    a claim about the substance. This stream carries it for every label, unfiltered.
    """
    names = sorted(
        {
            key
            for key in (
                normalize_name(value)
                for value in list(openfda.get("generic_name") or [])
                + list(openfda.get("substance_name") or [])
            )
            if len(key) >= 3
        }
    )
    if not names:
        return None
    return {
        "setId": set_id,
        "names": names,
        # How many distinct active substances the document declares, so a count of labels can be
        # split into those about the substance alone and those where it is one ingredient of many.
        "declared": len(names),
        "productTypes": sorted(set(openfda.get("product_type") or [])),
        "routes": sorted(set(openfda.get("route") or [])),
        "effectiveTime": result.get("effective_time"),
    }


def main():
    if len(sys.argv) not in (3, 4, 5):
        print(__doc__)
        sys.exit(1)
    archive_dir, out_path = sys.argv[1], sys.argv[2]
    wanted = None
    presence_path = None
    for argument in sys.argv[3:]:
        if argument.startswith("--presence="):
            presence_path = argument[len("--presence=") :]
        else:
            wanted = load_wanted_names(argument)
    if wanted is not None:
        print("[index] filtering to %d wanted medicine names" % len(wanted), flush=True)
    if presence_path:
        print("[index] also writing unfiltered presence stream to %s" % presence_path, flush=True)

    zips = sorted(f for f in os.listdir(archive_dir) if f.endswith(".json.zip"))
    written = 0
    skipped = 0
    presence_written = 0
    presence_out = open(presence_path, "w", encoding="utf-8") if presence_path else None

    with open(out_path, "w", encoding="utf-8") as out:
        for position, name in enumerate(zips, start=1):
            with zipfile.ZipFile(os.path.join(archive_dir, name)) as archive:
                member = archive.namelist()[0]
                with archive.open(member) as handle:
                    payload = json.load(handle)

            for result in payload.get("results", []):
                openfda = result.get("openfda") or {}
                generic_names = openfda.get("generic_name") or []
                set_id = result.get("set_id")

                # Written before every filter below, because a label that carries no readable prose
                # still records that the substance is on the market — and that is precisely the
                # label the extraction stream is right to drop and wrong to forget.
                if presence_out is not None and set_id:
                    entry = presence_record(result, openfda, set_id)
                    if entry is not None:
                        presence_out.write(json.dumps(entry, ensure_ascii=False))
                        presence_out.write("\n")
                        presence_written += 1

                if not generic_names or not set_id:
                    skipped += 1
                    continue

                # Substance names are carried because they match salt-form and combination rows the
                # generic name misses.
                all_names = (
                    list(generic_names)
                    + list(openfda.get("brand_name") or [])
                    + list(openfda.get("substance_name") or [])
                )
                if wanted is not None:
                    if not any(normalize_name(candidate) in wanted for candidate in all_names):
                        skipped += 1
                        continue

                sections = {}
                for key, budget in SECTION_BUDGETS.items():
                    text = first_text(result.get(key))
                    if text:
                        sections[key] = text[:budget]

                if score(sections) == 0:
                    skipped += 1
                    continue

                # How many distinct active substances this document is about, after the same
                # normalization the matcher uses so salt forms collapse. A multi-ingredient
                # product (allergenic extract, homeopathic combination, multivitamin) declares
                # many, and nothing substance-specific on it belongs to any one of them.
                normalized_substances = {
                    key
                    for key in (
                        normalize_name(name)
                        for name in list(generic_names) + list(openfda.get("substance_name") or [])
                    )
                    if key
                }

                # openFDA's substance_name and unii arrays are NOT positionally aligned. They are
                # the same length often enough to look parallel, but checking pairs against
                # single-substance labels shows 15% disagree, and one combination label pairs
                # guaifenesin and phenylephrine each with the other's identifier. Nothing here
                # therefore tries to split a combination label's identifiers between its
                # substances; the identifier is emitted only as the document-level value, and the
                # build step uses it solely when the document declares a single substance.
                record = {
                    "setId": set_id,
                    "declaredSubstanceCount": len(normalized_substances),
                    "effectiveTime": result.get("effective_time"),
                    "brandNames": openfda.get("brand_name") or [],
                    "genericNames": generic_names,
                    "substanceNames": openfda.get("substance_name") or [],
                    "routes": openfda.get("route") or [],
                    "unii": (openfda.get("unii") or [None])[0],
                    "rxcui": (openfda.get("rxcui") or [None])[0],
                    "sections": sections,
                    "score": score(sections),
                }
                out.write(json.dumps(record, ensure_ascii=False))
                out.write("\n")
                written += 1

            del payload
            print(
                "[index] partition %d/%d · %d labels kept" % (position, len(zips), written),
                flush=True,
            )

    if presence_out is not None:
        presence_out.close()
        print("[index] presence stream: %d label(s)" % presence_written)
    print("[index] wrote %d labels, skipped %d" % (written, skipped))


if __name__ == "__main__":
    main()
