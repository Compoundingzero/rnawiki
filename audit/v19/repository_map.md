# RNAwiki v1.9 · WAVE A — Repository map & live-route archaeology

**Roles:** Repository archaeologist + Live-site/crawl specialist
**Date measured:** 2026-08-11 · **Branch:** `refine/site-wide-2026-08` · **Working tree: clean** (`git status --short` → empty)
**Origins measured:** `http://localhost:8099` (this branch) and `https://rnawiki.com` (production)
**Mode:** READ-ONLY. No product file was created, edited or committed. Only the three files under
`audit/v19/` were written. `node build/parse.js` was **deliberately not run** — it rewrites `site/data.js`,
which is out of scope for this wave.

Every claim below is tagged:
`OBSERVED` (I ran the command) · `INFERRED` (derived from observed facts) · `PRODUCT DECISION` ·
`LEGAL-CLINICAL DEPENDENCY` · `COULD-NOT-CHECK`.
Where a claim is about **what a user sees**, the document is named (`hydrated` = headless Chrome,
`prerendered` = curl). The two-document rule is observed throughout.

---

## 0. The headline

**Production is running code from 2026-08-09. The 27 commits on this branch are unpublished, and
three of them are the fix for a live privacy/indexing defect that is on rnawiki.com right now.**

`OBSERVED` — `https://rnawiki.com/u/felix` returns **HTTP 200**, hydrates to the **complete home page**
(h1 `"Turned away, priced out, or told it was nothing."`, 1,229 words), and carries
`<meta name="robots" content="index,follow,max-image-preview:large">` with no `X-Robots-Tag`.
The same is true of `/pros`, `/pro`, `/s`, `/stewardship`, `/u/` and `/clinic`. `/progress` and `/admin`
are 200 + `index,follow` and **self-canonical**, so they have no canonical mitigation at all.
On this branch every one of those routes returns `noindex, nofollow` in both the header and the body
(`server.js:2944` `NOINDEX_ROUTES`, `server.js:3050-3067`).

Screenshots: `qa/out/w19/prod-u-felix.png`, `prod-progress.png`, `prod-admin.png`, `prod-home.png`.

---

## 1. Stack, package manager, dependency tree

`OBSERVED` — `package.json`, `package-lock.json`, `ls node_modules`.

| Item | Value |
|---|---|
| Framework | **None.** Vanilla JS, no bundler, no TypeScript, no Tailwind, no React. |
| Package manager | **npm** (`package-lock.json`, lockfileVersion present; no yarn.lock, no pnpm-lock) |
| Direct dependencies | **2** — `pg ^8.11.5`, `@resvg/resvg-js ^2.6.2` |
| `node_modules` entries | 94 |
| devDependencies | **none declared** — `puppeteer-core` is used by `scripts/smoke.mjs` and by the QA harness but is **not in `package.json`** |
| Node engine | `>=18` |
| Server | `node:http` directly. No express, no middleware stack. |

`OBSERVED` — the last row is a real gap: `scripts/smoke.mjs` (the only hydrated-DOM gate) imports
`puppeteer-core`, and `npm run smoke` is a declared script, yet nothing in `package.json` installs it.
A clean `npm ci` produces a repo where the site's own test command cannot run.

### Size of the load-bearing files (`wc -l` / `ls -la`, 2026-08-11)

| file | lines | bytes | note |
|---|---:|---:|---|
| `site/app.js` | **10,286** | 899,877 | one IIFE, the whole SPA |
| `server.js` | **3,157** | 240,098 | plain `node:http` |
| `site/styles.css` | 4,984 | 401,505 | |
| `build/prerender.js` | — | 415,173 | |
| `build/parse.js` | — | 272,618 | |
| `db.js` | 604 | 34,030 | idempotent DDL applied on boot |
| `studio-safety.js` | 337 | 19,968 | mirrors the build gates at SAVE time |
| `scripts/smoke.mjs` | 2,946 | — | hydrated-DOM gate |
| `site/data.js` | — | 11,874,630 | generated, **tracked in git** |

**Errata against the briefing documents I was given** (`OBSERVED`, correcting stale figures — quote
these, not the ones in the older files):

