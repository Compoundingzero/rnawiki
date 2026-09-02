# Search indexing and crawler policy

Last reviewed: 2026-09-02

RNAWiki treats discovery as a publication decision, not as a side effect of a row existing in the
database. Search engines and answer engines should discover a smaller set of trustworthy pages
rather than thousands of identity-only records, work queues, histories or URL permutations.

## Canonical discovery surfaces

The XML sitemap contains only:

- `/`
- `/browse`
- `/how-it-works`
- `/editorial-policy`
- one `/d/{canonicalSlug}` URL for each medicine admitted by any of the three eligibility paths:
  an eligible current programme publication, an eligible provenance-bound flagship compatibility
  record, or a resolved canonical record with a stored completeness assessment
- one `/u/{handle}` URL for each contributor with at least one accepted contribution

It intentionally excludes review queues, revision/conclusion histories, query-string variants,
programme IDs, aliases, duplicate and redirected identities, and placeholder slugs. A medicine with
several eligible programmes appears once; the most recent real
`programme_current_publications.published_at` timestamp supplies its `lastmod`. An eligible legacy
flagship uses its stored public edit or audit date. A canonical record uses
`dossier_completion_assessments.content_changed_at`, which moves only when the assessed inputs move.
Ingest and seed `drugs.updated_at` values are not public-content dates and must not be used.

`loadMedicineSitemapIndexabilityReports` merges the three report sets into exactly one report per
medicine, with precedence publication > legacy flagship > canonical record, so no medicine can
appear twice. All three sets are built by the same pure policy from the same canonical-record
projection, so the winning report cannot disagree with a losing one about whether a URL may be
indexed. `app/sitemap.ts` logs the emitted count on every request as `[seo.sitemap_size]`.

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

### Third path: the canonical record

When neither of the paths above passes, a medicine is indexable through its canonical record. This
path says the URL is the one public address for a resolved identity, and that every section which
applies to that identity carries a stated, dated state. It asserts nothing about the medicine. It
requires all of:

1. `inventory_resolutions.resolution_status` is exactly `CANONICAL_ENTITY`;
2. the row is not retained as an old/merged redirect source;
3. the slug is normalized and is not one of the placeholder identities below;
4. a `dossier_completion_assessments` row exists with at least one applicable section, whether its
   status is `COMPLETE` or `INCOMPLETE`; and
5. `content_changed_at` is a valid date, which becomes the sitemap `lastmod`.

`INCOMPLETE` is admitted deliberately. A section that has not reached a terminal state is shown on
the page with what still has to happen, so the reader sees the same open question the resolver did.
What is refused is a record with no assessment at all: nothing is known about what its sections say,
so nothing can be published about it.

Duplicate, alias, historical-redirect, permanently-gone and manual-identity-review rows never index
through this path. The policy reads only scalar columns — resolution status, assessment status,
content date and two counts. Section prose, source refs and resolver evidence are JSONB and are
never loaded by a discovery surface, so a search decision cannot be made from what a section says.

The meta description for a record admitted this way is built from the medicine name, the entity
class in ordinary words, the recorded/applicable section counts, whether the ClinicalTrials.gov
snapshot search matched anything, and whether a reviewed conclusion exists. A state such as
"searched; no qualifying record found" describes the sources RNAWiki read on a stated date, so the
description must never phrase it as a fact about the medicine.

### Placeholder identities return 410

Some rows in `drugs` name a spreadsheet artifact rather than a substance; a CSV header line once
reached production as a medicine. The inventory resolver classifies these `INVALID_IDENTITY_GONE`
(in the current corpus, `tbd` and `header`). `middleware.ts` answers `/d/{slug}` and any subpath for
every slug in `PUBLIC_PLACEHOLDER_MEDICINE_SLUGS` with a real HTTP 410, `text/plain`, an
`X-Robots-Tag: noindex` header and a one-day cache. A 404 would invite a crawler to return; 410
says the URL is permanently without a subject. The list lives in `lib/public-data-integrity.ts`,
which imports nothing and uses no Node API, so edge middleware can read it; a unit test keeps that
property from being lost.

### Legacy flagship compatibility path

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
There is no fallback from a failed current programme decision to legacy content: a record whose
publication fails can fall through only to the canonical-record path, which publishes no answer. The sitemap's
full-JSONB compatibility query is constrained at SQL level to `flagship`, so the 9,000+ stub and
curated imports are not loaded and cannot enter through this path.

Excluded pages remain followable. That lets crawlers see page-level `noindex` and lets their link
graphs reach a canonical reviewed page without indexing the excluded surface itself.

