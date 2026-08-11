# RNAwiki v1.9 — SEO and content-discovery audit

**Wave A · read-only.** No product code was changed. Author role: SEO / content-discovery specialist.
**Date of measurement:** 2026-08-11. **Branch:** `refine/site-wide-2026-08`.
**Companion file:** `seo_metadata_schema_matrix.csv` (one row per page type, in this directory).

Evidence labels: **OBSERVED FACT** · **INFERENCE** · **PRODUCT DECISION** · **LEGAL-CLINICAL
DEPENDENCY** · **could-not-check**.

**Document discipline.** SEO is a claim about crawlers, so the primary evidence here is the
**prerendered** document (`curl`, and a direct read of the built files under `site/`). Where a claim
concerns what a *reader* sees, it is marked and comes from a **hydrated** measurement. The two are
different documents on this site (`KEEP_PRERENDERED = ['methodology','corrections','problem']`,
`app.js:6059`) and I have not mixed them.

---

## 0. Spec-reference correction — the brief points at a section that does not exist

**OBSERVED FACT.** My brief says "SEO against **§6.7**" and "build the matrix giving the EXACT
title/description template from **§6.7**". In the source-authoritative Markdown
(`RNAwiki_Unified_Desktop_Experience_v1_9_Spec.md`, 961 lines, verified by `grep -n "^#"`):

- **§6 is "Exercise wiki"**, containing only §6.1 Objective, §6.2 First viewport, §6.3 Page chapters.
  **There is no §6.7.**
- The SEO contract is **§13 "SEO and public discovery"** — §13.1 Exact metadata patterns,
  §13.2 Indexing/canonical/duplicates, §13.3 Structured data and UGC, §13.4 Sitemap/404/privacy.

A **§6.7 does** exist in the *earlier* `RNAwiki_Desktop_Visual_Flow_Builder_Focused_Spec.md` (v1.8),
where it is **"Checks before preview"** — a builder validation gate, unrelated to SEO.

**I have audited against §13**, per the rule that the Markdown is source-authoritative and a
discrepancy is followed *and recorded*. The traceability IDs are **V19-SEO-001 … V19-SEO-005**.

---

## 1. Executive summary

The existing 568-page corpus is, for its size, an unusually disciplined SEO estate. Self-canonical
568/568 where it should be, real HTTP 404s, a correct query-string `noindex,follow` control, a
correct `noindex` + no-sitemap pattern on the 52 `/fuel` utility pages, valid JSON-LD on every page,
and `og:image` on all of them. Several things I went looking to break did not break.

Four things are wrong, and one of them is a privacy-shaped default.

| # | Finding | Spec | Severity | Status |
|---|---|---|---|---|
| **D1** | **`/fork/<id>` — a user share permalink — defaults to `index,follow`.** `NOINDEX_ROUTES` is a blocklist that fails **open** | §13 preamble, §13.4 | **P0 (privacy default)** | existing defect |
| **D2** | Every non-prerendered SPA route serves an identical title + a hard `<link rel="canonical" href="https://rnawiki.com/">` | §13.2 | **P1** | existing defect |
| **D3** | All 568 sitemap `lastmod` values are one build date; `build/lastmod.json` holds 568 routes and exactly one date | §13.4 | **P1** | mechanism collapsed |
| **D4** | 320 outbound PubMed/PubChem citations carry `rel="nofollow"` — the site nofollows its own evidence | §13.3 (inverted) | **P2** | existing defect |
| **D5** | `/body` canonicalises to `/body/leg`, and both are in the sitemap with byte-identical title + description | §13.2, §13.4 | **P2** | existing defect |
| **D6** | Zero `rel="ugc"` / `sponsored` anywhere; no UGC link contract and no gate | §13.3 | **P2** | absent |
| **D7** | No `ProfilePage`, `QAPage` or `DiscussionForumPosting`; §13.3 has nothing to attach to | §13.3 | **P2** | absent |
| **D8** | Every §13.1 title/description template disagrees with what the site actually emits | §13.1 | **P2** | contradictory |
| **D9** | `/learn/<n>` descriptions are 63–97-char machine stubs (`Foundations: MODULE 5 — …`) | §13.1 spirit | **P3** | existing defect |
| **D10** | `/problem/pcos` title reads "Why **pcos** / hormonal weight happens" — raw slug label | quality | **P3** | existing defect |
| **D11** | `/u/<handle>` returns HTTP **200** for every handle — a soft 404 on the profile namespace | §13.4 | **P1** | existing defect |

---

