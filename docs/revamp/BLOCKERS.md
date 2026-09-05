# BLOCKERS — items only Felix can resolve

Each entry: the step, the exact command or input that needs it, the full error or missing input, the retries made, the alternative tried, and what would unblock it. The run continues with everything that does not depend on the entry.

## [2026-09-05T05:14:24+00:00] Credentials absent at session start (checked with `[ -n "$VAR" ]` for each name)

### B2/R2 credentials for DVC (Phase 6.4)
- Needs: `B2_KEY_ID` and `B2_APP_KEY` (Backblaze B2) or `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` (Cloudflare R2) in the environment of the shell that runs `dvc push`.
- Found: none of the four names set.
- What the run does instead: Phase 6.4 initialises DVC, configures the remote by name, commits the `.dvc` files, and writes the exact `dvc remote modify` and `dvc push` commands here; 6.4 is then BLOCKED-WITH-EVIDENCE until you run them.

### Search Console (Phase 0.4 and 6.6)
- Needs: `GSC_SERVICE_ACCOUNT_JSON` (path to a service-account key with read access to the rnawiki.com property), or the two CSV exports named in the 0.4 entry below once written.
- Found: not set.
- What the run does instead: `scripts/revamp/gsc_ingest.py` reads the exports; the click path to produce them is recorded under 0.4; 0.4 is BLOCKED-WITH-EVIDENCE.

### data.gov.sg API key (Phase 2, source 11)
- Needs: `DATA_GOV_SG_API_KEY` only if the HSA listing dataset rate-limits the unauthenticated API.
- Found: not set. The ingester tries unauthenticated first and records here if it is limited.

### DDInter 2.0 non-commercial gate (Phase 2 source 18, Phase 4.1)
- Needs: your written confirmation that CC BY-NC-SA data may be used for validation of a commercial site's predictions (validation only; never rendered, never in the corpus or release).
- Until then: validation runs against openFDA `drug_interactions` and the Inxight DDI dataset only. DDInter is retrieved into `data/validation/ddinter/` and joined to nothing.

### Release-candidate upload (Phase 6.5)
- Needs: your Zenodo or Hugging Face account to upload `data/release/` once built; the exact steps are written in the 6.5 entry when the tarball exists.

## [2026-09-05] Phase 0 Step 0.4 — Search Console exports (Felix's account access)

- **Needs:** either `GSC_SERVICE_ACCOUNT_JSON` (path to a Google service-account key JSON whose
  `client_email` has been granted access to the rnawiki.com property), or the two CSV exports below.
- **Checked with:** `[ -n "$GSC_SERVICE_ACCOUNT_JSON" ]` at 2026-09-05. Not set. No OAuth client and
  no service account exist for the property; `docs/worklogs/search-indexing-investigation.md`
  recorded the same absence on 2026-09-02 ("the repository holds no Search Console integration").
- **Retries:** none are possible. This is a missing credential, not a failing call: the API rejects
  an unauthenticated `searchanalytics.query` with HTTP 401 before any backoff would apply.
- **Alternative tried and taken:** the on-disk export at
  `data/revamp/gsc-export-2026-09-02/` (copied from `~/Downloads/rnawiki.com-Coverage-2026-09-02/`,
  downloaded 2026-09-02 07:25) was ingested. It is sitemap-scoped, covers 2026-07-18 to 2026-08-28,
  and holds no URL. It answers the impressions question and nothing else. Details in the 0.4 entry.

### What is still missing

The export on disk is the Indexing chart and issue counts only. Two exports are needed, neither of
which exists yet:

**Export A — Performance → Pages, 16 months.**

1. Open https://search.google.com/search-console and select the **rnawiki.com** property.
2. Left sidebar → **Performance** → **Search results**.
3. Click the **Date** filter chip at the top → **Custom** → set the start date to **2025-05-05** and
   the end date to **today** → **Apply**. (16 months is the maximum Search Console retains; a start
   date earlier than that silently clamps.)
4. Turn on all four metric tiles above the chart: **Total clicks**, **Total impressions**,
   **Average CTR**, **Average position**.
5. Below the chart, click the **PAGES** tab.
6. Top right of the page → **Export** (the ⬇ icon) → **Download CSV**.
7. A ZIP arrives named like `rnawiki.com-Performance-on-Search-2026-09-05.zip`. Do not unzip it.

**Export B — Indexing → Pages, both halves.**

1. Same property → left sidebar → **Indexing** → **Pages**.
2. Top right → **Export** → **Download CSV**. This gives the "Why pages aren't indexed" table.
   The ZIP is named like `rnawiki.com-Coverage-2026-09-05.zip`.
3. Back on the same report, scroll to the top card and click
   **View data about indexed pages** (the link under the green "Indexed" figure).
4. On that page, top right → **Export** → **Download CSV**. This gives the indexed URL list.
   The ZIP is named like `rnawiki.com-Coverage-2026-09-05 (1).zip`.
5. Optional but useful: on the "Why pages aren't indexed" table, click the row
   **Discovered – currently not indexed**, then **Export** on the example-URL table. The same for
   **Crawled – currently not indexed**. These are the only exports that name individual URLs behind
   an issue, and the ingester reads them.

### File names expected

Put every ZIP, unopened, in one directory — `~/Downloads/gsc-2026-09-05/` is fine:

```
rnawiki.com-Performance-on-Search-<date>.zip     Export A
rnawiki.com-Coverage-<date>.zip                  Export B step 2
rnawiki.com-Coverage-<date> (1).zip              Export B step 4
rnawiki.com-Coverage-<date> (2).zip              Export B step 5, if taken
```