| Source | Claim | Measured 2026-08-11 |
|---|---|---|
| `AGENT_RULES.md:71` | `site/app.js` is 6,307 lines / 577 KB | **10,286 lines / 899,877 B** |
| `AGENT_RULES.md:71` | `server.js` is 2,025 lines | **3,157 lines** |
| `AGENT_RULES.md:71` | `styles.css` is 298 KB | **401,505 B** |
| repo `CLAUDE.md` | `app.js` ~6,600 lines, `server.js` ~1,800 lines | as above |
| task brief | "58 build checks" | **52 self-invoking `(function assertX(){…})()` gates** (22 in `parse.js`, 30 in `prerender.js`); **54** distinct `assert*` function names exist |
| task brief | "52 smoke page types" | **49** entries in `const ROUTES` (`scripts/smoke.mjs:57-180`) |
| W0 baseline §1 | 564 routes in the sitemap | **568** (`/compare` grew 120 → 124) |

---

## 2. Route universe — who owns what

`OBSERVED` — `site/sitemap.xml` (568 `<loc>`), `find site -name '*.html'` (**621** files), plus the
runtime route tables in `server.js`.

### 2.1 The three route classes

**(a) Prerendered + in the sitemap — 568.** Emitted by `build/prerender.js`, rebuilt client-side by
`site/app.js route()` on hydration, except for `KEEP_PRERENDERED = ['methodology','corrections','problem']`.

| surface | count | owner |
|---|---:|---|
| `/c/*` | 171 | `prerender.js` → `app.js` compound renderer (7 `.chapter` course) |
| `/compare/*` + `/compare` | 124 | `prerender.js` → `app.js renderComparison()` |
| `/target/*` | 103 | `prerender.js` → `app.js` |
| `/protocol/*` | 52 | `prerender.js` → `app.js` (18 `<details name="p-cause-acc">`) |
| `/problem/*` | 41 | `prerender.js` **KEEP_PRERENDERED** — the only surface a user reads as-emitted |
| `/muscle/*` 17 · `/goal/*` 16 · `/pathway/*` 16 · `/learn` +5 · `/physiology/*` 4 · `/energy/*` 3 · `/body` +1 | 63 | `prerender.js` → `app.js`; `/body*` also `site/bodymap.js` |
| singletons `/ /about /anatomy /az /browse /corrections /legend /methodology /pathways /plan /solve /stack /where` | 13 | `prerender.js` singletons |

**(b) Prerendered, NOT in the sitemap — 53.**
`OBSERVED` — 52 × `/fuel/<problem>/<root-cause>` plus `site/home.html` (a fragment, not a route).
All 52 `/fuel` pages return **HTTP 200 with `robots: noindex,follow`, a correct self-canonical, a
correct specific title and `BreadcrumbList|ListItem|WebPage` JSON-LD**, on both origins.
`PRODUCT DECISION`, not a defect — they are deliberately readable-but-unindexed. But state the cost:
52 fully authored pages carry no index signal and no sitemap membership.

**(c) SPA-only, no prerendered file — `server.js:2900-2905` `SPA_ONLY_ROUTES` (25 prefixes).**
```
about admin anatomy az body browse clinic exercise fork fuel legend me p pathways plan
pro progress pros s solve stack stewardship studio u where
```
`server.js:2944` `NOINDEX_ROUTES` covers **10** of them:
`admin me p pro progress pros s stewardship studio u`.
**`clinic`, `exercise` and `fork` are in `SPA_ONLY_ROUTES` and NOT in `NOINDEX_ROUTES`.**

`OBSERVED` (both origins, hydrated at 1280×900):

| route | status | robots | canonical | h1 | words |
|---|---:|---|---|---|---:|
| `/clinic` | 200 | `index,follow,…` | `https://rnawiki.com/` | *Turned away, priced out, or told it was nothing.* | 1,148 |
| `/exercise` | 200 | `index,follow,…` | **`https://rnawiki.com/exercise`** (self) | *Loading exercise…* | 2 |
| `/fork` | 200 | `index,follow,…` | **`https://rnawiki.com/fork`** (self) | *Loading variation…* | 2 |

