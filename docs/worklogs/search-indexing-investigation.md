# Why almost nothing was indexed, and what changed

Investigated 2026-09-02, the day after the corpus expanded from about 170 indexable URLs to 9,863.
The question was why Google Search Console showed a fraction of the dossiers as indexed.

Eight independent audits ran against the live origin and this repository, and every finding one of
them raised was then handed to a separate reviewer whose brief was to refute it. Twenty findings
survived. Nothing below is a statement about what Google has crawled or indexed: this machine can
only observe what rnawiki.com served.

## The short answer

There was no blocker. Nothing in `robots.txt`, no `noindex` on any dossier, and no `X-Robots-Tag`
prevented Google from indexing any page it was told about. Three separate things were true instead.

1. **The Search Console export describes a corpus that no longer exists.** Its 169 URLs are four
   static routes plus 165 dossiers, the sitemap as it stood between 2026-08-26 and 2026-09-01. It
   was last updated on 2026-08-28, five days before the 9,852 dossiers were published, so it says
   nothing at all about them.
2. **Every internal link to nearly the whole corpus ran through pages that said "do not index
   me".** This was the real structural fault, and it is fixed below.
3. **The pages themselves give a search engine very little to choose.** This is a product question,
   not a technical one, and it is the honest limit on what any amount of tuning can achieve.

## What the Search Console numbers actually mean

The four exported files hold counts and dates. None of them contains a single URL, so the question
"which dossiers does Google see as indexed" cannot be answered from this export at all. Answering it
needs either the Search Console interface, where an issue's example URLs can be inspected one at a
time, or the URL Inspection API, which requires an OAuth client and is limited to 2,000 queries per
property per day. Neither is set up; the repository holds no Search Console integration.

The history in the export was traced to a real change in this repository. On 2026-08-19 deployment
`80ecb69` made `app/sitemap.ts` export `generateSitemaps`, which moves the file to `/sitemap/0.xml`
and leaves `/sitemap.xml`, the URL submitted to Search Console, unserved. The same deployment
replaced the whole `/r/<slug>` product with `/d/<slug>` dossiers. The flat `/sitemap.xml` did not
return until deployment `73fa174` on 2026-08-26. So for 6.7 days the submitted sitemap was missing
while every record URL changed address underneath it. That is what collapsed the reported population
from 568 URLs to 169 and the indexed count from 114 to 1.

`Discovered - currently not indexed` (163 pages) means Google knows the URL and has not fetched it.
`Crawled - currently not indexed` (5 pages) means Google fetched it and chose not to index it. The
second is a judgement about the page; the first is not.

## The structural fault, and the fix

`/browse` lists sixty records per page, so the corpus fills 165 pages. Only the first was
indexable. Pages two onward were `noindex` and additionally named `/browse` as their canonical
address, which tells a crawler to fold them into page one.

A dossier's browse entry is currently its only internal link. Dossiers do not link to each other,
and the home page links to four. So the union of dossiers linked from any indexable page was exactly
sixty. The other **9,792 of 9,852 records had no link to them from any page that Google was allowed
to keep**, and were reachable through the sitemap alone. A page held under `noindex` long-term is
eventually crawled less and its links stop counting, so the arrangement was also getting worse.

What changed:

- Every page of the unfiltered record list is now indexable and points at itself. Filter
  combinations stay out of the index and now also point at themselves, because telling a crawler not
  to index a page while naming a different address gives two conflicting instructions about one URL.
- `/browse?page=1` still resolves to `/browse` through its canonical link, which is the correct
  signal for a duplicate address rather than a `noindex`.
- The 164 later pages joined the sitemap, taking it to 10,027 URLs.
- Each paginated page now carries its own heading, so the 164 new URLs are distinguishable rather
  than 164 copies of one list.

## Titles