The ingester classifies each CSV inside by its header row, not its name, so the numbering in
parentheses does not matter and unzipped folders work equally well.

### Command to run once they exist

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
.venv-corpus/bin/python scripts/revamp/gsc_ingest.py ~/Downloads/gsc-2026-09-05
```

It writes `data/revamp/gsc/ingested.parquet` and `data/revamp/gsc/ingested-summary.json` and prints
per-tier clicks, impressions and indexed-page counts.

### The credential route, if you would rather not click

```bash
export GSC_SERVICE_ACCOUNT_JSON=/absolute/path/to/key.json
.venv-corpus/bin/python scripts/revamp/gsc_pull.py
```

The service account needs the property grant: Search Console → **Settings** →
**Users and permissions** → **Add user** → paste the `client_email` from the key JSON → Full. This
route also reaches the URL Inspection API, which is the only way to get a per-URL index verdict, at
2,000 URLs per property per day.

## [2026-09-06] Phase 2 source 14 — MHRA products database and emc: terms do not clear this use

**Status: BLOCKED-WITH-EVIDENCE. Nothing was scraped. `regulatory.UK`, `smpcInteractions` and
`smpcPharmacodynamics` are not populated by this run, and UK status reads "UK register not cleared
for this run".** Full determination, with every quotation verbatim from the retrieved pages:
`data/sources/mhra-emc/2026-09-06/legal/TERMS-DETERMINATION.md`.

### emc (www.medicines.org.uk, Datapharm Ltd) — terms found, and they forbid it

`https://www.medicines.org.uk/emc/privacy-notice-and-legal` (HTTP 200, 58,552 bytes, retrieved
2026-09-06; verbatim text saved at `legal/emc-legal-and-privacy-notice.verbatim.txt`) states:

> The material on the site must not be used, reproduced, linked to and/or sold for commercial
> benefit. Datapharm’s decision, on whether it is of commercial benefit, is final.

and under **Prohibited use**, "You agree not to use the Website ... for any commercial purposes ...
to create or populate a database or knowledge bank (electronic or otherwise) that includes material
downloaded or otherwise obtained from the Website ... to transmit or re-circulate any material
obtained from the Website to any third party ... to routinely or systematically check/track
changes/updates to 3rd party information", and names "Publishers" and "Database providers" among the
organisations the terms apply to directly. rnawiki.com is a commercial site and Phase 2 is database
population, so four separate clauses cover it. There is no retry, mirror or endpoint that changes
this: the prohibition is on the use, not on the transport.

### products.mhra.gov.uk — no terms exist to rely on, and no route that terms would cover

- `robots.txt` (HTTP 200, 66 bytes) has no `Disallow`. Crawl permission is not a reuse licence.
- The site publishes no terms, copyright or licence page. Its Next.js build manifest
  (`legal/mhra-buildManifest.js`) enumerates every route that exists on the site — `/`, `/_error`,
  `/about`, `/accessibility`, `/cookies`, four `medicine-levels-in-pregnancy` routes, `/product`,
  `/search`, `/substance`, `/substance-index` — and none is a terms route. `/about/`, `/cookies/`
  and `/accessibility/` were retrieved and contain no licensing statement.
- GOV.UK's Open Government Licence statement is scoped to www.gov.uk and is not asserted here; OGL
  v3 itself excludes "third party rights the Information Provider is not authorised to license", and
  SmPC text is drafted by the marketing authorisation holder, not the Crown.
- No bulk file exists. `ckan.publishing.service.gov.uk/api/3/action/package_search?q=organization:
  medicines-and-healthcare-products-regulatory-agency&rows=100` (HTTP 200) returns 7 datasets —
  spend over £25,000, recruitment exceptions, GPC transactions, the 2022 organogram, SABRE, adverse
  incident reporting, Yellow Card — none of them product information.
- No usable API exists. Two endpoints appear in the client bundle. The Azure Cognitive Search index
  `mhraproducts4853.search.windows.net` is the site's own backend, reached with a key issued to the
  site and embedded in its JavaScript, with no documentation, registration route or terms; the key
  value is redacted in our saved copy. `https://medicines.api.mhra.gov.uk/graphql` is not serving.

### Retries, with the exact commands and full errors

`.venv-corpus/bin/python scripts/revamp/mhra_emc_probe_api.py`, transcript at
`data/sources/mhra-emc/2026-09-06/legal/mhra-medicines-api-probe.json`, nine lines in
`data/sources/mhra-emc/2026-09-06/requests.log`:

```
POST https://medicines.api.mhra.gov.uk/graphql   attempt 1  HTTP 503  0 bytes   (sleep 2s)
POST https://medicines.api.mhra.gov.uk/graphql   attempt 2  HTTP 503  0 bytes   (sleep 4s)
POST https://medicines.api.mhra.gov.uk/graphql   attempt 3  HTTP 503  0 bytes
POST https://medicines.api.mhra.gov.uk/          attempt 1  HTTP 503  0 bytes   (sleep 2s)
POST https://medicines.api.mhra.gov.uk/          attempt 2  HTTP 503  0 bytes   (sleep 4s)
POST https://medicines.api.mhra.gov.uk/          attempt 3  HTTP 503  0 bytes
POST https://api.mhra.gov.uk/  (alternative host) attempts 1-3  curl: (6) Could not resolve host: api.mhra.gov.uk
```