## 2. D1 (P0) — the noindex list is a blocklist and it fails open

**OBSERVED FACT — prerendered document, `curl -D -`.**

```
route            X-Robots-Tag header        <meta name="robots"> in the bytes
/progress        noindex, nofollow          noindex,nofollow          ✓ protected
/s/abc           noindex, nofollow          noindex,nofollow          ✓ protected
/studio          noindex, nofollow          noindex,nofollow          ✓ protected
/me              noindex, nofollow          noindex,nofollow          ✓ protected
/u/x             noindex, nofollow          noindex,nofollow          ✓ protected
/fork/abc        (none)                     index,follow,max-image-preview:large   ✗ INDEXABLE
/exercise/squat  (none)                     index,follow,max-image-preview:large   ✗ INDEXABLE
```

**Root cause, exact.** `server.js:2943`:

```js
const NOINDEX_ROUTES = ['admin','me','p','pro','progress','pros','s','stewardship','studio','u'];
```

and `server.js:3035`:

```js
if (!NOINDEX_ROUTES.includes(seg[0])) return sendFile(res, path.join(DIR, 'index.html'));
```

Compare `server.js:2900-2904`, the *other* list, which **does** include both:

```js
const SPA_ONLY_ROUTES = [
  'about','admin','anatomy','az','body','browse','clinic','exercise','fork','fuel',
  'legend','me','p','pathways','plan','pro','progress','pros','s','solve','stack',
  'stewardship','studio','u','where',
];
```

`fork` and `exercise` are in the "serve a 200" list and absent from the "protect it" list.

**Why `/fork/` is the P0 and `/exercise/` is not.** `/fork/<id>` is a **share permalink for a user's
forked plan** — `server.js:1937` awards points on `'fork:' + r.rows[0].id`, and `server.js:1972`
lists forks alongside a user's own records. It is the sibling of `/s/<id>` (shared plan), which *is*
protected. **Two share-permalink namespaces, one protected and one not**, and the unprotected one
is the one that ties a share to an account.

**Honest scoping of the actual exposure.** I am *not* claiming a live data leak, and here is why:

1. `/fork/abc` serves the empty SPA shell — `<main id="app"><!-- rendered by app.js --></main>`.
   The fork's content is hydrated client-side, so a crawler that does not execute JS sees nothing.
2. The shell carries `<link rel="canonical" href="https://rnawiki.com/">`, which tells Google to
   consolidate the URL onto the homepage rather than index it.

So the realistic outcome is a URL discovered and dropped, not content published. **But** Googlebot
*does* render JavaScript, and a rendered `/fork/<id>` is exactly the "another participant's plan"
that §9.2 puts on the never-public list, and §13's preamble puts outside SEO entirely. The defect is
that **protection here is opt-in**, so the correct outcome depends on someone remembering to edit a
list. That is the failure mode this codebase has already diagnosed and solved *elsewhere*:

> `site/app.js:4021` — *"**ALLOWLIST, not blocklist.** … A route template added tomorrow and
> forgotten here fails **CLOSED** to `/t/other`; it can never leak a health-encoding URL by
> omission."*

The analytics module gets the polarity right. The routing noindex list gets it backwards.

**Repair shape (spec only).** Invert it: a small `INDEXABLE_SPA_ROUTES` allowlist, everything else
`noindex,nofollow`. Then gate it — assert in the build that
`SPA_ONLY_ROUTES \ INDEXABLE_SPA_ROUTES ⊆ NOINDEX_ROUTES`, i.e. every SPA-shell route is either
explicitly declared indexable or protected. **Prove the gate by adding a route to `SPA_ONLY_ROUTES`
and nothing else** — it must fail the build.

**PRODUCT DECISION for Felix.** `/exercise/<slug>` is genuinely public wiki content (§6 of v1.9 makes
Exercise a first-class indexable wiki type). It should be *prerendered and indexable*, not
noindexed — but it is neither today. It is an indexable URL with no content, which is the worst of
both. Decide: prerender `/exercise/*` as a real wiki page type, or noindex it until it is one.

---

## 3. D2 (P1) — one title and one homepage canonical across every SPA route

**OBSERVED FACT — prerendered document.** Seven different routes, one `<title>`:

```
/exercise/squat  /fork/abc  /progress  /s/abc  /u/x  /studio  /me
  -> <title>RNAwiki — translate the code of human performance into real results</title>
  -> <meta name="description" content="DNA is the blueprint; RNA is the builder. RNAwiki
     translates the foundational code of strength, wellness and longevity into actionable
     protocols — 171 compounds and full Move·Fuel·Stack protocols, ranked by human evidence.
     Free, worldwide, no paywall.">          (250 characters)
  -> <link rel="canonical" href="https://rnawiki.com/">
```

