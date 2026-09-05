#!/usr/bin/env python3
"""Re-verify that the stored EMA medicines output report still matches what EMA publishes.

The report is regenerated on a fixed schedule, so its bytes and Last-Modified header change
even when no authorisation record has changed. This script downloads the published file to a
temporary path, compares the parsed table cell by cell against the stored pull, and writes the
result to data/sources/<date>/freshness-check.json. It never overwrites the stored raw file:
adopting a newer report is a separate, explicit re-run of ema_manifest.py.

Usage: ema_freshness_check.py <YYYY-MM-DD>
Exit status 0 when the stored pull still carries the published data, 2 when it does not.
"""
import hashlib
import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

URL = "https://www.ema.europa.eu/en/documents/report/medicines-output-medicines-report_en.xlsx"
UA = "rnawiki-revamp/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)"
ROOT = Path(__file__).resolve().parents[2]
HEADER_ROW = 8


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def generated_stamp(path: Path) -> str:
    first = pd.read_excel(path, header=None, nrows=1).iloc[0].tolist()
    values = [str(v).strip() for v in first if str(v) != "nan"]
    return values[-1] if values else ""


def normalised(path: Path) -> pd.DataFrame:
    frame = pd.read_excel(path, header=HEADER_ROW)
    for column in frame.columns:
        frame[column] = frame[column].map(
            lambda v: "" if v is None or (isinstance(v, float) and np.isnan(v)) else str(v).strip()
        )
    return frame.sort_values("EMA product number").reset_index(drop=True)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        return 64
    date = sys.argv[1]
    base = ROOT / "data" / "sources" / "ema" / date
    stored = base / "raw" / "medicines-output-medicines-report_en.xlsx"
    if not stored.exists():
        print(f"no stored pull at {stored}", file=sys.stderr)
        return 64

    with tempfile.TemporaryDirectory() as tmp:
        fetched = Path(tmp) / "published.xlsx"
        headers = Path(tmp) / "headers.txt"
        started = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
        result = subprocess.run(
            ["curl", "-sS", "--max-time", "180", "-A", UA, "-D", str(headers), "-o", str(fetched), URL],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(result.stderr.strip(), file=sys.stderr)
            return 1
        last_modified = ""
        status = ""
        for line in headers.read_text(errors="replace").splitlines():
            if line.lower().startswith("http/"):
                status = line.strip()
            if line.lower().startswith("last-modified:"):
                last_modified = line.split(":", 1)[1].strip()

        stored_frame, published_frame = normalised(stored), normalised(fetched)
        same_shape = stored_frame.shape == published_frame.shape
        same_columns = list(stored_frame.columns) == list(published_frame.columns)
        if same_shape and same_columns:
            differing = stored_frame.values != published_frame.values
            cells = int(differing.sum())
            rows = int(differing.any(axis=1).sum())
            columns = {
                str(c): int(n)
                for c, n in zip(stored_frame.columns, differing.sum(axis=0))
                if n
            }
        else:
            cells, rows, columns = -1, -1, {}

        report = {
            "checkedAt": started,
            "url": URL,
            "httpStatus": status,
            "storedFile": str(stored.relative_to(ROOT)),
            "storedSha256": sha256(stored),
            "storedGenerated": generated_stamp(stored),
            "publishedSha256": sha256(fetched),
            "publishedBytes": fetched.stat().st_size,
            "publishedLastModified": last_modified,
            "publishedGenerated": generated_stamp(fetched),
            "rowsCompared": int(stored_frame.shape[0]) if same_shape else None,
            "columnsCompared": int(stored_frame.shape[1]) if same_shape else None,
            "sameShape": same_shape,
            "sameColumns": same_columns,
            "cellsDiffering": cells,
            "rowsDiffering": rows,
            "columnsDiffering": columns,
            "storedPullStillCurrent": bool(same_shape and same_columns and cells == 0),
        }

    out = base / "freshness-check.json"
    out.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: report[k] for k in (
        "checkedAt", "storedGenerated", "publishedGenerated", "publishedLastModified",
        "rowsCompared", "cellsDiffering", "storedPullStillCurrent")}, indent=2))
    print(f"written: {out.relative_to(ROOT)}")
    return 0 if report["storedPullStillCurrent"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
