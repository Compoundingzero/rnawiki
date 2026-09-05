# Terms determination — MHRA products database and emc (Phase 2 source 14)

Determined 2026-09-06. Every statement below is backed by a file in this directory and a line in
`../requests.log`. Nothing was retrieved from either site beyond the legal, technical-discovery and
scope files listed here; no SmPC, PIL or PAR content was retrieved, parsed or stored.

## 1. emc — www.medicines.org.uk (Datapharm Ltd) — terms found, and they forbid this use

`robots.txt` (`robots-www.medicines.org.uk.txt`, HTTP 200, 85 bytes) disallows only `/cdn-cgi/`, so
robots alone would not stop a fetch. The published Terms do. From
`emc-legal-and-privacy-notice.verbatim.txt` (source
<https://www.medicines.org.uk/emc/privacy-notice-and-legal>), quoted verbatim:

> The emc website (and the collation and formation of its content) is owned and operated by
> Datapharm Ltd.

> Use of this site is subject to the following terms and disclaimers ("Terms") and by continuing to
> use the site you signify your acceptance of these Terms.

> The material on the site must not be used, reproduced, linked to and/or sold for commercial
> benefit.
> Datapharm’s decision, on whether it is of commercial benefit, is final.

Under the heading **Prohibited use**:

> The material on the site must not be used, reproduced, linked to and/or sold for commercial
> benefit.
>
> You agree not to use the Website:
>
> for any commercial purposes (which includes using the Website to promote or encourage the sale of
> your goods/services or for inclusion into healthcare and prescribing systems);
>
> to create or populate a database or knowledge bank (electronic or otherwise) that includes
> material downloaded or otherwise obtained from the Website
>
> to transmit or re-circulate any material obtained from the Website to any third party except where
> expressly permitted on the Website
>
> to routinely or systematically check/track changes/updates to 3rd party information
>
> to create additional information or summarise content for your own company or on behalf of another
> company.

> These terms apply directly to all organisations in the UK who gain commercially from using the emc
> websites including but not limited to; ... Publishers ... Database providers ...

Under **Allowed use** the only permissions granted are private study or personal use with
attribution, clinical use by healthcare professionals reproducing documents in their entirety, and
reproduction by pharmaceutical companies of their own content as emc publishing subscribers. None
of those is what rnawiki.com is.

rnawiki.com is a public commercial website that stores medicine information in a database and
renders derived sections from it, and Phase 2's purpose is precisely "to create or populate a
database or knowledge bank". Four separate prohibitions in the Terms cover that: commercial use,
database population, re-circulation to third parties, and systematic tracking of updates. The Terms
also state that Datapharm's own decision on what counts as commercial benefit is final, so there is
no reading of them under which this ingestion is permitted.

The only lawful route to emc content for this project is a negotiated content licence from
Datapharm, which the Terms direct to their licensing contact. That is a commercial decision for
Felix, not something this run can assume, so it is recorded in `docs/revamp/BLOCKERS.md`.

**Conclusion: emc is forbidden by its own published terms. Not retrieved. Not ingested.**

## 2. products.mhra.gov.uk — no terms exist to rely on

`robots.txt` (`robots-products.mhra.gov.uk.txt`, HTTP 200, 66 bytes) is `User-agent: *` with no
`Disallow` and a sitemap declaration, so the site permits crawling. Crawl permission is not a reuse
licence, and no reuse licence is published anywhere on this site:

- The site footer (`mhra-products-home.html`) carries exactly four links: Cookie Policy, Privacy
  Policy, Accessibility Statement, About this service. There is no terms-of-use, copyright or
  licence link.
- The site is a Next.js static export, and its build manifest
  (`mhra-buildManifest.js`) enumerates every route that exists:
  `/`, `/_error`, `/about`, `/accessibility`, `/cookies`, `/medicine-levels-in-pregnancy`,
  `/medicine-levels-in-pregnancy/reports/[report]`, `/medicine-levels-in-pregnancy/search`,
  `/medicine-levels-in-pregnancy/substance`, `/medicine-levels-in-pregnancy/substance-index`,
  `/product`, `/search`, `/substance`, `/substance-index`. There is no terms or copyright route.
  This is an enumeration of the whole site, not a search that came back empty.
- `/about/`, `/cookies/` and `/accessibility/` were retrieved and searched for the words copyright,
  licence, license, Open Government, terms of use, reuse, re-use and Crown. `/about/` contains none
  of them in a licensing sense; `/cookies/` and `/accessibility/` contain none of them at all.
- GOV.UK's own terms (`govuk-terms-and-conditions.verbatim.txt`) place *GOV.UK* content under the
  Open Government Licence and state: "If any content is not subject to Crown copyright protection or
  published under the OGL, we'll usually credit the author or copyright holder." That statement is
  scoped to www.gov.uk. products.mhra.gov.uk is a separate service that makes no such statement.
- The OGL v3 text itself (`open-government-licence-v3.verbatim.txt`) excludes, among other things,
  "third party rights the Information Provider is not authorised to license". An SmPC is drafted by
  the marketing authorisation holder and approved by the regulator — the MHRA's own "About this
  service" page (`mhra-products-about-this-service.verbatim.txt`) describes SPCs and PILs as
  descriptions of the medicinal product's properties published according to its licence history, and
  emc independently states that "All the information ... comes directly from pharmaceutical
  companies or via the medicines regulator". The text is therefore third-party copyright, which is
  the category OGL expressly does not cover even where OGL is asserted, and here it is not asserted.

### No bulk route and no API route

- **Bulk:** there is no download page on the site, and no SmPC/PIL/PAR dataset on data.gov.uk. The
  CKAN query `package_search?q=organization:medicines-and-healthcare-products-regulatory-agency`
  (`datagovuk-mhra-package-search.json`, HTTP 200) returns 7 datasets in total: Spend over £25,000,
  MHRA recruitment exceptions, MHRA GPC Transactions, MHRA organogram November 2022, SABRE, Adverse
  Incident Reporting (medical devices), and Adverse drug reactions (Yellow card scheme). None is
  product information.
- **API:** the client bundles reference two machine endpoints, neither of which is a published API.
  1. An Azure Cognitive Search index at `mhraproducts4853.search.windows.net` whose query key is
     embedded in the site's own JavaScript (`mhra-chunk-843-012836701345ef2e.js`). This is the
     site's private search backend reached with a key issued to the site, not to us; it carries no
     documentation, no registration route and no terms. Draining it would be bulk extraction of the
     whole corpus behind a key that was not granted to this project, so it is not used. The key
     value in the saved copy of that bundle has been replaced with
     `REDACTED-BY-RNAWIKI-REVAMP-SEE-legal/TERMS-DETERMINATION.md`; the endpoint host, the
     `api-key` query parameter name and the `api-version=2017-11-11` it uses are left intact,
     because those are what the determination rests on and the key value is not.
  2. `https://medicines.api.mhra.gov.uk/graphql`, referenced in
     `mhra-chunk-843-012836701345ef2e.js`. It is not serving. Three attempts with exponential
     backoff returned HTTP 503 with a zero-byte body every time, as did three attempts against the
     host root, and the alternative host `api.mhra.gov.uk` does not resolve. Full transcript in
     `mhra-medicines-api-probe.json`; the nine requests are also in `../requests.log`.

The only remaining route would be fetching the 21,589 product pages and 3,769 substance pages named
in the sitemap. Operating rule 8 of `docs/specs/revamp-2026-09.md` settles that: "If a source's
terms cannot be found or forbid bulk access, record it and do not scrape it." The terms cannot be
found, and the content is third-party copyright with no licence granted, so the pages are not
fetched.

**Conclusion: products.mhra.gov.uk publishes no reuse terms, offers no bulk file and no working or
permitted API. Not scraped. Not ingested.**

## 3. What this costs, exactly

`../raw/products-mhra-sitemap.xml` (HTTP 200, 4,973,488 bytes, `lastmod` 2026-05-20 on every entry)
is kept as the measurement of the forgone scope and is joined to nothing. It lists 25,414 URLs:
21,589 `/product` pages, 3,769 `/substance` pages, 33 substance-index pages, 18 medicine-levels-in-
pregnancy pages and 5 site pages. Those product pages are where SmPC section 4.5 (interactions) and
section 5.1 (pharmacodynamic properties) would have come from.

The three fields this source was to supply — `regulatory.UK`, `smpcInteractions`,
`smpcPharmacodynamics` — are therefore not populated by this run from either site. Per the Phase 2
brief for source 14, UK status stays "UK register not cleared for this run" on every page rather
than being dishonestly filled from a source that has not licensed it.