The 503 responses carry a zero-byte body, so there is no server message to quote beyond the status.

### What was forgone, measured

`data/sources/mhra-emc/2026-09-06/raw/products-mhra-sitemap.xml` (HTTP 200, 4,973,488 bytes,
`lastmod` 2026-05-20 throughout) lists 25,414 URLs: 21,589 `/product` pages, 3,769 `/substance`
pages, 33 substance-index pages, 18 medicine-levels-in-pregnancy pages, 5 site pages. Those product
pages hold SmPC sections 4.5 and 5.1. emc's own About page claims "more than 14,000 documents". The
sitemap is kept only as this measurement and is joined to nothing.

### What would unblock it — Felix's decision, not the run's

1. **emc content licence from Datapharm.** The Terms direct licensing enquiries to Datapharm's
   copyright contact on `https://www.medicines.org.uk/emc/privacy-notice-and-legal`. A licence would
   need to permit commercial use, database storage and derived rendering, which is exactly what the
   current Terms refuse. Datapharm sells this as a product (emc med data, `meddata.medicines.org.uk`,
   and the Datapharm products page), so a price exists; it is a paid decision.
2. **MHRA.** Ask MHRA whether products.mhra.gov.uk content is offered under the Open Government
   Licence and whether the retired `medicines.api.mhra.gov.uk` GraphQL API will return. The site's
   own feedback address, `parfeedback@mhra.gov.uk`, is on the products home page. A written OGL
   confirmation, or an FOI/open-data publication of the SPC corpus on data.gov.uk, would clear
   products.mhra.gov.uk entirely and is free.

Until one of those lands, UK regulatory status renders as "not found in the UK register as of
2026-09-06 — UK register not cleared for this run" rather than being filled from an unlicensed
source.

## [2026-09-06] Phase 2 Step 2.12 — Australian Register of Therapeutic Goods (ARTG)

**Status: BLOCKED-WITH-EVIDENCE.** The SUSMP half of Australian regulatory status is mapped and
licensed (CC BY 4.0, Federal Register of Legislation, 2,929 pages); the ARTG half is not retrievable
under the publisher's terms.

The TGA Copyright page permits reproduction "for your own personal use" or "internal use within your
organisation" and then states "You must not use the whole or any part of the content on this website
for any commercial purposes" and "You are not permitted to re-transmit, distribute or commercialise
the material without our prior written approval". rnawiki.com is commercial and the use is rendered
redistribution, so operating rule 8 refuses it. Independently, `www.ebs.tga.gov.au`, the host serving
the ARTG public search and export, returns `User-agent: * / Disallow: /`; and `www.tga.gov.au` was
unreachable across nine requests over two days (`curl: (28) Operation timed out after 30011
milliseconds with 0 bytes received`, http_code 000, TLS handshake completing before the stall).

Alternatives tried and rejected: `apps.tga.gov.au` (no export, no robots.txt); data.gov.au CKAN,
four queries, no ARTG dataset and no tga.gov.au-hosted resource; the Internet Archive CDX index, no
bulk file in any format, and Ground 1 would refuse it regardless.

Unblocking is a free ask, not a purchase: written permission from the TGA Copyright Officer
(`tga.copyright@tga.gov.au`) to redistribute ARTG entry-level facts commercially with attribution,
or an open-licence publication of the ARTG on data.gov.au. Full evidence, commands, error text,
retry table and network diagnosis: `data/revamp/worklog-entries/2.12-blocker.md`.

Until then the Australia line renders the SUSMP schedule and states that ARTG status was not
retrieved and why. It never renders "not found in the ARTG", because the register was never searched.

## [2026-09-06] Phase 2 source 18 — DDInter 2.0 retrieved, held out, and waiting on your decision

**Status: retrieved and indexed for validation; joined to nothing.** The gate recorded on
2026-09-05 above stands, and this entry records what now sits behind it.

- **The licence.** `https://ddinter2.scbdd.com/terms/` (HTTP 200, retrieved before the first data
  request, local copy `data/validation/ddinter/2026-09-06/legal/terms.html`) states: "The DDInter
  data is made available under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
  International license. Except as otherwise provided in any additional terms for a service, you
  may print or download content from the services for your own personal, non-commercial,
  informational or scholarly use." The site publishes no robots.txt (HTTP 404), so nothing
  restricted the retrieval; the restriction is on the use. rnawiki.com is commercial.
- **What is held.** 295,184 distinct drug pairs over 2,290 drugs with severity and mechanism flags
  (`data/validation/ddinter/index.parquet`), 8,466 interaction descriptions
  (`interaction-descriptions.parquet`), and a name-to-UNII candidate map
  (`name-unii-candidates.parquet`, 6,351 candidate rows, none confirmed). Nothing is under
  `data/sources/`, no `mapped.parquet` exists and no page carries a DDInter value. Phase 6.5 builds
  the release candidate from `data/sources/` per LICENSES.md, so `data/validation/` is outside its
  input; the LICENSES row for DDInter records commercial use as not permitted, which is the check
  that keeps it out.
- **Needs:** your written confirmation that CC BY-NC-SA data may be used as a second reference when
  scoring Phase 4's mechanism-predicted interactions — read, compared against, and reported as a
  precision and recall table, with no DDInter value ever rendered or redistributed.
- **Until then:** `scripts/revamp/validate_interactions.py` scores against openFDA
  `drug_interactions` and the Inxight DDI dataset only, and the DDInter table is not opened.
