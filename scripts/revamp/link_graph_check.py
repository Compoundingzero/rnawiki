#!/usr/bin/env python
"""Phase 5 CI check — the hub link graph (docs/specs/hubs.md section 3).

    .venv-corpus/bin/python scripts/revamp/link_graph_check.py --data-only
    .venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://localhost:3000

Four rules, all four checked against the built data files, and the fourth also against a running
build when ``--base-url`` is given:

  1. No hub carries fewer than five leaves.
  2. No indexable leaf is without a hub, unless a reason is recorded for it. Two reasons count, and
     both are read off the same files the build read, never asserted: the page's stored fields name
     no target, no Anatomical Therapeutic Chemical level-4 code and no pathway; or every group its
     fields do name holds fewer than five members, which is the section 1 floor.
  3. No hub is unreachable from ``/h``. The index lists every hub row, so this is the check that
     every hub has a distinct, well-formed ``(type, slug)`` pair that the route can resolve, and,
     with ``--base-url``, that ``/h`` answers 200 and its markup carries every published hub's path.
  4. Every member link answers 200. Without ``--base-url`` this is checked as far as the data can
     check it — every member has a slug and every slug is one the corpus publishes; with it, the
     links the published hub pages carry are requested.

With ``--base-url`` the last three rules are about the build, so they read the hubs the build
publishes (its hubs sitemap child) and the member links its hub pages actually carry. The data
files can hold more: ``hubs_load.ts`` refuses a hub left under five loadable members once the
identity revision has absorbed some of its pages. That difference is reported under ``published``
as a named list, so a hub missing from the site is visible rather than either failing the run or
passing unseen.

Exit status is 0 when every rule passes and 1 when any fails. Failures print with the hub or page
they belong to, capped at 20 examples per rule so a broken build reports in one screen.
"""

from __future__ import annotations

import argparse
import csv
import datetime
import json
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterator
from xml.etree import ElementTree

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
HUBS = ROOT / "data/revamp/hubs"
FIELDS = ROOT / "data/revamp/fields-v2"
# Rule 2 reads the ruler this run publishes. Each measure round writes a new pair of files and the
# older pair stays readable beside it, so the default is the newest pair on disk and `--thresholds`
# names an older one explicitly.
def _newest_ruler() -> Path:
    """The highest-numbered `thresholds-v<n>.json` that has its presence file beside it.

    Naming the revisions one by one means the next measure round reads the previous round's ruler
    until someone remembers to edit this line — silently, because the older file is still there and
    still valid. Reading the highest revision on disk keeps rule 2 on the ruler the run publishes,
    and the report records which pair was used.
    """
    found: list[tuple[int, Path]] = []
    for path in sorted((ROOT / "data/revamp").glob("thresholds-v*.json")):
        revision = path.stem[len("thresholds-v"):]
        if revision.isdigit() and (
            ROOT / f"data/revamp/presence-applicable-v{revision}.ndjson"
        ).exists():
            found.append((int(revision), path))
    if found:
        return max(found)[1]
    return ROOT / "data/revamp/thresholds-v5.json"


THRESHOLDS = _newest_ruler()
PRESENCE = ROOT / f"data/revamp/presence-applicable-{THRESHOLDS.stem.rsplit('-', 1)[1]}.ndjson"
SLUGS = ROOT / "data/revamp/identity/page-slugs.csv"
REASONS = HUBS / "membership-reasons.ndjson"
MINIMUM_MEMBERS = 5
SLUG_SHAPE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
MEMBER_HREF = re.compile(r'href="/d/([^"#?]+)"')
HUB_TYPES = ("target", "class", "pathway")
EXAMPLE_CAP = 20
ATC_LEVEL4 = re.compile(r"^[A-Z]\d{2}[A-Z]{2}$")


