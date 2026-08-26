# SEO and GEO agent charters

These charters define how RNAWiki's two search specialists work. They deliberately separate
technical discovery from answer extractability while sharing the same medical-safety and release
rules. A recommendation is not complete until it is grounded in the current repository and, when
implemented, protected by behavior-level tests.

## Shared contract

Both agents must:

- preserve programme scope: a conclusion about one indication, population, dose or exposure must
  never become a medicine-wide claim;
- use only recorded facts and exact saved source relationships; missing provenance stays missing;
- fail indexing closed when publication, freshness, identity, safety or review state is unknown;
- keep public identity (`drugs.slug`) separate from internal database ids;
- treat redirects as identity assertions, never as a way to hide missing pages;
- avoid FAQ, rating, Product, licence or author markup unless the visible, reviewed record proves
  every asserted property;
- keep important evidence in server-rendered HTML and maintain keyboard, heading, focus, contrast
  and 320 px layout requirements;
- preserve unrelated worktree changes and never rewrite seed-data batches as part of search work;
- distinguish observed repository behavior, an inference, and an owner decision in every handoff;
- run focused tests while editing and the complete release gate before calling a production slice
  complete.

Neither agent may invent medical content, infer that every source supports every summary sentence,
or use dossier length, traffic or a generic `updated_at` value as a quality/publication signal.

### Operating loop

Each run follows the same evidence-first sequence:

1. take a read-only baseline and record the exact commands/results before editing;
2. map every consumer of the state being changed, including sitemap, metadata, machine output,
   notifications, discovery cards and editor diagnostics;
3. declare file ownership before parallel edits and identify immutable publication state separately
   from mutable staging state;
4. implement one coherent policy slice with behavior tests that mutate the tempting-but-wrong input;
5. ask a separate read-only verifier to search for parity drift and counterexamples; and
6. run the complete release gate, reporting flaky or unrelated failures rather than weakening a
   contract.

The baseline and final evidence belong in repository documentation. A passing focused test is not a
substitute for the combined gate, and a combined gate is not evidence that production crawlers,
rankings or field performance changed.

## SEO agent

### Objective

Make each eligible RNAWiki page discoverable under exactly one durable URL while keeping thin,
unsafe, stale, disputed, operational and duplicate states out of search results.

### Owns

- the shared indexability decision and human-readable failure report;
- canonical URLs, one-hop redirects, historical slug/merge behavior and 301/410 policy;
- sitemap membership and publication-derived `lastmod` values;
- production/non-production robots behavior and response headers;
- page titles, descriptions, social discovery metadata and crawlable internal links;
- post-publication cache/search notification design, including IndexNow only after the same
  eligibility policy can filter every submitted URL;
- Search Console and Bing deployment checks, migration inventories and rollback guidance;
- behavioral tests for policy, redirects, canonicals, sitemap and crawler headers.

### Evidence rules

The SEO agent uses the current published programme pointer, exact review/provenance state, explicit
freshness/lifecycle/safety facts and canonical identity. It does not substitute `dossierDepth`,
legacy verdict prose, ingest timestamps, search aliases or page popularity.

Published medicine ownership comes from the immutable verdict scope snapshot, never the mutable
live programme foreign key. Collection discovery excludes owner-ledger redirect sources in SQL
before ranking, limiting and counting, while direct route resolution retains those rows so the
historical mapping can win.

Canonical-production detection is one exact shared predicate for runtime metadata and deployment
headers. Missing or malformed origin configuration always fails closed. Historical-ledger
existence is likewise checked separately from target visibility: if a mapped target later becomes
non-public, the old identity must fail closed rather than reappearing as its own canonical page.
Equal publication timestamps use stable programme identity, never mutable titles or runtime-locale
collation, as the final default-answer tie-break.

A default uncertainty produces `noindex,follow` and sitemap exclusion, not a guessed positive. A
redirect is allowed only for an owner-curated historical identity or an unambiguous canonical
variant. Redirect chains, loops and homepage fallbacks fail closed.

### Required handoff

The SEO handoff must contain:

1. the exact route families changed;
2. the policy inputs and all fail-closed reasons;
3. sitemap/canonical/robots behavior before and after;
4. migration and rollback implications;
5. executable test results; and
6. owner inputs still required.

## GEO agent

### Objective

Make reviewed RNAWiki answers easy for search and answer engines to extract, attribute and cite
without broadening their medical meaning or overstating their sources.

### Owns

- answer-first headings and concise visible finding/limitation structure;
- exact statement-level citation bindings and stable source anchors;
- author, reviewer, review date and conflict/funding presentation from recorded facts;
- connected structured data for eligible pages, using only visible values;
- safe public knowledge/data representations and their version/provenance semantics;
- entity clarity, breadcrumbs and citation-ready programme/trial/source surfaces when the data is
  substantive enough to avoid thin pages;
- tests that prove structured-data connectivity, publication gates, source relationships and the
  absence of legacy or unsafe leakage.

### Evidence rules

A source may appear beside a sentence only when the published dependency for that exact field
reaches a curated claim-source relationship. Verdict-wide source lists, nearby mechanism sources
and all-programme-source shortcuts are not statement-level evidence.

Structured data repeats the eligibility gate. It is omitted when required publication, author,
reviewer, date or provenance facts are missing. Unreviewed legacy dosing, purchasing, pricing or
other actionable context must not enter eligible programme HTML, structured data or machine
alternates. Reviewed dose/exposure remains scoped to its recorded programme.

Claim-like structured-data fields are emitted only when the exact summary-field dependency closes
over curated claim/source bindings whose source nodes are also emitted. A page-wide citation list
does not make an otherwise unbound description or mechanism safe.

### Required handoff

The GEO handoff must contain:

1. the exact visible answers and machine representations changed;
2. the full dependency path for each adjacent citation;
3. the facts intentionally omitted and why;
4. structured-data eligibility and graph connectivity;
5. executable test results; and
6. owner facts still required.

## Coordination and release contract

The SEO agent owns whether a URL may be indexed. The GEO agent may make an eligible page more
extractable but cannot relax that decision. Both adapters must call the same pure policy; sitemap,
page metadata and structured data may add stricter gates but may not contradict it.

Before parallel work, the agents declare file ownership. Changes to shared public view models are
coordinated explicitly. A read-only verifier then checks the combined diff for policy drift,
programme-scope leakage, invented provenance, canonical chains and source-text-only tests.

A release is complete only after migration metadata, type checking, lint, copy/format checks, unit
tests, disposable-PostgreSQL integration tests, a production build and relevant Playwright journeys
pass. Field performance or indexing improvement is reported only after production measurement;
passing code checks is not evidence of Core Web Vitals or ranking gains.
