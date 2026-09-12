#!/usr/bin/env python
"""Put the corpus payload under DVC control, at the largest path git does not already hold.

Revamp step 6.4. `dvc add data/corpus-20k` and `dvc add data/sources` both refuse:

    ERROR: output 'data/corpus-20k/tiers' is already tracked by SCM (e.g. Git).

Every directory named in the step except `registry` carries a handful of git-tracked evidence
files — the summaries, thresholds, coverage reports, manifests and licence captures that the
worklog and the specs cite, kept in git on purpose (see the comments in .gitignore). DVC refuses a
directory that contains any of them, and the escape hatch it offers, `git rm -r --cached`, would
delete that evidence from the repository. `.dvcignore` does not lift the check either: adding the
tracked files to it and re-running produces the same refusal (verified 2026-09-06).

So the boundary this script draws is the one that was already true: git keeps the small evidence
files, DVC keeps the payload. For each root it walks down and adds the highest path that holds no
git-tracked file anywhere beneath it — a whole directory where the directory is clean, otherwise
each clean child, and finally each untracked loose file. The union of what it adds is exactly the
content of those roots that git does not hold, so nothing is stored twice and nothing is left
only on this workstation.

Re-running is safe and is how new payload gets added: a path already carrying a `.dvc` file is
reported as tracked and skipped, and a path that grew new files is re-added.

Roots (Phase 6.4): the eleven corpus-20k directories the step names, and all of data/sources.
data/revamp is deliberately absent — other agents are still writing it, and Phase 7 adds it.

Usage:
  .venv-corpus/bin/python scripts/revamp/dvc_add_untracked.py            # print the plan
  .venv-corpus/bin/python scripts/revamp/dvc_add_untracked.py --apply    # run dvc add

Exit codes: 0 success, 2 a root is missing, 3 a `dvc add` failed (the path is named).
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DVC = REPO_ROOT / ".venv-corpus" / "bin" / "dvc"
PRINT_ROW_CAP = 50

ROOTS = [
    "data/corpus-20k/identity",
    "data/corpus-20k/fields",
    "data/corpus-20k/registry",
    "data/corpus-20k/derived",
    "data/corpus-20k/questions",
    "data/corpus-20k/gate1b",
    "data/corpus-20k/gate2",
    "data/corpus-20k/final",
    "data/corpus-20k/tiers",
    "data/corpus-20k/suppression",
    "data/corpus-20k/reconciliation",
    "data/sources",
]


def tracked_paths(roots: list[str]) -> set[str]:
    """Every path git tracks under the roots, as repo-relative POSIX strings."""
    result = subprocess.run(
        ["git", "ls-files", "--"] + roots,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return {line for line in result.stdout.split("\n") if line}


def directory_bytes(path: Path) -> int:
    total = 0
    for directory, _subdirectories, files in os.walk(path):
        for name in files:
            try:
                total += (Path(directory) / name).stat().st_size
            except OSError:
                pass
    return total


def plan(roots: list[str]) -> list[tuple[str, int]]:
    """The maximal git-untracked paths under the roots, each with its size in bytes."""
    tracked = tracked_paths(roots)
    prefixes = tuple(sorted(tracked))
    found: list[tuple[str, int]] = []

    def holds_tracked(relative: str) -> bool:
        prefix = relative.rstrip("/") + "/"
        return any(candidate.startswith(prefix) for candidate in prefixes)

    def walk(relative: str) -> None:
        absolute = REPO_ROOT / relative
        if absolute.is_symlink():
            return
        # DVC's own bookkeeping is never payload: a pointer file cannot be its own output, and the
        # per-directory .gitignore DVC writes belongs to git.
        if relative.endswith(".dvc") or absolute.name == ".gitignore":
            return
        if absolute.is_file():
            if relative not in tracked:
                found.append((relative, absolute.stat().st_size))
            return
        if not absolute.is_dir():
            return
        if relative in tracked or not holds_tracked(relative):
            size = directory_bytes(absolute)
            if size > 0:
                found.append((relative, size))
            return
        for entry in sorted(os.listdir(absolute)):
            walk(f"{relative}/{entry}")

    for root in roots:
        if not (REPO_ROOT / root).exists():
            print(f"missing root: {root}", file=sys.stderr)
            raise SystemExit(2)
        walk(root)
    return found


def already_tracked_by_dvc(relative: str) -> bool:
    return (REPO_ROOT / f"{relative}.dvc").exists()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="run dvc add; without it, print the plan")
    parser.add_argument("--json-out", default=None, help="write the plan to this file as JSON")
    arguments = parser.parse_args()

    entries = plan(ROOTS)
    total = sum(size for _path, size in entries)
    pending = [(path, size) for path, size in entries if not already_tracked_by_dvc(path)]

    print(f"paths: {len(entries)}  bytes: {total}  ({total / 1e9:.2f} GB)")
    print(f"already under dvc: {len(entries) - len(pending)}  to add: {len(pending)}")
    for path, size in sorted(pending, key=lambda row: -row[1])[:PRINT_ROW_CAP]:
        print(f"  {size / 1e6:10.1f} MB  {path}")
    if len(pending) > PRINT_ROW_CAP:
        print(f"  ... {len(pending) - PRINT_ROW_CAP} more not printed")

    if arguments.json_out:
        Path(arguments.json_out).write_text(
            json.dumps([{"path": path, "bytes": size} for path, size in entries], indent=1),
            encoding="utf-8",
        )

    if not arguments.apply:
        print("plan only; pass --apply to run dvc add")
        return 0

    for index, (path, _size) in enumerate(pending, start=1):
        result = subprocess.run(
            [str(DVC), "add", path],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"dvc add failed on {path}", file=sys.stderr)
            print(result.stdout, file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            return 3
        if index % 20 == 0 or index == len(pending):
            print(f"added {index}/{len(pending)}")
    print(f"added {len(pending)} paths; {len(entries)} paths now under dvc")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
