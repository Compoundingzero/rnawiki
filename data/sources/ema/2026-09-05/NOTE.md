# Superseded partial capture

This directory holds the legal captures of an EMA attempt that stopped before any data file was
retrieved: `requests.log` records three requests and no download of the medicines output report, and
no `manifest.json` was written. The legal-notice request used
`https://www.ema.europa.eu/en/about-us/about-this-website/legal-notice`, which answers HTTP 404; the
notice lives at `https://www.ema.europa.eu/en/about-us/about-website/legal-notice`.

The complete pull is `data/sources/ema/2026-09-06/`, which re-retrieved robots.txt, the download page
and the legal notice at its working URL, and downloaded
`medicines-output-medicines-report_en.xlsx`. Nothing here feeds `data/sources/ema/mapped.parquet`.
