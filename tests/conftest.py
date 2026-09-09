"""Pytest options for the Python checks under `tests/`.

One option is defined, `--sample`, and one file reads it: `tests/test_render_safety.py`.

Why it exists. That file reads the render the workstation wrote — `data/revamp/render-v8/`,
`data/revamp/page-blocks/`, `data/revamp/fields-v2/` — which is gitignored and runs to hundreds of
megabytes, so a GitHub Actions runner has none of it. `scripts/revamp/ci_sample.py` writes a small
committed sample of exactly those streams for 200 drawn pages, and `--sample` points the rules at
it:

    .venv-corpus/bin/python -m pytest tests/test_render_safety.py --sample data/revamp/ci-sample/render

What `--sample` changes, and nothing else: the four directory constants the file reads its pages
through, and `_read`, which reads one gzipped NDJSON file per stream instead of a directory of
batches. Every rule, every pattern and every assertion is the file's own. The sample is drawn so
that each rule which asserts it saw a page of some kind — a controlled-substance page, a Poisons
Standard row, a quoted label sentence, a supervision block on each branch, a not-found register
line, a trial row — has pages in it; `render/manifest.json` records which page was drawn for which.

Two rules cannot run against a sample, and are skipped by name rather than left to fail or, worse,
to pass over nothing:

  * `test_the_trace_of_an_absence_names_paths_the_record_does_not_carry` resolves every absence
    trace against the stored field record of the page it belongs to and asserts it saw more than
    1,000 such records. It reads `data/revamp/fields-v2/`, the whole corpus.
  * `test_every_trace_on_a_sampled_page_resolves` runs `slop_draw`'s resolver, which loads those
    same field records and reads `corpus_pages` from a loaded database.

Both run on the workstation, over the whole corpus, with the plain command above and no `--sample`.
`docs/specs/ci-checks.md` records that split, and the CI job prints it.

A third rule skips itself wherever `data/revamp/render-v8/dom-parity.json` is absent: the parity
report is produced by `scripts/revamp/dom_parity.py` against a running build, which CI does not
have. It is listed below for the same reason — so the skip is a stated one.

Any other skip under `--sample` is turned into a failure. A sample that quietly lost its provenance
file, or a rule that starts skipping itself, would otherwise report green while checking nothing.
"""

from __future__ import annotations

import gzip
import json
import sys
from pathlib import Path
from typing import Any, Iterator

import pytest

# rule name -> why it cannot run against a committed sample, and where it does run.
SAMPLE_SKIPS = {
    "test_the_trace_of_an_absence_names_paths_the_record_does_not_carry":
        "resolves absence traces against every stored field record in data/revamp/fields-v2/ and "
        "asserts it read more than 1,000 of them; run it on the workstation with "
        "`.venv-corpus/bin/python -m pytest tests/test_render_safety.py -k absence`",
    "test_every_trace_on_a_sampled_page_resolves":
        "runs slop_draw's resolver, which loads data/revamp/fields-v2/ and reads corpus_pages from "
        "a loaded database; run it on the workstation with DATABASE_URL set",
    "test_the_render_and_the_painted_page_agree":
        "asserts the result of scripts/revamp/dom_parity.py, which renders a 200-page sample "
        "against a running build; run it on the workstation after `dom_parity.py --base-url ...`",
    "test_the_provenance_timeline_fires_only_on_three_dated_events_in_order":
        "reads seed 8's own records in data/revamp/derived-v2/, which is gitignored and absent "
        "here; the rule is about what the derivation wrote, not about what a page painted, so no "
        "render sample can carry it; run it on the workstation with "
        "`.venv-corpus/bin/python -m pytest tests/test_render_safety.py -k provenance_timeline`",
}

# stream -> the file `ci_sample.py` writes it to.
SAMPLE_FILES = {
    "text": "text.ndjson.gz",
    "text-with-furniture": "text-with-furniture.ndjson.gz",
    "provenance-with-furniture": "provenance-with-furniture.ndjson.gz",
    "blocks": "blocks.ndjson.gz",
}


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--sample",
        action="store",
        default=None,
        metavar="DIR",
        help="read the rendering rules' pages from the committed sample in DIR "
             "(scripts/revamp/ci_sample.py writes data/revamp/ci-sample/render)",
    )


