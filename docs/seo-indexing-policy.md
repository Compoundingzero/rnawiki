# Search indexing and crawler policy

Last reviewed: 2026-08-26

RNAWiki treats discovery as a publication decision, not as a side effect of a row existing in the
database. Search engines and answer engines should discover a smaller set of trustworthy pages
rather than thousands of identity-only records, work queues, histories or URL permutations.

## Canonical discovery surfaces

The XML sitemap contains only:

- `/`
- `/browse`
- `/how-it-works`
- `/editorial-policy`
- one `/d/{canonicalSlug}` URL for each medicine with either an eligible current programme
  publication or an eligible provenance-bound flagship compatibility record
- one `/u/{handle}` URL for each contributor with at least one accepted contribution

It intentionally excludes review queues, revision/conclusion histories, query-string variants,
programme IDs, aliases and records without an eligible evidence binding. A medicine with several
eligible programmes appears once; the most recent real `programme_current_publications.published_at`
timestamp supplies its `lastmod`. An eligible legacy flagship uses its stored public edit or audit
date. Ingest and seed `drugs.updated_at` values are not public-content dates and must not be used.

Contributor-profile `lastmod` is the latest public `ACCEPTED_FOR_IMPLEMENTATION` resolution shown
by the profile. Account creation, login and private credential updates cannot change it.

The current public corpus is below the XML sitemap protocol limit of 50,000 URLs, so one
`/sitemap.xml` is sufficient. If the eligible corpus approaches that limit, shard the eligible
projection—not the full identity table—and advertise every shard from `robots.txt`.

## Medicine eligibility

`lib/seo/indexability.ts` is the shared pure, fail-closed policy. Every sitemap candidate must have
a normalized canonical slug that is not retained as an old/merged redirect source. An explicit
identity dispute would also fail closed, but it must come from a dedicated identity signal.
`drugs.has_discrepancy` is not that signal: the curated corpus uses it for documented scientific,
regulatory, and source-record disagreements. Those disagreements are part of the evidence surface
bound by the reviewed answer fingerprint and must not be silently misclassified as identity errors.

The primary publication path then requires:

1. the authoritative current programme publication pointer;
2. a verdict revision whose status is `PUBLISHED`, with valid review and publication timestamps;
3. non-empty public label, plain mechanism, best-supported finding and main limitation;
4. at least one signed source-metadata snapshot;
5. at least two distinct independent reviews; and
6. a `current` aggregate across every source-monitoring row for the selected programme.

`PUBLISHED` is the resolved workflow state: it proves either two reviewer approvals or an approving
adjudication after two reviewers disagreed. Requiring two `APPROVE` rows here would wrongly exclude
the valid adjudicated-publication path. The server counts distinct independent reviewer accounts
before building the public dossier model; only the numeric count crosses that boundary, so duplicate
review rows cannot satisfy the gate and account identifiers are not exposed.

Freshness uses the same precedence as the visible dossier: `NEW_EVIDENCE` or
`REVIEW_IN_PROGRESS` is `review_required`; otherwise any stale/failing row or an overdue stored
`CURRENT` row is `stale`; a non-empty all-`CURRENT` set is `current`; everything else is `unknown`.
Zero monitoring rows are explicitly `unknown`, not current, and therefore fail indexing closed.
The evaluation time affects eligibility but never becomes sitemap `lastmod`; only the real
publication event supplies that date.

While normalized publications are rolled out, a separate compatibility path admits only a legacy
record that the canonical route actually renders and that satisfies every one of these checks:

1. `dossierDepth` is exactly `flagship`;
2. the visible authored ten-second answer still carries the approved
   `legacy-ten-second-answer/v2` evidence fingerprint;
3. the bound use, strongest finding and main limitation are all substantive;
4. at least one exact stored audit source or source-provenance label exists; and
5. a valid stored public edit or audit date exists.