`/exercise` and `/fork` are **self-canonical, index-eligible, permanently-2-word pages** — a soft 404
that invites indexing, present on **production and on this branch**. This is the exact defect class
`server.js:3069-3080` was written to close, and these three routes fall outside the list it uses.

### 2.2 Route-table drift is a live hazard, and the code says so

`OBSERVED` — `server.js:2896-2899`:
> *"Read off every `parts[0] === '…'` branch in app.js — keep it in step with that, or a working page
> starts answering 404. `progress` is the one the smoke test caught when this list was missing."*

There are **four hand-maintained lists that must agree**, with a gate over only one pair:
`SPA_ONLY_ROUTES` (server.js:2900) · `NOINDEX_ROUTES` (server.js:2944) · `PRIVATE_ROUTES` in
`site/app.js` · the `parts[0] === '…'` branches in `app.js route()`.
`assertPrivateRoutesAgree()` (referenced at `server.js:2941`) gates **server↔app noindex** only.
Nothing gates `SPA_ONLY_ROUTES` against `app.js route()`, and nothing gates
`SPA_ONLY_ROUTES ⊇ NOINDEX_ROUTES` for personal/thin routes — which is why `clinic`/`exercise`/`fork`
sit in the first list and not the second.

### 2.3 404 / 410 behaviour

`OBSERVED`, both origins:

| probe | local | prod | verdict |
|---|---|---|---|
| `/this-does-not-exist` | 404 + `noindex` | 404 + `noindex` | correct |
| `/c/not-a-compound` | 404 + `noindex` | 404 + `noindex` | correct |
| `/compare/creatine-monohydrate-vs-testosterone-trt` | **410** + the policy sentence | **410** | correct — a restricted pair |
| `/compare/creatine-monohydrate-vs-sodium-bicarbonate` | **404** + "not published" | 404 | correct — the derived-reason fix (`server.js:2972`) **is** live |
| `/me/x` | 404 | 404 | correct |
| `/u/` | **404** | **200 + index,follow** | branch fixes it; prod is broken |
| `/u/zzz-no-such-handle` | **200** | **200** | **soft 404 on BOTH** |

`/u/<unknown handle>` returning 200 is the one 404 defect this branch does **not** fix. On the branch
it is at least `noindex,nofollow`; on production it is an indexable duplicate of the home page at an
unbounded number of URLs.

---

## 3. Data flow

`OBSERVED` — `package.json` scripts, `build/*`, `data/*`, `content/*`.

```
content/*.md  (4 files: COMPENDIUM, FOUNDATIONS, PATHWAYS, TARGETS)
data/*.json   (32 sidecars: compound_learn, cause_learn, clinical_graph, learn_expand,
               target_learn, protocol_plan, keystones, claims, regulatory_class, …)
        │
        ├─ build/parse.js  ─────────────────────────────────► site/data.js (11.87 MB)
        │     22 self-invoking assert* gates; process.exit(1) HARD-FAILS the deploy
        │
        ├─ build/prerender.js ─────────────────────────────► 621 .html files + sitemap.xml
        │     30 self-invoking assert* gates (incl. assertLinkGraph)
        │     writes build/lastmod.json (568 entries, per-route content hash + date)
        │
        └─ build/precompress.js ──────────────────────────► *.br / *.gz siblings

runtime:  server.js (node:http)  ──► static files, then SPA shell, then 404/410
          site/app.js route()    ──► rebuilds the DOM client-side (except KEEP_PRERENDERED)
          db.js                  ──► Postgres DDL applied on boot (34 tables)
```

Supporting build modules with no gate role: `figures.js`, `glossify.js`, `landing.js` (the "/" copy),
`rank_citations.js`, `regulatory_class.js`, `resolve_citations.js`, `tracker_type.js`,
`verify_citations.js`, `verify_claims.js`, `widgets.js`.

### 3.1 Committed build artefacts — an inconsistency worth naming