def _sample_reader(directory: Path) -> Any:
    """`_read`, over one gzipped NDJSON file per stream instead of a directory of batches."""

    def read(path: str | Path) -> Iterator[dict[str, Any]]:
        target = Path(path)
        if target.parent != directory or target.name not in SAMPLE_FILES:
            raise AssertionError(
                f"the rendering rules read {target}, which is not part of the sample in "
                f"{directory}; the sample holds {sorted(SAMPLE_FILES)}"
            )
        with gzip.open(directory / SAMPLE_FILES[target.name], "rt", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    yield json.loads(line)

    return read


def _point_at_sample(module: Any, directory: Path) -> None:
    for stream, name in SAMPLE_FILES.items():
        if not (directory / name).exists():
            raise pytest.UsageError(
                f"--sample {directory} holds no {name}; write it with "
                "`.venv-corpus/bin/python scripts/revamp/ci_sample.py`"
            )
    manifest = directory / "manifest.json"
    if not manifest.exists():
        raise pytest.UsageError(f"--sample {directory} holds no manifest.json")
    recorded = json.loads(manifest.read_text(encoding="utf-8"))
    # The painted text and its provenance are both in the sample, so the rules that read the page
    # as a browser paints it are the ones that run.
    module.PAINTED = True
    module.TEXT_DIR = str(directory / "text-with-furniture")
    module.FURNITURE_TEXT_DIR = module.TEXT_DIR
    module.FREE_TEXT_DIR = str(directory / "text")
    module.PROVENANCE_DIR = str(directory / "provenance-with-furniture")
    module.FURNITURE_PROVENANCE_DIR = module.PROVENANCE_DIR
    module.BLOCKS_DIR = str(directory / "blocks")
    module._read = _sample_reader(directory)
    print(
        f"\n[--sample] {recorded['pages']} pages from {recorded['render']} "
        f"({', '.join(f'tier {tier}: {count}' for tier, count in recorded['pagesPerTier'].items())})"
    )
    for name, reason in SAMPLE_SKIPS.items():
        print(f"[--sample] not run here: {name} — {reason}")


def pytest_collection_modifyitems(
    session: pytest.Session, config: pytest.Config, items: list[pytest.Item]
) -> None:
    option = config.getoption("--sample")
    if not option:
        return
    directory = Path(option).resolve()
    if not directory.is_dir():
        raise pytest.UsageError(f"--sample {directory} is not a directory")

    module = sys.modules.get("test_render_safety") or sys.modules.get("tests.test_render_safety")
    if module is None:
        for item in items:
            candidate = getattr(item, "module", None)
            if candidate is not None and candidate.__name__.endswith("test_render_safety"):
                module = candidate
                break
    if module is None:
        raise pytest.UsageError(
            "--sample was given but tests/test_render_safety.py was not collected; it is the only "
            "file that reads the sample"
        )
    _point_at_sample(module, directory)

    for item in items:
        reason = SAMPLE_SKIPS.get(item.name)
        if reason and getattr(item, "module", None) is module:
            item.add_marker(pytest.mark.skip(reason=f"--sample: {reason}"))


@pytest.hookimpl(wrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo) -> Any:
    report = yield
    if not item.config.getoption("--sample", default=None):
        return report
    if report.when != "call" or not report.skipped:
        return report
    if item.name in SAMPLE_SKIPS:
        return report
    report.outcome = "failed"
    report.longrepr = (
        f"{item.name} skipped itself under --sample: {report.longrepr}\n"
        "A rule that skips is a rule that checked nothing. Either the sample is missing a stream "
        "the rule reads (write it with scripts/revamp/ci_sample.py) or the rule belongs in "
        "SAMPLE_SKIPS in tests/conftest.py with the reason it cannot run here."
    )
    return report
