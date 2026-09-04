#!/usr/bin/env python
"""Gate 2's single visible-text extractor.

One extractor is used for every measured page: the pages this build serves on localhost and the
pages the live site serves today. It reads server HTML (no browser, no hydration) and returns

    text        the visible text of the reading column, chrome excluded
    proseText   the same text with the rows the dossier template itself calls markup removed
    fullText    every visible character in the document, chrome included (the text-to-HTML figure)

What is excluded from ``text``, and why:

  * everything outside ``<main>``            — the site header and footer band are chrome
  * ``<nav>`` anywhere, including ``nav.cd-rail``, and the ``details.cd-contents`` control that
    replaces the rail below 1024 px — the contents rail is markup by the template's own definition
    (dossier-template.md), and it repeats every question heading verbatim
  * ``<footer>``                              — chrome
  * ``p.cd-definitions``                      — the standing link to the definitions page
  * ``<script>``, ``<style>``, ``<noscript>``, ``<template>``, ``<svg>``, HTML comments

Nothing else is dropped: a decorative glyph a reader can see is text a crawler can read, so the
badge letters and the ``~`` region glyph stay in ``text`` and are classified as markup instead.

The prose/markup split follows the template's declaration where a template class is present and
falls back to a tag rule where none is (the live legacy pages carry no ``cd-`` classes):

  prose    <p>, <h1>, <h2>, <h3>, <h4> that do not carry a declared-markup class, and are not
           inside <details>, <dl>, <summary> or a row list
  markup   everything else — the synonyms list, the badge triplet, the source/date line, the
           contents disclosure, every revealed row, the exact-record panel, the source list and
           the licence line

No network access. Nothing here fetches anything.
"""

from __future__ import annotations

import re
from html.parser import HTMLParser
from html import unescape

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr",
}
SKIP_TAGS = {"script", "style", "noscript", "template", "svg"}
BLOCK = {
    "p", "div", "section", "article", "header", "footer", "main", "h1", "h2", "h3", "h4", "h5",
    "h6", "li", "ul", "ol", "dl", "dt", "dd", "table", "tr", "td", "th", "details", "summary",
    "hr", "br", "blockquote", "figure", "figcaption", "aside", "nav", "form", "pre",
}
PROSE_TAGS = {"p", "h1", "h2", "h3", "h4"}
# Classes the dossier template declares as markup even though they sit in a <p> or a heading.
DECLARED_MARKUP_CLASSES = {
    "cd-source-line", "cd-licence", "cd-row-dates", "cd-glyph", "cd-record-head",
    "cd-section-heading", "cd-rail-heading", "cd-definitions", "cd-synonyms", "cd-badges",
    "cd-row-label", "cd-row-value", "cd-row-id", "cd-rows", "cd-source-rows", "cd-more-names",
    "cd-contents", "cd-rail", "cd-badge", "cd-hairline", "cd-anchor", "cd-anchor-glyph",
    "cd-record",
}
MARKUP_CONTAINERS = {"details", "summary", "dl", "dt", "dd", "table"}


class _Extract(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, frozenset[str]]] = []
        self.skip_depth = 0
        self.main_depth: int | None = None
        self.drop_depth: int | None = None
        self.full: list[str] = []
        self.main_all: list[str] = []
        self.main_prose: list[str] = []

    # -- helpers ---------------------------------------------------------------------------
    def _classes(self, attrs) -> frozenset[str]:
        for name, value in attrs:
            if name == "class" and value:
                return frozenset(value.split())
        return frozenset()

    def _in_main(self) -> bool:
        return self.main_depth is not None and self.drop_depth is None

    def _is_prose(self) -> bool:
        """Prose iff the nearest text-bearing block is a paragraph or heading that carries no
        declared-markup class and sits in no markup container."""
        for tag, classes in reversed(self.stack):
            if classes & DECLARED_MARKUP_CLASSES:
                return False
            if tag in MARKUP_CONTAINERS:
                return False
            if tag in PROSE_TAGS:
                return True
            if tag in ("li",):
                return False
        return False

    # -- parser callbacks ------------------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            if self.skip_depth == 0:
                self.full.append(" ")
                if self._in_main():
                    self.main_all.append(" ")
                    self.main_prose.append(" ")
            return
        classes = self._classes(attrs)
        self.stack.append((tag, classes))
        depth = len(self.stack)
        if tag in SKIP_TAGS and self.skip_depth == 0:
            self.skip_depth = depth
        if tag == "main" and self.main_depth is None:
            self.main_depth = depth
        if self.drop_depth is None and self.main_depth is not None:
            if (
                tag in ("nav", "footer")
                or "cd-rail" in classes
                or "cd-contents" in classes
                or "cd-definitions" in classes
            ):
                self.drop_depth = depth
        if tag in BLOCK:
            if self.skip_depth == 0:
                self.full.append("\n")
                if self._in_main():
                    self.main_all.append("\n")
                    self.main_prose.append("\n")

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                depth = index + 1
                if self.skip_depth is not None and self.skip_depth == depth:
                    self.skip_depth = 0
                if self.drop_depth is not None and self.drop_depth == depth:
                    self.drop_depth = None
                if self.main_depth is not None and self.main_depth == depth:
                    self.main_depth = None
                del self.stack[index:]
                break

    def handle_data(self, data):
        if self.skip_depth:
            return
        if not data.strip():
            return
        self.full.append(data)
        if self._in_main():
            self.main_all.append(data)
            if self._is_prose():
                self.main_prose.append(data)


def _clean(parts: list[str]) -> str:
    raw = unescape("".join(parts))
    lines = [re.sub(r"[ \t\r\f\v ]+", " ", line).strip() for line in raw.split("\n")]
    return "\n".join(line for line in lines if line)


def extract(html: str) -> dict:
    """Return {'text', 'proseText', 'fullText'} for one server HTML document."""
    parser = _Extract()
    parser.feed(html)
    parser.close()
    text = _clean(parser.main_all)
    prose = _clean(parser.main_prose)
    full = _clean(parser.full)
    return {
        "text": text,
        "proseText": prose,
        "fullText": full,
        "chars": len(text),
        "proseChars": len(prose),
        "fullChars": len(full),
        "words": len(text.split()),
        "htmlBytes": len(html.encode("utf-8")),
    }


if __name__ == "__main__":  # pragma: no cover - manual check
    import sys

    from pathlib import Path

    for path in sys.argv[1:]:
        result = extract(Path(path).read_text(encoding="utf-8"))
        print(path, result["chars"], result["proseChars"], result["fullChars"], result["htmlBytes"])
        print(result["text"][:1500])