- **If you decline:** delete `data/validation/ddinter/` and nothing else changes; no other artefact
  in this run reads it.

# BLOCKER — Phase 2 Step 2.10 — WITHDRAWN database (Charité)

**Status:** BLOCKED-WITH-EVIDENCE. Zero records retrieved, zero rows attributed to this source.
**Date:** 2026-09-06 (UTC timestamps in evidence files are 2026-09-05, the run crosses midnight UTC).
**Evidence:** `data/sources/withdrawn/2026-09-06/{manifest.json,requests.log,retry-evidence.txt,legal/}`

## Why it is blocked

The block is a **licence** block, not an availability block. Two independent bars in operating
rule 8 fail, and either alone is sufficient:

1. **The terms of the database contents cannot be found.** No licence, terms-of-use or copyright
   grant is published on any page of either version. Checked and captured: v1 `index.html`,
   `help_faq.html`, `links.html` (the download page itself) and `contact.html`; v2 `index.php`,
   FAQ, contact and footer; and the Structural Bioinformatics Group homepage. The v1 download page
   offers the four SDF files with no stated terms, and its only legal sentence is a disclaimer
   about *external* websites: "We do not assume liability for the content and validity of external
   websites connected through our website."
2. **The only licence attaching to the work is non-commercial.** Both papers are Open Access under
   CC BY-NC 4.0 — "permits non-commercial re-use, distribution, and reproduction in any medium,
   provided the original work is properly cited" (NAR 2016;44(D1):D1080 and NAR 2024;52(D1):D1503).
   rnawiki.com is a commercial site, so rule 8's "data under a non-commercial licence is never
   joined into rendered pages or into the release candidate" applies.

The 2024 paper's Data Availability statement points only at the live site and the FAQ bulk CSV:
"the general information on all drugs contained in the database is available as a bulk download in
the website FAQs as a CSV file." It asserts no licence over that file.

## Availability, recorded separately

The v2 web application is also offline, and this is recorded so the licence finding is not confused
with a transient outage. Every path under `https://bioinformatics.charite.de/withdrawn_3/` returns
HTTP 404, including the bulk CSV. `cheminfo.charite.de` has no DNS A record.

## Commands, retries and full errors

Three retries with exponential backoff (2s, 4s, 8s) per target, logged in full to
`data/sources/withdrawn/2026-09-06/retry-evidence.txt`:

```
curl -sSL 'https://bioinformatics.charite.de/withdrawn_3/downloads/withdrawns.csv'
  -> exit 0, HTTP 404, 288 bytes, x3
     <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title>
     </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p>
curl -sSL 'https://bioinformatics.charite.de/withdrawn_3/index.php'
  -> exit 0, HTTP 404, 288 bytes, x3 (same body)
curl -sSL 'http://cheminfo.charite.de/withdrawn/structures/withdrawn_all.sdf'
  -> exit 6, "curl: (6) Could not resolve host: cheminfo.charite.de", x3, no response body
dig +short cheminfo.charite.de A        -> (empty; no A record)
dig +short bioinformatics.charite.de A  -> s-c02-miph-web1.charite.de. / 141.42.207.109
```

## Alternative endpoints and mirrors tried

- `https://tox.charite.de/withdrawn/`, `https://tox.charite.de/withdrawn_3/`,
  `https://tox-new.charite.de/withdrawn/` — the group's newer host, which resolves
  (141.42.206.128) and serves ProTox. All three return HTTP 404.
- Internet Archive CDX index for both hosts (`legal/cdx-cheminfo.txt`, `legal/cdx-withdrawn3.txt`).
  **The data is there**: four v1 bulk SDF files are preserved and reachable —
  `withdrawn_all.sdf` (628,870 bytes), `withdrawn_withdrawn.sdf` (244,969),
  `withdrawn_discontinued.sdf` (324,993), `withdrawn_ema.sdf` (60,967) — plus roughly 500 v2
  `drug_info.php` pages. **They were deliberately not retrieved.** The licence bar above is
  independent of availability, so retrieving them would not make them usable.
  This corrects the 2026-09-05 attempt, which recorded that the Archive held nothing.

## What would unblock it

One of, in descending order of value:

1. Written permission from the maintainers to reuse the database contents commercially, or their
   publication of an explicit licence. Contacts on the captured contact pages: Robert Preissner
   (robert.preissner@charite.de), Björn Gohlke, Kathleen Gallo, Andrean Goede, Andreas Eckert,
   Institute for Physiology, Structural Bioinformatics Group, Philippstr. 12, 10115 Berlin.
2. Felix's decision to accept CC BY-NC data on the same footing as DDInter 2.0 (spec item 18) —
   i.e. retrieved into a validation-only path, never joined into rendered pages or the release
   candidate. This would still not fill the withdrawal field on any public page.

Neither is needed for the withdrawal field itself: see `data/revamp/worklog-entries/2.10.md`, which
records that field filled from a licensed source instead.

### [2026-09-06T00:30Z] Phase 2 Step 2.11 — BLOCKED sub-item: MOH drug-level subsidy status

Scope of this blocker. Only the subsidy sub-item of source 11 is blocked. The HSA Listing of
Registered Therapeutic Products was retrieved in full and mapped, and the Singapore statutory
control sub-item is handled in `data/revamp/worklog-entries/2.11.md`. The `regulatory.SG` field
therefore carries registration status, forensic classification and statutory control, and states
the subsidy position as not published rather than leaving it blank.