`OBSERVED` — `.gitignore` ignores `site/c/ site/goal/ site/protocol/ site/target/ site/pathway/
site/learn/ site/compare/ site/muscle/ site/energy/ site/physiology/ site/body/ site/anatomy/ site/og/`
and `*.br`/`*.gz`.
It does **not** ignore `site/data.js` (11.87 MB), `site/app.js`, `site/exercises.js` (1.2 MB),
`site/foods.js`, `site/head.js`, `site/interactions.js`, `site/index.html`, `site/az.html`,
`site/browse.html`, `site/about.html`, `site/methodology.html`, `site/corrections.html`,
`site/legend.html`, `site/plan.html`, `site/pathways.html`, `site/compare.html`, **`site/problem/` (41)**
or **`site/fuel/` (52)`**.

`git ls-files` → **201 tracked files**, of which 93 are prerendered HTML under `site/problem/` and
`site/fuel/`, and the largest tracked blob is `site/data.js` at 11,874,630 B.
`INFERRED` — half the build output is ignored and half is committed, so any content change produces
an ~11.9 MB diff and a stale committed copy is possible at any moment. `CLAUDE.md` states "`site/` is
ephemeral"; the repository contradicts that for 93 HTML files and 7 generated JS bundles.

### 3.2 Database — 34 tables

`OBSERVED` — `db.js`, `CREATE TABLE IF NOT EXISTS`:
```
blood_markers · clinician_interest · comments · edits · experiment_checkins · experiments ·
explain_posts · feedback · fork_clones · helped_people · interest_signups · outcome_checkins ·
partners · proposal_actions · proposals · protocol_forks · protocol_requests · referrals ·
rep_events · rootcause_changes · rootcause_endorsements · scans · sessions · shared_plans ·
stewardships · studio_clones · studio_protocols · user_consent · user_foods · user_plans ·
user_profile · users · votes · wearable_daily
```

---

## 4. Feature flags & configuration

`OBSERVED` — `process.env.*` across `server.js`, `db.js`, `build/*`:

```
ADMIN_USER  ALLOW_PASSWORD_REGISTRATION  ANTHROPIC_API_KEY  DATABASE_URL  EMAIL_FROM
GOOGLE_CLIENT_ID  PGSSL  POM_WARN_ONLY  PORT  RESEND_API_KEY  SCAN_CAP  SCAN_MODEL
SESSION_SECRET  SITE_NAME  SITE_URL  SUPERADMIN_GOOGLE_SUB  SUPERADMIN_ID
```

`OBSERVED` — the flags that change **live behaviour** and their production state, read from
`GET https://rnawiki.com/api/config`:
```json
{"googleClientId":"513171146829-trs7uo8r1grpoh9e0aoqk02t9urlg23a.apps.googleusercontent.com","dbEnabled":true}
```
Local returns `{"googleClientId":null,"dbEnabled":false}`.

`POM_WARN_ONLY` is the one flag that can downgrade a hard gate to a warning; it should be checked by
whoever owns the safety wave.

---

## 5. Tests and gates

### 5.1 Build gates — 52, and they are the deploy gate

`OBSERVED` — `(function assertX() {…})()` count: **22 in `build/parse.js`, 30 in `build/prerender.js`**.
54 distinct `assert*` names exist across the two files. Full name list:

```
assertAccentInkOnAccent          assertAnalyticsVocabulary       assertAnchorAliases
assertAnonymousFirst             assertAvoidMovements            assertCanonicalOverrideParity
assertCauseMap                   assertClaims                    assertClaimTextIntact
assertCompareCluster             assertCompareDimensions         assertComparisonTitles
assertContrastTokens             assertCorpusCountCopy           assertDateModifiedIsLastmod
assertDoseCalculators            assertEveryCompoundDescribesItself
assertEveryPageDescribesItself   assertFuelTargetsReachable      assertGoalCoverage
assertGoalSummaryCounts          assertHandleFromConfig          assertHeadParity
assertHumanEvidenceStars         assertInteractionCoverage       assertLandingPage
assertLinkGraph                  assertLinkTextDistinct          assertMobileOnlyControls
assertNoBareDashCells            assertNoCredentialClaims        assertNoindexNeverCrossCanonicals
assertOneAccountType             assertOneH1PerPage              assertOneInteractionMatcher
assertPageviewIntegrity          assertPartNumbering             assertPhase1
assertProblemSpine               assertProfileDisclosesOnlyPublished
assertProtocolHeads              assertProtocolSafety            assertProtocolSpine
assertRatingIsTextCarried        assertReferencePagesDescribeWhatTheyList
assertRegulatoryAxes             assertRouteUniverse             assertServedFileTypes
assertSingleVoice                assertSiteConfig                assertSpaHashLinks
assertStructuredData             assertStudioSafetyMirrorsBuildGates
assertTargetCounts
```

### 5.2 Hydrated-DOM smoke test — 49 template classes, wired to nothing

`OBSERVED` — `scripts/smoke.mjs:57-180`, `const ROUTES`, **49** `[name, route]` pairs, one per
template class, including the three new ones: `studio → /studio`, `me → /me`,
`profile → /u/smoke-nobody`.

**`/p/<code>` is not among them** — `grep -ac "'/p/" scripts/smoke.mjs` → **0**.
`INFERRED` — the share URL that `POST /api/protocols` mints is the one new route with no hydrated-DOM
gate, and it is also the route that was answering 404 until 2026-08-10 (`server.js:2907-2913`).

### 5.3 Automation

`OBSERVED`:
- `.git/hooks/` contains **no non-sample hooks** (`ls -la .git/hooks | grep -v sample` → empty).
- `.github/workflows/` contains **one** file: `backup-community.yml` (Postgres → the *private* repo
  `Compoundingzero/rnawiki-backups`, cron `17 */6 * * *`).
- **There is no CI.** `npm run smoke` runs only when a human types it.
- The deploy gate is `prestart` (`parse.js && prerender.js && copy-assets && precompress`). Per repo
  `CLAUDE.md`, only `parse.js`'s `exit(1)` stops a deploy; `prerender.js` failures are swallowed by a
  `|| echo`. **`OBSERVED` — the current `package.json` `prestart` has no `|| echo`:**
  `node build/parse.js && node build/prerender.js && node scripts/anatomy/copy-assets.mjs && node build/precompress.js`.
  So `prerender.js` is now a hard gate too, and `CLAUDE.md`'s description of it is stale.

---

## 6. Deployment and dirty state

| item | value | source |
|---|---|---|
| Host | Railway, service **`RNAwiki`**; Cloudflare in front (`server: cloudflare`, `cf-ray … -SIN`) | `OBSERVED` response headers |
| Remote | `https://github.com/Compoundingzero/rnawiki.git` (public) | `git remote -v` |
| Branch | `refine/site-wide-2026-08` | `git branch --show-current` |
| Unpublished | **27 commits** ahead of `origin/main` | `git log --oneline origin/main..HEAD \| wc -l` |
| Working tree | **clean** | `git status --short` → empty |
| Production build age | `data.js` `last-modified: Sun, 09 Aug 2026 05:03:47 GMT` | `curl -I https://rnawiki.com/data.js` |
| Local build age | `data.js` `Last-Modified: Mon, 10 Aug 2026 05:39:30 GMT` | `curl -I localhost:8099/data.js` |
| DB backup | GitHub Action → **private** repo, every 6 h. **Postgres has no PITR.** | `.github/workflows/backup-community.yml` |