Three separate problems in one file, `site/index.html`:

**(a) The canonical is a hard pointer to `/` on every SPA route.** §13.2: *"Canonicals are absolute,
**self-consistent**, and stripped of state/query tracking."* `https://rnawiki.com/exercise/squat`
declaring `https://rnawiki.com/` as its canonical is not self-consistent; it is an instruction to
discard the URL. For the five noindexed routes this is harmless. For `/exercise/*` and `/fork/*`
(D1) it means those URLs can never be indexed on their own merits even after they get content.
This will bite the moment v1.9's Exercise and Stretch wiki types ship, because they will inherit it.

**(b) The description is 250 characters** where `seoDesc()` (`build/prerender.js:750`) caps every
generated page at **155** — and does so carefully, against the *escaped* length. The one file the
build does not generate is the one that breaks the rule.

**(c) The shell title is a different product from the served homepage.**

```
site/index.html  <title>  RNAwiki — translate the code of human performance into real results
served /         <title>  RNAwiki — Stop guessing, start solving. Root-cause protocols
```

`site/index.html:33` already carries a long comment about exactly this class of bug — two headers,
one site — and the build gained `assertCorpusCountCopy()` to stop the *"171"* drifting between the
generated pages and this hand-written file. **The same drift exists in the title, description and
canonical of the same file and nothing gates it.** That is the finding: a proven defect class was
fixed for one field and left open for three.

---

## 4. D3 (P1) — the per-page `lastmod` mechanism exists and currently emits one date for everything

**OBSERVED FACT — the built sitemap.**

```
$ grep -c "<url>" site/sitemap.xml
568
$ grep -o "<lastmod>[^<]*" site/sitemap.xml | sort | uniq -c
 568 <lastmod>2026-08-09
```

**OBSERVED FACT — the source of truth behind it.**

```
$ node -e 'const m=require("./build/lastmod.json"); … count by date'
{ "2026-08-09": 568 }   routes: 568
```

**OBSERVED FACT — the JSON-LD agrees, which is the good part.**

```
$ grep -rho '"dateModified":"[^"]*"' site/ | sort | uniq -c
 403 "dateModified":"2026-08-09"
```

403 pages, one value, and it is the *same* value as their `<lastmod>`. The W6 work
(`build/prerender.js:586-598, 3251-3287`) that unified these two fields **is working**: they no
longer disagree, and `assertNoLastmodOrphan` refuses to build if a non-sitemap route emits a
`dateModified`.

**So what is wrong.** §13.4 is explicit: *"Sitemap `lastmod` changes only for a material
human/content/review/regulatory update, **never a deployment timestamp**."* Today every one of 568
routes asserts it was materially updated on 2026-08-09. Google's documented behaviour is to **ignore
`lastmod` entirely** on a site where the value is uniformly the crawl-or-build date — which is
precisely what `build/prerender.js:3194` says the fix was for.

**INFERENCE — why it collapsed, and it is not a code bug.** `lastmodFor(route)` (`prerender.js:3234`)
keeps a route's previous date when the *content hash of its finished HTML* is unchanged, reading the
prior state from `build/lastmod.json`. That file is committed. The 2026-08-09 build changed the
emitted HTML of **every** page — a shared shell, footer, header or class change is enough — so every
hash moved and every date re-stamped legitimately. The mechanism did what it was told.

**The real finding is therefore a design fragility, not a broken function:** the hash is taken over
the *whole* finished document, so any site-wide chrome edit re-dates all 568 pages and destroys the
signal the mechanism exists to protect. `lmHash()` already normalises `"dateModified"` out of the
hash (`prerender.js:3220`) — the same treatment needs extending to the shell: hash the **article
body**, not the shell. Until then, expect a full re-stamp on roughly every build that touches
`shell()`, `styles.css` class names, or the footer.

**Recommendation.** Hash only the page's own content region; add a build assertion that refuses to
publish when **>50 % of routes change `lastmod` in a single build** unless an explicit
`ALLOW_MASS_LASTMOD=1` is set. Prove it by re-running the 2026-08-09 build.

---

## 5. D4 (P2) — the site `nofollow`s its own citations

**OBSERVED FACT — prerendered corpus scan (all 171 `/c/` pages):**