Stewards and administrators can inspect the same shared projection at
`/review-queue/search-indexing`, which now also names the path that admitted each page. The
noindexed diagnostic lists every failed mechanical check, not only the first one used as the robots
decision. A page admitted by one path reports no issues for the paths it did not use: an unmet
publication check is not an exclusion once another path has let the URL in. Its messages report workflow/provenance state and
do not infer scientific quality or propose medical copy.

`/review-queue/completion` is a second steward-only surface with the same `noindex,nofollow`
treatment. It lists incomplete records, records with a suggested human read, and identity
warnings, and records append-only review decisions; it never changes an assessment or a public
page.

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

Wiring `notifyExplicitIndexNowChange` into the legacy request handlers (`lib/seo/legacy-response.ts`
serving `/c/{slug}`, `/t/compound/{slug}` and `/r/{slug}`) was evaluated on 2026-08-27 and rejected.
Three recorded facts decide it:

1. The URL a redirect/410 notification must announce is the legacy URL itself, and the shared
   eligibility policy has no representation of legacy-family URLs — it evaluates only canonical
   `/d/{slug}` candidates, and a redirect source is exactly the state it fails closed. No
   fail-closed filter therefore exists for the URL that would be submitted, which is the
   precondition for any IndexNow caller.
2. The 410 branch's input is caller-controlled: any request to `/r/{anything}` produces a 410, so a
   notifier there would submit unbounded, undeduplicated, attacker-mintable URL sets under the
   site's IndexNow key. Same-origin URL syntax validation is not an eligibility decision.
3. A request proves nothing changed. The correct integration point is the transaction that writes a
   `medicine_slug_redirects` ledger row, and no application code path writes that table — the
   ledger is owner-curated. When such a verified merge/rename/removal transaction exists, it can
   call `notifyExplicitIndexNowChange` with the exact old URL it just retired, after the same
   deployment guard, and only then.

## Discovery states

Discovery has five recorded states. Only the first can be decided from RNAWiki's own responses.

| State                         | What it means                                                                                | Who can record it                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `DISCOVERY_READY`             | The origin returned 200 with no `noindex`, a self-referencing canonical and structured data. | `scripts/discovery/monitor-discovery.ts`               |
| `SUBMITTED_FOR_DISCOVERY`     | The URL was placed in a sitemap or an IndexNow request on a recorded date.                   | The sitemap and `scripts/discovery/submit-indexnow.ts` |
| `CRAWLED_OBSERVED`            | A crawler fetch of the URL appears in a server log or a search-console report.               | An external report, with the date it was seen          |
| `INDEXED_OBSERVED`            | An external tool reported the URL as indexed.                                                | An external report, naming the tool                    |
| `CITED_OR_RETRIEVED_OBSERVED` | A named answer engine or citing page retrieved or cited the URL.                             | An external report, with the date it was seen          |

A sitemap entry or an IndexNow submission is a request, never proof of indexing. Nothing in this
repository may record `INDEXED_OBSERVED` from a self-fetch: it requires a report from an outside
tool, and `classifyDiscoveryObservation` deliberately has no return value that could assert it.
The same rule applies to `CRAWLED_OBSERVED` and `CITED_OR_RETRIEVED_OBSERVED`.

### Discovery commands

```sh
npx tsx scripts/discovery/submit-indexnow.ts                  # dry run; prints batch counts
npx tsx scripts/discovery/submit-indexnow.ts --submit         # needs the production guard and key
npx tsx scripts/discovery/monitor-discovery.ts --origin https://rnawiki.com --resume
npm run audit:search -- --origin https://rnawiki.com --orphan-audit
```

`submit-indexnow.ts` reads the same shared eligibility projection the sitemap reads, so it can never
announce a URL the sitemap withholds. It is a dry run unless `--submit` is passed, and `--submit`
still refuses unless `indexNowKeyFile` reports a configured key on a canonical-production deployment
and the requested origin is the configured one. Batching is the shared 10,000-URL batching in
`lib/seo/indexnow.ts`. Every run appends one line to
`docs/audits/discovery/indexnow-submissions.ndjson` with the timestamp, mode, counts, batch sizes
and HTTP statuses. The key is never written to the ledger.

`monitor-discovery.ts` reads the canonical dossier URLs from the origin's sitemap (or from a saved
sitemap file with `--input`), fetches each `/d/{slug}` and its `/api/drugs/{slug}` record with four
slots and a polite pause, and writes a resumable NDJSON checkpoint plus a summary JSON under
`docs/audits/discovery/`. `--resume` skips URLs already in the checkpoint.

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