The 27 unpublished commits, newest first, are the Studio + profile + streak work:
`0652877 … 48f4d6f assertProfileDisclosesOnlyPublished … 07897db Keep the personal pages out of the
search index, in both documents … 68aa1bd Gate the streak … 276e721 The Protocol Studio … a75998c
studio-safety.js … ed04933 One interaction matcher`.

---

## 7. Live-site inventory — findings

Full per-route data: **`audit/v19/live_route_inventory.csv`** (641 rows × 22 columns, both origins).

### 7.1 Status divergence, local vs production

`OBSERVED` — 4 routes diverge, and every one of them is the branch being unpublished:

| route | local | prod |
|---|---|---|
| `/studio` | 200 | **404** |
| `/me` | 200 | **404** |
| `/p/abc123` | 200 | **404** |
| `/u/` | 404 | **200** |

`INFERRED` — the entire Protocol Studio is absent from production: `GET /api/protocols/check`
returns `404 {"error":"Not found"}` on rnawiki.com. Anything the v1.9 assessment says about the
Studio describes the branch, not the live site.

### 7.2 Indexing posture

`OBSERVED`, 633 (local) / 631 (prod) HTML 200s:

| check | local | prod |
|---|---|---|
| missing `<link rel=canonical>` | 0 | 0 |
| missing `<meta name=robots>` | 0 | 0 |
| missing JSON-LD | 0 | 0 |
| `<h1>` count ≠ 1 | 10 (all SPA-only) | 10 (all SPA-only) |
| empty meta description | 0 | 0 |
| description > 165 chars | 13 | 11 |
| title > 60 chars | 13 | 11 |
| canonical ≠ own URL | 14 | 12 |
| **ETag on the HTML document** | **633 / 633** | **0 / 631** |
| `Content-Encoding: br` | 633 | 631 |
| median origin latency | **14 ms** | 248 ms |