```
external links on /c/ pages          320
carrying rel="nofollow"              320    (100 %)
carrying rel="ugc"                     0
```

Source, `build/prerender.js` `mdLinks()`:

```js
out += `<a href="${esc(m[2])}" target="_blank" rel="nofollow noopener">${esc(m[1])}</a>`;
```

Those 320 links are PubMed, PMC, NCBI, PubChem and FDA — the molecular-target citations that the
same function's own comment calls *"the E-E-A-T signal"*.

**Why this is backwards.** §13.3 requires `rel="ugc nofollow"` on **user/creator** external links,
because those are unvetted. A first-party editorial citation to PubMed is the opposite: it is the
strongest trust signal a health site can emit, and `nofollow` explicitly tells search engines *"I do
not vouch for this destination."* For a site whose entire differentiator is "every claim is bound to
human evidence", nofollowing every citation understates exactly the thing it wants credit for.

`noopener` is correct and must stay. The fix is to drop `nofollow` from **first-party editorial
citations only**, keep it (plus `ugc`) for anything a user or creator supplies, and gate the
distinction so it cannot drift once UGC ships.

**PRODUCT DECISION.** There is a defensible conservative argument for the status quo (a blanket
nofollow can never be an accidental endorsement). I am flagging the trade-off, not overriding it.

---

## 6. D5 (P2) — `/body` and `/body/leg` are the same page, twice, in the sitemap

**OBSERVED FACT — prerendered.**

```
route       title                                                        canonical
/body       Interactive 3D body: the muscles and how they move · RNAwiki  https://rnawiki.com/body/leg
/body/leg   Interactive 3D body: the muscles and how they move · RNAwiki  https://rnawiki.com/body/leg
```

Titles identical. Descriptions identical (both the same 143-char string). **Both are in
`sitemap.xml`.** `/body` is the only page in the corpus that is not self-canonical (self-canonical:
567/568).

`build/prerender.js:2297-2307` documents this as a deliberate 2026-08-06 change — the `noindex` was
removed on purpose, on the correct reasoning that Google's duplicate guidance is not to combine
`noindex` with a cross-canonical. That reasoning is right. What was left behind is the third signal:
**a URL that has been canonicalised away is still being submitted in the sitemap.** §13.4:
*"Sitemap membership follows the same index-eligibility gate."* A canonicalised-away URL is not
index-eligible.

Fix: drop `/body` from the sitemap and keep the cross-canonical. One line, no risk to the 3D page.

---

## 7. D6, D7, D8 — the v1.9 contracts that have nothing to attach to

### D6 · UGC link rel

**OBSERVED FACT.** `rel="ugc"` across the entire built corpus: **0**. `rel="sponsored"`: **0**.

Correct *today*, because nothing user-authored is published. But the UGC is queued: `explain_posts`
threaded comments exist in `db.js`, `studio_protocols` + `studio_clones` exist, and v1.9 §4 makes
Discussion a first-class surface. §13.3 requires `rel="ugc nofollow"` on every user/creator external
link, `sponsored` where paid, and explicitly requires that **internal contextual links do NOT get
`ugc`** — a distinction that is trivial to get wrong once one helper renders both.

**Recommendation.** Build the distinction into a single link renderer *before* the first UGC ships,
and gate it: any anchor emitted from a user-authored field without `ugc nofollow` fails the build.
A gate written after the first UGC page ships will pass over an empty set on the day it lands.

### D7 · Structured data types

**OBSERVED FACT — measured JSON-LD types across all 568 built pages:**

| type | pages |
|---|---|
| `BreadcrumbList` + `ListItem` | 568 |
| `MedicalWebPage` | 403 |
| `WebPage` | 165 |
| `FAQPage` + `Question` + `Answer` | 281 (158 `/c` + 123 `/compare`) |
| `Drug` (as `about`) | 171 |
| `MedicalCondition` | 93 |
| `HowTo` + `HowToStep` | 52 |
| `WebSite` / `Organization` / `SearchAction` | 1 (home) |
| **`ProfilePage`** | **0** |
| **`QAPage` / `DiscussionForumPosting`** | **0** |
| **`Person` / `Organization` as `mainEntity`** | **0** |

Every page emitting JSON-LD carries `@context` (build-gated). No parse errors across 568 files.

**On the `Drug` entity — a deliberate, correct restraint worth recording.** I checked whether the
`Drug` markup on prescription-only medicines carries dose or prescription-status fields, because
that would be the shape of a Medicines Act 1975 s.51 exposure. It does not:

