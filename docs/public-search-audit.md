# Public search audit

`npm run audit:search` audits the server-rendered output of a running RNAWiki origin. It performs
read-only HTTP requests and does not import the application, connect to PostgreSQL or require a
database during a Railway build.

The default origin is deliberately local:

```bash
npm run dev
npm run audit:search
```

Pass a deployment explicitly after it is running:

```bash
npm run audit:search -- --origin https://rnawiki.com
```

The crawler starts with `/` and every URL in `/sitemap.xml`, then follows same-origin public links.
It reports duplicate titles and descriptions, heading and canonical failures, redirecting
canonicals, sitemap/indexability disagreements, broken internal links, invalid JSON-LD, unsafe
search metadata, and evidence pages without visible sources or review status. Missing provenance or
review status is an error on an indexable evidence page and a warning on a `noindex` evidence page.
Canonical links must use the exact audited origin. A different host is reported as an error and is
never fetched or silently substituted with a local URL. Canonicals containing a fragment are also
errors; the canonical must identify the whole page.

The audit also reads `/robots.txt`. For a non-loopback origin, an unavailable file, a missing
canonical `Sitemap:` directive, or an effective root-crawl block in the wildcard, Googlebot,
Bingbot, or `OAI-SearchBot` group is an error. Equally specific `Allow` rules take precedence over
`Disallow` rules. The same robots findings are warnings on `localhost`, `*.localhost`, `127.0.0.0/8` and
`::1`, where a development environment may intentionally block crawlers. Other page, canonical and
sitemap findings remain errors in local audits.

The command exits `1` when it finds errors, `0` when it finds only warnings or no findings, and `2`
for invalid command-line arguments. Use `--json` for machine-readable CI output. A crawl-limit error
means the result is incomplete; raise the bounded limit rather than treating the partial scan as
clean:

```bash
npm run audit:search -- --origin https://rnawiki.com --max-urls 2000 --json
```

The audit excludes `/_next/` assets and `/api/` routes. It sends no application cookies, does not
submit forms and does not infer medical facts. External links and external source availability are
outside this route/search audit's scope.

## Reachability mode: which canonical dossiers no link reaches

`--orphan-audit` replaces the page audit with one question: can a crawler arrive at every canonical
dossier by following links? It starts at `/` and `/browse`, follows only those two hubs and their
pagination up to `--max-depth` hops (default 6, bounded by `--max-urls`), and records every `/d/`
link it sees. Dossier URLs are recorded from the link and not fetched: the question is whether a
crawler can arrive, not what the page then says.

```bash
npm run audit:search -- --origin https://rnawiki.com --orphan-audit --max-urls 2000
```

The report is written to `docs/audits/discovery/orphan-audit.json` (change it with `--out`) and
names two lists:

- `orphanSlugs` — in the sitemap, but no link path reached them inside the bound.
- `reachableSlugsMissingFromSitemap` — linked from a public page but absent from the sitemap.

A slug is an orphan only for the crawl bound that was used. When `truncated` is true the crawl hit
`--max-urls` before the queue emptied, and the orphan list is incomplete; raise the bound rather
than reading the partial scan as clean. The command exits `1` when it finds orphans or a truncated
crawl, `0` when the crawl completed with none, and `2` for invalid arguments.