What was asked. Search data.gov.sg for the MOH Standard Drug List (SDL) or Medication Assistance
Fund (MAF) list and ingest subsidy status if published.

Commands run, in order.

```
python scripts/revamp/hsa_sg_catalogue_search.py          # HSA_SG_DATE=2026-09-06
  → 462 pages of https://api-production.data.gov.sg/v2/public/api/datasets?page=N
  → data/sources/hsa-singapore/2026-09-06/raw/search/catalogue.json  (4,616 datasets)
  → data/sources/hsa-singapore/2026-09-06/raw/search/catalogue-matches.json  (105 datasets)
bash scripts/revamp/fetch_log.sh \
  "https://api-production.data.gov.sg/v2/public/api/datasets/d_586ee0cbc5c79ff8167a46132a405239/metadata" ...
bash scripts/revamp/fetch_log.sh \
  "https://data.gov.sg/api/action/datastore_search?resource_id=d_586ee0cbc5c79ff8167a46132a405239&limit=100" ...
  → data/sources/hsa-singapore/2026-09-06/raw/search/moh-healthcare-schemes-records.json
```

Result. Every request returned HTTP 200; there was no error to retry against and no rate limit was
hit. The complete portal catalogue of 4,616 datasets holds no drug-level subsidy dataset. The
closest Ministry of Health dataset, `d_586ee0cbc5c79ff8167a46132a405239` "Healthcare Schemes and
Subsidies" (1,465 bytes, 26 rows, columns `schemes_and_subsidies` and `type`), names
"Subsidies for Drugs on the Standard Drug List (SDL) at Public Healthcare Institutions" and
"Subsidies for Drugs on the Medication Assistance Fund (MAF) List at Public Healthcare
Institutions" as two of its 26 scheme names. It contains no medicine, no active ingredient and no
subsidy class. Searching the catalogue for `standard drug list`, `sdl`, `medication assistance`,
`maf`, `subsid`, `formulary`, `drug list`, `medicine list` and `pharmac` over dataset name,
description and managing agency returns nothing else that carries a medicine.

Alternative checked. The Ministry of Health publishes the subsidised-drug list at
`https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/list-of-subsidised-drugs/`
(page states "last updated 31 August 2026"). It is a paginated in-page table of roughly 102 pages
with search controls over Active Ingredient, Dosage Form, Strength, Subsidy Class and Clinical
Indication. It offers no bulk file, no download link and no API, and the page carries no reuse
licence or open-data statement — only a "© 2026 Government of Singapore" footer and a general Terms
of Use. Under revamp operating rule 8, a source whose terms cannot be found is recorded and not
scraped, so no request was made to that table.

What was written instead of a blank. `regulatorySG.subsidy` on every matched page carries
`status: "not published as open data"` with the statement naming the date searched, the catalogue
size and the three evidence files, so a reader sees "not found in [register] as of [date]" rather
than an empty field.

What would unblock it. Any one of: (1) MOH publishing the SDL/MAF list as a data.gov.sg dataset,
which the catalogue search re-run would then find; (2) an explicit reuse permission or open-data
licence on the MOH subsidised-drugs page, which would make its paginated table retrievable under
rule 8; (3) Felix obtaining the list directly from MOH under terms that permit reuse on a
commercial site.

## [2026-09-06] Phase 2 Step 2.12 — Australian Register of Therapeutic Goods (ARTG): BLOCKED-WITH-EVIDENCE

The SUSMP half of this source is delivered (see `data/revamp/worklog-entries/2.12.md`). The ARTG
half — active ingredient, ARTG id and ARTG status — is not, and is not retrievable under the
publisher's terms. Two independent grounds, either of which is sufficient on its own.

### Ground 1 — the terms refuse the use, and this is the deciding one

`https://www.tga.gov.au/about-us/using-our-website/copyright` (© Commonwealth of Australia,
Therapeutic Goods Administration):

> Except where otherwise indicated, you can download, display, print and reproduce the whole or part
> of this content in an unaltered form for: your own personal use; internal use within your
> organisation. … **You must not use the whole or any part of the content on this website for any
> commercial purposes.**

> **Commercial and other use.** You are not permitted to re-transmit, distribute or commercialise
> the material without our prior written approval. You may not use this website to sell a product or
> service, or to increase traffic to your website for commercial reasons, such as advertising sales.

The earlier page at `https://www.tga.gov.au/copyright` says the same in the older wording:
reproduction is allowed for personal or internal organisational use "but only if you or your
organisation do not use the reproduction for any commercial purpose", and "you are not permitted to
re-transmit, distribute or commercialise the material without obtaining prior written approval from
the Commonwealth".

rnawiki.com is a commercial site and the intended use is redistribution in rendered pages, so both
sentences bite. Spec operating rule 8: data under a non-commercial licence is never joined into
rendered pages or into the release candidate.

Captures (the live host is unreachable, see Ground 3, so these are Internet Archive captures, taken
through `web.archive.org/web/<timestamp>id_/` which returns the original bytes without the archive's
own banner):

```
data/sources/tga-artg/2026-09-06/legal/tga-copyright-wayback-20251128.html   113,063 bytes
data/sources/tga-artg/2026-09-06/legal/tga-copyright-wayback-20250518.html    59,398 bytes
```

2025-11-28 is the most recent capture of that page that returns content; the CDX index shows the
only later captures of `/copyright` are 301 redirects to the `/about-us/using-our-website/copyright`
path captured here. Neither capture can be confirmed against the live page today, because the live
page cannot be reached.