```json
{ "@type": "Drug", "name": "Semaglutide (Ozempic / Wegovy / Rybelsus)" }
{ "@type": "Drug", "name": "Testosterone (TRT)" }
{ "@type": "Drug", "name": "Oxandrolone (Anavar)" }
```

Name only. No `activeIngredient`, no `dosageForm`, no `doseSchedule`, no `prescriptionStatus`, no
`availableStrength`. **No dose or availability claim about a prescription-only medicine reaches
structured data.** That is the right call and it should be gated so an "enrich the schema" pass
cannot quietly reverse it. **LEGAL-CLINICAL DEPENDENCY:** whether a bare `Drug` entity on a
POM page is itself acceptable in a Singapore context is a question for a named legal reviewer, not
for me.

### D8 · The §13.1 templates and the shipped templates are different products

Full side-by-side is in `seo_metadata_schema_matrix.csv`. The headline mismatches:

| type | §13.1 requires | site emits |
|---|---|---|
| Supplement/drug | `{Exact formulation}: Evidence, safety and mechanism \| RNAwiki` | `{Name}: dosage, evidence & uses · RNAwiki` |
| Protocol | `{Protocol title} by @{handle} — Steps, time and safety \| RNAwiki` | `{Problem}: {cause} · RNAwiki` — **no creator attribution at all** |
| Profile | `@{handle}'s Core Protocol \| RNAwiki` | not implemented |
| Exercise | `{Exercise name}: How to do it, form and versions \| RNAwiki` | not implemented |
| Stretch | `{Stretch name}: Position, hold and range \| RNAwiki` | not implemented |

Two structural notes, not cosmetic:

1. **Separator.** §13.1 uses ` | RNAwiki`; the site uses ` · RNAwiki` on all 568 pages
   (`SUFFIX` in `build/prerender.js`). One character, 568 pages, and `seoTitle()` budgets against
   the **escaped** length at 60 chars — so a swap changes the trim point on titles already at the
   ceiling. `/c/` titles currently run 18–60 chars with several sitting exactly at 60.
   **PRODUCT DECISION:** adopt `|` or keep `·`. Do not let an implementation agent decide silently.

2. **"Exact formulation" is a real content requirement, not a string.** §13.1 says
   `{Exact formulation}`, and V19-CMP-002 forbids cross-formulation evidence inheritance. The site's
   compound titles use a display name (`Creatine Monohydrate`, `Semaglutide (Ozempic / Wegovy /
   Rybelsus)`). The first *is* an exact formulation; the second is a molecule plus three brand names
   and is not. Satisfying §13.1 here is a **data** change (a formulation field per compound), not a
   template change, and it is larger than it looks.

3. **"If duration is ongoing, use natural *ongoing* copy rather than inventing a day count"** and
   *"missing data does not produce filler or an inaccurate claim"* — both map onto machinery the site
   already has (`seoTitle`/`seoDesc` trim rather than pad; `tidyTail()` at `prerender.js:625-650`
   exists specifically because 49 titles once ended on a dangling `&`, `·` or unmatched bracket).
   The habit is right. Extend it, do not rebuild it.

---

## 8. D11 (P1) — the profile namespace is a soft 404

**OBSERVED FACT.**

```
$ curl -s http://localhost:8099/u/nobody-xyz-9999 | wc -c   ->  5313
$ curl -s http://localhost:8099/u/felix            | wc -c   ->  5313
$ curl -s http://localhost:8099/u/a                | wc -c   ->  5313
$ curl -sD - http://localhost:8099/u/nobody-xyz | grep HTTP  ->  HTTP/1.1 200 OK
```

§13.4: *"Unknown profile/protocol/wiki routes return a real HTTP 404 with useful recovery;
withdrawn/thin content is not disguised as HTTP 200 or a soft 404."* Every unknown handle returns
HTTP 200.

**Two things follow, and they point opposite ways.**

- **Against:** it is a §13.4 violation, and V19-SEO-005 lists "real 404 / no soft-404" as its
  acceptance criterion. Search Console will report these as soft 404s once profiles are public.
- **In favour, and this is worth keeping:** the response is **byte-identical for existing and
  non-existing handles** (5313 = 5313 = 5313). There is **no handle-enumeration oracle** at the HTTP
  layer. That is a real privacy property and any 404 fix must preserve it — a naive
  "404 if the handle does not exist" turns the profile namespace into a user-enumeration API.