All 13 over-length titles and descriptions are the same string on the same SPA-only routes: the
homepage head (`"RNAwiki — translate the code of human performance into real results"`, 67 chars)
leaking onto `/admin /clinic /exercise /fork /me /p/… /pro /progress /pros /s /stewardship /studio
/u/felix` in the **prerendered** document. `hydrated`, those routes have correct heads
(`/studio` → *"Protocol Studio — build a protocol and have it checked · RNAwiki"*;
`/me` → *"Your page — what you follow and what you built · RNAwiki"*;
`/u/felix` → *"@felix · RNAwiki"*). So this is a prerender-side head defect on 13 routes, and it
matters only on the 3 that are not noindexed.

### 7.3 Conditional GET on HTML — fixed on the branch, still broken live

`OBSERVED`:
```
LOCAL  GET /c/creatine-monohydrate            → 200, ETag: "88b8-eBzrBaG_o2OutG8-W5mr"
LOCAL  + If-None-Match: <that etag>           → 304 Not Modified
PROD   GET /c/creatine-monohydrate            → 200, NO ETag, NO Last-Modified
PROD   + If-Modified-Since: 1 Jan 2040        → 200, full body
```
This closes W0 erratum **E13** for the branch and confirms it is **still open on production**.

### 7.4 Cloudflare overrides the origin's cache policy on JS/CSS

`OBSERVED`:
```
origin  (server.js:236-239)  Cache-Control: no-cache   for .js/.css/.json
prod    GET /data.js         cache-control: max-age=14400
                             cf-cache-status: REVALIDATED
                             etag: "b4c3fa-19fe4e7d887"
                             last-modified: Sun, 09 Aug 2026 05:03:47 GMT
```
`server.js:236-239` states the reason for `no-cache` in as many words: *"so the CDN cannot pin a
build"*. Cloudflare is returning `max-age=14400` to the browser anyway.
`INFERRED` — a returning reader can hold a **4-hour-stale `data.js`** with no revalidation. Since
`data.js` carries every dose, every interaction rule and every safety string, a content correction
does not reach a returning reader for up to four hours. This is a configuration fact about the
Cloudflare zone, not about this repository, and it cannot be fixed in code.

### 7.5 `lastmod` — the mechanism is correct; the current state is indistinguishable from a build stamp

`OBSERVED` — `site/sitemap.xml`: 568 `<loc>`, 568 `<lastmod>`, **1 distinct value: `2026-08-09`**.
Production's sitemap is byte-identical in this respect (568 locs, 1 distinct lastmod, same date).
`build/lastmod.json` holds 568 entries of shape `["<content-hash>", "<date>"]` with **567 distinct
hashes** — so the per-route change detection at `prerender.js:3189-3243` is real and working; every
page's output simply changed in the same build.

`INFERRED`, and it is the point: an external observer cannot tell this from a deployment timestamp,
and `prerender.js:3194` records that Google ignores `lastmod` on a site where every value is the same.
v1.9 §13.4 requires *"lastmod changes only for a material human/content/review/regulatory update,
never a deployment timestamp"* — the mechanism satisfies it; the current published state does not
demonstrate it. Re-measure after the next partial content change before calling this either way.

### 7.6 Structured data