### Ground 2 — the ARTG host forbids automated retrieval

```
$ curl https://www.ebs.tga.gov.au/robots.txt
User-agent: *
Disallow: /
```

`www.ebs.tga.gov.au` is the TGA Business Services host that serves the ARTG public search and its
export. Its robots.txt disallows every path for every agent. No path on that host was requested
beyond `robots.txt` itself. Saved at
`data/sources/tga-artg/2026-09-06/legal/robots-www-ebs-tga-gov-au.txt`.

### Ground 3 — the TGA website is unreachable from this workstation

Nine requests over two days, each a fresh TCP connection that completed the TLS handshake and then
received nothing before the 30 s timeout. Exact command shape:

```
curl -sS -4 --http1.1 --compressed -m 30 \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: en-AU,en;q=0.9' <url>
```

Full error text, identical on every attempt:

```
curl: (28) Operation timed out after 30011 milliseconds with 0 bytes received
http_code=000 size=0
```

Three retries with exponential backoff (0 s, 7 s, 22 s between attempts) against each of three URLs,
run 2026-09-06 with a normal desktop browser user agent over HTTP/1.1, as the earlier gate attempt
was asked to do:

| URL | attempts | result |
| --- | --- | --- |
| https://www.tga.gov.au/robots.txt | 3 | curl (28), 0 bytes, each after 30 s |
| https://www.tga.gov.au/about-tga/copyright | 3 | curl (28), 0 bytes, each after 30 s |
| https://www.tga.gov.au/resources/artg | 3 | curl (28), 0 bytes, each after 30 s |

Evidence: `data/sources/tga-artg/2026-09-06/legal/www-tga-gov-au-retries.txt` and the `000` rows in
`data/sources/tga-artg/2026-09-06/requests.log`. The gate attempt of 2026-09-05 recorded three more
identical timeouts in `data/sources/tga-artg/2026-09-05/tga-www-retries.txt`.

Diagnosis, so the cause is not misreported. It is not DNS and it is not TLS. `www.tga.gov.au` is a
CNAME to `www.tga.gov.au.edgekey.net` → `e85658.dscb.akamaiedge.net` → 23.75.23.80, 23.75.23.121;
`curl -v` connects to port 443, sends the ClientHello and receives ServerHello and Certificate, then
the response never arrives. Port 80 behaves the same. The apex `tga.gov.au` resolves to the GovCMS
origin (54.252.75.26, 13.236.242.190, 54.206.239.18) and answers instantly with
`HTTP/1.1 301 … Location: https://www.tga.gov.au/robots.txt` and an `X-LAGOON` header, so the
redirect target on the Akamai edge is the only unreachable piece. Requesting the same path against a
second edge IP made no difference. Every other host reached in this step answered normally
(`www.legislation.gov.au`, `data.gov.au`, `www.ebs.tga.gov.au`, `apps.tga.gov.au`, `web.archive.org`),
so this is specific to the `www.tga.gov.au` edge and not to this workstation's network.

### Alternatives tried

1. **`www.ebs.tga.gov.au`, the ARTG search and export host.** Reachable (robots.txt, HTTP 200). Not
   used: `Disallow: /` for every agent. Ground 2.
2. **`apps.tga.gov.au`.** Reachable; `robots.txt` returns HTTP 404 from IIS. No ARTG bulk export is
   published on it and no path on it was requested.
3. **data.gov.au, for an openly licensed redistribution.** CKAN API, four queries:
   `package_search?q=ARTG`, `q=title:ARTG`, `q=Therapeutic+Goods+Administration`,
   and `resource_search?query=url:tga.gov.au`. Results: 1 unrelated dataset, 0, 506 unrelated
   full-text hits (NSW gazettes and annual reports), 0 resources. There is no ARTG dataset and no
   resource hosted on tga.gov.au anywhere on data.gov.au.
4. **Internet Archive, for an archived bulk file.** CDX index over `tga.gov.au` filtered to URLs
   containing `artg`, `copyright` or `licen`, from 2023, 300 rows collapsed by urlkey: every ARTG hit
   is an individual `/artg/artg-id-<number>` record page or a COVID-19 test listing page. No CSV,
   XLSX, ZIP or JSON export exists in the archive. Even if one did, Ground 1 would still refuse it.

### What would unblock it — Felix's decision, not the run's

1. **Written permission from the TGA.** The Copyright page names the route: the TGA Copyright
   Officer, `tga.copyright@tga.gov.au`, PO Box 100, Woden ACT 2606. The ask is narrow and specific:
   permission to reproduce and redistribute ARTG entry-level facts (ARTG id, product name, active
   ingredient, sponsor, status, start date) on a commercial website with attribution. It is free to
   ask.
2. **An open-licence publication of the ARTG.** If the TGA publishes the ARTG on data.gov.au under
   CC BY 4.0 the way the Federal Register of Legislation publishes the Poisons Standard, this clears
   immediately and the same mapping script covers it. Worth asking for in the same email.

Until one of those lands, the Australian line of the "Where it's registered" block carries the SUSMP
schedule, which is fully licensed, and states that ARTG status was not retrieved and why. It does
not say "not found in the ARTG", because the register was never searched.

## [2026-09-06] Phase 2 source 14 — MHRA products database and emc: terms do not clear this use

