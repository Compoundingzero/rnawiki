#!/usr/bin/env python
"""Pull Google Search Console data for rnawiki.com into data/revamp/gsc/<date>/.

Revamp step 0.4. Two API surfaces, both under the one service account named by
GSC_SERVICE_ACCOUNT_JSON:

  1. Search Analytics (searchanalytics.query) — the last 16 months of impressions,
     clicks, CTR and average position, dimensioned by DATE and PAGE, so every row is
     one page on one day. Written to performance-by-page-daily.csv. A second pass
     dimensioned by PAGE alone is written to performance-by-page-total.csv, because
     the daily rows are subject to per-row anonymisation and their sum is not the
     16-month total Search Console itself reports.
  2. URL Inspection (urlInspection.index.inspect) — one call per URL, quota-limited
     to 2,000 calls per property per day. Written to index-coverage.csv. The URL list
     comes from --urls (one per line) or, absent that, from the sitemap named by
     --sitemap. The script stops at --inspect-limit and records how many URLs were
     left uninspected, so a partial pull is never mistaken for a complete one.

The service account must be added as a user on the Search Console property
(Settings -> Users and permissions -> Add user -> the client_email from the JSON key,
Full or Restricted). A service account with no property grant returns HTTP 403.

Required environment:
  GSC_SERVICE_ACCOUNT_JSON   filesystem path to the service-account key JSON

Usage:
  .venv-corpus/bin/python scripts/revamp/gsc_pull.py
  .venv-corpus/bin/python scripts/revamp/gsc_pull.py --site-url sc-domain:rnawiki.com
  .venv-corpus/bin/python scripts/revamp/gsc_pull.py --inspect-limit 2000 --urls data/revamp/gsc/urls.txt

Exit codes: 0 success, 2 missing credential, 3 API error after retries.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
import sys
import time
import urllib.request
import xml.etree.ElementTree as ElementTree
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT_ROOT = REPO_ROOT / "data" / "revamp" / "gsc"
DEFAULT_SITE_URL = "https://rnawiki.com/"
DEFAULT_SITEMAP = "https://rnawiki.com/sitemap.xml"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

CREDENTIAL_VARIABLE = "GSC_SERVICE_ACCOUNT_JSON"
MISSING_CREDENTIAL_MESSAGE = (
    "GSC_SERVICE_ACCOUNT_JSON is not set. "
    "Set it to the filesystem path of a Google service-account key JSON whose "
    "client_email has been granted access to the rnawiki.com Search Console property "
    "(Search Console -> Settings -> Users and permissions -> Add user), then re-run. "
    "Without it, use scripts/revamp/gsc_ingest.py on the two manual CSV exports; the "
    "click path to produce them is in docs/revamp/BLOCKERS.md under step 0.4."
)

# Search Analytics keeps 16 months of history and lags roughly three days.
HISTORY_DAYS = 488
LAG_DAYS = 3
ROW_LIMIT = 25000
RETRIES = 3
INSPECTION_DAILY_QUOTA = 2000


def resolve_credential_path() -> Path:
    """Return the service-account key path, or exit 2 with the exact missing-variable message."""
    raw = os.environ.get(CREDENTIAL_VARIABLE, "").strip()
    if not raw:
        print(MISSING_CREDENTIAL_MESSAGE, file=sys.stderr)
        raise SystemExit(2)
    path = Path(raw).expanduser()
    if not path.is_file():
        print(
            f"{CREDENTIAL_VARIABLE} is set to {path}, which is not a readable file. "
            "Point it at the service-account key JSON and re-run.",
            file=sys.stderr,
        )
        raise SystemExit(2)
    return path


def build_service(credential_path: Path):
    """Build the Search Console v1 client. Imported here so a missing credential exits before this."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError as error:  # pragma: no cover - environment guard
        print(
            f"{error}. Install the client libraries into the corpus environment:\n"
            "  .venv-corpus/bin/pip install google-api-python-client google-auth",
            file=sys.stderr,
        )
        raise SystemExit(3) from error

    credentials = service_account.Credentials.from_service_account_file(
        str(credential_path), scopes=SCOPES
    )
    return build("searchconsole", "v1", credentials=credentials, cache_discovery=False)


def call_with_retries(request_factory, description: str):
    """Run a Google API request with three attempts and exponential backoff plus jitter."""
    from googleapiclient.errors import HttpError

    last_error: Exception | None = None
    for attempt in range(1, RETRIES + 1):
        try:
            return request_factory().execute()
        except HttpError as error:
            status = getattr(error.resp, "status", None)
            last_error = error
            if status in (400, 401, 403, 404):
                print(f"{description}: HTTP {status} {error}", file=sys.stderr)
                raise SystemExit(3) from error
            wait = (2**attempt) + random.random()
            print(
                f"{description}: attempt {attempt} of {RETRIES} failed with HTTP {status}; "
                f"retrying in {wait:.1f}s",
                file=sys.stderr,
            )
            time.sleep(wait)
        except Exception as error:  # network-level failure
            last_error = error
            wait = (2**attempt) + random.random()
            print(
                f"{description}: attempt {attempt} of {RETRIES} failed with {error!r}; "
                f"retrying in {wait:.1f}s",
                file=sys.stderr,
            )
            time.sleep(wait)
    print(f"{description}: failed after {RETRIES} attempts: {last_error!r}", file=sys.stderr)
    raise SystemExit(3)


def query_search_analytics(service, site_url: str, start: date, end: date, dimensions: list[str]):
    """Page through searchanalytics.query and return every row."""
    rows: list[dict] = []
    start_row = 0
    while True:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": dimensions,
            "type": "web",
            "rowLimit": ROW_LIMIT,
            "startRow": start_row,
            "dataState": "final",
        }
        response = call_with_retries(
            lambda: service.searchanalytics().query(siteUrl=site_url, body=body),
            f"searchanalytics.query({'+'.join(dimensions)}, startRow={start_row})",
        )
        batch = response.get("rows", [])
        rows.extend(batch)
        if len(batch) < ROW_LIMIT:
            return rows
        start_row += ROW_LIMIT