**Recommendation.** Resolve the handle server-side and return a real 404 **only** for a handle that
is neither taken nor reserved, with a constant-shape body and no timing difference; or return 404 for
*all* `/u/*` until profiles ship. **PRODUCT DECISION + LEGAL-CLINICAL DEPENDENCY** — §13.2's
index gate ("valid ownership, current reviewed Coaching Core Protocol, complete trust/disclosure
metadata, no abuse/suspension") means the 404/200/noindex decision is a *five-way* state machine, not
a boolean, and §14 puts "publishing or indexing existing profiles" behind a named human gate.

---

## 9. What I tried to break and could not

Recorded per the house rule.

**(1) Query-string handling is correct, and it is the strongest control on the site.**

```
$ curl -sD - "http://localhost:8099/c/creatine-monohydrate?utm_source=x&fbclid=y"
HTTP/1.1 200 OK
X-Robots-Tag: noindex, follow
$ ... | grep canonical
<link rel="canonical" href="https://rnawiki.com/c/creatine-monohydrate">
$ curl -sD - "http://localhost:8099/solve?q=erectile+dysfunction"
HTTP/1.1 200 OK
X-Robots-Tag: noindex, follow
```

`server.js:72` — `if (_qs >= 0) res.setHeader('X-Robots-Tag', 'noindex, follow')`. Every
parameterised URL is noindexed, canonical is stripped of params, and — critically for §13.4's
privacy clause — **`/solve?q=<the reader's typed symptom>` can never enter the index**, even though
the site's own hero form generates that URL. §13.2 satisfied. **PASS.**

**(2) Real HTTP 404s, not soft ones, on the content namespaces.**

```
/c/not-a-compound      -> HTTP/1.1 404 Not Found
/nope-does-not-exist   -> HTTP/1.1 404 Not Found  + X-Robots-Tag: noindex
```

Minor inconsistency: the `/c/` 404 does **not** carry `X-Robots-Tag: noindex` while the generic one
does. Cosmetic — a 404 is not indexed regardless.

**(3) The `/fuel` pattern is the reference implementation and it holds.** 52 pages,
`robots="noindex,follow"`, self-canonical 52/52, **0 of 52 in the sitemap**. That is exactly what
§13.2 prescribes for a thin/duplicate utility view, done correctly, and it is the template the
Profile index gate should copy.

**(4) `/me`, `/studio`, `/progress`, `/s/*`, `/u/*` are noindexed in *both* documents.** Header and
meta tag agree; `server.js:3036-3051` deliberately sets both and documents why
(*"a document that says index in its head and noindex in its headers is one document saying two
things"*). I checked the sitemap for `/me` with an exact-match grep — the single hit is
`/methodology`, a prefix collision, not a leak. **`/me` is not in the sitemap.**

**(5) `robots.txt` does not `Disallow` any noindexed route.** Body is three lines: `User-agent: *`,
`Allow: /`, `Sitemap: …`. `server.js:61` documents the reasoning correctly — a disallowed URL is
never fetched, so its `noindex` is never read, and Google can still index a disallowed URL title-only
from a link. This is a subtle trap and the codebase has already avoided it.

**(6) `sitemap.xml` MIME type is correct** — `application/xml; charset=utf-8`, per §13.4.

**(7) No thin or missing metadata.** Across all 568 built pages: **0** with an empty
`<meta name="description">`, **0** with a missing `og:image`, **0** JSON-LD parse errors, **0**
duplicate `<title>` strings *within* a page type. Description lengths run 63–155 and title lengths
18–60, i.e. the escaped-length budgets in `seoTitle`/`seoDesc` are being enforced.

---

## 10. What Wave A cannot decide

- **PRODUCT DECISION** — `·` vs `|` as the title separator across 568 pages (§7, note 1).
- **PRODUCT DECISION** — prerender `/exercise/*` as an indexable wiki type, or noindex it (§2).
- **PRODUCT DECISION** — drop `nofollow` from first-party citations (§5).
- **LEGAL-CLINICAL DEPENDENCY** — the bare `Drug` entity on prescription-only pages (§7, D7).
- **LEGAL-CLINICAL DEPENDENCY + §14 human gate** — the Profile index-eligibility state machine (§8).
  §14 is explicit that prototypes *"do not authorize … publishing or indexing existing profiles"*.
- **could-not-check** — live `rnawiki.com` behaviour, Search Console coverage, and whether Google has
  already indexed any `/fork/<id>`. I was instructed not to use WebFetch/WebSearch, and everything
  above is local. **A Search Console `site:rnawiki.com/fork` check is the first thing to run** and it
  is a two-minute job for Felix.