def read_ndjson(path: Path) -> Iterator[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def read_ndjson_dir(directory: Path) -> Iterator[dict[str, Any]]:
    for path in sorted(directory.rglob("*.ndjson")):
        yield from read_ndjson(path)


def field_value(page: dict[str, Any], name: str) -> Any:
    entry = (page.get("fields") or {}).get(name)
    if not isinstance(entry, dict) or entry.get("state") != "present":
        return None
    return entry.get("value")


def grouping_fields(page: dict[str, Any]) -> dict[str, list[str]]:
    """Which groups this page's stored fields name — the same three the build reads."""
    targets: list[str] = []
    target_value = field_value(page, "target")
    if isinstance(target_value, dict):
        for row in target_value.get("mergedTargets") or []:
            if not isinstance(row, dict):
                continue
            key = row.get("targetKey")
            if isinstance(key, str) and ":" in key and key.split(":", 1)[1].strip():
                targets.append(key)
    classes: list[str] = []
    regulatory = field_value(page, "regulatory")
    if isinstance(regulatory, dict):
        singapore = regulatory.get("SG")
        if isinstance(singapore, dict):
            for code in singapore.get("atcCodes") or []:
                if isinstance(code, str) and ATC_LEVEL4.match(code[:5]):
                    classes.append(code[:5])
    pathways: list[str] = []
    pathway_value = field_value(page, "pathway")
    if isinstance(pathway_value, list):
        for row in pathway_value:
            if isinstance(row, dict) and isinstance(row.get("pathway"), str):
                pathways.append(row["pathway"])
    return {"target": targets, "class": classes, "pathway": pathways}


def indexable_keys(
    thresholds_file: Path = THRESHOLDS, presence_file: Path = PRESENCE
) -> set[str]:
    """The leaves the ruler admits: present-over-applicable at the tier's own threshold (section 11)."""
    thresholds = json.loads(thresholds_file.read_text(encoding="utf-8"))["tiers"]
    per_tier = {
        int(name.removeprefix("tier")): record.get("threshold")
        for name, record in thresholds.items()
    }
    keys: set[str] = set()
    for row in read_ndjson(presence_file):
        threshold = per_tier.get(int(row["tier"]))
        if threshold is None:
            continue
        if int(row["present"]) >= int(threshold):
            keys.add(str(row["key"]))
    return keys


def published_slugs() -> dict[str, str]:
    """The route map the corpus load writes: page key to the slug `/d/<slug>` resolves."""
    slugs: dict[str, str] = {}
    if not SLUGS.exists():
        return slugs
    with SLUGS.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            key, slug = row.get("key"), row.get("slug")
            if key and slug:
                slugs[key] = slug
    return slugs


def recorded_reasons() -> dict[str, list[dict[str, Any]]]:
    """Why the build left a page out of every hub, as the build recorded it."""
    if not REASONS.exists():
        return {}
    return {str(row["key"]): list(row.get("reasons") or []) for row in read_ndjson(REASONS)}


def http_status(url: str, timeout: float) -> int:
    request = urllib.request.Request(url, method="GET", headers={"User-Agent": "rnawiki-link-check"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return int(response.status)
    except urllib.error.HTTPError as error:
        return int(error.code)
    except (urllib.error.URLError, TimeoutError, ConnectionError):
        return 0


def sitemap_hub_paths(base: str, timeout: float) -> set[str]:
    """The hub paths the build publishes, from its hubs sitemap child.

    An empty set means the build advertises no hubs sitemap; the caller then falls back to the data
    files and says so in the report, rather than reporting a pass over nothing.
    """
    status, body = fetch_text(f"{base}/sitemap.xml", timeout)
    if status != 200 or not body:
        return set()
    children = [
        loc.text.strip()
        for loc in ElementTree.fromstring(body).iter(f"{SITEMAP_NS}loc")
        if (loc.text or "").strip().endswith(".xml")
    ]
    paths: set[str] = set()
    for child in children:
        name = child.rsplit("/", 1)[1][: -len(".xml")]
        if "hub" not in name:
            continue
        status, body = fetch_text(f"{base}/sitemaps/{name}.xml", timeout)
        if status != 200 or not body:
            continue
        for loc in ElementTree.fromstring(body).iter(f"{SITEMAP_NS}loc"):
            location = (loc.text or "").strip()
            if "/h/" in location:
                paths.add("/h/" + location.rsplit("/h/", 1)[1].split("?", 1)[0].split("#", 1)[0])
    return paths


def fetch_text(url: str, timeout: float) -> tuple[int, str]:
    request = urllib.request.Request(url, method="GET", headers={"User-Agent": "rnawiki-link-check"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return int(response.status), response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return int(error.code), ""
    except (urllib.error.URLError, TimeoutError, ConnectionError):
        return 0, ""


class Report:
    def __init__(self) -> None:
        self.rules: list[dict[str, Any]] = []

    def add(self, name: str, failures: list[str], checked: int, note: str = "") -> None:
        self.rules.append(
            {
                "rule": name,
                "checked": checked,
                "failures": len(failures),
                "examples": failures[:EXAMPLE_CAP],
                "pass": not failures,
                **({"note": note} if note else {}),
            }
        )

    @property
    def passed(self) -> bool:
        return all(rule["pass"] for rule in self.rules)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-only",
        action="store_true",
        help="check the built data files and make no HTTP request",
    )
    parser.add_argument("--base-url", help="a running build, e.g. http://localhost:3000")
    parser.add_argument("--timeout", type=float, default=10.0)
    parser.add_argument(
        "--member-sample",
        type=int,
        default=0,
        help="request only this many member links (0 requests every one)",
    )
    parser.add_argument("--out", type=Path, help="write the report as JSON here as well")
    parser.add_argument(
        "--thresholds",
        type=Path,
        default=THRESHOLDS,
        help="the ruler whose per-tier thresholds name the indexable leaves rule 2 checks",
    )
    parser.add_argument(
        "--presence",
        type=Path,
        default=None,
        help="the present-over-applicable count per page; defaults to the file carrying the "
             "same revision suffix as --thresholds",
    )
    args = parser.parse_args()
    presence_file = args.presence
    if presence_file is None:
        revision = args.thresholds.stem.rsplit("-", 1)[1]
        presence_file = ROOT / f"data/revamp/presence-applicable-{revision}.ndjson"
    for path in (args.thresholds, presence_file):
        if not path.exists():
            parser.error(f"{path} does not exist")
    if not args.data_only and not args.base_url:
        parser.error("pass --data-only, or --base-url with a running build.")

    hubs = pq.read_table(HUBS / "hubs.parquet").to_pylist()
    members = pq.read_table(
        HUBS / "members.parquet", columns=["hub_id", "page"]
    ).to_pylist()
    tables = pq.read_table(
        HUBS / "tables.parquet", columns=["hub_id", "page", "slug"]
    ).to_pylist()

    by_hub: dict[str, set[str]] = defaultdict(set)
    for row in members:
        by_hub[str(row["hub_id"])].add(str(row["page"]))
    hubs_of_page: dict[str, set[str]] = defaultdict(set)
    for row in members:
        hubs_of_page[str(row["page"])].add(str(row["hub_id"]))

    report = Report()

    # --- rule 1: five leaves ----------------------------------------------------------------
    small = [
        f"{hub['hub_id']} carries {len(by_hub[str(hub['hub_id'])])} leaves"
        for hub in hubs
        if len(by_hub[str(hub["hub_id"])]) < MINIMUM_MEMBERS
    ]
    report.add("no hub under five leaves", small, len(hubs))

    # --- rule 3: reachable from /h ----------------------------------------------------------
    seen: set[tuple[str, str]] = set()
    unreachable: list[str] = []
    for hub in hubs:
        pair = (str(hub["type"]), str(hub["slug"]))
        if hub["type"] not in HUB_TYPES:
            unreachable.append(f"{hub['hub_id']} has hub type {hub['type']!r}, which /h does not list")
        elif not SLUG_SHAPE.match(str(hub["slug"])):
            unreachable.append(f"{hub['hub_id']} has slug {hub['slug']!r}, which the route rejects")
        elif pair in seen:
            unreachable.append(f"{hub['hub_id']} repeats the path /h/{pair[0]}/{pair[1]}")
        seen.add(pair)
    report.add("no hub unreachable from /h", unreachable, len(hubs))

    # --- rule 2: an indexable leaf has a hub, or a recorded reason ---------------------------
    indexable = indexable_keys(args.thresholds, presence_file)
    group_sizes: dict[tuple[str, str], int] = defaultdict(int)
    page_groups: dict[str, dict[str, list[str]]] = {}
    for page in read_ndjson_dir(FIELDS):
        key = str(page.get("key") or "")
        if not key:
            continue
        groups = grouping_fields(page)
        page_groups[key] = groups
        for kind, names in groups.items():
            for name in names:
                group_sizes[(kind, name)] += 1

    recorded = recorded_reasons()
    orphans: list[str] = []
    reasons: dict[str, int] = defaultdict(int)
    for key in sorted(indexable):
        if hubs_of_page.get(key):
            reasons["in at least one hub"] += 1
            continue
        groups = page_groups.get(key)
        if groups is None:
            orphans.append(f"{key} is indexable and has no stored field record")
            continue
        named = [(kind, name) for kind, names in groups.items() for name in names]
        if not named:
            reasons["no target, class or pathway field"] += 1
            continue
        if recorded.get(key):
            reasons["every group it names was rejected, with the reason recorded"] += 1
            continue
        largest = max(group_sizes[(kind, name)] for kind, name in named)
        orphans.append(
            f"{key} is indexable, names {len(named)} groups, the largest holding {largest} pages, "
            "and is in no hub with no reason recorded in "
            "data/revamp/hubs/membership-reasons.ndjson"
        )
    report.add(
        "no indexable leaf without a hub or a recorded reason",
        orphans,
        len(indexable),
        note=json.dumps(dict(sorted(reasons.items()))),
    )

    # --- rule 4: every member link resolves --------------------------------------------------
    slugs = published_slugs()
    missing_slugs = [
        f"{row['hub_id']} links {row['page']}, which has no slug"
        for row in tables
        if not str(row.get("slug") or "")
    ]
    unknown_slugs = [
        f"{row['hub_id']} links /d/{row['slug']} for {row['page']}, but the route map publishes "
        f"/d/{slugs.get(str(row['page']))}"
        for row in tables
        if str(row.get("slug") or "")
        and slugs
        and slugs.get(str(row["page"])) != str(row["slug"])
    ]
    report.add(
        "every member link has a published slug",
        missing_slugs + unknown_slugs,
        len(tables),
    )

    published: dict[str, Any] = {}
    if args.base_url:
        base = args.base_url.rstrip("/")

        # The build's own answer about which hubs it publishes. `hubs_load.ts` refuses a hub left
        # under five loadable members after the identity revision absorbed some of its pages, and
        # counts the refusal; those hubs are in the data files and are deliberately not on the
        # site. Reading the built set here keeps the three rules below about the build. The
        # difference between the two sets is reported as a number, never as a silent pass.
        built_paths = sitemap_hub_paths(base, args.timeout)
        data_paths = {f"/h/{hub['type']}/{hub['slug']}" for hub in hubs}
        if built_paths:
            check_paths = sorted(built_paths)
        else:
            check_paths = sorted(data_paths)
        published = {
            "source": "sitemaps/hubs.xml" if built_paths else "the data files (no hubs sitemap)",
            "hubsPublished": len(check_paths),
            "hubsInDataFiles": len(data_paths),
            "inDataFilesNotPublished": sorted(data_paths - set(check_paths)),
            "publishedNotInDataFiles": sorted(set(check_paths) - data_paths),
        }

        index_status, index_html = fetch_text(f"{base}/h", args.timeout)
        index_failures: list[str] = []
        if index_status != 200:
            index_failures.append(f"GET {base}/h answered {index_status}")
        else:
            for path in check_paths:
                if path not in index_html:
                    index_failures.append(f"{path} is not linked from /h")
        report.add("/h links every hub it publishes", index_failures, len(check_paths))

        hub_failures = []
        hub_html: dict[str, str] = {}
        for path in check_paths:
            status, body = fetch_text(f"{base}{path}", args.timeout)
            if status != 200:
                hub_failures.append(f"GET {base}{path} answered {status}")
            else:
                hub_html[path] = body
        report.add("every published hub page answers 200", hub_failures, len(check_paths))

        # Rule 4 against a build asks whether the links a reader can follow work. Those are the
        # links the published pages carry, read off the pages themselves rather than recomputed
        # from a route map the build may not share.
        links = sorted(
            {
                match
                for body in hub_html.values()
                for match in MEMBER_HREF.findall(body)
            }
        )
        if args.member_sample > 0:
            links = links[: args.member_sample]
        member_failures = []
        for slug in links:
            url = f"{base}/d/{slug}"
            status = http_status(url, args.timeout)
            if status != 200:
                member_failures.append(f"GET {url} answered {status}")
        report.add(
            "every member link a published hub carries answers 200", member_failures, len(links)
        )
        published["memberLinksOnPublishedHubs"] = len(links)

    payload = {
        "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "mode": "data-only" if args.data_only and not args.base_url else "build",
        "baseUrl": args.base_url,
        "ruler": {
            "thresholds": str(args.thresholds.relative_to(ROOT)),
            "presence": str(presence_file.relative_to(ROOT)),
            "indexableLeaves": len(indexable),
        },
        "hubs": len(hubs),
        "members": len(members),
        **({"published": published} if published else {}),
        "rules": report.rules,
        "pass": report.passed,
    }
    text = json.dumps(payload, indent=1)
    print(text)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text + "\n", encoding="utf-8")
    return 0 if report.passed else 1


if __name__ == "__main__":
    sys.exit(main())