`OBSERVED` — every 200 HTML route carries JSON-LD. Types by surface:
`/` → `BreadcrumbList|ListItem|WebSite|SearchAction|EntryPoint|Organization`;
`/fuel/*` and most content surfaces → `BreadcrumbList|ListItem|WebPage`.
`hydrated` `/u/felix` on **both** origins emits **`WebSite` only** — no `ProfilePage`, no `Person`.
v1.9 §13.3 requires `ProfilePage` with one `Person`/`Organization` `mainEntity` on a public profile.
Status: **absent**.

---

## 8. Owner decisions — verification of "what already exists"

Each item from the brief, checked, not assumed.

| claim | verdict | evidence |
|---|---|---|
| One account type (`assertOneAccountType`) | **EXISTS** | `build/parse.js:3417` `(function assertOneAccountType(){`; `server.js:243-250` records `DOMAIN_LAYER`/`DOMAIN_LABEL` removal |
| Protocol Studio back end (`studio_protocols` + `studio_clones`) | **EXISTS on the branch, ABSENT in production** | `db.js` both tables present; `GET https://rnawiki.com/api/protocols/check` → `404 {"error":"Not found"}` |
| `studio-safety.js` mirroring 5 build gates | **EXISTS** | `studio-safety.js` 337 lines; gated by `assertStudioSafetyMirrorsBuildGates()` at `build/parse.js:3516` |
| `POST /api/protocols/check` | **EXISTS on the branch** | `server.js:1105-1112` registered above the `!db.enabled` guard, deliberately |
| `/studio` phone UI | **EXISTS on the branch** | `hydrated` `/studio` → h1 *"Build a protocol"*, correct title/canonical/description |
| Forgery-resistant streak ledger | **EXISTS** | commits `68aa1bd`, `c499dfe`, `2ef2cd9`, `40683b7`, `2fd2c87` |
| `/me` and `/u/<handle>` noindexed | **EXISTS on the branch; NOT LIVE** | branch: `X-Robots-Tag: noindex, nofollow` + meta rewrite. Prod `/u/felix`: `index,follow`, no `X-Robots-Tag` |
| `explain_posts` threaded comments | **EXISTS (table)** | `db.js` `CREATE TABLE IF NOT EXISTS explain_posts` |
| 58 build checks | **PARTIAL — the number is 52** | see §5.1 |
| 52 smoke page types | **PARTIAL — the number is 49** | `scripts/smoke.mjs:57-180` |
| Collection-of-interest removed from the landing page | **CONFIRMED** | `curl localhost:8099/` → `/api/interest` absent, `name="topic"` absent, `"Count me in"` absent; regrowth is gated at `build/prerender.js:4487-4488` |
| `/api/interest` endpoint + `interest_signups` table still exist | **CONFIRMED — this is the removal scope** | `server.js:1045` `POST /api/interest`, `server.js:1093` `POST /api/interest/remove`, `db.js:342` `CREATE TABLE IF NOT EXISTS interest_signups` |

### 8.1 Two further removal-scope items the brief did not name

`OBSERVED` — **`clinician_interest`** (`db.js:301-314`) holds `name, email, discipline, country,
license_no, proof_photo`. `proof_photo` is a base64 photograph of a professional credential document.
The intake handler was closed on 2026-08-08 (`server.js:1991-2004`) and `/gp` was removed on
2026-07-30, but **the rows are deliberately retained and `GET /api/clinician-photo` still serves
them**. Access control is correct — `server.js:2007` `if (!isSuper(u)) { res.writeHead(403); }` — so
this is a **retention** question, not an access hole. `LEGAL-CLINICAL DEPENDENCY`: these are
government identity documents collected for a verification programme that no longer exists. The
code comment already says deletion "should follow telling the people on the list" and is Felix's
call. It belongs on the v1.9 removal list next to `interest_signups`.

`OBSERVED` — **`GET /api/stats` is live and unauthenticated on production**:
```
https://rnawiki.com/api/stats → {"experiments":20,"improved":1,"helped":19}
```
`improved / experiments` is an aggregate efficacy ratio. `AGENT_RULES` §"DO NOT IMPLEMENT" says
*"Do not ship any aggregate efficacy statistic … The gated feature stays dark."* The **display** was
removed (`site/app.js:5104-5106` records the removal, and `grep -ac "api\.stats("` over `app.js`
returns **0** call sites), so nothing renders it — but the endpoint publishes it, and
`site/app.js:848` still defines the client method. Dead client method + live public endpoint.