The fingerprint binds the slug, every authored word and the complete identity/use/evidence/source
surface; changing any of them removes the binding. A normalized programme on the canonical route
always takes precedence, including when that programme is incomplete or temporarily noindexed.
There is no fallback from a failed current programme decision to legacy content. The sitemap's
full-JSONB compatibility query is constrained at SQL level to `flagship`, so the 9,000+ stub and
curated imports are not loaded and cannot enter through this path.

Excluded pages remain followable. That lets crawlers see page-level `noindex` and lets their link
graphs reach a canonical reviewed page without indexing the excluded surface itself.

Stewards and administrators can inspect the same shared projection at
`/review-queue/search-indexing`. The noindexed diagnostic lists every failed mechanical check, not
only the first one used as the robots decision. Its messages report workflow/provenance state and
do not infer scientific quality or propose medical copy.

## IndexNow publication notifications

IndexNow is disabled by default. It runs only when the canonical-production deployment guard passes,
`INDEXNOW_ENABLED=true`, and a valid `INDEXNOW_KEY` is configured. The public ownership key is
served at `/indexnow-key.txt`; an optional `INDEXNOW_KEY_LOCATION` must remain a same-origin `.txt`
URL.

After a successful non-idempotent programme publication commits, the route schedules work with
Next.js `after()`. That work re-queries `loadMedicinePublicationIndexabilityReports`; it submits only
when the published programme is the eligible default for its medicine. The submitted URL is exactly
`/d/{canonicalSlug}`. Alias, query, programme-state and history URLs cannot enter this path.

Requests contain at most 10,000 validated, deduplicated same-origin HTTPS URLs, use a bounded
timeout, and log status/counts without logging the key. Network, timeout and eligibility-query
failures never alter the publication response. `notifyExplicitIndexNowChange` is available for a
future verified redirect/removal/deletion transaction, but no speculative lifecycle hook exists.

## Browse URL policy

Only the unfiltered first page at `/browse` is indexable. Any valid filter, pagination parameter
(including explicit `?page=1`) or combination is `noindex,follow` and canonicalizes to `/browse`.

The browse route returns 404 for:

- unknown parameter names;
- duplicate parameter names;
- empty or unknown filter values;
- invalid page values;
- pages past the final result page; and
- a valid filter combination with no results.

This prevents silent parameter dropping from turning arbitrary query strings into duplicate 200
responses.

## Crawler deployment guard

Non-production deployments serve `Disallow: /` and advertise no sitemap. Public crawl rules are
enabled only when all of the following are true:

- `NODE_ENV=production`;
- `SITE_URL` is explicitly `https://rnawiki.com` (the equivalent root-slash form is accepted), with
  no credentials, port, non-root path, query or fragment; and
- `SEO_DEPLOYMENT_ENV` (preferred), `RAILWAY_ENVIRONMENT_NAME` or `VERCEL_ENV` explicitly resolves
  to `production`.

Set `SEO_DEPLOYMENT_ENV=production` on the canonical deployment. Preview builds may set a different
value or leave the marker absent; either case fails closed.

Canonical production root metadata also emits Googlebot `max-image-preview:large`. Preview and
staging metadata instead sets Googlebot `noindex,nofollow,noimageindex`; it never inherits the
production image-preview permission.

On canonical production, the wildcard group, `OAI-SearchBot` and `GPTBot` can crawl public pages;
`/api/` and `/healthz` are excluded. `OAI-SearchBot` is explicitly allowed for ChatGPT search
discovery. GPTBot is also currently allowed as a separate, intentional policy decision; it is not
required for ChatGPT search and can be changed independently. OpenAI documents those distinct
purposes in its [crawler documentation](https://platform.openai.com/docs/bots). Re-review the
GPTBot decision whenever the site's data-licensing policy changes.

## Regression checks

Run:

```sh
npm run check:seo
```

The suite covers the pure medicine policy, strict browse metadata behavior, non-production crawl
blocking and explicit canonical-production bot rules.
