"""Map NCCIH herb fact sheets onto corpus pages, so a reader can reach the federal summary.

The repository's own competitive audit already ruled on this source
(`docs/research/competitive-dataset-reader-audit-2026.md`): **"Link; defer import. Structured
fact-sheet ingestion remains deferred"** until content-level rights, versioning and claim-scope rules
have a dedicated review. The same audit says to "link first". This builds exactly that link map and
nothing more: no NCCIH text is stored, so the deferred ingestion decision is untouched.

Rights are clear for linking and for quoting with credit - NCCIH's own policy page says "Text on the
NCCIH website is not copyrighted and is in the public domain. You may print and copy our
publications. Please credit the National Center for Complementary and Integrative Health as the
source". Their images are copyrighted, so no image is ever referenced.

The inventory below is NCCIH's own, read from their site's static query
(`/page-data/sq/d/1180509848.json`, `allFactsheetJson`), which is how their Herbs at a Glance page
builds its list. Re-read it with:

    curl -s https://www.nccih.nih.gov/page-data/sq/d/1180509848.json

Usage:
    python3 scripts/revamp/map_nccih_factsheets.py
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/sources/nccih/fact-sheets.json"

DB = os.environ.get("RNAWIKI_AUDIT_DB", "rnawiki_indexing_audit_20260913")

BASE = "https://www.nccih.nih.gov"

# NCCIH's own list, verbatim from allFactsheetJson: (display name, /health path).
FACT_SHEETS: tuple[tuple[str, str], ...] = (
    ("Acai", "/health/acai"),
    ("Aloe Vera", "/health/aloe-vera"),
    ("Ashwagandha", "/health/ashwagandha"),
    ("Asian Ginseng", "/health/asian-ginseng"),
    ("Astragalus", "/health/astragalus"),
    ("Bilberry", "/health/bilberry"),
    ("Bitter Orange", "/health/bitter-orange"),
    ("Black Cohosh", "/health/black-cohosh"),
    ("Boswellia", "/health/boswellia"),
    ("Bromelain", "/health/bromelain"),
    ("Butterbur", "/health/butterbur"),
    ("Cat's Claw", "/health/cats-claw"),
    ("Chamomile", "/health/chamomile"),
    ("Chasteberry", "/health/chasteberry"),
    ("Cinnamon", "/health/cinnamon"),
    ("Cranberry", "/health/cranberry"),
    ("Dandelion", "/health/dandelion"),
    ("Echinacea", "/health/echinacea"),
    ("Elderberry", "/health/elderberry"),
    ("Ephedra", "/health/ephedra"),
    ("European Mistletoe", "/health/european-mistletoe"),
    ("Evening Primrose Oil", "/health/evening-primrose-oil"),
    ("Fenugreek", "/health/fenugreek"),
    ("Feverfew", "/health/feverfew"),
    ("Flaxseed and Flaxseed Oil", "/health/flaxseed-and-flaxseed-oil"),
    ("Garcinia Cambogia", "/health/garcinia-cambogia"),
    ("Garlic", "/health/garlic"),
    ("Ginger", "/health/ginger"),
    ("Ginkgo", "/health/ginkgo"),
    ("Goldenseal", "/health/goldenseal"),
    ("Grape Seed Extract", "/health/grape-seed-extract"),
    ("Green Tea", "/health/green-tea"),
    ("Hawthorn", "/health/hawthorn"),
    ("Hoodia", "/health/hoodia"),
    ("Horse Chestnut", "/health/horse-chestnut"),
    ("Kava", "/health/kava"),
    ("Lavender", "/health/lavender"),
    ("Licorice Root", "/health/licorice-root"),
    ("Milk Thistle", "/health/milk-thistle"),
    ("Mugwort", "/health/mugwort"),
    ("Noni", "/health/noni"),
    ("Passionflower", "/health/passionflower"),
    ("Peppermint Oil", "/health/peppermint-oil"),
    ("Pomegranate", "/health/pomegranate"),
    ("Red Clover", "/health/red-clover"),
    ("Rhodiola", "/health/rhodiola"),
    ("Sage", "/health/sage"),
    ("Saw Palmetto", "/health/saw-palmetto"),
    ("Soy", "/health/soy"),
    ("St. John's Wort", "/health/st-johns-wort"),
    ("Tea Tree Oil", "/health/tea-tree-oil"),
    ("Thunder God Vine", "/health/thunder-god-vine"),
    ("Turmeric", "/health/turmeric"),
    ("Valerian", "/health/valerian"),
    ("White Mulberry Leaf", "/health/white-mulberry-leaf"),
    ("Yohimbe", "/health/yohimbe"),
)


def normalise(value: str) -> str:
    """Lowercase, drop accents and punctuation, collapse separators. Used for matching only."""
    text = unicodedata.normalize("NFKD", value)
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.lower().replace("’", "'").replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def sql(query: str) -> list[list[str]]:
    done = subprocess.run(
        ["psql", "-d", DB, "-tAc", query], capture_output=True, text=True, check=True
    )
    return [line.split("|") for line in done.stdout.splitlines() if line]


def main() -> None:
    rows = sql("select slug, coalesce(name, '') from drugs where slug is not null")
    by_name: dict[str, str] = {}
    for slug, name in rows:
        by_name.setdefault(normalise(slug), slug)
        if name:
            by_name.setdefault(normalise(name), slug)

    # Display names and synonyms carry the forms a reader is likely to hold, e.g. "Turmeric" or
    # "Curcuma longa", which an exact slug match would miss.
    for slug, display in sql(
        "select slug, coalesce(display_name, '') from corpus_pages where slug is not null"
    ):
        if slug and display:
            by_name.setdefault(normalise(display), slug)

    slug_by_key = {k: s for k, s in sql("select key, slug from corpus_pages where slug is not null")}
    for key, name in sql("select key, name from page_synonyms where kind in ('display','common')"):
        slug = slug_by_key.get(key)
        if slug and name:
            by_name.setdefault(normalise(name), slug)

    matched: dict[str, dict] = {}
    unmatched: list[dict] = []
    for name, path in FACT_SHEETS:
        slug = by_name.get(normalise(name))
        if slug and slug not in matched:
            matched[slug] = {
                "title": f"{name}: Usefulness and Safety",
                "name": name,
                "url": f"{BASE}{path}",
                "source": "National Center for Complementary and Integrative Health",
            }
        else:
            unmatched.append({"name": name, "url": f"{BASE}{path}"})

    payload = {
        "note": (
            "Links only. No NCCIH text is stored here, because "
            "docs/research/competitive-dataset-reader-audit-2026.md defers structured fact-sheet "
            "ingestion pending content-level rights, versioning and claim-scope review, and directs "
            "this source to be linked. NCCIH states its text is in the public domain and asks to be "
            "credited as the source, which the link text does. No NCCIH image is referenced: their "
            "images are copyrighted."
        ),
        "inventorySource": f"{BASE}/page-data/sq/d/1180509848.json",
        "factSheets": matched,
        "nccihHerbsWithNoCorpusPage": unmatched,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))

    print(f"NCCIH fact sheets:            {len(FACT_SHEETS)}")
    print(f"matched to a corpus page:     {len(matched)}")
    print(f"with no corpus page (a gap):  {len(unmatched)}")
    print()
    print("matched:")
    for slug in sorted(matched):
        print(f"  {slug:32} -> {matched[slug]['name']}")
    print()
    print("NCCIH herbs rnawiki does not have:")
    for entry in unmatched:
        print(f"  {entry['name']}")
    print()
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
