"""The hub member-set dedupe (docs/specs/phase4-generators.md §13 item 13).

The rendered duplicate check read the hub pages for the first time at measure 3 and found 1,865
hub-to-hub pairs at or above 0.5 Jaccard. A hub page is its members' comparison table and a
synthesis generated from that table, so two hubs over nearly the same members are nearly the same
page — and both were indexable and both were in the sitemap.

`scripts/revamp/hubs_build.py` groups the finished hubs by member set: complete linkage at 0.5
Jaccard, the largest member set surviving, the others becoming aliases that redirect to it and are
named in its definition line. These are that rule's cases, on fixtures rather than on the corpus, so
a regression fails here in a second instead of after a 17-second build.

    .venv-corpus/bin/python -m pytest tests/test_hub_dedupe.py
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts", "revamp"))

from hubs_build import HUB_DEDUPE_JACCARD, Hub, dedupe_hubs_by_member_set  # noqa: E402


class _Member:
    """A hub member is read only for its key and its role by the rule under test."""

    def __init__(self, key: str) -> None:
        self.key = key
        self.role = "clinical"


def _hub(name: str, members: list[str], hub_type: str = "target") -> Hub:
    hub = Hub(hub_type, name, name.lower())
    hub.definition = f"{name} is a fixture."
    hub.members = [_Member(key) for key in members]
    return hub


def test_the_line_is_the_one_the_spec_states():
    assert HUB_DEDUPE_JACCARD == 0.5


def test_two_hubs_over_the_same_members_leave_one_page():
    a = _hub("Alpha", ["p1", "p2", "p3", "p4", "p5"])
    b = _hub("Beta", ["p1", "p2", "p3", "p4"])
    survivors, aliases = dedupe_hubs_by_member_set([a, b])
    assert [hub.name for hub in survivors] == ["Alpha"]
    assert [row["alias_slug"] for row in aliases] == ["beta"]
    assert aliases[0]["hub_id"] == a.hub_id
    assert aliases[0]["shared_members"] == 4
    assert aliases[0]["alias_member_count"] == 4


def test_the_survivor_names_what_it_is_also_known_by():
    a = _hub("Alpha", ["p1", "p2", "p3", "p4", "p5"])
    b = _hub("Beta", ["p1", "p2", "p3", "p4"])
    survivors, _ = dedupe_hubs_by_member_set([a, b])
    assert "Also known by Beta." in survivors[0].definition


def test_hubs_that_share_too_little_both_stand():
    a = _hub("Alpha", ["p1", "p2", "p3", "p4", "p5"])
    b = _hub("Beta", ["p5", "p6", "p7", "p8", "p9"])
    survivors, aliases = dedupe_hubs_by_member_set([a, b])
    assert sorted(hub.name for hub in survivors) == ["Alpha", "Beta"]
    assert aliases == []


def test_a_chain_of_edges_cannot_fuse_unrelated_hubs():
    """Complete linkage: a group joins only when it meets the line against every member of it.

    Single linkage was tried first inside the target build and chained — a ~0.5 edge from the
    carbonic anhydrases to ABCB1 and another from ABCB1 to polyphenol oxidase 2 put all three in one
    component. `Ends` shares enough with `Middle` and `Middle` with `Other`, but `Ends` and `Other`
    share nothing, so the three cannot become one page.
    """
    ends = _hub("Ends", ["p1", "p2", "p3", "p4"])
    middle = _hub("Middle", ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"])
    other = _hub("Other", ["p5", "p6", "p7", "p8"])
    survivors, aliases = dedupe_hubs_by_member_set([ends, middle, other])
    names = sorted(hub.name for hub in survivors)
    assert "Middle" in names
    assert len(names) == 2, f"complete linkage kept {names}"
    assert len(aliases) == 1


def test_hubs_of_different_kinds_dedupe_against_each_other():
    """A target hub and a class hub over one member set are two pages saying one thing."""
    target = _hub("ADRA1A", ["p1", "p2", "p3", "p4", "p5"], "target")
    mechanism = _hub("C01CA", ["p1", "p2", "p3", "p4", "p5"], "class")
    survivors, aliases = dedupe_hubs_by_member_set([target, mechanism])
    assert len(survivors) == 1
    assert len(aliases) == 1
    assert aliases[0]["alias_type"] in {"target", "class"}