The dossier title spent 48 of its 64 characters on the fixed phrase
`: Evidence, Trial Results & What Remains Unknown`, leaving 16 characters for the name. Measured
across the 9,852 canonical records, that cut 4,180 names mid-word and left **1,982 records sharing a
byte-identical title** with another record, in groups of up to 62. The phrase also promised trial
results on the thousands of records where the registry search found none.

The name now takes the budget first and a short suffix gives way when the name is long. Names too
long even for that keep both ends and drop the middle, because many names in this corpus differ only
in their closing words: `…Type 19a Capsular Polysaccharide Antigen` against `…Type 19a Capsular
Polysaccharide Diphtheria Crm197 Protein Conjugate Antigen`. Measured on the same 9,852 records:

| Titles                  | Before | After |
| ----------------------- | -----: | ----: |
| Unique                  |  8,516 | 9,852 |
| Records sharing a title |  1,982 |     0 |
| Names cut mid-word      |  4,180 |    63 |

## A second crawlable copy of the site

`doswiki-production.up.railway.app` serves the whole site from the same container, bypassing
Cloudflare, and served `Allow: /` with `index, follow` on every page. Every page there names
`https://rnawiki.com` as its canonical address, so it was not creating duplicate entries, but a
crawlable duplicate still spends crawl capacity.

The deployment guard reads environment variables only, so it cannot tell one hostname from another.
`app/robots.ts` now compares the request's own `Host` header as well and serves `Disallow: /` to any
other hostname, failing closed on an absent or malformed host. **Removing the generated service
domain in the Railway dashboard is still worth doing** and is the owner's action; the code change
stops well-behaved crawlers, not direct access.

## What was not fixed, and why

**The pages are near-identical scaffolding.** Across 164 fully fetched pages spanning every entity
class, the site's own counter never rose above "7 of 19 answered", and 124 of them read "3 of 19" or
"4 of 19". Among the thinnest half of the corpus, a median 83.7% of one page's words appear in the
same order on another page, and only about 9% of the visible words are specific to the record. This
is the profile that produces `Crawled - currently not indexed` at scale.

No technical change fixes this, and this project forbids inventing medical content to fill it. The
records say what is recorded and what is not, which is the correct behaviour. The consequence is
that a large part of the corpus should be expected to stay unindexed, and that is a decision about
what RNAWiki publishes rather than a defect to repair.

**Meta descriptions are one template with 22 possible bodies.** Real, and measured at 99.2% of a
250-page sample. Left alone deliberately: a description affects the snippet Google displays rather
than whether a page is selected, and widening the input type that builds it would weaken a safety
property that currently makes it impossible for source prose to reach a search snippet.

**Every HTML response is uncacheable.** Dossiers return `private, no-cache, no-store` with no
`ETag` and no `Last-Modified`, so Cloudflare caches nothing and every crawl reaches the container
and its database, which also runs a view-count `UPDATE` and repeats four database reads per request.
Measured time to first byte was 0.655 s at the median and 0.998 s at worst over 45 pages, with no
429 or 5xx, so this did not ration crawling at 169 URLs. At 9,863 URLs it is the most likely next
constraint. It is not a small change: the route is dynamic because it reads the session cookie and
bakes viewer state into the HTML, so caching it at the edge without splitting the anonymous render
first would risk serving one signed-in reviewer's page to someone else. That is a deliberate piece
of work, not a header tweak.

**`Disallow: /api/`** keeps the machine-readable representation away from the same answer engines
`robots.txt` explicitly welcomes. Worth a decision; unchanged here.

## What to expect

The sitemap-scoped population in Search Console should climb from 169 toward 10,027 over days to
weeks as Google refetches the sitemap. The indexed count should be expected to lag it badly and to
remain a small minority of the corpus for months. None of that is a promise, and the dominant
variable is not under this repository's control.

Three things would settle what is actually happening, and all three need the owner's Search Console
account: the Crawl Stats report under Settings, which gives real crawl request volume and average
response size; the example URLs behind each issue; and the URL Inspection tool on one thin record
and one publication-backed record.
