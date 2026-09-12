"""Streaming reader for the openFDA drug-label bulk JSON archives.

Each archive holds one JSON document of shape {"meta": {...}, "results": [ ... ]}.
The uncompressed documents total roughly 8.3 GB, so records are cut out of the
decompressed byte stream one at a time and decoded individually; the whole
document is never held in memory.
"""

from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path
from typing import Iterator, Tuple

CHUNK = 1 << 22  # 4 MiB of decompressed text per read


def iter_label_records(zip_path: Path) -> Iterator[Tuple[int, dict]]:
    """Yield (ordinal, record) for every element of the top-level results array."""
    with zipfile.ZipFile(zip_path) as zf:
        names = zf.namelist()
        if len(names) != 1:
            raise ValueError(f"{zip_path} holds {len(names)} members, expected 1")
        with zf.open(names[0]) as raw:
            stream = io.TextIOWrapper(raw, encoding="utf-8", errors="replace")
            buf = stream.read(CHUNK)
            marker = buf.find('"results"')
            if marker < 0:
                raise ValueError(f"{zip_path}: no results array in the first {CHUNK} chars")
            pos = buf.index("[", marker) + 1
            ordinal = 0
            while True:
                # Advance to the next '{' or the closing ']' of the results array.
                while pos < len(buf) and buf[pos] not in "{]":
                    pos += 1
                if pos >= len(buf):
                    more = stream.read(CHUNK)
                    if not more:
                        return
                    buf = buf[pos:] + more
                    pos = 0
                    continue
                if buf[pos] == "]":
                    return
                start = pos
                depth = 0
                in_str = False
                esc = False
                i = pos
                end = -1
                while True:
                    if i >= len(buf):
                        more = stream.read(CHUNK)
                        if not more:
                            raise ValueError(f"{zip_path}: truncated record at ordinal {ordinal}")
                        buf = buf[start:] + more
                        i -= start
                        pos -= start
                        start = 0
                    ch = buf[i]
                    if in_str:
                        if esc:
                            esc = False
                        elif ch == "\\":
                            esc = True
                        elif ch == '"':
                            in_str = False
                    elif ch == '"':
                        in_str = True
                    elif ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            end = i + 1
                            break
                    i += 1
                yield ordinal, json.loads(buf[start:end])
                ordinal += 1
                pos = end
                if start > 0 and pos > CHUNK:
                    buf = buf[pos:]
                    pos = 0
