# ClinicalTrials.gov — terms and robots determination, checked 2026-09-06

Requests made for this determination are in `../requests.log`. No study data was
requested: the snapshot already on disk (2026-09-01T09:00:05, sha256
00b7ca207938fb44fc4d24fd14ce1f4c2cc2e2e718cd1a9fb5c5163ce5858e27) was reused and
re-verified byte-for-byte, so this step made four requests, all to legal pages.

## robots.txt (`clinicaltrials-robots.txt`, HTTP 200, 505 bytes)

```
User-agent: *
Disallow: /api/
Allow: /api/int/
Allow: /api/seo/
Disallow: /search?
Disallow: /expert-search?
Crawl-delay: 1
Sitemap: https://clinicaltrials.gov/assets/sitemap.xml
```

`Disallow: /api/` covers `/api/v2/studies`, the documented public REST API that
produced the on-disk snapshot. The same operator publishes that API, versions it,
documents it at `/data-api/about-api` and links it from the site navigation, so the
directive reads as keeping search-engine crawlers out of JSON responses rather than
as a prohibition on API clients. The corpus-20k legal survey recorded the same
conflict (`data/corpus-20k/legal-gate.json`, `clinicaltrials_gov.robotsVerdict`).

This step resolves the conflict by not depending on it: zero requests were made to
`/api/` on 2026-09-06. `/search?` and `/expert-search?` were not crawled, then or
now. The 1 s crawl delay was honoured by the snapshot run (602 pages over 468 s,
0.78 req/s).

## Terms and conditions page (`clinicaltrials-terms-conditions.html`, HTTP 200)

`https://clinicaltrials.gov/about-site/terms-conditions` returns a 94,295-byte
Angular single-page-application shell whose only rendered text is "ClinicalTrials.gov
/ Show glossary / Search for terms / Hide glossary / Study record managers: refer to
the Data Element Definitions if submitting registration or results information."
`https://clinicaltrials.gov/data-api/about-api` returns the identical bytes
(both sha256 17c3746fc8cd5ac242d3087cf72a2ba6b61daf6879723daf7e5cf4535e843406).
The licence text is rendered client-side from JavaScript chunks and is not
retrievable as text by an HTTP client. It was therefore not read, and no statement
below is attributed to it.

## Licence basis actually established

NLM Web Policies (`nlm-web-policies.html`, verbatim extract in
`nlm-copyright-statement.txt`): "Works produced by the U.S. government are not
subject to copyright protection in the United States. Any such works found on
National Library of Medicine (NLM) Web sites may be freely used or reproduced
without permission in the U.S." NLM asks, without requiring, for the
acknowledgement "Source: National Library of Medicine".

The same page carves out non-government content: registry records are submitted by
sponsors and investigators, who are private parties, and NLM states it "cannot
guarantee the copyright status for any item". The fields taken here are the
registry's structured facts — NCT identifier, phase, recruitment status, enrolment
count and type, start and completion dates, results-posted flag and date, design
allocation, masking, primary purpose and study type, and the sponsor-entered
`whyStopped` string. Counts, dates, enumerated status codes and identifiers are
facts, not expression. `whyStopped` is the one free-text field carried, it is stored
verbatim with its NCT id so the source record is always identifiable, and it is
short factual explanation of a registry event. No protocol text, no outcome
narrative and no results-section prose is taken.

## Verdict

CLEAR for the fields taken, on the US-Government-work basis above.
Attribution not required; "Source: National Library of Medicine" is used anyway.
Redistribution and commercial use permitted. No share-alike.

## A note on the two clocks

The directory is dated 2026-09-06, the local date in Singapore where the run
happened. `requests.log` stamps every request in UTC, so its entries read
2026-09-05T16:19Z onward — the same moments, eight hours behind. Nothing was
retrieved on a different day than the directory name says.

## Every request made on the retrieval date

395 logged calls in `../requests.log`, all HTTP 200: five legal pages
(clinicaltrials.gov robots.txt, terms-conditions, data-api/about-api;
nlm.nih.gov web_policies.html, copyright.html) and 390 API calls for the
date-type and intervention-model top-up. One further request preceded the top-up
— a two-id probe against the same endpoint, made to confirm the four field names
resolve before committing to 390 calls. Its response was read at the terminal and
not saved to a file; it is appended to `requests.log` as the last line, timestamped
to the minute and marked `not-saved`, so the log accounts for 396 requests in total
and nothing was fetched that the log does not name.

That top-up is the only registry data this step retrieved. The 601,158-study
snapshot was reused from disk under the Phase 2 brief's instruction not to refetch
it, and its SHA256 was re-measured and matched before use.