def write_performance_csv(path: Path, rows: list[dict], dimensions: list[str]) -> int:
    header = list(dimensions) + ["clicks", "impressions", "ctr", "position"]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        for row in rows:
            keys = row.get("keys", [])
            writer.writerow(
                list(keys)
                + [
                    row.get("clicks", 0),
                    row.get("impressions", 0),
                    row.get("ctr", 0.0),
                    row.get("position", 0.0),
                ]
            )
    return len(rows)


def read_sitemap_urls(sitemap_url: str) -> list[str]:
    """Read a sitemap or sitemap index and return every <loc> it names."""
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    with urllib.request.urlopen(sitemap_url, timeout=60) as response:
        document = ElementTree.fromstring(response.read())
    if document.tag == f"{namespace}sitemapindex":
        urls: list[str] = []
        for child in document.findall(f"{namespace}sitemap/{namespace}loc"):
            if child.text:
                urls.extend(read_sitemap_urls(child.text.strip()))
        return urls
    return [
        element.text.strip()
        for element in document.findall(f"{namespace}url/{namespace}loc")
        if element.text
    ]


def inspect_urls(service, site_url: str, urls: list[str], limit: int, out_path: Path) -> dict:
    """Inspect up to `limit` URLs and write index coverage. Returns a quota summary."""
    inspected = 0
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "url",
                "coverage_state",
                "verdict",
                "robots_txt_state",
                "indexing_state",
                "page_fetch_state",
                "last_crawl_time",
                "google_canonical",
                "user_canonical",
                "crawled_as",
            ]
        )
        for url in urls:
            if inspected >= limit:
                break
            body = {"inspectionUrl": url, "siteUrl": site_url}
            response = call_with_retries(
                lambda: service.urlInspection().index().inspect(body=body),
                f"urlInspection.index.inspect({url})",
            )
            result = response.get("inspectionResult", {}).get("indexStatusResult", {})
            writer.writerow(
                [
                    url,
                    result.get("coverageState", ""),
                    result.get("verdict", ""),
                    result.get("robotsTxtState", ""),
                    result.get("indexingState", ""),
                    result.get("pageFetchState", ""),
                    result.get("lastCrawlTime", ""),
                    result.get("googleCanonical", ""),
                    result.get("userCanonical", ""),
                    result.get("crawledAs", ""),
                ]
            )
            inspected += 1
    return {
        "urls_available": len(urls),
        "urls_inspected": inspected,
        "urls_not_inspected": max(0, len(urls) - inspected),
        "daily_quota": INSPECTION_DAILY_QUOTA,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--site-url", default=DEFAULT_SITE_URL, help="Search Console property, URL-prefix or sc-domain: form")
    parser.add_argument("--out-root", default=str(DEFAULT_OUT_ROOT), help="directory that receives the dated output folder")
    parser.add_argument("--sitemap", default=DEFAULT_SITEMAP, help="sitemap to draw inspection URLs from")
    parser.add_argument("--urls", default=None, help="file of URLs to inspect, one per line; overrides --sitemap")
    parser.add_argument("--inspect-limit", type=int, default=INSPECTION_DAILY_QUOTA, help="maximum URL Inspection calls; 0 skips inspection")
    arguments = parser.parse_args()

    credential_path = resolve_credential_path()
    service = build_service(credential_path)

    end = date.today() - timedelta(days=LAG_DAYS)
    start = end - timedelta(days=HISTORY_DAYS)

    out_dir = Path(arguments.out_root) / date.today().isoformat()
    out_dir.mkdir(parents=True, exist_ok=True)

    daily_rows = query_search_analytics(service, arguments.site_url, start, end, ["date", "page"])
    daily_count = write_performance_csv(out_dir / "performance-by-page-daily.csv", daily_rows, ["date", "page"])

    total_rows = query_search_analytics(service, arguments.site_url, start, end, ["page"])
    total_count = write_performance_csv(out_dir / "performance-by-page-total.csv", total_rows, ["page"])

    inspection_summary: dict = {"urls_available": 0, "urls_inspected": 0, "urls_not_inspected": 0}
    if arguments.inspect_limit > 0:
        if arguments.urls:
            urls = [line.strip() for line in Path(arguments.urls).read_text(encoding="utf-8").splitlines() if line.strip()]
        else:
            urls = read_sitemap_urls(arguments.sitemap)
        inspection_summary = inspect_urls(
            service, arguments.site_url, urls, arguments.inspect_limit, out_dir / "index-coverage.csv"
        )

    manifest = {
        "schema": "rnawiki-revamp-gsc-pull/v1",
        "step": "0.4",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "site_url": arguments.site_url,
        "date_range": {"start": start.isoformat(), "end": end.isoformat(), "days": HISTORY_DAYS + 1},
        "search_analytics": {
            "performance-by-page-daily.csv": {"rows": daily_count, "dimensions": ["date", "page"]},
            "performance-by-page-total.csv": {"rows": total_count, "dimensions": ["page"]},
            "note": "Rows below Search Console's anonymisation floor are omitted by the API, so the daily rows sum to less than the by-page totals.",
        },
        "url_inspection": inspection_summary,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"performance-by-page-daily.csv rows: {daily_count}")
    print(f"performance-by-page-total.csv rows: {total_count}")
    print(f"index-coverage.csv rows: {inspection_summary['urls_inspected']} of {inspection_summary['urls_available']} URLs")
    print(f"output: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