**Status: BLOCKED-WITH-EVIDENCE. Nothing was scraped. `regulatory.UK`, `smpcInteractions` and
`smpcPharmacodynamics` are not populated by this run, and UK status reads "UK register not cleared
for this run".** Full determination, with every quotation verbatim from the retrieved pages:
`data/sources/mhra-emc/2026-09-06/legal/TERMS-DETERMINATION.md`.

### emc (www.medicines.org.uk, Datapharm Ltd) — terms found, and they forbid it

`https://www.medicines.org.uk/emc/privacy-notice-and-legal` (HTTP 200, 58,552 bytes, retrieved
2026-09-06; verbatim text saved at `legal/emc-legal-and-privacy-notice.verbatim.txt`) states:

> The material on the site must not be used, reproduced, linked to and/or sold for commercial
> benefit. Datapharm’s decision, on whether it is of commercial benefit, is final.

and under **Prohibited use**, "You agree not to use the Website ... for any commercial purposes ...
to create or populate a database or knowledge bank (electronic or otherwise) that includes material
downloaded or otherwise obtained from the Website ... to transmit or re-circulate any material
obtained from the Website to any third party ... to routinely or systematically check/track
changes/updates to 3rd party information", and names "Publishers" and "Database providers" among the
organisations the terms apply to directly. rnawiki.com is a commercial site and Phase 2 is database
population, so four separate clauses cover it. There is no retry, mirror or endpoint that changes
this: the prohibition is on the use, not on the transport.

### products.mhra.gov.uk — no terms exist to rely on, and no route that terms would cover

- `robots.txt` (HTTP 200, 66 bytes) has no `Disallow`. Crawl permission is not a reuse licence.
- The site publishes no terms, copyright or licence page. Its Next.js build manifest
  (`legal/mhra-buildManifest.js`) enumerates every route that exists on the site — `/`, `/_error`,
  `/about`, `/accessibility`, `/cookies`, four `medicine-levels-in-pregnancy` routes, `/product`,
  `/search`, `/substance`, `/substance-index` — and none is a terms route. `/about/`, `/cookies/`
  and `/accessibility/` were retrieved and contain no licensing statement.
- GOV.UK's Open Government Licence statement is scoped to www.gov.uk and is not asserted here; OGL
  v3 itself excludes "third party rights the Information Provider is not authorised to license", and
  SmPC text is drafted by the marketing authorisation holder, not the Crown.
- No bulk file exists. `ckan.publishing.service.gov.uk/api/3/action/package_search?q=organization:
  medicines-and-healthcare-products-regulatory-agency&rows=100` (HTTP 200) returns 7 datasets —
  spend over £25,000, recruitment exceptions, GPC transactions, the 2022 organogram, SABRE, adverse
  incident reporting, Yellow Card — none of them product information.
- No usable API exists. Two endpoints appear in the client bundle. The Azure Cognitive Search index
  `mhraproducts4853.search.windows.net` is the site's own backend, reached with a key issued to the
  site and embedded in its JavaScript, with no documentation, registration route or terms; the key
  value is redacted in our saved copy. `https://medicines.api.mhra.gov.uk/graphql` is not serving.

### Retries, with the exact commands and full errors

`.venv-corpus/bin/python scripts/revamp/mhra_emc_probe_api.py`, transcript at
`data/sources/mhra-emc/2026-09-06/legal/mhra-medicines-api-probe.json`, nine lines in
`data/sources/mhra-emc/2026-09-06/requests.log`:

```
POST https://medicines.api.mhra.gov.uk/graphql   attempt 1  HTTP 503  0 bytes   (sleep 2s)
POST https://medicines.api.mhra.gov.uk/graphql   attempt 2  HTTP 503  0 bytes   (sleep 4s)
POST https://medicines.api.mhra.gov.uk/graphql   attempt 3  HTTP 503  0 bytes
POST https://medicines.api.mhra.gov.uk/          attempt 1  HTTP 503  0 bytes   (sleep 2s)
POST https://medicines.api.mhra.gov.uk/          attempt 2  HTTP 503  0 bytes   (sleep 4s)
POST https://medicines.api.mhra.gov.uk/          attempt 3  HTTP 503  0 bytes
POST https://api.mhra.gov.uk/  (alternative host) attempts 1-3  curl: (6) Could not resolve host: api.mhra.gov.uk
```

The 503 responses carry a zero-byte body, so there is no server message to quote beyond the status.

### What was forgone, measured

`data/sources/mhra-emc/2026-09-06/raw/products-mhra-sitemap.xml` (HTTP 200, 4,973,488 bytes,
`lastmod` 2026-05-20 throughout) lists 25,414 URLs: 21,589 `/product` pages, 3,769 `/substance`
pages, 33 substance-index pages, 18 medicine-levels-in-pregnancy pages, 5 site pages. Those product
pages hold SmPC sections 4.5 and 5.1. emc's own About page claims "more than 14,000 documents". The
sitemap is kept only as this measurement and is joined to nothing.

### What would unblock it — Felix's decision, not the run's

1. **emc content licence from Datapharm.** The Terms direct licensing enquiries to Datapharm's
   copyright contact on `https://www.medicines.org.uk/emc/privacy-notice-and-legal`. A licence would
   need to permit commercial use, database storage and derived rendering, which is exactly what the
   current Terms refuse. Datapharm sells this as a product (emc med data, `meddata.medicines.org.uk`,
   and the Datapharm products page), so a price exists; it is a paid decision.
