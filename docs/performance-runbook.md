# Public-page performance runbook

Snapshot: 2026-08-25

This runbook defines how RNAWiki should measure and improve public-page performance without making
the production database available during a Railway build. It records targets, not measured passes.
RNAWiki currently has no production real-user monitoring dataset, so no Core Web Vitals claim is
justified yet.

## Field goals

Evaluate the 75th percentile separately for mobile and desktop over a rolling 28-day window:

| Metric                          |      Goal | Main RNAWiki risk                                                  |
| ------------------------------- | --------: | ------------------------------------------------------------------ |
| Largest Contentful Paint (LCP)  |  <= 2.5 s | Session-coupled server work and sequential dossier queries         |
| Interaction to Next Paint (INP) | <= 200 ms | Site-wide client shell, search, modals and the contribution editor |
| Cumulative Layout Shift (CLS)   |    <= 0.1 | Commentary hydration/refetch and expanding evidence regions        |

Track time to first byte, server database duration, response size, JavaScript transferred and error
rate beside those three field metrics. Lab scores are useful for regression debugging but do not
replace field data.

## Route cohorts

Measure at least these cohorts independently:

- home and unfiltered browse;
- an index-eligible reviewed dossier;
- an identified but unpublished/noindex dossier;
- a contributor profile;
- review queue and history pages; and
- mobile widths of 320 px and 375 px on a mid-tier device/network profile.

Do not average authenticated workflow pages into the public search-page cohort.

## Railway-safe rendering boundary

1. Keep database-backed public routes dynamic during the build. A build must not resolve or query
   `postgres.railway.internal`.
2. Preserve the direct answer, limitations, review state and sources in server HTML.
3. Split anonymous public evidence from account state before introducing persistent caching. A
   cache key must never contain a session cookie or viewer-specific note vote.
4. Cache only a purpose-built public projection keyed by canonical medicine slug, programme id,
   trial id or hub id.
5. Use explicit tags such as `medicine:{slug}`, `programme:{id}`, `trial:{id}`, `homepage`,
   `sitemap` and the relevant hub tag.
6. Revalidate after a committed publication, correction, canonical merge/retirement or accepted
   source refresh. Do not revalidate for views, logins, bookmarks or draft edits.
7. Schedule view-count and notification work after the response/transaction boundary; neither may
   delay the evidence response or change its cache key.

Before enabling a cache, add a test proving that an anonymous response contains no viewer fields and
that publishing a successor invalidates every affected public tag. Do not cache the current
personalised `getDrugBySlug` result.

## Measurement and diagnosis

Google Analytics is optional and consent-gated. It receives sanitized path-only page views, scrolls,
video engagement and downloads after a visitor opts in. Browser-history page views, site-search
events, form events, outbound-link events, advertising signals and advertising personalisation stay
disabled. URL query values and email-shaped values are also redacted in the stream configuration.
Never add medical searches, dossier text, email addresses, account ids or other sensitive values to
analytics events.

For a slow reviewed dossier, inspect in this order:

1. server timing and database query waves;
2. whether metadata or Open Graph generation repeated the full evidence assembly;
3. anonymous versus session-dependent work;
4. HTML and React Server Component payload size;
5. client JavaScript from global modals and the hidden contribution editor;
6. commentary hydration/refetch behavior; and
7. font, motion, image and disclosure layout behavior.

The current code-grounded risks and preserved strengths are recorded in
[`seo-geo-baseline.md`](./seo-geo-baseline.md).

## Release checklist

- Run type checking, lint, public-copy checks, formatting and all unit tests.
- Run integration and browser tests against a disposable local PostgreSQL database.
- Build with production settings while the private production database remains unavailable.
- Exercise one reviewed and one noindex dossier with JavaScript disabled; the evidence boundary must
  remain understandable.
- Check 320 px, 375 px, tablet and desktop for horizontal overflow and disclosure-induced shifts.
- Compare route payloads and lab traces with the previous release.
- After deployment, confirm the canonical response, source freshness and review history point to the
  same current revision before comparing field metrics.

Rollback or disable a new cache when it serves the wrong programme, leaks account state, keeps a
superseded conclusion public, or makes freshness/review history disagree. A faster incorrect medical
record is a release failure.