---

## 9. Comparison against the W0 baseline (2026-08-01)

`OBSERVED` where stated. W0 measured 564 routes on localhost only.

| W0 finding | status on this branch | status on production |
|---|---|---|
| Route universe = 564 | **568** (+4 `/compare`) | 568 |
| **D42 / §5.1** "3 API endpoints 503; whether production also 503s is not established" | still 503 locally (no Postgres, by design) | **RESOLVED — production does NOT 503.** `GET /api/me` → `200 {"user":null}`; `/api/rootcause-overlay` → `200 {"overlay":[]}`; `/api/stats` → `200`. W0's open question 1 is closed. |
| **D22** "11.66 MB uncompressed on the wire" | **fixed** — `Content-Encoding: br`, `data.js` 2,412,320 B encoded | **fixed** — `br`, 2,411,882 B |
| **E13 / D22** "no ETag, no Last-Modified, `If-Modified-Since: 2040` returns the full body" | **fixed for HTML and assets** (304 verified) | **still open for HTML** (0/631 have an ETag); assets do have validators |
| **§5.2** "production compression/caching not measurable from localhost" | — | **RESOLVED** — measured; see §7.4 for the Cloudflare override |
| `KEEP_PRERENDERED = ['methodology','corrections','problem']` | unchanged | unchanged |
| Sitemap `<lastmod>` all identical | **still 1 distinct value**, but now backed by 567 distinct per-route content hashes — mechanism added since W0 | same |

**No W0 finding is contradicted by this wave.** Two of its explicitly-unmeasurable open questions are
now answered.

---

## 10. Local instruction files

| path | role | staleness |
|---|---|---|
| `/Users/admin/CLAUDE.md` | Felix's global operating context | current |
| `rnawiki/CLAUDE.md` (9,491 B, 2026-07-30) | the project briefing | **stale in 3 places**: `app.js` line count, `server.js` line count, and the `prestart` `|| echo` description (see §5.3) |
| `rnawiki/README.md` (3,959 B, 2026-07-05) | not read this wave | `COULD-NOT-CHECK` |
| `rnawiki/.claude/settings.local.json` | permissions only | — |
| `/Users/admin/.claude/jobs/b8afc277/tmp/qa/AGENT_RULES.md` | binding agent rules | **stale line/byte counts** (see §1 errata); the measurement traps and the `#/route` anchor warning remain correct and load-bearing |
| `qa/out/W0_BASELINE.md` (643 lines) | authoritative baseline, 24 errata | authoritative; two open questions now closed |
| `rnawiki/docs/EVENT_SCHEMA.md` | analytics vocabulary, gated by `assertAnalyticsVocabulary()` | not audited this wave |

**Trap that bit this wave and will bit the next one:** `qa/probe.mjs` reports `anchorDead` by counting
`#/route` **hash-router** links as dead in-page anchors. On `/studio` it reports `anchorDead: 6` where
the true count is 0. This is the exact error class W0 recorded as erratum **E1** and **E22**.
**Do not quote `probe.mjs`'s `anchorDead` field in any v1.9 finding.**

---

## 11. What I did not check

- `node build/parse.js` / `npm run build` were not run — they write `site/data.js` and the prerendered
  HTML, which is out of scope for a read-only wave. **No claim here asserts that a build gate passes.**
- `npm run smoke` was not run (it needs `puppeteer-core`, which is not a declared dependency, and it
  drives 49 routes; it also writes under `qa/`). Its *coverage* is measured from source; its *result*
  is `COULD-NOT-CHECK`.
- Production write paths (`POST /api/protocols`, `POST /api/interest`, auth) were **deliberately not
  exercised** — every production probe in this wave is a `GET` or a `HEAD`.
- Whether a real user row exists behind `/u/felix` on production. Local has no Postgres, so
  `"No page at that name"` there is the DB-disabled branch, not a genuine 404 path.
- `README.md`, `docs/EVENT_SCHEMA.md`, `content/*.md`, the 3D asset pipeline under `scripts/anatomy/`.
- Real devices, Lighthouse, Core Web Vitals. All geometry claims here come from headless Chrome at
  1280×900.