2. **MHRA.** Ask MHRA whether products.mhra.gov.uk content is offered under the Open Government
   Licence and whether the retired `medicines.api.mhra.gov.uk` GraphQL API will return. The site's
   own feedback address, `parfeedback@mhra.gov.uk`, is on the products home page. A written OGL
   confirmation, or an FOI/open-data publication of the SPC corpus on data.gov.uk, would clear
   products.mhra.gov.uk entirely and is free.

Until one of those lands, UK regulatory status renders as "not found in the UK register as of
2026-09-06 — UK register not cleared for this run" rather than being filled from an unlicensed
source.

## [2026-09-05T20:52:47+00:00] ClinPGx (PharmGKB) and CPIC licence conditions (Phase 2 source 16; Phase 4.4)
- ClinPGx layers two conditions on CC BY-SA 4.0: "Under no circumstances can ClinPGx data be sold for other's private or commercial use" and use "for research purposes and not with any intent to offer all or any part of the data for sale as a commercial item"; share-alike would attach to every rendered page carrying a pgx row; CPIC states its acronym may not be reproduced on another website without NIH permission (its citation form is "CPIC(R) URL [date accessed]"). Evidence: data/sources/pharmgkb-cpic/2026-09-06/legal/.
- Default applied under Operating Rule 8 (non-commercial terms are never joined into rendered pages): the pgx rows stay in data/sources/pharmgkb-cpic/mapped.parquet, are excluded from the rendering field set and from the release candidate, and the Phase 4.4 pharmacogenomics block is BLOCKED-WITH-EVIDENCE until you decide. Reversible: one flag in scripts/revamp/integrate_sources.py (--allow-licence clinpgx) re-admits them.
- What would unblock: your reading that a free public site is not "sale" and that CC BY-SA attribution on those pages is acceptable, plus written permission from NIH/CPIC for the acronym or a rendering that names the guideline without it.

### [2026-09-06T00:30Z] Phase 2 Step 2.11 — BLOCKED sub-item: MOH drug-level subsidy status

Scope of this blocker. Only the subsidy sub-item of source 11 is blocked. The HSA Listing of
Registered Therapeutic Products was retrieved in full and mapped, and the Singapore statutory
control sub-item is handled in `data/revamp/worklog-entries/2.11.md`. The `regulatory.SG` field
therefore carries registration status, forensic classification and statutory control, and states
the subsidy position as not published rather than leaving it blank.

What was asked. Search data.gov.sg for the MOH Standard Drug List (SDL) or Medication Assistance
Fund (MAF) list and ingest subsidy status if published.

Commands run, in order.

```
python scripts/revamp/hsa_sg_catalogue_search.py          # HSA_SG_DATE=2026-09-06
  → 462 pages of https://api-production.data.gov.sg/v2/public/api/datasets?page=N
  → data/sources/hsa-singapore/2026-09-06/raw/search/catalogue.json  (4,616 datasets)
  → data/sources/hsa-singapore/2026-09-06/raw/search/catalogue-matches.json  (105 datasets)
bash scripts/revamp/fetch_log.sh \
  "https://api-production.data.gov.sg/v2/public/api/datasets/d_586ee0cbc5c79ff8167a46132a405239/metadata" ...
bash scripts/revamp/fetch_log.sh \
  "https://data.gov.sg/api/action/datastore_search?resource_id=d_586ee0cbc5c79ff8167a46132a405239&limit=100" ...
  → data/sources/hsa-singapore/2026-09-06/raw/search/moh-healthcare-schemes-records.json
```

Result. Every request returned HTTP 200; there was no error to retry against and no rate limit was
hit. The complete portal catalogue of 4,616 datasets holds no drug-level subsidy dataset. The
closest Ministry of Health dataset, `d_586ee0cbc5c79ff8167a46132a405239` "Healthcare Schemes and
Subsidies" (1,465 bytes, 26 rows, columns `schemes_and_subsidies` and `type`), names
"Subsidies for Drugs on the Standard Drug List (SDL) at Public Healthcare Institutions" and
"Subsidies for Drugs on the Medication Assistance Fund (MAF) List at Public Healthcare
Institutions" as two of its 26 scheme names. It contains no medicine, no active ingredient and no
subsidy class. Searching the catalogue for `standard drug list`, `sdl`, `medication assistance`,
`maf`, `subsid`, `formulary`, `drug list`, `medicine list` and `pharmac` over dataset name,
description and managing agency returns nothing else that carries a medicine.

Alternative checked. The Ministry of Health publishes the subsidised-drug list at
`https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/list-of-subsidised-drugs/`
(page states "last updated 31 August 2026"). It is a paginated in-page table of roughly 102 pages
with search controls over Active Ingredient, Dosage Form, Strength, Subsidy Class and Clinical
Indication. It offers no bulk file, no download link and no API, and the page carries no reuse
licence or open-data statement — only a "© 2026 Government of Singapore" footer and a general Terms
of Use. Under revamp operating rule 8, a source whose terms cannot be found is recorded and not
scraped, so no request was made to that table.

What was written instead of a blank. `regulatorySG.subsidy` on every matched page carries
`status: "not published as open data"` with the statement naming the date searched, the catalogue
size and the three evidence files, so a reader sees "not found in [register] as of [date]" rather
than an empty field.

What would unblock it. Any one of: (1) MOH publishing the SDL/MAF list as a data.gov.sg dataset,
which the catalogue search re-run would then find; (2) an explicit reuse permission or open-data
licence on the MOH subsidised-drugs page, which would make its paginated table retrievable under
rule 8; (3) Felix obtaining the list directly from MOH under terms that permit reuse on a
commercial site.
